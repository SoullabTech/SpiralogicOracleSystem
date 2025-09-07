# 🏗️ Prompt 5: Repository Clean Architecture

## Claude Code Prompt

```
You are Claude Code. Refactor the repository structure to create a clean, scalable architecture that preserves sacred depth while eliminating complexity.

## Task:

1. Create clean hierarchy with latent sacred APIs:
   ```
   /app
     /oracle-sacred/page.tsx    # Sacred Portal
     /api/oracle/route.ts       # Unified endpoint
   
   /components
     /sacred
       SacredHoloflower.tsx
       SacredMicButton.tsx
       OracleConversation.tsx
       HoloflowerCheckIn.tsx
     /motion
       MotionOrchestrator.tsx
     /audio
       SacredAudioSystem.tsx
   
   /lib
     /oracle
       cascade.ts              # Wisdom layers
       coherence.ts            # Coherence calc
       motion-mapper.ts        # Motion mapping
       sacred-tone.ts          # Frequency generation
     /state
       sacred-store.ts         # Zustand store
     /types
       oracle.ts               # TypeScript types
     facets.ts                 # 12 petals + Aether
     sacred-config.ts          # Sacred constants
   
   /sacred-apis               # LATENT MODULES (dormant but preserved)
     shadow.ts                 # Shadow detection
     aether.ts                 # Transcendent mapping
     docs.ts                   # Document processing
     collective.ts             # Group coherence
     resonance.ts              # Cross-domain patterns
   
   /docs
     /architecture
       SYSTEM_DESIGN.md
       LATENT_APIS.md         # Documents dormant modules
       API_REFERENCE.md
     /sacred
       WHITEPAPER.md
       RITUAL_LAYERS.md
       CONSCIOUSNESS_FRAMEWORK.md
     /ux
       STORYBOARDS.md
       MOTION_STATES.md
       MOBILE_FLOWS.md
     /developer
       SETUP.md
       MIGRATION.md
       TESTING.md
     /business
       MARKET_ANALYSIS.md
       REVENUE_MODEL.md
   ```

2. Move all .md files to /docs:
   - Scan entire repo for *.md files
   - Categorize by content (architecture/sacred/ux/developer/business)
   - Update all relative links
   - Delete from original locations

3. Create LATENT_APIS.md documentation:
   ```markdown
   # Latent Sacred APIs
   
   These modules are preserved in the architecture but not active in the UI.
   They provide depth for agent intelligence without cluttering user experience.
   
   ## Shadow API (/sacred-apis/shadow.ts)
   - Purpose: Detect unconscious patterns, avoidance, shadow facets
   - Status: DORMANT
   - Activation: When depth psychology needed
   - Safeguards: Never prescriptive, only reflective
   
   ## Aether API (/sacred-apis/aether.ts)
   - Purpose: Transcendent states, breakthrough detection
   - Status: DORMANT
   - Activation: When coherence > 0.9
   - Safeguards: Non-dogmatic, experiential only
   
   ## Docs API (/sacred-apis/docs.ts)
   - Purpose: Process uploaded documents into facets
   - Status: DORMANT
   - Activation: When file upload enabled
   - Safeguards: Privacy-first, local processing
   
   ## Collective API (/sacred-apis/collective.ts)
   - Purpose: Group coherence, field sensing
   - Status: DORMANT
   - Activation: Multi-user sessions
   - Safeguards: Anonymized, aggregate only
   
   ## Resonance API (/sacred-apis/resonance.ts)
   - Purpose: Cross-domain symbolic connections
   - Status: DORMANT
   - Activation: Advanced pattern recognition
   - Safeguards: Metaphorical, not literal
   ```

4. Create Sacred API Router:
   ```typescript
   // /lib/oracle/sacred-router.ts
   import { analyzeShadow } from '@/sacred-apis/shadow';
   import { detectAether } from '@/sacred-apis/aether';
   import { processDocs } from '@/sacred-apis/docs';
   import { senseCollective } from '@/sacred-apis/collective';
   import { findResonance } from '@/sacred-apis/resonance';
   
   interface SacredPipelineConfig {
     enableShadow?: boolean;
     enableAether?: boolean;
     enableDocs?: boolean;
     enableCollective?: boolean;
     enableResonance?: boolean;
   }
   
   export async function sacredPipeline(
     input: any,
     config: SacredPipelineConfig = {}
   ) {
     const results: any = {};
     
     // Only run enabled modules
     if (config.enableShadow) {
       results.shadow = await analyzeShadow(input);
     }
     if (config.enableAether) {
       results.aether = await detectAether(input);
     }
     if (config.enableDocs) {
       results.docs = await processDocs(input);
     }
     if (config.enableCollective) {
       results.collective = await senseCollective(input);
     }
     if (config.enableResonance) {
       results.resonance = await findResonance(input);
     }
     
     return results;
   }
   ```

5. Add tsconfig path aliases:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"],
         "@sacred/*": ["./components/sacred/*"],
         "@oracle/*": ["./lib/oracle/*"],
         "@latent/*": ["./sacred-apis/*"],
         "@docs/*": ["./docs/*"]
       }
     }
   }
   ```

6. Create MIGRATION.md summary:
   ```markdown
   # Sacred Core Migration Summary
   
   ## From: 144,000+ files
   ## To: ~200 Sacred Core files
   
   ### What Was Preserved
   - ✅ Sacred Components (Holoflower, Motion, Audio)
   - ✅ Wisdom Layers (cascade, facets, coherence)
   - ✅ Latent APIs (shadow, aether, docs, collective, resonance)
   - ✅ Poetry formatting & non-prescriptive voice
   
   ### What Was Removed
   - ❌ Duplicate components (HoloflowerViz, beta versions)
   - ❌ Scattered API routes (consolidated to /api/oracle)
   - ❌ Local state management (unified to Zustand)
   - ❌ Scattered documentation (consolidated to /docs)
   
   ### Architecture Benefits
   - Mobile-first responsive design
   - Single source of truth for state
   - Latent modules for future activation
   - Clean import paths with aliases
   ```

## Deliver:

1. Complete file tree after migration
2. Path alias configuration
3. LATENT_APIS.md documentation
4. Sacred router implementation
5. MIGRATION.md summary
6. Script to verify all files moved correctly
```

## Expected Migration Script Addition:

```bash
#!/bin/bash
# 05-preserve-latent-apis.sh

echo "🔮 Preserving Latent Sacred APIs..."

# Create sacred-apis directory
mkdir -p ../spiralogic-sacred-core/sacred-apis

# Create shadow API
cat > ../spiralogic-sacred-core/sacred-apis/shadow.ts << 'EOF'
// Shadow Detection API - DORMANT
export async function analyzeShadow(input: any) {
  // Deep shadow pattern analysis
  // Returns: { patterns: [], avoidance: [], integration: [] }
  return { active: false, reason: 'Module dormant' };
}
EOF

# Create aether API
cat > ../spiralogic-sacred-core/sacred-apis/aether.ts << 'EOF'
// Aether Transcendence API - DORMANT
export async function detectAether(input: any) {
  // Breakthrough and transcendent state detection
  // Returns: { stage: 0-3, activation: 0-1, qualities: [] }
  return { active: false, reason: 'Module dormant' };
}
EOF

# Create docs API
cat > ../spiralogic-sacred-core/sacred-apis/docs.ts << 'EOF'
// Document Processing API - DORMANT
export async function processDocs(input: any) {
  // Extract meaning from uploaded documents
  // Returns: { facets: [], themes: [], coherence: 0-1 }
  return { active: false, reason: 'Module dormant' };
}
EOF

# Create collective API  
cat > ../spiralogic-sacred-core/sacred-apis/collective.ts << 'EOF'
// Collective Sensing API - DORMANT
export async function senseCollective(input: any) {
  // Group coherence and field dynamics
  // Returns: { fieldCoherence: 0-1, resonance: [], emergence: [] }
  return { active: false, reason: 'Module dormant' };
}
EOF

# Create resonance API
cat > ../spiralogic-sacred-core/sacred-apis/resonance.ts << 'EOF'
// Resonance Pattern API - DORMANT
export async function findResonance(input: any) {
  // Cross-domain symbolic connections
  // Returns: { archetypes: [], symbols: [], connections: [] }
  return { active: false, reason: 'Module dormant' };
}
EOF

echo "✅ Latent Sacred APIs preserved (shadow, aether, docs, collective, resonance)"
echo "   Status: DORMANT - available for agents but not active in UI"
```