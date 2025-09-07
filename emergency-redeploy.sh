#!/bin/bash

# Emergency Vercel RE-Deployment Script (Fast Updates)
# Usage: ./emergency-redeploy.sh [--preview]

set -e

echo "⚡ Emergency Vercel RE-Deployment Script"
echo "========================================"

# Check for preview flag
DEPLOY_TARGET="--prod"
TARGET_NAME="production"
if [ "$1" == "--preview" ]; then
    DEPLOY_TARGET=""
    TARGET_NAME="preview"
    echo "🔄 Preview deployment mode"
else
    echo "🚀 Production deployment mode"
fi

# Step 1: Light cleanup (keep node_modules for speed)
echo "🧹 Step 1: Light cleanup..."
rm -rf .next 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true
rm -rf dist 2>/dev/null || true
echo "✅ Build artifacts cleaned"

# Step 2: Ensure .vercelignore exists
if [ ! -f .vercelignore ]; then
    echo "📝 Creating .vercelignore..."
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
else
    echo "✅ .vercelignore already exists"
fi

# Step 3: Deploy to Vercel
echo "🌐 Step 3: Deploying to Vercel ($TARGET_NAME)..."
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

if [ -d "apps/web" ]; then
    echo "📂 Deploying from apps/web..."
    cd apps/web
    
    # Quick dependency check
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies (first time only)..."
        npm install --production --no-audit --no-fund || true
    fi
    
    # Deploy with timestamp in log
    echo "" >> vercel-deploy.log
    echo "===== REDEPLOY: $TIMESTAMP ($TARGET_NAME) =====" >> vercel-deploy.log
    
    vercel deploy \
        $DEPLOY_TARGET \
        --yes \
        --archive=tgz \
        --no-git \
        --skip-domain \
        2>&1 | tee -a vercel-deploy.log
    
    DEPLOY_EXIT=$?
else
    echo "📂 Deploying from root..."
    echo "" >> vercel-deploy.log
    echo "===== REDEPLOY: $TIMESTAMP ($TARGET_NAME) =====" >> vercel-deploy.log
    
    vercel deploy \
        $DEPLOY_TARGET \
        --yes \
        --archive=tgz \
        --no-git \
        --skip-domain \
        2>&1 | tee -a vercel-deploy.log
    
    DEPLOY_EXIT=$?
fi

# Step 4: Show results
echo ""
echo "========================================"
if [ $DEPLOY_EXIT -eq 0 ]; then
    echo "✅ RE-DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "🌐 Check the URL above for your $TARGET_NAME deployment"
    echo "📋 Full log: vercel-deploy.log"
    echo ""
    echo "Quick commands:"
    echo "  Preview deploy:  ./emergency-redeploy.sh --preview"
    echo "  Prod deploy:     ./emergency-redeploy.sh"
else
    echo "❌ DEPLOYMENT FAILED"
    echo ""
    echo "Check vercel-deploy.log for errors"
    echo "Common fixes:"
    echo "  1. Run ./emergency-deploy.sh (full cleanup)"
    echo "  2. Check disk space: df -h ."
    echo "  3. Verify Vercel login: vercel whoami"
fi