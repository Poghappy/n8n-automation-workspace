/**
 * 错误处理和恢复机制测试脚本
 * 验证分层错误处理、自动重试、数据一致性和恢复编排功能
 */

const fs = require('fs').promises;
const path = require('path');

// 导入错误处理模块
const EnhancedErrorHandler = require('../n8n-config/enhanced-error-handler.js');
const DataConsistencyManager = require('../n8n-config/data-consistency-manager.js');
const ErrorRecoveryOrchestrator = require('../n8n-config/error-recovery-orchestrator.js');

class ErrorHandlingRecoveryTester {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    
    // 初始化组件
    this.errorHandler = new EnhancedErrorHandler({
      enableRetry: true,
      enableCircuitBreaker: true,
      enableDataConsistency: true,
      maxRetryAttempts: 3,
      baseRetryDelay: 100, // 测试时使用较短延迟
      circuitBreakerThreshold: 3,
      circuitBreakerTimeout: 5000
    });

    this.consistencyManager = new DataConsistencyManager({
      enableTransactions: true,
      enableRollback: true,
      enableVersioning: true,
      enableChecksums: true,
      consistencyCheckInterval: 5000, // 测试时使用较短间隔
      maxRollbackDepth: 5,
      transactionTimeout: 30000
    });

    this.recoveryOrchestrator = new ErrorRecoveryOrchestrator({
      enableAutoRecovery: true,
      enableFailover: true,
      enableGracefulDegradation: true,
      maxRecoveryAttempts: 2,
      recoveryTimeout: 30000,
      healthCheckInterval: 10000
    });
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始错误处理和恢复机制测试...\n');

    try {
      // 1. 错误处理器测试
      await this.testErrorHandler();
      
      // 2. 数据一致性管理器测试
      await this.testDataConsistencyManager();
      
      // 3. 错误恢复编排器测试
      await this.testErrorRecoveryOrchestrator();
      
      // 4. 集成测试
      await this.testIntegration();
      
      // 5. 性能测试
      await this.testPerformance();
      
      // 6. 压力测试
      await this.testStressScenarios();

      // 7. 综合演示测试
      await this.testComprehensiveDemo();

      // 8. 高级功能测试
      await this.testAdvancedFeatures();

      // 生成测试报告
      await this.generateTestReport();

    } catch (error) {
      console.error('❌ 测试执行失败:', error);
      this.recordTestResult('test_execution', false, error.message);
    } finally {
      // 清理资源
      this.cleanup();
    }
  }

  /**
   * 测试错误处理器
   */
  async testErrorHandler() {
    console.log('📋 测试错误处理器...');

    // 测试1: 错误分类
    await this.testErrorClassification();
    
    // 测试2: 重试机制
    await this.testRetryMechanism();
    
    // 测试3: 熔断器
    await this.testCircuitBreaker();
    
    // 测试4: 恢复策略
    await this.testRecoveryStrategies();

    console.log('✅ 错误处理器测试完成\n');
  }

  /**
   * 测试错误分类
   */
  async testErrorClassification() {
    console.log('  🔍 测试错误分类...');

    const testCases = [
      {
        name: '网络错误',
        error: new Error('ECONNRESET: Connection reset by peer'),
        expectedCategory: 'network',
        expectedRetryable: true
      },
      {
        name: '认证错误',
        error: new Error('401 Unauthorized: Invalid token'),
        expectedCategory: 'authentication',
        expectedRetryable: false
      },
      {
        name: '限流错误',
        error: new Error('429 Too Many Requests: Rate limit exceeded'),
        expectedCategory: 'rate_limit',
        expectedRetryable: true
      },
      {
        name: '服务器错误',
        error: new Error('500 Internal Server Error'),
        expectedCategory: 'server_error',
        expectedRetryable: true
      },
      {
        name: '验证错误',
        error: new Error('Validation failed: Required field missing'),
        expectedCategory: 'validation',
        expectedRetryable: false
      }
    ];

    for (const testCase of testCases) {
      try {
        const classification = this.errorHandler.classifyError(testCase.error);
        
        const success = classification.category === testCase.expectedCategory &&
                        classification.retryable === testCase.expectedRetryable;
        
        this.recordTestResult(
          `error_classification_${testCase.name}`,
          success,
          success ? '分类正确' : `期望: ${testCase.expectedCategory}/${testCase.expectedRetryable}, 实际: ${classification.category}/${classification.retryable}`
        );

      } catch (error) {
        this.recordTestResult(`error_classification_${testCase.name}`, false, error.message);
      }
    }
  }

  /**
   * 测试重试机制
   */
  async testRetryMechanism() {
    console.log('  🔄 测试重试机制...');

    let retryCount = 0;
    const maxRetries = 3;

    const context = {
      service: 'test_service',
      retryCallback: async (retryContext) => {
        retryCount++;
        console.log(`    重试尝试 ${retryCount}/${maxRetries}`);
        
        // 前两次失败，第三次成功
        if (retryCount < 3) {
          throw new Error('模拟重试失败');
        }
        
        return { success: true, data: { retryCount } };
      }
    };

    try {
      const result = await this.errorHandler.handleError(
        new Error('ECONNRESET: Connection reset'),
        context
      );

      const success = result.success && retryCount === 3;
      this.recordTestResult(
        'retry_mechanism',
        success,
        success ? `重试成功，尝试次数: ${retryCount}` : `重试失败或次数不正确: ${retryCount}`
      );

    } catch (error) {
      this.recordTestResult('retry_mechanism', false, error.message);
    }
  }

  /**
   * 测试熔断器
   */
  async testCircuitBreaker() {
    console.log('  🔴 测试熔断器...');

    const service = 'test_circuit_breaker';
    const context = { service };

    try {
      // 触发多次失败以开启熔断器
      for (let i = 0; i < 5; i++) {
        await this.errorHandler.handleError(new Error('服务不可用'), context);
      }

      // 检查熔断器状态
      const circuitBreakerStatus = this.errorHandler.getCircuitBreakerStatus();
      const isOpen = circuitBreakerStatus[service]?.state === 'open';

      this.recordTestResult(
        'circuit_breaker_open',
        isOpen,
        isOpen ? '熔断器正确开启' : '熔断器未按预期开启'
      );

      // 测试熔断器开启时的行为
      const result = await this.errorHandler.handleError(new Error('测试请求'), context);
      const isBlocked = result.circuitBreakerOpen === true;

      this.recordTestResult(
        'circuit_breaker_blocking',
        isBlocked,
        isBlocked ? '熔断器正确阻止请求' : '熔断器未阻止请求'
      );

    } catch (error) {
      this.recordTestResult('circuit_breaker', false, error.message);
    }
  }

  /**
   * 测试恢复策略
   */
  async testRecoveryStrategies() {
    console.log('  🔧 测试恢复策略...');

    const testCases = [
      {
        name: '网络恢复',
        error: new Error('ECONNRESET'),
        expectedStrategy: 'network_recovery'
      },
      {
        name: '认证恢复',
        error: new Error('401 Unauthorized'),
        expectedStrategy: 'auth_recovery'
      },
      {
        name: '限流恢复',
        error: new Error('429 Rate limit'),
        expectedStrategy: 'rate_limit_recovery'
      }
    ];

    for (const testCase of testCases) {
      try {
        const classification = this.errorHandler.classifyError(testCase.error);
        const success = classification.recoveryStrategy === testCase.expectedStrategy;

        this.recordTestResult(
          `recovery_strategy_${testCase.name}`,
          success,
          success ? '恢复策略正确' : `期望: ${testCase.expectedStrategy}, 实际: ${classification.recoveryStrategy}`
        );

      } catch (error) {
        this.recordTestResult(`recovery_strategy_${testCase.name}`, false, error.message);
      }
    }
  }

  /**
   * 测试数据一致性管理器
   */
  async testDataConsistencyManager() {
    console.log('📋 测试数据一致性管理器...');

    // 测试1: 事务管理
    await this.testTransactionManagement();
    
    // 测试2: 数据版本控制
    await this.testVersionControl();
    
    // 测试3: 回滚机制
    await this.testRollbackMechanism();
    
    // 测试4: 一致性检查
    await this.testConsistencyChecks();

    console.log('✅ 数据一致性管理器测试完成\n');
  }

  /**
   * 测试事务管理
   */
  async testTransactionManagement() {
    console.log('  💾 测试事务管理...');

    try {
      // 开始事务
      const beginResult = await this.consistencyManager.beginTransaction('test_tx_1', {
        type: 'test',
        description: '测试事务'
      });

      const transactionStarted = beginResult.success && beginResult.transactionId;
      this.recordTestResult(
        'transaction_begin',
        transactionStarted,
        transactionStarted ? '事务开始成功' : '事务开始失败'
      );

      if (transactionStarted) {
        // 记录操作
        const operationId = await this.consistencyManager.recordOperation(beginResult.transactionId, {
          type: 'create',
          target: 'test_data_1',
          data: { id: 1, name: '测试数据', value: 100 }
        });

        const operationRecorded = !!operationId;
        this.recordTestResult(
          'transaction_record_operation',
          operationRecorded,
          operationRecorded ? '操作记录成功' : '操作记录失败'
        );

        // 提交事务
        const commitResult = await this.consistencyManager.commitTransaction(beginResult.transactionId);
        const transactionCommitted = commitResult.success;

        this.recordTestResult(
          'transaction_commit',
          transactionCommitted,
          transactionCommitted ? '事务提交成功' : '事务提交失败'
        );
      }

    } catch (error) {
      this.recordTestResult('transaction_management', false, error.message);
    }
  }

  /**
   * 测试版本控制
   */
  async testVersionControl() {
    console.log('  📚 测试版本控制...');

    try {
      const beginResult = await this.consistencyManager.beginTransaction('test_version_tx');
      
      if (beginResult.success) {
        // 创建初始版本
        await this.consistencyManager.recordOperation(beginResult.transactionId, {
          type: 'create',
          target: 'versioned_data',
          data: { version: 1, content: '初始内容' }
        });

        // 更新版本
        await this.consistencyManager.recordOperation(beginResult.transactionId, {
          type: 'update',
          target: 'versioned_data',
          data: { version: 2, content: '更新内容' }
        });

        await this.consistencyManager.commitTransaction(beginResult.transactionId);

        // 检查版本历史
        const stats = this.consistencyManager.getStatistics();
        const hasVersions = stats.versions.totalVersions > 0;

        this.recordTestResult(
          'version_control',
          hasVersions,
          hasVersions ? '版本控制正常工作' : '版本控制未生成版本'
        );
      }

    } catch (error) {
      this.recordTestResult('version_control', false, error.message);
    }
  }

  /**
   * 测试回滚机制
   */
  async testRollbackMechanism() {
    console.log('  ↩️ 测试回滚机制...');

    try {
      const beginResult = await this.consistencyManager.beginTransaction('test_rollback_tx');
      
      if (beginResult.success) {
        // 记录一些操作
        await this.consistencyManager.recordOperation(beginResult.transactionId, {
          type: 'create',
          target: 'rollback_test_1',
          data: { id: 1, status: 'created' }
        });

        await this.consistencyManager.recordOperation(beginResult.transactionId, {
          type: 'update',
          target: 'rollback_test_1',
          data: { id: 1, status: 'updated' }
        });

        // 执行回滚
        const rollbackResult = await this.consistencyManager.rollbackTransaction(
          beginResult.transactionId,
          'test_rollback'
        );

        const rollbackSuccess = rollbackResult.success && rollbackResult.operationsRolledBack > 0;
        this.recordTestResult(
          'rollback_mechanism',
          rollbackSuccess,
          rollbackSuccess ? `回滚成功，回滚操作数: ${rollbackResult.operationsRolledBack}` : '回滚失败'
        );
      }

    } catch (error) {
      this.recordTestResult('rollback_mechanism', false, error.message);
    }
  }

  /**
   * 测试一致性检查
   */
  async testConsistencyChecks() {
    console.log('  🔍 测试一致性检查...');

    try {
      // 执行一致性检查
      await this.consistencyManager.performPeriodicConsistencyCheck();
      
      // 检查统计信息
      const stats = this.consistencyManager.getStatistics();
      const hasConsistencyChecks = stats.consistencyChecks.total > 0;

      this.recordTestResult(
        'consistency_checks',
        hasConsistencyChecks,
        hasConsistencyChecks ? '一致性检查正常执行' : '一致性检查未执行'
      );

    } catch (error) {
      this.recordTestResult('consistency_checks', false, error.message);
    }
  }

  /**
   * 测试错误恢复编排器
   */
  async testErrorRecoveryOrchestrator() {
    console.log('📋 测试错误恢复编排器...');

    // 测试1: 错误分析
    await this.testErrorAnalysis();
    
    // 测试2: 恢复计划创建
    await this.testRecoveryPlanCreation();
    
    // 测试3: 恢复执行
    await this.testRecoveryExecution();
    
    // 测试4: 系统健康检查
    await this.testSystemHealthCheck();

    console.log('✅ 错误恢复编排器测试完成\n');
  }

  /**
   * 测试错误分析
   */
  async testErrorAnalysis() {
    console.log('  🔍 测试错误分析...');

    try {
      const error = new Error('测试错误分析');
      const context = {
        phase: 'data_collection',
        service: 'rss_collector',
        workflowId: 'test_workflow'
      };

      const analysis = await this.recoveryOrchestrator.analyzeError(error, context);
      
      const hasClassification = !!analysis.classification;
      const hasImpact = !!analysis.impact;
      const hasRecoverability = !!analysis.recoverability;
      const hasSystemHealth = !!analysis.systemHealth;

      const analysisComplete = hasClassification && hasImpact && hasRecoverability && hasSystemHealth;

      this.recordTestResult(
        'error_analysis',
        analysisComplete,
        analysisComplete ? '错误分析完整' : '错误分析不完整'
      );

    } catch (error) {
      this.recordTestResult('error_analysis', false, error.message);
    }
  }

  /**
   * 测试恢复计划创建
   */
  async testRecoveryPlanCreation() {
    console.log('  📋 测试恢复计划创建...');

    try {
      const errorAnalysis = {
        classification: { category: 'network', severity: 'medium', retryable: true },
        impact: { scope: 'data_collection', severity: 'medium', dataIntegrityRisk: 'low' },
        recoverability: { feasible: true, confidence: 0.8 },
        systemHealth: { overall: 'healthy' }
      };

      const context = { phase: 'data_collection' };
      const plan = await this.recoveryOrchestrator.createRecoveryPlan(errorAnalysis, context);

      const hasStrategy = !!plan.strategy;
      const hasSteps = plan.steps && plan.steps.length > 0;
      const hasPriority = !!plan.priority;

      const planComplete = hasStrategy && hasSteps && hasPriority;

      this.recordTestResult(
        'recovery_plan_creation',
        planComplete,
        planComplete ? `恢复计划创建成功: ${plan.strategy}` : '恢复计划创建不完整'
      );

    } catch (error) {
      this.recordTestResult('recovery_plan_creation', false, error.message);
    }
  }

  /**
   * 测试恢复执行
   */
  async testRecoveryExecution() {
    console.log('  🔧 测试恢复执行...');

    try {
      const error = new Error('网络连接失败');
      const context = {
        phase: 'data_collection',
        service: 'test_service',
        workflowId: 'test_workflow',
        backupSources: ['backup1', 'backup2']
      };

      const recoveryResult = await this.recoveryOrchestrator.orchestrateRecovery(error, context);

      const hasRecoveryId = !!recoveryResult.recoveryId;
      const hasStrategy = !!recoveryResult.strategy;
      const hasNextAction = !!recoveryResult.nextAction;

      const recoveryExecuted = hasRecoveryId && hasStrategy && hasNextAction;

      this.recordTestResult(
        'recovery_execution',
        recoveryExecuted,
        recoveryExecuted ? `恢复执行完成: ${recoveryResult.strategy}` : '恢复执行不完整'
      );

    } catch (error) {
      this.recordTestResult('recovery_execution', false, error.message);
    }
  }

  /**
   * 测试系统健康检查
   */
  async testSystemHealthCheck() {
    console.log('  💚 测试系统健康检查...');

    try {
      const context = { service: 'test_service' };
      const health = await this.recoveryOrchestrator.analyzeSystemHealth(context);

      const hasOverallStatus = !!health.overall;
      const hasComponents = !!health.components;
      const hasResources = !!health.resources;
      const hasPerformance = !!health.performance;

      const healthCheckComplete = hasOverallStatus && hasComponents && hasResources && hasPerformance;

      this.recordTestResult(
        'system_health_check',
        healthCheckComplete,
        healthCheckComplete ? `系统健康状态: ${health.overall}` : '系统健康检查不完整'
      );

    } catch (error) {
      this.recordTestResult('system_health_check', false, error.message);
    }
  }

  /**
   * 测试集成功能
   */
  async testIntegration() {
    console.log('📋 测试集成功能...');

    // 测试完整的错误处理流程
    await this.testCompleteErrorHandlingFlow();
    
    // 测试组件间协作
    await this.testComponentCoordination();

    console.log('✅ 集成测试完成\n');
  }

  /**
   * 测试完整的错误处理流程
   */
  async testCompleteErrorHandlingFlow() {
    console.log('  🔄 测试完整错误处理流程...');

    try {
      // 1. 开始事务
      const beginResult = await this.consistencyManager.beginTransaction('integration_test_tx');
      
      if (beginResult.success) {
        // 2. 记录操作
        await this.consistencyManager.recordOperation(beginResult.transactionId, {
          type: 'create',
          target: 'integration_test_data',
          data: { id: 1, status: 'processing' }
        });

        // 3. 模拟错误
        const error = new Error('集成测试错误');
        const context = {
          phase: 'content_processing',
          service: 'integration_test',
          transactionId: beginResult.transactionId
        };

        // 4. 执行错误处理
        const errorResult = await this.errorHandler.handleError(error, context);
        
        // 5. 执行恢复编排
        const recoveryResult = await this.recoveryOrchestrator.orchestrateRecovery(error, context);

        // 6. 根据结果决定事务处理
        if (recoveryResult.success) {
          await this.consistencyManager.commitTransaction(beginResult.transactionId);
        } else {
          await this.consistencyManager.rollbackTransaction(beginResult.transactionId, 'recovery_failed');
        }

        const flowComplete = !!errorResult.errorId && !!recoveryResult.recoveryId;
        this.recordTestResult(
          'complete_error_handling_flow',
          flowComplete,
          flowComplete ? '完整错误处理流程执行成功' : '完整错误处理流程执行失败'
        );
      }

    } catch (error) {
      this.recordTestResult('complete_error_handling_flow', false, error.message);
    }
  }

  /**
   * 测试组件间协作
   */
  async testComponentCoordination() {
    console.log('  🤝 测试组件间协作...');

    try {
      // 获取各组件统计信息
      const errorStats = this.errorHandler.getErrorStats();
      const consistencyStats = this.consistencyManager.getStatistics();
      const recoveryStats = this.recoveryOrchestrator.getStatistics();

      const hasErrorStats = Object.keys(errorStats).length > 0;
      const hasConsistencyStats = consistencyStats.transactions.total > 0;
      const hasRecoveryStats = recoveryStats.recoveryHistory > 0;

      const coordinationWorking = hasErrorStats || hasConsistencyStats || hasRecoveryStats;

      this.recordTestResult(
        'component_coordination',
        coordinationWorking,
        coordinationWorking ? '组件间协作正常' : '组件间协作异常'
      );

    } catch (error) {
      this.recordTestResult('component_coordination', false, error.message);
    }
  }

  /**
   * 测试性能
   */
  async testPerformance() {
    console.log('📋 测试性能...');

    // 测试错误处理性能
    await this.testErrorHandlingPerformance();
    
    // 测试事务性能
    await this.testTransactionPerformance();

    console.log('✅ 性能测试完成\n');
  }

  /**
   * 测试错误处理性能
   */
  async testErrorHandlingPerformance() {
    console.log('  ⚡ 测试错误处理性能...');

    const iterations = 100;
    const startTime = Date.now();

    try {
      for (let i = 0; i < iterations; i++) {
        const error = new Error(`性能测试错误 ${i}`);
        const context = { service: 'performance_test', iteration: i };
        
        await this.errorHandler.handleError(error, context);
      }

      const duration = Date.now() - startTime;
      const averageTime = duration / iterations;
      const performanceAcceptable = averageTime < 50; // 平均每次处理应少于50ms

      this.recordTestResult(
        'error_handling_performance',
        performanceAcceptable,
        `平均处理时间: ${averageTime.toFixed(2)}ms (${performanceAcceptable ? '合格' : '不合格'})`
      );

    } catch (error) {
      this.recordTestResult('error_handling_performance', false, error.message);
    }
  }

  /**
   * 测试事务性能
   */
  async testTransactionPerformance() {
    console.log('  ⚡ 测试事务性能...');

    const iterations = 50;
    const startTime = Date.now();

    try {
      for (let i = 0; i < iterations; i++) {
        const beginResult = await this.consistencyManager.beginTransaction(`perf_test_${i}`);
        
        if (beginResult.success) {
          await this.consistencyManager.recordOperation(beginResult.transactionId, {
            type: 'create',
            target: `perf_data_${i}`,
            data: { id: i, timestamp: Date.now() }
          });

          await this.consistencyManager.commitTransaction(beginResult.transactionId);
        }
      }

      const duration = Date.now() - startTime;
      const averageTime = duration / iterations;
      const performanceAcceptable = averageTime < 100; // 平均每次事务应少于100ms

      this.recordTestResult(
        'transaction_performance',
        performanceAcceptable,
        `平均事务时间: ${averageTime.toFixed(2)}ms (${performanceAcceptable ? '合格' : '不合格'})`
      );

    } catch (error) {
      this.recordTestResult('transaction_performance', false, error.message);
    }
  }

  /**
   * 测试压力场景
   */
  async testStressScenarios() {
    console.log('📋 测试压力场景...');

    // 测试并发错误处理
    await this.testConcurrentErrorHandling();
    
    // 测试大量事务
    await this.testHighVolumeTransactions();

    console.log('✅ 压力测试完成\n');
  }

  /**
   * 测试并发错误处理
   */
  async testConcurrentErrorHandling() {
    console.log('  🔀 测试并发错误处理...');

    const concurrency = 20;
    const promises = [];

    try {
      for (let i = 0; i < concurrency; i++) {
        const promise = this.errorHandler.handleError(
          new Error(`并发错误 ${i}`),
          { service: 'concurrent_test', id: i }
        );
        promises.push(promise);
      }

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const successRate = (successCount / concurrency) * 100;

      const concurrencyHandled = successRate >= 90; // 至少90%成功率

      this.recordTestResult(
        'concurrent_error_handling',
        concurrencyHandled,
        `并发处理成功率: ${successRate.toFixed(1)}% (${concurrencyHandled ? '合格' : '不合格'})`
      );

    } catch (error) {
      this.recordTestResult('concurrent_error_handling', false, error.message);
    }
  }

  /**
   * 测试大量事务
   */
  async testHighVolumeTransactions() {
    console.log('  📊 测试大量事务...');

    const transactionCount = 100;
    let successCount = 0;

    try {
      for (let i = 0; i < transactionCount; i++) {
        try {
          const beginResult = await this.consistencyManager.beginTransaction(`volume_test_${i}`);
          
          if (beginResult.success) {
            await this.consistencyManager.recordOperation(beginResult.transactionId, {
              type: 'create',
              target: `volume_data_${i}`,
              data: { id: i, batch: 'volume_test' }
            });

            const commitResult = await this.consistencyManager.commitTransaction(beginResult.transactionId);
            if (commitResult.success) {
              successCount++;
            }
          }
        } catch (txError) {
          // 记录但继续处理
          console.warn(`    事务 ${i} 失败:`, txError.message);
        }
      }

      const successRate = (successCount / transactionCount) * 100;
      const volumeHandled = successRate >= 95; // 至少95%成功率

      this.recordTestResult(
        'high_volume_transactions',
        volumeHandled,
        `大量事务成功率: ${successRate.toFixed(1)}% (${successCount}/${transactionCount})`
      );

    } catch (error) {
      this.recordTestResult('high_volume_transactions', false, error.message);
    }
  }

  /**
   * 记录测试结果
   */
  recordTestResult(testName, success, details) {
    const result = {
      testName,
      success,
      details,
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime
    };

    this.testResults.push(result);
    
    const status = success ? '✅' : '❌';
    console.log(`    ${status} ${testName}: ${details}`);
  }

  /**
   * 生成测试报告
   */
  async generateTestReport() {
    console.log('📊 生成测试报告...');

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests) * 100;
    const totalDuration = Date.now() - this.startTime;

    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: successRate.toFixed(2) + '%',
        totalDuration: totalDuration + 'ms',
        timestamp: new Date().toISOString()
      },
      testResults: this.testResults,
      componentStatistics: {
        errorHandler: this.errorHandler.getErrorStats(),
        consistencyManager: this.consistencyManager.getStatistics(),
        recoveryOrchestrator: this.recoveryOrchestrator.getStatistics()
      },
      recommendations: this.generateRecommendations()
    };

    // 保存报告到文件
    const reportPath = path.join(__dirname, '../logs/error-handling-recovery-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // 打印摘要
    console.log('\n📋 测试报告摘要:');
    console.log(`  总测试数: ${totalTests}`);
    console.log(`  通过测试: ${passedTests}`);
    console.log(`  失败测试: ${failedTests}`);
    console.log(`  成功率: ${successRate.toFixed(2)}%`);
    console.log(`  总耗时: ${totalDuration}ms`);
    console.log(`  报告文件: ${reportPath}`);

    if (failedTests > 0) {
      console.log('\n❌ 失败的测试:');
      this.testResults
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.testName}: ${r.details}`));
    }

    return report;
  }

  /**
   * 生成建议
   */
  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.testResults.filter(r => !r.success);

    if (failedTests.length === 0) {
      recommendations.push('所有测试通过，错误处理和恢复机制工作正常');
    } else {
      recommendations.push('以下测试失败，需要检查相关功能:');
      failedTests.forEach(test => {
        recommendations.push(`- ${test.testName}: ${test.details}`);
      });
    }

    // 性能建议
    const performanceTests = this.testResults.filter(r => r.testName.includes('performance'));
    if (performanceTests.some(t => !t.success)) {
      recommendations.push('性能测试未通过，建议优化处理逻辑或增加系统资源');
    }

    // 并发建议
    const concurrencyTests = this.testResults.filter(r => r.testName.includes('concurrent'));
    if (concurrencyTests.some(t => !t.success)) {
      recommendations.push('并发测试未通过，建议检查线程安全和资源竞争问题');
    }

    return recommendations;
  }

  /**
   * 测试综合演示功能
   */
  async testComprehensiveDemo() {
    console.log('📋 测试综合演示功能...');

    try {
      const ComprehensiveErrorHandlingDemo = require('../n8n-config/comprehensive-error-handling-demo.js');
      const demo = new ComprehensiveErrorHandlingDemo();

      // 运行演示
      const demoResults = await demo.runComprehensiveDemo();
      
      const demoSuccess = demoResults.summary && demoResults.summary.totalScenarios > 0;
      this.recordTestResult(
        'comprehensive_demo',
        demoSuccess,
        demoSuccess ? `演示完成，场景数: ${demoResults.summary.totalScenarios}` : '演示执行失败'
      );

      // 测试报告生成
      const hasReport = demoResults.comprehensiveReport && demoResults.comprehensiveReport.reportId;
      this.recordTestResult(
        'demo_report_generation',
        hasReport,
        hasReport ? '演示报告生成成功' : '演示报告生成失败'
      );

      demo.cleanup();

    } catch (error) {
      this.recordTestResult('comprehensive_demo', false, error.message);
    }

    console.log('✅ 综合演示功能测试完成\n');
  }

  /**
   * 测试高级功能
   */
  async testAdvancedFeatures() {
    console.log('📋 测试高级功能...');

    // 测试错误处理器高级功能
    await this.testErrorHandlerAdvanced();
    
    // 测试恢复编排器高级功能
    await this.testRecoveryOrchestratorAdvanced();

    console.log('✅ 高级功能测试完成\n');
  }

  /**
   * 测试错误处理器高级功能
   */
  async testErrorHandlerAdvanced() {
    console.log('  🔧 测试错误处理器高级功能...');

    try {
      // 测试健康检查
      const healthCheck = await this.errorHandler.performHealthCheck();
      const healthCheckSuccess = healthCheck.status && healthCheck.components;
      this.recordTestResult(
        'error_handler_health_check',
        healthCheckSuccess,
        healthCheckSuccess ? `健康状态: ${healthCheck.status}` : '健康检查失败'
      );

      // 测试配置导出/导入
      const exportedConfig = this.errorHandler.exportConfiguration();
      const configExportSuccess = exportedConfig.options && exportedConfig.errorClassification;
      this.recordTestResult(
        'error_handler_config_export',
        configExportSuccess,
        configExportSuccess ? '配置导出成功' : '配置导出失败'
      );

      if (configExportSuccess) {
        this.errorHandler.importConfiguration(exportedConfig);
        this.recordTestResult('error_handler_config_import', true, '配置导入成功');
      }

      // 测试错误趋势预测
      const errorTrends = this.errorHandler.predictErrorTrends();
      const trendsSuccess = errorTrends.timestamp && errorTrends.predictions;
      this.recordTestResult(
        'error_trends_prediction',
        trendsSuccess,
        trendsSuccess ? `趋势预测完成，置信度: ${errorTrends.confidence}` : '趋势预测失败'
      );

      // 测试配置优化
      const optimization = this.errorHandler.optimizeConfiguration();
      const optimizationSuccess = optimization.timestamp && optimization.recommendations;
      this.recordTestResult(
        'config_optimization',
        optimizationSuccess,
        optimizationSuccess ? `优化建议数: ${optimization.recommendations.length}` : '配置优化失败'
      );

      // 测试错误报告生成
      const errorReport = await this.errorHandler.generateErrorReport();
      const reportSuccess = errorReport.reportId && errorReport.summary;
      this.recordTestResult(
        'error_report_generation',
        reportSuccess,
        reportSuccess ? `报告生成成功: ${errorReport.reportId}` : '错误报告生成失败'
      );

    } catch (error) {
      this.recordTestResult('error_handler_advanced', false, error.message);
    }
  }

  /**
   * 测试恢复编排器高级功能
   */
  async testRecoveryOrchestratorAdvanced() {
    console.log('  🔄 测试恢复编排器高级功能...');

    try {
      // 测试配置导出/导入
      const exportedConfig = this.recoveryOrchestrator.exportConfiguration();
      const configExportSuccess = exportedConfig.options && exportedConfig.recoveryStrategies;
      this.recordTestResult(
        'recovery_orchestrator_config_export',
        configExportSuccess,
        configExportSuccess ? '恢复编排器配置导出成功' : '配置导出失败'
      );

      if (configExportSuccess) {
        this.recoveryOrchestrator.importConfiguration(exportedConfig);
        this.recordTestResult('recovery_orchestrator_config_import', true, '配置导入成功');
      }

      // 测试恢复报告生成
      const recoveryReport = this.recoveryOrchestrator.generateRecoveryReport();
      const reportSuccess = recoveryReport.reportId && recoveryReport.summary;
      this.recordTestResult(
        'recovery_report_generation',
        reportSuccess,
        reportSuccess ? `恢复报告生成成功: ${recoveryReport.reportId}` : '恢复报告生成失败'
      );

      // 测试系统健康状态获取
      const systemHealth = this.recoveryOrchestrator.getCurrentSystemHealth();
      const healthSuccess = systemHealth.timestamp && systemHealth.overall;
      this.recordTestResult(
        'system_health_check',
        healthSuccess,
        healthSuccess ? `系统健康状态: ${systemHealth.overall}` : '系统健康检查失败'
      );

      // 测试恢复需求预测
      const recoveryPrediction = this.recoveryOrchestrator.predictRecoveryNeeds();
      const predictionSuccess = recoveryPrediction.timestamp && recoveryPrediction.predictions;
      this.recordTestResult(
        'recovery_needs_prediction',
        predictionSuccess,
        predictionSuccess ? `恢复需求预测完成，置信度: ${recoveryPrediction.confidence}` : '恢复需求预测失败'
      );

      // 测试策略优化
      const strategyOptimization = this.recoveryOrchestrator.optimizeRecoveryStrategies();
      const optimizationSuccess = strategyOptimization.timestamp && strategyOptimization.recommendations;
      this.recordTestResult(
        'strategy_optimization',
        optimizationSuccess,
        optimizationSuccess ? `策略优化建议数: ${strategyOptimization.recommendations.length}` : '策略优化失败'
      );

      // 测试自动优化功能
      this.recoveryOrchestrator.enableAutoOptimization();
      const autoOptimizationResult = await this.recoveryOrchestrator.performAutoOptimization();
      const autoOptSuccess = autoOptimizationResult && autoOptimizationResult.timestamp;
      this.recordTestResult(
        'auto_optimization',
        autoOptSuccess,
        autoOptSuccess ? '自动优化执行成功' : '自动优化执行失败'
      );
      this.recoveryOrchestrator.disableAutoOptimization();

    } catch (error) {
      this.recordTestResult('recovery_orchestrator_advanced', false, error.message);
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    console.log('🧹 清理测试资源...');

    try {
      this.errorHandler.reset();
      this.consistencyManager.cleanup();
      this.recoveryOrchestrator.cleanup();
    } catch (error) {
      console.warn('清理资源时出现警告:', error.message);
    }
  }
}

// 运行测试
async function runTests() {
  const tester = new ErrorHandlingRecoveryTester();
  await tester.runAllTests();
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests().catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = ErrorHandlingRecoveryTester;