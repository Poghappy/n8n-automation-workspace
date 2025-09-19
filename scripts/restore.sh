#!/bin/bash

# N8N企业级自动化工作流平台 - 恢复脚本
# 从备份文件恢复数据和配置

set -e  # 遇到错误立即退出
set -u  # 使用未定义变量时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
BACKUP_DIR="backups"
RESTORE_TEMP_DIR="restore_temp"

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

# 显示可用备份
list_available_backups() {
    log_info "可用的备份文件:"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "备份目录不存在: $BACKUP_DIR"
        exit 1
    fi
    
    local backups=($(find "$BACKUP_DIR" -name "n8n_backup_*.tar.gz" -type f | sort -r))
    
    if [ ${#backups[@]} -eq 0 ]; then
        log_error "未找到备份文件"
        exit 1
    fi
    
    for i in "${!backups[@]}"; do
        local backup_file="${backups[$i]}"
        local backup_name=$(basename "$backup_file" .tar.gz)
        local backup_date=$(echo "$backup_name" | sed 's/n8n_backup_//' | sed 's/_/ /')
        local backup_size=$(du -h "$backup_file" | cut -f1)
        
        echo "  $((i+1)). $backup_name ($backup_size) - $backup_date"
    done
    
    echo "${backups[@]}"
}

# 选择备份文件
select_backup() {
    local backups_array=($1)
    
    echo ""
    read -p "请选择要恢复的备份 (输入序号): " selection
    
    if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 1 ] || [ "$selection" -gt ${#backups_array[@]} ]; then
        log_error "无效的选择"
        exit 1
    fi
    
    local selected_backup="${backups_array[$((selection-1))]}"
    echo "$selected_backup"
}

# 确认恢复操作
confirm_restore() {
    local backup_file="$1"
    local backup_name=$(basename "$backup_file" .tar.gz)
    
    log_warning "警告: 恢复操作将覆盖现有数据!"
    log_info "选择的备份: $backup_name"
    
    echo ""
    read -p "确认要继续恢复吗? (yes/no): " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        log_info "恢复操作已取消"
        exit 0
    fi
}

# 停止服务
stop_services() {
    log_info "停止Docker服务..."
    
    if docker-compose ps | grep -q "Up"; then
        docker-compose down
        log_success "Docker服务已停止"
    else
        log_info "Docker服务未运行"
    fi
}

# 解压备份文件
extract_backup() {
    local backup_file="$1"
    
    log_info "解压备份文件..."
    
    # 清理临时目录
    if [ -d "$RESTORE_TEMP_DIR" ]; then
        rm -rf "$RESTORE_TEMP_DIR"
    fi
    
    mkdir -p "$RESTORE_TEMP_DIR"
    
    # 解压备份文件
    tar -xzf "$backup_file" -C "$RESTORE_TEMP_DIR"
    
    local extracted_dir=$(find "$RESTORE_TEMP_DIR" -maxdepth 1 -type d -name "n8n_backup_*" | head -1)
    
    if [ -z "$extracted_dir" ]; then
        log_error "备份文件格式错误"
        exit 1
    fi
    
    log_success "备份文件解压完成"
    echo "$extracted_dir"
}

# 验证备份内容
verify_backup_content() {
    local backup_dir="$1"
    
    log_info "验证备份内容..."
    
    # 检查必要文件
    local required_files=(
        "backup_manifest.txt"
        "databases_*.tar.gz"
        "env_*.backup"
        "docker_compose_*.yml"
    )
    
    for pattern in "${required_files[@]}"; do
        if ! ls "$backup_dir"/$pattern 1> /dev/null 2>&1; then
            log_warning "缺少备份文件: $pattern"
        fi
    done
    
    # 显示备份清单
    if [ -f "$backup_dir/backup_manifest.txt" ]; then
        log_info "备份清单内容:"
        cat "$backup_dir/backup_manifest.txt"
    fi
    
    log_success "备份内容验证完成"
}

# 恢复配置文件
restore_configurations() {
    local backup_dir="$1"
    
    log_info "恢复配置文件..."
    
    # 备份当前配置
    if [ -f ".env" ]; then
        cp .env ".env.backup.$(date +%Y%m%d_%H%M%S)"
        log_info "当前.env文件已备份"
    fi
    
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml "docker-compose.yml.backup.$(date +%Y%m%d_%H%M%S)"
        log_info "当前docker-compose.yml文件已备份"
    fi
    
    # 恢复环境配置
    local env_backup=$(find "$backup_dir" -name "env_*.backup" | head -1)
    if [ -n "$env_backup" ]; then
        cp "$env_backup" .env
        log_success "环境配置文件已恢复"
    fi
    
    # 恢复Docker配置
    local docker_compose_backup=$(find "$backup_dir" -name "docker_compose_*.yml" | head -1)
    if [ -n "$docker_compose_backup" ]; then
        cp "$docker_compose_backup" docker-compose.yml
        log_success "Docker Compose配置已恢复"
    fi
    
    # 恢复初始化脚本
    local init_scripts_backup=$(find "$backup_dir" -name "init_scripts_*.tar.gz" | head -1)
    if [ -n "$init_scripts_backup" ]; then
        tar -xzf "$init_scripts_backup" -C .
        log_success "初始化脚本已恢复"
    fi
    
    # 恢复其他脚本
    local scripts_backup=$(find "$backup_dir" -name "scripts_*.tar.gz" | head -1)
    if [ -n "$scripts_backup" ]; then
        tar -xzf "$scripts_backup" -C .
        log_success "脚本文件已恢复"
    fi
}

# 启动数据库服务
start_database_services() {
    log_info "启动数据库服务..."
    
    # 仅启动数据库服务
    docker-compose up -d postgres redis
    
    # 等待数据库服务就绪
    log_info "等待数据库服务就绪..."
    sleep 10
    
    # 检查PostgreSQL连接
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
            log_success "PostgreSQL服务就绪"
            break
        fi
        
        log_info "等待PostgreSQL服务... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "PostgreSQL服务启动超时"
        exit 1
    fi
    
    # 检查Redis连接
    if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
        log_success "Redis服务就绪"
    else
        log_error "Redis服务连接失败"
        exit 1
    fi
}

# 恢复数据库
restore_databases() {
    local backup_dir="$1"
    
    log_info "恢复数据库..."
    
    # 查找数据库备份文件
    local db_backup=$(find "$backup_dir" -name "databases_*.tar.gz" | head -1)
    
    if [ -z "$db_backup" ]; then
        log_error "未找到数据库备份文件"
        exit 1
    fi
    
    # 解压数据库备份
    local temp_db_dir="${RESTORE_TEMP_DIR}/databases"
    mkdir -p "$temp_db_dir"
    tar -xzf "$db_backup" -C "$temp_db_dir"
    
    # 恢复各个数据库
    local databases=("n8n" "ai_agents" "huoniao")
    
    for db in "${databases[@]}"; do
        local db_file="${temp_db_dir}/${db}_backup.sql"
        
        if [ -f "$db_file" ]; then
            log_info "恢复数据库: $db"
            
            # 删除现有数据库（如果存在）
            docker-compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS $db;" || true
            
            # 创建数据库
            docker-compose exec postgres psql -U postgres -c "CREATE DATABASE $db;"
            
            # 恢复数据
            docker-compose exec -T postgres psql -U postgres -d "$db" < "$db_file"
            
            log_success "数据库 $db 恢复完成"
        else
            log_warning "未找到数据库 $db 的备份文件"
        fi
    done
}

# 恢复Redis数据
restore_redis() {
    local backup_dir="$1"
    
    log_info "恢复Redis数据..."
    
    # 查找Redis备份文件
    local redis_backup=$(find "$backup_dir" -name "redis_*.rdb" | head -1)
    
    if [ -n "$redis_backup" ]; then
        # 停止Redis服务
        docker-compose stop redis
        
        # 复制备份文件到Redis数据目录
        docker cp "$redis_backup" $(docker-compose ps -q redis):/data/dump.rdb
        
        # 重启Redis服务
        docker-compose start redis
        
        # 等待Redis服务就绪
        sleep 5
        
        if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
            log_success "Redis数据恢复完成"
        else
            log_error "Redis服务启动失败"
            exit 1
        fi
    else
        log_warning "未找到Redis备份文件"
    fi
}

# 恢复N8N数据
restore_n8n_data() {
    local backup_dir="$1"
    
    log_info "恢复N8N数据..."
    
    # 恢复N8N数据目录
    local n8n_data_backup=$(find "$backup_dir" -name "n8n_data_*.tar.gz" | head -1)
    if [ -n "$n8n_data_backup" ]; then
        # 备份当前数据
        if [ -d "data/n8n" ]; then
            mv data/n8n "data/n8n.backup.$(date +%Y%m%d_%H%M%S)"
            log_info "当前N8N数据已备份"
        fi
        
        # 恢复数据
        mkdir -p data
        tar -xzf "$n8n_data_backup" -C data/
        log_success "N8N数据目录恢复完成"
    fi
    
    # 恢复N8N日志
    local n8n_logs_backup=$(find "$backup_dir" -name "n8n_logs_*.tar.gz" | head -1)
    if [ -n "$n8n_logs_backup" ]; then
        mkdir -p logs
        tar -xzf "$n8n_logs_backup" -C logs/
        log_success "N8N日志恢复完成"
    fi
}

# 恢复AI智能体数据
restore_ai_agent_data() {
    local backup_dir="$1"
    
    log_info "恢复AI智能体数据..."
    
    # 恢复源代码
    local ai_src_backup=$(find "$backup_dir" -name "ai_agent_src_*.tar.gz" | head -1)
    if [ -n "$ai_src_backup" ]; then
        # 备份当前源代码
        if [ -d "src" ]; then
            mv src "src.backup.$(date +%Y%m%d_%H%M%S)"
            log_info "当前AI智能体源代码已备份"
        fi
        
        # 恢复源代码
        tar -xzf "$ai_src_backup" -C .
        log_success "AI智能体源代码恢复完成"
    fi
    
    # 恢复配置文件
    local ai_settings_backup=$(find "$backup_dir" -name "ai_agent_settings_*.py" | head -1)
    if [ -n "$ai_settings_backup" ]; then
        mkdir -p src/config
        cp "$ai_settings_backup" src/config/settings.py
        log_success "AI智能体配置恢复完成"
    fi
    
    # 恢复日志
    local ai_logs_backup=$(find "$backup_dir" -name "ai_agent_logs_*.tar.gz" | head -1)
    if [ -n "$ai_logs_backup" ]; then
        mkdir -p logs
        tar -xzf "$ai_logs_backup" -C logs/
        log_success "AI智能体日志恢复完成"
    fi
}

# 恢复火鸟门户数据
restore_huoniao_data() {
    local backup_dir="$1"
    
    log_info "恢复火鸟门户数据..."
    
    # 恢复火鸟门户日志
    local huoniao_logs_backup=$(find "$backup_dir" -name "huoniao_logs_*.tar.gz" | head -1)
    if [ -n "$huoniao_logs_backup" ]; then
        mkdir -p logs
        tar -xzf "$huoniao_logs_backup" -C logs/
        log_success "火鸟门户日志恢复完成"
    fi
}

# 恢复文档
restore_documentation() {
    local backup_dir="$1"
    
    log_info "恢复文档..."
    
    local docs_backup=$(find "$backup_dir" -name "docs_*.tar.gz" | head -1)
    if [ -n "$docs_backup" ]; then
        # 备份当前文档
        if [ -d "docs" ]; then
            mv docs "docs.backup.$(date +%Y%m%d_%H%M%S)"
            log_info "当前文档已备份"
        fi
        
        # 恢复文档
        tar -xzf "$docs_backup" -C .
        log_success "文档恢复完成"
    else
        log_warning "未找到文档备份"
    fi
}

# 启动所有服务
start_all_services() {
    log_info "启动所有服务..."
    
    docker-compose up -d
    
    # 等待服务启动
    sleep 15
    
    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        log_success "所有服务启动完成"
        
        # 显示服务状态
        log_info "服务状态:"
        docker-compose ps
    else
        log_error "部分服务启动失败"
        docker-compose ps
        exit 1
    fi
}

# 验证恢复结果
verify_restore() {
    log_info "验证恢复结果..."
    
    # 检查数据库连接
    if docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
        log_success "PostgreSQL连接正常"
    else
        log_error "PostgreSQL连接失败"
    fi
    
    # 检查Redis连接
    if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
        log_success "Redis连接正常"
    else
        log_error "Redis连接失败"
    fi
    
    # 检查N8N服务
    local n8n_container=$(docker-compose ps -q n8n)
    if [ -n "$n8n_container" ] && docker inspect "$n8n_container" | grep -q '"Status": "running"'; then
        log_success "N8N服务运行正常"
    else
        log_warning "N8N服务状态异常"
    fi
    
    # 检查AI智能体服务
    local ai_agent_container=$(docker-compose ps -q ai-agent-system)
    if [ -n "$ai_agent_container" ] && docker inspect "$ai_agent_container" | grep -q '"Status": "running"'; then
        log_success "AI智能体服务运行正常"
    else
        log_warning "AI智能体服务状态异常"
    fi
    
    log_success "恢复验证完成"
}

# 清理临时文件
cleanup_temp_files() {
    log_info "清理临时文件..."
    
    if [ -d "$RESTORE_TEMP_DIR" ]; then
        rm -rf "$RESTORE_TEMP_DIR"
        log_success "临时文件清理完成"
    fi
}

# 显示恢复完成信息
show_restore_completion() {
    log_success "恢复操作完成!"
    
    echo ""
    log_info "恢复摘要:"
    echo "  • 配置文件: 已恢复"
    echo "  • 数据库: 已恢复"
    echo "  • Redis数据: 已恢复"
    echo "  • N8N数据: 已恢复"
    echo "  • AI智能体数据: 已恢复"
    echo "  • 火鸟门户数据: 已恢复"
    echo "  • 文档: 已恢复"
    
    echo ""
    log_info "访问信息:"
    echo "  • N8N界面: http://localhost:5678"
    echo "  • AI智能体API: http://localhost:8000"
    echo "  • 火鸟门户: http://localhost:3000"
    
    echo ""
    log_info "注意事项:"
    echo "  • 请检查服务日志确保一切正常"
    echo "  • 建议重新生成加密密钥和JWT密钥"
    echo "  • 检查环境变量配置是否符合当前环境"
}

# 显示使用帮助
show_help() {
    echo "N8N企业级自动化工作流平台恢复脚本"
    echo ""
    echo "用法: $0 [选项] [备份文件]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -l, --list     列出可用备份"
    echo "  -f, --file     指定备份文件路径"
    echo "  --no-confirm   跳过确认提示"
    echo ""
    echo "示例:"
    echo "  $0                                    # 交互式选择备份恢复"
    echo "  $0 -l                                 # 列出可用备份"
    echo "  $0 -f backups/n8n_backup_20240101_120000.tar.gz  # 指定备份文件"
    echo ""
}

# 主函数
main() {
    local backup_file=""
    local list_only=false
    local no_confirm=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -l|--list)
                list_only=true
                shift
                ;;
            -f|--file)
                backup_file="$2"
                shift 2
                ;;
            --no-confirm)
                no_confirm=true
                shift
                ;;
            *)
                if [ -z "$backup_file" ] && [ -f "$1" ]; then
                    backup_file="$1"
                else
                    log_error "未知参数: $1"
                    show_help
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # 仅列出备份
    if [ "$list_only" = true ]; then
        list_available_backups > /dev/null
        exit 0
    fi
    
    log_info "开始N8N企业级自动化工作流平台恢复..."
    
    # 选择备份文件
    if [ -z "$backup_file" ]; then
        local available_backups=$(list_available_backups)
        backup_file=$(select_backup "$available_backups")
    fi
    
    # 验证备份文件存在
    if [ ! -f "$backup_file" ]; then
        log_error "备份文件不存在: $backup_file"
        exit 1
    fi
    
    # 确认恢复操作
    if [ "$no_confirm" = false ]; then
        confirm_restore "$backup_file"
    fi
    
    # 执行恢复流程
    stop_services
    local backup_dir=$(extract_backup "$backup_file")
    verify_backup_content "$backup_dir"
    restore_configurations "$backup_dir"
    start_database_services
    restore_databases "$backup_dir"
    restore_redis "$backup_dir"
    restore_n8n_data "$backup_dir"
    restore_ai_agent_data "$backup_dir"
    restore_huoniao_data "$backup_dir"
    restore_documentation "$backup_dir"
    start_all_services
    verify_restore
    cleanup_temp_files
    show_restore_completion
    
    log_success "恢复完成!"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi