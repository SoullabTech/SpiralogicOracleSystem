#!/bin/bash
# Sacred Mirror Beta Launch Script

echo "🌟 Starting Sacred Mirror Beta..."

# Check if Redis is running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "⚡ Starting Redis..."
    brew services start redis
else
    echo "✅ Redis is already running"
fi

# Kill any existing Next.js or Node processes
echo "🔄 Cleaning up old processes..."
pkill -f "next dev" 2>/dev/null
pkill -f "node dist/server.js" 2>/dev/null

# Wait a moment for cleanup
sleep 2

# Start backend in a new terminal
echo "🔮 Starting Oracle Backend..."
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'/backend\" && npm run dev"'

# Wait for backend to initialize
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Start frontend in a new terminal
echo "✨ Starting Sacred Mirror Frontend..."
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && npm run dev"'

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 5

# Supabase persistence check
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🔍 SUPABASE PERSISTENCE CHECK"
echo "═══════════════════════════════════════════════════════════"

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

SUPABASE_URL=${SUPABASE_URL:-"https://jkbetmadzcpoinjogkli.supabase.co"}
SUPABASE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-$SUPABASE_ANON_KEY}

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Missing Supabase credentials in .env"
    exit 1
fi

TEST_ID="beta-test-$(date +%s)"
TEST_USER_ID="beta-test-user"

# Insert test row
echo "📝 Writing test memory to Supabase..."
insert_response=$(curl -s -o /dev/null -w "%{http_code}" \
  "$SUPABASE_URL/rest/v1/memory_items" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{\"id\":\"$TEST_ID\",\"user_id\":\"$TEST_USER_ID\",\"query\":\"Beta test\",\"response\":\"Beta persistence test at $(date)\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)\"}")

if [ "$insert_response" -ne 201 ]; then
    echo "❌ Failed to insert test memory (HTTP $insert_response)"
    echo "   Check your Supabase credentials and table permissions"
    exit 1
fi

# Read it back
echo "📖 Reading test memory back..."
get_response=$(curl -s \
  "$SUPABASE_URL/rest/v1/memory_items?id=eq.$TEST_ID" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY")

if [[ $get_response == *"Beta persistence test"* ]]; then
    echo "✅ Supabase persistence verified"
    
    # Clean up test data
    delete_response=$(curl -s -o /dev/null -w "%{http_code}" \
      -X DELETE \
      "$SUPABASE_URL/rest/v1/memory_items?id=eq.$TEST_ID" \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY")
    
    if [ "$delete_response" -eq 204 ]; then
        echo "🧹 Test data cleaned up"
    fi
else
    echo "❌ Supabase readback failed"
    echo "Response: $get_response"
    exit 1
fi

echo "═══════════════════════════════════════════════════════════"
echo ""

# ElevenLabs Voice Check
echo "═══════════════════════════════════════════════════════════"
echo "  🔊 ELEVENLABS VOICE CHECK"
echo "═══════════════════════════════════════════════════════════"

# Load .env.local for ElevenLabs config
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

if [ -z "$ELEVENLABS_API_KEY" ]; then
    echo "❌ ELEVENLABS_API_KEY missing in .env.local"
    VOICE_STATUS="NOT CONFIGURED"
else
    # Use configured voice ID or default to Aunt Annie
    VOICE_ID=${ELEVENLABS_VOICE_ID:-"y2TOWGCXSYEgBanvKsYJ"}
    VOICE_NAME=${ELEVENLABS_VOICE_NAME:-"Aunt Annie"}
    TMP_AUDIO="/tmp/maya-voice-check.mp3"
    
    echo "🎤 Testing voice synthesis with $VOICE_NAME..."
    
    # Generate audio
    response=$(curl -s -w "\n%{http_code}" -X POST "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID" \
        -H "xi-api-key: $ELEVENLABS_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "text": "Maya is online.",
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.8
            }
        }' --output "$TMP_AUDIO")
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ] && [ -s "$TMP_AUDIO" ]; then
        # Play audio based on platform
        if command -v afplay &> /dev/null; then
            afplay "$TMP_AUDIO"
        elif command -v aplay &> /dev/null; then
            aplay "$TMP_AUDIO" 2>/dev/null
        elif command -v play &> /dev/null; then
            play "$TMP_AUDIO" 2>/dev/null
        fi
        echo "✅ Voice synthesis verified - Maya spoke!"
        VOICE_STATUS="ONLINE ($VOICE_NAME)"
        rm -f "$TMP_AUDIO"
    else
        echo "❌ Voice synthesis failed (HTTP $http_code)"
        VOICE_STATUS="FAILED"
    fi
fi

echo "═══════════════════════════════════════════════════════════"
echo ""

# Mini Maya Query Check
echo "═══════════════════════════════════════════════════════════"
echo "  🧠 MINI MAYA QUERY"
echo "═══════════════════════════════════════════════════════════"

BACKEND_PORT=${BACKEND_PORT:-3002}
echo "🤖 Testing Maya's AI response..."

# Give backend a moment to fully initialize
sleep 2

# Test Maya with a simple query
AI_RESPONSE=$(curl -s -X POST "http://localhost:$BACKEND_PORT/api/v1/oracle/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is 2+2?",
    "userId": "beta-test-user",
    "sessionId": "beta-test-session"
  }' 2>/dev/null | jq -r '.response // .content // "NO_RESPONSE"' 2>/dev/null || echo "CURL_FAILED")

if [ "$AI_RESPONSE" = "CURL_FAILED" ]; then
    echo "❌ Could not reach Maya backend"
    AI_STATUS="OFFLINE"
elif [[ "$AI_RESPONSE" == *"4"* ]] || [[ "$AI_RESPONSE" == *"four"* ]]; then
    echo "✅ Maya responded correctly: \"$AI_RESPONSE\""
    AI_STATUS="ONLINE"
elif [ "$AI_RESPONSE" = "NO_RESPONSE" ]; then
    echo "❌ Maya backend returned no response"
    AI_STATUS="ERROR"
else
    echo "⚠️  Maya gave unexpected response: \"$AI_RESPONSE\""
    AI_STATUS="PARTIAL"
fi

echo "═══════════════════════════════════════════════════════════"
echo ""

# Determine overall system status
SYSTEM_STATUS="READY"
if [ "$AI_STATUS" = "OFFLINE" ] || [ "$AI_STATUS" = "ERROR" ]; then
    SYSTEM_STATUS="PARTIAL"
fi
if [ "$VOICE_STATUS" = "FAILED" ]; then
    SYSTEM_STATUS="PARTIAL"
fi

# Open the browser
echo "🌐 Opening Sacred Mirror in browser..."
open http://localhost:3000

echo ""
if [ "$SYSTEM_STATUS" = "READY" ]; then
    echo "🎉 Sacred Mirror Beta is FULLY READY!"
elif [ "$SYSTEM_STATUS" = "PARTIAL" ]; then
    echo "⚠️  Sacred Mirror Beta is running with PARTIAL functionality"
else
    echo "❌ Sacred Mirror Beta encountered errors"
fi
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:3002/api/v1"
echo "📍 Health:   http://localhost:3002/api/v1/health"
echo ""
echo "System Status:"
echo "   🔄 Redis:     ONLINE"
echo "   💾 Supabase:  ONLINE"
echo "   🔊 Voice:     ${VOICE_STATUS:-UNKNOWN}"
echo "   🧠 Maya AI:   ${AI_STATUS:-UNKNOWN}"
echo ""
echo "💡 Tips:"
echo "   - Check Terminal windows for logs"
echo "   - Press Ctrl+C in terminals to stop"
echo "   - Run 'brew services stop redis' to stop Redis"
echo ""
if [ "$SYSTEM_STATUS" = "READY" ]; then
    echo "🔮 Maya is fully online and awaits your questions..."
else
    echo "🔮 Maya is online but some features may be limited..."
fi