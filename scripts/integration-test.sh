#!/bin/bash

# N8N 自动化平台集成测试脚本
# 用于执行端到端的集成测试

set -euo pipefail

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${PROJECT_ROOT}/logs/integration-test.log"
CONFIG_FILE="${PROJECT_ROOT}/.env"

# 测试配置
N8N_HOST="${N8N_HOST:-localhost}"
N8N_PORT="${N8N_PORT:-5678}"
N8N_PROTOCOL="${N8N_PROTOCOL:-http}"
TEST_TIMEOUT="${TEST_TIMEOUT:-300}"
TEST_RETRIES="${TEST_RETRIES:-3}"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

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

# 等待服务启动
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local timeout=${4:-60}
    
    log "INFO" "等待 $service_name 服务启动: $host:$port"
    
    local count=0
    while [ $count -lt $timeout ]; do
        if timeout 5 bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
            log "INFO" "✅ $service_name 服务已启动"
            return 0
        fi
        
        sleep 1
        count=$((count + 1))
        
        if [ $((count % 10)) -eq 0 ]; then
            log "INFO" "等待 $service_name 服务启动... ($count/$timeout)"
        fi
    done
    
    log "ERROR" "❌ $service_name 服务启动超时"
    return 1
}

# HTTP请求函数
http_request() {
    local method=$1
    local url=$2
    local data=${3:-}
    local expected_status=${4:-200}
    local headers=${5:-}
    
    local curl_cmd="curl -s -w '%{http_code}' --connect-timeout 10 --max-time 30"
    
    if [ -n "$headers" ]; then
        curl_cmd="$curl_cmd $headers"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -X $method -d '$data' -H 'Content-Type: application/json'"
    else
        curl_cmd="$curl_cmd -X $method"
    fi
    
    curl_cmd="$curl_cmd '$url'"
    
    local response
    local status_code
    
    if response=$(eval "$curl_cmd" 2>/dev/null); then
        status_code="${response: -3}"
        local body="${response%???}"
        
        if [ "$status_code" = "$expected_status" ]; then
            echo "$body"
            return 0
        else
            log "ERROR" "HTTP请求失败: $method $url (状态码: $status_code, 期望: $expected_status)"
            return 1
        fi
    else
        log "ERROR" "HTTP请求连接失败: $method $url"
        return 1
    fi
}

# 测试用例执行函数
run_test() {
    local test_name=$1
    local test_function=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    log "INFO" "开始执行测试: $test_name"
    
    if $test_function; then
        log "INFO" "✅ 测试通过: $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        log "ERROR" "❌ 测试失败: $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 跳过测试
skip_test() {
    local test_name=$1
    local reason=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
    
    log "WARN" "⏭️ 跳过测试: $test_name (原因: $reason)"
}

# 测试N8N服务健康检查
test_n8n_health() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    
    # 测试健康检查端点
    if http_request "GET" "${n8n_url}/healthz" "" "200" >/dev/null; then
        return 0
    else
        return 1
    fi
}

# 测试N8N登录功能
test_n8n_login() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    
    # 测试登录页面
    if http_request "GET" "${n8n_url}/" "" "200" >/dev/null; then
        return 0
    else
        return 1
    fi
}

# 测试N8N API端点
test_n8n_api() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    
    # 测试API端点
    if http_request "GET" "${n8n_url}/rest/login" "" "200" >/dev/null; then
        return 0
    else
        return 1
    fi
}

# 测试工作流创建
test_workflow_creation() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    
    # 如果没有认证信息，跳过此测试
    if [ -z "${N8N_USER_MANAGEMENT_JWT_SECRET:-}" ]; then
        return 1
    fi
    
    # 创建简单的测试工作流
    local workflow_data='{
        "name": "Integration Test Workflow",
        "nodes": [
            {
                "id": "start",
                "name": "Start",
                "type": "n8n-nodes-base.start",
                "position": [240, 300],
                "parameters": {}
            }
        ],
        "connections": {},
        "active": false,
        "settings": {}
    }'
    
    # 尝试创建工作流
    if http_request "POST" "${n8n_url}/rest/workflows" "$workflow_data" "200" "-H 'Authorization: Bearer ${N8N_API_TOKEN:-}'" >/dev/null; then
        return 0
    else
        return 1
    fi
}

