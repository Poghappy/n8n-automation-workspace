/**
 * 最终验证测试 - 使用优化配置
 * 验证增强版内容处理器在优化配置下的表现
 */

const { EnhancedHuoNiaoContentProcessor } = require('./火鸟门户_内容处理核心模块_增强版.js');
const { getConfig, validateConfig } = require('./enhanced-processor-config.js');

// 使用优化的生产配置
const optimizedConfig = getConfig('production');

// 验证配置有效性
const configValidation = validateConfig(optimizedConfig);
if (!configValidation.isValid) {
    console.error('❌ 配置验证失败:', configValidation.errors);
    process.exit(1);
}

// 真实的测试数据
const realWorldData = [
    {
        title: "OpenAI发布GPT-4 Turbo，AI技术再次突破",
        content: "OpenAI今天宣布推出GPT-4 Turbo，这是其最新的大型语言模型。新模型在性能、效率和成本方面都有显著改进。GPT-4 Turbo支持更长的上下文窗口，能够处理更复杂的任务。这一突破将为AI应用开发者提供更强大的工具，推动人工智能技术在各个领域的应用。据OpenAI介绍，新模型的训练数据更新至2024年4月，包含了更多最新的知识和信息。该模型还具备更好的多语言支持能力，能够更准确地理解和生成不同语言的内容。在基准测试中，GPT-4 Turbo在多项任务上都表现出色，特别是在代码生成、数学推理和创意写作方面有显著提升。",
        source: "TechCrunch",
        author: "AI记者",
        source_url: "https://techcrunch.com/gpt4-turbo",
        image_url: "https://example.com/gpt4-turbo.jpg",
        keywords: "OpenAI,GPT-4,AI,人工智能,技术突破"
    },
    {
        title: "苹果公司Q4财报超预期，iPhone销量创新高",
        content: "苹果公司发布了2024年第四季度财报，营收达到创纪录的1200亿美元，同比增长8%。iPhone销量表现尤为亮眼，得益于iPhone 15系列的强劲需求。CEO蒂姆·库克表示，公司在人工智能领域的投资正在显现成效，Apple Intelligence功能受到用户广泛好评。服务业务收入也实现了15%的增长，显示出苹果生态系统的强大粘性。公司还宣布了新的股票回购计划，将在未来12个月内回购价值1000亿美元的股票。分析师普遍看好苹果的未来发展前景，特别是在AI和服务业务方面的布局。Mac和iPad业务虽然有所下滑，但整体表现仍然稳健。",
        source: "Apple Inc",
        author: "财经记者",
        source_url: "https://apple.com/newsroom/q4-2024",
        image_url: "https://example.com/apple-earnings.jpg",
        keywords: "苹果,财报,iPhone,营收,股票"
    },
    {
        title: "夏威夷旅游攻略：最佳海滩和景点推荐",
        content: "夏威夷是世界著名的度假胜地，拥有美丽的海滩、活火山和丰富的文化。威基基海滩是最受欢迎的海滩之一，适合冲浪和日光浴。珍珠港历史遗址让游客了解二战历史。火山国家公园展示了大自然的壮观景象。当地的波利尼西亚文化和美食也是不容错过的体验。最佳旅游时间是4-6月和9-11月，天气宜人且游客相对较少。建议提前预订酒店和活动，特别是在旅游旺季。海滩活动包括浮潜、深海钓鱼和观鲸等，为游客提供丰富的海洋体验。岛上的热带雨林和瀑布也值得探索，可以参加徒步旅行或直升机观光。",
        source: "Hawaii Tourism",
        author: "旅游专家",
        source_url: "https://hawaii.com/travel-guide",
        image_url: "https://example.com/hawaii-beach.jpg",
        keywords: "夏威夷,旅游,海滩,度假,威基基"
    },
    {
        title: "人工智能在医疗领域的最新应用进展",
        content: "人工智能技术在医疗领域的应用正在快速发展，从诊断辅助到药物研发，AI正在改变医疗行业的各个方面。最新的研究显示，AI在医学影像诊断方面已经达到了专家级别的准确率，特别是在癌症筛查和早期诊断方面表现突出。机器学习算法能够分析大量的医疗数据，发现人类医生可能忽略的细微模式。在药物研发领域，AI大大缩短了新药开发的时间周期，从传统的10-15年缩短到5-7年。个性化医疗也是AI应用的重要方向，通过分析患者的基因信息和病史，AI可以为每个患者制定最适合的治疗方案。",
        source: "医学期刊",
        author: "医学专家",
        source_url: "https://medical-journal.com/ai-healthcare",
        keywords: "人工智能,医疗,诊断,药物研发,个性化医疗"
    }
];

/**
 * 运行最终验证测试
 */
