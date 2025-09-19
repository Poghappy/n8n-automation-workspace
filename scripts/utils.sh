#!/bin/bash

# N8N企业级自动化工作流平台 - 工具函数库
# 提供通用的工具函数和实用程序

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
UTILS_LOG="logs/utils.log"

# 创建日志目录
mkdir -p "$(dirname "$UTILS_LOG")"

# ==================== 日志函数 ====================

# 基础日志函数
log_message() {
    local level="$1"
    local color="$2"
    local message="$3"
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    
    echo -e "${color}[${level}]${NC} $message"
    echo "[$timestamp] [$level] $message" >> "$UTILS_LOG"
}

# 信息日志
log_info() {
    log_message "INFO" "$BLUE" "$1"
}

# 成功日志
log_success() {
    log_message "SUCCESS" "$GREEN" "$1"
}

# 警告日志
log_warning() {
    log_message "WARNING" "$YELLOW" "$1"
}

# 错误日志
log_error() {
    log_message "ERROR" "$RED" "$1"
}

# 调试日志
log_debug() {
    if [ "${DEBUG:-false}" = "true" ]; then
        log_message "DEBUG" "$PURPLE" "$1"
    fi
}

# 标题日志
log_header() {
    local message="$1"
    echo ""
    echo -e "${CYAN}=== $message ===${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [HEADER] $message" >> "$UTILS_LOG"
}

# 分隔线
log_separator() {
    echo -e "${CYAN}----------------------------------------${NC}"
}

# ==================== 系统检查函数 ====================

# 检查命令是否存在
check_command() {
    local cmd="$1"
    local description="${2:-$cmd}"
    
    if command -v "$cmd" &>/dev/null; then
        log_success "$description 已安装"
        return 0
    else
        log_error "$description 未安装"
        return 1
    fi
}

# 检查文件是否存在
check_file() {
    local file="$1"
    local description="${2:-$file}"
    
    if [ -f "$file" ]; then
        log_success "$description 存在"
        return 0
    else
        log_error "$description 不存在"
        return 1
    fi
}

# 检查目录是否存在
check_directory() {
    local dir="$1"
    local description="${2:-$dir}"
    
    if [ -d "$dir" ]; then
        log_success "$description 存在"
        return 0
    else
        log_error "$description 不存在"
        return 1
    fi
}

# 检查端口是否被占用
check_port() {
    local port="$1"
    local description="${2:-端口 $port}"
    
    if command -v lsof &>/dev/null; then
        if lsof -i ":$port" &>/dev/null; then
            log_warning "$description 已被占用"
            return 1
        else
            log_success "$description 可用"
            return 0
        fi
    elif command -v netstat &>/dev/null; then
        if netstat -ln | grep ":$port " &>/dev/null; then
            log_warning "$description 已被占用"
            return 1
        else
            log_success "$description 可用"
            return 0
        fi
    else
        log_warning "无法检查端口状态 (缺少 lsof 或 netstat)"
        return 2
    fi
}

# 检查网络连接
check_network() {
    local host="${1:-8.8.8.8}"
    local port="${2:-53}"
    local timeout="${3:-5}"
    
    if command -v nc &>/dev/null; then
        if timeout "$timeout" nc -z "$host" "$port" &>/dev/null; then
            log_success "网络连接正常 ($host:$port)"
            return 0
        else
            log_error "网络连接失败 ($host:$port)"
            return 1
        fi
    elif command -v telnet &>/dev/null; then
        if timeout "$timeout" telnet "$host" "$port" &>/dev/null; then
            log_success "网络连接正常 ($host:$port)"
            return 0
        else
            log_error "网络连接失败 ($host:$port)"
            return 1
        fi
    else
        log_warning "无法检查网络连接 (缺少 nc 或 telnet)"
        return 2
    fi
}

# 检查磁盘空间
check_disk_space() {
    local path="${1:-$PROJECT_ROOT}"
    local min_space_gb="${2:-5}"
    
    if command -v df &>/dev/null; then
        local available_space
        available_space=$(df -BG "$path" | awk 'NR==2 {print $4}' | sed 's/G//')
        
        if [ "$available_space" -ge "$min_space_gb" ]; then
            log_success "磁盘空间充足: ${available_space}GB (需要${min_space_gb}GB)"
            return 0
        else
            log_error "磁盘空间不足: ${available_space}GB (需要${min_space_gb}GB)"
            return 1
        fi
    else
        log_warning "无法检查磁盘空间 (缺少 df 命令)"
        return 2
    fi
}

