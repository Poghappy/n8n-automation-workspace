# AI智能体系统

## 📋 项目概述

AI智能体系统是N8N自动化工作空间的智能化核心，提供执行官智能体和教学老师智能体两个主要组件。系统基于FastAPI构建，集成了先进的AI技术，为工作流自动化和学习指导提供智能化支持。

## 🚀 功能特性

- **🤖 执行官智能体**: 工作流创建、执行和优化
- **👨‍🏫 教学老师智能体**: 学习指导和技能提升
- **🧠 知识库系统**: 智能知识管理和检索
- **🔄 工作流集成**: 与N8N无缝集成
- **📊 智能分析**: 数据分析和决策支持
- **🎯 个性化服务**: 基于用户行为的个性化建议
- **🔌 API接口**: RESTful API和WebSocket支持
- **📈 学习追踪**: 学习进度和效果跟踪

## 📁 目录结构

```
04-ai-agents/
├── workflow_executive/          # 执行官智能体
│   ├── src/                    # 源代码
│   ├── models/                 # AI模型
│   ├── workflows/              # 工作流模板
│   ├── config/                 # 配置文件
│   └── tests/                  # 测试文件
├── teaching_agent/             # 教学老师智能体
│   ├── src/                    # 源代码
│   ├── curriculum/             # 课程内容
│   ├── assessments/            # 评估系统
│   ├── resources/              # 学习资源
│   └── analytics/              # 学习分析
├── shared/                     # 共享组件
│   ├── knowledge_base/         # 知识库
│   ├── utils/                  # 工具函数
│   ├── models/                 # 共享模型
│   └── config/                 # 共享配置
├── api/                        # API接口
├── docs/                       # 文档
└── requirements.txt            # 依赖列表
```

## 🛠️ 快速开始

### 环境要求

- Python 3.8+
- FastAPI
- SQLAlchemy
- Redis
- PostgreSQL
- OpenAI API / 其他LLM API
- Vector Database (Chroma/Pinecone)

### 安装部署

#### 1. 环境配置

```bash
# 进入项目目录
cd 04-ai-agents

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

#### 2. 配置文件

```bash
# 复制配置模板
cp config.example.yaml config.yaml

# 编辑配置文件
vim config.yaml
```

#### 3. 初始化数据库

```bash
# 初始化数据库
python scripts/init_database.py

# 初始化知识库
python scripts/init_knowledge_base.py

# 导入预置数据
python scripts/import_data.py
```

#### 4. 启动服务

```bash
# 启动API服务
python main.py

# 或使用uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 访问服务

- **API文档**: http://localhost:8000/docs
- **执行官智能体**: http://localhost:8000/api/v1/executive
- **教学老师智能体**: http://localhost:8000/api/v1/teacher
- **知识库API**: http://localhost:8000/api/v1/knowledge
- **WebSocket**: ws://localhost:8000/ws

## 🤖 执行官智能体

### 功能特性

- **工作流创建**: 基于自然语言描述自动生成N8N工作流
- **智能优化**: 分析和优化现有工作流性能
- **错误诊断**: 自动检测和修复工作流问题
- **资源管理**: 智能分配和管理系统资源
- **决策支持**: 基于数据分析提供决策建议

### API使用

```python
import requests

# 创建工作流
response = requests.post("http://localhost:8000/api/v1/executive/create_workflow", 
    json={
        "description": "创建一个每天定时同步用户数据的工作流",
        "requirements": {
            "schedule": "daily",
            "data_source": "mysql",
            "target": "api"
        }
    }
)

# 优化工作流
response = requests.post("http://localhost:8000/api/v1/executive/optimize_workflow",
    json={
        "workflow_id": "workflow_123",
        "optimization_type": "performance"
    }
)

# 诊断问题
response = requests.post("http://localhost:8000/api/v1/executive/diagnose",
    json={
        "workflow_id": "workflow_123",
        "error_logs": ["error message 1", "error message 2"]
    }
)
```

### 工作流模板

```json
{
    "data_sync_template": {
        "name": "数据同步模板",
        "description": "通用数据同步工作流模板",
        "nodes": [
            {
                "type": "schedule_trigger",
                "config": {"cron": "0 0 * * *"}
            },
            {
                "type": "mysql_query",
                "config": {"query": "SELECT * FROM users"}
            },
            {
                "type": "http_request",
                "config": {"method": "POST", "url": "{{api_endpoint}}"}
            }
        ]
    }
}
```

## 👨‍🏫 教学老师智能体

### 功能特性

- **个性化学习**: 根据学习者水平定制学习路径
- **智能答疑**: 自动回答技术问题和提供解决方案
- **进度跟踪**: 实时跟踪学习进度和效果
- **技能评估**: 智能评估技能水平和知识掌握度
- **资源推荐**: 推荐相关学习资源和实践项目

### API使用

```python
# 开始学习会话
response = requests.post("http://localhost:8000/api/v1/teacher/start_session",
    json={
        "user_id": "user_123",
        "topic": "N8N工作流开发",
        "skill_level": "beginner"
    }
)

# 提问
response = requests.post("http://localhost:8000/api/v1/teacher/ask_question",
    json={
        "session_id": "session_456",
        "question": "如何创建一个定时触发的工作流？"
    }
)

# 获取学习建议
response = requests.get("http://localhost:8000/api/v1/teacher/recommendations",
    params={
        "user_id": "user_123",
        "topic": "workflow_optimization"
    }
)
```

### 课程体系

```yaml
courses:
  n8n_basics:
    title: "N8N基础入门"
    duration: "2周"
    modules:
      - introduction: "N8N简介和安装"
      - first_workflow: "创建第一个工作流"
      - nodes_overview: "常用节点介绍"
      - debugging: "调试和故障排除"
    
  advanced_workflows:
    title: "高级工作流开发"
    duration: "4周"
    modules:
      - complex_logic: "复杂逻辑处理"
      - api_integration: "API集成最佳实践"
      - performance_optimization: "性能优化技巧"
      - error_handling: "错误处理和重试机制"
```

## 🧠 知识库系统

### 功能特性

- **向量搜索**: 基于语义的智能搜索
- **知识图谱**: 结构化知识关系管理
- **自动更新**: 持续学习和知识更新
- **多模态支持**: 文本、图片、视频等多种格式
- **版本控制**: 知识版本管理和回滚

### 知识库API

```python
# 添加知识
response = requests.post("http://localhost:8000/api/v1/knowledge/add",
    json={
        "title": "N8N Webhook节点使用指南",
        "content": "详细的使用说明...",
        "tags": ["n8n", "webhook", "tutorial"],
        "category": "documentation"
    }
)

# 搜索知识
response = requests.get("http://localhost:8000/api/v1/knowledge/search",
    params={
        "query": "如何配置webhook节点",
        "limit": 10,
        "similarity_threshold": 0.8
    }
)

# 获取相关知识
response = requests.get("http://localhost:8000/api/v1/knowledge/related",
    params={
        "knowledge_id": "kb_123",
        "limit": 5
    }
)
```

## 🔧 配置说明

### 基础配置

```yaml
# config.yaml
api:
  host: "0.0.0.0"
  port: 8000
  debug: false

database:
  url: "postgresql://user:password@localhost:5432/ai_agents"
  pool_size: 10
  max_overflow: 20

redis:
  host: "localhost"
  port: 6379
  db: 0
  password: null

ai_models:
  openai:
    api_key: "your_openai_api_key"
    model: "gpt-4"
    temperature: 0.7
  
  embedding:
    provider: "openai"
    model: "text-embedding-ada-002"

knowledge_base:
  vector_db: "chroma"
  collection_name: "n8n_knowledge"
  chunk_size: 1000
  chunk_overlap: 200

n8n_integration:
  base_url: "http://localhost:5678"
  api_key: "your_n8n_api_key"
  webhook_url: "http://localhost:8000/webhooks/n8n"
```

## 📊 监控和分析

### 性能监控

```python
# 监控API性能
@app.middleware("http")
async def monitor_performance(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # 记录性能指标
    metrics.record_api_latency(
        endpoint=request.url.path,
        method=request.method,
        latency=process_time
    )
    
    return response
```

### 学习分析

```python
# 学习效果分析
def analyze_learning_progress(user_id: str):
    sessions = get_user_sessions(user_id)
    
    metrics = {
        "total_sessions": len(sessions),
        "avg_session_duration": calculate_avg_duration(sessions),
        "skill_improvement": calculate_skill_growth(sessions),
        "knowledge_retention": calculate_retention_rate(sessions)
    }
    
    return metrics
```

## 🔍 故障排除

### 常见问题

1. **AI模型响应慢**
   ```python
   # 优化模型配置
   config.ai_models.openai.temperature = 0.3
   config.ai_models.openai.max_tokens = 1000
   ```

2. **知识库搜索不准确**
   ```python
   # 调整相似度阈值
   config.knowledge_base.similarity_threshold = 0.7
   
   # 重新训练embedding
   python scripts/retrain_embeddings.py
   ```

3. **内存使用过高**
   ```python
   # 优化批处理大小
   config.processing.batch_size = 32
   
   # 启用模型缓存清理
   config.ai_models.cache_cleanup = True
   ```

### 调试工具

```bash
# 启用调试模式
export DEBUG=true
python main.py

# 查看详细日志
tail -f logs/ai_agents.log

# 性能分析
python scripts/profile_performance.py
```

## 📚 开发指南

### 添加新智能体

```python
# 1. 创建智能体类
class CustomAgent(BaseAgent):
    def __init__(self, config):
        super().__init__(config)
        self.name = "custom_agent"
    
    async def process_request(self, request):
        # 实现处理逻辑
        pass

# 2. 注册智能体
agent_registry.register("custom", CustomAgent)

# 3. 添加API端点
@app.post("/api/v1/custom/process")
async def process_custom_request(request: CustomRequest):
    agent = get_agent("custom")
    result = await agent.process_request(request)
    return result
```

### 扩展知识库

```python
# 添加新的知识源
class CustomKnowledgeSource(BaseKnowledgeSource):
    def extract_knowledge(self, source_data):
        # 实现知识提取逻辑
        pass
    
    def format_knowledge(self, raw_knowledge):
        # 实现知识格式化逻辑
        pass

# 注册知识源
knowledge_registry.register("custom_source", CustomKnowledgeSource)
```

## 🤝 贡献指南

详细信息请参考 [CONTRIBUTING.md](../CONTRIBUTING.md)

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](../LICENSE) 文件

---

更多信息请访问 [项目主页](https://github.com/Poghappy/n8n-automation-workspace)
