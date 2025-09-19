#!/usr/bin/env python3
"""
N8N工作流模板库管理器
版本: 1.0.0
作者: AI智能体系统
"""

import asyncio
import json
import logging
import os
import yaml
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime
import hashlib
from pathlib import Path
import sqlite3
from collections import defaultdict
import re

# 导入工具和配置
from src.utils.logger import setup_logger
from src.utils.config import load_config
from core.intent_analyzer import IntentType, ComplexityLevel

class TemplateCategory(Enum):
    """模板分类枚举"""
    # 数据处理类
    DATA_PROCESSING = "data_processing"
    DATA_TRANSFORMATION = "data_transformation"
    DATA_VALIDATION = "data_validation"
    
    # API集成类
    API_INTEGRATION = "api_integration"
    WEBHOOK_PROCESSING = "webhook_processing"
    REST_API = "rest_api"
    
    # 自动化流程类
    BUSINESS_AUTOMATION = "business_automation"
    TASK_SCHEDULING = "task_scheduling"
    NOTIFICATION_SYSTEM = "notification_system"
    
    # 监控告警类
    SYSTEM_MONITORING = "system_monitoring"
    ERROR_HANDLING = "error_handling"
    PERFORMANCE_MONITORING = "performance_monitoring"
    
    # 文件处理类
    FILE_PROCESSING = "file_processing"
    DOCUMENT_GENERATION = "document_generation"
    MEDIA_PROCESSING = "media_processing"
    
    # 数据库操作类
    DATABASE_OPERATIONS = "database_operations"
    DATA_SYNC = "data_sync"
    BACKUP_RESTORE = "backup_restore"
    
    # 通信集成类
    EMAIL_AUTOMATION = "email_automation"
    CHAT_INTEGRATION = "chat_integration"
    SMS_NOTIFICATION = "sms_notification"
    
    # 安全合规类
    SECURITY_AUDIT = "security_audit"
    COMPLIANCE_CHECK = "compliance_check"
    ACCESS_CONTROL = "access_control"

class TemplateComplexity(Enum):
    """模板复杂度枚举"""
    BASIC = "basic"           # 基础：1-3个节点
    INTERMEDIATE = "intermediate"  # 中级：4-8个节点
    ADVANCED = "advanced"     # 高级：9-15个节点
    EXPERT = "expert"         # 专家：16+个节点

class TemplateUsagePattern(Enum):
    """模板使用模式枚举"""
    ONE_TIME = "one_time"         # 一次性执行
    SCHEDULED = "scheduled"       # 定时执行
    TRIGGERED = "triggered"       # 事件触发
    INTERACTIVE = "interactive"   # 交互式执行
    BATCH = "batch"              # 批处理

@dataclass
class WorkflowTemplate:
    """工作流模板数据类"""
    # 基础信息
    id: str
    name: str
    description: str
    category: TemplateCategory
    complexity: TemplateComplexity
    usage_pattern: TemplateUsagePattern
    
    # 模板内容
    workflow_json: Dict[str, Any]
    nodes: List[Dict[str, Any]]
    connections: Dict[str, Any]
    
    # 配置信息
    required_credentials: List[str]
    required_nodes: List[str]
    configurable_parameters: Dict[str, Any]
    environment_variables: List[str]
    
    # 使用指南
    setup_instructions: List[str]
    usage_examples: List[Dict[str, Any]]
    troubleshooting_tips: List[str]
    
    # 标签和搜索
    tags: List[str]
    keywords: List[str]
    use_cases: List[str]
    
    # 兼容性信息
    n8n_version_min: str
    n8n_version_max: Optional[str]
    supported_platforms: List[str]
    
    # 性能指标
    estimated_execution_time: int  # 秒
    resource_requirements: Dict[str, Any]
    scalability_notes: str
    
    # 元数据
    author: str
    version: str
    created_at: datetime
    updated_at: datetime
    usage_count: int
    rating: float
    
    # 依赖关系
    dependencies: List[str]
    related_templates: List[str]
    prerequisite_knowledge: List[str]

@dataclass
class TemplateSearchCriteria:
    """模板搜索条件"""
    # 基础搜索
    query: Optional[str] = None
    category: Optional[TemplateCategory] = None
    complexity: Optional[TemplateComplexity] = None
    usage_pattern: Optional[TemplateUsagePattern] = None
    
    # 功能搜索
    required_nodes: List[str] = None
    tags: List[str] = None
    use_cases: List[str] = None
    
    # 约束条件
    max_complexity: Optional[TemplateComplexity] = None
    max_execution_time: Optional[int] = None
    required_credentials: List[str] = None
    
    # 排序和过滤
    sort_by: str = "relevance"  # relevance, popularity, rating, created_at
    sort_order: str = "desc"    # asc, desc
    limit: int = 10

@dataclass
class TemplateMatchResult:
    """模板匹配结果"""
    template: WorkflowTemplate
    relevance_score: float
    match_reasons: List[str]
    customization_suggestions: List[str]
    setup_complexity: str
    estimated_setup_time: int

