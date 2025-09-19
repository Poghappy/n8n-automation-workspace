#!/usr/bin/env node

/**
 * 火鸟门户Cookie配置脚本
 * 解析和配置火鸟门户的完整Cookie信息
 */

const fs = require('fs');

// 从用户提供的Cookie数据中提取
const cookieData = [
  {
    "domain": "hawaiihub.net",
    "name": "HN_admin_auth",
    "value": "VXp4U0tGTTFCMlVPUDFNMEFqQURNUWN4VlRGVGFBZG1VRDVTYWxZeFYyTUhhVkUxVm0wRU1nVXpCbVJTWlFGbFVXUlVOUVJqQUdZR1oxQTlBbUlBTUZOcFVtcFRhd2MrRGpoVE1nSmtBellITmxWbFUySUhNVkJrVW01V05GZG1CMjQ9"
  },
  {
    "domain": "hawaiihub.net", 
    "name": "HN_admin_userType",
    "value": "0"
  },
  {
    "domain": "hawaiihub.net",
    "name": "HN_cfg_timezone", 
    "value": "PRC"
  },
  {
    "domain": "hawaiihub.net",
    "name": "HN_cr",
    "value": "NDU1MjQ0NDk0fHxSR0p3VVROR2NVVlVjbU5QYTJkbFNFSk1SbGhxVVdGR1dHVTVVbmxCUjBwQ2NqRlNkbmRMWVZVclRVNHpSbFEyVml0b1dEZEJVMkZZWW1SU2JGWlRkbFkzU2xocGQyRXdWemN4VVhReFpTdFdOMHBXZFZFelExVk1jR0Z6Umt4TFJIVmpTSFZSVkRSV0swRkhkbXd5TDFWaVJVSjJRV0pUVldWWlEyb3hUMVpFWW1oVmVFWmxTRlkzYzBWMVZqTkZWV1Z3VldwR1ptSldLMWxIZEVaMlJWVlBNVmhuUm1acFZtVlJUbmhzUkhCWGRWSlROMEUyWjBJclFVVTNSbVY1UW5WT1pHY3hTRlZCWlZsSGVteEhjMEYxV2xSdFFUTlZWa3hvV0cxR1prVkNUMEprTWpGSGRWWlBTbGd5TVdVM3x8MTc1NTkzMzE0Mw%3D%3D"
  },
  {
    "domain": "hawaiihub.net",
    "name": "HN_currency",
    "value": "eyJuYW1lIjoiXHU0ZWJhXHU2YzExXHU1ZTAxIiwic2hvcnQiOiJcdTUxNDMiLCJzeW1ib2wiOiJcdTAwYTUiLCJjb2RlIjoiUk1CIiwicmF0ZSI6IjEiLCJhcmVhbmFtZSI6Ilx1NWU3M1x1NjViOVx1N2M3MyIsImFyZWFzeW1ib2wiOiJcdTMzYTEifQ%3D%3D"
  },
  {
    "domain": "hawaiihub.net",
    "name": "HN_lang",
    "value": "zh-CN"
  },
  {
    "domain": "hawaiihub.net",
    "name": "PHPSESSID",
    "value": "ej7btpq2vlsjedtpka1r2mto30"
  }
];

/**
 * 生成完整的Cookie字符串
 */
function generateCookieString() {
  return cookieData.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
}

/**
 * 更新环境变量文件
 */
function updateEnvironmentFile() {
  console.log('🍪 配置火鸟门户Cookie信息...');
  
  const cookieString = generateCookieString();
  
  // 读取现有的.env文件
  let envContent = fs.readFileSync('.env', 'utf8');
  
  // 添加完整的Cookie配置
  const cookieConfig = `
# ===========================================
# 火鸟门户完整Cookie配置 (自动生成)
# ===========================================
# 完整Cookie字符串 (包含所有认证信息)
HUONIAO_FULL_COOKIES="${cookieString}"

# 管理员认证Cookie
HUONIAO_ADMIN_AUTH="${cookieData.find(c => c.name === 'HN_admin_auth').value}"

# 用户类型
HUONIAO_USER_TYPE="${cookieData.find(c => c.name === 'HN_admin_userType').value}"

# 时区配置
HUONIAO_TIMEZONE="${cookieData.find(c => c.name === 'HN_cfg_timezone').value}"

# 语言配置
HUONIAO_LANG="${cookieData.find(c => c.name === 'HN_lang').value}"
`;

  // 如果还没有Cookie配置，则添加
  if (!envContent.includes('HUONIAO_FULL_COOKIES')) {
    envContent += cookieConfig;
    fs.writeFileSync('.env', envContent);
    console.log('✅ Cookie配置已添加到.env文件');
  } else {
    console.log('✅ Cookie配置已存在');
  }
}

/**
 * 生成增强的HTTP请求配置
 */
function generateEnhancedRequestConfig() {
  const config = {
    huoniao_enhanced_headers: {
      'Cookie': generateCookieString(),
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Referer': 'https://hawaiihub.net/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin'
    },
    session_info: {
      sessionId: cookieData.find(c => c.name === 'PHPSESSID').value,
      adminAuth: cookieData.find(c => c.name === 'HN_admin_auth').value,
      userType: cookieData.find(c => c.name === 'HN_admin_userType').value,
      timezone: cookieData.find(c => c.name === 'HN_cfg_timezone').value,
      language: cookieData.find(c => c.name === 'HN_lang').value
    }
  };

  // 保存配置到文件
  const configPath = 'n8n-config/huoniao-request-config.json';
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ 增强请求配置已保存到: ${configPath}`);

  return config;
}

/**
 * 验证Cookie有效性
 */
async function validateCookies() {
  console.log('🔍 验证Cookie有效性...');
  
  const axios = require('axios');
  const cookieString = generateCookieString();
  
  try {
    const response = await axios.get('https://hawaiihub.net/include/ajax.php', {
      params: {
        service: 'article',
        action: 'config'
      },
      headers: {
        'Cookie': cookieString,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    if (response.data && response.data.state === 100) {
      console.log('✅ Cookie验证成功');
      console.log(`   - 会话状态: 有效`);
      console.log(`   - 用户类型: 管理员`);
      console.log(`   - 时区: ${cookieData.find(c => c.name === 'HN_cfg_timezone').value}`);
      return true;
    } else {
      console.log('⚠️  Cookie可能已过期或权限不足');
      console.log(`   - API状态: ${response.data?.state || 'Unknown'}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Cookie验证失败:', error.message);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始配置火鸟门户Cookie信息...\n');

  // 1. 更新环境变量文件
  updateEnvironmentFile();

  // 2. 生成增强请求配置
  generateEnhancedRequestConfig();

  // 3. 验证Cookie有效性
  const isValid = await validateCookies();

  console.log('\n📊 Cookie配置完成');
  console.log('='.repeat(40));
  console.log(`Cookie数量: ${cookieData.length}`);
  console.log(`会话ID: ${cookieData.find(c => c.name === 'PHPSESSID').value}`);
  console.log(`验证状态: ${isValid ? '✅ 有效' : '❌ 无效'}`);

  if (isValid) {
    console.log('\n🎉 火鸟门户Cookie配置成功！');
    console.log('\n📋 下一步操作:');
    console.log('1. 运行完整的API测试: npm test');
    console.log('2. 启动n8n服务: ./start.sh');
    console.log('3. 导入工作流和凭据配置');
  } else {
    console.log('\n⚠️  Cookie验证失败，请检查:');
    console.log('1. Cookie是否已过期');
    console.log('2. 网络连接是否正常');
    console.log('3. 火鸟门户服务是否可用');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Cookie配置失败:', error.message);
    process.exit(1);
  });
}

module.exports = {
  cookieData,
  generateCookieString,
  updateEnvironmentFile,
  generateEnhancedRequestConfig,
  validateCookies
};