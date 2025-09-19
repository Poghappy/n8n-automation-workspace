/**
 * 增强版数据验证和标准化模块
 * 用于验证和标准化从多个数据源采集的新闻内容
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-01-22
 */

const crypto = require('crypto');
const { URL } = require('url');

/**
 * 增强版数据验证器
 */
class EnhancedDataValidator {
    constructor(config = {}) {
        this.config = {
            // 内容长度限制
            minTitleLength: config.minTitleLength || 5,
            maxTitleLength: config.maxTitleLength || 200,
            minContentLength: config.minContentLength || 50,
            maxContentLength: config.maxContentLength || 5000,
            minSummaryLength: config.minSummaryLength || 20,
            maxSummaryLength: config.maxSummaryLength || 500,
            
            // 质量评分阈值
            minQualityScore: config.minQualityScore || 60,
            
            // 相似度阈值
            similarityThreshold: config.similarityThreshold || 0.8,
            
            // 允许的图片类型
            allowedImageTypes: config.allowedImageTypes || ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            maxImageSize: config.maxImageSize || 5 * 1024 * 1024, // 5MB
            
            // 敏感词检测
            enableSensitiveWordCheck: config.enableSensitiveWordCheck !== false,
            
            // 日志配置
            enableLogging: config.enableLogging !== false,
            
            ...config
        };

        // 初始化敏感词库
        this.sensitiveWords = new Set([
            // 政治敏感词
            '政治敏感', '政府腐败', '官员贪污',
            // 暴力相关
            '暴力事件', '恐怖袭击', '武器交易',
            // 其他违法内容
            '诈骗活动', '洗钱行为', '毒品交易'
        ]);

        // 内容缓存用于去重
        this.contentCache = new Map();
        this.titleCache = new Map();
    }

    /**
     * 验证和标准化单个新闻项目
     * @param {Object} item - 原始新闻数据
     * @param {Object} options - 验证选项
     * @returns {Object} 验证结果
     */
    async validateAndStandardize(item, options = {}) {
        try {
            this.log('info', '开始验证数据项', { title: item.title?.substring(0, 50) });

            // 1. 基础数据验证
            const basicValidation = this.validateBasicData(item);
            if (!basicValidation.isValid) {
                return {
                    isValid: false,
                    errors: basicValidation.errors,
                    item: null
                };
            }

            // 2. 内容去重检测
            const duplicateCheck = await this.checkDuplicate(item);
            if (duplicateCheck.isDuplicate) {
                return {
                    isValid: false,
                    isDuplicate: true,
                    duplicateInfo: duplicateCheck,
                    item: null
                };
            }

            // 3. 敏感词检测
            const sensitiveCheck = this.checkSensitiveContent(item);
            if (sensitiveCheck.hasSensitive && options.strictMode) {
                return {
                    isValid: false,
                    hasSensitive: true,
                    sensitiveWords: sensitiveCheck.words,
                    item: null
                };
            }

            // 4. 数据标准化
            const standardizedItem = this.standardizeData(item, sensitiveCheck);

            // 5. 质量评分
            const qualityScore = this.calculateQualityScore(standardizedItem);
            if (qualityScore < this.config.minQualityScore && options.enableQualityFilter) {
                return {
                    isValid: false,
                    lowQuality: true,
                    qualityScore,
                    item: null
                };
            }

            // 6. 最终验证
            const finalValidation = this.validateStandardizedData(standardizedItem);
            if (!finalValidation.isValid) {
                return {
                    isValid: false,
                    errors: finalValidation.errors,
                    item: null
                };
            }

            // 缓存内容用于去重
            this.cacheContent(standardizedItem);

            this.log('info', '数据验证成功', {
                title: standardizedItem.title,
                qualityScore,
                source: standardizedItem.source
            });

            return {
                isValid: true,
                item: {
                    ...standardizedItem,
                    qualityScore,
                    validatedAt: new Date().toISOString(),
                    validationMetadata: {
                        hasSensitiveContent: sensitiveCheck.hasSensitive,
                        sensitiveWordsFiltered: sensitiveCheck.filtered,
                        qualityScore
                    }
                }
            };

        } catch (error) {
            this.log('error', '数据验证失败', { error: error.message, title: item.title });
            return {
                isValid: false,
                error: error.message,
                item: null
            };
        }
    }

    /**
     * 基础数据验证
     * @param {Object} item - 数据项
     * @returns {Object} 验证结果
     */
    validateBasicData(item) {
        const errors = [];

        // 必需字段检查
        if (!item.title || typeof item.title !== 'string') {
            errors.push('标题不能为空且必须为字符串');
        } else {
            // 标题长度检查
            if (item.title.length < this.config.minTitleLength) {
                errors.push(`标题长度不能少于${this.config.minTitleLength}个字符`);
            }
            if (item.title.length > this.config.maxTitleLength) {
                errors.push(`标题长度不能超过${this.config.maxTitleLength}个字符`);
            }
        }

        if (!item.content || typeof item.content !== 'string') {
            errors.push('内容不能为空且必须为字符串');
        } else {
            // 内容长度检查
            if (item.content.length < this.config.minContentLength) {
                errors.push(`内容长度不能少于${this.config.minContentLength}个字符`);
            }
            if (item.content.length > this.config.maxContentLength) {
                errors.push(`内容长度不能超过${this.config.maxContentLength}个字符`);
            }
        }

        // URL格式验证
        if (item.source_url && !this.isValidUrl(item.source_url)) {
            errors.push('来源URL格式无效');
        }

        if (item.image_url && !this.isValidUrl(item.image_url)) {
            errors.push('图片URL格式无效');
        }

        // 日期格式验证
        if (item.publishedAt && !this.isValidDate(item.publishedAt)) {
            errors.push('发布日期格式无效');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 检查内容重复
     * @param {Object} item - 数据项
     * @returns {Object} 重复检查结果
     */
    async checkDuplicate(item) {
        // 生成内容哈希
        const contentHash = this.generateContentHash(item);
        
        // 检查完全重复
        if (this.contentCache.has(contentHash)) {
            return {
                isDuplicate: true,
                type: 'exact',
                hash: contentHash,
                cachedItem: this.contentCache.get(contentHash)
            };
        }

        // 检查标题相似度
        const titleSimilarity = this.checkTitleSimilarity(item.title);
        if (titleSimilarity.maxSimilarity > this.config.similarityThreshold) {
            return {
                isDuplicate: true,
                type: 'similar',
                similarity: titleSimilarity.maxSimilarity,
                similarTitle: titleSimilarity.similarTitle
            };
        }

        return {
            isDuplicate: false,
            hash: contentHash
        };
    }

    /**
     * 生成内容哈希
     * @param {Object} item - 数据项
     * @returns {string} 哈希值
     */
    generateContentHash(item) {
        const content = `${item.title || ''}|${item.content || ''}|${item.source_url || ''}`;
        return crypto.createHash('md5').update(content, 'utf8').digest('hex');
    }

    /**
     * 检查标题相似度
     * @param {string} title - 标题
     * @returns {Object} 相似度检查结果
     */
    checkTitleSimilarity(title) {
        const titleWords = this.extractKeywords(title);
        let maxSimilarity = 0;
        let similarTitle = '';

        for (const [cachedTitle, data] of this.titleCache.entries()) {
            const cachedWords = this.extractKeywords(cachedTitle);
            const similarity = this.calculateJaccardSimilarity(titleWords, cachedWords);
            
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                similarTitle = cachedTitle;
            }
        }

        return {
            maxSimilarity,
            similarTitle
        };
    }

    /**
     * 提取关键词
     * @param {string} text - 文本
     * @returns {Set} 关键词集合
     */
    extractKeywords(text) {
        if (!text) return new Set();
        
        return new Set(
            text.toLowerCase()
                .replace(/[^\w\s\u4e00-\u9fff]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 1)
        );
    }

    /**
     * 计算Jaccard相似度
     * @param {Set} set1 - 集合1
     * @param {Set} set2 - 集合2
     * @returns {number} 相似度
     */
    calculateJaccardSimilarity(set1, set2) {
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return union.size === 0 ? 0 : intersection.size / union.size;
    }

    /**
     * 敏感词检测
     * @param {Object} item - 数据项
     * @returns {Object} 检测结果
     */
    checkSensitiveContent(item) {
        if (!this.config.enableSensitiveWordCheck) {
            return { hasSensitive: false, words: [], filtered: false };
        }

        const sensitiveWords = [];
        const content = `${item.title || ''} ${item.content || ''} ${item.summary || ''}`;
        
        for (const word of this.sensitiveWords) {
            if (content.includes(word)) {
                sensitiveWords.push(word);
            }
        }

        if (sensitiveWords.length > 0) {
            // 过滤敏感词
            let filteredTitle = item.title || '';
            let filteredContent = item.content || '';
            let filteredSummary = item.summary || '';

            sensitiveWords.forEach(word => {
                const replacement = '*'.repeat(word.length);
                const regex = new RegExp(word, 'gi');
                filteredTitle = filteredTitle.replace(regex, replacement);
                filteredContent = filteredContent.replace(regex, replacement);
                filteredSummary = filteredSummary.replace(regex, replacement);
            });

            return {
                hasSensitive: true,
                words: sensitiveWords,
                filtered: true,
                filteredData: {
                    ...item,
                    title: filteredTitle,
                    content: filteredContent,
                    summary: filteredSummary
                }
            };
        }

        return {
            hasSensitive: false,
            words: [],
            filtered: false
        };
    }

    /**
     * 数据标准化
     * @param {Object} item - 原始数据
     * @param {Object} sensitiveCheck - 敏感词检测结果
     * @returns {Object} 标准化后的数据
     */
    standardizeData(item, sensitiveCheck = {}) {
        // 使用过滤后的数据（如果有敏感词）
        const sourceData = sensitiveCheck.filtered ? sensitiveCheck.filteredData : item;

        return {
            // 基础内容字段
            title: this.cleanText(sourceData.title || '').substring(0, this.config.maxTitleLength),
            content: this.cleanText(sourceData.content || ''),
            summary: this.cleanText(sourceData.summary || sourceData.description || '').substring(0, this.config.maxSummaryLength),
            
            // 元数据字段
            author: this.cleanText(sourceData.author || 'AI采集').substring(0, 50),
            source: this.cleanText(sourceData.source || 'API采集').substring(0, 50),
            category: sourceData.category || '科技资讯',
            categoryId: sourceData.categoryId || 1,
            
            // URL字段
            source_url: this.validateAndCleanUrl(sourceData.source_url || ''),
            image_url: this.validateAndCleanUrl(sourceData.image_url || ''),
            
            // 关键词处理
            keywords: this.processKeywords(sourceData.keywords || ''),
            
            // 时间字段
            publishedAt: this.standardizeDate(sourceData.publishedAt || sourceData.collectedAt || new Date().toISOString()),
            collectedAt: new Date().toISOString(),
            
            // 源类型和元数据
            sourceType: sourceData.sourceType || 'unknown',
            metadata: sourceData.metadata || {},
            
            // 火鸟门户专用字段
            cityid: 1, // 夏威夷城市ID
            arcrank: 1, // 已审核状态
            weight: sourceData.priority || 1, // 排序权重
            notpost: 0, // 开启评论
            color: '', // 标题颜色
            flag: 'r', // 推荐标记
            
            // 处理状态
            processing_status: 'validated',
            
            // 保留原始数据用于调试
            originalData: item
        };
    }

    /**
     * 清理文本内容
     * @param {string} text - 原始文本
     * @returns {string} 清理后的文本
     */
    cleanText(text) {
        if (!text || typeof text !== 'string') return '';
        
        return text
            .replace(/\s+/g, ' ') // 合并多个空格
            .replace(/[\r\n\t]/g, ' ') // 替换换行符和制表符
            .replace(/[^\w\s\u4e00-\u9fff.,!?;:()\-"']/g, '') // 移除特殊字符，保留基本标点
            .trim();
    }

    /**
     * 验证和清理URL
     * @param {string} url - 原始URL
     * @returns {string} 清理后的URL
     */
    validateAndCleanUrl(url) {
        if (!url || typeof url !== 'string') return '';
        
        try {
            const urlObj = new URL(url);
            return urlObj.href;
        } catch (error) {
            return '';
        }
    }

    /**
     * 处理关键词
     * @param {string|Array} keywords - 关键词
     * @returns {string} 处理后的关键词字符串
     */
    processKeywords(keywords) {
        if (!keywords) return '';
        
        let keywordArray = [];
        
        if (typeof keywords === 'string') {
            keywordArray = keywords.split(/[,，;；\s]+/).filter(k => k.trim());
        } else if (Array.isArray(keywords)) {
            keywordArray = keywords.filter(k => k && typeof k === 'string');
        }
        
        // 清理和去重
        const cleanedKeywords = [...new Set(
            keywordArray
                .map(k => this.cleanText(k))
                .filter(k => k.length > 0 && k.length <= 20)
        )];
        
        return cleanedKeywords.slice(0, 10).join(',').substring(0, 100);
    }

    /**
     * 标准化日期
     * @param {string} dateStr - 日期字符串
     * @returns {string} 标准化后的ISO日期字符串
     */
    standardizeDate(dateStr) {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                return new Date().toISOString();
            }
            return date.toISOString();
        } catch (error) {
            return new Date().toISOString();
        }
    }

    /**
     * 计算内容质量分数
     * @param {Object} item - 数据项
     * @returns {number} 质量分数 (0-100)
     */
    calculateQualityScore(item) {
        let score = 0;

        // 标题质量 (25分)
        if (item.title) {
            const titleLength = item.title.length;
            if (titleLength >= 10 && titleLength <= 80) {
                score += 25;
            } else if (titleLength >= 5 && titleLength <= 120) {
                score += 15;
            } else {
                score += 5;
            }
        }

        // 内容质量 (35分)
        if (item.content) {
            const contentLength = item.content.length;
            const paragraphs = item.content.split(/\n\s*\n/).length;
            
            // 长度评分
            if (contentLength >= 200 && contentLength <= 2000) {
                score += 20;
            } else if (contentLength >= 100 && contentLength <= 3000) {
                score += 15;
            } else {
                score += 5;
            }

            // 结构评分
            if (paragraphs >= 3) {
                score += 15;
            } else if (paragraphs >= 2) {
                score += 10;
            } else {
                score += 5;
            }
        }

        // 元数据完整性 (25分)
        let metadataScore = 0;
        if (item.author && item.author !== 'AI采集') metadataScore += 5;
        if (item.source && item.source !== 'API采集') metadataScore += 5;
        if (item.keywords) metadataScore += 5;
        if (item.summary) metadataScore += 5;
        if (item.source_url) metadataScore += 5;
        score += metadataScore;

        // 媒体内容 (10分)
        if (item.image_url) {
            score += 10;
        }

        // 时效性 (5分)
        if (item.publishedAt) {
            const publishDate = new Date(item.publishedAt);
            const now = new Date();
            const daysDiff = (now - publishDate) / (1000 * 60 * 60 * 24);
            
            if (daysDiff <= 1) {
                score += 5;
            } else if (daysDiff <= 7) {
                score += 3;
            } else if (daysDiff <= 30) {
                score += 1;
            }
        }

        return Math.min(100, Math.max(0, score));
    }

    /**
     * 验证标准化后的数据
     * @param {Object} item - 标准化后的数据
     * @returns {Object} 验证结果
     */
    validateStandardizedData(item) {
        const errors = [];

        // 再次检查必需字段
        if (!item.title || item.title.length === 0) {
            errors.push('标准化后标题为空');
        }

        if (!item.content || item.content.length === 0) {
            errors.push('标准化后内容为空');
        }

        // 检查字段长度限制
        if (item.title.length > this.config.maxTitleLength) {
            errors.push('标准化后标题仍然过长');
        }

        if (item.content.length > this.config.maxContentLength) {
            errors.push('标准化后内容仍然过长');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 缓存内容用于去重
     * @param {Object} item - 数据项
     */
    cacheContent(item) {
        const contentHash = this.generateContentHash(item);
        
        // 缓存内容哈希
        this.contentCache.set(contentHash, {
            title: item.title,
            source: item.source,
            timestamp: Date.now()
        });

        // 缓存标题
        this.titleCache.set(item.title, {
            hash: contentHash,
            timestamp: Date.now()
        });

        // 限制缓存大小
        if (this.contentCache.size > 1000) {
            this.cleanupCache();
        }
    }

    /**
     * 清理过期缓存
     */
    cleanupCache() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24小时

        // 清理内容缓存
        for (const [key, data] of this.contentCache.entries()) {
            if (now - data.timestamp > maxAge) {
                this.contentCache.delete(key);
            }
        }

        // 清理标题缓存
        for (const [key, data] of this.titleCache.entries()) {
            if (now - data.timestamp > maxAge) {
                this.titleCache.delete(key);
            }
        }

        this.log('info', '缓存清理完成', {
            contentCacheSize: this.contentCache.size,
            titleCacheSize: this.titleCache.size
        });
    }

    /**
     * 批量验证和标准化
     * @param {Array} items - 数据项数组
     * @param {Object} options - 选项
     * @returns {Object} 批量处理结果
     */
    async batchValidateAndStandardize(items, options = {}) {
        const results = {
            valid: [],
            invalid: [],
            duplicates: [],
            lowQuality: [],
            errors: []
        };

        this.log('info', '开始批量验证', { totalItems: items.length });

        for (let i = 0; i < items.length; i++) {
            try {
                const result = await this.validateAndStandardize(items[i], options);
                
                if (result.isValid) {
                    results.valid.push(result.item);
                } else if (result.isDuplicate) {
                    results.duplicates.push({
                        originalItem: items[i],
                        duplicateInfo: result.duplicateInfo
                    });
                } else if (result.lowQuality) {
                    results.lowQuality.push({
                        originalItem: items[i],
                        qualityScore: result.qualityScore
                    });
                } else {
                    results.invalid.push({
                        originalItem: items[i],
                        errors: result.errors || [result.error]
                    });
                }
            } catch (error) {
                results.errors.push({
                    originalItem: items[i],
                    error: error.message
                });
            }
        }

        const summary = {
            total: items.length,
            valid: results.valid.length,
            invalid: results.invalid.length,
            duplicates: results.duplicates.length,
            lowQuality: results.lowQuality.length,
            errors: results.errors.length,
            validationRate: (results.valid.length / items.length * 100).toFixed(2) + '%'
        };

        this.log('info', '批量验证完成', summary);

        return {
            ...results,
            summary
        };
    }

    /**
     * URL格式验证
     * @param {string} url - URL字符串
     * @returns {boolean} 是否有效
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 日期格式验证
     * @param {string} dateStr - 日期字符串
     * @returns {boolean} 是否有效
     */
    isValidDate(dateStr) {
        try {
            const date = new Date(dateStr);
            return !isNaN(date.getTime());
        } catch (error) {
            return false;
        }
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
            validator: 'EnhancedDataValidator'
        };

        console.log(JSON.stringify(logEntry));
    }
}

module.exports = {
    EnhancedDataValidator
};

// n8n使用示例
if (typeof $input !== 'undefined') {
    const validator = new EnhancedDataValidator({
        minQualityScore: 60,
        enableSensitiveWordCheck: true,
        enableLogging: true
    });

    const inputItems = $input.all().map(item => item.json);
    const result = await validator.batchValidateAndStandardize(inputItems, {
        strictMode: false,
        enableQualityFilter: true
    });

    return result.valid.map(item => ({ json: item }));
}