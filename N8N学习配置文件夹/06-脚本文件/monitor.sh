#!/bin/bash

# N8N自动化平台监控脚本
# 功能: 全面监控N8N平台的运行状态，包括系统资源、应用状态、数据库、网络和工作流
# 作者: N8N自动化团队
# 版本: 1.0.0

set -euo pipefail

# 脚本配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="$PROJECT_ROOT/logs"
MONITOR_VERSION="1.0.0"

# 监控配置
ENVIRONMENT="${ENVIRONMENT:-development}"
MONITOR_MODE="${MONITOR_MODE:-full}"
GENERATE_REPORT="${GENERATE_REPORT:-false}"
CLEANUP_OLD_FILES="${CLEANUP_OLD_FILES:-true}"
ENABLE_ALERTS="${ENABLE_ALERTS:-true}"
NOTIFY_ON_WARNING="${NOTIFY_ON_WARNING:-true}"
DEBUG="${DEBUG:-false}"

# 阈值配置
CPU_WARNING_THRESHOLD="${CPU_WARNING_THRESHOLD:-80}"
CPU_CRITICAL_THRESHOLD="${CPU_CRITICAL_THRESHOLD:-90}"
MEMORY_WARNING_THRESHOLD="${MEMORY_WARNING_THRESHOLD:-80}"
MEMORY_CRITICAL_THRESHOLD="${MEMORY_CRITICAL_THRESHOLD:-90}"
DISK_WARNING_THRESHOLD="${DISK_WARNING_THRESHOLD:-80}"
DISK_CRITICAL_THRESHOLD="${DISK_CRITICAL_THRESHOLD:-90}"
LOAD_WARNING_THRESHOLD="${LOAD_WARNING_THRESHOLD:-2.0}"
LOAD_CRITICAL_THRESHOLD="${LOAD_CRITICAL_THRESHOLD:-4.0}"
RESPONSE_TIME_WARNING_THRESHOLD="${RESPONSE_TIME_WARNING_THRESHOLD:-5000}"
RESPONSE_TIME_CRITICAL_THRESHOLD="${RESPONSE_TIME_CRITICAL_THRESHOLD:-10000}"
NETWORK_RESPONSE_WARNING_THRESHOLD="${NETWORK_RESPONSE_WARNING_THRESHOLD:-3000}"
NETWORK_RESPONSE_CRITICAL_THRESHOLD="${NETWORK_RESPONSE_CRITICAL_THRESHOLD:-5000}"
SUCCESS_RATE_WARNING_THRESHOLD="${SUCCESS_RATE_WARNING_THRESHOLD:-90}"
SUCCESS_RATE_CRITICAL_THRESHOLD="${SUCCESS_RATE_CRITICAL_THRESHOLD:-80}"
FAILED_EXECUTIONS_WARNING_THRESHOLD="${FAILED_EXECUTIONS_WARNING_THRESHOLD:-5}"
FAILED_EXECUTIONS_CRITICAL_THRESHOLD="${FAILED_EXECUTIONS_CRITICAL_THRESHOLD:-10}"
RUNNING_EXECUTIONS_WARNING_THRESHOLD="${RUNNING_EXECUTIONS_WARNING_THRESHOLD:-10}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[INFO]${NC} ${WHITE}[$timestamp]${NC} $1" | tee -a "$LOGS_DIR/monitor.log"
}

log_success() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[SUCCESS]${NC} ${WHITE}[$timestamp]${NC} $1" | tee -a "$LOGS_DIR/monitor.log"
}

log_warning() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}[WARNING]${NC} ${WHITE}[$timestamp]${NC} $1" | tee -a "$LOGS_DIR/monitor.log"
}

log_error() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[ERROR]${NC} ${WHITE}[$timestamp]${NC} $1" | tee -a "$LOGS_DIR/monitor.log"
}

log_debug() {
    if [[ "$DEBUG" == "true" ]]; then
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        echo -e "${PURPLE}[DEBUG]${NC} ${WHITE}[$timestamp]${NC} $1" | tee -a "$LOGS_DIR/monitor.log"
    fi
}

# 创建必要目录
create_directories() {
    mkdir -p "$LOGS_DIR"
    mkdir -p "$PROJECT_ROOT/backups"
    mkdir -p "$PROJECT_ROOT/reports"
}

# 加载环境变量
load_environment() {
    local env_file="$PROJECT_ROOT/.env"
    if [[ -f "$env_file" ]]; then
        log_debug "加载环境变量文件: $env_file"
        set -a
        source "$env_file"
        set +a
    fi
    
    # 加载特定环境的配置文件
    local env_specific_file="$PROJECT_ROOT/.env.$ENVIRONMENT"
    if [[ -f "$env_specific_file" ]]; then
        log_debug "加载特定环境配置: $env_specific_file"
        set -a
        source "$env_specific_file"
        set +a
    fi
}

# 检查依赖
check_dependencies() {
    log_info "检查监控依赖..."
    
    local missing_deps=()
    
    # 基础命令检查
    local required_commands=("curl" "netstat" "ps" "df" "uptime")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_deps+=("$cmd")
        fi
    done
    
    # 可选命令检查
    local optional_commands=("jq" "bc" "sqlite3" "psql" "mysql")
    for cmd in "${optional_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_warning "可选依赖未安装: $cmd"
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "缺少必需依赖: ${missing_deps[*]}"
        log_error "请安装缺少的依赖后重试"
        return 1
    fi
    
    log_success "依赖检查通过"
}