# 检查内存使用
check_memory() {
    local min_memory_mb="${1:-1024}"
    
    if command -v free &>/dev/null; then
        local available_memory
        available_memory=$(free -m | awk 'NR==2{printf "%.0f", $7}')
        
        if [ "$available_memory" -ge "$min_memory_mb" ]; then
            log_success "内存充足: ${available_memory}MB (需要${min_memory_mb}MB)"
            return 0
        else
            log_error "内存不足: ${available_memory}MB (需要${min_memory_mb}MB)"
            return 1
        fi
    elif command -v vm_stat &>/dev/null; then
        # macOS
        local page_size
        local free_pages
        local available_memory
        
        page_size=$(vm_stat | grep "page size" | awk '{print $8}')
        free_pages=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        available_memory=$((free_pages * page_size / 1024 / 1024))
        
        if [ "$available_memory" -ge "$min_memory_mb" ]; then
            log_success "内存充足: ${available_memory}MB (需要${min_memory_mb}MB)"
            return 0
        else
            log_error "内存不足: ${available_memory}MB (需要${min_memory_mb}MB)"
            return 1
        fi
    else
        log_warning "无法检查内存使用 (缺少 free 或 vm_stat 命令)"
        return 2
    fi
}

# ==================== Docker 函数 ====================

# 检查Docker服务
check_docker() {
    if ! check_command "docker" "Docker"; then
        return 1
    fi
    
    if ! docker info &>/dev/null; then
        log_error "Docker服务未运行"
        return 1
    fi
    
    log_success "Docker服务运行正常"
    return 0
}

# 检查Docker Compose
check_docker_compose() {
    if check_command "docker-compose" "Docker Compose"; then
        return 0
    elif docker compose version &>/dev/null; then
        log_success "Docker Compose (插件版本) 已安装"
        return 0
    else
        log_error "Docker Compose 未安装"
        return 1
    fi
}

# 获取容器状态
get_container_status() {
    local container_name="$1"
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name"; then
        echo "running"
    elif docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name"; then
        echo "stopped"
    else
        echo "not_found"
    fi
}

# 等待容器就绪
wait_for_container() {
    local container_name="$1"
    local timeout="${2:-60}"
    local check_interval="${3:-5}"
    
    log_info "等待容器就绪: $container_name"
    
    local elapsed=0
    while [ $elapsed -lt $timeout ]; do
        local status
        status=$(get_container_status "$container_name")
        
        if [ "$status" = "running" ]; then
            log_success "容器已就绪: $container_name"
            return 0
        fi
        
        sleep $check_interval
        elapsed=$((elapsed + check_interval))
        log_debug "等待容器就绪: $container_name (${elapsed}s/${timeout}s)"
    done
    
    log_error "容器启动超时: $container_name"
    return 1
}

# 检查容器健康状态
check_container_health() {
    local container_name="$1"
    
    local health_status
    health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "unknown")
    
    case "$health_status" in
        "healthy")
            log_success "容器健康: $container_name"
            return 0
            ;;
        "unhealthy")
            log_error "容器不健康: $container_name"
            return 1
            ;;
        "starting")
            log_info "容器启动中: $container_name"
            return 2
            ;;
        *)
            log_warning "容器健康状态未知: $container_name"
            return 3
            ;;
    esac
}

# ==================== 文件操作函数 ====================

# 安全创建目录
safe_mkdir() {
    local dir="$1"
    local mode="${2:-755}"
    
    if [ ! -d "$dir" ]; then
        if mkdir -p "$dir"; then
            chmod "$mode" "$dir"
            log_success "目录创建成功: $dir"
            return 0
        else
            log_error "目录创建失败: $dir"
            return 1
        fi
    else
        log_debug "目录已存在: $dir"
        return 0
    fi
}

