#!/usr/bin/env node

/**
 * 火鸟门户认证管理器
 * 
 * 功能：
 * - 账号密码自动登录
 * - Cookie自动管理和更新
 * - 会话过期自动重新登录
 * - 最小化代码修改
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class FirebirdAuthManager {
    constructor(config = {}) {
        // 认证配置
        this.config = {
            loginUrl: config.loginUrl || process.env.FIREBIRD_LOGIN_URL || 'https://hawaiihub.net/admin/login.php',
            username: config.username || process.env.FIREBIRD_ADMIN_USERNAME || 'admin',
            password: config.password || process.env.FIREBIRD_ADMIN_PASSWORD || 'Abcd2008',
            apiUrl: config.apiUrl || 'https://hawaiihub.net/include/ajax.php',
            cookieBackup: config.cookieBackup || process.env.FIREBIRD_ADMIN_COOKIE,
            timeout: config.timeout || 30000,
            maxRetries: config.maxRetries || 3
        };

        // 当前认证状态
        this.currentCookie = null;
        this.sessionExpiry = null;
        this.isLoggingIn = false;
        this.loginPromise = null;

        // 初始化
        this.loadExistingCookie();
    }

    /**
     * 加载现有Cookie（如果有的话）
     */
    loadExistingCookie() {
        if (this.config.cookieBackup) {
            this.currentCookie = this.config.cookieBackup;
            console.log('🔑 加载现有Cookie认证');
        }
    }

    /**
     * 执行登录获取新Cookie
     */
    async performLogin() {
        if (this.isLoggingIn && this.loginPromise) {
            console.log('⏳ 登录正在进行中，等待完成...');
            return await this.loginPromise;
        }

        this.isLoggingIn = true;
        this.loginPromise = this._doLogin();

        try {
            const result = await this.loginPromise;
            return result;
        } finally {
            this.isLoggingIn = false;
            this.loginPromise = null;
        }
    }

    /**
     * 实际执行登录逻辑
     */
    async _doLogin() {
        console.log('🔐 开始账号密码登录...');
        console.log(`   用户名: ${this.config.username}`);
        console.log(`   登录URL: ${this.config.loginUrl}`);

        try {
            // 第一步：获取登录页面，可能需要获取CSRF token或其他参数
            const loginPageResponse = await axios.get(this.config.loginUrl, {
                timeout: this.config.timeout,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            // 提取Set-Cookie头部
            const initialCookies = this.extractCookiesFromResponse(loginPageResponse);
            console.log('📄 获取登录页面成功');

            // 第二步：提交登录表单
            const loginData = new URLSearchParams({
                username: this.config.username,
                password: this.config.password,
                // 可能需要的其他字段
                dopost: 'login',
                adminstyle: 'newdedecms'
            });

            const loginResponse = await axios.post(this.config.loginUrl, loginData, {
                timeout: this.config.timeout,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': this.config.loginUrl,
                    'Cookie': initialCookies
                },
                maxRedirects: 5,
                validateStatus: (status) => status < 400 // 允许重定向
            });

            // 提取登录后的Cookie
            const loginCookies = this.extractCookiesFromResponse(loginResponse);
            
            if (loginCookies) {
                this.currentCookie = loginCookies;
                this.sessionExpiry = Date.now() + (4 * 60 * 60 * 1000); // 4小时后过期
                
                console.log('✅ 登录成功！');
                console.log(`🔑 新Cookie长度: ${loginCookies.length} 字符`);
                
                // 验证登录是否真的成功
                const isValid = await this.validateSession();
                if (isValid) {
                    // 保存Cookie到配置文件（可选）
                    await this.saveCookieToConfig();
                    return {
                        success: true,
                        cookie: this.currentCookie,
                        message: '登录成功'
                    };
                } else {
                    throw new Error('登录后会话验证失败');
                }
            } else {
                throw new Error('登录响应中未找到有效Cookie');
            }

        } catch (error) {
            console.error('❌ 登录失败:', error.message);
            
            // 如果登录失败，尝试使用备用Cookie
            if (this.config.cookieBackup && !this.currentCookie) {
                console.log('🔄 尝试使用备用Cookie...');
                this.currentCookie = this.config.cookieBackup;
                
                const isValid = await this.validateSession();
                if (isValid) {
                    return {
                        success: true,
                        cookie: this.currentCookie,
                        message: '使用备用Cookie成功'
                    };
                }
            }

            return {
                success: false,
                error: error.message,
                message: '登录失败'
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
     * 验证当前会话是否有效
     */
    async validateSession() {
        if (!this.currentCookie) {
            return false;
        }

        try {
            console.log('🔍 验证会话有效性...');
            
            const response = await axios.get(this.config.apiUrl, {
                params: {
                    service: 'article',
                    action: 'config'
                },
                headers: {
                    'Cookie': this.currentCookie,
                    'User-Agent': 'Mozilla/5.0 (compatible; n8n-automation/1.0)',
                    'Accept': 'application/json, text/plain, */*'
                },
                timeout: this.config.timeout
            });

            const isValid = response.data && response.data.state === 100;
            console.log(`🔍 会话验证结果: ${isValid ? '有效' : '无效'}`);
            
            return isValid;
        } catch (error) {
            console.error('❌ 会话验证失败:', error.message);
            return false;
        }
    }

    /**
     * 获取有效的Cookie（自动登录如果需要）
     */
    async getValidCookie() {
        // 如果有当前Cookie且未过期，直接返回
        if (this.currentCookie && this.sessionExpiry && Date.now() < this.sessionExpiry) {
            return this.currentCookie;
        }

        // 如果有Cookie但不确定是否有效，先验证
        if (this.currentCookie) {
            const isValid = await this.validateSession();
            if (isValid) {
                // 更新过期时间
                this.sessionExpiry = Date.now() + (4 * 60 * 60 * 1000);
                return this.currentCookie;
            }
        }

        // Cookie无效或不存在，执行登录
        console.log('🔄 Cookie无效或不存在，执行自动登录...');
        const loginResult = await this.performLogin();
        
        if (loginResult.success) {
            return this.currentCookie;
        } else {
            throw new Error(`自动登录失败: ${loginResult.error}`);
        }
    }

    /**
     * 检测API响应是否表示会话过期
     */
    isSessionExpiredResponse(response) {
        if (!response || !response.data) {
            return false;
        }

        const data = response.data;
        
        // 检查常见的会话过期标识
        if (data.state === 101 && 
            (data.info === '登录超时，请重新登录！' || 
             data.info === '请先登录！' ||
             data.info.includes('登录') ||
             data.info.includes('超时'))) {
            return true;
        }

        return false;
    }

    /**
     * 带自动重新认证的API请求
     */
    async makeAuthenticatedRequest(config) {
        let lastError = null;

        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                // 获取有效Cookie
                const cookie = await this.getValidCookie();
                
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

                console.log(`📤 发送认证请求 (尝试 ${attempt}/${this.config.maxRetries})`);
                
                const response = await axios(requestConfig);
                
                // 检查响应是否表示会话过期
                if (this.isSessionExpiredResponse(response)) {
                    console.log('⚠️ 检测到会话过期，清除当前Cookie');
                    this.currentCookie = null;
                    this.sessionExpiry = null;
                    
                    if (attempt < this.config.maxRetries) {
                        console.log('🔄 准备重新登录并重试...');
                        continue;
                    } else {
                        throw new Error('会话过期且重试次数已用完');
                    }
                }

                console.log('✅ 认证请求成功');
                return response;

            } catch (error) {
                lastError = error;
                console.error(`❌ 认证请求失败 (尝试 ${attempt}/${this.config.maxRetries}):`, error.message);
                
                // 如果是会话相关错误，清除Cookie
                if (error.message.includes('登录') || error.message.includes('认证') || error.message.includes('401')) {
                    this.currentCookie = null;
                    this.sessionExpiry = null;
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

        throw new Error(`认证请求最终失败: ${lastError.message}`);
    }

    /**
     * 保存Cookie到配置文件
     */
    async saveCookieToConfig() {
        try {
            const configPath = path.join(__dirname, '../n8n-config/huoniao-request-config.json');
            
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                
                // 更新Cookie
                config.huoniao_enhanced_headers.Cookie = this.currentCookie;
                config.session_info.lastUpdated = new Date().toISOString();
                config.session_info.autoLogin = true;
                
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                console.log('💾 Cookie已保存到配置文件');
            }
        } catch (error) {
            console.warn('⚠️ 保存Cookie到配置文件失败:', error.message);
        }
    }

    /**
     * 获取当前认证状态
     */
    getAuthStatus() {
        return {
            hasCookie: !!this.currentCookie,
            sessionExpiry: this.sessionExpiry,
            isExpired: this.sessionExpiry ? Date.now() > this.sessionExpiry : true,
            username: this.config.username,
            loginUrl: this.config.loginUrl
        };
    }
}

module.exports = FirebirdAuthManager;