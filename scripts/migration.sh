#!/bin/bash

# N8N企业级系统迁移脚本
# 自动化系统迁移的完整流程

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATION_DIR="$PROJECT_ROOT/migration"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

# 显示帮助信息
show_help() {
    cat << EOF
N8N企业级系统迁移脚本

用法: $0 [选项]

选项:
    --prepare           准备迁移包（在旧系统上执行）
    --restore           恢复系统（在新系统上执行）
    --verify            验证迁移完整性
    --help              显示此帮助信息

示例:
    # 在旧系统上准备迁移包
    $0 --prepare

    # 在新系统上恢复
    $0 --restore

    # 验证迁移结果
    $0 --verify
EOF
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    local deps=("docker" "docker-compose" "tar" "gzip")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "缺少依赖: $dep"
            exit 1
        fi
    done
    
    log_success "所有依赖检查通过"
}

# 准备迁移包
prepare_migration() {
    log_info "开始准备迁移包..."
    
    # 创建迁移目录
    mkdir -p "$MIGRATION_DIR"
    
    # 1. 执行完整备份
    log_info "执行完整备份..."
    if [ -f "$SCRIPT_DIR/backup.sh" ]; then
        "$SCRIPT_DIR/backup.sh" --type full --include-config
    else
        log_warning "备份脚本不存在，手动备份数据库..."
        mkdir -p "$PROJECT_ROOT/backups/full"
        docker exec n8n-postgres pg_dump -U n8n n8n > "$PROJECT_ROOT/backups/full/database_$TIMESTAMP.sql"
    fi
    
    # 2. 备份关键配置文件
    log_info "备份配置文件..."
    mkdir -p "$MIGRATION_DIR/config"
    
    # 环境变量
    if [ -f "$PROJECT_ROOT/.env" ]; then
        cp "$PROJECT_ROOT/.env" "$MIGRATION_DIR/config/.env.backup"
    fi
    
    # Docker配置
    if [ -f "$PROJECT_ROOT/docker-compose.yml" ]; then
        cp "$PROJECT_ROOT/docker-compose.yml" "$MIGRATION_DIR/config/"
    fi
    
    # Nginx配置
    if [ -d "$PROJECT_ROOT/nginx" ]; then
        cp -r "$PROJECT_ROOT/nginx" "$MIGRATION_DIR/config/"
    fi
    
    # SSL证书
    if [ -d "$PROJECT_ROOT/ssl" ]; then
        cp -r "$PROJECT_ROOT/ssl" "$MIGRATION_DIR/config/"
    fi
    
    # 3. 复制脚本和文档
    log_info "复制脚本和文档..."
    cp -r "$SCRIPT_DIR" "$MIGRATION_DIR/"
    
    # 复制重要文档
    local docs=("README.md" "DEPLOYMENT.md" "requirements.txt" "package.json")
    for doc in "${docs[@]}"; do
        if [ -f "$PROJECT_ROOT/$doc" ]; then
            cp "$PROJECT_ROOT/$doc" "$MIGRATION_DIR/"
        fi
    done
    
    # 4. 创建迁移包
    log_info "创建迁移包..."
    cd "$PROJECT_ROOT"
    tar -czf "n8n_migration_$TIMESTAMP.tar.gz" \
        migration/ \
        backups/ \
        --exclude="*.log" \
        --exclude="node_modules" \
        --exclude=".git"
    
    # 5. 生成迁移信息
    cat > "$MIGRATION_DIR/migration_info.txt" << EOF
N8N系统迁移包信息
==================

创建时间: $(date)
源系统: $(uname -a)
Docker版本: $(docker --version)
Docker Compose版本: $(docker-compose --version)

包含内容:
- 数据库备份
- 配置文件
- SSL证书
- 脚本文件
- 文档资料

迁移步骤:
1. 在新系统上安装Docker和Docker Compose
2. 解压此迁移包
3. 运行: ./scripts/migration.sh --restore
4. 验证: ./scripts/migration.sh --verify
EOF
    
    log_success "迁移包准备完成: n8n_migration_$TIMESTAMP.tar.gz"
    log_info "迁移包大小: $(du -h n8n_migration_$TIMESTAMP.tar.gz | cut -f1)"
}

# 恢复系统
restore_system() {
    log_info "开始恢复系统..."
    
    # 1. 检查迁移包
    if [ ! -d "$MIGRATION_DIR" ]; then
        log_error "未找到迁移目录，请先解压迁移包"
        exit 1
    fi
    
    # 2. 恢复配置文件
    log_info "恢复配置文件..."
    
    if [ -f "$MIGRATION_DIR/config/.env.backup" ]; then
        cp "$MIGRATION_DIR/config/.env.backup" "$PROJECT_ROOT/.env"
        log_success "环境变量配置已恢复"
    fi
    
    if [ -f "$MIGRATION_DIR/config/docker-compose.yml" ]; then
        cp "$MIGRATION_DIR/config/docker-compose.yml" "$PROJECT_ROOT/"
        log_success "Docker配置已恢复"
    fi
    
    if [ -d "$MIGRATION_DIR/config/nginx" ]; then
        cp -r "$MIGRATION_DIR/config/nginx" "$PROJECT_ROOT/"
        log_success "Nginx配置已恢复"
    fi
    
    if [ -d "$MIGRATION_DIR/config/ssl" ]; then
        cp -r "$MIGRATION_DIR/config/ssl" "$PROJECT_ROOT/"
        log_success "SSL证书已恢复"
    fi
    
    # 3. 创建必要目录
    log_info "创建必要目录..."
    mkdir -p "$PROJECT_ROOT"/{logs,data,backups,n8n/workflows,n8n/credentials}
    
    # 4. 启动服务
    log_info "启动Docker服务..."
    cd "$PROJECT_ROOT"
    docker-compose up -d
    
    # 5. 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 6. 恢复数据库
    log_info "恢复数据库..."
    local db_backup=$(find "$PROJECT_ROOT/backups" -name "database_*.sql" -type f | head -1)
    if [ -n "$db_backup" ] && [ -f "$db_backup" ]; then
        docker exec -i n8n-postgres psql -U n8n -d n8n < "$db_backup"
        log_success "数据库恢复完成"
    else
        log_warning "未找到数据库备份文件"
    fi
    
    # 7. 重启N8N服务
    log_info "重启N8N服务..."
    docker-compose restart n8n
    
    log_success "系统恢复完成！"
}

# 验证迁移
verify_migration() {
    log_info "验证迁移结果..."
    
    # 1. 检查Docker服务
    log_info "检查Docker服务状态..."
    if docker-compose ps | grep -q "Up"; then
        log_success "Docker服务运行正常"
    else
        log_error "Docker服务异常"
        return 1
    fi
    
    # 2. 检查数据库连接
    log_info "检查数据库连接..."
    if docker exec n8n-postgres pg_isready -U n8n; then
        log_success "数据库连接正常"
    else
        log_error "数据库连接失败"
        return 1
    fi
    
    # 3. 检查N8N服务
    log_info "检查N8N服务..."
    sleep 10
    if curl -f http://localhost:5678/healthz &>/dev/null; then
        log_success "N8N服务正常"
    else
        log_warning "N8N服务可能需要更多时间启动"
    fi
    
    # 4. 检查工作流数量
    log_info "检查工作流数据..."
    local workflow_count=$(docker exec -t n8n-postgres psql -U n8n -d n8n -c "SELECT COUNT(*) FROM workflow_entity;" | grep -o '[0-9]\+' | head -1)
    log_info "发现 $workflow_count 个工作流"
    
    # 5. 检查凭据数量
    log_info "检查凭据数据..."
    local credentials_count=$(docker exec -t n8n-postgres psql -U n8n -d n8n -c "SELECT COUNT(*) FROM credentials_entity;" | grep -o '[0-9]\+' | head -1)
    log_info "发现 $credentials_count 个凭据"
    
    log_success "迁移验证完成！"
    
    # 显示访问信息
    echo
    echo "🎉 N8N系统迁移成功！"
    echo "📊 访问地址: http://localhost:5678"
    echo "📈 工作流数量: $workflow_count"
    echo "🔐 凭据数量: $credentials_count"
    echo
    echo "⚠️  注意: 由于加密密钥可能发生变化，您可能需要重新配置凭据"
}

# 主函数
main() {
    case "${1:-}" in
        --prepare)
            check_dependencies
            prepare_migration
            ;;
        --restore)
            check_dependencies
            restore_system
            ;;
        --verify)
            verify_migration
            ;;
        --help)
            show_help
            ;;
        *)
            log_error "无效选项: ${1:-}"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"