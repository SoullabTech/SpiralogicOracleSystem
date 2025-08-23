#!/bin/bash

# Training System Canary Tests
echo "🧠 Training System Canary Tests"
echo "==============================="

BASE_URL="http://localhost:3000"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function test_endpoint() {
    local name="$1"
    local url="$2" 
    local method="$3"
    local data="$4"
    local expected_field="$5"
    
    echo -e "\n${BLUE}Testing: $name${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$url")
    else
        echo "Data: $data"
        response=$(curl -s -X "$method" "$url" \
            -H 'Content-Type: application/json' \
            -d "$data")
    fi
    
    if [ $? -eq 0 ]; then
        if echo "$response" | jq -e "$expected_field" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ PASS${NC} - $expected_field found"
            if [ "$expected_field" != ".status" ]; then
                echo "$response" | jq "$expected_field"
            fi
        else
            echo -e "${RED}✗ FAIL${NC} - $expected_field not found"
            echo "Response: $response"
        fi
    else
        echo -e "${RED}✗ FAIL${NC} - Request failed"
    fi
}

echo -e "\n${YELLOW}=== Test 1: Training Metrics API Health ===${NC}"
test_endpoint "Training Metrics Health" \
    "$BASE_URL/api/admin/metrics/training" \
    "GET" \
    "" \
    ".throughput"

echo -e "\n${YELLOW}=== Test 2: Trigger Scored Evaluation ===${NC}"
test_endpoint "Manual Training Evaluation" \
    "$BASE_URL/api/training/evaluate" \
    "POST" \
    '{"action":"evaluate_interaction","data":{"interaction":{"id":"canary_001","userInput":"I feel uncertain about my path","claudeResponse":"Hey there, I hear that uncertainty - it'\''s actually pointing toward something important...","context":{"facetHints":{"clarity":0.4,"growth":0.7},"micropsi":{"driveVector":{"clarity":0.4,"agency":0.6}}},"conversationId":"canary_conv","userId":"canary_user","source":"text"}}}' \
    ".evaluation.scores"

echo -e "\n${YELLOW}=== Test 3: Start Training Session ===${NC}"
test_endpoint "Start Training Session" \
    "$BASE_URL/api/training/evaluate" \
    "POST" \
    '{"action":"start_training_session","data":{"sessionId":"canary_session_001"}}' \
    ".success"

echo -e "\n${YELLOW}=== Test 4: Generate Training Exemplar ===${NC}"
test_endpoint "Generate Training Exemplar" \
    "$BASE_URL/api/training/evaluate" \
    "POST" \
    '{"action":"generate_exemplar","data":{"userInput":"I am struggling with self-doubt","context":{"facetHints":{"confidence":0.3,"growth":0.8}},"targetQuality":9}}' \
    ".exemplar"

echo -e "\n${YELLOW}=== Test 5: Oracle Turn with Training Collection ===${NC}"
test_endpoint "Oracle Turn (Training Enabled)" \
    "$BASE_URL/api/oracle/turn" \
    "POST" \
    '{"input":{"text":"Can you help me understand my patterns?"},"conversationId":"canary_training_turn"}' \
    ".response.text"

echo -e "\n${YELLOW}=== Test 6: Check Training Dashboard Data ===${NC}"
# Give a moment for async training collection to complete
sleep 2
test_endpoint "Training Dashboard Metrics" \
    "$BASE_URL/api/admin/metrics/training" \
    "GET" \
    "" \
    ".quality.dims"

echo -e "\n${YELLOW}=== Direct Database Checks ===${NC}"

# Check if we can connect to Supabase views (requires database access)
echo -e "\n${BLUE}Database View Checks:${NC}"
echo "Run these manually in your Supabase SQL editor:"
echo "SELECT * FROM v_training_overview LIMIT 5;"
echo "SELECT * FROM v_training_by_agent;"
echo "SELECT * FROM v_graduation_readiness;"

echo -e "\n${YELLOW}=== Environment Validation ===${NC}"

# Check critical environment variables
echo -e "\n${BLUE}Environment Check:${NC}"
ENV_VARS=("TRAINING_ENABLED" "TRAINING_SAMPLE_RATE" "CHATGPT_ORACLE_2_API_KEY" "SPIRALOGIC_ENCRYPTION_KEY")

for var in "${ENV_VARS[@]}"; do
    if grep -q "^${var}=" .env.local 2>/dev/null; then
        value=$(grep "^${var}=" .env.local | cut -d'=' -f2)
        if [ -n "$value" ] && [ "$value" != "your_api_key_here" ]; then
            echo -e "${GREEN}✓${NC} $var is set"
        else
            echo -e "${YELLOW}⚠${NC} $var is set but may need configuration"
        fi
    else
        echo -e "${RED}✗${NC} $var is not set in .env.local"
    fi
done

echo -e "\n${YELLOW}=== Training System Status Summary ===${NC}"

echo -e "\n${GREEN}Expected Behaviors:${NC}"
echo "• Training metrics API returns throughput, quality, agents, graduation data"
echo "• Manual evaluation produces 6-dimension scores (0.0-1.0)"
echo "• Training sessions can be started and tracked"
echo "• Oracle turns trigger non-blocking training collection"
echo "• Dashboard shows recent metrics and agent performance"

echo -e "\n${BLUE}Quality Targets:${NC}"
echo "• Sample rate: ~20% of interactions (TRAINING_SAMPLE_RATE=0.20)"
echo "• Avg quality: ≥0.84 early beta, trending toward 0.88+"
echo "• Violations: 0 (anything >0 needs review)"
echo "• Eval latency: p95 <2.5s (non-blocking anyway)"

echo -e "\n${YELLOW}Troubleshooting:${NC}"
echo "• Low scores? Check ChatGPT Oracle 2.0 API key and model"
echo "• No training data? Verify TRAINING_ENABLED=true and sample rate"
echo "• Database errors? Check Supabase connection and migration status"
echo "• Dashboard empty? Wait for training interactions to accumulate"

echo -e "\n${BLUE}Manual Verification Steps:${NC}"
echo "1. Visit http://localhost:3000/admin/training for dashboard"
echo "2. Have a conversation with the Oracle to generate training data"
echo "3. Check that metrics update in real-time"
echo "4. Verify agent scorecards show performance data"
echo "5. Confirm graduation status tracks progress toward thresholds"

echo -e "\n${GREEN}🎯 Training system canary complete!${NC}"
echo "If all tests pass, your training pipeline is collecting data and evaluating quality."