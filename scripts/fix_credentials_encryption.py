#!/usr/bin/env python3
"""
N8N凭据加密密钥修复脚本
解决加密密钥不一致导致的凭据解密问题
"""

import json
import os
import sys
import subprocess
import base64
from datetime import datetime
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

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

def get_current_encryption_key():
    """获取当前容器中的加密密钥"""
    print("🔑 获取当前N8N容器的加密密钥...")
    
    command = "docker exec n8n-automation env | grep N8N_ENCRYPTION_KEY"
    result = run_docker_command(command)
    
    if result:
        key = result.split('=')[1]
        print(f"✅ 当前加密密钥: {key}")
        return key
    else:
        print("❌ 无法获取当前加密密钥")
        return None

def get_env_file_encryption_key():
    """获取.env文件中的加密密钥"""
    print("📄 读取.env文件中的加密密钥...")
    
    try:
        with open('.env', 'r', encoding='utf-8') as f:
            content = f.read()
            
        for line in content.split('\n'):
            if line.startswith('N8N_ENCRYPTION_KEY='):
                key = line.split('=')[1].strip()
                print(f"✅ .env文件加密密钥: {key}")
                return key
        
        print("❌ .env文件中未找到N8N_ENCRYPTION_KEY")
        return None
    except Exception as e:
        print(f"❌ 读取.env文件失败: {e}")
        return None

def backup_database():
    """备份数据库"""
    print("💾 创建数据库备份...")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = f"./backups/db_backup_{timestamp}"
    os.makedirs(backup_dir, exist_ok=True)
    
    # 备份整个数据库
    command = f'docker exec n8n-postgres pg_dump -U n8n -d n8n > {backup_dir}/n8n_database.sql'
    result = run_docker_command(command)
    
    if result is None:
        print("❌ 数据库备份失败")
        return None
    
    print(f"✅ 数据库备份完成: {backup_dir}")
    return backup_dir

def get_credentials_from_db():
    """从数据库获取凭据数据"""
    print("🔍 从数据库获取凭据数据...")
    
    sql_query = """
    SELECT id, name, type, data 
    FROM credentials_entity 
    ORDER BY "createdAt";
    """
    
    command = f'docker exec n8n-postgres psql -U n8n -d n8n -t -c "{sql_query}"'
    result = run_docker_command(command)
    
    if not result:
        print("❌ 无法从数据库获取凭据数据")
        return []
    
    # 解析查询结果
    lines = [line.strip() for line in result.split('\n') if line.strip()]
    credentials = []
    
    for line in lines:
        if '|' in line:
            parts = [part.strip() for part in line.split('|')]
            if len(parts) >= 4:
                credential = {
                    'id': parts[0],
                    'name': parts[1],
                    'type': parts[2],
                    'data': parts[3]
                }
                credentials.append(credential)
    
    print(f"📊 获取到 {len(credentials)} 个凭据")
    return credentials

def create_n8n_key_derivation(encryption_key):
    """创建N8N风格的密钥派生（模拟N8N的加密方式）"""
    try:
        # N8N使用简单的密钥处理方式
        # 这里我们使用原始密钥的前32字节
        key_bytes = encryption_key.encode('utf-8')
        
        # 如果密钥长度不足32字节，用0填充
        if len(key_bytes) < 32:
            key_bytes = key_bytes.ljust(32, b'0')
        elif len(key_bytes) > 32:
            key_bytes = key_bytes[:32]
        
        # 使用base64编码作为Fernet密钥
        fernet_key = base64.urlsafe_b64encode(key_bytes)
        return Fernet(fernet_key)
    except Exception as e:
        print(f"❌ 创建加密器失败: {e}")
        return None

def try_decrypt_credential(encrypted_data, encryption_key):
    """尝试解密凭据数据"""
    try:
        # 创建解密器
        cipher = create_n8n_key_derivation(encryption_key)
        if not cipher:
            return None
        
        # N8N的加密数据通常是base64编码的
        try:
            encrypted_bytes = base64.b64decode(encrypted_data)
            decrypted_data = cipher.decrypt(encrypted_bytes)
            return json.loads(decrypted_data.decode('utf-8'))
        except:
            # 如果base64解码失败，尝试直接解密
            decrypted_data = cipher.decrypt(encrypted_data.encode('utf-8'))
            return json.loads(decrypted_data.decode('utf-8'))
    except Exception as e:
        return None

