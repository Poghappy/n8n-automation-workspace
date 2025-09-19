#!/usr/bin/env python3
"""
N8N智能教学老师 - 自适应教学和专业领域切换系统
版本: 1.0.0
作者: AI智能体系统
"""

import asyncio
import json
import logging
import time
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import yaml
import re
from datetime import datetime, timedelta

# MCP工具导入
from mcp import Client as MCPClient
from src.utils.logger import setup_logger
from src.utils.config import load_config
from src.utils.nlp import NLPProcessor
from src.utils.knowledge_base import KnowledgeBase

class TeachingMode(Enum):
    """教学模式枚举"""
    STEP_BY_STEP = "step_by_step"
    HANDS_ON = "hands_on"
    PROBLEM_SOLVING = "problem_solving"
    INTERACTIVE_DEMO = "interactive_demo"
    CONCEPT_EXPLANATION = "concept_explanation"
    BEST_PRACTICES = "best_practices"

class SkillLevel(Enum):
    """技能水平枚举"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class ExpertiseDomain(Enum):
    """专业领域枚举"""
    API_INTEGRATION = "api_integration"
    DATA_PROCESSING = "data_processing"
    AUTOMATION = "automation"
    MONITORING = "monitoring"
    SECURITY = "security"
    PERFORMANCE = "performance"
    GENERAL = "general"

@dataclass
class LearningRequest:
    """学习请求数据结构"""
    raw_input: str
    learning_intent: str
    skill_level: SkillLevel
    domain: ExpertiseDomain
    teaching_mode: TeachingMode
    specific_topic: str
    context: Dict
    urgency: str
    preferred_style: str
    learning_goals: List[str]

@dataclass
class TeachingResponse:
    """教学响应数据结构"""
    content: str
    teaching_mode: TeachingMode
    domain: ExpertiseDomain
    examples: List[Dict]
    exercises: List[Dict]
    resources: List[Dict]
    next_steps: List[str]
    difficulty_level: int
    estimated_time: int
    interactive_elements: List[Dict]

@dataclass
class LearningProgress:
    """学习进度数据结构"""
    user_id: str
    domain: ExpertiseDomain
    skill_level: SkillLevel
    completed_topics: List[str]
    current_topic: str
    progress_percentage: float
    strengths: List[str]
    areas_for_improvement: List[str]
    learning_preferences: Dict
    last_updated: datetime

class DomainExpert:
    """领域专家基类"""
    
    def __init__(self, domain: ExpertiseDomain, config: Dict):
        self.domain = domain
        self.config = config
        self.logger = setup_logger(f"DomainExpert_{domain.value}")
        self.knowledge_base = KnowledgeBase(domain.value)
        
    async def teach(self, request: LearningRequest) -> TeachingResponse:
        """教学方法 - 子类需要实现"""
        raise NotImplementedError
    
    async def assess_skill_level(self, user_input: str, context: Dict) -> SkillLevel:
        """评估技能水平"""
        # 基础实现，子类可以重写
        beginner_indicators = ["新手", "初学", "不会", "学习", "基础"]
        advanced_indicators = ["高级", "专业", "优化", "架构", "深入"]
        
        if any(indicator in user_input for indicator in beginner_indicators):
            return SkillLevel.BEGINNER
        elif any(indicator in user_input for indicator in advanced_indicators):
            return SkillLevel.ADVANCED
        else:
            return SkillLevel.INTERMEDIATE
    
    async def recommend_teaching_mode(self, request: LearningRequest) -> TeachingMode:
        """推荐教学模式"""
        if request.skill_level == SkillLevel.BEGINNER:
            return TeachingMode.STEP_BY_STEP
        elif "实践" in request.raw_input or "操作" in request.raw_input:
            return TeachingMode.HANDS_ON
        elif "问题" in request.raw_input or "解决" in request.raw_input:
            return TeachingMode.PROBLEM_SOLVING
        elif "演示" in request.raw_input or "展示" in request.raw_input:
            return TeachingMode.INTERACTIVE_DEMO
        else:
            return TeachingMode.CONCEPT_EXPLANATION

class APIIntegrationExpert(DomainExpert):
    """API集成专家"""
    
    def __init__(self, config: Dict):
        super().__init__(ExpertiseDomain.API_INTEGRATION, config)
        self.api_knowledge = {
            "rest_api": {
                "concepts": ["HTTP方法", "状态码", "请求头", "响应格式"],
                "examples": ["GET请求", "POST请求", "认证", "错误处理"],
                "best_practices": ["API版本控制", "限流", "缓存", "安全"]
            },
            "graphql": {
                "concepts": ["查询", "变更", "订阅", "模式"],
                "examples": ["基础查询", "嵌套查询", "变量使用", "片段"],
                "best_practices": ["查询优化", "错误处理", "缓存策略"]
            },
            "webhook": {
                "concepts": ["事件驱动", "回调", "签名验证", "重试机制"],
                "examples": ["接收webhook", "验证签名", "处理失败"],
                "best_practices": ["幂等性", "安全验证", "监控"]
            }
        }
    
    async def teach(self, request: LearningRequest) -> TeachingResponse:
        """API集成教学"""
        try:
            self.logger.info(f"开始API集成教学: {request.specific_topic}")
            
            # 确定具体的API类型
            api_type = await self._identify_api_type(request.raw_input)
            
            # 生成教学内容
            content = await self._generate_api_content(api_type, request)
            
            # 生成示例
            examples = await self._generate_api_examples(api_type, request.skill_level)
            
            # 生成练习
            exercises = await self._generate_api_exercises(api_type, request.skill_level)
            
            # 生成资源链接
            resources = await self._generate_api_resources(api_type)
            
            # 生成下一步建议
            next_steps = await self._generate_next_steps(api_type, request.skill_level)
            
            response = TeachingResponse(
                content=content,
                teaching_mode=request.teaching_mode,
                domain=self.domain,
                examples=examples,
                exercises=exercises,
                resources=resources,
                next_steps=next_steps,
                difficulty_level=self._get_difficulty_level(request.skill_level),
                estimated_time=self._estimate_learning_time(api_type, request.skill_level),
                interactive_elements=await self._generate_interactive_elements(api_type)
            )
            
            self.logger.info(f"API集成教学完成: {api_type}")
            return response
            
        except Exception as e:
            self.logger.error(f"API集成教学失败: {str(e)}")
            raise
    
    async def _identify_api_type(self, user_input: str) -> str:
        """识别API类型"""
        if any(keyword in user_input.lower() for keyword in ["rest", "restful", "http"]):
            return "rest_api"
        elif any(keyword in user_input.lower() for keyword in ["graphql", "graph"]):
            return "graphql"
        elif any(keyword in user_input.lower() for keyword in ["webhook", "回调", "事件"]):
            return "webhook"
        else:
            return "rest_api"  # 默认
    
    async def _generate_api_content(self, api_type: str, request: LearningRequest) -> str:
        """生成API教学内容"""
        knowledge = self.api_knowledge.get(api_type, {})
        
        if request.teaching_mode == TeachingMode.STEP_BY_STEP:
            return await self._generate_step_by_step_content(api_type, knowledge, request.skill_level)
        elif request.teaching_mode == TeachingMode.CONCEPT_EXPLANATION:
            return await self._generate_concept_content(api_type, knowledge)
        elif request.teaching_mode == TeachingMode.BEST_PRACTICES:
            return await self._generate_best_practices_content(api_type, knowledge)
        else:
            return await self._generate_general_content(api_type, knowledge)
    
    async def _generate_step_by_step_content(self, api_type: str, knowledge: Dict, skill_level: SkillLevel) -> str:
        """生成循序渐进的教学内容"""
        if api_type == "rest_api":
            if skill_level == SkillLevel.BEGINNER:
                return """
# REST API 基础教学

## 第一步：理解REST API
REST API是一种网络应用程序的设计风格，它使用HTTP协议进行通信。

### 核心概念：
1. **资源（Resource）**: API操作的对象，如用户、订单等
2. **HTTP方法**: GET（获取）、POST（创建）、PUT（更新）、DELETE（删除）
3. **URL路径**: 标识资源的地址
4. **状态码**: 表示请求结果的数字代码

## 第二步：HTTP方法详解
- **GET**: 获取数据，不会修改服务器状态
- **POST**: 创建新资源
- **PUT**: 更新整个资源
- **PATCH**: 部分更新资源
- **DELETE**: 删除资源

## 第三步：常见状态码
- **200**: 成功
- **201**: 创建成功
- **400**: 请求错误
- **401**: 未授权
- **404**: 资源不存在
- **500**: 服务器错误

## 第四步：在N8N中使用REST API
1. 添加HTTP Request节点
2. 设置请求方法和URL
3. 配置请求头和参数
4. 处理响应数据
"""
            else:
                return """
# REST API 进阶教学

## 高级特性
1. **认证机制**: Bearer Token, API Key, OAuth
2. **请求头优化**: Content-Type, Accept, User-Agent
3. **错误处理**: 重试机制, 超时设置
4. **性能优化**: 缓存, 分页, 压缩

