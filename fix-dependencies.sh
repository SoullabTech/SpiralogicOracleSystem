#!/bin/bash
set -e

echo "🔧 Fixing missing frontend dependencies..."

# Navigate to repo root (where Next.js app is)
cd "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"

echo "📦 Installing lucide-react (required for icons)..."
npm install lucide-react

echo "📦 Installing shadcn/ui common dependencies..."
npm install class-variance-authority tailwind-merge

echo "🔨 Testing frontend build locally..."
npm run build

echo "✅ Frontend build successful!"
echo "📝 Dependencies added:"
echo "- lucide-react (icons)"
echo "- class-variance-authority (component variants)" 
echo "- tailwind-merge (className merging)"
echo ""
echo "Next step: Commit the updated package.json and package-lock.json"