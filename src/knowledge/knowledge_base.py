#!/usr/bin/env python3
"""
N8N知识库管理系统
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
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# 导入工具和配置
from src.utils.logger import setup_logger
from src.utils.config import load_config

class KnowledgeType(Enum):
    """知识类型枚举"""
    # 节点相关
    NODE_DOCUMENTATION = "node_documentation"
    NODE_CONFIGURATION = "node_configuration"
    NODE_EXAMPLES = "node_examples"
    NODE_TROUBLESHOOTING = "node_troubleshooting"
    
    # 工作流相关
    WORKFLOW_PATTERNS = "workflow_patterns"
    WORKFLOW_BEST_PRACTICES = "workflow_best_practices"
    WORKFLOW_OPTIMIZATION = "workflow_optimization"
    
    # 集成相关
    API_INTEGRATION = "api_integration"
    DATABASE_INTEGRATION = "database_integration"
    SERVICE_INTEGRATION = "service_integration"
    
    # 故障排除
    ERROR_SOLUTIONS = "error_solutions"
    DEBUGGING_GUIDES = "debugging_guides"
    PERFORMANCE_TUNING = "performance_tuning"
    
    # 安全相关
    SECURITY_PRACTICES = "security_practices"
    AUTHENTICATION_GUIDES = "authentication_guides"
    DATA_PROTECTION = "data_protection"
    
    # 开发指南
    DEVELOPMENT_GUIDES = "development_guides"
    TESTING_STRATEGIES = "testing_strategies"
    DEPLOYMENT_GUIDES = "deployment_guides"

class KnowledgeCategory(Enum):
    """知识分类枚举"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class KnowledgeSource(Enum):
    """知识来源枚举"""
    OFFICIAL_DOCS = "official_docs"
    COMMUNITY = "community"
    EXPERT_EXPERIENCE = "expert_experience"
    AI_GENERATED = "ai_generated"
    USER_CONTRIBUTED = "user_contributed"

@dataclass
class KnowledgeItem:
    """知识条目数据类"""
    # 基础信息
    id: str
    title: str
    content: str
    summary: str
    knowledge_type: KnowledgeType
    category: KnowledgeCategory
    source: KnowledgeSource
    
    # 分类标签
    tags: List[str]
    keywords: List[str]
    related_nodes: List[str]
    related_concepts: List[str]
    
    # 适用场景
    use_cases: List[str]
    prerequisites: List[str]
    difficulty_level: int  # 1-10
    
    # 内容结构
    sections: Dict[str, str]  # 章节内容
    code_examples: List[Dict[str, Any]]
    screenshots: List[str]
    diagrams: List[str]
    
    # 质量指标
    accuracy_score: float
    completeness_score: float
    usefulness_score: float
    freshness_score: float
    
    # 使用统计
    view_count: int
    helpful_votes: int
    unhelpful_votes: int
    last_accessed: datetime
    
    # 元数据
    author: str
    contributors: List[str]
    version: str
    created_at: datetime
    updated_at: datetime
    
    # 关联信息
    related_items: List[str]
    parent_item: Optional[str]
    child_items: List[str]
    
    # 验证状态
    is_verified: bool
    verification_date: Optional[datetime]
    verifier: Optional[str]

@dataclass
class SearchQuery:
    """搜索查询数据类"""
    query: str
    knowledge_types: List[KnowledgeType] = None
    categories: List[KnowledgeCategory] = None
    tags: List[str] = None
    related_nodes: List[str] = None
    difficulty_range: Tuple[int, int] = (1, 10)
    min_accuracy: float = 0.0
    limit: int = 10
    include_unverified: bool = True

@dataclass
class SearchResult:
    """搜索结果数据类"""
    item: KnowledgeItem
    relevance_score: float
    match_highlights: List[str]
    match_reasons: List[str]
    suggested_actions: List[str]

