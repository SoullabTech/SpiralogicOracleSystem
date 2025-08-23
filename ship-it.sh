#!/bin/bash

# Ship It - Conversational Oracle Release Script
# Executes the complete release flow with verification steps

set -e

echo "🚀 Conversational Oracle Release Flow"
echo "====================================="
echo

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Prep & Sanity Check${NC}"
echo "======================"

# Ensure we're on main and up to date
echo "Checking out main branch..."
git checkout main
git pull origin main

echo "Installing dependencies..."
npm ci

echo "Building application..."
npm run build

echo "Starting Docker stack for testing..."
docker compose -f docker-compose.development.yml up --build -d

# Wait a moment for services to start
echo "Waiting for services to start..."
sleep 10

echo "Running beta test suite..."
if [ -f "./beta-test-script.sh" ]; then
    chmod +x ./beta-test-script.sh
    ./beta-test-script.sh
    echo -e "${GREEN}✅ Beta tests completed${NC}"
else
    echo -e "${YELLOW}⚠️  Beta test script not found, skipping automated tests${NC}"
fi

echo
read -p "Do the test results look good? Continue with release? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Release cancelled."
    exit 1
fi

echo
echo -e "${BLUE}2. Commit, Tag, Push${NC}"
echo "==================="

# Stage all changes
echo "Staging all changes..."
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo -e "${YELLOW}No changes to commit. Exiting.${NC}"
    exit 0
fi

# Show staged changes summary
echo "Staged changes:"
git diff --staged --name-only

echo
read -p "Commit these changes? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Commit cancelled."
    exit 1
fi

# Commit with semantic message
git commit -m "feat(beta): Conversational Oracle — Maya greetings, relaxed validator, Claude pipeline

- Add rotating greeting system with 7 tone buckets
- Implement 4-12 sentence conversational validation  
- Enable Claude as primary conversation generator
- Add Maya greeting integration with name personalization
- Create comprehensive beta testing suite
- Disable demo pipeline in favor of conversational depth

Transforms Oracle from terse demo bot to warm conversational guide.

🌟 Beta 1 ready for testing"

# Create semantic version tag
TAG="v0.9.0-beta1"
echo "Creating tag: $TAG"
git tag -a "$TAG" -m "Conversational Oracle beta 1

First beta release of the conversational Oracle system.

Key features:
- Warm personalized greetings
- 4-12 sentence conversational responses
- Smart tone adaptation
- Comprehensive testing suite

Ready for beta testing and feedback collection."

# Push to origin with tags
echo "Pushing to origin..."
git push origin main --tags

echo -e "${GREEN}✅ Code pushed with tag $TAG${NC}"

echo
echo -e "${BLUE}3. Post-Push Verification${NC}"
echo "========================="

echo "Repository has been updated with:"
echo "- Conversational Oracle codebase"
echo "- Beta testing suite"
echo "- Deployment documentation"
echo "- Release notes"
echo "- CI/CD workflow"

echo
echo -e "${PURPLE}Next Steps:${NC}"
echo "==========="

echo "1. 🚀 Deploy to your platform:"
echo "   - Vercel: Link project and set environment variables"
echo "   - Railway: 'railway up' and configure secrets"
echo "   - Fly.io: 'fly deploy' and set secrets"

echo
echo "2. 🔧 Set environment variables on your platform:"
echo "   - USE_CLAUDE=true"
echo "   - DEMO_PIPELINE_DISABLED=true"
echo "   - ATTENDING_ENFORCEMENT_MODE=relaxed"
echo "   - TURN_MIN_SENTENCES=4"
echo "   - TURN_MAX_SENTENCES=12"
echo "   - MAYA_GREETING_ENABLED=true"
echo "   - MAYA_GREETING_TONE=casual-wise"
echo "   - MAYA_FORCE_NAME=Kelly (for testing)"
echo "   - ADMIN_ALLOWED_EMAILS=your@email.com"
echo "   - [Supabase/API keys as needed]"

echo
echo "3. 🧪 Verify deployment:"
echo "   curl -s -X POST \"https://your-app.vercel.app/api/oracle/turn\" \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"input\":{\"text\":\"I need guidance today.\"},\"conversationId\":\"verify\"}' \\"
echo "     | jq -r '.response.text'"

echo
echo "4. 📊 Monitor health:"
echo "   - Admin console: https://your-app.vercel.app/admin/overview"
echo "   - Bridge health: https://your-app.vercel.app/debug/bridge"
echo "   - API health: https://your-backend.railway.app/api/soul-memory/health"

echo
echo "5. 👥 Invite beta testers:"
echo "   - Share deployment URL"
echo "   - Provide BETA_TEST_MANUAL.md instructions"
echo "   - Collect feedback via BETA_FEEDBACK.md template"

echo
echo -e "${GREEN}🎉 Conversational Oracle v0.9.0-beta1 successfully released!${NC}"
echo
echo "Your Oracle has graduated from demo bot to conversational guide."
echo "Ready for beta testing and user feedback collection."

# Clean up Docker stack
echo
echo "Cleaning up Docker stack..."
docker compose -f docker-compose.development.yml down

echo
echo -e "${BLUE}Release complete! 🚀${NC}"