#!/bin/bash

# N8N 自动化平台健康检查脚本
# 用于检查系统各组件的健康状态

set -euo pipefail

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${PROJECT_ROOT}/logs/health-check.log"
CONFIG_FILE="${PROJECT_ROOT}/.env"

# 默认配置
N8N_HOST="${N8N_HOST:-localhost}"
N8N_PORT="${N8N_PORT:-5678}"
N8N_PROTOCOL="${N8N_PROTOCOL:-http}"
DB_HOST="${DB_POSTGRESDB_HOST:-localhost}"
DB_PORT="${DB_POSTGRESDB_PORT:-5432}"
DB_NAME="${DB_POSTGRESDB_DATABASE:-n8n}"
DB_USER="${DB_POSTGRESDB_USER:-n8n}"
REDIS_HOST="${QUEUE_BULL_REDIS_HOST:-localhost}"
REDIS_PORT="${QUEUE_BULL_REDIS_PORT:-6379}"

# 健康检查配置
TIMEOUT=10
MAX_RETRIES=3
CHECK_INTERVAL=5

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # 创建日志目录
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # 写入日志文件
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    # 控制台输出
    case $level in
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message" >&2
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message"
            ;;
        "INFO")
            echo -e "${GREEN}[INFO]${NC} $message"
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} $message"
            ;;
        *)
            echo "[$level] $message"
            ;;
    esac
}

# 加载环境变量
load_env() {
    if [ -f "$CONFIG_FILE" ]; then
        log "INFO" "加载环境变量: $CONFIG_FILE"
        set -a
        source "$CONFIG_FILE"
        set +a
    else
        log "WARN" "环境变量文件不存在: $CONFIG_FILE"
    fi
}

# 检查命令是否存在
check_command() {
    local cmd=$1
    if ! command -v "$cmd" &> /dev/null; then
        log "ERROR" "命令不存在: $cmd"
        return 1
    fi
    return 0
}

# 检查端口是否开放
check_port() {
    local host=$1
    local port=$2
    local service_name=$3
    
    log "INFO" "检查 $service_name 端口连接: $host:$port"
    
    if timeout "$TIMEOUT" bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
        log "INFO" "✅ $service_name 端口连接正常: $host:$port"
        return 0
    else
        log "ERROR" "❌ $service_name 端口连接失败: $host:$port"
        return 1
    fi
}

# 检查HTTP服务
check_http_service() {
    local url=$1
    local service_name=$2
    local expected_status=${3:-200}
    
    log "INFO" "检查 $service_name HTTP服务: $url"
    
    local response
    local status_code
    
    if response=$(curl -s -w "%{http_code}" --connect-timeout "$TIMEOUT" --max-time "$TIMEOUT" "$url" 2>/dev/null); then
        status_code="${response: -3}"
        
        if [ "$status_code" = "$expected_status" ]; then
            log "INFO" "✅ $service_name HTTP服务正常: $url (状态码: $status_code)"
            return 0
        else
            log "WARN" "⚠️ $service_name HTTP服务状态异常: $url (状态码: $status_code, 期望: $expected_status)"
            return 1
        fi
    else
        log "ERROR" "❌ $service_name HTTP服务连接失败: $url"
        return 1
    fi
}

# 检查N8N服务
check_n8n_service() {
    log "INFO" "开始检查N8N服务..."
    
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    local health_check_passed=true
    
    # 检查N8N端口
    if ! check_port "$N8N_HOST" "$N8N_PORT" "N8N"; then
        health_check_passed=false
    fi
    
    # 检查N8N健康检查端点
    if ! check_http_service "${n8n_url}/healthz" "N8N健康检查"; then
        health_check_passed=false
    fi
    
    # 检查N8N登录页面
    if ! check_http_service "${n8n_url}/" "N8N主页" "200"; then
        health_check_passed=false
    fi
    
    # 检查N8N API端点
    if ! check_http_service "${n8n_url}/rest/login" "N8N API"; then
        health_check_passed=false
    fi
    
    # 检查N8N指标端点（如果启用）
    if [ "${N8N_METRICS:-false}" = "true" ]; then
        check_http_service "${n8n_url}/metrics" "N8N指标" "200" || true
    fi
    
    if [ "$health_check_passed" = true ]; then
        log "INFO" "✅ N8N服务健康检查通过"
        return 0
    else
        log "ERROR" "❌ N8N服务健康检查失败"
        return 1
    fi
}

