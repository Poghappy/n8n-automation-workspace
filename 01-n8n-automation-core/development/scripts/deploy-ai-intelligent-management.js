#!/usr/bin/env node

/**
 * AI智能管理节点部署脚本
 * 
 * 功能：
 * 1. 将AI智能管理节点集成到现有n8n工作流
 * 2. 更新工作流配置和连接
 * 3. 验证部署结果
 * 4. 生成部署报告
 * 
 * @version 1.0.0
 * @date 2025-08-23
 */

const fs = require('fs');
const path = require('path');

// 部署配置
const DEPLOYMENT_CONFIG = {
    // 工作流文件路径
    workflowPath: path.join(__dirname, '../n8n-config/workflows/enhanced-news-collection-with-notion.json'),
    backupPath: path.join(__dirname, '../backups/workflow-backup-' + Date.now() + '.json'),
    
    // AI管理节点配置文件
    aiNodeConfigPath: path.join(__dirname, '../n8n-config/ai-intelligent-management-node-config.json'),
    aiNodeModulePath: path.join(__dirname, '../n8n-config/ai-intelligent-management-node.js'),
    
    // 部署选项
    createBackup: true,
    validateAfterDeploy: true,
    generateReport: true,
    dryRun: process.argv.includes('--dry-run'),
    force: process.argv.includes('--force'),
    verbose: process.argv.includes('--verbose')
};

// 部署日志收集器
class DeploymentLogger {
    constructor() {
        this.logs = [];
        this.startTime = Date.now();
    }

    log(level, message, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data
        };

        this.logs.push(logEntry);

        const prefix = {
            'info': '📋',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'debug': '🔍'
        }[level] || '📋';

        console.log(`${prefix} ${message}`);
        
        if (DEPLOYMENT_CONFIG.verbose && Object.keys(data).length > 0) {
            console.log('   详情:', JSON.stringify(data, null, 2));
        }
    }

    generateReport() {
        return {
            deployment: {
                startTime: new Date(this.startTime).toISOString(),
                endTime: new Date().toISOString(),
                duration: Date.now() - this.startTime,
                success: !this.logs.some(log => log.level === 'error')
            },
            logs: this.logs,
            summary: {
                total: this.logs.length,
                info: this.logs.filter(log => log.level === 'info').length,
                success: this.logs.filter(log => log.level === 'success').length,
                warning: this.logs.filter(log => log.level === 'warning').length,
                error: this.logs.filter(log => log.level === 'error').length
            }
        };
    }
}

// 工作流更新器
class WorkflowUpdater {
    constructor(logger) {
        this.logger = logger;
        this.workflow = null;
        this.aiNodeConfig = null;
    }

    async loadWorkflow() {
        try {
            this.logger.log('info', '加载现有工作流配置');
            
            if (!fs.existsSync(DEPLOYMENT_CONFIG.workflowPath)) {
                throw new Error(`工作流文件不存在: ${DEPLOYMENT_CONFIG.workflowPath}`);
            }

            const workflowContent = fs.readFileSync(DEPLOYMENT_CONFIG.workflowPath, 'utf8');
            this.workflow = JSON.parse(workflowContent);

            this.logger.log('success', '工作流配置加载成功', {
                name: this.workflow.name,
                nodeCount: this.workflow.nodes?.length || 0
            });

            return true;

        } catch (error) {
            this.logger.log('error', '工作流配置加载失败', { error: error.message });
            return false;
        }
    }

    async loadAINodeConfig() {
        try {
            this.logger.log('info', '加载AI智能管理节点配置');

            if (!fs.existsSync(DEPLOYMENT_CONFIG.aiNodeConfigPath)) {
                throw new Error(`AI节点配置文件不存在: ${DEPLOYMENT_CONFIG.aiNodeConfigPath}`);
            }

            const configContent = fs.readFileSync(DEPLOYMENT_CONFIG.aiNodeConfigPath, 'utf8');
            this.aiNodeConfig = JSON.parse(configContent);

            this.logger.log('success', 'AI节点配置加载成功', {
                version: this.aiNodeConfig.version,
                nodeCount: Object.keys(this.aiNodeConfig).filter(key => key.endsWith('Node')).length
            });

            return true;

        } catch (error) {
            this.logger.log('error', 'AI节点配置加载失败', { error: error.message });
            return false;
        }
    }

