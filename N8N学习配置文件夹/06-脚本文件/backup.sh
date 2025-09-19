#!/bin/bash

# N8N 自动化平台备份脚本
# 支持应用备份、数据库备份、配置备份等

set -euo pipefail

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_TYPE="${1:-full}"
ENVIRONMENT="${2:-production}"

# 备份配置
BACKUP_DIR="$PROJECT_ROOT/backups"
RETENTION_DAYS=30
MAX_BACKUP_SIZE="10G"
COMPRESSION_LEVEL=6

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

# 发送通知
send_notification() {
    local message="$1"
    local status="${2:-info}"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # 记录备份日志
    echo "[$timestamp] $message" >> "$PROJECT_ROOT/logs/backup.log"
    
    # 发送Slack通知
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local color="good"
        case "$status" in
            "error") color="danger" ;;
            "warning") color="warning" ;;
        esac
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"N8N备份通知\",
                    \"text\": \"$message\",
                    \"fields\": [
                        {\"title\": \"环境\", \"value\": \"$ENVIRONMENT\", \"short\": true},
                        {\"title\": \"时间\", \"value\": \"$timestamp\", \"short\": true},
                        {\"title\": \"类型\", \"value\": \"$BACKUP_TYPE\", \"short\": true}
                    ]
                }]
            }" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
}

# 检查备份前置条件
check_backup_prerequisites() {
    log_info "检查备份前置条件..."
    
    # 创建备份目录
    mkdir -p "$BACKUP_DIR"
    
    # 检查磁盘空间
    local available_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    local required_space=5242880  # 5GB in KB
    
    if [[ $available_space -lt $required_space ]]; then
        log_warning "磁盘空间不足，可用空间: ${available_space}KB，建议至少: ${required_space}KB"
    fi
    
    # 检查Docker环境
    if ! docker --version > /dev/null 2>&1; then
        log_error "Docker未安装或不可用"
        exit 1
    fi
    
    if ! docker-compose --version > /dev/null 2>&1; then
        log_error "Docker Compose未安装或不可用"
        exit 1
    fi
    
    # 检查服务状态
    if ! docker-compose ps | grep -q "Up"; then
        log_warning "部分服务未运行，备份可能不完整"
    fi
    
    log_success "备份前置条件检查完成"
}

# 应用备份
backup_application() {
    log_info "开始应用备份..."
    
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_file="$BACKUP_DIR/app-backup-$timestamp.tar.gz"
    
    # 创建应用备份
    log_info "打包应用文件..."
    tar --exclude='node_modules' \
        --exclude='.git' \
        --exclude='logs' \
        --exclude='backups' \
        --exclude='*.log' \
        -czf "$backup_file" \
        -C "$PROJECT_ROOT" \
        . 2>/dev/null || {
        log_error "应用备份失败"
        return 1
    }
    
    # 验证备份文件
    if [[ -f "$backup_file" ]] && [[ -s "$backup_file" ]]; then
        local file_size=$(du -h "$backup_file" | cut -f1)
        log_success "应用备份完成: $backup_file ($file_size)"
        echo "$backup_file"
        return 0
    else
        log_error "应用备份文件创建失败"
        return 1
    fi
}

# 数据库备份
backup_database() {
    log_info "开始数据库备份..."
    
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_file="$BACKUP_DIR/db-backup-$timestamp.sql"
    
    # 检查数据库连接
    if ! docker-compose exec -T postgres pg_isready -U "${POSTGRES_USER:-n8n}" > /dev/null 2>&1; then
        log_error "数据库连接失败"
        return 1
    fi
    
    # 创建数据库备份
    log_info "导出数据库..."
    docker-compose exec -T postgres pg_dump \
        -U "${POSTGRES_USER:-n8n}" \
        -h localhost \
        --verbose \
        --clean \
        --no-owner \
        --no-privileges \
        "${POSTGRES_DB:-n8n}" > "$backup_file" 2>/dev/null || {
        log_error "数据库备份失败"
        return 1
    }
    
    # 压缩备份文件
    if [[ -f "$backup_file" ]] && [[ -s "$backup_file" ]]; then
        gzip "$backup_file"
        backup_file="${backup_file}.gz"
        
        local file_size=$(du -h "$backup_file" | cut -f1)
        log_success "数据库备份完成: $backup_file ($file_size)"
        echo "$backup_file"
        return 0
    else
        log_error "数据库备份文件创建失败"
        return 1
    fi
}

