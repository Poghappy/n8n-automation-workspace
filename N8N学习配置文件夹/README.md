# N8N 学习配置文件夹

## 📖 简介

这是一个专门为学习N8N自动化工作流而创建的配置文件夹。包含了完整的N8N部署配置、详细的中文注释说明、学习指南和实践示例，帮助你快速掌握N8N的使用方法。

## 📁 文件夹结构

```
N8N学习配置文件夹/
├── 01-Docker配置文件/              # Docker部署相关配置
│   ├── docker-compose.yml         # 原始Docker配置文件
│   └── docker-compose-学习版-带中文注释.yml  # 带详细中文注释的配置文件
├── 02-环境变量配置/               # 环境变量配置文件
│   ├── .env                       # 原始环境变量文件
│   └── .env-学习版-带中文注释      # 带详细中文注释的环境变量文件
├── 03-N8N工作流文件/              # N8N工作流和模板
│   └── (工作流JSON文件)
├── 04-N8N凭据文件/               # N8N凭据配置
│   └── (凭据配置文件)
├── 05-数据库配置/                # 数据库相关配置
│   └── (数据库初始化脚本)
├── 06-脚本文件/                  # 部署和管理脚本
│   ├── deploy_n8n.sh            # 原始部署脚本
│   ├── deploy_n8n-学习版-带中文注释.sh  # 带详细中文注释的部署脚本
│   └── (其他管理脚本)
├── 07-Kubernetes配置/            # K8s部署配置
│   └── (K8s YAML文件)
├── 08-监控配置/                  # 监控和日志配置
│   └── (监控配置文件)
├── 09-学习文档/                  # 原始文档文件
│   └── (README等文档)
├── 10-学习指南/                  # 学习指南和教程
│   ├── N8N系统学习指南.md        # 完整的系统学习指南
│   ├── 配置文件详解.md           # 配置文件详细说明
│   ├── 快速入门指南.md           # 快速入门教程
│   └── 常见问题解答.md           # FAQ文档
└── README.md                     # 本文件
```

## 🚀 快速开始

### 1. 环境准备

确保你的系统已安装：
- Docker 20.10.0+
- Docker Compose 2.0.0+
- Git（可选）

### 2. 快速部署

**方法一：使用部署脚本（推荐）**
```bash
# 进入学习文件夹
cd N8N学习配置文件夹

# 运行部署脚本
chmod +x 06-脚本文件/deploy_n8n-学习版-带中文注释.sh
./06-脚本文件/deploy_n8n-学习版-带中文注释.sh
```

**方法二：手动部署**
```bash
# 复制配置文件
cp 01-Docker配置文件/docker-compose-学习版-带中文注释.yml docker-compose.yml
cp 02-环境变量配置/.env-学习版-带中文注释 .env

# 编辑配置（可选）
nano .env

# 启动服务
docker-compose up -d
```

### 3. 访问N8N

- 本地访问：http://localhost:5678
- 默认用户名：admin
- 默认密码：请查看.env文件中的配置

## 📚 学习路径

### 初学者（第1-2周）

1. **阅读基础文档**
   - [快速入门指南](10-学习指南/快速入门指南.md)
   - [配置文件详解](10-学习指南/配置文件详解.md)

2. **实践操作**
   - 部署N8N系统
   - 创建第一个工作流
   - 学习基本节点使用

3. **推荐练习**
   - 定时任务：每日天气通知
   - API集成：获取外部数据
   - 邮件自动化：发送通知邮件

### 进阶学习（第3-4周）

1. **深入学习**
   - [N8N系统学习指南](10-学习指南/N8N系统学习指南.md)
   - 复杂工作流设计
   - 错误处理和监控

2. **实践项目**
   - 数据同步工作流
   - 业务流程自动化
   - 多系统集成

3. **性能优化**
   - 系统性能调优
   - 大数据量处理
   - 监控和告警

### 高级应用（第5-8周）

1. **自定义开发**
   - 自定义节点开发
   - 复杂业务逻辑实现
   - 第三方系统集成

2. **企业级部署**
   - 高可用部署
   - 安全配置
   - 备份和恢复

## 🔧 配置说明

### 核心配置文件

| 文件 | 说明 | 学习版本 |
|------|------|----------|
| `docker-compose.yml` | Docker服务编排配置 | `docker-compose-学习版-带中文注释.yml` |
| `.env` | 环境变量配置 | `.env-学习版-带中文注释` |
| `deploy_n8n.sh` | 自动部署脚本 | `deploy_n8n-学习版-带中文注释.sh` |

### 重要配置项

```bash
# 基础配置
DOMAIN_NAME=localhost                    # 域名配置
N8N_PORT=5678                           # N8N端口
N8N_PROTOCOL=http                       # 协议类型

# 认证配置
N8N_BASIC_AUTH_ACTIVE=true              # 启用基础认证
N8N_BASIC_AUTH_USER=admin               # 管理员用户名
N8N_BASIC_AUTH_PASSWORD=your-password   # 管理员密码

# 数据库配置
POSTGRES_DB=n8n                        # 数据库名
POSTGRES_USER=n8n                      # 数据库用户
POSTGRES_PASSWORD=your-db-password      # 数据库密码
```

## 🛠️ 常用命令

### Docker管理
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f n8n

# 重启服务
docker-compose restart n8n
```

### 数据管理
```bash
# 备份数据库
docker-compose exec postgres pg_dump -U n8n n8n > backup.sql

# 恢复数据库
docker-compose exec postgres psql -U n8n -d n8n < backup.sql

# 导出工作流
docker-compose exec n8n n8n export:workflow --all --output=/backup/

# 导入工作流
docker-compose exec n8n n8n import:workflow --input=/backup/
```

## 🔍 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   lsof -i :5678
   
   # 修改端口配置
   # 编辑.env文件中的N8N_PORT
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库状态
   docker-compose logs postgres
   
   # 重启数据库
   docker-compose restart postgres
   ```

3. **内存不足**
   ```bash
   # 检查系统资源
   docker stats
   
   # 调整配置
   # 编辑.env文件中的并发设置
   ```

更多问题解决方案请查看：[常见问题解答](10-学习指南/常见问题解答.md)

## 📖 学习资源

### 官方资源
- [N8N官方文档](https://docs.n8n.io/)
- [N8N社区论坛](https://community.n8n.io/)
- [N8N GitHub仓库](https://github.com/n8n-io/n8n)

### 中文资源
- 本文件夹中的学习指南
- [N8N中文教程](https://www.bilibili.com/search?keyword=N8N)
- 技术博客和社区文章

### 实践项目
- 个人自动化助手
- 企业业务流程自动化
- 数据集成和同步
- 监控和告警系统

## 🤝 贡献指南

如果你发现文档中的错误或有改进建议：

1. **提交Issue**：描述问题或建议
2. **提交PR**：直接修改并提交改进
3. **分享经验**：在社区分享你的使用经验

## 📄 许可证

本学习资料基于原项目的许可证，仅用于学习和教育目的。

## 📞 获取帮助

如果在学习过程中遇到问题：

1. **查看文档**：首先查看相关的学习指南
2. **搜索FAQ**：查看常见问题解答
3. **查看日志**：检查系统日志获取错误信息
4. **社区求助**：在N8N社区论坛提问
5. **GitHub Issues**：在官方仓库提交问题

---

## 🎯 学习目标

通过本学习文件夹，你将能够：

✅ **掌握N8N基础概念**：理解工作流、节点、连接等核心概念
✅ **独立部署N8N系统**：使用Docker快速搭建N8N环境
✅ **创建实用工作流**：设计和实现各种自动化任务
✅ **解决常见问题**：具备基本的故障排除能力
✅ **优化系统性能**：了解性能调优和最佳实践
✅ **集成第三方服务**：连接各种API和服务
✅ **企业级应用**：掌握生产环境部署和管理

## 🌟 开始你的N8N学习之旅

现在就开始吧！从[快速入门指南](10-学习指南/快速入门指南.md)开始，逐步掌握N8N的强大功能。

记住：**实践是最好的老师**。不要只是阅读文档，动手创建你的第一个工作流，在实践中学习和成长！

---

*祝你学习愉快！🚀*

*最后更新时间：2024年1月*