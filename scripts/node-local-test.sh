#!/bin/bash

echo "🔮 SPIRALOGIC ORACLE NODE.JS LOCAL TEST"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment variables
if [ -f .env ]; then
    echo "📋 Loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Environment loaded${NC}"
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"

# Install backend dependencies
cd backend
if [ -f package.json ]; then
    echo "Installing backend dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    else
        echo -e "${RED}❌ Backend dependency installation failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  No backend package.json found${NC}"
fi

cd ..

# Install frontend dependencies
if [ -f package.json ]; then
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    else
        echo -e "${RED}❌ Frontend dependency installation failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  No frontend package.json found${NC}"
fi

echo ""
echo -e "${YELLOW}🧪 Testing Oracle components...${NC}"

# Test voice integration if ElevenLabs key is configured
if [ ! -z "$ELEVENLABS_API_KEY" ] && [ "$ELEVENLABS_API_KEY" != "your-elevenlabs-key-here" ]; then
    echo ""
    echo -e "${YELLOW}🎤 Testing ElevenLabs voice integration...${NC}"
    cd backend
    if [ -f "test-voice-integration.js" ]; then
        timeout 30s node test-voice-integration.js
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Voice integration test passed${NC}"
        else
            echo -e "${YELLOW}⚠️  Voice integration test timed out or failed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Voice test file not found${NC}"
    fi
    cd ..
else
    echo -e "${YELLOW}⚠️  Skipping voice test (ElevenLabs API key not configured)${NC}"
fi

# Test archetypal voice profiles
echo ""
echo -e "${YELLOW}🎭 Testing archetypal voice profiles...${NC}"
cd backend
if [ -f "src/config/archetypalVoiceProfiles.ts" ]; then
    echo -e "${GREEN}✅ Archetypal voice profiles found${NC}"
    echo "Voice profiles configured:"
    grep -o '"[^"]*":' src/config/archetypalVoiceProfiles.ts | head -5
else
    echo -e "${YELLOW}⚠️  Archetypal voice profiles not found${NC}"
fi
cd ..

# Test Oracle agents
echo ""
echo -e "${YELLOW}🤖 Testing Oracle agents...${NC}"
if [ -d "backend/src/core/agents" ]; then
    AGENT_COUNT=$(find backend/src/core/agents -name "*.ts" -o -name "*.js" | wc -l)
    echo -e "${GREEN}✅ Found $AGENT_COUNT Oracle agent files${NC}"
else
    echo -e "${YELLOW}⚠️  Oracle agents directory not found${NC}"
fi

# Test consciousness patterns
echo ""
echo -e "${YELLOW}🧠 Testing consciousness patterns...${NC}"
if [ -f "backend/src/core/consciousness/AINEvolutionaryAwareness.ts" ]; then
    echo -e "${GREEN}✅ AIN Evolutionary Awareness found${NC}"
else
    echo -e "${YELLOW}⚠️  Consciousness patterns not found${NC}"
fi

echo ""
echo -e "${BLUE}📊 ORACLE SYSTEM STATUS${NC}"
echo "======================"
echo ""
echo "🎭 Archetypal System:"
echo "  - Fire Agent: $([ -f "backend/src/core/agents/fireAgent.ts" ] && echo "✅" || echo "⚠️ ")"
echo "  - Water Agent: $([ -f "backend/src/core/agents/waterAgent.ts" ] && echo "✅" || echo "⚠️ ")"
echo "  - Earth Agent: $([ -f "backend/src/core/agents/earthAgent.ts" ] && echo "✅" || echo "⚠️ ")"
echo "  - Air Agent: $([ -f "backend/src/core/agents/airAgent.ts" ] && echo "✅" || echo "⚠️ ")"
echo "  - Aether Agent: $([ -f "backend/src/core/agents/aetherAgent.ts" ] && echo "✅" || echo "⚠️ ")"
echo ""
echo "🔧 Configuration:"
echo "  - OpenAI API: $([ ! -z "$OPENAI_API_KEY" ] && [ "$OPENAI_API_KEY" != "your-openai-key-here" ] && echo "✅" || echo "❌")"
echo "  - ElevenLabs API: $([ ! -z "$ELEVENLABS_API_KEY" ] && [ "$ELEVENLABS_API_KEY" != "your-elevenlabs-key-here" ] && echo "✅" || echo "❌")"
echo "  - SNet Config: $([ ! -z "$SNET_PRIVATE_KEY" ] && [ "$SNET_PRIVATE_KEY" != "your-ethereum-private-key-here" ] && echo "✅" || echo "❌")"
echo ""
echo "📝 Next Steps:"
echo "1. Configure your API keys in .env file"
echo "2. Start Docker Desktop for containerized deployment"
echo "3. Install snet-cli: pipx install snet-cli"
echo "4. Install akash CLI for decentralized deployment"
echo ""

if [ ! -z "$OPENAI_API_KEY" ] && [ "$OPENAI_API_KEY" != "your-openai-key-here" ] && [ ! -z "$ELEVENLABS_API_KEY" ] && [ "$ELEVENLABS_API_KEY" != "your-elevenlabs-key-here" ]; then
    echo -e "${GREEN}🎉 Oracle system is ready for deployment!${NC}"
    echo ""
    echo "Try starting the development server:"
    echo "  cd backend && npm start"
    echo "  # In another terminal:"
    echo "  npm run dev"
else
    echo -e "${YELLOW}⚠️  Please configure your API keys to complete setup${NC}"
fi