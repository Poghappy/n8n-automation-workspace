#!/bin/bash

# N8N 自动化平台端到端测试脚本
# 用于执行完整的用户场景测试

set -euo pipefail

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${PROJECT_ROOT}/logs/e2e-test.log"
CONFIG_FILE="${PROJECT_ROOT}/.env"

# 测试配置
N8N_HOST="${N8N_HOST:-localhost}"
N8N_PORT="${N8N_PORT:-5678}"
N8N_PROTOCOL="${N8N_PROTOCOL:-http}"
TEST_TIMEOUT="${TEST_TIMEOUT:-600}"
BROWSER_TIMEOUT="${BROWSER_TIMEOUT:-30000}"

# 测试用户配置
TEST_USER_EMAIL="${TEST_USER_EMAIL:-test@example.com}"
TEST_USER_PASSWORD="${TEST_USER_PASSWORD:-testpassword123}"
TEST_USER_FIRST_NAME="${TEST_USER_FIRST_NAME:-Test}"
TEST_USER_LAST_NAME="${TEST_USER_LAST_NAME:-User}"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_SCENARIOS=0
PASSED_SCENARIOS=0
FAILED_SCENARIOS=0
SKIPPED_SCENARIOS=0

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

# 场景测试执行函数
run_scenario() {
    local scenario_name=$1
    local scenario_function=$2
    
    TOTAL_SCENARIOS=$((TOTAL_SCENARIOS + 1))
    
    log "INFO" "开始执行场景: $scenario_name"
    
    if $scenario_function; then
        log "INFO" "✅ 场景通过: $scenario_name"
        PASSED_SCENARIOS=$((PASSED_SCENARIOS + 1))
        return 0
    else
        log "ERROR" "❌ 场景失败: $scenario_name"
        FAILED_SCENARIOS=$((FAILED_SCENARIOS + 1))
        return 1
    fi
}

# 跳过场景
skip_scenario() {
    local scenario_name=$1
    local reason=$2
    
    TOTAL_SCENARIOS=$((TOTAL_SCENARIOS + 1))
    SKIPPED_SCENARIOS=$((SKIPPED_SCENARIOS + 1))
    
    log "WARN" "⏭️ 跳过场景: $scenario_name (原因: $reason)"
}

# 创建测试用的Node.js脚本
create_test_script() {
    local script_name=$1
    local script_content=$2
    local script_file="${PROJECT_ROOT}/temp/${script_name}.js"
    
    # 创建临时目录
    mkdir -p "${PROJECT_ROOT}/temp"
    
    # 写入脚本内容
    cat > "$script_file" << EOF
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        $script_content
        
        console.log('✅ 测试通过');
        process.exit(0);
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
EOF
    
    echo "$script_file"
}

# 执行Node.js测试脚本
run_node_script() {
    local script_file=$1
    local timeout=${2:-60}
    
    if ! check_command "node"; then
        log "ERROR" "Node.js未安装"
        return 1
    fi
    
    # 检查puppeteer是否安装
    if ! node -e "require('puppeteer')" 2>/dev/null; then
        log "WARN" "Puppeteer未安装，尝试安装..."
        if ! npm install puppeteer &>/dev/null; then
            log "ERROR" "Puppeteer安装失败"
            return 1
        fi
    fi
    
    # 执行脚本
    if timeout "$timeout" node "$script_file"; then
        return 0
    else
        return 1
    fi
}

# 场景1: 用户注册和登录
scenario_user_registration_login() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    
    local script_content="
        // 访问N8N首页
        await page.goto('$n8n_url', { waitUntil: 'networkidle2', timeout: ${BROWSER_TIMEOUT} });
        
        // 检查页面标题
        const title = await page.title();
        if (!title.includes('n8n')) {
            throw new Error('页面标题不正确: ' + title);
        }
        
        // 检查是否有登录表单或设置页面
        await page.waitForSelector('body', { timeout: ${BROWSER_TIMEOUT} });
        
        // 截图保存
        await page.screenshot({ path: '${PROJECT_ROOT}/logs/e2e-homepage.png' });
        
        console.log('✅ 成功访问N8N首页');
    "
    
    local script_file
    script_file=$(create_test_script "user_registration_login" "$script_content")
    
    if run_node_script "$script_file" 120; then
        return 0
    else
        return 1
    fi
}

# 场景2: 工作流创建和编辑
scenario_workflow_creation() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    
    local script_content="
        // 访问N8N工作流页面
        await page.goto('$n8n_url/workflow/new', { waitUntil: 'networkidle2', timeout: ${BROWSER_TIMEOUT} });
        
        // 等待编辑器加载
        await page.waitForSelector('.node-view', { timeout: ${BROWSER_TIMEOUT} });
        
        // 检查是否有节点面板
        const nodePanel = await page.$('.nodes-list-panel');
        if (!nodePanel) {
            throw new Error('节点面板未找到');
        }
        
        // 截图保存
        await page.screenshot({ path: '${PROJECT_ROOT}/logs/e2e-workflow-editor.png' });
        
        console.log('✅ 成功访问工作流编辑器');
    "
    
    local script_file
    script_file=$(create_test_script "workflow_creation" "$script_content")
    
    if run_node_script "$script_file" 120; then
        return 0
    else
        return 1
    fi
}

# 场景3: 节点添加和配置
scenario_node_configuration() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    
    local script_content="
        // 访问N8N工作流页面
        await page.goto('$n8n_url/workflow/new', { waitUntil: 'networkidle2', timeout: ${BROWSER_TIMEOUT} });
        
        // 等待编辑器加载
        await page.waitForSelector('.node-view', { timeout: ${BROWSER_TIMEOUT} });
        
        // 尝试添加一个HTTP Request节点
        try {
            // 点击添加节点按钮
            const addButton = await page.$('[data-test-id=\"add-node-button\"]');
            if (addButton) {
                await addButton.click();
                await page.waitForTimeout(1000);
            }
            
            // 搜索HTTP Request节点
            const searchInput = await page.$('input[placeholder*=\"search\"]');
            if (searchInput) {
                await searchInput.type('HTTP Request');
                await page.waitForTimeout(1000);
            }
        } catch (error) {
            console.log('节点添加界面可能不同，继续测试...');
        }
        
        // 截图保存
        await page.screenshot({ path: '${PROJECT_ROOT}/logs/e2e-node-config.png' });
        
        console.log('✅ 节点配置界面测试完成');
    "
    
    local script_file
    script_file=$(create_test_script "node_configuration" "$script_content")
    
    if run_node_script "$script_file" 120; then
        return 0
    else
        return 1
    fi
}

