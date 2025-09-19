/**
 * 火鸟门户集成测试脚本
 * 测试完整的数据采集和写入流程
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-01-20
 */

// 引入必要的模块
const fs = require('fs');
const path = require('path');

// 模拟引入自定义模块（在实际环境中需要正确的路径）
const { HuoNiaoNewsIntegrationProcessor } = require('./火鸟门户_新闻数据集成处理器.js');
const { HuoNiaoDataMapper } = require('./火鸟门户_数据映射模块.js');
const { N8NHuoNiaoErrorHandler } = require('./火鸟门户_错误处理与重试模块.js');

class HuoNiaoIntegrationTester {
    constructor() {
        this.processor = new HuoNiaoNewsIntegrationProcessor();
        this.mapper = new HuoNiaoDataMapper();
        this.errorHandler = new N8NHuoNiaoErrorHandler({
            maxRetries: 2,
            retryDelay: 1000,
            enableLogging: true
        });
        
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
    }

    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.log('🚀 开始火鸟门户集成测试...\n');
        
        try {
            // 1. 测试数据映射功能
            await this.testDataMapping();
            
            // 2. 测试错误处理功能
            await this.testErrorHandling();
            
            // 3. 测试完整集成流程
            await this.testFullIntegration();
            
            // 4. 测试工作流JSON结构
            await this.testWorkflowStructure();
            
            // 5. 生成测试报告
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ 测试执行失败:', error);
            this.testResults.errors.push({
                test: 'Test Execution',
                error: error.message
            });
        }
    }

    /**
     * 测试数据映射功能
     */
    async testDataMapping() {
        console.log('📊 测试数据映射功能...');
        
        // 模拟Firecrawl搜索结果
        const mockFirecrawlData = {
            success: true,
            data: [
                {
                    url: 'https://example.com/tech-news-1',
                    title: '人工智能技术新突破：GPT-5即将发布',
                    markdown: '# 人工智能技术新突破：GPT-5即将发布\n\n据最新消息，OpenAI公司宣布...',
                    content: '据最新消息，OpenAI公司宣布其下一代语言模型GPT-5即将发布...',
                    metadata: {
                        title: '人工智能技术新突破：GPT-5即将发布',
                        description: '据最新消息，OpenAI公司宣布其下一代语言模型GPT-5即将发布',
                        author: '科技记者',
                        publishedTime: '2025-01-20T10:00:00Z',
                        category: '科技',
                        tags: ['人工智能', 'GPT-5', 'OpenAI']
                    }
                },
                {
                    url: 'https://example.com/finance-news-1',
                    title: '股市今日大涨，科技股领涨',
                    markdown: '# 股市今日大涨，科技股领涨\n\n今日A股市场表现强劲...',
                    content: '今日A股市场表现强劲，上证指数上涨2.5%...',
                    metadata: {
                        title: '股市今日大涨，科技股领涨',
                        description: '今日A股市场表现强劲，上证指数上涨2.5%',
                        author: '财经记者',
                        publishedTime: '2025-01-20T11:00:00Z',
                        category: '财经',
                        tags: ['股市', '科技股', 'A股']
                    }
                }
            ]
        };

        try {
            // 测试数据映射
            const mappedResult = this.mapper.mapFirecrawlToHuoNiao(mockFirecrawlData);
            
            this.assert(mappedResult.success, '数据映射应该成功');
            this.assert(mappedResult.data.length === 2, '应该映射2条新闻');
            
            const firstNews = mappedResult.data[0];
            this.assert(firstNews.title === '人工智能技术新突破：GPT-5即将发布', '标题映射正确');
            this.assert(firstNews.category_id === 1, '科技分类映射正确'); // 科技分类ID为1
            this.assert(Array.isArray(firstNews.tags), '标签应该是数组');
            this.assert(firstNews.source_url === 'https://example.com/tech-news-1', 'URL映射正确');
            
            console.log('✅ 数据映射测试通过');
            
        } catch (error) {
            console.log('❌ 数据映射测试失败:', error.message);
            this.testResults.errors.push({
                test: 'Data Mapping',
                error: error.message
            });
        }
    }

    /**
     * 测试错误处理功能
     */
    async testErrorHandling() {
        console.log('🛡️ 测试错误处理功能...');
        
        try {
            // 测试重试机制
            let attemptCount = 0;
            const failingOperation = async () => {
                attemptCount++;
                if (attemptCount < 3) {
                    throw new Error('NETWORK_ERROR');
                }
                return { success: true, attempt: attemptCount };
            };

            const result = await this.errorHandler.executeOperation(failingOperation, {
                testCase: 'retry mechanism'
            });

            this.assert(result.success, '重试后应该成功');
            this.assert(attemptCount === 3, '应该重试3次');
            
            // 测试不可重试错误
            const nonRetryableOperation = async () => {
                throw new Error('VALIDATION_ERROR');
            };

            try {
                await this.errorHandler.executeOperation(nonRetryableOperation, {
                    testCase: 'non-retryable error'
                });
                this.assert(false, '不可重试错误应该直接失败');
            } catch (error) {
                this.assert(error.message.includes('VALIDATION_ERROR'), '应该抛出验证错误');
            }

            console.log('✅ 错误处理测试通过');
            
        } catch (error) {
            console.log('❌ 错误处理测试失败:', error.message);
            this.testResults.errors.push({
                test: 'Error Handling',
                error: error.message
            });
        }
    }

    /**
     * 测试完整集成流程
     */
    async testFullIntegration() {
        console.log('🔄 测试完整集成流程...');
        
        try {
            // 模拟N8N工作流数据
            const mockN8NItems = [
                {
                    json: {
                        success: true,
                        data: [
                            {
                                url: 'https://example.com/integration-test',
                                title: '集成测试新闻',
                                markdown: '# 集成测试新闻\n\n这是一条用于集成测试的新闻...',
                                metadata: {
                                    title: '集成测试新闻',
                                    description: '这是一条用于集成测试的新闻',
                                    category: '科技',
                                    tags: ['测试', '集成']
                                }
                            }
                        ]
                    }
                }
            ];

            // 测试处理器执行
            const processorResult = await this.processor.processNewsData(mockN8NItems[0].json);
            
            this.assert(processorResult.success, '处理器应该成功处理数据');
            this.assert(processorResult.processedCount > 0, '应该处理至少一条新闻');
            
            // 测试数据验证
            const validationResult = this.processor.validateNewsData(processorResult.data[0]);
            this.assert(validationResult.isValid, '处理后的数据应该通过验证');
            
            console.log('✅ 完整集成流程测试通过');
            
        } catch (error) {
            console.log('❌ 完整集成流程测试失败:', error.message);
            this.testResults.errors.push({
                test: 'Full Integration',
                error: error.message
            });
        }
    }

    /**
     * 测试工作流JSON结构
     */
    async testWorkflowStructure() {
        console.log('📋 测试工作流JSON结构...');
        
        try {
            const workflowPath = path.join(__dirname, '新闻数据抓取工作流.json');
            
            if (!fs.existsSync(workflowPath)) {
                throw new Error('工作流JSON文件不存在');
            }

            const workflowContent = fs.readFileSync(workflowPath, 'utf8');
            const workflow = JSON.parse(workflowContent);

            // 验证工作流结构
            this.assert(workflow.name === '火鸟门户新闻数据抓取与发布工作流', '工作流名称正确');
            this.assert(Array.isArray(workflow.nodes), '节点应该是数组');
            this.assert(workflow.nodes.length >= 4, '应该至少有4个节点');
            
            // 验证关键节点存在
            const nodeNames = workflow.nodes.map(node => node.name);
            this.assert(nodeNames.includes('定时触发器'), '应该包含定时触发器节点');
            this.assert(nodeNames.includes('Firecrawl搜索新闻'), '应该包含Firecrawl搜索节点');
            this.assert(nodeNames.includes('火鸟门户数据集成处理'), '应该包含数据集成处理节点');
            
            // 验证连接关系
            this.assert(workflow.connections, '应该有连接配置');
            this.assert(workflow.connections['定时触发器'], '定时触发器应该有连接');
            
            console.log('✅ 工作流JSON结构测试通过');
            
        } catch (error) {
            console.log('❌ 工作流JSON结构测试失败:', error.message);
            this.testResults.errors.push({
                test: 'Workflow Structure',
                error: error.message
            });
        }
    }

    /**
     * 断言函数
     */
    assert(condition, message) {
        this.testResults.total++;
        
        if (condition) {
            this.testResults.passed++;
        } else {
            this.testResults.failed++;
            throw new Error(`断言失败: ${message}`);
        }
    }

    /**
     * 生成测试报告
     */
    generateTestReport() {
        console.log('\n📊 测试报告');
        console.log('='.repeat(50));
        console.log(`总测试数: ${this.testResults.total}`);
        console.log(`通过: ${this.testResults.passed}`);
        console.log(`失败: ${this.testResults.failed}`);
        console.log(`成功率: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(2)}%`);
        
        if (this.testResults.errors.length > 0) {
            console.log('\n❌ 错误详情:');
            this.testResults.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.test}: ${error.error}`);
            });
        }
        
        // 生成详细报告文件
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.testResults.total,
                passed: this.testResults.passed,
                failed: this.testResults.failed,
                successRate: ((this.testResults.passed / this.testResults.total) * 100).toFixed(2) + '%'
            },
            errors: this.testResults.errors,
            metrics: this.errorHandler.getMetrics()
        };

        const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        console.log(`\n📄 详细报告已保存到: ${reportPath}`);
        
        if (this.testResults.failed === 0) {
            console.log('\n🎉 所有测试通过！火鸟门户集成已准备就绪。');
        } else {
            console.log('\n⚠️ 部分测试失败，请检查错误并修复。');
        }
    }

    /**
     * 性能测试
     */
    async performanceTest() {
        console.log('⚡ 执行性能测试...');
        
        const testData = Array.from({ length: 100 }, (_, i) => ({
            json: {
                success: true,
                data: [{
                    url: `https://example.com/news-${i}`,
                    title: `测试新闻 ${i}`,
                    content: `这是第${i}条测试新闻的内容...`,
                    metadata: {
                        category: '科技',
                        tags: ['测试', `标签${i}`]
                    }
                }]
            }
        }));

        const startTime = Date.now();
        
        const results = await this.errorHandler.batchProcess(
            testData,
            async (item) => {
                return await this.processor.processNewsData(item.json);
            },
            { concurrency: 5 }
        );

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`性能测试结果:`);
        console.log(`- 处理${testData.length}条数据`);
        console.log(`- 耗时: ${duration}ms`);
        console.log(`- 平均每条: ${(duration / testData.length).toFixed(2)}ms`);
        console.log(`- 成功: ${results.successCount}`);
        console.log(`- 失败: ${results.failureCount}`);
    }
}

// 主执行函数
async function main() {
    const tester = new HuoNiaoIntegrationTester();
    
    // 运行基础测试
    await tester.runAllTests();
    
    // 运行性能测试（可选）
    if (process.argv.includes('--performance')) {
        await tester.performanceTest();
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

// 导出测试类
module.exports = {
    HuoNiaoIntegrationTester
};