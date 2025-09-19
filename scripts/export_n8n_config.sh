#!/bin/bash

# N8N配置导出脚本
# 用于将当前N8N系统的完整配置导出，便于在新环境中快速部署
# 作者: N8N自动化系统
# 版本: 1.0.0
# 创建时间: $(date '+%Y-%m-%d %H:%M:%S')

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
EXPORT_DIR="${PROJECT_ROOT}/migration_package"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
EXPORT_PACKAGE="n8n_config_export_${TIMESTAMP}.tar.gz"

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
    
    log_success "依赖检查完成"
}

# 创建导出目录
create_export_directory() {
    log_info "创建导出目录..."
    
    if [ -d "$EXPORT_DIR" ]; then
        rm -rf "$EXPORT_DIR"
    fi
    
    mkdir -p "$EXPORT_DIR"/{config,data,scripts,docs}
    log_success "导出目录创建完成: $EXPORT_DIR"
}

# 导出Docker配置
export_docker_config() {
    log_info "导出Docker配置文件..."
    
    # 复制主要配置文件
    cp "$PROJECT_ROOT/docker-compose.yml" "$EXPORT_DIR/config/"
    cp "$PROJECT_ROOT/.env.example" "$EXPORT_DIR/config/"
    
    # 创建当前环境变量快照（去除敏感信息）
    cat > "$EXPORT_DIR/config/.env.template" << 'EOF'
# N8N Docker 环境配置模板
# 复制此文件为 .env 并填入实际值

# ===========================================
# 基础配置
# ===========================================

# 域名配置 (生产环境必需)
DOMAIN_NAME=localhost
SUBDOMAIN=n8n
N8N_PROTOCOL=http

# N8N 基础认证 (必需)
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=请生成强密码

# N8N 加密密钥 (必需) - 使用: openssl rand -hex 32
N8N_ENCRYPTION_KEY=请生成32位加密密钥

# JWT 密钥 (用户管理) - 使用: openssl rand -base64 32
N8N_USER_MANAGEMENT_JWT_SECRET=请生成JWT密钥

# ===========================================
# 数据库配置
# ===========================================

# PostgreSQL 管理员密码 (必需)
POSTGRES_PASSWORD=请生成强密码

# PostgreSQL 应用用户
POSTGRES_USER=n8n
POSTGRES_DB=n8n

# PostgreSQL 非root用户密码 (必需)
POSTGRES_NON_ROOT_PASSWORD=请生成强密码

# ===========================================
# Redis 配置
# ===========================================

# Redis 密码 (必需)
REDIS_PASSWORD=请生成强密码

# ================================
# AI智能体配置
# ================================
# OpenAI配置
OPENAI_API_KEY=请填入您的OpenAI API密钥
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7

# 智能体行为配置
AGENT_MODE=hybrid
AGENT_ROLE=executive
MAX_CONCURRENT_WORKFLOWS=10
ENABLE_AUTO_LEARNING=true
ENABLE_MONITORING=true

# 学习和推荐配置
LEARNING_RATE=0.1
RECOMMENDATION_THRESHOLD=0.8
KNOWLEDGE_UPDATE_INTERVAL=3600
EOF

    # 复制Nginx配置
    if [ -d "$PROJECT_ROOT/nginx" ]; then
        cp -r "$PROJECT_ROOT/nginx" "$EXPORT_DIR/config/"
    fi
    
    # 复制Kubernetes配置
    if [ -d "$PROJECT_ROOT/bridge" ]; then
        cp -r "$PROJECT_ROOT/bridge" "$EXPORT_DIR/config/"
    fi
    
    log_success "Docker配置导出完成"
}

# 导出N8N数据
export_n8n_data() {
    log_info "导出N8N数据..."
    
    # 检查N8N容器是否运行
    if ! docker ps | grep -q "n8n"; then
        log_warning "N8N容器未运行，跳过数据导出"
        return
    fi
    
    # 获取N8N容器名称
    local container_name=$(docker ps --format "table {{.Names}}" | grep n8n | head -1)
    
    if [ -z "$container_name" ]; then
        log_warning "未找到N8N容器"
        return
    fi
    
    # 导出工作流
    log_info "导出工作流数据..."
    docker exec "$container_name" n8n export:workflow --all --output=/tmp/workflows.json 2>/dev/null || {
        log_warning "工作流导出失败，可能没有工作流数据"
    }
    
    if docker exec "$container_name" test -f /tmp/workflows.json; then
        docker cp "$container_name:/tmp/workflows.json" "$EXPORT_DIR/data/"
        log_success "工作流导出完成"
    fi
    
    # 导出凭据（加密状态）
    log_info "导出凭据数据..."
    docker exec "$container_name" n8n export:credentials --all --output=/tmp/credentials.json 2>/dev/null || {
        log_warning "凭据导出失败，可能没有凭据数据"
    }
    
    if docker exec "$container_name" test -f /tmp/credentials.json; then
        docker cp "$container_name:/tmp/credentials.json" "$EXPORT_DIR/data/"
        log_success "凭据导出完成"
    fi
}

# 导出数据库备份
export_database_backup() {
    log_info "导出数据库备份..."
    
    # 检查PostgreSQL容器是否运行
    if ! docker ps | grep -q "postgres"; then
        log_warning "PostgreSQL容器未运行，跳过数据库备份"
        return
    fi
    
    # 获取PostgreSQL容器名称
    local postgres_container=$(docker ps --format "table {{.Names}}" | grep postgres | head -1)
    
    if [ -z "$postgres_container" ]; then
        log_warning "未找到PostgreSQL容器"
        return
    fi
    
    # 创建数据库备份
    log_info "创建PostgreSQL数据库备份..."
    docker exec "$postgres_container" pg_dump -U n8n -d n8n > "$EXPORT_DIR/data/n8n_database_backup.sql" 2>/dev/null || {
        log_warning "数据库备份失败"
        return
    }
    
    log_success "数据库备份完成"
}

# 导出脚本文件
export_scripts() {
    log_info "导出脚本文件..."
    
    # 复制scripts目录
    if [ -d "$PROJECT_ROOT/scripts" ]; then
        cp -r "$PROJECT_ROOT/scripts"/* "$EXPORT_DIR/scripts/"
    fi
    
    # 复制项目根目录的重要脚本
    for script in "setup.py" "requirements.txt"; do
        if [ -f "$PROJECT_ROOT/$script" ]; then
            cp "$PROJECT_ROOT/$script" "$EXPORT_DIR/scripts/"
        fi
    done
    
    log_success "脚本文件导出完成"
}

# 导出文档
export_documentation() {
    log_info "导出文档..."
    
    # 复制重要文档
    for doc in "README.md" "PROJECT_RULES.md" "PROJECT_INDEX.md"; do
        if [ -f "$PROJECT_ROOT/$doc" ]; then
            cp "$PROJECT_ROOT/$doc" "$EXPORT_DIR/docs/"
        fi
    done
    
    # 复制.trae目录
    if [ -d "$PROJECT_ROOT/.trae" ]; then
        cp -r "$PROJECT_ROOT/.trae" "$EXPORT_DIR/docs/"
    fi
    
    log_success "文档导出完成"
}

# 生成系统信息
generate_system_info() {
    log_info "生成系统信息..."
    
    cat > "$EXPORT_DIR/system_info.txt" << EOF
N8N配置导出信息
================

导出时间: $(date '+%Y-%m-%d %H:%M:%S')
导出主机: $(hostname)
操作系统: $(uname -s) $(uname -r)
Docker版本: $(docker --version)
Docker Compose版本: $(docker-compose --version)

当前运行的容器:
$(docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}")

Docker网络:
$(docker network ls)

Docker卷:
$(docker volume ls)

N8N版本信息:
$(docker exec $(docker ps --format "{{.Names}}" | grep n8n | head -1) n8n --version 2>/dev/null || echo "无法获取N8N版本")

数据库信息:
$(docker exec $(docker ps --format "{{.Names}}" | grep postgres | head -1) psql -U n8n -d n8n -c "SELECT version();" 2>/dev/null || echo "无法获取数据库版本")
EOF

    log_success "系统信息生成完成"
}

# 创建迁移指南
create_migration_guide() {
    log_info "创建迁移指南..."
    
    cat > "$EXPORT_DIR/MIGRATION_GUIDE.md" << 'EOF'
# N8N系统迁移指南

## 概述
本指南将帮助您在新电脑上快速重建N8N自动化系统。

## 系统要求
- Docker 20.10+
- Docker Compose 2.0+
- 至少4GB可用内存
- 至少10GB可用磁盘空间

## 迁移步骤

### 1. 解压配置包
```bash
tar -xzf n8n_config_export_*.tar.gz
cd migration_package
```

### 2. 安装系统依赖
```bash
# macOS
brew install docker docker-compose

# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# CentOS/RHEL
sudo yum install docker docker-compose
```

### 3. 配置环境变量
```bash
# 复制环境配置模板
cp config/.env.template config/.env

# 编辑环境变量文件
nano config/.env
```

**重要**: 必须设置以下关键配置项：
- `N8N_ENCRYPTION_KEY`: 使用 `openssl rand -hex 32` 生成
- `N8N_USER_MANAGEMENT_JWT_SECRET`: 使用 `openssl rand -base64 32` 生成
- `POSTGRES_PASSWORD`: 设置强密码
- `REDIS_PASSWORD`: 设置强密码
- `OPENAI_API_KEY`: 填入您的OpenAI API密钥

### 4. 部署系统
```bash
# 复制配置文件到项目目录
cp -r config/* /path/to/your/n8n/project/

# 启动服务
cd /path/to/your/n8n/project/
docker-compose up -d
```

### 5. 恢复数据
```bash
# 等待服务启动完成
sleep 30

# 恢复数据库（如果有备份）
if [ -f data/n8n_database_backup.sql ]; then
    docker exec -i $(docker ps --format "{{.Names}}" | grep postgres) psql -U n8n -d n8n < data/n8n_database_backup.sql
fi

# 导入工作流（如果有）
if [ -f data/workflows.json ]; then
    docker exec -i $(docker ps --format "{{.Names}}" | grep n8n) n8n import:workflow --input=/tmp/workflows.json
fi

# 导入凭据（如果有）
if [ -f data/credentials.json ]; then
    docker exec -i $(docker ps --format "{{.Names}}" | grep n8n) n8n import:credentials --input=/tmp/credentials.json
fi
```

### 6. 验证部署
```bash
# 检查服务状态
docker-compose ps

# 访问N8N界面
open http://localhost:5678
```

## 故障排除

### 常见问题
1. **端口冲突**: 修改docker-compose.yml中的端口映射
2. **权限问题**: 确保Docker有足够权限访问文件
3. **内存不足**: 增加Docker分配的内存
4. **网络问题**: 检查防火墙设置

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs n8n
docker-compose logs postgres
```

## 安全建议
1. 定期更新密码和密钥
2. 启用HTTPS（生产环境）
3. 配置防火墙规则
4. 定期备份数据
5. 监控系统资源使用

## 支持
如遇问题，请查看：
1. 项目文档: docs/目录
2. 系统信息: system_info.txt
3. 官方文档: https://docs.n8n.io/
EOF

    log_success "迁移指南创建完成"
}

# 创建一键部署脚本
create_deploy_script() {
    log_info "创建一键部署脚本..."
    
    cat > "$EXPORT_DIR/quick_deploy.sh" << 'EOF'
#!/bin/bash

# N8N一键部署脚本
# 用于在新环境中快速部署N8N系统

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查系统要求
check_requirements() {
    log_info "检查系统要求..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    # 检查内存
    local mem_gb=$(free -g | awk '/^Mem:/{print $2}' 2>/dev/null || echo "0")
    if [ "$mem_gb" -lt 4 ]; then
        log_warning "系统内存少于4GB，可能影响性能"
    fi
    
    log_success "系统要求检查完成"
}

# 生成密钥
generate_keys() {
    log_info "生成安全密钥..."
    
    if ! grep -q "请生成" config/.env 2>/dev/null; then
        log_info "环境配置已存在，跳过密钥生成"
        return
    fi
    
    # 生成加密密钥
    local encryption_key=$(openssl rand -hex 32)
    local jwt_secret=$(openssl rand -base64 32)
    local postgres_password=$(openssl rand -base64 16)
    local redis_password=$(openssl rand -base64 16)
    
    # 替换模板中的占位符
    sed -i.bak \
        -e "s/请生成32位加密密钥/$encryption_key/g" \
        -e "s/请生成JWT密钥/$jwt_secret/g" \
        -e "s/请生成强密码/$postgres_password/g" \
        -e "s/请生成强密码/$redis_password/g" \
        config/.env
    
    log_success "安全密钥生成完成"
}

# 部署服务
deploy_services() {
    log_info "部署N8N服务..."
    
    # 复制配置文件
    cp config/docker-compose.yml ./
    cp config/.env ./
    
    # 启动服务
    docker-compose up -d
    
    log_success "服务部署完成"
}

# 等待服务就绪
wait_for_services() {
    log_info "等待服务启动..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:5678/healthz > /dev/null 2>&1; then
            log_success "N8N服务已就绪"
            return
        fi
        
        attempt=$((attempt + 1))
        log_info "等待服务启动... ($attempt/$max_attempts)"
        sleep 10
    done
    
    log_error "服务启动超时"
    exit 1
}

# 恢复数据
restore_data() {
    log_info "恢复数据..."
    
    # 恢复数据库
    if [ -f data/n8n_database_backup.sql ]; then
        log_info "恢复数据库备份..."
        docker exec -i $(docker ps --format "{{.Names}}" | grep postgres | head -1) \
            psql -U n8n -d n8n < data/n8n_database_backup.sql
        log_success "数据库恢复完成"
    fi
    
    # 导入工作流
    if [ -f data/workflows.json ]; then
        log_info "导入工作流..."
        docker cp data/workflows.json $(docker ps --format "{{.Names}}" | grep n8n | head -1):/tmp/
        docker exec $(docker ps --format "{{.Names}}" | grep n8n | head -1) \
            n8n import:workflow --input=/tmp/workflows.json
        log_success "工作流导入完成"
    fi
    
    # 导入凭据
    if [ -f data/credentials.json ]; then
        log_info "导入凭据..."
        docker cp data/credentials.json $(docker ps --format "{{.Names}}" | grep n8n | head -1):/tmp/
        docker exec $(docker ps --format "{{.Names}}" | grep n8n | head -1) \
            n8n import:credentials --input=/tmp/credentials.json
        log_success "凭据导入完成"
    fi
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."
    
    # 检查服务状态
    docker-compose ps
    
    # 检查N8N访问
    if curl -s http://localhost:5678 > /dev/null; then
        log_success "N8N界面可访问: http://localhost:5678"
    else
        log_error "N8N界面无法访问"
        exit 1
    fi
    
    log_success "部署验证完成"
}

# 主函数
main() {
    echo "========================================"
    echo "       N8N自动化系统一键部署"
    echo "========================================"
    
    check_requirements
    generate_keys
    deploy_services
    wait_for_services
    restore_data
    verify_deployment
    
    echo "========================================"
    echo "           部署完成！"
    echo "========================================"
    echo "N8N访问地址: http://localhost:5678"
    echo "默认用户名: admin"
    echo "默认密码: 请查看 .env 文件"
    echo "========================================"
}

# 执行主函数
main "$@"
EOF

    chmod +x "$EXPORT_DIR/quick_deploy.sh"
    log_success "一键部署脚本创建完成"
}

# 打包配置
package_config() {
    log_info "打包配置文件..."
    
    cd "$PROJECT_ROOT"
    tar -czf "$EXPORT_PACKAGE" -C "$(dirname "$EXPORT_DIR")" "$(basename "$EXPORT_DIR")"
    
    log_success "配置包创建完成: $EXPORT_PACKAGE"
    log_info "包大小: $(du -h "$EXPORT_PACKAGE" | cut -f1)"
}

# 清理临时文件
cleanup() {
    log_info "清理临时文件..."
    
    if [ -d "$EXPORT_DIR" ]; then
        rm -rf "$EXPORT_DIR"
    fi
    
    log_success "清理完成"
}

# 显示使用说明
show_usage() {
    cat << EOF
N8N配置导出脚本

用法: $0 [选项]

选项:
  -h, --help     显示此帮助信息
  -o, --output   指定输出目录 (默认: $EXPORT_DIR)
  -k, --keep     保留临时目录，不进行清理

示例:
  $0                    # 使用默认设置导出配置
  $0 -o /tmp/export     # 指定输出目录
  $0 -k                 # 保留临时目录

EOF
}

# 主函数
main() {
    local keep_temp=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -o|--output)
                EXPORT_DIR="$2"
                shift 2
                ;;
            -k|--keep)
                keep_temp=true
                shift
                ;;
            *)
                log_error "未知选项: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    echo "========================================"
    echo "       N8N配置导出工具"
    echo "========================================"
    
    check_dependencies
    create_export_directory
    export_docker_config
    export_n8n_data
    export_database_backup
    export_scripts
    export_documentation
    generate_system_info
    create_migration_guide
    create_deploy_script
    package_config
    
    if [ "$keep_temp" = false ]; then
        cleanup
    fi
    
    echo "========================================"
    echo "           导出完成！"
    echo "========================================"
    echo "配置包位置: $PROJECT_ROOT/$EXPORT_PACKAGE"
    echo "迁移指南: 解压后查看 MIGRATION_GUIDE.md"
    echo "一键部署: 解压后运行 quick_deploy.sh"
    echo "========================================"
}

# 执行主函数
main "$@"