#!/bin/bash

# Test Sesame (Hugging Face) connection
# This script loads environment variables from .env.local and tests the API

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔮 Testing Sesame (Hugging Face) Connection${NC}"
echo "----------------------------------------"

# Load environment variables from .env.local
if [ -f .env.local ]; then
    echo "Loading variables from .env.local..."
    export $(grep -E '^(SESAME_URL|SESAME_API_KEY)=' .env.local | xargs)
else
    echo -e "${RED}❌ Error: .env.local not found${NC}"
    echo "Please create .env.local with SESAME_URL and SESAME_API_KEY"
    exit 1
fi

# Check if variables are set
if [ -z "$SESAME_URL" ]; then
    echo -e "${RED}❌ Error: SESAME_URL not found in .env.local${NC}"
    exit 1
fi

if [ -z "$SESAME_API_KEY" ]; then
    echo -e "${RED}❌ Error: SESAME_API_KEY not found in .env.local${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment variables loaded${NC}"
echo "SESAME_URL: $SESAME_URL"
echo "SESAME_API_KEY: ${SESAME_API_KEY:0:10}..." # Show first 10 chars only

# Test the API
echo -e "\n${YELLOW}📡 Testing API connection...${NC}"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  -H "Authorization: Bearer $SESAME_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"inputs":"Hello Sesame, are you online?"}' \
  "$SESAME_URL" 2>&1)

# Extract HTTP status code
HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1 | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '$d')

# Check if curl succeeded
if [ $? -eq 0 ]; then
    if [ "$HTTP_STATUS" = "404" ]; then
        echo -e "${RED}❌ Error: Model not found (404)${NC}"
        echo "The model URL might be incorrect. Common formats:"
        echo "• https://api-inference.huggingface.co/models/{username}/{model-name}"
        echo "• https://api-inference.huggingface.co/models/{organization}/{model-name}"
        echo -e "\nCurrent URL: $SESAME_URL"
    elif [ "$HTTP_STATUS" = "401" ]; then
        echo -e "${RED}❌ Error: Unauthorized (401)${NC}"
        echo "Please check your SESAME_API_KEY"
    elif [ "$HTTP_STATUS" = "200" ]; then
        if echo "$BODY" | grep -q '"error"'; then
            echo -e "${RED}❌ API returned an error:${NC}"
            echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
        elif echo "$BODY" | grep -q "generated_text"; then
            echo -e "${GREEN}✅ Success! Sesame is online${NC}"
            echo -e "\nResponse:"
            echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
        else
            echo -e "${GREEN}✅ Success! Got response from API${NC}"
            echo -e "\nResponse:"
            echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
        fi
    else
        echo -e "${YELLOW}⚠️  HTTP Status: $HTTP_STATUS${NC}"
        echo "Response body:"
        echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    fi
else
    echo -e "${RED}❌ Connection failed${NC}"
    echo "Error: $RESPONSE"
fi

echo -e "\n----------------------------------------"
echo "Test complete!"