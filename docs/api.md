# API 文档

## 概述

本文档描述了N8N企业级自动化工作流平台的API接口，包括AI智能体系统、火鸟门户集成和工作流管理等功能。

## 基础信息

- **API版本**: v1.0
- **基础URL**: `http://localhost:8000/api/v1`
- **认证方式**: Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证

所有API请求都需要在请求头中包含认证令牌：

```http
Authorization: Bearer <your-token>
Content-Type: application/json
```

### 获取访问令牌

```http
POST /auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "username": "admin",
      "role": "administrator"
    }
  }
}
```

## AI智能体API

### 1. 智能对话接口

与AI智能体进行对话，获取自动化建议和解决方案。

```http
POST /ai/chat
```

**请求参数**:
```json
{
  "message": "帮我创建一个数据同步工作流",
  "agent_type": "executive",
  "context": {
    "workflow_id": "optional-workflow-id",
    "user_preferences": {}
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "response": "我来帮您创建一个数据同步工作流...",
    "agent_type": "executive",
    "suggestions": [
      {
        "type": "workflow_template",
        "title": "数据库同步模板",
        "description": "定时同步两个数据库之间的数据"
      }
    ],
    "actions": [
      {
        "type": "create_workflow",
        "payload": {...}
      }
    ]
  }
}
```

### 2. 智能体状态查询

```http
GET /ai/agents/status
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "type": "executive",
        "status": "active",
        "load": 0.3,
        "capabilities": ["workflow_creation", "optimization", "analysis"]
      },
      {
        "type": "teacher",
        "status": "active", 
        "load": 0.1,
        "capabilities": ["guidance", "tutorials", "best_practices"]
      }
    ]
  }
}
```

### 3. 工作流智能分析

```http
POST /ai/analyze/workflow
```

**请求参数**:
```json
{
  "workflow_id": "workflow-uuid",
  "analysis_type": "performance"
}
```

## 工作流管理API

### 1. 获取工作流列表

```http
GET /workflows?page=1&limit=20&status=active
```

**查询参数**:
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 20，最大: 100）
- `status`: 状态筛选（active, inactive, error）
- `tag`: 标签筛选
- `search`: 搜索关键词

**响应示例**:
```json
{
  "success": true,
  "data": {
    "workflows": [
      {
        "id": "workflow-uuid",
        "name": "数据同步工作流",
        "description": "定时同步用户数据",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T12:00:00Z",
        "tags": ["sync", "database"],
        "execution_count": 150,
        "success_rate": 0.98
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### 2. 创建工作流

```http
POST /workflows
```

**请求参数**:
```json
{
  "name": "新工作流",
  "description": "工作流描述",
  "workflow_data": {
    "nodes": [...],
    "connections": {...}
  },
  "tags": ["tag1", "tag2"],
  "settings": {
    "timezone": "Asia/Shanghai",
    "error_workflow": "error-handler-id"
  }
}
```

### 3. 执行工作流

```http
POST /workflows/{workflow_id}/execute
```

**请求参数**:
```json
{
  "input_data": {
    "key": "value"
  },
  "execution_mode": "manual"
}
```

### 4. 获取执行历史

```http
GET /workflows/{workflow_id}/executions?page=1&limit=20
```

## 火鸟门户集成API

### 1. 用户管理

#### 获取用户列表
```http
GET /portal/users?page=1&limit=20
```

#### 创建用户
```http
POST /portal/users
```

**请求参数**:
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "secure-password",
  "role": "user",
  "profile": {
    "name": "用户姓名",
    "phone": "13800138000"
  }
}
```

### 2. 内容管理

#### 获取内容列表
```http
GET /portal/content?type=article&status=published
```

#### 发布内容
```http
POST /portal/content
```

## 监控和统计API

### 1. 系统状态

```http
GET /system/status
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "system": {
      "status": "healthy",
      "uptime": 86400,
      "version": "1.0.0"
    },
    "services": {
      "n8n": "running",
      "database": "running", 
      "redis": "running",
      "ai_agents": "running"
    },
    "metrics": {
      "active_workflows": 25,
      "total_executions": 1500,
      "success_rate": 0.97,
      "avg_execution_time": 2.5
    }
  }
}
```

### 2. 性能指标

```http
GET /metrics/performance?period=24h
```

### 3. 错误日志

```http
GET /logs/errors?level=error&limit=50
```

## 错误处理

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": {
      "field": "email",
      "reason": "邮箱格式不正确"
    }
  }
}
```

### 常见错误码

| 错误码 | HTTP状态码 | 描述 |
|--------|------------|------|
| UNAUTHORIZED | 401 | 未授权访问 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| VALIDATION_ERROR | 400 | 请求参数错误 |
| RATE_LIMIT_EXCEEDED | 429 | 请求频率超限 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

## 限流规则

- **默认限制**: 每分钟100次请求
- **认证用户**: 每分钟500次请求
- **管理员用户**: 每分钟1000次请求

超出限制时返回HTTP 429状态码。

## SDK和示例

### JavaScript SDK

```javascript
import { N8NClient } from '@n8n/client';

const client = new N8NClient({
  baseURL: 'http://localhost:8000/api/v1',
  token: 'your-token'
});

// 创建工作流
const workflow = await client.workflows.create({
  name: '测试工作流',
  workflow_data: {...}
});

// AI对话
const response = await client.ai.chat({
  message: '帮我优化这个工作流',
  agent_type: 'executive'
});
```

### Python SDK

```python
from n8n_client import N8NClient

client = N8NClient(
    base_url='http://localhost:8000/api/v1',
    token='your-token'
)

# 获取工作流列表
workflows = client.workflows.list(page=1, limit=20)

# 执行工作流
execution = client.workflows.execute(
    workflow_id='workflow-uuid',
    input_data={'key': 'value'}
)
```

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持基础工作流管理
- 集成AI智能体系统
- 火鸟门户集成

### v1.1.0 (计划中)
- 增强AI智能体功能
- 支持更多第三方服务集成
- 性能优化和稳定性改进

## 支持

如有问题或建议，请通过以下方式联系：

- 📧 邮箱: support@example.com
- 📱 微信群: 扫描二维码加入技术交流群
- 🐛 问题反馈: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 文档: [在线文档](https://docs.example.com)