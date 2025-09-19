#!/usr/bin/env python3
"""
用户意图识别和需求分析模块
版本: 1.0.0
作者: AI智能体系统
"""

import asyncio
import json
import logging
import re
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, asdict
from enum import Enum
import yaml
from datetime import datetime
import jieba
import jieba.analyse
from collections import Counter

# 导入工具和配置
from src.utils.logger import setup_logger
from src.utils.config import load_config
from src.utils.nlp import NLPProcessor

class IntentType(Enum):
    """意图类型枚举"""
    # 执行类意图
    CREATE_WORKFLOW = "create_workflow"
    EXECUTE_WORKFLOW = "execute_workflow"
    MODIFY_WORKFLOW = "modify_workflow"
    DELETE_WORKFLOW = "delete_workflow"
    
    # 学习类意图
    LEARN_CONCEPT = "learn_concept"
    GET_TUTORIAL = "get_tutorial"
    ASK_QUESTION = "ask_question"
    GET_EXAMPLE = "get_example"
    
    # 查询类意图
    SEARCH_NODE = "search_node"
    GET_DOCUMENTATION = "get_documentation"
    LIST_WORKFLOWS = "list_workflows"
    CHECK_STATUS = "check_status"
    
    # 故障排除类意图
    TROUBLESHOOT = "troubleshoot"
    DEBUG_WORKFLOW = "debug_workflow"
    FIX_ERROR = "fix_error"
    
    # 优化类意图
    OPTIMIZE_PERFORMANCE = "optimize_performance"
    IMPROVE_WORKFLOW = "improve_workflow"
    
    # 其他
    GENERAL_CHAT = "general_chat"
    UNKNOWN = "unknown"

class ComplexityLevel(Enum):
    """复杂度级别枚举"""
    SIMPLE = "simple"          # 简单：单一操作，明确需求
    MODERATE = "moderate"      # 中等：多步骤，需要一些配置
    COMPLEX = "complex"        # 复杂：多系统集成，复杂逻辑
    ADVANCED = "advanced"      # 高级：需要深度定制，专业知识

class UrgencyLevel(Enum):
    """紧急程度枚举"""
    LOW = "low"           # 低：学习性质，不急
    NORMAL = "normal"     # 正常：常规需求
    HIGH = "high"         # 高：业务需要，较急
    CRITICAL = "critical" # 紧急：生产问题，立即处理

class UserRole(Enum):
    """用户角色枚举"""
    BEGINNER = "beginner"         # 初学者
    DEVELOPER = "developer"       # 开发者
    ADMIN = "admin"              # 管理员
    BUSINESS_USER = "business_user"  # 业务用户
    ARCHITECT = "architect"       # 架构师

@dataclass
class IntentAnalysisResult:
    """意图分析结果"""
    # 基础信息
    raw_input: str
    primary_intent: IntentType
    secondary_intents: List[IntentType]
    confidence_score: float
    
    # 需求分析
    complexity_level: ComplexityLevel
    urgency_level: UrgencyLevel
    estimated_effort: int  # 预估工作量（分钟）
    
    # 用户画像
    user_role: UserRole
    skill_level: str
    domain_expertise: List[str]
    
    # 具体需求
    entities: Dict[str, Any]  # 提取的实体
    parameters: Dict[str, Any]  # 参数
    constraints: List[str]  # 约束条件
    requirements: List[str]  # 具体需求
    
    # 上下文信息
    context_type: str
    related_workflows: List[str]
    dependencies: List[str]
    
    # 推荐信息
    recommended_approach: str
    suggested_nodes: List[str]
    alternative_solutions: List[str]
    
    # 元数据
    analysis_timestamp: datetime
    processing_time_ms: int