class TemplateDatabase:
    """模板数据库管理器"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.logger = setup_logger("TemplateDatabase")
        self._init_database()
    
    def _init_database(self):
        """初始化数据库"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 创建模板表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS templates (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    category TEXT,
                    complexity TEXT,
                    usage_pattern TEXT,
                    workflow_json TEXT,
                    nodes TEXT,
                    connections TEXT,
                    required_credentials TEXT,
                    required_nodes TEXT,
                    configurable_parameters TEXT,
                    environment_variables TEXT,
                    setup_instructions TEXT,
                    usage_examples TEXT,
                    troubleshooting_tips TEXT,
                    tags TEXT,
                    keywords TEXT,
                    use_cases TEXT,
                    n8n_version_min TEXT,
                    n8n_version_max TEXT,
                    supported_platforms TEXT,
                    estimated_execution_time INTEGER,
                    resource_requirements TEXT,
                    scalability_notes TEXT,
                    author TEXT,
                    version TEXT,
                    created_at TEXT,
                    updated_at TEXT,
                    usage_count INTEGER DEFAULT 0,
                    rating REAL DEFAULT 0.0,
                    dependencies TEXT,
                    related_templates TEXT,
                    prerequisite_knowledge TEXT
                )
            ''')
            
            # 创建搜索索引
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_category ON templates(category)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_complexity ON templates(complexity)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_tags ON templates(tags)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_rating ON templates(rating)
            ''')
            
            # 创建使用统计表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS template_usage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    template_id TEXT,
                    user_id TEXT,
                    usage_timestamp TEXT,
                    success BOOLEAN,
                    execution_time INTEGER,
                    feedback_rating INTEGER,
                    feedback_comment TEXT,
                    FOREIGN KEY (template_id) REFERENCES templates (id)
                )
            ''')
            
            conn.commit()
            conn.close()
            
            self.logger.info("模板数据库初始化完成")
            
        except Exception as e:
            self.logger.error(f"数据库初始化失败: {str(e)}")
            raise
    
    async def save_template(self, template: WorkflowTemplate) -> bool:
        """保存模板"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 转换数据
            template_data = (
                template.id,
                template.name,
                template.description,
                template.category.value,
                template.complexity.value,
                template.usage_pattern.value,
                json.dumps(template.workflow_json),
                json.dumps(template.nodes),
                json.dumps(template.connections),
                json.dumps(template.required_credentials),
                json.dumps(template.required_nodes),
                json.dumps(template.configurable_parameters),
                json.dumps(template.environment_variables),
                json.dumps(template.setup_instructions),
                json.dumps(template.usage_examples),
                json.dumps(template.troubleshooting_tips),
                json.dumps(template.tags),
                json.dumps(template.keywords),
                json.dumps(template.use_cases),
                template.n8n_version_min,
                template.n8n_version_max,
                json.dumps(template.supported_platforms),
                template.estimated_execution_time,
                json.dumps(template.resource_requirements),
                template.scalability_notes,
                template.author,
                template.version,
                template.created_at.isoformat(),
                template.updated_at.isoformat(),
                template.usage_count,
                template.rating,
                json.dumps(template.dependencies),
                json.dumps(template.related_templates),
                json.dumps(template.prerequisite_knowledge)
            )
            
            cursor.execute('''
                INSERT OR REPLACE INTO templates VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            ''', template_data)
            
            conn.commit()
            conn.close()
            
            self.logger.info(f"模板保存成功: {template.id}")
            return True
            
        except Exception as e:
            self.logger.error(f"模板保存失败: {str(e)}")
            return False
    
    async def get_template(self, template_id: str) -> Optional[WorkflowTemplate]:
        """获取模板"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM templates WHERE id = ?', (template_id,))
            row = cursor.fetchone()
            
            conn.close()
            
            if row:
                return self._row_to_template(row)
            
            return None
            
        except Exception as e:
            self.logger.error(f"获取模板失败: {str(e)}")
            return None
    
    async def search_templates(self, criteria: TemplateSearchCriteria) -> List[WorkflowTemplate]:
        """搜索模板"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 构建查询条件
            where_conditions = []
            params = []
            
            if criteria.category:
                where_conditions.append("category = ?")
                params.append(criteria.category.value)
            
            if criteria.complexity:
                where_conditions.append("complexity = ?")
                params.append(criteria.complexity.value)
            
            if criteria.usage_pattern:
                where_conditions.append("usage_pattern = ?")
                params.append(criteria.usage_pattern.value)
            
            if criteria.query:
                where_conditions.append(
                    "(name LIKE ? OR description LIKE ? OR tags LIKE ? OR keywords LIKE ?)"
                )
                query_param = f"%{criteria.query}%"
                params.extend([query_param, query_param, query_param, query_param])
            
            # 构建SQL查询
            sql = "SELECT * FROM templates"
            if where_conditions:
                sql += " WHERE " + " AND ".join(where_conditions)
            
            # 添加排序
            if criteria.sort_by == "popularity":
                sql += " ORDER BY usage_count"
            elif criteria.sort_by == "rating":
                sql += " ORDER BY rating"
            elif criteria.sort_by == "created_at":
                sql += " ORDER BY created_at"
            else:
                sql += " ORDER BY rating"  # 默认按评分排序
            
            if criteria.sort_order == "desc":
                sql += " DESC"
            
            sql += f" LIMIT {criteria.limit}"
            
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            
            conn.close()
            
            templates = [self._row_to_template(row) for row in rows]
            return templates
            
        except Exception as e:
            self.logger.error(f"搜索模板失败: {str(e)}")
            return []
    
    def _row_to_template(self, row) -> WorkflowTemplate:
        """将数据库行转换为模板对象"""
        return WorkflowTemplate(
            id=row[0],
            name=row[1],
            description=row[2],
            category=TemplateCategory(row[3]),
            complexity=TemplateComplexity(row[4]),
            usage_pattern=TemplateUsagePattern(row[5]),
            workflow_json=json.loads(row[6]),
            nodes=json.loads(row[7]),
            connections=json.loads(row[8]),
            required_credentials=json.loads(row[9]),
            required_nodes=json.loads(row[10]),
            configurable_parameters=json.loads(row[11]),
            environment_variables=json.loads(row[12]),
            setup_instructions=json.loads(row[13]),
            usage_examples=json.loads(row[14]),
            troubleshooting_tips=json.loads(row[15]),
            tags=json.loads(row[16]),
            keywords=json.loads(row[17]),
            use_cases=json.loads(row[18]),
            n8n_version_min=row[19],
            n8n_version_max=row[20],
            supported_platforms=json.loads(row[21]),
            estimated_execution_time=row[22],
            resource_requirements=json.loads(row[23]),
            scalability_notes=row[24],
            author=row[25],
            version=row[26],
            created_at=datetime.fromisoformat(row[27]),
            updated_at=datetime.fromisoformat(row[28]),
            usage_count=row[29],
            rating=row[30],
            dependencies=json.loads(row[31]),
            related_templates=json.loads(row[32]),
            prerequisite_knowledge=json.loads(row[33])
        )

class TemplateGenerator:
    """模板生成器"""
    
    def __init__(self):
        self.logger = setup_logger("TemplateGenerator")
        
        # 基础节点模板
        self.node_templates = {
            "webhook": {
                "id": "webhook_{id}",
                "name": "Webhook",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 1,
                "position": [0, 0],
                "parameters": {
                    "httpMethod": "POST",
                    "path": "webhook",
                    "responseMode": "onReceived"
                }
            },
            "http_request": {
                "id": "http_{id}",
                "name": "HTTP Request",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.1,
                "position": [200, 0],
                "parameters": {
                    "method": "GET",
                    "url": "",
                    "options": {}
                }
            },
            "set": {
                "id": "set_{id}",
                "name": "Set",
                "type": "n8n-nodes-base.set",
                "typeVersion": 3,
                "position": [400, 0],
                "parameters": {
                    "values": {
                        "string": []
                    }
                }
            },
            "function": {
                "id": "function_{id}",
                "name": "Function",
                "type": "n8n-nodes-base.function",
                "typeVersion": 1,
                "position": [600, 0],
                "parameters": {
                    "functionCode": "// 在这里编写JavaScript代码\nreturn items;"
                }
            },
            "if": {
                "id": "if_{id}",
                "name": "IF",
                "type": "n8n-nodes-base.if",
                "typeVersion": 1,
                "position": [800, 0],
                "parameters": {
                    "conditions": {
                        "string": []
                    }
                }
            }
        }
        
        # 连接模板
        self.connection_templates = {
            "simple_chain": {
                "main": [
                    [{"node": "node2", "type": "main", "index": 0}]
                ]
            },
            "conditional": {
                "main": [
                    [{"node": "node_true", "type": "main", "index": 0}],
                    [{"node": "node_false", "type": "main", "index": 0}]
                ]
            }
        }
    
    async def generate_basic_template(self, 
                                    template_type: str,
                                    parameters: Dict[str, Any]) -> WorkflowTemplate:
        """生成基础模板"""
        try:
            template_id = self._generate_template_id(template_type, parameters)
            
            if template_type == "api_integration":
                return await self._generate_api_integration_template(template_id, parameters)
            elif template_type == "data_processing":
                return await self._generate_data_processing_template(template_id, parameters)
            elif template_type == "webhook_handler":
                return await self._generate_webhook_handler_template(template_id, parameters)
            elif template_type == "scheduled_task":
                return await self._generate_scheduled_task_template(template_id, parameters)
            else:
                raise ValueError(f"不支持的模板类型: {template_type}")
                
        except Exception as e:
            self.logger.error(f"生成模板失败: {str(e)}")
            raise
    
    async def _generate_api_integration_template(self, 
                                               template_id: str,
                                               parameters: Dict[str, Any]) -> WorkflowTemplate:
        """生成API集成模板"""
        # 创建节点
        nodes = []
        
        # Webhook触发器
        webhook_node = self.node_templates["webhook"].copy()
        webhook_node["id"] = "webhook_trigger"
        webhook_node["position"] = [0, 0]
        nodes.append(webhook_node)
        
        # HTTP请求节点
        http_node = self.node_templates["http_request"].copy()
        http_node["id"] = "api_request"
        http_node["position"] = [300, 0]
        http_node["parameters"]["url"] = parameters.get("api_url", "")
        http_node["parameters"]["method"] = parameters.get("method", "GET")
        nodes.append(http_node)
        
        # 数据处理节点
        set_node = self.node_templates["set"].copy()
        set_node["id"] = "process_data"
        set_node["position"] = [600, 0]
        nodes.append(set_node)
        
        # 创建连接
        connections = {
            "webhook_trigger": {
                "main": [
                    [{"node": "api_request", "type": "main", "index": 0}]
                ]
            },
            "api_request": {
                "main": [
                    [{"node": "process_data", "type": "main", "index": 0}]
                ]
            }
        }
        
        # 创建工作流JSON
        workflow_json = {
            "name": parameters.get("name", "API集成工作流"),
            "nodes": nodes,
            "connections": connections,
            "active": False,
            "settings": {},
            "staticData": {}
        }
        
        # 创建模板对象
        template = WorkflowTemplate(
            id=template_id,
            name=parameters.get("name", "API集成模板"),
            description="用于API集成的基础模板，支持Webhook触发和HTTP请求处理",
            category=TemplateCategory.API_INTEGRATION,
            complexity=TemplateComplexity.BASIC,
            usage_pattern=TemplateUsagePattern.TRIGGERED,
            workflow_json=workflow_json,
            nodes=nodes,
            connections=connections,
            required_credentials=[],
            required_nodes=["n8n-nodes-base.webhook", "n8n-nodes-base.httpRequest", "n8n-nodes-base.set"],
            configurable_parameters={
                "api_url": {"type": "string", "description": "API端点URL"},
                "method": {"type": "select", "options": ["GET", "POST", "PUT", "DELETE"]},
                "headers": {"type": "object", "description": "请求头"}
            },
            environment_variables=["API_KEY", "API_SECRET"],
            setup_instructions=[
                "1. 配置Webhook路径",
                "2. 设置API端点URL",
                "3. 配置认证信息",
                "4. 测试连接"
            ],
            usage_examples=[
                {
                    "title": "获取用户信息",
                    "description": "通过API获取用户详细信息",
                    "parameters": {
                        "api_url": "https://api.example.com/users/{id}",
                        "method": "GET"
                    }
                }
            ],
            troubleshooting_tips=[
                "检查API端点是否可访问",
                "验证认证信息是否正确",
                "确认请求格式符合API要求"
            ],
            tags=["API", "集成", "HTTP", "Webhook"],
            keywords=["api", "integration", "http", "webhook", "rest"],
            use_cases=["第三方API集成", "数据同步", "实时通知"],
            n8n_version_min="0.190.0",
            n8n_version_max=None,
            supported_platforms=["cloud", "self-hosted"],
            estimated_execution_time=5,
            resource_requirements={"memory": "128MB", "cpu": "0.1"},
            scalability_notes="支持高并发请求，建议配置适当的限流",
            author="AI智能体系统",
            version="1.0.0",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            usage_count=0,
            rating=0.0,
            dependencies=[],
            related_templates=["webhook_handler", "data_processing"],
            prerequisite_knowledge=["HTTP协议", "API基础", "JSON格式"]
        )
        
        return template
    
    async def _generate_data_processing_template(self, 
                                               template_id: str,
                                               parameters: Dict[str, Any]) -> WorkflowTemplate:
        """生成数据处理模板"""
        # 创建节点
        nodes = []
        
        # 手动触发器
        trigger_node = {
            "id": "manual_trigger",
            "name": "Manual Trigger",
            "type": "n8n-nodes-base.manualTrigger",
            "typeVersion": 1,
            "position": [0, 0],
            "parameters": {}
        }
        nodes.append(trigger_node)
        
        # 数据输入节点
        input_node = self.node_templates["set"].copy()
        input_node["id"] = "data_input"
        input_node["name"] = "Data Input"
        input_node["position"] = [300, 0]
        nodes.append(input_node)
        
        # 数据处理函数
        function_node = self.node_templates["function"].copy()
        function_node["id"] = "data_processor"
        function_node["name"] = "Data Processor"
        function_node["position"] = [600, 0]
        function_node["parameters"]["functionCode"] = """
// 数据处理逻辑
const processedItems = items.map(item => {
    // 在这里添加数据处理逻辑
    return {
        ...item.json,
        processed_at: new Date().toISOString(),
        status: 'processed'
    };
});

return processedItems.map(item => ({ json: item }));
"""
        nodes.append(function_node)
        
        # 数据输出节点
        output_node = self.node_templates["set"].copy()
        output_node["id"] = "data_output"
        output_node["name"] = "Data Output"
        output_node["position"] = [900, 0]
        nodes.append(output_node)
        
        # 创建连接
        connections = {
            "manual_trigger": {
                "main": [
                    [{"node": "data_input", "type": "main", "index": 0}]
                ]
            },
            "data_input": {
                "main": [
                    [{"node": "data_processor", "type": "main", "index": 0}]
                ]
            },
            "data_processor": {
                "main": [
                    [{"node": "data_output", "type": "main", "index": 0}]
                ]
            }
        }
        
        # 创建工作流JSON
        workflow_json = {
            "name": parameters.get("name", "数据处理工作流"),
            "nodes": nodes,
            "connections": connections,
            "active": False,
            "settings": {},
            "staticData": {}
        }
        
        # 创建模板对象
        template = WorkflowTemplate(
            id=template_id,
            name=parameters.get("name", "数据处理模板"),
            description="用于数据处理和转换的基础模板，支持自定义处理逻辑",
            category=TemplateCategory.DATA_PROCESSING,
            complexity=TemplateComplexity.INTERMEDIATE,
            usage_pattern=TemplateUsagePattern.ONE_TIME,
            workflow_json=workflow_json,
            nodes=nodes,
            connections=connections,
            required_credentials=[],
            required_nodes=["n8n-nodes-base.manualTrigger", "n8n-nodes-base.set", "n8n-nodes-base.function"],
            configurable_parameters={
                "processing_logic": {"type": "code", "description": "数据处理逻辑"},
                "input_format": {"type": "select", "options": ["JSON", "CSV", "XML"]},
                "output_format": {"type": "select", "options": ["JSON", "CSV", "XML"]}
            },
            environment_variables=[],
            setup_instructions=[
                "1. 配置输入数据格式",
                "2. 编写数据处理逻辑",
                "3. 设置输出格式",
                "4. 测试处理流程"
            ],
            usage_examples=[
                {
                    "title": "数据清洗",
                    "description": "清洗和标准化输入数据",
                    "parameters": {
                        "processing_logic": "数据去重、格式标准化、空值处理"
                    }
                }
            ],
            troubleshooting_tips=[
                "检查输入数据格式是否正确",
                "验证处理逻辑是否有语法错误",
                "确认输出格式符合要求"
            ],
            tags=["数据处理", "转换", "清洗", "ETL"],
            keywords=["data", "processing", "transformation", "etl", "cleaning"],
            use_cases=["数据清洗", "格式转换", "数据验证", "批量处理"],
            n8n_version_min="0.190.0",
            n8n_version_max=None,
            supported_platforms=["cloud", "self-hosted"],
            estimated_execution_time=10,
            resource_requirements={"memory": "256MB", "cpu": "0.2"},
            scalability_notes="适合中等规模数据处理，大数据量建议分批处理",
            author="AI智能体系统",
            version="1.0.0",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            usage_count=0,
            rating=0.0,
            dependencies=[],
            related_templates=["api_integration", "file_processing"],
            prerequisite_knowledge=["JavaScript基础", "数据处理概念", "JSON格式"]
        )
        
        return template
    
    async def _generate_webhook_handler_template(self, 
                                               template_id: str,
                                               parameters: Dict[str, Any]) -> WorkflowTemplate:
        """生成Webhook处理模板"""
        # 实现Webhook处理模板生成逻辑
        pass
    
    async def _generate_scheduled_task_template(self, 
                                              template_id: str,
                                              parameters: Dict[str, Any]) -> WorkflowTemplate:
        """生成定时任务模板"""
        # 实现定时任务模板生成逻辑
        pass
    
    def _generate_template_id(self, template_type: str, parameters: Dict[str, Any]) -> str:
        """生成模板ID"""
        # 基于类型和参数生成唯一ID
        content = f"{template_type}_{json.dumps(parameters, sort_keys=True)}"
        return hashlib.md5(content.encode()).hexdigest()[:16]

class TemplateMatcher:
    """模板匹配器"""
    
    def __init__(self, database: TemplateDatabase):
        self.database = database
        self.logger = setup_logger("TemplateMatcher")
    
    async def find_matching_templates(self, 
                                    intent_type: IntentType,
                                    complexity: ComplexityLevel,
                                    entities: Dict[str, Any],
                                    context: Dict[str, Any] = None) -> List[TemplateMatchResult]:
        """查找匹配的模板"""
        try:
            # 构建搜索条件
            criteria = await self._build_search_criteria(
                intent_type, complexity, entities, context
            )
            
            # 搜索模板
            templates = await self.database.search_templates(criteria)
            
            # 计算匹配度并排序
            match_results = []
            for template in templates:
                match_result = await self._calculate_match_score(
                    template, intent_type, complexity, entities, context
                )
                match_results.append(match_result)
            
            # 按相关性排序
            match_results.sort(key=lambda x: x.relevance_score, reverse=True)
            
            return match_results
            
        except Exception as e:
            self.logger.error(f"模板匹配失败: {str(e)}")
            return []
    
    async def _build_search_criteria(self, 
                                   intent_type: IntentType,
                                   complexity: ComplexityLevel,
                                   entities: Dict[str, Any],
                                   context: Dict[str, Any]) -> TemplateSearchCriteria:
        """构建搜索条件"""
        criteria = TemplateSearchCriteria()
        
        # 基于意图类型映射模板分类
        intent_to_category = {
            IntentType.CREATE_WORKFLOW: None,  # 不限制分类
            IntentType.EXECUTE_WORKFLOW: None,
            IntentType.MODIFY_WORKFLOW: None,
            IntentType.SEARCH_NODE: None,
            IntentType.TROUBLESHOOT: TemplateCategory.ERROR_HANDLING,
            IntentType.OPTIMIZE_PERFORMANCE: TemplateCategory.PERFORMANCE_MONITORING
        }
        
        criteria.category = intent_to_category.get(intent_type)
        
        # 基于复杂度映射模板复杂度
        complexity_mapping = {
            ComplexityLevel.SIMPLE: TemplateComplexity.BASIC,
            ComplexityLevel.MODERATE: TemplateComplexity.INTERMEDIATE,
            ComplexityLevel.COMPLEX: TemplateComplexity.ADVANCED,
            ComplexityLevel.ADVANCED: TemplateComplexity.EXPERT
        }
        
        criteria.max_complexity = complexity_mapping.get(complexity)
        
        # 从实体中提取搜索关键词
        if entities:
            keywords = []
            if "keywords" in entities:
                keywords.extend([kw["word"] for kw in entities["keywords"]])
            if "node_type" in entities:
                keywords.extend(entities["node_type"])
            
            criteria.query = " ".join(keywords[:5])  # 限制关键词数量
        
        # 从上下文中提取约束
        if context:
            domain_context = context.get("domain_context", {})
            if domain_context.get("primary_domain"):
                # 基于领域设置分类偏好
                pass
        
        return criteria
    
    async def _calculate_match_score(self, 
                                   template: WorkflowTemplate,
                                   intent_type: IntentType,
                                   complexity: ComplexityLevel,
                                   entities: Dict[str, Any],
                                   context: Dict[str, Any]) -> TemplateMatchResult:
        """计算匹配分数"""
        score = 0.0
        match_reasons = []
        customization_suggestions = []
        
        # 1. 复杂度匹配 (权重: 0.3)
        complexity_score = await self._calculate_complexity_match(template.complexity, complexity)
        score += complexity_score * 0.3
        if complexity_score > 0.7:
            match_reasons.append(f"复杂度匹配 ({template.complexity.value})")
        
        # 2. 功能匹配 (权重: 0.4)
        function_score = await self._calculate_function_match(template, entities)
        score += function_score * 0.4
        if function_score > 0.6:
            match_reasons.append("功能需求匹配")
        
        # 3. 使用模式匹配 (权重: 0.2)
        pattern_score = await self._calculate_pattern_match(template, intent_type, context)
        score += pattern_score * 0.2
        if pattern_score > 0.5:
            match_reasons.append(f"使用模式匹配 ({template.usage_pattern.value})")
        
        # 4. 流行度和评分 (权重: 0.1)
        popularity_score = min(template.rating / 5.0, 1.0)
        score += popularity_score * 0.1
        
        # 生成定制化建议
        if entities.get("api_endpoint"):
            customization_suggestions.append("配置API端点URL")
        if entities.get("data_format"):
            customization_suggestions.append("调整数据格式设置")
        
        # 估算设置复杂度
        setup_complexity = "简单"
        if len(template.required_credentials) > 2:
            setup_complexity = "中等"
        if len(template.setup_instructions) > 5:
            setup_complexity = "复杂"
        
        # 估算设置时间
        estimated_setup_time = len(template.setup_instructions) * 2  # 每步2分钟
        
        return TemplateMatchResult(
            template=template,
            relevance_score=score,
            match_reasons=match_reasons,
            customization_suggestions=customization_suggestions,
            setup_complexity=setup_complexity,
            estimated_setup_time=estimated_setup_time
        )
    
    async def _calculate_complexity_match(self, 
                                        template_complexity: TemplateComplexity,
                                        user_complexity: ComplexityLevel) -> float:
        """计算复杂度匹配分数"""
        complexity_map = {
            TemplateComplexity.BASIC: 1,
            TemplateComplexity.INTERMEDIATE: 2,
            TemplateComplexity.ADVANCED: 3,
            TemplateComplexity.EXPERT: 4
        }
        
        user_complexity_map = {
            ComplexityLevel.SIMPLE: 1,
            ComplexityLevel.MODERATE: 2,
            ComplexityLevel.COMPLEX: 3,
            ComplexityLevel.ADVANCED: 4
        }
        
        template_level = complexity_map.get(template_complexity, 2)
        user_level = user_complexity_map.get(user_complexity, 2)
        
        # 完全匹配得满分，相差1级得0.7分，相差2级得0.4分，相差3级得0.1分
        diff = abs(template_level - user_level)
        if diff == 0:
            return 1.0
        elif diff == 1:
            return 0.7
        elif diff == 2:
            return 0.4
        else:
            return 0.1
    
    async def _calculate_function_match(self, 
                                      template: WorkflowTemplate,
                                      entities: Dict[str, Any]) -> float:
        """计算功能匹配分数"""
        score = 0.0
        
        # 检查节点类型匹配
        if entities.get("node_type"):
            required_nodes = set(entities["node_type"])
            template_nodes = set(template.required_nodes)
            
            if required_nodes.intersection(template_nodes):
                score += 0.5
        
        # 检查关键词匹配
        if entities.get("keywords"):
            entity_keywords = set(kw["word"].lower() for kw in entities["keywords"])
            template_keywords = set(kw.lower() for kw in template.keywords)
            
            overlap = len(entity_keywords.intersection(template_keywords))
            if overlap > 0:
                score += min(overlap / len(entity_keywords), 0.5)
        
        return min(score, 1.0)
    
    async def _calculate_pattern_match(self, 
                                     template: WorkflowTemplate,
                                     intent_type: IntentType,
                                     context: Dict[str, Any]) -> float:
        """计算使用模式匹配分数"""
        # 基于意图类型推断使用模式偏好
        intent_to_pattern = {
            IntentType.CREATE_WORKFLOW: [TemplateUsagePattern.ONE_TIME, TemplateUsagePattern.INTERACTIVE],
            IntentType.EXECUTE_WORKFLOW: [TemplateUsagePattern.TRIGGERED, TemplateUsagePattern.SCHEDULED],
            IntentType.TROUBLESHOOT: [TemplateUsagePattern.INTERACTIVE, TemplateUsagePattern.ONE_TIME]
        }
        
        preferred_patterns = intent_to_pattern.get(intent_type, [])
        
        if template.usage_pattern in preferred_patterns:
            return 1.0
        else:
            return 0.3

class WorkflowTemplateManager:
    """工作流模板管理器主类"""
    
    def __init__(self, config_path: str = None):
        # 加载配置
        self.config = load_config(config_path or "config/template_manager_config.yaml")
        
        # 初始化日志
        self.logger = setup_logger("WorkflowTemplateManager")
        
        # 初始化数据库
        db_path = self.config.get("database", {}).get("path", "data/templates.db")
        self.database = TemplateDatabase(db_path)
        
        # 初始化组件
        self.generator = TemplateGenerator()
        self.matcher = TemplateMatcher(self.database)
        
        # 模板缓存
        self.template_cache = {}
        
        # 统计信息
        self.usage_stats = {
            "total_searches": 0,
            "total_generations": 0,
            "popular_categories": defaultdict(int),
            "average_match_score": 0.0
        }
    
    async def initialize(self):
        """初始化模板管理器"""
        try:
            self.logger.info("初始化工作流模板管理器...")
            
            # 加载预置模板
            await self._load_builtin_templates()
            
            # 初始化索引
            await self._build_search_index()
            
            self.logger.info("工作流模板管理器初始化完成")
            
        except Exception as e:
            self.logger.error(f"模板管理器初始化失败: {str(e)}")
            raise
    
    async def find_templates(self, 
                           intent_type: IntentType,
                           complexity: ComplexityLevel,
                           entities: Dict[str, Any],
                           context: Dict[str, Any] = None,
                           limit: int = 5) -> List[TemplateMatchResult]:
        """查找匹配的模板"""
        try:
            self.logger.info(f"查找模板: 意图={intent_type.value}, 复杂度={complexity.value}")
            
            # 使用匹配器查找模板
            match_results = await self.matcher.find_matching_templates(
                intent_type, complexity, entities, context
            )
            
            # 限制返回数量
            match_results = match_results[:limit]
            
            # 更新统计信息
            self.usage_stats["total_searches"] += 1
            if match_results:
                avg_score = sum(r.relevance_score for r in match_results) / len(match_results)
                self.usage_stats["average_match_score"] = (
                    self.usage_stats["average_match_score"] * (self.usage_stats["total_searches"] - 1) + avg_score
                ) / self.usage_stats["total_searches"]
            
            self.logger.info(f"找到 {len(match_results)} 个匹配模板")
            return match_results
            
        except Exception as e:
            self.logger.error(f"查找模板失败: {str(e)}")
            return []
    
    async def generate_custom_template(self, 
                                     template_type: str,
                                     parameters: Dict[str, Any]) -> WorkflowTemplate:
        """生成自定义模板"""
        try:
            self.logger.info(f"生成自定义模板: {template_type}")
            
            # 使用生成器创建模板
            template = await self.generator.generate_basic_template(template_type, parameters)
            
            # 保存到数据库
            await self.database.save_template(template)
            
            # 更新统计信息
            self.usage_stats["total_generations"] += 1
            self.usage_stats["popular_categories"][template.category.value] += 1
            
            self.logger.info(f"自定义模板生成完成: {template.id}")
            return template
            
        except Exception as e:
            self.logger.error(f"生成自定义模板失败: {str(e)}")
            raise
    
    async def get_template_by_id(self, template_id: str) -> Optional[WorkflowTemplate]:
        """根据ID获取模板"""
        try:
            # 先检查缓存
            if template_id in self.template_cache:
                return self.template_cache[template_id]
            
            # 从数据库获取
            template = await self.database.get_template(template_id)
            
            # 缓存结果
            if template:
                self.template_cache[template_id] = template
            
            return template
            
        except Exception as e:
            self.logger.error(f"获取模板失败: {str(e)}")
            return None
    
    async def customize_template(self, 
                               template_id: str,
                               customizations: Dict[str, Any]) -> WorkflowTemplate:
        """定制化模板"""
        try:
            # 获取原始模板
            original_template = await self.get_template_by_id(template_id)
            if not original_template:
                raise ValueError(f"模板不存在: {template_id}")
            
            # 创建定制化副本
            customized_template = await self._apply_customizations(
                original_template, customizations
            )
            
            # 生成新的ID
            customized_template.id = self._generate_customized_id(template_id, customizations)
            customized_template.name = f"{original_template.name} (定制版)"
            customized_template.created_at = datetime.now()
            customized_template.updated_at = datetime.now()
            
            # 保存定制化模板
            await self.database.save_template(customized_template)
            
            return customized_template
            
        except Exception as e:
            self.logger.error(f"定制化模板失败: {str(e)}")
            raise
    
    async def _load_builtin_templates(self):
        """加载内置模板"""
        try:
            # 生成基础API集成模板
            api_template = await self.generator.generate_basic_template(
                "api_integration",
                {
                    "name": "基础API集成模板",
                    "api_url": "https://api.example.com/data",
                    "method": "GET"
                }
            )
            await self.database.save_template(api_template)
            
            # 生成数据处理模板
            data_template = await self.generator.generate_basic_template(
                "data_processing",
                {
                    "name": "基础数据处理模板"
                }
            )
            await self.database.save_template(data_template)
            
            self.logger.info("内置模板加载完成")
            
        except Exception as e:
            self.logger.warning(f"加载内置模板失败: {str(e)}")
    
    async def _build_search_index(self):
        """构建搜索索引"""
        # 这里可以实现更复杂的搜索索引逻辑
        pass
    
    async def _apply_customizations(self, 
                                  template: WorkflowTemplate,
                                  customizations: Dict[str, Any]) -> WorkflowTemplate:
        """应用定制化设置"""
        # 深拷贝模板
        import copy
        customized = copy.deepcopy(template)
        
        # 应用参数定制
        if "parameters" in customizations:
            for node in customized.nodes:
                if node["id"] in customizations["parameters"]:
                    node["parameters"].update(customizations["parameters"][node["id"]])
        
        # 应用节点定制
        if "nodes" in customizations:
            # 添加新节点
            for new_node in customizations["nodes"].get("add", []):
                customized.nodes.append(new_node)
            
            # 移除节点
            for remove_id in customizations["nodes"].get("remove", []):
                customized.nodes = [n for n in customized.nodes if n["id"] != remove_id]
        
        # 应用连接定制
        if "connections" in customizations:
            customized.connections.update(customizations["connections"])
        
        return customized
    
    def _generate_customized_id(self, original_id: str, customizations: Dict[str, Any]) -> str:
        """生成定制化模板ID"""
        content = f"{original_id}_{json.dumps(customizations, sort_keys=True)}"
        return hashlib.md5(content.encode()).hexdigest()[:16]
    
    async def get_template_statistics(self) -> Dict[str, Any]:
        """获取模板统计信息"""
        return {
            "usage_stats": dict(self.usage_stats),
            "cache_size": len(self.template_cache),
            "popular_categories": dict(self.usage_stats["popular_categories"])
        }

# 使用示例
async def main():
    """主函数示例"""
    # 创建模板管理器实例
    manager = WorkflowTemplateManager()
    
    # 初始化
    await manager.initialize()
    
    # 查找模板
    from core.intent_analyzer import IntentType, ComplexityLevel
    
    match_results = await manager.find_templates(
        intent_type=IntentType.CREATE_WORKFLOW,
        complexity=ComplexityLevel.SIMPLE,
        entities={"keywords": [{"word": "API", "weight": 0.8}]},
        limit=3
    )
    
    print(f"找到 {len(match_results)} 个匹配模板:")
    for result in match_results:
        print(f"- {result.template.name} (相关性: {result.relevance_score:.2f})")
        print(f"  匹配原因: {', '.join(result.match_reasons)}")
        print(f"  设置复杂度: {result.setup_complexity}")
        print()
    
    # 生成自定义模板
    custom_template = await manager.generate_custom_template(
        "api_integration",
        {
            "name": "用户管理API集成",
            "api_url": "https://api.myapp.com/users",
            "method": "POST"
        }
    )
    
    print(f"生成自定义模板: {custom_template.name}")
    
    # 获取统计信息
    stats = await manager.get_template_statistics()
    print(f"模板统计: {stats}")

if __name__ == "__main__":
    asyncio.run(main())