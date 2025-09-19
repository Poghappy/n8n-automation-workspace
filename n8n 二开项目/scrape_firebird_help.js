const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * 火鸟门户帮助中心页面抓取脚本
 * 专门用于抓取新闻模块相关的官方文档和图片设置方法
 */
class FirebirdHelpScraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.targetUrl = 'https://help.kumanyun.com/help-280.html';
        this.outputDir = './scraped_content';
    }

    /**
     * 初始化浏览器
     */
    async init() {
        console.log('🚀 启动浏览器...');
        this.browser = await puppeteer.launch({
            headless: false, // 设置为false以便观察抓取过程
            defaultViewport: {
                width: 1280,
                height: 720
            },
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });

        this.page = await this.browser.newPage();
        
        // 设置用户代理
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // 创建输出目录
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * 抓取页面内容
     */
    async scrapePage() {
        try {
            console.log(`📄 正在访问页面: ${this.targetUrl}`);
            
            // 访问目标页面
            await this.page.goto(this.targetUrl, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            console.log('⏳ 等待页面完全加载...');
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 获取页面标题
            const title = await this.page.title();
            console.log(`📋 页面标题: ${title}`);

            // 抓取页面的完整HTML内容
            const htmlContent = await this.page.content();

            // 抓取页面文本内容
            const textContent = await this.page.evaluate(() => {
                return document.body.innerText;
            });

            // 抓取所有图片信息
            const images = await this.page.evaluate(() => {
                const imgs = Array.from(document.querySelectorAll('img'));
                return imgs.map(img => ({
                    src: img.src,
                    alt: img.alt || '',
                    title: img.title || '',
                    width: img.width,
                    height: img.height
                }));
            });

            // 抓取所有链接信息
            const links = await this.page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a'));
                return anchors.map(a => ({
                    href: a.href,
                    text: a.textContent.trim(),
                    title: a.title || ''
                }));
            });

            // 查找新闻模块相关内容
            const newsRelatedContent = await this.findNewsRelatedContent();

            // 截取页面截图
            const screenshotPath = path.join(this.outputDir, 'page_screenshot.png');
            await this.page.screenshot({
                path: screenshotPath,
                fullPage: true
            });

            console.log('📸 页面截图已保存');

            return {
                title,
                htmlContent,
                textContent,
                images,
                links,
                newsRelatedContent,
                screenshotPath
            };

        } catch (error) {
            console.error('❌ 抓取页面时出错:', error);
            throw error;
        }
    }

    /**
     * 查找新闻模块相关内容
     */
    async findNewsRelatedContent() {
        console.log('🔍 搜索新闻模块相关内容...');
        
        const newsKeywords = ['新闻', '资讯', '文章', '内容', '模块', '栏目', '分类'];
        
        const newsContent = await this.page.evaluate((keywords) => {
            const results = [];
            
            // 搜索包含关键词的元素
            keywords.forEach(keyword => {
                const elements = Array.from(document.querySelectorAll('*')).filter(el => {
                    return el.textContent && el.textContent.includes(keyword);
                });
                
                elements.forEach(el => {
                    if (el.textContent.trim().length > 0) {
                        results.push({
                            keyword: keyword,
                            tagName: el.tagName,
                            textContent: el.textContent.trim(),
                            innerHTML: el.innerHTML,
                            className: el.className || '',
                            id: el.id || ''
                        });
                    }
                });
            });
            
            return results;
        }, newsKeywords);

        console.log(`📊 找到 ${newsContent.length} 个新闻相关内容项`);
        return newsContent;
    }

    /**
     * 下载图片
     */
    async downloadImages(images) {
        console.log('📥 开始下载图片...');
        
        const imageDir = path.join(this.outputDir, 'images');
        if (!fs.existsSync(imageDir)) {
            fs.mkdirSync(imageDir, { recursive: true });
        }

        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            if (img.src && img.src.startsWith('http')) {
                try {
                    const response = await this.page.goto(img.src);
                    const buffer = await response.buffer();
                    
                    const filename = `image_${i + 1}_${path.basename(img.src).split('?')[0]}`;
                    const filepath = path.join(imageDir, filename);
                    
                    fs.writeFileSync(filepath, buffer);
                    console.log(`✅ 已下载图片: ${filename}`);
                } catch (error) {
                    console.error(`❌ 下载图片失败 ${img.src}:`, error.message);
                }
            }
        }
    }

    /**
     * 保存抓取结果
     */
    async saveResults(data) {
        console.log('💾 保存抓取结果...');

        // 保存HTML内容
        const htmlPath = path.join(this.outputDir, 'page_content.html');
        fs.writeFileSync(htmlPath, data.htmlContent, 'utf8');

        // 保存文本内容
        const textPath = path.join(this.outputDir, 'page_content.txt');
        fs.writeFileSync(textPath, data.textContent, 'utf8');

        // 保存结构化数据
        const jsonPath = path.join(this.outputDir, 'scraped_data.json');
        const jsonData = {
            title: data.title,
            url: this.targetUrl,
            scrapedAt: new Date().toISOString(),
            images: data.images,
            links: data.links,
            newsRelatedContent: data.newsRelatedContent
        };
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');

        // 生成Markdown报告
        const markdownPath = path.join(this.outputDir, 'scraping_report.md');
        const markdownContent = this.generateMarkdownReport(jsonData);
        fs.writeFileSync(markdownPath, markdownContent, 'utf8');

        console.log('✅ 所有结果已保存到:', this.outputDir);
    }

    /**
     * 生成Markdown报告
     */
    generateMarkdownReport(data) {
        let markdown = `# 火鸟门户帮助中心抓取报告\n\n`;
        markdown += `**页面标题**: ${data.title}\n`;
        markdown += `**页面URL**: ${data.url}\n`;
        markdown += `**抓取时间**: ${data.scrapedAt}\n\n`;

        markdown += `## 📊 抓取统计\n\n`;
        markdown += `- 图片数量: ${data.images.length}\n`;
        markdown += `- 链接数量: ${data.links.length}\n`;
        markdown += `- 新闻相关内容: ${data.newsRelatedContent.length}\n\n`;

        if (data.newsRelatedContent.length > 0) {
            markdown += `## 🗞️ 新闻模块相关内容\n\n`;
            data.newsRelatedContent.forEach((item, index) => {
                markdown += `### ${index + 1}. ${item.keyword} 相关内容\n\n`;
                markdown += `**标签**: ${item.tagName}\n`;
                markdown += `**类名**: ${item.className}\n`;
                markdown += `**ID**: ${item.id}\n`;
                markdown += `**内容**: ${item.textContent.substring(0, 200)}${item.textContent.length > 200 ? '...' : ''}\n\n`;
            });
        }

        if (data.images.length > 0) {
            markdown += `## 🖼️ 页面图片\n\n`;
            data.images.forEach((img, index) => {
                markdown += `### 图片 ${index + 1}\n`;
                markdown += `- **URL**: ${img.src}\n`;
                markdown += `- **Alt文本**: ${img.alt}\n`;
                markdown += `- **尺寸**: ${img.width}x${img.height}\n\n`;
            });
        }

        return markdown;
    }

    /**
     * 关闭浏览器
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔚 浏览器已关闭');
        }
    }

    /**
     * 执行完整的抓取流程
     */
    async run() {
        try {
            await this.init();
            const data = await this.scrapePage();
            await this.downloadImages(data.images);
            await this.saveResults(data);
            
            console.log('🎉 抓取任务完成！');
            console.log(`📁 结果保存在: ${path.resolve(this.outputDir)}`);
            
        } catch (error) {
            console.error('❌ 抓取任务失败:', error);
        } finally {
            await this.close();
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const scraper = new FirebirdHelpScraper();
    scraper.run().catch(console.error);
}

module.exports = FirebirdHelpScraper;