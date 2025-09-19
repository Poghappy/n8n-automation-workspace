# N8N MCP 集成使用指南

## 概述

本指南介绍如何在N8N中使用MCP (Model Context Protocol) 客户端节点，实现与MCP服务器的集成。

## 已完成的配置

### 1. 包安装
- ✅ 已安装 `n8n-nodes-mcp@0.1.29`
- ✅ 包含95个依赖包，安装成功

### 2. 环境配置
- ✅ 已在 `.env` 文件中添加 `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true`
- ✅ 启用社区包工具使用权限

### 3. 凭据配置
- ✅ 创建了 `config/mcp-credentials.json` 配置文件
- ✅ 包含三种连接方式：STDIO、SSE、WebSocket

### 4. 示例工作流
- ✅ 创建了 `workflows/mcp-client-demo.json` 示例工作流
- ✅ 包含完整的MCP连接测试流程

## MCP客户端节点使用方法

### 连接类型

#### 1. STDIO 连接
```json
{
  "connectionType": "stdio",
  "command": "python",
  "args": ["-m", "mcp_server"]
}
```
- 适用于：本地MCP服务器
- 优点：简单直接，无需网络配置
- 缺点：仅限本地使用

#### 2. SSE 连接
```json
{
  "connectionType": "sse",
  "url": "http://localhost:3001/sse",
  "headers": {
    "Authorization": "Bearer your-token-here"
  }
}
```
- 适用于：远程HTTP MCP服务器
- 优点：支持远程连接，HTTP标准
- 缺点：单向通信

#### 3. WebSocket 连接
```json
{
  "connectionType": "websocket",
  "url": "ws://localhost:3001/ws",
  "headers": {
    "Authorization": "Bearer your-token-here"
  }
}
```
- 适用于：实时双向通信
- 优点：全双工通信，实时性好
- 缺点：连接管理复杂

### 可用操作

1. **listTools** - 获取可用工具列表
2. **callTool** - 调用特定工具
3. **listResources** - 获取可用资源
4. **readResource** - 读取特定资源

## 工作流示例

### 基础MCP连接测试
```
手动触发 → MCP客户端 → 处理响应 → 检查成功 → 成功/错误输出
```

### 工作流节点配置

#### MCP客户端节点
- **连接类型**: stdio/sse/websocket
- **操作**: listTools (获取工具列表)
- **命令**: python -m mcp_server (STDIO模式)

#### 处理响应节点
- 提取MCP响应数据
- 添加时间戳
- 计算工具数量

#### 条件判断节点
- 检查MCP连接是否成功
- 根据结果分流处理

## 使用步骤

### 1. 导入工作流
1. 打开N8N界面
2. 点击"Import from file"
3. 选择 `workflows/mcp-client-demo.json`
4. 导入工作流

### 2. 配置MCP服务器
1. 确保MCP服务器正在运行
2. 根据服务器类型选择连接方式
3. 配置相应的连接参数

### 3. 测试连接
1. 点击"Execute Workflow"
2. 查看执行结果
3. 验证MCP连接状态

## 故障排除

### 常见问题

#### 1. 包未找到错误
```
Error: Cannot find module 'n8n-nodes-mcp'
```
**解决方案**: 
- 检查包是否正确安装：`npm list n8n-nodes-mcp`
- 重新安装：`npm install n8n-nodes-mcp`

#### 2. 社区包权限错误
```
Error: Community packages are not allowed
```
**解决方案**:
- 确保环境变量设置：`N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true`
- 重启N8N服务

#### 3. MCP连接失败
```
Error: Failed to connect to MCP server
```
**解决方案**:
- 检查MCP服务器是否运行
- 验证连接参数（URL、端口、认证）
- 检查网络连接

#### 4. 认证错误
```
Error: Authentication failed
```
**解决方案**:
- 检查认证令牌是否有效
- 更新过期的凭据
- 验证权限配置

## 高级用法

### 1. 动态工具调用
```javascript
// 在Function节点中动态选择工具
const availableTools = $('MCP客户端').item.json.tools;
const selectedTool = availableTools.find(tool => tool.name === 'desired_tool');
return { toolName: selectedTool.name, toolArgs: {...} };
```

### 2. 批量工具执行
```javascript
// 批量调用多个MCP工具
const tools = ['tool1', 'tool2', 'tool3'];
const results = [];
for (const tool of tools) {
  // 调用工具并收集结果
}
return results;
```

### 3. 错误重试机制
```javascript
// 实现连接重试逻辑
let retryCount = 0;
const maxRetries = 3;
while (retryCount < maxRetries) {
  try {
    // 尝试MCP连接
    break;
  } catch (error) {
    retryCount++;
    if (retryCount >= maxRetries) throw error;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

## 安全注意事项

1. **认证管理**
   - 使用强密码和令牌
   - 定期更新认证凭据
   - 避免在代码中硬编码密钥

2. **网络安全**
   - 使用HTTPS/WSS加密连接
   - 配置防火墙规则
   - 限制访问IP范围

3. **权限控制**
   - 最小权限原则
   - 定期审核权限配置
   - 监控异常访问

## 监控和日志

### 1. 连接监控
- 监控MCP连接状态
- 记录连接失败事件
- 设置告警通知

### 2. 性能监控
- 跟踪响应时间
- 监控资源使用
- 分析性能瓶颈

### 3. 日志管理
- 启用详细日志记录
- 定期清理日志文件
- 集中化日志管理

## 下一步计划

1. **扩展集成**
   - 集成更多MCP服务器
   - 开发自定义MCP工具
   - 优化性能配置

2. **自动化增强**
   - 创建更多工作流模板
   - 实现智能路由
   - 添加错误恢复机制

3. **监控完善**
   - 部署监控仪表板
   - 设置性能告警
   - 实现自动故障恢复

---

**配置完成时间**: 2025-01-20  
**版本**: 1.0.0  
**维护者**: N8N MCP专家智能体