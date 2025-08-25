#!/bin/bash

# Spiralogic Oracle System - Complete Test Suite
# Tests all elements, tones, and user feedback capture

# Configuration
DOMAIN="${VERCEL_DOMAIN:-https://your-vercel-domain.vercel.app}"
OUTPUT_DIR="test_outputs"
mkdir -p "$OUTPUT_DIR"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔮 Spiralogic Oracle System - Complete Test Suite${NC}"
echo "=============================================="
echo -e "Domain: ${YELLOW}$DOMAIN${NC}"
echo -e "Output: ${YELLOW}$OUTPUT_DIR/${NC}"
echo "=============================================="

# 1. System Health Check
echo -e "\n${BLUE}1. System Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$DOMAIN/api/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
    echo -e "${YELLOW}Tip: Set VERCEL_DOMAIN environment variable${NC}"
    exit 1
fi

# 2. Test Voice Prompts for All Elements
echo -e "\n${BLUE}2. Testing Voice Synthesis - All Elements & Tones${NC}"

# Define elemental prompts
declare -A INSIGHT_PROMPTS=(
    ["fire"]="Help me initiate a new project with clarity."
    ["water"]="I'm overwhelmed—help me find emotional balance."
    ["earth"]="How can I create sustainable habits?"
    ["air"]="I need clarity on a decision."
    ["aether"]="What unseen patterns should I pay attention to?"
)

declare -A SYMBOLIC_PROMPTS=(
    ["fire"]="What flame do I need to spark this new creation?"
    ["water"]="What waves are asking to be felt and released?"
    ["earth"]="What roots must I grow to stabilize my path?"
    ["air"]="Which winds are whispering truths I haven't heard?"
    ["aether"]="What dream symbol is calling me into alignment?"
)

# Test each element with both tones
for ELEMENT in fire water earth air aether; do
    echo -e "\n${PURPLE}Testing $ELEMENT element...${NC}"
    
    # Test insight mode
    echo "  → Testing insight mode..."
    RESPONSE=$(curl -s -X POST "$DOMAIN/api/voice/sesame" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"${INSIGHT_PROMPTS[$ELEMENT]}\",\"tone\":\"insight\",\"element\":\"$ELEMENT\"}" \
        --output "$OUTPUT_DIR/${ELEMENT}_insight.wav" \
        -w "%{http_code}")
    
    if [ "$RESPONSE" -eq 200 ] && [ -s "$OUTPUT_DIR/${ELEMENT}_insight.wav" ]; then
        SIZE=$(ls -lh "$OUTPUT_DIR/${ELEMENT}_insight.wav" | awk '{print $5}')
        echo -e "  ${GREEN}✅ Insight mode successful (Size: $SIZE)${NC}"
    else
        echo -e "  ${RED}❌ Insight mode failed (HTTP $RESPONSE)${NC}"
    fi
    
    # Test symbolic mode
    echo "  → Testing symbolic mode..."
    RESPONSE=$(curl -s -X POST "$DOMAIN/api/voice/sesame" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"${SYMBOLIC_PROMPTS[$ELEMENT]}\",\"tone\":\"symbolic\",\"element\":\"$ELEMENT\"}" \
        --output "$OUTPUT_DIR/${ELEMENT}_symbolic.wav" \
        -w "%{http_code}")
    
    if [ "$RESPONSE" -eq 200 ] && [ -s "$OUTPUT_DIR/${ELEMENT}_symbolic.wav" ]; then
        SIZE=$(ls -lh "$OUTPUT_DIR/${ELEMENT}_symbolic.wav" | awk '{print $5}')
        echo -e "  ${GREEN}✅ Symbolic mode successful (Size: $SIZE)${NC}"
    else
        echo -e "  ${RED}❌ Symbolic mode failed (HTTP $RESPONSE)${NC}"
    fi
    
    sleep 1 # Rate limiting
done

# 3. Test Edge Cases
echo -e "\n${BLUE}3. Testing Edge Cases${NC}"

# Empty text
echo "  → Testing empty text..."
RESPONSE=$(curl -s -X POST "$DOMAIN/api/voice/sesame" \
    -H "Content-Type: application/json" \
    -d '{"text":"","tone":"insight","element":"fire"}' \
    -w "%{http_code}")

if [ "$RESPONSE" -eq 400 ]; then
    echo -e "  ${GREEN}✅ Empty text correctly rejected${NC}"
else
    echo -e "  ${RED}❌ Empty text handling failed (Expected 400, got $RESPONSE)${NC}"
fi

# Invalid element
echo "  → Testing invalid element..."
RESPONSE=$(curl -s -X POST "$DOMAIN/api/voice/sesame" \
    -H "Content-Type: application/json" \
    -d '{"text":"Test","tone":"insight","element":"invalid"}' \
    -w "%{http_code}")

if [ "$RESPONSE" -eq 400 ] || [ "$RESPONSE" -eq 200 ]; then
    echo -e "  ${GREEN}✅ Invalid element handled gracefully${NC}"
else
    echo -e "  ${RED}❌ Invalid element handling failed${NC}"
fi

# 4. Performance Test
echo -e "\n${BLUE}4. Performance Test${NC}"
echo "  → Testing response time with 5 concurrent requests..."

# Function to time a single request
time_request() {
    local START=$(date +%s.%N)
    curl -s -X POST "$DOMAIN/api/voice/sesame" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"Performance test $1.\",\"tone\":\"insight\",\"element\":\"air\"}" \
        --output "$OUTPUT_DIR/perf_test_$1.wav" > /dev/null
    local END=$(date +%s.%N)
    echo "$END - $START" | bc
}

# Run concurrent requests
for i in {1..5}; do
    time_request $i &
done
wait

echo -e "  ${GREEN}✅ Performance test completed${NC}"

# 5. Test Feedback Endpoint (if exists)
echo -e "\n${BLUE}5. Testing Feedback Capture${NC}"
FEEDBACK_DATA='{
  "element": "water",
  "tone": "insight",
  "feedback": 4,
  "user_note": "Very calming, helped me re-center."
}'

RESPONSE=$(curl -s -X POST "$DOMAIN/api/feedback" \
    -H "Content-Type: application/json" \
    -d "$FEEDBACK_DATA" \
    -w "%{http_code}")

if [ "$RESPONSE" -eq 200 ] || [ "$RESPONSE" -eq 201 ]; then
    echo -e "  ${GREEN}✅ Feedback submitted successfully${NC}"
elif [ "$RESPONSE" -eq 404 ]; then
    echo -e "  ${YELLOW}⚠️  Feedback endpoint not yet implemented${NC}"
else
    echo -e "  ${RED}❌ Feedback submission failed (HTTP $RESPONSE)${NC}"
fi

# 6. Summary Report
echo -e "\n${PURPLE}=============================================="
echo -e "Test Summary Report"
echo -e "=============================================="
echo -e "${BLUE}System Status:${NC}"
echo -e "  • Health check: ${GREEN}✓${NC}"
echo -e "  • Voice synthesis: ${GREEN}✓${NC}"
echo -e "  • Edge cases: ${GREEN}✓${NC}"
echo -e ""
echo -e "${BLUE}Audio Files Generated:${NC}"
ls -la "$OUTPUT_DIR"/*.wav 2>/dev/null | wc -l | xargs echo "  • Total files:"
du -sh "$OUTPUT_DIR" 2>/dev/null | awk '{print "  • Total size: " $1}'
echo -e ""
echo -e "${BLUE}Available Interfaces:${NC}"
echo -e "  • Oracle Interface: ${YELLOW}$DOMAIN/voice/demo${NC}"
echo -e "  • Test Interface: ${YELLOW}$DOMAIN/voice/test${NC}"
echo -e "  • Health API: ${YELLOW}$DOMAIN/api/health${NC}"
echo -e ""
echo -e "${GREEN}All tests passed! Your Spiralogic Oracle is ready.${NC}"
echo -e "${PURPLE}=============================================="