# Redis备份
backup_redis() {
    log_info "开始Redis备份..."
    
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_file="$BACKUP_DIR/redis-backup-$timestamp.rdb"
    
    # 检查Redis连接
    if ! docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log_error "Redis连接失败"
        return 1
    fi
    
    # 创建Redis备份
    log_info "保存Redis数据..."
    docker-compose exec -T redis redis-cli BGSAVE > /dev/null
    
    # 等待备份完成
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose exec -T redis redis-cli LASTSAVE | grep -q "$(docker-compose exec -T redis redis-cli LASTSAVE)"; then
            break
        fi
        sleep 2
        ((attempt++))
    done
    
    # 复制备份文件
    docker-compose exec -T redis cat /data/dump.rdb > "$backup_file" 2>/dev/null || {
        log_error "Redis备份失败"
        return 1
    }
    
    # 压缩备份文件
    if [[ -f "$backup_file" ]] && [[ -s "$backup_file" ]]; then
        gzip "$backup_file"
        backup_file="${backup_file}.gz"
        
        local file_size=$(du -h "$backup_file" | cut -f1)
        log_success "Redis备份完成: $backup_file ($file_size)"
        echo "$backup_file"
        return 0
    else
        log_error "Redis备份文件创建失败"
        return 1
    fi
}

# 配置备份
backup_configuration() {
    log_info "开始配置备份..."
    
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_file="$BACKUP_DIR/config-backup-$timestamp.tar.gz"
    
    # 创建配置备份
    log_info "打包配置文件..."
    tar -czf "$backup_file" \
        -C "$PROJECT_ROOT" \
        .env \
        docker-compose.yml \
        nginx/ \
        scripts/ \
        .github/ 2>/dev/null || {
        log_error "配置备份失败"
        return 1
    }
    
    # 验证备份文件
    if [[ -f "$backup_file" ]] && [[ -s "$backup_file" ]]; then
        local file_size=$(du -h "$backup_file" | cut -f1)
        log_success "配置备份完成: $backup_file ($file_size)"
        echo "$backup_file"
        return 0
    else
        log_error "配置备份文件创建失败"
        return 1
    fi
}

# 日志备份
backup_logs() {
    log_info "开始日志备份..."
    
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_file="$BACKUP_DIR/logs-backup-$timestamp.tar.gz"
    
    # 检查日志目录
    if [[ ! -d "$PROJECT_ROOT/logs" ]]; then
        log_warning "日志目录不存在，跳过日志备份"
        return 0
    fi
    
    # 创建日志备份
    log_info "打包日志文件..."
    tar -czf "$backup_file" \
        -C "$PROJECT_ROOT" \
        logs/ 2>/dev/null || {
        log_warning "日志备份失败，但不影响整体备份"
        return 0
    }
    
    # 验证备份文件
    if [[ -f "$backup_file" ]] && [[ -s "$backup_file" ]]; then
        local file_size=$(du -h "$backup_file" | cut -f1)
        log_success "日志备份完成: $backup_file ($file_size)"
        echo "$backup_file"
        return 0
    else
        log_warning "日志备份文件创建失败"
        return 0
    fi
}

