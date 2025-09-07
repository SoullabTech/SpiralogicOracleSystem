#!/bin/bash
set -e

# === CONFIG ===
DOCKER_USER="andreanezat"   # <-- replace with your Docker Hub username
VOICE_PATH="./voice-agent"  # path to your voice-agent code
MEMORY_PATH="./memory-agent" # path to your memory-agent code

# Colors for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Docker build and push process...${NC}"

# === CLEANUP ===
echo -e "${YELLOW}🧹 Cleaning old build cache...${NC}"
docker system prune -af --volumes || true
docker builder prune -af || true

# === VERIFY BUILDX ===
echo -e "${BLUE}🔧 Setting up Docker buildx...${NC}"
docker buildx create --use --name multiarch-builder || docker buildx use multiarch-builder || true

# === LOGIN ===
echo -e "${BLUE}🔑 Logging into Docker Hub...${NC}"
docker login

# === BUILD + PUSH VOICE AGENT ===
echo -e "${BLUE}🎙️ Building Voice Agent for linux/amd64...${NC}"
if [ ! -d "$VOICE_PATH" ]; then
    echo -e "${RED}❌ Error: Voice agent directory not found at $VOICE_PATH${NC}"
    exit 1
fi

docker buildx build \
  --platform linux/amd64 \
  -t $DOCKER_USER/voice-agent:latest \
  $VOICE_PATH \
  --push

echo -e "${GREEN}✅ Voice Agent built and pushed successfully!${NC}"

# === BUILD + PUSH MEMORY AGENT ===
echo -e "${BLUE}🧠 Building Memory Agent for linux/amd64...${NC}"
if [ ! -d "$MEMORY_PATH" ]; then
    echo -e "${RED}❌ Error: Memory agent directory not found at $MEMORY_PATH${NC}"
    exit 1
fi

docker buildx build \
  --platform linux/amd64 \
  -t $DOCKER_USER/memory-agent:latest \
  $MEMORY_PATH \
  --push

echo -e "${GREEN}✅ Memory Agent built and pushed successfully!${NC}"

# === VERIFICATION ===
echo -e "${BLUE}🔍 Verifying images on Docker Hub...${NC}"

# Function to check if image exists on Docker Hub
check_image() {
    local image=$1
    echo -e "${YELLOW}   Checking $image...${NC}"
    
    # Use Docker Hub API to check if image exists
    response=$(curl -s "https://hub.docker.com/v2/repositories/$image/tags/latest/" || echo "error")
    
    if [[ $response == *"name"* && $response != "error" ]]; then
        echo -e "${GREEN}   ✅ $image:latest verified on Docker Hub${NC}"
        return 0
    else
        echo -e "${RED}   ❌ $image:latest not found on Docker Hub${NC}"
        return 1
    fi
}

# Check both images
voice_ok=false
memory_ok=false

if check_image "$DOCKER_USER/voice-agent"; then
    voice_ok=true
fi

if check_image "$DOCKER_USER/memory-agent"; then
    memory_ok=true
fi

# === SUMMARY ===
echo ""
echo -e "${BLUE}📋 BUILD SUMMARY${NC}"
echo "=================="

if $voice_ok && $memory_ok; then
    echo -e "${GREEN}🎉 ALL BUILDS SUCCESSFUL!${NC}"
    echo ""
    echo -e "${BLUE}Use these image paths in Northflank:${NC}"
    echo -e "  ${GREEN}Voice Agent:  $DOCKER_USER/voice-agent:latest${NC}"
    echo -e "  ${GREEN}Memory Agent: $DOCKER_USER/memory-agent:latest${NC}"
    echo ""
    echo -e "${YELLOW}💡 Next steps:${NC}"
    echo "  1. Go to Northflank dashboard"
    echo "  2. Create new services using these image paths"
    echo "  3. Set environment variables as needed"
    echo "  4. Deploy and test!"
else
    echo -e "${RED}❌ Some builds failed or verification incomplete${NC}"
    if ! $voice_ok; then
        echo -e "  ${RED}- Voice Agent build/push failed${NC}"
    fi
    if ! $memory_ok; then
        echo -e "  ${RED}- Memory Agent build/push failed${NC}"
    fi
    echo ""
    echo -e "${YELLOW}💡 Troubleshooting:${NC}"
    echo "  1. Check Docker Hub login: docker login"
    echo "  2. Verify Dockerfiles exist in agent directories"
    echo "  3. Check Docker Hub repository permissions"
    exit 1
fi

# === BONUS: Show image sizes ===
echo ""
echo -e "${BLUE}📊 Image Information:${NC}"
docker images | grep "$DOCKER_USER" | grep -E "(voice-agent|memory-agent)" || true

echo ""
echo -e "${GREEN}🏁 Build and push process complete!${NC}"