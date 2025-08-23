#!/bin/bash
set -e

echo "🔧 Fixing npm lockfile sync issues..."

# Fix root/frontend lockfile
echo "📦 Regenerating root package-lock.json..."
cd "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"

# Remove the problematic -rf directory first
if [ -d "./-rf" ]; then
    echo "🗑️ Removing problematic -rf directory..."
    rm -rf "./-rf"
fi

# Remove old lockfile and node_modules
rm -rf node_modules package-lock.json
npm install

# Verify the build works
echo "✅ Verifying root build..."
npm run build || echo "⚠️ Build check failed - continuing anyway"

# Fix backend lockfile
echo "📦 Regenerating backend package-lock.json..."
cd backend
rm -rf node_modules package-lock.json
npm install

# Verify backend build works
echo "✅ Verifying backend build..."
npm run build || echo "⚠️ Backend build check failed - continuing anyway"

echo "🎉 Lockfile regeneration complete!"
echo "📝 Next steps:"
echo "1. Commit the updated lockfiles"
echo "2. Update Dockerfiles back to 'npm ci'"
echo "3. Rebuild Docker containers"