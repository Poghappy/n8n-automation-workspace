#!/bin/bash

# N8N企业级自动化工作流平台 - 性能监控和优化脚本
# 全面的性能分析和优化工具

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
PERFORMANCE_LOG="logs/performance.log"
PERFORMANCE_REPORT="logs/performance-report-$(date +%Y%m%d_%H%M%S).html"
METRICS_DIR="logs/metrics"

# 性能阈值配置
CPU_WARNING_THRESHOLD=70
CPU_CRITICAL_THRESHOLD=90
MEMORY_WARNING_THRESHOLD=80
MEMORY_CRITICAL_THRESHOLD=95
DISK_WARNING_THRESHOLD=80
DISK_CRITICAL_THRESHOLD=90
RESPONSE_TIME_WARNING=2000  # 毫秒
RESPONSE_TIME_CRITICAL=5000  # 毫秒

# 日志函数
log_info() {
    local message="$1"
    echo -e "${BLUE}[INFO]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $message" >> "$PERFORMANCE_LOG"
}

log_success() {
    local message="$1"
    echo -e "${GREEN}[SUCCESS]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $message" >> "$PERFORMANCE_LOG"
}

log_warning() {
    local message="$1"
    echo -e "${YELLOW}[WARNING]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $message" >> "$PERFORMANCE_LOG"
}

log_error() {
    local message="$1"
    echo -e "${RED}[ERROR]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $message" >> "$PERFORMANCE_LOG"
}

log_critical() {
    local message="$1"
    echo -e "${RED}[CRITICAL]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [CRITICAL] $message" >> "$PERFORMANCE_LOG"
}

log_header() {
    local message="$1"
    echo -e "${PURPLE}[HEADER]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [HEADER] $message" >> "$PERFORMANCE_LOG"
}

# 创建性能监控目录
create_performance_directories() {
    mkdir -p logs
    mkdir -p "$METRICS_DIR"
    touch "$PERFORMANCE_LOG"
}

# 系统资源监控
monitor_system_resources() {
    log_header "系统资源监控"
    
    # CPU使用率
    log_info "检查CPU使用率..."
    local cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' | cut -d. -f1)
    
    if [ "$cpu_usage" -ge "$CPU_CRITICAL_THRESHOLD" ]; then
        log_critical "CPU使用率过高: ${cpu_usage}%"
    elif [ "$cpu_usage" -ge "$CPU_WARNING_THRESHOLD" ]; then
        log_warning "CPU使用率较高: ${cpu_usage}%"
    else
        log_success "CPU使用率正常: ${cpu_usage}%"
    fi
    
    # 内存使用率
    log_info "检查内存使用率..."
    local memory_info=$(vm_stat | grep -E "Pages (free|active|inactive|speculative|wired)" | awk '{print $3}' | sed 's/\.//')
    local page_size=4096
    local free_pages=$(echo "$memory_info" | sed -n '1p')
    local active_pages=$(echo "$memory_info" | sed -n '2p')
    local inactive_pages=$(echo "$memory_info" | sed -n '3p')
    local speculative_pages=$(echo "$memory_info" | sed -n '4p')
    local wired_pages=$(echo "$memory_info" | sed -n '5p')
    
    local total_memory=$(( (free_pages + active_pages + inactive_pages + speculative_pages + wired_pages) * page_size / 1024 / 1024 ))
    local used_memory=$(( (active_pages + inactive_pages + wired_pages) * page_size / 1024 / 1024 ))
    local memory_usage=$(( used_memory * 100 / total_memory ))
    
    if [ "$memory_usage" -ge "$MEMORY_CRITICAL_THRESHOLD" ]; then
        log_critical "内存使用率过高: ${memory_usage}% (${used_memory}MB/${total_memory}MB)"
    elif [ "$memory_usage" -ge "$MEMORY_WARNING_THRESHOLD" ]; then
        log_warning "内存使用率较高: ${memory_usage}% (${used_memory}MB/${total_memory}MB)"
    else
        log_success "内存使用率正常: ${memory_usage}% (${used_memory}MB/${total_memory}MB)"
    fi
    
    # 磁盘使用率
    log_info "检查磁盘使用率..."
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -ge "$DISK_CRITICAL_THRESHOLD" ]; then
        log_critical "磁盘使用率过高: ${disk_usage}%"
    elif [ "$disk_usage" -ge "$DISK_WARNING_THRESHOLD" ]; then
        log_warning "磁盘使用率较高: ${disk_usage}%"
    else
        log_success "磁盘使用率正常: ${disk_usage}%"
    fi
    
    # 负载平均值
    log_info "检查系统负载..."
    local load_avg=$(uptime | awk -F'load averages:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local cpu_cores=$(sysctl -n hw.ncpu)
    local load_percentage=$(echo "scale=2; $load_avg * 100 / $cpu_cores" | bc)
    
    if (( $(echo "$load_percentage > 90" | bc -l) )); then
        log_critical "系统负载过高: ${load_avg} (${load_percentage}%)"
    elif (( $(echo "$load_percentage > 70" | bc -l) )); then
        log_warning "系统负载较高: ${load_avg} (${load_percentage}%)"
    else
        log_success "系统负载正常: ${load_avg} (${load_percentage}%)"
    fi
    
    # 保存指标到文件
    local timestamp=$(date +%s)
    echo "$timestamp,$cpu_usage,$memory_usage,$disk_usage,$load_avg" >> "$METRICS_DIR/system-metrics.csv"
}

