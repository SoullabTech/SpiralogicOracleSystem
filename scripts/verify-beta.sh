#!/bin/bash

# Beta Pre-Flight Verification Script
# Runs all critical checks before deployment
# Expected runtime: 2-3 minutes

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Beta Pre-Flight Verification Starting..."
echo "=========================================="
echo ""

# Track failures
FAILURES=0

# 1. Git Status Check
echo "1️⃣  Checking git status..."
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✓${NC} Git working tree is clean"
else
    echo -e "${YELLOW}⚠️${NC} Warning: Uncommitted changes detected"
    git status --short
    echo ""
fi

# 2. Node Version Check
echo ""
echo "2️⃣  Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✓${NC} Node.js version: $(node -v)"
else
    echo -e "${RED}✗${NC} Node.js version too old: $(node -v) (need 18+)"
    FAILURES=$((FAILURES + 1))
fi

# 3. Environment Variables Check
echo ""
echo "3️⃣  Checking environment variables..."
if [ -f .env.local ]; then
    ENV_COUNT=$(grep -E "SUPABASE|OPENAI|ELEVENLABS|HUGGING" .env.local 2>/dev/null | wc -l)
    if [ "$ENV_COUNT" -ge 4 ]; then
        echo -e "${GREEN}✓${NC} Found $ENV_COUNT critical environment variables"
    else
        echo -e "${YELLOW}⚠️${NC} Only $ENV_COUNT environment variables found (expected 4+)"
    fi
else
    echo -e "${YELLOW}⚠️${NC} No .env.local file found"
fi

# 4. Dependencies Check
echo ""
echo "4️⃣  Checking dependencies..."
if npm ls --depth=0 2>&1 | grep -E "UNMET|missing" > /dev/null; then
    echo -e "${RED}✗${NC} Missing dependencies detected"
    npm ls --depth=0 2>&1 | grep -E "UNMET|missing"
    FAILURES=$((FAILURES + 1))
else
    echo -e "${GREEN}✓${NC} All dependencies installed"
fi

# 5. TypeScript Check
echo ""
echo "5️⃣  Running TypeScript checks..."
if npm run typecheck > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} TypeScript compilation successful"
else
    echo -e "${RED}✗${NC} TypeScript errors found"
    echo "Run 'npm run typecheck' to see details"
    FAILURES=$((FAILURES + 1))
fi

# 6. Test File Check
echo ""
echo "6️⃣  Checking for test files in production..."
TEST_FILES=$(find . -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | grep -v node_modules | wc -l)
if [ "$TEST_FILES" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No test files in production code"
else
    echo -e "${YELLOW}⚠️${NC} Found $TEST_FILES test files (consider removing)"
fi

# 7. Console.log Check
echo ""
echo "7️⃣  Checking for console.logs..."
CONSOLE_LOGS=$(grep -r "console.log" components/ lib/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -lt 10 ]; then
    echo -e "${GREEN}✓${NC} Minimal console.logs found ($CONSOLE_LOGS)"
else
    echo -e "${YELLOW}⚠️${NC} Many console.logs found ($CONSOLE_LOGS) - consider removing"
fi

# 8. Build Test
echo ""
echo "8️⃣  Testing production build..."
echo "   This may take 1-2 minutes..."

# Clean previous build
rm -rf .next 2>/dev/null || true

if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build completed successfully"
    
    # Check build size
    if [ -d .next ]; then
        BUILD_SIZE=$(du -sm .next | cut -f1)
        if [ "$BUILD_SIZE" -lt 150 ]; then
            echo -e "${GREEN}✓${NC} Build size: ${BUILD_SIZE}MB (optimal)"
        else
            echo -e "${YELLOW}⚠️${NC} Build size: ${BUILD_SIZE}MB (large)"
        fi
    fi
else
    echo -e "${RED}✗${NC} Build failed"
    echo "Run 'npm run build' to see details"
    FAILURES=$((FAILURES + 1))
fi

# 9. Critical Routes Check
echo ""
echo "9️⃣  Verifying critical routes..."
if [ -d .next/server/app ]; then
    ROUTES_FOUND=0
    
    if [ -d .next/server/app/beta-mirror ]; then
        echo -e "${GREEN}✓${NC} Beta mirror route built"
        ROUTES_FOUND=$((ROUTES_FOUND + 1))
    else
        echo -e "${RED}✗${NC} Beta mirror route missing"
    fi
    
    if [ -d .next/server/app/dashboard ]; then
        echo -e "${GREEN}✓${NC} Dashboard route built"
        ROUTES_FOUND=$((ROUTES_FOUND + 1))
    else
        echo -e "${YELLOW}⚠️${NC} Dashboard route missing"
    fi
    
    if [ "$ROUTES_FOUND" -eq 0 ]; then
        FAILURES=$((FAILURES + 1))
    fi
else
    echo -e "${YELLOW}⚠️${NC} Build directory structure unexpected"
fi

# 10. Security Check
echo ""
echo "🔐 Running security checks..."
EXPOSED_KEYS=$(grep -r "sk-\|key-\|secret-" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v ".env" | wc -l)
if [ "$EXPOSED_KEYS" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No exposed API keys found"
else
    echo -e "${RED}✗${NC} Potential exposed keys found"
    FAILURES=$((FAILURES + 1))
fi

LOCALHOST_REFS=$(grep -r "localhost:3" --include="*.ts" --include="*.tsx" components/ lib/ 2>/dev/null | wc -l)
if [ "$LOCALHOST_REFS" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No hardcoded localhost references"
else
    echo -e "${YELLOW}⚠️${NC} Found $LOCALHOST_REFS localhost references"
fi

# Final Summary
echo ""
echo "=========================================="
echo "📊 VERIFICATION SUMMARY"
echo "=========================================="

if [ "$FAILURES" -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "🚀 Ready for beta deployment!"
    echo ""
    echo "Next steps:"
    echo "  1. Deploy with: vercel --prod"
    echo "  2. Or push to main: git push origin main"
    echo "  3. Monitor at: /dashboard/audio"
    exit 0
else
    echo -e "${RED}❌ VERIFICATION FAILED${NC}"
    echo ""
    echo "Found $FAILURES critical issues that must be fixed."
    echo "Please resolve the issues above and run again."
    exit 1
fi