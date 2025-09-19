#!/usr/bin/env node

/**
 * AI智能管理节点测试脚本
 * 
 * 功能测试：
 * 1. AI内容审核和质量评估
 * 2. 智能分类建议和优化逻辑
 * 3. 动态配置管理和策略调整
 * 4. 性能分析和运营建议
 * 
 * @version 1.0.0
 * @date 2025-08-23
 */

const fs = require('fs');
const path = require('path');
const { AIIntelligentManager } = require('../n8n-config/ai-intelligent-management-node.js');

// 测试配置
const TEST_CONFIG = {
    // 测试环境配置
    aiApiKey: process.env.OPENAI_API_KEY || 'test-key',
    aiModel: 'gpt-4',
    enableMockMode: !process.env.OPENAI_API_KEY, // 如果没有真实API密钥则使用模拟模式
    
    // 测试阈值
    contentQualityThreshold: 70,
    relevanceThreshold: 0.6,
    performanceThreshold: 0.90,
    
    // 测试选项
    runFullTests: process.argv.includes('--full'),
    generateReport: process.argv.includes('--report'),
    verbose: process.argv.includes('--verbose')
};

// 测试数据集
const TEST_CASES = [
    {
        name: '高质量科技新闻',
        category: 'high_quality',
        data: {
            title: 'OpenAI发布GPT-5：人工智能迎来新突破',
            content: `OpenAI公司今日正式发布了其最新的大语言模型GPT-5，这标志着人工智能技术的又一重大突破。

据OpenAI首席执行官Sam Altman介绍，GPT-5在多个关键指标上都超越了前代产品：

1. 推理能力提升40%：在复杂逻辑推理任务中表现出色
2. 多模态理解增强：能够更好地理解和生成图像、音频内容
3. 安全性大幅改进：减少了有害内容生成的风险
4. 计算效率优化：相同性能下能耗降低30%

业界专家认为，GPT-5的发布将推动AI在教育、医疗、科研等领域的广泛应用。`,
            summary: 'OpenAI发布GPT-5，在推理能力、多模态理解、安全性等方面实现重大突破',
            source: 'TechCrunch',
            author: 'Sarah Johnson',
            category: '科技资讯',
            categoryId: 1,
            source_url: 'https://techcrunch.com/gpt5-release',
            image_url: 'https://example.com/gpt5-image.jpg',
            keywords: 'OpenAI, GPT-5, 人工智能, 大语言模型',
            publishedAt: new Date().toISOString(),
            quality_score: 85
        },
        expectedDecision: 'approve',
        expectedConfidence: 0.8
    },
    
    {
        name: '中等质量本地新闻',
        category: 'medium_quality',
        data: {
            title: '夏威夷火山国家公园新增观景点',
            content: `夏威夷火山国家公园管理局宣布，将在基拉韦厄火山附近新建一个观景点，为游客提供更安全的火山观赏体验。

新观景点位于火山口东南方向约2公里处，配备了专业的安全设施和导览设备。公园管理员表示，这个位置既能让游客近距离观察火山活动，又能确保安全距离。

预计新观景点将在下个月对公众开放，门票价格与现有观景点保持一致。`,
            summary: '夏威夷火山国家公园新建观景点，提供更安全的火山观赏体验',
            source: 'Hawaii News Now',
            author: 'Local Reporter',
            category: '本地新闻',
            categoryId: 2,
            source_url: 'https://hawaiinewsnow.com/volcano-viewpoint',
            publishedAt: new Date().toISOString(),
            quality_score: 65
        },
        expectedDecision: 'approve',
        expectedConfidence: 0.6
    },
    
    {
        name: '低质量内容',
        category: 'low_quality',
        data: {
            title: '新闻',
            content: '这是一条很短的新闻。没有太多内容。',
            summary: '短新闻',
            source: '未知来源',
            author: '',
            category: '其他',
            categoryId: 1,
            publishedAt: new Date().toISOString(),
            quality_score: 25
        },
        expectedDecision: 'reject',
        expectedConfidence: 0.3
    },
    
    {
        name: '需要修改的内容',
        category: 'needs_revision',
        data: {
            title: '人工智能的发展趋势和未来展望分析报告',
            content: `人工智能技术正在快速发展。机器学习算法越来越先进。深度学习在各个领域都有应用。

自然语言处理技术也在进步。计算机视觉识别准确率提高。语音识别技术更加精确。

未来AI将在更多领域发挥作用。但也需要注意伦理问题。数据隐私保护很重要。

总的来说，AI发展前景广阔。`,
            summary: '分析人工智能发展趋势和未来展望',
            source: 'AI Research Blog',
            author: 'AI Researcher',
            category: '科技资讯',
            categoryId: 1,
            source_url: 'https://airesearch.com/trends',
            publishedAt: new Date().toISOString(),
            quality_score: 55
        },
        expectedDecision: 'revise',
        expectedConfidence: 0.4
    },
    
    {
        name: '置信度过低内容',
        category: 'low_confidence',
        data: {
            title: '某公司可能会发布新产品',
            content: `据不确定的消息来源透露，某科技公司可能正在开发一款新产品。

具体的产品细节尚不清楚，发布时间也没有确定。有传言说这可能是一个革命性的产品，但也有人质疑这个消息的真实性。

我们将继续关注这个消息的后续发展。`,
            summary: '某公司可能发布新产品的不确定消息',
            source: '传言',
            author: '匿名',
            category: '科技资讯',
            categoryId: 1,
            publishedAt: new Date().toISOString(),
            quality_score: 40
        },
        expectedDecision: 'hold',
        expectedConfidence: 0.2
    }
];

