#!/usr/bin/env node

/**
 * 测试数据生成器
 * 为端到端集成测试生成完整的测试用例和测试数据
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-01-23
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class TestDataGenerator {
    constructor(config = {}) {
        this.config = {
            workspaceRoot: config.workspaceRoot || process.cwd(),
            outputDir: config.outputDir || 'test-data',
            generateImages: config.generateImages !== false,
            ...config
        };

        this.categories = [
            '科技资讯', 'AI技术', '工具推荐', '行业动态', 
            '研究报告', '产品发布', '开源项目', '技术教程'
        ];

        this.sources = [
            'The Neuron', 'Futurepedia', 'Superhuman', 'The Rundown AI',
            'GitHub Trending', 'Hacker News', 'Product Hunt', 'AI News'
        ];

        this.authors = [
            'AI研究员', '技术专家', '产品经理', '开发者',
            '数据科学家', '机器学习工程师', '技术作家', '行业分析师'
        ];
    }

    /**
     * 生成所有测试数据
     */
    async generateAllTestData() {
        console.log('🔧 开始生成测试数据...\n');

        try {
            // 创建输出目录
            await this.createOutputDirectory();

            // 生成RSS测试数据
            await this.generateRSSTestData();

            // 生成GitHub测试数据
            await this.generateGitHubTestData();

            // 生成API测试数据
            await this.generateAPITestData();

            // 生成边界条件测试数据
            await this.generateBoundaryTestData();

            // 生成性能测试数据
            await this.generatePerformanceTestData();

            // 生成错误场景测试数据
            await this.generateErrorScenarioTestData();

            // 生成集成测试数据
            await this.generateIntegrationTestData();

            // 生成测试数据索引
            await this.generateTestDataIndex();

            console.log('✅ 所有测试数据生成完成！\n');
            await this.printDataSummary();

        } catch (error) {
            console.error('❌ 测试数据生成失败:', error.message);
            throw error;
        }
    }

    /**
     * 创建输出目录
     */
    async createOutputDirectory() {
        const outputPath = path.join(this.config.workspaceRoot, this.config.outputDir);
        
        try {
            await fs.access(outputPath);
        } catch {
            await fs.mkdir(outputPath, { recursive: true });
        }

        // 创建子目录
        const subDirs = ['rss', 'github', 'api', 'boundary', 'performance', 'errors', 'integration'];
        for (const subDir of subDirs) {
            const subDirPath = path.join(outputPath, subDir);
            try {
                await fs.access(subDirPath);
            } catch {
                await fs.mkdir(subDirPath, { recursive: true });
            }
        }

        console.log(`📁 测试数据目录已创建: ${outputPath}`);
    }

    /**
     * 生成RSS测试数据
     */
    async generateRSSTestData() {
        console.log('📡 生成RSS测试数据...');

        const rssTestData = {
            metadata: {
                type: 'rss_test_data',
                generated: new Date().toISOString(),
                count: 50,
                description: 'RSS源测试数据集，包含多种类型和质量的新闻文章'
            },
            sources: this.generateRSSSourceConfigs(),
            articles: []
        };

        // 生成50篇RSS文章
        for (let i = 0; i < 50; i++) {
            const article = this.generateRSSArticle(i);
            rssTestData.articles.push(article);
        }

        const outputPath = path.join(this.config.workspaceRoot, this.config.outputDir, 'rss', 'rss-test-data.json');
        await fs.writeFile(outputPath, JSON.stringify(rssTestData, null, 2));

        console.log(`  ✅ RSS测试数据已生成: ${rssTestData.articles.length}篇文章`);
    }

    /**
     * 生成GitHub测试数据
     */
    async generateGitHubTestData() {
        console.log('🐙 生成GitHub测试数据...');

        const githubTestData = {
            metadata: {
                type: 'github_test_data',
                generated: new Date().toISOString(),
                count: 30,
                description: 'GitHub项目测试数据集，包含不同语言和类型的项目'
            },
            projects: []
        };

        const languages = ['JavaScript', 'Python', 'TypeScript', 'Go', 'Rust', 'Java', 'C++', 'Swift'];
        const topics = ['机器学习', 'Web开发', '数据科学', '区块链', '移动开发', '游戏开发', '系统编程', 'DevOps'];

        // 生成30个GitHub项目
        for (let i = 0; i < 30; i++) {
            const project = this.generateGitHubProject(i, languages, topics);
            githubTestData.projects.push(project);
        }

        const outputPath = path.join(this.config.workspaceRoot, this.config.outputDir, 'github', 'github-test-data.json');
        await fs.writeFile(outputPath, JSON.stringify(githubTestData, null, 2));

        console.log(`  ✅ GitHub测试数据已生成: ${githubTestData.projects.length}个项目`);
    }

    /**
     * 生成API测试数据
     */
    async generateAPITestData() {
        console.log('🔌 生成API测试数据...');

        const apiTestData = {
            metadata: {
                type: 'api_test_data',
                generated: new Date().toISOString(),
                count: 25,
                description: '外部API测试数据集，模拟各种API响应格式'
            },
            endpoints: this.generateAPIEndpointConfigs(),
            responses: []
        };

        // 生成25个API响应
        for (let i = 0; i < 25; i++) {
            const response = this.generateAPIResponse(i);
            apiTestData.responses.push(response);
        }

        const outputPath = path.join(this.config.workspaceRoot, this.config.outputDir, 'api', 'api-test-data.json');
        await fs.writeFile(outputPath, JSON.stringify(apiTestData, null, 2));

        console.log(`  ✅ API测试数据已生成: ${apiTestData.responses.length}个响应`);
    }

    /**
     * 生成边界条件测试数据
     */
    async generateBoundaryTestData() {
        console.log('🔍 生成边界条件测试数据...');

        const boundaryTestData = {
            metadata: {
                type: 'boundary_test_data',
                generated: new Date().toISOString(),
                description: '边界条件测试数据集，包含各种极端情况'
            },
            categories: {
                empty: this.generateEmptyDataCases(),
                minimal: this.generateMinimalDataCases(),
                maximal: this.generateMaximalDataCases(),
                invalid: this.generateInvalidDataCases(),
                special_chars: this.generateSpecialCharsCases(),
                encoding: this.generateEncodingCases(),
                malformed: this.generateMalformedDataCases()
            }
        };

        const outputPath = path.join(this.config.workspaceRoot, this.config.outputDir, 'boundary', 'boundary-test-data.json');
        await fs.writeFile(outputPath, JSON.stringify(boundaryTestData, null, 2));

        const totalCases = Object.values(boundaryTestData.categories).reduce((sum, cases) => sum + cases.length, 0);
        console.log(`  ✅ 边界条件测试数据已生成: ${totalCases}个测试用例`);
    }

    /**
     * 生成性能测试数据
     */
    async generatePerformanceTestData() {
        console.log('⚡ 生成性能测试数据...');

        const performanceTestData = {
            metadata: {
                type: 'performance_test_data',
                generated: new Date().toISOString(),
                description: '性能测试数据集，包含不同规模的数据批次'
            },
            batches: {}
        };

        const batchSizes = [10, 50, 100, 500, 1000];

        for (const size of batchSizes) {
            console.log(`  📊 生成${size}条数据的批次...`);
            
            const batch = [];
            for (let i = 0; i < size; i++) {
                const item = this.generatePerformanceTestItem(i, size);
                batch.push(item);
            }

            performanceTestData.batches[`batch_${size}`] = {
                size,
                items: batch,
                generated: new Date().toISOString()
            };

            // 为大批次单独保存文件
            if (size >= 500) {
                const batchPath = path.join(this.config.workspaceRoot, this.config.outputDir, 'performance', `batch-${size}.json`);
                await fs.writeFile(batchPath, JSON.stringify(performanceTestData.batches[`batch_${size}`], null, 2));
            }
        }

        const outputPath = path.join(this.config.workspaceRoot, this.config.outputDir, 'performance', 'performance-test-data.json');
        await fs.writeFile(outputPath, JSON.stringify(performanceTestData, null, 2));

        const totalItems = Object.values(performanceTestData.batches).reduce((sum, batch) => sum + batch.size, 0);
        console.log(`  ✅ 性能测试数据已生成: ${totalItems}个测试项目`);
    }

    /**
     * 生成错误场景测试数据
     */
    async generateErrorScenarioTestData() {
        console.log('⚠️ 生成错误场景测试数据...');

        const errorTestData = {
            metadata: {
                type: 'error_scenario_test_data',
                generated: new Date().toISOString(),
                description: '错误场景测试数据集，模拟各种错误情况'
            },
            scenarios: {
                network_errors: this.generateNetworkErrorScenarios(),
                authentication_errors: this.generateAuthenticationErrorScenarios(),
                validation_errors: this.generateValidationErrorScenarios(),
                storage_errors: this.generateStorageErrorScenarios(),
                processing_errors: this.generateProcessingErrorScenarios(),
                timeout_errors: this.generateTimeoutErrorScenarios(),
                resource_errors: this.generateResourceErrorScenarios()
            }
        };

        const outputPath = path.join(this.config.workspaceRoot, this.config.outputDir, 'errors', 'error-scenario-test-data.json');
        await fs.writeFile(outputPath, JSON.stringify(errorTestData, null, 2));

        const totalScenarios = Object.values(errorTestData.scenarios).reduce((sum, scenarios) => sum + scenarios.length, 0);
        console.log(`  ✅ 错误场景测试数据已生成: ${totalScenarios}个错误场景`);
    }

    /**
     * 生成集成测试数据
     */
    async generateIntegrationTestData() {
        console.log('🔗 生成集成测试数据...');

        const integrationTestData = {
            metadata: {
                type: 'integration_test_data',
                generated: new Date().toISOString(),
                description: '集成测试数据集，包含完整的端到端测试场景'
            },
            workflows: this.generateWorkflowTestScenarios(),
            dataFlows: this.generateDataFlowTestCases(),
            systemStates: this.generateSystemStateTestCases(),
            integrationPoints: this.generateIntegrationPointTestCases()
        };

        const outputPath = path.join(this.config.workspaceRoot, this.config.outputDir, 'integration', 'integration-test-data.json');
        await fs.writeFile(outputPath, JSON.stringify(integrationTestData, null, 2));

        console.log(`  ✅ 集成测试数据已生成`);
    }

    /**
     * 生成测试数据索引
     */
    async generateTestDataIndex() {
        console.log('📋 生成测试数据索引...');

        const index = {
            metadata: {
                type: 'test_data_index',
                generated: new Date().toISOString(),
                description: '测试数据集索引，包含所有测试数据的概览'
            },
            datasets: {
                rss: {
                    file: 'rss/rss-test-data.json',
                    description: 'RSS源测试数据',
                    count: 50,
                    type: 'articles'
                },
                github: {
                    file: 'github/github-test-data.json',
                    description: 'GitHub项目测试数据',
                    count: 30,
                    type: 'projects'
                },
                api: {
                    file: 'api/api-test-data.json',
                    description: 'API响应测试数据',
                    count: 25,
                    type: 'responses'
                },
                boundary: {
                    file: 'boundary/boundary-test-data.json',
                    description: '边界条件测试数据',
                    count: 'variable',
                    type: 'test_cases'
                },
                performance: {
                    file: 'performance/performance-test-data.json',
                    description: '性能测试数据',
                    count: 'variable',
                    type: 'batches'
                },
                errors: {
                    file: 'errors/error-scenario-test-data.json',
                    description: '错误场景测试数据',
                    count: 'variable',
                    type: 'scenarios'
                },
                integration: {
                    file: 'integration/integration-test-data.json',
                    description: '集成测试数据',
                    count: 'variable',
                    type: 'test_cases'
                }
            },
            usage: {
                basic_tests: ['rss', 'github', 'api'],
                boundary_tests: ['boundary'],
                performance_tests: ['performance'],
                error_tests: ['errors'],
                integration_tests: ['integration', 'rss', 'github', 'api']
            }
        };

        const outputPath = path.join(this.config.workspaceRoot, this.config.outputDir, 'test-data-index.json');
        await fs.writeFile(outputPath, JSON.stringify(index, null, 2));

        console.log(`  ✅ 测试数据索引已生成`);
    }

    /**
     * 生成RSS文章
     */
    generateRSSArticle(index) {
        const category = this.categories[index % this.categories.length];
        const source = this.sources[index % this.sources.length];
        const author = this.authors[index % this.authors.length];

        const qualityLevel = this.getQualityLevel(index);
        const contentLength = this.getContentLength(qualityLevel);

        return {
            id: `rss_article_${index + 1}`,
            title: this.generateTitle(category, index + 1),
            content: this.generateContent(category, contentLength),
            summary: this.generateSummary(category),
            source,
            author,
            category,
            source_url: `https://example.com/rss-article-${index + 1}`,
            publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
            keywords: this.generateKeywords(category),
            image_url: this.config.generateImages ? `https://example.com/image-${index + 1}.jpg` : null,
            qualityLevel,
            sourceType: 'rss',
            metadata: {
                generated: true,
                index: index + 1,
                testCase: 'rss_collection'
            }
        };
    }

    /**
     * 生成GitHub项目
     */
    generateGitHubProject(index, languages, topics) {
        const language = languages[index % languages.length];
        const topic = topics[index % topics.length];

        return {
            id: `github_project_${index + 1}`,
            title: `${topic}开源项目 ${index + 1}: ${language}实现`,
            description: this.generateProjectDescription(topic, language),
            source: 'GitHub API',
            author: `github-user-${index + 1}`,
            source_url: `https://github.com/user${index + 1}/project${index + 1}`,
            publishedAt: new Date(Date.now() - index * 1800000).toISOString(),
            keywords: ['GitHub', language, topic, '开源'],
            language,
            topic,
            stars: Math.floor(Math.random() * 10000) + 100,
            forks: Math.floor(Math.random() * 1000) + 10,
            issues: Math.floor(Math.random() * 100) + 1,
            sourceType: 'github',
            metadata: {
                generated: true,
                index: index + 1,
                testCase: 'github_collection'
            }
        };
    }

    /**
     * 生成API响应
     */
    generateAPIResponse(index) {
        const responseTypes = ['news', 'article', 'blog_post', 'press_release', 'research_paper'];
        const responseType = responseTypes[index % responseTypes.length];

        return {
            id: `api_response_${index + 1}`,
            type: responseType,
            title: this.generateAPITitle(responseType, index + 1),
            content: this.generateAPIContent(responseType),
            source: `API Source ${index % 5 + 1}`,
            author: `API Author ${index + 1}`,
            source_url: `https://api.example.com/content/${index + 1}`,
            publishedAt: new Date(Date.now() - index * 2400000).toISOString(),
            keywords: this.generateAPIKeywords(responseType),
            sourceType: 'api',
            apiMetadata: {
                endpoint: `/api/v1/content/${index + 1}`,
                responseTime: Math.floor(Math.random() * 500) + 100,
                statusCode: 200
            },
            metadata: {
                generated: true,
                index: index + 1,
                testCase: 'api_collection'
            }
        };
    }

    /**
     * 生成空数据测试用例
     */
    generateEmptyDataCases() {
        return [
            {
                name: 'completely_empty',
                data: {},
                expectedResult: 'validation_failure',
                description: '完全空的数据对象'
            },
            {
                name: 'empty_strings',
                data: {
                    title: '',
                    content: '',
                    source: '',
                    author: ''
                },
                expectedResult: 'validation_failure',
                description: '所有字段为空字符串'
            },
            {
                name: 'null_values',
                data: {
                    title: null,
                    content: null,
                    source: null,
                    author: null
                },
                expectedResult: 'validation_failure',
                description: '所有字段为null值'
            }
        ];
    }

    /**
     * 生成最小数据测试用例
     */
    generateMinimalDataCases() {
        return [
            {
                name: 'minimal_valid',
                data: {
                    title: 'A',
                    content: 'B',
                    source: 'C'
                },
                expectedResult: 'validation_success',
                description: '最小有效数据'
            },
            {
                name: 'minimal_title_only',
                data: {
                    title: 'Minimal Title'
                },
                expectedResult: 'validation_failure',
                description: '仅有标题的最小数据'
            }
        ];
    }

    /**
     * 生成最大数据测试用例
     */
    generateMaximalDataCases() {
        return [
            {
                name: 'maximal_content',
                data: {
                    title: 'A'.repeat(200),
                    content: 'B'.repeat(50000),
                    source: 'C'.repeat(100),
                    author: 'D'.repeat(100),
                    keywords: Array(100).fill('keyword').map((k, i) => `${k}${i}`)
                },
                expectedResult: 'validation_success_with_truncation',
                description: '最大长度数据'
            }
        ];
    }

    /**
     * 生成无效数据测试用例
     */
    generateInvalidDataCases() {
        return [
            {
                name: 'wrong_types',
                data: {
                    title: 123,
                    content: ['array', 'instead', 'of', 'string'],
                    source: { object: 'instead of string' },
                    publishedAt: 'invalid-date-format'
                },
                expectedResult: 'validation_failure',
                description: '错误的数据类型'
            },
            {
                name: 'circular_reference',
                data: (() => {
                    const obj = { title: 'Test' };
                    obj.self = obj;
                    return obj;
                })(),
                expectedResult: 'processing_error',
                description: '循环引用数据'
            }
        ];
    }

    /**
     * 生成特殊字符测试用例
     */
    generateSpecialCharsCases() {
        return [
            {
                name: 'unicode_characters',
                data: {
                    title: '测试标题 🚀 🎉 ✨',
                    content: '包含Unicode字符的内容：中文、日文（こんにちは）、阿拉伯文（مرحبا）',
                    source: 'Unicode Test'
                },
                expectedResult: 'validation_success',
                description: 'Unicode字符测试'
            },
            {
                name: 'html_injection',
                data: {
                    title: '<script>alert("XSS")</script>恶意标题',
                    content: '<img src="x" onerror="alert(\'XSS\')" />恶意内容',
                    source: 'Security Test'
                },
                expectedResult: 'validation_success_with_sanitization',
                description: 'HTML注入测试'
            },
            {
                name: 'sql_injection',
                data: {
                    title: "'; DROP TABLE articles; --",
                    content: "1' OR '1'='1",
                    source: 'SQL Injection Test'
                },
                expectedResult: 'validation_success_with_sanitization',
                description: 'SQL注入测试'
            }
        ];
    }

    /**
     * 生成编码测试用例
     */
    generateEncodingCases() {
        return [
            {
                name: 'utf8_encoding',
                data: {
                    title: 'UTF-8编码测试',
                    content: '这是UTF-8编码的中文内容测试',
                    source: 'UTF-8 Test'
                },
                expectedResult: 'validation_success',
                description: 'UTF-8编码测试'
            },
            {
                name: 'mixed_encoding',
                data: {
                    title: 'Mixed Encoding Test 混合编码测试',
                    content: 'English and 中文 mixed content',
                    source: 'Mixed Encoding'
                },
                expectedResult: 'validation_success',
                description: '混合编码测试'
            }
        ];
    }

    /**
     * 生成格式错误数据测试用例
     */
    generateMalformedDataCases() {
        return [
            {
                name: 'malformed_json',
                rawData: '{"title": "Test", "content": "Content", invalid}',
                expectedResult: 'parsing_error',
                description: '格式错误的JSON数据'
            },
            {
                name: 'incomplete_data',
                data: {
                    title: 'Incomplete',
                    // 缺少必需字段
                },
                expectedResult: 'validation_failure',
                description: '不完整的数据'
            }
        ];
    }

    /**
     * 生成性能测试项目
     */
    generatePerformanceTestItem(index, batchSize) {
        return {
            id: `perf_item_${batchSize}_${index + 1}`,
            title: `性能测试文章 ${index + 1} (批次大小: ${batchSize})`,
            content: this.generatePerformanceContent(index, batchSize),
            source: 'Performance Test',
            author: 'Performance Tester',
            publishedAt: new Date().toISOString(),
            keywords: ['性能', '测试', '基准', `批次${batchSize}`],
            batchSize,
            itemIndex: index,
            metadata: {
                generated: true,
                testCase: 'performance_test',
                batchSize,
                itemIndex: index
            }
        };
    }

    /**
     * 生成网络错误场景
     */
    generateNetworkErrorScenarios() {
        return [
            {
                name: 'connection_timeout',
                error: 'ETIMEDOUT: Connection timed out',
                expectedRecovery: 'retry_with_backoff',
                description: '连接超时错误'
            },
            {
                name: 'connection_reset',
                error: 'ECONNRESET: Connection reset by peer',
                expectedRecovery: 'retry_with_backoff',
                description: '连接重置错误'
            },
            {
                name: 'dns_lookup_failed',
                error: 'ENOTFOUND: DNS lookup failed',
                expectedRecovery: 'retry_with_different_dns',
                description: 'DNS查找失败'
            },
            {
                name: 'connection_refused',
                error: 'ECONNREFUSED: Connection refused',
                expectedRecovery: 'check_service_availability',
                description: '连接被拒绝'
            }
        ];
    }

    /**
     * 生成认证错误场景
     */
    generateAuthenticationErrorScenarios() {
        return [
            {
                name: 'token_expired',
                error: '401 Unauthorized: Token expired',
                expectedRecovery: 'refresh_token',
                description: '令牌过期'
            },
            {
                name: 'invalid_credentials',
                error: '403 Forbidden: Invalid credentials',
                expectedRecovery: 'update_credentials',
                description: '无效凭据'
            },
            {
                name: 'session_expired',
                error: '401 Unauthorized: Session expired',
                expectedRecovery: 'reestablish_session',
                description: '会话过期'
            }
        ];
    }

    /**
     * 生成验证错误场景
     */
    generateValidationErrorScenarios() {
        return [
            {
                name: 'required_field_missing',
                error: 'Validation failed: Required field missing',
                expectedRecovery: 'skip_and_log',
                description: '必需字段缺失'
            },
            {
                name: 'invalid_data_format',
                error: 'Validation failed: Invalid data format',
                expectedRecovery: 'data_transformation',
                description: '无效数据格式'
            },
            {
                name: 'data_too_large',
                error: 'Validation failed: Data exceeds size limit',
                expectedRecovery: 'truncate_data',
                description: '数据过大'
            }
        ];
    }

    /**
     * 生成存储错误场景
     */
    generateStorageErrorScenarios() {
        return [
            {
                name: 'insufficient_storage',
                error: '507 Insufficient Storage',
                expectedRecovery: 'cleanup_and_retry',
                description: '存储空间不足'
            },
            {
                name: 'database_connection_failed',
                error: 'Connection to database failed',
                expectedRecovery: 'reconnect_database',
                description: '数据库连接失败'
            },
            {
                name: 'write_operation_timeout',
                error: 'Write operation timed out',
                expectedRecovery: 'retry_write_operation',
                description: '写操作超时'
            }
        ];
    }

    /**
     * 生成处理错误场景
     */
    generateProcessingErrorScenarios() {
        return [
            {
                name: 'ai_api_failure',
                error: 'AI API request failed',
                expectedRecovery: 'fallback_to_basic_processing',
                description: 'AI API失败'
            },
            {
                name: 'content_parsing_error',
                error: 'Failed to parse content',
                expectedRecovery: 'skip_malformed_content',
                description: '内容解析错误'
            },
            {
                name: 'quality_check_failure',
                error: 'Quality check process failed',
                expectedRecovery: 'use_default_quality_score',
                description: '质量检查失败'
            }
        ];
    }

    /**
     * 生成超时错误场景
     */
    generateTimeoutErrorScenarios() {
        return [
            {
                name: 'request_timeout',
                error: 'Request timeout after 30 seconds',
                expectedRecovery: 'increase_timeout_and_retry',
                description: '请求超时'
            },
            {
                name: 'processing_timeout',
                error: 'Processing timeout',
                expectedRecovery: 'split_into_smaller_batches',
                description: '处理超时'
            }
        ];
    }

    /**
     * 生成资源错误场景
     */
    generateResourceErrorScenarios() {
        return [
            {
                name: 'memory_exhausted',
                error: 'ENOMEM: Not enough memory',
                expectedRecovery: 'garbage_collection_and_retry',
                description: '内存耗尽'
            },
            {
                name: 'cpu_overload',
                error: 'CPU usage too high',
                expectedRecovery: 'throttle_processing',
                description: 'CPU过载'
            },
            {
                name: 'file_descriptor_limit',
                error: 'EMFILE: Too many open files',
                expectedRecovery: 'close_unused_files',
                description: '文件描述符限制'
            }
        ];
    }

    /**
     * 生成工作流测试场景
     */
    generateWorkflowTestScenarios() {
        return [
            {
                name: 'complete_news_workflow',
                description: '完整新闻工作流测试',
                steps: [
                    'rss_collection',
                    'content_processing',
                    'notion_storage',
                    'firebird_publishing'
                ],
                expectedDuration: 30000,
                successCriteria: {
                    minSuccessRate: 0.95,
                    maxProcessingTime: 30000
                }
            },
            {
                name: 'multi_source_workflow',
                description: '多源数据工作流测试',
                steps: [
                    'parallel_collection',
                    'data_merging',
                    'deduplication',
                    'batch_processing'
                ],
                expectedDuration: 45000,
                successCriteria: {
                    minSuccessRate: 0.90,
                    maxProcessingTime: 45000
                }
            }
        ];
    }

    /**
     * 生成数据流测试用例
     */
    generateDataFlowTestCases() {
        return [
            {
                name: 'rss_to_notion_flow',
                description: 'RSS数据到Notion的完整流程',
                inputFormat: 'rss_xml',
                outputFormat: 'notion_properties',
                transformations: [
                    'xml_parsing',
                    'data_validation',
                    'format_conversion',
                    'field_mapping'
                ]
            },
            {
                name: 'notion_to_firebird_flow',
                description: 'Notion数据到火鸟门户的发布流程',
                inputFormat: 'notion_properties',
                outputFormat: 'firebird_api_payload',
                transformations: [
                    'data_extraction',
                    'field_mapping',
                    'validation',
                    'api_formatting'
                ]
            }
        ];
    }

    /**
     * 生成系统状态测试用例
     */
    generateSystemStateTestCases() {
        return [
            {
                name: 'normal_operation',
                description: '正常运行状态',
                systemLoad: 'normal',
                expectedBehavior: 'optimal_performance'
            },
            {
                name: 'high_load',
                description: '高负载状态',
                systemLoad: 'high',
                expectedBehavior: 'graceful_degradation'
            },
            {
                name: 'error_recovery',
                description: '错误恢复状态',
                systemLoad: 'error_recovery',
                expectedBehavior: 'automatic_recovery'
            }
        ];
    }

    /**
     * 生成集成点测试用例
     */
    generateIntegrationPointTestCases() {
        return [
            {
                name: 'n8n_workflow_integration',
                description: 'n8n工作流集成点',
                integrationPoints: [
                    'webhook_trigger',
                    'function_nodes',
                    'http_requests',
                    'error_handling'
                ]
            },
            {
                name: 'notion_api_integration',
                description: 'Notion API集成点',
                integrationPoints: [
                    'authentication',
                    'database_operations',
                    'property_mapping',
                    'error_handling'
                ]
            },
            {
                name: 'firebird_api_integration',
                description: '火鸟门户API集成点',
                integrationPoints: [
                    'session_management',
                    'article_publishing',
                    'response_handling',
                    'error_recovery'
                ]
            }
        ];
    }

    /**
     * 生成RSS源配置
     */
    generateRSSSourceConfigs() {
        return [
            {
                name: 'The Neuron',
                url: 'https://www.theneuron.ai/feed',
                category: 'AI资讯',
                enabled: true,
                updateInterval: 1800
            },
            {
                name: 'Futurepedia',
                url: 'https://www.futurepedia.io/rss',
                category: 'AI工具',
                enabled: true,
                updateInterval: 3600
            },
            {
                name: 'Test RSS Source',
                url: 'https://test.example.com/rss',
                category: '测试',
                enabled: true,
                updateInterval: 900
            }
        ];
    }

    /**
     * 生成API端点配置
     */
    generateAPIEndpointConfigs() {
        return [
            {
                name: 'News API',
                url: 'https://api.example.com/news',
                method: 'GET',
                authentication: 'api_key',
                rateLimit: 100
            },
            {
                name: 'Content API',
                url: 'https://api.example.com/content',
                method: 'GET',
                authentication: 'bearer_token',
                rateLimit: 50
            }
        ];
    }

    /**
     * 辅助方法：生成标题
     */
    generateTitle(category, index) {
        const templates = [
            `${category}最新动态 ${index}：技术突破与应用前景`,
            `深度解析${category}发展趋势 ${index}`,
            `${category}行业报告 ${index}：市场现状与未来展望`,
            `${category}技术创新 ${index}：从理论到实践`,
            `${category}专家观点 ${index}：行业变革与机遇`
        ];

        return templates[index % templates.length];
    }

    /**
     * 辅助方法：生成内容
     */
    generateContent(category, length) {
        const baseContent = `这是关于${category}的详细分析文章。文章深入探讨了当前${category}领域的最新发展动态，包括技术创新、市场趋势、应用案例等多个方面。

通过对行业数据的深入分析，我们发现${category}正在经历快速发展期。主要特点包括：

1. 技术创新加速：新技术不断涌现，推动行业变革
2. 应用场景扩展：从传统领域扩展到新兴应用
3. 市场需求增长：用户需求多样化，市场潜力巨大
4. 生态系统完善：产业链上下游协同发展

展望未来，${category}将继续保持高速发展态势，为相关行业带来更多机遇和挑战。`;

        // 根据需要的长度调整内容
        if (length === 'short') {
            return baseContent.substring(0, 200);
        } else if (length === 'medium') {
            return baseContent;
        } else {
            return baseContent + '\n\n' + baseContent.replace(/这是关于/, '进一步分析');
        }
    }

    /**
     * 辅助方法：生成摘要
     */
    generateSummary(category) {
        return `本文深入分析了${category}领域的最新发展动态，探讨了技术创新、市场趋势和应用前景，为读者提供了全面的行业洞察。`;
    }

    /**
     * 辅助方法：生成关键词
     */
    generateKeywords(category) {
        const baseKeywords = [category, '技术', '创新', '发展', '趋势'];
        const additionalKeywords = ['人工智能', '数字化', '自动化', '智能化', '前沿技术'];
        
        return [...baseKeywords, ...additionalKeywords.slice(0, 3)];
    }

    /**
     * 辅助方法：获取质量等级
     */
    getQualityLevel(index) {
        const levels = ['high', 'medium', 'low'];
        return levels[index % levels.length];
    }

    /**
     * 辅助方法：获取内容长度
     */
    getContentLength(qualityLevel) {
        const lengthMap = {
            'high': 'long',
            'medium': 'medium',
            'low': 'short'
        };
        return lengthMap[qualityLevel] || 'medium';
    }

    /**
     * 辅助方法：生成项目描述
     */
    generateProjectDescription(topic, language) {
        return `这是一个专注于${topic}的开源项目，使用${language}语言开发。项目提供了完整的解决方案，包含详细的文档和示例代码，适合开发者学习和使用。`;
    }

    /**
     * 辅助方法：生成API标题
     */
    generateAPITitle(type, index) {
        const titleMap = {
            'news': `重要新闻 ${index}：行业动态更新`,
            'article': `技术文章 ${index}：深度分析报告`,
            'blog_post': `博客文章 ${index}：经验分享`,
            'press_release': `新闻发布 ${index}：官方公告`,
            'research_paper': `研究论文 ${index}：学术成果`
        };

        return titleMap[type] || `API内容 ${index}`;
    }

    /**
     * 辅助方法：生成API内容
     */
    generateAPIContent(type) {
        const contentMap = {
            'news': '这是一条重要的行业新闻，报道了最新的市场动态和技术发展。',
            'article': '这是一篇深度技术文章，详细分析了相关技术的原理和应用。',
            'blog_post': '这是一篇博客文章，分享了作者的实践经验和心得体会。',
            'press_release': '这是一份官方新闻发布，宣布了重要的产品或服务更新。',
            'research_paper': '这是一篇学术研究论文，展示了最新的研究成果和发现。'
        };

        return contentMap[type] || '这是通过API获取的内容。';
    }

    /**
     * 辅助方法：生成API关键词
     */
    generateAPIKeywords(type) {
        const keywordMap = {
            'news': ['新闻', '动态', '行业', 'API'],
            'article': ['文章', '技术', '分析', 'API'],
            'blog_post': ['博客', '经验', '分享', 'API'],
            'press_release': ['发布', '公告', '官方', 'API'],
            'research_paper': ['研究', '论文', '学术', 'API']
        };

        return keywordMap[type] || ['API', '内容'];
    }

    /**
     * 辅助方法：生成性能测试内容
     */
    generatePerformanceContent(index, batchSize) {
        const baseContent = `这是第${index + 1}篇性能测试文章，属于大小为${batchSize}的测试批次。`;
        const additionalContent = '文章内容经过精心设计，确保包含足够的信息量以进行有效的性能测试。内容长度适中，既能测试处理能力，又不会造成过度的资源消耗。';
        
        return baseContent + additionalContent.repeat(Math.ceil(batchSize / 100));
    }

    /**
     * 打印数据摘要
     */
    async printDataSummary() {
        console.log('📊 测试数据生成摘要:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📡 RSS测试数据: 50篇文章');
        console.log('🐙 GitHub测试数据: 30个项目');
        console.log('🔌 API测试数据: 25个响应');
        console.log('🔍 边界条件测试: 多种边界情况');
        console.log('⚡ 性能测试数据: 多个批次大小');
        console.log('⚠️ 错误场景测试: 多种错误类型');
        console.log('🔗 集成测试数据: 完整测试场景');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📁 所有数据已保存到: ${path.join(this.config.workspaceRoot, this.config.outputDir)}`);
        console.log('📋 使用 test-data-index.json 查看完整索引');
    }
}

// 主函数
async function main() {
    const generator = new TestDataGenerator({
        generateImages: true
    });

    await generator.generateAllTestData();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('测试数据生成失败:', error);
        process.exit(1);
    });
}

module.exports = { TestDataGenerator };