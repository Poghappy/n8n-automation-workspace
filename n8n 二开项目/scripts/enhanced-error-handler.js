/**
 * 增强版错误处理和重试机制模块
 * 为新闻采集工作流提供全面的错误处理、重试和恢复机制
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-01-22
 */

const axios = require('axios');

/**
 * 增强版错误处理器
 */
class EnhancedErrorHandler {
    constructor(config = {}) {
        this.config = {
            // 重试配置
            maxRetryAttempts: config.maxRetryAttempts || 3,
            baseRetryDelay: config.baseRetryDelay || 1000,
            maxRetryDelay: config.maxRetryDelay || 30000,
            retryMultiplier: config.retryMultiplier || 2,
            
            // 超时配置
            defaultTimeout: config.defaultTimeout || 30000,
            
            // 错误分类
            retryableErrors: config.retryableErrors || [
                'ECONNRESET',
                'ECONNREFUSED',
                'ETIMEDOUT',
                'ENOTFOUND',
                'EAI_AGAIN'
            ],
            
            retryableStatusCodes: config.retryableStatusCodes || [
                408, 429, 500, 502, 503, 504
            ],
            
            // 告警配置
            enableAlerting: config.enableAlerting !== false,
            alertThreshold: config.alertThreshold || 0.3, // 30%错误率触发告警
            alertWebhookUrl: config.alertWebhookUrl || process.env.WEBHOOK_ALERT_URL,
            
            // 日志配置
            enableLogging: config.enableLogging !== false,
            
            ...config
        };

        // 错误统计
        this.errorStats = {
            totalRequests: 0,
            totalErrors: 0,
            errorsByType: new Map(),
            errorsBySource: new Map(),
            lastResetTime: Date.now()
        };

        // 熔断器状态
        this.circuitBreakers = new Map();
    }

