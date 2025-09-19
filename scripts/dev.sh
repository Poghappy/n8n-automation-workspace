#!/bin/bash

# N8N企业级自动化工作流平台 - 开发环境管理脚本
# 提供开发模式启动、调试、热重载等功能

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
DEV_LOG="logs/dev.log"
DEV_COMPOSE_FILE="docker-compose.dev.yml"
WATCH_DIRS=("config" "scripts" "docs")
RELOAD_DELAY=2

# 日志函数
log_info() {
    local message="$1"
    echo -e "${BLUE}[INFO]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $message" >> "$DEV_LOG"
}

log_success() {
    local message="$1"
    echo -e "${GREEN}[SUCCESS]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $message" >> "$DEV_LOG"
}

log_warning() {
    local message="$1"
    echo -e "${YELLOW}[WARNING]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $message" >> "$DEV_LOG"
}

log_error() {
    local message="$1"
    echo -e "${RED}[ERROR]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $message" >> "$DEV_LOG"
}

log_debug() {
    local message="$1"
    if [ "${DEBUG:-false}" = "true" ]; then
        echo -e "${PURPLE}[DEBUG]${NC} $message"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DEBUG] $message" >> "$DEV_LOG"
    fi
}

log_header() {
    local message="$1"
    echo -e "${CYAN}[HEADER]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [HEADER] $message" >> "$DEV_LOG"
}

# 创建开发目录
create_dev_directories() {
    mkdir -p logs
    mkdir -p data/dev
    mkdir -p config/dev
    touch "$DEV_LOG"
}

# 检查开发环境要求
check_dev_requirements() {
    log_header "检查开发环境要求"
    
    # 检查必要命令
    local required_commands=("docker" "docker-compose" "curl" "jq" "fswatch")
    local missing_commands=()
    
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_commands+=("$cmd")
        fi
    done
    
    if [ ${#missing_commands[@]} -gt 0 ]; then
        log_error "缺少必要命令: ${missing_commands[*]}"
        log_info "请安装缺少的命令："
        for cmd in "${missing_commands[@]}"; do
            case $cmd in
                "fswatch")
                    if [[ "$OSTYPE" == "darwin"* ]]; then
                        log_info "  brew install fswatch"
                    else
                        log_info "  apt-get install fswatch 或 yum install fswatch"
                    fi
                    ;;
                "jq")
                    if [[ "$OSTYPE" == "darwin"* ]]; then
                        log_info "  brew install jq"
                    else
                        log_info "  apt-get install jq 或 yum install jq"
                    fi
                    ;;
                *)
                    log_info "  请安装 $cmd"
                    ;;
            esac
        done
        return 1
    fi
    
    log_success "开发环境要求检查通过"
}

# 创建开发环境配置
create_dev_config() {
    log_header "创建开发环境配置"
    
    # 创建开发环境的docker-compose文件
    if [ ! -f "$DEV_COMPOSE_FILE" ]; then
        log_info "创建开发环境Docker Compose配置..."
        
        cat > "$DEV_COMPOSE_FILE" << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n_user
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - N8N_HOST=${N8N_HOST:-localhost}
      - N8N_PORT=5678
      - N8N_PROTOCOL=${N8N_PROTOCOL:-http}
      - WEBHOOK_URL=${WEBHOOK_URL:-http://localhost:5678/}
      - GENERIC_TIMEZONE=${GENERIC_TIMEZONE:-Asia/Shanghai}
      - N8N_LOG_LEVEL=debug
      - N8N_METRICS=true
      - N8N_DIAGNOSTICS_ENABLED=false
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=168
      - N8N_PERSONALIZATION_ENABLED=false
      - N8N_VERSION_NOTIFICATIONS_ENABLED=false
      - N8N_TEMPLATES_ENABLED=true
      - N8N_ONBOARDING_FLOW_DISABLED=true
      - N8N_DISABLE_UI=false
      - N8N_EDITOR_BASE_URL=${N8N_EDITOR_BASE_URL:-}
      - N8N_SECURE_COOKIE=false
      - N8N_HIRING_BANNER_ENABLED=false
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
      - ./config/n8n:/etc/n8n:ro
      - ./logs:/var/log/n8n
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

  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=C --lc-ctype=C
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config/init-scripts:/docker-entrypoint-initdb.d:ro
      - ./logs:/var/log/postgresql
    ports:
      - "5432:5432"
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n_user -d n8n"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-}
    volumes:
      - redis_data:/data
      - ./config/redis:/usr/local/etc/redis:ro
      - ./logs:/var/log/redis
    ports:
      - "6379:6379"
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  n8n_data:
    driver: local
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  n8n-network:
    driver: bridge
EOF
        
        log_success "开发环境Docker Compose配置已创建"
    else
        log_info "开发环境Docker Compose配置已存在"
    fi
    
    # 创建开发环境变量文件
    if [ ! -f ".env.dev" ]; then
        log_info "创建开发环境变量文件..."
        
        # 复制主环境变量文件
        if [ -f ".env" ]; then
            cp .env .env.dev
        else
            # 创建基础开发环境变量
            cat > .env.dev << 'EOF'
# N8N开发环境配置

# 数据库配置
POSTGRES_PASSWORD=dev_password_123
POSTGRES_USER=n8n_user
POSTGRES_DB=n8n

# Redis配置
REDIS_PASSWORD=dev_redis_123

# N8N配置
N8N_ENCRYPTION_KEY=dev_encryption_key_very_long_and_secure_123456789
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http
WEBHOOK_URL=http://localhost:5678/
GENERIC_TIMEZONE=Asia/Shanghai

# 开发模式配置
NODE_ENV=development
DEBUG=true
N8N_LOG_LEVEL=debug
N8N_METRICS=true
EOF
        fi
        
        log_success "开发环境变量文件已创建"
    else
        log_info "开发环境变量文件已存在"
    fi
}

# 启动开发环境
start_dev_environment() {
    log_header "启动开发环境"
    
    # 检查环境变量文件
    if [ ! -f ".env.dev" ]; then
        log_error "开发环境变量文件不存在，请先运行 setup 命令"
        return 1
    fi
    
    # 导出环境变量
    set -a
    source .env.dev
    set +a
    
    log_info "启动开发环境服务..."
    
    # 使用开发配置启动服务
    if docker-compose -f "$DEV_COMPOSE_FILE" up -d; then
        log_success "开发环境服务启动成功"
        
        # 等待服务就绪
        log_info "等待服务就绪..."
        sleep 10
        
        # 检查服务状态
        check_dev_services
        
        # 显示访问信息
        show_dev_info
    else
        log_error "开发环境服务启动失败"
        return 1
    fi
}

# 停止开发环境
stop_dev_environment() {
    log_header "停止开发环境"
    
    log_info "停止开发环境服务..."
    
    if docker-compose -f "$DEV_COMPOSE_FILE" down; then
        log_success "开发环境服务已停止"
    else
        log_error "停止开发环境服务失败"
        return 1
    fi
}

# 重启开发环境
restart_dev_environment() {
    log_header "重启开发环境"
    
    stop_dev_environment
    sleep 2
    start_dev_environment
}

# 检查开发服务状态
check_dev_services() {
    log_header "检查开发服务状态"
    
    local services=("postgres" "redis" "n8n")
    local all_healthy=true
    
    for service in "${services[@]}"; do
        log_info "检查 $service 服务状态..."
        
        local status=$(docker-compose -f "$DEV_COMPOSE_FILE" ps "$service" --format "table {{.State}}" | tail -n +2 | xargs)
        
        if [ "$status" = "running" ]; then
            log_success "$service 服务运行正常"
        else
            log_error "$service 服务状态异常: $status"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        log_success "所有开发服务运行正常"
    else
        log_warning "部分开发服务状态异常"
    fi
}

# 显示开发环境信息
show_dev_info() {
    log_header "开发环境信息"
    
    echo ""
    echo -e "${GREEN}=== N8N开发环境访问信息 ===${NC}"
    echo -e "${BLUE}N8N Web界面:${NC} http://localhost:5678"
    echo -e "${BLUE}PostgreSQL:${NC} localhost:5432"
    echo -e "${BLUE}Redis:${NC} localhost:6379"
    echo ""
    echo -e "${GREEN}=== 开发工具 ===${NC}"
    echo -e "${BLUE}查看日志:${NC} $0 logs"
    echo -e "${BLUE}监控服务:${NC} $0 monitor"
    echo -e "${BLUE}调试模式:${NC} $0 debug"
    echo -e "${BLUE}热重载:${NC} $0 watch"
    echo ""
    echo -e "${GREEN}=== 数据库连接 ===${NC}"
    echo -e "${BLUE}连接命令:${NC} docker-compose -f $DEV_COMPOSE_FILE exec postgres psql -U n8n_user -d n8n"
    echo ""
    echo -e "${GREEN}=== Redis连接 ===${NC}"
    echo -e "${BLUE}连接命令:${NC} docker-compose -f $DEV_COMPOSE_FILE exec redis redis-cli"
    echo ""
}

# 查看开发日志
show_dev_logs() {
    local service="${1:-n8n}"
    local follow="${2:-false}"
    
    log_header "查看 $service 服务日志"
    
    if [ "$follow" = "true" ]; then
        log_info "实时跟踪 $service 日志 (Ctrl+C 退出)..."
        docker-compose -f "$DEV_COMPOSE_FILE" logs -f "$service"
    else
        log_info "显示 $service 最近日志..."
        docker-compose -f "$DEV_COMPOSE_FILE" logs --tail=100 "$service"
    fi
}

# 进入开发容器
enter_dev_container() {
    local service="${1:-n8n}"
    local shell="${2:-sh}"
    
    log_header "进入 $service 开发容器"
    
    log_info "进入 $service 容器 ($shell)..."
    docker-compose -f "$DEV_COMPOSE_FILE" exec "$service" "$shell"
}

# 执行开发命令
exec_dev_command() {
    local service="$1"
    shift
    local command="$*"
    
    log_header "在 $service 容器中执行命令"
    
    log_info "执行命令: $command"
    docker-compose -f "$DEV_COMPOSE_FILE" exec "$service" $command
}

# 开发环境监控
monitor_dev_environment() {
    log_header "开发环境监控"
    
    log_info "启动开发环境监控 (Ctrl+C 退出)..."
    
    while true; do
        clear
        echo -e "${GREEN}=== N8N开发环境监控 ===${NC}"
        echo "更新时间: $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        
        # 显示容器状态
        echo -e "${BLUE}=== 容器状态 ===${NC}"
        docker-compose -f "$DEV_COMPOSE_FILE" ps
        echo ""
        
        # 显示资源使用
        echo -e "${BLUE}=== 资源使用 ===${NC}"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" $(docker-compose -f "$DEV_COMPOSE_FILE" ps -q) 2>/dev/null || echo "无法获取资源信息"
        echo ""
        
        # 显示端口状态
        echo -e "${BLUE}=== 端口状态 ===${NC}"
        local ports=("5432" "6379" "5678")
        for port in "${ports[@]}"; do
            if lsof -i :$port &>/dev/null; then
                echo -e "${GREEN}端口 $port: 监听中${NC}"
            else
                echo -e "${RED}端口 $port: 未监听${NC}"
            fi
        done
        echo ""
        
        sleep 5
    done
}

# 调试模式
debug_mode() {
    log_header "开发调试模式"
    
    # 设置调试环境变量
    export DEBUG=true
    export N8N_LOG_LEVEL=debug
    
    log_info "启用调试模式..."
    
    # 重启N8N服务以应用调试配置
    log_info "重启N8N服务以启用调试..."
    docker-compose -f "$DEV_COMPOSE_FILE" restart n8n
    
    # 显示调试日志
    log_info "显示N8N调试日志 (Ctrl+C 退出)..."
    docker-compose -f "$DEV_COMPOSE_FILE" logs -f n8n
}

# 文件监控和热重载
watch_and_reload() {
    log_header "文件监控和热重载"
    
    # 检查fswatch是否可用
    if ! command -v fswatch &> /dev/null; then
        log_error "fswatch 未安装，无法启用文件监控"
        log_info "请安装 fswatch:"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            log_info "  brew install fswatch"
        else
            log_info "  apt-get install fswatch 或 yum install fswatch"
        fi
        return 1
    fi
    
    log_info "启动文件监控和热重载..."
    log_info "监控目录: ${WATCH_DIRS[*]}"
    log_info "按 Ctrl+C 停止监控"
    
    # 监控配置文件变化
    fswatch -o "${WATCH_DIRS[@]}" | while read num; do
        log_info "检测到文件变化，重新加载配置..."
        
        # 重新加载N8N配置
        docker-compose -f "$DEV_COMPOSE_FILE" restart n8n
        
        log_success "配置重新加载完成"
        
        # 等待服务就绪
        sleep "$RELOAD_DELAY"
    done
}

# 开发环境测试
test_dev_environment() {
    log_header "开发环境测试"
    
    # 运行基础测试
    if [ -f "scripts/test.sh" ]; then
        log_info "运行开发环境测试..."
        bash scripts/test.sh quick
    else
        log_warning "测试脚本不存在，跳过测试"
    fi
}

# 清理开发环境
clean_dev_environment() {
    log_header "清理开发环境"
    
    log_warning "这将删除所有开发环境数据，是否继续？(y/N)"
    read -r confirm
    
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        log_info "停止开发环境服务..."
        docker-compose -f "$DEV_COMPOSE_FILE" down -v
        
        log_info "清理开发数据..."
        rm -rf data/dev/*
        
        log_info "清理开发日志..."
        rm -f logs/dev*.log
        
        log_success "开发环境清理完成"
    else
        log_info "取消清理操作"
    fi
}

# 备份开发环境
backup_dev_environment() {
    log_header "备份开发环境"
    
    local backup_dir="backups/dev-$(date +%Y%m%d_%H%M%S)"
    
    log_info "创建开发环境备份: $backup_dir"
    
    mkdir -p "$backup_dir"
    
    # 备份配置文件
    cp -r config "$backup_dir/"
    cp .env.dev "$backup_dir/"
    cp "$DEV_COMPOSE_FILE" "$backup_dir/"
    
    # 备份数据库
    log_info "备份开发数据库..."
    docker-compose -f "$DEV_COMPOSE_FILE" exec -T postgres pg_dump -U n8n_user n8n > "$backup_dir/n8n_dev.sql"
    
    # 备份Redis数据
    log_info "备份Redis数据..."
    docker-compose -f "$DEV_COMPOSE_FILE" exec -T redis redis-cli --rdb - > "$backup_dir/redis_dev.rdb"
    
    # 创建备份信息文件
    cat > "$backup_dir/backup_info.txt" << EOF
开发环境备份信息
备份时间: $(date '+%Y-%m-%d %H:%M:%S')
备份类型: 开发环境
包含内容:
- 配置文件
- 环境变量
- Docker Compose配置
- PostgreSQL数据库
- Redis数据
EOF
    
    log_success "开发环境备份完成: $backup_dir"
}

# 恢复开发环境
restore_dev_environment() {
    local backup_dir="$1"
    
    if [ -z "$backup_dir" ] || [ ! -d "$backup_dir" ]; then
        log_error "请指定有效的备份目录"
        return 1
    fi
    
    log_header "恢复开发环境"
    
    log_warning "这将覆盖当前开发环境，是否继续？(y/N)"
    read -r confirm
    
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        log_info "停止开发环境服务..."
        docker-compose -f "$DEV_COMPOSE_FILE" down
        
        # 恢复配置文件
        log_info "恢复配置文件..."
        cp -r "$backup_dir/config" ./
        cp "$backup_dir/.env.dev" ./
        cp "$backup_dir/$DEV_COMPOSE_FILE" ./
        
        # 启动服务
        log_info "启动开发环境服务..."
        start_dev_environment
        
        # 恢复数据库
        if [ -f "$backup_dir/n8n_dev.sql" ]; then
            log_info "恢复数据库..."
            docker-compose -f "$DEV_COMPOSE_FILE" exec -T postgres psql -U n8n_user -d n8n < "$backup_dir/n8n_dev.sql"
        fi
        
        # 恢复Redis数据
        if [ -f "$backup_dir/redis_dev.rdb" ]; then
            log_info "恢复Redis数据..."
            docker-compose -f "$DEV_COMPOSE_FILE" exec -T redis redis-cli --pipe < "$backup_dir/redis_dev.rdb"
        fi
        
        log_success "开发环境恢复完成"
    else
        log_info "取消恢复操作"
    fi
}

# 显示使用帮助
show_help() {
    echo "N8N企业级自动化工作流平台开发环境管理脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  setup                   设置开发环境"
    echo "  start                   启动开发环境"
    echo "  stop                    停止开发环境"
    echo "  restart                 重启开发环境"
    echo "  status                  检查服务状态"
    echo "  info                    显示环境信息"
    echo "  logs [service] [follow] 查看服务日志"
    echo "  shell [service] [shell] 进入容器"
    echo "  exec <service> <cmd>    执行容器命令"
    echo "  monitor                 监控环境状态"
    echo "  debug                   启用调试模式"
    echo "  watch                   文件监控和热重载"
    echo "  test                    测试开发环境"
    echo "  clean                   清理开发环境"
    echo "  backup                  备份开发环境"
    echo "  restore <backup_dir>    恢复开发环境"
    echo ""
    echo "选项:"
    echo "  --debug                 启用调试输出"
    echo ""
    echo "示例:"
    echo "  $0 setup                # 初始化开发环境"
    echo "  $0 start                # 启动开发环境"
    echo "  $0 logs n8n true        # 实时查看N8N日志"
    echo "  $0 shell n8n bash       # 进入N8N容器"
    echo "  $0 exec postgres psql   # 在PostgreSQL容器中执行psql"
    echo "  $0 monitor              # 监控环境状态"
    echo "  $0 debug                # 启用调试模式"
    echo "  $0 watch                # 启用文件监控"
    echo ""
    echo "开发环境特性:"
    echo "  - 调试模式和详细日志"
    echo "  - 文件监控和热重载"
    echo "  - 实时监控和状态检查"
    echo "  - 容器内命令执行"
    echo "  - 开发数据备份恢复"
    echo "  - 快速环境重置"
    echo ""
}

# 主函数
main() {
    # 创建开发目录
    create_dev_directories
    
    # 处理调试选项
    if [[ "$*" == *"--debug"* ]]; then
        export DEBUG=true
        # 移除--debug参数
        set -- "${@/--debug/}"
    fi
    
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    local command="$1"
    shift
    
    case $command in
        "setup")
            check_dev_requirements
            create_dev_config
            ;;
        "start")
            start_dev_environment
            ;;
        "stop")
            stop_dev_environment
            ;;
        "restart")
            restart_dev_environment
            ;;
        "status")
            check_dev_services
            ;;
        "info")
            show_dev_info
            ;;
        "logs")
            show_dev_logs "$1" "$2"
            ;;
        "shell")
            enter_dev_container "$1" "$2"
            ;;
        "exec")
            if [ $# -lt 2 ]; then
                log_error "exec 命令需要指定服务和命令"
                exit 1
            fi
            exec_dev_command "$@"
            ;;
        "monitor")
            monitor_dev_environment
            ;;
        "debug")
            debug_mode
            ;;
        "watch")
            watch_and_reload
            ;;
        "test")
            test_dev_environment
            ;;
        "clean")
            clean_dev_environment
            ;;
        "backup")
            backup_dev_environment
            ;;
        "restore")
            if [ $# -lt 1 ]; then
                log_error "restore 命令需要指定备份目录"
                exit 1
            fi
            restore_dev_environment "$1"
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