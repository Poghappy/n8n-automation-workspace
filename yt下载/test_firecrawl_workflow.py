#!/usr/bin/env python3
"""
Firecrawl N8N工作流程测试脚本

此脚本用于测试Firecrawl与N8N集成的工作流程，
验证网页抓取和媒体资源提取功能。
"""

import requests
import json
import time
from typing import Dict, List, Optional
from urllib.parse import urlparse
import argparse


class FirecrawlWorkflowTester:
    """Firecrawl工作流程测试器"""
    
    def __init__(self, webhook_url: str):
        """
        初始化测试器
        
        Args:
            webhook_url: N8N工作流程的Webhook URL
        """
        self.webhook_url = webhook_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'FirecrawlWorkflowTester/1.0'
        })
    
    def test_single_url(self, url: str, timeout: int = 30) -> Dict:
        """
        测试单个URL的抓取
        
        Args:
            url: 要测试的URL
            timeout: 请求超时时间（秒）
            
        Returns:
            抓取结果字典
        """
        print(f"🔍 测试URL: {url}")
        
        payload = {"url": url}
        
        try:
            start_time = time.time()
            response = self.session.post(
                self.webhook_url,
                json=payload,
                timeout=timeout
            )
            end_time = time.time()
            
            response.raise_for_status()
            result = response.json()
            
            # 添加测试元数据
            result['test_metadata'] = {
                'request_time': end_time - start_time,
                'status_code': response.status_code,
                'response_size': len(response.content)
            }
            
            print(f"✅ 抓取成功 - 耗时: {result['test_metadata']['request_time']:.2f}秒")
            return result
            
        except requests.exceptions.Timeout:
            print(f"⏰ 请求超时 ({timeout}秒)")
            return {"error": "timeout", "url": url}
            
        except requests.exceptions.RequestException as e:
            print(f"❌ 请求失败: {str(e)}")
            return {"error": str(e), "url": url}
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON解析失败: {str(e)}")
            return {"error": "json_decode_error", "url": url, "response_text": response.text[:500]}
    
    def test_multiple_urls(self, urls: List[str], delay: float = 1.0) -> List[Dict]:
        """
        测试多个URL的抓取
        
        Args:
            urls: URL列表
            delay: 请求间隔时间（秒）
            
        Returns:
            抓取结果列表
        """
        print(f"🚀 开始批量测试 {len(urls)} 个URL")
        results = []
        
        for i, url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}]", end=" ")
            result = self.test_single_url(url)
            results.append(result)
            
            # 添加延迟避免过于频繁的请求
            if i < len(urls) and delay > 0:
                time.sleep(delay)
        
        return results
    
    def analyze_results(self, results: List[Dict]) -> Dict:
        """
        分析测试结果
        
        Args:
            results: 测试结果列表
            
        Returns:
            分析报告字典
        """
        total_count = len(results)
        success_count = sum(1 for r in results if 'error' not in r and r.get('success', False))
        error_count = total_count - success_count
        
        # 统计媒体资源
        total_images = sum(r.get('mediaCount', {}).get('images', 0) for r in results if 'error' not in r)
        total_videos = sum(r.get('mediaCount', {}).get('videos', 0) for r in results if 'error' not in r)
        total_audios = sum(r.get('mediaCount', {}).get('audios', 0) for r in results if 'error' not in r)
        total_downloads = sum(r.get('mediaCount', {}).get('downloads', 0) for r in results if 'error' not in r)
        
        # 统计响应时间
        response_times = [r.get('test_metadata', {}).get('request_time', 0) for r in results if 'test_metadata' in r]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        # 统计错误类型
        error_types = {}
        for result in results:
            if 'error' in result:
                error_type = result['error']
                error_types[error_type] = error_types.get(error_type, 0) + 1
        
        analysis = {
            'summary': {
                'total_urls': total_count,
                'successful': success_count,
                'failed': error_count,
                'success_rate': (success_count / total_count * 100) if total_count > 0 else 0
            },
            'media_stats': {
                'total_images': total_images,
                'total_videos': total_videos,
                'total_audios': total_audios,
                'total_downloads': total_downloads,
                'avg_images_per_page': total_images / success_count if success_count > 0 else 0,
                'avg_videos_per_page': total_videos / success_count if success_count > 0 else 0
            },
            'performance': {
                'avg_response_time': avg_response_time,
                'min_response_time': min(response_times) if response_times else 0,
                'max_response_time': max(response_times) if response_times else 0
            },
            'errors': error_types
        }
        
        return analysis
    
    def print_analysis(self, analysis: Dict):
        """打印分析结果"""
        print("\n" + "="*60)
        print("📊 测试结果分析")
        print("="*60)
        
        # 基本统计
        summary = analysis['summary']
        print(f"总URL数量: {summary['total_urls']}")
        print(f"成功抓取: {summary['successful']}")
        print(f"失败数量: {summary['failed']}")
        print(f"成功率: {summary['success_rate']:.1f}%")
        
        # 媒体资源统计
        media = analysis['media_stats']
        print(f"\n📸 媒体资源统计:")
        print(f"  图片总数: {media['total_images']} (平均 {media['avg_images_per_page']:.1f}/页)")
        print(f"  视频总数: {media['total_videos']} (平均 {media['avg_videos_per_page']:.1f}/页)")
        print(f"  音频总数: {media['total_audios']}")
        print(f"  下载文件: {media['total_downloads']}")
        
        # 性能统计
        perf = analysis['performance']
        print(f"\n⚡ 性能统计:")
        print(f"  平均响应时间: {perf['avg_response_time']:.2f}秒")
        print(f"  最快响应: {perf['min_response_time']:.2f}秒")
        print(f"  最慢响应: {perf['max_response_time']:.2f}秒")
        
        # 错误统计
        if analysis['errors']:
            print(f"\n❌ 错误统计:")
            for error_type, count in analysis['errors'].items():
                print(f"  {error_type}: {count}次")
    
    def save_results(self, results: List[Dict], filename: str):
        """保存测试结果到文件"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"💾 结果已保存到: {filename}")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='Firecrawl N8N工作流程测试器')
    parser.add_argument('webhook_url', help='N8N工作流程的Webhook URL')
    parser.add_argument('--url', help='单个测试URL')
    parser.add_argument('--urls-file', help='包含URL列表的文件路径')
    parser.add_argument('--delay', type=float, default=1.0, help='批量测试时的请求间隔（秒）')
    parser.add_argument('--timeout', type=int, default=30, help='请求超时时间（秒）')
    parser.add_argument('--output', help='结果输出文件路径')
    
    args = parser.parse_args()
    
    # 验证webhook URL
    parsed_url = urlparse(args.webhook_url)
    if not parsed_url.scheme or not parsed_url.netloc:
        print("❌ 无效的Webhook URL")
        return
    
    tester = FirecrawlWorkflowTester(args.webhook_url)
    
    # 准备测试URL列表
    test_urls = []
    
    if args.url:
        test_urls.append(args.url)
    
    if args.urls_file:
        try:
            with open(args.urls_file, 'r', encoding='utf-8') as f:
                file_urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]
                test_urls.extend(file_urls)
        except FileNotFoundError:
            print(f"❌ 文件未找到: {args.urls_file}")
            return
    
    # 如果没有提供URL，使用默认测试URL
    if not test_urls:
        test_urls = [
            'https://example.com',
            'https://httpbin.org/html',
            'https://www.wikipedia.org'
        ]
        print("ℹ️  使用默认测试URL")
    
    print(f"🎯 Webhook URL: {args.webhook_url}")
    print(f"📋 测试URL数量: {len(test_urls)}")
    
    # 执行测试
    if len(test_urls) == 1:
        results = [tester.test_single_url(test_urls[0], args.timeout)]
    else:
        results = tester.test_multiple_urls(test_urls, args.delay)
    
    # 分析结果
    analysis = tester.analyze_results(results)
    tester.print_analysis(analysis)
    
    # 保存结果
    if args.output:
        tester.save_results(results, args.output)
    
    # 显示详细结果（仅在单个URL测试时）
    if len(test_urls) == 1 and 'error' not in results[0]:
        result = results[0]
        print(f"\n📄 页面详情:")
        print(f"  标题: {result.get('title', 'N/A')}")
        print(f"  描述: {result.get('description', 'N/A')[:100]}...")
        print(f"  内容长度: {result.get('contentStats', {}).get('wordCount', 0)} 词")
        
        media_links = result.get('mediaLinks', {})
        if media_links.get('images'):
            print(f"\n🖼️  图片链接 ({len(media_links['images'])}个):")
            for i, img in enumerate(media_links['images'][:5], 1):
                print(f"  {i}. {img}")
            if len(media_links['images']) > 5:
                print(f"  ... 还有 {len(media_links['images']) - 5} 个")


if __name__ == '__main__':
    main()