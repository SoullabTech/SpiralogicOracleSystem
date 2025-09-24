#!/bin/bash

# ARIA Oracle Beta Deployment Script
# Deploy to soullab.life/beta via Vercel

echo "🚀 Starting ARIA Oracle Beta Deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

# Clean any existing build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf .next
rm -rf .vercel

# Copy deployment files to root if not already there
echo "📁 Preparing deployment files..."
if [ -d "deploy" ]; then
    cp -r deploy/* .
    echo "✅ Files copied from deploy folder"
fi

# Install dependencies with clean cache
echo "📦 Installing dependencies..."
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force
npm install --legacy-peer-deps

# Build the project
echo "🔨 Building Next.js application..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo ""
echo "📌 IMPORTANT: During deployment:"
echo "1. Select 'Y' to set up and deploy"
echo "2. Choose your Vercel account"
echo "3. Link to existing project or create new one called 'soullab-beta'"
echo "4. Set the production branch (usually 'main')"
echo ""

# Deploy with production flag
vercel --prod

echo ""
echo "✅ Deployment script complete!"
echo ""
echo "🔗 Your beta site will be available at:"
echo "   https://soullab.life/beta"
echo ""
echo "📝 Next steps:"
echo "1. Add environment variables in Vercel dashboard"
echo "2. Set up Supabase and run migrations"
echo "3. Configure custom domain (soullab.life) if needed"
echo "4. Test the beta application flow"
echo ""
echo "🎯 Environment variables needed in Vercel:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_KEY"
echo "   - EMAIL_API_KEY (optional)"
echo "   - NEXT_PUBLIC_GA_ID (optional)"