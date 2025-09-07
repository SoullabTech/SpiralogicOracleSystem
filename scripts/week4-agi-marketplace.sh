#!/bin/bash

echo "🤖 Spiralogic Oracle System - Week 4 AGI Marketplace Launch"
echo "========================================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v snet &> /dev/null; then
    echo "❌ SNet CLI not found. Please install with: pip3 install snet-cli"
    exit 1
fi

echo "✅ Prerequisites verified"
echo ""

# Configure SNet CLI
echo "🔧 Configuring SingularityNET CLI..."
snet identity create spiralogic key \
    --private-key $SNET_PRIVATE_KEY \
    --network mainnet

snet network mainnet

# Create organization if not exists
echo "🏢 Setting up organization..."
snet organization metadata-init \
    spiralogic \
    "Spiralogic AI" \
    --description "Pioneering consciousness intelligence systems" \
    --contacts "support@spiralogic.ai" \
    --website "https://spiralogic.ai"

# Initialize service metadata
echo "📝 Initializing service metadata..."
cd backend
snet service metadata-init \
    snet/service-metadata.json \
    archetypal-consciousness-oracle \
    --metadata-file snet/service-metadata.json

# Add pricing
echo "💰 Setting up pricing model..."
snet service metadata-add-group \
    default_group \
    $PAYMENT_ADDRESS

snet service metadata-set-fixed-price \
    default_group \
    0.00001000

# Upload to IPFS
echo "📤 Uploading to IPFS..."
PROTO_IPFS_HASH=$(snet mpe service metadata-add-asset \
    proto/archetypal_consciousness.proto \
    proto)

echo "Proto IPFS Hash: $PROTO_IPFS_HASH"

# Register service
echo "🚀 Registering service on blockchain..."
snet service publish \
    spiralogic \
    archetypal-consciousness-oracle

echo ""
echo "✅ Service registered on SingularityNET!"
echo ""

# Create test script for consumers
cat > test-snet-service.sh << 'EOF'
#!/bin/bash

# Example consumer test script
echo "🧪 Testing Archetypal Consciousness Oracle on SingularityNET"
echo ""

# Open payment channel
echo "Opening payment channel..."
snet channel open-init \
    spiralogic \
    archetypal-consciousness-oracle \
    0.001 \
    +10days

# Get channel ID
CHANNEL_ID=$(snet channel print-initialized | grep channel_id | awk '{print $2}')
echo "Channel ID: $CHANNEL_ID"

# Make a test call
echo ""
echo "Making test consciousness query..."
snet client call \
    spiralogic \
    archetypal-consciousness-oracle \
    default_group \
    ProcessQuery \
    '{"user_id": "test-consumer-001", "query_text": "I need guidance on finding balance in my life", "include_voice": false}'

echo ""
echo "✅ Test complete!"
EOF

chmod +x test-snet-service.sh

# Create sample integration code
cat > sample-integration.py << 'EOF'
#!/usr/bin/env python3
"""
Sample Python integration for Archetypal Consciousness Oracle
"""

import snet_sdk
from snet_sdk import identity

# Initialize SNet SDK
config = {
    "private_key": "YOUR_PRIVATE_KEY",
    "eth_rpc_endpoint": "https://mainnet.infura.io/v3/YOUR_KEY",
    "ipfs_rpc_endpoint": "https://ipfs.singularitynet.io:443",
    "default_gas_price": "1000000000",
    "default_wallet_index": 0,
}

# Create identity
ident = identity.PrivateKeyIdentity(config)

# Initialize SDK
sdk = snet_sdk.SnetSDK(config)

# Get service client
service_client = sdk.create_service_client(
    org_id="spiralogic",
    service_id="archetypal-consciousness-oracle",
    group_name="default_group"
)

# Open payment channel if needed
# service_client.open_channel(amount=0.001, expiration=100000)

# Make a consciousness query
request = service_client.call_rpc(
    "ProcessQuery",
    {
        "user_id": "python-user-001",
        "query_text": "How can I unlock my creative potential?",
        "include_voice": True,
        "current_state": {
            "elemental_balance": {
                "fire": 0.3,
                "water": 0.2,
                "earth": 0.2,
                "air": 0.2,
                "aether": 0.1
            },
            "dominant_archetype": "fire",
            "coherence_level": 0.75,
            "active_patterns": ["creativity", "transformation"]
        }
    }
)

