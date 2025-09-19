# 新闻自动化工作流规格文档（基于 n8n + Notion + 火鸟门户）

## Feature Overview

本功能实现一个自动化新闻工作流，集成 n8n（RSS/API/爬虫节点）、Notion数据库 和 火鸟门户新闻模块。系统从多个来源收集新闻，经过AI过滤，存储在Notion，最后自动发布到火鸟门户，供读者浏览。目标是减少人工干预、确保内容质量，并提升用户阅读体验。

## Specifications

### Spec 1 — 新闻采集

**User Story（内容管理员）：**
作为内容管理员，我希望系统能自动从多个来源收集新闻，这样我无需手动监控也能保证内容更新。

**Acceptance Criteria:**

- 定时从RSS源收集新闻（The Neuron、Futurepedia、Superhuman、The Rundown AI）
- 提取字段：标题、内容、URL、发布日期、来源
- API采集时处理身份验证与速率限制
- n8n爬虫节点能正确提取网页字段
- 来源不可用时系统跳过并记录错误

**Rationale:**
统一采集机制，减少人工操作，保证内容广度。

### Spec 2 — 新闻过滤与处理

**User Story（内容管理员）：**
作为内容管理员，我希望系统能自动过滤内容，这样只有相关和高质量的新闻能进入后续流程。

**Acceptance Criteria:**

- AI 评估内容相关性并打分
- 低于阈值的内容被过滤
- 标题/正文相似度去重
- 数据结构标准化
- 被拒内容记录拒绝原因

**Rationale:**
确保门户新闻质量与一致性。

### Spec 3 — Notion 存储

**User Story（内容管理员）：**
作为内容管理员，我希望合格的新闻存储在Notion中，便于审查和集中管理。

**Acceptance Criteria:**

- 内容写入Notion数据库
- 字段映射：标题、正文、来源、发布日期、质量分数、状态
- API调用使用凭据认证
- 存储失败时重试3次（指数退避）
- 成功存储后写入时间戳

**Dependencies:**
Notion API 密钥，n8n Notion 节点。

### Spec 4 — 火鸟门户发布

**User Story（内容管理员）：**
作为内容管理员，我希望系统能把Notion里的新闻自动发布到火鸟门户，减少手工复制。

**Acceptance Criteria:**

- 成功存储到Notion后触发发布流程
- 数据映射到火鸟门户API字段（title、typeid、body、writer、source）
- 调用端点 https://hawaiihub.net/include/ajax.php
- API返回 state=100 时标记成功
- 失败时 5 秒间隔重试 3 次

**Dependencies:**
火鸟门户 API 凭据（Cookie/Session）。

### Spec 5 — 日志与监控

**User Story（系统管理员）：**
作为系统管理员，我希望系统有详细日志和监控，这样我能快速排查故障。

**Acceptance Criteria:**

- 每个步骤记录时间戳、数据量、耗时
- 错误日志包含堆栈与上下文
- 每次工作流生成任务总结（成功/失败/性能指标）
- 响应时间>5分钟或错误率>2%触发报警
- 凭据过期时报警

### Spec 6 — 凭据安全

**User Story（系统管理员）：**
作为系统管理员，我希望API凭据被安全管理，避免泄露。

**Acceptance Criteria:**

- 使用n8n凭据系统加密存储
- 外部API调用强制HTTPS
- Notion令牌支持轮换
- 火鸟门户 PHPSESSID 自动过期
- 日志不得包含明文凭据

### Spec 7 — 高可用与性能

**User Story（系统管理员）：**
作为系统管理员，我希望系统保持高可用，这样新闻能稳定及时发布。

**Acceptance Criteria:**

- 正常运行时间 ≥99.5%
- 单批采集 ≤5分钟
- 新闻在采集后 30 分钟内出现在门户
- 采集准确率 ≥95%
- 发布成功率 ≥98%

### Spec 8 — 复用 n8n 工作流

**User Story（开发者）：**
作为开发者，我希望最大化复用现有 n8n 工作流，减少重复开发。

**Acceptance Criteria:**

- 复用 OpenAI 集成\_85节点.json ≥95%功能
- 保留RSS、AI过滤、火鸟API节点
- 插入 Notion 节点不破坏数据流
- 修改保持向后兼容
- 部署时支持回滚

### Spec 9 — 新闻展示体验

**User Story（新闻读者）：**
作为新闻读者，我希望在门户上看到带图片和摘要的新闻，这样我能快速浏览内容。

**Acceptance Criteria:**

- 列表页显示：标题、摘要、缩略图、发布时间、来源
- 点击后展示完整正文、配图、来源信息
- 自动生成摘要，长度 100–200 字
- PC/移动端自适应排版
- 图文加载 ≤2 秒

**Rationale:**
提升用户体验，增加页面停留时长和点击率。
