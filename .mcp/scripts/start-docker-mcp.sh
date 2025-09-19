#!/bin/bash

# Docker MCP 服务器启动脚本
set -e

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MCP_CONFIG_DIR="$PROJECT_ROOT/.mcp/config"
MCP_LOGS_DIR="$PROJECT_ROOT/.mcp/logs"

# 创建日志目录
mkdir -p "$MCP_LOGS_DIR"

# 加载环境变量
if [ -f "$MCP_CONFIG_DIR/docker-mcp.env" ]; then
    source "$MCP_CONFIG_DIR/docker-mcp.env"
    echo "已加载Docker MCP配置"
else
    echo "错误: 找不到Docker MCP配置文件"
    exit 1
fi

# 检查Docker连接
echo "检查Docker连接..."
if ! docker info >/dev/null 2>&1; then
    echo "错误: 无法连接到Docker守护进程"
    exit 1
fi

# 检查Docker socket
if [ ! -S "/Users/zhiledeng/.docker/run/docker.sock" ]; then
    echo "错误: Docker socket不存在"
    exit 1
fi

echo "Docker连接正常"

# 启动Docker MCP服务器
echo "启动Docker MCP服务器..."
LOG_FILE="$MCP_LOGS_DIR/docker-mcp-$(date +%Y%m%d-%H%M%S).log"

# 使用官方Docker MCP镜像
docker run --rm -i \
    -v /Users/zhiledeng/.docker/run/docker.sock:/var/run/docker.sock \
    --name docker-mcp-server \
    mcp/docker \
    2>&1 | tee "$LOG_FILE"
