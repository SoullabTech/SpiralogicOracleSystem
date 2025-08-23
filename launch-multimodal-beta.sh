#!/bin/bash
# Complete Multimodal Beta Launch Script
set -e

echo "🚀 SPIRALOGIC MULTIMODAL BETA LAUNCH"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Install dependencies
echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
npm install pdf-parse @supabase/supabase-js openai
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Check environment
echo -e "${BLUE}🔧 Step 2: Environment check...${NC}"
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}❌ OPENAI_API_KEY not set${NC}"
    echo "Please set OPENAI_API_KEY in .env.local and re-run this script"
    echo "Template available in .env.multimodal-template"
    exit 1
else
    echo -e "${GREEN}✅ OPENAI_API_KEY configured${NC}"
fi
echo ""

# Step 3: Database migrations
echo -e "${BLUE}🗄️ Step 3: Running database migrations...${NC}"
if command -v supabase &> /dev/null; then
    supabase db push
    echo -e "${GREEN}✅ Migrations applied${NC}"
else
    echo -e "${YELLOW}⚠️ Supabase CLI not found - please run 'supabase db push' manually${NC}"
fi
echo ""

# Step 4: Ready check
echo -e "${BLUE}✨ Step 4: Beta readiness check...${NC}"
if [ -f "./scripts/beta-ready-checklist.sh" ]; then
    chmod +x ./scripts/beta-ready-checklist.sh
    ./scripts/beta-ready-checklist.sh
else
    echo -e "${YELLOW}⚠️ beta-ready-checklist.sh not found - please run manually${NC}"
fi
echo ""

# Step 5: Validation
echo -e "${BLUE}🧪 Step 5: Running validation tests...${NC}"
if [ -f "./scripts/validate-multimodal-beta.sh" ]; then
    chmod +x ./scripts/validate-multimodal-beta.sh
    ./scripts/validate-multimodal-beta.sh
else
    echo -e "${YELLOW}⚠️ validate-multimodal-beta.sh not found - please run manually${NC}"
fi
echo ""

# Step 6: Launch
echo -e "${BLUE}🌟 Step 6: Starting development server...${NC}"
echo "Run the following command in a new terminal:"
echo -e "${GREEN}npm run dev${NC}"
echo ""
echo "🎯 GOLDEN PATH DEMO:"
echo "1. Drop voice memo → ask about content"
echo "2. Drop PDF → ask for key points" 
echo "3. Drop image → ask about themes"
echo "4. Check badges unlock"
echo ""
echo -e "${GREEN}🎉 MULTIMODAL BETA READY FOR TESTING!${NC}"