# 🚀 N8N 自动化平台部署指南

本文档提供了 N8N 自动化平台的详细部署指南，包括环境准备、配置说明、部署步骤和故障排除。

## 📋 部署前准备

### 系统要求

| 组件 | 最低要求 | 推荐配置 |
|------|----------|----------|
| CPU | 2 核心 | 4 核心 |
| 内存 | 4GB | 8GB |
| 磁盘 | 20GB | 50GB |
| 操作系统 | Linux/macOS | Ubuntu 20.04+ |

### 依赖软件

```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

## ⚙️ 环境配置

### 1. 环境变量配置

复制并编辑环境变量文件：

```bash
cp .env.example .env
```

关键配置项说明：

```bash
# === 数据库配置 ===
POSTGRES_DB=n8n
POSTGRES_USER=n8n
POSTGRES_PASSWORD=your_secure_password_here  # 必须修改

# === Redis 配置 ===
REDIS_PASSWORD=your_redis_password_here      # 必须修改

# === N8N 配置 ===
N8N_ENCRYPTION_KEY=your_encryption_key_here  # 必须修改，至少32字符
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http

# === 监控配置 ===
GF_SECURITY_ADMIN_PASSWORD=your_grafana_password  # Grafana 管理员密码

# === 安全配置 ===
GENERIC_TIMEZONE=Asia/Shanghai
```

### 2. 安全密钥生成

```bash
# 生成 N8N 加密密钥
openssl rand -base64 32

# 生成安全密码
openssl rand -base64 16
```

### 3. 目录权限设置

```bash
# 创建必要目录
mkdir -p logs backups/database backups/config backups/logs

# 设置权限
chmod 755 scripts/*.sh
chown -R 1000:1000 logs backups
```

## 🚀 部署步骤

### 方式一：一键部署（推荐）

```bash
# 执行部署脚本
./scripts/deploy.sh
```

部署脚本会自动执行以下步骤：
1. 检查系统要求和依赖
2. 验证环境配置
3. 停止现有服务
4. 拉取最新镜像
5. 启动所有服务
6. 执行健康检查
7. 显示访问信息

### 方式二：手动部署

```bash
# 1. 拉取镜像
docker-compose pull

# 2. 启动数据库服务
docker-compose up -d postgres redis

# 3. 等待数据库就绪
sleep 30

# 4. 启动 N8N 服务
docker-compose up -d n8n

# 5. 启动监控服务
docker-compose up -d prometheus grafana elasticsearch kibana

# 6. 启动监控导出器
docker-compose up -d postgres-exporter redis-exporter

# 7. 启动 AI 智能体系统
docker-compose up -d ai-agent-system
```

## 🔍 部署验证

### 1. 服务状态检查

```bash
# 检查所有服务状态
docker-compose ps

# 检查服务日志
docker-compose logs -f --tail=100
```

### 2. 健康检查

```bash
# N8N 服务
curl -f http://localhost:5678

# Grafana 服务
curl -f http://localhost:3000

# Prometheus 服务
curl -f http://localhost:9090

# 数据库连接
docker exec n8n-postgres pg_isready -U n8n -d n8n

# Redis 连接
docker exec n8n-redis redis-cli -a "${REDIS_PASSWORD}" ping
```

### 3. 监控指标验证

```bash
# 检查 Prometheus 目标状态
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'

# 检查监控导出器
curl -f http://localhost:9187/metrics  # PostgreSQL 导出器
curl -f http://localhost:9121/metrics  # Redis 导出器
```

## 📊 服务访问

部署完成后，可以通过以下地址访问各项服务：

| 服务 | 地址 | 默认账号 |
|------|------|----------|
| N8N 工作流平台 | http://localhost:5678 | 首次访问需设置 |
| Grafana 监控 | http://localhost:3000 | admin/admin |
| Prometheus | http://localhost:9090 | 无需认证 |
| Kibana | http://localhost:5601 | 无需认证 |
| Elasticsearch | http://localhost:9200 | 无需认证 |

## 🔧 配置优化

### 1. 性能调优

根据实际负载调整资源限制：

```yaml
# docker-compose.yml 中的资源配置
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
    reservations:
      memory: 1G
      cpus: '0.5'
```

### 2. 数据库优化

PostgreSQL 性能优化：

```yaml
# 在 postgres 服务中添加
command: >
  postgres
  -c max_connections=200
  -c shared_buffers=256MB
  -c effective_cache_size=1GB
  -c maintenance_work_mem=64MB
  -c checkpoint_completion_target=0.9
  -c wal_buffers=16MB
  -c default_statistics_target=100
```

### 3. Redis 优化

```yaml
# Redis 配置优化
command: >
  redis-server
  --maxmemory 512mb
  --maxmemory-policy allkeys-lru
  --save 900 1
  --save 300 10
  --save 60 10000
```

## 🔒 安全加固

### 1. 网络安全

```bash
# 配置防火墙（Ubuntu/CentOS）
sudo ufw allow 22/tcp
sudo ufw allow 5678/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
```

### 2. SSL/TLS 配置

使用 Nginx 反向代理配置 HTTPS：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. 访问控制

```bash
# 限制数据库访问
# 在 docker-compose.yml 中移除不必要的端口映射
# ports:
#   - "5432:5432"  # 注释掉外部访问
```

## 🔄 备份策略

### 1. 自动备份配置

```bash
# 添加定时任务
crontab -e

# 每天凌晨2点执行备份
0 2 * * * /path/to/N8N-自动化/scripts/backup.sh >> /var/log/n8n-backup.log 2>&1
```

### 2. 备份验证

```bash
# 验证备份文件
./scripts/backup.sh

# 检查备份文件
ls -la backups/database/
ls -la backups/config/
```

## 🚨 故障排除

### 常见问题及解决方案

#### 1. 服务启动失败

```bash
# 问题：容器启动失败
# 解决：检查日志和资源
docker-compose logs <service_name>
docker system df
docker system prune -f
```

#### 2. 数据库连接失败

```bash
# 问题：N8N 无法连接数据库
# 解决：检查数据库状态和配置
docker exec n8n-postgres pg_isready -U n8n -d n8n
docker logs n8n-postgres
```

#### 3. 监控数据缺失

```bash
# 问题：Grafana 无监控数据
# 解决：检查 Prometheus 配置
curl http://localhost:9090/api/v1/targets
docker-compose restart prometheus grafana
```

#### 4. 内存不足

```bash
# 问题：系统内存不足
# 解决：调整资源限制或增加交换空间
free -h
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 日志分析

```bash
# 查看系统日志
journalctl -u docker -f

# 查看容器日志
docker-compose logs -f --tail=100 n8n
docker-compose logs -f --tail=100 postgres
docker-compose logs -f --tail=100 redis

# 查看资源使用
docker stats
```

## 📞 技术支持

如遇到部署问题，请按以下步骤收集信息：

1. 系统信息：`uname -a`
2. Docker 版本：`docker --version`
3. 服务状态：`docker-compose ps`
4. 错误日志：`docker-compose logs`
5. 资源使用：`docker stats`

将以上信息提交到项目 Issue 中，我们会及时提供支持。