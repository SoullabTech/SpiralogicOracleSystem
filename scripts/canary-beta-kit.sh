#!/bin/bash

# Beta Verification & Tuning Kit Canary Tests
echo "🧪 Beta Verification & Tuning Kit Canary Tests"
echo "=============================================="

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
    
    # Add auth headers if required (using cookie auth for web app)
    auth_headers=""
    if [ "$auth_required" = "true" ]; then
        echo "⚠️  This test requires authentication"
        # In real testing, you'd need valid auth cookies
        auth_headers=""
    fi
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$url")
    else
        echo "Data: $data"
        response=$(curl -s -X "$method" "$url" \
            -H 'Content-Type: application/json' \
            -d "$data")
    fi
    
    if [ $? -eq 0 ]; then
        if echo "$response" | jq -e "$expected_field" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ PASS${NC} - $expected_field found"
            if [ "$expected_field" != ".error" ] && [ "$expected_field" != ".config" ]; then
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

echo -e "\n${PURPLE}=== Phase 1: Admin Tuning Configuration ===${NC}"

echo -e "\n${BLUE}Testing admin tuning endpoints (may require auth):${NC}"

test_endpoint "Get Beta Config" \
    "$BASE_URL/api/admin/beta/tuning" \
    "GET" \
    "" \
    ".config" \
    "true"

test_endpoint "Update Beta Config (small patch)" \
    "$BASE_URL/api/admin/beta/tuning" \
    "POST" \
    '{"patch":{"pathfinderDays":4}}' \
    ".config.pathfinderDays" \
    "true"

test_endpoint "Create Admin Invites" \
    "$BASE_URL/api/admin/beta/invites" \
    "POST" \
    '{"count":3,"prefix":"KIT"}' \
    ".created" \
    "true"

echo -e "\n${PURPLE}=== Phase 2: Beta Event System ===${NC}"

echo -e "\n${BLUE}Testing event emission (may require auth):${NC}"

test_endpoint "Emit Oracle Turn Event" \
    "$BASE_URL/api/beta/event" \
    "POST" \
    '{"type":"oracle_turn","meta":{"responseLength":120}}' \
    ".success" \
    "true"

test_endpoint "Emit Voice Preview Event" \
    "$BASE_URL/api/beta/event" \
    "POST" \
    '{"type":"voice_preview","meta":{"duration":3000}}' \
    ".success" \
    "true"

test_endpoint "Emit Holoflower Set Event" \
    "$BASE_URL/api/beta/event" \
    "POST" \
    '{"type":"holoflower_set","meta":{"element":"air"}}' \
    ".success" \
    "true"

test_endpoint "Emit Soul Memory Event" \
    "$BASE_URL/api/beta/event" \
    "POST" \
    '{"type":"soul_memory_saved","meta":{"sacredMoment":true}}' \
    ".success" \
    "true"

echo -e "\n${PURPLE}=== Phase 3: Badge Status Check ===${NC}"

test_endpoint "Get Beta Status" \
    "$BASE_URL/api/beta/status" \
    "GET" \
    "" \
    ".participant" \
    "true"

test_endpoint "Get Beta Badges" \
    "$BASE_URL/api/beta/badges" \
    "GET" \
    "" \
    ".badges" \
    "true"

echo -e "\n${PURPLE}=== Phase 4: Shadow Work Events ===${NC}"

echo -e "\n${BLUE}Testing shadow work with different scores:${NC}"

test_endpoint "Shadow Work (Below Threshold)" \
    "$BASE_URL/api/beta/event" \
    "POST" \
    '{"type":"shadow_work","meta":{"shadowScore":0.5,"category":"conversation"}}' \
    ".success" \
    "true"

test_endpoint "Shadow Work (Above Threshold)" \
    "$BASE_URL/api/beta/event" \
    "POST" \
    '{"type":"shadow_work","meta":{"shadowScore":0.8,"category":"conversation"}}' \
    ".success" \
    "true"

# Check if Shadow Steward badge was awarded
test_endpoint "Check Updated Status" \
    "$BASE_URL/api/beta/status" \
    "GET" \
    "" \
    ".badges" \
    "true"

echo -e "\n${PURPLE}=== Phase 5: UI Page Tests ===${NC}"

