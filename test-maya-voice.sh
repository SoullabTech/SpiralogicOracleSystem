#!/bin/bash

# Maya Voice System Test Script
# Tests all components of the voice system

echo "🎭 Maya Voice System Test Suite"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
check_server() {
    echo -n "Checking if server is running... "
    curl -s http://localhost:3000 > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Server is running${NC}"
        return 0
    else
        echo -e "${RED}✗ Server not running${NC}"
        echo "Please start the server with: npm run dev"
        return 1
    fi
}

# Test Maya Voice API
test_maya_api() {
    echo -n "Testing Maya Voice API... "
    response=$(curl -s -X POST http://localhost:3000/api/maya-voice \
        -H "Content-Type: application/json" \
        -d '{
            "transcript": "Hello Maya, how are you today?",
            "sessionId": "test-session-'$(date +%s)'",
            "context": {
                "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
                "source": "test"
            }
        }' 2>/dev/null)

    if echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✓ API responding correctly${NC}"
        echo "  Response preview: $(echo $response | jq -r '.response' 2>/dev/null | head -c 50)..."
        return 0
    else
        echo -e "${RED}✗ API error${NC}"
        echo "  Error: $response"
        return 1
    fi
}

# Test TTS API
test_tts_api() {
    echo -n "Testing TTS API... "

    # Create temp file
    temp_file="/tmp/maya-tts-test-$(date +%s).mp3"

    # Request TTS
    curl -s -X POST http://localhost:3000/api/tts \
        -H "Content-Type: application/json" \
        -d '{
            "text": "This is a test of the Maya voice system.",
            "voice": "alloy",
            "speed": 1.0
        }' \
        --output "$temp_file" 2>/dev/null

    # Check if file was created and has content
    if [ -f "$temp_file" ] && [ -s "$temp_file" ]; then
        file_size=$(ls -lh "$temp_file" | awk '{print $5}')
        echo -e "${GREEN}✓ TTS generated successfully (${file_size})${NC}"
        rm "$temp_file"
        return 0
    else
        echo -e "${RED}✗ TTS generation failed${NC}"
        [ -f "$temp_file" ] && rm "$temp_file"
        return 1
    fi
}

# Test Session Storage
test_session_storage() {
    echo -n "Testing Session Storage... "

    session_id="test-session-$(date +%s)"

    # Create a session with a message
    curl -s -X POST http://localhost:3000/api/maya-voice \
        -H "Content-Type: application/json" \
        -d "{
            \"transcript\": \"Test message for session\",
            \"sessionId\": \"$session_id\"
        }" > /dev/null 2>&1

    # Retrieve session
    response=$(curl -s "http://localhost:3000/api/maya-voice?sessionId=$session_id" 2>/dev/null)

    if echo "$response" | grep -q "history"; then
        echo -e "${GREEN}✓ Session storage working${NC}"
        return 0
    else
        echo -e "${RED}✗ Session storage error${NC}"
        echo "  Response: $response"
        return 1
    fi
}

# Test Environment Variables
test_environment() {
    echo "Checking environment variables..."

    missing_vars=0

    # Check OpenAI key
    if [ -f .env.local ]; then
        if grep -q "OPENAI_API_KEY=sk-" .env.local; then
            echo -e "  ${GREEN}✓ OpenAI API key configured${NC}"
        else
            echo -e "  ${RED}✗ OpenAI API key not configured${NC}"
            missing_vars=$((missing_vars + 1))
        fi

        if grep -q "ANTHROPIC_API_KEY=" .env.local; then
            echo -e "  ${GREEN}✓ Anthropic API key configured${NC}"
        else
            echo -e "  ${YELLOW}⚠ Anthropic API key not configured (optional)${NC}"
        fi
    else
        echo -e "  ${RED}✗ .env.local file not found${NC}"
        missing_vars=$((missing_vars + 1))
    fi

    return $missing_vars
}

# Main test execution
main() {
    echo ""

    # Check environment
    test_environment
    env_result=$?

    if [ $env_result -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}Warning: Some environment variables are missing${NC}"
        echo "Please configure your .env.local file"
        echo ""
    fi

    # Check server
    if ! check_server; then
        exit 1
    fi

    echo ""
    echo "Running API Tests..."
    echo "-------------------"

    # Run tests
    test_maya_api
    maya_result=$?

    test_tts_api
    tts_result=$?

    test_session_storage
    session_result=$?

    # Summary
    echo ""
    echo "Test Summary"
    echo "============"

    total_tests=3
    passed_tests=0

    [ $maya_result -eq 0 ] && passed_tests=$((passed_tests + 1))
    [ $tts_result -eq 0 ] && passed_tests=$((passed_tests + 1))
    [ $session_result -eq 0 ] && passed_tests=$((passed_tests + 1))

    if [ $passed_tests -eq $total_tests ]; then
        echo -e "${GREEN}✓ All tests passed! ($passed_tests/$total_tests)${NC}"
        echo ""
        echo "🎉 Maya Voice System is ready for use!"
        echo "Access the interface at: http://localhost:3000/maya"
    else
        echo -e "${YELLOW}⚠ Some tests failed ($passed_tests/$total_tests passed)${NC}"
        echo ""
        echo "Please review the errors above and check:"
        echo "1. Your API keys in .env.local"
        echo "2. The server logs for errors"
        echo "3. That all dependencies are installed (npm install)"
    fi

    echo ""
}

# Run main function
main