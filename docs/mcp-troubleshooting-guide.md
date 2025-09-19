# N8N MCP 故障排除指南

## 🔧 问题诊断与解决方案

### 1. 环境变量配置错误

#### 问题症状
```
Failed to start n8n MCP Server: McpError: MCP error 1000: Missing required environment variable: N8N_API_URL
```

#### 解决方案
1. **检查环境变量名称**
   - ❌ 错误: `N8N_HOST`
   - ✅ 正确: `N8N_API_URL`

2. **更新 .env 文件**
   ```bash
   # N8N API URL (MCP服务器需要)
   N8N_API_URL=http://localhost:5678
   N8N_API_KEY=your_api_key_here
   ```

3. **更新 Trae IDE MCP 配置**
   ```json
   {
     "mcpServers": {
       "n8n-integration": {
         "command": "npx",
         "args": ["-y", "@leonardsellem/n8n-mcp-server"],
         "env": {
           "N8N_API_URL": "http://localhost:5678",
           "N8N_API_KEY": "${N8N_API_KEY}"
         }
       }
     }
   }
   ```

### 2. N8N 服务连接问题

#### 问题症状
- MCP 服务器无法连接到 N8N
- 连接超时或拒绝连接

#### 解决方案
1. **验证 N8N 服务状态**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:5678
   # 应该返回 200
   ```

2. **检查 N8N 配置**
   ```bash
   # 确保 N8N 在正确端口运行
   netstat -an | grep 5678
   ```

3. **重启 N8N 服务**
   ```bash
   # 如果使用 Docker
   docker restart n8n
   
   # 如果使用 npm
   npm run start
   ```

### 3. API 密钥问题

#### 问题症状
- 401 Unauthorized 错误
- API 认证失败

#### 解决方案
1. **生成新的 API 密钥**
   - 登录 N8N Web 界面
   - 进入 Settings > API Keys
   - 创建新的 API 密钥

2. **更新环境变量**
   ```bash
   N8N_API_KEY=your_new_api_key_here
   ```

### 4. MCP 服务器包问题

#### 问题症状
- 包未找到或版本不兼容
- 启动失败

#### 解决方案
1. **安装正确的包**
   ```bash
   npm install -g @leonardsellem/n8n-mcp-server
   ```

2. **检查包版本**
   ```bash
   npm list -g @leonardsellem/n8n-mcp-server
   ```

3. **清理缓存**
   ```bash
   npm cache clean --force
   npx clear-npx-cache
   ```

### 5. 权限问题

#### 问题症状
- 文件访问被拒绝
- 无法创建配置文件

#### 解决方案
1. **检查文件权限**
   ```bash
   ls -la ~/.config/trae/
   ```

2. **创建必要目录**
   ```bash
   mkdir -p ~/.config/trae
   chmod 755 ~/.config/trae
   ```

### 6. 网络连接问题

#### 问题症状
- 无法下载 MCP 服务器包
- 网络超时

#### 解决方案
1. **检查网络连接**
   ```bash
   ping registry.npmjs.org
   ```

2. **配置代理（如需要）**
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

## 🔍 诊断工具

### 1. MCP 连接测试脚本
```bash
#!/bin/bash
echo "=== N8N MCP 连接诊断 ==="

# 检查 N8N 服务
echo "1. 检查 N8N 服务状态..."
curl -s -o /dev/null -w "N8N 服务状态: %{http_code}\n" http://localhost:5678

# 检查环境变量
echo "2. 检查环境变量..."
echo "N8N_API_URL: ${N8N_API_URL:-未设置}"
echo "N8N_API_KEY: ${N8N_API_KEY:+已设置}"

# 检查 MCP 包
echo "3. 检查 MCP 包..."
npx @leonardsellem/n8n-mcp-server --version 2>/dev/null || echo "MCP 包未安装或有问题"

echo "=== 诊断完成 ==="
```

### 2. 配置验证脚本
```javascript
// config-validator.js
const fs = require('fs');
const path = require('path');

function validateMCPConfig() {
    const configPath = path.join(process.env.HOME, '.config/trae/mcp_settings.json');
    
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // 验证必需字段
        if (!config.mcpServers) {
            throw new Error('缺少 mcpServers 配置');
        }
        
        if (!config.mcpServers['n8n-integration']) {
            throw new Error('缺少 n8n-integration 服务器配置');
        }
        
        const n8nConfig = config.mcpServers['n8n-integration'];
        
        if (!n8nConfig.env || !n8nConfig.env.N8N_API_URL) {
            throw new Error('缺少 N8N_API_URL 环境变量');
        }
        
        console.log('✅ MCP 配置验证通过');
        return true;
        
    } catch (error) {
        console.error('❌ MCP 配置验证失败:', error.message);
        return false;
    }
}

validateMCPConfig();
```

## 📋 检查清单

### 启动前检查
- [ ] N8N 服务正在运行 (端口 5678)
- [ ] 环境变量 N8N_API_URL 已设置
- [ ] 环境变量 N8N_API_KEY 已设置且有效
- [ ] MCP 服务器包已安装
- [ ] Trae IDE MCP 配置文件存在且正确

### 连接问题检查
- [ ] 网络连接正常
- [ ] 防火墙未阻止连接
- [ ] API 密钥未过期
- [ ] N8N 实例可访问
- [ ] MCP 服务器版本兼容

### 配置文件检查
- [ ] JSON 格式正确
- [ ] 所有必需字段存在
- [ ] 环境变量引用正确
- [ ] 文件权限正确

## 🚀 快速修复命令

```bash
# 一键修复脚本
#!/bin/bash

# 1. 检查并启动 N8N
if ! curl -s http://localhost:5678 > /dev/null; then
    echo "启动 N8N 服务..."
    # 根据你的启动方式调整
    docker start n8n || npm run start &
fi

# 2. 安装 MCP 服务器
npm install -g @leonardsellem/n8n-mcp-server

# 3. 创建配置目录
mkdir -p ~/.config/trae

# 4. 重启 Trae IDE
echo "请重启 Trae IDE 以应用配置更改"
```

## 📞 获取帮助

如果问题仍然存在，请：

1. **收集诊断信息**
   - N8N 版本和配置
   - MCP 服务器版本
   - 错误日志完整内容
   - 系统环境信息

2. **检查官方文档**
   - [N8N 官方文档](https://docs.n8n.io/)
   - [MCP 协议文档](https://modelcontextprotocol.io/)

3. **社区支持**
   - N8N 社区论坛
   - GitHub Issues
   - Discord 社区

---

*最后更新: 2025-01-19*