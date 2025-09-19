#!/bin/bash

# 🏢 檀香山求职招聘公众号自动化部署脚本
# 版本: 1.0.0

set -e

echo "🏢 开始部署檀香山求职招聘公众号自动化系统..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 创建项目目录
setup_directories() {
    log_info "创建项目目录结构..."
    
    mkdir -p honolulu-job-recruitment/{workflows,config,logs,data,backups}
    cd honolulu-job-recruitment
    
    log_success "目录结构创建完成"
}

# 创建数据库表结构
setup_database() {
    log_info "设置求职招聘数据库..."
    
    cat > setup_job_db.sql << EOF
-- 创建职位信息表
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    description TEXT,
    requirements TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_text VARCHAR(100),
    job_type VARCHAR(50),
    industry VARCHAR(50),
    source VARCHAR(50),
    source_url TEXT,
    quality_score INTEGER DEFAULT 0,
    chinese_friendly BOOLEAN DEFAULT FALSE,
    posted_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(title, company)
);

-- 创建用户画像表
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    wechat_openid VARCHAR(100) UNIQUE,
    nickname VARCHAR(100),
    skills TEXT[],
    experience_years INTEGER,
    salary_expectation_min INTEGER,
    salary_expectation_max INTEGER,
    preferred_industries TEXT[],
    location_preference VARCHAR(100),
    resume_url TEXT,
    job_alerts_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建文章发布记录表
CREATE TABLE IF NOT EXISTS published_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    article_type VARCHAR(50),
    featured_jobs INTEGER[],
    target_audience VARCHAR(100),
    focus_industry VARCHAR(50),
    media_id VARCHAR(100),
    publish_time TIMESTAMP,
    published_at TIMESTAMP,
    read_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户互动记录表
CREATE TABLE IF NOT EXISTS user_interactions (
    id SERIAL PRIMARY KEY,
    wechat_openid VARCHAR(100),
    interaction_type VARCHAR(50), -- view, share, comment, apply
    article_id INTEGER REFERENCES published_articles(id),
    job_id INTEGER REFERENCES jobs(id),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建企业信息表
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(50),
    size VARCHAR(50),
    location VARCHAR(100),
    website VARCHAR(200),
    description TEXT,
    logo_url TEXT,
    chinese_friendly BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建招聘统计表
CREATE TABLE IF NOT EXISTS recruitment_stats (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE,
    total_jobs INTEGER DEFAULT 0,
    new_jobs INTEGER DEFAULT 0,
    high_quality_jobs INTEGER DEFAULT 0,
    chinese_friendly_jobs INTEGER DEFAULT 0,
    avg_salary INTEGER DEFAULT 0,
    top_industries TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入初始企业数据
INSERT INTO companies (name, industry, chinese_friendly, rating) VALUES
('Hawaii Pacific Health', 'Healthcare', TRUE, 4.2),
('Hawaiian Airlines', 'Transportation', TRUE, 4.0),
('Bank of Hawaii', 'Finance', TRUE, 4.1),
('University of Hawaii', 'Education', TRUE, 4.3),
('City and County of Honolulu', 'Government', TRUE, 3.8),
('State of Hawaii', 'Government', TRUE, 3.9),
('Kaiser Permanente Hawaii', 'Healthcare', TRUE, 4.0),
('Queens Health Systems', 'Healthcare', TRUE, 4.1),
('Hawaiian Electric', 'Utilities', FALSE, 3.7),
('Foodland Super Market', 'Retail', TRUE, 3.6)
ON CONFLICT (name) DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_jobs_quality_score ON jobs(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs(industry);
CREATE INDEX IF NOT EXISTS idx_jobs_chinese_friendly ON jobs(chinese_friendly);
CREATE INDEX IF NOT EXISTS idx_articles_publish_time ON published_articles(publish_time);
CREATE INDEX IF NOT EXISTS idx_interactions_openid ON user_interactions(wechat_openid);
EOF

    log_success "数据库脚本创建完成"
}

# 创建环境配置
create_config() {
    log_info "创建配置文件..."
    
    cat > config/.env << EOF
# 微信公众号配置
WECHAT_APP_ID=your_app_id_here
WECHAT_APP_SECRET=your_app_secret_here

# OpenAI配置
OPENAI_API_KEY=your_openai_key_here

# Indeed API配置 (可选)
INDEED_PUBLISHER_ID=your_indeed_publisher_id

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=honolulu_jobs
DB_USER=jobbot
DB_PASSWORD=jobbot2025

# Telegram通知配置
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# n8n配置
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=jobbot2025

# 系统配置
TIMEZONE=Pacific/Honolulu
LOG_LEVEL=info
MAX_JOBS_PER_DAY=50
CONTENT_QUALITY_THRESHOLD=60
EOF

    cat > config/content-templates.json << 'EOF'
{
  "job_categories": {
    "healthcare": {
      "keywords": ["nurse", "medical", "health", "doctor", "therapist"],
      "emoji": "🏥",
      "description": "医疗健康"
    },
    "government": {
      "keywords": ["government", "city", "state", "county", "public"],
      "emoji": "🏛️",
      "description": "政府部门"
    },
    "education": {
      "keywords": ["teacher", "education", "university", "school"],
      "emoji": "🎓",
      "description": "教育培训"
    },
    "tourism": {
      "keywords": ["hotel", "tourism", "restaurant", "hospitality"],
      "emoji": "🏨",
      "description": "旅游酒店"
    },
    "finance": {
      "keywords": ["bank", "finance", "accounting", "insurance"],
      "emoji": "💰",
      "description": "金融财务"
    },
    "technology": {
      "keywords": ["software", "developer", "IT", "tech", "engineer"],
      "emoji": "💻",
      "description": "科技互联网"
    }
  },
  "salary_ranges": {
    "entry": {"min": 30000, "max": 45000, "label": "入门级"},
    "mid": {"min": 45000, "max": 70000, "label": "中级"},
    "senior": {"min": 70000, "max": 100000, "label": "高级"},
    "executive": {"min": 100000, "max": 200000, "label": "管理层"}
  },
  "content_types": {
    "热门职位推荐": {
      "template": "本周热招 | 檀香山最新{industry}职位",
      "focus": "high_quality_jobs",
      "job_count": 6
    },
    "行业深度分析": {
      "template": "行业洞察 | 夏威夷{industry}就业市场分析",
      "focus": "industry_trends",
      "job_count": 4
    },
    "求职技巧分享": {
      "template": "求职宝典 | {skill}技能提升指南",
      "focus": "career_advice",
      "job_count": 3
    },
    "薪资福利解析": {
      "template": "薪资透明 | 夏威夷{industry}薪资大揭秘",
      "focus": "salary_analysis",
      "job_count": 5
    }
  }
}
EOF

    log_success "配置文件创建完成"
}

# 复制工作流文件
copy_workflows() {
    log_info "复制工作流文件..."
    
    cp ../job-recruitment-workflow.json workflows/
    cp ../wechat-auto-publisher-workflow.json workflows/
    
    log_success "工作流文件复制完成"
}

# 创建启动脚本
create_startup_scripts() {
    log_info "创建启动脚本..."
    
    cat > start-job-system.sh << 'EOF'
#!/bin/bash
echo "🏢 启动檀香山求职招聘自动化系统..."

# 检查环境变量
if [ ! -f "config/.env" ]; then
    echo "❌ 配置文件不存在，请先配置 config/.env"
    exit 1
fi

# 加载环境变量
source config/.env

# 检查必要的API密钥
if [ -z "$WECHAT_APP_ID" ] || [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ 请先配置微信和OpenAI API密钥"
    exit 1
fi

# 启动PostgreSQL (如果使用Docker)
if [ -f "docker-compose.yml" ]; then
    echo "🐳 启动Docker服务..."
    docker-compose up -d postgres
    sleep 10
fi

# 初始化数据库
echo "📊 初始化数据库..."
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f setup_job_db.sql

# 启动n8n
echo "🚀 启动n8n工作流引擎..."
if [ -f "docker-compose.yml" ]; then
    docker-compose up -d n8n
else
    n8n start &
fi

echo "✅ 系统启动完成！"
echo "📱 n8n界面: http://localhost:5678"
echo "🔑 用户名: admin"
echo "🔑 密码: jobbot2025"
echo ""
echo "📋 下一步："
echo "1. 访问n8n界面导入工作流"
echo "2. 配置微信公众号凭据"
echo "3. 测试职位数据收集"
echo "4. 验证内容生成功能"
EOF

    cat > stop-job-system.sh << 'EOF'
#!/bin/bash
echo "🛑 停止檀香山求职招聘自动化系统..."

if [ -f "docker-compose.yml" ]; then
    docker-compose down
else
    pkill -f n8n
fi

echo "✅ 系统已停止"
EOF

    cat > backup-data.sh << 'EOF'
#!/bin/bash
echo "💾 备份求职招聘数据..."

# 创建备份目录
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# 备份数据库
source config/.env
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > $BACKUP_DIR/database.sql

# 备份配置文件
cp -r config $BACKUP_DIR/
cp -r workflows $BACKUP_DIR/

echo "✅ 数据备份完成: $BACKUP_DIR"
EOF

    chmod +x start-job-system.sh stop-job-system.sh backup-data.sh
    
    log_success "启动脚本创建完成"
}

# 创建Docker配置
create_docker_config() {
    log_info "创建Docker配置..."
    
    cat > docker-compose.yml << EOF
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: honolulu-jobs-n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=jobbot2025
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=Pacific/Honolulu
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=honolulu_jobs
      - DB_POSTGRESDB_USER=jobbot
      - DB_POSTGRESDB_PASSWORD=jobbot2025
    volumes:
      - ./n8n_data:/home/node/.n8n
      - ./workflows:/home/node/workflows
      - ./config:/home/node/config
    depends_on:
      - postgres
      
  postgres:
    image: postgres:13
    container_name: honolulu-jobs-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=honolulu_jobs
      - POSTGRES_USER=jobbot
      - POSTGRES_PASSWORD=jobbot2025
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
      - ./setup_job_db.sql:/docker-entrypoint-initdb.d/setup_job_db.sql
    ports:
      - "5432:5432"
      
  redis:
    image: redis:6-alpine
    container_name: honolulu-jobs-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - ./redis_data:/data
EOF

    log_success "Docker配置创建完成"
}

# 创建使用说明
create_readme() {
    log_info "创建使用说明..."
    
    cat > README.md << 'EOF'
# 🏢 檀香山求职招聘公众号自动化系统

## 🎯 系统功能

### 📊 智能职位收集
- 每日自动抓取Indeed、政府网站、医疗机构职位
- AI智能评分和质量筛选
- 华人友好度识别
- 行业自动分类

### 🤖 AI内容生成
- 7天内容循环策略
- 个性化职位推荐文章
- 行业分析和求职技巧
- 薪资透明度报告

### 📱 微信自动发布
- 每日定时发布高质量内容
- 智能配图生成
- 用户互动处理
- 数据统计分析

## 🚀 快速开始

### 1. 配置环境
```bash
# 编辑配置文件
vim config/.env

# 必填项：
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
OPENAI_API_KEY=your_openai_key
```

### 2. 启动系统
```bash
./start-job-system.sh
```

### 3. 导入工作流
1. 访问 http://localhost:5678
2. 用户名: admin, 密码: jobbot2025
3. 导入 workflows/ 目录下的JSON文件

### 4. 测试运行
- 手动触发职位数据收集
- 验证内容生成质量
- 测试微信发布功能

## 📊 内容策略

### 周一: 热门职位推荐
- 精选6个高质量职位
- 突出薪资和福利亮点
- 目标：主动求职者

### 周二: 行业深度分析
- 特定行业趋势分析
- 就业市场洞察
- 目标：职业规划者

### 周三: 求职技巧分享
- 面试技巧和简历优化
- 成功案例分享
- 目标：求职新手

### 周四: 雇主专访
- 知名企业招聘内幕
- 企业文化介绍
- 目标：求职者和HR

### 周五: 薪资福利解析
- 行业薪资水平分析
- 福利对比和谈薪技巧
- 目标：薪资敏感求职者

### 周六: 职场生活分享
- 员工真实体验
- 工作生活平衡
- 目标：新移民求职者

### 周日: 下周预告+互动
- 预告重点职位
- 读者问题解答
- 目标：忠实读者

## 🔧 维护操作

### 查看系统状态
```bash
docker-compose ps
```

### 查看日志
```bash
docker-compose logs -f n8n
```

### 备份数据
```bash
./backup-data.sh
```

### 停止系统
```bash
./stop-job-system.sh
```

## 📈 预期效果

### 短期目标 (1个月)
- 每日发布1篇高质量求职内容
- 关注用户达到500+
- 平均阅读量800+
- 建立稳定内容发布节奏

### 中期目标 (3个月)
- 关注用户突破2000人
- 平均阅读量1500+
- 成功推荐就业50+人次
- 建立企业合作关系

### 长期目标 (6个月)
- 成为檀香山华人求职首选平台
- 关注用户突破5000人
- 月度营收达到$5000+
- 建立完整求职服务生态

## 💰 商业模式

### 企业服务
- 职位发布: $200-500/职位
- 置顶推广: $100-300/周
- 企业专访: $1000-3000/篇

### 求职者服务
- 简历优化: $50-150/次
- 面试辅导: $100-300/小时
- VIP求职服务: $500-1500/月

## 📞 技术支持

如有问题，请查看日志文件或联系技术团队。

🏢 檀香山求职招聘自动化系统 - 让求职更简单！
EOF

    log_success "使用说明创建完成"
}

# 主函数
main() {
    log_info "🏢 檀香山求职招聘公众号自动化系统部署开始"
    
    setup_directories
    setup_database
    create_config
    copy_workflows
    create_startup_scripts
    create_docker_config
    create_readme
    
    log_success "🎉 部署完成！"
    echo ""
    echo "📋 下一步操作："
    echo "1. 编辑 config/.env 文件，填入您的API密钥"
    echo "2. 运行 ./start-job-system.sh 启动系统"
    echo "3. 访问 http://localhost:5678 配置工作流"
    echo "4. 导入 workflows/ 目录下的工作流文件"
    echo "5. 测试职位数据收集和内容生成"
    echo ""
    echo "📚 详细说明请查看 README.md 文件"
    echo ""
    echo "🏢 欢迎使用檀香山求职招聘自动化系统！"
}

# 执行主函数
main "$@"
