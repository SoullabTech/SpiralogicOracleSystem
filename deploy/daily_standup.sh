#!/bin/bash

# ARIA Daily Standup Automation Script
# Run this each morning to get a quick health check and priority list

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
LOG_DIR="./logs/daily"
METRICS_DIR="./metrics"
REPORT_DIR="./reports/standup"
TODAY=$(date +%Y-%m-%d)
NOW=$(date +%H:%M:%S)

# Create directories if they don't exist
mkdir -p "$LOG_DIR" "$METRICS_DIR" "$REPORT_DIR"

# Header
clear
echo "=================================================="
echo -e "${PURPLE}🌅 ARIA Daily Standup - $TODAY $NOW${NC}"
echo "=================================================="
echo ""

# Function to check service health
check_service() {
    local service_name=$1
    local health_url=$2

    echo -n "Checking $service_name... "

    if curl -s -f -o /dev/null "$health_url" 2>/dev/null; then
        echo -e "${GREEN}✓ Operational${NC}"
        return 0
    else
        echo -e "${RED}✗ Down${NC}"
        return 1
    fi
}

# Function to get metrics
get_metric() {
    local metric_name=$1
    local metric_file="$METRICS_DIR/$metric_name.json"

    if [ -f "$metric_file" ]; then
        cat "$metric_file" | jq -r '.value' 2>/dev/null || echo "N/A"
    else
        echo "N/A"
    fi
}

# Function to check error logs
check_errors() {
    local error_count=0
    local critical_count=0

    if [ -f "$LOG_DIR/error.log" ]; then
        error_count=$(grep -c "ERROR" "$LOG_DIR/error.log" 2>/dev/null || echo "0")
        critical_count=$(grep -c "CRITICAL" "$LOG_DIR/error.log" 2>/dev/null || echo "0")
    fi

    echo "$error_count:$critical_count"
}

# 1. SYSTEM HEALTH CHECK
echo -e "${BLUE}📊 System Health Check${NC}"
echo "------------------------"

# Check core services
API_STATUS=0
check_service "API Server" "http://localhost:3000/health" || API_STATUS=1
check_service "Database" "http://localhost:5432/health" || DB_STATUS=1
check_service "Cache" "http://localhost:6379/health" || CACHE_STATUS=1
check_service "Field Service" "http://localhost:3001/health" || FIELD_STATUS=1

echo ""

# 2. ERROR LOG SUMMARY
echo -e "${BLUE}🚨 Last 24h Errors${NC}"
echo "------------------------"

ERROR_INFO=$(check_errors)
ERROR_COUNT=$(echo $ERROR_INFO | cut -d: -f1)
CRITICAL_COUNT=$(echo $ERROR_INFO | cut -d: -f2)

if [ "$CRITICAL_COUNT" -gt 0 ]; then
    echo -e "${RED}Critical Errors: $CRITICAL_COUNT ⚠️${NC}"
elif [ "$ERROR_COUNT" -gt 10 ]; then
    echo -e "${YELLOW}Errors: $ERROR_COUNT (above threshold)${NC}"
elif [ "$ERROR_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}Errors: $ERROR_COUNT${NC}"
else
    echo -e "${GREEN}No errors detected ✓${NC}"
fi

# Show last 3 errors if any
if [ "$ERROR_COUNT" -gt 0 ] && [ -f "$LOG_DIR/error.log" ]; then
    echo -e "${YELLOW}Recent errors:${NC}"
    tail -3 "$LOG_DIR/error.log" | sed 's/^/  /'
fi

echo ""

# 3. KEY METRICS
echo -e "${BLUE}📈 Key Metrics${NC}"
echo "------------------------"

# Get current metrics
USERS_TODAY=$(get_metric "users_today")
HALLUCINATION_RATE=$(get_metric "hallucination_rate")
AVG_LATENCY=$(get_metric "avg_latency")
UPTIME=$(get_metric "uptime")
FIELD_SIZE=$(get_metric "field_size")

echo "Active Users Today: $USERS_TODAY"
echo -n "Hallucination Rate: "
if [ "$HALLUCINATION_RATE" != "N/A" ]; then
    RATE_NUM=$(echo "$HALLUCINATION_RATE" | sed 's/%//')
    if (( $(echo "$RATE_NUM < 5" | bc -l) )); then
        echo -e "${GREEN}$HALLUCINATION_RATE% ✓${NC}"
    elif (( $(echo "$RATE_NUM < 10" | bc -l) )); then
        echo -e "${YELLOW}$HALLUCINATION_RATE% ⚠${NC}"
    else
        echo -e "${RED}$HALLUCINATION_RATE% ✗${NC}"
    fi
else
    echo "N/A"
fi

echo "Avg Response Time: ${AVG_LATENCY}ms"
echo "System Uptime: $UPTIME"
echo "Field Entries: $FIELD_SIZE"
echo ""

# 4. COST MONITOR
echo -e "${BLUE}💰 Daily Costs${NC}"
echo "------------------------"

# Calculate daily costs
API_CALLS=$(get_metric "api_calls_today")
STORAGE_GB=$(get_metric "storage_used_gb")
COMPUTE_HOURS=$(get_metric "compute_hours")

# Simple cost calculation (adjust rates as needed)
API_COST=$(echo "$API_CALLS * 0.0001" | bc 2>/dev/null || echo "0")
STORAGE_COST=$(echo "$STORAGE_GB * 0.1" | bc 2>/dev/null || echo "0")
COMPUTE_COST=$(echo "$COMPUTE_HOURS * 0.5" | bc 2>/dev/null || echo "0")
TOTAL_COST=$(echo "$API_COST + $STORAGE_COST + $COMPUTE_COST" | bc 2>/dev/null || echo "0")

echo "API Calls: $API_CALLS (\$$API_COST)"
echo "Storage: ${STORAGE_GB}GB (\$$STORAGE_COST)"
echo "Compute: ${COMPUTE_HOURS}h (\$$COMPUTE_COST)"
echo -e "Daily Total: ${YELLOW}\$$TOTAL_COST${NC}"

# Check if over budget
DAILY_BUDGET=50
if (( $(echo "$TOTAL_COST > $DAILY_BUDGET" | bc -l) )); then
    echo -e "${RED}⚠️ OVER BUDGET (limit: \$$DAILY_BUDGET)${NC}"
fi

echo ""

# 5. TODAY'S PRIORITIES
echo -e "${BLUE}🎯 Today's Focus${NC}"
echo "------------------------"

# Read priorities from file or use defaults
PRIORITIES_FILE="./config/daily_priorities.txt"
if [ -f "$PRIORITIES_FILE" ]; then
    cat "$PRIORITIES_FILE"
else
    echo "1. Check and respond to user feedback"
    echo "2. Review error logs and fix critical issues"
    echo "3. Monitor hallucination rates"
    echo "4. Update field with new learnings"
    echo "5. Run weekly metrics review (if Friday)"
fi

echo ""

# 6. ENERGY CHECK
echo -e "${BLUE}⚡ Energy & Burnout Check${NC}"
echo "------------------------"

# Check work patterns
COMMITS_YESTERDAY=$(git log --since="yesterday" --until="today" --oneline 2>/dev/null | wc -l)
COMMITS_THIS_WEEK=$(git log --since="1 week ago" --oneline 2>/dev/null | wc -l)
LAST_BREAK_FILE="$LOG_DIR/last_break.txt"

echo "Commits yesterday: $COMMITS_YESTERDAY"
echo "Commits this week: $COMMITS_THIS_WEEK"

# Burnout warning
if [ "$COMMITS_THIS_WEEK" -gt 100 ]; then
    echo -e "${YELLOW}⚠️ High activity detected - remember to take breaks${NC}"
fi

# Check last break
if [ -f "$LAST_BREAK_FILE" ]; then
    LAST_BREAK=$(cat "$LAST_BREAK_FILE")
    DAYS_SINCE=$(( ($(date +%s) - $(date -d "$LAST_BREAK" +%s)) / 86400 ))
    if [ "$DAYS_SINCE" -gt 7 ]; then
        echo -e "${RED}🚨 No break in $DAYS_SINCE days - schedule one today${NC}"
    fi
else
    echo "Track your breaks in $LAST_BREAK_FILE"
fi

echo ""

# 7. ACTION ITEMS
echo -e "${BLUE}✅ Quick Actions${NC}"
echo "------------------------"

# Generate action items based on metrics
ACTIONS=()

if [ "$CRITICAL_COUNT" -gt 0 ]; then
    ACTIONS+=("🔴 Fix critical errors immediately")
fi

if [ "$ERROR_COUNT" -gt 10 ]; then
    ACTIONS+=("🟡 Investigate error spike")
fi

if [ "$API_STATUS" -ne 0 ] || [ "$DB_STATUS" -ne 0 ]; then
    ACTIONS+=("🔴 Restore down services")
fi

if (( $(echo "$TOTAL_COST > $DAILY_BUDGET" | bc -l) )); then
    ACTIONS+=("🟡 Review and optimize costs")
fi

if [ "$HALLUCINATION_RATE" != "N/A" ] && (( $(echo "$RATE_NUM > 10" | bc -l) )); then
    ACTIONS+=("🟡 Tune hallucination verifier")
fi

if [ ${#ACTIONS[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ No urgent actions needed${NC}"
else
    for action in "${ACTIONS[@]}"; do
        echo "$action"
    done
fi

echo ""

# 8. SAVE REPORT
REPORT_FILE="$REPORT_DIR/standup_$TODAY.txt"
{
    echo "ARIA Daily Standup Report - $TODAY $NOW"
    echo "========================================"
    echo ""
    echo "System Status:"
    echo "  API: $([ $API_STATUS -eq 0 ] && echo 'OK' || echo 'DOWN')"
    echo "  Errors: $ERROR_COUNT (Critical: $CRITICAL_COUNT)"
    echo "  Users: $USERS_TODAY"
    echo "  Hallucination Rate: $HALLUCINATION_RATE"
    echo "  Daily Cost: \$$TOTAL_COST"
    echo ""
    echo "Actions Required:"
    for action in "${ACTIONS[@]}"; do
        echo "  - $action"
    done
} > "$REPORT_FILE"

echo -e "${GREEN}📄 Report saved to: $REPORT_FILE${NC}"
echo ""

# 9. QUICK COMMANDS
echo -e "${PURPLE}🚀 Quick Commands${NC}"
echo "------------------------"
echo "View errors:     tail -f $LOG_DIR/error.log"
echo "Check metrics:   npm run metrics:dashboard"
echo "Run tests:       npm test"
echo "Deploy:          npm run deploy"
echo "Take break:      echo '$(date +%Y-%m-%d)' > $LAST_BREAK_FILE"
echo ""

# 10. MOTIVATIONAL QUOTE
QUOTES=(
    "Ship daily, iterate weekly, strategize monthly."
    "Perfect is the enemy of shipped."
    "Every bug fixed is a user saved."
    "Your code is helping someone right now."
    "Progress over perfection."
    "Small wins compound into big victories."
)
QUOTE=${QUOTES[$RANDOM % ${#QUOTES[@]}]}

echo "=================================================="
echo -e "${GREEN}💪 $QUOTE${NC}"
echo "=================================================="

# Exit with appropriate code
if [ "$CRITICAL_COUNT" -gt 0 ] || [ "$API_STATUS" -ne 0 ]; then
    exit 1
elif [ "$ERROR_COUNT" -gt 10 ]; then
    exit 2
else
    exit 0
fi