#!/bin/bash

# N8N企业级自动化工作流平台 - 日志管理脚本
# 日志查看、分析和管理工具

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="N8N企业级自动化工作流平台"
LOG_RETENTION_DAYS=30
MAX_LOG_SIZE="100M"

# 日志函数
log_info() {
    local message="$1"
    echo -e "${BLUE}[INFO]${NC} $message"
}

log_success() {
    local message="$1"
    echo -e "${GREEN}[SUCCESS]${NC} $message"
}

log_warning() {
    local message="$1"
    echo -e "${YELLOW}[WARNING]${NC} $message"
}

log_error() {
    local message="$1"
    echo -e "${RED}[ERROR]${NC} $message"
}

log_header() {
    local message="$1"
    echo -e "${PURPLE}[HEADER]${NC} $message"
}

# 显示服务日志
show_service_logs() {
    local service="$1"
    local lines="${2:-100}"
    local follow="${3:-false}"
    
    log_header "显示 $service 服务日志"
    
    if [ "$follow" = true ]; then
        log_info "实时跟踪 $service 日志（按 Ctrl+C 退出）..."
        docker-compose logs -f --tail="$lines" "$service"
    else
        log_info "显示 $service 最近 $lines 行日志..."
        docker-compose logs --tail="$lines" "$service"
    fi
}

# 显示所有服务日志
show_all_logs() {
    local lines="${1:-50}"
    local follow="${2:-false}"
    
    log_header "显示所有服务日志"
    
    if [ "$follow" = true ]; then
        log_info "实时跟踪所有服务日志（按 Ctrl+C 退出）..."
        docker-compose logs -f --tail="$lines"
    else
        log_info "显示所有服务最近 $lines 行日志..."
        docker-compose logs --tail="$lines"
    fi
}

# 搜索日志
search_logs() {
    local service="$1"
    local pattern="$2"
    local lines="${3:-1000}"
    
    log_header "在 $service 日志中搜索: $pattern"
    
    if [ "$service" = "all" ]; then
        docker-compose logs --tail="$lines" | grep -i "$pattern" --color=always
    else
        docker-compose logs --tail="$lines" "$service" | grep -i "$pattern" --color=always
    fi
}

# 分析错误日志
analyze_errors() {
    local service="${1:-all}"
    local hours="${2:-24}"
    
    log_header "分析最近 $hours 小时的错误日志"
    
    local since_time=$(date -d "$hours hours ago" '+%Y-%m-%dT%H:%M:%S')
    
    if [ "$service" = "all" ]; then
        log_info "分析所有服务的错误..."
        docker-compose logs --since="$since_time" | grep -iE "(error|exception|fail|fatal|panic|critical)" --color=always | head -50
    else
        log_info "分析 $service 服务的错误..."
        docker-compose logs --since="$since_time" "$service" | grep -iE "(error|exception|fail|fatal|panic|critical)" --color=always | head -50
    fi
}

# 生成日志统计
generate_log_stats() {
    local service="${1:-all}"
    local hours="${2:-24}"
    
    log_header "生成最近 $hours 小时的日志统计"
    
    local since_time=$(date -d "$hours hours ago" '+%Y-%m-%dT%H:%M:%S')
    local stats_file="logs/log-stats-$(date +%Y%m%d_%H%M%S).txt"
    
    echo "# 日志统计报告 - $(date)" > "$stats_file"
    echo "# 时间范围: 最近 $hours 小时" >> "$stats_file"
    echo "" >> "$stats_file"
    
    if [ "$service" = "all" ]; then
        local services=("n8n" "postgres" "redis" "ai-agent-system" "huoniao-portal")
        
        for svc in "${services[@]}"; do
            echo "## $svc 服务统计" >> "$stats_file"
            
            # 总日志行数
            local total_lines=$(docker-compose logs --since="$since_time" "$svc" 2>/dev/null | wc -l)
            echo "总日志行数: $total_lines" >> "$stats_file"
            
            # 错误数量
            local error_count=$(docker-compose logs --since="$since_time" "$svc" 2>/dev/null | grep -icE "(error|exception|fail|fatal)" || echo "0")
            echo "错误数量: $error_count" >> "$stats_file"
            
            # 警告数量
            local warning_count=$(docker-compose logs --since="$since_time" "$svc" 2>/dev/null | grep -icE "(warn|warning)" || echo "0")
            echo "警告数量: $warning_count" >> "$stats_file"
            
            # 信息数量
            local info_count=$(docker-compose logs --since="$since_time" "$svc" 2>/dev/null | grep -icE "(info|information)" || echo "0")
            echo "信息数量: $info_count" >> "$stats_file"
            
            echo "" >> "$stats_file"
        done
    else
        echo "## $service 服务统计" >> "$stats_file"
        
        local total_lines=$(docker-compose logs --since="$since_time" "$service" 2>/dev/null | wc -l)
        local error_count=$(docker-compose logs --since="$since_time" "$service" 2>/dev/null | grep -icE "(error|exception|fail|fatal)" || echo "0")
        local warning_count=$(docker-compose logs --since="$since_time" "$service" 2>/dev/null | grep -icE "(warn|warning)" || echo "0")
        local info_count=$(docker-compose logs --since="$since_time" "$service" 2>/dev/null | grep -icE "(info|information)" || echo "0")
        
        echo "总日志行数: $total_lines" >> "$stats_file"
        echo "错误数量: $error_count" >> "$stats_file"
        echo "警告数量: $warning_count" >> "$stats_file"
        echo "信息数量: $info_count" >> "$stats_file"
    fi
    
    # 显示统计结果
    cat "$stats_file"
    log_success "统计报告已保存: $stats_file"
}

# 导出日志
export_logs() {
    local service="${1:-all}"
    local format="${2:-txt}"
    local hours="${3:-24}"
    
    log_header "导出 $service 服务日志"
    
    local since_time=$(date -d "$hours hours ago" '+%Y-%m-%dT%H:%M:%S')
    local export_dir="logs/exports"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    mkdir -p "$export_dir"
    
    case $format in
        "txt")
            local export_file="$export_dir/${service}-logs-${timestamp}.txt"
            if [ "$service" = "all" ]; then
                docker-compose logs --since="$since_time" > "$export_file"
            else
                docker-compose logs --since="$since_time" "$service" > "$export_file"
            fi
            ;;
        "json")
            local export_file="$export_dir/${service}-logs-${timestamp}.json"
            if [ "$service" = "all" ]; then
                docker-compose logs --since="$since_time" --json > "$export_file"
            else
                docker-compose logs --since="$since_time" --json "$service" > "$export_file"
            fi
            ;;
        "csv")
            local export_file="$export_dir/${service}-logs-${timestamp}.csv"
            echo "timestamp,service,level,message" > "$export_file"
            if [ "$service" = "all" ]; then
                docker-compose logs --since="$since_time" --timestamps | \
                    sed 's/|/,/g' | \
                    awk -F',' '{print $1","$2",INFO,"$3}' >> "$export_file"
            else
                docker-compose logs --since="$since_time" --timestamps "$service" | \
                    sed 's/|/,/g' | \
                    awk -F',' '{print $1","$2",INFO,"$3}' >> "$export_file"
            fi
            ;;
        *)
            log_error "不支持的格式: $format"
            return 1
            ;;
    esac
    
    log_success "日志已导出: $export_file"
}

# 清理旧日志
cleanup_old_logs() {
    local days="${1:-$LOG_RETENTION_DAYS}"
    
    log_header "清理 $days 天前的旧日志"
    
    # 清理导出的日志文件
    if [ -d "logs/exports" ]; then
        local old_exports=$(find logs/exports -name "*.txt" -o -name "*.json" -o -name "*.csv" -mtime +$days 2>/dev/null || true)
        if [ -n "$old_exports" ]; then
            echo "$old_exports" | xargs rm -f
            log_success "已清理旧的导出日志文件"
        else
            log_info "没有需要清理的导出日志文件"
        fi
    fi
    
    # 清理系统日志文件
    local log_files=("logs/setup.log" "logs/backup.log" "logs/restore.log" "logs/health-check.log" "logs/deploy.log" "logs/update.log" "logs/monitor.log")
    
    for log_file in "${log_files[@]}"; do
        if [ -f "$log_file" ]; then
            # 检查文件大小
            local file_size=$(stat -f%z "$log_file" 2>/dev/null || echo "0")
            local max_size_bytes=$(echo "$MAX_LOG_SIZE" | sed 's/M/*1024*1024/' | bc)
            
            if [ "$file_size" -gt "$max_size_bytes" ]; then
                # 保留最后1000行
                tail -1000 "$log_file" > "${log_file}.tmp"
                mv "${log_file}.tmp" "$log_file"
                log_info "已截断大日志文件: $log_file"
            fi
        fi
    done
    
    # 清理Docker日志
    log_info "清理Docker容器日志..."
    docker system prune -f --volumes &>/dev/null || true
    
    log_success "日志清理完成"
}

# 监控日志
monitor_logs() {
    local service="${1:-all}"
    local alert_keywords="${2:-error,exception,fail,fatal,panic,critical}"
    
    log_header "监控 $service 服务日志"
    log_info "监控关键词: $alert_keywords"
    log_info "按 Ctrl+C 停止监控..."
    
    # 将关键词转换为grep模式
    local grep_pattern=$(echo "$alert_keywords" | sed 's/,/\\|/g')
    
    if [ "$service" = "all" ]; then
        docker-compose logs -f | grep -iE "$grep_pattern" --color=always | while read line; do
            echo -e "${RED}[ALERT]${NC} $(date '+%Y-%m-%d %H:%M:%S') $line"
            # 这里可以添加告警通知逻辑
        done
    else
        docker-compose logs -f "$service" | grep -iE "$grep_pattern" --color=always | while read line; do
            echo -e "${RED}[ALERT]${NC} $(date '+%Y-%m-%d %H:%M:%S') $line"
            # 这里可以添加告警通知逻辑
        done
    fi
}

