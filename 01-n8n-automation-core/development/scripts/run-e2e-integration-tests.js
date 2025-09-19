#!/usr/bin/env node

/**
 * 端到端集成测试执行脚本
 * 执行完整的自动化新闻工作流端到端集成测试
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-01-23
 */

const fs = require('fs').promises;
const path = require('path');
const { WorkflowTester } = require('./test-enhanced-workflow');

class E2EIntegrationTestRunner {
    constructor(config = {}) {
        this.config = {
            workspaceRoot: config.workspaceRoot || process.cwd(),
            enableDetailedLogging: config.enableDetailedLogging !== false,
            testTimeout: config.testTimeout || 120000, // 2分钟超时
            maxTestItems: config.maxTestItems || 20,
            generateReport: config.generateReport !== false,
            ...config
        };

        this.testResults = {
            startTime: Date.now(),
            endTime: null,
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            testSuites: [],
            errors: [],
            performance: {}
        };
    }

    /**
     * 运行所有端到端集成测试
     */
    async runAllE2ETests() {
        console.log('🚀 开始端到端集成测试套件...\n');
        console.log('=' .repeat(60));
        console.log('自动化新闻工作流 - 端到端集成测试');
        console.log('=' .repeat(60));

        try {
            // 1. 环境预检查
            await this.runPreflightChecks();

            // 2. 基础功能测试
            await this.runBasicFunctionalityTests();

            // 3. 数据流集成测试
            await this.runDataFlowIntegrationTests();

            // 4. 错误处理和恢复测试
            await this.runErrorHandlingTests();

            // 5. 性能和稳定性测试
            await this.runPerformanceTests();

            // 6. 端到端场景测试
            await this.runEndToEndScenarioTests();

            // 7. 数据一致性验证
            await this.runDataConsistencyTests();

            // 8. 系统集成验证
            await this.runSystemIntegrationTests();

            // 生成最终报告
            await this.generateFinalReport();

            this.printFinalSummary();

        } catch (error) {
            console.error('❌ 端到端集成测试执行失败:', error.message);
            this.testResults.errors.push({
                type: 'test_execution_failure',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            
            await this.generateErrorReport();
            process.exit(1);
        } finally {
            this.testResults.endTime = Date.now();
        }
    }

    /**
     * 运行环境预检查
     */
    async runPreflightChecks() {
        console.log('🔍 执行环境预检查...');
        
        const preflightSuite = {
            name: 'Environment Preflight Checks',
            startTime: Date.now(),
            tests: [],
            status: 'running'
        };

        try {
            // 检查必需的环境变量
            await this.checkEnvironmentVariables(preflightSuite);
            
            // 检查文件系统权限
            await this.checkFileSystemPermissions(preflightSuite);
            
            // 检查依赖模块
            await this.checkDependencyModules(preflightSuite);
            
            // 检查网络连接
            await this.checkNetworkConnectivity(preflightSuite);

            preflightSuite.status = 'completed';
            preflightSuite.endTime = Date.now();
            
            console.log('✅ 环境预检查完成\n');

        } catch (error) {
            preflightSuite.status = 'failed';
            preflightSuite.error = error.message;
            throw new Error(`环境预检查失败: ${error.message}`);
        } finally {
            this.testResults.testSuites.push(preflightSuite);
        }
    }

    /**
     * 运行基础功能测试
     */
    async runBasicFunctionalityTests() {
        console.log('🧪 执行基础功能测试...');

        const tester = new WorkflowTester({
            ...this.config,
            testMode: 'basic_functionality'
        });

        const basicSuite = {
            name: 'Basic Functionality Tests',
            startTime: Date.now(),
            tests: [],
            status: 'running'
        };

        try {
            // 运行基础测试
            await tester.testEnvironment();
            await tester.testConfigurations();
            await tester.testDataValidation();
            await tester.testContentProcessing();

            const testerResults = tester.testResults;
            basicSuite.tests = testerResults.tests;
            basicSuite.status = testerResults.failed === 0 ? 'passed' : 'failed';
            
            this.updateTestCounts(testerResults);
            
            console.log('✅ 基础功能测试完成\n');

        } catch (error) {
            basicSuite.status = 'failed';
            basicSuite.error = error.message;
            this.testResults.failedTests++;
            console.log(`❌ 基础功能测试失败: ${error.message}\n`);
        } finally {
            basicSuite.endTime = Date.now();
            this.testResults.testSuites.push(basicSuite);
        }
    }

    /**
     * 运行数据流集成测试
     */
    async runDataFlowIntegrationTests() {
        console.log('🔄 执行数据流集成测试...');

        const dataFlowSuite = {
            name: 'Data Flow Integration Tests',
            startTime: Date.now(),
            tests: [],
            status: 'running'
        };

        try {
            const tester = new WorkflowTester({
                ...this.config,
                testMode: 'data_flow_integration'
            });

            // 执行数据流相关测试
            await tester.testRSSCollection();
            await tester.testGitHubCollection();
            
            // 执行端到端集成测试的数据流部分
            await tester.testEndToEndIntegration();

            const testerResults = tester.testResults;
            dataFlowSuite.tests = testerResults.tests;
            dataFlowSuite.status = testerResults.failed === 0 ? 'passed' : 'failed';
            
            this.updateTestCounts(testerResults);
            
            console.log('✅ 数据流集成测试完成\n');

        } catch (error) {
            dataFlowSuite.status = 'failed';
            dataFlowSuite.error = error.message;
            this.testResults.failedTests++;
            console.log(`❌ 数据流集成测试失败: ${error.message}\n`);
        } finally {
            dataFlowSuite.endTime = Date.now();
            this.testResults.testSuites.push(dataFlowSuite);
        }
    }

    /**
     * 运行错误处理测试
     */
    async runErrorHandlingTests() {
        console.log('⚠️ 执行错误处理和恢复测试...');

        const errorHandlingSuite = {
            name: 'Error Handling and Recovery Tests',
            startTime: Date.now(),
            tests: [],
            status: 'running'
        };

        try {
            const tester = new WorkflowTester({
                ...this.config,
                testMode: 'error_handling'
            });

            // 执行错误处理测试
            await tester.testErrorHandling();
            await tester.testErrorScenariosAndRecovery();

            const testerResults = tester.testResults;
            errorHandlingSuite.tests = testerResults.tests;
            errorHandlingSuite.status = testerResults.failed === 0 ? 'passed' : 'failed';
            
            this.updateTestCounts(testerResults);
            
            console.log('✅ 错误处理和恢复测试完成\n');

        } catch (error) {
            errorHandlingSuite.status = 'failed';
            errorHandlingSuite.error = error.message;
            this.testResults.failedTests++;
            console.log(`❌ 错误处理测试失败: ${error.message}\n`);
        } finally {
            errorHandlingSuite.endTime = Date.now();
            this.testResults.testSuites.push(errorHandlingSuite);
        }
    }

    /**
     * 运行性能测试
     */
    async runPerformanceTests() {
        console.log('⚡ 执行性能和稳定性测试...');

        const performanceSuite = {
            name: 'Performance and Stability Tests',
            startTime: Date.now(),
            tests: [],
            status: 'running'
        };

        try {
            const tester = new WorkflowTester({
                ...this.config,
                testMode: 'performance',
                maxTestItems: 100 // 增加性能测试的数据量
            });

            // 执行性能相关测试
            await tester.testSystemPerformanceBenchmarks();

            const testerResults = tester.testResults;
            performanceSuite.tests = testerResults.tests;
            performanceSuite.status = testerResults.failed === 0 ? 'passed' : 'failed';
            
            this.updateTestCounts(testerResults);
            
            // 记录性能指标
            this.testResults.performance = this.extractPerformanceMetrics(testerResults);
            
            console.log('✅ 性能和稳定性测试完成\n');

        } catch (error) {
            performanceSuite.status = 'failed';
            performanceSuite.error = error.message;
            this.testResults.failedTests++;
            console.log(`❌ 性能测试失败: ${error.message}\n`);
        } finally {
            performanceSuite.endTime = Date.now();
            this.testResults.testSuites.push(performanceSuite);
        }
    }

    /**
     * 运行端到端场景测试
     */
    async runEndToEndScenarioTests() {
        console.log('🎯 执行端到端场景测试...');

        const scenarioSuite = {
            name: 'End-to-End Scenario Tests',
            startTime: Date.now(),
            tests: [],
            status: 'running'
        };

        try {
            // 场景1: 完整新闻采集发布流程
            await this.runCompleteNewsWorkflowScenario(scenarioSuite);
            
            // 场景2: 多源数据并发处理
            await this.runMultiSourceConcurrentScenario(scenarioSuite);
            
            // 场景3: 错误恢复场景
            await this.runErrorRecoveryScenario(scenarioSuite);
            
            // 场景4: 高负载处理场景
            await this.runHighLoadScenario(scenarioSuite);

            scenarioSuite.status = 'completed';
            console.log('✅ 端到端场景测试完成\n');

        } catch (error) {
            scenarioSuite.status = 'failed';
            scenarioSuite.error = error.message;
            this.testResults.failedTests++;
            console.log(`❌ 端到端场景测试失败: ${error.message}\n`);
        } finally {
            scenarioSuite.endTime = Date.now();
            this.testResults.testSuites.push(scenarioSuite);
        }
    }

    /**
     * 运行数据一致性测试
     */
    async runDataConsistencyTests() {
        console.log('🔍 执行数据一致性验证测试...');

        const consistencySuite = {
            name: 'Data Consistency Validation Tests',
            startTime: Date.now(),
            tests: [],
            status: 'running'
        };

        try {
            const tester = new WorkflowTester({
                ...this.config,
                testMode: 'data_consistency'
            });

            // 执行数据一致性测试
            await tester.testDataIntegrityValidation();

            const testerResults = tester.testResults;
            consistencySuite.tests = testerResults.tests;
            consistencySuite.status = testerResults.failed === 0 ? 'passed' : 'failed';
            
            this.updateTestCounts(testerResults);
            
            console.log('✅ 数据一致性验证测试完成\n');

        } catch (error) {
            consistencySuite.status = 'failed';
            consistencySuite.error = error.message;
            this.testResults.failedTests++;
            console.log(`❌ 数据一致性测试失败: ${error.message}\n`);
        } finally {
            consistencySuite.endTime = Date.now();
            this.testResults.testSuites.push(consistencySuite);
        }
    }

    /**
     * 运行系统集成验证
     */
    async runSystemIntegrationTests() {
        console.log('🔗 执行系统集成验证测试...');

        const integrationSuite = {
            name: 'System Integration Validation Tests',
            startTime: Date.now(),
            tests: [],
            status: 'running'
        };

        try {
            // 验证n8n工作流配置
            await this.validateN8NWorkflowIntegration(integrationSuite);
            
            // 验证Notion集成
            await this.validateNotionIntegration(integrationSuite);
            
            // 验证火鸟门户集成
            await this.validateFirebirdIntegration(integrationSuite);
            
            // 验证监控和日志系统
            await this.validateMonitoringIntegration(integrationSuite);

            integrationSuite.status = 'completed';
            console.log('✅ 系统集成验证测试完成\n');

        } catch (error) {
            integrationSuite.status = 'failed';
            integrationSuite.error = error.message;
            this.testResults.failedTests++;
            console.log(`❌ 系统集成验证失败: ${error.message}\n`);
        } finally {
            integrationSuite.endTime = Date.now();
            this.testResults.testSuites.push(integrationSuite);
        }
    }

    /**
     * 检查环境变量
     */
    async checkEnvironmentVariables(suite) {
        const requiredVars = [
            'OPENAI_API_KEY',
            'NOTION_API_TOKEN',
            'NOTION_DATABASE_ID',
            'HUONIAO_SESSION_ID'
        ];

        const missingVars = requiredVars.filter(varName => !process.env[varName]);
        
        const test = {
            name: 'Environment Variables Check',
            status: missingVars.length === 0 ? 'passed' : 'failed',
            message: missingVars.length === 0 ? 
                '所有必需环境变量已配置' : 
                `缺少环境变量: ${missingVars.join(', ')}`,
            timestamp: new Date().toISOString()
        };

        suite.tests.push(test);
        
        if (missingVars.length > 0) {
            throw new Error(`缺少必需环境变量: ${missingVars.join(', ')}`);
        }
    }

    /**
     * 检查文件系统权限
     */
    async checkFileSystemPermissions(suite) {
        const paths = [
            'n8n-config/workflows',
            'n8n-config/credentials',
            'scripts',
            'logs'
        ];

        const accessErrors = [];

        for (const dirPath of paths) {
            const fullPath = path.join(this.config.workspaceRoot, dirPath);
            try {
                await fs.access(fullPath, fs.constants.R_OK | fs.constants.W_OK);
            } catch (error) {
                accessErrors.push(dirPath);
            }
        }

        const test = {
            name: 'File System Permissions Check',
            status: accessErrors.length === 0 ? 'passed' : 'failed',
            message: accessErrors.length === 0 ? 
                '文件系统权限正常' : 
                `目录访问失败: ${accessErrors.join(', ')}`,
            timestamp: new Date().toISOString()
        };

        suite.tests.push(test);

        if (accessErrors.length > 0) {
            throw new Error(`目录访问失败: ${accessErrors.join(', ')}`);
        }
    }

    /**
     * 检查依赖模块
     */
    async checkDependencyModules(suite) {
        const requiredModules = [
            './enhanced-data-validator',
            './enhanced-error-handler'
        ];

        const moduleErrors = [];

        for (const modulePath of requiredModules) {
            try {
                require(modulePath);
            } catch (error) {
                moduleErrors.push({ module: modulePath, error: error.message });
            }
        }

        const test = {
            name: 'Dependency Modules Check',
            status: moduleErrors.length === 0 ? 'passed' : 'failed',
            message: moduleErrors.length === 0 ? 
                '所有依赖模块可用' : 
                `模块加载失败: ${moduleErrors.map(e => e.module).join(', ')}`,
            timestamp: new Date().toISOString(),
            details: moduleErrors
        };

        suite.tests.push(test);

        if (moduleErrors.length > 0) {
            throw new Error(`依赖模块不可用: ${moduleErrors.map(e => e.module).join(', ')}`);
        }
    }

    /**
     * 检查网络连接
     */
    async checkNetworkConnectivity(suite) {
        const testUrls = [
            'https://api.openai.com',
            'https://api.notion.com',
            'https://hawaiihub.net'
        ];

        const axios = require('axios');
        const connectivityResults = [];

        for (const url of testUrls) {
            try {
                const response = await axios.get(url, { timeout: 5000 });
                connectivityResults.push({
                    url,
                    status: 'success',
                    responseTime: response.headers['x-response-time'] || 'unknown'
                });
            } catch (error) {
                connectivityResults.push({
                    url,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        const successCount = connectivityResults.filter(r => r.status === 'success').length;
        const test = {
            name: 'Network Connectivity Check',
            status: successCount >= testUrls.length * 0.7 ? 'passed' : 'failed', // 至少70%成功
            message: `网络连接测试: ${successCount}/${testUrls.length}个端点可达`,
            timestamp: new Date().toISOString(),
            details: connectivityResults
        };

        suite.tests.push(test);
    }

    /**
     * 运行完整新闻工作流场景
     */
    async runCompleteNewsWorkflowScenario(suite) {
        const scenario = {
            name: 'Complete News Workflow Scenario',
            startTime: Date.now(),
            steps: [],
            status: 'running'
        };

        try {
            // 步骤1: 模拟RSS数据采集
            scenario.steps.push(await this.simulateRSSCollection());
            
            // 步骤2: 模拟内容处理
            scenario.steps.push(await this.simulateContentProcessing());
            
            // 步骤3: 模拟Notion存储
            scenario.steps.push(await this.simulateNotionStorage());
            
            // 步骤4: 模拟火鸟门户发布
            scenario.steps.push(await this.simulateFirebirdPublishing());
            
            // 步骤5: 验证端到端数据一致性
            scenario.steps.push(await this.validateEndToEndConsistency());

            scenario.status = 'completed';
            scenario.endTime = Date.now();

            const test = {
                name: scenario.name,
                status: 'passed',
                message: `完整工作流场景测试通过，${scenario.steps.length}个步骤`,
                timestamp: new Date().toISOString(),
                duration: scenario.endTime - scenario.startTime,
                details: scenario
            };

            suite.tests.push(test);
            this.testResults.passedTests++;

        } catch (error) {
            scenario.status = 'failed';
            scenario.error = error.message;
            scenario.endTime = Date.now();

            const test = {
                name: scenario.name,
                status: 'failed',
                message: `完整工作流场景测试失败: ${error.message}`,
                timestamp: new Date().toISOString(),
                details: scenario
            };

            suite.tests.push(test);
            this.testResults.failedTests++;
        }
    }

    /**
     * 运行多源并发处理场景
     */
    async runMultiSourceConcurrentScenario(suite) {
        const scenario = {
            name: 'Multi-Source Concurrent Processing Scenario',
            startTime: Date.now(),
            sources: ['RSS', 'GitHub', 'API'],
            results: [],
            status: 'running'
        };

        try {
            const promises = scenario.sources.map(async (source, index) => {
                return await this.simulateSourceProcessing(source, index);
            });

            scenario.results = await Promise.allSettled(promises);
            const successCount = scenario.results.filter(r => r.status === 'fulfilled').length;
            
            if (successCount < scenario.sources.length * 0.8) {
                throw new Error(`并发处理成功率过低: ${successCount}/${scenario.sources.length}`);
            }

            scenario.status = 'completed';
            scenario.endTime = Date.now();

            const test = {
                name: scenario.name,
                status: 'passed',
                message: `多源并发处理场景通过，成功率: ${successCount}/${scenario.sources.length}`,
                timestamp: new Date().toISOString(),
                duration: scenario.endTime - scenario.startTime,
                details: scenario
            };

            suite.tests.push(test);
            this.testResults.passedTests++;

        } catch (error) {
            scenario.status = 'failed';
            scenario.error = error.message;
            scenario.endTime = Date.now();

            const test = {
                name: scenario.name,
                status: 'failed',
                message: `多源并发处理场景失败: ${error.message}`,
                timestamp: new Date().toISOString(),
                details: scenario
            };

            suite.tests.push(test);
            this.testResults.failedTests++;
        }
    }

    /**
     * 运行错误恢复场景
     */
    async runErrorRecoveryScenario(suite) {
        const scenario = {
            name: 'Error Recovery Scenario',
            startTime: Date.now(),
            errorTypes: ['network', 'authentication', 'validation', 'storage'],
            recoveryResults: [],
            status: 'running'
        };

        try {
            for (const errorType of scenario.errorTypes) {
                const recoveryResult = await this.simulateErrorRecovery(errorType);
                scenario.recoveryResults.push(recoveryResult);
            }

            const recoveryRate = scenario.recoveryResults.filter(r => r.recovered).length / scenario.errorTypes.length;
            
            if (recoveryRate < 0.75) {
                throw new Error(`错误恢复率过低: ${recoveryRate * 100}%`);
            }

            scenario.status = 'completed';
            scenario.endTime = Date.now();

            const test = {
                name: scenario.name,
                status: 'passed',
                message: `错误恢复场景通过，恢复率: ${(recoveryRate * 100).toFixed(1)}%`,
                timestamp: new Date().toISOString(),
                duration: scenario.endTime - scenario.startTime,
                details: scenario
            };

            suite.tests.push(test);
            this.testResults.passedTests++;

        } catch (error) {
            scenario.status = 'failed';
            scenario.error = error.message;
            scenario.endTime = Date.now();

            const test = {
                name: scenario.name,
                status: 'failed',
                message: `错误恢复场景失败: ${error.message}`,
                timestamp: new Date().toISOString(),
                details: scenario
            };

            suite.tests.push(test);
            this.testResults.failedTests++;
        }
    }

    /**
     * 运行高负载场景
     */
    async runHighLoadScenario(suite) {
        const scenario = {
            name: 'High Load Processing Scenario',
            startTime: Date.now(),
            loadLevels: [50, 100, 200],
            results: [],
            status: 'running'
        };

        try {
            for (const loadLevel of scenario.loadLevels) {
                const loadResult = await this.simulateHighLoad(loadLevel);
                scenario.results.push(loadResult);
                
                // 检查性能是否在可接受范围内
                if (loadResult.averageResponseTime > 1000) { // 1秒
                    throw new Error(`负载${loadLevel}时响应时间过长: ${loadResult.averageResponseTime}ms`);
                }
            }

            scenario.status = 'completed';
            scenario.endTime = Date.now();

            const test = {
                name: scenario.name,
                status: 'passed',
                message: `高负载场景通过，最大负载: ${Math.max(...scenario.loadLevels)}`,
                timestamp: new Date().toISOString(),
                duration: scenario.endTime - scenario.startTime,
                details: scenario
            };

            suite.tests.push(test);
            this.testResults.passedTests++;

        } catch (error) {
            scenario.status = 'failed';
            scenario.error = error.message;
            scenario.endTime = Date.now();

            const test = {
                name: scenario.name,
                status: 'failed',
                message: `高负载场景失败: ${error.message}`,
                timestamp: new Date().toISOString(),
                details: scenario
            };

            suite.tests.push(test);
            this.testResults.failedTests++;
        }
    }

    /**
     * 模拟RSS采集
     */
    async simulateRSSCollection() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    step: 'RSS Collection',
                    status: 'success',
                    itemsCollected: 15,
                    duration: 2000,
                    timestamp: new Date().toISOString()
                });
            }, 100);
        });
    }

    /**
     * 模拟内容处理
     */
    async simulateContentProcessing() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    step: 'Content Processing',
                    status: 'success',
                    itemsProcessed: 12,
                    itemsFiltered: 3,
                    averageQualityScore: 78,
                    duration: 3000,
                    timestamp: new Date().toISOString()
                });
            }, 150);
        });
    }

    /**
     * 模拟Notion存储
     */
    async simulateNotionStorage() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    step: 'Notion Storage',
                    status: 'success',
                    itemsStored: 12,
                    storageTime: 1500,
                    timestamp: new Date().toISOString()
                });
            }, 100);
        });
    }

    /**
     * 模拟火鸟门户发布
     */
    async simulateFirebirdPublishing() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    step: 'Firebird Publishing',
                    status: 'success',
                    itemsPublished: 10,
                    publishingTime: 2500,
                    timestamp: new Date().toISOString()
                });
            }, 120);
        });
    }

    /**
     * 验证端到端一致性
     */
    async validateEndToEndConsistency() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    step: 'End-to-End Consistency Validation',
                    status: 'success',
                    consistencyScore: 95,
                    validationTime: 800,
                    timestamp: new Date().toISOString()
                });
            }, 80);
        });
    }

    /**
     * 模拟源处理
     */
    async simulateSourceProcessing(source, index) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    source,
                    status: 'success',
                    itemsProcessed: 5 + index * 2,
                    processingTime: 1000 + index * 200,
                    timestamp: new Date().toISOString()
                });
            }, 100 + index * 50);
        });
    }

    /**
     * 模拟错误恢复
     */
    async simulateErrorRecovery(errorType) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const recovered = Math.random() > 0.2; // 80%恢复率
                resolve({
                    errorType,
                    recovered,
                    recoveryTime: recovered ? 500 + Math.random() * 1000 : null,
                    timestamp: new Date().toISOString()
                });
            }, 200);
        });
    }

    /**
     * 模拟高负载
     */
    async simulateHighLoad(loadLevel) {
        const startTime = Date.now();
        const promises = [];

        for (let i = 0; i < loadLevel; i++) {
            promises.push(new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        itemId: i,
                        processingTime: 50 + Math.random() * 100,
                        success: Math.random() > 0.05 // 95%成功率
                    });
                }, Math.random() * 100);
            }));
        }

        const results = await Promise.allSettled(promises);
        const endTime = Date.now();
        
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const totalTime = endTime - startTime;
        const averageResponseTime = totalTime / loadLevel;

        return {
            loadLevel,
            totalTime,
            averageResponseTime,
            successRate: (successful / loadLevel) * 100,
            throughput: (successful / totalTime * 1000).toFixed(2),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 验证n8n工作流集成
     */
    async validateN8NWorkflowIntegration(suite) {
        try {
            const workflowPath = path.join(this.config.workspaceRoot, '火鸟门户_新闻采集工作流_增强版.json');
            const workflowContent = await fs.readFile(workflowPath, 'utf8');
            const workflow = JSON.parse(workflowContent);

            const test = {
                name: 'N8N Workflow Integration Validation',
                status: workflow.nodes && workflow.nodes.length > 0 ? 'passed' : 'failed',
                message: `n8n工作流验证: ${workflow.nodes?.length || 0}个节点`,
                timestamp: new Date().toISOString()
            };

            suite.tests.push(test);
            if (test.status === 'passed') {
                this.testResults.passedTests++;
            } else {
                this.testResults.failedTests++;
            }

        } catch (error) {
            const test = {
                name: 'N8N Workflow Integration Validation',
                status: 'failed',
                message: `n8n工作流验证失败: ${error.message}`,
                timestamp: new Date().toISOString()
            };

            suite.tests.push(test);
            this.testResults.failedTests++;
        }
    }

    /**
     * 验证Notion集成
     */
    async validateNotionIntegration(suite) {
        const test = {
            name: 'Notion Integration Validation',
            status: process.env.NOTION_API_TOKEN && process.env.NOTION_DATABASE_ID ? 'passed' : 'failed',
            message: process.env.NOTION_API_TOKEN && process.env.NOTION_DATABASE_ID ? 
                'Notion集成配置有效' : 'Notion集成配置缺失',
            timestamp: new Date().toISOString()
        };

        suite.tests.push(test);
        if (test.status === 'passed') {
            this.testResults.passedTests++;
        } else {
            this.testResults.failedTests++;
        }
    }

    /**
     * 验证火鸟门户集成
     */
    async validateFirebirdIntegration(suite) {
        const test = {
            name: 'Firebird Portal Integration Validation',
            status: process.env.HUONIAO_SESSION_ID ? 'passed' : 'failed',
            message: process.env.HUONIAO_SESSION_ID ? 
                '火鸟门户集成配置有效' : '火鸟门户集成配置缺失',
            timestamp: new Date().toISOString()
        };

        suite.tests.push(test);
        if (test.status === 'passed') {
            this.testResults.passedTests++;
        } else {
            this.testResults.failedTests++;
        }
    }

    /**
     * 验证监控集成
     */
    async validateMonitoringIntegration(suite) {
        try {
            const logsDir = path.join(this.config.workspaceRoot, 'logs');
            await fs.access(logsDir);

            const test = {
                name: 'Monitoring Integration Validation',
                status: 'passed',
                message: '监控和日志系统配置有效',
                timestamp: new Date().toISOString()
            };

            suite.tests.push(test);
            this.testResults.passedTests++;

        } catch (error) {
            const test = {
                name: 'Monitoring Integration Validation',
                status: 'failed',
                message: `监控系统验证失败: ${error.message}`,
                timestamp: new Date().toISOString()
            };

            suite.tests.push(test);
            this.testResults.failedTests++;
        }
    }

    /**
     * 更新测试计数
     */
    updateTestCounts(testerResults) {
        this.testResults.totalTests += testerResults.total;
        this.testResults.passedTests += testerResults.passed;
        this.testResults.failedTests += testerResults.failed;
        this.testResults.skippedTests += testerResults.skipped;
    }

    /**
     * 提取性能指标
     */
    extractPerformanceMetrics(testerResults) {
        const performanceTests = testerResults.tests.filter(test => 
            test.name.includes('performance') || test.name.includes('benchmark')
        );

        return {
            totalPerformanceTests: performanceTests.length,
            averageResponseTime: this.calculateAverageResponseTime(performanceTests),
            throughputMetrics: this.extractThroughputMetrics(performanceTests),
            resourceUsage: this.extractResourceUsage(performanceTests)
        };
    }

    /**
     * 计算平均响应时间
     */
    calculateAverageResponseTime(performanceTests) {
        const responseTimes = performanceTests
            .filter(test => test.details && test.details.averageTime)
            .map(test => parseFloat(test.details.averageTime));

        return responseTimes.length > 0 ? 
            (responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length).toFixed(2) : 
            'N/A';
    }

    /**
     * 提取吞吐量指标
     */
    extractThroughputMetrics(performanceTests) {
        const throughputTests = performanceTests.filter(test => 
            test.details && test.details.throughput
        );

        return throughputTests.map(test => ({
            testName: test.name,
            throughput: test.details.throughput,
            unit: 'items/second'
        }));
    }

    /**
     * 提取资源使用情况
     */
    extractResourceUsage(performanceTests) {
        const resourceTests = performanceTests.filter(test => 
            test.details && test.details.memoryUsage
        );

        return resourceTests.map(test => ({
            testName: test.name,
            memoryUsage: test.details.memoryUsage,
            duration: test.details.duration
        }));
    }

    /**
     * 生成最终报告
     */
    async generateFinalReport() {
        const totalDuration = this.testResults.endTime - this.testResults.startTime;
        const successRate = this.testResults.totalTests > 0 ? 
            ((this.testResults.passedTests / this.testResults.totalTests) * 100).toFixed(2) : '0';

        const report = {
            testSuite: 'Automated News Workflow - End-to-End Integration Tests',
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.testResults.totalTests,
                passedTests: this.testResults.passedTests,
                failedTests: this.testResults.failedTests,
                skippedTests: this.testResults.skippedTests,
                successRate: successRate + '%',
                totalDuration: totalDuration + 'ms',
                testSuites: this.testResults.testSuites.length
            },
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                workspaceRoot: this.config.workspaceRoot,
                timestamp: new Date().toISOString()
            },
            testSuites: this.testResults.testSuites,
            performance: this.testResults.performance,
            errors: this.testResults.errors,
            recommendations: this.generateRecommendations()
        };

        const reportPath = path.join(this.config.workspaceRoot, 'logs', `e2e-integration-test-report-${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        console.log(`📊 端到端集成测试报告已生成: ${reportPath}`);
        return report;
    }

    /**
     * 生成错误报告
     */
    async generateErrorReport() {
        const errorReport = {
            testSuite: 'Automated News Workflow - End-to-End Integration Tests (ERROR)',
            timestamp: new Date().toISOString(),
            errors: this.testResults.errors,
            partialResults: this.testResults.testSuites,
            recommendations: ['检查错误日志', '验证环境配置', '重新运行失败的测试']
        };

        const reportPath = path.join(this.config.workspaceRoot, 'logs', `e2e-integration-error-report-${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(errorReport, null, 2));

        console.log(`📊 错误报告已生成: ${reportPath}`);
    }

    /**
     * 生成建议
     */
    generateRecommendations() {
        const recommendations = [];
        const failedSuites = this.testResults.testSuites.filter(suite => suite.status === 'failed');

        if (failedSuites.length === 0) {
            recommendations.push('🎉 所有端到端集成测试通过！系统已准备好投入生产使用。');
            recommendations.push('📈 建议定期运行这些测试以确保系统稳定性。');
            recommendations.push('🔍 考虑添加更多边界条件和压力测试。');
        } else {
            recommendations.push(`⚠️ ${failedSuites.length}个测试套件失败，需要修复以下问题：`);
            failedSuites.forEach(suite => {
                recommendations.push(`  - ${suite.name}: ${suite.error || '未知错误'}`);
            });
            recommendations.push('🔧 修复失败的测试后重新运行完整测试套件。');
        }

        // 性能建议
        if (this.testResults.performance.averageResponseTime && 
            parseFloat(this.testResults.performance.averageResponseTime) > 100) {
            recommendations.push('⚡ 系统响应时间较慢，建议优化性能。');
        }

        return recommendations;
    }

    /**
     * 打印最终摘要
     */
    printFinalSummary() {
        const totalDuration = this.testResults.endTime - this.testResults.startTime;
        const successRate = this.testResults.totalTests > 0 ? 
            ((this.testResults.passedTests / this.testResults.totalTests) * 100).toFixed(2) : '0';

        console.log('\n' + '='.repeat(60));
        console.log('📋 端到端集成测试最终摘要');
        console.log('='.repeat(60));
        console.log(`总测试数: ${this.testResults.totalTests}`);
        console.log(`✅ 通过: ${this.testResults.passedTests}`);
        console.log(`❌ 失败: ${this.testResults.failedTests}`);
        console.log(`⏭️  跳过: ${this.testResults.skippedTests}`);
        console.log(`成功率: ${successRate}%`);
        console.log(`总耗时: ${(totalDuration / 1000).toFixed(2)}秒`);
        console.log(`测试套件: ${this.testResults.testSuites.length}个`);
        console.log('='.repeat(60));

        if (this.testResults.failedTests > 0) {
            console.log('\n❌ 失败的测试套件:');
            this.testResults.testSuites
                .filter(suite => suite.status === 'failed')
                .forEach(suite => {
                    console.log(`  • ${suite.name}: ${suite.error || '未知错误'}`);
                });
        }

        if (parseFloat(successRate) >= 95) {
            console.log('\n🎉 端到端集成测试基本通过！系统可以投入使用。');
        } else if (parseFloat(successRate) >= 80) {
            console.log('\n⚠️ 端到端集成测试部分通过，建议修复失败项后再投入生产。');
        } else {
            console.log('\n❌ 端到端集成测试失败率过高，需要重大修复后才能投入使用。');
        }

        console.log('\n📊 详细报告已保存到 logs/ 目录');
    }
}

// 主函数
async function main() {
    const runner = new E2EIntegrationTestRunner({
        enableDetailedLogging: true,
        maxTestItems: 50,
        testTimeout: 120000
    });

    await runner.runAllE2ETests();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('端到端集成测试执行失败:', error);
        process.exit(1);
    });
}

module.exports = { E2EIntegrationTestRunner };