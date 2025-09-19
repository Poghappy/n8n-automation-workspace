/**
 * 火鸟门户内容处理核心模块 - 增强版 v3.0
 * 基于任务4需求的智能内容处理优化
 * 
 * 主要增强功能：
 * 1. AI内容质量评估和相关性判断
 * 2. 优化重复内容检测算法
 * 3. 内容格式标准化处理
 * 4. 与Notion存储集成优化
 * 
 * @author AI Assistant
 * @version 3.0.0
 * @date 2025-01-22
 */

const crypto = require('crypto');
const axios = require('axios');

/**
 * 增强版火鸟门户内容处理器
 * 专为自动化新闻工作流优化
 */
class EnhancedHuoNiaoContentProcessor {
    constructor(config = {}) {
        // 基础配置
        this.config = {
            // AI服务配置
            aiApiKey: config.aiApiKey || process.env.OPENAI_API_KEY,
            aiBaseUrl: config.aiBaseUrl || 'https://api.openai.com/v1',
            aiModel: config.aiModel || 'gpt-4',
            
            // 内容质量配置
            minContentLength: config.minContentLength || 100,
            maxContentLength: config.maxContentLength || 5000,
            minTitleLength: config.minTitleLength || 5,
            maxTitleLength: config.maxTitleLength || 60,
            
            // 质量评估阈值
            qualityThreshold: config.qualityThreshold || 70,
            relevanceThreshold: config.relevanceThreshold || 0.7,
            
            // 相似度检测配置
            titleSimilarityThreshold: config.titleSimilarityThreshold || 0.8,
            contentSimilarityThreshold: config.contentSimilarityThreshold || 0.85,
            semanticSimilarityThreshold: config.semanticSimilarityThreshold || 0.75,
            
            // 内容标准化配置
            enableContentStandardization: config.enableContentStandardization !== false,
            enableSemanticAnalysis: config.enableSemanticAnalysis !== false,
            
            // 缓存和性能配置
            enableCache: config.enableCache !== false,
            cacheExpiry: config.cacheExpiry || 3600000, // 1小时
            enableLogging: config.enableLogging !== false,
            
            // Notion集成配置
            notionIntegration: config.notionIntegration || {},
            
            ...config
        };

        // 内部状态
        this.contentCache = new Map();
        this.similarityCache = new Map();
        this.semanticCache = new Map();
        this.qualityCache = new Map();
        this.categoryCache = new Map();
        
        // 敏感词和分类映射
        this.sensitiveWords = new Set();
        this.categoryMapping = new Map();
        this.contentPatterns = new Map();
        
        // 统计信息
        this.stats = {
            processed: 0,
            accepted: 0,
            rejected: 0,
            duplicates: 0,
            errors: 0
        };
        
        // 初始化
        this.initializeEnhancedFeatures();
        this.startCleanupTimer();
    }

    /**
     * 初始化增强功能
     */
    initializeEnhancedFeatures() {
        this.initializeSensitiveWords();
        this.initializeCategoryMapping();
        this.initializeContentPatterns();
        this.initializeQualityMetrics();
        this.initializePerformanceOptimizations();
        
        this.log('info', '增强版内容处理器初始化完成', {
            features: [
                'AI质量评估',
                '语义相似度检测',
                '内容标准化',
                'Notion集成优化',
                '性能优化'
            ]
        });
    }

    /**
     * 初始化性能优化功能
     */
    initializePerformanceOptimizations() {
        // 批处理队列
        this.batchQueue = [];
        this.batchTimer = null;
        this.batchSize = this.config.batchSize || 5;
        this.batchTimeout = this.config.batchTimeout || 1000; // 1秒

        // 并发控制
        this.activeTasks = new Set();
        this.maxConcurrentTasks = this.config.maxConcurrentTasks || 3;

        // 性能监控
        this.performanceMetrics = {
            totalProcessingTime: 0,
            averageProcessingTime: 0,
            processedCount: 0,
            cacheHitRate: 0,
            concurrencyUtilization: 0
        };

        this.log('info', '性能优化功能已启用', {
            batchSize: this.batchSize,
            maxConcurrentTasks: this.maxConcurrentTasks,
            cacheEnabled: this.config.enableCache
        });
    }

