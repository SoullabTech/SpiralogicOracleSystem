#!/bin/bash

echo "🌐 Spiralogic Oracle System - Week 2 SingularityNET Setup"
echo "========================================================"
echo ""

# Check prerequisites from Week 1
if ! docker images | grep -q "archetypal-consciousness"; then
    echo "❌ Week 1 Docker image not found. Please run week1-setup.sh first."
    exit 1
fi

echo "✅ Week 1 prerequisites verified"
echo ""

# Install SingularityNET CLI
echo "📦 Installing SingularityNET CLI..."
if ! command -v snet &> /dev/null; then
    pip3 install snet-cli
    echo "✅ SNet CLI installed"
else
    echo "✅ SNet CLI already installed"
fi

# Install gRPC tools
echo "📦 Installing gRPC tools..."
cd backend
npm install --save @grpc/grpc-js @grpc/proto-loader
npm install --save-dev grpc-tools

# Generate protobuf files
echo "🔧 Generating protobuf files..."
mkdir -p src/proto-gen

# Install protoc if not available
if ! command -v protoc &> /dev/null; then
    echo "Installing protoc..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install protobuf
    else
        apt-get update && apt-get install -y protobuf-compiler
    fi
fi

# Generate JavaScript code from proto
npx grpc_tools_node_protoc \
    --js_out=import_style=commonjs,binary:./src/proto-gen \
    --grpc_out=grpc_js:./src/proto-gen \
    --plugin=protoc-gen-grpc=./node_modules/.bin/grpc_tools_node_protoc_plugin \
    ./proto/archetypal_consciousness.proto

echo "✅ Protobuf files generated"

# Create SNet service wrapper
echo "🔌 Creating SNet service wrapper..."
cat > snet-service-wrapper.js << 'EOF'
#!/usr/bin/env node

import { createSNetService } from './src/services/SNetArchetypalService.js';

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down SNet service...');
  await service.shutdown();
  process.exit(0);
});

// Start the service
const service = createSNetService();
console.log('🚀 SingularityNET Archetypal Consciousness Service started');
EOF

chmod +x snet-service-wrapper.js

# Test gRPC service locally
echo ""
echo "🧪 Testing gRPC service locally..."
cat > test-grpc-client.js << 'EOF'
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, 'proto/archetypal_consciousness.proto');

async function testGrpcService() {
  const packageDefinition = protoLoader.loadSync(PROTO_PATH);
  const proto = grpc.loadPackageDefinition(packageDefinition).archetypal_consciousness;

  const client = new proto.ArchetypalConsciousnessService(
    'localhost:7000',
    grpc.credentials.createInsecure()
  );

  // Test ProcessQuery
  const testQuery = {
    user_id: 'test-user-001',
    query_text: 'I need guidance on finding my creative voice',
    include_voice: false,
    current_state: {
      elemental_balance: { fire: 0.3, water: 0.2, earth: 0.2, air: 0.2, aether: 0.1 },
      dominant_archetype: 'fire',
      coherence_level: 0.75,
      active_patterns: ['creativity', 'self-expression']
    }
  };

  return new Promise((resolve, reject) => {
    client.ProcessQuery(testQuery, (error, response) => {
      if (error) {
        console.error('❌ gRPC test failed:', error);
        reject(error);
      } else {
        console.log('✅ gRPC test successful!');
        console.log('Response:', JSON.stringify(response, null, 2));
        resolve(response);
      }
    });
  });
}

// Run test after service starts
setTimeout(() => {
  testGrpcService()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}, 2000);
EOF

# Update Docker image with SNet integration
echo ""
echo "🐳 Building Docker image with SNet support..."
cat >> Dockerfile << 'EOF'

# Add SingularityNET integration
COPY backend/proto ./backend/proto
COPY backend/src/proto-gen ./backend/src/proto-gen
COPY backend/snet-service-wrapper.js ./backend/
COPY backend/daemon-config.json ./backend/
COPY backend/snet-config.json ./backend/

# Expose SNet service port
EXPOSE 7000
EXPOSE 7001
EOF

docker build -t archetypal-consciousness:snet-enabled .

# Create test script
echo ""
echo "📝 Creating SNet integration test..."
cat > test-snet-integration.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing SingularityNET Integration"
echo "===================================="

# Start the service
echo "Starting SNet service..."
node snet-service-wrapper.js &
SERVICE_PID=$!

# Wait for service to start
sleep 3

# Run gRPC client test
echo "Testing gRPC endpoint..."
node test-grpc-client.js

# Check if test passed
if [ $? -eq 0 ]; then
    echo "✅ SNet integration test passed!"
else
    echo "❌ SNet integration test failed!"
fi

# Cleanup
kill $SERVICE_PID 2>/dev/null

EOF

chmod +x test-snet-integration.sh

# Run the integration test
echo ""
echo "🚀 Running SNet integration test..."
./test-snet-integration.sh

cd ..

echo ""
echo "📊 Week 2 Setup Summary"
echo "======================"
echo "✅ gRPC service implemented"
echo "✅ Protobuf definitions created"
echo "✅ SNet service wrapper ready"
echo "✅ Local testing complete"
echo ""
echo "🎯 Next Steps:"
echo "1. Configure your Ethereum wallet for SNet"
echo "2. Register your organization on SingularityNET"
echo "3. Deploy service metadata to IPFS"
echo "4. Test with snet-cli:"
echo "   snet service metadata-init proto/archetypal_consciousness.proto"
echo ""
echo "Ready for Week 3: Akash Deployment! 🚀"