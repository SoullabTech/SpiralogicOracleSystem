#!/bin/bash
# Test script for local Sesame TTS Docker service

set -e

echo "🎤 Testing Local Sesame TTS Service..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Build and start the service
echo -e "${YELLOW}🔨 Building Sesame TTS service...${NC}"
docker compose build sesame-tts

echo -e "${YELLOW}🚀 Starting Sesame TTS service...${NC}"
docker compose up -d sesame-tts

echo -e "${YELLOW}⏳ Waiting for service to be ready...${NC}"
sleep 10

# Check if container is running
if ! docker ps | grep -q sesame-tts; then
    echo -e "${RED}❌ Container failed to start${NC}"
    echo "Container logs:"
    docker logs sesame-tts
    exit 1
fi

echo -e "${GREEN}✅ Container is running${NC}"

# Test health endpoint
echo -e "${YELLOW}🏥 Testing health endpoint...${NC}"
if curl -s http://localhost:8081/ping > /dev/null; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Container logs:"
    docker logs sesame-tts --tail 20
    exit 1
fi

# Test models endpoint
echo -e "${YELLOW}📋 Testing models endpoint...${NC}"
curl -s http://localhost:8081/v1/models | jq . || echo "Models endpoint response (no jq):"

# Test TTS synthesis
echo -e "${YELLOW}🗣️  Testing TTS synthesis...${NC}"
if curl -s -X POST http://localhost:8081/v1/audio/speech \
    -H 'content-type: application/json' \
    -d '{"model":"sesame/csm-1b","voice":"maya","input":"Hello from local Sesame TTS"}' \
    --output test-maya-local.wav; then
    echo -e "${GREEN}✅ TTS synthesis completed${NC}"
    echo "Audio saved to test-maya-local.wav"
    
    # Try to open the audio file on Mac
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open test-maya-local.wav 2>/dev/null || echo "Audio file created but couldn't auto-open"
    fi
else
    echo -e "${RED}❌ TTS synthesis failed${NC}"
    echo "Container logs:"
    docker logs sesame-tts --tail 20
    exit 1
fi

echo -e "${GREEN}🎉 All tests passed! Local Sesame TTS is working.${NC}"
echo ""
echo "Next steps:"
echo "1. Update your .env.local:"
echo "   VOICE_PROVIDER=sesame"
echo "   SESAME_PROVIDER=local" 
echo "   SESAME_BASE_URL=http://localhost:8081"
echo ""
echo "2. Restart your Next.js dev server: npm run dev"
echo ""
echo "3. Test your app's voice endpoint:"
echo "   curl -X POST http://localhost:3000/api/voice/sesame \\"
echo "     -H 'content-type: application/json' \\"
echo "     -d '{\"text\":\"Maya speaking via local Docker\"}' \\"
echo "     --output maya.wav && open maya.wav"