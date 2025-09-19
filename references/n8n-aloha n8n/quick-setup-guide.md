# 🚀 Aloha项目 + n8n-MCP 快速部署指南

## 📋 **第一步: 配置Claude Desktop**

### 1. 找到Claude Desktop配置文件
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### 2. 复制我们准备的配置
```bash
# 复制配置文件到正确位置 (macOS示例)
cp n8n-deployment/claude-desktop-config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### 3. 重启Claude Desktop
完全退出Claude Desktop并重新启动

---

## 🔧 **第二步: 设置n8n环境**

### 选项A: 使用Docker (推荐)
```bash
# 1. 创建n8n工作目录
mkdir -p ~/aloha-n8n
cd ~/aloha-n8n

# 2. 启动n8n
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# 3. 访问 http://localhost:5678 完成初始设置
```

### 选项B: 使用npm
```bash
# 1. 安装n8n
npm install n8n -g

# 2. 启动n8n
n8n start

# 3. 访问 http://localhost:5678 完成初始设置
```

---

## 📊 **第三步: 导入Aloha工作流**

### 1. 登录n8n界面
访问 http://localhost:5678 并完成账户设置

### 2. 导入工作流
1. 点击右上角 "+" 按钮
2. 选择 "Import from file"
3. 上传 `n8n-deployment/aloha-reddit-monitor-workflow.json`

### 3. 配置必要的凭据

#### PostgreSQL数据库
```sql
-- 创建数据库表
CREATE TABLE reddit_posts (
    id VARCHAR(20) PRIMARY KEY,
    title TEXT,
    content TEXT,
    score INTEGER,
    num_comments INTEGER,
    created_utc BIGINT,
    subreddit VARCHAR(50),
    url TEXT,
    author VARCHAR(100),
    collected_at TIMESTAMP,
    pain_point_category VARCHAR(50),
    user_group VARCHAR(50),
    severity INTEGER,
    sentiment VARCHAR(20)
);
```

#### OpenAI API
- 在n8n中添加OpenAI凭据
- 使用您的OpenAI API密钥

#### Notion API (可选)
- 创建Notion集成: https://www.notion.so/my-integrations
- 获取API密钥和页面ID
- 在n8n中配置Notion凭据

#### Telegram Bot (可选)
- 与@BotFather创建新bot
- 获取bot token和chat ID
- 在n8n中配置Telegram凭据

---

## 🎯 **第四步: 测试Claude + n8n-MCP**

### 1. 在Claude中测试n8n-MCP
```
请帮我查看n8n中有哪些可用的节点类型，特别是用于数据收集和AI分析的节点。
```

### 2. 创建简单工作流
```
请帮我创建一个简单的n8n工作流，用于：
1. 每小时检查Reddit r/Hawaii的热门帖子
2. 使用AI分析帖子情感
3. 将结果保存到数据库
```

### 3. 验证自动化工作流
- 检查工作流是否按计划执行
- 验证数据是否正确存储
- 确认通知是否正常发送

---

## 📈 **第五步: 扩展和优化**

### 1. 添加更多数据源
- Facebook群组监控
- Instagram标签跟踪
- Google评论分析
- Yelp评价监控

### 2. 增强AI分析能力
- 情感分析细化
- 趋势预测模型
- 用户行为分析
- 个性化推荐算法

### 3. 集成更多服务
- Slack团队通知
- 邮件营销自动化
- 客户服务工单系统
- 数据可视化仪表板

---

## 🔍 **故障排除**

### Claude Desktop连接问题
```bash
# 检查配置文件格式
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .

# 查看Claude Desktop日志 (macOS)
tail -f ~/Library/Logs/Claude/claude_desktop.log
```

### n8n工作流执行失败
1. 检查节点配置是否正确
2. 验证API凭据是否有效
3. 查看执行日志中的错误信息
4. 确认网络连接正常

### 数据库连接问题
```bash
# 测试PostgreSQL连接
psql -h localhost -U your_username -d your_database -c "SELECT 1;"

# 检查表结构
\d reddit_posts
```

---

## 📊 **监控和维护**

### 1. 设置监控指标
- 工作流执行成功率
- API调用响应时间
- 数据质量检查
- 错误率统计

### 2. 定期维护任务
- 清理过期数据
- 更新API密钥
- 优化数据库性能
- 备份重要配置

### 3. 性能优化
- 调整执行频率
- 优化数据库查询
- 缓存常用数据
- 负载均衡配置

---

## 🎉 **成功指标**

### 数据收集
- ✅ 每6小时自动收集Reddit数据
- ✅ AI分析准确率>85%
- ✅ 数据存储无丢失
- ✅ 高优先级事件及时通知

### 用户体验
- ✅ Claude可以流畅查询n8n节点信息
- ✅ 工作流创建和修改便捷
- ✅ 实时数据分析和报告
- ✅ 自动化程度>90%

### 业务价值
- ✅ 用户需求洞察及时更新
- ✅ 产品决策数据支持充分
- ✅ 运营效率显著提升
- ✅ 用户满意度持续改善

---

## 🔗 **有用链接**

- [n8n官方文档](https://docs.n8n.io/)
- [n8n-MCP项目](https://github.com/czlonkowski/n8n-mcp)
- [Claude MCP文档](https://docs.anthropic.com/claude/docs/mcp)
- [Reddit API文档](https://www.reddit.com/dev/api/)
- [OpenAI API文档](https://platform.openai.com/docs)

---

## 💡 **下一步计划**

1. **完善数据收集**: 添加更多社交媒体数据源
2. **增强AI分析**: 实现更精准的用户需求预测
3. **构建推荐系统**: 基于收集数据的个性化推荐
4. **开发用户界面**: 为Aloha应用创建前端界面
5. **部署生产环境**: 将系统部署到云端服务器

🎯 **目标**: 在2周内完成基础自动化系统，4周内实现完整的Aloha本地同城AI应用原型！
