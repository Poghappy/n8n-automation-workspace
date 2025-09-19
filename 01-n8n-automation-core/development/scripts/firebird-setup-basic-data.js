#!/usr/bin/env node

/**
 * 火鸟门户基础数据设置脚本
 * 
 * 基于后台管理界面的观察，创建必要的基础数据
 * 包括分类创建和权限验证
 */

const FirebirdAuthManager = require('./firebird-auth-manager');

class FirebirdBasicDataSetup {
    constructor() {
        this.authManager = new FirebirdAuthManager({
            username: process.env.FIREBIRD_ADMIN_USERNAME || 'admin',
            password: process.env.FIREBIRD_ADMIN_PASSWORD || 'admin'
        });
    }

    /**
     * 检查并创建基础分类
     */
    async setupBasicCategories() {
        console.log('\n📂 设置基础分类...');
        
        const basicCategories = [
            { name: '科技资讯', description: '科技相关新闻和资讯' },
            { name: 'AI新闻', description: '人工智能相关新闻' },
            { name: '本地新闻', description: '夏威夷本地新闻' },
            { name: '社区动态', description: '华人社区动态' }
        ];

        for (const category of basicCategories) {
            try {
                console.log(`  📝 尝试创建分类: ${category.name}`);
                
                // 尝试通过不同的API端点创建分类
                const createResult = await this.authManager.makeAuthenticatedRequest({
                    method: 'POST',
                    url: 'https://hawaiihub.net/include/ajax.php',
                    data: new URLSearchParams({
                        service: 'article',
                        action: 'type_add', // 尝试分类添加接口
                        typename: category.name,
                        description: category.description,
                        parentid: 0
                    }).toString(),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

                if (createResult.data && createResult.data.state === 100) {
                    console.log(`    ✅ 分类创建成功: ${category.name}`);
                } else {
                    console.log(`    ⚠️ 分类创建响应: ${JSON.stringify(createResult.data)}`);
                }

            } catch (error) {
                console.log(`    ❌ 分类创建失败: ${error.message}`);
            }
        }
    }

    /**
     * 检查后台权限配置
     */
    async checkBackendPermissions() {
        console.log('\n🔍 检查后台权限配置...');
        
        try {
            // 尝试访问管理后台的权限检查接口
            const permissionCheck = await this.authManager.makeAuthenticatedRequest({
                method: 'GET',
                url: 'https://hawaiihub.net/admin/index.php',
                params: {
                    action: 'check_permissions'
                }
            });

            console.log('  📋 权限检查结果:', permissionCheck.data);

        } catch (error) {
            console.log(`  ❌ 权限检查失败: ${error.message}`);
        }

        // 检查用户角色信息
        try {
            const userInfo = await this.authManager.makeAuthenticatedRequest({
                method: 'GET',
                url: 'https://hawaiihub.net/include/ajax.php',
                params: {
                    service: 'user',
                    action: 'info'
                }
            });

            if (userInfo.data) {
                console.log('  👤 用户信息:', userInfo.data);
            }

        } catch (error) {
            console.log(`  ❌ 用户信息获取失败: ${error.message}`);
        }
    }

    /**
     * 尝试不同的发布接口参数组合
     */
    async testPublishVariations() {
        console.log('\n🧪 测试不同的发布参数组合...');
        
        const variations = [
            {
                name: '最小参数',
                params: {
                    service: 'article',
                    action: 'put',
                    title: '测试文章1',
                    typeid: 1,
                    body: '测试内容',
                    writer: 'admin',
                    source: '测试'
                }
            },
            {
                name: '完整参数',
                params: {
                    service: 'article',
                    action: 'put',
                    title: '测试文章2',
                    typeid: 1,
                    body: '详细的测试内容，包含更多信息以满足可能的长度要求。',
                    writer: 'admin',
                    source: '完整测试',
                    keywords: '测试,文章',
                    description: '这是一篇测试文章',
                    litpic: '',
                    imglist: '',
                    pubdate: Math.floor(Date.now() / 1000)
                }
            },
            {
                name: '草稿模式',
                params: {
                    service: 'article',
                    action: 'put',
                    title: '草稿测试文章',
                    typeid: 1,
                    body: '草稿内容',
                    writer: 'admin',
                    source: '草稿测试',
                    arcrank: 0 // 0=草稿，1=发布
                }
            }
        ];

        for (const variation of variations) {
            try {
                console.log(`  📝 测试: ${variation.name}`);
                
                const result = await this.authManager.makeAuthenticatedRequest({
                    method: 'POST',
                    url: 'https://hawaiihub.net/include/ajax.php',
                    data: new URLSearchParams(variation.params).toString(),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

                if (result.data) {
                    console.log(`    📋 响应: state=${result.data.state}, info=${result.data.info}`);
                    
                    if (result.data.state === 100) {
                        console.log(`    ✅ ${variation.name} 发布成功！文章ID: ${result.data.info}`);
                        return { success: true, variation: variation.name, articleId: result.data.info };
                    }
                }

            } catch (error) {
                console.log(`    ❌ ${variation.name} 失败: ${error.message}`);
            }
        }

        return { success: false };
    }

    /**
     * 分析后台管理界面
     */
    async analyzeBackendInterface() {
        console.log('\n🔍 分析后台管理界面...');
        
        try {
            // 尝试获取后台主页内容
            const backendHome = await this.authManager.makeAuthenticatedRequest({
                method: 'GET',
                url: 'https://hawaiihub.net/admin/index.php'
            });

            if (backendHome.data) {
                // 分析HTML内容中的权限信息
                const htmlContent = backendHome.data;
                
                // 检查是否包含内容管理相关的菜单项
                const hasContentManagement = htmlContent.includes('资讯管理') || 
                                            htmlContent.includes('内容管理') ||
                                            htmlContent.includes('文章管理');
                
                console.log(`  📋 内容管理菜单: ${hasContentManagement ? '✅ 存在' : '❌ 不存在'}`);
                
                // 检查是否有发布权限
                const hasPublishPermission = htmlContent.includes('发布') || 
                                           htmlContent.includes('添加') ||
                                           htmlContent.includes('新增');
                
                console.log(`  📋 发布权限: ${hasPublishPermission ? '✅ 存在' : '❌ 不存在'}`);
            }

        } catch (error) {
            console.log(`  ❌ 后台界面分析失败: ${error.message}`);
        }
    }

    /**
     * 生成权限配置建议
     */
    generatePermissionSuggestions() {
        console.log('\n💡 权限配置建议:');
        console.log('');
        console.log('基于诊断结果，建议检查以下配置：');
        console.log('');
        console.log('1. 🔐 用户权限设置:');
        console.log('   - 登录火鸟门户后台: https://hawaiihub.net/admin/');
        console.log('   - 进入"用户管理" → "管理员权限"');
        console.log('   - 确认admin用户具有以下权限：');
        console.log('     ✓ 内容管理权限');
        console.log('     ✓ 文章发布权限');
        console.log('     ✓ 分类管理权限');
        console.log('');
        console.log('2. 📂 分类设置:');
        console.log('   - 进入"资讯管理" → "分类管理"');
        console.log('   - 创建至少一个文章分类');
        console.log('   - 确认分类ID为1的分类存在');
        console.log('');
        console.log('3. ⚙️ 系统设置:');
        console.log('   - 检查"系统设置" → "发布设置"');
        console.log('   - 确认API发布功能已启用');
        console.log('   - 检查是否有IP白名单限制');
        console.log('');
        console.log('4. 🔧 API配置:');
        console.log('   - 确认API接口未被禁用');
        console.log('   - 检查是否需要特殊的API密钥');
        console.log('   - 验证CSRF保护设置');
    }

    /**
     * 运行完整设置流程
     */
    async runSetup() {
        console.log('🚀 开始火鸟门户基础数据设置...');
        console.log(`📅 设置时间: ${new Date().toISOString()}`);
        
        try {
            // 1. 检查后台权限配置
            await this.checkBackendPermissions();
            
            // 2. 分析后台管理界面
            await this.analyzeBackendInterface();
            
            // 3. 尝试创建基础分类
            await this.setupBasicCategories();
            
            // 4. 测试不同的发布参数组合
            const publishResult = await this.testPublishVariations();
            
            // 5. 生成配置建议
            this.generatePermissionSuggestions();
            
            console.log('\n📊 设置结果总结:');
            console.log(`   发布测试: ${publishResult.success ? '✅ 成功' : '❌ 失败'}`);
            if (publishResult.success) {
                console.log(`   成功方案: ${publishResult.variation}`);
                console.log(`   文章ID: ${publishResult.articleId}`);
            }
            
            return publishResult.success;
            
        } catch (error) {
            console.error('❌ 设置过程中发生异常:', error);
            return false;
        }
    }
}

// 运行设置
if (require.main === module) {
    const setup = new FirebirdBasicDataSetup();
    setup.runSetup().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ 设置执行失败:', error);
        process.exit(1);
    });
}

module.exports = FirebirdBasicDataSetup;