# 检查PostgreSQL数据库
check_postgresql() {
    log "INFO" "开始检查PostgreSQL数据库..."
    
    local db_check_passed=true
    
    # 检查PostgreSQL端口
    if ! check_port "$DB_HOST" "$DB_PORT" "PostgreSQL"; then
        db_check_passed=false
    fi
    
    # 检查数据库连接
    if check_command "psql"; then
        log "INFO" "检查PostgreSQL数据库连接..."
        
        if PGPASSWORD="${DB_POSTGRESDB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &>/dev/null; then
            log "INFO" "✅ PostgreSQL数据库连接正常"
        else
            log "ERROR" "❌ PostgreSQL数据库连接失败"
            db_check_passed=false
        fi
        
        # 检查数据库表
        if PGPASSWORD="${DB_POSTGRESDB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt" &>/dev/null; then
            log "INFO" "✅ PostgreSQL数据库表结构正常"
        else
            log "WARN" "⚠️ PostgreSQL数据库表结构检查失败"
        fi
    else
        log "WARN" "psql命令不可用，跳过数据库连接检查"
    fi
    
    if [ "$db_check_passed" = true ]; then
        log "INFO" "✅ PostgreSQL数据库健康检查通过"
        return 0
    else
        log "ERROR" "❌ PostgreSQL数据库健康检查失败"
        return 1
    fi
}

# 检查Redis服务
check_redis() {
    log "INFO" "开始检查Redis服务..."
    
    local redis_check_passed=true
    
    # 检查Redis端口
    if ! check_port "$REDIS_HOST" "$REDIS_PORT" "Redis"; then
        redis_check_passed=false
    fi
    
    # 检查Redis连接
    if check_command "redis-cli"; then
        log "INFO" "检查Redis连接..."
        
        if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping | grep -q "PONG"; then
            log "INFO" "✅ Redis连接正常"
        else
            log "ERROR" "❌ Redis连接失败"
            redis_check_passed=false
        fi
        
        # 检查Redis内存使用
        local redis_memory
        if redis_memory=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" info memory | grep "used_memory_human" | cut -d: -f2 | tr -d '\r'); then
            log "INFO" "Redis内存使用: $redis_memory"
        fi
    else
        log "WARN" "redis-cli命令不可用，跳过Redis连接检查"
    fi
    
    if [ "$redis_check_passed" = true ]; then
        log "INFO" "✅ Redis服务健康检查通过"
        return 0
    else
        log "ERROR" "❌ Redis服务健康检查失败"
        return 1
    fi
}

# 检查Docker服务
check_docker() {
    log "INFO" "开始检查Docker服务..."
    
    if ! check_command "docker"; then
        log "WARN" "Docker命令不可用，跳过Docker检查"
        return 0
    fi
    
    local docker_check_passed=true
    
    # 检查Docker守护进程
    if docker info &>/dev/null; then
        log "INFO" "✅ Docker守护进程运行正常"
    else
        log "ERROR" "❌ Docker守护进程未运行"
        docker_check_passed=false
    fi
    
    # 检查Docker容器状态
    if docker ps &>/dev/null; then
        local running_containers
        running_containers=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep -v "NAMES")
        
        if [ -n "$running_containers" ]; then
            log "INFO" "运行中的Docker容器:"
            echo "$running_containers" | while read -r line; do
                log "INFO" "  $line"
            done
        else
            log "INFO" "没有运行中的Docker容器"
        fi
    fi
    
    # 检查Docker资源使用
    if docker system df &>/dev/null; then
        log "INFO" "Docker磁盘使用情况:"
        docker system df | while read -r line; do
            log "INFO" "  $line"
        done
    fi
    
    if [ "$docker_check_passed" = true ]; then
        log "INFO" "✅ Docker服务健康检查通过"
        return 0
    else
        log "ERROR" "❌ Docker服务健康检查失败"
        return 1
    fi
}

# 检查系统资源
check_system_resources() {
    log "INFO" "开始检查系统资源..."
    
    # 检查磁盘空间
    log "INFO" "磁盘使用情况:"
    df -h | grep -E "(Filesystem|/dev/)" | while read -r line; do
        log "INFO" "  $line"
        
        # 检查磁盘使用率
        if echo "$line" | grep -E "/dev/" | awk '{print $5}' | grep -E "[8-9][0-9]%|100%" &>/dev/null; then
            log "WARN" "⚠️ 磁盘使用率过高: $line"
        fi
    done
    
    # 检查内存使用
    if check_command "free"; then
        log "INFO" "内存使用情况:"
        free -h | while read -r line; do
            log "INFO" "  $line"
        done
    fi
    
    # 检查CPU负载
    if [ -f /proc/loadavg ]; then
        local load_avg
        load_avg=$(cat /proc/loadavg | cut -d' ' -f1-3)
        log "INFO" "系统负载: $load_avg"
        
        # 检查负载是否过高
        local load_1min
        load_1min=$(echo "$load_avg" | cut -d' ' -f1)
        if (( $(echo "$load_1min > 5.0" | bc -l 2>/dev/null || echo "0") )); then
            log "WARN" "⚠️ 系统负载过高: $load_1min"
        fi
    fi
    
    # 检查网络连接
    if check_command "netstat"; then
        local connection_count
        connection_count=$(netstat -an | grep ESTABLISHED | wc -l)
        log "INFO" "活跃网络连接数: $connection_count"
    fi
    
    log "INFO" "✅ 系统资源检查完成"
}

