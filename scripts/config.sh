#!/bin/bash

# N8N企业级自动化工作流平台 - 配置管理脚本
# 提供环境配置的生成、验证、更新和管理功能

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
CONFIG_LOG="logs/config.log"
CONFIG_BACKUP_DIR="backups/config"
ENV_FILE=".env"
ENV_TEMPLATE="config/env.template"
CONFIG_VALIDATION_RULES="config/validation.rules"

# 日志函数
log_info() {
    local message="$1"
    echo -e "${BLUE}[INFO]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $message" >> "$CONFIG_LOG"
}

log_success() {
    local message="$1"
    echo -e "${GREEN}[SUCCESS]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $message" >> "$CONFIG_LOG"
}

log_warning() {
    local message="$1"
    echo -e "${YELLOW}[WARNING]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $message" >> "$CONFIG_LOG"
}

log_error() {
    local message="$1"
    echo -e "${RED}[ERROR]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $message" >> "$CONFIG_LOG"
}

log_header() {
    local message="$1"
    echo ""
    echo -e "${CYAN}=== $message ===${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [HEADER] $message" >> "$CONFIG_LOG"
}

# 创建必要目录
create_directories() {
    mkdir -p logs config backups/config data/{n8n,postgres,redis} config/{nginx,postgres,redis}
}

# 生成配置模板
generate_config_template() {
    log_header "生成配置模板"
    
    mkdir -p config
    
    cat > "$ENV_TEMPLATE" << 'EOF'
# N8N企业级自动化工作流平台 - 环境配置模板
# 生成时间: {{TIMESTAMP}}

# ================================
# 基础配置
# ================================
PROJECT_NAME={{PROJECT_NAME}}
ENVIRONMENT={{ENVIRONMENT}}
HOST_IP={{HOST_IP}}
DOMAIN_NAME={{DOMAIN_NAME}}
TIMEZONE={{TIMEZONE}}

# ================================
# N8N核心配置
# ================================
N8N_HOST={{N8N_HOST}}
N8N_PORT={{N8N_PORT}}
N8N_PROTOCOL={{N8N_PROTOCOL}}
WEBHOOK_URL={{WEBHOOK_URL}}
N8N_ENCRYPTION_KEY={{N8N_ENCRYPTION_KEY}}
N8N_LOG_LEVEL={{N8N_LOG_LEVEL}}
N8N_METRICS={{N8N_METRICS}}

# N8N用户管理
N8N_USER_MANAGEMENT_DISABLED={{N8N_USER_MANAGEMENT_DISABLED}}
N8N_DISABLE_UI={{N8N_DISABLE_UI}}
N8N_PERSONALIZATION_ENABLED={{N8N_PERSONALIZATION_ENABLED}}
N8N_SECURE_COOKIE={{N8N_SECURE_COOKIE}}

# ================================
# 数据库配置
# ================================
DB_TYPE={{DB_TYPE}}
DB_POSTGRESDB_HOST={{DB_POSTGRESDB_HOST}}
DB_POSTGRESDB_PORT={{DB_POSTGRESDB_PORT}}
DB_POSTGRESDB_DATABASE={{DB_POSTGRESDB_DATABASE}}
DB_POSTGRESDB_USER={{DB_POSTGRESDB_USER}}
DB_POSTGRESDB_PASSWORD={{DB_POSTGRESDB_PASSWORD}}

# PostgreSQL容器配置
POSTGRES_DB={{POSTGRES_DB}}
POSTGRES_USER={{POSTGRES_USER}}
POSTGRES_PASSWORD={{POSTGRES_PASSWORD}}

# ================================
# Redis配置
# ================================
REDIS_HOST={{REDIS_HOST}}
REDIS_PORT={{REDIS_PORT}}
REDIS_PASSWORD={{REDIS_PASSWORD}}
REDIS_DB={{REDIS_DB}}

# ================================
# 执行配置
# ================================
EXECUTIONS_DATA_PRUNE={{EXECUTIONS_DATA_PRUNE}}
EXECUTIONS_DATA_MAX_AGE={{EXECUTIONS_DATA_MAX_AGE}}
EXECUTIONS_PROCESS={{EXECUTIONS_PROCESS}}
EXECUTIONS_MODE={{EXECUTIONS_MODE}}
EXECUTIONS_TIMEOUT={{EXECUTIONS_TIMEOUT}}
EXECUTIONS_TIMEOUT_MAX={{EXECUTIONS_TIMEOUT_MAX}}

# ================================
# 工作流配置
# ================================
WORKFLOWS_DEFAULT_NAME={{WORKFLOWS_DEFAULT_NAME}}
N8N_DEFAULT_BINARY_DATA_MODE={{N8N_DEFAULT_BINARY_DATA_MODE}}
N8N_BINARY_DATA_TTL={{N8N_BINARY_DATA_TTL}}

# ================================
# 安全配置
# ================================
N8N_JWT_AUTH_HEADER={{N8N_JWT_AUTH_HEADER}}
N8N_JWT_AUTH_HEADER_VALUE_PREFIX={{N8N_JWT_AUTH_HEADER_VALUE_PREFIX}}
N8N_BASIC_AUTH_ACTIVE={{N8N_BASIC_AUTH_ACTIVE}}
N8N_BASIC_AUTH_USER={{N8N_BASIC_AUTH_USER}}
N8N_BASIC_AUTH_PASSWORD={{N8N_BASIC_AUTH_PASSWORD}}

# ================================
# 邮件配置
# ================================
N8N_EMAIL_MODE={{N8N_EMAIL_MODE}}
N8N_SMTP_HOST={{N8N_SMTP_HOST}}
N8N_SMTP_PORT={{N8N_SMTP_PORT}}
N8N_SMTP_USER={{N8N_SMTP_USER}}
N8N_SMTP_PASS={{N8N_SMTP_PASS}}
N8N_SMTP_SENDER={{N8N_SMTP_SENDER}}
N8N_SMTP_SSL={{N8N_SMTP_SSL}}

# ================================
# 外部服务配置
# ================================
# Nginx配置
NGINX_HOST={{NGINX_HOST}}
NGINX_PORT={{NGINX_PORT}}
NGINX_SSL_PORT={{NGINX_SSL_PORT}}

# 监控配置
MONITORING_ENABLED={{MONITORING_ENABLED}}
PROMETHEUS_PORT={{PROMETHEUS_PORT}}
GRAFANA_PORT={{GRAFANA_PORT}}

# ================================
# 开发配置
# ================================
NODE_ENV={{NODE_ENV}}
DEBUG={{DEBUG}}
N8N_LOG_OUTPUT={{N8N_LOG_OUTPUT}}
N8N_LOG_FILE_COUNT_MAX={{N8N_LOG_FILE_COUNT_MAX}}
N8N_LOG_FILE_SIZE_MAX={{N8N_LOG_FILE_SIZE_MAX}}
EOF
    
    log_success "配置模板生成完成: $ENV_TEMPLATE"
}

