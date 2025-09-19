/**
 * 火鸟门户新闻数据集成处理器
 * 
 * 整合Firecrawl新闻采集数据与火鸟门户API写入功能
 * 基于增强版内容处理器和API集成模块
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-01-22
 */

const crypto = require('crypto');
const axios = require('axios');

/**
 * 火鸟门户新闻数据集成处理器
 * 专为N8N工作流优化的完整数据处理和写入解决方案
 */
class HuoNiaoNewsIntegrationProcessor {
    constructor(config = {}) {
        // 火鸟门户API配置
        this.apiConfig = {
            baseUrl: config.baseUrl || 'https://hawaiihub.net/include/ajax.php',
            sessionId: config.sessionId || '1ru3hf75ah15qm2ckm1en18lij',
            service: 'article',
            timeout: config.timeout || 30000,
            retryCount: config.retryCount || 3,
            retryDelay: config.retryDelay || 2000
        };

        // 内容处理配置
        this.processingConfig = {
            minContentLength: config.minContentLength || 100,
            maxContentLength: config.maxContentLength || 5000,
            minTitleLength: config.minTitleLength || 5,
            maxTitleLength: config.maxTitleLength || 60,
            qualityThreshold: config.qualityThreshold || 70,
            enableContentOptimization: config.enableContentOptimization !== false,
            enableDuplicateDetection: config.enableDuplicateDetection !== false,
            enableCategorization: config.enableCategorization !== false
        };

        // 数据映射配置
        this.mappingConfig = {
            defaultCategory: config.defaultCategory || 1, // 默认分类ID
            defaultAuthor: config.defaultAuthor || 'Firecrawl采集器',
            defaultSource: config.defaultSource || 'Firecrawl',
            enableAutoKeywords: config.enableAutoKeywords !== false,
            enableAutoSummary: config.enableAutoSummary !== false
        };

        // 内部状态
        this.processedArticles = new Map();
        this.categoryMapping = new Map();
        this.duplicateCache = new Set();
        
        // 统计信息
        this.stats = {
            processed: 0,
            published: 0,
            rejected: 0,
            duplicates: 0,
            errors: 0
        };

        // 初始化
        this.initializeCategoryMapping();
        this.initializeContentPatterns();
    }

    /**
     * 初始化分类映射
     */
    initializeCategoryMapping() {
        this.categoryMapping.set('科技', 1);
        this.categoryMapping.set('财经', 2);
        this.categoryMapping.set('体育', 3);
        this.categoryMapping.set('娱乐', 4);
        this.categoryMapping.set('社会', 5);
        this.categoryMapping.set('国际', 6);
        this.categoryMapping.set('军事', 7);
        this.categoryMapping.set('教育', 8);
        this.categoryMapping.set('健康', 9);
        this.categoryMapping.set('汽车', 10);
        this.categoryMapping.set('房产', 11);
        this.categoryMapping.set('旅游', 12);
        this.categoryMapping.set('美食', 13);
        this.categoryMapping.set('时尚', 14);
        this.categoryMapping.set('游戏', 15);
    }

    /**
     * 初始化内容模式
     */
    initializeContentPatterns() {
        this.contentPatterns = {
            // 科技关键词
            tech: ['AI', '人工智能', '机器学习', '区块链', '5G', '物联网', '云计算', '大数据', '芯片', '半导体'],
            // 财经关键词
            finance: ['股票', '基金', '投资', '金融', '银行', '保险', '房价', 'GDP', '通胀', '货币'],
            // 体育关键词
            sports: ['足球', '篮球', '网球', '游泳', '田径', '奥运', '世界杯', 'NBA', '中超', '比赛'],
            // 娱乐关键词
            entertainment: ['电影', '电视剧', '明星', '音乐', '演唱会', '综艺', '娱乐圈', '票房', '导演', '演员']
        };
    }

    /**
     * 处理Firecrawl采集的新闻数据
     * @param {Object} firecrawlData - Firecrawl采集的原始数据
     * @param {Object} options - 处理选项
     * @returns {Object} 处理结果
     */
    async processFirecrawlNews(firecrawlData, options = {}) {
        try {
            this.log('info', '开始处理Firecrawl新闻数据', { 
                dataType: typeof firecrawlData,
                hasContent: !!firecrawlData?.content 
            });

            // 1. 数据验证和标准化
            const validatedData = await this.validateAndNormalizeData(firecrawlData);
            if (!validatedData.isValid) {
                this.stats.rejected++;
                return {
                    success: false,
                    error: 'Data validation failed',
                    details: validatedData.errors
                };
            }

            // 2. 重复检测
            if (this.processingConfig.enableDuplicateDetection) {
                const isDuplicate = await this.checkDuplicate(validatedData.data);
                if (isDuplicate) {
                    this.stats.duplicates++;
                    return {
                        success: false,
                        error: 'Duplicate content detected',
                        duplicate: true
                    };
                }
            }

            // 3. 内容质量评估
            const qualityScore = this.assessContentQuality(validatedData.data);
            if (qualityScore < this.processingConfig.qualityThreshold) {
                this.stats.rejected++;
                return {
                    success: false,
                    error: 'Content quality below threshold',
                    qualityScore: qualityScore
                };
            }

            // 4. 内容优化和增强
            const optimizedData = await this.optimizeContent(validatedData.data, options);

            // 5. 映射为火鸟门户格式
            const mappedData = this.mapToHuoNiaoFormat(optimizedData);

            // 6. 发布到火鸟门户
            const publishResult = await this.publishToHuoNiao(mappedData, options);

            if (publishResult.success) {
                this.stats.published++;
                this.processedArticles.set(mappedData.title, {
                    id: publishResult.articleId,
                    publishTime: new Date(),
                    originalData: firecrawlData
                });
            } else {
                this.stats.errors++;
            }

            this.stats.processed++;
            
            return {
                success: publishResult.success,
                articleId: publishResult.articleId,
                qualityScore: qualityScore,
                optimizedData: optimizedData,
                mappedData: mappedData,
                publishResult: publishResult
            };

        } catch (error) {
            this.stats.errors++;
            this.log('error', '处理Firecrawl新闻数据时发生错误', { error: error.message });
            return {
                success: false,
                error: error.message,
                stack: error.stack
            };
        }
    }

    /**
     * 验证和标准化数据
     * @param {Object} data - 原始数据
     * @returns {Object} 验证结果
     */
    async validateAndNormalizeData(data) {
        const errors = [];
        const normalizedData = {};

        try {
            // 提取标题
            if (data.title) {
                normalizedData.title = this.cleanText(data.title);
            } else if (data.metadata?.title) {
                normalizedData.title = this.cleanText(data.metadata.title);
            } else {
                errors.push('缺少标题');
            }

            // 验证标题长度
            if (normalizedData.title) {
                if (normalizedData.title.length < this.processingConfig.minTitleLength) {
                    errors.push(`标题过短，最少需要${this.processingConfig.minTitleLength}个字符`);
                }
                if (normalizedData.title.length > this.processingConfig.maxTitleLength) {
                    normalizedData.title = normalizedData.title.substring(0, this.processingConfig.maxTitleLength) + '...';
                }
            }

            // 提取内容
            if (data.content) {
                normalizedData.content = this.cleanHtmlContent(data.content);
            } else if (data.markdown) {
                normalizedData.content = this.markdownToHtml(data.markdown);
            } else {
                errors.push('缺少内容');
            }

            // 验证内容长度
            if (normalizedData.content) {
                const textContent = this.stripHtml(normalizedData.content);
                if (textContent.length < this.processingConfig.minContentLength) {
                    errors.push(`内容过短，最少需要${this.processingConfig.minContentLength}个字符`);
                }
                if (textContent.length > this.processingConfig.maxContentLength) {
                    normalizedData.content = this.truncateContent(normalizedData.content, this.processingConfig.maxContentLength);
                }
            }

            // 提取其他元数据
            normalizedData.url = data.url || data.sourceURL || '';
            normalizedData.publishDate = data.publishDate || data.metadata?.publishDate || new Date().toISOString();
            normalizedData.author = data.author || data.metadata?.author || this.mappingConfig.defaultAuthor;
            normalizedData.source = data.source || data.metadata?.source || this.mappingConfig.defaultSource;
            normalizedData.description = data.description || data.metadata?.description || '';
            normalizedData.keywords = data.keywords || data.metadata?.keywords || [];
            normalizedData.images = data.images || [];

            return {
                isValid: errors.length === 0,
                errors: errors,
                data: normalizedData
            };

        } catch (error) {
            return {
                isValid: false,
                errors: [`数据验证过程中发生错误: ${error.message}`],
                data: null
            };
        }
    }

