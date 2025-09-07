#!/bin/bash

echo "🌐 Building IPFS-Ready Frontend"
echo "=============================="
echo ""

# Set IPFS build environment
export NEXT_PUBLIC_IPFS_BUILD=true
export NEXT_PUBLIC_SOVEREIGN_MODE=true

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf out .next

# Install dependencies
echo "📦 Installing dependencies..."
npm install --include=dev

# Build with IPFS config
echo "🔨 Building for IPFS..."
npm run build -- --config next.config.ipfs.js

# Export static files
echo "📤 Exporting static files..."
npm run export

# Post-process for IPFS
echo "🔧 Post-processing for IPFS..."

# Fix paths in HTML files
find out -name "*.html" -exec sed -i '' 's|href="/|href="./|g' {} \;
find out -name "*.html" -exec sed -i '' 's|src="/|src="./|g' {} \;

# Create IPFS-specific files
cat > out/.ipfsignore << EOF
.DS_Store
*.log
.git
node_modules
EOF

# Add IPFS metadata
cat > out/ipfs-metadata.json << EOF
{
  "name": "Spiralogic Oracle System",
  "description": "Decentralized Archetypal Consciousness Oracle",
  "version": "2.0.0",
  "author": "Spiralogic",
  "homepage": "https://spiralogic.ai",
  "repository": "ipfs://QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
EOF

# Calculate build size
BUILD_SIZE=$(du -sh out | cut -f1)
echo ""
echo "📊 Build Statistics:"
echo "  - Total Size: $BUILD_SIZE"
echo "  - Files: $(find out -type f | wc -l)"
echo ""

# Pin to local IPFS node (if running)
if command -v ipfs &> /dev/null && pgrep -x "ipfs" > /dev/null; then
    echo "📌 Pinning to local IPFS node..."
    IPFS_HASH=$(ipfs add -r -q out | tail -n 1)
    echo "✅ IPFS Hash: $IPFS_HASH"
    echo $IPFS_HASH > ipfs-hash.txt

    # Generate gateway URLs
    echo ""
    echo "🌐 Access URLs:"
    echo "  - Local: http://localhost:8080/ipfs/$IPFS_HASH"
    echo "  - Pinata: https://gateway.pinata.cloud/ipfs/$IPFS_HASH"
    echo "  - Cloudflare: https://cloudflare-ipfs.com/ipfs/$IPFS_HASH"
    echo "  - Protocol: ipfs://$IPFS_HASH"
else
    echo "⚠️  IPFS daemon not running. Start with: ipfs daemon"
fi

echo ""
echo "✅ IPFS build complete!"
echo ""
echo "Next steps:"
echo "1. Pin to Pinata: npm run pin:pinata"
echo "2. Update DNSLink: _dnslink.spiralogic.ai -> dnslink=/ipfs/$IPFS_HASH"
echo "3. Configure ENS: spiralogic.eth -> ipfs://$IPFS_HASH"