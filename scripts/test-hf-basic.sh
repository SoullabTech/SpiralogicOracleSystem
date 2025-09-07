#!/bin/bash

# Basic Hugging Face API test
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Basic Hugging Face API Test${NC}"
echo "================================"

# Load API key
if [ -f .env.local ]; then
    export $(grep -E '^SESAME_API_KEY=' .env.local | xargs)
fi

API_KEY="${SESAME_API_KEY:-$1}"

if [ -z "$API_KEY" ]; then
    echo -e "${RED}❌ No API key provided${NC}"
    echo "Usage: $0 [API_KEY]"
    echo "Or set SESAME_API_KEY in .env.local"
    exit 1
fi

echo "Testing API key: ${API_KEY:0:10}..."

# Test 1: Simple model that should always work
echo -e "\n${YELLOW}1. Testing basic inference (gpt2)...${NC}"

# Using the most basic model
response=$(curl -s -w "\nHTTP:%{http_code}" \
    -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"inputs":"Hello"}' \
    "https://api-inference.huggingface.co/models/gpt2")

http_code=$(echo "$response" | tail -1 | cut -d: -f2)
body=$(echo "$response" | sed '$d')

echo "HTTP Status: $http_code"

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS! API key works${NC}"
    echo "Response: $body"
elif [ "$http_code" = "503" ]; then
    echo -e "${YELLOW}⏳ Model is loading, this is normal${NC}"
    echo "Wait 30 seconds and try again"
elif [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
    echo -e "${RED}❌ Authentication failed${NC}"
    echo "Your API key is invalid or doesn't have permissions"
    echo "Response: $body"
elif [ "$http_code" = "404" ]; then
    echo -e "${RED}❌ Model not found${NC}"
    echo "This might be an account issue"
else
    echo -e "${RED}❌ Unexpected error${NC}"
    echo "Response: $body"
fi

# Test 2: Check if it's an account/permission issue
echo -e "\n${YELLOW}2. Testing with public model endpoint...${NC}"

# Try without authentication (some models allow it)
public_response=$(curl -s -w "\nHTTP:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"inputs":"test"}' \
    "https://api-inference.huggingface.co/models/gpt2")

public_code=$(echo "$public_response" | tail -1 | cut -d: -f2)

if [ "$public_code" = "200" ] || [ "$public_code" = "503" ]; then
    echo -e "${YELLOW}Public access works, but your API key doesn't${NC}"
    echo "This suggests an issue with your specific API key"
else
    echo "Public access also fails (HTTP $public_code)"
fi

echo -e "\n================================"
echo -e "${BLUE}Recommendations:${NC}"
echo "1. Go to https://huggingface.co/settings/tokens"
echo "2. Create a new token with 'read' scope"
echo "3. Make sure you're logged in to the correct account"
echo "4. Try the new token with this script"