    createBackup() {
        try {
            if (!DEPLOYMENT_CONFIG.createBackup) {
                this.logger.log('info', '跳过备份创建');
                return true;
            }

            this.logger.log('info', '创建工作流备份');

            // 确保备份目录存在
            const backupDir = path.dirname(DEPLOYMENT_CONFIG.backupPath);
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            fs.copyFileSync(DEPLOYMENT_CONFIG.workflowPath, DEPLOYMENT_CONFIG.backupPath);

            this.logger.log('success', '工作流备份创建成功', {
                backupPath: DEPLOYMENT_CONFIG.backupPath
            });

            return true;

        } catch (error) {
            this.logger.log('error', '工作流备份创建失败', { error: error.message });
            return false;
        }
    }

    findInsertionPoint() {
        try {
            this.logger.log('info', '查找AI节点插入位置');

            // 查找Notion存储状态跟踪节点
            const notionStatusNode = this.workflow.nodes.find(node => 
                node.id === 'notion-status-tracker' || 
                node.name === 'Notion存储状态跟踪'
            );

            if (!notionStatusNode) {
                throw new Error('未找到Notion存储状态跟踪节点');
            }

            this.logger.log('success', '找到插入位置', {
                afterNode: notionStatusNode.name,
                position: notionStatusNode.position
            });

            return notionStatusNode;

        } catch (error) {
            this.logger.log('error', '查找插入位置失败', { error: error.message });
            return null;
        }
    }

    addAIManagementNodes(insertAfterNode) {
        try {
            this.logger.log('info', '添加AI智能管理节点');

            const basePosition = insertAfterNode.position;
            const nodeSpacing = 220; // 节点间距

            // 1. 添加主AI管理节点
            const aiManagementNode = {
                ...this.aiNodeConfig.aiManagementNode,
                position: [basePosition[0] + nodeSpacing, basePosition[1]]
            };

            // 2. 添加决策路由节点
            const decisionRouterNode = {
                ...this.aiNodeConfig.decisionRouterNode,
                position: [basePosition[0] + nodeSpacing * 2, basePosition[1]]
            };

            // 3. 添加各种处理节点
            const publishPreparationNode = {
                ...this.aiNodeConfig.publishPreparationNode,
                position: [basePosition[0] + nodeSpacing * 3, basePosition[1] - 100]
            };

            const rejectionHandlerNode = {
                ...this.aiNodeConfig.rejectionHandlerNode,
                position: [basePosition[0] + nodeSpacing * 3, basePosition[1]]
            };

            const revisionHandlerNode = {
                ...this.aiNodeConfig.revisionHandlerNode,
                position: [basePosition[0] + nodeSpacing * 3, basePosition[1] + 100]
            };

            const holdHandlerNode = {
                ...this.aiNodeConfig.holdHandlerNode,
                position: [basePosition[0] + nodeSpacing * 3, basePosition[1] + 200]
            };

            // 添加所有节点到工作流
            this.workflow.nodes.push(
                aiManagementNode,
                decisionRouterNode,
                publishPreparationNode,
                rejectionHandlerNode,
                revisionHandlerNode,
                holdHandlerNode
            );

            this.logger.log('success', 'AI管理节点添加成功', {
                addedNodes: 6,
                totalNodes: this.workflow.nodes.length
            });

            return {
                aiManagementNode,
                decisionRouterNode,
                publishPreparationNode,
                rejectionHandlerNode,
                revisionHandlerNode,
                holdHandlerNode
            };

        } catch (error) {
            this.logger.log('error', 'AI管理节点添加失败', { error: error.message });
            return null;
        }
    }

    updateConnections(insertAfterNode, addedNodes) {
        try {
            this.logger.log('info', '更新节点连接');

            // 初始化connections数组（如果不存在）
            if (!this.workflow.connections) {
                this.workflow.connections = {};
            }

            // 1. 连接Notion状态跟踪 -> AI管理节点
            this.workflow.connections[insertAfterNode.id] = {
                main: [[{
                    node: addedNodes.aiManagementNode.id,
                    type: 'main',
                    index: 0
                }]]
            };

            // 2. 连接AI管理节点 -> 决策路由
            this.workflow.connections[addedNodes.aiManagementNode.id] = {
                main: [[{
                    node: addedNodes.decisionRouterNode.id,
                    type: 'main',
                    index: 0
                }]]
            };

            // 3. 连接决策路由到各个处理节点
            this.workflow.connections[addedNodes.decisionRouterNode.id] = {
                main: [
                    // 输出0: publish -> 发布准备
                    [{
                        node: addedNodes.publishPreparationNode.id,
                        type: 'main',
                        index: 0
                    }],
                    // 输出1: reject -> 拒绝处理
                    [{
                        node: addedNodes.rejectionHandlerNode.id,
                        type: 'main',
                        index: 0
                    }],
                    // 输出2: revise -> 修改处理
                    [{
                        node: addedNodes.revisionHandlerNode.id,
                        type: 'main',
                        index: 0
                    }],
                    // 输出3: hold -> 暂停处理
                    [{
                        node: addedNodes.holdHandlerNode.id,
                        type: 'main',
                        index: 0
                    }]
                ]
            };

            // 4. 查找并更新到火鸟门户发布节点的连接
            const firebirdNode = this.workflow.nodes.find(node => 
                node.name?.includes('火鸟') || 
                node.name?.includes('发布') ||
                node.id?.includes('firebird')
            );

            if (firebirdNode) {
                // 连接发布准备节点到火鸟门户发布
                this.workflow.connections[addedNodes.publishPreparationNode.id] = {
                    main: [[{
                        node: firebirdNode.id,
                        type: 'main',
                        index: 0
                    }]]
                };

                this.logger.log('success', '找到并连接火鸟门户发布节点', {
                    firebirdNode: firebirdNode.name
                });
            } else {
                this.logger.log('warning', '未找到火鸟门户发布节点，需要手动连接');
            }

            this.logger.log('success', '节点连接更新成功');
            return true;

        } catch (error) {
            this.logger.log('error', '节点连接更新失败', { error: error.message });
            return false;
        }
    }

    updateWorkflowMetadata() {
        try {
            this.logger.log('info', '更新工作流元数据');

            // 更新工作流名称
            if (this.workflow.name && !this.workflow.name.includes('AI智能管理')) {
                this.workflow.name += ' (含AI智能管理)';
            }

            // 添加版本信息
            this.workflow.meta = this.workflow.meta || {};
            this.workflow.meta.aiManagementVersion = this.aiNodeConfig.version;
            this.workflow.meta.lastUpdated = new Date().toISOString();
            this.workflow.meta.updatedBy = 'ai-intelligent-management-deployment';

            // 添加描述
            if (!this.workflow.description) {
                this.workflow.description = '增强版新闻采集工作流，集成AI智能管理功能';
            }

            this.logger.log('success', '工作流元数据更新成功');
            return true;

        } catch (error) {
            this.logger.log('error', '工作流元数据更新失败', { error: error.message });
            return false;
        }
    }

    saveWorkflow() {
        try {
            if (DEPLOYMENT_CONFIG.dryRun) {
                this.logger.log('info', '干运行模式：跳过工作流保存');
                return true;
            }

            this.logger.log('info', '保存更新后的工作流');

            const workflowContent = JSON.stringify(this.workflow, null, 2);
            fs.writeFileSync(DEPLOYMENT_CONFIG.workflowPath, workflowContent);

            this.logger.log('success', '工作流保存成功', {
                path: DEPLOYMENT_CONFIG.workflowPath,
                size: workflowContent.length
            });

            return true;

        } catch (error) {
            this.logger.log('error', '工作流保存失败', { error: error.message });
            return false;
        }
    }

    validateDeployment() {
        try {
            this.logger.log('info', '验证部署结果');

            const validationResults = {
                hasAINodes: false,
                hasConnections: false,
                hasValidStructure: false,
                nodeCount: this.workflow.nodes?.length || 0
            };

            // 检查AI节点是否存在
            const aiNodes = this.workflow.nodes.filter(node => 
                node.id?.includes('ai-') || 
                node.name?.includes('AI') ||
                node.name?.includes('智能管理')
            );
            validationResults.hasAINodes = aiNodes.length > 0;

            // 检查连接是否正确
            const hasConnections = Object.keys(this.workflow.connections || {}).length > 0;
            validationResults.hasConnections = hasConnections;

            // 检查工作流结构
            const hasValidStructure = this.workflow.nodes && 
                                    Array.isArray(this.workflow.nodes) && 
                                    this.workflow.nodes.length > 0;
            validationResults.hasValidStructure = hasValidStructure;

            const isValid = validationResults.hasAINodes && 
                           validationResults.hasConnections && 
                           validationResults.hasValidStructure;

            if (isValid) {
                this.logger.log('success', '部署验证通过', validationResults);
            } else {
                this.logger.log('error', '部署验证失败', validationResults);
            }

            return isValid;

        } catch (error) {
            this.logger.log('error', '部署验证失败', { error: error.message });
            return false;
        }
    }
}

// 主部署函数
async function deployAIManagement() {
    const logger = new DeploymentLogger();
    
    logger.log('info', '开始AI智能管理节点部署');
    logger.log('info', '部署配置', {
        dryRun: DEPLOYMENT_CONFIG.dryRun,
        createBackup: DEPLOYMENT_CONFIG.createBackup,
        validateAfterDeploy: DEPLOYMENT_CONFIG.validateAfterDeploy
    });

    const updater = new WorkflowUpdater(logger);

    try {
        // 1. 加载现有工作流
        if (!await updater.loadWorkflow()) {
            throw new Error('工作流加载失败');
        }

        // 2. 加载AI节点配置
        if (!await updater.loadAINodeConfig()) {
            throw new Error('AI节点配置加载失败');
        }

        // 3. 创建备份
        if (!updater.createBackup()) {
            if (!DEPLOYMENT_CONFIG.force) {
                throw new Error('备份创建失败');
            }
            logger.log('warning', '备份创建失败，但强制继续部署');
        }

        // 4. 查找插入位置
        const insertAfterNode = updater.findInsertionPoint();
        if (!insertAfterNode) {
            throw new Error('未找到合适的插入位置');
        }

        // 5. 添加AI管理节点
        const addedNodes = updater.addAIManagementNodes(insertAfterNode);
        if (!addedNodes) {
            throw new Error('AI管理节点添加失败');
        }

        // 6. 更新节点连接
        if (!updater.updateConnections(insertAfterNode, addedNodes)) {
            throw new Error('节点连接更新失败');
        }

        // 7. 更新工作流元数据
        if (!updater.updateWorkflowMetadata()) {
            logger.log('warning', '工作流元数据更新失败，但继续部署');
        }

        // 8. 保存工作流
        if (!updater.saveWorkflow()) {
            throw new Error('工作流保存失败');
        }

        // 9. 验证部署
        if (DEPLOYMENT_CONFIG.validateAfterDeploy) {
            if (!updater.validateDeployment()) {
                throw new Error('部署验证失败');
            }
        }

        logger.log('success', 'AI智能管理节点部署成功');

        // 10. 生成部署报告
        if (DEPLOYMENT_CONFIG.generateReport) {
            const report = logger.generateReport();
            const reportPath = path.join(__dirname, '../logs/ai-management-deployment-report.json');
            
            // 确保日志目录存在
            const logsDir = path.dirname(reportPath);
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }

            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            logger.log('success', '部署报告已生成', { reportPath });
        }

        return true;

    } catch (error) {
        logger.log('error', '部署失败', { error: error.message });
        
        // 如果有备份且不是干运行，询问是否恢复
        if (DEPLOYMENT_CONFIG.createBackup && !DEPLOYMENT_CONFIG.dryRun && fs.existsSync(DEPLOYMENT_CONFIG.backupPath)) {
            logger.log('info', '备份文件可用，可以手动恢复', {
                backupPath: DEPLOYMENT_CONFIG.backupPath,
                restoreCommand: `cp "${DEPLOYMENT_CONFIG.backupPath}" "${DEPLOYMENT_CONFIG.workflowPath}"`
            });
        }

        return false;
    }
}

// 运行部署
if (require.main === module) {
    deployAIManagement()
        .then(success => {
            if (success) {
                console.log('\n🎉 AI智能管理节点部署成功!');
                console.log('\n📋 后续步骤:');
                console.log('1. 检查n8n工作流是否正确加载');
                console.log('2. 验证环境变量配置 (OPENAI_API_KEY等)');
                console.log('3. 运行测试脚本验证功能');
                console.log('4. 监控工作流执行日志');
            } else {
                console.log('\n⚠️  部署失败，请检查错误日志');
            }
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('\n💥 部署过程中发生异常:', error);
            process.exit(1);
        });
}

module.exports = {
    deployAIManagement,
    WorkflowUpdater,
    DeploymentLogger,
    DEPLOYMENT_CONFIG
};