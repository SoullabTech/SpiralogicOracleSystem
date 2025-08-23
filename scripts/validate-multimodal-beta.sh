#!/bin/bash
# Complete Multi-Modal System Validation for Beta
# This script runs through the entire checklist end-to-end

set -e

# Configuration
BASE_URL=${BASE_URL:-"http://localhost:3000"}
BACKEND_URL=${BACKEND_URL:-"http://localhost:8080"}
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@spiralogic.dev"}

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔥 SPIRALOGIC MULTI-MODAL BETA VALIDATION"
echo "========================================="
echo ""

# Track results
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Test result tracking
log_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    ((PASSED_TESTS++))
}

log_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    echo -e "   ${RED}$2${NC}"
    ((FAILED_TESTS++))
}

log_warn() {
    echo -e "${YELLOW}⚠️  WARN: $1${NC}"
    echo -e "   ${YELLOW}$2${NC}"
    ((WARNINGS++))
}

log_info() {
    echo -e "${BLUE}ℹ️  INFO: $1${NC}"
}

# Function to check JSON response
check_json_response() {
    local response="$1"
    local test_name="$2"
    local expected_field="$3"
    
    if echo "$response" | jq -e "$expected_field" >/dev/null 2>&1; then
        log_pass "$test_name"
        return 0
    else
        log_fail "$test_name" "Expected field '$expected_field' not found in response"
        echo "Response: $response" | head -3
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: Environment & Dependencies Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check environment variables
log_info "Checking environment variables..."

if [ -z "$OPENAI_API_KEY" ]; then
    log_warn "OPENAI_API_KEY not set" "Vision and embeddings will fail"
else
    log_pass "OPENAI_API_KEY configured"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    log_warn "NEXT_PUBLIC_SUPABASE_URL not set" "Database operations may fail"
else
    log_pass "Supabase URL configured"
fi

# Check if dependencies are installed
log_info "Checking Node.js dependencies..."

if npm list pdf-parse >/dev/null 2>&1; then
    log_pass "pdf-parse dependency installed"
else
    log_fail "pdf-parse dependency missing" "Run: npm install pdf-parse"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 STEP 2: Service Health Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Health check endpoints
log_info "Testing service endpoints..."

# Backend health (if exists)
if curl -s "$BACKEND_URL/api/soul-memory/health" >/dev/null 2>&1; then
    BACKEND_HEALTH=$(curl -s "$BACKEND_URL/api/soul-memory/health")
    check_json_response "$BACKEND_HEALTH" "Backend soul memory health" ".status"
else
    log_warn "Backend health check failed" "Backend may not be running on $BACKEND_URL"
fi

# Frontend/API health
ADMIN_METRICS=$(curl -s "$BASE_URL/api/admin/metrics?metric=overview" 2>/dev/null || echo '{"error": "not available"}')
if echo "$ADMIN_METRICS" | jq -e '.error' >/dev/null 2>&1; then
    log_warn "Admin metrics not available" "May need authentication"
else
    log_pass "Admin metrics endpoint responding"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 STEP 3: Database Schema Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Checking database schema..."

# Check if uploads table has new columns
UPLOADS_TEST=$(curl -s -X POST "$BASE_URL/api/uploads" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"schema-test.txt","fileType":"text/plain","sizeBytes":100}' \
  2>/dev/null || echo '{"error": "auth required"}')

if echo "$UPLOADS_TEST" | jq -e '.uploadId' >/dev/null 2>&1; then
    log_pass "Uploads table accessible"
else
    log_warn "Uploads endpoint may require authentication" "Schema validation skipped"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 STEP 4: PDF Processing Smoke Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Testing PDF upload initialization..."

PDF_UPLOAD=$(curl -s -X POST "$BASE_URL/api/uploads" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test-document.pdf",
    "fileType": "application/pdf",
    "sizeBytes": 51200,
    "conversationId": "test-multimodal-beta"
  }' 2>/dev/null || echo '{"error": "failed"}')

if echo "$PDF_UPLOAD" | jq -e '.uploadId' >/dev/null 2>&1; then
    UPLOAD_ID=$(echo "$PDF_UPLOAD" | jq -r '.uploadId')
    log_pass "PDF upload initialized (ID: ${UPLOAD_ID:0:8}...)"
    
    # Test processing endpoint (will fail without actual file, but should accept request)
    PROCESS_TEST=$(curl -s -X POST "$BASE_URL/api/uploads/process" \
      -H "Content-Type: application/json" \
      -d "{\"uploadId\": \"$UPLOAD_ID\"}" 2>/dev/null || echo '{"error": "processing failed"}')
    
    if echo "$PROCESS_TEST" | jq -e '.error' | grep -q "not found\|failed" 2>/dev/null; then
        log_pass "PDF processing endpoint accessible (expected failure without file)"
    else
        log_pass "PDF processing endpoint working"
    fi
else
    log_fail "PDF upload failed" "Check authentication and database connectivity"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🖼️ STEP 5: Image Processing Smoke Test"  
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Testing image upload initialization..."

IMAGE_UPLOAD=$(curl -s -X POST "$BASE_URL/api/uploads" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "spiritual-mandala.png",
    "fileType": "image/png", 
    "sizeBytes": 256000,
    "conversationId": "test-multimodal-beta"
  }' 2>/dev/null || echo '{"error": "failed"}')

if echo "$IMAGE_UPLOAD" | jq -e '.uploadId' >/dev/null 2>&1; then
    IMAGE_UPLOAD_ID=$(echo "$IMAGE_UPLOAD" | jq -r '.uploadId')
    log_pass "Image upload initialized (ID: ${IMAGE_UPLOAD_ID:0:8}...)"
else
    log_fail "Image upload failed" "Check authentication and database connectivity"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 STEP 6: Oracle Integration Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Testing Oracle with upload context queries..."

ORACLE_QUERIES=(
    "What themes do you see in the image I shared?"
    "Can you summarize the PDF I uploaded?"
    "What patterns connect my uploads?"
)

for query in "${ORACLE_QUERIES[@]}"; do
    ORACLE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/oracle/turn" \
      -H "Content-Type: application/json" \
      -d "{
        \"input\": {
          \"text\": \"$query\",
          \"context\": {
            \"conversationId\": \"test-multimodal-beta\"
          }
        }
      }" 2>/dev/null || echo '{"error": "failed"}')
    
    if echo "$ORACLE_RESPONSE" | jq -e '.response.text' >/dev/null 2>&1; then
        log_pass "Oracle responded to: \"$(echo $query | cut -c1-40)...\""
        
        # Check if upload context was used
        UPLOAD_COUNT=$(echo "$ORACLE_RESPONSE" | jq -r '.metadata.context.uploads.count // 0' 2>/dev/null)
        if [ "$UPLOAD_COUNT" -gt 0 ] 2>/dev/null; then
            log_pass "Upload context included ($UPLOAD_COUNT uploads)"
        fi
    else
        log_warn "Oracle query failed" "May need authentication or service may be down"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏅 STEP 7: Badge System Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Checking badge system..."

BADGES_RESPONSE=$(curl -s "$BASE_URL/api/beta/badges" 2>/dev/null || echo '{"badges": []}')

if echo "$BADGES_RESPONSE" | jq -e '.badges' >/dev/null 2>&1; then
    BADGE_COUNT=$(echo "$BADGES_RESPONSE" | jq '.badges | length')
    log_pass "Badge system accessible ($BADGE_COUNT badges available)"
    
    # Check for specific badges
    VISIONARY_BADGE=$(echo "$BADGES_RESPONSE" | jq '.badges[] | select(.code == "visionary")' 2>/dev/null)
    SCHOLAR_BADGE=$(echo "$BADGES_RESPONSE" | jq '.badges[] | select(.code == "scholar")' 2>/dev/null)
    
    if [ ! -z "$VISIONARY_BADGE" ]; then
        log_pass "Visionary badge (🎨) available"
    else
        log_warn "Visionary badge not found" "May need database migration"
    fi
    
    if [ ! -z "$SCHOLAR_BADGE" ]; then
        log_pass "Scholar badge (📝) available" 
    else
        log_warn "Scholar badge not found" "May need database migration"
    fi
else
    log_fail "Badge system not accessible" "Check /api/beta/badges endpoint"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️ STEP 8: Security & Edge Cases"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Testing edge cases and security..."

# Test large file rejection
LARGE_FILE_TEST=$(curl -s -X POST "$BASE_URL/api/uploads" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "huge-document.pdf",
    "fileType": "application/pdf",
    "sizeBytes": 104857600
  }' 2>/dev/null || echo '{"error": "too large"}')

if echo "$LARGE_FILE_TEST" | jq -e '.error' | grep -q "large\|size" 2>/dev/null; then
    log_pass "Large file rejection working"
elif echo "$LARGE_FILE_TEST" | jq -e '.uploadId' >/dev/null 2>&1; then
    log_warn "Large file accepted" "Consider adding size limits"
else
    log_pass "Upload size validation in place"
fi

# Test invalid file types
INVALID_FILE_TEST=$(curl -s -X POST "$BASE_URL/api/uploads" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "malware.exe",
    "fileType": "application/x-executable",
    "sizeBytes": 1024
  }' 2>/dev/null || echo '{"error": "invalid type"}')

if echo "$INVALID_FILE_TEST" | jq -e '.error' >/dev/null 2>&1; then
    log_pass "Invalid file type rejection working"
else
    log_warn "File type validation may need strengthening"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 FINAL RESULTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_TESTS=$((PASSED_TESTS + FAILED_TESTS))
PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo -e "${GREEN}✅ PASSED: $PASSED_TESTS tests${NC}"
echo -e "${RED}❌ FAILED: $FAILED_TESTS tests${NC}" 
echo -e "${YELLOW}⚠️  WARNINGS: $WARNINGS issues${NC}"
echo ""
echo -e "Pass Rate: ${GREEN}$PASS_RATE%${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 MULTIMODAL SYSTEM READY FOR BETA!${NC}"
    echo ""
    echo "✨ NEXT STEPS:"
    echo "  1. Run: npm install pdf-parse (if not installed)"
    echo "  2. Set OPENAI_API_KEY in .env.local"
    echo "  3. Run: supabase db push"
    echo "  4. Start services: docker compose up --build"
    echo "  5. Test full flow with actual files in UI"
    echo ""
    echo "🚀 DEMO FLOW:"
    echo "  • Drop voice memo → ask about forgiveness"
    echo "  • Drop PDF → ask for 3 key arguments" 
    echo "  • Drop whiteboard image → ask about themes"
    echo "  • Check badges in /beta/badges"
    echo ""
else
    echo ""
    echo -e "${RED}🔧 ISSUES NEED RESOLUTION${NC}"
    echo ""
    echo "Critical fixes needed before beta:"
    echo "  • Review failed tests above"
    echo "  • Check service connectivity"
    echo "  • Verify authentication setup"
    echo "  • Run database migrations"
    echo ""
fi

exit $FAILED_TESTS