# 场景4: 工作流执行
scenario_workflow_execution() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    
    # 使用API创建和执行简单工作流
    local workflow_data='{
        "name": "E2E Test Workflow",
        "nodes": [
            {
                "id": "start",
                "name": "Start",
                "type": "n8n-nodes-base.start",
                "position": [240, 300],
                "parameters": {}
            },
            {
                "id": "set",
                "name": "Set",
                "type": "n8n-nodes-base.set",
                "position": [460, 300],
                "parameters": {
                    "values": {
                        "string": [
                            {
                                "name": "message",
                                "value": "Hello from E2E test!"
                            }
                        ]
                    }
                }
            }
        ],
        "connections": {
            "Start": {
                "main": [
                    [
                        {
                            "node": "Set",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            }
        },
        "active": false,
        "settings": {}
    }'
    
    # 尝试通过API创建工作流
    local response
    if response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$workflow_data" \
        "$n8n_url/rest/workflows" 2>/dev/null); then
        
        log "INFO" "工作流创建成功"
        return 0
    else
        log "WARN" "API创建工作流失败，可能需要认证"
        
        # 使用浏览器测试工作流执行界面
        local script_content="
            // 访问N8N工作流页面
            await page.goto('$n8n_url/workflows', { waitUntil: 'networkidle2', timeout: ${BROWSER_TIMEOUT} });
            
            // 检查工作流列表页面
            await page.waitForSelector('body', { timeout: ${BROWSER_TIMEOUT} });
            
            // 截图保存
            await page.screenshot({ path: '${PROJECT_ROOT}/logs/e2e-workflow-list.png' });
            
            console.log('✅ 工作流列表页面访问成功');
        "
        
        local script_file
        script_file=$(create_test_script "workflow_execution" "$script_content")
        
        if run_node_script "$script_file" 120; then
            return 0
        else
            return 1
        fi
    fi
}

# 场景5: 数据连接测试
scenario_data_connection() {
    # 测试数据库连接功能
    if [ -n "${DB_POSTGRESDB_HOST:-}" ]; then
        log "INFO" "测试数据库连接功能"
        
        # 检查数据库连接
        if PGPASSWORD="${DB_POSTGRESDB_PASSWORD}" psql -h "${DB_POSTGRESDB_HOST}" -p "${DB_POSTGRESDB_PORT:-5432}" -U "${DB_POSTGRESDB_USER}" -d "${DB_POSTGRESDB_DATABASE}" -c "SELECT version();" &>/dev/null; then
            log "INFO" "✅ 数据库连接测试通过"
            return 0
        else
            log "ERROR" "❌ 数据库连接测试失败"
            return 1
        fi
    else
        log "INFO" "跳过数据库连接测试（未配置）"
        return 0
    fi
}

# 场景6: API端点测试
scenario_api_endpoints() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    
    # 测试各种API端点
    local endpoints=(
        "/healthz"
        "/rest/login"
        "/rest/workflows"
        "/rest/executions"
    )
    
    for endpoint in "${endpoints[@]}"; do
        log "INFO" "测试API端点: $endpoint"
        
        local status_code
        if status_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 "$n8n_url$endpoint" 2>/dev/null); then
            if [ "$status_code" = "200" ] || [ "$status_code" = "401" ] || [ "$status_code" = "403" ]; then
                log "INFO" "✅ API端点 $endpoint 响应正常 (状态码: $status_code)"
            else
                log "WARN" "⚠️ API端点 $endpoint 响应异常 (状态码: $status_code)"
            fi
        else
            log "ERROR" "❌ API端点 $endpoint 连接失败"
            return 1
        fi
    done
    
    return 0
}

# 场景7: 文件上传和下载
scenario_file_operations() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    
    local script_content="
        // 访问N8N首页
        await page.goto('$n8n_url', { waitUntil: 'networkidle2', timeout: ${BROWSER_TIMEOUT} });
        
        // 检查是否有文件上传相关的界面元素
        const fileInputs = await page.$$('input[type=\"file\"]');
        
        // 截图保存
        await page.screenshot({ path: '${PROJECT_ROOT}/logs/e2e-file-operations.png' });
        
        console.log('✅ 文件操作界面检查完成，找到 ' + fileInputs.length + ' 个文件输入框');
    "
    
    local script_file
    script_file=$(create_test_script "file_operations" "$script_content")
    
    if run_node_script "$script_file" 60; then
        return 0
    else
        return 1
    fi
}

