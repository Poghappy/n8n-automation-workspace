# Cursor 文档

Cursor 是一款 AI 驱动的代码编辑器，能够理解你的代码库，并通过自然语言帮助你更快地编写代码。只需描述你想要构建或修改的内容，Cursor 就会为你生成相应的代码。

## 模型

请在 [模型](/docs/models) 页面查看所有模型的属性。

名称默认上下文最大模式功能Claude 4 Sonnet200k-Claude 4 Sonnet 1M-1MClaude 4.1 Opus-200kGemini 2.5 Pro200k1MGPT 4.1200k1MGPT-5272k-GPT-5 Fast272k-Grok Code256k-显示更多模型

## 了解更多

- [快速开始](/docs/get-started/quickstart): 几分钟内完成下载与安装，开始用 Cursor 构建
- [更新日志](https://www.cursor.com/changelog): 实时掌握最新功能与改进
- [核心概念](/docs/get-started/concepts): 了解驱动 Cursor 的核心概念与功能
- [下载](https://cursor.com/downloads): 下载适用于你电脑的 Cursor
- [论坛](https://forum.cursor.com): 如需技术咨询或分享经验，请前往我们的论坛
- [支持](mailto:hi@cursor.com): 账户与账单相关问题，请发送邮件至我们的支持团队

# 快速上手

本快速上手将带你体验一个使用 Cursor 核心功能的项目。完成后，你将熟悉 Tab、Inline Edit 和 Agent。

[下载 Cursor⤓](https://cursor.com/downloads)

## 在 Cursor 中打开项目

使用现有项目或克隆我们的示例项目：

克隆示例项目使用现有项目1. 确认已安装 git
2. 克隆示例项目：

```
git clone git@github.com:voxelize/voxelize.git && \
cd voxelize && \
cursor .
```

我们将以示例项目演示，但你也可以使用本地的任意项目。

## 使用 Tab 自动补全

[Tab](/docs/configuration/kbd#tab) 是我们自研的自动补全模型。如果你还不习惯 AI 辅助编码，它是很好的入门选择。使用 Tab，你可以：

- 自动补全**多行和代码块**
- 在文件**内部**及**跨文件**跳转到下一个补全建议

试试吧：

1. 开始输入函数开头：`function calculate`
2. Tab 建议会自动出现
3. 按 Tab 接受建议
4. 光标将提示参数和函数体

## 内联编辑所选内容

1. 选择你刚创建的函数
2. 按下 Cmd K
3. 输入 "make this function calculate fibonacci numbers"
4. 按下 Return 以应用更改
5. Cursor 会自动添加导入和文档

## 与 Agent 聊天

1. 打开 Chat 面板（Cmd I）
2. 说：“为此函数添加测试并运行”
3. [Agent](/docs/agent) 将为你创建测试文件、编写测试用例并运行它们

## 额外内容

进一步了解[键盘快捷键](/docs/configuration/kbd)、[主题](/docs/configuration/themes)和[Shell 命令](/docs/configuration/shell)

你也可以探索这些高级功能：

### 编写规则

### 设置 MCP 服务器

1. 访问我们的 [MCP 目录](/docs/context/mcp/directory)
2. 选择一个工具
3. 点击 "Install"

你也可以手动安装服务器：

1. 打开 Cursor 设置（Cmd Shift J）
2. 前往 "Tools & Integrations"
3. 点击 "New MCP Server"

## 后续步骤

我们建议学习 [AI Foundations 课程](/learn)，以进一步了解 AI 的工作原理及其高效用法。课程涵盖模型选择、上下文管理和智能体等主题。
