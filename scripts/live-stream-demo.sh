#!/usr/bin/env bash
# 🎬 Maya Live Stream Demo - Watch real-time SSE refinement
# Usage: ./scripts/live-stream-demo.sh [backend_url]

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Default backend (local development)
BACKEND="${1:-http://localhost:3002/api/v1}"

echo -e "${PURPLE}🎬 Maya Live Stream Demo${NC}"
echo "=========================="
echo -e "Backend: ${CYAN}$BACKEND${NC}"
echo ""

# Check if backend is responsive
echo -e "${BLUE}🔍 Checking backend health...${NC}"
if curl -s --max-time 5 "$BACKEND/converse/health" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend responsive${NC}"
    echo ""
else
    echo -e "${RED}❌ Backend not responding at $BACKEND${NC}"
    echo "   Make sure Maya server is running:"
    echo "   cd backend && ./maya-quick-start.sh"
    exit 1
fi

# Demo menu
echo -e "${YELLOW}Choose a demo:${NC}"
echo "  1) 🌬️  Air element - Claude with Sesame/Maya refinement"
echo "  2) 🌍 Earth element - Grounded, practical tone"
echo "  3) 🔥 Fire element - Direct, energetic approach"
echo "  4) 🌊 Water element - Flowing, intuitive guidance"
echo "  5) 📊 Compare: Stream vs Non-stream"
echo "  6) 🎯 Custom query (you type)"
echo "  7) 📜 Save stream to file"
echo ""
read -p "Enter choice (1-7): " choice

case $choice in
    1)
        echo -e "${CYAN}🌬️  Air Element Demo${NC}"
        echo "Streaming: Guide me through a short grounding ritual for sleep"
        echo ""
        curl -s -N -H "Accept: text/event-stream" \
          "$BACKEND/converse/stream?element=air&userId=demo&sse=1&q=$(python3 -c "
import urllib.parse
print(urllib.parse.quote('Guide me through a short grounding ritual for sleep.'))")"
        ;;
        
    2)
        echo -e "${CYAN}🌍 Earth Element Demo${NC}"
        echo "Streaming: Gentle evening grounding ritual"
        echo ""
        curl -s -N -H "Accept: text/event-stream" \
          "$BACKEND/converse/stream?element=earth&userId=demo&sse=1&q=gentle%20evening%20grounding%20ritual"
        ;;
        
    3)
        echo -e "${CYAN}🔥 Fire Element Demo${NC}"
        echo "Streaming: Quick energy clearing before rest"
        echo ""
        curl -s -N -H "Accept: text/event-stream" \
          "$BACKEND/converse/stream?element=fire&userId=demo&sse=1&q=quick%20energy%20clearing%20before%20rest"
        ;;
        
    4)
        echo -e "${CYAN}🌊 Water Element Demo${NC}"
        echo "Streaming: Flowing meditation for deep sleep"
        echo ""
        curl -s -N -H "Accept: text/event-stream" \
          "$BACKEND/converse/stream?element=water&userId=demo&sse=1&q=flowing%20meditation%20for%20deep%20sleep"
        ;;
        
    5)
        echo -e "${CYAN}📊 Comparison: Stream vs Non-stream${NC}"
        echo ""
        
        QUERY="Guide me through a short grounding ritual for sleep."
        
        echo -e "${YELLOW}🌊 Streaming response:${NC}"
        echo "Press Ctrl-C to stop and continue to non-stream..."
        echo ""
        curl -s -N -H "Accept: text/event-stream" \
          "$BACKEND/converse/stream?element=earth&userId=demo&q=$(python3 -c "
import urllib.parse
print(urllib.parse.quote('$QUERY'))")" || true
        
        echo ""
        echo -e "${YELLOW}📦 Non-streaming response:${NC}"
        curl -s -X POST "$BACKEND/converse/message" \
          -H 'Content-Type: application/json' \
          -d "{
            \"userText\":\"$QUERY\",
            \"userId\":\"demo\",
            \"element\":\"earth\",
            \"preferences\":{\"voice\":{\"enabled\":false}}
          }" | jq .
        ;;
        
    6)
        echo -e "${CYAN}🎯 Custom Query${NC}"
        read -p "Enter your question: " custom_query
        read -p "Choose element (air/earth/fire/water): " element
        
        echo ""
        echo -e "${YELLOW}Streaming your query...${NC}"
        curl -s -N -H "Accept: text/event-stream" \
          "$BACKEND/converse/stream?element=${element}&userId=demo&q=$(python3 -c "
import urllib.parse
print(urllib.parse.quote('$custom_query'))")"
        ;;
        
    7)
        echo -e "${CYAN}📜 Save Stream to File${NC}"
        LOGFILE="maya-stream-$(date +%Y%m%d-%H%M%S).log"
        
        echo "Saving stream to: $LOGFILE"
        echo "Press Ctrl-C to stop recording..."
        echo ""
        
        curl -s -N -H "Accept: text/event-stream" \
          "$BACKEND/converse/stream?element=air&userId=demo&q=evening%20wind%20down" \
          | tee "$LOGFILE"
        
        echo ""
        echo -e "${GREEN}✅ Stream saved to $LOGFILE${NC}"
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${PURPLE}Demo complete!${NC}"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "  • Watch for event types: meta, delta, done"
echo "  • Look for <breath/> markers in text"
echo "  • Ctrl-C stops any stream"
echo "  • Rate limits: Check X-RateLimit-* headers"
echo ""
echo -e "${CYAN}🔗 Useful endpoints:${NC}"
echo "  Health: $BACKEND/converse/health"
echo "  Stream: $BACKEND/converse/stream?element=air&userId=test&q=hello"
echo "  Message: POST $BACKEND/converse/message"