    /**
     * 带重试的HTTP请求
     * @param {Object} requestConfig - 请求配置
     * @param {Object} options - 选项
     * @returns {Promise} 请求结果
     */
    async requestWithRetry(requestConfig, options = {}) {
        const source = options.source || 'unknown';
        const maxAttempts = options.maxRetryAttempts || this.config.maxRetryAttempts;
        
        this.errorStats.totalRequests++;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                // 检查熔断器状态
                if (this.isCircuitBreakerOpen(source)) {
                    throw new Error(`熔断器开启，跳过请求: ${source}`);
                }

                this.log('info', `尝试请求 ${attempt}/${maxAttempts}`, {
                    source,
                    url: requestConfig.url,
                    method: requestConfig.method || 'GET'
                });

                // 设置超时
                const config = {
                    timeout: options.timeout || this.config.defaultTimeout,
                    ...requestConfig
                };

                const response = await axios(config);
                
                // 请求成功，重置熔断器
                this.resetCircuitBreaker(source);
                
                this.log('info', '请求成功', {
                    source,
                    status: response.status,
                    attempt
                });

                return response;

            } catch (error) {
                const isLastAttempt = attempt === maxAttempts;
                const shouldRetry = this.shouldRetry(error, attempt, maxAttempts);

                this.recordError(error, source);

                if (!shouldRetry || isLastAttempt) {
                    this.log('error', '请求最终失败', {
                        source,
                        error: error.message,
                        attempt,
                        maxAttempts
                    });

                    // 更新熔断器
                    this.updateCircuitBreaker(source, false);
                    
                    throw this.enhanceError(error, {
                        source,
                        attempt,
                        maxAttempts,
                        requestConfig
                    });
                }

                // 计算重试延迟
                const delay = this.calculateRetryDelay(attempt);
                
                this.log('warn', `请求失败，${delay}ms后重试`, {
                    source,
                    error: error.message,
                    attempt,
                    nextAttempt: attempt + 1
                });

                await this.delay(delay);
            }
        }
    }

    /**
     * RSS源采集错误处理
     * @param {Function} fetchFunction - 采集函数
     * @param {Object} source - RSS源配置
     * @param {Object} options - 选项
     * @returns {Promise} 采集结果
     */
    async handleRSSFetch(fetchFunction, source, options = {}) {
        try {
            this.log('info', '开始RSS采集', { source: source.name });

            const result = await this.requestWithRetry({
                method: 'GET',
                url: source.url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; n8n-news-collector/1.0)',
                    'Accept': 'application/rss+xml, application/xml, text/xml'
                }
            }, {
                source: source.name,
                timeout: source.timeout || 30000,
                maxRetryAttempts: source.retryAttempts || 3
            });

            const items = await fetchFunction(result.data, source);
            
            this.log('info', 'RSS采集成功', {
                source: source.name,
                itemCount: items.length
            });

            return {
                success: true,
                items,
                source: source.name
            };

        } catch (error) {
            this.log('error', 'RSS采集失败', {
                source: source.name,
                error: error.message
            });

            return {
                success: false,
                error: error.message,
                source: source.name,
                items: []
            };
        }
    }

    /**
     * GitHub API错误处理
     * @param {Function} apiFunction - API调用函数
     * @param {Object} config - GitHub配置
     * @param {Object} options - 选项
     * @returns {Promise} API结果
     */
    async handleGitHubAPI(apiFunction, config, options = {}) {
        try {
            this.log('info', '开始GitHub API调用', { repo: config.repo });

            // GitHub API特殊处理
            const headers = {
                'User-Agent': 'n8n-news-collector/1.0',
                'Accept': 'application/vnd.github.v3+json'
            };

            if (process.env.GITHUB_TOKEN) {
                headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
            }

            const result = await this.requestWithRetry({
                method: 'GET',
                url: config.url,
                headers
            }, {
                source: `GitHub-${config.repo}`,
                timeout: 30000,
                maxRetryAttempts: 3
            });

            const items = await apiFunction(result.data, config);
            
            this.log('info', 'GitHub API调用成功', {
                repo: config.repo,
                itemCount: items.length
            });

            return {
                success: true,
                items,
                source: config.repo
            };

        } catch (error) {
            // GitHub API特殊错误处理
            if (error.response?.status === 403) {
                const resetTime = error.response.headers['x-ratelimit-reset'];
                if (resetTime) {
                    const resetDate = new Date(parseInt(resetTime) * 1000);
                    this.log('warn', 'GitHub API限流', {
                        repo: config.repo,
                        resetTime: resetDate.toISOString()
                    });
                }
            }

            this.log('error', 'GitHub API调用失败', {
                repo: config.repo,
                error: error.message,
                status: error.response?.status
            });

            return {
                success: false,
                error: error.message,
                source: config.repo,
                items: []
            };
        }
    }

    /**
     * 火鸟门户API错误处理
     * @param {Object} data - 发布数据
     * @param {Object} options - 选项
     * @returns {Promise} 发布结果
     */
    async handleHuoNiaoPublish(data, options = {}) {
        try {
            this.log('info', '开始火鸟门户发布', { title: data.title });

            const result = await this.requestWithRetry({
                method: 'POST',
                url: 'https://hawaiihub.net/include/ajax.php',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': `PHPSESSID=${process.env.HUONIAO_SESSION_ID}`,
                    'User-Agent': 'n8n-automation/1.0'
                },
                data: new URLSearchParams({
                    service: 'article',
                    action: 'put',
                    title: data.title.substring(0, 60),
                    typeid: data.categoryId || 1,
                    body: data.content,
                    writer: data.author || 'AI采集',
                    source: data.source || 'AI采集',
                    sourceurl: data.source_url || '',
                    keywords: data.keywords || '',
                    description: data.summary || '',
                    litpic: data.image_url || ''
                }).toString()
            }, {
                source: 'HuoNiao-API',
                timeout: 30000,
                maxRetryAttempts: 3
            });

            // 检查火鸟门户API响应
            if (result.data.state === 100) {
                this.log('info', '火鸟门户发布成功', {
                    title: data.title,
                    articleId: result.data.info
                });

                return {
                    success: true,
                    articleId: result.data.info,
                    message: '发布成功'
                };
            } else {
                throw new Error(`发布失败: ${result.data.info || '未知错误'}`);
            }

        } catch (error) {
            this.log('error', '火鸟门户发布失败', {
                title: data.title,
                error: error.message
            });

            // 检查是否是会话过期
            if (error.response?.status === 401 || 
                (error.response?.data && error.response.data.includes('登录'))) {
                await this.sendAlert('火鸟门户会话过期', {
                    error: error.message,
                    needAction: '需要更新PHPSESSID'
                });
            }

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 判断是否应该重试
     * @param {Error} error - 错误对象
     * @param {number} attempt - 当前尝试次数
     * @param {number} maxAttempts - 最大尝试次数
     * @returns {boolean} 是否应该重试
     */
    shouldRetry(error, attempt, maxAttempts) {
        if (attempt >= maxAttempts) {
            return false;
        }

        // 检查错误代码
        if (error.code && this.config.retryableErrors.includes(error.code)) {
            return true;
        }

        // 检查HTTP状态码
        if (error.response?.status && 
            this.config.retryableStatusCodes.includes(error.response.status)) {
            return true;
        }

        // 特殊情况：GitHub API限流
        if (error.response?.status === 403 && 
            error.response.headers['x-ratelimit-remaining'] === '0') {
            return true;
        }

        return false;
    }

    /**
     * 计算重试延迟
     * @param {number} attempt - 尝试次数
     * @returns {number} 延迟毫秒数
     */
    calculateRetryDelay(attempt) {
        const delay = this.config.baseRetryDelay * Math.pow(this.config.retryMultiplier, attempt - 1);
        return Math.min(delay, this.config.maxRetryDelay);
    }

    /**
     * 记录错误统计
     * @param {Error} error - 错误对象
     * @param {string} source - 错误源
     */
    recordError(error, source) {
        this.errorStats.totalErrors++;

        // 按错误类型统计
        const errorType = error.code || error.response?.status || 'unknown';
        const typeCount = this.errorStats.errorsByType.get(errorType) || 0;
        this.errorStats.errorsByType.set(errorType, typeCount + 1);

        // 按错误源统计
        const sourceCount = this.errorStats.errorsBySource.get(source) || 0;
        this.errorStats.errorsBySource.set(source, sourceCount + 1);

        // 检查是否需要告警
        this.checkAlertThreshold();
    }

    /**
     * 检查告警阈值
     */
    async checkAlertThreshold() {
        if (!this.config.enableAlerting) return;

        const errorRate = this.errorStats.totalErrors / this.errorStats.totalRequests;
        
        if (errorRate >= this.config.alertThreshold) {
            await this.sendAlert('错误率过高告警', {
                errorRate: (errorRate * 100).toFixed(2) + '%',
                totalRequests: this.errorStats.totalRequests,
                totalErrors: this.errorStats.totalErrors,
                topErrors: this.getTopErrors()
            });

            // 重置统计避免重复告警
            this.resetErrorStats();
        }
    }

    /**
     * 获取主要错误类型
     * @returns {Array} 错误统计
     */
    getTopErrors() {
        const errors = [];
        
        for (const [type, count] of this.errorStats.errorsByType.entries()) {
            errors.push({ type, count });
        }
        
        return errors.sort((a, b) => b.count - a.count).slice(0, 5);
    }

    /**
     * 重置错误统计
     */
    resetErrorStats() {
        this.errorStats = {
            totalRequests: 0,
            totalErrors: 0,
            errorsByType: new Map(),
            errorsBySource: new Map(),
            lastResetTime: Date.now()
        };
    }

    /**
     * 熔断器检查
     * @param {string} source - 源标识
     * @returns {boolean} 熔断器是否开启
     */
    isCircuitBreakerOpen(source) {
        const breaker = this.circuitBreakers.get(source);
        if (!breaker) return false;

        if (breaker.state === 'open') {
            // 检查是否可以尝试半开
            if (Date.now() - breaker.lastFailTime > breaker.timeout) {
                breaker.state = 'half-open';
                this.log('info', '熔断器半开', { source });
                return false;
            }
            return true;
        }

        return false;
    }

    /**
     * 更新熔断器状态
     * @param {string} source - 源标识
     * @param {boolean} success - 是否成功
     */
    updateCircuitBreaker(source, success) {
        let breaker = this.circuitBreakers.get(source);
        
        if (!breaker) {
            breaker = {
                failureCount: 0,
                successCount: 0,
                state: 'closed',
                lastFailTime: 0,
                timeout: 60000 // 1分钟
            };
            this.circuitBreakers.set(source, breaker);
        }

        if (success) {
            breaker.successCount++;
            breaker.failureCount = 0;
            
            if (breaker.state === 'half-open' && breaker.successCount >= 3) {
                breaker.state = 'closed';
                this.log('info', '熔断器关闭', { source });
            }
        } else {
            breaker.failureCount++;
            breaker.successCount = 0;
            breaker.lastFailTime = Date.now();
            
            if (breaker.failureCount >= 5) {
                breaker.state = 'open';
                this.log('warn', '熔断器开启', { source, failureCount: breaker.failureCount });
            }
        }
    }

    /**
     * 重置熔断器
     * @param {string} source - 源标识
     */
    resetCircuitBreaker(source) {
        const breaker = this.circuitBreakers.get(source);
        if (breaker) {
            breaker.failureCount = 0;
            breaker.successCount++;
            if (breaker.state !== 'closed') {
                breaker.state = 'closed';
                this.log('info', '熔断器重置', { source });
            }
        }
    }

    /**
     * 增强错误信息
     * @param {Error} error - 原始错误
     * @param {Object} context - 上下文信息
     * @returns {Error} 增强后的错误
     */
    enhanceError(error, context) {
        const enhancedError = new Error(error.message);
        enhancedError.originalError = error;
        enhancedError.context = context;
        enhancedError.timestamp = new Date().toISOString();
        enhancedError.errorId = this.generateErrorId();
        
        return enhancedError;
    }

    /**
     * 生成错误ID
     * @returns {string} 错误ID
     */
    generateErrorId() {
        return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 发送告警
     * @param {string} title - 告警标题
     * @param {Object} data - 告警数据
     */
    async sendAlert(title, data) {
        if (!this.config.enableAlerting || !this.config.alertWebhookUrl) {
            return;
        }

        try {
            const alertData = {
                title,
                timestamp: new Date().toISOString(),
                severity: 'warning',
                source: 'enhanced-news-collection-workflow',
                data
            };

            await axios.post(this.config.alertWebhookUrl, alertData, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            this.log('info', '告警发送成功', { title });

        } catch (error) {
            this.log('error', '告警发送失败', { 
                title, 
                error: error.message 
            });
        }
    }

    /**
     * 延迟函数
     * @param {number} ms - 延迟毫秒数
     * @returns {Promise} Promise对象
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取错误统计报告
     * @returns {Object} 统计报告
     */
    getErrorReport() {
        const now = Date.now();
        const duration = now - this.errorStats.lastResetTime;
        
        return {
            duration: duration,
            totalRequests: this.errorStats.totalRequests,
            totalErrors: this.errorStats.totalErrors,
            errorRate: this.errorStats.totalRequests > 0 
                ? (this.errorStats.totalErrors / this.errorStats.totalRequests * 100).toFixed(2) + '%'
                : '0%',
            errorsByType: Object.fromEntries(this.errorStats.errorsByType),
            errorsBySource: Object.fromEntries(this.errorStats.errorsBySource),
            circuitBreakers: Object.fromEntries(
                Array.from(this.circuitBreakers.entries()).map(([key, value]) => [
                    key, 
                    {
                        state: value.state,
                        failureCount: value.failureCount,
                        successCount: value.successCount
                    }
                ])
            ),
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * 日志记录
     * @param {string} level - 日志级别
     * @param {string} message - 消息
     * @param {Object} data - 数据
     */
    log(level, message, data = {}) {
        if (!this.config.enableLogging) return;

        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            handler: 'EnhancedErrorHandler'
        };

        console.log(JSON.stringify(logEntry));
    }
}

module.exports = {
    EnhancedErrorHandler
};

// n8n使用示例
if (typeof $input !== 'undefined') {
    const errorHandler = new EnhancedErrorHandler({
        maxRetryAttempts: 3,
        enableAlerting: true,
        alertWebhookUrl: process.env.WEBHOOK_ALERT_URL
    });

    // 示例：处理RSS采集
    const rssSource = {
        name: 'Example RSS',
        url: 'https://example.com/feed.xml',
        timeout: 30000,
        retryAttempts: 3
    };

    const result = await errorHandler.handleRSSFetch(
        async (data, source) => {
            // RSS解析逻辑
            return [];
        },
        rssSource
    );

    return { json: result };
}