# N8N自动化集成系统

## 🚀 项目概述

N8N自动化集成系统是一个基于N8N工作流引擎和火鸟门户系统的企业级自动化解决方案。该系统通过MCP（Management Control Plane）协议实现深度集成，并集成了先进的AI智能体协作框架，为用户提供强大的自动化工作流能力和智能化服务体验。

### 🤖 AI智能体系统

本系统集成了多角色AI智能体协作框架，实现敏捷项目团队的虚拟化：

- **🎯 执行官智能体**: 专注工作流创建、执行和优化，具备需求分析和自动化实现能力
- **👨‍🏫 教学老师智能体**: 提供N8N学习指导、最佳实践教学和技能提升支持
- **🔄 智能角色切换**: 根据用户需求和场景自动选择最适合的智能体进行服务
- **📚 知识库驱动**: 基于丰富的N8N知识库和工作流模板库提供精准服务
- **🧠 意图理解**: 智能分析用户意图，提供个性化的解决方案

### 🎯 核心价值

- **🔄 全流程自动化**: 从数据采集到处理再到输出的完整自动化链路
- **🔗 深度系统集成**: 火鸟门户与N8N的无缝集成，数据实时同步
- **🛡️ 企业级安全**: 多层安全防护，符合企业安全合规要求
- **📈 高性能处理**: 支持大规模并发处理和批量数据操作
- **🎨 可视化配置**: 直观的工作流设计界面，降低技术门槛
- **🤖 AI驱动体验**: 智能化的用户交互和自动化建议，大幅提升效率

## 📋 系统架构

### 技术栈概览

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   火鸟门户系统    │    │   N8N工作流引擎   │    │    外部服务集成   │
│   PHP + MySQL   │◄──►│ Node.js + MCP   │◄──►│   APIs + Cloud   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
    ┌─────────┐              ┌─────────┐              ┌─────────┐
    │ 用户界面  │              │ 工作流管理 │              │ 数据输出  │
    └─────────┘              └─────────┘              └─────────┘
                                     ▲
                                     │
                        ┌─────────────────────┐
                        │   AI智能体协作层     │
                        │ Python + FastAPI   │
                        └─────────────────────┘
                                     ▲
                    ┌────────────────┼────────────────┐
                    │                │                │
            ┌───────────────┐ ┌─────────────┐ ┌──────────────┐
            │   执行官智能体   │ │ 教学老师智能体 │ │   知识库系统   │
            │ 工作流自动化    │ │  学习指导     │ │  模板管理     │
            └───────────────┘ └─────────────┘ └──────────────┘
```

### 核心组件

| 组件名称 | 技术栈 | 主要功能 | 状态 |
|---------|--------|----------|------|
| 火鸟门户系统 | PHP + MySQL + Smarty | 内容管理、用户管理、业务逻辑 | ✅ 运行中 |
| N8N工作流引擎 | Node.js + TypeScript | 工作流自动化、任务调度 | ✅ 运行中 |
| AI智能体系统 | Python + FastAPI | 智能化服务、自动化建议 | 🆕 新增 |
| 执行官智能体 | Python + AsyncIO | 工作流创建、执行、优化 | 🆕 新增 |
| 教学老师智能体 | Python + NLP | 学习指导、技能提升 | 🆕 新增 |
| 知识库系统 | Python + Vector DB | 知识管理、智能检索 | 🆕 新增 |
| MCP协议层 | TypeScript | 系统间通信、数据同步 | ✅ 运行中 |
| API接口层 | REST API + WebSocket | 数据交换、实时通信 | ✅ 运行中 |
| 监控系统 | Prometheus + Grafana | 性能监控、告警通知 | 🔄 配置中 |

## 🚀 快速开始

### 环境要求

#### 基础环境
- **操作系统**: macOS 10.15+ / Ubuntu 18.04+ / Windows 10+
- **Node.js**: v16.0.0 或更高版本
- **Python**: v3.8 或更高版本
- **PHP**: v7.4 或更高版本
- **MySQL**: v5.7 或更高版本
- **Redis**: v6.0 或更高版本
- **Docker**: v20.0 或更高版本（推荐）

#### 硬件要求
- **CPU**: 4核心或更多
- **内存**: 8GB RAM 或更多（AI智能体系统建议16GB+）
- **存储**: 50GB 可用空间
- **网络**: 稳定的互联网连接

### 安装部署

#### 方式一：Docker快速部署（推荐）

1. **克隆项目**
```bash
git clone <repository-url>
cd N8N-自动化
```

2. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

3. **启动服务**
```bash
docker-compose up -d
```

4. **访问系统**
- N8N界面: http://localhost:5678
- 火鸟门户: http://localhost:8080
- AI智能体API: http://localhost:8000
- 监控面板: http://localhost:3000 (Grafana)
- 日志查看: http://localhost:5601 (Kibana)

#### 方式二：本地开发部署

1. **安装N8N**
```bash
npm install n8n -g
```

2. **安装AI智能体系统**
```bash
# 创建Python虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

3. **配置数据库**
```bash
# 创建PostgreSQL数据库
createdb n8n_db

# 配置环境变量
export DB_TYPE=postgresdb
export DB_POSTGRESDB_HOST=localhost
export DB_POSTGRESDB_PORT=5432
export DB_POSTGRESDB_DATABASE=n8n_db
export DB_POSTGRESDB_USER=n8n_user
export DB_POSTGRESDB_PASSWORD=n8n_password
```

4. **启动服务**
```bash
# 启动N8N
n8n start &

# 启动AI智能体系统
cd src
python main.py &

# 启动Redis（如果本地安装）
redis-server &
```

5. **配置火鸟门户**
```bash
# 配置Web服务器指向 hawaiihub.net 目录
# 导入数据库结构和初始数据
# 配置 config.php 文件
```

### 初始配置

#### 1. N8N基础配置

访问 http://localhost:5678，完成以下配置：

1. **创建管理员账户**
2. **配置数据库连接**
3. **设置Webhook URL**
4. **导入工作流模板**

#### 2. AI智能体系统配置

访问 http://localhost:8000/docs，查看API文档并配置：

1. **环境变量配置**
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
vim .env
```

2. **初始化知识库**
```bash
# 运行初始化脚本
python scripts/init_knowledge_base.py
```

3. **测试AI智能体**
```bash
# 测试执行官智能体
curl -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "帮我创建一个简单的数据同步工作流", "agent_type": "executive"}'
```

#### 3. 火鸟门户配置

1. **数据库配置**
```php
// hawaiihub.net/config.php
$config['database'] = [
    'host' => 'localhost',
    'username' => 'db_user',
    'password' => 'db_password',
    'database' => 'hawaiihub_db'
];
```

2. **API接口配置**
```php
// hawaiihub.net/api/config.php
$config['api'] = [
    'base_url' => 'http://localhost:8080/api/',
    'auth_key' => 'your_api_key_here',
    'rate_limit' => 1000
];
```

#### 3. 集成配置

1. **配置N8N凭证**
   - 火鸟门户API密钥
   - 数据库连接信息
   - 外部服务API密钥

2. **导入预置工作流**
```bash
# 导入社区模板
cp awesome-n8n-templates-main/* /path/to/n8n/workflows/

# 导入自定义工作流
cp n8n-workflows-main/* /path/to/n8n/workflows/
```

## 📚 使用指南

### 工作流管理

#### 创建新工作流

1. **登录N8N界面**
2. **点击"New Workflow"**
3. **拖拽节点到画布**
4. **配置节点参数**
5. **连接节点**
6. **测试和保存**

#### 常用节点说明

| 节点类型 | 功能描述 | 使用场景 |
|---------|----------|----------|
| Webhook | 接收HTTP请求 | 触发工作流、接收数据 |
| HTTP Request | 发送HTTP请求 | 调用API、获取数据 |
| MySQL | 数据库操作 | 查询、插入、更新数据 |
| Set | 设置变量 | 数据处理、格式转换 |
| IF | 条件判断 | 流程控制、逻辑分支 |
| Schedule Trigger | 定时触发 | 定时任务、批量处理 |

#### 工作流模板

系统提供多种预置模板：

1. **数据同步模板**
   - 火鸟门户到外部系统数据同步
   - 定时数据备份和归档
   - 实时数据监控和告警

2. **业务自动化模板**
   - 用户注册自动化流程
   - 订单处理自动化
   - 内容审核自动化

3. **集成服务模板**
   - 微信公众号集成
   - 邮件营销自动化
   - 社交媒体内容发布

### 火鸟门户集成

#### API接口使用

1. **用户管理API**
```bash
# 获取用户列表
GET /api/users?page=1&limit=10

# 创建用户
POST /api/users
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}

# 更新用户信息
PUT /api/users/{id}
{
  "email": "newemail@example.com",
  "status": "active"
}
```

2. **内容管理API**
```bash
# 获取文章列表
GET /api/articles?category=news&status=published

# 发布文章
POST /api/articles
{
  "title": "文章标题",
  "content": "文章内容",
  "category": "news",
  "status": "published"
}
```

3. **房产管理API**
```bash
# 获取房产列表
GET /api/houses?city=honolulu&type=sale

# 添加房产信息
POST /api/houses
{
  "title": "豪华海景别墅",
  "price": 1500000,
  "location": "Honolulu, HI",
  "type": "sale"
}
```

#### Webhook集成

1. **配置Webhook端点**
```javascript
// N8N Webhook节点配置
{
  "httpMethod": "POST",
  "path": "hawaiihub-webhook",
  "responseMode": "responseNode",
  "authentication": "headerAuth"
}
```

2. **火鸟门户Webhook调用**
```php
// hawaiihub.net/webhook/trigger.php
$webhook_url = 'http://localhost:5678/webhook/hawaiihub-webhook';
$data = [
    'event' => 'user_registered',
    'user_id' => $user_id,
    'timestamp' => time()
];

$ch = curl_init($webhook_url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $api_key
]);
curl_exec($ch);
curl_close($ch);
```

### 监控和维护

#### 系统监控

1. **性能指标监控**
   - API响应时间
   - 工作流执行时间
   - 数据库查询性能
   - 系统资源使用率

2. **业务指标监控**
   - 工作流执行成功率
   - 数据同步准确性
   - 用户活跃度
   - 错误发生频率

#### 日志管理

1. **N8N日志**
```bash
# 查看N8N日志
docker logs n8n-container

# 查看特定工作流日志
tail -f ~/.n8n/logs/workflow-{workflow-id}.log
```

2. **火鸟门户日志**
```bash
# 查看Apache/Nginx访问日志
tail -f /var/log/apache2/access.log

# 查看PHP错误日志
tail -f /var/log/php/error.log
```

#### 备份和恢复

1. **数据库备份**
```bash
# N8N数据库备份
pg_dump n8n_db > n8n_backup_$(date +%Y%m%d).sql

# 火鸟门户数据库备份
mysqldump hawaiihub_db > hawaiihub_backup_$(date +%Y%m%d).sql
```

2. **工作流备份**
```bash
# 导出所有工作流
n8n export:workflow --all --output=workflows_backup.json

# 导出特定工作流
n8n export:workflow --id=123 --output=workflow_123.json
```

## 🔧 高级配置

### 性能优化

#### 数据库优化

1. **索引优化**
```sql
-- 为常用查询字段添加索引
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_article_category ON articles(category, status);
CREATE INDEX idx_house_location ON houses(city, type);
```

2. **查询优化**
```sql
-- 使用EXPLAIN分析查询性能
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';

-- 优化复杂查询
SELECT u.*, p.* FROM users u 
LEFT JOIN profiles p ON u.id = p.user_id 
WHERE u.status = 'active' 
LIMIT 10;
```

#### N8N性能优化

1. **工作流优化**
   - 减少不必要的节点
   - 使用批处理节点
   - 优化数据传输
   - 合理设置超时时间

2. **资源配置**
```yaml
# docker-compose.yml
services:
  n8n:
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
      - EXECUTIONS_PROCESS=main
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

### 安全配置

#### API安全

1. **API密钥管理**
```php
// 生成API密钥
function generateApiKey() {
    return bin2hex(random_bytes(32));
}

// 验证API密钥
function validateApiKey($key) {
    $stored_key = getStoredApiKey();
    return hash_equals($stored_key, $key);
}
```

2. **请求限制**
```php
// 实现请求频率限制
class RateLimiter {
    public function checkLimit($ip, $limit = 100, $window = 3600) {
        $key = "rate_limit:$ip";
        $current = $this->redis->get($key) ?: 0;
        
        if ($current >= $limit) {
            throw new Exception('Rate limit exceeded');
        }
        
        $this->redis->incr($key);
        $this->redis->expire($key, $window);
        return true;
    }
}
```

#### 数据安全

1. **数据加密**
```php
// 敏感数据加密
function encryptData($data, $key) {
    $iv = random_bytes(16);
    $encrypted = openssl_encrypt($data, 'AES-256-CBC', $key, 0, $iv);
    return base64_encode($iv . $encrypted);
}

function decryptData($encryptedData, $key) {
    $data = base64_decode($encryptedData);
    $iv = substr($data, 0, 16);
    $encrypted = substr($data, 16);
    return openssl_decrypt($encrypted, 'AES-256-CBC', $key, 0, $iv);
}
```

2. **SQL注入防护**
```php
// 使用预处理语句
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND status = ?");
$stmt->execute([$email, $status]);
$users = $stmt->fetchAll();
```

## 🐛 故障排除

### 常见问题

#### N8N相关问题

1. **工作流执行失败**
   - 检查节点配置
   - 验证API凭证
   - 查看执行日志
   - 检查网络连接

2. **数据库连接问题**
   - 验证连接参数
   - 检查数据库服务状态
   - 确认网络可达性
   - 检查防火墙设置

#### 火鸟门户问题

1. **API调用失败**
   - 检查API密钥
   - 验证请求格式
   - 查看服务器日志
   - 检查权限设置

2. **数据同步问题**
   - 检查数据格式
   - 验证字段映射
   - 查看同步日志
   - 检查网络状态

### 调试技巧

#### 日志分析

1. **启用详细日志**
```bash
# N8N详细日志
export N8N_LOG_LEVEL=debug
n8n start

# PHP错误日志
ini_set('log_errors', 1);
ini_set('error_log', '/path/to/error.log');
```

2. **日志分析工具**
```bash
# 实时查看日志
tail -f /var/log/n8n/n8n.log | grep ERROR

# 统计错误类型
grep ERROR /var/log/n8n/n8n.log | awk '{print $4}' | sort | uniq -c
```

#### 性能分析

1. **数据库性能分析**
```sql
-- 查看慢查询
SHOW PROCESSLIST;
SHOW FULL PROCESSLIST;

-- 分析查询执行计划
EXPLAIN EXTENDED SELECT * FROM users WHERE email = 'test@example.com';
```

2. **系统资源监控**
```bash
# 监控系统资源
top -p $(pgrep n8n)
iostat -x 1
netstat -tuln | grep :5678
```

## 📖 参考资料

### 官方文档

- [N8N官方文档](https://docs.n8n.io/)
- [N8N社区论坛](https://community.n8n.io/)
- [火鸟门户系统文档](./hawaiihub.net/docs/)

### 开发资源

- [N8N节点开发指南](https://docs.n8n.io/integrations/creating-nodes/)
- [MCP协议规范](https://github.com/mcp-protocol/spec)
- [PHP最佳实践](https://www.php-fig.org/psr/)

### 社区资源

- [Awesome N8N](https://github.com/n8n-io/awesome-n8n)
- [N8N工作流模板](https://n8n.io/workflows/)
- [社区贡献节点](https://www.npmjs.com/search?q=n8n-nodes)

## 🤝 贡献指南

### 开发流程

1. **Fork项目**
2. **创建功能分支**
3. **提交代码**
4. **创建Pull Request**
5. **代码审查**
6. **合并代码**

### 代码规范

- 遵循PSR-4自动加载规范
- 使用TypeScript开发N8N节点
- 编写完整的单元测试
- 提供详细的文档说明

### 问题反馈

- 使用GitHub Issues报告问题
- 提供详细的错误信息和复现步骤
- 包含系统环境信息
- 遵循问题模板格式

## 📄 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 📞 联系我们

- **技术支持**: N8N火鸟门户技术助手
- **项目维护**: 开发团队
- **社区交流**: [GitHub Discussions](https://github.com/project/discussions)

---

*最后更新时间: 2025年1月16日*