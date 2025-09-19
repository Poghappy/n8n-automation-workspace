#!/bin/bash

# N8N数据备份和恢复脚本
# 支持完整的数据备份、增量备份和数据恢复功能
# 作者: N8N自动化系统
# 版本: 1.0.0
# 创建时间: $(date '+%Y-%m-%d %H:%M:%S')

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
RETENTION_DAYS=30

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    local deps=("docker" "docker-compose" "tar" "gzip" "pg_dump" "psql")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null && ! docker exec postgres which "$dep" &> /dev/null; then
            if [[ "$dep" == "pg_dump" || "$dep" == "psql" ]]; then
                continue # 这些命令在容器内
            fi
            log_error "缺少依赖: $dep"
            exit 1
        fi
    done
    
    log_success "依赖检查完成"
}

# 创建备份目录
create_backup_directory() {
    log_info "创建备份目录..."
    
    mkdir -p "$BACKUP_DIR"/{full,incremental,logs}
    log_success "备份目录创建完成: $BACKUP_DIR"
}

# 获取容器名称
get_container_names() {
    N8N_CONTAINER=$(docker ps --format "{{.Names}}" | grep n8n | head -1 || echo "")
    POSTGRES_CONTAINER=$(docker ps --format "{{.Names}}" | grep postgres | head -1 || echo "")
    REDIS_CONTAINER=$(docker ps --format "{{.Names}}" | grep redis | head -1 || echo "")
    
    # 加载环境变量
    if [ -f "$PROJECT_ROOT/.env" ]; then
        source "$PROJECT_ROOT/.env"
    fi
    
    # 设置默认值
    REDIS_PASSWORD=${REDIS_PASSWORD:-""}
    
    if [ -z "$N8N_CONTAINER" ]; then
        log_error "未找到N8N容器"
        exit 1
    fi
    
    if [ -z "$POSTGRES_CONTAINER" ]; then
        log_error "未找到PostgreSQL容器"
        exit 1
    fi
    
    log_info "容器信息: N8N=$N8N_CONTAINER, PostgreSQL=$POSTGRES_CONTAINER, Redis=$REDIS_CONTAINER"
}

# 完整备份
full_backup() {
    log_info "开始完整备份..."
    
    local backup_name="full_backup_${TIMESTAMP}"
    local backup_path="$BACKUP_DIR/full/$backup_name"
    
    mkdir -p "$backup_path"
    
    # 备份PostgreSQL数据库
    backup_database "$backup_path"
    
    # 备份Redis数据
    backup_redis "$backup_path"
    
    # 备份N8N工作流和凭据
    backup_n8n_data "$backup_path"
    
    # 备份配置文件
    backup_config_files "$backup_path"
    
    # 备份Docker卷数据
    backup_docker_volumes "$backup_path"
    
    # 创建备份信息文件
    create_backup_info "$backup_path"
    
    # 压缩备份
    compress_backup "$backup_path"
    
    log_success "完整备份完成: $backup_path.tar.gz"
}