# 生成验证规则
generate_validation_rules() {
    log_header "生成验证规则"
    
    cat > "$CONFIG_VALIDATION_RULES" << 'EOF'
# N8N配置验证规则
# 格式: VARIABLE_NAME:TYPE:REQUIRED:DEFAULT_VALUE:VALIDATION_PATTERN

# 基础配置
PROJECT_NAME:string:true::^[a-zA-Z0-9_\u4e00-\u9fa5\s-]+$
ENVIRONMENT:enum:true:development:^(development|staging|production)$
HOST_IP:ip:true::^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^localhost$
DOMAIN_NAME:string:true:n8n.local:^[a-zA-Z0-9.-]+$
TIMEZONE:string:true:Asia/Shanghai:^[A-Za-z_]+/[A-Za-z_]+$

# N8N配置
N8N_HOST:string:true:localhost:.*
N8N_PORT:port:true:5678:^[1-9][0-9]{3,4}$
N8N_PROTOCOL:enum:true:http:^(http|https)$
N8N_ENCRYPTION_KEY:string:true::^[A-Za-z0-9+/]{32,}$
N8N_LOG_LEVEL:enum:true:info:^(error|warn|info|verbose|debug|silly)$
N8N_METRICS:boolean:true:true:^(true|false)$

# 数据库配置
DB_TYPE:enum:true:postgresdb:^(postgresdb|mysql|sqlite)$
DB_POSTGRESDB_HOST:string:true:postgres:.*
DB_POSTGRESDB_PORT:port:true:5432:^[1-9][0-9]{3,4}$
DB_POSTGRESDB_DATABASE:string:true:n8n:^[a-zA-Z0-9_]+$
DB_POSTGRESDB_USER:string:true:n8n_user:^[a-zA-Z0-9_]+$
DB_POSTGRESDB_PASSWORD:string:true::^.{8,}$

# Redis配置
REDIS_HOST:string:true:redis:.*
REDIS_PORT:port:true:6379:^[1-9][0-9]{3,4}$
REDIS_PASSWORD:string:false::^.{8,}$
REDIS_DB:number:true:0:^[0-9]+$

# 执行配置
EXECUTIONS_DATA_PRUNE:boolean:true:true:^(true|false)$
EXECUTIONS_DATA_MAX_AGE:number:true:168:^[1-9][0-9]*$
EXECUTIONS_PROCESS:enum:true:main:^(main|own)$
EXECUTIONS_MODE:enum:true:regular:^(regular|queue)$
EXECUTIONS_TIMEOUT:number:false:3600:^[1-9][0-9]*$
EXECUTIONS_TIMEOUT_MAX:number:false:7200:^[1-9][0-9]*$

# 安全配置
N8N_SECURE_COOKIE:boolean:true:false:^(true|false)$
N8N_DISABLE_UI:boolean:true:false:^(true|false)$
N8N_PERSONALIZATION_ENABLED:boolean:true:true:^(true|false)$
N8N_BASIC_AUTH_ACTIVE:boolean:false:false:^(true|false)$

# 邮件配置
N8N_EMAIL_MODE:enum:false:smtp:^(smtp|sendmail)$
N8N_SMTP_PORT:port:false:587:^[1-9][0-9]{2,4}$
N8N_SMTP_SSL:boolean:false:true:^(true|false)$

# 外部服务配置
NGINX_PORT:port:true:80:^[1-9][0-9]{1,4}$
NGINX_SSL_PORT:port:true:443:^[1-9][0-9]{1,4}$
MONITORING_ENABLED:boolean:false:false:^(true|false)$
PROMETHEUS_PORT:port:false:9090:^[1-9][0-9]{3,4}$
GRAFANA_PORT:port:false:3000:^[1-9][0-9]{3,4}$

# 开发配置
NODE_ENV:enum:false:production:^(development|production)$
DEBUG:boolean:false:false:^(true|false)$
N8N_LOG_FILE_COUNT_MAX:number:false:100:^[1-9][0-9]*$
N8N_LOG_FILE_SIZE_MAX:number:false:16:^[1-9][0-9]*$
EOF
    
    log_success "验证规则生成完成: $CONFIG_VALIDATION_RULES"
}

# 生成默认配置
generate_default_config() {
    log_header "生成默认配置"
    
    local environment="${1:-development}"
    local interactive="${2:-false}"
    
    # 生成随机密码和密钥
    local postgres_password=$(generate_secure_password 16)
    local redis_password=$(generate_secure_password 16)
    local n8n_encryption_key=$(generate_secure_key 32)
    local basic_auth_password=$(generate_secure_password 12)
    
    # 获取主机信息
    local host_ip=$(get_host_ip)
    local domain_name="n8n.local"
    
    # 交互式配置
    if [ "$interactive" = true ]; then
        read_interactive_config
    fi
    
    # 创建配置文件
    cat > "$ENV_FILE" << EOF
# N8N企业级自动化工作流平台 - 环境配置
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')
# 环境: $environment

# ================================
# 基础配置
# ================================
PROJECT_NAME=N8N企业级自动化工作流平台
ENVIRONMENT=$environment
HOST_IP=$host_ip
DOMAIN_NAME=$domain_name
TIMEZONE=Asia/Shanghai

# ================================
# N8N核心配置
# ================================
N8N_HOST=$host_ip
N8N_PORT=5678
N8N_PROTOCOL=http
WEBHOOK_URL=http://$host_ip:5678/
N8N_ENCRYPTION_KEY=$n8n_encryption_key
N8N_LOG_LEVEL=info
N8N_METRICS=true

# N8N用户管理
N8N_USER_MANAGEMENT_DISABLED=false
N8N_DISABLE_UI=false
N8N_PERSONALIZATION_ENABLED=true
N8N_SECURE_COOKIE=false

# ================================
# 数据库配置
# ================================
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=$postgres_password

# PostgreSQL容器配置
POSTGRES_DB=n8n
POSTGRES_USER=n8n_user
POSTGRES_PASSWORD=$postgres_password

# ================================
# Redis配置
# ================================
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$redis_password
REDIS_DB=0

# ================================
# 执行配置
# ================================
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=168
EXECUTIONS_PROCESS=main
EXECUTIONS_MODE=regular
EXECUTIONS_TIMEOUT=3600
EXECUTIONS_TIMEOUT_MAX=7200

# ================================
# 工作流配置
# ================================
WORKFLOWS_DEFAULT_NAME=My Workflow
N8N_DEFAULT_BINARY_DATA_MODE=filesystem
N8N_BINARY_DATA_TTL=24

# ================================
# 安全配置
# ================================
N8N_JWT_AUTH_HEADER=
N8N_JWT_AUTH_HEADER_VALUE_PREFIX=
N8N_BASIC_AUTH_ACTIVE=false
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=$basic_auth_password

# ================================
# 邮件配置
# ================================
N8N_EMAIL_MODE=smtp
N8N_SMTP_HOST=
N8N_SMTP_PORT=587
N8N_SMTP_USER=
N8N_SMTP_PASS=
N8N_SMTP_SENDER=
N8N_SMTP_SSL=true

# ================================
# 外部服务配置
# ================================
# Nginx配置
NGINX_HOST=$host_ip
NGINX_PORT=80
NGINX_SSL_PORT=443

# 监控配置
MONITORING_ENABLED=false
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000

# ================================
# 开发配置
# ================================
NODE_ENV=production
DEBUG=false
N8N_LOG_OUTPUT=console,file
N8N_LOG_FILE_COUNT_MAX=100
N8N_LOG_FILE_SIZE_MAX=16
EOF
    
    log_success "默认配置生成完成: $ENV_FILE"
    log_info "PostgreSQL密码: $postgres_password"
    log_info "Redis密码: $redis_password"
    log_info "基础认证密码: $basic_auth_password"
}

# 生成安全密码
generate_secure_password() {
    local length="${1:-16}"
    openssl rand -base64 $((length * 3 / 4)) | tr -d "=+/" | cut -c1-$length
}

# 生成安全密钥
generate_secure_key() {
    local length="${1:-32}"
    openssl rand -base64 $((length * 3 / 4)) | tr -d "=+/" | cut -c1-$length
}

# 获取主机IP
get_host_ip() {
    local host_ip="localhost"
    
    # 尝试多种方法获取IP
    if command -v ip &> /dev/null; then
        host_ip=$(ip route get 1 2>/dev/null | awk '{print $7; exit}' || echo "localhost")
    elif command -v ifconfig &> /dev/null; then
        host_ip=$(ifconfig 2>/dev/null | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1 || echo "localhost")
    elif command -v hostname &> /dev/null; then
        host_ip=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
    fi
    
    echo "$host_ip"
}

# 交互式配置读取
read_interactive_config() {
    log_info "进入交互式配置模式..."
    
    echo -n "项目名称 [N8N企业级自动化工作流平台]: "
    read -r project_name
    project_name=${project_name:-"N8N企业级自动化工作流平台"}
    
    echo -n "环境类型 (development/staging/production) [development]: "
    read -r environment
    environment=${environment:-"development"}
    
    echo -n "主机IP [$host_ip]: "
    read -r input_host_ip
    host_ip=${input_host_ip:-$host_ip}
    
    echo -n "域名 [n8n.local]: "
    read -r input_domain
    domain_name=${input_domain:-"n8n.local"}
    
    echo -n "N8N端口 [5678]: "
    read -r n8n_port
    n8n_port=${n8n_port:-"5678"}
    
    echo -n "启用基础认证? (y/N): "
    read -r enable_basic_auth
    if [[ "$enable_basic_auth" =~ ^[Yy]$ ]]; then
        echo -n "基础认证用户名 [admin]: "
        read -r basic_auth_user
        basic_auth_user=${basic_auth_user:-"admin"}
        
        echo -n "基础认证密码 (留空自动生成): "
        read -r -s basic_auth_password
        echo
        if [ -z "$basic_auth_password" ]; then
            basic_auth_password=$(generate_secure_password 12)
        fi
    fi
    
    log_info "交互式配置完成"
}

# 验证配置文件
validate_config() {
    log_header "验证配置文件"
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "配置文件不存在: $ENV_FILE"
        return 1
    fi
    
    if [ ! -f "$CONFIG_VALIDATION_RULES" ]; then
        log_warning "验证规则文件不存在，跳过详细验证"
        return 0
    fi
    
    local validation_errors=0
    local validation_warnings=0
    
    # 读取配置文件
    source "$ENV_FILE"
    
    # 逐行验证
    while IFS=':' read -r var_name var_type required default_value pattern; do
        # 跳过注释和空行
        [[ "$var_name" =~ ^#.*$ ]] && continue
        [[ -z "$var_name" ]] && continue
        
        local var_value="${!var_name}"
        
        # 检查必需变量
        if [ "$required" = "true" ] && [ -z "$var_value" ]; then
            log_error "必需变量未设置: $var_name"
            validation_errors=$((validation_errors + 1))
            continue
        fi
        
        # 如果变量为空且有默认值，使用默认值
        if [ -z "$var_value" ] && [ -n "$default_value" ]; then
            var_value="$default_value"
            log_info "使用默认值: $var_name=$default_value"
        fi
        
        # 跳过空值验证
        [ -z "$var_value" ] && continue
        
        # 类型验证
        case "$var_type" in
            "port")
                if ! [[ "$var_value" =~ ^[1-9][0-9]{0,4}$ ]] || [ "$var_value" -gt 65535 ]; then
                    log_error "无效端口号: $var_name=$var_value"
                    validation_errors=$((validation_errors + 1))
                fi
                ;;
            "boolean")
                if ! [[ "$var_value" =~ ^(true|false)$ ]]; then
                    log_error "无效布尔值: $var_name=$var_value"
                    validation_errors=$((validation_errors + 1))
                fi
                ;;
            "number")
                if ! [[ "$var_value" =~ ^[0-9]+$ ]]; then
                    log_error "无效数字: $var_name=$var_value"
                    validation_errors=$((validation_errors + 1))
                fi
                ;;
            "ip")
                if ! validate_ip "$var_value"; then
                    log_error "无效IP地址: $var_name=$var_value"
                    validation_errors=$((validation_errors + 1))
                fi
                ;;
            "enum"|"string")
                if [ -n "$pattern" ] && ! [[ "$var_value" =~ $pattern ]]; then
                    log_error "值不匹配模式: $var_name=$var_value (模式: $pattern)"
                    validation_errors=$((validation_errors + 1))
                fi
                ;;
        esac
        
    done < "$CONFIG_VALIDATION_RULES"
    
    # 额外的业务逻辑验证
    validate_business_logic
    
    # 输出验证结果
    if [ $validation_errors -eq 0 ]; then
        log_success "配置验证通过"
        if [ $validation_warnings -gt 0 ]; then
            log_warning "发现 $validation_warnings 个警告"
        fi
        return 0
    else
        log_error "配置验证失败，发现 $validation_errors 个错误"
        return 1
    fi
}

# 验证IP地址
validate_ip() {
    local ip="$1"
    
    # 允许localhost
    [ "$ip" = "localhost" ] && return 0
    
    # 验证IPv4格式
    if [[ "$ip" =~ ^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$ ]]; then
        return 0
    fi
    
    return 1
}

# 业务逻辑验证
validate_business_logic() {
    # 检查端口冲突
    local ports=("$N8N_PORT" "$DB_POSTGRESDB_PORT" "$REDIS_PORT" "$NGINX_PORT")
    local unique_ports=($(printf '%s\n' "${ports[@]}" | sort -u))
    
    if [ ${#ports[@]} -ne ${#unique_ports[@]} ]; then
        log_error "检测到端口冲突"
        validation_errors=$((validation_errors + 1))
    fi
    
    # 检查密码强度
    if [ ${#DB_POSTGRESDB_PASSWORD} -lt 8 ]; then
        log_warning "数据库密码长度建议至少8位"
        validation_warnings=$((validation_warnings + 1))
    fi
    
    if [ -n "$REDIS_PASSWORD" ] && [ ${#REDIS_PASSWORD} -lt 8 ]; then
        log_warning "Redis密码长度建议至少8位"
        validation_warnings=$((validation_warnings + 1))
    fi
    
    # 检查加密密钥长度
    if [ ${#N8N_ENCRYPTION_KEY} -lt 32 ]; then
        log_error "N8N加密密钥长度必须至少32位"
        validation_errors=$((validation_errors + 1))
    fi
}

# 备份配置
backup_config() {
    log_header "备份配置"
    
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_dir="$CONFIG_BACKUP_DIR/$timestamp"
    
    mkdir -p "$backup_dir"
    
    # 备份环境文件
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "$backup_dir/"
        log_info "备份环境配置: $backup_dir/.env"
    fi
    
    # 备份Docker Compose文件
    if [ -f "docker-compose.yml" ]; then
        cp "docker-compose.yml" "$backup_dir/"
        log_info "备份Docker配置: $backup_dir/docker-compose.yml"
    fi
    
    # 备份其他配置文件
    if [ -d "config" ]; then
        cp -r config "$backup_dir/"
        log_info "备份配置目录: $backup_dir/config/"
    fi
    
    log_success "配置备份完成: $backup_dir"
    echo "$backup_dir"
}

# 恢复配置
restore_config() {
    local backup_path="$1"
    
    if [ -z "$backup_path" ]; then
        log_error "请指定备份路径"
        return 1
    fi
    
    if [ ! -d "$backup_path" ]; then
        log_error "备份路径不存在: $backup_path"
        return 1
    fi
    
    log_header "恢复配置"
    
    # 备份当前配置
    local current_backup=$(backup_config)
    log_info "当前配置已备份到: $current_backup"
    
    # 恢复环境文件
    if [ -f "$backup_path/.env" ]; then
        cp "$backup_path/.env" "$ENV_FILE"
        log_info "恢复环境配置: $ENV_FILE"
    fi
    
    # 恢复Docker Compose文件
    if [ -f "$backup_path/docker-compose.yml" ]; then
        cp "$backup_path/docker-compose.yml" "docker-compose.yml"
        log_info "恢复Docker配置: docker-compose.yml"
    fi
    
    # 恢复配置目录
    if [ -d "$backup_path/config" ]; then
        rm -rf config
        cp -r "$backup_path/config" config
        log_info "恢复配置目录: config/"
    fi
    
    log_success "配置恢复完成"
    
    # 验证恢复的配置
    if validate_config; then
        log_success "恢复的配置验证通过"
    else
        log_error "恢复的配置验证失败，请检查"
        return 1
    fi
}

# 更新配置
update_config() {
    local key="$1"
    local value="$2"
    
    if [ -z "$key" ] || [ -z "$value" ]; then
        log_error "请指定配置键和值"
        return 1
    fi
    
    log_header "更新配置"
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "配置文件不存在: $ENV_FILE"
        return 1
    fi
    
    # 备份当前配置
    backup_config > /dev/null
    
    # 更新配置
    if grep -q "^$key=" "$ENV_FILE"; then
        # 更新现有配置
        sed -i.bak "s/^$key=.*/$key=$value/" "$ENV_FILE"
        log_info "更新配置: $key=$value"
    else
        # 添加新配置
        echo "$key=$value" >> "$ENV_FILE"
        log_info "添加配置: $key=$value"
    fi
    
    # 验证更新后的配置
    if validate_config; then
        log_success "配置更新完成并验证通过"
        rm -f "$ENV_FILE.bak"
    else
        log_error "配置更新后验证失败，恢复原配置"
        mv "$ENV_FILE.bak" "$ENV_FILE"
        return 1
    fi
}

# 显示配置
show_config() {
    log_header "当前配置"
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "配置文件不存在: $ENV_FILE"
        return 1
    fi
    
    echo ""
    echo -e "${CYAN}=== 环境配置 ===${NC}"
    
    # 按类别显示配置
    local categories=("基础配置" "N8N核心配置" "数据库配置" "Redis配置" "执行配置" "安全配置" "邮件配置" "外部服务配置" "开发配置")
    
    for category in "${categories[@]}"; do
        echo ""
        echo -e "${YELLOW}--- $category ---${NC}"
        
        # 提取对应类别的配置
        awk -v cat="$category" '
        BEGIN { in_section = 0 }
        /^# ================================/ { in_section = 0 }
        /^# '"$category"'/ { in_section = 1; next }
        in_section && /^[A-Z_]+=/ { 
            split($0, parts, "=")
            printf "  %-30s = %s\n", parts[1], parts[2]
        }
        ' "$ENV_FILE"
    done
    
    echo ""
}

# 比较配置
compare_config() {
    local config1="$1"
    local config2="$2"
    
    if [ -z "$config1" ] || [ -z "$config2" ]; then
        log_error "请指定两个配置文件路径"
        return 1
    fi
    
    if [ ! -f "$config1" ] || [ ! -f "$config2" ]; then
        log_error "配置文件不存在"
        return 1
    fi
    
    log_header "配置比较"
    
    echo ""
    echo -e "${CYAN}=== 配置差异 ===${NC}"
    
    # 使用diff比较配置
    if command -v colordiff &> /dev/null; then
        colordiff -u "$config1" "$config2" || true
    else
        diff -u "$config1" "$config2" || true
    fi
    
    echo ""
}

# 导出配置
export_config() {
    local format="${1:-env}"
    local output_file="${2:-config_export_$(date '+%Y%m%d_%H%M%S')}"
    
    log_header "导出配置"
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "配置文件不存在: $ENV_FILE"
        return 1
    fi
    
    case "$format" in
        "env")
            cp "$ENV_FILE" "$output_file.env"
            log_success "配置导出为ENV格式: $output_file.env"
            ;;
        "json")
            # 转换为JSON格式
            {
                echo "{"
                grep -E '^[A-Z_]+=' "$ENV_FILE" | while IFS='=' read -r key value; do
                    echo "  \"$key\": \"$value\","
                done | sed '$ s/,$//'
                echo "}"
            } > "$output_file.json"
            log_success "配置导出为JSON格式: $output_file.json"
            ;;
        "yaml")
            # 转换为YAML格式
            {
                echo "# N8N配置导出"
                echo "# 导出时间: $(date '+%Y-%m-%d %H:%M:%S')"
                echo ""
                grep -E '^[A-Z_]+=' "$ENV_FILE" | while IFS='=' read -r key value; do
                    echo "$key: \"$value\""
                done
            } > "$output_file.yaml"
            log_success "配置导出为YAML格式: $output_file.yaml"
            ;;
        *)
            log_error "不支持的导出格式: $format"
            return 1
            ;;
    esac
}

# 清理配置
cleanup_config() {
    log_header "清理配置"
    
    # 清理备份文件
    if [ -d "$CONFIG_BACKUP_DIR" ]; then
        local backup_count=$(find "$CONFIG_BACKUP_DIR" -type d -name "20*" | wc -l)
        
        if [ "$backup_count" -gt 10 ]; then
            log_info "清理旧备份文件..."
            find "$CONFIG_BACKUP_DIR" -type d -name "20*" | sort | head -n $((backup_count - 10)) | xargs rm -rf
            log_success "清理了 $((backup_count - 10)) 个旧备份"
        fi
    fi
    
    # 清理临时文件
    find . -name "*.bak" -type f -delete 2>/dev/null || true
    find . -name ".env.tmp*" -type f -delete 2>/dev/null || true
    
    log_success "配置清理完成"
}

# 显示帮助
show_help() {
    echo "N8N企业级自动化工作流平台配置管理脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  generate [环境]          生成默认配置 (development/staging/production)"
    echo "  generate-interactive     交互式生成配置"
    echo "  generate-template        生成配置模板"
    echo "  validate                 验证配置文件"
    echo "  backup                   备份当前配置"
    echo "  restore <路径>           恢复配置"
    echo "  update <键> <值>         更新配置项"
    echo "  show                     显示当前配置"
    echo "  compare <文件1> <文件2>  比较配置文件"
    echo "  export [格式] [文件]     导出配置 (env/json/yaml)"
    echo "  cleanup                  清理配置文件"
    echo ""
    echo "选项:"
    echo "  --env-file <文件>        指定环境文件路径"
    echo "  --backup-dir <目录>      指定备份目录"
    echo "  --force                  强制执行操作"
    echo "  --quiet                  静默模式"
    echo "  -h, --help               显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 generate development              # 生成开发环境配置"
    echo "  $0 generate-interactive              # 交互式生成配置"
    echo "  $0 validate                          # 验证当前配置"
    echo "  $0 backup                            # 备份当前配置"
    echo "  $0 update N8N_PORT 8080              # 更新N8N端口"
    echo "  $0 export json config.json           # 导出为JSON格式"
    echo ""
}

# 主函数
main() {
    # 创建必要目录
    create_directories
    
    # 解析命令行参数
    local command=""
    local force_mode=false
    local quiet_mode=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            generate|generate-interactive|generate-template|validate|backup|restore|update|show|compare|export|cleanup)
                command="$1"
                shift
                break
                ;;
            --env-file)
                ENV_FILE="$2"
                shift 2
                ;;
            --backup-dir)
                CONFIG_BACKUP_DIR="$2"
                shift 2
                ;;
            --force)
                force_mode=true
                shift
                ;;
            --quiet)
                quiet_mode=true
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
    
    # 如果没有指定命令，显示帮助
    if [ -z "$command" ]; then
        show_help
        exit 1
    fi
    
    # 执行命令
    case "$command" in
        "generate")
            local environment="${1:-development}"
            generate_default_config "$environment" false
            ;;
        "generate-interactive")
            generate_default_config "development" true
            ;;
        "generate-template")
            generate_config_template
            generate_validation_rules
            ;;
        "validate")
            validate_config
            ;;
        "backup")
            backup_config
            ;;
        "restore")
            restore_config "$1"
            ;;
        "update")
            update_config "$1" "$2"
            ;;
        "show")
            show_config
            ;;
        "compare")
            compare_config "$1" "$2"
            ;;
        "export")
            export_config "$1" "$2"
            ;;
        "cleanup")
            cleanup_config
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi