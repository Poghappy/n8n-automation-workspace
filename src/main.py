#!/usr/bin/env python3
"""
N8N自动化集成系统 - AI智能体主入口
主要功能：
1. 系统初始化和配置管理
2. AI智能体协调和调度
3. 用户交互接口
4. 系统监控和日志管理
"""

import asyncio
import logging
import sys
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

# 添加项目根目录到Python路径
sys.path.append(str(Path(__file__).parent.parent))

from src.agents.workflow_executive import WorkflowExecutiveAgent
from src.agents.teaching_agent import TeachingAgent
from src.core.intent_analyzer import IntentAnalyzer
from src.core.workflow_template_manager import WorkflowTemplateManager
from src.knowledge.knowledge_base import KnowledgeBase

class SystemMode(Enum):
    """系统运行模式"""
    INTERACTIVE = "interactive"  # 交互模式
    BATCH = "batch"             # 批处理模式
    API = "api"                 # API服务模式
    DAEMON = "daemon"           # 守护进程模式

class AgentRole(Enum):
    """AI智能体角色"""
    EXECUTIVE = "executive"     # 执行官
    TEACHER = "teacher"         # 教学老师
    HYBRID = "hybrid"          # 混合模式

@dataclass
class SystemConfig:
    """系统配置"""
    mode: SystemMode = SystemMode.INTERACTIVE
    agent_role: AgentRole = AgentRole.HYBRID
    log_level: str = "INFO"
    n8n_url: str = "http://localhost:5678"
    n8n_api_key: Optional[str] = None
    enable_monitoring: bool = True
    enable_auto_learning: bool = True
    max_concurrent_workflows: int = 10

