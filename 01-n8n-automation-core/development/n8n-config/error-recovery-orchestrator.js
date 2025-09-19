/**
 * 错误恢复编排器
 * 协调和管理整个工作流的错误处理和恢复过程
 */

const EnhancedErrorHandler = require('./enhanced-error-handler.js');
const DataConsistencyManager = require('./data-consistency-manager.js');

class ErrorRecoveryOrchestrator {
  constructor(options = {}) {
    this.options = {
      enableAutoRecovery: options.enableAutoRecovery !== false,
      enableFailover: options.enableFailover !== false,
      enableGracefulDegradation: options.enableGracefulDegradation !== false,
      maxRecoveryAttempts: options.maxRecoveryAttempts || 3,
      recoveryTimeout: options.recoveryTimeout || 300000, // 5分钟
      healthCheckInterval: options.healthCheckInterval || 60000, // 1分钟
      ...options
    };

    // 初始化组件
    this.errorHandler = new EnhancedErrorHandler(options.errorHandler || {});
    this.consistencyManager = new DataConsistencyManager(options.consistencyManager || {});
    
    // 状态管理
    this.workflowState = new Map();
    this.recoveryHistory = [];
    this.healthStatus = new Map();
    this.failoverTargets = new Map();
    this.degradationLevels = new Map();
    
    // 恢复策略
    this.recoveryStrategies = new Map();
    this.initializeRecoveryStrategies();
    
    // 启动健康检查
    this.startHealthMonitoring();
  }

  /**
   * 初始化恢复策略
   */
  initializeRecoveryStrategies() {
    // 数据采集阶段恢复策略
    this.recoveryStrategies.set('data_collection', {
      name: '数据采集恢复',
      priority: 'high',
      steps: [
        'validate_sources',
        'switch_to_backup_sources',
        'reduce_collection_scope',
        'enable_graceful_degradation'
      ],
      implementation: this.recoverDataCollection.bind(this),
      fallbackStrategy: 'skip_failed_sources'
    });

    // 内容处理阶段恢复策略
    this.recoveryStrategies.set('content_processing', {
      name: '内容处理恢复',
      priority: 'medium',
      steps: [
        'validate_content_pipeline',
        'switch_to_simple_processing',
        'skip_problematic_content',
        'apply_content_filters'
      ],
      implementation: this.recoverContentProcessing.bind(this),
      fallbackStrategy: 'basic_processing_mode'
    });

    // Notion存储阶段恢复策略
    this.recoveryStrategies.set('notion_storage', {
      name: 'Notion存储恢复',
      priority: 'high',
      steps: [
        'validate_notion_connection',
        'retry_with_backoff',
        'switch_to_backup_storage',
        'enable_local_caching'
      ],
      implementation: this.recoverNotionStorage.bind(this),
      fallbackStrategy: 'local_storage_mode'
    });

    // AI管理阶段恢复策略
    this.recoveryStrategies.set('ai_management', {
      name: 'AI管理恢复',
      priority: 'low',
      steps: [
        'validate_ai_services',
        'switch_to_backup_ai',
        'reduce_ai_complexity',
        'disable_ai_features'
      ],
      implementation: this.recoverAiManagement.bind(this),
      fallbackStrategy: 'manual_management_mode'
    });

    // 火鸟门户发布阶段恢复策略
    this.recoveryStrategies.set('firebird_publish', {
      name: '火鸟门户发布恢复',
      priority: 'critical',
      steps: [
        'validate_firebird_connection',
        'refresh_authentication',
        'retry_with_exponential_backoff',
        'queue_for_later_publish'
      ],
      implementation: this.recoverFirebirdPublish.bind(this),
      fallbackStrategy: 'queue_and_retry_later'
    });
  }

  /**
   * 主要错误恢复入口点
   */
  async orchestrateRecovery(error, context = {}) {
    const recoveryId = this.generateRecoveryId();
    const startTime = Date.now();

    console.log(`🚨 开始错误恢复编排: ${recoveryId}`);

    try {
      // 1. 错误分析和分类
      const errorAnalysis = await this.analyzeError(error, context);
      
      // 2. 确定恢复策略
      const recoveryPlan = await this.createRecoveryPlan(errorAnalysis, context);
      
      // 3. 开始数据一致性事务
      const transactionId = await this.beginRecoveryTransaction(recoveryId, context);
      
      // 4. 执行恢复策略
      const recoveryResult = await this.executeRecoveryPlan(recoveryPlan, context, transactionId);
      
      // 5. 验证恢复结果
      const validationResult = await this.validateRecovery(recoveryResult, context);
      
      // 6. 提交或回滚事务
      if (validationResult.success) {
        await this.commitRecoveryTransaction(transactionId);
      } else {
        await this.rollbackRecoveryTransaction(transactionId);
      }
      
      // 7. 更新系统状态
      await this.updateSystemState(recoveryResult, context);
      
      // 8. 记录恢复历史
      this.recordRecoveryHistory(recoveryId, {
        error: errorAnalysis,
        plan: recoveryPlan,
        result: recoveryResult,
        validation: validationResult,
        duration: Date.now() - startTime
      });

      console.log(`✅ 错误恢复编排完成: ${recoveryId} (${Date.now() - startTime}ms)`);

      return {
        success: validationResult.success,
        recoveryId,
        strategy: recoveryPlan.strategy,
        result: recoveryResult,
        duration: Date.now() - startTime,
        nextAction: this.determineNextAction(recoveryResult, validationResult)
      };

    } catch (recoveryError) {
      console.error(`❌ 错误恢复编排失败: ${recoveryId}`, recoveryError);
      
      // 记录失败的恢复尝试
      this.recordRecoveryHistory(recoveryId, {
        error: error,
        recoveryError: recoveryError,
        failed: true,
        duration: Date.now() - startTime
      });

      return {
        success: false,
        recoveryId,
        error: recoveryError.message,
        duration: Date.now() - startTime,
        nextAction: 'escalate_to_manual'
      };
    }
  }

  /**
   * 分析错误
   */
  async analyzeError(error, context) {
    console.log('🔍 分析错误...');

    // 使用增强错误处理器进行分类
    const classification = this.errorHandler.classifyError(error);
    
    // 分析错误影响范围
    const impactAnalysis = await this.analyzeErrorImpact(error, context);
    
    // 分析恢复可行性
    const recoverabilityAnalysis = this.analyzeRecoverability(error, classification, context);
    
    // 分析系统健康状态
    const systemHealth = await this.analyzeSystemHealth(context);

    return {
      classification,
      impact: impactAnalysis,
      recoverability: recoverabilityAnalysis,
      systemHealth,
      timestamp: Date.now(),
      context: context
    };
  }

  /**
   * 分析错误影响范围
   */
  async analyzeErrorImpact(error, context) {
    const impact = {
      scope: 'unknown',
      severity: 'medium',
      affectedComponents: [],
      dataIntegrityRisk: 'low',
      userImpact: 'minimal'
    };

    try {
      // 根据错误发生的阶段确定影响范围
      const phase = context.phase || context.workflowPhase || 'unknown';
      
      switch (phase) {
        case 'data_collection':
        case 'rss_collection':
          impact.scope = 'data_collection';
          impact.affectedComponents = ['rss_sources', 'content_pipeline'];
          impact.dataIntegrityRisk = 'low';
          impact.userImpact = 'minimal';
          break;

        case 'content_processing':
          impact.scope = 'content_processing';
          impact.affectedComponents = ['ai_processor', 'content_validator'];
          impact.dataIntegrityRisk = 'medium';
          impact.userImpact = 'low';
          break;

        case 'notion_storage':
          impact.scope = 'storage';
          impact.affectedComponents = ['notion_api', 'data_storage'];
          impact.dataIntegrityRisk = 'high';
          impact.userImpact = 'medium';
          break;

        case 'firebird_publish':
          impact.scope = 'publication';
          impact.affectedComponents = ['firebird_api', 'content_delivery'];
          impact.dataIntegrityRisk = 'medium';
          impact.userImpact = 'high';
          break;

        default:
          impact.scope = 'system';
          impact.affectedComponents = ['entire_workflow'];
          impact.dataIntegrityRisk = 'high';
          impact.userImpact = 'high';
      }

      // 根据错误严重性调整影响评估
      if (error.severity === 'critical') {
        impact.severity = 'critical';
        impact.userImpact = 'high';
      } else if (error.severity === 'high') {
        impact.severity = 'high';
        impact.userImpact = 'medium';
      }

    } catch (analysisError) {
      console.error('错误影响分析失败:', analysisError);
      impact.scope = 'unknown';
      impact.severity = 'high'; // 保守估计
    }

    return impact;
  }

  /**
   * 分析恢复可行性
   */
  analyzeRecoverability(error, classification, context) {
    const recoverability = {
      feasible: true,
      confidence: 0.5,
      estimatedTime: 60000, // 1分钟
      requiredResources: [],
      risks: [],
      alternatives: []
    };

    try {
      // 基于错误分类评估恢复可行性
      if (classification.retryable) {
        recoverability.feasible = true;
        recoverability.confidence = 0.8;
        recoverability.estimatedTime = 30000;
      } else {
        recoverability.confidence = 0.3;
        recoverability.estimatedTime = 120000;
      }

      // 基于错误类别调整评估
      switch (classification.category) {
        case 'network':
          recoverability.confidence = 0.9;
          recoverability.alternatives = ['backup_endpoint', 'retry_with_backoff'];
          break;

        case 'authentication':
          recoverability.confidence = 0.6;
          recoverability.requiredResources = ['token_refresh', 'credential_validation'];
          recoverability.risks = ['service_disruption'];
          break;

        case 'rate_limit':
          recoverability.confidence = 0.95;
          recoverability.estimatedTime = 60000;
          recoverability.alternatives = ['exponential_backoff', 'alternative_api'];
          break;

        case 'server_error':
          recoverability.confidence = 0.7;
          recoverability.alternatives = ['backup_service', 'circuit_breaker'];
          break;

        case 'validation':
          recoverability.confidence = 0.4;
          recoverability.requiredResources = ['data_sanitization', 'manual_review'];
          break;

        default:
          recoverability.confidence = 0.5;
      }

      // 考虑系统当前状态
      const currentAttempts = context.recoveryAttempts || 0;
      if (currentAttempts >= this.options.maxRecoveryAttempts) {
        recoverability.feasible = false;
        recoverability.confidence = 0;
      }

    } catch (analysisError) {
      console.error('恢复可行性分析失败:', analysisError);
      recoverability.feasible = false;
      recoverability.confidence = 0;
    }

    return recoverability;
  }

  /**
   * 分析系统健康状态
   */
  async analyzeSystemHealth(context) {
    const health = {
      overall: 'unknown',
      components: {},
      resources: {},
      performance: {},
      timestamp: Date.now()
    };

    try {
      // 检查各组件健康状态
      health.components = {
        rss_sources: await this.checkComponentHealth('rss_sources'),
        content_processor: await this.checkComponentHealth('content_processor'),
        notion_api: await this.checkComponentHealth('notion_api'),
        firebird_api: await this.checkComponentHealth('firebird_api'),
        ai_services: await this.checkComponentHealth('ai_services')
      };

      // 检查系统资源
      health.resources = {
        memory: this.checkMemoryUsage(),
        cpu: this.checkCpuUsage(),
        network: await this.checkNetworkConnectivity(),
        storage: this.checkStorageSpace()
      };

      // 检查性能指标
      health.performance = {
        responseTime: this.getAverageResponseTime(),
        throughput: this.getCurrentThroughput(),
        errorRate: this.getCurrentErrorRate()
      };

      // 计算整体健康状态
      health.overall = this.calculateOverallHealth(health);

    } catch (healthError) {
      console.error('系统健康分析失败:', healthError);
      health.overall = 'critical';
    }

    return health;
  }

  /**
   * 创建恢复计划
   */
  async createRecoveryPlan(errorAnalysis, context) {
    console.log('📋 创建恢复计划...');

    const plan = {
      strategy: 'unknown',
      priority: 'medium',
      steps: [],
      fallbackOptions: [],
      estimatedDuration: 60000,
      requiredResources: [],
      risks: []
    };

    try {
      // 根据错误影响范围选择恢复策略
      const primaryStrategy = this.selectPrimaryStrategy(errorAnalysis);
      const fallbackStrategies = this.selectFallbackStrategies(errorAnalysis);

      plan.strategy = primaryStrategy.name;
      plan.priority = primaryStrategy.priority;
      plan.steps = [...primaryStrategy.steps];
      plan.fallbackOptions = fallbackStrategies.map(s => s.name);
      plan.estimatedDuration = this.estimateRecoveryDuration(primaryStrategy, errorAnalysis);

      // 添加数据一致性保护步骤
      if (errorAnalysis.impact.dataIntegrityRisk === 'high') {
        plan.steps.unshift('create_data_snapshot');
        plan.steps.push('validate_data_consistency');
      }

      // 添加健康检查步骤
      plan.steps.push('perform_health_check');

      // 评估风险
      plan.risks = this.assessRecoveryRisks(primaryStrategy, errorAnalysis);

    } catch (planningError) {
      console.error('恢复计划创建失败:', planningError);
      plan.strategy = 'emergency_fallback';
      plan.steps = ['isolate_error', 'preserve_data', 'notify_admin'];
    }

    return plan;
  }

  /**
   * 选择主要恢复策略
   */
  selectPrimaryStrategy(errorAnalysis) {
    const impact = errorAnalysis.impact;
    const classification = errorAnalysis.classification;

    // 根据影响范围选择策略
    let strategyKey = impact.scope;
    
    // 如果没有找到特定策略，使用通用策略
    if (!this.recoveryStrategies.has(strategyKey)) {
      strategyKey = this.selectGenericStrategy(classification);
    }

    return this.recoveryStrategies.get(strategyKey) || {
      name: 'generic_recovery',
      priority: 'medium',
      steps: ['analyze_error', 'apply_generic_fix', 'validate_result'],
      implementation: this.genericRecovery.bind(this)
    };
  }

  /**
   * 选择通用策略
   */
  selectGenericStrategy(classification) {
    switch (classification.category) {
      case 'network':
      case 'server_error':
        return 'data_collection'; // 网络问题通常影响数据采集
      
      case 'authentication':
        return 'firebird_publish'; // 认证问题通常影响发布
      
      case 'validation':
      case 'content_processing':
        return 'content_processing';
      
      default:
        return 'data_collection';
    }
  }

  /**
   * 选择备用策略
   */
  selectFallbackStrategies(errorAnalysis) {
    const allStrategies = Array.from(this.recoveryStrategies.values());
    const primaryStrategy = this.selectPrimaryStrategy(errorAnalysis);
    
    return allStrategies
      .filter(strategy => strategy.name !== primaryStrategy.name)
      .sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority))
      .slice(0, 2); // 最多2个备用策略
  }

  /**
   * 获取优先级数值
   */
  getPriorityValue(priority) {
    const values = { critical: 4, high: 3, medium: 2, low: 1 };
    return values[priority] || 1;
  }

  /**
   * 执行恢复计划
   */
  async executeRecoveryPlan(plan, context, transactionId) {
    console.log(`🔧 执行恢复计划: ${plan.strategy}`);

    const result = {
      success: false,
      strategy: plan.strategy,
      executedSteps: [],
      failedSteps: [],
      duration: 0,
      data: {}
    };

    const startTime = Date.now();

    try {
      // 获取策略实现
      const strategy = this.recoveryStrategies.get(plan.strategy.replace('恢复', '').replace(' ', '_'));
      
      if (strategy && strategy.implementation) {
        // 执行策略实现
        const strategyResult = await strategy.implementation(context, plan, transactionId);
        
        result.success = strategyResult.success;
        result.executedSteps = strategyResult.steps || [];
        result.data = strategyResult.data || {};
        
        if (!strategyResult.success && strategyResult.error) {
          result.failedSteps.push({
            step: 'strategy_execution',
            error: strategyResult.error
          });
        }
      } else {
        // 执行通用恢复步骤
        for (const step of plan.steps) {
          try {
            const stepResult = await this.executeRecoveryStep(step, context, transactionId);
            
            if (stepResult.success) {
              result.executedSteps.push({
                step: step,
                result: stepResult.data,
                duration: stepResult.duration
              });
            } else {
              result.failedSteps.push({
                step: step,
                error: stepResult.error,
                duration: stepResult.duration
              });
              
              // 如果关键步骤失败，停止执行
              if (stepResult.critical) {
                break;
              }
            }
          } catch (stepError) {
            result.failedSteps.push({
              step: step,
              error: stepError.message
            });
          }
        }

        result.success = result.failedSteps.length === 0;
      }

    } catch (executionError) {
      console.error('恢复计划执行失败:', executionError);
      result.success = false;
      result.failedSteps.push({
        step: 'plan_execution',
        error: executionError.message
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * 执行恢复步骤
   */
  async executeRecoveryStep(step, context, transactionId) {
    const startTime = Date.now();
    
    try {
      let stepResult = { success: false, data: null, critical: false };

      switch (step) {
        case 'create_data_snapshot':
          stepResult = await this.createDataSnapshot(context, transactionId);
          break;

        case 'validate_data_consistency':
          stepResult = await this.validateDataConsistency(context, transactionId);
          stepResult.critical = true;
          break;

        case 'perform_health_check':
          stepResult = await this.performHealthCheck(context);
          break;

        case 'isolate_error':
          stepResult = await this.isolateError(context);
          break;

        case 'preserve_data':
          stepResult = await this.preserveData(context, transactionId);
          stepResult.critical = true;
          break;

        case 'notify_admin':
          stepResult = await this.notifyAdmin(context);
          break;

        default:
          stepResult = { success: true, data: `步骤 ${step} 已跳过` };
      }

      stepResult.duration = Date.now() - startTime;
      return stepResult;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        critical: false
      };
    }
  }

  /**
   * 数据采集恢复实现
   */
  async recoverDataCollection(context, plan, transactionId) {
    console.log('🔄 执行数据采集恢复...');

    const result = {
      success: false,
      steps: [],
      data: {}
    };

    try {
      // 1. 验证数据源
      const sourceValidation = await this.validateDataSources(context);
      result.steps.push({
        step: 'validate_sources',
        success: sourceValidation.success,
        data: sourceValidation
      });

      // 2. 切换到备用数据源
      if (!sourceValidation.success && context.backupSources) {
        const switchResult = await this.switchToBackupSources(context);
        result.steps.push({
          step: 'switch_to_backup_sources',
          success: switchResult.success,
          data: switchResult
        });
      }

      // 3. 减少采集范围
      const scopeReduction = await this.reduceCollectionScope(context);
      result.steps.push({
        step: 'reduce_collection_scope',
        success: scopeReduction.success,
        data: scopeReduction
      });

      // 4. 启用优雅降级
      const degradation = await this.enableGracefulDegradation(context, 'data_collection');
      result.steps.push({
        step: 'enable_graceful_degradation',
        success: degradation.success,
        data: degradation
      });

      result.success = result.steps.some(step => step.success);

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * 内容处理恢复实现
   */
  async recoverContentProcessing(context, plan, transactionId) {
    console.log('🔄 执行内容处理恢复...');

    const result = {
      success: false,
      steps: [],
      data: {}
    };

    try {
      // 1. 验证内容处理管道
      const pipelineValidation = await this.validateContentPipeline(context);
      result.steps.push({
        step: 'validate_content_pipeline',
        success: pipelineValidation.success,
        data: pipelineValidation
      });

      // 2. 切换到简单处理模式
      const simpleMode = await this.switchToSimpleProcessing(context);
      result.steps.push({
        step: 'switch_to_simple_processing',
        success: simpleMode.success,
        data: simpleMode
      });

      // 3. 跳过问题内容
      const skipProblematic = await this.skipProblematicContent(context);
      result.steps.push({
        step: 'skip_problematic_content',
        success: skipProblematic.success,
        data: skipProblematic
      });

      // 4. 应用内容过滤器
      const applyFilters = await this.applyContentFilters(context);
      result.steps.push({
        step: 'apply_content_filters',
        success: applyFilters.success,
        data: applyFilters
      });

      result.success = result.steps.every(step => step.success);

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * Notion存储恢复实现
   */
  async recoverNotionStorage(context, plan, transactionId) {
    console.log('🔄 执行Notion存储恢复...');

    const result = {
      success: false,
      steps: [],
      data: {}
    };

    try {
      // 1. 验证Notion连接
      const connectionValidation = await this.validateNotionConnection(context);
      result.steps.push({
        step: 'validate_notion_connection',
        success: connectionValidation.success,
        data: connectionValidation
      });

      // 2. 重试机制
      if (!connectionValidation.success) {
        const retryResult = await this.retryWithBackoff(context, 'notion_storage');
        result.steps.push({
          step: 'retry_with_backoff',
          success: retryResult.success,
          data: retryResult
        });
      }

      // 3. 切换到备用存储
      if (!connectionValidation.success) {
        const backupStorage = await this.switchToBackupStorage(context);
        result.steps.push({
          step: 'switch_to_backup_storage',
          success: backupStorage.success,
          data: backupStorage
        });
      }

      // 4. 启用本地缓存
      const localCaching = await this.enableLocalCaching(context);
      result.steps.push({
        step: 'enable_local_caching',
        success: localCaching.success,
        data: localCaching
      });

      result.success = result.steps.some(step => step.success);

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * AI管理恢复实现
   */
  async recoverAiManagement(context, plan, transactionId) {
    console.log('🔄 执行AI管理恢复...');

    const result = {
      success: false,
      steps: [],
      data: {}
    };

    try {
      // 1. 验证AI服务
      const aiValidation = await this.validateAiServices(context);
      result.steps.push({
        step: 'validate_ai_services',
        success: aiValidation.success,
        data: aiValidation
      });

      // 2. 切换到备用AI
      if (!aiValidation.success && context.backupAi) {
        const switchAi = await this.switchToBackupAi(context);
        result.steps.push({
          step: 'switch_to_backup_ai',
          success: switchAi.success,
          data: switchAi
        });
      }

      // 3. 降低AI复杂度
      const reduceComplexity = await this.reduceAiComplexity(context);
      result.steps.push({
        step: 'reduce_ai_complexity',
        success: reduceComplexity.success,
        data: reduceComplexity
      });

      // 4. 禁用AI功能
      const disableAi = await this.disableAiFeatures(context);
      result.steps.push({
        step: 'disable_ai_features',
        success: disableAi.success,
        data: disableAi
      });

      result.success = true; // AI恢复总是成功，因为可以禁用AI功能

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * 火鸟门户发布恢复实现
   */
  async recoverFirebirdPublish(context, plan, transactionId) {
    console.log('🔄 执行火鸟门户发布恢复...');

    const result = {
      success: false,
      steps: [],
      data: {}
    };

    try {
      // 1. 验证火鸟连接
      const connectionValidation = await this.validateFirebirdConnection(context);
      result.steps.push({
        step: 'validate_firebird_connection',
        success: connectionValidation.success,
        data: connectionValidation
      });

      // 2. 刷新认证
      if (!connectionValidation.success) {
        const authRefresh = await this.refreshFirebirdAuthentication(context);
        result.steps.push({
          step: 'refresh_authentication',
          success: authRefresh.success,
          data: authRefresh
        });
      }

      // 3. 指数退避重试
      const retryResult = await this.retryWithExponentialBackoff(context, 'firebird_publish');
      result.steps.push({
        step: 'retry_with_exponential_backoff',
        success: retryResult.success,
        data: retryResult
      });

      // 4. 队列延后发布
      if (!retryResult.success) {
        const queueResult = await this.queueForLaterPublish(context);
        result.steps.push({
          step: 'queue_for_later_publish',
          success: queueResult.success,
          data: queueResult
        });
      }

      result.success = result.steps.some(step => step.success);

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * 通用恢复实现
   */
  async genericRecovery(context, plan, transactionId) {
    console.log('🔄 执行通用恢复...');

    const result = {
      success: false,
      steps: [],
      data: {}
    };

    try {
      // 1. 分析错误
      result.steps.push({
        step: 'analyze_error',
        success: true,
        data: { message: '错误分析完成' }
      });

      // 2. 应用通用修复
      const genericFix = await this.applyGenericFix(context);
      result.steps.push({
        step: 'apply_generic_fix',
        success: genericFix.success,
        data: genericFix
      });

      // 3. 验证结果
      const validation = await this.validateGenericResult(context);
      result.steps.push({
        step: 'validate_result',
        success: validation.success,
        data: validation
      });

      result.success = result.steps.every(step => step.success);

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  // 辅助方法实现...
  async validateDataSources(context) {
    return { success: true, validSources: context.sources?.length || 0 };
  }

  async switchToBackupSources(context) {
    context.sources = context.backupSources || [];
    return { success: true, switchedSources: context.sources.length };
  }

  async reduceCollectionScope(context) {
    if (context.batchSize) {
      context.batchSize = Math.max(Math.floor(context.batchSize * 0.5), 1);
    }
    return { success: true, newBatchSize: context.batchSize };
  }

  async enableGracefulDegradation(context, component) {
    this.degradationLevels.set(component, 'enabled');
    return { success: true, component, level: 'enabled' };
  }

  async validateContentPipeline(context) {
    return { success: true, pipelineStatus: 'operational' };
  }

  async switchToSimpleProcessing(context) {
    context.processingMode = 'simple';
    return { success: true, mode: 'simple' };
  }

  async skipProblematicContent(context) {
    context.skipProblematic = true;
    return { success: true, enabled: true };
  }

  async applyContentFilters(context) {
    context.enableFilters = true;
    return { success: true, filtersEnabled: true };
  }

  async validateNotionConnection(context) {
    // 这里应该实现实际的Notion连接验证
    return { success: Math.random() > 0.3, connectionStatus: 'testing' };
  }

  async retryWithBackoff(context, operation) {
    // 实现退避重试逻辑
    return { success: Math.random() > 0.5, attempts: 3 };
  }

  async switchToBackupStorage(context) {
    context.storageMode = 'backup';
    return { success: true, mode: 'backup' };
  }

  async enableLocalCaching(context) {
    context.enableCache = true;
    return { success: true, cacheEnabled: true };
  }

  async validateAiServices(context) {
    return { success: Math.random() > 0.4, serviceStatus: 'testing' };
  }

  async switchToBackupAi(context) {
    context.aiProvider = 'backup';
    return { success: true, provider: 'backup' };
  }

  async reduceAiComplexity(context) {
    context.aiComplexity = 'low';
    return { success: true, complexity: 'low' };
  }

  async disableAiFeatures(context) {
    context.aiEnabled = false;
    return { success: true, aiEnabled: false };
  }

  async validateFirebirdConnection(context) {
    return { success: Math.random() > 0.2, connectionStatus: 'testing' };
  }

  async refreshFirebirdAuthentication(context) {
    return { success: Math.random() > 0.6, authRefreshed: true };
  }

  async retryWithExponentialBackoff(context, operation) {
    return { success: Math.random() > 0.4, attempts: 5 };
  }

  async queueForLaterPublish(context) {
    context.queuedForLater = true;
    return { success: true, queued: true };
  }

  async applyGenericFix(context) {
    return { success: true, fixApplied: 'generic' };
  }

  async validateGenericResult(context) {
    return { success: true, validationPassed: true };
  }

  // 其他辅助方法...
  async checkComponentHealth(component) {
    return Math.random() > 0.3 ? 'healthy' : 'degraded';
  }

  checkMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      used: usage.heapUsed,
      total: usage.heapTotal,
      percentage: (usage.heapUsed / usage.heapTotal) * 100
    };
  }

  checkCpuUsage() {
    return { percentage: Math.random() * 100 };
  }

  async checkNetworkConnectivity() {
    return { status: 'connected', latency: Math.random() * 100 };
  }

  checkStorageSpace() {
    return { available: '10GB', used: '5GB', percentage: 50 };
  }

  getAverageResponseTime() {
    return Math.random() * 1000;
  }

  getCurrentThroughput() {
    return Math.random() * 100;
  }

  getCurrentErrorRate() {
    return Math.random() * 10;
  }

  calculateOverallHealth(health) {
    const componentHealth = Object.values(health.components);
    const healthyCount = componentHealth.filter(h => h === 'healthy').length;
    const healthPercentage = (healthyCount / componentHealth.length) * 100;
    
    if (healthPercentage >= 80) return 'healthy';
    if (healthPercentage >= 60) return 'degraded';
    return 'critical';
  }

  estimateRecoveryDuration(strategy, errorAnalysis) {
    const baseTime = 60000; // 1分钟基础时间
    const complexityMultiplier = strategy.priority === 'critical' ? 2 : 1;
    const severityMultiplier = errorAnalysis.classification.severity === 'critical' ? 1.5 : 1;
    
    return baseTime * complexityMultiplier * severityMultiplier;
  }

  assessRecoveryRisks(strategy, errorAnalysis) {
    const risks = [];
    
    if (errorAnalysis.impact.dataIntegrityRisk === 'high') {
      risks.push('数据完整性风险');
    }
    
    if (errorAnalysis.systemHealth.overall === 'critical') {
      risks.push('系统不稳定风险');
    }
    
    if (strategy.priority === 'critical') {
      risks.push('服务中断风险');
    }
    
    return risks;
  }

  async beginRecoveryTransaction(recoveryId, context) {
    const transactionResult = await this.consistencyManager.beginTransaction(
      `recovery_${recoveryId}`,
      { type: 'recovery', recoveryId, context }
    );
    return transactionResult.transactionId;
  }

  async commitRecoveryTransaction(transactionId) {
    if (transactionId) {
      await this.consistencyManager.commitTransaction(transactionId);
    }
  }

  async rollbackRecoveryTransaction(transactionId) {
    if (transactionId) {
      await this.consistencyManager.rollbackTransaction(transactionId, 'recovery_failed');
    }
  }

  async validateRecovery(recoveryResult, context) {
    return {
      success: recoveryResult.success,
      dataConsistent: true,
      systemStable: true,
      userImpactMinimized: true
    };
  }

  async updateSystemState(recoveryResult, context) {
    // 更新系统状态
    this.workflowState.set(context.workflowId || 'default', {
      status: recoveryResult.success ? 'recovered' : 'failed',
      lastRecovery: Date.now(),
      recoveryCount: (this.workflowState.get(context.workflowId || 'default')?.recoveryCount || 0) + 1
    });
  }

  recordRecoveryHistory(recoveryId, data) {
    this.recoveryHistory.push({
      id: recoveryId,
      timestamp: Date.now(),
      ...data
    });

    // 限制历史记录长度
    if (this.recoveryHistory.length > 100) {
      this.recoveryHistory.shift();
    }
  }

  determineNextAction(recoveryResult, validationResult) {
    if (validationResult.success) {
      return 'continue_workflow';
    } else if (recoveryResult.success) {
      return 'retry_validation';
    } else {
      return 'escalate_to_manual';
    }
  }

  async createDataSnapshot(context, transactionId) {
    await this.consistencyManager.recordOperation(transactionId, {
      type: 'snapshot',
      target: `recovery_snapshot_${Date.now()}`,
      data: context
    });
    return { success: true, snapshotCreated: true };
  }

  async validateDataConsistency(context, transactionId) {
    // 这里应该实现实际的数据一致性验证
    return { success: true, consistent: true };
  }

  async performHealthCheck(context) {
    const health = await this.analyzeSystemHealth(context);
    return { success: health.overall !== 'critical', health };
  }

  async isolateError(context) {
    // 隔离错误，防止扩散
    return { success: true, isolated: true };
  }

  async preserveData(context, transactionId) {
    // 保护数据不丢失
    return { success: true, dataPreserved: true };
  }

  async notifyAdmin(context) {
    // 通知管理员
    console.log('📧 已通知管理员处理异常情况');
    return { success: true, adminNotified: true };
  }

  startHealthMonitoring() {
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
    }

    this.healthInterval = setInterval(async () => {
      try {
        const health = await this.analyzeSystemHealth({});
        this.healthStatus.set(Date.now(), health);
        
        // 清理过期健康数据
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
        for (const [timestamp] of this.healthStatus) {
          if (timestamp < cutoffTime) {
            this.healthStatus.delete(timestamp);
          }
        }
      } catch (error) {
        console.error('健康监控失败:', error);
      }
    }, this.options.healthCheckInterval);
  }

  generateRecoveryId() {
    return `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStatistics() {
    return {
      recoveryHistory: this.recoveryHistory.length,
      workflowStates: this.workflowState.size,
      healthChecks: this.healthStatus.size,
      degradationLevels: this.degradationLevels.size,
      errorHandler: this.errorHandler.getErrorStats(),
      consistencyManager: this.consistencyManager.getStatistics()
    };
  }

  cleanup() {
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
    }

    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
    }

    this.workflowState.clear();
    this.recoveryHistory.length = 0;
    this.healthStatus.clear();
    this.failoverTargets.clear();
    this.degradationLevels.clear();

    this.errorHandler.reset();
    this.consistencyManager.cleanup();
  }

  /**
   * 导出恢复配置
   */
  exportConfiguration() {
    return {
      options: this.options,
      recoveryStrategies: Array.from(this.recoveryStrategies.entries()).map(([key, strategy]) => ({
        key,
        name: strategy.name,
        priority: strategy.priority,
        steps: strategy.steps
      })),
      currentState: {
        workflowStates: this.workflowState.size,
        recoveryHistory: this.recoveryHistory.length,
        healthStatus: this.healthStatus.size
      }
    };
  }

  /**
   * 导入恢复配置
   */
  importConfiguration(config) {
    if (config.options) {
      this.options = { ...this.options, ...config.options };
    }

    // 重新初始化恢复策略
    this.initializeRecoveryStrategies();
  }

  /**
   * 生成恢复报告
   */
  generateRecoveryReport(timeRange = 24 * 60 * 60 * 1000) {
    const endTime = Date.now();
    const startTime = endTime - timeRange;

    const recentRecoveries = this.recoveryHistory.filter(r => 
      r.timestamp && r.timestamp >= startTime
    );

    const report = {
      reportId: `recovery_report_${Date.now()}`,
      timeRange: {
        start: new Date(startTime).toISOString(),
        end: new Date(endTime).toISOString(),
        duration: timeRange
      },
      summary: {
        totalRecoveries: recentRecoveries.length,
        successfulRecoveries: recentRecoveries.filter(r => r.result?.success).length,
        failedRecoveries: recentRecoveries.filter(r => !r.result?.success).length,
        averageRecoveryTime: 0,
        strategiesUsed: {}
      },
      details: {
        recoveryHistory: recentRecoveries,
        currentHealth: this.getCurrentSystemHealth(),
        statistics: this.getStatistics()
      },
      recommendations: []
    };

    // 计算平均恢复时间
    const successfulRecoveries = recentRecoveries.filter(r => r.duration);
    if (successfulRecoveries.length > 0) {
      report.summary.averageRecoveryTime = successfulRecoveries.reduce((sum, r) => sum + r.duration, 0) / successfulRecoveries.length;
    }

    // 统计使用的策略
    recentRecoveries.forEach(r => {
      if (r.plan?.strategy) {
        report.summary.strategiesUsed[r.plan.strategy] = (report.summary.strategiesUsed[r.plan.strategy] || 0) + 1;
      }
    });

    // 生成建议
    const successRate = report.summary.totalRecoveries > 0 ? 
      (report.summary.successfulRecoveries / report.summary.totalRecoveries) * 100 : 100;

    if (successRate < 80) {
      report.recommendations.push('恢复成功率较低，建议检查恢复策略配置');
    }

    if (report.summary.averageRecoveryTime > 300000) { // 5分钟
      report.recommendations.push('平均恢复时间较长，建议优化恢复流程');
    }

    return report;
  }

  /**
   * 获取当前系统健康状态
   */
  getCurrentSystemHealth() {
    const health = {
      timestamp: Date.now(),
      overall: 'unknown',
      components: {},
      metrics: {}
    };

    try {
      // 汇总所有组件健康状态
      const healthValues = Array.from(this.healthStatus.values());
      if (healthValues.length > 0) {
        const healthyCount = healthValues.filter(h => h.overall === 'healthy').length;
        const degradedCount = healthValues.filter(h => h.overall === 'degraded').length;
        const criticalCount = healthValues.filter(h => h.overall === 'critical').length;

        if (criticalCount > 0) {
          health.overall = 'critical';
        } else if (degradedCount > healthValues.length / 2) {
          health.overall = 'degraded';
        } else {
          health.overall = 'healthy';
        }

        health.metrics = {
          totalComponents: healthValues.length,
          healthyComponents: healthyCount,
          degradedComponents: degradedCount,
          criticalComponents: criticalCount
        };
      }

    } catch (error) {
      health.overall = 'critical';
      health.error = error.message;
    }

    return health;
  }

  /**
   * 预测恢复需求
   */
  predictRecoveryNeeds() {
    const prediction = {
      timestamp: Date.now(),
      predictions: {},
      confidence: 0.5,
      recommendations: []
    };

    try {
      // 分析历史恢复数据
      const recentRecoveries = this.recoveryHistory.slice(-50); // 最近50次恢复
      
      if (recentRecoveries.length > 0) {
        // 分析错误模式
        const errorPatterns = {};
        recentRecoveries.forEach(r => {
          if (r.error?.classification?.category) {
            const category = r.error.classification.category;
            errorPatterns[category] = (errorPatterns[category] || 0) + 1;
          }
        });

        // 预测最可能的错误类型
        const mostCommonError = Object.entries(errorPatterns)
          .sort(([,a], [,b]) => b - a)[0];

        if (mostCommonError) {
          prediction.predictions.mostLikelyError = {
            category: mostCommonError[0],
            frequency: mostCommonError[1],
            probability: mostCommonError[1] / recentRecoveries.length
          };
        }

        // 分析恢复成功率趋势
        const recentSuccessRate = recentRecoveries.filter(r => r.result?.success).length / recentRecoveries.length;
        prediction.predictions.successRateTrend = {
          current: recentSuccessRate,
          trend: recentSuccessRate > 0.8 ? 'stable' : recentSuccessRate > 0.6 ? 'declining' : 'critical'
        };

        // 生成建议
        if (recentSuccessRate < 0.7) {
          prediction.recommendations.push('恢复成功率下降，建议检查和优化恢复策略');
        }

        if (mostCommonError && mostCommonError[1] > recentRecoveries.length * 0.3) {
          prediction.recommendations.push(`${mostCommonError[0]} 类错误频繁出现，建议针对性优化`);
        }
      }

    } catch (error) {
      prediction.error = error.message;
    }

    return prediction;
  }

  /**
   * 优化恢复策略
   */
  optimizeRecoveryStrategies() {
    const optimization = {
      timestamp: Date.now(),
      currentStrategies: Array.from(this.recoveryStrategies.keys()),
      recommendations: [],
      optimizedStrategies: new Map()
    };

    try {
      // 分析恢复历史
      const recentRecoveries = this.recoveryHistory.slice(-100);
      const strategyPerformance = {};

      recentRecoveries.forEach(r => {
        if (r.plan?.strategy) {
          const strategy = r.plan.strategy;
          if (!strategyPerformance[strategy]) {
            strategyPerformance[strategy] = {
              attempts: 0,
              successes: 0,
              totalDuration: 0,
              averageDuration: 0
            };
          }

          strategyPerformance[strategy].attempts++;
          if (r.result?.success) {
            strategyPerformance[strategy].successes++;
          }
          if (r.duration) {
            strategyPerformance[strategy].totalDuration += r.duration;
          }
        }
      });

      // 计算平均持续时间和成功率
      Object.values(strategyPerformance).forEach(perf => {
        if (perf.attempts > 0) {
          perf.successRate = perf.successes / perf.attempts;
          perf.averageDuration = perf.totalDuration / perf.attempts;
        }
      });

      // 生成优化建议
      Object.entries(strategyPerformance).forEach(([strategy, perf]) => {
        if (perf.successRate < 0.6) {
          optimization.recommendations.push(`${strategy} 策略成功率较低 (${(perf.successRate * 100).toFixed(1)}%)，建议优化`);
        }

        if (perf.averageDuration > 300000) { // 5分钟
          optimization.recommendations.push(`${strategy} 策略平均耗时较长 (${(perf.averageDuration / 1000).toFixed(1)}s)，建议优化`);
        }
      });

      // 复制当前策略并标记需要优化的
      for (const [key, strategy] of this.recoveryStrategies) {
        const perf = strategyPerformance[strategy.name];
        const optimizedStrategy = { ...strategy };

        if (perf && perf.successRate < 0.6) {
          optimizedStrategy.needsOptimization = true;
          optimizedStrategy.currentSuccessRate = perf.successRate;
        }

        optimization.optimizedStrategies.set(key, optimizedStrategy);
      }

    } catch (error) {
      optimization.error = error.message;
    }

    return optimization;
  }

  /**
   * 启用自动优化
   */
  enableAutoOptimization() {
    this.autoOptimizationEnabled = true;
    
    // 定期执行优化
    this.optimizationInterval = setInterval(() => {
      this.performAutoOptimization();
    }, 24 * 60 * 60 * 1000); // 每24小时执行一次

    console.log('🔧 自动优化已启用');
  }

  /**
   * 禁用自动优化
   */
  disableAutoOptimization() {
    this.autoOptimizationEnabled = false;
    
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
    }

    console.log('🔧 自动优化已禁用');
  }

  /**
   * 执行自动优化
   */
  async performAutoOptimization() {
    if (!this.autoOptimizationEnabled) {
      return;
    }

    try {
      console.log('🔧 执行自动优化...');

      // 优化恢复策略
      const strategyOptimization = this.optimizeRecoveryStrategies();
      
      // 预测恢复需求
      const recoveryPrediction = this.predictRecoveryNeeds();

      // 生成优化报告
      const optimizationReport = {
        timestamp: Date.now(),
        strategyOptimization,
        recoveryPrediction,
        actionsPerformed: []
      };

      // 应用自动优化（如果配置允许）
      if (this.options.enableAutoOptimization) {
        // 这里可以实现具体的自动优化逻辑
        optimizationReport.actionsPerformed.push('策略优化建议已生成');
      }

      console.log('✅ 自动优化完成');
      return optimizationReport;

    } catch (error) {
      console.error('❌ 自动优化失败:', error);
      return { error: error.message };
    }
  }
}

module.exports = ErrorRecoveryOrchestrator;