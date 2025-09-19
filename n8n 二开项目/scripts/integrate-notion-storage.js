#!/usr/bin/env node

/**
 * Notion存储节点集成脚本
 * 将Notion存储节点集成到现有的增强新闻采集工作流中
 */

const fs = require('fs');
const path = require('path');

// 配置文件路径
const WORKFLOW_PATH = 'n8n-config/workflows/enhanced-news-collection-workflow.json';
const NOTION_CONFIG_PATH = 'n8n-config/notion-storage-node-config.json';
const OUTPUT_PATH = 'n8n-config/workflows/enhanced-news-collection-with-notion.json';

/**
 * 读取JSON文件
 */
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`读取文件失败 ${filePath}:`, error.message);
    process.exit(1);
  }
}

/**
 * 写入JSON文件
 */
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ 文件已保存: ${filePath}`);
  } catch (error) {
    console.error(`写入文件失败 ${filePath}:`, error.message);
    process.exit(1);
  }
}

/**
 * 集成Notion存储节点到工作流
 */
function integrateNotionStorage() {
  console.log('🚀 开始集成Notion存储节点...');
  
  // 读取现有工作流和Notion配置
  const workflow = readJsonFile(WORKFLOW_PATH);
  const notionConfig = readJsonFile(NOTION_CONFIG_PATH);
  
  console.log(`📖 已读取工作流: ${workflow.name}`);
  console.log(`📖 已读取Notion配置: ${notionConfig.name}`);
  
  // 创建新的工作流副本
  const enhancedWorkflow = {
    ...workflow,
    name: workflow.name + ' (含Notion存储)',
    meta: {
      ...workflow.meta,
      instanceId: 'enhanced-news-collection-with-notion-v1.0.0',
      description: '集成Notion存储的增强新闻采集工作流'
    },
    versionId: 'enhanced-with-notion-v1.0.0'
  };
  
  // 添加Notion存储相关节点
  const notionNodes = [
    // Notion存储重试处理节点
    {
      ...notionConfig.retryLogicNode,
      parameters: {
        ...notionConfig.retryLogicNode.parameters
      }
    },
    
    // Notion存储节点
    {
      ...notionConfig.storageNode,
      parameters: {
        ...notionConfig.storageNode.parameters
      }
    },
    
    // Notion存储状态跟踪节点
    {
      ...notionConfig.statusTrackingNode,
      parameters: {
        ...notionConfig.statusTrackingNode.parameters
      }
    },
    
    // Notion存储错误处理节点
    {
      ...notionConfig.errorHandlingNode,
      parameters: {
        ...notionConfig.errorHandlingNode.parameters
      }
    }
  ];
  
  // 将新节点添加到工作流
  enhancedWorkflow.nodes = [...enhancedWorkflow.nodes, ...notionNodes];
  
  // 更新连接关系
  const newConnections = {
    ...enhancedWorkflow.connections,
    
    // 成功处理统计 -> Notion存储重试处理
    "成功处理统计": {
      "main": [
        [
          {
            "node": "Notion存储重试处理",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    
    // Notion存储重试处理 -> Notion新闻存储
    "Notion存储重试处理": {
      "main": [
        [
          {
            "node": "Notion新闻存储",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    
    // Notion新闻存储 -> 成功: 状态跟踪, 失败: 错误处理
    "Notion新闻存储": {
      "main": [
        [
          {
            "node": "Notion存储状态跟踪",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    
    // 错误处理记录 -> Notion存储错误处理 (添加错误分支)
    "错误处理记录": {
      "main": [
        [
          {
            "node": "Notion存储错误处理",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  };
  
  enhancedWorkflow.connections = newConnections;
  
  // 添加环境变量说明
  enhancedWorkflow.environmentVariables = notionConfig.environmentVariables;
  
  // 添加监控配置
  enhancedWorkflow.monitoring = notionConfig.monitoring;
  
  // 更新标签
  enhancedWorkflow.tags = [
    ...enhancedWorkflow.tags,
    {
      "id": "notion",
      "name": "Notion存储"
    },
    {
      "id": "storage",
      "name": "数据存储"
    },
    {
      "id": "retry-logic",
      "name": "重试机制"
    }
  ];
  
  // 保存增强后的工作流
  writeJsonFile(OUTPUT_PATH, enhancedWorkflow);
  
  console.log('✅ Notion存储节点集成完成!');
  console.log(`📁 输出文件: ${OUTPUT_PATH}`);
  
  // 生成集成报告
  generateIntegrationReport(workflow, enhancedWorkflow, notionConfig);
}

/**
 * 生成集成报告
 */
function generateIntegrationReport(originalWorkflow, enhancedWorkflow, notionConfig) {
  const report = {
    timestamp: new Date().toISOString(),
    integration: {
      originalNodes: originalWorkflow.nodes.length,
      addedNodes: notionConfig ? 4 : 0,
      totalNodes: enhancedWorkflow.nodes.length,
      newConnections: 4
    },
    addedFeatures: [
      'Notion数据库存储',
      '指数退避重试机制',
      '数据验证和清理',
      '存储状态跟踪',
      '错误分类和处理',
      '性能监控指标'
    ],
    environmentVariables: notionConfig.environmentVariables,
    monitoring: notionConfig.monitoring,
    nextSteps: [
      '1. 配置环境变量 (NOTION_API_TOKEN, NOTION_DATABASE_ID)',
      '2. 导入工作流到n8n',
      '3. 测试Notion连接',
      '4. 配置监控告警',
      '5. 执行端到端测试'
    ]
  };
  
  const reportPath = 'logs/notion-integration-report.json';
  writeJsonFile(reportPath, report);
  
  console.log('\\n📊 集成报告:');
  console.log(`   原始节点数: ${report.integration.originalNodes}`);
  console.log(`   新增节点数: ${report.integration.addedNodes}`);
  console.log(`   总节点数: ${report.integration.totalNodes}`);
  console.log(`   新增连接数: ${report.integration.newConnections}`);
  console.log(`\\n📋 报告已保存: ${reportPath}`);
}

/**
 * 验证集成结果
 */
function validateIntegration() {
  console.log('\\n🔍 验证集成结果...');
  
  if (!fs.existsSync(OUTPUT_PATH)) {
    console.error('❌ 输出文件不存在');
    return false;
  }
  
  try {
    const workflow = readJsonFile(OUTPUT_PATH);
    
    // 检查必需的节点
    const requiredNodes = [
      'Notion存储重试处理',
      'Notion新闻存储',
      'Notion存储状态跟踪',
      'Notion存储错误处理'
    ];
    
    const nodeNames = workflow.nodes.map(node => node.name);
    const missingNodes = requiredNodes.filter(name => !nodeNames.includes(name));
    
    if (missingNodes.length > 0) {
      console.error('❌ 缺少必需节点:', missingNodes);
      return false;
    }
    
    // 检查连接
    const connections = workflow.connections;
    if (!connections['成功处理统计'] || !connections['Notion存储重试处理']) {
      console.error('❌ 连接配置不完整');
      return false;
    }
    
    console.log('✅ 集成验证通过');
    return true;
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔧 Notion存储节点集成工具');
  console.log('================================\\n');
  
  try {
    // 检查输入文件
    if (!fs.existsSync(WORKFLOW_PATH)) {
      console.error(`❌ 工作流文件不存在: ${WORKFLOW_PATH}`);
      process.exit(1);
    }
    
    if (!fs.existsSync(NOTION_CONFIG_PATH)) {
      console.error(`❌ Notion配置文件不存在: ${NOTION_CONFIG_PATH}`);
      process.exit(1);
    }
    
    // 执行集成
    integrateNotionStorage();
    
    // 验证结果
    if (validateIntegration()) {
      console.log('\\n🎉 Notion存储节点集成成功完成!');
      console.log('\\n📝 后续步骤:');
      console.log('   1. 配置环境变量');
      console.log('   2. 导入工作流到n8n');
      console.log('   3. 测试端到端流程');
    } else {
      console.error('\\n❌ 集成验证失败，请检查配置');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\\n💥 集成过程中发生错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  integrateNotionStorage,
  validateIntegration
};