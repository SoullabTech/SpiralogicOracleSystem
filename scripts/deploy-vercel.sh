#!/bin/bash

echo "🚀 Deploying to Vercel with Stub Mode"
echo "======================================"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Set environment for build
export NEXT_PUBLIC_API_MODE=stub
export NEXT_PUBLIC_API_URL=http://localhost:3002

echo ""
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo ""
    echo "🌐 Deploying to Vercel..."
    echo "Note: You'll need to set these environment variables in Vercel Dashboard:"
    echo "  - NEXT_PUBLIC_API_MODE=stub"
    echo "  - NEXT_PUBLIC_API_URL=http://localhost:3002"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
    
    # Deploy to Vercel
    vercel --prod
    
    echo ""
    echo "✅ Deployment complete!"
    echo "Visit your Vercel dashboard to:"
    echo "1. Set environment variables"
    echo "2. Test at: https://your-app.vercel.app/test-stub"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi