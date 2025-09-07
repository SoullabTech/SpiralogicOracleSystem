#!/bin/bash
# 🔍 Port History Analysis Script
# Analyzes port usage patterns and conflicts

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

LOG_FILE="logs/port-history.jsonl"
ALERTS_FILE="logs/port-alerts.jsonl"

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${PURPLE}🔍 Port Usage Analysis${NC}"
echo "═════════════════════════════════════════════════════"
echo ""

# Check if log file exists
if [ ! -f "$LOG_FILE" ]; then
  echo -e "${YELLOW}⚠️  No port history log found at $LOG_FILE${NC}"
  echo "   Start the backend a few times to generate history"
  exit 1
fi

# Basic stats
TOTAL=$(wc -l < "$LOG_FILE")
echo -e "${BLUE}📊 Total startup runs:${NC} $TOTAL"

# Check if jq is available
if ! command -v jq >/dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  'jq' not found. Installing...${NC}"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install jq
  else
    echo "Please install jq manually: sudo apt-get install jq"
    exit 1
  fi
fi

echo ""
echo -e "${BLUE}📈 Port Usage Breakdown:${NC}"
jq -s '
  group_by(.actual) |
  map({
    port: .[0].actual,
    count: length,
    percentage: ((length / (.[0] | length) * 100) | floor)
  }) |
  sort_by(.count) |
  reverse
' "$LOG_FILE" 2>/dev/null | jq -r '.[] | "   Port \(.port): \(.count) times (\(.percentage)%)"'

echo ""
echo -e "${BLUE}🚫 Conflict Analysis:${NC}"
CONFLICTS=$(jq -s 'map(select(.requested != .actual)) | length' "$LOG_FILE" 2>/dev/null || echo "0")
CONFLICT_RATE=$(echo "scale=1; $CONFLICTS * 100 / $TOTAL" | bc 2>/dev/null || echo "0")
echo -e "   Conflicts: ${YELLOW}$CONFLICTS${NC} out of $TOTAL runs (${YELLOW}${CONFLICT_RATE}%${NC})"

echo ""
echo -e "${BLUE}🔝 Top Port Blockers:${NC}"
jq -s '
  map(select(.process)) |
  group_by(.process) |
  map({
    process: .[0].process,
    count: length
  }) |
  sort_by(.count) |
  reverse |
  .[:5]
' "$LOG_FILE" 2>/dev/null | jq -r '.[] | "   \(.process): \(.count) times"' || echo "   No blockers recorded"

echo ""
echo -e "${BLUE}📅 Recent Activity (last 5 runs):${NC}"
tail -5 "$LOG_FILE" | while read -r line; do
  TIMESTAMP=$(echo "$line" | jq -r '.timestamp' 2>/dev/null)
  REQUESTED=$(echo "$line" | jq -r '.requested' 2>/dev/null)
  ACTUAL=$(echo "$line" | jq -r '.actual' 2>/dev/null)
  PROCESS=$(echo "$line" | jq -r '.process // "none"' 2>/dev/null)
  
  if [ "$REQUESTED" = "$ACTUAL" ]; then
    echo -e "   ${GREEN}✓${NC} $(date -d "$TIMESTAMP" '+%m/%d %H:%M' 2>/dev/null || date -r "$TIMESTAMP" '+%m/%d %H:%M' 2>/dev/null || echo "$TIMESTAMP"): Port $ACTUAL"
  else
    echo -e "   ${YELLOW}⚠${NC} $(date -d "$TIMESTAMP" '+%m/%d %H:%M' 2>/dev/null || date -r "$TIMESTAMP" '+%m/%d %H:%M' 2>/dev/null || echo "$TIMESTAMP"): $REQUESTED→$ACTUAL (blocked by $PROCESS)"
  fi
done

# Check for alerts
if [ -f "$ALERTS_FILE" ]; then
  echo ""
  echo -e "${BLUE}🚨 Recent Alerts:${NC}"
  ALERT_COUNT=$(wc -l < "$ALERTS_FILE")
  echo -e "   Total alerts: ${YELLOW}$ALERT_COUNT${NC}"
  
  if [ "$ALERT_COUNT" -gt 0 ]; then
    tail -3 "$ALERTS_FILE" | while read -r line; do
      TYPE=$(echo "$line" | jq -r '.type' 2>/dev/null)
      TIMESTAMP=$(echo "$line" | jq -r '.timestamp' 2>/dev/null)
      
      case "$TYPE" in
        "conflict")
          echo -e "   ${YELLOW}⚠${NC} Conflict at $(date -d "$TIMESTAMP" '+%m/%d %H:%M' 2>/dev/null || echo "$TIMESTAMP")"
          ;;
        "frequent_conflict")
          echo -e "   ${RED}🔥${NC} Frequent conflicts detected!"
          ;;
        "new_blocker")
          echo -e "   ${PURPLE}🆕${NC} New blocking service detected"
          ;;
      esac
    done
  fi
fi

echo ""
echo -e "${BLUE}💡 Recommendations:${NC}"

# Smart recommendations based on data
if [ "$CONFLICT_RATE" = "0" ] || [ "$CONFLICT_RATE" = "0.0" ]; then
  echo -e "   ${GREEN}✅ No port conflicts detected! Port $PREFERRED_PORT is working well.${NC}"
elif (( $(echo "$CONFLICT_RATE > 50" | bc -l) )); then
  # Find most successful port
  BEST_PORT=$(jq -s '
    group_by(.actual) |
    map({port: .[0].actual, count: length}) |
    sort_by(.count) |
    reverse |
    .[0].port
  ' "$LOG_FILE" 2>/dev/null)
  
  echo -e "   ${YELLOW}⚠️  High conflict rate detected ($CONFLICT_RATE%)${NC}"
  echo -e "   ${BLUE}→ Consider changing default port to $BEST_PORT${NC}"
  echo "     Add to backend/.env.local:"
  echo -e "     ${GREEN}PORT=$BEST_PORT${NC}"
fi

# Check for specific blockers
if grep -q "exlm-agent" "$LOG_FILE" 2>/dev/null; then
  echo ""
  echo -e "   ${YELLOW}⚡ exlm-agent detected blocking ports${NC}"
  echo "   To permanently remove it:"
  echo -e "   ${BLUE}launchctl list | grep exlm${NC}"
  echo -e "   ${BLUE}launchctl bootout gui/\$(id -u) <service-name>${NC}"
fi

echo ""
echo "═════════════════════════════════════════════════════"
echo ""

# Export data for further analysis
if [ "$1" = "--export" ]; then
  OUTPUT_FILE="logs/port-analysis-$(date +%Y%m%d-%H%M%S).json"
  jq -s '{
    summary: {
      total_runs: length,
      conflicts: map(select(.requested != .actual)) | length,
      conflict_rate: ((map(select(.requested != .actual)) | length) / length * 100)
    },
    port_usage: group_by(.actual) | map({port: .[0].actual, count: length}),
    blockers: map(select(.process)) | group_by(.process) | map({process: .[0].process, count: length}),
    recent: .[-10:]
  }' "$LOG_FILE" > "$OUTPUT_FILE"
  echo -e "${GREEN}✅ Analysis exported to $OUTPUT_FILE${NC}"
fi