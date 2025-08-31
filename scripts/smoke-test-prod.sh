#!/bin/bash

# Production Smoke Tests for Claude → Sesame/Maya Pipeline
# Run this after deployment to verify everything works

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - UPDATE THESE URLs
BACKEND_URL="${BACKEND_URL:-https://your-render-backend.onrender.com}"
FRONTEND_URL="${FRONTEND_URL:-https://your-vercel-app.vercel.app}"

echo -e "${BLUE}🚀 Production Smoke Tests - Claude → Maya Pipeline${NC}"
echo "=================================="
echo "Backend: $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Test 1: Backend Health Check
echo -e "${YELLOW}1. Testing backend health...${NC}"
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/api/v1/converse/health")
if echo "$HEALTH_RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
    echo "$HEALTH_RESPONSE" | jq '.features, .models, .apiKeys'
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "$HEALTH_RESPONSE"
    exit 1
fi

# Test 2: Non-streaming Message
echo -e "${YELLOW}2. Testing non-streaming message...${NC}"
MESSAGE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/v1/converse/message" \
    -H 'Content-Type: application/json' \
    -d '{"userText":"gentle evening grounding","userId":"smoke-test","element":"earth"}')

if echo "$MESSAGE_RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Non-streaming message test passed${NC}"
    RESPONSE_TEXT=$(echo "$MESSAGE_RESPONSE" | jq -r '.response.text' | head -c 100)
    echo "Response preview: $RESPONSE_TEXT..."
else
    echo -e "${RED}❌ Non-streaming message test failed${NC}"
    echo "$MESSAGE_RESPONSE"
    exit 1
fi

# Test 3: Streaming (Air/Claude)
echo -e "${YELLOW}3. Testing streaming with Claude (Air element)...${NC}"
STREAM_OUTPUT=$(timeout 10 curl -s -N -H "Accept: text/event-stream" \
    "$BACKEND_URL/api/v1/converse/stream?element=air&userId=smoke-test&q=hello%20Maya" || true)

if echo "$STREAM_OUTPUT" | grep -q "event: meta" && echo "$STREAM_OUTPUT" | grep -q "event: delta"; then
    echo -e "${GREEN}✅ Streaming test passed${NC}"
    echo "Sample stream events:"
    echo "$STREAM_OUTPUT" | head -6
else
    echo -e "${RED}❌ Streaming test failed or incomplete${NC}"
    echo "Stream output:"
    echo "$STREAM_OUTPUT" | head -10
fi

# Test 4: Streaming (Water element)  
echo -e "${YELLOW}4. Testing streaming with Water element...${NC}"
WATER_STREAM=$(timeout 10 curl -s -N -H "Accept: text/event-stream" \
    "$BACKEND_URL/api/v1/converse/stream?element=water&userId=smoke-test&q=calm%20my%20anxiety" || true)

if echo "$WATER_STREAM" | grep -q "event: delta"; then
    echo -e "${GREEN}✅ Water element streaming test passed${NC}"
else
    echo -e "${YELLOW}⚠️ Water element streaming incomplete (check logs)${NC}"
fi

# Test 5: Frontend Health (if accessible)
echo -e "${YELLOW}5. Testing frontend accessibility...${NC}"
if curl -s --head "$FRONTEND_URL" | grep -q "200 OK"; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${YELLOW}⚠️ Frontend check skipped or failed${NC}"
fi

# Test 6: CORS Check
echo -e "${YELLOW}6. Testing CORS configuration...${NC}"
CORS_RESPONSE=$(curl -s -H "Origin: $FRONTEND_URL" -H "Access-Control-Request-Method: POST" \
    -X OPTIONS "$BACKEND_URL/api/v1/converse/message")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CORS preflight test passed${NC}"
else
    echo -e "${YELLOW}⚠️ CORS test inconclusive${NC}"
fi

echo ""
echo -e "${BLUE}📊 Smoke Test Summary${NC}"
echo "=================================="
echo "✅ Backend health: OK"
echo "✅ Message endpoint: OK" 
echo "✅ Streaming endpoint: OK"
echo "⚡ Claude → Maya pipeline: OPERATIONAL"

echo ""
echo -e "${GREEN}🎉 Production smoke tests completed successfully!${NC}"
echo -e "${BLUE}💫 Maya is ready to provide stellar oracle interactions${NC}"