# 增量备份
incremental_backup() {
    log_info "开始增量备份..."
    
    local backup_name="incremental_backup_${TIMESTAMP}"
    local backup_path="$BACKUP_DIR/incremental/$backup_name"
    
    mkdir -p "$backup_path"
    
    # 查找最近的完整备份
    local last_full_backup=$(find "$BACKUP_DIR/full" -name "*.tar.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2- || echo "")
    
    if [ -z "$last_full_backup" ]; then
        log_warning "未找到完整备份，执行完整备份"
        full_backup
        return
    fi
    
    local last_backup_time=$(stat -c %Y "$last_full_backup")
    
    # 备份自上次备份以来的变更
    backup_database_incremental "$backup_path" "$last_backup_time"
    backup_n8n_data_incremental "$backup_path" "$last_backup_time"
    
    # 创建备份信息文件
    create_backup_info "$backup_path" "incremental" "$last_full_backup"
    
    # 压缩备份
    compress_backup "$backup_path"
    
    log_success "增量备份完成: $backup_path.tar.gz"
}

# 备份PostgreSQL数据库
backup_database() {
    local backup_path="$1"
    log_info "备份PostgreSQL数据库..."
    
    # 创建数据库备份
    docker exec "$POSTGRES_CONTAINER" pg_dump -U n8n -d n8n --verbose \
        > "$backup_path/database_full.sql" 2>"$backup_path/database_backup.log"
    
    # 创建数据库结构备份
    docker exec "$POSTGRES_CONTAINER" pg_dump -U n8n -d n8n --schema-only \
        > "$backup_path/database_schema.sql"
    
    # 创建数据库统计信息
    docker exec "$POSTGRES_CONTAINER" psql -U n8n -d n8n -c "
        SELECT 
            schemaname,
            tablename,
            attname,
            n_distinct,
            correlation
        FROM pg_stats 
        WHERE schemaname = 'public';
    " > "$backup_path/database_stats.txt" 2>/dev/null || true
    
    log_success "数据库备份完成"
}

# 增量数据库备份
backup_database_incremental() {
    local backup_path="$1"
    local since_time="$2"
    log_info "备份数据库增量数据..."
    
    # 备份执行历史（最近的执行记录）
    docker exec "$POSTGRES_CONTAINER" psql -U n8n -d n8n -c "
        COPY (
            SELECT * FROM execution_entity 
            WHERE \"startedAt\" > to_timestamp($since_time)
        ) TO STDOUT WITH CSV HEADER;
    " > "$backup_path/executions_incremental.csv" 2>/dev/null || true
    
    # 备份工作流变更
    docker exec "$POSTGRES_CONTAINER" psql -U n8n -d n8n -c "
        COPY (
            SELECT * FROM workflow_entity 
            WHERE \"updatedAt\" > to_timestamp($since_time)
        ) TO STDOUT WITH CSV HEADER;
    " > "$backup_path/workflows_incremental.csv" 2>/dev/null || true
    
    log_success "增量数据库备份完成"
}

# 备份Redis数据
backup_redis() {
    local backup_path="$1"
    log_info "备份Redis数据..."
    
    if [ -n "$REDIS_CONTAINER" ]; then
        # 检查Redis密码
        local redis_auth=""
        if [ -n "$REDIS_PASSWORD" ]; then
            redis_auth="-a $REDIS_PASSWORD"
        fi
        
        # 创建Redis备份 - 使用BGSAVE命令
        if [ -n "$redis_auth" ]; then
            docker exec "$REDIS_CONTAINER" redis-cli $redis_auth BGSAVE
            # 等待备份完成
            sleep 2
            # 复制备份文件
            docker cp "$REDIS_CONTAINER:/data/dump.rdb" "$backup_path/redis_dump.rdb" 2>/dev/null || {
                log_warning "Redis备份文件不存在，可能Redis数据为空"
                touch "$backup_path/redis_dump.rdb"
            }
            # 导出Redis配置
            docker exec "$REDIS_CONTAINER" redis-cli $redis_auth CONFIG GET '*' > "$backup_path/redis_config.txt"
        else
            docker exec "$REDIS_CONTAINER" redis-cli BGSAVE
            # 等待备份完成
            sleep 2
            # 复制备份文件
            docker cp "$REDIS_CONTAINER:/data/dump.rdb" "$backup_path/redis_dump.rdb" 2>/dev/null || {
                log_warning "Redis备份文件不存在，可能Redis数据为空"
                touch "$backup_path/redis_dump.rdb"
            }
            # 导出Redis配置
            docker exec "$REDIS_CONTAINER" redis-cli CONFIG GET '*' > "$backup_path/redis_config.txt"
        fi
        
        log_success "Redis备份完成"
    else
        log_warning "Redis容器未运行，跳过Redis备份"
    fi
}

# 备份N8N数据
backup_n8n_data() {
    local backup_path="$1"
    log_info "备份N8N工作流和凭据..."
    
    # 导出所有工作流
    docker exec "$N8N_CONTAINER" n8n export:workflow --all --output=/tmp/workflows_export.json 2>/dev/null || {
        log_warning "工作流导出失败，可能没有工作流数据"
        echo "[]" > "$backup_path/workflows.json"
    }
    
    if docker exec "$N8N_CONTAINER" test -f /tmp/workflows_export.json; then
        docker cp "$N8N_CONTAINER:/tmp/workflows_export.json" "$backup_path/workflows.json"
    fi
    
    # 导出所有凭据（加密状态）
    docker exec "$N8N_CONTAINER" n8n export:credentials --all --output=/tmp/credentials_export.json 2>/dev/null || {
        log_warning "凭据导出失败，可能没有凭据数据"
        echo "[]" > "$backup_path/credentials.json"
    }
    
    if docker exec "$N8N_CONTAINER" test -f /tmp/credentials_export.json; then
        docker cp "$N8N_CONTAINER:/tmp/credentials_export.json" "$backup_path/credentials.json"
    fi
    
    # 备份N8N设置
    docker exec "$N8N_CONTAINER" n8n export:settings --output=/tmp/settings_export.json 2>/dev/null || {
        log_warning "设置导出失败"
        echo "{}" > "$backup_path/settings.json"
    }
    
    if docker exec "$N8N_CONTAINER" test -f /tmp/settings_export.json; then
        docker cp "$N8N_CONTAINER:/tmp/settings_export.json" "$backup_path/settings.json"
    fi
    
    log_success "N8N数据备份完成"
}

# 增量N8N数据备份
backup_n8n_data_incremental() {
    local backup_path="$1"
    local since_time="$2"
    log_info "备份N8N增量数据..."
    
    # 导出最近修改的工作流
    docker exec "$POSTGRES_CONTAINER" psql -U n8n -d n8n -c "
        COPY (
            SELECT id, name, nodes, connections, settings, \"updatedAt\"
            FROM workflow_entity 
            WHERE \"updatedAt\" > to_timestamp($since_time)
        ) TO STDOUT WITH CSV HEADER;
    " > "$backup_path/workflows_incremental.csv" 2>/dev/null || true
    
    log_success "N8N增量数据备份完成"
}

# 备份配置文件
backup_config_files() {
    local backup_path="$1"
    log_info "备份配置文件..."
    
    mkdir -p "$backup_path/config"
    
    # 备份主要配置文件
    cp "$PROJECT_ROOT/docker-compose.yml" "$backup_path/config/" 2>/dev/null || true
    cp "$PROJECT_ROOT/.env" "$backup_path/config/.env.backup" 2>/dev/null || true
    
    # 备份Nginx配置
    if [ -d "$PROJECT_ROOT/nginx" ]; then
        cp -r "$PROJECT_ROOT/nginx" "$backup_path/config/"
    fi
    
    # 备份Kubernetes配置
    if [ -d "$PROJECT_ROOT/bridge" ]; then
        cp -r "$PROJECT_ROOT/bridge" "$backup_path/config/"
    fi
    
    # 备份脚本文件
    if [ -d "$PROJECT_ROOT/scripts" ]; then
        cp -r "$PROJECT_ROOT/scripts" "$backup_path/config/"
    fi
    
    log_success "配置文件备份完成"
}

# 备份Docker卷数据
backup_docker_volumes() {
    local backup_path="$1"
    log_info "备份Docker卷数据..."
    
    mkdir -p "$backup_path/volumes"
    
    # 获取所有相关的Docker卷
    local volumes=$(docker volume ls --format "{{.Name}}" | grep -E "(n8n|postgres|redis)" || true)
    
    for volume in $volumes; do
        log_info "备份卷: $volume"
        docker run --rm -v "$volume:/data" -v "$backup_path/volumes:/backup" \
            alpine tar czf "/backup/${volume}.tar.gz" -C /data . 2>/dev/null || {
            log_warning "卷 $volume 备份失败"
        }
    done
    
    log_success "Docker卷备份完成"
}

# 创建备份信息文件
create_backup_info() {
    local backup_path="$1"
    local backup_type="${2:-full}"
    local reference_backup="${3:-}"
    
    log_info "创建备份信息文件..."
    
    cat > "$backup_path/backup_info.json" << EOF
{
    "backup_type": "$backup_type",
    "timestamp": "$TIMESTAMP",
    "date": "$(date -Iseconds)",
    "hostname": "$(hostname)",
    "backup_path": "$backup_path",
    "reference_backup": "$reference_backup",
    "system_info": {
        "os": "$(uname -s) $(uname -r)",
        "docker_version": "$(docker --version)",
        "docker_compose_version": "$(docker-compose --version)"
    },
    "containers": {
        "n8n": "$N8N_CONTAINER",
        "postgres": "$POSTGRES_CONTAINER",
        "redis": "$REDIS_CONTAINER"
    },
    "n8n_version": "$(docker exec "$N8N_CONTAINER" n8n --version 2>/dev/null || echo 'unknown')",
    "database_info": {
        "version": "$(docker exec "$POSTGRES_CONTAINER" psql -U n8n -d n8n -t -c 'SELECT version();' 2>/dev/null | head -1 | xargs || echo 'unknown')",
        "size": "$(docker exec "$POSTGRES_CONTAINER" psql -U n8n -d n8n -t -c "SELECT pg_size_pretty(pg_database_size('n8n'));" 2>/dev/null | xargs || echo 'unknown')"
    },
    "backup_size": "$(du -sh "$backup_path" | cut -f1)",
    "files": $(find "$backup_path" -type f -exec basename {} \; | jq -R . | jq -s .)
}
EOF

    log_success "备份信息文件创建完成"
}

# 压缩备份
compress_backup() {
    local backup_path="$1"
    log_info "压缩备份文件..."
    
    cd "$(dirname "$backup_path")"
    tar -czf "$(basename "$backup_path").tar.gz" "$(basename "$backup_path")"
    rm -rf "$backup_path"
    
    log_success "备份压缩完成"
}

# 数据恢复
restore_data() {
    local backup_file="$1"
    local restore_type="${2:-full}"
    
    log_info "开始数据恢复..."
    
    if [ ! -f "$backup_file" ]; then
        log_error "备份文件不存在: $backup_file"
        exit 1
    fi
    
    # 创建临时恢复目录
    local temp_dir="/tmp/n8n_restore_$$"
    mkdir -p "$temp_dir"
    
    # 解压备份文件
    log_info "解压备份文件..."
    tar -xzf "$backup_file" -C "$temp_dir"
    
    local restore_path=$(find "$temp_dir" -maxdepth 1 -type d | grep -v "^$temp_dir$" | head -1)
    
    if [ -z "$restore_path" ]; then
        log_error "无效的备份文件格式"
        rm -rf "$temp_dir"
        exit 1
    fi
    
    # 读取备份信息
    if [ -f "$restore_path/backup_info.json" ]; then
        log_info "备份信息:"
        cat "$restore_path/backup_info.json" | jq .
    fi
    
    # 确认恢复操作
    read -p "确认要恢复数据吗？这将覆盖现有数据 (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "恢复操作已取消"
        rm -rf "$temp_dir"
        exit 0
    fi
    
    # 停止服务
    log_info "停止N8N服务..."
    docker-compose -f "$PROJECT_ROOT/docker-compose.yml" stop
    
    # 恢复数据库
    if [ -f "$restore_path/database_full.sql" ]; then
        restore_database "$restore_path/database_full.sql"
    fi
    
    # 恢复Redis数据
    if [ -f "$restore_path/redis_dump.rdb" ]; then
        restore_redis "$restore_path/redis_dump.rdb"
    fi
    
    # 恢复Docker卷
    if [ -d "$restore_path/volumes" ]; then
        restore_docker_volumes "$restore_path/volumes"
    fi
    
    # 恢复配置文件
    if [ -d "$restore_path/config" ]; then
        restore_config_files "$restore_path/config"
    fi
    
    # 启动服务
    log_info "启动N8N服务..."
    docker-compose -f "$PROJECT_ROOT/docker-compose.yml" up -d
    
    # 等待服务启动
    sleep 30
    
    # 恢复N8N数据
    if [ -f "$restore_path/workflows.json" ]; then
        restore_n8n_workflows "$restore_path/workflows.json"
    fi
    
    if [ -f "$restore_path/credentials.json" ]; then
        restore_n8n_credentials "$restore_path/credentials.json"
    fi
    
    if [ -f "$restore_path/settings.json" ]; then
        restore_n8n_settings "$restore_path/settings.json"
    fi
    
    # 清理临时文件
    rm -rf "$temp_dir"
    
    log_success "数据恢复完成"
}

# 恢复数据库
restore_database() {
    local sql_file="$1"
    log_info "恢复PostgreSQL数据库..."
    
    # 重新创建数据库
    docker exec "$POSTGRES_CONTAINER" psql -U postgres -c "DROP DATABASE IF EXISTS n8n;"
    docker exec "$POSTGRES_CONTAINER" psql -U postgres -c "CREATE DATABASE n8n OWNER n8n;"
    
    # 恢复数据
    docker exec -i "$POSTGRES_CONTAINER" psql -U n8n -d n8n < "$sql_file"
    
    log_success "数据库恢复完成"
}

# 恢复Redis数据
restore_redis() {
    local rdb_file="$1"
    log_info "恢复Redis数据..."
    
    if [ -n "$REDIS_CONTAINER" ]; then
        # 检查Redis密码
        local redis_auth=""
        if [ -n "$REDIS_PASSWORD" ]; then
            redis_auth="-a $REDIS_PASSWORD"
        fi
        
        # 清空Redis数据
        if [ -n "$redis_auth" ]; then
            docker exec "$REDIS_CONTAINER" redis-cli $redis_auth FLUSHALL
        else
            docker exec "$REDIS_CONTAINER" redis-cli FLUSHALL
        fi
        
        # 复制RDB文件
        docker cp "$rdb_file" "$REDIS_CONTAINER:/data/dump.rdb"
        
        # 重启Redis容器以加载数据
        docker restart "$REDIS_CONTAINER"
        
        log_success "Redis数据恢复完成"
    else
        log_warning "Redis容器未运行，跳过Redis恢复"
    fi
}

# 恢复Docker卷
restore_docker_volumes() {
    local volumes_path="$1"
    log_info "恢复Docker卷数据..."
    
    for volume_file in "$volumes_path"/*.tar.gz; do
        if [ -f "$volume_file" ]; then
            local volume_name=$(basename "$volume_file" .tar.gz)
            log_info "恢复卷: $volume_name"
            
            # 删除现有卷
            docker volume rm "$volume_name" 2>/dev/null || true
            
            # 创建新卷并恢复数据
            docker volume create "$volume_name"
            docker run --rm -v "$volume_name:/data" -v "$volumes_path:/backup" \
                alpine tar xzf "/backup/$(basename "$volume_file")" -C /data
        fi
    done
    
    log_success "Docker卷恢复完成"
}

# 恢复配置文件
restore_config_files() {
    local config_path="$1"
    log_info "恢复配置文件..."
    
    # 备份当前配置
    if [ -f "$PROJECT_ROOT/.env" ]; then
        cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/.env.backup.$(date +%s)"
    fi
    
    # 恢复配置文件
    if [ -f "$config_path/.env.backup" ]; then
        cp "$config_path/.env.backup" "$PROJECT_ROOT/.env"
    fi
    
    if [ -f "$config_path/docker-compose.yml" ]; then
        cp "$config_path/docker-compose.yml" "$PROJECT_ROOT/"
    fi
    
    # 恢复其他配置目录
    for dir in nginx bridge scripts; do
        if [ -d "$config_path/$dir" ]; then
            rm -rf "$PROJECT_ROOT/$dir"
            cp -r "$config_path/$dir" "$PROJECT_ROOT/"
        fi
    done
    
    log_success "配置文件恢复完成"
}

# 恢复N8N工作流
restore_n8n_workflows() {
    local workflows_file="$1"
    log_info "恢复N8N工作流..."
    
    # 复制文件到容器
    docker cp "$workflows_file" "$N8N_CONTAINER:/tmp/workflows_restore.json"
    
    # 导入工作流
    docker exec "$N8N_CONTAINER" n8n import:workflow --input=/tmp/workflows_restore.json
    
    log_success "工作流恢复完成"
}

# 恢复N8N凭据
restore_n8n_credentials() {
    local credentials_file="$1"
    log_info "恢复N8N凭据..."
    
    # 复制文件到容器
    docker cp "$credentials_file" "$N8N_CONTAINER:/tmp/credentials_restore.json"
    
    # 导入凭据
    docker exec "$N8N_CONTAINER" n8n import:credentials --input=/tmp/credentials_restore.json
    
    log_success "凭据恢复完成"
}

# 恢复N8N设置
restore_n8n_settings() {
    local settings_file="$1"
    log_info "恢复N8N设置..."
    
    # 复制文件到容器
    docker cp "$settings_file" "$N8N_CONTAINER:/tmp/settings_restore.json"
    
    # 导入设置
    docker exec "$N8N_CONTAINER" n8n import:settings --input=/tmp/settings_restore.json
    
    log_success "设置恢复完成"
}

# 清理旧备份
cleanup_old_backups() {
    log_info "清理旧备份文件..."
    
    # 清理完整备份
    find "$BACKUP_DIR/full" -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # 清理增量备份
    find "$BACKUP_DIR/incremental" -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # 清理日志文件
    find "$BACKUP_DIR/logs" -name "*.log" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    log_success "旧备份清理完成"
}

# 列出备份
list_backups() {
    log_info "可用备份列表:"
    
    echo "完整备份:"
    find "$BACKUP_DIR/full" -name "*.tar.gz" -type f -printf '%TY-%Tm-%Td %TH:%TM  %f  %s bytes\n' | sort -r
    
    echo
    echo "增量备份:"
    find "$BACKUP_DIR/incremental" -name "*.tar.gz" -type f -printf '%TY-%Tm-%Td %TH:%TM  %f  %s bytes\n' | sort -r
}

# 验证备份
verify_backup() {
    local backup_file="$1"
    log_info "验证备份文件: $backup_file"
    
    if [ ! -f "$backup_file" ]; then
        log_error "备份文件不存在"
        return 1
    fi
    
    # 检查文件完整性
    if ! tar -tzf "$backup_file" >/dev/null 2>&1; then
        log_error "备份文件损坏"
        return 1
    fi
    
    # 检查备份内容
    local temp_dir="/tmp/verify_$$"
    mkdir -p "$temp_dir"
    tar -xzf "$backup_file" -C "$temp_dir"
    
    local backup_path=$(find "$temp_dir" -maxdepth 1 -type d | grep -v "^$temp_dir$" | head -1)
    
    if [ -f "$backup_path/backup_info.json" ]; then
        log_info "备份信息验证:"
        cat "$backup_path/backup_info.json" | jq .
    else
        log_warning "缺少备份信息文件"
    fi
    
    # 检查关键文件
    local required_files=("database_full.sql" "workflows.json" "credentials.json")
    for file in "${required_files[@]}"; do
        if [ -f "$backup_path/$file" ]; then
            log_success "✓ $file"
        else
            log_warning "✗ $file (可能为空)"
        fi
    done
    
    rm -rf "$temp_dir"
    log_success "备份验证完成"
}

# 显示使用说明
show_usage() {
    cat << EOF
N8N数据备份和恢复脚本

用法: $0 <命令> [选项]

命令:
  full-backup              执行完整备份
  incremental-backup       执行增量备份
  restore <backup_file>    从备份文件恢复数据
  list                     列出所有备份
  verify <backup_file>     验证备份文件
  cleanup                  清理旧备份文件

选项:
  -h, --help              显示此帮助信息
  -d, --backup-dir DIR    指定备份目录 (默认: $BACKUP_DIR)
  -r, --retention DAYS    备份保留天数 (默认: $RETENTION_DAYS)

示例:
  $0 full-backup                           # 执行完整备份
  $0 incremental-backup                    # 执行增量备份
  $0 restore /path/to/backup.tar.gz        # 恢复数据
  $0 list                                  # 列出备份
  $0 verify /path/to/backup.tar.gz         # 验证备份
  $0 cleanup                               # 清理旧备份

EOF
}

# 主函数
main() {
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -d|--backup-dir)
                BACKUP_DIR="$2"
                shift 2
                ;;
            -r|--retention)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            full-backup)
                COMMAND="full-backup"
                shift
                ;;
            incremental-backup)
                COMMAND="incremental-backup"
                shift
                ;;
            restore)
                COMMAND="restore"
                BACKUP_FILE="$2"
                shift 2
                ;;
            list)
                COMMAND="list"
                shift
                ;;
            verify)
                COMMAND="verify"
                BACKUP_FILE="$2"
                shift 2
                ;;
            cleanup)
                COMMAND="cleanup"
                shift
                ;;
            *)
                log_error "未知命令: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    if [ -z "${COMMAND:-}" ]; then
        log_error "请指定命令"
        show_usage
        exit 1
    fi
    
    echo "========================================"
    echo "       N8N数据备份和恢复工具"
    echo "========================================"
    
    check_dependencies
    create_backup_directory
    
    case $COMMAND in
        full-backup)
            get_container_names
            full_backup
            ;;
        incremental-backup)
            get_container_names
            incremental_backup
            ;;
        restore)
            if [ -z "${BACKUP_FILE:-}" ]; then
                log_error "请指定备份文件"
                exit 1
            fi
            get_container_names
            restore_data "$BACKUP_FILE"
            ;;
        list)
            list_backups
            ;;
        verify)
            if [ -z "${BACKUP_FILE:-}" ]; then
                log_error "请指定备份文件"
                exit 1
            fi
            verify_backup "$BACKUP_FILE"
            ;;
        cleanup)
            cleanup_old_backups
            ;;
    esac
    
    echo "========================================"
    echo "           操作完成！"
    echo "========================================"
}

# 执行主函数
main "$@"