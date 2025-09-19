#!/bin/bash

# N8N企业级自动化工作流平台 - 健康检查脚本
# 提供系统和服务的全面健康状态检查

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
HEALTH_LOG="logs/health.log"
TEMP_DIR="/tmp/n8n_health_$$"

# 健康检查配置
TIMEOUT_SECONDS=30
MAX_RETRIES=3
RETRY_DELAY=5

# 检查结果统计
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# 日志函数
log_info() {
    local message="$1"
    echo -e "${BLUE}[INFO]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $message" >> "$HEALTH_LOG"
}

log_success() {
    local message="$1"
    echo -e "${GREEN}[SUCCESS]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $message" >> "$HEALTH_LOG"
    ((PASSED_CHECKS++))
}

log_warning() {
    local message="$1"
    echo -e "${YELLOW}[WARNING]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $message" >> "$HEALTH_LOG"
    ((WARNING_CHECKS++))
}

log_error() {
    local message="$1"
    echo -e "${RED}[ERROR]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $message" >> "$HEALTH_LOG"
    ((FAILED_CHECKS++))
}

log_header() {
    local message="$1"
    echo ""
    echo -e "${CYAN}=== $message ===${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [HEADER] $message" >> "$HEALTH_LOG"
}

# 创建必要目录
create_directories() {
    mkdir -p logs "$TEMP_DIR"
}

# 清理临时文件
cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}

# 设置清理陷阱
trap cleanup EXIT

# 增加检查计数
increment_check() {
    ((TOTAL_CHECKS++))
}

# 执行命令并检查结果
execute_check() {
    local description="$1"
    local command="$2"
    local expected_result="$3"
    local retry_count=0
    
    increment_check
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        if timeout $TIMEOUT_SECONDS bash -c "$command" &>/dev/null; then
            if [ -n "$expected_result" ]; then
                local result=$(timeout $TIMEOUT_SECONDS bash -c "$command" 2>/dev/null || echo "")
                if [[ "$result" == *"$expected_result"* ]]; then
                    log_success "$description"
                    return 0
                else
                    log_error "$description - 结果不匹配: $result"
                    return 1
                fi
            else
                log_success "$description"
                return 0
            fi
        else
            ((retry_count++))
            if [ $retry_count -lt $MAX_RETRIES ]; then
                log_warning "$description - 重试 $retry_count/$MAX_RETRIES"
                sleep $RETRY_DELAY
            else
                log_error "$description - 检查失败"
                return 1
            fi
        fi
    done
}

# 检查系统要求
check_system_requirements() {
    log_header "系统要求检查"
    
    # 检查操作系统
    increment_check
    local os_info=$(uname -s)
    case "$os_info" in
        "Darwin")
            log_success "操作系统: macOS"
            ;;
        "Linux")
            log_success "操作系统: Linux"
            ;;
        *)
            log_warning "操作系统: $os_info (未完全测试)"
            ;;
    esac
    
    # 检查系统架构
    increment_check
    local arch_info=$(uname -m)
    case "$arch_info" in
        "x86_64"|"amd64")
            log_success "系统架构: x86_64"
            ;;
        "arm64"|"aarch64")
            log_success "系统架构: ARM64"
            ;;
        *)
            log_warning "系统架构: $arch_info (可能不兼容)"
            ;;
    esac
    
    # 检查内存
    increment_check
    local memory_gb=0
    if command -v free &>/dev/null; then
        memory_gb=$(free -g | awk '/^Mem:/{print $2}')
    elif command -v vm_stat &>/dev/null; then
        local memory_bytes=$(sysctl -n hw.memsize 2>/dev/null || echo "0")
        memory_gb=$((memory_bytes / 1024 / 1024 / 1024))
    fi
    
    if [ "$memory_gb" -ge 4 ]; then
        log_success "系统内存: ${memory_gb}GB (充足)"
    elif [ "$memory_gb" -ge 2 ]; then
        log_warning "系统内存: ${memory_gb}GB (最低要求)"
    else
        log_error "系统内存: ${memory_gb}GB (不足，建议至少2GB)"
    fi
    
    # 检查磁盘空间
    increment_check
    local disk_available
    if command -v df &>/dev/null; then
        disk_available=$(df -BG "$PROJECT_ROOT" | awk 'NR==2 {print $4}' | sed 's/G//')
        if [ "$disk_available" -ge 10 ]; then
            log_success "磁盘空间: ${disk_available}GB (充足)"
        elif [ "$disk_available" -ge 5 ]; then
            log_warning "磁盘空间: ${disk_available}GB (建议至少10GB)"
        else
            log_error "磁盘空间: ${disk_available}GB (不足，建议至少5GB)"
        fi
    else
        log_warning "无法检查磁盘空间"
    fi
}

# 检查必需工具
check_required_tools() {
    log_header "必需工具检查"
    
    local tools=(
        "docker:Docker容器引擎"
        "docker-compose:Docker Compose编排工具"
        "curl:HTTP客户端工具"
        "jq:JSON处理工具"
        "git:版本控制工具"
    )
    
    for tool_info in "${tools[@]}"; do
        local tool=$(echo "$tool_info" | cut -d':' -f1)
        local description=$(echo "$tool_info" | cut -d':' -f2)
        
        increment_check
        if command -v "$tool" &>/dev/null; then
            local version=""
            case "$tool" in
                "docker")
                    version=$(docker --version 2>/dev/null | cut -d' ' -f3 | sed 's/,//' || echo "未知")
                    ;;
                "docker-compose")
                    version=$(docker-compose --version 2>/dev/null | cut -d' ' -f3 | sed 's/,//' || echo "未知")
                    ;;
                "curl")
                    version=$(curl --version 2>/dev/null | head -n1 | cut -d' ' -f2 || echo "未知")
                    ;;
                "jq")
                    version=$(jq --version 2>/dev/null | sed 's/jq-//' || echo "未知")
                    ;;
                "git")
                    version=$(git --version 2>/dev/null | cut -d' ' -f3 || echo "未知")
                    ;;
            esac
            log_success "$description: $version"
        else
            log_error "$description: 未安装"
        fi
    done
}

# 检查Docker环境
check_docker_environment() {
    log_header "Docker环境检查"
    
    # 检查Docker守护进程
    execute_check "Docker守护进程运行状态" "docker info" ""
    
    # 检查Docker版本
    increment_check
    if command -v docker &>/dev/null; then
        local docker_version=$(docker --version 2>/dev/null | cut -d' ' -f3 | sed 's/,//' || echo "未知")
        local major_version=$(echo "$docker_version" | cut -d'.' -f1)
        
        if [ "$major_version" -ge 20 ]; then
            log_success "Docker版本: $docker_version (推荐)"
        elif [ "$major_version" -ge 18 ]; then
            log_warning "Docker版本: $docker_version (可用，建议升级)"
        else
            log_error "Docker版本: $docker_version (过旧，建议升级到20+)"
        fi
    else
        log_error "Docker版本: 无法获取"
    fi
    
    # 检查Docker Compose版本
    increment_check
    if command -v docker-compose &>/dev/null; then
        local compose_version=$(docker-compose --version 2>/dev/null | cut -d' ' -f3 | sed 's/,//' || echo "未知")
        local major_version=$(echo "$compose_version" | cut -d'.' -f1)
        
        if [ "$major_version" -ge 2 ]; then
            log_success "Docker Compose版本: $compose_version (推荐)"
        elif [ "$major_version" -ge 1 ]; then
            local minor_version=$(echo "$compose_version" | cut -d'.' -f2)
            if [ "$minor_version" -ge 25 ]; then
                log_success "Docker Compose版本: $compose_version (可用)"
            else
                log_warning "Docker Compose版本: $compose_version (建议升级)"
            fi
        else
            log_error "Docker Compose版本: $compose_version (过旧)"
        fi
    else
        log_error "Docker Compose版本: 无法获取"
    fi
    
    # 检查Docker网络
    execute_check "Docker网络功能" "docker network ls" "bridge"
    
    # 检查Docker存储
    increment_check
    if docker system df &>/dev/null; then
        local docker_space=$(docker system df --format "table {{.Type}}\t{{.Size}}" | grep "Images" | awk '{print $2}' || echo "未知")
        log_success "Docker存储使用: $docker_space"
    else
        log_warning "无法获取Docker存储信息"
    fi
}

# 检查项目配置
check_project_configuration() {
    log_header "项目配置检查"
    
    # 检查项目目录结构
    local required_dirs=(
        "scripts:脚本目录"
        "config:配置目录"
        "data:数据目录"
        "logs:日志目录"
    )
    
    for dir_info in "${required_dirs[@]}"; do
        local dir=$(echo "$dir_info" | cut -d':' -f1)
        local description=$(echo "$dir_info" | cut -d':' -f2)
        
        increment_check
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            log_success "$description: 存在"
        else
            log_warning "$description: 不存在 (将自动创建)"
        fi
    done
    
    # 检查配置文件
    local config_files=(
        "docker-compose.yml:Docker Compose配置"
        ".env:环境变量配置"
        "config/nginx.conf:Nginx配置"
    )
    
    for file_info in "${config_files[@]}"; do
        local file=$(echo "$file_info" | cut -d':' -f1)
        local description=$(echo "$file_info" | cut -d':' -f2)
        
        increment_check
        if [ -f "$PROJECT_ROOT/$file" ]; then
            log_success "$description: 存在"
        else
            log_error "$description: 缺失"
        fi
    done
    
    # 检查环境变量
    if [ -f "$PROJECT_ROOT/.env" ]; then
        local required_vars=(
            "N8N_BASIC_AUTH_ACTIVE"
            "N8N_BASIC_AUTH_USER"
            "N8N_BASIC_AUTH_PASSWORD"
            "POSTGRES_USER"
            "POSTGRES_PASSWORD"
            "POSTGRES_DB"
        )
        
        for var in "${required_vars[@]}"; do
            increment_check
            if grep -q "^$var=" "$PROJECT_ROOT/.env" 2>/dev/null; then
                local value=$(grep "^$var=" "$PROJECT_ROOT/.env" | cut -d'=' -f2)
                if [ -n "$value" ]; then
                    log_success "环境变量 $var: 已配置"
                else
                    log_warning "环境变量 $var: 值为空"
                fi
            else
                log_error "环境变量 $var: 未配置"
            fi
        done
    fi
}

# 检查网络连接
check_network_connectivity() {
    log_header "网络连接检查"
    
    # 检查互联网连接
    execute_check "互联网连接" "curl -s --connect-timeout 10 https://www.google.com" ""
    
    # 检查Docker Hub连接
    execute_check "Docker Hub连接" "curl -s --connect-timeout 10 https://hub.docker.com" ""
    
    # 检查本地端口可用性
    local ports=(
        "5678:N8N Web界面端口"
        "5432:PostgreSQL数据库端口"
        "6379:Redis缓存端口"
        "80:Nginx HTTP端口"
        "443:Nginx HTTPS端口"
    )
    
    for port_info in "${ports[@]}"; do
        local port=$(echo "$port_info" | cut -d':' -f1)
        local description=$(echo "$port_info" | cut -d':' -f2)
        
        increment_check
        if command -v netstat &>/dev/null; then
            if netstat -an | grep -q ":$port.*LISTEN"; then
                log_warning "$description ($port): 端口已被占用"
            else
                log_success "$description ($port): 端口可用"
            fi
        elif command -v lsof &>/dev/null; then
            if lsof -i ":$port" &>/dev/null; then
                log_warning "$description ($port): 端口已被占用"
            else
                log_success "$description ($port): 端口可用"
            fi
        else
            log_warning "$description ($port): 无法检查端口状态"
        fi
    done
}

# 检查服务状态
check_service_status() {
    log_header "服务状态检查"
    
    # 切换到项目目录
    cd "$PROJECT_ROOT"
    
    # 检查Docker Compose配置
    execute_check "Docker Compose配置验证" "docker-compose config" ""
    
    # 检查容器状态
    if docker-compose ps &>/dev/null; then
        local services=("n8n" "postgres" "redis" "nginx")
        
        for service in "${services[@]}"; do
            increment_check
            local status=$(docker-compose ps "$service" 2>/dev/null | grep "$service" | awk '{print $4}' || echo "未运行")
            
            case "$status" in
                "Up")
                    log_success "服务 $service: 运行中"
                    ;;
                "Exit"*)
                    log_error "服务 $service: 已退出 ($status)"
                    ;;
                "未运行")
                    log_warning "服务 $service: 未运行"
                    ;;
                *)
                    log_warning "服务 $service: 状态未知 ($status)"
                    ;;
            esac
        done
    else
        log_warning "无法获取容器状态信息"
    fi
}

# 检查应用健康状态
check_application_health() {
    log_header "应用健康状态检查"
    
    # 检查N8N Web界面
    increment_check
    local n8n_url="http://localhost:5678"
    if curl -s --connect-timeout 10 "$n8n_url" &>/dev/null; then
        log_success "N8N Web界面: 可访问"
        
        # 检查N8N健康端点
        increment_check
        if curl -s --connect-timeout 10 "$n8n_url/healthz" | grep -q "ok" 2>/dev/null; then
            log_success "N8N健康检查: 正常"
        else
            log_warning "N8N健康检查: 异常"
        fi
    else
        log_error "N8N Web界面: 无法访问"
    fi
    
    # 检查数据库连接
    increment_check
    if docker-compose exec -T postgres pg_isready -h localhost -p 5432 &>/dev/null; then
        log_success "PostgreSQL数据库: 连接正常"
        
        # 检查数据库表
        increment_check
        local table_count=$(docker-compose exec -T postgres psql -U "${POSTGRES_USER:-n8n_user}" -d "${POSTGRES_DB:-n8n}" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' \n' || echo "0")
        
        if [ "$table_count" -gt 0 ]; then
            log_success "数据库表: $table_count 个表"
        else
            log_warning "数据库表: 无表或无法访问"
        fi
    else
        log_error "PostgreSQL数据库: 连接失败"
    fi
    
    # 检查Redis连接
    increment_check
    if docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
        log_success "Redis缓存: 连接正常"
    else
        log_error "Redis缓存: 连接失败"
    fi
}