class KnowledgeDatabase:
    """知识库数据库管理器"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.logger = setup_logger("KnowledgeDatabase")
        self._init_database()
    
    def _init_database(self):
        """初始化数据库"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 创建知识条目表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS knowledge_items (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    summary TEXT,
                    knowledge_type TEXT,
                    category TEXT,
                    source TEXT,
                    tags TEXT,
                    keywords TEXT,
                    related_nodes TEXT,
                    related_concepts TEXT,
                    use_cases TEXT,
                    prerequisites TEXT,
                    difficulty_level INTEGER,
                    sections TEXT,
                    code_examples TEXT,
                    screenshots TEXT,
                    diagrams TEXT,
                    accuracy_score REAL,
                    completeness_score REAL,
                    usefulness_score REAL,
                    freshness_score REAL,
                    view_count INTEGER DEFAULT 0,
                    helpful_votes INTEGER DEFAULT 0,
                    unhelpful_votes INTEGER DEFAULT 0,
                    last_accessed TEXT,
                    author TEXT,
                    contributors TEXT,
                    version TEXT,
                    created_at TEXT,
                    updated_at TEXT,
                    related_items TEXT,
                    parent_item TEXT,
                    child_items TEXT,
                    is_verified BOOLEAN DEFAULT FALSE,
                    verification_date TEXT,
                    verifier TEXT
                )
            ''')
            
            # 创建搜索索引
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_knowledge_type ON knowledge_items(knowledge_type)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_category ON knowledge_items(category)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_tags ON knowledge_items(tags)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_difficulty ON knowledge_items(difficulty_level)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_accuracy ON knowledge_items(accuracy_score)
            ''')
            
            # 创建全文搜索表
            cursor.execute('''
                CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_fts USING fts5(
                    id, title, content, summary, tags, keywords, 
                    content='knowledge_items', content_rowid='rowid'
                )
            ''')
            
            # 创建使用统计表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS knowledge_usage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    item_id TEXT,
                    user_id TEXT,
                    action TEXT,
                    timestamp TEXT,
                    context TEXT,
                    FOREIGN KEY (item_id) REFERENCES knowledge_items (id)
                )
            ''')
            
            # 创建反馈表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS knowledge_feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    item_id TEXT,
                    user_id TEXT,
                    rating INTEGER,
                    comment TEXT,
                    feedback_type TEXT,
                    timestamp TEXT,
                    FOREIGN KEY (item_id) REFERENCES knowledge_items (id)
                )
            ''')
            
            conn.commit()
            conn.close()
            
            self.logger.info("知识库数据库初始化完成")
            
        except Exception as e:
            self.logger.error(f"数据库初始化失败: {str(e)}")
            raise
    
    async def save_knowledge_item(self, item: KnowledgeItem) -> bool:
        """保存知识条目"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 转换数据
            item_data = (
                item.id, item.title, item.content, item.summary,
                item.knowledge_type.value, item.category.value, item.source.value,
                json.dumps(item.tags), json.dumps(item.keywords),
                json.dumps(item.related_nodes), json.dumps(item.related_concepts),
                json.dumps(item.use_cases), json.dumps(item.prerequisites),
                item.difficulty_level, json.dumps(item.sections),
                json.dumps(item.code_examples), json.dumps(item.screenshots),
                json.dumps(item.diagrams), item.accuracy_score,
                item.completeness_score, item.usefulness_score, item.freshness_score,
                item.view_count, item.helpful_votes, item.unhelpful_votes,
                item.last_accessed.isoformat(), item.author,
                json.dumps(item.contributors), item.version,
                item.created_at.isoformat(), item.updated_at.isoformat(),
                json.dumps(item.related_items), item.parent_item,
                json.dumps(item.child_items), item.is_verified,
                item.verification_date.isoformat() if item.verification_date else None,
                item.verifier
            )
            
            cursor.execute('''
                INSERT OR REPLACE INTO knowledge_items VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            ''', item_data)
            
            # 更新全文搜索索引
            cursor.execute('''
                INSERT OR REPLACE INTO knowledge_fts(id, title, content, summary, tags, keywords)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (item.id, item.title, item.content, item.summary,
                  ' '.join(item.tags), ' '.join(item.keywords)))
            
            conn.commit()
            conn.close()
            
            self.logger.info(f"知识条目保存成功: {item.id}")
            return True
            
        except Exception as e:
            self.logger.error(f"知识条目保存失败: {str(e)}")
            return False
    
    async def get_knowledge_item(self, item_id: str) -> Optional[KnowledgeItem]:
        """获取知识条目"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM knowledge_items WHERE id = ?', (item_id,))
            row = cursor.fetchone()
            
            if row:
                # 更新访问统计
                cursor.execute('''
                    UPDATE knowledge_items 
                    SET view_count = view_count + 1, last_accessed = ?
                    WHERE id = ?
                ''', (datetime.now().isoformat(), item_id))
                conn.commit()
            
            conn.close()
            
            if row:
                return self._row_to_knowledge_item(row)
            
            return None
            
        except Exception as e:
            self.logger.error(f"获取知识条目失败: {str(e)}")
            return None
    
    async def search_knowledge(self, query: SearchQuery) -> List[KnowledgeItem]:
        """搜索知识条目"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 构建查询条件
            where_conditions = []
            params = []
            
            # 知识类型过滤
            if query.knowledge_types:
                type_conditions = []
                for kt in query.knowledge_types:
                    type_conditions.append("knowledge_type = ?")
                    params.append(kt.value)
                where_conditions.append(f"({' OR '.join(type_conditions)})")
            
            # 分类过滤
            if query.categories:
                cat_conditions = []
                for cat in query.categories:
                    cat_conditions.append("category = ?")
                    params.append(cat.value)
                where_conditions.append(f"({' OR '.join(cat_conditions)})")
            
            # 难度范围过滤
            where_conditions.append("difficulty_level BETWEEN ? AND ?")
            params.extend([query.difficulty_range[0], query.difficulty_range[1]])
            
            # 准确性过滤
            where_conditions.append("accuracy_score >= ?")
            params.append(query.min_accuracy)
            
            # 验证状态过滤
            if not query.include_unverified:
                where_conditions.append("is_verified = TRUE")
            
            # 全文搜索
            if query.query:
                # 使用FTS5进行全文搜索
                fts_sql = '''
                    SELECT k.* FROM knowledge_items k
                    JOIN knowledge_fts fts ON k.id = fts.id
                    WHERE knowledge_fts MATCH ?
                '''
                if where_conditions:
                    fts_sql += " AND " + " AND ".join(where_conditions)
                
                fts_sql += f" ORDER BY bm25(knowledge_fts) LIMIT {query.limit}"
                
                cursor.execute(fts_sql, [query.query] + params)
            else:
                # 普通查询
                sql = "SELECT * FROM knowledge_items"
                if where_conditions:
                    sql += " WHERE " + " AND ".join(where_conditions)
                sql += f" ORDER BY accuracy_score DESC, usefulness_score DESC LIMIT {query.limit}"
                
                cursor.execute(sql, params)
            
            rows = cursor.fetchall()
            conn.close()
            
            items = [self._row_to_knowledge_item(row) for row in rows]
            return items
            
        except Exception as e:
            self.logger.error(f"搜索知识条目失败: {str(e)}")
            return []
    
    def _row_to_knowledge_item(self, row) -> KnowledgeItem:
        """将数据库行转换为知识条目对象"""
        return KnowledgeItem(
            id=row[0],
            title=row[1],
            content=row[2],
            summary=row[3],
            knowledge_type=KnowledgeType(row[4]),
            category=KnowledgeCategory(row[5]),
            source=KnowledgeSource(row[6]),
            tags=json.loads(row[7]),
            keywords=json.loads(row[8]),
            related_nodes=json.loads(row[9]),
            related_concepts=json.loads(row[10]),
            use_cases=json.loads(row[11]),
            prerequisites=json.loads(row[12]),
            difficulty_level=row[13],
            sections=json.loads(row[14]),
            code_examples=json.loads(row[15]),
            screenshots=json.loads(row[16]),
            diagrams=json.loads(row[17]),
            accuracy_score=row[18],
            completeness_score=row[19],
            usefulness_score=row[20],
            freshness_score=row[21],
            view_count=row[22],
            helpful_votes=row[23],
            unhelpful_votes=row[24],
            last_accessed=datetime.fromisoformat(row[25]),
            author=row[26],
            contributors=json.loads(row[27]),
            version=row[28],
            created_at=datetime.fromisoformat(row[29]),
            updated_at=datetime.fromisoformat(row[30]),
            related_items=json.loads(row[31]),
            parent_item=row[32],
            child_items=json.loads(row[33]),
            is_verified=bool(row[34]),
            verification_date=datetime.fromisoformat(row[35]) if row[35] else None,
            verifier=row[36]
        )

class SemanticSearchEngine:
    """语义搜索引擎"""
    
    def __init__(self, model_path: str = None):
        self.logger = setup_logger("SemanticSearchEngine")
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.document_vectors = None
        self.document_ids = []
        self.is_trained = False
        
        # 模型保存路径
        self.model_path = model_path or "data/semantic_model.pkl"
    
    async def train(self, knowledge_items: List[KnowledgeItem]):
        """训练语义搜索模型"""
        try:
            self.logger.info("开始训练语义搜索模型...")
            
            # 准备文档
            documents = []
            self.document_ids = []
            
            for item in knowledge_items:
                # 组合文本内容
                text_content = f"{item.title} {item.summary} {item.content}"
                text_content += f" {' '.join(item.tags)} {' '.join(item.keywords)}"
                
                documents.append(text_content)
                self.document_ids.append(item.id)
            
            # 训练TF-IDF向量化器
            self.document_vectors = self.vectorizer.fit_transform(documents)
            self.is_trained = True
            
            # 保存模型
            await self._save_model()
            
            self.logger.info(f"语义搜索模型训练完成，处理了 {len(documents)} 个文档")
            
        except Exception as e:
            self.logger.error(f"训练语义搜索模型失败: {str(e)}")
            raise
    
    async def search(self, query: str, top_k: int = 10) -> List[Tuple[str, float]]:
        """语义搜索"""
        try:
            if not self.is_trained:
                await self._load_model()
            
            if not self.is_trained:
                self.logger.warning("语义搜索模型未训练")
                return []
            
            # 向量化查询
            query_vector = self.vectorizer.transform([query])
            
            # 计算相似度
            similarities = cosine_similarity(query_vector, self.document_vectors).flatten()
            
            # 获取top-k结果
            top_indices = np.argsort(similarities)[::-1][:top_k]
            
            results = []
            for idx in top_indices:
                if similarities[idx] > 0.1:  # 最小相似度阈值
                    results.append((self.document_ids[idx], float(similarities[idx])))
            
            return results
            
        except Exception as e:
            self.logger.error(f"语义搜索失败: {str(e)}")
            return []
    
    async def _save_model(self):
        """保存模型"""
        try:
            model_data = {
                'vectorizer': self.vectorizer,
                'document_vectors': self.document_vectors,
                'document_ids': self.document_ids,
                'is_trained': self.is_trained
            }
            
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            with open(self.model_path, 'wb') as f:
                pickle.dump(model_data, f)
            
            self.logger.info("语义搜索模型保存成功")
            
        except Exception as e:
            self.logger.error(f"保存模型失败: {str(e)}")
    
    async def _load_model(self):
        """加载模型"""
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as f:
                    model_data = pickle.load(f)
                
                self.vectorizer = model_data['vectorizer']
                self.document_vectors = model_data['document_vectors']
                self.document_ids = model_data['document_ids']
                self.is_trained = model_data['is_trained']
                
                self.logger.info("语义搜索模型加载成功")
            
        except Exception as e:
            self.logger.error(f"加载模型失败: {str(e)}")

class KnowledgeExtractor:
    """知识提取器"""
    
    def __init__(self):
        self.logger = setup_logger("KnowledgeExtractor")
    
    async def extract_from_n8n_docs(self, docs_path: str) -> List[KnowledgeItem]:
        """从N8N官方文档提取知识"""
        try:
            knowledge_items = []
            
            # 遍历文档目录
            for root, dirs, files in os.walk(docs_path):
                for file in files:
                    if file.endswith(('.md', '.txt')):
                        file_path = os.path.join(root, file)
                        item = await self._extract_from_markdown(file_path)
                        if item:
                            knowledge_items.append(item)
            
            self.logger.info(f"从文档提取了 {len(knowledge_items)} 个知识条目")
            return knowledge_items
            
        except Exception as e:
            self.logger.error(f"从文档提取知识失败: {str(e)}")
            return []
    
    async def extract_from_workflow(self, workflow_json: Dict[str, Any]) -> List[KnowledgeItem]:
        """从工作流提取知识"""
        try:
            knowledge_items = []
            
            # 提取节点使用模式
            nodes = workflow_json.get('nodes', [])
            for node in nodes:
                item = await self._extract_node_knowledge(node)
                if item:
                    knowledge_items.append(item)
            
            # 提取工作流模式
            workflow_item = await self._extract_workflow_pattern(workflow_json)
            if workflow_item:
                knowledge_items.append(workflow_item)
            
            return knowledge_items
            
        except Exception as e:
            self.logger.error(f"从工作流提取知识失败: {str(e)}")
            return []
    
    async def _extract_from_markdown(self, file_path: str) -> Optional[KnowledgeItem]:
        """从Markdown文件提取知识"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 解析标题
            title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
            title = title_match.group(1) if title_match else os.path.basename(file_path)
            
            # 生成摘要（取前200字符）
            summary = content[:200] + "..." if len(content) > 200 else content
            
            # 提取代码示例
            code_examples = []
            code_blocks = re.findall(r'```(\w+)?\n(.*?)\n```', content, re.DOTALL)
            for lang, code in code_blocks:
                code_examples.append({
                    'language': lang or 'text',
                    'code': code.strip(),
                    'description': ''
                })
            
            # 提取标签
            tags = []
            if 'node' in file_path.lower():
                tags.append('node')
            if 'workflow' in file_path.lower():
                tags.append('workflow')
            if 'api' in content.lower():
                tags.append('api')
            
            # 创建知识条目
            item = KnowledgeItem(
                id=hashlib.md5(file_path.encode()).hexdigest()[:16],
                title=title,
                content=content,
                summary=summary,
                knowledge_type=KnowledgeType.NODE_DOCUMENTATION,
                category=KnowledgeCategory.INTERMEDIATE,
                source=KnowledgeSource.OFFICIAL_DOCS,
                tags=tags,
                keywords=self._extract_keywords(content),
                related_nodes=[],
                related_concepts=[],
                use_cases=[],
                prerequisites=[],
                difficulty_level=5,
                sections={},
                code_examples=code_examples,
                screenshots=[],
                diagrams=[],
                accuracy_score=0.9,
                completeness_score=0.8,
                usefulness_score=0.7,
                freshness_score=0.9,
                view_count=0,
                helpful_votes=0,
                unhelpful_votes=0,
                last_accessed=datetime.now(),
                author="N8N官方",
                contributors=[],
                version="1.0.0",
                created_at=datetime.now(),
                updated_at=datetime.now(),
                related_items=[],
                parent_item=None,
                child_items=[],
                is_verified=True,
                verification_date=datetime.now(),
                verifier="系统自动验证"
            )
            
            return item
            
        except Exception as e:
            self.logger.error(f"从Markdown提取知识失败: {str(e)}")
            return None
    
    async def _extract_node_knowledge(self, node: Dict[str, Any]) -> Optional[KnowledgeItem]:
        """从节点提取知识"""
        try:
            node_type = node.get('type', '')
            node_name = node.get('name', '')
            parameters = node.get('parameters', {})
            
            # 生成知识内容
            content = f"节点类型: {node_type}\n"
            content += f"节点名称: {node_name}\n"
            content += f"配置参数: {json.dumps(parameters, indent=2)}\n"
            
            # 创建知识条目
            item = KnowledgeItem(
                id=f"node_{hashlib.md5(json.dumps(node).encode()).hexdigest()[:16]}",
                title=f"{node_type} 节点配置示例",
                content=content,
                summary=f"{node_type} 节点的配置示例和使用方法",
                knowledge_type=KnowledgeType.NODE_EXAMPLES,
                category=KnowledgeCategory.INTERMEDIATE,
                source=KnowledgeSource.AI_GENERATED,
                tags=[node_type.split('.')[-1], 'node', 'configuration'],
                keywords=[node_type, node_name],
                related_nodes=[node_type],
                related_concepts=[],
                use_cases=[],
                prerequisites=[],
                difficulty_level=4,
                sections={},
                code_examples=[{
                    'language': 'json',
                    'code': json.dumps(node, indent=2),
                    'description': '节点配置JSON'
                }],
                screenshots=[],
                diagrams=[],
                accuracy_score=0.8,
                completeness_score=0.7,
                usefulness_score=0.8,
                freshness_score=1.0,
                view_count=0,
                helpful_votes=0,
                unhelpful_votes=0,
                last_accessed=datetime.now(),
                author="AI智能体系统",
                contributors=[],
                version="1.0.0",
                created_at=datetime.now(),
                updated_at=datetime.now(),
                related_items=[],
                parent_item=None,
                child_items=[],
                is_verified=False,
                verification_date=None,
                verifier=None
            )
            
            return item
            
        except Exception as e:
            self.logger.error(f"从节点提取知识失败: {str(e)}")
            return None
    
    async def _extract_workflow_pattern(self, workflow: Dict[str, Any]) -> Optional[KnowledgeItem]:
        """从工作流提取模式知识"""
        try:
            workflow_name = workflow.get('name', '未命名工作流')
            nodes = workflow.get('nodes', [])
            connections = workflow.get('connections', {})
            
            # 分析工作流模式
            node_types = [node.get('type', '') for node in nodes]
            pattern_description = self._analyze_workflow_pattern(node_types, connections)
            
            # 生成内容
            content = f"工作流名称: {workflow_name}\n"
            content += f"节点数量: {len(nodes)}\n"
            content += f"节点类型: {', '.join(set(node_types))}\n"
            content += f"模式描述: {pattern_description}\n"
            content += f"工作流JSON: {json.dumps(workflow, indent=2)}\n"
            
            # 创建知识条目
            item = KnowledgeItem(
                id=f"workflow_{hashlib.md5(json.dumps(workflow).encode()).hexdigest()[:16]}",
                title=f"{workflow_name} - 工作流模式",
                content=content,
                summary=f"{workflow_name} 工作流的设计模式和实现方法",
                knowledge_type=KnowledgeType.WORKFLOW_PATTERNS,
                category=KnowledgeCategory.INTERMEDIATE,
                source=KnowledgeSource.AI_GENERATED,
                tags=['workflow', 'pattern', 'example'],
                keywords=[workflow_name] + list(set(node_types)),
                related_nodes=list(set(node_types)),
                related_concepts=[],
                use_cases=[],
                prerequisites=[],
                difficulty_level=6,
                sections={},
                code_examples=[{
                    'language': 'json',
                    'code': json.dumps(workflow, indent=2),
                    'description': '完整工作流JSON'
                }],
                screenshots=[],
                diagrams=[],
                accuracy_score=0.8,
                completeness_score=0.8,
                usefulness_score=0.7,
                freshness_score=1.0,
                view_count=0,
                helpful_votes=0,
                unhelpful_votes=0,
                last_accessed=datetime.now(),
                author="AI智能体系统",
                contributors=[],
                version="1.0.0",
                created_at=datetime.now(),
                updated_at=datetime.now(),
                related_items=[],
                parent_item=None,
                child_items=[],
                is_verified=False,
                verification_date=None,
                verifier=None
            )
            
            return item
            
        except Exception as e:
            self.logger.error(f"从工作流提取模式知识失败: {str(e)}")
            return None
    
    def _extract_keywords(self, text: str) -> List[str]:
        """提取关键词"""
        # 简单的关键词提取逻辑
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        word_freq = defaultdict(int)
        for word in words:
            word_freq[word] += 1
        
        # 返回频率最高的10个词
        return [word for word, freq in sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]]
    
    def _analyze_workflow_pattern(self, node_types: List[str], connections: Dict[str, Any]) -> str:
        """分析工作流模式"""
        patterns = []
        
        # 检查触发器类型
        triggers = [nt for nt in node_types if 'trigger' in nt.lower()]
        if triggers:
            patterns.append(f"触发器模式: {', '.join(triggers)}")
        
        # 检查数据处理模式
        if any('http' in nt.lower() for nt in node_types):
            patterns.append("HTTP请求模式")
        
        if any('function' in nt.lower() for nt in node_types):
            patterns.append("自定义函数处理")
        
        if any('if' in nt.lower() for nt in node_types):
            patterns.append("条件分支模式")
        
        return '; '.join(patterns) if patterns else "基础线性流程"

