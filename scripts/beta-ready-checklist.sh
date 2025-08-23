#!/bin/bash
# Beta Ready Checklist - Final verification before launch
# Run this script to confirm everything is properly configured

echo "🔥 SPIRALOGIC MULTIMODAL BETA READINESS CHECK"
echo "============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

READY=true

check_requirement() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        READY=false
    fi
}

echo "📋 ENVIRONMENT CONFIGURATION"
echo "─────────────────────────────"

# Check environment variables
[ ! -z "$OPENAI_API_KEY" ] && echo -e "${GREEN}✅ OPENAI_API_KEY configured${NC}" || echo -e "${RED}❌ OPENAI_API_KEY missing${NC}"; READY=false
[ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ] && echo -e "${GREEN}✅ Supabase URL configured${NC}" || echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL missing${NC}"; READY=false
[ ! -z "$SUPABASE_SERVICE_ROLE_KEY" ] && echo -e "${GREEN}✅ Supabase service key configured${NC}" || echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY missing${NC}"; READY=false

echo ""
echo "📦 DEPENDENCIES"
echo "─────────────────"

# Check Node dependencies
npm list pdf-parse >/dev/null 2>&1
check_requirement $? "pdf-parse installed"

npm list @supabase/supabase-js >/dev/null 2>&1
check_requirement $? "@supabase/supabase-js installed"

npm list openai >/dev/null 2>&1
check_requirement $? "OpenAI SDK installed"

echo ""
echo "🗄️ DATABASE SCHEMA"
echo "──────────────────"

if [ -f "supabase/migrations/20250821_modal_search.sql" ]; then
    echo -e "${GREEN}✅ Multimodal migration file exists${NC}"
else
    echo -e "${RED}❌ Migration file missing${NC}"
    READY=false
fi

if [ -f "supabase/migrations/20250821_badges_add.sql" ]; then
    echo -e "${GREEN}✅ Badge migration file exists${NC}"
else
    echo -e "${RED}❌ Badge migration file missing${NC}"
    READY=false
fi

echo ""
echo "🔧 IMPLEMENTATION FILES"
echo "──────────────────────"

# Check core implementation files
[ -f "lib/uploads/pdf.ts" ] && echo -e "${GREEN}✅ PDF processing module${NC}" || echo -e "${RED}❌ PDF processing module missing${NC}"; READY=false
[ -f "lib/uploads/vision.ts" ] && echo -e "${GREEN}✅ Vision API module${NC}" || echo -e "${RED}❌ Vision API module missing${NC}"; READY=false
[ -f "lib/uploads/embeddings.ts" ] && echo -e "${GREEN}✅ Embeddings module${NC}" || echo -e "${RED}❌ Embeddings module missing${NC}"; READY=false
[ -f "lib/uploads/searchUploads.ts" ] && echo -e "${GREEN}✅ Semantic search module${NC}" || echo -e "${RED}❌ Semantic search module missing${NC}"; READY=false

echo ""
echo "🧪 TEST SCRIPTS"
echo "──────────────"

[ -f "scripts/validate-multimodal-beta.sh" ] && echo -e "${GREEN}✅ Validation script ready${NC}" || echo -e "${RED}❌ Validation script missing${NC}"; READY=false
[ -f "scripts/test-multimodal-uploads.sh" ] && echo -e "${GREEN}✅ Upload test script ready${NC}" || echo -e "${RED}❌ Upload test script missing${NC}"; READY=false
[ -f "docs/multimodal-demo.md" ] && echo -e "${GREEN}✅ Demo documentation ready${NC}" || echo -e "${RED}❌ Demo documentation missing${NC}"; READY=false

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$READY" = true ]; then
    echo -e "${GREEN}🎉 SYSTEM READY FOR BETA LAUNCH!${NC}"
    echo ""
    echo "🚀 LAUNCH SEQUENCE:"
    echo "   1. supabase db push"
    echo "   2. npm run dev"  
    echo "   3. ./scripts/validate-multimodal-beta.sh"
    echo "   4. Open browser and test full demo flow"
    echo ""
    echo "✨ Demo Flow:"
    echo "   • Drop voice memo → ask about content"
    echo "   • Drop PDF → ask for key points"
    echo "   • Drop image → ask about themes"
    echo "   • Check badges unlock in UI"
    echo ""
    echo "📊 Monitor:"
    echo "   • /admin/overview for metrics"
    echo "   • Browser console for processing logs"
    echo "   • Network tab for API responses"
else
    echo -e "${RED}🔧 SETUP INCOMPLETE${NC}"
    echo ""
    echo "❌ Issues to resolve:"
    echo "   • Set missing environment variables"
    echo "   • Install missing dependencies"  
    echo "   • Create missing files"
    echo "   • Run database migrations"
    echo ""
    echo "📖 Next steps:"
    echo "   1. Review .env.example for required variables"
    echo "   2. Run: npm install pdf-parse"
    echo "   3. Run: supabase db push"
    echo "   4. Re-run this checklist"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"