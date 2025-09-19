#!/bin/bash

# N8N企业级自动化工作流平台 - 测试脚本
# 全面的系统测试和验证功能

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
TEST_LOG="logs/test.log"
TEST_REPORT="logs/test-report-$(date +%Y%m%d_%H%M%S).html"
TEMP_DIR="/tmp/n8n-test"
TEST_TIMEOUT=30

# 测试统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查测试依赖..."
    
    local deps=("node" "npm" "python3" "pip" "docker" "docker-compose")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "缺少必要工具: $dep"
            exit 1
        fi
    done
    
    log_success "依赖检查完成"
}

# 设置测试环境
setup_test_environment() {
    log_info "设置测试环境..."
    
    # 创建测试环境文件
    if [[ ! -f "$PROJECT_ROOT/.env.test" ]]; then
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env.test"
        
        # 设置测试专用配置
        cat >> "$PROJECT_ROOT/.env.test" << EOF

# 测试环境配置
NODE_ENV=test
N8N_ENCRYPTION_KEY=test_key_12345678901234567890abcd
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/test_db
REDIS_URL=redis://localhost:6379/0
N8N_PORT=5678
N8N_HOST=localhost
EOF
    fi
    
    # 导出环境变量
    set -a
    source "$PROJECT_ROOT/.env.test"
    set +a
    
    log_success "测试环境设置完成"
}

# 启动测试服务
start_test_services() {
    log_info "启动测试服务..."
    
    # 停止可能存在的服务
    docker-compose -f docker-compose.test.yml down -v 2>/dev/null || true
    
    # 启动测试数据库和Redis
    cat > "$PROJECT_ROOT/docker-compose.test.yml" << EOF
version: '3.8'

services:
  postgres-test:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: test_db
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - "5433:5432"
    volumes:
      - postgres_test_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test_user -d test_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis-test:
    image: redis:7-alpine
    ports:
      - "6380:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_test_data:
EOF
    
    docker-compose -f docker-compose.test.yml up -d
    
    # 等待服务启动
    log_info "等待测试服务启动..."
    sleep 30
    
    # 验证服务状态
    if docker-compose -f docker-compose.test.yml ps | grep -q "Up"; then
        log_success "测试服务启动成功"
    else
        log_error "测试服务启动失败"
        exit 1
    fi
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 安装Node.js依赖
    npm ci
    
    # 安装Python依赖
    pip install -r requirements.txt
    pip install pytest pytest-cov pytest-asyncio pytest-mock
    
    log_success "依赖安装完成"
}

# 运行代码质量检查
run_linting() {
    log_info "运行代码质量检查..."
    
    local exit_code=0
    
    # JavaScript/TypeScript linting
    log_info "运行ESLint..."
    if npm run lint:js; then
        log_success "ESLint检查通过"
    else
        log_error "ESLint检查失败"
        exit_code=1
    fi
    
    # 代码格式检查
    log_info "运行Prettier检查..."
    if npm run format:check; then
        log_success "代码格式检查通过"
    else
        log_error "代码格式检查失败"
        exit_code=1
    fi
    
    # Python代码检查
    log_info "运行Python代码检查..."
    if python -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics; then
        log_success "Python代码检查通过"
    else
        log_error "Python代码检查失败"
        exit_code=1
    fi
    
    return $exit_code
}

# 运行单元测试
run_unit_tests() {
    log_info "运行单元测试..."
    
    local exit_code=0
    
    # JavaScript/TypeScript单元测试
    log_info "运行JavaScript单元测试..."
    if npm run test:unit -- --coverage; then
        log_success "JavaScript单元测试通过"
    else
        log_error "JavaScript单元测试失败"
        exit_code=1
    fi
    
    # Python单元测试
    log_info "运行Python单元测试..."
    if python -m pytest tests/unit/ --cov=src --cov-report=xml --cov-report=html -v; then
        log_success "Python单元测试通过"
    else
        log_error "Python单元测试失败"
        exit_code=1
    fi
    
    return $exit_code
}

