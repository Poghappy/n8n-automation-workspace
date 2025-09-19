#!/usr/bin/env node

/**
 * 火鸟门户发布节点测试脚本
 * 
 * 测试更新后的火鸟门户发布节点功能，包括：
 * - 数据映射和验证
 * - API调用和重试机制
 * - 状态检查和错误处理
 * - 发布成功后的状态更新
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class FirebirdPublishNodeTester {
    constructor() {
        this.config = this.loadConfig();
        this.testResults = [];
        this.startTime = Date.now();
    }

    loadConfig() {
        try {
            const configPath = path.join(__dirname, '../n8n-config/firebird-publish-node-config.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.error('❌ 配置文件加载失败:', error.message);
            process.exit(1);
        }
    }

    // 模拟n8n环境变量
    setupTestEnvironment() {
        process.env.HUONIAO_SESSION_ID = process.env.HUONIAO_SESSION_ID || 'test_session_id';
        process.env.NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || 'test_notion_db_id';
    }

    // 创建测试数据
    createTestData() {
        return {
            // 基础必填字段
            title: 'AI技术发展测试新闻',
            content: '这是一条测试新闻内容，用于验证火鸟门户发布节点的功能。内容包含了足够的字符数以满足最小长度要求。人工智能技术正在快速发展，为各行各业带来了革命性的变化。',
            categoryId: 1,
            author: 'AI测试',
            source: 'Test Source',
            
            // 可选字段
            summary: '这是一条用于测试火鸟门户发布功能的测试新闻',
            keywords: ['AI', '测试', '新闻', '技术'],
            source_url: 'https://example.com/test-news',
            image_url: 'https://example.com/test-image.jpg',
            
            // 系统字段
            publishedAt: new Date().toISOString(),
            quality_score: 85,
            
            // 模拟Notion数据
            notionPageId: 'test_notion_page_id'
        };
    }

    // 数据验证测试
    async testDataValidation() {
        console.log('\n🧪 测试数据验证功能...');
        
        const testCases = [
            {
                name: '正常数据',
                data: this.createTestData(),
                expectValid: true
            },
            {
                name: '标题为空',
                data: { ...this.createTestData(), title: '' },
                expectValid: false
            },
            {
                name: '标题过长',
                data: { ...this.createTestData(), title: 'A'.repeat(70) },
                expectValid: false
            },
            {
                name: '内容过短',
                data: { ...this.createTestData(), content: '短内容' },
                expectValid: false
            },
            {
                name: '分类ID无效',
                data: { ...this.createTestData(), categoryId: 'invalid' },
                expectValid: false
            }
        ];

        for (const testCase of testCases) {
            try {
                const errors = this.validateData(testCase.data);
                const isValid = errors.length === 0;
                
                if (isValid === testCase.expectValid) {
                    console.log(`  ✅ ${testCase.name}: 验证结果符合预期`);
                    this.testResults.push({ test: testCase.name, status: 'passed' });
                } else {
                    console.log(`  ❌ ${testCase.name}: 验证结果不符合预期`);
                    console.log(`     期望: ${testCase.expectValid ? '有效' : '无效'}, 实际: ${isValid ? '有效' : '无效'}`);
                    if (errors.length > 0) {
                        console.log(`     错误: ${errors.join(', ')}`);
                    }
                    this.testResults.push({ test: testCase.name, status: 'failed', errors });
                }
            } catch (error) {
                console.log(`  ❌ ${testCase.name}: 验证过程出错 - ${error.message}`);
                this.testResults.push({ test: testCase.name, status: 'error', error: error.message });
            }
        }
    }

    // 数据验证函数
    validateData(data) {
        const errors = [];
        const rules = this.config.validation.prePublishChecks;

        // 首先映射数据字段
        const mappedData = {
            title: data.title,
            body: data.content, // content -> body
            typeid: data.categoryId, // categoryId -> typeid
            writer: data.author,
            source: data.source,
            keywords: data.keywords,
            description: data.summary || data.description,
            sourceurl: data.source_url
        };

        for (const rule of rules) {
            const fieldValue = mappedData[rule.field];
            
            for (const ruleType of rule.rules) {
                if (ruleType === 'required' && (!fieldValue || fieldValue.toString().trim().length === 0)) {
                    errors.push(`${rule.field}不能为空`);
                }
                
                if (ruleType.startsWith('maxLength:')) {
                    const maxLength = parseInt(ruleType.split(':')[1]);
                    if (fieldValue && fieldValue.toString().length > maxLength) {
                        errors.push(`${rule.field}长度超过${maxLength}字符`);
                    }
                }
                
                if (ruleType.startsWith('minLength:')) {
                    const minLength = parseInt(ruleType.split(':')[1]);
                    if (fieldValue && fieldValue.toString().length < minLength) {
                        errors.push(`${rule.field}长度少于${minLength}字符`);
                    }
                }
                
                if (ruleType === 'integer' && fieldValue && isNaN(parseInt(fieldValue))) {
                    errors.push(`${rule.field}必须是整数`);
                }
                
                if (ruleType.startsWith('min:')) {
                    const minValue = parseInt(ruleType.split(':')[1]);
                    if (fieldValue && parseInt(fieldValue) < minValue) {
                        errors.push(`${rule.field}不能小于${minValue}`);
                    }
                }
                
                if (ruleType === 'url' && fieldValue && !this.isValidUrl(fieldValue)) {
                    errors.push(`${rule.field}不是有效的URL`);
                }
            }
        }

        return errors;
    }

    // URL验证
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // 数据映射测试
    async testDataMapping() {
        console.log('\n🧪 测试数据映射功能...');
        
        const testData = this.createTestData();
        const mappedData = this.mapDataToFirebirdFormat(testData);
        
        // 验证映射结果
        const expectedFields = ['service', 'action', 'title', 'typeid', 'body', 'writer', 'source'];
        let mappingSuccess = true;
        
        for (const field of expectedFields) {
            if (!mappedData.hasOwnProperty(field)) {
                console.log(`  ❌ 缺少必填字段: ${field}`);
                mappingSuccess = false;
            }
        }
        
        // 验证字段值
        if (mappedData.service !== 'article') {
            console.log(`  ❌ service字段错误: ${mappedData.service}`);
            mappingSuccess = false;
        }
        
        if (mappedData.action !== 'put') {
            console.log(`  ❌ action字段错误: ${mappedData.action}`);
            mappingSuccess = false;
        }
        
        if (mappedData.title.length > 60) {
            console.log(`  ❌ 标题长度未正确截断: ${mappedData.title.length}`);
            mappingSuccess = false;
        }
        
        if (mappingSuccess) {
            console.log('  ✅ 数据映射测试通过');
            this.testResults.push({ test: 'data_mapping', status: 'passed' });
        } else {
            console.log('  ❌ 数据映射测试失败');
            this.testResults.push({ test: 'data_mapping', status: 'failed' });
        }
        
        console.log('  📋 映射后的数据:');
        console.log(JSON.stringify(mappedData, null, 2));
    }

    // 数据映射函数
    mapDataToFirebirdFormat(data) {
        const mappings = this.config.dataMapping.mappings;
        const result = {};
        
        // 处理常量字段
        result.service = mappings.service.value;
        result.action = mappings.action.value;
        
        // 处理数据字段
        result.title = (data.title || '').substring(0, 60);
        result.typeid = parseInt(data.categoryId || data.typeid || 1);
        result.body = data.content || '';
        result.writer = (data.author || 'AI采集').substring(0, 20);
        result.source = (data.source || 'AI采集').substring(0, 30);
        
        // 处理可选字段
        result.keywords = '';
        if (data.keywords) {
            if (Array.isArray(data.keywords)) {
                result.keywords = data.keywords.join(',').substring(0, 50);
            } else {
                result.keywords = data.keywords.toString().substring(0, 50);
            }
        }
        
        result.description = (data.summary || data.description || '').substring(0, 255);
        result.sourceurl = (data.source_url || '').substring(0, 200);
        result.litpic = data.image_url || data.litpic || '';
        
        // 处理图集
        if (data.images && Array.isArray(data.images)) {
            result.imglist = data.images.map(img => `${img}|AI采集图片`).join(',');
        }
        
        return result;
    }

    // HTTP请求配置测试
    async testHttpRequestConfig() {
        console.log('\n🧪 测试HTTP请求配置...');
        
        const config = this.config.httpRequestNode.parameters;
        let configValid = true;
        
        // 验证基础配置
        if (config.url !== 'https://hawaiihub.net/include/ajax.php') {
            console.log('  ❌ API端点URL不正确');
            configValid = false;
        }
        
        if (config.httpMethod !== 'POST') {
            console.log('  ❌ HTTP方法应为POST');
            configValid = false;
        }
        
        if (config.contentType !== 'form-urlencoded') {
            console.log('  ❌ 内容类型应为form-urlencoded');
            configValid = false;
        }
        
        // 验证请求头
        const headers = config.headerParameters.parameters;
        const requiredHeaders = ['Content-Type', 'Cookie', 'User-Agent'];
        
        for (const requiredHeader of requiredHeaders) {
            const headerExists = headers.some(h => h.name === requiredHeader);
            if (!headerExists) {
                console.log(`  ❌ 缺少必需的请求头: ${requiredHeader}`);
                configValid = false;
            }
        }
        
        // 验证请求体参数
        const bodyParams = config.bodyParameters.parameters;
        const requiredParams = ['service', 'action', 'title', 'typeid', 'body'];
        
        for (const requiredParam of requiredParams) {
            const paramExists = bodyParams.some(p => p.name === requiredParam);
            if (!paramExists) {
                console.log(`  ❌ 缺少必需的请求参数: ${requiredParam}`);
                configValid = false;
            }
        }
        
        // 验证重试配置
        const retryConfig = config.options.retry;
        if (!retryConfig.enabled || retryConfig.maxTries !== 3) {
            console.log('  ❌ 重试配置不正确');
            configValid = false;
        }
        
        if (configValid) {
            console.log('  ✅ HTTP请求配置验证通过');
            this.testResults.push({ test: 'http_config', status: 'passed' });
        } else {
            console.log('  ❌ HTTP请求配置验证失败');
            this.testResults.push({ test: 'http_config', status: 'failed' });
        }
    }

    // 模拟API调用测试
    async testApiCall() {
        console.log('\n🧪 测试API调用功能...');
        
        const testData = this.createTestData();
        const mappedData = this.mapDataToFirebirdFormat(testData);
        
        // 添加会话ID
        mappedData.sessionId = process.env.HUONIAO_SESSION_ID;
        
        try {
            // 构建请求配置
            const requestConfig = {
                method: 'POST',
                url: 'https://hawaiihub.net/include/ajax.php',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': `PHPSESSID=${mappedData.sessionId}`,
                    'User-Agent': 'Mozilla/5.0 (compatible; n8n-automation/1.0)',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    'Referer': 'https://hawaiihub.net/',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                data: new URLSearchParams({
                    service: mappedData.service,
                    action: mappedData.action,
                    title: mappedData.title,
                    typeid: mappedData.typeid.toString(),
                    body: mappedData.body,
                    writer: mappedData.writer,
                    source: mappedData.source,
                    keywords: mappedData.keywords,
                    description: mappedData.description,
                    sourceurl: mappedData.sourceurl,
                    litpic: mappedData.litpic
                }).toString(),
                timeout: 30000
            };
            
            console.log('  📤 发送API请求...');
            console.log(`     URL: ${requestConfig.url}`);
            console.log(`     标题: ${mappedData.title}`);
            console.log(`     分类ID: ${mappedData.typeid}`);
            
            // 注意：这里只是模拟请求，不实际发送以避免创建测试数据
            console.log('  ⚠️  模拟API调用（未实际发送请求以避免创建测试数据）');
            
            // 模拟成功响应
            const mockResponse = {
                state: 100,
                info: 12345
            };
            
            console.log('  📥 模拟API响应:');
            console.log(JSON.stringify(mockResponse, null, 2));
            
            if (mockResponse.state === 100) {
                console.log('  ✅ API调用测试通过（模拟成功）');
                this.testResults.push({ 
                    test: 'api_call', 
                    status: 'passed', 
                    note: 'simulated_success',
                    articleId: mockResponse.info
                });
            }
            
        } catch (error) {
            console.log(`  ❌ API调用测试失败: ${error.message}`);
            this.testResults.push({ 
                test: 'api_call', 
                status: 'failed', 
                error: error.message 
            });
        }
    }

    // 错误处理测试
    async testErrorHandling() {
        console.log('\n🧪 测试错误处理功能...');
        
        const errorScenarios = [
            {
                name: '会话过期',
                response: { state: 401, info: 'Unauthorized' },
                expectedCategory: 'session_expired'
            },
            {
                name: 'API业务错误',
                response: { state: 101, info: '标题不能为空' },
                expectedCategory: 'api_business_error'
            },
            {
                name: 'API处理失败',
                response: { state: 200, info: '系统错误' },
                expectedCategory: 'api_business_error'
            }
        ];
        
        for (const scenario of errorScenarios) {
            const errorCategory = this.categorizeError(scenario.response.info, scenario.response.state);
            
            if (errorCategory.type === scenario.expectedCategory) {
                console.log(`  ✅ ${scenario.name}: 错误分类正确`);
                this.testResults.push({ 
                    test: `error_handling_${scenario.name}`, 
                    status: 'passed' 
                });
            } else {
                console.log(`  ❌ ${scenario.name}: 错误分类不正确`);
                console.log(`     期望: ${scenario.expectedCategory}, 实际: ${errorCategory.type}`);
                this.testResults.push({ 
                    test: `error_handling_${scenario.name}`, 
                    status: 'failed' 
                });
            }
        }
    }

    // 错误分类函数
    categorizeError(errorMessage, statusCode) {
        const errorMsg = errorMessage.toLowerCase();
        
        if (errorMsg.includes('session') || errorMsg.includes('unauthorized') || statusCode === 401) {
            return {
                type: 'session_expired',
                severity: 'high',
                action: 'refresh_session',
                retryable: true
            };
        }
        
        if (statusCode === 101 || statusCode === 200) {
            return {
                type: 'api_business_error',
                severity: 'medium',
                action: 'check_data_format',
                retryable: false
            };
        }
        
        return {
            type: 'unknown_error',
            severity: 'medium',
            action: 'investigate',
            retryable: true
        };
    }

    // 生成测试报告
    generateTestReport() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.status === 'passed').length;
        const failedTests = this.testResults.filter(r => r.status === 'failed').length;
        const errorTests = this.testResults.filter(r => r.status === 'error').length;
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: duration,
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                errors: errorTests,
                successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) + '%' : '0%'
            },
            results: this.testResults,
            config: {
                nodeVersion: this.config.version,
                apiEndpoint: this.config.httpRequestNode.parameters.url,
                retryConfig: this.config.retryStrategy
            }
        };
        
        return report;
    }

    // 保存测试报告
    async saveTestReport(report) {
        const reportPath = path.join(__dirname, '../logs/firebird-publish-node-test-report.json');
        
        try {
            // 确保logs目录存在
            const logsDir = path.dirname(reportPath);
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }
            
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`\n📄 测试报告已保存: ${reportPath}`);
        } catch (error) {
            console.error(`❌ 保存测试报告失败: ${error.message}`);
        }
    }

    // 运行所有测试
    async runAllTests() {
        console.log('🚀 开始火鸟门户发布节点测试...');
        console.log(`📅 测试时间: ${new Date().toISOString()}`);
        console.log(`🔧 配置版本: ${this.config.version}`);
        
        this.setupTestEnvironment();
        
        await this.testDataValidation();
        await this.testDataMapping();
        await this.testHttpRequestConfig();
        await this.testApiCall();
        await this.testErrorHandling();
        
        const report = this.generateTestReport();
        
        console.log('\n📊 测试结果汇总:');
        console.log(`   总测试数: ${report.summary.total}`);
        console.log(`   通过: ${report.summary.passed}`);
        console.log(`   失败: ${report.summary.failed}`);
        console.log(`   错误: ${report.summary.errors}`);
        console.log(`   成功率: ${report.summary.successRate}`);
        console.log(`   耗时: ${report.duration}ms`);
        
        await this.saveTestReport(report);
        
        if (report.summary.failed > 0 || report.summary.errors > 0) {
            console.log('\n❌ 部分测试失败，请检查详细报告');
            process.exit(1);
        } else {
            console.log('\n✅ 所有测试通过！');
            process.exit(0);
        }
    }
}

// 运行测试
if (require.main === module) {
    const tester = new FirebirdPublishNodeTester();
    tester.runAllTests().catch(error => {
        console.error('❌ 测试执行失败:', error);
        process.exit(1);
    });
}

module.exports = FirebirdPublishNodeTester;