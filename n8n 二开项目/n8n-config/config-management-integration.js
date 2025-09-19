/**
 * 工作流配置管理集成系统
 * 
 * 整合所有配置管理功能:
 * - 配置管理器
 * - 热重载系统
 * - 备份恢复系统
 * - 安全验证
 * - 监控告警
 * 
 * 需求: 需求6 (凭据安全), 需求8 (复用现有工作流)
 */

const { WorkflowConfigManager } = require('./workflow-config-manager');
const { ConfigHotReloader } = require('./config-hot-reload');
const { ConfigBackupRecovery } = require('./config-backup-recovery');

class ConfigManagementIntegration {
  constructor(options = {}) {
    this.options = {
      configDir: options.configDir || __dirname,
      backupDir: options.backupDir || `${__dirname}/backups`,
      enableHotReload: options.enableHotReload !== false,
      enableAutoBackup: options.enableAutoBackup !== false,
      enableMonitoring: options.enableMonitoring !== false,
      ...options
    };
    
    this.configManager = null;
    this.hotReloader = null;
    this.backupRecovery = null;
    this.isInitialized = false;
    this.healthStatus = {
      configManager: 'unknown',
      hotReloader: 'unknown',
      backupRecovery: 'unknown',
      lastCheck: null
    };
    
    this.eventHandlers = new Map();
    this.monitoringInterval = null;
  }

  /**
   * 初始化配置管理系统
   */
  async initialize() {
    try {
      console.log('初始化工作流配置管理系统...');
      
      // 初始化配置管理器
      await this.initializeConfigManager();
      
      // 初始化热重载系统
      if (this.options.enableHotReload) {
        await this.initializeHotReloader();
      }
      
      // 初始化备份恢复系统
      if (this.options.enableAutoBackup) {
        await this.initializeBackupRecovery();
      }
      
      // 设置事件处理
      this.setupEventHandlers();
      
      // 启动监控
      if (this.options.enableMonitoring) {
        this.startMonitoring();
      }
      
      this.isInitialized = true;
      console.log('工作流配置管理系统初始化完成');
      
      return {
        success: true,
        components: {
          configManager: !!this.configManager,
          hotReloader: !!this.hotReloader,
          backupRecovery: !!this.backupRecovery
        }
      };
      
    } catch (error) {
      console.error('配置管理系统初始化失败:', error);
      throw error;
    }
  }

  /**
   * 初始化配置管理器
   */
  async initializeConfigManager() {
    try {
      this.configManager = new WorkflowConfigManager({
        configDir: this.options.configDir,
        backupDir: this.options.backupDir,
        secretKey: this.options.secretKey
      });
      
      await this.configManager.initialize();
      this.healthStatus.configManager = 'healthy';
      
      console.log('配置管理器初始化成功');
    } catch (error) {
      this.healthStatus.configManager = 'error';
      throw error;
    }
  }

  /**
   * 初始化热重载系统
   */
  async initializeHotReloader() {
    try {
      this.hotReloader = new ConfigHotReloader(this.configManager, {
        watchInterval: this.options.watchInterval || 1000,
        validationTimeout: this.options.validationTimeout || 5000,
        rollbackTimeout: this.options.rollbackTimeout || 30000,
        enableAutoRollback: this.options.enableAutoRollback !== false
      });
      
      await this.hotReloader.initialize();
      await this.hotReloader.startWatching();
      this.healthStatus.hotReloader = 'healthy';
      
      console.log('热重载系统初始化成功');
    } catch (error) {
      this.healthStatus.hotReloader = 'error';
      console.warn('热重载系统初始化失败:', error);
      // 热重载失败不应该阻止整个系统启动
    }
  }

  /**
   * 初始化备份恢复系统
   */
  async initializeBackupRecovery() {
    try {
      this.backupRecovery = new ConfigBackupRecovery(this.configManager, {
        backupDir: this.options.backupDir,
        maxBackups: this.options.maxBackups || 50,
        backupInterval: this.options.backupInterval || 86400000, // 24小时
        compressionEnabled: this.options.compressionEnabled !== false,
        encryptionEnabled: this.options.encryptionEnabled !== false,
        encryptionKey: this.options.encryptionKey
      });
      
      await this.backupRecovery.initialize();
      this.healthStatus.backupRecovery = 'healthy';
      
      console.log('备份恢复系统初始化成功');
    } catch (error) {
      this.healthStatus.backupRecovery = 'error';
      throw error;
    }
  }

  /**
   * 设置事件处理
   */
  setupEventHandlers() {
    // 配置变更事件
    if (this.hotReloader) {
      this.hotReloader.on('configReloaded', (event) => {
        console.log(`配置热重载: ${event.configKey}`);
        this.handleConfigChange(event);
      });
      
      this.hotReloader.on('autoRollback', (event) => {
        console.warn(`配置自动回滚: ${event.configKey}`);
        this.handleAutoRollback(event);
      });
      
      this.hotReloader.on('changeProcessingFailed', (event) => {
        console.error(`配置变更处理失败: ${event.configKey} - ${event.error}`);
        this.handleConfigError(event);
      });
    }
    
    // 配置管理器事件
    if (this.configManager) {
      this.configManager.addChangeListener((changeEvent) => {
        this.handleConfigManagerChange(changeEvent);
      });
    }
  }

  /**
   * 处理配置变更
   */
  handleConfigChange(event) {
    // 记录配置变更
    console.log(`配置变更记录: ${event.configKey}`, {
      changeId: event.changeId,
      timestamp: event.timestamp,
      changesCount: event.changes?.length || 0
    });
    
    // 触发相关系统更新
    this.notifyConfigChange(event);
  }

  /**
   * 处理自动回滚
   */
  handleAutoRollback(event) {
    // 记录回滚事件
    console.warn(`配置自动回滚记录: ${event.configKey}`, {
      changeId: event.changeId,
      timestamp: event.timestamp
    });
    
    // 发送告警
    this.sendAlert('config_auto_rollback', {
      configKey: event.configKey,
      changeId: event.changeId,
      timestamp: event.timestamp
    });
  }

  /**
   * 处理配置错误
   */
  handleConfigError(event) {
    // 记录错误
    console.error(`配置错误记录: ${event.configKey}`, {
      changeId: event.changeId,
      error: event.error
    });
    
    // 发送告警
    this.sendAlert('config_error', {
      configKey: event.configKey,
      error: event.error,
      changeId: event.changeId
    });
  }

  /**
   * 处理配置管理器变更
   */
  handleConfigManagerChange(changeEvent) {
    // 记录变更详情
    console.log(`配置管理器变更: ${changeEvent.configKey}`, {
      timestamp: changeEvent.timestamp,
      changes: changeEvent.changes
    });
  }

  /**
   * 获取配置
   */
  getConfig(configKey, path = null) {
    if (!this.configManager) {
      throw new Error('配置管理器未初始化');
    }
    
    return this.configManager.getConfig(configKey, path);
  }

  /**
   * 更新配置
   */
  async updateConfig(configKey, updates, options = {}) {
    if (!this.configManager) {
      throw new Error('配置管理器未初始化');
    }
    
    try {
      // 创建备份（如果启用）
      if (this.backupRecovery && options.createBackup !== false) {
        await this.backupRecovery.createIncrementalBackup({
          creator: 'config-update',
          reason: `update-${configKey}`
        });
      }
      
      // 更新配置
      const result = await this.configManager.updateConfig(configKey, updates, options);
      
      // 记录更新
      console.log(`配置更新成功: ${configKey}`);
      
      return result;
    } catch (error) {
      console.error(`配置更新失败: ${configKey}`, error);
      throw error;
    }
  }

  /**
   * 重载配置
   */
  async reloadConfig(configKey) {
    if (!this.configManager) {
      throw new Error('配置管理器未初始化');
    }
    
    return await this.configManager.reloadConfig(configKey);
  }

  /**
   * 创建备份
   */
  async createBackup(type = 'incremental', options = {}) {
    if (!this.backupRecovery) {
      throw new Error('备份系统未启用');
    }
    
    if (type === 'full') {
      return await this.backupRecovery.createFullBackup(options);
    } else {
      return await this.backupRecovery.createIncrementalBackup(options);
    }
  }

  /**
   * 恢复备份
   */
  async restoreBackup(backupId, options = {}) {
    if (!this.backupRecovery) {
      throw new Error('备份系统未启用');
    }
    
    return await this.backupRecovery.restoreBackup(backupId, options);
  }

  /**
   * 恢复单个配置
   */
  async restoreConfig(configKey, backupId, options = {}) {
    if (!this.backupRecovery) {
      throw new Error('备份系统未启用');
    }
    
    return await this.backupRecovery.restoreConfig(configKey, backupId, options);
  }

  /**
   * 列出备份
   */
  listBackups(options = {}) {
    if (!this.backupRecovery) {
      throw new Error('备份系统未启用');
    }
    
    return this.backupRecovery.listBackups(options);
  }

  /**
   * 验证配置
   */
  async validateConfig(configKey, config = null) {
    if (!this.configManager) {
      throw new Error('配置管理器未初始化');
    }
    
    const configToValidate = config || this.configManager.getConfig(configKey);
    return await this.configManager.validateConfig(configKey, configToValidate);
  }

  /**
   * 确认配置变更
   */
  confirmConfigChange(configKey, changeId) {
    if (!this.hotReloader) {
      return false;
    }
    
    return this.hotReloader.confirmConfigChange(configKey, changeId);
  }

  /**
   * 获取系统状态
   */
  getSystemStatus() {
    const status = {
      initialized: this.isInitialized,
      components: {
        configManager: {
          status: this.healthStatus.configManager,
          available: !!this.configManager,
          configCount: this.configManager ? this.configManager.configCache.size : 0
        },
        hotReloader: {
          status: this.healthStatus.hotReloader,
          available: !!this.hotReloader,
          watching: this.hotReloader ? this.hotReloader.isWatching : false
        },
        backupRecovery: {
          status: this.healthStatus.backupRecovery,
          available: !!this.backupRecovery,
          backupCount: this.backupRecovery ? this.backupRecovery.backupHistory.size : 0
        }
      },
      lastHealthCheck: this.healthStatus.lastCheck
    };
    
    return status;
  }

  /**
   * 健康检查
   */
  async performHealthCheck() {
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      components: {}
    };
    
    try {
      // 检查配置管理器
      if (this.configManager) {
        try {
          const configStats = this.configManager.getConfigStats();
          results.components.configManager = {
            status: 'healthy',
            stats: configStats
          };
        } catch (error) {
          results.components.configManager = {
            status: 'error',
            error: error.message
          };
          results.overall = 'degraded';
        }
      }
      
      // 检查热重载系统
      if (this.hotReloader) {
        try {
          const watchingStatus = this.hotReloader.getWatchingStatus();
          results.components.hotReloader = {
            status: watchingStatus.isWatching ? 'healthy' : 'warning',
            stats: watchingStatus
          };
        } catch (error) {
          results.components.hotReloader = {
            status: 'error',
            error: error.message
          };
          results.overall = 'degraded';
        }
      }
      
      // 检查备份系统
      if (this.backupRecovery) {
        try {
          const backupStats = this.backupRecovery.getBackupStats();
          results.components.backupRecovery = {
            status: 'healthy',
            stats: backupStats
          };
        } catch (error) {
          results.components.backupRecovery = {
            status: 'error',
            error: error.message
          };
          results.overall = 'degraded';
        }
      }
      
    } catch (error) {
      results.overall = 'error';
      results.error = error.message;
    }
    
    this.healthStatus.lastCheck = results.timestamp;
    return results;
  }

  /**
   * 启动监控
   */
  startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    const monitoringIntervalMs = this.options.monitoringInterval || 300000; // 5分钟
    
    this.monitoringInterval = setInterval(async () => {
      try {
        const healthCheck = await this.performHealthCheck();
        
        // 检查是否需要发送告警
        if (healthCheck.overall !== 'healthy') {
          this.sendAlert('system_health_degraded', healthCheck);
        }
        
        // 记录健康状态
        console.log(`配置管理系统健康检查: ${healthCheck.overall}`);
        
      } catch (error) {
        console.error('配置管理系统监控失败:', error);
        this.sendAlert('monitoring_error', { error: error.message });
      }
    }, monitoringIntervalMs);
    
    console.log(`配置管理系统监控已启动，间隔: ${monitoringIntervalMs}ms`);
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('配置管理系统监控已停止');
    }
  }

  /**
   * 发送告警
   */
  sendAlert(type, data) {
    const alert = {
      type,
      timestamp: new Date().toISOString(),
      data,
      source: 'config-management-system'
    };
    
    console.warn(`配置管理告警 [${type}]:`, alert);
    
    // 这里可以集成外部告警系统
    // 例如: webhook, email, slack 等
    if (this.options.alertWebhook) {
      this.sendWebhookAlert(alert);
    }
  }

  /**
   * 发送Webhook告警
   */
  async sendWebhookAlert(alert) {
    try {
      const response = await fetch(this.options.alertWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alert),
        timeout: 10000
      });
      
      if (!response.ok) {
        console.error(`Webhook告警发送失败: ${response.status}`);
      }
    } catch (error) {
      console.error('Webhook告警发送异常:', error);
    }
  }

  /**
   * 通知配置变更
   */
  notifyConfigChange(event) {
    // 这里可以通知其他系统组件配置已变更
    // 例如: 重启相关服务、更新缓存等
    
    console.log(`配置变更通知: ${event.configKey}`);
    
    // 触发自定义事件处理器
    const handlers = this.eventHandlers.get('configChange') || [];
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('配置变更事件处理器执行失败:', error);
      }
    }
  }

  /**
   * 添加事件处理器
   */
  addEventListener(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType).push(handler);
  }

  /**
   * 移除事件处理器
   */
  removeEventListener(eventType, handler) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 销毁配置管理系统
   */
  async destroy() {
    try {
      console.log('销毁配置管理系统...');
      
      // 停止监控
      this.stopMonitoring();
      
      // 销毁各个组件
      if (this.hotReloader) {
        await this.hotReloader.destroy();
      }
      
      if (this.backupRecovery) {
        await this.backupRecovery.destroy();
      }
      
      if (this.configManager) {
        await this.configManager.destroy();
      }
      
      // 清理事件处理器
      this.eventHandlers.clear();
      
      this.isInitialized = false;
      console.log('配置管理系统已销毁');
      
    } catch (error) {
      console.error('销毁配置管理系统失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
let configManagementInstance = null;

/**
 * 获取配置管理系统实例
 */
function getConfigManagement(options = {}) {
  if (!configManagementInstance) {
    configManagementInstance = new ConfigManagementIntegration(options);
  }
  return configManagementInstance;
}

/**
 * 初始化配置管理系统
 */
async function initializeConfigManagement(options = {}) {
  const instance = getConfigManagement(options);
  if (!instance.isInitialized) {
    await instance.initialize();
  }
  return instance;
}

module.exports = {
  ConfigManagementIntegration,
  getConfigManagement,
  initializeConfigManagement
};