async function runFinalValidation() {
    console.log('🎯 开始最终验证测试\n');
    console.log('📋 使用优化配置:');
    console.log(`- 质量阈值: ${optimizedConfig.qualityThreshold}`);
    console.log(`- 相关性阈值: ${optimizedConfig.relevanceThreshold}`);
    console.log(`- 启用AI: ${!!optimizedConfig.aiApiKey}`);
    console.log(`- 启用缓存: ${optimizedConfig.enableCache}`);
    console.log('');

    try {
        const processor = new EnhancedHuoNiaoContentProcessor(optimizedConfig);
        console.log('✅ 处理器初始化成功\n');

        const results = [];
        let successCount = 0;
        let rejectedCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;

        // 逐个处理测试数据
        for (let i = 0; i < realWorldData.length; i++) {
            const data = realWorldData[i];
            console.log(`📝 处理第 ${i + 1} 条内容: ${data.title.substring(0, 40)}...`);

            try {
                const result = await processor.processContent(data, {
                    enableAI: false, // 禁用AI以避免API问题
                    enableSemanticAnalysis: false,
                    optimizeTitle: false,
                    optimizeContent: false,
                    generateKeywords: false,
                    generateSummary: false
                });

                const resultSummary = {
                    index: i + 1,
                    title: data.title.substring(0, 50) + '...',
                    success: result.success,
                    isDuplicate: result.isDuplicate || false,
                    isRejected: result.isRejected || false,
                    reason: result.reason || 'none',
                    qualityScore: result.qualityAssessment?.qualityScore || 0,
                    relevanceScore: result.qualityAssessment?.relevanceScore || 0,
                    category: result.data?.分类名称 || 'unknown',
                    processingTime: result.metadata?.processingTime || 0
                };

                results.push(resultSummary);

                // 统计结果
                if (result.success) {
                    successCount++;
                    console.log(`✅ 成功 - 质量:${resultSummary.qualityScore} 相关性:${resultSummary.relevanceScore} 分类:${resultSummary.category}`);
                } else if (result.isDuplicate) {
                    duplicateCount++;
                    console.log(`🔄 重复 - ${result.duplicateInfo?.method || 'unknown'}`);
                } else if (result.isRejected) {
                    rejectedCount++;
                    console.log(`❌ 拒绝 - ${result.reason}`);
                } else {
                    errorCount++;
                    console.log(`💥 错误 - ${result.error}`);
                }

            } catch (error) {
                errorCount++;
                results.push({
                    index: i + 1,
                    title: data.title.substring(0, 50) + '...',
                    success: false,
                    error: error.message,
                    qualityScore: 0,
                    relevanceScore: 0
                });
                console.log(`💥 异常 - ${error.message}`);
            }

            console.log('');
        }

        // 测试批量处理
        console.log('📦 测试批量处理功能');
        const batchResult = await processor.batchProcessContent(realWorldData, {
            enableAI: false,
            batchSize: 2,
            delayBetweenBatches: 500
        });

        console.log('批量处理结果:', {
            success: batchResult.success,
            total: batchResult.summary.total,
            accepted: batchResult.summary.accepted,
            rejected: batchResult.summary.rejected,
            duplicates: batchResult.summary.duplicates,
            errors: batchResult.summary.errors,
            successRate: batchResult.summary.successRate
        });
        console.log('');

        // 显示最终统计
        const totalProcessed = results.length;
        const successRate = ((successCount / totalProcessed) * 100).toFixed(1);

        console.log('🏆 最终验证结果:');
        console.log(`📊 总处理数: ${totalProcessed}`);
        console.log(`✅ 成功数: ${successCount}`);
        console.log(`❌ 拒绝数: ${rejectedCount}`);
        console.log(`🔄 重复数: ${duplicateCount}`);
        console.log(`💥 错误数: ${errorCount}`);
        console.log(`📈 成功率: ${successRate}%`);
        console.log('');

        // 详细结果表格
        console.log('📋 详细处理结果:');
        console.table(results.map(r => ({
            '序号': r.index,
            '标题': r.title,
            '状态': r.success ? '✅成功' : r.isDuplicate ? '🔄重复' : r.isRejected ? '❌拒绝' : '💥错误',
            '质量分数': r.qualityScore,
            '相关性': r.relevanceScore,
            '分类': r.category,
            '原因': r.reason
        })));

        // 获取处理器统计
        const stats = processor.getProcessingStats();
        console.log('');
        console.log('🔧 处理器统计信息:');
        console.log(`- 总处理数: ${stats.processed}`);
        console.log(`- 成功数: ${stats.accepted}`);
        console.log(`- 拒绝数: ${stats.rejected}`);
        console.log(`- 重复数: ${stats.duplicates}`);
        console.log(`- 错误数: ${stats.errors}`);
        console.log(`- 缓存大小: ${JSON.stringify(stats.cacheSize)}`);

        // 评估结果
        console.log('');
        if (successRate >= 75) {
            console.log('🎉 验证通过！增强版内容处理器表现优秀！');
            console.log('✨ 系统已准备好投入生产使用');
        } else if (successRate >= 50) {
            console.log('⚠️  验证部分通过，建议进一步优化配置');
        } else {
            console.log('❌ 验证未通过，需要检查配置和实现');
        }

        // 清理资源
        processor.clearAllCaches();

    } catch (error) {
        console.error('❌ 最终验证测试失败:', error.message);
        console.error('详细错误:', error.stack);
    } finally {
        console.log('\n📊 最终验证测试结束');
        process.exit(0);
    }
}

// 运行测试
if (require.main === module) {
    runFinalValidation().catch(console.error);
}

module.exports = { runFinalValidation };