// Oracle Holoflower API Route - Dual-Mode Divination & Reflection System
// Orchestrates 3-prompt series: User Check-In + Oracle Reading + Merge

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// ============================================
// Type Definitions
// ============================================

interface PetalIntensity {
  [petalId: string]: number; // 0-1 intensity values
}

interface PetalInfo {
  petal: string;
  essence: string;
  keywords: string[];
  feeling?: string;
  ritual?: string;
  shadow?: string;
  blessing?: string;
}

interface UserCheckin {
  userCheckin: PetalInfo[];
}

interface OracleReading {
  oracleReading: {
    elementalBalance: {
      fire: number;
      water: number;
      earth: number;
      air: number;
      aether: number;
    };
    spiralStage: {
      element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
      stage: 1 | 2 | 3;
    };
    reflection: string;
    practice: string;
    archetype: string;
  };
}

interface MergedInsight {
  mergedInsight: {
    alignment: string;
    tension: string;
    synthesis: string;
  };
}

interface SessionPayload {
  sessionId: string;
  timestamp: string;
  userCheckin?: PetalInfo[];
  oracleReading?: OracleReading['oracleReading'];
  mergedInsight?: MergedInsight['mergedInsight'];
}

// ============================================
// Petal Chart Mapping
// ============================================

const PETAL_CHART: Record<string, PetalInfo> = {
  // Fire Petals
  Fire1: {
    petal: 'Fire1',
    essence: 'Spark',
    keywords: ['Ignition', 'Vision', 'Initiation'],
    shadow: 'Impulsivity',
    blessing: 'Courage to begin'
  },
  Fire2: {
    petal: 'Fire2',
    essence: 'Blaze',
    keywords: ['Passion', 'Creation', 'Momentum'],
    shadow: 'Burnout',
    blessing: 'Creative fire'
  },
  Fire3: {
    petal: 'Fire3',
    essence: 'Phoenix',
    keywords: ['Rebirth', 'Mastery', 'Transformation'],
    shadow: 'Destruction',
    blessing: 'Sacred renewal'
  },
  Water1: {
    petal: 'Water1',
    essence: 'Droplet',
    keywords: ['Curiosity', 'First feeling', 'Receptivity'],
    shadow: 'Overwhelm',
    blessing: 'Gentle opening'
  },
  Water2: {
    petal: 'Water2',
    essence: 'Flow',
    keywords: ['Surrender', 'Connection', 'Intuition'],
    shadow: 'Dissolution',
    blessing: 'Trust in flow'
  },
  Water3: {
    petal: 'Water3',
    essence: 'Ocean',
    keywords: ['Unity', 'Depth', 'Wisdom'],
    shadow: 'Drowning',
    blessing: 'Infinite depth'
  },
  Earth1: {
    petal: 'Earth1',
    essence: 'Seed',
    keywords: ['Potential', 'Patience', 'Grounding'],
    shadow: 'Stagnation',
    blessing: 'Sacred patience'
  },
  Earth2: {
    petal: 'Earth2',
    essence: 'Root',
    keywords: ['Foundation', 'Nourishment', 'Growth'],
    shadow: 'Rigidity',
    blessing: 'Deep stability'
  },
  Earth3: {
    petal: 'Earth3',
    essence: 'Mountain',
    keywords: ['Permanence', 'Achievement', 'Legacy'],
    shadow: 'Immobility',
    blessing: 'Eternal presence'
  },
  Air1: {
    petal: 'Air1',
    essence: 'Whisper',
    keywords: ['Inquiry', 'Perspective', 'Lightness'],
    shadow: 'Distraction',
    blessing: 'Fresh perspective'
  },
  Air2: {
    petal: 'Air2',
    essence: 'Wind',
    keywords: ['Movement', 'Communication', 'Clarity'],
    shadow: 'Detachment',
    blessing: 'Clear seeing'
  },
  Air3: {
    petal: 'Air3',
    essence: 'Sky',
    keywords: ['Freedom', 'Vision', 'Truth'],
    shadow: 'Disconnection',
    blessing: 'Infinite view'
  },
  // Aether Center States (not petals, but center pulses)
  Aether1: {
    petal: 'Aether1',
    essence: 'Expansive Nature',
    keywords: ['Transcendence', 'Mystery', 'Exploration', 'Expression'],
    shadow: 'Lost in expansion',
    blessing: 'Sacred mystery unfolding'
  },
  Aether2: {
    petal: 'Aether2',
    essence: 'Contractive Nature',
    keywords: ['Witnessing', 'Evolution', 'Transformation', 'Depth'],
    shadow: 'Collapsed into density',
    blessing: 'Wisdom through witnessing'
  },
  Aether3: {
    petal: 'Aether3',
    essence: 'Stillness',
    keywords: ['Stillness', 'Silence', 'Sacred', 'Infinite'],
    shadow: 'Empty void',
    blessing: 'Sacred wholeness'
  }
};

