# 部署指南

## 概述

本文档提供N8N企业级自动化工作流平台的完整部署指南，包括Docker部署、本地开发环境搭建、生产环境配置等内容。

## 目录

1. [系统要求](#系统要求)
2. [Docker部署](#docker部署)
3. [本地开发部署](#本地开发部署)
4. [生产环境部署](#生产环境部署)
5. [配置管理](#配置管理)
6. [安全配置](#安全配置)
7. [监控与日志](#监控与日志)
8. [故障排除](#故障排除)

## 系统要求

### 最低配置
- **CPU**: 2核心
- **内存**: 4GB RAM
- **存储**: 20GB 可用空间
- **操作系统**: Linux/macOS/Windows
- **Docker**: 20.10+ 或 Docker Desktop

### 推荐配置
- **CPU**: 4核心或更多
- **内存**: 8GB RAM 或更多
- **存储**: 50GB SSD
- **网络**: 稳定的互联网连接
- **数据库**: PostgreSQL 12+ 或 MySQL 8.0+

### 软件依赖
```bash
# 必需软件
- Docker 20.10+
- Docker Compose 2.0+
- Git 2.30+

# 可选软件
- Node.js 18+ (本地开发)
- PostgreSQL 12+ (生产环境)
- Redis 6.0+ (缓存和队列)
- Nginx (反向代理)
```

## Docker部署

### 快速启动

#### 1. 克隆项目
```bash
git clone https://github.com/your-org/n8n-automation.git
cd n8n-automation
```

#### 2. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
vim .env
```

#### 3. 启动服务
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f n8n
```

### Docker Compose 配置

#### 基础配置 (docker-compose.yml)
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=${WEBHOOK_URL}
      - GENERIC_TIMEZONE=${TIMEZONE}
    volumes:
      - n8n_data:/home/node/.n8n
      - ./workflows:/home/node/.n8n/workflows
      - ./credentials:/home/node/.n8n/credentials
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:13
    container_name: n8n_postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:6-alpine
    container_name: n8n_redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  ai-agent:
    build: ./ai-agent
    container_name: n8n_ai_agent
    restart: unless-stopped
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - N8N_API_URL=http://n8n:5678
      - REDIS_URL=redis://redis:6379
    depends_on:
      - n8n
      - redis
    ports:
      - "8000:8000"

volumes:
  n8n_data:
  postgres_data:
  redis_data:

networks:
  default:
    name: n8n_network
```

#### 生产环境配置 (docker-compose.prod.yml)
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    environment:
      - N8N_BASIC_AUTH_ACTIVE=false
      - N8N_JWT_AUTH_ACTIVE=true
      - N8N_JWT_AUTH_HEADER=authorization
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${POSTGRES_DB}
      - DB_POSTGRESDB_USER=${POSTGRES_USER}
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - N8N_METRICS=true
      - N8N_LOG_LEVEL=info
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - n8n_network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(`n8n.yourdomain.com`)"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - n8n
    networks:
      - n8n_network
```

### 环境变量配置

#### .env 文件示例
```bash
# N8N 基础配置
N8N_USER=admin
N8N_PASSWORD=your_secure_password
N8N_HOST=localhost
N8N_ENCRYPTION_KEY=your_encryption_key_32_chars
WEBHOOK_URL=http://localhost:5678/

# 数据库配置
POSTGRES_DB=n8n
POSTGRES_USER=n8n
POSTGRES_PASSWORD=your_db_password

# Redis 配置
REDIS_PASSWORD=your_redis_password

# AI 智能体配置
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# 系统配置
TIMEZONE=Asia/Shanghai
NODE_ENV=production

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password

# 监控配置
PROMETHEUS_ENABLED=true
GRAFANA_ADMIN_PASSWORD=your_grafana_password
```

## 本地开发部署

### 开发环境搭建

#### 1. 安装依赖
```bash
# 安装 Node.js (推荐使用 nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 安装 pnpm
npm install -g pnpm

# 克隆项目
git clone https://github.com/your-org/n8n-automation.git
cd n8n-automation

# 安装项目依赖
pnpm install
```

#### 2. 数据库设置
```bash
# 启动 PostgreSQL (使用 Docker)
docker run --name n8n-postgres \
  -e POSTGRES_DB=n8n \
  -e POSTGRES_USER=n8n \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:13

# 启动 Redis
docker run --name n8n-redis \
  -p 6379:6379 \
  -d redis:6-alpine
```

#### 3. 配置环境变量
```bash
# 创建开发环境配置
cp .env.development.example .env.development

# 编辑配置文件
vim .env.development
```

#### 4. 启动开发服务
```bash
# 启动 N8N
pnpm dev:n8n

# 启动 AI 智能体服务
pnpm dev:ai-agent

# 启动前端开发服务器
pnpm dev:frontend
```

### 开发工具配置

#### VS Code 配置
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": ["packages/*"]
}
```

#### 调试配置
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug N8N",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/packages/cli/bin/n8n",
      "args": ["start"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

## 生产环境部署

### 服务器准备

#### 1. 系统配置
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要软件
sudo apt install -y curl wget git vim htop

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. 防火墙配置
```bash
# 配置 UFW 防火墙
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5678/tcp  # N8N 端口
```

#### 3. SSL 证书配置
```bash
# 安装 Certbot
sudo apt install -y certbot

# 获取 SSL 证书
sudo certbot certonly --standalone -d n8n.yourdomain.com

# 设置自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 高可用部署

#### 负载均衡配置
```nginx
# nginx/nginx.conf
upstream n8n_backend {
    server n8n-1:5678;
    server n8n-2:5678;
    server n8n-3:5678;
}

server {
    listen 80;
    server_name n8n.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name n8n.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    location / {
        proxy_pass http://n8n_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### 数据库集群
```yaml
# docker-compose.cluster.yml
services:
  postgres-master:
    image: postgres:13
    environment:
      - POSTGRES_REPLICATION_MODE=master
      - POSTGRES_REPLICATION_USER=replicator
      - POSTGRES_REPLICATION_PASSWORD=replicator_password
    volumes:
      - postgres_master_data:/var/lib/postgresql/data

  postgres-slave:
    image: postgres:13
    environment:
      - POSTGRES_REPLICATION_MODE=slave
      - POSTGRES_REPLICATION_USER=replicator
      - POSTGRES_REPLICATION_PASSWORD=replicator_password
      - POSTGRES_MASTER_HOST=postgres-master
    depends_on:
      - postgres-master
```

## 配置管理

### N8N 核心配置

#### 基础配置文件
```json
// config/default.json
{
  "database": {
    "type": "postgresdb",
    "postgresdb": {
      "host": "localhost",
      "port": 5432,
      "database": "n8n",
      "user": "n8n",
      "password": "password"
    }
  },
  "credentials": {
    "overwrite": {
      "data": "keep"
    }
  },
  "executions": {
    "saveDataOnError": "all",
    "saveDataOnSuccess": "none",
    "saveDataManualExecutions": true
  },
  "queue": {
    "bull": {
      "redis": {
        "host": "localhost",
        "port": 6379
      }
    }
  }
}
```

#### 工作流配置
```javascript
// workflows/config.js
module.exports = {
  // 全局工作流设置
  global: {
    timezone: 'Asia/Shanghai',
    maxExecutionTimeout: 3600,
    saveDataOnError: true,
    saveDataOnSuccess: false
  },
  
  // 节点默认配置
  nodes: {
    httpRequest: {
      timeout: 30000,
      followRedirect: true,
      ignoreHttpStatusErrors: false
    },
    function: {
      timeout: 10000
    }
  },
  
  // 错误处理配置
  errorHandling: {
    continueOnFail: false,
    retryOnFail: 3,
    waitBetweenTries: 1000
  }
};
```

### AI 智能体配置

#### 智能体服务配置
```yaml
# ai-agent/config.yml
server:
  host: 0.0.0.0
  port: 8000
  workers: 4

ai_models:
  openai:
    api_key: ${OPENAI_API_KEY}
    model: gpt-4
    max_tokens: 2000
    temperature: 0.7
  
  anthropic:
    api_key: ${ANTHROPIC_API_KEY}
    model: claude-3-sonnet
    max_tokens: 2000

agents:
  executor:
    name: "执行官智能体"
    model: "openai"
    system_prompt: "你是一个专业的工作流执行专家..."
    
  teacher:
    name: "教学老师智能体"
    model: "anthropic"
    system_prompt: "你是一个耐心的技术导师..."
    
  analyst:
    name: "分析师智能体"
    model: "openai"
    system_prompt: "你是一个数据分析专家..."

redis:
  host: redis
  port: 6379
  db: 0
  
logging:
  level: INFO
  format: json
```

## 安全配置

### 认证与授权

#### JWT 认证配置
```bash
# 生成 JWT 密钥
openssl rand -base64 32

# 环境变量配置
N8N_JWT_AUTH_ACTIVE=true
N8N_JWT_AUTH_HEADER=authorization
N8N_JWT_SECRET=your_jwt_secret_key
```

#### OAuth 集成
```javascript
// config/oauth.js
module.exports = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectUri: process.env.GITHUB_REDIRECT_URI
  }
};
```

### 网络安全

#### 防火墙规则
```bash
# iptables 规则
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5678 -s 10.0.0.0/8 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

#### 速率限制
```nginx
# nginx 速率限制
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://n8n_backend;
        }
    }
}
```

### 数据加密

#### 数据库加密
```sql
-- PostgreSQL 透明数据加密
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 加密敏感字段
ALTER TABLE credentials 
ADD COLUMN encrypted_data bytea;

UPDATE credentials 
SET encrypted_data = pgp_sym_encrypt(data, 'encryption_key');
```

#### 传输加密
```yaml
# docker-compose 中的 TLS 配置
services:
  n8n:
    environment:
      - N8N_PROTOCOL=https
      - N8N_SSL_KEY=/certs/privkey.pem
      - N8N_SSL_CERT=/certs/fullchain.pem
    volumes:
      - ./certs:/certs:ro
```

## 监控与日志

### Prometheus 监控

#### 配置文件
```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'n8n'
    static_configs:
      - targets: ['n8n:5678']
    metrics_path: '/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
      
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

#### Grafana 仪表板
```json
{
  "dashboard": {
    "title": "N8N 监控仪表板",
    "panels": [
      {
        "title": "工作流执行次数",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(n8n_workflow_executions_total[5m])"
          }
        ]
      },
      {
        "title": "执行成功率",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(n8n_workflow_executions_success[5m]) / rate(n8n_workflow_executions_total[5m]) * 100"
          }
        ]
      }
    ]
  }
}
```

### 日志管理

#### 日志配置
```yaml
# logging/logback.xml
<configuration>
  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder">
      <providers>
        <timestamp/>
        <logLevel/>
        <loggerName/>
        <message/>
        <mdc/>
      </providers>
    </encoder>
  </appender>
  
  <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>/var/log/n8n/n8n.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
      <fileNamePattern>/var/log/n8n/n8n.%d{yyyy-MM-dd}.gz</fileNamePattern>
      <maxHistory>30</maxHistory>
    </rollingPolicy>
  </appender>
  
  <root level="INFO">
    <appender-ref ref="STDOUT"/>
    <appender-ref ref="FILE"/>
  </root>
</configuration>
```

#### ELK Stack 集成
```yaml
# docker-compose.logging.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    
  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      
  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

## 故障排除

### 常见问题

#### 1. 容器启动失败
```bash
# 检查容器状态
docker-compose ps

# 查看容器日志
docker-compose logs n8n

# 检查端口占用
netstat -tulpn | grep :5678

# 重启服务
docker-compose restart n8n
```

#### 2. 数据库连接问题
```bash
# 测试数据库连接
docker exec -it n8n_postgres psql -U n8n -d n8n

# 检查数据库日志
docker-compose logs postgres

# 重置数据库密码
docker exec -it n8n_postgres psql -U postgres -c "ALTER USER n8n PASSWORD 'new_password';"
```

#### 3. 工作流执行失败
```bash
# 检查 N8N 日志
docker-compose logs -f n8n

# 检查系统资源
docker stats

# 清理执行历史
docker exec -it n8n n8n execute --help
```

### 性能优化

#### 数据库优化
```sql
-- PostgreSQL 性能优化
-- 创建索引
CREATE INDEX idx_executions_workflow_id ON executions(workflowId);
CREATE INDEX idx_executions_started_at ON executions(startedAt);

-- 清理旧数据
DELETE FROM executions WHERE startedAt < NOW() - INTERVAL '30 days';

-- 分析表统计信息
ANALYZE executions;
```

#### 内存优化
```yaml
# docker-compose.yml 中的资源限制
services:
  n8n:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
```

### 备份与恢复

#### 数据备份
```bash
#!/bin/bash
# backup.sh

# 备份数据库
docker exec n8n_postgres pg_dump -U n8n n8n > backup_$(date +%Y%m%d_%H%M%S).sql

# 备份工作流文件
docker cp n8n:/home/node/.n8n/workflows ./backup/workflows_$(date +%Y%m%d_%H%M%S)

# 备份凭证文件
docker cp n8n:/home/node/.n8n/credentials ./backup/credentials_$(date +%Y%m%d_%H%M%S)

# 上传到云存储
aws s3 cp backup/ s3://your-backup-bucket/ --recursive
```

#### 数据恢复
```bash
#!/bin/bash
# restore.sh

# 恢复数据库
docker exec -i n8n_postgres psql -U n8n n8n < backup_20240101_120000.sql

# 恢复工作流文件
docker cp ./backup/workflows_20240101_120000 n8n:/home/node/.n8n/workflows

# 重启服务
docker-compose restart n8n
```

## 升级指南

### 版本升级

#### 1. 准备工作
```bash
# 备份当前数据
./scripts/backup.sh

# 检查当前版本
docker exec n8n n8n --version

# 下载新版本配置
git pull origin main
```

#### 2. 执行升级
```bash
# 停止服务
docker-compose down

# 更新镜像
docker-compose pull

# 启动新版本
docker-compose up -d

# 检查服务状态
docker-compose ps
```

#### 3. 验证升级
```bash
# 检查版本
docker exec n8n n8n --version

# 测试基本功能
curl http://localhost:5678/healthz

# 检查工作流
docker-compose logs n8n | grep "Workflow"
```

---

**版本**: v1.0.0  
**更新时间**: 2024-01-01  
**维护者**: DevOps Team