# 发送通知
send_notification() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # 记录通知日志
    echo "[$timestamp] $message" >> "$LOGS_DIR/notifications.log"
    
    # 如果禁用告警，直接返回
    if [[ "$ENABLE_ALERTS" != "true" ]]; then
        return 0
    fi
    
    log_debug "发送通知: $message"
    
    # 钉钉通知
    if [[ -n "${DINGTALK_WEBHOOK:-}" ]]; then
        local payload="{\"msgtype\":\"text\",\"text\":{\"content\":\"$message\"}}"
        curl -s -X POST "$DINGTALK_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "$payload" &>/dev/null || true
    fi
    
    # 企业微信通知
    if [[ -n "${WECHAT_WEBHOOK:-}" ]]; then
        local payload="{\"msgtype\":\"text\",\"text\":{\"content\":\"$message\"}}"
        curl -s -X POST "$WECHAT_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "$payload" &>/dev/null || true
    fi
    
    # Slack通知
    if [[ -n "${SLACK_WEBHOOK:-}" ]]; then
        local payload="{\"text\":\"$message\"}"
        curl -s -X POST "$SLACK_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "$payload" &>/dev/null || true
    fi
    
    # 邮件通知
    if [[ -n "${EMAIL_RECIPIENT:-}" ]] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "N8N监控告警" "$EMAIL_RECIPIENT" &>/dev/null || true
    fi
    
    # 自定义Webhook
    if [[ -n "${CUSTOM_WEBHOOK:-}" ]]; then
        local payload="{\"message\":\"$message\",\"timestamp\":\"$timestamp\",\"environment\":\"$ENVIRONMENT\"}"
        curl -s -X POST "$CUSTOM_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "$payload" &>/dev/null || true
    fi
}

# 系统监控
monitor_system() {
    log_info "执行系统监控..."
    
    local metrics=()
    
    # CPU使用率
    local cpu_usage
    if command -v top &> /dev/null; then
        cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' || echo "0")
    else
        cpu_usage="0"
    fi
    metrics+=("cpu_usage:$cpu_usage")
    
    # 内存使用率
    local memory_usage
    if command -v vm_stat &> /dev/null; then
        local pages_free=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        local pages_active=$(vm_stat | grep "Pages active" | awk '{print $3}' | sed 's/\.//')
        local pages_inactive=$(vm_stat | grep "Pages inactive" | awk '{print $3}' | sed 's/\.//')
        local pages_speculative=$(vm_stat | grep "Pages speculative" | awk '{print $3}' | sed 's/\.//')
        local pages_wired=$(vm_stat | grep "Pages wired down" | awk '{print $4}' | sed 's/\.//')
        
        local total_pages=$((pages_free + pages_active + pages_inactive + pages_speculative + pages_wired))
        local used_pages=$((pages_active + pages_inactive + pages_speculative + pages_wired))
        
        if [[ $total_pages -gt 0 ]]; then
            memory_usage=$((used_pages * 100 / total_pages))
        else
            memory_usage="0"
        fi
    else
        memory_usage="0"
    fi
    metrics+=("memory_usage:$memory_usage")
    
    # 磁盘使用率
    local disk_usage
    disk_usage=$(df -h "$PROJECT_ROOT" | tail -1 | awk '{print $5}' | sed 's/%//' || echo "0")
    metrics+=("disk_usage:$disk_usage")
    
    # 系统负载
    local load_average
    load_average=$(uptime | awk -F'load averages:' '{print $2}' | awk '{print $1}' | sed 's/,//' || echo "0")
    metrics+=("load_average:$load_average")
    
    # 网络连接数
    local network_connections
    network_connections=$(netstat -an 2>/dev/null | grep ESTABLISHED | wc -l | tr -d ' ' || echo "0")
    metrics+=("network_connections:$network_connections")
    
    # 检查阈值并生成告警
    check_system_thresholds "$cpu_usage" "$memory_usage" "$disk_usage" "$load_average"
    
    # 记录指标
    record_metrics "system" "${metrics[@]}"
    
    log_success "系统监控完成"
}

# 应用监控
monitor_application() {
    log_info "执行应用监控..."
    
    local metrics=()
    local health_status="unknown"
    local response_time="0"
    
    # 健康检查
    local health_url="http://${N8N_HOST:-localhost}:${N8N_PORT:-5678}/healthz"
    local start_time=$(date +%s%3N)
    
    if curl -f -s --max-time 10 "$health_url" &>/dev/null; then
        health_status="healthy"
        local end_time=$(date +%s%3N)
        response_time=$((end_time - start_time))
    else
        health_status="unhealthy"
        response_time="timeout"
    fi
    
    metrics+=("health_status:$health_status")
    metrics+=("response_time:$response_time")
    
    # 应用进程监控
    case "${DEPLOY_MODE:-docker}" in
        docker)
            monitor_docker_application metrics
            ;;
        kubernetes)
            monitor_kubernetes_application metrics
            ;;
        standalone)
            monitor_standalone_application metrics
            ;;
    esac
    
    # 检查应用阈值
    check_application_thresholds "$health_status" "$response_time"
    
    # 记录指标
    record_metrics "application" "${metrics[@]}"
    
    log_success "应用监控完成"
}

