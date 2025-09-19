#!/usr/bin/env python3
"""
Aloha本地同城AI应用 - Reddit数据收集脚本
使用Firecrawl API收集檀香山相关Reddit社区数据
"""

import requests
import json
import time
import csv
import os
from datetime import datetime
from typing import List, Dict, Any

class AlohaRedditCollector:
    def __init__(self, firecrawl_api_key: str):
        self.api_key = firecrawl_api_key
        self.base_url = "https://api.firecrawl.dev/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # 目标Reddit社区
        self.target_subreddits = [
            "r/Hawaii",
            "r/Honolulu", 
            "r/HawaiiVisitors",
            "r/BigIsland"
        ]
        
        # 关键词筛选
        self.keywords = [
            "need", "looking for", "problem", "issue", "recommend", "help",
            "困难", "需要", "寻找", "问题", "建议", "推荐", "痛点",
            "expensive", "cost", "price", "affordable", "cheap",
            "traffic", "parking", "transportation", "housing", "rent",
            "food", "restaurant", "grocery", "shopping",
            "healthcare", "doctor", "hospital", "clinic",
            "job", "work", "employment", "career",
            "tourist", "visitor", "local", "resident"
        ]
        
        self.collected_data = []
        
    def scrape_reddit_community(self, subreddit: str) -> Dict[str, Any]:
        """抓取Reddit社区数据"""
        url = f"https://www.reddit.com/{subreddit}/"
        
        payload = {
            "url": url,
            "formats": ["markdown", "json"],
            "jsonOptions": {
                "prompt": f"""
                从{subreddit}社区中提取用户需求和痛点数据，重点关注：
                1. 用户遇到的问题和困难
                2. 寻求帮助或建议的帖子
                3. 对檀香山/夏威夷生活的抱怨或建议
                4. 本地服务需求和推荐请求
                
                返回JSON格式：
                {{
                    "posts": [
                        {{
                            "title": "帖子标题",
                            "content": "帖子内容摘要",
                            "author": "作者",
                            "upvotes": "点赞数",
                            "comments_count": "评论数",
                            "category": "需求类型",
                            "pain_points": ["痛点1", "痛点2"],
                            "keywords": ["关键词1", "关键词2"],
                            "urgency": "紧急程度(低/中/高)",
                            "target_audience": "目标用户群体"
                        }}
                    ]
                }}
                """
            },
            "onlyMainContent": True,
            "timeout": 60000
        }
        
        try:
            print(f"🔍 正在抓取 {subreddit} 社区数据...")
            response = requests.post(
                f"{self.base_url}/scrape",
                headers=self.headers,
                json=payload,
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    print(f"✅ {subreddit} 数据抓取成功")
                    return {
                        "subreddit": subreddit,
                        "data": result.get("data", {}),
                        "timestamp": datetime.now().isoformat(),
                        "status": "success"
                    }
                else:
                    print(f"❌ {subreddit} 抓取失败: {result.get('error', 'Unknown error')}")
                    return {"subreddit": subreddit, "status": "failed", "error": result.get('error')}
            else:
                print(f"❌ HTTP错误 {response.status_code}: {response.text}")
                return {"subreddit": subreddit, "status": "http_error", "code": response.status_code}
                
        except Exception as e:
            print(f"❌ 抓取 {subreddit} 时发生异常: {str(e)}")
            return {"subreddit": subreddit, "status": "exception", "error": str(e)}
    
    def search_hawaii_content(self, query: str) -> Dict[str, Any]:
        """搜索夏威夷相关内容"""
        payload = {
            "query": f"{query} site:reddit.com (r/Hawaii OR r/Honolulu OR r/HawaiiVisitors OR r/BigIsland)",
            "limit": 10,
            "lang": "en",
            "country": "us",
            "scrapeOptions": {
                "formats": ["markdown", "json"],
                "jsonOptions": {
                    "prompt": f"""
                    分析搜索结果中关于"{query}"的用户需求和痛点：
                    {{
                        "query": "{query}",
                        "findings": [
                            {{
                                "source": "来源URL",
                                "title": "标题",
                                "content": "相关内容",
                                "pain_point": "识别的痛点",
                                "user_need": "用户需求",
                                "solution_opportunity": "解决方案机会"
                            }}
                        ]
                    }}
                    """
                },
                "onlyMainContent": True
            }
        }
        
        try:
            print(f"🔍 搜索关键词: {query}")
            response = requests.post(
                f"{self.base_url}/search",
                headers=self.headers,
                json=payload,
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    print(f"✅ 搜索 '{query}' 成功")
                    return {
                        "query": query,
                        "data": result.get("data", []),
                        "timestamp": datetime.now().isoformat(),
                        "status": "success"
                    }
            
            return {"query": query, "status": "failed"}
            
        except Exception as e:
            print(f"❌ 搜索 '{query}' 时发生异常: {str(e)}")
            return {"query": query, "status": "exception", "error": str(e)}
    
    def collect_all_data(self):
        """收集所有数据"""
        print("🏝️ 开始收集Aloha本地同城AI应用用户需求数据...")
        
        # 1. 抓取各个Reddit社区
        for subreddit in self.target_subreddits:
            data = self.scrape_reddit_community(subreddit)
            self.collected_data.append(data)
            time.sleep(5)  # 避免请求过于频繁
        
        # 2. 搜索特定关键词
        search_queries = [
            "Hawaii living problems",
            "Honolulu expensive cost",
            "Hawaii traffic parking issues",
            "Hawaii housing rent expensive",
            "Hawaii food grocery expensive",
            "Hawaii healthcare problems",
            "Hawaii job employment issues",
            "Hawaii tourist local problems"
        ]
        
        for query in search_queries:
            search_data = self.search_hawaii_content(query)
            self.collected_data.append(search_data)
            time.sleep(3)
        
        print(f"✅ 数据收集完成，共收集 {len(self.collected_data)} 个数据源")
    
    def save_data(self, filename: str = None):
        """保存数据到文件"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"aloha_reddit_data_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.collected_data, f, ensure_ascii=False, indent=2)
        
        print(f"📁 数据已保存到: {filename}")
        return filename
    
    def analyze_pain_points(self) -> Dict[str, Any]:
        """分析收集的痛点数据"""
        analysis = {
            "total_sources": len(self.collected_data),
            "successful_scrapes": len([d for d in self.collected_data if d.get("status") == "success"]),
            "pain_point_categories": {},
            "top_keywords": {},
            "urgency_distribution": {"高": 0, "中": 0, "低": 0},
            "recommendations": []
        }
        
        # 这里可以添加更详细的分析逻辑
        
        return analysis

def main():
    """主函数"""
    # 从环境变量获取API密钥
    api_key = os.getenv("FIRECRAWL_API_KEY")
    if not api_key:
        print("❌ 请设置FIRECRAWL_API_KEY环境变量")
        return
    
    # 创建收集器实例
    collector = AlohaRedditCollector(api_key)
    
    # 收集数据
    collector.collect_all_data()
    
    # 保存数据
    filename = collector.save_data()
    
    # 分析数据
    analysis = collector.analyze_pain_points()
    
    # 保存分析结果
    analysis_filename = filename.replace('.json', '_analysis.json')
    with open(analysis_filename, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, ensure_ascii=False, indent=2)
    
    print(f"📊 分析结果已保存到: {analysis_filename}")
    print("\n🎉 Aloha本地同城AI应用数据收集完成！")

if __name__ == "__main__":
    main()
