import os
import json
from typing import Dict, Any

def load_config(config_path: str = "/app/config.json") -> Dict[str, Any]:
    """加载配置文件"""
    default_config = {
        "n8n": {
            "base_url": "http://localhost:5678",
            "api_key": os.getenv("N8N_API_KEY", "")
        },
        "system": {
            "debug": os.getenv("DEBUG", "false").lower() == "true",
            "log_level": os.getenv("LOG_LEVEL", "INFO")
        }
    }
    
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                config = json.load(f)
                default_config.update(config)
        except Exception:
            pass
    
    return default_config
