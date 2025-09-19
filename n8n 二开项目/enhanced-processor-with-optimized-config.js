/**
 * 增强版内容处理器 - 集成优化配置
 * 基于实际使用数据微调阈值并添加更多内容分类
 */

const { EnhancedHuoNiaoContentProcessor } = require('./火鸟门户_内容处理核心模块_增强版.js');
const { 
    optimizedProductionConfig, 
    expandedCategoryMapping, 
    createSmartConfig,
    getDynamicConfig 
} = require('./optimized-processor-config.js');

/**
 * 优化版内容处理器
 * 集成动态配置和扩展分类
 */
class OptimizedContentProcessor extends EnhancedHuoNiaoContentProcessor {
    constructor(config = {}) {
        // 使用优化的默认配置
        const optimizedConfig = {
            ...optimizedProductionConfig,
            ...config
        };
        
        super(optimizedConfig);
        
        // 使用扩展的分类映射
        this.categoryMapping = new Map(expandedCategoryMapping);
        
        // 动态阈值配置
        this.dynamicThresholds = {
            highQuality: {
                categories: ['科技', '人工智能', '商业', '财经', '生物医药'],
                qualityThreshold: 65,
                relevanceThreshold: 0.6
            },
            mediumQuality: {
                categories: ['新闻', '健康', '教育', '汽车', '房地产'],
                qualityThreshold: 55,
                relevanceThreshold: 0.5
            },
            lowQuality: {
                categories: ['娱乐', '体育', '旅游', '文化娱乐', '游戏'],
                qualityThreshold: 45,
                relevanceThreshold: 0.4
            }
        };
        
        this.log('info', '优化版内容处理器初始化完成', {
            totalCategories: this.categoryMapping.size,
            dynamicThresholds: Object.keys(this.dynamicThresholds).length,
            version: '3.1.0'
        });
    }

    /**
     * 动态调整配置基于内容分类
     */
    getDynamicConfigForCategory(category) {
        for (const [level, settings] of Object.entries(this.dynamicThresholds)) {
            if (settings.categories.includes(category)) {
                return {
                    qualityThreshold: settings.qualityThreshold,
                    relevanceThreshold: settings.relevanceThreshold,
                    level
                };
            }
        }
        
        // 默认配置
        return {
            qualityThreshold: this.config.qualityThreshold,
            relevanceThreshold: this.config.relevanceThreshold,
            level: 'default'
        };
    }

    /**
     * 增强版内容处理 - 支持动态阈值
     */
    async processContent(inputData, options = {}) {
        const startTime = Date.now();
        
        try {
            this.log('info', '开始优化版内容处理', { 
                title: inputData.title?.substring(0, 50) + '...',
                options 
            });

            // 1. 基础数据验证和标准化
            const validationResult = await this.validateAndStandardizeData(inputData);
            if (!validationResult.isValid) {
                throw new Error(`数据验证失败: ${validationResult.errors.join(', ')}`);
            }

            const standardizedData = validationResult.data;

            // 2. 预分类以确定动态阈值
            const preliminaryCategory = this.intelligentCategorization(standardizedData);
            const dynamicConfig = this.getDynamicConfigForCategory(preliminaryCategory.category);
            
            this.log('info', '应用动态配置', {
                category: preliminaryCategory.category,
                level: dynamicConfig.level,
                qualityThreshold: dynamicConfig.qualityThreshold,
                relevanceThreshold: dynamicConfig.relevanceThreshold
            });

            // 3. 重复内容检测
            const dedupeResult = await this.enhancedDuplicateDetection(standardizedData);
            if (dedupeResult.isDuplicate) {
                this.stats.duplicates++;
                return {
                    success: false,
                    isDuplicate: true,
                    message: '检测到重复内容',
                    duplicateInfo: dedupeResult,
                    processingTime: Date.now() - startTime
                };
            }

            // 4. AI内容质量评估和相关性判断
            const qualityAssessment = await this.aiQualityAndRelevanceAssessment(standardizedData, options);
            
            // 5. 使用动态阈值进行质量过滤
            if (qualityAssessment.qualityScore < dynamicConfig.qualityThreshold) {
                this.stats.rejected++;
                return {
                    success: false,
                    isRejected: true,
                    reason: 'quality_too_low',
                    message: `内容质量不达标 (${qualityAssessment.qualityScore}/${dynamicConfig.qualityThreshold})`,
                    qualityAssessment,
                    dynamicConfig,
                    processingTime: Date.now() - startTime
                };
            }

            // 6. 使用动态阈值进行相关性过滤
            if (qualityAssessment.relevanceScore < dynamicConfig.relevanceThreshold) {
                this.stats.rejected++;
                return {
                    success: false,
                    isRejected: true,
                    reason: 'relevance_too_low',
                    message: `内容相关性不足 (${qualityAssessment.relevanceScore}/${dynamicConfig.relevanceThreshold})`,
                    qualityAssessment,
                    dynamicConfig,
                    processingTime: Date.now() - startTime
                };
            }

            // 7. 敏感内容检测和处理
            const sensitiveResult = await this.enhancedSensitiveContentDetection(standardizedData);
            if (sensitiveResult.hasSensitive && options.strictMode) {
                this.stats.rejected++;
                return {
                    success: false,
                    isRejected: true,
                    reason: 'sensitive_content',
                    message: `检测到敏感内容: ${sensitiveResult.words.join(', ')}`,
                    sensitiveResult,
                    processingTime: Date.now() - startTime
                };
            }

            // 8. AI内容优化和增强
            let optimizedData = standardizedData;
            if (options.enableAI !== false) {
                optimizedData = await this.enhancedAIOptimization(standardizedData, qualityAssessment, options);
            }

            // 9. 最终分类确认
            const categoryResult = await this.enhancedCategorization(optimizedData);
            optimizedData.category = categoryResult.category;
            optimizedData.categoryId = categoryResult.id;
            optimizedData.categoryConfidence = categoryResult.confidence;

            // 10. Notion数据格式适配
            const notionFormattedData = this.formatForNotion(optimizedData, qualityAssessment, categoryResult);

            // 11. 生成最终处理结果
            const finalResult = {
                success: true,
                data: notionFormattedData,
                metadata: {
                    qualityScore: qualityAssessment.qualityScore,
                    relevanceScore: qualityAssessment.relevanceScore,
                    categoryConfidence: categoryResult.confidence,
                    processingTime: Date.now() - startTime,
                    processedAt: new Date().toISOString(),
                    hasSensitiveContent: sensitiveResult.hasSensitive,
                    optimizedByAI: options.enableAI !== false,
                    processorVersion: '3.1.0',
                    dynamicConfig: dynamicConfig
                },
                qualityAssessment,
                categoryResult,
                dynamicConfig,
                sensitiveResult: sensitiveResult.hasSensitive ? sensitiveResult : undefined
            };

            this.stats.processed++;
            this.stats.accepted++;
            
            // 缓存处理结果
            if (this.config.enableCache) {
                this.cacheProcessingResult(standardizedData, finalResult);
            }

            this.log('info', '优化版内容处理完成', {
                title: finalResult.data.标题,
                qualityScore: qualityAssessment.qualityScore,
                relevanceScore: qualityAssessment.relevanceScore,
                category: categoryResult.category,
                dynamicLevel: dynamicConfig.level,
                processingTime: finalResult.metadata.processingTime
            });

            return finalResult;

        } catch (error) {
            this.stats.errors++;
            this.log('error', '优化版内容处理失败', { 
                error: error.message, 
                title: inputData.title,
                processingTime: Date.now() - startTime
            });
            throw error;
        }
    }

    /**
     * 获取分类统计信息
     */
    getCategoryStats() {
        const categoryStats = new Map();
        
        // 统计各分类的处理情况
        for (const [categoryName, categoryInfo] of this.categoryMapping.entries()) {
            categoryStats.set(categoryName, {
                id: categoryInfo.id,
                keywordCount: categoryInfo.keywords.length,
                processed: 0,
                accepted: 0,
                rejected: 0
            });
        }
        
        return Object.fromEntries(categoryStats);
    }

    /**
     * 获取动态阈值使用统计
     */
    getDynamicThresholdStats() {
        return {
            thresholdLevels: this.dynamicThresholds,
            totalCategories: this.categoryMapping.size,
            highQualityCategories: this.dynamicThresholds.highQuality.categories.length,
            mediumQualityCategories: this.dynamicThresholds.mediumQuality.categories.length,
            lowQualityCategories: this.dynamicThresholds.lowQuality.categories.length
        };
    }

    /**
     * 批量处理 - 优化版
     */
    async batchProcessContent(contentList, options = {}) {
        const results = [];
        const batchSize = options.batchSize || this.config.batchSize || 8;
        const delayBetweenBatches = options.delayBetweenBatches || this.config.delayBetweenBatches || 800;

        this.log('info', '开始优化版批量内容处理', {
            totalCount: contentList.length,
            batchSize,
            options
        });

        // 重置统计
        this.stats = {
            processed: 0,
            accepted: 0,
            rejected: 0,
            duplicates: 0,
            errors: 0
        };

        // 分类统计
        const categoryStats = new Map();

        for (let i = 0; i < contentList.length; i += batchSize) {
            const batch = contentList.slice(i, i + batchSize);
            const batchResults = [];

            // 并行处理当前批次
            const promises = batch.map(async (content, index) => {
                try {
                    // 批次内延迟
                    if (index > 0) {
                        await this.delay(200);
                    }
                    
                    const result = await this.processContent(content, options);
                    
                    // 统计分类信息
                    if (result.success && result.categoryResult) {
                        const category = result.categoryResult.category;
                        if (!categoryStats.has(category)) {
                            categoryStats.set(category, { count: 0, avgQuality: 0, avgRelevance: 0 });
                        }
                        const stats = categoryStats.get(category);
                        stats.count++;
                        stats.avgQuality = (stats.avgQuality * (stats.count - 1) + result.qualityAssessment.qualityScore) / stats.count;
                        stats.avgRelevance = (stats.avgRelevance * (stats.count - 1) + result.qualityAssessment.relevanceScore) / stats.count;
                    }
                    
                    return result;
                } catch (error) {
                    this.stats.errors++;
                    return {
                        success: false,
                        error: error.message,
                        originalData: content
                    };
                }
            });

            const batchResult = await Promise.all(promises);
            batchResults.push(...batchResult);
            results.push(...batchResult);

            // 更新统计
            batchResult.forEach(result => {
                if (result.success) {
                    this.stats.accepted++;
                } else if (result.isDuplicate) {
                    this.stats.duplicates++;
                } else if (result.isRejected) {
                    this.stats.rejected++;
                }
                this.stats.processed++;
            });

            // 批次间延迟
            if (i + batchSize < contentList.length) {
                await this.delay(delayBetweenBatches);
            }

            this.log('info', `批次处理完成 ${Math.ceil((i + batchSize) / batchSize)}/${Math.ceil(contentList.length / batchSize)}`, {
                batchSize: batch.length,
                successCount: batchResult.filter(r => r.success).length,
                duplicateCount: batchResult.filter(r => r.isDuplicate).length,
                rejectedCount: batchResult.filter(r => r.isRejected).length,
                errorCount: batchResult.filter(r => !r.success && !r.isDuplicate && !r.isRejected).length
            });
        }

        const summary = {
            total: contentList.length,
            processed: this.stats.processed,
            accepted: this.stats.accepted,
            rejected: this.stats.rejected,
            duplicates: this.stats.duplicates,
            errors: this.stats.errors,
            successRate: this.stats.processed > 0 ? (this.stats.accepted / this.stats.processed * 100).toFixed(2) + '%' : '0%',
            categoryStats: Object.fromEntries(categoryStats)
        };

        this.log('info', '优化版批量处理完成', summary);

        return {
            success: true,
            summary,
            results,
            stats: this.stats,
            categoryBreakdown: Object.fromEntries(categoryStats)
        };
    }
}

/**
 * 工厂函数 - 创建优化版处理器
 */
function createOptimizedProcessor(options = {}) {
    const {
        environment = 'production',
        category = null,
        strictMode = false,
        performanceMode = false,
        customConfig = {}
    } = options;
    
    const config = createSmartConfig({
        environment,
        category,
        strictMode,
        performanceMode
    });
    
    return new OptimizedContentProcessor({
        ...config,
        ...customConfig
    });
}

/**
 * 使用示例
 */
const examples = {
    // 科技内容处理器
    techProcessor: () => createOptimizedProcessor({
        category: '科技',
        environment: 'production'
    }),
    
    // 娱乐内容处理器（宽松模式）
    entertainmentProcessor: () => createOptimizedProcessor({
        category: '娱乐',
        environment: 'production'
    }),
    
    // 高性能批量处理器
    batchProcessor: () => createOptimizedProcessor({
        performanceMode: true,
        environment: 'production'
    }),
    
    // 严格质量控制处理器
    strictProcessor: () => createOptimizedProcessor({
        strictMode: true,
        environment: 'production'
    })
};

module.exports = {
    OptimizedContentProcessor,
    createOptimizedProcessor,
    examples
};