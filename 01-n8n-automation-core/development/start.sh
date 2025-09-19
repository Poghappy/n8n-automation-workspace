#!/bin/bash

# 火鸟门户新闻自动化工作流快速启动脚本

echo "🚀 启动火鸟门户新闻自动化工作流..."

# 检查环境变量
if [ ! -f .env ]; then
    echo "❌ .env文件不存在，请先配置环境变量"
    echo "运行: cp .env.template .env"
    echo "然后编辑 .env 文件填入实际配置"
    exit 1
fi

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 启动服务
echo "📦 启动n8n和PostgreSQL服务..."
docker-compose -f docker-compose-n8n.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
if docker ps | grep -q "n8n-main"; then
    echo "✅ n8n服务启动成功"
    echo "🌐 访问地址: http://localhost:5678"
else
    echo "❌ n8n服务启动失败"
    echo "查看日志: docker-compose -f docker-compose-n8n.yml logs"
    exit 1
fi

if docker ps | grep -q "n8n-postgres"; then
    echo "✅ PostgreSQL服务启动成功"
else
    echo "❌ PostgreSQL服务启动失败"
    echo "查看日志: docker-compose -f docker-compose-n8n.yml logs postgres"
    exit 1
fi

echo ""
echo "🎉 服务启动完成！"
echo ""
echo "📋 下一步操作:"
echo "1. 访问 http://localhost:5678 配置n8n"
echo "2. 导入工作流文件: 火鸟门户_新闻采集工作流_增强版.json"
echo "3. 配置API凭据"
echo "4. 测试工作流"
echo ""
echo "🛠️  管理命令:"
echo "停止服务: docker-compose -f docker-compose-n8n.yml down"
echo "查看日志: docker-compose -f docker-compose-n8n.yml logs -f"
echo "重启服务: docker-compose -f docker-compose-n8n.yml restart"