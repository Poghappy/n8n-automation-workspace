#!/usr/bin/env node

/**
 * 火鸟门户权限问题诊断脚本
 * 
 * 基于用户提供的诊断指南，全面检查火鸟门户的权限配置
 * 并提供详细的修复建议
 */

const FirebirdAuthManager = require('./firebird-auth-manager');
const fs = require('fs');
const path = require('path');

class FirebirdPermissionDiagnostics {
    constructor() {
        this.authManager = new FirebirdAuthManager({
            username: process.env.FIREBIRD_ADMIN_USERNAME || 'admin',
            password: process.env.FIREBIRD_ADMIN_PASSWORD || 'admin'
        });
        
        this.diagnosticResults = {
            timestamp: new Date().toISOString(),
            auth: {},
            permissions: {},
            data: {},
            api: {},
            suggestions: []
        };
    }

    /**
     * 增强版认证请求 - 带详细调试信息
     */
    async sendAuthenticatedRequest(requestData, options = {}) {
        const {
            maxRetries = 3,
            retryDelay = 1000,
            debug = true
        } = options;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (debug) {
                    console.log(`📤 发送认证请求 (尝试 ${attempt}/${maxRetries})`);
                    console.log(`📋 请求数据:`, JSON.stringify(requestData, null, 2));
                }

                const response = await this.authManager.makeAuthenticatedRequest({
                    method: requestData.method || 'GET',
                    url: 'https://hawaiihub.net/include/ajax.php',
                    params: requestData.method === 'POST' ? undefined : requestData,
                    data: requestData.method === 'POST' ? new URLSearchParams(requestData).toString() : undefined,
                    headers: requestData.method === 'POST' ? {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    } : {}
                });

                if (debug) {
                    console.log(`📥 响应数据:`, JSON.stringify(response.data, null, 2));
                }

                // 详细的响应状态分析
                const analysis = this.analyzeResponse(response);
                
                if (analysis.needsReauth) {
                    if (debug) {
                        console.log(`⚠️ 检测到需要重新认证: ${analysis.reason}`);
                    }
                    this.authManager.currentCookie = null;
                    this.authManager.sessionExpiry = null;
                    
                    if (attempt < maxRetries) {
                        continue; // 重试
                    } else {
                        throw new Error(`认证请求最终失败: ${analysis.reason}`);
                    }
                }

                if (analysis.isError && !analysis.isDataEmpty) {
                    throw new Error(`API请求失败: ${analysis.errorMessage}`);
                }

                return {
                    success: true,
                    data: response.data,
                    analysis: analysis
                };

            } catch (error) {
                if (debug) {
                    console.log(`❌ 尝试 ${attempt} 失败:`, error.message);
                }
                
                if (attempt === maxRetries) {
                    return {
                        success: false,
                        error: error.message,
                        data: null
                    };
                }

                // 指数退避延迟
                const delay = retryDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    /**
     * 分析API响应
     */
    analyzeResponse(response) {
        const analysis = {
            needsReauth: false,
            isError: false,
            isDataEmpty: false,
            errorMessage: '',
            reason: '',
            suggestions: []
        };

        // 检查HTTP状态
        if (response.status !== 200) {
            analysis.isError = true;
            analysis.errorMessage = `HTTP ${response.status}`;
            return analysis;
        }

        const data = response.data;

        // 检查业务状态码
        switch (data.state) {
            case 100:
                // 成功
                break;
                
            case 101:
                if (data.info && data.info.includes('登录超时')) {
                    analysis.needsReauth = true;
                    analysis.reason = '会话过期';
                } else if (data.info && data.info.includes('暂无数据')) {
                    analysis.isDataEmpty = true;
                    analysis.suggestions.push('检查数据库是否有相关数据');
                    analysis.suggestions.push('可能需要先创建分类或文章');
                } else if (data.info && data.info.includes('权限')) {
                    analysis.isError = true;
                    analysis.errorMessage = '权限不足';
                    analysis.suggestions.push('检查admin用户的角色权限');
                    analysis.suggestions.push('确认内容管理权限已开启');
                } else {
                    analysis.isError = true;
                    analysis.errorMessage = data.info || '未知的101错误';
                }
                break;
                
            case 102:
                if (data.info && data.info.includes('No data')) {
                    analysis.isDataEmpty = true;
                    analysis.suggestions.push('检查数据库表是否为空');
                    analysis.suggestions.push('可能需要初始化基础数据');
                } else {
                    analysis.isError = true;
                    analysis.errorMessage = data.info || '未知的102错误';
                }
                break;
                
            case 103:
                analysis.needsReauth = true;
                analysis.reason = '权限不足或认证失效';
                analysis.suggestions.push('检查用户权限配置');
                break;
                
            default:
                analysis.isError = true;
                analysis.errorMessage = `未知状态码: ${data.state}`;
        }

        return analysis;
    }

    /**
     * 测试认证状态
     */
    async testAuthStatus() {
        console.log('\n🔐 测试认证状态...');
        
        const authStatus = {
            hasValidCookie: false,
            isLoggedIn: false,
            username: this.authManager.config.username,
            cookieLength: 0,
            sessionExpiry: null
        };

        try {
            const cookie = await this.authManager.getValidCookie();
            if (cookie) {
                authStatus.hasValidCookie = true;
                authStatus.cookieLength = cookie.length;
                authStatus.sessionExpiry = this.authManager.sessionExpiry;
                
                // 验证登录状态
                const configResult = await this.sendAuthenticatedRequest({
                    service: 'article',
                    action: 'config'
                }, { debug: false });
                
                authStatus.isLoggedIn = configResult.success;
                
                console.log(`  ✅ Cookie获取成功 (${cookie.length} 字符)`);
                console.log(`  ${authStatus.isLoggedIn ? '✅' : '❌'} 登录状态验证`);
            } else {
                console.log('  ❌ 无法获取有效Cookie');
            }
        } catch (error) {
            console.log(`  ❌ 认证测试失败: ${error.message}`);
        }

        this.diagnosticResults.auth = authStatus;
        return authStatus;
    }

    /**
     * 测试权限配置
     */
    async testPermissions() {
        console.log('\n🔑 测试权限配置...');
        
        const permissions = {
            config: { status: false, message: '' },
            read: { status: false, message: '' },
            write: { status: false, message: '' },
            categories: { status: false, message: '' },
            articles: { status: false, message: '' }
        };

        // 测试配置权限
        try {
            const configResult = await this.sendAuthenticatedRequest({
                service: 'article',
                action: 'config'
            }, { debug: false });
            
            permissions.config.status = configResult.success;
            permissions.config.message = configResult.success ? '成功' : configResult.error;
            console.log(`  ${configResult.success ? '✅' : '❌'} 系统配置读取权限`);
        } catch (error) {
            permissions.config.message = error.message;
            console.log(`  ❌ 系统配置读取权限: ${error.message}`);
        }

        // 测试分类权限
        try {
            const typeResult = await this.sendAuthenticatedRequest({
                service: 'article',
                action: 'type',
                mold: 0,
                type: 0,
                son: 1,
                page: 1,
                pageSize: 10
            }, { debug: false });
            
            permissions.categories.status = typeResult.success || typeResult.analysis?.isDataEmpty;
            permissions.categories.message = typeResult.success ? '成功' : 
                (typeResult.analysis?.isDataEmpty ? '无数据但权限正常' : typeResult.error);
            console.log(`  ${permissions.categories.status ? '✅' : '❌'} 分类管理权限`);
        } catch (error) {
            permissions.categories.message = error.message;
            console.log(`  ❌ 分类管理权限: ${error.message}`);
        }

        // 测试文章列表权限
        try {
            const listResult = await this.sendAuthenticatedRequest({
                service: 'article',
                action: 'alist',
                page: 1,
                pageSize: 5
            }, { debug: false });
            
            permissions.articles.status = listResult.success || listResult.analysis?.isDataEmpty;
            permissions.articles.message = listResult.success ? '成功' : 
                (listResult.analysis?.isDataEmpty ? '无数据但权限正常' : listResult.error);
            console.log(`  ${permissions.articles.status ? '✅' : '❌'} 文章列表权限`);
        } catch (error) {
            permissions.articles.message = error.message;
            console.log(`  ❌ 文章列表权限: ${error.message}`);
        }

        // 测试发布权限（使用最小化测试数据）
        try {
            const publishResult = await this.sendAuthenticatedRequest({
                method: 'POST',
                service: 'article',
                action: 'put',
                title: '权限测试文章 - 请忽略',
                typeid: 1,
                body: '这是一篇权限测试文章，用于验证发布权限。测试完成后请删除。',
                writer: 'admin',
                source: '权限测试'
            }, { debug: false });
            
            permissions.write.status = publishResult.success;
            permissions.write.message = publishResult.success ? '成功' : publishResult.error;
            console.log(`  ${publishResult.success ? '✅' : '❌'} 文章发布权限`);
            
            // 如果发布成功，记录文章ID以便后续删除
            if (publishResult.success && publishResult.data && publishResult.data.info) {
                console.log(`  📝 测试文章ID: ${publishResult.data.info} (请手动删除)`);
            }
        } catch (error) {
            permissions.write.message = error.message;
            console.log(`  ❌ 文章发布权限: ${error.message}`);
        }

        this.diagnosticResults.permissions = permissions;
        return permissions;
    }

    /**
     * 测试数据可用性
     */
    async testDataAvailability() {
        console.log('\n📊 测试数据可用性...');
        
        const dataStatus = {
            categories: { count: 0, available: false },
            articles: { count: 0, available: false },
            systemConfig: { available: false, data: null }
        };

        // 检查系统配置
        try {
            const configResult = await this.sendAuthenticatedRequest({
                service: 'article',
                action: 'config'
            }, { debug: false });
            
            if (configResult.success) {
                dataStatus.systemConfig.available = true;
                dataStatus.systemConfig.data = configResult.data.info;
                console.log(`  ✅ 系统配置可用`);
                console.log(`     站点名称: ${configResult.data.info.channelName}`);
                console.log(`     模板: ${configResult.data.info.template}`);
            }
        } catch (error) {
            console.log(`  ❌ 系统配置不可用: ${error.message}`);
        }

        // 检查分类数据
        try {
            const typeResult = await this.sendAuthenticatedRequest({
                service: 'article',
                action: 'type'
            }, { debug: false });
            
            if (typeResult.success && typeResult.data.info) {
                if (Array.isArray(typeResult.data.info)) {
                    dataStatus.categories.count = typeResult.data.info.length;
                    dataStatus.categories.available = true;
                } else if (typeof typeResult.data.info === 'object') {
                    dataStatus.categories.count = Object.keys(typeResult.data.info).length;
                    dataStatus.categories.available = true;
                }
            }
            console.log(`  ${dataStatus.categories.available ? '✅' : '⚠️'} 分类数据: ${dataStatus.categories.count} 个`);
        } catch (error) {
            console.log(`  ❌ 分类数据检查失败: ${error.message}`);
        }

        // 检查文章数据
        try {
            const articleResult = await this.sendAuthenticatedRequest({
                service: 'article',
                action: 'alist',
                page: 1,
                pageSize: 1
            }, { debug: false });
            
            if (articleResult.success && articleResult.data.info) {
                if (articleResult.data.info.pageInfo) {
                    dataStatus.articles.count = articleResult.data.info.pageInfo.totalCount || 0;
                    dataStatus.articles.available = true;
                } else if (articleResult.data.info.list) {
                    dataStatus.articles.count = articleResult.data.info.list.length;
                    dataStatus.articles.available = true;
                }
            }
            console.log(`  ${dataStatus.articles.available ? '✅' : '⚠️'} 文章数据: ${dataStatus.articles.count} 篇`);
        } catch (error) {
            console.log(`  ❌ 文章数据检查失败: ${error.message}`);
        }

        this.diagnosticResults.data = dataStatus;
        return dataStatus;
    }

    /**
     * 测试API端点
     */
    async testApiEndpoints() {
        console.log('\n🔌 测试API端点...');
        
        const endpoints = [
            { action: 'config', desc: '系统配置', critical: true },
            { action: 'type', desc: '分类管理', critical: true },
            { action: 'alist', desc: '文章列表', critical: true },
            { action: 'detail', desc: '文章详情', critical: false, params: { param: 1 } },
            { action: 'put', desc: '文章发布', critical: true, method: 'POST', 
              params: { 
                title: 'API测试', 
                typeid: 1, 
                body: '测试内容', 
                writer: 'admin', 
                source: 'API测试' 
              }
            }
        ];

        const results = {};

        for (const endpoint of endpoints) {
            try {
                const requestData = {
                    service: 'article',
                    action: endpoint.action,
                    method: endpoint.method || 'GET',
                    ...endpoint.params
                };

                const result = await this.sendAuthenticatedRequest(requestData, { debug: false });
                
                results[endpoint.action] = {
                    success: result.success,
                    message: result.success ? '正常' : result.error,
                    critical: endpoint.critical,
                    analysis: result.analysis
                };

                const status = result.success ? '✅' : '❌';
                console.log(`  ${status} ${endpoint.desc}: ${result.success ? '正常' : result.error}`);

            } catch (error) {
                results[endpoint.action] = {
                    success: false,
                    message: error.message,
                    critical: endpoint.critical
                };
                console.log(`  ❌ ${endpoint.desc}: ${error.message}`);
            }
        }

        this.diagnosticResults.api = results;
        return results;
    }

    /**
     * 生成诊断报告
     */
    generateDiagnosticReport() {
        console.log('\n📋 系统诊断报告');
        console.log('='.repeat(60));
        
        // 认证状态总结
        console.log('\n🔐 认证状态总结:');
        const auth = this.diagnosticResults.auth;
        console.log(`   Cookie状态: ${auth.hasValidCookie ? '✅ 有效' : '❌ 无效'}`);
        console.log(`   登录状态: ${auth.isLoggedIn ? '✅ 已登录' : '❌ 未登录'}`);
        console.log(`   用户名: ${auth.username}`);
        if (auth.cookieLength > 0) {
            console.log(`   Cookie长度: ${auth.cookieLength} 字符`);
        }

        // 权限状态总结
        console.log('\n🔑 权限状态总结:');
        const perms = this.diagnosticResults.permissions;
        Object.entries(perms).forEach(([key, perm]) => {
            const status = perm.status ? '✅' : '❌';
            console.log(`   ${key}: ${status} ${perm.message}`);
        });

        // 数据状态总结
        console.log('\n📊 数据状态总结:');
        const data = this.diagnosticResults.data;
        console.log(`   系统配置: ${data.systemConfig.available ? '✅ 可用' : '❌ 不可用'}`);
        console.log(`   分类数据: ${data.categories.available ? '✅' : '⚠️'} ${data.categories.count} 个`);
        console.log(`   文章数据: ${data.articles.available ? '✅' : '⚠️'} ${data.articles.count} 篇`);

        // API端点总结
        console.log('\n🔌 API端点总结:');
        const api = this.diagnosticResults.api;
        Object.entries(api).forEach(([endpoint, result]) => {
            const status = result.success ? '✅' : '❌';
            const critical = result.critical ? '🔴' : '🟡';
            console.log(`   ${endpoint}: ${status} ${critical} ${result.message}`);
        });

        // 生成建议
        this.generateSuggestions();
        
        if (this.diagnosticResults.suggestions.length > 0) {
            console.log('\n💡 修复建议:');
            this.diagnosticResults.suggestions.forEach((suggestion, index) => {
                console.log(`   ${index + 1}. ${suggestion}`);
            });
        }

        console.log('\n📄 详细报告已保存到日志文件');
    }

    /**
     * 生成修复建议
     */
    generateSuggestions() {
        const suggestions = [];
        const { auth, permissions, data, api } = this.diagnosticResults;

        // 认证相关建议
        if (!auth.hasValidCookie || !auth.isLoggedIn) {
            suggestions.push('检查用户名密码是否正确');
            suggestions.push('确认登录URL是否可访问');
        }

        // 权限相关建议
        if (!permissions.write.status) {
            suggestions.push('在火鸟门户后台检查admin用户的角色权限');
            suggestions.push('确认"内容管理"权限已开启');
            suggestions.push('检查"文章发布"功能是否被禁用');
        }

        if (!permissions.categories.status) {
            suggestions.push('检查分类管理权限配置');
            suggestions.push('可能需要创建默认分类');
        }

        // 数据相关建议
        if (data.categories.count === 0) {
            suggestions.push('需要在后台创建至少一个文章分类');
            suggestions.push('检查数据库中的分类表是否为空');
        }

        // API相关建议
        const criticalFailures = Object.entries(api).filter(([_, result]) => 
            result.critical && !result.success
        );
        
        if (criticalFailures.length > 0) {
            suggestions.push('存在关键API端点失败，需要检查系统配置');
            suggestions.push('建议联系火鸟门户技术支持');
        }

        // 通用建议
        if (suggestions.length === 0) {
            suggestions.push('系统基本功能正常，发布失败可能是数据格式问题');
            suggestions.push('建议检查发布数据的完整性和格式');
        }

        this.diagnosticResults.suggestions = suggestions;
    }

    /**
     * 保存诊断报告
     */
    async saveDiagnosticReport() {
        const reportPath = path.join(__dirname, '../logs/firebird-permission-diagnostics-report.json');
        
        try {
            const logsDir = path.dirname(reportPath);
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }
            
            fs.writeFileSync(reportPath, JSON.stringify(this.diagnosticResults, null, 2));
            console.log(`📄 详细诊断报告已保存: ${reportPath}`);
        } catch (error) {
            console.error(`❌ 保存诊断报告失败: ${error.message}`);
        }
    }

    /**
     * 运行完整诊断
     */
    async runFullDiagnostics() {
        console.log('🔍 开始火鸟门户权限诊断...');
        console.log(`📅 诊断时间: ${new Date().toISOString()}`);
        console.log(`👤 用户名: ${this.authManager.config.username}`);
        
        try {
            // 1. 测试认证状态
            await this.testAuthStatus();
            
            // 2. 测试权限配置
            await this.testPermissions();
            
            // 3. 测试数据可用性
            await this.testDataAvailability();
            
            // 4. 测试API端点
            await this.testApiEndpoints();
            
            // 5. 生成诊断报告
            this.generateDiagnosticReport();
            
            // 6. 保存报告
            await this.saveDiagnosticReport();
            
            return this.diagnosticResults;
            
        } catch (error) {
            console.error('❌ 诊断过程中发生异常:', error);
            return null;
        }
    }
}

// 运行诊断
if (require.main === module) {
    const diagnostics = new FirebirdPermissionDiagnostics();
    diagnostics.runFullDiagnostics().then(results => {
        if (results) {
            const hasErrors = !results.auth.isLoggedIn || 
                             !results.permissions.write.status ||
                             Object.values(results.api).some(r => r.critical && !r.success);
            
            process.exit(hasErrors ? 1 : 0);
        } else {
            process.exit(1);
        }
    }).catch(error => {
        console.error('❌ 诊断执行失败:', error);
        process.exit(1);
    });
}

module.exports = FirebirdPermissionDiagnostics;