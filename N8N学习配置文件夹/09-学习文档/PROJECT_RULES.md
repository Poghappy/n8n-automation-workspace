# N8N自动化项目规则文档

## 📋 文档概述

本文档定义了N8N自动化集成系统项目的开发规范、技术标准、安全要求和协作流程。所有项目参与者必须严格遵循本规则文档的要求。

**文档版本**: v2.0  
**最后更新**: 2025年1月16日  
**适用范围**: N8N自动化集成系统全项目  

---

## 🎯 核心原则

### 1. 基础原则
- **基于官方源码分析** - 所有结论必须来自真实代码文件
- **不得猜想/设想** - 不能基于经验或推测给出答案
- **找不到答案时直接汇报** - 明确告知"暂无结果"
- **代码质量优先** - 确保代码的可读性、可维护性和安全性
- **文档驱动开发** - 重要功能必须有相应的文档说明

### 2. 语言要求
- **统一语言标准**: 所有回复、解释、代码注释和技术说明都必须使用简体中文
- **代码格式保持**: 代码本身保持原有格式，但相关解释和注释使用中文
- **沟通方式**: 保持简洁明了的表达，重点突出关键信息

### 3. 执行标准
- **准确理解需求**: 深入分析用户需求，确保理解准确
- **完整解决方案**: 提供完整、正确的解决方案
- **质量保证**: 执行前先分析任务需求，确保方案可行性
- **确认机制**: 复杂操作先向用户确认再执行

---

## 🛠️ 开发规范

### 代码质量标准

#### 1. 代码结构规范
```
项目根目录/
├── src/                    # 源代码目录
│   ├── components/         # 组件目录
│   ├── utils/             # 工具函数
│   ├── config/            # 配置文件
│   └── tests/             # 测试文件
├── docs/                  # 文档目录
├── scripts/               # 脚本文件
└── README.md             # 项目说明
```

#### 2. 命名规范
- **文件命名**: 使用kebab-case格式 (`user-management.js`)
- **变量命名**: 使用camelCase格式 (`userName`, `apiKey`)
- **常量命名**: 使用UPPER_SNAKE_CASE格式 (`API_BASE_URL`)
- **类命名**: 使用PascalCase格式 (`UserManager`, `ApiClient`)

#### 3. 注释规范
```javascript
/**
 * 用户管理类
 * @description 处理用户相关的业务逻辑
 * @author 开发团队
 * @version 1.0.0
 */
class UserManager {
    /**
     * 创建新用户
     * @param {Object} userData - 用户数据
     * @param {string} userData.username - 用户名
     * @param {string} userData.email - 邮箱地址
     * @returns {Promise<Object>} 创建的用户对象
     */
    async createUser(userData) {
        // 实现逻辑
    }
}
```

### "不重复造轮子"原则

#### 1. 解决方案调研流程

##### 调研阶段要求
- **优先搜索平台**: GitHub、npm、PyPI等开源平台
- **搜索范围**: 功能匹配度、技术栈兼容性、性能指标、社区活跃度
- **评估维度**: 
  * 项目活跃度（近6个月提交频率）
  * 社区支持（Star数≥100，活跃贡献者≥5）
  * 文档完整性（API文档覆盖率≥80%）
  * 安全审计记录

##### 决策标准
```yaml
采用现有方案条件:
  功能匹配度: ≥80%
  质量评估: ≥4.0/5.0
  技术适配性: 通过评估
  维护成本: 可接受

自行开发触发条件:
  功能匹配度: <60%
  集成成本: >自研成本
  特殊业务需求: 无法满足
```

#### 2. 审批流程
- **技术可行性评审**: 解决方案架构师主导
- **资源投入评估**: 项目管理Agent评估
- **风险评估报告**: 质检Agent审核
- **最终审批**: 技术负责人批准

#### 3. 维护规范
- **升级策略**: 选择最简单的集成方式，遵循渐进式升级
- **设计原则**: 避免过度设计，遵循KISS原则
- **同步更新**: 保持与上游项目同步，及时应用安全补丁

---

## 🔧 MCP工具使用规范

### 核心原则
- **MCP优先原则**: 所有外部工具操作必须通过MCP接口执行
- **工具适配原则**: 根据任务特性选择最适合的MCP工具
- **配置验证原则**: 执行前必须验证MCP工具配置状态
- **故障处理原则**: MCP工具故障时必须完整解决后再继续任务

### 工具分类与优先级

#### 1. 浏览器自动化类
```yaml
优先级排序: playwright > puppeteer > selenium-based
适用场景: 网页操作、UI测试、表单填写、页面截图
技术要求: 支持现代浏览器API、具备稳定性保证
```

#### 2. 网页抓取类
```yaml
优先级排序: firecrawl > scrapy-based > requests-based
适用场景: 内容提取、数据抓取、文档处理、API调用
技术要求: 支持多种数据格式、具备反爬虫能力
```

#### 3. 容器管理类
```yaml
优先级排序: Docker MCP > kubernetes-mcp > podman-mcp
适用场景: 容器创建、启动、停止、删除、镜像管理
技术要求: 支持完整Docker API、具备安全隔离
```

#### 4. N8N专用工具
```yaml
核心工具:
  - mcp_n8n__mcp_list_nodes: 查询可用节点
  - mcp_n8n__mcp_n8n_create_workflow: 创建工作流
  - mcp_n8n__mcp_get_template: 获取工作流模板
  - mcp_n8n__mcp_validate_workflow: 验证工作流
```

### MCP工具选择流程

#### 1. 需求分析阶段
- **任务类型识别**: 明确任务属于哪个工具分类
- **功能需求评估**: 列出具体功能要求和性能指标
- **技术约束分析**: 评估现有技术栈兼容性
- **安全要求确认**: 确定安全级别和合规要求

#### 2. 工具评估阶段
- **候选工具筛选**: 基于分类优先级筛选候选工具
- **功能匹配度评估**: 评估工具功能与需求匹配程度
- **技术适配性评估**: 验证与现有系统集成复杂度
- **性能基准测试**: 对比不同工具性能表现

#### 3. 配置验证阶段
- **配置状态检查**: 验证MCP工具是否已正确配置
- **连接测试**: 测试MCP工具与目标系统连接状态
- **权限验证**: 确认工具具备执行任务所需权限
- **功能验证**: 执行简单测试确保工具功能正常

### 故障处理流程

#### 1. 自动决策流程
```yaml
系统评估:
  - 自动评估任务需求
  - 判断是否需要启用sequentialthinking MCP
  - 根据任务复杂度选择最优MCP工具
```

#### 2. 故障处理优先级
```yaml
处理步骤:
  a) 执行完整问题诊断:
     - 全面扫描系统状态
     - 记录详细错误日志
     - 分析错误根源
  
  b) 解决方案优先级:
     - 优先调用context7 MCP
     - 通过浏览器/fetch查阅官方最新文档
     - 严格按官方说明进行配置修复
```

#### 3. 执行要求
- **彻底解决**: 必须彻底解决问题后方可继续任务
- **禁止规避**: 禁止跳过故障或改用其他MCP工具规避问题
- **操作文档**: 每个操作步骤需附带清晰的操作说明文档
- **可追溯性**: 确保所有修复操作可追溯、可验证

---

## 🔒 安全规范

### 数据安全

#### 1. 敏感信息处理
```yaml
分类标准:
  - 高敏感: API密钥、数据库密码、用户隐私数据
  - 中敏感: 配置信息、业务数据、日志信息
  - 低敏感: 公开文档、系统状态信息

处理要求:
  - 高敏感: 必须加密存储，使用环境变量
  - 中敏感: 访问控制，定期审计
  - 低敏感: 基础访问控制
```

#### 2. API安全
```javascript
// API密钥管理示例
const crypto = require('crypto');

class ApiKeyManager {
    /**
     * 生成API密钥
     * @returns {string} 生成的API密钥
     */
    generateApiKey() {
        return crypto.randomBytes(32).toString('hex');
    }
    
    /**
     * 验证API密钥
     * @param {string} providedKey - 提供的密钥
     * @param {string} storedKey - 存储的密钥
     * @returns {boolean} 验证结果
     */
    validateApiKey(providedKey, storedKey) {
        return crypto.timingSafeEqual(
            Buffer.from(providedKey),
            Buffer.from(storedKey)
        );
    }
}
```

#### 3. 数据加密
```javascript
// 数据加密示例
const crypto = require('crypto');

class DataEncryption {
    /**
     * 加密敏感数据
     * @param {string} data - 待加密数据
     * @param {string} key - 加密密钥
     * @returns {string} 加密后的数据
     */
    encryptData(data, key) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher('aes-256-cbc', key);
        cipher.setAutoPadding(true);
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return iv.toString('hex') + ':' + encrypted;
    }
    
    /**
     * 解密敏感数据
     * @param {string} encryptedData - 加密的数据
     * @param {string} key - 解密密钥
     * @returns {string} 解密后的数据
     */
    decryptData(encryptedData, key) {
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        const decipher = crypto.createDecipher('aes-256-cbc', key);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}
```

### 网络安全

#### 1. HTTPS强制
```yaml
要求:
  - 所有API调用必须使用HTTPS
  - 禁用不安全的HTTP连接
  - 使用有效的SSL证书
  - 定期更新证书
```

#### 2. 防火墙配置
```bash
# 防火墙规则示例
# 允许HTTP和HTTPS流量
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 允许N8N端口（仅内网）
sudo ufw allow from 192.168.1.0/24 to any port 5678

# 允许数据库端口（仅本地）
sudo ufw allow from 127.0.0.1 to any port 3306
sudo ufw allow from 127.0.0.1 to any port 5432

# 启用防火墙
sudo ufw enable
```

### 访问控制

#### 1. 基于角色的访问控制(RBAC)
```yaml
角色定义:
  admin:
    permissions:
      - workflow.create
      - workflow.read
      - workflow.update
      - workflow.delete
      - user.manage
      - system.config
  
  developer:
    permissions:
      - workflow.create
      - workflow.read
      - workflow.update
      - workflow.test
  
  viewer:
    permissions:
      - workflow.read
      - execution.read
```

#### 2. API访问控制
```javascript
// 权限验证中间件
class PermissionMiddleware {
    /**
     * 检查用户权限
     * @param {string} requiredPermission - 所需权限
     * @returns {Function} Express中间件函数
     */
    checkPermission(requiredPermission) {
        return (req, res, next) => {
            const userRole = req.user.role;
            const userPermissions = this.getRolePermissions(userRole);
            
            if (userPermissions.includes(requiredPermission)) {
                next();
            } else {
                res.status(403).json({
                    error: '权限不足',
                    required: requiredPermission
                });
            }
        };
    }
}
```

---

## 📊 质量保证

### 测试规范

#### 1. 测试分类
```yaml
单元测试:
  覆盖率要求: ≥80%
  测试框架: Jest (Node.js), PHPUnit (PHP)
  执行频率: 每次代码提交

集成测试:
  覆盖率要求: ≥60%
  测试范围: API接口、数据库操作、外部服务集成
  执行频率: 每日构建

端到端测试:
  覆盖率要求: 核心业务流程100%
  测试工具: Playwright, Cypress
  执行频率: 发布前
```

#### 2. 测试用例示例
```javascript
// N8N工作流测试示例
describe('N8N工作流测试', () => {
    test('应该成功创建用户注册工作流', async () => {
        const workflow = {
            name: '用户注册自动化',
            nodes: [
                {
                    name: 'Webhook',
                    type: 'n8n-nodes-base.webhook',
                    parameters: {
                        httpMethod: 'POST',
                        path: 'user-register'
                    }
                },
                {
                    name: 'MySQL',
                    type: 'n8n-nodes-base.mysql',
                    parameters: {
                        operation: 'insert',
                        table: 'users'
                    }
                }
            ],
            connections: {
                'Webhook': {
                    'main': [
                        [{ 'node': 'MySQL', 'type': 'main', 'index': 0 }]
                    ]
                }
            }
        };
        
        const result = await n8nClient.createWorkflow(workflow);
        expect(result.success).toBe(true);
        expect(result.workflow.id).toBeDefined();
    });
});
```

### 代码审查

#### 1. 审查清单
```yaml
功能性检查:
  - [ ] 功能实现是否符合需求
  - [ ] 错误处理是否完善
  - [ ] 边界条件是否考虑
  - [ ] 性能是否满足要求

代码质量检查:
  - [ ] 代码结构是否清晰
  - [ ] 命名是否规范
  - [ ] 注释是否充分
  - [ ] 是否遵循编码规范

安全性检查:
  - [ ] 是否存在安全漏洞
  - [ ] 敏感信息是否正确处理
  - [ ] 输入验证是否充分
  - [ ] 权限控制是否正确
```

#### 2. 审查流程
```yaml
提交阶段:
  1. 开发者自检
  2. 自动化测试通过
  3. 代码格式化检查
  4. 提交Pull Request

审查阶段:
  1. 同行评审（至少2人）
  2. 架构师审查（复杂变更）
  3. 安全审查（涉及敏感操作）
  4. 最终批准

合并阶段:
  1. 所有检查通过
  2. 冲突解决
  3. 最终测试
  4. 合并到主分支
```

---

## 📈 性能规范

### 性能指标

#### 1. 响应时间要求
```yaml
API响应时间:
  - 简单查询: <200ms
  - 复杂查询: <1s
  - 批量操作: <5s
  - 文件上传: <30s

工作流执行时间:
  - 简单工作流: <5s
  - 复杂工作流: <30s
  - 批量处理: <5min
  - 长时间任务: 异步处理
```

#### 2. 并发处理能力
```yaml
并发要求:
  - API并发: 1000 req/s
  - 工作流并发: 100 workflows/min
  - 数据库连接: 最大200个连接
  - 内存使用: <2GB per process
```

### 性能优化

#### 1. 数据库优化
```sql
-- 索引优化示例
-- 用户表索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status_created ON users(status, created_at);

-- 工作流执行表索引
CREATE INDEX idx_executions_workflow_status ON executions(workflow_id, status);
CREATE INDEX idx_executions_created_at ON executions(created_at DESC);

-- 复合索引
CREATE INDEX idx_users_email_status ON users(email, status);
```

#### 2. 缓存策略
```javascript
// Redis缓存示例
class CacheManager {
    constructor(redisClient) {
        this.redis = redisClient;
        this.defaultTTL = 3600; // 1小时
    }
    
    /**
     * 设置缓存
     * @param {string} key - 缓存键
     * @param {any} value - 缓存值
     * @param {number} ttl - 过期时间（秒）
     */
    async set(key, value, ttl = this.defaultTTL) {
        const serializedValue = JSON.stringify(value);
        await this.redis.setex(key, ttl, serializedValue);
    }
    
    /**
     * 获取缓存
     * @param {string} key - 缓存键
     * @returns {any} 缓存值
     */
    async get(key) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
    }
    
    /**
     * 删除缓存
     * @param {string} key - 缓存键
     */
    async del(key) {
        await this.redis.del(key);
    }
}
```

#### 3. 连接池配置
```javascript
// 数据库连接池配置
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 100,        // 最大连接数
    queueLimit: 0,              // 队列限制
    acquireTimeout: 60000,      // 获取连接超时时间
    timeout: 60000,             // 查询超时时间
    reconnect: true,            // 自动重连
    idleTimeout: 300000,        // 空闲连接超时时间
    maxReusableConnections: 100  // 最大可重用连接数
});
```

---

## 📝 文档规范

### 文档分类

#### 1. 技术文档
```yaml
API文档:
  格式: OpenAPI 3.0
  内容: 接口定义、参数说明、示例代码
  更新频率: 随代码更新

架构文档:
  格式: Markdown + 图表
  内容: 系统架构、组件关系、数据流
  更新频率: 架构变更时

部署文档:
  格式: Markdown
  内容: 环境要求、安装步骤、配置说明
  更新频率: 部署流程变更时
```

