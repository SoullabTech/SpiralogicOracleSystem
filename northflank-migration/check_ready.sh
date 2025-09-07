#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking if everything is ready for Docker build...${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "build_and_push.sh" ]; then
    echo -e "${RED}❌ build_and_push.sh not found. Run this from northflank-migration/ directory${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Docker is running${NC}"
fi

# Check if buildx is available
if ! docker buildx version >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker buildx not available. Installing...${NC}"
    docker buildx install || true
fi

# Check voice-agent directory and Dockerfile
if [ ! -d "voice-agent" ]; then
    echo -e "${RED}❌ voice-agent directory not found${NC}"
    echo -e "${YELLOW}💡 Create it with: mkdir -p voice-agent${NC}"
    exit 1
elif [ ! -f "voice-agent/Dockerfile" ]; then
    echo -e "${RED}❌ voice-agent/Dockerfile not found${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Voice agent ready${NC}"
fi

# Check memory-agent directory and Dockerfile
if [ ! -d "memory-agent" ]; then
    echo -e "${RED}❌ memory-agent directory not found${NC}"
    echo -e "${YELLOW}💡 Create it with: mkdir -p memory-agent${NC}"
    exit 1
elif [ ! -f "memory-agent/Dockerfile" ]; then
    echo -e "${RED}❌ memory-agent/Dockerfile not found${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Memory agent ready${NC}"
fi

# Check Docker Hub credentials
echo -e "${BLUE}🔑 Checking Docker Hub access...${NC}"
if docker login --username andreanezat --password-stdin < /dev/null 2>/dev/null; then
    echo -e "${GREEN}✅ Already logged into Docker Hub${NC}"
else
    echo -e "${YELLOW}⚠️  Not logged into Docker Hub. You'll be prompted to login during build.${NC}"
fi

# Check if build script is executable
if [ ! -x "build_and_push.sh" ]; then
    echo -e "${YELLOW}⚠️  Making build_and_push.sh executable...${NC}"
    chmod +x build_and_push.sh
fi

# Test build voice agent (dry run)
echo -e "${BLUE}🧪 Testing voice agent Dockerfile syntax...${NC}"
if docker build --dry-run voice-agent/ >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Voice agent Dockerfile syntax OK${NC}"
else
    echo -e "${RED}❌ Voice agent Dockerfile has syntax errors${NC}"
    exit 1
fi

# Test build memory agent (dry run)
echo -e "${BLUE}🧪 Testing memory agent Dockerfile syntax...${NC}"
if docker build --dry-run memory-agent/ >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Memory agent Dockerfile syntax OK${NC}"
else
    echo -e "${RED}❌ Memory agent Dockerfile has syntax errors${NC}"
    exit 1
fi

# Check available disk space
available_space=$(df -h . | tail -1 | awk '{print $4}')
echo -e "${BLUE}💾 Available disk space: ${available_space}${NC}"

# Final summary
echo ""
echo -e "${GREEN}🎉 Everything looks ready!${NC}"
echo ""
echo -e "${BLUE}Next step:${NC}"
echo -e "  ${GREEN}./build_and_push.sh${NC}"
echo ""
echo -e "${BLUE}This will:${NC}"
echo -e "  📦 Build both Docker images for linux/amd64"
echo -e "  🚀 Push them to Docker Hub as:"
echo -e "    • andreanezat/voice-agent:latest"
echo -e "    • andreanezat/memory-agent:latest"
echo -e "  ✅ Verify they're available on Docker Hub"
echo ""