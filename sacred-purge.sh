#!/bin/bash

# Sacred Purge Script - Remove all legacy styling ghosts
# Run this to ensure clean Sacred Mirror implementation

echo "🧹 Sacred Purge Starting..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for issues found
ISSUES_FOUND=0

# 1. Check for purple/gradient ghosts in CSS files
echo -e "\n${YELLOW}1. Scanning for legacy purple/gradient styling...${NC}"
PURPLE_PATTERNS=(
    "purple"
    "bg-gradient"
    "from-purple"
    "to-purple"
    "from-indigo"
    "to-indigo"
    "bg-indigo"
    "text-purple"
    "text-indigo"
    "border-purple"
    "border-indigo"
)

for pattern in "${PURPLE_PATTERNS[@]}"; do
    echo -n "  Checking for '$pattern'... "
    results=$(grep -r "$pattern" --include="*.css" --include="*.scss" --include="*.tsx" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist \
        --exclude="tailwind.config.ts" . 2>/dev/null | grep -v "// Sacred override" | head -5)
    
    if [ ! -z "$results" ]; then
        echo -e "${RED}FOUND${NC}"
        echo "$results" | sed 's/^/    /'
        ((ISSUES_FOUND++))
    else
        echo -e "${GREEN}Clean${NC}"
    fi
done

# 2. Check globals.css specifically
echo -e "\n${YELLOW}2. Checking globals.css for non-Tailwind content...${NC}"
if [ -f "app/globals.css" ]; then
    non_tailwind=$(grep -v -E "^(@tailwind|@import|/\*|\*/|^$)" app/globals.css | head -10)
    if [ ! -z "$non_tailwind" ]; then
        echo -e "  ${RED}Found non-Tailwind content in globals.css:${NC}"
        echo "$non_tailwind" | sed 's/^/    /'
        ((ISSUES_FOUND++))
    else
        echo -e "  ${GREEN}globals.css is clean (only Tailwind directives)${NC}"
    fi
fi

# 3. Check for defaultResponse fallbacks
echo -e "\n${YELLOW}3. Scanning for defaultResponse fallbacks...${NC}"
DEFAULT_PATTERNS=(
    "defaultResponse"
    "I sense there's something important"
    "I'm here to support you"
    "fallbackResponse"
    "genericResponse"
)

for pattern in "${DEFAULT_PATTERNS[@]}"; do
    echo -n "  Checking for '$pattern'... "
    results=$(grep -r "$pattern" --include="*.ts" --include="*.js" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist \
        backend/ app/api/ 2>/dev/null | head -5)
    
    if [ ! -z "$results" ]; then
        echo -e "${RED}FOUND${NC}"
        echo "$results" | sed 's/^/    /'
        ((ISSUES_FOUND++))
    else
        echo -e "${GREEN}Clean${NC}"
    fi
done

# 4. Check for hardcoded styles in components
echo -e "\n${YELLOW}4. Scanning for hardcoded inline styles...${NC}"
STYLE_PATTERNS=(
    'style={{.*background.*purple'
    'style={{.*color.*purple'
    'style={{.*gradient'
    'backgroundColor:.*purple'
    'color:.*purple'
)

for pattern in "${STYLE_PATTERNS[@]}"; do
    echo -n "  Checking for '$pattern'... "
    results=$(grep -r -E "$pattern" --include="*.tsx" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next components/ app/ 2>/dev/null | head -5)
    
    if [ ! -z "$results" ]; then
        echo -e "${RED}FOUND${NC}"
        echo "$results" | sed 's/^/    /'
        ((ISSUES_FOUND++))
    else
        echo -e "${GREEN}Clean${NC}"
    fi
done

# 5. Check for missing Sacred classes
echo -e "\n${YELLOW}5. Checking key components for Sacred styling...${NC}"
KEY_FILES=(
    "app/oracle/page.tsx"
    "app/dashboard/page.tsx"
    "components/ui/oracle-card.tsx"
    "app/page.tsx"
)

for file in "${KEY_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -n "  $file... "
        has_sacred=$(grep -E "(bg-sacred|text-gold|bg-cosmic|sacred-)" "$file" 2>/dev/null)
        if [ -z "$has_sacred" ]; then
            echo -e "${YELLOW}No Sacred classes found${NC}"
            ((ISSUES_FOUND++))
        else
            echo -e "${GREEN}Uses Sacred styling${NC}"
        fi
    fi
done

# 6. Check API metadata flow
echo -e "\n${YELLOW}6. Checking API element metadata flow...${NC}"
echo -n "  Searching for element handling in API routes... "
element_handling=$(grep -r "element" --include="*.ts" app/api/oracle/ 2>/dev/null | grep -E "(req\.body\.element|element:|metadata.*element)" | head -5)
if [ ! -z "$element_handling" ]; then
    echo -e "${GREEN}Found element handling${NC}"
    echo "$element_handling" | sed 's/^/    /'
else
    echo -e "${YELLOW}No element handling found in API${NC}"
    ((ISSUES_FOUND++))
fi

# Summary
echo -e "\n================================"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ Sacred Purge Complete - No issues found!${NC}"
else
    echo -e "${RED}❌ Found $ISSUES_FOUND issues that need fixing${NC}"
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo "1. Run: ./sacred-purge.sh --fix   (to auto-fix some issues)"
    echo "2. Manually review flagged files"
    echo "3. Clear cache: rm -rf .next node_modules && npm install"
    echo "4. Hard refresh browser after changes"
fi

# Auto-fix option
if [ "$1" == "--fix" ]; then
    echo -e "\n${YELLOW}Running auto-fix...${NC}"
    
    # Clean globals.css
    if [ -f "app/globals.css" ]; then
        echo -e "  Cleaning globals.css..."
        cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF
        echo -e "  ${GREEN}Done${NC}"
    fi
    
    # Create sacred class replacements file
    echo -e "  Creating sacred-replacements.json..."
    cat > sacred-replacements.json << 'EOF'
{
  "replacements": {
    "bg-purple": "bg-sacred-cosmic",
    "text-purple": "text-gold-divine",
    "border-purple": "border-gold-divine",
    "from-purple": "from-sacred-cosmic",
    "to-purple": "to-sacred-navy",
    "bg-gradient-to-": "bg-sacred-cosmic"
  }
}
EOF
    echo -e "  ${GREEN}Done - Review replacements and apply manually${NC}"
fi