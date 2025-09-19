#!/bin/bash

# N8N企业级自动化工作流平台 - 数据迁移脚本
# 提供数据库迁移、版本升级和数据转换功能

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATION_LOG="logs/migration.log"
MIGRATION_DIR="migrations"
BACKUP_DIR="backups/migration"
TEMP_DIR="/tmp/n8n_migration_$$"

# 迁移配置
MIGRATION_TIMEOUT=3600  # 1小时超时
MIGRATION_BATCH_SIZE=1000
MIGRATION_PARALLEL_JOBS=4
MIGRATION_VERIFY_DATA=true
MIGRATION_CREATE_BACKUP=true

# 数据库配置
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-n8n}"
DB_USER="${POSTGRES_USER:-n8n_user}"
DB_PASSWORD="${POSTGRES_PASSWORD:-}"

# 日志函数
log_info() {
    local message="$1"
    echo -e "${BLUE}[INFO]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $message" >> "$MIGRATION_LOG"
}

log_success() {
    local message="$1"
    echo -e "${GREEN}[SUCCESS]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $message" >> "$MIGRATION_LOG"
}

log_warning() {
    local message="$1"
    echo -e "${YELLOW}[WARNING]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $message" >> "$MIGRATION_LOG"
}

log_error() {
    local message="$1"
    echo -e "${RED}[ERROR]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $message" >> "$MIGRATION_LOG"
}

log_header() {
    local message="$1"
    echo ""
    echo -e "${CYAN}=== $message ===${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [HEADER] $message" >> "$MIGRATION_LOG"
}

# 创建必要目录
create_directories() {
    mkdir -p logs "$MIGRATION_DIR" "$BACKUP_DIR" "$TEMP_DIR"
}

# 清理临时文件
cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}

# 设置清理陷阱
trap cleanup EXIT

# 检查数据库连接
check_database_connection() {
    log_info "检查数据库连接..."
    
    if docker-compose ps -q postgres &>/dev/null && [ -n "$(docker-compose ps -q postgres)" ]; then
        if docker-compose exec -T postgres pg_isready -h localhost -p 5432 -U "$DB_USER" -d "$DB_NAME" &>/dev/null; then
            log_success "数据库连接正常"
            return 0
        else
            log_error "数据库连接失败"
            return 1
        fi
    else
        log_error "PostgreSQL容器未运行"
        return 1
    fi
}

# 获取当前数据库版本
get_current_version() {
    log_info "获取当前数据库版本..."
    
    local version_query="SELECT version FROM migration_version ORDER BY id DESC LIMIT 1;"
    local current_version
    
    if current_version=$(docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "$version_query" 2>/dev/null | tr -d ' \n'); then
        if [ -n "$current_version" ]; then
            echo "$current_version"
        else
            echo "0.0.0"
        fi
    else
        # 如果版本表不存在，创建它
        create_migration_table
        echo "0.0.0"
    fi
}

# 创建迁移版本表
create_migration_table() {
    log_info "创建迁移版本表..."
    
    local create_table_sql="
    CREATE TABLE IF NOT EXISTS migration_version (
        id SERIAL PRIMARY KEY,
        version VARCHAR(50) NOT NULL,
        description TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        applied_by VARCHAR(100) DEFAULT 'migration_script',
        execution_time INTEGER DEFAULT 0,
        checksum VARCHAR(64)
    );
    
    CREATE INDEX IF NOT EXISTS idx_migration_version_version ON migration_version(version);
    CREATE INDEX IF NOT EXISTS idx_migration_version_applied_at ON migration_version(applied_at);
    "
    
    if docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -c "$create_table_sql" &>/dev/null; then
        log_success "迁移版本表创建成功"
    else
        log_error "迁移版本表创建失败"
        return 1
    fi
}

# 获取可用迁移
get_available_migrations() {
    log_info "扫描可用迁移..."
    
    if [ ! -d "$MIGRATION_DIR" ]; then
        log_warning "迁移目录不存在: $MIGRATION_DIR"
        return 1
    fi
    
    find "$MIGRATION_DIR" -name "*.sql" -type f | sort
}