# Process response
print(f"Oracle Response: {request.oracle_response}")
print(f"Primary Archetype: {request.analysis.primary_archetype}")
print(f"Energy Signature: {request.analysis.energy_signature}")

if request.voice_data:
    # Save audio response
    with open("oracle-response.mp3", "wb") as f:
        f.write(request.voice_data.audio_content)
    print("Voice response saved to oracle-response.mp3")
EOF

# Create curl example
cat > curl-example.sh << 'EOF'
#!/bin/bash

# Example cURL request for testing the service endpoint
curl -X POST https://oracle.spiralogic.ai:7000/archetypal_consciousness.ArchetypalConsciousnessService/ProcessQuery \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SNET_TOKEN" \
  -H "snet-payment-type: escrow" \
  -H "snet-payment-channel-id: YOUR_CHANNEL_ID" \
  -H "snet-payment-channel-nonce: 0" \
  -H "snet-payment-channel-amount: 1000000" \
  -d '{
    "user_id": "curl-test-user",
    "query_text": "I seek wisdom about my lifes purpose",
    "include_voice": false,
    "current_state": {
      "elemental_balance": {
        "fire": 0.2,
        "water": 0.3,
        "earth": 0.2,
        "air": 0.2,
        "aether": 0.1
      },
      "dominant_archetype": "water",
      "coherence_level": 0.8,
      "active_patterns": ["seeking", "purpose", "wisdom"]
    }
  }'
EOF

chmod +x curl-example.sh

# Generate metrics report
cat > generate-usage-report.ts << 'EOF'
#!/usr/bin/env node

import { metricsLogger } from './snet/usage-metrics-logger.js';

async function generateReport() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days

  const stats = await metricsLogger.getUsageStats(startDate, endDate);

  console.log('📊 Archetypal Consciousness Oracle - Usage Report');
  console.log('================================================');
  console.log(`Period: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  console.log('');
  console.log(`Total Requests: ${stats.totalRequests}`);
  console.log(`Success Rate: ${(stats.successfulRequests / stats.totalRequests * 100).toFixed(2)}%`);
  console.log(`Total AGIX Earned: ${stats.totalAgixEarned.toFixed(8)} AGIX`);
  console.log(`Average Processing Time: ${stats.averageProcessingTime.toFixed(0)}ms`);
  console.log('');
  console.log('Top Archetypes:');
  stats.topArchetypes.forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.archetype}: ${a.count} requests`);
  });
  console.log('');
  console.log('Method Breakdown:');
  stats.methodBreakdown.forEach(m => {
    console.log(`  ${m.method}: ${m.count} calls, ${m.agixEarned.toFixed(8)} AGIX`);
  });
}

generateReport().catch(console.error);
EOF

chmod +x generate-usage-report.ts

cd ..

echo ""
echo "📊 Week 4 AGI Marketplace Launch Summary"
echo "======================================="
echo "✅ Service metadata configured"
echo "✅ Pricing model established"
echo "✅ Service registered on blockchain"
echo "✅ Test scripts created"
echo "✅ Usage metrics logger implemented"
echo "✅ Sample integration code provided"
echo ""
echo "🎯 Your Service is Now Live!"
echo "Service ID: archetypal-consciousness-oracle"
echo "Organization: spiralogic"
echo ""
echo "📚 Resources for Consumers:"
echo "- Test script: ./test-snet-service.sh"
echo "- Python SDK: ./sample-integration.py"
echo "- cURL example: ./curl-example.sh"
echo "- Usage reports: ./generate-usage-report.ts"
echo ""
echo "💰 Start Earning AGIX Tokens!"
echo "Monitor your earnings at: https://publisher.singularitynet.io"
echo ""
echo "🎉 Congratulations! Your Archetypal Consciousness Oracle is now"
echo "   available on the SingularityNET AGI Marketplace!"
echo ""
echo "Next steps:"
echo "1. Share your service: https://marketplace.singularitynet.io/org/spiralogic"
echo "2. Join the community: https://community.singularitynet.io"
echo "3. Monitor usage: node backend/generate-usage-report.ts"