class IntentPatternMatcher:
    """意图模式匹配器"""
    
    def __init__(self):
        self.logger = setup_logger("IntentPatternMatcher")
        
        # 意图关键词模式
        self.intent_patterns = {
            IntentType.CREATE_WORKFLOW: {
                "keywords": ["创建", "建立", "新建", "制作", "搭建", "构建", "设计"],
                "objects": ["工作流", "流程", "自动化", "任务", "作业"],
                "patterns": [
                    r"(创建|新建|建立|制作|搭建|构建).*(工作流|流程|自动化)",
                    r"(如何|怎么|怎样).*(创建|建立|制作).*(工作流|流程)",
                    r"(想要|需要|希望).*(创建|建立|新建).*(工作流|流程)"
                ]
            },
            
            IntentType.EXECUTE_WORKFLOW: {
                "keywords": ["执行", "运行", "启动", "触发", "开始", "调用"],
                "objects": ["工作流", "流程", "任务", "作业"],
                "patterns": [
                    r"(执行|运行|启动|触发).*(工作流|流程|任务)",
                    r"(如何|怎么).*(执行|运行|启动).*(工作流|流程)",
                    r"(开始|启动).*(自动化|流程)"
                ]
            },
            
            IntentType.LEARN_CONCEPT: {
                "keywords": ["学习", "了解", "理解", "掌握", "学会"],
                "objects": ["概念", "原理", "知识", "技术", "方法"],
                "patterns": [
                    r"(学习|了解|理解).*(概念|原理|知识)",
                    r"(什么是|介绍一下).*(N8N|工作流|自动化)",
                    r"(如何|怎么).*(学习|掌握|理解)"
                ]
            },
            
            IntentType.TROUBLESHOOT: {
                "keywords": ["问题", "错误", "故障", "异常", "失败", "不工作", "报错"],
                "objects": ["工作流", "节点", "连接", "执行", "数据"],
                "patterns": [
                    r"(出现|遇到|有).*(问题|错误|故障)",
                    r"(工作流|节点).*(不工作|失败|报错)",
                    r"(如何|怎么).*(解决|修复|处理).*(问题|错误)"
                ]
            },
            
            IntentType.SEARCH_NODE: {
                "keywords": ["查找", "搜索", "寻找", "找到", "获取"],
                "objects": ["节点", "组件", "插件", "工具"],
                "patterns": [
                    r"(查找|搜索|寻找).*(节点|组件|插件)",
                    r"(有没有|是否有).*(节点|工具|插件)",
                    r"(推荐|建议).*(节点|工具|组件)"
                ]
            },
            
            IntentType.OPTIMIZE_PERFORMANCE: {
                "keywords": ["优化", "提升", "改进", "加速", "性能"],
                "objects": ["性能", "速度", "效率", "资源", "内存"],
                "patterns": [
                    r"(优化|提升|改进).*(性能|速度|效率)",
                    r"(如何|怎么).*(优化|提升|加速)",
                    r"(性能|速度).*(慢|差|问题)"
                ]
            }
        }
        
        # 复杂度指示词
        self.complexity_indicators = {
            ComplexityLevel.SIMPLE: [
                "简单", "基础", "基本", "单个", "一个", "快速", "直接"
            ],
            ComplexityLevel.MODERATE: [
                "多个", "几个", "一些", "配置", "设置", "连接", "集成"
            ],
            ComplexityLevel.COMPLEX: [
                "复杂", "多系统", "集成", "高级", "定制", "批量", "大量"
            ],
            ComplexityLevel.ADVANCED: [
                "架构", "企业级", "生产环境", "高可用", "分布式", "微服务"
            ]
        }
        
        # 紧急程度指示词
        self.urgency_indicators = {
            UrgencyLevel.CRITICAL: ["紧急", "立即", "马上", "现在", "急需", "生产", "故障"],
            UrgencyLevel.HIGH: ["尽快", "今天", "重要", "优先", "业务"],
            UrgencyLevel.NORMAL: ["正常", "常规", "一般", "普通"],
            UrgencyLevel.LOW: ["学习", "了解", "有时间", "不急", "慢慢"]
        }
        
        # 用户角色指示词
        self.role_indicators = {
            UserRole.BEGINNER: ["新手", "初学", "刚开始", "不会", "学习"],
            UserRole.DEVELOPER: ["开发", "程序员", "编程", "代码", "技术"],
            UserRole.ADMIN: ["管理", "运维", "部署", "配置", "监控"],
            UserRole.BUSINESS_USER: ["业务", "流程", "自动化", "效率", "工作"],
            UserRole.ARCHITECT: ["架构", "设计", "规划", "方案", "系统"]
        }
    
    async def match_intent(self, text: str) -> Tuple[IntentType, float]:
        """匹配主要意图"""
        text_lower = text.lower()
        intent_scores = {}
        
        for intent_type, patterns in self.intent_patterns.items():
            score = 0.0
            
            # 关键词匹配
            keyword_matches = sum(1 for keyword in patterns["keywords"] if keyword in text)
            object_matches = sum(1 for obj in patterns["objects"] if obj in text)
            
            # 基础得分
            score += keyword_matches * 0.3 + object_matches * 0.2
            
            # 正则模式匹配
            pattern_matches = 0
            for pattern in patterns["patterns"]:
                if re.search(pattern, text):
                    pattern_matches += 1
            
            score += pattern_matches * 0.5
            
            # 归一化得分
            max_possible = len(patterns["keywords"]) * 0.3 + len(patterns["objects"]) * 0.2 + len(patterns["patterns"]) * 0.5
            if max_possible > 0:
                score = score / max_possible
            
            intent_scores[intent_type] = score
        
        # 找到最高得分的意图
        if intent_scores:
            best_intent = max(intent_scores.items(), key=lambda x: x[1])
            return best_intent[0], best_intent[1]
        
        return IntentType.UNKNOWN, 0.0
    
    async def match_complexity(self, text: str) -> ComplexityLevel:
        """匹配复杂度级别"""
        text_lower = text.lower()
        
        for level, indicators in self.complexity_indicators.items():
            if any(indicator in text_lower for indicator in indicators):
                return level
        
        # 基于文本长度和技术词汇密度推断
        tech_words = ["API", "数据库", "集成", "认证", "加密", "并发", "缓存"]
        tech_count = sum(1 for word in tech_words if word.lower() in text_lower)
        
        if tech_count >= 3 or len(text) > 200:
            return ComplexityLevel.COMPLEX
        elif tech_count >= 1 or len(text) > 100:
            return ComplexityLevel.MODERATE
        else:
            return ComplexityLevel.SIMPLE
    
    async def match_urgency(self, text: str) -> UrgencyLevel:
        """匹配紧急程度"""
        text_lower = text.lower()
        
        for level, indicators in self.urgency_indicators.items():
            if any(indicator in text_lower for indicator in indicators):
                return level
        
        return UrgencyLevel.NORMAL
    
    async def match_user_role(self, text: str, context: Dict = None) -> UserRole:
        """匹配用户角色"""
        text_lower = text.lower()
        
        for role, indicators in self.role_indicators.items():
            if any(indicator in text_lower for indicator in indicators):
                return role
        
        # 基于上下文推断
        if context and context.get("user_history"):
            # 分析历史行为模式
            pass
        
        return UserRole.DEVELOPER  # 默认角色

