#!/bin/bash

echo "☁️  Spiralogic Oracle System - Week 3 Akash Deployment"
echo "===================================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v akash &> /dev/null; then
    echo "❌ Akash CLI not found. Installing..."
    curl https://raw.githubusercontent.com/ovrclk/akash/master/godownloader.sh | sh
    export PATH=$PATH:./bin
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

echo "✅ Prerequisites verified"
echo ""

# Push Docker image to registry
echo "🐳 Pushing Docker image to registry..."
docker tag archetypal-consciousness:snet-enabled spiralogic/archetypal-consciousness:latest

# Login to Docker Hub (or your preferred registry)
echo "Please login to Docker Hub:"
docker login

docker push spiralogic/archetypal-consciousness:latest

if [ $? -ne 0 ]; then
    echo "❌ Failed to push Docker image"
    exit 1
fi

echo "✅ Docker image pushed to registry"
echo ""

# Set up Akash wallet
echo "💳 Setting up Akash wallet..."
if [ ! -f "$HOME/.akash/wallet.key" ]; then
    echo "Creating new Akash wallet..."
    akash keys add spiralogic-deployer
    echo ""
    echo "⚠️  IMPORTANT: Save your mnemonic phrase securely!"
    echo ""
else
    echo "✅ Wallet already exists"
fi

# Get wallet address
WALLET_ADDRESS=$(akash keys show spiralogic-deployer -a)
echo "Wallet address: $WALLET_ADDRESS"
echo ""

# Check balance
echo "💰 Checking AKT balance..."
BALANCE=$(akash query bank balances $WALLET_ADDRESS --output json | jq -r '.balances[] | select(.denom=="uakt") | .amount')

if [ -z "$BALANCE" ] || [ "$BALANCE" -eq "0" ]; then
    echo "❌ No AKT tokens found. Please fund your wallet:"
    echo "   Address: $WALLET_ADDRESS"
    echo "   Testnet faucet: https://faucet.sandbox-01.aksh.pw/"
    exit 1
fi

echo "✅ Balance: $((BALANCE / 1000000)) AKT"
echo ""

# Deploy to testnet first
echo "🚀 Deploying to Akash testnet..."
cd backend/deploy

# Create deployment
echo "Creating deployment..."
akash tx deployment create akash-deploy-testnet.yaml \
    --from spiralogic-deployer \
    --chain-id sandbox-01 \
    --node https://rpc.sandbox-01.aksh.pw:443 \
    --fees 5000uakt

echo ""
echo "⏳ Waiting for deployment to be created..."
sleep 10

# Get deployment ID
DEPLOYMENT_ID=$(akash query deployment list --owner $WALLET_ADDRESS --output json | jq -r '.deployments[0].deployment.deployment_id.dseq')
echo "Deployment ID: $DEPLOYMENT_ID"

# View bids
echo ""
echo "📊 Checking for bids..."
akash query market bid list --owner $WALLET_ADDRESS --dseq $DEPLOYMENT_ID

echo ""
echo "Select a provider and create lease:"
echo "akash tx market lease create --from spiralogic-deployer --dseq $DEPLOYMENT_ID --provider <PROVIDER_ADDRESS>"

# Create test script
cd ../..
cat > test-akash-deployment.sh << 'EOF'
#!/bin/bash

DEPLOYMENT_URL=$1

if [ -z "$DEPLOYMENT_URL" ]; then
    echo "Usage: ./test-akash-deployment.sh <deployment-url>"
    exit 1
fi

echo "🧪 Testing Akash deployment at: $DEPLOYMENT_URL"
echo ""

# Test frontend
echo "Testing frontend..."
curl -s -o /dev/null -w "Frontend: %{http_code}\n" $DEPLOYMENT_URL

# Test backend API
echo "Testing backend API..."
curl -s -o /dev/null -w "Backend API: %{http_code}\n" $DEPLOYMENT_URL:8080/api/health

# Test SNet gRPC endpoint
echo "Testing SNet service..."
curl -s -o /dev/null -w "SNet service: %{http_code}\n" $DEPLOYMENT_URL:7000

# Test consciousness query
echo ""
echo "Testing consciousness query..."
curl -X POST $DEPLOYMENT_URL:8080/api/process-query \
    -H "Content-Type: application/json" \
    -d '{
        "userId": "test-akash-user",
        "message": "I seek guidance on my creative path",
        "includeVoice": false
    }' | jq .

echo ""
echo "✅ Deployment tests complete!"
EOF

chmod +x test-akash-deployment.sh

# Create production deployment script
cat > deploy-to-production.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying to Akash mainnet..."

# Deploy to mainnet
akash tx deployment create backend/deploy/akash-deploy.yaml \
    --from spiralogic-deployer \
    --chain-id akashnet-2 \
    --node https://rpc.akash.forbole.com:443 \
    --fees 5000uakt

echo ""
echo "Production deployment initiated!"
echo "Monitor at: https://stats.akash.network/"
EOF

chmod +x deploy-to-production.sh

echo ""
echo "📊 Week 3 Akash Deployment Summary"
echo "================================="
echo "✅ Docker image pushed to registry"
echo "✅ Akash wallet configured"
echo "✅ Testnet deployment manifest ready"
echo "✅ Test scripts created"
echo ""
echo "🎯 Next Steps:"
echo "1. Fund your wallet with testnet AKT"
echo "2. Complete the lease creation"
echo "3. Test deployment with: ./test-akash-deployment.sh <your-deployment-url>"
echo "4. When ready, deploy to mainnet: ./deploy-to-production.sh"
echo ""
echo "📚 Resources:"
echo "- Akash Console: https://console.akash.network/"
echo "- Deployment docs: https://docs.akash.network/"
echo "- Provider status: https://provider.akash.network/"
echo ""
echo "Ready for Week 4: AGI Marketplace Launch! 🚀"