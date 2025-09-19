/**
 * 增强版内容处理器测试文件
 * 验证任务4的所有增强功能
 */

const { EnhancedHuoNiaoContentProcessor } = require('./火鸟门户_内容处理核心模块_增强版.js');

// 测试配置
const testConfig = {
    aiApiKey: process.env.OPENAI_API_KEY || 'test-key',
    enableCache: true,
    enableLogging: true,
    enableSemanticAnalysis: true,
    qualityThreshold: 70,
    relevanceThreshold: 0.7,
    titleSimilarityThreshold: 0.8,
    contentSimilarityThreshold: 0.85,
    semanticSimilarityThreshold: 0.75
};

// 测试数据
const testData = [
    {
        title: "OpenAI发布GPT-4 Turbo，AI技术再次突破",
        content: "OpenAI今天宣布推出GPT-4 Turbo，这是其最新的大型语言模型。新模型在性能、效率和成本方面都有显著改进。GPT-4 Turbo支持更长的上下文窗口，能够处理更复杂的任务。这一突破将为AI应用开发者提供更强大的工具，推动人工智能技术在各个领域的应用。据OpenAI介绍，新模型的训练数据更新至2024年4月，包含了更多最新的知识和信息。",
        source: "TechCrunch",
        author: "AI记者",
        source_url: "https://techcrunch.com/gpt4-turbo",
        image_url: "https://example.com/gpt4-turbo.jpg",
        keywords: "OpenAI,GPT-4,AI,人工智能,技术突破"
    },
    {
        title: "苹果公司Q4财报超预期，iPhone销量创新高",
        content: "苹果公司发布了2024年第四季度财报，营收达到创纪录的1200亿美元，同比增长8%。iPhone销量表现尤为亮眼，得益于iPhone 15系列的强劲需求。CEO蒂姆·库克表示，公司在人工智能领域的投资正在显现成效，Apple Intelligence功能受到用户广泛好评。服务业务收入也实现了15%的增长，显示出苹果生态系统的强大粘性。",
        source: "Apple Inc",
        author: "财经记者",
        source_url: "https://apple.com/newsroom/q4-2024",
        image_url: "https://example.com/apple-earnings.jpg"
    },
    {
        title: "重复标题测试：OpenAI发布GPT-4 Turbo，AI技术再次突破",
        content: "这是一个重复内容测试，用于验证去重功能。OpenAI今天宣布推出GPT-4 Turbo，这是其最新的大型语言模型。",
        source: "Test Source",
        author: "测试作者"
    },
    {
        title: "质量较低的测试内容",
        content: "这是一个很短的内容，用于测试质量评估功能。",
        source: "Test",
        author: "Test"
    },
    {
        title: "夏威夷旅游攻略：最佳海滩和景点推荐",
        content: "夏威夷是世界著名的度假胜地，拥有美丽的海滩、活火山和丰富的文化。威基基海滩是最受欢迎的海滩之一，适合冲浪和日光浴。珍珠港历史遗址让游客了解二战历史。火山国家公园展示了大自然的壮观景象。当地的波利尼西亚文化和美食也是不容错过的体验。最佳旅游时间是4-6月和9-11月，天气宜人且游客相对较少。建议提前预订酒店和活动，特别是在旅游旺季。",
        source: "Hawaii Tourism",
        author: "旅游专家",
        source_url: "https://hawaii.com/travel-guide",
        image_url: "https://example.com/hawaii-beach.jpg",
        keywords: "夏威夷,旅游,海滩,度假,威基基"
    }
];

/**
 * 运行测试
 */
async function runTests() {
    console.log('🚀 开始增强版内容处理器测试\n');

    try {
        // 初始化处理器
        const processor = new EnhancedHuoNiaoContentProcessor(testConfig);
        console.log('✅ 处理器初始化成功\n');

        // 测试1: 单个内容处理
        console.log('📝 测试1: 单个内容处理');
        const singleResult = await processor.processContent(testData[0], {
            enableAI: false, // 跳过AI调用以避免API密钥问题
            optimizeTitle: false,
            optimizeContent: false,
            generateKeywords: false,
            generateSummary: false
        });

        console.log('结果:', {
            success: singleResult.success,
            qualityScore: singleResult.metadata?.qualityScore,
            relevanceScore: singleResult.metadata?.relevanceScore,
            category: singleResult.data?.分类名称,
            processingTime: singleResult.metadata?.processingTime
        });
        console.log('');

        // 测试2: 重复内容检测
        console.log('📝 测试2: 重复内容检测');
        
        // 先处理原始内容
        await processor.processContent(testData[0], { enableAI: false });
        
        // 再处理重复内容
        const duplicateResult = await processor.processContent(testData[2], { enableAI: false });
        
        console.log('重复检测结果:', {
            isDuplicate: duplicateResult.isDuplicate,
            method: duplicateResult.duplicateInfo?.method,
            similarity: duplicateResult.duplicateInfo?.similarity
        });
        console.log('');

        // 测试3: 质量过滤
        console.log('📝 测试3: 质量过滤');
        const lowQualityResult = await processor.processContent(testData[3], { enableAI: false });
        
        console.log('质量过滤结果:', {
            success: lowQualityResult.success,
            isRejected: lowQualityResult.isRejected,
            reason: lowQualityResult.reason,
            qualityScore: lowQualityResult.qualityAssessment?.qualityScore
        });
        console.log('');

        // 测试4: 批量处理
        console.log('📝 测试4: 批量处理');
        const batchResult = await processor.batchProcessContent(testData, {
            enableAI: false,
            batchSize: 2,
            delayBetweenBatches: 1000
        });

        console.log('批量处理结果:', {
            success: batchResult.success,
            summary: batchResult.summary,
            stats: batchResult.stats
        });
        console.log('');

        // 测试5: 内容标准化
        console.log('📝 测试5: 内容标准化');
        const messyData = {
            title: "  测试标题   with   extra   spaces  ",
            content: "测试内容\r\n\r\n\r\n多余换行\n\n\n和   空格   处理",
            keywords: "关键词1,  关键词2 ， 关键词3、关键词4",
            publish_date: "2024-01-15T10:30:00Z"
        };

        const standardizedResult = await processor.processContent(messyData, { enableAI: false });
        
        console.log('标准化结果:', {
            originalTitle: messyData.title,
            standardizedTitle: standardizedResult.data?.标题,
            originalKeywords: messyData.keywords,
            standardizedKeywords: standardizedResult.data?.关键词
        });
        console.log('');

        // 测试6: 分类功能
        console.log('📝 测试6: 智能分类');
        const categoryResults = [];
        
        for (let i = 0; i < 3; i++) {
            const result = await processor.processContent(testData[i], { enableAI: false });
            if (result.success) {
                categoryResults.push({
                    title: testData[i].title.substring(0, 30) + '...',
                    category: result.data.分类名称,
                    categoryId: result.data.分类ID,
                    confidence: result.categoryResult?.confidence
                });
            }
        }

        console.log('分类结果:', categoryResults);
        console.log('');

        // 测试7: Notion格式化
        console.log('📝 测试7: Notion数据格式化');
        const notionResult = await processor.processContent(testData[4], { enableAI: false });
        
        if (notionResult.success) {
            const notionData = notionResult.data;
            console.log('Notion格式化结果:', {
                标题: notionData.标题,
                短标题: notionData.短标题,
                分类名称: notionData.分类名称,
                分类ID: notionData.分类ID,
                质量分数: notionData.质量分数,
                处理状态: notionData.处理状态,
                审核状态: notionData.审核状态,
                附加属性: notionData.附加属性,
                排序权重: notionData.排序权重
            });
        }
        console.log('');

        // 测试8: 统计信息
        console.log('📝 测试8: 处理统计信息');
        const stats = processor.getProcessingStats();
        console.log('统计信息:', stats);
        console.log('');

        // 测试9: 相似度算法测试
        console.log('📝 测试9: 相似度算法测试');
        const text1 = "人工智能技术发展迅速";
        const text2 = "AI技术快速发展";
        const text3 = "今天天气很好";

        const keywords1 = processor.extractEnhancedKeywords(text1);
        const keywords2 = processor.extractEnhancedKeywords(text2);
        const keywords3 = processor.extractEnhancedKeywords(text3);

        console.log('相似度测试:', {
            text1_vs_text2_jaccard: processor.calculateJaccardSimilarity(keywords1, keywords2),
            text1_vs_text2_cosine: processor.calculateCosineSimilarity(keywords1, keywords2),
            text1_vs_text3_jaccard: processor.calculateJaccardSimilarity(keywords1, keywords3),
            text1_vs_text2_edit: processor.calculateEditDistanceSimilarity(text1, text2)
        });
        console.log('');

        console.log('🎉 所有测试完成！');

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error(error.stack);
    }
}

// 运行测试
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };