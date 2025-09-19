-- N8N企业级自动化工作流平台 - 数据库初始化脚本
-- 创建必要的数据库、用户和权限配置

-- 创建N8N数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS n8n;

-- 创建火鸟门户数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS huoniao;

-- 创建AI智能体数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS ai_agents;

-- 创建非root用户（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'n8n_user') THEN
        CREATE ROLE n8n_user WITH LOGIN PASSWORD 'n8n_user_password';
    END IF;
END
$$;

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n_user;
GRANT ALL PRIVILEGES ON DATABASE huoniao TO n8n_user;
GRANT ALL PRIVILEGES ON DATABASE ai_agents TO n8n_user;

-- 创建扩展
\c n8n;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c huoniao;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c ai_agents;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 创建AI智能体相关表结构
CREATE TABLE IF NOT EXISTS agent_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    agent_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    error_message TEXT,
    execution_data JSONB DEFAULT '{}',
    agent_session_id UUID REFERENCES agent_sessions(id)
);

CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    embedding VECTOR(1536),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS agent_learning_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_type VARCHAR(50) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL,
    input_data JSONB NOT NULL,
    output_data JSONB NOT NULL,
    feedback_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_agent_sessions_type ON agent_sessions(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_agent_learning_data_type ON agent_learning_data(agent_type);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_agent_sessions_updated_at 
    BEFORE UPDATE ON agent_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at 
    BEFORE UPDATE ON knowledge_base 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入初始数据
INSERT INTO knowledge_base (title, content, category, tags) VALUES
('N8N工作流最佳实践', 'N8N工作流设计的最佳实践包括：1. 使用清晰的节点命名；2. 添加适当的错误处理；3. 使用变量管理配置；4. 定期备份工作流。', 'best_practices', ARRAY['n8n', 'workflow', 'best_practices']),
('AI智能体系统架构', 'AI智能体系统采用微服务架构，包括执行官智能体、教学老师智能体和分析师智能体。每个智能体都有独立的职责和功能。', 'architecture', ARRAY['ai', 'agents', 'architecture']),
('火鸟门户集成指南', '火鸟门户系统提供RESTful API接口，支持用户管理、数据查询和工作流触发等功能。集成时需要配置API密钥和端点地址。', 'integration', ARRAY['huoniao', 'portal', 'api'])
ON CONFLICT DO NOTHING;

COMMIT;