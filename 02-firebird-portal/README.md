# 火鸟门户系统

## 📋 项目概述

火鸟门户系统是一个基于PHP + MySQL + Smarty的综合性内容管理平台，专注于房产信息管理、新闻内容发布和用户管理。系统与N8N工作流引擎深度集成，提供自动化的内容处理和数据同步功能。

## 🚀 功能特性

- **🏠 房产管理**: 房产信息发布、搜索和管理
- **📰 新闻系统**: 新闻内容发布和分类管理
- **👥 用户管理**: 用户注册、登录和权限控制
- **🔌 API接口**: RESTful API支持外部系统集成
- **🎨 模板系统**: 基于Smarty的灵活模板引擎
- **📊 数据分析**: 访问统计和用户行为分析
- **🔄 自动化集成**: 与N8N工作流无缝集成

## 📁 目录结构

```
02-firebird-portal/
├── admin/                   # 管理后台
├── api/                     # API接口
├── src/                     # 源代码
│   ├── admin/              # 后台管理模块
│   ├── api/                # API实现
│   ├── include/            # 核心类库
│   ├── templates/          # Smarty模板
│   ├── static/             # 静态资源
│   └── 官方文档/           # 官方文档
├── static/                  # 静态文件
├── 火鸟门户_数据映射模块.js      # 数据映射模块
├── 火鸟门户_新闻数据集成处理器.js # 新闻数据处理器
└── 火鸟门户_集成测试脚本.js      # 集成测试脚本
```

## 🛠️ 快速开始

### 环境要求

- PHP 7.4+
- MySQL 5.7+ / MariaDB 10.3+
- Apache 2.4+ / Nginx 1.18+
- Composer (依赖管理)

### 安装部署

#### 1. 环境配置

```bash
# 安装PHP扩展
sudo apt-get install php-mysql php-gd php-curl php-json php-mbstring

# 安装Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

#### 2. 项目部署

```bash
# 克隆项目
git clone <repository-url>
cd 02-firebird-portal

# 安装依赖
composer install

# 配置数据库
mysql -u root -p < database/schema.sql

# 配置Web服务器
sudo cp config/apache.conf /etc/apache2/sites-available/firebird.conf
sudo a2ensite firebird.conf
sudo systemctl reload apache2
```

#### 3. 配置文件

```php
// src/include/config.php
$config = [
    'database' => [
        'host' => 'localhost',
        'username' => 'firebird_user',
        'password' => 'your_password',
        'database' => 'firebird_db',
        'charset' => 'utf8mb4'
    ],
    'api' => [
        'base_url' => 'http://localhost/api/',
        'auth_key' => 'your_api_key_here',
        'rate_limit' => 1000
    ],
    'smarty' => [
        'template_dir' => './templates/',
        'compile_dir' => './templates_c/',
        'cache_dir' => './cache/',
        'debugging' => false
    ]
];
```

### 访问系统

- **前台首页**: http://localhost/
- **管理后台**: http://localhost/admin/
- **API接口**: http://localhost/api/
- **API文档**: http://localhost/api/docs/

## 🔧 核心模块

### 房产管理模块

```php
// 房产信息API
GET /api/houses              # 获取房产列表
POST /api/houses             # 添加房产信息
PUT /api/houses/{id}         # 更新房产信息
DELETE /api/houses/{id}      # 删除房产信息

// 房产搜索
GET /api/houses/search?city=honolulu&type=sale&price_min=100000
```

### 新闻管理模块

```php
// 新闻内容API
GET /api/articles            # 获取新闻列表
POST /api/articles           # 发布新闻
PUT /api/articles/{id}       # 更新新闻
DELETE /api/articles/{id}    # 删除新闻

// 新闻分类
GET /api/categories          # 获取分类列表
POST /api/categories         # 创建分类
```

### 用户管理模块

```php
// 用户管理API
GET /api/users               # 获取用户列表
POST /api/users              # 创建用户
PUT /api/users/{id}          # 更新用户信息
DELETE /api/users/{id}       # 删除用户

// 用户认证
POST /api/auth/login         # 用户登录
POST /api/auth/logout        # 用户登出
POST /api/auth/register      # 用户注册
```

## 🔌 API接口文档

### 认证方式

```bash
# API Key认证
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     http://localhost/api/houses
```

### 响应格式

```json
{
    "status": "success",
    "code": 200,
    "message": "操作成功",
    "data": {
        "items": [...],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 100
        }
    }
}
```

### 错误处理

```json
{
    "status": "error",
    "code": 400,
    "message": "请求参数错误",
    "errors": [
        {
            "field": "title",
            "message": "标题不能为空"
        }
    ]
}
```

## 🔄 N8N集成

### Webhook配置

```javascript
// N8N Webhook节点配置
{
  "httpMethod": "POST",
  "path": "firebird-webhook",
  "responseMode": "responseNode",
  "authentication": "headerAuth"
}
```

### 数据同步

```php
// 触发N8N工作流
function triggerN8NWorkflow($event, $data) {
    $webhook_url = 'http://n8n:5678/webhook/firebird-webhook';
    $payload = [
        'event' => $event,
        'data' => $data,
        'timestamp' => time()
    ];
    
    $ch = curl_init($webhook_url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $api_key
    ]);
    curl_exec($ch);
    curl_close($ch);
}
```

## 📊 数据库设计

### 核心表结构

```sql
-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 房产表
CREATE TABLE houses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(12,2),
    location VARCHAR(200),
    type ENUM('sale', 'rent') NOT NULL,
    status ENUM('available', 'sold', 'rented') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 新闻表
CREATE TABLE articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    category_id INT,
    author_id INT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔍 开发指南

### 本地开发

```bash
# 启动开发服务器
php -S localhost:8000 -t src/

# 运行测试
./vendor/bin/phpunit tests/

# 代码检查
./vendor/bin/phpcs --standard=PSR12 src/

# 生成API文档
./vendor/bin/apigen generate
```

### 调试工具

```php
// 启用调试模式
ini_set('display_errors', 1);
ini_set('error_reporting', E_ALL);

// 日志记录
error_log("Debug info: " . print_r($data, true));

// 性能分析
$start_time = microtime(true);
// ... 代码执行 ...
$execution_time = microtime(true) - $start_time;
error_log("Execution time: " . $execution_time . " seconds");
```

## 📈 性能优化

### 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_houses_location ON houses(location);
CREATE INDEX idx_articles_category ON articles(category_id, status);
CREATE INDEX idx_users_email ON users(email);

-- 查询优化
EXPLAIN SELECT * FROM houses WHERE location = 'Honolulu' AND type = 'sale';
```

### 缓存策略

```php
// Redis缓存
$redis = new Redis();
$redis->connect('127.0.0.1', 6379);

// 缓存查询结果
$cache_key = "houses:location:" . md5($location);
$cached_data = $redis->get($cache_key);

if (!$cached_data) {
    $data = $database->query($sql);
    $redis->setex($cache_key, 3600, json_encode($data));
} else {
    $data = json_decode($cached_data, true);
}
```

## 🔒 安全配置

### 输入验证

```php
// 数据验证
function validateInput($data, $rules) {
    $errors = [];
    foreach ($rules as $field => $rule) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $errors[$field] = $field . '不能为空';
        }
    }
    return $errors;
}

// SQL注入防护
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND status = ?");
$stmt->execute([$email, $status]);
```

### API安全

```php
// API限流
class RateLimiter {
    public function checkLimit($ip, $limit = 100, $window = 3600) {
        $key = "rate_limit:$ip";
        $current = $this->redis->get($key) ?: 0;
        
        if ($current >= $limit) {
            throw new Exception('请求频率超限');
        }
        
        $this->redis->incr($key);
        $this->redis->expire($key, $window);
        return true;
    }
}
```

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库配置
   - 验证用户权限
   - 确认服务状态

2. **模板编译错误**
   - 检查模板语法
   - 清理编译缓存
   - 验证文件权限

3. **API调用失败**
   - 检查API密钥
   - 验证请求格式
   - 查看错误日志

### 日志分析

```bash
# 查看错误日志
tail -f /var/log/apache2/error.log

# 查看访问日志
tail -f /var/log/apache2/access.log

# 查看PHP错误日志
tail -f /var/log/php/error.log
```

## 📖 更多资源

- [PHP官方文档](https://www.php.net/docs.php)
- [MySQL文档](https://dev.mysql.com/doc/)
- [Smarty模板引擎](https://www.smarty.net/docs/en/)
- [项目Wiki](https://github.com/Poghappy/n8n-automation-workspace/wiki)

## 🤝 贡献指南

详细信息请参考 [CONTRIBUTING.md](../CONTRIBUTING.md)

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](../LICENSE) 文件

---

更多信息请访问 [项目主页](https://github.com/Poghappy/n8n-automation-workspace)
