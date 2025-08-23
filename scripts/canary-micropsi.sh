#!/bin/bash

# MicroPsi Canary Tests - Verify affect modulation works
echo "🧠 MicroPsi Canary Tests"
echo "========================"

BASE_URL="http://localhost:3000"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function test_endpoint() {
    local name="$1"
    local url="$2" 
    local data="$3"
    local expected_field="$4"
    
    echo -e "\n${YELLOW}Testing: $name${NC}"
    echo "Data: $data"
    
    response=$(curl -s -X POST "$url" \
        -H 'Content-Type: application/json' \
        -d "$data")
    
    if [ $? -eq 0 ]; then
        if echo "$response" | jq -e "$expected_field" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ PASS${NC} - $expected_field found"
            echo "$response" | jq "$expected_field"
        else
            echo -e "${RED}✗ FAIL${NC} - $expected_field not found"
            echo "Response: $response"
        fi
    else
        echo -e "${RED}✗ FAIL${NC} - Request failed"
    fi
}

# Test 1: Debug context endpoint
echo -e "\n${YELLOW}=== Test 1: Context Debug Endpoint ===${NC}"
test_endpoint "Context Debug" \
    "$BASE_URL/api/debug/context" \
    '{"text":"I feel split between safety and a big leap.","userId":"u_demo"}' \
    '.micropsi'

# Test 2: Low arousal turn (should get conservative parameters)
echo -e "\n${YELLOW}=== Test 2: Low Arousal Turn ===${NC}"
test_endpoint "Low Arousal" \
    "$BASE_URL/api/oracle/turn" \
    '{"input":{"text":"I am quietly unsure about next steps."},"conversationId":"c-mp-low"}' \
    '.metadata.micropsi.modulation'

# Test 3: High arousal turn (should get higher temperature)
echo -e "\n${YELLOW}=== Test 3: High Arousal Turn ===${NC}"
test_endpoint "High Arousal" \
    "$BASE_URL/api/oracle/turn" \
    '{"input":{"text":"I feel wired and stressed—too many deadlines and people need me now!"},"conversationId":"c-mp-high"}' \
    '.metadata.micropsi.modulation'

# Test 4: Meaning-heavy turn (should get deeper synthesis)
echo -e "\n${YELLOW}=== Test 4: Meaning Drive Turn ===${NC}"
test_endpoint "Meaning Drive" \
    "$BASE_URL/api/oracle/turn" \
    '{"input":{"text":"What is the deeper purpose behind all this suffering? I need to understand why things happen."},"conversationId":"c-mp-meaning"}' \
    '.metadata.micropsi.driveVector.meaning'

# Test 5: Check context layers are working
echo -e "\n${YELLOW}=== Test 5: Context Layer Integration ===${NC}"
test_endpoint "Context Layers" \
    "$BASE_URL/api/oracle/turn" \
    '{"input":{"text":"Tell me about my journey so far"},"conversationId":"c-mp-context"}' \
    '.metadata.context'

echo -e "\n${YELLOW}=== Canary Test Summary ===${NC}"
echo "Tests completed. Check output above for:"
echo "• micropsi.modulation present with temperature/depthBias"
echo "• driveVector showing clarity/safety/agency/connection/meaning scores"
echo "• context showing ain/soul/facets counts"
echo "• Different modulation for low vs high arousal inputs"

echo -e "\n${GREEN}Expected Behaviors:${NC}"
echo "• Low arousal → temperature ~0.6, inviteCount=1"
echo "• High arousal → temperature ~0.8, possible inviteCount=2"  
echo "• Meaning questions → higher depthBias values"
echo "• Context counts > 0 after several interactions"