class EntityExtractor:
    """实体提取器"""
    
    def __init__(self):
        self.logger = setup_logger("EntityExtractor")
        
        # 实体模式
        self.entity_patterns = {
            "workflow_name": [
                r"工作流[\"\'](.*?)[\"\']",
                r"名为[\"\'](.*?)[\"\']的工作流",
                r"叫做[\"\'](.*?)[\"\']"
            ],
            "node_type": [
                r"(HTTP Request|Webhook|Set|Function|Code|Split In Batches|Merge|IF|Switch)节点",
                r"使用(.*?)节点",
                r"添加(.*?)节点"
            ],
            "api_endpoint": [
                r"https?://[^\s]+",
                r"API[：:]\s*([^\s]+)",
                r"接口[：:]\s*([^\s]+)"
            ],
            "data_format": [
                r"(JSON|XML|CSV|Excel|PDF)格式",
                r"(json|xml|csv|excel|pdf)数据",
                r"返回(.*?)格式"
            ],
            "frequency": [
                r"每(.*?)执行",
                r"(每天|每小时|每分钟|定时)",
                r"间隔(.*?)运行"
            ],
            "condition": [
                r"如果(.*?)则",
                r"当(.*?)时",
                r"满足(.*?)条件"
            ]
        }
    
    async def extract_entities(self, text: str) -> Dict[str, Any]:
        """提取实体"""
        entities = {}
        
        for entity_type, patterns in self.entity_patterns.items():
            matches = []
            for pattern in patterns:
                found = re.findall(pattern, text, re.IGNORECASE)
                matches.extend(found)
            
            if matches:
                entities[entity_type] = matches
        
        # 使用jieba提取关键词
        keywords = jieba.analyse.extract_tags(text, topK=10, withWeight=True)
        entities["keywords"] = [{"word": word, "weight": weight} for word, weight in keywords]
        
        return entities