class AIAgentSystem:
    """AI智能体系统主控制器"""
    
    def __init__(self, config: SystemConfig):
        self.config = config
        self.logger = self._setup_logging()
        
        # 初始化核心组件
        self.intent_analyzer = IntentAnalyzer()
        self.template_manager = WorkflowTemplateManager()
        self.knowledge_base = KnowledgeBase()
        
        # 初始化AI智能体
        self.workflow_executive = WorkflowExecutiveAgent()
        self.teaching_agent = TeachingAgent()
        
        # 系统状态
        self.is_running = False
        self.active_sessions = {}
        
    def _setup_logging(self) -> logging.Logger:
        """设置日志系统"""
        logging.basicConfig(
            level=getattr(logging, self.config.log_level),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(sys.stdout),
                logging.FileHandler('logs/system.log')
            ]
        )
        return logging.getLogger(__name__)
    
    async def initialize(self):
        """系统初始化"""
        self.logger.info("正在初始化AI智能体系统...")
        
        try:
            # 初始化知识库
            await self.knowledge_base.initialize()
            self.logger.info("知识库初始化完成")
            
            # 初始化模板库
            await self.template_manager.initialize()
            self.logger.info("工作流模板库初始化完成")
            
            # 初始化AI智能体
            await self.workflow_executive.initialize()
            await self.teaching_agent.initialize()
            self.logger.info("AI智能体初始化完成")
            
            self.is_running = True
            self.logger.info("系统初始化成功")
            
        except Exception as e:
            self.logger.error(f"系统初始化失败: {e}")
            raise
    
    async def process_user_input(self, user_input: str, session_id: str = "default") -> Dict[str, Any]:
        """处理用户输入"""
        if not self.is_running:
            return {"error": "系统未初始化"}
        
        try:
            # 意图分析
            intent_result = await self.intent_analyzer.analyze_intent(user_input)
            self.logger.info(f"意图分析结果: {intent_result.intent_type}")
            
            # 根据意图类型选择处理方式
            if intent_result.intent_type.value in ["workflow_creation", "workflow_execution", "workflow_modification"]:
                # 工作流相关请求 - 使用执行官
                response = await self.workflow_executive.process_request(intent_result)
                
            elif intent_result.intent_type.value in ["learning_request", "help_request", "tutorial_request"]:
                # 学习相关请求 - 使用教学老师
                response = await self.teaching_agent.process_learning_request(intent_result)
                
            else:
                # 混合请求 - 智能路由
                response = await self._handle_hybrid_request(intent_result, session_id)
            
            # 更新会话状态
            self.active_sessions[session_id] = {
                "last_intent": intent_result,
                "last_response": response,
                "timestamp": asyncio.get_event_loop().time()
            }
            
            return response
            
        except Exception as e:
            self.logger.error(f"处理用户输入时发生错误: {e}")
            return {"error": f"处理请求时发生错误: {str(e)}"}
    
    async def _handle_hybrid_request(self, intent_result, session_id: str) -> Dict[str, Any]:
        """处理混合请求"""
        # 根据复杂度和用户角色决定处理策略
        if intent_result.complexity.value == "high" or intent_result.user_role.value == "beginner":
            # 高复杂度或初学者 - 优先教学模式
            teaching_response = await self.teaching_agent.process_learning_request(intent_result)
            
            # 如果用户确认理解，再执行工作流
            if teaching_response.get("requires_confirmation"):
                return teaching_response
            else:
                # 直接执行
                exec_response = await self.workflow_executive.process_request(intent_result)
                return {
                    "teaching": teaching_response,
                    "execution": exec_response,
                    "mode": "hybrid"
                }
        else:
            # 低复杂度或专家用户 - 直接执行
            return await self.workflow_executive.process_request(intent_result)
    
    async def start_interactive_mode(self):
        """启动交互模式"""
        self.logger.info("启动交互模式...")
        
        print("🤖 N8N AI智能体系统已启动")
        print("💡 输入 'help' 获取帮助，输入 'quit' 退出系统")
        print("-" * 50)
        
        session_id = "interactive_session"
        
        while self.is_running:
            try:
                user_input = input("\n👤 您: ").strip()
                
                if user_input.lower() in ['quit', 'exit', '退出']:
                    break
                
                if not user_input:
                    continue
                
                print("🤖 AI智能体正在处理...")
                response = await self.process_user_input(user_input, session_id)
                
                # 格式化输出响应
                self._format_response(response)
                
            except KeyboardInterrupt:
                print("\n\n👋 再见！")
                break
            except Exception as e:
                print(f"❌ 发生错误: {e}")
    
    def _format_response(self, response: Dict[str, Any]):
        """格式化响应输出"""
        if "error" in response:
            print(f"❌ 错误: {response['error']}")
            return
        
        if response.get("mode") == "hybrid":
            print("📚 教学模式响应:")
            self._print_teaching_response(response.get("teaching", {}))
            print("\n⚡ 执行模式响应:")
            self._print_execution_response(response.get("execution", {}))
        elif "workflow_url" in response:
            self._print_execution_response(response)
        else:
            self._print_teaching_response(response)
    
    def _print_teaching_response(self, response: Dict[str, Any]):
        """打印教学响应"""
        if response.get("explanation"):
            print(f"💡 解释: {response['explanation']}")
        
        if response.get("steps"):
            print("📋 步骤:")
            for i, step in enumerate(response["steps"], 1):
                print(f"  {i}. {step}")
        
        if response.get("resources"):
            print("📖 相关资源:")
            for resource in response["resources"]:
                print(f"  • {resource}")
    
    def _print_execution_response(self, response: Dict[str, Any]):
        """打印执行响应"""
        if response.get("workflow_url"):
            print(f"✅ 工作流已创建: {response['workflow_url']}")
        
        if response.get("execution_id"):
            print(f"🚀 执行ID: {response['execution_id']}")
        
        if response.get("status"):
            print(f"📊 状态: {response['status']}")
        
        if response.get("result"):
            print(f"📋 结果: {response['result']}")
    
    async def shutdown(self):
        """系统关闭"""
        self.logger.info("正在关闭系统...")
        self.is_running = False
        
        # 清理资源
        await self.workflow_executive.cleanup()
        await self.teaching_agent.cleanup()
        
        self.logger.info("系统已关闭")

async def main():
    """主函数"""
    # 创建系统配置
    config = SystemConfig(
        mode=SystemMode.INTERACTIVE,
        agent_role=AgentRole.HYBRID,
        log_level="INFO"
    )
    
    # 创建并初始化系统
    system = AIAgentSystem(config)
    
    try:
        await system.initialize()
        
        # 根据模式启动系统
        if config.mode == SystemMode.INTERACTIVE:
            await system.start_interactive_mode()
        else:
            # 其他模式的实现
            pass
            
    except KeyboardInterrupt:
        print("\n收到中断信号，正在关闭系统...")
    except Exception as e:
        print(f"系统运行错误: {e}")
    finally:
        await system.shutdown()

if __name__ == "__main__":
    # 确保日志目录存在
    Path("logs").mkdir(exist_ok=True)
    
    # 运行系统
    asyncio.run(main())