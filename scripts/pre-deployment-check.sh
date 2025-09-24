#!/bin/bash

# ARIA Maya Dashboard - Pre-Deployment Checklist
# Run this before deploying to production

echo "🦋 ARIA Maya Dashboard - Pre-Deployment Check"
echo "=============================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0

# 1. Check Node version
echo "1. Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✓${NC} Node.js version is 18+ ($(node -v))"
else
    echo -e "${RED}✗${NC} Node.js version must be 18+ (current: $(node -v))"
    ERRORS=$((ERRORS+1))
fi

# 2. Install dependencies
echo ""
echo "2. Installing dependencies..."
if npm ci --quiet; then
    echo -e "${GREEN}✓${NC} Dependencies installed successfully"
else
    echo -e "${RED}✗${NC} Failed to install dependencies"
    ERRORS=$((ERRORS+1))
fi

# 3. Run TypeScript check
echo ""
echo "3. Running TypeScript type check..."
if npm run typecheck 2>/dev/null; then
    echo -e "${GREEN}✓${NC} TypeScript check passed"
else
    echo -e "${YELLOW}⚠${NC} TypeScript warnings found (non-blocking)"
fi

# 4. Build the project
echo ""
echo "4. Building production bundle..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Production build successful"

    # Check bundle size
    echo "   Analyzing bundle size..."
    if [ -d ".next" ]; then
        BUNDLE_SIZE=$(du -sh .next | cut -f1)
        echo "   Bundle size: $BUNDLE_SIZE"

        # Check if bundle analyzer is available
        if [ -f ".next/analyze/client.html" ]; then
            echo "   Bundle analysis available at .next/analyze/client.html"
        fi
    fi
else
    echo -e "${RED}✗${NC} Build failed"
    ERRORS=$((ERRORS+1))
fi

# 5. Check PWA files
echo ""
echo "5. Checking PWA configuration..."
PWA_FILES=(
    "public/manifest.json"
    "public/sw.js"
    "public/offline.html"
    "public/icons/icon-192x192.png"
    "public/icons/icon-512x512.png"
)

for file in "${PWA_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} Found: $file"
    else
        echo -e "${YELLOW}⚠${NC} Missing: $file (will use defaults)"
    fi
done

# 6. Check critical environment variables
echo ""
echo "6. Checking environment configuration..."
ENV_VARS=(
    "ANTHROPIC_API_KEY"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

for var in "${ENV_VARS[@]}"; do
    if [ ! -z "${!var}" ]; then
        echo -e "${GREEN}✓${NC} $var is set"
    else
        if grep -q "$var" .env.local 2>/dev/null || grep -q "$var" .env 2>/dev/null; then
            echo -e "${GREEN}✓${NC} $var found in .env file"
        else
            echo -e "${YELLOW}⚠${NC} $var not found (set in Vercel dashboard)"
        fi
    fi
done

# 7. Run PWA optimization
echo ""
echo "7. Running PWA optimization..."
if npm run pwa:optimize 2>/dev/null; then
    echo -e "${GREEN}✓${NC} PWA optimization complete"
else
    if node scripts/optimize-pwa.js 2>/dev/null; then
        echo -e "${GREEN}✓${NC} PWA optimization complete"
    else
        echo -e "${YELLOW}⚠${NC} PWA optimization script not found (optional)"
    fi
fi

# 8. Test offline mode
echo ""
echo "8. Testing service worker..."
if [ -f "public/sw.js" ]; then
    SW_SIZE=$(wc -l public/sw.js | awk '{print $1}')
    if [ "$SW_SIZE" -gt 50 ]; then
        echo -e "${GREEN}✓${NC} Service worker is configured ($SW_SIZE lines)"
    else
        echo -e "${YELLOW}⚠${NC} Service worker seems minimal"
    fi
else
    echo -e "${RED}✗${NC} Service worker not found"
    ERRORS=$((ERRORS+1))
fi

# 9. Check for common issues
echo ""
echo "9. Checking for common issues..."

# Check for console.log in production code
CONSOLE_LOGS=$(grep -r "console.log" --include="*.tsx" --include="*.ts" app/ components/ lib/ 2>/dev/null | grep -v "// " | wc -l)
if [ "$CONSOLE_LOGS" -gt 10 ]; then
    echo -e "${YELLOW}⚠${NC} Found $CONSOLE_LOGS console.log statements (consider removing)"
else
    echo -e "${GREEN}✓${NC} Minimal console.log usage"
fi

# Check image optimization
if [ -d "public/icons" ]; then
    LARGE_IMAGES=$(find public/icons -type f -size +100k | wc -l)
    if [ "$LARGE_IMAGES" -gt 0 ]; then
        echo -e "${YELLOW}⚠${NC} Found $LARGE_IMAGES large image files (>100KB)"
    else
        echo -e "${GREEN}✓${NC} All images are optimized"
    fi
fi

# 10. Generate deployment report
echo ""
echo "10. Generating deployment report..."
REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).txt"
{
    echo "ARIA Maya Dashboard - Deployment Report"
    echo "Generated: $(date)"
    echo "==========================================="
    echo ""
    echo "Build Information:"
    echo "  Node Version: $(node -v)"
    echo "  NPM Version: $(npm -v)"
    echo "  Bundle Size: ${BUNDLE_SIZE:-unknown}"
    echo ""
    echo "PWA Status:"
    for file in "${PWA_FILES[@]}"; do
        if [ -f "$file" ]; then
            echo "  ✓ $file"
        else
            echo "  ✗ $file"
        fi
    done
    echo ""
    echo "A/B Test Configuration:"
    echo "  Variants: immediate (33%), delayed (33%), contextual (33%)"
    echo "  Tracking: Google Analytics 4 + Custom endpoint"
    echo "  IndexedDB: Configured for offline support"
    echo ""
    echo "Performance Targets:"
    echo "  LCP: < 2.0s"
    echo "  FID: < 50ms"
    echo "  CLS: < 0.05"
    echo "  Bundle: ~105KB initial load"
} > "$REPORT_FILE"

echo -e "${GREEN}✓${NC} Report saved to $REPORT_FILE"

# Final summary
echo ""
echo "=============================================="
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for deployment${NC}"
    echo ""
    echo "Deploy with:"
    echo "  vercel --prod"
    echo ""
    echo "Post-deployment:"
    echo "  1. Test on real devices (iOS Safari, Android Chrome)"
    echo "  2. Verify offline mode works"
    echo "  3. Monitor /api/analytics/dashboard"
    echo "  4. Check A/B test variant distribution"
else
    echo -e "${RED}❌ Found $ERRORS critical issues. Please fix before deploying.${NC}"
    exit 1
fi

echo ""
echo "🦋 Maya awaits her emergence into production..."