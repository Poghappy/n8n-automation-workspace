#!/bin/bash

# N8N自动化平台回滚脚本
# 用于快速回滚到上一个稳定版本

set -euo pipefail

# 脚本配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="$PROJECT_ROOT/logs"
BACKUP_DIR="$PROJECT_ROOT/backups"

# 回滚配置
ENVIRONMENT="${ENVIRONMENT:-development}"
ROLLBACK_MODE="${ROLLBACK_MODE:-auto}"  # auto, manual, force
ROLLBACK_TARGET="${ROLLBACK_TARGET:-previous}"  # previous, specific_version, backup_id
ROLLBACK_TIMEOUT="${ROLLBACK_TIMEOUT:-300}"
VERIFY_ROLLBACK="${VERIFY_ROLLBACK:-true}"
NOTIFY_ON_ROLLBACK="${NOTIFY_ON_ROLLBACK:-true}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/rollback.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/rollback.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/rollback.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/rollback.log"
}

log_debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${PURPLE}[DEBUG]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/rollback.log"
    fi
}

# 创建必要目录
create_directories() {
    log_info "创建必要目录..."
    mkdir -p "$LOGS_DIR" "$BACKUP_DIR"
}

# 加载环境变量
load_environment() {
    log_info "加载环境变量..."
    
    # 加载通用环境变量
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        set -a
        source "$PROJECT_ROOT/.env"
        set +a
        log_debug "已加载 .env 文件"
    fi
    
    # 加载环境特定配置
    local env_file="$PROJECT_ROOT/.env.$ENVIRONMENT"
    if [[ -f "$env_file" ]]; then
        set -a
        source "$env_file"
        set +a
        log_debug "已加载环境特定配置: $env_file"
    fi
}

# 发送通知
send_notification() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # 记录回滚日志
    echo "[$timestamp] $message" >> "$LOGS_DIR/rollback.log"
    
    # 发送Slack通知
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" &>/dev/null || true
    fi
    
    # 发送钉钉通知
    if [[ -n "${DINGTALK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-Type: application/json' \
            --data "{\"msgtype\":\"text\",\"text\":{\"content\":\"$message\"}}" \
            "$DINGTALK_WEBHOOK_URL" &>/dev/null || true
    fi
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    local dependencies=("docker" "jq" "curl")
    
    # 根据部署模式添加特定依赖
    case "${DEPLOY_MODE:-docker}" in
        kubernetes)
            dependencies+=("kubectl")
            ;;
        standalone)
            dependencies+=("systemctl" "pm2")
            ;;
    esac
    
    for cmd in "${dependencies[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "依赖 $cmd 未安装"
            return 1
        fi
    done
    
    log_success "所有依赖检查通过"
}

# 获取当前版本信息
get_current_version() {
    log_info "获取当前版本信息..."
    
    case "${DEPLOY_MODE:-docker}" in
        docker)
            CURRENT_VERSION=$(docker ps --filter "name=n8n" --format "table {{.Image}}" | tail -n +2 | head -1 | cut -d':' -f2 || echo "unknown")
            ;;
        kubernetes)
            CURRENT_VERSION=$(kubectl get deployment n8n -o jsonpath='{.spec.template.spec.containers[0].image}' | cut -d':' -f2 || echo "unknown")
            ;;
        standalone)
            CURRENT_VERSION=$(cat "$PROJECT_ROOT/VERSION" 2>/dev/null || echo "unknown")
            ;;
    esac
    
    log_info "当前版本: $CURRENT_VERSION"
    echo "$CURRENT_VERSION"
}

