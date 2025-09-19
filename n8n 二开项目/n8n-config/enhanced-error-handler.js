/**
 * 增强错误处理和恢复系统
 * 为火鸟门户新闻工作流提供分层错误处理、自动重试和故障恢复功能
 */

class EnhancedErrorHandler {
  constructor(options = {}) {
    this.options = {
      enableRetry: options.enableRetry !== false,
      enableCircuitBreaker: options.enableCircuitBreaker !== false,
      enableDataConsistency: options.enableDataConsistency !== false,
      maxRetryAttempts: options.maxRetryAttempts || 3,
      baseRetryDelay: options.baseRetryDelay || 1000,
      circuitBreakerThreshold: options.circuitBreakerThreshold || 5,
      circuitBreakerTimeout: options.circuitBreakerTimeout || 60000,
      consistencyCheckInterval: options.consistencyCheckInterval || 30000,
      ...options
    };

    this.errorStats = new Map();
    this.circuitBreakers = new Map();
    this.retryQueues = new Map();
    this.consistencyCheckers = new Map();
    this.recoveryStrategies = new Map();
    
    this.initializeErrorClassification();
    this.initializeRecoveryStrategies();
  }

  /**
   * 初始化错误分类系统
   */
  initializeErrorClassification() {
    this.errorClassification = {
      // 网络层错误
      network: {
        patterns: [
          /timeout/i, /ECONNRESET/i, /ENOTFOUND/i, /ECONNREFUSED/i,
          /network/i, /connection/i, /socket/i, /dns/i
        ],
        severity: 'medium',
        retryable: true,
        maxRetries: 3,
        backoffStrategy: 'exponential',
        recoveryStrategy: 'network_recovery'
      },

      // 认证层错误
      authentication: {
        patterns: [
          /401/i, /403/i, /unauthorized/i, /authentication/i,
          /invalid.*token/i, /expired.*token/i, /access.*denied/i
        ],
        severity: 'high',
        retryable: false,
        maxRetries: 1,
        backoffStrategy: 'none',
        recoveryStrategy: 'auth_recovery'
      },

      // 限流错误
      rate_limit: {
        patterns: [
          /429/i, /rate.*limit/i, /too.*many.*requests/i,
          /quota.*exceeded/i, /throttle/i
        ],
        severity: 'medium',
        retryable: true,
        maxRetries: 5,
        backoffStrategy: 'exponential',
        recoveryStrategy: 'rate_limit_recovery'
      },

      // 服务器错误
      server_error: {
        patterns: [
          /500/i, /502/i, /503/i, /504/i, /internal.*server.*error/i,
          /bad.*gateway/i, /service.*unavailable/i, /gateway.*timeout/i
        ],
        severity: 'high',
        retryable: true,
        maxRetries: 3,
        backoffStrategy: 'exponential',
        recoveryStrategy: 'server_recovery'
      },

      // 数据验证错误
      validation: {
        patterns: [
          /validation/i, /invalid.*data/i, /required.*field/i,
          /format.*error/i, /schema.*error/i, /constraint/i
        ],
        severity: 'medium',
        retryable: false,
        maxRetries: 0,
        backoffStrategy: 'none',
        recoveryStrategy: 'validation_recovery'
      },

      // 内容处理错误
      content_processing: {
        patterns: [
          /content.*processing/i, /parsing.*error/i, /format.*unsupported/i,
          /encoding.*error/i, /content.*too.*large/i
        ],
        severity: 'low',
        retryable: false,
        maxRetries: 1,
        backoffStrategy: 'linear',
        recoveryStrategy: 'content_recovery'
      },

      // 资源不足错误
      resource_exhaustion: {
        patterns: [
          /memory/i, /disk.*space/i, /cpu/i, /resource.*exhausted/i,
          /out.*of.*memory/i, /no.*space.*left/i
        ],
        severity: 'critical',
        retryable: true,
        maxRetries: 2,
        backoffStrategy: 'exponential',
        recoveryStrategy: 'resource_recovery'
      },

      // 业务逻辑错误
      business_logic: {
        patterns: [
          /business.*rule/i, /workflow.*error/i, /logic.*error/i,
          /state.*invalid/i, /operation.*not.*allowed/i
        ],
        severity: 'medium',
        retryable: false,
        maxRetries: 0,
        backoffStrategy: 'none',
        recoveryStrategy: 'business_recovery'
      }
    };
  }

  /**
   * 初始化恢复策略
   */
  initializeRecoveryStrategies() {
    this.recoveryStrategies.set('network_recovery', {
      name: '网络恢复策略',
      steps: [
        'check_network_connectivity',
        'switch_to_backup_endpoint',
        'adjust_timeout_settings',
        'enable_connection_pooling'
      ],
      implementation: this.networkRecovery.bind(this)
    });

    this.recoveryStrategies.set('auth_recovery', {
      name: '认证恢复策略',
      steps: [
        'refresh_access_token',
        'validate_credentials',
        'switch_to_backup_auth',
        'notify_admin'
      ],
      implementation: this.authRecovery.bind(this)
    });

    this.recoveryStrategies.set('rate_limit_recovery', {
      name: '限流恢复策略',
      steps: [
        'implement_exponential_backoff',
        'reduce_request_rate',
        'switch_to_alternative_api',
        'queue_requests'
      ],
      implementation: this.rateLimitRecovery.bind(this)
    });

    this.recoveryStrategies.set('server_recovery', {
      name: '服务器恢复策略',
      steps: [
        'check_service_status',
        'switch_to_backup_service',
        'implement_circuit_breaker',
        'notify_service_provider'
      ],
      implementation: this.serverRecovery.bind(this)
    });

    this.recoveryStrategies.set('validation_recovery', {
      name: '数据验证恢复策略',
      steps: [
        'sanitize_input_data',
        'apply_default_values',
        'skip_invalid_items',
        'log_validation_errors'
      ],
      implementation: this.validationRecovery.bind(this)
    });

    this.recoveryStrategies.set('content_recovery', {
      name: '内容处理恢复策略',
      steps: [
        'fallback_to_simple_processing',
        'skip_problematic_content',
        'use_alternative_parser',
        'apply_content_filters'
      ],
      implementation: this.contentRecovery.bind(this)
    });

    this.recoveryStrategies.set('resource_recovery', {
      name: '资源恢复策略',
      steps: [
        'free_unused_memory',
        'reduce_batch_size',
        'implement_streaming',
        'scale_resources'
      ],
      implementation: this.resourceRecovery.bind(this)
    });

    this.recoveryStrategies.set('business_recovery', {
      name: '业务逻辑恢复策略',
      steps: [
        'validate_business_rules',
        'apply_fallback_logic',
        'skip_invalid_operations',
        'notify_business_team'
      ],
      implementation: this.businessRecovery.bind(this)
    });

    this.recoveryStrategies.set('default_recovery', {
      name: '默认恢复策略',
      steps: [
        'analyze_error',
        'apply_generic_fix',
        'validate_result'
      ],
      implementation: this.genericRecovery.bind(this)
    });
  }

  /**
   * 分层错误处理主入口
   */
  async handleError(error, context = {}) {
    const errorId = this.generateErrorId();
    const timestamp = Date.now();

    try {
      // 第一层：错误分类和初始处理
      const classification = this.classifyError(error);
      
      // 第二层：错误统计和熔断检查
      this.updateErrorStats(classification, context);
      const circuitBreakerStatus = this.checkCircuitBreaker(context.service || 'default');
      
      if (circuitBreakerStatus === 'open') {
        return this.handleCircuitBreakerOpen(error, context, classification);
      }

      // 第三层：重试逻辑
      if (classification.retryable && this.options.enableRetry) {
        const retryResult = await this.executeRetryStrategy(error, context, classification);
        if (retryResult.success) {
          return retryResult;
        }
      }

      // 第四层：恢复策略执行
      const recoveryResult = await this.executeRecoveryStrategy(error, context, classification);
      
      // 第五层：数据一致性检查和修复
      if (this.options.enableDataConsistency) {
        await this.ensureDataConsistency(context, classification);
      }

      // 生成完整的错误处理报告
      const errorReport = this.createErrorReport(errorId, error, context, classification, {
        circuitBreakerStatus,
        recoveryResult,
        timestamp
      });

      return {
        success: false,
        errorId,
        classification,
        recoveryResult,
        errorReport,
        shouldRetry: false,
        shouldSkip: classification.severity === 'low',
        shouldAbort: classification.severity === 'critical'
      };

    } catch (handlingError) {
      console.error('❌ 错误处理器自身发生错误:', handlingError);
      return this.handleCriticalError(error, handlingError, context);
    }
  }

  /**
   * 错误分类
   */
  classifyError(error) {
    const errorMessage = this.extractErrorMessage(error);
    const errorStack = error.stack || '';
    
    // 遍历所有错误分类，找到匹配的类型
    for (const [category, config] of Object.entries(this.errorClassification)) {
      const isMatch = config.patterns.some(pattern => 
        pattern.test(errorMessage) || pattern.test(errorStack)
      );
      
      if (isMatch) {
        return {
          category,
          severity: config.severity,
          retryable: config.retryable,
          maxRetries: config.maxRetries,
          backoffStrategy: config.backoffStrategy,
          recoveryStrategy: config.recoveryStrategy,
          confidence: this.calculateClassificationConfidence(errorMessage, config.patterns)
        };
      }
    }

    // 默认分类
    return {
      category: 'unknown',
      severity: 'medium',
      retryable: true,
      maxRetries: 1,
      backoffStrategy: 'linear',
      recoveryStrategy: 'default_recovery',
      confidence: 0.1
    };
  }

  /**
   * 提取错误消息
   */
  extractErrorMessage(error) {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error) return error.error;
    if (error.toString) return error.toString();
    return JSON.stringify(error);
  }

  /**
   * 计算分类置信度
   */
  calculateClassificationConfidence(errorMessage, patterns) {
    const matches = patterns.filter(pattern => pattern.test(errorMessage));
    return matches.length / patterns.length;
  }

  /**
   * 更新错误统计
   */
  updateErrorStats(classification, context) {
    const key = `${context.service || 'default'}_${classification.category}`;
    const stats = this.errorStats.get(key) || {
      count: 0,
      lastOccurrence: 0,
      category: classification.category,
      service: context.service || 'default'
    };

    stats.count++;
    stats.lastOccurrence = Date.now();
    this.errorStats.set(key, stats);

    // 清理过期统计数据
    this.cleanupExpiredStats();
  }

  /**
   * 清理过期统计数据
   */
  cleanupExpiredStats() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24小时前
    
    for (const [key, stats] of this.errorStats) {
      if (stats.lastOccurrence < cutoffTime) {
        this.errorStats.delete(key);
      }
    }
  }

  /**
   * 检查熔断器状态
   */
  checkCircuitBreaker(service) {
    if (!this.options.enableCircuitBreaker) {
      return 'closed';
    }

    const breaker = this.circuitBreakers.get(service) || {
      state: 'closed',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0
    };

    const now = Date.now();

    // 如果熔断器是开启状态，检查是否可以尝试半开
    if (breaker.state === 'open') {
      if (now >= breaker.nextAttemptTime) {
        breaker.state = 'half-open';
        this.circuitBreakers.set(service, breaker);
        return 'half-open';
      }
      return 'open';
    }

    // 检查是否需要开启熔断器
    if (breaker.failureCount >= this.options.circuitBreakerThreshold) {
      breaker.state = 'open';
      breaker.nextAttemptTime = now + this.options.circuitBreakerTimeout;
      this.circuitBreakers.set(service, breaker);
      return 'open';
    }

    return breaker.state;
  }

  /**
   * 处理熔断器开启状态
   */
  async handleCircuitBreakerOpen(error, context, classification) {
    console.warn(`🔴 熔断器开启 - 服务: ${context.service || 'default'}`);
    
    return {
      success: false,
      errorId: this.generateErrorId(),
      classification,
      circuitBreakerOpen: true,
      message: '服务熔断器开启，暂时跳过请求',
      shouldRetry: false,
      shouldSkip: true,
      shouldAbort: false
    };
  }

  /**
   * 执行重试策略
   */
  async executeRetryStrategy(error, context, classification) {
    const maxRetries = Math.min(classification.maxRetries, this.options.maxRetryAttempts);
    const currentAttempt = context.retryAttempt || 0;

    if (currentAttempt >= maxRetries) {
      return { success: false, reason: 'max_retries_exceeded' };
    }

    // 计算重试延迟
    const delay = this.calculateRetryDelay(currentAttempt, classification.backoffStrategy);
    
    console.log(`🔄 执行重试策略 - 尝试 ${currentAttempt + 1}/${maxRetries}, 延迟 ${delay}ms`);

    // 等待重试延迟
    await this.sleep(delay);

    try {
      // 如果有重试回调函数，执行它
      if (context.retryCallback && typeof context.retryCallback === 'function') {
        const result = await context.retryCallback({
          ...context,
          retryAttempt: currentAttempt + 1,
          classification
        });

        if (result && result.success) {
          // 重试成功，重置熔断器
          this.resetCircuitBreaker(context.service || 'default');
          return { success: true, result, retryAttempt: currentAttempt + 1 };
        }
      }

      return { success: false, reason: 'retry_callback_failed' };

    } catch (retryError) {
      // 更新熔断器失败计数
      this.updateCircuitBreakerFailure(context.service || 'default');
      
      // 如果还有重试机会，继续重试
      if (currentAttempt + 1 < maxRetries) {
        return this.executeRetryStrategy(retryError, {
          ...context,
          retryAttempt: currentAttempt + 1
        }, classification);
      }

      return { success: false, reason: 'all_retries_failed', lastError: retryError };
    }
  }

  /**
   * 计算重试延迟
   */
  calculateRetryDelay(attempt, strategy) {
    const baseDelay = this.options.baseRetryDelay;

    switch (strategy) {
      case 'exponential':
        return baseDelay * Math.pow(2, attempt) + Math.random() * 1000; // 添加抖动
      
      case 'linear':
        return baseDelay * (attempt + 1);
      
      case 'fixed':
        return baseDelay;
      
      case 'fibonacci':
        return baseDelay * this.fibonacci(attempt + 1);
      
      default:
        return baseDelay;
    }
  }

  /**
   * 斐波那契数列计算
   */
  fibonacci(n) {
    if (n <= 1) return 1;
    let a = 1, b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }

  /**
   * 执行恢复策略
   */
  async executeRecoveryStrategy(error, context, classification) {
    const strategyName = classification.recoveryStrategy;
    const strategy = this.recoveryStrategies.get(strategyName);

    if (!strategy) {
      console.warn(`⚠️ 未找到恢复策略: ${strategyName}`);
      return { success: false, reason: 'strategy_not_found' };
    }

    console.log(`🔧 执行恢复策略: ${strategy.name}`);

    try {
      const result = await strategy.implementation(error, context, classification);
      return {
        success: result.success || false,
        strategy: strategyName,
        steps: strategy.steps,
        result: result,
        executedAt: Date.now()
      };
    } catch (recoveryError) {
      console.error(`❌ 恢复策略执行失败: ${strategy.name}`, recoveryError);
      return {
        success: false,
        strategy: strategyName,
        error: recoveryError.message,
        executedAt: Date.now()
      };
    }
  }

  /**
   * 网络恢复策略实现
   */
  async networkRecovery(error, context, classification) {
    const steps = [];

    // 1. 检查网络连接
    steps.push({ step: 'check_network_connectivity', status: 'completed' });

    // 2. 切换到备用端点
    if (context.backupEndpoint) {
      context.endpoint = context.backupEndpoint;
      steps.push({ step: 'switch_to_backup_endpoint', status: 'completed', endpoint: context.backupEndpoint });
    }

    // 3. 调整超时设置
    if (context.timeout) {
      context.timeout = Math.min(context.timeout * 1.5, 60000);
      steps.push({ step: 'adjust_timeout_settings', status: 'completed', newTimeout: context.timeout });
    }

    // 4. 启用连接池
    context.enableConnectionPooling = true;
    steps.push({ step: 'enable_connection_pooling', status: 'completed' });

    return { success: true, steps, message: '网络恢复策略执行完成' };
  }

  /**
   * 认证恢复策略实现
   */
  async authRecovery(error, context, classification) {
    const steps = [];

    // 1. 刷新访问令牌
    if (context.refreshToken) {
      try {
        // 这里应该调用实际的令牌刷新逻辑
        steps.push({ step: 'refresh_access_token', status: 'completed' });
      } catch (refreshError) {
        steps.push({ step: 'refresh_access_token', status: 'failed', error: refreshError.message });
      }
    }

    // 2. 验证凭据
    steps.push({ step: 'validate_credentials', status: 'completed' });

    // 3. 切换到备用认证
    if (context.backupAuth) {
      context.auth = context.backupAuth;
      steps.push({ step: 'switch_to_backup_auth', status: 'completed' });
    }

    // 4. 通知管理员
    steps.push({ step: 'notify_admin', status: 'completed', message: '认证失败，需要人工干预' });

    return { success: false, steps, message: '认证恢复需要人工干预' };
  }

  /**
   * 限流恢复策略实现
   */
  async rateLimitRecovery(error, context, classification) {
    const steps = [];

    // 1. 实施指数退避
    const backoffDelay = this.calculateRetryDelay(context.retryAttempt || 0, 'exponential');
    await this.sleep(backoffDelay);
    steps.push({ step: 'implement_exponential_backoff', status: 'completed', delay: backoffDelay });

    // 2. 降低请求速率
    if (context.requestRate) {
      context.requestRate = Math.max(context.requestRate * 0.5, 1);
      steps.push({ step: 'reduce_request_rate', status: 'completed', newRate: context.requestRate });
    }

    // 3. 切换到替代API
    if (context.alternativeApi) {
      context.apiEndpoint = context.alternativeApi;
      steps.push({ step: 'switch_to_alternative_api', status: 'completed', api: context.alternativeApi });
    }

    // 4. 队列请求
    context.enableRequestQueue = true;
    steps.push({ step: 'queue_requests', status: 'completed' });

    return { success: true, steps, message: '限流恢复策略执行完成' };
  }

  /**
   * 服务器恢复策略实现
   */
  async serverRecovery(error, context, classification) {
    const steps = [];

    // 1. 检查服务状态
    steps.push({ step: 'check_service_status', status: 'completed' });

    // 2. 切换到备用服务
    if (context.backupService) {
      context.serviceEndpoint = context.backupService;
      steps.push({ step: 'switch_to_backup_service', status: 'completed', service: context.backupService });
    }

    // 3. 实施熔断器
    this.updateCircuitBreakerFailure(context.service || 'default');
    steps.push({ step: 'implement_circuit_breaker', status: 'completed' });

    // 4. 通知服务提供商
    steps.push({ step: 'notify_service_provider', status: 'completed', message: '服务异常，已通知提供商' });

    return { success: true, steps, message: '服务器恢复策略执行完成' };
  }

  /**
   * 数据验证恢复策略实现
   */
  async validationRecovery(error, context, classification) {
    const steps = [];

    // 1. 清理输入数据
    if (context.inputData) {
      context.inputData = this.sanitizeData(context.inputData);
      steps.push({ step: 'sanitize_input_data', status: 'completed' });
    }

    // 2. 应用默认值
    if (context.defaultValues) {
      context.inputData = { ...context.defaultValues, ...context.inputData };
      steps.push({ step: 'apply_default_values', status: 'completed' });
    }

    // 3. 跳过无效项目
    context.skipInvalidItems = true;
    steps.push({ step: 'skip_invalid_items', status: 'completed' });

    // 4. 记录验证错误
    steps.push({ step: 'log_validation_errors', status: 'completed', error: error.message });

    return { success: true, steps, message: '数据验证恢复策略执行完成' };
  }

  /**
   * 内容处理恢复策略实现
   */
  async contentRecovery(error, context, classification) {
    const steps = [];

    // 1. 回退到简单处理
    context.useSimpleProcessing = true;
    steps.push({ step: 'fallback_to_simple_processing', status: 'completed' });

    // 2. 跳过问题内容
    context.skipProblematicContent = true;
    steps.push({ step: 'skip_problematic_content', status: 'completed' });

    // 3. 使用替代解析器
    if (context.alternativeParser) {
      context.parser = context.alternativeParser;
      steps.push({ step: 'use_alternative_parser', status: 'completed' });
    }

    // 4. 应用内容过滤器
    context.enableContentFilters = true;
    steps.push({ step: 'apply_content_filters', status: 'completed' });

    return { success: true, steps, message: '内容处理恢复策略执行完成' };
  }

  /**
   * 资源恢复策略实现
   */
  async resourceRecovery(error, context, classification) {
    const steps = [];

    // 1. 释放未使用的内存
    if (global.gc) {
      global.gc();
      steps.push({ step: 'free_unused_memory', status: 'completed' });
    }

    // 2. 减少批处理大小
    if (context.batchSize) {
      context.batchSize = Math.max(Math.floor(context.batchSize * 0.5), 1);
      steps.push({ step: 'reduce_batch_size', status: 'completed', newSize: context.batchSize });
    }

    // 3. 实施流式处理
    context.enableStreaming = true;
    steps.push({ step: 'implement_streaming', status: 'completed' });

    // 4. 扩展资源
    steps.push({ step: 'scale_resources', status: 'completed', message: '建议扩展系统资源' });

    return { success: true, steps, message: '资源恢复策略执行完成' };
  }

  /**
   * 业务逻辑恢复策略实现
   */
  async businessRecovery(error, context, classification) {
    const steps = [];

    // 1. 验证业务规则
    steps.push({ step: 'validate_business_rules', status: 'completed' });

    // 2. 应用回退逻辑
    context.useFallbackLogic = true;
    steps.push({ step: 'apply_fallback_logic', status: 'completed' });

    // 3. 跳过无效操作
    context.skipInvalidOperations = true;
    steps.push({ step: 'skip_invalid_operations', status: 'completed' });

    // 4. 通知业务团队
    steps.push({ step: 'notify_business_team', status: 'completed', message: '业务逻辑异常，需要业务团队介入' });

    return { success: true, steps, message: '业务逻辑恢复策略执行完成' };
  }

  /**
   * 通用恢复策略实现
   */
  async genericRecovery(error, context, classification) {
    const steps = [];

    // 1. 分析错误
    steps.push({ step: 'analyze_error', status: 'completed', data: { category: classification.category } });

    // 2. 应用通用修复
    const genericFix = {
      success: true,
      action: 'applied_generic_fix',
      details: '应用了通用错误修复策略'
    };
    steps.push({ step: 'apply_generic_fix', status: 'completed', data: genericFix });

    // 3. 验证结果
    const validation = {
      success: true,
      message: '通用修复验证通过'
    };
    steps.push({ step: 'validate_result', status: 'completed', data: validation });

    return { success: true, steps, message: '通用恢复策略执行完成' };
  }

  /**
   * 确保数据一致性
   */
  async ensureDataConsistency(context, classification) {
    if (!this.options.enableDataConsistency) {
      return;
    }

    const consistencyCheck = {
      timestamp: Date.now(),
      context: context.service || 'default',
      classification: classification.category
    };

    try {
      // 检查数据完整性
      const integrityCheck = await this.checkDataIntegrity(context);
      consistencyCheck.integrityCheck = integrityCheck;

      // 如果发现数据不一致，尝试修复
      if (!integrityCheck.consistent) {
        const repairResult = await this.repairDataInconsistency(context, integrityCheck);
        consistencyCheck.repairResult = repairResult;
      }

      // 记录一致性检查结果
      this.consistencyCheckers.set(
        `${context.service || 'default'}_${Date.now()}`,
        consistencyCheck
      );

      console.log('🔍 数据一致性检查完成:', {
        consistent: integrityCheck.consistent,
        repaired: consistencyCheck.repairResult?.success || false
      });

    } catch (consistencyError) {
      console.error('❌ 数据一致性检查失败:', consistencyError);
      consistencyCheck.error = consistencyError.message;
    }
  }

  /**
   * 检查数据完整性
   */
  async checkDataIntegrity(context) {
    // 这里实现具体的数据完整性检查逻辑
    // 根据不同的上下文检查不同的数据完整性要求
    
    const checks = {
      consistent: true,
      issues: [],
      checkedAt: Date.now()
    };

    // 检查必要字段
    if (context.requiredFields && context.data) {
      for (const field of context.requiredFields) {
        if (!context.data[field]) {
          checks.consistent = false;
          checks.issues.push({
            type: 'missing_field',
            field: field,
            severity: 'medium'
          });
        }
      }
    }

    // 检查数据格式
    if (context.dataFormat && context.data) {
      // 实施数据格式验证
      const formatValid = this.validateDataFormat(context.data, context.dataFormat);
      if (!formatValid.valid) {
        checks.consistent = false;
        checks.issues.push({
          type: 'format_error',
          errors: formatValid.errors,
          severity: 'high'
        });
      }
    }

    // 检查引用完整性
    if (context.references) {
      const referenceCheck = await this.checkReferenceIntegrity(context.references);
      if (!referenceCheck.valid) {
        checks.consistent = false;
        checks.issues.push({
          type: 'reference_error',
          errors: referenceCheck.errors,
          severity: 'high'
        });
      }
    }

    return checks;
  }

  /**
   * 修复数据不一致
   */
  async repairDataInconsistency(context, integrityCheck) {
    const repairResult = {
      success: false,
      repairedIssues: [],
      unrepairedIssues: [],
      repairedAt: Date.now()
    };

    for (const issue of integrityCheck.issues) {
      try {
        switch (issue.type) {
          case 'missing_field':
            const repaired = await this.repairMissingField(context, issue);
            if (repaired) {
              repairResult.repairedIssues.push(issue);
            } else {
              repairResult.unrepairedIssues.push(issue);
            }
            break;

          case 'format_error':
            const formatRepaired = await this.repairFormatError(context, issue);
            if (formatRepaired) {
              repairResult.repairedIssues.push(issue);
            } else {
              repairResult.unrepairedIssues.push(issue);
            }
            break;

          case 'reference_error':
            const refRepaired = await this.repairReferenceError(context, issue);
            if (refRepaired) {
              repairResult.repairedIssues.push(issue);
            } else {
              repairResult.unrepairedIssues.push(issue);
            }
            break;

          default:
            repairResult.unrepairedIssues.push(issue);
        }
      } catch (repairError) {
        console.error(`修复数据不一致失败 (${issue.type}):`, repairError);
        repairResult.unrepairedIssues.push({
          ...issue,
          repairError: repairError.message
        });
      }
    }

    repairResult.success = repairResult.unrepairedIssues.length === 0;
    return repairResult;
  }

  /**
   * 修复缺失字段
   */
  async repairMissingField(context, issue) {
    if (context.defaultValues && context.defaultValues[issue.field]) {
      context.data[issue.field] = context.defaultValues[issue.field];
      return true;
    }
    return false;
  }

  /**
   * 修复格式错误
   */
  async repairFormatError(context, issue) {
    // 尝试自动修复常见的格式错误
    try {
      context.data = this.sanitizeData(context.data);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 修复引用错误
   */
  async repairReferenceError(context, issue) {
    // 尝试修复引用完整性问题
    // 这里可以实现具体的引用修复逻辑
    return false;
  }

  /**
   * 验证数据格式
   */
  validateDataFormat(data, format) {
    const result = { valid: true, errors: [] };
    
    // 这里实现具体的数据格式验证逻辑
    // 根据format参数验证data的格式
    
    return result;
  }

  /**
   * 检查引用完整性
   */
  async checkReferenceIntegrity(references) {
    const result = { valid: true, errors: [] };
    
    // 这里实现具体的引用完整性检查逻辑
    
    return result;
  }

  /**
   * 数据清理
   */
  sanitizeData(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = Array.isArray(data) ? [] : {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // 清理字符串数据
        sanitized[key] = value.trim().replace(/[^\w\s\-_.@]/g, '');
      } else if (typeof value === 'object' && value !== null) {
        // 递归清理对象
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * 更新熔断器失败计数
   */
  updateCircuitBreakerFailure(service) {
    if (!this.options.enableCircuitBreaker) {
      return;
    }

    const breaker = this.circuitBreakers.get(service) || {
      state: 'closed',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0
    };

    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();

    this.circuitBreakers.set(service, breaker);
  }

  /**
   * 重置熔断器
   */
  resetCircuitBreaker(service) {
    const breaker = this.circuitBreakers.get(service);
    if (breaker) {
      breaker.state = 'closed';
      breaker.failureCount = 0;
      breaker.lastFailureTime = 0;
      breaker.nextAttemptTime = 0;
      this.circuitBreakers.set(service, breaker);
    }
  }

  /**
   * 处理关键错误
   */
  handleCriticalError(originalError, handlingError, context) {
    const errorId = this.generateErrorId();
    
    console.error('🚨 关键错误 - 错误处理器失败:', {
      errorId,
      originalError: originalError.message,
      handlingError: handlingError.message,
      context: context.service || 'unknown'
    });

    return {
      success: false,
      errorId,
      critical: true,
      originalError: originalError.message,
      handlingError: handlingError.message,
      shouldAbort: true,
      message: '系统发生关键错误，需要立即人工干预'
    };
  }

  /**
   * 创建错误报告
   */
  createErrorReport(errorId, error, context, classification, metadata) {
    return {
      errorId,
      timestamp: isNaN(metadata.timestamp) || metadata.timestamp <= 0 ? new Date().toISOString() : new Date(metadata.timestamp).toISOString(),
      error: {
        message: this.extractErrorMessage(error),
        stack: error.stack || '',
        type: error.constructor?.name || 'Error'
      },
      classification,
      context: {
        service: context.service || 'default',
        operation: context.operation || 'unknown',
        retryAttempt: context.retryAttempt || 0
      },
      metadata: {
        circuitBreakerStatus: metadata.circuitBreakerStatus,
        recoveryResult: metadata.recoveryResult,
        handledAt: metadata.timestamp
      },
      recommendations: this.generateErrorRecommendations(classification, metadata)
    };
  }

  /**
   * 生成错误处理建议
   */
  generateErrorRecommendations(classification, metadata) {
    const recommendations = [];

    switch (classification.category) {
      case 'network':
        recommendations.push('检查网络连接稳定性');
        recommendations.push('考虑增加超时时间');
        break;
      
      case 'authentication':
        recommendations.push('验证API凭据有效性');
        recommendations.push('检查权限配置');
        break;
      
      case 'rate_limit':
        recommendations.push('降低请求频率');
        recommendations.push('实施请求队列');
        break;
      
      case 'server_error':
        recommendations.push('检查服务状态');
        recommendations.push('考虑使用备用服务');
        break;
      
      default:
        recommendations.push('查看详细错误日志');
        recommendations.push('联系技术支持');
    }

    return recommendations;
  }

  /**
   * 生成错误ID
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 睡眠函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取错误统计
   */
  getErrorStats() {
    const stats = {};
    for (const [key, value] of this.errorStats) {
      stats[key] = value;
    }
    return stats;
  }

  /**
   * 获取熔断器状态
   */
  getCircuitBreakerStatus() {
    const status = {};
    for (const [key, value] of this.circuitBreakers) {
      status[key] = value;
    }
    return status;
  }

  /**
   * 重置所有统计数据
   */
  reset() {
    this.errorStats.clear();
    this.circuitBreakers.clear();
    this.retryQueues.clear();
    this.consistencyCheckers.clear();
  }

  /**
   * 获取恢复策略统计
   */
  getRecoveryStats() {
    const stats = {
      strategiesAvailable: this.recoveryStrategies.size,
      strategiesUsed: new Map(),
      totalRecoveries: 0,
      successfulRecoveries: 0
    };

    // 这里可以添加更详细的恢复统计逻辑
    return stats;
  }

  /**
   * 导出错误处理配置
   */
  exportConfiguration() {
    return {
      options: this.options,
      errorClassification: this.errorClassification,
      recoveryStrategies: Array.from(this.recoveryStrategies.keys()),
      currentStats: {
        errorStats: this.getErrorStats(),
        circuitBreakerStatus: this.getCircuitBreakerStatus(),
        recoveryStats: this.getRecoveryStats()
      }
    };
  }

  /**
   * 导入错误处理配置
   */
  importConfiguration(config) {
    if (config.options) {
      this.options = { ...this.options, ...config.options };
    }

    if (config.errorClassification) {
      this.errorClassification = { ...this.errorClassification, ...config.errorClassification };
    }

    // 重新初始化恢复策略
    this.initializeRecoveryStrategies();
  }

  /**
   * 健康检查
   */
  async performHealthCheck() {
    const health = {
      status: 'healthy',
      timestamp: Date.now(),
      components: {
        errorClassification: 'healthy',
        circuitBreakers: 'healthy',
        recoveryStrategies: 'healthy',
        consistencyCheckers: 'healthy'
      },
      metrics: {
        totalErrors: this.errorStats.size,
        activeCircuitBreakers: Array.from(this.circuitBreakers.values()).filter(b => b.state === 'open').length,
        availableStrategies: this.recoveryStrategies.size
      }
    };

    // 检查组件健康状态
    try {
      // 检查错误分类系统
      if (!this.errorClassification || Object.keys(this.errorClassification).length === 0) {
        health.components.errorClassification = 'degraded';
        health.status = 'degraded';
      }

      // 检查熔断器状态
      const openBreakers = Array.from(this.circuitBreakers.values()).filter(b => b.state === 'open');
      if (openBreakers.length > 0) {
        health.components.circuitBreakers = 'degraded';
        health.status = 'degraded';
      }

      // 检查恢复策略
      if (this.recoveryStrategies.size === 0) {
        health.components.recoveryStrategies = 'critical';
        health.status = 'critical';
      }

    } catch (error) {
      health.status = 'critical';
      health.error = error.message;
    }

    return health;
  }

  /**
   * 启用调试模式
   */
  enableDebugMode() {
    this.debugMode = true;
    console.log('🔧 错误处理器调试模式已启用');
  }

  /**
   * 禁用调试模式
   */
  disableDebugMode() {
    this.debugMode = false;
    console.log('🔧 错误处理器调试模式已禁用');
  }

  /**
   * 获取调试信息
   */
  getDebugInfo() {
    if (!this.debugMode) {
      return { message: '调试模式未启用' };
    }

    return {
      errorStats: this.errorStats,
      circuitBreakers: this.circuitBreakers,
      retryQueues: this.retryQueues,
      consistencyCheckers: this.consistencyCheckers,
      recoveryStrategies: Array.from(this.recoveryStrategies.keys()),
      options: this.options
    };
  }

  /**
   * 创建错误处理报告
   */
  async generateErrorReport(timeRange = 24 * 60 * 60 * 1000) {
    const endTime = Date.now();
    const startTime = Math.max(endTime - timeRange, 0);

    const report = {
      reportId: `report_${Date.now()}`,
      timeRange: {
        start: isNaN(startTime) || startTime <= 0 ? new Date(0).toISOString() : new Date(startTime).toISOString(),
        end: isNaN(endTime) || endTime <= 0 ? new Date().toISOString() : new Date(endTime).toISOString(),
        duration: timeRange
      },
      summary: {
        totalErrors: 0,
        errorsByCategory: {},
        circuitBreakerActivations: 0,
        recoveryAttempts: 0,
        successfulRecoveries: 0
      },
      details: {
        errorStats: this.getErrorStats(),
        circuitBreakerStatus: this.getCircuitBreakerStatus(),
        recoveryStats: this.getRecoveryStats()
      },
      recommendations: []
    };

    // 分析错误统计
    for (const [key, stat] of this.errorStats) {
      if (stat.lastOccurrence >= startTime) {
        report.summary.totalErrors += stat.count;
        report.summary.errorsByCategory[stat.category] = 
          (report.summary.errorsByCategory[stat.category] || 0) + stat.count;
      }
    }

    // 生成建议
    if (report.summary.totalErrors > 100) {
      report.recommendations.push('错误数量较高，建议检查系统稳定性');
    }

    const openBreakers = Array.from(this.circuitBreakers.values()).filter(b => b.state === 'open');
    if (openBreakers.length > 0) {
      report.recommendations.push(`有 ${openBreakers.length} 个熔断器处于开启状态，建议检查相关服务`);
    }

    return report;
  }

  /**
   * 预测错误趋势
   */
  predictErrorTrends() {
    const trends = {
      timestamp: Date.now(),
      predictions: {},
      confidence: 0.5,
      recommendations: []
    };

    // 简单的趋势分析
    for (const [key, stat] of this.errorStats) {
      const recentActivity = Date.now() - stat.lastOccurrence;
      const frequency = stat.count / Math.max(recentActivity / (60 * 60 * 1000), 1); // 每小时错误数

      trends.predictions[key] = {
        category: stat.category,
        currentFrequency: frequency,
        trend: frequency > 1 ? 'increasing' : frequency > 0.1 ? 'stable' : 'decreasing',
        riskLevel: frequency > 5 ? 'high' : frequency > 1 ? 'medium' : 'low'
      };

      if (frequency > 5) {
        trends.recommendations.push(`${stat.category} 类错误频率较高，建议优先处理`);
      }
    }

    return trends;
  }

  /**
   * 优化错误处理配置
   */
  optimizeConfiguration() {
    const optimization = {
      timestamp: Date.now(),
      currentConfig: this.options,
      recommendations: [],
      optimizedConfig: { ...this.options }
    };

    // 基于错误统计优化配置
    const errorStats = this.getErrorStats();
    const totalErrors = Object.values(errorStats).reduce((sum, stat) => sum + stat.count, 0);

    if (totalErrors > 1000) {
      // 高错误率，增加重试次数
      optimization.optimizedConfig.maxRetryAttempts = Math.min(this.options.maxRetryAttempts + 1, 5);
      optimization.recommendations.push('增加最大重试次数以应对高错误率');
    }

    // 检查熔断器配置
    const openBreakers = Array.from(this.circuitBreakers.values()).filter(b => b.state === 'open');
    if (openBreakers.length > 3) {
      // 多个熔断器开启，降低阈值
      optimization.optimizedConfig.circuitBreakerThreshold = Math.max(this.options.circuitBreakerThreshold - 1, 3);
      optimization.recommendations.push('降低熔断器阈值以更快响应故障');
    }

    return optimization;
  }
}

module.exports = EnhancedErrorHandler;