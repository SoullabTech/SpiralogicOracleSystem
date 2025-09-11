#!/bin/bash
# Start Sesame and Cloudflare Tunnel

echo "🚀 Starting Sesame service..."
cd "$(dirname "$0")"
./sesame-quick-start.sh &

echo "⏳ Waiting for Sesame to start..."
sleep 5

echo "🌐 Starting Cloudflare tunnel..."
cloudflared tunnel --url http://localhost:8000
