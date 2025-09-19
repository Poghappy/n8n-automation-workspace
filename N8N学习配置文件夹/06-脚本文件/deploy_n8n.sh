#!/bin/bash

# N8N自动化系统一键部署脚本
# 支持在新环境中快速部署完整的N8N自动化系统
# 作者: N8N自动化系统
# 版本: 1.0.0
# 创建时间: $(date '+%Y-%m-%d %H:%M:%S')

set -euo pipefail

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
DEPLOY_LOG="/tmp/n8n_deploy_$(date +%s).log"
BACKUP_RESTORE_URL=""
CONFIG_ARCHIVE=""

# 系统要求
MIN_DOCKER_VERSION="20.10.0"
MIN_COMPOSE_VERSION="2.0.0"
MIN_MEMORY_GB=4
MIN_DISK_GB=20

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_debug() {
    echo -e "${CYAN}[DEBUG]${NC} $1" | tee -a "$DEPLOY_LOG"
}

# 显示横幅
show_banner() {
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║               N8N自动化系统一键部署工具                        ║
║                                                              ║
║  🚀 快速部署 | 🔧 自动配置 | 📦 完整迁移 | 🛡️ 安全可靠        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
}

# 检查系统要求
check_system_requirements() {
    log_step "检查系统要求..."
    
    # 检查操作系统
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macOS"
        log_info "检测到操作系统: macOS"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="Linux"
        log_info "检测到操作系统: Linux"
    else
        log_error "不支持的操作系统: $OSTYPE"
        exit 1
    fi
    
    # 检查内存
    if [[ "$OS" == "macOS" ]]; then
        MEMORY_GB=$(( $(sysctl -n hw.memsize) / 1024 / 1024 / 1024 ))
    else
        MEMORY_GB=$(( $(grep MemTotal /proc/meminfo | awk '{print $2}') / 1024 / 1024 ))
    fi
    
    if [ "$MEMORY_GB" -lt "$MIN_MEMORY_GB" ]; then
        log_error "内存不足: ${MEMORY_GB}GB < ${MIN_MEMORY_GB}GB"
        exit 1
    fi
    log_success "内存检查通过: ${MEMORY_GB}GB"
    
    # 检查磁盘空间
    DISK_GB=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$DISK_GB" -lt "$MIN_DISK_GB" ]; then
        log_error "磁盘空间不足: ${DISK_GB}GB < ${MIN_DISK_GB}GB"
        exit 1
    fi
    log_success "磁盘空间检查通过: ${DISK_GB}GB"
    
    log_success "系统要求检查完成"
}

# 安装依赖
install_dependencies() {
    log_step "安装系统依赖..."
    
    if [[ "$OS" == "macOS" ]]; then
        install_macos_dependencies
    else
        install_linux_dependencies
    fi
    
    log_success "依赖安装完成"
}

# macOS依赖安装
install_macos_dependencies() {
    log_info "安装macOS依赖..."
    
    # 检查并安装Homebrew
    if ! command -v brew &> /dev/null; then
        log_info "安装Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # 安装Docker Desktop
    if ! command -v docker &> /dev/null; then
        log_info "安装Docker Desktop..."
        brew install --cask docker
        log_warning "请启动Docker Desktop应用程序，然后按回车继续..."
        read -r
    fi
    
    # 安装其他工具
    local tools=("jq" "curl" "git" "openssl")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_info "安装 $tool..."
            brew install "$tool"
        fi
    done
}

# Linux依赖安装
install_linux_dependencies() {
    log_info "安装Linux依赖..."
    
    # 检测Linux发行版
    if [ -f /etc/debian_version ]; then
        DISTRO="debian"
        PKG_MANAGER="apt-get"
    elif [ -f /etc/redhat-release ]; then
        DISTRO="redhat"
        PKG_MANAGER="yum"
    else
        log_error "不支持的Linux发行版"
        exit 1
    fi
    
    # 更新包管理器
    log_info "更新包管理器..."
    if [ "$DISTRO" == "debian" ]; then
        sudo apt-get update
    else
        sudo yum update -y
    fi
    
    # 安装Docker
    if ! command -v docker &> /dev/null; then
        log_info "安装Docker..."
        if [ "$DISTRO" == "debian" ]; then
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker "$USER"
        else
            sudo yum install -y docker
            sudo systemctl start docker
            sudo systemctl enable docker
            sudo usermod -aG docker "$USER"
        fi
    fi
    
    # 安装Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_info "安装Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # 安装其他工具
    local tools=("jq" "curl" "git" "openssl-dev")
    if [ "$DISTRO" == "debian" ]; then
        sudo apt-get install -y "${tools[@]}"
    else
        sudo yum install -y "${tools[@]}"
    fi
}

# 验证Docker安装
verify_docker() {
    log_step "验证Docker安装..."
    
    # 检查Docker版本
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装"
        exit 1
    fi
    
    DOCKER_VERSION=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    log_info "Docker版本: $DOCKER_VERSION"
    
    # 检查Docker Compose版本
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装"
        exit 1
    fi
    
    COMPOSE_VERSION=$(docker-compose --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    log_info "Docker Compose版本: $COMPOSE_VERSION"
    
    # 测试Docker运行
    if ! docker run --rm hello-world &> /dev/null; then
        log_error "Docker运行测试失败"
        exit 1
    fi
    
    log_success "Docker验证完成"
}

# 创建项目目录结构
create_project_structure() {
    log_step "创建项目目录结构..."
    
    local dirs=(
        "data/postgres"
        "data/redis"
        "data/n8n"
        "logs"
        "backups/full"
        "backups/incremental"
        "backups/logs"
        "scripts"
        "config/nginx"
        "config/ssl"
        "bridge"
        ".github/workflows"
    )
    
    for dir in "${dirs[@]}"; do
        mkdir -p "$PROJECT_ROOT/$dir"
        log_debug "创建目录: $dir"
    done
    
    log_success "项目目录结构创建完成"
}

# 生成安全配置
generate_security_config() {
    log_step "生成安全配置..."
    
    # 生成随机密钥
    N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)
    JWT_SECRET=$(openssl rand -hex 32)
    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    WEBHOOK_SECRET=$(openssl rand -hex 16)
    
    log_success "安全密钥生成完成"
}

# 创建环境配置文件
create_env_file() {
    log_step "创建环境配置文件..."
    
    # 获取用户输入
    read -p "请输入域名 (例: n8n.example.com): " DOMAIN
    read -p "请输入OpenAI API密钥 (可选): " OPENAI_API_KEY
    read -p "是否启用HTTPS? (y/N): " ENABLE_HTTPS
    
    if [[ $ENABLE_HTTPS =~ ^[Yy]$ ]]; then
        PROTOCOL="https"
        N8N_PORT="443"
    else
        PROTOCOL="http"
        N8N_PORT="80"
    fi
    
    # 创建.env文件
    cat > "$PROJECT_ROOT/.env" << EOF
# N8N自动化系统环境配置
# 生成时间: $(date -Iseconds)

# 基础配置
DOMAIN=$DOMAIN
PROTOCOL=$PROTOCOL
N8N_PORT=$N8N_PORT
SUBDOMAIN=n8n

# 基础认证
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin123

# 加密密钥
N8N_ENCRYPTION_KEY=$N8N_ENCRYPTION_KEY
JWT_SECRET=$JWT_SECRET

# 数据库配置
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_USER=n8n
POSTGRES_DB=n8n
POSTGRES_NON_ROOT_USER=n8n
POSTGRES_NON_ROOT_PASSWORD=$POSTGRES_PASSWORD

# Redis配置
REDIS_PASSWORD=$REDIS_PASSWORD

# AI智能体配置
OPENAI_API_KEY=${OPENAI_API_KEY:-}
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000

# 智能体行为配置
AGENT_RESPONSE_TIMEOUT=30000
AGENT_MAX_RETRIES=3
AGENT_LEARNING_ENABLED=true
AGENT_MEMORY_ENABLED=true
AGENT_CONTEXT_WINDOW=8000

# 火鸟门户系统配置
FIREBIRD_PORTAL_ENABLED=true
FIREBIRD_API_ENDPOINT=https://api.firebird.com
FIREBIRD_API_KEY=your_firebird_api_key_here
FIREBIRD_WEBHOOK_SECRET=$WEBHOOK_SECRET

# API服务配置
API_RATE_LIMIT=1000
API_TIMEOUT=30000
API_MAX_PAYLOAD_SIZE=10mb

# 安全配置
SECURITY_AUDIT_ENABLED=true
SECURITY_LOG_LEVEL=info
SECURITY_SESSION_TIMEOUT=3600
SECURITY_MAX_LOGIN_ATTEMPTS=5

# 监控和日志配置
LOG_LEVEL=info
LOG_OUTPUT=console,file
METRICS_ENABLED=true
HEALTH_CHECK_ENABLED=true

# 消息队列配置
QUEUE_REDIS_HOST=redis
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_PASSWORD=$REDIS_PASSWORD
QUEUE_REDIS_DB=1

# 存储配置
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=/home/node/.n8n
STORAGE_S3_BUCKET=
STORAGE_S3_REGION=
STORAGE_S3_ACCESS_KEY=
STORAGE_S3_SECRET_KEY=

# 缓存配置
CACHE_ENABLED=true
CACHE_TTL=3600
CACHE_MAX_SIZE=100mb

# 邮件配置
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@${DOMAIN}

# 第三方服务配置
SLACK_BOT_TOKEN=
DISCORD_BOT_TOKEN=
TELEGRAM_BOT_TOKEN=
GITHUB_TOKEN=

# 开发和测试配置
NODE_ENV=production
DEBUG_MODE=false
TEST_MODE=false

# 性能配置
N8N_WORKERS=auto
N8N_CONCURRENCY=10
N8N_MAX_EXECUTION_TIMEOUT=3600

# 备份和恢复配置
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_ENCRYPTION_ENABLED=true

# Webhook配置
N8N_WEBHOOK_URL=${PROTOCOL}://${DOMAIN}
WEBHOOK_TUNNEL_URL=
GENERIC_TIMEZONE=Asia/Shanghai

# 执行配置
EXECUTIONS_PROCESS=main
EXECUTIONS_MODE=regular
EXECUTIONS_TIMEOUT=3600
EXECUTIONS_MAX_TIMEOUT=3600
EXECUTIONS_TIMEOUT_MAX=3600

# 工作流配置
WORKFLOWS_DEFAULT_NAME=My workflow
N8N_DEFAULT_BINARY_DATA_MODE=filesystem
N8N_BINARY_DATA_TTL=24

# 用户管理配置
N8N_USER_MANAGEMENT_DISABLED=false
N8N_EMAIL_MODE=smtp
N8N_PUBLIC_API_DISABLED=false

# 编辑器配置
N8N_DISABLE_UI=false
N8N_EDITOR_BASE_URL=
VUE_APP_URL_BASE_API=${PROTOCOL}://${DOMAIN}/

# 诊断配置
N8N_DIAGNOSTICS_ENABLED=true
N8N_VERSION_NOTIFICATIONS_ENABLED=true
N8N_TEMPLATES_ENABLED=true
N8N_ONBOARDING_FLOW_DISABLED=false
N8N_WORKFLOW_HISTORY_ENABLED=true

# 社区节点配置
N8N_COMMUNITY_PACKAGES_ENABLED=true
EXTERNAL_FRONTEND_HOOKS_URLS=
EXTERNAL_HOOK_FILES=

# 高级配置
N8N_SECURE_COOKIE=false
N8N_METRICS=false
QUEUE_HEALTH_CHECK_ACTIVE=false
N8N_HIRING_BANNER_ENABLED=false
EOF

    log_success "环境配置文件创建完成"
}

# 创建Docker Compose配置
create_docker_compose() {
    log_step "创建Docker Compose配置..."
    
    cat > "$PROJECT_ROOT/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: n8n-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_NON_ROOT_USER: ${POSTGRES_NON_ROOT_USER}
      POSTGRES_NON_ROOT_PASSWORD: ${POSTGRES_NON_ROOT_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql:ro
    ports:
      - "5432:5432"
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  redis:
    image: redis:7-alpine
    container_name: n8n-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-app
    restart: unless-stopped
    environment:
      # 数据库配置
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: ${POSTGRES_DB}
      DB_POSTGRESDB_USER: ${POSTGRES_USER}
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD}
      
      # Redis配置
      QUEUE_BULL_REDIS_HOST: redis
      QUEUE_BULL_REDIS_PORT: 6379
      QUEUE_BULL_REDIS_PASSWORD: ${REDIS_PASSWORD}
      QUEUE_BULL_REDIS_DB: 0
      
      # N8N基础配置
      N8N_HOST: ${DOMAIN}
      N8N_PORT: 5678
      N8N_PROTOCOL: ${PROTOCOL}
      WEBHOOK_URL: ${PROTOCOL}://${DOMAIN}
      
      # 认证配置
      N8N_BASIC_AUTH_ACTIVE: ${N8N_BASIC_AUTH_ACTIVE}
      N8N_BASIC_AUTH_USER: ${N8N_BASIC_AUTH_USER}
      N8N_BASIC_AUTH_PASSWORD: ${N8N_BASIC_AUTH_PASSWORD}
      
      # 加密配置
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
      
      # 执行配置
      EXECUTIONS_PROCESS: ${EXECUTIONS_PROCESS}
      EXECUTIONS_MODE: ${EXECUTIONS_MODE}
      EXECUTIONS_TIMEOUT: ${EXECUTIONS_TIMEOUT}
      EXECUTIONS_MAX_TIMEOUT: ${EXECUTIONS_MAX_TIMEOUT}
      EXECUTIONS_TIMEOUT_MAX: ${EXECUTIONS_TIMEOUT_MAX}
      
      # 工作流配置
      WORKFLOWS_DEFAULT_NAME: ${WORKFLOWS_DEFAULT_NAME}
      N8N_DEFAULT_BINARY_DATA_MODE: ${N8N_DEFAULT_BINARY_DATA_MODE}
      N8N_BINARY_DATA_TTL: ${N8N_BINARY_DATA_TTL}
      
      # 用户管理
      N8N_USER_MANAGEMENT_DISABLED: ${N8N_USER_MANAGEMENT_DISABLED}
      N8N_EMAIL_MODE: ${N8N_EMAIL_MODE}
      N8N_PUBLIC_API_DISABLED: ${N8N_PUBLIC_API_DISABLED}
      
      # 社区包
      N8N_COMMUNITY_PACKAGES_ENABLED: ${N8N_COMMUNITY_PACKAGES_ENABLED}
      
      # 其他配置
      GENERIC_TIMEZONE: ${GENERIC_TIMEZONE}
      N8N_METRICS: ${N8N_METRICS}
      N8N_DIAGNOSTICS_ENABLED: ${N8N_DIAGNOSTICS_ENABLED}
      N8N_VERSION_NOTIFICATIONS_ENABLED: ${N8N_VERSION_NOTIFICATIONS_ENABLED}
      N8N_TEMPLATES_ENABLED: ${N8N_TEMPLATES_ENABLED}
      N8N_ONBOARDING_FLOW_DISABLED: ${N8N_ONBOARDING_FLOW_DISABLED}
      N8N_WORKFLOW_HISTORY_ENABLED: ${N8N_WORKFLOW_HISTORY_ENABLED}
      
      # AI配置
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      
    volumes:
      - n8n_data:/home/node/.n8n
      - ./logs:/home/node/.n8n/logs
    ports:
      - "5678:5678"
    networks:
      - n8n-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  nginx:
    image: nginx:alpine
    container_name: n8n-nginx
    restart: unless-stopped
    ports:
      - "${N8N_PORT}:80"
      - "443:443"
    volumes:
      - ./config/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./config/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./config/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    networks:
      - n8n-network
    depends_on:
      - n8n
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  n8n_data:
    driver: local

networks:
  n8n-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF

    log_success "Docker Compose配置创建完成"
}

# 创建Nginx配置
create_nginx_config() {
    log_step "创建Nginx配置..."
    
    # 创建主配置文件
    cat > "$PROJECT_ROOT/config/nginx/nginx.conf" << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 基础配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip压缩
    gzip on;
    gzip_vary on;
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

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # 包含站点配置
    include /etc/nginx/conf.d/*.conf;
}
EOF

    # 创建站点配置文件
    cat > "$PROJECT_ROOT/config/nginx/default.conf" << EOF
# N8N反向代理配置
upstream n8n_backend {
    server n8n:5678;
    keepalive 32;
}

# HTTP服务器配置
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # 如果启用HTTPS，重定向到HTTPS
    location / {
        if (\$scheme = http) {
            return 301 https://\$server_name\$request_uri;
        }
        
        # 直接代理到N8N (如果不使用HTTPS)
        proxy_pass http://n8n_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # WebSocket支持
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
        
        # 文件上传大小限制
        client_max_body_size 50M;
    }
}

# HTTPS服务器配置 (如果启用)
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # SSL配置
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # 代理到N8N
    location / {
        proxy_pass http://n8n_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # WebSocket支持
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
        
        # 文件上传大小限制
        client_max_body_size 50M;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

    log_success "Nginx配置创建完成"
}

# 创建数据库初始化脚本
create_db_init_script() {
    log_step "创建数据库初始化脚本..."
    
    cat > "$PROJECT_ROOT/scripts/init-db.sql" << 'EOF'
-- N8N数据库初始化脚本
-- 创建必要的扩展和优化配置

-- 创建UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建全文搜索扩展
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 设置数据库参数优化
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- 重新加载配置
SELECT pg_reload_conf();

-- 创建性能监控视图
CREATE OR REPLACE VIEW n8n_performance_stats AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats 
WHERE schemaname = 'public';

-- 创建执行统计视图
CREATE OR REPLACE VIEW n8n_execution_stats AS
SELECT 
    DATE_TRUNC('hour', "startedAt") as hour,
    COUNT(*) as total_executions,
    COUNT(CASE WHEN "finished" = true THEN 1 END) as successful_executions,
    COUNT(CASE WHEN "stoppedAt" IS NOT NULL AND "finished" = false THEN 1 END) as failed_executions,
    AVG(EXTRACT(EPOCH FROM ("stoppedAt" - "startedAt"))) as avg_duration_seconds
FROM execution_entity 
WHERE "startedAt" >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', "startedAt")
ORDER BY hour DESC;

-- 创建工作流统计视图
CREATE OR REPLACE VIEW n8n_workflow_stats AS
SELECT 
    w.id,
    w.name,
    w.active,
    COUNT(e.id) as total_executions,
    MAX(e."startedAt") as last_execution,
    AVG(EXTRACT(EPOCH FROM (e."stoppedAt" - e."startedAt"))) as avg_duration_seconds
FROM workflow_entity w
LEFT JOIN execution_entity e ON w.id = e."workflowId"
GROUP BY w.id, w.name, w.active
ORDER BY total_executions DESC;

-- 创建索引优化
CREATE INDEX IF NOT EXISTS idx_execution_workflow_started 
ON execution_entity ("workflowId", "startedAt");

CREATE INDEX IF NOT EXISTS idx_execution_status_started 
ON execution_entity ("finished", "startedAt");

CREATE INDEX IF NOT EXISTS idx_workflow_active_updated 
ON workflow_entity ("active", "updatedAt");

-- 创建清理函数
CREATE OR REPLACE FUNCTION cleanup_old_executions(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM execution_entity 
    WHERE "startedAt" < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- 更新统计信息
    ANALYZE execution_entity;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 创建备份函数
CREATE OR REPLACE FUNCTION create_backup_info()
RETURNS TABLE(
    table_name TEXT,
    row_count BIGINT,
    size_bytes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        n_tup_ins + n_tup_upd + n_tup_del as row_count,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
    ORDER BY size_bytes DESC;
END;
$$ LANGUAGE plpgsql;

-- 授予权限
GRANT SELECT ON n8n_performance_stats TO n8n;
GRANT SELECT ON n8n_execution_stats TO n8n;
GRANT SELECT ON n8n_workflow_stats TO n8n;
GRANT EXECUTE ON FUNCTION cleanup_old_executions(INTEGER) TO n8n;
GRANT EXECUTE ON FUNCTION create_backup_info() TO n8n;

-- 记录初始化完成
INSERT INTO pg_stat_statements_info (dealloc) VALUES (0) ON CONFLICT DO NOTHING;
EOF

    log_success "数据库初始化脚本创建完成"
}

# 创建SSL证书
create_ssl_certificates() {
    log_step "创建SSL证书..."
    
    if [[ $ENABLE_HTTPS =~ ^[Yy]$ ]]; then
        # 创建自签名证书（生产环境建议使用Let's Encrypt）
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$PROJECT_ROOT/config/ssl/key.pem" \
            -out "$PROJECT_ROOT/config/ssl/cert.pem" \
            -subj "/C=CN/ST=State/L=City/O=Organization/CN=$DOMAIN"
        
        log_success "SSL证书创建完成"
        log_warning "生产环境建议使用Let's Encrypt证书"
    else
        log_info "跳过SSL证书创建（未启用HTTPS）"
    fi
}

# 创建管理脚本
create_management_scripts() {
    log_step "创建管理脚本..."
    
    # 创建启动脚本
    cat > "$PROJECT_ROOT/scripts/start.sh" << 'EOF'
#!/bin/bash
# N8N启动脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "启动N8N自动化系统..."

cd "$PROJECT_ROOT"

# 检查Docker是否运行
if ! docker info >/dev/null 2>&1; then
    echo "错误: Docker未运行"
    exit 1
fi

# 启动服务
docker-compose up -d

echo "等待服务启动..."
sleep 30

# 检查服务状态
docker-compose ps

echo "N8N系统启动完成！"
echo "访问地址: ${PROTOCOL:-http}://${DOMAIN:-localhost}:${N8N_PORT:-5678}"
EOF

    # 创建停止脚本
    cat > "$PROJECT_ROOT/scripts/stop.sh" << 'EOF'
#!/bin/bash
# N8N停止脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "停止N8N自动化系统..."

cd "$PROJECT_ROOT"

# 停止服务
docker-compose down

echo "N8N系统已停止"
EOF

    # 创建重启脚本
    cat > "$PROJECT_ROOT/scripts/restart.sh" << 'EOF'
#!/bin/bash
# N8N重启脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "重启N8N自动化系统..."

cd "$PROJECT_ROOT"

# 重启服务
docker-compose restart

echo "等待服务启动..."
sleep 30

# 检查服务状态
docker-compose ps

echo "N8N系统重启完成！"
EOF

    # 创建状态检查脚本
    cat > "$PROJECT_ROOT/scripts/status.sh" << 'EOF'
#!/bin/bash
# N8N状态检查脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "N8N系统状态检查"
echo "=================="

cd "$PROJECT_ROOT"

# 检查Docker服务状态
echo "Docker服务状态:"
docker-compose ps

echo
echo "容器资源使用情况:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

echo
echo "磁盘使用情况:"
df -h

echo
echo "系统负载:"
uptime
EOF

    # 创建日志查看脚本
    cat > "$PROJECT_ROOT/scripts/logs.sh" << 'EOF'
#!/bin/bash
# N8N日志查看脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

SERVICE=${1:-n8n}
LINES=${2:-100}

echo "查看 $SERVICE 服务日志 (最近 $LINES 行):"
echo "========================================"

docker-compose logs --tail="$LINES" -f "$SERVICE"
EOF

    # 设置执行权限
    chmod +x "$PROJECT_ROOT/scripts"/*.sh
    
    log_success "管理脚本创建完成"
}

# 创建监控脚本
create_monitoring_scripts() {
    log_step "创建监控脚本..."
    
    # 创建健康检查脚本
    cat > "$PROJECT_ROOT/scripts/health_check.sh" << 'EOF'
#!/bin/bash
# N8N健康检查脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 加载环境变量
if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
fi

DOMAIN=${DOMAIN:-localhost}
PROTOCOL=${PROTOCOL:-http}
N8N_PORT=${N8N_PORT:-5678}

echo "N8N系统健康检查"
echo "================"

# 检查容器状态
echo "1. 检查容器状态..."
cd "$PROJECT_ROOT"
if docker-compose ps | grep -q "Up"; then
    echo "✓ 容器运行正常"
else
    echo "✗ 容器状态异常"
    exit 1
fi

# 检查N8N服务
echo "2. 检查N8N服务..."
if curl -f -s "${PROTOCOL}://${DOMAIN}:${N8N_PORT}/healthz" >/dev/null; then
    echo "✓ N8N服务正常"
else
    echo "✗ N8N服务异常"
    exit 1
fi

# 检查数据库连接
echo "3. 检查数据库连接..."
if docker exec n8n-postgres pg_isready -U n8n >/dev/null 2>&1; then
    echo "✓ 数据库连接正常"
else
    echo "✗ 数据库连接异常"
    exit 1
fi

# 检查Redis连接
echo "4. 检查Redis连接..."
if docker exec n8n-redis redis-cli ping >/dev/null 2>&1; then
    echo "✓ Redis连接正常"
else
    echo "✗ Redis连接异常"
    exit 1
fi

# 检查磁盘空间
echo "5. 检查磁盘空间..."
DISK_USAGE=$(df . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 90 ]; then
    echo "✓ 磁盘空间充足 (${DISK_USAGE}%)"
else
    echo "⚠ 磁盘空间不足 (${DISK_USAGE}%)"
fi

# 检查内存使用
echo "6. 检查内存使用..."
if command -v free >/dev/null; then
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ "$MEMORY_USAGE" -lt 90 ]; then
        echo "✓ 内存使用正常 (${MEMORY_USAGE}%)"
    else
        echo "⚠ 内存使用过高 (${MEMORY_USAGE}%)"
    fi
else
    echo "- 无法检查内存使用 (macOS)"
fi

echo
echo "健康检查完成！"
EOF

    # 创建性能监控脚本
    cat > "$PROJECT_ROOT/scripts/performance_monitor.sh" << 'EOF'
#!/bin/bash
# N8N性能监控脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "N8N性能监控报告"
echo "================"
echo "生成时间: $(date)"
echo

cd "$PROJECT_ROOT"

# 容器资源使用
echo "1. 容器资源使用情况:"
echo "-------------------"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
echo

# 数据库性能
echo "2. 数据库性能统计:"
echo "-----------------"
docker exec n8n-postgres psql -U n8n -d n8n -c "
SELECT 
    'Connections' as metric, 
    count(*) as value 
FROM pg_stat_activity
UNION ALL
SELECT 
    'Database Size' as metric, 
    pg_size_pretty(pg_database_size('n8n')) as value
UNION ALL
SELECT 
    'Cache Hit Ratio' as metric, 
    round(100.0 * sum(blks_hit) / (sum(blks_hit) + sum(blks_read)), 2)::text || '%' as value
FROM pg_stat_database WHERE datname = 'n8n';
" 2>/dev/null || echo "数据库查询失败"
echo

# 工作流执行统计
echo "3. 工作流执行统计 (最近24小时):"
echo "-----------------------------"
docker exec n8n-postgres psql -U n8n -d n8n -c "
SELECT * FROM n8n_execution_stats LIMIT 10;
" 2>/dev/null || echo "执行统计查询失败"
echo

# 磁盘使用
echo "4. 磁盘使用情况:"
echo "---------------"
df -h
echo

# 系统负载
echo "5. 系统负载:"
echo "-----------"
uptime
echo

echo "监控报告生成完成！"
EOF

    # 设置执行权限
    chmod +x "$PROJECT_ROOT/scripts/health_check.sh"
    chmod +x "$PROJECT_ROOT/scripts/performance_monitor.sh"
    
    log_success "监控脚本创建完成"
}

# 部署系统
deploy_system() {
    log_step "部署N8N系统..."
    
    cd "$PROJECT_ROOT"
    
    # 拉取Docker镜像
    log_info "拉取Docker镜像..."
    docker-compose pull
    
    # 启动服务
    log_info "启动服务..."
    docker-compose up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 60
    
    # 检查服务状态
    log_info "检查服务状态..."
    if docker-compose ps | grep -q "Up"; then
        log_success "服务启动成功"
    else
        log_error "服务启动失败"
        docker-compose logs
        exit 1
    fi
    
    log_success "N8N系统部署完成"
}

# 验证部署
verify_deployment() {
    log_step "验证部署..."
    
    # 检查服务健康状态
    log_info "检查服务健康状态..."
    
    # 等待服务完全启动
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "http://localhost:5678/healthz" >/dev/null 2>&1; then
            log_success "N8N服务健康检查通过"
            break
        fi
        
        log_info "等待N8N服务启动... ($attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "N8N服务启动超时"
        exit 1
    fi
    
    # 检查数据库连接
    if docker exec n8n-postgres pg_isready -U n8n >/dev/null 2>&1; then
        log_success "数据库连接正常"
    else
        log_error "数据库连接失败"
        exit 1
    fi
    
    # 检查Redis连接
    if docker exec n8n-redis redis-cli ping >/dev/null 2>&1; then
        log_success "Redis连接正常"
    else
        log_error "Redis连接失败"
        exit 1
    fi
    
    log_success "部署验证完成"
}

# 恢复数据（如果提供备份文件）
restore_from_backup() {
    if [ -n "${BACKUP_RESTORE_URL:-}" ] || [ -n "${CONFIG_ARCHIVE:-}" ]; then
        log_step "从备份恢复数据..."
        
        if [ -f "$PROJECT_ROOT/scripts/backup_restore.sh" ]; then
            if [ -n "${BACKUP_RESTORE_URL:-}" ]; then
                log_info "从URL下载备份文件..."
                curl -L "$BACKUP_RESTORE_URL" -o "/tmp/n8n_backup.tar.gz"
                "$PROJECT_ROOT/scripts/backup_restore.sh" restore "/tmp/n8n_backup.tar.gz"
            elif [ -n "${CONFIG_ARCHIVE:-}" ] && [ -f "$CONFIG_ARCHIVE" ]; then
                log_info "从本地文件恢复..."
                "$PROJECT_ROOT/scripts/backup_restore.sh" restore "$CONFIG_ARCHIVE"
            fi
            
            log_success "数据恢复完成"
        else
            log_warning "备份恢复脚本不存在，跳过数据恢复"
        fi
    fi
}

# 创建快速启动指南
create_quick_start_guide() {
    log_step "创建快速启动指南..."
    
    cat > "$PROJECT_ROOT/QUICK_START.md" << EOF
# N8N自动化系统快速启动指南

## 🚀 系统信息

- **部署时间**: $(date -Iseconds)
- **域名**: ${DOMAIN}
- **访问地址**: ${PROTOCOL}://${DOMAIN}:${N8N_PORT}
- **管理员账号**: ${N8N_BASIC_AUTH_USER:-admin}
- **管理员密码**: ${N8N_BASIC_AUTH_PASSWORD:-admin123}

## 📋 服务状态检查

\`\`\`bash
# 检查所有服务状态
./scripts/status.sh

# 健康检查
./scripts/health_check.sh

# 查看日志
./scripts/logs.sh n8n
\`\`\`

## 🔧 常用管理命令

\`\`\`bash
# 启动服务
./scripts/start.sh

# 停止服务
./scripts/stop.sh

# 重启服务
./scripts/restart.sh

# 性能监控
./scripts/performance_monitor.sh
\`\`\`

## 💾 备份和恢复

\`\`\`bash
# 完整备份
./scripts/backup_restore.sh full-backup

# 增量备份
./scripts/backup_restore.sh incremental-backup

# 恢复数据
./scripts/backup_restore.sh restore /path/to/backup.tar.gz

# 列出备份
./scripts/backup_restore.sh list
\`\`\`

## 🔐 安全配置

### 重要密钥信息
- **N8N加密密钥**: \`${N8N_ENCRYPTION_KEY}\`
- **JWT密钥**: \`${JWT_SECRET}\`
- **数据库密码**: \`${POSTGRES_PASSWORD}\`
- **Redis密码**: \`${REDIS_PASSWORD}\`

⚠️ **请妥善保管这些密钥，丢失后无法恢复数据！**

### 修改默认密码
1. 编辑 \`.env\` 文件
2. 修改 \`N8N_BASIC_AUTH_PASSWORD\` 值
3. 重启服务: \`./scripts/restart.sh\`

## 🌐 网络配置

### 端口映射
- **N8N Web界面**: ${N8N_PORT}
- **PostgreSQL**: 5432
- **Redis**: 6379
- **Nginx**: 80, 443

### 防火墙配置
\`\`\`bash
# 开放必要端口
sudo ufw allow ${N8N_PORT}
sudo ufw allow 80
sudo ufw allow 443
\`\`\`

## 📊 监控和日志

### 日志位置
- **N8N日志**: \`./logs/\`
- **Nginx日志**: \`./logs/nginx/\`
- **部署日志**: \`${DEPLOY_LOG}\`

### 监控端点
- **N8N健康检查**: \`${PROTOCOL}://${DOMAIN}:${N8N_PORT}/healthz\`
- **Nginx健康检查**: \`${PROTOCOL}://${DOMAIN}/health\`

## 🔄 更新和维护

### 更新N8N版本
\`\`\`bash
# 停止服务
./scripts/stop.sh

# 备份数据
./scripts/backup_restore.sh full-backup

# 拉取最新镜像
docker-compose pull

# 启动服务
./scripts/start.sh
\`\`\`

### 清理旧数据
\`\`\`bash
# 清理旧备份
./scripts/backup_restore.sh cleanup

# 清理Docker资源
docker system prune -f
\`\`\`

## 🆘 故障排除

### 常见问题

1. **服务无法启动**
   \`\`\`bash
   # 检查Docker状态
   docker info
   
   # 查看错误日志
   ./scripts/logs.sh
   \`\`\`

2. **无法访问Web界面**
   \`\`\`bash
   # 检查端口占用
   netstat -tlnp | grep ${N8N_PORT}
   
   # 检查防火墙
   sudo ufw status
   \`\`\`

3. **数据库连接失败**
   \`\`\`bash
   # 检查数据库状态
   docker exec n8n-postgres pg_isready -U n8n
   
   # 重启数据库
   docker-compose restart postgres
   \`\`\`

### 获取支持
- 查看部署日志: \`cat ${DEPLOY_LOG}\`
- 运行健康检查: \`./scripts/health_check.sh\`
- 查看系统状态: \`./scripts/status.sh\`

## 📚 更多资源

- [N8N官方文档](https://docs.n8n.io/)
- [Docker Compose文档](https://docs.docker.com/compose/)
- [PostgreSQL文档](https://www.postgresql.org/docs/)
- [Redis文档](https://redis.io/documentation)

---

**部署完成时间**: $(date)
**系统版本**: N8N自动化系统 v1.0.0
EOF

    log_success "快速启动指南创建完成"
}

# 显示部署结果
show_deployment_result() {
    echo
    echo "========================================"
    echo "       🎉 部署成功完成！"
    echo "========================================"
    echo
    echo "📋 系统信息:"
    echo "  域名: $DOMAIN"
    echo "  访问地址: ${PROTOCOL}://${DOMAIN}:${N8N_PORT}"
    echo "  管理员账号: ${N8N_BASIC_AUTH_USER:-admin}"
    echo "  管理员密码: ${N8N_BASIC_AUTH_PASSWORD:-admin123}"
    echo
    echo "🔧 管理命令:"
    echo "  启动服务: ./scripts/start.sh"
    echo "  停止服务: ./scripts/stop.sh"
    echo "  查看状态: ./scripts/status.sh"
    echo "  健康检查: ./scripts/health_check.sh"
    echo
    echo "💾 备份命令:"
    echo "  完整备份: ./scripts/backup_restore.sh full-backup"
    echo "  数据恢复: ./scripts/backup_restore.sh restore <backup_file>"
    echo
    echo "📚 文档:"
    echo "  快速指南: cat QUICK_START.md"
    echo "  部署日志: cat $DEPLOY_LOG"
    echo
    echo "⚠️  重要提醒:"
    echo "  1. 请妥善保管 .env 文件中的密钥"
    echo "  2. 建议定期备份数据"
    echo "  3. 生产环境请使用正式SSL证书"
    echo
    echo "========================================"
}

# 显示使用说明
show_usage() {
    cat << EOF
N8N自动化系统一键部署脚本

用法: $0 [选项]

选项:
  -h, --help                    显示此帮助信息
  -d, --domain DOMAIN           指定域名 (交互式输入)
  -b, --backup-url URL          从URL恢复备份
  -f, --config-file FILE        从配置文件恢复
  --skip-deps                   跳过依赖安装
  --skip-ssl                    跳过SSL证书生成
  --dev-mode                    开发模式部署

示例:
  $0                            # 交互式部署
  $0 -d n8n.example.com         # 指定域名部署
  $0 -b http://example.com/backup.tar.gz  # 从备份恢复
  $0 --dev-mode                 # 开发模式部署

EOF
}

# 主函数
main() {
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -d|--domain)
                DOMAIN="$2"
                shift 2
                ;;
            -b|--backup-url)
                BACKUP_RESTORE_URL="$2"
                shift 2
                ;;
            -f|--config-file)
                CONFIG_ARCHIVE="$2"
                shift 2
                ;;
            --skip-deps)
                SKIP_DEPS=true
                shift
                ;;
            --skip-ssl)
                SKIP_SSL=true
                shift
                ;;
            --dev-mode)
                DEV_MODE=true
                shift
                ;;
            *)
                log_error "未知选项: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # 显示横幅
    show_banner
    
    echo "开始部署N8N自动化系统..."
    echo "部署日志: $DEPLOY_LOG"
    echo
    
    # 执行部署步骤
    check_system_requirements
    
    if [ "${SKIP_DEPS:-false}" != "true" ]; then
        install_dependencies
    fi
    
    verify_docker
    create_project_structure
    generate_security_config
    create_env_file
    create_docker_compose
    create_nginx_config
    create_db_init_script
    
    if [ "${SKIP_SSL:-false}" != "true" ]; then
        create_ssl_certificates
    fi
    
    create_management_scripts
    create_monitoring_scripts
    deploy_system
    verify_deployment
    restore_from_backup
    create_quick_start_guide
    
    # 显示部署结果
    show_deployment_result
    
    log_success "N8N自动化系统部署完成！"
}

# 执行主函数
main "$@"