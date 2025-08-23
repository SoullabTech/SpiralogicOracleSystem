#!/bin/bash

# Badge Constellation Graduation Ceremony Canary Tests
echo "🌟 Badge Constellation Graduation Ceremony Canary Tests"
echo "======================================================="

BASE_URL="http://localhost:3000"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

function test_endpoint() {
    local name="$1"
    local url="$2" 
    local method="$3"
    local data="$4"
    local expected_field="$5"
    local auth_required="$6"
    
    echo -e "\n${BLUE}Testing: $name${NC}"
    
    # Add auth headers if required
    auth_headers=""
    if [ "$auth_required" = "true" ]; then
        echo "⚠️  This test requires authentication"
        auth_headers="-H 'Authorization: Bearer fake_test_token'"
    fi
    
    if [ "$method" = "GET" ]; then
        if [ -n "$auth_headers" ]; then
            response=$(curl -s $auth_headers "$url")
        else
            response=$(curl -s "$url")
        fi
    else
        echo "Data: $data"
        if [ -n "$auth_headers" ]; then
            response=$(curl -s -X "$method" "$url" \
                $auth_headers \
                -H 'Content-Type: application/json' \
                -d "$data")
        else
            response=$(curl -s -X "$method" "$url" \
                -H 'Content-Type: application/json' \
                -d "$data")
        fi
    fi
    
    if [ $? -eq 0 ]; then
        if echo "$response" | jq -e "$expected_field" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ PASS${NC} - $expected_field found"
            if [ "$expected_field" != ".ok" ] && [ "$expected_field" != ".status" ] && [ "$expected_field" != ".eligible" ]; then
                echo "$response" | jq "$expected_field" 2>/dev/null || echo "Response preview: $(echo "$response" | head -c 200)..."
            fi
        else
            echo -e "${RED}✗ FAIL${NC} - $expected_field not found"
            echo "Response: $response"
        fi
    else
        echo -e "${RED}✗ FAIL${NC} - Request failed"
    fi
}

echo -e "\n${PURPLE}=== Phase 1: Database Migration Verification ===${NC}"
echo -e "${BLUE}Checking if constellation tables exist (manual verification needed):${NC}"
echo "1. Check Supabase console for these tables:"
echo "   • badge_constellations"
echo "   • badge_ceremonies" 
echo "   • beta_badges_catalog (should include GRADUATED_PIONEER)"
echo "2. Verify views exist:"
echo "   • v_recent_ceremonies"
echo "3. Verify constellation data is seeded:"
echo "   • WAYFINDER, WEAVER, PIONEER constellations"

echo -e "\n${PURPLE}=== Phase 2: Constellation Preview API ===${NC}"
test_endpoint "Constellation Preview (unauthenticated)" \
    "$BASE_URL/api/beta/constellation/preview" \
    "GET" \
    "" \
    ".error" \
    "false"

test_endpoint "Constellation Preview (requires auth)" \
    "$BASE_URL/api/beta/constellation/preview" \
    "GET" \
    "" \
    ".eligible" \
    "true"

echo -e "\n${PURPLE}=== Phase 3: Ceremony Commit (Start) ===${NC}"
test_endpoint "Ceremony Commit (requires auth)" \
    "$BASE_URL/api/beta/constellation/commit" \
    "POST" \
    '{}' \
    ".ceremony_id" \
    "true"

echo -e "\n${PURPLE}=== Phase 4: Ceremony Complete ===${NC}"
test_endpoint "Ceremony Complete (requires ceremony_id)" \
    "$BASE_URL/api/beta/constellation/complete" \
    "POST" \
    '{"ceremonyId":"test-ceremony-id"}' \
    ".error" \
    "true"

echo -e "\n${PURPLE}=== Phase 5: UI Accessibility Tests ===${NC}"
echo -e "${BLUE}Manual UI Tests:${NC}"
echo "1. Visit: $BASE_URL/beta/graduation"
echo "   • Should show eligibility check or ceremony"
echo "   • Animation should honor prefers-reduced-motion"
echo "   • Skip button should appear in development mode"
echo ""
echo "2. Visit: $BASE_URL/beta/badges"
echo "   • Should show constellation card when ≥5 badges"
echo "   • Should show graduated status if GRADUATED_PIONEER badge present"
echo ""
echo "3. Visit: $BASE_URL/admin/badges"
echo "   • Should show ceremony statistics"
echo "   • Should display recent ceremonies table"

echo -e "\n${PURPLE}=== Phase 6: Environment Configuration ===${NC}"
echo -e "${BLUE}Environment Variables:${NC}"
ENV_VARS=("CEREMONY_ENABLED" "CEREMONY_MIN_BADGES" "NEXT_PUBLIC_CEREMONY_ANIM_MS" "NEXT_PUBLIC_CEREMONY_ALLOW_SKIP_IN_DEV")

for var in "${ENV_VARS[@]}"; do
    if grep -q "^${var}=" .env.local 2>/dev/null; then
        value=$(grep "^${var}=" .env.local | cut -d'=' -f2)
        if [ -n "$value" ]; then
            echo -e "${GREEN}✓${NC} $var is set: $value"
        else
            echo -e "${YELLOW}⚠${NC} $var is set but empty"
        fi
    else
        echo -e "${RED}✗${NC} $var is not set in .env.local"
    fi
done

echo -e "\n${PURPLE}=== Phase 7: Database Verification ===${NC}"
echo -e "${BLUE}Run these SQL queries in Supabase console:${NC}"
echo ""
echo "-- Check constellation definitions"
echo "SELECT code, name, description FROM badge_constellations ORDER BY code;"
echo ""
echo "-- Check for any ceremonies"
echo "SELECT constellation_code, status, COUNT(*) FROM badge_ceremonies GROUP BY constellation_code, status;"
echo ""
echo "-- Check GRADUATED_PIONEER badge"
echo "SELECT * FROM beta_badges_catalog WHERE badge_id = 'GRADUATED_PIONEER';"
echo ""
echo "-- Check recent ceremonies view"
echo "SELECT * FROM v_recent_ceremonies ORDER BY started_at DESC LIMIT 5;"

echo -e "\n${PURPLE}=== Phase 8: Integration Test Scenario ===${NC}"
echo -e "${BLUE}Complete Integration Test (requires auth and sufficient badges):${NC}"
echo ""
echo "1. Ensure test user has ≥5 badges including:"
echo "   • At least one exploration badge (PIONEER, VOICE_VOYAGER, PATHFINDER)"
echo "   • At least one depth badge (THREAD_WEAVER)"
echo "   • Either THREAD_WEAVER or PATTERN_SCOUT"
echo ""
echo "2. Test the full ceremony flow:"
echo "   a) Preview: GET /api/beta/constellation/preview"
echo "   b) Commit:  POST /api/beta/constellation/commit"
echo "   c) Complete: POST /api/beta/constellation/complete with ceremony_id"
echo ""
echo "3. Verify results:"
echo "   • badge_ceremonies table has new completed entry"
echo "   • beta_user_badges table has GRADUATED_PIONEER badge"
echo "   • beta_participants status = 'graduated'"

echo -e "\n${PURPLE}=== Expected Behaviors Summary ===${NC}"

echo -e "\n${GREEN}✓ Constellation System Active:${NC}"
echo "• Database tables and views created successfully"
echo "• Constellation definitions seeded (WAYFINDER, WEAVER, PIONEER)"
echo "• API endpoints handle eligibility checking"
echo "• Ceremony creation and completion flows work"
echo "• GRADUATED_PIONEER badge awarded on completion"

echo -e "\n${BLUE}🎭 Ceremony Animation:${NC}"
echo "• SVG constellation with Framer Motion animations"
echo "• 20-30 second sequenced animation (title → points → links → badges → seal)"
echo "• Accessibility: honors prefers-reduced-motion"
echo "• Development: skip control available"
echo "• Responsive design works on mobile and desktop"

echo -e "\n${YELLOW}🏆 Graduation Flow:${NC}"
echo "• Eligibility: ≥5 badges, exploration + depth categories, key badge present"
echo "• Preview shows constellation and narration lines"
echo "• Commit creates ceremony record and returns visual data"
echo "• Complete awards GRADUATED_PIONEER and updates status"
echo "• Idempotent completion (can call complete multiple times safely)"

echo -e "\n${BLUE}🔧 Manual Verification Steps:${NC}"
echo "1. Run Supabase migration: 20250820140000_badge_constellation.sql"
echo "2. Seed test user with sufficient badges for graduation"
echo "3. Visit $BASE_URL/beta/graduation and complete ceremony"
echo "4. Verify GRADUATED_PIONEER badge appears in $BASE_URL/beta/badges"
echo "5. Check admin dashboard at $BASE_URL/admin/badges for ceremony stats"

echo -e "\n${YELLOW}🚨 Troubleshooting Guide:${NC}"
echo "• No constellation found? Ensure user has ≥5 badges with proper categories"
echo "• Ceremony won't start? Check CEREMONY_ENABLED=true in environment"
echo "• Animation not working? Verify Framer Motion is installed and imported"
echo "• Database errors? Ensure migration applied and RLS policies are correct"
echo "• API failures? Check authentication and badge requirements"

echo -e "\n${GREEN}🎊 Constellation ceremony tests complete!${NC}"
echo "If all tests pass and manual verification succeeds:"
echo "• Users can graduate through animated ceremony"
echo "• Badge constellations form based on earned badges"
echo "• Graduated Pioneer status is properly awarded"
echo "• Admin dashboard shows ceremony analytics"

echo -e "\n${BLUE}Next Steps:${NC}"
echo "• Deploy migration to production Supabase"
echo "• Monitor ceremony completion rates and durations"
echo "• Adjust constellation rules based on user patterns"
echo "• Add more constellation types as system evolves"

echo -e "\n${PURPLE}🌟 Ready for stellar graduation ceremonies! ✨${NC}"