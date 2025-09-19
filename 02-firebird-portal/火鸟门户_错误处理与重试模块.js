/**
 * 火鸟门户错误处理与重试模块
 * 提供完整的错误处理、重试机制和监控功能
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-01-20
 */

class HuoNiaoErrorHandler {
    constructor(options = {}) {
        this.config = {
            // 重试配置
            maxRetries: options.maxRetries || 3,
            retryDelay: options.retryDelay || 1000, // 毫秒
            retryMultiplier: options.retryMultiplier || 2,
            maxRetryDelay: options.maxRetryDelay || 30000, // 30秒
            
            // 超时配置
            requestTimeout: options.requestTimeout || 30000, // 30秒
            
            // 错误分类
            retryableErrors: options.retryableErrors || [
                'ECONNRESET',
                'ENOTFOUND',
                'ECONNREFUSED',
                'ETIMEDOUT',
                'NETWORK_ERROR',
                'TIMEOUT_ERROR',
                'SERVER_ERROR',
                'RATE_LIMIT_ERROR'
            ],
            
            // 监控配置
            enableLogging: options.enableLogging !== false,
            enableMetrics: options.enableMetrics !== false,
            
            // 回调函数
            onRetry: options.onRetry || null,
            onError: options.onError || null,
            onSuccess: options.onSuccess || null
        };

        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            retriedRequests: 0,
            totalRetries: 0,
            errorsByType: {},
            averageResponseTime: 0,
            lastError: null,
            lastSuccess: null
        };

        this.circuitBreaker = {
            isOpen: false,
            failureCount: 0,
            failureThreshold: options.circuitBreakerThreshold || 5,
            resetTimeout: options.circuitBreakerResetTimeout || 60000, // 1分钟
            lastFailureTime: null
        };
    }

    /**
     * 执行带重试的异步操作
     * @param {Function} operation - 要执行的异步操作
     * @param {Object} context - 操作上下文信息
     * @returns {Promise} 操作结果
     */
    async executeWithRetry(operation, context = {}) {
        const startTime = Date.now();
        let lastError = null;
        
        // 检查熔断器状态
        if (this.isCircuitBreakerOpen()) {
            throw new Error('Circuit breaker is open - too many failures');
        }

        this.metrics.totalRequests++;

        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            try {
                // 执行操作
                const result = await this.executeOperation(operation, context, attempt);
                
                // 记录成功
                this.recordSuccess(startTime);
                
                if (attempt > 0) {
                    this.log('info', `操作在第${attempt + 1}次尝试后成功`, { context, attempt });
                }

                return result;

            } catch (error) {
                lastError = error;
                
                // 记录错误
                this.recordError(error, attempt, context);

                // 判断是否应该重试
                if (attempt < this.config.maxRetries && this.shouldRetry(error)) {
                    const delay = this.calculateRetryDelay(attempt);
                    
                    this.log('warn', `操作失败，${delay}ms后进行第${attempt + 2}次尝试`, {
                        error: error.message,
                        attempt: attempt + 1,
                        delay,
                        context
                    });

                    // 调用重试回调
                    if (this.config.onRetry) {
                        await this.config.onRetry(error, attempt + 1, context);
                    }

                    await this.delay(delay);
                    continue;
                }

                // 不再重试，抛出最后的错误
                break;
            }
        }

        // 记录最终失败
        this.recordFinalFailure(lastError, startTime);
        
        // 调用错误回调
        if (this.config.onError) {
            await this.config.onError(lastError, context);
        }

        throw this.enhanceError(lastError, context);
    }

    /**
     * 执行单次操作
     */
    async executeOperation(operation, context, attempt) {
        const timeout = this.config.requestTimeout;
        
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Operation timeout after ${timeout}ms`));
            }, timeout);

            try {
                const result = await operation(context, attempt);
                clearTimeout(timeoutId);
                resolve(result);
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    /**
     * 判断错误是否应该重试
     */
    shouldRetry(error) {
        // 检查错误类型
        if (this.isRetryableError(error)) {
            return true;
        }

        // 检查HTTP状态码
        if (error.response && error.response.status) {
            const status = error.response.status;
            
            // 5xx服务器错误通常可以重试
            if (status >= 500 && status < 600) {
                return true;
            }
            
            // 429 Too Many Requests 可以重试
            if (status === 429) {
                return true;
            }
            
            // 408 Request Timeout 可以重试
            if (status === 408) {
                return true;
            }
        }

        return false;
    }

    /**
     * 检查是否为可重试的错误
     */
    isRetryableError(error) {
        const errorCode = error.code || error.name || '';
        const errorMessage = error.message || '';

        // 检查错误代码
        for (const retryableError of this.config.retryableErrors) {
            if (errorCode.includes(retryableError) || errorMessage.includes(retryableError)) {
                return true;
            }
        }

        // 检查网络相关错误
        if (errorMessage.toLowerCase().includes('network') ||
            errorMessage.toLowerCase().includes('timeout') ||
            errorMessage.toLowerCase().includes('connection')) {
            return true;
        }

        return false;
    }

    /**
     * 计算重试延迟
     */
    calculateRetryDelay(attempt) {
        const baseDelay = this.config.retryDelay;
        const multiplier = this.config.retryMultiplier;
        const maxDelay = this.config.maxRetryDelay;
        
        // 指数退避算法
        let delay = baseDelay * Math.pow(multiplier, attempt);
        
        // 添加随机抖动（避免雷群效应）
        delay = delay * (0.5 + Math.random() * 0.5);
        
        return Math.min(delay, maxDelay);
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 记录成功
     */
    recordSuccess(startTime) {
        this.metrics.successfulRequests++;
        this.metrics.lastSuccess = new Date().toISOString();
        
        // 更新平均响应时间
        const responseTime = Date.now() - startTime;
        this.updateAverageResponseTime(responseTime);
        
        // 重置熔断器
        this.resetCircuitBreaker();

        // 调用成功回调
        if (this.config.onSuccess) {
            this.config.onSuccess({
                responseTime,
                metrics: this.getMetrics()
            });
        }
    }

    /**
     * 记录错误
     */
    recordError(error, attempt, context) {
        const errorType = this.getErrorType(error);
        
        if (attempt > 0) {
            this.metrics.retriedRequests++;
            this.metrics.totalRetries++;
        }

        // 统计错误类型
        if (!this.metrics.errorsByType[errorType]) {
            this.metrics.errorsByType[errorType] = 0;
        }
        this.metrics.errorsByType[errorType]++;

        // 更新熔断器状态
        this.updateCircuitBreaker(error);

        this.log('error', `操作失败 - 尝试 ${attempt + 1}`, {
            error: error.message,
            errorType,
            context,
            stack: error.stack
        });
    }

    /**
     * 记录最终失败
     */
    recordFinalFailure(error, startTime) {
        this.metrics.failedRequests++;
        this.metrics.lastError = {
            message: error.message,
            type: this.getErrorType(error),
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - startTime
        };
    }

    /**
     * 获取错误类型
     */
    getErrorType(error) {
        if (error.response && error.response.status) {
            return `HTTP_${error.response.status}`;
        }
        
        if (error.code) {
            return error.code;
        }
        
        if (error.name) {
            return error.name;
        }
        
        return 'UNKNOWN_ERROR';
    }

    /**
     * 增强错误信息
     */
    enhanceError(error, context) {
        const enhancedError = new Error(error.message);
        enhancedError.originalError = error;
        enhancedError.context = context;
        enhancedError.retryAttempts = this.config.maxRetries;
        enhancedError.timestamp = new Date().toISOString();
        enhancedError.metrics = this.getMetrics();
        
        return enhancedError;
    }

    /**
     * 更新平均响应时间
     */
    updateAverageResponseTime(responseTime) {
        const totalRequests = this.metrics.successfulRequests;
        const currentAverage = this.metrics.averageResponseTime;
        
        this.metrics.averageResponseTime = 
            ((currentAverage * (totalRequests - 1)) + responseTime) / totalRequests;
    }

    /**
     * 熔断器相关方法
     */
    isCircuitBreakerOpen() {
        if (!this.circuitBreaker.isOpen) {
            return false;
        }

        // 检查是否应该重置熔断器
        const now = Date.now();
        const timeSinceLastFailure = now - this.circuitBreaker.lastFailureTime;
        
        if (timeSinceLastFailure >= this.circuitBreaker.resetTimeout) {
            this.resetCircuitBreaker();
            return false;
        }

        return true;
    }

    updateCircuitBreaker(error) {
        this.circuitBreaker.failureCount++;
        this.circuitBreaker.lastFailureTime = Date.now();

        if (this.circuitBreaker.failureCount >= this.circuitBreaker.failureThreshold) {
            this.circuitBreaker.isOpen = true;
            this.log('warn', '熔断器已打开 - 暂停请求', {
                failureCount: this.circuitBreaker.failureCount,
                threshold: this.circuitBreaker.failureThreshold
            });
        }
    }

    resetCircuitBreaker() {
        if (this.circuitBreaker.isOpen) {
            this.log('info', '熔断器已重置');
        }
        
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failureCount = 0;
        this.circuitBreaker.lastFailureTime = null;
    }

    /**
     * 获取指标数据
     */
    getMetrics() {
        return {
            ...this.metrics,
            successRate: this.metrics.totalRequests > 0 
                ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
                : '0%',
            retryRate: this.metrics.totalRequests > 0
                ? (this.metrics.retriedRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
                : '0%',
            circuitBreakerStatus: this.circuitBreaker.isOpen ? 'OPEN' : 'CLOSED'
        };
    }

    /**
     * 重置指标
     */
    resetMetrics() {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            retriedRequests: 0,
            totalRetries: 0,
            errorsByType: {},
            averageResponseTime: 0,
            lastError: null,
            lastSuccess: null
        };
    }

    /**
     * 日志记录
     */
    log(level, message, data = {}) {
        if (!this.config.enableLogging) return;

        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            message,
            module: 'HuoNiaoErrorHandler',
            ...data
        };

        console.log(JSON.stringify(logEntry, null, 2));
    }
}

/**
 * 火鸟门户API错误处理器
 * 专门处理火鸟门户API相关的错误
 */
class HuoNiaoAPIErrorHandler extends HuoNiaoErrorHandler {
    constructor(options = {}) {
        super({
            ...options,
            retryableErrors: [
                ...options.retryableErrors || [],
                'API_RATE_LIMIT',
                'API_SERVER_ERROR',
                'API_TIMEOUT',
                'API_CONNECTION_ERROR'
            ]
        });
    }

    /**
     * 处理火鸟门户API响应
     */
    async handleAPIResponse(response, context) {
        try {
            // 检查响应状态
            if (!response.ok) {
                throw this.createAPIError(response, context);
            }

            const data = await response.json();
            
            // 检查业务状态码
            if (data.code !== 200 && data.code !== 0) {
                throw this.createBusinessError(data, context);
            }

            return data;

        } catch (error) {
            if (error.name === 'SyntaxError') {
                throw new Error('Invalid JSON response from API');
            }
            throw error;
        }
    }

    /**
     * 创建API错误
     */
    createAPIError(response, context) {
        const error = new Error(`API request failed with status ${response.status}`);
        error.name = 'APIError';
        error.status = response.status;
        error.statusText = response.statusText;
        error.context = context;
        
        return error;
    }

    /**
     * 创建业务错误
     */
    createBusinessError(data, context) {
        const error = new Error(data.message || data.msg || 'Business logic error');
        error.name = 'BusinessError';
        error.code = data.code;
        error.data = data;
        error.context = context;
        
        return error;
    }

    /**
     * 判断是否应该重试（重写父类方法）
     */
    shouldRetry(error) {
        // 业务逻辑错误通常不应该重试
        if (error.name === 'BusinessError') {
            // 除非是特定的可重试业务错误
            const retryableBusinessCodes = [1001, 1002]; // 示例：系统繁忙等
            return retryableBusinessCodes.includes(error.code);
        }

        // API错误的重试逻辑
        if (error.name === 'APIError') {
            const status = error.status;
            
            // 4xx客户端错误通常不应该重试（除了429）
            if (status >= 400 && status < 500 && status !== 429) {
                return false;
            }
        }

        return super.shouldRetry(error);
    }
}

/**
 * N8N集成的错误处理器
 */
class N8NHuoNiaoErrorHandler {
    constructor(options = {}) {
        this.apiErrorHandler = new HuoNiaoAPIErrorHandler(options);
        this.generalErrorHandler = new HuoNiaoErrorHandler(options);
    }

    /**
     * 执行火鸟门户API调用
     */
    async executeAPICall(apiFunction, context = {}) {
        return await this.apiErrorHandler.executeWithRetry(async () => {
            return await apiFunction();
        }, context);
    }

    /**
     * 执行一般操作
     */
    async executeOperation(operation, context = {}) {
        return await this.generalErrorHandler.executeWithRetry(operation, context);
    }

    /**
     * 批量处理数据
     */
    async batchProcess(items, processor, options = {}) {
        const results = {
            successful: [],
            failed: [],
            total: items.length,
            successCount: 0,
            failureCount: 0
        };

        const concurrency = options.concurrency || 3;
        const chunks = this.chunkArray(items, concurrency);

        for (const chunk of chunks) {
            const promises = chunk.map(async (item, index) => {
                try {
                    const result = await this.executeOperation(
                        () => processor(item),
                        { item, index }
                    );
                    
                    results.successful.push({
                        item,
                        result,
                        index
                    });
                    results.successCount++;
                    
                } catch (error) {
                    results.failed.push({
                        item,
                        error: error.message,
                        index
                    });
                    results.failureCount++;
                }
            });

            await Promise.all(promises);
        }

        return results;
    }

    /**
     * 数组分块
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * 获取综合指标
     */
    getMetrics() {
        return {
            api: this.apiErrorHandler.getMetrics(),
            general: this.generalErrorHandler.getMetrics()
        };
    }

    /**
     * 重置所有指标
     */
    resetMetrics() {
        this.apiErrorHandler.resetMetrics();
        this.generalErrorHandler.resetMetrics();
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HuoNiaoErrorHandler,
        HuoNiaoAPIErrorHandler,
        N8NHuoNiaoErrorHandler
    };
}

// 全局导出（用于N8N环境）
if (typeof global !== 'undefined') {
    global.HuoNiaoErrorHandler = HuoNiaoErrorHandler;
    global.HuoNiaoAPIErrorHandler = HuoNiaoAPIErrorHandler;
    global.N8NHuoNiaoErrorHandler = N8NHuoNiaoErrorHandler;
}