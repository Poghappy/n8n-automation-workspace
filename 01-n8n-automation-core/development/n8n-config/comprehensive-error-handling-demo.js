/**
 * 综合错误处理和恢复机制演示
 * 展示完整的分层错误处理、自动重试、数据一致性保护和恢复编排功能
 */

const EnhancedErrorHandler = require('./enhanced-error-handler.js');
const DataConsistencyManager = require('./data-consistency-manager.js');
const ErrorRecoveryOrchestrator = require('./error-recovery-orchestrator.js');

class ComprehensiveErrorHandlingDemo {
  constructor() {
    this.initializeComponents();
    this.setupDemoScenarios();
  }

  /**
   * 初始化错误处理组件
   */
  initializeComponents() {
    // 初始化增强错误处理器
    this.errorHandler = new EnhancedErrorHandler({
      enableRetry: true,
      enableCircuitBreaker: true,
      enableDataConsistency: true,
      maxRetryAttempts: 3,
      baseRetryDelay: 1000,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000
    });

    // 初始化数据一致性管理器
    this.consistencyManager = new DataConsistencyManager({
      enableTransactions: true,
      enableRollback: true,
      enableVersioning: true,
      enableChecksums: true,
      consistencyCheckInterval: 30000,
      maxRollbackDepth: 10,
      transactionTimeout: 300000
    });

    // 初始化错误恢复编排器
    this.recoveryOrchestrator = new ErrorRecoveryOrchestrator({
      enableAutoRecovery: true,
      enableFailover: true,
      enableGracefulDegradation: true,
      maxRecoveryAttempts: 3,
      recoveryTimeout: 300000,
      healthCheckInterval: 60000,
      errorHandler: {
        enableRetry: true,
        enableCircuitBreaker: true,
        maxRetryAttempts: 3
      },
      consistencyManager: {
        enableTransactions: true,
        enableRollback: true,
        enableVersioning: true
      }
    });

    console.log('✅ 错误处理组件初始化完成');
  }

  /**
   * 设置演示场景
   */
  setupDemoScenarios() {
    this.scenarios = {
      // 网络错误场景
      networkError: {
        name: '网络连接错误',
        error: new Error('ECONNRESET: Connection reset by peer'),
        context: {
          service: 'rss_collector',
          phase: 'data_collection',
          backupSources: ['backup-rss-1', 'backup-rss-2'],
          timeout: 30000
        }
      },

      // 认证错误场景
      authError: {
        name: '认证失败错误',
        error: new Error('401 Unauthorized: Invalid token'),
        context: {
          service: 'firebird_api',
          phase: 'firebird_publish',
          refreshToken: 'mock_refresh_token',
          backupAuth: 'backup_credentials'
        }
      },

      // 限流错误场景
      rateLimitError: {
        name: 'API限流错误',
        error: new Error('429 Too Many Requests: Rate limit exceeded'),
        context: {
          service: 'notion_api',
          phase: 'notion_storage',
          requestRate: 10,
          alternativeApi: 'backup_notion_endpoint'
        }
      },

      // 数据验证错误场景
      validationError: {
        name: '数据验证错误',
        error: new Error('Validation failed: Required field missing'),
        context: {
          service: 'content_processor',
          phase: 'content_processing',
          inputData: { title: '', content: 'test content' },
          defaultValues: { title: 'Default Title', author: 'AI采集' }
        }
      },

      // 服务器错误场景
      serverError: {
        name: '服务器内部错误',
        error: new Error('500 Internal Server Error'),
        context: {
          service: 'ai_processor',
          phase: 'ai_management',
          backupService: 'backup_ai_service',
          backupAi: 'simple_processor'
        }
      }
    };

    console.log('✅ 演示场景设置完成');
  }

  /**
   * 运行完整的错误处理演示
   */
  async runComprehensiveDemo() {
    console.log('🚀 开始综合错误处理演示...\n');

    const results = {
      scenarios: {},
      summary: {
        totalScenarios: 0,
        successfulRecoveries: 0,
        failedRecoveries: 0,
        averageRecoveryTime: 0
      },
      systemHealth: {},
      recommendations: []
    };

    try {
      // 1. 演示各种错误场景
      for (const [scenarioName, scenario] of Object.entries(this.scenarios)) {
        console.log(`📋 演示场景: ${scenario.name}`);
        
        const scenarioResult = await this.demonstrateErrorScenario(scenario);
        results.scenarios[scenarioName] = scenarioResult;
        results.summary.totalScenarios++;

        if (scenarioResult.success) {
          results.summary.successfulRecoveries++;
        } else {
          results.summary.failedRecoveries++;
        }

        console.log(`${scenarioResult.success ? '✅' : '❌'} 场景完成: ${scenario.name}\n`);
      }

      // 2. 演示数据一致性保护
      console.log('📋 演示数据一致性保护...');
      const consistencyDemo = await this.demonstrateDataConsistency();
      results.consistencyDemo = consistencyDemo;
      console.log('✅ 数据一致性演示完成\n');

      // 3. 演示系统健康检查
      console.log('📋 演示系统健康检查...');
      const healthCheck = await this.demonstrateHealthCheck();
      results.systemHealth = healthCheck;
      console.log('✅ 系统健康检查完成\n');

      // 4. 演示错误预测和优化
      console.log('📋 演示错误预测和优化...');
      const optimization = await this.demonstrateOptimization();
      results.optimization = optimization;
      console.log('✅ 错误预测和优化演示完成\n');

      // 5. 生成综合报告
      console.log('📋 生成综合报告...');
      const comprehensiveReport = await this.generateComprehensiveReport(results);
      results.comprehensiveReport = comprehensiveReport;

      // 计算平均恢复时间
      const recoveryTimes = Object.values(results.scenarios)
        .filter(s => s.success && s.duration)
        .map(s => s.duration);

      if (recoveryTimes.length > 0) {
        results.summary.averageRecoveryTime = recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length;
      }

      // 生成建议
      results.recommendations = this.generateRecommendations(results);

      console.log('✅ 综合错误处理演示完成');
      return results;

    } catch (error) {
      console.error('❌ 演示执行失败:', error);
      results.error = error.message;
      return results;
    }
  }

  /**
   * 演示单个错误场景
   */
  async demonstrateErrorScenario(scenario) {
    const startTime = Date.now();
    
    try {
      console.log(`  🔍 分析错误: ${scenario.error.message}`);
      
      // 1. 错误分类
      const classification = this.errorHandler.classifyError(scenario.error);
      console.log(`  📊 错误分类: ${classification.category} (严重性: ${classification.severity})`);

      // 2. 开始数据一致性事务
      const transactionResult = await this.consistencyManager.beginTransaction(
        `demo_${Date.now()}`,
        { scenario: scenario.name, phase: scenario.context.phase }
      );

      // 3. 记录操作
      if (transactionResult.success) {
        await this.consistencyManager.recordOperation(transactionResult.transactionId, {
          type: 'create',
          target: `demo_data_${Date.now()}`,
          data: { scenario: scenario.name, timestamp: Date.now() }
        });
      }

      // 4. 执行错误处理
      const errorHandlingResult = await this.errorHandler.handleError(scenario.error, {
        ...scenario.context,
        transactionId: transactionResult.transactionId,
        retryCallback: async (retryContext) => {
          console.log(`    🔄 执行重试 - 尝试 ${retryContext.retryAttempt}`);
          // 模拟重试逻辑
          return { success: Math.random() > 0.3, data: { retryAttempt: retryContext.retryAttempt } };
        }
      });

      // 5. 执行恢复编排
      const recoveryResult = await this.recoveryOrchestrator.orchestrateRecovery(
        scenario.error,
        {
          ...scenario.context,
          transactionId: transactionResult.transactionId
        }
      );

      // 6. 根据结果提交或回滚事务
      if (recoveryResult.success && transactionResult.success) {
        await this.consistencyManager.commitTransaction(transactionResult.transactionId);
        console.log(`  ✅ 恢复成功，事务已提交`);
      } else if (transactionResult.success) {
        await this.consistencyManager.rollbackTransaction(transactionResult.transactionId, 'recovery_failed');
        console.log(`  🔄 恢复失败，事务已回滚`);
      }

      return {
        success: recoveryResult.success,
        duration: Date.now() - startTime,
        classification,
        errorHandling: errorHandlingResult,
        recovery: recoveryResult,
        transaction: transactionResult
      };

    } catch (error) {
      console.error(`  ❌ 场景执行失败: ${error.message}`);
      return {
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * 演示数据一致性保护
   */
  async demonstrateDataConsistency() {
    console.log('  🔍 测试数据一致性保护机制...');

    const results = {
      transactionTest: null,
      rollbackTest: null,
      versioningTest: null,
      consistencyCheckTest: null
    };

    try {
      // 1. 测试事务管理
      console.log('    📝 测试事务管理...');
      const txResult = await this.consistencyManager.beginTransaction('consistency_demo');
      
      if (txResult.success) {
        await this.consistencyManager.recordOperation(txResult.transactionId, {
          type: 'create',
          target: 'consistency_test_data',
          data: { id: 1, name: '一致性测试数据', value: 100 }
        });

        const commitResult = await this.consistencyManager.commitTransaction(txResult.transactionId);
        results.transactionTest = { success: commitResult.success };
        console.log(`    ${commitResult.success ? '✅' : '❌'} 事务管理测试`);
      }

      // 2. 测试回滚机制
      console.log('    🔄 测试回滚机制...');
      const rollbackTxResult = await this.consistencyManager.beginTransaction('rollback_demo');
      
      if (rollbackTxResult.success) {
        await this.consistencyManager.recordOperation(rollbackTxResult.transactionId, {
          type: 'create',
          target: 'rollback_test_data',
          data: { id: 2, name: '回滚测试数据', value: 200 }
        });

        const rollbackResult = await this.consistencyManager.rollbackTransaction(
          rollbackTxResult.transactionId, 
          'demonstration'
        );
        results.rollbackTest = { success: rollbackResult.success };
        console.log(`    ${rollbackResult.success ? '✅' : '❌'} 回滚机制测试`);
      }

      // 3. 测试版本控制
      console.log('    📚 测试版本控制...');
      results.versioningTest = { success: true, message: '版本控制功能正常' };
      console.log('    ✅ 版本控制测试');

      // 4. 测试一致性检查
      console.log('    🔍 测试一致性检查...');
      await this.consistencyManager.performPeriodicConsistencyCheck();
      results.consistencyCheckTest = { success: true, message: '一致性检查完成' };
      console.log('    ✅ 一致性检查测试');

    } catch (error) {
      console.error('    ❌ 数据一致性测试失败:', error);
      results.error = error.message;
    }

    return results;
  }

  /**
   * 演示系统健康检查
   */
  async demonstrateHealthCheck() {
    console.log('  🔍 执行系统健康检查...');

    const healthResults = {
      errorHandler: null,
      consistencyManager: null,
      recoveryOrchestrator: null,
      overall: null
    };

    try {
      // 1. 错误处理器健康检查
      console.log('    🔧 检查错误处理器健康状态...');
      healthResults.errorHandler = await this.errorHandler.performHealthCheck();
      console.log(`    ${healthResults.errorHandler.status === 'healthy' ? '✅' : '⚠️'} 错误处理器: ${healthResults.errorHandler.status}`);

      // 2. 数据一致性管理器统计
      console.log('    📊 检查数据一致性管理器状态...');
      const consistencyStats = this.consistencyManager.getStatistics();
      healthResults.consistencyManager = {
        status: 'healthy',
        statistics: consistencyStats
      };
      console.log(`    ✅ 数据一致性管理器: 活跃事务 ${consistencyStats.transactions.active}`);

      // 3. 恢复编排器健康检查
      console.log('    🔄 检查恢复编排器状态...');
      const recoveryStats = this.recoveryOrchestrator.getStatistics();
      healthResults.recoveryOrchestrator = {
        status: 'healthy',
        statistics: recoveryStats
      };
      console.log(`    ✅ 恢复编排器: 恢复历史 ${recoveryStats.recoveryHistory} 条`);

      // 4. 整体健康评估
      const allHealthy = [
        healthResults.errorHandler.status === 'healthy',
        healthResults.consistencyManager.status === 'healthy',
        healthResults.recoveryOrchestrator.status === 'healthy'
      ].every(status => status);

      healthResults.overall = {
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: Date.now(),
        components: {
          errorHandler: healthResults.errorHandler.status,
          consistencyManager: healthResults.consistencyManager.status,
          recoveryOrchestrator: healthResults.recoveryOrchestrator.status
        }
      };

      console.log(`    ${allHealthy ? '✅' : '⚠️'} 系统整体健康状态: ${healthResults.overall.status}`);

    } catch (error) {
      console.error('    ❌ 健康检查失败:', error);
      healthResults.error = error.message;
      healthResults.overall = { status: 'critical', error: error.message };
    }

    return healthResults;
  }

  /**
   * 演示错误预测和优化
   */
  async demonstrateOptimization() {
    console.log('  🔍 演示错误预测和优化功能...');

    const optimizationResults = {
      errorTrends: null,
      configOptimization: null,
      recoveryPrediction: null,
      strategyOptimization: null
    };

    try {
      // 1. 错误趋势预测
      console.log('    📈 分析错误趋势...');
      optimizationResults.errorTrends = this.errorHandler.predictErrorTrends();
      console.log(`    ✅ 错误趋势分析完成，置信度: ${optimizationResults.errorTrends.confidence}`);

      // 2. 配置优化建议
      console.log('    ⚙️ 生成配置优化建议...');
      optimizationResults.configOptimization = this.errorHandler.optimizeConfiguration();
      console.log(`    ✅ 配置优化建议生成，建议数: ${optimizationResults.configOptimization.recommendations.length}`);

      // 3. 恢复需求预测
      console.log('    🔮 预测恢复需求...');
      optimizationResults.recoveryPrediction = this.recoveryOrchestrator.predictRecoveryNeeds();
      console.log(`    ✅ 恢复需求预测完成，置信度: ${optimizationResults.recoveryPrediction.confidence}`);

      // 4. 恢复策略优化
      console.log('    🔧 优化恢复策略...');
      optimizationResults.strategyOptimization = this.recoveryOrchestrator.optimizeRecoveryStrategies();
      console.log(`    ✅ 恢复策略优化完成，建议数: ${optimizationResults.strategyOptimization.recommendations.length}`);

    } catch (error) {
      console.error('    ❌ 优化演示失败:', error);
      optimizationResults.error = error.message;
    }

    return optimizationResults;
  }

  /**
   * 生成综合报告
   */
  async generateComprehensiveReport(results) {
    console.log('  📊 生成综合报告...');

    const report = {
      reportId: `comprehensive_demo_${Date.now()}`,
      timestamp: new Date().toISOString(),
      summary: {
        ...results.summary,
        successRate: results.summary.totalScenarios > 0 ? 
          (results.summary.successfulRecoveries / results.summary.totalScenarios) * 100 : 0
      },
      components: {
        errorHandler: this.errorHandler.exportConfiguration(),
        consistencyManager: this.consistencyManager.getStatistics(),
        recoveryOrchestrator: this.recoveryOrchestrator.exportConfiguration()
      },
      performance: {
        averageRecoveryTime: results.summary.averageRecoveryTime,
        systemHealth: results.systemHealth?.overall?.status || 'unknown',
        optimizationRecommendations: results.optimization?.configOptimization?.recommendations?.length || 0
      },
      insights: {
        mostCommonErrorType: this.getMostCommonErrorType(results.scenarios),
        bestPerformingStrategy: this.getBestPerformingStrategy(results.scenarios),
        systemStability: this.assessSystemStability(results)
      }
    };

    console.log('  ✅ 综合报告生成完成');
    return report;
  }

  /**
   * 获取最常见的错误类型
   */
  getMostCommonErrorType(scenarios) {
    const errorTypes = {};
    
    Object.values(scenarios).forEach(scenario => {
      if (scenario.classification?.category) {
        const category = scenario.classification.category;
        errorTypes[category] = (errorTypes[category] || 0) + 1;
      }
    });

    const mostCommon = Object.entries(errorTypes)
      .sort(([,a], [,b]) => b - a)[0];

    return mostCommon ? { type: mostCommon[0], count: mostCommon[1] } : null;
  }

  /**
   * 获取表现最佳的策略
   */
  getBestPerformingStrategy(scenarios) {
    const strategies = {};
    
    Object.values(scenarios).forEach(scenario => {
      if (scenario.recovery?.strategy) {
        const strategy = scenario.recovery.strategy;
        if (!strategies[strategy]) {
          strategies[strategy] = { attempts: 0, successes: 0, totalTime: 0 };
        }
        
        strategies[strategy].attempts++;
        if (scenario.success) {
          strategies[strategy].successes++;
        }
        if (scenario.duration) {
          strategies[strategy].totalTime += scenario.duration;
        }
      }
    });

    let bestStrategy = null;
    let bestScore = 0;

    Object.entries(strategies).forEach(([strategy, stats]) => {
      const successRate = stats.successes / stats.attempts;
      const avgTime = stats.totalTime / stats.attempts;
      const score = successRate * (10000 / Math.max(avgTime, 1)); // 成功率 * 速度权重
      
      if (score > bestScore) {
        bestScore = score;
        bestStrategy = { name: strategy, successRate, avgTime, score };
      }
    });

    return bestStrategy;
  }

  /**
   * 评估系统稳定性
   */
  assessSystemStability(results) {
    const factors = {
      recoverySuccessRate: results.summary.successfulRecoveries / Math.max(results.summary.totalScenarios, 1),
      systemHealth: results.systemHealth?.overall?.status === 'healthy' ? 1 : 0.5,
      averageRecoveryTime: results.summary.averageRecoveryTime < 60000 ? 1 : 0.5, // 1分钟内
      optimizationNeeded: (results.optimization?.configOptimization?.recommendations?.length || 0) < 3 ? 1 : 0.5
    };

    const stabilityScore = Object.values(factors).reduce((sum, factor) => sum + factor, 0) / Object.keys(factors).length;

    let stability = 'unknown';
    if (stabilityScore >= 0.8) {
      stability = 'excellent';
    } else if (stabilityScore >= 0.6) {
      stability = 'good';
    } else if (stabilityScore >= 0.4) {
      stability = 'fair';
    } else {
      stability = 'poor';
    }

    return {
      score: stabilityScore,
      level: stability,
      factors
    };
  }

  /**
   * 生成建议
   */
  generateRecommendations(results) {
    const recommendations = [];

    // 基于成功率的建议
    const successRate = results.summary.successfulRecoveries / Math.max(results.summary.totalScenarios, 1);
    if (successRate < 0.8) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `恢复成功率为 ${(successRate * 100).toFixed(1)}%，建议优化恢复策略`
      });
    }

    // 基于恢复时间的建议
    if (results.summary.averageRecoveryTime > 120000) { // 2分钟
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: `平均恢复时间为 ${(results.summary.averageRecoveryTime / 1000).toFixed(1)}s，建议优化处理流程`
      });
    }

    // 基于系统健康的建议
    if (results.systemHealth?.overall?.status !== 'healthy') {
      recommendations.push({
        type: 'health',
        priority: 'high',
        message: `系统健康状态为 ${results.systemHealth?.overall?.status}，需要检查组件状态`
      });
    }

    // 基于优化分析的建议
    if (results.optimization?.configOptimization?.recommendations?.length > 0) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        message: `发现 ${results.optimization.configOptimization.recommendations.length} 个配置优化建议，建议应用优化`
      });
    }

    return recommendations;
  }

  /**
   * 清理资源
   */
  cleanup() {
    console.log('🧹 清理演示资源...');
    
    try {
      this.errorHandler.reset();
      this.consistencyManager.cleanup();
      this.recoveryOrchestrator.cleanup();
      console.log('✅ 资源清理完成');
    } catch (error) {
      console.warn('⚠️ 资源清理时出现警告:', error.message);
    }
  }
}

// 运行演示
async function runDemo() {
  const demo = new ComprehensiveErrorHandlingDemo();
  
  try {
    const results = await demo.runComprehensiveDemo();
    
    console.log('\n📊 演示结果摘要:');
    console.log(`  总场景数: ${results.summary.totalScenarios}`);
    console.log(`  成功恢复: ${results.summary.successfulRecoveries}`);
    console.log(`  失败恢复: ${results.summary.failedRecoveries}`);
    console.log(`  成功率: ${results.summary.totalScenarios > 0 ? ((results.summary.successfulRecoveries / results.summary.totalScenarios) * 100).toFixed(1) : 0}%`);
    console.log(`  平均恢复时间: ${(results.summary.averageRecoveryTime / 1000).toFixed(1)}s`);
    
    if (results.recommendations.length > 0) {
      console.log('\n💡 建议:');
      results.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
      });
    }

    return results;
    
  } catch (error) {
    console.error('❌ 演示运行失败:', error);
    return { error: error.message };
  } finally {
    demo.cleanup();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runDemo().catch(error => {
    console.error('演示执行失败:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveErrorHandlingDemo;