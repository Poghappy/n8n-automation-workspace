# N8N自动化系统迁移操作手册

## 📋 概述

本手册提供了完整的N8N自动化系统迁移指南，帮助您在更换电脑时快速重建和部署N8N系统。整个迁移过程分为三个主要阶段：**数据导出**、**新环境部署**和**数据恢复**。

## 🎯 迁移目标

- ✅ 完整保留所有N8N工作流和配置
- ✅ 保持数据库数据完整性
- ✅ 迁移所有自定义配置和脚本
- ✅ 确保SSL证书和安全配置正确
- ✅ 验证系统功能完整性

## 📦 系统要求

### 硬件要求
- **CPU**: 2核心以上（推荐4核心）
- **内存**: 4GB以上（推荐8GB）
- **存储**: 20GB可用空间（推荐50GB）
- **网络**: 稳定的互联网连接

### 软件要求
- **操作系统**: macOS 10.15+, Ubuntu 18.04+, CentOS 7+
- **Docker**: 20.10.0+
- **Docker Compose**: 1.29.0+
- **Git**: 2.20.0+
- **curl**: 7.0+
- **jq**: 1.6+（用于JSON处理）

## 🔧 准备工作

### 1. 环境检查清单

在开始迁移前，请确认以下项目：

- [ ] 当前N8N系统运行正常
- [ ] 有足够的磁盘空间存储备份文件
- [ ] 网络连接稳定
- [ ] 已安装必要的工具软件
- [ ] 备份加密密钥已记录

### 2. 重要信息收集

请记录以下关键信息：

```bash
# 系统信息
域名: ________________
协议: ________________
端口: ________________
数据库密码: ________________
Redis密码: ________________
N8N加密密钥: ________________
JWT密钥: ________________
```

## 📤 阶段一：数据导出（旧电脑）

### 1.1 执行配置导出

在旧电脑上执行以下命令：

```bash
# 进入项目目录
cd /path/to/your/n8n-project

# 执行配置导出脚本
./scripts/export_n8n_config.sh
```

**预期输出**：
```
[INFO] 开始导出N8N配置...
[SUCCESS] Docker配置导出完成
[SUCCESS] N8N数据导出完成
[SUCCESS] 数据库备份完成
[SUCCESS] 脚本和文档导出完成
[SUCCESS] 配置打包完成: n8n_config_export_20240115_143022.tar.gz
```

### 1.2 创建完整备份

```bash
# 创建完整系统备份
./scripts/backup_restore.sh full-backup
```

**预期输出**：
```
[SUCCESS] 完整备份完成!
[INFO] 备份文件: /path/to/backups/full/n8n_full_backup_20240115_143500.tar.gz
[INFO] 文件大小: 2.3G
[INFO] 校验和: a1b2c3d4e5f6...
```

### 1.3 验证备份完整性

```bash
# 验证备份文件
./scripts/backup_restore.sh verify /path/to/backup/file.tar.gz
```

### 1.4 传输备份文件

将以下文件传输到新电脑：

1. **配置导出文件**: `n8n_config_export_*.tar.gz`
2. **完整备份文件**: `n8n_full_backup_*.tar.gz`
3. **环境配置文件**: `.env`（如果包含敏感信息，请安全传输）

**传输方式选择**：
- 🔒 **安全传输**: 使用加密U盘、安全云存储
- 🌐 **网络传输**: SCP、SFTP、安全的文件共享服务
- 💾 **本地传输**: 外部硬盘、网络存储

## 🚀 阶段二：新环境部署（新电脑）

### 2.1 系统环境准备

#### 安装Docker和Docker Compose

**macOS**:
```bash
# 安装Docker Desktop
# 下载并安装: https://www.docker.com/products/docker-desktop

# 验证安装
docker --version
docker-compose --version
```

**Ubuntu/Debian**:
```bash
# 更新包索引
sudo apt update

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

#### 安装必要工具

```bash
# macOS
brew install git curl jq

# Ubuntu/Debian
sudo apt install git curl jq

# CentOS/RHEL
sudo yum install git curl jq
```

### 2.2 解压配置文件

```bash
# 创建项目目录
mkdir -p ~/n8n-automation
cd ~/n8n-automation

# 解压配置导出文件
tar -xzf /path/to/n8n_config_export_*.tar.gz

# 设置脚本执行权限
chmod +x scripts/*.sh
```

### 2.3 执行一键部署

```bash
# 运行一键部署脚本
./scripts/deploy_n8n.sh
```

**部署过程说明**：

1. **系统检查** (1-2分钟)
   - 检查系统要求
   - 验证Docker安装
   - 检查端口占用

2. **环境配置** (2-3分钟)
   - 创建项目结构
   - 生成安全配置
   - 创建环境文件

3. **服务部署** (5-10分钟)
   - 拉取Docker镜像
   - 创建数据卷
   - 启动服务容器

4. **SSL配置** (1-2分钟)
   - 生成SSL证书
   - 配置Nginx

5. **系统验证** (1-2分钟)
   - 检查服务状态
   - 验证网络连接

**预期输出**：
```
[SUCCESS] 系统要求检查通过
[SUCCESS] Docker环境验证完成
[SUCCESS] 项目结构创建完成
[SUCCESS] 环境配置完成
[SUCCESS] Docker服务启动完成
[SUCCESS] SSL证书配置完成
[SUCCESS] 系统部署完成!

🎉 N8N系统部署成功!
📱 访问地址: https://your-domain.com
🔐 管理员账号: admin
🔑 初始密码: [随机生成的密码]
```

### 2.4 验证基础服务

```bash
# 检查服务状态
docker-compose ps

# 检查服务日志
docker-compose logs -f n8n

# 测试网络连接
curl -k https://localhost/healthz
```

## 🔄 阶段三：数据恢复

### 3.1 恢复系统数据

```bash
# 停止N8N服务（保持数据库和Redis运行）
docker-compose stop n8n

# 恢复完整备份
./scripts/backup_restore.sh restore /path/to/n8n_full_backup_*.tar.gz
```

**恢复过程**：
1. 解压备份文件
2. 恢复数据库数据
3. 恢复Redis缓存
4. 恢复N8N工作流数据
5. 恢复配置文件
6. 重启所有服务

### 3.2 验证数据完整性

#### 检查工作流

```bash
# 访问N8N界面
open https://your-domain.com

# 或使用curl检查
curl -k https://your-domain.com/api/v1/workflows
```

#### 检查数据库连接

```bash
# 连接数据库
docker exec -it n8n-postgres psql -U n8n -d n8n

# 检查表数据
\dt
SELECT COUNT(*) FROM workflow_entity;
SELECT COUNT(*) FROM credentials_entity;
\q
```

#### 检查Redis缓存

```bash
# 连接Redis
docker exec -it n8n-redis redis-cli

# 检查缓存数据
INFO keyspace
KEYS *
EXIT
```

### 3.3 功能验证清单

- [ ] N8N Web界面可正常访问
- [ ] 所有工作流都已恢复
- [ ] 凭据信息完整
- [ ] 定时任务正常运行
- [ ] Webhook端点响应正常
- [ ] 数据库连接正常
- [ ] Redis缓存工作正常
- [ ] SSL证书有效
- [ ] 日志记录正常

## 🔧 故障排除

### 常见问题及解决方案

#### 1. Docker服务启动失败

**症状**: 容器无法启动或频繁重启

**解决方案**:
```bash
# 检查Docker日志
docker-compose logs [service_name]

# 检查端口占用
netstat -tulpn | grep :5678
netstat -tulpn | grep :5432

# 重新构建容器
docker-compose down
docker-compose up --build -d
```

#### 2. 数据库连接失败

**症状**: N8N无法连接到PostgreSQL

**解决方案**:
```bash
# 检查数据库状态
docker exec n8n-postgres pg_isready -U n8n

# 重置数据库密码
docker exec -it n8n-postgres psql -U postgres
ALTER USER n8n PASSWORD 'new_password';
\q

# 更新环境变量
vim .env
# 修改 DB_POSTGRESDB_PASSWORD=new_password
```

#### 3. SSL证书问题

**症状**: HTTPS访问失败或证书警告

**解决方案**:
```bash
# 重新生成SSL证书
./scripts/generate_ssl.sh

# 检查证书有效期
openssl x509 -in config/ssl/cert.pem -text -noout

# 重启Nginx
docker-compose restart nginx
```

#### 4. 工作流执行失败

**症状**: 工作流无法正常执行

**解决方案**:
```bash
# 检查N8N日志
docker-compose logs n8n | tail -100

# 重启N8N服务
docker-compose restart n8n

# 检查工作流配置
# 登录N8N界面，检查节点配置和凭据
```

#### 5. 备份恢复失败

**症状**: 数据恢复过程中出错

**解决方案**:
```bash
# 验证备份文件完整性
./scripts/backup_restore.sh verify /path/to/backup.tar.gz

# 检查磁盘空间
df -h

# 手动恢复步骤
# 1. 解压备份文件到临时目录
# 2. 逐步恢复各个组件
# 3. 验证每个步骤的结果
```

### 日志文件位置

```bash
# N8N应用日志
docker-compose logs n8n

# Nginx访问日志
docker-compose logs nginx

# PostgreSQL日志
docker-compose logs postgres

# Redis日志
docker-compose logs redis

# 系统日志
tail -f /var/log/syslog  # Ubuntu
tail -f /var/log/messages  # CentOS
```

## 📊 性能优化

### 系统性能调优

#### Docker资源限制

编辑 `docker-compose.yml`:

```yaml
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

#### 数据库优化

```bash
# 连接数据库
docker exec -it n8n-postgres psql -U n8n -d n8n

# 优化配置
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

#### Redis优化

编辑Redis配置:

```bash
# 编辑Redis配置
docker exec -it n8n-redis redis-cli CONFIG SET maxmemory 512mb
docker exec -it n8n-redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### 监控和维护

#### 设置定期备份

```bash
# 添加到crontab
crontab -e

# 每日凌晨2点执行增量备份
0 2 * * * /path/to/n8n-project/scripts/backup_restore.sh incremental-backup

# 每周日凌晨1点执行完整备份
0 1 * * 0 /path/to/n8n-project/scripts/backup_restore.sh full-backup

# 每月清理旧备份
0 3 1 * * /path/to/n8n-project/scripts/backup_restore.sh cleanup
```

#### 健康检查脚本

创建 `scripts/health_check.sh`:

```bash
#!/bin/bash
# 健康检查脚本

# 检查服务状态
if ! curl -f -s http://localhost:5678/healthz > /dev/null; then
    echo "N8N服务异常，尝试重启..."
    docker-compose restart n8n
fi

# 检查磁盘空间
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "磁盘空间不足: ${DISK_USAGE}%"
    # 发送告警通知
fi
```

## 🔐 安全最佳实践

### 1. 密码和密钥管理

- 使用强密码（至少12位，包含大小写字母、数字、特殊字符）
- 定期轮换密钥和密码
- 使用密钥管理工具（如1Password、Bitwarden）
- 不要在代码中硬编码敏感信息

### 2. 网络安全

```bash
# 配置防火墙
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 5678/tcp   # 禁止直接访问N8N端口
```

### 3. SSL/TLS配置

- 使用有效的SSL证书（Let's Encrypt或商业证书）
- 启用HSTS（HTTP Strict Transport Security）
- 配置安全的加密套件
- 定期更新证书

### 4. 访问控制

- 启用N8N的用户认证
- 配置强密码策略
- 限制管理员账户数量
- 定期审查用户权限

## 📚 附录

### A. 环境变量参考

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| DOMAIN | 域名 | localhost | 是 |
| PROTOCOL | 协议 | http | 是 |
| N8N_PORT | N8N端口 | 5678 | 否 |
| DB_POSTGRESDB_PASSWORD | 数据库密码 | - | 是 |
| REDIS_PASSWORD | Redis密码 | - | 是 |
| N8N_ENCRYPTION_KEY | N8N加密密钥 | - | 是 |
| JWT_SECRET | JWT密钥 | - | 是 |

### B. 端口使用说明

| 端口 | 服务 | 描述 |
|------|------|------|
| 80 | Nginx | HTTP访问 |
| 443 | Nginx | HTTPS访问 |
| 5678 | N8N | N8N应用（内部） |
| 5432 | PostgreSQL | 数据库（内部） |
| 6379 | Redis | 缓存（内部） |

### C. 目录结构说明

```
n8n-automation/
├── .env                    # 环境变量配置
├── docker-compose.yml     # Docker编排文件
├── config/                 # 配置文件目录
│   ├── nginx/             # Nginx配置
│   └── ssl/               # SSL证书
├── scripts/               # 脚本文件
│   ├── deploy_n8n.sh     # 一键部署脚本
│   ├── backup_restore.sh  # 备份恢复脚本
│   └── export_n8n_config.sh # 配置导出脚本
├── backups/               # 备份文件目录
│   ├── full/              # 完整备份
│   ├── incremental/       # 增量备份
│   └── logs/              # 备份日志
└── logs/                  # 应用日志
```

### D. 常用命令速查

```bash
# 服务管理
docker-compose up -d        # 启动所有服务
docker-compose down         # 停止所有服务
docker-compose restart      # 重启所有服务
docker-compose ps           # 查看服务状态

# 日志查看
docker-compose logs -f n8n  # 查看N8N日志
docker-compose logs --tail=100 nginx # 查看最近100行Nginx日志

# 数据库操作
docker exec -it n8n-postgres psql -U n8n -d n8n  # 连接数据库

# 备份操作
./scripts/backup_restore.sh full-backup           # 完整备份
./scripts/backup_restore.sh incremental-backup    # 增量备份
./scripts/backup_restore.sh list                  # 列出备份

# 系统维护
docker system prune -f      # 清理Docker资源
docker volume prune -f      # 清理未使用的数据卷
```

## 📞 技术支持

如果在迁移过程中遇到问题，请按以下步骤获取帮助：

1. **查看日志**: 检查相关服务的日志文件
2. **参考故障排除**: 查看本手册的故障排除章节
3. **社区支持**: 访问N8N官方社区和文档
4. **专业支持**: 联系系统管理员或技术支持团队

### 有用的资源链接

- [N8N官方文档](https://docs.n8n.io/)
- [Docker官方文档](https://docs.docker.com/)
- [PostgreSQL文档](https://www.postgresql.org/docs/)
- [Nginx文档](https://nginx.org/en/docs/)

---

**版本**: 1.0.0  
**更新日期**: 2024年1月15日  
**作者**: N8N自动化系统团队

> 💡 **提示**: 建议在执行迁移前先在测试环境中验证整个流程，确保迁移过程顺利进行。