// ============================================
// Transcendent Detection
// ============================================

function detectTranscendentQualities(text: string): boolean {
  const transcendentMarkers = [
    'meditation', 'stillness', 'silence', 'witness', 'awareness',
    'consciousness', 'presence', 'being', 'non-dual', 'unity',
    'oneness', 'void', 'emptiness', 'fullness', 'infinite',
    'eternal', 'timeless', 'spacious', 'boundless', 'transcend',
    'mystery', 'sacred', 'divine', 'source', 'essence',
    'awakening', 'enlightenment', 'liberation', 'surrender',
    'dissolve', 'merge', 'expand', 'contract', 'breathe',
    'luminous', 'radiant', 'formless', 'beyond', 'absolute'
  ];
  
  const lowerText = text.toLowerCase();
  const transcendentCount = transcendentMarkers.filter(marker => 
    lowerText.includes(marker)
  ).length;
  
  // Need at least 2 markers to consider transcendent
  return transcendentCount >= 2;
}

// ============================================
// Supabase Client
// ============================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ============================================
// Claude Prompt Functions
// ============================================

async function processUserCheckin(petalIntensities: PetalIntensity): Promise<UserCheckin> {
  const activePetals = Object.entries(petalIntensities)
    .filter(([_, intensity]) => intensity > 0.3)
    .map(([petalId, intensity]) => {
      const petalInfo = PETAL_CHART[petalId];
      if (!petalInfo) return null;
      
      return {
        ...petalInfo,
        feeling: generatePetalFeeling(petalId, intensity),
        ritual: generatePetalRitual(petalId, intensity)
      };
    })
    .filter(Boolean) as PetalInfo[];

  return { userCheckin: activePetals };
}

async function processOracleReading(text: string): Promise<OracleReading> {
  // Check for transcendent qualities first
  const hasTranscendent = detectTranscendentQualities(text);
  
  const prompt = `You are the Spiralogic Oracle agent.

Input: ${text}

Process in five layers:
1. Ontological reasoning (Fire, Water, Earth, Air, Aether)
   ${hasTranscendent ? '- Pay special attention to Aether/transcendent qualities' : ''}
2. Temporal expansion (past, present, future)
3. Implicit detection (explicit, implied, emergent, shadow, resonant)
4. Spiralogic mapping (Recognition → Integration)
5. Output shaping (reflection, micro-practice, archetypal image)

Special Aether Detection:
- If the input contains transcendent, non-dual, mystical, or liminal qualities
- Consider Aether stages:
  * Aether1: Expansive expression, mystery, exploration
  * Aether2: Witnessing, contraction into wisdom
  * Aether3: Stillness, sacred in the ordinary
- Only map to Aether when truly transcendent (rare)

Then extract:
- Elemental balance (0–1 for each element)
- Spiral stage (element + stage, can include "aether" if transcendent)
- Reflection question
- Micro-practice
- Archetypal image

Respond ONLY in JSON:
{
  "oracleReading": {
    "elementalBalance": { "fire":0.xx, "water":0.xx, "earth":0.xx, "air":0.xx, "aether":0.xx },
    "spiralStage": { "element":"fire"|"water"|"earth"|"air"|"aether", "stage":1|2|3 },
    "reflection":"...",
    "practice":"...",
    "archetype":"..."
  }
}`;

  try {
    const response = await callClaude(prompt);
    return JSON.parse(response) as OracleReading;
  } catch (error) {
    console.error('Oracle reading error:', error);
    // Return default structure
    return {
      oracleReading: {
        elementalBalance: { fire: 0.25, water: 0.25, earth: 0.25, air: 0.25, aether: 0 },
        spiralStage: { element: 'fire', stage: 1 },
        reflection: 'What seeks to emerge through you today?',
        practice: 'Take three conscious breaths and notice what arises.',
        archetype: 'The Seeker'
      }
    };
  }
}

async function processMerge(
  userCheckin: PetalInfo[], 
  oracleReading: OracleReading['oracleReading']
): Promise<MergedInsight> {
  // Handle Aether specially - it's center, not petal
  const isAether = oracleReading.spiralStage.element === 'aether';
  
  // Map oracle reading to petals (or Aether center)
  const oraclePetal = isAether 
    ? `Aether${oracleReading.spiralStage.stage}`
    : `${oracleReading.spiralStage.element.charAt(0).toUpperCase()}${oracleReading.spiralStage.element.slice(1)}${oracleReading.spiralStage.stage}`;
  
  // Find alignments
  const userPetals = userCheckin.map(p => p.petal);
  const aligned = isAether 
    ? userPetals.some(p => p.startsWith('Aether'))
    : userPetals.includes(oraclePetal);
  
  // Analyze elemental alignment
  const userElements = extractElementsFromPetals(userPetals);
  const oracleElement = oracleReading.spiralStage.element;
  
  const alignment = aligned 
    ? `Your intuition and the oracle both point to ${oraclePetal} - ${PETAL_CHART[oraclePetal]?.essence || 'transformation'}.`
    : `Your intuition explores ${userPetals.join(', ')} while the oracle suggests ${oraclePetal}.`;
    
  const tension = userElements.includes(oracleElement)
    ? 'Minimal tension - you\'re already attuned to this elemental frequency.'
    : `Creative tension between your ${userElements[0]} focus and the oracle\'s ${oracleElement} guidance.`;
    
  const synthesis = generateSynthesis(userCheckin, oracleReading);

  return {
    mergedInsight: {
      alignment,
      tension,
      synthesis
    }
  };
}

// ============================================
// Helper Functions
// ============================================

function generatePetalFeeling(petalId: string, intensity: number): string {
  const feelings: Record<string, string[]> = {
    Fire1: ['a spark awakening', 'the first flame', 'ignition beginning'],
    Fire2: ['creative heat rising', 'passion flowing', 'power building'],
    Fire3: ['phoenix wings spreading', 'transformation completing', 'mastery emerging'],
    Water1: ['first drops of rain', 'gentle curiosity', 'softening edges'],
    Water2: ['river finding its path', 'emotional current', 'intuitive flow'],
    Water3: ['oceanic vastness', 'deep knowing', 'boundless compassion'],
    Earth1: ['seed stirring underground', 'patient waiting', 'quiet potential'],
    Earth2: ['roots deepening', 'stable growth', 'nourishing foundation'],
    Earth3: ['mountain presence', 'unshakeable truth', 'eternal standing'],
    Air1: ['first breath of dawn', 'gentle questioning', 'light touch'],
    Air2: ['wind carrying messages', 'clear communication', 'swift movement'],
    Air3: ['infinite sky opening', 'boundless freedom', 'vast perspective'],
    Aether: ['void and fullness', 'mystery present', 'all and nothing']
  };
  
  const petalFeelings = feelings[petalId] || ['energy moving', 'presence felt', 'essence touched'];
  const index = Math.floor(intensity * (petalFeelings.length - 1));
  return petalFeelings[index];
}

function generatePetalRitual(petalId: string, intensity: number): string {
  const rituals: Record<string, string> = {
    Fire1: 'Light a candle with intention',
    Fire2: 'Create something with your hands',
    Fire3: 'Release what no longer serves through flame',
    Water1: 'Cup water in your hands and bless it',
    Water2: 'Flow with music or movement',
    Water3: 'Sit by water and listen deeply',
    Earth1: 'Plant a seed or intention',
    Earth2: 'Walk barefoot on earth',
    Earth3: 'Build a small cairn or altar',
    Air1: 'Write a question and release it to wind',
    Air2: 'Speak your truth aloud',
    Air3: 'Breathe into vast space',
    Aether: 'Sit in silence for 13 breaths'
  };
  
  return rituals[petalId] || 'Follow your intuition for a simple ritual';
}

function extractElementsFromPetals(petals: string[]): string[] {
  const elements = new Set<string>();
  petals.forEach(petal => {
    const element = petal.replace(/[0-9]/g, '').toLowerCase();
    if (['fire', 'water', 'earth', 'air'].includes(element)) {
      elements.add(element);
    }
  });
  return Array.from(elements);
}

function generateSynthesis(
  userCheckin: PetalInfo[], 
  oracleReading: OracleReading['oracleReading']
): string {
  const userEssences = userCheckin.map(p => p.essence).join(' + ');
  const oracleArchetype = oracleReading.archetype;
  
  return `Today you embody ${userEssences} while ${oracleArchetype} guides your journey. ${oracleReading.practice}`;
}

async function callClaude(prompt: string): Promise<string> {
  // This would call your actual Claude API
  // For now, returning a mock response structure
  const mockResponse = {
    oracleReading: {
      elementalBalance: { 
        fire: Math.random() * 0.5 + 0.2,
        water: Math.random() * 0.5 + 0.2,
        earth: Math.random() * 0.5 + 0.2,
        air: Math.random() * 0.5 + 0.2,
        aether: Math.random() * 0.3
      },
      spiralStage: { 
        element: ['fire', 'water', 'earth', 'air'][Math.floor(Math.random() * 4)] as any,
        stage: (Math.floor(Math.random() * 3) + 1) as any
      },
      reflection: 'What pattern seeks recognition in your experience today?',
      practice: 'Spend 5 minutes observing without judgment.',
      archetype: ['The Seeker', 'The Guardian', 'The Creator', 'The Sage'][Math.floor(Math.random() * 4)]
    }
  };
  
  return JSON.stringify(mockResponse);
}

// ============================================
// Main Route Handlers
// ============================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mode,           // 'checkin' | 'reading' | 'full'
      petalIntensities,  // For check-in mode
      journalText,       // For reading mode
      userId,
      sessionId = uuidv4()
    } = body;

    const timestamp = new Date().toISOString();
    let payload: SessionPayload = {
      sessionId,
      timestamp
    };

    // Process based on mode
    if (mode === 'checkin' && petalIntensities) {
      // User intuitive check-in only
      const checkinResult = await processUserCheckin(petalIntensities);
      payload.userCheckin = checkinResult.userCheckin;
    } 
    else if (mode === 'reading' && journalText) {
      // Oracle reading only
      const readingResult = await processOracleReading(journalText);
      payload.oracleReading = readingResult.oracleReading;
    }
    else if (mode === 'full' && petalIntensities && journalText) {
      // Full 3-step process
      const checkinResult = await processUserCheckin(petalIntensities);
      const readingResult = await processOracleReading(journalText);
      const mergeResult = await processMerge(
        checkinResult.userCheckin,
        readingResult.oracleReading
      );
      
      payload.userCheckin = checkinResult.userCheckin;
      payload.oracleReading = readingResult.oracleReading;
      payload.mergedInsight = mergeResult.mergedInsight;
    }
    else {
      return NextResponse.json(
        { error: 'Invalid mode or missing required data' },
        { status: 400 }
      );
    }

    // Persist to database if authenticated
    if (userId) {
      await persistHoloflowerSession(userId, payload);
    }

    return NextResponse.json(payload);
    
  } catch (error) {
    console.error('Holoflower oracle error:', error);
    return NextResponse.json(
      { error: 'Failed to process holoflower oracle' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  try {
    const { data: sessions, error } = await supabase
      .from('holoflower_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Analyze patterns across sessions
    const patterns = analyzeHoloflowerPatterns(sessions || []);

    return NextResponse.json({
      sessions: sessions || [],
      patterns
    });
    
  } catch (error) {
    console.error('Failed to fetch holoflower sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// ============================================
// Database Functions
// ============================================

async function persistHoloflowerSession(userId: string, payload: SessionPayload) {
  try {
    const { error } = await supabase
      .from('holoflower_sessions')
      .insert({
        user_id: userId,
        session_id: payload.sessionId,
        timestamp: payload.timestamp,
        user_checkin: payload.userCheckin || null,
        oracle_reading: payload.oracleReading || null,
        merged_insight: payload.mergedInsight || null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to persist holoflower session:', error);
    }
  } catch (error) {
    console.error('Database error:', error);
  }
}

function analyzeHoloflowerPatterns(sessions: any[]): {
  dominantPetals: string[];
  elementalJourney: string;
  evolutionPhase: string;
  nextGuidance: string;
} {
  if (!sessions || sessions.length === 0) {
    return {
      dominantPetals: [],
      elementalJourney: 'Beginning',
      evolutionPhase: 'Seed',
      nextGuidance: 'Begin with a single petal that calls to you.'
    };
  }

  // Count petal frequencies
  const petalCounts: Record<string, number> = {};
  
  sessions.forEach(session => {
    if (session.user_checkin) {
      session.user_checkin.forEach((petal: PetalInfo) => {
        petalCounts[petal.petal] = (petalCounts[petal.petal] || 0) + 1;
      });
    }
  });

  // Get top 3 petals
  const dominantPetals = Object.entries(petalCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([petal]) => petal);

  // Determine elemental journey
  const elements = extractElementsFromPetals(dominantPetals);
  const elementalJourney = elements.length > 2 
    ? 'Weaving all elements'
    : elements.join(' → ');

  // Evolution phase based on stage distribution
  const stages = dominantPetals.map(p => parseInt(p.slice(-1)) || 0);
  const avgStage = stages.reduce((a, b) => a + b, 0) / stages.length;
  
  const evolutionPhase = avgStage < 1.5 ? 'Recognition' 
    : avgStage < 2.5 ? 'Exploration'
    : 'Integration';

  // Generate guidance
  const nextGuidance = generateGuidance(dominantPetals, evolutionPhase);

  return {
    dominantPetals,
    elementalJourney,
    evolutionPhase,
    nextGuidance
  };
}

function generateGuidance(petals: string[], phase: string): string {
  const guidanceMap: Record<string, string> = {
    Recognition: 'Notice where these energies appear in your daily life.',
    Exploration: 'Experiment with combining these forces in new ways.',
    Integration: 'You are ready to embody these gifts fully.'
  };
  
  return guidanceMap[phase] || 'Trust your intuition as you continue exploring.';
}