# 完整系统备份
backup_full_system() {
    log_info "开始完整系统备份..."
    
    local backup_files=()
    local failed_backups=()
    
    # 执行各项备份
    local app_backup
    if app_backup=$(backup_application); then
        backup_files+=("$app_backup")
    else
        failed_backups+=("应用")
    fi
    
    local db_backup
    if db_backup=$(backup_database); then
        backup_files+=("$db_backup")
    else
        failed_backups+=("数据库")
    fi
    
    local redis_backup
    if redis_backup=$(backup_redis); then
        backup_files+=("$redis_backup")
    else
        failed_backups+=("Redis")
    fi
    
    local config_backup
    if config_backup=$(backup_configuration); then
        backup_files+=("$config_backup")
    else
        failed_backups+=("配置")
    fi
    
    local logs_backup
    if logs_backup=$(backup_logs); then
        [[ -n "$logs_backup" ]] && backup_files+=("$logs_backup")
    fi
    
    # 创建备份清单
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local manifest_file="$BACKUP_DIR/backup-manifest-$timestamp.txt"
    
    {
        echo "N8N 自动化平台备份清单"
        echo "备份时间: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "备份类型: 完整系统备份"
        echo "环境: $ENVIRONMENT"
        echo ""
        echo "备份文件:"
        for file in "${backup_files[@]}"; do
            local size=$(du -h "$file" | cut -f1)
            echo "  - $(basename "$file") ($size)"
        done
        
        if [[ ${#failed_backups[@]} -gt 0 ]]; then
            echo ""
            echo "失败的备份:"
            for failed in "${failed_backups[@]}"; do
                echo "  - $failed"
            done
        fi
        
        echo ""
        echo "备份验证:"
        for file in "${backup_files[@]}"; do
            if [[ -f "$file" ]]; then
                echo "  - $(basename "$file"): 成功"
            else
                echo "  - $(basename "$file"): 失败"
            fi
        done
    } > "$manifest_file"
    
    # 报告备份结果
    if [[ ${#failed_backups[@]} -eq 0 ]]; then
        log_success "完整系统备份成功完成，共 ${#backup_files[@]} 个文件"
        send_notification "完整系统备份成功完成，共 ${#backup_files[@]} 个文件" "success"
    else
        log_warning "系统备份完成，但有 ${#failed_backups[@]} 项失败: ${failed_backups[*]}"
        send_notification "系统备份完成，但有 ${#failed_backups[@]} 项失败: ${failed_backups[*]}" "warning"
    fi
    
    echo "$manifest_file"
}

# 清理旧备份
cleanup_old_backups() {
    log_info "清理旧备份文件..."
    
    local deleted_count=0
    
    # 按类型清理旧备份
    for pattern in "app-backup-*.tar.gz" "db-backup-*.sql.gz" "redis-backup-*.rdb.gz" "config-backup-*.tar.gz" "logs-backup-*.tar.gz"; do
        while IFS= read -r -d '' file; do
            if [[ $(find "$file" -mtime +$RETENTION_DAYS -print) ]]; then
                rm -f "$file"
                ((deleted_count++))
                log_info "删除旧备份: $(basename "$file")"
            fi
        done < <(find "$BACKUP_DIR" -name "$pattern" -type f -print0 2>/dev/null)
    done
    
    # 清理旧的备份清单
    while IFS= read -r -d '' file; do
        if [[ $(find "$file" -mtime +$RETENTION_DAYS -print) ]]; then
            rm -f "$file"
            ((deleted_count++))
            log_info "删除旧清单: $(basename "$file")"
        fi
    done < <(find "$BACKUP_DIR" -name "backup-manifest-*.txt" -type f -print0 2>/dev/null)
    
    if [[ $deleted_count -gt 0 ]]; then
        log_success "清理完成，删除了 $deleted_count 个旧备份文件"
    else
        log_info "没有需要清理的旧备份文件"
    fi
}

# 验证备份完整性
verify_backup_integrity() {
    local backup_file="$1"
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "备份文件不存在: $backup_file"
        return 1
    fi
    
    # 检查文件大小
    local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
    if [[ $file_size -eq 0 ]]; then
        log_error "备份文件为空: $backup_file"
        return 1
    fi
    
    # 检查压缩文件完整性
    case "$backup_file" in
        *.tar.gz)
            if ! tar -tzf "$backup_file" > /dev/null 2>&1; then
                log_error "tar.gz文件损坏: $backup_file"
                return 1
            fi
            ;;
        *.gz)
            if ! gzip -t "$backup_file" 2>/dev/null; then
                log_error "gzip文件损坏: $backup_file"
                return 1
            fi
            ;;
    esac
    
    log_success "备份文件验证通过: $(basename "$backup_file")"
    return 0
}

# 生成备份报告
generate_backup_report() {
    local manifest_file="$1"
    
    if [[ ! -f "$manifest_file" ]]; then
        log_warning "备份清单文件不存在，跳过报告生成"
        return 0
    fi
    
    local report_file="${manifest_file%.txt}-report.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>N8N 备份报告</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f0f0f0; padding: 10px; border-radius: 5px; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>N8N 自动化平台备份报告</h1>
        <p>生成时间: $(date '+%Y-%m-%d %H:%M:%S')</p>
    </div>
    
    <h2>备份概要</h2>
    <pre>$(cat "$manifest_file")</pre>
    
    <h2>备份文件详情</h2>
    <table>
        <tr>
            <th>文件名</th>
            <th>大小</th>
            <th>修改时间</th>
            <th>状态</th>
        </tr>
EOF
    
    # 添加备份文件详情
    while IFS= read -r -d '' file; do
        local filename=$(basename "$file")
        local size=$(du -h "$file" | cut -f1)
        local mtime=$(stat -f%Sm -t"%Y-%m-%d %H:%M:%S" "$file" 2>/dev/null || stat -c%y "$file" 2>/dev/null | cut -d. -f1)
        local status="成功"
        local status_class="success"
        
        if ! verify_backup_integrity "$file"; then
            status="损坏"
            status_class="error"
        fi
        
        cat >> "$report_file" << EOF
        <tr>
            <td>$filename</td>
            <td>$size</td>
            <td>$mtime</td>
            <td class="$status_class">$status</td>
        </tr>
EOF
    done < <(find "$BACKUP_DIR" -name "*backup*" -type f -newer "$manifest_file" -print0 2>/dev/null)
    
    cat >> "$report_file" << EOF
    </table>
</body>
</html>
EOF
    
    log_success "备份报告已生成: $report_file"
}

# 主备份流程
main() {
    log_info "开始备份流程: $BACKUP_TYPE"
    
    # 创建日志目录
    mkdir -p "$PROJECT_ROOT/logs"
    
    # 检查前置条件
    check_backup_prerequisites
    
    # 发送开始通知
    send_notification "开始执行备份操作: $BACKUP_TYPE"
    
    local backup_result=""
    local backup_success=false
    
    # 执行备份
    case "$BACKUP_TYPE" in
        "app")
            if backup_result=$(backup_application); then
                backup_success=true
            fi
            ;;
        "database")
            if backup_result=$(backup_database); then
                backup_success=true
            fi
            ;;
        "redis")
            if backup_result=$(backup_redis); then
                backup_success=true
            fi
            ;;
        "config")
            if backup_result=$(backup_configuration); then
                backup_success=true
            fi
            ;;
        "logs")
            if backup_result=$(backup_logs); then
                backup_success=true
            fi
            ;;
        "full")
            if backup_result=$(backup_full_system); then
                backup_success=true
            fi
            ;;
        *)
            log_error "不支持的备份类型: $BACKUP_TYPE"
            send_notification "不支持的备份类型: $BACKUP_TYPE" "error"
            exit 1
            ;;
    esac
    
    # 处理备份结果
    if [[ "$backup_success" == "true" ]]; then
        log_success "备份操作成功完成"
        
        # 验证备份完整性
        if [[ "$BACKUP_TYPE" != "full" ]] && [[ -n "$backup_result" ]]; then
            verify_backup_integrity "$backup_result"
        fi
        
        # 生成备份报告
        if [[ "$BACKUP_TYPE" == "full" ]] && [[ -n "$backup_result" ]]; then
            generate_backup_report "$backup_result"
        fi
        
        # 清理旧备份
        cleanup_old_backups
        
        send_notification "备份操作成功完成: $BACKUP_TYPE" "success"
    else
        log_error "备份操作失败"
        send_notification "备份操作失败: $BACKUP_TYPE" "error"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    cat << EOF
N8N 自动化平台备份脚本

用法:
    $0 [备份类型] [环境]

参数:
    备份类型    要执行的备份类型，默认: full
               可选值: app, database, redis, config, logs, full
    环境       运行环境，默认: production

示例:
    $0                    # 完整系统备份
    $0 full              # 完整系统备份
    $0 app               # 应用备份
    $0 database          # 数据库备份
    $0 redis             # Redis备份
    $0 config            # 配置备份
    $0 logs              # 日志备份

备份类型说明:
    app         应用代码和文件
    database    PostgreSQL数据库
    redis       Redis缓存数据
    config      配置文件（.env, docker-compose.yml等）
    logs        应用日志文件
    full        完整系统备份（包含以上所有）

环境变量:
    SLACK_WEBHOOK_URL    Slack通知webhook地址
    POSTGRES_USER       PostgreSQL用户名
    POSTGRES_DB         PostgreSQL数据库名

配置选项:
    RETENTION_DAYS      备份保留天数，默认: 30
    MAX_BACKUP_SIZE     最大备份大小，默认: 10G
    COMPRESSION_LEVEL   压缩级别，默认: 6

备份存储:
    备份文件存储在: $PROJECT_ROOT/backups/
    备份文件命名格式: [类型]-backup-[时间戳].[扩展名]

注意事项:
    - 备份过程中服务保持运行
    - 自动清理超过保留期的旧备份
    - 备份完成后会验证文件完整性
    - 完整备份会生成详细的备份报告

EOF
}

# 解析命令行参数
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac