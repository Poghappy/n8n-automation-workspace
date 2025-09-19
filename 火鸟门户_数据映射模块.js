/**
 * 火鸟门户数据映射模块
 * 负责将Firecrawl采集的新闻数据转换为符合火鸟门户API要求的格式
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-01-20
 */

class HuoNiaoDataMapper {
    constructor() {
        this.categoryMapping = {
            // 新闻分类映射
            '科技': 1,
            '财经': 2,
            '体育': 3,
            '娱乐': 4,
            '社会': 5,
            '国际': 6,
            '军事': 7,
            '教育': 8,
            '健康': 9,
            '汽车': 10,
            '房产': 11,
            '游戏': 12,
            '时尚': 13,
            '美食': 14,
            '旅游': 15,
            '其他': 99
        };

        this.statusMapping = {
            'draft': 0,      // 草稿
            'published': 1,  // 已发布
            'pending': 2,    // 待审核
            'rejected': 3    // 已拒绝
        };

        this.priorityMapping = {
            'low': 1,
            'normal': 2,
            'high': 3,
            'urgent': 4
        };
    }

    /**
     * 映射Firecrawl搜索结果到火鸟门户新闻格式
     * @param {Object} firecrawlData - Firecrawl搜索返回的数据
     * @returns {Object} 符合火鸟门户API要求的新闻数据
     */
    mapFirecrawlToHuoNiao(firecrawlData) {
        try {
            if (!firecrawlData || !firecrawlData.data) {
                throw new Error('Invalid Firecrawl data structure');
            }

            const results = firecrawlData.data;
            const mappedNews = [];

            for (const item of results) {
                const mappedItem = this.mapSingleNewsItem(item);
                if (mappedItem) {
                    mappedNews.push(mappedItem);
                }
            }

            return {
                success: true,
                count: mappedNews.length,
                data: mappedNews,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('数据映射错误:', error);
            return {
                success: false,
                error: error.message,
                data: [],
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 映射单个新闻项目
     * @param {Object} item - 单个Firecrawl搜索结果
     * @returns {Object|null} 映射后的新闻数据
     */
    mapSingleNewsItem(item) {
        try {
            // 提取基本信息
            const title = this.extractTitle(item);
            const content = this.extractContent(item);
            const url = this.extractUrl(item);
            const publishTime = this.extractPublishTime(item);
            const category = this.extractCategory(item);
            const tags = this.extractTags(item);
            const summary = this.extractSummary(item, content);
            const images = this.extractImages(item);

            // 验证必填字段
            if (!title || !content) {
                console.warn('跳过无效新闻项目 - 缺少标题或内容:', { title, hasContent: !!content });
                return null;
            }

            // 构建火鸟门户新闻数据结构
            const huoniaoNews = {
                // 基本信息
                title: this.sanitizeTitle(title),
                content: this.sanitizeContent(content),
                summary: summary || this.generateSummary(content),
                
                // 分类和标签
                category_id: this.mapCategory(category),
                tags: this.formatTags(tags),
                
                // 发布信息
                status: this.statusMapping.published, // 默认发布状态
                priority: this.priorityMapping.normal, // 默认普通优先级
                publish_time: publishTime || new Date().toISOString(),
                
                // 来源信息
                source_url: url,
                source_name: this.extractSourceName(url),
                author: this.extractAuthor(item) || '系统采集',
                
                // 媒体内容
                images: this.formatImages(images),
                
                // 元数据
                meta_keywords: this.generateKeywords(title, content, tags),
                meta_description: summary || this.generateSummary(content),
                
                // 系统字段
                created_by: 'firecrawl_integration',
                updated_by: 'firecrawl_integration',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                
                // 扩展字段
                external_id: this.generateExternalId(url, title),
                crawl_timestamp: new Date().toISOString(),
                data_source: 'firecrawl'
            };

            return huoniaoNews;

        } catch (error) {
            console.error('单个新闻项目映射错误:', error, item);
            return null;
        }
    }

    /**
     * 提取标题
     */
    extractTitle(item) {
        return item.title || 
               item.metadata?.title || 
               item.extract?.title ||
               this.extractFromContent(item.markdown || item.content, /^#\s+(.+)$/m) ||
               '';
    }

    /**
     * 提取内容
     */
    extractContent(item) {
        return item.markdown || 
               item.content || 
               item.extract?.content ||
               item.html ||
               '';
    }

    /**
     * 提取URL
     */
    extractUrl(item) {
        return item.url || 
               item.metadata?.sourceURL || 
               item.sourceURL ||
               '';
    }

    /**
     * 提取发布时间
     */
    extractPublishTime(item) {
        const timeStr = item.metadata?.publishedTime || 
                       item.publishedTime ||
                       item.date ||
                       item.metadata?.date;
        
        if (timeStr) {
            const date = new Date(timeStr);
            return isNaN(date.getTime()) ? null : date.toISOString();
        }
        return null;
    }

    /**
     * 提取分类
     */
    extractCategory(item) {
        return item.metadata?.category || 
               item.category ||
               item.section ||
               this.inferCategoryFromUrl(item.url) ||
               this.inferCategoryFromContent(item.title, item.content);
    }

    /**
     * 提取标签
     */
    extractTags(item) {
        const tags = [];
        
        if (item.metadata?.tags) {
            tags.push(...(Array.isArray(item.metadata.tags) ? item.metadata.tags : [item.metadata.tags]));
        }
        
        if (item.tags) {
            tags.push(...(Array.isArray(item.tags) ? item.tags : [item.tags]));
        }

        // 从内容中提取关键词作为标签
        const contentTags = this.extractKeywordsFromContent(item.title, item.content);
        tags.push(...contentTags);

        return [...new Set(tags)]; // 去重
    }

    /**
     * 提取摘要
     */
    extractSummary(item, content) {
        return item.metadata?.description || 
               item.description ||
               item.summary ||
               this.generateSummary(content);
    }

    /**
     * 提取图片
     */
    extractImages(item) {
        const images = [];
        
        if (item.metadata?.image) {
            images.push(item.metadata.image);
        }
        
        if (item.images && Array.isArray(item.images)) {
            images.push(...item.images);
        }

        // 从内容中提取图片URL
        const contentImages = this.extractImagesFromContent(item.markdown || item.content);
        images.push(...contentImages);

        return [...new Set(images)]; // 去重
    }

    /**
     * 提取作者
     */
    extractAuthor(item) {
        return item.metadata?.author || 
               item.author ||
               item.byline ||
               null;
    }

    /**
     * 映射分类
     */
    mapCategory(category) {
        if (!category) return this.categoryMapping['其他'];
        
        const normalizedCategory = category.toLowerCase().trim();
        
        // 直接匹配
        for (const [key, value] of Object.entries(this.categoryMapping)) {
            if (key.toLowerCase() === normalizedCategory) {
                return value;
            }
        }

        // 模糊匹配
        for (const [key, value] of Object.entries(this.categoryMapping)) {
            if (normalizedCategory.includes(key.toLowerCase()) || 
                key.toLowerCase().includes(normalizedCategory)) {
                return value;
            }
        }

        return this.categoryMapping['其他'];
    }

    /**
     * 格式化标签
     */
    formatTags(tags) {
        if (!Array.isArray(tags)) return [];
        
        return tags
            .filter(tag => tag && typeof tag === 'string')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0 && tag.length <= 20)
            .slice(0, 10); // 限制标签数量
    }

    /**
     * 格式化图片
     */
    formatImages(images) {
        if (!Array.isArray(images)) return [];
        
        return images
            .filter(img => img && typeof img === 'string')
            .filter(img => this.isValidImageUrl(img))
            .slice(0, 5); // 限制图片数量
    }

    /**
     * 生成摘要
     */
    generateSummary(content, maxLength = 200) {
        if (!content) return '';
        
        // 清理markdown和HTML标记
        const cleanContent = content
            .replace(/[#*`_\[\]()]/g, '')
            .replace(/<[^>]*>/g, '')
            .replace(/\n+/g, ' ')
            .trim();

        if (cleanContent.length <= maxLength) {
            return cleanContent;
        }

        // 在句号处截断
        const sentences = cleanContent.split(/[。！？.!?]/);
        let summary = '';
        
        for (const sentence of sentences) {
            if (summary.length + sentence.length <= maxLength - 3) {
                summary += sentence + '。';
            } else {
                break;
            }
        }

        return summary || cleanContent.substring(0, maxLength - 3) + '...';
    }

    /**
     * 生成关键词
     */
    generateKeywords(title, content, tags) {
        const keywords = new Set();
        
        // 添加标签
        if (Array.isArray(tags)) {
            tags.forEach(tag => keywords.add(tag));
        }

        // 从标题提取关键词
        const titleKeywords = this.extractKeywordsFromText(title);
        titleKeywords.forEach(keyword => keywords.add(keyword));

        // 从内容提取关键词（限制数量）
        const contentKeywords = this.extractKeywordsFromText(content).slice(0, 5);
        contentKeywords.forEach(keyword => keywords.add(keyword));

        return Array.from(keywords).slice(0, 10).join(',');
    }

    /**
     * 从文本提取关键词
     */
    extractKeywordsFromText(text) {
        if (!text) return [];
        
        // 简单的中文关键词提取
        const keywords = [];
        const commonWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
        
        // 提取2-4字的词组
        const matches = text.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
        
        for (const match of matches) {
            if (!commonWords.includes(match) && match.length >= 2) {
                keywords.push(match);
            }
        }

        return [...new Set(keywords)].slice(0, 10);
    }

    /**
     * 从内容提取关键词
     */
    extractKeywordsFromContent(title, content) {
        const keywords = [];
        
        if (title) {
            keywords.push(...this.extractKeywordsFromText(title));
        }
        
        if (content) {
            keywords.push(...this.extractKeywordsFromText(content).slice(0, 5));
        }

        return [...new Set(keywords)].slice(0, 8);
    }

    /**
     * 从内容提取图片
     */
    extractImagesFromContent(content) {
        if (!content) return [];
        
        const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+\.(jpg|jpeg|png|gif|webp))\)/gi;
        const matches = content.match(imageRegex) || [];
        
        return matches.map(match => {
            const urlMatch = match.match(/\((https?:\/\/[^\s)]+)\)/);
            return urlMatch ? urlMatch[1] : null;
        }).filter(Boolean);
    }

    /**
     * 从URL推断分类
     */
    inferCategoryFromUrl(url) {
        if (!url) return null;
        
        const categoryKeywords = {
            '科技': ['tech', 'technology', 'keji', 'it', 'digital'],
            '财经': ['finance', 'money', 'caijing', 'business', 'economy'],
            '体育': ['sports', 'tiyu', 'football', 'basketball'],
            '娱乐': ['entertainment', 'yule', 'movie', 'star'],
            '社会': ['society', 'shehui', 'news', 'social'],
            '国际': ['world', 'international', 'guoji', 'global'],
            '军事': ['military', 'junshi', 'defense'],
            '教育': ['education', 'jiaoyu', 'school', 'university'],
            '健康': ['health', 'jiankang', 'medical', 'medicine'],
            '汽车': ['auto', 'car', 'qiche', 'vehicle'],
            '房产': ['house', 'fangchan', 'real-estate', 'property'],
            '游戏': ['game', 'youxi', 'gaming'],
            '时尚': ['fashion', 'shishang', 'style'],
            '美食': ['food', 'meishi', 'cooking'],
            '旅游': ['travel', 'lvyou', 'tourism']
        };

        const lowerUrl = url.toLowerCase();
        
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            for (const keyword of keywords) {
                if (lowerUrl.includes(keyword)) {
                    return category;
                }
            }
        }

        return null;
    }

    /**
     * 从内容推断分类
     */
    inferCategoryFromContent(title, content) {
        const text = (title + ' ' + (content || '')).toLowerCase();
        
        const categoryKeywords = {
            '科技': ['科技', '技术', '互联网', 'AI', '人工智能', '区块链', '5G', '芯片'],
            '财经': ['财经', '经济', '股票', '投资', '金融', '银行', '基金', '债券'],
            '体育': ['体育', '足球', '篮球', '奥运', '比赛', '运动员', '联赛'],
            '娱乐': ['娱乐', '明星', '电影', '电视剧', '音乐', '综艺', '演员'],
            '社会': ['社会', '民生', '公益', '法律', '犯罪', '事故'],
            '国际': ['国际', '外交', '全球', '世界', '国外', '海外'],
            '军事': ['军事', '国防', '武器', '军队', '战争', '安全'],
            '教育': ['教育', '学校', '大学', '考试', '学生', '老师'],
            '健康': ['健康', '医疗', '医院', '疾病', '药物', '养生'],
            '汽车': ['汽车', '车辆', '驾驶', '交通', '新能源车'],
            '房产': ['房产', '房价', '楼市', '买房', '租房', '地产'],
            '游戏': ['游戏', '电竞', '手游', '网游', '玩家'],
            '时尚': ['时尚', '美容', '化妆', '服装', '潮流'],
            '美食': ['美食', '餐厅', '菜谱', '烹饪', '食物'],
            '旅游': ['旅游', '景点', '酒店', '度假', '出行']
        };

        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    return category;
                }
            }
        }

        return null;
    }

    /**
     * 清理标题
     */
    sanitizeTitle(title) {
        return title
            .replace(/[<>]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 100);
    }

    /**
     * 清理内容
     */
    sanitizeContent(content) {
        return content
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<style[^>]*>.*?<\/style>/gi, '')
            .trim();
    }

    /**
     * 提取来源名称
     */
    extractSourceName(url) {
        if (!url) return '未知来源';
        
        try {
            const domain = new URL(url).hostname;
            return domain.replace(/^www\./, '');
        } catch {
            return '未知来源';
        }
    }

    /**
     * 生成外部ID
     */
    generateExternalId(url, title) {
        const content = (url || '') + (title || '');
        return this.simpleHash(content);
    }

    /**
     * 简单哈希函数
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * 验证图片URL
     */
    isValidImageUrl(url) {
        if (!url || typeof url !== 'string') return false;
        
        try {
            new URL(url);
            return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
        } catch {
            return false;
        }
    }

    /**
     * 从内容中提取文本
     */
    extractFromContent(content, regex) {
        if (!content || !regex) return null;
        
        const match = content.match(regex);
        return match ? match[1] : null;
    }

    /**
     * 验证映射结果
     */
    validateMappedData(data) {
        const errors = [];
        
        if (!data.title || data.title.length === 0) {
            errors.push('标题不能为空');
        }
        
        if (!data.content || data.content.length === 0) {
            errors.push('内容不能为空');
        }
        
        if (data.title && data.title.length > 100) {
            errors.push('标题长度不能超过100字符');
        }
        
        if (!data.category_id || !Object.values(this.categoryMapping).includes(data.category_id)) {
            errors.push('无效的分类ID');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 批量映射数据
     */
    batchMapData(firecrawlResults) {
        const results = {
            success: [],
            failed: [],
            total: 0,
            successCount: 0,
            failedCount: 0
        };

        if (!Array.isArray(firecrawlResults)) {
            firecrawlResults = [firecrawlResults];
        }

        for (const item of firecrawlResults) {
            results.total++;
            
            try {
                const mapped = this.mapFirecrawlToHuoNiao(item);
                
                if (mapped.success && mapped.data.length > 0) {
                    results.success.push(...mapped.data);
                    results.successCount += mapped.data.length;
                } else {
                    results.failed.push({
                        item: item,
                        error: mapped.error || '映射失败'
                    });
                    results.failedCount++;
                }
            } catch (error) {
                results.failed.push({
                    item: item,
                    error: error.message
                });
                results.failedCount++;
            }
        }

        return results;
    }
}

// N8N集成代码
class N8NHuoNiaoDataMapper {
    constructor() {
        this.mapper = new HuoNiaoDataMapper();
    }

    /**
     * N8N节点执行函数
     */
    async execute(items) {
        const results = [];
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            try {
                // 获取Firecrawl数据
                const firecrawlData = item.json;
                
                // 执行数据映射
                const mappedResult = this.mapper.mapFirecrawlToHuoNiao(firecrawlData);
                
                if (mappedResult.success) {
                    // 为每个映射成功的新闻项目创建一个输出项
                    for (const newsItem of mappedResult.data) {
                        results.push({
                            json: {
                                ...newsItem,
                                originalData: firecrawlData,
                                mappingTimestamp: new Date().toISOString(),
                                mappingSuccess: true
                            }
                        });
                    }
                } else {
                    // 映射失败，输出错误信息
                    results.push({
                        json: {
                            error: mappedResult.error,
                            originalData: firecrawlData,
                            mappingTimestamp: new Date().toISOString(),
                            mappingSuccess: false
                        }
                    });
                }
                
            } catch (error) {
                console.error('N8N数据映射执行错误:', error);
                results.push({
                    json: {
                        error: error.message,
                        originalData: item.json,
                        mappingTimestamp: new Date().toISOString(),
                        mappingSuccess: false
                    }
                });
            }
        }
        
        return results;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HuoNiaoDataMapper,
        N8NHuoNiaoDataMapper
    };
}

// 全局导出（用于N8N环境）
if (typeof global !== 'undefined') {
    global.HuoNiaoDataMapper = HuoNiaoDataMapper;
    global.N8NHuoNiaoDataMapper = N8NHuoNiaoDataMapper;
}