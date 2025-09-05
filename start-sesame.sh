#!/bin/bash

# Start Sesame CSM Production Container
# Usage: ./start-sesame.sh

set -e

CONTAINER_NAME="sesame-csm-prod"
IMAGE_NAME="sesame-csm:latest"
PORT=8000

echo "🔥 Starting Sesame CSM Production Container..."

# Stop existing container if running
if docker ps -a --format "table {{.Names}}" | grep -q "$CONTAINER_NAME"; then
    echo "📦 Stopping existing container: $CONTAINER_NAME"
    docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
fi

# Build image if it doesn't exist
if ! docker images --format "table {{.Repository}}:{{.Tag}}" | grep -q "$IMAGE_NAME"; then
    echo "🏗️  Building Sesame CSM image..."
    cd sesame_csm_openai
    docker build -f Dockerfile.sesame-prod -t "$IMAGE_NAME" .
    cd ..
fi

# Run container with GPU support
echo "🚀 Launching container on port $PORT..."
docker run --gpus all \
    --name "$CONTAINER_NAME" \
    -p "$PORT:8000" \
    -d \
    "$IMAGE_NAME"

# Wait for container to be ready
echo "⏳ Waiting for Sesame to initialize..."
sleep 5

# Health check
echo "🏥 Checking health..."
if curl -s "http://localhost:$PORT/health" >/dev/null; then
    echo "✅ Sesame CSM is running on http://localhost:$PORT"
    echo "🎤 Test voice with: curl -X POST http://localhost:$PORT/tts -H 'Content-Type: application/json' -d '{\"text\":\"Maya voice test\",\"voice\":\"maya\"}' --output test-maya.wav"
else
    echo "❌ Health check failed. Check logs:"
    echo "   docker logs $CONTAINER_NAME"
fi