// 测试结果收集器
class TestResultCollector {
    constructor() {
        this.results = [];
        this.summary = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: 0,
            startTime: Date.now(),
            endTime: null
        };
    }

    addResult(testCase, result, error = null) {
        const testResult = {
            testName: testCase.name,
            category: testCase.category,
            success: !error,
            result: result,
            error: error,
            timestamp: new Date().toISOString(),
            duration: result?.processingTime || 0
        };

        this.results.push(testResult);
        this.summary.total++;
        
        if (error) {
            this.summary.errors++;
        } else if (this.validateResult(testCase, result)) {
            this.summary.passed++;
        } else {
            this.summary.failed++;
        }
    }

    validateResult(testCase, result) {
        if (!result || !result.success) {
            return false;
        }

        const decision = result.decision?.action;
        const confidence = result.decision?.confidence || 0;

        // 验证决策是否符合预期
        const decisionMatch = decision === testCase.expectedDecision;
        
        // 验证置信度是否在合理范围内
        const confidenceReasonable = Math.abs(confidence - testCase.expectedConfidence) < 0.3;

        return decisionMatch && confidenceReasonable;
    }

    finalize() {
        this.summary.endTime = Date.now();
        this.summary.totalDuration = this.summary.endTime - this.summary.startTime;
        this.summary.successRate = (this.summary.passed / this.summary.total * 100).toFixed(2) + '%';
    }

    generateReport() {
        const report = {
            summary: this.summary,
            results: this.results,
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    generateRecommendations() {
        const recommendations = [];

        if (this.summary.errors > 0) {
            recommendations.push('检查AI服务连接和配置');
        }

        if (this.summary.failed > this.summary.passed) {
            recommendations.push('调整决策阈值和逻辑');
        }

        const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length;
        if (avgDuration > 10000) {
            recommendations.push('优化AI调用性能');
        }

        return recommendations;
    }
}

// 模拟AI响应（用于测试环境）
class MockAIManager extends AIIntelligentManager {
    async callAI(prompt, options = {}) {
        // 模拟AI响应延迟
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // 根据提示词内容生成模拟响应
        if (prompt.includes('内容审核')) {
            return JSON.stringify({
                contentQuality: 70 + Math.random() * 30,
                newsValue: 60 + Math.random() * 40,
                suitability: 65 + Math.random() * 35,
                categoryAccuracy: 75 + Math.random() * 25,
                overallScore: 70 + Math.random() * 30,
                recommendation: Math.random() > 0.3 ? 'approve' : (Math.random() > 0.5 ? 'revise' : 'reject'),
                confidence: 0.3 + Math.random() * 0.7,
                strengths: ['内容结构清晰', '信息来源可靠'],
                weaknesses: ['标题可以更吸引人'],
                optimizationSuggestions: {
                    title: '建议优化标题吸引力',
                    content: '建议增加更多细节',
                    seo: '建议添加相关关键词'
                },
                categoryRecommendation: {
                    recommended: '科技资讯',
                    confidence: 0.8,
                    reason: '内容主要涉及科技话题'
                },
                riskAssessment: {
                    level: 'low',
                    factors: [],
                    mitigation: []
                }
            });
        }

        if (prompt.includes('分类专家')) {
            return JSON.stringify({
                recommendedCategory: '科技资讯',
                categoryId: 1,
                confidence: 0.8,
                reason: '内容主要涉及科技和AI话题',
                alternativeCategories: [
                    { name: '商业财经', id: 4, confidence: 0.3 }
                ],
                tags: ['AI', '科技', '创新'],
                seoKeywords: ['人工智能', '科技新闻', '技术突破']
            });
        }

        if (prompt.includes('配置优化')) {
            return JSON.stringify({
                configOptimizations: {
                    qualityThreshold: 75,
                    processingBatchSize: 10,
                    retryAttempts: 3,
                    cacheExpiry: 3600000
                },
                contentStrategy: {
                    priorityCategories: ['科技资讯', '本地新闻'],
                    optimalPublishTimes: ['09:00', '15:00', '21:00'],
                    contentLengthRange: { min: 300, max: 2000 }
                },
                performanceOptimizations: {
                    recommendedActions: ['增加缓存', '优化批处理'],
                    expectedImprovements: { 'response_time': '20%', 'success_rate': '5%' }
                },
                reasoning: '基于当前性能数据的优化建议'
            });
        }

        if (prompt.includes('运营分析')) {
            return JSON.stringify({
                contentStrategy: {
                    recommendedTopics: ['AI技术', '本地新闻', '科技创新'],
                    optimalPublishFrequency: '每天8-10篇',
                    bestPublishTimes: ['09:00', '12:00', '18:00'],
                    contentLengthOptimization: { min: 300, max: 1500 }
                },
                engagementOptimization: {
                    titleOptimization: '使用数字和问号提高点击率',
                    contentStructure: '采用金字塔结构，重点前置',
                    callToAction: '在文末添加相关链接和讨论引导'
                },
                competitiveAdvantage: {
                    differentiationStrategy: '专注本地化AI新闻',
                    uniqueValueProposition: '结合夏威夷本地特色的科技报道',
                    marketGaps: ['AI教育普及', '本地科技创业']
                },
                kpiTargets: {
                    viewsTarget: 5000,
                    engagementTarget: 15,
                    shareTarget: 8
                },
                actionItems: [
                    { action: '增加本地AI应用案例报道', priority: 'high', timeline: '本周' },
                    { action: '建立读者互动社区', priority: 'medium', timeline: '本月' }
                ]
            });
        }

        // 默认响应
        return JSON.stringify({
            success: true,
            message: '模拟AI响应'
        });
    }

    // 模拟数据获取方法
    async getSystemPerformanceData() {
        return {
            successRate: 92 + Math.random() * 8,
            avgProcessingTime: 1500 + Math.random() * 1000,
            errorRate: Math.random() * 5
        };
    }

    async analyzeContentTrends() {
        return {
            topCategories: ['科技资讯', '本地新闻', '生活资讯'],
            avgQualityScore: 70 + Math.random() * 20,
            publishFrequency: 8 + Math.random() * 4
        };
    }

    async analyzeUserBehavior() {
        return {
            popularContentTypes: ['AI新闻', '科技评测', '本地资讯'],
            optimalPublishTimes: ['09:00', '12:00', '15:00', '18:00'],
            avgReadingTime: 90 + Math.random() * 60
        };
    }
}

// 主测试函数
async function runTests() {
    console.log('🚀 开始AI智能管理节点测试\n');
    console.log(`测试配置:`);
    console.log(`- 模拟模式: ${TEST_CONFIG.enableMockMode ? '是' : '否'}`);
    console.log(`- 完整测试: ${TEST_CONFIG.runFullTests ? '是' : '否'}`);
    console.log(`- 生成报告: ${TEST_CONFIG.generateReport ? '是' : '否'}`);
    console.log(`- 详细输出: ${TEST_CONFIG.verbose ? '是' : '否'}\n`);

    const collector = new TestResultCollector();
    
    // 创建AI管理器实例
    const ManagerClass = TEST_CONFIG.enableMockMode ? MockAIManager : AIIntelligentManager;
    const aiManager = new ManagerClass({
        aiApiKey: TEST_CONFIG.aiApiKey,
        aiModel: TEST_CONFIG.aiModel,
        contentQualityThreshold: TEST_CONFIG.contentQualityThreshold,
        relevanceThreshold: TEST_CONFIG.relevanceThreshold,
        performanceThreshold: TEST_CONFIG.performanceThreshold,
        enableCache: false // 测试时禁用缓存
    });

    // 运行测试用例
    for (const testCase of TEST_CASES) {
        console.log(`📋 测试: ${testCase.name}`);
        
        try {
            const startTime = Date.now();
            
            const result = await aiManager.performIntelligentManagement(testCase.data, {
                enableAI: true,
                strictMode: false,
                includeInsights: TEST_CONFIG.runFullTests,
                includeOptimizations: TEST_CONFIG.runFullTests
            });

            const duration = Date.now() - startTime;
            result.processingTime = duration;

            collector.addResult(testCase, result);

            if (TEST_CONFIG.verbose) {
                console.log(`   ✅ 成功 (${duration}ms)`);
                console.log(`   决策: ${result.decision?.action || 'unknown'}`);
                console.log(`   置信度: ${(result.decision?.confidence || 0).toFixed(2)}`);
                console.log(`   模块: ${Object.keys(result.modules || {}).join(', ')}`);
            } else {
                const decision = result.decision?.action || 'unknown';
                const confidence = (result.decision?.confidence || 0).toFixed(2);
                console.log(`   ✅ ${decision} (置信度: ${confidence}, ${duration}ms)`);
            }

        } catch (error) {
            collector.addResult(testCase, null, error);
            console.log(`   ❌ 失败: ${error.message}`);
            
            if (TEST_CONFIG.verbose) {
                console.log(`   错误详情: ${error.stack}`);
            }
        }

        console.log('');
    }

    // 完成测试
    collector.finalize();

    // 输出测试摘要
    console.log('📊 测试摘要:');
    console.log(`- 总测试数: ${collector.summary.total}`);
    console.log(`- 通过: ${collector.summary.passed}`);
    console.log(`- 失败: ${collector.summary.failed}`);
    console.log(`- 错误: ${collector.summary.errors}`);
    console.log(`- 成功率: ${collector.summary.successRate}`);
    console.log(`- 总耗时: ${collector.summary.totalDuration}ms\n`);

    // 生成详细报告
    if (TEST_CONFIG.generateReport) {
        const report = collector.generateReport();
        const reportPath = path.join(__dirname, '../logs/ai-management-test-report.json');
        
        // 确保日志目录存在
        const logsDir = path.dirname(reportPath);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📄 详细报告已保存到: ${reportPath}`);
    }

    // 输出建议
    const recommendations = collector.generateRecommendations();
    if (recommendations.length > 0) {
        console.log('💡 优化建议:');
        recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec}`);
        });
    }

    // 返回测试结果
    return collector.summary.errors === 0 && collector.summary.failed === 0;
}

// 运行测试
if (require.main === module) {
    runTests()
        .then(success => {
            console.log(success ? '\n🎉 所有测试通过!' : '\n⚠️  部分测试失败，请检查日志');
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('\n💥 测试运行失败:', error);
            process.exit(1);
        });
}

module.exports = {
    runTests,
    TEST_CASES,
    TestResultCollector,
    MockAIManager
};