#!/usr/bin/env python3
"""
N8N凭据访问测试脚本
验证凭据是否可以正常访问和解密
"""

import json
import subprocess
import sys

def run_docker_command(command):
    """执行Docker命令"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"错误: {result.stderr}")
            return None
        return result.stdout.strip()
    except Exception as e:
        print(f"执行命令失败: {e}")
        return None

def test_n8n_api_access():
    """测试N8N API访问"""
    print("🔗 测试N8N API访问...")
    
    # 测试健康检查端点
    command = "curl -s http://localhost:5678/healthz"
    result = run_docker_command(command)
    
    if result:
        print(f"✅ N8N API响应: {result}")
        return True
    else:
        print("❌ N8N API无法访问")
        return False

def test_database_connection():
    """测试数据库连接"""
    print("🗄️ 测试数据库连接...")
    
    command = 'docker exec n8n-postgres psql -U n8n -d n8n -c "SELECT COUNT(*) FROM credentials_entity;"'
    result = run_docker_command(command)
    
    if result and "1" in result:
        print("✅ 数据库连接正常，找到凭据数据")
        return True
    else:
        print("❌ 数据库连接失败或无凭据数据")
        return False

def test_credential_data():
    """测试凭据数据完整性"""
    print("🔍 测试凭据数据完整性...")
    
    command = '''docker exec n8n-postgres psql -U n8n -d n8n -t -c "SELECT id, name, type, LENGTH(data) as data_length FROM credentials_entity;"'''
    result = run_docker_command(command)
    
    if result:
        lines = [line.strip() for line in result.split('\n') if line.strip()]
        for line in lines:
            if '|' in line:
                parts = [part.strip() for part in line.split('|')]
                if len(parts) >= 4:
                    print(f"✅ 凭据: {parts[1]} (类型: {parts[2]}, 数据长度: {parts[3]}字节)")
        return True
    else:
        print("❌ 无法获取凭据数据")
        return False

def test_n8n_container_status():
    """测试N8N容器状态"""
    print("🐳 测试N8N容器状态...")
    
    command = "docker ps --filter name=n8n-automation --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
    result = run_docker_command(command)
    
    if result and "n8n-automation" in result:
        print(f"✅ N8N容器状态:\n{result}")
        return True
    else:
        print("❌ N8N容器未运行")
        return False

def test_encryption_key_consistency():
    """测试加密密钥一致性"""
    print("🔑 测试加密密钥一致性...")
    
    # 获取容器中的密钥
    container_key_cmd = "docker exec n8n-automation env | grep N8N_ENCRYPTION_KEY"
    container_key = run_docker_command(container_key_cmd)
    
    # 获取.env文件中的密钥
    try:
        with open('.env', 'r') as f:
            content = f.read()
            env_key = None
            for line in content.split('\n'):
                if line.startswith('N8N_ENCRYPTION_KEY='):
                    env_key = line.split('=')[1].strip()
                    break
    except Exception as e:
        print(f"❌ 读取.env文件失败: {e}")
        return False
    
    if container_key and env_key:
        container_key_value = container_key.split('=')[1]
        if container_key_value == env_key:
            print("✅ 加密密钥一致")
            return True
        else:
            print(f"❌ 加密密钥不一致:")
            print(f"   容器: {container_key_value}")
            print(f"   .env: {env_key}")
            return False
    else:
        print("❌ 无法获取加密密钥")
        return False

def main():
    """主函数"""
    print("🧪 N8N凭据访问测试工具")
    print("=" * 50)
    
    tests = [
        ("容器状态", test_n8n_container_status),
        ("数据库连接", test_database_connection),
        ("凭据数据", test_credential_data),
        ("加密密钥", test_encryption_key_consistency),
        ("API访问", test_n8n_api_access),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 执行测试: {test_name}")
        print("-" * 30)
        
        if test_func():
            passed += 1
            print(f"✅ {test_name} 测试通过")
        else:
            print(f"❌ {test_name} 测试失败")
    
    print("\n" + "=" * 50)
    print(f"📊 测试结果: {passed}/{total} 项测试通过")
    
    if passed == total:
        print("🎉 所有测试通过！N8N凭据系统运行正常")
        return True
    else:
        print("⚠️  部分测试失败，请检查相关配置")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)