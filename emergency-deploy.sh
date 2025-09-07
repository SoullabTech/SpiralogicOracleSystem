#!/bin/bash

# Emergency Vercel Deployment Script
# Handles: disk space, git corruption, and file limit issues

set -e

echo "🚀 Emergency Vercel Deployment Script"
echo "====================================="

# Step 1: Clean up disk space
echo "📦 Step 1: Cleaning up disk space..."
rm -rf node_modules 2>/dev/null || true
rm -rf .next 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true
rm -rf dist 2>/dev/null || true
rm -rf coverage 2>/dev/null || true
rm -rf ~/.pnpm-store 2>/dev/null || true
echo "✅ Disk space cleaned"

# Step 2: Handle corrupt git state
echo "🔧 Step 2: Handling git state..."
if [ -f .git ]; then
    echo "⚠️  Corrupt .git file detected, backing up..."
    mv .git .git.backup-$(date +%s) 2>/dev/null || true
    echo "✅ Git backup created"
fi

# Step 3: Create .vercelignore
echo "📝 Step 3: Creating .vercelignore..."
cat > .vercelignore << 'EOF'
node_modules
.next
.turbo
.git
.git.backup*
*.log
dist
coverage
.pnpm-store
backend/node_modules
backend/dist
backend/.turbo
apps/*/node_modules
apps/*/.next
apps/*/dist
packages/*/node_modules
packages/*/dist
**/*.test.ts
**/*.test.tsx
**/*.spec.ts
**/*.spec.tsx
**/tests
**/test
**/__tests__
.env.local
.env.*.local
*.tgz
*.tar.gz
.DS_Store
Thumbs.db
EOF
echo "✅ .vercelignore created"

# Step 4: Deploy frontend only (minimal approach)
echo "🚀 Step 4: Deploying frontend to Vercel..."
if [ -d "apps/web" ]; then
    echo "📂 Found apps/web directory, deploying from there..."
    cd apps/web
    
    # Install minimal dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing minimal dependencies..."
        npm install --production --no-audit --no-fund || true
    fi
    
    # Deploy with all safeguards
    echo "🌐 Starting Vercel deployment..."
    if vercel deploy \
        --prod \
        --yes \
        --archive=tgz \
        --skip-domain \
        2>&1 | tee vercel-deploy.log; then
        echo "✅ Deployment SUCCESS!"
        echo "📋 Check vercel-deploy.log for details"
    else
        echo "❌ Deployment FAILED - check vercel-deploy.log for errors"
        cd ..
        exit 1
    fi
else
    echo "⚠️  No apps/web directory found, deploying from root..."
    if vercel deploy \
        --prod \
        --yes \
        --archive=tgz \
        --skip-domain \
        2>&1 | tee vercel-deploy.log; then
        echo "✅ Deployment SUCCESS!"
        echo "📋 Check vercel-deploy.log for details"
    else
        echo "❌ Deployment FAILED - check vercel-deploy.log for errors"
        exit 1
    fi
fi

echo ""
echo "====================================="
echo "✨ Emergency deployment script finished!"
echo ""
echo "Next steps:"
echo "1. Check the deployment URL in the output above"
echo "2. If successful, visit your Vercel dashboard to verify"
echo "3. If failed, check vercel-deploy.log for errors"
echo ""
echo "To restore git later: mv .git.backup-* .git"