class RequirementAnalyzer:
    """需求分析器"""
    
    def __init__(self):
        self.logger = setup_logger("RequirementAnalyzer")
    
    async def analyze_requirements(self, text: str, entities: Dict) -> Dict[str, Any]:
        """分析具体需求"""
        requirements = {
            "functional_requirements": [],
            "non_functional_requirements": [],
            "constraints": [],
            "assumptions": []
        }
        
        # 功能需求分析
        functional_patterns = [
            r"需要(.*?)功能",
            r"实现(.*?)操作",
            r"支持(.*?)处理",
            r"能够(.*?)执行"
        ]
        
        for pattern in functional_patterns:
            matches = re.findall(pattern, text)
            requirements["functional_requirements"].extend(matches)
        
        # 非功能需求分析
        non_functional_patterns = [
            r"性能要求[：:](.*)",
            r"安全要求[：:](.*)",
            r"可用性要求[：:](.*)"
        ]
        
        for pattern in non_functional_patterns:
            matches = re.findall(pattern, text)
            requirements["non_functional_requirements"].extend(matches)
        
        # 约束条件分析
        constraint_patterns = [
            r"不能(.*)",
            r"禁止(.*)",
            r"限制(.*)",
            r"只能(.*)"
        ]
        
        for pattern in constraint_patterns:
            matches = re.findall(pattern, text)
            requirements["constraints"].extend(matches)
        
        return requirements
    
    async def estimate_effort(self, complexity: ComplexityLevel, 
                            intent: IntentType, 
                            entities: Dict) -> int:
        """估算工作量（分钟）"""
        base_effort = {
            IntentType.CREATE_WORKFLOW: 30,
            IntentType.EXECUTE_WORKFLOW: 5,
            IntentType.MODIFY_WORKFLOW: 20,
            IntentType.LEARN_CONCEPT: 15,
            IntentType.TROUBLESHOOT: 25,
            IntentType.OPTIMIZE_PERFORMANCE: 40
        }
        
        complexity_multiplier = {
            ComplexityLevel.SIMPLE: 1.0,
            ComplexityLevel.MODERATE: 2.0,
            ComplexityLevel.COMPLEX: 4.0,
            ComplexityLevel.ADVANCED: 8.0
        }
        
        base = base_effort.get(intent, 20)
        multiplier = complexity_multiplier.get(complexity, 2.0)
        
        # 根据实体数量调整
        entity_count = sum(len(v) if isinstance(v, list) else 1 for v in entities.values())
        entity_factor = 1 + (entity_count * 0.1)
        
        return int(base * multiplier * entity_factor)

