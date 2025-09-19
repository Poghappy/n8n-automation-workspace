#!/usr/bin/env node

/**
 * 工作流文件和依赖模块验证脚本
 * 验证现有的火鸟门户新闻采集工作流和相关模块
 */

const fs = require('fs');
const path = require('path');

/**
 * 验证工作流文件
 */
function validateWorkflowFile() {
  console.log('🔍 验证现有工作流文件...');
  
  const workflowFile = '火鸟门户_新闻采集工作流_增强版.json';
  
  if (!fs.existsSync(workflowFile)) {
    console.log(`❌ 工作流文件不存在: ${workflowFile}`);
    return false;
  }

  try {
    const workflowContent = fs.readFileSync(workflowFile, 'utf8');
    const workflow = JSON.parse(workflowContent);
    
    // 验证工作流基本结构
    const requiredFields = ['name', 'nodes', 'connections'];
    const missingFields = requiredFields.filter(field => !workflow[field]);
    
    if (missingFields.length > 0) {
      console.log(`❌ 工作流文件缺少必需字段: ${missingFields.join(', ')}`);
      return false;
    }

    // 验证节点数量和类型
    const nodes = workflow.nodes || [];
    const nodeTypes = nodes.map(node => node.type);
    const uniqueNodeTypes = [...new Set(nodeTypes)];
    
    console.log(`✅ 工作流文件验证通过:`);
    console.log(`   - 文件名: ${workflowFile}`);
    console.log(`   - 工作流名称: ${workflow.name}`);
    console.log(`   - 节点数量: ${nodes.length}`);
    console.log(`   - 节点类型: ${uniqueNodeTypes.length} 种`);
    console.log(`   - 版本: ${workflow.versionId || 'unknown'}`);
    
    // 检查关键节点
    const criticalNodes = [
      'n8n-nodes-base.webhook',
      'n8n-nodes-base.function', 
      'n8n-nodes-base.httpRequest',
      'n8n-nodes-base.if'
    ];
    
    const missingCriticalNodes = criticalNodes.filter(nodeType => 
      !nodeTypes.includes(nodeType)
    );
    
    if (missingCriticalNodes.length > 0) {
      console.log(`⚠️  缺少关键节点类型: ${missingCriticalNodes.join(', ')}`);
    }

    return true;
    
  } catch (error) {
    console.log(`❌ 工作流文件解析失败: ${error.message}`);
    return false;
  }
}

/**
 * 验证核心模块文件
 */
function validateCoreModules() {
  console.log('\n🔍 验证核心模块文件...');
  
  const coreModules = [
    {
      file: '火鸟门户_内容处理核心模块.js',
      className: 'HuoNiaoContentProcessor',
      description: '内容处理核心模块'
    },
    {
      file: '火鸟门户_API集成模块.js', 
      className: 'HuoNiaoAPIClient',
      description: 'API集成模块'
    }
  ];

  let allValid = true;

  coreModules.forEach(module => {
    if (!fs.existsSync(module.file)) {
      console.log(`❌ 模块文件不存在: ${module.file}`);
      allValid = false;
      return;
    }

    try {
      const moduleContent = fs.readFileSync(module.file, 'utf8');
      
      // 检查类定义
      if (!moduleContent.includes(`class ${module.className}`)) {
        console.log(`❌ 模块文件缺少类定义: ${module.className}`);
        allValid = false;
        return;
      }

      // 检查导出
      if (!moduleContent.includes('module.exports')) {
        console.log(`❌ 模块文件缺少导出: ${module.file}`);
        allValid = false;
        return;
      }

      // 获取文件大小
      const stats = fs.statSync(module.file);
      const fileSizeKB = Math.round(stats.size / 1024);

      console.log(`✅ ${module.description}验证通过:`);
      console.log(`   - 文件: ${module.file}`);
      console.log(`   - 大小: ${fileSizeKB} KB`);
      console.log(`   - 类名: ${module.className}`);
      
    } catch (error) {
      console.log(`❌ 模块文件读取失败: ${module.file} - ${error.message}`);
      allValid = false;
    }
  });

  return allValid;
}

/**
 * 验证依赖包
 */
function validateDependencies() {
  console.log('\n🔍 验证项目依赖...');
  
  if (!fs.existsSync('package.json')) {
    console.log('❌ package.json文件不存在');
    return false;
  }

  try {
    const packageContent = fs.readFileSync('package.json', 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    const allDependencies = { ...dependencies, ...devDependencies };

    // 检查必需的依赖
    const requiredDeps = [
      'puppeteer' // 现有依赖
    ];

    // 推荐的依赖 (用于增强功能)
    const recommendedDeps = [
      'axios',      // HTTP请求
      'dotenv',     // 环境变量
      'crypto',     // 加密 (Node.js内置)
      'fs',         // 文件系统 (Node.js内置)
      'path'        // 路径处理 (Node.js内置)
    ];

    console.log(`✅ 项目依赖验证:`);
    console.log(`   - 项目名称: ${packageJson.name}`);
    console.log(`   - 版本: ${packageJson.version}`);
    console.log(`   - 依赖数量: ${Object.keys(allDependencies).length}`);

    // 检查必需依赖
    const missingRequired = requiredDeps.filter(dep => !allDependencies[dep]);
    if (missingRequired.length > 0) {
      console.log(`❌ 缺少必需依赖: ${missingRequired.join(', ')}`);
      return false;
    }

    // 检查推荐依赖
    const missingRecommended = recommendedDeps.filter(dep => 
      !allDependencies[dep] && !['crypto', 'fs', 'path'].includes(dep)
    );
    
    if (missingRecommended.length > 0) {
      console.log(`⚠️  建议安装依赖: ${missingRecommended.join(', ')}`);
      console.log('   运行: npm install ' + missingRecommended.join(' '));
    }

    return true;
    
  } catch (error) {
    console.log(`❌ package.json解析失败: ${error.message}`);
    return false;
  }
}

/**
 * 验证Docker配置
 */
function validateDockerConfig() {
  console.log('\n🔍 验证Docker配置...');
  
  const dockerComposeFile = 'docker-compose-n8n.yml';
  
  if (!fs.existsSync(dockerComposeFile)) {
    console.log(`❌ Docker Compose文件不存在: ${dockerComposeFile}`);
    return false;
  }

  try {
    const dockerContent = fs.readFileSync(dockerComposeFile, 'utf8');
    
    // 检查关键配置
    const requiredConfigs = [
      'n8n-main',           // n8n服务
      'postgres',           // 数据库服务
      'HUONIAO_SESSION_ID', // 火鸟门户配置
      'NOTION_API_TOKEN',   // Notion配置
      'OPENAI_API_KEY'      // OpenAI配置
    ];

    const missingConfigs = requiredConfigs.filter(config => 
      !dockerContent.includes(config)
    );

    if (missingConfigs.length > 0) {
      console.log(`❌ Docker配置缺少: ${missingConfigs.join(', ')}`);
      return false;
    }

    console.log(`✅ Docker配置验证通过:`);
    console.log(`   - 配置文件: ${dockerComposeFile}`);
    console.log(`   - 包含n8n服务配置`);
    console.log(`   - 包含PostgreSQL数据库`);
    console.log(`   - 包含环境变量配置`);

    return true;
    
  } catch (error) {
    console.log(`❌ Docker配置读取失败: ${error.message}`);
    return false;
  }
}

/**
 * 生成验证报告
 */
function generateValidationReport(results) {
  console.log('\n📊 验证报告:');
  console.log('='.repeat(50));
  
  const categories = [
    { name: '工作流文件', result: results.workflow },
    { name: '核心模块', result: results.modules },
    { name: '项目依赖', result: results.dependencies },
    { name: 'Docker配置', result: results.docker }
  ];

  categories.forEach(category => {
    const status = category.result ? '✅ 通过' : '❌ 失败';
    console.log(`${category.name}: ${status}`);
  });

  const overallSuccess = Object.values(results).every(result => result);
  
  console.log('='.repeat(50));
  console.log(`总体状态: ${overallSuccess ? '✅ 验证通过' : '❌ 验证失败'}`);
  
  if (!overallSuccess) {
    console.log('\n⚠️  请修复上述问题后重新运行验证');
  } else {
    console.log('\n🎉 所有验证通过，可以继续下一步配置！');
  }

  return overallSuccess;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始验证现有工作流文件和依赖模块...\n');

  const results = {
    workflow: validateWorkflowFile(),
    modules: validateCoreModules(),
    dependencies: validateDependencies(),
    docker: validateDockerConfig()
  };

  const success = generateValidationReport(results);
  
  if (success) {
    console.log('\n📋 下一步操作:');
    console.log('1. 配置环境变量: cp .env.template .env');
    console.log('2. 编辑 .env 文件，填入实际的API密钥和配置');
    console.log('3. 运行凭据测试: node scripts/test-credentials.js');
    console.log('4. 启动服务: docker-compose -f docker-compose-n8n.yml up -d');
  }

  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  validateWorkflowFile,
  validateCoreModules,
  validateDependencies,
  validateDockerConfig
};