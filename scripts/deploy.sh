#!/bin/bash

# N8N 自动化平台部署脚本
# 作者: AI Assistant
# 版本: 1.0
# 描述: 一键部署 N8N 自动化平台及其完整的监控栈

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/logs/deploy.log"

# 日志函数
log_info() {
    local message="$1"
    echo -e "${BLUE}[INFO]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $message" >> "logs/deploy.log"
}

log_success() {
    local message="$1"
    echo -e "${GREEN}[SUCCESS]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [SUCCESS] $message" >> "logs/deploy.log"
}

log_warning() {
    local message="$1"
    echo -e "${YELLOW}[WARNING]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARNING] $message" >> "logs/deploy.log"
}

log_error() {
    local message="$1"
    echo -e "${RED}[ERROR]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $message" >> "logs/deploy.log"
}

log_header() {
    local message="$1"
    echo -e "${PURPLE}[HEADER]${NC} $message"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [HEADER] $message" >> "logs/deploy.log"
}

# 创建必要的目录
create_directories() {
    log_header "创建必要的目录结构"
    
    local directories=(
        "logs"
        "backups"
        "data/n8n"
        "data/postgres"
        "data/redis"
        "data/ai-agents"
        "data/huoniao"
        "config/nginx"
        "config/ssl"
        "tmp"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_info "创建目录: $dir"
        else
            log_info "目录已存在: $dir"
        fi
    done
    
    # 设置目录权限
    chmod 755 logs backups tmp
    chmod 700 data config
    
    log_success "目录结构创建完成"
}

# 检查系统要求
check_system_requirements() {
    log_header "检查系统要求"
    
    # 检查操作系统
    local os_type=$(uname -s)
    log_info "操作系统: $os_type"
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    local docker_version=$(docker --version | awk '{print $3}' | sed 's/,//')
    log_info "Docker版本: $docker_version"
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    local compose_version=$(docker-compose --version | awk '{print $3}' | sed 's/,//')
    log_info "Docker Compose版本: $compose_version"
    
    # 检查可用内存
    if command -v free &> /dev/null; then
        local available_memory=$(free -m | awk 'NR==2{printf "%.0f", $7}')
        if [ "$available_memory" -lt 2048 ]; then
            log_warning "可用内存不足2GB，可能影响性能"
        else
            log_info "可用内存: ${available_memory}MB"
        fi
    elif command -v vm_stat &> /dev/null; then
        # macOS系统
        local free_pages=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        local page_size=$(vm_stat | grep "page size" | awk '{print $8}')
        local available_memory=$((free_pages * page_size / 1024 / 1024))
        
        if [ "$available_memory" -lt 2048 ]; then
            log_warning "可用内存不足2GB，可能影响性能"
        else
            log_info "可用内存: ${available_memory}MB"
        fi
    fi
    
    # 检查磁盘空间
    local available_disk=$(df -h . | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "${available_disk%.*}" -lt 10 ]; then
        log_warning "可用磁盘空间不足10GB，可能影响运行"
    else
        log_info "可用磁盘空间: ${available_disk}GB"
    fi
    
    log_success "系统要求检查完成"
}

# 检查环境变量配置
check_environment_config() {
    log_header "检查环境变量配置"
    
    if [ ! -f ".env" ]; then
        log_error ".env文件不存在，请先创建环境配置文件"
        exit 1
    fi
    
    # 检查必需的环境变量
    local required_vars=(
        "N8N_ENCRYPTION_KEY"
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
        "OPENAI_API_KEY"
        "JWT_SECRET_KEY"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "缺少必需的环境变量:"
        for var in "${missing_vars[@]}"; do
            log_error "  - $var"
        done
        exit 1
    fi
    
    log_success "环境变量配置检查完成"
}

# 生成加密密钥
generate_encryption_keys() {
    log_header "生成加密密钥"
    
    # 检查是否已有N8N加密密钥
    if ! grep -q "^N8N_ENCRYPTION_KEY=" .env || grep -q "^N8N_ENCRYPTION_KEY=your-" .env; then
        log_info "生成N8N加密密钥..."
        local n8n_key=$(openssl rand -base64 32)
        sed -i.bak "s/^N8N_ENCRYPTION_KEY=.*/N8N_ENCRYPTION_KEY=$n8n_key/" .env
        log_success "N8N加密密钥已生成"
    fi
    
    # 检查是否已有JWT密钥
    if ! grep -q "^JWT_SECRET_KEY=" .env || grep -q "^JWT_SECRET_KEY=your-" .env; then
        log_info "生成JWT密钥..."
        local jwt_key=$(openssl rand -base64 64)
        sed -i.bak "s/^JWT_SECRET_KEY=.*/JWT_SECRET_KEY=$jwt_key/" .env
        log_success "JWT密钥已生成"
    fi
    
    # 检查是否已有数据库密码
    if ! grep -q "^POSTGRES_PASSWORD=" .env || grep -q "^POSTGRES_PASSWORD=your-" .env; then
        log_info "生成数据库密码..."
        local db_password=$(openssl rand -base64 24)
        sed -i.bak "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$db_password/" .env
        log_success "数据库密码已生成"
    fi
    
    # 检查是否已有Redis密码
    if ! grep -q "^REDIS_PASSWORD=" .env || grep -q "^REDIS_PASSWORD=your-" .env; then
        log_info "生成Redis密码..."
        local redis_password=$(openssl rand -base64 24)
        sed -i.bak "s/^REDIS_PASSWORD=.*/REDIS_PASSWORD=$redis_password/" .env
        log_success "Redis密码已生成"
    fi
    
    # 清理备份文件
    rm -f .env.bak
    
    log_success "加密密钥生成完成"
}

# 备份现有数据
backup_existing_data() {
    if [ "$BACKUP_BEFORE_DEPLOY" = false ]; then
        log_info "跳过备份（BACKUP_BEFORE_DEPLOY=false）"
        return 0
    fi
    
    log_header "备份现有数据"
    
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="backups/pre-deploy-$backup_timestamp"
    
    mkdir -p "$backup_dir"
    
    # 备份数据目录
    if [ -d "data" ]; then
        log_info "备份数据目录..."
        cp -r data "$backup_dir/"
        log_success "数据目录备份完成"
    fi
    
    # 备份配置文件
    if [ -f ".env" ]; then
        log_info "备份环境配置..."
        cp .env "$backup_dir/"
        log_success "环境配置备份完成"
    fi
    
    if [ -f "docker-compose.yml" ]; then
        log_info "备份Docker配置..."
        cp docker-compose.yml "$backup_dir/"
        log_success "Docker配置备份完成"
    fi
    
    # 备份数据库（如果服务正在运行）
    if docker-compose ps | grep -q "postgres.*Up"; then
        log_info "备份PostgreSQL数据库..."
        docker-compose exec postgres pg_dumpall -U postgres > "$backup_dir/postgres_backup.sql"
        log_success "PostgreSQL数据库备份完成"
    fi
    
    # 备份Redis数据（如果服务正在运行）
    if docker-compose ps | grep -q "redis.*Up"; then
        log_info "备份Redis数据..."
        docker-compose exec redis redis-cli --rdb "$backup_dir/redis_backup.rdb"
        log_success "Redis数据备份完成"
    fi
    
    log_success "数据备份完成: $backup_dir"
    echo "$backup_dir" > "logs/last_backup.txt"
}

# 拉取最新镜像
pull_latest_images() {
    log_header "拉取最新Docker镜像"
    
    # 拉取所有服务的镜像
    if docker-compose pull; then
        log_success "Docker镜像拉取完成"
    else
        log_error "Docker镜像拉取失败"
        exit 1
    fi
}

# 构建自定义镜像
build_custom_images() {
    log_header "构建自定义镜像"
    
    # 构建AI智能体镜像
    if [ -f "Dockerfile" ]; then
        log_info "构建AI智能体镜像..."
        if docker build -t ai-agent-system:latest .; then
            log_success "AI智能体镜像构建完成"
        else
            log_error "AI智能体镜像构建失败"
            exit 1
        fi
    fi
    
    # 构建火鸟门户镜像（如果存在）
    if [ -f "huoniao/Dockerfile" ]; then
        log_info "构建火鸟门户镜像..."
        if docker build -t huoniao-portal:latest huoniao/; then
            log_success "火鸟门户镜像构建完成"
        else
            log_error "火鸟门户镜像构建失败"
            exit 1
        fi
    fi
}

# 停止现有服务
stop_existing_services() {
    log_header "停止现有服务"
    
    if docker-compose ps | grep -q "Up"; then
        log_info "停止现有服务..."
        docker-compose down
        log_success "现有服务已停止"
    else
        log_info "没有运行中的服务"
    fi
}

# 启动服务
start_services() {
    log_header "启动服务"
    
    # 启动基础服务（数据库、缓存）
    log_info "启动基础服务..."
    docker-compose up -d postgres redis
    
    # 等待数据库启动
    log_info "等待PostgreSQL启动..."
    local wait_count=0
    while ! docker-compose exec postgres pg_isready -U postgres &> /dev/null; do
        sleep 2
        wait_count=$((wait_count + 1))
        if [ $wait_count -gt 30 ]; then
            log_error "PostgreSQL启动超时"
            exit 1
        fi
    done
    log_success "PostgreSQL已启动"
    
    # 等待Redis启动
    log_info "等待Redis启动..."
    wait_count=0
    while ! docker-compose exec redis redis-cli ping | grep -q "PONG"; do
        sleep 2
        wait_count=$((wait_count + 1))
        if [ $wait_count -gt 30 ]; then
            log_error "Redis启动超时"
            exit 1
        fi
    done
    log_success "Redis已启动"
    
    # 启动应用服务
    log_info "启动应用服务..."
    docker-compose up -d n8n ai-agent-system huoniao-portal
    
    log_success "所有服务启动完成"
}

# 初始化数据库
initialize_database() {
    log_header "初始化数据库"
    
    # 检查初始化脚本目录
    if [ -d "config/init-scripts" ]; then
        log_info "执行数据库初始化脚本..."
        
        # 按顺序执行初始化脚本
        for script in config/init-scripts/*.sql; do
            if [ -f "$script" ]; then
                log_info "执行脚本: $(basename "$script")"
                docker-compose exec postgres psql -U postgres -f "/docker-entrypoint-initdb.d/$(basename "$script")"
            fi
        done
        
        log_success "数据库初始化完成"
    else
        log_warning "未找到数据库初始化脚本目录"
    fi
}

# 健康检查
perform_health_check() {
    log_header "执行健康检查"
    
    local services=("n8n:5678" "ai-agent-system:8000" "huoniao-portal:3000")
    local all_healthy=true
    
    for service_info in "${services[@]}"; do
        IFS=':' read -r service_name port <<< "$service_info"
        
        log_info "检查服务: $service_name"
        
        local wait_count=0
        local service_healthy=false
        
        while [ $wait_count -lt $((HEALTH_CHECK_TIMEOUT / 5)) ]; do
            if timeout 5 nc -z localhost "$port" &> /dev/null; then
                # 进一步检查HTTP响应
                if command -v curl &> /dev/null; then
                    if curl -f -s "http://localhost:$port" &> /dev/null; then
                        service_healthy=true
                        break
                    fi
                else
                    service_healthy=true
                    break
                fi
            fi
            
            sleep 5
            wait_count=$((wait_count + 1))
        done
        
        if [ "$service_healthy" = true ]; then
            log_success "$service_name 健康检查通过"
        else
            log_error "$service_name 健康检查失败"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        log_success "所有服务健康检查通过"
        return 0
    else
        log_error "部分服务健康检查失败"
        return 1
    fi
}

# 回滚部署
rollback_deployment() {
    log_header "回滚部署"
    
    if [ ! -f "logs/last_backup.txt" ]; then
        log_error "未找到备份信息，无法回滚"
        return 1
    fi
    
    local backup_dir=$(cat "logs/last_backup.txt")
    
    if [ ! -d "$backup_dir" ]; then
        log_error "备份目录不存在: $backup_dir"
        return 1
    fi
    
    log_info "停止当前服务..."
    docker-compose down
    
    log_info "恢复数据..."
    if [ -d "$backup_dir/data" ]; then
        rm -rf data
        cp -r "$backup_dir/data" .
    fi
    
    log_info "恢复配置..."
    if [ -f "$backup_dir/.env" ]; then
        cp "$backup_dir/.env" .
    fi
    
    if [ -f "$backup_dir/docker-compose.yml" ]; then
        cp "$backup_dir/docker-compose.yml" .
    fi
    
    log_info "重新启动服务..."
    docker-compose up -d
    
    log_success "部署回滚完成"
}

# 生成部署报告
generate_deploy_report() {
    log_header "生成部署报告"
    
    local report_file="logs/deploy-report-$(date +%Y%m%d_%H%M%S).html"
    
    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>N8N部署报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }
        .success { border-left: 4px solid #28a745; }
        .info { border-left: 4px solid #007bff; }
        .warning { border-left: 4px solid #ffc107; }
        .error { border-left: 4px solid #dc3545; }
        .service-list { list-style: none; padding: 0; }
        .service-item { padding: 10px; margin: 5px 0; background: white; border-radius: 4px; border: 1px solid #dee2e6; }
        .timestamp { text-align: center; color: #6c757d; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>N8N企业级自动化工作流平台部署报告</h1>
        </div>
        
        <div class="section success">
            <h3>部署状态</h3>
            <p>部署成功完成</p>
        </div>
        
        <div class="section info">
            <h3>服务状态</h3>
            <ul class="service-list">
                <li class="service-item">N8N工作流引擎 - 运行中 (http://localhost:5678)</li>
                <li class="service-item">AI智能体系统 - 运行中 (http://localhost:8000)</li>
                <li class="service-item">火鸟门户 - 运行中 (http://localhost:3000)</li>
                <li class="service-item">PostgreSQL数据库 - 运行中</li>
                <li class="service-item">Redis缓存 - 运行中</li>
            </ul>
        </div>
        
        <div class="section info">
            <h3>访问信息</h3>
            <p><strong>N8N工作流编辑器:</strong> <a href="http://localhost:5678" target="_blank">http://localhost:5678</a></p>
            <p><strong>AI智能体API:</strong> <a href="http://localhost:8000/docs" target="_blank">http://localhost:8000/docs</a></p>
            <p><strong>火鸟门户:</strong> <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></p>
        </div>
        
        <div class="timestamp">
            部署完成时间: <span id="deploy-time">--</span>
        </div>
    </div>
    
    <script>
        document.getElementById('deploy-time').textContent = new Date().toLocaleString('zh-CN');
    </script>
</body>
</html>
EOF
    
    log_success "部署报告已生成: $report_file"
}

# 显示部署信息
show_deployment_info() {
    log_header "部署完成信息"
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    部署成功完成！                            ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${CYAN}服务访问地址:${NC}"
    echo -e "  ${BLUE}N8N工作流编辑器:${NC} http://localhost:5678"
    echo -e "  ${BLUE}AI智能体API:${NC}     http://localhost:8000"
    echo -e "  ${BLUE}API文档:${NC}         http://localhost:8000/docs"
    echo -e "  ${BLUE}火鸟门户:${NC}       http://localhost:3000"
    echo ""
    
    echo -e "${CYAN}管理命令:${NC}"
    echo -e "  ${BLUE}查看服务状态:${NC}   docker-compose ps"
    echo -e "  ${BLUE}查看日志:${NC}       docker-compose logs -f [服务名]"
    echo -e "  ${BLUE}停止服务:${NC}       docker-compose down"
    echo -e "  ${BLUE}重启服务:${NC}       docker-compose restart"
    echo -e "  ${BLUE}健康检查:${NC}       ./scripts/health-check.sh"
    echo -e "  ${BLUE}监控服务:${NC}       ./scripts/monitor.sh -r"
    echo ""
    
    echo -e "${YELLOW}注意事项:${NC}"
    echo -e "  - 首次访问N8N需要设置管理员账户"
    echo -e "  - 请妥善保管.env文件中的密钥信息"
    echo -e "  - 建议定期执行备份: ./scripts/backup.sh"
    echo -e "  - 生产环境请配置SSL证书和防火墙"
    echo ""
}

# 显示使用帮助
show_help() {
    echo "N8N企业级自动化工作流平台部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help           显示此帮助信息"
    echo "  -e, --env ENV        指定部署环境 (development|production)"
    echo "  --no-backup          跳过部署前备份"
    echo "  --no-health-check    跳过健康检查"
    echo "  --no-rollback        失败时不自动回滚"
    echo "  --pull-only          仅拉取镜像，不部署"
    echo "  --build-only         仅构建镜像，不部署"
    echo "  --rollback           回滚到上次备份"
    echo ""
    echo "示例:"
    echo "  $0                   # 完整部署"
    echo "  $0 -e development    # 开发环境部署"
    echo "  $0 --no-backup       # 跳过备份的部署"
    echo "  $0 --rollback        # 回滚部署"
    echo ""
}

# 主函数
main() {
    local pull_only=false
    local build_only=false
    local rollback_mode=false
    local no_health_check=false
    
    # 创建日志目录
    mkdir -p logs
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -e|--env)
                DEPLOY_ENV="$2"
                shift 2
                ;;
            --no-backup)
                BACKUP_BEFORE_DEPLOY=false
                shift
                ;;
            --no-health-check)
                no_health_check=true
                shift
                ;;
            --no-rollback)
                ROLLBACK_ON_FAILURE=false
                shift
                ;;
            --pull-only)
                pull_only=true
                shift
                ;;
            --build-only)
                build_only=true
                shift
                ;;
            --rollback)
                rollback_mode=true
                shift
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    log_header "开始部署 $PROJECT_NAME"
    log_info "部署环境: $DEPLOY_ENV"
    log_info "部署时间: $(date)"
    
    # 回滚模式
    if [ "$rollback_mode" = true ]; then
        rollback_deployment
        exit $?
    fi
    
    # 仅拉取镜像
    if [ "$pull_only" = true ]; then
        pull_latest_images
        exit 0
    fi
    
    # 仅构建镜像
    if [ "$build_only" = true ]; then
        build_custom_images
        exit 0
    fi
    
    # 完整部署流程
    create_directories
    check_system_requirements
    check_environment_config
    generate_encryption_keys
    backup_existing_data
    pull_latest_images
    build_custom_images
    stop_existing_services
    start_services
    initialize_database
    
    # 健康检查
    if [ "$no_health_check" = false ]; then
        if ! perform_health_check; then
            if [ "$ROLLBACK_ON_FAILURE" = true ]; then
                log_warning "健康检查失败，开始回滚..."
                rollback_deployment
                exit 1
            else
                log_error "健康检查失败，部署可能存在问题"
                exit 1
            fi
        fi
    fi
    
    generate_deploy_report
    show_deployment_info
    
    log_success "部署完成！"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

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