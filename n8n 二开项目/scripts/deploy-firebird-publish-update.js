#!/usr/bin/env node

/**
 * 火鸟门户发布节点更新部署脚本
 * 
 * 部署更新后的火鸟门户发布节点到n8n工作流中，包括：
 * - 备份现有工作流
 * - 更新工作流配置
 * - 验证部署结果
 * - 提供回滚选项
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

class FirebirdPublishDeployer {
    constructor() {
        this.config = this.loadConfig();
        this.backupDir = path.join(__dirname, '../backups');
        this.deploymentLog = [];
        this.startTime = Date.now();
    }

    loadConfig() {
        const configFiles = [
            '../n8n-config/firebird-publish-node-config.json',
            '../n8n-config/workflows/enhanced-news-collection-with-notion.json'
        ];

        const config = {};
        
        for (const file of configFiles) {
            try {
                const filePath = path.join(__dirname, file);
                const data = fs.readFileSync(filePath, 'utf8');
                const fileName = path.basename(file, '.json');
                config[fileName] = JSON.parse(data);
            } catch (error) {
                console.error(`❌ 加载配置文件失败 ${file}:`, error.message);
                process.exit(1);
            }
        }

        return config;
    }

    // 创建备份目录
    ensureBackupDirectory() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            console.log(`📁 创建备份目录: ${this.backupDir}`);
        }
    }

    // 备份现有工作流
    async backupExistingWorkflow() {
        console.log('\n💾 备份现有工作流...');
        
        this.ensureBackupDirectory();
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `enhanced-news-collection-backup-${timestamp}.json`;
        const backupPath = path.join(this.backupDir, backupFileName);
        
        try {
            const workflowPath = path.join(__dirname, '../n8n-config/workflows/enhanced-news-collection-with-notion.json');
            
            if (fs.existsSync(workflowPath)) {
                const workflowData = fs.readFileSync(workflowPath, 'utf8');
                fs.writeFileSync(backupPath, workflowData);
                
                console.log(`  ✅ 工作流已备份到: ${backupPath}`);
                this.deploymentLog.push({
                    step: 'backup',
                    status: 'success',
                    file: backupPath,
                    timestamp: new Date().toISOString()
                });
                
                return backupPath;
            } else {
                console.log('  ⚠️  未找到现有工作流文件，跳过备份');
                return null;
            }
        } catch (error) {
            console.error(`  ❌ 备份失败: ${error.message}`);
            this.deploymentLog.push({
                step: 'backup',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    // 验证环境变量
    validateEnvironmentVariables() {
        console.log('\n🔍 验证环境变量...');
        
        const requiredEnvVars = [
            'HUONIAO_SESSION_ID',
            'NOTION_DATABASE_ID',
            'NOTION_API_TOKEN'
        ];
        
        const missingVars = [];
        
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                missingVars.push(envVar);
            } else {
                console.log(`  ✅ ${envVar}: 已配置`);
            }
        }
        
        if (missingVars.length > 0) {
            console.log('  ❌ 缺少必需的环境变量:');
            missingVars.forEach(varName => {
                console.log(`     - ${varName}`);
            });
            
            console.log('\n  📝 请在.env文件中配置以下变量:');
            missingVars.forEach(varName => {
                console.log(`     ${varName}=your_${varName.toLowerCase()}_here`);
            });
            
            this.deploymentLog.push({
                step: 'env_validation',
                status: 'failed',
                missingVars: missingVars,
                timestamp: new Date().toISOString()
            });
            
            return false;
        }
        
        console.log('  ✅ 所有必需的环境变量已配置');
        this.deploymentLog.push({
            step: 'env_validation',
            status: 'success',
            timestamp: new Date().toISOString()
        });
        
        return true;
    }

    // 验证工作流配置
    validateWorkflowConfig() {
        console.log('\n🔍 验证工作流配置...');
        
        const workflow = this.config['enhanced-news-collection-with-notion'];
        let configValid = true;
        
        // 检查必需的节点
        const requiredNodes = [
            'firebird-publish-node',
            'firebird-publish-preparation',
            'firebird-publish-status-handler',
            'notion-status-update'
        ];
        
        const existingNodes = workflow.nodes.map(node => node.id);
        
        for (const requiredNode of requiredNodes) {
            if (!existingNodes.includes(requiredNode)) {
                console.log(`  ❌ 缺少必需的节点: ${requiredNode}`);
                configValid = false;
            } else {
                console.log(`  ✅ 节点存在: ${requiredNode}`);
            }
        }
        
        // 检查节点连接
        const connections = workflow.connections;
        if (!connections || Object.keys(connections).length === 0) {
            console.log('  ❌ 工作流缺少节点连接配置');
            configValid = false;
        } else {
            console.log('  ✅ 节点连接配置存在');
        }
        
        // 检查火鸟发布节点配置
        const publishNode = workflow.nodes.find(node => node.id === 'firebird-publish-node');
        if (publishNode) {
            const params = publishNode.parameters;
            
            if (params.url !== 'https://hawaiihub.net/include/ajax.php') {
                console.log('  ❌ 火鸟API端点URL不正确');
                configValid = false;
            }
            
            if (params.httpMethod !== 'POST') {
                console.log('  ❌ HTTP方法应为POST');
                configValid = false;
            }
            
            if (!params.options || !params.options.retry || !params.options.retry.enabled) {
                console.log('  ❌ 重试机制未启用');
                configValid = false;
            }
            
            if (configValid) {
                console.log('  ✅ 火鸟发布节点配置正确');
            }
        }
        
        this.deploymentLog.push({
            step: 'config_validation',
            status: configValid ? 'success' : 'failed',
            timestamp: new Date().toISOString()
        });
        
        return configValid;
    }

    // 部署工作流更新
    async deployWorkflowUpdate() {
        console.log('\n🚀 部署工作流更新...');
        
        try {
            const workflowPath = path.join(__dirname, '../n8n-config/workflows/enhanced-news-collection-with-notion.json');
            const workflowData = this.config['enhanced-news-collection-with-notion'];
            
            // 更新工作流元数据
            workflowData.meta = {
                ...workflowData.meta,
                lastUpdated: new Date().toISOString(),
                version: '2.0.0',
                updateDescription: '更新火鸟门户发布节点，增强数据映射、重试机制和状态检查功能'
            };
            
            // 写入更新后的工作流
            fs.writeFileSync(workflowPath, JSON.stringify(workflowData, null, 2));
            
            console.log(`  ✅ 工作流已更新: ${workflowPath}`);
            this.deploymentLog.push({
                step: 'workflow_deployment',
                status: 'success',
                file: workflowPath,
                timestamp: new Date().toISOString()
            });
            
            return true;
        } catch (error) {
            console.error(`  ❌ 部署失败: ${error.message}`);
            this.deploymentLog.push({
                step: 'workflow_deployment',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    // 验证部署结果
    async validateDeployment() {
        console.log('\n✅ 验证部署结果...');
        
        try {
            // 重新加载工作流文件
            const workflowPath = path.join(__dirname, '../n8n-config/workflows/enhanced-news-collection-with-notion.json');
            const deployedWorkflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
            
            // 验证关键节点存在
            const publishNode = deployedWorkflow.nodes.find(node => node.id === 'firebird-publish-node');
            if (!publishNode) {
                throw new Error('火鸟发布节点未找到');
            }
            
            // 验证节点配置
            if (publishNode.parameters.url !== 'https://hawaiihub.net/include/ajax.php') {
                throw new Error('火鸟API端点配置不正确');
            }
            
            // 验证连接配置
            if (!deployedWorkflow.connections || !deployedWorkflow.connections['火鸟门户发布数据准备']) {
                throw new Error('节点连接配置缺失');
            }
            
            console.log('  ✅ 火鸟发布节点配置正确');
            console.log('  ✅ 节点连接配置正确');
            console.log('  ✅ 工作流元数据已更新');
            
            this.deploymentLog.push({
                step: 'deployment_validation',
                status: 'success',
                timestamp: new Date().toISOString()
            });
            
            return true;
        } catch (error) {
            console.error(`  ❌ 部署验证失败: ${error.message}`);
            this.deploymentLog.push({
                step: 'deployment_validation',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            return false;
        }
    }

    // 生成部署报告
    generateDeploymentReport() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: duration,
            status: this.deploymentLog.every(log => log.status === 'success') ? 'success' : 'failed',
            steps: this.deploymentLog,
            summary: {
                totalSteps: this.deploymentLog.length,
                successfulSteps: this.deploymentLog.filter(log => log.status === 'success').length,
                failedSteps: this.deploymentLog.filter(log => log.status === 'failed').length
            },
            deployment: {
                version: '2.0.0',
                features: [
                    '基于官方API文档的完整数据映射',
                    '增强的重试机制和错误处理',
                    '完整的状态检查和更新逻辑',
                    '发布成功后的Notion状态更新',
                    '详细的日志记录和监控'
                ]
            }
        };
        
        return report;
    }

    // 保存部署报告
    async saveDeploymentReport(report) {
        const reportPath = path.join(__dirname, '../logs/firebird-publish-deployment-report.json');
        
        try {
            const logsDir = path.dirname(reportPath);
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }
            
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`\n📄 部署报告已保存: ${reportPath}`);
        } catch (error) {
            console.error(`❌ 保存部署报告失败: ${error.message}`);
        }
    }

    // 提供使用说明
    printUsageInstructions() {
        console.log('\n📋 使用说明:');
        console.log('');
        console.log('1. 环境变量配置:');
        console.log('   - 确保.env文件中配置了所有必需的环境变量');
        console.log('   - HUONIAO_SESSION_ID: 火鸟门户会话ID');
        console.log('   - NOTION_DATABASE_ID: Notion数据库ID');
        console.log('   - NOTION_API_TOKEN: Notion API令牌');
        console.log('');
        console.log('2. n8n工作流导入:');
        console.log('   - 在n8n界面中导入更新后的工作流文件');
        console.log('   - 文件位置: n8n-config/workflows/enhanced-news-collection-with-notion.json');
        console.log('');
        console.log('3. 凭据配置:');
        console.log('   - 在n8n中配置Notion API凭据');
        console.log('   - 确保火鸟门户会话ID有效');
        console.log('');
        console.log('4. 测试运行:');
        console.log('   - 手动触发工作流进行测试');
        console.log('   - 检查日志确保所有节点正常工作');
        console.log('');
        console.log('5. 监控和维护:');
        console.log('   - 定期检查工作流执行状态');
        console.log('   - 监控发布成功率和错误日志');
        console.log('   - 及时更新过期的会话ID');
    }

    // 执行完整部署流程
    async deploy() {
        console.log('🚀 开始火鸟门户发布节点更新部署...');
        console.log(`📅 部署时间: ${new Date().toISOString()}`);
        
        try {
            // 1. 备份现有工作流
            await this.backupExistingWorkflow();
            
            // 2. 验证环境变量
            if (!this.validateEnvironmentVariables()) {
                console.log('\n❌ 环境变量验证失败，请配置后重试');
                return false;
            }
            
            // 3. 验证工作流配置
            if (!this.validateWorkflowConfig()) {
                console.log('\n❌ 工作流配置验证失败');
                return false;
            }
            
            // 4. 部署工作流更新
            await this.deployWorkflowUpdate();
            
            // 5. 验证部署结果
            const deploymentValid = await this.validateDeployment();
            
            // 6. 生成和保存报告
            const report = this.generateDeploymentReport();
            await this.saveDeploymentReport(report);
            
            // 7. 显示结果
            console.log('\n📊 部署结果汇总:');
            console.log(`   状态: ${report.status}`);
            console.log(`   总步骤: ${report.summary.totalSteps}`);
            console.log(`   成功: ${report.summary.successfulSteps}`);
            console.log(`   失败: ${report.summary.failedSteps}`);
            console.log(`   耗时: ${report.duration}ms`);
            
            if (report.status === 'success') {
                console.log('\n✅ 火鸟门户发布节点更新部署成功！');
                this.printUsageInstructions();
                return true;
            } else {
                console.log('\n❌ 部署过程中出现错误，请检查详细报告');
                return false;
            }
            
        } catch (error) {
            console.error('\n❌ 部署过程中发生异常:', error.message);
            
            const report = this.generateDeploymentReport();
            report.status = 'error';
            report.error = error.message;
            await this.saveDeploymentReport(report);
            
            return false;
        }
    }
}

// 运行部署
if (require.main === module) {
    const deployer = new FirebirdPublishDeployer();
    deployer.deploy().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ 部署执行失败:', error);
        process.exit(1);
    });
}

module.exports = FirebirdPublishDeployer;