# 检查性能指标
check_performance_metrics() {
    log_header "性能指标检查"
    
    # 检查系统负载
    increment_check
    if command -v uptime &>/dev/null; then
        local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
        local load_num=$(echo "$load_avg" | cut -d'.' -f1)
        
        if [ "$load_num" -le 2 ]; then
            log_success "系统负载: $load_avg (正常)"
        elif [ "$load_num" -le 5 ]; then
            log_warning "系统负载: $load_avg (较高)"
        else
            log_error "系统负载: $load_avg (过高)"
        fi
    else
        log_warning "无法获取系统负载信息"
    fi
    
    # 检查内存使用率
    increment_check
    local memory_usage=0
    if command -v free &>/dev/null; then
        memory_usage=$(free | awk '/^Mem:/{printf "%.0f", $3/$2 * 100}')
    elif command -v vm_stat &>/dev/null; then
        local vm_stat_output=$(vm_stat)
        local pages_free=$(echo "$vm_stat_output" | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        local pages_active=$(echo "$vm_stat_output" | grep "Pages active" | awk '{print $3}' | sed 's/\.//')
        local pages_inactive=$(echo "$vm_stat_output" | grep "Pages inactive" | awk '{print $3}' | sed 's/\.//')
        local pages_speculative=$(echo "$vm_stat_output" | grep "Pages speculative" | awk '{print $3}' | sed 's/\.//')
        local pages_wired=$(echo "$vm_stat_output" | grep "Pages wired down" | awk '{print $4}' | sed 's/\.//')
        
        local total_pages=$((pages_free + pages_active + pages_inactive + pages_speculative + pages_wired))
        local used_pages=$((pages_active + pages_inactive + pages_speculative + pages_wired))
        memory_usage=$((used_pages * 100 / total_pages))
    fi
    
    if [ "$memory_usage" -le 70 ]; then
        log_success "内存使用率: ${memory_usage}% (正常)"
    elif [ "$memory_usage" -le 85 ]; then
        log_warning "内存使用率: ${memory_usage}% (较高)"
    else
        log_error "内存使用率: ${memory_usage}% (过高)"
    fi
    
    # 检查磁盘使用率
    increment_check
    if command -v df &>/dev/null; then
        local disk_usage=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')
        
        if [ "$disk_usage" -le 70 ]; then
            log_success "磁盘使用率: ${disk_usage}% (正常)"
        elif [ "$disk_usage" -le 85 ]; then
            log_warning "磁盘使用率: ${disk_usage}% (较高)"
        else
            log_error "磁盘使用率: ${disk_usage}% (过高)"
        fi
    else
        log_warning "无法获取磁盘使用率信息"
    fi
    
    # 检查N8N响应时间
    increment_check
    local start_time=$(date +%s%3N)
    if curl -s --connect-timeout 10 "http://localhost:5678" &>/dev/null; then
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        
        if [ "$response_time" -le 1000 ]; then
            log_success "N8N响应时间: ${response_time}ms (快速)"
        elif [ "$response_time" -le 3000 ]; then
            log_warning "N8N响应时间: ${response_time}ms (一般)"
        else
            log_error "N8N响应时间: ${response_time}ms (缓慢)"
        fi
    else
        log_error "N8N响应时间: 无法测试"
    fi
}

# 检查安全配置
check_security_configuration() {
    log_header "安全配置检查"
    
    # 检查基本认证配置
    increment_check
    if [ -f "$PROJECT_ROOT/.env" ]; then
        if grep -q "^N8N_BASIC_AUTH_ACTIVE=true" "$PROJECT_ROOT/.env" 2>/dev/null; then
            log_success "N8N基本认证: 已启用"
            
            # 检查认证用户名和密码
            increment_check
            if grep -q "^N8N_BASIC_AUTH_USER=" "$PROJECT_ROOT/.env" && grep -q "^N8N_BASIC_AUTH_PASSWORD=" "$PROJECT_ROOT/.env"; then
                local auth_user=$(grep "^N8N_BASIC_AUTH_USER=" "$PROJECT_ROOT/.env" | cut -d'=' -f2)
                local auth_pass=$(grep "^N8N_BASIC_AUTH_PASSWORD=" "$PROJECT_ROOT/.env" | cut -d'=' -f2)
                
                if [ -n "$auth_user" ] && [ -n "$auth_pass" ]; then
                    log_success "N8N认证凭据: 已配置"
                else
                    log_error "N8N认证凭据: 配置不完整"
                fi
            else
                log_error "N8N认证凭据: 未配置"
            fi
        else
            log_warning "N8N基本认证: 未启用 (建议启用)"
        fi
    else
        log_error "环境配置文件: 不存在"
    fi
    
    # 检查数据库密码强度
    increment_check
    if [ -f "$PROJECT_ROOT/.env" ]; then
        local db_password=$(grep "^POSTGRES_PASSWORD=" "$PROJECT_ROOT/.env" | cut -d'=' -f2 2>/dev/null || echo "")
        
        if [ -n "$db_password" ]; then
            local pass_length=${#db_password}
            if [ "$pass_length" -ge 12 ]; then
                log_success "数据库密码: 强度足够 (${pass_length}字符)"
            elif [ "$pass_length" -ge 8 ]; then
                log_warning "数据库密码: 强度一般 (${pass_length}字符，建议12+)"
            else
                log_error "数据库密码: 强度不足 (${pass_length}字符，建议12+)"
            fi
        else
            log_error "数据库密码: 未设置"
        fi
    fi
    
    # 检查文件权限
    local sensitive_files=(
        ".env:环境变量文件"
        "config/nginx.conf:Nginx配置文件"
    )
    
    for file_info in "${sensitive_files[@]}"; do
        local file=$(echo "$file_info" | cut -d':' -f1)
        local description=$(echo "$file_info" | cut -d':' -f2)
        
        increment_check
        if [ -f "$PROJECT_ROOT/$file" ]; then
            local permissions=$(stat -c "%a" "$PROJECT_ROOT/$file" 2>/dev/null || stat -f "%A" "$PROJECT_ROOT/$file" 2>/dev/null || echo "unknown")
            
            case "$permissions" in
                "600"|"640"|"644")
                    log_success "$description: 权限安全 ($permissions)"
                    ;;
                "unknown")
                    log_warning "$description: 无法检查权限"
                    ;;
                *)
                    log_warning "$description: 权限过于宽松 ($permissions)"
                    ;;
            esac
        else
            log_warning "$description: 文件不存在"
        fi
    done
}

# 生成健康检查报告
generate_health_report() {
    local report_file="logs/health_report_$(date '+%Y%m%d_%H%M%S').txt"
    
    log_header "生成健康检查报告"
    
    {
        echo "N8N企业级自动化工作流平台健康检查报告"
        echo "生成时间: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "========================================"
        echo ""
        
        # 检查结果统计
        echo "检查结果统计:"
        echo "------------"
        echo "总检查项: $TOTAL_CHECKS"
        echo "通过检查: $PASSED_CHECKS"
        echo "警告检查: $WARNING_CHECKS"
        echo "失败检查: $FAILED_CHECKS"
        
        local success_rate=0
        if [ "$TOTAL_CHECKS" -gt 0 ]; then
            success_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
        fi
        echo "成功率: ${success_rate}%"
        echo ""
        
        # 健康状态评估
        echo "健康状态评估:"
        echo "------------"
        if [ "$FAILED_CHECKS" -eq 0 ] && [ "$WARNING_CHECKS" -eq 0 ]; then
            echo "状态: 优秀 - 所有检查项均通过"
        elif [ "$FAILED_CHECKS" -eq 0 ] && [ "$WARNING_CHECKS" -le 3 ]; then
            echo "状态: 良好 - 仅有少量警告项"
        elif [ "$FAILED_CHECKS" -le 2 ]; then
            echo "状态: 一般 - 存在少量问题需要关注"
        else
            echo "状态: 需要改进 - 存在多个问题需要解决"
        fi
        echo ""
        
        # 建议措施
        echo "建议措施:"
        echo "--------"
        if [ "$FAILED_CHECKS" -gt 0 ]; then
            echo "1. 优先解决失败的检查项"
            echo "2. 检查系统要求和依赖安装"
            echo "3. 验证配置文件的正确性"
        fi
        
        if [ "$WARNING_CHECKS" -gt 0 ]; then
            echo "4. 关注警告项，考虑优化配置"
            echo "5. 定期更新系统和依赖版本"
        fi
        
        if [ "$success_rate" -ge 90 ]; then
            echo "6. 系统状态良好，保持定期检查"
        fi
        
        echo ""
        
        # 详细日志
        echo "详细检查日志:"
        echo "------------"
        if [ -f "$HEALTH_LOG" ]; then
            tail -n 100 "$HEALTH_LOG"
        else
            echo "无详细日志"
        fi
        
        echo ""
        echo "报告生成完成"
        
    } > "$report_file"
    
    log_success "健康检查报告已生成: $report_file"
    echo "$report_file"
}

# 快速健康检查
quick_health_check() {
    log_header "快速健康检查"
    
    # 只检查关键项目
    check_required_tools
    
    # 检查Docker状态
    execute_check "Docker服务" "docker info" ""
    
    # 检查项目配置
    increment_check
    if [ -f "$PROJECT_ROOT/docker-compose.yml" ]; then
        log_success "Docker Compose配置: 存在"
    else
        log_error "Docker Compose配置: 缺失"
    fi
    
    # 检查服务状态
    if docker-compose ps &>/dev/null; then
        local services=("n8n" "postgres")
        for service in "${services[@]}"; do
            increment_check
            if docker-compose ps "$service" | grep -q "Up"; then
                log_success "服务 $service: 运行中"
            else
                log_error "服务 $service: 未运行"
            fi
        done
    fi
    
    # 检查N8N访问
    execute_check "N8N Web界面" "curl -s --connect-timeout 5 http://localhost:5678" ""
}

# 完整健康检查
full_health_check() {
    log_header "完整健康检查"
    
    check_system_requirements
    check_required_tools
    check_docker_environment
    check_project_configuration
    check_network_connectivity
    check_service_status
    check_application_health
    check_performance_metrics
    check_security_configuration
}

