#!/usr/bin/env python3
"""
MCP Gateway 测试脚本 - Streaming 协议
测试与 localhost:8081 的 MCP 网关连接
"""
import json
import requests
import time
import sys

def test_mcp_streaming_gateway():
    """测试 MCP Streaming 网关连接"""
    base_url = "http://localhost:8081"
    
    print("🔍 测试 MCP Gateway (Streaming 协议)")
    print(f"📡 连接地址: {base_url}")
    print("-" * 50)
    
    try:
        # 1. 测试基本连接
        print("1️⃣ 测试基本连接...")
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ 网关连接成功")
        else:
            print(f"⚠️  网关响应异常: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到网关，请确认网关已启动")
        return False
    except Exception as e:
        print(f"❌ 连接测试失败: {e}")
        return False
    
    try:
        # 2. 测试 MCP Initialize
        print("\n2️⃣ 测试 MCP Initialize...")
        init_payload = {
            "jsonrpc": "2.0",
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "roots": {"listChanged": True},
                    "sampling": {}
                }
            },
            "id": 1
        }
        
        response = requests.post(
            f"{base_url}/mcp",
            json=init_payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            init_result = response.json()
            print("✅ Initialize 成功")
            print(f"📋 服务器信息: {init_result.get('result', {}).get('serverInfo', {})}")
        else:
            print(f"❌ Initialize 失败: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Initialize 测试失败: {e}")
        return False
    
    try:
        # 3. 测试 Tools List
        print("\n3️⃣ 测试 Tools List...")
        tools_payload = {
            "jsonrpc": "2.0",
            "method": "tools/list",
            "params": {},
            "id": 2
        }
        
        response = requests.post(
            f"{base_url}/mcp",
            json=tools_payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            tools_result = response.json()
            tools = tools_result.get('result', {}).get('tools', [])
            print(f"✅ Tools List 成功，共 {len(tools)} 个工具")
            
            # 显示前5个工具
            for i, tool in enumerate(tools[:5]):
                print(f"   🔧 {tool.get('name', 'Unknown')}: {tool.get('description', 'No description')}")
            
            if len(tools) > 5:
                print(f"   ... 还有 {len(tools) - 5} 个工具")
                
        else:
            print(f"❌ Tools List 失败: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Tools List 测试失败: {e}")
        return False
    
    print("\n🎉 所有测试通过！MCP Gateway 工作正常")
    return True

def test_docker_tool():
    """测试 Docker 相关工具"""
    base_url = "http://localhost:8081"
    
    print("\n🐳 测试 Docker 工具调用")
    print("-" * 30)
    
    try:
        # 调用 Docker 容器列表工具
        docker_payload = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": "list_containers",
                "arguments": {}
            },
            "id": 3
        }
        
        response = requests.post(
            f"{base_url}/mcp",
            json=docker_payload,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Docker 工具调用成功")
            print(f"📦 结果: {json.dumps(result.get('result', {}), indent=2, ensure_ascii=False)}")
        else:
            print(f"⚠️  Docker 工具调用失败: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Docker 工具测试失败: {e}")

if __name__ == "__main__":
    print("🚀 MCP Gateway 测试开始")
    print("=" * 60)
    
    # 基础连接和协议测试
    success = test_mcp_streaming_gateway()
    
    if success:
        # Docker 工具测试
        test_docker_tool()
    
    print("\n" + "=" * 60)
    print("🏁 测试完成")
    
    sys.exit(0 if success else 1)