# 解析迁移文件版本
parse_migration_version() {
    local migration_file="$1"
    local filename=$(basename "$migration_file")
    
    # 假设迁移文件格式为: V1.2.3__description.sql
    if [[ "$filename" =~ ^V([0-9]+\.[0-9]+\.[0-9]+)__.*\.sql$ ]]; then
        echo "${BASH_REMATCH[1]}"
    else
        log_error "无法解析迁移文件版本: $filename"
        return 1
    fi
}

# 比较版本
version_compare() {
    local version1="$1"
    local version2="$2"
    
    # 将版本号转换为数字进行比较
    local v1_major=$(echo "$version1" | cut -d'.' -f1)
    local v1_minor=$(echo "$version1" | cut -d'.' -f2)
    local v1_patch=$(echo "$version1" | cut -d'.' -f3)
    
    local v2_major=$(echo "$version2" | cut -d'.' -f1)
    local v2_minor=$(echo "$version2" | cut -d'.' -f2)
    local v2_patch=$(echo "$version2" | cut -d'.' -f3)
    
    local v1_num=$((v1_major * 10000 + v1_minor * 100 + v1_patch))
    local v2_num=$((v2_major * 10000 + v2_minor * 100 + v2_patch))
    
    if [ $v1_num -lt $v2_num ]; then
        echo "-1"
    elif [ $v1_num -gt $v2_num ]; then
        echo "1"
    else
        echo "0"
    fi
}

# 计算文件校验和
calculate_checksum() {
    local file="$1"
    
    if command -v sha256sum &>/dev/null; then
        sha256sum "$file" | cut -d' ' -f1
    elif command -v shasum &>/dev/null; then
        shasum -a 256 "$file" | cut -d' ' -f1
    else
        log_warning "无法计算校验和，sha256sum和shasum都不可用"
        echo ""
    fi
}

# 验证迁移文件
validate_migration_file() {
    local migration_file="$1"
    
    log_info "验证迁移文件: $(basename "$migration_file")"
    
    # 检查文件是否存在
    if [ ! -f "$migration_file" ]; then
        log_error "迁移文件不存在: $migration_file"
        return 1
    fi
    
    # 检查文件是否为空
    if [ ! -s "$migration_file" ]; then
        log_error "迁移文件为空: $migration_file"
        return 1
    fi
    
    # 基本SQL语法检查
    if ! grep -q -i "CREATE\|ALTER\|INSERT\|UPDATE\|DELETE" "$migration_file"; then
        log_warning "迁移文件可能不包含有效的SQL语句"
    fi
    
    # 检查危险操作
    if grep -q -i "DROP DATABASE\|TRUNCATE\|DELETE FROM.*WHERE.*1=1" "$migration_file"; then
        log_warning "迁移文件包含潜在危险操作"
        echo -n "确认要执行这个迁移吗? (y/N): "
        read -r confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            log_info "迁移已取消"
            return 1
        fi
    fi
    
    log_success "迁移文件验证通过"
    return 0
}

# 创建数据备份
create_migration_backup() {
    local version="$1"
    
    if [ "$MIGRATION_CREATE_BACKUP" != true ]; then
        log_info "跳过备份创建"
        return 0
    fi
    
    log_header "创建迁移前备份"
    
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/pre_migration_${version}_${timestamp}.sql"
    
    log_info "创建数据库备份: $backup_file"
    
    if docker-compose exec -T postgres pg_dump -U "$DB_USER" -d "$DB_NAME" --no-password > "$backup_file" 2>/dev/null; then
        log_success "备份创建成功: $backup_file"
        
        # 压缩备份文件
        gzip "$backup_file"
        log_info "备份文件已压缩: $backup_file.gz"
        
        echo "$backup_file.gz"
    else
        log_error "备份创建失败"
        return 1
    fi
}