# 安全复制文件
safe_copy() {
    local src="$1"
    local dst="$2"
    local backup="${3:-true}"
    
    if [ ! -f "$src" ]; then
        log_error "源文件不存在: $src"
        return 1
    fi
    
    # 创建目标目录
    local dst_dir
    dst_dir=$(dirname "$dst")
    safe_mkdir "$dst_dir"
    
    # 备份现有文件
    if [ "$backup" = "true" ] && [ -f "$dst" ]; then
        local backup_file="${dst}.backup.$(date +%Y%m%d_%H%M%S)"
        if cp "$dst" "$backup_file"; then
            log_info "文件已备份: $backup_file"
        else
            log_warning "文件备份失败: $dst"
        fi
    fi
    
    # 复制文件
    if cp "$src" "$dst"; then
        log_success "文件复制成功: $src -> $dst"
        return 0
    else
        log_error "文件复制失败: $src -> $dst"
        return 1
    fi
}

# 安全删除文件
safe_remove() {
    local file="$1"
    local backup="${2:-true}"
    
    if [ ! -e "$file" ]; then
        log_debug "文件不存在: $file"
        return 0
    fi
    
    # 备份文件
    if [ "$backup" = "true" ]; then
        local backup_file="${file}.removed.$(date +%Y%m%d_%H%M%S)"
        if cp "$file" "$backup_file" 2>/dev/null; then
            log_info "文件已备份: $backup_file"
        else
            log_warning "文件备份失败: $file"
        fi
    fi
    
    # 删除文件
    if rm -f "$file"; then
        log_success "文件删除成功: $file"
        return 0
    else
        log_error "文件删除失败: $file"
        return 1
    fi
}

# 生成随机字符串
generate_random_string() {
    local length="${1:-32}"
    local charset="${2:-a-zA-Z0-9}"
    
    if command -v openssl &>/dev/null; then
        openssl rand -base64 "$length" | tr -d "=+/" | cut -c1-"$length"
    elif [ -f /dev/urandom ]; then
        tr -dc "$charset" < /dev/urandom | head -c "$length"
    else
        # 备用方法
        date +%s | sha256sum | base64 | head -c "$length"
    fi
}

# 生成安全密码
generate_password() {
    local length="${1:-16}"
    generate_random_string "$length" "a-zA-Z0-9!@#$%^&*"
}

# ==================== 网络函数 ====================

# 获取本机IP地址
get_local_ip() {
    local interface="${1:-}"
    
    if [ -n "$interface" ]; then
        # 指定网络接口
        if command -v ip &>/dev/null; then
            ip addr show "$interface" | grep "inet " | awk '{print $2}' | cut -d/ -f1 | head -1
        elif command -v ifconfig &>/dev/null; then
            ifconfig "$interface" | grep "inet " | awk '{print $2}' | head -1
        fi
    else
        # 自动检测
        if command -v ip &>/dev/null; then
            ip route get 8.8.8.8 | grep -oP 'src \K\S+' 2>/dev/null || \
            ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d/ -f1 | head -1
        elif command -v ifconfig &>/dev/null; then
            ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -1
        else
            echo "127.0.0.1"
        fi
    fi
}

