# Firecrawl与N8N集成设置指南

## 概述

本指南将帮助您设置Firecrawl与N8N的集成，实现高效的网页内容抓取和媒体资源提取功能。

## 前置条件

### 1. Firecrawl API密钥
- 访问 [Firecrawl官网](https://firecrawl.dev) 注册账户
- 获取API密钥（通常以 `fc-` 开头）
- 确保账户有足够的API调用额度

### 2. N8N环境
- N8N实例正在运行（本地或云端）
- 具有管理员权限以创建工作流程
- 确保N8N版本支持HTTP Request节点（v4+）

## 设置步骤

### 步骤1：导入工作流程

1. 打开N8N界面
2. 点击"Import from File"或"Import from URL"
3. 选择 `firecrawl_n8n_workflow.json` 文件
4. 确认导入工作流程

### 步骤2：配置Firecrawl API认证

#### 方法1：使用凭据管理器（推荐）
1. 在N8N中创建新的凭据
2. 选择"HTTP Header Auth"类型
3. 设置以下参数：
   - Name: `Authorization`
   - Value: `Bearer YOUR_FIRECRAWL_API_KEY`
4. 保存凭据并命名为"Firecrawl API"

#### 方法2：直接在节点中配置
1. 选择"Firecrawl API请求"节点
2. 在Authentication部分选择"Generic Credential Type"
3. 在HTTP Header Auth中设置：
   - Name: `Authorization`
   - Value: `Bearer YOUR_FIRECRAWL_API_KEY`

### 步骤3：测试工作流程

1. 激活工作流程
2. 获取Webhook URL（通常类似：`http://your-n8n-instance/webhook/firecrawl-scrape`）
3. 使用以下测试请求：

```bash
curl -X POST "http://your-n8n-instance/webhook/firecrawl-scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'
```

## 工作流程说明

### 节点功能

#### 1. Webhook触发器
- **功能**：接收外部HTTP请求
- **路径**：`/firecrawl-scrape`
- **方法**：POST
- **输入格式**：
```json
{
  "url": "要抓取的网页URL"
}
```

#### 2. Firecrawl API请求
- **功能**：调用Firecrawl API进行网页抓取
- **API端点**：`https://api.firecrawl.dev/v0/scrape`
- **配置参数**：
  - `formats`: ["markdown", "html"] - 返回格式
  - `includeTags`: ["a", "img", "video", "audio"] - 包含的HTML标签
  - `onlyMainContent`: true - 只提取主要内容
  - `waitFor`: 2000 - 等待页面加载时间（毫秒）

#### 3. 内容解析器
- **功能**：解析Firecrawl返回的数据，提取媒体资源
- **处理内容**：
  - 基本页面信息（标题、描述、URL）
  - 媒体资源链接（图片、视频、音频）
  - 下载文件链接
  - 内容统计信息

#### 4. 返回响应
- **功能**：将处理结果返回给调用方
- **输出格式**：JSON

### 输出数据结构

```json
{
  "url": "原始URL",
  "title": "页面标题",
  "description": "页面描述",
  "markdown": "Markdown格式内容",
  "html": "HTML格式内容",
  "timestamp": "处理时间戳",
  "success": true,
  "mediaLinks": {
    "images": ["图片URL数组"],
    "videos": ["视频URL数组"],
    "audios": ["音频URL数组"],
    "downloads": ["下载文件URL数组"],
    "links": ["所有链接URL数组"]
  },
  "mediaCount": {
    "images": 5,
    "videos": 2,
    "audios": 1,
    "downloads": 3,
    "totalLinks": 25
  },
  "contentStats": {
    "markdownLength": 5000,
    "htmlLength": 15000,
    "wordCount": 800
  }
}
```

## 高级配置

### 1. 批量处理

如需处理多个URL，可以添加"Split In Batches"节点：

1. 在Webhook触发器后添加"Split In Batches"节点
2. 设置批次大小（建议5-10个URL）
3. 修改输入格式为：
```json
{
  "urls": ["url1", "url2", "url3"]
}
```

### 2. 数据存储

可以添加数据库节点来存储抓取结果：

1. 添加"MySQL"、"PostgreSQL"或"MongoDB"节点
2. 配置数据库连接
3. 设计表结构存储抓取数据

### 3. 错误处理

建议添加错误处理机制：

1. 在每个节点上启用"Continue On Fail"
2. 添加"IF"节点检查API响应状态
3. 配置错误通知（邮件、Slack等）

### 4. 速率限制

为避免触发API限制：

1. 在"Firecrawl API请求"节点中设置重试机制
2. 添加"Wait"节点控制请求频率
3. 监控API使用量

## 故障排除

### 常见问题

#### 1. API密钥错误
- **症状**：返回401未授权错误
- **解决**：检查API密钥是否正确，确保格式为`Bearer fc-xxx`

#### 2. 超时错误
- **症状**：请求超时或504错误
- **解决**：增加超时时间，检查目标网站可访问性

#### 3. 内容提取失败
- **症状**：返回空内容或格式错误
- **解决**：检查目标网站是否需要JavaScript渲染，调整waitFor参数

#### 4. 媒体链接无效
- **症状**：提取的媒体链接无法访问
- **解决**：检查相对链接转换逻辑，确保URL格式正确

### 调试技巧

1. **启用详细日志**：在N8N设置中启用详细执行日志
2. **单步测试**：逐个节点测试，检查数据流转
3. **使用测试数据**：先用简单网页测试，再处理复杂页面
4. **监控API使用**：定期检查Firecrawl API使用情况

## 最佳实践

### 1. 性能优化
- 合理设置批次大小
- 使用缓存避免重复抓取
- 定期清理旧数据

### 2. 安全考虑
- 使用HTTPS端点
- 验证输入URL格式
- 限制访问权限

### 3. 监控和维护
- 设置执行监控
- 定期检查工作流程状态
- 更新API密钥和配置

## 扩展功能

### 1. 内容过滤
可以在内容解析器中添加过滤逻辑：
- 按文件类型过滤
- 按文件大小过滤
- 按域名过滤

### 2. 数据清洗
添加数据清洗步骤：
- 去除重复链接
- 验证URL有效性
- 标准化数据格式

### 3. 通知机制
集成通知服务：
- 抓取完成通知
- 错误报警
- 定期报告

## 支持和资源

- [Firecrawl官方文档](https://docs.firecrawl.dev)
- [N8N官方文档](https://docs.n8n.io)
- [GitHub项目地址](https://github.com/your-repo)

---

*最后更新：2025年1月15日*