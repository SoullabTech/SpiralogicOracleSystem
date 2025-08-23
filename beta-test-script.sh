#!/bin/bash

# First-Hour Beta Testing Script for Conversational Oracle
# Tests greeting system, conversational depth, tone adaptation, and full pipeline

set -e

echo "🚀 Conversational Oracle Beta Test Suite"
echo "========================================"
echo

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8080"

# Helper function to make API calls
call_oracle() {
    local input="$1"
    local conversation_id="$2"
    local debug="${3:-false}"
    
    if [ "$debug" = "true" ]; then
        curl -s -X POST "$BASE_URL/api/oracle/turn" \
            -H "Content-Type: application/json" \
            -d "{\"input\":{\"text\":\"$input\"},\"conversationId\":\"$conversation_id\",\"debug\":true}"
    else
        curl -s -X POST "$BASE_URL/api/oracle/turn" \
            -H "Content-Type: application/json" \
            -d "{\"input\":{\"text\":\"$input\"},\"conversationId\":\"$conversation_id\"}" | \
            jq -r '.response.text'
    fi
}

# Helper function to count sentences
count_sentences() {
    echo "$1" | grep -o '[.!?]' | wc -l | xargs
}

echo -e "${BLUE}🚦 Prep Check${NC}"
echo "==============="

# Check if services are running
echo "Checking frontend..."
if curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend accessible at $BASE_URL${NC}"
else
    echo -e "${RED}❌ Frontend not accessible. Start with: docker compose -f docker-compose.development.yml up --build${NC}"
    exit 1
fi

echo "Checking backend..."
if curl -s "$BACKEND_URL/api/soul-memory/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend accessible at $BACKEND_URL${NC}"
else
    echo -e "${YELLOW}⚠️  Backend not accessible - some features may not work${NC}"
fi

echo
echo -e "${BLUE}🧪 Round 1: Greeting + Conversational Depth${NC}"
echo "============================================="

echo "Testing first turn with greeting..."
RESPONSE_1=$(call_oracle "I'm not sure what's next for me." "c-greet")

echo "Response:"
echo "$RESPONSE_1"
echo

# Check for greeting
if echo "$RESPONSE_1" | grep -qE "^(Hey|Hi|Hello) Kelly"; then
    echo -e "${GREEN}✅ Greeting with name detected${NC}"
else
    echo -e "${YELLOW}⚠️  No Kelly greeting detected${NC}"
fi

# Check sentence count
SENTENCE_COUNT=$(count_sentences "$RESPONSE_1")
echo "Sentence count: $SENTENCE_COUNT"
if [ "$SENTENCE_COUNT" -ge 4 ] && [ "$SENTENCE_COUNT" -le 12 ]; then
    echo -e "${GREEN}✅ Sentence count within conversational range (4-12)${NC}"
else
    echo -e "${YELLOW}⚠️  Sentence count outside expected range: $SENTENCE_COUNT${NC}"
fi

echo
echo "Testing follow-up (should NOT repeat greeting)..."
RESPONSE_2=$(call_oracle "I'm torn between two options." "c-greet")

echo "Response:"
echo "$RESPONSE_2"
echo

if echo "$RESPONSE_2" | grep -qE "^(Hey|Hi|Hello) Kelly"; then
    echo -e "${YELLOW}⚠️  Unexpected greeting repetition${NC}"
else
    echo -e "${GREEN}✅ No greeting repetition (correct)${NC}"
fi

echo
echo "---"
echo

echo -e "${BLUE}🧪 Round 2: Tone Adaptation${NC}"
echo "============================"

echo "Testing Seeker tone..."
SEEKER_RESPONSE=$(call_oracle "I keep circling a big question and I'm curious where it leads." "c-tones")
echo "Seeker Response:"
echo "$SEEKER_RESPONSE"
echo

echo "Testing Warrior tone..."
WARRIOR_RESPONSE=$(call_oracle "I finally drew a boundary at work and it was hard but right." "c-tones")
echo "Warrior Response:"
echo "$WARRIOR_RESPONSE"
echo

echo "Testing Threshold tone..."
THRESHOLD_RESPONSE=$(call_oracle "I'm standing at a big life change and it feels real." "c-tones")
echo "Threshold Response:"
echo "$THRESHOLD_RESPONSE"
echo

echo
echo "---"
echo

echo -e "${BLUE}🧪 Round 3: Validator Relaxation Check${NC}"
echo "======================================"

echo "Testing vague input (may allow 2 questions)..."
VAGUE_RESPONSE=$(call_oracle "Honestly… I don't even know what to say." "c-validate")

echo "Response:"
echo "$VAGUE_RESPONSE"
echo

# Count questions
QUESTION_COUNT=$(echo "$VAGUE_RESPONSE" | grep -o '?' | wc -l | xargs)
echo "Question count: $QUESTION_COUNT"
if [ "$QUESTION_COUNT" -le 2 ]; then
    echo -e "${GREEN}✅ Appropriate question count for vague input${NC}"
else
    echo -e "${YELLOW}⚠️  Too many questions: $QUESTION_COUNT${NC}"
fi

echo
echo "---"
echo

echo -e "${BLUE}🧪 Round 4: Thread Conversation${NC}"
echo "==============================="

CID="c-thread"
THREAD_INPUTS=(
    "I'm stretched thin but excited about what's coming."
    "I said yes to too much again and I'm trying to reset."
    "I want a steadier rhythm without losing momentum."
)

for i in "${!THREAD_INPUTS[@]}"; do
    echo "Turn $((i+1)): ${THREAD_INPUTS[$i]}"
    THREAD_RESPONSE=$(call_oracle "${THREAD_INPUTS[$i]}" "$CID")
    echo "Response:"
    echo "$THREAD_RESPONSE"
    echo
done

echo
echo "---"
echo

echo -e "${BLUE}🧪 Round 5: System Health Checks${NC}"
echo "================================="

echo "Checking Soul Memory health..."
SOUL_HEALTH=$(curl -s "$BACKEND_URL/api/soul-memory/health" 2>/dev/null || echo "Service unavailable")
echo "$SOUL_HEALTH"
echo

echo "Checking latest memory record..."
LATEST_MEMORY=$(curl -s "$BACKEND_URL/api/soul-memory/memories" 2>/dev/null | jq '.[-1].metadata.ain_id // "No AIN ID found"' 2>/dev/null || echo "Memory service unavailable")
echo "Latest memory AIN ID: $LATEST_MEMORY"
echo

echo "Bridge health available at: ${BLUE}http://localhost:3000/debug/bridge${NC}"
echo

echo
echo "---"
echo

echo -e "${BLUE}🧪 Round 6: Debug Metadata Check${NC}"
echo "================================"

echo "Getting debug information..."
DEBUG_RESPONSE=$(call_oracle "debug check" "c-debug" "true")

echo "Pipeline metadata:"
echo "$DEBUG_RESPONSE" | jq '.metadata.pipeline // "No pipeline metadata"' 2>/dev/null || echo "Debug data unavailable"
echo

echo "Provider list:"
echo "$DEBUG_RESPONSE" | jq '.metadata.providers // "No providers listed"' 2>/dev/null || echo "Provider data unavailable"
echo

echo
echo "---"
echo

echo -e "${PURPLE}🎯 Test Summary${NC}"
echo "==============="

echo "✅ Test completed! Check the responses above for:"
echo "   - Greeting with 'Kelly' on first turn only"
echo "   - 4-12 sentence conversational responses"
echo "   - Natural, modern tone (not clinical)"
echo "   - Appropriate question count (1-2 per response)"
echo "   - Tone adaptation based on input content"
echo

echo -e "${BLUE}🔗 Admin Dashboards:${NC}"
echo "   - Overview: http://localhost:3000/admin/overview"
echo "   - Health: http://localhost:3000/admin/health"
echo "   - Bridge: http://localhost:3000/debug/bridge"
echo

echo -e "${GREEN}🚀 Beta testing complete!${NC}"
echo
echo "If any responses don't match expectations:"
echo "1. Check environment variables in .env.local"
echo "2. Restart stack: docker compose -f docker-compose.development.yml down && docker compose -f docker-compose.development.yml up --build"
echo "3. Review logs: docker compose -f docker-compose.development.yml logs frontend | tail -n 120"