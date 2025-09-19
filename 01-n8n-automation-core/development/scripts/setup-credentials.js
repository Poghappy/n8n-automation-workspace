#!/usr/bin/env node

/**
 * n8n凭据配置脚本
 * 用于自动配置火鸟门户新闻工作流所需的所有凭据
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 凭据配置模板
const credentialsConfig = {
  // 火鸟门户API凭据
  huoniao_api: {
    name: "火鸟门户API凭据",
    type: "httpHeaderAuth",
    data: {
      name: "Cookie",
      value: "PHPSESSID={{$env.HUONIAO_SESSION_ID}}"
    },
    nodesAccess: [
      {
        nodeType: "n8n-nodes-base.httpRequest"
      }
    ]
  },

  // Notion API凭据
  notion_api: {
    name: "Notion API凭据",
    type: "notionApi",
    data: {
      apiKey: "{{$env.NOTION_API_TOKEN}}"
    },
    nodesAccess: [
      {
        nodeType: "n8n-nodes-base.notion"
      }
    ]
  },

  // OpenAI API凭据
  openai_api: {
    name: "OpenAI API凭据",
    type: "openAiApi",
    data: {
      apiKey: "{{$env.OPENAI_API_KEY}}"
    },
    nodesAccess: [
      {
        nodeType: "n8n-nodes-base.openAi"
      }
    ]
  },

  // PostgreSQL数据库凭据 (用于日志记录)
  postgres_logs: {
    name: "PostgreSQL日志数据库",
    type: "postgres",
    data: {
      host: "postgres",
      port: 5432,
      database: "{{$env.POSTGRES_DB}}",
      user: "{{$env.POSTGRES_USER}}",
      password: "{{$env.POSTGRES_PASSWORD}}",
      ssl: "disable"
    },
    nodesAccess: [
      {
        nodeType: "n8n-nodes-base.postgres"
      }
    ]
  },

  // Slack告警凭据 (可选)
  slack_alerts: {
    name: "Slack告警凭据",
    type: "slackApi",
    data: {
      accessToken: "{{$env.SLACK_BOT_TOKEN}}"
    },
    nodesAccess: [
      {
        nodeType: "n8n-nodes-base.slack"
      }
    ]
  },

  // Webhook告警凭据 (可选)
  webhook_alerts: {
    name: "Webhook告警凭据",
    type: "httpHeaderAuth",
    data: {
      name: "Authorization",
      value: "Bearer {{$env.WEBHOOK_AUTH_TOKEN}}"
    },
    nodesAccess: [
      {
        nodeType: "n8n-nodes-base.webhook"
      }
    ]
  }
};

/**
 * 生成n8n凭据配置文件
 */
function generateCredentialsConfig() {
  const configDir = path.join(__dirname, '..', 'n8n-config');
  const credentialsDir = path.join(configDir, 'credentials');

  // 创建配置目录
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  if (!fs.existsSync(credentialsDir)) {
    fs.mkdirSync(credentialsDir, { recursive: true });
  }

  // 生成每个凭据的配置文件
  Object.entries(credentialsConfig).forEach(([key, config]) => {
    const credentialFile = path.join(credentialsDir, `${key}.json`);

    const credentialData = {
      id: crypto.randomUUID(),
      name: config.name,
      type: config.type,
      data: config.data,
      nodesAccess: config.nodesAccess || []
    };

    fs.writeFileSync(credentialFile, JSON.stringify(credentialData, null, 2));
    console.log(`✅ 生成凭据配置: ${config.name} -> ${credentialFile}`);
  });

  // 生成凭据导入脚本
  generateImportScript(credentialsDir);
}

/**
 * 生成凭据导入脚本
 */
function generateImportScript(credentialsDir) {
  const importScript = `#!/bin/bash

# n8n凭据导入脚本
# 使用此脚本将凭据配置导入到n8n实例中

echo "🚀 开始导入n8n凭据配置..."

# 检查n8n是否运行
if ! docker ps | grep -q "n8n-main"; then
    echo "❌ n8n容器未运行，请先启动n8n服务"
    exit 1
fi

# 导入凭据配置
CREDENTIALS_DIR="${credentialsDir}"

for credential_file in "$CREDENTIALS_DIR"/*.json; do
    if [ -f "$credential_file" ]; then
        credential_name=$(basename "$credential_file" .json)
        echo "📥 导入凭据: $credential_name"
        
        # 使用n8n CLI导入凭据 (需要根据实际n8n版本调整)
        docker exec n8n-main n8n import:credentials --input="$credential_file" || {
            echo "⚠️  凭据导入失败: $credential_name"
        }
    fi
done

echo "✅ 凭据导入完成"
echo ""
echo "📋 下一步操作:"
echo "1. 登录n8n管理界面: http://localhost:5678"
echo "2. 检查凭据配置是否正确"
echo "3. 测试各个API连接"
echo "4. 导入工作流文件"
`;

  const scriptPath = path.join(__dirname, '..', 'scripts', 'import-credentials.sh');
  fs.writeFileSync(scriptPath, importScript);
  fs.chmodSync(scriptPath, '755');

  console.log(`✅ 生成导入脚本: ${scriptPath}`);
}

/**
 * 验证环境变量配置
 */
function validateEnvironment() {
  const requiredVars = [
    'HUONIAO_SESSION_ID',
    'NOTION_API_TOKEN',
    'NOTION_DATABASE_ID',
    'OPENAI_API_KEY'
  ];

  const missingVars = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.log('⚠️  缺少必需的环境变量:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('');
    console.log('请检查 .env 文件配置');
    return false;
  }

  console.log('✅ 环境变量验证通过');
  return true;
}

/**
 * 生成凭据测试脚本
 */
function generateTestScript() {
  const testScript = `#!/usr/bin/env node

/**
 * 凭据连接测试脚本
 */

const axios = require('axios');
require('dotenv').config();

async function testHuoniaoAPI() {
  console.log('🧪 测试火鸟门户API连接...');
  
  try {
    const response = await axios.get(process.env.HUONIAO_API_ENDPOINT, {
      params: {
        service: 'article',
        action: 'config'
      },
      headers: {
        'Cookie': \`PHPSESSID=\${process.env.HUONIAO_SESSION_ID}\`,
        'User-Agent': 'n8n-automation/1.0'
      },
      timeout: 10000
    });

    if (response.data && response.data.state === 100) {
      console.log('✅ 火鸟门户API连接成功');
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

async function testNotionAPI() {
  console.log('🧪 测试Notion API连接...');
  
  try {
    const response = await axios.get(\`https://api.notion.com/v1/databases/\${process.env.NOTION_DATABASE_ID}\`, {
      headers: {
        'Authorization': \`Bearer \${process.env.NOTION_API_TOKEN}\`,
        'Notion-Version': process.env.NOTION_VERSION || '2022-06-28'
      },
      timeout: 10000
    });

    if (response.data && response.data.id) {
      console.log('✅ Notion API连接成功');
      console.log(\`   数据库标题: \${response.data.title?.[0]?.plain_text || 'Unknown'}\`);
      return true;
    } else {
      console.log('❌ Notion API响应异常:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Notion API连接失败:', error.message);
    return false;
  }
}

async function testOpenAIAPI() {
  console.log('🧪 测试OpenAI API连接...');
  
  try {
    const response = await axios.post(\`\${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/chat/completions\`, {
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a connection test.'
        }
      ],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    if (response.data && response.data.choices) {
      console.log('✅ OpenAI API连接成功');
      return true;
    } else {
      console.log('❌ OpenAI API响应异常:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ OpenAI API连接失败:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 开始API连接测试...\\n');
  
  const results = await Promise.allSettled([
    testHuoniaoAPI(),
    testNotionAPI(), 
    testOpenAIAPI()
  ]);

  const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
  const totalCount = results.length;

  console.log(\`\\n📊 测试结果: \${successCount}/\${totalCount} 个API连接成功\`);
  
  if (successCount === totalCount) {
    console.log('🎉 所有API连接测试通过，可以开始使用工作流！');
    process.exit(0);
  } else {
    console.log('⚠️  部分API连接失败，请检查配置');
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = {
  testHuoniaoAPI,
  testNotionAPI,
  testOpenAIAPI
};
`;

  const testScriptPath = path.join(__dirname, '..', 'scripts', 'test-credentials.js');
  fs.writeFileSync(testScriptPath, testScript);
  fs.chmodSync(testScriptPath, '755');

  console.log(`✅ 生成测试脚本: ${testScriptPath}`);
}

// 主函数
function main() {
  console.log('🚀 开始配置n8n凭据系统...\n');

  // 验证环境变量
  if (!validateEnvironment()) {
    process.exit(1);
  }

  // 生成凭据配置
  generateCredentialsConfig();

  // 生成测试脚本
  generateTestScript();

  console.log('\n✅ n8n凭据系统配置完成！');
  console.log('\n📋 下一步操作:');
  console.log('1. 运行测试脚本: node scripts/test-credentials.js');
  console.log('2. 启动n8n服务: docker-compose -f docker-compose-n8n.yml up -d');
  console.log('3. 导入凭据配置: ./scripts/import-credentials.sh');
  console.log('4. 访问n8n管理界面: http://localhost:5678');
}

if (require.main === module) {
  main();
}

module.exports = {
  generateCredentialsConfig,
  validateEnvironment,
  credentialsConfig
};