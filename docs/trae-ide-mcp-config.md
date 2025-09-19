# Trae IDE MCP 配置格式指南

## 概述

Trae IDE 通过 MCP (Model Context Protocol) 实现与外部工具和服务的无缝集成。本指南提供完整的 MCP 配置格式和最佳实践。

## 🔧 基础配置格式

### 1. MCP 配置文件结构

```json
{
  "mcpServers": {
    "server-name": {
      "command": "command-to-run",
      "args": ["arg1", "arg2"],
      "env": {
        "ENV_VAR": "value"
      },
      "cwd": "/path/to/working/directory",
      "disabled": false
    }
  }
}
```

### 2. 配置文件位置

#### macOS
```bash
~/.config/trae/mcp_settings.json
# 或者
~/Library/Application Support/Trae/mcp_settings.json
```

#### Windows
```bash
%APPDATA%\Trae\mcp_settings.json
# 或者
%USERPROFILE%\.config\trae\mcp_settings.json
```

#### Linux
```bash
~/.config/trae/mcp_settings.json
# 或者
$XDG_CONFIG_HOME/trae/mcp_settings.json
```

## 🚀 常用 MCP 服务器配置

### 1. 文件系统操作 MCP

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 2. Git 操作 MCP

```json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "/path/to/repo"],
      "cwd": "/path/to/repo"
    }
  }
}
```

### 3. 数据库 MCP (PostgreSQL)

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:password@localhost:5432/dbname"
      }
    }
  }
}
```

### 4. SQLite 数据库 MCP

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "/path/to/database.db"]
    }
  }
}
```

### 5. 浏览器自动化 MCP (Puppeteer)

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "env": {
        "PUPPETEER_HEADLESS": "true"
      }
    }
  }
}
```

### 6. Slack 集成 MCP

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token",
        "SLACK_APP_TOKEN": "xapp-your-app-token"
      }
    }
  }
}
```

### 7. GitHub 集成 MCP

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

### 8. Google Drive MCP

```json
{
  "mcpServers": {
    "gdrive": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-gdrive"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account-key.json"
      }
    }
  }
}
```

## 🔐 安全配置

### 1. 环境变量管理

```json
{
  "mcpServers": {
    "secure-server": {
      "command": "your-mcp-server",
      "args": ["--config", "/secure/path/config.json"],
      "env": {
        "API_KEY": "${MCP_API_KEY}",
        "SECRET_TOKEN": "${MCP_SECRET_TOKEN}",
        "DATABASE_URL": "${MCP_DATABASE_URL}"
      }
    }
  }
}
```

### 2. 权限限制配置

```json
{
  "mcpServers": {
    "restricted-fs": {
      "command": "npx",
      "args": [
        "-y", 
        "@modelcontextprotocol/server-filesystem",
        "--allowed-directory", "/safe/directory",
        "--read-only"
      ]
    }
  }
}
```

## 🛠️ 高级配置选项

### 1. 多服务器配置

```json
{
  "mcpServers": {
    "development-tools": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    "production-db": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${PROD_DB_URL}"
      },
      "disabled": false
    },
    "testing-tools": {
      "command": "python",
      "args": ["-m", "custom_mcp_server"],
      "cwd": "/path/to/test/tools",
      "disabled": true
    }
  }
}
```

### 2. 条件配置

```json
{
  "mcpServers": {
    "local-dev": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/local/workspace"],
      "env": {
        "NODE_ENV": "development"
      },
      "disabled": "${NODE_ENV !== 'development'}"
    },
    "cloud-services": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-aws"],
      "env": {
        "AWS_REGION": "us-west-2",
        "AWS_ACCESS_KEY_ID": "${AWS_ACCESS_KEY_ID}",
        "AWS_SECRET_ACCESS_KEY": "${AWS_SECRET_ACCESS_KEY}"
      },
      "disabled": "${NODE_ENV === 'development'}"
    }
  }
}
```

## 📋 配置验证

### 1. 基本验证脚本

```bash
#!/bin/bash
# validate-mcp-config.sh

CONFIG_FILE="$HOME/.config/trae/mcp_settings.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ MCP配置文件不存在: $CONFIG_FILE"
    exit 1
fi

# 验证JSON格式
if ! jq empty "$CONFIG_FILE" 2>/dev/null; then
    echo "❌ MCP配置文件JSON格式错误"
    exit 1
fi

echo "✅ MCP配置文件格式正确"

# 检查必需的环境变量
REQUIRED_VARS=$(jq -r '.mcpServers[].env | keys[]' "$CONFIG_FILE" 2>/dev/null | grep '${' | sed 's/.*{\(.*\)}.*/\1/' | sort -u)

for var in $REQUIRED_VARS; do
    if [ -z "${!var}" ]; then
        echo "⚠️  环境变量未设置: $var"
    else
        echo "✅ 环境变量已设置: $var"
    fi
done
```

### 2. 连接测试

```javascript
// test-mcp-connection.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testMCPConnection(serverName, config) {
    return new Promise((resolve, reject) => {
        const process = spawn(config.command, config.args, {
            env: { ...process.env, ...config.env },
            cwd: config.cwd || process.cwd()
        });

        let output = '';
        let errorOutput = '';

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        process.on('close', (code) => {
            if (code === 0) {
                resolve({ serverName, status: 'success', output });
            } else {
                reject({ serverName, status: 'error', code, errorOutput });
            }
        });

        // 5秒超时
        setTimeout(() => {
            process.kill();
            reject({ serverName, status: 'timeout' });
        }, 5000);
    });
}
```

## 🔄 动态配置管理

### 1. 配置热重载

```json
{
  "mcpServers": {
    "hot-reload-server": {
      "command": "nodemon",
      "args": [
        "--watch", "/config/path",
        "--ext", "json,js",
        "your-mcp-server.js"
      ]
    }
  },
  "watchConfig": true,
  "reloadOnChange": true
}
```

### 2. 配置模板

```json
{
  "templates": {
    "database-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-${DB_TYPE}"],
      "env": {
        "CONNECTION_STRING": "${DB_CONNECTION_STRING}"
      }
    }
  },
  "mcpServers": {
    "main-db": {
      "extends": "database-server",
      "env": {
        "DB_TYPE": "postgres",
        "DB_CONNECTION_STRING": "${POSTGRES_URL}"
      }
    },
    "cache-db": {
      "extends": "database-server",
      "env": {
        "DB_TYPE": "redis",
        "DB_CONNECTION_STRING": "${REDIS_URL}"
      }
    }
  }
}
```

## 🐛 故障排除

### 1. 常见错误及解决方案

#### 服务器启动失败
```json
{
  "mcpServers": {
    "debug-server": {
      "command": "node",
      "args": ["--inspect", "your-mcp-server.js"],
      "env": {
        "DEBUG": "*",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

#### 权限问题
```json
{
  "mcpServers": {
    "filesystem-safe": {
      "command": "npx",
      "args": [
        "-y", 
        "@modelcontextprotocol/server-filesystem",
        "--allowed-directory", "/safe/path",
        "--no-write"
      ]
    }
  }
}
```

#### 网络连接问题
```json
{
  "mcpServers": {
    "network-server": {
      "command": "your-server",
      "args": ["--timeout", "30000", "--retry", "3"],
      "env": {
        "HTTP_PROXY": "${HTTP_PROXY}",
        "HTTPS_PROXY": "${HTTPS_PROXY}"
      }
    }
  }
}
```

### 2. 日志配置

```json
{
  "logging": {
    "level": "info",
    "file": "/var/log/trae/mcp.log",
    "maxSize": "10MB",
    "maxFiles": 5
  },
  "mcpServers": {
    "logged-server": {
      "command": "your-server",
      "args": ["--log-level", "debug"],
      "env": {
        "LOG_FILE": "/var/log/trae/server-specific.log"
      }
    }
  }
}
```

## 📚 最佳实践

### 1. 配置组织

```json
{
  "profiles": {
    "development": {
      "mcpServers": {
        "local-fs": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"]
        }
      }
    },
    "production": {
      "mcpServers": {
        "cloud-storage": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-s3"],
          "env": {
            "AWS_REGION": "us-west-2"
          }
        }
      }
    }
  },
  "activeProfile": "${NODE_ENV || 'development'}"
}
```

### 2. 安全检查清单

- [ ] 使用环境变量存储敏感信息
- [ ] 限制文件系统访问权限
- [ ] 启用连接超时
- [ ] 定期轮换API密钥
- [ ] 监控异常连接
- [ ] 使用最小权限原则
- [ ] 定期更新MCP服务器版本

### 3. 性能优化

```json
{
  "performance": {
    "maxConcurrentServers": 10,
    "connectionTimeout": 30000,
    "keepAliveInterval": 60000,
    "maxRetries": 3
  },
  "mcpServers": {
    "optimized-server": {
      "command": "your-server",
      "args": ["--max-connections", "100", "--pool-size", "10"],
      "env": {
        "NODE_OPTIONS": "--max-old-space-size=4096"
      }
    }
  }
}
```

## 🔗 集成示例

### 1. N8N + Trae IDE MCP 集成

```json
{
  "mcpServers": {
    "n8n-integration": {
      "command": "npx",
      "args": ["-y", "n8n-mcp-server"],
      "env": {
        "N8N_HOST": "http://localhost:5678",
        "N8N_API_KEY": "${N8N_API_KEY}"
      }
    }
  }
}
```

### 2. 自定义工作流 MCP

```json
{
  "mcpServers": {
    "workflow-automation": {
      "command": "python",
      "args": ["-m", "workflow_mcp_server"],
      "cwd": "/path/to/workflow/tools",
      "env": {
        "WORKFLOW_CONFIG": "/path/to/workflow/config.json",
        "TRAE_INTEGRATION": "true"
      }
    }
  }
}
```

---

**配置文件版本**: 2.0  
**兼容 Trae IDE 版本**: 2.0+  
**最后更新**: 2025-01-20  
**维护者**: Trae IDE MCP 专家团队

## 📞 支持与帮助

- **官方文档**: https://docs.trae.ai/mcp
- **社区论坛**: https://community.trae.ai
- **GitHub Issues**: https://github.com/trae-ai/trae/issues
- **Discord**: https://discord.gg/trae-ai