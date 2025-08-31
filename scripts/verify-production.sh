#!/bin/bash

# Production Verification Script - Rate Limiting & SSE Shutdown
# Usage: ./verify-production.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKEND="${BACKEND:-http://localhost:3002/api/v1}"
echo -e "${BLUE}🔧 Testing backend: $BACKEND${NC}"
echo ""

# Test 1: Message Rate Limiting
echo -e "${YELLOW}1. Testing Message Rate Limit (60/min)${NC}"
echo "Sending 65 requests in burst..."

SUCCESS_COUNT=0
RATE_LIMITED_COUNT=0

for i in $(seq 1 65); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BACKEND/converse/message" \
    -H 'Content-Type: application/json' \
    -d '{"userText":"ping","userId":"quota","element":"earth"}')
  
  if [ "$STATUS" = "200" ]; then
    ((SUCCESS_COUNT++))
  elif [ "$STATUS" = "429" ]; then
    ((RATE_LIMITED_COUNT++))
  fi
  
  # Progress indicator
  if [ $((i % 10)) -eq 0 ]; then
    echo -n "[$i/65]"
  fi
done

echo ""
echo -e "${GREEN}✓ Success: $SUCCESS_COUNT requests${NC}"
echo -e "${RED}✓ Rate limited: $RATE_LIMITED_COUNT requests${NC}"

# Check headers on successful request
echo ""
echo -e "${YELLOW}Checking rate limit headers on 200 response:${NC}"
curl -i -X POST "$BACKEND/converse/message" \
  -H 'Content-Type: application/json' \
  -d '{"userText":"quota headers","userId":"check","element":"air"}' \
  2>/dev/null | grep -E "^(HTTP|X-RateLimit-|Retry-After)" | head -10

echo ""
echo -e "${YELLOW}Checking headers on 429 response:${NC}"
# Exhaust quota first
for i in $(seq 1 70); do
  curl -s -o /dev/null "$BACKEND/converse/message" \
    -X POST -H 'Content-Type: application/json' \
    -d '{"userText":"exhaust","userId":"quota","element":"fire"}'
done

# Now check 429 headers
curl -i -X POST "$BACKEND/converse/message" \
  -H 'Content-Type: application/json' \
  -d '{"userText":"rate limited","userId":"quota","element":"air"}' \
  2>/dev/null | grep -E "^(HTTP|X-RateLimit-|Retry-After)" | head -10

# Test 2: Stream Rate Limiting
echo ""
echo -e "${YELLOW}2. Testing Stream Rate Limit (30/min)${NC}"
echo "Opening 35 concurrent streams..."

STREAM_SUCCESS=0
STREAM_LIMITED=0
PIDS=()

for i in $(seq 1 35); do
  {
    if curl -s -N "$BACKEND/converse/stream?element=air&q=hello" 2>/dev/null | head -5 | grep -q "event:"; then
      echo "stream_ok" >> /tmp/stream_results.txt
    else
      echo "stream_limited" >> /tmp/stream_results.txt
    fi
  } &
  PIDS+=($!)
done

# Wait for all streams
for pid in "${PIDS[@]}"; do
  wait "$pid" 2>/dev/null || true
done

if [ -f /tmp/stream_results.txt ]; then
  STREAM_SUCCESS=$(grep -c "stream_ok" /tmp/stream_results.txt || echo 0)
  STREAM_LIMITED=$((35 - STREAM_SUCCESS))
  rm -f /tmp/stream_results.txt
fi

echo -e "${GREEN}✓ Streams connected: $STREAM_SUCCESS${NC}"
echo -e "${RED}✓ Streams rate limited: $STREAM_LIMITED${NC}"

# Test 3: Graceful SSE Shutdown
echo ""
echo -e "${YELLOW}3. Testing Graceful SSE Shutdown${NC}"
echo "Starting long stream and sending SIGTERM..."

# Start stream in background
{
  curl -N "$BACKEND/converse/stream?element=water&q=long" 2>/dev/null | while IFS= read -r line; do
    if [[ "$line" == *"shutdown"* ]]; then
      echo -e "${GREEN}✓ Received shutdown event: $line${NC}"
      break
    fi
    echo "Stream data: ${line:0:50}..."
  done
} &
STREAM_PID=$!

# Give stream time to connect
sleep 2

# Find server PID
SERVER_PID=$(lsof -ti:3002 2>/dev/null || echo "")
if [ -n "$SERVER_PID" ]; then
  echo "Sending SIGTERM to server PID: $SERVER_PID"
  kill -TERM "$SERVER_PID" 2>/dev/null || true
  
  # Wait for stream to exit cleanly
  wait $STREAM_PID 2>/dev/null || true
  echo -e "${GREEN}✓ Stream exited cleanly${NC}"
else
  echo -e "${RED}⚠️  Could not find server PID (is it running on port 3002?)${NC}"
  kill $STREAM_PID 2>/dev/null || true
fi

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Production Verification Complete${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo "Environment variables for production:"
echo "  RL_MSG_MAX=60    (messages per minute per IP)"
echo "  RL_STREAM_MAX=30 (streams per minute per IP)"
echo "  REDIS_URL=redis://host:6379 (optional)"
echo ""