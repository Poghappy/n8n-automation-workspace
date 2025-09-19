#!/usr/bin/env node

/**
 * 火鸟门户API完整认证测试脚本
 * 
 * 使用完整的管理员认证信息测试火鸟门户API
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class FirebirdAPIFullAuthTester {
    constructor() {
        this.baseUrl = 'https://hawaiihub.net/include/ajax.php';
        this.loadAuthConfig();
        this.testResults = [];
        this.startTime = Date.now();
    }

    // 加载认证配置
    loadAuthConfig() {
        try {
            const configPath = path.join(__dirname, '../n8n-config/huoniao-request-config.json');
            const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            this.fullCookie = configData.huoniao_enhanced_headers.Cookie;
            this.headers = {
                ...configData.huoniao_enhanced_headers,
                'X-Requested-With': 'XMLHttpRequest'
            };
            
            console.log('✅ 认证配置加载成功');
            console.log(`🔑 Cookie长度: ${this.fullCookie.length} 字符`);
            
        } catch (error) {
            console.error('❌ 认证配置加载失败:', error.message);
            process.exit(1);
        }
    }

    // 通用API请求方法
    async makeRequest(params, method = 'GET') {
        const config = {
            method: method,
            url: this.baseUrl,
            headers: { ...this.headers },
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
                service: params.service,
                action: params.action,
                hasAuth: !!this.fullCookie.includes('HN_admin_auth')
            });

            const response = await axios(config);
            
            console.log(`📥 收到响应:`, {
                status: response.status,
                state: response.data?.state,
                hasInfo: !!response.data?.info
            });

            return response.data;
        } catch (error) {
            console.error(`❌ 请求失败:`, {
                message: error.message,
                status: error.response?.status
            });
            throw error;
        }
    }

    // 测试管理员权限验证
    async testAdminAuth() {
        console.log('\n🔐 测试管理员权限...');
        
        try {
            const response = await this.makeRequest({
                service: 'article',
                action: 'config',
                param: 'channelName,template'
            });

            if (response && response.state === 100) {
                console.log('  ✅ 管理员权限验证成功');
                console.log('  📋 系统信息:', response.info);
                
                this.testResults.push({
                    test: 'admin_auth',
                    status: 'passed',
                    response: response
                });
                return true;
            } else {
                console.log('  ❌ 管理员权限验证失败');
                console.log('  📋 响应:', response);
                
                this.testResults.push({
                    test: 'admin_auth',
                    status: 'failed',
                    response: response
                });
                return false;
            }
        } catch (error) {
            console.log(`  ❌ 权限验证异常: ${error.message}`);
            this.testResults.push({
                test: 'admin_auth',
                status: 'error',
                error: error.message
            });
            return false;
        }
    }

    // 测试获取分类列表（管理员权限）
    async testGetCategoriesAdmin() {
        console.log('\n📂 测试获取分类列表（管理员权限）...');
        
        try {
            const response = await this.makeRequest({
                service: 'article',
                action: 'type',
                mold: 0,
                type: 0,
                son: 1,
                page: 1,
                pageSize: 20
            });

            if (response && response.state === 100) {
                console.log('  ✅ 分类列表获取成功');
                
                if (Array.isArray(response.info)) {
                    console.log(`  📋 找到 ${response.info.length} 个分类:`);
                    response.info.slice(0, 5).forEach(category => {
                        console.log(`     ID: ${category.id}, 名称: ${category.typename}, 父级: ${category.parentid}`);
                    });
                } else {
                    console.log('  📋 分类数据:', response.info);
                }
                
                this.testResults.push({
                    test: 'get_categories_admin',
                    status: 'passed',
                    categoriesCount: Array.isArray(response.info) ? response.info.length : 0,
                    response: response
                });
                return response.info;
            } else {
                console.log('  ❌ 分类列表获取失败');
                console.log('  📋 响应:', response);
                
                this.testResults.push({
                    test: 'get_categories_admin',
                    status: 'failed',
                    response: response
                });
                return null;
            }
        } catch (error) {
            console.log(`  ❌ 分类列表获取异常: ${error.message}`);
            this.testResults.push({
                test: 'get_categories_admin',
                status: 'error',
                error: error.message
            });
            return null;
        }
    }

    // 测试获取新闻列表（管理员权限）
    async testGetArticlesAdmin() {
        console.log('\n📰 测试获取新闻列表（管理员权限）...');
        
        try {
            const response = await this.makeRequest({
                service: 'article',
                action: 'alist',
                page: 1,
                pageSize: 5,
                orderby: 1,
                state: '' // 空值表示获取所有状态的文章
            });

            if (response && response.state === 100) {
                console.log('  ✅ 新闻列表获取成功');
                
                if (response.info && response.info.list && Array.isArray(response.info.list)) {
                    const articles = response.info.list;
                    console.log(`  📋 找到 ${articles.length} 篇新闻:`);
                    
                    articles.forEach((article, index) => {
                        console.log(`     ${index + 1}. ID: ${article.id}, 标题: ${article.title?.substring(0, 30)}..., 状态: ${article.arcrank}`);
                    });
                    
                    if (response.info.pageInfo) {
                        const pageInfo = response.info.pageInfo;
                        console.log(`  📊 分页信息: 第${pageInfo.page}页，共${pageInfo.totalPage}页，总计${pageInfo.totalCount}篇`);
                        console.log(`  📊 状态统计: 未审核${pageInfo.gray || 0}篇，已审核${pageInfo.audit || 0}篇，拒绝${pageInfo.refuse || 0}篇`);
                    }
                } else {
                    console.log('  📋 新闻数据格式:', typeof response.info);
                }
                
                this.testResults.push({
                    test: 'get_articles_admin',
                    status: 'passed',
                    articlesCount: response.info?.list?.length || 0,
                    totalCount: response.info?.pageInfo?.totalCount || 0,
                    response: response
                });
                return response.info;
            } else {
                console.log('  ❌ 新闻列表获取失败');
                console.log('  📋 响应:', response);
                
                this.testResults.push({
                    test: 'get_articles_admin',
                    status: 'failed',
                    response: response
                });
                return null;
            }
        } catch (error) {
            console.log(`  ❌ 新闻列表获取异常: ${error.message}`);
            this.testResults.push({
                test: 'get_articles_admin',
                status: 'error',
                error: error.message
            });
            return null;
        }
    }

    // 测试发布接口（完整认证）
    async testPublishWithAuth() {
        console.log('\n🚀 测试发布接口（完整认证）...');
        
        // 创建测试数据
        const testData = {
            service: 'article',
            action: 'put',
            title: `API测试文章 - ${new Date().toISOString().substring(0, 19)}`,
            typeid: 1, // 使用第一个分类
            body: `这是一篇通过API自动发布的测试文章。

发布时间: ${new Date().toLocaleString('zh-CN')}
测试目的: 验证火鸟门户发布接口功能
认证方式: 完整管理员认证

内容说明:
- 这是一篇测试文章，用于验证API发布功能
- 文章包含足够的内容长度以满足系统要求
- 请在验证功能后及时删除此测试文章

技术细节:
- 使用完整的管理员Cookie认证
- 遵循官方API文档规范
- 包含所有必需的字段参数`,
            writer: 'API自动测试',
            source: '接口测试',
            keywords: 'API,测试,自动发布,火鸟门户',
            description: '这是一篇API接口测试文章，用于验证发布功能是否正常工作'
        };

        try {
            console.log('  📤 发送发布请求...');
            console.log(`     标题: ${testData.title}`);
            console.log(`     分类ID: ${testData.typeid}`);
            console.log(`     内容长度: ${testData.body.length} 字符`);
            
            const response = await this.makeRequest(testData, 'POST');
            
            if (response && response.state === 100) {
                console.log('  ✅ 文章发布成功！');
                console.log(`  📋 文章ID: ${response.info}`);
                console.log('  ⚠️  这是测试文章，请记得删除');
                
                this.testResults.push({
                    test: 'publish_with_auth',
                    status: 'passed',
                    articleId: response.info,
                    response: response
                });
                
                return response.info;
            } else {
                console.log('  ❌ 文章发布失败');
                console.log(`  📋 错误信息: state=${response.state}, info=${response.info}`);
                
                this.testResults.push({
                    test: 'publish_with_auth',
                    status: 'failed',
                    response: response
                });
                return null;
            }
        } catch (error) {
            console.log(`  ❌ 文章发布异常: ${error.message}`);
            this.testResults.push({
                test: 'publish_with_auth',
                status: 'error',
                error: error.message
            });
            return null;
        }
    }

    // 测试获取刚发布的文章详情
    async testGetPublishedArticle(articleId) {
        if (!articleId) {
            console.log('\n⏭️  跳过文章详情测试（无文章ID）');
            return;
        }

        console.log('\n📖 测试获取刚发布的文章详情...');
        
        try {
            const response = await this.makeRequest({
                service: 'article',
                action: 'detail',
                param: articleId
            });

            if (response && response.state === 100) {
                console.log('  ✅ 文章详情获取成功');
                console.log(`  📋 文章信息:`);
                console.log(`     ID: ${response.info.id}`);
                console.log(`     标题: ${response.info.title}`);
                console.log(`     作者: ${response.info.writer}`);
                console.log(`     来源: ${response.info.source}`);
                console.log(`     分类: ${response.info.typeName}`);
                console.log(`     状态: ${response.info.arcrank === 1 ? '已审核' : '未审核'}`);
                console.log(`     发布时间: ${new Date(response.info.pubdate * 1000).toLocaleString('zh-CN')}`);
                
                this.testResults.push({
                    test: 'get_published_article',
                    status: 'passed',
                    articleInfo: {
                        id: response.info.id,
                        title: response.info.title,
                        status: response.info.arcrank
                    },
                    response: response
                });
            } else {
                console.log('  ❌ 文章详情获取失败');
                console.log('  📋 响应:', response);
                
                this.testResults.push({
                    test: 'get_published_article',
                    status: 'failed',
                    response: response
                });
            }
        } catch (error) {
            console.log(`  ❌ 文章详情获取异常: ${error.message}`);
            this.testResults.push({
                test: 'get_published_article',
                status: 'error',
                error: error.message
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
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: duration,
            authMethod: 'full_admin_cookie',
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                errors: errorTests,
                successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) + '%' : '0%'
            },
            results: this.testResults,
            apiEndpoints: {
                config: '✅ 系统配置获取',
                type: this.testResults.find(r => r.test === 'get_categories_admin')?.status === 'passed' ? '✅ 分类列表获取' : '❌ 分类列表获取',
                alist: this.testResults.find(r => r.test === 'get_articles_admin')?.status === 'passed' ? '✅ 新闻列表获取' : '❌ 新闻列表获取',
                put: this.testResults.find(r => r.test === 'publish_with_auth')?.status === 'passed' ? '✅ 新闻发布' : '❌ 新闻发布',
                detail: this.testResults.find(r => r.test === 'get_published_article')?.status === 'passed' ? '✅ 新闻详情获取' : '❌ 新闻详情获取'
            }
        };
        
        return report;
    }

    // 保存测试报告
    async saveTestReport(report) {
        const reportPath = path.join(__dirname, '../logs/firebird-api-full-auth-test-report.json');
        
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
        console.log('🚀 开始火鸟门户API完整认证测试...');
        console.log(`📅 测试时间: ${new Date().toISOString()}`);
        console.log(`🌐 API端点: ${this.baseUrl}`);
        console.log(`🔐 认证方式: 完整管理员Cookie`);
        
        // 1. 测试管理员权限
        const authValid = await this.testAdminAuth();
        
        if (!authValid) {
            console.log('\n❌ 管理员权限验证失败，跳过后续测试');
            const report = this.generateTestReport();
            await this.saveTestReport(report);
            return false;
        }
        
        // 2. 测试获取分类列表
        const categories = await this.testGetCategoriesAdmin();
        
        // 3. 测试获取新闻列表
        await this.testGetArticlesAdmin();
        
        // 4. 测试发布接口
        console.log('\n⚠️  即将进行真实发布测试');
        console.log('   这将在火鸟门户创建一篇测试文章');
        console.log('   测试完成后请及时删除测试文章');
        
        const articleId = await this.testPublishWithAuth();
        
        // 5. 测试获取刚发布的文章详情
        await this.testGetPublishedArticle(articleId);
        
        // 生成和保存报告
        const report = this.generateTestReport();
        
        console.log('\n📊 API测试结果汇总:');
        console.log(`   总测试数: ${report.summary.total}`);
        console.log(`   通过: ${report.summary.passed}`);
        console.log(`   失败: ${report.summary.failed}`);
        console.log(`   错误: ${report.summary.errors}`);
        console.log(`   成功率: ${report.summary.successRate}`);
        console.log(`   耗时: ${report.duration}ms`);
        
        console.log('\n🔍 API端点测试结果:');
        Object.entries(report.apiEndpoints).forEach(([endpoint, status]) => {
            console.log(`   ${endpoint}: ${status}`);
        });
        
        if (articleId) {
            console.log(`\n⚠️  测试文章已创建，ID: ${articleId}`);
            console.log('   请登录火鸟门户后台删除此测试文章');
        }
        
        await this.saveTestReport(report);
        
        const hasErrors = report.summary.failed > 0 || report.summary.errors > 0;
        if (hasErrors) {
            console.log('\n❌ 部分API测试失败，请检查详细报告');
            return false;
        } else {
            console.log('\n✅ 所有API测试通过！火鸟门户发布接口工作正常');
            return true;
        }
    }
}

// 运行测试
if (require.main === module) {
    const tester = new FirebirdAPIFullAuthTester();
    tester.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ API测试执行失败:', error);
        process.exit(1);
    });
}

module.exports = FirebirdAPIFullAuthTester;