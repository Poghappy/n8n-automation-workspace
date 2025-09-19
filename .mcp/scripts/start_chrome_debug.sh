#!/bin/bash

# 确保脚本退出时关闭 Chrome
trap 'kill $(jobs -p)' EXIT

# 检查 Chrome 是否已经在运行
if lsof -i :9222 > /dev/null 2>&1; then
    echo "Chrome remote debugging is already running on port 9222"
    exit 0
fi

# 创建用户数据目录
DEBUG_DIR="$HOME/chrome-debug-profile"
mkdir -p "$DEBUG_DIR"

# 关闭所有现有的 Chrome 实例
pkill -f "Google Chrome"
sleep 2

# 启动 Chrome 并开启远程调试
echo "Starting Chrome with remote debugging..."
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --remote-debugging-port=9222 \
    --remote-debugging-address=127.0.0.1 \
    --user-data-dir="$DEBUG_DIR" \
    --no-first-run \
    --no-default-browser-check \
    --disable-background-networking \
    --disable-background-timer-throttling \
    --disable-backgrounding-occluded-windows \
    --disable-breakpad \
    --disable-client-side-phishing-detection \
    --disable-default-apps \
    --disable-dev-shm-usage \
    --disable-extensions \
    --disable-features=site-per-process \
    --disable-hang-monitor \
    --disable-ipc-flooding-protection \
    --disable-popup-blocking \
    --disable-prompt-on-repost \
    --disable-renderer-backgrounding \
    --disable-sync \
    --disable-translate \
    --metrics-recording-only \
    --no-sandbox \
    --safebrowsing-disable-auto-update \
    about:blank &

# 等待 Chrome 启动和端口打开
echo "Waiting for Chrome to start..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:9222/json/version > /dev/null; then
        echo "Chrome remote debugging is running on port 9222"
        exit 0
    fi
    sleep 1
done

echo "Failed to start Chrome with remote debugging"
exit 1