#!/usr/bin/env node

/**
 * 验证Notion数据库结构脚本
 * 检查数据库字段配置是否符合设计要求
 */

const axios = require('axios');
require('dotenv').config();

/**
 * 获取数据库结构信息
 */
async function getDatabaseStructure() {
  console.log('🔍 获取Notion数据库结构...');
  
  try {
    const response = await axios.get(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_TOKEN}`,
        'Notion-Version': process.env.NOTION_VERSION || '2022-06-28'
      }
    });

    const database = response.data;
    console.log('✅ 数据库信息获取成功:');
    console.log(`   - 数据库ID: ${database.id}`);
    console.log(`   - 数据库标题: ${database.title[0]?.plain_text}`);
    console.log(`   - 属性数量: ${Object.keys(database.properties).length}`);
    console.log(`   - 创建时间: ${database.created_time}`);
    console.log(`   - 最后编辑: ${database.last_edited_time}`);

    return database;
    
  } catch (error) {
    console.log('❌ 获取数据库结构失败:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 验证必需字段
 */
function validateRequiredFields(properties) {
  console.log('\n🔍 验证必需字段...');
  
  const requiredFields = [
    // 基础内容字段
    '标题', '内容', '摘要',
    // 来源信息
    '来源', '作者', '原始URL', '发布日期',
    // 分类和标签
    '分类ID', '分类名称', '关键词',
    // 媒体资源
    '缩略图URL',
    // 状态和质量
    '质量分数', '处理状态', '审核状态',
    // 系统字段
    '城市ID', '评论开关',
    // 火鸟门户专用字段
    '火鸟文章ID', '阅读次数', '发布人ID'
  ];

  const missingFields = [];
  const presentFields = [];

  requiredFields.forEach(field => {
    if (properties[field]) {
      presentFields.push(field);
    } else {
      missingFields.push(field);
    }
  });

  console.log(`✅ 已配置字段 (${presentFields.length}/${requiredFields.length}):`);
  presentFields.forEach(field => {
    console.log(`   ✓ ${field} (${properties[field].type})`);
  });

  if (missingFields.length > 0) {
    console.log(`❌ 缺失字段 (${missingFields.length}):`);
    missingFields.forEach(field => {
      console.log(`   ✗ ${field}`);
    });
    return false;
  }

  return true;
}

/**
 * 验证选择字段选项
 */
function validateSelectOptions(properties) {
  console.log('\n🔍 验证选择字段选项...');
  
  const selectFieldValidations = {
    '来源': ['The Neuron', 'Futurepedia', 'Superhuman', 'The Rundown AI', 'GitHub项目', 'API采集'],
    '分类名称': ['科技资讯', '本地新闻', '生活资讯'],
    '处理状态': ['待处理', '已存储', '已发布', '已拒绝'],
    '审核状态': ['未审核', '已审核', '审核拒绝'],
    '附加属性': ['头条', '推荐', '加粗', '图文', '跳转']
  };

  let allValid = true;

  Object.entries(selectFieldValidations).forEach(([fieldName, expectedOptions]) => {
    const field = properties[fieldName];
    if (!field) {
      console.log(`❌ 字段 "${fieldName}" 不存在`);
      allValid = false;
      return;
    }

    if (field.type === 'select' || field.type === 'multi_select') {
      const actualOptions = field[field.type].options.map(opt => opt.name);
      const missingOptions = expectedOptions.filter(opt => !actualOptions.includes(opt));
      
      if (missingOptions.length === 0) {
        console.log(`✅ ${fieldName}: 所有选项已配置 (${actualOptions.length})`);
      } else {
        console.log(`⚠️  ${fieldName}: 缺少选项 ${missingOptions.join(', ')}`);
        console.log(`   现有选项: ${actualOptions.join(', ')}`);
      }
    } else {
      console.log(`❌ 字段 "${fieldName}" 类型不正确: ${field.type}`);
      allValid = false;
    }
  });

  return allValid;
}

/**
 * 验证字段类型
 */
function validateFieldTypes(properties) {
  console.log('\n🔍 验证字段类型...');
  
  const expectedTypes = {
    '标题': 'title',
    '短标题': 'rich_text',
    '内容': 'rich_text',
    '摘要': 'rich_text',
    '来源': 'select',
    '作者': 'rich_text',
    '原始URL': 'url',
    '来源网址': 'url',
    '发布日期': 'date',
    '分类ID': 'number',
    '分类名称': 'select',
    '关键词': 'multi_select',
    '缩略图URL': 'url',
    '图片集合': 'rich_text',
    '质量分数': 'number',
    '处理状态': 'select',
    '审核状态': 'select',
    '标题颜色': 'rich_text',
    '附加属性': 'multi_select',
    '排序权重': 'number',
    '城市ID': 'number',
    '评论开关': 'checkbox',
    '跳转地址': 'url',
    '火鸟文章ID': 'number',
    '阅读次数': 'number',
    '发布人ID': 'number',
    '错误信息': 'rich_text',
    '处理时间': 'number',
    'AI评估结果': 'rich_text',
    '重复检查结果': 'rich_text'
  };

  let allValid = true;
  const typeErrors = [];

  Object.entries(expectedTypes).forEach(([fieldName, expectedType]) => {
    const field = properties[fieldName];
    if (field) {
      if (field.type === expectedType) {
        console.log(`✅ ${fieldName}: ${field.type}`);
      } else {
        console.log(`❌ ${fieldName}: 期望 ${expectedType}, 实际 ${field.type}`);
        typeErrors.push(`${fieldName}: ${field.type} → ${expectedType}`);
        allValid = false;
      }
    }
  });

  if (typeErrors.length > 0) {
    console.log(`\n❌ 类型错误汇总 (${typeErrors.length}):`);
    typeErrors.forEach(error => console.log(`   ${error}`));
  }

  return allValid;
}

/**
 * 生成数据库结构报告
 */
function generateStructureReport(database) {
  const report = {
    database: {
      id: database.id,
      title: database.title[0]?.plain_text,
      url: database.url,
      created_time: database.created_time,
      last_edited_time: database.last_edited_time,
      properties_count: Object.keys(database.properties).length
    },
    properties: {},
    validation: {
      required_fields_valid: false,
      select_options_valid: false,
      field_types_valid: false,
      overall_valid: false
    }
  };

  // 记录所有属性
  Object.entries(database.properties).forEach(([name, prop]) => {
    report.properties[name] = {
      type: prop.type,
      id: prop.id
    };

    // 记录选择字段的选项
    if (prop.type === 'select' && prop.select?.options) {
      report.properties[name].options = prop.select.options.map(opt => ({
        name: opt.name,
        color: opt.color
      }));
    } else if (prop.type === 'multi_select' && prop.multi_select?.options) {
      report.properties[name].options = prop.multi_select.options.map(opt => ({
        name: opt.name,
        color: opt.color
      }));
    }
  });

  return report;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始验证Notion数据库结构...\n');

  try {
    // 1. 获取数据库结构
    const database = await getDatabaseStructure();

    // 2. 验证必需字段
    const requiredFieldsValid = validateRequiredFields(database.properties);

    // 3. 验证选择字段选项
    const selectOptionsValid = validateSelectOptions(database.properties);

    // 4. 验证字段类型
    const fieldTypesValid = validateFieldTypes(database.properties);

    // 5. 生成报告
    const report = generateStructureReport(database);
    report.validation.required_fields_valid = requiredFieldsValid;
    report.validation.select_options_valid = selectOptionsValid;
    report.validation.field_types_valid = fieldTypesValid;
    report.validation.overall_valid = requiredFieldsValid && selectOptionsValid && fieldTypesValid;

    // 6. 保存报告
    const fs = require('fs');
    const reportPath = 'logs/notion-database-structure-report.json';
    
    // 确保目录存在
    const path = require('path');
    const logDir = path.dirname(reportPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 结构报告已保存到: ${reportPath}`);

    // 7. 输出验证结果
    console.log('\n📋 验证结果汇总:');
    console.log(`   必需字段: ${requiredFieldsValid ? '✅ 通过' : '❌ 失败'}`);
    console.log(`   选择选项: ${selectOptionsValid ? '✅ 通过' : '❌ 失败'}`);
    console.log(`   字段类型: ${fieldTypesValid ? '✅ 通过' : '❌ 失败'}`);
    console.log(`   整体验证: ${report.validation.overall_valid ? '✅ 通过' : '❌ 失败'}`);

    if (report.validation.overall_valid) {
      console.log('\n🎉 Notion数据库结构验证通过！');
      console.log(`📊 数据库包含 ${report.database.properties_count} 个属性字段`);
      console.log(`🔗 访问数据库: ${database.url}`);
    } else {
      console.log('\n⚠️  数据库结构需要调整，请检查上述错误信息');
    }

  } catch (error) {
    console.log('\n❌ 数据库结构验证失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getDatabaseStructure,
  validateRequiredFields,
  validateSelectOptions,
  validateFieldTypes,
  generateStructureReport
};