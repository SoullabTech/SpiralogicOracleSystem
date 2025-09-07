#!/bin/bash

# Quick Production Smoke Test - Claude → Maya Pipeline
# Usage: ./quick-prod-test.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Set once - UPDATE THIS URL
BACKEND="https://your-render-backend.onrender.com/api/v1"

echo -e "${BLUE}🔮 Quick Production Test - Maya Pipeline${NC}"
echo "Backend: $BACKEND"
echo ""

# Health check
echo -e "${YELLOW}1. Health check...${NC}"
curl -s "$BACKEND/converse/health" | jq .
echo ""

# Text message
echo -e "${YELLOW}2. Text message (Earth element)...${NC}"
curl -s -X POST "$BACKEND/converse/message" \
  -H 'Content-Type: application/json' \
  -d '{"userText":"gentle evening grounding","userId":"smoke","element":"earth"}' | jq .
echo ""

# Streaming (watch first tokens)
echo -e "${YELLOW}3. Streaming (Air/Claude - first 20 lines)...${NC}"
curl -s -N "$BACKEND/converse/stream?element=air&userId=smoke&q=hello" | head -20
echo ""

echo -e "${GREEN}✅ Production smoke test complete!${NC}"