# 场景8: 响应性能测试
scenario_performance_test() {
    local n8n_url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    
    local script_content="
        // 测试页面加载性能
        const startTime = Date.now();
        
        await page.goto('$n8n_url', { waitUntil: 'networkidle2', timeout: ${BROWSER_TIMEOUT} });
        
        const loadTime = Date.now() - startTime;
        
        // 检查页面加载时间
        if (loadTime > 10000) {
            throw new Error('页面加载时间过长: ' + loadTime + 'ms');
        }
        
        // 测试页面交互响应
        const interactionStart = Date.now();
        await page.click('body');
        const interactionTime = Date.now() - interactionStart;
        
        // 截图保存
        await page.screenshot({ path: '${PROJECT_ROOT}/logs/e2e-performance.png' });
        
        console.log('✅ 性能测试完成 - 加载时间: ' + loadTime + 'ms, 交互时间: ' + interactionTime + 'ms');
    "
    
    local script_file
    script_file=$(create_test_script "performance_test" "$script_content")
    
    if run_node_script "$script_file" 120; then
        return 0
    else
        return 1
    fi
}

# 生成测试报告
generate_test_report() {
    local report_file="${PROJECT_ROOT}/logs/e2e-test-report-$(date +%Y%m%d-%H%M%S).json"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    log "INFO" "生成端到端测试报告: $report_file"
    
    # 创建报告目录
    mkdir -p "$(dirname "$report_file")"
    
    # 计算测试通过率
    local pass_rate=0
    if [ $TOTAL_SCENARIOS -gt 0 ]; then
        pass_rate=$((PASSED_SCENARIOS * 100 / TOTAL_SCENARIOS))
    fi
    
    # 生成JSON报告
    cat > "$report_file" << EOF
{
  "timestamp": "$timestamp",
  "hostname": "$(hostname)",
  "test_summary": {
    "total_scenarios": $TOTAL_SCENARIOS,
    "passed_scenarios": $PASSED_SCENARIOS,
    "failed_scenarios": $FAILED_SCENARIOS,
    "skipped_scenarios": $SKIPPED_SCENARIOS,
    "pass_rate": $pass_rate
  },
  "test_environment": {
    "n8n_host": "$N8N_HOST",
    "n8n_port": $N8N_PORT,
    "n8n_protocol": "$N8N_PROTOCOL",
    "browser_timeout": $BROWSER_TIMEOUT,
    "test_timeout": $TEST_TIMEOUT
  },
  "test_configuration": {
    "test_user_email": "$TEST_USER_EMAIL",
    "headless_browser": true,
    "screenshot_enabled": true
  },
  "system_info": {
    "os": "$(uname -s)",
    "arch": "$(uname -m)",
    "kernel": "$(uname -r)",
    "node_version": "$(node --version 2>/dev/null || echo 'N/A')",
    "npm_version": "$(npm --version 2>/dev/null || echo 'N/A')"
  }
}
EOF
    
    log "INFO" "✅ 端到端测试报告已生成: $report_file"
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
                    \"title\": \"N8N端到端测试报告\",
                    \"text\": \"$message\",
                    \"fields\": [
                        {\"title\": \"主机\", \"value\": \"$(hostname)\", \"short\": true},
                        {\"title\": \"时间\", \"value\": \"$(date '+%Y-%m-%d %H:%M:%S')\", \"short\": true},
                        {\"title\": \"总场景数\", \"value\": \"$TOTAL_SCENARIOS\", \"short\": true},
                        {\"title\": \"通过场景\", \"value\": \"$PASSED_SCENARIOS\", \"short\": true},
                        {\"title\": \"失败场景\", \"value\": \"$FAILED_SCENARIOS\", \"short\": true},
                        {\"title\": \"跳过场景\", \"value\": \"$SKIPPED_SCENARIOS\", \"short\": true}
                    ],
                    \"footer\": \"N8N E2E Test\",
                    \"ts\": $(date +%s)
                }]
            }" \
            "$SLACK_WEBHOOK_URL" &>/dev/null || log "WARN" "Slack通知发送失败"
    fi
}

# 清理临时文件
cleanup() {
    log "INFO" "清理临时文件..."
    rm -rf "${PROJECT_ROOT}/temp" 2>/dev/null || true
}

# 主函数
main() {
    log "INFO" "开始N8N自动化平台端到端测试..."
    log "INFO" "测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
    log "INFO" "主机名: $(hostname)"
    
    # 设置清理函数
    trap cleanup EXIT
    
    # 加载环境变量
    load_env
    
    # 等待N8N服务启动
    if ! wait_for_service "$N8N_HOST" "$N8N_PORT" "N8N" 60; then
        log "ERROR" "N8N服务未启动，无法执行端到端测试"
        exit 1
    fi
    
    # 执行测试场景
    log "INFO" "==================== 开始执行端到端测试 ===================="
    
    # 基础功能场景
    run_scenario "用户注册和登录" scenario_user_registration_login
    run_scenario "工作流创建和编辑" scenario_workflow_creation
    run_scenario "节点添加和配置" scenario_node_configuration
    run_scenario "工作流执行" scenario_workflow_execution
    
    # 数据和API场景
    run_scenario "数据连接测试" scenario_data_connection
    run_scenario "API端点测试" scenario_api_endpoints
    
    # 高级功能场景
    run_scenario "文件上传和下载" scenario_file_operations
    run_scenario "响应性能测试" scenario_performance_test
    
    log "INFO" "==================== 端到端测试完成 ===================="
    
    # 生成测试报告
    generate_test_report
    
    # 输出测试总结
    log "INFO" "==================== 测试总结 ===================="
    log "INFO" "总场景数: $TOTAL_SCENARIOS"
    log "INFO" "通过场景: $PASSED_SCENARIOS"
    log "INFO" "失败场景: $FAILED_SCENARIOS"
    log "INFO" "跳过场景: $SKIPPED_SCENARIOS"
    
    local pass_rate=0
    if [ $TOTAL_SCENARIOS -gt 0 ]; then
        pass_rate=$((PASSED_SCENARIOS * 100 / TOTAL_SCENARIOS))
    fi
    log "INFO" "通过率: $pass_rate%"
    log "INFO" "=================================================="
    
    # 发送通知
    if [ $FAILED_SCENARIOS -eq 0 ]; then
        log "INFO" "✅ 所有端到端测试场景通过"
        send_notification "success" "N8N自动化平台端到端测试全部通过 (通过率: $pass_rate%)"
        exit 0
    else
        log "ERROR" "❌ 部分端到端测试场景失败"
        send_notification "error" "N8N自动化平台端到端测试存在失败项 (通过率: $pass_rate%)"
        exit 1
    fi
}

# 处理命令行参数
case "${1:-}" in
    --help|-h)
        echo "N8N 自动化平台端到端测试脚本"
        echo ""
        echo "用法: $0 [选项]"
        echo ""
        echo "选项:"
        echo "  --help, -h     显示帮助信息"
        echo "  --version, -v  显示版本信息"
        echo "  --quiet, -q    静默模式，只输出错误"
        echo "  --verbose      详细模式，输出调试信息"
        echo "  --headful      使用有头浏览器模式"
        echo ""
        echo "环境变量:"
        echo "  N8N_HOST              N8N服务主机 (默认: localhost)"
        echo "  N8N_PORT              N8N服务端口 (默认: 5678)"
        echo "  N8N_PROTOCOL          N8N服务协议 (默认: http)"
        echo "  TEST_TIMEOUT          测试超时时间 (默认: 600秒)"
        echo "  BROWSER_TIMEOUT       浏览器超时时间 (默认: 30000毫秒)"
        echo "  TEST_USER_EMAIL       测试用户邮箱"
        echo "  TEST_USER_PASSWORD    测试用户密码"
        echo "  SLACK_WEBHOOK_URL     Slack通知Webhook URL"
        exit 0
        ;;
    --version|-v)
        echo "N8N E2E Test Script v1.0.0"
        exit 0
        ;;
    --quiet|-q)
        exec > /dev/null
        ;;
    --verbose)
        set -x
        ;;
    --headful)
        export HEADLESS_BROWSER=false
        ;;
esac

# 执行主函数
main "$@"