#!/usr/bin/env python3
"""
N8N凭据导出脚本
从PostgreSQL数据库导出凭据到文件系统
"""

import json
import os
import sys
import subprocess
from datetime import datetime

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

def export_credentials_from_db():
    """从数据库导出凭据"""
    print("🔍 正在从数据库查询凭据...")
    
    # 查询凭据数据
    sql_query = """
    SELECT id, name, type, data, "createdAt", "updatedAt" 
    FROM credentials_entity 
    ORDER BY "createdAt";
    """
    
    command = f'docker exec n8n-postgres psql -U n8n -d n8n -t -c "{sql_query}"'
    result = run_docker_command(command)
    
    if not result:
        print("❌ 无法从数据库获取凭据数据")
        return False
    
    print(f"✅ 找到凭据数据:\n{result}")
    
    # 解析查询结果
    lines = [line.strip() for line in result.split('\n') if line.strip()]
    credentials = []
    
    for line in lines:
        if '|' in line:
            parts = [part.strip() for part in line.split('|')]
            if len(parts) >= 6:
                credential = {
                    'id': parts[0],
                    'name': parts[1],
                    'type': parts[2],
                    'data': parts[3],
                    'createdAt': parts[4],
                    'updatedAt': parts[5]
                }
                credentials.append(credential)
    
    print(f"📊 解析到 {len(credentials)} 个凭据")
    return credentials

def create_credential_files(credentials):
    """创建凭据文件"""
    if not credentials:
        print("❌ 没有凭据需要创建文件")
        return False
    
    print("📁 正在创建凭据文件...")
    
    # 创建本地凭据目录
    local_cred_dir = "./n8n/credentials"
    os.makedirs(local_cred_dir, exist_ok=True)
    
    for cred in credentials:
        # 创建凭据文件内容
        credential_data = {
            "id": cred['id'],
            "name": cred['name'],
            "type": cred['type'],
            "data": cred['data'],  # 这是加密的数据
            "createdAt": cred['createdAt'],
            "updatedAt": cred['updatedAt']
        }
        
        # 写入文件
        filename = f"{cred['id']}.json"
        filepath = os.path.join(local_cred_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(credential_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ 创建凭据文件: {filename}")
    
    return True

def copy_credentials_to_container():
    """将凭据文件复制到容器"""
    print("📋 正在将凭据文件复制到N8N容器...")
    
    # 复制凭据文件到容器
    command = "docker cp ./n8n/credentials/. n8n-automation:/home/node/.n8n/credentials/"
    result = run_docker_command(command)
    
    if result is None:
        print("❌ 复制凭据文件到容器失败")
        return False
    
    # 验证复制结果
    command = "docker exec n8n-automation ls -la /home/node/.n8n/credentials/"
    result = run_docker_command(command)
    
    if result:
        print(f"✅ 容器内凭据文件:\n{result}")
        return True
    else:
        print("❌ 无法验证容器内凭据文件")
        return False

def restart_n8n_container():
    """重启N8N容器"""
    print("🔄 正在重启N8N容器...")
    
    command = "docker restart n8n-automation"
    result = run_docker_command(command)
    
    if result is None:
        print("❌ 重启N8N容器失败")
        return False
    
    print("✅ N8N容器重启成功")
    return True

def create_backup():
    """创建备份"""
    print("💾 正在创建备份...")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = f"./backups/credentials_backup_{timestamp}"
    os.makedirs(backup_dir, exist_ok=True)
    
    # 备份数据库凭据表
    command = f'docker exec n8n-postgres pg_dump -U n8n -d n8n -t credentials_entity > {backup_dir}/credentials_table.sql'
    result = run_docker_command(command)
    
    # 备份现有凭据文件（如果有）
    if os.path.exists("./n8n/credentials"):
        import shutil
        shutil.copytree("./n8n/credentials", f"{backup_dir}/credentials_files", dirs_exist_ok=True)
    
    print(f"✅ 备份创建完成: {backup_dir}")
    return backup_dir

def main():
    """主函数"""
    print("🚀 N8N凭据导出修复工具")
    print("=" * 50)
    
    # 创建备份
    backup_dir = create_backup()
    if not backup_dir:
        print("❌ 备份创建失败，停止执行")
        return False
    
    # 从数据库导出凭据
    credentials = export_credentials_from_db()
    if not credentials:
        print("❌ 无法从数据库导出凭据")
        return False
    
    # 创建凭据文件
    if not create_credential_files(credentials):
        print("❌ 创建凭据文件失败")
        return False
    
    # 复制到容器
    if not copy_credentials_to_container():
        print("❌ 复制凭据文件到容器失败")
        return False
    
    # 重启容器
    if not restart_n8n_container():
        print("❌ 重启N8N容器失败")
        return False
    
    print("\n🎉 凭据导出修复完成！")
    print("📋 请检查N8N界面中的凭据是否已恢复")
    print(f"💾 备份位置: {backup_dir}")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)