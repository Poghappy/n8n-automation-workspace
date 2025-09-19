# YT-DLP 视频下载工具使用指南

## 功能特性

- ✅ 支持多种视频平台（YouTube、Bilibili等）
- ✅ 批量下载功能
- ✅ 多种视频质量选择（144p-1080p）
- ✅ 实时下载进度显示
- ✅ 详细的下载统计和错误报告
- ✅ 视频信息预览功能
- ✅ 支持从文件读取URL列表

## 安装依赖

```bash
# 安装Python依赖
pip install -r requirements.txt

# 或单独安装
pip install yt-dlp rich
```

## 基本使用

### 1. 下载单个视频

```bash
# 默认420p质量
python scripts/yt_downloader.py "https://www.youtube.com/watch?v=VIDEO_ID"

# 指定质量
python scripts/yt_downloader.py "https://www.youtube.com/watch?v=VIDEO_ID" -q 720p

# 指定输出目录
python scripts/yt_downloader.py "https://www.youtube.com/watch?v=VIDEO_ID" -o /path/to/downloads
```

### 2. 批量下载

```bash
# 从命令行传入多个URL
python scripts/yt_downloader.py "URL1" "URL2" "URL3"

# 从文件读取URL列表
python scripts/yt_downloader.py -f scripts/urls.txt

# 批量下载指定质量
python scripts/yt_downloader.py -f scripts/urls.txt -q 480p
```

### 3. 预览视频信息

```bash
# 仅显示视频信息，不下载
python scripts/yt_downloader.py "https://www.youtube.com/watch?v=VIDEO_ID" --info
```

## 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `urls` | 视频URL列表 | - |
| `-f, --file` | 包含URL的文件路径 | - |
| `-o, --output` | 输出目录 | downloads |
| `-q, --quality` | 视频质量 | 420p |
| `--info` | 仅显示视频信息 | False |

## 支持的视频质量

- `144p` - 最低质量
- `240p` - 低质量
- `360p` - 标清
- `420p` - 标清+ (默认)
- `480p` - 高清
- `720p` - 高清
- `1080p` - 全高清

## URL文件格式

创建一个文本文件（如 `urls.txt`），每行一个URL：

```
# 这是注释行
https://www.youtube.com/watch?v=VIDEO_ID1
https://www.youtube.com/watch?v=VIDEO_ID2
https://www.youtube.com/watch?v=VIDEO_ID3

# 可以添加更多URL
https://www.bilibili.com/video/BV1234567890
```

## 输出文件结构

```
downloads/
├── 视频标题1.mp4
├── 视频标题1.info.json
├── 视频标题2.mp4
├── 视频标题2.info.json
└── ...
```

## 日志文件

下载过程中的详细日志会保存到 `yt_downloader.log` 文件中，包括：
- 下载开始/完成时间
- 错误信息
- 下载统计

## 使用示例

### 示例1：下载单个YouTube视频

```bash
python scripts/yt_downloader.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ" -q 720p -o ./my_videos
```

### 示例2：批量下载并查看信息

```bash
# 先查看视频信息
python scripts/yt_downloader.py -f urls.txt --info

# 确认后开始下载
python scripts/yt_downloader.py -f urls.txt -q 480p
```

### 示例3：下载到指定目录

```bash
python scripts/yt_downloader.py "URL1" "URL2" -o /Users/username/Videos -q 720p
```

## 错误处理

工具会自动处理以下情况：
- 无效的URL
- 网络连接问题
- 视频不可用
- 权限问题

所有错误都会在控制台显示并记录到日志文件中。

## 注意事项

1. **合法使用**：请确保下载的内容符合相关法律法规和平台服务条款
2. **网络环境**：某些平台可能需要特定的网络环境才能访问
3. **存储空间**：确保有足够的磁盘空间存储下载的视频
4. **下载速度**：下载速度取决于网络环境和视频平台的限制

## 故障排除

### 常见问题

1. **"No module named 'yt_dlp'"**
   ```bash
   pip install yt-dlp
   ```

2. **下载失败**
   - 检查URL是否有效
   - 确认网络连接正常
   - 查看日志文件了解详细错误信息

3. **权限错误**
   ```bash
   chmod +x scripts/yt_downloader.py
   ```

### 获取帮助

```bash
python scripts/yt_downloader.py --help
```

## 更新日志

- v1.0.0: 初始版本，支持基本下载功能
- 支持多种视频质量选择
- 添加批量下载功能
- 集成Rich库美化输出界面