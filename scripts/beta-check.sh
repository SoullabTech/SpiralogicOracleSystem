#!/bin/bash

# ==============================================
# 🚀 SPIRALOGIC BETA CHECK - AUTOMATED VALIDATION
# ==============================================
# One command to validate your entire beta deployment
# Usage: ./scripts/beta-check.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Results tracking
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
REPORT_FILE="beta-check-report-$(date +%Y%m%d-%H%M%S).log"

# Helper functions
print_header() {
    echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}\n"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_CHECKS++))
    ((TOTAL_CHECKS++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_CHECKS++))
    ((TOTAL_CHECKS++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Capture both stdout and stderr to report file
exec > >(tee -a "$REPORT_FILE")
exec 2>&1

print_header "SPIRALOGIC BETA CHECK - $(date)"

# ==============================================
# STEP 1: ENVIRONMENT CHECK
# ==============================================
print_header "1. ENVIRONMENT VALIDATION"

print_step "Checking for .env.local file..."
if [ -f ".env.local" ]; then
    print_success ".env.local found"
    
    # Check for required API keys
    print_step "Validating required API keys..."
    MISSING_KEYS=()
    
    if ! grep -q "^OPENAI_API_KEY=..*" .env.local; then
        MISSING_KEYS+=("OPENAI_API_KEY")
    fi
    if ! grep -q "^SUPABASE_URL=..*" .env.local; then
        MISSING_KEYS+=("SUPABASE_URL")
    fi
    if ! grep -q "^SUPABASE_ANON_KEY=..*" .env.local; then
        MISSING_KEYS+=("SUPABASE_ANON_KEY")
    fi
    
    if [ ${#MISSING_KEYS[@]} -eq 0 ]; then
        print_success "All required API keys present"
    else
        print_error "Missing API keys: ${MISSING_KEYS[*]}"
        print_warning "Please ensure all keys are set in .env.local"
    fi
else
    print_error ".env.local not found"
    print_warning "Copy .env.example to .env.local and add your API keys"
fi

# ==============================================
# STEP 2: DEPENDENCY CHECK
# ==============================================
print_header "2. DEPENDENCY VALIDATION"

print_step "Checking Node.js version..."
NODE_VERSION=$(node -v 2>/dev/null || echo "not installed")
if [[ $NODE_VERSION == v* ]]; then
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not installed"
fi

print_step "Checking npm packages..."
if [ -f "package-lock.json" ]; then
    if npm ls --depth=0 >/dev/null 2>&1; then
        print_success "npm dependencies installed"
    else
        print_error "npm dependencies missing or invalid"
        print_warning "Run: npm install"
    fi
else
    print_error "package-lock.json not found"
fi

# ==============================================
# STEP 3: CODE QUALITY CHECKS
# ==============================================
print_header "3. CODE QUALITY VALIDATION"

# Lint check
print_step "Running ESLint..."
if npm run lint >/dev/null 2>&1; then
    print_success "ESLint passed - no issues found"
else
    print_error "ESLint failed - code style issues detected"
    print_warning "Run: npm run lint to see details"
fi

# TypeScript check
print_step "Running TypeScript compiler check..."
if npm run typecheck >/dev/null 2>&1; then
    print_success "TypeScript check passed - no type errors"
else
    print_error "TypeScript check failed - type errors found"
    print_warning "Run: npm run typecheck to see details"
fi

# ==============================================
# STEP 4: BACKEND SERVICE CHECK
# ==============================================
print_header "4. BACKEND SERVICE VALIDATION"

print_step "Starting backend service..."
cd backend
npm run dev >/dev/null 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 10

print_step "Checking backend health..."
if curl -s http://localhost:3100/health >/dev/null 2>&1; then
    print_success "Backend service running on port 3100"
else
    print_error "Backend service not responding"
    print_warning "Check backend logs for errors"
fi

# ==============================================
# STEP 5: FRONTEND SERVICE CHECK
# ==============================================
print_header "5. FRONTEND SERVICE VALIDATION"

print_step "Starting frontend service..."
npm run dev >/dev/null 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 10

print_step "Checking frontend health..."
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    print_success "Frontend service running on port 3000"
else
    print_error "Frontend service not responding"
    print_warning "Check frontend logs for errors"
fi

# ==============================================
# STEP 6: SMOKE TEST SUITE
# ==============================================
print_header "6. AUTOMATED SMOKE TESTS"

print_step "Running Maya unified smoke test suite..."
cd backend

# Run the smoke tests and capture output
SMOKE_TEST_OUTPUT=$(npx tsx test-maya-unified.ts 2>&1)
SMOKE_TEST_EXIT_CODE=$?

if [ $SMOKE_TEST_EXIT_CODE -eq 0 ]; then
    # Count passed/failed tests from output
    SMOKE_PASSED=$(echo "$SMOKE_TEST_OUTPUT" | grep -c "✅" || true)
    SMOKE_FAILED=$(echo "$SMOKE_TEST_OUTPUT" | grep -c "❌" || true)
    
    if [ $SMOKE_FAILED -eq 0 ]; then
        print_success "All smoke tests passed ($SMOKE_PASSED/15)"
    else
        print_error "Some smoke tests failed ($SMOKE_FAILED/15 failed)"
        echo -e "\n${YELLOW}Failed tests:${NC}"
        echo "$SMOKE_TEST_OUTPUT" | grep "❌"
    fi
else
    print_error "Smoke test suite crashed"
    print_warning "Check test-maya-unified.ts for errors"
fi

cd ..

# ==============================================
# STEP 7: API ENDPOINT CHECKS
# ==============================================
print_header "7. API ENDPOINT VALIDATION"

# Test critical endpoints
ENDPOINTS=(
    "http://localhost:3100/health"
    "http://localhost:3100/api/status"
    "http://localhost:3000/api/oracle/status"
)

for endpoint in "${ENDPOINTS[@]}"; do
    print_step "Testing $endpoint..."
    if curl -s "$endpoint" >/dev/null 2>&1; then
        print_success "$endpoint responding"
    else
        print_error "$endpoint not responding"
    fi
done

# ==============================================
# STEP 8: MEMORY SYSTEM CHECK
# ==============================================
print_header "8. MEMORY SYSTEM VALIDATION"

print_step "Testing memory persistence..."
# Simple memory test via API
MEMORY_TEST=$(curl -s -X POST http://localhost:3100/api/memory/test \
    -H "Content-Type: application/json" \
    -d '{"userId": "beta-test-user", "message": "test memory"}' 2>&1)

if [[ $MEMORY_TEST == *"success"* ]] || [[ $? -eq 0 ]]; then
    print_success "Memory system operational"
else
    print_warning "Memory system not fully configured"
    print_warning "Ensure MEM0_API_KEY is set in .env.local"
fi

# ==============================================
# CLEANUP
# ==============================================
print_header "CLEANUP"

print_step "Stopping services..."
kill $BACKEND_PID 2>/dev/null || true
kill $FRONTEND_PID 2>/dev/null || true
print_success "Services stopped"

# ==============================================
# FINAL REPORT
# ==============================================
print_header "BETA CHECK SUMMARY"

echo -e "\n${BLUE}Total Checks:${NC} $TOTAL_CHECKS"
echo -e "${GREEN}Passed:${NC} $PASSED_CHECKS"
echo -e "${RED}Failed:${NC} $FAILED_CHECKS"

PASS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
echo -e "\n${BLUE}Pass Rate:${NC} ${PASS_RATE}%"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 BETA BUILD STATUS: READY FOR DEPLOYMENT${NC}"
    echo -e "${GREEN}All systems operational!${NC}"
    EXIT_CODE=0
elif [ $PASS_RATE -ge 80 ]; then
    echo -e "\n${YELLOW}⚠️  BETA BUILD STATUS: MOSTLY READY${NC}"
    echo -e "${YELLOW}Minor issues detected - review report above${NC}"
    EXIT_CODE=1
else
    echo -e "\n${RED}🚫 BETA BUILD STATUS: NOT READY${NC}"
    echo -e "${RED}Critical issues detected - fix before deployment${NC}"
    EXIT_CODE=2
fi

echo -e "\n${PURPLE}Full report saved to: $REPORT_FILE${NC}"

# ==============================================
# QUICK START REMINDER
# ==============================================
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "\n${GREEN}✅ Ready to start beta testing!${NC}"
    echo -e "\n${BLUE}Quick start commands:${NC}"
    echo -e "  ${YELLOW}cd backend && npm run dev${NC}     # Start backend"
    echo -e "  ${YELLOW}npm run dev${NC}                   # Start frontend (in root)"
    echo -e "  ${YELLOW}open http://localhost:3000${NC}    # Open Maya"
fi

exit $EXIT_CODE