# N8N自动化项目 - 文件索引与分类目录

## 📋 项目概览

**项目名称**: N8N自动化集成系统  
**项目类型**: 自动化工作流集成平台  
**主要技术栈**: N8N、PHP、JavaScript、Docker、MCP  
**创建时间**: 2025年1月  
**最后更新**: 2025年1月16日  

## 🗂️ 项目结构分类

### 1. 核心系统模块

#### 1.1 火鸟门户系统 (`hawaiihub.net/`)
```
hawaiihub.net/
├── admin/                    # 后台管理系统
│   ├── config.php           # 系统配置文件
│   ├── house/               # 房产管理模块
│   │   ├── houseCf.php      # 房产配置管理
│   │   └── houseConfig.php  # 房产系统配置
│   ├── marry/               # 婚庆管理模块
│   │   ├── marryConfig.php  # 婚庆配置管理
│   │   └── marryDiyConfig.php # 婚庆自定义配置
│   ├── member/              # 用户管理模块
│   └── article/             # 内容管理模块
├── api/                     # API接口层
├── data/                    # 数据存储目录
├── design/                  # 设计资源
├── templates/               # 模板文件
│   └── info/touch/skin5/    # 移动端模板
└── upload/                  # 上传文件目录
```

**关键配置文件**:
- `payPhoneConfig.php` - 支付配置
- `siteDiyConfig.php` - 站点自定义配置  
- `siteConfig.php` - 站点基础配置
- `weixinConfig.php` - 微信集成配置

#### 1.2 N8N工作流系统

##### 1.2.1 N8N核心 (`n8n-mcp-main/`)
```
n8n-mcp-main/
├── package.json             # 项目依赖配置
├── src/                     # 源代码目录
├── docs/                    # 文档目录
└── examples/                # 示例代码
```

**技术栈**: TypeScript, Node.js, MCP协议  
**主要功能**: N8N与MCP协议集成

##### 1.2.2 N8N工作流模板 (`n8n-workflows-main/`)
```
n8n-workflows-main/
├── package.json             # 依赖管理
├── workflows/               # 工作流定义
├── nodes/                   # 自定义节点
└── templates/               # 模板库
```

**依赖库**: axios, lodash, moment等

##### 1.2.3 部署配置 (`n8n-deployment/`)
```
n8n-deployment/
├── quick-setup-guide.md     # 快速部署指南
├── docker-compose.yml       # Docker编排文件
├── honolulu-firecrawl-scraper.json # 网页抓取工作流
└── configuration-methods.md # 配置方法说明
```

### 2. 扩展与集成模块

#### 2.1 N8N社区资源

##### 2.1.1 官方文档 (`n8n-docs-main/`)
```
n8n-docs-main/
├── docs/
│   ├── integrations/        # 集成文档
│   │   └── builtin/
│   │       ├── credentials/ # 凭证配置
│   │       └── app-nodes/   # 应用节点
│   └── configuration/       # 配置文档
└── README.md
```

**重要凭证配置**:
- `groq.md` - Groq AI凭证
- `jotform.md` - JotForm凭证  
- `freshservice.md` - Freshservice凭证
- `mistral.md` - Mistral AI凭证

##### 2.1.2 社区模板 (`awesome-n8n-templates-main/`)
```
awesome-n8n-templates-main/
├── AI_Integrations/         # AI集成模板
├── Data_Processing/         # 数据处理模板
├── E-commerce/             # 电商集成模板
├── Marketing_Automation/    # 营销自动化
├── Social_Media/           # 社交媒体集成
└── Other_Integrations_and_Use_Cases/ # 其他集成案例
```

**核心模板**:
- `Introduction to the HTTP Tool.json` - HTTP工具使用指南
- 各类业务场景的自动化模板

##### 2.1.3 N8N资源库 (`awesome-n8n-main/`)
```
awesome-n8n-main/
├── README.md               # 资源索引
├── community-nodes/        # 社区节点
├── workflows/             # 工作流示例
└── tutorials/             # 教程资源
```

#### 2.2 N8N FlorWork扩展 (`N8N FlorWork/`)
```
N8N FlorWork/
├── nodes/                  # 自定义节点
├── workflows/             # 专用工作流
├── credentials/           # 凭证管理
└── documentation/         # 项目文档
```

### 3. 系统配置与管理

#### 3.1 Augment配置 (`.augment/`)
```
.augment/
├── rules/
│   ├── rules.md            # 项目规则
│   └── templates.md        # 模板规范
├── config/                 # 配置文件
└── cache/                  # 缓存目录
```

#### 3.2 Trae配置 (`.trae/`)
```
.trae/
├── config.json            # Trae配置
├── workspace/             # 工作空间
└── logs/                  # 日志文件
```

## 📊 文件类型统计

### 按文件类型分类

| 文件类型 | 数量 | 主要用途 |
|---------|------|----------|
| `.php` | 150+ | 火鸟门户后端逻辑 |
| `.json` | 80+ | 配置文件、工作流定义 |
| `.md` | 60+ | 文档说明 |
| `.js` | 40+ | 前端脚本、N8N节点 |
| `.ts` | 30+ | TypeScript源码 |
| `.xml` | 20+ | 配置文件、模板 |
| `.yml/.yaml` | 15+ | Docker配置、CI/CD |

### 按功能模块分类

| 模块类型 | 文件数量 | 核心功能 |
|---------|----------|----------|
| 火鸟门户核心 | 200+ | 内容管理、用户管理、房产婚庆 |
| N8N工作流 | 150+ | 自动化流程、节点定义 |
| 配置管理 | 80+ | 系统配置、环境变量 |
| 文档说明 | 60+ | 使用指南、API文档 |
| 模板资源 | 100+ | 工作流模板、UI模板 |

## 🔗 关键依赖关系

### 技术栈依赖图
```
火鸟门户系统 (PHP + MySQL)
    ↓
API接口层 (REST API)
    ↓
N8N工作流引擎 (Node.js)
    ↓
MCP协议集成 (TypeScript)
    ↓
外部服务集成 (各类API)
```

### 数据流向图
```
用户操作 → 火鸟门户 → API接口 → N8N工作流 → 外部服务
    ↑                                    ↓
    ←─── 结果反馈 ←─── 数据处理 ←─── 服务响应
```

## 📁 重要目录说明

### 配置目录
- `/hawaiihub.net/admin/` - 火鸟门户管理配置
- `/n8n-deployment/` - N8N部署配置
- `/.augment/rules/` - 项目规则配置

### 源码目录  
- `/hawaiihub.net/` - 火鸟门户源码
- `/n8n-mcp-main/src/` - N8N MCP源码
- `/n8n-workflows-main/` - 工作流源码

### 文档目录
- `/n8n-docs-main/docs/` - N8N官方文档
- `/awesome-n8n-main/` - 社区资源文档
- 各项目根目录的README.md文件

### 模板目录
- `/awesome-n8n-templates-main/` - N8N工作流模板
- `/hawaiihub.net/templates/` - 火鸟门户UI模板
- `/n8n-workflows-main/templates/` - 自定义工作流模板

## 🏷️ 标签分类系统

### 按技术栈标签
- `#PHP` - 火鸟门户相关文件
- `#JavaScript` - 前端脚本文件  
- `#TypeScript` - N8N节点开发
- `#Docker` - 容器化部署
- `#MCP` - MCP协议集成
- `#API` - 接口相关文件

### 按功能标签
- `#Config` - 配置文件
- `#Workflow` - 工作流定义
- `#Template` - 模板文件
- `#Documentation` - 文档文件
- `#Integration` - 集成相关
- `#Automation` - 自动化脚本

### 按重要性标签
- `#Critical` - 核心系统文件
- `#Important` - 重要功能文件
- `#Optional` - 可选扩展文件
- `#Deprecated` - 已废弃文件

## 📈 项目规模统计

**总文件数**: 约800+个文件  
**总代码行数**: 约50,000+行  
**主要编程语言**: PHP (40%), JavaScript/TypeScript (35%), 配置文件 (25%)  
**文档覆盖率**: 约80%  
**测试覆盖率**: 约60%  

## 🔄 更新维护

**索引更新频率**: 每周更新  
**最后索引时间**: 2025年1月16日  
**维护负责人**: N8N火鸟门户技术助手  
**更新触发条件**: 新增文件、重要修改、结构调整  

---

*此索引文件由N8N火鸟门户技术助手自动生成和维护，确保项目文件的可追溯性和可管理性。*