## 最佳实践
1. 使用适当的HTTP方法
2. 设计清晰的URL结构
3. 实现幂等性
4. 添加适当的错误处理
"""
        
        return f"正在为{api_type}生成教学内容..."
    
    async def _generate_api_examples(self, api_type: str, skill_level: SkillLevel) -> List[Dict]:
        """生成API示例"""
        examples = []
        
        if api_type == "rest_api":
            if skill_level == SkillLevel.BEGINNER:
                examples.append({
                    "title": "简单GET请求",
                    "description": "获取用户信息",
                    "n8n_config": {
                        "method": "GET",
                        "url": "https://jsonplaceholder.typicode.com/users/1",
                        "headers": {
                            "Content-Type": "application/json"
                        }
                    },
                    "expected_response": {
                        "id": 1,
                        "name": "Leanne Graham",
                        "email": "Sincere@april.biz"
                    }
                })
                
                examples.append({
                    "title": "POST请求创建数据",
                    "description": "创建新用户",
                    "n8n_config": {
                        "method": "POST",
                        "url": "https://jsonplaceholder.typicode.com/users",
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "body": {
                            "name": "新用户",
                            "email": "newuser@example.com"
                        }
                    }
                })
            else:
                examples.append({
                    "title": "带认证的API请求",
                    "description": "使用Bearer Token认证",
                    "n8n_config": {
                        "method": "GET",
                        "url": "https://api.github.com/user",
                        "headers": {
                            "Authorization": "Bearer YOUR_TOKEN",
                            "Accept": "application/vnd.github.v3+json"
                        }
                    }
                })
        
        return examples
    
    async def _generate_api_exercises(self, api_type: str, skill_level: SkillLevel) -> List[Dict]:
        """生成API练习"""
        exercises = []
        
        if skill_level == SkillLevel.BEGINNER:
            exercises.append({
                "title": "练习1：获取天气信息",
                "description": "使用天气API获取指定城市的天气信息",
                "task": "配置HTTP Request节点调用天气API",
                "hints": ["使用GET方法", "添加城市参数", "处理JSON响应"],
                "solution_template": {
                    "method": "GET",
                    "url": "https://api.openweathermap.org/data/2.5/weather",
                    "parameters": {
                        "q": "Beijing",
                        "appid": "YOUR_API_KEY"
                    }
                }
            })
        
        return exercises
    
    async def _generate_api_resources(self, api_type: str) -> List[Dict]:
        """生成API学习资源"""
        resources = [
            {
                "title": "N8N HTTP Request节点文档",
                "url": "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/",
                "type": "documentation"
            },
            {
                "title": "REST API设计指南",
                "url": "https://restfulapi.net/",
                "type": "guide"
            },
            {
                "title": "HTTP状态码参考",
                "url": "https://httpstatuses.com/",
                "type": "reference"
            }
        ]
        
        if api_type == "graphql":
            resources.append({
                "title": "GraphQL学习指南",
                "url": "https://graphql.org/learn/",
                "type": "tutorial"
            })
        
        return resources
    
    async def _generate_next_steps(self, api_type: str, skill_level: SkillLevel) -> List[str]:
        """生成下一步学习建议"""
        if skill_level == SkillLevel.BEGINNER:
            return [
                "练习基本的GET和POST请求",
                "学习如何处理API响应数据",
                "了解常见的HTTP状态码",
                "尝试使用不同的API服务"
            ]
        else:
            return [
                "学习API认证机制",
                "实现错误处理和重试逻辑",
                "优化API调用性能",
                "设计API集成的最佳实践"
            ]
    
    def _get_difficulty_level(self, skill_level: SkillLevel) -> int:
        """获取难度级别"""
        mapping = {
            SkillLevel.BEGINNER: 1,
            SkillLevel.INTERMEDIATE: 3,
            SkillLevel.ADVANCED: 5,
            SkillLevel.EXPERT: 7
        }
        return mapping.get(skill_level, 3)
    
    def _estimate_learning_time(self, api_type: str, skill_level: SkillLevel) -> int:
        """估算学习时间（分钟）"""
        base_time = {
            "rest_api": 30,
            "graphql": 45,
            "webhook": 25
        }
        
        multiplier = {
            SkillLevel.BEGINNER: 2.0,
            SkillLevel.INTERMEDIATE: 1.5,
            SkillLevel.ADVANCED: 1.0,
            SkillLevel.EXPERT: 0.8
        }
        
        return int(base_time.get(api_type, 30) * multiplier.get(skill_level, 1.5))
    
    async def _generate_interactive_elements(self, api_type: str) -> List[Dict]:
        """生成交互元素"""
        return [
            {
                "type": "code_editor",
                "title": "API配置编辑器",
                "description": "在这里配置你的API请求"
            },
            {
                "type": "response_viewer",
                "title": "响应查看器",
                "description": "查看API响应结果"
            },
            {
                "type": "quiz",
                "title": "知识检测",
                "questions": [
                    {
                        "question": "GET请求通常用于什么操作？",
                        "options": ["创建数据", "获取数据", "删除数据", "更新数据"],
                        "correct": 1
                    }
                ]
            }
        ]

class DataProcessingExpert(DomainExpert):
    """数据处理专家"""
    
    def __init__(self, config: Dict):
        super().__init__(ExpertiseDomain.DATA_PROCESSING, config)
        self.data_knowledge = {
            "etl": {
                "concepts": ["提取", "转换", "加载", "数据管道"],
                "tools": ["Set节点", "Function节点", "Code节点", "Split In Batches"],
                "patterns": ["批处理", "流处理", "增量处理", "错误处理"]
            },
            "transformation": {
                "concepts": ["数据映射", "格式转换", "数据清洗", "验证"],
                "techniques": ["字段映射", "类型转换", "过滤", "聚合"],
                "best_practices": ["数据质量", "性能优化", "错误处理"]
            }
        }
    
    async def teach(self, request: LearningRequest) -> TeachingResponse:
        """数据处理教学"""
        try:
            self.logger.info(f"开始数据处理教学: {request.specific_topic}")
            
            # 识别数据处理类型
            processing_type = await self._identify_processing_type(request.raw_input)
            
            # 生成教学内容
            content = await self._generate_data_content(processing_type, request)
            
            # 生成示例
            examples = await self._generate_data_examples(processing_type, request.skill_level)
            
            response = TeachingResponse(
                content=content,
                teaching_mode=request.teaching_mode,
                domain=self.domain,
                examples=examples,
                exercises=await self._generate_data_exercises(processing_type),
                resources=await self._generate_data_resources(),
                next_steps=await self._generate_data_next_steps(processing_type),
                difficulty_level=self._get_difficulty_level(request.skill_level),
                estimated_time=self._estimate_learning_time(processing_type, request.skill_level),
                interactive_elements=await self._generate_data_interactive_elements()
            )
            
            return response
            
        except Exception as e:
            self.logger.error(f"数据处理教学失败: {str(e)}")
            raise
    
    async def _identify_processing_type(self, user_input: str) -> str:
        """识别数据处理类型"""
        if any(keyword in user_input.lower() for keyword in ["etl", "提取", "转换", "加载"]):
            return "etl"
        elif any(keyword in user_input.lower() for keyword in ["清洗", "清理", "去重"]):
            return "cleaning"
        elif any(keyword in user_input.lower() for keyword in ["转换", "格式", "映射"]):
            return "transformation"
        elif any(keyword in user_input.lower() for keyword in ["聚合", "统计", "分析"]):
            return "aggregation"
        else:
            return "general"
    
    async def _generate_data_content(self, processing_type: str, request: LearningRequest) -> str:
        """生成数据处理教学内容"""
        if processing_type == "etl":
            return """
# ETL数据处理教学

## ETL概念
ETL代表Extract（提取）、Transform（转换）、Load（加载），是数据处理的核心流程。

### 在N8N中实现ETL：

#### 1. Extract（提取）
- 使用HTTP Request节点从API获取数据
- 使用Database节点从数据库读取数据
- 使用File节点读取文件数据

#### 2. Transform（转换）
- 使用Set节点进行字段映射
- 使用Function节点进行复杂转换
- 使用Code节点编写自定义逻辑

#### 3. Load（加载）
- 使用Database节点写入数据库
- 使用HTTP Request节点发送到API
- 使用File节点保存到文件

## 最佳实践
1. 分批处理大量数据
2. 添加错误处理机制
3. 记录处理日志
4. 实现数据验证
"""
        
        return f"正在为{processing_type}生成教学内容..."
    
    async def _generate_data_examples(self, processing_type: str, skill_level: SkillLevel) -> List[Dict]:
        """生成数据处理示例"""
        examples = []
        
        if processing_type == "etl":
            examples.append({
                "title": "简单ETL流程",
                "description": "从API获取数据，转换格式，保存到数据库",
                "workflow_structure": {
                    "nodes": [
                        {"type": "HTTP Request", "purpose": "获取原始数据"},
                        {"type": "Set", "purpose": "字段映射和转换"},
                        {"type": "Postgres", "purpose": "保存到数据库"}
                    ]
                },
                "transformation_logic": {
                    "input": {"user_name": "John", "user_email": "john@example.com"},
                    "output": {"name": "John", "email": "john@example.com", "created_at": "2024-01-01"}
                }
            })
        
        return examples
    
    async def _generate_data_exercises(self, processing_type: str) -> List[Dict]:
        """生成数据处理练习"""
        return [
            {
                "title": "数据清洗练习",
                "description": "清洗包含重复和无效数据的用户列表",
                "task": "去除重复用户，验证邮箱格式，标准化姓名格式",
                "sample_data": [
                    {"name": "john doe", "email": "john@example.com"},
                    {"name": "JANE SMITH", "email": "invalid-email"},
                    {"name": "john doe", "email": "john@example.com"}
                ]
            }
        ]
    
    async def _generate_data_resources(self) -> List[Dict]:
        """生成数据处理资源"""
        return [
            {
                "title": "N8N数据处理节点文档",
                "url": "https://docs.n8n.io/integrations/builtin/core-nodes/",
                "type": "documentation"
            },
            {
                "title": "数据处理最佳实践",
                "url": "https://docs.n8n.io/data/",
                "type": "guide"
            }
        ]
    
    async def _generate_data_next_steps(self, processing_type: str) -> List[str]:
        """生成数据处理下一步建议"""
        return [
            "学习更多数据转换技巧",
            "实践复杂的数据清洗场景",
            "了解数据验证方法",
            "优化数据处理性能"
        ]
    
    async def _generate_data_interactive_elements(self) -> List[Dict]:
        """生成数据处理交互元素"""
        return [
            {
                "type": "data_preview",
                "title": "数据预览器",
                "description": "查看转换前后的数据"
            },
            {
                "type": "transformation_builder",
                "title": "转换规则构建器",
                "description": "可视化构建数据转换规则"
            }
        ]

class TeachingAgentCore:
    """教学Agent核心类"""
    
    def __init__(self, config_path: str = None):
        # 加载配置
        self.config = load_config(config_path or "config/teaching_agent_config.yaml")
        
        # 初始化日志
        self.logger = setup_logger("TeachingAgentCore")
        
        # 初始化MCP客户端
        self.mcp_client = MCPClient(self.config.get("mcp_config", {}))
        
        # 初始化NLP处理器
        self.nlp_processor = NLPProcessor()
        
        # 初始化领域专家
        self.domain_experts = {
            ExpertiseDomain.API_INTEGRATION: APIIntegrationExpert(self.config),
            ExpertiseDomain.DATA_PROCESSING: DataProcessingExpert(self.config),
            # 可以添加更多领域专家
        }
        
        # 学习进度跟踪
        self.learning_progress: Dict[str, LearningProgress] = {}
        
        # 教学历史
        self.teaching_history: List[Dict] = []
    
    async def initialize(self):
        """初始化教学Agent"""
        try:
            self.logger.info("初始化N8N智能教学老师...")
            
            # 初始化MCP客户端
            await self.mcp_client.initialize()
            
            # 初始化NLP处理器
            await self.nlp_processor.initialize()
            
            # 加载知识库
            await self._load_knowledge_base()
            
            self.logger.info("N8N智能教学老师初始化完成")
            
        except Exception as e:
            self.logger.error(f"初始化失败: {str(e)}")
            raise
    
    async def process_learning_request(self, user_input: str, context: Dict = None) -> TeachingResponse:
        """处理学习请求"""
        try:
            self.logger.info(f"处理学习请求: {user_input[:100]}...")
            
            # 1. 分析学习请求
            learning_request = await self._analyze_learning_request(user_input, context)
            
            # 2. 选择合适的领域专家
            expert = await self._select_domain_expert(learning_request)
            
            # 3. 生成教学响应
            teaching_response = await expert.teach(learning_request)
            
            # 4. 个性化调整
            personalized_response = await self._personalize_response(
                teaching_response, learning_request, context
            )
            
            # 5. 更新学习进度
            await self._update_learning_progress(learning_request, personalized_response, context)
            
            # 6. 记录教学历史
            await self._record_teaching_history(learning_request, personalized_response)
            
            self.logger.info(f"学习请求处理完成: {learning_request.domain.value}")
            return personalized_response
            
        except Exception as e:
            self.logger.error(f"学习请求处理失败: {str(e)}")
            raise
    
    async def _analyze_learning_request(self, user_input: str, context: Dict = None) -> LearningRequest:
        """分析学习请求"""
        try:
            # 识别学习意图
            learning_intent = await self._identify_learning_intent(user_input)
            
            # 评估技能水平
            skill_level = await self._assess_skill_level(user_input, context)
            
            # 识别专业领域
            domain = await self._identify_domain(user_input)
            
            # 推荐教学模式
            teaching_mode = await self._recommend_teaching_mode(user_input, skill_level)
            
            # 提取具体主题
            specific_topic = await self._extract_specific_topic(user_input)
            
            # 评估紧急程度
            urgency = await self._assess_urgency(user_input)
            
            # 识别偏好风格
            preferred_style = await self._identify_preferred_style(user_input, context)
            
            # 提取学习目标
            learning_goals = await self._extract_learning_goals(user_input)
            
            return LearningRequest(
                raw_input=user_input,
                learning_intent=learning_intent,
                skill_level=skill_level,
                domain=domain,
                teaching_mode=teaching_mode,
                specific_topic=specific_topic,
                context=context or {},
                urgency=urgency,
                preferred_style=preferred_style,
                learning_goals=learning_goals
            )
            
        except Exception as e:
            self.logger.error(f"学习请求分析失败: {str(e)}")
            raise
    
    async def _identify_learning_intent(self, user_input: str) -> str:
        """识别学习意图"""
        intent_patterns = {
            "learn_concept": ["学习", "了解", "什么是", "概念", "原理"],
            "how_to": ["如何", "怎么", "怎样", "方法", "步骤"],
            "troubleshoot": ["问题", "错误", "故障", "不工作", "失败"],
            "best_practices": ["最佳实践", "建议", "推荐", "优化"],
            "compare": ["比较", "区别", "差异", "选择", "哪个好"],
            "example": ["示例", "例子", "演示", "展示", "案例"]
        }
        
        for intent, keywords in intent_patterns.items():
            if any(keyword in user_input for keyword in keywords):
                return intent
        
        return "general_learning"
    
    async def _assess_skill_level(self, user_input: str, context: Dict = None) -> SkillLevel:
        """评估技能水平"""
        # 检查用户历史记录
        if context and context.get("user_id"):
            user_progress = self.learning_progress.get(context["user_id"])
            if user_progress:
                return user_progress.skill_level
        
        # 基于输入内容评估
        beginner_indicators = ["新手", "初学", "不会", "基础", "入门"]
        advanced_indicators = ["高级", "专业", "优化", "架构", "深入", "复杂"]
        expert_indicators = ["专家", "大师", "架构师", "最佳实践", "性能调优"]
        
        if any(indicator in user_input for indicator in expert_indicators):
            return SkillLevel.EXPERT
        elif any(indicator in user_input for indicator in advanced_indicators):
            return SkillLevel.ADVANCED
        elif any(indicator in user_input for indicator in beginner_indicators):
            return SkillLevel.BEGINNER
        else:
            return SkillLevel.INTERMEDIATE
    
    async def _identify_domain(self, user_input: str) -> ExpertiseDomain:
        """识别专业领域"""
        domain_keywords = {
            ExpertiseDomain.API_INTEGRATION: ["API", "接口", "集成", "调用", "REST", "GraphQL", "webhook"],
            ExpertiseDomain.DATA_PROCESSING: ["数据", "处理", "转换", "清洗", "ETL", "格式"],
            ExpertiseDomain.AUTOMATION: ["自动化", "流程", "定时", "触发", "事件", "批处理"],
            ExpertiseDomain.MONITORING: ["监控", "告警", "日志", "性能", "运维", "指标"],
            ExpertiseDomain.SECURITY: ["安全", "权限", "加密", "认证", "授权", "防护"],
            ExpertiseDomain.PERFORMANCE: ["优化", "性能", "并发", "缓存", "资源", "速度"]
        }
        
        for domain, keywords in domain_keywords.items():
            if any(keyword in user_input for keyword in keywords):
                return domain
        
        return ExpertiseDomain.GENERAL
    
    async def _recommend_teaching_mode(self, user_input: str, skill_level: SkillLevel) -> TeachingMode:
        """推荐教学模式"""
        if skill_level == SkillLevel.BEGINNER:
            return TeachingMode.STEP_BY_STEP
        elif "实践" in user_input or "操作" in user_input or "动手" in user_input:
            return TeachingMode.HANDS_ON
        elif "问题" in user_input or "解决" in user_input or "故障" in user_input:
            return TeachingMode.PROBLEM_SOLVING
        elif "演示" in user_input or "展示" in user_input or "示例" in user_input:
            return TeachingMode.INTERACTIVE_DEMO
        elif "最佳实践" in user_input or "建议" in user_input:
            return TeachingMode.BEST_PRACTICES
        else:
            return TeachingMode.CONCEPT_EXPLANATION
    
    async def _extract_specific_topic(self, user_input: str) -> str:
        """提取具体主题"""
        # 使用NLP技术提取关键主题
        topics = await self.nlp_processor.extract_topics(user_input)
        return topics[0] if topics else user_input[:50]
    
    async def _assess_urgency(self, user_input: str) -> str:
        """评估紧急程度"""
        urgent_keywords = ["紧急", "立即", "马上", "现在", "急需"]
        relaxed_keywords = ["有时间", "慢慢", "不急", "学习"]
        
        if any(keyword in user_input for keyword in urgent_keywords):
            return "urgent"
        elif any(keyword in user_input for keyword in relaxed_keywords):
            return "relaxed"
        else:
            return "normal"
    
    async def _identify_preferred_style(self, user_input: str, context: Dict = None) -> str:
        """识别偏好风格"""
        if "详细" in user_input or "完整" in user_input:
            return "detailed"
        elif "简单" in user_input or "快速" in user_input:
            return "concise"
        elif "互动" in user_input or "交互" in user_input:
            return "interactive"
        else:
            return "balanced"
    
    async def _extract_learning_goals(self, user_input: str) -> List[str]:
        """提取学习目标"""
        goals = []
        
        # 使用正则表达式提取目标
        goal_patterns = [
            r"希望(.+?)(?:[，,。]|$)",
            r"想要(.+?)(?:[，,。]|$)",
            r"目标是(.+?)(?:[，,。]|$)",
            r"学会(.+?)(?:[，,。]|$)"
        ]
        
        for pattern in goal_patterns:
            matches = re.findall(pattern, user_input)
            goals.extend([match.strip() for match in matches])
        
        return goals if goals else ["掌握相关知识和技能"]
    
    async def _select_domain_expert(self, request: LearningRequest) -> DomainExpert:
        """选择合适的领域专家"""
        expert = self.domain_experts.get(request.domain)
        if not expert:
            # 如果没有专门的专家，使用通用专家
            expert = self.domain_experts.get(ExpertiseDomain.GENERAL)
            if not expert:
                # 创建临时通用专家
                expert = DomainExpert(ExpertiseDomain.GENERAL, self.config)
        
        return expert
    
    async def _personalize_response(self, response: TeachingResponse, 
                                  request: LearningRequest, 
                                  context: Dict = None) -> TeachingResponse:
        """个性化调整响应"""
        # 根据用户偏好调整内容长度和风格
        if request.preferred_style == "concise":
            response.content = await self._make_concise(response.content)
        elif request.preferred_style == "detailed":
            response.content = await self._add_details(response.content, request.domain)
        
        # 根据技能水平调整难度
        if request.skill_level == SkillLevel.BEGINNER:
            response.examples = [ex for ex in response.examples if ex.get("difficulty", 1) <= 2]
        elif request.skill_level == SkillLevel.ADVANCED:
            response.examples.extend(await self._generate_advanced_examples(request.domain))
        
        return response
    
    async def _update_learning_progress(self, request: LearningRequest, 
                                      response: TeachingResponse, 
                                      context: Dict = None):
        """更新学习进度"""
        if not context or not context.get("user_id"):
            return
        
        user_id = context["user_id"]
        
        if user_id not in self.learning_progress:
            self.learning_progress[user_id] = LearningProgress(
                user_id=user_id,
                domain=request.domain,
                skill_level=request.skill_level,
                completed_topics=[],
                current_topic=request.specific_topic,
                progress_percentage=0.0,
                strengths=[],
                areas_for_improvement=[],
                learning_preferences={
                    "teaching_mode": request.teaching_mode.value,
                    "preferred_style": request.preferred_style
                },
                last_updated=datetime.now()
            )
        
        progress = self.learning_progress[user_id]
        
        # 更新当前主题
        progress.current_topic = request.specific_topic
        
        # 添加已完成主题
        if request.specific_topic not in progress.completed_topics:
            progress.completed_topics.append(request.specific_topic)
        
        # 更新进度百分比
        progress.progress_percentage = min(100.0, len(progress.completed_topics) * 10)
        
        # 更新学习偏好
        progress.learning_preferences.update({
            "teaching_mode": request.teaching_mode.value,
            "preferred_style": request.preferred_style
        })
        
        progress.last_updated = datetime.now()
    
    async def _record_teaching_history(self, request: LearningRequest, response: TeachingResponse):
        """记录教学历史"""
        history_entry = {
            "timestamp": datetime.now().isoformat(),
            "request": asdict(request),
            "response_summary": {
                "domain": response.domain.value,
                "teaching_mode": response.teaching_mode.value,
                "difficulty_level": response.difficulty_level,
                "estimated_time": response.estimated_time
            }
        }
        
        self.teaching_history.append(history_entry)
        
        # 保持历史记录在合理范围内
        if len(self.teaching_history) > 1000:
            self.teaching_history = self.teaching_history[-500:]
    
    async def _load_knowledge_base(self):
        """加载知识库"""
        try:
            # 加载N8N节点知识
            await self._load_n8n_nodes_knowledge()
            
            # 加载工作流模板知识
            await self._load_workflow_templates_knowledge()
            
            # 加载最佳实践知识
            await self._load_best_practices_knowledge()
            
            self.logger.info("知识库加载完成")
            
        except Exception as e:
            self.logger.warning(f"知识库加载失败: {str(e)}")
    
    async def _load_n8n_nodes_knowledge(self):
        """加载N8N节点知识"""
        try:
            # 获取所有节点信息
            nodes_result = await self.mcp_client.call_tool(
                "mcp_n8n__mcp_list_nodes",
                {"limit": 200}
            )
            
            # 处理和存储节点知识
            nodes = nodes_result.get("nodes", [])
            self.logger.info(f"加载了 {len(nodes)} 个N8N节点的知识")
            
        except Exception as e:
            self.logger.warning(f"N8N节点知识加载失败: {str(e)}")
    
    async def _load_workflow_templates_knowledge(self):
        """加载工作流模板知识"""
        try:
            # 获取工作流模板
            templates_result = await self.mcp_client.call_tool(
                "mcp_n8n__mcp_search_templates",
                {"query": "tutorial", "limit": 50}
            )
            
            templates = templates_result.get("templates", [])
            self.logger.info(f"加载了 {len(templates)} 个工作流模板")
            
        except Exception as e:
            self.logger.warning(f"工作流模板知识加载失败: {str(e)}")
    
    async def _load_best_practices_knowledge(self):
        """加载最佳实践知识"""
        # 这里可以加载预定义的最佳实践知识
        pass
    
    async def _make_concise(self, content: str) -> str:
        """使内容更简洁"""
        # 简化内容，保留核心信息
        lines = content.split('\n')
        concise_lines = []
        
        for line in lines:
            if line.strip():
                # 保留标题和重要信息
                if line.startswith('#') or line.startswith('-') or line.startswith('*'):
                    concise_lines.append(line)
                elif len(line.strip()) < 100:  # 保留短句
                    concise_lines.append(line)
        
        return '\n'.join(concise_lines)
    
    async def _add_details(self, content: str, domain: ExpertiseDomain) -> str:
        """添加详细信息"""
        # 根据领域添加更多详细信息
        additional_details = f"""