# 执行迁移
execute_migration() {
    local migration_file="$1"
    local version="$2"
    local description="$3"
    
    log_header "执行迁移: $version"
    
    local start_time=$(date +%s)
    local checksum=$(calculate_checksum "$migration_file")
    
    log_info "迁移文件: $(basename "$migration_file")"
    log_info "目标版本: $version"
    log_info "描述: $description"
    log_info "校验和: $checksum"
    
    # 开始事务
    local temp_sql="$TEMP_DIR/migration_$version.sql"
    {
        echo "BEGIN;"
        cat "$migration_file"
        echo ""
        echo "-- 记录迁移版本"
        echo "INSERT INTO migration_version (version, description, checksum) VALUES ('$version', '$description', '$checksum');"
        echo "COMMIT;"
    } > "$temp_sql"
    
    # 执行迁移
    log_info "开始执行迁移..."
    
    if timeout "$MIGRATION_TIMEOUT" docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -f - < "$temp_sql" &>/dev/null; then
        local end_time=$(date +%s)
        local execution_time=$((end_time - start_time))
        
        log_success "迁移执行成功"
        log_info "执行时间: ${execution_time}秒"
        
        # 更新执行时间
        local update_time_sql="UPDATE migration_version SET execution_time = $execution_time WHERE version = '$version' AND checksum = '$checksum';"
        docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -c "$update_time_sql" &>/dev/null || true
        
        return 0
    else
        log_error "迁移执行失败"
        
        # 尝试回滚
        log_info "尝试回滚事务..."
        docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -c "ROLLBACK;" &>/dev/null || true
        
        return 1
    fi
}

# 验证迁移结果
verify_migration() {
    local version="$1"
    
    if [ "$MIGRATION_VERIFY_DATA" != true ]; then
        log_info "跳过迁移验证"
        return 0
    fi
    
    log_info "验证迁移结果..."
    
    # 检查版本是否已记录
    local version_check="SELECT COUNT(*) FROM migration_version WHERE version = '$version';"
    local version_count
    
    if version_count=$(docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "$version_check" 2>/dev/null | tr -d ' \n'); then
        if [ "$version_count" -eq 1 ]; then
            log_success "版本记录验证通过"
        else
            log_error "版本记录验证失败: 找到 $version_count 条记录"
            return 1
        fi
    else
        log_error "无法验证版本记录"
        return 1
    fi
    
    # 基本数据完整性检查
    log_info "执行数据完整性检查..."
    
    # 检查主要表是否存在
    local tables_check="SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
    local table_count
    
    if table_count=$(docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "$tables_check" 2>/dev/null | tr -d ' \n'); then
        log_info "数据库包含 $table_count 个表"
        
        if [ "$table_count" -gt 0 ]; then
            log_success "数据完整性检查通过"
        else
            log_warning "数据库中没有表"
        fi
    else
        log_error "数据完整性检查失败"
        return 1
    fi
    
    return 0
}

