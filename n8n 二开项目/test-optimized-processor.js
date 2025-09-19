/**
 * 优化版内容处理器测试
 * 验证微调阈值和新增分类的效果
 */

const { createOptimizedProcessor } = require('./enhanced-processor-with-optimized-config.js');
const { validateAndSuggest } = require('./optimized-processor-config.js');

// 测试数据 - 覆盖新增的分类
const testData = [
    // 人工智能分类
    {
        title: "ChatGPT-5即将发布，OpenAI宣布重大突破",
        content: "OpenAI今天宣布即将发布ChatGPT-5，这款新的大型语言模型在推理能力、多模态理解和代码生成方面都有显著提升。新模型采用了最新的Transformer架构优化，支持更长的上下文窗口，能够处理复杂的多轮对话。据内部测试显示，ChatGPT-5在数学推理、科学问题解答和创意写作方面的表现都超越了前代模型。这一突破将进一步推动人工智能在教育、科研和商业领域的应用。",
        source: "AI Daily",
        author: "AI研究员",
        keywords: "ChatGPT,OpenAI,人工智能,大模型,LLM"
    },
    
    // 区块链分类
    {
        title: "比特币突破10万美元，加密货币市场迎来新高潮",
        content: "比特币价格今日突破10万美元大关，创下历史新高。这一里程碑式的突破得益于机构投资者的大量涌入和全球对数字货币接受度的提升。以太坊、Solana等主流加密货币也跟随上涨。区块链技术的成熟应用，特别是在DeFi、NFT和Web3领域的发展，为整个加密货币生态系统提供了强有力的支撑。分析师预测，随着更多国家将比特币纳入法定储备资产，其价格可能继续攀升。",
        source: "CoinDesk",
        author: "加密货币分析师",
        keywords: "比特币,加密货币,区块链,DeFi,Web3"
    },
    
    // 新能源分类
    {
        title: "特斯拉发布新一代4680电池，续航里程提升50%",
        content: "特斯拉在其电池日活动中正式发布了新一代4680电池技术。这款电池采用了全新的硅纳米线负极材料和干电极工艺，能量密度比现有电池提升了30%，同时成本降低了20%。新电池将首先应用于Model S Plaid+车型，预计续航里程可达到800公里以上。马斯克表示，这一技术突破将加速电动汽车的普及，并有助于实现特斯拉年产2000万辆电动车的目标。",
        source: "Tesla News",
        author: "汽车科技记者",
        keywords: "特斯拉,电池技术,新能源汽车,续航,电动车"
    },
    
    // 生物医药分类
    {
        title: "基因编辑新突破：CRISPR技术成功治愈遗传性失明",
        content: "科学家们使用CRISPR基因编辑技术成功治愈了一名患有先天性黑蒙症的患者。这是首次在人体内直接进行基因编辑治疗遗传性疾病的成功案例。研究团队将经过改造的CRISPR系统直接注射到患者眼部，精确修复了导致失明的基因缺陷。治疗后三个月，患者的视力显著改善，能够识别颜色和形状。这一突破为治疗其他遗传性疾病开辟了新的道路，预计未来五年内将有更多基因治疗药物获得批准。",
        source: "Nature Medicine",
        author: "医学研究员",
        keywords: "CRISPR,基因编辑,基因治疗,遗传病,生物医药"
    },
    
    // 游戏分类
    {
        title: "《原神》全球收入突破50亿美元，开放世界手游新标杆",
        content: "miHoYo开发的开放世界手游《原神》全球总收入正式突破50亿美元大关，成为移动游戏史上收入最高的游戏之一。这款游戏凭借精美的画面、丰富的剧情和创新的玩法机制，在全球范围内拥有超过1亿活跃用户。《原神》的成功不仅证明了中国游戏开发商的实力，也为整个手游行业树立了新的标杆。游戏持续更新的内容和跨平台互通功能，为玩家提供了长期的游戏体验。",
        source: "GameIndustry",
        author: "游戏行业分析师",
        keywords: "原神,手游,开放世界,miHoYo,游戏收入"
    },
    
    // 航空航天分类
    {
        title: "SpaceX成功发射星舰，人类火星殖民计划迈出关键一步",
        content: "SpaceX的星舰(Starship)重型运载火箭今日成功完成首次轨道飞行测试，标志着人类火星殖民计划迈出了关键一步。这艘高达120米的巨型火箭能够携带100吨货物到达火星，是目前世界上运载能力最强的火箭。马斯克表示，星舰的成功将大大降低太空运输成本，使火星移民成为可能。NASA已与SpaceX签署协议，将使用星舰执行阿尔忒弥斯登月任务。这一成就将开启人类太空探索的新纪元。",
        source: "SpaceNews",
        author: "航天记者",
        keywords: "SpaceX,星舰,火星,太空探索,载人航天"
    },
    
    // 文化娱乐分类
    {
        title: "《流浪地球3》定档春节，中国科幻电影再创新高度",
        content: "备受期待的科幻大片《流浪地球3》正式宣布定档春节档。这部由郭帆执导的续作在视觉效果和故事深度上都有了显著提升，采用了最新的虚拟拍摄技术和AI辅助制作。影片讲述了人类在太空中建立新家园的故事，探讨了科技发展与人性的关系。主演吴京、易烊千玺等人的精彩表演为影片增色不少。业内专家预测，这部影片有望刷新中国科幻电影的票房纪录，进一步提升中国电影在国际市场的影响力。",
        source: "电影网",
        author: "影视记者",
        keywords: "流浪地球,科幻电影,春节档,中国电影,票房"
    }
];

/**
 * 运行优化版测试
 */
async function runOptimizedTest() {
    console.log('🚀 开始优化版内容处理器测试\n');

    try {
        // 创建优化版处理器
        const processor = createOptimizedProcessor({
            environment: 'production'
        });

        console.log('✅ 优化版处理器初始化成功');
        console.log('📊 处理器配置信息:');
        console.log(`- 总分类数: ${processor.categoryMapping.size}`);
        console.log(`- 动态阈值级别: ${Object.keys(processor.dynamicThresholds).length}`);
        console.log('');

        // 获取动态阈值统计
        const thresholdStats = processor.getDynamicThresholdStats();
        console.log('🎯 动态阈值配置:');
        console.log(`- 高质量要求分类: ${thresholdStats.highQualityCategories}个`);
        console.log(`- 中等质量要求分类: ${thresholdStats.mediumQualityCategories}个`);
        console.log(`- 较低质量要求分类: ${thresholdStats.lowQualityCategories}个`);
        console.log('');

        const results = [];
        let successCount = 0;

        // 逐个处理测试数据
        for (let i = 0; i < testData.length; i++) {
            const data = testData[i];
            console.log(`📝 处理第 ${i + 1} 条内容: ${data.title.substring(0, 40)}...`);

            try {
                const result = await processor.processContent(data, {
                    enableAI: false, // 禁用AI以避免API问题
                    enableSemanticAnalysis: false
                });

                const resultSummary = {
                    index: i + 1,
                    title: data.title.substring(0, 50) + '...',
                    success: result.success,
                    category: result.categoryResult?.category || 'unknown',
                    qualityScore: result.qualityAssessment?.qualityScore || 0,
                    relevanceScore: result.qualityAssessment?.relevanceScore || 0,
                    dynamicLevel: result.dynamicConfig?.level || 'default',
                    thresholdUsed: {
                        quality: result.dynamicConfig?.qualityThreshold || 0,
                        relevance: result.dynamicConfig?.relevanceThreshold || 0
                    },
                    processingTime: result.metadata?.processingTime || 0
                };

                results.push(resultSummary);

                if (result.success) {
                    successCount++;
                    console.log(`✅ 成功 - 分类:${resultSummary.category} 质量:${resultSummary.qualityScore} 相关性:${resultSummary.relevanceScore.toFixed(2)} 阈值级别:${resultSummary.dynamicLevel}`);
                } else {
                    console.log(`❌ 失败 - 原因:${result.reason} 分类:${resultSummary.category}`);
                }

            } catch (error) {
                results.push({
                    index: i + 1,
                    title: data.title.substring(0, 50) + '...',
                    success: false,
                    error: error.message
                });
                console.log(`💥 异常 - ${error.message}`);
            }

            console.log('');
        }

        // 测试批量处理
        console.log('📦 测试批量处理功能');
        const batchResult = await processor.batchProcessContent(testData, {
            enableAI: false,
            batchSize: 3,
            delayBetweenBatches: 500
        });

        console.log('批量处理结果:', {
            success: batchResult.success,
            total: batchResult.summary.total,
            accepted: batchResult.summary.accepted,
            successRate: batchResult.summary.successRate,
            categoryBreakdown: Object.keys(batchResult.categoryBreakdown || {}).length
        });
        console.log('');

        // 分类统计
        if (batchResult.categoryBreakdown) {
            console.log('📊 分类处理统计:');
            for (const [category, stats] of Object.entries(batchResult.categoryBreakdown)) {
                console.log(`- ${category}: ${stats.count}条, 平均质量:${stats.avgQuality.toFixed(1)}, 平均相关性:${stats.avgRelevance.toFixed(2)}`);
            }
            console.log('');
        }

        // 显示最终统计
        const totalProcessed = results.length;
        const successRate = ((successCount / totalProcessed) * 100).toFixed(1);

        console.log('🏆 优化版测试结果:');
        console.log(`📊 总处理数: ${totalProcessed}`);
        console.log(`✅ 成功数: ${successCount}`);
        console.log(`📈 成功率: ${successRate}%`);
        console.log('');

        // 详细结果表格
        console.log('📋 详细处理结果:');
        console.table(results.map(r => ({
            '序号': r.index,
            '标题': r.title,
            '状态': r.success ? '✅成功' : '❌失败',
            '分类': r.category,
            '质量分数': r.qualityScore,
            '相关性': r.relevanceScore,
            '阈值级别': r.dynamicLevel,
            '质量阈值': r.thresholdUsed?.quality,
            '相关性阈值': r.thresholdUsed?.relevance
        })));

        // 新分类验证
        console.log('');
        console.log('🆕 新增分类验证:');
        const newCategories = ['人工智能', '区块链', '新能源', '生物医药', '游戏', '航空航天', '文化娱乐'];
        const detectedNewCategories = results.filter(r => newCategories.includes(r.category));
        
        console.log(`- 新分类检测成功: ${detectedNewCategories.length}/${newCategories.length}`);
        detectedNewCategories.forEach(r => {
            console.log(`  ✓ ${r.category}: ${r.title}`);
        });

        // 动态阈值效果验证
        console.log('');
        console.log('🎯 动态阈值效果验证:');
        const thresholdLevels = ['highQuality', 'mediumQuality', 'lowQuality'];
        thresholdLevels.forEach(level => {
            const levelResults = results.filter(r => r.dynamicLevel === level);
            if (levelResults.length > 0) {
                const avgQuality = levelResults.reduce((sum, r) => sum + r.qualityScore, 0) / levelResults.length;
                const avgRelevance = levelResults.reduce((sum, r) => sum + r.relevanceScore, 0) / levelResults.length;
                console.log(`- ${level}: ${levelResults.length}条, 平均质量:${avgQuality.toFixed(1)}, 平均相关性:${avgRelevance.toFixed(2)}`);
            }
        });

        // 评估结果
        console.log('');
        if (successRate >= 85) {
            console.log('🎉 优化版测试通过！新配置和分类系统工作优秀！');
            console.log('✨ 微调阈值和扩展分类效果显著');
        } else if (successRate >= 70) {
            console.log('⚠️  测试部分通过，建议进一步优化');
        } else {
            console.log('❌ 测试未通过，需要调整配置');
        }

        // 配置建议
        const configValidation = validateAndSuggest(processor.config);
        if (configValidation.suggestions.length > 0) {
            console.log('');
            console.log('💡 配置优化建议:');
            configValidation.suggestions.forEach(suggestion => {
                console.log(`- ${suggestion}`);
            });
        }

        // 清理资源
        processor.clearAllCaches();

    } catch (error) {
        console.error('❌ 优化版测试失败:', error.message);
        console.error('详细错误:', error.stack);
    } finally {
        console.log('\n📊 优化版测试结束');
        process.exit(0);
    }
}

// 运行测试
if (require.main === module) {
    runOptimizedTest().catch(console.error);
}

module.exports = { runOptimizedTest };