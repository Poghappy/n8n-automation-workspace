-- N8N企业级自动化工作流平台 - 索引优化脚本
-- 创建高性能索引以优化查询性能

-- 连接到n8n数据库
\c n8n;

-- N8N核心表索引优化
-- 工作流执行历史索引
CREATE INDEX IF NOT EXISTS idx_execution_entity_workflow_id ON execution_entity(workflowId);
CREATE INDEX IF NOT EXISTS idx_execution_entity_status ON execution_entity(status);
CREATE INDEX IF NOT EXISTS idx_execution_entity_started_at ON execution_entity(startedAt);
CREATE INDEX IF NOT EXISTS idx_execution_entity_finished_at ON execution_entity(finishedAt);
CREATE INDEX IF NOT EXISTS idx_execution_entity_mode ON execution_entity(mode);
CREATE INDEX IF NOT EXISTS idx_execution_entity_workflow_status ON execution_entity(workflowId, status);

-- 工作流数据索引
CREATE INDEX IF NOT EXISTS idx_workflow_entity_active ON workflow_entity(active);
CREATE INDEX IF NOT EXISTS idx_workflow_entity_name ON workflow_entity(name);
CREATE INDEX IF NOT EXISTS idx_workflow_entity_created_at ON workflow_entity(createdAt);
CREATE INDEX IF NOT EXISTS idx_workflow_entity_updated_at ON workflow_entity(updatedAt);

-- 凭据索引
CREATE INDEX IF NOT EXISTS idx_credentials_entity_name ON credentials_entity(name);
CREATE INDEX IF NOT EXISTS idx_credentials_entity_type ON credentials_entity(type);

-- 用户索引
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_global_role ON "user"(globalRoleId);

-- 设置索引
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- 连接到ai_agents数据库
\c ai_agents;

-- AI智能体系统索引优化
-- 智能体会话索引
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id ON agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_created_at ON agent_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_updated_at ON agent_sessions(updated_at);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_status ON agent_sessions(user_id, status);

-- 工作流执行索引
CREATE INDEX IF NOT EXISTS idx_workflow_executions_session_id ON workflow_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_completed_at ON workflow_executions(completed_at);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_session_status ON workflow_executions(session_id, status);

-- 知识库索引
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at ON knowledge_base(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_updated_at ON knowledge_base(updated_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category_tags ON knowledge_base(category) WHERE tags IS NOT NULL;

-- 向量搜索索引（如果使用pgvector扩展）
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 全文搜索索引
CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_fts ON knowledge_base USING GIN(to_tsvector('chinese', content));
CREATE INDEX IF NOT EXISTS idx_knowledge_base_title_fts ON knowledge_base USING GIN(to_tsvector('chinese', title));

-- 智能体学习数据索引
CREATE INDEX IF NOT EXISTS idx_agent_learning_data_session_id ON agent_learning_data(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_learning_data_interaction_type ON agent_learning_data(interaction_type);
CREATE INDEX IF NOT EXISTS idx_agent_learning_data_created_at ON agent_learning_data(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_learning_data_feedback_score ON agent_learning_data(feedback_score) WHERE feedback_score IS NOT NULL;

-- 复合索引优化
CREATE INDEX IF NOT EXISTS idx_agent_learning_session_type ON agent_learning_data(session_id, interaction_type);
CREATE INDEX IF NOT EXISTS idx_agent_learning_type_score ON agent_learning_data(interaction_type, feedback_score) WHERE feedback_score IS NOT NULL;

-- 连接到huoniao数据库
\c huoniao;

-- 火鸟门户系统索引优化
-- 用户索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);
CREATE INDEX IF NOT EXISTS idx_users_status_role ON users(status, role);

-- 用户会话索引
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_expires ON user_sessions(user_id, expires_at);

-- API密钥索引
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_last_used ON api_keys(last_used_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_active ON api_keys(user_id, is_active);

-- 审计日志索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);

-- 复合索引优化
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_date ON audit_logs(action, created_at);

-- JSONB字段索引优化
CREATE INDEX IF NOT EXISTS idx_users_metadata ON users USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_api_keys_permissions ON api_keys USING GIN(permissions);
CREATE INDEX IF NOT EXISTS idx_audit_logs_details ON audit_logs USING GIN(details);

-- 分区表索引（如果使用分区）
-- 按月分区的审计日志索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_monthly ON audit_logs(created_at, user_id) WHERE created_at >= CURRENT_DATE - INTERVAL '1 month';

-- 性能监控视图
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 表大小监控视图
CREATE OR REPLACE VIEW table_size_stats AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- 索引使用率监控
CREATE OR REPLACE VIEW unused_indexes AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;

COMMIT;