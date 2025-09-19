# 火鸟门户新闻工作流监控系统部署指南

## 概述

本指南详细说明如何部署和配置火鸟门户新闻工作流的全面日志记录和监控系统。该系统提供统一的日志记录、性能指标收集、错误告警和执行报告功能。

## 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   n8n工作流     │    │   监控系统      │    │   告警系统      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ 日志记录器  │ ├────┤ │ 指标收集器  │ ├────┤ │ Webhook通知 │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ 性能监控器  │ ├────┤ │ 趋势分析器  │ ├────┤ │ 邮件通知    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ 错误处理器  │ ├────┤ │ 报告生成器  │ ├────┤ │ Slack通知   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 部署步骤

### 1. 环境准备

#### 1.1 创建必要的目录结构

```bash
# 创建日志和报告目录
mkdir -p ./logs/execution-reports
mkdir -p ./logs/performance-metrics
mkdir -p ./logs/error-logs
mkdir -p ./logs/audit-logs

# 设置目录权限
chmod 755 ./logs
chmod 755 ./logs/execution-reports
chmod 755 ./logs/performance-metrics
chmod 755 ./logs/error-logs
chmod 755 ./logs/audit-logs
```

#### 1.2 配置环境变量

在n8n环境中设置以下环境变量：

```bash
# 日志记录配置
export WORKFLOW_LOG_LEVEL=info
export ENABLE_STRUCTURED_LOGGING=true
export LOG_DESTINATION=console,file
export LOG_FILE_PATH=./logs/workflow-execution.log

# 性能监控配置
export PERFORMANCE_MONITORING_ENABLED=true
export METRICS_COLLECTION_INTERVAL=30000
export METRICS_RETENTION_PERIOD=7d

# 错误告警配置
export ENABLE_ERROR_ALERTS=true
export WEBHOOK_ALERT_URL=https://your-webhook-endpoint.com/alerts
export WEBHOOK_TOKEN=your-webhook-token

# 报告生成配置
export ENABLE_EXECUTION_REPORTS=true
export REPORT_STORAGE_PATH=./logs/execution-reports
export REPORT_RETENTION_PERIOD=30d

# 可选：邮件通知配置
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=your-email@gmail.com
export SMTP_PASS=your-app-password

# 可选：Slack通知配置
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### 2. 安装依赖模块

#### 2.1 复制监控模块文件

将以下文件复制到n8n工作目录：

```bash
# 复制监控系统文件
cp n8n-config/performance-metrics-collector.js ./
cp n8n-config/workflow-execution-reporter.js ./
cp n8n-config/unified-logging-node-config.json ./
cp n8n-config/workflow-orchestration-config.json ./
```

#### 2.2 验证Node.js依赖

确保以下npm包已安装：

```bash
npm install axios xml2js fs path os
```

### 3. 导入工作流配置

#### 3.1 导入增强监控工作流

1. 登录n8n管理界面
2. 点击"Import from file"
3. 选择 `enhanced-workflow-with-monitoring.json`
4. 确认导入设置
5. 保存工作流

#### 3.2 配置工作流设置

在工作流设置中配置：

```json
{
  "timezone": "Asia/Shanghai",
  "saveManualExecutions": true,
  "callerPolicy": "workflowsFromSameOwner",
  "executionTimeout": 600000,
  "maxExecutionTime": "10 minutes",
  "retryOnFail": true,
  "maxRetries": 3,
  "waitBetweenRetries": 5000
}
```

### 4. 配置告警系统

#### 4.1 Webhook告警配置

创建Webhook端点来接收告警通知：

```javascript
// 示例Webhook处理器
app.post('/alerts', (req, res) => {
  const alert = req.body;
  
  console.log('收到告警:', alert);
  
  // 处理不同类型的告警
  switch (alert.type) {
    case 'error_alert':
      handleErrorAlert(alert);
      break;
    case 'performance_alert':
      handlePerformanceAlert(alert);
      break;
    default:
      console.log('未知告警类型:', alert.type);
  }
  
  res.status(200).json({ received: true });
});

