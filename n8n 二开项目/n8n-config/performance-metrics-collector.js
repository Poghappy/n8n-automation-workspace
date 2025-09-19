/**
 * 性能指标收集和分析模块
 * 为火鸟门户新闻工作流提供全面的性能监控功能
 */

class PerformanceMetricsCollector {
  constructor(options = {}) {
    this.options = {
      enableSystemMetrics: options.enableSystemMetrics !== false,
      enableWorkflowMetrics: options.enableWorkflowMetrics !== false,
      enableApiMetrics: options.enableApiMetrics !== false,
      metricsRetention: options.metricsRetention || '7d',
      collectionInterval: options.collectionInterval || 30000,
      alertThresholds: options.alertThresholds || this.getDefaultThresholds(),
      ...options
    };
    
    this.metrics = {
      system: new Map(),
      workflow: new Map(),
      api: new Map(),
      custom: new Map()
    };
    
    this.alerts = [];
    this.startTime = Date.now();
    this.lastCollectionTime = Date.now();
  }

  /**
   * 获取默认的性能阈值配置
   */
  getDefaultThresholds() {
    return {
      executionTime: {
        warning: 180000,  // 3分钟
        critical: 300000  // 5分钟
      },
      memoryUsage: {
        warning: 80,      // 80%
        critical: 95      // 95%
      },
      cpuUsage: {
        warning: 70,      // 70%
        critical: 90      // 90%
      },
      apiResponseTime: {
        warning: 5000,    // 5秒
        critical: 10000   // 10秒
      },
      errorRate: {
        warning: 5,       // 5%
        critical: 10      // 10%
      },
      throughput: {
        warning: 5,       // 5 items/second
        critical: 1       // 1 item/second
      }
    };
  }

  /**
   * 收集系统性能指标
   */
  collectSystemMetrics() {
    if (!this.options.enableSystemMetrics) {
      return null;
    }

    const timestamp = Date.now();
    const memUsage = process.memoryUsage();
    
    const systemMetrics = {
      timestamp,
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers || 0,
        heapUsagePercent: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      process: {
        uptime: process.uptime(),
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version,
        cpuUsage: process.cpuUsage ? process.cpuUsage() : null
      },
      system: {
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
        freeMemory: require('os').freemem(),
        totalMemory: require('os').totalmem(),
        cpuCount: require('os').cpus().length
      }
    };

    // 计算系统内存使用率
    systemMetrics.system.memoryUsagePercent = 
      ((systemMetrics.system.totalMemory - systemMetrics.system.freeMemory) / systemMetrics.system.totalMemory) * 100;

    // 存储指标
    this.storeMetric('system', 'memory_usage', systemMetrics.memory);
    this.storeMetric('system', 'process_info', systemMetrics.process);
    this.storeMetric('system', 'system_info', systemMetrics.system);

    return systemMetrics;
  }

  /**
   * 收集工作流性能指标
   */
  collectWorkflowMetrics(executionContext = {}) {
    if (!this.options.enableWorkflowMetrics) {
      return null;
    }

    const timestamp = Date.now();
    const executionTime = timestamp - this.startTime;
    
    const workflowMetrics = {
      timestamp,
      execution: {
        executionId: executionContext.executionId || 'unknown',
        workflowId: executionContext.workflowId || 'unknown',
        workflowName: executionContext.workflowName || 'unknown',
        nodeId: executionContext.nodeId || 'unknown',
        nodeName: executionContext.nodeName || 'unknown',
        totalExecutionTime: executionTime,
        currentStepTime: timestamp - this.lastCollectionTime,
        itemsProcessed: executionContext.itemsProcessed || 0,
        dataSize: executionContext.dataSize || 0,
        throughput: this.calculateThroughput(executionContext.itemsProcessed || 0, executionTime),
        averageItemSize: this.calculateAverageItemSize(executionContext.itemsProcessed || 0, executionContext.dataSize || 0)
      },
      quality: {
        successCount: executionContext.successCount || 0,
        errorCount: executionContext.errorCount || 0,
        skipCount: executionContext.skipCount || 0,
        successRate: this.calculateSuccessRate(executionContext.successCount || 0, executionContext.itemsProcessed || 0),
        errorRate: this.calculateErrorRate(executionContext.errorCount || 0, executionContext.itemsProcessed || 0),
        averageQualityScore: executionContext.averageQualityScore || 0
      },
      phases: executionContext.phases || {}
    };

    // 存储指标
    this.storeMetric('workflow', 'execution_metrics', workflowMetrics.execution);
    this.storeMetric('workflow', 'quality_metrics', workflowMetrics.quality);

    this.lastCollectionTime = timestamp;
    return workflowMetrics;
  }