# 获取回滚目标版本
get_rollback_target() {
    log_info "确定回滚目标..."
    
    case "$ROLLBACK_TARGET" in
        previous)
            # 从部署历史中获取上一个版本
            if [[ -f "$LOGS_DIR/deployment-history.json" ]]; then
                TARGET_VERSION=$(jq -r '.[1].version // "unknown"' "$LOGS_DIR/deployment-history.json")
            else
                log_error "无法找到部署历史文件"
                return 1
            fi
            ;;
        specific_version)
            TARGET_VERSION="${SPECIFIC_VERSION:-unknown}"
            ;;
        backup_id)
            TARGET_VERSION="${BACKUP_ID:-unknown}"
            ;;
        *)
            log_error "未知的回滚目标: $ROLLBACK_TARGET"
            return 1
            ;;
    esac
    
    if [[ "$TARGET_VERSION" == "unknown" ]]; then
        log_error "无法确定回滚目标版本"
        return 1
    fi
    
    log_info "回滚目标版本: $TARGET_VERSION"
    echo "$TARGET_VERSION"
}

# 验证回滚条件
verify_rollback_conditions() {
    log_info "验证回滚条件..."
    
    local current_version="$1"
    local target_version="$2"
    
    # 检查版本是否相同
    if [[ "$current_version" == "$target_version" ]]; then
        log_warning "当前版本与目标版本相同，无需回滚"
        return 1
    fi
    
    # 检查目标版本是否存在
    case "${DEPLOY_MODE:-docker}" in
        docker)
            if ! docker image inspect "${DOCKER_IMAGE_PREFIX:-n8n}:$target_version" &>/dev/null; then
                log_error "目标Docker镜像不存在: ${DOCKER_IMAGE_PREFIX:-n8n}:$target_version"
                return 1
            fi
            ;;
        kubernetes)
            # 检查镜像是否可用
            if ! kubectl run --dry-run=client --image="${DOCKER_IMAGE_PREFIX:-n8n}:$target_version" test-image &>/dev/null; then
                log_error "目标Kubernetes镜像不可用: ${DOCKER_IMAGE_PREFIX:-n8n}:$target_version"
                return 1
            fi
            ;;
        standalone)
            local backup_file="$BACKUP_DIR/backup-$target_version.tar.gz"
            if [[ ! -f "$backup_file" ]]; then
                log_error "目标备份文件不存在: $backup_file"
                return 1
            fi
            ;;
    esac
    
    log_success "回滚条件验证通过"
}

# 创建回滚前备份
create_rollback_backup() {
    log_info "创建回滚前备份..."
    
    local backup_id="rollback-$(date +%Y%m%d-%H%M%S)"
    local backup_file="$BACKUP_DIR/$backup_id.tar.gz"
    
    case "${DEPLOY_MODE:-docker}" in
        docker)
            # 备份Docker容器数据
            docker exec n8n tar czf - /home/node/.n8n > "$backup_file" 2>/dev/null || true
            ;;
        kubernetes)
            # 备份Kubernetes PVC数据
            kubectl exec deployment/n8n -- tar czf - /home/node/.n8n > "$backup_file" 2>/dev/null || true
            ;;
        standalone)
            # 备份应用目录
            tar czf "$backup_file" -C "$PROJECT_ROOT" . --exclude=logs --exclude=backups --exclude=node_modules
            ;;
    esac
    
    if [[ -f "$backup_file" ]]; then
        log_success "回滚前备份创建成功: $backup_file"
        echo "$backup_id"
    else
        log_error "回滚前备份创建失败"
        return 1
    fi
}

# Docker模式回滚
rollback_docker() {
    local target_version="$1"
    log_info "执行Docker模式回滚到版本: $target_version"
    
    # 停止当前容器
    log_info "停止当前N8N容器..."
    docker stop n8n || true
    docker rm n8n || true
    
    # 启动目标版本容器
    log_info "启动目标版本容器..."
    docker run -d \
        --name n8n \
        --restart unless-stopped \
        -p "${N8N_PORT:-5678}:5678" \
        -e N8N_HOST="${N8N_HOST:-localhost}" \
        -e N8N_PORT="${N8N_PORT:-5678}" \
        -e N8N_PROTOCOL="${N8N_PROTOCOL:-http}" \
        -e DATABASE_TYPE="${DATABASE_TYPE:-sqlite}" \
        -e DATABASE_SQLITE_DATABASE="${DATABASE_SQLITE_DATABASE:-/home/node/.n8n/database.sqlite}" \
        -v n8n_data:/home/node/.n8n \
        "${DOCKER_IMAGE_PREFIX:-n8n}:$target_version"
    
    log_success "Docker回滚完成"
}

