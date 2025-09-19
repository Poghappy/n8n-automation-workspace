#!/usr/bin/env node

/**
 * 火鸟门户API真实接口测试脚本
 * 
 * 测试火鸟门户API的实际调用，包括：
 * - 会话验证
 * - 分类列表获取
 * - 新闻列表获取
 * - 发布接口测试（可选）
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class FirebirdAPIRealTester {
    constructor() {
        this.baseUrl = 'https://hawaiihub.net/include/ajax.php';
        this.sessionId = process.env.HUONIAO_SESSION_ID;
        this.testResults = [];
        this.startTime = Date.now();
        
        if (!this.sessionId) {
            console.error('❌ 请设置环境变量 HUONIAO_SESSION_ID');
            process.exit(1);
        }
    }

    // 通用API请求方法
    async makeRequest(params, method = 'GET') {
        const config = {
            method: method,
            url: this.baseUrl,
            headers: {
                'Cookie': `PHPSESSID=${this.sessionId}`,
                'User-Agent': 'Mozilla/5.0 (compatible; n8n-automation/1.0)',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Referer': 'https://hawaiihub.net/',
                'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 30000
        };

        if (method === 'GET') {
            config.params = params;
        } else if (method === 'POST') {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            config.data = new URLSearchParams(params).toString();
        }

        try {
            console.log(`📤 发送${method}请求:`, {
                url: this.baseUrl,
                params: Object.keys(params),
                service: params.service,
                action: params.action
            });

            const response = await axios(config);
            
            console.log(`📥 收到响应:`, {
                status: response.status,
                dataType: typeof response.data,
                hasState: response.data && typeof response.data.state !== 'undefined'
            });

            return response.data;
        } catch (error) {
            console.error(`❌ 请求失败:`, {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
            throw error;
        }
    }

    // 测试会话有效性
    async testSessionValidity() {
        console.log('\n🔐 测试会话有效性...');
        
        try {
            const response = await this.makeRequest({
                service: 'article',
                action: 'config'
            });

            if (response && response.state === 100) {
                console.log('  ✅ 会话有效');
                console.log('  📋 系统配置信息:');
                if (response.info) {
                    Object.entries(response.info).forEach(([key, value]) => {
                        if (typeof value === 'string' && value.length < 100) {
                            console.log(`     ${key}: ${value}`);
                        }
                    });
                }
                
                this.testResults.push({
                    test: 'session_validity',
                    status: 'passed',
                    response: response
                });
                return true;
            } else {
                console.log('  ❌ 会话无效或已过期');
                console.log('  📋 响应详情:', response);
                
                this.testResults.push({
                    test: 'session_validity',
                    status: 'failed',
                    response: response
                });
                return false;
            }
        } catch (error) {
            console.log(`  ❌ 会话验证失败: ${error.message}`);
            this.testResults.push({
                test: 'session_validity',
                status: 'error',
                error: error.message
            });
            return false;
        }
    }

    // 测试获取分类列表
    async testGetCategories() {
        console.log('\n📂 测试获取分类列表...');
        
        try {
            const response = await this.makeRequest({
                service: 'article',
                action: 'type',
                page: 1,
                pageSize: 10
            });

            if (response && response.state === 100) {
                console.log('  ✅ 分类列表获取成功');
                
                if (response.info && Array.isArray(response.info)) {
                    console.log(`  📋 找到 ${response.info.length} 个分类:`);
                    response.info.slice(0, 5).forEach(category => {
                        console.log(`     ID: ${category.id}, 名称: ${category.typename}`);
                    });
                } else {
                    console.log('  📋 分类数据格式:', typeof response.info);
                }
                
                this.testResults.push({
                    test: 'get_categories',
                    status: 'passed',
                    categoriesCount: Array.isArray(response.info) ? response.info.length : 0,
                    response: response
                });
                return response.info;
            } else {
                console.log('  ❌ 分类列表获取失败');
                console.log('  📋 响应详情:', response);
                
                this.testResults.push({
                    test: 'get_categories',
                    status: 'failed',
                    response: response
                });
                return null;
            }
        } catch (error) {
            console.log(`  ❌ 分类列表获取异常: ${error.message}`);
            this.testResults.push({
                test: 'get_categories',
                status: 'error',
                error: error.message
            });
            return null;
        }
    }

    // 测试获取新闻列表
    async testGetArticles() {
        console.log('\n📰 测试获取新闻列表...');
        
        try {
            const response = await this.makeRequest({
                service: 'article',
                action: 'alist',
                page: 1,
                pageSize: 5,
                orderby: 1 // 按发布时间排序
            });

            if (response && response.state === 100) {
                console.log('  ✅ 新闻列表获取成功');
                
                if (response.info && response.info.list && Array.isArray(response.info.list)) {
                    const articles = response.info.list;
                    console.log(`  📋 找到 ${articles.length} 篇新闻:`);
                    
                    articles.forEach((article, index) => {
                        console.log(`     ${index + 1}. ID: ${article.id}, 标题: ${article.title?.substring(0, 30)}...`);
                    });
                    
                    if (response.info.pageInfo) {
                        console.log(`  📊 分页信息: 第${response.info.pageInfo.page}页，共${response.info.pageInfo.totalPage}页，总计${response.info.pageInfo.totalCount}篇`);
                    }
                } else {
                    console.log('  📋 新闻数据格式:', typeof response.info);
                }
                
                this.testResults.push({
                    test: 'get_articles',
                    status: 'passed',
                    articlesCount: response.info?.list?.length || 0,
                    totalCount: response.info?.pageInfo?.totalCount || 0,
                    response: response
                });
                return response.info;
            } else {
                console.log('  ❌ 新闻列表获取失败');
                console.log('  📋 响应详情:', response);
                
                this.testResults.push({
                    test: 'get_articles',
                    status: 'failed',
                    response: response
                });
                return null;
            }
        } catch (error) {
            console.log(`  ❌ 新闻列表获取异常: ${error.message}`);
            this.testResults.push({
                test: 'get_articles',
                status: 'error',
                error: error.message
            });
            return null;
        }
    }

    // 测试发布接口（仅验证参数，不实际发布）
    async testPublishInterface() {
        console.log('\n🚀 测试发布接口参数验证...');
        
        // 创建测试数据（故意缺少必填字段来测试验证）
        const testData = {
            service: 'article',
            action: 'put',
            title: '', // 故意为空来测试验证
            typeid: 1,
            body: '这是一个测试内容，用于验证发布接口的参数验证功能。',
            writer: 'API测试',
            source: '接口测试',
            keywords: '测试,API,验证',
            description: '测试发布接口参数验证功能'
        };

        try {
            console.log('  📤 发送测试发布请求（预期会失败）...');
            
            const response = await this.makeRequest(testData, 'POST');
            
            if (response && response.state !== 100) {
                console.log('  ✅ 参数验证正常工作');
                console.log(`  📋 验证结果: state=${response.state}, info=${response.info}`);
                
                this.testResults.push({
                    test: 'publish_validation',
                    status: 'passed',
                    note: 'validation_working',
                    response: response
                });
            } else {
                console.log('  ⚠️  意外的成功响应（可能参数验证有问题）');
                console.log('  📋 响应详情:', response);
                
                this.testResults.push({
                    test: 'publish_validation',
                    status: 'warning',
                    note: 'unexpected_success',
                    response: response
                });
            }
        } catch (error) {
            console.log(`  ❌ 发布接口测试异常: ${error.message}`);
            this.testResults.push({
                test: 'publish_validation',
                status: 'error',
                error: error.message
            });
        }
    }

    // 测试完整发布流程（可选，需要用户确认）
    async testRealPublish() {
        console.log('\n⚠️  真实发布测试（将创建实际文章）');
        
        // 在自动化测试中跳过真实发布
        console.log('  🔒 为避免创建测试数据，跳过真实发布测试');
        console.log('  💡 如需测试真实发布，请手动运行并设置 ENABLE_REAL_PUBLISH=true');
        
        if (process.env.ENABLE_REAL_PUBLISH === 'true') {
            const testArticle = {
                service: 'article',
                action: 'put',
                title: `API测试文章 - ${new Date().toISOString()}`,
                typeid: 1,
                body: `这是一篇通过API自动发布的测试文章。\n\n发布时间: ${new Date().toLocaleString()}\n测试目的: 验证火鸟门户发布接口功能\n\n请在验证后删除此测试文章。`,
                writer: 'API自动测试',
                source: '接口测试',
                keywords: 'API,测试,自动发布',
                description: '这是一篇API接口测试文章，用于验证发布功能'
            };

            try {
                console.log('  🚀 发布真实测试文章...');
                const response = await this.makeRequest(testArticle, 'POST');
                
                if (response && response.state === 100) {
                    console.log('  ✅ 文章发布成功！');
                    console.log(`  📋 文章ID: ${response.info}`);
                    console.log('  ⚠️  请记得删除此测试文章');
                    
                    this.testResults.push({
                        test: 'real_publish',
                        status: 'passed',
                        articleId: response.info,
                        response: response
                    });
                } else {
                    console.log('  ❌ 文章发布失败');
                    console.log('  📋 响应详情:', response);
                    
                    this.testResults.push({
                        test: 'real_publish',
                        status: 'failed',
                        response: response
                    });
                }
            } catch (error) {
                console.log(`  ❌ 文章发布异常: ${error.message}`);
                this.testResults.push({
                    test: 'real_publish',
                    status: 'error',
                    error: error.message
                });
            }
        } else {
            this.testResults.push({
                test: 'real_publish',
                status: 'skipped',
                reason: 'safety_skip'
            });
        }
    }

    // 生成测试报告
    generateTestReport() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.status === 'passed').length;
        const failedTests = this.testResults.filter(r => r.status === 'failed').length;
        const errorTests = this.testResults.filter(r => r.status === 'error').length;
        const skippedTests = this.testResults.filter(r => r.status === 'skipped').length;
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: duration,
            sessionId: this.sessionId.substring(0, 8) + '...',
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                errors: errorTests,
                skipped: skippedTests,
                successRate: totalTests > 0 ? ((passedTests / (totalTests - skippedTests)) * 100).toFixed(2) + '%' : '0%'
            },
            results: this.testResults,
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    // 生成建议
    generateRecommendations() {
        const recommendations = [];
        
        const sessionTest = this.testResults.find(r => r.test === 'session_validity');
        if (sessionTest && sessionTest.status !== 'passed') {
            recommendations.push({
                type: 'critical',
                message: '会话无效或已过期，请更新 HUONIAO_SESSION_ID 环境变量'
            });
        }

        const categoryTest = this.testResults.find(r => r.test === 'get_categories');
        if (categoryTest && categoryTest.status === 'passed' && categoryTest.categoriesCount > 0) {
            recommendations.push({
                type: 'info',
                message: `发现 ${categoryTest.categoriesCount} 个可用分类，可以在发布时选择合适的分类ID`
            });
        }

        const articleTest = this.testResults.find(r => r.test === 'get_articles');
        if (articleTest && articleTest.status === 'passed') {
            recommendations.push({
                type: 'info',
                message: `系统中共有 ${articleTest.totalCount} 篇文章，API接口工作正常`
            });
        }

        const publishTest = this.testResults.find(r => r.test === 'publish_validation');
        if (publishTest && publishTest.status === 'passed') {
            recommendations.push({
                type: 'success',
                message: '发布接口参数验证正常，可以安全使用发布功能'
            });
        }

        return recommendations;
    }

    // 保存测试报告
    async saveTestReport(report) {
        const reportPath = path.join(__dirname, '../logs/firebird-api-real-test-report.json');
        
        try {
            const logsDir = path.dirname(reportPath);
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }
            
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`\n📄 详细测试报告已保存: ${reportPath}`);
        } catch (error) {
            console.error(`❌ 保存测试报告失败: ${error.message}`);
        }
    }

    // 运行所有测试
    async runAllTests() {
        console.log('🚀 开始火鸟门户API真实接口测试...');
        console.log(`📅 测试时间: ${new Date().toISOString()}`);
        console.log(`🔑 会话ID: ${this.sessionId.substring(0, 8)}...`);
        console.log(`🌐 API端点: ${this.baseUrl}`);
        
        // 1. 测试会话有效性
        const sessionValid = await this.testSessionValidity();
        
        if (!sessionValid) {
            console.log('\n❌ 会话无效，跳过后续测试');
            const report = this.generateTestReport();
            await this.saveTestReport(report);
            return false;
        }
        
        // 2. 测试获取分类列表
        await this.testGetCategories();
        
        // 3. 测试获取新闻列表
        await this.testGetArticles();
        
        // 4. 测试发布接口参数验证
        await this.testPublishInterface();
        
        // 5. 测试真实发布（可选）
        await this.testRealPublish();
        
        // 生成和保存报告
        const report = this.generateTestReport();
        
        console.log('\n📊 API测试结果汇总:');
        console.log(`   总测试数: ${report.summary.total}`);
        console.log(`   通过: ${report.summary.passed}`);
        console.log(`   失败: ${report.summary.failed}`);
        console.log(`   错误: ${report.summary.errors}`);
        console.log(`   跳过: ${report.summary.skipped}`);
        console.log(`   成功率: ${report.summary.successRate}`);
        console.log(`   耗时: ${report.duration}ms`);
        
        // 显示建议
        if (report.recommendations.length > 0) {
            console.log('\n💡 建议:');
            report.recommendations.forEach(rec => {
                const icon = rec.type === 'critical' ? '🚨' : rec.type === 'success' ? '✅' : 'ℹ️';
                console.log(`   ${icon} ${rec.message}`);
            });
        }
        
        await this.saveTestReport(report);
        
        const hasErrors = report.summary.failed > 0 || report.summary.errors > 0;
        if (hasErrors) {
            console.log('\n❌ 部分API测试失败，请检查详细报告');
            return false;
        } else {
            console.log('\n✅ 所有API测试通过！火鸟门户接口工作正常');
            return true;
        }
    }
}

// 运行测试
if (require.main === module) {
    const tester = new FirebirdAPIRealTester();
    tester.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ API测试执行失败:', error);
        process.exit(1);
    });
}

module.exports = FirebirdAPIRealTester;