  /**
   * 收集API性能指标
   */
  collectApiMetrics(apiCalls = []) {
    if (!this.options.enableApiMetrics || apiCalls.length === 0) {
      return null;
    }

    const timestamp = Date.now();
    
    // 按API端点分组统计
    const apiStats = {};
    let totalResponseTime = 0;
    let successfulCalls = 0;
    let totalCalls = apiCalls.length;

    apiCalls.forEach(call => {
      const endpoint = call.endpoint || call.url || 'unknown';
      
      if (!apiStats[endpoint]) {
        apiStats[endpoint] = {
          totalCalls: 0,
          successfulCalls: 0,
          totalResponseTime: 0,
          minResponseTime: Infinity,
          maxResponseTime: 0,
          errors: []
        };
      }

      apiStats[endpoint].totalCalls++;
      totalResponseTime += call.responseTime || 0;

      if (call.success) {
        apiStats[endpoint].successfulCalls++;
        successfulCalls++;
      } else {
        apiStats[endpoint].errors.push({
          error: call.error,
          timestamp: call.timestamp
        });
      }

      if (call.responseTime) {
        apiStats[endpoint].totalResponseTime += call.responseTime;
        apiStats[endpoint].minResponseTime = Math.min(apiStats[endpoint].minResponseTime, call.responseTime);
        apiStats[endpoint].maxResponseTime = Math.max(apiStats[endpoint].maxResponseTime, call.responseTime);
      }
    });

    // 计算每个端点的统计信息
    Object.keys(apiStats).forEach(endpoint => {
      const stats = apiStats[endpoint];
      stats.averageResponseTime = stats.totalResponseTime / stats.totalCalls;
      stats.successRate = (stats.successfulCalls / stats.totalCalls) * 100;
      stats.errorRate = ((stats.totalCalls - stats.successfulCalls) / stats.totalCalls) * 100;
      
      if (stats.minResponseTime === Infinity) {
        stats.minResponseTime = 0;
      }
    });

    const apiMetrics = {
      timestamp,
      overall: {
        totalCalls,
        successfulCalls,
        averageResponseTime: totalCalls > 0 ? totalResponseTime / totalCalls : 0,
        successRate: totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 100,
        errorRate: totalCalls > 0 ? ((totalCalls - successfulCalls) / totalCalls) * 100 : 0,
        slowestCall: Math.max(...apiCalls.map(call => call.responseTime || 0)),
        fastestCall: Math.min(...apiCalls.map(call => call.responseTime || Infinity).filter(t => t !== Infinity))
      },
      byEndpoint: apiStats
    };

    // 存储指标
    this.storeMetric('api', 'overall_metrics', apiMetrics.overall);
    Object.keys(apiStats).forEach(endpoint => {
      this.storeMetric('api', `endpoint_${endpoint}`, apiStats[endpoint]);
    });

    return apiMetrics;
  }

  /**
   * 收集自定义指标
   */
  collectCustomMetrics(customData = {}) {
    const timestamp = Date.now();
    
    const customMetrics = {
      timestamp,
      contentMetrics: {
        sourceDistribution: customData.sourceDistribution || {},
        categoryDistribution: customData.categoryDistribution || {},
        qualityScoreDistribution: customData.qualityScoreDistribution || {},
        duplicateDetectionResults: customData.duplicateDetectionResults || {},
        aiDecisionBreakdown: customData.aiDecisionBreakdown || {}
      },
      businessMetrics: {
        contentPublishRate: customData.contentPublishRate || 0,
        userEngagementScore: customData.userEngagementScore || 0,
        contentFreshnessScore: customData.contentFreshnessScore || 0,
        systemEfficiencyScore: customData.systemEfficiencyScore || 0
      }
    };

    // 存储自定义指标
    this.storeMetric('custom', 'content_metrics', customMetrics.contentMetrics);
    this.storeMetric('custom', 'business_metrics', customMetrics.businessMetrics);

    return customMetrics;
  }

  /**
   * 存储指标数据
   */
  storeMetric(category, name, data) {
    if (!this.metrics[category]) {
      this.metrics[category] = new Map();
    }

    const metricKey = `${name}_${Date.now()}`;
    this.metrics[category].set(metricKey, {
      timestamp: Date.now(),
      data: data
    });

    // 清理过期数据
    this.cleanupExpiredMetrics(category);
  }

  /**
   * 清理过期的指标数据
   */
  cleanupExpiredMetrics(category) {
    const retentionMs = this.parseRetentionPeriod(this.options.metricsRetention);
    const cutoffTime = Date.now() - retentionMs;

    if (this.metrics[category]) {
      for (const [key, metric] of this.metrics[category]) {
        if (metric.timestamp < cutoffTime) {
          this.metrics[category].delete(key);
        }
      }
    }
  }

  /**
   * 解析保留期间字符串
   */
  parseRetentionPeriod(retention) {
    const match = retention.match(/^(\d+)([hdwm])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // 默认7天

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      case 'w': return value * 7 * 24 * 60 * 60 * 1000;
      case 'm': return value * 30 * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }

  /**
   * 分析性能趋势
   */
  analyzePerformanceTrends(timeWindow = '1h') {
    const windowMs = this.parseRetentionPeriod(timeWindow);
    const cutoffTime = Date.now() - windowMs;

    const trends = {
      executionTime: this.calculateTrend('workflow', 'execution_metrics', 'totalExecutionTime', cutoffTime),
      memoryUsage: this.calculateTrend('system', 'memory_usage', 'heapUsagePercent', cutoffTime),
      throughput: this.calculateTrend('workflow', 'execution_metrics', 'throughput', cutoffTime),
      errorRate: this.calculateTrend('workflow', 'quality_metrics', 'errorRate', cutoffTime),
      apiResponseTime: this.calculateTrend('api', 'overall_metrics', 'averageResponseTime', cutoffTime)
    };

    return trends;
  }

  /**
   * 计算指标趋势
   */
  calculateTrend(category, metricName, field, cutoffTime) {
    const relevantMetrics = [];
    
    if (this.metrics[category]) {
      for (const [key, metric] of this.metrics[category]) {
        if (key.startsWith(metricName) && metric.timestamp >= cutoffTime) {
          const value = this.getNestedValue(metric.data, field);
          if (value !== undefined && value !== null) {
            relevantMetrics.push({
              timestamp: metric.timestamp,
              value: value
            });
          }
        }
      }
    }

    if (relevantMetrics.length < 2) {
      return { trend: 'insufficient_data', change: 0, dataPoints: relevantMetrics.length };
    }

    // 按时间排序
    relevantMetrics.sort((a, b) => a.timestamp - b.timestamp);

    // 计算线性趋势
    const firstValue = relevantMetrics[0].value;
    const lastValue = relevantMetrics[relevantMetrics.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;

    let trend = 'stable';
    if (Math.abs(change) > 10) {
      trend = change > 0 ? 'increasing' : 'decreasing';
    }

    return {
      trend,
      change: Math.round(change * 100) / 100,
      dataPoints: relevantMetrics.length,
      firstValue,
      lastValue,
      average: relevantMetrics.reduce((sum, m) => sum + m.value, 0) / relevantMetrics.length
    };
  }

  /**
   * 检查性能阈值并生成告警
   */
  checkPerformanceThresholds(currentMetrics) {
    const newAlerts = [];
    const thresholds = this.options.alertThresholds;

    // 检查执行时间
    if (currentMetrics.workflow?.execution?.totalExecutionTime) {
      const executionTime = currentMetrics.workflow.execution.totalExecutionTime;
      if (executionTime > thresholds.executionTime.critical) {
        newAlerts.push(this.createAlert('critical', 'execution_time', executionTime, thresholds.executionTime.critical, '工作流执行时间超过临界值'));
      } else if (executionTime > thresholds.executionTime.warning) {
        newAlerts.push(this.createAlert('warning', 'execution_time', executionTime, thresholds.executionTime.warning, '工作流执行时间超过警告值'));
      }
    }

    // 检查内存使用
    if (currentMetrics.system?.memory?.heapUsagePercent) {
      const memoryUsage = currentMetrics.system.memory.heapUsagePercent;
      if (memoryUsage > thresholds.memoryUsage.critical) {
        newAlerts.push(this.createAlert('critical', 'memory_usage', memoryUsage, thresholds.memoryUsage.critical, '内存使用率超过临界值'));
      } else if (memoryUsage > thresholds.memoryUsage.warning) {
        newAlerts.push(this.createAlert('warning', 'memory_usage', memoryUsage, thresholds.memoryUsage.warning, '内存使用率超过警告值'));
      }
    }

    // 检查API响应时间
    if (currentMetrics.api?.overall?.averageResponseTime) {
      const responseTime = currentMetrics.api.overall.averageResponseTime;
      if (responseTime > thresholds.apiResponseTime.critical) {
        newAlerts.push(this.createAlert('critical', 'api_response_time', responseTime, thresholds.apiResponseTime.critical, 'API响应时间超过临界值'));
      } else if (responseTime > thresholds.apiResponseTime.warning) {
        newAlerts.push(this.createAlert('warning', 'api_response_time', responseTime, thresholds.apiResponseTime.warning, 'API响应时间超过警告值'));
      }
    }

    // 检查错误率
    if (currentMetrics.workflow?.quality?.errorRate) {
      const errorRate = currentMetrics.workflow.quality.errorRate;
      if (errorRate > thresholds.errorRate.critical) {
        newAlerts.push(this.createAlert('critical', 'error_rate', errorRate, thresholds.errorRate.critical, '错误率超过临界值'));
      } else if (errorRate > thresholds.errorRate.warning) {
        newAlerts.push(this.createAlert('warning', 'error_rate', errorRate, thresholds.errorRate.warning, '错误率超过警告值'));
      }
    }

    // 添加新告警
    this.alerts.push(...newAlerts);

    return newAlerts;
  }

  /**
   * 创建告警对象
   */
  createAlert(severity, metric, value, threshold, message) {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      severity,
      metric,
      value,
      threshold,
      message,
      status: 'active'
    };
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport(timeWindow = '1h') {
    const trends = this.analyzePerformanceTrends(timeWindow);
    const currentMetrics = this.getCurrentMetrics();
    const alerts = this.getActiveAlerts();

    return {
      reportMetadata: {
        generatedAt: new Date().toISOString(),
        timeWindow,
        dataPoints: this.getTotalDataPoints()
      },
      currentMetrics,
      trends,
      alerts: {
        active: alerts.filter(a => a.status === 'active'),
        total: alerts.length,
        bySeverity: this.groupAlertsBySeverity(alerts)
      },
      recommendations: this.generateRecommendations(trends, alerts),
      summary: this.generateSummary(currentMetrics, trends, alerts)
    };
  }

  /**
   * 获取当前指标快照
   */
  getCurrentMetrics() {
    const latest = {};
    
    ['system', 'workflow', 'api', 'custom'].forEach(category => {
      if (this.metrics[category] && this.metrics[category].size > 0) {
        const latestEntries = Array.from(this.metrics[category].entries())
          .sort((a, b) => b[1].timestamp - a[1].timestamp)
          .slice(0, 5);
        
        latest[category] = latestEntries.reduce((acc, [key, metric]) => {
          const metricName = key.split('_')[0];
          if (!acc[metricName] || metric.timestamp > acc[metricName].timestamp) {
            acc[metricName] = metric.data;
          }
          return acc;
        }, {});
      }
    });

    return latest;
  }

  /**
   * 获取活跃告警
   */
  getActiveAlerts() {
    return this.alerts.filter(alert => alert.status === 'active');
  }

  /**
   * 按严重程度分组告警
   */
  groupAlertsBySeverity(alerts) {
    return alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * 生成性能优化建议
   */
  generateRecommendations(trends, alerts) {
    const recommendations = [];

    // 基于趋势的建议
    if (trends.executionTime.trend === 'increasing' && trends.executionTime.change > 20) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: '执行时间持续增长',
        description: '工作流执行时间呈上升趋势，建议优化处理逻辑',
        actions: ['检查数据处理瓶颈', '优化API调用', '考虑并行处理']
      });
    }

    if (trends.memoryUsage.trend === 'increasing' && trends.memoryUsage.change > 15) {
      recommendations.push({
        category: 'resource',
        priority: 'medium',
        title: '内存使用持续增长',
        description: '内存使用率呈上升趋势，可能存在内存泄漏',
        actions: ['检查内存泄漏', '优化数据结构', '实施垃圾回收优化']
      });
    }

    // 基于告警的建议
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push({
        category: 'urgent',
        priority: 'critical',
        title: '存在关键性能问题',
        description: `检测到${criticalAlerts.length}个关键告警，需要立即处理`,
        actions: ['立即检查关键告警', '暂停非必要操作', '联系技术支持']
      });
    }

    return recommendations;
  }

  /**
   * 生成性能摘要
   */
  generateSummary(currentMetrics, trends, alerts) {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const warningAlerts = alerts.filter(a => a.severity === 'warning').length;

    let healthStatus = 'healthy';
    if (criticalAlerts > 0) {
      healthStatus = 'critical';
    } else if (warningAlerts > 0) {
      healthStatus = 'warning';
    }

    return {
      healthStatus,
      overallScore: this.calculateOverallScore(currentMetrics, trends, alerts),
      keyMetrics: {
        executionTime: currentMetrics.workflow?.execution?.totalExecutionTime || 0,
        memoryUsage: currentMetrics.system?.memory?.heapUsagePercent || 0,
        throughput: currentMetrics.workflow?.execution?.throughput || 0,
        errorRate: currentMetrics.workflow?.quality?.errorRate || 0
      },
      alertSummary: {
        critical: criticalAlerts,
        warning: warningAlerts,
        total: alerts.length
      },
      trendSummary: {
        improving: Object.values(trends).filter(t => t.trend === 'decreasing' && t.change < -5).length,
        degrading: Object.values(trends).filter(t => t.trend === 'increasing' && t.change > 5).length,
        stable: Object.values(trends).filter(t => t.trend === 'stable').length
      }
    };
  }

  /**
   * 计算整体性能评分
   */
  calculateOverallScore(currentMetrics, trends, alerts) {
    let score = 100;

    // 基于当前指标扣分
    const executionTime = currentMetrics.workflow?.execution?.totalExecutionTime || 0;
    if (executionTime > 300000) score -= 20; // 超过5分钟
    else if (executionTime > 180000) score -= 10; // 超过3分钟

    const memoryUsage = currentMetrics.system?.memory?.heapUsagePercent || 0;
    if (memoryUsage > 90) score -= 15;
    else if (memoryUsage > 80) score -= 8;

    const errorRate = currentMetrics.workflow?.quality?.errorRate || 0;
    if (errorRate > 10) score -= 25;
    else if (errorRate > 5) score -= 12;

    // 基于趋势扣分
    Object.values(trends).forEach(trend => {
      if (trend.trend === 'increasing' && trend.change > 20) {
        score -= 10;
      } else if (trend.trend === 'increasing' && trend.change > 10) {
        score -= 5;
      }
    });

    // 基于告警扣分
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const warningAlerts = alerts.filter(a => a.severity === 'warning').length;
    score -= criticalAlerts * 15;
    score -= warningAlerts * 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 辅助方法
   */
  calculateThroughput(itemsProcessed, executionTime) {
    if (executionTime <= 0) return 0;
    return itemsProcessed / (executionTime / 1000);
  }

  calculateAverageItemSize(itemsProcessed, dataSize) {
    if (itemsProcessed <= 0) return 0;
    return dataSize / itemsProcessed;
  }

  calculateSuccessRate(successCount, totalCount) {
    if (totalCount <= 0) return 100;
    return (successCount / totalCount) * 100;
  }

  calculateErrorRate(errorCount, totalCount) {
    if (totalCount <= 0) return 0;
    return (errorCount / totalCount) * 100;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  getTotalDataPoints() {
    let total = 0;
    Object.values(this.metrics).forEach(categoryMap => {
      total += categoryMap.size;
    });
    return total;
  }

  /**
   * 重置收集器
   */
  reset() {
    this.metrics = {
      system: new Map(),
      workflow: new Map(),
      api: new Map(),
      custom: new Map()
    };
    this.alerts = [];
    this.startTime = Date.now();
    this.lastCollectionTime = Date.now();
  }

  /**
   * 导出指标数据
   */
  exportMetrics(format = 'json') {
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        collectorStartTime: new Date(this.startTime).toISOString(),
        totalDataPoints: this.getTotalDataPoints()
      },
      metrics: {},
      alerts: this.alerts
    };

    // 转换Map为普通对象
    Object.keys(this.metrics).forEach(category => {
      exportData.metrics[category] = {};
      for (const [key, value] of this.metrics[category]) {
        exportData.metrics[category][key] = value;
      }
    });

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }
    
    return exportData;
  }
}

module.exports = PerformanceMetricsCollector;