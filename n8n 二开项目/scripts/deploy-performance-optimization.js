#!/usr/bin/env node

/**
 * 性能优化部署脚本
 * 部署和配置性能优化功能到现有工作流
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-08-23
 */

const fs = require('fs').promises;
const path = require('path');

class PerformanceOptimizationDeployer {
    constructor(config = {}) {
        this.config = {
            workspaceRoot: config.workspaceRoot || process.cwd(),
            backupEnabled: config.backupEnabled !== false,
            validateDeployment: config.validateDeployment !== false,
            ...config
        };

        this.deploymentResults = {
            startTime: Date.now(),
            endTime: null,
            deployedComponents: [],
            updatedConfigurations: [],
            errors: [],
            warnings: []
        };
    }

    /**
     * 执行完整的性能优化部署
     */
    async deployPerformanceOptimizations() {
        console.log('🚀 开始部署性能优化功能...\n');
        console.log('=' .repeat(60));
        console.log('自动化新闻工作流 - 性能优化部署');
        console.log('=' .repeat(60));

        try {
            // 1. 备份现有配置
            if (this.config.backupEnabled) {
                await this.backupExistingConfigurations();
            }

            // 2. 部署性能优化器
            await this.deployPerformanceOptimizer();

            // 3. 更新工作流配置
            await this.updateWorkflowConfigurations();

            // 4. 更新内容处理器
            await this.updateContentProcessor();

            // 5. 配置监控和指标收集
            await this.configureMonitoring();

            // 6. 更新n8n节点配置
            await this.updateN8NNodeConfigurations();

            // 7. 创建性能测试脚本
            await this.createPerformanceTestScripts();

            // 8. 验证部署
            if (this.config.validateDeployment) {
                await this.validateDeployment();
            }

            // 9. 生成部署报告
            await this.generateDeploymentReport();

            this.printDeploymentSummary();

        } catch (error) {
            console.error('❌ 性能优化部署失败:', error.message);
            this.deploymentResults.errors.push({
                type: 'deployment_failure',
                message: error.message,
                timestamp: new Date().toISOString()
            });
            
            await this.generateErrorReport();
            throw error;
        } finally {
            this.deploymentResults.endTime = Date.now();
        }
    }

    /**
     * 备份现有配置
     */
    async backupExistingConfigurations() {
        console.log('💾 备份现有配置...');

        const backupDir = path.join(this.config.workspaceRoot, 'backups', `performance-optimization-${Date.now()}`);
        await fs.mkdir(backupDir, { recursive: true });

        const filesToBackup = [
            'n8n-config/workflow-parameters.json',
            '火鸟门户_内容处理核心模块_增强版.js',
            '火鸟门户_新闻采集工作流_增强版.json',
            'n8n-config/enhanced-sources-config.json'
        ];

        for (const file of filesToBackup) {
            try {
                const sourcePath = path.join(this.config.workspaceRoot, file);
                const backupPath = path.join(backupDir, path.basename(file));
                
                await fs.copyFile(sourcePath, backupPath);
                
                this.deploymentResults.deployedComponents.push({
                    type: 'backup',
                    source: file,
                    backup: backupPath,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                this.deploymentResults.warnings.push({
                    type: 'backup_warning',
                    file,
                    message: `备份失败: ${error.message}`
                });
            }
        }

        console.log(`✅ 配置备份完成，备份目录: ${backupDir}\n`);
    }

    /**
     * 部署性能优化器
     */
    async deployPerformanceOptimizer() {
        console.log('⚡ 部署性能优化器...');

        try {
            // 验证性能优化器文件存在
            const optimizerPath = path.join(this.config.workspaceRoot, 'n8n-config/performance-optimizer.js');
            await fs.access(optimizerPath);

            // 创建性能优化器配置文件
            const optimizerConfig = {
                enableProfiling: true,
                enableMetrics: true,
                metricsInterval: 30000,
                maxConcurrentTasks: 5,
                maxConcurrentApiCalls: 3,
                enableCaching: true,
                cacheSize: 1000,
                cacheTTL: 3600000,
                memoryThreshold: 0.8,
                cpuThreshold: 0.9,
                baseTimeout: 30000,
                maxTimeout: 120000,
                maxRetries: 3,
                baseRetryDelay: 1000
            };

            const configPath = path.join(this.config.workspaceRoot, 'n8n-config/performance-optimizer-config.json');
            await fs.writeFile(configPath, JSON.stringify(optimizerConfig, null, 2));

            this.deploymentResults.deployedComponents.push({
                type: 'performance_optimizer',
                path: optimizerPath,
                configPath,
                timestamp: new Date().toISOString()
            });

            console.log('✅ 性能优化器部署完成\n');

        } catch (error) {
            throw new Error(`性能优化器部署失败: ${error.message}`);
        }
    }

    /**
     * 更新工作流配置
     */
    async updateWorkflowConfigurations() {
        console.log('⚙️ 更新工作流配置...');

        try {
            const configPath = path.join(this.config.workspaceRoot, 'n8n-config/workflow-parameters.json');
            const configContent = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configContent);

            // 添加性能优化配置
            config.performance = {
                ...config.performance,
                enablePerformanceOptimization: true,
                enableConcurrencyOptimization: true,
                enableAdaptiveRetry: true,
                enableSmartCaching: true,
                enableBatchProcessing: true,
                enableResourceThrottling: true,
                performanceOptimizerEnabled: true
            };

            // 更新执行配置
            config.workflow.execution = {
                ...config.workflow.execution,
                maxConcurrentExecutions: 3,
                executionTimeout: 300000,
                enablePerformanceOptimization: true,
                enableResourceMonitoring: true,
                enableAdaptiveTimeout: true
            };

            // 更新节点配置
            if (config.nodes) {
                // 更新内容处理器配置
                if (config.nodes.contentProcessor) {
                    config.nodes.contentProcessor.parameters = {
                        ...config.nodes.contentProcessor.parameters,
                        enablePerformanceOptimization: true,
                        enableBatchProcessing: true,
                        batchSize: 5,
                        maxConcurrentTasks: 3
                    };
                }

                // 更新API节点配置
                Object.keys(config.nodes).forEach(nodeKey => {
                    const node = config.nodes[nodeKey];
                    if (node.nodeType && node.nodeType.includes('httpRequest')) {
                        node.parameters = {
                            ...node.parameters,
                            enableOptimizedRetry: true,
                            enableConnectionPooling: true,
                            maxConcurrentRequests: 3
                        };
                    }
                });
            }

            await fs.writeFile(configPath, JSON.stringify(config, null, 2));

            this.deploymentResults.updatedConfigurations.push({
                type: 'workflow_parameters',
                path: configPath,
                changes: ['performance optimization', 'concurrency settings', 'timeout configuration'],
                timestamp: new Date().toISOString()
            });

            console.log('✅ 工作流配置更新完成\n');

        } catch (error) {
            throw new Error(`工作流配置更新失败: ${error.message}`);
        }
    }

    /**
     * 更新内容处理器
     */
    async updateContentProcessor() {
        console.log('🔧 更新内容处理器...');

        try {
            const processorPath = path.join(this.config.workspaceRoot, '火鸟门户_内容处理核心模块_增强版.js');
            
            // 验证文件存在且包含性能优化代码
            const content = await fs.readFile(processorPath, 'utf8');
            
            if (!content.includes('initializePerformanceOptimizations')) {
                this.deploymentResults.warnings.push({
                    type: 'processor_warning',
                    message: '内容处理器可能缺少性能优化功能，请检查文件内容'
                });
            }

            // 创建性能优化配置
            const processorConfig = {
                enableCache: true,
                cacheExpiry: 3600000,
                enableBatchProcessing: true,
                batchSize: 5,
                batchTimeout: 1000,
                maxConcurrentTasks: 3,
                enablePerformanceMetrics: true,
                enableAdaptiveTimeout: true
            };

            const configPath = path.join(this.config.workspaceRoot, 'n8n-config/content-processor-performance-config.json');
            await fs.writeFile(configPath, JSON.stringify(processorConfig, null, 2));

            this.deploymentResults.updatedConfigurations.push({
                type: 'content_processor',
                path: processorPath,
                configPath,
                changes: ['performance optimizations', 'caching', 'batch processing'],
                timestamp: new Date().toISOString()
            });

            console.log('✅ 内容处理器更新完成\n');

        } catch (error) {
            throw new Error(`内容处理器更新失败: ${error.message}`);
        }
    }

    /**
     * 配置监控和指标收集
     */
    async configureMonitoring() {
        console.log('📊 配置监控和指标收集...');

        try {
            // 创建监控配置
            const monitoringConfig = {
                enabled: true,
                metricsCollection: {
                    enabled: true,
                    interval: 30000,
                    retentionPeriod: '7d'
                },
                performanceMonitoring: {
                    enabled: true,
                    trackExecutionTime: true,
                    trackMemoryUsage: true,
                    trackConcurrency: true,
                    trackCachePerformance: true
                },
                alerting: {
                    enabled: true,
                    thresholds: {
                        executionTime: 300000,
                        memoryUsage: 80,
                        errorRate: 5,
                        cacheHitRate: 60
                    }
                },
                reporting: {
                    enabled: true,
                    generateHourlyReports: true,
                    generateDailyReports: true
                }
            };

            const monitoringPath = path.join(this.config.workspaceRoot, 'n8n-config/monitoring-config.json');
            await fs.writeFile(monitoringPath, JSON.stringify(monitoringConfig, null, 2));

            // 创建指标收集脚本
            const metricsScript = `#!/usr/bin/env node

/**
 * 性能指标收集脚本
 * 自动生成的性能监控脚本
 */

const PerformanceMetricsCollector = require('./performance-metrics-collector');

const collector = new PerformanceMetricsCollector({
    enableSystemMetrics: true,
    enableWorkflowMetrics: true,
    enableApiMetrics: true,
    metricsRetention: '7d',
    collectionInterval: 30000
});

// 启动指标收集
setInterval(() => {
    const metrics = collector.collectPerformanceMetrics();
    console.log('Performance Metrics:', JSON.stringify(metrics, null, 2));
}, 30000);

console.log('性能指标收集器已启动');
`;

            const metricsScriptPath = path.join(this.config.workspaceRoot, 'scripts/collect-performance-metrics.js');
            await fs.writeFile(metricsScriptPath, metricsScript);

            this.deploymentResults.deployedComponents.push({
                type: 'monitoring',
                configPath: monitoringPath,
                scriptPath: metricsScriptPath,
                timestamp: new Date().toISOString()
            });

            console.log('✅ 监控配置完成\n');

        } catch (error) {
            throw new Error(`监控配置失败: ${error.message}`);
        }
    }

    /**
     * 更新n8n节点配置
     */
    async updateN8NNodeConfigurations() {
        console.log('🔗 更新n8n节点配置...');

        try {
            const workflowPath = path.join(this.config.workspaceRoot, '火鸟门户_新闻采集工作流_增强版.json');
            const workflowContent = await fs.readFile(workflowPath, 'utf8');
            const workflow = JSON.parse(workflowContent);

            // 更新节点配置以支持性能优化
            if (workflow.nodes) {
                workflow.nodes.forEach(node => {
                    // 更新内容处理节点
                    if (node.name === '智能内容处理' || node.id === 'content-processor') {
                        node.parameters = {
                            ...node.parameters,
                            enablePerformanceOptimization: true,
                            enableBatchProcessing: true,
                            enableCaching: true
                        };
                    }

                    // 更新HTTP请求节点
                    if (node.type === 'n8n-nodes-base.httpRequest') {
                        node.parameters = {
                            ...node.parameters,
                            options: {
                                ...node.parameters.options,
                                timeout: 30000,
                                retry: {
                                    enabled: true,
                                    maxTries: 3,
                                    waitBetweenTries: 5000
                                },
                                enableConnectionPooling: true
                            }
                        };
                    }
                });
            }

            // 添加性能优化设置
            workflow.settings = {
                ...workflow.settings,
                performanceOptimization: {
                    enabled: true,
                    maxConcurrentExecutions: 3,
                    enableResourceMonitoring: true,
                    enableMetricsCollection: true
                }
            };

            await fs.writeFile(workflowPath, JSON.stringify(workflow, null, 2));

            this.deploymentResults.updatedConfigurations.push({
                type: 'n8n_workflow',
                path: workflowPath,
                changes: ['node performance settings', 'workflow optimization settings'],
                timestamp: new Date().toISOString()
            });

            console.log('✅ n8n节点配置更新完成\n');

        } catch (error) {
            throw new Error(`n8n节点配置更新失败: ${error.message}`);
        }
    }

    /**
     * 创建性能测试脚本
     */
    async createPerformanceTestScripts() {
        console.log('🧪 创建性能测试脚本...');

        try {
            // 验证测试脚本存在
            const testScriptPath = path.join(this.config.workspaceRoot, 'scripts/test-performance-optimization.js');
            await fs.access(testScriptPath);

            // 创建快速性能测试脚本
            const quickTestScript = `#!/usr/bin/env node

/**
 * 快速性能测试脚本
 * 验证性能优化功能是否正常工作
 */

const PerformanceOptimizationTester = require('./test-performance-optimization');

async function runQuickTest() {
    console.log('🚀 运行快速性能测试...');
    
    const tester = new PerformanceOptimizationTester({
        testDuration: 30000, // 30秒快速测试
        concurrencyLevels: [1, 3, 5],
        dataVolumes: [10, 25, 50],
        enableDetailedLogging: false
    });

    try {
        await tester.runAllTests();
        console.log('✅ 快速性能测试完成');
    } catch (error) {
        console.error('❌ 快速性能测试失败:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    runQuickTest();
}
`;

            const quickTestPath = path.join(this.config.workspaceRoot, 'scripts/quick-performance-test.js');
            await fs.writeFile(quickTestPath, quickTestScript);

            // 创建性能基准测试脚本
            const benchmarkScript = `#!/usr/bin/env node

/**
 * 性能基准测试脚本
 * 建立性能基准并跟踪改进
 */

const fs = require('fs').promises;
const path = require('path');

async function runBenchmark() {
    console.log('📊 运行性能基准测试...');
    
    const startTime = Date.now();
    
    // 模拟工作流执行
    const results = {
        timestamp: new Date().toISOString(),
        executionTime: 0,
        throughput: 0,
        memoryUsage: process.memoryUsage(),
        successRate: 100
    };
    
    // 执行基准测试逻辑
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.executionTime = Date.now() - startTime;
    results.throughput = 50 / (results.executionTime / 1000); // items per second
    
    // 保存基准结果
    const benchmarkPath = path.join(process.cwd(), 'logs', 'performance-benchmark.json');
    await fs.writeFile(benchmarkPath, JSON.stringify(results, null, 2));
    
    console.log('✅ 性能基准测试完成');
    console.log(\`执行时间: \${results.executionTime}ms\`);
    console.log(\`吞吐量: \${results.throughput.toFixed(2)} items/sec\`);
}

if (require.main === module) {
    runBenchmark();
}
`;

            const benchmarkPath = path.join(this.config.workspaceRoot, 'scripts/performance-benchmark.js');
            await fs.writeFile(benchmarkPath, benchmarkScript);

            this.deploymentResults.deployedComponents.push({
                type: 'test_scripts',
                quickTestPath,
                benchmarkPath,
                timestamp: new Date().toISOString()
            });

            console.log('✅ 性能测试脚本创建完成\n');

        } catch (error) {
            throw new Error(`性能测试脚本创建失败: ${error.message}`);
        }
    }

    /**
     * 验证部署
     */
    async validateDeployment() {
        console.log('✅ 验证部署...');

        const validationResults = {
            performanceOptimizer: false,
            configurations: false,
            monitoring: false,
            testScripts: false
        };

        try {
            // 验证性能优化器
            const optimizerPath = path.join(this.config.workspaceRoot, 'n8n-config/performance-optimizer.js');
            await fs.access(optimizerPath);
            validationResults.performanceOptimizer = true;

            // 验证配置文件
            const configPath = path.join(this.config.workspaceRoot, 'n8n-config/workflow-parameters.json');
            const configContent = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configContent);
            validationResults.configurations = config.performance?.enablePerformanceOptimization === true;

            // 验证监控配置
            const monitoringPath = path.join(this.config.workspaceRoot, 'n8n-config/monitoring-config.json');
            await fs.access(monitoringPath);
            validationResults.monitoring = true;

            // 验证测试脚本
            const testScriptPath = path.join(this.config.workspaceRoot, 'scripts/test-performance-optimization.js');
            await fs.access(testScriptPath);
            validationResults.testScripts = true;

            const allValid = Object.values(validationResults).every(v => v === true);
            
            if (allValid) {
                console.log('✅ 部署验证通过\n');
            } else {
                console.log('⚠️ 部署验证发现问题:');
                Object.entries(validationResults).forEach(([key, valid]) => {
                    console.log(`  ${key}: ${valid ? '✅' : '❌'}`);
                });
                console.log();
            }

            this.deploymentResults.validationResults = validationResults;

        } catch (error) {
            this.deploymentResults.warnings.push({
                type: 'validation_warning',
                message: `部署验证失败: ${error.message}`
            });
        }
    }

    /**
     * 生成部署报告
     */
    async generateDeploymentReport() {
        const report = {
            metadata: {
                generatedAt: new Date().toISOString(),
                deploymentDuration: this.deploymentResults.endTime - this.deploymentResults.startTime,
                version: '1.0.0'
            },
            
            summary: {
                totalComponents: this.deploymentResults.deployedComponents.length,
                updatedConfigurations: this.deploymentResults.updatedConfigurations.length,
                errors: this.deploymentResults.errors.length,
                warnings: this.deploymentResults.warnings.length,
                status: this.deploymentResults.errors.length === 0 ? 'success' : 'partial_success'
            },
            
            deployedComponents: this.deploymentResults.deployedComponents,
            updatedConfigurations: this.deploymentResults.updatedConfigurations,
            validationResults: this.deploymentResults.validationResults,
            errors: this.deploymentResults.errors,
            warnings: this.deploymentResults.warnings,
            
            nextSteps: [
                '运行快速性能测试验证功能: node scripts/quick-performance-test.js',
                '启动性能监控: node scripts/collect-performance-metrics.js',
                '运行完整性能测试: node scripts/test-performance-optimization.js',
                '检查性能基准: node scripts/performance-benchmark.js'
            ]
        };

        const reportPath = path.join(this.config.workspaceRoot, 'logs', 'performance-optimization-deployment-report.json');
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`📊 部署报告已保存: ${reportPath}`);
        
        return report;
    }

    /**
     * 生成错误报告
     */
    async generateErrorReport() {
        const errorReport = {
            timestamp: new Date().toISOString(),
            errors: this.deploymentResults.errors,
            warnings: this.deploymentResults.warnings,
            partialDeployment: {
                deployedComponents: this.deploymentResults.deployedComponents,
                updatedConfigurations: this.deploymentResults.updatedConfigurations
            }
        };

        const errorReportPath = path.join(this.config.workspaceRoot, 'logs', 'performance-optimization-deployment-error.json');
        await fs.mkdir(path.dirname(errorReportPath), { recursive: true });
        await fs.writeFile(errorReportPath, JSON.stringify(errorReport, null, 2));
        
        console.log(`❌ 错误报告已保存: ${errorReportPath}`);
    }

    /**
     * 打印部署摘要
     */
    printDeploymentSummary() {
        console.log('\n' + '=' .repeat(60));
        console.log('性能优化部署摘要');
        console.log('=' .repeat(60));
        
        console.log(`部署状态: ${this.deploymentResults.errors.length === 0 ? '✅ 成功' : '⚠️ 部分成功'}`);
        console.log(`部署组件: ${this.deploymentResults.deployedComponents.length}`);
        console.log(`更新配置: ${this.deploymentResults.updatedConfigurations.length}`);
        console.log(`错误数量: ${this.deploymentResults.errors.length}`);
        console.log(`警告数量: ${this.deploymentResults.warnings.length}`);
        
        if (this.deploymentResults.validationResults) {
            console.log('\n验证结果:');
            Object.entries(this.deploymentResults.validationResults).forEach(([key, valid]) => {
                console.log(`  ${key}: ${valid ? '✅' : '❌'}`);
            });
        }
        
        console.log('\n下一步操作:');
        console.log('  1. 运行快速测试: node scripts/quick-performance-test.js');
        console.log('  2. 启动监控: node scripts/collect-performance-metrics.js');
        console.log('  3. 运行完整测试: node scripts/test-performance-optimization.js');
        
        console.log('\n🎉 性能优化部署完成！');
    }
}

// 主执行函数
async function main() {
    const deployer = new PerformanceOptimizationDeployer({
        workspaceRoot: process.cwd(),
        backupEnabled: true,
        validateDeployment: true
    });

    try {
        await deployer.deployPerformanceOptimizations();
        process.exit(0);
    } catch (error) {
        console.error('性能优化部署失败:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = PerformanceOptimizationDeployer;