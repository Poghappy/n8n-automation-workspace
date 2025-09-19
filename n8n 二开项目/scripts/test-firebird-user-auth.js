#!/usr/bin/env node

/**
 * 火鸟门户用户认证测试脚本
 * 
 * 测试用户登录认证功能，验证发布接口权限
 */

const FirebirdUserAuthManager = require('./firebird-user-auth-manager');
const fs = require('fs');
const path = require('path');

class FirebirdUserAuthTester {
    constructor() {
        // 初始化用户认证管理器
        this.userAuthManager = new FirebirdUserAuthManager({
            username: process.env.FIREBIRD_USER_USERNAME || 'admin',
            password: process.env.FIREBIRD_USER_PASSWORD || 'Abcd2008',
            userLoginUrl: process.env.FIREBIRD_USER_LOGIN_URL || 'https://hawaiihub.net/member/login.php'
        });
        
        this.testResults = [];
        this.startTime = Date.now();
    }

    /**
     * 测试用户注册（如果需要）
     */
    async testUserRegistration() {
        console.log('\n📝 测试用户注册...');
        
        try {
            const result = await this.userAuthManager.createTestUserIfNeeded();
            console.log('  ✅ 用户注册检查完成');
            
            this.testResults.push({
                test: 'user_registration',
                status: 'passed',
                note: 'registration_attempted'
            });
        } catch (error) {
            console.log(`  ⚠️ 用户注册检查失败: ${error.message}`);
            this.testResults.push({
                test: 'user_registration',
                status: 'warning',
                error: error.message
            });
        }
    }

    /**
     * 测试用户自动登录功能
     */
    async testUserAutoLogin() {
        console.log('\n🔐 测试用户自动登录功能...');
        
        try {
            const authStatus = this.userAuthManager.getUserAuthStatus();
            console.log('  📋 用户认证状态:', {
                hasCookie: authStatus.hasCookie,
                isExpired: authStatus.isExpired,
                username: authStatus.username
            });

            const cookie = await this.userAuthManager.getValidUserCookie();
            
            if (cookie) {
                console.log('  ✅ 用户自动登录成功');
                console.log(`  🔑 Cookie长度: ${cookie.length} 字符`);
                console.log(`  👤 用户ID: ${this.userAuthManager.userId || '未获取'}`);
                
                this.testResults.push({
                    test: 'user_auto_login',
                    status: 'passed',
                    cookieLength: cookie.length,
                    userId: this.userAuthManager.userId
                });
                return cookie;
            } else {
                throw new Error('获取用户Cookie失败');
            }
        } catch (error) {
            console.log(`  ❌ 用户自动登录失败: ${error.message}`);
            this.testResults.push({
                test: 'user_auto_login',
                status: 'failed',
                error: error.message
            });
            return null;
        }
    }

    /**
     * 测试用户信息获取
     */
    async testGetUserInfo() {
        console.log('\n👤 测试获取用户信息...');
        
        try {
            const response = await this.userAuthManager.makeUserAuthenticatedRequest({
                method: 'GET',
                url: 'https://hawaiihub.net/include/ajax.php',
                params: {
                    service: 'member',
                    action: 'info'
                }
            });

            if (response.data && response.data.state === 100) {
                console.log('  ✅ 用户信息获取成功');
                const userInfo = response.data.info;
                console.log('  📋 用户信息:');
                console.log(`     ID: ${userInfo.id}`);
                console.log(`     用户名: ${userInfo.username}`);
                console.log(`     用户类型: ${userInfo.userType === 1 ? '个人' : '企业'}`);
                console.log(`     状态: ${userInfo.state === 1 ? '正常' : '异常'}`);
                
                this.testResults.push({
                    test: 'get_user_info',
                    status: 'passed',
                    userInfo: {
                        id: userInfo.id,
                        username: userInfo.username,
                        userType: userInfo.userType
                    }
                });
                return userInfo;
            } else {
                throw new Error(`获取用户信息失败: state=${response.data?.state}, info=${response.data?.info}`);
            }
        } catch (error) {
            console.log(`  ❌ 获取用户信息失败: ${error.message}`);
            this.testResults.push({
                test: 'get_user_info',
                status: 'failed',
                error: error.message
            });
            return null;
        }
    }