class ContextAnalyzer:
    """上下文分析器"""
    
    def __init__(self):
        self.logger = setup_logger("ContextAnalyzer")
    
    async def analyze_context(self, text: str, 
                            conversation_history: List[Dict] = None,
                            user_profile: Dict = None) -> Dict[str, Any]:
        """分析上下文信息"""
        context = {
            "conversation_context": {},
            "user_context": {},
            "domain_context": {},
            "temporal_context": {}
        }
        
        # 对话上下文分析
        if conversation_history:
            context["conversation_context"] = await self._analyze_conversation_context(
                text, conversation_history
            )
        
        # 用户上下文分析
        if user_profile:
            context["user_context"] = await self._analyze_user_context(
                text, user_profile
            )
        
        # 领域上下文分析
        context["domain_context"] = await self._analyze_domain_context(text)
        
        # 时间上下文分析
        context["temporal_context"] = await self._analyze_temporal_context(text)
        
        return context
    
    async def _analyze_conversation_context(self, text: str, 
                                          history: List[Dict]) -> Dict:
        """分析对话上下文"""
        context = {
            "is_continuation": False,
            "referenced_topics": [],
            "context_switches": 0
        }
        
        if not history:
            return context
        
        # 检查是否是对话延续
        continuation_indicators = ["继续", "接着", "然后", "另外", "还有"]
        context["is_continuation"] = any(
            indicator in text for indicator in continuation_indicators
        )
        
        # 提取引用的主题
        recent_messages = history[-3:] if len(history) >= 3 else history
        for msg in recent_messages:
            if "keywords" in msg:
                context["referenced_topics"].extend(msg["keywords"])
        
        return context
    
    async def _analyze_user_context(self, text: str, profile: Dict) -> Dict:
        """分析用户上下文"""
        context = {
            "skill_level": profile.get("skill_level", "intermediate"),
            "preferred_style": profile.get("preferred_style", "balanced"),
            "domain_expertise": profile.get("domain_expertise", []),
            "learning_goals": profile.get("learning_goals", [])
        }
        
        return context
    
    async def _analyze_domain_context(self, text: str) -> Dict:
        """分析领域上下文"""
        domains = {
            "api_integration": ["API", "接口", "集成", "调用", "REST", "GraphQL"],
            "data_processing": ["数据", "处理", "转换", "清洗", "ETL"],
            "automation": ["自动化", "定时", "触发", "流程", "批处理"],
            "monitoring": ["监控", "告警", "日志", "性能", "指标"],
            "security": ["安全", "权限", "加密", "认证", "授权"]
        }
        
        detected_domains = []
        for domain, keywords in domains.items():
            if any(keyword in text for keyword in keywords):
                detected_domains.append(domain)
        
        return {
            "primary_domain": detected_domains[0] if detected_domains else "general",
            "related_domains": detected_domains[1:] if len(detected_domains) > 1 else [],
            "cross_domain": len(detected_domains) > 2
        }
    
    async def _analyze_temporal_context(self, text: str) -> Dict:
        """分析时间上下文"""
        temporal_indicators = {
            "immediate": ["现在", "立即", "马上", "当前"],
            "short_term": ["今天", "明天", "这周", "近期"],
            "long_term": ["下个月", "未来", "长期", "计划"]
        }
        
        detected_timeframe = "unspecified"
        for timeframe, indicators in temporal_indicators.items():
            if any(indicator in text for indicator in indicators):
                detected_timeframe = timeframe
                break
        
        return {
            "timeframe": detected_timeframe,
            "has_deadline": any(word in text for word in ["截止", "期限", "deadline"]),
            "is_recurring": any(word in text for word in ["定期", "重复", "循环"])
        }

class IntentAnalyzer:
    """意图分析器主类"""
    
    def __init__(self, config_path: str = None):
        # 加载配置
        self.config = load_config(config_path or "config/intent_analyzer_config.yaml")
        
        # 初始化日志
        self.logger = setup_logger("IntentAnalyzer")
        
        # 初始化组件
        self.pattern_matcher = IntentPatternMatcher()
        self.entity_extractor = EntityExtractor()
        self.requirement_analyzer = RequirementAnalyzer()
        self.context_analyzer = ContextAnalyzer()
        
        # 初始化NLP处理器
        self.nlp_processor = NLPProcessor()
        
        # 分析缓存
        self.analysis_cache = {}
        
        # 统计信息
        self.analysis_stats = {
            "total_analyses": 0,
            "intent_distribution": Counter(),
            "complexity_distribution": Counter(),
            "average_processing_time": 0.0
        }
    
    async def initialize(self):
        """初始化分析器"""
        try:
            self.logger.info("初始化意图分析器...")
            
            # 初始化jieba分词
            jieba.initialize()
            
            # 加载自定义词典
            await self._load_custom_dictionary()
            
            # 初始化NLP处理器
            await self.nlp_processor.initialize()
            
            self.logger.info("意图分析器初始化完成")
            
        except Exception as e:
            self.logger.error(f"意图分析器初始化失败: {str(e)}")
            raise
    
    async def analyze_intent(self, 
                           user_input: str,
                           context: Dict = None,
                           conversation_history: List[Dict] = None,
                           user_profile: Dict = None) -> IntentAnalysisResult:
        """分析用户意图"""
        start_time = datetime.now()
        
        try:
            self.logger.info(f"开始分析用户意图: {user_input[:50]}...")
            
            # 检查缓存
            cache_key = self._generate_cache_key(user_input, context)
            if cache_key in self.analysis_cache:
                self.logger.info("使用缓存的分析结果")
                return self.analysis_cache[cache_key]
            
            # 1. 预处理输入
            processed_input = await self._preprocess_input(user_input)
            
            # 2. 意图匹配
            primary_intent, confidence = await self.pattern_matcher.match_intent(processed_input)
            secondary_intents = await self._identify_secondary_intents(processed_input, primary_intent)
            
            # 3. 复杂度分析
            complexity_level = await self.pattern_matcher.match_complexity(processed_input)
            
            # 4. 紧急程度分析
            urgency_level = await self.pattern_matcher.match_urgency(processed_input)
            
            # 5. 用户角色识别
            user_role = await self.pattern_matcher.match_user_role(processed_input, user_profile)
            
            # 6. 实体提取
            entities = await self.entity_extractor.extract_entities(processed_input)
            
            # 7. 需求分析
            requirements_analysis = await self.requirement_analyzer.analyze_requirements(
                processed_input, entities
            )
            
            # 8. 工作量估算
            estimated_effort = await self.requirement_analyzer.estimate_effort(
                complexity_level, primary_intent, entities
            )
            
            # 9. 上下文分析
            context_analysis = await self.context_analyzer.analyze_context(
                processed_input, conversation_history, user_profile
            )
            
            # 10. 生成推荐
            recommendations = await self._generate_recommendations(
                primary_intent, complexity_level, entities, context_analysis
            )
            
            # 计算处理时间
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # 构建分析结果
            result = IntentAnalysisResult(
                raw_input=user_input,
                primary_intent=primary_intent,
                secondary_intents=secondary_intents,
                confidence_score=confidence,
                complexity_level=complexity_level,
                urgency_level=urgency_level,
                estimated_effort=estimated_effort,
                user_role=user_role,
                skill_level=context_analysis.get("user_context", {}).get("skill_level", "intermediate"),
                domain_expertise=context_analysis.get("domain_context", {}).get("related_domains", []),
                entities=entities,
                parameters=await self._extract_parameters(entities),
                constraints=requirements_analysis.get("constraints", []),
                requirements=requirements_analysis.get("functional_requirements", []),
                context_type=context_analysis.get("domain_context", {}).get("primary_domain", "general"),
                related_workflows=await self._find_related_workflows(entities, context),
                dependencies=await self._identify_dependencies(entities, primary_intent),
                recommended_approach=recommendations.get("approach", ""),
                suggested_nodes=recommendations.get("nodes", []),
                alternative_solutions=recommendations.get("alternatives", []),
                analysis_timestamp=start_time,
                processing_time_ms=int(processing_time)
            )
            
            # 缓存结果
            self.analysis_cache[cache_key] = result
            
            # 更新统计信息
            await self._update_statistics(result)
            
            self.logger.info(f"意图分析完成: {primary_intent.value}, 置信度: {confidence:.2f}")
            return result
            
        except Exception as e:
            self.logger.error(f"意图分析失败: {str(e)}")
            raise
    
    async def _preprocess_input(self, user_input: str) -> str:
        """预处理用户输入"""
        # 去除多余空格
        processed = re.sub(r'\s+', ' ', user_input.strip())
        
        # 标准化标点符号
        processed = processed.replace('，', ',').replace('。', '.')
        
        # 处理常见缩写
        abbreviations = {
            "n8n": "N8N",
            "api": "API",
            "http": "HTTP",
            "json": "JSON",
            "xml": "XML"
        }
        
        for abbr, full in abbreviations.items():
            processed = re.sub(f'\\b{abbr}\\b', full, processed, flags=re.IGNORECASE)
        
        return processed
    
    async def _identify_secondary_intents(self, text: str, primary_intent: IntentType) -> List[IntentType]:
        """识别次要意图"""
        secondary_intents = []
        
        # 如果主要意图是创建工作流，可能还包含学习意图
        if primary_intent == IntentType.CREATE_WORKFLOW:
            if any(word in text for word in ["学习", "了解", "教程"]):
                secondary_intents.append(IntentType.LEARN_CONCEPT)
        
        # 如果主要意图是故障排除，可能还包含优化意图
        if primary_intent == IntentType.TROUBLESHOOT:
            if any(word in text for word in ["优化", "改进", "提升"]):
                secondary_intents.append(IntentType.OPTIMIZE_PERFORMANCE)
        
        return secondary_intents
    
    async def _extract_parameters(self, entities: Dict) -> Dict[str, Any]:
        """从实体中提取参数"""
        parameters = {}
        
        # 提取工作流参数
        if "workflow_name" in entities:
            parameters["workflow_name"] = entities["workflow_name"][0]
        
        # 提取API参数
        if "api_endpoint" in entities:
            parameters["api_endpoint"] = entities["api_endpoint"][0]
        
        # 提取数据格式参数
        if "data_format" in entities:
            parameters["data_format"] = entities["data_format"][0]
        
        # 提取频率参数
        if "frequency" in entities:
            parameters["frequency"] = entities["frequency"][0]
        
        return parameters
    
    async def _find_related_workflows(self, entities: Dict, context: Dict = None) -> List[str]:
        """查找相关工作流"""
        related_workflows = []
        
        # 基于实体查找
        if "workflow_name" in entities:
            # 这里可以调用工作流搜索API
            pass
        
        # 基于上下文查找
        if context and context.get("recent_workflows"):
            related_workflows.extend(context["recent_workflows"])
        
        return related_workflows
    
    async def _identify_dependencies(self, entities: Dict, intent: IntentType) -> List[str]:
        """识别依赖关系"""
        dependencies = []
        
        # 基于意图类型识别依赖
        if intent == IntentType.CREATE_WORKFLOW:
            if "api_endpoint" in entities:
                dependencies.append("API连接配置")
            if "data_format" in entities:
                dependencies.append("数据格式转换")
        
        return dependencies
    
    async def _generate_recommendations(self, 
                                     intent: IntentType,
                                     complexity: ComplexityLevel,
                                     entities: Dict,
                                     context: Dict) -> Dict[str, Any]:
        """生成推荐信息"""
        recommendations = {
            "approach": "",
            "nodes": [],
            "alternatives": []
        }
        
        # 基于意图推荐方法
        if intent == IntentType.CREATE_WORKFLOW:
            if complexity == ComplexityLevel.SIMPLE:
                recommendations["approach"] = "使用可视化编辑器快速创建"
                recommendations["nodes"] = ["HTTP Request", "Set", "Webhook"]
            else:
                recommendations["approach"] = "分步骤设计，先创建基础流程"
                recommendations["nodes"] = ["HTTP Request", "Function", "Code", "IF"]
        
        elif intent == IntentType.LEARN_CONCEPT:
            recommendations["approach"] = "从基础概念开始，逐步深入"
            recommendations["alternatives"] = ["查看文档", "观看教程", "实践练习"]
        
        return recommendations
    
    async def _load_custom_dictionary(self):
        """加载自定义词典"""
        try:
            # N8N相关词汇
            n8n_words = [
                "N8N", "工作流", "节点", "连接器", "触发器", "执行器",
                "HTTP Request", "Webhook", "Set", "Function", "Code",
                "Split In Batches", "Merge", "IF", "Switch"
            ]
            
            for word in n8n_words:
                jieba.add_word(word)
            
            self.logger.info("自定义词典加载完成")
            
        except Exception as e:
            self.logger.warning(f"自定义词典加载失败: {str(e)}")
    
    def _generate_cache_key(self, user_input: str, context: Dict = None) -> str:
        """生成缓存键"""
        import hashlib
        
        # 基于输入和关键上下文生成哈希
        cache_data = {
            "input": user_input,
            "context_keys": list(context.keys()) if context else []
        }
        
        cache_str = json.dumps(cache_data, sort_keys=True)
        return hashlib.md5(cache_str.encode()).hexdigest()
    
    async def _update_statistics(self, result: IntentAnalysisResult):
        """更新统计信息"""
        self.analysis_stats["total_analyses"] += 1
        self.analysis_stats["intent_distribution"][result.primary_intent.value] += 1
        self.analysis_stats["complexity_distribution"][result.complexity_level.value] += 1
        
        # 更新平均处理时间
        total_time = (self.analysis_stats["average_processing_time"] * 
                     (self.analysis_stats["total_analyses"] - 1) + 
                     result.processing_time_ms)
        self.analysis_stats["average_processing_time"] = total_time / self.analysis_stats["total_analyses"]
    
    async def get_analysis_statistics(self) -> Dict[str, Any]:
        """获取分析统计信息"""
        return {
            "total_analyses": self.analysis_stats["total_analyses"],
            "intent_distribution": dict(self.analysis_stats["intent_distribution"]),
            "complexity_distribution": dict(self.analysis_stats["complexity_distribution"]),
            "average_processing_time_ms": self.analysis_stats["average_processing_time"],
            "cache_size": len(self.analysis_cache)
        }
    
    async def clear_cache(self):
        """清空缓存"""
        self.analysis_cache.clear()
        self.logger.info("分析缓存已清空")

