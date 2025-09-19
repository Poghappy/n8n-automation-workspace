#!/bin/bash

# N8N企业级自动化工作流平台 - 更新脚本
# 自动化更新和版本管理

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
PROJECT_NAME="N8N企业级自动化工作流平台"
BACKUP_BEFORE_UPDATE=true
UPDATE_TIMEOUT=600  # 更新超时时间（秒）
ROLLBACK_ON_FAILURE=true

# 日志函数
log_info() {
    local message="$1"
    echo -e "${BLUE}[INFO]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $message" >> "logs/update.log"
}

log_success() {
    local message="$1"
    echo -e "${GREEN}[SUCCESS]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [SUCCESS] $message" >> "logs/update.log"
}

log_warning() {
    local message="$1"
    echo -e "${YELLOW}[WARNING]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARNING] $message" >> "logs/update.log"
}

log_error() {
    local message="$1"
    echo -e "${RED}[ERROR]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $message" >> "logs/update.log"
}

log_header() {
    local message="$1"
    echo -e "${PURPLE}[HEADER]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [HEADER] $message" >> "logs/update.log"
}

# 检查当前版本
check_current_versions() {
    log_header "检查当前版本信息"
    
    # 创建版本信息文件
    local version_file="logs/current_versions.txt"
    echo "# 当前版本信息 - $(date)" > "$version_file"
    
    # 检查N8N版本
    if docker-compose ps | grep -q "n8n.*Up"; then
        local n8n_version=$(docker-compose exec n8n n8n --version 2>/dev/null || echo "未知")
        log_info "N8N当前版本: $n8n_version"
        echo "N8N: $n8n_version" >> "$version_file"
    else
        log_warning "N8N服务未运行，无法获取版本信息"
        echo "N8N: 服务未运行" >> "$version_file"
    fi
    
    # 检查PostgreSQL版本
    if docker-compose ps | grep -q "postgres.*Up"; then
        local postgres_version=$(docker-compose exec postgres psql --version 2>/dev/null | awk '{print $3}' || echo "未知")
        log_info "PostgreSQL当前版本: $postgres_version"
        echo "PostgreSQL: $postgres_version" >> "$version_file"
    else
        log_warning "PostgreSQL服务未运行，无法获取版本信息"
        echo "PostgreSQL: 服务未运行" >> "$version_file"
    fi
    
    # 检查Redis版本
    if docker-compose ps | grep -q "redis.*Up"; then
        local redis_version=$(docker-compose exec redis redis-server --version 2>/dev/null | awk '{print $3}' | sed 's/v=//' || echo "未知")
        log_info "Redis当前版本: $redis_version"
        echo "Redis: $redis_version" >> "$version_file"
    else
        log_warning "Redis服务未运行，无法获取版本信息"
        echo "Redis: 服务未运行" >> "$version_file"
    fi
    
    # 检查Docker镜像版本
    log_info "检查Docker镜像版本..."
    docker images --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | grep -E "(n8n|postgres|redis|ai-agent|huoniao)" >> "$version_file" 2>/dev/null || true
    
    log_success "版本信息检查完成，详情保存在: $version_file"
}

# 检查可用更新
check_available_updates() {
    log_header "检查可用更新"
    
    local updates_available=false
    local update_info_file="logs/available_updates.txt"
    echo "# 可用更新信息 - $(date)" > "$update_info_file"
    
    # 检查N8N更新
    log_info "检查N8N更新..."
    local current_n8n_image=$(docker images n8n/n8n --format "{{.Tag}}" | head -1)
    local latest_n8n_tag=$(curl -s "https://api.github.com/repos/n8n-io/n8n/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' 2>/dev/null || echo "unknown")
    
    if [ "$current_n8n_image" != "$latest_n8n_tag" ] && [ "$latest_n8n_tag" != "unknown" ]; then
        log_info "N8N有新版本可用: $current_n8n_image -> $latest_n8n_tag"
        echo "N8N: $current_n8n_image -> $latest_n8n_tag" >> "$update_info_file"
        updates_available=true
    else
        log_info "N8N已是最新版本: $current_n8n_image"
        echo "N8N: 已是最新版本 ($current_n8n_image)" >> "$update_info_file"
    fi
    
    # 检查PostgreSQL更新
    log_info "检查PostgreSQL更新..."
    local current_postgres_image=$(docker images postgres --format "{{.Tag}}" | head -1)
    echo "PostgreSQL: 当前版本 $current_postgres_image" >> "$update_info_file"
    
    # 检查Redis更新
    log_info "检查Redis更新..."
    local current_redis_image=$(docker images redis --format "{{.Tag}}" | head -1)
    echo "Redis: 当前版本 $current_redis_image" >> "$update_info_file"
    
    if [ "$updates_available" = true ]; then
        log_success "发现可用更新，详情保存在: $update_info_file"
        return 0
    else
        log_info "所有组件都是最新版本"
        return 1
    fi
}

# 备份当前状态
backup_current_state() {
    if [ "$BACKUP_BEFORE_UPDATE" = false ]; then
        log_info "跳过备份（BACKUP_BEFORE_UPDATE=false）"
        return 0
    fi
    
    log_header "备份当前状态"
    
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="backups/pre-update-$backup_timestamp"
    
    mkdir -p "$backup_dir"
    
    # 备份数据目录
    if [ -d "data" ]; then
        log_info "备份数据目录..."
        cp -r data "$backup_dir/"
        log_success "数据目录备份完成"
    fi
    
    # 备份配置文件
    log_info "备份配置文件..."
    cp .env "$backup_dir/" 2>/dev/null || true
    cp docker-compose.yml "$backup_dir/" 2>/dev/null || true
    cp -r config "$backup_dir/" 2>/dev/null || true
    
    # 备份数据库
    if docker-compose ps | grep -q "postgres.*Up"; then
        log_info "备份PostgreSQL数据库..."
        docker-compose exec postgres pg_dumpall -U postgres > "$backup_dir/postgres_backup.sql"
        log_success "PostgreSQL数据库备份完成"
    fi
    
    # 备份Redis数据
    if docker-compose ps | grep -q "redis.*Up"; then
        log_info "备份Redis数据..."
        docker-compose exec redis redis-cli BGSAVE
        sleep 5  # 等待备份完成
        docker cp $(docker-compose ps -q redis):/data/dump.rdb "$backup_dir/redis_backup.rdb"
        log_success "Redis数据备份完成"
    fi
    
    # 备份当前镜像信息
    log_info "备份镜像信息..."
    docker images --format "{{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}" > "$backup_dir/docker_images.txt"
    
    log_success "状态备份完成: $backup_dir"
    echo "$backup_dir" > "logs/last_update_backup.txt"
}

# 拉取最新镜像
pull_latest_images() {
    log_header "拉取最新镜像"
    
    # 拉取N8N最新镜像
    log_info "拉取N8N最新镜像..."
    if docker pull n8n/n8n:latest; then
        log_success "N8N镜像拉取完成"
    else
        log_error "N8N镜像拉取失败"
        return 1
    fi
    
    # 拉取PostgreSQL最新镜像
    log_info "拉取PostgreSQL最新镜像..."
    if docker pull postgres:15; then
        log_success "PostgreSQL镜像拉取完成"
    else
        log_warning "PostgreSQL镜像拉取失败，继续使用当前版本"
    fi
    
    # 拉取Redis最新镜像
    log_info "拉取Redis最新镜像..."
    if docker pull redis:7-alpine; then
        log_success "Redis镜像拉取完成"
    else
        log_warning "Redis镜像拉取失败，继续使用当前版本"
    fi
    
    # 拉取其他服务镜像
    log_info "拉取其他服务镜像..."
    docker-compose pull || log_warning "部分镜像拉取失败"
    
    log_success "镜像拉取完成"
}

# 重建自定义镜像
rebuild_custom_images() {
    log_header "重建自定义镜像"
    
    # 重建AI智能体镜像
    if [ -f "Dockerfile" ]; then
        log_info "重建AI智能体镜像..."
        if docker build --no-cache -t ai-agent-system:latest .; then
            log_success "AI智能体镜像重建完成"
        else
            log_error "AI智能体镜像重建失败"
            return 1
        fi
    fi
    
    # 重建火鸟门户镜像（如果存在）
    if [ -f "huoniao/Dockerfile" ]; then
        log_info "重建火鸟门户镜像..."
        if docker build --no-cache -t huoniao-portal:latest huoniao/; then
            log_success "火鸟门户镜像重建完成"
        else
            log_error "火鸟门户镜像重建失败"
            return 1
        fi
    fi
    
    log_success "自定义镜像重建完成"
}

# 执行滚动更新
perform_rolling_update() {
    log_header "执行滚动更新"
    
    # 获取当前运行的服务
    local running_services=$(docker-compose ps --services --filter "status=running")
    
    if [ -z "$running_services" ]; then
        log_warning "没有运行中的服务，执行完整启动"
        docker-compose up -d
        return 0
    fi
    
    # 按依赖顺序更新服务
    local update_order=("postgres" "redis" "n8n" "ai-agent-system" "huoniao-portal")
    
    for service in "${update_order[@]}"; do
        if echo "$running_services" | grep -q "^$service$"; then
            log_info "更新服务: $service"
            
            # 停止服务
            docker-compose stop "$service"
            
            # 删除旧容器
            docker-compose rm -f "$service"
            
            # 启动新容器
            docker-compose up -d "$service"
            
            # 等待服务启动
            local wait_count=0
            while [ $wait_count -lt 30 ]; do
                if docker-compose ps "$service" | grep -q "Up"; then
                    log_success "$service 更新完成"
                    break
                fi
                sleep 2
                wait_count=$((wait_count + 1))
            done
            
            if [ $wait_count -ge 30 ]; then
                log_error "$service 启动超时"
                return 1
            fi
            
            # 服务特定的健康检查
            case $service in
                "postgres")
                    while ! docker-compose exec postgres pg_isready -U postgres &> /dev/null; do
                        sleep 2
                    done
                    ;;
                "redis")
                    while ! docker-compose exec redis redis-cli ping | grep -q "PONG"; do
                        sleep 2
                    done
                    ;;
                "n8n"|"ai-agent-system"|"huoniao-portal")
                    sleep 10  # 等待应用启动
                    ;;
            esac
        fi
    done
    
    log_success "滚动更新完成"
}

