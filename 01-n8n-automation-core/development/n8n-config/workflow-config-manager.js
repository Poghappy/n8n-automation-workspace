/**
 * 工作流配置和参数管理系统
 * 
 * 功能特性:
 * - 动态配置更新和热重载
 * - 配置验证和安全检查
 * - 配置备份和恢复机制
 * - 环境变量管理
 * - 配置版本控制
 * 
 * 需求: 需求6 (凭据安全), 需求8 (复用现有工作流)
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class WorkflowConfigManager {
  constructor(options = {}) {
    this.configDir = options.configDir || path.join(__dirname);
    this.backupDir = options.backupDir || path.join(__dirname, 'backups');
    this.secretKey = options.secretKey || process.env.CONFIG_SECRET_KEY || this.generateSecretKey();
    this.configCache = new Map();
    this.watchers = new Map();
    this.validationRules = new Map();
    this.changeListeners = new Set();
    
    // 配置文件映射
    this.configFiles = {
      sources: 'enhanced-sources-config.json',
      orchestration: 'workflow-orchestration-config.json',
      notion: 'notion-config.json',
      firebird: 'firebird-publish-node-config.json',
      aiManagement: 'ai-intelligent-management-node-config.json',
      errorHandling: 'error-handling-integration-config.json',
      monitoring: 'unified-logging-node-config.json'
    };
    
    this.initialize();
  }

  /**
   * 初始化配置管理器
   */
  async initialize() {
    try {
      // 确保备份目录存在
      await this.ensureDirectoryExists(this.backupDir);
      
      // 加载所有配置文件
      await this.loadAllConfigs();
      
      // 设置配置验证规则
      this.setupValidationRules();
      
      // 启动配置文件监控
      await this.startConfigWatching();
      
      console.log('工作流配置管理器初始化完成');
    } catch (error) {
      console.error('配置管理器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 加载所有配置文件
   */
  async loadAllConfigs() {
    const loadPromises = Object.entries(this.configFiles).map(async ([key, filename]) => {
      try {
        const config = await this.loadConfig(key, filename);
        this.configCache.set(key, config);
        console.log(`配置文件 ${filename} 加载成功`);
      } catch (error) {
        console.error(`配置文件 ${filename} 加载失败:`, error);
        // 使用默认配置
        this.configCache.set(key, this.getDefaultConfig(key));
      }
    });
    
    await Promise.all(loadPromises);
  }

  /**
   * 加载单个配置文件
   */
  async loadConfig(configKey, filename) {
    const filePath = path.join(this.configDir, filename);
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const config = JSON.parse(content);
      
      // 验证配置
      const validation = await this.validateConfig(configKey, config);
      if (!validation.isValid) {
        throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
      }
      
      // 解密敏感配置
      const decryptedConfig = this.decryptSensitiveFields(config);
      
      return {
        ...decryptedConfig,
        _metadata: {
          filename,
          loadedAt: new Date().toISOString(),
          version: config.version || '1.0.0',
          checksum: this.calculateChecksum(content)
        }
      };
    } catch (error) {
      console.error(`加载配置文件 ${filename} 失败:`, error);
      throw error;
    }
  }

  /**
   * 获取配置
   */
  getConfig(configKey, path = null) {
    const config = this.configCache.get(configKey);
    if (!config) {
      throw new Error(`配置 ${configKey} 不存在`);
    }
    
    if (path) {
      return this.getNestedValue(config, path);
    }
    
    return config;
  }

  /**
   * 更新配置
   */
  async updateConfig(configKey, updates, options = {}) {
    try {
      const currentConfig = this.getConfig(configKey);
      const updatedConfig = this.mergeConfig(currentConfig, updates);
      
      // 验证更新后的配置
      const validation = await this.validateConfig(configKey, updatedConfig);
      if (!validation.isValid) {
        throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
      }
      
      // 创建备份
      if (options.createBackup !== false) {
        await this.createBackup(configKey);
      }
      
      // 加密敏感字段
      const encryptedConfig = this.encryptSensitiveFields(updatedConfig);
      
      // 保存配置文件
      const filename = this.configFiles[configKey];
      const filePath = path.join(this.configDir, filename);
      
      await fs.writeFile(filePath, JSON.stringify(encryptedConfig, null, 2), 'utf8');
      
      // 更新缓存
      this.configCache.set(configKey, updatedConfig);
      
      // 通知监听器
      this.notifyConfigChange(configKey, updatedConfig, currentConfig);
      
      console.log(`配置 ${configKey} 更新成功`);
      
      return {
        success: true,
        configKey,
        updatedAt: new Date().toISOString(),
        changes: this.getConfigDiff(currentConfig, updatedConfig)
      };
    } catch (error) {
      console.error(`更新配置 ${configKey} 失败:`, error);
      throw error;
    }
  }

  /**
   * 热重载配置
   */
  async reloadConfig(configKey) {
    try {
      const filename = this.configFiles[configKey];
      if (!filename) {
        throw new Error(`未知的配置键: ${configKey}`);
      }
      
      const oldConfig = this.configCache.get(configKey);
      const newConfig = await this.loadConfig(configKey, filename);
      
      this.configCache.set(configKey, newConfig);
      
      // 通知监听器
      this.notifyConfigChange(configKey, newConfig, oldConfig);
      
      console.log(`配置 ${configKey} 热重载成功`);
      
      return {
        success: true,
        configKey,
        reloadedAt: new Date().toISOString(),
        changes: this.getConfigDiff(oldConfig, newConfig)
      };
    } catch (error) {
      console.error(`热重载配置 ${configKey} 失败:`, error);
      throw error;
    }
  }

  /**
   * 创建配置备份
   */
  async createBackup(configKey) {
    try {
      const config = this.getConfig(configKey);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `${configKey}-backup-${timestamp}.json`;
      const backupPath = path.join(this.backupDir, backupFilename);
      
      await fs.writeFile(backupPath, JSON.stringify(config, null, 2), 'utf8');
      
      console.log(`配置备份创建成功: ${backupFilename}`);
      
      // 清理旧备份文件
      await this.cleanupOldBackups(configKey);
      
      return backupPath;
    } catch (error) {
      console.error(`创建配置备份失败:`, error);
      throw error;
    }
  }

  /**
   * 恢复配置备份
   */
  async restoreBackup(configKey, backupFilename) {
    try {
      const backupPath = path.join(this.backupDir, backupFilename);
      const backupContent = await fs.readFile(backupPath, 'utf8');
      const backupConfig = JSON.parse(backupContent);
      
      // 验证备份配置
      const validation = await this.validateConfig(configKey, backupConfig);
      if (!validation.isValid) {
        throw new Error(`备份配置验证失败: ${validation.errors.join(', ')}`);
      }
      
      // 创建当前配置的备份
      await this.createBackup(configKey);
      
      // 恢复配置
      const filename = this.configFiles[configKey];
      const filePath = path.join(this.configDir, filename);
      
      await fs.writeFile(filePath, JSON.stringify(backupConfig, null, 2), 'utf8');
      
      // 更新缓存
      this.configCache.set(configKey, backupConfig);
      
      console.log(`配置 ${configKey} 从备份 ${backupFilename} 恢复成功`);
      
      return {
        success: true,
        configKey,
        backupFilename,
        restoredAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`恢复配置备份失败:`, error);
      throw error;
    }
  }

  /**
   * 设置配置验证规则
   */
  setupValidationRules() {
    // RSS源配置验证规则
    this.validationRules.set('sources', {
      required: ['rssSources', 'collectionSettings'],
      rssSources: {
        type: 'array',
        items: {
          required: ['name', 'url', 'category', 'enabled'],
          properties: {
            name: { type: 'string', minLength: 1 },
            url: { type: 'string', pattern: /^https?:\/\/.+/ },
            category: { type: 'string', minLength: 1 },
            enabled: { type: 'boolean' },
            priority: { type: 'number', min: 1, max: 10 },
            timeout: { type: 'number', min: 1000, max: 60000 },
            retryAttempts: { type: 'number', min: 0, max: 10 }
          }
        }
      },
      collectionSettings: {
        type: 'object',
        required: ['maxItemsPerSource', 'deduplicationEnabled'],
        properties: {
          maxItemsPerSource: { type: 'number', min: 1, max: 100 },
          maxTotalItems: { type: 'number', min: 1, max: 1000 },
          deduplicationEnabled: { type: 'boolean' },
          similarityThreshold: { type: 'number', min: 0, max: 1 }
        }
      }
    });

    // Notion配置验证规则
    this.validationRules.set('notion', {
      required: ['database_id', 'api_token'],
      properties: {
        database_id: { type: 'string', minLength: 32 },
        api_token: { type: 'string', minLength: 50, sensitive: true },
        retry_attempts: { type: 'number', min: 1, max: 10 },
        timeout: { type: 'number', min: 1000, max: 60000 }
      }
    });

    // 火鸟门户配置验证规则
    this.validationRules.set('firebird', {
      required: ['endpoint', 'session_id'],
      properties: {
        endpoint: { type: 'string', pattern: /^https?:\/\/.+/ },
        session_id: { type: 'string', minLength: 10, sensitive: true },
        timeout: { type: 'number', min: 1000, max: 60000 },
        retry_attempts: { type: 'number', min: 1, max: 10 }
      }
    });

    // AI管理配置验证规则
    this.validationRules.set('aiManagement', {
      required: ['openai_api_key'],
      properties: {
        openai_api_key: { type: 'string', minLength: 40, sensitive: true },
        model: { type: 'string', enum: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'] },
        temperature: { type: 'number', min: 0, max: 2 },
        max_tokens: { type: 'number', min: 1, max: 4000 }
      }
    });
  }

  /**
   * 验证配置
   */
  async validateConfig(configKey, config) {
    const rules = this.validationRules.get(configKey);
    if (!rules) {
      return { isValid: true, errors: [] };
    }

    const errors = [];

    try {
      // 检查必需字段
      if (rules.required) {
        for (const field of rules.required) {
          if (!(field in config)) {
            errors.push(`缺少必需字段: ${field}`);
          }
        }
      }

      // 验证字段属性
      if (rules.properties) {
        for (const [field, fieldRules] of Object.entries(rules.properties)) {
          if (field in config) {
            const value = config[field];
            const fieldErrors = this.validateField(field, value, fieldRules);
            errors.push(...fieldErrors);
          }
        }
      }

      // 验证复杂对象
      for (const [field, fieldRules] of Object.entries(rules)) {
        if (field !== 'required' && field !== 'properties' && field in config) {
          const value = config[field];
          const fieldErrors = this.validateComplexField(field, value, fieldRules);
          errors.push(...fieldErrors);
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`配置验证异常: ${error.message}`]
      };
    }
  }

  /**
   * 验证单个字段
   */
  validateField(fieldName, value, rules) {
    const errors = [];

    // 类型检查
    if (rules.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rules.type) {
        errors.push(`字段 ${fieldName} 类型错误，期望 ${rules.type}，实际 ${actualType}`);
        return errors;
      }
    }

    // 字符串验证
    if (rules.type === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`字段 ${fieldName} 长度不足，最小长度 ${rules.minLength}`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`字段 ${fieldName} 长度超限，最大长度 ${rules.maxLength}`);
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`字段 ${fieldName} 格式不正确`);
      }
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`字段 ${fieldName} 值不在允许范围内: ${rules.enum.join(', ')}`);
      }
    }

    // 数字验证
    if (rules.type === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`字段 ${fieldName} 值过小，最小值 ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`字段 ${fieldName} 值过大，最大值 ${rules.max}`);
      }
    }

    return errors;
  }

  /**
   * 验证复杂字段
   */
  validateComplexField(fieldName, value, rules) {
    const errors = [];

    if (rules.type === 'array' && Array.isArray(value)) {
      if (rules.items) {
        value.forEach((item, index) => {
          if (rules.items.required) {
            for (const requiredField of rules.items.required) {
              if (!(requiredField in item)) {
                errors.push(`数组 ${fieldName}[${index}] 缺少必需字段: ${requiredField}`);
              }
            }
          }
          
          if (rules.items.properties) {
            for (const [prop, propRules] of Object.entries(rules.items.properties)) {
              if (prop in item) {
                const propErrors = this.validateField(`${fieldName}[${index}].${prop}`, item[prop], propRules);
                errors.push(...propErrors);
              }
            }
          }
        });
      }
    }

    if (rules.type === 'object' && typeof value === 'object') {
      if (rules.required) {
        for (const requiredField of rules.required) {
          if (!(requiredField in value)) {
            errors.push(`对象 ${fieldName} 缺少必需字段: ${requiredField}`);
          }
        }
      }
      
      if (rules.properties) {
        for (const [prop, propRules] of Object.entries(rules.properties)) {
          if (prop in value) {
            const propErrors = this.validateField(`${fieldName}.${prop}`, value[prop], propRules);
            errors.push(...propErrors);
          }
        }
      }
    }

    return errors;
  }

  /**
   * 启动配置文件监控
   */
  async startConfigWatching() {
    if (typeof require === 'undefined') {
      console.log('文件监控在当前环境中不可用');
      return;
    }

    try {
      const chokidar = require('chokidar');
      
      const watchPaths = Object.values(this.configFiles).map(filename => 
        path.join(this.configDir, filename)
      );
      
      const watcher = chokidar.watch(watchPaths, {
        ignored: /^\./, 
        persistent: true,
        ignoreInitial: true
      });
      
      watcher.on('change', async (filePath) => {
        const filename = path.basename(filePath);
        const configKey = Object.keys(this.configFiles).find(
          key => this.configFiles[key] === filename
        );
        
        if (configKey) {
          console.log(`检测到配置文件变化: ${filename}`);
          try {
            await this.reloadConfig(configKey);
          } catch (error) {
            console.error(`自动重载配置失败:`, error);
          }
        }
      });
      
      this.watchers.set('config-files', watcher);
      console.log('配置文件监控已启动');
    } catch (error) {
      console.warn('无法启动配置文件监控:', error.message);
    }
  }

  /**
   * 停止配置文件监控
   */
  async stopConfigWatching() {
    for (const [name, watcher] of this.watchers) {
      if (watcher && typeof watcher.close === 'function') {
        await watcher.close();
        console.log(`配置监控 ${name} 已停止`);
      }
    }
    this.watchers.clear();
  }

  /**
   * 加密敏感字段
   */
  encryptSensitiveFields(config) {
    const encrypted = JSON.parse(JSON.stringify(config));
    
    this.traverseAndEncrypt(encrypted, (key, value) => {
      if (this.isSensitiveField(key)) {
        return this.encrypt(value);
      }
      return value;
    });
    
    return encrypted;
  }

  /**
   * 解密敏感字段
   */
  decryptSensitiveFields(config) {
    const decrypted = JSON.parse(JSON.stringify(config));
    
    this.traverseAndDecrypt(decrypted, (key, value) => {
      if (this.isSensitiveField(key) && this.isEncrypted(value)) {
        return this.decrypt(value);
      }
      return value;
    });
    
    return decrypted;
  }

  /**
   * 判断是否为敏感字段
   */
  isSensitiveField(key) {
    const sensitivePatterns = [
      /api[_-]?key/i,
      /token/i,
      /secret/i,
      /password/i,
      /session[_-]?id/i,
      /credential/i,
      /auth/i
    ];
    
    return sensitivePatterns.some(pattern => pattern.test(key));
  }

  /**
   * 加密数据
   */
  encrypt(text) {
    if (!text || typeof text !== 'string') return text;
    
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, this.secretKey);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `encrypted:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * 解密数据
   */
  decrypt(encryptedText) {
    if (!encryptedText || !this.isEncrypted(encryptedText)) return encryptedText;
    
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 4 || parts[0] !== 'encrypted') {
        return encryptedText;
      }
      
      const algorithm = 'aes-256-gcm';
      const iv = Buffer.from(parts[1], 'hex');
      const authTag = Buffer.from(parts[2], 'hex');
      const encrypted = parts[3];
      
      const decipher = crypto.createDecipher(algorithm, this.secretKey);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('解密失败:', error);
      return encryptedText;
    }
  }

  /**
   * 判断是否为加密数据
   */
  isEncrypted(value) {
    return typeof value === 'string' && value.startsWith('encrypted:');
  }

  /**
   * 遍历并加密
   */
  traverseAndEncrypt(obj, transformer) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.traverseAndEncrypt(value, transformer);
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            this.traverseAndEncrypt(item, transformer);
          }
        });
      } else {
        obj[key] = transformer(key, value);
      }
    }
  }

  /**
   * 遍历并解密
   */
  traverseAndDecrypt(obj, transformer) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.traverseAndDecrypt(value, transformer);
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            this.traverseAndDecrypt(item, transformer);
          }
        });
      } else {
        obj[key] = transformer(key, value);
      }
    }
  }

  /**
   * 生成密钥
   */
  generateSecretKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 计算校验和
   */
  calculateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * 合并配置
   */
  mergeConfig(current, updates) {
    const merged = JSON.parse(JSON.stringify(current));
    
    function deepMerge(target, source) {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
    
    deepMerge(merged, updates);
    
    // 更新元数据
    merged._metadata = {
      ...merged._metadata,
      updatedAt: new Date().toISOString(),
      version: this.incrementVersion(merged._metadata?.version || '1.0.0')
    };
    
    return merged;
  }

  /**
   * 获取嵌套值
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * 获取配置差异
   */
  getConfigDiff(oldConfig, newConfig) {
    const changes = [];
    
    function compareObjects(old, current, path = '') {
      const allKeys = new Set([...Object.keys(old || {}), ...Object.keys(current || {})]);
      
      for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        const oldValue = old?.[key];
        const newValue = current?.[key];
        
        if (oldValue === undefined && newValue !== undefined) {
          changes.push({ type: 'added', path: currentPath, value: newValue });
        } else if (oldValue !== undefined && newValue === undefined) {
          changes.push({ type: 'removed', path: currentPath, value: oldValue });
        } else if (typeof oldValue === 'object' && typeof newValue === 'object' && 
                   oldValue !== null && newValue !== null && 
                   !Array.isArray(oldValue) && !Array.isArray(newValue)) {
          compareObjects(oldValue, newValue, currentPath);
        } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({ 
            type: 'modified', 
            path: currentPath, 
            oldValue, 
            newValue 
          });
        }
      }
    }
    
    compareObjects(oldConfig, newConfig);
    return changes;
  }

  /**
   * 版本号递增
   */
  incrementVersion(version) {
    const parts = version.split('.').map(Number);
    parts[2] = (parts[2] || 0) + 1;
    return parts.join('.');
  }

  /**
   * 通知配置变更
   */
  notifyConfigChange(configKey, newConfig, oldConfig) {
    const changeEvent = {
      configKey,
      timestamp: new Date().toISOString(),
      changes: this.getConfigDiff(oldConfig, newConfig),
      newConfig,
      oldConfig
    };
    
    for (const listener of this.changeListeners) {
      try {
        listener(changeEvent);
      } catch (error) {
        console.error('配置变更监听器执行失败:', error);
      }
    }
  }

  /**
   * 添加配置变更监听器
   */
  addChangeListener(listener) {
    this.changeListeners.add(listener);
  }

  /**
   * 移除配置变更监听器
   */
  removeChangeListener(listener) {
    this.changeListeners.delete(listener);
  }

  /**
   * 清理旧备份文件
   */
  async cleanupOldBackups(configKey, keepCount = 10) {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith(`${configKey}-backup-`) && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stat: null
        }));
      
      // 获取文件统计信息
      for (const file of backupFiles) {
        try {
          file.stat = await fs.stat(file.path);
        } catch (error) {
          console.warn(`获取备份文件统计信息失败: ${file.name}`);
        }
      }
      
      // 按修改时间排序，保留最新的文件
      const sortedFiles = backupFiles
        .filter(file => file.stat)
        .sort((a, b) => b.stat.mtime - a.stat.mtime);
      
      // 删除多余的备份文件
      const filesToDelete = sortedFiles.slice(keepCount);
      for (const file of filesToDelete) {
        try {
          await fs.unlink(file.path);
          console.log(`删除旧备份文件: ${file.name}`);
        } catch (error) {
          console.warn(`删除备份文件失败: ${file.name}`, error);
        }
      }
    } catch (error) {
      console.error('清理旧备份文件失败:', error);
    }
  }

  /**
   * 确保目录存在
   */
  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(configKey) {
    const defaults = {
      sources: {
        rssSources: [],
        githubSources: [],
        collectionSettings: {
          maxItemsPerSource: 10,
          maxTotalItems: 50,
          deduplicationEnabled: true,
          similarityThreshold: 0.8
        },
        version: '1.0.0'
      },
      notion: {
        database_id: '',
        api_token: '',
        retry_attempts: 3,
        timeout: 30000,
        version: '1.0.0'
      },
      firebird: {
        endpoint: 'https://hawaiihub.net/include/ajax.php',
        session_id: '',
        timeout: 30000,
        retry_attempts: 3,
        version: '1.0.0'
      },
      aiManagement: {
        openai_api_key: '',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 2000,
        version: '1.0.0'
      }
    };
    
    return defaults[configKey] || { version: '1.0.0' };
  }

  /**
   * 获取所有配置键
   */
  getConfigKeys() {
    return Object.keys(this.configFiles);
  }

  /**
   * 获取配置统计信息
   */
  getConfigStats() {
    const stats = {};
    
    for (const [key, config] of this.configCache) {
      stats[key] = {
        loaded: true,
        version: config._metadata?.version || 'unknown',
        loadedAt: config._metadata?.loadedAt,
        filename: config._metadata?.filename,
        size: JSON.stringify(config).length
      };
    }
    
    return stats;
  }

  /**
   * 销毁配置管理器
   */
  async destroy() {
    await this.stopConfigWatching();
    this.configCache.clear();
    this.changeListeners.clear();
    this.validationRules.clear();
    console.log('配置管理器已销毁');
  }
}

module.exports = { WorkflowConfigManager };