# Kubernetes模式回滚
rollback_kubernetes() {
    local target_version="$1"
    log_info "执行Kubernetes模式回滚到版本: $target_version"
    
    # 更新Deployment镜像
    log_info "更新Deployment镜像..."
    kubectl set image deployment/n8n n8n="${DOCKER_IMAGE_PREFIX:-n8n}:$target_version"
    
    # 等待回滚完成
    log_info "等待回滚完成..."
    kubectl rollout status deployment/n8n --timeout="${ROLLBACK_TIMEOUT}s"
    
    log_success "Kubernetes回滚完成"
}

# 独立模式回滚
rollback_standalone() {
    local target_version="$1"
    log_info "执行独立模式回滚到版本: $target_version"
    
    # 停止服务
    log_info "停止N8N服务..."
    if command -v systemctl &> /dev/null; then
        sudo systemctl stop n8n || true
    elif command -v pm2 &> /dev/null; then
        pm2 stop n8n || true
    fi
    
    # 恢复备份
    local backup_file="$BACKUP_DIR/backup-$target_version.tar.gz"
    if [[ -f "$backup_file" ]]; then
        log_info "恢复备份文件..."
        tar xzf "$backup_file" -C "$PROJECT_ROOT"
    else
        log_error "备份文件不存在: $backup_file"
        return 1
    fi
    
    # 重新安装依赖
    log_info "重新安装依赖..."
    cd "$PROJECT_ROOT"
    npm ci --production
    
    # 启动服务
    log_info "启动N8N服务..."
    if command -v systemctl &> /dev/null; then
        sudo systemctl start n8n
    elif command -v pm2 &> /dev/null; then
        pm2 start n8n
    fi
    
    log_success "独立模式回滚完成"
}

# 执行回滚
execute_rollback() {
    local target_version="$1"
    log_info "开始执行回滚..."
    
    case "${DEPLOY_MODE:-docker}" in
        docker)
            rollback_docker "$target_version"
            ;;
        kubernetes)
            rollback_kubernetes "$target_version"
            ;;
        standalone)
            rollback_standalone "$target_version"
            ;;
        *)
            log_error "不支持的部署模式: ${DEPLOY_MODE:-docker}"
            return 1
            ;;
    esac
}

# 等待服务健康检查
wait_for_health() {
    log_info "等待服务健康检查..."
    
    local max_attempts=30
    local attempt=1
    local health_url="http://${N8N_HOST:-localhost}:${N8N_PORT:-5678}/healthz"
    
    while [[ $attempt -le $max_attempts ]]; do
        log_debug "健康检查尝试 $attempt/$max_attempts"
        
        if curl -f -s "$health_url" &>/dev/null; then
            log_success "服务健康检查通过"
            return 0
        fi
        
        sleep 10
        ((attempt++))
    done
    
    log_error "服务健康检查失败"
    return 1
}

# 验证回滚结果
verify_rollback() {
    local target_version="$1"
    log_info "验证回滚结果..."
    
    # 检查版本
    local current_version
    current_version=$(get_current_version)
    
    if [[ "$current_version" != "$target_version" ]]; then
        log_error "回滚验证失败: 当前版本 $current_version != 目标版本 $target_version"
        return 1
    fi
    
    # 运行基础功能测试
    log_info "运行基础功能测试..."
    if [[ -f "$SCRIPT_DIR/health-check.sh" ]]; then
        bash "$SCRIPT_DIR/health-check.sh" || {
            log_error "健康检查失败"
            return 1
        }
    fi
    
    log_success "回滚验证通过"
}

