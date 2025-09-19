"""
安全验证模块
提供安全相关的验证和检查功能
"""

import hashlib
import hmac
import secrets
import re
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class SecurityValidator:
    """安全验证器"""
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.max_input_length = self.config.get('max_input_length', 10000)
        self.allowed_domains = self.config.get('allowed_domains', [])
        self.blocked_patterns = self.config.get('blocked_patterns', [])
        
        # 默认的危险模式
        self.default_blocked_patterns = [
            r'<script[^>]*>.*?</script>',  # XSS
            r'javascript:',  # JavaScript协议
            r'on\w+\s*=',  # 事件处理器
            r'eval\s*\(',  # eval函数
            r'exec\s*\(',  # exec函数
        ]
    
    def validate_input(self, data: Any) -> Dict[str, Any]:
        """验证输入数据"""
        result = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        try:
            # 检查数据类型
            if isinstance(data, str):
                result.update(self._validate_string(data))
            elif isinstance(data, dict):
                result.update(self._validate_dict(data))
            elif isinstance(data, list):
                result.update(self._validate_list(data))
            
        except Exception as e:
            logger.error(f"安全验证失败: {e}")
            result['valid'] = False
            result['errors'].append(f"验证过程中发生错误: {str(e)}")
        
        return result
    
    def _validate_string(self, text: str) -> Dict[str, Any]:
        """验证字符串"""
        result = {'valid': True, 'errors': [], 'warnings': []}
        
        # 长度检查
        if len(text) > self.max_input_length:
            result['valid'] = False
            result['errors'].append(f"输入长度超过限制 ({self.max_input_length})")
        
        # 危险模式检查
        all_patterns = self.default_blocked_patterns + self.blocked_patterns
        for pattern in all_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                result['valid'] = False
                result['errors'].append(f"检测到危险模式: {pattern}")
        
        return result
    
    def _validate_dict(self, data: Dict) -> Dict[str, Any]:
        """验证字典数据"""
        result = {'valid': True, 'errors': [], 'warnings': []}
        
        for key, value in data.items():
            # 递归验证值
            sub_result = self.validate_input(value)
            if not sub_result['valid']:
                result['valid'] = False
                result['errors'].extend([f"键 '{key}': {error}" for error in sub_result['errors']])
            result['warnings'].extend([f"键 '{key}': {warning}" for warning in sub_result['warnings']])
        
        return result
    
    def _validate_list(self, data: List) -> Dict[str, Any]:
        """验证列表数据"""
        result = {'valid': True, 'errors': [], 'warnings': []}
        
        for i, item in enumerate(data):
            # 递归验证项目
            sub_result = self.validate_input(item)
            if not sub_result['valid']:
                result['valid'] = False
                result['errors'].extend([f"索引 {i}: {error}" for error in sub_result['errors']])
            result['warnings'].extend([f"索引 {i}: {warning}" for warning in sub_result['warnings']])
        
        return result
    
    def validate_url(self, url: str) -> bool:
        """验证URL安全性"""
        if not url:
            return False
        
        # 检查协议
        if not url.startswith(('http://', 'https://')):
            return False
        
        # 检查域名白名单
        if self.allowed_domains:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            if not any(domain.endswith(allowed) for allowed in self.allowed_domains):
                return False
        
        return True
    
    def generate_token(self, length: int = 32) -> str:
        """生成安全令牌"""
        return secrets.token_urlsafe(length)
    
    def hash_password(self, password: str, salt: Optional[str] = None) -> Dict[str, str]:
        """哈希密码"""
        if salt is None:
            salt = secrets.token_hex(16)
        
        # 使用PBKDF2进行哈希
        hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        
        return {
            'hash': hashed.hex(),
            'salt': salt
        }
    
    def verify_password(self, password: str, hash_data: Dict[str, str]) -> bool:
        """验证密码"""
        try:
            salt = hash_data['salt']
            expected_hash = hash_data['hash']
            
            # 重新计算哈希
            computed_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
            
            # 使用hmac.compare_digest防止时序攻击
            return hmac.compare_digest(expected_hash, computed_hash.hex())
        except Exception as e:
            logger.error(f"密码验证失败: {e}")
            return False
    
    def sanitize_input(self, text: str) -> str:
        """清理输入文本"""
        if not isinstance(text, str):
            return str(text)
        
        # 移除危险字符
        sanitized = re.sub(r'[<>"\']', '', text)
        
        # 限制长度
        if len(sanitized) > self.max_input_length:
            sanitized = sanitized[:self.max_input_length]
        
        return sanitized.strip()


def create_security_validator(config: Optional[Dict] = None) -> SecurityValidator:
    """创建安全验证器实例"""
    return SecurityValidator(config)


# 默认实例
default_validator = SecurityValidator()

# 便捷函数
def validate_input(data: Any) -> Dict[str, Any]:
    """验证输入数据的便捷函数"""
    return default_validator.validate_input(data)

def validate_url(url: str) -> bool:
    """验证URL的便捷函数"""
    return default_validator.validate_url(url)

def sanitize_input(text: str) -> str:
    """清理输入的便捷函数"""
    return default_validator.sanitize_input(text)