    /**
     * 检查重复内容
     * @param {Object} data - 标准化后的数据
     * @returns {boolean} 是否重复
     */
    async checkDuplicate(data) {
        try {
            // 生成内容指纹
            const contentHash = this.generateContentHash(data);
            
            if (this.duplicateCache.has(contentHash)) {
                return true;
            }

            // 检查标题相似度
            const titleSimilarity = await this.checkTitleSimilarity(data.title);
            if (titleSimilarity > 0.85) {
                return true;
            }

            // 添加到缓存
            this.duplicateCache.add(contentHash);
            
            return false;

        } catch (error) {
            this.log('error', '重复检测时发生错误', { error: error.message });
            return false;
        }
    }

    /**
     * 生成内容哈希
     * @param {Object} data - 数据对象
     * @returns {string} 哈希值
     */
    generateContentHash(data) {
        const content = `${data.title}|${this.stripHtml(data.content)}`;
        return crypto.createHash('md5').update(content).digest('hex');
    }

    /**
     * 检查标题相似度
     * @param {string} title - 标题
     * @returns {number} 最高相似度
     */
    async checkTitleSimilarity(title) {
        let maxSimilarity = 0;
        
        for (const [existingTitle] of this.processedArticles) {
            const similarity = this.calculateStringSimilarity(title, existingTitle);
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
            }
        }
        
        return maxSimilarity;
    }

    /**
     * 计算字符串相似度
     * @param {string} str1 - 字符串1
     * @param {string} str2 - 字符串2
     * @returns {number} 相似度 (0-1)
     */
    calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) {
            return 1.0;
        }
        
        const editDistance = this.calculateEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * 计算编辑距离
     * @param {string} str1 - 字符串1
     * @param {string} str2 - 字符串2
     * @returns {number} 编辑距离
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
     * 评估内容质量
     * @param {Object} data - 数据对象
     * @returns {number} 质量分数 (0-100)
     */
    assessContentQuality(data) {
        let score = 0;
        
        // 标题质量 (25分)
        const titleScore = this.assessTitleQuality(data.title);
        score += titleScore * 0.25;
        
        // 内容质量 (40分)
        const contentScore = this.assessTextContentQuality(data.content);
        score += contentScore * 0.40;
        
        // 元数据完整性 (20分)
        const metadataScore = this.assessMetadataCompleteness(data);
        score += metadataScore * 0.20;
        
        // 结构化程度 (15分)
        const structureScore = this.assessContentStructure(data.content);
        score += structureScore * 0.15;
        
        return Math.round(score);
    }

    /**
     * 评估标题质量
     * @param {string} title - 标题
     * @returns {number} 质量分数 (0-100)
     */
    assessTitleQuality(title) {
        if (!title) return 0;
        
        let score = 50; // 基础分
        
        // 长度适中
        if (title.length >= 10 && title.length <= 50) {
            score += 20;
        } else if (title.length >= 5 && title.length <= 60) {
            score += 10;
        }
        
        // 包含关键信息
        if (/[\u4e00-\u9fa5]/.test(title)) { // 包含中文
            score += 10;
        }
        
        // 避免全大写或特殊字符过多
        if (!/^[A-Z\s]+$/.test(title) && !/[!@#$%^&*()]{3,}/.test(title)) {
            score += 10;
        }
        
        // 语义完整性
        if (title.includes('：') || title.includes('，') || title.includes('。')) {
            score += 10;
        }
        
        return Math.min(100, score);
    }

    /**
     * 评估文本内容质量
     * @param {string} content - 内容
     * @returns {number} 质量分数 (0-100)
     */
    assessTextContentQuality(content) {
        if (!content) return 0;
        
        const textContent = this.stripHtml(content);
        let score = 30; // 基础分
        
        // 长度适中
        if (textContent.length >= 200 && textContent.length <= 3000) {
            score += 25;
        } else if (textContent.length >= 100 && textContent.length <= 5000) {
            score += 15;
        }
        
        // 段落结构
        const paragraphs = content.split(/\n\s*\n|\<\/p\>|\<br\s*\/?\>/i);
        if (paragraphs.length >= 2 && paragraphs.length <= 10) {
            score += 20;
        }
        
        // 句子结构
        const sentences = textContent.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
        if (sentences.length >= 3) {
            score += 15;
        }
        
        // 信息密度
        const words = textContent.split(/\s+/).filter(w => w.length > 0);
        if (words.length >= 50) {
            score += 10;
        }
        
        return Math.min(100, score);
    }

    /**
     * 评估元数据完整性
     * @param {Object} data - 数据对象
     * @returns {number} 完整性分数 (0-100)
     */
    assessMetadataCompleteness(data) {
        let score = 0;
        const fields = ['title', 'content', 'author', 'source', 'publishDate', 'description'];
        
        fields.forEach(field => {
            if (data[field] && data[field].toString().trim().length > 0) {
                score += 100 / fields.length;
            }
        });
        
        // 额外加分项
        if (data.keywords && data.keywords.length > 0) {
            score += 10;
        }
        if (data.images && data.images.length > 0) {
            score += 10;
        }
        
        return Math.min(100, score);
    }

    /**
     * 评估内容结构
     * @param {string} content - 内容
     * @returns {number} 结构分数 (0-100)
     */
    assessContentStructure(content) {
        if (!content) return 0;
        
        let score = 40; // 基础分
        
        // HTML标签结构
        if (/<h[1-6]>/i.test(content)) score += 15; // 有标题
        if (/<p>/i.test(content)) score += 15; // 有段落
        if (/<ul>|<ol>|<li>/i.test(content)) score += 10; // 有列表
        if (/<img/i.test(content)) score += 10; // 有图片
        if (/<a/i.test(content)) score += 10; // 有链接
        
        return Math.min(100, score);
    }

    /**
     * 优化内容
     * @param {Object} data - 数据对象
     * @param {Object} options - 选项
     * @returns {Object} 优化后的数据
     */
    async optimizeContent(data, options = {}) {
        const optimized = { ...data };
        
        try {
            // 自动生成关键词
            if (this.mappingConfig.enableAutoKeywords && (!optimized.keywords || optimized.keywords.length === 0)) {
                optimized.keywords = this.generateKeywords(optimized.title, optimized.content);
            }
            
            // 自动生成摘要
            if (this.mappingConfig.enableAutoSummary && !optimized.description) {
                optimized.description = this.generateSummary(optimized.content);
            }
            
            // 自动分类
            if (this.processingConfig.enableCategorization) {
                optimized.category = this.categorizeContent(optimized);
            }
            
            // 内容清理和格式化
            optimized.content = this.formatContentForPublish(optimized.content);
            
            return optimized;
            
        } catch (error) {
            this.log('error', '内容优化时发生错误', { error: error.message });
            return data;
        }
    }

    /**
     * 生成关键词
     * @param {string} title - 标题
     * @param {string} content - 内容
     * @returns {Array} 关键词数组
     */
    generateKeywords(title, content) {
        const text = `${title} ${this.stripHtml(content)}`;
        const words = text.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]{3,}/g) || [];
        
        // 词频统计
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        // 排序并取前10个
        const keywords = Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
            
        return keywords;
    }

    /**
     * 生成摘要
     * @param {string} content - 内容
     * @returns {string} 摘要
     */
    generateSummary(content) {
        const textContent = this.stripHtml(content);
        const sentences = textContent.split(/[。！？.!?]/).filter(s => s.trim().length > 10);
        
        if (sentences.length === 0) {
            return textContent.substring(0, 100) + '...';
        }
        
        // 取前两句作为摘要
        const summary = sentences.slice(0, 2).join('。') + '。';
        return summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
    }

    /**
     * 内容分类
     * @param {Object} data - 数据对象
     * @returns {number} 分类ID
     */
    categorizeContent(data) {
        const text = `${data.title} ${this.stripHtml(data.content)}`.toLowerCase();
        
        // 检查各类别关键词
        for (const [category, keywords] of Object.entries(this.contentPatterns)) {
            const matchCount = keywords.filter(keyword => 
                text.includes(keyword.toLowerCase())
            ).length;
            
            if (matchCount >= 2) {
                switch (category) {
                    case 'tech': return this.categoryMapping.get('科技');
                    case 'finance': return this.categoryMapping.get('财经');
                    case 'sports': return this.categoryMapping.get('体育');
                    case 'entertainment': return this.categoryMapping.get('娱乐');
                }
            }
        }
        
        return this.mappingConfig.defaultCategory;
    }

    /**
     * 格式化内容用于发布
     * @param {string} content - 原始内容
     * @returns {string} 格式化后的内容
     */
    formatContentForPublish(content) {
        if (!content) return '';
        
        // 清理多余的空白
        content = content.replace(/\s+/g, ' ').trim();
        
        // 确保段落标签
        if (!/<p>/i.test(content)) {
            content = content.split('\n').map(line => 
                line.trim() ? `<p>${line.trim()}</p>` : ''
            ).join('');
        }
        
        // 清理危险标签
        content = content.replace(/<script[^>]*>.*?<\/script>/gi, '');
        content = content.replace(/<style[^>]*>.*?<\/style>/gi, '');
        content = content.replace(/on\w+="[^"]*"/gi, '');
        
        return content;
    }

    /**
     * 映射为火鸟门户格式
     * @param {Object} data - 优化后的数据
     * @returns {Object} 火鸟门户格式的数据
     */
    mapToHuoNiaoFormat(data) {
        return {
            title: data.title,
            typeid: data.category || this.mappingConfig.defaultCategory,
            body: data.content,
            writer: data.author || this.mappingConfig.defaultAuthor,
            source: data.source || this.mappingConfig.defaultSource,
            keywords: Array.isArray(data.keywords) ? data.keywords.join(',') : data.keywords || '',
            description: data.description || this.generateSummary(data.content),
            litpic: '', // 缩略图，如果有的话
            imglist: '', // 图集，如果有的话
            pubdate: Math.floor(new Date(data.publishDate).getTime() / 1000),
            sourceurl: data.url || ''
        };
    }

    /**
     * 发布到火鸟门户
     * @param {Object} articleData - 文章数据
     * @param {Object} options - 选项
     * @returns {Object} 发布结果
     */
    async publishToHuoNiao(articleData, options = {}) {
        try {
            this.log('info', '开始发布文章到火鸟门户', { title: articleData.title });
            
            const result = await this.makeApiRequest('put', articleData);
            
            if (result.state === 100) {
                this.log('info', '文章发布成功', { 
                    title: articleData.title,
                    articleId: result.info 
                });
                
                return {
                    success: true,
                    articleId: result.info,
                    message: '发布成功'
                };
            } else {
                this.log('error', '文章发布失败', { 
                    title: articleData.title,
                    error: result.info 
                });
                
                return {
                    success: false,
                    error: result.info || '发布失败',
                    code: result.state
                };
            }
            
        } catch (error) {
            this.log('error', '发布文章时发生错误', { 
                title: articleData.title,
                error: error.message 
            });
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 发起API请求
     * @param {string} action - 动作名
     * @param {Object} params - 参数
     * @returns {Object} API响应
     */
    async makeApiRequest(action, params = {}) {
        const url = new URL(this.apiConfig.baseUrl);
        url.searchParams.set('service', this.apiConfig.service);
        url.searchParams.set('action', action);

        const formData = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        const options = {
            method: 'POST',
            headers: {
                'Cookie': `PHPSESSID=${this.apiConfig.sessionId}`,
                'User-Agent': 'HuoNiao-News-Collector/1.0',
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData,
            timeout: this.apiConfig.timeout
        };

        let lastError;
        
        for (let i = 0; i < this.apiConfig.retryCount; i++) {
            try {
                this.log('info', `API请求 (尝试 ${i + 1}/${this.apiConfig.retryCount})`, {
                    url: url.toString(),
                    action: action
                });

                const response = await fetch(url.toString(), options);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                this.log('info', 'API响应', {
                    action: action,
                    state: data.state,
                    success: data.state === 100
                });

                return data;

            } catch (error) {
                lastError = error;
                this.log('error', `API请求失败 (尝试 ${i + 1}/${this.apiConfig.retryCount})`, { 
                    error: error.message 
                });
                
                if (i < this.apiConfig.retryCount - 1) {
                    await this.delay(this.apiConfig.retryDelay * (i + 1));
                }
            }
        }

        throw new Error(`API请求最终失败: ${lastError.message}`);
    }

    /**
     * 批量处理新闻数据
     * @param {Array} newsDataList - 新闻数据列表
     * @param {Object} options - 选项
     * @returns {Object} 批量处理结果
     */
    async batchProcessNews(newsDataList, options = {}) {
        const results = {
            total: newsDataList.length,
            successful: 0,
            failed: 0,
            duplicates: 0,
            details: []
        };

        for (let i = 0; i < newsDataList.length; i++) {
            const newsData = newsDataList[i];
            
            try {
                this.log('info', `处理第 ${i + 1}/${newsDataList.length} 条新闻`, {
                    title: newsData.title || '未知标题'
                });

                const result = await this.processFirecrawlNews(newsData, options);
                
                results.details.push({
                    index: i,
                    title: newsData.title || '未知标题',
                    result: result
                });

                if (result.success) {
                    results.successful++;
                } else if (result.duplicate) {
                    results.duplicates++;
                } else {
                    results.failed++;
                }

                // 添加延迟避免请求过于频繁
                if (i < newsDataList.length - 1) {
                    await this.delay(1000);
                }

            } catch (error) {
                results.failed++;
                results.details.push({
                    index: i,
                    title: newsData.title || '未知标题',
                    result: {
                        success: false,
                        error: error.message
                    }
                });
            }
        }

        return results;
    }

    /**
     * 获取处理统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            ...this.stats,
            successRate: this.stats.processed > 0 ? 
                Math.round((this.stats.published / this.stats.processed) * 100) : 0,
            duplicateRate: this.stats.processed > 0 ? 
                Math.round((this.stats.duplicates / this.stats.processed) * 100) : 0
        };
    }

    /**
     * 重置统计信息
     */
    resetStats() {
        this.stats = {
            processed: 0,
            published: 0,
            rejected: 0,
            duplicates: 0,
            errors: 0
        };
    }

    /**
     * 清理HTML标签
     * @param {string} html - HTML内容
     * @returns {string} 纯文本
     */
    stripHtml(html) {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    /**
     * 清理文本
     * @param {string} text - 原始文本
     * @returns {string} 清理后的文本
     */
    cleanText(text) {
        if (!text) return '';
        return text.replace(/\s+/g, ' ').trim();
    }

    /**
     * 清理HTML内容
     * @param {string} html - HTML内容
     * @returns {string} 清理后的HTML
     */
    cleanHtmlContent(html) {
        if (!html) return '';
        
        // 移除危险标签
        html = html.replace(/<script[^>]*>.*?<\/script>/gi, '');
        html = html.replace(/<style[^>]*>.*?<\/style>/gi, '');
        html = html.replace(/on\w+="[^"]*"/gi, '');
        
        // 清理多余空白
        html = html.replace(/\s+/g, ' ').trim();
        
        return html;
    }

    /**
     * Markdown转HTML
     * @param {string} markdown - Markdown内容
     * @returns {string} HTML内容
     */
    markdownToHtml(markdown) {
        if (!markdown) return '';
        
        // 简单的Markdown转换
        let html = markdown;
        
        // 标题
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // 粗体和斜体
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // 链接
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        
        // 段落
        html = html.split('\n\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
        
        return html;
    }

    /**
     * 截断内容
     * @param {string} content - 内容
     * @param {number} maxLength - 最大长度
     * @returns {string} 截断后的内容
     */
    truncateContent(content, maxLength) {
        const textContent = this.stripHtml(content);
        if (textContent.length <= maxLength) {
            return content;
        }
        
        const truncated = textContent.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        const finalText = lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
        
        return `<p>${finalText}...</p>`;
    }

    /**
     * 延迟函数
     * @param {number} ms - 毫秒数
     * @returns {Promise} Promise对象
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 日志记录
     * @param {string} level - 日志级别
     * @param {string} message - 消息
     * @param {Object} data - 附加数据
     */
    log(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...data
        };
        
        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, 
                   Object.keys(data).length > 0 ? data : '');
    }
}

// 导出模块
module.exports = {
    HuoNiaoNewsIntegrationProcessor
};

// N8N工作流集成
if (typeof $input !== 'undefined') {
    (async () => {
        try {
            // 创建处理器实例
            const processor = new HuoNiaoNewsIntegrationProcessor({
                baseUrl: 'https://hawaiihub.net/include/ajax.php',
                sessionId: '1ru3hf75ah15qm2ckm1en18lij',
                enableContentOptimization: true,
                enableDuplicateDetection: true,
                enableCategorization: true,
                qualityThreshold: 60
            });

            // 获取输入数据
            const inputData = $input.first().json;
            
            // 处理数据
            const result = await processor.processFirecrawlNews(inputData);
            
            // 返回结果
            return [{
                json: {
                    success: result.success,
                    articleId: result.articleId,
                    qualityScore: result.qualityScore,
                    error: result.error,
                    stats: processor.getStats(),
                    timestamp: new Date().toISOString()
                }
            }];
            
        } catch (error) {
            return [{
                json: {
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                }
            }];
        }
    })();
}