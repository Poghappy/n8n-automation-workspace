#!/usr/bin/env python3
"""
MCP Gateway 测试脚本 - STDIO 协议
基于用户提供的精确脚本，测试 stdio 模式的 MCP 连接
"""
import json, subprocess, io

CMD = [
  "docker","run","--rm","-i",
  "-e","DOCKER_HOST=unix:///var/run/docker.sock",
  "-v","/var/run/docker.sock:/var/run/docker.sock",
  "mcp/docker","--transport","stdio","--debug"
]

def encode(msg):
    b = json.dumps(msg,separators=(",",":")).encode()
    return f"Content-Length: {len(b)}\r\n\r\n".encode() + b

def read_frame(out: io.BufferedReader):
    headers=b""
    while True:
        line=out.readline()
        if not line: return None
        if line in (b"\r\n", b"\n"): break
        headers += line
    length = 0
    for h in headers.splitlines():
        if h.lower().startswith(b"content-length:"):
            length = int(h.split(b":",1)[1].strip()); break
    body = out.read(length)
    return json.loads(body.decode())

print("🚀 启动 MCP Docker 容器 (stdio 模式)")
print(f"📋 命令: {' '.join(CMD)}")
print("-" * 60)

try:
    p = subprocess.Popen(CMD, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    print("1️⃣ 发送 initialize 请求...")
    init_msg = {
        "jsonrpc":"2.0",
        "method":"initialize", 
        "params":{
            "protocolVersion":"2024-11-05",
            "capabilities":{
                "roots":{"listChanged":True},
                "sampling":{}
            }
        }, 
        "id":1
    }
    
    p.stdin.write(encode(init_msg))
    p.stdin.flush()
    
    init_response = read_frame(p.stdout)
    if init_response:
        print("✅ Initialize 成功")
        print(f"📋 服务器信息: {json.dumps(init_response.get('result', {}), indent=2, ensure_ascii=False)}")
    else:
        print("❌ Initialize 失败 - 无响应")
        stderr_output = p.stderr.read().decode()
        if stderr_output:
            print(f"🔍 错误输出: {stderr_output}")
        p.terminate()
        exit(1)

    print("\n2️⃣ 发送 tools/list 请求...")
    tools_msg = {
        "jsonrpc":"2.0",
        "method":"tools/list",
        "params":{},
        "id":2
    }
    
    p.stdin.write(encode(tools_msg))
    p.stdin.flush()
    
    tools_response = read_frame(p.stdout)
    if tools_response:
        tools = tools_response.get('result', {}).get('tools', [])
        print(f"✅ Tools List 成功，共 {len(tools)} 个工具")
        
        # 显示前5个工具
        for i, tool in enumerate(tools[:5]):
            print(f"   🔧 {tool.get('name', 'Unknown')}: {tool.get('description', 'No description')}")
        
        if len(tools) > 5:
            print(f"   ... 还有 {len(tools) - 5} 个工具")
    else:
        print("❌ Tools List 失败 - 无响应")

    print("\n🎉 STDIO 模式测试完成！")
    p.terminate()

except Exception as e:
    print(f"❌ 测试过程中发生错误: {e}")
    if 'p' in locals():
        stderr_output = p.stderr.read().decode()
        if stderr_output:
            print(f"🔍 容器错误输出: {stderr_output}")
        p.terminate()
    exit(1)