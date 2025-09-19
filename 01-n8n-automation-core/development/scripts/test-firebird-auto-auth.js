#!/usr/bin/env node

/**
 * 火鸟门户自动认证测试脚本
 * 
 * 测试新的账号密码自动认证功能
 */

const FirebirdAuthManager = require('./firebird-auth-manager');
const fs = require('fs');
const path = require('path');

class FirebirdAutoAuthTester {
    constructor() {
        // 初始化认证管理器
        this.authManager = new FirebirdAuthManager({
            username: process.env.FIREBIRD_ADMIN_USERNAME || 'admin',
            password: process.env.FIREBIRD_ADMIN_PASSWORD || 'admin',
            loginUrl: process.env.FIREBIRD_LOGIN_URL || 'https://hawaiihub.net/admin/login.php'
        });
        
        this.testResults = [];
        this.startTime = Date.now();
    }

    /**
     * 测试自动登录功能
     */
    async testAutoLogin() {
        console.log('\n🔐 测试自动登录功能...');
        
        try {
            const authStatus = this.authManager.getAuthStatus();
            console.log('  📋 认证状态:', {
                hasCookie: authStatus.hasCookie,
                isExpired: authStatus.isExpired,
                username: authStatus.username
            });

            const cookie = await this.authManager.getValidCookie();
            
            if (cookie) {
                console.log('  ✅ 自动登录成功');
                console.log(`  🔑 Cookie长度: ${cookie.length} 字符`);
                console.log(`  🔑 Cookie预览: ${cookie.substring(0, 50)}...`);
                
                this.testResults.push({
                    test: 'auto_login',
                    status: 'passed',
                    cookieLength: cookie.length
                });
                return cookie;
            } else {
                throw new Error('获取Cookie失败');
            }
        } catch (error) {
            console.log(`  ❌ 自动登录失败: ${error.message}`);
            this.testResults.push({
                test: 'auto_login',
                status: 'failed',
                error: error.message
            });
            return null;
        }
    }

    /**
     * 测试认证API调用
     */
    async testAuthenticatedAPICall() {
        console.log('\n📡 测试认证API调用...');
        
        try {
            const response = await this.authManager.makeAuthenticatedRequest({
                method: 'GET',
                url: 'https://hawaiihub.net/include/ajax.php',
                params: {
                    service: 'article',
                    action: 'config',
                    param: 'channelName,template'
                }
            });

            if (response.data && response.data.state === 100) {
                console.log('  ✅ 认证API调用成功');
                console.log('  📋 系统信息:');
                console.log(`     站点名称: ${response.data.info.channelName}`);
                console.log(`     模板: ${response.data.info.template}`);
                
                this.testResults.push({
                    test: 'authenticated_api_call',
                    status: 'passed',
                    response: response.data
                });
                return response.data;
            } else {
                throw new Error(`API调用失败: state=${response.data?.state}, info=${response.data?.info}`);
            }
        } catch (error) {
            console.log(`  ❌ 认证API调用失败: ${error.message}`);
            this.testResults.push({
                test: 'authenticated_api_call',
                status: 'failed',
                error: error.message
            });
            return null;
        }
    }

    /**
     * 测试分类列表获取
     */
    async testGetCategories() {
        console.log('\n📂 测试获取分类列表...');
        
        try {
            const response = await this.authManager.makeAuthenticatedRequest({
                method: 'GET',
                url: 'https://hawaiihub.net/include/ajax.php',
                params: {
                    service: 'article',
                    action: 'type',
                    mold: 0,
                    type: 0,
                    son: 1,
                    page: 1,
                    pageSize: 20
                }
            });

            if (response.data && response.data.state === 100) {
                console.log('  ✅ 分类列表获取成功');
                
                if (Array.isArray(response.data.info)) {
                    console.log(`  📋 找到 ${response.data.info.length} 个分类:`);
                    response.data.info.slice(0, 3).forEach(category => {
                        console.log(`     ID: ${category.id}, 名称: ${category.typename}`);
                    });
                } else {
                    console.log('  📋 分类数据格式:', typeof response.data.info);
                }
                
                this.testResults.push({
                    test: 'get_categories',
                    status: 'passed',
                    categoriesCount: Array.isArray(response.data.info) ? response.data.info.length : 0
                });
                return response.data.info;
            } else {
                console.log(`  ⚠️ 分类列表获取返回: state=${response.data?.state}, info=${response.data?.info}`);
                this.testResults.push({
                    test: 'get_categories',
                    status: 'warning',
                    response: response.data
                });
                return null;
            }
        } catch (error) {
            console.log(`  ❌ 分类列表获取失败: ${error.message}`);
            this.testResults.push({
                test: 'get_categories',
                status: 'failed',
                error: error.message
            });
            return null;
        }
    }