# 获取公网IP地址
get_public_ip() {
    local timeout="${1:-10}"
    
    # 尝试多个服务
    local services=(
        "https://ipinfo.io/ip"
        "https://api.ipify.org"
        "https://checkip.amazonaws.com"
        "https://icanhazip.com"
    )
    
    for service in "${services[@]}"; do
        local ip
        if command -v curl &>/dev/null; then
            ip=$(timeout "$timeout" curl -s "$service" 2>/dev/null | tr -d '\n\r ')
        elif command -v wget &>/dev/null; then
            ip=$(timeout "$timeout" wget -qO- "$service" 2>/dev/null | tr -d '\n\r ')
        fi
        
        # 验证IP格式
        if [[ "$ip" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo "$ip"
            return 0
        fi
    done
    
    log_warning "无法获取公网IP地址"
    return 1
}

# 测试URL可访问性
test_url() {
    local url="$1"
    local timeout="${2:-10}"
    local expected_code="${3:-200}"
    
    if command -v curl &>/dev/null; then
        local response_code
        response_code=$(curl -s -w "%{http_code}" -o /dev/null --connect-timeout "$timeout" "$url" 2>/dev/null || echo "000")
        
        if [ "$response_code" = "$expected_code" ]; then
            log_success "URL访问正常: $url (HTTP $response_code)"
            return 0
        else
            log_error "URL访问异常: $url (HTTP $response_code, 期望 $expected_code)"
            return 1
        fi
    else
        log_warning "无法测试URL (缺少 curl 命令)"
        return 2
    fi
}

# ==================== 进程管理函数 ====================

# 检查进程是否运行
check_process() {
    local process_name="$1"
    
    if pgrep -f "$process_name" &>/dev/null; then
        log_success "进程运行中: $process_name"
        return 0
    else
        log_info "进程未运行: $process_name"
        return 1
    fi
}

# 等待进程启动
wait_for_process() {
    local process_name="$1"
    local timeout="${2:-60}"
    local check_interval="${3:-5}"
    
    log_info "等待进程启动: $process_name"
    
    local elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if check_process "$process_name"; then
            return 0
        fi
        
        sleep $check_interval
        elapsed=$((elapsed + check_interval))
        log_debug "等待进程启动: $process_name (${elapsed}s/${timeout}s)"
    done
    
    log_error "进程启动超时: $process_name"
    return 1
}

# 安全停止进程
safe_kill_process() {
    local process_name="$1"
    local timeout="${2:-30}"
    
    local pids
    pids=$(pgrep -f "$process_name" || true)
    
    if [ -z "$pids" ]; then
        log_info "进程未运行: $process_name"
        return 0
    fi
    
    log_info "停止进程: $process_name (PIDs: $pids)"
    
    # 发送TERM信号
    for pid in $pids; do
        kill -TERM "$pid" 2>/dev/null || true
    done
    
    # 等待进程退出
    local elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if ! pgrep -f "$process_name" &>/dev/null; then
            log_success "进程已停止: $process_name"
            return 0
        fi
        
        sleep 2
        elapsed=$((elapsed + 2))
    done
    
    # 强制杀死进程
    log_warning "强制停止进程: $process_name"
    for pid in $(pgrep -f "$process_name" || true); do
        kill -KILL "$pid" 2>/dev/null || true
    done
    
    sleep 2
    
    if ! pgrep -f "$process_name" &>/dev/null; then
        log_success "进程已强制停止: $process_name"
        return 0
    else
        log_error "进程停止失败: $process_name"
        return 1
    fi
}

# ==================== 配置管理函数 ====================

# 读取配置值
get_config_value() {
    local config_file="$1"
    local key="$2"
    local default_value="${3:-}"
    
    if [ ! -f "$config_file" ]; then
        echo "$default_value"
        return 1
    fi
    
    local value
    if [[ "$config_file" == *.env ]]; then
        # .env 文件格式
        value=$(grep "^${key}=" "$config_file" 2>/dev/null | cut -d'=' -f2- | sed 's/^["'\'']//' | sed 's/["'\'']$//')
    elif [[ "$config_file" == *.yml ]] || [[ "$config_file" == *.yaml ]]; then
        # YAML 文件格式 (简单解析)
        value=$(grep "^${key}:" "$config_file" 2>/dev/null | cut -d':' -f2- | sed 's/^ *//' | sed 's/^["'\'']//' | sed 's/["'\'']$//')
    else
        # 通用键值对格式
        value=$(grep "^${key}=" "$config_file" 2>/dev/null | cut -d'=' -f2-)
    fi
    
    if [ -n "$value" ]; then
        echo "$value"
        return 0
    else
        echo "$default_value"
        return 1
    fi
}

# 设置配置值
set_config_value() {
    local config_file="$1"
    local key="$2"
    local value="$3"
    local create_if_missing="${4:-true}"
    
    # 创建配置文件目录
    local config_dir
    config_dir=$(dirname "$config_file")
    safe_mkdir "$config_dir"
    
    # 创建配置文件
    if [ ! -f "$config_file" ] && [ "$create_if_missing" = "true" ]; then
        touch "$config_file"
    fi
    
    if [ ! -f "$config_file" ]; then
        log_error "配置文件不存在: $config_file"
        return 1
    fi
    
    # 备份配置文件
    local backup_file="${config_file}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$config_file" "$backup_file"
    
    # 更新配置值
    if grep -q "^${key}=" "$config_file" 2>/dev/null; then
        # 更新现有配置
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^${key}=.*|${key}=${value}|" "$config_file"
        else
            # Linux
            sed -i "s|^${key}=.*|${key}=${value}|" "$config_file"
        fi
    else
        # 添加新配置
        echo "${key}=${value}" >> "$config_file"
    fi
    
    log_success "配置已更新: $key=$value"
    return 0
}

# 验证配置文件
validate_config() {
    local config_file="$1"
    local required_keys=("${@:2}")
    
    if [ ! -f "$config_file" ]; then
        log_error "配置文件不存在: $config_file"
        return 1
    fi
    
    local missing_keys=()
    for key in "${required_keys[@]}"; do
        if ! get_config_value "$config_file" "$key" &>/dev/null; then
            missing_keys+=("$key")
        fi
    done
    
    if [ ${#missing_keys[@]} -eq 0 ]; then
        log_success "配置验证通过: $config_file"
        return 0
    else
        log_error "配置验证失败: $config_file"
        log_error "缺少配置项: ${missing_keys[*]}"
        return 1
    fi
}

# ==================== 时间和日期函数 ====================

# 获取时间戳
get_timestamp() {
    local format="${1:-%Y%m%d_%H%M%S}"
    date +"$format"
}

# 计算时间差
time_diff() {
    local start_time="$1"
    local end_time="${2:-$(date +%s)}"
    
    local diff=$((end_time - start_time))
    local hours=$((diff / 3600))
    local minutes=$(((diff % 3600) / 60))
    local seconds=$((diff % 60))
    
    if [ $hours -gt 0 ]; then
        echo "${hours}h ${minutes}m ${seconds}s"
    elif [ $minutes -gt 0 ]; then
        echo "${minutes}m ${seconds}s"
    else
        echo "${seconds}s"
    fi
}

# 格式化持续时间
format_duration() {
    local seconds="$1"
    
    local days=$((seconds / 86400))
    local hours=$(((seconds % 86400) / 3600))
    local minutes=$(((seconds % 3600) / 60))
    local secs=$((seconds % 60))
    
    local result=""
    [ $days -gt 0 ] && result="${days}d "
    [ $hours -gt 0 ] && result="${result}${hours}h "
    [ $minutes -gt 0 ] && result="${result}${minutes}m "
    [ $secs -gt 0 ] && result="${result}${secs}s"
    
    echo "${result:-0s}"
}

# ==================== 重试机制函数 ====================

# 重试执行命令
retry_command() {
    local max_attempts="$1"
    local delay="$2"
    local command=("${@:3}")
    
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
        log_debug "执行命令 (尝试 $attempt/$max_attempts): ${command[*]}"
        
        if "${command[@]}"; then
            log_success "命令执行成功: ${command[*]}"
            return 0
        else
            local exit_code=$?
            if [ $attempt -lt $max_attempts ]; then
                log_warning "命令执行失败 (尝试 $attempt/$max_attempts)，${delay}秒后重试: ${command[*]}"
                sleep "$delay"
            else
                log_error "命令执行失败 (所有尝试已用完): ${command[*]}"
                return $exit_code
            fi
        fi
        
        ((attempt++))
    done
}

# 指数退避重试
exponential_backoff_retry() {
    local max_attempts="$1"
    local base_delay="$2"
    local command=("${@:3}")
    
    local attempt=1
    local delay="$base_delay"
    
    while [ $attempt -le $max_attempts ]; do
        log_debug "执行命令 (尝试 $attempt/$max_attempts): ${command[*]}"
        
        if "${command[@]}"; then
            log_success "命令执行成功: ${command[*]}"
            return 0
        else
            local exit_code=$?
            if [ $attempt -lt $max_attempts ]; then
                log_warning "命令执行失败 (尝试 $attempt/$max_attempts)，${delay}秒后重试: ${command[*]}"
                sleep "$delay"
                delay=$((delay * 2))  # 指数退避
            else
                log_error "命令执行失败 (所有尝试已用完): ${command[*]}"
                return $exit_code
            fi
        fi
        
        ((attempt++))
    done
}

# ==================== 用户交互函数 ====================

# 询问用户确认
ask_confirmation() {
    local message="$1"
    local default="${2:-n}"
    
    local prompt
    if [ "$default" = "y" ]; then
        prompt="$message [Y/n]: "
    else
        prompt="$message [y/N]: "
    fi
    
    echo -n -e "${YELLOW}$prompt${NC}"
    read -r response
    
    response=${response:-$default}
    case "$response" in
        [Yy]|[Yy][Ee][Ss])
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# 读取用户输入
read_input() {
    local prompt="$1"
    local default="$2"
    local secret="${3:-false}"
    
    local input_prompt
    if [ -n "$default" ]; then
        input_prompt="$prompt [$default]: "
    else
        input_prompt="$prompt: "
    fi
    
    echo -n -e "${CYAN}$input_prompt${NC}"
    
    if [ "$secret" = "true" ]; then
        read -r -s response
        echo
    else
        read -r response
    fi
    
    echo "${response:-$default}"
}

# 选择菜单
select_option() {
    local prompt="$1"
    shift
    local options=("$@")
    
    echo -e "${CYAN}$prompt${NC}"
    for i in "${!options[@]}"; do
        echo "  $((i + 1)). ${options[$i]}"
    done
    
    while true; do
        echo -n -e "${YELLOW}请选择 [1-${#options[@]}]: ${NC}"
        read -r choice
        
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le ${#options[@]} ]; then
            echo "${options[$((choice - 1))]}"
            return $((choice - 1))
        else
            log_error "无效选择，请输入 1-${#options[@]} 之间的数字"
        fi
    done
}

# ==================== 性能监控函数 ====================

# 获取系统负载
get_system_load() {
    if command -v uptime &>/dev/null; then
        uptime | awk -F'load average:' '{print $2}' | sed 's/^ *//'
    else
        echo "未知"
    fi
}

# 获取CPU使用率
get_cpu_usage() {
    if command -v top &>/dev/null; then
        top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//' 2>/dev/null || echo "未知"
    elif command -v iostat &>/dev/null; then
        iostat -c 1 1 | tail -1 | awk '{print $1}' 2>/dev/null || echo "未知"
    else
        echo "未知"
    fi
}

# 获取内存使用率
get_memory_usage() {
    if command -v free &>/dev/null; then
        free | awk 'NR==2{printf "%.1f%%", $3*100/$2}'
    elif command -v vm_stat &>/dev/null; then
        # macOS
        local page_size
        local total_pages
        local free_pages
        local used_pages
        
        page_size=$(vm_stat | grep "page size" | awk '{print $8}')
        total_pages=$(sysctl -n hw.memsize)
        total_pages=$((total_pages / page_size))
        free_pages=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        used_pages=$((total_pages - free_pages))
        
        awk "BEGIN {printf \"%.1f%%\", $used_pages*100/$total_pages}"
    else
        echo "未知"
    fi
}

# 获取磁盘使用率
get_disk_usage() {
    local path="${1:-/}"
    
    if command -v df &>/dev/null; then
        df -h "$path" | awk 'NR==2{print $5}' 2>/dev/null || echo "未知"
    else
        echo "未知"
    fi
}

# ==================== 清理函数 ====================

# 清理临时文件
cleanup_temp_files() {
    local temp_patterns=("*.tmp" "*.temp" "*~" ".DS_Store")
    local cleaned_count=0
    
    for pattern in "${temp_patterns[@]}"; do
        while IFS= read -r -d '' file; do
            if rm -f "$file" 2>/dev/null; then
                ((cleaned_count++))
                log_debug "删除临时文件: $file"
            fi
        done < <(find "$PROJECT_ROOT" -name "$pattern" -type f -print0 2>/dev/null)
    done
    
    if [ $cleaned_count -gt 0 ]; then
        log_success "清理了 $cleaned_count 个临时文件"
    else
        log_info "没有找到临时文件"
    fi
    
    return 0
}

# 清理日志文件
cleanup_old_logs() {
    local log_dir="${1:-logs}"
    local days="${2:-30}"
    
    if [ ! -d "$log_dir" ]; then
        log_info "日志目录不存在: $log_dir"
        return 0
    fi
    
    local cleaned_count=0
    while IFS= read -r -d '' file; do
        if rm -f "$file" 2>/dev/null; then
            ((cleaned_count++))
            log_debug "删除旧日志: $file"
        fi
    done < <(find "$log_dir" -name "*.log" -type f -mtime +$days -print0 2>/dev/null)
    
    if [ $cleaned_count -gt 0 ]; then
        log_success "清理了 $cleaned_count 个旧日志文件"
    else
        log_info "没有找到需要清理的旧日志文件"
    fi
    
    return 0
}

# ==================== 版本比较函数 ====================

# 比较版本号
version_compare() {
    local version1="$1"
    local version2="$2"
    
    # 移除前缀 v
    version1=${version1#v}
    version2=${version2#v}
    
    # 使用sort进行版本比较
    if [ "$version1" = "$version2" ]; then
        echo "0"  # 相等
    elif printf '%s\n%s\n' "$version1" "$version2" | sort -V | head -1 | grep -q "^$version1$"; then
        echo "-1"  # version1 < version2
    else
        echo "1"   # version1 > version2
    fi
}

# 检查最低版本要求
check_min_version() {
    local current_version="$1"
    local min_version="$2"
    local software_name="${3:-软件}"
    
    local result
    result=$(version_compare "$current_version" "$min_version")
    
    if [ "$result" -ge 0 ]; then
        log_success "$software_name 版本满足要求: $current_version >= $min_version"
        return 0
    else
        log_error "$software_name 版本不满足要求: $current_version < $min_version"
        return 1
    fi
}

# ==================== 导出函数 ====================

# 导出所有函数供其他脚本使用
export -f log_info log_success log_warning log_error log_debug log_header log_separator
export -f check_command check_file check_directory check_port check_network check_disk_space check_memory
export -f check_docker check_docker_compose get_container_status wait_for_container check_container_health
export -f safe_mkdir safe_copy safe_remove generate_random_string generate_password
export -f get_local_ip get_public_ip test_url
export -f check_process wait_for_process safe_kill_process
export -f get_config_value set_config_value validate_config
export -f get_timestamp time_diff format_duration
export -f retry_command exponential_backoff_retry
export -f ask_confirmation read_input select_option
export -f get_system_load get_cpu_usage get_memory_usage get_disk_usage
export -f cleanup_temp_files cleanup_old_logs
export -f version_compare check_min_version

# 如果直接执行此脚本，显示可用函数
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    log_header "N8N工具函数库"
    echo ""
    echo "可用函数分类:"
    echo ""
    echo "日志函数:"
    echo "  log_info, log_success, log_warning, log_error, log_debug"
    echo "  log_header, log_separator"
    echo ""
    echo "系统检查函数:"
    echo "  check_command, check_file, check_directory, check_port"
    echo "  check_network, check_disk_space, check_memory"
    echo ""
    echo "Docker函数:"
    echo "  check_docker, check_docker_compose, get_container_status"
    echo "  wait_for_container, check_container_health"
    echo ""
    echo "文件操作函数:"
    echo "  safe_mkdir, safe_copy, safe_remove"
    echo "  generate_random_string, generate_password"
    echo ""
    echo "网络函数:"
    echo "  get_local_ip, get_public_ip, test_url"
    echo ""
    echo "进程管理函数:"
    echo "  check_process, wait_for_process, safe_kill_process"
    echo ""
    echo "配置管理函数:"
    echo "  get_config_value, set_config_value, validate_config"
    echo ""
    echo "时间函数:"
    echo "  get_timestamp, time_diff, format_duration"
    echo ""
    echo "重试机制函数:"
    echo "  retry_command, exponential_backoff_retry"
    echo ""
    echo "用户交互函数:"
    echo "  ask_confirmation, read_input, select_option"
    echo ""
    echo "性能监控函数:"
    echo "  get_system_load, get_cpu_usage, get_memory_usage, get_disk_usage"
    echo ""
    echo "清理函数:"
    echo "  cleanup_temp_files, cleanup_old_logs"
    echo ""
    echo "版本比较函数:"
    echo "  version_compare, check_min_version"
    echo ""
    echo "使用方法:"
    echo "  source scripts/utils.sh"
    echo "  然后就可以在其他脚本中使用这些函数了"
    echo ""
fi