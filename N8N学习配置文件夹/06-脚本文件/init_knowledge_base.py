#!/usr/bin/env python3
"""
N8N智能体系统 - 知识库初始化脚本
初始化知识库数据，包括N8N节点信息、工作流模板、最佳实践等
"""

import os
import sys
import json
import asyncio
from pathlib import Path
from typing import Dict, List, Any

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "src"))

from knowledge.knowledge_base import (
    KnowledgeBase, KnowledgeEntry, KnowledgeType, 
    KnowledgeCategory, KnowledgeSource
)
from core.config import Config

class KnowledgeBaseInitializer:
    """知识库初始化器"""
    
    def __init__(self):
        self.config = Config()
        self.knowledge_base = KnowledgeBase()
        
    async def initialize(self):
        """初始化知识库"""
        print("🚀 开始初始化N8N智能体知识库...")
        
        try:
            # 1. 初始化N8N节点知识
            await self._init_n8n_nodes()
            
            # 2. 初始化工作流模板
            await self._init_workflow_templates()
            
            # 3. 初始化最佳实践
            await self._init_best_practices()
            
            # 4. 初始化常见问题
            await self._init_faq()
            
            # 5. 初始化API文档
            await self._init_api_docs()
            
            print("✅ 知识库初始化完成！")
            
        except Exception as e:
            print(f"❌ 知识库初始化失败: {e}")
            raise
    
    async def _init_n8n_nodes(self):
        """初始化N8N节点知识"""
        print("📦 初始化N8N节点知识...")
        
        # 核心节点信息
        core_nodes = [
            {
                "title": "HTTP Request节点",
                "content": """
HTTP Request节点用于发送HTTP请求到外部API或服务。

主要配置：
- Method: GET, POST, PUT, DELETE等
- URL: 目标API地址
- Headers: 请求头信息
- Body: 请求体数据（POST/PUT）
- Authentication: 认证方式

使用场景：
- 调用REST API
- 数据获取和提交
- 第三方服务集成
- Webhook触发

最佳实践：
- 使用环境变量存储敏感信息
- 设置合适的超时时间
- 处理错误响应
- 使用重试机制
                """,
                "category": KnowledgeCategory.TECHNICAL,
                "type": KnowledgeType.NODE_DOCUMENTATION,
                "tags": ["http", "api", "request", "integration"],
                "metadata": {
                    "node_type": "n8n-nodes-base.httpRequest",
                    "difficulty": "beginner",
                    "use_cases": ["api_integration", "data_fetching"]
                }
            },
            {
                "title": "Webhook节点",
                "content": """
Webhook节点用于接收外部系统的HTTP请求，触发工作流执行。

主要配置：
- HTTP Method: 接受的请求方法
- Path: Webhook路径
- Authentication: 认证设置
- Response: 响应配置

使用场景：
- 接收第三方系统通知
- 表单提交处理
- 实时数据同步
- 事件驱动自动化

最佳实践：
- 设置认证保护
- 验证请求数据
- 处理异常情况
- 记录请求日志
                """,
                "category": KnowledgeCategory.TECHNICAL,
                "type": KnowledgeType.NODE_DOCUMENTATION,
                "tags": ["webhook", "trigger", "http", "automation"],
                "metadata": {
                    "node_type": "n8n-nodes-base.webhook",
                    "difficulty": "beginner",
                    "use_cases": ["event_trigger", "data_receiving"]
                }
            },
            {
                "title": "Code节点",
                "content": """
Code节点允许执行自定义JavaScript代码，处理复杂的数据转换逻辑。

主要功能：
- 数据转换和处理
- 复杂逻辑实现
- 第三方库调用
- 条件判断

可用变量：
- $input: 输入数据
- $node: 节点信息
- $workflow: 工作流信息
- $json: 当前项目数据

最佳实践：
- 保持代码简洁
- 添加错误处理
- 使用注释说明
- 避免阻塞操作
                """,
                "category": KnowledgeCategory.TECHNICAL,
                "type": KnowledgeType.NODE_DOCUMENTATION,
                "tags": ["code", "javascript", "transformation", "logic"],
                "metadata": {
                    "node_type": "n8n-nodes-base.code",
                    "difficulty": "intermediate",
                    "use_cases": ["data_transformation", "custom_logic"]
                }
            }
        ]
        
        for node_info in core_nodes:
            entry = KnowledgeEntry(
                title=node_info["title"],
                content=node_info["content"],
                category=node_info["category"],
                type=node_info["type"],
                tags=node_info["tags"],
                source=KnowledgeSource.DOCUMENTATION,
                metadata=node_info["metadata"]
            )
            await self.knowledge_base.add_entry(entry)
    
    async def _init_workflow_templates(self):
        """初始化工作流模板"""
        print("🔄 初始化工作流模板...")
        
        templates = [
            {
                "title": "数据同步工作流模板",
                "content": """
数据同步工作流用于在不同系统间同步数据。

基本结构：
1. 触发器（定时/Webhook）
2. 数据源获取
3. 数据转换处理
4. 目标系统写入
5. 错误处理和通知

示例场景：
- CRM到ERP数据同步
- 数据库间数据迁移
- API数据聚合
- 文件数据处理

关键节点：
- Schedule Trigger: 定时触发
- HTTP Request: 数据获取
- Code: 数据转换
- Database: 数据存储
- Email: 错误通知
                """,
                "category": KnowledgeCategory.WORKFLOW,
                "type": KnowledgeType.TEMPLATE,
                "tags": ["data_sync", "integration", "automation"],
                "metadata": {
                    "template_type": "data_sync",
                    "complexity": "medium",
                    "estimated_time": "30-60 minutes"
                }
            },
            {
                "title": "API集成工作流模板",
                "content": """
API集成工作流用于连接和整合不同的API服务。

基本结构：
1. API认证设置
2. 数据请求和获取
3. 响应数据处理
4. 业务逻辑执行
5. 结果输出和存储

示例场景：
- 第三方服务集成
- 数据聚合和分析
- 自动化报告生成
- 实时监控告警

关键节点：
- HTTP Request: API调用
- Set: 变量设置
- IF: 条件判断
- Code: 数据处理
- Webhook Response: 响应返回
                """,
                "category": KnowledgeCategory.WORKFLOW,
                "type": KnowledgeType.TEMPLATE,
                "tags": ["api", "integration", "automation"],
                "metadata": {
                    "template_type": "api_integration",
                    "complexity": "medium",
                    "estimated_time": "45-90 minutes"
                }
            }
        ]
        
        for template in templates:
            entry = KnowledgeEntry(
                title=template["title"],
                content=template["content"],
                category=template["category"],
                type=template["type"],
                tags=template["tags"],
                source=KnowledgeSource.TEMPLATE,
                metadata=template["metadata"]
            )
            await self.knowledge_base.add_entry(entry)
    
    async def _init_best_practices(self):
        """初始化最佳实践"""
        print("💡 初始化最佳实践...")
        
        practices = [
            {
                "title": "N8N工作流设计最佳实践",
                "content": """
设计高效、可维护的N8N工作流的最佳实践：

1. 工作流结构设计
- 保持工作流简洁明了
- 使用清晰的节点命名
- 合理分组相关节点
- 添加必要的注释说明

2. 错误处理
- 为关键节点设置错误处理
- 使用Try-Catch模式
- 记录错误日志
- 设置告警通知

3. 性能优化
- 避免不必要的数据传输
- 使用批处理减少API调用
- 合理设置超时时间
- 优化数据转换逻辑

4. 安全考虑
- 使用凭据管理敏感信息
- 验证输入数据
- 限制访问权限
- 定期更新依赖

5. 测试和调试
- 使用测试数据验证
- 逐步调试复杂工作流
- 监控执行状态
- 记录执行历史
                """,
                "category": KnowledgeCategory.BEST_PRACTICE,
                "type": KnowledgeType.GUIDE,
                "tags": ["best_practice", "design", "optimization"],
                "metadata": {
                    "difficulty": "intermediate",
                    "importance": "high"
                }
            }
        ]
        
        for practice in practices:
            entry = KnowledgeEntry(
                title=practice["title"],
                content=practice["content"],
                category=practice["category"],
                type=practice["type"],
                tags=practice["tags"],
                source=KnowledgeSource.BEST_PRACTICE,
                metadata=practice["metadata"]
            )
            await self.knowledge_base.add_entry(entry)
    
    async def _init_faq(self):
        """初始化常见问题"""
        print("❓ 初始化常见问题...")
        
        faqs = [
            {
                "title": "如何处理N8N工作流执行失败？",
                "content": """
工作流执行失败的常见原因和解决方案：

1. 网络连接问题
- 检查网络连接状态
- 验证API端点可访问性
- 增加重试机制
- 设置合适的超时时间

2. 认证失败
- 检查API密钥是否正确
- 验证认证方式配置
- 确认权限设置
- 更新过期的凭据

3. 数据格式错误
- 验证输入数据格式
- 检查数据类型匹配
- 添加数据验证逻辑
- 使用数据转换节点

4. 配置错误
- 检查节点配置参数
- 验证环境变量设置
- 确认工作流连接正确
- 测试单个节点功能

调试技巧：
- 使用执行日志查看详细信息
- 启用节点调试模式
- 逐步测试工作流
- 使用测试数据验证
                """,
                "category": KnowledgeCategory.TROUBLESHOOTING,
                "type": KnowledgeType.FAQ,
                "tags": ["troubleshooting", "debugging", "error_handling"],
                "metadata": {
                    "frequency": "high",
                    "difficulty": "beginner"
                }
            }
        ]
        
        for faq in faqs:
            entry = KnowledgeEntry(
                title=faq["title"],
                content=faq["content"],
                category=faq["category"],
                type=faq["type"],
                tags=faq["tags"],
                source=KnowledgeSource.FAQ,
                metadata=faq["metadata"]
            )
            await self.knowledge_base.add_entry(entry)
    
    async def _init_api_docs(self):
        """初始化API文档"""
        print("📚 初始化API文档...")
        
        api_docs = [
            {
                "title": "N8N API使用指南",
                "content": """
N8N提供REST API用于程序化管理工作流和执行。

基础配置：
- API Base URL: http://localhost:5678/api/v1
- 认证方式: API Key或Basic Auth
- 内容类型: application/json

主要端点：

1. 工作流管理
- GET /workflows - 获取工作流列表
- POST /workflows - 创建新工作流
- PUT /workflows/{id} - 更新工作流
- DELETE /workflows/{id} - 删除工作流

2. 执行管理
- POST /workflows/{id}/execute - 执行工作流
- GET /executions - 获取执行历史
- GET /executions/{id} - 获取执行详情

3. 凭据管理
- GET /credentials - 获取凭据列表
- POST /credentials - 创建凭据
- PUT /credentials/{id} - 更新凭据

使用示例：
```bash
# 获取工作流列表
curl -X GET "http://localhost:5678/api/v1/workflows" \
  -H "X-N8N-API-KEY: your-api-key"

# 执行工作流
curl -X POST "http://localhost:5678/api/v1/workflows/1/execute" \
  -H "X-N8N-API-KEY: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"data": {"input": "test"}}'
```
                """,
                "category": KnowledgeCategory.TECHNICAL,
                "type": KnowledgeType.API_DOCUMENTATION,
                "tags": ["api", "rest", "integration", "automation"],
                "metadata": {
                    "api_version": "v1",
                    "difficulty": "intermediate"
                }
            }
        ]
        
        for doc in api_docs:
            entry = KnowledgeEntry(
                title=doc["title"],
                content=doc["content"],
                category=doc["category"],
                type=doc["type"],
                tags=doc["tags"],
                source=KnowledgeSource.API_DOCUMENTATION,
                metadata=doc["metadata"]
            )
            await self.knowledge_base.add_entry(entry)

async def main():
    """主函数"""
    initializer = KnowledgeBaseInitializer()
    await initializer.initialize()

if __name__ == "__main__":
    asyncio.run(main())