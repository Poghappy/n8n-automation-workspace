# Docker Desktop 文件共享配置指南

## 问题描述
当运行Docker容器时遇到以下错误：
```
docker: Error response from daemon: mounts denied: 
The path /local-directory is not shared from the host and is not known to Docker. 
You can configure shared paths from Docker -> Preferences... -> Resources -> File Sharing.
```

## 解决方案

### 方法一：通过Docker Desktop GUI配置

1. **打开Docker Desktop应用程序**
   ```bash
   open -a "Docker Desktop"
   ```

2. **进入设置页面**
   - 点击Docker Desktop菜单栏图标（鲸鱼图标）
   - 选择 "Settings" 或 "Preferences"
   - 或者直接在Docker Desktop Dashboard中点击设置图标

3. **配置文件共享**
   - 在左侧菜单中选择 "Resources" → "File sharing"
   - 默认情况下，以下目录已被共享：
     - `/Users`
     - `/Volumes` 
     - `/private`
     - `/tmp`
     - `/var/folders`

4. **添加项目目录**
   - 点击 "+" 按钮
   - 导航到项目目录：`/Users/zhiledeng/Documents/augment-projects/N8N-自动化`
   - 选择该目录并确认
   - 点击 "Apply & Restart" 应用更改

### 方法二：通过命令行验证配置

1. **检查Docker状态**
   ```bash
   docker info
   ```

2. **测试文件共享**
   ```bash
   # 测试挂载当前目录
   docker run --rm -v $(pwd):/workspace alpine ls -la /workspace
   ```

### 当前项目配置

**项目路径**: `/Users/zhiledeng/Documents/augment-projects/N8N-自动化`

由于项目位于 `/Users` 目录下，理论上应该已经被Docker Desktop自动共享。如果仍然遇到问题，请：

1. 确认Docker Desktop正在运行
2. 重启Docker Desktop
3. 手动添加项目根目录到文件共享列表

### 注意事项

1. **性能考虑**
   - 只共享必要的目录，避免共享整个用户目录
   - 文件共享会带来性能开销
   - 对于数据库和缓存，建议使用Docker数据卷

2. **安全考虑**
   - 避免共享包含敏感信息的目录
   - 定期检查共享目录列表

3. **macOS特殊说明**
   - macOS文件系统不区分大小写，而Linux区分大小写
   - 确保文件名大小写一致性

### 故障排除

如果问题仍然存在：

1. **重启Docker Desktop**
   ```bash
   # 停止Docker Desktop
   osascript -e 'quit app "Docker Desktop"'
   
   # 等待几秒后重新启动
   open -a "Docker Desktop"
   ```

2. **检查Docker Desktop版本**
   ```bash
   docker --version
   ```

3. **查看Docker Desktop日志**
   - 在Docker Desktop中选择 "Troubleshoot" → "Get support"
   - 查看相关错误日志

### 验证配置成功

配置完成后，运行以下命令验证：

```bash
# 测试当前目录挂载
docker run --rm -v $(pwd):/test alpine ls -la /test

# 如果看到项目文件列表，说明配置成功
```

## 相关文档

- [Docker Desktop File Sharing 官方文档](https://docs.docker.com/go/mac-file-sharing/)
- [Docker Desktop Settings 配置指南](https://docs.docker.com/desktop/settings-and-maintenance/settings/)