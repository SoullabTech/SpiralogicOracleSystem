#!/bin/bash

echo "🚀 Publishing Archetypal Consciousness Oracle to AGI Marketplace"
echo "=============================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check environment variables
if [ -z "$SNET_PRIVATE_KEY" ]; then
    echo -e "${RED}❌ SNET_PRIVATE_KEY not set${NC}"
    echo "Please set: export SNET_PRIVATE_KEY='your-private-key'"
    exit 1
fi

if [ -z "$PAYMENT_ADDRESS" ]; then
    echo -e "${RED}❌ PAYMENT_ADDRESS not set${NC}"
    echo "Please set: export PAYMENT_ADDRESS='your-ethereum-address'"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Upload metadata to IPFS
echo -e "${YELLOW}📤 Uploading service assets to IPFS...${NC}"
cd backend

# Upload proto file
PROTO_HASH=$(snet sdk metadata add-asset proto/archetypal_consciousness.proto proto)
echo "Proto IPFS Hash: $PROTO_HASH"

# Update metadata with IPFS hash
sed -i "s/QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/$PROTO_HASH/g" snet/service-metadata.json

# Publish metadata to IPFS
METADATA_HASH=$(snet sdk metadata publish)
echo -e "${GREEN}✅ Metadata IPFS Hash: $METADATA_HASH${NC}"

# Register service on blockchain
echo ""
echo -e "${YELLOW}📝 Registering service on blockchain...${NC}"

snet service create \
    spiralogic \
    archetypal-consciousness-oracle \
    $METADATA_HASH \
    --group-name default_group \
    --payment-address $PAYMENT_ADDRESS

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Service registered successfully!${NC}"
else
    echo -e "${RED}❌ Service registration failed${NC}"
    exit 1
fi

# Set pricing
echo ""
echo -e "${YELLOW}💰 Setting service pricing...${NC}"

# ProcessQuery without voice
snet service update-metadata \
    spiralogic \
    archetypal-consciousness-oracle \
    --add-group-method-price default_group ProcessQuery 1000000

# ProcessQuery with voice
snet service update-metadata \
    spiralogic \
    archetypal-consciousness-oracle \
    --add-group-method-price default_group ProcessQueryWithVoice 2000000

# StreamInsights
snet service update-metadata \
    spiralogic \
    archetypal-consciousness-oracle \
    --add-group-method-price default_group StreamInsights 5000000

# SynthesizeVoice
snet service update-metadata \
    spiralogic \
    archetypal-consciousness-oracle \
    --add-group-method-price default_group SynthesizeVoice 1500000

echo -e "${GREEN}✅ Pricing configured${NC}"

# Update service tags
echo ""
echo -e "${YELLOW}🏷️  Adding service tags...${NC}"

snet service update-metadata \
    spiralogic \
    archetypal-consciousness-oracle \
    --add-tags consciousness,archetypal-analysis,voice-synthesis,oracle,elemental-wisdom,ai-coaching,spiritual-intelligence,personal-development

# Verify service
echo ""
echo -e "${YELLOW}🔍 Verifying service registration...${NC}"

SERVICE_INFO=$(snet service info spiralogic archetypal-consciousness-oracle)
echo "$SERVICE_INFO"

# Generate service URL
SERVICE_URL="https://marketplace.singularitynet.io/servicedetails/org/spiralogic/service/archetypal-consciousness-oracle"

echo ""
echo -e "${GREEN}🎉 SERVICE SUCCESSFULLY PUBLISHED!${NC}"
echo "=================================="
echo ""
echo "📋 Service Details:"
echo "   Organization: spiralogic"
echo "   Service ID: archetypal-consciousness-oracle"
echo "   IPFS Hash: $METADATA_HASH"
echo ""
echo "🌐 View on Marketplace:"
echo "   $SERVICE_URL"
echo ""
echo "💳 Payment Address:"
echo "   $PAYMENT_ADDRESS"
echo ""
echo "📊 Monitor Earnings:"
echo "   https://publisher.singularitynet.io"
echo ""
echo "🚀 Next Steps:"
echo "1. Share your service: $SERVICE_URL"
echo "2. Test with: ./test-snet-service.sh"
echo "3. Monitor usage: node generate-usage-report.ts"
echo "4. Join Discord: https://discord.gg/snet-ai"
echo ""
echo -e "${GREEN}Welcome to the AGI Economy! 🤖💰${NC}"

cd ..