# 生成日志报告
generate_log_report() {
    local hours="${1:-24}"
    
    log_header "生成日志分析报告"
    
    local report_file="logs/log-report-$(date +%Y%m%d_%H%M%S).html"
    local since_time=$(date -d "$hours hours ago" '+%Y-%m-%dT%H:%M:%S')
    
    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>N8N日志分析报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }
        .error { border-left: 4px solid #dc3545; }
        .warning { border-left: 4px solid #ffc107; }
        .info { border-left: 4px solid #007bff; }
        .success { border-left: 4px solid #28a745; }
        .stats-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .stats-table th, .stats-table td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
        .stats-table th { background-color: #e9ecef; }
        .chart-container { margin: 20px 0; text-align: center; }
        .log-entry { font-family: monospace; background: #f1f1f1; padding: 5px; margin: 2px 0; border-radius: 3px; font-size: 12px; }
        .error-log { background: #f8d7da; border-left: 3px solid #dc3545; }
        .warning-log { background: #fff3cd; border-left: 3px solid #ffc107; }
        .timestamp { text-align: center; color: #6c757d; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>N8N企业级自动化工作流平台日志分析报告</h1>
            <p>分析时间范围: 最近 HOURS_PLACEHOLDER 小时</p>
        </div>
        
        <div class="section info">
            <h3>服务状态概览</h3>
            <table class="stats-table">
                <tr>
                    <th>服务</th>
                    <th>状态</th>
                    <th>日志行数</th>
                    <th>错误数</th>
                    <th>警告数</th>
                </tr>
                <tr>
                    <td>N8N</td>
                    <td id="n8n-status">--</td>
                    <td id="n8n-logs">--</td>
                    <td id="n8n-errors">--</td>
                    <td id="n8n-warnings">--</td>
                </tr>
                <tr>
                    <td>PostgreSQL</td>
                    <td id="pg-status">--</td>
                    <td id="pg-logs">--</td>
                    <td id="pg-errors">--</td>
                    <td id="pg-warnings">--</td>
                </tr>
                <tr>
                    <td>Redis</td>
                    <td id="redis-status">--</td>
                    <td id="redis-logs">--</td>
                    <td id="redis-errors">--</td>
                    <td id="redis-warnings">--</td>
                </tr>
                <tr>
                    <td>AI智能体</td>
                    <td id="ai-status">--</td>
                    <td id="ai-logs">--</td>
                    <td id="ai-errors">--</td>
                    <td id="ai-warnings">--</td>
                </tr>
                <tr>
                    <td>火鸟门户</td>
                    <td id="huoniao-status">--</td>
                    <td id="huoniao-logs">--</td>
                    <td id="huoniao-errors">--</td>
                    <td id="huoniao-warnings">--</td>
                </tr>
            </table>
        </div>
        
        <div class="section error">
            <h3>关键错误日志</h3>
            <div id="error-logs">
                <!-- 错误日志将在这里显示 -->
            </div>
        </div>
        
        <div class="section warning">
            <h3>警告日志</h3>
            <div id="warning-logs">
                <!-- 警告日志将在这里显示 -->
            </div>
        </div>
        
        <div class="section info">
            <h3>性能指标</h3>
            <ul>
                <li>平均响应时间: <span id="avg-response">--</span></li>
                <li>请求总数: <span id="total-requests">--</span></li>
                <li>成功率: <span id="success-rate">--</span></li>
                <li>错误率: <span id="error-rate">--</span></li>
            </ul>
        </div>
        
        <div class="section success">
            <h3>建议操作</h3>
            <ul>
                <li>定期检查错误日志并及时处理</li>
                <li>监控系统资源使用情况</li>
                <li>优化高频错误的处理逻辑</li>
                <li>设置日志告警机制</li>
            </ul>
        </div>
        
        <div class="timestamp">
            报告生成时间: <span id="report-time">--</span>
        </div>
    </div>
    
    <script>
        document.getElementById('report-time').textContent = new Date().toLocaleString('zh-CN');
    </script>
</body>
</html>
EOF
    
    # 替换占位符
    sed -i "s/HOURS_PLACEHOLDER/$hours/g" "$report_file"
    
    log_success "日志报告已生成: $report_file"
}

# 实时日志仪表板
show_log_dashboard() {
    log_header "实时日志仪表板"
    
    while true; do
        clear
        echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${PURPLE}║                    N8N日志仪表板                            ║${NC}"
        echo -e "${PURPLE}║                  $(date '+%Y-%m-%d %H:%M:%S')                    ║${NC}"
        echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        
        # 服务状态
        echo -e "${CYAN}服务状态:${NC}"
        docker-compose ps --format "table {{.Name}}\t{{.State}}\t{{.Status}}"
        echo ""
        
        # 最近错误
        echo -e "${RED}最近错误 (最近5分钟):${NC}"
        local since_5min=$(date -d "5 minutes ago" '+%Y-%m-%dT%H:%M:%S')
        docker-compose logs --since="$since_5min" | grep -iE "(error|exception|fail|fatal)" | tail -5 | while read line; do
            echo -e "${RED}  $line${NC}"
        done
        echo ""
        
        # 最近警告
        echo -e "${YELLOW}最近警告 (最近5分钟):${NC}"
        docker-compose logs --since="$since_5min" | grep -iE "(warn|warning)" | tail -3 | while read line; do
            echo -e "${YELLOW}  $line${NC}"
        done
        echo ""
        
        # 系统资源
        echo -e "${BLUE}系统资源:${NC}"
        echo -e "  CPU: $(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')"
        echo -e "  内存: $(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')页空闲"
        echo -e "  磁盘: $(df -h . | tail -1 | awk '{print $5}')已使用"
        echo ""
        
        echo -e "${CYAN}按 Ctrl+C 退出仪表板${NC}"
        sleep 10
    done
}

# 显示使用帮助
show_help() {
    echo "N8N企业级自动化工作流平台日志管理脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  show <service> [lines] [follow]  显示服务日志"
    echo "  all [lines] [follow]            显示所有服务日志"
    echo "  search <service> <pattern>      搜索日志内容"
    echo "  errors [service] [hours]        分析错误日志"
    echo "  stats [service] [hours]         生成日志统计"
    echo "  export <service> [format]       导出日志文件"
    echo "  cleanup [days]                  清理旧日志"
    echo "  monitor [service] [keywords]    监控日志告警"
    echo "  report [hours]                  生成日志报告"
    echo "  dashboard                       显示实时仪表板"
    echo ""
    echo "服务名称:"
    echo "  n8n, postgres, redis, ai-agent-system, huoniao-portal, all"
    echo ""
    echo "示例:"
    echo "  $0 show n8n 100                # 显示N8N最近100行日志"
    echo "  $0 show n8n 50 true            # 实时跟踪N8N日志"
    echo "  $0 all 200 true                # 实时跟踪所有服务日志"
    echo "  $0 search all \"error\"          # 在所有日志中搜索error"
    echo "  $0 errors n8n 12               # 分析N8N最近12小时的错误"
    echo "  $0 stats all 24                # 生成所有服务24小时统计"
    echo "  $0 export n8n json             # 导出N8N日志为JSON格式"
    echo "  $0 cleanup 7                   # 清理7天前的日志"
    echo "  $0 monitor all                 # 监控所有服务的错误日志"
    echo "  $0 report 48                   # 生成48小时日志报告"
    echo "  $0 dashboard                   # 显示实时日志仪表板"
    echo ""
}

# 主函数
main() {
    # 创建日志目录
    mkdir -p logs/exports
    
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    local command="$1"
    shift
    
    case $command in
        "show")
            local service="${1:-n8n}"
            local lines="${2:-100}"
            local follow="${3:-false}"
            show_service_logs "$service" "$lines" "$follow"
            ;;
        "all")
            local lines="${1:-50}"
            local follow="${2:-false}"
            show_all_logs "$lines" "$follow"
            ;;
        "search")
            local service="${1:-all}"
            local pattern="${2:-error}"
            local lines="${3:-1000}"
            search_logs "$service" "$pattern" "$lines"
            ;;
        "errors")
            local service="${1:-all}"
            local hours="${2:-24}"
            analyze_errors "$service" "$hours"
            ;;
        "stats")
            local service="${1:-all}"
            local hours="${2:-24}"
            generate_log_stats "$service" "$hours"
            ;;
        "export")
            local service="${1:-all}"
            local format="${2:-txt}"
            local hours="${3:-24}"
            export_logs "$service" "$format" "$hours"
            ;;
        "cleanup")
            local days="${1:-$LOG_RETENTION_DAYS}"
            cleanup_old_logs "$days"
            ;;
        "monitor")
            local service="${1:-all}"
            local keywords="${2:-error,exception,fail,fatal,panic,critical}"
            monitor_logs "$service" "$keywords"
            ;;
        "report")
            local hours="${1:-24}"
            generate_log_report "$hours"
            ;;
        "dashboard")
            show_log_dashboard
            ;;
        "-h"|"--help"|"help")
            show_help
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi