/**
 * 优化版内容处理器配置文件
 * 基于实际使用数据微调阈值并添加更多内容分类
 */

// 基于实际测试数据的阈值分析
const usageAnalysis = {
    // 实际测试中的质量分数分布
    qualityScores: [82, 82, 65, 71], // 平均75分
    // 实际测试中的相关性分数分布  
    relevanceScores: [0.68, 0.70, 0.54, 0.58], // 平均0.625
    // 成功率: 100%
    // 建议: 适当降低阈值以保持高通过率，同时确保质量
};

// 微调后的生产环境配置
const optimizedProductionConfig = {
    // AI服务配置
    aiApiKey: process.env.OPENAI_API_KEY || '',
    aiBaseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    aiModel: process.env.AI_MODEL || 'gpt-4',
    
    // 内容长度配置
    minContentLength: 80,  // 从100降到80，更灵活
    maxContentLength: 8000, // 从5000增到8000，支持长文章
    minTitleLength: 4,     // 从5降到4，更宽松
    maxTitleLength: 80,    // 从60增到80，支持长标题
    
    // 基于实际数据微调的阈值
    qualityThreshold: 55,        // 从60降到55，基于平均分75的数据
    relevanceThreshold: 0.45,    // 从0.5降到0.45，基于平均0.625的数据
    
    // 相似度检测配置（保持原有设置）
    titleSimilarityThreshold: 0.8,
    contentSimilarityThreshold: 0.85,
    semanticSimilarityThreshold: 0.75,
    
    // 功能开关
    enableSemanticAnalysis: true,
    enableContentStandardization: true,
    enableCache: true,
    enableLogging: true,
    
    // 性能配置
    cacheExpiry: 7200000, // 2小时，增加缓存时间
    
    // 批量处理配置
    batchSize: 8,         // 从5增到8，提高处理效率
    delayBetweenBatches: 800, // 从1000降到800，加快处理速度
    
    // 图片处理配置
    maxImageSize: 5 * 1024 * 1024, // 增加到5MB
    allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
    imageQuality: 85, // 提高图片质量
    
    // Notion集成配置
    notionIntegration: {
        defaultCityId: 1,
        enableComments: true,
        autoApproveThreshold: 75 // 从80降到75，基于实际数据
    }
};

// 扩展的内容分类系统
const expandedCategoryMapping = new Map([
    // 原有分类（优化关键词）
    ['科技', {
        id: 1,
        keywords: [
            // AI和机器学习
            'AI', '人工智能', '机器学习', '深度学习', '神经网络', '自然语言处理',
            'ChatGPT', 'GPT', 'OpenAI', 'Claude', 'Gemini', 'LLM', '大模型',
            // 科技公司和产品
            '科技', '技术', '创新', '数字化', '智能化', '自动化',
            '互联网', '物联网', '云计算', '大数据', '区块链', '元宇宙',
            // 硬件和基础设施
            '软件', '硬件', '芯片', '处理器', '算法', '编程', '代码',
            '5G', '6G', '量子计算', '虚拟现实', 'VR', '增强现实', 'AR',
            // 新兴技术
            '自动驾驶', '机器人', '无人机', '3D打印', '生物技术', '纳米技术'
        ]
    }],
    
    ['商业', {
        id: 2,
        keywords: [
            // 基础商业词汇
            '商业', '企业', '公司', '商务', '贸易', '业务', '市场',
            // 金融和投资
            '经济', '金融', '投资', '融资', '股票', '股市', '基金',
            '银行', '保险', '证券', '期货', '债券', '外汇',
            // 企业运营
            '营销', '销售', '管理', '战略', '品牌', '客户',
            '创业', '初创', 'IPO', '上市', '并购', '收购',
            // 电商和零售
            '电商', '零售', '批发', '供应链', '物流', '配送'
        ]
    }],
    
    // 新增分类
    ['人工智能', {
        id: 11,
        keywords: [
            'AI', '人工智能', '机器学习', '深度学习', '神经网络',
            'ChatGPT', 'GPT', 'OpenAI', 'Claude', 'Gemini', 'Bard',
            '大模型', 'LLM', '自然语言处理', 'NLP', '计算机视觉',
            '语音识别', '图像识别', '推荐系统', '智能助手',
            '自动驾驶', '智能制造', 'AI芯片', '算力', '训练数据'
        ]
    }],
    
    ['区块链', {
        id: 12,
        keywords: [
            '区块链', '比特币', '以太坊', '加密货币', '数字货币',
            'NFT', 'DeFi', 'Web3', '智能合约', '去中心化',
            '挖矿', '矿机', '钱包', '交易所', '代币',
            'DAO', '元宇宙', '虚拟资产', '数字藏品'
        ]
    }],
    
    ['互联网', {
        id: 13,
        keywords: [
            '互联网', '网络', '在线', '数字化', '平台',
            '社交媒体', '短视频', '直播', '电商', 'APP',
            '微信', '抖音', '快手', '小红书', '知乎',
            '腾讯', '阿里巴巴', '百度', '字节跳动', '美团'
        ]
    }],
    
    ['游戏', {
        id: 14,
        keywords: [
            '游戏', '电竞', '手游', '网游', '单机游戏',
            '游戏开发', '游戏引擎', 'Unity', 'Unreal',
            '电竞比赛', '游戏主播', '游戏直播',
            '任天堂', '索尼', '微软', 'Steam', '腾讯游戏'
        ]
    }],
    
    ['新能源', {
        id: 15,
        keywords: [
            '新能源', '电动车', '新能源汽车', '电池', '充电',
            '太阳能', '风能', '光伏', '储能', '氢能',
            '特斯拉', '比亚迪', '蔚来', '小鹏', '理想',
            '碳中和', '碳达峰', '绿色能源', '清洁能源'
        ]
    }],
    
    ['生物医药', {
        id: 16,
        keywords: [
            '生物医药', '制药', '新药', '临床试验', '药物研发',
            '基因治疗', '细胞治疗', '免疫治疗', '精准医疗',
            '生物技术', '医疗器械', '诊断', '疫苗',
            'mRNA', '抗体', '蛋白质', 'DNA', 'RNA'
        ]
    }],
    
    ['航空航天', {
        id: 17,
        keywords: [
            '航空航天', '火箭', '卫星', '太空', '宇航',
            '载人航天', '空间站', '探测器', '登月',
            'SpaceX', '蓝色起源', '波音', '空客',
            '商业航天', '太空旅游', '卫星互联网'
        ]
    }],
    
    ['环保', {
        id: 18,
        keywords: [
            '环保', '环境保护', '污染', '治理', '减排',
            '气候变化', '全球变暖', '碳排放', '环境监测',
            '可持续发展', '循环经济', '绿色发展',
            '生态保护', '节能减排', '清洁生产'
        ]
    }],
    
    ['房地产', {
        id: 19,
        keywords: [
            '房地产', '房价', '楼市', '住房', '房屋',
            '地产', '开发商', '物业', '租房', '买房',
            '土地', '建筑', '装修', '家居', '智能家居',
            '房贷', '公积金', '限购', '调控政策'
        ]
    }],
    
    ['文化娱乐', {
        id: 20,
        keywords: [
            '文化', '娱乐', '影视', '电影', '电视剧',
            '音乐', '演唱会', '综艺', '明星', '艺人',
            '文学', '出版', '动漫', '漫画', '小说',
            '博物馆', '展览', '艺术', '文创', 'IP'
        ]
    }],
    
    // 保留原有分类
    ['新闻', {
        id: 3,
        keywords: [
            '新闻', '资讯', '消息', '报道', '通讯',
            '时事', '社会', '民生', '公共', '社区',
            '政策', '法律', '法规', '条例', '规定',
            '事件', '事故', '突发', '紧急', '重要',
            '公告', '通知', '声明', '发布', '宣布'
        ]
    }],
    
    ['体育', {
        id: 4,
        keywords: [
            '体育', '运动', '足球', '篮球', '网球', '乒乓球',
            '游泳', '跑步', '健身', '比赛', '赛事',
            '奥运', '世界杯', '联赛', '冠军', '运动员',
            '体育场', '健身房', '马拉松', '极限运动'
        ]
    }],
    
    ['娱乐', {
        id: 5,
        keywords: [
            '娱乐', '明星', '电影', '电视', '音乐',
            '综艺', '演员', '导演', '歌手', '娱乐圈',
            '八卦', '红毯', '颁奖', '首映', '演出'
        ]
    }],
    
    ['健康', {
        id: 6,
        keywords: [
            '健康', '医疗', '医学', '医院', '诊所',
            '养生', '保健', '营养', '饮食', '运动',
            '疾病', '病症', '治疗', '药物', '疫苗',
            '心理', '精神', '康复', '护理', '急救'
        ]
    }],
    
    ['财经', {
        id: 7,
        keywords: [
            '财经', '金融', '股市', '基金', '债券',
            '外汇', '期货', '理财', '保险', '银行',
            '央行', '货币', '通胀', '经济指标'
        ]
    }],
    
    ['汽车', {
        id: 8,
        keywords: [
            '汽车', '车辆', '驾驶', '新车', '电动车',
            '燃油车', 'SUV', '轿车', '卡车', '摩托车',
            '交通', '驾照', '车展', '汽车制造'
        ]
    }],
    
    ['旅游', {
        id: 9,
        keywords: [
            '旅游', '旅行', '景点', '酒店', '机票',
            '度假', '出国', '国内游', '自由行', '跟团游',
            '攻略', '美食', '民宿', '签证'
        ]
    }],
    
    ['教育', {
        id: 10,
        keywords: [
            '教育', '学校', '学习', '考试', '培训',
            '课程', '教学', '老师', '学生', '大学',
            '中学', '小学', '在线教育', '知识', '技能'
        ]
    }]
]);

// 智能阈值配置（根据内容类型动态调整）
const dynamicThresholds = {
    // 高质量要求的分类
    highQuality: {
        categories: ['科技', '人工智能', '商业', '财经', '生物医药'],
        qualityThreshold: 65,
        relevanceThreshold: 0.6
    },
    
    // 中等质量要求的分类
    mediumQuality: {
        categories: ['新闻', '健康', '教育', '汽车', '房地产'],
        qualityThreshold: 55,
        relevanceThreshold: 0.5
    },
    
    // 较低质量要求的分类
    lowQuality: {
        categories: ['娱乐', '体育', '旅游', '文化娱乐', '游戏'],
        qualityThreshold: 45,
        relevanceThreshold: 0.4
    }
};

// 内容长度要求（根据分类调整）
const categoryLengthRequirements = {
    // 长文章类型
    longForm: {
        categories: ['科技', '商业', '健康', '教育', '生物医药'],
        minContentLength: 200,
        maxContentLength: 10000
    },
    
    // 中等长度文章
    mediumForm: {
        categories: ['新闻', '财经', '汽车', '房地产', '环保'],
        minContentLength: 100,
        maxContentLength: 5000
    },
    
    // 短文章类型
    shortForm: {
        categories: ['娱乐', '体育', '旅游', '文化娱乐', '游戏'],
        minContentLength: 50,
        maxContentLength: 3000
    }
};

/**
 * 根据内容分类获取动态配置
 */
function getDynamicConfig(category, baseConfig = optimizedProductionConfig) {
    const config = { ...baseConfig };
    
    // 应用动态阈值
    for (const [level, settings] of Object.entries(dynamicThresholds)) {
        if (settings.categories.includes(category)) {
            config.qualityThreshold = settings.qualityThreshold;
            config.relevanceThreshold = settings.relevanceThreshold;
            break;
        }
    }
    
    // 应用长度要求
    for (const [form, settings] of Object.entries(categoryLengthRequirements)) {
        if (settings.categories.includes(category)) {
            config.minContentLength = settings.minContentLength;
            config.maxContentLength = settings.maxContentLength;
            break;
        }
    }
    
    return config;
}

/**
 * 智能配置工厂
 */
function createSmartConfig(options = {}) {
    const {
        environment = 'production',
        category = null,
        strictMode = false,
        performanceMode = false
    } = options;
    
    let baseConfig = optimizedProductionConfig;
    
    // 环境配置
    if (environment === 'test') {
        baseConfig = {
            ...baseConfig,
            qualityThreshold: 30,
            relevanceThreshold: 0.3,
            enableSemanticAnalysis: false
        };
    } else if (environment === 'development') {
        baseConfig = {
            ...baseConfig,
            qualityThreshold: 45,
            relevanceThreshold: 0.4,
            enableLogging: true
        };
    }
    
    // 严格模式
    if (strictMode) {
        baseConfig = {
            ...baseConfig,
            qualityThreshold: baseConfig.qualityThreshold + 15,
            relevanceThreshold: baseConfig.relevanceThreshold + 0.2,
            titleSimilarityThreshold: 0.7,
            contentSimilarityThreshold: 0.8
        };
    }
    
    // 性能模式
    if (performanceMode) {
        baseConfig = {
            ...baseConfig,
            batchSize: 12,
            delayBetweenBatches: 500,
            enableSemanticAnalysis: false,
            cacheExpiry: 10800000 // 3小时
        };
    }
    
    // 分类特定配置
    if (category) {
        baseConfig = getDynamicConfig(category, baseConfig);
    }
    
    return baseConfig;
}

/**
 * 配置验证和建议
 */
function validateAndSuggest(config) {
    const suggestions = [];
    const warnings = [];
    
    // 阈值建议
    if (config.qualityThreshold > 80) {
        warnings.push('质量阈值过高，可能导致大量内容被拒绝');
        suggestions.push('建议将质量阈值降低到60-75之间');
    }
    
    if (config.relevanceThreshold > 0.8) {
        warnings.push('相关性阈值过高，可能过度严格');
        suggestions.push('建议将相关性阈值设置在0.4-0.6之间');
    }
    
    // 性能建议
    if (config.batchSize > 15) {
        warnings.push('批处理大小过大，可能影响稳定性');
        suggestions.push('建议将批处理大小控制在5-12之间');
    }
    
    // 缓存建议
    if (config.cacheExpiry < 1800000) { // 30分钟
        suggestions.push('建议增加缓存过期时间以提高性能');
    }
    
    return {
        isValid: warnings.length === 0,
        warnings,
        suggestions
    };
}

// 使用示例
const examples = {
    // 科技内容处理
    techContent: () => createSmartConfig({
        category: '科技',
        environment: 'production'
    }),
    
    // 娱乐内容处理（较宽松）
    entertainmentContent: () => createSmartConfig({
        category: '娱乐',
        environment: 'production'
    }),
    
    // 高质量严格模式
    strictMode: () => createSmartConfig({
        strictMode: true,
        environment: 'production'
    }),
    
    // 高性能模式
    performanceMode: () => createSmartConfig({
        performanceMode: true,
        environment: 'production'
    }),
    
    // 测试环境
    testing: () => createSmartConfig({
        environment: 'test'
    })
};

module.exports = {
    optimizedProductionConfig,
    expandedCategoryMapping,
    dynamicThresholds,
    categoryLengthRequirements,
    getDynamicConfig,
    createSmartConfig,
    validateAndSuggest,
    examples,
    usageAnalysis
};