# 使用示例
async def main():
    """主函数示例"""
    # 创建意图分析器实例
    analyzer = IntentAnalyzer()
    
    # 初始化
    await analyzer.initialize()
    
    # 分析用户意图
    test_inputs = [
        "我想创建一个工作流来自动处理API数据",
        "如何学习N8N的基础概念？",
        "我的工作流执行失败了，出现了错误",
        "有没有优化工作流性能的方法？",
        "查找一个可以处理JSON数据的节点"
    ]
    
    for user_input in test_inputs:
        print(f"\n分析输入: {user_input}")
        
        result = await analyzer.analyze_intent(user_input)
        
        print(f"主要意图: {result.primary_intent.value}")
        print(f"置信度: {result.confidence_score:.2f}")
        print(f"复杂度: {result.complexity_level.value}")
        print(f"紧急程度: {result.urgency_level.value}")
        print(f"用户角色: {result.user_role.value}")
        print(f"预估工作量: {result.estimated_effort}分钟")
        print(f"推荐方法: {result.recommended_approach}")
        print(f"建议节点: {result.suggested_nodes}")
        print(f"处理时间: {result.processing_time_ms}ms")
    
    # 获取统计信息
    stats = await analyzer.get_analysis_statistics()
    print(f"\n分析统计: {stats}")

if __name__ == "__main__":
    asyncio.run(main())