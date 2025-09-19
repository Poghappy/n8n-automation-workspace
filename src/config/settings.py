"""
AI智能体系统配置文件
统一管理所有配置参数，支持环境变量和默认值
"""

import os
from typing import List, Optional
from pydantic import BaseSettings, Field


class DatabaseSettings(BaseSettings):
    """数据库配置"""
    
    # PostgreSQL配置
    postgres_host: str = Field(default="localhost", env="POSTGRES_HOST")
    postgres_port: int = Field(default=5432, env="POSTGRES_PORT")
    postgres_db: str = Field(default="n8n", env="POSTGRES_DB")
    postgres_user: str = Field(default="n8n", env="POSTGRES_USER")
    postgres_password: str = Field(env="POSTGRES_PASSWORD")
    
    # Redis配置
    redis_host: str = Field(default="localhost", env="REDIS_HOST")
    redis_port: int = Field(default=6379, env="REDIS_PORT")
    redis_password: str = Field(env="REDIS_PASSWORD")
    redis_db: int = Field(default=0, env="REDIS_DB")
    
    @property
    def postgres_url(self) -> str:
        """PostgreSQL连接URL"""
        return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
    
    @property
    def redis_url(self) -> str:
        """Redis连接URL"""
        return f"redis://:{self.redis_password}@{self.redis_host}:{self.redis_port}/{self.redis_db}"


class N8NSettings(BaseSettings):
    """N8N工作流引擎配置"""
    
    n8n_url: str = Field(default="http://localhost:5678", env="N8N_URL")
    n8n_api_key: str = Field(env="N8N_API_KEY")
    n8n_webhook_url: str = Field(default="http://localhost:5678/webhook", env="N8N_WEBHOOK_URL")
    
    # 执行配置
    max_concurrent_workflows: int = Field(default=10, env="MAX_CONCURRENT_WORKFLOWS")
    execution_timeout: int = Field(default=3600, env="N8N_EXECUTIONS_TIMEOUT")
    execution_timeout_max: int = Field(default=7200, env="N8N_EXECUTIONS_TIMEOUT_MAX")


class AISettings(BaseSettings):
    """AI智能体配置"""
    
    # OpenAI配置
    openai_api_key: str = Field(env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4", env="OPENAI_MODEL")
    openai_max_tokens: int = Field(default=4000, env="OPENAI_MAX_TOKENS")
    openai_temperature: float = Field(default=0.7, env="OPENAI_TEMPERATURE")
    
    # 智能体行为配置
    agent_mode: str = Field(default="hybrid", env="AGENT_MODE")  # hybrid, autonomous, manual
    agent_role: str = Field(default="executive", env="AGENT_ROLE")  # executive, analyst, teacher
    enable_auto_learning: bool = Field(default=True, env="ENABLE_AUTO_LEARNING")
    enable_monitoring: bool = Field(default=True, env="ENABLE_MONITORING")
    
    # 学习和推荐配置
    learning_rate: float = Field(default=0.1, env="LEARNING_RATE")
    recommendation_threshold: float = Field(default=0.8, env="RECOMMENDATION_THRESHOLD")
    knowledge_update_interval: int = Field(default=3600, env="KNOWLEDGE_UPDATE_INTERVAL")  # 秒


class HuoniaoSettings(BaseSettings):
    """火鸟门户系统配置"""
    
    portal_url: str = Field(default="http://localhost:8080", env="HUONIAO_PORTAL_URL")
    api_key: str = Field(env="HUONIAO_API_KEY")
    
    # 数据库配置
    db_host: str = Field(default="localhost", env="HUONIAO_DB_HOST")
    db_port: int = Field(default=3306, env="HUONIAO_DB_PORT")
    db_name: str = Field(default="huoniao", env="HUONIAO_DB_NAME")
    db_user: str = Field(default="huoniao", env="HUONIAO_DB_USER")
    db_password: str = Field(env="HUONIAO_DB_PASSWORD")


class APISettings(BaseSettings):
    """API服务配置"""
    
    host: str = Field(default="0.0.0.0", env="API_HOST")
    port: int = Field(default=8000, env="API_PORT")
    workers: int = Field(default=4, env="API_WORKERS")
    reload: bool = Field(default=False, env="API_RELOAD")
    websocket_port: int = Field(default=8001, env="WEBSOCKET_PORT")
    
    # CORS配置
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8080"],
        env="CORS_ORIGINS"
    )
    cors_allow_credentials: bool = Field(default=True, env="CORS_ALLOW_CREDENTIALS")


class SecuritySettings(BaseSettings):
    """安全配置"""
    
    # JWT配置
    jwt_secret_key: str = Field(env="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(default=30, env="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    jwt_refresh_token_expire_days: int = Field(default=7, env="JWT_REFRESH_TOKEN_EXPIRE_DAYS")
    
    # 加密配置
    encryption_key: str = Field(env="N8N_ENCRYPTION_KEY")


class LoggingSettings(BaseSettings):
    """日志配置"""
    
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT"
    )
    log_file_path: str = Field(default="logs/app.log", env="LOG_FILE_PATH")
    log_max_size: int = Field(default=10485760, env="LOG_MAX_SIZE")  # 10MB
    log_backup_count: int = Field(default=5, env="LOG_BACKUP_COUNT")


class MonitoringSettings(BaseSettings):
    """监控配置"""
    
    enable_metrics: bool = Field(default=True, env="ENABLE_METRICS")
    metrics_port: int = Field(default=9090, env="METRICS_PORT")
    health_check_interval: int = Field(default=30, env="HEALTH_CHECK_INTERVAL")  # 秒
    
    # 告警配置
    enable_alerts: bool = Field(default=True, env="ENABLE_ALERTS")
    alert_webhook_url: Optional[str] = Field(default=None, env="ALERT_WEBHOOK_URL")
    alert_email: Optional[str] = Field(default=None, env="ALERT_EMAIL")


class Settings(BaseSettings):
    """主配置类，整合所有配置"""
    
    # 环境配置
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=False, env="DEBUG")
    timezone: str = Field(default="Asia/Shanghai", env="TIMEZONE")
    
    # 子配置
    database: DatabaseSettings = DatabaseSettings()
    n8n: N8NSettings = N8NSettings()
    ai: AISettings = AISettings()
    huoniao: HuoniaoSettings = HuoniaoSettings()
    api: APISettings = APISettings()
    security: SecuritySettings = SecuritySettings()
    logging: LoggingSettings = LoggingSettings()
    monitoring: MonitoringSettings = MonitoringSettings()
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# 全局配置实例
settings = Settings()


def get_settings() -> Settings:
    """获取配置实例"""
    return settings


def validate_settings() -> bool:
    """验证配置完整性"""
    try:
        # 验证必需的配置项
        required_fields = [
            settings.database.postgres_password,
            settings.database.redis_password,
            settings.n8n.n8n_api_key,
            settings.ai.openai_api_key,
            settings.security.jwt_secret_key,
            settings.security.encryption_key,
        ]
        
        for field in required_fields:
            if not field:
                return False
        
        return True
    except Exception:
        return False


def get_config_summary() -> dict:
    """获取配置摘要（隐藏敏感信息）"""
    return {
        "environment": settings.environment,
        "debug": settings.debug,
        "timezone": settings.timezone,
        "database": {
            "postgres_host": settings.database.postgres_host,
            "postgres_port": settings.database.postgres_port,
            "postgres_db": settings.database.postgres_db,
            "redis_host": settings.database.redis_host,
            "redis_port": settings.database.redis_port,
        },
        "n8n": {
            "url": settings.n8n.n8n_url,
            "max_concurrent_workflows": settings.n8n.max_concurrent_workflows,
        },
        "ai": {
            "model": settings.ai.openai_model,
            "agent_mode": settings.ai.agent_mode,
            "agent_role": settings.ai.agent_role,
        },
        "api": {
            "host": settings.api.host,
            "port": settings.api.port,
            "workers": settings.api.workers,
        },
    }