/**
 * 数据一致性管理器
 * 为火鸟门户新闻工作流提供数据一致性保护和恢复机制
 */

class DataConsistencyManager {
  constructor(options = {}) {
    this.options = {
      enableTransactions: options.enableTransactions !== false,
      enableRollback: options.enableRollback !== false,
      enableVersioning: options.enableVersioning !== false,
      enableChecksums: options.enableChecksums !== false,
      consistencyCheckInterval: options.consistencyCheckInterval || 30000,
      maxRollbackDepth: options.maxRollbackDepth || 10,
      transactionTimeout: options.transactionTimeout || 300000, // 5分钟
      ...options
    };

    this.transactions = new Map();
    this.dataVersions = new Map();
    this.checksums = new Map();
    this.rollbackStack = [];
    this.consistencyChecks = new Map();
    this.dataStates = new Map();
    
    this.initializeConsistencyRules();
    this.startConsistencyMonitoring();
  }

  /**
   * 初始化一致性规则
   */
  initializeConsistencyRules() {
    this.consistencyRules = {
      // RSS采集数据一致性规则
      rss_collection: {
        requiredFields: ['title', 'content', 'source', 'publishedAt'],
        dataTypes: {
          title: 'string',
          content: 'string',
          source: 'string',
          publishedAt: 'string',
          quality_score: 'number'
        },
        constraints: {
          title: { minLength: 1, maxLength: 200 },
          content: { minLength: 10, maxLength: 50000 },
          source: { minLength: 1, maxLength: 100 },
          quality_score: { min: 0, max: 100 }
        },
        relationships: {
          'source_url': 'must_be_valid_url',
          'publishedAt': 'must_be_valid_date'
        }
      },

      // 内容处理数据一致性规则
      content_processing: {
        requiredFields: ['title', 'content', 'summary', 'keywords'],
        dataTypes: {
          title: 'string',
          content: 'string',
          summary: 'string',
          keywords: 'array',
          ai_enhanced: 'boolean'
        },
        constraints: {
          summary: { minLength: 50, maxLength: 500 },
          keywords: { minItems: 1, maxItems: 10 }
        },
        relationships: {
          'content_length': 'summary_must_be_shorter_than_content',
          'keywords': 'must_be_relevant_to_content'
        }
      },

      // Notion存储数据一致性规则
      notion_storage: {
        requiredFields: ['标题', '内容', '来源', '发布日期', '处理状态'],
        dataTypes: {
          '标题': 'string',
          '内容': 'string',
          '来源': 'string',
          '发布日期': 'string',
          '处理状态': 'string',
          '质量分数': 'number'
        },
        constraints: {
          '标题': { maxLength: 60 },
          '内容': { minLength: 10 },
          '处理状态': { enum: ['待处理', '已存储', '已发布', '已拒绝'] }
        },
        relationships: {
          'notion_id': 'must_be_unique',
          'firebird_id': 'must_match_if_published'
        }
      },

      // 火鸟门户发布数据一致性规则
      firebird_publish: {
        requiredFields: ['title', 'typeid', 'body', 'writer', 'source'],
        dataTypes: {
          title: 'string',
          typeid: 'number',
          body: 'string',
          writer: 'string',
          source: 'string'
        },
        constraints: {
          title: { maxLength: 60 },
          body: { minLength: 10 },
          writer: { maxLength: 20 },
          source: { maxLength: 30 }
        },
        relationships: {
          'firebird_id': 'must_be_unique_in_firebird',
          'notion_record': 'must_exist_in_notion'
        }
      }
    };
  }

  /**
   * 开始一致性监控
   */
  startConsistencyMonitoring() {
    if (this.consistencyInterval) {
      clearInterval(this.consistencyInterval);
    }

    this.consistencyInterval = setInterval(() => {
      this.performPeriodicConsistencyCheck();
    }, this.options.consistencyCheckInterval);
  }

  /**
   * 开始事务
   */
  async beginTransaction(transactionId, context = {}) {
    if (!this.options.enableTransactions) {
      return { success: true, transactionId: null };
    }

    const transaction = {
      id: transactionId || this.generateTransactionId(),
      startTime: Date.now(),
      context: context,
      operations: [],
      snapshots: new Map(),
      status: 'active',
      timeout: setTimeout(() => {
        this.rollbackTransaction(transaction.id, 'timeout');
      }, this.options.transactionTimeout)
    };

    this.transactions.set(transaction.id, transaction);

    console.log(`🔄 开始事务: ${transaction.id}`);
    return { success: true, transactionId: transaction.id };
  }

  /**
   * 记录数据操作
   */
  async recordOperation(transactionId, operation) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`事务不存在: ${transactionId}`);
    }

    if (transaction.status !== 'active') {
      throw new Error(`事务状态无效: ${transaction.status}`);
    }

    // 创建数据快照
    const snapshot = await this.createDataSnapshot(operation);
    
    const operationRecord = {
      id: this.generateOperationId(),
      timestamp: Date.now(),
      type: operation.type,
      target: operation.target,
      data: operation.data,
      snapshot: snapshot,
      checksum: this.calculateChecksum(operation.data)
    };

    transaction.operations.push(operationRecord);
    transaction.snapshots.set(operationRecord.id, snapshot);

    console.log(`📝 记录操作: ${operationRecord.id} (事务: ${transactionId})`);
    return operationRecord.id;
  }

  /**
   * 创建数据快照
   */
  async createDataSnapshot(operation) {
    const snapshot = {
      timestamp: Date.now(),
      type: operation.type,
      target: operation.target,
      beforeState: null,
      afterState: null,
      metadata: {
        operation: operation.type,
        target: operation.target,
        dataSize: JSON.stringify(operation.data || {}).length
      }
    };

    try {
      // 记录操作前状态
      if (operation.type === 'update' || operation.type === 'delete') {
        snapshot.beforeState = await this.getCurrentState(operation.target);
      }

      // 记录操作后状态
      if (operation.type === 'create' || operation.type === 'update') {
        snapshot.afterState = this.deepClone(operation.data);
      }

      // 如果启用版本控制，创建版本
      if (this.options.enableVersioning) {
        const version = await this.createVersion(operation.target, snapshot);
        snapshot.version = version;
      }

    } catch (error) {
      console.error('创建数据快照失败:', error);
      snapshot.error = error.message;
    }

    return snapshot;
  }

  /**
   * 获取当前状态
   */
  async getCurrentState(target) {
    // 这里应该根据target类型获取实际的当前状态
    // 例如从Notion、火鸟门户或其他数据源获取
    
    const currentState = this.dataStates.get(target);
    return currentState ? this.deepClone(currentState) : null;
  }

  /**
   * 创建版本
   */
  async createVersion(target, snapshot) {
    const versionId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const version = {
      id: versionId,
      target: target,
      timestamp: Date.now(),
      snapshot: snapshot,
      checksum: this.calculateChecksum(snapshot)
    };

    // 获取或创建目标的版本历史
    const versions = this.dataVersions.get(target) || [];
    versions.push(version);

    // 限制版本历史长度
    if (versions.length > this.options.maxRollbackDepth) {
      versions.shift();
    }

    this.dataVersions.set(target, versions);
    return versionId;
  }

  /**
   * 提交事务
   */
  async commitTransaction(transactionId) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`事务不存在: ${transactionId}`);
    }

    if (transaction.status !== 'active') {
      throw new Error(`事务状态无效: ${transaction.status}`);
    }

    try {
      // 执行一致性检查
      const consistencyCheck = await this.validateTransactionConsistency(transaction);
      if (!consistencyCheck.valid) {
        throw new Error(`事务一致性检查失败: ${consistencyCheck.errors.join(', ')}`);
      }

      // 计算事务校验和
      const transactionChecksum = this.calculateTransactionChecksum(transaction);
      
      // 更新数据状态
      for (const operation of transaction.operations) {
        if (operation.type === 'create' || operation.type === 'update') {
          this.dataStates.set(operation.target, operation.data);
        } else if (operation.type === 'delete') {
          this.dataStates.delete(operation.target);
        }
      }

      // 更新事务状态
      transaction.status = 'committed';
      transaction.endTime = Date.now();
      transaction.checksum = transactionChecksum;

      // 清理超时定时器
      if (transaction.timeout) {
        clearTimeout(transaction.timeout);
      }

      console.log(`✅ 事务提交成功: ${transactionId} (操作数: ${transaction.operations.length})`);
      
      return {
        success: true,
        transactionId: transactionId,
        operationsCount: transaction.operations.length,
        duration: transaction.endTime - transaction.startTime,
        checksum: transactionChecksum
      };

    } catch (error) {
      console.error(`❌ 事务提交失败: ${transactionId}`, error);
      
      // 自动回滚
      await this.rollbackTransaction(transactionId, 'commit_failed');
      
      throw error;
    }
  }

  /**
   * 回滚事务
   */
  async rollbackTransaction(transactionId, reason = 'manual') {
    if (!this.options.enableRollback) {
      console.warn('回滚功能未启用');
      return { success: false, reason: 'rollback_disabled' };
    }

    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`事务不存在: ${transactionId}`);
    }

    try {
      console.log(`🔄 开始回滚事务: ${transactionId} (原因: ${reason})`);

      const rollbackResults = [];

      // 按相反顺序回滚操作
      for (let i = transaction.operations.length - 1; i >= 0; i--) {
        const operation = transaction.operations[i];
        const rollbackResult = await this.rollbackOperation(operation);
        rollbackResults.push(rollbackResult);
      }

      // 更新事务状态
      transaction.status = 'rolled_back';
      transaction.endTime = Date.now();
      transaction.rollbackReason = reason;
      transaction.rollbackResults = rollbackResults;

      // 清理超时定时器
      if (transaction.timeout) {
        clearTimeout(transaction.timeout);
      }

      // 添加到回滚栈
      this.rollbackStack.push({
        transactionId: transactionId,
        rollbackTime: Date.now(),
        reason: reason,
        operationsRolledBack: rollbackResults.length
      });

      // 限制回滚栈大小
      if (this.rollbackStack.length > this.options.maxRollbackDepth) {
        this.rollbackStack.shift();
      }

      console.log(`✅ 事务回滚完成: ${transactionId} (回滚操作数: ${rollbackResults.length})`);

      return {
        success: true,
        transactionId: transactionId,
        reason: reason,
        operationsRolledBack: rollbackResults.length,
        rollbackResults: rollbackResults
      };

    } catch (error) {
      console.error(`❌ 事务回滚失败: ${transactionId}`, error);
      
      transaction.status = 'rollback_failed';
      transaction.rollbackError = error.message;
      
      throw error;
    }
  }

  /**
   * 回滚单个操作
   */
  async rollbackOperation(operation) {
    try {
      const snapshot = operation.snapshot;
      
      switch (operation.type) {
        case 'create':
          // 删除创建的数据
          this.dataStates.delete(operation.target);
          return { success: true, action: 'deleted', target: operation.target };

        case 'update':
          // 恢复到之前的状态
          if (snapshot.beforeState) {
            this.dataStates.set(operation.target, snapshot.beforeState);
            return { success: true, action: 'restored', target: operation.target };
          } else {
            this.dataStates.delete(operation.target);
            return { success: true, action: 'deleted', target: operation.target };
          }

        case 'delete':
          // 恢复被删除的数据
          if (snapshot.beforeState) {
            this.dataStates.set(operation.target, snapshot.beforeState);
            return { success: true, action: 'restored', target: operation.target };
          } else {
            return { success: false, reason: 'no_backup_data', target: operation.target };
          }

        default:
          return { success: false, reason: 'unknown_operation_type', target: operation.target };
      }

    } catch (error) {
      console.error(`回滚操作失败: ${operation.id}`, error);
      return { success: false, error: error.message, target: operation.target };
    }
  }

  /**
   * 验证事务一致性
   */
  async validateTransactionConsistency(transaction) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      checkedAt: Date.now()
    };

    try {
      // 检查每个操作的一致性
      for (const operation of transaction.operations) {
        const operationCheck = await this.validateOperationConsistency(operation);
        
        if (!operationCheck.valid) {
          result.valid = false;
          result.errors.push(...operationCheck.errors);
        }
        
        result.warnings.push(...operationCheck.warnings);
      }

      // 检查操作间的依赖关系
      const dependencyCheck = this.validateOperationDependencies(transaction.operations);
      if (!dependencyCheck.valid) {
        result.valid = false;
        result.errors.push(...dependencyCheck.errors);
      }

      // 检查数据完整性
      const integrityCheck = await this.validateDataIntegrity(transaction);
      if (!integrityCheck.valid) {
        result.valid = false;
        result.errors.push(...integrityCheck.errors);
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`一致性检查异常: ${error.message}`);
    }

    return result;
  }

  /**
   * 验证单个操作一致性
   */
  async validateOperationConsistency(operation) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    try {
      // 获取操作目标的一致性规则
      const rules = this.getConsistencyRules(operation.target);
      if (!rules) {
        result.warnings.push(`未找到一致性规则: ${operation.target}`);
        return result;
      }

      // 验证必需字段
      if (rules.requiredFields) {
        for (const field of rules.requiredFields) {
          if (!operation.data || operation.data[field] === undefined || operation.data[field] === null) {
            result.valid = false;
            result.errors.push(`缺少必需字段: ${field}`);
          }
        }
      }

      // 验证数据类型
      if (rules.dataTypes && operation.data) {
        for (const [field, expectedType] of Object.entries(rules.dataTypes)) {
          if (operation.data[field] !== undefined) {
            const actualType = this.getDataType(operation.data[field]);
            if (actualType !== expectedType) {
              result.valid = false;
              result.errors.push(`字段类型错误: ${field} (期望: ${expectedType}, 实际: ${actualType})`);
            }
          }
        }
      }

      // 验证约束条件
      if (rules.constraints && operation.data) {
        for (const [field, constraints] of Object.entries(rules.constraints)) {
          if (operation.data[field] !== undefined) {
            const constraintCheck = this.validateConstraints(operation.data[field], constraints);
            if (!constraintCheck.valid) {
              result.valid = false;
              result.errors.push(`字段约束违反: ${field} - ${constraintCheck.error}`);
            }
          }
        }
      }

      // 验证关系约束
      if (rules.relationships && operation.data) {
        for (const [field, relationship] of Object.entries(rules.relationships)) {
          const relationshipCheck = await this.validateRelationship(operation.data, field, relationship);
          if (!relationshipCheck.valid) {
            result.valid = false;
            result.errors.push(`关系约束违反: ${field} - ${relationshipCheck.error}`);
          }
        }
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`操作一致性检查异常: ${error.message}`);
    }

    return result;
  }

  /**
   * 获取一致性规则
   */
  getConsistencyRules(target) {
    // 根据目标类型返回相应的一致性规则
    for (const [ruleType, rules] of Object.entries(this.consistencyRules)) {
      if (target.includes(ruleType) || target.startsWith(ruleType)) {
        return rules;
      }
    }
    return null;
  }

  /**
   * 获取数据类型
   */
  getDataType(value) {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return typeof value;
  }

  /**
   * 验证约束条件
   */
  validateConstraints(value, constraints) {
    const result = { valid: true, error: null };

    try {
      // 字符串长度约束
      if (typeof value === 'string') {
        if (constraints.minLength && value.length < constraints.minLength) {
          result.valid = false;
          result.error = `长度不足 (最小: ${constraints.minLength}, 实际: ${value.length})`;
          return result;
        }
        
        if (constraints.maxLength && value.length > constraints.maxLength) {
          result.valid = false;
          result.error = `长度超限 (最大: ${constraints.maxLength}, 实际: ${value.length})`;
          return result;
        }
      }

      // 数值范围约束
      if (typeof value === 'number') {
        if (constraints.min !== undefined && value < constraints.min) {
          result.valid = false;
          result.error = `数值过小 (最小: ${constraints.min}, 实际: ${value})`;
          return result;
        }
        
        if (constraints.max !== undefined && value > constraints.max) {
          result.valid = false;
          result.error = `数值过大 (最大: ${constraints.max}, 实际: ${value})`;
          return result;
        }
      }

      // 数组长度约束
      if (Array.isArray(value)) {
        if (constraints.minItems && value.length < constraints.minItems) {
          result.valid = false;
          result.error = `项目数不足 (最小: ${constraints.minItems}, 实际: ${value.length})`;
          return result;
        }
        
        if (constraints.maxItems && value.length > constraints.maxItems) {
          result.valid = false;
          result.error = `项目数超限 (最大: ${constraints.maxItems}, 实际: ${value.length})`;
          return result;
        }
      }

      // 枚举值约束
      if (constraints.enum && !constraints.enum.includes(value)) {
        result.valid = false;
        result.error = `值不在允许范围内 (允许: ${constraints.enum.join(', ')}, 实际: ${value})`;
        return result;
      }

    } catch (error) {
      result.valid = false;
      result.error = `约束验证异常: ${error.message}`;
    }

    return result;
  }

  /**
   * 验证关系约束
   */
  async validateRelationship(data, field, relationship) {
    const result = { valid: true, error: null };

    try {
      const value = data[field];
      
      switch (relationship) {
        case 'must_be_valid_url':
          if (value && !this.isValidUrl(value)) {
            result.valid = false;
            result.error = '必须是有效的URL';
          }
          break;

        case 'must_be_valid_date':
          if (value && !this.isValidDate(value)) {
            result.valid = false;
            result.error = '必须是有效的日期';
          }
          break;

        case 'must_be_unique':
          const isDuplicate = await this.checkDuplicate(field, value);
          if (isDuplicate) {
            result.valid = false;
            result.error = '值必须唯一';
          }
          break;

        case 'summary_must_be_shorter_than_content':
          if (data.summary && data.content && data.summary.length >= data.content.length) {
            result.valid = false;
            result.error = '摘要长度必须小于内容长度';
          }
          break;

        case 'must_be_relevant_to_content':
          // 这里可以实现关键词与内容相关性检查
          break;

        default:
          result.error = `未知关系约束: ${relationship}`;
      }

    } catch (error) {
      result.valid = false;
      result.error = `关系验证异常: ${error.message}`;
    }

    return result;
  }

  /**
   * 验证操作依赖关系
   */
  validateOperationDependencies(operations) {
    const result = {
      valid: true,
      errors: []
    };

    // 检查操作顺序依赖
    const targets = new Set();
    
    for (const operation of operations) {
      if (operation.type === 'create') {
        if (targets.has(operation.target)) {
          result.valid = false;
          result.errors.push(`重复创建目标: ${operation.target}`);
        }
        targets.add(operation.target);
      } else if (operation.type === 'update' || operation.type === 'delete') {
        if (!targets.has(operation.target)) {
          // 检查是否在外部存在
          const exists = this.dataStates.has(operation.target);
          if (!exists) {
            result.valid = false;
            result.errors.push(`操作目标不存在: ${operation.target}`);
          }
        }
      }
    }

    return result;
  }

  /**
   * 验证数据完整性
   */
  async validateDataIntegrity(transaction) {
    const result = {
      valid: true,
      errors: []
    };

    try {
      // 验证校验和
      for (const operation of transaction.operations) {
        const expectedChecksum = operation.checksum;
        const actualChecksum = this.calculateChecksum(operation.data);
        
        if (expectedChecksum !== actualChecksum) {
          result.valid = false;
          result.errors.push(`数据校验和不匹配: ${operation.target}`);
        }
      }

      // 验证快照完整性
      for (const [operationId, snapshot] of transaction.snapshots) {
        const snapshotValid = await this.validateSnapshot(snapshot);
        if (!snapshotValid) {
          result.valid = false;
          result.errors.push(`快照完整性验证失败: ${operationId}`);
        }
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`数据完整性检查异常: ${error.message}`);
    }

    return result;
  }

  /**
   * 验证快照
   */
  async validateSnapshot(snapshot) {
    try {
      // 验证快照结构
      if (!snapshot.timestamp || !snapshot.type || !snapshot.target) {
        return false;
      }

      // 验证快照数据
      if (snapshot.afterState) {
        const checksum = this.calculateChecksum(snapshot.afterState);
        // 这里可以添加更多的快照验证逻辑
      }

      return true;
    } catch (error) {
      console.error('快照验证失败:', error);
      return false;
    }
  }

  /**
   * 执行定期一致性检查
   */
  async performPeriodicConsistencyCheck() {
    try {
      console.log('🔍 执行定期一致性检查...');

      const checkResults = {
        timestamp: Date.now(),
        transactionChecks: [],
        dataStateChecks: [],
        versionChecks: [],
        checksumChecks: []
      };

      // 检查活跃事务
      for (const [transactionId, transaction] of this.transactions) {
        if (transaction.status === 'active') {
          const transactionAge = Date.now() - transaction.startTime;
          if (transactionAge > this.options.transactionTimeout) {
            console.warn(`⚠️ 发现超时事务: ${transactionId}`);
            await this.rollbackTransaction(transactionId, 'timeout');
            checkResults.transactionChecks.push({
              transactionId,
              action: 'rolled_back',
              reason: 'timeout'
            });
          }
        }
      }

      // 检查数据状态一致性
      for (const [target, state] of this.dataStates) {
        const stateCheck = await this.validateDataState(target, state);
        checkResults.dataStateChecks.push({
          target,
          valid: stateCheck.valid,
          errors: stateCheck.errors
        });
      }

      // 检查版本一致性
      if (this.options.enableVersioning) {
        for (const [target, versions] of this.dataVersions) {
          const versionCheck = this.validateVersionHistory(target, versions);
          checkResults.versionChecks.push({
            target,
            valid: versionCheck.valid,
            versionCount: versions.length
          });
        }
      }

      // 检查校验和一致性
      if (this.options.enableChecksums) {
        for (const [target, checksum] of this.checksums) {
          const currentState = this.dataStates.get(target);
          if (currentState) {
            const currentChecksum = this.calculateChecksum(currentState);
            const checksumValid = checksum === currentChecksum;
            checkResults.checksumChecks.push({
              target,
              valid: checksumValid,
              stored: checksum,
              current: currentChecksum
            });
          }
        }
      }

      // 存储检查结果
      this.consistencyChecks.set(Date.now(), checkResults);

      // 清理过期的检查结果
      this.cleanupExpiredChecks();

      console.log('✅ 定期一致性检查完成');

    } catch (error) {
      console.error('❌ 定期一致性检查失败:', error);
    }
  }

  /**
   * 验证数据状态
   */
  async validateDataState(target, state) {
    const result = {
      valid: true,
      errors: []
    };

    try {
      // 获取一致性规则
      const rules = this.getConsistencyRules(target);
      if (rules) {
        // 验证必需字段
        if (rules.requiredFields) {
          for (const field of rules.requiredFields) {
            if (!state || state[field] === undefined || state[field] === null) {
              result.valid = false;
              result.errors.push(`缺少必需字段: ${field}`);
            }
          }
        }

        // 验证数据类型
        if (rules.dataTypes && state) {
          for (const [field, expectedType] of Object.entries(rules.dataTypes)) {
            if (state[field] !== undefined) {
              const actualType = this.getDataType(state[field]);
              if (actualType !== expectedType) {
                result.valid = false;
                result.errors.push(`字段类型错误: ${field}`);
              }
            }
          }
        }
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`数据状态验证异常: ${error.message}`);
    }

    return result;
  }

  /**
   * 验证版本历史
   */
  validateVersionHistory(target, versions) {
    const result = {
      valid: true,
      errors: []
    };

    try {
      // 检查版本顺序
      for (let i = 1; i < versions.length; i++) {
        if (versions[i].timestamp <= versions[i-1].timestamp) {
          result.valid = false;
          result.errors.push('版本时间戳顺序错误');
          break;
        }
      }

      // 检查版本完整性
      for (const version of versions) {
        if (!version.id || !version.timestamp || !version.snapshot) {
          result.valid = false;
          result.errors.push(`版本数据不完整: ${version.id}`);
        }
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`版本历史验证异常: ${error.message}`);
    }

    return result;
  }

  /**
   * 清理过期检查结果
   */
  cleanupExpiredChecks() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24小时前
    
    for (const [timestamp, check] of this.consistencyChecks) {
      if (timestamp < cutoffTime) {
        this.consistencyChecks.delete(timestamp);
      }
    }
  }

  /**
   * 计算校验和
   */
  calculateChecksum(data) {
    if (!this.options.enableChecksums) {
      return null;
    }

    try {
      const dataString = JSON.stringify(data, Object.keys(data).sort());
      return this.simpleHash(dataString);
    } catch (error) {
      console.error('计算校验和失败:', error);
      return null;
    }
  }

  /**
   * 计算事务校验和
   */
  calculateTransactionChecksum(transaction) {
    const transactionData = {
      id: transaction.id,
      operations: transaction.operations.map(op => ({
        id: op.id,
        type: op.type,
        target: op.target,
        checksum: op.checksum
      }))
    };

    return this.calculateChecksum(transactionData);
  }

  /**
   * 简单哈希函数
   */
  simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * 深度克隆
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item));
    }

    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }

  /**
   * 辅助方法
   */
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  async checkDuplicate(field, value) {
    // 这里应该实现实际的重复检查逻辑
    // 例如查询数据库或其他数据源
    return false;
  }

  generateTransactionId() {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    return {
      transactions: {
        total: this.transactions.size,
        active: Array.from(this.transactions.values()).filter(t => t.status === 'active').length,
        committed: Array.from(this.transactions.values()).filter(t => t.status === 'committed').length,
        rolledBack: Array.from(this.transactions.values()).filter(t => t.status === 'rolled_back').length
      },
      dataStates: {
        total: this.dataStates.size
      },
      versions: {
        targets: this.dataVersions.size,
        totalVersions: Array.from(this.dataVersions.values()).reduce((sum, versions) => sum + versions.length, 0)
      },
      rollbacks: {
        total: this.rollbackStack.length
      },
      consistencyChecks: {
        total: this.consistencyChecks.size
      }
    };
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.consistencyInterval) {
      clearInterval(this.consistencyInterval);
    }

    // 清理所有活跃事务的超时定时器
    for (const transaction of this.transactions.values()) {
      if (transaction.timeout) {
        clearTimeout(transaction.timeout);
      }
    }

    this.transactions.clear();
    this.dataVersions.clear();
    this.checksums.clear();
    this.rollbackStack.length = 0;
    this.consistencyChecks.clear();
    this.dataStates.clear();
  }
}

module.exports = DataConsistencyManager;