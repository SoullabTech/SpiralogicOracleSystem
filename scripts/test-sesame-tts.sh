#!/bin/bash

# Test Sesame CSM-1B Text-to-Speech model
# This script tests the TTS API and saves audio output

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎤 Testing Sesame CSM-1B Text-to-Speech${NC}"
echo "========================================"

# Load environment variables from .env.local
if [ -f .env.local ]; then
    export $(grep -E '^(SESAME_URL|SESAME_API_KEY)=' .env.local | xargs)
else
    echo -e "${RED}❌ Error: .env.local not found${NC}"
    exit 1
fi

# Set the correct URL for Sesame CSM-1B
SESAME_TTS_URL="https://api-inference.huggingface.co/models/sesame/csm-1b"

if [ -z "$SESAME_API_KEY" ]; then
    echo -e "${RED}❌ Error: SESAME_API_KEY not found in .env.local${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment configured${NC}"
echo "Model URL: $SESAME_TTS_URL"
echo "API Key: ${SESAME_API_KEY:0:10}..."

# Create output directory for audio files
mkdir -p audio_output

# Test text for TTS
TEST_TEXT="Hello, I am Maya from the Spiralogic Oracle System. Welcome to the sacred mirror experience."

echo -e "\n${YELLOW}📡 Generating speech...${NC}"
echo "Text: \"$TEST_TEXT\""

# Make TTS request
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="audio_output/sesame_test_${TIMESTAMP}.wav"

# Make the API request and save audio
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  -H "Authorization: Bearer $SESAME_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"inputs\":\"$TEST_TEXT\"}" \
  "$SESAME_TTS_URL" \
  -o "$OUTPUT_FILE.tmp" 2>&1)

HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1 | cut -d':' -f2)

if [ "$HTTP_STATUS" = "200" ]; then
    # Check if we got audio data
    if [ -f "$OUTPUT_FILE.tmp" ] && [ -s "$OUTPUT_FILE.tmp" ]; then
        # Check if it's JSON (error) or binary (audio)
        if file "$OUTPUT_FILE.tmp" | grep -q "JSON\|ASCII"; then
            echo -e "${RED}❌ Got error response instead of audio:${NC}"
            cat "$OUTPUT_FILE.tmp" | jq . 2>/dev/null || cat "$OUTPUT_FILE.tmp"
            rm -f "$OUTPUT_FILE.tmp"
        else
            mv "$OUTPUT_FILE.tmp" "$OUTPUT_FILE"
            echo -e "${GREEN}✅ Success! Audio generated${NC}"
            echo "Output saved to: $OUTPUT_FILE"
            echo "File size: $(ls -lh "$OUTPUT_FILE" | awk '{print $5}')"
            
            # Try to play if on macOS
            if [ "$(uname)" = "Darwin" ]; then
                echo -e "\n${YELLOW}Playing audio...${NC}"
                afplay "$OUTPUT_FILE" 2>/dev/null || echo "Could not play audio automatically"
            fi
        fi
    else
        echo -e "${RED}❌ No audio data received${NC}"
        rm -f "$OUTPUT_FILE.tmp"
    fi
elif [ "$HTTP_STATUS" = "503" ]; then
    echo -e "${YELLOW}⏳ Model is loading (503)${NC}"
    echo "Please wait a minute and try again. First requests can take 20-30 seconds."
    rm -f "$OUTPUT_FILE.tmp"
elif [ "$HTTP_STATUS" = "404" ]; then
    echo -e "${RED}❌ Model not found (404)${NC}"
    echo "The model 'sesame/csm-1b' might not be available via the inference API"
    rm -f "$OUTPUT_FILE.tmp"
else
    echo -e "${RED}❌ Request failed (HTTP $HTTP_STATUS)${NC}"
    if [ -f "$OUTPUT_FILE.tmp" ]; then
        cat "$OUTPUT_FILE.tmp"
        rm -f "$OUTPUT_FILE.tmp"
    fi
fi

echo -e "\n========================================"
echo -e "${BLUE}Configuration for .env.local:${NC}"
echo "SESAME_URL=$SESAME_TTS_URL"
echo "SESAME_API_KEY=hf_YOUR_API_KEY_HERE"
echo ""
echo "Note: Sesame CSM-1B is a text-to-speech model."
echo "For text generation, use a different model."