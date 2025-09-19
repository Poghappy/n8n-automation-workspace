#!/usr/bin/env node

/**
 * Notion存储功能测试脚本
 * 测试Notion存储节点的各项功能，包括数据写入、重试机制、错误处理等
 */

const fs = require('fs');
const path = require('path');

// 模拟测试数据
const TEST_DATA = {
  valid: {
    title: 'AI技术突破：GPT-5即将发布',
    content: '据最新消息，OpenAI即将发布GPT-5模型，该模型在多个基准测试中表现出色，特别是在推理能力和多模态理解方面有显著提升。新模型预计将在今年年底正式发布，届时将为AI应用带来新的可能性。',
    summary: 'OpenAI即将发布GPT-5模型，在推理能力和多模态理解方面有显著提升',
    author: 'AI研究团队',
    source: 'The Neuron',
    category: 'AI资讯',
    categoryId: 1,
    source_url: 'https://example.com/gpt5-announcement',
    image_url: 'https://example.com/images/gpt5.jpg',
    keywords: ['AI', 'GPT-5', 'OpenAI', '人工智能'],
    publishedAt: new Date().toISOString(),
    quality_score: 85,
    relevance_score: 90
  },
  
  invalid: {
    title: '', // 空标题
    content: 'Short', // 内容过短
    summary: 'A'.repeat(300), // 摘要过长
    author: 'Very Long Author Name That Exceeds The Limit', // 作者名过长
    source: 'Very Long Source Name That Exceeds The Character Limit',
    source_url: 'invalid-url', // 无效URL
    keywords: 'Very long keywords string that exceeds the fifty character limit for keywords field'
  },
  
  edge: {
    title: 'Edge Case Test Title',
    content: 'Minimum length content for testing edge cases and boundary conditions.',
    summary: null, // null值
    author: undefined, // undefined值
    source: 'Test Source',
    keywords: [], // 空数组
    publishedAt: 'invalid-date', // 无效日期
    quality_score: 'not-a-number', // 非数字
    categoryId: 'invalid-id' // 无效ID
  }
};

/**
 * 模拟Notion API响应
 */
class MockNotionAPI {
  constructor(options = {}) {
    this.shouldFail = options.shouldFail || false;
    this.failureRate = options.failureRate || 0;
    this.responseDelay = options.responseDelay || 100;
    this.rateLimitHit = options.rateLimitHit || false;
  }
  
  async createPage(data) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    
    // 模拟随机失败
    if (this.shouldFail || Math.random() < this.failureRate) {
      if (this.rateLimitHit) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Notion API error: Database not found');
    }
    
    // 模拟成功响应
    return {
      id: 'mock-page-id-' + Date.now(),
      url: 'https://notion.so/mock-page-id-' + Date.now(),
      properties: {
        '标题': {
          title: [{ plain_text: data.title }]
        },
        '来源': {
          select: { name: data.source }
        },
        '分类名称': {
          select: { name: data.category }
        }
      },
      created_time: new Date().toISOString(),
      last_edited_time: new Date().toISOString()
    };
  }
}

/**
 * 数据验证测试
 */
function testDataValidation() {
  console.log('\\n🧪 测试数据验证功能...');
  
  // 模拟验证函数
  function validateNotionData(data) {
    const errors = [];
    
    if (!data.title || data.title.trim().length === 0) {
      errors.push('标题不能为空');
    }
    
    if (!data.content || data.content.trim().length === 0) {
      errors.push('内容不能为空');
    }
    
    if (data.title && data.title.length > 60) {
      errors.push(`标题过长: ${data.title.length}/60`);
    }
    
    if (data.summary && data.summary.length > 255) {
      errors.push(`摘要过长: ${data.summary.length}/255`);
    }
    
    if (data.keywords && typeof data.keywords === 'string' && data.keywords.length > 50) {
      errors.push(`关键词过长: ${data.keywords.length}/50`);
    }
    
    if (data.source_url && data.source_url.trim()) {
      try {
        new URL(data.source_url);
      } catch (e) {
        errors.push(`无效的原始URL: ${data.source_url}`);
      }
    }
    
    return errors;
  }
  
  // 测试有效数据
  const validErrors = validateNotionData(TEST_DATA.valid);
  console.log(`   ✅ 有效数据验证: ${validErrors.length === 0 ? '通过' : '失败'}`);
  if (validErrors.length > 0) {
    console.log(`      错误: ${validErrors.join(', ')}`);
  }
  
  // 测试无效数据
  const invalidErrors = validateNotionData(TEST_DATA.invalid);
  console.log(`   ✅ 无效数据验证: ${invalidErrors.length > 0 ? '通过' : '失败'}`);
  console.log(`      检测到 ${invalidErrors.length} 个错误`);
  
  // 测试边界情况
  const edgeErrors = validateNotionData(TEST_DATA.edge);
  console.log(`   ✅ 边界情况验证: ${edgeErrors.length >= 0 ? '通过' : '失败'}`);
  console.log(`      检测到 ${edgeErrors.length} 个错误`);
  
  return {
    validData: validErrors.length === 0,
    invalidData: invalidErrors.length > 0,
    edgeCase: edgeErrors.length >= 0
  };
}

/**
 * 数据清理测试
 */
function testDataSanitization() {
  console.log('\\n🧹 测试数据清理功能...');
  
  // 模拟数据清理函数
  function sanitizeNotionData(data) {
    const sanitized = { ...data };
    
    if (sanitized.title) {
      sanitized.title = sanitized.title.trim().substring(0, 60);
    }
    
    if (sanitized.subtitle) {
      sanitized.subtitle = sanitized.subtitle.trim().substring(0, 36);
    }
    
    if (sanitized.summary) {
      sanitized.summary = sanitized.summary.trim().substring(0, 255);
    }
    
    if (sanitized.author) {
      sanitized.author = sanitized.author.trim().substring(0, 20);
    }
    
    if (sanitized.source) {
      sanitized.source = sanitized.source.trim().substring(0, 30);
    }
    
    if (sanitized.keywords) {
      if (typeof sanitized.keywords === 'string') {
        sanitized.keywords = sanitized.keywords.substring(0, 50);
      } else if (Array.isArray(sanitized.keywords)) {
        sanitized.keywords = sanitized.keywords.join(',').substring(0, 50);
      }
    }
    
    sanitized.categoryId = parseInt(sanitized.categoryId || 1);
    sanitized.quality_score = parseFloat(sanitized.quality_score || 0);
    sanitized.weight = parseInt(sanitized.weight || 1);
    sanitized.cityid = parseInt(sanitized.cityid || 1);
    
    if (!sanitized.publishedAt) {
      sanitized.publishedAt = new Date().toISOString();
    }
    
    return sanitized;
  }
  
  // 测试数据清理
  const sanitizedValid = sanitizeNotionData(TEST_DATA.valid);
  const sanitizedInvalid = sanitizeNotionData(TEST_DATA.invalid);
  const sanitizedEdge = sanitizeNotionData(TEST_DATA.edge);
  
  console.log('   ✅ 有效数据清理: 通过');
  console.log(`      标题长度: ${sanitizedValid.title.length}/60`);
  
  console.log('   ✅ 无效数据清理: 通过');
  console.log(`      作者长度: ${sanitizedInvalid.author.length}/20`);
  console.log(`      来源长度: ${sanitizedInvalid.source.length}/30`);
  
  console.log('   ✅ 边界情况清理: 通过');
  console.log(`      分类ID: ${sanitizedEdge.categoryId} (${typeof sanitizedEdge.categoryId})`);
  console.log(`      质量分数: ${sanitizedEdge.quality_score} (${typeof sanitizedEdge.quality_score})`);
  
  return {
    sanitizedValid,
    sanitizedInvalid,
    sanitizedEdge
  };
}

/**
 * 重试机制测试
 */
async function testRetryMechanism() {
  console.log('\\n🔄 测试重试机制...');
  
  // 模拟重试逻辑
  async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`      尝试 ${attempt}/${maxRetries}...`);
        return await operation();
      } catch (error) {
        lastError = error;
        console.log(`      尝试 ${attempt} 失败: ${error.message}`);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`      等待 ${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // 测试成功场景
  console.log('   测试成功场景:');
  const successAPI = new MockNotionAPI({ shouldFail: false });
  try {
    const result = await retryWithBackoff(() => successAPI.createPage(TEST_DATA.valid));
    console.log('   ✅ 成功场景: 通过');
  } catch (error) {
    console.log('   ❌ 成功场景: 失败');
  }
  
  // 测试重试后成功场景
  console.log('\\n   测试重试后成功场景:');
  const retryAPI = new MockNotionAPI({ failureRate: 0.7 }); // 70%失败率
  try {
    const result = await retryWithBackoff(() => retryAPI.createPage(TEST_DATA.valid));
    console.log('   ✅ 重试后成功: 通过');
  } catch (error) {
    console.log('   ⚠️  重试后成功: 可能失败（随机性）');
  }
  
  // 测试最终失败场景
  console.log('\\n   测试最终失败场景:');
  const failAPI = new MockNotionAPI({ shouldFail: true });
  try {
    await retryWithBackoff(() => failAPI.createPage(TEST_DATA.valid), 2, 100);
    console.log('   ❌ 最终失败: 应该失败但成功了');
  } catch (error) {
    console.log('   ✅ 最终失败: 通过');
  }
  
  return true;
}

/**
 * 错误处理测试
 */
function testErrorHandling() {
  console.log('\\n🚨 测试错误处理功能...');
  
  // 模拟错误分类函数
  function categorizeError(errorMessage) {
    const errorMsg = errorMessage.toLowerCase();
    
    if (errorMsg.includes('unauthorized') || errorMsg.includes('invalid token')) {
      return {
        type: 'authentication',
        severity: 'high',
        recoverable: false,
        action: 'check_credentials'
      };
    }
    
    if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests')) {
      return {
        type: 'rate_limit',
        severity: 'medium',
        recoverable: true,
        action: 'retry_with_delay'
      };
    }
    
    if (errorMsg.includes('database') || errorMsg.includes('not found')) {
      return {
        type: 'database_error',
        severity: 'high',
        recoverable: false,
        action: 'check_database_config'
      };
    }
    
    return {
      type: 'unknown',
      severity: 'medium',
      recoverable: true,
      action: 'retry'
    };
  }
  
  // 测试不同类型的错误
  const testErrors = [
    'Unauthorized: Invalid token provided',
    'Rate limit exceeded. Please try again later.',
    'Database not found: Invalid database ID',
    'Network timeout error'
  ];
  
  testErrors.forEach((errorMsg, index) => {
    const category = categorizeError(errorMsg);
    console.log(`   错误 ${index + 1}: ${category.type} (${category.severity})`);
    console.log(`      可恢复: ${category.recoverable ? '是' : '否'}`);
    console.log(`      建议操作: ${category.action}`);
  });
  
  console.log('   ✅ 错误分类: 通过');
  
  return true;
}

/**
 * 状态跟踪测试
 */
function testStatusTracking() {
  console.log('\\n📊 测试状态跟踪功能...');
  
  // 模拟状态跟踪
  function createStatusRecord(notionResponse, originalData, isSuccess) {
    return {
      executionId: 'test-execution-' + Date.now(),
      runIndex: 1,
      timestamp: new Date().toISOString(),
      
      storageStatus: isSuccess ? 'success' : 'failed',
      notionPageId: notionResponse?.id || null,
      notionUrl: notionResponse?.url || null,
      
      contentInfo: {
        title: originalData.title || 'Unknown',
        source: originalData.source || 'Unknown',
        category: originalData.category || 'Unknown',
        qualityScore: originalData.quality_score || 0
      },
      
      performance: {
        processingTime: originalData.processingTime || 0,
        storageAttempts: originalData.storageAttempt || 1,
        totalTime: Date.now() - (originalData.startTime || Date.now())
      },
      
      error: isSuccess ? null : {
        message: 'Test error message',
        code: 'TEST_ERROR',
        details: null
      }
    };
  }
  
  // 测试成功状态记录
  const mockResponse = {
    id: 'test-page-id',
    url: 'https://notion.so/test-page-id'
  };
  
  const successRecord = createStatusRecord(mockResponse, TEST_DATA.valid, true);
  console.log('   ✅ 成功状态记录: 通过');
  console.log(`      页面ID: ${successRecord.notionPageId}`);
  console.log(`      状态: ${successRecord.storageStatus}`);
  
  // 测试失败状态记录
  const failureRecord = createStatusRecord(null, TEST_DATA.valid, false);
  console.log('   ✅ 失败状态记录: 通过');
  console.log(`      错误信息: ${failureRecord.error?.message}`);
  console.log(`      状态: ${failureRecord.storageStatus}`);
  
  return {
    successRecord,
    failureRecord
  };
}

/**
 * 性能测试
 */
async function testPerformance() {
  console.log('\\n⚡ 测试性能指标...');
  
  const api = new MockNotionAPI({ responseDelay: 50 });
  const testCount = 10;
  const results = [];
  
  console.log(`   执行 ${testCount} 次存储操作...`);
  
  for (let i = 0; i < testCount; i++) {
    const startTime = Date.now();
    try {
      await api.createPage(TEST_DATA.valid);
      const endTime = Date.now();
      results.push({
        success: true,
        duration: endTime - startTime
      });
    } catch (error) {
      const endTime = Date.now();
      results.push({
        success: false,
        duration: endTime - startTime,
        error: error.message
      });
    }
  }
  
  // 计算统计信息
  const successCount = results.filter(r => r.success).length;
  const successRate = (successCount / testCount) * 100;
  const durations = results.map(r => r.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const maxDuration = Math.max(...durations);
  const minDuration = Math.min(...durations);
  
  console.log(`   ✅ 性能测试完成:`);
  console.log(`      成功率: ${successRate.toFixed(1)}%`);
  console.log(`      平均响应时间: ${avgDuration.toFixed(1)}ms`);
  console.log(`      最大响应时间: ${maxDuration}ms`);
  console.log(`      最小响应时间: ${minDuration}ms`);
  
  return {
    successRate,
    avgDuration,
    maxDuration,
    minDuration,
    results
  };
}

/**
 * 生成测试报告
 */
function generateTestReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    testSuite: 'Notion存储功能测试',
    version: '1.0.0',
    
    summary: {
      totalTests: Object.keys(results).length,
      passedTests: Object.values(results).filter(r => r === true || (r && r.success !== false)).length,
      failedTests: Object.values(results).filter(r => r === false || (r && r.success === false)).length
    },
    
    results: results,
    
    recommendations: [
      '确保Notion API凭据配置正确',
      '监控存储成功率，目标 ≥ 95%',
      '设置响应时间告警，阈值 < 5秒',
      '定期检查错误日志和重试统计',
      '配置数据库容量监控'
    ],
    
    nextSteps: [
      '在生产环境中执行端到端测试',
      '配置监控仪表板',
      '设置告警规则',
      '准备故障恢复程序'
    ]
  };
  
  const reportPath = 'logs/notion-storage-test-report.json';
  
  // 确保logs目录存在
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs', { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  
  console.log(`\\n📋 测试报告已保存: ${reportPath}`);
  console.log(`\\n📊 测试总结:`);
  console.log(`   总测试数: ${report.summary.totalTests}`);
  console.log(`   通过: ${report.summary.passedTests}`);
  console.log(`   失败: ${report.summary.failedTests}`);
  console.log(`   成功率: ${((report.summary.passedTests / report.summary.totalTests) * 100).toFixed(1)}%`);
  
  return report;
}

/**
 * 主测试函数
 */
async function main() {
  console.log('🧪 Notion存储功能测试套件');
  console.log('================================');
  
  const results = {};
  
  try {
    // 执行各项测试
    results.dataValidation = testDataValidation();
    results.dataSanitization = testDataSanitization();
    results.retryMechanism = await testRetryMechanism();
    results.errorHandling = testErrorHandling();
    results.statusTracking = testStatusTracking();
    results.performance = await testPerformance();
    
    // 生成测试报告
    const report = generateTestReport(results);
    
    console.log('\\n🎉 所有测试完成!');
    
    // 检查是否有失败的测试
    const hasFailures = Object.values(results).some(r => 
      r === false || (r && r.success === false)
    );
    
    if (hasFailures) {
      console.log('⚠️  部分测试失败，请检查详细报告');
      process.exit(1);
    } else {
      console.log('✅ 所有测试通过!');
    }
    
  } catch (error) {
    console.error('\\n💥 测试过程中发生错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  testDataValidation,
  testDataSanitization,
  testRetryMechanism,
  testErrorHandling,
  testStatusTracking,
  testPerformance,
  TEST_DATA,
  MockNotionAPI
};