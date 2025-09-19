/**
 * 火鸟门户部署验证脚本
 * 验证整个系统的部署状态和功能
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-01-20
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

class HuoNiaoDeploymentValidator {
    constructor() {
        this.config = {
            n8nUrl: 'http://localhost:5678',
            apiUrl: 'http://127.0.0.1:3001',
            firecrawlApiKey: process.env.FIRECRAWL_API_KEY || 'fc-your-api-key-here',
            workflowName: '火鸟门户新闻数据抓取与发布工作流'
        };
        
        this.validationResults = {
            services: {},
            workflows: {},
            apis: {},
            integration: {},
            overall: 'pending'
        };
    }

    /**
     * 运行完整的部署验证
     */
    async runFullValidation() {
        console.log('🚀 开始火鸟门户部署验证...\n');
        
        try {
            // 1. 验证服务状态
            await this.validateServices();
            
            // 2. 验证N8N工作流
            await this.validateWorkflows();
            
            // 3. 验证API接口
            await this.validateAPIs();
            
            // 4. 验证集成功能
            await this.validateIntegration();
            
            // 5. 生成验证报告
            this.generateValidationReport();
            
        } catch (error) {
            console.error('❌ 验证过程失败:', error);
            this.validationResults.overall = 'failed';
        }
    }

    /**
     * 验证服务状态
     */
    async validateServices() {
        console.log('🔍 验证服务状态...');
        
        // 验证N8N服务
        try {
            const n8nStatus = await this.checkServiceHealth(this.config.n8nUrl + '/healthz');
            this.validationResults.services.n8n = {
                status: n8nStatus ? 'running' : 'stopped',
                url: this.config.n8nUrl,
                accessible: n8nStatus
            };
            console.log(`  N8N服务: ${n8nStatus ? '✅ 运行中' : '❌ 未运行'}`);
        } catch (error) {
            this.validationResults.services.n8n = {
                status: 'error',
                error: error.message
            };
            console.log('  N8N服务: ❌ 检查失败');
        }

        // 验证新闻API服务
        try {
            const apiStatus = await this.checkServiceHealth(this.config.apiUrl + '/');
            this.validationResults.services.newsApi = {
                status: apiStatus ? 'running' : 'stopped',
                url: this.config.apiUrl,
                accessible: apiStatus
            };
            console.log(`  新闻API服务: ${apiStatus ? '✅ 运行中' : '❌ 未运行'}`);
        } catch (error) {
            this.validationResults.services.newsApi = {
                status: 'error',
                error: error.message
            };
            console.log('  新闻API服务: ❌ 检查失败');
        }

        // 验证Firecrawl API连接
        try {
            const firecrawlStatus = await this.checkFirecrawlAPI();
            this.validationResults.services.firecrawl = {
                status: firecrawlStatus ? 'accessible' : 'inaccessible',
                apiKey: this.config.firecrawlApiKey ? 'configured' : 'missing'
            };
            console.log(`  Firecrawl API: ${firecrawlStatus ? '✅ 可访问' : '❌ 不可访问'}`);
        } catch (error) {
            this.validationResults.services.firecrawl = {
                status: 'error',
                error: error.message
            };
            console.log('  Firecrawl API: ❌ 检查失败');
        }
    }

    /**
     * 验证N8N工作流
     */
    async validateWorkflows() {
        console.log('📋 验证N8N工作流...');
        
        try {
            // 检查工作流是否存在
            const workflows = await this.listN8NWorkflows();
            const targetWorkflow = workflows.find(w => 
                w.name === this.config.workflowName || 
                w.name.includes('火鸟门户') || 
                w.name.includes('新闻数据抓取')
            );
            
            if (targetWorkflow) {
                this.validationResults.workflows.main = {
                    exists: true,
                    id: targetWorkflow.id,
                    name: targetWorkflow.name,
                    active: targetWorkflow.active,
                    lastUpdated: targetWorkflow.updatedAt
                };
                
                console.log(`  主工作流: ✅ 存在 (ID: ${targetWorkflow.id})`);
                console.log(`  状态: ${targetWorkflow.active ? '✅ 激活' : '⚠️ 未激活'}`);
                
                // 获取工作流详情
                const workflowDetails = await this.getWorkflowDetails(targetWorkflow.id);
                if (workflowDetails) {
                    const nodeCount = workflowDetails.nodes ? workflowDetails.nodes.length : 0;
                    console.log(`  节点数量: ${nodeCount}`);
                    
                    // 验证关键节点
                    const requiredNodes = ['定时触发器', 'Firecrawl搜索新闻', '火鸟门户数据集成处理', '保存新闻数据'];
                    const existingNodes = workflowDetails.nodes ? workflowDetails.nodes.map(n => n.name) : [];
                    
                    this.validationResults.workflows.nodes = {};
                    for (const nodeName of requiredNodes) {
                        const exists = existingNodes.includes(nodeName);
                        this.validationResults.workflows.nodes[nodeName] = exists;
                        console.log(`    ${nodeName}: ${exists ? '✅' : '❌'}`);
                    }
                }
            } else {
                this.validationResults.workflows.main = {
                    exists: false,
                    error: 'Workflow not found'
                };
                console.log('  主工作流: ❌ 不存在');
            }
        } catch (error) {
            this.validationResults.workflows.main = {
                exists: false,
                error: error.message
            };
            console.log('  工作流验证: ❌ 失败');
        }
    }

    /**
     * 验证API接口
     */
    async validateAPIs() {
        console.log('🔌 验证API接口...');
        
        // 验证新闻API接口
        const apiEndpoints = [
            { name: '健康检查', path: '/health', method: 'GET' },
            { name: '新闻列表', path: '/api/news', method: 'GET' },
            { name: '创建新闻', path: '/api/news', method: 'POST' },
            { name: '报告接口', path: '/api/reports', method: 'POST' }
        ];

        this.validationResults.apis.endpoints = {};
        
        for (const endpoint of apiEndpoints) {
            try {
                const result = await this.testAPIEndpoint(endpoint);
                this.validationResults.apis.endpoints[endpoint.name] = result;
                console.log(`  ${endpoint.name}: ${result.accessible ? '✅' : '❌'} (${result.status})`);
            } catch (error) {
                this.validationResults.apis.endpoints[endpoint.name] = {
                    accessible: false,
                    error: error.message
                };
                console.log(`  ${endpoint.name}: ❌ 错误`);
            }
        }
    }

    /**
     * 验证集成功能
     */
    async validateIntegration() {
        console.log('🔄 验证集成功能...');
        
        try {
            // 检查必要文件是否存在
            const requiredFiles = [
                '火鸟门户_新闻数据集成处理器.js',
                '火鸟门户_数据映射模块.js',
                '火鸟门户_错误处理与重试模块.js',
                '火鸟门户_集成测试脚本.js'
            ];

            this.validationResults.integration.files = {};
            for (const file of requiredFiles) {
                const filePath = path.join(__dirname, file);
                const exists = fs.existsSync(filePath);
                this.validationResults.integration.files[file] = exists;
                console.log(`  ${file}: ${exists ? '✅' : '❌'}`);
            }

            // 测试数据流
            if (this.validationResults.services.newsApi?.accessible) {
                const testData = {
                    title: '集成测试新闻',
                    content: '这是一条用于验证集成功能的测试新闻内容...',
                    category_id: 1,
                    tags: ['测试', '集成'],
                    source_url: 'https://test.example.com',
                    author: '系统测试'
                };

                const testResult = await this.testDataFlow(testData);
                this.validationResults.integration.dataFlow = testResult;
                console.log(`  数据流测试: ${testResult.success ? '✅' : '❌'}`);
            }

        } catch (error) {
            this.validationResults.integration.error = error.message;
            console.log('  集成功能验证: ❌ 失败');
        }
    }

    /**
     * 检查服务健康状态
     */
    async checkServiceHealth(url) {
        return new Promise((resolve) => {
            const client = url.startsWith('https') ? https : http;
            const request = client.get(url, { timeout: 10000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const isHealthy = res.statusCode >= 200 && res.statusCode < 400;
                    console.log(`    检查 ${url}: 状态码 ${res.statusCode}, 响应: ${data.substring(0, 100)}`);
                    resolve(isHealthy);
                });
            });
            
            request.on('error', (error) => {
                console.log(`    检查 ${url} 失败: ${error.message}`);
                resolve(false);
            });
            request.on('timeout', () => {
                console.log(`    检查 ${url} 超时`);
                request.destroy();
                resolve(false);
            });
            request.setTimeout(10000);
        });
    }

    /**
     * 检查Firecrawl API
     */
    async checkFirecrawlAPI() {
        return new Promise((resolve) => {
            const postData = JSON.stringify({
                query: 'test',
                limit: 1
            });

            const options = {
                hostname: 'api.firecrawl.dev',
                port: 443,
                path: '/v1/search',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.firecrawlApiKey}`,
                    'Content-Length': Buffer.byteLength(postData)
                },
                timeout: 10000
            };

            const req = https.request(options, (res) => {
                resolve(res.statusCode >= 200 && res.statusCode < 400);
            });

            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });

            req.write(postData);
            req.end();
        });
    }

    /**
     * 获取N8N工作流列表
     */
    async listN8NWorkflows() {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 5678,
                path: '/api/v1/workflows',
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlNTRkMjIzNi02Zjc5LTQxNjctOTI1Ny00MzhiYjMxNzQyNzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4MTMyNDMwLCJleHAiOjE3NjA3MTY4MDB9.P3uxFIoKUJkpKNji86cgFMuChXjytalFncKc0Xk2KxA'
                },
                timeout: 10000
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        resolve(result.data || []);
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    /**
     * 获取工作流详情
     */
    async getWorkflowDetails(workflowId) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 5678,
                path: `/api/v1/workflows/${workflowId}`,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlNTRkMjIzNi02Zjc5LTQxNjctOTI1Ny00MzhiYjMxNzQyNzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4MTMyNDMwLCJleHAiOjE3NjA3MTY4MDB9.P3uxFIoKUJkpKNji86cgFMuChXjytalFncKc0Xk2KxA'
                },
                timeout: 10000
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    /**
     * 测试API端点
     */
    async testAPIEndpoint(endpoint) {
        return new Promise((resolve) => {
            const options = {
                hostname: 'localhost',
                port: 3001,
                path: endpoint.path,
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            };

            const req = http.request(options, (res) => {
                resolve({
                    accessible: true,
                    status: res.statusCode,
                    method: endpoint.method
                });
            });

            req.on('error', () => {
                resolve({
                    accessible: false,
                    status: 'error',
                    method: endpoint.method
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    accessible: false,
                    status: 'timeout',
                    method: endpoint.method
                });
            });

            if (endpoint.method === 'POST') {
                req.write(JSON.stringify({ test: true }));
            }
            req.end();
        });
    }

    /**
     * 测试数据流
     */
    async testDataFlow(testData) {
        return new Promise((resolve) => {
            const postData = JSON.stringify(testData);
            
            const options = {
                hostname: 'localhost',
                port: 3001,
                path: '/api/news',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
                timeout: 10000
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        success: res.statusCode >= 200 && res.statusCode < 300,
                        statusCode: res.statusCode,
                        response: data
                    });
                });
            });

            req.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    success: false,
                    error: 'Request timeout'
                });
            });

            req.write(postData);
            req.end();
        });
    }

    /**
     * 生成验证报告
     */
    generateValidationReport() {
        console.log('\n📊 部署验证报告');
        console.log('='.repeat(60));
        
        // 计算总体状态
        const serviceStatus = Object.values(this.validationResults.services).every(s => s.status === 'running' || s.status === 'accessible');
        const workflowStatus = this.validationResults.workflows.main?.exists === true;
        const apiStatus = Object.values(this.validationResults.apis.endpoints || {}).every(e => e.accessible);
        
        this.validationResults.overall = serviceStatus && workflowStatus && apiStatus ? 'success' : 'partial';
        
        console.log(`总体状态: ${this.getStatusIcon(this.validationResults.overall)} ${this.validationResults.overall.toUpperCase()}`);
        console.log();
        
        // 服务状态
        console.log('🔧 服务状态:');
        for (const [service, status] of Object.entries(this.validationResults.services)) {
            console.log(`  ${service}: ${this.getStatusIcon(status.status)} ${status.status}`);
        }
        console.log();
        
        // 工作流状态
        console.log('📋 工作流状态:');
        if (this.validationResults.workflows.main) {
            const workflow = this.validationResults.workflows.main;
            console.log(`  主工作流: ${this.getStatusIcon(workflow.exists ? 'success' : 'failed')} ${workflow.exists ? '存在' : '不存在'}`);
            if (workflow.exists) {
                console.log(`    激活状态: ${workflow.active ? '✅' : '⚠️'}`);
            }
        }
        console.log();
        
        // API状态
        console.log('🔌 API接口状态:');
        for (const [endpoint, status] of Object.entries(this.validationResults.apis.endpoints || {})) {
            console.log(`  ${endpoint}: ${this.getStatusIcon(status.accessible ? 'success' : 'failed')} ${status.accessible ? '可访问' : '不可访问'}`);
        }
        console.log();
        
        // 集成功能
        console.log('🔄 集成功能:');
        if (this.validationResults.integration.files) {
            for (const [file, exists] of Object.entries(this.validationResults.integration.files)) {
                console.log(`  ${file}: ${exists ? '✅' : '❌'}`);
            }
        }
        
        if (this.validationResults.integration.dataFlow) {
            const dataFlow = this.validationResults.integration.dataFlow;
            console.log(`  数据流测试: ${this.getStatusIcon(dataFlow.success ? 'success' : 'failed')} ${dataFlow.success ? '通过' : '失败'}`);
        }
        
        // 保存详细报告
        const reportData = {
            timestamp: new Date().toISOString(),
            overall: this.validationResults.overall,
            details: this.validationResults,
            recommendations: this.generateRecommendations()
        };

        const reportPath = path.join(__dirname, `deployment-validation-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        
        console.log(`\n📄 详细报告已保存到: ${reportPath}`);
        
        // 显示建议
        const recommendations = this.generateRecommendations();
        if (recommendations.length > 0) {
            console.log('\n💡 建议:');
            recommendations.forEach((rec, index) => {
                console.log(`  ${index + 1}. ${rec}`);
            });
        }
        
        if (this.validationResults.overall === 'success') {
            console.log('\n🎉 部署验证完成！系统已准备就绪。');
        } else {
            console.log('\n⚠️ 部分功能存在问题，请根据建议进行修复。');
        }
    }

    /**
     * 获取状态图标
     */
    getStatusIcon(status) {
        const icons = {
            'success': '✅',
            'running': '✅',
            'accessible': '✅',
            'failed': '❌',
            'error': '❌',
            'stopped': '❌',
            'inaccessible': '❌',
            'partial': '⚠️',
            'pending': '⏳'
        };
        return icons[status] || '❓';
    }

    /**
     * 生成建议
     */
    generateRecommendations() {
        const recommendations = [];
        
        // 检查服务状态
        if (this.validationResults.services.n8n?.status !== 'running') {
            recommendations.push('启动N8N服务: npm run start 或 docker-compose up n8n');
        }
        
        if (this.validationResults.services.newsApi?.status !== 'running') {
            recommendations.push('启动新闻API服务: python -m uvicorn src.api.news_api:app --host 0.0.0.0 --port 3001');
        }
        
        if (this.validationResults.services.firecrawl?.status !== 'accessible') {
            recommendations.push('检查Firecrawl API密钥配置和网络连接');
        }
        
        // 检查工作流状态
        if (!this.validationResults.workflows.main?.exists) {
            recommendations.push('导入或创建火鸟门户新闻数据抓取与发布工作流');
        } else if (!this.validationResults.workflows.main?.active) {
            recommendations.push('激活火鸟门户新闻数据抓取与发布工作流');
        }
        
        // 检查文件
        if (this.validationResults.integration.files) {
            const missingFiles = Object.entries(this.validationResults.integration.files)
                .filter(([_, exists]) => !exists)
                .map(([file, _]) => file);
            
            if (missingFiles.length > 0) {
                recommendations.push(`确保以下文件存在: ${missingFiles.join(', ')}`);
            }
        }
        
        return recommendations;
    }
}

// 主执行函数
async function main() {
    const validator = new HuoNiaoDeploymentValidator();
    await validator.runFullValidation();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

// 导出验证类
module.exports = {
    HuoNiaoDeploymentValidator
};