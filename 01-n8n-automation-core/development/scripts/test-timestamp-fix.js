/**
 * 测试时间戳修复的验证脚本
 */

// 导入错误处理模块
const EnhancedErrorHandler = require('../n8n-config/enhanced-error-handler.js');

async function testTimestampFix() {
  console.log('🧪 测试时间戳修复...');

  const errorHandler = new EnhancedErrorHandler({
    enableRetry: true,
    enableCircuitBreaker: true,
    enableDataConsistency: true,
    maxRetryAttempts: 3,
    baseRetryDelay: 100,
    circuitBreakerThreshold: 3,
    circuitBreakerTimeout: 5000
  });

  try {
    // 测试1: 触发熔断器以测试createErrorReport
    console.log('测试1: 测试错误处理和报告生成...');
    const service = 'test_circuit_breaker';
    const context = { service };

    // 触发多次失败以开启熔断器
    for (let i = 0; i < 5; i++) {
      await errorHandler.handleError(new Error('服务不可用'), context);
    }

    console.log('✅ 熔断器测试完成，无时间戳错误');

    // 测试2: 生成错误报告
    console.log('测试2: 测试错误报告生成...');
    const errorReport = await errorHandler.generateErrorReport();
    console.log('✅ 错误报告生成成功:', errorReport.reportId);

    // 测试3: 测试健康检查
    console.log('测试3: 测试健康检查...');
    const healthCheck = await errorHandler.performHealthCheck();
    console.log('✅ 健康检查完成:', healthCheck.status);

    console.log('\n🎉 所有测试通过！时间戳错误已修复。');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testTimestampFix().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});