# Docker容器性能监控
monitor_docker_performance() {
    log_header "Docker容器性能监控"
    
    if ! docker info &>/dev/null; then
        log_error "Docker服务未运行"
        return 1
    fi
    
    # 获取运行中的容器
    local containers=$(docker-compose ps -q)
    
    if [ -z "$containers" ]; then
        log_warning "未发现运行中的容器"
        return 1
    fi
    
    for container in $containers; do
        local container_name=$(docker inspect --format='{{.Name}}' "$container" | sed 's/\///')
        log_info "监控容器: $container_name"
        
        # 获取容器统计信息
        local stats=$(docker stats --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" "$container")
        local cpu_perc=$(echo "$stats" | tail -1 | awk '{print $1}' | sed 's/%//')
        local mem_usage=$(echo "$stats" | tail -1 | awk '{print $2}')
        local mem_perc=$(echo "$stats" | tail -1 | awk '{print $3}' | sed 's/%//')
        local net_io=$(echo "$stats" | tail -1 | awk '{print $4}')
        local block_io=$(echo "$stats" | tail -1 | awk '{print $5}')
        
        # 评估容器性能
        if (( $(echo "$cpu_perc > $CPU_CRITICAL_THRESHOLD" | bc -l) )); then
            log_critical "容器 $container_name CPU使用率过高: ${cpu_perc}%"
        elif (( $(echo "$cpu_perc > $CPU_WARNING_THRESHOLD" | bc -l) )); then
            log_warning "容器 $container_name CPU使用率较高: ${cpu_perc}%"
        else
            log_success "容器 $container_name CPU使用率正常: ${cpu_perc}%"
        fi
        
        if (( $(echo "$mem_perc > $MEMORY_CRITICAL_THRESHOLD" | bc -l) )); then
            log_critical "容器 $container_name 内存使用率过高: ${mem_perc}% ($mem_usage)"
        elif (( $(echo "$mem_perc > $MEMORY_WARNING_THRESHOLD" | bc -l) )); then
            log_warning "容器 $container_name 内存使用率较高: ${mem_perc}% ($mem_usage)"
        else
            log_success "容器 $container_name 内存使用率正常: ${mem_perc}% ($mem_usage)"
        fi
        
        log_info "容器 $container_name 网络IO: $net_io"
        log_info "容器 $container_name 磁盘IO: $block_io"
        
        # 保存容器指标
        local timestamp=$(date +%s)
        echo "$timestamp,$container_name,$cpu_perc,$mem_perc,$net_io,$block_io" >> "$METRICS_DIR/container-metrics.csv"
    done
}

# N8N性能监控
monitor_n8n_performance() {
    log_header "N8N性能监控"
    
    # 检查N8N服务状态
    if ! docker-compose ps n8n | grep -q "Up"; then
        log_error "N8N服务未运行"
        return 1
    fi
    
    # 检查N8N响应时间
    log_info "检查N8N响应时间..."
    local start_time=$(date +%s%3N)
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5678/healthz 2>/dev/null || echo "000")
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    if [ "$response" = "200" ]; then
        if [ "$response_time" -ge "$RESPONSE_TIME_CRITICAL" ]; then
            log_critical "N8N响应时间过长: ${response_time}ms"
        elif [ "$response_time" -ge "$RESPONSE_TIME_WARNING" ]; then
            log_warning "N8N响应时间较长: ${response_time}ms"
        else
            log_success "N8N响应时间正常: ${response_time}ms"
        fi
    else
        log_error "N8N健康检查失败，HTTP状态码: $response"
    fi
    
    # 检查工作流执行性能
    log_info "检查工作流执行性能..."
    local workflow_stats=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
        SELECT 
            COUNT(*) as total_executions,
            AVG(EXTRACT(EPOCH FROM (finished_at - started_at))) as avg_duration,
            COUNT(CASE WHEN finished_at IS NULL THEN 1 END) as running_executions,
            COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_executions,
            COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_executions
        FROM execution_entity 
        WHERE started_at > NOW() - INTERVAL '1 hour';
    " 2>/dev/null | xargs || echo "0 0 0 0 0")
    
    local total_executions=$(echo "$workflow_stats" | awk '{print $1}')
    local avg_duration=$(echo "$workflow_stats" | awk '{print $2}' | cut -d. -f1)
    local running_executions=$(echo "$workflow_stats" | awk '{print $3}')
    local successful_executions=$(echo "$workflow_stats" | awk '{print $4}')
    local failed_executions=$(echo "$workflow_stats" | awk '{print $5}')
    
    log_info "过去1小时工作流执行统计:"
    log_info "  总执行次数: $total_executions"
    log_info "  平均执行时间: ${avg_duration}秒"
    log_info "  正在运行: $running_executions"
    log_info "  成功执行: $successful_executions"
    log_info "  失败执行: $failed_executions"
    
    # 计算成功率
    if [ "$total_executions" -gt 0 ]; then
        local success_rate=$(( successful_executions * 100 / total_executions ))
        if [ "$success_rate" -lt 90 ]; then
            log_warning "工作流成功率较低: ${success_rate}%"
        else
            log_success "工作流成功率正常: ${success_rate}%"
        fi
    fi
    
    # 检查长时间运行的工作流
    local long_running=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
        SELECT COUNT(*) 
        FROM execution_entity 
        WHERE started_at < NOW() - INTERVAL '30 minutes' 
        AND finished_at IS NULL;
    " 2>/dev/null | xargs || echo "0")
    
    if [ "$long_running" -gt 0 ]; then
        log_warning "发现 $long_running 个长时间运行的工作流（超过30分钟）"
    else
        log_success "未发现长时间运行的工作流"
    fi
    
    # 保存N8N指标
    local timestamp=$(date +%s)
    echo "$timestamp,$response_time,$total_executions,$avg_duration,$success_rate,$running_executions" >> "$METRICS_DIR/n8n-metrics.csv"
}

# 数据库性能监控
monitor_database_performance() {
    log_header "数据库性能监控"
    
    # 检查PostgreSQL连接
    if ! docker-compose exec -T postgres pg_isready -U n8n_user &>/dev/null; then
        log_error "无法连接到PostgreSQL数据库"
        return 1
    fi
    
    # 检查数据库连接数
    log_info "检查数据库连接数..."
    local connections=$(docker-compose exec -T postgres psql -U n8n_user -d postgres -t -c "
        SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
    " 2>/dev/null | xargs || echo "0")
    
    local max_connections=$(docker-compose exec -T postgres psql -U n8n_user -d postgres -t -c "
        SHOW max_connections;
    " 2>/dev/null | xargs || echo "100")
    
    local connection_usage=$(( connections * 100 / max_connections ))
    
    if [ "$connection_usage" -ge 90 ]; then
        log_critical "数据库连接使用率过高: ${connection_usage}% (${connections}/${max_connections})"
    elif [ "$connection_usage" -ge 70 ]; then
        log_warning "数据库连接使用率较高: ${connection_usage}% (${connections}/${max_connections})"
    else
        log_success "数据库连接使用率正常: ${connection_usage}% (${connections}/${max_connections})"
    fi
    
    # 检查数据库大小
    log_info "检查数据库大小..."
    local db_size=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
        SELECT pg_size_pretty(pg_database_size('n8n'));
    " 2>/dev/null | xargs || echo "unknown")
    
    log_info "N8N数据库大小: $db_size"
    
    # 检查慢查询
    log_info "检查慢查询..."
    local slow_queries=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
        SELECT count(*) 
        FROM pg_stat_statements 
        WHERE mean_time > 1000;
    " 2>/dev/null | xargs || echo "0")
    
    if [ "$slow_queries" -gt 0 ]; then
        log_warning "发现 $slow_queries 个慢查询（平均执行时间>1秒）"
        
        # 显示最慢的查询
        local slowest_query=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
            SELECT substring(query, 1, 100) || '...' as query, 
                   round(mean_time::numeric, 2) as avg_time_ms
            FROM pg_stat_statements 
            ORDER BY mean_time DESC 
            LIMIT 1;
        " 2>/dev/null || echo "")
        
        if [ -n "$slowest_query" ]; then
            log_info "最慢查询: $slowest_query"
        fi
    else
        log_success "未发现慢查询"
    fi
    
    # 检查表大小
    log_info "检查主要表大小..."
    local table_sizes=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
        SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
        LIMIT 5;
    " 2>/dev/null || echo "")
    
    if [ -n "$table_sizes" ]; then
        log_info "最大的5个表:"
        echo "$table_sizes" | while read line; do
            log_info "  $line"
        done
    fi
    
    # 检查索引使用情况
    log_info "检查索引使用情况..."
    local unused_indexes=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
        SELECT count(*) 
        FROM pg_stat_user_indexes 
        WHERE idx_scan = 0;
    " 2>/dev/null | xargs || echo "0")
    
    if [ "$unused_indexes" -gt 0 ]; then
        log_warning "发现 $unused_indexes 个未使用的索引"
    else
        log_success "所有索引都在使用中"
    fi
    
    # 保存数据库指标
    local timestamp=$(date +%s)
    echo "$timestamp,$connections,$connection_usage,$slow_queries,$unused_indexes" >> "$METRICS_DIR/database-metrics.csv"
}

# Redis性能监控
monitor_redis_performance() {
    log_header "Redis性能监控"
    
    # 检查Redis连接
    if ! docker-compose exec -T redis redis-cli ping &>/dev/null; then
        log_error "无法连接到Redis服务"
        return 1
    fi
    
    # 获取Redis信息
    local redis_info=$(docker-compose exec -T redis redis-cli info 2>/dev/null || echo "")
    
    if [ -z "$redis_info" ]; then
        log_error "无法获取Redis信息"
        return 1
    fi
    
    # 检查内存使用
    local used_memory=$(echo "$redis_info" | grep "used_memory_human:" | cut -d: -f2 | tr -d '\r')
    local used_memory_peak=$(echo "$redis_info" | grep "used_memory_peak_human:" | cut -d: -f2 | tr -d '\r')
    local maxmemory=$(echo "$redis_info" | grep "maxmemory_human:" | cut -d: -f2 | tr -d '\r')
    
    log_info "Redis内存使用情况:"
    log_info "  当前使用: $used_memory"
    log_info "  峰值使用: $used_memory_peak"
    log_info "  最大限制: $maxmemory"
    
    # 检查连接数
    local connected_clients=$(echo "$redis_info" | grep "connected_clients:" | cut -d: -f2 | tr -d '\r')
    local maxclients=$(echo "$redis_info" | grep "maxclients:" | cut -d: -f2 | tr -d '\r')
    
    if [ -n "$connected_clients" ] && [ -n "$maxclients" ]; then
        local client_usage=$(( connected_clients * 100 / maxclients ))
        
        if [ "$client_usage" -ge 90 ]; then
            log_critical "Redis连接使用率过高: ${client_usage}% (${connected_clients}/${maxclients})"
        elif [ "$client_usage" -ge 70 ]; then
            log_warning "Redis连接使用率较高: ${client_usage}% (${connected_clients}/${maxclients})"
        else
            log_success "Redis连接使用率正常: ${client_usage}% (${connected_clients}/${maxclients})"
        fi
    fi
    
    # 检查命令统计
    local total_commands=$(echo "$redis_info" | grep "total_commands_processed:" | cut -d: -f2 | tr -d '\r')
    local instantaneous_ops=$(echo "$redis_info" | grep "instantaneous_ops_per_sec:" | cut -d: -f2 | tr -d '\r')
    
    log_info "Redis命令统计:"
    log_info "  总命令数: $total_commands"
    log_info "  每秒操作数: $instantaneous_ops"
    
    # 检查键空间
    local keyspace=$(echo "$redis_info" | grep "^db" | head -5)
    if [ -n "$keyspace" ]; then
        log_info "Redis键空间信息:"
        echo "$keyspace" | while read line; do
            log_info "  $line"
        done
    fi
    
    # 检查持久化状态
    local rdb_last_save=$(echo "$redis_info" | grep "rdb_last_save_time:" | cut -d: -f2 | tr -d '\r')
    local aof_enabled=$(echo "$redis_info" | grep "aof_enabled:" | cut -d: -f2 | tr -d '\r')
    
    if [ "$aof_enabled" = "1" ]; then
        log_success "Redis AOF持久化已启用"
    else
        log_warning "Redis AOF持久化未启用"
    fi
    
    # 保存Redis指标
    local timestamp=$(date +%s)
    echo "$timestamp,$connected_clients,$client_usage,$instantaneous_ops" >> "$METRICS_DIR/redis-metrics.csv"
}

# 网络性能监控
monitor_network_performance() {
    log_header "网络性能监控"
    
    # 检查网络连接数
    log_info "检查网络连接数..."
    local tcp_connections=$(netstat -an | grep tcp | wc -l | xargs)
    local established_connections=$(netstat -an | grep ESTABLISHED | wc -l | xargs)
    local listen_connections=$(netstat -an | grep LISTEN | wc -l | xargs)
    
    log_info "网络连接统计:"
    log_info "  TCP连接总数: $tcp_connections"
    log_info "  已建立连接: $established_connections"
    log_info "  监听端口: $listen_connections"
    
    # 检查端口响应时间
    log_info "检查关键端口响应时间..."
    
    local ports=("5678:N8N" "5432:PostgreSQL" "6379:Redis")
    
    for port_info in "${ports[@]}"; do
        local port=$(echo "$port_info" | cut -d: -f1)
        local service=$(echo "$port_info" | cut -d: -f2)
        
        local start_time=$(date +%s%3N)
        if nc -z localhost "$port" 2>/dev/null; then
            local end_time=$(date +%s%3N)
            local response_time=$((end_time - start_time))
            
            if [ "$response_time" -ge 1000 ]; then
                log_warning "$service 端口响应时间较长: ${response_time}ms"
            else
                log_success "$service 端口响应正常: ${response_time}ms"
            fi
        else
            log_error "$service 端口无法连接: $port"
        fi
    done
    
    # 检查网络接口统计
    log_info "检查网络接口统计..."
    local network_stats=$(netstat -i | grep -v "^Name\|^lo0" | head -5)
    
    if [ -n "$network_stats" ]; then
        log_info "网络接口统计:"
        echo "$network_stats" | while read line; do
            log_info "  $line"
        done
    fi
    
    # 保存网络指标
    local timestamp=$(date +%s)
    echo "$timestamp,$tcp_connections,$established_connections,$listen_connections" >> "$METRICS_DIR/network-metrics.csv"
}

# 性能优化建议
generate_optimization_recommendations() {
    log_header "生成性能优化建议"
    
    local recommendations=()
    
    # 基于系统资源使用情况生成建议
    local cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' | cut -d. -f1)
    local memory_info=$(vm_stat | grep -E "Pages (free|active|inactive|speculative|wired)" | awk '{print $3}' | sed 's/\.//')
    local page_size=4096
    local free_pages=$(echo "$memory_info" | sed -n '1p')
    local active_pages=$(echo "$memory_info" | sed -n '2p')
    local inactive_pages=$(echo "$memory_info" | sed -n '3p')
    local speculative_pages=$(echo "$memory_info" | sed -n '4p')
    local wired_pages=$(echo "$memory_info" | sed -n '5p')
    local total_memory=$(( (free_pages + active_pages + inactive_pages + speculative_pages + wired_pages) * page_size / 1024 / 1024 ))
    local used_memory=$(( (active_pages + inactive_pages + wired_pages) * page_size / 1024 / 1024 ))
    local memory_usage=$(( used_memory * 100 / total_memory ))
    
    if [ "$cpu_usage" -ge "$CPU_WARNING_THRESHOLD" ]; then
        recommendations+=("CPU使用率较高，建议：1) 优化工作流逻辑 2) 增加CPU资源 3) 启用负载均衡")
    fi
    
    if [ "$memory_usage" -ge "$MEMORY_WARNING_THRESHOLD" ]; then
        recommendations+=("内存使用率较高，建议：1) 增加内存资源 2) 优化数据缓存策略 3) 调整容器内存限制")
    fi
    
    # 基于数据库性能生成建议
    local connections=$(docker-compose exec -T postgres psql -U n8n_user -d postgres -t -c "
        SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
    " 2>/dev/null | xargs || echo "0")
    
    local max_connections=$(docker-compose exec -T postgres psql -U n8n_user -d postgres -t -c "
        SHOW max_connections;
    " 2>/dev/null | xargs || echo "100")
    
    local connection_usage=$(( connections * 100 / max_connections ))
    
    if [ "$connection_usage" -ge 70 ]; then
        recommendations+=("数据库连接使用率较高，建议：1) 优化连接池配置 2) 增加最大连接数 3) 检查连接泄漏")
    fi
    
    # 基于工作流执行情况生成建议
    local failed_executions=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
        SELECT COUNT(*) FROM execution_entity 
        WHERE status = 'error' AND started_at > NOW() - INTERVAL '1 hour';
    " 2>/dev/null | xargs || echo "0")
    
    if [ "$failed_executions" -gt 0 ]; then
        recommendations+=("工作流执行失败率较高，建议：1) 检查错误日志 2) 优化错误处理 3) 增加重试机制")
    fi
    
    # 输出建议
    if [ ${#recommendations[@]} -gt 0 ]; then
        log_info "性能优化建议:"
        for i in "${!recommendations[@]}"; do
            log_info "  $((i+1)). ${recommendations[$i]}"
        done
    else
        log_success "系统性能良好，暂无优化建议"
    fi
    
    # 保存建议到文件
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] 性能优化建议:" >> "$METRICS_DIR/optimization-recommendations.log"
    for recommendation in "${recommendations[@]}"; do
        echo "  - $recommendation" >> "$METRICS_DIR/optimization-recommendations.log"
    done
}

# 生成性能报告
generate_performance_report() {
    log_header "生成性能报告"
    
    # 收集当前性能指标
    local cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' | cut -d. -f1)
    local memory_info=$(vm_stat | grep -E "Pages (free|active|inactive|speculative|wired)" | awk '{print $3}' | sed 's/\.//')
    local page_size=4096
    local free_pages=$(echo "$memory_info" | sed -n '1p')
    local active_pages=$(echo "$memory_info" | sed -n '2p')
    local inactive_pages=$(echo "$memory_info" | sed -n '3p')
    local speculative_pages=$(echo "$memory_info" | sed -n '4p')
    local wired_pages=$(echo "$memory_info" | sed -n '5p')
    local total_memory=$(( (free_pages + active_pages + inactive_pages + speculative_pages + wired_pages) * page_size / 1024 / 1024 ))
    local used_memory=$(( (active_pages + inactive_pages + wired_pages) * page_size / 1024 / 1024 ))
    local memory_usage=$(( used_memory * 100 / total_memory ))
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
    
    # 生成HTML报告
    cat > "$PERFORMANCE_REPORT" << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>N8N系统性能报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; }
        .metric-card.warning { border-left-color: #ffc107; }
        .metric-card.critical { border-left-color: #dc3545; }
        .metric-card.success { border-left-color: #28a745; }
        .metric-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .metric-label { color: #6c757d; font-size: 0.9em; }
        .chart-container { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .recommendations { background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .recommendations ul { margin: 10px 0; padding-left: 20px; }
        .timestamp { text-align: center; color: #6c757d; margin-top: 20px; }
        .status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
        .status-success { background-color: #28a745; }
        .status-warning { background-color: #ffc107; }
        .status-critical { background-color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>N8N企业级自动化工作流平台性能报告</h1>
            <p>性能监控执行时间: $(date '+%Y-%m-%d %H:%M:%S')</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card $([ $cpu_usage -ge $CPU_CRITICAL_THRESHOLD ] && echo "critical" || ([ $cpu_usage -ge $CPU_WARNING_THRESHOLD ] && echo "warning" || echo "success"))">
                <div class="metric-label">
                    <span class="status-indicator status-$([ $cpu_usage -ge $CPU_CRITICAL_THRESHOLD ] && echo "critical" || ([ $cpu_usage -ge $CPU_WARNING_THRESHOLD ] && echo "warning" || echo "success"))"></span>
                    CPU使用率
                </div>
                <div class="metric-value">${cpu_usage}%</div>
            </div>
            
            <div class="metric-card $([ $memory_usage -ge $MEMORY_CRITICAL_THRESHOLD ] && echo "critical" || ([ $memory_usage -ge $MEMORY_WARNING_THRESHOLD ] && echo "warning" || echo "success"))">
                <div class="metric-label">
                    <span class="status-indicator status-$([ $memory_usage -ge $MEMORY_CRITICAL_THRESHOLD ] && echo "critical" || ([ $memory_usage -ge $MEMORY_WARNING_THRESHOLD ] && echo "warning" || echo "success"))"></span>
                    内存使用率
                </div>
                <div class="metric-value">${memory_usage}%</div>
                <div class="metric-label">${used_memory}MB / ${total_memory}MB</div>
            </div>
            
            <div class="metric-card $([ $disk_usage -ge $DISK_CRITICAL_THRESHOLD ] && echo "critical" || ([ $disk_usage -ge $DISK_WARNING_THRESHOLD ] && echo "warning" || echo "success"))">
                <div class="metric-label">
                    <span class="status-indicator status-$([ $disk_usage -ge $DISK_CRITICAL_THRESHOLD ] && echo "critical" || ([ $disk_usage -ge $DISK_WARNING_THRESHOLD ] && echo "warning" || echo "success"))"></span>
                    磁盘使用率
                </div>
                <div class="metric-value">${disk_usage}%</div>
            </div>
            
            <div class="metric-card success">
                <div class="metric-label">
                    <span class="status-indicator status-success"></span>
                    系统负载
                </div>
                <div class="metric-value">$(uptime | awk -F'load averages:' '{print $2}' | awk '{print $1}' | sed 's/,//')</div>
            </div>
        </div>
        
        <div class="chart-container">
            <h3>服务状态概览</h3>
            <div class="metrics-grid">
                <div class="metric-card $(docker-compose ps n8n | grep -q "Up" && echo "success" || echo "critical")">
                    <div class="metric-label">
                        <span class="status-indicator status-$(docker-compose ps n8n | grep -q "Up" && echo "success" || echo "critical")"></span>
                        N8N服务
                    </div>
                    <div class="metric-value">$(docker-compose ps n8n | grep -q "Up" && echo "运行中" || echo "已停止")</div>
                </div>
                
                <div class="metric-card $(docker-compose ps postgres | grep -q "Up" && echo "success" || echo "critical")">
                    <div class="metric-label">
                        <span class="status-indicator status-$(docker-compose ps postgres | grep -q "Up" && echo "success" || echo "critical")"></span>
                        PostgreSQL
                    </div>
                    <div class="metric-value">$(docker-compose ps postgres | grep -q "Up" && echo "运行中" || echo "已停止")</div>
                </div>
                
                <div class="metric-card $(docker-compose ps redis | grep -q "Up" && echo "success" || echo "critical")">
                    <div class="metric-label">
                        <span class="status-indicator status-$(docker-compose ps redis | grep -q "Up" && echo "success" || echo "critical")"></span>
                        Redis
                    </div>
                    <div class="metric-value">$(docker-compose ps redis | grep -q "Up" && echo "运行中" || echo "已停止")</div>
                </div>
            </div>
        </div>
        
        <div class="recommendations">
            <h3>性能优化建议</h3>
            <ul>
                <li>定期监控系统资源使用情况</li>
                <li>优化工作流设计，减少资源消耗</li>
                <li>配置适当的缓存策略</li>
                <li>定期清理日志和临时文件</li>
                <li>监控数据库性能，优化慢查询</li>
                <li>根据负载情况调整容器资源限制</li>
                <li>实施负载均衡和高可用架构</li>
                <li>定期备份和维护数据库</li>
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
    
    log_success "性能报告已生成: $PERFORMANCE_REPORT"
}

# 完整性能监控
full_performance_monitoring() {
    log_header "开始完整性能监控"
    
    local start_time=$(date +%s)
    
    # 执行所有性能监控
    monitor_system_resources
    monitor_docker_performance
    monitor_n8n_performance
    monitor_database_performance
    monitor_redis_performance
    monitor_network_performance
    
    # 生成优化建议
    generate_optimization_recommendations
    
    # 生成性能报告
    generate_performance_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "完整性能监控完成，耗时: ${duration}秒"
}

# 快速性能检查
quick_performance_check() {
    log_header "开始快速性能检查"
    
    # 只执行关键性能检查
    monitor_system_resources
    monitor_n8n_performance
    
    log_success "快速性能检查完成"
}

# 实时性能监控
realtime_performance_monitoring() {
    log_header "开始实时性能监控"
    
    local interval=${1:-5}  # 默认5秒间隔
    local duration=${2:-300}  # 默认监控5分钟
    
    log_info "实时监控间隔: ${interval}秒，持续时间: ${duration}秒"
    
    local end_time=$(($(date +%s) + duration))
    
    while [ $(date +%s) -lt $end_time ]; do
        clear
        echo -e "${PURPLE}=== N8N实时性能监控 ===${NC}"
        echo "监控时间: $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        
        # 系统资源
        local cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
        echo -e "CPU使用率: ${cpu_usage}%"
        
        # 内存使用
        local memory_info=$(vm_stat | grep -E "Pages (free|active|inactive|speculative|wired)" | awk '{print $3}' | sed 's/\.//')
        local page_size=4096
        local free_pages=$(echo "$memory_info" | sed -n '1p')
        local active_pages=$(echo "$memory_info" | sed -n '2p')
        local inactive_pages=$(echo "$memory_info" | sed -n '3p')
        local speculative_pages=$(echo "$memory_info" | sed -n '4p')
        local wired_pages=$(echo "$memory_info" | sed -n '5p')
        local total_memory=$(( (free_pages + active_pages + inactive_pages + speculative_pages + wired_pages) * page_size / 1024 / 1024 ))
        local used_memory=$(( (active_pages + inactive_pages + wired_pages) * page_size / 1024 / 1024 ))
        local memory_usage=$(( used_memory * 100 / total_memory ))
        
        echo -e "内存使用率: ${memory_usage}% (${used_memory}MB/${total_memory}MB)"
        
        # 磁盘使用
        local disk_usage=$(df -h . | tail -1 | awk '{print $5}')
        echo -e "磁盘使用率: $disk_usage"
        
        # 系统负载
        local load_avg=$(uptime | awk -F'load averages:' '{print $2}' | awk '{print $1}' | sed 's/,//')
        echo -e "系统负载: $load_avg"
        
        echo ""
        echo -e "${CYAN}=== 服务状态 ===${NC}"
        
        # N8N状态
        if docker-compose ps n8n | grep -q "Up"; then
            echo -e "${GREEN}✓${NC} N8N服务: 运行中"
        else
            echo -e "${RED}✗${NC} N8N服务: 已停止"
        fi
        
        # PostgreSQL状态
        if docker-compose ps postgres | grep -q "Up"; then
            echo -e "${GREEN}✓${NC} PostgreSQL: 运行中"
        else
            echo -e "${RED}✗${NC} PostgreSQL: 已停止"
        fi
        
        # Redis状态
        if docker-compose ps redis | grep -q "Up"; then
            echo -e "${GREEN}✓${NC} Redis: 运行中"
        else
            echo -e "${RED}✗${NC} Redis: 已停止"
        fi
        
        echo ""
        echo "按 Ctrl+C 退出监控"
        
        sleep "$interval"
    done
    
    log_success "实时性能监控结束"
}

# 显示使用帮助
show_help() {
    echo "N8N企业级自动化工作流平台性能监控和优化脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  monitor                 执行完整性能监控"
    echo "  quick                   执行快速性能检查"
    echo "  realtime [间隔] [时长]   实时性能监控"
    echo "  system                  监控系统资源"
    echo "  docker                  监控Docker容器性能"
    echo "  n8n                     监控N8N性能"
    echo "  database                监控数据库性能"
    echo "  redis                   监控Redis性能"
    echo "  network                 监控网络性能"
    echo "  optimize                生成优化建议"
    echo "  report                  生成性能报告"
    echo ""
    echo "示例:"
    echo "  $0 monitor              # 执行完整性能监控"
    echo "  $0 quick                # 执行快速性能检查"
    echo "  $0 realtime 10 600      # 实时监控，10秒间隔，持续10分钟"
    echo "  $0 system               # 只监控系统资源"
    echo "  $0 n8n                  # 只监控N8N性能"
    echo "  $0 optimize             # 生成优化建议"
    echo "  $0 report               # 生成性能报告"
    echo ""
    echo "性能阈值:"
    echo "  CPU使用率: 警告>${CPU_WARNING_THRESHOLD}%, 严重>${CPU_CRITICAL_THRESHOLD}%"
    echo "  内存使用率: 警告>${MEMORY_WARNING_THRESHOLD}%, 严重>${MEMORY_CRITICAL_THRESHOLD}%"
    echo "  磁盘使用率: 警告>${DISK_WARNING_THRESHOLD}%, 严重>${DISK_CRITICAL_THRESHOLD}%"
    echo "  响应时间: 警告>${RESPONSE_TIME_WARNING}ms, 严重>${RESPONSE_TIME_CRITICAL}ms"
    echo ""
    echo "建议:"
    echo "  - 定期执行性能监控（建议每天一次）"
    echo "  - 在高负载时期使用实时监控"
    echo "  - 根据优化建议调整系统配置"
    echo "  - 保存性能报告用于趋势分析"
    echo ""
}

# 主函数
main() {
    # 创建性能监控目录
    create_performance_directories
    
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    local command="$1"
    shift
    
    case $command in
        "monitor")
            full_performance_monitoring
            ;;
        "quick")
            quick_performance_check
            ;;
        "realtime")
            realtime_performance_monitoring "$@"
            ;;
        "system")
            monitor_system_resources
            ;;
        "docker")
            monitor_docker_performance
            ;;
        "n8n")
            monitor_n8n_performance
            ;;
        "database")
            monitor_database_performance
            ;;
        "redis")
            monitor_redis_performance
            ;;
        "network")
            monitor_network_performance
            ;;
        "optimize")
            generate_optimization_recommendations
            ;;
        "report")
            generate_performance_report
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