# Docker应用监控
monitor_docker_application() {
    local -n metrics_ref=$1
    
    # 容器状态
    local container_status
    container_status=$(docker inspect n8n --format '{{.State.Status}}' 2>/dev/null || echo "not_found")
    metrics_ref+=("container_status:$container_status")
    
    # 容器资源使用
    if [[ "$container_status" == "running" ]]; then
        local stats
        stats=$(docker stats n8n --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" 2>/dev/null | tail -1)
        
        if [[ -n "$stats" ]]; then
            local cpu_percent=$(echo "$stats" | awk '{print $1}' | sed 's/%//')
            local memory_usage=$(echo "$stats" | awk '{print $2}' | cut -d'/' -f1)
            local network_io=$(echo "$stats" | awk '{print $3}')
            local block_io=$(echo "$stats" | awk '{print $4}')
            
            metrics_ref+=("container_cpu:$cpu_percent")
            metrics_ref+=("container_memory:$memory_usage")
            metrics_ref+=("container_network_io:$network_io")
            metrics_ref+=("container_block_io:$block_io")
        fi
    fi
    
    # 容器重启次数
    local restart_count
    restart_count=$(docker inspect n8n --format '{{.RestartCount}}' 2>/dev/null || echo "0")
    metrics_ref+=("restart_count:$restart_count")
}

# Kubernetes应用监控
monitor_kubernetes_application() {
    local -n metrics_ref=$1
    
    # Pod状态
    local pod_status
    pod_status=$(kubectl get pods -l app=n8n -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "Unknown")
    metrics_ref+=("pod_status:$pod_status")
    
    # Pod重启次数
    local restart_count
    restart_count=$(kubectl get pods -l app=n8n -o jsonpath='{.items[0].status.containerStatuses[0].restartCount}' 2>/dev/null || echo "0")
    metrics_ref+=("restart_count:$restart_count")
    
    # 资源使用情况
    if command -v kubectl &> /dev/null && kubectl top pods -l app=n8n &>/dev/null; then
        local resource_usage
        resource_usage=$(kubectl top pods -l app=n8n --no-headers 2>/dev/null | head -1)
        
        if [[ -n "$resource_usage" ]]; then
            local cpu_usage=$(echo "$resource_usage" | awk '{print $2}')
            local memory_usage=$(echo "$resource_usage" | awk '{print $3}')
            
            metrics_ref+=("pod_cpu:$cpu_usage")
            metrics_ref+=("pod_memory:$memory_usage")
        fi
    fi
}

# 独立应用监控
monitor_standalone_application() {
    local -n metrics_ref=$1
    
    # 进程状态
    local process_status="stopped"
    local pid=""
    
    if command -v systemctl &> /dev/null; then
        if systemctl is-active n8n &>/dev/null; then
            process_status="running"
            pid=$(systemctl show n8n --property=MainPID --value 2>/dev/null || echo "")
        fi
    elif command -v pm2 &> /dev/null; then
        if pm2 describe n8n &>/dev/null; then
            local pm2_status
            pm2_status=$(pm2 describe n8n | grep "status" | awk '{print $4}' | tr -d '│' | tr -d ' ')
            if [[ "$pm2_status" == "online" ]]; then
                process_status="running"
                pid=$(pm2 describe n8n | grep "pid" | awk '{print $4}' | tr -d '│' | tr -d ' ')
            fi
        fi
    fi
    
    metrics_ref+=("process_status:$process_status")
    metrics_ref+=("process_pid:$pid")
    
    # 进程资源使用
    if [[ -n "$pid" ]] && [[ "$pid" != "0" ]]; then
        local cpu_usage
        local memory_usage
        
        if command -v ps &> /dev/null; then
            local ps_output
            ps_output=$(ps -p "$pid" -o %cpu,%mem --no-headers 2>/dev/null || echo "0 0")
            cpu_usage=$(echo "$ps_output" | awk '{print $1}')
            memory_usage=$(echo "$ps_output" | awk '{print $2}')
            
            metrics_ref+=("process_cpu:$cpu_usage")
            metrics_ref+=("process_memory:$memory_usage")
        fi
    fi
}

# 数据库监控
monitor_database() {
    log_info "执行数据库监控..."
    
    local metrics=()
    local db_status="unknown"
    
    case "${DATABASE_TYPE:-sqlite}" in
        sqlite)
            monitor_sqlite_database metrics db_status
            ;;
        postgres)
            monitor_postgres_database metrics db_status
            ;;
        mysql)
            monitor_mysql_database metrics db_status
            ;;
    esac
    
    metrics+=("database_status:$db_status")
    
    # 检查数据库阈值
    check_database_thresholds "$db_status"
    
    # 记录指标
    record_metrics "database" "${metrics[@]}"
    
    log_success "数据库监控完成"
}

# SQLite数据库监控
monitor_sqlite_database() {
    local -n metrics_ref=$1
    local -n status_ref=$2
    
    local db_file="${DATABASE_SQLITE_DATABASE:-/home/node/.n8n/database.sqlite}"
    
    # 检查数据库文件是否存在
    if [[ -f "$db_file" ]]; then
        status_ref="healthy"
        
        # 数据库文件大小
        local db_size
        db_size=$(du -h "$db_file" 2>/dev/null | awk '{print $1}' || echo "0")
        metrics_ref+=("database_size:$db_size")
        
        # 数据库连接测试
        if command -v sqlite3 &> /dev/null; then
            if sqlite3 "$db_file" "SELECT 1;" &>/dev/null; then
                status_ref="healthy"
            else
                status_ref="connection_failed"
            fi
        fi
    else
        status_ref="file_not_found"
    fi
}

