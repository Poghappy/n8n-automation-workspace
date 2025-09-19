/**
 * 增强版内容处理器配置文件
 * 基于调试分析的优化配置
 */

// 生产环境推荐配置
const productionConfig = {
    // AI服务配置
    aiApiKey: process.env.OPENAI_API_KEY || '',
    aiBaseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    aiModel: process.env.AI_MODEL || 'gpt-4',
    
    // 内容长度配置
    minContentLength: 100,
    maxContentLength: 5000,
    minTitleLength: 5,
    maxTitleLength: 60,
    
    // 优化后的质量阈值（基于调试结果）
    qualityThreshold: 60,        // 从70降到60，提高通过率
    relevanceThreshold: 0.5,     // 从0.7降到0.5，更合理的相关性要求
    
    // 相似度检测配置
    titleSimilarityThreshold: 0.8,
    contentSimilarityThreshold: 0.85,
    semanticSimilarityThreshold: 0.75,
    
    // 功能开关
    enableSemanticAnalysis: true,
    enableContentStandardization: true,
    enableCache: true,
    enableLogging: true,
    
    // 性能配置
    cacheExpiry: 3600000, // 1小时
    
    // 批量处理配置
    batchSize: 5,
    delayBetweenBatches: 1000,
    
    // 图片处理配置
    maxImageSize: 2 * 1024 * 1024, // 2MB
    allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    imageQuality: 80,
    
    // Notion集成配置
    notionIntegration: {
        defaultCityId: 1, // 夏威夷
        enableComments: true,
        autoApproveThreshold: 80 // 质量分数80以上自动审核通过
    }
};

// 测试环境配置（更宽松的阈值）
const testConfig = {
    ...productionConfig,
    aiApiKey: 'test-key',
    qualityThreshold: 30,
    relevanceThreshold: 0.3,
    enableSemanticAnalysis: false, // 测试时禁用AI功能
    enableLogging: true,
    batchSize: 2,
    delayBetweenBatches: 500
};

// 开发环境配置
const developmentConfig = {
    ...productionConfig,
    qualityThreshold: 50,
    relevanceThreshold: 0.4,
    enableLogging: true,
    batchSize: 3,
    delayBetweenBatches: 800
};

// 严格模式配置（高质量要求）
const strictConfig = {
    ...productionConfig,
    qualityThreshold: 80,
    relevanceThreshold: 0.8,
    titleSimilarityThreshold: 0.7,
    contentSimilarityThreshold: 0.8,
    semanticSimilarityThreshold: 0.7
};

// 宽松模式配置（高通过率）
const lenientConfig = {
    ...productionConfig,
    qualityThreshold: 40,
    relevanceThreshold: 0.3,
    titleSimilarityThreshold: 0.9,
    contentSimilarityThreshold: 0.9,
    semanticSimilarityThreshold: 0.9
};

/**
 * 根据环境获取配置
 */
function getConfig(environment = 'production') {
    const configs = {
        production: productionConfig,
        test: testConfig,
        development: developmentConfig,
        strict: strictConfig,
        lenient: lenientConfig
    };
    
    return configs[environment] || productionConfig;
}

/**
 * 创建配置的工厂函数
 */
function createConfig(overrides = {}) {
    return {
        ...productionConfig,
        ...overrides
    };
}

/**
 * 验证配置的有效性
 */
function validateConfig(config) {
    const errors = [];
    
    // 检查必需的配置项
    if (config.qualityThreshold < 0 || config.qualityThreshold > 100) {
        errors.push('qualityThreshold must be between 0 and 100');
    }
    
    if (config.relevanceThreshold < 0 || config.relevanceThreshold > 1) {
        errors.push('relevanceThreshold must be between 0 and 1');
    }
    
    if (config.minContentLength < 1) {
        errors.push('minContentLength must be greater than 0');
    }
    
    if (config.minTitleLength < 1) {
        errors.push('minTitleLength must be greater than 0');
    }
    
    if (config.batchSize < 1) {
        errors.push('batchSize must be greater than 0');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * 配置使用示例
 */
const examples = {
    // 基础使用
    basic: () => {
        const { EnhancedHuoNiaoContentProcessor } = require('./火鸟门户_内容处理核心模块_增强版.js');
        const config = getConfig('production');
        return new EnhancedHuoNiaoContentProcessor(config);
    },
    
    // 自定义配置
    custom: () => {
        const { EnhancedHuoNiaoContentProcessor } = require('./火鸟门户_内容处理核心模块_增强版.js');
        const config = createConfig({
            qualityThreshold: 65,
            relevanceThreshold: 0.6,
            enableLogging: false
        });
        return new EnhancedHuoNiaoContentProcessor(config);
    },
    
    // 测试环境
    testing: () => {
        const { EnhancedHuoNiaoContentProcessor } = require('./火鸟门户_内容处理核心模块_增强版.js');
        const config = getConfig('test');
        return new EnhancedHuoNiaoContentProcessor(config);
    }
};

module.exports = {
    productionConfig,
    testConfig,
    developmentConfig,
    strictConfig,
    lenientConfig,
    getConfig,
    createConfig,
    validateConfig,
    examples
};