# 检查日志文件
check_logs() {
    log "INFO" "开始检查日志文件..."
    
    local log_dirs=("${PROJECT_ROOT}/logs" "${PROJECT_ROOT}/.n8n/logs")
    
    for log_dir in "${log_dirs[@]}"; do
        if [ -d "$log_dir" ]; then
            log "INFO" "检查日志目录: $log_dir"
            
            # 检查日志文件大小
            find "$log_dir" -name "*.log" -type f | while read -r log_file; do
                local file_size
                file_size=$(du -h "$log_file" | cut -f1)
                log "INFO" "  日志文件: $(basename "$log_file") - 大小: $file_size"
                
                # 检查是否有错误日志
                if grep -q "ERROR\|FATAL" "$log_file" 2>/dev/null; then
                    local error_count
                    error_count=$(grep -c "ERROR\|FATAL" "$log_file" 2>/dev/null || echo "0")
                    log "WARN" "  ⚠️ 发现 $error_count 个错误日志条目"
                fi
            done
        else
            log "INFO" "日志目录不存在: $log_dir"
        fi
    done
    
    log "INFO" "✅ 日志文件检查完成"
}

# 生成健康检查报告
generate_health_report() {
    local report_file="${PROJECT_ROOT}/logs/health-report-$(date +%Y%m%d-%H%M%S).json"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    log "INFO" "生成健康检查报告: $report_file"
    
    # 创建报告目录
    mkdir -p "$(dirname "$report_file")"
    
    # 生成JSON报告
    cat > "$report_file" << EOF
{
  "timestamp": "$timestamp",
  "hostname": "$(hostname)",
  "check_results": {
    "n8n_service": $n8n_status,
    "postgresql": $postgresql_status,
    "redis": $redis_status,
    "docker": $docker_status,
    "system_resources": true
  },
  "system_info": {
    "uptime": "$(uptime | sed 's/.*up //' | sed 's/,.*//')",
    "load_average": "$(cat /proc/loadavg | cut -d' ' -f1-3 2>/dev/null || echo 'N/A')",
    "disk_usage": $(df -h / | tail -1 | awk '{print "{\"filesystem\":\"" $1 "\",\"size\":\"" $2 "\",\"used\":\"" $3 "\",\"available\":\"" $4 "\",\"use_percent\":\"" $5 "\"}"}' 2>/dev/null || echo '{}'),
    "memory_usage": $(free -m | awk 'NR==2{printf "{\"total\":\"%s MB\",\"used\":\"%s MB\",\"free\":\"%s MB\",\"percent\":\"%.2f%%\"}", $2,$3,$4,$3*100/$2}' 2>/dev/null || echo '{}')
  },
  "services": {
    "n8n": {
      "url": "${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}",
      "status": $n8n_status
    },
    "postgresql": {
      "host": "$DB_HOST",
      "port": $DB_PORT,
      "database": "$DB_NAME",
      "status": $postgresql_status
    },
    "redis": {
      "host": "$REDIS_HOST",
      "port": $REDIS_PORT,
      "status": $redis_status
    }
  }
}
EOF
    
    log "INFO" "✅ 健康检查报告已生成: $report_file"
}

