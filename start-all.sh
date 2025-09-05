#!/bin/bash
set -e

echo "🚀 Starting Maya Full Stack (Sesame + Backend + Frontend)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Start Sesame + Backend (handled by start-sesame-full.sh)
echo "🟡 Phase 1: Launching Sesame + Backend..."
./start-sesame-full.sh

# Verify backend is actually healthy
echo "⏳ Verifying backend health..."
until curl -s http://localhost:3002/health 2>/dev/null | grep -q "ok\|healthy"; do
    echo "   ...waiting for backend API"
    sleep 2
done
echo "✅ Backend API confirmed healthy"

# Step 2: Start Frontend
echo ""
echo "🟡 Phase 2: Starting Frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Kill any existing frontend
pkill -f "next.*dev" 2>/dev/null || true
sleep 2

echo "🔄 Starting frontend on port 3000..."
PORT=3000 nohup npm run dev > frontend.log 2>&1 &

# Wait for frontend with better health check
echo "⏳ Waiting for frontend to be ready..."
FRONTEND_READY=false
for i in {1..30}; do
    if curl -s http://localhost:3000 2>/dev/null | grep -q "</html>\|<!DOCTYPE html>"; then
        FRONTEND_READY=true
        echo "✅ Frontend is ready at http://localhost:3000"
        break
    fi
    echo "   ...waiting for frontend (attempt $i/30)"
    sleep 2
done

if [ "$FRONTEND_READY" = false ]; then
    echo "⚠️  Frontend may not be fully ready. Check frontend.log for details."
fi

echo ""
echo "🎉 All Systems Operational!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Health Dashboard Check
echo "🏥 Health Dashboard Check:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Sesame TTS
if curl -s http://localhost:8000/health 2>/dev/null | grep -q "ok\|healthy\|ready"; then
    echo "   ✅ Sesame TTS:  http://localhost:8000/health"
else
    echo "   ❌ Sesame TTS:  http://localhost:8000/health (not responding)"
fi

# Check Backend API
if curl -s http://localhost:3002/health 2>/dev/null | grep -q "ok\|healthy\|ready"; then
    echo "   ✅ Backend API: http://localhost:3002/health"
else
    echo "   ❌ Backend API: http://localhost:3002/health (not responding)"
fi

# Check Frontend
if curl -s http://localhost:3000 2>/dev/null | grep -q "</html>\|<!DOCTYPE html>"; then
    echo "   ✅ Frontend:    http://localhost:3000/oracle"
else
    echo "   ❌ Frontend:    http://localhost:3000/oracle (not responding)"
fi

echo ""
echo "📍 Quick Access URLs:"
echo "   🌐 Maya Oracle: http://localhost:3000/oracle"
echo "   🧠 Backend API: http://localhost:3002/health"
echo "   🔊 Sesame TTS:  http://localhost:8000/health"
echo ""
echo "📋 Live Logs:"
echo "   tail -f backend.log frontend.log"
echo "   docker logs -f sesame-maya-local"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Auto-open browser (works on macOS)
if [ "$FRONTEND_READY" = true ]; then
    echo ""
    echo "🌟 Opening Maya Oracle in browser..."
    sleep 2
    open http://localhost:3000/oracle 2>/dev/null || \
        xdg-open http://localhost:3000/oracle 2>/dev/null || \
        echo "   → Please open http://localhost:3000/oracle in your browser"
fi

echo ""
echo "🔮 Maya is ready to guide through Sesame TTS!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"