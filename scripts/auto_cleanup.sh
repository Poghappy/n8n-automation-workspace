#!/bin/bash
# 自动清理脚本 - 定期维护项目清洁
# 生成时间: 2024-12-19
# 使用方法: ./scripts/auto_cleanup.sh

set -euo pipefail

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

# 主清理函数
main_cleanup() {
    log_info "🧹 开始自动清理..."
    
    # 1. 清理系统临时文件
    log_info "1️⃣ 清理系统临时文件..."
    find . -name ".DS_Store" -delete 2>/dev/null || true
    log_success "已删除.DS_Store文件"
    
    # 2. 清理Python缓存
    log_info "2️⃣ 清理Python缓存..."
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    log_success "已清理Python缓存文件"
    
    # 3. 清理旧日志文件
    log_info "3️⃣ 清理旧日志文件..."
    find ./logs -name "*.log" -mtime +30 -delete 2>/dev/null || true
    log_success "已清理30天前的日志文件"
    
    # 4. 清理npm缓存
    log_info "4️⃣ 清理npm缓存..."
    npm cache clean --force 2>/dev/null || true
    log_success "已清理npm缓存"
    
    # 5. 检查磁盘空间
    log_info "5️⃣ 检查磁盘空间..."
    df -h . | tail -1
    
    log_success "🎉 自动清理完成！"
}

# 安全检查函数
security_check() {
    log_info "🔒 执行安全检查..."
    
    # 检查环境文件权限
    find . -name ".env*" -type f -exec chmod 600 {} \; 2>/dev/null || true
    log_success "已修复环境文件权限"
    
    # 检查敏感文件
    if find . -name "*.key" -o -name "*.pem" -type f | grep -q .; then
        log_warning "发现SSL证书文件，请确认权限设置"
    fi
    
    log_success "安全检查完成"
}

# 备份检查函数
backup_check() {
    log_info "💾 检查备份状态..."
    
    if [ -d "../backups" ]; then
        backup_count=$(ls -1 ../backups/*.tar.gz 2>/dev/null | wc -l || echo 0)
        log_info "发现 $backup_count 个备份文件"
        
        # 保留最近5个备份
        if [ "$backup_count" -gt 5 ]; then
            log_warning "备份文件过多，建议清理旧备份"
        fi
    else
        log_warning "未找到备份目录，建议创建备份"
    fi
}

# 主执行流程
main() {
    echo "=================================="
    echo "🚀 N8N项目自动清理脚本"
    echo "=================================="
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ] && [ ! -f "requirements.txt" ]; then
        log_error "请在项目根目录执行此脚本"
        exit 1
    fi
    
    # 执行清理
    main_cleanup
    
    # 执行安全检查
    security_check
    
    # 检查备份
    backup_check
    
    echo "=================================="
    log_success "✅ 所有维护任务完成"
    echo "=================================="
}

# 执行主函数
main "$@"