#!/usr/bin/env node

/**
 * 火鸟门户新闻自动化工作流 - Notion API连接测试脚本
 * 
 * 此脚本用于测试和验证Notion API集成的各项功能
 * 包括连接测试、数据库操作、数据写入和查询等
 */

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

// 加载环境变量
require('dotenv').config();

// 初始化Notion客户端
const notion = new Client({
  auth: process.env.NOTION_API_TOKEN,
});

// 测试结果记录
const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
  },
};

/**
 * 记录测试结果
 */
function recordTest(name, success, details = null, error = null) {
  const test = {
    name,
    success,
    details,
    error: error ? error.message : null,
    timestamp: new Date().toISOString(),
  };
  
  testResults.tests.push(test);
  testResults.summary.total++;
  
  if (success) {
    testResults.summary.passed++;
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    testResults.summary.failed++;
    console.log(`❌ ${name}`);
    if (error) console.log(`   错误: ${error.message}`);
  }
}

/**
 * 测试1: 基础连接测试
 */
async function testBasicConnection() {
  try {
    console.log('\n🔍 测试1: Notion API基础连接...');
    
    // 检查环境变量
    if (!process.env.NOTION_API_TOKEN) {
      throw new Error('缺少NOTION_API_TOKEN环境变量');
    }
    
    // 测试API连接
    const response = await notion.users.me();
    
    recordTest(
      '基础连接测试',
      true,
      `连接成功，用户: ${response.name || response.id}`
    );
    
    return response;
    
  } catch (error) {
    recordTest('基础连接测试', false, null, error);
    throw error;
  }
}

/**
 * 测试2: 数据库访问测试
 */
async function testDatabaseAccess() {
  try {
    console.log('\n🔍 测试2: 数据库访问权限...');
    
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) {
      throw new Error('缺少NOTION_DATABASE_ID环境变量');
    }
    
    // 获取数据库信息
    const database = await notion.databases.retrieve({
      database_id: databaseId,
    });
    
    recordTest(
      '数据库访问测试',
      true,
      `数据库: ${database.title[0]?.plain_text || '未命名'}, 字段数: ${Object.keys(database.properties).length}`
    );
    
    return database;
    
  } catch (error) {
    recordTest('数据库访问测试', false, null, error);
    throw error;
  }
}

/**
 * 测试3: 数据库结构验证
 */
async function testDatabaseStructure(database) {
  try {
    console.log('\n🔍 测试3: 数据库结构验证...');
    
    // 加载预期的数据库结构
    const schemaPath = path.join(__dirname, '../n8n-config/notion-database-schema.json');
    const expectedSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    
    const actualProperties = Object.keys(database.properties);
    const expectedProperties = Object.keys(expectedSchema.properties);
    
    // 检查必需字段
    const requiredFields = [
      '标题', '内容', '来源', '发布日期', '分类ID', '处理状态', '审核状态'
    ];
    
    const missingRequired = requiredFields.filter(field => !actualProperties.includes(field));
    
    if (missingRequired.length > 0) {
      throw new Error(`缺少必需字段: ${missingRequired.join(', ')}`);
    }
    
    recordTest(
      '数据库结构验证',
      true,
      `包含 ${actualProperties.length} 个字段，所有必需字段都存在`
    );
    
    // 详细字段类型检查
    const fieldTypeErrors = [];
    for (const [fieldName, fieldConfig] of Object.entries(expectedSchema.properties)) {
      if (database.properties[fieldName]) {
        const actualType = database.properties[fieldName].type;
        const expectedType = fieldConfig.type;
        
        if (actualType !== expectedType) {
          fieldTypeErrors.push(`${fieldName}: 期望 ${expectedType}, 实际 ${actualType}`);
        }
      }
    }
    
    if (fieldTypeErrors.length > 0) {
      console.warn('⚠️  字段类型不匹配:', fieldTypeErrors);
    }
    
    return {
      actualProperties,
      expectedProperties,
      fieldTypeErrors,
    };
    
  } catch (error) {
    recordTest('数据库结构验证', false, null, error);
    throw error;
  }
}

/**
 * 测试4: 数据写入测试
 */
async function testDataWrite() {
  try {
    console.log('\n🔍 测试4: 数据写入测试...');
    
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    // 创建测试数据
    const testData = {
      parent: {
        database_id: databaseId,
      },
      properties: {
        '标题': {
          title: [
            {
              text: {
                content: `测试新闻标题 - ${new Date().toLocaleString()}`,
              },
            },
          ],
        },
        '短标题': {
          rich_text: [
            {
              text: {
                content: '测试短标题',
              },
            },
          ],
        },
        '内容': {
          rich_text: [
            {
              text: {
                content: '这是一条测试新闻内容，用于验证Notion API集成功能是否正常工作。',
              },
            },
          ],
        },
        '摘要': {
          rich_text: [
            {
              text: {
                content: '测试新闻摘要，验证API集成功能。',
              },
            },
          ],
        },
        '来源': {
          select: {
            name: 'API采集',
          },
        },
        '作者': {
          rich_text: [
            {
              text: {
                content: 'AI测试',
              },
            },
          ],
        },
        '发布日期': {
          date: {
            start: new Date().toISOString(),
          },
        },
        '分类ID': {
          number: 1,
        },
        '分类名称': {
          select: {
            name: '科技资讯',
          },
        },
        '关键词': {
          multi_select: [
            { name: 'AI' },
            { name: '测试' },
          ],
        },
        '质量分数': {
          number: 85,
        },

        '处理状态': {
          select: {
            name: '已存储',
          },
        },
        '审核状态': {
          select: {
            name: '未审核',
          },
        },
        '城市ID': {
          number: 1,
        },
        '评论开关': {
          checkbox: true,
        },
        '排序权重': {
          number: 1,
        },
        '发布人ID': {
          number: 1,
        },

      },
    };
    
    // 写入测试数据
    const page = await notion.pages.create(testData);
    
    recordTest(
      '数据写入测试',
      true,
      `成功创建测试页面: ${page.id}`
    );
    
    return page;
    
  } catch (error) {
    recordTest('数据写入测试', false, null, error);
    throw error;
  }
}

/**
 * 测试5: 数据查询测试
 */
async function testDataQuery() {
  try {
    console.log('\n🔍 测试5: 数据查询测试...');
    
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    // 查询最近的测试数据
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: '来源',
        select: {
          equals: 'API采集',
        },
      },
      sorts: [
        {
          property: '创建时间',
          direction: 'descending',
        },
      ],
      page_size: 5,
    });
    
    recordTest(
      '数据查询测试',
      true,
      `查询到 ${response.results.length} 条记录`
    );
    
    return response;
    
  } catch (error) {
    recordTest('数据查询测试', false, null, error);
    throw error;
  }
}

/**
 * 测试6: 数据更新测试
 */
async function testDataUpdate(testPage) {
  try {
    console.log('\n🔍 测试6: 数据更新测试...');
    
    if (!testPage) {
      throw new Error('没有可用的测试页面进行更新测试');
    }
    
    // 更新测试数据
    const updatedPage = await notion.pages.update({
      page_id: testPage.id,
      properties: {
        '处理状态': {
          select: {
            name: '已发布',
          },
        },
        '火鸟文章ID': {
          number: 12345,
        },
        '阅读次数': {
          number: 100,
        },
      },
    });
    
    recordTest(
      '数据更新测试',
      true,
      `成功更新页面: ${updatedPage.id}`
    );
    
    return updatedPage;
    
  } catch (error) {
    recordTest('数据更新测试', false, null, error);
    throw error;
  }
}

/**
 * 测试7: 错误处理测试
 */
async function testErrorHandling() {
  try {
    console.log('\n🔍 测试7: 错误处理测试...');
    
    // 测试无效数据库ID
    try {
      await notion.databases.retrieve({
        database_id: 'invalid-database-id',
      });
      
      recordTest('错误处理测试', false, null, new Error('应该抛出错误但没有'));
      
    } catch (error) {
      if (error.code === 'validation_error' || error.code === 'object_not_found') {
        recordTest(
          '错误处理测试',
          true,
          `正确捕获错误: ${error.code}`
        );
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    recordTest('错误处理测试', false, null, error);
    throw error;
  }
}

/**
 * 测试8: 性能测试
 */
async function testPerformance() {
  try {
    console.log('\n🔍 测试8: 性能测试...');
    
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    // 测试查询性能
    const startTime = Date.now();
    
    await notion.databases.query({
      database_id: databaseId,
      page_size: 10,
    });
    
    const queryTime = Date.now() - startTime;
    
    // 测试写入性能
    const writeStartTime = Date.now();
    
    const testPage = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        '标题': {
          title: [
            {
              text: {
                content: `性能测试 - ${new Date().toLocaleString()}`,
              },
            },
          ],
        },
        '内容': {
          rich_text: [
            {
              text: {
                content: '性能测试内容',
              },
            },
          ],
        },
        '来源': {
          select: {
            name: 'API采集',
          },
        },
        '处理状态': {
          select: {
            name: '已存储',
          },
        },
      },
    });
    
    const writeTime = Date.now() - writeStartTime;
    
    recordTest(
      '性能测试',
      true,
      `查询耗时: ${queryTime}ms, 写入耗时: ${writeTime}ms`
    );
    
    // 清理测试数据
    try {
      await notion.pages.update({
        page_id: testPage.id,
        archived: true,
      });
    } catch (cleanupError) {
      console.warn('⚠️  清理测试数据失败:', cleanupError.message);
    }
    
    return { queryTime, writeTime };
    
  } catch (error) {
    recordTest('性能测试', false, null, error);
    throw error;
  }
}

/**
 * 清理测试数据
 */
async function cleanupTestData() {
  try {
    console.log('\n🧹 清理测试数据...');
    
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    // 查询测试数据
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        or: [
          {
            property: '标题',
            title: {
              contains: '测试',
            },
          },
          {
            property: '标题',
            title: {
              contains: '性能测试',
            },
          },
        ],
      },
    });
    
    // 归档测试数据
    let cleanedCount = 0;
    for (const page of response.results) {
      try {
        await notion.pages.update({
          page_id: page.id,
          archived: true,
        });
        cleanedCount++;
      } catch (error) {
        console.warn(`⚠️  清理页面 ${page.id} 失败:`, error.message);
      }
    }
    
    console.log(`✅ 已清理 ${cleanedCount} 条测试数据`);
    
  } catch (error) {
    console.warn('⚠️  清理测试数据失败:', error.message);
  }
}

/**
 * 生成测试报告
 */
function generateTestReport() {
  const reportPath = path.join(__dirname, '../logs/notion-integration-test-report.json');
  
  // 确保logs目录存在
  const logsDir = path.dirname(reportPath);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // 写入测试报告
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  
  console.log(`\n📊 测试报告已生成: ${reportPath}`);
  console.log(`📈 测试总结: ${testResults.summary.passed}/${testResults.summary.total} 通过`);
  
  if (testResults.summary.failed > 0) {
    console.log('❌ 失败的测试:');
    testResults.tests
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`);
      });
  }
}

/**
 * 主测试函数
 */
async function runAllTests() {
  console.log('🚀 开始Notion API集成测试...\n');
  
  let testPage = null;
  
  try {
    // 运行所有测试
    await testBasicConnection();
    const database = await testDatabaseAccess();
    await testDatabaseStructure(database);
    testPage = await testDataWrite();
    await testDataQuery();
    await testDataUpdate(testPage);
    await testErrorHandling();
    await testPerformance();
    
    console.log('\n🎉 所有测试完成！');
    
  } catch (error) {
    console.error('\n💥 测试过程中发生错误:', error.message);
  } finally {
    // 清理测试数据
    await cleanupTestData();
    
    // 生成测试报告
    generateTestReport();
  }
  
  // 返回测试结果
  return testResults;
}

/**
 * 快速连接测试
 */
async function quickTest() {
  console.log('⚡ 快速连接测试...\n');
  
  try {
    await testBasicConnection();
    await testDatabaseAccess();
    
    console.log('\n✅ 快速测试通过！Notion集成配置正确。');
    
  } catch (error) {
    console.error('\n❌ 快速测试失败:', error.message);
    console.error('\n💡 请检查:');
    console.error('   1. NOTION_API_TOKEN是否正确');
    console.error('   2. NOTION_DATABASE_ID是否正确');
    console.error('   3. Notion集成是否有足够权限');
    
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--quick')) {
    quickTest();
  } else {
    runAllTests();
  }
}

module.exports = {
  runAllTests,
  quickTest,
  testBasicConnection,
  testDatabaseAccess,
  testDatabaseStructure,
  testDataWrite,
  testDataQuery,
  testDataUpdate,
};