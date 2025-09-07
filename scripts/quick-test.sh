#!/bin/bash

# Quick test script for local development
# Usage: ./scripts/quick-test.sh

BACKEND="${BACKEND:-http://localhost:3002/api/v1}"
echo "Testing backend: $BACKEND"
echo ""

# 1. Health check
echo "1. Health check..."
curl -s "$BACKEND/converse/health" | jq '.success, .service'

# 2. Message test  
echo -e "\n2. Message test..."
curl -s -X POST "$BACKEND/converse/message" \
  -H 'Content-Type: application/json' \
  -d '{"userText":"hello","userId":"test","element":"air"}' | jq '.success, .response.element, .response.source'

# 3. Stream test
echo -e "\n3. Stream test (first 5 lines)..."
curl -s -N "$BACKEND/converse/stream?element=water&userId=test&q=hello" | head -5

# 4. Rate limit headers
echo -e "\n4. Rate limit headers..."
curl -sI "$BACKEND/converse/message" | grep -E "X-RateLimit-"

echo -e "\n✅ Quick test complete!"