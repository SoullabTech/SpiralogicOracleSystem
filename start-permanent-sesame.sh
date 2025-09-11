#!/bin/bash

# Start Permanent Sesame Service with Cloudflare Tunnel
echo "🌀 Starting Permanent Sesame Service"
echo "===================================="

# Start Sesame in background
echo "Starting Enhanced Sesame CI..."
cd /Volumes/T7\ Shield/Projects/SpiralogicOracleSystem/apps/api/backend
/Library/Frameworks/Python.framework/Versions/3.13/bin/python3 sesame-local.py &
SESAME_PID=$!
echo "✅ Sesame running (PID: $SESAME_PID)"

# Wait for Sesame to start
sleep 3

# Start Cloudflare tunnel
echo "Starting Cloudflare tunnel..."
cloudflared tunnel run sesame &
TUNNEL_PID=$!
echo "✅ Tunnel running (PID: $TUNNEL_PID)"

echo ""
echo "===================================="
echo "🎉 Sesame is live at: https://sesame.soullab.life"
echo "===================================="
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for interrupt
trap "kill $SESAME_PID $TUNNEL_PID; exit" INT
wait