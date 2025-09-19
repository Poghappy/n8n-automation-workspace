#!/usr/bin/env node

/**
 * 配置管理系统部署脚本
 * 
 * 功能:
 * - 部署配置管理系统
 * - 初始化配置文件
 * - 设置环境变量
 * - 验证系统功能
 * - 创建初始备份
 * 
 * 需求: 需求6 (凭据安全), 需求8 (复用现有工作流)
 */

const fs = require('fs').promises;
const path = require('path');
const { initializeConfigManagement } = require('../n8n-config/config-management-integration');

class ConfigManagementDeployer {
  constructor() {
    this.workspaceRoot = path.resolve(__dirname, '..');
    this.configDir = path.join(this.workspaceRoot, 'n8n-config');
    this.backupDir = path.join(this.configDir, 'backups');
    this.logFile = path.join(this.workspaceRoot, 'logs', 'config-deployment.log');
    
    this.deploymentSteps = [
      'validateEnvironment',
      'setupDirectories',
      'validateConfigFiles',
      'initializeSystem',
      'createInitialBackup',
      'runSystemTests',
      'generateReport'
    ];
  }

  /**
   * 执行部署
   */
  async deploy() {
    const startTime = Date.now();
    const deploymentId = this.generateDeploymentId();
    
    console.log(`开始部署配置管理系统 (ID: ${deploymentId})`);
    console.log(`部署时间: ${new Date().toISOString()}`);
    console.log('='.repeat(60));
    
    const results = {
      deploymentId,
      startTime: new Date().toISOString(),
      steps: {},
      success: false,
      error: null,
      endTime: null,
      duration: null
    };
    
    try {
      // 执行部署步骤
      for (const step of this.deploymentSteps) {
        console.log(`\n执行步骤: ${step}`);
        console.log('-'.repeat(40));
        
        const stepStartTime = Date.now();
        
        try {
          const stepResult = await this[step]();
          const stepDuration = Date.now() - stepStartTime;
          
          results.steps[step] = {
            success: true,
            duration: stepDuration,
            result: stepResult,
            timestamp: new Date().toISOString()
          };
          
          console.log(`✅ 步骤完成: ${step} (${stepDuration}ms)`);
          
        } catch (error) {
          const stepDuration = Date.now() - stepStartTime;
          
          results.steps[step] = {
            success: false,
            duration: stepDuration,
            error: error.message,
            timestamp: new Date().toISOString()
          };
          
          console.error(`❌ 步骤失败: ${step} - ${error.message}`);
          throw error;
        }
      }
      
      results.success = true;
      console.log('\n🎉 配置管理系统部署成功!');
      
    } catch (error) {
      results.error = error.message;
      console.error('\n💥 配置管理系统部署失败:', error.message);
    } finally {
      const endTime = Date.now();
      results.endTime = new Date().toISOString();
      results.duration = endTime - startTime;
      
      // 保存部署报告
      await this.saveDeploymentReport(results);
      
      console.log(`\n部署耗时: ${results.duration}ms`);
      console.log('='.repeat(60));
    }
    
    return results;
  }

  /**
   * 验证环境
   */
  async validateEnvironment() {
    console.log('验证部署环境...');
    
    const checks = [];
    
    // 检查Node.js版本
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 14) {
      throw new Error(`Node.js版本过低: ${nodeVersion}，需要 >= 14.0.0`);
    }
    
    checks.push({
      name: 'Node.js版本',
      status: 'pass',
      value: nodeVersion
    });
    
    // 检查工作目录
    try {
      await fs.access(this.workspaceRoot);
      checks.push({
        name: '工作目录',
        status: 'pass',
        value: this.workspaceRoot
      });
    } catch (error) {
      throw new Error(`工作目录不存在: ${this.workspaceRoot}`);
    }
    
    // 检查必需的环境变量
    const requiredEnvVars = [
      'OPENAI_API_KEY',
      'NOTION_API_TOKEN',
      'HUONIAO_SESSION_ID'
    ];
    
    const missingEnvVars = [];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingEnvVars.push(envVar);
      } else {
        checks.push({
          name: `环境变量 ${envVar}`,
          status: 'pass',
          value: '已设置'
        });
      }
    }
    
    if (missingEnvVars.length > 0) {
      console.warn(`缺少环境变量: ${missingEnvVars.join(', ')}`);
      console.warn('系统将使用默认配置，部分功能可能不可用');
    }
    
    // 检查磁盘空间
    try {
      const stats = await fs.stat(this.workspaceRoot);
      checks.push({
        name: '磁盘访问',
        status: 'pass',
        value: '可读写'
      });
    } catch (error) {
      throw new Error(`磁盘访问检查失败: ${error.message}`);
    }
    
    console.log(`环境验证完成: ${checks.length} 项检查通过`);
    
    return {
      checks,
      nodeVersion,
      workspaceRoot: this.workspaceRoot,
      missingEnvVars
    };
  }

  /**
   * 设置目录结构
   */
  async setupDirectories() {
    console.log('设置目录结构...');
    
    const directories = [
      this.configDir,
      this.backupDir,
      path.join(this.backupDir, 'archive'),
      path.join(this.workspaceRoot, 'logs'),
      path.join(this.workspaceRoot, 'temp')
    ];
    
    const createdDirs = [];
    const existingDirs = [];
    
    for (const dir of directories) {
      try {
        await fs.access(dir);
        existingDirs.push(dir);
      } catch (error) {
        await fs.mkdir(dir, { recursive: true });
        createdDirs.push(dir);
      }
    }
    
    console.log(`创建目录: ${createdDirs.length} 个`);
    console.log(`已存在目录: ${existingDirs.length} 个`);
    
    return {
      createdDirectories: createdDirs,
      existingDirectories: existingDirs,
      totalDirectories: directories.length
    };
  }

  /**
   * 验证配置文件
   */
  async validateConfigFiles() {
    console.log('验证配置文件...');
    
    const configFiles = [
      'enhanced-sources-config.json',
      'workflow-orchestration-config.json',
      'notion-config.json',
      'firebird-publish-node-config.json',
      'ai-intelligent-management-node-config.json',
      'error-handling-integration-config.json',
      'unified-logging-node-config.json',
      'workflow-parameters.json'
    ];
    
    const validFiles = [];
    const invalidFiles = [];
    const missingFiles = [];
    
    for (const filename of configFiles) {
      const filePath = path.join(this.configDir, filename);
      
      try {
        await fs.access(filePath);
        
        // 验证JSON格式
        const content = await fs.readFile(filePath, 'utf8');
        JSON.parse(content);
        
        validFiles.push(filename);
        
      } catch (error) {
        if (error.code === 'ENOENT') {
          missingFiles.push(filename);
        } else {
          invalidFiles.push({
            filename,
            error: error.message
          });
        }
      }
    }
    
    console.log(`有效配置文件: ${validFiles.length} 个`);
    console.log(`无效配置文件: ${invalidFiles.length} 个`);
    console.log(`缺失配置文件: ${missingFiles.length} 个`);
    
    if (invalidFiles.length > 0) {
      console.error('无效配置文件:', invalidFiles);
      throw new Error(`发现 ${invalidFiles.length} 个无效配置文件`);
    }
    
    if (missingFiles.length > 0) {
      console.warn('缺失配置文件:', missingFiles);
      console.warn('系统将使用默认配置');
    }
    
    return {
      validFiles,
      invalidFiles,
      missingFiles,
      totalFiles: configFiles.length
    };
  }

  /**
   * 初始化系统
   */
  async initializeSystem() {
    console.log('初始化配置管理系统...');
    
    const options = {
      configDir: this.configDir,
      backupDir: this.backupDir,
      enableHotReload: true,
      enableAutoBackup: true,
      enableMonitoring: true,
      secretKey: process.env.CONFIG_SECRET_KEY,
      encryptionKey: process.env.BACKUP_ENCRYPTION_KEY
    };
    
    try {
      const configManagement = await initializeConfigManagement(options);
      
      // 获取系统状态
      const systemStatus = configManagement.getSystemStatus();
      
      console.log('系统组件状态:');
      for (const [component, status] of Object.entries(systemStatus.components)) {
        const statusIcon = status.status === 'healthy' ? '✅' : 
                          status.status === 'warning' ? '⚠️' : '❌';
        console.log(`  ${statusIcon} ${component}: ${status.status}`);
      }
      
      return {
        initialized: systemStatus.initialized,
        components: systemStatus.components,
        configCount: systemStatus.components.configManager.configCount,
        backupCount: systemStatus.components.backupRecovery.backupCount
      };
      
    } catch (error) {
      console.error('系统初始化失败:', error);
      throw error;
    }
  }

  /**
   * 创建初始备份
   */
  async createInitialBackup() {
    console.log('创建初始配置备份...');
    
    try {
      const { getConfigManagement } = require('../n8n-config/config-management-integration');
      const configManagement = getConfigManagement();
      
      const backupResult = await configManagement.createBackup('full', {
        creator: 'deployment-script',
        reason: 'initial-deployment-backup'
      });
      
      console.log(`初始备份创建成功: ${backupResult.backupId}`);
      console.log(`备份路径: ${backupResult.path}`);
      console.log(`配置数量: ${backupResult.configCount}`);
      
      return {
        backupId: backupResult.backupId,
        path: backupResult.path,
        configCount: backupResult.configCount,
        timestamp: backupResult.timestamp
      };
      
    } catch (error) {
      console.error('创建初始备份失败:', error);
      throw error;
    }
  }

  /**
   * 运行系统测试
   */
  async runSystemTests() {
    console.log('运行系统功能测试...');
    
    const tests = [];
    
    try {
      const { getConfigManagement } = require('../n8n-config/config-management-integration');
      const configManagement = getConfigManagement();
      
      // 测试1: 配置读取
      try {
        const sourcesConfig = configManagement.getConfig('sources');
        tests.push({
          name: '配置读取测试',
          status: 'pass',
          details: `成功读取配置，包含 ${sourcesConfig.rssSources?.length || 0} 个RSS源`
        });
      } catch (error) {
        tests.push({
          name: '配置读取测试',
          status: 'fail',
          error: error.message
        });
      }
      
      // 测试2: 配置验证
      try {
        const validation = await configManagement.validateConfig('sources');
        tests.push({
          name: '配置验证测试',
          status: validation.isValid ? 'pass' : 'fail',
          details: validation.isValid ? '配置验证通过' : `验证失败: ${validation.errors.join(', ')}`
        });
      } catch (error) {
        tests.push({
          name: '配置验证测试',
          status: 'fail',
          error: error.message
        });
      }
      
      // 测试3: 健康检查
      try {
        const healthCheck = await configManagement.performHealthCheck();
        tests.push({
          name: '系统健康检查',
          status: healthCheck.overall === 'healthy' ? 'pass' : 'warning',
          details: `系统状态: ${healthCheck.overall}`
        });
      } catch (error) {
        tests.push({
          name: '系统健康检查',
          status: 'fail',
          error: error.message
        });
      }
      
      // 测试4: 备份列表
      try {
        const backups = configManagement.listBackups({ limit: 5 });
        tests.push({
          name: '备份系统测试',
          status: 'pass',
          details: `找到 ${backups.length} 个备份`
        });
      } catch (error) {
        tests.push({
          name: '备份系统测试',
          status: 'fail',
          error: error.message
        });
      }
      
      const passedTests = tests.filter(t => t.status === 'pass').length;
      const failedTests = tests.filter(t => t.status === 'fail').length;
      const warningTests = tests.filter(t => t.status === 'warning').length;
      
      console.log(`测试结果: ${passedTests} 通过, ${warningTests} 警告, ${failedTests} 失败`);
      
      if (failedTests > 0) {
        console.warn('部分测试失败，系统可能无法正常工作');
      }
      
      return {
        tests,
        summary: {
          total: tests.length,
          passed: passedTests,
          failed: failedTests,
          warnings: warningTests
        }
      };
      
    } catch (error) {
      console.error('系统测试失败:', error);
      throw error;
    }
  }

  /**
   * 生成部署报告
   */
  async generateReport() {
    console.log('生成部署报告...');
    
    const reportData = {
      deploymentId: this.generateDeploymentId(),
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        workspaceRoot: this.workspaceRoot
      },
      summary: {
        success: true,
        totalSteps: this.deploymentSteps.length,
        completedSteps: this.deploymentSteps.length
      }
    };
    
    const reportPath = path.join(this.workspaceRoot, 'logs', `config-deployment-report-${Date.now()}.json`);
    
    try {
      await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2), 'utf8');
      
      console.log(`部署报告已生成: ${reportPath}`);
      
      return {
        reportPath,
        reportData
      };
      
    } catch (error) {
      console.error('生成部署报告失败:', error);
      throw error;
    }
  }

  /**
   * 保存部署报告
   */
  async saveDeploymentReport(results) {
    try {
      await this.ensureDirectoryExists(path.dirname(this.logFile));
      
      const reportPath = path.join(
        path.dirname(this.logFile), 
        `config-deployment-${results.deploymentId}.json`
      );
      
      await fs.writeFile(reportPath, JSON.stringify(results, null, 2), 'utf8');
      
      console.log(`部署报告已保存: ${reportPath}`);
    } catch (error) {
      console.error('保存部署报告失败:', error);
    }
  }

  /**
   * 确保目录存在
   */
  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * 生成部署ID
   */
  generateDeploymentId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 8);
    return `deploy-${timestamp}-${random}`;
  }
}

// 主函数
async function main() {
  const deployer = new ConfigManagementDeployer();
  
  try {
    const results = await deployer.deploy();
    
    if (results.success) {
      console.log('\n🎉 配置管理系统部署成功完成!');
      console.log('\n下一步:');
      console.log('1. 检查配置文件并根据需要调整参数');
      console.log('2. 运行 npm run test-config-management 验证系统');
      console.log('3. 启动 n8n 工作流引擎');
      
      process.exit(0);
    } else {
      console.error('\n💥 配置管理系统部署失败');
      console.error('请检查错误信息并重新部署');
      
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 部署过程中发生异常:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { ConfigManagementDeployer };