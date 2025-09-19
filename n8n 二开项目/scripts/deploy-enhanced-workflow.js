#!/usr/bin/env node

/**
 * 增强版新闻采集工作流部署脚本
 * 自动部署和配置增强版的多源新闻采集工作流
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-01-22
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class WorkflowDeployer {
    constructor(config = {}) {
        this.config = {
            n8nUrl: config.n8nUrl || process.env.N8N_URL || 'http://localhost:5678',
            n8nApiKey: config.n8nApiKey || process.env.N8N_API_KEY,
            workspaceRoot: config.workspaceRoot || process.cwd(),
            enableBackup: config.enableBackup !== false,
            enableValidation: config.enableValidation !== false,
            ...config
        };

        this.deploymentLog = [];
    }

    /**
     * 主部署流程
     */
    async deploy() {
        try {
            console.log('🚀 开始部署增强版新闻采集工作流...\n');

            // 1. 环境检查
            await this.checkEnvironment();

            // 2. 备份现有工作流
            if (this.config.enableBackup) {
                await this.backupExistingWorkflows();
            }

            // 3. 验证配置文件
            if (this.config.enableValidation) {
                await this.validateConfigurations();
            }

            // 4. 部署新工作流
            await this.deployWorkflow();

            // 5. 配置凭据
            await this.setupCredentials();

            // 6. 验证部署
            await this.validateDeployment();

            // 7. 生成部署报告
            await this.generateDeploymentReport();

            console.log('✅ 增强版新闻采集工作流部署完成！\n');
            this.printSummary();

        } catch (error) {
            console.error('❌ 部署失败:', error.message);
            await this.rollback();
            process.exit(1);
        }
    }

    /**
     * 环境检查
     */
    async checkEnvironment() {
        console.log('🔍 检查部署环境...');

        // 检查必需的环境变量
        const requiredEnvVars = [
            'OPENAI_API_KEY',
            'NOTION_API_TOKEN',
            'NOTION_DATABASE_ID',
            'HUONIAO_SESSION_ID'
        ];

        const missingVars = [];
        for (const varName of requiredEnvVars) {
            if (!process.env[varName]) {
                missingVars.push(varName);
            }
        }

        if (missingVars.length > 0) {
            throw new Error(`缺少必需的环境变量: ${missingVars.join(', ')}`);
        }

        // 检查n8n连接
        if (this.config.n8nApiKey) {
            try {
                await this.testN8nConnection();
                console.log('✅ n8n连接正常');
            } catch (error) {
                console.warn('⚠️  n8n连接失败，将使用文件部署模式');
            }
        }

        // 检查文件权限
        await this.checkFilePermissions();

        this.log('环境检查完成');
        console.log('✅ 环境检查通过\n');
    }

    /**
     * 测试n8n连接
     */
    async testN8nConnection() {
        const response = await axios.get(`${this.config.n8nUrl}/api/v1/workflows`, {
            headers: {
                'X-N8N-API-KEY': this.config.n8nApiKey
            },
            timeout: 10000
        });

        if (response.status !== 200) {
            throw new Error(`n8n API响应异常: ${response.status}`);
        }
    }

    /**
     * 检查文件权限
     */
    async checkFilePermissions() {
        const paths = [
            'n8n-config/workflows',
            'n8n-config/credentials',
            'scripts',
            'logs'
        ];

        for (const dirPath of paths) {
            const fullPath = path.join(this.config.workspaceRoot, dirPath);
            try {
                await fs.access(fullPath, fs.constants.R_OK | fs.constants.W_OK);
            } catch (error) {
                // 目录不存在，尝试创建
                await fs.mkdir(fullPath, { recursive: true });
                console.log(`📁 创建目录: ${dirPath}`);
            }
        }
    }

    /**
     * 备份现有工作流
     */
    async backupExistingWorkflows() {
        console.log('💾 备份现有工作流...');

        const backupDir = path.join(this.config.workspaceRoot, 'backups', `workflow-backup-${Date.now()}`);
        await fs.mkdir(backupDir, { recursive: true });

        // 备份现有工作流文件
        const workflowFiles = [
            '火鸟门户_新闻采集工作流_增强版.json',
            'n8n-config/workflows/notion-integration-workflow.json'
        ];

        for (const file of workflowFiles) {
            const sourcePath = path.join(this.config.workspaceRoot, file);
            try {
                await fs.access(sourcePath);
                const backupPath = path.join(backupDir, path.basename(file));
                await fs.copyFile(sourcePath, backupPath);
                console.log(`📋 备份文件: ${file}`);
            } catch (error) {
                console.log(`⚠️  文件不存在，跳过备份: ${file}`);
            }
        }

        this.backupDir = backupDir;
        this.log(`工作流备份完成: ${backupDir}`);
        console.log('✅ 工作流备份完成\n');
    }

    /**
     * 验证配置文件
     */
    async validateConfigurations() {
        console.log('🔧 验证配置文件...');

        // 验证源配置文件
        const configPath = path.join(this.config.workspaceRoot, 'n8n-config/enhanced-sources-config.json');
        try {
            const configContent = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configContent);
            
            // 验证RSS源配置
            if (!config.rssSources || !Array.isArray(config.rssSources)) {
                throw new Error('RSS源配置无效');
            }

            // 验证GitHub源配置
            if (!config.githubSources || !Array.isArray(config.githubSources)) {
                throw new Error('GitHub源配置无效');
            }

            console.log(`✅ 配置验证通过: ${config.rssSources.length}个RSS源, ${config.githubSources.length}个GitHub源`);

        } catch (error) {
            throw new Error(`配置文件验证失败: ${error.message}`);
        }

        // 验证工作流文件
        const workflowPath = path.join(this.config.workspaceRoot, 'n8n-config/workflows/enhanced-news-collection-workflow.json');
        try {
            const workflowContent = await fs.readFile(workflowPath, 'utf8');
            const workflow = JSON.parse(workflowContent);
            
            if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
                throw new Error('工作流节点配置无效');
            }

            console.log(`✅ 工作流验证通过: ${workflow.nodes.length}个节点`);

        } catch (error) {
            throw new Error(`工作流文件验证失败: ${error.message}`);
        }

        this.log('配置文件验证完成');
        console.log('✅ 配置验证通过\n');
    }

    /**
     * 部署工作流
     */
    async deployWorkflow() {
        console.log('📦 部署增强版工作流...');

        const workflowPath = path.join(this.config.workspaceRoot, 'n8n-config/workflows/enhanced-news-collection-workflow.json');
        const workflowContent = await fs.readFile(workflowPath, 'utf8');
        const workflow = JSON.parse(workflowContent);

        if (this.config.n8nApiKey) {
            // 通过API部署
            await this.deployViaAPI(workflow);
        } else {
            // 文件部署模式
            await this.deployViaFile(workflow);
        }

        this.log('工作流部署完成');
        console.log('✅ 工作流部署完成\n');
    }

    /**
     * 通过API部署工作流
     */
    async deployViaAPI(workflow) {
        try {
            // 检查是否已存在同名工作流
            const existingWorkflows = await axios.get(`${this.config.n8nUrl}/api/v1/workflows`, {
                headers: {
                    'X-N8N-API-KEY': this.config.n8nApiKey
                }
            });

            const existingWorkflow = existingWorkflows.data.data.find(w => w.name === workflow.name);

            if (existingWorkflow) {
                // 更新现有工作流
                await axios.put(`${this.config.n8nUrl}/api/v1/workflows/${existingWorkflow.id}`, workflow, {
                    headers: {
                        'X-N8N-API-KEY': this.config.n8nApiKey,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('🔄 更新现有工作流');
                this.workflowId = existingWorkflow.id;
            } else {
                // 创建新工作流
                const response = await axios.post(`${this.config.n8nUrl}/api/v1/workflows`, workflow, {
                    headers: {
                        'X-N8N-API-KEY': this.config.n8nApiKey,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('🆕 创建新工作流');
                this.workflowId = response.data.id;
            }

            // 激活工作流
            await axios.post(`${this.config.n8nUrl}/api/v1/workflows/${this.workflowId}/activate`, {}, {
                headers: {
                    'X-N8N-API-KEY': this.config.n8nApiKey
                }
            });
            console.log('🟢 工作流已激活');

        } catch (error) {
            throw new Error(`API部署失败: ${error.message}`);
        }
    }

    /**
     * 通过文件部署工作流
     */
    async deployViaFile(workflow) {
        const deployPath = path.join(this.config.workspaceRoot, 'n8n-config/workflows/deployed-enhanced-workflow.json');
        await fs.writeFile(deployPath, JSON.stringify(workflow, null, 2));
        console.log(`📄 工作流文件已保存: ${deployPath}`);
        console.log('ℹ️  请手动导入到n8n中并激活');
    }

    /**
     * 配置凭据
     */
    async setupCredentials() {
        console.log('🔐 配置系统凭据...');

        const credentials = [
            {
                name: 'OpenAI API',
                type: 'openAiApi',
                data: {
                    apiKey: process.env.OPENAI_API_KEY
                }
            },
            {
                name: 'Notion API',
                type: 'notionApi',
                data: {
                    apiKey: process.env.NOTION_API_TOKEN
                }
            },
            {
                name: 'HuoNiao Session',
                type: 'httpHeaderAuth',
                data: {
                    name: 'Cookie',
                    value: `PHPSESSID=${process.env.HUONIAO_SESSION_ID}`
                }
            }
        ];

        if (this.config.n8nApiKey) {
            // 通过API配置凭据
            for (const cred of credentials) {
                try {
                    await this.setupCredentialViaAPI(cred);
                } catch (error) {
                    console.warn(`⚠️  凭据配置失败: ${cred.name} - ${error.message}`);
                }
            }
        } else {
            // 生成凭据配置文件
            await this.generateCredentialFiles(credentials);
        }

        this.log('凭据配置完成');
        console.log('✅ 凭据配置完成\n');
    }

    /**
     * 通过API配置凭据
     */
    async setupCredentialViaAPI(credential) {
        try {
            await axios.post(`${this.config.n8nUrl}/api/v1/credentials`, credential, {
                headers: {
                    'X-N8N-API-KEY': this.config.n8nApiKey,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`🔑 凭据配置成功: ${credential.name}`);
        } catch (error) {
            if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
                console.log(`🔄 凭据已存在: ${credential.name}`);
            } else {
                throw error;
            }
        }
    }

    /**
     * 生成凭据配置文件
     */
    async generateCredentialFiles(credentials) {
        const credDir = path.join(this.config.workspaceRoot, 'n8n-config/credentials');
        
        for (const cred of credentials) {
            const credFile = path.join(credDir, `${cred.name.toLowerCase().replace(/\s+/g, '_')}.json`);
            await fs.writeFile(credFile, JSON.stringify(cred, null, 2));
            console.log(`📄 凭据文件已生成: ${path.basename(credFile)}`);
        }

        console.log('ℹ️  请手动导入凭据到n8n中');
    }

    /**
     * 验证部署
     */
    async validateDeployment() {
        console.log('🧪 验证部署结果...');

        // 检查工作流文件
        const workflowPath = path.join(this.config.workspaceRoot, 'n8n-config/workflows/enhanced-news-collection-workflow.json');
        try {
            await fs.access(workflowPath);
            console.log('✅ 工作流文件存在');
        } catch (error) {
            throw new Error('工作流文件不存在');
        }

        // 检查配置文件
        const configPath = path.join(this.config.workspaceRoot, 'n8n-config/enhanced-sources-config.json');
        try {
            await fs.access(configPath);
            console.log('✅ 配置文件存在');
        } catch (error) {
            throw new Error('配置文件不存在');
        }

        // 检查脚本文件
        const scriptFiles = [
            'scripts/enhanced-data-validator.js',
            'scripts/enhanced-error-handler.js'
        ];

        for (const scriptFile of scriptFiles) {
            const scriptPath = path.join(this.config.workspaceRoot, scriptFile);
            try {
                await fs.access(scriptPath);
                console.log(`✅ 脚本文件存在: ${path.basename(scriptFile)}`);
            } catch (error) {
                throw new Error(`脚本文件不存在: ${scriptFile}`);
            }
        }

        // 如果有API访问权限，验证工作流状态
        if (this.config.n8nApiKey && this.workflowId) {
            try {
                const response = await axios.get(`${this.config.n8nUrl}/api/v1/workflows/${this.workflowId}`, {
                    headers: {
                        'X-N8N-API-KEY': this.config.n8nApiKey
                    }
                });

                if (response.data.active) {
                    console.log('✅ 工作流已激活');
                } else {
                    console.warn('⚠️  工作流未激活');
                }
            } catch (error) {
                console.warn('⚠️  无法验证工作流状态');
            }
        }

        this.log('部署验证完成');
        console.log('✅ 部署验证通过\n');
    }

    /**
     * 生成部署报告
     */
    async generateDeploymentReport() {
        console.log('📊 生成部署报告...');

        const report = {
            deploymentId: `DEPLOY_${Date.now()}`,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            status: 'success',
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                workspaceRoot: this.config.workspaceRoot
            },
            deployedComponents: {
                workflow: 'enhanced-news-collection-workflow.json',
                configuration: 'enhanced-sources-config.json',
                scripts: [
                    'enhanced-data-validator.js',
                    'enhanced-error-handler.js',
                    'deploy-enhanced-workflow.js'
                ]
            },
            deploymentLog: this.deploymentLog,
            nextSteps: [
                '1. 验证n8n中的工作流已正确导入',
                '2. 检查所有凭据配置是否正确',
                '3. 手动触发工作流进行测试',
                '4. 监控工作流执行日志',
                '5. 根据需要调整数据源配置'
            ]
        };

        const reportPath = path.join(this.config.workspaceRoot, 'logs', `deployment-report-${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        console.log(`📋 部署报告已生成: ${reportPath}`);
        this.log('部署报告生成完成');
    }

    /**
     * 回滚操作
     */
    async rollback() {
        if (!this.backupDir) {
            console.log('⚠️  没有备份，无法回滚');
            return;
        }

        console.log('🔄 执行回滚操作...');

        try {
            // 恢复备份文件
            const backupFiles = await fs.readdir(this.backupDir);
            for (const file of backupFiles) {
                const backupPath = path.join(this.backupDir, file);
                const restorePath = path.join(this.config.workspaceRoot, file);
                await fs.copyFile(backupPath, restorePath);
                console.log(`🔄 恢复文件: ${file}`);
            }

            console.log('✅ 回滚完成');
        } catch (error) {
            console.error('❌ 回滚失败:', error.message);
        }
    }

    /**
     * 打印部署摘要
     */
    printSummary() {
        console.log('📋 部署摘要:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ 增强版新闻采集工作流部署成功');
        console.log('📦 包含组件:');
        console.log('   • 多源新闻采集节点 (RSS + GitHub)');
        console.log('   • 智能内容处理和验证');
        console.log('   • 增强错误处理和重试机制');
        console.log('   • 数据标准化和质量控制');
        console.log('');
        console.log('🔧 下一步操作:');
        console.log('   1. 在n8n中激活工作流');
        console.log('   2. 验证所有凭据配置');
        console.log('   3. 执行测试运行');
        console.log('   4. 监控执行日志');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    /**
     * 记录部署日志
     */
    log(message) {
        this.deploymentLog.push({
            timestamp: new Date().toISOString(),
            message
        });
    }
}

// 主函数
async function main() {
    const deployer = new WorkflowDeployer({
        enableBackup: true,
        enableValidation: true
    });

    await deployer.deploy();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('部署失败:', error);
        process.exit(1);
    });
}

module.exports = { WorkflowDeployer };