#!/bin/bash

echo "🔍 Vercel Deployment Verification Script"
echo "========================================"

# Check environment variables
echo ""
echo "1️⃣ Checking Environment Configuration..."
if [ -f .env.local ]; then
    echo "✅ .env.local exists"
    grep -E "NEXT_PUBLIC_API_MODE|NEXT_PUBLIC_API_URL" .env.local 2>/dev/null || echo "⚠️  API mode not configured in .env.local"
else
    echo "⚠️  .env.local not found"
fi

# Test stub mode
echo ""
echo "2️⃣ Testing Stub Mode..."
export NEXT_PUBLIC_API_MODE=stub
echo "✅ Set NEXT_PUBLIC_API_MODE=stub"

# Build check
echo ""
echo "3️⃣ Checking Build Status..."
if npm run build 2>&1 | grep -q "Build error occurred"; then
    echo "❌ Build has errors - checking details..."
    npm run build 2>&1 | grep -A 5 "Build error"
else
    echo "✅ Build successful"
fi

# Test API client
echo ""
echo "4️⃣ Testing API Client..."
node -e "
const apiClient = require('./lib/api/client.ts');
console.log('API Mode:', process.env.NEXT_PUBLIC_API_MODE || 'stub');
console.log('Stub Mode Active:', apiClient.isStubMode());
" 2>/dev/null || echo "⚠️  Cannot test API client directly"

# Check Vercel configuration
echo ""
echo "5️⃣ Checking Vercel Configuration..."
if [ -f vercel.json ]; then
    echo "✅ vercel.json exists"
    cat vercel.json
else
    echo "⚠️  vercel.json not found or empty"
fi

echo ""
echo "========================================"
echo "📋 Summary:"
echo "- API Mode: ${NEXT_PUBLIC_API_MODE:-stub}"
echo "- API URL: ${NEXT_PUBLIC_API_URL:-http://localhost:3002}"
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel: vercel --prod"
echo "2. Set environment variables in Vercel dashboard"
echo "3. Test deployed URL with stub data"