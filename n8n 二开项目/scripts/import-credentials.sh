#!/bin/bash

# n8n凭据导入脚本
# 使用此脚本将凭据配置导入到n8n实例中

echo "🚀 开始导入n8n凭据配置..."

# 检查n8n是否运行
if ! docker ps | grep -q "n8n-main"; then
    echo "❌ n8n容器未运行，请先启动n8n服务"
    exit 1
fi

# 导入凭据配置
CREDENTIALS_DIR="/Users/zhiledeng/Desktop/n8n归档/n8n-config/credentials"

for credential_file in "$CREDENTIALS_DIR"/*.json; do
    if [ -f "$credential_file" ]; then
        credential_name=$(basename "$credential_file" .json)
        echo "📥 导入凭据: $credential_name"
        
        # 使用n8n CLI导入凭据 (需要根据实际n8n版本调整)
        docker exec n8n-main n8n import:credentials --input="$credential_file" || {
            echo "⚠️  凭据导入失败: $credential_name"
        }
    fi
done

echo "✅ 凭据导入完成"
echo ""
echo "📋 下一步操作:"
echo "1. 登录n8n管理界面: http://localhost:5678"
echo "2. 检查凭据配置是否正确"
echo "3. 测试各个API连接"
echo "4. 导入工作流文件"
