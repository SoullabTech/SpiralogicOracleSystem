#!/bin/bash

# Citation System Integration Test
# Tests the complete flow: upload → embed → search → cite

echo "🧪 Maya Citation System Test"
echo "========================================="

# Check if services are running
echo "🔍 Checking service health..."

# Test if backend is running
if ! curl -s http://localhost:3001/api/status > /dev/null 2>&1; then
    echo "❌ Frontend/API not running on port 3001"
    echo "   Please run: npm run dev"
    exit 1
fi

# Test if backend services are available
if ! curl -s http://localhost:3002/health > /dev/null 2>&1; then
    echo "⚠️  Backend not running on port 3002 (optional)"
    echo "   You can run: cd backend && npm run dev"
fi

echo "✅ Services appear to be running"
echo ""

# Method 1: Test file search endpoint directly
echo "📂 Testing file search endpoint..."
curl -X POST http://localhost:3001/api/files/search \
  -H "Content-Type: application/json" \
  -d '{"query":"flow states research","limit":3}' \
  --max-time 10 \
  -w "\n⏱️  Response time: %{time_total}s\n" 2>/dev/null || echo "❌ File search endpoint failed"

echo ""

# Method 2: Test file upload (requires test file)
echo "📤 Testing file upload..."
if [ -f "test-document.txt" ]; then
    curl -X POST http://localhost:3001/api/files/upload \
      -F "file=@test-document.txt" \
      -F "tags=test" \
      --max-time 30 \
      -w "\n⏱️  Upload time: %{time_total}s\n" 2>/dev/null || echo "❌ File upload failed"
else
    echo "ℹ️  Create test-document.txt to test upload"
fi

echo ""

# Method 3: Test conversation with file context
echo "💬 Testing conversation with file context..."
curl -X POST http://localhost:3001/api/oracle/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What do you know about flow states from my files?"}' \
  --max-time 15 \
  -w "\n⏱️  Conversation time: %{time_total}s\n" 2>/dev/null || echo "❌ Conversation test failed"

echo ""

# Check logs for citation system activity
echo "📋 Checking recent logs for citation activity..."
if [ -d "backend/logs" ]; then
    echo "Recent file ingestion activity:"
    find backend/logs -name "*.log" -exec tail -5 {} \; 2>/dev/null | grep -i "file\|embed\|citation" | tail -5
else
    echo "ℹ️  No backend logs directory found"
fi

echo ""
echo "🎯 Citation Test Summary:"
echo "   ✅ File search API tested"
echo "   ✅ File upload tested (if file exists)"  
echo "   ✅ Conversation integration tested"
echo ""
echo "🧪 For comprehensive testing, run:"
echo "   node test-citation-system.js"
echo ""

# Quick validation of key files
echo "📁 Checking citation system files..."
FILES=(
    "app/api/files/search/route.ts"
    "app/api/files/upload/route.ts"  
    "lib/memory/MemoryOrchestrator.ts"
    "backend/src/services/IngestionQueue.ts"
    "app/components/FileUpload.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (missing)"
    fi
done

echo ""
echo "🎉 Citation system test completed!"
echo "If you see errors, check the individual endpoints manually."