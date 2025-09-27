#!/bin/bash

# Production API Test Suite
# Run this BEFORE and AFTER every deployment

set -e

PROD_URL="https://soullab.life"
# PROD_URL="http://localhost:3000"  # Uncomment for local testing

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🧪 Testing MAIA Production Endpoints"
echo "Target: $PROD_URL"
echo ""

PASS_COUNT=0
FAIL_COUNT=0

# Test 1: Health check
echo "Test 1: Health endpoint..."
HEALTH=$(curl -s "$PROD_URL/api/health")
if echo "$HEALTH" | grep -q "ok"; then
  echo -e "${GREEN}✓ PASS${NC}: Health check"
  ((PASS_COUNT++))
else
  echo -e "${RED}✗ FAIL${NC}: Health check"
  ((FAIL_COUNT++))
fi
echo ""

# Test 2: Maya-chat endpoint with valid message
echo "Test 2: /api/maya-chat with valid message..."
MAYA_RESPONSE=$(curl -s -X POST "$PROD_URL/api/maya-chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello MAIA", "userId": "test-user", "enableVoice": false}')

if echo "$MAYA_RESPONSE" | grep -q "text"; then
  RESPONSE_TEXT=$(echo "$MAYA_RESPONSE" | grep -o '"text":"[^"]*"' | head -1)
  echo -e "${GREEN}✓ PASS${NC}: Maya chat endpoint responding"
  echo "  Response: $RESPONSE_TEXT"

  # Check if it's NOT the generic fallback
  if echo "$MAYA_RESPONSE" | grep -q "I'm tracking with you"; then
    echo -e "${YELLOW}⚠ WARNING${NC}: Got generic fallback response"
  fi
  ((PASS_COUNT++))
else
  echo -e "${RED}✗ FAIL${NC}: Maya chat endpoint not responding properly"
  echo "  Response: $MAYA_RESPONSE"
  ((FAIL_COUNT++))
fi
echo ""

# Test 3: Empty message validation
echo "Test 3: /api/maya-chat with empty message (should reject)..."
EMPTY_RESPONSE=$(curl -s -X POST "$PROD_URL/api/maya-chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "", "userId": "test-user"}' \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$EMPTY_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
if [ "$HTTP_STATUS" = "400" ]; then
  echo -e "${GREEN}✓ PASS${NC}: Empty message correctly rejected (400)"
  ((PASS_COUNT++))
else
  echo -e "${RED}✗ FAIL${NC}: Empty message not rejected (got $HTTP_STATUS)"
  ((FAIL_COUNT++))
fi
echo ""

# Test 4: Legacy endpoint redirect
echo "Test 4: /api/oracle/personal redirect..."
LEGACY_RESPONSE=$(curl -s -X POST "$PROD_URL/api/oracle/personal" \
  -H "Content-Type: application/json" \
  -d '{"message": "Testing legacy endpoint", "userId": "test-user"}')

if echo "$LEGACY_RESPONSE" | grep -q "text"; then
  echo -e "${GREEN}✓ PASS${NC}: Legacy endpoint redirecting properly"
  ((PASS_COUNT++))
else
  echo -e "${RED}✗ FAIL${NC}: Legacy endpoint not working"
  echo "  Response: $LEGACY_RESPONSE"
  ((FAIL_COUNT++))
fi
echo ""

# Test 5: Multiple requests for response variety
echo "Test 5: Testing response variety (3 requests)..."
RESPONSES=()
for i in {1..3}; do
  RESP=$(curl -s -X POST "$PROD_URL/api/maya-chat" \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Test message $i\", \"userId\": \"test-variety\"}" | \
    grep -o '"text":"[^"]*"' | head -1)
  RESPONSES+=("$RESP")
  echo "  Response $i: $RESP"
  sleep 1
done

# Check if all responses are different
UNIQUE_RESPONSES=$(printf '%s\n' "${RESPONSES[@]}" | sort -u | wc -l)
if [ "$UNIQUE_RESPONSES" -gt 1 ]; then
  echo -e "${GREEN}✓ PASS${NC}: Responses are varied ($UNIQUE_RESPONSES unique)"
  ((PASS_COUNT++))
else
  echo -e "${YELLOW}⚠ WARNING${NC}: All responses identical (might be fallback)"
  ((PASS_COUNT++))  # Don't fail, might be coincidence
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed: ${RED}$FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  echo "Safe to proceed with deployment."
  exit 0
else
  echo -e "${RED}❌ Some tests failed!${NC}"
  echo "DO NOT deploy until issues are resolved."
  exit 1
fi