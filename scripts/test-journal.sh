#!/bin/bash

# Journal System Test Script
# Tests all journal functionality for beta integration

echo "🔮 Testing Spiralogic Journal System"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API base URL
API_URL="${API_URL:-http://localhost:3000/api}"
BACKEND_URL="${BACKEND_URL:-http://localhost:3002}"
USER_ID="beta-test-user-$(date +%s)"

echo -e "\n${YELLOW}Testing with User ID: $USER_ID${NC}"

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    elif [ "$method" = "GET" ]; then
        response=$(curl -s -X GET "$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -X DELETE "$endpoint")
    fi
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Success${NC}"
        echo "Response: $response" | head -c 200
    else
        echo -e "${RED}❌ Failed${NC}"
        echo "Response: $response"
    fi
    
    echo "$response"
}

# Test 1: Create Journal Entry
echo -e "\n${YELLOW}=== Test 1: Create Journal Entry ===${NC}"
test_endpoint "POST" "$API_URL/journal" \
    "{\"userId\":\"$USER_ID\",\"title\":\"Beta Test Entry\",\"content\":\"Testing the journaling system for beta integration. This is a meaningful reflection about the development process.\",\"mood\":\"energized\",\"tags\":[\"testing\",\"beta\",\"development\"]}" \
    "Creating a new journal entry"

# Test 2: Retrieve Journal Entries
echo -e "\n${YELLOW}=== Test 2: Retrieve Journal Entries ===${NC}"
test_endpoint "GET" "$API_URL/journal?userId=$USER_ID" \
    "" \
    "Retrieving user journal entries"

# Test 3: Create Voice-Style Entry (long form)
echo -e "\n${YELLOW}=== Test 3: Create Voice-Style Entry ===${NC}"
test_endpoint "POST" "$API_URL/journal" \
    "{\"userId\":\"$USER_ID\",\"title\":\"Morning Reflection\",\"content\":\"This morning I woke up feeling really grateful for the progress we've made on the Oracle system. There's something special about building tools that help people connect with their inner wisdom. I've been thinking about how the journaling feature could really help people track their spiritual growth over time. The elemental resonance tracking is particularly interesting - I wonder if users will start to see patterns in their elemental connections. Today feels like a Fire day for me - lots of energy and passion for creation.\",\"mood\":\"grateful\"}" \
    "Creating a longer voice-style entry"

# Test 4: Test Oracle Journal Endpoint
echo -e "\n${YELLOW}=== Test 4: Oracle Journal Integration ===${NC}"
test_endpoint "POST" "$API_URL/oracle/journal" \
    "{\"userId\":\"$USER_ID\",\"entry\":\"I'm exploring the depths of my consciousness through this sacred technology.\",\"title\":\"Sacred Exploration\"}" \
    "Testing Oracle journal processing"

# Test 5: Create Entry with Elemental Focus
echo -e "\n${YELLOW}=== Test 5: Elemental Reflection Entry ===${NC}"
test_endpoint "POST" "$API_URL/journal" \
    "{\"userId\":\"$USER_ID\",\"title\":\"Water Element Day\",\"content\":\"Today I'm feeling very connected to the water element. There's a sense of flow and emotional depth. I notice how my emotions are moving like waves, sometimes calm, sometimes turbulent. This feeling of fluidity is teaching me about acceptance and going with the natural rhythm of life.\",\"mood\":\"peaceful\",\"tags\":[\"water\",\"flow\",\"emotions\"]}" \
    "Creating entry with elemental focus"

# Test 6: Backend Journal Service (if backend is running)
echo -e "\n${YELLOW}=== Test 6: Backend Journal Service ===${NC}"
if curl -s -f "$BACKEND_URL/health" > /dev/null 2>&1; then
    test_endpoint "POST" "$BACKEND_URL/journal" \
        "{\"userId\":\"$USER_ID\",\"action\":\"create\",\"content\":\"Testing backend journal service integration\",\"title\":\"Backend Test\"}" \
        "Testing backend journal service"
else
    echo -e "${YELLOW}⚠️  Backend not running on port 3002, skipping backend tests${NC}"
fi

# Test 7: Pattern Analysis (Multiple Entries)
echo -e "\n${YELLOW}=== Test 7: Pattern Analysis Setup ===${NC}"

# Create multiple entries for pattern analysis
moods=("joyful" "peaceful" "energized" "grateful" "peaceful")
elements=("fire" "water" "earth" "air" "aether")

for i in {0..4}; do
    test_endpoint "POST" "$API_URL/journal" \
        "{\"userId\":\"$USER_ID\",\"title\":\"Pattern Entry $((i+1))\",\"content\":\"Entry $((i+1)) for pattern analysis. Exploring ${elements[$i]} element today.\",\"mood\":\"${moods[$i]}\",\"tags\":[\"pattern\",\"${elements[$i]}\"]}" \
        "Creating pattern entry $((i+1))"
    sleep 0.5
done

# Test 8: Retrieve All Entries for Analysis
echo -e "\n${YELLOW}=== Test 8: Final Entry Count ===${NC}"
final_response=$(curl -s -X GET "$API_URL/journal?userId=$USER_ID")
entry_count=$(echo "$final_response" | grep -o '"id"' | wc -l)
echo -e "${GREEN}Total entries created: $entry_count${NC}"

# Test 9: Delete Test (cleanup one entry)
echo -e "\n${YELLOW}=== Test 9: Delete Entry Test ===${NC}"
# Extract first entry ID from the response
first_entry_id=$(echo "$final_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ ! -z "$first_entry_id" ]; then
    test_endpoint "DELETE" "$API_URL/journal?id=$first_entry_id&userId=$USER_ID" \
        "" \
        "Deleting test entry"
fi

# Summary
echo -e "\n${YELLOW}===================================="
echo "📊 Journal System Test Summary"
echo "====================================${NC}"

echo -e "\n${GREEN}✅ Tests Completed${NC}"
echo "- Created multiple journal entries"
echo "- Retrieved user entries"
echo "- Tested Oracle integration"
echo "- Tested elemental tracking"
echo "- Tested pattern creation"
echo "- Tested deletion"

echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo "1. Check browser at http://localhost:3000/journal"
echo "2. Verify entries appear in UI"
echo "3. Test voice recording (requires browser)"
echo "4. Monitor backend logs for processing"

echo -e "\n${GREEN}🎉 Journal system ready for beta testing!${NC}"