#!/bin/bash
set -e

echo "🔄 Starting Full Sesame TTS Service..."

# Kill existing Sesame containers
echo "📦 Stopping existing Sesame containers..."
docker stop sesame-maya sesame-maya-local 2>/dev/null || true
docker rm sesame-maya sesame-maya-local 2>/dev/null || true

# Start fresh Sesame service
echo "🚀 Starting Sesame TTS..."
docker-compose -f docker-compose.sesame.yml up -d sesame-local

# Wait for health check
echo "⏳ Waiting for Sesame to be healthy..."
until curl -s http://localhost:8000/health | grep -q "healthy"; do
    echo "   ...waiting for Sesame"
    sleep 3
done
echo "✅ Sesame is healthy at http://localhost:8000"

# Patch backend .env.local
BACKEND_ENV="./backend/.env.local"
echo "⚙️  Patching SESAME_URL in $BACKEND_ENV..."

# Create backup if doesn't exist
if [ -f "$BACKEND_ENV" ]; then
    cp "$BACKEND_ENV" "$BACKEND_ENV.backup" 2>/dev/null || true
else
    touch "$BACKEND_ENV"
fi

# Update or add SESAME_URL
if grep -q "^SESAME_URL=" "$BACKEND_ENV"; then
    sed -i.bak 's|^SESAME_URL=.*|SESAME_URL=http://localhost:8000/api/v1/generate|' "$BACKEND_ENV"
else
    echo "SESAME_URL=http://localhost:8000/api/v1/generate" >> "$BACKEND_ENV"
fi

# Update or add SESAME_FAIL_FAST
if grep -q "^SESAME_FAIL_FAST=" "$BACKEND_ENV"; then
    sed -i.bak 's|^SESAME_FAIL_FAST=.*|SESAME_FAIL_FAST=true|' "$BACKEND_ENV"
else
    echo "SESAME_FAIL_FAST=true" >> "$BACKEND_ENV"
fi

echo "✅ Backend .env.local patched with Sesame config"

# Restart backend
echo "🔄 Restarting backend with Sesame config..."
pkill -f "node.*backend" 2>/dev/null || true
sleep 2
(cd backend && PORT=3002 nohup npm run dev > ../backend.log 2>&1 &)

# Wait for backend
echo "⏳ Waiting for backend to be healthy..."
for i in {1..30}; do
    if curl -s http://localhost:3002/health 2>/dev/null | grep -q "ok\|healthy"; then
        echo "✅ Backend is healthy at http://localhost:3002"
        break
    fi
    echo "   ...waiting for backend"
    sleep 2
done

# Test Sesame voice generation
echo "🧪 Testing Sesame voice generation..."
curl -X POST http://localhost:8000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is Maya speaking through Sesame", "voice": "maya"}' \
  -o sesame-test.wav -s

if [ -f sesame-test.wav ]; then
    echo "✅ Sesame test successful! Audio saved to sesame-test.wav"
    echo "📊 File size: $(ls -lh sesame-test.wav | awk '{print $5}')"
else
    echo "❌ Sesame test failed. Check logs with: docker logs sesame-maya-local"
fi

echo ""
echo "🎯 Service Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}" | grep sesame || true
echo ""
echo "📝 Configuration:"
echo "   SESAME_URL=http://localhost:8000/api/v1/generate"
echo "   Backend: http://localhost:3002"
echo ""
echo "📋 Logs:"
echo "   Sesame: docker logs -f sesame-maya-local"
echo "   Backend: tail -f backend.log"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"