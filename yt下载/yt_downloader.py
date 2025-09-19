#!/usr/bin/env python3
"""
YT-DLP 视频下载工具
支持批量下载、格式配置、进度显示等功能
"""

import os
import sys
import json
import argparse
import logging
from pathlib import Path
from typing import List, Dict, Optional
from urllib.parse import urlparse
import yt_dlp
from rich.console import Console
from rich.progress import Progress, TaskID
from rich.table import Table
from rich.panel import Panel

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('yt_downloader.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

console = Console()

class VideoDownloader:
    """视频下载器类"""
    
    def __init__(self, output_dir: str = "downloads", quality: str = "420p"):
        """
        初始化下载器
        
        Args:
            output_dir: 下载目录
            quality: 视频质量 (144p, 240p, 360p, 420p, 480p, 720p, 1080p)
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.quality = quality
        self.downloaded_files = []
        self.failed_downloads = []
        
        # 配置yt-dlp选项
        self.ydl_opts = {
            'format': self._get_format_selector(quality),
            'outtmpl': str(self.output_dir / '%(title)s.%(ext)s'),
            'writeinfojson': True,
            'writesubtitles': False,
            'writeautomaticsub': False,
            'ignoreerrors': True,
            'no_warnings': False,
            'extractaudio': False,
            'audioformat': 'mp3',
            'audioquality': '192',
        }
    
    def _get_format_selector(self, quality: str) -> str:
        """
        根据质量设置获取格式选择器
        
        Args:
            quality: 视频质量
            
        Returns:
            格式选择器字符串
        """
        quality_map = {
            '144p': 'worst[height<=144]/worst',
            '240p': 'best[height<=240]/best[height<=360]/best',
            '360p': 'best[height<=360]/best[height<=480]/best',
            '420p': 'best[height<=420]/best[height<=480]/best',
            '480p': 'best[height<=480]/best[height<=720]/best',
            '720p': 'best[height<=720]/best[height<=1080]/best',
            '1080p': 'best[height<=1080]/best',
        }
        
        return quality_map.get(quality, 'best[height<=420]/best')
    
    def _progress_hook(self, d: Dict):
        """下载进度回调"""
        if d['status'] == 'downloading':
            if 'total_bytes' in d:
                percent = d['downloaded_bytes'] / d['total_bytes'] * 100
                console.print(f"下载进度: {percent:.1f}% - {d['filename']}", end='\r')
        elif d['status'] == 'finished':
            console.print(f"\n✅ 下载完成: {d['filename']}")
            self.downloaded_files.append(d['filename'])
    
    def download_single(self, url: str) -> bool:
        """
        下载单个视频
        
        Args:
            url: 视频URL
            
        Returns:
            下载是否成功
        """
        try:
            # 添加进度回调
            opts = self.ydl_opts.copy()
            opts['progress_hooks'] = [self._progress_hook]
            
            with yt_dlp.YoutubeDL(opts) as ydl:
                # 获取视频信息
                info = ydl.extract_info(url, download=False)
                title = info.get('title', 'Unknown')
                duration = info.get('duration', 0)
                
                console.print(f"\n📹 准备下载: {title}")
                console.print(f"⏱️  时长: {duration//60}:{duration%60:02d}")
                console.print(f"🎯 质量: {self.quality}")
                
                # 开始下载
                ydl.download([url])
                return True
                
        except Exception as e:
            logger.error(f"下载失败 {url}: {str(e)}")
            self.failed_downloads.append({'url': url, 'error': str(e)})
            console.print(f"❌ 下载失败: {url} - {str(e)}")
            return False
    
    def download_batch(self, urls: List[str]) -> Dict[str, int]:
        """
        批量下载视频
        
        Args:
            urls: 视频URL列表
            
        Returns:
            下载统计信息
        """
        console.print(Panel(f"🚀 开始批量下载 {len(urls)} 个视频", style="bold blue"))
        
        success_count = 0
        failed_count = 0
        
        with Progress() as progress:
            task = progress.add_task("[green]下载进度...", total=len(urls))
            
            for i, url in enumerate(urls, 1):
                console.print(f"\n[{i}/{len(urls)}] 处理: {url}")
                
                if self.download_single(url):
                    success_count += 1
                else:
                    failed_count += 1
                
                progress.update(task, advance=1)
        
        # 显示下载统计
        self._show_download_summary(success_count, failed_count)
        
        return {
            'success': success_count,
            'failed': failed_count,
            'total': len(urls)
        }
    
    def _show_download_summary(self, success: int, failed: int):
        """显示下载摘要"""
        table = Table(title="下载摘要")
        table.add_column("状态", style="cyan")
        table.add_column("数量", style="magenta")
        table.add_column("详情", style="green")
        
        table.add_row("✅ 成功", str(success), f"{len(self.downloaded_files)} 个文件")
        table.add_row("❌ 失败", str(failed), f"{len(self.failed_downloads)} 个错误")
        table.add_row("📁 保存位置", "-", str(self.output_dir.absolute()))
        
        console.print(table)
        
        # 显示失败的下载
        if self.failed_downloads:
            console.print("\n❌ 失败的下载:")
            for item in self.failed_downloads:
                console.print(f"  • {item['url']}: {item['error']}")
    
    def get_video_info(self, url: str) -> Optional[Dict]:
        """
        获取视频信息
        
        Args:
            url: 视频URL
            
        Returns:
            视频信息字典
        """
        try:
            with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
                info = ydl.extract_info(url, download=False)
                return {
                    'title': info.get('title'),
                    'duration': info.get('duration'),
                    'uploader': info.get('uploader'),
                    'view_count': info.get('view_count'),
                    'upload_date': info.get('upload_date'),
                    'description': info.get('description', '')[:200] + '...',
                    'formats': len(info.get('formats', []))
                }
        except Exception as e:
            logger.error(f"获取视频信息失败 {url}: {str(e)}")
            return None

def load_urls_from_file(file_path: str) -> List[str]:
    """
    从文件加载URL列表
    
    Args:
        file_path: 文件路径
        
    Returns:
        URL列表
    """
    urls = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    urls.append(line)
    except Exception as e:
        logger.error(f"读取URL文件失败: {str(e)}")
    
    return urls

def validate_url(url: str) -> bool:
    """验证URL格式"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='YT-DLP 视频下载工具')
    parser.add_argument('urls', nargs='*', help='视频URL列表')
    parser.add_argument('-f', '--file', help='包含URL的文件路径')
    parser.add_argument('-o', '--output', default='downloads', help='输出目录 (默认: downloads)')
    parser.add_argument('-q', '--quality', default='420p', 
                       choices=['144p', '240p', '360p', '420p', '480p', '720p', '1080p'],
                       help='视频质量 (默认: 420p)')
    parser.add_argument('--info', action='store_true', help='仅显示视频信息，不下载')
    parser.add_argument('--list-formats', action='store_true', help='列出可用格式')
    
    args = parser.parse_args()
    
    # 收集URL
    urls = []
    if args.urls:
        urls.extend(args.urls)
    
    if args.file:
        file_urls = load_urls_from_file(args.file)
        urls.extend(file_urls)
    
    if not urls:
        console.print("❌ 请提供至少一个视频URL或URL文件")
        parser.print_help()
        return
    
    # 验证URL
    valid_urls = []
    for url in urls:
        if validate_url(url):
            valid_urls.append(url)
        else:
            console.print(f"⚠️  无效URL: {url}")
    
    if not valid_urls:
        console.print("❌ 没有有效的URL")
        return
    
    # 创建下载器
    downloader = VideoDownloader(args.output, args.quality)
    
    # 仅显示信息模式
    if args.info:
        console.print("📋 视频信息:")
        for url in valid_urls:
            info = downloader.get_video_info(url)
            if info:
                table = Table(title=f"视频信息: {url}")
                for key, value in info.items():
                    table.add_row(key, str(value))
                console.print(table)
        return
    
    # 开始下载
    try:
        if len(valid_urls) == 1:
            downloader.download_single(valid_urls[0])
        else:
            downloader.download_batch(valid_urls)
    except KeyboardInterrupt:
        console.print("\n⚠️  下载被用户中断")
    except Exception as e:
        console.print(f"❌ 下载过程中出现错误: {str(e)}")
        logger.error(f"下载错误: {str(e)}")

if __name__ == "__main__":
    main()