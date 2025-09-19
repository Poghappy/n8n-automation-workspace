#!/usr/bin/env python3
"""
Docker MCP 测试脚本
用于验证Docker MCP服务器的功能
"""

import json
import subprocess
import sys
import time
from typing import Dict, Any

def send_mcp_request(request: Dict[str, Any]) -> Dict[str, Any]:
    """发送MCP请求到Docker MCP服务器"""
    try:
        # 启动Docker MCP服务器
        process = subprocess.Popen([
            'docker', 'run', '--rm', '-i',
            '-v', '/Users/zhiledeng/.docker/run/docker.sock:/var/run/docker.sock',
            'mcp/docker'
        ], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # 发送请求
        request_json = json.dumps(request)
        stdout, stderr = process.communicate(input=request_json, timeout=10)
        
        if stderr:
            print(f"错误输出: {stderr}", file=sys.stderr)
        
        if stdout:
            try:
                return json.loads(stdout.strip())
            except json.JSONDecodeError as e:
                print(f"JSON解析错误: {e}", file=sys.stderr)
                print(f"原始输出: {stdout}", file=sys.stderr)
                return {"error": "JSON解析失败"}
        
        return {"error": "无输出"}
        
    except subprocess.TimeoutExpired:
        process.kill()
        return {"error": "请求超时"}
    except Exception as e:
        return {"error": f"执行错误: {str(e)}"}

def test_initialize():
    """测试初始化请求"""
    print("测试MCP初始化...")
    request = {
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
    
    response = send_mcp_request(request)
    print(f"初始化响应: {json.dumps(response, indent=2, ensure_ascii=False)}")
    return response

def test_list_tools():
    """测试工具列表请求"""
    print("\n测试工具列表...")
    request = {
        "jsonrpc": "2.0",
        "method": "tools/list",
        "params": {},
        "id": 2
    }
    
    response = send_mcp_request(request)
    print(f"工具列表响应: {json.dumps(response, indent=2, ensure_ascii=False)}")
    return response

def main():
    """主测试函数"""
    print("开始Docker MCP功能测试...\n")
    
    # 测试初始化
    init_response = test_initialize()
    if "error" in init_response:
        print(f"初始化失败: {init_response['error']}")
        return False
    
    # 测试工具列表
    tools_response = test_list_tools()
    if "error" in tools_response:
        print(f"工具列表获取失败: {tools_response['error']}")
        return False
    
    print("\n✅ Docker MCP测试完成")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
