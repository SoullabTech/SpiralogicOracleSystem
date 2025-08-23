#!/bin/bash

# Clean Training System Canary Tests
echo "🧠 Clean Training System Canary Tests"
echo "====================================="

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
            if [ "$expected_field" != ".ok" ] && [ "$expected_field" != ".status" ]; then
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

echo -e "\n${YELLOW}=== Test 1: Training Evaluator Health Check ===${NC}"
test_endpoint "Training Evaluator Health" \
    "$BASE_URL/api/training/evaluate" \
    "GET" \
    "" \
    ".status"

echo -e "\n${YELLOW}=== Test 2: Send One Scored Evaluation ===${NC}"
test_endpoint "Manual Training Evaluation" \
    "$BASE_URL/api/training/evaluate" \
    "POST" \
    '{"agent":"claude","user_hash":"u$abc123","prompt_summary":"redacted user intent","response_summary":"redacted oracle response","context_meta":{"drives":{"clarity":0.6,"safety":0.8},"facets":{"growth":0.7,"stability":0.4}}}' \
    ".ok"

echo -e "\n${YELLOW}=== Test 3: Admin Training Metrics ===${NC}"
test_endpoint "Admin Training Metrics" \
    "$BASE_URL/api/admin/metrics/training" \
    "GET" \
    "" \
    ".throughput"

echo -e "\n${YELLOW}=== Test 4: Oracle Turn with Training Collection ===${NC}"
test_endpoint "Oracle Turn (Training Enabled)" \
    "$BASE_URL/api/oracle/turn" \
    "POST" \
    '{"input":{"text":"I need guidance on finding balance"},"conversationId":"canary_training"}' \
    ".response.text"

# Give a moment for async training collection to complete
echo -e "\n${BLUE}Waiting 3 seconds for async training collection...${NC}"
sleep 3

echo -e "\n${YELLOW}=== Test 5: Verify Training Data Collected ===${NC}"
test_endpoint "Training Data After Turn" \
    "$BASE_URL/api/admin/metrics/training" \
    "GET" \
    "" \
    ".quality.dims"

echo -e "\n${YELLOW}=== Test 6: Manual Evaluation Trigger ===${NC}"
test_endpoint "Manual Evaluation Trigger" \
    "$BASE_URL/api/admin/metrics/training" \
    "POST" \
    '{"action":"trigger_evaluation","data":{"agent":"claude"}}' \
    ".success"

echo -e "\n${YELLOW}=== Environment & Configuration Checks ===${NC}"

# Check critical environment variables
echo -e "\n${BLUE}Environment Variables:${NC}"
ENV_VARS=("TRAINING_ENABLED" "TRAINING_SAMPLE_RATE" "CHATGPT_ORACLE_2_API_KEY")

for var in "${ENV_VARS[@]}"; do
    if grep -q "^${var}=" .env.local 2>/dev/null; then
        value=$(grep "^${var}=" .env.local | cut -d'=' -f2)
        if [ -n "$value" ] && [ "$value" != "your_openai_api_key_here" ]; then
            echo -e "${GREEN}✓${NC} $var is set: $value"
        else
            echo -e "${YELLOW}⚠${NC} $var is set but may need configuration"
        fi
    else
        echo -e "${RED}✗${NC} $var is not set in .env.local"
    fi
done

echo -e "\n${YELLOW}=== Direct Database Verification ===${NC}"
echo -e "${BLUE}Manual SQL Checks (run in Supabase console):${NC}"
echo "SELECT COUNT(*) FROM training_interactions WHERE sampled = true;"
echo "SELECT agent, AVG(total) FROM training_scores GROUP BY agent;"
echo "SELECT * FROM v_training_overview ORDER BY hour DESC LIMIT 5;"
echo "SELECT * FROM v_training_by_agent;"

echo -e "\n${YELLOW}=== Expected Behaviors Summary ===${NC}"

echo -e "\n${GREEN}✓ Training System Active:${NC}"
echo "• Evaluator endpoint returns 'ok' status"
echo "• Manual evaluations produce scores 0.0-1.0 across 6 dimensions"
echo "• Admin metrics show throughput, quality, agents, guardrails"
echo "• Oracle turns trigger non-blocking training collection (~20% sample rate)"

echo -e "\n${BLUE}📊 Quality Targets:${NC}"
echo "• Sample rate: ~20% of interactions (TRAINING_SAMPLE_RATE=0.20)"
echo "• Avg quality: ≥84% early beta, trending toward 88%+"
echo "• Individual dimensions: All ≥75%, target ≥85%"
echo "• Violations: 0 (any >0 needs investigation)"
echo "• Eval latency: <2.5s (non-blocking anyway)"

echo -e "\n${YELLOW}🎓 Graduation Thresholds:${NC}"
echo "• Minimum interactions: 200 for graduation eligibility"
echo "• Average score: ≥88% across all interactions"
echo "• Dimension floors: All 6 dimensions ≥85%"
echo "• Zero violations: No IP protection breaches"

echo -e "\n${BLUE}🔧 Manual Verification Steps:${NC}"
echo "1. Visit http://localhost:3000/admin/training for live dashboard"
echo "2. Have conversations with Oracle to generate training data"
echo "3. Watch agent scorecards update with quality metrics"
echo "4. Monitor graduation progress toward thresholds"
echo "5. Verify guardrails show 0 violations"

echo -e "\n${YELLOW}🚨 Troubleshooting Guide:${NC}"
echo "• No training data? Check TRAINING_ENABLED=true and sample rate"
echo "• Low scores? Verify ChatGPT Oracle 2.0 API key configuration"
echo "• Dashboard empty? Wait for interactions to accumulate"
echo "• Database errors? Ensure migration applied successfully"
echo "• Evaluation failures? Check OpenAI API key and model access"

echo -e "\n${GREEN}🎯 Training canary tests complete!${NC}"
echo "If all tests pass, your clean training pipeline is:"
echo "• Collecting 20% of interactions with privacy protection"
echo "• Evaluating quality with ChatGPT Oracle 2.0"
echo "• Tracking agent progress toward graduation"
echo "• Protecting Spiralogic IP with guardrails"

echo -e "\n${BLUE}Next Steps:${NC}"
echo "• Configure your actual ChatGPT Oracle 2.0 API key"
echo "• Monitor agent progress in /admin/training dashboard"
echo "• Watch for graduation readiness indicators"
echo "• Review IP guardrails for any violations"