    /**
     * 测试新闻列表获取
     */
    async testGetArticles() {
        console.log('\n📰 测试获取新闻列表...');
        
        try {
            const response = await this.authManager.makeAuthenticatedRequest({
                method: 'GET',
                url: 'https://hawaiihub.net/include/ajax.php',
                params: {
                    service: 'article',
                    action: 'alist',
                    page: 1,
                    pageSize: 5,
                    orderby: 1
                }
            });

            if (response.data && response.data.state === 100) {
                console.log('  ✅ 新闻列表获取成功');
                
                if (response.data.info && response.data.info.list) {
                    const articles = response.data.info.list;
                    console.log(`  📋 找到 ${articles.length} 篇新闻:`);
                    
                    articles.slice(0, 2).forEach((article, index) => {
                        console.log(`     ${index + 1}. ID: ${article.id}, 标题: ${article.title?.substring(0, 30)}...`);
                    });
                    
                    if (response.data.info.pageInfo) {
                        console.log(`  📊 总计: ${response.data.info.pageInfo.totalCount} 篇文章`);
                    }
                }
                
                this.testResults.push({
                    test: 'get_articles',
                    status: 'passed',
                    articlesCount: response.data.info?.list?.length || 0
                });
                return response.data.info;
            } else {
                console.log(`  ⚠️ 新闻列表获取返回: state=${response.data?.state}, info=${response.data?.info}`);
                this.testResults.push({
                    test: 'get_articles',
                    status: 'warning',
                    response: response.data
                });
                return null;
            }
        } catch (error) {
            console.log(`  ❌ 新闻列表获取失败: ${error.message}`);
            this.testResults.push({
                test: 'get_articles',
                status: 'failed',
                error: error.message
            });
            return null;
        }
    }

    /**
     * 测试发布接口
     */
    async testPublishArticle() {
        console.log('\n🚀 测试发布接口...');
        
        const testArticle = {
            service: 'article',
            action: 'put',
            title: `自动认证测试文章 - ${new Date().toISOString().substring(0, 19)}`,
            typeid: 1,
            body: `这是一篇通过自动认证系统发布的测试文章。

发布时间: ${new Date().toLocaleString('zh-CN')}
认证方式: 账号密码自动登录
测试目的: 验证自动认证和发布功能

功能特点:
- 自动账号密码登录
- Cookie自动管理和更新
- 会话过期自动重新登录
- 最小化代码修改

请在验证功能后及时删除此测试文章。`,
            writer: '自动认证测试',
            source: '认证测试',
            keywords: '自动认证,测试,火鸟门户,API',
            description: '这是一篇通过自动认证系统发布的测试文章，用于验证账号密码登录功能'
        };

        try {
            console.log('  📤 发送发布请求...');
            console.log(`     标题: ${testArticle.title}`);
            console.log(`     分类ID: ${testArticle.typeid}`);
            
            const response = await this.authManager.makeAuthenticatedRequest({
                method: 'POST',
                url: 'https://hawaiihub.net/include/ajax.php',
                data: new URLSearchParams(testArticle).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.data && response.data.state === 100) {
                console.log('  ✅ 文章发布成功！');
                console.log(`  📋 文章ID: ${response.data.info}`);
                console.log('  ⚠️ 这是测试文章，请记得删除');
                
                this.testResults.push({
                    test: 'publish_article',
                    status: 'passed',
                    articleId: response.data.info
                });
                return response.data.info;
            } else {
                console.log(`  ❌ 文章发布失败: state=${response.data?.state}, info=${response.data?.info}`);
                this.testResults.push({
                    test: 'publish_article',
                    status: 'failed',
                    response: response.data
                });
                return null;
            }
        } catch (error) {
            console.log(`  ❌ 文章发布异常: ${error.message}`);
            this.testResults.push({
                test: 'publish_article',
                status: 'failed',
                error: error.message
            });
            return null;
        }
    }

    /**
     * 测试会话过期处理
     */
    async testSessionExpiredHandling() {
        console.log('\n🔄 测试会话过期处理...');
        
        try {
            // 故意清除当前Cookie来模拟会话过期
            console.log('  🧪 模拟会话过期（清除Cookie）...');
            this.authManager.currentCookie = null;
            this.authManager.sessionExpiry = null;
            
            // 尝试进行API调用，应该自动重新登录
            const response = await this.authManager.makeAuthenticatedRequest({
                method: 'GET',
                url: 'https://hawaiihub.net/include/ajax.php',
                params: {
                    service: 'article',
                    action: 'config'
                }
            });

            if (response.data && response.data.state === 100) {
                console.log('  ✅ 会话过期自动处理成功');
                console.log('  📋 自动重新登录并完成API调用');
                
                this.testResults.push({
                    test: 'session_expired_handling',
                    status: 'passed'
                });
                return true;
            } else {
                throw new Error('自动重新登录后API调用仍然失败');
            }
        } catch (error) {
            console.log(`  ❌ 会话过期处理失败: ${error.message}`);
            this.testResults.push({
                test: 'session_expired_handling',
                status: 'failed',
                error: error.message
            });
            return false;
        }
    }

    /**
     * 生成测试报告
     */
    generateTestReport() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.status === 'passed').length;
        const failedTests = this.testResults.filter(r => r.status === 'failed').length;
        const warningTests = this.testResults.filter(r => r.status === 'warning').length;
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: duration,
            authMethod: 'auto_login_with_username_password',
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                warnings: warningTests,
                successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) + '%' : '0%'
            },
            results: this.testResults,
            authStatus: this.authManager.getAuthStatus()
        };
        
        return report;
    }

    /**
     * 保存测试报告
     */
    async saveTestReport(report) {
        const reportPath = path.join(__dirname, '../logs/firebird-auto-auth-test-report.json');
        
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

    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.log('🚀 开始火鸟门户自动认证测试...');
        console.log(`📅 测试时间: ${new Date().toISOString()}`);
        console.log(`🔐 认证方式: 账号密码自动登录`);
        console.log(`👤 用户名: ${this.authManager.config.username}`);
        
        // 1. 测试自动登录
        const loginSuccess = await this.testAutoLogin();
        if (!loginSuccess) {
            console.log('\n❌ 自动登录失败，跳过后续测试');
            const report = this.generateTestReport();
            await this.saveTestReport(report);
            return false;
        }
        
        // 2. 测试认证API调用
        await this.testAuthenticatedAPICall();
        
        // 3. 测试获取分类列表
        await this.testGetCategories();
        
        // 4. 测试获取新闻列表
        await this.testGetArticles();
        
        // 5. 测试发布接口
        console.log('\n⚠️ 即将进行真实发布测试');
        console.log('   这将在火鸟门户创建一篇测试文章');
        const articleId = await this.testPublishArticle();
        
        // 6. 测试会话过期处理
        await this.testSessionExpiredHandling();
        
        // 生成和保存报告
        const report = this.generateTestReport();
        
        console.log('\n📊 自动认证测试结果汇总:');
        console.log(`   总测试数: ${report.summary.total}`);
        console.log(`   通过: ${report.summary.passed}`);
        console.log(`   失败: ${report.summary.failed}`);
        console.log(`   警告: ${report.summary.warnings}`);
        console.log(`   成功率: ${report.summary.successRate}`);
        console.log(`   耗时: ${report.duration}ms`);
        
        console.log('\n🔐 认证状态:');
        const authStatus = report.authStatus;
        console.log(`   有Cookie: ${authStatus.hasCookie ? '是' : '否'}`);
        console.log(`   会话过期: ${authStatus.isExpired ? '是' : '否'}`);
        console.log(`   用户名: ${authStatus.username}`);
        
        if (articleId) {
            console.log(`\n⚠️ 测试文章已创建，ID: ${articleId}`);
            console.log('   请登录火鸟门户后台删除此测试文章');
        }
        
        await this.saveTestReport(report);
        
        const hasErrors = report.summary.failed > 0;
        if (hasErrors) {
            console.log('\n❌ 部分测试失败，请检查详细报告');
            return false;
        } else {
            console.log('\n✅ 所有测试通过！自动认证系统工作正常');
            return true;
        }
    }
}

// 运行测试
if (require.main === module) {
    const tester = new FirebirdAutoAuthTester();
    tester.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ 自动认证测试执行失败:', error);
        process.exit(1);
    });
}

module.exports = FirebirdAutoAuthTester;