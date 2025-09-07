#!/bin/bash

# 🚀 Vercel Migration Stubs Script
# Stubs out backend imports that break Vercel builds

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}🚀 Vercel Migration - Stubbing Backend Imports${NC}\n"

# Create stub files for commonly imported backend modules
echo -e "${BLUE}Creating stub modules...${NC}"

# Create lib/stubs directory for all backend stubs
mkdir -p lib/stubs

# Create CollectiveIntelligence stub
cat > lib/stubs/CollectiveIntelligence.ts << 'EOF'
// Stub for CollectiveIntelligence - replace with actual API calls
export class CollectiveIntelligence {
  async getInsights() {
    return {
      patterns: [],
      themes: [],
      resonance: 0.5,
      message: "Collective intelligence temporarily unavailable"
    };
  }
  
  async analyze(data: any) {
    return {
      success: true,
      analysis: "Analysis service being migrated",
      data: {}
    };
  }
}

export const collectiveIntelligence = new CollectiveIntelligence();
EOF

# Create CollectiveDashboardService stub
cat > lib/stubs/CollectiveDashboardService.ts << 'EOF'
// Stub for CollectiveDashboardService
export class CollectiveDashboardService {
  async getDashboardData(userId?: string) {
    return {
      activeUsers: 0,
      totalReflections: 0,
      collectiveThemes: [],
      message: "Dashboard service being migrated to Supabase"
    };
  }
  
  async updateMetrics(data: any) {
    return { success: true };
  }
}

export const dashboardService = new CollectiveDashboardService();
EOF

# Create retreat schema stub
cat > lib/stubs/retreatSchemas.ts << 'EOF'
// Stub for retreat schemas
import { z } from 'zod';

export const retreat = {
  z: z.object({
    id: z.string(),
    name: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    participants: z.array(z.string()),
    theme: z.string().optional()
  })
};

export const retreatParticipant = z.object({
  userId: z.string(),
  retreatId: z.string(),
  role: z.enum(['participant', 'facilitator', 'observer']),
  joinedAt: z.date()
});
EOF

# Create a general backend stub
cat > lib/stubs/backendStub.ts << 'EOF'
// General stub for backend services during migration

export const stubResponse = (serviceName: string) => ({
  success: false,
  message: `${serviceName} is being migrated to API routes`,
  data: null
});

export const asyncStub = async (serviceName: string, delay = 100) => {
  await new Promise(resolve => setTimeout(resolve, delay));
  return stubResponse(serviceName);
};

// Common service stubs
export const MemoryService = {
  store: async (data: any) => asyncStub('MemoryService.store'),
  retrieve: async (id: string) => asyncStub('MemoryService.retrieve'),
  search: async (query: string) => asyncStub('MemoryService.search')
};

export const AIService = {
  process: async (input: any) => asyncStub('AIService.process'),
  analyze: async (data: any) => asyncStub('AIService.analyze')
};

export const RetreatService = {
  create: async (data: any) => asyncStub('RetreatService.create'),
  join: async (id: string, userId: string) => asyncStub('RetreatService.join'),
  getActive: async () => asyncStub('RetreatService.getActive')
};
EOF

echo -e "${GREEN}✅ Stub modules created${NC}\n"

# Find and fix imports in API routes
echo -e "${BLUE}Updating API route imports...${NC}"

# Fix CollectiveIntelligence imports
find app/api -name "*.ts" -o -name "*.tsx" 2>/dev/null | while read file; do
    if grep -q "@/backend/src/ain/collective/CollectiveIntelligence" "$file" 2>/dev/null; then
        echo "  Fixing: $file"
        sed -i '' 's|@/backend/src/ain/collective/CollectiveIntelligence|@/lib/stubs/CollectiveIntelligence|g' "$file"
    fi
done

# Fix CollectiveDashboardService imports
find app/api -name "*.ts" -o -name "*.tsx" 2>/dev/null | while read file; do
    if grep -q "@/backend/src/services/CollectiveDashboardService" "$file" 2>/dev/null; then
        echo "  Fixing: $file"
        sed -i '' 's|@/backend/src/services/CollectiveDashboardService|@/lib/stubs/CollectiveDashboardService|g' "$file"
    fi
done

# Fix retreat.z imports
find app/api -name "*.ts" -o -name "*.tsx" 2>/dev/null | while read file; do
    if grep -q "retreat\.z" "$file" 2>/dev/null; then
        echo "  Fixing retreat.z in: $file"
        # Add import for retreat schemas if not present
        if ! grep -q "@/lib/stubs/retreatSchemas" "$file"; then
            sed -i '' '1s/^/import { retreat } from "@\/lib\/stubs\/retreatSchemas";\n/' "$file"
        fi
    fi
done

echo -e "${GREEN}✅ API route imports updated${NC}\n"

# Create a vercel.json if it doesn't exist
if [ ! -f "vercel.json" ]; then
    echo -e "${BLUE}Creating vercel.json configuration...${NC}"
    cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  },
  "functions": {
    "app/api/*/route.ts": {
      "maxDuration": 30
    }
  },
  "ignoreCommand": "git diff --quiet HEAD^ HEAD ."
}
EOF
    echo -e "${GREEN}✅ vercel.json created${NC}\n"
fi

# Summary
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}🚀 Vercel Migration Stubs Complete${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo
echo -e "${GREEN}Created stubs for:${NC}"
echo "  • CollectiveIntelligence"
echo "  • CollectiveDashboardService"
echo "  • Retreat schemas"
echo "  • General backend services"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the changes: git diff"
echo "2. Test build locally: npm run build"
echo "3. Commit: git add . && git commit -m '🚀 Stub backend imports for Vercel deployment'"
echo "4. Push and deploy: git push && vercel"
echo
echo -e "${BLUE}Migration Notes:${NC}"
echo "  • Stubs return safe default values"
echo "  • Real implementations should be moved to:"
echo "    - Supabase Edge Functions"
echo "    - Next.js API routes (/app/api)"
echo "    - External microservices"