#!/usr/bin/env node

/**
 * 简化的Notion数据写入测试
 */

const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({
  auth: process.env.NOTION_API_TOKEN,
});

async function testSimpleWrite() {
  try {
    console.log('🔍 测试简化数据写入...');
    
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    // 创建最简单的测试数据
    const testData = {
      parent: {
        database_id: databaseId,
      },
      properties: {
        '标题': {
          title: [
            {
              text: {
                content: `测试新闻 - ${new Date().toLocaleString()}`,
              },
            },
          ],
        },
        '内容': {
          rich_text: [
            {
              text: {
                content: '这是一条测试新闻内容。',
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
        '审核状态': {
          select: {
            name: '未审核',
          },
        },
        '分类ID': {
          number: 1,
        },
        '城市ID': {
          number: 1,
        },
      },
    };
    
    // 写入测试数据
    const page = await notion.pages.create(testData);
    
    console.log(`✅ 数据写入成功: ${page.id}`);
    
    // 清理测试数据
    await notion.pages.update({
      page_id: page.id,
      archived: true,
    });
    
    console.log('✅ 测试数据已清理');
    
    return page;
    
  } catch (error) {
    console.error('❌ 数据写入测试失败:', error.message);
    throw error;
  }
}

if (require.main === module) {
  testSimpleWrite();
}

module.exports = { testSimpleWrite };