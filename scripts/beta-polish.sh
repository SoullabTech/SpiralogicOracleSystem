#!/bin/bash

# 🪞 Soullab Beta Polish Script
# Final pre-launch quality checks for production-grade codebase
# Run: ./scripts/beta-polish.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🪞 Soullab Beta Polish - Starting Quality Checks${NC}\n"

# Track issues
ISSUES_FOUND=0

# 1. React Hook Dependency Warnings
echo -e "${BLUE}1. Checking React Hook Dependencies...${NC}"
HOOK_WARNINGS=$(npm run lint 2>&1 | grep -c "react-hooks/exhaustive-deps" || true)
if [ "$HOOK_WARNINGS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $HOOK_WARNINGS React Hook dependency warnings${NC}"
    echo "   Review and either:"
    echo "   - Add missing dependencies"
    echo "   - Add: // eslint-disable-next-line react-hooks/exhaustive-deps"
    ISSUES_FOUND=$((ISSUES_FOUND + HOOK_WARNINGS))
else
    echo -e "${GREEN}✅ No React Hook dependency warnings${NC}"
fi
echo

# 2. Fix Quote & Entity Style Warnings
echo -e "${BLUE}2. Fixing Quote & Entity Style Warnings...${NC}"
npx eslint --fix . --ext .ts,.tsx,.js,.jsx --quiet 2>/dev/null || true
echo -e "${GREEN}✅ ESLint auto-fix completed${NC}"

# Check for remaining unescaped entities
UNESCAPED=$(npm run lint 2>&1 | grep -c "react/no-unescaped-entities" || true)
if [ "$UNESCAPED" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $UNESCAPED unescaped entity warnings remain${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + UNESCAPED))
else
    echo -e "${GREEN}✅ No unescaped entity warnings${NC}"
fi
echo

# 3. Tailwind Safelist Check
echo -e "${BLUE}3. Checking Tailwind Dynamic Classes...${NC}"

# Check for dynamic Tailwind classes
DYNAMIC_CLASSES=$(grep -r "bg-\${" --include="*.tsx" --include="*.jsx" app/ components/ 2>/dev/null | wc -l || echo 0)
if [ "$DYNAMIC_CLASSES" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $DYNAMIC_CLASSES dynamic Tailwind classes${NC}"
    echo "   Verify these are in tailwind.config.js safelist:"
    grep -r "bg-\${" --include="*.tsx" --include="*.jsx" app/ components/ | head -5
    echo "   ..."
fi

# Check for Soullab brand colors
BRAND_COLORS=("terracotta" "sage" "ocean" "amber" "divine-gold" "sacred-amber")
echo "   Checking Soullab brand colors..."
for color in "${BRAND_COLORS[@]}"; do
    if grep -q "$color" tailwind.config.js 2>/dev/null; then
        echo -e "   ${GREEN}✅ $color configured${NC}"
    else
        echo -e "   ${YELLOW}⚠️  $color missing from config${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
done
echo

# 4. Console.log Removal
echo -e "${BLUE}4. Checking for console.log statements...${NC}"

# Count console.logs
CONSOLE_LOGS=$(grep -r "console\.log" app/ components/ lib/ hooks/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null | grep -v "// eslint-disable" | wc -l || echo 0)

if [ "$CONSOLE_LOGS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $CONSOLE_LOGS console.log statements${NC}"
    echo "   Top 5 files with console.log:"
    grep -r "console\.log" app/ components/ lib/ hooks/ --include="*.tsx" --include="*.ts" | cut -d: -f1 | sort | uniq -c | sort -rn | head -5
    
    read -p "   Remove all console.logs? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Remove console.log statements (keeping console.error and console.warn)
        find app/ components/ lib/ hooks/ -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i '' '/console\.log/d' {} \;
        echo -e "${GREEN}✅ Removed console.log statements${NC}"
    fi
    ISSUES_FOUND=$((ISSUES_FOUND + CONSOLE_LOGS))
else
    echo -e "${GREEN}✅ No console.log statements found${NC}"
fi
echo

# 5. Accessibility Check
echo -e "${BLUE}5. Running Accessibility Checks...${NC}"

# Check for missing aria-labels on interactive elements
MISSING_ARIA=$(grep -r "<button" app/ components/ --include="*.tsx" --include="*.jsx" 2>/dev/null | grep -v "aria-label" | wc -l || echo 0)
if [ "$MISSING_ARIA" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $MISSING_ARIA buttons potentially missing aria-labels${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ All buttons have aria-labels${NC}"
fi

# Check for form inputs without labels
MISSING_LABELS=$(grep -r "<input" app/ components/ --include="*.tsx" --include="*.jsx" 2>/dev/null | grep -v -E "(aria-label|id=)" | wc -l || echo 0)
if [ "$MISSING_LABELS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $MISSING_LABELS inputs potentially missing labels${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ All inputs have labels${NC}"
fi
echo

# 6. Design QA Checklist
echo -e "${BLUE}6. Design QA Checklist...${NC}"
echo "   Manual checks required:"
echo "   [ ] Soullab gradients consistent across Mirror, Reflection Panel, Control Room"
echo "   [ ] Earthy palette (terracotta, sage, ocean, amber) properly applied"
echo "   [ ] Light/dark theme toggle works smoothly"
echo "   [ ] No 'new age' aesthetic bleed"
echo "   [ ] Typography hierarchy clear and readable"
echo

# 7. Performance Check
echo -e "${BLUE}7. Running Performance Checks...${NC}"

# Check bundle size (if analyze script exists)
if grep -q "analyze" package.json 2>/dev/null; then
    echo "   Run 'npm run analyze' to check bundle size"
else
    echo -e "${YELLOW}⚠️  No analyze script found in package.json${NC}"
    echo "   Add: \"analyze\": \"next build && next-bundle-analyzer\""
fi

# Check for non-GPU accelerated animations
NON_GPU=$(grep -r "transition:" app/ components/ --include="*.tsx" --include="*.css" 2>/dev/null | grep -v "transform\|opacity" | wc -l || echo 0)
if [ "$NON_GPU" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $NON_GPU transitions may not be GPU-accelerated${NC}"
    echo "   Consider using transform/opacity instead of other properties"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ All transitions appear GPU-optimized${NC}"
fi
echo

# 8. Additional Quality Checks
echo -e "${BLUE}8. Additional Quality Checks...${NC}"

# Check for TODO comments
TODOS=$(grep -r "TODO\|FIXME\|HACK" app/ components/ lib/ hooks/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || echo 0)
if [ "$TODOS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $TODOS TODO/FIXME/HACK comments${NC}"
    echo "   Review before beta launch:"
    grep -r "TODO\|FIXME\|HACK" app/ components/ lib/ hooks/ --include="*.tsx" --include="*.ts" | head -3
    ISSUES_FOUND=$((ISSUES_FOUND + TODOS))
else
    echo -e "${GREEN}✅ No TODO comments found${NC}"
fi

# Check for hardcoded API keys
HARDCODED_KEYS=$(grep -r "sk-\|pk-\|api_key" app/ components/ lib/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "process.env" | wc -l || echo 0)
if [ "$HARDCODED_KEYS" -gt 0 ]; then
    echo -e "${RED}❌ CRITICAL: Found $HARDCODED_KEYS potential hardcoded API keys${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 100))
else
    echo -e "${GREEN}✅ No hardcoded API keys found${NC}"
fi
echo

# Final Summary
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}🪞 Soullab Beta Polish - Summary${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"

if [ "$ISSUES_FOUND" -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready for beta launch.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Found $ISSUES_FOUND total issues to review${NC}"
    echo
    echo -e "${BLUE}📋 Pre-Launch Checklist:${NC}"
    echo "  □ Review and fix React Hook dependencies"
    echo "  □ Resolve remaining ESLint warnings"
    echo "  □ Verify Tailwind safelist for dynamic classes"
    echo "  □ Remove or replace console.logs"
    echo "  □ Add missing accessibility attributes"
    echo "  □ Complete manual design QA"
    echo "  □ Run performance analysis"
    echo "  □ Address TODO comments"
    echo
    echo -e "${BLUE}🚀 Success Criteria:${NC}"
    echo "  • Build compiles with 0 errors"
    echo "  • 0 unreviewed warnings"
    echo "  • No console output in production"
    echo "  • Tailwind + Soullab palette aligned"
    echo "  • Accessibility audit passed"
    echo "  • UI feels atmospheric, professional, everyday-sacred"
    
    exit 1
fi