#### 2. 用户文档
```yaml
使用指南:
  格式: Markdown
  内容: 功能介绍、操作步骤、最佳实践
  更新频率: 功能发布时

FAQ文档:
  格式: Markdown
  内容: 常见问题、解决方案、故障排除
  更新频率: 问题收集后

发布说明:
  格式: Markdown
  内容: 新功能、改进、已知问题
  更新频率: 每次发布
```

### 文档编写规范

#### 1. 格式规范
```markdown
# 一级标题（文档标题）

## 二级标题（主要章节）

### 三级标题（子章节）

#### 四级标题（详细说明）

**重要内容加粗**
*强调内容斜体*
`代码片段`

> 引用或注意事项

- 无序列表项
- 无序列表项

1. 有序列表项
2. 有序列表项

| 表格标题1 | 表格标题2 |
|----------|----------|
| 内容1    | 内容2    |
```

#### 2. 代码示例规范
```javascript
// 代码示例必须包含：
// 1. 详细的中文注释
// 2. 完整的示例代码
// 3. 预期的输出结果

/**
 * 用户注册API调用示例
 * @description 演示如何调用用户注册接口
 */
async function registerUser() {
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                username: 'newuser',
                email: 'user@example.com',
                password: 'securePassword123'
            })
        });
        
        const result = await response.json();
        console.log('注册成功:', result);
        return result;
    } catch (error) {
        console.error('注册失败:', error);
        throw error;
    }
}

// 预期输出:
// {
//   "success": true,
//   "user": {
//     "id": 123,
//     "username": "newuser",
//     "email": "user@example.com"
//   }
// }
```

---

## 🚀 部署规范

### 环境管理

#### 1. 环境分类
```yaml
开发环境 (Development):
  用途: 日常开发和调试
  数据: 测试数据
  配置: 开发配置
  访问: 开发团队

测试环境 (Testing):
  用途: 功能测试和集成测试
  数据: 模拟生产数据
  配置: 接近生产配置
  访问: 测试团队

预发布环境 (Staging):
  用途: 发布前最终验证
  数据: 生产数据副本
  配置: 生产配置
  访问: 核心团队

生产环境 (Production):
  用途: 正式服务
  数据: 真实业务数据
  配置: 生产配置
  访问: 运维团队
```

#### 2. 配置管理
```yaml
环境变量管理:
  开发环境: .env.development
  测试环境: .env.testing
  预发布环境: .env.staging
  生产环境: .env.production

配置优先级:
  1. 环境变量
  2. 配置文件
  3. 默认值

敏感信息:
  存储方式: 环境变量或密钥管理系统
  访问控制: 最小权限原则
  轮换策略: 定期更新
```

### 部署流程

#### 1. 自动化部署
```yaml
CI/CD流程:
  1. 代码提交触发构建
  2. 自动化测试执行
  3. 代码质量检查
  4. 安全扫描
  5. 构建Docker镜像
  6. 部署到测试环境
  7. 自动化测试验证
  8. 部署到预发布环境
  9. 手动验证
  10. 部署到生产环境
```

#### 2. 部署脚本示例
```bash
#!/bin/bash
# 部署脚本示例

set -e  # 遇到错误立即退出

# 配置变量
APP_NAME="n8n-automation"
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}

echo "开始部署 $APP_NAME 到 $ENVIRONMENT 环境，版本: $VERSION"

# 1. 拉取最新代码
git pull origin main

# 2. 构建Docker镜像
docker build -t $APP_NAME:$VERSION .

# 3. 停止旧容器
docker-compose -f docker-compose.$ENVIRONMENT.yml down

# 4. 启动新容器
docker-compose -f docker-compose.$ENVIRONMENT.yml up -d

# 5. 健康检查
echo "等待服务启动..."
sleep 30

# 检查服务状态
if curl -f http://localhost:5678/healthz; then
    echo "部署成功！"
else
    echo "部署失败，正在回滚..."
    docker-compose -f docker-compose.$ENVIRONMENT.yml down
    docker-compose -f docker-compose.$ENVIRONMENT.yml up -d
    exit 1
fi

echo "部署完成！"
```

### 监控和告警

#### 1. 监控指标
```yaml
系统指标:
  - CPU使用率
  - 内存使用率
  - 磁盘使用率
  - 网络流量

应用指标:
  - API响应时间
  - 错误率
  - 请求量
  - 工作流执行状态

业务指标:
  - 用户活跃度
  - 数据处理量
  - 成功率
  - 业务转化率
```

#### 2. 告警配置
```yaml
告警规则:
  CPU使用率 > 80%:
    级别: 警告
    通知: 邮件
    
  内存使用率 > 90%:
    级别: 严重
    通知: 邮件 + 短信
    
  API错误率 > 5%:
    级别: 严重
    通知: 邮件 + 短信 + 钉钉
    
  服务不可用:
    级别: 紧急
    通知: 电话 + 短信 + 邮件
```

---

## 🔄 版本管理

### Git工作流

#### 1. 分支策略
```yaml
主分支 (main):
  用途: 生产代码
  保护: 禁止直接推送
  合并: 通过Pull Request

开发分支 (develop):
  用途: 集成开发代码
  来源: feature分支合并
  目标: 发布到测试环境

功能分支 (feature/*):
  用途: 新功能开发
  命名: feature/功能名称
  生命周期: 功能完成后删除

修复分支 (hotfix/*):
  用途: 紧急修复
  来源: main分支
  目标: main和develop分支

发布分支 (release/*):
  用途: 发布准备
  来源: develop分支
  目标: main分支
```

#### 2. 提交规范
```yaml
提交信息格式:
  <类型>(<范围>): <描述>
  
  [可选的正文]
  
  [可选的脚注]

类型说明:
  feat: 新功能
  fix: 修复bug
  docs: 文档更新
  style: 代码格式调整
  refactor: 代码重构
  test: 测试相关
  chore: 构建过程或辅助工具的变动

示例:
  feat(auth): 添加用户登录功能
  fix(api): 修复用户注册接口返回错误
  docs(readme): 更新安装说明
```

### 版本发布

#### 1. 语义化版本
```yaml
版本格式: MAJOR.MINOR.PATCH

MAJOR: 不兼容的API修改
MINOR: 向下兼容的功能性新增
PATCH: 向下兼容的问题修正

示例:
  1.0.0: 首个稳定版本
  1.1.0: 新增功能
  1.1.1: 修复bug
  2.0.0: 重大更新，不向下兼容
```

#### 2. 发布流程
```yaml
发布准备:
  1. 创建release分支
  2. 更新版本号
  3. 更新CHANGELOG
  4. 完成测试验证
  5. 代码审查

发布执行:
  1. 合并到main分支
  2. 创建Git标签
  3. 构建发布包
  4. 部署到生产环境
  5. 发布公告

发布后:
  1. 监控系统状态
  2. 收集用户反馈
  3. 处理紧急问题
  4. 准备下个版本
```

---

## 📞 协作规范

### 团队协作

#### 1. 角色职责
```yaml
产品负责人 (PO):
  - 需求管理和优先级排序
  - 用户故事编写
  - 验收标准定义
  - 业务价值评估

技术负责人 (TL):
  - 技术方案设计
  - 代码审查
  - 技术难点攻关
  - 团队技术指导

开发工程师 (Dev):
  - 功能开发实现
  - 单元测试编写
  - 代码质量保证
  - 技术文档编写

测试工程师 (QA):
  - 测试用例设计
  - 功能测试执行
  - 缺陷跟踪管理
  - 质量报告输出

运维工程师 (Ops):
  - 环境搭建维护
  - 部署流程管理
  - 监控告警配置
  - 故障处理响应
```

#### 2. 沟通机制
```yaml
日常沟通:
  - 每日站会: 15分钟，同步进展和问题
  - 周会: 1小时，回顾和计划
  - 月会: 2小时，总结和改进

项目沟通:
  - 需求评审: 产品、开发、测试参与
  - 技术评审: 技术团队内部讨论
  - 发布评审: 全团队参与决策

问题沟通:
  - 紧急问题: 立即沟通，电话或即时消息
  - 一般问题: 24小时内响应
  - 技术讨论: 预约会议深入讨论
```

### 知识管理

#### 1. 文档管理
```yaml
文档分类:
  - 需求文档: 产品需求、用户故事
  - 设计文档: 架构设计、接口设计
  - 开发文档: 代码说明、API文档
  - 测试文档: 测试计划、测试报告
  - 运维文档: 部署指南、故障手册

文档要求:
  - 及时更新: 代码变更时同步更新文档
  - 版本控制: 文档纳入版本管理
  - 审查机制: 重要文档需要审查
  - 访问控制: 根据角色控制访问权限
```

#### 2. 知识分享
```yaml
分享机制:
  - 技术分享: 每周技术分享会
  - 经验总结: 项目结束后经验总结
  - 最佳实践: 定期整理和分享最佳实践
  - 外部学习: 参加会议和培训后分享

知识库:
  - 技术文档: 架构、设计、实现细节
  - 问题解决: 常见问题和解决方案
  - 工具使用: 开发工具和平台使用指南
  - 流程规范: 开发、测试、部署流程
```

---

## 📋 附录

### 检查清单

#### 1. 开发检查清单
```yaml
代码提交前:
  - [ ] 代码符合编码规范
  - [ ] 单元测试通过
  - [ ] 代码审查完成
  - [ ] 文档更新完成
  - [ ] 安全检查通过

功能开发完成:
  - [ ] 需求实现完整
  - [ ] 边界条件处理
  - [ ] 错误处理完善
  - [ ] 性能满足要求
  - [ ] 用户体验良好

发布准备:
  - [ ] 集成测试通过
  - [ ] 性能测试通过
  - [ ] 安全测试通过
  - [ ] 文档更新完成
  - [ ] 发布说明准备
```

#### 2. 部署检查清单
```yaml
部署前检查:
  - [ ] 环境配置正确
  - [ ] 数据库迁移完成
  - [ ] 依赖服务正常
  - [ ] 备份策略就绪
  - [ ] 回滚方案准备

部署后验证:
  - [ ] 服务启动正常
  - [ ] 健康检查通过
  - [ ] 核心功能验证
  - [ ] 监控告警配置
  - [ ] 日志输出正常
```

### 常用命令

#### 1. Git命令
```bash
# 创建功能分支
git checkout -b feature/new-feature

# 提交代码
git add .
git commit -m "feat(api): 添加用户管理接口"

# 推送分支
git push origin feature/new-feature

# 合并分支
git checkout develop
git merge feature/new-feature

# 删除分支
git branch -d feature/new-feature
```

#### 2. Docker命令
```bash
# 构建镜像
docker build -t n8n-automation:latest .

# 运行容器
docker run -d --name n8n-app -p 5678:5678 n8n-automation:latest

# 查看日志
docker logs -f n8n-app

# 进入容器
docker exec -it n8n-app /bin/bash

# 停止容器
docker stop n8n-app

# 删除容器
docker rm n8n-app
```

#### 3. N8N命令
```bash
# 启动N8N
n8n start

# 导出工作流
n8n export:workflow --all --output=workflows.json

# 导入工作流
n8n import:workflow --input=workflows.json

# 执行工作流
n8n execute --id=workflow-id
```

### 参考资源

#### 1. 官方文档
- [N8N官方文档](https://docs.n8n.io/)
- [Docker官方文档](https://docs.docker.com/)
- [Git官方文档](https://git-scm.com/doc)

#### 2. 最佳实践
- [代码审查最佳实践](https://github.com/features/code-review/)
- [API设计最佳实践](https://restfulapi.net/)
- [安全开发最佳实践](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)

#### 3. 工具推荐
- [VSCode](https://code.visualstudio.com/): 代码编辑器
- [Postman](https://www.postman.com/): API测试工具
- [Docker Desktop](https://www.docker.com/products/docker-desktop): 容器管理
- [Git](https://git-scm.com/): 版本控制

---

**文档维护**: 本文档由项目团队共同维护，如有问题或建议，请通过GitHub Issues反馈。

**最后更新**: 2025年1月16日  
**下次审查**: 2025年2月16日