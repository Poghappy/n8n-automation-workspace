#!/bin/bash

# N8N企业级自动化工作流平台 - 快速设置脚本
# 提供简化的项目设置流程和完整的配置管理功能

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
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SETUP_LOG="logs/setup.log"
CONFIG_BACKUP_DIR="backups/config"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

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

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 命令未找到，请先安装"
        exit 1
    fi
}

# 检查文件是否存在
check_file() {
    if [ ! -f "$1" ]; then
        log_error "文件 $1 不存在"
        exit 1
    fi
}

# 检查目录是否存在
check_directory() {
    if [ ! -d "$1" ]; then
        log_error "目录 $1 不存在"
        exit 1
    fi
}

# 创建目录
create_directory() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        log_success "创建目录: $1"
    else
        log_info "目录已存在: $1"
    fi
}

# 检查系统要求
check_system_requirements() {
    log_info "检查系统要求..."
    
    # 检查操作系统
    if [[ "$OSTYPE" == "darwin"* ]]; then
        log_info "检测到 macOS 系统"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        log_info "检测到 Linux 系统"
    else
        log_warning "未知操作系统: $OSTYPE"
    fi
    
    # 检查必需的命令
    check_command "docker"
    check_command "docker-compose"
    check_command "git"
    check_command "curl"
    
    # 检查Docker是否运行
    if ! docker info &> /dev/null; then
        log_error "Docker 未运行，请启动 Docker"
        exit 1
    fi
    
    log_success "系统要求检查完成"
}

# 检查环境变量配置
check_environment_config() {
    log_info "检查环境变量配置..."
    
    # 检查.env文件
    check_file ".env"
    
    # 检查关键环境变量
    source .env
    
    local required_vars=(
        "N8N_HOST"
        "N8N_BASIC_AUTH_USER"
        "N8N_BASIC_AUTH_PASSWORD"
        "N8N_ENCRYPTION_KEY"
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
        "OPENAI_API_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "环境变量 $var 未设置"
            exit 1
        fi
    done
    
    log_success "环境变量配置检查完成"
}

# 生成加密密钥
generate_encryption_keys() {
    log_info "生成加密密钥..."
    
    # 生成N8N加密密钥
    if [ -z "${N8N_ENCRYPTION_KEY:-}" ] || [ "${N8N_ENCRYPTION_KEY}" = "your-32-character-encryption-key-here" ]; then
        NEW_ENCRYPTION_KEY=$(openssl rand -hex 32)
        sed -i.bak "s/N8N_ENCRYPTION_KEY=.*/N8N_ENCRYPTION_KEY=${NEW_ENCRYPTION_KEY}/" .env
        log_success "生成新的N8N加密密钥"
    fi
    
    # 生成JWT密钥
    if [ -z "${JWT_SECRET_KEY:-}" ] || [ "${JWT_SECRET_KEY}" = "your-jwt-secret-key-change-in-production" ]; then
        NEW_JWT_KEY=$(openssl rand -base64 64 | tr -d '\n')
        sed -i.bak "s/JWT_SECRET_KEY=.*/JWT_SECRET_KEY=${NEW_JWT_KEY}/" .env
        log_success "生成新的JWT密钥"
    fi
    
    # 清理备份文件
    rm -f .env.bak
}

# 创建必要的目录结构
create_directories() {
    log_info "创建目录结构..."
    
    local directories=(
        "data/n8n"
        "data/postgres"
        "data/redis"
        "logs/n8n"
        "logs/postgres"
        "logs/redis"
        "logs/ai-agent"
        "logs/huoniao-portal"
        "backups"
        "config/nginx"
        "config/ssl"
        "src/config"
        "src/logs"
        "src/uploads"
        "src/temp"
    )
    
    for dir in "${directories[@]}"; do
        create_directory "$dir"
    done
    
    log_success "目录结构创建完成"
}

# 设置文件权限
set_permissions() {
    log_info "设置文件权限..."
    
    # 设置数据目录权限
    chmod -R 755 data/
    chmod -R 755 logs/
    chmod -R 755 config/
    
    # 设置脚本执行权限
    chmod +x scripts/*.sh
    
    # 设置环境文件权限
    chmod 600 .env
    
    log_success "文件权限设置完成"
}

# 初始化数据库
initialize_database() {
    log_info "初始化数据库..."
    
    # 启动PostgreSQL服务
    docker-compose up -d postgres
    
    # 等待数据库启动
    log_info "等待数据库启动..."
    sleep 10
    
    # 检查数据库连接
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
            log_success "数据库连接成功"
            break
        fi
        
        log_info "等待数据库连接... (尝试 $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "数据库连接超时"
        exit 1
    fi
    
    # 执行初始化脚本
    local init_scripts=(
        "config/init-scripts/01-create-databases.sql"
        "config/init-scripts/02-setup-permissions.sql"
        "config/init-scripts/03-create-indexes.sql"
    )
    
    for script in "${init_scripts[@]}"; do
        if [ -f "$script" ]; then
            log_info "执行数据库脚本: $script"
            docker-compose exec -T postgres psql -U postgres -f "/docker-entrypoint-initdb.d/$(basename $script)"
        else
            log_warning "脚本文件不存在: $script"
        fi
    done
    
    log_success "数据库初始化完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 启动所有服务
    docker-compose up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 15
    
    # 检查服务状态
    local services=("n8n" "postgres" "redis" "ai-agent-system" "huoniao-portal")
    
    for service in "${services[@]}"; do
        if docker-compose ps $service | grep -q "Up"; then
            log_success "服务 $service 启动成功"
        else
            log_error "服务 $service 启动失败"
            docker-compose logs $service
        fi
    done
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."
    
    # 检查N8N服务
    local n8n_url="http://localhost:5678"
    if curl -s -o /dev/null -w "%{http_code}" "$n8n_url" | grep -q "200\|401"; then
        log_success "N8N服务可访问: $n8n_url"
    else
        log_error "N8N服务不可访问"
    fi
    
    # 检查AI智能体服务
    local ai_agent_url="http://localhost:8000/health"
    if curl -s -o /dev/null -w "%{http_code}" "$ai_agent_url" | grep -q "200"; then
        log_success "AI智能体服务可访问: $ai_agent_url"
    else
        log_warning "AI智能体服务不可访问"
    fi
    
    # 检查火鸟门户服务
    local huoniao_url="http://localhost:3000/health"
    if curl -s -o /dev/null -w "%{http_code}" "$huoniao_url" | grep -q "200"; then
        log_success "火鸟门户服务可访问: $huoniao_url"
    else
        log_warning "火鸟门户服务不可访问"
    fi
    
    log_success "部署验证完成"
}

# 显示部署信息
show_deployment_info() {
    log_info "部署信息:"
    echo ""
    echo "🚀 N8N企业级自动化工作流平台部署完成!"
    echo ""
    echo "📋 服务访问地址:"
    echo "   • N8N工作流编辑器: http://localhost:5678"
    echo "   • AI智能体API: http://localhost:8000"
    echo "   • 火鸟门户系统: http://localhost:3000"
    echo ""
    echo "🔐 默认登录信息:"
    echo "   • 用户名: ${N8N_BASIC_AUTH_USER:-admin}"
    echo "   • 密码: ${N8N_BASIC_AUTH_PASSWORD:-password}"
    echo ""
    echo "📚 文档地址:"
    echo "   • API文档: docs/api.md"
    echo "   • 用户手册: docs/user-guide.md"
    echo "   • 部署指南: docs/deployment.md"
    echo ""
    echo "🛠️ 常用命令:"
    echo "   • 查看服务状态: docker-compose ps"
    echo "   • 查看日志: docker-compose logs [service-name]"
    echo "   • 停止服务: docker-compose down"
    echo "   • 重启服务: docker-compose restart [service-name]"
    echo ""
}

# 清理函数
cleanup() {
    log_info "清理临时文件..."
    # 在这里添加清理逻辑
}

# 主函数
main() {
    log_info "开始N8N企业级自动化工作流平台初始化..."
    
    # 设置清理陷阱
    trap cleanup EXIT
    
    # 执行初始化步骤
    check_system_requirements
    check_environment_config
    generate_encryption_keys
    create_directories
    set_permissions
    initialize_database
    start_services
    verify_deployment
    show_deployment_info
    
    log_success "初始化完成!"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi