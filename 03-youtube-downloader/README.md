# YouTube下载器工具

## 📋 项目概述

YouTube下载器工具是一个基于yt-dlp的高效视频下载系统，支持单个视频下载、批量下载、元数据提取和与N8N工作流的集成。该工具还集成了Firecrawl爬虫功能，提供更强大的内容抓取能力。

## 🚀 功能特性

- **📺 视频下载**: 支持多种质量的YouTube视频下载
- **📋 批量处理**: 支持URL列表批量下载
- **📊 元数据提取**: 自动提取视频标题、描述、时长等信息
- **🔄 N8N集成**: 与N8N工作流无缝集成
- **🕷️ Firecrawl集成**: 高级网页内容抓取功能
- **📁 智能管理**: 自动文件组织和命名
- **⚡ 高性能**: 多线程下载支持
- **🔍 格式检测**: 自动选择最佳下载格式

## 📁 目录结构

```
03-youtube-downloader/
├── src/                          # 源代码
├── downloads/                    # 下载文件存储
├── yt_downloader.py             # 主下载脚本
├── urls.txt                     # 批量下载URL列表
├── youtube_urls.txt             # YouTube URL示例
├── test_urls.txt                # 测试URL列表
├── firecrawl_n8n_workflow.json # Firecrawl N8N工作流
├── firecrawl_setup_guide.md    # Firecrawl设置指南
├── test_firecrawl_workflow.py  # Firecrawl测试脚本
├── mcp_config_update.json      # MCP配置更新
├── analysis_report.md          # 分析报告
└── yt_downloader.log           # 下载日志
```

## 🛠️ 快速开始

### 环境要求

- Python 3.8+
- yt-dlp
- requests
- N8N (可选，用于工作流集成)
- Firecrawl API密钥 (可选，用于高级爬虫功能)

### 安装部署

#### 1. 环境配置

```bash
# 进入项目目录
cd 03-youtube-downloader

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

#### 2. 配置文件

```bash
# 复制配置模板
cp config.example.json config.json

# 编辑配置文件
vim config.json
```

### 使用方法

#### 1. 单个视频下载

```bash
# 下载单个视频（默认质量720p）
python yt_downloader.py "https://www.youtube.com/watch?v=VIDEO_ID"

# 指定质量下载
python yt_downloader.py -q 1080p "https://www.youtube.com/watch?v=VIDEO_ID"

# 指定输出目录
python yt_downloader.py -o ./downloads "https://www.youtube.com/watch?v=VIDEO_ID"

# 下载音频
python yt_downloader.py --audio-only "https://www.youtube.com/watch?v=VIDEO_ID"
```

#### 2. 批量下载

```bash
# 使用URL文件批量下载
python yt_downloader.py -f urls.txt

# 批量下载并指定质量
python yt_downloader.py -f urls.txt -q 1080p

# 并行下载（提高速度）
python yt_downloader.py -f urls.txt --parallel 4
```

#### 3. 高级功能

```bash
# 仅提取元数据
python yt_downloader.py --info-only "https://www.youtube.com/watch?v=VIDEO_ID"

# 下载字幕
python yt_downloader.py --subtitles "https://www.youtube.com/watch?v=VIDEO_ID"

# 下载播放列表
python yt_downloader.py --playlist "https://www.youtube.com/playlist?list=PLAYLIST_ID"

# 查看帮助
python yt_downloader.py --help
```

## 🔧 配置说明

### 基础配置

```json
{
    "download": {
        "output_dir": "./downloads",
        "quality": "720p",
        "format": "mp4",
        "parallel_downloads": 2
    },
    "firecrawl": {
        "api_key": "your_firecrawl_api_key",
        "base_url": "https://api.firecrawl.dev"
    },
    "n8n": {
        "webhook_url": "http://localhost:5678/webhook/youtube-download",
        "api_key": "your_n8n_api_key"
    }
}
```

### 支持的质量选项

| 质量 | 分辨率 | 文件大小 | 推荐用途 |
|------|--------|----------|----------|
| 144p | 256x144 | 最小 | 预览 |
| 240p | 426x240 | 小 | 移动设备 |
| 360p | 640x360 | 中等 | 标准观看 |
| 480p | 854x480 | 中等 | 标准观看 |
| 720p | 1280x720 | 大 | 高清观看 (默认) |
| 1080p | 1920x1080 | 最大 | 全高清 |
| best | 自动选择 | 变化 | 最佳质量 |

### 支持的平台

- **YouTube**: 视频、播放列表、频道
- **YouTube Music**: 音乐视频
- **YouTube Shorts**: 短视频
- **其他平台**: 通过yt-dlp支持的1000+网站

## 🔄 N8N工作流集成

### Webhook触发

```javascript
// N8N Webhook节点配置
{
  "httpMethod": "POST",
  "path": "youtube-download",
  "responseMode": "responseNode"
}
```

### 工作流示例

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "youtube-download",
        "httpMethod": "POST"
      }
    },
    {
      "name": "YouTube Downloader",
      "type": "n8n-nodes-base.executeCommand",
      "parameters": {
        "command": "python",
        "arguments": "yt_downloader.py {{ $json.url }}"
      }
    }
  ]
}
```

## 🕷️ Firecrawl集成

### 配置Firecrawl

```bash
# 设置API密钥
export FIRECRAWL_API_KEY="your_api_key"

# 测试连接
python test_firecrawl_workflow.py
```

### 使用Firecrawl

```python
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="your_api_key")

# 爬取网页内容
result = app.scrape_url("https://example.com")
print(result)

# 批量爬取
urls = ["https://example1.com", "https://example2.com"]
results = app.batch_scrape_urls(urls)
```

## 📊 监控和日志

### 日志配置

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('yt_downloader.log'),
        logging.StreamHandler()
    ]
)
```

### 性能监控

```bash
# 查看下载统计
python yt_downloader.py --stats

# 监控下载进度
tail -f yt_downloader.log

# 检查磁盘空间
df -h downloads/
```

## 🔍 故障排除

### 常见问题

1. **下载失败**
   ```bash
   # 更新yt-dlp
   pip install --upgrade yt-dlp

   # 检查URL有效性
   python yt_downloader.py --info-only "URL"
   ```

2. **权限错误**
   ```bash
   # 检查目录权限
   chmod 755 downloads/

   # 检查文件权限
   chmod 644 yt_downloader.py
   ```

3. **网络问题**
   ```bash
   # 使用代理
   python yt_downloader.py --proxy "http://proxy:port" "URL"

   # 重试下载
   python yt_downloader.py --retries 3 "URL"
   ```

### 调试模式

```bash
# 启用详细日志
python yt_downloader.py --verbose "URL"

# 调试模式
python yt_downloader.py --debug "URL"
```

## 📚 API文档

### 命令行参数

```bash
usage: yt_downloader.py [-h] [-q QUALITY] [-o OUTPUT] [-f FILE]
                       [--audio-only] [--subtitles] [--playlist]
                       [--info-only] [--parallel PARALLEL] [--verbose]
                       [url]

positional arguments:
  url                   YouTube URL to download

optional arguments:
  -h, --help           show this help message and exit
  -q, --quality        video quality (default: 720p)
  -o, --output         output directory (default: ./downloads)
  -f, --file           file containing URLs to download
  --audio-only         download audio only
  --subtitles          download subtitles
  --playlist           download entire playlist
  --info-only          extract info only, don't download
  --parallel           number of parallel downloads (default: 2)
  --verbose            enable verbose logging
```

### Python API

```python
from yt_downloader import YouTubeDownloader

# 创建下载器实例
downloader = YouTubeDownloader(
    output_dir="./downloads",
    quality="720p"
)

# 下载单个视频
result = downloader.download("https://www.youtube.com/watch?v=VIDEO_ID")

# 批量下载
urls = ["url1", "url2", "url3"]
results = downloader.batch_download(urls)

# 获取视频信息
info = downloader.get_video_info("https://www.youtube.com/watch?v=VIDEO_ID")
```

## 🔒 安全注意事项

1. **版权合规**: 仅下载您有权下载的内容
2. **API密钥安全**: 不要在代码中硬编码API密钥
3. **网络安全**: 使用HTTPS连接
4. **文件安全**: 定期清理下载文件

## 📖 更多资源

- [yt-dlp文档](https://github.com/yt-dlp/yt-dlp)
- [Firecrawl文档](https://docs.firecrawl.dev/)
- [N8N文档](https://docs.n8n.io/)
- [项目Wiki](https://github.com/Poghappy/n8n-automation-workspace/wiki)

## 🤝 贡献指南

详细信息请参考 [CONTRIBUTING.md](../CONTRIBUTING.md)

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](../LICENSE) 文件

---

更多信息请访问 [项目主页](https://github.com/Poghappy/n8n-automation-workspace)