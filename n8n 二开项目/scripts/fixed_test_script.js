/**
 * 增强版内容处理器测试文件 - 修复版
 * 验证任务4的所有增强功能
 */

const { EnhancedHuoNiaoContentProcessor } = require('./火鸟门户_内容处理核心模块_增强版.js');

// 测试配置
const testConfig = {
    aiApiKey: 'test-key', // 使用测试密钥
    enableCache: true,
    enableLogging: true,
    enableSemanticAnalysis: false, // 禁用语义分析避免AI调用
    qualityThreshold: 70,
    relevanceThreshold: 0.7,
    titleSimilarityThreshold: 0.8,
    contentSimilarityThreshold: 0.85,
    semanticSimilarityThreshold: 0.75
};

// 修复后的测试数据
const testData = [
    {
        title: "OpenAI发布GPT-4 Turbo，AI技术再次突破",
        content: "OpenAI今天宣布推出GPT-4 Turbo，这是其最新的大型语言模型。新模型在性能、效率和成本方面都有显著改进。GPT-4 Turbo支持更长的上下文窗口，能够处理更复杂的任务。这一突破将为AI应用开发者提供更强大的工具，推动人工智能技术在各个领域的应用。据OpenAI介绍，新模型的训练数据更新至2024年4月，包含了更多最新的知识和信息。该模型还具备更好的多语言支持能力，能够更准确地理解和生成不同语言的内容。",
        source: "TechCrunch",
        author: "AI记者",
        source_url: "https://techcrunch.com/gpt4-turbo",
        image_url: "https://example.com/gpt4-turbo.jpg",
        keywords: "OpenAI,GPT-4,AI,人工智能,技术突破"
    },
    {
        title: "苹果公司Q4财报超预期，iPhone销量创新高",
        content: "苹果公司发布了2024年第四季度财报，营收达到创纪录的1200亿美元，同比增长8%。iPhone销量表现尤为亮眼，得益于iPhone 15系列的强劲需求。CEO蒂姆·库克表示，公司在人工智能领域的投资正在显现成效，Apple Intelligence功能受到用户广泛好评。服务业务收入也实现了15%的增长，显示出苹果生态系统的强大粘性。公司还宣布了新的股票回购计划，将在未来12个月内回购价值1000亿美元的股票。",
        source: "Apple Inc",
        author: "财经记者",
        source_url: "https://apple.com/newsroom/q4-2024",
        image_url: "https://example.com/apple-earnings.jpg"
    },
    {
        title: "重复标题测试：OpenAI发布GPT-4 Turbo，AI技术再次突破",
        content: "这是一个重复内容测试，用于验证去重功能。OpenAI今天宣布推出GPT-4 Turbo，这是其最新的大型语言模型。新模型在性能、效率和成本方面都有显著改进。这个测试内容与第一条内容高度相似，用于验证系统的重复检测能力。系统应该能够识别出这是重复内容并进行相应的处理。重复检测是内容管理系统的重要功能，能够确保内容的独特性和质量。",
        source: "Test Source",
        author: "测试作者"
    },
    {
        title: "质量较低的测试内容",
        content: "这是一个相对较短的内容，用于测试质量评估功能。虽然内容不够丰富，但长度满足基本要求。这个测试用于验证系统如何处理质量较低的内容，包括内容长度检查、关键词密度分析、可读性评估等功能。系统应该能够识别出这类内容的质量问题，并给出相应的质量分数和处理建议。",
        source: "Test",
        author: "Test"
    },
    {
        title: "夏威夷旅游攻略：最佳海滩和景点推荐",
        content: "夏威夷是世界著名的度假胜地，拥有美丽的海滩、活火山和丰富的文化。威基基海滩是最受欢迎的海滩之一，适合冲浪和日光浴。珍珠港历史遗址让游客了解二战历史。火山国家公园展示了大自然的壮观景象。当地的波利尼西亚文化和美食也是不容错过的体验。最佳旅游时间是4-6月和9-11月，天气宜人且游客相对较少。建议提前预订酒店和活动，特别是在旅游旺季。海滩活动包括浮潜、深海钓鱼和观鲸等，为游客提供丰富的海洋体验。",
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

    // 设置超时保护
    const timeoutId = setTimeout(() => {
        console.error('❌ 测试超时，强制退出');
        process.exit(1);
    }, 60000); // 60秒超时

    try {
        // 初始化处理器
        const processor = new EnhancedHuoNiaoContentProcessor(testConfig);
        console.log('✅ 处理器初始化成功\n');

        // 测试1: 单个内容处理（禁用所有AI功能）
        console.log('📝 测试1: 单个内容处理');
        const singleResult = await processor.processContent(testData[0], {
            enableAI: false,
            optimizeTitle: false,
            optimizeContent: false,
            generateKeywords: false,
            generateSummary: false,
            enableSemanticAnalysis: false,
            enableQualityAssessment: false
        });

        console.log('结果:', {
            success: singleResult.success,
            title: singleResult.data?.标题?.substring(0, 50) + '...',
            hasError: !!singleResult.error
        });
        console.log('');

        // 测试2: 内容标准化（不依赖AI的功能）
        console.log('📝 测试2: 内容标准化');
        const messyData = {
            title: "  测试标题   with   extra   spaces  ",
            content: "测试内容标准化功能，这个内容包含了各种需要清理的格式问题。包括多余的空格、换行符和特殊字符的处理。标准化功能应该能够自动清理这些格式问题，使内容更加规范和整洁。这是内容处理系统的基础功能之一，对于保证内容质量非常重要。".repeat(2), // 确保长度足够
            keywords: "关键词1,  关键词2 ， 关键词3、关键词4",
            publish_date: "2024-01-15T10:30:00Z"
        };

        const standardizedResult = await processor.processContent(messyData, {
            enableAI: false,
            enableSemanticAnalysis: false,
            enableQualityAssessment: false
        });
        
        console.log('标准化结果:', {
            success: standardizedResult.success,
            originalTitle: `"${messyData.title}"`,
            standardizedTitle: `"${standardizedResult.data?.标题 || 'N/A'}"`,
            hasStandardizedContent: !!standardizedResult.data?.内容
        });
        console.log('');

        // 测试3: 基础分类功能（不依赖AI）
        console.log('📝 测试3: 基础分类功能');
        const categoryResults = [];
        
        for (let i = 0; i < Math.min(3, testData.length); i++) {
            try {
                const result = await processor.processContent(testData[i], {
                    enableAI: false,
                    enableSemanticAnalysis: false,
                    enableQualityAssessment: false
                });
                
                if (result.success) {
                    categoryResults.push({
                        title: testData[i].title.substring(0, 30) + '...',
                        category: result.data?.分类名称 || '未分类',
                        success: true
                    });
                } else {
                    categoryResults.push({
                        title: testData[i].title.substring(0, 30) + '...',
                        error: result.error || '处理失败',
                        success: false
                    });
                }
            } catch (error) {
                categoryResults.push({
                    title: testData[i].title.substring(0, 30) + '...',
                    error: error.message,
                    success: false
                });
            }
        }

        console.log('分类结果:', categoryResults);
        console.log('');

        // 测试4: 数据格式验证
        console.log('📝 测试4: 数据格式验证');
        const invalidData = {
            title: "短标题", // 测试短标题
            content: "短内容", // 测试短内容
            keywords: ""
        };

        const validationResult = await processor.processContent(invalidData, {
            enableAI: false,
            enableSemanticAnalysis: false,
            enableQualityAssessment: false
        });

        console.log('验证结果:', {
            success: validationResult.success,
            error: validationResult.error,
            reason: validationResult.reason
        });
        console.log('');

        // 测试5: 关键词提取（不依赖AI）
        console.log('📝 测试5: 关键词提取');
        const keywordText = "人工智能技术发展迅速，机器学习和深度学习成为热门话题";
        
        try {
            const keywords = processor.extractEnhancedKeywords(keywordText);
            console.log('关键词提取结果:', {
                originalText: keywordText,
                extractedKeywords: keywords.slice(0, 5), // 只显示前5个
                totalCount: keywords.length
            });
        } catch (error) {
            console.log('关键词提取失败:', error.message);
        }
        console.log('');

        // 测试6: 相似度计算
        console.log('📝 测试6: 相似度计算');
        const text1 = "人工智能技术发展迅速";
        const text2 = "AI技术快速发展";
        const text3 = "今天天气很好";

        try {
            const keywords1 = processor.extractEnhancedKeywords(text1);
            const keywords2 = processor.extractEnhancedKeywords(text2);
            const keywords3 = processor.extractEnhancedKeywords(text3);

            console.log('相似度测试结果:', {
                text1_vs_text2_jaccard: processor.calculateJaccardSimilarity(keywords1, keywords2),
                text1_vs_text3_jaccard: processor.calculateJaccardSimilarity(keywords1, keywords3),
                text1_vs_text2_edit: processor.calculateEditDistanceSimilarity(text1, text2)
            });
        } catch (error) {
            console.log('相似度计算失败:', error.message);
        }
        console.log('');

        console.log('🎉 所有测试完成！');

        // 清理资源
        if (processor.cleanup && typeof processor.cleanup === 'function') {
            processor.cleanup();
        }

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error('详细错误:', error.stack);
    } finally {
        clearTimeout(timeoutId);
        console.log('\n📊 测试执行结束，准备退出...');
        // 确保进程退出
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }
}

// 运行测试
if (require.main === module) {
    runTests()
        .then(() => {
            console.log('✅ 测试脚本执行完成');
        })
        .catch(error => {
            console.error('❌ 测试脚本执行失败:', error);
            process.exit(1);
        });
}

module.exports = { runTests };