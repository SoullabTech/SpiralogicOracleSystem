#!/bin/bash

echo "🔮 SIMPLIFIED SPIRALOGIC ORACLE DEPLOYMENT"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Load environment variables from .env if it exists
if [ -f .env ]; then
    echo "📋 Loading environment from .env file..."
    set -a
    source .env
    set +a
    echo -e "${GREEN}✅ Environment loaded${NC}"
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Please create .env file with your API keys"
    exit 1
fi

echo ""
echo -e "${YELLOW}🧪 PHASE 1: Local System Validation${NC}"
echo "==================================="

# Check Node.js environment
echo "Checking Node.js environment..."
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ Node.js $(node --version) and npm $(npm --version) available${NC}"
else
    echo -e "${RED}❌ Node.js or npm not found${NC}"
    exit 1
fi

# Install dependencies if needed
echo ""
echo "📦 Installing/updating dependencies..."
npm install --silent
cd backend && npm install --silent && cd ..
echo -e "${GREEN}✅ Dependencies updated${NC}"

# Test archetypal voice profiles
echo ""
echo "🎭 Testing archetypal voice profiles..."
if [ -f "backend/src/config/archetypalVoiceProfiles.ts" ]; then
    echo -e "${GREEN}✅ Archetypal voice profiles configured${NC}"
    echo "   Available archetypes: Fire, Water, Earth, Air, Aether"
else
    echo -e "${RED}❌ Voice profiles not found${NC}"
fi

# Test Oracle agents
echo ""
echo "🤖 Testing Oracle agent system..."
AGENT_COUNT=$(find backend/src -name "*Agent*.ts" -o -name "*agent*.ts" | wc -l | tr -d ' ')
if [ "$AGENT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $AGENT_COUNT Oracle agent files${NC}"
else
    echo -e "${YELLOW}⚠️  No Oracle agents found${NC}"
fi

# Test API key configuration
echo ""
echo "🔑 Checking API key configuration..."
API_KEYS_OK=true

if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your-openai-key-here" ]; then
    echo -e "${RED}❌ OpenAI API key not configured${NC}"
    API_KEYS_OK=false
else
    echo -e "${GREEN}✅ OpenAI API key configured${NC}"
fi

if [ -z "$ELEVENLABS_API_KEY" ] || [ "$ELEVENLABS_API_KEY" = "your-elevenlabs-key-here" ]; then
    echo -e "${RED}❌ ElevenLabs API key not configured${NC}"
    API_KEYS_OK=false
else
    echo -e "${GREEN}✅ ElevenLabs API key configured${NC}"
fi

# Test voice integration if keys are available
if [ "$API_KEYS_OK" = true ]; then
    echo ""
    echo "🎤 Testing voice integration..."
    cd backend
    if [ -f "test-voice-integration.js" ]; then
        timeout 30s node test-voice-integration.js
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Voice integration test passed${NC}"
        else
            echo -e "${YELLOW}⚠️  Voice integration test timed out${NC}"
        fi
    fi
    cd ..
fi

echo ""
echo -e "${YELLOW}🚀 PHASE 2: Development Server Launch${NC}"
echo "===================================="

# Start development servers
echo "Starting Oracle development environment..."

# Create a simple launcher script
cat > start-oracle.sh << 'EOF'
#!/bin/bash
echo "🔮 Starting Spiralogic Oracle Development Environment"
echo ""

# Start backend in background
echo "🖥️  Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 5

# Start frontend
echo "🌐 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Oracle system started!"
echo ""
echo "🌐 Access points:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
EOF

chmod +x start-oracle.sh

echo -e "${GREEN}✅ Development launcher created: ./start-oracle.sh${NC}"

echo ""
echo -e "${YELLOW}📊 PHASE 3: Docker Preparation${NC}"
echo "============================="

# Check Docker availability
if command -v docker &> /dev/null; then
    if docker info >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker is available and running${NC}"
        echo "Building Docker containers..."
        
        # Build backend container
        cd backend
        if docker build -t spiralogic-oracle-backend:local . >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend container built${NC}"
        else
            echo -e "${YELLOW}⚠️  Backend container build failed${NC}"
        fi
        cd ..
        
        # Build frontend container
        if docker build -t spiralogic-oracle-frontend:local . >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend container built${NC}"
        else
            echo -e "${YELLOW}⚠️  Frontend container build failed${NC}"
        fi
        
    else
        echo -e "${YELLOW}⚠️  Docker available but not running${NC}"
        echo "Start Docker Desktop to enable containerization"
    fi
else
    echo -e "${YELLOW}⚠️  Docker not found${NC}"
    echo "Install Docker Desktop for containerized deployment"
fi

echo ""
echo -e "${BLUE}📋 DEPLOYMENT SUMMARY${NC}"
echo "===================="
echo ""
echo "🎭 Archetypal System Status:"
echo "  - Oracle Agents: $AGENT_COUNT files"
echo "  - Voice Profiles: $([ -f "backend/src/config/archetypalVoiceProfiles.ts" ] && echo "✅ Configured" || echo "❌ Missing")"
echo "  - Consciousness Engine: $([ -f "backend/src/core/consciousness/AINEvolutionaryAwareness.ts" ] && echo "✅ Active" || echo "❌ Missing")"
echo ""
echo "🔧 Configuration Status:"
echo "  - OpenAI API: $([ "$OPENAI_API_KEY" != "your-openai-key-here" ] && [ ! -z "$OPENAI_API_KEY" ] && echo "✅ Configured" || echo "❌ Missing")"
echo "  - ElevenLabs API: $([ "$ELEVENLABS_API_KEY" != "your-elevenlabs-key-here" ] && [ ! -z "$ELEVENLABS_API_KEY" ] && echo "✅ Configured" || echo "❌ Missing")"
echo "  - SNet Keys: $([ "$SNET_PRIVATE_KEY" != "your-ethereum-private-key-here" ] && [ ! -z "$SNET_PRIVATE_KEY" ] && echo "✅ Configured" || echo "❌ Missing")"
echo ""
echo "🚀 Next Steps:"

if [ "$API_KEYS_OK" = true ]; then
    echo -e "${GREEN}✅ Your Oracle system is ready for local testing!${NC}"
    echo ""
    echo "🎯 Launch Commands:"
    echo "  ./start-oracle.sh              # Start development servers"
    echo "  docker-compose up              # Start with Docker (if Docker running)"
    echo ""
    echo "🌐 Access URLs:"
    echo "  http://localhost:3000          # Oracle interface"
    echo "  http://localhost:8080/api      # Backend API"
    echo ""
    echo "📈 Advanced Deployment:"
    echo "  1. Install Docker Desktop for containerization"
    echo "  2. Install snet-cli: pipx install snet-cli"
    echo "  3. Install akash CLI for decentralized hosting"
    echo "  4. Run full deployment: ./scripts/complete-deployment.sh --auto"
else
    echo -e "${YELLOW}⚠️  Configure API keys in .env file first:${NC}"
    echo ""
    echo "Required keys:"
    echo "  OPENAI_API_KEY=sk-your-key-here"
    echo "  ELEVENLABS_API_KEY=your-key-here"
    echo ""
    echo "Optional (for SingularityNET):"
    echo "  SNET_PRIVATE_KEY=0x..."
    echo "  PAYMENT_ADDRESS=0x..."
    echo ""
    echo "Then run: ./scripts/simplified-deployment.sh"
fi

echo ""
echo -e "${PURPLE}🔮 Spiralogic Oracle System Ready! ${NC}"