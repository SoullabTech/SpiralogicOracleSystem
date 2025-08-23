#!/bin/bash
set -e

echo "🚀 Complete Fix Workflow"
echo "Handling lucide-react dependency + Docker I/O recovery"
echo "=================================================="

# Step 1: Fix dependencies
echo ""
echo "STEP 1: Installing missing dependencies"
echo "--------------------------------------"
chmod +x fix-dependencies.sh
./fix-dependencies.sh

# Step 2: Commit the changes
echo ""
echo "STEP 2: Committing dependency updates"
echo "------------------------------------"
git add package.json package-lock.json
git commit -m "fix(frontend): add lucide-react (icons) and update lockfile

- Add lucide-react for icon components
- Add class-variance-authority for component variants  
- Add tailwind-merge for className merging
- Update lockfile for npm ci compatibility

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>" || echo "Nothing to commit (already committed)"

# Step 3: Docker recovery
echo ""
echo "STEP 3: Docker I/O error recovery"
echo "---------------------------------"
chmod +x docker-recovery.sh
./docker-recovery.sh

echo ""
echo "✅ COMPLETE FIX READY!"
echo "====================="
echo ""
echo "🔄 Manual step required: RESTART DOCKER DESKTOP"
echo ""
echo "After restarting Docker Desktop, run:"
echo "chmod +x rebuild-production.sh && ./rebuild-production.sh"