#!/bin/bash

# N8N 自动化平台部署脚本
# 支持多环境部署和自动化配置

set -euo pipefail

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${PROJECT_ROOT}/logs/deploy.log"
CONFIG_FILE="${PROJECT_ROOT}/.env"

# 部署配置
ENVIRONMENT="${ENVIRONMENT:-development}"
DEPLOY_MODE="${DEPLOY_MODE:-docker}"  # docker, kubernetes, standalone
BACKUP_BEFORE_DEPLOY="${BACKUP_BEFORE_DEPLOY:-true}"
RUN_TESTS_BEFORE_DEPLOY="${RUN_TESTS_BEFORE_DEPLOY:-true}"
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-300}"
ROLLBACK_ON_FAILURE="${ROLLBACK_ON_FAILURE:-true}"

# Docker配置
DOCKER_IMAGE="${DOCKER_IMAGE:-n8nio/n8n:latest}"
DOCKER_CONTAINER_NAME="${DOCKER_CONTAINER_NAME:-n8n-automation}"
DOCKER_NETWORK="${DOCKER_NETWORK:-n8n-network}"

# Kubernetes配置
K8S_NAMESPACE="${K8S_NAMESPACE:-n8n}"
K8S_DEPLOYMENT_NAME="${K8S_DEPLOYMENT_NAME:-n8n-deployment}"
K8S_SERVICE_NAME="${K8S_SERVICE_NAME:-n8n-service}"

# 服务配置
N8N_HOST="${N8N_HOST:-localhost}"
N8N_PORT="${N8N_PORT:-5678}"
N8N_PROTOCOL="${N8N_PROTOCOL:-http}"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 部署状态跟踪
DEPLOYMENT_ID="deploy-$(date +%Y%m%d-%H%M%S)"
DEPLOYMENT_START_TIME=$(date +%s)
PREVIOUS_VERSION=""
CURRENT_VERSION=""

# 日志函数
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # 创建日志目录
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # 写入日志文件
    echo "[$timestamp] [$level] [$DEPLOYMENT_ID] $message" >> "$LOG_FILE"
    
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
    local env_file="${PROJECT_ROOT}/.env.${ENVIRONMENT}"
    
    # 优先加载环境特定配置
    if [ -f "$env_file" ]; then
        log "INFO" "加载环境配置: $env_file"
        set -a
        source "$env_file"
        set +a
    elif [ -f "$CONFIG_FILE" ]; then
        log "INFO" "加载默认配置: $CONFIG_FILE"
        set -a
        source "$CONFIG_FILE"
        set +a
    else
        log "WARN" "未找到环境配置文件"
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

# 检查部署前置条件
check_prerequisites() {
    log "INFO" "检查部署前置条件..."
    
    # 检查必要的命令
    case $DEPLOY_MODE in
        "docker")
            if ! check_command "docker"; then
                log "ERROR" "Docker未安装或不可用"
                return 1
            fi
            
            if ! check_command "docker-compose"; then
                log "WARN" "docker-compose未安装，将使用docker命令"
            fi
            ;;
        "kubernetes")
            if ! check_command "kubectl"; then
                log "ERROR" "kubectl未安装或不可用"
                return 1
            fi
            
            if ! check_command "helm"; then
                log "WARN" "helm未安装，将使用kubectl部署"
            fi
            ;;
        "standalone")
            if ! check_command "node"; then
                log "ERROR" "Node.js未安装或不可用"
                return 1
            fi
            
            if ! check_command "npm"; then
                log "ERROR" "npm未安装或不可用"
                return 1
            fi
            ;;
    esac
    
    # 检查网络连接
    if ! ping -c 1 google.com &>/dev/null; then
        log "WARN" "网络连接可能存在问题"
    fi
    
    # 检查磁盘空间
    local available_space
    available_space=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    local required_space=1048576  # 1GB in KB
    
    if [ "$available_space" -lt "$required_space" ]; then
        log "ERROR" "磁盘空间不足，需要至少1GB可用空间"
        return 1
    fi
    
    log "INFO" "✅ 前置条件检查通过"
    return 0
}
    
    log_success "依赖检查完成"
}

# 验证环境参数
validate_environment() {
    log_info "验证部署环境: $ENVIRONMENT"
    
    case "$ENVIRONMENT" in
        development|staging|production)
            log_success "环境验证通过: $ENVIRONMENT"
            ;;
        *)
            log_error "不支持的环境: $ENVIRONMENT"
            log_error "支持的环境: development, staging, production"
            exit 1
            ;;
    esac
}

