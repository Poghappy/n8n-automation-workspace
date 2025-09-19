#!/usr/bin/env node

/**
 * 火鸟门户新闻自动化工作流 - Notion数据库创建脚本
 * 
 * 此脚本用于创建完整的Notion新闻内容库数据库，包含所有必要的字段和属性选项
 * 严格按照设计文档中的数据库结构规范
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

// 加载数据库架构
const schemaPath = path.join(__dirname, '../n8n-config/notion-database-schema.json');
const databaseSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

/**
 * 创建Notion数据库
 */
async function createNotionDatabase() {
  try {
    console.log('🚀 开始创建Notion新闻内容库数据库...');
    
    // 检查环境变量
    if (!process.env.NOTION_API_TOKEN) {
      throw new Error('❌ 缺少NOTION_API_TOKEN环境变量');
    }

    // 创建数据库
    const database = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: process.env.NOTION_PARENT_PAGE_ID || 'workspace', // 需要用户提供父页面ID
      },
      title: [
        {
          type: 'text',
          text: {
            content: databaseSchema.database_name,
          },
        },
      ],
      description: [
        {
          type: 'text',
          text: {
            content: databaseSchema.description,
          },
        },
      ],
      icon: {
        type: 'emoji',
        emoji: databaseSchema.icon,
      },
      properties: databaseSchema.properties,
    });

    console.log('✅ Notion数据库创建成功！');
    console.log(`📊 数据库ID: ${database.id}`);
    console.log(`🔗 数据库URL: ${database.url}`);

    // 更新配置文件
    await updateNotionConfig(database);

    // 验证数据库结构
    await validateDatabaseStructure(database.id);

    console.log('🎉 Notion数据库配置完成！');
    
    return database;

  } catch (error) {
    console.error('❌ 创建Notion数据库失败:', error.message);
    
    if (error.code === 'validation_error') {
      console.error('💡 请检查:');
      console.error('   1. NOTION_API_TOKEN是否正确');
      console.error('   2. Notion集成是否有足够权限');
      console.error('   3. 父页面ID是否存在且可访问');
    }
    
    throw error;
  }
}

/**
 * 更新Notion配置文件
 */
async function updateNotionConfig(database) {
  const configPath = path.join(__dirname, '../n8n-config/notion-config.json');
  
  const config = {
    notion: {
      databaseId: database.id,
      databaseTitle: databaseSchema.database_name,
      databaseUrl: database.url,
      apiVersion: '2022-06-28',
      createdAt: new Date().toISOString(),
    },
    n8nNodeConfig: {
      name: 'Notion存储节点',
      type: 'n8n-nodes-base.notion',
      typeVersion: 2,
      position: [900, 300],
      parameters: {
        resource: 'databasePage',
        operation: 'create',
        databaseId: database.id,
        title: '={{$json.标题}}',
        propertiesUi: {
          propertyValues: generatePropertyMappings(),
        },
        options: {
          iconType: 'emoji',
          iconEmoji: '📰',
        },
      },
      credentials: {
        notionApi: {
          id: 'notion_api_credentials',
          name: 'Notion API凭据',
        },
      },
    },
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('📝 已更新Notion配置文件');
}

/**
 * 生成n8n节点属性映射
 */
function generatePropertyMappings() {
  return [
    // 基础内容字段
    {
      key: '短标题',
      type: 'rich_text',
      richTextValue: '={{$json.短标题 || ""}}',
    },
    {
      key: '内容',
      type: 'rich_text',
      richTextValue: '={{$json.内容}}',
    },
    {
      key: '摘要',
      type: 'rich_text',
      richTextValue: '={{$json.摘要 || ""}}',
    },
    
    // 来源信息
    {
      key: '来源',
      type: 'select',
      selectValue: '={{$json.来源 || "API采集"}}',
    },
    {
      key: '作者',
      type: 'rich_text',
      richTextValue: '={{$json.作者 || "AI采集"}}',
    },
    {
      key: '原始URL',
      type: 'url',
      urlValue: '={{$json.原始URL || ""}}',
    },
    {
      key: '来源网址',
      type: 'url',
      urlValue: '={{$json.来源网址 || ""}}',
    },
    {
      key: '发布日期',
      type: 'date',
      dateValue: '={{$json.发布日期 || new Date().toISOString()}}',
    },
    
    // 分类和标签
    {
      key: '分类ID',
      type: 'number',
      numberValue: '={{$json.分类ID || 1}}',
    },
    {
      key: '分类名称',
      type: 'select',
      selectValue: '={{$json.分类名称 || "科技资讯"}}',
    },
    {
      key: '关键词',
      type: 'multi_select',
      multiSelectValue: '={{$json.关键词 ? ($json.关键词.constructor === Array ? $json.关键词 : $json.关键词.split(",").map(k => k.trim())) : []}}',
    },
    
    // 媒体资源
    {
      key: '缩略图URL',
      type: 'url',
      urlValue: '={{$json.缩略图URL || ""}}',
    },
    {
      key: '图片集合',
      type: 'rich_text',
      richTextValue: '={{$json.图片集合 || ""}}',
    },
    
    // 状态和质量
    {
      key: '质量分数',
      type: 'number',
      numberValue: '={{$json.质量分数 || 0}}',
    },
    {
      key: '相关性分数',
      type: 'number',
      numberValue: '={{$json.相关性分数 || 0}}',
    },
    {
      key: '处理状态',
      type: 'select',
      selectValue: '已存储',
    },
    {
      key: '审核状态',
      type: 'select',
      selectValue: '未审核',
    },
    
    // 显示属性
    {
      key: '标题颜色',
      type: 'rich_text',
      richTextValue: '={{$json.标题颜色 || ""}}',
    },
    {
      key: '附加属性',
      type: 'multi_select',
      multiSelectValue: '={{$json.附加属性 ? ($json.附加属性.constructor === Array ? $json.附加属性 : $json.附加属性.split(",").map(a => a.trim())) : []}}',
    },
    {
      key: '排序权重',
      type: 'number',
      numberValue: '={{$json.排序权重 || 1}}',
    },
    
    // 系统字段
    {
      key: '城市ID',
      type: 'number',
      numberValue: 1, // 固定为1（夏威夷）
    },
    {
      key: '评论开关',
      type: 'checkbox',
      checkboxValue: true, // 默认允许评论
    },
    {
      key: '跳转地址',
      type: 'url',
      urlValue: '={{$json.跳转地址 || ""}}',
    },
    
    // 火鸟门户专用字段
    {
      key: '火鸟文章ID',
      type: 'number',
      numberValue: '={{$json.火鸟文章ID || 0}}',
    },
    {
      key: '阅读次数',
      type: 'number',
      numberValue: '={{$json.阅读次数 || 0}}',
    },
    {
      key: '发布人ID',
      type: 'number',
      numberValue: '={{$json.发布人ID || 1}}',
    },
    
    // 处理记录
    {
      key: '错误信息',
      type: 'rich_text',
      richTextValue: '={{$json.错误信息 || ""}}',
    },
    {
      key: '处理时间',
      type: 'number',
      numberValue: '={{$json.处理时间 || 0}}',
    },
    {
      key: 'AI评估结果',
      type: 'rich_text',
      richTextValue: '={{$json.AI评估结果 || ""}}',
    },
    {
      key: '重复检查结果',
      type: 'rich_text',
      richTextValue: '={{$json.重复检查结果 || ""}}',
    },
    {
      key: '请求ID',
      type: 'rich_text',
      richTextValue: '={{$json.请求ID || ""}}',
    },
  ];
}

/**
 * 验证数据库结构
 */
async function validateDatabaseStructure(databaseId) {
  try {
    console.log('🔍 验证数据库结构...');
    
    const database = await notion.databases.retrieve({
      database_id: databaseId,
    });

    const properties = Object.keys(database.properties);
    const expectedProperties = Object.keys(databaseSchema.properties);
    
    console.log(`📊 数据库包含 ${properties.length} 个字段`);
    console.log(`✅ 预期字段数: ${expectedProperties.length}`);
    
    // 检查缺失字段
    const missingProperties = expectedProperties.filter(prop => !properties.includes(prop));
    if (missingProperties.length > 0) {
      console.warn('⚠️  缺失字段:', missingProperties);
    }
    
    // 检查额外字段
    const extraProperties = properties.filter(prop => !expectedProperties.includes(prop));
    if (extraProperties.length > 0) {
      console.log('ℹ️  额外字段:', extraProperties);
    }
    
    console.log('✅ 数据库结构验证完成');
    
  } catch (error) {
    console.error('❌ 数据库结构验证失败:', error.message);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const database = await createNotionDatabase();
    
    console.log('\n🎯 下一步操作:');
    console.log('1. 将数据库ID添加到.env文件中的NOTION_DATABASE_ID变量');
    console.log('2. 运行测试脚本验证连接: npm run test:notion');
    console.log('3. 在n8n中导入更新后的工作流配置');
    
    return database;
    
  } catch (error) {
    console.error('\n💥 脚本执行失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  createNotionDatabase,
  validateDatabaseStructure,
};