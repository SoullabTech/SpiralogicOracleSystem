#!/bin/bash

# Quick Sesame CI Start Script (No Build Required)
# Uses pre-built image or runs locally

echo "🌀 Quick Sesame CI Start"
echo "========================"

# Check if we have a local sesame-csm directory
if [ -d "sesame-csm" ]; then
    echo "📁 Found local sesame-csm directory"
    cd sesame-csm
    
    # Check for Python environment
    if [ -f "venv/bin/activate" ]; then
        echo "🐍 Activating Python virtual environment..."
        source venv/bin/activate
    elif [ -f "../.venv/bin/activate" ]; then
        source ../.venv/bin/activate
    fi
    
    # Start Sesame locally
    echo "🚀 Starting Sesame CI locally on port 8000..."
    python sesame_csm.py &
    SESAME_PID=$!
    
    cd ..
    
    echo "✅ Sesame CI started (PID: $SESAME_PID)"
    
elif [ -d "backend/csm" ]; then
    echo "📁 Found backend/csm directory"
    cd backend/csm
    
    # Try to run with Python
    echo "🚀 Starting Sesame CI from backend/csm..."
    python -m uvicorn sesame_csm:app --host 0.0.0.0 --port 8000 &
    SESAME_PID=$!
    
    cd ../..
    
    echo "✅ Sesame CI started (PID: $SESAME_PID)"
    
else
    echo "⚠️  No local Sesame directory found"
    echo ""
    echo "Trying Docker alternative..."
    
    # Try to use pre-built image
    docker run -d \
        --name sesame-maya \
        -p 8000:8000 \
        -e PYTHONUNBUFFERED=1 \
        --restart unless-stopped \
        ghcr.io/spiralogic/sesame-csm:latest 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Started Sesame from Docker image"
    else
        echo "❌ Could not start Sesame"
        echo ""
        echo "Options:"
        echo "1. Clone Sesame: git clone https://github.com/spiralogic/sesame-csm.git"
        echo "2. Use mock mode: Set SESAME_CI_ENABLED=false in .env"
        exit 1
    fi
fi

# Wait for startup
echo ""
echo "⏳ Waiting for Sesame to start..."
sleep 5

# Test health
echo "🔍 Testing Sesame health..."
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "✅ Sesame is healthy!"
    echo ""
    echo "Endpoints available:"
    echo "  Health: http://localhost:8000/health"
    echo "  CI Shape: http://localhost:8000/ci/shape"
    echo "  TTS: http://localhost:8000/tts"
else
    echo "⚠️  Sesame not responding yet. Give it a few more seconds..."
    echo "  Check: curl http://localhost:8000/health"
fi

echo ""
echo "========================"
echo "Maya's Sacred Voice is ready!"
echo "========================"