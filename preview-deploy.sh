#!/bin/bash

# Preview deployment script for testing changes before production
# Usage: ./preview-deploy.sh

set -e

echo "🔬 PREVIEW DEPLOYMENT SCRIPT"
echo "============================"
echo ""
echo "This will deploy a PREVIEW version for testing."
echo "Preview URLs expire after 7 days."
echo ""
read -p "Deploy preview? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled"
    exit 0
fi

# Same cleanup as emergency deploy
echo "🧹 Cleaning build artifacts..."
rm -rf .next dist node_modules/.cache

# Deploy as preview (not production)
echo ""
echo "🚀 Deploying PREVIEW from apps/web..."
cd apps/web
if vercel --archive=tgz 2>&1 | tee ../../preview-deploy.log; then
    echo "✅ Preview deployment SUCCESS!"
else
    echo "❌ Preview deployment FAILED - check preview-deploy.log for errors"
    exit 1
fi

echo "📝 Check preview-deploy.log for details"
echo ""
echo "To promote to production later:"
echo "  vercel promote [deployment-url]"