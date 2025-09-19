#!/usr/bin/env python3
"""
简单的新闻数据接收API服务器
用于接收N8N工作流发送的新闻数据
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime
import uvicorn

app = FastAPI(title="新闻数据API", description="接收和存储N8N工作流抓取的新闻数据")

# 数据模型
class NewsItem(BaseModel):
    title: str
    description: Optional[str] = None
    url: str
    content: Optional[str] = None
    publishedAt: str
    keywords: Optional[str] = None
    language: Optional[str] = "unknown"

# 数据存储目录
DATA_DIR = "/Users/zhiledeng/Documents/augment-projects/N8N-自动化/data"
os.makedirs(DATA_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "新闻数据API服务器运行中", "status": "active"}

@app.post("/api/news")
async def save_news(news_item: NewsItem):
    """接收并保存新闻数据"""
    try:
        # 生成文件名（基于时间戳）
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"news_{timestamp}_{hash(news_item.url) % 10000}.json"
        filepath = os.path.join(DATA_DIR, filename)
        
        # 保存数据
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(news_item.dict(), f, ensure_ascii=False, indent=2)
        
        return {
            "status": "success", 
            "message": "新闻数据保存成功",
            "filename": filename,
            "data": news_item.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"保存数据失败: {str(e)}")

@app.get("/api/news")
async def get_news():
    """获取所有保存的新闻数据"""
    try:
        news_files = [f for f in os.listdir(DATA_DIR) if f.startswith('news_') and f.endswith('.json')]
        news_data = []
        
        for filename in sorted(news_files, reverse=True)[:20]:  # 最新20条
            filepath = os.path.join(DATA_DIR, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                data['saved_at'] = filename
                news_data.append(data)
        
        return {
            "status": "success",
            "count": len(news_data),
            "data": news_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取数据失败: {str(e)}")

if __name__ == "__main__":
    print("启动新闻数据API服务器...")
    print(f"数据存储目录: {DATA_DIR}")
    print("API端点:")
    print("  POST /api/news - 保存新闻数据")
    print("  GET /api/news - 获取新闻数据")
    print("  GET / - 服务器状态")
    
    uvicorn.run(app, host="0.0.0.0", port=3000)