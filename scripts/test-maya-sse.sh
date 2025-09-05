#!/bin/bash

# Maya SSE Streaming Test Script
# Tests the conversational streaming endpoint with TTS

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔮 Maya SSE Streaming Test${NC}"
echo "================================="
echo ""

# Step 1: Test the streaming endpoint
echo -e "${CYAN}Testing SSE streaming endpoint...${NC}"

# Create a simple test using curl with SSE
curl -N -H "Accept: text/event-stream" \
  "http://localhost:3002/api/v1/converse/stream?element=aether&userId=test-user&sessionId=test-session&q=Hello%20Maya,%20can%20you%20hear%20me?" \
  2>/dev/null | while IFS= read -r line
do
  if [[ "$line" == data:* ]]; then
    # Extract the JSON data after "data: "
    json="${line#data: }"
    echo -e "${GREEN}Received:${NC} $json"
    
    # Check for TTS audio URL
    if echo "$json" | grep -q "audioUrl"; then
      echo -e "${YELLOW}✅ Found audio URL in response!${NC}"
    fi
    
    # Check for complete event
    if echo "$json" | grep -q "complete"; then
      echo -e "${GREEN}✅ Stream completed successfully${NC}"
      break
    fi
  elif [[ "$line" == event:* ]]; then
    event="${line#event: }"
    echo -e "${CYAN}Event type: $event${NC}"
  fi
done

echo ""
echo -e "${YELLOW}=================================${NC}"
echo -e "${CYAN}Test complete!${NC}"
echo ""
echo "If you see audio URLs above, TTS is working!"
echo "If not, check backend logs for TTS errors."