#!/usr/bin/env node

/**
 * 凭据连接测试脚本
 * 测试所有API连接和凭据配置
 */

const axios = require('axios');
require('dotenv').config();

/**
 * 测试火鸟门户API连接
 */
async function testHuoniaoAPI() {
  console.log('🧪 测试火鸟门户API连接...');
  
  try {
    const response = await axios.get(process.env.HUONIAO_API_ENDPOINT || 'https://hawaiihub.net/include/ajax.php', {
      params: {
        service: 'article',
        action: 'config'
      },
      headers: {
        'Cookie': process.env.HUONIAO_FULL_COOKIES || `PHPSESSID=${process.env.HUONIAO_SESSION_ID}`,
        'User-Agent': 'n8n-automation/1.0'
      },
      timeout: 10000
    });

    if (response.data && response.data.state === 100) {
      console.log('✅ 火鸟门户API连接成功');
      console.log(`   - API状态: 正常`);
      console.log(`   - 会话有效: 是`);
      if (response.data.info && response.data.info.channelName) {
        console.log(`   - 模块名称: ${response.data.info.channelName}`);
      }
      return true;
    } else {
      console.log('❌ 火鸟门户API响应异常:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ 火鸟门户API连接失败:', error.message);
    return false;
  }
}

/**
 * 测试Notion API连接
 */
async function testNotionAPI() {
  console.log('🧪 测试Notion API连接...');
  
  if (!process.env.NOTION_API_TOKEN) {
    console.log('⚠️  NOTION_API_TOKEN未设置');
    return false;
  }

  if (!process.env.NOTION_DATABASE_ID) {
    console.log('⚠️  NOTION_DATABASE_ID未设置');
    return false;
  }
  
  try {
    const response = await axios.get(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_TOKEN}`,
        'Notion-Version': process.env.NOTION_VERSION || '2022-06-28'
      },
      timeout: 10000
    });

    if (response.data && response.data.id) {
      console.log('✅ Notion API连接成功');
      console.log(`   - 数据库ID: ${response.data.id}`);
      console.log(`   - 数据库标题: ${response.data.title?.[0]?.plain_text || 'Unknown'}`);
      console.log(`   - 属性数量: ${Object.keys(response.data.properties || {}).length}`);
      return true;
    } else {
      console.log('❌ Notion API响应异常:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Notion API连接失败:', error.message);
    if (error.response?.status === 404) {
      console.log('   提示: 请检查数据库ID是否正确，或确认集成已添加到数据库');
    } else if (error.response?.status === 401) {
      console.log('   提示: 请检查API令牌是否正确');
    }
    return false;
  }
}

/**
 * 测试OpenAI API连接
 */
async function testOpenAIAPI() {
  console.log('🧪 测试OpenAI API连接...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  OPENAI_API_KEY未设置');
    return false;
  }
  
  try {
    const response = await axios.post(`${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/chat/completions`, {
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a connection test. Please respond with "Connection successful".'
        }
      ],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    if (response.data && response.data.choices) {
      console.log('✅ OpenAI API连接成功');
      console.log(`   - 模型: ${response.data.model}`);
      console.log(`   - 响应: ${response.data.choices[0]?.message?.content?.trim() || 'OK'}`);
      return true;
    } else {
      console.log('❌ OpenAI API响应异常:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ OpenAI API连接失败:', error.message);
    if (error.response?.status === 401) {
      console.log('   提示: 请检查API密钥是否正确');
    } else if (error.response?.status === 429) {
      console.log('   提示: API调用频率限制，请稍后重试');
    }
    return false;
  }
}

/**
 * 测试火鸟门户文章发布功能
 */
async function testHuoniaoPublish() {
  console.log('🧪 测试火鸟门户发布功能...');
  
  // 只测试参数验证，不实际发布
  const testData = {
    service: 'article',
    action: 'put',
    title: '测试文章标题 - API连接测试',
    typeid: 1,
    body: '这是一个API连接测试文章，用于验证发布接口的参数格式和权限。请勿实际发布。',
    writer: 'API测试',
    source: 'API测试',
    keywords: '测试,API,连接',
    description: '测试文章描述'
  };

  // 验证参数格式
  const validations = [
    { field: 'title', value: testData.title, limit: 60 },
    { field: 'writer', value: testData.writer, limit: 20 },
    { field: 'source', value: testData.source, limit: 30 },
    { field: 'keywords', value: testData.keywords, limit: 50 },
    { field: 'description', value: testData.description, limit: 255 }
  ];

  let allValid = true;
  console.log('✅ 发布参数验证:');
  
  validations.forEach(({ field, value, limit }) => {
    const status = value.length <= limit ? '✅' : '❌';
    console.log(`   - ${field}: ${value.length}/${limit} 字符 ${status}`);
    if (value.length > limit) {
      allValid = false;
    }
  });

  if (allValid) {
    console.log('✅ 所有发布参数格式验证通过');
  } else {
    console.log('❌ 部分参数超出长度限制');
  }

  return allValid;
}

/**
 * 测试环境变量配置
 */
function testEnvironmentConfig() {
  console.log('🧪 测试环境变量配置...');
  
  const requiredVars = [
    'HUONIAO_SESSION_ID',
    'NOTION_API_TOKEN',
    'NOTION_DATABASE_ID', 
    'OPENAI_API_KEY'
  ];

  const optionalVars = [
    'HUONIAO_BASE_URL',
    'HUONIAO_API_ENDPOINT',
    'NOTION_VERSION',
    'OPENAI_BASE_URL',
    'OPENAI_MODEL'
  ];

  let allRequired = true;
  
  console.log('✅ 必需环境变量:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value ? (value.length > 20 ? `${value.substring(0, 20)}...` : value) : '未设置';
    console.log(`   - ${varName}: ${displayValue} ${status}`);
    if (!value) {
      allRequired = false;
    }
  });

  console.log('📋 可选环境变量:');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '⚪';
    const displayValue = value || '使用默认值';
    console.log(`   - ${varName}: ${displayValue} ${status}`);
  });

  return allRequired;
}

/**
 * 生成测试报告
 */
function generateTestReport(results) {
  const timestamp = new Date().toISOString();
  const successCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;
  
  const report = {
    timestamp,
    summary: {
      total: totalCount,
      success: successCount,
      failed: totalCount - successCount,
      successRate: `${Math.round((successCount / totalCount) * 100)}%`
    },
    results,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      huoniaoEndpoint: process.env.HUONIAO_API_ENDPOINT || 'https://hawaiihub.net/include/ajax.php',
      notionDatabase: process.env.NOTION_DATABASE_ID || 'Not configured',
      openaiModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    }
  };

  // 保存报告到文件
  const fs = require('fs');
  const reportPath = 'logs/api-test-report.json';
  
  // 确保目录存在
  const logDir = require('path').dirname(reportPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 详细测试报告已保存到: ${reportPath}`);

  return report;
}

/**
 * 主函数
 */
async function runTests() {
  console.log('🚀 开始API连接测试...\n');
  
  const tests = [
    { name: '环境变量配置', func: testEnvironmentConfig },
    { name: '火鸟门户API', func: testHuoniaoAPI },
    { name: 'Notion API', func: testNotionAPI },
    { name: 'OpenAI API', func: testOpenAIAPI },
    { name: '火鸟门户发布', func: testHuoniaoPublish }
  ];

  const results = {};
  
  for (const test of tests) {
    try {
      results[test.name] = await test.func();
      console.log(''); // 添加空行分隔
    } catch (error) {
      console.log(`❌ ${test.name}测试异常: ${error.message}\n`);
      results[test.name] = false;
    }
  }

  // 生成测试报告
  const report = generateTestReport(results);
  
  console.log('📊 测试结果汇总:');
  console.log('='.repeat(50));
  
  Object.entries(results).forEach(([testName, result]) => {
    const status = result ? '✅ 通过' : '❌ 失败';
    console.log(`${testName}: ${status}`);
  });
  
  console.log('='.repeat(50));
  console.log(`总体结果: ${report.summary.success}/${report.summary.total} 项测试通过 (${report.summary.successRate})`);
  
  if (report.summary.success === report.summary.total) {
    console.log('\n🎉 所有API连接测试通过！');
    console.log('\n📋 下一步操作:');
    console.log('1. 启动n8n服务: ./start.sh');
    console.log('2. 访问n8n管理界面: http://localhost:5678');
    console.log('3. 导入工作流文件: 火鸟门户_新闻采集工作流_增强版.json');
    console.log('4. 配置凭据并测试工作流');
    process.exit(0);
  } else {
    console.log('\n⚠️  部分API连接测试失败，请检查配置');
    console.log('\n🔧 故障排除建议:');
    
    Object.entries(results).forEach(([testName, result]) => {
      if (!result) {
        console.log(`- ${testName}: 检查相关配置和网络连接`);
      }
    });
    
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = {
  testHuoniaoAPI,
  testNotionAPI,
  testOpenAIAPI,
  testHuoniaoPublish,
  testEnvironmentConfig
};