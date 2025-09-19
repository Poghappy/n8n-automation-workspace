/**
 * 工作流执行报告生成器
 * 为火鸟门户新闻工作流生成详细的执行报告和统计信息
 */

const fs = require('fs').promises;
const path = require('path');

class WorkflowExecutionReporter {
  constructor(options = {}) {
    this.options = {
      reportStoragePath: options.reportStoragePath || './logs/execution-reports',
      enableFileStorage: options.enableFileStorage !== false,
      enablePeriodicReports: options.enablePeriodicReports !== false,
      reportRetention: options.reportRetention || '30d',
      includeDetailedLogs: options.includeDetailedLogs !== false,
      includePerformanceAnalysis: options.includePerformanceAnalysis !== false,
      includeRecommendations: options.includeRecommendations !== false,
      ...options
    };

    this.executionHistory = [];
    this.reportTemplates = this.initializeReportTemplates();
  }

  /**
   * 初始化报告模板
   */
  initializeReportTemplates() {
    return {
      executionSummary: {
        title: '工作流执行摘要',
        sections: ['基本信息', '执行统计', '性能指标', '质量指标']
      },
      performanceAnalysis: {
        title: '性能分析报告',
        sections: ['执行时间分析', '资源使用分析', '瓶颈识别', '优化建议']
      },
      contentAnalysis: {
        title: '内容分析报告',
        sections: ['来源分析', '质量分析', '处理结果', 'AI决策分析']
      },
      errorAnalysis: {
        title: '错误分析报告',
        sections: ['错误统计', '错误分类', '错误趋势', '解决建议']
      },
      periodicSummary: {
        title: '定期汇总报告',
        sections: ['时间段统计', '趋势分析', '系统健康度', '运营建议']
      }
    };
  }

  /**
   * 生成单次执行报告
   */
  async generateExecutionReport(executionData) {
    const reportId = `execution_${executionData.executionId}_${Date.now()}`;
    const timestamp = new Date().toISOString();

    try {
      const report = {
        reportMetadata: this.generateReportMetadata(reportId, 'execution', timestamp),
        executionSummary: this.generateExecutionSummary(executionData),
        performanceAnalysis: this.generatePerformanceAnalysis(executionData),
        contentAnalysis: this.generateContentAnalysis(executionData),
        errorAnalysis: this.generateErrorAnalysis(executionData),
        recommendations: this.generateRecommendations(executionData),
        rawData: this.options.includeDetailedLogs ? executionData : null
      };

      // 添加到执行历史
      this.executionHistory.push({
        reportId,
        timestamp,
        executionId: executionData.executionId,
        status: executionData.status,
        duration: executionData.duration,
        itemsProcessed: executionData.itemsProcessed || 0
      });

      // 保存报告文件
      if (this.options.enableFileStorage) {
        await this.saveReportToFile(report, `${reportId}.json`);
      }

      console.log(`📊 执行报告已生成: ${reportId}`);
      return report;

    } catch (error) {
      console.error('❌ 生成执行报告失败:', error.message);
      throw error;
    }
  }

  /**
   * 生成报告元数据
   */
  generateReportMetadata(reportId, reportType, timestamp) {
    return {
      reportId,
      reportType,
      generatedAt: timestamp,
      generatedBy: 'WorkflowExecutionReporter',
      version: '1.0.0',
      format: 'json',
      language: 'zh-CN'
    };
  }

  /**
   * 生成执行摘要
   */
  generateExecutionSummary(executionData) {
    const startTime = executionData.startTime || executionData.workflowStatus?.startTime;
    const endTime = executionData.endTime || Date.now();
    const duration = endTime - startTime;

    return {
      basicInfo: {
        executionId: executionData.executionId,
        workflowId: executionData.workflowId,
        workflowName: executionData.workflowName || '火鸟门户新闻采集工作流',
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration: duration,
        durationFormatted: this.formatDuration(duration),
        status: executionData.status || 'completed',
        triggeredBy: executionData.triggeredBy || 'schedule'
      },

      executionStatistics: {
        totalSteps: executionData.totalSteps || 8,
        completedSteps: executionData.completedSteps || executionData.totalSteps || 8,
        failedSteps: executionData.failedSteps || 0,
        skippedSteps: executionData.skippedSteps || 0,
        completionRate: this.calculateCompletionRate(executionData)
      },

      itemProcessing: {
        totalItemsCollected: executionData.totalItemsCollected || 0,
        totalItemsProcessed: executionData.totalItemsProcessed || 0,
        successfulItems: executionData.successfulItems || 0,
        failedItems: executionData.failedItems || 0,
        skippedItems: executionData.skippedItems || 0,
        duplicateItems: executionData.duplicateItems || 0,
        publishedItems: executionData.publishedItems || 0,
        processingSuccessRate: this.calculateProcessingSuccessRate(executionData)
      },

      phaseBreakdown: this.generatePhaseBreakdown(executionData.workflowStatus || {})
    };
  }

