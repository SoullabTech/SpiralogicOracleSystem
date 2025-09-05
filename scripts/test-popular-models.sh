#!/bin/bash

# Test popular Hugging Face models to find working ones
# This helps identify which models are available for your use case

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 Testing Popular Hugging Face Models${NC}"
echo "======================================="

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

# Popular conversational models to test
models=(
    "microsoft/DialoGPT-small|Conversational AI (small, fast)"
    "microsoft/DialoGPT-medium|Conversational AI (medium)"
    "microsoft/DialoGPT-large|Conversational AI (large)"
    "google/flan-t5-base|General purpose (base)"
    "google/flan-t5-small|General purpose (small)"
    "EleutherAI/gpt-neo-125M|GPT-like model (125M params)"
    "distilbert-base-uncased|BERT model for understanding"
    "gpt2|Classic GPT-2"
)

test_model() {
    local model=$1
    local description=$2
    local url="https://api-inference.huggingface.co/models/$model"
    
    echo -e "\n${YELLOW}Testing: $model${NC}"
    echo "Description: $description"
    
    # Make request
    local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
        -H "Authorization: Bearer $SESAME_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"inputs":"Hello, how are you?"}' \
        "$url" 2>&1)
    
    local http_status=$(echo "$response" | tail -n 1 | cut -d':' -f2)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$http_status" = "200" ]; then
        echo -e "${GREEN}✅ Model is available!${NC}"
        echo "Response preview:"
        echo "$body" | jq -r '.[0:1]' 2>/dev/null || echo "$body" | head -n 3
        echo -e "URL to use in .env.local:"
        echo -e "${BLUE}SESAME_URL=$url${NC}"
        return 0
    elif [ "$http_status" = "503" ]; then
        echo -e "${YELLOW}⏳ Model is loading (503) - try again in a minute${NC}"
        return 1
    else
        echo -e "${RED}❌ Not available (HTTP $http_status)${NC}"
        return 1
    fi
}

# Test each model
working_models=0
for entry in "${models[@]}"; do
    IFS='|' read -r model description <<< "$entry"
    if test_model "$model" "$description"; then
        ((working_models++))
    fi
    sleep 1 # Be nice to the API
done

echo -e "\n======================================="
echo -e "${GREEN}Found $working_models working models${NC}"
echo -e "\nTo use a model, update your .env.local with the SESAME_URL shown above."
echo -e "Example: ${BLUE}SESAME_URL=https://api-inference.huggingface.co/models/gpt2${NC}"