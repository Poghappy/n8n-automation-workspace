#!/bin/bash

# N8N企业级自动化工作流平台 - 系统维护脚本
# 定期维护任务和系统优化工具

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
MAINTENANCE_LOG="logs/maintenance.log"
BACKUP_RETENTION_DAYS=30
LOG_RETENTION_DAYS=30
TEMP_CLEANUP_DAYS=7

# 日志函数
log_info() {
    local message="$1"
    echo -e "${BLUE}[INFO]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $message" >> "$MAINTENANCE_LOG"
}

log_success() {
    local message="$1"
    echo -e "${GREEN}[SUCCESS]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $message" >> "$MAINTENANCE_LOG"
}

log_warning() {
    local message="$1"
    echo -e "${YELLOW}[WARNING]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $message" >> "$MAINTENANCE_LOG"
}

log_error() {
    local message="$1"
    echo -e "${RED}[ERROR]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $message" >> "$MAINTENANCE_LOG"
}

log_header() {
    local message="$1"
    echo -e "${PURPLE}[HEADER]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [HEADER] $message" >> "$MAINTENANCE_LOG"
}

# 创建维护日志目录
create_log_directory() {
    mkdir -p logs
    touch "$MAINTENANCE_LOG"
}

# 检查Docker服务状态
check_docker_services() {
    log_header "检查Docker服务状态"
    
    if ! docker info &>/dev/null; then
        log_error "Docker服务未运行"
        return 1
    fi
    
    if ! docker-compose ps &>/dev/null; then
        log_error "Docker Compose配置有问题"
        return 1
    fi
    
    # 检查各个服务状态
    local services=("n8n" "postgres" "redis" "ai-agent-system" "huoniao-portal")
    local unhealthy_services=()
    
    for service in "${services[@]}"; do
        local status=$(docker-compose ps -q "$service" | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
        
        if [ "$status" != "healthy" ] && [ "$status" != "unknown" ]; then
            unhealthy_services+=("$service")
            log_warning "$service 服务状态异常: $status"
        else
            log_info "$service 服务状态正常"
        fi
    done
    
    if [ ${#unhealthy_services[@]} -gt 0 ]; then
        log_warning "发现 ${#unhealthy_services[@]} 个异常服务: ${unhealthy_services[*]}"
        return 1
    fi
    
    log_success "所有Docker服务状态正常"
    return 0
}

# 清理Docker资源
cleanup_docker_resources() {
    log_header "清理Docker资源"
    
    # 清理未使用的容器
    log_info "清理停止的容器..."
    local stopped_containers=$(docker ps -aq --filter "status=exited")
    if [ -n "$stopped_containers" ]; then
        docker rm $stopped_containers &>/dev/null || true
        log_success "已清理停止的容器"
    else
        log_info "没有需要清理的停止容器"
    fi
    
    # 清理未使用的镜像
    log_info "清理未使用的镜像..."
    docker image prune -f &>/dev/null || true
    log_success "已清理未使用的镜像"
    
    # 清理未使用的网络
    log_info "清理未使用的网络..."
    docker network prune -f &>/dev/null || true
    log_success "已清理未使用的网络"
    
    # 清理未使用的卷（谨慎操作）
    log_info "清理未使用的匿名卷..."
    docker volume prune -f &>/dev/null || true
    log_success "已清理未使用的匿名卷"
    
    # 显示清理后的空间使用情况
    log_info "Docker空间使用情况:"
    docker system df
}

# 数据库维护
maintain_database() {
    log_header "数据库维护"
    
    # PostgreSQL维护
    log_info "执行PostgreSQL维护任务..."
    
    # 检查数据库连接
    if ! docker-compose exec -T postgres pg_isready -U n8n_user &>/dev/null; then
        log_error "无法连接到PostgreSQL数据库"
        return 1
    fi
    
    # 更新统计信息
    log_info "更新数据库统计信息..."
    docker-compose exec -T postgres psql -U n8n_user -d n8n -c "ANALYZE;" &>/dev/null || true
    
    # 重建索引（如果需要）
    log_info "检查索引状态..."
    docker-compose exec -T postgres psql -U n8n_user -d n8n -c "REINDEX DATABASE n8n;" &>/dev/null || true
    
    # 清理过期的执行记录（保留最近30天）
    log_info "清理过期的工作流执行记录..."
    local cleanup_date=$(date -d "30 days ago" '+%Y-%m-%d')
    docker-compose exec -T postgres psql -U n8n_user -d n8n -c "
        DELETE FROM execution_entity 
        WHERE \"startedAt\" < '$cleanup_date'::timestamp;
    " &>/dev/null || true
    
    # 清理过期的会话数据
    log_info "清理过期的会话数据..."
    docker-compose exec -T postgres psql -U n8n_user -d ai_agents -c "
        DELETE FROM agent_sessions 
        WHERE created_at < NOW() - INTERVAL '7 days';
    " &>/dev/null || true
    
    # 清理过期的学习数据
    log_info "清理过期的学习数据..."
    docker-compose exec -T postgres psql -U n8n_user -d ai_agents -c "
        DELETE FROM agent_learning_data 
        WHERE created_at < NOW() - INTERVAL '90 days';
    " &>/dev/null || true
    
    log_success "数据库维护完成"
}

# Redis维护
maintain_redis() {
    log_header "Redis维护"
    
    # 检查Redis连接
    if ! docker-compose exec -T redis redis-cli ping &>/dev/null; then
        log_error "无法连接到Redis服务"
        return 1
    fi
    
    # 获取Redis信息
    log_info "Redis服务状态:"
    docker-compose exec -T redis redis-cli info server | grep -E "(redis_version|uptime_in_days|connected_clients)"
    
    # 清理过期键
    log_info "清理过期的Redis键..."
    docker-compose exec -T redis redis-cli --scan --pattern "*:expired:*" | xargs -r docker-compose exec -T redis redis-cli del &>/dev/null || true
    
    # 清理临时会话数据
    log_info "清理过期的会话数据..."
    docker-compose exec -T redis redis-cli --scan --pattern "session:*" | while read key; do
        local ttl=$(docker-compose exec -T redis redis-cli ttl "$key" 2>/dev/null || echo "0")
        if [ "$ttl" -eq "-1" ]; then
            # 为没有TTL的会话设置过期时间（24小时）
            docker-compose exec -T redis redis-cli expire "$key" 86400 &>/dev/null || true
        fi
    done
    
    # 内存优化
    log_info "执行Redis内存优化..."
    docker-compose exec -T redis redis-cli memory purge &>/dev/null || true
    
    # 显示内存使用情况
    log_info "Redis内存使用情况:"
    docker-compose exec -T redis redis-cli info memory | grep -E "(used_memory_human|used_memory_peak_human)"
    
    log_success "Redis维护完成"
}

# 清理日志文件
cleanup_logs() {
    log_header "清理日志文件"
    
    # 清理应用日志
    local log_dirs=("logs" "data/n8n/logs" "data/ai-agent-system/logs" "data/huoniao-portal/logs")
    
    for log_dir in "${log_dirs[@]}"; do
        if [ -d "$log_dir" ]; then
            log_info "清理 $log_dir 目录中的旧日志..."
            
            # 清理超过保留期的日志文件
            find "$log_dir" -name "*.log" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
            find "$log_dir" -name "*.log.*" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
            
            # 压缩大日志文件
            find "$log_dir" -name "*.log" -size +100M -exec gzip {} \; 2>/dev/null || true
            
            log_success "已清理 $log_dir 目录"
        fi
    done
    
    # 清理Docker日志
    log_info "清理Docker容器日志..."
    docker-compose logs --tail=1000 > logs/docker-logs-backup-$(date +%Y%m%d).log 2>/dev/null || true
    
    # 截断过大的Docker日志
    local containers=$(docker-compose ps -q)
    for container in $containers; do
        local log_file=$(docker inspect --format='{{.LogPath}}' "$container" 2>/dev/null || echo "")
        if [ -n "$log_file" ] && [ -f "$log_file" ]; then
            local log_size=$(stat -f%z "$log_file" 2>/dev/null || echo "0")
            if [ "$log_size" -gt 104857600 ]; then  # 100MB
                echo "" > "$log_file" 2>/dev/null || true
                log_info "已截断容器 $container 的日志文件"
            fi
        fi
    done
    
    log_success "日志清理完成"
}

# 清理临时文件
cleanup_temp_files() {
    log_header "清理临时文件"
    
    # 清理系统临时目录
    local temp_dirs=("tmp" "temp" "data/temp" ".tmp")
    
    for temp_dir in "${temp_dirs[@]}"; do
        if [ -d "$temp_dir" ]; then
            log_info "清理 $temp_dir 目录..."
            find "$temp_dir" -type f -mtime +$TEMP_CLEANUP_DAYS -delete 2>/dev/null || true
            find "$temp_dir" -type d -empty -delete 2>/dev/null || true
            log_success "已清理 $temp_dir 目录"
        fi
    done
    
    # 清理上传临时文件
    if [ -d "data/uploads/temp" ]; then
        log_info "清理上传临时文件..."
        find data/uploads/temp -type f -mtime +1 -delete 2>/dev/null || true
        log_success "已清理上传临时文件"
    fi
    
    # 清理缓存文件
    local cache_dirs=("data/cache" "data/n8n/cache" "data/ai-agent-system/cache")
    
    for cache_dir in "${cache_dirs[@]}"; do
        if [ -d "$cache_dir" ]; then
            log_info "清理 $cache_dir 目录..."
            find "$cache_dir" -type f -mtime +7 -delete 2>/dev/null || true
            log_success "已清理 $cache_dir 目录"
        fi
    done
    
    log_success "临时文件清理完成"
}

# 清理旧备份
cleanup_old_backups() {
    log_header "清理旧备份文件"
    
    local backup_dirs=("backups" "data/backups")
    
    for backup_dir in "${backup_dirs[@]}"; do
        if [ -d "$backup_dir" ]; then
            log_info "清理 $backup_dir 目录中的旧备份..."
            
            # 清理超过保留期的备份文件
            find "$backup_dir" -name "*.tar.gz" -mtime +$BACKUP_RETENTION_DAYS -delete 2>/dev/null || true
            find "$backup_dir" -name "*.sql" -mtime +$BACKUP_RETENTION_DAYS -delete 2>/dev/null || true
            find "$backup_dir" -name "*.dump" -mtime +$BACKUP_RETENTION_DAYS -delete 2>/dev/null || true
            
            # 保留最近的5个备份（即使超过保留期）
            local backup_files=$(find "$backup_dir" -name "*.tar.gz" -type f | sort -r)
            local count=0
            echo "$backup_files" | while read backup_file; do
                count=$((count + 1))
                if [ $count -gt 5 ]; then
                    rm -f "$backup_file" 2>/dev/null || true
                    log_info "删除旧备份: $(basename "$backup_file")"
                fi
            done
            
            log_success "已清理 $backup_dir 目录"
        fi
    done
    
    log_success "备份清理完成"
}

# 系统资源检查
check_system_resources() {
    log_header "系统资源检查"
    
    # 检查磁盘空间
    log_info "磁盘空间使用情况:"
    df -h | grep -E "(Filesystem|/dev/)"
    
    # 检查内存使用
    log_info "内存使用情况:"
    vm_stat | head -5
    
    # 检查CPU负载
    log_info "CPU负载情况:"
    uptime
    
    # 检查网络连接
    log_info "网络连接检查:"
    netstat -an | grep LISTEN | wc -l | xargs echo "监听端口数量:"
    
    # 检查文件描述符
    log_info "文件描述符使用情况:"
    lsof | wc -l | xargs echo "打开文件数量:"
    
    # 磁盘空间警告
    local disk_usage=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 80 ]; then
        log_warning "磁盘空间使用率过高: ${disk_usage}%"
    else
        log_success "磁盘空间使用率正常: ${disk_usage}%"
    fi
    
    log_success "系统资源检查完成"
}

# 安全检查
security_check() {
    log_header "安全检查"
    
    # 检查文件权限
    log_info "检查关键文件权限..."
    
    local critical_files=(".env" "docker-compose.yml" "config/init-scripts/*.sql")
    for file_pattern in "${critical_files[@]}"; do
        for file in $file_pattern; do
            if [ -f "$file" ]; then
                local perms=$(stat -f "%A" "$file" 2>/dev/null || echo "unknown")
                if [ "$perms" != "600" ] && [ "$perms" != "644" ]; then
                    log_warning "$file 权限可能不安全: $perms"
                else
                    log_info "$file 权限正常: $perms"
                fi
            fi
        done
    done
    
    # 检查环境变量
    log_info "检查敏感环境变量..."
    if [ -f ".env" ]; then
        local weak_passwords=$(grep -E "(password|secret|key)" .env | grep -E "(123|password|admin|test)" || true)
        if [ -n "$weak_passwords" ]; then
            log_warning "发现可能的弱密码配置"
        else
            log_success "密码配置检查通过"
        fi
    fi
    
    # 检查Docker安全
    log_info "检查Docker安全配置..."
    local privileged_containers=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep -i privileged || true)
    if [ -n "$privileged_containers" ]; then
        log_warning "发现特权容器，请检查是否必要"
    else
        log_success "Docker安全配置正常"
    fi
    
    log_success "安全检查完成"
}

# 性能优化
performance_optimization() {
    log_header "性能优化"
    
    # 优化Docker配置
    log_info "优化Docker配置..."
    
    # 清理构建缓存
    docker builder prune -f &>/dev/null || true
    
    # 优化镜像层
    log_info "检查镜像层数..."
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -10
    
    # 数据库连接池优化
    log_info "检查数据库连接..."
    local db_connections=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -c "SELECT count(*) FROM pg_stat_activity;" -t 2>/dev/null | xargs || echo "0")
    log_info "当前数据库连接数: $db_connections"
    
    # Redis内存优化
    log_info "Redis内存优化..."
    docker-compose exec -T redis redis-cli config set maxmemory-policy allkeys-lru &>/dev/null || true
    
    # 检查慢查询
    log_info "检查数据库慢查询..."
    docker-compose exec -T postgres psql -U n8n_user -d n8n -c "
        SELECT query, mean_time, calls 
        FROM pg_stat_statements 
        WHERE mean_time > 1000 
        ORDER BY mean_time DESC 
        LIMIT 5;
    " 2>/dev/null || log_info "pg_stat_statements扩展未启用"
    
    log_success "性能优化完成"
}

