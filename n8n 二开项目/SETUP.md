# 火鸟门户新闻自动化工作流 - 环境配置指南

## 📋 概述

本指南将帮助您完成火鸟门户新闻自动化工作流的环境配置和依赖准备。系统基于 n8n + Notion + 火鸟门户，实现从多源新闻采集到自动发布的完整流程。

## 🚀 快速开始

### 1. 一键环境配置

运行主配置脚本，自动完成所有环境准备：

```bash
node scripts/setup-environment.js
```

### 2. 配置环境变量

复制环境变量模板并填入实际配置：

```bash
cp .env.template .env
```

编辑 `.env` 文件，填入以下必需配置：

```bash
# 火鸟门户配置
HUONIAO_SESSION_ID=your_session_id_here
HUONIAO_USERNAME=your_username
HUONIAO_PASSWORD=your_password

# Notion配置
NOTION_API_TOKEN=secret_your_notion_integration_token
NOTION_DATABASE_ID=your_database_id_here

# OpenAI配置
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### 3. 启动服务

```bash
./start.sh
```

或手动启动：

```bash
docker-compose -f docker-compose-n8n.yml up -d
```

### 4. 访问n8n管理界面

打开浏览器访问：http://localhost:5678

## 📝 详细配置步骤

### 步骤1: 系统要求检查

确保您的系统满足以下要求：

- Node.js >= 16.0.0
- npm >= 8.0.0
- Docker >= 20.0.0
- Docker Compose >= 2.0.0

检查版本：

```bash
node --version
npm --version
docker --version
docker-compose --version
```

### 步骤2: 验证现有文件

运行验证脚本检查工作流文件和核心模块：

```bash
npm run validate
```

### 步骤3: 配置API凭据

#### 3.1 火鸟门户API配置

1. 登录火鸟门户管理后台
2. 从浏览器开发者工具中获取 `PHPSESSID` Cookie值
3. 将会话ID设置到环境变量中

验证火鸟门户API连接：

```bash
npm run test-huoniao
```

#### 3.2 Notion API配置

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 创建新的集成，获取API令牌
3. 创建数据库页面，获取数据库ID

设置Notion集成：

```bash
npm run setup-notion
```

#### 3.3 OpenAI API配置

1. 访问 [OpenAI API Keys](https://platform.openai.com/api-keys)
2. 创建新的API密钥
3. 将密钥设置到环境变量中

### 步骤4: 测试API连接

运行完整的API连接测试：

```bash
npm test
```

### 步骤5: 启动和配置n8n

1. 启动服务：
   ```bash
   npm run dev
   ```

2. 访问 http://localhost:5678

3. 完成n8n初始设置

4. 导入工作流文件：`火鸟门户_新闻采集工作流_增强版.json`

5. 配置凭据：
   - 火鸟门户API凭据
   - Notion API凭据
   - OpenAI API凭据

## 🔧 配置文件说明

### 环境变量文件 (.env)

| 变量名 | 描述 | 必需 | 示例值 |
|--------|------|------|--------|
| `HUONIAO_SESSION_ID` | 火鸟门户会话ID | ✅ | `1ru3hf75ah15qm2ckm1en18lij` |
| `NOTION_API_TOKEN` | Notion集成令牌 | ✅ | `secret_abc123...` |
| `NOTION_DATABASE_ID` | Notion数据库ID | ✅ | `12345678-1234-1234-1234-123456789abc` |
| `OPENAI_API_KEY` | OpenAI API密钥 | ✅ | `sk-abc123...` |
| `HUONIAO_USERNAME` | 火鸟门户用户名 | 🔶 | `admin` |
| `HUONIAO_PASSWORD` | 火鸟门户密码 | 🔶 | `password123` |

### Docker配置 (docker-compose-n8n.yml)

包含以下服务：
- **n8n**: 工作流自动化引擎
- **postgres**: PostgreSQL数据库

### n8n凭据配置

位于 `n8n-config/credentials/` 目录：
- `huoniao_api.json`: 火鸟门户API凭据
- `notion_api.json`: Notion API凭据
- `openai_api.json`: OpenAI API凭据

## 🧪 测试和验证

### 单独测试各个组件

```bash
# 验证工作流文件
npm run validate

# 测试火鸟门户API
npm run test-huoniao

# 设置Notion集成
npm run setup-notion

# 测试所有API连接
npm test
```

### 查看服务状态

```bash
# 查看运行中的容器
docker ps

# 查看服务日志
npm run logs

# 查看特定服务日志
docker-compose -f docker-compose-n8n.yml logs n8n
```

## 🔍 故障排除

### 常见问题

#### 1. 火鸟门户会话过期

**症状**: API返回状态码 101 或认证失败

**解决方案**:
```bash
# 运行会话管理器获取新会话
node scripts/session-manager.js

# 更新环境变量中的会话ID
```

#### 2. Notion API连接失败

**症状**: Notion API返回 401 Unauthorized

**解决方案**:
- 检查API令牌是否正确
- 确认集成已添加到数据库
- 验证数据库ID格式

#### 3. Docker服务启动失败

**症状**: 容器无法启动或端口冲突

**解决方案**:
```bash
# 检查端口占用
lsof -i :5678

# 清理Docker资源
docker system prune

# 重新构建服务
docker-compose -f docker-compose-n8n.yml up --build
```

#### 4. n8n工作流导入失败

**症状**: 工作流文件无法导入或节点缺失

**解决方案**:
- 检查n8n版本兼容性
- 验证工作流文件格式
- 确认所需节点已安装

### 日志文件位置

- 环境配置日志: `logs/environment-setup-report.json`
- n8n服务日志: `docker-compose logs n8n`
- PostgreSQL日志: `docker-compose logs postgres`

### 获取帮助

如果遇到问题，请：

1. 检查相关日志文件
2. 验证环境变量配置
3. 确认网络连接正常
4. 查看API服务状态

## 📚 相关文档

- [n8n官方文档](https://docs.n8n.io/)
- [Notion API文档](https://developers.notion.com/)
- [火鸟门户API文档](./新闻模块API接口文档.md)
- [工作流设计文档](./.kiro/specs/automated-news-workflow/design.md)

## 🎯 下一步

环境配置完成后，您可以：

1. 测试完整的新闻采集工作流
2. 配置RSS源和采集规则
3. 自定义内容处理逻辑
4. 设置监控和告警
5. 优化性能参数

## 📞 支持

如需技术支持，请提供：
- 环境配置报告 (`logs/environment-setup-report.json`)
- 错误日志和截图
- 系统环境信息
- 具体的错误复现步骤