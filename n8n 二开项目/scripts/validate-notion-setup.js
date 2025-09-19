#!/usr/bin/env node

/**
 * Notion设置验证脚本
 * 验证所有Notion集成组件是否正确配置
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * 验证环境变量
 */
function validateEnvironmentVariables() {
  console.log('🔍 验证环境变量配置...');
  
  const requiredEnvVars = {
    'NOTION_API_TOKEN': process.env.NOTION_API_TOKEN,
    'NOTION_DATABASE_ID': process.env.NOTION_DATABASE_ID,
    'NOTION_VERSION': process.env.NOTION_VERSION
  };
  
  const results = {};
  let allValid = true;
  
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    const isValid = value && value.trim() !== '';
    results[key] = {
      configured: isValid,
      value: isValid ? '✅ 已配置' : '❌ 未配置'
    };
    
    if (!isValid) {
      allValid = false;
    }
    
    console.log(`   ${key}: ${results[key].value}`);
  });
  
  return { valid: allValid, results };
}

/**
 * 验证配置文件
 */
function validateConfigurationFiles() {
  console.log('\n🔍 验证配置文件...');
  
  const configFiles = [
    'n8n-config/notion-config.json',
    'n8n-config/credentials/notion_api.json',
    'n8n-config/workflows/notion-integration-workflow.json'
  ];
  
  const results = {};
  let allValid = true;
  
  configFiles.forEach(filePath => {
    const exists = fs.existsSync(filePath);
    results[filePath] = {
      exists,
      status: exists ? '✅ 存在' : '❌ 不存在'
    };
    
    if (exists) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);
        results[filePath].valid_json = true;
        results[filePath].size = content.length;
        console.log(`   ${filePath}: ${results[filePath].status} (${results[filePath].size} bytes)`);
      } catch (error) {
        results[filePath].valid_json = false;
        results[filePath].error = error.message;
        console.log(`   ${filePath}: ❌ JSON格式错误 - ${error.message}`);
        allValid = false;
      }
    } else {
      console.log(`   ${filePath}: ${results[filePath].status}`);
      allValid = false;
    }
  });
  
  return { valid: allValid, results };
}

/**
 * 验证脚本文件
 */
function validateScriptFiles() {
  console.log('\n🔍 验证脚本文件...');
  
  const scriptFiles = [
    'scripts/setup-notion.js',
    'scripts/verify-notion-database.js',
    'scripts/test-notion-integration.js'
  ];
  
  const results = {};
  let allValid = true;
  
  scriptFiles.forEach(filePath => {
    const exists = fs.existsSync(filePath);
    results[filePath] = {
      exists,
      status: exists ? '✅ 存在' : '❌ 不存在'
    };
    
    if (exists) {
      const stats = fs.statSync(filePath);
      results[filePath].size = stats.size;
      results[filePath].executable = (stats.mode & parseInt('111', 8)) !== 0;
      console.log(`   ${filePath}: ${results[filePath].status} (${results[filePath].size} bytes)`);
    } else {
      console.log(`   ${filePath}: ${results[filePath].status}`);
      allValid = false;
    }
  });
  
  return { valid: allValid, results };
}

/**
 * 验证日志文件
 */
function validateLogFiles() {
  console.log('\n🔍 验证日志文件...');
  
  const logFiles = [
    'logs/notion-database-structure-report.json',
    'logs/notion-integration-test-report.json'
  ];
  
  const results = {};
  let allValid = true;
  
  logFiles.forEach(filePath => {
    const exists = fs.existsSync(filePath);
    results[filePath] = {
      exists,
      status: exists ? '✅ 存在' : '⚠️  不存在'
    };
    
    if (exists) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);
        results[filePath].valid_json = true;
        results[filePath].size = content.length;
        results[filePath].created = fs.statSync(filePath).mtime.toISOString();
        console.log(`   ${filePath}: ${results[filePath].status} (${results[filePath].size} bytes, ${results[filePath].created})`);
      } catch (error) {
        results[filePath].valid_json = false;
        results[filePath].error = error.message;
        console.log(`   ${filePath}: ❌ JSON格式错误 - ${error.message}`);
      }
    } else {
      console.log(`   ${filePath}: ${results[filePath].status} (可通过运行相应脚本生成)`);
    }
  });
  
  return { valid: allValid, results };
}

/**
 * 验证Notion配置内容
 */
function validateNotionConfiguration() {
  console.log('\n🔍 验证Notion配置内容...');
  
  const results = {};
  let allValid = true;
  
  try {
    // 验证主配置文件
    const configPath = 'n8n-config/notion-config.json';
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      results.main_config = {
        database_id_match: config.notion?.databaseId === process.env.NOTION_DATABASE_ID,
        has_n8n_config: !!config.n8nNodeConfig,
        database_title: config.notion?.databaseTitle,
        api_version: config.notion?.apiVersion
      };
      
      console.log(`   数据库ID匹配: ${results.main_config.database_id_match ? '✅' : '❌'}`);
      console.log(`   n8n节点配置: ${results.main_config.has_n8n_config ? '✅' : '❌'}`);
      console.log(`   数据库标题: ${results.main_config.database_title || '❌ 未设置'}`);
      console.log(`   API版本: ${results.main_config.api_version || '❌ 未设置'}`);
      
      if (!results.main_config.database_id_match || !results.main_config.has_n8n_config) {
        allValid = false;
      }
    } else {
      results.main_config = { exists: false };
      console.log('   ❌ 主配置文件不存在');
      allValid = false;
    }
    
    // 验证凭据配置
    const credentialsPath = 'n8n-config/credentials/notion_api.json';
    if (fs.existsSync(credentialsPath)) {
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      results.credentials_config = {
        has_api_key: !!credentials.data?.apiKey,
        uses_env_var: credentials.data?.apiKey === '{{$env.NOTION_API_TOKEN}}',
        node_access: Array.isArray(credentials.nodesAccess) && credentials.nodesAccess.length > 0
      };
      
      console.log(`   API密钥配置: ${results.credentials_config.has_api_key ? '✅' : '❌'}`);
      console.log(`   使用环境变量: ${results.credentials_config.uses_env_var ? '✅' : '❌'}`);
      console.log(`   节点访问权限: ${results.credentials_config.node_access ? '✅' : '❌'}`);
      
      if (!results.credentials_config.has_api_key || !results.credentials_config.uses_env_var) {
        allValid = false;
      }
    } else {
      results.credentials_config = { exists: false };
      console.log('   ❌ 凭据配置文件不存在');
      allValid = false;
    }
    
    // 验证工作流配置
    const workflowPath = 'n8n-config/workflows/notion-integration-workflow.json';
    if (fs.existsSync(workflowPath)) {
      const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
      
      results.workflow_config = {
        has_nodes: Array.isArray(workflow.nodes) && workflow.nodes.length > 0,
        has_connections: !!workflow.connections,
        notion_node_count: workflow.nodes?.filter(node => node.type === 'n8n-nodes-base.notion').length || 0,
        total_nodes: workflow.nodes?.length || 0
      };
      
      console.log(`   工作流节点: ${results.workflow_config.total_nodes} 个`);
      console.log(`   Notion节点: ${results.workflow_config.notion_node_count} 个`);
      console.log(`   节点连接: ${results.workflow_config.has_connections ? '✅' : '❌'}`);
      
      if (results.workflow_config.notion_node_count === 0 || !results.workflow_config.has_connections) {
        allValid = false;
      }
    } else {
      results.workflow_config = { exists: false };
      console.log('   ❌ 工作流配置文件不存在');
      allValid = false;
    }
    
  } catch (error) {
    console.log(`   ❌ 配置验证失败: ${error.message}`);
    results.error = error.message;
    allValid = false;
  }
  
  return { valid: allValid, results };
}

/**
 * 生成验证报告
 */
function generateValidationReport(validationResults) {
  const report = {
    validation_info: {
      timestamp: new Date().toISOString(),
      validator_version: '1.0.0'
    },
    validation_results: validationResults,
    summary: {
      total_checks: 0,
      passed_checks: 0,
      failed_checks: 0,
      overall_status: 'unknown'
    },
    recommendations: []
  };
  
  // 计算总体状态
  const allResults = Object.values(validationResults);
  report.summary.total_checks = allResults.length;
  report.summary.passed_checks = allResults.filter(result => result.valid).length;
  report.summary.failed_checks = allResults.filter(result => !result.valid).length;
  
  if (report.summary.failed_checks === 0) {
    report.summary.overall_status = 'passed';
  } else if (report.summary.passed_checks > report.summary.failed_checks) {
    report.summary.overall_status = 'partial';
  } else {
    report.summary.overall_status = 'failed';
  }
  
  // 生成建议
  if (!validationResults.environment.valid) {
    report.recommendations.push('请检查并配置所有必需的环境变量');
  }
  
  if (!validationResults.config_files.valid) {
    report.recommendations.push('请运行 setup-notion.js 脚本生成缺失的配置文件');
  }
  
  if (!validationResults.script_files.valid) {
    report.recommendations.push('请确保所有Notion相关脚本文件存在');
  }
  
  if (!validationResults.notion_config.valid) {
    report.recommendations.push('请检查Notion配置文件的内容是否正确');
  }
  
  return report;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始验证Notion设置...\n');
  
  const validationResults = {};
  
  try {
    // 1. 验证环境变量
    validationResults.environment = validateEnvironmentVariables();
    
    // 2. 验证配置文件
    validationResults.config_files = validateConfigurationFiles();
    
    // 3. 验证脚本文件
    validationResults.script_files = validateScriptFiles();
    
    // 4. 验证日志文件
    validationResults.log_files = validateLogFiles();
    
    // 5. 验证Notion配置内容
    validationResults.notion_config = validateNotionConfiguration();
    
    // 6. 生成验证报告
    const report = generateValidationReport(validationResults);
    
    // 保存验证报告
    const reportPath = 'logs/notion-setup-validation-report.json';
    const logDir = path.dirname(reportPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 验证报告已保存到: ${reportPath}`);
    
    // 输出验证结果
    console.log('\n📋 验证结果汇总:');
    console.log(`   总检查项: ${report.summary.total_checks}`);
    console.log(`   通过检查: ${report.summary.passed_checks}`);
    console.log(`   失败检查: ${report.summary.failed_checks}`);
    console.log(`   整体状态: ${report.summary.overall_status}`);
    
    // 输出建议
    if (report.recommendations.length > 0) {
      console.log('\n💡 改进建议:');
      report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    // 最终状态
    if (report.summary.overall_status === 'passed') {
      console.log('\n🎉 Notion设置验证通过！所有组件配置正确');
      console.log('\n📋 下一步操作:');
      console.log('1. 在n8n中导入工作流配置');
      console.log('2. 测试完整的新闻采集工作流');
      console.log('3. 监控工作流执行状态');
    } else if (report.summary.overall_status === 'partial') {
      console.log('\n⚠️  Notion设置部分通过，请根据建议进行调整');
    } else {
      console.log('\n❌ Notion设置验证失败，请检查配置');
      process.exit(1);
    }
    
  } catch (error) {
    console.log('\n❌ 验证过程失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateEnvironmentVariables,
  validateConfigurationFiles,
  validateScriptFiles,
  validateLogFiles,
  validateNotionConfiguration,
  generateValidationReport
};