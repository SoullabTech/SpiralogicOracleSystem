#!/bin/bash

# 🛡️ Soullab Safe Commit Script
# Ensures code quality before committing and pushing
# Usage: ./scripts/safe-commit.sh "commit message"

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Check if commit message provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide a commit message${NC}"
    echo "Usage: ./scripts/safe-commit.sh \"your commit message\""
    exit 1
fi

COMMIT_MSG="$1"

echo -e "${PURPLE}🛡️ Soullab Safe Commit - Starting Pre-Commit Checks${NC}\n"

# 1. Run polish script first
echo -e "${BLUE}Step 1: Running quality checks...${NC}"
if [ -f "./scripts/beta-polish.sh" ]; then
    ./scripts/beta-polish.sh || {
        echo -e "${YELLOW}⚠️  Quality checks found issues. Review above.${NC}"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}❌ Commit cancelled${NC}"
            exit 1
        fi
    }
else
    echo -e "${YELLOW}⚠️  beta-polish.sh not found, skipping quality checks${NC}"
fi
echo

# 2. Check for uncommitted changes
echo -e "${BLUE}Step 2: Checking git status...${NC}"
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
    exit 0
fi

# Show what will be committed
echo "Changes to be committed:"
git status --short
echo

# 3. Run build to ensure it compiles
echo -e "${BLUE}Step 3: Verifying build...${NC}"
npm run build || {
    echo -e "${RED}❌ Build failed! Fix errors before committing.${NC}"
    exit 1
}
echo -e "${GREEN}✅ Build successful${NC}\n"

# 4. Stage all changes
echo -e "${BLUE}Step 4: Staging changes...${NC}"
git add .
echo -e "${GREEN}✅ Changes staged${NC}\n"

# 5. Commit with message
echo -e "${BLUE}Step 5: Creating commit...${NC}"
git commit -m "$COMMIT_MSG" || {
    echo -e "${RED}❌ Commit failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Commit created${NC}\n"

# 6. Ask before pushing
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Commit successful!${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo
read -p "Push to remote? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Get current branch
    BRANCH=$(git branch --show-current)
    echo -e "${BLUE}Pushing to origin/$BRANCH...${NC}"
    git push origin "$BRANCH" || {
        echo -e "${RED}❌ Push failed${NC}"
        echo "Try: git push --set-upstream origin $BRANCH"
        exit 1
    }
    echo -e "${GREEN}✅ Successfully pushed to origin/$BRANCH${NC}"
    
    # Show deployment URL if Vercel
    if [ -f "vercel.json" ] || [ -d ".vercel" ]; then
        echo -e "${BLUE}📦 Vercel deployment will start automatically${NC}"
        echo "   Check: https://vercel.com/dashboard"
    fi
else
    echo -e "${YELLOW}ℹ️  Commit created locally. Push when ready:${NC}"
    echo "   git push origin $(git branch --show-current)"
fi

echo
echo -e "${PURPLE}🎉 Safe commit complete!${NC}"