    /**
     * 检查处理缓存
     */
    async checkProcessingCache(inputData) {
        if (!this.config.enableCache) {
            return null;
        }

        try {
            const cacheKey = this.generateProcessingCacheKey(inputData);
            const cached = this.contentCache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < this.config.cacheExpiry) {
                this.log('debug', '缓存命中', { cacheKey });
                return cached.result;
            }

            if (cached) {
                this.contentCache.delete(cacheKey);
            }

            return null;

        } catch (error) {
            this.log('error', '缓存检查失败', { error: error.message });
            return null;
        }
    }

    /**
     * 生成处理缓存键
     */
    generateProcessingCacheKey(inputData) {
        const keyData = {
            title: inputData.title || '',
            content: (inputData.content || '').substring(0, 200), // 前200字符
            source: inputData.source || ''
        };

        const keyString = JSON.stringify(keyData);
        return this.generateHash(keyString);
    }

    /**
     * 缓存处理结果
     */
    cacheProcessingResult(inputData, result) {
        if (!this.config.enableCache) {
            return;
        }

        try {
            const cacheKey = this.generateProcessingCacheKey(inputData);
            this.contentCache.set(cacheKey, {
                result,
                timestamp: Date.now()
            });

            // 清理过期缓存
            this.cleanupExpiredCache();

        } catch (error) {
            this.log('error', '缓存存储失败', { error: error.message });
        }
    }

    /**
     * 清理过期缓存
     */
    cleanupExpiredCache() {
        const now = Date.now();
        const expiredKeys = [];

        for (const [key, cached] of this.contentCache.entries()) {
            if (now - cached.timestamp > this.config.cacheExpiry) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.contentCache.delete(key));

        if (expiredKeys.length > 0) {
            this.log('debug', '清理过期缓存', { cleanedCount: expiredKeys.length });
        }
    }

    /**
     * 生成哈希值
     */
    generateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }

    /**
     * 初始化内容模式识别
     */
    initializeContentPatterns() {
        // 新闻内容模式
        this.contentPatterns.set('news', {
            titlePatterns: [
                /^【.*】/, // 标签格式
                /.*：.*/, // 冒号格式
                /.*发布.*/, // 发布类
                /.*宣布.*/, // 宣布类
            ],
            contentPatterns: [
                /据.*报道/, // 新闻引用
                /.*表示/, // 发言类
                /.*消息/, // 消息类
            ],
            qualityBonus: 10
        });

        // 技术内容模式
        this.contentPatterns.set('tech', {
            titlePatterns: [
                /AI|人工智能|机器学习|深度学习/,
                /技术|科技|创新|数字化/,
                /软件|硬件|芯片|5G|区块链/,
            ],
            contentPatterns: [
                /算法|模型|数据|分析/,
                /开发|编程|代码|系统/,
                /创新|突破|技术|方案/,
            ],
            qualityBonus: 15
        });
    }

    /**
     * 初始化质量评估指标
     */
    initializeQualityMetrics() {
        this.qualityMetrics = {
            // 标题质量指标
            title: {
                lengthOptimal: { min: 10, max: 50, weight: 0.3 },
                hasNumbers: { weight: 0.1 },
                hasKeywords: { weight: 0.2 },
                noSpecialChars: { weight: 0.1 },
                clarity: { weight: 0.3 }
            },
            
            // 内容质量指标
            content: {
                lengthOptimal: { min: 300, max: 2000, weight: 0.25 },
                paragraphStructure: { weight: 0.2 },
                readability: { weight: 0.2 },
                informativeness: { weight: 0.2 },
                coherence: { weight: 0.15 }
            },
            
            // 元数据完整性
            metadata: {
                hasAuthor: { weight: 0.15 },
                hasSource: { weight: 0.2 },
                hasKeywords: { weight: 0.15 },
                hasDescription: { weight: 0.15 },
                hasImage: { weight: 0.1 },
                hasValidUrl: { weight: 0.25 }
            }
        };
    }

    /**
     * 主要内容处理流程 - 增强版 (性能优化)
     */
    async processContent(inputData, options = {}) {
        const startTime = Date.now();
        const processingId = `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            this.log('info', '开始增强版内容处理', { 
                processingId,
                title: inputData.title?.substring(0, 50) + '...',
                options 
            });

            // 性能优化: 并行执行基础验证和缓存检查
            const [validationResult, cacheResult] = await Promise.allSettled([
                this.validateAndStandardizeData(inputData),
                this.checkProcessingCache(inputData)
            ]);

            // 处理验证结果
            if (validationResult.status === 'rejected' || !validationResult.value.isValid) {
                const errors = validationResult.value?.errors || [validationResult.reason];
                throw new Error(`数据验证失败: ${errors.join(', ')}`);
            }

            const standardizedData = validationResult.value.data;

            // 性能优化: 如果缓存命中，直接返回
            if (cacheResult.status === 'fulfilled' && cacheResult.value) {
                this.log('info', '缓存命中，返回缓存结果', { processingId });
                return {
                    ...cacheResult.value,
                    fromCache: true,
                    processingTime: Date.now() - startTime
                };
            }

            // 2. 性能优化: 并行执行重复检测和AI评估
            const [dedupeResult, qualityAssessment] = await Promise.allSettled([
                this.enhancedDuplicateDetection(standardizedData),
                this.aiQualityAndRelevanceAssessment(standardizedData, options)
            ]);

            // 处理重复检测结果
            if (dedupeResult.status === 'fulfilled' && dedupeResult.value.isDuplicate) {
                this.stats.duplicates++;
                return {
                    success: false,
                    isDuplicate: true,
                    message: '检测到重复内容',
                    duplicateInfo: dedupeResult.value,
                    processingTime: Date.now() - startTime
                };
            }

            // 处理质量评估结果
            const qualityResult = qualityAssessment.status === 'fulfilled' ? 
                qualityAssessment.value : 
                { qualityScore: 50, relevanceScore: 0.5 }; // 降级默认值
            
            // 3. 质量过滤 (使用处理后的结果)
            if (qualityResult.qualityScore < this.config.qualityThreshold) {
                this.stats.rejected++;
                return {
                    success: false,
                    isRejected: true,
                    reason: 'quality_too_low',
                    message: `内容质量不达标 (${qualityResult.qualityScore}/${this.config.qualityThreshold})`,
                    qualityAssessment: qualityResult,
                    processingTime: Date.now() - startTime
                };
            }

            // 4. 相关性过滤
            if (qualityResult.relevanceScore < this.config.relevanceThreshold) {
                this.stats.rejected++;
                return {
                    success: false,
                    isRejected: true,
                    reason: 'relevance_too_low',
                    message: `内容相关性不足 (${qualityResult.relevanceScore}/${this.config.relevanceThreshold})`,
                    qualityAssessment: qualityResult,
                    processingTime: Date.now() - startTime
                };
            }

            // 6. 敏感内容检测和处理
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

            // 7. AI内容优化和增强
            let optimizedData = standardizedData;
            if (options.enableAI !== false) {
                optimizedData = await this.enhancedAIOptimization(standardizedData, qualityAssessment, options);
            }

            // 8. 智能分类和标签
            const categoryResult = await this.enhancedCategorization(optimizedData);
            optimizedData.category = categoryResult.category;
            optimizedData.categoryId = categoryResult.id;
            optimizedData.categoryConfidence = categoryResult.confidence;

            // 9. Notion数据格式适配
            const notionFormattedData = this.formatForNotion(optimizedData, qualityAssessment, categoryResult);

            // 10. 生成最终处理结果
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
                    processorVersion: '3.0.0'
                },
                qualityAssessment,
                categoryResult,
                sensitiveResult: sensitiveResult.hasSensitive ? sensitiveResult : undefined
            };

            this.stats.processed++;
            this.stats.accepted++;
            
            // 缓存处理结果
            if (this.config.enableCache) {
                this.cacheProcessingResult(standardizedData, finalResult);
            }

            this.log('info', '内容处理完成', {
                title: finalResult.data.标题,
                qualityScore: qualityAssessment.qualityScore,
                relevanceScore: qualityAssessment.relevanceScore,
                category: categoryResult.category,
                processingTime: finalResult.metadata.processingTime
            });

            return finalResult;

        } catch (error) {
            this.stats.errors++;
            this.log('error', '内容处理失败', { 
                error: error.message, 
                title: inputData.title,
                processingTime: Date.now() - startTime
            });
            throw error;
        }
    }   
 /**
     * 数据验证和标准化 - 增强版
     */
    async validateAndStandardizeData(data) {
        const errors = [];
        let standardizedData = { ...data };

        try {
            // 基础验证
            const basicValidation = this.validateBasicData(data);
            if (!basicValidation.isValid) {
                errors.push(...basicValidation.errors);
            }

            // 内容标准化处理
            if (this.config.enableContentStandardization) {
                standardizedData = await this.standardizeContent(data);
            }

            return {
                isValid: errors.length === 0,
                errors,
                data: standardizedData
            };

        } catch (error) {
            errors.push(`标准化处理失败: ${error.message}`);
            return {
                isValid: false,
                errors,
                data
            };
        }
    }

    /**
     * 内容标准化处理
     */
    async standardizeContent(data) {
        const standardized = { ...data };

        try {
            // 标题标准化
            if (standardized.title) {
                standardized.title = this.standardizeTitle(standardized.title);
            }

            // 内容标准化
            if (standardized.content) {
                standardized.content = this.standardizeText(standardized.content);
            }

            // 摘要标准化
            if (standardized.summary || standardized.description) {
                const summary = standardized.summary || standardized.description;
                standardized.summary = this.standardizeSummary(summary);
            }

            // 关键词标准化
            if (standardized.keywords) {
                standardized.keywords = this.standardizeKeywords(standardized.keywords);
            }

            // 时间标准化
            if (standardized.publish_date || standardized.pubdate) {
                standardized.publish_date = this.standardizeDate(
                    standardized.publish_date || standardized.pubdate
                );
            }

            // URL标准化
            if (standardized.source_url) {
                standardized.source_url = this.standardizeUrl(standardized.source_url);
            }

            if (standardized.image_url) {
                standardized.image_url = this.standardizeUrl(standardized.image_url);
            }

            // 作者和来源标准化
            if (standardized.author) {
                standardized.author = this.standardizeAuthor(standardized.author);
            }

            if (standardized.source) {
                standardized.source = this.standardizeSource(standardized.source);
            }

            return standardized;

        } catch (error) {
            this.log('error', '内容标准化失败', { error: error.message });
            return data; // 返回原始数据
        }
    }

    /**
     * 标题标准化
     */
    standardizeTitle(title) {
        if (!title) return '';

        return title
            .trim()
            .replace(/\s+/g, ' ') // 标准化空格
            .replace(/[""]/g, '"') // 统一引号
            .replace(/['']/g, "'") // 统一单引号
            .replace(/…/g, '...') // 统一省略号
            .replace(/—/g, '-') // 统一破折号
            .substring(0, this.config.maxTitleLength); // 限制长度
    }

    /**
     * 文本标准化
     */
    standardizeText(text) {
        if (!text) return '';

        return text
            .trim()
            .replace(/\r\n/g, '\n') // 统一换行符
            .replace(/\n{3,}/g, '\n\n') // 限制连续换行
            .replace(/\s+/g, ' ') // 标准化空格
            .replace(/[""]/g, '"') // 统一引号
            .replace(/['']/g, "'") // 统一单引号
            .replace(/…/g, '...') // 统一省略号
            .replace(/—/g, '-') // 统一破折号
            .replace(/[\u200B-\u200D\uFEFF]/g, '') // 移除零宽字符
            .substring(0, this.config.maxContentLength); // 限制长度
    }

    /**
     * 摘要标准化
     */
    standardizeSummary(summary) {
        if (!summary) return '';

        const standardized = this.standardizeText(summary);
        
        // 确保摘要长度适中
        if (standardized.length > 255) {
            return standardized.substring(0, 252) + '...';
        }
        
        return standardized;
    }

    /**
     * 关键词标准化
     */
    standardizeKeywords(keywords) {
        if (!keywords) return '';

        let keywordList = [];
        
        if (typeof keywords === 'string') {
            keywordList = keywords.split(/[,，、\s]+/).filter(k => k.trim());
        } else if (Array.isArray(keywords)) {
            keywordList = keywords.filter(k => k && typeof k === 'string');
        }

        // 标准化每个关键词
        const standardizedKeywords = keywordList
            .map(keyword => keyword.trim().toLowerCase())
            .filter(keyword => keyword.length > 0 && keyword.length <= 20)
            .slice(0, 10); // 限制关键词数量

        return standardizedKeywords.join(',');
    }

    /**
     * 日期标准化
     */
    standardizeDate(dateInput) {
        if (!dateInput) return new Date().toISOString();

        try {
            let date;
            
            if (typeof dateInput === 'number') {
                // Unix时间戳
                date = new Date(dateInput * 1000);
            } else if (typeof dateInput === 'string') {
                date = new Date(dateInput);
            } else {
                date = new Date();
            }

            // 验证日期有效性
            if (isNaN(date.getTime())) {
                date = new Date();
            }

            return date.toISOString();

        } catch (error) {
            return new Date().toISOString();
        }
    }

    /**
     * URL标准化
     */
    standardizeUrl(url) {
        if (!url) return '';

        try {
            // 添加协议前缀
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }

            const urlObj = new URL(url);
            return urlObj.toString();

        } catch (error) {
            return url; // 返回原始URL
        }
    }

    /**
     * 作者标准化
     */
    standardizeAuthor(author) {
        if (!author) return 'AI采集';

        return author
            .trim()
            .replace(/\s+/g, ' ')
            .substring(0, 20); // 限制长度
    }

    /**
     * 来源标准化
     */
    standardizeSource(source) {
        if (!source) return 'API采集';

        return source
            .trim()
            .replace(/\s+/g, ' ')
            .substring(0, 30); // 限制长度
    }

    /**
     * 增强版重复内容检测
     */
    async enhancedDuplicateDetection(data) {
        try {
            // 1. 内容哈希检测（精确匹配）
            const contentHash = this.generateEnhancedContentHash(data);
            if (this.config.enableCache && this.similarityCache.has(contentHash)) {
                return {
                    isDuplicate: true,
                    method: 'exact_hash',
                    similarity: 1.0,
                    contentHash
                };
            }

            // 2. 标题相似度检测（改进算法）
            const titleSimilarity = await this.calculateEnhancedTitleSimilarity(data.title);
            if (titleSimilarity.maxSimilarity > this.config.titleSimilarityThreshold) {
                return {
                    isDuplicate: true,
                    method: 'title_similarity',
                    similarity: titleSimilarity.maxSimilarity,
                    similarTitle: titleSimilarity.similarTitle
                };
            }

            // 3. 内容语义相似度检测
            if (this.config.enableSemanticAnalysis) {
                const semanticSimilarity = await this.calculateSemanticSimilarity(data);
                if (semanticSimilarity.maxSimilarity > this.config.semanticSimilarityThreshold) {
                    return {
                        isDuplicate: true,
                        method: 'semantic_similarity',
                        similarity: semanticSimilarity.maxSimilarity,
                        similarContent: semanticSimilarity.similarContent
                    };
                }
            }

            // 4. 内容片段相似度检测
            const fragmentSimilarity = this.calculateContentFragmentSimilarity(data.content);
            if (fragmentSimilarity.maxSimilarity > this.config.contentSimilarityThreshold) {
                return {
                    isDuplicate: true,
                    method: 'fragment_similarity',
                    similarity: fragmentSimilarity.maxSimilarity,
                    similarFragment: fragmentSimilarity.similarFragment
                };
            }

            // 缓存非重复内容
            if (this.config.enableCache) {
                this.similarityCache.set(contentHash, {
                    title: data.title,
                    contentPreview: data.content?.substring(0, 200),
                    timestamp: Date.now()
                });
            }

            return {
                isDuplicate: false,
                contentHash,
                checks: {
                    titleSimilarity: titleSimilarity.maxSimilarity,
                    semanticSimilarity: this.config.enableSemanticAnalysis ? 
                        (await this.calculateSemanticSimilarity(data)).maxSimilarity : 0,
                    fragmentSimilarity: fragmentSimilarity.maxSimilarity
                }
            };

        } catch (error) {
            this.log('error', '重复检测失败', { error: error.message });
            return { isDuplicate: false, error: error.message };
        }
    }

    /**
     * 生成增强版内容哈希
     */
    generateEnhancedContentHash(data) {
        // 使用多个字段生成更准确的哈希
        const hashContent = [
            data.title || '',
            data.content?.substring(0, 500) || '', // 使用内容前500字符
            data.source_url || '',
            data.author || ''
        ].join('|');

        return crypto.createHash('sha256').update(hashContent).digest('hex');
    }

    /**
     * 增强版标题相似度计算
     */
    async calculateEnhancedTitleSimilarity(title) {
        if (!title) return { maxSimilarity: 0, similarTitle: '' };

        const titleWords = this.extractEnhancedKeywords(title);
        let maxSimilarity = 0;
        let similarTitle = '';

        // 与缓存中的标题比较
        for (const [hash, cached] of this.similarityCache.entries()) {
            if (!cached.title) continue;

            const cachedWords = this.extractEnhancedKeywords(cached.title);
            
            // 使用多种相似度算法
            const jaccardSim = this.calculateJaccardSimilarity(titleWords, cachedWords);
            const cosineSim = this.calculateCosineSimilarity(titleWords, cachedWords);
            const editDistanceSim = this.calculateEditDistanceSimilarity(title, cached.title);
            
            // 综合相似度评分
            const combinedSimilarity = (jaccardSim * 0.4 + cosineSim * 0.4 + editDistanceSim * 0.2);
            
            if (combinedSimilarity > maxSimilarity) {
                maxSimilarity = combinedSimilarity;
                similarTitle = cached.title;
            }
        }

        return { maxSimilarity, similarTitle };
    }

    /**
     * 增强版关键词提取
     */
    extractEnhancedKeywords(text) {
        if (!text) return new Set();

        // 移除停用词
        const stopWords = new Set([
            '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
            '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
            'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had'
        ]);

        const words = text.toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fff]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1 && !stopWords.has(word));

        return new Set(words);
    }

    /**
     * 余弦相似度计算
     */
    calculateCosineSimilarity(set1, set2) {
        const words1 = Array.from(set1);
        const words2 = Array.from(set2);
        const allWords = new Set([...words1, ...words2]);

        if (allWords.size === 0) return 0;

        // 创建词频向量
        const vector1 = Array.from(allWords).map(word => words1.includes(word) ? 1 : 0);
        const vector2 = Array.from(allWords).map(word => words2.includes(word) ? 1 : 0);

        // 计算点积
        const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
        
        // 计算向量长度
        const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

        if (magnitude1 === 0 || magnitude2 === 0) return 0;

        return dotProduct / (magnitude1 * magnitude2);
    }

    /**
     * 编辑距离相似度计算
     */
    calculateEditDistanceSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;

        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0) return 1;

        const editDistance = this.calculateEditDistance(str1, str2);
        return 1 - (editDistance / maxLength);
    }

    /**
     * 计算编辑距离
     */
    calculateEditDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * 内容片段相似度检测
     */
    calculateContentFragmentSimilarity(content) {
        if (!content) return { maxSimilarity: 0, similarFragment: '' };

        // 将内容分割成片段
        const fragments = this.splitIntoFragments(content);
        let maxSimilarity = 0;
        let similarFragment = '';

        // 与缓存中的内容片段比较
        for (const [hash, cached] of this.similarityCache.entries()) {
            if (!cached.contentPreview) continue;

            const cachedFragments = this.splitIntoFragments(cached.contentPreview);
            
            for (const fragment of fragments) {
                for (const cachedFragment of cachedFragments) {
                    const similarity = this.calculateFragmentSimilarity(fragment, cachedFragment);
                    if (similarity > maxSimilarity) {
                        maxSimilarity = similarity;
                        similarFragment = cachedFragment;
                    }
                }
            }
        }

        return { maxSimilarity, similarFragment };
    }

    /**
     * 将内容分割成片段
     */
    splitIntoFragments(content, fragmentSize = 100) {
        if (!content) return [];

        const fragments = [];
        for (let i = 0; i < content.length; i += fragmentSize) {
            fragments.push(content.substring(i, i + fragmentSize));
        }

        return fragments;
    }

    /**
     * 片段相似度计算
     */
    calculateFragmentSimilarity(fragment1, fragment2) {
        const words1 = this.extractEnhancedKeywords(fragment1);
        const words2 = this.extractEnhancedKeywords(fragment2);
        
        return this.calculateJaccardSimilarity(words1, words2);
    }   
 /**
     * AI内容质量评估和相关性判断
     */
    async aiQualityAndRelevanceAssessment(data, options = {}) {
        try {
            // 基础质量评分
            const baseQualityScore = this.calculateEnhancedContentQuality(data);
            
            // AI增强评估
            let aiAssessment = null;
            if (this.config.aiApiKey && options.enableAI !== false) {
                aiAssessment = await this.performAIQualityAssessment(data);
            }

            // 相关性评估
            const relevanceScore = await this.assessContentRelevance(data);

            // 综合评分
            const finalQualityScore = this.calculateFinalQualityScore(
                baseQualityScore, 
                aiAssessment, 
                relevanceScore
            );

            return {
                qualityScore: finalQualityScore,
                relevanceScore,
                baseQualityScore,
                aiAssessment,
                assessmentDetails: {
                    titleQuality: this.assessTitleQuality(data.title),
                    contentQuality: this.assessContentQuality(data.content),
                    metadataCompleteness: this.assessMetadataCompleteness(data),
                    structuralQuality: this.assessStructuralQuality(data.content)
                }
            };

        } catch (error) {
            this.log('error', 'AI质量评估失败', { error: error.message });
            
            // 降级到基础评估
            const baseQualityScore = this.calculateEnhancedContentQuality(data);
            const relevanceScore = 0.5; // 默认中等相关性
            
            return {
                qualityScore: baseQualityScore,
                relevanceScore,
                baseQualityScore,
                aiAssessment: null,
                error: error.message
            };
        }
    }

    /**
     * 执行AI质量评估
     */
    async performAIQualityAssessment(data) {
        const prompt = `请作为专业的新闻内容质量评估专家，对以下内容进行全面评估：

标题：${data.title}
内容：${data.content?.substring(0, 1000)}${data.content?.length > 1000 ? '...' : ''}
来源：${data.source || '未知'}
作者：${data.author || '未知'}

请从以下维度进行评估（每项0-100分）：

1. 内容质量：信息准确性、完整性、深度
2. 新闻价值：时效性、重要性、影响力
3. 可读性：语言表达、结构清晰度、逻辑性
4. 相关性：与目标受众的相关程度
5. 原创性：内容的独特性和新颖性

请以JSON格式返回评估结果：
{
  "contentQuality": 分数,
  "newsValue": 分数,
  "readability": 分数,
  "relevance": 分数,
  "originality": 分数,
  "overallScore": 综合分数,
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["不足1", "不足2"],
  "suggestions": ["建议1", "建议2"],
  "category": "推荐分类",
  "tags": ["标签1", "标签2"]
}`;

        try {
            const response = await this.callAI(prompt, { 
                maxTokens: 800,
                temperature: 0.3 
            });

            // 尝试解析JSON响应
            const assessment = JSON.parse(response);
            
            // 验证响应格式
            if (this.validateAIAssessmentResponse(assessment)) {
                return assessment;
            } else {
                throw new Error('AI响应格式无效');
            }

        } catch (error) {
            this.log('error', 'AI评估解析失败', { error: error.message });
            return null;
        }
    }

    /**
     * 验证AI评估响应格式
     */
    validateAIAssessmentResponse(assessment) {
        const requiredFields = [
            'contentQuality', 'newsValue', 'readability', 
            'relevance', 'originality', 'overallScore'
        ];

        return requiredFields.every(field => 
            typeof assessment[field] === 'number' && 
            assessment[field] >= 0 && 
            assessment[field] <= 100
        );
    }

    /**
     * 内容相关性评估
     */
    async assessContentRelevance(data) {
        try {
            // 基于关键词的相关性评估
            const keywordRelevance = this.assessKeywordRelevance(data);
            
            // 基于分类的相关性评估
            const categoryRelevance = this.assessCategoryRelevance(data);
            
            // 基于来源的相关性评估
            const sourceRelevance = this.assessSourceRelevance(data);

            // AI语义相关性评估
            let semanticRelevance = 0.5;
            if (this.config.aiApiKey && this.config.enableSemanticAnalysis) {
                semanticRelevance = await this.assessSemanticRelevance(data);
            }

            // 综合相关性评分
            const relevanceScore = (
                keywordRelevance * 0.3 +
                categoryRelevance * 0.2 +
                sourceRelevance * 0.2 +
                semanticRelevance * 0.3
            );

            return Math.min(1.0, Math.max(0.0, relevanceScore));

        } catch (error) {
            this.log('error', '相关性评估失败', { error: error.message });
            return 0.5; // 默认中等相关性
        }
    }

    /**
     * 关键词相关性评估
     */
    assessKeywordRelevance(data) {
        const content = `${data.title || ''} ${data.content || ''}`.toLowerCase();
        
        // 定义目标关键词（基于火鸟门户的内容定位）
        const targetKeywords = [
            // 科技类
            'ai', '人工智能', '科技', '技术', '创新', '数字化', '互联网',
            // 新闻类
            '新闻', '资讯', '消息', '报道', '事件', '发布', '宣布',
            // 商业类
            '商业', '企业', '公司', '市场', '投资', '经济',
            // 生活类
            '生活', '健康', '教育', '旅游', '美食', '文化'
        ];

        let matchCount = 0;
        for (const keyword of targetKeywords) {
            if (content.includes(keyword)) {
                matchCount++;
            }
        }

        return Math.min(1.0, matchCount / 10); // 最多10个关键词匹配为满分
    }

    /**
     * 分类相关性评估
     */
    assessCategoryRelevance(data) {
        // 基于内容模式匹配评估分类相关性
        let relevanceScore = 0.5; // 默认分数

        for (const [patternType, patterns] of this.contentPatterns.entries()) {
            let patternMatches = 0;

            // 检查标题模式
            for (const titlePattern of patterns.titlePatterns) {
                if (titlePattern.test(data.title || '')) {
                    patternMatches++;
                }
            }

            // 检查内容模式
            for (const contentPattern of patterns.contentPatterns) {
                if (contentPattern.test(data.content || '')) {
                    patternMatches++;
                }
            }

            if (patternMatches > 0) {
                relevanceScore = Math.max(relevanceScore, 0.7 + (patternMatches * 0.1));
            }
        }

        return Math.min(1.0, relevanceScore);
    }

    /**
     * 来源相关性评估
     */
    assessSourceRelevance(data) {
        const source = (data.source || '').toLowerCase();
        
        // 定义可信来源
        const trustedSources = [
            'the neuron', 'futurepedia', 'superhuman', 'the rundown ai',
            'github', 'techcrunch', 'wired', 'ars technica', 'verge',
            '新华社', '人民日报', '央视新闻', '澎湃新闻'
        ];

        // 检查是否为可信来源
        for (const trustedSource of trustedSources) {
            if (source.includes(trustedSource)) {
                return 0.9; // 高相关性
            }
        }

        // 检查是否有有效的来源URL
        if (data.source_url && this.isValidUrl(data.source_url)) {
            return 0.7; // 中高相关性
        }

        return 0.5; // 默认相关性
    }

    /**
     * 语义相关性评估
     */
    async assessSemanticRelevance(data) {
        try {
            const prompt = `请评估以下内容与"科技新闻、商业资讯、生活信息"主题的相关性：

标题：${data.title}
内容摘要：${data.content?.substring(0, 300)}...

请返回0-1之间的相关性分数，其中：
- 0.9-1.0: 高度相关
- 0.7-0.8: 相关
- 0.5-0.6: 中等相关
- 0.3-0.4: 低相关
- 0.0-0.2: 不相关

只返回数字分数：`;

            const response = await this.callAI(prompt, { 
                maxTokens: 10,
                temperature: 0.1 
            });

            const score = parseFloat(response.trim());
            return isNaN(score) ? 0.5 : Math.min(1.0, Math.max(0.0, score));

        } catch (error) {
            this.log('error', '语义相关性评估失败', { error: error.message });
            return 0.5;
        }
    }

    /**
     * 计算最终质量分数
     */
    calculateFinalQualityScore(baseScore, aiAssessment, relevanceScore) {
        let finalScore = baseScore;

        // 如果有AI评估结果，进行加权平均
        if (aiAssessment && aiAssessment.overallScore) {
            finalScore = (baseScore * 0.4) + (aiAssessment.overallScore * 0.6);
        }

        // 相关性调整
        if (relevanceScore < 0.5) {
            finalScore *= 0.8; // 低相关性内容降分
        } else if (relevanceScore > 0.8) {
            finalScore *= 1.1; // 高相关性内容加分
        }

        return Math.min(100, Math.max(0, finalScore));
    }

    /**
     * 增强版内容质量计算
     */
    calculateEnhancedContentQuality(data) {
        let totalScore = 0;
        let maxScore = 0;

        // 标题质量评估
        const titleScore = this.assessTitleQuality(data.title);
        totalScore += titleScore * 30; // 30%权重
        maxScore += 30;

        // 内容质量评估
        const contentScore = this.assessContentQuality(data.content);
        totalScore += contentScore * 40; // 40%权重
        maxScore += 40;

        // 元数据完整性评估
        const metadataScore = this.assessMetadataCompleteness(data);
        totalScore += metadataScore * 20; // 20%权重
        maxScore += 20;

        // 结构质量评估
        const structuralScore = this.assessStructuralQuality(data.content);
        totalScore += structuralScore * 10; // 10%权重
        maxScore += 10;

        return maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    }

    /**
     * 标题质量评估
     */
    assessTitleQuality(title) {
        if (!title) return 0;

        let score = 0;
        const titleLength = title.length;

        // 长度评分
        if (titleLength >= 10 && titleLength <= 50) {
            score += 0.4;
        } else if (titleLength >= 5 && titleLength <= 60) {
            score += 0.2;
        }

        // 包含数字或具体信息
        if (/\d/.test(title)) {
            score += 0.1;
        }

        // 包含关键动词
        const actionWords = ['发布', '宣布', '推出', '发现', '研发', '创新', '突破'];
        if (actionWords.some(word => title.includes(word))) {
            score += 0.2;
        }

        // 避免过度夸张
        const exaggeratedWords = ['震惊', '惊人', '史上最', '绝对', '完美'];
        if (!exaggeratedWords.some(word => title.includes(word))) {
            score += 0.1;
        }

        // 清晰度检查
        if (!/[？！]{2,}/.test(title)) { // 避免过多标点
            score += 0.2;
        }

        return Math.min(1.0, score);
    }

    /**
     * 内容质量评估
     */
    assessContentQuality(content) {
        if (!content) return 0;

        let score = 0;
        const contentLength = content.length;

        // 长度评分
        if (contentLength >= 300 && contentLength <= 2000) {
            score += 0.3;
        } else if (contentLength >= 100 && contentLength <= 3000) {
            score += 0.2;
        } else if (contentLength >= 50) {
            score += 0.1;
        }

        // 段落结构
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        if (paragraphs.length >= 3) {
            score += 0.2;
        } else if (paragraphs.length >= 2) {
            score += 0.1;
        }

        // 句子多样性
        const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
        const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
        if (avgSentenceLength >= 10 && avgSentenceLength <= 50) {
            score += 0.2;
        }

        // 信息密度
        const infoWords = ['据', '显示', '表示', '指出', '认为', '发现', '研究', '数据'];
        const infoWordCount = infoWords.filter(word => content.includes(word)).length;
        if (infoWordCount >= 2) {
            score += 0.2;
        }

        // 避免重复内容
        const words = content.split(/\s+/);
        const uniqueWords = new Set(words);
        const uniqueRatio = uniqueWords.size / words.length;
        if (uniqueRatio > 0.7) {
            score += 0.1;
        }

        return Math.min(1.0, score);
    }

    /**
     * 元数据完整性评估
     */
    assessMetadataCompleteness(data) {
        let score = 0;
        let totalFields = 0;

        const fields = [
            { key: 'author', weight: 0.15 },
            { key: 'source', weight: 0.2 },
            { key: 'keywords', weight: 0.15 },
            { key: 'summary', weight: 0.15 },
            { key: 'image_url', weight: 0.1 },
            { key: 'source_url', weight: 0.25 }
        ];

        for (const field of fields) {
            totalFields += field.weight;
            if (data[field.key] && data[field.key].toString().trim().length > 0) {
                score += field.weight;
            }
        }

        return totalFields > 0 ? score / totalFields : 0;
    }

    /**
     * 结构质量评估
     */
    assessStructuralQuality(content) {
        if (!content) return 0;

        let score = 0;

        // 检查是否有明确的开头
        const firstSentence = content.split(/[。！？.!?]/)[0];
        if (firstSentence && firstSentence.length > 10) {
            score += 0.3;
        }

        // 检查是否有逻辑连接词
        const connectors = ['因此', '所以', '但是', '然而', '此外', '另外', '同时', '首先', '其次', '最后'];
        const connectorCount = connectors.filter(conn => content.includes(conn)).length;
        if (connectorCount >= 2) {
            score += 0.3;
        }

        // 检查是否有具体数据或事实
        if (/\d+%|\d+年|\d+月|\d+日|\d+万|\d+亿/.test(content)) {
            score += 0.2;
        }

        // 检查结尾是否完整
        const lastChar = content.trim().slice(-1);
        if (['。', '！', '？', '.', '!', '?'].includes(lastChar)) {
            score += 0.2;
        }

        return Math.min(1.0, score);
    }    /**

     * 增强版敏感内容检测
     */
    async enhancedSensitiveContentDetection(data) {
        try {
            const sensitiveWords = [];
            const content = `${data.title || ''} ${data.content || ''} ${data.keywords || ''}`;
            
            // 基础敏感词检测
            for (const word of this.sensitiveWords) {
                if (content.includes(word)) {
                    sensitiveWords.push(word);
                }
            }

            // AI增强敏感内容检测
            let aiSensitiveResult = null;
            if (this.config.aiApiKey) {
                aiSensitiveResult = await this.aiSensitiveContentDetection(data);
            }

            const hasSensitive = sensitiveWords.length > 0 || 
                (aiSensitiveResult && aiSensitiveResult.hasSensitive);

            if (hasSensitive) {
                // 生成过滤后的内容
                const filteredData = this.filterSensitiveContent(data, sensitiveWords);
                
                return {
                    hasSensitive: true,
                    words: sensitiveWords,
                    aiDetection: aiSensitiveResult,
                    filtered: filteredData,
                    severity: this.calculateSensitiveSeverity(sensitiveWords, aiSensitiveResult)
                };
            }

            return {
                hasSensitive: false,
                words: [],
                aiDetection: aiSensitiveResult
            };

        } catch (error) {
            this.log('error', '敏感内容检测失败', { error: error.message });
            return {
                hasSensitive: false,
                words: [],
                error: error.message
            };
        }
    }

    /**
     * AI敏感内容检测
     */
    async aiSensitiveContentDetection(data) {
        try {
            const prompt = `请检测以下内容是否包含敏感信息：

标题：${data.title}
内容：${data.content?.substring(0, 500)}

检测类别：
1. 政治敏感内容
2. 暴力或危险内容
3. 成人内容
4. 仇恨言论
5. 虚假信息
6. 违法内容

请以JSON格式返回：
{
  "hasSensitive": true/false,
  "categories": ["检测到的敏感类别"],
  "confidence": 0-1之间的置信度,
  "details": "具体说明"
}`;

            const response = await this.callAI(prompt, { 
                maxTokens: 200,
                temperature: 0.1 
            });

            return JSON.parse(response);

        } catch (error) {
            this.log('error', 'AI敏感内容检测失败', { error: error.message });
            return null;
        }
    }

    /**
     * 过滤敏感内容
     */
    filterSensitiveContent(data, sensitiveWords) {
        const filtered = { ...data };

        // 创建替换映射
        const replacementMap = new Map();
        sensitiveWords.forEach(word => {
            replacementMap.set(word, '*'.repeat(word.length));
        });

        // 过滤标题
        if (filtered.title) {
            let filteredTitle = filtered.title;
            for (const [word, replacement] of replacementMap) {
                filteredTitle = filteredTitle.replace(new RegExp(word, 'g'), replacement);
            }
            filtered.title = filteredTitle;
        }

        // 过滤内容
        if (filtered.content) {
            let filteredContent = filtered.content;
            for (const [word, replacement] of replacementMap) {
                filteredContent = filteredContent.replace(new RegExp(word, 'g'), replacement);
            }
            filtered.content = filteredContent;
        }

        return filtered;
    }

    /**
     * 计算敏感内容严重程度
     */
    calculateSensitiveSeverity(words, aiResult) {
        let severity = 'low';

        if (words.length > 3) {
            severity = 'high';
        } else if (words.length > 1) {
            severity = 'medium';
        }

        if (aiResult && aiResult.confidence > 0.8) {
            severity = 'high';
        }

        return severity;
    }

    /**
     * 增强版AI内容优化
     */
    async enhancedAIOptimization(data, qualityAssessment, options = {}) {
        try {
            const optimizedData = { ...data };

            // 基于质量评估结果进行针对性优化
            if (qualityAssessment.assessmentDetails.titleQuality < 0.7 && options.optimizeTitle !== false) {
                optimizedData.title = await this.optimizeTitle(data.title, data.content);
            }

            if (qualityAssessment.assessmentDetails.contentQuality < 0.7 && options.optimizeContent !== false) {
                optimizedData.content = await this.optimizeContent(data.content);
            }

            // 智能关键词生成
            if (options.generateKeywords !== false) {
                optimizedData.keywords = await this.generateEnhancedKeywords(
                    optimizedData.title, 
                    optimizedData.content,
                    qualityAssessment
                );
            }

            // 智能摘要生成
            if (options.generateSummary !== false) {
                optimizedData.summary = await this.generateEnhancedSummary(
                    optimizedData.content,
                    qualityAssessment
                );
            }

            // SEO优化
            if (options.enableSEO !== false) {
                optimizedData.seoOptimized = await this.applySEOOptimization(optimizedData);
            }

            return optimizedData;

        } catch (error) {
            this.log('error', '增强版AI优化失败', { error: error.message });
            return data; // 返回原始数据
        }
    }

    /**
     * 生成增强版关键词
     */
    async generateEnhancedKeywords(title, content, qualityAssessment) {
        try {
            const prompt = `基于以下内容和质量评估，生成最优关键词：

标题：${title}
内容：${content?.substring(0, 800)}
质量分数：${qualityAssessment.qualityScore}
AI建议分类：${qualityAssessment.aiAssessment?.category || '未知'}

要求：
1. 生成5-8个关键词
2. 优先选择搜索热度高的词汇
3. 包含长尾关键词
4. 考虑SEO优化
5. 用逗号分隔

关键词：`;

            const keywords = await this.callAI(prompt, { maxTokens: 100 });
            return keywords || this.extractKeywordsFromText(title + ' ' + content);

        } catch (error) {
            return this.extractKeywordsFromText(title + ' ' + content);
        }
    }

    /**
     * 生成增强版摘要
     */
    async generateEnhancedSummary(content, qualityAssessment) {
        try {
            const prompt = `基于以下内容和质量评估，生成优质摘要：

内容：${content}
质量分数：${qualityAssessment.qualityScore}
内容优势：${qualityAssessment.aiAssessment?.strengths?.join(', ') || '无'}

要求：
1. 摘要长度100-200字符
2. 突出核心信息和价值点
3. 语言简洁有力
4. 适合社交媒体分享
5. 包含关键数据或事实

摘要：`;

            const summary = await this.callAI(prompt, { maxTokens: 200 });
            
            if (summary && summary.length >= 50 && summary.length <= 255) {
                return summary;
            }
            
            // 降级到自动摘要
            return this.generateAutoSummary(content);

        } catch (error) {
            return this.generateAutoSummary(content);
        }
    }

    /**
     * 自动摘要生成
     */
    generateAutoSummary(content) {
        if (!content) return '';

        // 提取前几句话作为摘要
        const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 10);
        
        let summary = '';
        for (const sentence of sentences.slice(0, 3)) {
            if (summary.length + sentence.length <= 200) {
                summary += sentence.trim() + '。';
            } else {
                break;
            }
        }

        return summary || content.substring(0, 150) + '...';
    }

    /**
     * SEO优化
     */
    async applySEOOptimization(data) {
        return {
            optimizedTitle: this.optimizeTitleForSEO(data.title),
            metaDescription: this.generateMetaDescription(data),
            structuredData: this.generateStructuredData(data),
            internalLinks: this.suggestInternalLinks(data),
            imageAlt: this.generateImageAltText(data)
        };
    }

    /**
     * 标题SEO优化
     */
    optimizeTitleForSEO(title) {
        if (!title) return '';

        // 确保标题长度适合SEO
        if (title.length > 60) {
            return title.substring(0, 57) + '...';
        }

        return title;
    }

    /**
     * 生成Meta描述
     */
    generateMetaDescription(data) {
        const description = data.summary || data.description || '';
        
        if (description.length > 160) {
            return description.substring(0, 157) + '...';
        }

        return description;
    }

    /**
     * 增强版智能分类
     */
    async enhancedCategorization(data) {
        try {
            // 基础分类
            const baseCategory = this.intelligentCategorization(data);
            
            // AI增强分类
            let aiCategory = null;
            if (this.config.aiApiKey) {
                aiCategory = await this.aiEnhancedCategorization(data);
            }

            // 综合分类结果
            const finalCategory = this.combineCategoryResults(baseCategory, aiCategory);

            return finalCategory;

        } catch (error) {
            this.log('error', '增强版分类失败', { error: error.message });
            return this.intelligentCategorization(data); // 降级到基础分类
        }
    }

    /**
     * AI增强分类
     */
    async aiEnhancedCategorization(data) {
        try {
            const categories = Array.from(this.categoryMapping.keys()).join(', ');
            
            const prompt = `请为以下内容选择最合适的分类：

标题：${data.title}
内容：${data.content?.substring(0, 500)}
来源：${data.source || ''}

可选分类：${categories}

请以JSON格式返回：
{
  "category": "分类名称",
  "confidence": 0-1之间的置信度,
  "reasoning": "分类理由",
  "alternativeCategories": ["备选分类1", "备选分类2"]
}`;

            const response = await this.callAI(prompt, { 
                maxTokens: 200,
                temperature: 0.3 
            });

            return JSON.parse(response);

        } catch (error) {
            this.log('error', 'AI分类失败', { error: error.message });
            return null;
        }
    }

    /**
     * 合并分类结果
     */
    combineCategoryResults(baseCategory, aiCategory) {
        // 如果AI分类可用且置信度高，优先使用AI结果
        if (aiCategory && aiCategory.confidence > 0.8) {
            const categoryInfo = this.categoryMapping.get(aiCategory.category);
            if (categoryInfo) {
                return {
                    category: aiCategory.category,
                    id: categoryInfo.id,
                    confidence: aiCategory.confidence,
                    method: 'ai_enhanced',
                    reasoning: aiCategory.reasoning,
                    alternatives: aiCategory.alternativeCategories
                };
            }
        }

        // 否则使用基础分类，但结合AI的置信度调整
        let adjustedConfidence = baseCategory.confidence;
        if (aiCategory && aiCategory.category === baseCategory.category) {
            adjustedConfidence = Math.max(adjustedConfidence, aiCategory.confidence);
        }

        return {
            ...baseCategory,
            confidence: adjustedConfidence,
            method: 'combined',
            aiSuggestion: aiCategory
        };
    }

    /**
     * 格式化为Notion数据结构
     */
    formatForNotion(data, qualityAssessment, categoryResult) {
        const now = new Date().toISOString();
        
        return {
            // 基础内容字段
            标题: data.title || '',
            短标题: this.generateShortTitle(data.title),
            内容: data.content || '',
            摘要: data.summary || data.description || '',

            // 来源信息
            来源: data.source || 'API采集',
            作者: data.author || 'AI采集',
            原始URL: data.source_url || '',
            发布日期: data.publish_date || now,

            // 分类和标签
            分类ID: categoryResult.id || 1,
            分类名称: categoryResult.category || '新闻',
            关键词: this.formatKeywordsForNotion(data.keywords),

            // 媒体资源
            缩略图URL: data.image_url || '',
            图片集合: this.formatImagesForNotion(data.images),

            // 状态和质量
            质量分数: Math.round(qualityAssessment.qualityScore),
            处理状态: '已存储',
            审核状态: qualityAssessment.qualityScore >= 80 ? '已审核' : '未审核',

            // 显示属性
            标题颜色: '',
            附加属性: this.generateNotionFlags(data, qualityAssessment),
            排序权重: this.calculateSortWeight(qualityAssessment),

            // 系统字段
            城市ID: 1, // 夏威夷
            评论开关: true,
            跳转地址: data.redirect_url || '',

            // 处理记录
            错误信息: '',
            处理时间: qualityAssessment.processingTime || 0,
            AI评估结果: JSON.stringify(qualityAssessment.aiAssessment || {}),
            重复检查结果: '已通过',

            // 时间戳
            创建时间: now,
            更新时间: now,

            // 扩展字段
            相关性分数: Math.round(qualityAssessment.relevanceScore * 100),
            分类置信度: Math.round(categoryResult.confidence * 100),
            处理器版本: '3.0.0'
        };
    }

    /**
     * 生成短标题
     */
    generateShortTitle(title) {
        if (!title) return '';
        
        if (title.length <= 36) {
            return title;
        }

        // 尝试在合适的位置截断
        const breakPoints = ['：', ':', '，', ',', ' '];
        for (const breakPoint of breakPoints) {
            const index = title.indexOf(breakPoint);
            if (index > 10 && index <= 33) {
                return title.substring(0, index);
            }
        }

        return title.substring(0, 33) + '...';
    }

    /**
     * 格式化关键词为Notion格式
     */
    formatKeywordsForNotion(keywords) {
        if (!keywords) return [];

        if (typeof keywords === 'string') {
            return keywords.split(/[,，、\s]+/)
                .filter(k => k.trim())
                .slice(0, 10);
        }

        if (Array.isArray(keywords)) {
            return keywords.slice(0, 10);
        }

        return [];
    }

    /**
     * 格式化图片为Notion格式
     */
    formatImagesForNotion(images) {
        if (!images || !Array.isArray(images)) return [];

        return images
            .filter(img => img && typeof img === 'string')
            .slice(0, 5); // 限制图片数量
    }

    /**
     * 生成Notion标记
     */
    generateNotionFlags(data, qualityAssessment) {
        const flags = [];

        // 基于质量分数添加标记
        if (qualityAssessment.qualityScore >= 90) {
            flags.push('头条');
        } else if (qualityAssessment.qualityScore >= 80) {
            flags.push('推荐');
        }

        // 基于相关性添加标记
        if (qualityAssessment.relevanceScore >= 0.8) {
            flags.push('加粗');
        }

        // 基于媒体内容添加标记
        if (data.image_url || (data.images && data.images.length > 0)) {
            flags.push('图文');
        }

        // 基于跳转链接添加标记
        if (data.redirect_url) {
            flags.push('跳转');
        }

        return flags;
    }

    /**
     * 计算排序权重
     */
    calculateSortWeight(qualityAssessment) {
        // 基于质量分数和相关性计算权重
        const qualityWeight = qualityAssessment.qualityScore / 100;
        const relevanceWeight = qualityAssessment.relevanceScore;
        
        return Math.round((qualityWeight * 0.7 + relevanceWeight * 0.3) * 100);
    }  
  /**
     * 语义相似度计算
     */
    async calculateSemanticSimilarity(data) {
        try {
            if (!this.config.aiApiKey) {
                return { maxSimilarity: 0, similarContent: '' };
            }

            // 从缓存中获取已处理的内容进行比较
            let maxSimilarity = 0;
            let similarContent = '';

            const currentText = `${data.title} ${data.content?.substring(0, 300)}`;

            for (const [hash, cached] of this.semanticCache.entries()) {
                if (!cached.text) continue;

                const similarity = await this.calculateTextSemanticSimilarity(
                    currentText, 
                    cached.text
                );

                if (similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                    similarContent = cached.text;
                }
            }

            // 缓存当前内容
            const contentHash = this.generateEnhancedContentHash(data);
            this.semanticCache.set(contentHash, {
                text: currentText,
                timestamp: Date.now()
            });

            return { maxSimilarity, similarContent };

        } catch (error) {
            this.log('error', '语义相似度计算失败', { error: error.message });
            return { maxSimilarity: 0, similarContent: '' };
        }
    }

    /**
     * 文本语义相似度计算
     */
    async calculateTextSemanticSimilarity(text1, text2) {
        try {
            const prompt = `请计算以下两段文本的语义相似度：

文本1：${text1}

文本2：${text2}

请返回0-1之间的相似度分数，其中：
- 0.9-1.0: 几乎相同
- 0.7-0.8: 高度相似
- 0.5-0.6: 中等相似
- 0.3-0.4: 低相似
- 0.0-0.2: 不相似

只返回数字分数：`;

            const response = await this.callAI(prompt, { 
                maxTokens: 10,
                temperature: 0.1 
            });

            const similarity = parseFloat(response.trim());
            return isNaN(similarity) ? 0 : Math.min(1.0, Math.max(0.0, similarity));

        } catch (error) {
            return 0;
        }
    }

    /**
     * 缓存处理结果
     */
    cacheProcessingResult(inputData, result) {
        try {
            const contentHash = this.generateEnhancedContentHash(inputData);
            
            this.contentCache.set(contentHash, {
                input: inputData,
                result: result,
                timestamp: Date.now()
            });

            // 限制缓存大小
            if (this.contentCache.size > 1000) {
                const oldestKey = this.contentCache.keys().next().value;
                this.contentCache.delete(oldestKey);
            }

        } catch (error) {
            this.log('error', '缓存结果失败', { error: error.message });
        }
    }

    /**
     * 批量处理内容 - 增强版
     */
    async batchProcessContent(contentList, options = {}) {
        const results = [];
        const batchSize = options.batchSize || 3; // 减少并发数以提高稳定性
        const delayBetweenBatches = options.delayBetweenBatches || 2000; // 增加延迟

        this.log('info', '开始增强版批量内容处理', {
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

        for (let i = 0; i < contentList.length; i += batchSize) {
            const batch = contentList.slice(i, i + batchSize);
            const batchResults = [];

            // 并行处理当前批次
            const promises = batch.map(async (content, index) => {
                try {
                    // 批次内延迟
                    if (index > 0) {
                        await this.delay(500);
                    }
                    
                    return await this.processContent(content, options);
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
            successRate: this.stats.processed > 0 ? (this.stats.accepted / this.stats.processed * 100).toFixed(2) + '%' : '0%'
        };

        this.log('info', '批量处理完成', summary);

        return {
            success: true,
            summary,
            results,
            stats: this.stats
        };
    }

    /**
     * 获取处理统计信息
     */
    getProcessingStats() {
        return {
            ...this.stats,
            cacheSize: {
                content: this.contentCache.size,
                similarity: this.similarityCache.size,
                semantic: this.semanticCache.size,
                quality: this.qualityCache.size
            },
            uptime: Date.now() - this.startTime
        };
    }

    /**
     * 清理所有缓存
     */
    clearAllCaches() {
        this.contentCache.clear();
        this.similarityCache.clear();
        this.semanticCache.clear();
        this.qualityCache.clear();
        
        this.log('info', '所有缓存已清理');
    }

    /**
     * 重置统计信息
     */
    resetStats() {
        this.stats = {
            processed: 0,
            accepted: 0,
            rejected: 0,
            duplicates: 0,
            errors: 0
        };
        
        this.log('info', '统计信息已重置');
    }

    /**
     * 生成结构化数据
     */
    generateStructuredData(data) {
        return {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": data.title,
            "description": data.summary || data.description,
            "author": {
                "@type": "Person",
                "name": data.author || "AI采集"
            },
            "publisher": {
                "@type": "Organization",
                "name": "火鸟门户"
            },
            "datePublished": data.publish_date,
            "url": data.source_url,
            "image": data.image_url
        };
    }

    /**
     * 建议内部链接
     */
    suggestInternalLinks(data) {
        const suggestions = [];
        const content = `${data.title} ${data.content}`.toLowerCase();

        // 基于关键词建议相关链接
        const linkSuggestions = {
            'ai': '/category/ai',
            '人工智能': '/category/ai',
            '科技': '/category/tech',
            '新闻': '/category/news',
            '商业': '/category/business'
        };

        for (const [keyword, link] of Object.entries(linkSuggestions)) {
            if (content.includes(keyword)) {
                suggestions.push({
                    keyword,
                    link,
                    anchor: keyword
                });
            }
        }

        return suggestions.slice(0, 3); // 限制建议数量
    }

    /**
     * 生成图片Alt文本
     */
    generateImageAltText(data) {
        if (!data.image_url) return '';

        return `${data.title} - ${data.source || '火鸟门户'}`;
    }

    // 继承原有的基础方法
    initializeSensitiveWords() {
        const sensitiveWordsList = [
            // 政治敏感词
            '政治', '政府', '官员', '腐败', '抗议', '示威', '政权', '革命',
            // 暴力相关
            '暴力', '杀害', '恐怖', '爆炸', '武器', '枪支', '刀具', '袭击',
            // 色情相关
            '色情', '裸体', '性爱', '成人', '黄色', '情色', '性感',
            // 赌博相关
            '赌博', '博彩', '彩票', '赌场', '下注', '赌资', '赌徒',
            // 毒品相关
            '毒品', '大麻', '海洛因', '可卡因', '吸毒', '贩毒', '毒贩',
            // 其他违法内容
            '诈骗', '洗钱', '偷税', '走私', '盗版', '假货', '传销'
        ];

        sensitiveWordsList.forEach(word => {
            this.sensitiveWords.add(word);
        });

        this.log('info', '敏感词库初始化完成', { count: this.sensitiveWords.size });
    }

    initializeCategoryMapping() {
        // 智能分类关键词映射 - 增强版
        this.categoryMapping.set('科技', {
            id: 1,
            keywords: [
                'AI', '人工智能', '机器学习', '深度学习', '神经网络',
                '科技', '技术', '创新', '数字化', '智能化',
                '互联网', '物联网', '云计算', '大数据', '区块链',
                '软件', '硬件', '芯片', '处理器', '算法',
                '5G', '6G', '量子计算', '虚拟现实', '增强现实',
                '自动驾驶', '机器人', '无人机', '3D打印'
            ]
        });
        
        this.categoryMapping.set('商业', {
            id: 2,
            keywords: [
                '商业', '企业', '公司', '商务', '贸易',
                '经济', '市场', '营销', '销售', '业务',
                '投资', '融资', '股票', '股市', '基金',
                '金融', '银行', '保险', '证券', '期货',
                '创业', '初创', 'IPO', '上市', '并购',
                '电商', '零售', '批发', '供应链', '物流'
            ]
        });
        
        this.categoryMapping.set('新闻', {
            id: 3,
            keywords: [
                '新闻', '资讯', '消息', '报道', '通讯',
                '时事', '社会', '民生', '公共', '社区',
                '政策', '法律', '法规', '条例', '规定',
                '事件', '事故', '突发', '紧急', '重要',
                '公告', '通知', '声明', '发布', '宣布'
            ]
        });

        // 添加更多分类...
        this.categoryMapping.set('健康', {
            id: 6,
            keywords: [
                '健康', '医疗', '医学', '医院', '诊所',
                '养生', '保健', '营养', '饮食', '运动',
                '疾病', '病症', '治疗', '药物', '疫苗',
                '心理', '精神', '康复', '护理', '急救'
            ]
        });

        this.categoryMapping.set('教育', {
            id: 10,
            keywords: [
                '教育', '学习', '培训', '课程', '教学',
                '学校', '大学', '学院', '研究', '学术',
                '考试', '测试', '评估', '认证', '资格',
                '老师', '教师', '学生', '学员', '导师',
                '在线教育', '远程学习', 'MOOC', '知识'
            ]
        });
    }

    validateBasicData(data) {
        const errors = [];

        // 标题验证
        if (!data.title || typeof data.title !== 'string') {
            errors.push('标题不能为空');
        } else if (data.title.length < this.config.minTitleLength) {
            errors.push(`标题长度不能少于${this.config.minTitleLength}个字符`);
        } else if (data.title.length > this.config.maxTitleLength) {
            errors.push(`标题长度不能超过${this.config.maxTitleLength}个字符`);
        }

        // 内容验证
        if (!data.content || typeof data.content !== 'string') {
            errors.push('内容不能为空');
        } else if (data.content.length < this.config.minContentLength) {
            errors.push(`内容长度不能少于${this.config.minContentLength}个字符`);
        } else if (data.content.length > this.config.maxContentLength) {
            errors.push(`内容长度不能超过${this.config.maxContentLength}个字符`);
        }

        // URL验证
        if (data.source_url && !this.isValidUrl(data.source_url)) {
            errors.push('来源URL格式无效');
        }

        if (data.image_url && !this.isValidUrl(data.image_url)) {
            errors.push('图片URL格式无效');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    calculateJaccardSimilarity(set1, set2) {
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return union.size === 0 ? 0 : intersection.size / union.size;
    }

    intelligentCategorization(data) {
        const content = `${data.title || ''} ${data.content || ''} ${data.keywords || ''}`.toLowerCase();
        let bestMatch = { category: '新闻', confidence: 0, id: 3 };

        for (const [categoryName, categoryInfo] of this.categoryMapping.entries()) {
            let matchCount = 0;
            let totalKeywords = categoryInfo.keywords.length;

            for (const keyword of categoryInfo.keywords) {
                if (content.includes(keyword.toLowerCase())) {
                    matchCount++;
                }
            }

            const confidence = matchCount / totalKeywords;
            if (confidence > bestMatch.confidence) {
                bestMatch = {
                    category: categoryName,
                    confidence,
                    id: categoryInfo.id
                };
            }
        }

        return bestMatch;
    }

    async callAI(prompt, options = {}) {
        try {
            const response = await axios.post(`${this.config.aiBaseUrl}/chat/completions`, {
                model: this.config.aiModel,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: options.maxTokens || 500,
                temperature: options.temperature || 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.config.aiApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            return response.data.choices[0]?.message?.content?.trim();

        } catch (error) {
            this.log('error', 'AI服务调用失败', { error: error.message });
            throw error;
        }
    }

    extractKeywordsFromText(text) {
        const words = this.extractEnhancedKeywords(text);
        return Array.from(words).slice(0, 8).join(',');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    cleanupExpiredCache() {
        const now = Date.now();
        
        // 清理各种缓存
        const caches = [
            this.contentCache,
            this.similarityCache,
            this.semanticCache,
            this.qualityCache
        ];

        caches.forEach(cache => {
            for (const [key, data] of cache.entries()) {
                if (now - data.timestamp > this.config.cacheExpiry) {
                    cache.delete(key);
                }
            }
        });

        this.log('info', '缓存清理完成', {
            contentCache: this.contentCache.size,
            similarityCache: this.similarityCache.size,
            semanticCache: this.semanticCache.size,
            qualityCache: this.qualityCache.size
        });
    }

    startCleanupTimer() {
        this.startTime = Date.now();
        
        setInterval(() => {
            this.cleanupExpiredCache();
        }, 3600000); // 每小时清理一次
    }

    log(level, message, data = {}) {
        if (!this.config.enableLogging) return;

        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            processor: 'Enhanced-HuoNiao-ContentProcessor-v3.0'
        };

        console.log(JSON.stringify(logEntry));
    }
}

// 导出增强版类
module.exports = {
    EnhancedHuoNiaoContentProcessor,
    // 保持向后兼容
    HuoNiaoContentProcessor: EnhancedHuoNiaoContentProcessor
};

// n8n使用示例
if (typeof $input !== 'undefined') {
    // n8n环境中的使用示例 - 异步函数包装
    (async () => {
        const processor = new EnhancedHuoNiaoContentProcessor({
            aiApiKey: process.env.OPENAI_API_KEY,
            enableCache: true,
            enableLogging: true,
            enableSemanticAnalysis: true,
            qualityThreshold: 70,
            relevanceThreshold: 0.7,
            titleSimilarityThreshold: 0.8,
            contentSimilarityThreshold: 0.85,
            semanticSimilarityThreshold: 0.75
        });

        // 处理输入数据
        const inputData = $input.first().json;
        const result = await processor.processContent(inputData, {
            enableAI: true,
            optimizeTitle: true,
            optimizeContent: true,
            generateKeywords: true,
            generateSummary: true,
            enableSEO: true,
            strictMode: false
        });

        return result;
    })();
}