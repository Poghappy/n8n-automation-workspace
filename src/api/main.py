#!/usr/bin/env python3
"""
N8N自动化集成系统 - FastAPI主应用
提供REST API接口供外部系统调用
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any, List, Optional
from pathlib import Path
import sys

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import uvicorn

# 添加项目根目录到Python路径
sys.path.append(str(Path(__file__).parent.parent.parent))

from src.main import AIAgentSystem, SystemConfig, SystemMode, AgentRole
from src.core.intent_analyzer import IntentType, ComplexityLevel, UrgencyLevel, UserRole

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 全局AI智能体系统实例
ai_system: Optional[AIAgentSystem] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    global ai_system
    
    # 启动时初始化
    logger.info("正在启动AI智能体系统...")
    config = SystemConfig(
        mode=SystemMode.API,
        agent_role=AgentRole.HYBRID,
        log_level="INFO"
    )
    
    ai_system = AIAgentSystem(config)
    await ai_system.initialize()
    logger.info("AI智能体系统启动完成")
    
    yield
    
    # 关闭时清理
    logger.info("正在关闭AI智能体系统...")
    if ai_system:
        await ai_system.shutdown()
    logger.info("AI智能体系统已关闭")

# 创建FastAPI应用
app = FastAPI(
    title="N8N自动化集成系统 API",
    description="基于AI智能体的N8N工作流自动化系统",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# 添加中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# 静态文件服务
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic模型定义
class UserRequest(BaseModel):
    """用户请求模型"""
    message: str = Field(..., description="用户输入的消息")
    session_id: str = Field(default="default", description="会话ID")
    user_role: Optional[str] = Field(default="intermediate", description="用户角色")
    context: Optional[Dict[str, Any]] = Field(default=None, description="上下文信息")

class AgentResponse(BaseModel):
    """智能体响应模型"""
    success: bool = Field(..., description="请求是否成功")
    message: str = Field(..., description="响应消息")
    data: Optional[Dict[str, Any]] = Field(default=None, description="响应数据")
    session_id: str = Field(..., description="会话ID")
    agent_type: str = Field(..., description="处理的智能体类型")

class WorkflowRequest(BaseModel):
    """工作流请求模型"""
    name: str = Field(..., description="工作流名称")
    description: str = Field(..., description="工作流描述")
    requirements: List[str] = Field(..., description="需求列表")
    complexity: str = Field(default="medium", description="复杂度")
    priority: str = Field(default="normal", description="优先级")

class HealthResponse(BaseModel):
    """健康检查响应模型"""
    status: str = Field(..., description="系统状态")
    version: str = Field(..., description="系统版本")
    uptime: float = Field(..., description="运行时间（秒）")
    components: Dict[str, str] = Field(..., description="组件状态")

# WebSocket连接管理
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# 依赖注入
async def get_ai_system() -> AIAgentSystem:
    """获取AI智能体系统实例"""
    if ai_system is None:
        raise HTTPException(status_code=503, detail="AI智能体系统未初始化")
    return ai_system

# API路由定义
@app.get("/", response_model=Dict[str, str])
async def root():
    """根路径"""
    return {
        "message": "N8N自动化集成系统 API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check(system: AIAgentSystem = Depends(get_ai_system)):
    """健康检查"""
    import time
    
    return HealthResponse(
        status="healthy" if system.is_running else "unhealthy",
        version="1.0.0",
        uptime=time.time() - getattr(system, '_start_time', time.time()),
        components={
            "ai_system": "running" if system.is_running else "stopped",
            "intent_analyzer": "ready",
            "workflow_executive": "ready",
            "teaching_agent": "ready",
            "knowledge_base": "ready"
        }
    )

@app.post("/api/v1/chat", response_model=AgentResponse)
async def chat_with_agent(
    request: UserRequest,
    background_tasks: BackgroundTasks,
    system: AIAgentSystem = Depends(get_ai_system)
):
    """与AI智能体对话"""
    try:
        # 处理用户请求
        response = await system.process_user_input(
            request.message, 
            request.session_id
        )
        
        # 确定处理的智能体类型
        agent_type = "hybrid"
        if "workflow_url" in response:
            agent_type = "executive"
        elif "explanation" in response:
            agent_type = "teacher"
        
        return AgentResponse(
            success=True,
            message="请求处理成功",
            data=response,
            session_id=request.session_id,
            agent_type=agent_type
        )
        
    except Exception as e:
        logger.error(f"处理聊天请求时发生错误: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/workflow/create", response_model=AgentResponse)
async def create_workflow(
    request: WorkflowRequest,
    system: AIAgentSystem = Depends(get_ai_system)
):
    """创建工作流"""
    try:
        # 构造工作流创建请求
        workflow_message = f"""
        请创建一个名为"{request.name}"的工作流。
        描述：{request.description}
        需求：{', '.join(request.requirements)}
        复杂度：{request.complexity}
        优先级：{request.priority}
        """
        
        response = await system.process_user_input(workflow_message)
        
        return AgentResponse(
            success=True,
            message="工作流创建请求已处理",
            data=response,
            session_id="workflow_creation",
            agent_type="executive"
        )
        
    except Exception as e:
        logger.error(f"创建工作流时发生错误: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/sessions/{session_id}")
async def get_session_info(
    session_id: str,
    system: AIAgentSystem = Depends(get_ai_system)
):
    """获取会话信息"""
    session_info = system.active_sessions.get(session_id)
    if not session_info:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    return {
        "session_id": session_id,
        "last_intent": session_info.get("last_intent"),
        "timestamp": session_info.get("timestamp"),
        "status": "active"
    }

@app.delete("/api/v1/sessions/{session_id}")
async def delete_session(
    session_id: str,
    system: AIAgentSystem = Depends(get_ai_system)
):
    """删除会话"""
    if session_id in system.active_sessions:
        del system.active_sessions[session_id]
        return {"message": f"会话 {session_id} 已删除"}
    else:
        raise HTTPException(status_code=404, detail="会话不存在")

@app.get("/api/v1/templates")
async def list_workflow_templates(
    category: Optional[str] = None,
    limit: int = 20,
    system: AIAgentSystem = Depends(get_ai_system)
):
    """获取工作流模板列表"""
    try:
        templates = await system.template_manager.search_templates(
            category=category,
            limit=limit
        )
        return {
            "templates": templates,
            "total": len(templates)
        }
    except Exception as e:
        logger.error(f"获取模板列表时发生错误: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/knowledge/search")
async def search_knowledge(
    query: str,
    limit: int = 10,
    system: AIAgentSystem = Depends(get_ai_system)
):
    """搜索知识库"""
    try:
        results = await system.knowledge_base.search_knowledge(
            query=query,
            limit=limit
        )
        return {
            "results": results,
            "total": len(results)
        }
    except Exception as e:
        logger.error(f"搜索知识库时发生错误: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket端点
@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket实时通信"""
    await manager.connect(websocket)
    system = await get_ai_system()
    
    try:
        while True:
            # 接收消息
            data = await websocket.receive_text()
            
            # 处理消息
            response = await system.process_user_input(data, session_id)
            
            # 发送响应
            await manager.send_personal_message(
                f"AI智能体: {response}",
                websocket
            )
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"WebSocket连接 {session_id} 已断开")

# 错误处理
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"未处理的异常: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "内部服务器错误", "status_code": 500}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )