#!/bin/bash

# Test text generation models with Hugging Face API
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🤖 Testing Text Generation Models${NC}"
echo "===================================="

# Load API key
if [ -f .env.local ]; then
    export $(grep -E '^SESAME_API_KEY=' .env.local | xargs)
else
    echo -e "${RED}❌ Error: .env.local not found${NC}"
    exit 1
fi

if [ -z "$SESAME_API_KEY" ]; then
    echo -e "${RED}❌ Error: SESAME_API_KEY not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ API Key loaded${NC}"
echo "Key: ${SESAME_API_KEY:0:10}..."

# Test models
test_model() {
    local model=$1
    local description=$2
    local url="https://api-inference.huggingface.co/models/$model"
    
    echo -e "\n${YELLOW}Testing: $model${NC}"
    echo "Description: $description"
    
    # Make request with simple prompt
    local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
        -H "Authorization: Bearer $SESAME_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"inputs":"Hello, how are you today?","parameters":{"max_length":50}}' \
        "$url" 2>&1)
    
    local http_status=$(echo "$response" | tail -n 1 | cut -d':' -f2)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$http_status" = "200" ]; then
        echo -e "${GREEN}✅ Model works!${NC}"
        echo "Response:"
        echo "$body" | jq -r '.[0].generated_text // .generated_text // .' 2>/dev/null || echo "$body"
        echo -e "\n${BLUE}Add to .env.local:${NC}"
        echo "SESAME_URL=$url"
        return 0
    elif [ "$http_status" = "503" ]; then
        # Try to wake up the model
        echo -e "${YELLOW}⏳ Model loading, waiting 20 seconds...${NC}"
        sleep 20
        
        # Retry
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
            -H "Authorization: Bearer $SESAME_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{"inputs":"Hello, how are you today?","parameters":{"max_length":50}}' \
            "$url" 2>&1)
        
        http_status=$(echo "$response" | tail -n 1 | cut -d':' -f2)
        body=$(echo "$response" | sed '$d')
        
        if [ "$http_status" = "200" ]; then
            echo -e "${GREEN}✅ Model loaded and works!${NC}"
            echo "Response:"
            echo "$body" | jq -r '.[0].generated_text // .generated_text // .' 2>/dev/null || echo "$body"
            echo -e "\n${BLUE}Add to .env.local:${NC}"
            echo "SESAME_URL=$url"
            return 0
        else
            echo -e "${YELLOW}Still loading, try again later${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Failed (HTTP $http_status)${NC}"
        if [ -n "$body" ]; then
            echo "Error: $body" | head -n 1
        fi
        return 1
    fi
}

# Test various models
echo -e "\n${BLUE}Testing conversational models...${NC}"

# Small, fast models
test_model "microsoft/DialoGPT-small" "Small conversational AI (117M params)"
test_model "google/flan-t5-small" "Google's instruction-following model"
test_model "distilgpt2" "Distilled GPT-2 (fast)"

# If none work, try GPT-2
if [ $? -ne 0 ]; then
    echo -e "\n${BLUE}Trying fallback models...${NC}"
    test_model "gpt2" "Classic GPT-2"
    test_model "EleutherAI/gpt-neo-125m" "Open source GPT (125M)"
fi

echo -e "\n===================================="
echo -e "${GREEN}Testing complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Choose a working model from above"
echo "2. Update SESAME_URL in .env.local"
echo "3. Restart your backend server"
echo "4. Test with: ./scripts/test-sesame.sh"