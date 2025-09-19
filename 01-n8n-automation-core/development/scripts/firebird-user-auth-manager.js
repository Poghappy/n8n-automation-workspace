#!/usr/bin/env node

/**
 * 火鸟门户用户认证管理器
 * 
 * 功能：
 * - 用户登录认证（区别于管理员认证）
 * - 用户Cookie自动管理和更新
 * - 会话过期自动重新登录
 * - 支持发布接口所需的用户权限
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class FirebirdUserAuthManager {
    constructor(config = {}) {
        // 认证配置
        this.config = {
            // 用户登录相关
            userLoginUrl: config.userLoginUrl || process.env.FIREBIRD_USER_LOGIN_URL || 'https://hawaiihub.net/login.html',
            username: config.username || process.env.FIREBIRD_USER_USERNAME || 'testuser',
            password: config.password || process.env.FIREBIRD_USER_PASSWORD || 'testpass',
            
            // API相关
            apiUrl: config.apiUrl || 'https://hawaiihub.net/include/ajax.php',
            timeout: config.timeout || 30000,
            maxRetries: config.maxRetries || 3,
            
            // 备用Cookie
            cookieBackup: config.cookieBackup || process.env.FIREBIRD_USER_COOKIE
        };

        // 当前认证状态
        this.currentCookie = null;
        this.sessionExpiry = null;
        this.isLoggingIn = false;
        this.loginPromise = null;
        this.userId = null;

        // 初始化
        this.loadExistingCookie();
    }

    /**
     * 加载现有Cookie（如果有的话）
     */
    loadExistingCookie() {
        if (this.config.cookieBackup) {
            this.currentCookie = this.config.cookieBackup;
            console.log('🔑 加载现有用户Cookie认证');
        }
    }

    /**
     * 执行用户登录获取新Cookie
     */
    async performUserLogin() {
        if (this.isLoggingIn && this.loginPromise) {
            console.log('⏳ 用户登录正在进行中，等待完成...');
            return await this.loginPromise;
        }

        this.isLoggingIn = true;
        this.loginPromise = this._doUserLogin();

        try {
            const result = await this.loginPromise;
            return result;
        } finally {
            this.isLoggingIn = false;
            this.loginPromise = null;
        }
    }

    /**
     * 实际执行用户登录逻辑
     */
    async _doUserLogin() {
        console.log('🔐 开始用户登录...');
        console.log(`   用户名: ${this.config.username}`);
        console.log(`   登录URL: ${this.config.userLoginUrl}`);

        try {
            // 第一步：获取登录页面
            const loginPageResponse = await axios.get(this.config.userLoginUrl, {
                timeout: this.config.timeout,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            // 提取初始Cookie
            const initialCookies = this.extractCookiesFromResponse(loginPageResponse);
            console.log('📄 获取用户登录页面成功');

            // 第二步：提交用户登录表单
            const loginData = new URLSearchParams({
                username: this.config.username,
                password: this.config.password,
                dopost: 'login',
                // 可能需要的其他字段
                keeptime: '30', // 保持登录30天
                validate: '', // 验证码（如果需要）
                gotourl: '' // 登录后跳转URL
            });

            const loginResponse = await axios.post(this.config.userLoginUrl, loginData, {
                timeout: this.config.timeout,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': this.config.userLoginUrl,
                    'Cookie': initialCookies || ''
                },
                maxRedirects: 5,
                validateStatus: (status) => status < 400
            });

            // 提取登录后的Cookie
            const loginCookies = this.extractCookiesFromResponse(loginResponse);
            
            if (loginCookies) {
                this.currentCookie = loginCookies;
                this.sessionExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24小时后过期
                
                console.log('✅ 用户登录成功！');
                console.log(`🔑 新Cookie长度: ${loginCookies.length} 字符`);
                
                // 验证登录是否真的成功
                const isValid = await this.validateUserSession();
                if (isValid) {
                    // 保存Cookie到配置文件（可选）
                    await this.saveUserCookieToConfig();
                    return {
                        success: true,
                        cookie: this.currentCookie,
                        userId: this.userId,
                        message: '用户登录成功'
                    };
                } else {
                    throw new Error('用户登录后会话验证失败');
                }
            } else {
                throw new Error('用户登录响应中未找到有效Cookie');
            }

        } catch (error) {
            console.error('❌ 用户登录失败:', error.message);
            
            // 如果登录失败，尝试使用备用Cookie
            if (this.config.cookieBackup && !this.currentCookie) {
                console.log('🔄 尝试使用备用用户Cookie...');
                this.currentCookie = this.config.cookieBackup;
                
                const isValid = await this.validateUserSession();
                if (isValid) {
                    return {
                        success: true,
                        cookie: this.currentCookie,
                        userId: this.userId,
                        message: '使用备用用户Cookie成功'
                    };
                }
            }

            return {
                success: false,
                error: error.message,
                message: '用户登录失败'
            };
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
     * 验证当前用户会话是否有效
     */
    async validateUserSession() {
        if (!this.currentCookie) {
            return false;
        }

        try {
            console.log('🔍 验证用户会话有效性...');
            
            // 使用member服务来验证用户登录状态
            const response = await axios.get(this.config.apiUrl, {
                params: {
                    service: 'member',
                    action: 'info' // 获取用户信息
                },
                headers: {
                    'Cookie': this.currentCookie,
                    'User-Agent': 'Mozilla/5.0 (compatible; n8n-automation/1.0)',
                    'Accept': 'application/json, text/plain, */*'
                },
                timeout: this.config.timeout
            });

            const isValid = response.data && response.data.state === 100;
            if (isValid && response.data.info) {
                this.userId = response.data.info.id;
                console.log(`🔍 用户会话验证结果: 有效 (用户ID: ${this.userId})`);
            } else {
                console.log(`🔍 用户会话验证结果: 无效`);
            }
            
            return isValid;
        } catch (error) {
            console.error('❌ 用户会话验证失败:', error.message);
            return false;
        }
    }

    /**
     * 获取有效的用户Cookie（自动登录如果需要）
     */
    async getValidUserCookie() {
        // 如果有当前Cookie且未过期，直接返回
        if (this.currentCookie && this.sessionExpiry && Date.now() < this.sessionExpiry) {
            return this.currentCookie;
        }

        // 如果有Cookie但不确定是否有效，先验证
        if (this.currentCookie) {
            const isValid = await this.validateUserSession();
            if (isValid) {
                // 更新过期时间
                this.sessionExpiry = Date.now() + (24 * 60 * 60 * 1000);
                return this.currentCookie;
            }
        }

        // Cookie无效或不存在，执行用户登录
        console.log('🔄 用户Cookie无效或不存在，执行自动登录...');
        const loginResult = await this.performUserLogin();
        
        if (loginResult.success) {
            return this.currentCookie;
        } else {
            throw new Error(`用户自动登录失败: ${loginResult.error}`);
        }
    }

    /**
     * 检测API响应是否表示用户会话过期
     */
    isUserSessionExpiredResponse(response) {
        if (!response || !response.data) {
            return false;
        }

        const data = response.data;
        
        // 检查常见的用户会话过期标识
        if (data.state === 200 && 
            (data.info === '登录超时，请重新登录！' || 
             data.info === '请先登录！' ||
             data.info.includes('登录') ||
             data.info.includes('超时'))) {
            return true;
        }

        return false;
    }

    /**
     * 带自动重新认证的用户API请求
     */
    async makeUserAuthenticatedRequest(config) {
        let lastError = null;

        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                // 获取有效用户Cookie
                const cookie = await this.getValidUserCookie();
                
                // 设置认证头
                const requestConfig = {
                    ...config,
                    headers: {
                        ...config.headers,
                        'Cookie': cookie,
                        'User-Agent': 'Mozilla/5.0 (compatible; n8n-automation/1.0)',
                        'Accept': 'application/json, text/plain, */*'
                    },
                    timeout: this.config.timeout
                };

                console.log(`📤 发送用户认证请求 (尝试 ${attempt}/${this.config.maxRetries})`);
                
                const response = await axios(requestConfig);
                
                // 检查响应是否表示用户会话过期
                if (this.isUserSessionExpiredResponse(response)) {
                    console.log('⚠️ 检测到用户会话过期，清除当前Cookie');
                    this.currentCookie = null;
                    this.sessionExpiry = null;
                    this.userId = null;
                    
                    if (attempt < this.config.maxRetries) {
                        console.log('🔄 准备重新登录并重试...');
                        continue;
                    } else {
                        throw new Error('用户会话过期且重试次数已用完');
                    }
                }

                console.log('✅ 用户认证请求成功');
                return response;

            } catch (error) {
                lastError = error;
                console.error(`❌ 用户认证请求失败 (尝试 ${attempt}/${this.config.maxRetries}):`, error.message);
                
                // 如果是会话相关错误，清除Cookie
                if (error.message.includes('登录') || error.message.includes('认证') || error.message.includes('401')) {
                    this.currentCookie = null;
                    this.sessionExpiry = null;
                    this.userId = null;
                }

                if (attempt < this.config.maxRetries) {
                    const delay = 1000 * attempt; // 递增延迟
                    console.log(`⏳ ${delay}ms 后重试...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    break;
                }
            }
        }

        throw new Error(`用户认证请求最终失败: ${lastError.message}`);
    }

    /**
     * 保存用户Cookie到配置文件
     */
    async saveUserCookieToConfig() {
        try {
            const configPath = path.join(__dirname, '../n8n-config/huoniao-user-config.json');
            
            let config = {};
            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }
            
            // 更新用户Cookie
            config.user_cookie = this.currentCookie;
            config.user_id = this.userId;
            config.last_updated = new Date().toISOString();
            config.auto_login = true;
            
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('💾 用户Cookie已保存到配置文件');
        } catch (error) {
            console.warn('⚠️ 保存用户Cookie到配置文件失败:', error.message);
        }
    }

    /**
     * 获取当前用户认证状态
     */
    getUserAuthStatus() {
        return {
            hasCookie: !!this.currentCookie,
            sessionExpiry: this.sessionExpiry,
            isExpired: this.sessionExpiry ? Date.now() > this.sessionExpiry : true,
            userId: this.userId,
            username: this.config.username,
            loginUrl: this.config.userLoginUrl
        };
    }

    /**
     * 创建测试用户账号（如果需要）
     */
    async createTestUserIfNeeded() {
        console.log('🔧 检查测试用户账号...');
        
        try {
            // 尝试注册测试用户
            const registerData = new URLSearchParams({
                username: this.config.username,
                password: this.config.password,
                password2: this.config.password,
                email: 'test@example.com',
                dopost: 'reguser'
            });

            const registerResponse = await axios.post('https://hawaiihub.net/member/reg.php', registerData, {
                timeout: this.config.timeout,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (compatible; n8n-automation/1.0)'
                },
                validateStatus: (status) => status < 500 // 允许4xx状态码
            });

            console.log('📝 测试用户注册尝试完成');
            return true;
        } catch (error) {
            console.log('⚠️ 测试用户注册失败（可能已存在）:', error.message);
            return false;
        }
    }
}

module.exports = FirebirdUserAuthManager;