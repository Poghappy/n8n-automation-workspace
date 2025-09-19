/**
 * 配置备份和恢复系统
 * 
 * 功能特性:
 * - 自动配置备份
 * - 增量备份支持
 * - 配置恢复机制
 * - 备份验证和完整性检查
 * - 备份清理和归档
 * 
 * 需求: 需求6 (凭据安全), 需求8 (复用现有工作流)
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

class ConfigBackupRecovery {
  constructor(configManager, options = {}) {
    this.configManager = configManager;
    this.backupDir = options.backupDir || path.join(__dirname, 'backups');
    this.archiveDir = options.archiveDir || path.join(this.backupDir, 'archive');
    this.maxBackups = options.maxBackups || 50;
    this.maxArchives = options.maxArchives || 10;
    this.compressionEnabled = options.compressionEnabled !== false;
    this.encryptionEnabled = options.encryptionEnabled !== false;
    this.encryptionKey = options.encryptionKey || process.env.BACKUP_ENCRYPTION_KEY;
    this.backupInterval = options.backupInterval || 86400000; // 24小时
    this.incrementalBackup = options.incrementalBackup !== false;
    
    this.backupTimer = null;
    this.backupHistory = new Map();
    this.lastFullBackup = new Map();
    
    this.initialize();
  }

  /**
   * 初始化备份系统
   */
  async initialize() {
    try {
      // 确保备份目录存在
      await this.ensureDirectoryExists(this.backupDir);
      await this.ensureDirectoryExists(this.archiveDir);
      
      // 加载备份历史
      await this.loadBackupHistory();
      
      // 启动自动备份
      if (this.backupInterval > 0) {
        this.startAutoBackup();
      }
      
      console.log('配置备份系统初始化完成');
    } catch (error) {
      console.error('配置备份系统初始化失败:', error);
      throw error;
    }
  }

  /**
   * 创建完整备份
   */
  async createFullBackup(options = {}) {
    const backupId = this.generateBackupId();
    const timestamp = new Date().toISOString();
    
    try {
      console.log(`开始创建完整备份: ${backupId}`);
      
      const backupData = {
        id: backupId,
        type: 'full',
        timestamp,
        version: '1.0.0',
        configs: {},
        metadata: {
          creator: options.creator || 'system',
          reason: options.reason || 'scheduled',
          environment: process.env.NODE_ENV || 'production',
          nodeVersion: process.version,
          platform: process.platform
        }
      };
      
      // 备份所有配置
      const configKeys = this.configManager.getConfigKeys();
      for (const configKey of configKeys) {
        try {
          const config = this.configManager.getConfig(configKey);
          backupData.configs[configKey] = {
            data: config,
            checksum: this.calculateChecksum(JSON.stringify(config)),
            size: JSON.stringify(config).length,
            lastModified: config._metadata?.updatedAt || config._metadata?.loadedAt
          };
        } catch (error) {
          console.warn(`备份配置失败 ${configKey}:`, error);
          backupData.configs[configKey] = {
            error: error.message,
            timestamp
          };
        }
      }
      
      // 保存备份
      const backupPath = await this.saveBackup(backupData);
      
      // 更新备份历史
      this.backupHistory.set(backupId, {
        id: backupId,
        type: 'full',
        timestamp,
        path: backupPath,
        size: (await fs.stat(backupPath)).size,
        configCount: Object.keys(backupData.configs).length,
        checksum: await this.calculateFileChecksum(backupPath)
      });
      
      // 更新最后完整备份记录
      for (const configKey of configKeys) {
        this.lastFullBackup.set(configKey, {
          backupId,
          timestamp,
          checksum: backupData.configs[configKey]?.checksum
        });
      }
      
      // 保存备份历史
      await this.saveBackupHistory();
      
      console.log(`完整备份创建成功: ${backupId}`);
      
      return {
        success: true,
        backupId,
        path: backupPath,
        timestamp,
        configCount: Object.keys(backupData.configs).length
      };
      
    } catch (error) {
      console.error(`创建完整备份失败:`, error);
      throw error;
    }
  }

  /**
   * 创建增量备份
   */
  async createIncrementalBackup(options = {}) {
    if (!this.incrementalBackup) {
      return await this.createFullBackup(options);
    }

    const backupId = this.generateBackupId();
    const timestamp = new Date().toISOString();
    
    try {
      console.log(`开始创建增量备份: ${backupId}`);
      
      const backupData = {
        id: backupId,
        type: 'incremental',
        timestamp,
        version: '1.0.0',
        configs: {},
        basedOn: {},
        metadata: {
          creator: options.creator || 'system',
          reason: options.reason || 'scheduled',
          environment: process.env.NODE_ENV || 'production'
        }
      };
      
      // 检查每个配置的变更
      const configKeys = this.configManager.getConfigKeys();
      let hasChanges = false;
      
      for (const configKey of configKeys) {
        try {
          const config = this.configManager.getConfig(configKey);
          const currentChecksum = this.calculateChecksum(JSON.stringify(config));
          
          const lastBackup = this.lastFullBackup.get(configKey);
          
          if (!lastBackup || lastBackup.checksum !== currentChecksum) {
            // 配置有变更，包含在增量备份中
            backupData.configs[configKey] = {
              data: config,
              checksum: currentChecksum,
              size: JSON.stringify(config).length,
              lastModified: config._metadata?.updatedAt || config._metadata?.loadedAt,
              changeType: lastBackup ? 'modified' : 'new'
            };
            
            if (lastBackup) {
              backupData.basedOn[configKey] = {
                backupId: lastBackup.backupId,
                timestamp: lastBackup.timestamp,
                checksum: lastBackup.checksum
              };
            }
            
            hasChanges = true;
          }
        } catch (error) {
          console.warn(`检查配置变更失败 ${configKey}:`, error);
          backupData.configs[configKey] = {
            error: error.message,
            timestamp
          };
          hasChanges = true;
        }
      }
      
      if (!hasChanges) {
        console.log('没有配置变更，跳过增量备份');
        return {
          success: true,
          skipped: true,
          reason: 'no_changes'
        };
      }
      
      // 保存增量备份
      const backupPath = await this.saveBackup(backupData);
      
      // 更新备份历史
      this.backupHistory.set(backupId, {
        id: backupId,
        type: 'incremental',
        timestamp,
        path: backupPath,
        size: (await fs.stat(backupPath)).size,
        configCount: Object.keys(backupData.configs).length,
        checksum: await this.calculateFileChecksum(backupPath)
      });
      
      // 保存备份历史
      await this.saveBackupHistory();
      
      console.log(`增量备份创建成功: ${backupId}`);
      
      return {
        success: true,
        backupId,
        path: backupPath,
        timestamp,
        configCount: Object.keys(backupData.configs).length,
        type: 'incremental'
      };
      
    } catch (error) {
      console.error(`创建增量备份失败:`, error);
      throw error;
    }
  }

  /**
   * 恢复配置
   */
  async restoreBackup(backupId, options = {}) {
    try {
      console.log(`开始恢复备份: ${backupId}`);
      
      const backupInfo = this.backupHistory.get(backupId);
      if (!backupInfo) {
        throw new Error(`备份不存在: ${backupId}`);
      }
      
      // 验证备份文件
      const validationResult = await this.validateBackup(backupId);
      if (!validationResult.isValid) {
        throw new Error(`备份验证失败: ${validationResult.errors.join(', ')}`);
      }
      
      // 加载备份数据
      const backupData = await this.loadBackup(backupInfo.path);
      
      // 创建恢复前备份
      if (options.createPreRestoreBackup !== false) {
        const preRestoreBackup = await this.createFullBackup({
          creator: 'restore-system',
          reason: `pre-restore-${backupId}`
        });
        console.log(`恢复前备份已创建: ${preRestoreBackup.backupId}`);
      }
      
      // 恢复配置
      const restoredConfigs = [];
      const failedConfigs = [];
      
      for (const [configKey, configBackup] of Object.entries(backupData.configs)) {
        try {
          if (configBackup.error) {
            console.warn(`跳过错误配置: ${configKey} - ${configBackup.error}`);
            continue;
          }
          
          // 验证配置数据
          const configValidation = await this.configManager.validateConfig(configKey, configBackup.data);
          if (!configValidation.isValid) {
            throw new Error(`配置验证失败: ${configValidation.errors.join(', ')}`);
          }
          
          // 恢复配置
          await this.configManager.updateConfig(configKey, configBackup.data, {
            createBackup: false // 避免循环备份
          });
          
          restoredConfigs.push(configKey);
          console.log(`配置恢复成功: ${configKey}`);
          
        } catch (error) {
          console.error(`配置恢复失败 ${configKey}:`, error);
          failedConfigs.push({
            configKey,
            error: error.message
          });
        }
      }
      
      console.log(`备份恢复完成: ${backupId}`);
      console.log(`成功恢复: ${restoredConfigs.length} 个配置`);
      console.log(`恢复失败: ${failedConfigs.length} 个配置`);
      
      return {
        success: true,
        backupId,
        restoredConfigs,
        failedConfigs,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`恢复备份失败:`, error);
      throw error;
    }
  }

  /**
   * 恢复单个配置
   */
  async restoreConfig(configKey, backupId, options = {}) {
    try {
      console.log(`开始恢复配置: ${configKey} from ${backupId}`);
      
      const backupInfo = this.backupHistory.get(backupId);
      if (!backupInfo) {
        throw new Error(`备份不存在: ${backupId}`);
      }
      
      // 加载备份数据
      const backupData = await this.loadBackup(backupInfo.path);
      
      if (!backupData.configs[configKey]) {
        throw new Error(`备份中不包含配置: ${configKey}`);
      }
      
      const configBackup = backupData.configs[configKey];
      if (configBackup.error) {
        throw new Error(`备份配置有错误: ${configBackup.error}`);
      }
      
      // 创建当前配置备份
      if (options.createPreRestoreBackup !== false) {
        await this.configManager.createBackup(configKey);
      }
      
      // 验证配置数据
      const configValidation = await this.configManager.validateConfig(configKey, configBackup.data);
      if (!configValidation.isValid) {
        throw new Error(`配置验证失败: ${configValidation.errors.join(', ')}`);
      }
      
      // 恢复配置
      await this.configManager.updateConfig(configKey, configBackup.data, {
        createBackup: false
      });
      
      console.log(`配置恢复成功: ${configKey}`);
      
      return {
        success: true,
        configKey,
        backupId,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`恢复配置失败:`, error);
      throw error;
    }
  }

  /**
   * 验证备份
   */
  async validateBackup(backupId) {
    const errors = [];
    
    try {
      const backupInfo = this.backupHistory.get(backupId);
      if (!backupInfo) {
        errors.push(`备份记录不存在: ${backupId}`);
        return { isValid: false, errors };
      }
      
      // 检查备份文件是否存在
      try {
        await fs.access(backupInfo.path);
      } catch (error) {
        errors.push(`备份文件不存在: ${backupInfo.path}`);
        return { isValid: false, errors };
      }
      
      // 验证文件完整性
      const currentChecksum = await this.calculateFileChecksum(backupInfo.path);
      if (currentChecksum !== backupInfo.checksum) {
        errors.push(`备份文件校验和不匹配`);
      }
      
      // 加载并验证备份数据
      try {
        const backupData = await this.loadBackup(backupInfo.path);
        
        // 验证备份数据结构
        if (!backupData.id || !backupData.type || !backupData.timestamp) {
          errors.push('备份数据结构不完整');
        }
        
        if (backupData.id !== backupId) {
          errors.push('备份ID不匹配');
        }
        
        // 验证配置数据
        for (const [configKey, configBackup] of Object.entries(backupData.configs || {})) {
          if (!configBackup.error && configBackup.data) {
            const dataChecksum = this.calculateChecksum(JSON.stringify(configBackup.data));
            if (dataChecksum !== configBackup.checksum) {
              errors.push(`配置数据校验和不匹配: ${configKey}`);
            }
          }
        }
        
      } catch (error) {
        errors.push(`备份数据加载失败: ${error.message}`);
      }
      
    } catch (error) {
      errors.push(`备份验证异常: ${error.message}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 列出备份
   */
  listBackups(options = {}) {
    const backups = Array.from(this.backupHistory.values());
    
    // 排序
    backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // 过滤
    let filteredBackups = backups;
    
    if (options.type) {
      filteredBackups = filteredBackups.filter(backup => backup.type === options.type);
    }
    
    if (options.limit) {
      filteredBackups = filteredBackups.slice(0, options.limit);
    }
    
    if (options.since) {
      const sinceDate = new Date(options.since);
      filteredBackups = filteredBackups.filter(backup => 
        new Date(backup.timestamp) >= sinceDate
      );
    }
    
    return filteredBackups.map(backup => ({
      id: backup.id,
      type: backup.type,
      timestamp: backup.timestamp,
      size: backup.size,
      configCount: backup.configCount,
      path: options.includePath ? backup.path : undefined
    }));
  }

  /**
   * 删除备份
   */
  async deleteBackup(backupId, options = {}) {
    try {
      const backupInfo = this.backupHistory.get(backupId);
      if (!backupInfo) {
        throw new Error(`备份不存在: ${backupId}`);
      }
      
      // 检查是否为关键备份
      if (!options.force && this.isCriticalBackup(backupId)) {
        throw new Error('无法删除关键备份，请使用 force 选项');
      }
      
      // 删除备份文件
      try {
        await fs.unlink(backupInfo.path);
      } catch (error) {
        console.warn(`删除备份文件失败: ${backupInfo.path}`, error);
      }
      
      // 从历史记录中移除
      this.backupHistory.delete(backupId);
      
      // 保存备份历史
      await this.saveBackupHistory();
      
      console.log(`备份已删除: ${backupId}`);
      
      return {
        success: true,
        backupId,
        deletedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`删除备份失败:`, error);
      throw error;
    }
  }

  /**
   * 清理旧备份
   */
  async cleanupOldBackups() {
    try {
      console.log('开始清理旧备份');
      
      const backups = Array.from(this.backupHistory.values());
      backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // 保留最新的备份
      const backupsToDelete = backups.slice(this.maxBackups);
      
      let deletedCount = 0;
      for (const backup of backupsToDelete) {
        if (!this.isCriticalBackup(backup.id)) {
          try {
            await this.deleteBackup(backup.id, { force: false });
            deletedCount++;
          } catch (error) {
            console.warn(`清理备份失败: ${backup.id}`, error);
          }
        }
      }
      
      console.log(`清理完成，删除了 ${deletedCount} 个旧备份`);
      
      return {
        success: true,
        deletedCount,
        remainingCount: this.backupHistory.size
      };
      
    } catch (error) {
      console.error('清理旧备份失败:', error);
      throw error;
    }
  }

  /**
   * 归档备份
   */
  async archiveBackup(backupId) {
    try {
      const backupInfo = this.backupHistory.get(backupId);
      if (!backupInfo) {
        throw new Error(`备份不存在: ${backupId}`);
      }
      
      const archiveFilename = `${backupId}-archived.backup`;
      const archivePath = path.join(this.archiveDir, archiveFilename);
      
      // 复制备份文件到归档目录
      await fs.copyFile(backupInfo.path, archivePath);
      
      // 删除原备份文件
      await fs.unlink(backupInfo.path);
      
      // 更新备份信息
      backupInfo.path = archivePath;
      backupInfo.archived = true;
      backupInfo.archivedAt = new Date().toISOString();
      
      // 保存备份历史
      await this.saveBackupHistory();
      
      console.log(`备份已归档: ${backupId}`);
      
      return {
        success: true,
        backupId,
        archivePath,
        archivedAt: backupInfo.archivedAt
      };
      
    } catch (error) {
      console.error(`归档备份失败:`, error);
      throw error;
    }
  }

  /**
   * 启动自动备份
   */
  startAutoBackup() {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
    }
    
    this.backupTimer = setInterval(async () => {
      try {
        console.log('执行自动备份');
        await this.createIncrementalBackup({
          creator: 'auto-backup',
          reason: 'scheduled'
        });
        
        // 定期清理旧备份
        if (Math.random() < 0.1) { // 10% 概率执行清理
          await this.cleanupOldBackups();
        }
      } catch (error) {
        console.error('自动备份失败:', error);
      }
    }, this.backupInterval);
    
    console.log(`自动备份已启动，间隔: ${this.backupInterval}ms`);
  }

  /**
   * 停止自动备份
   */
  stopAutoBackup() {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
      this.backupTimer = null;
      console.log('自动备份已停止');
    }
  }

  /**
   * 保存备份
   */
  async saveBackup(backupData) {
    const filename = `${backupData.id}.backup`;
    const filePath = path.join(this.backupDir, filename);
    
    let content = JSON.stringify(backupData, null, 2);
    
    // 压缩
    if (this.compressionEnabled) {
      content = await gzip(Buffer.from(content, 'utf8'));
    }
    
    // 加密
    if (this.encryptionEnabled && this.encryptionKey) {
      content = this.encrypt(content);
    }
    
    await fs.writeFile(filePath, content);
    
    return filePath;
  }

  /**
   * 加载备份
   */
  async loadBackup(filePath) {
    let content = await fs.readFile(filePath);
    
    // 解密
    if (this.encryptionEnabled && this.encryptionKey) {
      content = this.decrypt(content);
    }
    
    // 解压缩
    if (this.compressionEnabled) {
      content = await gunzip(content);
    }
    
    return JSON.parse(content.toString('utf8'));
  }

  /**
   * 加密数据
   */
  encrypt(data) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, this.encryptionKey);
    
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const authTag = cipher.getAuthTag();
    
    return Buffer.concat([iv, authTag, encrypted]);
  }

  /**
   * 解密数据
   */
  decrypt(encryptedData) {
    const algorithm = 'aes-256-gcm';
    const iv = encryptedData.slice(0, 16);
    const authTag = encryptedData.slice(16, 32);
    const encrypted = encryptedData.slice(32);
    
    const decipher = crypto.createDecipher(algorithm, this.encryptionKey);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted;
  }

  /**
   * 计算校验和
   */
  calculateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * 计算文件校验和
   */
  async calculateFileChecksum(filePath) {
    const content = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * 生成备份ID
   */
  generateBackupId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = crypto.randomBytes(4).toString('hex');
    return `backup-${timestamp}-${random}`;
  }

  /**
   * 判断是否为关键备份
   */
  isCriticalBackup(backupId) {
    const backupInfo = this.backupHistory.get(backupId);
    if (!backupInfo) return false;
    
    // 最近的完整备份是关键备份
    if (backupInfo.type === 'full') {
      const recentBackups = Array.from(this.backupHistory.values())
        .filter(b => b.type === 'full')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 3);
      
      return recentBackups.some(b => b.id === backupId);
    }
    
    return false;
  }

  /**
   * 加载备份历史
   */
  async loadBackupHistory() {
    const historyPath = path.join(this.backupDir, 'backup-history.json');
    
    try {
      const content = await fs.readFile(historyPath, 'utf8');
      const history = JSON.parse(content);
      
      for (const [id, info] of Object.entries(history.backups || {})) {
        this.backupHistory.set(id, info);
      }
      
      for (const [configKey, info] of Object.entries(history.lastFullBackup || {})) {
        this.lastFullBackup.set(configKey, info);
      }
      
      console.log(`加载备份历史: ${this.backupHistory.size} 个备份`);
    } catch (error) {
      console.log('备份历史文件不存在，将创建新的历史记录');
    }
  }

  /**
   * 保存备份历史
   */
  async saveBackupHistory() {
    const historyPath = path.join(this.backupDir, 'backup-history.json');
    
    const history = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      backups: Object.fromEntries(this.backupHistory),
      lastFullBackup: Object.fromEntries(this.lastFullBackup)
    };
    
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2), 'utf8');
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
   * 获取备份统计信息
   */
  getBackupStats() {
    const backups = Array.from(this.backupHistory.values());
    
    const stats = {
      totalBackups: backups.length,
      fullBackups: backups.filter(b => b.type === 'full').length,
      incrementalBackups: backups.filter(b => b.type === 'incremental').length,
      archivedBackups: backups.filter(b => b.archived).length,
      totalSize: backups.reduce((sum, b) => sum + (b.size || 0), 0),
      oldestBackup: backups.length > 0 ? 
        backups.reduce((oldest, b) => 
          new Date(b.timestamp) < new Date(oldest.timestamp) ? b : oldest
        ).timestamp : null,
      newestBackup: backups.length > 0 ? 
        backups.reduce((newest, b) => 
          new Date(b.timestamp) > new Date(newest.timestamp) ? b : newest
        ).timestamp : null
    };
    
    return stats;
  }

  /**
   * 销毁备份系统
   */
  async destroy() {
    this.stopAutoBackup();
    this.backupHistory.clear();
    this.lastFullBackup.clear();
    
    console.log('配置备份系统已销毁');
  }
}

module.exports = { ConfigBackupRecovery };