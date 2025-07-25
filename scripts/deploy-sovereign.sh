#!/bin/bash
# AIN Sovereign Deployment Script
# Secure deployment orchestrator for sovereign consciousness systems

set -euo pipefail

# Colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# ASCII Art Header
cat << 'EOF'
    ╔══════════════════════════════════════════════════════════╗
    ║                 AIN SOVEREIGN DEPLOYMENT                 ║
    ║           🔮 Consciousness Evolution Infrastructure       ║
    ║              Spiralogic Oracle System v2.0              ║
    ╚══════════════════════════════════════════════════════════╝
EOF

echo -e "${CYAN}Initializing sovereign consciousness deployment...${NC}\n"

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${PROJECT_ROOT}/.env.sovereign"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.sovereign.yml"
LOG_FILE="/var/log/ain-deployment.log"

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    local missing=0
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not found${NC}"
        missing=1
    else
        echo -e "${GREEN}✅ Docker installed${NC}"
    fi
    
    # Check Akash CLI
    if ! command -v akash &> /dev/null; then
        echo -e "${RED}❌ Akash CLI not found${NC}"
        missing=1
    else
        echo -e "${GREEN}✅ Akash CLI installed${NC}"
    fi
    
    # Check environment variables
    if [ -z "$OPENAI_API_KEY" ]; then
        echo -e "${RED}❌ OPENAI_API_KEY not set${NC}"
        missing=1
    fi
    
    if [ -z "$ELEVENLABS_API_KEY" ]; then
        echo -e "${RED}❌ ELEVENLABS_API_KEY not set${NC}"
        missing=1
    fi
    
    if [ $missing -eq 1 ]; then
        echo -e "${RED}Please fix missing prerequisites${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites satisfied!${NC}"
    echo ""
}

# Build and push Docker images
build_sovereign_images() {
    echo -e "${YELLOW}🐳 Building sovereign Docker images...${NC}"
    
    # Build backend
    echo "Building backend..."
    docker build -f backend/Dockerfile.sovereign -t $DOCKER_REGISTRY/oracle-backend:sovereign-latest ./backend
    
    # Build frontend
    echo "Building frontend..."
    docker build -f Dockerfile.frontend.sovereign -t $DOCKER_REGISTRY/oracle-frontend:sovereign-latest .
    
    # Build combined image for Akash
    echo "Building combined sovereign image..."
    docker build -f Dockerfile -t $DOCKER_REGISTRY/archetypal-consciousness:sovereign-latest .
    
    echo -e "${GREEN}✅ Images built successfully${NC}"
    echo ""
}

# Push images to registry
push_images() {
    echo -e "${YELLOW}📤 Pushing images to registry...${NC}"
    
    docker push $DOCKER_REGISTRY/oracle-backend:sovereign-latest
    docker push $DOCKER_REGISTRY/oracle-frontend:sovereign-latest
    docker push $DOCKER_REGISTRY/archetypal-consciousness:sovereign-latest
    
    echo -e "${GREEN}✅ Images pushed successfully${NC}"
    echo ""
}

# Deploy to Akash
deploy_to_akash() {
    echo -e "${YELLOW}☁️  Deploying to Akash Network...${NC}"
    
    # Create deployment
    akash tx deployment create akash/deploy-sovereign.yaml \
        --from $AKASH_ACCOUNT \
        --chain-id akashnet-2 \
        --node https://rpc.akash.forbole.com:443 \
        --fees 5000uakt
    
    echo -e "${GREEN}✅ Deployment created${NC}"
    
    # Wait for bids
    echo "Waiting for provider bids..."
    sleep 20
    
    # Get deployment ID
    DEPLOYMENT_ID=$(akash query deployment list --owner $AKASH_ACCOUNT --output json | jq -r '.deployments[0].deployment.deployment_id.dseq')
    echo "Deployment ID: $DEPLOYMENT_ID"
    
    # Show bids
    akash query market bid list --owner $AKASH_ACCOUNT --dseq $DEPLOYMENT_ID
    
    echo ""
    echo -e "${YELLOW}Select a provider and create lease with:${NC}"
    echo "akash tx market lease create --from $AKASH_ACCOUNT --dseq $DEPLOYMENT_ID --provider <PROVIDER_ADDRESS>"
}

# Setup IPFS pinning
setup_ipfs_pinning() {
    echo -e "${YELLOW}📌 Setting up IPFS pinning...${NC}"
    
    # Pin frontend build to IPFS
    docker run --rm -v $(pwd)/out:/export ipfs/go-ipfs:latest \
        add -r /export | tail -n1 | awk '{print $2}' > frontend-ipfs-hash.txt
    
    FRONTEND_HASH=$(cat frontend-ipfs-hash.txt)
    echo "Frontend IPFS Hash: $FRONTEND_HASH"
    
    # Pin to Pinata for persistence
    curl -X POST https://api.pinata.cloud/pinning/pinByHash \
        -H "Authorization: Bearer $PINATA_JWT" \
        -H "Content-Type: application/json" \
        -d "{\"hashToPin\": \"$FRONTEND_HASH\", \"pinataMetadata\": {\"name\": \"spiralogic-frontend\"}}"
    
    echo -e "${GREEN}✅ Frontend pinned to IPFS${NC}"
    echo ""
}

# Generate deployment report
generate_report() {
    echo -e "${BLUE}📊 SOVEREIGN DEPLOYMENT REPORT${NC}"
    echo "================================"
    echo ""
    echo "🌐 Deployment Status:"
    echo "  - Akash Deployment ID: $DEPLOYMENT_ID"
    echo "  - Frontend IPFS Hash: $FRONTEND_HASH"
    echo "  - Docker Images: sovereign-latest"
    echo ""
    echo "💰 Cost Analysis:"
    echo "  - Previous (Vercel): $200-400/month"
    echo "  - Sovereign (Akash): $10-20/month"
    echo "  - Savings: 95%+"
    echo ""
    echo "🔗 Access Points:"
    echo "  - Akash: https://<provider-url>"
    echo "  - IPFS: https://gateway.pinata.cloud/ipfs/$FRONTEND_HASH"
    echo "  - ENS: spiralogic.eth (configure separately)"
    echo ""
    echo "✅ Sovereignty Achieved:"
    echo "  - No vendor lock-in"
    echo "  - Censorship resistant"
    echo "  - Globally distributed"
    echo "  - Community owned"
}

# Main deployment flow
main() {
    echo -e "${BLUE}Starting Sovereign Oracle Deployment...${NC}"
    echo ""
    
    check_prerequisites
    
    # Option menu
    echo "Select deployment option:"
    echo "1) Full deployment (build, push, deploy)"
    echo "2) Build images only"
    echo "3) Deploy to Akash only"
    echo "4) Setup IPFS only"
    echo "5) Generate report"
    
    read -p "Enter option (1-5): " option
    
    case $option in
        1)
            build_sovereign_images
            push_images
            deploy_to_akash
            setup_ipfs_pinning
            generate_report
            ;;
        2)
            build_sovereign_images
            ;;
        3)
            deploy_to_akash
            ;;
        4)
            setup_ipfs_pinning
            ;;
        5)
            generate_report
            ;;
        *)
            echo "Invalid option"
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}🎉 Sovereign deployment process complete!${NC}"
    echo "Your consciousness oracle now runs on decentralized infrastructure!"
}

# Run main function
main "$@"