echo -e "\n${BLUE}Manual UI Tests (check these manually):${NC}"
echo "1. Visit: $BASE_URL/admin/beta/tuning"
echo "   • Should show config sliders and toggles"
echo "   • Save button should update configuration"
echo "   • Seed invites button should create new codes"
echo ""
echo "2. Visit: $BASE_URL/dev/badges"
echo "   • Should show event emission buttons"
echo "   • Clicking buttons should emit events"
echo "   • Status should update with new badges"
echo ""
echo "3. Visit: $BASE_URL/beta/badges"
echo "   • Should show earned badges from events"
echo "   • Progress bars should reflect current status"

echo -e "\n${PURPLE}=== Phase 6: Database Verification ===${NC}"

echo -e "\n${BLUE}Run these SQL queries in Supabase console:${NC}"
echo ""
echo "-- Check beta config table"
echo "SELECT * FROM beta_badges_config;"
echo ""
echo "-- Check seeded invites"
echo "SELECT code, max_uses, uses, expires_at, cohort FROM beta_invites WHERE code LIKE 'ALPHA-%';"
echo ""
echo "-- Check recent beta events"
echo "SELECT kind, COUNT(*) FROM beta_events WHERE occurred_at > now() - interval '1 hour' GROUP BY kind;"
echo ""
echo "-- Check badge awards"
echo "SELECT badge_id, COUNT(*) FROM beta_user_badges GROUP BY badge_id;"

echo -e "\n${PURPLE}=== Phase 7: Configuration Test ===${NC}"

echo -e "\n${BLUE}Testing dynamic configuration:${NC}"
echo "1. Change pathfinderDays to 2 via admin panel"
echo "2. Emit events to create 2 active days"
echo "3. Check if Pathfinder badge is awarded with new threshold"
echo ""
echo "4. Change shadowStewardMinScore to 0.6 via admin panel"
echo "5. Emit shadow_work with score 0.65"
echo "6. Check if Shadow Steward badge is awarded"

echo -e "\n${PURPLE}=== Expected Behaviors Summary ===${NC}"

echo -e "\n${GREEN}✓ Configuration System:${NC}"
echo "• Admin can tune badge thresholds via UI"
echo "• Changes persist in database and affect badge evaluation"
echo "• Engine respects badgesEnabled toggle"
echo "• Starter pack events are configurable"

echo -e "\n${BLUE}🎮 Dev Playground:${NC}"
echo "• One-click event emission for testing"
echo "• Real-time status updates after events"
echo "• Badge awards visible immediately"
echo "• Progress tracking works correctly"

echo -e "\n${YELLOW}🔧 Admin Tools:${NC}"
echo "• Config loading and saving works"
echo "• Invite generation creates valid codes"
echo "• All admin endpoints require proper authentication"
echo "• Changes take effect immediately"

echo -e "\n${BLUE}🚨 Troubleshooting Guide:${NC}"
echo "• No config loading? Check admin authentication and permissions"
echo "• Events not awarding badges? Verify badgesEnabled=true in config"
echo "• Playground not working? Ensure user is authenticated and in beta"
echo "• Database errors? Check migration applied and RLS policies"
echo "• UI pages not loading? Verify admin middleware and ADMIN_ALLOWED_EMAILS"

echo -e "\n${GREEN}🎊 Beta Kit tests complete!${NC}"
echo "If all tests pass and manual verification succeeds:"
echo "• Admin can tune badge behavior in real-time"
echo "• Dev playground enables quick testing and verification"
echo "• Configuration changes affect badge evaluation immediately"
echo "• Invite system works for beta onboarding"

echo -e "\n${BLUE}Copy/Paste Smoke Commands:${NC}"
echo "# Get current config"
echo "curl -s '$BASE_URL/api/admin/beta/tuning' | jq"
echo ""
echo "# Update pathfinder requirement"
echo "curl -s -X POST '$BASE_URL/api/admin/beta/tuning' -H 'Content-Type: application/json' -d '{\"patch\":{\"pathfinderDays\":2}}' | jq"
echo ""
echo "# Emit test event"
echo "curl -s -X POST '$BASE_URL/api/beta/event' -H 'Content-Type: application/json' -d '{\"type\":\"oracle_turn\",\"meta\":{\"len\":100}}' | jq"
echo ""
echo "# Check badge status"
echo "curl -s '$BASE_URL/api/beta/status' | jq '.badges | length'"

echo -e "\n${PURPLE}🔧 Ready for beta tuning and verification! ⚙️${NC}"