  /**
   * 生成阶段分解统计
   */
  generatePhaseBreakdown(workflowStatus) {
    const phases = {
      initialization: {
        name: '初始化',
        completed: !!workflowStatus.initialization,
        duration: workflowStatus.initialization?.duration || 0,
        status: workflowStatus.initialization?.status || 'unknown'
      },
      dataCollection: {
        name: '数据采集',
        completed: !!workflowStatus.rssCollection || !!workflowStatus.githubCollection,
        duration: (workflowStatus.rssCollection?.duration || 0) + (workflowStatus.githubCollection?.duration || 0),
        itemsCollected: (workflowStatus.rssCollection?.itemsCollected || 0) + (workflowStatus.githubCollection?.itemsCollected || 0),
        sourcesProcessed: (workflowStatus.rssCollection?.sourcesProcessed || 0) + (workflowStatus.githubCollection?.sourcesProcessed || 0),
        status: this.determinePhaseStatus(workflowStatus.rssCollection, workflowStatus.githubCollection)
      },
      contentProcessing: {
        name: '内容处理',
        completed: !!workflowStatus.contentProcessing,
        duration: workflowStatus.contentProcessing?.duration || 0,
        itemsProcessed: workflowStatus.contentProcessing?.itemsProcessed || 0,
        averageQualityScore: workflowStatus.contentProcessing?.averageQualityScore || 0,
        status: workflowStatus.contentProcessing?.status || 'unknown'
      },
      notionStorage: {
        name: 'Notion存储',
        completed: !!workflowStatus.notionStorage,
        duration: workflowStatus.notionStorage?.duration || 0,
        itemsStored: workflowStatus.notionStorage?.itemsStored || 0,
        storageSuccessRate: workflowStatus.notionStorage?.successRate || 0,
        status: workflowStatus.notionStorage?.status || 'unknown'
      },
      aiManagement: {
        name: 'AI智能管理',
        completed: !!workflowStatus.aiManagement,
        duration: workflowStatus.aiManagement?.duration || 0,
        decisionsGenerated: workflowStatus.aiManagement?.decisionsGenerated || 0,
        optimizationsApplied: workflowStatus.aiManagement?.optimizationsApplied || 0,
        status: workflowStatus.aiManagement?.status || 'unknown'
      },
      firebirdPublish: {
        name: '火鸟门户发布',
        completed: !!workflowStatus.firebirdPublish,
        duration: workflowStatus.firebirdPublish?.duration || 0,
        itemsPublished: workflowStatus.firebirdPublish?.itemsPublished || 0,
        publishSuccessRate: workflowStatus.firebirdPublish?.successRate || 0,
        status: workflowStatus.firebirdPublish?.status || 'unknown'
      }
    };

    return phases;
  }

  /**
   * 生成性能分析
   */
  generatePerformanceAnalysis(executionData) {
    const performanceMetrics = executionData.performanceMetrics || {};
    
    return {
      executionPerformance: {
        totalExecutionTime: performanceMetrics.totalExecutionTime || 0,
        averageStepTime: this.calculateAverageStepTime(executionData),
        longestStep: this.identifyLongestStep(executionData),
        shortestStep: this.identifyShortestStep(executionData),
        throughput: this.calculateThroughput(executionData),
        efficiency: this.calculateEfficiency(executionData)
      },

      resourceUtilization: {
        peakMemoryUsage: performanceMetrics.peakMemoryUsage || 0,
        averageMemoryUsage: performanceMetrics.averageMemoryUsage || 0,
        memoryEfficiency: performanceMetrics.memoryEfficiency || 0,
        cpuUtilization: performanceMetrics.cpuUtilization || 0,
        diskIOOperations: performanceMetrics.diskIOOperations || 0
      },

      apiPerformance: {
        totalApiCalls: performanceMetrics.totalApiCalls || 0,
        averageResponseTime: performanceMetrics.averageResponseTime || 0,
        slowestApiCall: performanceMetrics.slowestApiCall || 0,
        fastestApiCall: performanceMetrics.fastestApiCall || 0,
        apiSuccessRate: performanceMetrics.apiSuccessRate || 100,
        apiBottlenecks: this.identifyApiBottlenecks(performanceMetrics)
      },

      bottleneckAnalysis: this.analyzeBottlenecks(executionData),
      performanceScore: this.calculatePerformanceScore(executionData)
    };
  }

