#!/usr/bin/env node

/**
 * 工作流监控脚本
 * 用于监控工作流执行状态、性能指标和数据流完整性
 */

const fs = require('fs');
const path = require('path');

class WorkflowMonitor {
  constructor(options = {}) {
    this.options = {
      logLevel: options.logLevel || 'info',
      metricsInterval: options.metricsInterval || 30000, // 30秒
      alertThresholds: options.alertThresholds || {},
      enableRealTimeMonitoring: options.enableRealTimeMonitoring || true,
      ...options
    };
    
    this.metrics = {
      executions: {
        total: 0,
        successful: 0,
        failed: 0,
        inProgress: 0
      },
      performance: {
        averageExecutionTime: 0,
        maxExecutionTime: 0,
        minExecutionTime: Infinity
      },
      dataFlow: {
        itemsProcessed: 0,
        itemsPublished: 0,
        itemsRejected: 0,
        duplicatesSkipped: 0
      },
      errors: {
        byCategory: {},
        byPhase: {},
        total: 0
      },
      quality: {
        averageScore: 0,
        aiDecisionAccuracy: 0,
        contentOptimizationRate: 0
      }
    };
    
    this.activeExecutions = new Map();
    this.alertHistory = [];
    
    this.initializeMonitoring();
  }
  
  /**
   * 初始化监控系统
   */
  initializeMonitoring() {
    console.log('🔍 工作流监控系统启动');
    
    // 启动实时监控
    if (this.options.enableRealTimeMonitoring) {
      this.startRealTimeMonitoring();
    }
    
    // 启动定期指标收集
    this.startMetricsCollection();
    
    // 设置告警检查
    this.startAlertMonitoring();
  }
  
  /**
   * 启动实时监控
   */
  startRealTimeMonitoring() {
    // 监控工作流执行事件
    this.monitorWorkflowEvents();
    
    // 监控系统资源
    this.monitorSystemResources();
    
    console.log('✅ 实时监控已启动');
  }
  
  /**
   * 监控工作流事件
   */
  monitorWorkflowEvents() {
    // 这里可以集成n8n的webhook或API来监控执行事件
    // 目前使用模拟数据进行演示
    
    setInterval(() => {
      this.checkWorkflowExecutions();
    }, 5000); // 每5秒检查一次
  }
  
  /**
   * 检查工作流执行状态
   */
  async checkWorkflowExecutions() {
    try {
      // 模拟检查n8n执行状态
      const executions = await this.getActiveExecutions();
      
      executions.forEach(execution => {
        this.trackExecution(execution);
      });
      
    } catch (error) {
      this.logError('检查工作流执行状态失败', error);
    }
  }
  
  /**
   * 获取活跃的执行
   */
  async getActiveExecutions() {
    // 这里应该调用n8n API获取实际的执行状态
    // 目前返回模拟数据
    return [
      {
        id: 'exec_' + Date.now(),
        status: 'running',
        startTime: Date.now() - 60000,
        currentStep: 4,
        totalSteps: 8,
        workflowId: 'enhanced-news-collection-with-notion'
      }
    ];
  }
  
  /**
   * 跟踪执行状态
   */
  trackExecution(execution) {
    const executionId = execution.id;
    
    if (!this.activeExecutions.has(executionId)) {
      // 新的执行
      this.activeExecutions.set(executionId, {
        ...execution,
        phases: [],
        metrics: {
          startTime: execution.startTime,
          phaseTimings: {},
          dataProcessed: 0,
          errorsEncountered: 0
        }
      });
      
      this.metrics.executions.total++;
      this.metrics.executions.inProgress++;
      
      this.log('info', `🚀 新工作流执行开始: ${executionId}`);
    }
    
    // 更新执行状态
    const trackedExecution = this.activeExecutions.get(executionId);
    trackedExecution.status = execution.status;
    trackedExecution.currentStep = execution.currentStep;
    
    // 检查是否完成
    if (execution.status === 'success' || execution.status === 'error') {
      this.completeExecution(executionId, execution.status);
    }
  }
  
  /**
   * 完成执行跟踪
   */
  completeExecution(executionId, status) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return;
    
    const executionTime = Date.now() - execution.metrics.startTime;
    
    // 更新指标
    this.metrics.executions.inProgress--;
    
    if (status === 'success') {
      this.metrics.executions.successful++;
    } else {
      this.metrics.executions.failed++;
    }
    
    // 更新性能指标
    this.updatePerformanceMetrics(executionTime);
    
    // 移除活跃执行
    this.activeExecutions.delete(executionId);
    
    this.log('info', `✅ 工作流执行完成: ${executionId}, 状态: ${status}, 耗时: ${Math.round(executionTime/1000)}秒`);
  }
  
  /**
   * 更新性能指标
   */
  updatePerformanceMetrics(executionTime) {
    const current = this.metrics.performance;
    
    // 更新平均执行时间
    const totalExecutions = this.metrics.executions.successful + this.metrics.executions.failed;
    current.averageExecutionTime = (
      (current.averageExecutionTime * (totalExecutions - 1) + executionTime) / totalExecutions
    );
    
    // 更新最大最小执行时间
    current.maxExecutionTime = Math.max(current.maxExecutionTime, executionTime);
    current.minExecutionTime = Math.min(current.minExecutionTime, executionTime);
  }
  
  /**
   * 监控系统资源
   */
  monitorSystemResources() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      // 检查资源使用情况
      if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
        this.triggerAlert('warning', 'memory_usage_high', {
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB'
        });
      }
      
    }, 30000); // 每30秒检查一次
  }
  
  /**
   * 启动指标收集
   */
  startMetricsCollection() {
    setInterval(() => {
      this.collectMetrics();
      this.generateMetricsReport();
    }, this.options.metricsInterval);
    
    console.log('📊 指标收集已启动');
  }
  
  /**
   * 收集指标
   */
  collectMetrics() {
    // 计算成功率
    const total = this.metrics.executions.successful + this.metrics.executions.failed;
    const successRate = total > 0 ? (this.metrics.executions.successful / total) * 100 : 0;
    
    // 计算错误率
    const errorRate = total > 0 ? (this.metrics.executions.failed / total) * 100 : 0;
    
    // 更新质量指标
    this.metrics.quality.successRate = successRate;
    this.metrics.quality.errorRate = errorRate;
    
    // 检查阈值
    this.checkThresholds();
  }
  
  /**
   * 检查阈值
   */
  checkThresholds() {
    const thresholds = this.options.alertThresholds;
    
    // 检查成功率
    if (this.metrics.quality.successRate < (thresholds.minSuccessRate || 95)) {
      this.triggerAlert('warning', 'low_success_rate', {
        current: this.metrics.quality.successRate,
        threshold: thresholds.minSuccessRate || 95
      });
    }
    
    // 检查执行时间
    if (this.metrics.performance.averageExecutionTime > (thresholds.maxExecutionTime || 300000)) {
      this.triggerAlert('warning', 'high_execution_time', {
        current: Math.round(this.metrics.performance.averageExecutionTime / 1000),
        threshold: Math.round((thresholds.maxExecutionTime || 300000) / 1000)
      });
    }
    
    // 检查错误率
    if (this.metrics.quality.errorRate > (thresholds.maxErrorRate || 5)) {
      this.triggerAlert('critical', 'high_error_rate', {
        current: this.metrics.quality.errorRate,
        threshold: thresholds.maxErrorRate || 5
      });
    }
  }
  
  /**
   * 生成指标报告
   */
  generateMetricsReport() {
    const report = {
      timestamp: new Date().toISOString(),
      executions: this.metrics.executions,
      performance: {
        ...this.metrics.performance,
        averageExecutionTimeFormatted: this.formatDuration(this.metrics.performance.averageExecutionTime),
        maxExecutionTimeFormatted: this.formatDuration(this.metrics.performance.maxExecutionTime)
      },
      dataFlow: this.metrics.dataFlow,
      quality: this.metrics.quality,
      activeExecutions: this.activeExecutions.size,
      alerts: {
        total: this.alertHistory.length,
        recent: this.alertHistory.filter(alert => 
          Date.now() - alert.timestamp < 3600000 // 最近1小时
        ).length
      }
    };
    
    // 保存报告
    this.saveMetricsReport(report);
    
    // 输出摘要
    if (this.options.logLevel === 'info' || this.options.logLevel === 'debug') {
      this.logMetricsSummary(report);
    }
  }
  
  /**
   * 保存指标报告
   */
  saveMetricsReport(report) {
    const reportsDir = path.join(__dirname, '../logs/monitoring');
    
    // 确保目录存在
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const filename = `metrics-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(reportsDir, filename);
    
    try {
      // 读取现有报告
      let reports = [];
      if (fs.existsSync(filepath)) {
        const content = fs.readFileSync(filepath, 'utf8');
        reports = JSON.parse(content);
      }
      
      // 添加新报告
      reports.push(report);
      
      // 保持最近100个报告
      if (reports.length > 100) {
        reports = reports.slice(-100);
      }
      
      // 保存
      fs.writeFileSync(filepath, JSON.stringify(reports, null, 2));
      
    } catch (error) {
      this.logError('保存指标报告失败', error);
    }
  }
  
  /**
   * 输出指标摘要
   */
  logMetricsSummary(report) {
    console.log('\n📊 工作流监控摘要:');
    console.log(`时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}`);
    console.log(`执行统计: 总计${report.executions.total}, 成功${report.executions.successful}, 失败${report.executions.failed}, 进行中${report.activeExecutions}`);
    console.log(`成功率: ${report.quality.successRate?.toFixed(1) || 0}%`);
    console.log(`平均执行时间: ${report.performance.averageExecutionTimeFormatted}`);
    console.log(`数据处理: 已处理${report.dataFlow.itemsProcessed}, 已发布${report.dataFlow.itemsPublished}`);
    
    if (report.alerts.recent > 0) {
      console.log(`⚠️ 最近告警: ${report.alerts.recent}个`);
    }
    
    console.log('─'.repeat(50));
  }
  
  /**
   * 启动告警监控
   */
  startAlertMonitoring() {
    setInterval(() => {
      this.checkAlerts();
    }, 60000); // 每分钟检查一次
    
    console.log('🚨 告警监控已启动');
  }
  
  /**
   * 检查告警
   */
  checkAlerts() {
    // 检查长时间运行的执行
    this.activeExecutions.forEach((execution, executionId) => {
      const runningTime = Date.now() - execution.metrics.startTime;
      
      if (runningTime > 600000) { // 10分钟
        this.triggerAlert('warning', 'long_running_execution', {
          executionId: executionId,
          runningTime: this.formatDuration(runningTime),
          currentStep: execution.currentStep,
          totalSteps: execution.totalSteps
        });
      }
    });
    
    // 检查系统健康状态
    this.checkSystemHealth();
  }
  
  /**
   * 检查系统健康状态
   */
  checkSystemHealth() {
    // 检查最近的执行情况
    const recentFailures = this.alertHistory.filter(alert => 
      alert.type === 'execution_failed' && 
      Date.now() - alert.timestamp < 300000 // 最近5分钟
    ).length;
    
    if (recentFailures >= 3) {
      this.triggerAlert('critical', 'multiple_recent_failures', {
        count: recentFailures,
        timeWindow: '5分钟'
      });
    }
  }
  
  /**
   * 触发告警
   */
  triggerAlert(severity, type, data = {}) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      severity: severity,
      type: type,
      data: data,
      message: this.generateAlertMessage(type, data)
    };
    
    // 添加到历史记录
    this.alertHistory.push(alert);
    
    // 保持最近1000个告警
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000);
    }
    
    // 输出告警
    this.logAlert(alert);
    
    // 发送告警通知
    this.sendAlertNotification(alert);
  }
  
  /**
   * 生成告警消息
   */
  generateAlertMessage(type, data) {
    const messages = {
      low_success_rate: `工作流成功率过低: ${data.current?.toFixed(1)}% (阈值: ${data.threshold}%)`,
      high_execution_time: `工作流执行时间过长: ${data.current}秒 (阈值: ${data.threshold}秒)`,
      high_error_rate: `错误率过高: ${data.current?.toFixed(1)}% (阈值: ${data.threshold}%)`,
      memory_usage_high: `内存使用率过高: ${data.heapUsed}`,
      long_running_execution: `执行时间过长: ${data.executionId} 已运行 ${data.runningTime}`,
      multiple_recent_failures: `最近${data.timeWindow}内发生${data.count}次失败`,
      execution_failed: `工作流执行失败: ${data.executionId}`,
      external_service_error: `外部服务错误: ${data.service} - ${data.error}`
    };
    
    return messages[type] || `未知告警类型: ${type}`;
  }
  
  /**
   * 记录告警日志
   */
  logAlert(alert) {
    const emoji = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨'
    };
    
    console.log(`${emoji[alert.severity]} [${alert.severity.toUpperCase()}] ${alert.message}`);
    
    if (this.options.logLevel === 'debug') {
      console.log('告警详情:', JSON.stringify(alert.data, null, 2));
    }
  }
  
  /**
   * 发送告警通知
   */
  async sendAlertNotification(alert) {
    // 这里可以集成各种通知渠道
    // 例如：Webhook、邮件、Slack等
    
    if (this.options.webhookUrl) {
      try {
        // 发送Webhook通知
        await this.sendWebhookAlert(alert);
      } catch (error) {
        this.logError('发送Webhook告警失败', error);
      }
    }
  }
  
  /**
   * 发送Webhook告警
   */
  async sendWebhookAlert(alert) {
    const payload = {
      timestamp: new Date(alert.timestamp).toISOString(),
      severity: alert.severity,
      type: alert.type,
      message: alert.message,
      data: alert.data,
      source: 'workflow-monitor'
    };
    
    // 这里应该实现实际的HTTP请求
    console.log('📤 发送Webhook告警:', payload);
  }
  
  /**
   * 格式化持续时间
   */
  formatDuration(ms) {
    if (ms === Infinity) return '∞';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分${seconds % 60}秒`;
    } else if (minutes > 0) {
      return `${minutes}分${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  }
  
  /**
   * 记录日志
   */
  log(level, message, data = null) {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.options.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    if (messageLevelIndex <= currentLevelIndex) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
      
      if (data && this.options.logLevel === 'debug') {
        console.log('数据:', JSON.stringify(data, null, 2));
      }
    }
  }
  
  /**
   * 记录错误日志
   */
  logError(message, error) {
    console.error(`❌ ${message}:`, error.message);
    
    if (this.options.logLevel === 'debug') {
      console.error('错误堆栈:', error.stack);
    }
  }
  
  /**
   * 获取监控状态
   */
  getStatus() {
    return {
      isRunning: true,
      metrics: this.metrics,
      activeExecutions: Array.from(this.activeExecutions.values()),
      recentAlerts: this.alertHistory.slice(-10),
      uptime: process.uptime()
    };
  }
  
  /**
   * 停止监控
   */
  stop() {
    console.log('🛑 工作流监控系统停止');
    // 清理定时器和资源
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const monitor = new WorkflowMonitor({
    logLevel: process.env.WORKFLOW_LOG_LEVEL || 'info',
    enableRealTimeMonitoring: true,
    alertThresholds: {
      minSuccessRate: 95,
      maxExecutionTime: 300000, // 5分钟
      maxErrorRate: 5
    },
    webhookUrl: process.env.ALERT_WEBHOOK_URL
  });
  
  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('\n收到停止信号，正在关闭监控系统...');
    monitor.stop();
    process.exit(0);
  });
  
  console.log('工作流监控系统已启动，按 Ctrl+C 停止');
}

module.exports = WorkflowMonitor;