# 运行集成测试
run_integration_tests() {
    log_info "运行集成测试..."
    
    # 更新数据库连接配置
    export DATABASE_URL="postgresql://test_user:test_password@localhost:5433/test_db"
    export REDIS_URL="redis://localhost:6380/0"
    
    local exit_code=0
    
    # 运行数据库迁移
    log_info "运行数据库迁移..."
    if npm run db:migrate; then
        log_success "数据库迁移完成"
    else
        log_error "数据库迁移失败"
        return 1
    fi
    
    # JavaScript集成测试
    log_info "运行JavaScript集成测试..."
    if npm run test:integration; then
        log_success "JavaScript集成测试通过"
    else
        log_error "JavaScript集成测试失败"
        exit_code=1
    fi
    
    # Python集成测试
    log_info "运行Python集成测试..."
    if python -m pytest tests/integration/ -v; then
        log_success "Python集成测试通过"
    else
        log_error "Python集成测试失败"
        exit_code=1
    fi
    
    return $exit_code
}

# 运行API测试
run_api_tests() {
    log_info "运行API测试..."
    
    # 启动应用服务器
    log_info "启动测试服务器..."
    npm run start:test &
    SERVER_PID=$!
    
    # 等待服务器启动
    sleep 30
    
    # 健康检查
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "http://localhost:5678/healthz" > /dev/null 2>&1; then
            log_success "测试服务器启动成功"
            break
        fi
        
        log_info "等待服务器启动... ($attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        log_error "测试服务器启动超时"
        kill $SERVER_PID 2>/dev/null || true
        return 1
    fi
    
    # 运行API测试
    local exit_code=0
    if npm run test:api; then
        log_success "API测试通过"
    else
        log_error "API测试失败"
        exit_code=1
    fi
    
    # 清理
    kill $SERVER_PID 2>/dev/null || true
    
    return $exit_code
}

# 运行E2E测试
run_e2e_tests() {
    log_info "运行E2E测试..."
    
    # 启动完整的测试环境
    log_info "启动完整测试环境..."
    docker-compose --env-file .env.test up -d
    
    # 等待服务启动
    sleep 60
    
    # 健康检查
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "http://localhost:5678/healthz" > /dev/null 2>&1; then
            log_success "E2E测试环境启动成功"
            break
        fi
        
        log_info "等待E2E环境启动... ($attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        log_error "E2E测试环境启动超时"
        docker-compose down -v
        return 1
    fi
    
    # 安装Playwright
    if ! npx playwright --version > /dev/null 2>&1; then
        log_info "安装Playwright..."
        npx playwright install --with-deps
    fi
    
    # 运行E2E测试
    local exit_code=0
    if npm run test:e2e; then
        log_success "E2E测试通过"
    else
        log_error "E2E测试失败"
        exit_code=1
    fi
    
    # 清理
    docker-compose down -v
    
    return $exit_code
}

# 运行性能测试
run_performance_tests() {
    log_info "运行性能测试..."
    
    # 启动性能测试环境
    docker-compose --env-file .env.test up -d
    sleep 60
    
    # 安装k6
    if ! command -v k6 &> /dev/null; then
        log_info "安装k6性能测试工具..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install k6
        else
            # Linux安装
            sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
            echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
            sudo apt-get update
            sudo apt-get install k6
        fi
    fi
    
    # 创建性能测试脚本
    cat > "$PROJECT_ROOT/tests/performance/load-test.js" << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 }, // 预热
    { duration: '5m', target: 50 }, // 负载测试
    { duration: '2m', target: 100 }, // 峰值测试
    { duration: '5m', target: 0 }, // 冷却
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%的请求响应时间小于500ms
    http_req_failed: ['rate<0.1'], // 错误率小于10%
  },
};

export default function () {
  // 健康检查
  let response = http.get('http://localhost:5678/healthz');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
EOF
    
    # 运行性能测试
    local exit_code=0
    if k6 run tests/performance/load-test.js; then
        log_success "性能测试通过"
    else
        log_error "性能测试失败"
        exit_code=1
    fi
    
    # 清理
    docker-compose down -v
    
    return $exit_code
}

