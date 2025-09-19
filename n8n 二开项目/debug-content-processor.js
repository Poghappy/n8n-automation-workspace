/**
 * 调试版内容处理器测试文件
 * 专门用于诊断处理失败的原因
 */

const { EnhancedHuoNiaoContentProcessor } = require('./火鸟门户_内容处理核心模块_增强版.js');

// 更宽松的测试配置
const debugConfig = {
    aiApiKey: 'test-key',
    enableCache: true,
    enableLogging: true,
    enableSemanticAnalysis: false,
    qualityThreshold: 30, // 降低质量阈值
    relevanceThreshold: 0.3, // 降低相关性阈值
    titleSimilarityThreshold: 0.9, // 提高重复检测阈值
    contentSimilarityThreshold: 0.9,
    semanticSimilarityThreshold: 0.9
};

// 简单的测试数据
const debugData = {
    title: "人工智能技术发展趋势分析报告",
    content: "人工智能技术正在快速发展，涉及机器学习、深度学习、自然语言处理等多个领域。随着算力的提升和数据的积累，AI技术在各行各业都有广泛应用。从智能助手到自动驾驶，从医疗诊断到金融分析，人工智能正在改变我们的生活和工作方式。未来，AI技术将继续向着更加智能化、人性化的方向发展，为社会创造更大的价值。技术发展的同时，我们也需要关注AI的伦理和安全问题。",
    source: "科技日报",
    author: "技术专家",
    source_url: "https://example.com/ai-report",
    keywords: "人工智能,机器学习,深度学习,技术发展"
};

/**
 * 详细调试测试
 */
async function debugTest() {
    console.log('🔍 开始详细调试测试\n');

    try {
        const processor = new EnhancedHuoNiaoContentProcessor(debugConfig);
        console.log('✅ 处理器初始化成功\n');

        // 测试最小配置处理
        console.log('📝 测试最小配置处理');
        const result = await processor.processContent(debugData, {
            enableAI: false,
            enableSemanticAnalysis: false,
            optimizeTitle: false,
            optimizeContent: false,
            generateKeywords: false,
            generateSummary: false
        });

        console.log('详细处理结果:');
        console.log('- success:', result.success);
        console.log('- error:', result.error);
        console.log('- reason:', result.reason);
        console.log('- isRejected:', result.isRejected);
        console.log('- isDuplicate:', result.isDuplicate);

        if (result.qualityAssessment) {
            console.log('- 质量评估:');
            console.log('  - 质量分数:', result.qualityAssessment.qualityScore);
            console.log('  - 相关性分数:', result.qualityAssessment.relevanceScore);
            console.log('  - 基础质量分数:', result.qualityAssessment.baseQualityScore);
        }

        if (result.data) {
            console.log('- 生成的数据:');
            console.log('  - 标题:', result.data.标题);
            console.log('  - 分类名称:', result.data.分类名称);
            console.log('  - 处理状态:', result.data.处理状态);
            console.log('  - 质量分数:', result.data.质量分数);
        }

        if (result.metadata) {
            console.log('- 元数据:');
            console.log('  - 处理时间:', result.metadata.processingTime);
            console.log('  - 质量分数:', result.metadata.qualityScore);
            console.log('  - 相关性分数:', result.metadata.relevanceScore);
        }
        console.log('\n');

        // 测试基础验证功能
        console.log('📝 测试基础验证功能');
        const validationResults = [];

        // 测试各种边界情况
        const testCases = [
            {
                name: '正常内容',
                data: debugData
            },
            {
                name: '短标题',
                data: { ...debugData, title: '短' }
            },
            {
                name: '短内容',
                data: { ...debugData, content: '短内容' }
            },
            {
                name: '空关键词',
                data: { ...debugData, keywords: '' }
            },
            {
                name: '无作者',
                data: { ...debugData, author: '' }
            }
        ];

        for (const testCase of testCases) {
            try {
                const testResult = await processor.processContent(testCase.data, {
                    enableAI: false,
                    enableSemanticAnalysis: false
                });

                validationResults.push({
                    name: testCase.name,
                    success: testResult.success,
                    error: testResult.error || 'none',
                    reason: testResult.reason || 'none',
                    qualityScore: testResult.qualityAssessment?.qualityScore || 0,
                    relevanceScore: testResult.qualityAssessment?.relevanceScore || 0
                });
            } catch (error) {
                validationResults.push({
                    name: testCase.name,
                    success: false,
                    error: error.message,
                    reason: 'exception',
                    qualityScore: 0,
                    relevanceScore: 0
                });
            }
        }

        console.log('验证测试结果:');
        validationResults.forEach(result => {
            console.log(`- ${result.name}: ${result.success ? '✅' : '❌'} (${result.reason}) Q:${result.qualityScore} R:${result.relevanceScore}`);
        });
        console.log('\n');

        // 测试质量评估的各个组件
        console.log('📝 测试质量评估组件');
        try {
            const titleQuality = processor.assessTitleQuality(debugData.title);
            const contentQuality = processor.assessContentQuality(debugData.content);
            const metadataQuality = processor.assessMetadataCompleteness(debugData);
            const structuralQuality = processor.assessStructuralQuality(debugData.content);

            console.log('质量评估组件结果:');
            console.log('- 标题质量:', titleQuality);
            console.log('- 内容质量:', contentQuality);
            console.log('- 元数据完整性:', metadataQuality);
            console.log('- 结构质量:', structuralQuality);

            const overallQuality = processor.calculateEnhancedContentQuality(debugData);
            console.log('- 综合质量分数:', overallQuality);
        } catch (error) {
            console.log('质量评估组件测试失败:', error.message);
        }
        console.log('\n');

        // 测试相关性评估组件
        console.log('📝 测试相关性评估组件');
        try {
            const keywordRelevance = processor.assessKeywordRelevance(debugData);
            const categoryRelevance = processor.assessCategoryRelevance(debugData);
            const sourceRelevance = processor.assessSourceRelevance(debugData);

            console.log('相关性评估组件结果:');
            console.log('- 关键词相关性:', keywordRelevance);
            console.log('- 分类相关性:', categoryRelevance);
            console.log('- 来源相关性:', sourceRelevance);
        } catch (error) {
            console.log('相关性评估组件测试失败:', error.message);
        }
        console.log('\n');

        // 测试分类功能
        console.log('📝 测试分类功能');
        try {
            const categoryResult = processor.intelligentCategorization(debugData);
            console.log('分类结果:', categoryResult);
        } catch (error) {
            console.log('分类失败:', error.message);
        }
        console.log('\n');

        // 测试标准化功能
        console.log('📝 测试标准化功能');
        try {
            const messyData = {
                title: "  测试标题   with   extra   spaces  ",
                content: "测试内容\r\n\r\n\r\n多余换行\n\n\n和   空格   处理",
                keywords: "关键词1,  关键词2 ， 关键词3、关键词4"
            };

            const standardizedTitle = processor.standardizeTitle(messyData.title);
            const standardizedContent = processor.standardizeText(messyData.content);
            const standardizedKeywords = processor.standardizeKeywords(messyData.keywords);

            console.log('标准化结果:');
            console.log('- 原标题:', `"${messyData.title}"`);
            console.log('- 标准化标题:', `"${standardizedTitle}"`);
            console.log('- 原关键词:', messyData.keywords);
            console.log('- 标准化关键词:', standardizedKeywords);
        } catch (error) {
            console.log('标准化功能测试失败:', error.message);
        }
        console.log('\n');

        console.log('🎉 调试测试完成！');

    } catch (error) {
        console.error('❌ 调试测试失败:', error.message);
        console.error('错误详情:', error.stack);
    } finally {
        console.log('\n📊 调试测试结束');
        process.exit(0);
    }
}

// 运行调试测试
if (require.main === module) {
    debugTest().catch(console.error);
}

module.exports = { debugTest };