def re_encrypt_credential(credential_data, new_encryption_key):
    """使用新密钥重新加密凭据数据"""
    try:
        # 创建新的加密器
        cipher = create_n8n_key_derivation(new_encryption_key)
        if not cipher:
            return None
        
        # 加密数据
        json_data = json.dumps(credential_data)
        encrypted_data = cipher.encrypt(json_data.encode('utf-8'))
        
        # 返回base64编码的加密数据
        return base64.b64encode(encrypted_data).decode('utf-8')
    except Exception as e:
        print(f"❌ 重新加密失败: {e}")
        return None

def update_credential_in_db(credential_id, new_encrypted_data):
    """更新数据库中的凭据数据"""
    try:
        # 转义单引号
        escaped_data = new_encrypted_data.replace("'", "''")
        
        sql_update = f"""
        UPDATE credentials_entity 
        SET data = '{escaped_data}', "updatedAt" = NOW() 
        WHERE id = '{credential_id}';
        """
        
        command = f'docker exec n8n-postgres psql -U n8n -d n8n -c "{sql_update}"'
        result = run_docker_command(command)
        
        return result is not None
    except Exception as e:
        print(f"❌ 更新数据库失败: {e}")
        return False

def fix_credentials_encryption():
    """修复凭据加密问题"""
    print("🔧 开始修复凭据加密问题...")
    
    # 获取当前和目标加密密钥
    current_key = get_current_encryption_key()
    env_key = get_env_file_encryption_key()
    
    if not current_key or not env_key:
        print("❌ 无法获取加密密钥")
        return False
    
    if current_key == env_key:
        print("✅ 加密密钥已一致，无需修复")
        return True
    
    print(f"🔄 需要将密钥从 {current_key} 更新为 {env_key}")
    
    # 备份数据库
    backup_dir = backup_database()
    if not backup_dir:
        return False
    
    # 获取凭据数据
    credentials = get_credentials_from_db()
    if not credentials:
        print("❌ 没有凭据需要修复")
        return False
    
    # 修复每个凭据
    success_count = 0
    for cred in credentials:
        print(f"🔄 处理凭据: {cred['name']} ({cred['id']})")
        
        # 尝试用当前密钥解密
        decrypted_data = try_decrypt_credential(cred['data'], current_key)
        
        if decrypted_data is None:
            print(f"⚠️  无法解密凭据 {cred['name']}，跳过")
            continue
        
        # 用新密钥重新加密
        new_encrypted_data = re_encrypt_credential(decrypted_data, env_key)
        
        if new_encrypted_data is None:
            print(f"❌ 无法重新加密凭据 {cred['name']}")
            continue
        
        # 更新数据库
        if update_credential_in_db(cred['id'], new_encrypted_data):
            print(f"✅ 凭据 {cred['name']} 修复成功")
            success_count += 1
        else:
            print(f"❌ 凭据 {cred['name']} 数据库更新失败")
    
    print(f"📊 修复完成: {success_count}/{len(credentials)} 个凭据修复成功")
    print(f"💾 数据库备份位置: {backup_dir}")
    
    return success_count > 0

def restart_services():
    """重启相关服务"""
    print("🔄 重启N8N服务...")
    
    # 重启N8N容器
    command = "docker restart n8n-automation"
    result = run_docker_command(command)
    
    if result is None:
        print("❌ 重启N8N容器失败")
        return False
    
    print("✅ N8N容器重启成功")
    
    # 等待服务启动
    print("⏳ 等待服务启动...")
    import time
    time.sleep(10)
    
    return True

def main():
    """主函数"""
    print("🚀 N8N凭据加密密钥修复工具")
    print("=" * 50)
    
    # 检查依赖
    try:
        import cryptography
        print("✅ 加密库检查通过")
    except ImportError:
        print("❌ 缺少cryptography库，请安装: pip install cryptography")
        return False
    
    # 修复凭据加密
    if not fix_credentials_encryption():
        print("❌ 凭据加密修复失败")
        return False
    
    # 重启服务
    if not restart_services():
        print("❌ 服务重启失败")
        return False
    
    print("\n🎉 凭据加密修复完成！")
    print("📋 请检查N8N界面中的凭据是否可以正常使用")
    print("🔗 访问: http://localhost:5678")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)