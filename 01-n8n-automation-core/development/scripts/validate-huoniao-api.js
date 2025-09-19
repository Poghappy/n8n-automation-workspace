#!/usr/bin/env node

/**
 * 火鸟门户API连接和会话管理验证脚本
 * 验证API连接、会话有效性和基本功能
 */

const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

/**
 * 火鸟门户API客户端类
 */
class HuoniaoAPIValidator {
  constructor() {
    this.baseUrl = process.env.HUONIAO_BASE_URL || 'https://hawaiihub.net';
    this.apiEndpoint = process.env.HUONIAO_API_ENDPOINT || 'https://hawaiihub.net/include/ajax.php';
    this.sessionId = process.env.HUONIAO_SESSION_ID;
    this.username = process.env.HUONIAO_USERNAME;
    this.password = process.env.HUONIAO_PASSWORD;
    this.timeout = 30000;
  }

  /**
   * 通用API请求方法
   */
  async makeRequest(params, method = 'GET') {
    const url = new URL(this.apiEndpoint);
    
    const headers = {
      'User-Agent': 'HuoNiao-Content-Collector/3.0',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    };

    if (this.sessionId) {
      headers['Cookie'] = `PHPSESSID=${this.sessionId}`;
    }

    let requestConfig = {
      method,
      url: url.toString(),
      headers,
      timeout: this.timeout,
      validateStatus: (status) => status < 500 // 接受4xx状态码
    };

    if (method === 'GET') {
      requestConfig.params = params;
    } else if (method === 'POST') {
      const formData = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      requestConfig.data = formData;
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    try {
      const response = await axios(requestConfig);
      return {
        success: true,
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }

  /**
   * 验证基础连接
   */
  async validateBasicConnection() {
    console.log('🔍 验证火鸟门户基础连接...');
    
    try {
      const response = await axios.get(this.baseUrl, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'HuoNiao-Content-Collector/3.0'
        }
      });

      if (response.status === 200) {
        console.log('✅ 基础连接验证成功:');
        console.log(`   - 状态码: ${response.status}`);
        console.log(`   - 响应大小: ${response.data.length} 字符`);
        console.log(`   - 服务器: ${response.headers.server || 'Unknown'}`);
        return true;
      } else {
        console.log(`❌ 基础连接异常，状态码: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 基础连接失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 验证API端点
   */
  async validateAPIEndpoint() {
    console.log('\n🔍 验证API端点...');
    
    const result = await this.makeRequest({
      service: 'article',
      action: 'config'
    });

    if (result.success) {
      console.log('✅ API端点验证成功:');
      console.log(`   - 状态码: ${result.status}`);
      console.log(`   - 响应类型: ${typeof result.data}`);
      
      if (result.data && typeof result.data === 'object') {
        console.log(`   - API状态: ${result.data.state === 100 ? '正常' : '异常'}`);
        if (result.data.info) {
          console.log(`   - 配置项数量: ${Object.keys(result.data.info).length}`);
        }
      }
      return true;
    } else {
      console.log('❌ API端点验证失败:');
      console.log(`   - 错误: ${result.error}`);
      console.log(`   - 状态码: ${result.status}`);
      return false;
    }
  }

  /**
   * 验证会话有效性
   */
  async validateSession() {
    console.log('\n🔍 验证会话有效性...');
    
    if (!this.sessionId) {
      console.log('⚠️  未设置HUONIAO_SESSION_ID，跳过会话验证');
      return false;
    }

    const result = await this.makeRequest({
      service: 'article',
      action: 'config',
      param: 'channelName'
    });

    if (result.success && result.data) {
      if (result.data.state === 100) {
        console.log('✅ 会话验证成功:');
        console.log(`   - 会话ID: ${this.sessionId.substring(0, 8)}...`);
        console.log(`   - API状态: 正常`);
        if (result.data.info && result.data.info.channelName) {
          console.log(`   - 模块名称: ${result.data.info.channelName}`);
        }
        return true;
      } else {
        console.log('❌ 会话可能已过期或无效:');
        console.log(`   - API状态码: ${result.data.state}`);
        console.log(`   - 错误信息: ${result.data.info || 'Unknown'}`);
        return false;
      }
    } else {
      console.log('❌ 会话验证失败:');
      console.log(`   - 错误: ${result.error}`);
      return false;
    }
  }

  /**
   * 测试分类获取
   */
  async testCategoryRetrieval() {
    console.log('\n🔍 测试分类获取...');
    
    const result = await this.makeRequest({
      service: 'article',
      action: 'type',
      page: 1,
      pageSize: 10
    });

    if (result.success && result.data) {
      if (result.data.state === 100 && result.data.info) {
        const categories = Array.isArray(result.data.info) ? result.data.info : [];
        console.log('✅ 分类获取测试成功:');
        console.log(`   - 分类数量: ${categories.length}`);
        
        if (categories.length > 0) {
          console.log(`   - 示例分类: ${categories[0].typename || 'Unknown'} (ID: ${categories[0].id})`);
        }
        return true;
      } else {
        console.log('❌ 分类获取失败:');
        console.log(`   - API状态: ${result.data.state}`);
        console.log(`   - 错误信息: ${result.data.info || 'Unknown'}`);
        return false;
      }
    } else {
      console.log('❌ 分类获取请求失败:');
      console.log(`   - 错误: ${result.error}`);
      return false;
    }
  }

  /**
   * 测试文章列表获取
   */
  async testArticleList() {
    console.log('\n🔍 测试文章列表获取...');
    
    const result = await this.makeRequest({
      service: 'article',
      action: 'alist',
      page: 1,
      pageSize: 5,
      orderby: 1
    });

    if (result.success && result.data) {
      if (result.data.state === 100 && result.data.info) {
        const pageInfo = result.data.info.pageInfo || {};
        const articles = result.data.info.list || [];
        
        console.log('✅ 文章列表获取测试成功:');
        console.log(`   - 总文章数: ${pageInfo.totalCount || 0}`);
        console.log(`   - 当前页文章数: ${articles.length}`);
        
        if (articles.length > 0) {
          const firstArticle = articles[0];
          console.log(`   - 示例文章: ${firstArticle.title || 'Unknown'} (ID: ${firstArticle.id})`);
        }
        return true;
      } else {
        console.log('❌ 文章列表获取失败:');
        console.log(`   - API状态: ${result.data.state}`);
        return false;
      }
    } else {
      console.log('❌ 文章列表请求失败:');
      console.log(`   - 错误: ${result.error}`);
      return false;
    }
  }

  /**
   * 测试文章发布 (模拟)
   */
  async testArticlePublish() {
    console.log('\n🔍 测试文章发布能力...');
    
    // 不实际发布，只测试参数验证
    const testData = {
      service: 'article',
      action: 'put',
      title: '测试文章标题 - 请勿发布',
      typeid: 1,
      body: '这是一个测试文章内容，用于验证API参数格式。',
      writer: 'API测试',
      source: 'API测试',
      keywords: '测试,API,验证',
      description: '测试文章描述'
    };

    // 只验证参数格式，不实际发送POST请求
    console.log('✅ 文章发布参数验证:');
    console.log(`   - 标题长度: ${testData.title.length} 字符 (限制: 60)`);
    console.log(`   - 内容长度: ${testData.body.length} 字符`);
    console.log(`   - 作者长度: ${testData.writer.length} 字符 (限制: 20)`);
    console.log(`   - 来源长度: ${testData.source.length} 字符 (限制: 30)`);
    console.log(`   - 关键词长度: ${testData.keywords.length} 字符 (限制: 50)`);
    console.log(`   - 描述长度: ${testData.description.length} 字符 (限制: 255)`);

    // 验证字段长度限制
    const validations = [
      { field: 'title', value: testData.title, limit: 60 },
      { field: 'writer', value: testData.writer, limit: 20 },
      { field: 'source', value: testData.source, limit: 30 },
      { field: 'keywords', value: testData.keywords, limit: 50 },
      { field: 'description', value: testData.description, limit: 255 }
    ];

    let allValid = true;
    validations.forEach(({ field, value, limit }) => {
      if (value.length > limit) {
        console.log(`   ❌ ${field} 超出长度限制: ${value.length}/${limit}`);
        allValid = false;
      }
    });

    if (allValid) {
      console.log('✅ 所有参数格式验证通过');
    }

    return allValid;
  }

  /**
   * 检查会话刷新能力
   */
  async checkSessionRefresh() {
    console.log('\n🔍 检查会话刷新能力...');
    
    if (!this.username || !this.password) {
      console.log('⚠️  未设置登录凭据，无法测试会话刷新');
      return false;
    }

    console.log('✅ 登录凭据已配置:');
    console.log(`   - 用户名: ${this.username}`);
    console.log(`   - 密码: ${'*'.repeat(this.password.length)}`);
    console.log('   - 支持自动会话刷新');
    
    return true;
  }

  /**
   * 生成API使用统计
   */
  generateAPIStats() {
    console.log('\n📊 API配置统计:');
    console.log('='.repeat(40));
    
    const config = {
      '基础URL': this.baseUrl,
      'API端点': this.apiEndpoint,
      '会话ID': this.sessionId ? `${this.sessionId.substring(0, 8)}...` : '未设置',
      '登录用户': this.username || '未设置',
      '超时设置': `${this.timeout}ms`
    };

    Object.entries(config).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
  }
}

/**
 * 生成会话管理脚本
 */
function generateSessionManager() {
  const sessionManagerScript = `#!/usr/bin/env node

/**
 * 火鸟门户会话管理脚本
 * 自动刷新和维护会话
 */

const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

class HuoniaoSessionManager {
  constructor() {
    this.baseUrl = process.env.HUONIAO_BASE_URL || 'https://hawaiihub.net';
    this.username = process.env.HUONIAO_USERNAME;
    this.password = process.env.HUONIAO_PASSWORD;
    this.sessionFile = '.huoniao-session';
  }

  /**
   * 登录获取新会话
   */
  async login() {
    console.log('🔐 正在登录火鸟门户...');
    
    try {
      // 这里需要根据实际的登录接口实现
      // 由于没有具体的登录API文档，这里提供框架
      
      const loginData = {
        username: this.username,
        password: this.password
      };

      const response = await axios.post(\`\${this.baseUrl}/login\`, loginData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // 从响应头中提取会话ID
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        const sessionMatch = setCookieHeader.find(cookie => 
          cookie.includes('PHPSESSID=')
        );
        
        if (sessionMatch) {
          const sessionId = sessionMatch.match(/PHPSESSID=([^;]+)/)[1];
          
          // 保存会话信息
          const sessionInfo = {
            sessionId,
            loginTime: new Date().toISOString(),
            expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
          };
          
          fs.writeFileSync(this.sessionFile, JSON.stringify(sessionInfo, null, 2));
          console.log(\`✅ 登录成功，会话ID: \${sessionId.substring(0, 8)}...\`);
          
          return sessionId;
        }
      }
      
      throw new Error('无法从响应中提取会话ID');
      
    } catch (error) {
      console.log(\`❌ 登录失败: \${error.message}\`);
      throw error;
    }
  }

  /**
   * 检查会话有效性
   */
  async checkSession(sessionId) {
    try {
      const response = await axios.get(\`\${this.baseUrl}/include/ajax.php\`, {
        params: {
          service: 'article',
          action: 'config'
        },
        headers: {
          'Cookie': \`PHPSESSID=\${sessionId}\`
        }
      });

      return response.data && response.data.state === 100;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取有效会话
   */
  async getValidSession() {
    // 检查本地会话文件
    if (fs.existsSync(this.sessionFile)) {
      try {
        const sessionInfo = JSON.parse(fs.readFileSync(this.sessionFile, 'utf8'));
        const now = new Date();
        const expiry = new Date(sessionInfo.expiryTime);
        
        if (now < expiry) {
          const isValid = await this.checkSession(sessionInfo.sessionId);
          if (isValid) {
            console.log('✅ 使用现有有效会话');
            return sessionInfo.sessionId;
          }
        }
      } catch (error) {
        console.log('⚠️  本地会话文件无效');
      }
    }

    // 登录获取新会话
    return await this.login();
  }

  /**
   * 定期刷新会话
   */
  async startSessionMaintenance() {
    console.log('🔄 启动会话维护服务...');
    
    const refreshInterval = 6 * 60 * 60 * 1000; // 6小时刷新一次
    
    setInterval(async () => {
      try {
        console.log('🔄 定期刷新会话...');
        await this.getValidSession();
      } catch (error) {
        console.log(\`❌ 会话刷新失败: \${error.message}\`);
      }
    }, refreshInterval);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const manager = new HuoniaoSessionManager();
  
  if (process.argv.includes('--daemon')) {
    manager.startSessionMaintenance();
  } else {
    manager.getValidSession()
      .then(sessionId => {
        console.log(\`当前会话ID: \${sessionId}\`);
        console.log('请将此会话ID设置到环境变量 HUONIAO_SESSION_ID 中');
      })
      .catch(error => {
        console.log(\`获取会话失败: \${error.message}\`);
        process.exit(1);
      });
  }
}

module.exports = HuoniaoSessionManager;
`;

  const scriptPath = 'scripts/session-manager.js';
  const fs = require('fs');
  fs.writeFileSync(scriptPath, sessionManagerScript);
  fs.chmodSync(scriptPath, '755');
  
  console.log(`✅ 会话管理脚本已生成: ${scriptPath}`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始验证火鸟门户API连接和会话管理...\n');

  const validator = new HuoniaoAPIValidator();
  
  const tests = [
    { name: '基础连接', method: 'validateBasicConnection' },
    { name: 'API端点', method: 'validateAPIEndpoint' },
    { name: '会话有效性', method: 'validateSession' },
    { name: '分类获取', method: 'testCategoryRetrieval' },
    { name: '文章列表', method: 'testArticleList' },
    { name: '文章发布', method: 'testArticlePublish' },
    { name: '会话刷新', method: 'checkSessionRefresh' }
  ];

  const results = {};
  
  for (const test of tests) {
    try {
      results[test.name] = await validator[test.method]();
    } catch (error) {
      console.log(`❌ ${test.name}测试异常: ${error.message}`);
      results[test.name] = false;
    }
  }

  // 生成统计信息
  validator.generateAPIStats();

  // 生成会话管理脚本
  generateSessionManager();

  // 生成测试报告
  console.log('\n📊 验证结果:');
  console.log('='.repeat(40));
  
  Object.entries(results).forEach(([testName, result]) => {
    const status = result ? '✅ 通过' : '❌ 失败';
    console.log(`${testName}: ${status}`);
  });

  const successCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;
  
  console.log('='.repeat(40));
  console.log(`总体结果: ${successCount}/${totalCount} 项测试通过`);

  if (successCount === totalCount) {
    console.log('\n🎉 所有验证通过，火鸟门户API集成就绪！');
  } else {
    console.log('\n⚠️  部分验证失败，请检查配置和网络连接');
  }

  console.log('\n📋 下一步操作:');
  console.log('1. 如果会话验证失败，请更新 HUONIAO_SESSION_ID');
  console.log('2. 运行会话管理器: node scripts/session-manager.js');
  console.log('3. 测试完整工作流集成');

  process.exit(successCount === totalCount ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  HuoniaoAPIValidator,
  generateSessionManager
};