# 发送通知
send_notification() {
    local status=$1
    local message=$2
    
    # Slack通知
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        local color
        case $status in
            "success") color="good" ;;
            "warning") color="warning" ;;
            "error") color="danger" ;;
            *) color="warning" ;;
        esac
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"N8N健康检查报告\",
                    \"text\": \"$message\",
                    \"fields\": [
                        {\"title\": \"主机\", \"value\": \"$(hostname)\", \"short\": true},
                        {\"title\": \"时间\", \"value\": \"$(date '+%Y-%m-%d %H:%M:%S')\", \"short\": true},
                        {\"title\": \"N8N服务\", \"value\": \"$([ $n8n_status = true ] && echo '✅ 正常' || echo '❌ 异常')\", \"short\": true},
                        {\"title\": \"数据库\", \"value\": \"$([ $postgresql_status = true ] && echo '✅ 正常' || echo '❌ 异常')\", \"short\": true},
                        {\"title\": \"Redis\", \"value\": \"$([ $redis_status = true ] && echo '✅ 正常' || echo '❌ 异常')\", \"short\": true},
                        {\"title\": \"Docker\", \"value\": \"$([ $docker_status = true ] && echo '✅ 正常' || echo '❌ 异常')\", \"short\": true}
                    ],
                    \"footer\": \"N8N Health Check\",
                    \"ts\": $(date +%s)
                }]
            }" \
            "$SLACK_WEBHOOK_URL" &>/dev/null || log "WARN" "Slack通知发送失败"
    fi
    
    # 邮件通知（如果配置了）
    if [ -n "${EMAIL_NOTIFICATION:-}" ] && check_command "mail"; then
        echo "$message" | mail -s "N8N健康检查报告 - $(hostname)" "$EMAIL_NOTIFICATION" || log "WARN" "邮件通知发送失败"
    fi
}

# 主函数
main() {
    log "INFO" "开始N8N自动化平台健康检查..."
    log "INFO" "检查时间: $(date '+%Y-%m-%d %H:%M:%S')"
    log "INFO" "主机名: $(hostname)"
    
    # 加载环境变量
    load_env
    
    # 初始化状态变量
    n8n_status=false
    postgresql_status=false
    redis_status=false
    docker_status=false
    overall_status=true
    
    # 执行各项检查
    if check_n8n_service; then
        n8n_status=true
    else
        overall_status=false
    fi
    
    if check_postgresql; then
        postgresql_status=true
    else
        overall_status=false
    fi
    
    if check_redis; then
        redis_status=true
    else
        overall_status=false
    fi
    
    if check_docker; then
        docker_status=true
    else
        overall_status=false
    fi
    
    # 检查系统资源
    check_system_resources
    
    # 检查日志文件
    check_logs
    
    # 生成健康检查报告
    generate_health_report
    
    # 输出总结
    log "INFO" "==================== 健康检查总结 ===================="
    log "INFO" "N8N服务: $([ $n8n_status = true ] && echo '✅ 正常' || echo '❌ 异常')"
    log "INFO" "PostgreSQL: $([ $postgresql_status = true ] && echo '✅ 正常' || echo '❌ 异常')"
    log "INFO" "Redis: $([ $redis_status = true ] && echo '✅ 正常' || echo '❌ 异常')"
    log "INFO" "Docker: $([ $docker_status = true ] && echo '✅ 正常' || echo '❌ 异常')"
    log "INFO" "=================================================="
    
    # 发送通知
    if [ "$overall_status" = true ]; then
        log "INFO" "✅ 所有服务健康检查通过"
        send_notification "success" "N8N自动化平台所有服务运行正常"
        exit 0
    else
        log "ERROR" "❌ 部分服务健康检查失败"
        send_notification "error" "N8N自动化平台部分服务存在异常，请检查日志"
        exit 1
    fi
}

# 处理命令行参数
case "${1:-}" in
    --help|-h)
        echo "N8N 自动化平台健康检查脚本"
        echo ""
        echo "用法: $0 [选项]"
        echo ""
        echo "选项:"
        echo "  --help, -h     显示帮助信息"
        echo "  --version, -v  显示版本信息"
        echo "  --quiet, -q    静默模式，只输出错误"
        echo "  --verbose      详细模式，输出调试信息"
        echo ""
        echo "环境变量:"
        echo "  N8N_HOST              N8N服务主机 (默认: localhost)"
        echo "  N8N_PORT              N8N服务端口 (默认: 5678)"
        echo "  N8N_PROTOCOL          N8N服务协议 (默认: http)"
        echo "  DB_POSTGRESDB_HOST    PostgreSQL主机 (默认: localhost)"
        echo "  DB_POSTGRESDB_PORT    PostgreSQL端口 (默认: 5432)"
        echo "  QUEUE_BULL_REDIS_HOST Redis主机 (默认: localhost)"
        echo "  QUEUE_BULL_REDIS_PORT Redis端口 (默认: 6379)"
        echo "  SLACK_WEBHOOK_URL     Slack通知Webhook URL"
        echo "  EMAIL_NOTIFICATION    邮件通知地址"
        exit 0
        ;;
    --version|-v)
        echo "N8N Health Check Script v1.0.0"
        exit 0
        ;;
    --quiet|-q)
        exec > /dev/null
        ;;
    --verbose)
        set -x
        ;;
esac

# 执行主函数
main "$@"