## 详细说明
这是{domain.value}领域的详细教学内容。我们将深入探讨相关概念、实现方法和最佳实践。

## 相关资源
- 官方文档链接
- 社区最佳实践
- 常见问题解答
- 进阶学习路径
"""
        
        return content + additional_details
    
    async def _generate_advanced_examples(self, domain: ExpertiseDomain) -> List[Dict]:
        """生成高级示例"""
        advanced_examples = []
        
        if domain == ExpertiseDomain.API_INTEGRATION:
            advanced_examples.append({
                "title": "高级API集成模式",
                "description": "实现带有重试、限流和错误处理的复杂API集成",
                "difficulty": 5,
                "concepts": ["重试机制", "指数退避", "断路器模式", "限流"]
            })
        
        return advanced_examples
    
    async def get_learning_progress(self, user_id: str) -> Optional[LearningProgress]:
        """获取学习进度"""
        return self.learning_progress.get(user_id)
    
    async def get_teaching_history(self, user_id: str = None, limit: int = 10) -> List[Dict]:
        """获取教学历史"""
        if user_id:
            # 过滤特定用户的历史
            user_history = [
                entry for entry in self.teaching_history
                if entry.get("request", {}).get("context", {}).get("user_id") == user_id
            ]
            return user_history[-limit:]
        else:
            return self.teaching_history[-limit:]
    
    async def recommend_next_topic(self, user_id: str) -> List[str]:
        """推荐下一个学习主题"""
        progress = self.learning_progress.get(user_id)
        if not progress:
            return ["N8N基础概念", "HTTP Request节点", "数据处理基础"]
        
        # 根据当前进度推荐
        completed_topics = set(progress.completed_topics)
        
        # 定义学习路径
        learning_paths = {
            ExpertiseDomain.API_INTEGRATION: [
                "HTTP Request基础", "API认证", "错误处理", "性能优化", "高级集成模式"
            ],
            ExpertiseDomain.DATA_PROCESSING: [
                "数据转换基础", "ETL流程", "数据清洗", "批处理", "实时处理"
            ]
        }
        
        path = learning_paths.get(progress.domain, [])
        recommendations = [topic for topic in path if topic not in completed_topics]
        
        return recommendations[:3]  # 返回前3个推荐

# 使用示例
async def main():
    """主函数示例"""
    # 创建教学Agent实例
    teaching_agent = TeachingAgentCore()
    
    # 初始化
    await teaching_agent.initialize()
    
    # 处理学习请求
    user_request = "我想学习如何在N8N中使用API，我是初学者"
    context = {"user_id": "user_123"}
    
    response = await teaching_agent.process_learning_request(user_request, context)
    
    print(f"教学模式: {response.teaching_mode.value}")
    print(f"专业领域: {response.domain.value}")
    print(f"难度级别: {response.difficulty_level}")
    print(f"预计时间: {response.estimated_time}分钟")
    print(f"教学内容:\n{response.content}")
    
    # 获取学习进度
    progress = await teaching_agent.get_learning_progress("user_123")
    if progress:
        print(f"学习进度: {progress.progress_percentage}%")
        print(f"已完成主题: {progress.completed_topics}")

if __name__ == "__main__":
    asyncio.run(main())