# 设置环境变量
setup_environment() {
    log_info "设置环境变量..."
    
    local env_file="$PROJECT_ROOT/.env.$ENVIRONMENT"
    
    if [[ ! -f "$env_file" ]]; then
        log_warning "环境文件不存在: $env_file"
        log_info "从模板创建环境文件..."
        cp "$PROJECT_ROOT/.env.example" "$env_file"
        log_warning "请编辑 $env_file 并设置正确的配置值"
    fi
    
    # 导出环境变量
    set -a
    source "$env_file"
    set +a
    
    # 设置镜像标签
    export IMAGE_TAG="${VERSION}"
    export FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}:${VERSION}"
    
    log_success "环境变量设置完成"
}

# 健康检查
health_check() {
    local service_url="$1"
    local max_attempts="${2:-30}"
    local attempt=1
    
    log_info "等待服务启动: $service_url"
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "$service_url/healthz" > /dev/null 2>&1; then
            log_success "服务健康检查通过"
            return 0
        fi
        
        log_info "尝试 $attempt/$max_attempts - 等待服务启动..."
        sleep 10
        ((attempt++))
    done
    
    log_error "服务健康检查失败"
    return 1
}

# 备份数据库
backup_database() {
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_info "备份生产数据库..."
        
        local backup_dir="$PROJECT_ROOT/backups"
        local backup_file="$backup_dir/db_backup_$(date +%Y%m%d_%H%M%S).sql"
        
        mkdir -p "$backup_dir"
        
        docker-compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$backup_file"
        
        if [[ -f "$backup_file" && -s "$backup_file" ]]; then
            log_success "数据库备份完成: $backup_file"
        else
            log_error "数据库备份失败"
            exit 1
        fi
    fi
}

# 拉取最新镜像
pull_images() {
    log_info "拉取Docker镜像: $FULL_IMAGE_NAME"
    
    if docker pull "$FULL_IMAGE_NAME"; then
        log_success "镜像拉取成功"
    else
        log_error "镜像拉取失败"
        exit 1
    fi
}

# 部署服务
deploy_services() {
    log_info "部署服务到 $ENVIRONMENT 环境..."
    
    # 停止现有服务
    log_info "停止现有服务..."
    docker-compose down --remove-orphans
    
    # 启动新服务
    log_info "启动新服务..."
    docker-compose --env-file ".env.$ENVIRONMENT" up -d
    
    log_success "服务部署完成"
}

# 运行数据库迁移
run_migrations() {
    log_info "运行数据库迁移..."
    
    # 等待数据库启动
    sleep 30
    
    # 运行迁移
    if docker-compose exec -T n8n npm run db:migrate; then
        log_success "数据库迁移完成"
    else
        log_error "数据库迁移失败"
        return 1
    fi
}

# 冒烟测试
smoke_tests() {
    log_info "运行冒烟测试..."
    
    local base_url="http://localhost:5678"
    
    # 健康检查
    if ! health_check "$base_url"; then
        return 1
    fi
    
    # API测试
    log_info "测试API端点..."
    
    # 测试健康检查端点
    if curl -f -s "$base_url/healthz" | jq -e '.status == "ok"' > /dev/null; then
        log_success "健康检查端点正常"
    else
        log_error "健康检查端点异常"
        return 1
    fi
    
    # 测试版本信息端点
    if curl -f -s "$base_url/rest/version" > /dev/null; then
        log_success "版本信息端点正常"
    else
        log_error "版本信息端点异常"
        return 1
    fi
    
    log_success "冒烟测试通过"
}

# 回滚函数
rollback() {
    log_warning "开始回滚..."
    
    # 获取上一个版本
    local previous_version
    previous_version=$(docker images --format "table {{.Repository}}:{{.Tag}}" | grep "$IMAGE_NAME" | head -2 | tail -1 | cut -d: -f2)
    
    if [[ -n "$previous_version" && "$previous_version" != "$VERSION" ]]; then
        log_info "回滚到版本: $previous_version"
        export IMAGE_TAG="$previous_version"
        deploy_services
        
        if smoke_tests; then
            log_success "回滚成功"
        else
            log_error "回滚后测试失败"
        fi
    else
        log_error "无法找到可回滚的版本"
    fi
}

# 清理旧镜像
cleanup_old_images() {
    log_info "清理旧镜像..."
    
    # 保留最近5个版本
    docker images --format "table {{.Repository}}:{{.Tag}}" | \
        grep "$IMAGE_NAME" | \
        tail -n +6 | \
        awk '{print $1":"$2}' | \
        xargs -r docker rmi
    
    log_success "镜像清理完成"
}

# 获取版本信息
get_version_info() {
    log "INFO" "获取版本信息..."
    
    # 获取当前版本
    if [ -f "${PROJECT_ROOT}/package.json" ]; then
        CURRENT_VERSION=$(jq -r '.version' "${PROJECT_ROOT}/package.json")
    else
        CURRENT_VERSION="unknown"
    fi
    
    # 获取Git版本信息
    if git rev-parse --git-dir > /dev/null 2>&1; then
        local git_hash=$(git rev-parse --short HEAD)
        local git_branch=$(git rev-parse --abbrev-ref HEAD)
        CURRENT_VERSION="${CURRENT_VERSION}-${git_branch}-${git_hash}"
    fi
    
    log "INFO" "当前版本: $CURRENT_VERSION"
}

# 部署前备份
backup_before_deploy() {
    if [ "$BACKUP_BEFORE_DEPLOY" = "true" ]; then
        log "INFO" "执行部署前备份..."
        
        if [ -f "${SCRIPT_DIR}/backup.sh" ]; then
            bash "${SCRIPT_DIR}/backup.sh" "pre-deploy-${DEPLOYMENT_ID}"
            if [ $? -eq 0 ]; then
                log "INFO" "✅ 备份完成"
            else
                log "ERROR" "❌ 备份失败"
                return 1
            fi
        else
            log "WARN" "备份脚本不存在，跳过备份"
        fi
    fi
}

# 部署前测试
test_before_deploy() {
    if [ "$RUN_TESTS_BEFORE_DEPLOY" = "true" ]; then
        log "INFO" "执行部署前测试..."
        
        # 运行集成测试
        if [ -f "${SCRIPT_DIR}/integration-test.sh" ]; then
            bash "${SCRIPT_DIR}/integration-test.sh"
            if [ $? -ne 0 ]; then
                log "ERROR" "❌ 集成测试失败"
                return 1
            fi
        fi
        
        # 运行健康检查
        if [ -f "${SCRIPT_DIR}/health-check.sh" ]; then
            bash "${SCRIPT_DIR}/health-check.sh"
            if [ $? -ne 0 ]; then
                log "ERROR" "❌ 健康检查失败"
                return 1
            fi
        fi
        
        log "INFO" "✅ 部署前测试通过"
    fi
}

# Docker部署
deploy_docker() {
    log "INFO" "开始Docker部署..."
    
    # 停止现有容器
    if docker ps -q -f name="$DOCKER_CONTAINER_NAME" | grep -q .; then
        log "INFO" "停止现有容器: $DOCKER_CONTAINER_NAME"
        docker stop "$DOCKER_CONTAINER_NAME" || true
        docker rm "$DOCKER_CONTAINER_NAME" || true
    fi
    
    # 创建网络（如果不存在）
    if ! docker network ls | grep -q "$DOCKER_NETWORK"; then
        log "INFO" "创建Docker网络: $DOCKER_NETWORK"
        docker network create "$DOCKER_NETWORK"
    fi
    
    # 拉取最新镜像
    log "INFO" "拉取Docker镜像: $DOCKER_IMAGE"
    docker pull "$DOCKER_IMAGE"
    
    # 启动新容器
    log "INFO" "启动新容器..."
    docker run -d \
        --name "$DOCKER_CONTAINER_NAME" \
        --network "$DOCKER_NETWORK" \
        -p "${N8N_PORT}:5678" \
        -v "${PROJECT_ROOT}/data:/home/node/.n8n" \
        -v "${PROJECT_ROOT}/workflows:/home/node/workflows" \
        -e N8N_HOST="$N8N_HOST" \
        -e N8N_PORT="$N8N_PORT" \
        -e N8N_PROTOCOL="$N8N_PROTOCOL" \
        --env-file "${PROJECT_ROOT}/.env" \
        "$DOCKER_IMAGE"
    
    if [ $? -eq 0 ]; then
        log "INFO" "✅ Docker容器启动成功"
        return 0
    else
        log "ERROR" "❌ Docker容器启动失败"
        return 1
    fi
}

# Kubernetes部署
deploy_kubernetes() {
    log "INFO" "开始Kubernetes部署..."
    
    # 检查命名空间
    if ! kubectl get namespace "$K8S_NAMESPACE" &>/dev/null; then
        log "INFO" "创建命名空间: $K8S_NAMESPACE"
        kubectl create namespace "$K8S_NAMESPACE"
    fi
    
    # 应用配置文件
    local k8s_dir="${PROJECT_ROOT}/k8s"
    if [ -d "$k8s_dir" ]; then
        log "INFO" "应用Kubernetes配置..."
        kubectl apply -f "$k8s_dir" -n "$K8S_NAMESPACE"
    else
        log "ERROR" "Kubernetes配置目录不存在: $k8s_dir"
        return 1
    fi
    
    # 等待部署完成
    log "INFO" "等待部署完成..."
    kubectl rollout status deployment/"$K8S_DEPLOYMENT_NAME" -n "$K8S_NAMESPACE" --timeout=300s
    
    if [ $? -eq 0 ]; then
        log "INFO" "✅ Kubernetes部署成功"
        return 0
    else
        log "ERROR" "❌ Kubernetes部署失败"
        return 1
    fi
}

# 独立部署
deploy_standalone() {
    log "INFO" "开始独立部署..."
    
    # 安装依赖
    log "INFO" "安装Node.js依赖..."
    cd "$PROJECT_ROOT"
    npm ci --production
    
    # 构建应用
    if [ -f "package.json" ] && jq -e '.scripts.build' package.json > /dev/null; then
        log "INFO" "构建应用..."
        npm run build
    fi
    
    # 停止现有进程
    local pid_file="${PROJECT_ROOT}/n8n.pid"
    if [ -f "$pid_file" ]; then
        local old_pid=$(cat "$pid_file")
        if kill -0 "$old_pid" 2>/dev/null; then
            log "INFO" "停止现有进程: $old_pid"
            kill "$old_pid"
            sleep 5
        fi
        rm -f "$pid_file"
    fi
    
    # 启动新进程
    log "INFO" "启动N8N服务..."
    nohup npx n8n start > "${PROJECT_ROOT}/logs/n8n.log" 2>&1 &
    local new_pid=$!
    echo "$new_pid" > "$pid_file"
    
    # 验证进程启动
    sleep 5
    if kill -0 "$new_pid" 2>/dev/null; then
        log "INFO" "✅ N8N服务启动成功，PID: $new_pid"
        return 0
    else
        log "ERROR" "❌ N8N服务启动失败"
        return 1
    fi
}

# 等待服务健康检查
wait_for_health() {
    log "INFO" "等待服务健康检查..."
    
    local url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}/healthz"
    local timeout=$HEALTH_CHECK_TIMEOUT
    local interval=10
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            log "INFO" "✅ 服务健康检查通过"
            return 0
        fi
        
        log "INFO" "等待服务启动... ($elapsed/$timeout 秒)"
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    
    log "ERROR" "❌ 服务健康检查超时"
    return 1
}

# 部署后测试
test_after_deploy() {
    log "INFO" "执行部署后测试..."
    
    # 基础连接测试
    local url="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
    if curl -f -s "$url" > /dev/null; then
        log "INFO" "✅ 基础连接测试通过"
    else
        log "ERROR" "❌ 基础连接测试失败"
        return 1
    fi
    
    # 运行端到端测试
    if [ -f "${SCRIPT_DIR}/e2e-test.sh" ]; then
        bash "${SCRIPT_DIR}/e2e-test.sh"
        if [ $? -ne 0 ]; then
            log "ERROR" "❌ 端到端测试失败"
            return 1
        fi
    fi
    
    log "INFO" "✅ 部署后测试通过"
}

# 回滚部署
rollback_deployment() {
    log "WARN" "开始回滚部署..."
    
    case $DEPLOY_MODE in
        "docker")
            # Docker回滚
            if [ -n "$PREVIOUS_VERSION" ]; then
                log "INFO" "回滚到Docker镜像: $PREVIOUS_VERSION"
                docker stop "$DOCKER_CONTAINER_NAME" || true
                docker rm "$DOCKER_CONTAINER_NAME" || true
                docker run -d --name "$DOCKER_CONTAINER_NAME" "$PREVIOUS_VERSION"
            fi
            ;;
        "kubernetes")
            # Kubernetes回滚
            log "INFO" "回滚Kubernetes部署..."
            kubectl rollout undo deployment/"$K8S_DEPLOYMENT_NAME" -n "$K8S_NAMESPACE"
            ;;
        "standalone")
            # 独立部署回滚
            log "INFO" "回滚独立部署..."
            # 这里可以实现基于Git的回滚或备份恢复
            ;;
    esac
    
    # 等待回滚完成
    sleep 30
    
    # 验证回滚
    if wait_for_health; then
        log "INFO" "✅ 回滚成功"
        return 0
    else
        log "ERROR" "❌ 回滚失败"
        return 1
    fi
}

# 生成部署报告
generate_deployment_report() {
    local status=$1
    local end_time=$(date +%s)
    local duration=$((end_time - DEPLOYMENT_START_TIME))
    
    local report_file="${PROJECT_ROOT}/logs/deployment-report-${DEPLOYMENT_ID}.json"
    
    cat > "$report_file" << EOF
{
    "deployment_id": "$DEPLOYMENT_ID",
    "environment": "$ENVIRONMENT",
    "deploy_mode": "$DEPLOY_MODE",
    "status": "$status",
    "start_time": "$DEPLOYMENT_START_TIME",
    "end_time": "$end_time",
    "duration": "$duration",
    "previous_version": "$PREVIOUS_VERSION",
    "current_version": "$CURRENT_VERSION",
    "timestamp": "$(date -Iseconds)"
}
EOF
    
    log "INFO" "部署报告已生成: $report_file"
    
    # 显示部署摘要
    echo
    echo "========================================="
    echo "           部署摘要"
    echo "========================================="
    echo "部署ID: $DEPLOYMENT_ID"
    echo "环境: $ENVIRONMENT"
    echo "模式: $DEPLOY_MODE"
    echo "状态: $status"
    echo "版本: $CURRENT_VERSION"
    echo "耗时: ${duration}秒"
    echo "========================================="
}

# 发送通知
send_notification() {
    local status=$1
    local message="N8N部署 [$ENVIRONMENT] $status - 部署ID: $DEPLOYMENT_ID"
    
    # 这里可以集成各种通知方式
    # 例如：Slack、钉钉、邮件等
    
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
    
    if [ -n "${DINGTALK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-Type: application/json' \
            --data "{\"msgtype\":\"text\",\"text\":{\"content\":\"$message\"}}" \
            "$DINGTALK_WEBHOOK_URL" || true
    fi
    
    log "INFO" "通知已发送: $message"
}

# 主部署函数
main() {
    log "INFO" "开始N8N自动化平台部署..."
    log "INFO" "部署ID: $DEPLOYMENT_ID"
    log "INFO" "环境: $ENVIRONMENT"
    log "INFO" "模式: $DEPLOY_MODE"
    
    # 加载环境变量
    load_env
    
    # 检查前置条件
    if ! check_prerequisites; then
        log "ERROR" "前置条件检查失败"
        exit 1
    fi
    
    # 获取版本信息
    get_version_info
    
    # 部署前备份
    if ! backup_before_deploy; then
        log "ERROR" "部署前备份失败"
        exit 1
    fi
    
    # 部署前测试
    if ! test_before_deploy; then
        log "ERROR" "部署前测试失败"
        exit 1
    fi
    
    # 执行部署
    local deploy_success=false
    case $DEPLOY_MODE in
        "docker")
            if deploy_docker; then
                deploy_success=true
            fi
            ;;
        "kubernetes")
            if deploy_kubernetes; then
                deploy_success=true
            fi
            ;;
        "standalone")
            if deploy_standalone; then
                deploy_success=true
            fi
            ;;
        *)
            log "ERROR" "不支持的部署模式: $DEPLOY_MODE"
            exit 1
            ;;
    esac
    
    # 检查部署结果
    if [ "$deploy_success" = true ]; then
        # 等待服务健康检查
        if wait_for_health; then
            # 部署后测试
            if test_after_deploy; then
                log "INFO" "🎉 部署成功完成！"
                generate_deployment_report "SUCCESS"
                send_notification "成功"
                exit 0
            else
                log "ERROR" "部署后测试失败"
                if [ "$ROLLBACK_ON_FAILURE" = "true" ]; then
                    rollback_deployment
                fi
                generate_deployment_report "FAILED"
                send_notification "失败"
                exit 1
            fi
        else
            log "ERROR" "服务健康检查失败"
            if [ "$ROLLBACK_ON_FAILURE" = "true" ]; then
                rollback_deployment
            fi
            generate_deployment_report "FAILED"
            send_notification "失败"
            exit 1
        fi
    else
        log "ERROR" "部署失败"
        if [ "$ROLLBACK_ON_FAILURE" = "true" ]; then
            rollback_deployment
        fi
        generate_deployment_report "FAILED"
        send_notification "失败"
        exit 1
    fi
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi