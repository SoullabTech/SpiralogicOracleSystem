#!/bin/bash

# Monitor Production Maya Zen Mode
# Verify deployment success and zen brevity compliance

echo "🧘 Monitoring Maya Zen Mode in Production..."
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Production URL (update with your actual URL)
PROD_URL="https://spiralogic-oracle-system.vercel.app"

# Test inputs for Maya
TEST_INPUTS=(
    "Hello Maya"
    "I'm stressed"
    "I feel sad"
    "What should I do?"
    "I'm confused"
    "I'm happy today"
)

echo -e "${BLUE}Testing Maya responses for zen brevity...${NC}\n"

PASSED=0
FAILED=0

for input in "${TEST_INPUTS[@]}"; do
    echo -e "${YELLOW}Testing: \"$input\"${NC}"

    # Make request to production API
    RESPONSE=$(curl -s -X POST "$PROD_URL/api/oracle/personal/consult" \
        -H "Content-Type: application/json" \
        -d "{\"userId\":\"test-monitor\",\"input\":\"$input\"}" \
        --max-time 30)

    if [ $? -eq 0 ]; then
        # Extract message from JSON response (basic parsing)
        MESSAGE=$(echo "$RESPONSE" | grep -o '"message":"[^"]*"' | sed 's/"message":"//' | sed 's/"$//')

        if [ -n "$MESSAGE" ]; then
            echo -e "Response: \"$MESSAGE\""

            # Count words
            WORD_COUNT=$(echo "$MESSAGE" | wc -w | tr -d ' ')
            echo -e "Words: $WORD_COUNT"

            # Check for therapy-speak patterns
            THERAPY_SPEAK=false
            if echo "$MESSAGE" | grep -iq "I sense\|I witness\|hold space\|I'm here to\|attuning"; then
                THERAPY_SPEAK=true
            fi

            # Validate
            if [ "$WORD_COUNT" -le 25 ] && [ "$THERAPY_SPEAK" = false ]; then
                echo -e "${GREEN}✅ PASSED${NC}\n"
                ((PASSED++))
            else
                echo -e "${RED}❌ FAILED${NC}"
                if [ "$WORD_COUNT" -gt 25 ]; then
                    echo -e "${RED}  - Too many words: $WORD_COUNT > 25${NC}"
                fi
                if [ "$THERAPY_SPEAK" = true ]; then
                    echo -e "${RED}  - Contains therapy-speak${NC}"
                fi
                echo ""
                ((FAILED++))
            fi
        else
            echo -e "${RED}❌ FAILED: No message in response${NC}\n"
            ((FAILED++))
        fi
    else
        echo -e "${RED}❌ FAILED: Request failed${NC}\n"
        ((FAILED++))
    fi

    # Small delay between requests
    sleep 1
done

# Summary
echo -e "${BLUE}============================================="
echo -e "Maya Zen Mode Production Monitoring Results"
echo -e "=============================================${NC}"
echo ""
echo -e "✅ Passed: $PASSED"
echo -e "❌ Failed: $FAILED"
echo -e "Total Tests: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 SUCCESS! Maya is perfectly zen in production!${NC}"
    echo -e "${GREEN}All responses are brief, clear, and therapy-speak free.${NC}"
    echo ""
    echo -e "${BLUE}Maya Angelou Zen Mode: DEPLOYED ✓${NC}"
    echo -e "${BLUE}Next: Week 2 - Three Archetype Beta${NC}"
    exit 0
else
    echo -e "${RED}⚠️  ISSUES DETECTED in production!${NC}"
    echo -e "${YELLOW}Consider rolling back or fixing issues.${NC}"
    echo ""
    echo -e "${YELLOW}Rollback command: ./scripts/rollback-maya-zen.sh${NC}"
    exit 1
fi