# 显示健康状态摘要
show_health_summary() {
    log_header "健康状态摘要"
    
    echo ""
    echo -e "${CYAN}检查结果统计:${NC}"
    echo "  总检查项: $TOTAL_CHECKS"
    echo "  通过检查: ${GREEN}$PASSED_CHECKS${NC}"
    echo "  警告检查: ${YELLOW}$WARNING_CHECKS${NC}"
    echo "  失败检查: ${RED}$FAILED_CHECKS${NC}"
    
    if [ "$TOTAL_CHECKS" -gt 0 ]; then
        local success_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
        echo "  成功率: ${success_rate}%"
    fi
    
    echo ""
    echo -e "${CYAN}健康状态:${NC}"
    if [ "$FAILED_CHECKS" -eq 0 ] && [ "$WARNING_CHECKS" -eq 0 ]; then
        echo -e "  ${GREEN}优秀${NC} - 所有检查项均通过"
    elif [ "$FAILED_CHECKS" -eq 0 ] && [ "$WARNING_CHECKS" -le 3 ]; then
        echo -e "  ${GREEN}良好${NC} - 仅有少量警告项"
    elif [ "$FAILED_CHECKS" -le 2 ]; then
        echo -e "  ${YELLOW}一般${NC} - 存在少量问题需要关注"
    else
        echo -e "  ${RED}需要改进${NC} - 存在多个问题需要解决"
    fi
    
    echo ""
}

# 显示帮助
show_help() {
    echo "N8N企业级自动化工作流平台健康检查脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "检查命令:"
    echo "  quick                    快速健康检查 (关键项目)"
    echo "  full                     完整健康检查 (所有项目)"
    echo "  system                   系统要求检查"
    echo "  tools                    必需工具检查"
    echo "  docker                   Docker环境检查"
    echo "  config                   项目配置检查"
    echo "  network                  网络连接检查"
    echo "  services                 服务状态检查"
    echo "  app                      应用健康检查"
    echo "  performance              性能指标检查"
    echo "  security                 安全配置检查"
    echo ""
    echo "报告命令:"
    echo "  report                   生成健康检查报告"
    echo "  summary                  显示健康状态摘要"
    echo ""
    echo "选项:"
    echo "  --timeout <秒数>         检查超时时间 (默认30秒)"
    echo "  --retries <次数>         重试次数 (默认3次)"
    echo "  --retry-delay <秒数>     重试延迟 (默认5秒)"
    echo "  -h, --help               显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 quick                           # 快速健康检查"
    echo "  $0 full                            # 完整健康检查"
    echo "  $0 services                        # 仅检查服务状态"
    echo "  $0 report                          # 生成检查报告"
    echo "  $0 full --timeout 60               # 60秒超时的完整检查"
    echo ""
}

# 主函数
main() {
    # 创建必要目录
    create_directories
    
    # 解析命令行参数
    local command=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            quick|full|system|tools|docker|config|network|services|app|performance|security|report|summary)
                command="$1"
                shift
                break
                ;;
            --timeout)
                TIMEOUT_SECONDS="$2"
                shift 2
                ;;
            --retries)
                MAX_RETRIES="$2"
                shift 2
                ;;
            --retry-delay)
                RETRY_DELAY="$2"
                shift 2
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
    
    # 如果没有指定命令，执行快速检查
    if [ -z "$command" ]; then
        command="quick"
    fi
    
    # 记录开始时间
    local start_time=$(date +%s)
    
    # 执行命令
    case "$command" in
        "quick")
            quick_health_check
            ;;
        "full")
            full_health_check
            ;;
        "system")
            check_system_requirements
            ;;
        "tools")
            check_required_tools
            ;;
        "docker")
            check_docker_environment
            ;;
        "config")
            check_project_configuration
            ;;
        "network")
            check_network_connectivity
            ;;
        "services")
            check_service_status
            ;;
        "app")
            check_application_health
            ;;
        "performance")
            check_performance_metrics
            ;;
        "security")
            check_security_configuration
            ;;
        "report")
            full_health_check
            generate_health_report
            ;;
        "summary")
            show_health_summary
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
    
    # 计算执行时间
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # 显示摘要
    if [ "$command" != "summary" ]; then
        show_health_summary
    fi
    
    log_info "健康检查完成，耗时: ${duration}秒"
    
    # 返回适当的退出码
    if [ "$FAILED_CHECKS" -gt 0 ]; then
        exit 1
    elif [ "$WARNING_CHECKS" -gt 0 ]; then
        exit 2
    else
        exit 0
    fi
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi