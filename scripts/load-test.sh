#!/bin/bash

# N8N 自动化平台负载测试脚本
# 用于测试系统在高负载下的性能表现

set -euo pipefail

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${PROJECT_ROOT}/logs/load-test.log"
CONFIG_FILE="${PROJECT_ROOT}/.env"

# 负载测试配置
N8N_HOST="${N8N_HOST:-localhost}"
N8N_PORT="${N8N_PORT:-5678}"
N8N_PROTOCOL="${N8N_PROTOCOL:-http}"
LOAD_TEST_DURATION="${LOAD_TEST_DURATION:-300}"  # 5分钟
CONCURRENT_USERS="${CONCURRENT_USERS:-10}"
RAMP_UP_TIME="${RAMP_UP_TIME:-60}"  # 1分钟
THINK_TIME="${THINK_TIME:-1}"  # 1秒

# 测试场景配置
TEST_SCENARIOS="${TEST_SCENARIOS:-basic,workflow,api}"
MAX_RESPONSE_TIME="${MAX_RESPONSE_TIME:-5000}"  # 5秒
ERROR_RATE_THRESHOLD="${ERROR_RATE_THRESHOLD:-5}"  # 5%

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_REQUESTS=0
SUCCESSFUL_REQUESTS=0
FAILED_REQUESTS=0
TOTAL_RESPONSE_TIME=0
MIN_RESPONSE_TIME=999999
MAX_RESPONSE_TIME=0

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

# 安装依赖工具
install_dependencies() {
    log "INFO" "检查负载测试依赖工具..."
    
    # 检查curl
    if ! check_command "curl"; then
        log "ERROR" "curl未安装，请先安装curl"
        return 1
    fi
    
    # 检查ab (Apache Bench)
    if ! check_command "ab"; then
        log "WARN" "Apache Bench (ab)未安装，尝试安装..."
        
        # macOS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            if check_command "brew"; then
                brew install httpd || log "WARN" "ab安装失败"
            fi
        # Ubuntu/Debian
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            if check_command "apt-get"; then
                sudo apt-get update && sudo apt-get install -y apache2-utils || log "WARN" "ab安装失败"
            elif check_command "yum"; then
                sudo yum install -y httpd-tools || log "WARN" "ab安装失败"
            fi
        fi
    fi
    
    # 检查wrk (如果可用)
    if ! check_command "wrk"; then
        log "INFO" "wrk未安装，将使用其他工具进行负载测试"
    fi
    
    # 检查hey (如果可用)
    if ! check_command "hey"; then
        log "INFO" "hey未安装，将使用其他工具进行负载测试"
    fi
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

# 执行HTTP请求并记录统计
make_request() {
    local url=$1
    local method=${2:-GET}
    local data=${3:-}
    local headers=${4:-}
    
    local start_time=$(date +%s%3N)
    local response_code
    local response_time
    
    # 构建curl命令
    local curl_cmd="curl -s -o /dev/null -w '%{http_code}' --connect-timeout 10 --max-time 30"
    
    if [ -n "$headers" ]; then
        curl_cmd="$curl_cmd -H '$headers'"
    fi
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        curl_cmd="$curl_cmd -X POST -d '$data'"
    fi
    
    curl_cmd="$curl_cmd '$url'"
    
    # 执行请求
    if response_code=$(eval $curl_cmd 2>/dev/null); then
        local end_time=$(date +%s%3N)
        response_time=$((end_time - start_time))
        
        # 更新统计
        TOTAL_REQUESTS=$((TOTAL_REQUESTS + 1))
        TOTAL_RESPONSE_TIME=$((TOTAL_RESPONSE_TIME + response_time))
        
        if [ $response_time -lt $MIN_RESPONSE_TIME ]; then
            MIN_RESPONSE_TIME=$response_time
        fi
        
        if [ $response_time -gt $MAX_RESPONSE_TIME ]; then
            MAX_RESPONSE_TIME=$response_time
        fi
        
        # 检查响应码
        if [[ "$response_code" =~ ^[23] ]]; then
            SUCCESSFUL_REQUESTS=$((SUCCESSFUL_REQUESTS + 1))
            return 0
        else
            FAILED_REQUESTS=$((FAILED_REQUESTS + 1))
            log "WARN" "请求失败: $url (状态码: $response_code, 响应时间: ${response_time}ms)"
            return 1
        fi
    else
        TOTAL_REQUESTS=$((TOTAL_REQUESTS + 1))
        FAILED_REQUESTS=$((FAILED_REQUESTS + 1))
        log "ERROR" "请求超时或连接失败: $url"
        return 1
    fi
}

# 基础负载测试场景
scenario_basic_load() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    local duration=$1
    local concurrent_users=$2
    
    log "INFO" "执行基础负载测试场景..."
    log "INFO" "目标URL: $n8n_url"
    log "INFO" "持续时间: ${duration}秒"
    log "INFO" "并发用户: $concurrent_users"
    
    # 使用Apache Bench进行负载测试
    if check_command "ab"; then
        local total_requests=$((duration * concurrent_users / 10))  # 每10秒一个请求
        
        log "INFO" "使用Apache Bench执行负载测试..."
        local ab_output
        if ab_output=$(ab -n $total_requests -c $concurrent_users -g "${PROJECT_ROOT}/logs/ab-results.tsv" "$n8n_url/" 2>&1); then
            log "INFO" "Apache Bench测试完成"
            echo "$ab_output" >> "$LOG_FILE"
            
            # 解析结果
            local requests_per_second
            requests_per_second=$(echo "$ab_output" | grep "Requests per second" | awk '{print $4}')
            
            local time_per_request
            time_per_request=$(echo "$ab_output" | grep "Time per request" | head -1 | awk '{print $4}')
            
            log "INFO" "每秒请求数: $requests_per_second"
            log "INFO" "平均响应时间: ${time_per_request}ms"
            
            return 0
        else
            log "ERROR" "Apache Bench测试失败: $ab_output"
            return 1
        fi
    else
        # 使用自定义并发测试
        log "INFO" "使用自定义并发测试..."
        
        local pids=()
        local end_time=$(($(date +%s) + duration))
        
        # 启动并发进程
        for ((i=1; i<=concurrent_users; i++)); do
            (
                while [ $(date +%s) -lt $end_time ]; do
                    make_request "$n8n_url/"
                    sleep $THINK_TIME
                done
            ) &
            pids+=($!)
        done
        
        # 等待所有进程完成
        for pid in "${pids[@]}"; do
            wait $pid
        done
        
        return 0
    fi
}

# 工作流负载测试场景
scenario_workflow_load() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    local duration=$1
    local concurrent_users=$2
    
    log "INFO" "执行工作流负载测试场景..."
    
    # 测试工作流相关端点
    local endpoints=(
        "/rest/workflows"
        "/rest/executions"
        "/rest/credentials"
    )
    
    local pids=()
    local end_time=$(($(date +%s) + duration))
    
    # 为每个端点启动并发测试
    for endpoint in "${endpoints[@]}"; do
        for ((i=1; i<=concurrent_users; i++)); do
            (
                while [ $(date +%s) -lt $end_time ]; do
                    make_request "$n8n_url$endpoint"
                    sleep $THINK_TIME
                done
            ) &
            pids+=($!)
        done
    done
    
    # 等待所有进程完成
    for pid in "${pids[@]}"; do
        wait $pid
    done
    
    return 0
}

# API负载测试场景
scenario_api_load() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    local duration=$1
    local concurrent_users=$2
    
    log "INFO" "执行API负载测试场景..."
    
    # 使用wrk进行API负载测试（如果可用）
    if check_command "wrk"; then
        log "INFO" "使用wrk执行API负载测试..."
        
        local wrk_output
        if wrk_output=$(wrk -t$concurrent_users -c$concurrent_users -d${duration}s --timeout=30s "$n8n_url/healthz" 2>&1); then
            log "INFO" "wrk测试完成"
            echo "$wrk_output" >> "$LOG_FILE"
            
            # 解析结果
            local requests_per_second
            requests_per_second=$(echo "$wrk_output" | grep "Requests/sec" | awk '{print $2}')
            
            local avg_latency
            avg_latency=$(echo "$wrk_output" | grep "Latency" | awk '{print $2}')
            
            log "INFO" "每秒请求数: $requests_per_second"
            log "INFO" "平均延迟: $avg_latency"
            
            return 0
        else
            log "ERROR" "wrk测试失败: $wrk_output"
            return 1
        fi
    else
        # 使用hey进行API负载测试（如果可用）
        if check_command "hey"; then
            log "INFO" "使用hey执行API负载测试..."
            
            local hey_output
            if hey_output=$(hey -z ${duration}s -c $concurrent_users "$n8n_url/healthz" 2>&1); then
                log "INFO" "hey测试完成"
                echo "$hey_output" >> "$LOG_FILE"
                return 0
            else
                log "ERROR" "hey测试失败: $hey_output"
                return 1
            fi
        else
            # 使用自定义API负载测试
            log "INFO" "使用自定义API负载测试..."
            
            local api_endpoints=(
                "/healthz"
                "/rest/login"
                "/rest/workflows"
            )
            
            local pids=()
            local end_time=$(($(date +%s) + duration))
            
            # 为每个API端点启动并发测试
            for endpoint in "${api_endpoints[@]}"; do
                for ((i=1; i<=concurrent_users; i++)); do
                    (
                        while [ $(date +%s) -lt $end_time ]; do
                            make_request "$n8n_url$endpoint"
                            sleep $THINK_TIME
                        done
                    ) &
                    pids+=($!)
                done
            done
            
            # 等待所有进程完成
            for pid in "${pids[@]}"; do
                wait $pid
            done
            
            return 0
        fi
    fi
}

# 压力测试场景
scenario_stress_test() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    
    log "INFO" "执行压力测试场景..."
    
    # 逐步增加负载
    local stress_levels=(5 10 20 50 100)
    
    for level in "${stress_levels[@]}"; do
        log "INFO" "压力测试级别: $level 并发用户"
        
        # 执行短时间高强度测试
        local pids=()
        local test_duration=30  # 30秒
        local end_time=$(($(date +%s) + test_duration))
        
        # 启动并发进程
        for ((i=1; i<=level; i++)); do
            (
                while [ $(date +%s) -lt $end_time ]; do
                    make_request "$n8n_url/"
                    # 压力测试不等待
                done
            ) &
            pids+=($!)
        done
        
        # 等待所有进程完成
        for pid in "${pids[@]}"; do
            wait $pid
        done
        
        # 检查系统是否还能响应
        if ! make_request "$n8n_url/healthz"; then
            log "WARN" "系统在 $level 并发用户下出现响应问题"
            break
        fi
        
        # 恢复时间
        sleep 10
    done
    
    return 0
}

# 内存泄漏测试场景
scenario_memory_leak_test() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    local duration=$1
    
    log "INFO" "执行内存泄漏测试场景..."
    log "INFO" "测试持续时间: ${duration}秒"
    
    # 记录初始内存使用情况
    local initial_memory
    if command -v docker &> /dev/null; then
        # 如果使用Docker，获取容器内存使用情况
        local container_id
        container_id=$(docker ps --filter "publish=$N8N_PORT" --format "{{.ID}}" | head -1)
        
        if [ -n "$container_id" ]; then
            initial_memory=$(docker stats --no-stream --format "{{.MemUsage}}" "$container_id" | cut -d'/' -f1)
            log "INFO" "初始内存使用: $initial_memory"
        fi
    fi
    
    # 执行长时间连续请求
    local end_time=$(($(date +%s) + duration))
    local request_count=0
    
    while [ $(date +%s) -lt $end_time ]; do
        make_request "$n8n_url/"
        request_count=$((request_count + 1))
        
        # 每100个请求检查一次内存
        if [ $((request_count % 100)) -eq 0 ]; then
            if [ -n "${container_id:-}" ]; then
                local current_memory
                current_memory=$(docker stats --no-stream --format "{{.MemUsage}}" "$container_id" | cut -d'/' -f1)
                log "INFO" "当前内存使用: $current_memory (请求数: $request_count)"
            fi
        fi
        
        sleep 0.1  # 100ms间隔
    done
    
    # 记录最终内存使用情况
    if [ -n "${container_id:-}" ]; then
        local final_memory
        final_memory=$(docker stats --no-stream --format "{{.MemUsage}}" "$container_id" | cut -d'/' -f1)
        log "INFO" "最终内存使用: $final_memory"
        log "INFO" "总请求数: $request_count"
    fi
    
    return 0
}

# 生成负载测试报告
generate_load_test_report() {
    local report_file="${PROJECT_ROOT}/logs/load-test-report-$(date +%Y%m%d-%H%M%S).json"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    log "INFO" "生成负载测试报告: $report_file"
    
    # 创建报告目录
    mkdir -p "$(dirname "$report_file")"
    
    # 计算统计数据
    local success_rate=0
    local avg_response_time=0
    local error_rate=0
    
    if [ $TOTAL_REQUESTS -gt 0 ]; then
        success_rate=$((SUCCESSFUL_REQUESTS * 100 / TOTAL_REQUESTS))
        error_rate=$((FAILED_REQUESTS * 100 / TOTAL_REQUESTS))
        
        if [ $SUCCESSFUL_REQUESTS -gt 0 ]; then
            avg_response_time=$((TOTAL_RESPONSE_TIME / SUCCESSFUL_REQUESTS))
        fi
    fi
    
    # 生成JSON报告
    cat > "$report_file" << EOF
{
  "timestamp": "$timestamp",
  "hostname": "$(hostname)",
  "test_configuration": {
    "n8n_host": "$N8N_HOST",
    "n8n_port": $N8N_PORT,
    "n8n_protocol": "$N8N_PROTOCOL",
    "duration": $LOAD_TEST_DURATION,
    "concurrent_users": $CONCURRENT_USERS,
    "ramp_up_time": $RAMP_UP_TIME,
    "think_time": $THINK_TIME,
    "test_scenarios": "$TEST_SCENARIOS"
  },
  "test_results": {
    "total_requests": $TOTAL_REQUESTS,
    "successful_requests": $SUCCESSFUL_REQUESTS,
    "failed_requests": $FAILED_REQUESTS,
    "success_rate": $success_rate,
    "error_rate": $error_rate,
    "avg_response_time_ms": $avg_response_time,
    "min_response_time_ms": $MIN_RESPONSE_TIME,
    "max_response_time_ms": $MAX_RESPONSE_TIME
  },
  "performance_thresholds": {
    "max_response_time_ms": $MAX_RESPONSE_TIME,
    "error_rate_threshold": $ERROR_RATE_THRESHOLD,
    "max_response_time_exceeded": $([ $MAX_RESPONSE_TIME -gt $MAX_RESPONSE_TIME ] && echo "true" || echo "false"),
    "error_rate_exceeded": $([ $error_rate -gt $ERROR_RATE_THRESHOLD ] && echo "true" || echo "false")
  },
  "system_info": {
    "os": "$(uname -s)",
    "arch": "$(uname -m)",
    "kernel": "$(uname -r)",
    "cpu_cores": "$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 'N/A')",
    "memory_gb": "$(free -g 2>/dev/null | awk '/^Mem:/{print $2}' || sysctl -n hw.memsize 2>/dev/null | awk '{print int($1/1024/1024/1024)}' || echo 'N/A')"
  }
}
EOF
    
    log "INFO" "✅ 负载测试报告已生成: $report_file"
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
        
        local success_rate=0
        if [ $TOTAL_REQUESTS -gt 0 ]; then
            success_rate=$((SUCCESSFUL_REQUESTS * 100 / TOTAL_REQUESTS))
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"N8N负载测试报告\",
                    \"text\": \"$message\",
                    \"fields\": [
                        {\"title\": \"主机\", \"value\": \"$(hostname)\", \"short\": true},
                        {\"title\": \"时间\", \"value\": \"$(date '+%Y-%m-%d %H:%M:%S')\", \"short\": true},
                        {\"title\": \"总请求数\", \"value\": \"$TOTAL_REQUESTS\", \"short\": true},
                        {\"title\": \"成功率\", \"value\": \"$success_rate%\", \"short\": true},
                        {\"title\": \"并发用户\", \"value\": \"$CONCURRENT_USERS\", \"short\": true},
                        {\"title\": \"测试时长\", \"value\": \"${LOAD_TEST_DURATION}秒\", \"short\": true}
                    ],
                    \"footer\": \"N8N Load Test\",
                    \"ts\": $(date +%s)
                }]
            }" \
            "$SLACK_WEBHOOK_URL" &>/dev/null || log "WARN" "Slack通知发送失败"
    fi
}

# 主函数
main() {
    log "INFO" "开始N8N自动化平台负载测试..."
    log "INFO" "测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
    log "INFO" "主机名: $(hostname)"
    
    # 加载环境变量
    load_env
    
    # 安装依赖工具
    install_dependencies
    
    # 等待N8N服务启动
    if ! wait_for_service "$N8N_HOST" "$N8N_PORT" "N8N" 60; then
        log "ERROR" "N8N服务未启动，无法执行负载测试"
        exit 1
    fi
    
    # 重置统计数据
    TOTAL_REQUESTS=0
    SUCCESSFUL_REQUESTS=0
    FAILED_REQUESTS=0
    TOTAL_RESPONSE_TIME=0
    MIN_RESPONSE_TIME=999999
    MAX_RESPONSE_TIME=0
    
    # 执行负载测试场景
    log "INFO" "==================== 开始执行负载测试 ===================="
    
    # 解析测试场景
    IFS=',' read -ra SCENARIOS <<< "$TEST_SCENARIOS"
    
    for scenario in "${SCENARIOS[@]}"; do
        case $scenario in
            "basic")
                log "INFO" "执行基础负载测试..."
                scenario_basic_load "$LOAD_TEST_DURATION" "$CONCURRENT_USERS"
                ;;
            "workflow")
                log "INFO" "执行工作流负载测试..."
                scenario_workflow_load "$LOAD_TEST_DURATION" "$CONCURRENT_USERS"
                ;;
            "api")
                log "INFO" "执行API负载测试..."
                scenario_api_load "$LOAD_TEST_DURATION" "$CONCURRENT_USERS"
                ;;
            "stress")
                log "INFO" "执行压力测试..."
                scenario_stress_test
                ;;
            "memory")
                log "INFO" "执行内存泄漏测试..."
                scenario_memory_leak_test "$LOAD_TEST_DURATION"
                ;;
            *)
                log "WARN" "未知测试场景: $scenario"
                ;;
        esac
    done
    
    log "INFO" "==================== 负载测试完成 ===================="
    
    # 生成测试报告
    generate_load_test_report
    
    # 输出测试总结
    log "INFO" "==================== 测试总结 ===================="
    log "INFO" "总请求数: $TOTAL_REQUESTS"
    log "INFO" "成功请求: $SUCCESSFUL_REQUESTS"
    log "INFO" "失败请求: $FAILED_REQUESTS"
    
    local success_rate=0
    local avg_response_time=0
    
    if [ $TOTAL_REQUESTS -gt 0 ]; then
        success_rate=$((SUCCESSFUL_REQUESTS * 100 / TOTAL_REQUESTS))
        
        if [ $SUCCESSFUL_REQUESTS -gt 0 ]; then
            avg_response_time=$((TOTAL_RESPONSE_TIME / SUCCESSFUL_REQUESTS))
        fi
    fi
    
    log "INFO" "成功率: $success_rate%"
    log "INFO" "平均响应时间: ${avg_response_time}ms"
    log "INFO" "最小响应时间: ${MIN_RESPONSE_TIME}ms"
    log "INFO" "最大响应时间: ${MAX_RESPONSE_TIME}ms"
    log "INFO" "=================================================="
    
    # 检查性能阈值
    local test_passed=true
    
    if [ $success_rate -lt $((100 - ERROR_RATE_THRESHOLD)) ]; then
        log "ERROR" "❌ 错误率超过阈值: $((100 - success_rate))% > $ERROR_RATE_THRESHOLD%"
        test_passed=false
    fi
    
    if [ $MAX_RESPONSE_TIME -gt $MAX_RESPONSE_TIME ]; then
        log "ERROR" "❌ 最大响应时间超过阈值: ${MAX_RESPONSE_TIME}ms > ${MAX_RESPONSE_TIME}ms"
        test_passed=false
    fi
    
    # 发送通知
    if [ "$test_passed" = true ]; then
        log "INFO" "✅ 负载测试通过所有性能阈值"
        send_notification "success" "N8N自动化平台负载测试通过 (成功率: $success_rate%, 平均响应时间: ${avg_response_time}ms)"
        exit 0
    else
        log "ERROR" "❌ 负载测试未通过性能阈值"
        send_notification "error" "N8N自动化平台负载测试未通过性能阈值 (成功率: $success_rate%, 平均响应时间: ${avg_response_time}ms)"
        exit 1
    fi
}

# 处理命令行参数
case "${1:-}" in
    --help|-h)
        echo "N8N 自动化平台负载测试脚本"
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
        echo "  N8N_HOST                  N8N服务主机 (默认: localhost)"
        echo "  N8N_PORT                  N8N服务端口 (默认: 5678)"
        echo "  N8N_PROTOCOL              N8N服务协议 (默认: http)"
        echo "  LOAD_TEST_DURATION        负载测试持续时间秒数 (默认: 300)"
        echo "  CONCURRENT_USERS          并发用户数 (默认: 10)"
        echo "  RAMP_UP_TIME              负载递增时间秒数 (默认: 60)"
        echo "  THINK_TIME                用户思考时间秒数 (默认: 1)"
        echo "  TEST_SCENARIOS            测试场景 (默认: basic,workflow,api)"
        echo "  MAX_RESPONSE_TIME         最大响应时间毫秒 (默认: 5000)"
        echo "  ERROR_RATE_THRESHOLD      错误率阈值百分比 (默认: 5)"
        echo "  SLACK_WEBHOOK_URL         Slack通知Webhook URL"
        exit 0
        ;;
    --version|-v)
        echo "N8N Load Test Script v1.0.0"
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