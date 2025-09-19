# N8N自动化核心系统

## 📋 项目概述

N8N自动化核心系统是整个自动化工作空间的核心组件，提供基于Docker的N8N工作流引擎、数据持久化、缓存系统和完整的工作流管理功能。

## 🚀 功能特性

- **🔄 工作流引擎**: 基于N8N的可视化工作流编辑器
- **💾 数据持久化**: PostgreSQL数据库存储
- **⚡ 缓存系统**: Redis高性能缓存
- **🔧 运行时管理**: 完整的工作流运行时环境
- **📊 监控集成**: 与Prometheus和Grafana集成
- **🔐 凭据管理**: 安全的API密钥和凭据存储
- **🌐 Webhook支持**: 灵活的事件触发机制

## 📁 目录结构

```
01-n8n-automation-core/
├── development/          # 开发环境配置和工具
│   ├── docs/            # 开发文档
│   ├── scripts/         # 开发脚本
│   ├── backups/         # 开发备份
│   └── logs/            # 开发日志
├── runtime/             # 运行时环境
│   ├── credentials/     # N8N凭据存储
│   └── workflows/       # N8N工作流文件
├── src/                 # 源代码
└── workflows/           # 工作流模板
```

## 🛠️ 快速开始

### 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 16.0+ (本地开发)
- PostgreSQL 13+ (如果不使用Docker)
- Redis 6.0+ (如果不使用Docker)

### 安装部署

#### 1. Docker部署（推荐）

```bash
# 进入项目目录
cd 01-n8n-automation-core

# 启动服务
docker-compose -f development/docker-compose-n8n.yml up -d

# 查看服务状态
docker-compose -f development/docker-compose-n8n.yml ps
```

#### 2. 本地开发部署

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 启动N8N
npm run start:dev
```

### 访问服务

- **N8N界面**: http://localhost:5678
- **API端点**: http://localhost:5678/api/v1
- **Webhook端点**: http://localhost:5678/webhook

## 🔧 配置说明

### 环境变量

```bash
# N8N基础配置
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_password

# 数据库配置
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=n8n_password

# Redis配置
QUEUE_BULL_REDIS_HOST=redis
QUEUE_BULL_REDIS_PORT=6379
QUEUE_BULL_REDIS_DB=0

# 执行模式
EXECUTIONS_MODE=queue
EXECUTIONS_PROCESS=main
```

### 凭据配置

N8N凭据存储在 `runtime/credentials/` 目录中，包括：

- 火鸟门户API密钥
- 数据库连接信息
- 外部服务API密钥
- Webhook认证令牌

## 📚 工作流管理

### 创建工作流

1. 访问N8N界面 (http://localhost:5678)
2. 点击"New Workflow"
3. 拖拽节点到画布
4. 配置节点参数
5. 连接节点
6. 测试和保存

### 常用节点

| 节点类型 | 功能 | 用途 |
|---------|------|------|
| Webhook | HTTP请求接收 | 触发工作流 |
| HTTP Request | HTTP请求发送 | API调用 |
| MySQL | 数据库操作 | 数据查询和更新 |
| Set | 数据设置 | 数据转换 |
| IF | 条件判断 | 流程控制 |
| Schedule Trigger | 定时触发 | 定时任务 |

### 工作流模板

系统提供以下预置模板：

- **数据同步工作流**: 火鸟门户数据同步
- **内容处理工作流**: 新闻内容自动化处理
- **监控告警工作流**: 系统状态监控
- **备份工作流**: 自动化数据备份

## 🔍 开发指南

### 本地开发

```bash
# 启动开发环境
npm run dev

# 运行测试
npm test

# 代码检查
npm run lint

# 构建项目
npm run build
```

### 调试工作流

1. 启用调试模式
```bash
export N8N_LOG_LEVEL=debug
```

2. 查看日志
```bash
tail -f development/logs/n8n.log
```

3. 使用开发工具
- N8N内置调试器
- 浏览器开发者工具
- Postman API测试

## 📊 监控和维护

### 健康检查

```bash
# 检查N8N服务状态
curl http://localhost:5678/healthz

# 检查数据库连接
npm run health:db

# 检查Redis连接
npm run health:redis
```

### 日志管理

```bash
# 查看N8N日志
docker logs n8n-container

# 查看特定工作流日志
tail -f ~/.n8n/logs/workflow-{workflow-id}.log
```

### 备份和恢复

```bash
# 备份工作流
npm run backup:workflows

# 备份凭据
npm run backup:credentials

# 恢复数据
npm run restore:all
```

## 🐛 故障排除

### 常见问题

1. **工作流执行失败**
   - 检查节点配置
   - 验证API凭据
   - 查看执行日志

2. **数据库连接问题**
   - 验证连接参数
   - 检查网络连接
   - 确认服务状态

3. **性能问题**
   - 优化工作流设计
   - 调整资源配置
   - 监控系统指标

### 调试技巧

```bash
# 启用详细日志
export N8N_LOG_LEVEL=debug

# 查看错误日志
grep ERROR development/logs/n8n.log

# 监控资源使用
docker stats n8n-container
```

## 📖 API文档

### 工作流API

```bash
# 获取所有工作流
GET /api/v1/workflows

# 创建工作流
POST /api/v1/workflows

# 执行工作流
POST /api/v1/workflows/{id}/execute
```

### Webhook API

```bash
# 触发Webhook
POST /webhook/{webhook-path}
```

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

详细信息请参考 [CONTRIBUTING.md](../CONTRIBUTING.md)

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](../LICENSE) 文件

---

更多信息请访问 [项目主页](https://github.com/Poghappy/n8n-automation-workspace)
