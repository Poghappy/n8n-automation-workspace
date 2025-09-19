#!/bin/bash

# ========================================
# N8N 自动化系统一键部署脚本 - 学习版
# ========================================
#
# 脚本功能：
# 1. 自动检测系统环境和依赖
# 2. 安装和配置 Docker 及 Docker Compose
# 3. 部署完整的 N8N 自动化系统
# 4. 配置数据库、Redis、AI 智能体等组件
# 5. 提供系统健康检查和监控功能
#
# 适用场景：
# - 新服务器环境的快速部署
# - 开发环境的快速搭建
# - 生产环境的标准化部署
# - 系统迁移和恢复
#
# 使用方法：
# chmod +x deploy_n8n.sh
# ./deploy_n8n.sh [选项]
#
# 选项说明：
# --env [dev|staging|prod]  指定部署环境
# --backup-url [URL]        从备份恢复数据
# --config-archive [FILE]   使用配置归档文件
# --skip-checks            跳过系统检查
# --help                   显示帮助信息
#
# 学习要点：
# - Bash 脚本的最佳实践
# - 错误处理和日志记录
# - 系统环境检测方法
# - Docker 容器编排
# - 自动化部署流程设计
# ========================================

# ========================================
# 脚本安全设置
# ========================================
# set -e: 遇到错误立即退出
# set -u: 使用未定义变量时报错
# set -o pipefail: 管道命令中任何一个失败都会导致整个管道失败
set -euo pipefail

# ========================================
# 颜色定义 - 用于美化终端输出
# ========================================
# ANSI 颜色代码，用于在终端中显示彩色文本
RED='\033[0;31m'      # 红色 - 用于错误信息
GREEN='\033[0;32m'    # 绿色 - 用于成功信息
YELLOW='\033[1;33m'   # 黄色 - 用于警告信息
BLUE='\033[0;34m'     # 蓝色 - 用于一般信息
PURPLE='\033[0;35m'   # 紫色 - 用于步骤标题
CYAN='\033[0;36m'     # 青色 - 用于提示信息
NC='\033[0m'          # 无颜色 - 重置颜色

# ========================================
# 全局配置变量
# ========================================
# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 项目根目录（脚本目录的上级目录）
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 部署日志文件路径（使用时间戳确保唯一性）
DEPLOY_LOG="/tmp/n8n_deploy_$(date +%s).log"

# 备份恢复相关配置
BACKUP_RESTORE_URL=""     # 备份文件下载地址
CONFIG_ARCHIVE=""         # 配置归档文件路径

# ========================================
# 系统最低要求配置
# ========================================
# 这些配置定义了运行 N8N 系统的最低硬件和软件要求

# Docker 最低版本要求
MIN_DOCKER_VERSION="20.10.0"

# Docker Compose 最低版本要求
MIN_COMPOSE_VERSION="2.0.0"

# 最低内存要求（GB）
MIN_MEMORY_GB=4

# 最低磁盘空间要求（GB）
MIN_DISK_GB=20

# ========================================
# 日志记录函数
# ========================================
# 这些函数用于统一的日志输出格式，同时输出到终端和日志文件

# 信息日志 - 用于一般信息输出
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$DEPLOY_LOG"
}

# 成功日志 - 用于成功操作的确认
log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$DEPLOY_LOG"
}

# 警告日志 - 用于非致命性问题的提醒
log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$DEPLOY_LOG"
}

# 错误日志 - 用于错误信息输出
log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$DEPLOY_LOG"
}

# 步骤日志 - 用于标记主要部署步骤
log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1" | tee -a "$DEPLOY_LOG"
}

# 提示日志 - 用于用户交互提示
log_prompt() {
    echo -e "${CYAN}[PROMPT]${NC} $1" | tee -a "$DEPLOY_LOG"
}

# ========================================
# 错误处理函数
# ========================================

# 清理函数 - 在脚本退出时执行清理操作
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "部署过程中发生错误，退出码: $exit_code"
        log_info "详细日志请查看: $DEPLOY_LOG"
        
        # 如果部署失败，提供回滚选项
        if [ -f "$PROJECT_ROOT/docker-compose.yml" ]; then
            log_prompt "是否需要回滚到之前的状态? (y/n)"
            read -r rollback_choice
            if [[ $rollback_choice =~ ^[Yy]$ ]]; then
                rollback_deployment
            fi
        fi
    else
        log_success "部署完成！日志文件: $DEPLOY_LOG"
    fi
}

# 注册清理函数，在脚本退出时自动执行
trap cleanup EXIT

# 中断处理函数 - 处理 Ctrl+C 等中断信号
interrupt_handler() {
    log_warning "收到中断信号，正在安全退出..."
    cleanup
    exit 130
}

# 注册中断处理函数
trap interrupt_handler INT TERM

# ========================================
# 系统检测函数
# ========================================

# 检测操作系统类型和版本
detect_os() {
    log_step "检测操作系统..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux 系统检测
        if [ -f /etc/os-release ]; then
            # 读取系统信息
            . /etc/os-release
            OS_NAME="$NAME"
            OS_VERSION="$VERSION"
            log_info "检测到 Linux 系统: $OS_NAME $OS_VERSION"
            
            # 检测包管理器
            if command -v apt-get &> /dev/null; then
                PACKAGE_MANAGER="apt"
            elif command -v yum &> /dev/null; then
                PACKAGE_MANAGER="yum"
            elif command -v dnf &> /dev/null; then
                PACKAGE_MANAGER="dnf"
            else
                log_error "未检测到支持的包管理器"
                exit 1
            fi
        else
            log_error "无法检测 Linux 发行版信息"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS 系统检测
        OS_NAME="macOS"
        OS_VERSION=$(sw_vers -productVersion)
        PACKAGE_MANAGER="brew"
        log_info "检测到 macOS 系统: $OS_VERSION"
        
        # 检查是否安装了 Homebrew
        if ! command -v brew &> /dev/null; then
            log_warning "未检测到 Homebrew，将自动安装"
            install_homebrew
        fi
    else
        log_error "不支持的操作系统: $OSTYPE"
        exit 1
    fi
}

# 检查系统资源（内存、磁盘空间）
check_system_resources() {
    log_step "检查系统资源..."
    
    # 检查内存
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux 内存检查
        TOTAL_MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        TOTAL_MEMORY_GB=$((TOTAL_MEMORY_KB / 1024 / 1024))
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS 内存检查
        TOTAL_MEMORY_BYTES=$(sysctl -n hw.memsize)
        TOTAL_MEMORY_GB=$((TOTAL_MEMORY_BYTES / 1024 / 1024 / 1024))
    fi
    
    log_info "系统总内存: ${TOTAL_MEMORY_GB}GB"
    
    if [ "$TOTAL_MEMORY_GB" -lt "$MIN_MEMORY_GB" ]; then
        log_error "内存不足！需要至少 ${MIN_MEMORY_GB}GB，当前只有 ${TOTAL_MEMORY_GB}GB"
        exit 1
    fi
    
    # 检查磁盘空间
    AVAILABLE_DISK_GB=$(df -BG "$PROJECT_ROOT" | awk 'NR==2 {print $4}' | sed 's/G//')
    log_info "可用磁盘空间: ${AVAILABLE_DISK_GB}GB"
    
    if [ "$AVAILABLE_DISK_GB" -lt "$MIN_DISK_GB" ]; then
        log_error "磁盘空间不足！需要至少 ${MIN_DISK_GB}GB，当前只有 ${AVAILABLE_DISK_GB}GB"
        exit 1
    fi
    
    log_success "系统资源检查通过"
}

# 检查 Docker 安装和版本
check_docker() {
    log_step "检查 Docker 环境..."
    
    if ! command -v docker &> /dev/null; then
        log_warning "Docker 未安装，将自动安装"
        install_docker
    else
        # 检查 Docker 版本
        DOCKER_VERSION=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
        log_info "检测到 Docker 版本: $DOCKER_VERSION"
        
        # 版本比较函数
        version_compare() {
            printf '%s\n%s\n' "$1" "$2" | sort -V | head -n1
        }
        
        if [ "$(version_compare "$DOCKER_VERSION" "$MIN_DOCKER_VERSION")" != "$MIN_DOCKER_VERSION" ]; then
            log_error "Docker 版本过低！需要 $MIN_DOCKER_VERSION 或更高版本"
            exit 1
        fi
    fi
    
    # 检查 Docker 服务状态
    if ! docker info &> /dev/null; then
        log_warning "Docker 服务未运行，正在启动..."
        start_docker_service
    fi
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_warning "Docker Compose 未安装，将自动安装"
        install_docker_compose
    else
        # 检查 Docker Compose 版本
        if docker compose version &> /dev/null; then
            COMPOSE_VERSION=$(docker compose version --short)
        else
            COMPOSE_VERSION=$(docker-compose --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
        fi
        
        log_info "检测到 Docker Compose 版本: $COMPOSE_VERSION"
        
        if [ "$(version_compare "$COMPOSE_VERSION" "$MIN_COMPOSE_VERSION")" != "$MIN_COMPOSE_VERSION" ]; then
            log_error "Docker Compose 版本过低！需要 $MIN_COMPOSE_VERSION 或更高版本"
            exit 1
        fi
    fi
    
    log_success "Docker 环境检查通过"
}

# ========================================
# 安装函数
# ========================================

# 安装 Homebrew（仅限 macOS）
install_homebrew() {
    log_step "安装 Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    log_success "Homebrew 安装完成"
}

# 安装 Docker
install_docker() {
    log_step "安装 Docker..."
    
    case "$PACKAGE_MANAGER" in
        "apt")
            # Ubuntu/Debian 系统
            sudo apt-get update
            sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
            
            # 添加 Docker 官方 GPG 密钥
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            
            # 添加 Docker 仓库
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            # 安装 Docker
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io
            ;;
        "yum"|"dnf")
            # CentOS/RHEL/Fedora 系统
            sudo $PACKAGE_MANAGER install -y yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo $PACKAGE_MANAGER install -y docker-ce docker-ce-cli containerd.io
            ;;
        "brew")
            # macOS 系统
            brew install --cask docker
            ;;
        *)
            log_error "不支持的包管理器: $PACKAGE_MANAGER"
            exit 1
            ;;
    esac
    
    # 启动 Docker 服务
    start_docker_service
    
    # 将当前用户添加到 docker 组（Linux 系统）
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo usermod -aG docker "$USER"
        log_warning "已将用户添加到 docker 组，请重新登录或运行 'newgrp docker'"
    fi
    
    log_success "Docker 安装完成"
}

# 启动 Docker 服务
start_docker_service() {
    log_step "启动 Docker 服务..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux 系统
        sudo systemctl start docker
        sudo systemctl enable docker
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS 系统
        open -a Docker
        log_info "请等待 Docker Desktop 启动完成..."
        
        # 等待 Docker 服务启动
        local timeout=60
        local count=0
        while ! docker info &> /dev/null && [ $count -lt $timeout ]; do
            sleep 2
            count=$((count + 2))
            echo -n "."
        done
        echo
        
        if [ $count -ge $timeout ]; then
            log_error "Docker 服务启动超时"
            exit 1
        fi
    fi
    
    log_success "Docker 服务启动成功"
}

# 安装 Docker Compose
install_docker_compose() {
    log_step "安装 Docker Compose..."
    
    # 获取最新版本号
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux 系统
        sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS 系统（通常 Docker Desktop 已包含）
        if ! docker compose version &> /dev/null; then
            brew install docker-compose
        fi
    fi
    
    log_success "Docker Compose 安装完成"
}

# ========================================
# 配置生成函数
# ========================================

# 生成环境变量配置文件
generate_env_config() {
    log_step "生成环境变量配置..."
    
    local env_file="$PROJECT_ROOT/.env"
    
    # 如果配置文件已存在，备份
    if [ -f "$env_file" ]; then
        cp "$env_file" "${env_file}.backup.$(date +%s)"
        log_info "已备份现有配置文件"
    fi
    
    # 生成随机密钥的函数
    generate_key() {
        openssl rand -hex 32
    }
    
    generate_base64_key() {
        openssl rand -base64 32
    }
    
    # 创建新的环境变量文件
    cat > "$env_file" << EOF
# N8N 自动化系统环境变量配置
# 自动生成时间: $(date '+%Y-%m-%d %H:%M:%S')

# 基础配置
DOMAIN_NAME=localhost
SUBDOMAIN=n8n
N8N_PROTOCOL=http

# 认证配置
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=$(generate_base64_key)

# 加密密钥
N8N_ENCRYPTION_KEY=$(generate_key)
N8N_USER_MANAGEMENT_JWT_SECRET=$(generate_base64_key)

# 数据库配置
POSTGRES_PASSWORD=$(generate_base64_key)
POSTGRES_USER=n8n
POSTGRES_DB=n8n
POSTGRES_NON_ROOT_PASSWORD=$(generate_base64_key)

# Redis 配置
REDIS_PASSWORD=$(generate_base64_key)

# AI 配置（需要手动设置）
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7

# 日志配置
LOG_LEVEL=INFO
LOG_FILE_PATH=/var/log/n8n/app.log
EOF
    
    log_success "环境变量配置文件生成完成: $env_file"
    log_warning "请手动设置 OPENAI_API_KEY 等必要的配置项"
}

# ========================================
# 部署函数
# ========================================

# 主部署函数
deploy_n8n() {
    log_step "开始部署 N8N 系统..."
    
    # 切换到项目目录
    cd "$PROJECT_ROOT"
    
    # 创建必要的目录
    create_directories
    
    # 拉取最新镜像
    pull_docker_images
    
    # 启动服务
    start_services
    
    # 等待服务启动
    wait_for_services
    
    # 执行健康检查
    health_check
    
    log_success "N8N 系统部署完成！"
}

# 创建必要的目录
create_directories() {
    log_step "创建必要的目录结构..."
    
    local directories=(
        "n8n/workflows"
        "n8n/credentials"
        "postgres/data"
        "redis/data"
        "logs"
        "backups"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$PROJECT_ROOT/$dir"
        log_info "创建目录: $dir"
    done
    
    # 设置正确的权限
    chmod -R 755 "$PROJECT_ROOT/n8n"
    chmod -R 755 "$PROJECT_ROOT/logs"
    
    log_success "目录结构创建完成"
}

# 拉取 Docker 镜像
pull_docker_images() {
    log_step "拉取 Docker 镜像..."
    
    # 使用 docker-compose 拉取所有镜像
    if docker compose version &> /dev/null; then
        docker compose pull
    else
        docker-compose pull
    fi
    
    log_success "Docker 镜像拉取完成"
}

# 启动服务
start_services() {
    log_step "启动 N8N 服务..."
    
    # 使用 docker-compose 启动服务
    if docker compose version &> /dev/null; then
        docker compose up -d
    else
        docker-compose up -d
    fi
    
    log_success "服务启动命令执行完成"
}

# 等待服务启动
wait_for_services() {
    log_step "等待服务启动..."
    
    local services=("postgres" "redis" "n8n")
    local timeout=300  # 5分钟超时
    local count=0
    
    for service in "${services[@]}"; do
        log_info "等待 $service 服务启动..."
        
        while [ $count -lt $timeout ]; do
            if docker compose ps "$service" | grep -q "Up"; then
                log_success "$service 服务启动成功"
                break
            fi
            
            sleep 5
            count=$((count + 5))
            echo -n "."
        done
        
        if [ $count -ge $timeout ]; then
            log_error "$service 服务启动超时"
            exit 1
        fi
        
        count=0
    done
    
    log_success "所有服务启动完成"
}

# 健康检查
health_check() {
    log_step "执行系统健康检查..."
    
    # 检查 N8N Web 界面
    local n8n_url="http://localhost:5678"
    local max_attempts=30
    local attempt=0
    
    log_info "检查 N8N Web 界面可访问性..."
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$n8n_url" | grep -q "200\|401"; then
            log_success "N8N Web 界面可访问: $n8n_url"
            break
        fi
        
        sleep 10
        attempt=$((attempt + 1))
        echo -n "."
    done
    
    if [ $attempt -ge $max_attempts ]; then
        log_error "N8N Web 界面无法访问"
        exit 1
    fi
    
    # 检查数据库连接
    log_info "检查数据库连接..."
    if docker compose exec -T postgres pg_isready -U n8n; then
        log_success "数据库连接正常"
    else
        log_error "数据库连接失败"
        exit 1
    fi
    
    # 检查 Redis 连接
    log_info "检查 Redis 连接..."
    if docker compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log_success "Redis 连接正常"
    else
        log_error "Redis 连接失败"
        exit 1
    fi
    
    log_success "系统健康检查通过"
}

# ========================================
# 回滚函数
# ========================================

# 回滚部署
rollback_deployment() {
    log_step "开始回滚部署..."
    
    # 停止当前服务
    if docker compose version &> /dev/null; then
        docker compose down
    else
        docker-compose down
    fi
    
    # 恢复配置文件
    if [ -f "$PROJECT_ROOT/.env.backup."* ]; then
        local backup_file=$(ls -t "$PROJECT_ROOT/.env.backup."* | head -1)
        cp "$backup_file" "$PROJECT_ROOT/.env"
        log_info "已恢复配置文件: $backup_file"
    fi
    
    log_success "回滚完成"
}

# ========================================
# 帮助函数
# ========================================

# 显示帮助信息
show_help() {
    cat << EOF
N8N 自动化系统一键部署脚本

使用方法:
    $0 [选项]

选项:
    --env [dev|staging|prod]    指定部署环境 (默认: dev)
    --backup-url [URL]          从备份恢复数据
    --config-archive [FILE]     使用配置归档文件
    --skip-checks              跳过系统检查
    --help                     显示此帮助信息

示例:
    $0                         # 默认部署
    $0 --env prod              # 生产环境部署
    $0 --backup-url http://example.com/backup.tar.gz  # 从备份恢复

更多信息请参考项目文档。
EOF
}

# ========================================
# 主函数
# ========================================

main() {
    # 解析命令行参数
    local skip_checks=false
    local environment="dev"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env)
                environment="$2"
                shift 2
                ;;
            --backup-url)
                BACKUP_RESTORE_URL="$2"
                shift 2
                ;;
            --config-archive)
                CONFIG_ARCHIVE="$2"
                shift 2
                ;;
            --skip-checks)
                skip_checks=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 显示部署信息
    log_info "========================================="
    log_info "N8N 自动化系统一键部署脚本"
    log_info "部署环境: $environment"
    log_info "开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
    log_info "========================================="
    
    # 系统检查
    if [ "$skip_checks" = false ]; then
        detect_os
        check_system_resources
        check_docker
    else
        log_warning "跳过系统检查"
    fi
    
    # 生成配置
    generate_env_config
    
    # 执行部署
    deploy_n8n
    
    # 显示部署结果
    log_info "========================================="
    log_success "N8N 系统部署成功！"
    log_info "访问地址: http://localhost:5678"
    log_info "管理员账号请查看 .env 文件"
    log_info "部署日志: $DEPLOY_LOG"
    log_info "========================================="
}

# 执行主函数
main "$@"

# ========================================
# 脚本学习总结
# ========================================
#
# 本脚本展示了以下 Bash 脚本编程的最佳实践：
#
# 1. 脚本结构设计：
#    - 清晰的函数分离和模块化设计
#    - 统一的错误处理和日志记录
#    - 完善的参数解析和帮助系统
#
# 2. 安全编程实践：
#    - 使用 set -euo pipefail 确保脚本安全
#    - 信号处理和清理函数
#    - 权限检查和用户确认
#
# 3. 系统集成技巧：
#    - 跨平台兼容性处理
#    - 依赖检查和自动安装
#    - 服务健康检查和监控
#
# 4. 用户体验优化：
#    - 彩色输出和进度提示
#    - 详细的日志记录
#    - 友好的错误信息和帮助
#
# 5. 运维自动化：
#    - 配置文件自动生成
#    - 备份和回滚机制
#    - 环境检测和适配
#
# 学习建议：
# - 理解每个函数的作用和实现原理
# - 学习错误处理和日志记录的最佳实践
# - 掌握 Docker 和系统管理的基本命令
# - 了解自动化部署的完整流程
# ========================================