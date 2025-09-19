#!/usr/bin/env python3
"""
N8N自动化集成系统 - 安装配置
"""

from setuptools import setup, find_packages
from pathlib import Path

# 读取README文件
readme_file = Path(__file__).parent / "README.md"
long_description = readme_file.read_text(encoding="utf-8") if readme_file.exists() else ""

# 读取requirements文件
requirements_file = Path(__file__).parent / "requirements.txt"
requirements = []
if requirements_file.exists():
    with open(requirements_file, 'r', encoding='utf-8') as f:
        requirements = [
            line.strip() 
            for line in f 
            if line.strip() and not line.startswith('#')
        ]

setup(
    name="n8n-automation-system",
    version="1.0.0",
    author="AI智能体开发团队",
    author_email="dev@huoniao.com",
    description="基于N8N的企业级自动化集成系统，集成AI智能体协作框架",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/huoniao/n8n-automation-system",
    project_urls={
        "Bug Tracker": "https://github.com/huoniao/n8n-automation-system/issues",
        "Documentation": "https://docs.huoniao.com/n8n-automation",
        "Source Code": "https://github.com/huoniao/n8n-automation-system",
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: System Administrators",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: System :: Systems Administration",
        "Topic :: Office/Business :: Scheduling",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
    ],
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.4.3",
            "pytest-asyncio>=0.21.1",
            "pytest-cov>=4.1.0",
            "black>=23.11.0",
            "flake8>=6.1.0",
            "mypy>=1.7.1",
            "isort>=5.12.0",
        ],
        "docs": [
            "sphinx>=7.2.6",
            "sphinx-rtd-theme>=1.3.0",
        ],
        "monitoring": [
            "prometheus-client>=0.19.0",
            "sentry-sdk>=1.38.0",
        ],
        "ml": [
            "openai>=1.3.7",
            "langchain>=0.0.340",
            "transformers>=4.35.2",
            "scikit-learn>=1.3.2",
        ],
    },
    entry_points={
        "console_scripts": [
            "n8n-ai-system=src.main:main",
            "n8n-workflow-exec=src.agents.workflow_executive:main",
            "n8n-teaching-agent=src.agents.teaching_agent:main",
        ],
    },
    include_package_data=True,
    package_data={
        "src": [
            "templates/*.json",
            "templates/*.yaml",
            "knowledge/*.json",
            "knowledge/*.md",
            "config/*.yaml",
            "config/*.json",
        ],
    },
    zip_safe=False,
    keywords=[
        "n8n",
        "automation",
        "workflow",
        "ai-agent",
        "integration",
        "enterprise",
        "mcp",
        "huoniao",
    ],
)