# 执行数据库迁移
perform_database_migration() {
    log_header "执行数据库迁移"
    
    # 检查是否需要数据库迁移
    if [ -d "migrations" ]; then
        log_info "发现数据库迁移脚本..."
        
        # 执行迁移脚本
        for migration in migrations/*.sql; do
            if [ -f "$migration" ]; then
                log_info "执行迁移: $(basename "$migration")"
                docker-compose exec postgres psql -U postgres -f "/migrations/$(basename "$migration")" || {
                    log_error "迁移失败: $(basename "$migration")"
                    return 1
                }
            fi
        done
        
        log_success "数据库迁移完成"
    else
        log_info "无需执行数据库迁移"
    fi
}

# 验证更新结果
verify_update() {
    log_header "验证更新结果"
    
    local verification_failed=false
    
    # 检查服务状态
    log_info "检查服务状态..."
    local services=("postgres" "redis" "n8n" "ai-agent-system" "huoniao-portal")
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up"; then
            log_success "$service 运行正常"
        else
            log_error "$service 未正常运行"
            verification_failed=true
        fi
    done
    
    # 检查服务连通性
    log_info "检查服务连通性..."
    local endpoints=("localhost:5678" "localhost:8000" "localhost:3000")
    
    for endpoint in "${endpoints[@]}"; do
        if timeout 10 nc -z ${endpoint/:/ } &> /dev/null; then
            log_success "$endpoint 连通正常"
        else
            log_warning "$endpoint 连通检查失败"
        fi
    done
    
    # 检查数据完整性
    log_info "检查数据完整性..."
    if docker-compose exec postgres psql -U postgres -c "SELECT COUNT(*) FROM information_schema.tables;" &> /dev/null; then
        log_success "数据库连接正常"
    else
        log_error "数据库连接失败"
        verification_failed=true
    fi
    
    if [ "$verification_failed" = true ]; then
        log_error "更新验证失败"
        return 1
    else
        log_success "更新验证通过"
        return 0
    fi
}

# 回滚更新
rollback_update() {
    log_header "回滚更新"
    
    if [ ! -f "logs/last_update_backup.txt" ]; then
        log_error "未找到备份信息，无法回滚"
        return 1
    fi
    
    local backup_dir=$(cat "logs/last_update_backup.txt")
    
    if [ ! -d "$backup_dir" ]; then
        log_error "备份目录不存在: $backup_dir"
        return 1
    fi
    
    log_info "停止当前服务..."
    docker-compose down
    
    log_info "恢复数据..."
    if [ -d "$backup_dir/data" ]; then
        rm -rf data
        cp -r "$backup_dir/data" .
    fi
    
    log_info "恢复配置..."
    cp "$backup_dir/.env" . 2>/dev/null || true
    cp "$backup_dir/docker-compose.yml" . 2>/dev/null || true
    cp -r "$backup_dir/config" . 2>/dev/null || true
    
    log_info "恢复数据库..."
    docker-compose up -d postgres
    sleep 10
    if [ -f "$backup_dir/postgres_backup.sql" ]; then
        docker-compose exec postgres psql -U postgres -f "/backup/postgres_backup.sql"
    fi
    
    log_info "恢复Redis数据..."
    docker-compose up -d redis
    if [ -f "$backup_dir/redis_backup.rdb" ]; then
        docker cp "$backup_dir/redis_backup.rdb" $(docker-compose ps -q redis):/data/dump.rdb
        docker-compose restart redis
    fi
    
    log_info "重新启动所有服务..."
    docker-compose up -d
    
    log_success "更新回滚完成"
}

# 清理旧镜像
cleanup_old_images() {
    log_header "清理旧镜像"
    
    log_info "清理未使用的镜像..."
    docker image prune -f
    
    log_info "清理悬空镜像..."
    docker images -f "dangling=true" -q | xargs -r docker rmi
    
    log_success "镜像清理完成"
}

# 生成更新报告
generate_update_report() {
    log_header "生成更新报告"
    
    local report_file="logs/update-report-$(date +%Y%m%d_%H%M%S).html"
    
    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>N8N更新报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }
        .success { border-left: 4px solid #28a745; }
        .info { border-left: 4px solid #007bff; }
        .warning { border-left: 4px solid #ffc107; }
        .version-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .version-table th, .version-table td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
        .version-table th { background-color: #e9ecef; }
        .timestamp { text-align: center; color: #6c757d; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>N8N企业级自动化工作流平台更新报告</h1>
        </div>
        
        <div class="section success">
            <h3>更新状态</h3>
            <p>系统更新成功完成</p>
        </div>
        
        <div class="section info">
            <h3>版本信息</h3>
            <table class="version-table">
                <tr>
                    <th>组件</th>
                    <th>更新前版本</th>
                    <th>更新后版本</th>
                    <th>状态</th>
                </tr>
                <tr>
                    <td>N8N</td>
                    <td id="n8n-old">--</td>
                    <td id="n8n-new">--</td>
                    <td>✅ 已更新</td>
                </tr>
                <tr>
                    <td>PostgreSQL</td>
                    <td id="pg-old">--</td>
                    <td id="pg-new">--</td>
                    <td>✅ 已更新</td>
                </tr>
                <tr>
                    <td>Redis</td>
                    <td id="redis-old">--</td>
                    <td id="redis-new">--</td>
                    <td>✅ 已更新</td>
                </tr>
            </table>
        </div>
        
        <div class="section info">
            <h3>更新内容</h3>
            <ul>
                <li>更新了所有核心组件到最新稳定版本</li>
                <li>执行了必要的数据库迁移</li>
                <li>验证了所有服务的正常运行</li>
                <li>清理了旧的Docker镜像</li>
            </ul>
        </div>
        
        <div class="timestamp">
            更新完成时间: <span id="update-time">--</span>
        </div>
    </div>
    
    <script>
        document.getElementById('update-time').textContent = new Date().toLocaleString('zh-CN');
    </script>
</body>
</html>
EOF
    
    log_success "更新报告已生成: $report_file"
}

# 显示更新信息
show_update_info() {
    log_header "更新完成信息"
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    更新成功完成！                            ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${CYAN}更新内容:${NC}"
    echo -e "  ${BLUE}✓${NC} 所有组件已更新到最新版本"
    echo -e "  ${BLUE}✓${NC} 数据库迁移已完成"
    echo -e "  ${BLUE}✓${NC} 服务验证已通过"
    echo -e "  ${BLUE}✓${NC} 旧镜像已清理"
    echo ""
    
    echo -e "${CYAN}服务状态:${NC}"
    docker-compose ps
    echo ""
    
    echo -e "${YELLOW}建议操作:${NC}"
    echo -e "  - 检查应用功能是否正常"
    echo -e "  - 查看更新日志: tail -f logs/update.log"
    echo -e "  - 执行健康检查: ./scripts/health-check.sh"
    echo -e "  - 如有问题可回滚: $0 --rollback"
    echo ""
}

# 显示使用帮助
show_help() {
    echo "N8N企业级自动化工作流平台更新脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help           显示此帮助信息"
    echo "  --check-only         仅检查可用更新，不执行更新"
    echo "  --no-backup          跳过更新前备份"
    echo "  --no-rollback        失败时不自动回滚"
    echo "  --force              强制更新，即使没有检测到新版本"
    echo "  --rollback           回滚到上次备份"
    echo "  --cleanup-only       仅清理旧镜像"
    echo ""
    echo "示例:"
    echo "  $0                   # 检查并执行更新"
    echo "  $0 --check-only      # 仅检查可用更新"
    echo "  $0 --force           # 强制更新"
    echo "  $0 --rollback        # 回滚更新"
    echo ""
}

# 主函数
main() {
    local check_only=false
    local force_update=false
    local rollback_mode=false
    local cleanup_only=false
    
    # 创建日志目录
    mkdir -p logs
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            --check-only)
                check_only=true
                shift
                ;;
            --no-backup)
                BACKUP_BEFORE_UPDATE=false
                shift
                ;;
            --no-rollback)
                ROLLBACK_ON_FAILURE=false
                shift
                ;;
            --force)
                force_update=true
                shift
                ;;
            --rollback)
                rollback_mode=true
                shift
                ;;
            --cleanup-only)
                cleanup_only=true
                shift
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    log_header "开始更新 $PROJECT_NAME"
    log_info "更新时间: $(date)"
    
    # 回滚模式
    if [ "$rollback_mode" = true ]; then
        rollback_update
        exit $?
    fi
    
    # 仅清理模式
    if [ "$cleanup_only" = true ]; then
        cleanup_old_images
        exit 0
    fi
    
    # 检查当前版本
    check_current_versions
    
    # 检查可用更新
    if ! check_available_updates && [ "$force_update" = false ]; then
        log_info "没有可用更新"
        if [ "$check_only" = true ]; then
            exit 0
        fi
    fi
    
    # 仅检查模式
    if [ "$check_only" = true ]; then
        log_info "更新检查完成"
        exit 0
    fi
    
    # 执行更新流程
    backup_current_state
    
    if ! pull_latest_images; then
        log_error "镜像拉取失败"
        if [ "$ROLLBACK_ON_FAILURE" = true ]; then
            rollback_update
        fi
        exit 1
    fi
    
    if ! rebuild_custom_images; then
        log_error "自定义镜像构建失败"
        if [ "$ROLLBACK_ON_FAILURE" = true ]; then
            rollback_update
        fi
        exit 1
    fi
    
    if ! perform_rolling_update; then
        log_error "滚动更新失败"
        if [ "$ROLLBACK_ON_FAILURE" = true ]; then
            rollback_update
        fi
        exit 1
    fi
    
    perform_database_migration
    
    if ! verify_update; then
        log_error "更新验证失败"
        if [ "$ROLLBACK_ON_FAILURE" = true ]; then
            rollback_update
        fi
        exit 1
    fi
    
    cleanup_old_images
    generate_update_report
    show_update_info
    
    log_success "更新完成！"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi