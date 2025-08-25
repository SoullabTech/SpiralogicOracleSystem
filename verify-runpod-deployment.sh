#!/bin/bash

# RunPod Sesame TTS Deployment Verification Script

echo "🚀 RunPod Sesame TTS Deployment Verification"
echo "==========================================="
echo

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check file size
check_file_size() {
    local file=$1
    if [ -f "$file" ]; then
        local size_bytes=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
        local size_kb=$((size_bytes / 1024))
        
        if [ $size_bytes -eq 0 ]; then
            echo -e "${RED}❌ 0 bytes - Route timed out${NC}"
            echo "   Fix: Increase execution timeout in RunPod (≥120s)"
        elif [ $size_bytes -lt 100 ]; then
            echo -e "${RED}❌ ~33 bytes - JSON error saved as audio${NC}"
            echo "   Fix: Use ?debug=1 to see the actual error"
        elif [ $size_kb -lt 15 ]; then
            echo -e "${YELLOW}⚠️  ~${size_kb}KB - Fallback tone (model didn't load)${NC}"
            echo "   Fix: Check worker logs for error after 'Loading Sesame TTS model...'"
        else
            echo -e "${GREEN}✅ ${size_kb}KB - Real audio generated!${NC}"
            
            # Check WAV header
            if command -v xxd &> /dev/null; then
                local header=$(xxd -l 4 -p "$file" 2>/dev/null)
                if [ "$header" = "52494646" ]; then
                    echo -e "${GREEN}✅ Valid WAV header (RIFF)${NC}"
                fi
            fi
        fi
    else
        echo -e "${RED}❌ File not created${NC}"
    fi
}

echo "📋 Pre-flight Checklist:"
echo "------------------------"
echo "[ ] RunPod env vars set:"
echo "    HUGGINGFACE_HUB_TOKEN=hf_xxxxx"
echo "    SESAME_MODEL=sesame/csm-1b"
echo "    PYTHONUNBUFFERED=1"
echo "    SESAME_FP16=1"
echo "[ ] HF token has 'Access public gated repositories' enabled"
echo "[ ] RunPod execution timeout ≥ 120s"
echo "[ ] Active workers = 1"
echo "[ ] Latest commit deployed (BUILD_BUSTER=force-4)"
echo

read -p "Press Enter to run tests..."
echo

# Test 1: Debug endpoint
echo "1️⃣  Testing debug endpoint (metadata only)..."
echo "---------------------------------------------"
RESPONSE=$(curl -s 'http://localhost:3001/api/voice/sesame?provider=sesame-runpod&debug=1' \
  -H 'content-type: application/json' \
  -d '{"text":"Hello from Maya"}')

echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

# Parse response
if echo "$RESPONSE" | jq -e '.providerUsed == "sesame-runpod"' &>/dev/null; then
    echo -e "${GREEN}✅ Using sesame-runpod provider${NC}"
else
    echo -e "${RED}❌ Not using sesame-runpod provider${NC}"
fi

AUDIO_LENGTH=$(echo "$RESPONSE" | jq -r '.audioLength // 0' 2>/dev/null)
if [ "$AUDIO_LENGTH" -gt 50000 ]; then
    echo -e "${GREEN}✅ Audio length: ${AUDIO_LENGTH} bytes${NC}"
else
    echo -e "${RED}❌ Audio length too small: ${AUDIO_LENGTH} bytes${NC}"
fi

IS_WAV=$(echo "$RESPONSE" | jq -r '.isLikelyWAV // false' 2>/dev/null)
if [ "$IS_WAV" = "true" ]; then
    echo -e "${GREEN}✅ Detected as WAV format${NC}"
else
    echo -e "${RED}❌ Not detected as WAV format${NC}"
fi

echo

# Test 2: Short audio
echo "2️⃣  Testing short audio generation..."
echo "------------------------------------"
curl -s 'http://localhost:3001/api/voice/sesame?provider=sesame-runpod' \
  -H 'content-type: application/json' \
  -d '{"text":"Hello"}' \
  --output test-short.wav

check_file_size "test-short.wav"
echo

# Test 3: Medium audio
echo "3️⃣  Testing medium audio generation..."
echo "-------------------------------------"
curl -s 'http://localhost:3001/api/voice/sesame?provider=sesame-runpod' \
  -H 'content-type: application/json' \
  -d '{"text":"Maya through Sesame on RunPod with longer text"}' \
  --output test-medium.wav

check_file_size "test-medium.wav"
echo

# Summary
echo "📊 Summary:"
echo "-----------"
echo "If you see:"
echo "  • ${GREEN}Green checkmarks${NC} → RunPod is working!"
echo "  • ${YELLOW}Yellow warnings${NC} → Model loading issue (check logs)"
echo "  • ${RED}Red errors${NC} → Configuration issue"
echo
echo "🔍 To check RunPod worker logs:"
echo "   1. Go to RunPod → Workers"
echo "   2. Click on your worker → View Logs"
echo "   3. Look for:"
echo "      - 'HF token present: True'"
echo "      - 'Model loaded successfully'"
echo "      - Any errors after 'Loading Sesame TTS model...'"
echo

# Cleanup option
read -p "Clean up test files? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f test-short.wav test-medium.wav
    echo "✅ Test files cleaned up"
fi