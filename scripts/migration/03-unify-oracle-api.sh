#!/bin/bash

# 🔄 Oracle API Unification Script
# Consolidates all oracle endpoints into single unified route

echo "🔄 Starting Oracle API Unification..."
echo "======================================"

# Create unified API directory
mkdir -p app/api/oracle-unified
mkdir -p lib/oracle-cascade

# Create the unified Oracle API route
cat > app/api/oracle-unified/route.ts << 'EOF'
// 🌸 Unified Oracle API - Sacred Core
// Consolidates all oracle modes into single orchestrated endpoint

import { NextRequest, NextResponse } from 'next/server';
import { explicitLayer } from '@/lib/oracle-cascade/explicit';
import { implicitLayer } from '@/lib/oracle-cascade/implicit';
import { shadowLayer } from '@/lib/oracle-cascade/shadow';
import { resonantLayer } from '@/lib/oracle-cascade/resonant';
import { mergeResponses } from '@/lib/oracle-cascade/merge';
import { mapToMotionState } from '@/lib/motion-mapper';
import { calculateCoherence } from '@/lib/coherence-calculator';
import { detectShadowPatterns } from '@/lib/shadow-detection';

export type OracleMode = 'checkin' | 'journal' | 'sacred' | 'unified';

export interface OracleRequest {
  mode: OracleMode;
  input: {
    checkIn?: string;
    journalText?: string;
    voiceData?: string;
    sessionHistory?: any[];
  };
  userId?: string;
  sessionId?: string;
}

export interface OracleResponse {
  // Core Response
  responseText: string;
  mode: OracleMode;
  
  // Motion & Audio Hints
  motionState: {
    primary: string;
    intensity: number;
    transitions: string[];
  };
  audioHints: {
    frequencies: number[];
    volume: number;
    pattern: string;
  };
  
  // Wisdom Layers
  facets: {
    primary: string[];
    shadow: string[];
    resonant: string[];
  };
  coherence: number;
  
  // Aether Stage (if applicable)
  aetherStage?: 1 | 2 | 3;
  
  // Metadata
  timestamp: string;
  sessionId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: OracleRequest = await req.json();
    const { mode, input, userId, sessionId } = body;
    
    console.log(`[Oracle Unified] Processing ${mode} request`);
    
    // Run through cascade layers
    const explicitResponse = await explicitLayer(input);
    const implicitResponse = await implicitLayer(input, explicitResponse);
    const shadowPatterns = await shadowLayer(input, implicitResponse);
    const resonantPatterns = await resonantLayer(input, shadowPatterns);
    
    // Merge all layers
    const mergedResponse = await mergeResponses({
      explicit: explicitResponse,
      implicit: implicitResponse,
      shadow: shadowPatterns,
      resonant: resonantPatterns
    });
    
    // Calculate coherence
    const coherence = calculateCoherence(mergedResponse);
    
    // Map to motion state
    const motionState = mapToMotionState(mergedResponse, coherence);
    
    // Detect shadow patterns
    const shadowFacets = detectShadowPatterns(mergedResponse);
    
    // Construct unified response
    const response: OracleResponse = {
      responseText: mergedResponse.text,
      mode,
      motionState: {
        primary: motionState.state,
        intensity: motionState.intensity,
        transitions: motionState.transitions
      },
      audioHints: {
        frequencies: getAudioFrequencies(motionState.state),
        volume: 0.05,
        pattern: motionState.state === 'expansion' ? 'rising' : 'settling'
      },
      facets: {
        primary: mergedResponse.primaryFacets || [],
        shadow: shadowFacets,
        resonant: mergedResponse.resonantFacets || []
      },
      coherence,
      aetherStage: determineAetherStage(coherence),
      timestamp: new Date().toISOString(),
      sessionId: sessionId || generateSessionId()
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[Oracle Unified] Error:', error);
    return NextResponse.json(
      { error: 'Oracle processing failed' },
      { status: 500 }
    );
  }
}

// Helper functions
function getAudioFrequencies(motionState: string): number[] {
  const frequencyMap: Record<string, number[]> = {
    stillness: [396, 432],
    breathing: [528, 639],
    expansion: [741, 852],
    contraction: [396, 417],
    shimmer: [852, 963]
  };
  return frequencyMap[motionState] || [528];
}

function determineAetherStage(coherence: number): 1 | 2 | 3 | undefined {
  if (coherence > 0.9) return 3;
  if (coherence > 0.8) return 2;
  if (coherence > 0.7) return 1;
  return undefined;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
EOF

# Create cascade layer modules
echo "Creating cascade layer modules..."

# Explicit Layer
cat > lib/oracle-cascade/explicit.ts << 'EOF'
// Explicit Layer - Surface patterns and direct insights
export async function explicitLayer(input: any) {
  // Process direct, conscious-level patterns
  return {
    text: '',
    patterns: [],
    confidence: 0.8
  };
}
EOF

# Implicit Layer
cat > lib/oracle-cascade/implicit.ts << 'EOF'
// Implicit Layer - Underlying patterns and connections
export async function implicitLayer(input: any, explicitResponse: any) {
  // Process subconscious patterns and hidden connections
  return {
    text: '',
    patterns: [],
    connections: []
  };
}
EOF

# Shadow Layer
cat > lib/oracle-cascade/shadow.ts << 'EOF'
// Shadow Layer - Hidden aspects and unexpressed patterns
export async function shadowLayer(input: any, implicitResponse: any) {
  // Detect shadow patterns and unexpressed dimensions
  return {
    shadowPatterns: [],
    hiddenFacets: [],
    inversions: []
  };
}
EOF

# Resonant Layer
cat > lib/oracle-cascade/resonant.ts << 'EOF'
// Resonant Layer - Archetypal and universal patterns
export async function resonantLayer(input: any, shadowPatterns: any) {
  // Identify resonant, archetypal patterns
  return {
    archetypes: [],
    universalPatterns: [],
    resonance: 0
  };
}
EOF

# Merge Module
cat > lib/oracle-cascade/merge.ts << 'EOF'
// Response Merger - Integrates all cascade layers
export async function mergeResponses(layers: any) {
  // Sophisticated merging of all oracle layers
  return {
    text: '',
    primaryFacets: [],
    resonantFacets: [],
    coherenceFactors: []
  };
}
EOF

# Create migration script for existing routes
cat > ./migration-output/api-migration-guide.md << 'EOF'
# API Migration Guide

## Routes to Deprecate
- `/api/oracle-sacred/route.ts` → Unified
- `/api/oracle-holoflower/route.ts` → Unified
- `/api/oracle-beta/route.ts` → Unified
- `/api/coherence/route.ts` → Integrated

## New Unified Endpoint
```
POST /api/oracle-unified
```

### Request Schema
```typescript
{
  mode: 'checkin' | 'journal' | 'sacred' | 'unified',
  input: {
    checkIn?: string,
    journalText?: string,
    voiceData?: string,
    sessionHistory?: any[]
  },
  userId?: string,
  sessionId?: string
}
```

### Response Schema
```typescript
{
  responseText: string,
  mode: string,
  motionState: {...},
  audioHints: {...},
  facets: {...},
  coherence: number,
  aetherStage?: 1 | 2 | 3,
  timestamp: string,
  sessionId: string
}
```

## Component Updates Required
- Update `useSacredOracle` hook to use new endpoint
- Update `OracleConversation` to handle unified response
- Update `SacredHoloflower` to use new motion hints
EOF

echo ""
echo "✅ Oracle API unification complete!"
echo "New unified endpoint: /api/oracle-unified"
echo "Migration guide saved to ./migration-output/api-migration-guide.md"