function handleErrorAlert(alert) {
  // 发送邮件、Slack通知等
  console.log(`错误告警: ${alert.title}`);
  console.log(`严重程度: ${alert.severity}`);
  console.log(`详情: ${alert.description}`);
}

function handlePerformanceAlert(alert) {
  // 处理性能告警
  console.log(`性能告警: ${alert.title}`);
  console.log(`指标: ${alert.details.metric}`);
  console.log(`当前值: ${alert.details.value}`);
}
```

#### 4.2 邮件告警配置

如果启用邮件通知，配置SMTP设置：

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmailAlert(alert) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: 'admin@hawaiihub.net',
    subject: `工作流告警: ${alert.title}`,
    html: generateAlertEmailTemplate(alert)
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('邮件告警发送成功');
  } catch (error) {
    console.error('邮件告警发送失败:', error);
  }
}
```

### 5. 监控仪表板配置

#### 5.1 创建监控仪表板

可以使用Grafana或自定义仪表板来可视化监控数据：

```json
{
  "dashboard": {
    "title": "火鸟门户新闻工作流监控",
    "panels": [
      {
        "title": "工作流执行状态",
        "type": "stat",
        "targets": [
          {
            "expr": "workflow_execution_count",
            "legendFormat": "执行次数"
          }
        ]
      },
      {
        "title": "执行时间趋势",
        "type": "graph",
        "targets": [
          {
            "expr": "workflow_execution_duration",
            "legendFormat": "执行时间"
          }
        ]
      },
      {
        "title": "错误率",
        "type": "graph",
        "targets": [
          {
            "expr": "workflow_error_rate",
            "legendFormat": "错误率"
          }
        ]
      },
      {
        "title": "内存使用率",
        "type": "graph",
        "targets": [
          {
            "expr": "system_memory_usage",
            "legendFormat": "内存使用率"
          }
        ]
      }
    ]
  }
}
```

#### 5.2 配置数据源

如果使用外部监控系统，配置数据导出：

```javascript
// 示例：导出指标到Prometheus
const client = require('prom-client');

const executionCounter = new client.Counter({
  name: 'workflow_execution_total',
  help: '工作流执行总数',
  labelNames: ['status', 'workflow_name']
});

const executionDuration = new client.Histogram({
  name: 'workflow_execution_duration_seconds',
  help: '工作流执行时间',
  labelNames: ['workflow_name']
});

// 在工作流中记录指标
function recordMetrics(executionData) {
  executionCounter.inc({
    status: executionData.status,
    workflow_name: executionData.workflowName
  });
  
  executionDuration.observe(
    { workflow_name: executionData.workflowName },
    executionData.duration / 1000
  );
}
```

## 配置验证

### 1. 测试日志记录

运行测试工作流并检查日志输出：

```bash
# 检查控制台日志
tail -f /var/log/n8n/n8n.log

# 检查文件日志
tail -f ./logs/workflow-execution.log

# 验证结构化日志格式
cat ./logs/workflow-execution.log | jq '.'
```

### 2. 测试性能监控

验证性能指标收集：

```bash
# 检查性能指标文件
ls -la ./logs/performance-metrics/

# 验证指标数据格式
cat ./logs/performance-metrics/latest.json | jq '.systemMetrics'
```

### 3. 测试错误告警

触发测试错误并验证告警：

```bash
# 模拟网络错误
curl -X POST http://localhost:5678/webhook/test-error \
  -H "Content-Type: application/json" \
  -d '{"error": "network timeout", "severity": "critical"}'

# 检查告警日志
grep "告警" ./logs/workflow-execution.log
```

### 4. 测试报告生成

验证执行报告生成：

```bash
# 检查报告文件
ls -la ./logs/execution-reports/

# 验证报告内容
cat ./logs/execution-reports/execution_*.json | jq '.executionSummary'
```

## 性能优化

### 1. 日志优化

```bash
# 配置日志轮转
cat > /etc/logrotate.d/n8n-workflow << EOF
./logs/workflow-execution.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 n8n n8n
}
EOF
```

### 2. 指标存储优化

```javascript
// 配置指标数据压缩和清理
const metricsCollector = new PerformanceMetricsCollector({
  metricsRetention: '7d',
  compressionEnabled: true,
  batchSize: 100,
  flushInterval: 30000
});
```

### 3. 告警优化

```javascript
// 配置告警聚合和去重
const alertManager = {
  aggregationWindow: 300000, // 5分钟
  maxAlertsPerWindow: 10,
  suppressDuplicates: true,
  escalationRules: {
    critical: 'immediate',
    warning: 'after_3_occurrences'
  }
};
```

## 故障排除

### 常见问题

#### 1. 日志记录不工作

**问题**: 没有看到日志输出
**解决方案**:
```bash
# 检查环境变量
echo $WORKFLOW_LOG_LEVEL
echo $ENABLE_STRUCTURED_LOGGING

# 检查文件权限
ls -la ./logs/

# 检查磁盘空间
df -h
```

#### 2. 性能监控数据缺失

**问题**: 性能指标没有收集
**解决方案**:
```bash
# 检查Node.js进程权限
ps aux | grep n8n

# 检查内存使用
free -h

# 验证监控模块加载
node -e "console.log(require('./performance-metrics-collector.js'))"
```

#### 3. 告警通知失败

**问题**: 告警没有发送
**解决方案**:
```bash
# 测试Webhook连接
curl -X POST $WEBHOOK_ALERT_URL \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# 检查网络连接
ping your-webhook-domain.com

# 验证认证配置
echo $WEBHOOK_TOKEN
```

#### 4. 报告生成失败

**问题**: 执行报告没有生成
**解决方案**:
```bash
# 检查报告目录权限
ls -la ./logs/execution-reports/

# 检查磁盘空间
du -sh ./logs/

# 验证报告模块
node -e "console.log(require('./workflow-execution-reporter.js'))"
```

## 维护指南

### 日常维护任务

1. **日志清理** (每日)
   ```bash
   find ./logs -name "*.log" -mtime +7 -delete
   ```

2. **指标数据清理** (每周)
   ```bash
   find ./logs/performance-metrics -name "*.json" -mtime +30 -delete
   ```

3. **报告归档** (每月)
   ```bash
   tar -czf reports-$(date +%Y%m).tar.gz ./logs/execution-reports/
   ```

### 监控系统健康检查

创建健康检查脚本：

```bash
#!/bin/bash
# monitoring-health-check.sh

echo "=== 监控系统健康检查 ==="

# 检查日志文件
if [ -f "./logs/workflow-execution.log" ]; then
    echo "✅ 日志文件存在"
    echo "📊 日志大小: $(du -h ./logs/workflow-execution.log | cut -f1)"
else
    echo "❌ 日志文件不存在"
fi

# 检查报告目录
report_count=$(ls -1 ./logs/execution-reports/ 2>/dev/null | wc -l)
echo "📄 执行报告数量: $report_count"

# 检查磁盘空间
disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $disk_usage -gt 80 ]; then
    echo "⚠️ 磁盘使用率过高: ${disk_usage}%"
else
    echo "✅ 磁盘使用率正常: ${disk_usage}%"
fi

# 检查进程状态
if pgrep -f "n8n" > /dev/null; then
    echo "✅ n8n进程运行正常"
else
    echo "❌ n8n进程未运行"
fi

echo "=== 健康检查完成 ==="
```

## 总结

通过以上配置，您已经成功部署了火鸟门户新闻工作流的全面监控系统。该系统提供：

- ✅ 统一的结构化日志记录
- ✅ 实时性能指标收集和分析
- ✅ 智能错误分类和告警
- ✅ 详细的执行报告和统计
- ✅ 可扩展的监控架构

定期检查监控系统的健康状态，并根据实际使用情况调整配置参数，以确保系统的最佳性能和可靠性。