# 更新部署历史
update_deployment_history() {
    local target_version="$1"
    local rollback_backup_id="$2"
    
    log_info "更新部署历史..."
    
    local history_file="$LOGS_DIR/deployment-history.json"
    local rollback_record=$(cat <<EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "type": "rollback",
    "version": "$target_version",
    "environment": "$ENVIRONMENT",
    "deploy_mode": "${DEPLOY_MODE:-docker}",
    "rollback_backup_id": "$rollback_backup_id",
    "status": "success"
}
EOF
)
    
    if [[ -f "$history_file" ]]; then
        # 添加到现有历史
        jq ". = [$rollback_record] + ." "$history_file" > "${history_file}.tmp" && mv "${history_file}.tmp" "$history_file"
    else
        # 创建新历史文件
        echo "[$rollback_record]" > "$history_file"
    fi
    
    log_success "部署历史已更新"
}

# 生成回滚报告
generate_rollback_report() {
    local current_version="$1"
    local target_version="$2"
    local rollback_backup_id="$3"
    local start_time="$4"
    local end_time="$5"
    
    log_info "生成回滚报告..."
    
    local report_file="$LOGS_DIR/rollback-report-$(date +%Y%m%d-%H%M%S).json"
    local duration=$((end_time - start_time))
    
    cat > "$report_file" <<EOF
{
    "rollback_info": {
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "environment": "$ENVIRONMENT",
        "deploy_mode": "${DEPLOY_MODE:-docker}",
        "rollback_mode": "$ROLLBACK_MODE",
        "rollback_target": "$ROLLBACK_TARGET"
    },
    "version_info": {
        "from_version": "$current_version",
        "to_version": "$target_version"
    },
    "timing": {
        "start_time": "$(date -u -d @$start_time +%Y-%m-%dT%H:%M:%SZ)",
        "end_time": "$(date -u -d @$end_time +%Y-%m-%dT%H:%M:%SZ)",
        "duration_seconds": $duration
    },
    "backup_info": {
        "rollback_backup_id": "$rollback_backup_id"
    },
    "verification": {
        "health_check": "$(if [[ "$VERIFY_ROLLBACK" == "true" ]]; then echo "passed"; else echo "skipped"; fi)"
    },
    "status": "success"
}
EOF
    
    log_success "回滚报告已生成: $report_file"
    echo "$report_file"
}

# 发送回滚通知
send_rollback_notification() {
    local current_version="$1"
    local target_version="$2"
    local report_file="$3"
    
    if [[ "$NOTIFY_ON_ROLLBACK" != "true" ]]; then
        return 0
    fi
    
    log_info "发送回滚通知..."
    
    local message="🔄 N8N自动化平台回滚完成
    
📋 回滚信息:
• 环境: $ENVIRONMENT
• 从版本: $current_version
• 到版本: $target_version
• 时间: $(date '+%Y-%m-%d %H:%M:%S')

📊 详细报告: $report_file"
    
    # Slack通知
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" &>/dev/null || true
    fi
    
    # 钉钉通知
    if [[ -n "${DINGTALK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-Type: application/json' \
            --data "{\"msgtype\":\"text\",\"text\":{\"content\":\"$message\"}}" \
            "$DINGTALK_WEBHOOK_URL" &>/dev/null || true
    fi
    
    # 邮件通知
    if [[ -n "${EMAIL_NOTIFICATION:-}" ]] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "N8N回滚通知 - $ENVIRONMENT" "$EMAIL_NOTIFICATION" || true
    fi
    
    log_success "回滚通知已发送"
}

# 清理临时文件
cleanup() {
    log_info "清理临时文件..."
    
    # 清理超过30天的日志文件
    find "$LOGS_DIR" -name "rollback-*.log" -mtime +30 -delete 2>/dev/null || true
    
    # 清理超过7天的临时备份
    find "$BACKUP_DIR" -name "rollback-*.tar.gz" -mtime +7 -delete 2>/dev/null || true
    
    log_success "清理完成"
}

# 主回滚函数
main_rollback() {
    local start_time
    start_time=$(date +%s)
    
    log_info "🔄 开始N8N自动化平台回滚流程..."
    log_info "环境: $ENVIRONMENT"
    log_info "模式: ${DEPLOY_MODE:-docker}"
    log_info "目标: $ROLLBACK_TARGET"
    
    # 获取当前版本
    local current_version
    current_version=$(get_current_version)
    
    # 获取回滚目标版本
    local target_version
    target_version=$(get_rollback_target)
    
    # 验证回滚条件
    verify_rollback_conditions "$current_version" "$target_version"
    
    # 创建回滚前备份
    local rollback_backup_id
    rollback_backup_id=$(create_rollback_backup)
    
    # 执行回滚
    execute_rollback "$target_version"
    
    # 等待服务健康
    wait_for_health
    
    # 验证回滚结果
    if [[ "$VERIFY_ROLLBACK" == "true" ]]; then
        verify_rollback "$target_version"
    fi
    
    # 更新部署历史
    update_deployment_history "$target_version" "$rollback_backup_id"
    
    local end_time
    end_time=$(date +%s)
    
    # 生成回滚报告
    local report_file
    report_file=$(generate_rollback_report "$current_version" "$target_version" "$rollback_backup_id" "$start_time" "$end_time")
    
    # 发送通知
    send_rollback_notification "$current_version" "$target_version" "$report_file"
    
    # 清理临时文件
    cleanup
    
    log_success "🎉 回滚流程完成！"
    log_info "从版本 $current_version 回滚到 $target_version"
    log_info "耗时: $((end_time - start_time)) 秒"
}

# 显示帮助信息
show_help() {
    cat <<EOF
N8N自动化平台回滚脚本

用法: $0 [选项]

选项:
    -e, --environment ENV       设置环境 (development|staging|production)
    -m, --mode MODE            设置回滚模式 (auto|manual|force)
    -t, --target TARGET        设置回滚目标 (previous|specific_version|backup_id)
    -v, --version VERSION      指定目标版本 (当target为specific_version时)
    -b, --backup-id ID         指定备份ID (当target为backup_id时)
    --deploy-mode MODE         设置部署模式 (docker|kubernetes|standalone)
    --no-verify               跳过回滚验证
    --no-notify               跳过通知发送
    --timeout SECONDS         设置回滚超时时间 (默认: 300)
    --debug                   启用调试模式
    -h, --help                显示此帮助信息

示例:
    $0 -e production -t previous                    # 回滚到上一个版本
    $0 -e staging -t specific_version -v v1.2.3     # 回滚到指定版本
    $0 -e development -t backup_id -b backup-123    # 回滚到指定备份

环境变量:
    ENVIRONMENT              部署环境
    ROLLBACK_MODE           回滚模式
    ROLLBACK_TARGET         回滚目标
    ROLLBACK_TIMEOUT        回滚超时时间
    DEPLOY_MODE             部署模式
    VERIFY_ROLLBACK         是否验证回滚
    NOTIFY_ON_ROLLBACK      是否发送通知
    DEBUG                   调试模式
EOF
}

# 解析命令行参数
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -m|--mode)
                ROLLBACK_MODE="$2"
                shift 2
                ;;
            -t|--target)
                ROLLBACK_TARGET="$2"
                shift 2
                ;;
            -v|--version)
                SPECIFIC_VERSION="$2"
                shift 2
                ;;
            -b|--backup-id)
                BACKUP_ID="$2"
                shift 2
                ;;
            --deploy-mode)
                DEPLOY_MODE="$2"
                shift 2
                ;;
            --no-verify)
                VERIFY_ROLLBACK="false"
                shift
                ;;
            --no-notify)
                NOTIFY_ON_ROLLBACK="false"
                shift
                ;;
            --timeout)
                ROLLBACK_TIMEOUT="$2"
                shift 2
                ;;
            --debug)
                DEBUG="true"
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# 脚本入口
main() {
    # 解析命令行参数
    parse_arguments "$@"
    
    # 创建必要目录
    create_directories
    
    # 加载环境变量
    load_environment
    
    # 检查依赖
    check_dependencies
    
    # 执行回滚
    main_rollback
}

# 错误处理
trap 'log_error "脚本执行失败，退出码: $?"' ERR

# 执行主函数
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi