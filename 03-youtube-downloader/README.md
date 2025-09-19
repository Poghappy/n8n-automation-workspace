# YouTube 下载工具

这个文件夹包含了YouTube视频下载的相关脚本和配置文件。

## 文件说明

- `yt_downloader.py` - 主要的下载脚本
- `urls.txt` - 包含YouTube URL的批量下载文件
- `README.md` - 本说明文档

## 使用方法

### 1. 激活虚拟环境
```bash
# 从项目根目录执行
source .venv/bin/activate
```

### 2. 单个视频下载
```bash
# 下载单个视频（默认质量420p）
python yt下载/yt_downloader.py "https://www.youtube.com/watch?v=VIDEO_ID"

# 指定质量下载
python yt下载/yt_downloader.py -q 720p "https://www.youtube.com/watch?v=VIDEO_ID"

# 指定输出目录
python yt下载/yt_downloader.py -o ~/Desktop/my_videos "https://www.youtube.com/watch?v=VIDEO_ID"
```

### 3. 批量下载
```bash
# 使用urls.txt文件批量下载
python yt下载/yt_downloader.py -f yt下载/urls.txt

# 批量下载并指定质量
python yt下载/yt_downloader.py -f yt下载/urls.txt -q 1080p
```

### 4. 查看视频信息
```bash
# 仅查看视频信息，不下载
python yt下载/yt_downloader.py --info "https://www.youtube.com/watch?v=VIDEO_ID"
```

### 5. 查看帮助
```bash
python yt下载/yt_downloader.py --help
```

## 支持的质量选项

- 144p
- 240p  
- 360p
- 420p (默认)
- 480p
- 720p
- 1080p

## 支持的URL格式

- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
- YouTube短链: `https://youtu.be/VIDEO_ID`
- YouTube播放列表: `https://www.youtube.com/playlist?list=PLAYLIST_ID`

## 注意事项

1. 每次打开新终端都需要重新激活虚拟环境
2. 下载的文件默认保存在项目根目录的 `downloads` 文件夹中
3. 可以通过 `-o` 参数指定其他输出目录
4. 脚本会自动创建输出目录（如果不存在）