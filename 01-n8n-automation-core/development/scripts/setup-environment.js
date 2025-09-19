#!/usr/bin/env node

/**
 * 火鸟门户新闻自动化工作流环境配置主脚本
 * 统一执行所有环境配置和依赖准备任务
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 导入子任务模块
const { validateWorkflowFile, validateCoreModules, validateDependencies, validateDockerConfig } = require('./validate-workflow');
const { generateCredentialsConfig, validateEnvironment } = require('./setup-credentials');

/**
 * 任务执行器类
 */
class EnvironmentSetup {
  constructor() {
    this.tasks = [];
    this.results = {};
    this.startTime = Date.now();
  }

  /**
   * 添加任务
   */
  addTask(name, description, handler, required = true) {
    this.tasks.push({
      name,
      description,
      handler,
      required,
      status: 'pending'
    });
  }

  /**
   * 执行所有任务
   */
  async executeAll() {
    console.log('🚀 开始执行环境配置和依赖准备任务...\n');
    console.log(`总共 ${this.tasks.length} 个任务需要执行\n`);

    for (let i = 0; i < this.tasks.length; i++) {
      const task = this.tasks[i];
      const taskNumber = i + 1;
      
      console.log(`📋 任务 ${taskNumber}/${this.tasks.length}: ${task.description}`);
      console.log('='.repeat(60));
      
      try {
        task.status = 'running';
        const result = await task.handler();
        
        if (result) {
          task.status = 'completed';
          this.results[task.name] = { success: true, result };
          console.log(`✅ 任务完成: ${task.description}\n`);
        } else {
          task.status = 'failed';
          this.results[task.name] = { success: false, error: 'Task returned false' };
          
          if (task.required) {
            console.log(`❌ 必需任务失败: ${task.description}`);
            console.log('停止执行后续任务\n');
            break;
          } else {
            console.log(`⚠️  可选任务失败: ${task.description}`);
            console.log('继续执行后续任务\n');
          }
        }
      } catch (error) {
        task.status = 'error';
        this.results[task.name] = { success: false, error: error.message };
        
        console.log(`❌ 任务执行异常: ${task.description}`);
        console.log(`错误信息: ${error.message}\n`);
        
        if (task.required) {
          console.log('停止执行后续任务\n');
          break;
        }
      }
    }

    this.generateReport();
  }

  /**
   * 生成执行报告
   */
  generateReport() {
    const duration = Date.now() - this.startTime;
    const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
    const failedTasks = this.tasks.filter(t => t.status === 'failed' || t.status === 'error').length;
    
    console.log('\n📊 环境配置执行报告');
    console.log('='.repeat(60));
    console.log(`执行时间: ${Math.round(duration / 1000)}秒`);
    console.log(`总任务数: ${this.tasks.length}`);
    console.log(`完成任务: ${completedTasks}`);
    console.log(`失败任务: ${failedTasks}`);
    console.log('');

    // 详细任务状态
    this.tasks.forEach((task, index) => {
      const statusIcon = {
        'completed': '✅',
        'failed': '❌',
        'error': '💥',
        'pending': '⏳',
        'running': '🔄'
      }[task.status] || '❓';
      
      console.log(`${statusIcon} ${index + 1}. ${task.description}`);
      
      if (task.status === 'failed' || task.status === 'error') {
        const error = this.results[task.name]?.error || 'Unknown error';
        console.log(`   错误: ${error}`);
      }
    });

    console.log('');

    // 生成下一步指导
    if (completedTasks === this.tasks.length) {
      this.generateSuccessGuidance();
    } else {
      this.generateFailureGuidance();
    }

    // 保存报告到文件
    this.saveReportToFile();
  }

  /**
   * 生成成功指导
   */
  generateSuccessGuidance() {
    console.log('🎉 所有环境配置任务执行成功！');
    console.log('');
    console.log('📋 下一步操作指南:');
    console.log('1. 检查并编辑 .env 文件，填入实际的API密钥和配置');
    console.log('2. 运行API连接测试: node scripts/test-credentials.js');
    console.log('3. 启动n8n服务: docker-compose -f docker-compose-n8n.yml up -d');
    console.log('4. 访问n8n管理界面: http://localhost:5678');
    console.log('5. 导入工作流文件和凭据配置');
    console.log('6. 测试完整的新闻采集工作流');
    console.log('');
    console.log('📚 相关文档和脚本:');
    console.log('- 环境变量模板: .env.template');
    console.log('- 凭据配置: n8n-config/credentials/');
    console.log('- Notion配置: n8n-config/notion-config.json');
    console.log('- 会话管理: scripts/session-manager.js');
  }

  /**
   * 生成失败指导
   */
  generateFailureGuidance() {
    console.log('⚠️  部分环境配置任务执行失败');
    console.log('');
    console.log('🔧 故障排除建议:');
    
    const failedTasks = this.tasks.filter(t => t.status === 'failed' || t.status === 'error');
    failedTasks.forEach(task => {
      console.log(`- ${task.description}:`);
      const error = this.results[task.name]?.error || 'Unknown error';
      console.log(`  错误: ${error}`);
      console.log(`  建议: 检查相关配置和依赖`);
    });
    
    console.log('');
    console.log('📞 获取帮助:');
    console.log('1. 检查错误日志和配置文件');
    console.log('2. 验证网络连接和API密钥');
    console.log('3. 重新运行失败的任务');
  }

  /**
   * 保存报告到文件
   */
  saveReportToFile() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      tasks: this.tasks.map(task => ({
        name: task.name,
        description: task.description,
        status: task.status,
        required: task.required,
        result: this.results[task.name]
      })),
      summary: {
        total: this.tasks.length,
        completed: this.tasks.filter(t => t.status === 'completed').length,
        failed: this.tasks.filter(t => t.status === 'failed' || t.status === 'error').length
      }
    };

    const reportPath = 'logs/environment-setup-report.json';
    
    // 确保日志目录存在
    const logDir = path.dirname(reportPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 详细报告已保存到: ${reportPath}`);
  }
}

/**
 * 检查Node.js和npm版本
 */
function checkNodeVersion() {
  console.log('🔍 检查Node.js和npm版本...');
  
  try {
    const nodeVersion = process.version;
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    
    console.log(`✅ Node.js版本: ${nodeVersion}`);
    console.log(`✅ npm版本: ${npmVersion}`);
    
    // 检查版本要求
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 16) {
      console.log('⚠️  建议使用Node.js 16或更高版本');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ 版本检查失败: ${error.message}`);
    return false;
  }
}

/**
 * 安装必需的npm依赖
 */
function installDependencies() {
  console.log('📦 检查和安装npm依赖...');
  
  try {
    // 检查package.json
    if (!fs.existsSync('package.json')) {
      console.log('⚠️  package.json不存在，创建基础配置...');
      
      const packageJson = {
        name: "huoniao-news-automation",
        version: "1.0.0",
        description: "火鸟门户新闻自动化工作流",
        main: "index.js",
        scripts: {
          "test": "node scripts/test-credentials.js",
          "setup": "node scripts/setup-environment.js",
          "validate": "node scripts/validate-workflow.js"
        },
        dependencies: {
          "axios": "^1.6.0",
          "dotenv": "^16.3.0"
        },
        devDependencies: {},
        keywords: ["n8n", "automation", "news", "huoniao"],
        author: "AI Assistant",
        license: "MIT"
      };
      
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    }

    // 安装依赖
    console.log('正在安装npm依赖...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('✅ npm依赖安装完成');
    return true;
  } catch (error) {
    console.log(`❌ 依赖安装失败: ${error.message}`);
    return false;
  }
}

/**
 * 创建必要的目录结构
 */
function createDirectoryStructure() {
  console.log('📁 创建目录结构...');
  
  const directories = [
    'scripts',
    'n8n-config',
    'n8n-config/credentials',
    'n8n-config/workflows',
    'logs',
    'backups',
    'temp'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ 创建目录: ${dir}`);
    }
  });

  return true;
}

/**
 * 复制环境变量模板
 */
function setupEnvironmentTemplate() {
  console.log('⚙️  设置环境变量模板...');
  
  if (!fs.existsSync('.env') && fs.existsSync('.env.template')) {
    fs.copyFileSync('.env.template', '.env');
    console.log('✅ 已复制 .env.template 到 .env');
    console.log('⚠️  请编辑 .env 文件，填入实际的API密钥和配置');
  } else if (fs.existsSync('.env')) {
    console.log('✅ .env 文件已存在');
  } else {
    console.log('⚠️  .env.template 文件不存在，请检查');
    return false;
  }

  return true;
}

/**
 * 验证Docker环境
 */
function validateDockerEnvironment() {
  console.log('🐳 验证Docker环境...');
  
  try {
    // 检查Docker是否安装
    execSync('docker --version', { stdio: 'pipe' });
    console.log('✅ Docker已安装');
    
    // 检查Docker Compose是否安装
    execSync('docker-compose --version', { stdio: 'pipe' });
    console.log('✅ Docker Compose已安装');
    
    // 检查Docker是否运行
    execSync('docker info', { stdio: 'pipe' });
    console.log('✅ Docker服务正在运行');
    
    return true;
  } catch (error) {
    console.log('❌ Docker环境检查失败:');
    console.log('请确保Docker和Docker Compose已安装并正在运行');
    return false;
  }
}

/**
 * 生成快速启动脚本
 */
function generateQuickStartScript() {
  console.log('🚀 生成快速启动脚本...');
  
  const quickStartScript = `#!/bin/bash

# 火鸟门户新闻自动化工作流快速启动脚本

echo "🚀 启动火鸟门户新闻自动化工作流..."

# 检查环境变量
if [ ! -f .env ]; then
    echo "❌ .env文件不存在，请先配置环境变量"
    echo "运行: cp .env.template .env"
    echo "然后编辑 .env 文件填入实际配置"
    exit 1
fi

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 启动服务
echo "📦 启动n8n和PostgreSQL服务..."
docker-compose -f docker-compose-n8n.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
if docker ps | grep -q "n8n-main"; then
    echo "✅ n8n服务启动成功"
    echo "🌐 访问地址: http://localhost:5678"
else
    echo "❌ n8n服务启动失败"
    echo "查看日志: docker-compose -f docker-compose-n8n.yml logs"
    exit 1
fi

if docker ps | grep -q "n8n-postgres"; then
    echo "✅ PostgreSQL服务启动成功"
else
    echo "❌ PostgreSQL服务启动失败"
    echo "查看日志: docker-compose -f docker-compose-n8n.yml logs postgres"
    exit 1
fi

echo ""
echo "🎉 服务启动完成！"
echo ""
echo "📋 下一步操作:"
echo "1. 访问 http://localhost:5678 配置n8n"
echo "2. 导入工作流文件: 火鸟门户_新闻采集工作流_增强版.json"
echo "3. 配置API凭据"
echo "4. 测试工作流"
echo ""
echo "🛠️  管理命令:"
echo "停止服务: docker-compose -f docker-compose-n8n.yml down"
echo "查看日志: docker-compose -f docker-compose-n8n.yml logs -f"
echo "重启服务: docker-compose -f docker-compose-n8n.yml restart"
`;

  fs.writeFileSync('start.sh', quickStartScript);
  fs.chmodSync('start.sh', '755');
  
  console.log('✅ 快速启动脚本已生成: start.sh');
  return true;
}

/**
 * 主函数
 */
async function main() {
  const setup = new EnvironmentSetup();

  // 添加所有任务
  setup.addTask('node-version', '检查Node.js和npm版本', checkNodeVersion, true);
  setup.addTask('directories', '创建目录结构', createDirectoryStructure, true);
  setup.addTask('dependencies', '安装npm依赖', installDependencies, true);
  setup.addTask('env-template', '设置环境变量模板', setupEnvironmentTemplate, true);
  setup.addTask('docker-env', '验证Docker环境', validateDockerEnvironment, false);
  setup.addTask('workflow-validation', '验证工作流文件', validateWorkflowFile, true);
  setup.addTask('modules-validation', '验证核心模块', validateCoreModules, true);
  setup.addTask('docker-config', '验证Docker配置', validateDockerConfig, true);
  setup.addTask('credentials-config', '生成凭据配置', generateCredentialsConfig, true);
  setup.addTask('quick-start', '生成快速启动脚本', generateQuickStartScript, false);

  // 执行所有任务
  await setup.executeAll();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ 环境配置执行失败:', error.message);
    process.exit(1);
  });
}

module.exports = {
  EnvironmentSetup,
  checkNodeVersion,
  installDependencies,
  createDirectoryStructure,
  setupEnvironmentTemplate,
  validateDockerEnvironment,
  generateQuickStartScript
};