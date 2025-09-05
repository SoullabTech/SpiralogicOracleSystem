#!/bin/bash

# Test Sesame CSM server
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Testing Sesame CSM Server${NC}"
echo "============================"

SERVER_URL="http://localhost:8000"

# Test 1: Health check
echo -e "\n${YELLOW}1. Testing health endpoint...${NC}"
health_response=$(curl -s "$SERVER_URL/health" || echo "FAILED")

if [[ $health_response == *"healthy"* ]]; then
    echo -e "${GREEN}✅ Server is healthy${NC}"
    echo "$health_response" | jq . 2>/dev/null || echo "$health_response"
elif [[ $health_response == "FAILED" ]]; then
    echo -e "${RED}❌ Server is not running${NC}"
    echo "Start the server with: ./scripts/run-sesame-server.sh"
    exit 1
else
    echo -e "${YELLOW}⚠️  Server responded but may have issues${NC}"
    echo "$health_response" | jq . 2>/dev/null || echo "$health_response"
fi

# Test 2: Generate speech
echo -e "\n${YELLOW}2. Testing speech generation...${NC}"

# Create test payload
test_payload='{
    "text": "Hello from Sesame CSM! This is a test of text to speech generation.",
    "speaker_id": 0,
    "max_audio_length_ms": 5000,
    "format": "wav"
}'

# Make request
echo "Sending request to $SERVER_URL/generate"
generation_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$test_payload" \
    "$SERVER_URL/generate" || echo "FAILED")

if [[ $generation_response == "FAILED" ]]; then
    echo -e "${RED}❌ Request failed${NC}"
    exit 1
elif [[ $generation_response == *'"success":true'* ]]; then
    echo -e "${GREEN}✅ Speech generation successful!${NC}"
    
    # Extract information
    duration=$(echo "$generation_response" | jq -r '.duration_ms // "unknown"' 2>/dev/null)
    sample_rate=$(echo "$generation_response" | jq -r '.sample_rate // "unknown"' 2>/dev/null)
    audio_file=$(echo "$generation_response" | jq -r '.audio_data // "unknown"' 2>/dev/null)
    
    echo "Duration: ${duration}ms"
    echo "Sample Rate: ${sample_rate}Hz"
    echo "Audio file: $audio_file"
    
    # Check if audio file exists
    if [ -f "sesame-csm/$audio_file" ]; then
        echo -e "${GREEN}✓ Audio file created${NC}"
        
        # Try to get file info
        if command -v ffprobe &> /dev/null; then
            echo -e "\nAudio file details:"
            ffprobe -v quiet -show_format -show_streams "sesame-csm/$audio_file" 2>/dev/null || echo "Could not analyze audio file"
        fi
        
        # Try to play on macOS
        if [ "$(uname)" = "Darwin" ] && command -v afplay &> /dev/null; then
            echo -e "\n${YELLOW}🔊 Playing generated audio...${NC}"
            afplay "sesame-csm/$audio_file" || echo "Could not play audio"
        fi
    fi
else
    echo -e "${RED}❌ Speech generation failed${NC}"
    echo "$generation_response" | jq . 2>/dev/null || echo "$generation_response"
fi

# Test 3: Test with different parameters
echo -e "\n${YELLOW}3. Testing with different parameters...${NC}"

test_payload2='{
    "text": "This is a shorter test.",
    "speaker_id": 1,
    "max_audio_length_ms": 3000,
    "format": "base64"
}'

generation_response2=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$test_payload2" \
    "$SERVER_URL/generate" || echo "FAILED")

if [[ $generation_response2 == *'"success":true'* ]]; then
    echo -e "${GREEN}✅ Second test successful${NC}"
else
    echo -e "${YELLOW}⚠️  Second test had issues${NC}"
    echo "$generation_response2" | jq . 2>/dev/null || echo "$generation_response2"
fi

echo -e "\n============================"
echo -e "${GREEN}Testing complete!${NC}"
echo ""
echo "Server endpoints:"
echo "  - Health: $SERVER_URL/health"
echo "  - Generate: $SERVER_URL/generate"
echo "  - API docs: $SERVER_URL/docs"