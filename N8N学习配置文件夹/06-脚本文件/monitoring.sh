#!/bin/bash

# N8N 自动化平台监控脚本
# 提供健康检查、性能监控、日志分析等功能

set -euo pipefail

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MONITORING_TYPE="${1:-health}"
ENVIRONMENT="${2:-production}"

# 监控配置
HEALTH_CHECK_INTERVAL=30
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=90
ALERT_THRESHOLD_RESPONSE_TIME=5000

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

# 发送告警通知
send_alert() {
    local severity="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # 记录告警日志
    echo "[$timestamp] [$severity] $message" >> "$PROJECT_ROOT/logs/alerts.log"
    
    # 发送Slack通知（如果配置了）
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local color="warning"
        [[ "$severity" == "CRITICAL" ]] && color="danger"
        [[ "$severity" == "INFO" ]] && color="good"
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"N8N监控告警\",
                    \"text\": \"$message\",
                    \"fields\": [
                        {\"title\": \"环境\", \"value\": \"$ENVIRONMENT\", \"short\": true},
                        {\"title\": \"时间\", \"value\": \"$timestamp\", \"short\": true},
                        {\"title\": \"严重程度\", \"value\": \"$severity\", \"short\": true}
                    ]
                }]
            }" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
    
    # 发送邮件通知（如果配置了）
    if [[ -n "${ALERT_EMAIL:-}" ]] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "N8N监控告警 - $severity" "$ALERT_EMAIL" || true
    fi
}

# 检查服务健康状态
check_service_health() {
    log_info "检查服务健康状态..."
    
    local services=("n8n" "postgres" "redis" "nginx")
    local failed_services=()
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up"; then
            log_success "$service 服务运行正常"
        else
            log_error "$service 服务异常"
            failed_services+=("$service")
        fi
    done
    
    if [[ ${#failed_services[@]} -gt 0 ]]; then
        send_alert "CRITICAL" "服务异常: ${failed_services[*]}"
        return 1
    fi
    
    return 0
}

# 检查HTTP端点健康状态
check_http_endpoints() {
    log_info "检查HTTP端点健康状态..."
    
    local endpoints=(
        "http://localhost:5678/healthz:N8N主服务"
        "http://localhost:3000/health:前端服务"
        "http://localhost:9000/health:AI智能体"
        "http://localhost:8080/health:Nginx"
    )
    
    local failed_endpoints=()
    
    for endpoint_info in "${endpoints[@]}"; do
        local endpoint="${endpoint_info%:*}"
        local name="${endpoint_info#*:}"
        
        local start_time=$(date +%s%3N)
        if curl -f -s --max-time 10 "$endpoint" > /dev/null 2>&1; then
            local end_time=$(date +%s%3N)
            local response_time=$((end_time - start_time))
            
            if [[ $response_time -gt $ALERT_THRESHOLD_RESPONSE_TIME ]]; then
                log_warning "$name 响应时间过长: ${response_time}ms"
                send_alert "WARNING" "$name 响应时间过长: ${response_time}ms"
            else
                log_success "$name 健康检查通过 (${response_time}ms)"
            fi
        else
            log_error "$name 健康检查失败"
            failed_endpoints+=("$name")
        fi
    done
    
    if [[ ${#failed_endpoints[@]} -gt 0 ]]; then
        send_alert "CRITICAL" "HTTP端点异常: ${failed_endpoints[*]}"
        return 1
    fi
    
    return 0
}

# 检查数据库连接
check_database_connection() {
    log_info "检查数据库连接..."
    
    # PostgreSQL连接检查
    if docker-compose exec -T postgres pg_isready -U "${POSTGRES_USER:-n8n}" > /dev/null 2>&1; then
        log_success "PostgreSQL连接正常"
    else
        log_error "PostgreSQL连接失败"
        send_alert "CRITICAL" "PostgreSQL数据库连接失败"
        return 1
    fi
    
    # Redis连接检查
    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log_success "Redis连接正常"
    else
        log_error "Redis连接失败"
        send_alert "CRITICAL" "Redis连接失败"
        return 1
    fi
    
    return 0
}

# 检查系统资源使用情况
check_system_resources() {
    log_info "检查系统资源使用情况..."
    
    # CPU使用率
    local cpu_usage=$(top -l 1 -s 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
    cpu_usage=${cpu_usage%.*}  # 去掉小数部分
    
    if [[ $cpu_usage -gt $ALERT_THRESHOLD_CPU ]]; then
        log_warning "CPU使用率过高: ${cpu_usage}%"
        send_alert "WARNING" "CPU使用率过高: ${cpu_usage}%"
    else
        log_success "CPU使用率正常: ${cpu_usage}%"
    fi
    
    # 内存使用率
    local memory_info=$(vm_stat)
    local pages_free=$(echo "$memory_info" | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
    local pages_active=$(echo "$memory_info" | grep "Pages active" | awk '{print $3}' | sed 's/\.//')
    local pages_inactive=$(echo "$memory_info" | grep "Pages inactive" | awk '{print $3}' | sed 's/\.//')
    local pages_speculative=$(echo "$memory_info" | grep "Pages speculative" | awk '{print $3}' | sed 's/\.//')
    local pages_wired=$(echo "$memory_info" | grep "Pages wired down" | awk '{print $4}' | sed 's/\.//')
    
    local total_pages=$((pages_free + pages_active + pages_inactive + pages_speculative + pages_wired))
    local used_pages=$((pages_active + pages_inactive + pages_speculative + pages_wired))
    local memory_usage=$((used_pages * 100 / total_pages))
    
    if [[ $memory_usage -gt $ALERT_THRESHOLD_MEMORY ]]; then
        log_warning "内存使用率过高: ${memory_usage}%"
        send_alert "WARNING" "内存使用率过高: ${memory_usage}%"
    else
        log_success "内存使用率正常: ${memory_usage}%"
    fi
    
    # 磁盘使用率
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [[ $disk_usage -gt $ALERT_THRESHOLD_DISK ]]; then
        log_warning "磁盘使用率过高: ${disk_usage}%"
        send_alert "WARNING" "磁盘使用率过高: ${disk_usage}%"
    else
        log_success "磁盘使用率正常: ${disk_usage}%"
    fi
}

# 检查Docker容器状态
check_docker_containers() {
    log_info "检查Docker容器状态..."
    
    local containers=$(docker-compose ps --services)
    local unhealthy_containers=()
    
    for container in $containers; do
        local status=$(docker-compose ps "$container" | tail -n +3 | awk '{print $4}')
        local health=$(docker inspect --format='{{.State.Health.Status}}' "${PROJECT_NAME:-n8n}_${container}_1" 2>/dev/null || echo "unknown")
        
        if [[ "$status" == "Up" ]]; then
            if [[ "$health" == "healthy" ]] || [[ "$health" == "unknown" ]]; then
                log_success "$container 容器运行正常"
            else
                log_warning "$container 容器健康检查异常: $health"
                unhealthy_containers+=("$container")
            fi
        else
            log_error "$container 容器状态异常: $status"
            unhealthy_containers+=("$container")
        fi
    done
    
    if [[ ${#unhealthy_containers[@]} -gt 0 ]]; then
        send_alert "WARNING" "容器状态异常: ${unhealthy_containers[*]}"
        return 1
    fi
    
    return 0
}

# 检查日志错误
check_logs_for_errors() {
    log_info "检查应用日志错误..."
    
    local log_files=(
        "$PROJECT_ROOT/logs/n8n.log"
        "$PROJECT_ROOT/logs/app.log"
        "$PROJECT_ROOT/logs/error.log"
    )
    
    local error_count=0
    local recent_errors=()
    
    for log_file in "${log_files[@]}"; do
        if [[ -f "$log_file" ]]; then
            # 检查最近5分钟的错误日志
            local recent_error_count=$(grep -c "ERROR\|FATAL" "$log_file" 2>/dev/null | tail -n 100 | wc -l || echo "0")
            error_count=$((error_count + recent_error_count))
            
            if [[ $recent_error_count -gt 0 ]]; then
                local errors=$(grep "ERROR\|FATAL" "$log_file" | tail -n 5)
                recent_errors+=("$log_file: $errors")
            fi
        fi
    done
    
    if [[ $error_count -gt 10 ]]; then
        log_warning "发现大量错误日志: $error_count 条"
        send_alert "WARNING" "发现大量错误日志: $error_count 条"
    elif [[ $error_count -gt 0 ]]; then
        log_info "发现少量错误日志: $error_count 条"
    else
        log_success "未发现错误日志"
    fi
}

# 性能监控
monitor_performance() {
    log_info "开始性能监控..."
    
    local metrics_file="$PROJECT_ROOT/logs/metrics.log"
    mkdir -p "$(dirname "$metrics_file")"
    
    while true; do
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        
        # 收集系统指标
        local cpu_usage=$(top -l 1 -s 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
        local memory_info=$(vm_stat)
        local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
        
        # 收集应用指标
        local n8n_response_time=0
        if curl -f -s --max-time 5 -w "%{time_total}" -o /dev/null "http://localhost:5678/healthz" > /tmp/response_time 2>/dev/null; then
            n8n_response_time=$(cat /tmp/response_time | awk '{print $1*1000}')
        fi
        
        # 记录指标
        echo "$timestamp,cpu:$cpu_usage,disk:$disk_usage,n8n_response:$n8n_response_time" >> "$metrics_file"
        
        # 检查告警阈值
        cpu_usage=${cpu_usage%.*}
        if [[ $cpu_usage -gt $ALERT_THRESHOLD_CPU ]]; then
            send_alert "WARNING" "CPU使用率过高: ${cpu_usage}%"
        fi
        
        if [[ ${disk_usage} -gt $ALERT_THRESHOLD_DISK ]]; then
            send_alert "WARNING" "磁盘使用率过高: ${disk_usage}%"
        fi
        
        if [[ $(echo "$n8n_response_time > $ALERT_THRESHOLD_RESPONSE_TIME" | bc -l) -eq 1 ]]; then
            send_alert "WARNING" "N8N响应时间过长: ${n8n_response_time}ms"
        fi
        
        sleep $HEALTH_CHECK_INTERVAL
    done
}

# 生成监控报告
generate_monitoring_report() {
    log_info "生成监控报告..."
    
    local report_file="$PROJECT_ROOT/logs/monitoring-report-$(date +%Y%m%d-%H%M%S).html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>N8N监控报告</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #f9f9f9; border-radius: 3px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>N8N自动化平台监控报告</h1>
        <p>生成时间: $(date)</p>
        <p>环境: $ENVIRONMENT</p>
    </div>
    
    <div class="section">
        <h2>系统概览</h2>
        <div class="metric">
            <strong>CPU使用率:</strong> $(top -l 1 -s 0 | grep "CPU usage" | awk '{print $3}')
        </div>
        <div class="metric">
            <strong>内存使用:</strong> $(vm_stat | grep "Pages active" | awk '{print $3}') 活跃页面
        </div>
        <div class="metric">
            <strong>磁盘使用:</strong> $(df -h / | awk 'NR==2 {print $5}')
        </div>
    </div>
    
    <div class="section">
        <h2>服务状态</h2>
        <table>
            <tr><th>服务</th><th>状态</th><th>健康检查</th></tr>
EOF
    
    # 添加服务状态信息
    local services=("n8n" "postgres" "redis" "nginx")
    for service in "${services[@]}"; do
        local status=$(docker-compose ps "$service" 2>/dev/null | tail -n +3 | awk '{print $4}' || echo "未知")
        local health_class="error"
        [[ "$status" == "Up" ]] && health_class="success"
        
        echo "            <tr><td>$service</td><td class=\"$health_class\">$status</td><td>-</td></tr>" >> "$report_file"
    done
    
    cat >> "$report_file" << EOF
        </table>
    </div>
    
    <div class="section">
        <h2>最近告警</h2>
        <pre>$(tail -n 20 "$PROJECT_ROOT/logs/alerts.log" 2>/dev/null || echo "暂无告警记录")</pre>
    </div>
    
    <div class="section">
        <h2>性能趋势</h2>
        <p>详细性能数据请查看: logs/metrics.log</p>
        <pre>$(tail -n 10 "$PROJECT_ROOT/logs/metrics.log" 2>/dev/null || echo "暂无性能数据")</pre>
    </div>
    
</body>
</html>
EOF
    
    log_success "监控报告已生成: $report_file"
}

# 主监控流程
main() {
    log_info "开始监控: $MONITORING_TYPE"
    
    # 创建日志目录
    mkdir -p "$PROJECT_ROOT/logs"
    
    case "$MONITORING_TYPE" in
        "health")
            check_service_health
            check_http_endpoints
            check_database_connection
            check_system_resources
            check_docker_containers
            check_logs_for_errors
            ;;
        "performance")
            monitor_performance
            ;;
        "report")
            generate_monitoring_report
            ;;
        "continuous")
            log_info "启动持续监控模式..."
            while true; do
                check_service_health
                check_http_endpoints
                check_database_connection
                check_system_resources
                check_docker_containers
                check_logs_for_errors
                
                log_info "等待 $HEALTH_CHECK_INTERVAL 秒后进行下次检查..."
                sleep $HEALTH_CHECK_INTERVAL
            done
            ;;
        *)
            log_error "不支持的监控类型: $MONITORING_TYPE"
            log_error "支持的类型: health, performance, report, continuous"
            exit 1
            ;;
    esac
    
    log_success "监控任务完成"
}

# 显示帮助信息
show_help() {
    cat << EOF
N8N 自动化平台监控脚本

用法:
    $0 [监控类型] [环境]

参数:
    监控类型    要执行的监控类型，默认: health
               可选值: health, performance, report, continuous
    环境       运行环境，默认: production

示例:
    $0                    # 执行健康检查
    $0 health            # 执行健康检查
    $0 performance       # 启动性能监控
    $0 report            # 生成监控报告
    $0 continuous        # 启动持续监控

监控类型说明:
    health       一次性健康检查
    performance  启动性能监控（持续运行）
    report       生成HTML监控报告
    continuous   持续健康监控（每30秒检查一次）

环境变量:
    SLACK_WEBHOOK_URL    Slack通知webhook地址
    ALERT_EMAIL         告警邮件地址
    HEALTH_CHECK_INTERVAL  健康检查间隔（秒），默认30

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