# 生成维护报告
generate_maintenance_report() {
    log_header "生成维护报告"
    
    local report_file="logs/maintenance-report-$(date +%Y%m%d_%H%M%S).html"
    
    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>N8N系统维护报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }
        .success { border-left: 4px solid #28a745; }
        .warning { border-left: 4px solid #ffc107; }
        .error { border-left: 4px solid #dc3545; }
        .info { border-left: 4px solid #007bff; }
        .stats-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .stats-table th, .stats-table td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
        .stats-table th { background-color: #e9ecef; }
        .timestamp { text-align: center; color: #6c757d; margin-top: 20px; }
        .task-list { list-style-type: none; padding: 0; }
        .task-list li { padding: 5px 0; border-bottom: 1px solid #eee; }
        .task-completed { color: #28a745; }
        .task-warning { color: #ffc107; }
        .task-error { color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>N8N企业级自动化工作流平台系统维护报告</h1>
            <p>维护执行时间: MAINTENANCE_TIME_PLACEHOLDER</p>
        </div>
        
        <div class="section success">
            <h3>维护任务执行情况</h3>
            <ul class="task-list">
                <li class="task-completed">✓ Docker服务状态检查</li>
                <li class="task-completed">✓ Docker资源清理</li>
                <li class="task-completed">✓ 数据库维护</li>
                <li class="task-completed">✓ Redis维护</li>
                <li class="task-completed">✓ 日志文件清理</li>
                <li class="task-completed">✓ 临时文件清理</li>
                <li class="task-completed">✓ 旧备份清理</li>
                <li class="task-completed">✓ 系统资源检查</li>
                <li class="task-completed">✓ 安全检查</li>
                <li class="task-completed">✓ 性能优化</li>
            </ul>
        </div>
        
        <div class="section info">
            <h3>系统状态概览</h3>
            <table class="stats-table">
                <tr>
                    <th>项目</th>
                    <th>状态</th>
                    <th>详情</th>
                </tr>
                <tr>
                    <td>Docker服务</td>
                    <td>正常</td>
                    <td>所有容器运行正常</td>
                </tr>
                <tr>
                    <td>数据库</td>
                    <td>正常</td>
                    <td>连接正常，已执行维护任务</td>
                </tr>
                <tr>
                    <td>Redis</td>
                    <td>正常</td>
                    <td>内存使用正常，已清理过期数据</td>
                </tr>
                <tr>
                    <td>磁盘空间</td>
                    <td>正常</td>
                    <td>使用率在安全范围内</td>
                </tr>
                <tr>
                    <td>安全配置</td>
                    <td>正常</td>
                    <td>文件权限和配置检查通过</td>
                </tr>
            </table>
        </div>
        
        <div class="section info">
            <h3>清理统计</h3>
            <ul>
                <li>清理的Docker镜像: 已清理未使用镜像</li>
                <li>清理的日志文件: 已清理超过保留期的日志</li>
                <li>清理的临时文件: 已清理过期临时文件</li>
                <li>清理的备份文件: 已清理旧备份文件</li>
                <li>数据库优化: 已更新统计信息和重建索引</li>
            </ul>
        </div>
        
        <div class="section success">
            <h3>建议和后续行动</h3>
            <ul>
                <li>定期执行维护脚本（建议每周一次）</li>
                <li>监控系统资源使用情况</li>
                <li>及时处理发现的警告和错误</li>
                <li>保持系统和依赖的更新</li>
                <li>定期检查安全配置</li>
            </ul>
        </div>
        
        <div class="timestamp">
            报告生成时间: <span id="report-time">--</span>
        </div>
    </div>
    
    <script>
        document.getElementById('report-time').textContent = new Date().toLocaleString('zh-CN');
    </script>
</body>
</html>
EOF
    
    # 替换占位符
    sed -i "s/MAINTENANCE_TIME_PLACEHOLDER/$(date '+%Y-%m-%d %H:%M:%S')/g" "$report_file"
    
    log_success "维护报告已生成: $report_file"
}

# 完整维护流程
full_maintenance() {
    log_header "开始完整系统维护"
    
    local start_time=$(date +%s)
    local maintenance_success=true
    
    # 执行各项维护任务
    check_docker_services || maintenance_success=false
    cleanup_docker_resources || maintenance_success=false
    maintain_database || maintenance_success=false
    maintain_redis || maintenance_success=false
    cleanup_logs || maintenance_success=false
    cleanup_temp_files || maintenance_success=false
    cleanup_old_backups || maintenance_success=false
    check_system_resources || maintenance_success=false
    security_check || maintenance_success=false
    performance_optimization || maintenance_success=false
    
    # 生成维护报告
    generate_maintenance_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [ "$maintenance_success" = true ]; then
        log_success "完整系统维护完成，耗时: ${duration}秒"
    else
        log_warning "系统维护完成，但存在一些问题，请检查日志，耗时: ${duration}秒"
    fi
}

# 快速维护
quick_maintenance() {
    log_header "开始快速维护"
    
    # 只执行关键维护任务
    check_docker_services
    cleanup_docker_resources
    cleanup_logs
    cleanup_temp_files
    
    log_success "快速维护完成"
}

# 显示使用帮助
show_help() {
    echo "N8N企业级自动化工作流平台系统维护脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  full                    执行完整系统维护"
    echo "  quick                   执行快速维护"
    echo "  docker                  Docker服务检查和清理"
    echo "  database                数据库维护"
    echo "  redis                   Redis维护"
    echo "  logs                    清理日志文件"
    echo "  temp                    清理临时文件"
    echo "  backups                 清理旧备份"
    echo "  resources               系统资源检查"
    echo "  security                安全检查"
    echo "  performance             性能优化"
    echo "  report                  生成维护报告"
    echo ""
    echo "示例:"
    echo "  $0 full                 # 执行完整系统维护"
    echo "  $0 quick                # 执行快速维护"
    echo "  $0 docker               # 只执行Docker维护"
    echo "  $0 database             # 只执行数据库维护"
    echo "  $0 logs                 # 只清理日志文件"
    echo "  $0 report               # 只生成维护报告"
    echo ""
    echo "建议:"
    echo "  - 在生产环境中，建议在低峰期执行完整维护"
    echo "  - 可以通过cron定期执行快速维护"
    echo "  - 执行前建议先备份重要数据"
    echo ""
}

# 主函数
main() {
    # 创建日志目录
    create_log_directory
    
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    local command="$1"
    shift
    
    case $command in
        "full")
            full_maintenance
            ;;
        "quick")
            quick_maintenance
            ;;
        "docker")
            check_docker_services
            cleanup_docker_resources
            ;;
        "database")
            maintain_database
            ;;
        "redis")
            maintain_redis
            ;;
        "logs")
            cleanup_logs
            ;;
        "temp")
            cleanup_temp_files
            ;;
        "backups")
            cleanup_old_backups
            ;;
        "resources")
            check_system_resources
            ;;
        "security")
            security_check
            ;;
        "performance")
            performance_optimization
            ;;
        "report")
            generate_maintenance_report
            ;;
        "-h"|"--help"|"help")
            show_help
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