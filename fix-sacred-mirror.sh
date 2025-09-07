#!/bin/bash

# Sacred Mirror Fix Script - Purge Purple & Check Backend

echo "🔮 Sacred Mirror Beta Fix Script"
echo "================================"

# 1. Check if backend is running
echo -e "\n📡 Checking backend health..."
if curl -s http://localhost:3002/api/v1/health > /dev/null 2>&1; then
    echo "✅ Backend is running on port 3002"
else
    echo "❌ Backend not responding. Starting backend..."
    cd backend && npm run dev &
    echo "⏳ Waiting for backend to start..."
    sleep 5
fi

# 2. Rebuild frontend with clean cache
echo -e "\n🧹 Cleaning frontend build cache..."
rm -rf .next
rm -rf node_modules/.cache

# 3. Search for any remaining purple references
echo -e "\n🔍 Checking for purple color references..."
PURPLE_COUNT=$(grep -r "purple\|violet\|indigo" --include="*.tsx" --include="*.ts" --include="*.css" app/ components/ styles/ 2>/dev/null | grep -v "node_modules" | wc -l)

if [ $PURPLE_COUNT -gt 0 ]; then
    echo "⚠️  Found $PURPLE_COUNT purple references remaining"
    echo "Check these files:"
    grep -r "purple\|violet\|indigo" --include="*.tsx" --include="*.ts" --include="*.css" app/ components/ styles/ 2>/dev/null | grep -v "node_modules" | head -5
else
    echo "✅ No purple colors found!"
fi

# 4. Test API endpoints
echo -e "\n🔧 Testing API endpoints..."

# Test health
echo -n "  Health check: "
HEALTH=$(curl -s http://localhost:3002/api/v1/health)
if [ -n "$HEALTH" ]; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

# Test converse endpoint
echo -n "  Converse endpoint: "
CONVERSE=$(curl -s -X GET "http://localhost:3002/api/v1/converse/stream?element=aether&userId=test&lang=en-US&q=test" -H "Accept: text/event-stream" | head -1)
if [ -n "$CONVERSE" ]; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

echo -e "\n📋 Next Steps:"
echo "1. Run: npm run dev"
echo "2. Clear browser cache (Cmd+Shift+R)"
echo "3. Visit: http://localhost:3000/oracle"
echo "4. If you see the onboarding screen, check the box and click 'Begin Sacred Reflection'"
echo ""
echo "🎯 Quick bypass: Run this in browser console:"
echo "   localStorage.setItem('sacredMirrorOnboarded', 'true');"
echo ""
echo "✨ Sacred Mirror Beta should now be purple-free with gold accents!"