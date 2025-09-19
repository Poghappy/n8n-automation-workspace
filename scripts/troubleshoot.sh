#!/bin/bash

# N8N企业级自动化工作流平台 - 故障排除和诊断脚本
# 全面的问题诊断和解决方案

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
TROUBLESHOOT_LOG="logs/troubleshoot.log"
DIAGNOSTIC_REPORT="logs/diagnostic-report-$(date +%Y%m%d_%H%M%S).html"
TEMP_DIR="/tmp/n8n-troubleshoot"

# 日志函数
log_info() {
    local message="$1"
    echo -e "${BLUE}[INFO]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $message" >> "$TROUBLESHOOT_LOG"
}

log_success() {
    local message="$1"
    echo -e "${GREEN}[SUCCESS]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $message" >> "$TROUBLESHOOT_LOG"
}

log_warning() {
    local message="$1"
    echo -e "${YELLOW}[WARNING]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $message" >> "$TROUBLESHOOT_LOG"
}

log_error() {
    local message="$1"
    echo -e "${RED}[ERROR]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $message" >> "$TROUBLESHOOT_LOG"
}

log_critical() {
    local message="$1"
    echo -e "${RED}[CRITICAL]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [CRITICAL] $message" >> "$TROUBLESHOOT_LOG"
}

log_header() {
    local message="$1"
    echo -e "${PURPLE}[HEADER]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [HEADER] $message" >> "$TROUBLESHOOT_LOG"
}

# 创建故障排除目录
create_troubleshoot_directories() {
    mkdir -p logs
    mkdir -p "$TEMP_DIR"
    touch "$TROUBLESHOOT_LOG"
}

# 系统环境检查
check_system_environment() {
    log_header "系统环境检查"
    
    # 检查操作系统
    log_info "检查操作系统..."
    local os_info=$(uname -a)
    log_info "操作系统: $os_info"
    
    # 检查系统资源
    log_info "检查系统资源..."
    local cpu_cores=$(sysctl -n hw.ncpu)
    local total_memory=$(sysctl -n hw.memsize | awk '{print int($1/1024/1024/1024)"GB"}')
    local disk_space=$(df -h . | tail -1 | awk '{print $2}')
    
    log_info "CPU核心数: $cpu_cores"
    log_info "总内存: $total_memory"
    log_info "磁盘空间: $disk_space"
    
    # 检查必要的命令
    log_info "检查必要的命令..."
    local required_commands=("docker" "docker-compose" "curl" "nc" "jq")
    local missing_commands=()
    
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_commands+=("$cmd")
            log_error "缺少必要命令: $cmd"
        else
            log_success "命令可用: $cmd"
        fi
    done
    
    if [ ${#missing_commands[@]} -gt 0 ]; then
        log_critical "缺少必要命令，请安装: ${missing_commands[*]}"
        return 1
    fi
    
    # 检查网络连接
    log_info "检查网络连接..."
    if ping -c 1 google.com &> /dev/null; then
        log_success "网络连接正常"
    else
        log_warning "网络连接可能存在问题"
    fi
    
    return 0
}

# Docker环境检查
check_docker_environment() {
    log_header "Docker环境检查"
    
    # 检查Docker服务
    log_info "检查Docker服务..."
    if ! docker info &>/dev/null; then
        log_critical "Docker服务未运行或无法访问"
        log_info "尝试启动Docker服务..."
        
        # 尝试启动Docker（macOS）
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open -a Docker
            log_info "正在启动Docker Desktop，请等待..."
            sleep 30
            
            # 再次检查
            if docker info &>/dev/null; then
                log_success "Docker服务已启动"
            else
                log_critical "无法启动Docker服务，请手动启动Docker Desktop"
                return 1
            fi
        else
            log_error "请手动启动Docker服务"
            return 1
        fi
    else
        log_success "Docker服务运行正常"
    fi
    
    # 检查Docker版本
    local docker_version=$(docker --version)
    log_info "Docker版本: $docker_version"
    
    # 检查Docker Compose版本
    local compose_version=$(docker-compose --version)
    log_info "Docker Compose版本: $compose_version"
    
    # 检查Docker资源限制
    log_info "检查Docker资源配置..."
    local docker_info=$(docker system info --format json 2>/dev/null || echo "{}")
    
    if [ "$docker_info" != "{}" ]; then
        local total_memory=$(echo "$docker_info" | jq -r '.MemTotal // "unknown"')
        local ncpu=$(echo "$docker_info" | jq -r '.NCPU // "unknown"')
        
        log_info "Docker可用内存: $total_memory bytes"
        log_info "Docker可用CPU: $ncpu"
        
        # 检查内存是否足够（至少4GB）
        if [ "$total_memory" != "unknown" ] && [ "$total_memory" -lt 4294967296 ]; then
            log_warning "Docker可用内存可能不足，建议至少分配4GB内存"
        fi
    fi
    
    # 检查Docker磁盘使用情况
    log_info "检查Docker磁盘使用情况..."
    local disk_usage=$(docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}\t{{.Reclaimable}}" 2>/dev/null || echo "")
    
    if [ -n "$disk_usage" ]; then
        log_info "Docker磁盘使用情况:"
        echo "$disk_usage" | while read line; do
            log_info "  $line"
        done
    fi
    
    return 0
}

# 项目配置检查
check_project_configuration() {
    log_header "项目配置检查"
    
    # 检查项目文件
    log_info "检查项目文件..."
    local required_files=("docker-compose.yml" ".env")
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
            log_error "缺少必要文件: $file"
        else
            log_success "文件存在: $file"
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        log_critical "缺少必要文件: ${missing_files[*]}"
        return 1
    fi
    
    # 检查环境变量
    log_info "检查环境变量配置..."
    if [ -f ".env" ]; then
        local required_vars=("POSTGRES_PASSWORD" "N8N_ENCRYPTION_KEY" "WEBHOOK_URL")
        local missing_vars=()
        
        for var in "${required_vars[@]}"; do
            if ! grep -q "^$var=" .env; then
                missing_vars+=("$var")
                log_error "缺少环境变量: $var"
            else
                log_success "环境变量存在: $var"
            fi
        done
        
        if [ ${#missing_vars[@]} -gt 0 ]; then
            log_warning "缺少环境变量: ${missing_vars[*]}"
        fi
    fi
    
    # 检查Docker Compose配置
    log_info "检查Docker Compose配置..."
    if docker-compose config &>/dev/null; then
        log_success "Docker Compose配置有效"
    else
        log_error "Docker Compose配置无效"
        log_info "配置验证输出:"
        docker-compose config 2>&1 | while read line; do
            log_info "  $line"
        done
        return 1
    fi
    
    # 检查端口占用
    log_info "检查端口占用情况..."
    local ports=("5678" "5432" "6379")
    
    for port in "${ports[@]}"; do
        if lsof -i :$port &>/dev/null; then
            local process=$(lsof -i :$port | tail -1 | awk '{print $1, $2}')
            log_warning "端口 $port 已被占用: $process"
        else
            log_success "端口 $port 可用"
        fi
    done
    
    return 0
}

# 服务状态检查
check_services_status() {
    log_header "服务状态检查"
    
    # 检查容器状态
    log_info "检查容器状态..."
    local containers=$(docker-compose ps --format "table {{.Name}}\t{{.State}}\t{{.Status}}")
    
    if [ -n "$containers" ]; then
        log_info "容器状态:"
        echo "$containers" | while read line; do
            log_info "  $line"
        done
        
        # 检查每个服务的具体状态
        local services=("n8n" "postgres" "redis")
        
        for service in "${services[@]}"; do
            if docker-compose ps "$service" | grep -q "Up"; then
                log_success "$service 服务运行正常"
            else
                log_error "$service 服务未运行"
                
                # 获取服务日志
                log_info "获取 $service 服务日志..."
                local logs=$(docker-compose logs --tail=10 "$service" 2>/dev/null || echo "无法获取日志")
                echo "$logs" | while read line; do
                    log_info "  $line"
                done
            fi
        done
    else
        log_warning "未发现运行中的容器"
    fi
    
    return 0
}

# 网络连接检查
check_network_connectivity() {
    log_header "网络连接检查"
    
    # 检查服务端口连接
    log_info "检查服务端口连接..."
    local services=("localhost:5678:N8N" "localhost:5432:PostgreSQL" "localhost:6379:Redis")
    
    for service_info in "${services[@]}"; do
        local host_port=$(echo "$service_info" | cut -d: -f1,2)
        local service_name=$(echo "$service_info" | cut -d: -f3)
        local host=$(echo "$host_port" | cut -d: -f1)
        local port=$(echo "$host_port" | cut -d: -f2)
        
        if nc -z "$host" "$port" 2>/dev/null; then
            log_success "$service_name 端口连接正常 ($host_port)"
        else
            log_error "$service_name 端口连接失败 ($host_port)"
        fi
    done
    
    # 检查N8N Web界面
    log_info "检查N8N Web界面..."
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5678 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        log_success "N8N Web界面可访问"
    else
        log_error "N8N Web界面不可访问，HTTP状态码: $response"
    fi
    
    # 检查数据库连接
    log_info "检查数据库连接..."
    if docker-compose exec -T postgres pg_isready -U n8n_user &>/dev/null; then
        log_success "PostgreSQL数据库连接正常"
    else
        log_error "PostgreSQL数据库连接失败"
    fi
    
    # 检查Redis连接
    log_info "检查Redis连接..."
    if docker-compose exec -T redis redis-cli ping &>/dev/null; then
        log_success "Redis连接正常"
    else
        log_error "Redis连接失败"
    fi
    
    return 0
}

# 日志分析
analyze_logs() {
    log_header "日志分析"
    
    # 分析N8N日志
    log_info "分析N8N日志..."
    local n8n_logs=$(docker-compose logs --tail=50 n8n 2>/dev/null || echo "")
    
    if [ -n "$n8n_logs" ]; then
        # 检查错误日志
        local error_count=$(echo "$n8n_logs" | grep -i "error" | wc -l | xargs)
        local warning_count=$(echo "$n8n_logs" | grep -i "warning" | wc -l | xargs)
        
        log_info "N8N日志统计:"
        log_info "  错误数量: $error_count"
        log_info "  警告数量: $warning_count"
        
        if [ "$error_count" -gt 0 ]; then
            log_warning "发现N8N错误日志:"
            echo "$n8n_logs" | grep -i "error" | tail -5 | while read line; do
                log_info "  $line"
            done
        fi
        
        if [ "$warning_count" -gt 0 ]; then
            log_info "最近的N8N警告:"
            echo "$n8n_logs" | grep -i "warning" | tail -3 | while read line; do
                log_info "  $line"
            done
        fi
    else
        log_warning "无法获取N8N日志"
    fi
    
    # 分析PostgreSQL日志
    log_info "分析PostgreSQL日志..."
    local postgres_logs=$(docker-compose logs --tail=30 postgres 2>/dev/null || echo "")
    
    if [ -n "$postgres_logs" ]; then
        local error_count=$(echo "$postgres_logs" | grep -i "error\|fatal" | wc -l | xargs)
        
        log_info "PostgreSQL日志统计:"
        log_info "  错误数量: $error_count"
        
        if [ "$error_count" -gt 0 ]; then
            log_warning "发现PostgreSQL错误日志:"
            echo "$postgres_logs" | grep -i "error\|fatal" | tail -3 | while read line; do
                log_info "  $line"
            done
        fi
    else
        log_warning "无法获取PostgreSQL日志"
    fi
    
    # 分析Redis日志
    log_info "分析Redis日志..."
    local redis_logs=$(docker-compose logs --tail=20 redis 2>/dev/null || echo "")
    
    if [ -n "$redis_logs" ]; then
        local warning_count=$(echo "$redis_logs" | grep -i "warning" | wc -l | xargs)
        
        log_info "Redis日志统计:"
        log_info "  警告数量: $warning_count"
        
        if [ "$warning_count" -gt 0 ]; then
            log_info "最近的Redis警告:"
            echo "$redis_logs" | grep -i "warning" | tail -2 | while read line; do
                log_info "  $line"
            done
        fi
    else
        log_warning "无法获取Redis日志"
    fi
    
    return 0
}

# 数据库健康检查
check_database_health() {
    log_header "数据库健康检查"
    
    # 检查数据库连接
    if ! docker-compose exec -T postgres pg_isready -U n8n_user &>/dev/null; then
        log_error "无法连接到数据库"
        return 1
    fi
    
    # 检查数据库大小
    log_info "检查数据库大小..."
    local db_size=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
        SELECT pg_size_pretty(pg_database_size('n8n'));
    " 2>/dev/null | xargs || echo "unknown")
    
    log_info "N8N数据库大小: $db_size"
    
    # 检查表数量
    local table_count=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
        SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';
    " 2>/dev/null | xargs || echo "0")
    
    log_info "数据库表数量: $table_count"
    
    # 检查连接数
    local connections=$(docker-compose exec -T postgres psql -U n8n_user -d postgres -t -c "
        SELECT count(*) FROM pg_stat_activity;
    " 2>/dev/null | xargs || echo "0")
    
    log_info "当前数据库连接数: $connections"
    
    # 检查长时间运行的查询
    local long_queries=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
        SELECT count(*) 
        FROM pg_stat_activity 
        WHERE state = 'active' 
        AND query_start < now() - interval '5 minutes';
    " 2>/dev/null | xargs || echo "0")
    
    if [ "$long_queries" -gt 0 ]; then
        log_warning "发现 $long_queries 个长时间运行的查询"
    else
        log_success "未发现长时间运行的查询"
    fi
    
    # 检查锁等待
    local lock_waits=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
        SELECT count(*) 
        FROM pg_stat_activity 
        WHERE wait_event_type = 'Lock';
    " 2>/dev/null | xargs || echo "0")
    
    if [ "$lock_waits" -gt 0 ]; then
        log_warning "发现 $lock_waits 个锁等待"
    else
        log_success "未发现锁等待"
    fi
    
    return 0
}

# 工作流执行检查
check_workflow_execution() {
    log_header "工作流执行检查"
    
    # 检查最近的工作流执行
    log_info "检查最近的工作流执行..."
    local recent_executions=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'success' THEN 1 END) as success,
            COUNT(CASE WHEN status = 'error' THEN 1 END) as error,
            COUNT(CASE WHEN status = 'running' THEN 1 END) as running
        FROM execution_entity 
        WHERE started_at > NOW() - INTERVAL '1 hour';
    " 2>/dev/null | xargs || echo "0 0 0 0")
    
    local total=$(echo "$recent_executions" | awk '{print $1}')
    local success=$(echo "$recent_executions" | awk '{print $2}')
    local error=$(echo "$recent_executions" | awk '{print $3}')
    local running=$(echo "$recent_executions" | awk '{print $4}')
    
    log_info "过去1小时工作流执行统计:"
    log_info "  总执行次数: $total"
    log_info "  成功执行: $success"
    log_info "  失败执行: $error"
    log_info "  正在运行: $running"
    
    # 计算成功率
    if [ "$total" -gt 0 ]; then
        local success_rate=$(( success * 100 / total ))
        
        if [ "$success_rate" -lt 80 ]; then
            log_warning "工作流成功率较低: ${success_rate}%"
        else
            log_success "工作流成功率正常: ${success_rate}%"
        fi
    fi
    
    # 检查失败的工作流
    if [ "$error" -gt 0 ]; then
        log_warning "检查最近失败的工作流..."
        local failed_workflows=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
            SELECT 
                workflow_id,
                started_at,
                substring(status_message, 1, 100) as error_message
            FROM execution_entity 
            WHERE status = 'error' 
            AND started_at > NOW() - INTERVAL '1 hour'
            ORDER BY started_at DESC 
            LIMIT 3;
        " 2>/dev/null || echo "")
        
        if [ -n "$failed_workflows" ]; then
            log_info "最近失败的工作流:"
            echo "$failed_workflows" | while read line; do
                log_info "  $line"
            done
        fi
    fi
    
    # 检查长时间运行的工作流
    if [ "$running" -gt 0 ]; then
        log_info "检查长时间运行的工作流..."
        local long_running=$(docker-compose exec -T postgres psql -U n8n_user -d n8n -t -c "
            SELECT 
                workflow_id,
                started_at,
                EXTRACT(EPOCH FROM (NOW() - started_at)) as duration_seconds
            FROM execution_entity 
            WHERE status = 'running' 
            AND started_at < NOW() - INTERVAL '10 minutes'
            ORDER BY started_at ASC;
        " 2>/dev/null || echo "")
        
        if [ -n "$long_running" ]; then
            log_warning "发现长时间运行的工作流:"
            echo "$long_running" | while read line; do
                log_info "  $line"
            done
        fi
    fi
    
    return 0
}

# 磁盘空间检查
check_disk_space() {
    log_header "磁盘空间检查"
    
    # 检查系统磁盘空间
    log_info "检查系统磁盘空间..."
    local disk_usage=$(df -h .)
    log_info "磁盘使用情况:"
    echo "$disk_usage" | while read line; do
        log_info "  $line"
    done
    
    # 检查Docker磁盘使用
    log_info "检查Docker磁盘使用..."
    local docker_disk=$(docker system df 2>/dev/null || echo "")
    
    if [ -n "$docker_disk" ]; then
        log_info "Docker磁盘使用:"
        echo "$docker_disk" | while read line; do
            log_info "  $line"
        done
    fi
    
    # 检查日志文件大小
    log_info "检查日志文件大小..."
    if [ -d "logs" ]; then
        local log_size=$(du -sh logs 2>/dev/null | awk '{print $1}' || echo "0")
        log_info "日志目录大小: $log_size"
        
        # 检查大日志文件
        local large_logs=$(find logs -name "*.log" -size +100M 2>/dev/null || echo "")
        if [ -n "$large_logs" ]; then
            log_warning "发现大日志文件:"
            echo "$large_logs" | while read file; do
                local size=$(du -sh "$file" | awk '{print $1}')
                log_info "  $file: $size"
            done
        fi
    fi
    
    # 检查数据目录大小
    if [ -d "data" ]; then
        local data_size=$(du -sh data 2>/dev/null | awk '{print $1}' || echo "0")
        log_info "数据目录大小: $data_size"
    fi
    
    return 0
}

# 生成故障排除建议
generate_troubleshooting_suggestions() {
    log_header "生成故障排除建议"
    
    local suggestions=()
    
    # 基于检查结果生成建议
    
    # 检查Docker服务
    if ! docker info &>/dev/null; then
        suggestions+=("Docker服务未运行，请启动Docker Desktop或Docker服务")
    fi
    
    # 检查容器状态
    if ! docker-compose ps n8n | grep -q "Up"; then
        suggestions+=("N8N容器未运行，尝试执行: docker-compose up -d n8n")
    fi
    
    if ! docker-compose ps postgres | grep -q "Up"; then
        suggestions+=("PostgreSQL容器未运行，尝试执行: docker-compose up -d postgres")
    fi
    
    if ! docker-compose ps redis | grep -q "Up"; then
        suggestions+=("Redis容器未运行，尝试执行: docker-compose up -d redis")
    fi
    
    # 检查端口占用
    if lsof -i :5678 &>/dev/null && ! docker-compose ps n8n | grep -q "Up"; then
        suggestions+=("端口5678被占用，请停止占用该端口的进程或更改N8N端口")
    fi
    
    # 检查配置文件
    if [ ! -f ".env" ]; then
        suggestions+=("缺少.env配置文件，请从.env.example复制并配置")
    fi
    
    if [ ! -f "docker-compose.yml" ]; then
        suggestions+=("缺少docker-compose.yml文件，请确保在正确的项目目录中")
    fi
    
    # 检查网络连接
    if ! curl -s http://localhost:5678 &>/dev/null; then
        suggestions+=("无法访问N8N Web界面，检查服务状态和网络配置")
    fi
    
    # 检查数据库连接
    if ! docker-compose exec -T postgres pg_isready -U n8n_user &>/dev/null; then
        suggestions+=("数据库连接失败，检查PostgreSQL服务状态和连接配置")
    fi
    
    # 检查磁盘空间
    local disk_usage=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -ge 90 ]; then
        suggestions+=("磁盘空间不足，请清理不必要的文件或扩展磁盘空间")
    fi
    
    # 输出建议
    if [ ${#suggestions[@]} -gt 0 ]; then
        log_info "故障排除建议:"
        for i in "${!suggestions[@]}"; do
            log_info "  $((i+1)). ${suggestions[$i]}"
        done
    else
        log_success "系统运行正常，暂无故障排除建议"
    fi
    
    # 通用建议
    log_info "通用故障排除步骤:"
    log_info "  1. 检查所有服务是否正常运行: docker-compose ps"
    log_info "  2. 查看服务日志: docker-compose logs [service_name]"
    log_info "  3. 重启服务: docker-compose restart [service_name]"
    log_info "  4. 重新构建服务: docker-compose up -d --build [service_name]"
    log_info "  5. 完全重启: docker-compose down && docker-compose up -d"
    log_info "  6. 清理Docker资源: docker system prune -f"
    log_info "  7. 检查系统资源: ./scripts/health-check.sh"
    log_info "  8. 查看详细诊断: ./scripts/troubleshoot.sh diagnose"
}

# 自动修复常见问题
auto_fix_common_issues() {
    log_header "自动修复常见问题"
    
    local fixed_issues=()
    
    # 修复Docker服务
    if ! docker info &>/dev/null; then
        log_info "尝试启动Docker服务..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open -a Docker
            sleep 30
            if docker info &>/dev/null; then
                fixed_issues+=("启动Docker服务")
                log_success "Docker服务已启动"
            else
                log_error "无法自动启动Docker服务"
            fi
        fi
    fi
    
    # 修复停止的容器
    local stopped_containers=$(docker-compose ps --filter "status=exited" -q)
    if [ -n "$stopped_containers" ]; then
        log_info "发现停止的容器，尝试重启..."
        if docker-compose up -d; then
            fixed_issues+=("重启停止的容器")
            log_success "容器已重启"
        else
            log_error "无法重启容器"
        fi
    fi
    
    # 清理Docker资源
    log_info "清理未使用的Docker资源..."
    if docker system prune -f &>/dev/null; then
        fixed_issues+=("清理Docker资源")
        log_success "Docker资源已清理"
    fi
    
    # 修复权限问题
    if [ -d "data" ]; then
        log_info "修复数据目录权限..."
        if chmod -R 755 data 2>/dev/null; then
            fixed_issues+=("修复数据目录权限")
            log_success "数据目录权限已修复"
        fi
    fi
    
    # 修复日志目录
    if [ ! -d "logs" ]; then
        log_info "创建日志目录..."
        if mkdir -p logs; then
            fixed_issues+=("创建日志目录")
            log_success "日志目录已创建"
        fi
    fi
    
    # 输出修复结果
    if [ ${#fixed_issues[@]} -gt 0 ]; then
        log_success "已自动修复的问题:"
        for issue in "${fixed_issues[@]}"; do
            log_info "  - $issue"
        done
    else
        log_info "未发现可自动修复的问题"
    fi
}

# 生成诊断报告
generate_diagnostic_report() {
    log_header "生成诊断报告"
    
    # 收集系统信息
    local os_info=$(uname -a)
    local docker_version=$(docker --version 2>/dev/null || echo "未安装")
    local compose_version=$(docker-compose --version 2>/dev/null || echo "未安装")
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # 收集服务状态
    local n8n_status=$(docker-compose ps n8n | grep -q "Up" && echo "运行中" || echo "已停止")
    local postgres_status=$(docker-compose ps postgres | grep -q "Up" && echo "运行中" || echo "已停止")
    local redis_status=$(docker-compose ps redis | grep -q "Up" && echo "运行中" || echo "已停止")
    
    # 收集资源信息
    local cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' | cut -d. -f1)
    local memory_info=$(vm_stat | grep -E "Pages (free|active|inactive|speculative|wired)" | awk '{print $3}' | sed 's/\.//')
    local page_size=4096
    local free_pages=$(echo "$memory_info" | sed -n '1p')
    local active_pages=$(echo "$memory_info" | sed -n '2p')
    local inactive_pages=$(echo "$memory_info" | sed -n '3p')
    local speculative_pages=$(echo "$memory_info" | sed -n '4p')
    local wired_pages=$(echo "$memory_info" | sed -n '5p')
    local total_memory=$(( (free_pages + active_pages + inactive_pages + speculative_pages + wired_pages) * page_size / 1024 / 1024 ))
    local used_memory=$(( (active_pages + inactive_pages + wired_pages) * page_size / 1024 / 1024 ))
    local memory_usage=$(( used_memory * 100 / total_memory ))
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}')
    
    # 生成HTML报告
    cat > "$DIAGNOSTIC_REPORT" << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>N8N系统诊断报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .section h3 { color: #007bff; margin-top: 0; }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .status-card { padding: 15px; border-radius: 8px; text-align: center; }
        .status-success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .status-warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        .status-error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .info-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .info-table th, .info-table td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .info-table th { background: #f8f9fa; font-weight: bold; }
        .log-section { background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; max-height: 300px; overflow-y: auto; }
        .recommendations { background: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; }
        .recommendations ul { margin: 10px 0; padding-left: 20px; }
        .timestamp { text-align: center; color: #6c757d; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>N8N企业级自动化工作流平台诊断报告</h1>
            <p>诊断执行时间: $timestamp</p>
        </div>
        
        <div class="section">
            <h3>系统信息</h3>
            <table class="info-table">
                <tr><th>操作系统</th><td>$os_info</td></tr>
                <tr><th>Docker版本</th><td>$docker_version</td></tr>
                <tr><th>Docker Compose版本</th><td>$compose_version</td></tr>
                <tr><th>CPU使用率</th><td>${cpu_usage}%</td></tr>
                <tr><th>内存使用率</th><td>${memory_usage}% (${used_memory}MB/${total_memory}MB)</td></tr>
                <tr><th>磁盘使用率</th><td>$disk_usage</td></tr>
            </table>
        </div>
        
        <div class="section">
            <h3>服务状态</h3>
            <div class="status-grid">
                <div class="status-card $([ "$n8n_status" = "运行中" ] && echo "status-success" || echo "status-error")">
                    <h4>N8N服务</h4>
                    <p>$n8n_status</p>
                </div>
                <div class="status-card $([ "$postgres_status" = "运行中" ] && echo "status-success" || echo "status-error")">
                    <h4>PostgreSQL</h4>
                    <p>$postgres_status</p>
                </div>
                <div class="status-card $([ "$redis_status" = "运行中" ] && echo "status-success" || echo "status-error")">
                    <h4>Redis</h4>
                    <p>$redis_status</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h3>网络连接检查</h3>
            <table class="info-table">
                <tr><th>服务</th><th>端口</th><th>状态</th></tr>
                <tr><td>N8N</td><td>5678</td><td>$(nc -z localhost 5678 && echo "正常" || echo "异常")</td></tr>
                <tr><td>PostgreSQL</td><td>5432</td><td>$(nc -z localhost 5432 && echo "正常" || echo "异常")</td></tr>
                <tr><td>Redis</td><td>6379</td><td>$(nc -z localhost 6379 && echo "正常" || echo "异常")</td></tr>
            </table>
        </div>
        
        <div class="section">
            <h3>最近的错误日志</h3>
            <div class="log-section">
$(docker-compose logs --tail=20 2>/dev/null | grep -i "error\|warning\|fatal" | tail -10 | sed 's/</\&lt;/g; s/>/\&gt;/g' || echo "无法获取日志")
            </div>
        </div>
        
        <div class="recommendations">
            <h3>故障排除建议</h3>
            <ul>
                <li>如果服务未运行，尝试执行: <code>docker-compose up -d</code></li>
                <li>如果端口连接异常，检查防火墙设置和端口占用</li>
                <li>如果出现权限错误，检查文件和目录权限</li>
                <li>如果内存使用率过高，考虑增加系统内存或优化配置</li>
                <li>如果磁盘空间不足，清理不必要的文件和Docker资源</li>
                <li>定期执行系统维护: <code>./scripts/maintenance.sh</code></li>
                <li>查看详细日志: <code>docker-compose logs [service_name]</code></li>
                <li>重启所有服务: <code>docker-compose restart</code></li>
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
    
    log_success "诊断报告已生成: $DIAGNOSTIC_REPORT"
}

# 完整诊断
full_diagnosis() {
    log_header "开始完整系统诊断"
    
    local start_time=$(date +%s)
    local issues_found=0
    
    # 执行所有检查
    check_system_environment || ((issues_found++))
    check_docker_environment || ((issues_found++))
    check_project_configuration || ((issues_found++))
    check_services_status || ((issues_found++))
    check_network_connectivity || ((issues_found++))
    analyze_logs || ((issues_found++))
    check_database_health || ((issues_found++))
    check_workflow_execution || ((issues_found++))
    check_disk_space || ((issues_found++))
    
    # 生成建议和报告
    generate_troubleshooting_suggestions
    generate_diagnostic_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [ "$issues_found" -eq 0 ]; then
        log_success "完整诊断完成，未发现问题，耗时: ${duration}秒"
    else
        log_warning "完整诊断完成，发现 $issues_found 个问题，耗时: ${duration}秒"
    fi
}

# 快速诊断
quick_diagnosis() {
    log_header "开始快速系统诊断"
    
    # 只执行关键检查
    check_docker_environment
    check_services_status
    check_network_connectivity
    
    log_success "快速诊断完成"
}

# 显示使用帮助
show_help() {
    echo "N8N企业级自动化工作流平台故障排除和诊断脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  diagnose                执行完整系统诊断"
    echo "  quick                   执行快速诊断"
    echo "  fix                     自动修复常见问题"
    echo "  system                  检查系统环境"
    echo "  docker                  检查Docker环境"
    echo "  config                  检查项目配置"
    echo "  services                检查服务状态"
    echo "  network                 检查网络连接"
    echo "  logs                    分析日志"
    echo "  database                检查数据库健康"
    echo "  workflow                检查工作流执行"
    echo "  disk                    检查磁盘空间"
    echo "  suggest                 生成故障排除建议"
    echo "  report                  生成诊断报告"
    echo ""
    echo "示例:"
    echo "  $0 diagnose             # 执行完整诊断"
    echo "  $0 quick                # 执行快速诊断"
    echo "  $0 fix                  # 自动修复常见问题"
    echo "  $0 services             # 只检查服务状态"
    echo "  $0 logs                 # 只分析日志"
    echo "  $0 suggest              # 生成故障排除建议"
    echo ""
    echo "常见问题解决方案:"
    echo "  1. 服务无法启动:"
    echo "     - 检查Docker服务是否运行"
    echo "     - 检查端口是否被占用"
    echo "     - 检查配置文件是否正确"
    echo ""
    echo "  2. 无法访问Web界面:"
    echo "     - 检查N8N服务状态"
    echo "     - 检查防火墙设置"
    echo "     - 检查端口映射配置"
    echo ""
    echo "  3. 数据库连接失败:"
    echo "     - 检查PostgreSQL服务状态"
    echo "     - 检查数据库配置"
    echo "     - 检查网络连接"
    echo ""
    echo "  4. 工作流执行失败:"
    echo "     - 检查工作流配置"
    echo "     - 检查系统资源"
    echo "     - 查看错误日志"
    echo ""
}

# 主函数
main() {
    # 创建故障排除目录
    create_troubleshoot_directories
    
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    local command="$1"
    shift
    
    case $command in
        "diagnose")
            full_diagnosis
            ;;
        "quick")
            quick_diagnosis
            ;;
        "fix")
            auto_fix_common_issues
            ;;
        "system")
            check_system_environment
            ;;
        "docker")
            check_docker_environment
            ;;
        "config")
            check_project_configuration
            ;;
        "services")
            check_services_status
            ;;
        "network")
            check_network_connectivity
            ;;
        "logs")
            analyze_logs
            ;;
        "database")
            check_database_health
            ;;
        "workflow")
            check_workflow_execution
            ;;
        "disk")
            check_disk_space
            ;;
        "suggest")
            generate_troubleshooting_suggestions
            ;;
        "report")
            generate_diagnostic_report
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