    /**
     * 测试文章发布接口（用户权限）
     */
    async testUserPublishArticle() {
        console.log('\n🚀 测试用户发布接口...');
        
        const testArticle = {
            service: 'article',
            action: 'put',
            cityid: 1, // 城市ID
            title: `用户认证测试文章 - ${new Date().toISOString().substring(0, 19)}`,
            typeid: 1, // 分类ID
            body: `这是一篇通过用户认证系统发布的测试文章。

发布时间: ${new Date().toLocaleString('zh-CN')}
认证方式: 用户登录认证
测试目的: 验证用户发布权限

功能特点:
- 用户自动登录
- 用户Cookie自动管理
- 用户会话过期自动重新登录
- 支持发布接口所需的用户权限

请在验证功能后及时删除此测试文章。`,
            writer: '用户认证测试',
            source: '用户测试',
            keywords: '用户认证,测试,火鸟门户,发布',
            description: '这是一篇通过用户认证系统发布的测试文章，用于验证用户发布权限',
            mold: 0, // 文章类型：0=普通文章
            prop: 0 // 文章属性
        };

        try {
            console.log('  📤 发送用户发布请求...');
            console.log(`     标题: ${testArticle.title}`);
            console.log(`     分类ID: ${testArticle.typeid}`);
            console.log(`     城市ID: ${testArticle.cityid}`);
            
            const response = await this.userAuthManager.makeUserAuthenticatedRequest({
                method: 'POST',
                url: 'https://hawaiihub.net/include/ajax.php',
                data: new URLSearchParams(testArticle).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.data && response.data.state === 100) {
                console.log('  ✅ 用户文章发布成功！');
                console.log(`  📋 文章ID: ${response.data.info}`);
                console.log('  ⚠️ 这是测试文章，请记得删除');
                
                this.testResults.push({
                    test: 'user_publish_article',
                    status: 'passed',
                    articleId: response.data.info
                });
                return response.data.info;
            } else {
                console.log(`  ❌ 用户文章发布失败: state=${response.data?.state}, info=${response.data?.info}`);
                this.testResults.push({
                    test: 'user_publish_article',
                    status: 'failed',
                    response: response.data
                });
                return null;
            }
        } catch (error) {
            console.log(`  ❌ 用户文章发布异常: ${error.message}`);
            this.testResults.push({
                test: 'user_publish_article',
                status: 'failed',
                error: error.message
            });
            return null;
        }
    }

    /**
     * 测试获取刚发布的文章详情
     */
    async testGetPublishedArticleDetail(articleId) {
        if (!articleId) {
            console.log('\n⏭️  跳过文章详情测试（无文章ID）');
            return;
        }

        console.log('\n📖 测试获取刚发布的文章详情...');
        
        try {
            const response = await this.userAuthManager.makeUserAuthenticatedRequest({
                method: 'GET',
                url: 'https://hawaiihub.net/include/ajax.php',
                params: {
                    service: 'article',
                    action: 'detail',
                    param: articleId
                }
            });

            if (response.data && response.data.state === 100) {
                console.log('  ✅ 文章详情获取成功');
                const article = response.data.info;
                console.log(`  📋 文章信息:`);
                console.log(`     ID: ${article.id}`);
                console.log(`     标题: ${article.title}`);
                console.log(`     作者: ${article.writer}`);
                console.log(`     来源: ${article.source}`);
                console.log(`     状态: ${article.arcrank === 1 ? '已审核' : '待审核'}`);
                
                this.testResults.push({
                    test: 'get_published_article_detail',
                    status: 'passed',
                    articleInfo: {
                        id: article.id,
                        title: article.title,
                        status: article.arcrank
                    }
                });
            } else {
                console.log(`  ❌ 文章详情获取失败: state=${response.data?.state}, info=${response.data?.info}`);
                this.testResults.push({
                    test: 'get_published_article_detail',
                    status: 'failed',
                    response: response.data
                });
            }
        } catch (error) {
            console.log(`  ❌ 文章详情获取异常: ${error.message}`);
            this.testResults.push({
                test: 'get_published_article_detail',
                status: 'failed',
                error: error.message
            });
        }
    }

    /**
     * 测试用户会话过期处理
     */
    async testUserSessionExpiredHandling() {
        console.log('\n🔄 测试用户会话过期处理...');
        
        try {
            // 故意清除当前Cookie来模拟会话过期
            console.log('  🧪 模拟用户会话过期（清除Cookie）...');
            this.userAuthManager.currentCookie = null;
            this.userAuthManager.sessionExpiry = null;
            this.userAuthManager.userId = null;
            
            // 尝试进行API调用，应该自动重新登录
            const response = await this.userAuthManager.makeUserAuthenticatedRequest({
                method: 'GET',
                url: 'https://hawaiihub.net/include/ajax.php',
                params: {
                    service: 'member',
                    action: 'info'
                }
            });

            if (response.data && response.data.state === 100) {
                console.log('  ✅ 用户会话过期自动处理成功');
                console.log('  📋 自动重新登录并完成API调用');
                
                this.testResults.push({
                    test: 'user_session_expired_handling',
                    status: 'passed'
                });
                return true;
            } else {
                throw new Error('用户自动重新登录后API调用仍然失败');
            }
        } catch (error) {
            console.log(`  ❌ 用户会话过期处理失败: ${error.message}`);
            this.testResults.push({
                test: 'user_session_expired_handling',
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
            authMethod: 'user_login_authentication',
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                warnings: warningTests,
                successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) + '%' : '0%'
            },
            results: this.testResults,
            userAuthStatus: this.userAuthManager.getUserAuthStatus()
        };
        
        return report;
    }

    /**
     * 保存测试报告
     */
    async saveTestReport(report) {
        const reportPath = path.join(__dirname, '../logs/firebird-user-auth-test-report.json');
        
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
        console.log('🚀 开始火鸟门户用户认证测试...');
        console.log(`📅 测试时间: ${new Date().toISOString()}`);
        console.log(`🔐 认证方式: 用户登录认证`);
        console.log(`👤 用户名: ${this.userAuthManager.config.username}`);
        
        // 1. 测试用户注册（如果需要）
        await this.testUserRegistration();
        
        // 2. 测试用户自动登录
        const loginSuccess = await this.testUserAutoLogin();
        if (!loginSuccess) {
            console.log('\n❌ 用户自动登录失败，跳过后续测试');
            const report = this.generateTestReport();
            await this.saveTestReport(report);
            return false;
        }
        
        // 3. 测试获取用户信息
        await this.testGetUserInfo();
        
        // 4. 测试用户发布接口
        console.log('\n⚠️ 即将进行真实发布测试');
        console.log('   这将在火鸟门户创建一篇测试文章');
        const articleId = await this.testUserPublishArticle();
        
        // 5. 测试获取刚发布的文章详情
        await this.testGetPublishedArticleDetail(articleId);
        
        // 6. 测试用户会话过期处理
        await this.testUserSessionExpiredHandling();
        
        // 生成和保存报告
        const report = this.generateTestReport();
        
        console.log('\n📊 用户认证测试结果汇总:');
        console.log(`   总测试数: ${report.summary.total}`);
        console.log(`   通过: ${report.summary.passed}`);
        console.log(`   失败: ${report.summary.failed}`);
        console.log(`   警告: ${report.summary.warnings}`);
        console.log(`   成功率: ${report.summary.successRate}`);
        console.log(`   耗时: ${report.duration}ms`);
        
        console.log('\n🔐 用户认证状态:');
        const authStatus = report.userAuthStatus;
        console.log(`   有Cookie: ${authStatus.hasCookie ? '是' : '否'}`);
        console.log(`   会话过期: ${authStatus.isExpired ? '是' : '否'}`);
        console.log(`   用户ID: ${authStatus.userId || '未知'}`);
        console.log(`   用户名: ${authStatus.username}`);
        
        if (articleId) {
            console.log(`\n⚠️ 测试文章已创建，ID: ${articleId}`);
            console.log('   请登录火鸟门户前台删除此测试文章');
        }
        
        await this.saveTestReport(report);
        
        const hasErrors = report.summary.failed > 0;
        if (hasErrors) {
            console.log('\n❌ 部分测试失败，请检查详细报告');
            return false;
        } else {
            console.log('\n✅ 所有测试通过！用户认证系统工作正常');
            return true;
        }
    }
}

// 运行测试
if (require.main === module) {
    const tester = new FirebirdUserAuthTester();
    tester.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ 用户认证测试执行失败:', error);
        process.exit(1);
    });
}

module.exports = FirebirdUserAuthTester;