# 测试数据库连接
test_database_connection() {
    if [ -z "${DB_POSTGRESDB_HOST:-}" ]; then
        return 1
    fi
    
    if ! check_command "psql"; then
        return 1
    fi
    
    # 测试数据库连接
    if PGPASSWORD="${DB_POSTGRESDB_PASSWORD}" psql -h "${DB_POSTGRESDB_HOST}" -p "${DB_POSTGRESDB_PORT:-5432}" -U "${DB_POSTGRESDB_USER}" -d "${DB_POSTGRESDB_DATABASE}" -c "SELECT 1;" &>/dev/null; then
        return 0
    else
        return 1
    fi
}

# 测试Redis连接
test_redis_connection() {
    if [ -z "${QUEUE_BULL_REDIS_HOST:-}" ]; then
        return 1
    fi
    
    if ! check_command "redis-cli"; then
        return 1
    fi
    
    # 测试Redis连接
    if redis-cli -h "${QUEUE_BULL_REDIS_HOST}" -p "${QUEUE_BULL_REDIS_PORT:-6379}" ping | grep -q "PONG"; then
        return 0
    else
        return 1
    fi
}

# 测试Docker服务
test_docker_service() {
    if ! check_command "docker"; then
        return 1
    fi
    
    # 测试Docker守护进程
    if docker info &>/dev/null; then
        return 0
    else
        return 1
    fi
}

# 测试文件系统权限
test_filesystem_permissions() {
    local test_dirs=("${PROJECT_ROOT}/logs" "${PROJECT_ROOT}/.n8n" "${PROJECT_ROOT}/backups")
    
    for dir in "${test_dirs[@]}"; do
        # 创建测试目录
        if ! mkdir -p "$dir" 2>/dev/null; then
            log "ERROR" "无法创建目录: $dir"
            return 1
        fi
        
        # 测试写入权限
        local test_file="$dir/test_write_$(date +%s).tmp"
        if ! echo "test" > "$test_file" 2>/dev/null; then
            log "ERROR" "无法写入文件: $test_file"
            return 1
        fi
        
        # 清理测试文件
        rm -f "$test_file" 2>/dev/null || true
    done
    
    return 0
}

# 测试环境变量配置
test_environment_config() {
    local required_vars=("N8N_HOST" "N8N_PORT")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log "ERROR" "缺少必需的环境变量: $var"
            return 1
        fi
    done
    
    return 0
}

# 测试网络连通性
test_network_connectivity() {
    local test_hosts=("${N8N_HOST}")
    
    # 添加数据库和Redis主机
    if [ -n "${DB_POSTGRESDB_HOST:-}" ] && [ "${DB_POSTGRESDB_HOST}" != "localhost" ]; then
        test_hosts+=("${DB_POSTGRESDB_HOST}")
    fi
    
    if [ -n "${QUEUE_BULL_REDIS_HOST:-}" ] && [ "${QUEUE_BULL_REDIS_HOST}" != "localhost" ]; then
        test_hosts+=("${QUEUE_BULL_REDIS_HOST}")
    fi
    
    for host in "${test_hosts[@]}"; do
        if [ "$host" = "localhost" ] || [ "$host" = "127.0.0.1" ]; then
            continue
        fi
        
        if ! ping -c 1 -W 5 "$host" &>/dev/null; then
            log "ERROR" "无法连接到主机: $host"
            return 1
        fi
    done
    
    return 0
}

# 性能测试
test_performance() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    local start_time
    local end_time
    local response_time
    
    # 测试响应时间
    start_time=$(date +%s%N)
    if http_request "GET" "${n8n_url}/healthz" "" "200" >/dev/null; then
        end_time=$(date +%s%N)
        response_time=$(( (end_time - start_time) / 1000000 )) # 转换为毫秒
        
        log "INFO" "N8N健康检查响应时间: ${response_time}ms"
        
        # 响应时间应该小于5秒
        if [ $response_time -lt 5000 ]; then
            return 0
        else
            log "WARN" "响应时间过长: ${response_time}ms"
            return 1
        fi
    else
        return 1
    fi
}

# 负载测试
test_load() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    local concurrent_requests=5
    local success_count=0
    
    log "INFO" "执行负载测试: $concurrent_requests 个并发请求"
    
    # 并发执行多个请求
    for i in $(seq 1 $concurrent_requests); do
        {
            if http_request "GET" "${n8n_url}/healthz" "" "200" >/dev/null; then
                echo "success"
            else
                echo "failed"
            fi
        } &
    done
    
    # 等待所有请求完成
    wait
    
    # 统计成功请求数
    success_count=$(jobs -p | wc -l)
    
    log "INFO" "负载测试结果: $success_count/$concurrent_requests 请求成功"
    
    # 至少80%的请求应该成功
    local success_rate=$((success_count * 100 / concurrent_requests))
    if [ $success_rate -ge 80 ]; then
        return 0
    else
        return 1
    fi
}

# 生成测试报告
generate_test_report() {
    local report_file="${PROJECT_ROOT}/logs/integration-test-report-$(date +%Y%m%d-%H%M%S).json"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    log "INFO" "生成集成测试报告: $report_file"
    
    # 创建报告目录
    mkdir -p "$(dirname "$report_file")"
    
    # 计算测试通过率
    local pass_rate=0
    if [ $TOTAL_TESTS -gt 0 ]; then
        pass_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    fi
    
    # 生成JSON报告
    cat > "$report_file" << EOF
{
  "timestamp": "$timestamp",
  "hostname": "$(hostname)",
  "test_summary": {
    "total_tests": $TOTAL_TESTS,
    "passed_tests": $PASSED_TESTS,
    "failed_tests": $FAILED_TESTS,
    "skipped_tests": $SKIPPED_TESTS,
    "pass_rate": $pass_rate
  },
  "test_environment": {
    "n8n_host": "$N8N_HOST",
    "n8n_port": $N8N_PORT,
    "n8n_protocol": "$N8N_PROTOCOL",
    "test_timeout": $TEST_TIMEOUT
  },
  "system_info": {
    "os": "$(uname -s)",
    "arch": "$(uname -m)",
    "kernel": "$(uname -r)",
    "uptime": "$(uptime | sed 's/.*up //' | sed 's/,.*//')"
  }
}
EOF
    
    log "INFO" "✅ 集成测试报告已生成: $report_file"
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
                    \"title\": \"N8N集成测试报告\",
                    \"text\": \"$message\",
                    \"fields\": [
                        {\"title\": \"主机\", \"value\": \"$(hostname)\", \"short\": true},
                        {\"title\": \"时间\", \"value\": \"$(date '+%Y-%m-%d %H:%M:%S')\", \"short\": true},
                        {\"title\": \"总测试数\", \"value\": \"$TOTAL_TESTS\", \"short\": true},
                        {\"title\": \"通过测试\", \"value\": \"$PASSED_TESTS\", \"short\": true},
                        {\"title\": \"失败测试\", \"value\": \"$FAILED_TESTS\", \"short\": true},
                        {\"title\": \"跳过测试\", \"value\": \"$SKIPPED_TESTS\", \"short\": true}
                    ],
                    \"footer\": \"N8N Integration Test\",
                    \"ts\": $(date +%s)
                }]
            }" \
            "$SLACK_WEBHOOK_URL" &>/dev/null || log "WARN" "Slack通知发送失败"
    fi
}

# 主函数
main() {
    log "INFO" "开始N8N自动化平台集成测试..."
    log "INFO" "测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
    log "INFO" "主机名: $(hostname)"
    
    # 加载环境变量
    load_env
    
    # 等待N8N服务启动
    if ! wait_for_service "$N8N_HOST" "$N8N_PORT" "N8N" 60; then
        log "ERROR" "N8N服务未启动，无法执行集成测试"
        exit 1
    fi
    
    # 执行测试用例
    log "INFO" "==================== 开始执行集成测试 ===================="
    
    # 基础功能测试
    run_test "环境变量配置测试" test_environment_config
    run_test "文件系统权限测试" test_filesystem_permissions
    run_test "网络连通性测试" test_network_connectivity
    
    # 服务健康测试
    run_test "N8N健康检查测试" test_n8n_health
    run_test "N8N登录功能测试" test_n8n_login
    run_test "N8N API端点测试" test_n8n_api
    
    # 数据库和缓存测试
    if [ -n "${DB_POSTGRESDB_HOST:-}" ]; then
        run_test "数据库连接测试" test_database_connection
    else
        skip_test "数据库连接测试" "未配置数据库"
    fi
    
    if [ -n "${QUEUE_BULL_REDIS_HOST:-}" ]; then
        run_test "Redis连接测试" test_redis_connection
    else
        skip_test "Redis连接测试" "未配置Redis"
    fi
    
    # Docker服务测试
    if check_command "docker"; then
        run_test "Docker服务测试" test_docker_service
    else
        skip_test "Docker服务测试" "Docker未安装"
    fi
    
    # 工作流功能测试
    if [ -n "${N8N_API_TOKEN:-}" ]; then
        run_test "工作流创建测试" test_workflow_creation
    else
        skip_test "工作流创建测试" "未配置API令牌"
    fi
    
    # 性能测试
    run_test "性能测试" test_performance
    run_test "负载测试" test_load
    
    log "INFO" "==================== 集成测试完成 ===================="
    
    # 生成测试报告
    generate_test_report
    
    # 输出测试总结
    log "INFO" "==================== 测试总结 ===================="
    log "INFO" "总测试数: $TOTAL_TESTS"
    log "INFO" "通过测试: $PASSED_TESTS"
    log "INFO" "失败测试: $FAILED_TESTS"
    log "INFO" "跳过测试: $SKIPPED_TESTS"
    
    local pass_rate=0
    if [ $TOTAL_TESTS -gt 0 ]; then
        pass_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    fi
    log "INFO" "通过率: $pass_rate%"
    log "INFO" "=================================================="
    
    # 发送通知
    if [ $FAILED_TESTS -eq 0 ]; then
        log "INFO" "✅ 所有集成测试通过"
        send_notification "success" "N8N自动化平台集成测试全部通过 (通过率: $pass_rate%)"
        exit 0
    else
        log "ERROR" "❌ 部分集成测试失败"
        send_notification "error" "N8N自动化平台集成测试存在失败项 (通过率: $pass_rate%)"
        exit 1
    fi
}

# 处理命令行参数
case "${1:-}" in
    --help|-h)
        echo "N8N 自动化平台集成测试脚本"
        echo ""
        echo "用法: $0 [选项]"
        echo ""
        echo "选项:"
        echo "  --help, -h     显示帮助信息"
        echo "  --version, -v  显示版本信息"
        echo "  --quiet, -q    静默模式，只输出错误"
        echo "  --verbose      详细模式，输出调试信息"
        echo "  --fast         快速模式，跳过性能测试"
        echo ""
        echo "环境变量:"
        echo "  N8N_HOST              N8N服务主机 (默认: localhost)"
        echo "  N8N_PORT              N8N服务端口 (默认: 5678)"
        echo "  N8N_PROTOCOL          N8N服务协议 (默认: http)"
        echo "  TEST_TIMEOUT          测试超时时间 (默认: 300秒)"
        echo "  TEST_RETRIES          测试重试次数 (默认: 3次)"
        echo "  N8N_API_TOKEN         N8N API访问令牌"
        echo "  SLACK_WEBHOOK_URL     Slack通知Webhook URL"
        exit 0
        ;;
    --version|-v)
        echo "N8N Integration Test Script v1.0.0"
        exit 0
        ;;
    --quiet|-q)
        exec > /dev/null
        ;;
    --verbose)
        set -x
        ;;
    --fast)
        # 快速模式标志，可以在测试中使用
        export FAST_MODE=true
        ;;
esac

# 执行主函数
main "$@"