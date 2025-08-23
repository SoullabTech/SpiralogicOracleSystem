#!/bin/bash

# Beta Badges System Canary Tests
echo "🏆 Beta Badges System Canary Tests"
echo "=================================="

BASE_URL="http://localhost:3000"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
            if [ "$expected_field" != ".ok" ] && [ "$expected_field" != ".status" ]; then
                echo "$response" | jq "$expected_field" 2>/dev/null || echo "Response: $response"
            fi
        else
            echo -e "${RED}✗ FAIL${NC} - $expected_field not found"
            echo "Response: $response"
        fi
    else
        echo -e "${RED}✗ FAIL${NC} - Request failed"
    fi
}

echo -e "\n${YELLOW}=== Test 1: Badge API Health Check ===${NC}"
test_endpoint "Badge API Health" \
    "$BASE_URL/api/beta/badges" \
    "HEAD" \
    "" \
    ".status" \
    "false"

echo -e "\n${YELLOW}=== Test 2: Database Migration Verification ===${NC}"
echo -e "${BLUE}Checking if badge tables exist (manual verification needed):${NC}"
echo "1. Check Supabase console for these tables:"
echo "   • beta_events"
echo "   • beta_badges" 
echo "   • beta_user_badges"
echo "2. Verify views exist:"
echo "   • v_beta_progress"
echo "   • v_badge_stats"
echo "   • v_recent_awards"

echo -e "\n${YELLOW}=== Test 3: Badge Catalog Population ===${NC}"
echo -e "${BLUE}Expected badges in catalog:${NC}"
echo "• PIONEER (Beta Pioneer)"
echo "• THREAD_WEAVER (Thread Weaver)"
echo "• MIRROR_MAKER (Mirror Maker)"
echo "• VOICE_VOYAGER (Voice Voyager)"
echo "• SOUL_KEEPER (Soul Keeper)"
echo "• PATHFINDER (Pathfinder)"
echo "• PATTERN_SCOUT (Pattern Scout)"
echo "• SHADOW_STEWARD (Shadow Steward)"
echo "• FEEDBACK_FRIEND (Feedback Friend)"

echo -e "\n${YELLOW}=== Test 4: Event Emission (requires auth) ===${NC}"
test_endpoint "Admin Feedback Event" \
    "$BASE_URL/api/beta/badges" \
    "POST" \
    '{"action":"emit_event","data":{"event":{"kind":"admin_feedback","detail":{"type":"positive","sentiment":"positive"}}}}' \
    ".success" \
    "true"

echo -e "\n${YELLOW}=== Test 5: Badge Evaluation (requires auth) ===${NC}"
test_endpoint "Badge Evaluation" \
    "$BASE_URL/api/beta/badges" \
    "POST" \
    '{"action":"evaluate","data":{}}' \
    ".success" \
    "true"

echo -e "\n${YELLOW}=== Test 6: Badge Collection Fetch (requires auth) ===${NC}"
test_endpoint "Badge Collection" \
    "$BASE_URL/api/beta/badges?action=collection" \
    "GET" \
    "" \
    ".badges" \
    "true"

echo -e "\n${YELLOW}=== Test 7: Badge Progress Fetch (requires auth) ===${NC}"
test_endpoint "Badge Progress" \
    "$BASE_URL/api/beta/badges?action=progress" \
    "GET" \
    "" \
    ".progress" \
    "true"

echo -e "\n${YELLOW}=== Test 8: Oracle Turn with Badge Events ===${NC}"
test_endpoint "Oracle Turn (should emit beta events)" \
    "$BASE_URL/api/oracle/turn" \
    "POST" \
    '{"input":{"text":"I want to explore my creativity and find my voice"},"meta":{"source":"text"}}' \
    ".response.text" \
    "false"

echo -e "\n${YELLOW}=== Test 9: Beta Feedback with Badge Event ===${NC}"
echo -e "${BLUE}Manual test: Visit $BASE_URL/beta/feedback${NC}"
echo "• Fill out feedback form with rating 4-5 stars"
echo "• Submit form"
echo "• Check database for admin_feedback event"

echo -e "\n${YELLOW}=== Environment & Configuration Checks ===${NC}"

# Check critical environment variables
echo -e "\n${BLUE}Environment Variables:${NC}"
ENV_VARS=("NEXT_PUBLIC_SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY")

for var in "${ENV_VARS[@]}"; do
    if grep -q "^${var}=" .env.local 2>/dev/null; then
        value=$(grep "^${var}=" .env.local | cut -d'=' -f2)
        if [ -n "$value" ]; then
            echo -e "${GREEN}✓${NC} $var is set"
        else
            echo -e "${YELLOW}⚠${NC} $var is set but empty"
        fi
    else
        echo -e "${RED}✗${NC} $var is not set in .env.local"
    fi
done

echo -e "\n${YELLOW}=== Manual Database Verification ===${NC}"
echo -e "${BLUE}Run these SQL queries in Supabase console:${NC}"
echo "-- Check badge catalog"
echo "SELECT * FROM beta_badges ORDER BY code;"
echo ""
echo "-- Check for any events"
echo "SELECT kind, COUNT(*) FROM beta_events GROUP BY kind;"
echo ""
echo "-- Check user progress"
echo "SELECT * FROM v_beta_progress LIMIT 5;"
echo ""
echo "-- Check badge awards"
echo "SELECT bb.name, COUNT(bub.user_id) as awarded_count"
echo "FROM beta_badges bb"
echo "LEFT JOIN beta_user_badges bub ON bb.code = bub.badge_code"
echo "GROUP BY bb.code, bb.name;"

echo -e "\n${YELLOW}=== Badge System Integration Points ===${NC}"
echo -e "${BLUE}Verify these integration points are working:${NC}"
echo "• Oracle turn pipeline emits oracle_turn events"
echo "• Oracle turn pipeline emits thread_weave events when synthesis occurs"
echo "• Oracle turn pipeline emits soul_memory_saved events"
echo "• Feedback form emits admin_feedback events"
echo "• Voice components emit voice_preview events"
echo "• Holoflower components emit holoflower_set events"

echo -e "\n${YELLOW}=== Expected Behaviors Summary ===${NC}"

echo -e "\n${GREEN}✓ Badge System Active:${NC}"
echo "• Database tables and views created successfully"
echo "• Badge catalog populated with 9 tasteful badges"
echo "• Event emission working for all touch points"
echo "• Badge evaluation engine processes user progress"
echo "• API endpoints handle badge operations correctly"

echo -e "\n${BLUE}🏆 Badge Categories & Rules:${NC}"
echo "• exploration: PIONEER, VOICE_VOYAGER, PATHFINDER"
echo "• depth: THREAD_WEAVER"
echo "• insight: MIRROR_MAKER, PATTERN_SCOUT"
echo "• care: SOUL_KEEPER, SHADOW_STEWARD"
echo "• systems: FEEDBACK_FRIEND"

echo -e "\n${YELLOW}🎯 Badge Earning Conditions:${NC}"
echo "• PIONEER: 3+ active days + voice use + holoflower tuning"
echo "• THREAD_WEAVER: Synthesis when stories connect"
echo "• MIRROR_MAKER: 3+ holoflower adjustments"
echo "• VOICE_VOYAGER: 2+ voice interactions"
echo "• SOUL_KEEPER: Save meaningful soul memory"
echo "• PATHFINDER: 7+ active days"
echo "• PATTERN_SCOUT: Surface discoverable pattern"
echo "• SHADOW_STEWARD: Handle shadow work (score ≥0.7)"
echo "• FEEDBACK_FRIEND: 3+ feedback submissions"

echo -e "\n${BLUE}🔧 Manual Verification Steps:${NC}"
echo "1. Visit $BASE_URL/beta/badges for badge collection UI"
echo "2. Have multiple Oracle conversations to generate events"
echo "3. Use voice features to trigger voice_preview events"
echo "4. Submit feedback to trigger admin_feedback events"
echo "5. Check badge progress and awards in database"

echo -e "\n${YELLOW}🚨 Troubleshooting Guide:${NC}"
echo "• No events recorded? Check authentication in Oracle turn pipeline"
echo "• Badge evaluation not working? Verify Supabase permissions"
echo "• UI not loading? Check API endpoints and authentication"
echo "• Database errors? Ensure migration applied successfully"
echo "• Events not triggering? Check integration point implementations"

echo -e "\n${GREEN}🎊 Badge system canary tests complete!${NC}"
echo "If all tests pass and manual verification succeeds:"
echo "• Users can earn badges through meaningful interactions"
echo "• Badge progress is tracked automatically"
echo "• Toast notifications appear for new badges"
echo "• Collection page shows earned badges and progress"

echo -e "\n${BLUE}Next Steps:${NC}"
echo "• Deploy migration to production Supabase"
echo "• Monitor badge earning patterns in production"
echo "• Adjust badge rules based on user behavior"
echo "• Add more badge categories as system evolves"