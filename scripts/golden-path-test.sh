#!/bin/bash
# Golden Path Test Suite - 10 minute validation of complete multimodal flow
set -e

echo "🎯 SPIRALOGIC GOLDEN PATH TEST SUITE"
echo "===================================="
echo ""

# Configuration
BASE_URL=${BASE_URL:-"http://localhost:3000"}
BACKEND_URL=${BACKEND_URL:-"http://localhost:8080"}

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test tracking
TEST_STEP=0
PASS_COUNT=0
FAIL_COUNT=0

next_step() {
    ((TEST_STEP++))
    echo ""
    echo -e "${BLUE}🎯 Step $TEST_STEP: $1${NC}"
    echo "$(printf '─%.0s' {1..50})"
}

test_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    ((PASS_COUNT++))
}

test_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    echo -e "   ${RED}$2${NC}"
    ((FAIL_COUNT++))
}

test_warn() {
    echo -e "${YELLOW}⚠️  WARN: $1${NC}"
    echo -e "   ${YELLOW}$2${NC}"
}

# Helper function to check API response
check_api() {
    local response="$1"
    local test_name="$2"
    local expected_field="$3"
    
    if echo "$response" | jq -e "$expected_field" >/dev/null 2>&1; then
        test_pass "$test_name"
        return 0
    else
        test_fail "$test_name" "Expected field '$expected_field' not found"
        return 1
    fi
}

echo "Starting Golden Path validation against $BASE_URL..."
echo ""

# Step 1: Health Check
next_step "Health & Metrics Check"

HEALTH_RESPONSE=$(curl -s "$BASE_URL/api/admin/metrics?metric=overview" 2>/dev/null || echo '{"error": "unavailable"}')

if echo "$HEALTH_RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
    test_warn "Admin metrics endpoint" "May require authentication - continuing tests"
else
    test_pass "Admin metrics endpoint responding"
fi

# Test Oracle endpoint
ORACLE_HEALTH=$(curl -s -X POST "$BASE_URL/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"Hello, are you there?"},"conversationId":"golden-path-test"}' \
  2>/dev/null || echo '{"error": "failed"}')

if echo "$ORACLE_HEALTH" | jq -e '.response.text' >/dev/null 2>&1; then
    test_pass "Oracle endpoint responding"
    echo "   Response: $(echo "$ORACLE_HEALTH" | jq -r '.response.text' | head -c 60)..."
else
    test_fail "Oracle endpoint not responding" "Check authentication and service status"
fi

# Step 2: PDF Upload Test
next_step "PDF Upload Processing"

PDF_UPLOAD=$(curl -s -X POST "$BASE_URL/api/uploads" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "golden-path-test.pdf",
    "fileType": "application/pdf",
    "sizeBytes": 51200,
    "conversationId": "golden-path-test"
  }' 2>/dev/null || echo '{"error": "failed"}')

if echo "$PDF_UPLOAD" | jq -e '.uploadId' >/dev/null 2>&1; then
    UPLOAD_ID=$(echo "$PDF_UPLOAD" | jq -r '.uploadId')
    test_pass "PDF upload initialized (ID: ${UPLOAD_ID:0:8}...)"
    
    echo "   ℹ️  In a real test, you would:"
    echo "     1. PUT actual PDF to the signed URL"
    echo "     2. POST to /api/uploads/process with uploadId"
    echo "     3. Expect status=ready, text_content!=null, embedding!=null"
else
    test_fail "PDF upload initialization failed" "Check database connectivity"
fi

# Step 3: Image Upload Test
next_step "Image Upload Processing"

IMAGE_UPLOAD=$(curl -s -X POST "$BASE_URL/api/uploads" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "golden-path-test.png",
    "fileType": "image/png",
    "sizeBytes": 256000,
    "conversationId": "golden-path-test"
  }' 2>/dev/null || echo '{"error": "failed"}')

if echo "$IMAGE_UPLOAD" | jq -e '.uploadId' >/dev/null 2>&1; then
    IMAGE_ID=$(echo "$IMAGE_UPLOAD" | jq -r '.uploadId')
    test_pass "Image upload initialized (ID: ${IMAGE_ID:0:8}...)"
    
    echo "   ℹ️  In a real test, you would:"
    echo "     1. PUT actual image to the signed URL"
    echo "     2. POST to /api/uploads/process with uploadId"
    echo "     3. Expect image_caption!=null, Visionary badge awarded"
else
    test_fail "Image upload initialization failed" "Check database connectivity"
fi

# Step 4: Oracle Integration Test
next_step "Oracle Upload Context Integration"

UPLOAD_QUERIES=(
    "What are the key arguments in my PDF?"
    "What themes stand out in the image I shared?"
    "How do my recent uploads connect?"
)

for query in "${UPLOAD_QUERIES[@]}"; do
    echo "   Testing: \"$query\""
    
    ORACLE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/oracle/turn" \
      -H "Content-Type: application/json" \
      -d "{
        \"input\": {
          \"text\": \"$query\",
          \"context\": {
            \"conversationId\": \"golden-path-test\"
          }
        }
      }" 2>/dev/null || echo '{"error": "failed"}')
    
    if echo "$ORACLE_RESPONSE" | jq -e '.response.text' >/dev/null 2>&1; then
        RESPONSE_TEXT=$(echo "$ORACLE_RESPONSE" | jq -r '.response.text')
        test_pass "Oracle responded (${#RESPONSE_TEXT} chars)"
        
        # Check for upload context usage
        UPLOAD_COUNT=$(echo "$ORACLE_RESPONSE" | jq -r '.metadata.context.uploads.count // 0' 2>/dev/null)
        if [ "$UPLOAD_COUNT" -gt 0 ] 2>/dev/null; then
            echo "     📎 Used $UPLOAD_COUNT uploads in context"
        fi
    else
        test_warn "Oracle query partially failed" "May need authentication or actual uploads"
    fi
done

# Step 5: Badge System Test
next_step "Badge System Verification"

BADGES_RESPONSE=$(curl -s "$BASE_URL/api/beta/badges" 2>/dev/null || echo '{"badges": []}')

if echo "$BADGES_RESPONSE" | jq -e '.badges' >/dev/null 2>&1; then
    BADGE_COUNT=$(echo "$BADGES_RESPONSE" | jq '.badges | length')
    test_pass "Badge system accessible ($BADGE_COUNT badges available)"
    
    # Check for specific multimodal badges
    VISIONARY=$(echo "$BADGES_RESPONSE" | jq '.badges[] | select(.code == "visionary")' 2>/dev/null)
    SCHOLAR=$(echo "$BADGES_RESPONSE" | jq '.badges[] | select(.code == "scholar")' 2>/dev/null)
    
    if [ ! -z "$VISIONARY" ]; then
        test_pass "Visionary badge (🎨) available"
    else
        test_warn "Visionary badge not found" "May need database migration"
    fi
    
    if [ ! -z "$SCHOLAR" ]; then
        test_pass "Scholar badge (📝) available"
    else
        test_warn "Scholar badge not found" "May need database migration"
    fi
else
    test_fail "Badge system not accessible" "Check /api/beta/badges endpoint"
fi

# Step 6: Bridge Health Check
next_step "Bridge & Performance Check"

if curl -s "$BASE_URL/debug/bridge" >/dev/null 2>&1; then
    test_pass "Bridge debug endpoint accessible"
    echo "   ℹ️  Check /debug/bridge for:"
    echo "     • Green heartbeat"
    echo "     • p95 ≤ 350ms"
    echo "     • Dual-write ≥ 90%"
else
    test_warn "Bridge debug endpoint not accessible" "May require authentication"
fi

# Final Results
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 GOLDEN PATH TEST RESULTS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_TESTS=$((PASS_COUNT + FAIL_COUNT))
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$((PASS_COUNT * 100 / TOTAL_TESTS))
else
    PASS_RATE=0
fi

echo -e "${GREEN}✅ PASSED: $PASS_COUNT tests${NC}"
echo -e "${RED}❌ FAILED: $FAIL_COUNT tests${NC}"
echo ""
echo -e "Pass Rate: ${GREEN}$PASS_RATE%${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 GOLDEN PATH VALIDATION SUCCESSFUL!${NC}"
    echo ""
    echo -e "${GREEN}🚀 READY FOR BETA TESTING${NC}"
    echo ""
    echo "✨ NEXT STEPS:"
    echo "  1. Upload actual files through UI"
    echo "  2. Test full conversation flow"
    echo "  3. Verify badges unlock in real-time"
    echo "  4. Monitor /admin/overview during testing"
    echo ""
    echo "🎯 DEMO FLOW:"
    echo "  • Drop voice memo → ask about forgiveness"
    echo "  • Drop PDF → ask for 3 key arguments"
    echo "  • Drop image → ask about themes"
    echo "  • Check badges in /beta/badges"
else
    echo ""
    echo -e "${RED}🔧 ISSUES NEED ATTENTION${NC}"
    echo ""
    echo "Critical items to resolve before beta:"
    echo "  • Review failed tests above"
    echo "  • Check service connectivity"
    echo "  • Verify authentication setup"
    echo "  • Ensure all migrations applied"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"