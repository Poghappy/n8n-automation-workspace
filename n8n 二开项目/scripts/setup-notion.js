#!/usr/bin/env node

/**
 * Notion API集成设置脚本
 * 创建Notion数据库并配置API集成
 */

const axios = require('axios');
require('dotenv').config();

/**
 * Notion数据库结构定义
 */
const notionDatabaseSchema = {
    title: [
        {
            type: "text",
            text: {
                content: "火鸟门户新闻内容库"
            }
        }
    ],
    properties: {
        // 基础内容字段
        "标题": {
            title: {}
        },
        "短标题": {
            rich_text: {}
        },
        "内容": {
            rich_text: {}
        },
        "摘要": {
            rich_text: {}
        },

        // 来源信息
        "来源": {
            select: {
                options: [
                    { name: "The Neuron", color: "blue" },
                    { name: "Futurepedia", color: "green" },
                    { name: "Superhuman", color: "orange" },
                    { name: "The Rundown AI", color: "purple" },
                    { name: "GitHub项目", color: "gray" },
                    { name: "API采集", color: "default" }
                ]
            }
        },
        "作者": {
            rich_text: {}
        },
        "原始URL": {
            url: {}
        },
        "来源网址": {
            url: {}
        },
        "发布日期": {
            date: {}
        },

        // 分类和标签 (对应火鸟门户分类)
        "分类ID": {
            number: {
                format: "number"
            }
        },
        "分类名称": {
            select: {
                options: [
                    { name: "科技资讯", color: "blue" },
                    { name: "本地新闻", color: "green" },
                    { name: "生活资讯", color: "yellow" },
                    { name: "商业财经", color: "orange" },
                    { name: "体育娱乐", color: "purple" },
                    { name: "健康医疗", color: "pink" },
                    { name: "教育培训", color: "brown" },
                    { name: "汽车交通", color: "red" },
                    { name: "房产家居", color: "gray" },
                    { name: "旅游美食", color: "default" }
                ]
            }
        },
        "关键词": {
            multi_select: {
                options: []
            }
        },

        // 媒体资源
        "缩略图URL": {
            url: {}
        },
        "图片集合": {
            rich_text: {}
        },

        // 状态和质量
        "质量分数": {
            number: {
                format: "number"
            }
        },
        "处理状态": {
            select: {
                options: [
                    { name: "待处理", color: "gray" },
                    { name: "已存储", color: "blue" },
                    { name: "已发布", color: "green" },
                    { name: "已拒绝", color: "red" }
                ]
            }
        },
        "审核状态": {
            select: {
                options: [
                    { name: "未审核", color: "gray" },
                    { name: "已审核", color: "green" },
                    { name: "审核拒绝", color: "red" }
                ]
            }
        },

        // 显示属性 (对应火鸟门户flag字段)
        "标题颜色": {
            rich_text: {}
        },
        "附加属性": {
            multi_select: {
                options: [
                    { name: "头条", color: "red" },
                    { name: "推荐", color: "blue" },
                    { name: "加粗", color: "orange" },
                    { name: "图文", color: "green" },
                    { name: "跳转", color: "purple" }
                ]
            }
        },
        "排序权重": {
            number: {
                format: "number"
            }
        },

        // 系统字段
        "城市ID": {
            number: {
                format: "number"
            }
        },
        "评论开关": {
            checkbox: {}
        },
        "跳转地址": {
            url: {}
        },

        // 火鸟门户专用字段
        "火鸟文章ID": {
            number: {
                format: "number"
            }
        },
        "阅读次数": {
            number: {
                format: "number"
            }
        },
        "发布人ID": {
            number: {
                format: "number"
            }
        },

        // 处理记录
        "错误信息": {
            rich_text: {}
        },
        "处理时间": {
            number: {
                format: "number"
            }
        },
        "AI评估结果": {
            rich_text: {}
        },
        "重复检查结果": {
            rich_text: {}
        }
    }
};

/**
 * 创建Notion数据库
 */
async function createNotionDatabase(parentPageId) {
    console.log('🏗️  创建Notion数据库...');

    try {
        const response = await axios.post('https://api.notion.com/v1/databases', {
            parent: {
                type: "page_id",
                page_id: parentPageId
            },
            ...notionDatabaseSchema
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.NOTION_API_TOKEN}`,
                'Content-Type': 'application/json',
                'Notion-Version': process.env.NOTION_VERSION || '2022-06-28'
            }
        });

        const database = response.data;
        console.log('✅ Notion数据库创建成功:');
        console.log(`   - 数据库ID: ${database.id}`);
        console.log(`   - 数据库标题: ${database.title[0]?.plain_text}`);
        console.log(`   - 属性数量: ${Object.keys(database.properties).length}`);
        console.log(`   - 数据库URL: ${database.url}`);

        return database;

    } catch (error) {
        console.log('❌ Notion数据库创建失败:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * 验证Notion API连接
 */
async function validateNotionConnection() {
    console.log('🔍 验证Notion API连接...');

    if (!process.env.NOTION_API_TOKEN) {
        throw new Error('NOTION_API_TOKEN环境变量未设置');
    }

    try {
        const response = await axios.get('https://api.notion.com/v1/users/me', {
            headers: {
                'Authorization': `Bearer ${process.env.NOTION_API_TOKEN}`,
                'Notion-Version': process.env.NOTION_VERSION || '2022-06-28'
            }
        });

        const user = response.data;
        console.log('✅ Notion API连接验证成功:');
        console.log(`   - 用户类型: ${user.type}`);
        console.log(`   - 用户名: ${user.name || 'Unknown'}`);
        console.log(`   - 头像: ${user.avatar_url ? '有' : '无'}`);

        return user;

    } catch (error) {
        console.log('❌ Notion API连接验证失败:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * 检查现有数据库
 */
async function checkExistingDatabase() {
    console.log('🔍 检查现有Notion数据库...');

    if (!process.env.NOTION_DATABASE_ID) {
        console.log('⚠️  NOTION_DATABASE_ID未设置，将创建新数据库');
        return null;
    }

    try {
        const response = await axios.get(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}`, {
            headers: {
                'Authorization': `Bearer ${process.env.NOTION_API_TOKEN}`,
                'Notion-Version': process.env.NOTION_VERSION || '2022-06-28'
            }
        });

        const database = response.data;
        console.log('✅ 找到现有数据库:');
        console.log(`   - 数据库ID: ${database.id}`);
        console.log(`   - 数据库标题: ${database.title[0]?.plain_text}`);
        console.log(`   - 属性数量: ${Object.keys(database.properties).length}`);

        return database;

    } catch (error) {
        if (error.response?.status === 404) {
            console.log('⚠️  指定的数据库不存在，将创建新数据库');
            return null;
        }

        console.log('❌ 检查现有数据库失败:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * 测试数据库写入
 */
async function testDatabaseWrite(databaseId) {
    console.log('🧪 测试数据库写入...');

    const testData = {
        parent: {
            database_id: databaseId
        },
        properties: {
            "标题": {
                title: [
                    {
                        text: {
                            content: "测试新闻标题 - " + new Date().toISOString()
                        }
                    }
                ]
            },
            "内容": {
                rich_text: [
                    {
                        text: {
                            content: "这是一条测试新闻内容，用于验证Notion数据库写入功能。"
                        }
                    }
                ]
            },
            "来源": {
                select: {
                    name: "API采集"
                }
            },
            "处理状态": {
                select: {
                    name: "待处理"
                }
            },
            "质量分数": {
                number: 85
            },
            "分类ID": {
                number: 1
            },
            "分类名称": {
                select: {
                    name: "科技资讯"
                }
            },
            "城市ID": {
                number: 1
            },
            "评论开关": {
                checkbox: true
            }
        }
    };

    try {
        const response = await axios.post('https://api.notion.com/v1/pages', testData, {
            headers: {
                'Authorization': `Bearer ${process.env.NOTION_API_TOKEN}`,
                'Content-Type': 'application/json',
                'Notion-Version': process.env.NOTION_VERSION || '2022-06-28'
            }
        });

        const page = response.data;
        console.log('✅ 数据库写入测试成功:');
        console.log(`   - 页面ID: ${page.id}`);
        console.log(`   - 创建时间: ${page.created_time}`);

        // 删除测试数据
        await axios.patch(`https://api.notion.com/v1/pages/${page.id}`, {
            archived: true
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.NOTION_API_TOKEN}`,
                'Content-Type': 'application/json',
                'Notion-Version': process.env.NOTION_VERSION || '2022-06-28'
            }
        });

        console.log('🗑️  测试数据已清理');
        return true;

    } catch (error) {
        console.log('❌ 数据库写入测试失败:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * 生成n8n Notion节点配置
 */
function generateNotionNodeConfig(databaseId) {
    const nodeConfig = {
        name: "Notion存储节点",
        type: "n8n-nodes-base.notion",
        typeVersion: 2,
        position: [900, 300],
        parameters: {
            resource: "databasePage",
            operation: "create",
            databaseId: databaseId,
            title: "={{$json.标题}}",
            propertiesUi: {
                propertyValues: [
                    {
                        key: "短标题",
                        type: "rich_text",
                        richTextValue: "={{$json.短标题 || ''}}"
                    },
                    {
                        key: "内容",
                        type: "rich_text",
                        richTextValue: "={{$json.内容}}"
                    },
                    {
                        key: "摘要",
                        type: "rich_text",
                        richTextValue: "={{$json.摘要 || ''}}"
                    },
                    {
                        key: "来源",
                        type: "select",
                        selectValue: "={{$json.来源 || 'API采集'}}"
                    },
                    {
                        key: "作者",
                        type: "rich_text",
                        richTextValue: "={{$json.作者 || 'AI采集'}}"
                    },
                    {
                        key: "原始URL",
                        type: "url",
                        urlValue: "={{$json.原始URL || ''}}"
                    },
                    {
                        key: "发布日期",
                        type: "date",
                        dateValue: "={{$json.发布日期 || new Date().toISOString()}}"
                    },
                    {
                        key: "分类ID",
                        type: "number",
                        numberValue: "={{$json.分类ID || 1}}"
                    },
                    {
                        key: "分类名称",
                        type: "select",
                        selectValue: "={{$json.分类名称 || '科技资讯'}}"
                    },
                    {
                        key: "关键词",
                        type: "multi_select",
                        multiSelectValue: "={{$json.关键词 ? $json.关键词.split(',').map(k => k.trim()) : []}}"
                    },
                    {
                        key: "缩略图URL",
                        type: "url",
                        urlValue: "={{$json.缩略图URL || ''}}"
                    },
                    {
                        key: "质量分数",
                        type: "number",
                        numberValue: "={{$json.质量分数 || 0}}"
                    },
                    {
                        key: "处理状态",
                        type: "select",
                        selectValue: "已存储"
                    },
                    {
                        key: "审核状态",
                        type: "select",
                        selectValue: "未审核"
                    },
                    {
                        key: "城市ID",
                        type: "number",
                        numberValue: 1
                    },
                    {
                        key: "评论开关",
                        type: "checkbox",
                        checkboxValue: true
                    }
                ]
            },
            options: {
                iconType: "emoji",
                iconEmoji: "📰"
            }
        },
        credentials: {
            notionApi: {
                id: "notion_api_credentials",
                name: "Notion API凭据"
            }
        }
    };

    return nodeConfig;
}

/**
 * 保存配置到文件
 */
function saveConfiguration(databaseId, database) {
    const config = {
        notion: {
            databaseId: databaseId,
            databaseTitle: database.title[0]?.plain_text,
            databaseUrl: database.url,
            apiVersion: process.env.NOTION_VERSION || '2022-06-28',
            createdAt: new Date().toISOString()
        },
        n8nNodeConfig: generateNotionNodeConfig(databaseId)
    };

    const configPath = 'n8n-config/notion-config.json';
    const fs = require('fs');
    const path = require('path');

    // 确保目录存在
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ 配置已保存到: ${configPath}`);

    // 更新环境变量模板
    const envTemplate = fs.readFileSync('.env.template', 'utf8');
    const updatedTemplate = envTemplate.replace(
        'NOTION_DATABASE_ID=your_database_id_here',
        `NOTION_DATABASE_ID=${databaseId}`
    );
    fs.writeFileSync('.env.template', updatedTemplate);
    console.log('✅ 环境变量模板已更新');
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 开始设置Notion API集成...\n');

    try {
        // 1. 验证API连接
        await validateNotionConnection();

        // 2. 检查现有数据库
        let database = await checkExistingDatabase();

        // 3. 如果没有现有数据库，创建新的
        if (!database) {
            const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
            if (!parentPageId) {
                console.log('❌ 需要设置NOTION_PARENT_PAGE_ID环境变量来创建数据库');
                console.log('   请在Notion中创建一个页面，并将页面ID设置为NOTION_PARENT_PAGE_ID');
                process.exit(1);
            }

            database = await createNotionDatabase(parentPageId);
        }

        // 4. 测试数据库写入
        await testDatabaseWrite(database.id);

        // 5. 保存配置
        saveConfiguration(database.id, database);

        console.log('\n✅ Notion API集成设置完成！');
        console.log('\n📋 下一步操作:');
        console.log('1. 将数据库ID添加到.env文件:');
        console.log(`   NOTION_DATABASE_ID=${database.id}`);
        console.log('2. 在n8n中导入Notion节点配置');
        console.log('3. 测试完整的工作流');
        console.log(`4. 访问Notion数据库: ${database.url}`);

    } catch (error) {
        console.log('\n❌ Notion API集成设置失败:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    createNotionDatabase,
    validateNotionConnection,
    checkExistingDatabase,
    testDatabaseWrite,
    generateNotionNodeConfig,
    notionDatabaseSchema
};