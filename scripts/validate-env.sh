#!/bin/bash

# N8N 环境变量验证脚本
# 用于验证所有必需的环境变量是否正确配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 检查.env文件是否存在
check_env_file() {
    if [ ! -f ".env" ]; then
        log_error ".env 文件不存在！请复制 .env.example 并配置相应的值。"
        exit 1
    fi
    log_success ".env 文件存在"
}

# 加载环境变量
load_env() {
    log_info "加载环境变量..."
    set -a
    source .env
    set +a
    log_success "环境变量加载完成"
}

# 验证必需的环境变量
validate_required_vars() {
    log_info "验证必需的环境变量..."
    
    local required_vars=(
        "N8N_BASIC_AUTH_USER"
        "N8N_BASIC_AUTH_PASSWORD"
        "N8N_ENCRYPTION_KEY"
        "N8N_API_KEY"
        "POSTGRES_PASSWORD"
        "POSTGRES_NON_ROOT_PASSWORD"
        "REDIS_PASSWORD"
        "OPENAI_API_KEY"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        var_value="${!var}"
        var_lower=$(echo "$var" | tr '[:upper:]' '[:lower:]')
        if [ -z "$var_value" ] || [ "$var_value" = "your-$var_lower-here" ] || [ "$var_value" = "your-$var_lower" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "以下必需的环境变量未配置或使用默认值："
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        return 1
    fi
    
    log_success "所有必需的环境变量已配置"
}

# 验证密码一致性
validate_password_consistency() {
    log_info "验证密码配置一致性..."
    
    # 检查PostgreSQL密码是否一致
    if [ "$POSTGRES_PASSWORD" != "$POSTGRES_NON_ROOT_PASSWORD" ]; then
        log_warning "PostgreSQL管理员密码和非root用户密码不一致，这可能导致连接问题"
    else
        log_success "PostgreSQL密码配置一致"
    fi
    
    # 检查Redis密码配置
    if [ -n "$REDIS_PASSWORD" ]; then
        log_success "Redis密码已配置"
    else
        log_error "Redis密码未配置"
        return 1
    fi
}

# 验证API密钥格式
validate_api_keys() {
    log_info "验证API密钥格式..."
    
    # 验证OpenAI API密钥格式
    if [[ "$OPENAI_API_KEY" =~ ^sk-proj-[A-Za-z0-9]{48,}$ ]]; then
        log_success "OpenAI API密钥格式正确"
    else
        log_warning "OpenAI API密钥格式可能不正确"
    fi
    
    # 验证N8N API密钥
    if [ "$N8N_API_KEY" = "your-n8n-api-key-here" ]; then
        log_warning "N8N API密钥使用默认值，请配置实际的API密钥"
    else
        log_success "N8N API密钥已配置"
    fi
}

# 验证加密密钥长度
validate_encryption_keys() {
    log_info "验证加密密钥长度..."
    
    # 验证N8N加密密钥长度
    if [ ${#N8N_ENCRYPTION_KEY} -ge 32 ]; then
        log_success "N8N加密密钥长度符合要求"
    else
        log_error "N8N加密密钥长度不足32位"
        return 1
    fi
    
    # 验证JWT密钥
    if [ ${#N8N_USER_MANAGEMENT_JWT_SECRET} -ge 16 ]; then
        log_success "JWT密钥长度符合要求"
    else
        log_error "JWT密钥长度不足"
        return 1
    fi
}

# 测试数据库连接
test_database_connection() {
    log_info "测试数据库连接..."
    
    # 检查PostgreSQL容器是否运行
    if docker ps | grep -q "n8n-postgres"; then
        log_success "PostgreSQL容器正在运行"
        
        # 测试连接
        if docker exec n8n-postgres pg_isready -U "${POSTGRES_USER:-n8n}" -d "${POSTGRES_DB:-n8n}" >/dev/null 2>&1; then
            log_success "PostgreSQL连接测试成功"
        else
            log_error "PostgreSQL连接测试失败"
            return 1
        fi
    else
        log_warning "PostgreSQL容器未运行，跳过连接测试"
    fi
}

# 测试Redis连接
test_redis_connection() {
    log_info "测试Redis连接..."
    
    # 检查Redis容器是否运行
    if docker ps | grep -q "n8n-redis"; then
        log_success "Redis容器正在运行"
        
        # 测试连接
        if docker exec n8n-redis redis-cli -a "$REDIS_PASSWORD" ping >/dev/null 2>&1; then
            log_success "Redis连接测试成功"
        else
            log_error "Redis连接测试失败"
            return 1
        fi
    else
        log_warning "Redis容器未运行，跳过连接测试"
    fi
}

# 生成配置报告
generate_report() {
    log_info "生成配置报告..."
    
    cat > config-report.txt << EOF
N8N 环境配置报告
生成时间: $(date)

=== 基础配置 ===
域名: ${DOMAIN_NAME}
子域名: ${SUBDOMAIN}
协议: ${N8N_PROTOCOL}

=== 认证配置 ===
基础认证用户: ${N8N_BASIC_AUTH_USER}
基础认证密码: [已配置]
加密密钥长度: ${#N8N_ENCRYPTION_KEY} 位
JWT密钥长度: ${#N8N_USER_MANAGEMENT_JWT_SECRET} 位

=== 数据库配置 ===
PostgreSQL用户: ${POSTGRES_USER:-n8n}
PostgreSQL数据库: ${POSTGRES_DB:-n8n}
PostgreSQL密码: [已配置]

=== Redis配置 ===
Redis密码: [已配置]

=== AI配置 ===
OpenAI模型: ${OPENAI_MODEL}
最大令牌数: ${OPENAI_MAX_TOKENS}
温度参数: ${OPENAI_TEMPERATURE}

=== API配置 ===
API主机: ${API_HOST}
API端口: ${API_PORT}
工作进程数: ${API_WORKERS}

EOF
    
    log_success "配置报告已生成: config-report.txt"
}

# 主函数
main() {
    echo "========================================"
    echo "    N8N 环境变量验证脚本"
    echo "========================================"
    echo
    
    local exit_code=0
    
    # 执行所有检查
    check_env_file || exit_code=1
    load_env || exit_code=1
    validate_required_vars || exit_code=1
    validate_password_consistency || exit_code=1
    validate_api_keys || exit_code=1
    validate_encryption_keys || exit_code=1
    test_database_connection || exit_code=1
    test_redis_connection || exit_code=1
    
    # 生成报告
    generate_report
    
    echo
    echo "========================================"
    if [ $exit_code -eq 0 ]; then
        log_success "所有验证通过！环境配置正确。"
    else
        log_error "验证失败！请检查上述错误并修复。"
    fi
    echo "========================================"
    
    exit $exit_code
}

# 运行主函数
main "$@"