# PostgreSQL数据库监控
monitor_postgres_database() {
    local -n metrics_ref=$1
    local -n status_ref=$2
    
    local connection_string="postgresql://${POSTGRES_USER:-n8n}:${POSTGRES_PASSWORD:-n8n}@${POSTGRES_HOST:-localhost}:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-n8n}"
    
    # 连接测试
    if command -v psql &> /dev/null; then
        if psql "$connection_string" -c "SELECT 1;" &>/dev/null; then
            status_ref="healthy"
            
            # 数据库大小
            local db_size
            db_size=$(psql "$connection_string" -t -c "SELECT pg_size_pretty(pg_database_size('${POSTGRES_DB:-n8n}'));" 2>/dev/null | tr -d ' ' || echo "0")
            metrics_ref+=("database_size:$db_size")
            
            # 连接数
            local connection_count
            connection_count=$(psql "$connection_string" -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | tr -d ' ' || echo "0")
            metrics_ref+=("connection_count:$connection_count")
            
            # 慢查询数量
            local slow_queries
            slow_queries=$(psql "$connection_string" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '30 seconds';" 2>/dev/null | tr -d ' ' || echo "0")
            metrics_ref+=("slow_queries:$slow_queries")
        else
            status_ref="connection_failed"
        fi
    else
        status_ref="client_not_available"
    fi
}

# MySQL数据库监控
monitor_mysql_database() {
    local -n metrics_ref=$1
    local -n status_ref=$2
    
    local mysql_cmd="mysql -h${MYSQL_HOST:-localhost} -P${MYSQL_PORT:-3306} -u${MYSQL_USER:-n8n} -p${MYSQL_PASSWORD:-n8n} ${MYSQL_DATABASE:-n8n}"
    
    # 连接测试
    if command -v mysql &> /dev/null; then
        if echo "SELECT 1;" | $mysql_cmd &>/dev/null; then
            status_ref="healthy"
            
            # 数据库大小
            local db_size
            db_size=$(echo "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS 'DB Size in MB' FROM information_schema.tables WHERE table_schema='${MYSQL_DATABASE:-n8n}';" | $mysql_cmd -s 2>/dev/null || echo "0")
            metrics_ref+=("database_size:${db_size}MB")
            
            # 连接数
            local connection_count
            connection_count=$(echo "SHOW STATUS LIKE 'Threads_connected';" | $mysql_cmd -s | awk '{print $2}' 2>/dev/null || echo "0")
            metrics_ref+=("connection_count:$connection_count")
            
            # 慢查询数量
            local slow_queries
            slow_queries=$(echo "SHOW STATUS LIKE 'Slow_queries';" | $mysql_cmd -s | awk '{print $2}' 2>/dev/null || echo "0")
            metrics_ref+=("slow_queries:$slow_queries")
        else
            status_ref="connection_failed"
        fi
    else
        status_ref="client_not_available"
    fi
}

# 网络监控
monitor_network() {
    log_info "执行网络监控..."
    
    local metrics=()
    
    # 端口监听检查
    local port_status="closed"
    if netstat -an 2>/dev/null | grep ":${N8N_PORT:-5678}" | grep LISTEN &>/dev/null; then
        port_status="listening"
    fi
    metrics+=("port_status:$port_status")
    
    # HTTP响应检查
    local http_status="0"
    local response_time="0"
    
    local health_url="http://${N8N_HOST:-localhost}:${N8N_PORT:-5678}/healthz"
    local start_time=$(date +%s%3N)
    
    http_status=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "$health_url" 2>/dev/null || echo "0")
    
    if [[ "$http_status" == "200" ]]; then
        local end_time=$(date +%s%3N)
        response_time=$((end_time - start_time))
    fi
    
    metrics+=("http_status:$http_status")
    metrics+=("response_time:$response_time")
    
    # SSL证书检查（如果启用HTTPS）
    if [[ "${N8N_PROTOCOL:-http}" == "https" ]]; then
        local ssl_status="unknown"
        local ssl_expiry="unknown"
        
        if command -v openssl &> /dev/null; then
            local ssl_info
            ssl_info=$(echo | openssl s_client -servername "${N8N_HOST:-localhost}" -connect "${N8N_HOST:-localhost}:${N8N_PORT:-5678}" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
            
            if [[ -n "$ssl_info" ]]; then
                ssl_status="valid"
                ssl_expiry=$(echo "$ssl_info" | grep "notAfter" | cut -d'=' -f2)
            else
                ssl_status="invalid"
            fi
        fi
        
        metrics+=("ssl_status:$ssl_status")
        metrics+=("ssl_expiry:$ssl_expiry")
    fi
    
    # 检查网络阈值
    check_network_thresholds "$port_status" "$http_status" "$response_time"
    
    # 记录指标
    record_metrics "network" "${metrics[@]}"
    
    log_success "网络监控完成"
}

# 工作流监控
monitor_workflows() {
    log_info "执行工作流监控..."
    
    local metrics=()
    
    # 通过API获取工作流统计信息
    local api_url="http://${N8N_HOST:-localhost}:${N8N_PORT:-5678}/rest"
    local auth_header=""
    
    # 如果配置了API密钥，添加认证头
    if [[ -n "${N8N_API_KEY:-}" ]]; then
        auth_header="-H 'X-N8N-API-KEY: ${N8N_API_KEY}'"
    fi
    
    # 获取工作流数量
    local workflow_count="0"
    local active_workflows="0"
    
    if command -v curl &> /dev/null; then
        local workflows_response
        workflows_response=$(eval "curl -s --max-time 10 $auth_header '$api_url/workflows'" 2>/dev/null || echo '{"data":[]}')
        
        if command -v jq &> /dev/null; then
            workflow_count=$(echo "$workflows_response" | jq '.data | length' 2>/dev/null || echo "0")
            active_workflows=$(echo "$workflows_response" | jq '[.data[] | select(.active == true)] | length' 2>/dev/null || echo "0")
        fi
    fi
    
    metrics+=("workflow_count:$workflow_count")
    metrics+=("active_workflows:$active_workflows")
    
    # 获取执行统计
    local executions_response
    executions_response=$(eval "curl -s --max-time 10 $auth_header '$api_url/executions?limit=100'" 2>/dev/null || echo '{"data":[]}')
    
    local total_executions="0"
    local successful_executions="0"
    local failed_executions="0"
    local running_executions="0"
    
    if command -v jq &> /dev/null; then
        total_executions=$(echo "$executions_response" | jq '.data | length' 2>/dev/null || echo "0")
        successful_executions=$(echo "$executions_response" | jq '[.data[] | select(.finished == true and .mode != "error")] | length' 2>/dev/null || echo "0")
        failed_executions=$(echo "$executions_response" | jq '[.data[] | select(.mode == "error")] | length' 2>/dev/null || echo "0")
        running_executions=$(echo "$executions_response" | jq '[.data[] | select(.finished == false)] | length' 2>/dev/null || echo "0")
    fi
    
    metrics+=("total_executions:$total_executions")
    metrics+=("successful_executions:$successful_executions")
    metrics+=("failed_executions:$failed_executions")
    metrics+=("running_executions:$running_executions")
    
    # 计算成功率
    local success_rate="0"
    if [[ $total_executions -gt 0 ]]; then
        success_rate=$(( (successful_executions * 100) / total_executions ))
    fi
    metrics+=("success_rate:$success_rate")
    
    # 检查工作流阈值
    check_workflow_thresholds "$success_rate" "$failed_executions" "$running_executions"
    
    # 记录指标
    record_metrics "workflows" "${metrics[@]}"
    
    log_success "工作流监控完成"
}

# 检查系统阈值
check_system_thresholds() {
    local cpu_usage="$1"
    local memory_usage="$2"
    local disk_usage="$3"
    local load_average="$4"
    
    # CPU使用率告警
    if [[ $(echo "$cpu_usage > ${CPU_WARNING_THRESHOLD:-80}" | bc -l 2>/dev/null || echo "0") -eq 1 ]]; then
        if [[ $(echo "$cpu_usage > ${CPU_CRITICAL_THRESHOLD:-90}" | bc -l 2>/dev/null || echo "0") -eq 1 ]]; then
            send_alert "CRITICAL" "CPU使用率过高: ${cpu_usage}%"
        else
            send_alert "WARNING" "CPU使用率较高: ${cpu_usage}%"
        fi
    fi
    
    # 内存使用率告警
    if [[ $memory_usage -gt ${MEMORY_WARNING_THRESHOLD:-80} ]]; then
        if [[ $memory_usage -gt ${MEMORY_CRITICAL_THRESHOLD:-90} ]]; then
            send_alert "CRITICAL" "内存使用率过高: ${memory_usage}%"
        else
            send_alert "WARNING" "内存使用率较高: ${memory_usage}%"
        fi
    fi
    
    # 磁盘使用率告警
    if [[ $disk_usage -gt ${DISK_WARNING_THRESHOLD:-80} ]]; then
        if [[ $disk_usage -gt ${DISK_CRITICAL_THRESHOLD:-90} ]]; then
            send_alert "CRITICAL" "磁盘使用率过高: ${disk_usage}%"
        else
            send_alert "WARNING" "磁盘使用率较高: ${disk_usage}%"
        fi
    fi
    
    # 系统负载告警
    if command -v bc &> /dev/null; then
        if [[ $(echo "$load_average > ${LOAD_WARNING_THRESHOLD:-2.0}" | bc -l) -eq 1 ]]; then
            if [[ $(echo "$load_average > ${LOAD_CRITICAL_THRESHOLD:-4.0}" | bc -l) -eq 1 ]]; then
                send_alert "CRITICAL" "系统负载过高: $load_average"
            else
                send_alert "WARNING" "系统负载较高: $load_average"
            fi
        fi
    fi
}

# 检查应用阈值
check_application_thresholds() {
    local health_status="$1"
    local response_time="$2"
    
    # 健康状态告警
    if [[ "$health_status" != "healthy" ]]; then
        send_alert "CRITICAL" "应用健康检查失败: $health_status"
    fi
    
    # 响应时间告警
    if [[ "$response_time" != "timeout" ]] && [[ $response_time -gt 0 ]]; then
        if [[ $response_time -gt ${RESPONSE_TIME_WARNING_THRESHOLD:-5000} ]]; then
            if [[ $response_time -gt ${RESPONSE_TIME_CRITICAL_THRESHOLD:-10000} ]]; then
                send_alert "CRITICAL" "响应时间过长: ${response_time}ms"
            else
                send_alert "WARNING" "响应时间较长: ${response_time}ms"
            fi
        fi
    fi
}

# 检查数据库阈值
check_database_thresholds() {
    local db_status="$1"
    
    if [[ "$db_status" != "healthy" ]]; then
        send_alert "CRITICAL" "数据库状态异常: $db_status"
    fi
}

# 检查网络阈值
check_network_thresholds() {
    local port_status="$1"
    local http_status="$2"
    local response_time="$3"
    
    # 端口监听告警
    if [[ "$port_status" != "listening" ]]; then
        send_alert "CRITICAL" "应用端口未监听: ${N8N_PORT:-5678}"
    fi
    
    # HTTP状态告警
    if [[ "$http_status" != "200" ]]; then
        send_alert "CRITICAL" "HTTP状态异常: $http_status"
    fi
    
    # 网络响应时间告警
    if [[ $response_time -gt 0 ]]; then
        if [[ $response_time -gt ${NETWORK_RESPONSE_WARNING_THRESHOLD:-3000} ]]; then
            if [[ $response_time -gt ${NETWORK_RESPONSE_CRITICAL_THRESHOLD:-5000} ]]; then
                send_alert "CRITICAL" "网络响应时间过长: ${response_time}ms"
            else
                send_alert "WARNING" "网络响应时间较长: ${response_time}ms"
            fi
        fi
    fi
}

# 检查工作流阈值
check_workflow_thresholds() {
    local success_rate="$1"
    local failed_executions="$2"
    local running_executions="$3"
    
    # 成功率告警
    if [[ $success_rate -lt ${SUCCESS_RATE_WARNING_THRESHOLD:-90} ]]; then
        if [[ $success_rate -lt ${SUCCESS_RATE_CRITICAL_THRESHOLD:-80} ]]; then
            send_alert "CRITICAL" "工作流成功率过低: ${success_rate}%"
        else
            send_alert "WARNING" "工作流成功率较低: ${success_rate}%"
        fi
    fi
    
    # 失败执行数告警
    if [[ $failed_executions -gt ${FAILED_EXECUTIONS_WARNING_THRESHOLD:-5} ]]; then
        if [[ $failed_executions -gt ${FAILED_EXECUTIONS_CRITICAL_THRESHOLD:-10} ]]; then
            send_alert "CRITICAL" "工作流失败数过多: $failed_executions"
        else
            send_alert "WARNING" "工作流失败数较多: $failed_executions"
        fi
    fi
    
    # 运行中执行数告警
    if [[ $running_executions -gt ${RUNNING_EXECUTIONS_WARNING_THRESHOLD:-10} ]]; then
        send_alert "WARNING" "运行中工作流数量较多: $running_executions"
    fi
}

# 发送告警
send_alert() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # 记录告警日志
    echo "[$timestamp] [$level] $message" >> "$LOGS_DIR/alerts.log"
    
    # 根据告警级别决定是否发送通知
    local should_notify=false
    case "$level" in
        CRITICAL)
            should_notify=true
            ;;
        WARNING)
            if [[ "${NOTIFY_ON_WARNING:-true}" == "true" ]]; then
                should_notify=true
            fi
            ;;
    esac
    
    if [[ "$should_notify" == "true" ]]; then
        send_notification "🚨 [$level] N8N监控告警: $message"
    fi
    
    log_warning "告警: [$level] $message"
}

# 记录指标
record_metrics() {
    local category="$1"
    shift
    local metrics=("$@")
    
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local metrics_file="$LOGS_DIR/metrics-$(date +%Y%m%d).json"
    
    # 创建指标记录
    local metric_record="{"
    metric_record+="\"timestamp\":\"$timestamp\","
    metric_record+="\"category\":\"$category\","
    metric_record+="\"environment\":\"$ENVIRONMENT\","
    metric_record+="\"metrics\":{"
    
    local first=true
    for metric in "${metrics[@]}"; do
        local key=$(echo "$metric" | cut -d':' -f1)
        local value=$(echo "$metric" | cut -d':' -f2-)
        
        if [[ "$first" == "true" ]]; then
            first=false
        else
            metric_record+=","
        fi
        
        metric_record+="\"$key\":\"$value\""
    done
    
    metric_record+="}}"
    
    # 写入指标文件
    echo "$metric_record" >> "$metrics_file"
    
    # 如果启用了外部指标收集，发送到外部系统
    if [[ "${ENABLE_EXTERNAL_METRICS:-false}" == "true" ]]; then
        send_external_metrics "$metric_record"
    fi
}

# 发送外部指标
send_external_metrics() {
    local metric_data="$1"
    
    # 发送到Prometheus Pushgateway
    if [[ -n "${PROMETHEUS_PUSHGATEWAY_URL:-}" ]]; then
        curl -X POST \
            -H "Content-Type: application/json" \
            --data "$metric_data" \
            "${PROMETHEUS_PUSHGATEWAY_URL}/metrics/job/n8n-monitor/instance/${HOSTNAME:-localhost}" \
            &>/dev/null || true
    fi
    
    # 发送到InfluxDB
    if [[ -n "${INFLUXDB_URL:-}" ]]; then
        # 转换JSON为InfluxDB行协议格式
        local influx_data
        influx_data=$(echo "$metric_data" | jq -r '
            "n8n_metrics,environment=\(.environment),category=\(.category) " +
            ([.metrics | to_entries[] | "\(.key)=\(.value)"] | join(",")) +
            " \((.timestamp | fromdateiso8601) * 1000000000 | floor)"
        ' 2>/dev/null || echo "")
        
        if [[ -n "$influx_data" ]]; then
            curl -X POST \
                -H "Content-Type: text/plain" \
                --data "$influx_data" \
                "${INFLUXDB_URL}/write?db=${INFLUXDB_DATABASE:-n8n}" \
                &>/dev/null || true
        fi
    fi
    
    # 发送到自定义Webhook
    if [[ -n "${METRICS_WEBHOOK_URL:-}" ]]; then
        curl -X POST \
            -H "Content-Type: application/json" \
            --data "$metric_data" \
            "$METRICS_WEBHOOK_URL" \
            &>/dev/null || true
    fi
}

# 生成监控报告
generate_monitoring_report() {
    log_info "生成监控报告..."
    
    local report_file="$LOGS_DIR/monitoring-report-$(date +%Y%m%d-%H%M%S).json"
    local today=$(date +%Y%m%d)
    local metrics_file="$LOGS_DIR/metrics-$today.json"
    
    if [[ ! -f "$metrics_file" ]]; then
        log_warning "今日指标文件不存在: $metrics_file"
        return 1
    fi
    
    # 分析指标数据
    local system_metrics
    local application_metrics
    local database_metrics
    local network_metrics
    local workflow_metrics
    
    if command -v jq &> /dev/null; then
        system_metrics=$(grep '"category":"system"' "$metrics_file" | tail -1 | jq '.metrics' 2>/dev/null || echo '{}')
        application_metrics=$(grep '"category":"application"' "$metrics_file" | tail -1 | jq '.metrics' 2>/dev/null || echo '{}')
        database_metrics=$(grep '"category":"database"' "$metrics_file" | tail -1 | jq '.metrics' 2>/dev/null || echo '{}')
        network_metrics=$(grep '"category":"network"' "$metrics_file" | tail -1 | jq '.metrics' 2>/dev/null || echo '{}')
        workflow_metrics=$(grep '"category":"workflows"' "$metrics_file" | tail -1 | jq '.metrics' 2>/dev/null || echo '{}')
    else
        system_metrics='{}'
        application_metrics='{}'
        database_metrics='{}'
        network_metrics='{}'
        workflow_metrics='{}'
    fi
    
    # 统计告警数量
    local alert_count="0"
    local critical_alerts="0"
    local warning_alerts="0"
    
    if [[ -f "$LOGS_DIR/alerts.log" ]]; then
        alert_count=$(grep "$(date +%Y-%m-%d)" "$LOGS_DIR/alerts.log" | wc -l | tr -d ' ')
        critical_alerts=$(grep "$(date +%Y-%m-%d)" "$LOGS_DIR/alerts.log" | grep "CRITICAL" | wc -l | tr -d ' ')
        warning_alerts=$(grep "$(date +%Y-%m-%d)" "$LOGS_DIR/alerts.log" | grep "WARNING" | wc -l | tr -d ' ')
    fi
    
    # 生成报告
    cat > "$report_file" <<EOF
{
    "report_info": {
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "environment": "$ENVIRONMENT",
        "report_date": "$(date +%Y-%m-%d)",
        "monitoring_version": "$MONITOR_VERSION"
    },
    "summary": {
        "total_alerts": $alert_count,
        "critical_alerts": $critical_alerts,
        "warning_alerts": $warning_alerts,
        "monitoring_status": "$(if [[ $critical_alerts -eq 0 ]]; then echo "healthy"; else echo "critical"; fi)"
    },
    "metrics": {
        "system": $system_metrics,
        "application": $application_metrics,
        "database": $database_metrics,
        "network": $network_metrics,
        "workflows": $workflow_metrics
    },
    "recommendations": $(generate_recommendations "$system_metrics" "$application_metrics" "$database_metrics" "$network_metrics" "$workflow_metrics")
}
EOF
    
    log_success "监控报告已生成: $report_file"
    echo "$report_file"
}

# 生成建议
generate_recommendations() {
    local system_metrics="$1"
    local application_metrics="$2"
    local database_metrics="$3"
    local network_metrics="$4"
    local workflow_metrics="$5"
    
    local recommendations=()
    
    # 基于指标生成建议
    if command -v jq &> /dev/null; then
        # 系统资源建议
        local cpu_usage
        cpu_usage=$(echo "$system_metrics" | jq -r '.cpu_usage // "0"' 2>/dev/null)
        if [[ $(echo "$cpu_usage > 80" | bc -l 2>/dev/null || echo "0") -eq 1 ]]; then
            recommendations+=("\"考虑优化CPU密集型任务或增加计算资源\"")
        fi
        
        local memory_usage
        memory_usage=$(echo "$system_metrics" | jq -r '.memory_usage // "0"' 2>/dev/null)
        if [[ $memory_usage -gt 80 ]]; then
            recommendations+=("\"考虑增加内存或优化内存使用\"")
        fi
        
        local disk_usage
        disk_usage=$(echo "$system_metrics" | jq -r '.disk_usage // "0"' 2>/dev/null)
        if [[ $disk_usage -gt 80 ]]; then
            recommendations+=("\"考虑清理磁盘空间或扩展存储\"")
        fi
        
        # 应用性能建议
        local response_time
        response_time=$(echo "$application_metrics" | jq -r '.response_time // "0"' 2>/dev/null)
        if [[ $response_time -gt 3000 ]]; then
            recommendations+=("\"应用响应时间较长，建议检查性能瓶颈\"")
        fi
        
        # 工作流建议
        local success_rate
        success_rate=$(echo "$workflow_metrics" | jq -r '.success_rate // "100"' 2>/dev/null)
        if [[ $success_rate -lt 90 ]]; then
            recommendations+=("\"工作流成功率较低，建议检查失败原因\"")
        fi
        
        local failed_executions
        failed_executions=$(echo "$workflow_metrics" | jq -r '.failed_executions // "0"' 2>/dev/null)
        if [[ $failed_executions -gt 5 ]]; then
            recommendations+=("\"工作流失败数量较多，建议优化工作流配置\"")
        fi
    fi
    
    # 如果没有建议，添加默认建议
    if [[ ${#recommendations[@]} -eq 0 ]]; then
        recommendations+=("\"系统运行正常，建议继续保持当前配置\"")
    fi
    
    # 输出JSON数组格式
    local result="["
    local first=true
    for rec in "${recommendations[@]}"; do
        if [[ "$first" == "true" ]]; then
            first=false
        else
            result+=","
        fi
        result+="$rec"
    done
    result+="]"
    
    echo "$result"
}

# 清理旧文件
cleanup_old_files() {
    log_info "清理旧监控文件..."
    
    # 清理超过30天的指标文件
    find "$LOGS_DIR" -name "metrics-*.json" -mtime +30 -delete 2>/dev/null || true
    
    # 清理超过7天的监控报告
    find "$LOGS_DIR" -name "monitoring-report-*.json" -mtime +7 -delete 2>/dev/null || true
    
    # 清理超过30天的告警日志
    if [[ -f "$LOGS_DIR/alerts.log" ]]; then
        local temp_file=$(mktemp)
        tail -n 1000 "$LOGS_DIR/alerts.log" > "$temp_file" 2>/dev/null || true
        mv "$temp_file" "$LOGS_DIR/alerts.log" 2>/dev/null || true
    fi
    
    log_success "旧文件清理完成"
}

# 主监控函数
main_monitor() {
    log_info "🔍 开始N8N自动化平台监控..."
    log_info "环境: $ENVIRONMENT"
    log_info "监控模式: ${MONITOR_MODE:-full}"
    
    # 根据监控模式执行不同的监控任务
    case "${MONITOR_MODE:-full}" in
        system)
            monitor_system
            ;;
        application)
            monitor_application
            ;;
        database)
            monitor_database
            ;;
        network)
            monitor_network
            ;;
        workflows)
            monitor_workflows
            ;;
        full)
            monitor_system
            monitor_application
            monitor_database
            monitor_network
            monitor_workflows
            ;;
        *)
            log_error "不支持的监控模式: ${MONITOR_MODE}"
            return 1
            ;;
    esac
    
    # 生成监控报告
    if [[ "${GENERATE_REPORT:-false}" == "true" ]]; then
        generate_monitoring_report
    fi
    
    # 清理旧文件
    if [[ "${CLEANUP_OLD_FILES:-true}" == "true" ]]; then
        cleanup_old_files
    fi
    
    log_success "🎉 监控任务完成！"
}

# 显示帮助信息
show_help() {
    cat <<EOF
N8N自动化平台监控脚本

用法: $0 [选项]

选项:
    -e, --environment ENV       设置环境 (development|staging|production)
    -m, --mode MODE            设置监控模式 (system|application|database|network|workflows|full)
    --generate-report          生成监控报告
    --no-cleanup              跳过旧文件清理
    --no-alerts               禁用告警发送
    --debug                   启用调试模式
    -h, --help                显示此帮助信息

监控模式说明:
    system                    系统资源监控 (CPU、内存、磁盘、负载)
    application              应用程序监控 (健康状态、响应时间、进程状态)
    database                 数据库监控 (连接状态、大小、性能)
    network                  网络监控 (端口状态、HTTP响应、SSL证书)
    workflows                工作流监控 (执行统计、成功率、失败数)
    full                     完整监控 (包含所有监控项)

示例:
    $0                                      # 完整监控
    $0 -m system                           # 仅系统监控
    $0 -e production --generate-report     # 生产环境监控并生成报告
    $0 -m workflows --no-alerts           # 工作流监控但不发送告警

环境变量:
    ENVIRONMENT                 部署环境
    MONITOR_MODE               监控模式
    GENERATE_REPORT            是否生成报告
    CLEANUP_OLD_FILES          是否清理旧文件
    ENABLE_ALERTS              是否启用告警
    NOTIFY_ON_WARNING          是否发送警告级别通知
    
    # 阈值配置
    CPU_WARNING_THRESHOLD      CPU使用率警告阈值 (默认: 80)
    CPU_CRITICAL_THRESHOLD     CPU使用率严重阈值 (默认: 90)
    MEMORY_WARNING_THRESHOLD   内存使用率警告阈值 (默认: 80)
    MEMORY_CRITICAL_THRESHOLD  内存使用率严重阈值 (默认: 90)
    DISK_WARNING_THRESHOLD     磁盘使用率警告阈值 (默认: 80)
    DISK_CRITICAL_THRESHOLD    磁盘使用率严重阈值 (默认: 90)
    
    # 外部集成
    PROMETHEUS_PUSHGATEWAY_URL Prometheus Pushgateway地址
    INFLUXDB_URL              InfluxDB地址
    METRICS_WEBHOOK_URL       指标Webhook地址
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
                MONITOR_MODE="$2"
                shift 2
                ;;
            --generate-report)
                GENERATE_REPORT="true"
                shift
                ;;
            --no-cleanup)
                CLEANUP_OLD_FILES="false"
                shift
                ;;
            --no-alerts)
                ENABLE_ALERTS="false"
                shift
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
    
    # 执行监控
    main_monitor
}

# 错误处理
trap 'log_error "监控脚本执行失败，退出码: $?"' ERR

# 执行主函数
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi