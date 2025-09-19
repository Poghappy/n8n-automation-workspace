#!/bin/bash

# N8N企业级自动化工作流平台 - 项目初始化脚本
# 一键初始化整个项目环境

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
INIT_LOG="logs/init.log"
REQUIRED_DOCKER_VERSION="20.10.0"
REQUIRED_COMPOSE_VERSION="2.0.0"

# 日志函数
log_info() {
    local message="$1"
    echo -e "${BLUE}[INFO]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $message" >> "$INIT_LOG"
}

log_success() {
    local message="$1"
    echo -e "${GREEN}[SUCCESS]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $message" >> "$INIT_LOG"
}

log_warning() {
    local message="$1"
    echo -e "${YELLOW}[WARNING]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $message" >> "$INIT_LOG"
}

log_error() {
    local message="$1"
    echo -e "${RED}[ERROR]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $message" >> "$INIT_LOG"
}

log_header() {
    local message="$1"
    echo ""
    echo -e "${CYAN}=== $message ===${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [HEADER] $message" >> "$INIT_LOG"
}

# 显示欢迎信息
show_welcome() {
    clear
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                              ║"
    echo "║                    N8N企业级自动化工作流平台                                 ║"
    echo "║                         项目初始化向导                                       ║"
    echo "║                                                                              ║"
    echo "║                      版本: 1.0.0                                            ║"
    echo "║                      作者: 系统管理员                                        ║"
    echo "║                                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${BLUE}欢迎使用N8N企业级自动化工作流平台初始化向导！${NC}"
    echo ""
    echo "本向导将帮助您："
    echo "  ✓ 检查系统要求"
    echo "  ✓ 安装必要依赖"
    echo "  ✓ 创建项目结构"
    echo "  ✓ 配置环境变量"
    echo "  ✓ 初始化数据库"
    echo "  ✓ 启动服务"
    echo "  ✓ 验证安装"
    echo ""
    echo -e "${YELLOW}请确保您有管理员权限来安装必要的软件包。${NC}"
    echo ""
    read -p "按回车键继续，或按 Ctrl+C 退出..."
    echo ""
}

# 创建项目目录结构
create_project_structure() {
    log_header "创建项目目录结构"
    
    local directories=(
        "config"
        "config/n8n"
        "config/nginx"
        "config/postgres"
        "config/redis"
        "config/init-scripts"
        "data"
        "data/n8n"
        "data/postgres"
        "data/redis"
        "data/nginx"
        "logs"
        "logs/n8n"
        "logs/nginx"
        "logs/postgres"
        "logs/redis"
        "backups"
        "backups/daily"
        "backups/weekly"
        "backups/monthly"
        "scripts"
        "docs"
        "docs/api"
        "docs/deployment"
        "docs/troubleshooting"
        "ssl"
        "ssl/certs"
        "ssl/private"
        "monitoring"
        "monitoring/grafana"
        "monitoring/prometheus"
        "temp"
    )
    
    log_info "创建项目目录结构..."
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_info "创建目录: $dir"
        else
            log_info "目录已存在: $dir"
        fi
    done
    
    # 创建日志文件
    touch "$INIT_LOG"
    
    # 设置目录权限
    chmod 755 scripts/*.sh 2>/dev/null || true
    chmod 700 ssl/private 2>/dev/null || true
    
    log_success "项目目录结构创建完成"
}

# 检查系统要求
check_system_requirements() {
    log_header "检查系统要求"
    
    local os_type=$(uname -s)
    local arch=$(uname -m)
    
    log_info "操作系统: $os_type"
    log_info "架构: $arch"
    
    # 检查支持的操作系统
    case $os_type in
        "Linux")
            log_success "支持的操作系统: Linux"
            ;;
        "Darwin")
            log_success "支持的操作系统: macOS"
            ;;
        *)
            log_error "不支持的操作系统: $os_type"
            return 1
            ;;
    esac
    
    # 检查架构
    case $arch in
        "x86_64"|"amd64")
            log_success "支持的架构: x86_64"
            ;;
        "arm64"|"aarch64")
            log_success "支持的架构: ARM64"
            ;;
        *)
            log_warning "未测试的架构: $arch，可能存在兼容性问题"
            ;;
    esac
    
    # 检查内存
    local memory_gb
    if [[ "$os_type" == "Linux" ]]; then
        memory_gb=$(free -g | awk '/^Mem:/{print $2}')
    elif [[ "$os_type" == "Darwin" ]]; then
        memory_gb=$(( $(sysctl -n hw.memsize) / 1024 / 1024 / 1024 ))
    fi
    
    if [ "$memory_gb" -ge 4 ]; then
        log_success "内存检查通过: ${memory_gb}GB"
    else
        log_warning "内存不足: ${memory_gb}GB (推荐至少4GB)"
    fi
    
    # 检查磁盘空间
    local disk_space_gb=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    
    if [ "$disk_space_gb" -ge 10 ]; then
        log_success "磁盘空间检查通过: ${disk_space_gb}GB可用"
    else
        log_warning "磁盘空间不足: ${disk_space_gb}GB (推荐至少10GB)"
    fi
}

# 检查并安装Docker
check_and_install_docker() {
    log_header "检查Docker环境"
    
    # 检查Docker是否已安装
    if command -v docker &> /dev/null; then
        local docker_version=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
        log_info "Docker已安装，版本: $docker_version"
        
        # 检查版本是否满足要求
        if version_compare "$docker_version" "$REQUIRED_DOCKER_VERSION"; then
            log_success "Docker版本满足要求"
        else
            log_warning "Docker版本过低，推荐升级到 $REQUIRED_DOCKER_VERSION 或更高版本"
        fi
    else
        log_warning "Docker未安装，开始安装..."
        install_docker
    fi
    
    # 检查Docker服务状态
    if docker info &> /dev/null; then
        log_success "Docker服务运行正常"
    else
        log_error "Docker服务未运行，请启动Docker服务"
        return 1
    fi
    
    # 检查Docker Compose
    if command -v docker-compose &> /dev/null; then
        local compose_version=$(docker-compose --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
        log_info "Docker Compose已安装，版本: $compose_version"
        
        if version_compare "$compose_version" "$REQUIRED_COMPOSE_VERSION"; then
            log_success "Docker Compose版本满足要求"
        else
            log_warning "Docker Compose版本过低，推荐升级到 $REQUIRED_COMPOSE_VERSION 或更高版本"
        fi
    else
        log_warning "Docker Compose未安装，开始安装..."
        install_docker_compose
    fi
}

# 版本比较函数
version_compare() {
    local version1="$1"
    local version2="$2"
    
    if [ "$(printf '%s\n' "$version1" "$version2" | sort -V | head -n1)" = "$version2" ]; then
        return 0  # version1 >= version2
    else
        return 1  # version1 < version2
    fi
}

# 安装Docker
install_docker() {
    local os_type=$(uname -s)
    
    case $os_type in
        "Linux")
            install_docker_linux
            ;;
        "Darwin")
            install_docker_macos
            ;;
        *)
            log_error "不支持在 $os_type 上自动安装Docker"
            return 1
            ;;
    esac
}

# 在Linux上安装Docker
install_docker_linux() {
    log_info "在Linux上安装Docker..."
    
    # 检测Linux发行版
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        local distro=$ID
    else
        log_error "无法检测Linux发行版"
        return 1
    fi
    
    case $distro in
        "ubuntu"|"debian")
            # 更新包索引
            sudo apt-get update
            
            # 安装必要的包
            sudo apt-get install -y \
                apt-transport-https \
                ca-certificates \
                curl \
                gnupg \
                lsb-release
            
            # 添加Docker官方GPG密钥
            curl -fsSL https://download.docker.com/linux/$distro/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            
            # 设置稳定版仓库
            echo \
                "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$distro \
                $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            # 安装Docker Engine
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io
            ;;
        "centos"|"rhel"|"fedora")
            # 安装yum-utils
            sudo yum install -y yum-utils
            
            # 设置稳定版仓库
            sudo yum-config-manager \
                --add-repo \
                https://download.docker.com/linux/centos/docker-ce.repo
            
            # 安装Docker Engine
            sudo yum install -y docker-ce docker-ce-cli containerd.io
            ;;
        *)
            log_error "不支持的Linux发行版: $distro"
            return 1
            ;;
    esac
    
    # 启动Docker服务
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # 将当前用户添加到docker组
    sudo usermod -aG docker $USER
    
    log_success "Docker安装完成"
    log_warning "请重新登录以使docker组权限生效"
}

# 在macOS上安装Docker
install_docker_macos() {
    log_info "在macOS上安装Docker..."
    
    # 检查是否安装了Homebrew
    if command -v brew &> /dev/null; then
        log_info "使用Homebrew安装Docker Desktop..."
        brew install --cask docker
        log_success "Docker Desktop安装完成"
        log_info "请启动Docker Desktop应用程序"
    else
        log_warning "未检测到Homebrew，请手动安装Docker Desktop"
        log_info "下载地址: https://www.docker.com/products/docker-desktop"
        return 1
    fi
}

# 安装Docker Compose
install_docker_compose() {
    log_info "安装Docker Compose..."
    
    # 获取最新版本
    local latest_version=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -oP '"tag_name": "\K(.*)(?=")')
    
    if [ -z "$latest_version" ]; then
        log_error "无法获取Docker Compose最新版本"
        return 1
    fi
    
    log_info "下载Docker Compose $latest_version..."
    
    # 下载并安装
    sudo curl -L "https://github.com/docker/compose/releases/download/$latest_version/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # 设置执行权限
    sudo chmod +x /usr/local/bin/docker-compose
    
    log_success "Docker Compose安装完成"
}

# 检查其他依赖
check_other_dependencies() {
    log_header "检查其他依赖"
    
    local dependencies=("curl" "jq" "openssl" "git")
    local missing_deps=()
    
    for dep in "${dependencies[@]}"; do
        if command -v "$dep" &> /dev/null; then
            log_success "$dep 已安装"
        else
            log_warning "$dep 未安装"
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_info "安装缺失的依赖: ${missing_deps[*]}"
        install_dependencies "${missing_deps[@]}"
    fi
}

# 安装依赖
install_dependencies() {
    local deps=("$@")
    local os_type=$(uname -s)
    
    case $os_type in
        "Linux")
            if command -v apt-get &> /dev/null; then
                sudo apt-get update
                sudo apt-get install -y "${deps[@]}"
            elif command -v yum &> /dev/null; then
                sudo yum install -y "${deps[@]}"
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y "${deps[@]}"
            else
                log_error "无法确定包管理器，请手动安装: ${deps[*]}"
                return 1
            fi
            ;;
        "Darwin")
            if command -v brew &> /dev/null; then
                brew install "${deps[@]}"
            else
                log_error "请先安装Homebrew，然后手动安装: ${deps[*]}"
                return 1
            fi
            ;;
        *)
            log_error "不支持在 $os_type 上自动安装依赖"
            return 1
            ;;
    esac
    
    log_success "依赖安装完成"
}

# 生成环境配置
generate_environment_config() {
    log_header "生成环境配置"
    
    if [ -f ".env" ]; then
        log_warning "环境配置文件已存在，是否覆盖？(y/N)"
        read -r overwrite
        if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
            log_info "跳过环境配置生成"
            return 0
        fi
    fi
    
    log_info "生成环境配置文件..."
    
    # 生成随机密码和密钥
    local postgres_password=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    local redis_password=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    local n8n_encryption_key=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    local jwt_secret=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    
    # 获取本机IP地址
    local host_ip
    if command -v ip &> /dev/null; then
        host_ip=$(ip route get 1 | awk '{print $7; exit}')
    elif command -v ifconfig &> /dev/null; then
        host_ip=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
    else
        host_ip="localhost"
    fi
    
    # 创建环境配置文件
    cat > .env << EOF
# N8N企业级自动化工作流平台环境配置
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')

# =============================================================================
# 基础配置
# =============================================================================

# 项目信息
PROJECT_NAME=N8N企业级自动化工作流平台
PROJECT_VERSION=1.0.0
ENVIRONMENT=production

# 主机配置
HOST_IP=$host_ip
DOMAIN_NAME=n8n.local
TIMEZONE=Asia/Shanghai

# =============================================================================
# N8N配置
# =============================================================================

# N8N基础配置
N8N_HOST=$host_ip
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_LISTEN_ADDRESS=0.0.0.0
WEBHOOK_URL=http://$host_ip:5678/

# N8N加密和安全
N8N_ENCRYPTION_KEY=$n8n_encryption_key
N8N_JWT_SECRET=$jwt_secret
N8N_SECURE_COOKIE=false

# N8N功能配置
N8N_METRICS=true
N8N_DIAGNOSTICS_ENABLED=false
N8N_LOG_LEVEL=info
N8N_LOG_OUTPUT=console,file
N8N_LOG_FILE_COUNT_MAX=100
N8N_LOG_FILE_SIZE_MAX=16

# N8N执行配置
EXECUTIONS_PROCESS=main
EXECUTIONS_MODE=regular
EXECUTIONS_TIMEOUT=3600
EXECUTIONS_TIMEOUT_MAX=3600
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=168

# N8N工作流配置
WORKFLOWS_DEFAULT_NAME=My Workflow
N8N_DEFAULT_BINARY_DATA_MODE=filesystem
N8N_BINARY_DATA_TTL=24
N8N_BINARY_DATA_STORAGE_PATH=/home/node/.n8n/binaryData

# N8N用户界面
N8N_DISABLE_UI=false
N8N_PERSONALIZATION_ENABLED=true
N8N_VERSION_NOTIFICATIONS_ENABLED=true
N8N_TEMPLATES_ENABLED=true
N8N_ONBOARDING_FLOW_DISABLED=false
N8N_HIRING_BANNER_ENABLED=false

# N8N编辑器配置
N8N_EDITOR_BASE_URL=
VUE_APP_URL_BASE_API=http://$host_ip:5678/

# =============================================================================
# 数据库配置 (PostgreSQL)
# =============================================================================

# PostgreSQL连接配置
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=$postgres_password
DB_POSTGRESDB_SCHEMA=public

# PostgreSQL高级配置
POSTGRES_DB=n8n
POSTGRES_USER=n8n_user
POSTGRES_PASSWORD=$postgres_password
POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=C --lc-ctype=C
POSTGRES_MAX_CONNECTIONS=100
POSTGRES_SHARED_BUFFERS=256MB
POSTGRES_EFFECTIVE_CACHE_SIZE=1GB

# =============================================================================
# Redis配置
# =============================================================================

# Redis连接配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$redis_password
REDIS_DB=0

# Redis高级配置
REDIS_MAX_MEMORY=512mb
REDIS_MAX_MEMORY_POLICY=allkeys-lru
REDIS_SAVE_INTERVAL=900 1

# =============================================================================
# Nginx配置
# =============================================================================

# Nginx基础配置
NGINX_HOST=$host_ip
NGINX_PORT=80
NGINX_SSL_PORT=443
NGINX_CLIENT_MAX_BODY_SIZE=50M
NGINX_PROXY_TIMEOUT=300s

# SSL配置
SSL_ENABLED=false
SSL_CERT_PATH=./ssl/certs/n8n.crt
SSL_KEY_PATH=./ssl/private/n8n.key

# =============================================================================
# 监控配置
# =============================================================================

# Prometheus配置
PROMETHEUS_ENABLED=false
PROMETHEUS_PORT=9090
PROMETHEUS_RETENTION_TIME=15d

# Grafana配置
GRAFANA_ENABLED=false
GRAFANA_PORT=3000
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin123

# =============================================================================
# 备份配置
# =============================================================================

# 备份设置
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_COMPRESSION=true
BACKUP_ENCRYPTION=false

# 备份存储
BACKUP_LOCAL_PATH=./backups
BACKUP_S3_ENABLED=false
BACKUP_S3_BUCKET=
BACKUP_S3_REGION=
BACKUP_S3_ACCESS_KEY=
BACKUP_S3_SECRET_KEY=

# =============================================================================
# 邮件配置
# =============================================================================

# SMTP配置
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=N8N Platform

# =============================================================================
# 安全配置
# =============================================================================

# 安全设置
SECURITY_AUDIT_ENABLED=true
SECURITY_RATE_LIMIT_ENABLED=true
SECURITY_RATE_LIMIT_MAX=100
SECURITY_RATE_LIMIT_WINDOW=900

# CORS配置
CORS_ENABLED=true
CORS_ORIGIN=*
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_CREDENTIALS=true

# =============================================================================
# 开发配置
# =============================================================================

# 开发模式
NODE_ENV=production
DEBUG=false
DEVELOPMENT_MODE=false

# 日志配置
LOG_LEVEL=info
LOG_OUTPUT=file
LOG_FILE_PATH=./logs/n8n.log

# =============================================================================
# 扩展配置
# =============================================================================

# 自定义节点
N8N_CUSTOM_EXTENSIONS=
N8N_NODES_INCLUDE=
N8N_NODES_EXCLUDE=

# 外部钩子
N8N_EXTERNAL_HOOK_FILES=

# 社区节点
N8N_COMMUNITY_PACKAGES_ENABLED=true
EOF
    
    log_success "环境配置文件生成完成"
    log_info "配置文件位置: .env"
    log_info "PostgreSQL密码: $postgres_password"
    log_info "Redis密码: $redis_password"
    log_info "N8N加密密钥: $n8n_encryption_key"
}

# 创建Docker Compose配置
create_docker_compose_config() {
    log_header "创建Docker Compose配置"
    
    if [ -f "docker-compose.yml" ]; then
        log_warning "Docker Compose配置文件已存在，是否覆盖？(y/N)"
        read -r overwrite
        if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
            log_info "跳过Docker Compose配置创建"
            return 0
        fi
    fi
    
    log_info "创建Docker Compose配置文件..."
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # N8N主服务
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n_main
    restart: unless-stopped
    environment:
      - DB_TYPE=${DB_TYPE}
      - DB_POSTGRESDB_HOST=${DB_POSTGRESDB_HOST}
      - DB_POSTGRESDB_PORT=${DB_POSTGRESDB_PORT}
      - DB_POSTGRESDB_DATABASE=${DB_POSTGRESDB_DATABASE}
      - DB_POSTGRESDB_USER=${DB_POSTGRESDB_USER}
      - DB_POSTGRESDB_PASSWORD=${DB_POSTGRESDB_PASSWORD}
      - DB_POSTGRESDB_SCHEMA=${DB_POSTGRESDB_SCHEMA}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=${N8N_PORT}
      - N8N_PROTOCOL=${N8N_PROTOCOL}
      - N8N_LISTEN_ADDRESS=${N8N_LISTEN_ADDRESS}
      - WEBHOOK_URL=${WEBHOOK_URL}
      - GENERIC_TIMEZONE=${TIMEZONE}
      - N8N_LOG_LEVEL=${N8N_LOG_LEVEL}
      - N8N_LOG_OUTPUT=${N8N_LOG_OUTPUT}
      - N8N_METRICS=${N8N_METRICS}
      - N8N_DIAGNOSTICS_ENABLED=${N8N_DIAGNOSTICS_ENABLED}
      - EXECUTIONS_DATA_PRUNE=${EXECUTIONS_DATA_PRUNE}
      - EXECUTIONS_DATA_MAX_AGE=${EXECUTIONS_DATA_MAX_AGE}
      - EXECUTIONS_PROCESS=${EXECUTIONS_PROCESS}
      - EXECUTIONS_MODE=${EXECUTIONS_MODE}
      - EXECUTIONS_TIMEOUT=${EXECUTIONS_TIMEOUT}
      - EXECUTIONS_TIMEOUT_MAX=${EXECUTIONS_TIMEOUT_MAX}
      - EXECUTIONS_DATA_SAVE_ON_ERROR=${EXECUTIONS_DATA_SAVE_ON_ERROR}
      - EXECUTIONS_DATA_SAVE_ON_SUCCESS=${EXECUTIONS_DATA_SAVE_ON_SUCCESS}
      - EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=${EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS}
      - N8N_PERSONALIZATION_ENABLED=${N8N_PERSONALIZATION_ENABLED}
      - N8N_VERSION_NOTIFICATIONS_ENABLED=${N8N_VERSION_NOTIFICATIONS_ENABLED}
      - N8N_TEMPLATES_ENABLED=${N8N_TEMPLATES_ENABLED}
      - N8N_ONBOARDING_FLOW_DISABLED=${N8N_ONBOARDING_FLOW_DISABLED}
      - N8N_SECURE_COOKIE=${N8N_SECURE_COOKIE}
      - N8N_HIRING_BANNER_ENABLED=${N8N_HIRING_BANNER_ENABLED}
      - N8N_DISABLE_UI=${N8N_DISABLE_UI}
      - N8N_EDITOR_BASE_URL=${N8N_EDITOR_BASE_URL}
      - VUE_APP_URL_BASE_API=${VUE_APP_URL_BASE_API}
      - WORKFLOWS_DEFAULT_NAME=${WORKFLOWS_DEFAULT_NAME}
      - N8N_DEFAULT_BINARY_DATA_MODE=${N8N_DEFAULT_BINARY_DATA_MODE}
      - N8N_BINARY_DATA_TTL=${N8N_BINARY_DATA_TTL}
      - N8N_BINARY_DATA_STORAGE_PATH=${N8N_BINARY_DATA_STORAGE_PATH}
      - N8N_CUSTOM_EXTENSIONS=${N8N_CUSTOM_EXTENSIONS}
      - N8N_NODES_INCLUDE=${N8N_NODES_INCLUDE}
      - N8N_NODES_EXCLUDE=${N8N_NODES_EXCLUDE}
      - N8N_EXTERNAL_HOOK_FILES=${N8N_EXTERNAL_HOOK_FILES}
      - N8N_COMMUNITY_PACKAGES_ENABLED=${N8N_COMMUNITY_PACKAGES_ENABLED}
    ports:
      - "${N8N_PORT}:5678"
    volumes:
      - n8n_data:/home/node/.n8n
      - ./config/n8n:/etc/n8n:ro
      - ./logs/n8n:/var/log/n8n
      - ./data/n8n:/data
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:5678/healthz || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(`${DOMAIN_NAME}`)"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"

  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    container_name: n8n_postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_INITDB_ARGS=${POSTGRES_INITDB_ARGS}
      - POSTGRES_MAX_CONNECTIONS=${POSTGRES_MAX_CONNECTIONS}
      - POSTGRES_SHARED_BUFFERS=${POSTGRES_SHARED_BUFFERS}
      - POSTGRES_EFFECTIVE_CACHE_SIZE=${POSTGRES_EFFECTIVE_CACHE_SIZE}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config/postgres:/etc/postgresql:ro
      - ./config/init-scripts:/docker-entrypoint-initdb.d:ro
      - ./logs/postgres:/var/log/postgresql
      - ./data/postgres:/data
    ports:
      - "5432:5432"
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    command: >
      postgres
      -c max_connections=${POSTGRES_MAX_CONNECTIONS}
      -c shared_buffers=${POSTGRES_SHARED_BUFFERS}
      -c effective_cache_size=${POSTGRES_EFFECTIVE_CACHE_SIZE}
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100
      -c random_page_cost=1.1
      -c effective_io_concurrency=200
      -c work_mem=4MB
      -c min_wal_size=1GB
      -c max_wal_size=4GB

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: n8n_redis
    restart: unless-stopped
    command: >
      redis-server
      --appendonly yes
      --requirepass ${REDIS_PASSWORD}
      --maxmemory ${REDIS_MAX_MEMORY}
      --maxmemory-policy ${REDIS_MAX_MEMORY_POLICY}
      --save ${REDIS_SAVE_INTERVAL}
    volumes:
      - redis_data:/data
      - ./config/redis:/usr/local/etc/redis:ro
      - ./logs/redis:/var/log/redis
      - ./data/redis:/backup
    ports:
      - "6379:6379"
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: n8n_nginx
    restart: unless-stopped
    environment:
      - NGINX_HOST=${NGINX_HOST}
      - NGINX_PORT=${NGINX_PORT}
      - NGINX_SSL_PORT=${NGINX_SSL_PORT}
    ports:
      - "${NGINX_PORT}:80"
      - "${NGINX_SSL_PORT}:443"
    volumes:
      - ./config/nginx:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
      - ./data/nginx:/var/www/html
    depends_on:
      - n8n
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  n8n_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./data/n8n
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./data/postgres
  redis_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./data/redis

networks:
  n8n-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF
    
    log_success "Docker Compose配置文件创建完成"
}

# 创建Nginx配置
create_nginx_config() {
    log_header "创建Nginx配置"
    
    log_info "创建Nginx配置文件..."
    
    # 创建主配置文件
    cat > config/nginx/default.conf << 'EOF'
# N8N Nginx配置

# 上游服务器配置
upstream n8n_backend {
    server n8n:5678;
    keepalive 32;
}

# HTTP服务器配置
server {
    listen 80;
    server_name _;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # 客户端配置
    client_max_body_size 50M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # N8N主应用
    location / {
        proxy_pass http://n8n_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲配置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # WebSocket支持
    location /ws {
        proxy_pass http://n8n_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket特定配置
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
    
    # Webhook端点
    location /webhook {
        proxy_pass http://n8n_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 允许大文件上传
        client_max_body_size 100M;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://n8n_backend;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 日志配置
    access_log /var/log/nginx/n8n_access.log;
    error_log /var/log/nginx/n8n_error.log;
}
EOF
    
    log_success "Nginx配置文件创建完成"
}

# 创建数据库初始化脚本
create_database_init_scripts() {
    log_header "创建数据库初始化脚本"
    
    log_info "创建PostgreSQL初始化脚本..."
    
    # 创建数据库初始化脚本
    cat > config/init-scripts/01-init-database.sql << 'EOF'
-- N8N数据库初始化脚本

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- 设置时区
SET timezone = 'Asia/Shanghai';

-- 创建索引优化查询性能
-- 这些索引将在N8N首次启动时自动创建，这里仅作为参考

-- 优化配置
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- 重新加载配置
SELECT pg_reload_conf();
EOF
    
    # 创建用户权限脚本
    cat > config/init-scripts/02-setup-permissions.sql << 'EOF'
-- 设置用户权限

-- 确保n8n用户有足够的权限
GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO n8n_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO n8n_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO n8n_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO n8n_user;

-- 设置默认权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO n8n_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO n8n_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO n8n_user;
EOF
    
    log_success "数据库初始化脚本创建完成"
}

# 初始化服务
initialize_services() {
    log_header "初始化服务"
    
    log_info "拉取Docker镜像..."
    docker-compose pull
    
    log_info "创建并启动服务..."
    docker-compose up -d
    
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    local services=("postgres" "redis" "n8n")
    local all_healthy=true
    
    for service in "${services[@]}"; do
        log_info "检查 $service 服务状态..."
        
        local max_attempts=30
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if docker-compose ps "$service" | grep -q "Up"; then
                log_success "$service 服务启动成功"
                break
            else
                log_info "等待 $service 服务启动... ($attempt/$max_attempts)"
                sleep 10
                ((attempt++))
            fi
        done
        
        if [ $attempt -gt $max_attempts ]; then
            log_error "$service 服务启动失败"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        log_success "所有服务启动成功"
    else
        log_error "部分服务启动失败，请检查日志"
        return 1
    fi
}

# 验证安装
verify_installation() {
    log_header "验证安装"
    
    # 检查服务健康状态
    log_info "检查服务健康状态..."
    
    # 检查PostgreSQL
    if docker-compose exec -T postgres pg_isready -U n8n_user -d n8n &>/dev/null; then
        log_success "PostgreSQL连接正常"
    else
        log_error "PostgreSQL连接失败"
        return 1
    fi
    
    # 检查Redis
    if docker-compose exec -T redis redis-cli ping &>/dev/null; then
        log_success "Redis连接正常"
    else
        log_error "Redis连接失败"
        return 1
    fi
    
    # 检查N8N Web界面
    local n8n_url="http://localhost:5678"
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$n8n_url" &>/dev/null; then
            log_success "N8N Web界面访问正常"
            break
        else
            log_info "等待N8N Web界面就绪... ($attempt/$max_attempts)"
            sleep 10
            ((attempt++))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "N8N Web界面访问失败"
        return 1
    fi
    
    # 运行基础测试
    if [ -f "scripts/test.sh" ]; then
        log_info "运行基础测试..."
        bash scripts/test.sh quick
    fi
    
    log_success "安装验证完成"
}

# 显示安装完成信息
show_completion_info() {
    log_header "安装完成"
    
    echo ""
    echo -e "${GREEN}🎉 恭喜！N8N企业级自动化工作流平台安装完成！${NC}"
    echo ""
    echo -e "${CYAN}=== 访问信息 ===${NC}"
    echo -e "${BLUE}N8N Web界面:${NC} http://localhost:5678"
    echo -e "${BLUE}管理员界面:${NC} http://localhost:5678/admin"
    echo ""
    echo -e "${CYAN}=== 数据库连接 ===${NC}"
    echo -e "${BLUE}PostgreSQL:${NC} localhost:5432"
    echo -e "${BLUE}数据库名:${NC} n8n"
    echo -e "${BLUE}用户名:${NC} n8n_user"
    echo ""
    echo -e "${CYAN}=== Redis连接 ===${NC}"
    echo -e "${BLUE}Redis:${NC} localhost:6379"
    echo ""
    echo -e "${CYAN}=== 管理命令 ===${NC}"
    echo -e "${BLUE}启动服务:${NC} docker-compose up -d"
    echo -e "${BLUE}停止服务:${NC} docker-compose down"
    echo -e "${BLUE}查看日志:${NC} docker-compose logs -f"
    echo -e "${BLUE}服务状态:${NC} docker-compose ps"
    echo ""
    echo -e "${CYAN}=== 管理脚本 ===${NC}"
    echo -e "${BLUE}部署管理:${NC} bash scripts/deploy.sh"
    echo -e "${BLUE}备份恢复:${NC} bash scripts/backup.sh"
    echo -e "${BLUE}健康检查:${NC} bash scripts/health-check.sh"
    echo -e "${BLUE}性能监控:${NC} bash scripts/monitor.sh"
    echo -e "${BLUE}日志管理:${NC} bash scripts/logs.sh"
    echo -e "${BLUE}系统维护:${NC} bash scripts/maintenance.sh"
    echo -e "${BLUE}安全检查:${NC} bash scripts/security.sh"
    echo -e "${BLUE}故障排除:${NC} bash scripts/troubleshoot.sh"
    echo -e "${BLUE}开发环境:${NC} bash scripts/dev.sh"
    echo ""
    echo -e "${CYAN}=== 重要文件 ===${NC}"
    echo -e "${BLUE}环境配置:${NC} .env"
    echo -e "${BLUE}Docker配置:${NC} docker-compose.yml"
    echo -e "${BLUE}Nginx配置:${NC} config/nginx/default.conf"
    echo -e "${BLUE}初始化日志:${NC} $INIT_LOG"
    echo ""
    echo -e "${YELLOW}⚠️  重要提示：${NC}"
    echo "1. 请妥善保管 .env 文件中的密码和密钥"
    echo "2. 建议定期备份数据和配置文件"
    echo "3. 生产环境请修改默认密码和配置SSL"
    echo "4. 查看完整文档: docs/ 目录"
    echo ""
    echo -e "${GREEN}开始使用N8N自动化工作流平台吧！${NC}"
    echo ""
}

# 清理临时文件
cleanup() {
    log_info "清理临时文件..."
    rm -rf temp/*
}

# 错误处理
handle_error() {
    local exit_code=$?
    log_error "初始化过程中发生错误 (退出码: $exit_code)"
    log_info "请查看日志文件: $INIT_LOG"
    log_info "如需帮助，请查看故障排除文档: docs/troubleshooting/"
    cleanup
    exit $exit_code
}

# 设置错误处理
trap handle_error ERR

# 显示使用帮助
show_help() {
    echo "N8N企业级自动化工作流平台初始化脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --skip-welcome      跳过欢迎界面"
    echo "  --skip-deps         跳过依赖检查"
    echo "  --skip-docker       跳过Docker安装"
    echo "  --skip-config       跳过配置生成"
    echo "  --skip-init         跳过服务初始化"
    echo "  --skip-verify       跳过安装验证"
    echo "  --dev               创建开发环境"
    echo "  --quiet             静默模式"
    echo "  --debug             调试模式"
    echo "  -h, --help          显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                  # 完整初始化"
    echo "  $0 --dev            # 初始化开发环境"
    echo "  $0 --skip-docker    # 跳过Docker安装"
    echo "  $0 --quiet          # 静默模式初始化"
    echo ""
}

# 主函数
main() {
    # 解析命令行参数
    local skip_welcome=false
    local skip_deps=false
    local skip_docker=false
    local skip_config=false
    local skip_init=false
    local skip_verify=false
    local dev_mode=false
    local quiet_mode=false
    local debug_mode=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-welcome)
                skip_welcome=true
                shift
                ;;
            --skip-deps)
                skip_deps=true
                shift
                ;;
            --skip-docker)
                skip_docker=true
                shift
                ;;
            --skip-config)
                skip_config=true
                shift
                ;;
            --skip-init)
                skip_init=true
                shift
                ;;
            --skip-verify)
                skip_verify=true
                shift
                ;;
            --dev)
                dev_mode=true
                shift
                ;;
            --quiet)
                quiet_mode=true
                shift
                ;;
            --debug)
                debug_mode=true
                shift
                ;;
            -h|--help)
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
    
    # 设置调试模式
    if [ "$debug_mode" = true ]; then
        set -x
    fi
    
    # 创建项目目录结构
    create_project_structure
    
    # 显示欢迎信息
    if [ "$skip_welcome" = false ] && [ "$quiet_mode" = false ]; then
        show_welcome
    fi
    
    # 检查系统要求
    check_system_requirements
    
    # 检查并安装Docker
    if [ "$skip_docker" = false ]; then
        check_and_install_docker
    fi
    
    # 检查其他依赖
    if [ "$skip_deps" = false ]; then
        check_other_dependencies
    fi
    
    # 生成配置文件
    if [ "$skip_config" = false ]; then
        generate_environment_config
        create_docker_compose_config
        create_nginx_config
        create_database_init_scripts
    fi
    
    # 初始化服务
    if [ "$skip_init" = false ]; then
        initialize_services
    fi
    
    # 验证安装
    if [ "$skip_verify" = false ]; then
        verify_installation
    fi
    
    # 清理临时文件
    cleanup
    
    # 显示完成信息
    if [ "$quiet_mode" = false ]; then
        show_completion_info
    fi
    
    log_success "N8N企业级自动化工作流平台初始化完成！"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi