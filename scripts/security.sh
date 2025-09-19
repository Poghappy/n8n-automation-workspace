#!/bin/bash

# N8N企业级自动化工作流平台 - 安全检查和加固脚本
# 全面的安全审计和防护工具

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
SECURITY_LOG="logs/security.log"
SECURITY_REPORT="logs/security-report-$(date +%Y%m%d_%H%M%S).html"
BACKUP_DIR="backups/security-$(date +%Y%m%d)"

# 安全配置
MIN_PASSWORD_LENGTH=12
MAX_LOGIN_ATTEMPTS=5
SESSION_TIMEOUT=3600
ENCRYPTION_ALGORITHM="AES-256-GCM"

# 日志函数
log_info() {
    local message="$1"
    echo -e "${BLUE}[INFO]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $message" >> "$SECURITY_LOG"
}

log_success() {
    local message="$1"
    echo -e "${GREEN}[SUCCESS]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $message" >> "$SECURITY_LOG"
}

log_warning() {
    local message="$1"
    echo -e "${YELLOW}[WARNING]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $message" >> "$SECURITY_LOG"
}

log_error() {
    local message="$1"
    echo -e "${RED}[ERROR]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $message" >> "$SECURITY_LOG"
}

log_critical() {
    local message="$1"
    echo -e "${RED}[CRITICAL]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [CRITICAL] $message" >> "$SECURITY_LOG"
}

log_header() {
    local message="$1"
    echo -e "${PURPLE}[HEADER]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [HEADER] $message" >> "$SECURITY_LOG"
}

# 创建安全日志目录
create_security_directories() {
    mkdir -p logs
    mkdir -p "$BACKUP_DIR"
    touch "$SECURITY_LOG"
}

# 环境变量安全检查
check_environment_security() {
    log_header "环境变量安全检查"
    
    local security_issues=0
    
    if [ ! -f ".env" ]; then
        log_error "未找到.env文件"
        return 1
    fi
    
    # 检查文件权限
    local env_perms=$(stat -f "%A" .env 2>/dev/null || echo "unknown")
    if [ "$env_perms" != "600" ] && [ "$env_perms" != "644" ]; then
        log_warning ".env文件权限不安全: $env_perms，建议设置为600"
        security_issues=$((security_issues + 1))
    else
        log_success ".env文件权限正常: $env_perms"
    fi
    
    # 检查敏感信息
    log_info "检查敏感信息配置..."
    
    # 检查默认密码
    local weak_passwords=$(grep -E "(password|secret|key)" .env | grep -iE "(123|password|admin|test|default|changeme)" || true)
    if [ -n "$weak_passwords" ]; then
        log_critical "发现弱密码配置:"
        echo "$weak_passwords" | while read line; do
            log_critical "  $line"
        done
        security_issues=$((security_issues + 1))
    else
        log_success "密码强度检查通过"
    fi
    
    # 检查加密密钥长度
    local encryption_keys=$(grep -E "(ENCRYPTION_KEY|SECRET_KEY|JWT_SECRET)" .env || true)
    if [ -n "$encryption_keys" ]; then
        echo "$encryption_keys" | while read line; do
            local key_value=$(echo "$line" | cut -d'=' -f2)
            local key_length=${#key_value}
            if [ $key_length -lt 32 ]; then
                log_warning "加密密钥长度不足: $key_length 字符，建议至少32字符"
                security_issues=$((security_issues + 1))
            else
                log_success "加密密钥长度符合要求: $key_length 字符"
            fi
        done
    fi
    
    # 检查数据库连接安全
    if grep -q "sslmode=disable" .env; then
        log_warning "数据库连接未启用SSL"
        security_issues=$((security_issues + 1))
    else
        log_success "数据库连接安全配置正常"
    fi
    
    # 检查调试模式
    if grep -q "DEBUG=true\|NODE_ENV=development" .env; then
        log_warning "检测到调试模式启用，生产环境应禁用"
        security_issues=$((security_issues + 1))
    else
        log_success "调试模式配置正常"
    fi
    
    if [ $security_issues -eq 0 ]; then
        log_success "环境变量安全检查通过"
    else
        log_warning "环境变量安全检查发现 $security_issues 个问题"
    fi
    
    return $security_issues
}

# Docker安全检查
check_docker_security() {
    log_header "Docker安全检查"
    
    local security_issues=0
    
    # 检查Docker守护进程
    if ! docker info &>/dev/null; then
        log_error "Docker服务未运行"
        return 1
    fi
    
    # 检查特权容器
    log_info "检查特权容器..."
    local privileged_containers=$(docker ps --format "table {{.Names}}\t{{.Image}}" --filter "label=privileged=true" 2>/dev/null || true)
    if [ -n "$privileged_containers" ]; then
        log_warning "发现特权容器:"
        echo "$privileged_containers"
        security_issues=$((security_issues + 1))
    else
        log_success "未发现特权容器"
    fi
    
    # 检查容器用户
    log_info "检查容器用户配置..."
    local containers=$(docker-compose ps -q)
    for container in $containers; do
        local user=$(docker inspect --format='{{.Config.User}}' "$container" 2>/dev/null || echo "")
        local name=$(docker inspect --format='{{.Name}}' "$container" 2>/dev/null | sed 's/\///')
        
        if [ -z "$user" ] || [ "$user" = "root" ] || [ "$user" = "0" ]; then
            log_warning "容器 $name 以root用户运行"
            security_issues=$((security_issues + 1))
        else
            log_success "容器 $name 用户配置安全: $user"
        fi
    done
    
    # 检查网络配置
    log_info "检查Docker网络配置..."
    local host_networks=$(docker ps --format "table {{.Names}}\t{{.Networks}}" | grep host || true)
    if [ -n "$host_networks" ]; then
        log_warning "发现使用host网络的容器:"
        echo "$host_networks"
        security_issues=$((security_issues + 1))
    else
        log_success "Docker网络配置安全"
    fi
    
    # 检查卷挂载
    log_info "检查危险的卷挂载..."
    local dangerous_mounts=$(docker ps --format "table {{.Names}}\t{{.Mounts}}" | grep -E "(/etc|/var/run/docker.sock|/proc|/sys)" || true)
    if [ -n "$dangerous_mounts" ]; then
        log_warning "发现危险的卷挂载:"
        echo "$dangerous_mounts"
        security_issues=$((security_issues + 1))
    else
        log_success "卷挂载配置安全"
    fi
    
    # 检查镜像安全
    log_info "检查镜像安全..."
    local images=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep -v "<none>")
    echo "$images" | while read image; do
        # 检查是否使用latest标签
        if [[ "$image" == *":latest" ]]; then
            log_warning "镜像使用latest标签: $image"
        fi
        
        # 检查官方镜像
        if [[ "$image" != *"/"* ]] && [[ "$image" != "n8nio/"* ]] && [[ "$image" != "postgres:"* ]] && [[ "$image" != "redis:"* ]]; then
            log_info "使用官方镜像: $image"
        fi
    done
    
    if [ $security_issues -eq 0 ]; then
        log_success "Docker安全检查通过"
    else
        log_warning "Docker安全检查发现 $security_issues 个问题"
    fi
    
    return $security_issues
}

# 网络安全检查
check_network_security() {
    log_header "网络安全检查"
    
    local security_issues=0
    
    # 检查开放端口
    log_info "检查开放端口..."
    local open_ports=$(netstat -an | grep LISTEN | awk '{print $4}' | cut -d: -f2 | sort -n | uniq)
    
    echo "$open_ports" | while read port; do
        case $port in
            5678)
                log_info "N8N服务端口开放: $port"
                ;;
            5432)
                log_warning "PostgreSQL端口对外开放: $port，建议仅内部访问"
                ;;
            6379)
                log_warning "Redis端口对外开放: $port，建议仅内部访问"
                ;;
            22)
                log_info "SSH端口开放: $port"
                ;;
            80|443)
                log_info "HTTP/HTTPS端口开放: $port"
                ;;
            *)
                log_info "其他端口开放: $port"
                ;;
        esac
    done
    
    # 检查防火墙状态
    log_info "检查防火墙状态..."
    if command -v ufw &>/dev/null; then
        local ufw_status=$(ufw status 2>/dev/null | head -1 || echo "inactive")
        if [[ "$ufw_status" == *"inactive"* ]]; then
            log_warning "UFW防火墙未启用"
            security_issues=$((security_issues + 1))
        else
            log_success "UFW防火墙已启用"
        fi
    elif command -v iptables &>/dev/null; then
        local iptables_rules=$(iptables -L 2>/dev/null | wc -l || echo "0")
        if [ "$iptables_rules" -lt 10 ]; then
            log_warning "iptables规则较少，可能未配置防火墙"
            security_issues=$((security_issues + 1))
        else
            log_success "iptables防火墙已配置"
        fi
    else
        log_warning "未检测到防火墙配置"
        security_issues=$((security_issues + 1))
    fi
    
    # 检查SSL/TLS配置
    log_info "检查SSL/TLS配置..."
    if [ -f "config/ssl/cert.pem" ] && [ -f "config/ssl/key.pem" ]; then
        # 检查证书有效期
        local cert_expiry=$(openssl x509 -in config/ssl/cert.pem -noout -enddate 2>/dev/null | cut -d= -f2 || echo "")
        if [ -n "$cert_expiry" ]; then
            local expiry_timestamp=$(date -d "$cert_expiry" +%s 2>/dev/null || echo "0")
            local current_timestamp=$(date +%s)
            local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
            
            if [ $days_until_expiry -lt 30 ]; then
                log_warning "SSL证书将在 $days_until_expiry 天后过期"
                security_issues=$((security_issues + 1))
            else
                log_success "SSL证书有效期正常: $days_until_expiry 天"
            fi
        fi
        
        # 检查证书权限
        local cert_perms=$(stat -f "%A" config/ssl/cert.pem 2>/dev/null || echo "unknown")
        local key_perms=$(stat -f "%A" config/ssl/key.pem 2>/dev/null || echo "unknown")
        
        if [ "$key_perms" != "600" ]; then
            log_warning "SSL私钥权限不安全: $key_perms，建议设置为600"
            security_issues=$((security_issues + 1))
        else
            log_success "SSL私钥权限正常: $key_perms"
        fi
    else
        log_warning "未找到SSL证书文件"
        security_issues=$((security_issues + 1))
    fi
    
    if [ $security_issues -eq 0 ]; then
        log_success "网络安全检查通过"
    else
        log_warning "网络安全检查发现 $security_issues 个问题"
    fi
    
    return $security_issues
}

# 数据库安全检查
check_database_security() {
    log_header "数据库安全检查"
    
    local security_issues=0
    
    # 检查数据库连接
    if ! docker-compose exec -T postgres pg_isready -U n8n_user &>/dev/null; then
        log_error "无法连接到PostgreSQL数据库"
        return 1
    fi
    
    # 检查数据库用户权限
    log_info "检查数据库用户权限..."
    local superusers=$(docker-compose exec -T postgres psql -U n8n_user -d postgres -t -c "SELECT usename FROM pg_user WHERE usesuper = true;" 2>/dev/null | xargs || echo "")
    
    if [[ "$superusers" == *"n8n_user"* ]]; then
        log_warning "n8n_user具有超级用户权限，建议降低权限"
        security_issues=$((security_issues + 1))
    else
        log_success "数据库用户权限配置合理"
    fi
    
    # 检查密码策略
    log_info "检查数据库密码策略..."
    local password_settings=$(docker-compose exec -T postgres psql -U n8n_user -d postgres -t -c "SHOW password_encryption;" 2>/dev/null | xargs || echo "")
    
    if [ "$password_settings" != "scram-sha-256" ]; then
        log_warning "数据库密码加密方式不是最安全的scram-sha-256: $password_settings"
        security_issues=$((security_issues + 1))
    else
        log_success "数据库密码加密配置安全"
    fi
    
    # 检查连接加密
    log_info "检查数据库连接加密..."
    local ssl_settings=$(docker-compose exec -T postgres psql -U n8n_user -d postgres -t -c "SHOW ssl;" 2>/dev/null | xargs || echo "off")
    
    if [ "$ssl_settings" != "on" ]; then
        log_warning "数据库SSL连接未启用"
        security_issues=$((security_issues + 1))
    else
        log_success "数据库SSL连接已启用"
    fi
    
    # 检查审计日志
    log_info "检查数据库审计配置..."
    local log_statement=$(docker-compose exec -T postgres psql -U n8n_user -d postgres -t -c "SHOW log_statement;" 2>/dev/null | xargs || echo "none")
    
    if [ "$log_statement" = "none" ]; then
        log_warning "数据库审计日志未启用"
        security_issues=$((security_issues + 1))
    else
        log_success "数据库审计日志已启用: $log_statement"
    fi
    
    # 检查敏感数据
    log_info "检查敏感数据存储..."
    local sensitive_tables=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%credential%' 
        OR table_name LIKE '%password%' 
        OR table_name LIKE '%secret%';
    " 2>/dev/null | xargs || echo "")
    
    if [ -n "$sensitive_tables" ]; then
        log_info "发现敏感数据表: $sensitive_tables"
        # 检查是否加密存储
        local encrypted_data=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
            SELECT COUNT(*) 
            FROM credentials_entity 
            WHERE data LIKE 'U2FsdGVkX1%';
        " 2>/dev/null | xargs || echo "0")
        
        if [ "$encrypted_data" -gt 0 ]; then
            log_success "敏感数据已加密存储"
        else
            log_warning "敏感数据可能未加密存储"
            security_issues=$((security_issues + 1))
        fi
    fi
    
    if [ $security_issues -eq 0 ]; then
        log_success "数据库安全检查通过"
    else
        log_warning "数据库安全检查发现 $security_issues 个问题"
    fi
    
    return $security_issues
}

# 文件系统安全检查
check_filesystem_security() {
    log_header "文件系统安全检查"
    
    local security_issues=0
    
    # 检查关键文件权限
    log_info "检查关键文件权限..."
    
    local critical_files=(
        ".env:600"
        "docker-compose.yml:644"
        "config/init-scripts/*.sql:644"
        "scripts/*.sh:755"
    )
    
    for file_pattern in "${critical_files[@]}"; do
        local file_path=$(echo "$file_pattern" | cut -d: -f1)
        local expected_perm=$(echo "$file_pattern" | cut -d: -f2)
        
        for file in $file_path; do
            if [ -f "$file" ]; then
                local actual_perm=$(stat -f "%A" "$file" 2>/dev/null || echo "unknown")
                if [ "$actual_perm" != "$expected_perm" ]; then
                    log_warning "$file 权限不正确: $actual_perm，期望: $expected_perm"
                    security_issues=$((security_issues + 1))
                else
                    log_success "$file 权限正确: $actual_perm"
                fi
            fi
        done
    done
    
    # 检查敏感目录权限
    log_info "检查敏感目录权限..."
    
    local sensitive_dirs=("data" "logs" "backups" "config")
    
    for dir in "${sensitive_dirs[@]}"; do
        if [ -d "$dir" ]; then
            local dir_perm=$(stat -f "%A" "$dir" 2>/dev/null || echo "unknown")
            local owner=$(stat -f "%Su" "$dir" 2>/dev/null || echo "unknown")
            
            log_info "$dir 目录权限: $dir_perm，所有者: $owner"
            
            # 检查是否有全局写权限
            if [[ "$dir_perm" == *"2" ]] || [[ "$dir_perm" == *"6" ]] || [[ "$dir_perm" == *"7" ]]; then
                log_warning "$dir 目录具有全局写权限: $dir_perm"
                security_issues=$((security_issues + 1))
            fi
        fi
    done
    
    # 检查备份文件安全
    log_info "检查备份文件安全..."
    
    if [ -d "backups" ]; then
        local backup_files=$(find backups -name "*.tar.gz" -o -name "*.sql" -o -name "*.dump" 2>/dev/null || true)
        
        if [ -n "$backup_files" ]; then
            echo "$backup_files" | while read backup_file; do
                local backup_perm=$(stat -f "%A" "$backup_file" 2>/dev/null || echo "unknown")
                if [ "$backup_perm" != "600" ] && [ "$backup_perm" != "640" ]; then
                    log_warning "备份文件权限不安全: $backup_file ($backup_perm)"
                fi
            done
        fi
    fi
    
    # 检查临时文件
    log_info "检查临时文件安全..."
    
    local temp_dirs=("tmp" "temp" "/tmp" "data/temp")
    
    for temp_dir in "${temp_dirs[@]}"; do
        if [ -d "$temp_dir" ]; then
            local temp_files=$(find "$temp_dir" -type f -name "*" 2>/dev/null | head -10 || true)
            if [ -n "$temp_files" ]; then
                log_info "发现临时文件在 $temp_dir:"
                echo "$temp_files" | while read temp_file; do
                    local file_age=$(find "$temp_file" -mtime +1 2>/dev/null || true)
                    if [ -n "$file_age" ]; then
                        log_warning "发现过期临时文件: $temp_file"
                    fi
                done
            fi
        fi
    done
    
    if [ $security_issues -eq 0 ]; then
        log_success "文件系统安全检查通过"
    else
        log_warning "文件系统安全检查发现 $security_issues 个问题"
    fi
    
    return $security_issues
}

# 应用安全检查
check_application_security() {
    log_header "应用安全检查"
    
    local security_issues=0
    
    # 检查N8N安全配置
    log_info "检查N8N安全配置..."
    
    # 检查是否启用了安全头
    if docker-compose exec -T n8n curl -s -I http://localhost:5678 2>/dev/null | grep -i "x-frame-options\|x-content-type-options\|x-xss-protection" &>/dev/null; then
        log_success "N8N安全头配置正常"
    else
        log_warning "N8N缺少安全头配置"
        security_issues=$((security_issues + 1))
    fi
    
    # 检查认证配置
    if grep -q "N8N_BASIC_AUTH_ACTIVE=true" .env 2>/dev/null; then
        log_success "N8N基础认证已启用"
    else
        log_warning "N8N基础认证未启用"
        security_issues=$((security_issues + 1))
    fi
    
    # 检查HTTPS配置
    if grep -q "N8N_PROTOCOL=https" .env 2>/dev/null; then
        log_success "N8N HTTPS协议已启用"
    else
        log_warning "N8N未启用HTTPS协议"
        security_issues=$((security_issues + 1))
    fi
    
    # 检查工作流安全
    log_info "检查工作流安全配置..."
    
    # 检查是否禁用了不安全的节点
    local dangerous_nodes=("ExecuteCommand" "Function" "FunctionItem")
    for node in "${dangerous_nodes[@]}"; do
        if docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
            SELECT COUNT(*) 
            FROM workflow_entity 
            WHERE nodes::text LIKE '%\"type\":\"$node\"%';
        " 2>/dev/null | xargs | grep -v "^0$" &>/dev/null; then
            log_warning "发现使用危险节点 $node 的工作流"
            security_issues=$((security_issues + 1))
        fi
    done
    
    # 检查凭据安全
    log_info "检查凭据安全..."
    
    local credential_count=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
        SELECT COUNT(*) FROM credentials_entity;
    " 2>/dev/null | xargs || echo "0")
    
    if [ "$credential_count" -gt 0 ]; then
        log_info "发现 $credential_count 个凭据"
        
        # 检查凭据加密
        local encrypted_credentials=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
            SELECT COUNT(*) 
            FROM credentials_entity 
            WHERE data LIKE 'U2FsdGVkX1%';
        " 2>/dev/null | xargs || echo "0")
        
        if [ "$encrypted_credentials" -eq "$credential_count" ]; then
            log_success "所有凭据已加密存储"
        else
            log_critical "发现未加密的凭据"
            security_issues=$((security_issues + 1))
        fi
    fi
    
    # 检查会话安全
    log_info "检查会话安全..."
    
    if grep -q "N8N_SESSION_TIMEOUT" .env 2>/dev/null; then
        local session_timeout=$(grep "N8N_SESSION_TIMEOUT" .env | cut -d= -f2)
        if [ "$session_timeout" -gt 3600 ]; then
            log_warning "会话超时时间过长: ${session_timeout}秒"
            security_issues=$((security_issues + 1))
        else
            log_success "会话超时配置合理: ${session_timeout}秒"
        fi
    else
        log_warning "未配置会话超时"
        security_issues=$((security_issues + 1))
    fi
    
    if [ $security_issues -eq 0 ]; then
        log_success "应用安全检查通过"
    else
        log_warning "应用安全检查发现 $security_issues 个问题"
    fi
    
    return $security_issues
}

# 安全加固
security_hardening() {
    log_header "执行安全加固"
    
    local hardening_applied=0
    
    # 修复文件权限
    log_info "修复文件权限..."
    
    if [ -f ".env" ]; then
        chmod 600 .env
        log_success "已修复.env文件权限"
        hardening_applied=$((hardening_applied + 1))
    fi
    
    if [ -f "docker-compose.yml" ]; then
        chmod 644 docker-compose.yml
        log_success "已修复docker-compose.yml文件权限"
        hardening_applied=$((hardening_applied + 1))
    fi
    
    # 修复脚本权限
    if [ -d "scripts" ]; then
        find scripts -name "*.sh" -exec chmod 755 {} \;
        log_success "已修复脚本文件权限"
        hardening_applied=$((hardening_applied + 1))
    fi
    
    # 修复敏感目录权限
    local sensitive_dirs=("data" "logs" "backups" "config")
    for dir in "${sensitive_dirs[@]}"; do
        if [ -d "$dir" ]; then
            chmod 750 "$dir"
            log_success "已修复 $dir 目录权限"
            hardening_applied=$((hardening_applied + 1))
        fi
    done
    
    # 生成强密码
    log_info "生成安全配置..."
    
    # 生成新的加密密钥
    local new_encryption_key=$(openssl rand -base64 32)
    log_info "新的加密密钥已生成（请手动更新.env文件）"
    
    # 生成JWT密钥
    local new_jwt_secret=$(openssl rand -base64 64)
    log_info "新的JWT密钥已生成（请手动更新.env文件）"
    
    # 创建安全配置备份
    log_info "创建安全配置备份..."
    
    if [ -f ".env" ]; then
        cp .env "$BACKUP_DIR/env-backup-$(date +%Y%m%d_%H%M%S)"
        log_success "已备份环境配置文件"
        hardening_applied=$((hardening_applied + 1))
    fi
    
    # 清理临时文件
    log_info "清理临时文件..."
    
    local temp_dirs=("tmp" "temp" "data/temp")
    for temp_dir in "${temp_dirs[@]}"; do
        if [ -d "$temp_dir" ]; then
            find "$temp_dir" -type f -mtime +0 -delete 2>/dev/null || true
            log_success "已清理 $temp_dir 目录"
            hardening_applied=$((hardening_applied + 1))
        fi
    done
    
    # 设置安全的Docker配置
    log_info "优化Docker安全配置..."
    
    # 创建安全的docker-compose覆盖文件
    if [ ! -f "docker-compose.security.yml" ]; then
        cat > docker-compose.security.yml << 'EOF'
version: '3.8'

services:
  n8n:
    security_opt:
      - no-new-privileges:true
    read_only: false
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - DAC_OVERRIDE
      - FOWNER
      - SETGID
      - SETUID
    
  postgres:
    security_opt:
      - no-new-privileges:true
    read_only: false
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - DAC_OVERRIDE
      - FOWNER
      - SETGID
      - SETUID
    
  redis:
    security_opt:
      - no-new-privileges:true
    read_only: false
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - DAC_OVERRIDE
      - FOWNER
      - SETGID
      - SETUID
EOF
        log_success "已创建Docker安全配置文件"
        hardening_applied=$((hardening_applied + 1))
    fi
    
    log_success "安全加固完成，应用了 $hardening_applied 项加固措施"
}

# 生成安全报告
generate_security_report() {
    log_header "生成安全报告"
    
    local total_issues=0
    local report_sections=""
    
    # 执行所有安全检查并收集结果
    log_info "执行完整安全检查..."
    
    # 环境变量安全检查
    check_environment_security
    local env_issues=$?
    total_issues=$((total_issues + env_issues))
    
    # Docker安全检查
    check_docker_security
    local docker_issues=$?
    total_issues=$((total_issues + docker_issues))
    
    # 网络安全检查
    check_network_security
    local network_issues=$?
    total_issues=$((total_issues + network_issues))
    
    # 数据库安全检查
    check_database_security
    local db_issues=$?
    total_issues=$((total_issues + db_issues))
    
    # 文件系统安全检查
    check_filesystem_security
    local fs_issues=$?
    total_issues=$((total_issues + fs_issues))
    
    # 应用安全检查
    check_application_security
    local app_issues=$?
    total_issues=$((total_issues + app_issues))
    
    # 生成HTML报告
    cat > "$SECURITY_REPORT" << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>N8N系统安全报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; border-bottom: 2px solid #dc3545; padding-bottom: 10px; margin-bottom: 20px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-item { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 4px; min-width: 120px; }
        .summary-item.critical { border-left: 4px solid #dc3545; }
        .summary-item.warning { border-left: 4px solid #ffc107; }
        .summary-item.success { border-left: 4px solid #28a745; }
        .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }
        .section.critical { border-left: 4px solid #dc3545; }
        .section.warning { border-left: 4px solid #ffc107; }
        .section.success { border-left: 4px solid #28a745; }
        .section.info { border-left: 4px solid #007bff; }
        .issue-list { list-style-type: none; padding: 0; }
        .issue-list li { padding: 8px; margin: 5px 0; border-radius: 4px; }
        .issue-critical { background-color: #f8d7da; color: #721c24; }
        .issue-warning { background-color: #fff3cd; color: #856404; }
        .issue-success { background-color: #d4edda; color: #155724; }
        .recommendations { background: #e7f3ff; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .timestamp { text-align: center; color: #6c757d; margin-top: 20px; }
        .score { font-size: 2em; font-weight: bold; }
        .score.high { color: #28a745; }
        .score.medium { color: #ffc107; }
        .score.low { color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>N8N企业级自动化工作流平台安全报告</h1>
            <p>安全检查执行时间: $(date '+%Y-%m-%d %H:%M:%S')</p>
        </div>
        
        <div class="summary">
            <div class="summary-item $([ $total_issues -eq 0 ] && echo "success" || ([ $total_issues -lt 5 ] && echo "warning" || echo "critical"))">
                <div class="score $([ $total_issues -eq 0 ] && echo "high" || ([ $total_issues -lt 5 ] && echo "medium" || echo "low"))">
                    $([ $total_issues -eq 0 ] && echo "100" || echo $((100 - total_issues * 5)))
                </div>
                <div>安全评分</div>
            </div>
            <div class="summary-item critical">
                <div class="score">$total_issues</div>
                <div>发现问题</div>
            </div>
            <div class="summary-item info">
                <div class="score">6</div>
                <div>检查项目</div>
            </div>
        </div>
        
        <div class="section $([ $env_issues -eq 0 ] && echo "success" || echo "warning")">
            <h3>环境变量安全检查</h3>
            <p>检查结果: $([ $env_issues -eq 0 ] && echo "通过" || echo "发现 $env_issues 个问题")</p>
            <ul class="issue-list">
                <li class="$([ $env_issues -eq 0 ] && echo "issue-success" || echo "issue-warning")">
                    $([ $env_issues -eq 0 ] && echo "✓ 环境变量配置安全" || echo "⚠ 环境变量存在安全风险")
                </li>
            </ul>
        </div>
        
        <div class="section $([ $docker_issues -eq 0 ] && echo "success" || echo "warning")">
            <h3>Docker安全检查</h3>
            <p>检查结果: $([ $docker_issues -eq 0 ] && echo "通过" || echo "发现 $docker_issues 个问题")</p>
            <ul class="issue-list">
                <li class="$([ $docker_issues -eq 0 ] && echo "issue-success" || echo "issue-warning")">
                    $([ $docker_issues -eq 0 ] && echo "✓ Docker配置安全" || echo "⚠ Docker配置存在安全风险")
                </li>
            </ul>
        </div>
        
        <div class="section $([ $network_issues -eq 0 ] && echo "success" || echo "warning")">
            <h3>网络安全检查</h3>
            <p>检查结果: $([ $network_issues -eq 0 ] && echo "通过" || echo "发现 $network_issues 个问题")</p>
            <ul class="issue-list">
                <li class="$([ $network_issues -eq 0 ] && echo "issue-success" || echo "issue-warning")">
                    $([ $network_issues -eq 0 ] && echo "✓ 网络配置安全" || echo "⚠ 网络配置存在安全风险")
                </li>
            </ul>
        </div>
        
        <div class="section $([ $db_issues -eq 0 ] && echo "success" || echo "warning")">
            <h3>数据库安全检查</h3>
            <p>检查结果: $([ $db_issues -eq 0 ] && echo "通过" || echo "发现 $db_issues 个问题")</p>
            <ul class="issue-list">
                <li class="$([ $db_issues -eq 0 ] && echo "issue-success" || echo "issue-warning")">
                    $([ $db_issues -eq 0 ] && echo "✓ 数据库配置安全" || echo "⚠ 数据库配置存在安全风险")
                </li>
            </ul>
        </div>
        
        <div class="section $([ $fs_issues -eq 0 ] && echo "success" || echo "warning")">
            <h3>文件系统安全检查</h3>
            <p>检查结果: $([ $fs_issues -eq 0 ] && echo "通过" || echo "发现 $fs_issues 个问题")</p>
            <ul class="issue-list">
                <li class="$([ $fs_issues -eq 0 ] && echo "issue-success" || echo "issue-warning")">
                    $([ $fs_issues -eq 0 ] && echo "✓ 文件系统配置安全" || echo "⚠ 文件系统存在安全风险")
                </li>
            </ul>
        </div>
        
        <div class="section $([ $app_issues -eq 0 ] && echo "success" || echo "warning")">
            <h3>应用安全检查</h3>
            <p>检查结果: $([ $app_issues -eq 0 ] && echo "通过" || echo "发现 $app_issues 个问题")</p>
            <ul class="issue-list">
                <li class="$([ $app_issues -eq 0 ] && echo "issue-success" || echo "issue-warning")">
                    $([ $app_issues -eq 0 ] && echo "✓ 应用配置安全" || echo "⚠ 应用配置存在安全风险")
                </li>
            </ul>
        </div>
        
        <div class="recommendations">
            <h3>安全建议</h3>
            <ul>
                <li>定期执行安全检查（建议每周一次）</li>
                <li>及时更新系统和依赖组件</li>
                <li>使用强密码和定期轮换密钥</li>
                <li>启用所有安全功能和加密</li>
                <li>监控系统日志和异常活动</li>
                <li>定期备份重要数据</li>
                <li>实施最小权限原则</li>
                <li>配置防火墙和网络安全</li>
            </ul>
        </div>
        
        <div class="timestamp">
            报告生成时间: <span id="report-time">--</span>
        </div>
    </div>
    
    <script>
        document.getElementById('report-time').textContent = new Date().toLocaleString('zh-CN');
    </script>
</body>
</html>
EOF
    
    log_success "安全报告已生成: $SECURITY_REPORT"
    
    # 显示总结
    if [ $total_issues -eq 0 ]; then
        log_success "安全检查完成，未发现安全问题"
    else
        log_warning "安全检查完成，发现 $total_issues 个安全问题，请查看详细报告"
    fi
}

# 完整安全审计
full_security_audit() {
    log_header "开始完整安全审计"
    
    local start_time=$(date +%s)
    
    # 执行所有安全检查
    check_environment_security
    check_docker_security
    check_network_security
    check_database_security
    check_filesystem_security
    check_application_security
    
    # 生成安全报告
    generate_security_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "完整安全审计完成，耗时: ${duration}秒"
}

# 快速安全检查
quick_security_check() {
    log_header "开始快速安全检查"
    
    # 只执行关键安全检查
    check_environment_security
    check_docker_security
    check_filesystem_security
    
    log_success "快速安全检查完成"
}

# 显示使用帮助
show_help() {
    echo "N8N企业级自动化工作流平台安全检查和加固脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  audit                   执行完整安全审计"
    echo "  quick                   执行快速安全检查"
    echo "  env                     检查环境变量安全"
    echo "  docker                  检查Docker安全"
    echo "  network                 检查网络安全"
    echo "  database                检查数据库安全"
    echo "  filesystem              检查文件系统安全"
    echo "  application             检查应用安全"
    echo "  harden                  执行安全加固"
    echo "  report                  生成安全报告"
    echo ""
    echo "示例:"
    echo "  $0 audit                # 执行完整安全审计"
    echo "  $0 quick                # 执行快速安全检查"
    echo "  $0 env                  # 只检查环境变量安全"
    echo "  $0 docker               # 只检查Docker安全"
    echo "  $0 harden               # 执行安全加固"
    echo "  $0 report               # 生成安全报告"
    echo ""
    echo "安全等级:"
    echo "  CRITICAL - 严重安全问题，需要立即处理"
    echo "  WARNING  - 安全风险，建议尽快处理"
    echo "  INFO     - 信息提示，建议关注"
    echo "  SUCCESS  - 安全检查通过"
    echo ""
    echo "建议:"
    echo "  - 在生产环境部署前执行完整安全审计"
    echo "  - 定期执行安全检查（建议每周一次）"
    echo "  - 发现安全问题后及时执行安全加固"
    echo "  - 保存安全报告用于合规审计"
    echo ""
}

# 主函数
main() {
    # 创建安全目录
    create_security_directories
    
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    local command="$1"
    shift
    
    case $command in
        "audit")
            full_security_audit
            ;;
        "quick")
            quick_security_check
            ;;
        "env")
            check_environment_security
            ;;
        "docker")
            check_docker_security
            ;;
        "network")
            check_network_security
            ;;
        "database")
            check_database_security
            ;;
        "filesystem")
            check_filesystem_security
            ;;
        "application")
            check_application_security
            ;;
        "harden")
            security_hardening
            ;;
        "report")
            generate_security_report
            ;;
        "-h"|"--help"|"help")
            show_help
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