#!/bin/bash
# Multi-architecture build script for Mac -> Linux deployment
# Builds linux/amd64 images on Mac ARM64 without local emulation

set -e

# Configuration
REGISTRY="${REGISTRY:-ghcr.io}"
NAMESPACE="${NAMESPACE:-soullabtech}"
PLATFORM="linux/amd64"  # Target platform for Northflank

echo "🚀 Multi-Architecture Build Script"
echo "Building for platform: $PLATFORM"
echo ""

# Check if buildx is available
if ! docker buildx version &> /dev/null; then
    echo "❌ Docker buildx not found. Installing..."
    docker buildx create --name multiarch-builder --use
    docker buildx inspect --bootstrap
else
    echo "✅ Docker buildx is available"
fi

# Build and push Voice Agent (production CUDA image)
echo "🎙️ Building voice-agent for $PLATFORM..."
docker buildx build \
    --platform=$PLATFORM \
    -t "$REGISTRY/$NAMESPACE/voice-agent:latest" \
    --push \
    ../voice-agent/

echo "✅ Voice Agent pushed to registry"

# Build and push Memory Agent  
echo "🧠 Building memory-agent for $PLATFORM..."
docker buildx build \
    --platform=$PLATFORM \
    -t "$REGISTRY/$NAMESPACE/memory-agent:latest" \
    --push \
    ../memory-agent/

echo "✅ Memory Agent pushed to registry"

echo ""
echo "🎉 Multi-arch build complete!"
echo ""
echo "Images pushed:"
echo "  • $REGISTRY/$NAMESPACE/voice-agent:latest"
echo "  • $REGISTRY/$NAMESPACE/memory-agent:latest"
echo ""
echo "Note: These are linux/amd64 images with CUDA support for production use."
echo "For local Mac development, use docker-compose.dev.yml instead."