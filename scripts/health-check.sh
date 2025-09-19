#!/bin/bash

# N8N企业级自动化工作流平台 - 健康检查脚本
# 监控系统各组件的健康状态

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
HEALTH_CHECK_TIMEOUT=10
LOG_FILE="logs/health-check.log"
ALERT_THRESHOLD=3  # 连续失败次数阈值

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

# 日志函数
log_info() {
    local message="$1"
    echo -e "${BLUE}[INFO]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $message" >> "$LOG_FILE"
}

log_success() {
    local message="$1"
    echo -e "${GREEN}[SUCCESS]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [SUCCESS] $message" >> "$LOG_FILE"
}

log_warning() {
    local message="$1"
    echo -e "${YELLOW}[WARNING]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARNING] $message" >> "$LOG_FILE"
}

log_error() {
    local message="$1"
    echo -e "${RED}[ERROR]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $message" >> "$LOG_FILE"
}

log_header() {
    local message="$1"
    echo -e "${PURPLE}[HEADER]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [HEADER] $message" >> "$LOG_FILE"
}

# 检查Docker服务状态
check_docker_status() {
    log_header "检查Docker服务状态"
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装"
        return 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker服务未运行"
        return 1
    fi
    
    log_success "Docker服务运行正常"
    return 0
}

# 检查Docker Compose服务
check_docker_compose_services() {
    log_header "检查Docker Compose服务"
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装"
        return 1
    fi
    
    # 获取服务状态
    local services_status=$(docker-compose ps --format "table {{.Name}}\t{{.State}}\t{{.Status}}")
    
    if [ -z "$services_status" ]; then
        log_error "未找到Docker Compose服务"
        return 1
    fi
    
    echo "$services_status"
    
    # 检查每个服务的状态
    local failed_services=0
    local service_names=("n8n" "postgres" "redis" "ai-agent-system" "huoniao-portal")
    
    for service in "${service_names[@]}"; do
        local container_id=$(docker-compose ps -q "$service" 2>/dev/null)
        
        if [ -z "$container_id" ]; then
            log_warning "服务 $service 未找到"
            ((failed_services++))
            continue
        fi
        
        local container_status=$(docker inspect --format='{{.State.Status}}' "$container_id" 2>/dev/null)
        
        if [ "$container_status" = "running" ]; then
            log_success "服务 $service 运行正常"
        else
            log_error "服务 $service 状态异常: $container_status"
            ((failed_services++))
        fi
    done
    
    if [ $failed_services -eq 0 ]; then
        log_success "所有Docker Compose服务运行正常"
        return 0
    else
        log_error "$failed_services 个服务状态异常"
        return 1
    fi
}

# 检查PostgreSQL数据库
check_postgresql() {
    log_header "检查PostgreSQL数据库"
    
    local postgres_container=$(docker-compose ps -q postgres 2>/dev/null)
    
    if [ -z "$postgres_container" ]; then
        log_error "PostgreSQL容器未找到"
        return 1
    fi
    
    # 检查PostgreSQL连接
    if timeout $HEALTH_CHECK_TIMEOUT docker-compose exec postgres pg_isready -U postgres &> /dev/null; then
        log_success "PostgreSQL连接正常"
    else
        log_error "PostgreSQL连接失败"
        return 1
    fi
    
    # 检查数据库
    local databases=("n8n" "ai_agents" "huoniao")
    local failed_dbs=0
    
    for db in "${databases[@]}"; do
        if timeout $HEALTH_CHECK_TIMEOUT docker-compose exec postgres psql -U postgres -d "$db" -c "SELECT 1;" &> /dev/null; then
            log_success "数据库 $db 连接正常"
        else
            log_error "数据库 $db 连接失败"
            ((failed_dbs++))
        fi
    done
    
    if [ $failed_dbs -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# 检查Redis服务
check_redis() {
    log_header "检查Redis服务"
    
    local redis_container=$(docker-compose ps -q redis 2>/dev/null)
    
    if [ -z "$redis_container" ]; then
        log_error "Redis容器未找到"
        return 1
    fi
    
    # 检查Redis连接
    if timeout $HEALTH_CHECK_TIMEOUT docker-compose exec redis redis-cli ping | grep -q "PONG"; then
        log_success "Redis连接正常"
        
        # 检查Redis内存使用
        local memory_info=$(docker-compose exec redis redis-cli info memory | grep "used_memory_human")
        log_info "Redis内存使用: $memory_info"
        
        return 0
    else
        log_error "Redis连接失败"
        return 1
    fi
}

# 检查N8N服务
check_n8n_service() {
    log_header "检查N8N服务"
    
    local n8n_container=$(docker-compose ps -q n8n 2>/dev/null)
    
    if [ -z "$n8n_container" ]; then
        log_error "N8N容器未找到"
        return 1
    fi
    
    # 检查N8N HTTP服务
    local n8n_url="http://localhost:5678"
    
    if timeout $HEALTH_CHECK_TIMEOUT curl -s "$n8n_url" &> /dev/null; then
        log_success "N8N HTTP服务响应正常"
    else
        log_error "N8N HTTP服务无响应"
        return 1
    fi
    
    # 检查N8N健康状态端点（如果存在）
    if timeout $HEALTH_CHECK_TIMEOUT curl -s "${n8n_url}/healthz" &> /dev/null; then
        log_success "N8N健康检查端点正常"
    else
        log_warning "N8N健康检查端点不可用"
    fi
    
    return 0
}

# 检查AI智能体服务
check_ai_agent_service() {
    log_header "检查AI智能体服务"
    
    local ai_agent_container=$(docker-compose ps -q ai-agent-system 2>/dev/null)
    
    if [ -z "$ai_agent_container" ]; then
        log_error "AI智能体容器未找到"
        return 1
    fi
    
    # 检查AI智能体HTTP服务
    local ai_agent_url="http://localhost:8000"
    
    if timeout $HEALTH_CHECK_TIMEOUT curl -s "$ai_agent_url" &> /dev/null; then
        log_success "AI智能体HTTP服务响应正常"
    else
        log_error "AI智能体HTTP服务无响应"
        return 1
    fi
    
    # 检查健康状态端点
    if timeout $HEALTH_CHECK_TIMEOUT curl -s "${ai_agent_url}/health" | grep -q "healthy"; then
        log_success "AI智能体健康状态正常"
    else
        log_warning "AI智能体健康状态异常"
        return 1
    fi
    
    return 0
}

# 检查火鸟门户服务
check_huoniao_portal() {
    log_header "检查火鸟门户服务"
    
    local huoniao_container=$(docker-compose ps -q huoniao-portal 2>/dev/null)
    
    if [ -z "$huoniao_container" ]; then
        log_error "火鸟门户容器未找到"
        return 1
    fi
    
    # 检查火鸟门户HTTP服务
    local huoniao_url="http://localhost:3000"
    
    if timeout $HEALTH_CHECK_TIMEOUT curl -s "$huoniao_url" &> /dev/null; then
        log_success "火鸟门户HTTP服务响应正常"
        return 0
    else
        log_error "火鸟门户HTTP服务无响应"
        return 1
    fi
}

# 检查系统资源
check_system_resources() {
    log_header "检查系统资源"
    
    # 检查磁盘空间
    local disk_usage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -lt 80 ]; then
        log_success "磁盘空间充足 (使用率: ${disk_usage}%)"
    elif [ "$disk_usage" -lt 90 ]; then
        log_warning "磁盘空间紧张 (使用率: ${disk_usage}%)"
    else
        log_error "磁盘空间不足 (使用率: ${disk_usage}%)"
        return 1
    fi
    
    # 检查内存使用
    if command -v free &> /dev/null; then
        local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        
        if [ "$memory_usage" -lt 80 ]; then
            log_success "内存使用正常 (使用率: ${memory_usage}%)"
        elif [ "$memory_usage" -lt 90 ]; then
            log_warning "内存使用较高 (使用率: ${memory_usage}%)"
        else
            log_error "内存使用过高 (使用率: ${memory_usage}%)"
            return 1
        fi
    fi
    
    # 检查CPU负载
    if command -v uptime &> /dev/null; then
        local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
        log_info "系统负载: $load_avg"
    fi
    
    return 0
}

# 检查网络连接
check_network_connectivity() {
    log_header "检查网络连接"
    
    # 检查内部服务连接
    local services=(
        "localhost:5678:N8N"
        "localhost:8000:AI智能体"
        "localhost:3000:火鸟门户"
        "localhost:5432:PostgreSQL"
        "localhost:6379:Redis"
    )
    
    local failed_connections=0
    
    for service_info in "${services[@]}"; do
        IFS=':' read -r host port name <<< "$service_info"
        
        if timeout 5 nc -z "$host" "$port" &> /dev/null; then
            log_success "$name 端口 $port 连接正常"
        else
            log_error "$name 端口 $port 连接失败"
            ((failed_connections++))
        fi
    done
    
    # 检查外部网络连接
    if timeout 5 ping -c 1 8.8.8.8 &> /dev/null; then
        log_success "外部网络连接正常"
    else
        log_warning "外部网络连接异常"
    fi
    
    if [ $failed_connections -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# 检查日志文件
check_log_files() {
    log_header "检查日志文件"
    
    local log_dirs=("logs/n8n" "logs/ai-agent" "logs/huoniao-portal")
    local log_issues=0
    
    for log_dir in "${log_dirs[@]}"; do
        if [ -d "$log_dir" ]; then
            local log_size=$(du -sh "$log_dir" 2>/dev/null | cut -f1)
            log_info "$log_dir 目录大小: $log_size"
            
            # 检查是否有错误日志
            local error_count=$(find "$log_dir" -name "*.log" -exec grep -l "ERROR\|FATAL" {} \; 2>/dev/null | wc -l)
            
            if [ "$error_count" -gt 0 ]; then
                log_warning "$log_dir 中发现 $error_count 个包含错误的日志文件"
                ((log_issues++))
            fi
        else
            log_warning "日志目录不存在: $log_dir"
            ((log_issues++))
        fi
    done
    
    if [ $log_issues -eq 0 ]; then
        log_success "日志文件检查正常"
        return 0
    else
        return 1
    fi
}

# 检查配置文件
check_configuration_files() {
    log_header "检查配置文件"
    
    local config_files=(".env" "docker-compose.yml" "src/config/settings.py")
    local config_issues=0
    
    for config_file in "${config_files[@]}"; do
        if [ -f "$config_file" ]; then
            log_success "配置文件存在: $config_file"
            
            # 检查文件权限
            local file_perms=$(stat -c "%a" "$config_file" 2>/dev/null || stat -f "%A" "$config_file" 2>/dev/null)
            
            if [[ "$config_file" == ".env" ]] && [[ "$file_perms" != *"600" ]]; then
                log_warning ".env 文件权限建议设置为 600"
            fi
        else
            log_error "配置文件缺失: $config_file"
            ((config_issues++))
        fi
    done
    
    # 检查环境变量
    local required_env_vars=(
        "N8N_HOST"
        "N8N_PORT"
        "DB_POSTGRESDB_HOST"
        "DB_POSTGRESDB_PASSWORD"
        "REDIS_PASSWORD"
    )
    
    for env_var in "${required_env_vars[@]}"; do
        if grep -q "^${env_var}=" .env 2>/dev/null; then
            log_success "环境变量已配置: $env_var"
        else
            log_error "环境变量缺失: $env_var"
            ((config_issues++))
        fi
    done
    
    if [ $config_issues -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# 生成健康检查报告
generate_health_report() {
    local overall_status="$1"
    local report_file="logs/health-report-$(date +%Y%m%d_%H%M%S).json"
    
    log_header "生成健康检查报告"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "overall_status": "$overall_status",
  "system_info": {
    "hostname": "$(hostname)",
    "os": "$(uname -s)",
    "kernel": "$(uname -r)",
    "uptime": "$(uptime -p 2>/dev/null || uptime)"
  },
  "docker_info": {
    "version": "$(docker --version 2>/dev/null || echo 'Not available')",
    "compose_version": "$(docker-compose --version 2>/dev/null || echo 'Not available')"
  },
  "services": {
    "n8n": "$(docker-compose ps n8n 2>/dev/null | grep -q Up && echo 'running' || echo 'stopped')",
    "postgres": "$(docker-compose ps postgres 2>/dev/null | grep -q Up && echo 'running' || echo 'stopped')",
    "redis": "$(docker-compose ps redis 2>/dev/null | grep -q Up && echo 'running' || echo 'stopped')",
    "ai_agent": "$(docker-compose ps ai-agent-system 2>/dev/null | grep -q Up && echo 'running' || echo 'stopped')",
    "huoniao_portal": "$(docker-compose ps huoniao-portal 2>/dev/null | grep -q Up && echo 'running' || echo 'stopped')"
  },
  "resource_usage": {
    "disk_usage": "$(df -h . | awk 'NR==2 {print $5}')",
    "memory_usage": "$(free -h 2>/dev/null | awk 'NR==2{print $3"/"$2}' || echo 'Not available')",
    "load_average": "$(uptime | awk -F'load average:' '{print $2}' | xargs)"
  }
}
EOF
    
    log_success "健康检查报告已生成: $report_file"
}

# 发送告警通知
send_alert_notification() {
    local alert_message="$1"
    
    log_header "发送告警通知"
    
    # 这里可以集成各种通知方式
    # 例如：邮件、Slack、钉钉、企业微信等
    
    echo "告警时间: $(date)" > "logs/alert-$(date +%Y%m%d_%H%M%S).txt"
    echo "告警内容: $alert_message" >> "logs/alert-$(date +%Y%m%d_%H%M%S).txt"
    
    log_info "告警通知已记录到日志文件"
    
    # 示例：发送邮件通知（需要配置邮件服务）
    # echo "$alert_message" | mail -s "N8N系统告警" admin@example.com
    
    # 示例：发送Slack通知（需要配置Webhook）
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"$alert_message\"}" \
    #   YOUR_SLACK_WEBHOOK_URL
}

# 显示使用帮助
show_help() {
    echo "N8N企业级自动化工作流平台健康检查脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help       显示此帮助信息"
    echo "  -q, --quiet      静默模式，只输出错误"
    echo "  -v, --verbose    详细模式，显示更多信息"
    echo "  -r, --report     生成详细报告"
    echo "  -c, --continuous 持续监控模式"
    echo "  --docker-only    仅检查Docker相关服务"
    echo "  --services-only  仅检查应用服务"
    echo "  --system-only    仅检查系统资源"
    echo ""
    echo "示例:"
    echo "  $0                # 执行完整健康检查"
    echo "  $0 -q             # 静默模式检查"
    echo "  $0 -r             # 生成详细报告"
    echo "  $0 -c             # 持续监控模式"
    echo "  $0 --docker-only  # 仅检查Docker服务"
    echo ""
}

# 持续监控模式
continuous_monitoring() {
    local interval=60  # 检查间隔（秒）
    local consecutive_failures=0
    
    log_info "启动持续监控模式，检查间隔: ${interval}秒"
    
    while true; do
        echo ""
        log_header "执行定期健康检查 - $(date)"
        
        if run_health_checks; then
            consecutive_failures=0
            log_success "健康检查通过"
        else
            ((consecutive_failures++))
            log_error "健康检查失败 (连续失败次数: $consecutive_failures)"
            
            if [ $consecutive_failures -ge $ALERT_THRESHOLD ]; then
                send_alert_notification "N8N系统连续 $consecutive_failures 次健康检查失败"
                consecutive_failures=0  # 重置计数器，避免重复告警
            fi
        fi
        
        sleep $interval
    done
}

# 执行健康检查
run_health_checks() {
    local docker_only=false
    local services_only=false
    local system_only=false
    
    # 解析检查范围参数
    for arg in "$@"; do
        case $arg in
            --docker-only)
                docker_only=true
                ;;
            --services-only)
                services_only=true
                ;;
            --system-only)
                system_only=true
                ;;
        esac
    done
    
    local failed_checks=0
    
    # Docker相关检查
    if [ "$services_only" = false ] && [ "$system_only" = false ]; then
        check_docker_status || ((failed_checks++))
        check_docker_compose_services || ((failed_checks++))
    fi
    
    # 服务检查
    if [ "$docker_only" = false ] && [ "$system_only" = false ]; then
        check_postgresql || ((failed_checks++))
        check_redis || ((failed_checks++))
        check_n8n_service || ((failed_checks++))
        check_ai_agent_service || ((failed_checks++))
        check_huoniao_portal || ((failed_checks++))
        check_network_connectivity || ((failed_checks++))
    fi
    
    # 系统检查
    if [ "$docker_only" = false ] && [ "$services_only" = false ]; then
        check_system_resources || ((failed_checks++))
        check_log_files || ((failed_checks++))
        check_configuration_files || ((failed_checks++))
    fi
    
    return $failed_checks
}

# 主函数
main() {
    local quiet_mode=false
    local verbose_mode=false
    local generate_report=false
    local continuous_mode=false
    local check_args=()
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -q|--quiet)
                quiet_mode=true
                shift
                ;;
            -v|--verbose)
                verbose_mode=true
                shift
                ;;
            -r|--report)
                generate_report=true
                shift
                ;;
            -c|--continuous)
                continuous_mode=true
                shift
                ;;
            --docker-only|--services-only|--system-only)
                check_args+=("$1")
                shift
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 设置日志级别
    if [ "$quiet_mode" = true ]; then
        exec 1>/dev/null  # 重定向标准输出到 /dev/null
    fi
    
    log_header "开始N8N企业级自动化工作流平台健康检查"
    log_info "检查时间: $(date)"
    
    # 持续监控模式
    if [ "$continuous_mode" = true ]; then
        continuous_monitoring
        exit 0
    fi
    
    # 执行健康检查
    local failed_checks=0
    if run_health_checks "${check_args[@]}"; then
        log_success "所有健康检查通过"
        overall_status="healthy"
    else
        failed_checks=$?
        log_error "$failed_checks 项健康检查失败"
        overall_status="unhealthy"
    fi
    
    # 生成报告
    if [ "$generate_report" = true ]; then
        generate_health_report "$overall_status"
    fi
    
    # 显示总结
    echo ""
    log_header "健康检查总结"
    echo "  • 检查时间: $(date)"
    echo "  • 总体状态: $overall_status"
    echo "  • 失败检查: $failed_checks 项"
    echo "  • 日志文件: $LOG_FILE"
    
    # 返回适当的退出码
    if [ $failed_checks -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

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