# 生成测试报告
generate_test_report() {
    log_info "生成测试报告..."
    
    local report_dir="$PROJECT_ROOT/test-reports"
    mkdir -p "$report_dir"
    
    # 合并覆盖率报告
    if command -v nyc &> /dev/null; then
        nyc merge coverage/ "$report_dir/coverage.json"
        nyc report --reporter=html --report-dir="$report_dir/coverage-html"
    fi
    
    # 生成测试摘要
    cat > "$report_dir/test-summary.md" << EOF
# 测试报告摘要

## 测试执行时间
- 开始时间: $(date -Iseconds)
- 测试环境: $ENVIRONMENT
- 测试类型: $TEST_TYPE

## 测试结果
- 代码质量检查: $([ -f "$report_dir/lint-results.txt" ] && echo "✅ 通过" || echo "❌ 失败")
- 单元测试: $([ -f "$report_dir/unit-test-results.xml" ] && echo "✅ 通过" || echo "❌ 失败")
- 集成测试: $([ -f "$report_dir/integration-test-results.xml" ] && echo "✅ 通过" || echo "❌ 失败")
- E2E测试: $([ -f "$report_dir/e2e-test-results.xml" ] && echo "✅ 通过" || echo "❌ 失败")

## 覆盖率报告
- HTML报告: [coverage-html/index.html](./coverage-html/index.html)

EOF
    
    log_success "测试报告生成完成: $report_dir"
}

# 清理测试环境
cleanup_test_environment() {
    log_info "清理测试环境..."
    
    # 停止测试服务
    docker-compose -f docker-compose.test.yml down -v 2>/dev/null || true
    docker-compose down -v 2>/dev/null || true
    
    # 清理测试文件
    rm -f "$PROJECT_ROOT/docker-compose.test.yml"
    
    log_success "测试环境清理完成"
}

# 主测试流程
main() {
    log_info "开始运行测试: $TEST_TYPE"
    
    # 设置错误处理
    trap 'log_error "测试执行失败"; cleanup_test_environment; exit 1' ERR
    
    local exit_code=0
    
    # 基础设置
    check_dependencies
    setup_test_environment
    install_dependencies
    
    case "$TEST_TYPE" in
        "lint"|"linting")
            run_linting || exit_code=1
            ;;
        "unit")
            start_test_services
            run_unit_tests || exit_code=1
            ;;
        "integration")
            start_test_services
            run_integration_tests || exit_code=1
            ;;
        "api")
            start_test_services
            run_api_tests || exit_code=1
            ;;
        "e2e")
            run_e2e_tests || exit_code=1
            ;;
        "performance")
            run_performance_tests || exit_code=1
            ;;
        "all")
            run_linting || exit_code=1
            start_test_services
            run_unit_tests || exit_code=1
            run_integration_tests || exit_code=1
            run_api_tests || exit_code=1
            run_e2e_tests || exit_code=1
            ;;
        *)
            log_error "不支持的测试类型: $TEST_TYPE"
            log_error "支持的类型: lint, unit, integration, api, e2e, performance, all"
            exit 1
            ;;
    esac
    
    # 生成报告
    generate_test_report
    
    # 清理
    cleanup_test_environment
    
    if [[ $exit_code -eq 0 ]]; then
        log_success "所有测试执行完成!"
    else
        log_error "部分测试失败"
    fi
    
    exit $exit_code
}

# 显示帮助信息
show_help() {
    cat << EOF
N8N 自动化平台测试脚本

用法:
    $0 [测试类型] [环境]

参数:
    测试类型    要运行的测试类型，默认: all
               可选值: lint, unit, integration, api, e2e, performance, all
    环境       测试环境，默认: test

示例:
    $0                    # 运行所有测试
    $0 unit              # 只运行单元测试
    $0 e2e test          # 运行E2E测试
    $0 performance       # 运行性能测试

测试类型说明:
    lint         代码质量检查 (ESLint, Prettier, flake8)
    unit         单元测试
    integration  集成测试
    api          API测试
    e2e          端到端测试
    performance  性能测试
    all          运行所有测试

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