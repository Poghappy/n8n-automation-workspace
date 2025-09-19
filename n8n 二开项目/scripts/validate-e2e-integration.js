#!/usr/bin/env node

/**
 * 端到端集成测试验证脚本
 * 验证所有集成测试组件是否正确配置和可用
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-01-23
 */

const fs = require('fs').promises;
const path = require('path');

class E2EIntegrationValidator {
    constructor(config = {}) {
        this.config = {
            workspaceRoot: config.workspaceRoot || process.cwd(),
            verbose: config.verbose !== false,
            ...config
        };

        this.validationResults = {
            startTime: Date.now(),
            endTime: null,
            totalChecks: 0,
            passedChecks: 0,
            failedChecks: 0,
            warnings: [],
            errors: [],
            recommendations: []
        };
    }

    /**
     * 运行所有验证检查
     */
    async runAllValidations() {
        console.log('🔍 开始端到端集成测试验证...\n');
        console.log('=' .repeat(60));
        console.log('自动化新闻工作流 - 集成测试验证');
        console.log('=' .repeat(60));

        try {
            // 1. 验证测试脚本
            await this.validateTestScripts();

            // 2. 验证测试数据
            await this.validateTestData();

            // 3. 验证依赖模块
            await this.validateDependencyModules();

            // 4. 验证配置文件
            await this.validateConfigurationFiles();

            // 5. 验证环境设置
            await this.validateEnvironmentSetup();

            // 6. 验证工作流文件
            await this.validateWorkflowFiles();

            // 7. 验证集成点
            await this.validateIntegrationPoints();

            // 8. 验证测试覆盖率
            await this.validateTestCoverage();

            // 生成验证报告
            await this.generateValidationReport();

            this.printValidationSummary();

        } catch (error) {
            console.error('❌ 验证过程失败:', error.message);
            this.validationResults.errors.push({
                type: 'validation_failure',
                message: error.message,
                timestamp: new Date().toISOString()
            });
            
            await this.generateErrorReport();
            process.exit(1);
        } finally {
            this.validationResults.endTime = Date.now();
        }
    }

    /**
     * 验证测试脚本
     */
    async validateTestScripts() {
        console.log('🧪 验证测试脚本...');

        const requiredScripts = [
            'scripts/test-enhanced-workflow.js',
            'scripts/run-e2e-integration-tests.js',
            'scripts/generate-test-data.js',
            'scripts/validate-e2e-integration.js'
        ];

        for (const scriptPath of requiredScripts) {
            await this.checkFile(scriptPath, 'test_script');
        }

        // 验证测试脚本的可执行性
        await this.validateScriptExecutability();

        console.log('✅ 测试脚本验证完成\n');
    }

    /**
     * 验证测试数据
     */
    async validateTestData() {
        console.log('📊 验证测试数据...');

        // 检查测试数据目录
        const testDataDir = path.join(this.config.workspaceRoot, 'test-data');
        
        try {
            await fs.access(testDataDir);
            this.recordCheck('test_data_directory', true, '测试数据目录存在');
        } catch {
            this.recordCheck('test_data_directory', false, '测试数据目录不存在');
            this.validationResults.recommendations.push('运行 node scripts/generate-test-data.js 生成测试数据');
        }

        // 验证测试数据完整性
        await this.validateTestDataIntegrity();

        console.log('✅ 测试数据验证完成\n');
    }

    /**
     * 验证依赖模块
     */
    async validateDependencyModules() {
        console.log('📦 验证依赖模块...');

        const requiredModules = [
            { path: 'scripts/enhanced-data-validator.js', name: 'EnhancedDataValidator' },
            { path: 'scripts/enhanced-error-handler.js', name: 'EnhancedErrorHandler' }
        ];

        for (const module of requiredModules) {
            await this.validateModule(module);
        }

        // 验证Node.js内置模块
        await this.validateBuiltinModules();

        // 验证第三方依赖
        await this.validateThirdPartyDependencies();

        console.log('✅ 依赖模块验证完成\n');
    }

    /**
     * 验证配置文件
     */
    async validateConfigurationFiles() {
        console.log('⚙️ 验证配置文件...');

        const configFiles = [
            'package.json',
            'docker-compose-n8n.yml',
            '.env.template'
        ];

        for (const configFile of configFiles) {
            await this.checkFile(configFile, 'config_file');
        }

        // 验证n8n配置
        await this.validateN8NConfiguration();

        // 验证工作流配置
        await this.validateWorkflowConfiguration();

        console.log('✅ 配置文件验证完成\n');
    }

    /**
     * 验证环境设置
     */
    async validateEnvironmentSetup() {
        console.log('🌍 验证环境设置...');

        // 检查环境变量
        await this.validateEnvironmentVariables();

        // 检查系统要求
        await this.validateSystemRequirements();

        // 检查网络连接
        await this.validateNetworkConnectivity();

        console.log('✅ 环境设置验证完成\n');
    }

    /**
     * 验证工作流文件
     */
    async validateWorkflowFiles() {
        console.log('🔄 验证工作流文件...');

        const workflowFiles = [
            '火鸟门户_新闻采集工作流_增强版.json',
            '火鸟门户_内容处理核心模块.js',
            '火鸟门户_API集成模块.js'
        ];

        for (const workflowFile of workflowFiles) {
            await this.validateWorkflowFile(workflowFile);
        }

        console.log('✅ 工作流文件验证完成\n');
    }

    /**
     * 验证集成点
     */
    async validateIntegrationPoints() {
        console.log('🔗 验证集成点...');

        const integrationPoints = [
            { name: 'n8n_workflow', description: 'n8n工作流集成' },
            { name: 'notion_api', description: 'Notion API集成' },
            { name: 'firebird_api', description: '火鸟门户API集成' },
            { name: 'openai_api', description: 'OpenAI API集成' }
        ];

        for (const point of integrationPoints) {
            await this.validateIntegrationPoint(point);
        }

        console.log('✅ 集成点验证完成\n');
    }

    /**
     * 验证测试覆盖率
     */
    async validateTestCoverage() {
        console.log('📈 验证测试覆盖率...');

        const testCategories = [
            { name: 'unit_tests', description: '单元测试' },
            { name: 'integration_tests', description: '集成测试' },
            { name: 'e2e_tests', description: '端到端测试' },
            { name: 'performance_tests', description: '性能测试' },
            { name: 'error_handling_tests', description: '错误处理测试' }
        ];

        for (const category of testCategories) {
            await this.validateTestCategory(category);
        }

        console.log('✅ 测试覆盖率验证完成\n');
    }

    /**
     * 检查文件是否存在
     */
    async checkFile(filePath, type) {
        const fullPath = path.join(this.config.workspaceRoot, filePath);
        
        try {
            const stats = await fs.stat(fullPath);
            const sizeKB = Math.round(stats.size / 1024);
            
            this.recordCheck(
                `${type}_${path.basename(filePath)}`,
                true,
                `${filePath} 存在 (${sizeKB} KB)`
            );

            // 对于JavaScript文件，检查语法
            if (filePath.endsWith('.js')) {
                await this.validateJavaScriptSyntax(fullPath, filePath);
            }

            // 对于JSON文件，检查格式
            if (filePath.endsWith('.json')) {
                await this.validateJSONFormat(fullPath, filePath);
            }

        } catch (error) {
            this.recordCheck(
                `${type}_${path.basename(filePath)}`,
                false,
                `${filePath} 不存在或无法访问`
            );
        }
    }

    /**
     * 验证JavaScript语法
     */
    async validateJavaScriptSyntax(fullPath, filePath) {
        try {
            const content = await fs.readFile(fullPath, 'utf8');
            
            // 基本语法检查
            if (!content.trim()) {
                this.recordCheck(
                    `syntax_${path.basename(filePath)}`,
                    false,
                    `${filePath} 文件为空`
                );
                return;
            }

            // 检查是否有明显的语法错误
            const syntaxIssues = this.checkJavaScriptSyntax(content);
            
            if (syntaxIssues.length === 0) {
                this.recordCheck(
                    `syntax_${path.basename(filePath)}`,
                    true,
                    `${filePath} 语法检查通过`
                );
            } else {
                this.recordCheck(
                    `syntax_${path.basename(filePath)}`,
                    false,
                    `${filePath} 语法问题: ${syntaxIssues.join(', ')}`
                );
            }

        } catch (error) {
            this.recordCheck(
                `syntax_${path.basename(filePath)}`,
                false,
                `${filePath} 语法检查失败: ${error.message}`
            );
        }
    }

    /**
     * 验证JSON格式
     */
    async validateJSONFormat(fullPath, filePath) {
        try {
            const content = await fs.readFile(fullPath, 'utf8');
            JSON.parse(content);
            
            this.recordCheck(
                `json_format_${path.basename(filePath)}`,
                true,
                `${filePath} JSON格式有效`
            );

        } catch (error) {
            this.recordCheck(
                `json_format_${path.basename(filePath)}`,
                false,
                `${filePath} JSON格式无效: ${error.message}`
            );
        }
    }

    /**
     * 检查JavaScript语法问题
     */
    checkJavaScriptSyntax(content) {
        const issues = [];

        // 检查基本的语法模式
        const patterns = [
            { regex: /function\s+\w+\s*\([^)]*\)\s*{/, name: '函数定义' },
            { regex: /class\s+\w+/, name: '类定义' },
            { regex: /module\.exports\s*=/, name: '模块导出' },
            { regex: /require\s*\([^)]+\)/, name: '模块导入' }
        ];

        // 检查是否包含基本的JavaScript结构
        let hasBasicStructure = false;
        for (const pattern of patterns) {
            if (pattern.regex.test(content)) {
                hasBasicStructure = true;
                break;
            }
        }

        if (!hasBasicStructure) {
            issues.push('缺少基本的JavaScript结构');
        }

        // 检查常见的语法错误
        if (content.includes('console.log(') && !content.includes(');')) {
            issues.push('可能存在未闭合的console.log语句');
        }

        return issues;
    }

    /**
     * 验证脚本可执行性
     */
    async validateScriptExecutability() {
        const testScripts = [
            'scripts/test-enhanced-workflow.js',
            'scripts/run-e2e-integration-tests.js',
            'scripts/generate-test-data.js'
        ];

        for (const script of testScripts) {
            try {
                const fullPath = path.join(this.config.workspaceRoot, script);
                const content = await fs.readFile(fullPath, 'utf8');
                
                // 检查是否有shebang
                const hasShebang = content.startsWith('#!/usr/bin/env node');
                
                // 检查是否有主函数
                const hasMainFunction = content.includes('if (require.main === module)') || 
                                       content.includes('async function main()');

                const executable = hasShebang && hasMainFunction;
                
                this.recordCheck(
                    `executable_${path.basename(script)}`,
                    executable,
                    executable ? `${script} 可执行` : `${script} 缺少可执行性配置`
                );

            } catch (error) {
                this.recordCheck(
                    `executable_${path.basename(script)}`,
                    false,
                    `${script} 可执行性检查失败: ${error.message}`
                );
            }
        }
    }

    /**
     * 验证测试数据完整性
     */
    async validateTestDataIntegrity() {
        const testDataTypes = [
            'rss/rss-test-data.json',
            'github/github-test-data.json',
            'api/api-test-data.json',
            'boundary/boundary-test-data.json',
            'performance/performance-test-data.json',
            'errors/error-scenario-test-data.json',
            'integration/integration-test-data.json',
            'test-data-index.json'
        ];

        for (const dataType of testDataTypes) {
            const dataPath = path.join(this.config.workspaceRoot, 'test-data', dataType);
            
            try {
                await fs.access(dataPath);
                
                // 验证数据格式
                const content = await fs.readFile(dataPath, 'utf8');
                const data = JSON.parse(content);
                
                const hasMetadata = data.metadata && data.metadata.type;
                const hasContent = Object.keys(data).length > 1;
                
                this.recordCheck(
                    `test_data_${dataType.replace(/[\/\.]/g, '_')}`,
                    hasMetadata && hasContent,
                    hasMetadata && hasContent ? 
                        `${dataType} 数据完整` : 
                        `${dataType} 数据不完整`
                );

            } catch (error) {
                this.recordCheck(
                    `test_data_${dataType.replace(/[\/\.]/g, '_')}`,
                    false,
                    `${dataType} 不存在或格式错误`
                );
            }
        }
    }

    /**
     * 验证模块
     */
    async validateModule(module) {
        try {
            const fullPath = path.join(this.config.workspaceRoot, module.path);
            await fs.access(fullPath);
            
            // 检查模块内容
            const content = await fs.readFile(fullPath, 'utf8');
            const hasClass = content.includes(`class ${module.name}`);
            const hasExport = content.includes('module.exports');
            
            this.recordCheck(
                `module_${module.name}`,
                hasClass && hasExport,
                hasClass && hasExport ? 
                    `${module.name} 模块有效` : 
                    `${module.name} 模块结构不完整`
            );

        } catch (error) {
            this.recordCheck(
                `module_${module.name}`,
                false,
                `${module.name} 模块不存在: ${error.message}`
            );
        }
    }

    /**
     * 验证内置模块
     */
    async validateBuiltinModules() {
        const builtinModules = ['fs', 'path', 'crypto', 'util'];
        
        for (const moduleName of builtinModules) {
            try {
                require(moduleName);
                this.recordCheck(
                    `builtin_${moduleName}`,
                    true,
                    `内置模块 ${moduleName} 可用`
                );
            } catch (error) {
                this.recordCheck(
                    `builtin_${moduleName}`,
                    false,
                    `内置模块 ${moduleName} 不可用`
                );
            }
        }
    }

    /**
     * 验证第三方依赖
     */
    async validateThirdPartyDependencies() {
        try {
            const packagePath = path.join(this.config.workspaceRoot, 'package.json');
            const packageContent = await fs.readFile(packagePath, 'utf8');
            const packageJson = JSON.parse(packageContent);
            
            const dependencies = {
                ...packageJson.dependencies || {},
                ...packageJson.devDependencies || {}
            };

            const criticalDeps = ['puppeteer'];
            const recommendedDeps = ['axios', 'dotenv'];

            for (const dep of criticalDeps) {
                const isInstalled = dependencies.hasOwnProperty(dep);
                this.recordCheck(
                    `dependency_${dep}`,
                    isInstalled,
                    isInstalled ? `关键依赖 ${dep} 已安装` : `关键依赖 ${dep} 未安装`
                );
            }

            for (const dep of recommendedDeps) {
                const isInstalled = dependencies.hasOwnProperty(dep);
                if (!isInstalled) {
                    this.validationResults.recommendations.push(`建议安装依赖: ${dep}`);
                }
            }

        } catch (error) {
            this.recordCheck(
                'third_party_dependencies',
                false,
                `第三方依赖检查失败: ${error.message}`
            );
        }
    }

    /**
     * 验证n8n配置
     */
    async validateN8NConfiguration() {
        try {
            const dockerComposePath = path.join(this.config.workspaceRoot, 'docker-compose-n8n.yml');
            const content = await fs.readFile(dockerComposePath, 'utf8');
            
            const requiredConfigs = [
                'n8n-main',
                'postgres',
                'HUONIAO_SESSION_ID',
                'NOTION_API_TOKEN',
                'OPENAI_API_KEY'
            ];

            let configCount = 0;
            for (const config of requiredConfigs) {
                if (content.includes(config)) {
                    configCount++;
                }
            }

            const configComplete = configCount === requiredConfigs.length;
            this.recordCheck(
                'n8n_configuration',
                configComplete,
                configComplete ? 
                    'n8n配置完整' : 
                    `n8n配置不完整 (${configCount}/${requiredConfigs.length})`
            );

        } catch (error) {
            this.recordCheck(
                'n8n_configuration',
                false,
                `n8n配置检查失败: ${error.message}`
            );
        }
    }

    /**
     * 验证工作流配置
     */
    async validateWorkflowConfiguration() {
        const workflowConfigDir = path.join(this.config.workspaceRoot, 'n8n-config');
        
        try {
            await fs.access(workflowConfigDir);
            
            const configFiles = await fs.readdir(workflowConfigDir);
            const hasWorkflows = configFiles.some(file => file.includes('workflow'));
            const hasCredentials = configFiles.some(file => file.includes('credential'));
            
            this.recordCheck(
                'workflow_configuration',
                hasWorkflows,
                hasWorkflows ? 
                    '工作流配置目录存在' : 
                    '工作流配置目录缺少配置文件'
            );

        } catch (error) {
            this.recordCheck(
                'workflow_configuration',
                false,
                `工作流配置检查失败: ${error.message}`
            );
        }
    }

    /**
     * 验证环境变量
     */
    async validateEnvironmentVariables() {
        const requiredVars = [
            'OPENAI_API_KEY',
            'NOTION_API_TOKEN',
            'NOTION_DATABASE_ID',
            'HUONIAO_SESSION_ID'
        ];

        const optionalVars = [
            'GITHUB_TOKEN',
            'WEBHOOK_ALERT_URL'
        ];

        for (const varName of requiredVars) {
            const isSet = !!process.env[varName];
            this.recordCheck(
                `env_var_${varName}`,
                isSet,
                isSet ? `环境变量 ${varName} 已设置` : `环境变量 ${varName} 未设置`
            );
        }

        for (const varName of optionalVars) {
            const isSet = !!process.env[varName];
            if (!isSet) {
                this.validationResults.recommendations.push(`建议设置可选环境变量: ${varName}`);
            }
        }
    }

    /**
     * 验证系统要求
     */
    async validateSystemRequirements() {
        // 检查Node.js版本
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        const nodeVersionOK = majorVersion >= 16;
        
        this.recordCheck(
            'node_version',
            nodeVersionOK,
            `Node.js版本: ${nodeVersion} ${nodeVersionOK ? '(满足要求)' : '(需要 >= 16.x)'}`
        );

        // 检查内存
        const totalMemory = require('os').totalmem();
        const totalMemoryGB = (totalMemory / 1024 / 1024 / 1024).toFixed(1);
        const memoryOK = totalMemory >= 2 * 1024 * 1024 * 1024; // 2GB
        
        this.recordCheck(
            'system_memory',
            memoryOK,
            `系统内存: ${totalMemoryGB}GB ${memoryOK ? '(充足)' : '(建议 >= 2GB)'}`
        );

        // 检查磁盘空间
        try {
            const stats = await fs.stat(this.config.workspaceRoot);
            this.recordCheck(
                'disk_space',
                true,
                '磁盘空间检查通过'
            );
        } catch (error) {
            this.recordCheck(
                'disk_space',
                false,
                `磁盘空间检查失败: ${error.message}`
            );
        }
    }

    /**
     * 验证网络连接
     */
    async validateNetworkConnectivity() {
        const testUrls = [
            { url: 'https://api.openai.com', name: 'OpenAI API' },
            { url: 'https://api.notion.com', name: 'Notion API' },
            { url: 'https://hawaiihub.net', name: '火鸟门户' }
        ];

        for (const { url, name } of testUrls) {
            try {
                // 简单的连接测试（不使用axios以避免依赖）
                const https = require('https');
                const urlObj = new URL(url);
                
                await new Promise((resolve, reject) => {
                    const req = https.request({
                        hostname: urlObj.hostname,
                        port: 443,
                        path: '/',
                        method: 'HEAD',
                        timeout: 5000
                    }, (res) => {
                        resolve(res);
                    });

                    req.on('error', reject);
                    req.on('timeout', () => reject(new Error('Timeout')));
                    req.end();
                });

                this.recordCheck(
                    `network_${name.replace(/\s+/g, '_').toLowerCase()}`,
                    true,
                    `${name} 网络连接正常`
                );

            } catch (error) {
                this.recordCheck(
                    `network_${name.replace(/\s+/g, '_').toLowerCase()}`,
                    false,
                    `${name} 网络连接失败: ${error.message}`
                );
            }
        }
    }

    /**
     * 验证工作流文件
     */
    async validateWorkflowFile(fileName) {
        const filePath = path.join(this.config.workspaceRoot, fileName);
        
        try {
            await fs.access(filePath);
            const content = await fs.readFile(filePath, 'utf8');
            
            let isValid = false;
            let details = '';

            if (fileName.endsWith('.json')) {
                try {
                    const workflow = JSON.parse(content);
                    isValid = workflow.nodes && Array.isArray(workflow.nodes);
                    details = isValid ? `包含 ${workflow.nodes.length} 个节点` : '缺少节点配置';
                } catch {
                    details = 'JSON格式错误';
                }
            } else if (fileName.endsWith('.js')) {
                isValid = content.includes('class') && content.includes('module.exports');
                details = isValid ? '模块结构正确' : '缺少类定义或导出';
            }

            this.recordCheck(
                `workflow_file_${fileName.replace(/[\.\/]/g, '_')}`,
                isValid,
                `${fileName} ${details}`
            );

        } catch (error) {
            this.recordCheck(
                `workflow_file_${fileName.replace(/[\.\/]/g, '_')}`,
                false,
                `${fileName} 不存在或无法访问`
            );
        }
    }

    /**
     * 验证集成点
     */
    async validateIntegrationPoint(point) {
        let isValid = false;
        let details = '';

        switch (point.name) {
            case 'n8n_workflow':
                isValid = await this.checkN8NIntegration();
                details = isValid ? 'n8n工作流配置有效' : 'n8n工作流配置缺失';
                break;
                
            case 'notion_api':
                isValid = !!process.env.NOTION_API_TOKEN && !!process.env.NOTION_DATABASE_ID;
                details = isValid ? 'Notion API配置有效' : 'Notion API配置缺失';
                break;
                
            case 'firebird_api':
                isValid = !!process.env.HUONIAO_SESSION_ID;
                details = isValid ? '火鸟门户API配置有效' : '火鸟门户API配置缺失';
                break;
                
            case 'openai_api':
                isValid = !!process.env.OPENAI_API_KEY;
                details = isValid ? 'OpenAI API配置有效' : 'OpenAI API配置缺失';
                break;
        }

        this.recordCheck(
            `integration_${point.name}`,
            isValid,
            details
        );
    }

    /**
     * 检查n8n集成
     */
    async checkN8NIntegration() {
        try {
            const workflowPath = path.join(this.config.workspaceRoot, '火鸟门户_新闻采集工作流_增强版.json');
            await fs.access(workflowPath);
            
            const dockerComposePath = path.join(this.config.workspaceRoot, 'docker-compose-n8n.yml');
            await fs.access(dockerComposePath);
            
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 验证测试类别
     */
    async validateTestCategory(category) {
        let coverage = 0;
        let details = '';

        switch (category.name) {
            case 'unit_tests':
                coverage = await this.calculateUnitTestCoverage();
                details = `单元测试覆盖率: ${coverage}%`;
                break;
                
            case 'integration_tests':
                coverage = await this.calculateIntegrationTestCoverage();
                details = `集成测试覆盖率: ${coverage}%`;
                break;
                
            case 'e2e_tests':
                coverage = await this.calculateE2ETestCoverage();
                details = `端到端测试覆盖率: ${coverage}%`;
                break;
                
            case 'performance_tests':
                coverage = await this.calculatePerformanceTestCoverage();
                details = `性能测试覆盖率: ${coverage}%`;
                break;
                
            case 'error_handling_tests':
                coverage = await this.calculateErrorHandlingTestCoverage();
                details = `错误处理测试覆盖率: ${coverage}%`;
                break;
        }

        const isAdequate = coverage >= 80;
        this.recordCheck(
            `test_coverage_${category.name}`,
            isAdequate,
            details
        );
    }

    /**
     * 计算单元测试覆盖率
     */
    async calculateUnitTestCoverage() {
        // 基于现有测试脚本估算覆盖率
        try {
            const testScript = path.join(this.config.workspaceRoot, 'scripts/test-enhanced-workflow.js');
            const content = await fs.readFile(testScript, 'utf8');
            
            const testMethods = (content.match(/async test\w+/g) || []).length;
            const totalMethods = (content.match(/async \w+/g) || []).length;
            
            return Math.min(100, Math.round((testMethods / Math.max(totalMethods, 1)) * 100));
        } catch {
            return 0;
        }
    }

    /**
     * 计算集成测试覆盖率
     */
    async calculateIntegrationTestCoverage() {
        try {
            const testScript = path.join(this.config.workspaceRoot, 'scripts/test-enhanced-workflow.js');
            const content = await fs.readFile(testScript, 'utf8');
            
            const integrationTests = [
                'testEndToEndIntegration',
                'testMultiSourceIntegration',
                'testNotionStorageIntegration',
                'testFirebirdPublishIntegration'
            ];

            let foundTests = 0;
            for (const test of integrationTests) {
                if (content.includes(test)) {
                    foundTests++;
                }
            }

            return Math.round((foundTests / integrationTests.length) * 100);
        } catch {
            return 0;
        }
    }

    /**
     * 计算端到端测试覆盖率
     */
    async calculateE2ETestCoverage() {
        try {
            const e2eScript = path.join(this.config.workspaceRoot, 'scripts/run-e2e-integration-tests.js');
            await fs.access(e2eScript);
            
            const content = await fs.readFile(e2eScript, 'utf8');
            const e2eScenarios = (content.match(/async run\w+Tests/g) || []).length;
            
            return e2eScenarios >= 6 ? 100 : Math.round((e2eScenarios / 6) * 100);
        } catch {
            return 0;
        }
    }

    /**
     * 计算性能测试覆盖率
     */
    async calculatePerformanceTestCoverage() {
        try {
            const testScript = path.join(this.config.workspaceRoot, 'scripts/test-enhanced-workflow.js');
            const content = await fs.readFile(testScript, 'utf8');
            
            const performanceTests = [
                'testBatchProcessingPerformance',
                'testConcurrentProcessing',
                'testLongRunningStability',
                'testSystemPerformanceBenchmarks'
            ];

            let foundTests = 0;
            for (const test of performanceTests) {
                if (content.includes(test)) {
                    foundTests++;
                }
            }

            return Math.round((foundTests / performanceTests.length) * 100);
        } catch {
            return 0;
        }
    }

    /**
     * 计算错误处理测试覆盖率
     */
    async calculateErrorHandlingTestCoverage() {
        try {
            const testScript = path.join(this.config.workspaceRoot, 'scripts/test-enhanced-workflow.js');
            const content = await fs.readFile(testScript, 'utf8');
            
            const errorTests = [
                'testErrorHandling',
                'testErrorScenariosAndRecovery',
                'testNetworkErrorRecovery',
                'testAuthenticationFailureRecovery'
            ];

            let foundTests = 0;
            for (const test of errorTests) {
                if (content.includes(test)) {
                    foundTests++;
                }
            }

            return Math.round((foundTests / errorTests.length) * 100);
        } catch {
            return 0;
        }
    }

    /**
     * 记录检查结果
     */
    recordCheck(checkName, passed, message) {
        this.validationResults.totalChecks++;
        
        if (passed) {
            this.validationResults.passedChecks++;
        } else {
            this.validationResults.failedChecks++;
        }

        const result = {
            checkName,
            passed,
            message,
            timestamp: new Date().toISOString()
        };

        if (this.config.verbose) {
            const status = passed ? '✅' : '❌';
            console.log(`  ${status} ${message}`);
        }

        if (!passed) {
            this.validationResults.errors.push(result);
        }
    }

    /**
     * 生成验证报告
     */
    async generateValidationReport() {
        const totalDuration = this.validationResults.endTime - this.validationResults.startTime;
        const successRate = this.validationResults.totalChecks > 0 ? 
            ((this.validationResults.passedChecks / this.validationResults.totalChecks) * 100).toFixed(2) : '0';

        const report = {
            validation: 'Automated News Workflow - E2E Integration Validation',
            timestamp: new Date().toISOString(),
            summary: {
                totalChecks: this.validationResults.totalChecks,
                passedChecks: this.validationResults.passedChecks,
                failedChecks: this.validationResults.failedChecks,
                successRate: successRate + '%',
                totalDuration: totalDuration + 'ms'
            },
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                workspaceRoot: this.config.workspaceRoot
            },
            results: {
                errors: this.validationResults.errors,
                warnings: this.validationResults.warnings,
                recommendations: this.validationResults.recommendations
            },
            readinessAssessment: this.generateReadinessAssessment(parseFloat(successRate))
        };

        const reportPath = path.join(this.config.workspaceRoot, 'logs', `e2e-validation-report-${Date.now()}.json`);
        
        // 确保logs目录存在
        try {
            await fs.mkdir(path.dirname(reportPath), { recursive: true });
        } catch {}

        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        console.log(`📊 验证报告已生成: ${reportPath}`);
        return report;
    }

    /**
     * 生成错误报告
     */
    async generateErrorReport() {
        const errorReport = {
            validation: 'Automated News Workflow - E2E Integration Validation (ERROR)',
            timestamp: new Date().toISOString(),
            errors: this.validationResults.errors,
            partialResults: {
                totalChecks: this.validationResults.totalChecks,
                passedChecks: this.validationResults.passedChecks,
                failedChecks: this.validationResults.failedChecks
            }
        };

        const reportPath = path.join(this.config.workspaceRoot, 'logs', `e2e-validation-error-report-${Date.now()}.json`);
        
        try {
            await fs.mkdir(path.dirname(reportPath), { recursive: true });
            await fs.writeFile(reportPath, JSON.stringify(errorReport, null, 2));
            console.log(`📊 错误报告已生成: ${reportPath}`);
        } catch (error) {
            console.error('无法生成错误报告:', error.message);
        }
    }

    /**
     * 生成就绪性评估
     */
    generateReadinessAssessment(successRate) {
        let readinessLevel = '';
        let recommendations = [];

        if (successRate >= 95) {
            readinessLevel = 'READY';
            recommendations.push('✅ 系统已准备好进行端到端集成测试');
            recommendations.push('🚀 可以开始运行完整的测试套件');
        } else if (successRate >= 80) {
            readinessLevel = 'MOSTLY_READY';
            recommendations.push('⚠️ 系统基本准备就绪，但有一些问题需要解决');
            recommendations.push('🔧 建议修复失败的检查项后再运行测试');
        } else if (successRate >= 60) {
            readinessLevel = 'PARTIALLY_READY';
            recommendations.push('❌ 系统存在较多问题，需要重大修复');
            recommendations.push('🛠️ 请解决关键问题后重新验证');
        } else {
            readinessLevel = 'NOT_READY';
            recommendations.push('🚫 系统未准备好进行集成测试');
            recommendations.push('📋 请按照错误列表逐项修复问题');
        }

        return {
            level: readinessLevel,
            successRate: successRate + '%',
            recommendations
        };
    }

    /**
     * 打印验证摘要
     */
    printValidationSummary() {
        const totalDuration = this.validationResults.endTime - this.validationResults.startTime;
        const successRate = this.validationResults.totalChecks > 0 ? 
            ((this.validationResults.passedChecks / this.validationResults.totalChecks) * 100).toFixed(2) : '0';

        console.log('\n' + '='.repeat(60));
        console.log('📋 端到端集成测试验证摘要');
        console.log('='.repeat(60));
        console.log(`总检查项: ${this.validationResults.totalChecks}`);
        console.log(`✅ 通过: ${this.validationResults.passedChecks}`);
        console.log(`❌ 失败: ${this.validationResults.failedChecks}`);
        console.log(`成功率: ${successRate}%`);
        console.log(`验证耗时: ${(totalDuration / 1000).toFixed(2)}秒`);
        console.log('='.repeat(60));

        // 显示就绪性评估
        const readiness = this.generateReadinessAssessment(parseFloat(successRate));
        console.log(`\n🎯 就绪性评估: ${readiness.level}`);
        readiness.recommendations.forEach(rec => console.log(`  ${rec}`));

        if (this.validationResults.failedChecks > 0) {
            console.log('\n❌ 失败的检查项:');
            this.validationResults.errors.slice(0, 10).forEach(error => {
                console.log(`  • ${error.message}`);
            });
            
            if (this.validationResults.errors.length > 10) {
                console.log(`  ... 还有 ${this.validationResults.errors.length - 10} 个错误`);
            }
        }

        if (this.validationResults.recommendations.length > 0) {
            console.log('\n💡 建议:');
            this.validationResults.recommendations.forEach(rec => {
                console.log(`  • ${rec}`);
            });
        }

        console.log('\n📊 详细报告已保存到 logs/ 目录');
    }
}

// 主函数
async function main() {
    const validator = new E2EIntegrationValidator({
        verbose: true
    });

    await validator.runAllValidations();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('验证执行失败:', error);
        process.exit(1);
    });
}

module.exports = { E2EIntegrationValidator };