# 迁移到指定版本
migrate_to_version() {
    local target_version="$1"
    
    log_header "迁移到版本: $target_version"
    
    # 检查数据库连接
    if ! check_database_connection; then
        return 1
    fi
    
    # 获取当前版本
    local current_version
    if ! current_version=$(get_current_version); then
        log_error "无法获取当前版本"
        return 1
    fi
    
    log_info "当前版本: $current_version"
    log_info "目标版本: $target_version"
    
    # 比较版本
    local version_cmp=$(version_compare "$current_version" "$target_version")
    
    if [ "$version_cmp" -eq 0 ]; then
        log_info "已经是目标版本，无需迁移"
        return 0
    elif [ "$version_cmp" -gt 0 ]; then
        log_error "目标版本低于当前版本，不支持降级"
        return 1
    fi
    
    # 获取需要执行的迁移
    local migrations=()
    local available_migrations
    
    if ! available_migrations=$(get_available_migrations); then
        log_error "无法获取可用迁移"
        return 1
    fi
    
    while IFS= read -r migration_file; do
        if [ -n "$migration_file" ]; then
            local migration_version
            if migration_version=$(parse_migration_version "$migration_file"); then
                local cmp_current=$(version_compare "$current_version" "$migration_version")
                local cmp_target=$(version_compare "$migration_version" "$target_version")
                
                if [ "$cmp_current" -lt 0 ] && [ "$cmp_target" -le 0 ]; then
                    migrations+=("$migration_file")
                fi
            fi
        fi
    done <<< "$available_migrations"
    
    if [ ${#migrations[@]} -eq 0 ]; then
        log_info "没有需要执行的迁移"
        return 0
    fi
    
    log_info "需要执行 ${#migrations[@]} 个迁移"
    
    # 创建备份
    local backup_file
    if backup_file=$(create_migration_backup "$target_version"); then
        log_info "备份文件: $backup_file"
    else
        log_error "备份创建失败"
        return 1
    fi
    
    # 执行迁移
    local migration_success=true
    
    for migration_file in "${migrations[@]}"; do
        local migration_version
        if ! migration_version=$(parse_migration_version "$migration_file"); then
            migration_success=false
            break
        fi
        
        local description=$(basename "$migration_file" | sed 's/^V[0-9.]*__//' | sed 's/\.sql$//' | tr '_' ' ')
        
        # 验证迁移文件
        if ! validate_migration_file "$migration_file"; then
            migration_success=false
            break
        fi
        
        # 执行迁移
        if ! execute_migration "$migration_file" "$migration_version" "$description"; then
            migration_success=false
            break
        fi
        
        # 验证迁移结果
        if ! verify_migration "$migration_version"; then
            migration_success=false
            break
        fi
        
        log_success "迁移 $migration_version 完成"
    done
    
    if [ "$migration_success" = true ]; then
        log_success "所有迁移执行成功"
        log_success "当前版本: $target_version"
    else
        log_error "迁移执行失败"
        
        # 提供恢复选项
        echo -n "是否要从备份恢复? (y/N): "
        read -r restore_confirm
        if [[ "$restore_confirm" =~ ^[Yy]$ ]]; then
            restore_from_backup "$backup_file"
        fi
        
        return 1
    fi
}

# 从备份恢复
restore_from_backup() {
    local backup_file="$1"
    
    log_header "从备份恢复"
    
    if [ ! -f "$backup_file" ]; then
        log_error "备份文件不存在: $backup_file"
        return 1
    fi
    
    log_info "恢复备份: $backup_file"
    
    # 停止相关服务
    log_info "停止相关服务..."
    docker-compose stop n8n || true
    
    # 删除现有数据库
    log_info "删除现有数据库..."
    docker-compose exec -T postgres psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" &>/dev/null || true
    
    # 创建新数据库
    log_info "创建新数据库..."
    docker-compose exec -T postgres psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" &>/dev/null
    
    # 恢复数据
    log_info "恢复数据..."
    if [[ "$backup_file" == *.gz ]]; then
        if gunzip -c "$backup_file" | docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" &>/dev/null; then
            log_success "数据恢复成功"
        else
            log_error "数据恢复失败"
            return 1
        fi
    else
        if docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" < "$backup_file" &>/dev/null; then
            log_success "数据恢复成功"
        else
            log_error "数据恢复失败"
            return 1
        fi
    fi
    
    # 启动服务
    log_info "启动相关服务..."
    docker-compose start n8n
    
    log_success "备份恢复完成"
}

# 列出迁移历史
list_migration_history() {
    log_header "迁移历史"
    
    if ! check_database_connection; then
        return 1
    fi
    
    local history_query="
    SELECT 
        version,
        description,
        applied_at,
        applied_by,
        execution_time
    FROM migration_version 
    ORDER BY applied_at DESC 
    LIMIT 20;
    "
    
    echo ""
    echo -e "${CYAN}版本${NC}        ${CYAN}描述${NC}                    ${CYAN}应用时间${NC}              ${CYAN}执行时间${NC}"
    echo "--------------------------------------------------------------------"
    
    docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -c "$history_query" 2>/dev/null | \
    grep -E "^\s*[0-9]" | while read -r line; do
        echo "$line"
    done
    
    echo ""
}

# 检查迁移状态
check_migration_status() {
    log_header "迁移状态检查"
    
    if ! check_database_connection; then
        return 1
    fi
    
    # 获取当前版本
    local current_version
    if current_version=$(get_current_version); then
        echo -e "${CYAN}当前版本:${NC} $current_version"
    else
        echo -e "${RED}无法获取当前版本${NC}"
        return 1
    fi
    
    # 获取可用迁移
    local available_migrations
    if available_migrations=$(get_available_migrations); then
        local migration_count=$(echo "$available_migrations" | wc -l)
        echo -e "${CYAN}可用迁移:${NC} $migration_count 个"
        
        # 检查是否有待执行的迁移
        local pending_migrations=0
        
        while IFS= read -r migration_file; do
            if [ -n "$migration_file" ]; then
                local migration_version
                if migration_version=$(parse_migration_version "$migration_file"); then
                    local cmp=$(version_compare "$current_version" "$migration_version")
                    if [ "$cmp" -lt 0 ]; then
                        pending_migrations=$((pending_migrations + 1))
                    fi
                fi
            fi
        done <<< "$available_migrations"
        
        if [ $pending_migrations -gt 0 ]; then
            echo -e "${YELLOW}待执行迁移:${NC} $pending_migrations 个"
        else
            echo -e "${GREEN}所有迁移已执行${NC}"
        fi
    else
        echo -e "${RED}无法获取可用迁移${NC}"
    fi
    
    # 检查数据库健康状态
    echo ""
    echo -e "${CYAN}数据库健康状态:${NC}"
    
    local table_count_query="SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
    local table_count
    
    if table_count=$(docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "$table_count_query" 2>/dev/null | tr -d ' \n'); then
        echo "  表数量: $table_count"
    else
        echo "  表数量: 无法获取"
    fi
    
    local db_size_query="SELECT pg_size_pretty(pg_database_size('$DB_NAME'));"
    local db_size
    
    if db_size=$(docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "$db_size_query" 2>/dev/null | tr -d ' \n'); then
        echo "  数据库大小: $db_size"
    else
        echo "  数据库大小: 无法获取"
    fi
    
    echo ""
}

# 生成迁移模板
generate_migration_template() {
    local description="$1"
    
    if [ -z "$description" ]; then
        log_error "请提供迁移描述"
        return 1
    fi
    
    log_header "生成迁移模板"
    
    # 获取下一个版本号
    local current_version
    if current_version=$(get_current_version); then
        local major=$(echo "$current_version" | cut -d'.' -f1)
        local minor=$(echo "$current_version" | cut -d'.' -f2)
        local patch=$(echo "$current_version" | cut -d'.' -f3)
        
        # 递增补丁版本
        patch=$((patch + 1))
        local next_version="$major.$minor.$patch"
    else
        local next_version="1.0.0"
    fi
    
    # 生成文件名
    local safe_description=$(echo "$description" | tr ' ' '_' | tr -cd '[:alnum:]_')
    local migration_file="$MIGRATION_DIR/V${next_version}__${safe_description}.sql"
    
    # 创建迁移文件
    cat > "$migration_file" << EOF
-- Migration: $description
-- Version: $next_version
-- Created: $(date '+%Y-%m-%d %H:%M:%S')

-- 在这里添加你的迁移SQL语句

-- 示例:
-- CREATE TABLE example_table (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- ALTER TABLE existing_table ADD COLUMN new_column VARCHAR(100);

-- INSERT INTO configuration (key, value) VALUES ('new_setting', 'default_value');

-- 注意: 请确保所有SQL语句都是幂等的，可以安全地重复执行
EOF
    
    log_success "迁移模板已创建: $migration_file"
    log_info "版本: $next_version"
    log_info "描述: $description"
    
    echo "$migration_file"
}

# 验证所有迁移
validate_all_migrations() {
    log_header "验证所有迁移"
    
    local available_migrations
    if ! available_migrations=$(get_available_migrations); then
        log_error "无法获取可用迁移"
        return 1
    fi
    
    local validation_success=true
    local migration_count=0
    
    while IFS= read -r migration_file; do
        if [ -n "$migration_file" ]; then
            migration_count=$((migration_count + 1))
            
            if ! validate_migration_file "$migration_file"; then
                validation_success=false
            fi
        fi
    done <<< "$available_migrations"
    
    if [ "$validation_success" = true ]; then
        log_success "所有 $migration_count 个迁移文件验证通过"
    else
        log_error "部分迁移文件验证失败"
        return 1
    fi
}

# 显示帮助
show_help() {
    echo "N8N企业级自动化工作流平台数据迁移脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "迁移命令:"
    echo "  migrate <版本>           迁移到指定版本"
    echo "  migrate-latest           迁移到最新版本"
    echo "  status                   检查迁移状态"
    echo "  history                  显示迁移历史"
    echo "  validate                 验证所有迁移文件"
    echo ""
    echo "管理命令:"
    echo "  generate <描述>          生成迁移模板"
    echo "  restore <备份文件>       从备份恢复"
    echo "  rollback <版本>          回滚到指定版本"
    echo ""
    echo "选项:"
    echo "  --timeout <秒数>         迁移超时时间 (默认3600秒)"
    echo "  --batch-size <数量>      批处理大小 (默认1000)"
    echo "  --parallel-jobs <数量>   并行任务数 (默认4)"
    echo "  --no-backup              跳过备份创建"
    echo "  --no-verify              跳过迁移验证"
    echo "  -h, --help               显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 status                           # 检查迁移状态"
    echo "  $0 migrate 1.2.3                   # 迁移到版本1.2.3"
    echo "  $0 migrate-latest                   # 迁移到最新版本"
    echo "  $0 generate \"添加用户表\"            # 生成迁移模板"
    echo "  $0 validate                         # 验证所有迁移"
    echo "  $0 history                          # 显示迁移历史"
    echo ""
}

# 主函数
main() {
    # 创建必要目录
    create_directories
    
    # 解析命令行参数
    local command=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            migrate|migrate-latest|status|history|validate|generate|restore|rollback)
                command="$1"
                shift
                break
                ;;
            --timeout)
                MIGRATION_TIMEOUT="$2"
                shift 2
                ;;
            --batch-size)
                MIGRATION_BATCH_SIZE="$2"
                shift 2
                ;;
            --parallel-jobs)
                MIGRATION_PARALLEL_JOBS="$2"
                shift 2
                ;;
            --no-backup)
                MIGRATION_CREATE_BACKUP=false
                shift
                ;;
            --no-verify)
                MIGRATION_VERIFY_DATA=false
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 如果没有指定命令，显示帮助
    if [ -z "$command" ]; then
        show_help
        exit 1
    fi
    
    # 执行命令
    case "$command" in
        "migrate")
            if [ -z "$1" ]; then
                log_error "请指定目标版本"
                exit 1
            fi
            migrate_to_version "$1"
            ;;
        "migrate-latest")
            # 获取最新版本
            local available_migrations
            if available_migrations=$(get_available_migrations); then
                local latest_version=""
                
                while IFS= read -r migration_file; do
                    if [ -n "$migration_file" ]; then
                        local migration_version
                        if migration_version=$(parse_migration_version "$migration_file"); then
                            if [ -z "$latest_version" ] || [ "$(version_compare "$migration_version" "$latest_version")" -gt 0 ]; then
                                latest_version="$migration_version"
                            fi
                        fi
                    fi
                done <<< "$available_migrations"
                
                if [ -n "$latest_version" ]; then
                    migrate_to_version "$latest_version"
                else
                    log_error "未找到可用的迁移"
                    exit 1
                fi
            else
                log_error "无法获取可用迁移"
                exit 1
            fi
            ;;
        "status")
            check_migration_status
            ;;
        "history")
            list_migration_history
            ;;
        "validate")
            validate_all_migrations
            ;;
        "generate")
            if [ -z "$1" ]; then
                log_error "请提供迁移描述"
                exit 1
            fi
            generate_migration_template "$1"
            ;;
        "restore")
            if [ -z "$1" ]; then
                log_error "请指定备份文件"
                exit 1
            fi
            restore_from_backup "$1"
            ;;
        "rollback")
            log_error "回滚功能尚未实现"
            exit 1
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi