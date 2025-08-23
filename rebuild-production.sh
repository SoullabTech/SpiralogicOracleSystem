#!/bin/bash
set -e

echo "🏗️ Production-grade Docker rebuild with npm ci (strict mode)"
echo "📍 Project: SpiralogicOracleSystem"

# Navigate to project directory
cd "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"

# Clean Apple metadata (safe to repeat on macOS external drives)
echo "🧹 Cleaning Apple metadata..."
find . -name '._*' -type f -delete 2>/dev/null || true
find . -name '.DS_Store' -type f -delete 2>/dev/null || true
xattr -cr . 2>/dev/null || true

# Use legacy builder (avoids xattr/AppleDouble grief on external drives)
echo "🔧 Setting legacy Docker builder for macOS external drive compatibility..."
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

# Full cleanup
echo "🧹 Cleaning up existing containers and images..."
docker compose -f docker-compose.development.yml down -v --remove-orphans 2>/dev/null || true

# Build with no cache for fresh start
echo "🏗️ Building with production-grade multi-stage Dockerfiles..."
docker compose -f docker-compose.development.yml build --no-cache

# Start services
echo "🚀 Starting services..."
docker compose -f docker-compose.development.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Show status
echo "📊 Service status:"
docker compose -f docker-compose.development.yml ps

echo ""
echo "✅ Production rebuild complete!"
echo ""
echo "🧪 Running sanity checks..."

# Wait a bit more for services to fully start
sleep 5

# Frontend health check
echo "🏥 Frontend health check:"
if curl -s http://127.0.0.1:3000/api/health | jq . 2>/dev/null; then
    echo "✅ Frontend health: OK"
else
    echo "❌ Frontend health: FAILED"
fi

# Backend health check  
echo "🏥 Backend health check:"
if curl -s http://127.0.0.1:8080/health | jq . 2>/dev/null; then
    echo "✅ Backend health: OK"
else
    echo "❌ Backend health: FAILED"
fi

# Feature flags check
echo "🚩 Feature flags check:"
if curl -s http://127.0.0.1:3000/api/debug/flags | jq . 2>/dev/null | grep -q '"conversationalMode": true'; then
    echo "✅ Conversational mode: ENABLED"
else
    echo "❌ Conversational mode: NOT DETECTED"
fi

# Conversational test
echo "💬 Conversational Oracle test:"
ORACLE_RESPONSE=$(curl -s -X POST http://127.0.0.1:3000/api/oracle/turn \
  -H 'content-type: application/json' \
  -d '{"input":{"text":"Quick check — how would you guide me today?"},"conversationId":"c-verify"}' \
  2>/dev/null | jq -r '.response.text' 2>/dev/null)

if [[ -n "$ORACLE_RESPONSE" && "$ORACLE_RESPONSE" != "null" ]]; then
    echo "✅ Oracle response: $ORACLE_RESPONSE"
else
    echo "❌ Oracle response: FAILED"
fi

echo ""
echo "🌐 Access your application:"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8080"