class KnowledgeRecommender:
    """知识推荐器"""
    
    def __init__(self, database: KnowledgeDatabase):
        self.database = database
        self.logger = setup_logger("KnowledgeRecommender")
    
    async def recommend_for_node(self, node_type: str, context: Dict[str, Any] = None) -> List[KnowledgeItem]:
        """为特定节点推荐相关知识"""
        try:
            # 构建搜索查询
            query = SearchQuery(
                query=node_type,
                knowledge_types=[
                    KnowledgeType.NODE_DOCUMENTATION,
                    KnowledgeType.NODE_EXAMPLES,
                    KnowledgeType.NODE_TROUBLESHOOTING
                ],
                related_nodes=[node_type],
                limit=5
            )
            
            # 搜索相关知识
            items = await self.database.search_knowledge(query)
            
            # 根据上下文调整推荐
            if context:
                items = await self._adjust_recommendations(items, context)
            
            return items
            
        except Exception as e:
            self.logger.error(f"节点知识推荐失败: {str(e)}")
            return []
    
    async def recommend_for_error(self, error_message: str, node_type: str = None) -> List[KnowledgeItem]:
        """为错误推荐解决方案"""
        try:
            # 构建搜索查询
            query_text = error_message
            if node_type:
                query_text += f" {node_type}"
            
            query = SearchQuery(
                query=query_text,
                knowledge_types=[
                    KnowledgeType.ERROR_SOLUTIONS,
                    KnowledgeType.DEBUGGING_GUIDES,
                    KnowledgeType.NODE_TROUBLESHOOTING
                ],
                limit=3
            )
            
            # 搜索解决方案
            items = await self.database.search_knowledge(query)
            
            return items
            
        except Exception as e:
            self.logger.error(f"错误解决方案推荐失败: {str(e)}")
            return []
    
    async def recommend_best_practices(self, workflow_type: str) -> List[KnowledgeItem]:
        """推荐最佳实践"""
        try:
            query = SearchQuery(
                query=workflow_type,
                knowledge_types=[
                    KnowledgeType.WORKFLOW_BEST_PRACTICES,
                    KnowledgeType.WORKFLOW_OPTIMIZATION,
                    KnowledgeType.SECURITY_PRACTICES
                ],
                limit=5
            )
            
            items = await self.database.search_knowledge(query)
            return items
            
        except Exception as e:
            self.logger.error(f"最佳实践推荐失败: {str(e)}")
            return []
    
    async def _adjust_recommendations(self, items: List[KnowledgeItem], context: Dict[str, Any]) -> List[KnowledgeItem]:
        """根据上下文调整推荐"""
        # 根据用户技能水平调整
        user_level = context.get('user_level', 'intermediate')
        level_map = {
            'beginner': KnowledgeCategory.BEGINNER,
            'intermediate': KnowledgeCategory.INTERMEDIATE,
            'advanced': KnowledgeCategory.ADVANCED,
            'expert': KnowledgeCategory.EXPERT
        }
        
        preferred_category = level_map.get(user_level, KnowledgeCategory.INTERMEDIATE)
        
        # 优先返回匹配用户水平的知识
        matched_items = [item for item in items if item.category == preferred_category]
        other_items = [item for item in items if item.category != preferred_category]
        
        return matched_items + other_items

class KnowledgeBase:
    """知识库管理系统主类"""
    
    def __init__(self, config_path: str = None):
        # 加载配置
        self.config = load_config(config_path or "config/knowledge_base_config.yaml")
        
        # 初始化日志
        self.logger = setup_logger("KnowledgeBase")
        
        # 初始化数据库
        db_path = self.config.get("database", {}).get("path", "data/knowledge.db")
        self.database = KnowledgeDatabase(db_path)
        
        # 初始化组件
        self.semantic_engine = SemanticSearchEngine()
        self.extractor = KnowledgeExtractor()
        self.recommender = KnowledgeRecommender(self.database)
        
        # 知识缓存
        self.knowledge_cache = {}
        
        # 统计信息
        self.stats = {
            "total_items": 0,
            "total_searches": 0,
            "cache_hits": 0,
            "popular_topics": defaultdict(int)
        }
    
    async def initialize(self):
        """初始化知识库"""
        try:
            self.logger.info("初始化知识库系统...")
            
            # 加载现有知识
            await self._load_existing_knowledge()
            
            # 训练语义搜索引擎
            await self._train_semantic_engine()
            
            # 加载预置知识
            await self._load_builtin_knowledge()
            
            self.logger.info("知识库系统初始化完成")
            
        except Exception as e:
            self.logger.error(f"知识库初始化失败: {str(e)}")
            raise
    
    async def search(self, query: str, **kwargs) -> List[SearchResult]:
        """搜索知识"""
        try:
            self.logger.info(f"搜索知识: {query}")
            
            # 构建搜索查询
            search_query = SearchQuery(query=query, **kwargs)
            
            # 执行搜索
            items = await self.database.search_knowledge(search_query)
            
            # 语义搜索增强
            semantic_results = await self.semantic_engine.search(query, top_k=10)
            semantic_ids = [item_id for item_id, score in semantic_results]
            
            # 合并结果
            enhanced_items = []
            for item in items:
                enhanced_items.append(item)
            
            # 添加语义搜索结果
            for item_id in semantic_ids:
                if item_id not in [item.id for item in enhanced_items]:
                    item = await self.database.get_knowledge_item(item_id)
                    if item:
                        enhanced_items.append(item)
            
            # 转换为搜索结果
            search_results = []
            for item in enhanced_items[:search_query.limit]:
                result = SearchResult(
                    item=item,
                    relevance_score=self._calculate_relevance(item, query),
                    match_highlights=self._extract_highlights(item, query),
                    match_reasons=self._get_match_reasons(item, query),
                    suggested_actions=self._get_suggested_actions(item)
                )
                search_results.append(result)
            
            # 更新统计
            self.stats["total_searches"] += 1
            
            self.logger.info(f"搜索完成，返回 {len(search_results)} 个结果")
            return search_results
            
        except Exception as e:
            self.logger.error(f"搜索知识失败: {str(e)}")
            return []
    
    async def add_knowledge(self, item: KnowledgeItem) -> bool:
        """添加知识条目"""
        try:
            # 保存到数据库
            success = await self.database.save_knowledge_item(item)
            
            if success:
                # 更新缓存
                self.knowledge_cache[item.id] = item
                
                # 更新统计
                self.stats["total_items"] += 1
                self.stats["popular_topics"][item.knowledge_type.value] += 1
                
                # 重新训练语义引擎（异步）
                asyncio.create_task(self._retrain_semantic_engine())
                
                self.logger.info(f"知识条目添加成功: {item.id}")
            
            return success
            
        except Exception as e:
            self.logger.error(f"添加知识条目失败: {str(e)}")
            return False
    
    async def get_recommendations(self, context: Dict[str, Any]) -> List[KnowledgeItem]:
        """获取推荐知识"""
        try:
            recommendations = []
            
            # 基于节点类型推荐
            if context.get('node_type'):
                node_recs = await self.recommender.recommend_for_node(
                    context['node_type'], context
                )
                recommendations.extend(node_recs)
            
            # 基于错误推荐
            if context.get('error_message'):
                error_recs = await self.recommender.recommend_for_error(
                    context['error_message'], context.get('node_type')
                )
                recommendations.extend(error_recs)
            
            # 基于工作流类型推荐
            if context.get('workflow_type'):
                practice_recs = await self.recommender.recommend_best_practices(
                    context['workflow_type']
                )
                recommendations.extend(practice_recs)
            
            # 去重并限制数量
            unique_recs = []
            seen_ids = set()
            for rec in recommendations:
                if rec.id not in seen_ids:
                    unique_recs.append(rec)
                    seen_ids.add(rec.id)
                    if len(unique_recs) >= 10:
                        break
            
            return unique_recs
            
        except Exception as e:
            self.logger.error(f"获取推荐失败: {str(e)}")
            return []
    
    async def extract_knowledge_from_source(self, source_type: str, source_path: str) -> List[KnowledgeItem]:
        """从外部源提取知识"""
        try:
            if source_type == "n8n_docs":
                return await self.extractor.extract_from_n8n_docs(source_path)
            elif source_type == "workflow":
                with open(source_path, 'r') as f:
                    workflow_json = json.load(f)
                return await self.extractor.extract_from_workflow(workflow_json)
            else:
                raise ValueError(f"不支持的源类型: {source_type}")
                
        except Exception as e:
            self.logger.error(f"从源提取知识失败: {str(e)}")
            return []
    
    async def _load_existing_knowledge(self):
        """加载现有知识"""
        try:
            # 统计现有知识数量
            query = SearchQuery(query="", limit=1000)
            items = await self.database.search_knowledge(query)
            self.stats["total_items"] = len(items)
            
            # 加载到缓存
            for item in items[:100]:  # 只缓存前100个
                self.knowledge_cache[item.id] = item
            
            self.logger.info(f"加载了 {len(items)} 个现有知识条目")
            
        except Exception as e:
            self.logger.warning(f"加载现有知识失败: {str(e)}")
    
    async def _train_semantic_engine(self):
        """训练语义搜索引擎"""
        try:
            # 获取所有知识条目
            query = SearchQuery(query="", limit=10000)
            items = await self.database.search_knowledge(query)
            
            if items:
                await self.semantic_engine.train(items)
                self.logger.info("语义搜索引擎训练完成")
            
        except Exception as e:
            self.logger.warning(f"训练语义搜索引擎失败: {str(e)}")
    
    async def _retrain_semantic_engine(self):
        """重新训练语义搜索引擎"""
        await self._train_semantic_engine()
    
    async def _load_builtin_knowledge(self):
        """加载内置知识"""
        try:
            # 加载N8N基础节点知识
            builtin_items = [
                KnowledgeItem(
                    id="webhook_basic",
                    title="Webhook节点基础使用",
                    content="Webhook节点用于接收HTTP请求，是N8N中最常用的触发器之一...",
                    summary="Webhook节点的基础配置和使用方法",
                    knowledge_type=KnowledgeType.NODE_DOCUMENTATION,
                    category=KnowledgeCategory.BEGINNER,
                    source=KnowledgeSource.AI_GENERATED,
                    tags=["webhook", "trigger", "http"],
                    keywords=["webhook", "http", "trigger", "request"],
                    related_nodes=["n8n-nodes-base.webhook"],
                    related_concepts=["HTTP协议", "REST API"],
                    use_cases=["接收外部通知", "API端点", "数据收集"],
                    prerequisites=["HTTP基础知识"],
                    difficulty_level=2,
                    sections={
                        "配置": "设置HTTP方法、路径和响应模式",
                        "使用": "在工作流中作为触发器使用",
                        "测试": "使用测试URL验证配置"
                    },
                    code_examples=[{
                        "language": "json",
                        "code": '{"httpMethod": "POST", "path": "webhook", "responseMode": "onReceived"}',
                        "description": "基础Webhook配置"
                    }],
                    screenshots=[],
                    diagrams=[],
                    accuracy_score=0.95,
                    completeness_score=0.9,
                    usefulness_score=0.95,
                    freshness_score=1.0,
                    view_count=0,
                    helpful_votes=0,
                    unhelpful_votes=0,
                    last_accessed=datetime.now(),
                    author="AI智能体系统",
                    contributors=[],
                    version="1.0.0",
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                    related_items=[],
                    parent_item=None,
                    child_items=[],
                    is_verified=True,
                    verification_date=datetime.now(),
                    verifier="系统验证"
                )
            ]
            
            # 保存内置知识
            for item in builtin_items:
                await self.database.save_knowledge_item(item)
            
            self.logger.info(f"加载了 {len(builtin_items)} 个内置知识条目")
            
        except Exception as e:
            self.logger.warning(f"加载内置知识失败: {str(e)}")
    
    def _calculate_relevance(self, item: KnowledgeItem, query: str) -> float:
        """计算相关性分数"""
        score = 0.0
        
        # 标题匹配
        if query.lower() in item.title.lower():
            score += 0.3
        
        # 标签匹配
        for tag in item.tags:
            if query.lower() in tag.lower():
                score += 0.2
        
        # 关键词匹配
        for keyword in item.keywords:
            if query.lower() in keyword.lower():
                score += 0.1
        
        # 内容匹配
        if query.lower() in item.content.lower():
            score += 0.2
        
        # 质量分数
        score += item.accuracy_score * 0.2
        
        return min(score, 1.0)
    
    def _extract_highlights(self, item: KnowledgeItem, query: str) -> List[str]:
        """提取匹配高亮"""
        highlights = []
        
        # 在内容中查找匹配片段
        content_words = item.content.split()
        query_words = query.lower().split()
        
        for i, word in enumerate(content_words):
            if any(qw in word.lower() for qw in query_words):
                start = max(0, i - 5)
                end = min(len(content_words), i + 6)
                snippet = ' '.join(content_words[start:end])
                highlights.append(snippet)
                if len(highlights) >= 3:
                    break
        
        return highlights
    
    def _get_match_reasons(self, item: KnowledgeItem, query: str) -> List[str]:
        """获取匹配原因"""
        reasons = []
        
        if query.lower() in item.title.lower():
            reasons.append("标题匹配")
        
        for tag in item.tags:
            if query.lower() in tag.lower():
                reasons.append(f"标签匹配: {tag}")
                break
        
        if query.lower() in item.content.lower():
            reasons.append("内容匹配")
        
        return reasons
    
    def _get_suggested_actions(self, item: KnowledgeItem) -> List[str]:
        """获取建议操作"""
        actions = []
        
        if item.code_examples:
            actions.append("查看代码示例")
        
        if item.related_items:
            actions.append("浏览相关知识")
        
        if item.knowledge_type == KnowledgeType.NODE_DOCUMENTATION:
            actions.append("在工作流中使用此节点")
        
        return actions
    
    async def get_knowledge_statistics(self) -> Dict[str, Any]:
        """获取知识库统计信息"""
        return {
            "stats": dict(self.stats),
            "cache_size": len(self.knowledge_cache),
            "popular_topics": dict(self.stats["popular_topics"])
        }

# 使用示例
async def main():
    """主函数示例"""
    # 创建知识库实例
    kb = KnowledgeBase()
    
    # 初始化
    await kb.initialize()
    
    # 搜索知识
    results = await kb.search("webhook配置", limit=5)
    
    print(f"搜索结果 ({len(results)} 个):")
    for result in results:
        print(f"- {result.item.title} (相关性: {result.relevance_score:.2f})")
        print(f"  匹配原因: {', '.join(result.match_reasons)}")
        print(f"  建议操作: {', '.join(result.suggested_actions)}")
        print()
    
    # 获取推荐
    recommendations = await kb.get_recommendations({
        'node_type': 'n8n-nodes-base.webhook',
        'user_level': 'beginner'
    })
    
    print(f"推荐知识 ({len(recommendations)} 个):")
    for rec in recommendations:
        print(f"- {rec.title} ({rec.category.value})")
    
    # 获取统计信息
    stats = await kb.get_knowledge_statistics()
    print(f"知识库统计: {stats}")

if __name__ == "__main__":
    asyncio.run(main())