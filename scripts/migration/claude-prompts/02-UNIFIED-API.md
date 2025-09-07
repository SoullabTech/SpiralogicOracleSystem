# 🔄 Prompt 2: Unified API Endpoint

## Claude Code Prompt

```
You are Claude Code. Refactor all oracle API routes into a single, unified endpoint that preserves the wisdom cascade while simplifying the architecture.

## Task:

1. Consolidate these routes into ONE:
   - /api/oracle-insights
   - /api/oracle-cascade
   - /api/oracle-sacred
   - /api/oracle-holoflower
   - /api/coherence

2. Create unified route at: /app/api/oracle/route.ts

3. Input schema (TypeScript):
   ```typescript
   interface OracleRequest {
     mode: "checkin" | "journal" | "sacred" | "full";
     userId: string;
     transcript?: string;
     petalIntensities?: Record<string, number>;
     uploadedDocuments?: Array<{
       url: string;
       type: string;
     }>;
     options?: {
       enableVoice: boolean;
       enableAether: boolean;
       cascadeDepth: "surface" | "deep" | "full";
     };
   }
   ```

4. Response schema:
   ```typescript
   interface OracleResponse {
     sessionId: string;
     coherence: number; // 0-1
     primaryFacet: string;
     shadowFacets: string[];
     motionState: {
       primary: "stillness" | "breathing" | "expansion" | "contraction" | "shimmer";
       intensity: number;
       transitions: string[];
     };
     aetherStage: 0 | 1 | 2 | 3;
     reflection: string; // Poetry-formatted oracle response
     practice: string; // Suggested integration practice
     sacredTone: {
       frequencies: number[];
       pattern: "ascending" | "descending" | "circular";
     };
     synthesis: {
       explicit: string;
       implicit: string;
       shadow: string;
       resonant: string;
     };
   }
   ```

5. Processing cascade (MUST preserve wisdom layers):
   - Extract patterns from transcript/documents
   - Run through explicit → implicit → shadow → resonant layers
   - Map to Spiralogic facets (12 petals + Aether)
   - Calculate coherence based on integration
   - Generate motion state from emotional resonance
   - Detect Aether activation (coherence > 0.9)
   - Format response in poetic, non-prescriptive voice

6. Supabase integration:
   - Create session record with coherence + facets
   - Store insight with reflection + practice
   - Link uploaded documents to session
   - Update user's coherence timeline

7. Claude integration:
   - Use Anthropic SDK for deep analysis
   - Maintain sacred, mirroring tone
   - Never prescriptive, always reflective
   - Preserve metaphorical language

## Deliver:

1. Complete /app/api/oracle/route.ts implementation
2. TypeScript types in /lib/types/oracle.ts
3. Helper functions in /lib/oracle/:
   - cascade.ts (wisdom layers)
   - coherence.ts (calculation)
   - motion-mapper.ts (state mapping)
   - sacred-tone.ts (frequency generation)
4. Error handling for rate limits, validation
5. Logging for debugging cascade flow
```

## Expected Implementation:

```typescript
// /app/api/oracle/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { 
  runCascade, 
  calculateCoherence,
  mapToMotion,
  generateSacredTone 
} from '@/lib/oracle';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request
    if (!body.mode || !body.userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Run wisdom cascade
    const cascadeResult = await runCascade({
      transcript: body.transcript,
      documents: body.uploadedDocuments,
      depth: body.options?.cascadeDepth || 'deep'
    });
    
    // Calculate coherence
    const coherence = calculateCoherence(cascadeResult);
    
    // Map to motion state
    const motionState = mapToMotion(cascadeResult, coherence);
    
    // Generate sacred frequencies
    const sacredTone = generateSacredTone(motionState, coherence);
    
    // Detect Aether activation
    const aetherStage = coherence > 0.9 ? 3 : 
                       coherence > 0.8 ? 2 :
                       coherence > 0.7 ? 1 : 0;
    
    // Save to Supabase
    const session = await saveSession({...});
    const insight = await saveInsight({...});
    
    return NextResponse.json({
      sessionId: session.id,
      coherence,
      primaryFacet: cascadeResult.primaryFacet,
      shadowFacets: cascadeResult.shadowFacets,
      motionState,
      aetherStage,
      reflection: cascadeResult.reflection,
      practice: cascadeResult.practice,
      sacredTone,
      synthesis: cascadeResult.synthesis
    });
    
  } catch (error) {
    console.error('[Oracle API] Error:', error);
    return NextResponse.json(
      { error: 'Oracle processing failed' },
      { status: 500 }
    );
  }
}
```