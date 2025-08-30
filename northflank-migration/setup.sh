#!/bin/bash
"""
Setup script for Northflank migration
"""

set -e

echo "🚀 Setting up Northflank Migration Environment"
echo ""

# Make scripts executable
chmod +x scripts/*.sh scripts/*.py

# Copy environment template
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file - please customize it with your settings"
else
    echo "⚠️  .env file already exists - skipping"
fi

# Create local data directories
mkdir -p voice-agent/models
mkdir -p voice-agent/audio_cache  
mkdir -p voice-agent/logs
mkdir -p memory-agent/data
mkdir -p memory-agent/logs

echo "✅ Created local data directories"

# Check Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    docker --version
else
    echo "❌ Docker is not installed - please install Docker first"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your registry settings"
echo "2. Test locally: docker-compose up"
echo "3. Deploy: ./scripts/quick_deploy.sh your-username"
echo ""
echo "📖 See README.md for detailed instructions"