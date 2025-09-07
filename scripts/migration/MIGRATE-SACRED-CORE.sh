#!/bin/bash

# 🌸 MASTER MIGRATION SCRIPT - Sacred Core Extraction
# Orchestrates the complete migration process

echo "╔══════════════════════════════════════════════╗"
echo "║   🌸 SACRED CORE MIGRATION ORCHESTRATOR 🌸    ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from project root directory"
  exit 1
fi

# Create migration output directory
mkdir -p ./migration-output

echo -e "${BLUE}📋 Migration Steps:${NC}"
echo "1. Identify Sacred Core components"
echo "2. Consolidate documentation"
echo "3. Unify Oracle API"
echo "4. Create fresh repository"
echo "5. Copy Sacred Core to new repo"
echo ""

read -p "Begin migration? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Migration cancelled"
  exit 0
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 1: Identifying Sacred Core${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
bash ./scripts/migration/01-identify-sacred-core.sh

echo ""
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 2: Consolidating Documentation${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
bash ./scripts/migration/02-consolidate-documentation.sh

echo ""
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 3: Unifying Oracle API${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
bash ./scripts/migration/03-unify-oracle-api.sh

echo ""
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 4: Creating Fresh Repository${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
read -p "Create new repository? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  bash ./scripts/migration/04-create-fresh-repo.sh
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 5: Copying Sacred Core${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"

NEW_REPO="../spiralogic-sacred-core"

if [ -d "$NEW_REPO" ]; then
  echo "Copying Sacred Core components to new repository..."
  
  # Copy components (if they exist)
  [ -f "components/sacred/SacredHoloflower.tsx" ] && cp components/sacred/SacredHoloflower.tsx "$NEW_REPO/components/sacred/"
  [ -f "components/motion/MotionOrchestrator.tsx" ] && cp components/motion/MotionOrchestrator.tsx "$NEW_REPO/components/motion/"
  [ -f "components/audio/SacredAudioSystem.tsx" ] && cp components/audio/SacredAudioSystem.tsx "$NEW_REPO/components/audio/"
  [ -f "components/OracleConversation.tsx" ] && cp components/OracleConversation.tsx "$NEW_REPO/components/"
  
  # Copy libraries (if they exist)
  [ -f "lib/spiralogic-facets-complete.ts" ] && cp lib/spiralogic-facets-complete.ts "$NEW_REPO/lib/facets/"
  [ -f "lib/oracle-response.ts" ] && cp lib/oracle-response.ts "$NEW_REPO/lib/"
  [ -f "lib/motion-mapper.ts" ] && cp lib/motion-mapper.ts "$NEW_REPO/lib/"
  [ -f "lib/coherence-calculator.ts" ] && cp lib/coherence-calculator.ts "$NEW_REPO/lib/"
  
  # Copy hooks (if they exist)
  [ -f "hooks/useSacredOracle.ts" ] && cp hooks/useSacredOracle.ts "$NEW_REPO/hooks/"
  
  # Copy consolidated docs
  [ -d "docs" ] && cp -r docs/* "$NEW_REPO/docs/"
  
  echo -e "${GREEN}✅ Sacred Core copied to new repository${NC}"
else
  echo -e "${YELLOW}⚠️  New repository not found. Run step 4 first.${NC}"
fi

echo ""
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}📊 MIGRATION SUMMARY${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"

if [ -f "./migration-output/preserve-list.txt" ]; then
  echo -e "${GREEN}✅ Files to Preserve:${NC} $(wc -l < ./migration-output/preserve-list.txt)"
fi

if [ -f "./migration-output/prune-list.txt" ]; then
  echo -e "${YELLOW}🗑️  Files to Prune:${NC} $(wc -l < ./migration-output/prune-list.txt)"
fi

if [ -d "docs" ]; then
  echo -e "${BLUE}📚 Documentation Consolidated:${NC} $(find docs -name "*.md" | wc -l) files"
fi

if [ -d "$NEW_REPO" ]; then
  echo -e "${GREEN}🚀 New Repository Created:${NC} $NEW_REPO"
fi

echo ""
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✨ MIGRATION COMPLETE!${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo ""
echo "Next Steps:"
echo "1. cd $NEW_REPO"
echo "2. npm install"
echo "3. npm run dev"
echo "4. Test Sacred Portal at http://localhost:3000/oracle-sacred"
echo ""
echo "Migration artifacts saved in ./migration-output/"