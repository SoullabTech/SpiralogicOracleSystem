#!/usr/bin/env bash
set -e

echo "🌀 Starting Spiralogic Oracle System locally..."

# Check Supabase
echo "↪ checking supabase..."
if ! supabase status > /dev/null 2>&1; then
    echo "Starting Supabase..."
    supabase start
else
    echo "Supabase already running"
fi

# Start PSI backend
echo "↪ starting PSI backend on :3003..."
cd backend && npm run dev &
BACK_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 3

# Test backend health
if curl -s http://localhost:3003/health > /dev/null; then
    echo "✅ Backend healthy"
else
    echo "⚠️  Backend not responding (may still be starting)"
fi

# Start frontend
echo "↪ starting Next.js on :3001..."
cd ..
NEXT_TELEMETRY_DISABLED=1 npm run dev

# Cleanup on exit
trap "echo 'Stopping services...'; kill $BACK_PID 2>/dev/null || true" EXIT