-- N8N企业级自动化工作流平台 - 权限设置脚本
-- 配置数据库用户权限和安全策略

-- 连接到n8n数据库
\c n8n;

-- 创建应用专用角色
CREATE ROLE IF NOT EXISTS n8n_app_role;
CREATE ROLE IF NOT EXISTS n8n_readonly_role;
CREATE ROLE IF NOT EXISTS n8n_admin_role;

-- 为应用角色授予权限
GRANT CONNECT ON DATABASE n8n TO n8n_app_role;
GRANT USAGE ON SCHEMA public TO n8n_app_role;
GRANT CREATE ON SCHEMA public TO n8n_app_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO n8n_app_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO n8n_app_role;

-- 为只读角色授予权限
GRANT CONNECT ON DATABASE n8n TO n8n_readonly_role;
GRANT USAGE ON SCHEMA public TO n8n_readonly_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO n8n_readonly_role;

-- 为管理员角色授予权限
GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n_admin_role;
GRANT ALL PRIVILEGES ON SCHEMA public TO n8n_admin_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO n8n_admin_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO n8n_admin_role;

-- 将用户分配到角色
GRANT n8n_app_role TO n8n_user;

-- 设置默认权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO n8n_app_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO n8n_app_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO n8n_readonly_role;

-- 连接到ai_agents数据库
\c ai_agents;

-- 为AI智能体数据库设置权限
GRANT CONNECT ON DATABASE ai_agents TO n8n_app_role;
GRANT USAGE ON SCHEMA public TO n8n_app_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO n8n_app_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO n8n_app_role;

-- 设置行级安全策略
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_learning_data ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
CREATE POLICY agent_sessions_policy ON agent_sessions
    FOR ALL TO n8n_app_role
    USING (true);

CREATE POLICY workflow_executions_policy ON workflow_executions
    FOR ALL TO n8n_app_role
    USING (true);

CREATE POLICY knowledge_base_policy ON knowledge_base
    FOR ALL TO n8n_app_role
    USING (true);

CREATE POLICY agent_learning_data_policy ON agent_learning_data
    FOR ALL TO n8n_app_role
    USING (true);

-- 连接到huoniao数据库
\c huoniao;

-- 为火鸟门户数据库设置权限
GRANT CONNECT ON DATABASE huoniao TO n8n_app_role;
GRANT USAGE ON SCHEMA public TO n8n_app_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO n8n_app_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO n8n_app_role;

-- 创建火鸟门户基础表结构
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '{}',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 创建触发器
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认管理员用户
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@huoniao.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/A5/jF3kkS', '系统管理员', 'admin')
ON CONFLICT (username) DO NOTHING;

COMMIT;