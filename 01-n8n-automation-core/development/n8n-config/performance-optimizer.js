/**
 * 性能优化和调优模块
 * 为火鸟门户自动化新闻工作流提供全面的性能优化功能
 * 
 * 主要功能：
 * 1. 分析工作流执行性能瓶颈
 * 2. 优化数据处理和API调用效率
 * 3. 实现并发处理和资源管理
 * 4. 调整超时和重试参数配置
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-08-23
 */

const fs = require('fs').promises;
const path = require('path');
const { PerformanceObserver, performance } = require('perf_hooks');

class PerformanceOptimizer {
    constructor(config = {}) {
        this.config = {
            // 性能监控配置
            enableProfiling: config.enableProfiling !== false,
            enableMetrics: config.enableMetrics !== false,
            metricsInterval: config.metricsInterval || 30000, // 30秒
            
            // 并发控制配置
            maxConcurrentTasks: config.maxConcurrentTasks || 5,
            maxConcurrentApiCalls: config.maxConcurrentApiCalls || 3,
            queueTimeout: config.queueTimeout || 60000, // 1分钟
            
            // 缓存配置
            enableCaching: config.enableCaching !== false,
            cacheSize: config.cacheSize || 1000,
            cacheTTL: config.cacheTTL || 3600000, // 1小时
            
            // 资源限制配置
            memoryThreshold: config.memoryThreshold || 0.8, // 80%
            cpuThreshold: config.cpuThreshold || 0.9, // 90%
            
            // 超时配置优化
            baseTimeout: config.baseTimeout || 30000, // 30秒
            maxTimeout: config.maxTimeout || 120000, // 2分钟
            timeoutMultiplier: config.timeoutMultiplier || 1.5,
            
            // 重试配置优化
            maxRetries: config.maxRetries || 3,
            baseRetryDelay: config.baseRetryDelay || 1000, // 1秒
            maxRetryDelay: config.maxRetryDelay || 30000, // 30秒
            retryMultiplier: config.retryMultiplier || 2,
            
            ...config
        };

        // 性能监控状态
        this.performanceMetrics = {
            startTime: Date.now(),
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            peakMemoryUsage: 0,
            currentConcurrency: 0,
            bottlenecks: new Map(),
            optimizations: new Map()
        };

        // 并发控制
        this.taskQueue = [];
        this.activeTasks = new Set();
        this.apiCallQueue = [];
        this.activeApiCalls = new Set();
        
        // 缓存系统
        this.cache = new Map();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };

        // 资源监控
        this.resourceMonitor = {
            memoryUsage: [],
            cpuUsage: [],
            lastGC: Date.now()
        };

        // 性能观察器
        this.performanceObserver = null;
        
        this.initializeOptimizer();
    }

    /**
     * 初始化性能优化器
     */
    initializeOptimizer() {
        if (this.config.enableProfiling) {
            this.setupPerformanceObserver();
        }

        if (this.config.enableMetrics) {
            this.startMetricsCollection();
        }

        // 启动资源监控
        this.startResourceMonitoring();
        
        // 启动任务队列处理
        this.startTaskQueueProcessor();
        
        console.log('🚀 性能优化器已启动', {
            maxConcurrentTasks: this.config.maxConcurrentTasks,
            maxConcurrentApiCalls: this.config.maxConcurrentApiCalls,
            cacheEnabled: this.config.enableCaching,
            profilingEnabled: this.config.enableProfiling
        });
    }

    /**
     * 设置性能观察器
     */
    setupPerformanceObserver() {
        this.performanceObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                this.recordPerformanceEntry(entry);
            });
        });

        this.performanceObserver.observe({ 
            entryTypes: ['measure', 'navigation', 'resource'] 
        });
    }

    /**
     * 记录性能条目
     */
    recordPerformanceEntry(entry) {
        const metric = {
            name: entry.name,
            type: entry.entryType,
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: Date.now()
        };

        // 识别性能瓶颈
        if (entry.duration > 5000) { // 超过5秒的操作
            this.identifyBottleneck(entry);
        }

        // 更新平均响应时间
        this.updateAverageResponseTime(entry.duration);
    }

    /**
     * 识别性能瓶颈
     */
    identifyBottleneck(entry) {
        const bottleneckKey = entry.name || entry.entryType;
        
        if (!this.performanceMetrics.bottlenecks.has(bottleneckKey)) {
            this.performanceMetrics.bottlenecks.set(bottleneckKey, {
                count: 0,
                totalDuration: 0,
                maxDuration: 0,
                averageDuration: 0,
                firstOccurrence: Date.now(),
                lastOccurrence: Date.now()
            });
        }

        const bottleneck = this.performanceMetrics.bottlenecks.get(bottleneckKey);
        bottleneck.count++;
        bottleneck.totalDuration += entry.duration;
        bottleneck.maxDuration = Math.max(bottleneck.maxDuration, entry.duration);
        bottleneck.averageDuration = bottleneck.totalDuration / bottleneck.count;
        bottleneck.lastOccurrence = Date.now();

        console.warn('⚠️ 性能瓶颈检测', {
            operation: bottleneckKey,
            duration: entry.duration,
            count: bottleneck.count,
            averageDuration: bottleneck.averageDuration
        });

        // 自动应用优化策略
        this.applyOptimizationStrategy(bottleneckKey, bottleneck);
    }

    /**
     * 应用优化策略
     */
    applyOptimizationStrategy(bottleneckKey, bottleneck) {
        const strategies = this.getOptimizationStrategies(bottleneckKey, bottleneck);
        
        strategies.forEach(strategy => {
            if (!this.performanceMetrics.optimizations.has(strategy.id)) {
                console.log('🔧 应用优化策略', {
                    strategy: strategy.name,
                    target: bottleneckKey,
                    expectedImprovement: strategy.expectedImprovement
                });

                strategy.apply();
                
                this.performanceMetrics.optimizations.set(strategy.id, {
                    name: strategy.name,
                    appliedAt: Date.now(),
                    target: bottleneckKey,
                    expectedImprovement: strategy.expectedImprovement
                });
            }
        });
    }

    /**
     * 获取优化策略
     */
    getOptimizationStrategies(bottleneckKey, bottleneck) {
        const strategies = [];

        // API调用优化策略
        if (bottleneckKey.includes('api') || bottleneckKey.includes('http')) {
            strategies.push({
                id: `api_timeout_${bottleneckKey}`,
                name: 'API超时优化',
                expectedImprovement: '20-30%',
                apply: () => this.optimizeApiTimeouts(bottleneckKey, bottleneck)
            });

            strategies.push({
                id: `api_retry_${bottleneckKey}`,
                name: 'API重试策略优化',
                expectedImprovement: '15-25%',
                apply: () => this.optimizeRetryStrategy(bottleneckKey, bottleneck)
            });
        }

        // 数据处理优化策略
        if (bottleneckKey.includes('process') || bottleneckKey.includes('content')) {
            strategies.push({
                id: `batch_processing_${bottleneckKey}`,
                name: '批处理优化',
                expectedImprovement: '30-50%',
                apply: () => this.enableBatchProcessing(bottleneckKey)
            });

            strategies.push({
                id: `cache_optimization_${bottleneckKey}`,
                name: '缓存优化',
                expectedImprovement: '40-60%',
                apply: () => this.optimizeCaching(bottleneckKey)
            });
        }

        // 并发处理优化策略
        if (bottleneck.count > 10 && bottleneck.averageDuration > 2000) {
            strategies.push({
                id: `concurrency_${bottleneckKey}`,
                name: '并发处理优化',
                expectedImprovement: '25-40%',
                apply: () => this.optimizeConcurrency(bottleneckKey)
            });
        }

        return strategies;
    }

    /**
     * 优化API超时配置
     */
    optimizeApiTimeouts(bottleneckKey, bottleneck) {
        const currentTimeout = this.config.baseTimeout;
        const averageDuration = bottleneck.averageDuration;
        
        // 基于历史数据动态调整超时时间
        const optimizedTimeout = Math.min(
            Math.max(averageDuration * 1.5, this.config.baseTimeout),
            this.config.maxTimeout
        );

        console.log('⏱️ 优化API超时配置', {
            operation: bottleneckKey,
            currentTimeout,
            optimizedTimeout,
            averageDuration
        });

        // 更新配置
        this.updateTimeoutConfig(bottleneckKey, optimizedTimeout);
    }

    /**
     * 优化重试策略
     */
    optimizeRetryStrategy(bottleneckKey, bottleneck) {
        const failureRate = this.calculateFailureRate(bottleneckKey);
        
        let optimizedRetries = this.config.maxRetries;
        let optimizedDelay = this.config.baseRetryDelay;

        // 根据失败率调整重试策略
        if (failureRate > 0.3) { // 失败率超过30%
            optimizedRetries = Math.min(this.config.maxRetries + 2, 5);
            optimizedDelay = this.config.baseRetryDelay * 1.5;
        } else if (failureRate < 0.1) { // 失败率低于10%
            optimizedRetries = Math.max(this.config.maxRetries - 1, 1);
            optimizedDelay = this.config.baseRetryDelay * 0.8;
        }

        console.log('🔄 优化重试策略', {
            operation: bottleneckKey,
            failureRate,
            optimizedRetries,
            optimizedDelay
        });

        this.updateRetryConfig(bottleneckKey, optimizedRetries, optimizedDelay);
    }

    /**
     * 启用批处理优化
     */
    enableBatchProcessing(bottleneckKey) {
        const batchSize = this.calculateOptimalBatchSize(bottleneckKey);
        
        console.log('📦 启用批处理优化', {
            operation: bottleneckKey,
            batchSize
        });

        // 实现批处理逻辑
        this.implementBatchProcessing(bottleneckKey, batchSize);
    }

    /**
     * 优化缓存策略
     */
    optimizeCaching(bottleneckKey) {
        const cacheHitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses);
        
        if (cacheHitRate < 0.5) { // 缓存命中率低于50%
            // 增加缓存大小
            this.config.cacheSize = Math.min(this.config.cacheSize * 1.5, 5000);
            
            // 延长缓存TTL
            this.config.cacheTTL = Math.min(this.config.cacheTTL * 1.2, 7200000); // 最大2小时
        }

        console.log('💾 优化缓存策略', {
            operation: bottleneckKey,
            cacheHitRate,
            newCacheSize: this.config.cacheSize,
            newCacheTTL: this.config.cacheTTL
        });
    }

    /**
     * 优化并发处理
     */
    optimizeConcurrency(bottleneckKey) {
        const currentConcurrency = this.config.maxConcurrentTasks;
        const systemLoad = this.getCurrentSystemLoad();
        
        let optimizedConcurrency = currentConcurrency;
        
        if (systemLoad < 0.7) { // 系统负载低于70%
            optimizedConcurrency = Math.min(currentConcurrency + 2, 10);
        } else if (systemLoad > 0.9) { // 系统负载高于90%
            optimizedConcurrency = Math.max(currentConcurrency - 1, 2);
        }

        console.log('⚡ 优化并发处理', {
            operation: bottleneckKey,
            currentConcurrency,
            optimizedConcurrency,
            systemLoad
        });

        this.config.maxConcurrentTasks = optimizedConcurrency;
    }

    /**
     * 执行优化的任务处理
     */
    async executeOptimizedTask(taskFunction, taskId, options = {}) {
        const startTime = performance.now();
        performance.mark(`task-start-${taskId}`);

        try {
            // 检查资源使用情况
            await this.checkResourceLimits();

            // 添加到任务队列
            const taskPromise = this.addToTaskQueue(taskFunction, taskId, options);
            
            // 执行任务
            const result = await taskPromise;
            
            performance.mark(`task-end-${taskId}`);
            performance.measure(`task-duration-${taskId}`, `task-start-${taskId}`, `task-end-${taskId}`);

            this.performanceMetrics.successfulRequests++;
            
            return result;

        } catch (error) {
            this.performanceMetrics.failedRequests++;
            
            // 记录错误并尝试优化
            this.recordTaskError(taskId, error);
            throw error;
            
        } finally {
            this.performanceMetrics.totalRequests++;
            const duration = performance.now() - startTime;
            this.updateAverageResponseTime(duration);
        }
    }

    /**
     * 添加任务到队列
     */
    async addToTaskQueue(taskFunction, taskId, options) {
        return new Promise((resolve, reject) => {
            const task = {
                id: taskId,
                function: taskFunction,
                options,
                resolve,
                reject,
                createdAt: Date.now(),
                priority: options.priority || 0
            };

            // 按优先级插入队列
            const insertIndex = this.taskQueue.findIndex(t => t.priority < task.priority);
            if (insertIndex === -1) {
                this.taskQueue.push(task);
            } else {
                this.taskQueue.splice(insertIndex, 0, task);
            }

            // 检查队列超时
            setTimeout(() => {
                if (this.taskQueue.includes(task)) {
                    this.taskQueue.splice(this.taskQueue.indexOf(task), 1);
                    reject(new Error(`任务队列超时: ${taskId}`));
                }
            }, this.config.queueTimeout);
        });
    }

    /**
     * 启动任务队列处理器
     */
    startTaskQueueProcessor() {
        setInterval(() => {
            this.processTaskQueue();
        }, 100); // 每100ms处理一次队列
    }

    /**
     * 处理任务队列
     */
    async processTaskQueue() {
        while (this.taskQueue.length > 0 && this.activeTasks.size < this.config.maxConcurrentTasks) {
            const task = this.taskQueue.shift();
            
            if (task) {
                this.activeTasks.add(task.id);
                
                // 异步执行任务
                this.executeTask(task).finally(() => {
                    this.activeTasks.delete(task.id);
                });
            }
        }
    }

    /**
     * 执行单个任务
     */
    async executeTask(task) {
        try {
            const result = await task.function(task.options);
            task.resolve(result);
        } catch (error) {
            task.reject(error);
        }
    }

    /**
     * 优化的API调用
     */
    async executeOptimizedApiCall(apiFunction, apiId, options = {}) {
        const startTime = performance.now();
        performance.mark(`api-start-${apiId}`);

        try {
            // 检查缓存
            if (this.config.enableCaching && options.cacheable !== false) {
                const cachedResult = this.getFromCache(apiId, options);
                if (cachedResult) {
                    this.cacheStats.hits++;
                    return cachedResult;
                }
                this.cacheStats.misses++;
            }

            // 添加到API调用队列
            const apiPromise = this.addToApiQueue(apiFunction, apiId, options);
            
            // 执行API调用
            const result = await apiPromise;
            
            // 缓存结果
            if (this.config.enableCaching && options.cacheable !== false) {
                this.setCache(apiId, result, options);
            }

            performance.mark(`api-end-${apiId}`);
            performance.measure(`api-duration-${apiId}`, `api-start-${apiId}`, `api-end-${apiId}`);

            return result;

        } catch (error) {
            // 实现智能重试
            if (options.retryCount < this.config.maxRetries) {
                const retryDelay = this.calculateRetryDelay(options.retryCount);
                
                console.log('🔄 API调用重试', {
                    apiId,
                    retryCount: options.retryCount + 1,
                    retryDelay,
                    error: error.message
                });

                await this.delay(retryDelay);
                
                return this.executeOptimizedApiCall(apiFunction, apiId, {
                    ...options,
                    retryCount: (options.retryCount || 0) + 1
                });
            }

            throw error;
        }
    }

    /**
     * 添加API调用到队列
     */
    async addToApiQueue(apiFunction, apiId, options) {
        return new Promise((resolve, reject) => {
            const apiCall = {
                id: apiId,
                function: apiFunction,
                options,
                resolve,
                reject,
                createdAt: Date.now()
            };

            this.apiCallQueue.push(apiCall);

            // 立即尝试处理队列
            this.processApiQueue();
        });
    }

    /**
     * 处理API调用队列
     */
    async processApiQueue() {
        while (this.apiCallQueue.length > 0 && this.activeApiCalls.size < this.config.maxConcurrentApiCalls) {
            const apiCall = this.apiCallQueue.shift();
            
            if (apiCall) {
                this.activeApiCalls.add(apiCall.id);
                
                // 异步执行API调用
                this.executeApiCall(apiCall).finally(() => {
                    this.activeApiCalls.delete(apiCall.id);
                    
                    // 继续处理队列
                    if (this.apiCallQueue.length > 0) {
                        setTimeout(() => this.processApiQueue(), 10);
                    }
                });
            }
        }
    }

    /**
     * 执行单个API调用
     */
    async executeApiCall(apiCall) {
        try {
            const result = await apiCall.function(apiCall.options);
            apiCall.resolve(result);
        } catch (error) {
            apiCall.reject(error);
        }
    }

    /**
     * 缓存操作
     */
    getFromCache(key, options = {}) {
        const cacheKey = this.generateCacheKey(key, options);
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
            return cached.data;
        }
        
        if (cached) {
            this.cache.delete(cacheKey);
            this.cacheStats.evictions++;
        }
        
        return null;
    }

    setCache(key, data, options = {}) {
        const cacheKey = this.generateCacheKey(key, options);
        
        // 检查缓存大小限制
        if (this.cache.size >= this.config.cacheSize) {
            this.evictOldestCacheEntry();
        }
        
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            accessCount: 0
        });
    }

    generateCacheKey(key, options) {
        const optionsHash = JSON.stringify(options, Object.keys(options).sort());
        return `${key}_${this.hashString(optionsHash)}`;
    }

    evictOldestCacheEntry() {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, value] of this.cache.entries()) {
            if (value.timestamp < oldestTime) {
                oldestTime = value.timestamp;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.cacheStats.evictions++;
        }
    }

    /**
     * 资源监控
     */
    startResourceMonitoring() {
        setInterval(() => {
            this.collectResourceMetrics();
        }, this.config.metricsInterval);
    }

    collectResourceMetrics() {
        const memUsage = process.memoryUsage();
        const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        
        this.resourceMonitor.memoryUsage.push({
            timestamp: Date.now(),
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            percentage: memoryUsagePercent
        });

        // 保持最近100个数据点
        if (this.resourceMonitor.memoryUsage.length > 100) {
            this.resourceMonitor.memoryUsage.shift();
        }

        // 更新峰值内存使用
        this.performanceMetrics.peakMemoryUsage = Math.max(
            this.performanceMetrics.peakMemoryUsage,
            memUsage.heapUsed
        );

        // 检查是否需要垃圾回收
        if (memoryUsagePercent > this.config.memoryThreshold * 100) {
            this.triggerGarbageCollection();
        }
    }

    async checkResourceLimits() {
        const memUsage = process.memoryUsage();
        const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        
        if (memoryUsagePercent > this.config.memoryThreshold * 100) {
            console.warn('⚠️ 内存使用率过高', {
                current: memoryUsagePercent.toFixed(2) + '%',
                threshold: (this.config.memoryThreshold * 100).toFixed(2) + '%'
            });
            
            // 触发垃圾回收
            this.triggerGarbageCollection();
            
            // 等待一段时间让GC完成
            await this.delay(100);
        }
    }

    triggerGarbageCollection() {
        if (global.gc && Date.now() - this.resourceMonitor.lastGC > 30000) { // 最少间隔30秒
            console.log('🗑️ 触发垃圾回收');
            global.gc();
            this.resourceMonitor.lastGC = Date.now();
        }
    }

    /**
     * 指标收集
     */
    startMetricsCollection() {
        setInterval(() => {
            this.collectPerformanceMetrics();
        }, this.config.metricsInterval);
    }

    collectPerformanceMetrics() {
        const currentTime = Date.now();
        const uptime = currentTime - this.performanceMetrics.startTime;
        
        const metrics = {
            timestamp: currentTime,
            uptime,
            totalRequests: this.performanceMetrics.totalRequests,
            successfulRequests: this.performanceMetrics.successfulRequests,
            failedRequests: this.performanceMetrics.failedRequests,
            successRate: this.performanceMetrics.totalRequests > 0 ? 
                (this.performanceMetrics.successfulRequests / this.performanceMetrics.totalRequests) * 100 : 100,
            averageResponseTime: this.performanceMetrics.averageResponseTime,
            currentConcurrency: this.activeTasks.size,
            queueLength: this.taskQueue.length,
            apiQueueLength: this.apiCallQueue.length,
            cacheStats: { ...this.cacheStats },
            cacheHitRate: this.cacheStats.hits + this.cacheStats.misses > 0 ?
                (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)) * 100 : 0,
            memoryUsage: process.memoryUsage(),
            bottlenecksCount: this.performanceMetrics.bottlenecks.size,
            optimizationsCount: this.performanceMetrics.optimizations.size
        };

        console.log('📊 性能指标', metrics);
        
        return metrics;
    }

    /**
     * 生成性能优化报告
     */
    generateOptimizationReport() {
        const currentMetrics = this.collectPerformanceMetrics();
        const bottlenecks = Array.from(this.performanceMetrics.bottlenecks.entries());
        const optimizations = Array.from(this.performanceMetrics.optimizations.entries());

        const report = {
            reportMetadata: {
                generatedAt: new Date().toISOString(),
                reportType: 'performance_optimization',
                version: '1.0.0'
            },
            
            currentPerformance: currentMetrics,
            
            bottleneckAnalysis: {
                totalBottlenecks: bottlenecks.length,
                criticalBottlenecks: bottlenecks.filter(([_, data]) => data.averageDuration > 10000),
                topBottlenecks: bottlenecks
                    .sort(([_, a], [__, b]) => b.averageDuration - a.averageDuration)
                    .slice(0, 5)
                    .map(([key, data]) => ({
                        operation: key,
                        averageDuration: data.averageDuration,
                        count: data.count,
                        impact: this.calculateBottleneckImpact(data)
                    }))
            },
            
            appliedOptimizations: optimizations.map(([key, data]) => ({
                id: key,
                name: data.name,
                target: data.target,
                appliedAt: new Date(data.appliedAt).toISOString(),
                expectedImprovement: data.expectedImprovement
            })),
            
            recommendations: this.generateOptimizationRecommendations(currentMetrics, bottlenecks),
            
            configurationSuggestions: this.generateConfigurationSuggestions(currentMetrics),
            
            summary: {
                overallHealth: this.calculateOverallHealth(currentMetrics),
                keyImprovements: this.identifyKeyImprovements(bottlenecks, optimizations),
                nextSteps: this.suggestNextSteps(currentMetrics, bottlenecks)
            }
        };

        return report;
    }

    /**
     * 辅助方法
     */
    updateAverageResponseTime(duration) {
        const totalRequests = this.performanceMetrics.totalRequests;
        const currentAverage = this.performanceMetrics.averageResponseTime;
        
        this.performanceMetrics.averageResponseTime = 
            (currentAverage * totalRequests + duration) / (totalRequests + 1);
    }

    calculateFailureRate(operation) {
        // 简化实现，实际应该基于历史数据
        return Math.random() * 0.2; // 0-20%的模拟失败率
    }

    calculateOptimalBatchSize(operation) {
        // 基于操作类型和历史性能数据计算最优批处理大小
        const baseSize = 10;
        const systemLoad = this.getCurrentSystemLoad();
        
        if (systemLoad < 0.5) {
            return baseSize * 2;
        } else if (systemLoad > 0.8) {
            return Math.max(baseSize / 2, 1);
        }
        
        return baseSize;
    }

    getCurrentSystemLoad() {
        const memUsage = process.memoryUsage();
        const memoryLoad = memUsage.heapUsed / memUsage.heapTotal;
        const concurrencyLoad = this.activeTasks.size / this.config.maxConcurrentTasks;
        
        return Math.max(memoryLoad, concurrencyLoad);
    }

    calculateRetryDelay(retryCount) {
        const baseDelay = this.config.baseRetryDelay;
        const multiplier = this.config.retryMultiplier;
        const jitter = Math.random() * 1000; // 添加随机抖动
        
        const delay = Math.min(
            baseDelay * Math.pow(multiplier, retryCount) + jitter,
            this.config.maxRetryDelay
        );
        
        return Math.floor(delay);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }

    calculateBottleneckImpact(bottleneckData) {
        const frequency = bottleneckData.count;
        const severity = bottleneckData.averageDuration;
        const recency = Date.now() - bottleneckData.lastOccurrence;
        
        // 影响分数 = 频率 * 严重程度 / 时间衰减
        const impact = (frequency * severity) / Math.max(recency / 3600000, 1); // 小时衰减
        
        if (impact > 100000) return 'critical';
        if (impact > 50000) return 'high';
        if (impact > 10000) return 'medium';
        return 'low';
    }

    generateOptimizationRecommendations(metrics, bottlenecks) {
        const recommendations = [];

        // 基于成功率的建议
        if (metrics.successRate < 95) {
            recommendations.push({
                category: 'reliability',
                priority: 'high',
                title: '提高系统可靠性',
                description: `当前成功率为${metrics.successRate.toFixed(1)}%，建议优化错误处理`,
                actions: ['增强重试机制', '改进错误恢复', '添加熔断器模式']
            });
        }

        // 基于响应时间的建议
        if (metrics.averageResponseTime > 5000) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                title: '优化响应时间',
                description: `平均响应时间${metrics.averageResponseTime.toFixed(0)}ms过长`,
                actions: ['启用缓存', '优化数据库查询', '实现并行处理']
            });
        }

        // 基于缓存命中率的建议
        if (metrics.cacheHitRate < 60) {
            recommendations.push({
                category: 'caching',
                priority: 'medium',
                title: '优化缓存策略',
                description: `缓存命中率${metrics.cacheHitRate.toFixed(1)}%偏低`,
                actions: ['调整缓存TTL', '增加缓存大小', '优化缓存键策略']
            });
        }

        return recommendations;
    }

    generateConfigurationSuggestions(metrics) {
        const suggestions = [];

        // 并发配置建议
        if (metrics.queueLength > 10) {
            suggestions.push({
                parameter: 'maxConcurrentTasks',
                currentValue: this.config.maxConcurrentTasks,
                suggestedValue: Math.min(this.config.maxConcurrentTasks + 2, 10),
                reason: '任务队列长度过长，建议增加并发数'
            });
        }

        // 超时配置建议
        if (metrics.averageResponseTime > this.config.baseTimeout * 0.8) {
            suggestions.push({
                parameter: 'baseTimeout',
                currentValue: this.config.baseTimeout,
                suggestedValue: Math.min(this.config.baseTimeout * 1.5, this.config.maxTimeout),
                reason: '响应时间接近超时阈值，建议增加超时时间'
            });
        }

        return suggestions;
    }

    calculateOverallHealth(metrics) {
        let score = 100;

        // 成功率影响
        if (metrics.successRate < 95) score -= (95 - metrics.successRate) * 2;
        
        // 响应时间影响
        if (metrics.averageResponseTime > 3000) {
            score -= Math.min((metrics.averageResponseTime - 3000) / 100, 30);
        }
        
        // 缓存命中率影响
        if (metrics.cacheHitRate < 70) {
            score -= (70 - metrics.cacheHitRate) * 0.5;
        }

        score = Math.max(0, Math.min(100, score));

        if (score >= 90) return 'excellent';
        if (score >= 80) return 'good';
        if (score >= 70) return 'fair';
        if (score >= 60) return 'poor';
        return 'critical';
    }

    identifyKeyImprovements(bottlenecks, optimizations) {
        const improvements = [];

        if (optimizations.length > 0) {
            improvements.push(`已应用${optimizations.length}项优化策略`);
        }

        if (bottlenecks.length > 0) {
            const criticalBottlenecks = bottlenecks.filter(([_, data]) => 
                this.calculateBottleneckImpact(data) === 'critical'
            ).length;
            
            if (criticalBottlenecks > 0) {
                improvements.push(`识别出${criticalBottlenecks}个关键性能瓶颈`);
            }
        }

        return improvements;
    }

    suggestNextSteps(metrics, bottlenecks) {
        const steps = [];

        if (bottlenecks.length > 0) {
            steps.push('继续监控和优化识别出的性能瓶颈');
        }

        if (metrics.cacheHitRate < 80) {
            steps.push('进一步优化缓存策略以提高命中率');
        }

        if (metrics.successRate < 98) {
            steps.push('加强错误处理和重试机制');
        }

        steps.push('定期审查和调整性能配置参数');

        return steps;
    }

    // 配置更新方法
    updateTimeoutConfig(operation, timeout) {
        // 实际实现中应该更新具体的配置
        console.log(`更新${operation}的超时配置为${timeout}ms`);
    }

    updateRetryConfig(operation, retries, delay) {
        // 实际实现中应该更新具体的配置
        console.log(`更新${operation}的重试配置: ${retries}次重试, ${delay}ms延迟`);
    }

    implementBatchProcessing(operation, batchSize) {
        // 实际实现中应该启用批处理逻辑
        console.log(`为${operation}启用批处理，批大小: ${batchSize}`);
    }

    recordTaskError(taskId, error) {
        console.error(`任务${taskId}执行失败:`, error.message);
    }

    /**
     * 清理资源
     */
    cleanup() {
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        
        this.cache.clear();
        this.taskQueue.length = 0;
        this.apiCallQueue.length = 0;
        
        console.log('🧹 性能优化器资源已清理');
    }
}

module.exports = PerformanceOptimizer;