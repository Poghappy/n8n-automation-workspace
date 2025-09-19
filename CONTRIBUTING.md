# 贡献指南

感谢您对N8N自动化工作空间项目的关注！我们欢迎所有形式的贡献，包括但不限于代码、文档、问题报告和功能建议。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [提交指南](#提交指南)
- [代码规范](#代码规范)
- [测试指南](#测试指南)
- [文档贡献](#文档贡献)
- [问题报告](#问题报告)
- [功能请求](#功能请求)

## 行为准则

参与此项目即表示您同意遵守我们的行为准则。请确保在所有互动中保持尊重和建设性。

### 我们的承诺
- 营造开放和欢迎的环境
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 专注于对社区最有利的事情
- 对其他社区成员表现出同理心

## 如何贡献

### 🐛 报告Bug
1. 检查[现有issues](https://github.com/Poghappy/n8n-automation-workspace/issues)确保问题未被报告
2. 使用Bug报告模板创建新issue
3. 提供详细的复现步骤和环境信息
4. 包含相关的日志和截图

### ✨ 建议新功能
1. 检查[现有issues](https://github.com/Poghappy/n8n-automation-workspace/issues)确保功能未被建议
2. 使用功能请求模板创建新issue
3. 详细描述功能的用途和价值
4. 考虑提供实现建议

### 💻 代码贡献
1. Fork项目到您的GitHub账户
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 进行您的更改
4. 添加或更新测试
5. 确保所有测试通过
6. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
7. 推送到分支 (`git push origin feature/amazing-feature`)
8. 创建Pull Request

## 开发环境设置

### 系统要求
- Node.js 16.0+
- Python 3.8+
- Docker 20.10+
- Git 2.0+

### 安装步骤
```bash
# 1. 克隆仓库
git clone https://github.com/Poghappy/n8n-automation-workspace.git
cd n8n-automation-workspace

# 2. 安装Node.js依赖
npm install

# 3. 设置Python环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 4. 复制环境变量模板
cp .env.example .env

# 5. 启动开发环境
docker-compose up -d
```

### 开发工具推荐
- **IDE**: VS Code, WebStorm, PyCharm
- **Git客户端**: GitHub Desktop, SourceTree
- **API测试**: Postman, Insomnia
- **数据库工具**: pgAdmin, MySQL Workbench

## 提交指南

### 提交消息格式
我们使用[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)格式：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

### 提交类型
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统
- `ci`: CI/CD配置
- `chore`: 其他杂项

### 示例
```bash
feat(api): 添加用户认证接口

- 实现JWT token生成和验证
- 添加登录和注册端点
- 集成Redis会话存储

Closes #123
```

## 代码规范

### JavaScript/TypeScript
- 使用ESLint和Prettier进行代码格式化
- 遵循Airbnb JavaScript风格指南
- 使用TypeScript进行类型检查
- 函数和变量使用驼峰命名法

### Python
- 遵循PEP 8风格指南
- 使用Black进行代码格式化
- 使用pylint进行代码检查
- 函数和变量使用蛇形命名法

### PHP
- 遵循PSR-12编码标准
- 使用PHP-CS-Fixer进行格式化
- 类名使用帕斯卡命名法
- 方法和变量使用驼峰命名法

### 通用规范
- 保持代码简洁和可读
- 添加适当的注释和文档
- 避免硬编码配置值
- 使用有意义的变量和函数名

## 测试指南

### 测试类型
- **单元测试**: 测试单个函数或类
- **集成测试**: 测试组件间的交互
- **端到端测试**: 测试完整的用户流程

### 运行测试
```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- tests/api.test.js

# 运行Python测试
python -m pytest

# 运行覆盖率测试
npm run test:coverage
```

### 测试要求
- 新功能必须包含测试
- 测试覆盖率应保持在80%以上
- 测试应该快速且可靠
- 使用描述性的测试名称

## 文档贡献

### 文档类型
- **README**: 项目概述和快速开始
- **API文档**: 接口说明和示例
- **用户指南**: 详细的使用说明
- **开发文档**: 架构和开发指南

### 文档规范
- 使用Markdown格式
- 包含代码示例和截图
- 保持内容最新和准确
- 使用清晰的标题结构

## 问题报告

### 报告前检查
- [ ] 搜索现有issues
- [ ] 查看FAQ和文档
- [ ] 尝试最新版本
- [ ] 收集相关信息

### 包含信息
- 详细的问题描述
- 复现步骤
- 预期和实际行为
- 环境信息
- 错误日志和截图

## 功能请求

### 请求前考虑
- 功能是否符合项目目标
- 是否有替代解决方案
- 实现的复杂度和维护成本
- 对现有用户的影响

### 描述要求
- 清晰的功能描述
- 使用场景和用户故事
- 预期的用户体验
- 技术实现建议

## 审查流程

### Pull Request审查
1. **自动检查**: CI/CD流水线验证
2. **代码审查**: 维护者人工审查
3. **测试验证**: 功能和回归测试
4. **文档检查**: 相关文档更新
5. **最终批准**: 合并到主分支

### 审查标准
- 代码质量和风格
- 功能正确性
- 测试覆盖率
- 文档完整性
- 向后兼容性

## 发布流程

### 版本管理
- 遵循语义化版本规范
- 维护详细的CHANGELOG
- 创建GitHub Releases
- 更新相关文档

### 发布步骤
1. 更新版本号
2. 更新CHANGELOG
3. 创建发布标签
4. 构建和测试
5. 发布到仓库
6. 通知社区

## 获得帮助

如果您在贡献过程中遇到问题，可以通过以下方式获得帮助：

- 📧 **邮件**: 发送邮件到项目维护者
- 💬 **讨论**: 在GitHub Discussions中提问
- 📱 **社区**: 加入我们的开发者社区
- 📖 **文档**: 查看详细的开发文档

## 致谢

感谢所有为这个项目做出贡献的开发者！您的努力让这个项目变得更好。

---

再次感谢您的贡献！🎉
