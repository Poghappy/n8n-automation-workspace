#!/bin/bash

# 🏝️ Aloha微信公众号自动化部署脚本
# 版本: 1.0.0
# 作者: Aloha团队

set -e

echo "🏝️ 开始部署Aloha微信公众号自动化系统..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
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

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm未安装，请先安装npm"
        exit 1
    fi
    
    # 检查Docker (可选)
    if command -v docker &> /dev/null; then
        log_success "Docker已安装"
        DOCKER_AVAILABLE=true
    else
        log_warning "Docker未安装，将使用本地安装方式"
        DOCKER_AVAILABLE=false
    fi
    
    # 检查PostgreSQL
    if command -v psql &> /dev/null; then
        log_success "PostgreSQL已安装"
    else
        log_warning "PostgreSQL未安装，请确保有可用的PostgreSQL数据库"
    fi
}

# 创建项目目录
setup_directories() {
    log_info "创建项目目录结构..."
    
    mkdir -p aloha-wechat-automation/{workflows,config,logs,data}
    cd aloha-wechat-automation
    
    log_success "目录结构创建完成"
}

# 安装n8n
install_n8n() {
    log_info "安装n8n..."
    
    if [ "$DOCKER_AVAILABLE" = true ]; then
        log_info "使用Docker安装n8n..."
        
        # 创建docker-compose.yml
        cat > docker-compose.yml << EOF
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: aloha-n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=aloha2025
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=Asia/Shanghai
    volumes:
      - ./n8n_data:/home/node/.n8n
      - ./workflows:/home/node/workflows
    depends_on:
      - postgres
      
  postgres:
    image: postgres:13
    container_name: aloha-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=aloha_wechat
      - POSTGRES_USER=aloha
      - POSTGRES_PASSWORD=aloha2025
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
EOF
        
        log_success "Docker配置文件创建完成"
        
        # 启动服务
        docker-compose up -d
        
        log_success "n8n和PostgreSQL服务启动完成"
        
    else
        log_info "使用npm安装n8n..."
        npm install -g n8n
        log_success "n8n安装完成"
    fi
}

# 设置数据库
setup_database() {
    log_info "设置数据库..."
    
    # 等待PostgreSQL启动
    sleep 10
    
    # 创建数据库表
    cat > setup_db.sql << EOF
-- 创建微信文章表
CREATE TABLE IF NOT EXISTS wechat_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    theme VARCHAR(100),
    target_audience VARCHAR(100),
    word_count INTEGER,
    media_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    publish_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    msg_id VARCHAR(100),
    read_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    error_message TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建内容策略表
CREATE TABLE IF NOT EXISTS content_strategies (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER,
    category VARCHAR(50),
    theme VARCHAR(100),
    topics TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户反馈表
CREATE TABLE IF NOT EXISTS user_feedback (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES wechat_articles(id),
    feedback_type VARCHAR(50),
    content TEXT,
    rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入初始内容策略数据
INSERT INTO content_strategies (day_of_week, category, theme, topics) VALUES
(0, '期望管理', 'Sunday真实分享', ARRAY['夏威夷旅游的5个美丽误区', '看不到海龟？这些地方成功率更高', 'Instagram vs 现实：夏威夷真相大揭秘']),
(1, '文化融合', '本周文化小贴士', ARRAY['真正的Aloha精神：不只是你好和再见', '新移民必知：夏威夷的10个不成文规矩', '如何在夏威夷建立真正的本地友谊']),
(2, '省钱攻略', 'Tuesday特价发现', ARRAY['威基基$8 Mai Tai地图：本地人的秘密清单', '檀香山20家本地人最爱的平价美食', '免费享受夏威夷：50个不花钱的绝美体验']),
(3, '决策助手', '中周规划指南', ARRAY['北岸vs市区住宿：5分钟帮你做决定', '夏威夷7日游完美路线：避开游客陷阱', '租车还是Uber？夏威夷交通终极指南']),
(4, '省钱攻略', 'Thursday本地推荐', ARRAY['夏威夷Happy Hour地图：$5鸡尾酒在哪里', '本地人的海鲜市场：新鲜又便宜', '夏威夷免费活动日历：每周都有惊喜']),
(5, '文化融合', '周末文化活动', ARRAY['夏威夷传统节日指南：参与而非观看', '学习夏威夷语：10个日常必用词汇', '夏威夷音乐文化：不只是尤克里里']),
(6, '省钱攻略', '周末省钱攻略', ARRAY['夏威夷免费海滩指南：避开收费陷阱', '周末家庭活动：$50玩转全家', '夏威夷徒步路线：免费的绝美风景']);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_articles_status ON wechat_articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_publish_time ON wechat_articles(publish_time);
CREATE INDEX IF NOT EXISTS idx_articles_category ON wechat_articles(category);
EOF

    if [ "$DOCKER_AVAILABLE" = true ]; then
        docker exec aloha-postgres psql -U aloha -d aloha_wechat -f /tmp/setup_db.sql
    else
        psql -h localhost -U aloha -d aloha_wechat -f setup_db.sql
    fi
    
    log_success "数据库设置完成"
}

# 复制工作流文件
copy_workflows() {
    log_info "复制工作流文件..."
    
    # 复制工作流JSON文件到workflows目录
    cp ../wechat-content-generator-workflow.json workflows/
    cp ../wechat-auto-publisher-workflow.json workflows/
    
    log_success "工作流文件复制完成"
}

# 创建环境配置文件
create_config() {
    log_info "创建配置文件..."
    
    cat > config/.env << EOF
# 微信公众号配置
WECHAT_APP_ID=your_app_id_here
WECHAT_APP_SECRET=your_app_secret_here

# OpenAI配置
OPENAI_API_KEY=your_openai_key_here

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aloha_wechat
DB_USER=aloha
DB_PASSWORD=aloha2025

# Telegram通知配置 (可选)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# n8n配置
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=aloha2025
EOF

    cat > config/claude-desktop-config.json << EOF
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "your_n8n_api_key_here"
      }
    }
  }
}
EOF

    log_success "配置文件创建完成"
}

# 创建启动脚本
create_startup_scripts() {
    log_info "创建启动脚本..."
    
    cat > start.sh << 'EOF'
#!/bin/bash
echo "🏝️ 启动Aloha微信公众号自动化系统..."

if [ -f "docker-compose.yml" ]; then
    echo "使用Docker启动..."
    docker-compose up -d
    echo "✅ 系统启动完成！"
    echo "📱 n8n界面: http://localhost:5678"
    echo "🔑 用户名: admin"
    echo "🔑 密码: aloha2025"
else
    echo "使用本地方式启动..."
    source config/.env
    n8n start &
    echo "✅ n8n启动完成！"
    echo "📱 访问: http://localhost:5678"
fi
EOF

    cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 停止Aloha微信公众号自动化系统..."

if [ -f "docker-compose.yml" ]; then
    docker-compose down
else
    pkill -f n8n
fi

echo "✅ 系统已停止"
EOF

    chmod +x start.sh stop.sh
    
    log_success "启动脚本创建完成"
}

# 创建使用说明
create_readme() {
    log_info "创建使用说明..."
    
    cat > README.md << 'EOF'
# 🏝️ Aloha微信公众号自动化系统

## 🚀 快速开始

### 1. 配置环境变量
编辑 `config/.env` 文件，填入您的API密钥：
```bash
# 必填项
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
OPENAI_API_KEY=your_openai_key

# 可选项
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 2. 启动系统
```bash
./start.sh
```

### 3. 访问n8n界面
- 地址: http://localhost:5678
- 用户名: admin
- 密码: aloha2025

### 4. 导入工作流
1. 登录n8n界面
2. 点击"Import from file"
3. 导入 `workflows/` 目录下的JSON文件

### 5. 配置Claude Desktop (可选)
复制 `config/claude-desktop-config.json` 到Claude配置目录

## 📊 系统功能

### 自动内容生成
- 每日早上6点自动生成内容
- 基于Aloha项目数据的智能主题策划
- AI驱动的高质量内容创作
- 自动图片生成和优化

### 智能发布调度
- 每日早上8点自动发布
- 智能发布时间优化
- 发布状态监控和通知
- 失败重试机制

### 数据分析追踪
- 每2小时更新文章统计
- 阅读量、点赞、分享数据
- 用户反馈收集和分析
- 内容效果优化建议

## 🔧 维护操作

### 查看日志
```bash
# Docker方式
docker-compose logs -f n8n

# 本地方式
tail -f logs/n8n.log
```

### 停止系统
```bash
./stop.sh
```

### 备份数据
```bash
# 备份数据库
docker exec aloha-postgres pg_dump -U aloha aloha_wechat > backup.sql

# 备份工作流
cp -r n8n_data/workflows backup/
```

## 📞 技术支持

如有问题，请联系Aloha技术团队。
EOF

    log_success "使用说明创建完成"
}

# 主函数
main() {
    log_info "🏝️ Aloha微信公众号自动化系统部署开始"
    
    check_dependencies
    setup_directories
    install_n8n
    setup_database
    copy_workflows
    create_config
    create_startup_scripts
    create_readme
    
    log_success "🎉 部署完成！"
    echo ""
    echo "📋 下一步操作："
    echo "1. 编辑 config/.env 文件，填入您的API密钥"
    echo "2. 运行 ./start.sh 启动系统"
    echo "3. 访问 http://localhost:5678 配置工作流"
    echo "4. 导入 workflows/ 目录下的工作流文件"
    echo ""
    echo "📚 详细说明请查看 README.md 文件"
    echo ""
    echo "🏝️ 欢迎使用Aloha微信公众号自动化系统！"
}

# 执行主函数
main "$@"
