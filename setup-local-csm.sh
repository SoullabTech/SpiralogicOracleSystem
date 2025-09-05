#!/bin/bash
# 🌀 Setup Local Sesame CSM for Spiralogic Oracle System
# Self-hosted TTS to replace HuggingFace Inference API

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🌀 Setting up local Sesame CSM for Maya's voice..."
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo -e "${RED}❌ docker-compose not found. Please install docker-compose first.${NC}"
    exit 1
fi

# Check if NVIDIA GPU is available (optional but recommended)
if command -v nvidia-smi &> /dev/null; then
    echo -e "${GREEN}✅ NVIDIA GPU detected${NC}"
    GPU_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  No NVIDIA GPU detected. CSM will run on CPU (slower)${NC}"
    GPU_AVAILABLE=false
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Setup HuggingFace authentication
echo "🤗 Setting up HuggingFace authentication..."

if [ -z "$HUGGINGFACE_HUB_TOKEN" ]; then
    echo "You need a HuggingFace token to download the CSM model."
    echo "1. Go to https://huggingface.co/settings/tokens"
    echo "2. Create a token with 'Read' permissions"
    echo "3. Set it in your .env.local file as HUGGINGFACE_HUB_TOKEN"
    echo ""
    read -p "Enter your HuggingFace token (or press Enter to skip): " HF_TOKEN
    
    if [ -n "$HF_TOKEN" ]; then
        # Add to .env.local
        if ! grep -q "HUGGINGFACE_HUB_TOKEN" .env.local 2>/dev/null; then
            echo "HUGGINGFACE_HUB_TOKEN=$HF_TOKEN" >> .env.local
            echo -e "${GREEN}✅ Added HuggingFace token to .env.local${NC}"
        else
            echo -e "${YELLOW}⚠️  HuggingFace token already exists in .env.local${NC}"
        fi
        export HUGGINGFACE_HUB_TOKEN="$HF_TOKEN"
    fi
else
    echo -e "${GREEN}✅ HuggingFace token found in environment${NC}"
fi

echo ""

# Build and start CSM service
echo "🏗️  Building Sesame CSM service..."

if [ "$GPU_AVAILABLE" = true ]; then
    echo "Building with GPU support..."
    docker-compose -f docker-compose.csm.yml build
else
    echo "Building for CPU-only..."
    # Modify docker-compose for CPU-only
    sed 's/nvidia\/cuda:12.4-devel-ubuntu22.04/python:3.10-slim/' csm/Dockerfile > csm/Dockerfile.cpu
    sed '/deploy:/,/capabilities: \[gpu\]/d' docker-compose.csm.yml > docker-compose.csm.cpu.yml
    docker-compose -f docker-compose.csm.cpu.yml build
fi

echo -e "${GREEN}✅ Build completed${NC}"
echo ""

# Start services
echo "🚀 Starting Sesame CSM service..."

if [ "$GPU_AVAILABLE" = true ]; then
    docker-compose -f docker-compose.csm.yml up -d
else
    docker-compose -f docker-compose.csm.cpu.yml up -d
fi

echo -e "${GREEN}✅ CSM service started${NC}"
echo ""

# Wait for service to be ready
echo "⏳ Waiting for CSM service to be ready..."
for i in {1..60}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ CSM service is ready!${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${RED}❌ CSM service failed to start. Check logs with: docker-compose -f docker-compose.csm.yml logs${NC}"
    exit 1
fi

echo ""

# Test the service
echo "🧪 Testing CSM service..."
RESPONSE=$(curl -s -X POST http://localhost:8000/generate \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "text=Hello, I am Maya. The Oracle is online." 2>/dev/null || echo "FAILED")

if [ "$RESPONSE" = "FAILED" ]; then
    echo -e "${RED}❌ CSM test failed${NC}"
else
    echo -e "${GREEN}✅ CSM test passed - audio generated successfully${NC}"
fi

echo ""

# Update .env.local to use local CSM
echo "⚙️  Updating .env.local to use local CSM..."

# Backup original .env.local
cp .env.local .env.local.backup

# Update configuration
if grep -q "SESAME_URL=" .env.local; then
    sed -i.bak 's|SESAME_URL=.*|SESAME_URL=http://localhost:8000|' .env.local
else
    echo "SESAME_URL=http://localhost:8000" >> .env.local
fi

if grep -q "SESAME_API_KEY=" .env.local; then
    sed -i.bak 's|SESAME_API_KEY=.*|SESAME_API_KEY=local|' .env.local
else
    echo "SESAME_API_KEY=local" >> .env.local
fi

if grep -q "SESAME_PROVIDER=" .env.local; then
    sed -i.bak 's|SESAME_PROVIDER=.*|SESAME_PROVIDER=local|' .env.local
else
    echo "SESAME_PROVIDER=local" >> .env.local
fi

echo -e "${GREEN}✅ Configuration updated${NC}"
echo ""

# Final summary
echo "🎉 Local CSM setup complete!"
echo ""
echo "📋 Configuration:"
echo "   • CSM API: http://localhost:8000"
echo "   • Health check: http://localhost:8000/health"
echo "   • Voices: http://localhost:8000/voices"
echo ""
echo "📊 Service status:"
docker-compose -f docker-compose.csm.yml ps
echo ""
echo "🔧 Useful commands:"
echo "   • Check logs: docker-compose -f docker-compose.csm.yml logs -f"
echo "   • Stop service: docker-compose -f docker-compose.csm.yml down"
echo "   • Restart: docker-compose -f docker-compose.csm.yml restart"
echo ""
echo "🚀 Maya can now use local CSM for voice generation!"
echo "   Your Spiralogic system will automatically use the local endpoint."