  /**
   * 生成内容分析
   */
  generateContentAnalysis(executionData) {
    const sourceStats = executionData.sourceStats || [];
    const qualityStats = executionData.qualityStats || {};
    
    return {
      sourceAnalysis: {
        totalSources: sourceStats.length,
        activeSources: sourceStats.filter(s => s.status === 'success').length,
        failedSources: sourceStats.filter(s => s.status === 'failed').length,
        sourcePerformance: sourceStats.map(source => ({
          name: source.source || source.name,
          status: source.status,
          itemsCollected: source.itemCount || 0,
          processingTime: source.processingTime || 0,
          successRate: source.itemCount > 0 ? 100 : 0,
          reliability: this.calculateSourceReliability(source)
        })),
        sourceDistribution: this.calculateSourceDistribution(sourceStats)
      },

      qualityAnalysis: {
        overallQualityScore: qualityStats.averageQualityScore || 0,
        qualityDistribution: this.calculateQualityDistribution(executionData.items || []),
        contentCompleteness: {
          itemsWithTitles: qualityStats.itemsWithTitles || 0,
          itemsWithContent: qualityStats.itemsWithContent || 0,
          itemsWithImages: qualityStats.itemsWithImages || 0,
          itemsWithAuthors: qualityStats.itemsWithAuthors || 0,
          completenessRate: this.calculateCompletenessRate(qualityStats)
        },
        contentMetrics: {
          averageContentLength: qualityStats.averageContentLength || 0,
          averageTitleLength: qualityStats.averageTitleLength || 0,
          languageQuality: qualityStats.languageQuality || 0,
          readabilityScore: qualityStats.readabilityScore || 0
        }
      },

      processingResults: {
        duplicateDetection: {
          duplicatesFound: executionData.duplicatesFound || 0,
          duplicateRate: this.calculateDuplicateRate(executionData),
          deduplicationEfficiency: executionData.deduplicationEfficiency || 0
        },
        aiEnhancement: {
          itemsEnhanced: executionData.aiEnhancedItems || 0,
          enhancementRate: this.calculateEnhancementRate(executionData),
          qualityImprovement: executionData.qualityImprovement || 0
        },
        categoryDistribution: this.calculateCategoryDistribution(executionData.items || [])
      }
    };
  }

  /**
   * 生成错误分析
   */
  generateErrorAnalysis(executionData) {
    const errors = executionData.errors || [];
    const performanceAlerts = executionData.performanceAlerts || [];

    return {
      errorSummary: {
        totalErrors: errors.length,
        errorRate: this.calculateErrorRate(executionData),
        criticalErrors: errors.filter(e => e.severity === 'critical').length,
        warningErrors: errors.filter(e => e.severity === 'warning').length,
        recoverableErrors: errors.filter(e => e.retryable).length,
        fatalErrors: errors.filter(e => !e.retryable).length
      },

      errorBreakdown: {
        byCategory: this.groupErrorsByCategory(errors),
        byNode: this.groupErrorsByNode(errors),
        byTimeframe: this.groupErrorsByTimeframe(errors),
        topErrors: this.getTopErrors(errors, 10)
      },

      errorTrends: {
        errorFrequency: this.calculateErrorFrequency(errors),
        errorPatterns: this.identifyErrorPatterns(errors),
        recoverySuccess: this.calculateRecoverySuccess(errors)
      },

      performanceIssues: {
        totalAlerts: performanceAlerts.length,
        alertsByType: this.groupAlertsByType(performanceAlerts),
        alertsBySeverity: this.groupAlertsBySeverity(performanceAlerts),
        alertTrends: this.analyzeAlertTrends(performanceAlerts)
      },

      resolutionRecommendations: this.generateErrorResolutionRecommendations(errors, performanceAlerts)
    };
  }

  /**
   * 生成优化建议
   */
  generateRecommendations(executionData) {
    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };

    // 基于性能分析的建议
    const performanceIssues = this.identifyPerformanceIssues(executionData);
    performanceIssues.forEach(issue => {
      if (issue.severity === 'critical') {
        recommendations.immediate.push({
          category: 'performance',
          title: issue.title,
          description: issue.description,
          action: issue.recommendedAction,
          expectedImpact: issue.expectedImpact
        });
      } else if (issue.severity === 'medium') {
        recommendations.shortTerm.push({
          category: 'performance',
          title: issue.title,
          description: issue.description,
          action: issue.recommendedAction,
          expectedImpact: issue.expectedImpact
        });
      }
    });

