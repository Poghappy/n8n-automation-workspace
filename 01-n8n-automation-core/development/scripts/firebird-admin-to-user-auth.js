#!/usr/bin/env node

/**
 * 火鸟门户管理员转用户认证管理器
 * 
 * 基于生产环境代码分析，使用管理员权限来模拟用户发布
 * 通过分析article.class.php发现，发布接口需要用户ID，我们可以通过管理员权限来获取或创建用户会话
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class FirebirdAdminToUserAuth {
    constructor() {
        // 从配置文件加载管理员认证信息
        this.loadAdminConfig();
        this.testResults = [];
        this.startTime = Date.now();
    }

    /**
     * 加载管理员认证配置
     */
    loadAdminConfig() {
        try {
            const configPath = path.join(__dirname, '../n8n-config/huoniao-request-config.json');
            const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            this.adminCookie = configData.huoniao_enhanced_headers.Cookie;
            this.adminHeaders = configData.huoniao_enhanced_headers;
            
            console.log('✅ 管理员认证配置加载成功');
            
        } catch (error) {
            console.error('❌ 管理员认证配置加载失败:', error.message);
            process.exit(1);
        }
    }

    /**
     * 使用管理员权限进行API调用
     */
    async makeAdminRequest(params, method = 'GET') {
        const config = {
            method: method,
            url: 'https://hawaiihub.net/include/ajax.php',
            headers: { ...this.adminHeaders },
            timeout: 30000
        };

        if (method === 'GET') {
            config.params = params;
        } else if (method === 'POST') {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            config.data = new URLSearchParams(params).toString();
        }

        try {
            console.log(`📤 发送管理员${method}请求:`, {
                service: params.service,
                action: params.action
            });

            const response = await axios(config);
            
            console.log(`📥 收到响应:`, {
                status: response.status,
                state: response.data?.state,
                hasInfo: !!response.data?.info
            });

            return response.data;
        } catch (error) {
            console.error(`❌ 管理员请求失败:`, error.message);
            throw error;
        }
    }

    /**
     * 测试管理员权限获取用户列表
     */
    async testGetUserList() {
        console.log('\n👥 测试获取用户列表（管理员权限）...');
        
        try {
            const response = await this.makeAdminRequest({
                service: 'member',
                action: 'list',
                page: 1,
                pageSize: 10
            });

            if (response && response.state === 100) {
                console.log('  ✅ 用户列表获取成功');
                
                if (response.info && response.info.list && Array.isArray(response.info.list)) {
                    const users = response.info.list;
                    console.log(`  📋 找到 ${users.length} 个用户:`);
                    
                    users.slice(0, 3).forEach((user, index) => {
                        console.log(`     ${index + 1}. ID: ${user.id}, 用户名: ${user.username}, 类型: ${user.userType === 1 ? '个人' : '企业'}`);
                    });
                    
                    // 找到admin用户
                    const adminUser = users.find(user => user.username === 'admin');
                    if (adminUser) {
                        console.log(`  🎯 找到admin用户: ID=${adminUser.id}, 状态=${adminUser.state}`);
                        this.adminUserId = adminUser.id;
                    }
                }
                
                this.testResults.push({
                    test: 'get_user_list',
                    status: 'passed',
                    userCount: response.info?.list?.length || 0
                });
                return response.info;
            } else {
                console.log(`  ❌ 用户列表获取失败: state=${response?.state}, info=${response?.info}`);
                this.testResults.push({
                    test: 'get_user_list',
                    status: 'failed',
                    response: response
                });
                return null;
            }
        } catch (error) {
            console.log(`  ❌ 用户列表获取异常: ${error.message}`);
            this.testResults.push({
                test: 'get_user_list',
                status: 'failed',
                error: error.message
            });
            return null;
        }
    }

    /**
     * 测试管理员权限模拟用户登录
     */
    async testAdminAuthorizedLogin() {
        if (!this.adminUserId) {
            console.log('\n⏭️  跳过管理员授权登录测试（未找到admin用户ID）');
            return false;
        }

        console.log('\n🔐 测试管理员授权用户登录...');
        
        try {
            // 使用管理员权限进行授权登录
            // 基于index.php中的authorizedLogin逻辑
            const response = await axios.get('https://hawaiihub.net/index.php', {
                params: {
                    action: 'authorizedLogin',
                    id: this.adminUserId,
                    redirect: 'https://hawaiihub.net/'
                },
                headers: {
                    ...this.adminHeaders
                },
                timeout: 30000,
                maxRedirects: 0, // 不自动跟随重定向
                validateStatus: (status) => status < 400 || status === 302
            });

            // 提取用户登录后的Cookie
            const userCookie = this.extractCookiesFromResponse(response);
            
            if (userCookie) {
                this.userCookie = userCookie;
                console.log('  ✅ 管理员授权用户登录成功');
                console.log(`  🔑 用户Cookie长度: ${userCookie.length} 字符`);
                
                this.testResults.push({
                    test: 'admin_authorized_login',
                    status: 'passed',
                    cookieLength: userCookie.length
                });
                return true;
            } else {
                throw new Error('未能获取用户登录Cookie');
            }
        } catch (error) {
            console.log(`  ❌ 管理员授权用户登录失败: ${error.message}`);
            this.testResults.push({
                test: 'admin_authorized_login',
                status: 'failed',
                error: error.message
            });
            return false;
        }
    }

    /**
     * 从响应中提取Cookie
     */
    extractCookiesFromResponse(response) {
        const setCookieHeaders = response.headers['set-cookie'];
        if (!setCookieHeaders) {
            return null;
        }

        const cookies = [];
        setCookieHeaders.forEach(cookieHeader => {
            const cookiePart = cookieHeader.split(';')[0];
            cookies.push(cookiePart);
        });

        return cookies.join('; ');
    }

    /**
     * 测试用户权限发布文章
     */
    async testUserPublishWithAdminAuth() {
        if (!this.userCookie) {
            console.log('\n⏭️  跳过用户发布测试（无用户Cookie）');
            return null;
        }

        console.log('\n🚀 测试用户权限发布文章...');
        
        const testArticle = {
            service: 'article',
            action: 'put',
            cityid: 1, // 城市ID
            title: `管理员授权发布测试 - ${new Date().toISOString().substring(0, 19)}`,
            typeid: 1, // 分类ID
            body: `这是一篇通过管理员授权用户权限发布的测试文章。

发布时间: ${new Date().toLocaleString('zh-CN')}
认证方式: 管理员授权用户登录
用户ID: ${this.adminUserId}
测试目的: 验证发布接口权限问题解决方案

技术方案:
- 使用管理员权限获取用户列表
- 通过authorizedLogin进行用户授权登录
- 获取用户登录Cookie进行发布操作
- 解决发布接口的用户权限验证问题

请在验证功能后及时删除此测试文章。`,
            writer: '管理员授权测试',
            source: '权限测试',
            keywords: '管理员授权,用户发布,权限测试,火鸟门户',
            description: '通过管理员授权用户权限发布的测试文章，验证发布接口权限解决方案',
            mold: 0, // 文章类型：0=普通文章
            prop: 0 // 文章属性
        };

        try {
            console.log('  📤 发送用户权限发布请求...');
            console.log(`     标题: ${testArticle.title}`);
            console.log(`     用户ID: ${this.adminUserId}`);
            
            const response = await axios.post('https://hawaiihub.net/include/ajax.php', 
                new URLSearchParams(testArticle).toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': this.userCookie,
                    'User-Agent': 'Mozilla/5.0 (compatible; n8n-automation/1.0)',
                    'Accept': 'application/json, text/plain, */*',
                    'Referer': 'https://hawaiihub.net/'
                },
                timeout: 30000
            });

            if (response.data && response.data.state === 100) {
                console.log('  ✅ 用户权限文章发布成功！');
                console.log(`  📋 文章ID: ${response.data.info}`);
                console.log('  ⚠️ 这是测试文章，请记得删除');
                
                this.testResults.push({
                    test: 'user_publish_with_admin_auth',
                    status: 'passed',
                    articleId: response.data.info
                });
                return response.data.info;
            } else {
                console.log(`  ❌ 用户权限文章发布失败: state=${response.data?.state}, info=${response.data?.info}`);
                this.testResults.push({
                    test: 'user_publish_with_admin_auth',
                    status: 'failed',
                    response: response.data
                });
                return null;
            }
        } catch (error) {
            console.log(`  ❌ 用户权限文章发布异常: ${error.message}`);
            this.testResults.push({
                test: 'user_publish_with_admin_auth',
                status: 'failed',
                error: error.message
            });
            return null;
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
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: duration,
            authMethod: 'admin_authorized_user_login',
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) + '%' : '0%'
            },
            results: this.testResults,
            adminUserId: this.adminUserId,
            hasUserCookie: !!this.userCookie
        };
        
        return report;
    }

    /**
     * 保存测试报告
     */
    async saveTestReport(report) {
        const reportPath = path.join(__dirname, '../logs/firebird-admin-to-user-auth-test-report.json');
        
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
        console.log('🚀 开始火鸟门户管理员转用户认证测试...');
        console.log(`📅 测试时间: ${new Date().toISOString()}`);
        console.log(`🔐 认证方式: 管理员授权用户登录`);
        
        // 1. 测试获取用户列表
        await this.testGetUserList();
        
        // 2. 测试管理员授权用户登录
        const authSuccess = await this.testAdminAuthorizedLogin();
        
        // 3. 测试用户权限发布文章
        if (authSuccess) {
            const articleId = await this.testUserPublishWithAdminAuth();
            
            if (articleId) {
                console.log(`\n🎉 发布测试成功！文章ID: ${articleId}`);
            }
        }
        
        // 生成和保存报告
        const report = this.generateTestReport();
        
        console.log('\n📊 管理员转用户认证测试结果:');
        console.log(`   总测试数: ${report.summary.total}`);
        console.log(`   通过: ${report.summary.passed}`);
        console.log(`   失败: ${report.summary.failed}`);
        console.log(`   成功率: ${report.summary.successRate}`);
        console.log(`   耗时: ${report.duration}ms`);
        
        await this.saveTestReport(report);
        
        const hasErrors = report.summary.failed > 0;
        if (hasErrors) {
            console.log('\n❌ 部分测试失败，请检查详细报告');
            return false;
        } else {
            console.log('\n✅ 所有测试通过！管理员转用户认证方案可行');
            return true;
        }
    }
}

// 运行测试
if (require.main === module) {
    const tester = new FirebirdAdminToUserAuth();
    tester.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ 管理员转用户认证测试失败:', error);
        process.exit(1);
    });
}

module.exports = FirebirdAdminToUserAuth;