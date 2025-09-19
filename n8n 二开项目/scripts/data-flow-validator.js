#!/usr/bin/env node

/**
 * 数据流验证脚本
 * 用于验证工作流中数据的完整性、一致性和质量
 */

const fs = require('fs');
const path = require('path');

class DataFlowValidator {
  constructor(options = {}) {
    this.options = {
      strictMode: options.strictMode || false,
      logLevel: options.logLevel || 'info',
      validationRules: options.validationRules || {},
      enableAutoFix: options.enableAutoFix || false,
      ...options
    };
    
    this.validationResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: [],
      warnings: [],
      fixes: []
    };
    
    this.initializeValidator();
  }
  
  /**
   * 初始化验证器
   */
  initializeValidator() {
    this.loadValidationRules();
    console.log('🔍 数据流验证器已初始化');
  }
  
  /**
   * 加载验证规则
   */
  loadValidationRules() {
    const defaultRules = {
      // 内容验证规则
      content: {
        title: {
          required: true,
          minLength: 5,
          maxLength: 200,
          pattern: /^[\s\S]+$/,
          blacklist: ['测试', 'test', 'demo']
        },
        content: {
          required: true,
          minLength: 50,
          maxLength: 10000,
          encoding: 'utf8'
        },
        source: {
          required: true,
          minLength: 1,
          maxLength: 50,
          whitelist: ['The Neuron', 'Futurepedia', 'Superhuman', 'The Rundown AI', 'GitHub Trending', 'API采集']
        },
        author: {
          maxLength: 20,
          default: 'AI采集'
        },
        category: {
          required: true,
          whitelist: ['AI资讯', 'AI工具', '科技资讯', '开源项目', 'AI新闻', 'AI商业']
        },
        categoryId: {
          required: true,
          type: 'number',
          min: 1,
          max: 100
        }
      },
      
      // 质量验证规则
      quality: {
        qualityScore: {
          type: 'number',
          min: 0,
          max: 100,
          warningThreshold: 70,
          errorThreshold: 50
        },
        duplicateThreshold: 0.8,
        languageDetection: true,
        contentRelevance: true
      },
      
      // 数据映射验证规则
      mapping: {
        notion: {
          requiredFields: ['标题', '内容', '来源', '分类ID'],
          fieldLimits: {
            '标题': 60,
            '短标题': 36,
            '摘要': 255,
            '作者': 20,
            '来源': 30,
            '关键词': 50
          }
        },
        firebird: {
          requiredFields: ['service', 'action', 'title', 'typeid', 'body'],
          fieldLimits: {
            'title': 60,
            'writer': 20,
            'source': 30,
            'keywords': 50,
            'description': 255,
            'sourceurl': 200
          }
        }
      },
      
      // 工作流状态验证规则
      workflow: {
        requiredPhases: [
          'initialization',
          'data_collection',
          'content_processing',
          'notion_storage',
          'ai_management',
          'firebird_publish',
          'completion'
        ],
        maxExecutionTime: 600000, // 10分钟
        minSuccessRate: 0.95
      }
    };
    
    this.validationRules = {
      ...defaultRules,
      ...this.options.validationRules
    };
  }
  
  /**
   * 验证单个数据项
   */
  validateDataItem(data, context = {}) {
    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: [],
      score: 100
    };
    
    try {
      // 基础内容验证
      this.validateContent(data, results);
      
      // 质量验证
      this.validateQuality(data, results);
      
      // 数据映射验证
      this.validateMapping(data, context, results);
      
      // 业务逻辑验证
      this.validateBusinessLogic(data, results);
      
      // 计算最终分数
      results.score = this.calculateValidationScore(results);
      results.isValid = results.errors.length === 0;
      
    } catch (error) {
      results.isValid = false;
      results.errors.push({
        type: 'validation_error',
        message: `验证过程出错: ${error.message}`,
        severity: 'critical'
      });
      results.score = 0;
    }
    
    return results;
  }
  
  /**
   * 验证内容字段
   */
  validateContent(data, results) {
    const contentRules = this.validationRules.content;
    
    // 验证标题
    if (contentRules.title) {
      this.validateField(data, 'title', contentRules.title, results);
    }
    
    // 验证内容
    if (contentRules.content) {
      this.validateField(data, 'content', contentRules.content, results);
    }
    
    // 验证来源
    if (contentRules.source) {
      this.validateField(data, 'source', contentRules.source, results);
    }
    
    // 验证作者
    if (contentRules.author) {
      this.validateField(data, 'author', contentRules.author, results);
    }
    
    // 验证分类
    if (contentRules.category) {
      this.validateField(data, 'category', contentRules.category, results);
    }
    
    // 验证分类ID
    if (contentRules.categoryId) {
      this.validateField(data, 'categoryId', contentRules.categoryId, results);
    }
  }
  
  /**
   * 验证单个字段
   */
  validateField(data, fieldName, rules, results) {
    const value = data[fieldName];
    
    // 检查必填字段
    if (rules.required && (value === undefined || value === null || value === '')) {
      results.errors.push({
        type: 'required_field_missing',
        field: fieldName,
        message: `必填字段 ${fieldName} 缺失`,
        severity: 'error'
      });
      return;
    }
    
    // 如果字段为空且不是必填，跳过后续验证
    if (!value && !rules.required) {
      return;
    }
    
    // 类型验证
    if (rules.type) {
      if (!this.validateFieldType(value, rules.type)) {
        results.errors.push({
          type: 'invalid_type',
          field: fieldName,
          message: `字段 ${fieldName} 类型不正确，期望: ${rules.type}`,
          severity: 'error'
        });
        return;
      }
    }
    
    // 长度验证
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        results.errors.push({
          type: 'min_length_violation',
          field: fieldName,
          message: `字段 ${fieldName} 长度过短，最小长度: ${rules.minLength}`,
          severity: 'error'
        });
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        if (this.options.enableAutoFix) {
          const truncated = value.substring(0, rules.maxLength);
          results.fixes.push({
            type: 'truncate_field',
            field: fieldName,
            original: value,
            fixed: truncated,
            message: `字段 ${fieldName} 已截断到 ${rules.maxLength} 字符`
          });
          data[fieldName] = truncated;
        } else {
          results.errors.push({
            type: 'max_length_violation',
            field: fieldName,
            message: `字段 ${fieldName} 长度过长，最大长度: ${rules.maxLength}`,
            severity: 'error'
          });
        }
      }
    }
    
    // 数值范围验证
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        results.errors.push({
          type: 'min_value_violation',
          field: fieldName,
          message: `字段 ${fieldName} 值过小，最小值: ${rules.min}`,
          severity: 'error'
        });
      }
      
      if (rules.max !== undefined && value > rules.max) {
        results.errors.push({
          type: 'max_value_violation',
          field: fieldName,
          message: `字段 ${fieldName} 值过大，最大值: ${rules.max}`,
          severity: 'error'
        });
      }
    }
    
    // 正则表达式验证
    if (rules.pattern && typeof value === 'string') {
      if (!rules.pattern.test(value)) {
        results.errors.push({
          type: 'pattern_mismatch',
          field: fieldName,
          message: `字段 ${fieldName} 格式不正确`,
          severity: 'error'
        });
      }
    }
    
    // 白名单验证
    if (rules.whitelist && Array.isArray(rules.whitelist)) {
      if (!rules.whitelist.includes(value)) {
        results.warnings.push({
          type: 'whitelist_violation',
          field: fieldName,
          message: `字段 ${fieldName} 值不在白名单中: ${value}`,
          severity: 'warning'
        });
      }
    }
    
    // 黑名单验证
    if (rules.blacklist && Array.isArray(rules.blacklist)) {
      if (rules.blacklist.some(item => 
        typeof value === 'string' && value.toLowerCase().includes(item.toLowerCase())
      )) {
        results.errors.push({
          type: 'blacklist_violation',
          field: fieldName,
          message: `字段 ${fieldName} 包含禁用内容`,
          severity: 'error'
        });
      }
    }
  }
  
  /**
   * 验证字段类型
   */
  validateFieldType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }
  
  /**
   * 验证质量指标
   */
  validateQuality(data, results) {
    const qualityRules = this.validationRules.quality;
    
    // 验证质量分数
    if (data.quality_score !== undefined) {
      const score = parseFloat(data.quality_score);
      
      if (qualityRules.qualityScore) {
        if (score < qualityRules.qualityScore.errorThreshold) {
          results.errors.push({
            type: 'low_quality_score',
            message: `内容质量分数过低: ${score}`,
            severity: 'error'
          });
        } else if (score < qualityRules.qualityScore.warningThreshold) {
          results.warnings.push({
            type: 'low_quality_score',
            message: `内容质量分数较低: ${score}`,
            severity: 'warning'
          });
        }
      }
    }
    
    // 验证内容相关性
    if (qualityRules.contentRelevance && data.title && data.content) {
      const relevance = this.calculateContentRelevance(data.title, data.content);
      if (relevance < 0.5) {
        results.warnings.push({
          type: 'low_content_relevance',
          message: `标题与内容相关性较低: ${(relevance * 100).toFixed(1)}%`,
          severity: 'warning'
        });
      }
    }
    
    // 语言检测
    if (qualityRules.languageDetection && data.content) {
      const language = this.detectLanguage(data.content);
      if (language !== 'zh' && language !== 'en') {
        results.warnings.push({
          type: 'unsupported_language',
          message: `检测到不支持的语言: ${language}`,
          severity: 'warning'
        });
      }
    }
  }
  
  /**
   * 计算内容相关性
   */
  calculateContentRelevance(title, content) {
    // 简单的相关性计算
    const titleWords = title.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/).slice(0, 100); // 只检查前100个词
    
    let matches = 0;
    titleWords.forEach(word => {
      if (word.length > 2 && contentWords.includes(word)) {
        matches++;
      }
    });
    
    return titleWords.length > 0 ? matches / titleWords.length : 0;
  }
  
  /**
   * 检测语言
   */
  detectLanguage(text) {
    // 简单的语言检测
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
    const totalChars = text.length;
    
    if (chineseChars / totalChars > 0.3) {
      return 'zh';
    } else if (englishChars / totalChars > 0.5) {
      return 'en';
    } else {
      return 'unknown';
    }
  }
  
  /**
   * 验证数据映射
   */
  validateMapping(data, context, results) {
    const mappingRules = this.validationRules.mapping;
    
    // 验证Notion映射
    if (context.target === 'notion' && mappingRules.notion) {
      this.validateNotionMapping(data, mappingRules.notion, results);
    }
    
    // 验证火鸟门户映射
    if (context.target === 'firebird' && mappingRules.firebird) {
      this.validateFirebirdMapping(data, mappingRules.firebird, results);
    }
  }
  
  /**
   * 验证Notion映射
   */
  validateNotionMapping(data, rules, results) {
    // 检查必填字段
    rules.requiredFields.forEach(field => {
      const mappedField = this.mapToNotionField(field, data);\n      if (!mappedField) {\n        results.errors.push({\n          type: 'notion_required_field_missing',\n          field: field,\n          message: `Notion必填字段 ${field} 缺失`,\n          severity: 'error'\n        });\n      }\n    });\n    \n    // 检查字段长度限制\n    Object.entries(rules.fieldLimits).forEach(([field, limit]) => {\n      const mappedField = this.mapToNotionField(field, data);\n      if (mappedField && typeof mappedField === 'string' && mappedField.length > limit) {\n        if (this.options.enableAutoFix) {\n          const truncated = mappedField.substring(0, limit);\n          results.fixes.push({\n            type: 'truncate_notion_field',\n            field: field,\n            original: mappedField,\n            fixed: truncated,\n            message: `Notion字段 ${field} 已截断到 ${limit} 字符`\n          });\n        } else {\n          results.errors.push({\n            type: 'notion_field_too_long',\n            field: field,\n            message: `Notion字段 ${field} 超过长度限制 ${limit}`,\n            severity: 'error'\n          });\n        }\n      }\n    });\n  }\n  \n  /**\n   * 映射到Notion字段\n   */\n  mapToNotionField(notionField, data) {\n    const mapping = {\n      '标题': data.title,\n      '短标题': data.subtitle || data.summary?.substring(0, 36),\n      '内容': data.content,\n      '摘要': data.summary || data.description,\n      '来源': data.source,\n      '作者': data.author,\n      '分类ID': data.categoryId || data.typeid,\n      '关键词': Array.isArray(data.keywords) ? data.keywords.join(',') : data.keywords\n    };\n    \n    return mapping[notionField];\n  }\n  \n  /**\n   * 验证火鸟门户映射\n   */\n  validateFirebirdMapping(data, rules, results) {\n    // 检查必填字段\n    rules.requiredFields.forEach(field => {\n      if (!data[field]) {\n        results.errors.push({\n          type: 'firebird_required_field_missing',\n          field: field,\n          message: `火鸟门户必填字段 ${field} 缺失`,\n          severity: 'error'\n        });\n      }\n    });\n    \n    // 检查字段长度限制\n    Object.entries(rules.fieldLimits).forEach(([field, limit]) => {\n      const value = data[field];\n      if (value && typeof value === 'string' && value.length > limit) {\n        if (this.options.enableAutoFix) {\n          const truncated = value.substring(0, limit);\n          results.fixes.push({\n            type: 'truncate_firebird_field',\n            field: field,\n            original: value,\n            fixed: truncated,\n            message: `火鸟门户字段 ${field} 已截断到 ${limit} 字符`\n          });\n          data[field] = truncated;\n        } else {\n          results.errors.push({\n            type: 'firebird_field_too_long',\n            field: field,\n            message: `火鸟门户字段 ${field} 超过长度限制 ${limit}`,\n            severity: 'error'\n          });\n        }\n      }\n    });\n  }\n  \n  /**\n   * 验证业务逻辑\n   */\n  validateBusinessLogic(data, results) {\n    // 验证分类与内容的匹配度\n    if (data.category && data.content) {\n      const categoryMatch = this.validateCategoryMatch(data.category, data.content);\n      if (!categoryMatch.isMatch) {\n        results.warnings.push({\n          type: 'category_content_mismatch',\n          message: `分类与内容不匹配: ${data.category}`,\n          severity: 'warning',\n          confidence: categoryMatch.confidence\n        });\n      }\n    }\n    \n    // 验证URL有效性\n    if (data.source_url) {\n      if (!this.isValidUrl(data.source_url)) {\n        results.errors.push({\n          type: 'invalid_url',\n          field: 'source_url',\n          message: `无效的URL: ${data.source_url}`,\n          severity: 'error'\n        });\n      }\n    }\n    \n    // 验证时间戳\n    if (data.publishedAt) {\n      const publishDate = new Date(data.publishedAt);\n      const now = new Date();\n      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());\n      \n      if (publishDate > now) {\n        results.warnings.push({\n          type: 'future_publish_date',\n          message: `发布日期在未来: ${data.publishedAt}`,\n          severity: 'warning'\n        });\n      } else if (publishDate < oneYearAgo) {\n        results.warnings.push({\n          type: 'old_publish_date',\n          message: `发布日期过旧: ${data.publishedAt}`,\n          severity: 'warning'\n        });\n      }\n    }\n  }\n  \n  /**\n   * 验证分类匹配\n   */\n  validateCategoryMatch(category, content) {\n    const categoryKeywords = {\n      'AI资讯': ['ai', 'artificial intelligence', '人工智能', 'machine learning', '机器学习'],\n      'AI工具': ['tool', 'software', '工具', 'application', '应用'],\n      '科技资讯': ['technology', '科技', 'tech', 'innovation', '创新'],\n      '开源项目': ['open source', '开源', 'github', 'repository', '项目'],\n      'AI新闻': ['news', '新闻', 'announcement', '公告'],\n      'AI商业': ['business', '商业', 'enterprise', '企业', 'market', '市场']\n    };\n    \n    const keywords = categoryKeywords[category] || [];\n    const contentLower = content.toLowerCase();\n    \n    let matches = 0;\n    keywords.forEach(keyword => {\n      if (contentLower.includes(keyword.toLowerCase())) {\n        matches++;\n      }\n    });\n    \n    const confidence = keywords.length > 0 ? matches / keywords.length : 0;\n    \n    return {\n      isMatch: confidence > 0.2, // 至少匹配20%的关键词\n      confidence: confidence\n    };\n  }\n  \n  /**\n   * 验证URL有效性\n   */\n  isValidUrl(string) {\n    try {\n      new URL(string);\n      return true;\n    } catch (_) {\n      return false;\n    }\n  }\n  \n  /**\n   * 计算验证分数\n   */\n  calculateValidationScore(results) {\n    let score = 100;\n    \n    // 错误扣分\n    results.errors.forEach(error => {\n      switch (error.severity) {\n        case 'critical':\n          score -= 50;\n          break;\n        case 'error':\n          score -= 20;\n          break;\n        default:\n          score -= 10;\n      }\n    });\n    \n    // 警告扣分\n    results.warnings.forEach(warning => {\n      score -= 5;\n    });\n    \n    return Math.max(0, score);\n  }\n  \n  /**\n   * 验证工作流状态\n   */\n  validateWorkflowStatus(workflowStatus) {\n    const results = {\n      isValid: true,\n      errors: [],\n      warnings: [],\n      score: 100\n    };\n    \n    const rules = this.validationRules.workflow;\n    \n    // 检查必需的阶段\n    if (rules.requiredPhases) {\n      const currentPhase = workflowStatus.phase;\n      if (!rules.requiredPhases.includes(currentPhase)) {\n        results.warnings.push({\n          type: 'unknown_workflow_phase',\n          message: `未知的工作流阶段: ${currentPhase}`,\n          severity: 'warning'\n        });\n      }\n    }\n    \n    // 检查执行时间\n    if (workflowStatus.startTime) {\n      const executionTime = Date.now() - workflowStatus.startTime;\n      if (executionTime > rules.maxExecutionTime) {\n        results.errors.push({\n          type: 'execution_timeout',\n          message: `工作流执行时间过长: ${Math.round(executionTime/1000)}秒`,\n          severity: 'error'\n        });\n      }\n    }\n    \n    // 检查成功率\n    if (workflowStatus.successCount !== undefined && workflowStatus.failureCount !== undefined) {\n      const total = workflowStatus.successCount + workflowStatus.failureCount;\n      const successRate = total > 0 ? workflowStatus.successCount / total : 0;\n      \n      if (successRate < rules.minSuccessRate) {\n        results.errors.push({\n          type: 'low_success_rate',\n          message: `工作流成功率过低: ${(successRate * 100).toFixed(1)}%`,\n          severity: 'error'\n        });\n      }\n    }\n    \n    results.score = this.calculateValidationScore(results);\n    results.isValid = results.errors.length === 0;\n    \n    return results;\n  }\n  \n  /**\n   * 批量验证数据\n   */\n  validateBatch(dataItems, context = {}) {\n    const batchResults = {\n      totalItems: dataItems.length,\n      validItems: 0,\n      invalidItems: 0,\n      warnings: 0,\n      fixes: 0,\n      results: [],\n      summary: {\n        averageScore: 0,\n        errorsByType: {},\n        warningsByType: {}\n      }\n    };\n    \n    let totalScore = 0;\n    \n    dataItems.forEach((item, index) => {\n      const itemResult = this.validateDataItem(item, context);\n      itemResult.index = index;\n      \n      batchResults.results.push(itemResult);\n      \n      if (itemResult.isValid) {\n        batchResults.validItems++;\n      } else {\n        batchResults.invalidItems++;\n      }\n      \n      batchResults.warnings += itemResult.warnings.length;\n      batchResults.fixes += itemResult.fixes.length;\n      totalScore += itemResult.score;\n      \n      // 统计错误类型\n      itemResult.errors.forEach(error => {\n        batchResults.summary.errorsByType[error.type] = \n          (batchResults.summary.errorsByType[error.type] || 0) + 1;\n      });\n      \n      // 统计警告类型\n      itemResult.warnings.forEach(warning => {\n        batchResults.summary.warningsByType[warning.type] = \n          (batchResults.summary.warningsByType[warning.type] || 0) + 1;\n      });\n    });\n    \n    batchResults.summary.averageScore = dataItems.length > 0 ? totalScore / dataItems.length : 0;\n    \n    return batchResults;\n  }\n  \n  /**\n   * 生成验证报告\n   */\n  generateValidationReport(results, options = {}) {\n    const report = {\n      timestamp: new Date().toISOString(),\n      validator: {\n        version: '1.0.0',\n        strictMode: this.options.strictMode,\n        autoFixEnabled: this.options.enableAutoFix\n      },\n      summary: {\n        totalItems: results.totalItems || 1,\n        validItems: results.validItems || (results.isValid ? 1 : 0),\n        invalidItems: results.invalidItems || (results.isValid ? 0 : 1),\n        validationRate: results.totalItems > 0 ? \n          (results.validItems / results.totalItems * 100).toFixed(1) + '%' : \n          (results.isValid ? '100%' : '0%'),\n        averageScore: results.summary?.averageScore || results.score || 0,\n        totalWarnings: results.warnings || (results.warnings?.length || 0),\n        totalFixes: results.fixes || (results.fixes?.length || 0)\n      },\n      details: results,\n      recommendations: this.generateRecommendations(results)\n    };\n    \n    if (options.saveToFile) {\n      this.saveValidationReport(report, options.filename);\n    }\n    \n    return report;\n  }\n  \n  /**\n   * 生成改进建议\n   */\n  generateRecommendations(results) {\n    const recommendations = [];\n    \n    // 基于错误类型生成建议\n    if (results.summary?.errorsByType) {\n      Object.entries(results.summary.errorsByType).forEach(([errorType, count]) => {\n        switch (errorType) {\n          case 'required_field_missing':\n            recommendations.push({\n              type: 'data_quality',\n              priority: 'high',\n              message: `有${count}个必填字段缺失，建议检查数据采集逻辑`\n            });\n            break;\n          case 'max_length_violation':\n            recommendations.push({\n              type: 'data_processing',\n              priority: 'medium',\n              message: `有${count}个字段超长，建议启用自动截断功能`\n            });\n            break;\n          case 'low_quality_score':\n            recommendations.push({\n              type: 'content_quality',\n              priority: 'high',\n              message: `有${count}个内容质量分数过低，建议优化内容筛选标准`\n            });\n            break;\n        }\n      });\n    }\n    \n    // 基于平均分数生成建议\n    const avgScore = results.summary?.averageScore || results.score || 0;\n    if (avgScore < 70) {\n      recommendations.push({\n        type: 'overall_quality',\n        priority: 'critical',\n        message: `整体验证分数较低(${avgScore.toFixed(1)})，建议全面检查数据质量流程`\n      });\n    } else if (avgScore < 85) {\n      recommendations.push({\n        type: 'overall_quality',\n        priority: 'medium',\n        message: `验证分数有提升空间(${avgScore.toFixed(1)})，建议优化数据处理逻辑`\n      });\n    }\n    \n    return recommendations;\n  }\n  \n  /**\n   * 保存验证报告\n   */\n  saveValidationReport(report, filename) {\n    const reportsDir = path.join(__dirname, '../logs/validation');\n    \n    // 确保目录存在\n    if (!fs.existsSync(reportsDir)) {\n      fs.mkdirSync(reportsDir, { recursive: true });\n    }\n    \n    const reportFilename = filename || `validation-report-${new Date().toISOString().split('T')[0]}.json`;\n    const filepath = path.join(reportsDir, reportFilename);\n    \n    try {\n      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));\n      console.log(`📄 验证报告已保存: ${filepath}`);\n    } catch (error) {\n      console.error('保存验证报告失败:', error.message);\n    }\n  }\n  \n  /**\n   * 输出验证结果摘要\n   */\n  logValidationSummary(results) {\n    console.log('\\n🔍 数据流验证结果摘要:');\n    \n    if (results.totalItems) {\n      // 批量验证结果\n      console.log(`总计: ${results.totalItems}项`);\n      console.log(`有效: ${results.validItems}项 (${((results.validItems/results.totalItems)*100).toFixed(1)}%)`);\n      console.log(`无效: ${results.invalidItems}项`);\n      console.log(`警告: ${results.warnings}个`);\n      console.log(`修复: ${results.fixes}个`);\n      console.log(`平均分数: ${results.summary.averageScore.toFixed(1)}`);\n      \n      if (Object.keys(results.summary.errorsByType).length > 0) {\n        console.log('\\n主要错误类型:');\n        Object.entries(results.summary.errorsByType)\n          .sort(([,a], [,b]) => b - a)\n          .slice(0, 5)\n          .forEach(([type, count]) => {\n            console.log(`  ${type}: ${count}次`);\n          });\n      }\n    } else {\n      // 单项验证结果\n      console.log(`验证结果: ${results.isValid ? '✅ 通过' : '❌ 失败'}`);\n      console.log(`验证分数: ${results.score}`);\n      console.log(`错误: ${results.errors?.length || 0}个`);\n      console.log(`警告: ${results.warnings?.length || 0}个`);\n      console.log(`修复: ${results.fixes?.length || 0}个`);\n    }\n    \n    console.log('─'.repeat(50));\n  }\n}\n\n// 如果直接运行此脚本\nif (require.main === module) {\n  const validator = new DataFlowValidator({\n    strictMode: process.env.VALIDATION_STRICT_MODE === 'true',\n    logLevel: process.env.VALIDATION_LOG_LEVEL || 'info',\n    enableAutoFix: process.env.VALIDATION_AUTO_FIX === 'true'\n  });\n  \n  // 示例验证\n  const sampleData = {\n    title: 'AI技术最新发展动态',\n    content: '人工智能技术在各个领域都取得了显著进展，特别是在自然语言处理和计算机视觉方面。本文将详细介绍最新的AI技术突破和应用案例。',\n    source: 'The Neuron',\n    author: 'AI研究员',\n    category: 'AI资讯',\n    categoryId: 1,\n    quality_score: 85,\n    publishedAt: new Date().toISOString()\n  };\n  \n  console.log('🧪 运行数据流验证测试...');\n  \n  const result = validator.validateDataItem(sampleData);\n  validator.logValidationSummary(result);\n  \n  const report = validator.generateValidationReport(result, {\n    saveToFile: true,\n    filename: 'test-validation-report.json'\n  });\n  \n  console.log('\\n📋 验证报告已生成');\n}\n\nmodule.exports = DataFlowValidator;