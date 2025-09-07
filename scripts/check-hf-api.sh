#!/bin/bash

# Check Hugging Face API key validity and permissions
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔑 Checking Hugging Face API Key${NC}"
echo "================================="

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
echo "Key prefix: ${SESAME_API_KEY:0:10}..."

# Test 1: Check API key validity using the whoami endpoint
echo -e "\n${YELLOW}1. Testing API key validity...${NC}"
WHOAMI=$(curl -s -X GET \
    -H "Authorization: Bearer $SESAME_API_KEY" \
    "https://huggingface.co/api/whoami" 2>&1)

if echo "$WHOAMI" | grep -q '"type"'; then
    echo -e "${GREEN}✅ API key is valid!${NC}"
    echo "Account info:"
    echo "$WHOAMI" | jq '{name, type, email}' 2>/dev/null || echo "$WHOAMI"
else
    echo -e "${RED}❌ API key appears invalid${NC}"
    echo "Response: $WHOAMI"
    exit 1
fi

# Test 2: Try a simple model that should always work
echo -e "\n${YELLOW}2. Testing basic inference API...${NC}"

# Try the simplest possible request
TEST_URL="https://api-inference.huggingface.co/models/gpt2"
echo "Testing URL: $TEST_URL"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
    -H "Authorization: Bearer $SESAME_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"inputs":"Hello world"}' \
    "$TEST_URL" 2>&1)

HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1 | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Inference API works!${NC}"
    echo "Response:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
elif [ "$HTTP_STATUS" = "503" ]; then
    echo -e "${YELLOW}⏳ Model is loading, please wait and try again${NC}"
else
    echo -e "${RED}❌ Unexpected response${NC}"
    echo "Body: $BODY"
fi

# Test 3: List some available models
echo -e "\n${YELLOW}3. Checking available models...${NC}"
echo "Some models you can try:"
echo -e "${BLUE}https://api-inference.huggingface.co/models/gpt2${NC}"
echo -e "${BLUE}https://api-inference.huggingface.co/models/bert-base-uncased${NC}"
echo -e "${BLUE}https://api-inference.huggingface.co/models/t5-small${NC}"
echo -e "${BLUE}https://api-inference.huggingface.co/models/facebook/bart-base${NC}"

echo -e "\n================================="
echo "Diagnostics complete!"