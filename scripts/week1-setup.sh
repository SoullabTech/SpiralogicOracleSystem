#!/bin/bash

echo "🔮 Spiralogic Oracle System - Week 1 Setup"
echo "=========================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites satisfied"
echo ""

# Check environment variables
echo "🔑 Checking environment variables..."

if [ -z "$ELEVENLABS_API_KEY" ]; then
    echo "❌ ELEVENLABS_API_KEY not set. Please set it in your environment."
    echo "   export ELEVENLABS_API_KEY='your-api-key-here'"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not set. Please set it in your environment."
    echo "   export OPENAI_API_KEY='your-api-key-here'"
    exit 1
fi

echo "✅ Environment variables configured"
echo ""

# Build Docker image
echo "🐳 Building Docker container..."
docker build -t archetypal-consciousness:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Docker image built successfully"
echo ""

# Test voice integration
echo "🎤 Testing Eleven Labs voice integration..."
cd backend
npm install axios form-data
node test-voice-integration.js

if [ $? -ne 0 ]; then
    echo "❌ Voice integration test failed"
    exit 1
fi

cd ..
echo ""

# Start services with docker-compose
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Test the running system
echo "🧪 Testing system endpoints..."

# Test frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"
if [ $? -eq 0 ]; then
    echo "✅ Frontend running on http://localhost:3000"
else
    echo "❌ Frontend not responding"
fi

# Test backend
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/health | grep -q "200"
if [ $? -eq 0 ]; then
    echo "✅ Backend API running on http://localhost:8080"
else
    echo "❌ Backend API not responding"
fi

echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "🎉 Week 1 setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify voice files in backend/test-audio/"
echo "2. Test the Oracle interface at http://localhost:3000"
echo "3. Check logs: docker-compose logs -f oracle-system"
echo ""
echo "Ready for Week 2: SingularityNET Integration! 🚀"