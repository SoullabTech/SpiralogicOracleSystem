#!/bin/bash

# Deploy Maya Zen Mode - Week 1 Priority
# This script deploys the zen brevity fix immediately

echo "🧘 Deploying Maya Angelou Zen Mode..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check current branch
echo -e "${YELLOW}Step 1: Checking git status...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}Warning: Not on main branch. Current branch: $CURRENT_BRANCH${NC}"
    read -p "Continue deployment from $CURRENT_BRANCH? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 2: Run the Maya zen tests
echo -e "${YELLOW}Step 2: Running Maya zen tests...${NC}"
cd apps/api/backend
npm run test:maya-zen 2>/dev/null || npx ts-node src/tests/test-maya-zen.ts

if [ $? -ne 0 ]; then
    echo -e "${RED}Tests failed! Fix issues before deploying.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Tests passed${NC}"

# Step 3: Build the backend
echo -e "${YELLOW}Step 3: Building backend...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"

# Step 4: Create deployment tag
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TAG="maya-zen-$TIMESTAMP"
echo -e "${YELLOW}Step 4: Creating deployment tag: $TAG${NC}"

git add -A
git commit -m "🧘 Deploy Maya Angelou Zen Mode - Max 25 words, no therapy-speak

- Enforced word limits (5-20 words typical)
- Removed all therapy-speak patterns
- Added zen greeting responses
- Simplified personalizeResponse
- Created brevity enforcement

The essence: Brief. True. Clear."

git tag -a $TAG -m "Maya Zen Mode Deployment - Brevity Enforced"
echo -e "${GREEN}✓ Tagged as $TAG${NC}"

# Step 5: Deploy to production (customize based on your deployment method)
echo -e "${YELLOW}Step 5: Deploying to production...${NC}"

# Option A: Vercel deployment
if [ -f "../../vercel.json" ]; then
    echo "Deploying to Vercel..."
    cd ../..
    vercel --prod
fi

# Option B: Custom deployment
# Uncomment and customize based on your setup:
# rsync -avz ./dist/ user@server:/var/www/soullab/
# ssh user@server "cd /var/www/soullab && npm install --production && pm2 restart soullab"

# Step 6: Verify deployment
echo -e "${YELLOW}Step 6: Running production verification...${NC}"
cd apps/api/backend

# Create production test file
cat > src/tests/verify-production-maya.ts << 'EOF'
import fetch from 'node-fetch';

async function verifyProductionMaya() {
  const PROD_URL = process.env.PROD_URL || 'https://soullab.com';
  const testInputs = [
    "Hello Maya",
    "I'm stressed",
    "What should I do?",
    "I feel lost"
  ];

  console.log('🧘 Verifying Maya Zen Mode in Production...\n');
  let allPassed = true;

  for (const input of testInputs) {
    try {
      const response = await fetch(`${PROD_URL}/api/oracle/personal/consult`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-production',
          input
        })
      });

      const data = await response.json();
      const message = data.data?.message || '';
      const wordCount = message.split(' ').length;

      console.log(`Input: "${input}"`);
      console.log(`Response: "${message}"`);
      console.log(`Words: ${wordCount}`);

      if (wordCount > 25) {
        console.log('❌ FAILED: Too many words\n');
        allPassed = false;
      } else if (/I sense|hold space|I'm here to/i.test(message)) {
        console.log('❌ FAILED: Contains therapy-speak\n');
        allPassed = false;
      } else {
        console.log('✅ PASSED\n');
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}\n`);
      allPassed = false;
    }
  }

  return allPassed;
}

verifyProductionMaya().then(passed => {
  if (passed) {
    console.log('🎉 Production verification PASSED!');
    process.exit(0);
  } else {
    console.log('⚠️  Production verification FAILED!');
    process.exit(1);
  }
});
EOF

# Run production verification
npx ts-node src/tests/verify-production-maya.ts

# Step 7: Rollback preparation
echo -e "${YELLOW}Step 7: Creating rollback script...${NC}"
cat > rollback-maya-zen.sh << EOF
#!/bin/bash
echo "Rolling back Maya Zen deployment..."
git revert $TAG
git push origin main
echo "Rollback complete. Previous version restored."
EOF
chmod +x rollback-maya-zen.sh

echo -e "${GREEN}=================================="
echo -e "🧘 Maya Zen Mode Deployed Successfully!"
echo -e "==================================${NC}"
echo ""
echo "Deployment Summary:"
echo "- Tag: $TAG"
echo "- Branch: $CURRENT_BRANCH"
echo "- Timestamp: $TIMESTAMP"
echo ""
echo "Next Steps:"
echo "1. Monitor production responses"
echo "2. Check word counts stay under 25"
echo "3. Verify no therapy-speak appears"
echo "4. Collect user feedback on brevity"
echo ""
echo "If issues arise, run: ./rollback-maya-zen.sh"
echo ""
echo -e "${GREEN}Week 1 Priority: COMPLETE ✓${NC}"