    // 基于内容质量的建议
    const qualityIssues = this.identifyQualityIssues(executionData);
    qualityIssues.forEach(issue => {
      recommendations.shortTerm.push({
        category: 'content_quality',
        title: issue.title,
        description: issue.description,
        action: issue.recommendedAction,
        expectedImpact: issue.expectedImpact
      });
    });

    // 基于错误分析的建议
    const errorIssues = this.identifyErrorIssues(executionData);
    errorIssues.forEach(issue => {
      if (issue.frequency === 'high') {
        recommendations.immediate.push({
          category: 'error_handling',
          title: issue.title,
          description: issue.description,
          action: issue.recommendedAction,
          expectedImpact: issue.expectedImpact
        });
      } else {
        recommendations.shortTerm.push({
          category: 'error_handling',
          title: issue.title,
          description: issue.description,
          action: issue.recommendedAction,
          expectedImpact: issue.expectedImpact
        });
      }
    });

    // 长期优化建议
    recommendations.longTerm.push(
      {
        category: 'architecture',
        title: '考虑微服务架构',
        description: '将工作流拆分为独立的微服务以提高可扩展性',
        action: '评估当前架构并制定微服务迁移计划',
        expectedImpact: '提高系统可扩展性和维护性'
      },
      {
        category: 'monitoring',
        title: '实施预测性监控',
        description: '基于历史数据预测潜在问题',
        action: '部署机器学习模型进行异常检测',
        expectedImpact: '提前发现和预防系统问题'
      },
      {
        category: 'automation',
        title: '增强自动化程度',
        description: '减少人工干预，提高系统自主性',
        action: '实施智能决策系统和自动恢复机制',
        expectedImpact: '降低运维成本，提高系统可靠性'
      }
    );

    return recommendations;
  }

  /**
   * 生成定期汇总报告
   */
  async generatePeriodicReport(period = 'daily', startDate, endDate) {
    const reportId = `periodic_${period}_${Date.now()}`;
    const timestamp = new Date().toISOString();

    try {
      // 获取时间段内的执行历史
      const periodExecutions = this.getExecutionsInPeriod(startDate, endDate);
      
      const report = {
        reportMetadata: this.generateReportMetadata(reportId, 'periodic', timestamp),
        periodSummary: this.generatePeriodSummary(periodExecutions, period, startDate, endDate),
        trendAnalysis: this.generateTrendAnalysis(periodExecutions),
        systemHealth: this.generateSystemHealthReport(periodExecutions),
        operationalInsights: this.generateOperationalInsights(periodExecutions),
        recommendations: this.generatePeriodicRecommendations(periodExecutions)
      };

      // 保存报告文件
      if (this.options.enableFileStorage) {
        await this.saveReportToFile(report, `${reportId}.json`);
      }

      console.log(`📊 定期报告已生成: ${reportId} (${period})`);
      return report;

    } catch (error) {
      console.error('❌ 生成定期报告失败:', error.message);
      throw error;
    }
  }

  /**
   * 保存报告到文件
   */
  async saveReportToFile(report, filename) {
    try {
      // 确保报告目录存在
      await fs.mkdir(this.options.reportStoragePath, { recursive: true });
      
      const filePath = path.join(this.options.reportStoragePath, filename);
      await fs.writeFile(filePath, JSON.stringify(report, null, 2), 'utf8');
      
      // 清理过期报告
      await this.cleanupExpiredReports();
      
      return filePath;
    } catch (error) {
      console.error('保存报告文件失败:', error.message);
      throw error;
    }
  }

  /**
   * 清理过期报告
   */
  async cleanupExpiredReports() {
    try {
      const retentionMs = this.parseRetentionPeriod(this.options.reportRetention);
      const cutoffTime = Date.now() - retentionMs;
      
      const files = await fs.readdir(this.options.reportStoragePath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.options.reportStoragePath, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime.getTime() < cutoffTime) {
            await fs.unlink(filePath);
            console.log(`🗑️ 已清理过期报告: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('清理过期报告失败:', error.message);
    }
  }

  /**
   * 辅助方法
   */
  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟${seconds % 60}秒`;
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  }

  calculateCompletionRate(executionData) {
    const total = executionData.totalSteps || 8;
    const completed = executionData.completedSteps || total;
    return total > 0 ? (completed / total) * 100 : 100;
  }

  calculateProcessingSuccessRate(executionData) {
    const total = executionData.totalItemsProcessed || 0;
    const successful = executionData.successfulItems || 0;
    return total > 0 ? (successful / total) * 100 : 100;
  }

  determinePhaseStatus(...phases) {
    const validPhases = phases.filter(p => p && p.status);
    if (validPhases.length === 0) return 'unknown';
    
    if (validPhases.every(p => p.status === 'completed')) return 'completed';
    if (validPhases.some(p => p.status === 'failed')) return 'failed';
    if (validPhases.some(p => p.status === 'in_progress')) return 'in_progress';
    
    return 'unknown';
  }

  calculateAverageStepTime(executionData) {
    const totalTime = executionData.duration || 0;
    const totalSteps = executionData.totalSteps || 8;
    return totalSteps > 0 ? totalTime / totalSteps : 0;
  }

  identifyLongestStep(executionData) {
    // 这里需要根据实际的步骤时间数据来实现
    return { name: '数据采集', duration: 0 };
  }

  identifyShortestStep(executionData) {
    // 这里需要根据实际的步骤时间数据来实现
    return { name: '初始化', duration: 0 };
  }

  calculateThroughput(executionData) {
    const items = executionData.totalItemsProcessed || 0;
    const time = executionData.duration || 1;
    return items / (time / 1000); // items per second
  }

  calculateEfficiency(executionData) {
    const successRate = this.calculateProcessingSuccessRate(executionData);
    const throughput = this.calculateThroughput(executionData);
    return (successRate / 100) * Math.min(throughput, 10); // 效率评分
  }

  parseRetentionPeriod(retention) {
    const match = retention.match(/^(\d+)([hdwm])$/);
    if (!match) return 30 * 24 * 60 * 60 * 1000; // 默认30天

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      case 'w': return value * 7 * 24 * 60 * 60 * 1000;
      case 'm': return value * 30 * 24 * 60 * 60 * 1000;
      default: return 30 * 24 * 60 * 60 * 1000;
    }
  }

  // 更多辅助方法...
  identifyApiBottlenecks(performanceMetrics) {
    return [];
  }

  analyzeBottlenecks(executionData) {
    return [];
  }

  calculatePerformanceScore(executionData) {
    return 85; // 示例评分
  }

  calculateSourceReliability(source) {
    return source.status === 'success' ? 100 : 0;
  }

  calculateSourceDistribution(sourceStats) {
    return {};
  }

  calculateQualityDistribution(items) {
    return { excellent: 0, good: 0, fair: 0, poor: 0 };
  }

  calculateCompletenessRate(qualityStats) {
    return 0;
  }

  calculateDuplicateRate(executionData) {
    return 0;
  }

  calculateEnhancementRate(executionData) {
    return 0;
  }

  calculateCategoryDistribution(items) {
    return {};
  }

  calculateErrorRate(executionData) {
    return 0;
  }

  groupErrorsByCategory(errors) {
    return {};
  }

  groupErrorsByNode(errors) {
    return {};
  }

  groupErrorsByTimeframe(errors) {
    return {};
  }

  getTopErrors(errors, limit) {
    return errors.slice(0, limit);
  }

  calculateErrorFrequency(errors) {
    return {};
  }

  identifyErrorPatterns(errors) {
    return [];
  }

  calculateRecoverySuccess(errors) {
    return 0;
  }

  groupAlertsByType(alerts) {
    return {};
  }

  groupAlertsBySeverity(alerts) {
    return {};
  }

  analyzeAlertTrends(alerts) {
    return {};
  }

  generateErrorResolutionRecommendations(errors, alerts) {
    return [];
  }

  identifyPerformanceIssues(executionData) {
    return [];
  }

  identifyQualityIssues(executionData) {
    return [];
  }

  identifyErrorIssues(executionData) {
    return [];
  }

  getExecutionsInPeriod(startDate, endDate) {
    return this.executionHistory.filter(exec => {
      const execTime = new Date(exec.timestamp).getTime();
      return execTime >= startDate.getTime() && execTime <= endDate.getTime();
    });
  }

  generatePeriodSummary(executions, period, startDate, endDate) {
    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalExecutions: executions.length,
      successfulExecutions: executions.filter(e => e.status === 'completed').length,
      failedExecutions: executions.filter(e => e.status === 'failed').length
    };
  }

  generateTrendAnalysis(executions) {
    return {};
  }

  generateSystemHealthReport(executions) {
    return {};
  }

  generateOperationalInsights(executions) {
    return {};
  }

  generatePeriodicRecommendations(executions) {
    return { immediate: [], shortTerm: [], longTerm: [] };
  }
}

module.exports = WorkflowExecutionReporter;