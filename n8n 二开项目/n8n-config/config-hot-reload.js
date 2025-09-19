/**
 * 配置热重载和动态更新系统
 * 
 * 功能特性:
 * - 实时配置文件监控
 * - 无停机配置更新
 * - 配置变更验证
 * - 回滚机制
 * - 变更通知
 * 
 * 需求: 需求6 (凭据安全), 需求8 (复用现有工作流)
 */

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

class ConfigHotReloader extends EventEmitter {
  constructor(configManager, options = {}) {
    super();
    
    this.configManager = configManager;
    this.watchInterval = options.watchInterval || 1000;
    this.validationTimeout = options.validationTimeout || 5000;
    this.rollbackTimeout = options.rollbackTimeout || 30000;
    this.enableAutoRollback = options.enableAutoRollback !== false;
    
    this.watchers = new Map();
    this.configStates = new Map();
    this.pendingChanges = new Map();
    this.rollbackTimers = new Map();
    
    this.isWatching = false;
    this.lastCheckTime = new Map();
    
    this.initialize();
  }

  /**
   * 初始化热重载系统
   */
  async initialize() {
    try {
      // 记录初始配置状态
      await this.captureInitialStates();
      
      // 设置配置变更监听器
      this.setupConfigChangeListeners();
      
      console.log('配置热重载系统初始化完成');
    } catch (error) {
      console.error('配置热重载系统初始化失败:', error);
      throw error;
    }
  }

  /**
   * 开始监控配置文件
   */
  async startWatching() {
    if (this.isWatching) {
      console.log('配置监控已在运行中');
      return;
    }

    try {
      const configKeys = this.configManager.getConfigKeys();
      
      for (const configKey of configKeys) {
        await this.startWatchingConfig(configKey);
      }
      
      this.isWatching = true;
      console.log('配置文件监控已启动');
      
      this.emit('watchingStarted', { configKeys });
    } catch (error) {
      console.error('启动配置监控失败:', error);
      throw error;
    }
  }

  /**
   * 停止监控配置文件
   */
  async stopWatching() {
    if (!this.isWatching) {
      return;
    }

    try {
      // 停止所有文件监控
      for (const [configKey, watcher] of this.watchers) {
        if (watcher && typeof watcher.close === 'function') {
          await watcher.close();
        }
        clearInterval(watcher.pollTimer);
      }
      
      // 清理回滚定时器
      for (const [configKey, timer] of this.rollbackTimers) {
        clearTimeout(timer);
      }
      
      this.watchers.clear();
      this.rollbackTimers.clear();
      this.pendingChanges.clear();
      
      this.isWatching = false;
      console.log('配置文件监控已停止');
      
      this.emit('watchingStopped');
    } catch (error) {
      console.error('停止配置监控失败:', error);
    }
  }

  /**
   * 开始监控单个配置文件
   */
  async startWatchingConfig(configKey) {
    try {
      const filename = this.configManager.configFiles[configKey];
      if (!filename) {
        throw new Error(`未找到配置文件: ${configKey}`);
      }

      const filePath = path.join(this.configManager.configDir, filename);
      
      // 尝试使用 chokidar 进行文件监控
      let watcher = null;
      try {
        const chokidar = require('chokidar');
        watcher = chokidar.watch(filePath, {
          ignored: /^\./, 
          persistent: true,
          ignoreInitial: true,
          usePolling: false,
          interval: this.watchInterval
        });
        
        watcher.on('change', async () => {
          await this.handleConfigChange(configKey, filePath);
        });
        
        watcher.on('error', (error) => {
          console.error(`配置文件监控错误 ${configKey}:`, error);
          this.emit('watchError', { configKey, error });
        });
        
        console.log(`使用 chokidar 监控配置文件: ${filename}`);
      } catch (chokidarError) {
        // 如果 chokidar 不可用，使用轮询方式
        console.log(`chokidar 不可用，使用轮询监控: ${filename}`);
        watcher = await this.createPollingWatcher(configKey, filePath);
      }
      
      this.watchers.set(configKey, watcher);
      this.lastCheckTime.set(configKey, Date.now());
      
    } catch (error) {
      console.error(`启动配置监控失败 ${configKey}:`, error);
      throw error;
    }
  }

  /**
   * 创建轮询监控器
   */
  async createPollingWatcher(configKey, filePath) {
    let lastModified = null;
    
    try {
      const stat = await fs.stat(filePath);
      lastModified = stat.mtime.getTime();
    } catch (error) {
      console.warn(`获取文件状态失败 ${filePath}:`, error);
    }
    
    const pollTimer = setInterval(async () => {
      try {
        const stat = await fs.stat(filePath);
        const currentModified = stat.mtime.getTime();
        
        if (lastModified && currentModified > lastModified) {
          lastModified = currentModified;
          await this.handleConfigChange(configKey, filePath);
        } else if (!lastModified) {
          lastModified = currentModified;
        }
      } catch (error) {
        console.error(`轮询检查文件失败 ${filePath}:`, error);
      }
    }, this.watchInterval);
    
    return {
      pollTimer,
      close: () => {
        clearInterval(pollTimer);
      }
    };
  }

  /**
   * 处理配置文件变更
   */
  async handleConfigChange(configKey, filePath) {
    const changeId = `${configKey}-${Date.now()}`;
    
    try {
      console.log(`检测到配置文件变更: ${configKey}`);
      
      // 防抖处理 - 避免频繁触发
      if (this.pendingChanges.has(configKey)) {
        clearTimeout(this.pendingChanges.get(configKey));
      }
      
      const debounceTimer = setTimeout(async () => {
        await this.processConfigChange(configKey, changeId);
        this.pendingChanges.delete(configKey);
      }, 500);
      
      this.pendingChanges.set(configKey, debounceTimer);
      
    } catch (error) {
      console.error(`处理配置变更失败 ${configKey}:`, error);
      this.emit('changeError', { configKey, changeId, error });
    }
  }

  /**
   * 处理配置变更
   */
  async processConfigChange(configKey, changeId) {
    try {
      // 备份当前配置状态
      const currentState = this.configStates.get(configKey);
      
      // 尝试重新加载配置
      const reloadResult = await this.configManager.reloadConfig(configKey);
      
      if (!reloadResult.success) {
        throw new Error(`配置重载失败: ${reloadResult.error}`);
      }
      
      // 验证新配置
      const validationResult = await this.validateConfigChange(configKey, reloadResult.changes);
      
      if (!validationResult.isValid) {
        throw new Error(`配置验证失败: ${validationResult.errors.join(', ')}`);
      }
      
      // 更新配置状态
      const newConfig = this.configManager.getConfig(configKey);
      this.configStates.set(configKey, {
        config: JSON.parse(JSON.stringify(newConfig)),
        timestamp: Date.now(),
        changeId
      });
      
      // 设置自动回滚定时器（如果启用）
      if (this.enableAutoRollback && validationResult.requiresValidation) {
        this.setupAutoRollback(configKey, currentState, changeId);
      }
      
      console.log(`配置热重载成功: ${configKey}`);
      
      this.emit('configReloaded', {
        configKey,
        changeId,
        changes: reloadResult.changes,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error(`配置变更处理失败 ${configKey}:`, error);
      
      // 尝试回滚到之前的状态
      await this.rollbackConfig(configKey, error);
      
      this.emit('changeProcessingFailed', {
        configKey,
        changeId,
        error: error.message
      });
    }
  }

  /**
   * 验证配置变更
   */
  async validateConfigChange(configKey, changes) {
    try {
      const newConfig = this.configManager.getConfig(configKey);
      
      // 基础配置验证
      const basicValidation = await this.configManager.validateConfig(configKey, newConfig);
      if (!basicValidation.isValid) {
        return basicValidation;
      }
      
      // 业务逻辑验证
      const businessValidation = await this.validateBusinessLogic(configKey, newConfig, changes);
      if (!businessValidation.isValid) {
        return businessValidation;
      }
      
      // 兼容性验证
      const compatibilityValidation = await this.validateCompatibility(configKey, newConfig, changes);
      if (!compatibilityValidation.isValid) {
        return compatibilityValidation;
      }
      
      // 安全性验证
      const securityValidation = await this.validateSecurity(configKey, newConfig, changes);
      if (!securityValidation.isValid) {
        return securityValidation;
      }
      
      return {
        isValid: true,
        errors: [],
        requiresValidation: this.requiresRuntimeValidation(changes)
      };
      
    } catch (error) {
      return {
        isValid: false,
        errors: [`配置验证异常: ${error.message}`]
      };
    }
  }

  /**
   * 业务逻辑验证
   */
  async validateBusinessLogic(configKey, config, changes) {
    const errors = [];
    
    try {
      // 根据配置类型进行特定验证
      switch (configKey) {
        case 'sources':
          errors.push(...await this.validateSourcesConfig(config));
          break;
        case 'notion':
          errors.push(...await this.validateNotionConfig(config));
          break;
        case 'firebird':
          errors.push(...await this.validateFirebirdConfig(config));
          break;
        case 'aiManagement':
          errors.push(...await this.validateAIConfig(config));
          break;
      }
      
      // 检查关键参数变更
      const criticalChanges = changes.filter(change => 
        this.isCriticalParameter(change.path)
      );
      
      if (criticalChanges.length > 0) {
        console.warn('检测到关键参数变更:', criticalChanges);
      }
      
    } catch (error) {
      errors.push(`业务逻辑验证失败: ${error.message}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证RSS源配置
   */
  async validateSourcesConfig(config) {
    const errors = [];
    
    if (config.rssSources && Array.isArray(config.rssSources)) {
      const enabledSources = config.rssSources.filter(source => source.enabled);
      if (enabledSources.length === 0) {
        errors.push('至少需要启用一个RSS源');
      }
      
      // 验证URL可访问性
      for (const source of enabledSources.slice(0, 3)) { // 只检查前3个
        try {
          const response = await fetch(source.url, { 
            method: 'HEAD', 
            timeout: 5000 
          });
          if (!response.ok) {
            console.warn(`RSS源可能不可用: ${source.name} (${response.status})`);
          }
        } catch (error) {
          console.warn(`RSS源连接测试失败: ${source.name}`, error.message);
        }
      }
    }
    
    return errors;
  }

  /**
   * 验证Notion配置
   */
  async validateNotionConfig(config) {
    const errors = [];
    
    if (!config.database_id || config.database_id.length < 32) {
      errors.push('Notion数据库ID格式不正确');
    }
    
    if (!config.api_token || config.api_token.length < 50) {
      errors.push('Notion API令牌格式不正确');
    }
    
    // 测试API连接
    try {
      const testUrl = 'https://api.notion.com/v1/users/me';
      const response = await fetch(testUrl, {
        headers: {
          'Authorization': `Bearer ${config.api_token}`,
          'Notion-Version': '2022-06-28'
        },
        timeout: 10000
      });
      
      if (!response.ok) {
        errors.push(`Notion API连接测试失败: ${response.status}`);
      }
    } catch (error) {
      console.warn('Notion API连接测试失败:', error.message);
    }
    
    return errors;
  }

  /**
   * 验证火鸟门户配置
   */
  async validateFirebirdConfig(config) {
    const errors = [];
    
    if (!config.endpoint || !config.endpoint.startsWith('https://')) {
      errors.push('火鸟门户API端点必须使用HTTPS');
    }
    
    if (!config.session_id || config.session_id.length < 10) {
      errors.push('火鸟门户会话ID格式不正确');
    }
    
    return errors;
  }

  /**
   * 验证AI配置
   */
  async validateAIConfig(config) {
    const errors = [];
    
    if (!config.openai_api_key || config.openai_api_key.length < 40) {
      errors.push('OpenAI API密钥格式不正确');
    }
    
    if (config.temperature < 0 || config.temperature > 2) {
      errors.push('AI温度参数必须在0-2之间');
    }
    
    if (config.max_tokens < 1 || config.max_tokens > 4000) {
      errors.push('AI最大令牌数必须在1-4000之间');
    }
    
    return errors;
  }

  /**
   * 兼容性验证
   */
  async validateCompatibility(configKey, config, changes) {
    const errors = [];
    
    try {
      // 检查版本兼容性
      const currentVersion = config._metadata?.version || '1.0.0';
      const minRequiredVersion = this.getMinRequiredVersion(configKey);
      
      if (this.compareVersions(currentVersion, minRequiredVersion) < 0) {
        errors.push(`配置版本 ${currentVersion} 低于最低要求版本 ${minRequiredVersion}`);
      }
      
      // 检查依赖配置
      const dependencies = this.getConfigDependencies(configKey);
      for (const dependency of dependencies) {
        if (!this.configManager.configCache.has(dependency)) {
          errors.push(`缺少依赖配置: ${dependency}`);
        }
      }
      
    } catch (error) {
      errors.push(`兼容性验证失败: ${error.message}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 安全性验证
   */
  async validateSecurity(configKey, config, changes) {
    const errors = [];
    
    try {
      // 检查敏感信息泄露
      const sensitiveChanges = changes.filter(change => 
        this.configManager.isSensitiveField(change.path.split('.').pop())
      );
      
      for (const change of sensitiveChanges) {
        if (change.type === 'added' || change.type === 'modified') {
          if (!this.configManager.isEncrypted(change.newValue)) {
            console.warn(`敏感字段未加密: ${change.path}`);
          }
        }
      }
      
      // 检查不安全的配置
      if (config.debug === true && process.env.NODE_ENV === 'production') {
        errors.push('生产环境不应启用调试模式');
      }
      
      // 检查弱密码或默认值
      const weakPatterns = ['password', '123456', 'admin', 'default'];
      for (const change of changes) {
        if (change.newValue && typeof change.newValue === 'string') {
          const lowerValue = change.newValue.toLowerCase();
          if (weakPatterns.some(pattern => lowerValue.includes(pattern))) {
            console.warn(`检测到可能的弱密码或默认值: ${change.path}`);
          }
        }
      }
      
    } catch (error) {
      errors.push(`安全性验证失败: ${error.message}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 设置自动回滚
   */
  setupAutoRollback(configKey, previousState, changeId) {
    // 清除之前的回滚定时器
    if (this.rollbackTimers.has(configKey)) {
      clearTimeout(this.rollbackTimers.get(configKey));
    }
    
    const rollbackTimer = setTimeout(async () => {
      try {
        console.log(`自动回滚配置: ${configKey} (变更ID: ${changeId})`);
        await this.rollbackToState(configKey, previousState);
        
        this.emit('autoRollback', {
          configKey,
          changeId,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error(`自动回滚失败 ${configKey}:`, error);
        this.emit('rollbackFailed', {
          configKey,
          changeId,
          error: error.message
        });
      } finally {
        this.rollbackTimers.delete(configKey);
      }
    }, this.rollbackTimeout);
    
    this.rollbackTimers.set(configKey, rollbackTimer);
    
    console.log(`设置自动回滚定时器: ${configKey} (${this.rollbackTimeout}ms)`);
  }

  /**
   * 确认配置变更（取消自动回滚）
   */
  confirmConfigChange(configKey, changeId) {
    if (this.rollbackTimers.has(configKey)) {
      clearTimeout(this.rollbackTimers.get(configKey));
      this.rollbackTimers.delete(configKey);
      
      console.log(`配置变更已确认: ${configKey} (变更ID: ${changeId})`);
      
      this.emit('changeConfirmed', {
        configKey,
        changeId,
        timestamp: Date.now()
      });
      
      return true;
    }
    
    return false;
  }

  /**
   * 回滚配置
   */
  async rollbackConfig(configKey, reason) {
    const previousState = this.configStates.get(configKey);
    if (!previousState) {
      throw new Error(`没有找到配置的历史状态: ${configKey}`);
    }
    
    await this.rollbackToState(configKey, previousState);
    
    console.log(`配置回滚完成: ${configKey}, 原因: ${reason?.message || reason}`);
    
    this.emit('configRolledBack', {
      configKey,
      reason: reason?.message || reason,
      timestamp: Date.now()
    });
  }

  /**
   * 回滚到指定状态
   */
  async rollbackToState(configKey, targetState) {
    try {
      const filename = this.configManager.configFiles[configKey];
      const filePath = path.join(this.configManager.configDir, filename);
      
      // 写入之前的配置
      await fs.writeFile(
        filePath, 
        JSON.stringify(targetState.config, null, 2), 
        'utf8'
      );
      
      // 更新缓存
      this.configManager.configCache.set(configKey, targetState.config);
      
      console.log(`配置已回滚到状态: ${targetState.timestamp}`);
    } catch (error) {
      console.error(`回滚配置失败 ${configKey}:`, error);
      throw error;
    }
  }

  /**
   * 捕获初始配置状态
   */
  async captureInitialStates() {
    const configKeys = this.configManager.getConfigKeys();
    
    for (const configKey of configKeys) {
      try {
        const config = this.configManager.getConfig(configKey);
        this.configStates.set(configKey, {
          config: JSON.parse(JSON.stringify(config)),
          timestamp: Date.now(),
          changeId: 'initial'
        });
      } catch (error) {
        console.warn(`捕获初始状态失败 ${configKey}:`, error);
      }
    }
  }

  /**
   * 设置配置变更监听器
   */
  setupConfigChangeListeners() {
    this.configManager.addChangeListener((changeEvent) => {
      this.emit('configChanged', changeEvent);
    });
  }

  /**
   * 判断是否为关键参数
   */
  isCriticalParameter(path) {
    const criticalPaths = [
      'credentials',
      'api_key',
      'token',
      'session_id',
      'database_id',
      'endpoint',
      'enabled',
      'timeout',
      'retry_attempts'
    ];
    
    return criticalPaths.some(critical => 
      path.toLowerCase().includes(critical.toLowerCase())
    );
  }

  /**
   * 判断是否需要运行时验证
   */
  requiresRuntimeValidation(changes) {
    return changes.some(change => 
      this.isCriticalParameter(change.path) || 
      change.type === 'added' || 
      change.type === 'removed'
    );
  }

  /**
   * 获取最低要求版本
   */
  getMinRequiredVersion(configKey) {
    const minVersions = {
      sources: '1.0.0',
      notion: '1.0.0',
      firebird: '1.0.0',
      aiManagement: '1.0.0',
      orchestration: '1.0.0'
    };
    
    return minVersions[configKey] || '1.0.0';
  }

  /**
   * 获取配置依赖关系
   */
  getConfigDependencies(configKey) {
    const dependencies = {
      orchestration: ['sources', 'notion', 'firebird'],
      aiManagement: ['sources'],
      errorHandling: ['sources', 'notion', 'firebird']
    };
    
    return dependencies[configKey] || [];
  }

  /**
   * 比较版本号
   */
  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }
    
    return 0;
  }

  /**
   * 获取监控状态
   */
  getWatchingStatus() {
    return {
      isWatching: this.isWatching,
      watchedConfigs: Array.from(this.watchers.keys()),
      pendingChanges: Array.from(this.pendingChanges.keys()),
      activeRollbacks: Array.from(this.rollbackTimers.keys()),
      lastCheckTimes: Object.fromEntries(this.lastCheckTime)
    };
  }

  /**
   * 销毁热重载系统
   */
  async destroy() {
    await this.stopWatching();
    this.removeAllListeners();
    this.configStates.clear();
    this.lastCheckTime.clear();
    
    console.log('配置热重载系统已销毁');
  }
}

module.exports = { ConfigHotReloader };