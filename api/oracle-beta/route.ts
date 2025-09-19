// Oracle Beta API - Simplified cascade with direct JSON response
import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { sessionStorage } from '@/lib/services/sessionStorage';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

// Single compound prompt for the entire cascade
const ORACLE_SYSTEM_PROMPT = `You are the Spiralogic Oracle agent.

Process the input through these layers:
1. Ontological reasoning (Fire, Water, Earth, Air, Aether)
2. Temporal expansion (past, present, future)
3. Implicit detection (explicit, implied, emergent, shadow, resonant)
4. Spiralogic mapping (Recognition → Integration)
5. Output shaping (reflection, micro-practice, archetypal image)

Then extract:
- Elemental balance (0-1 values for fire, water, earth, air, aether)
  * Sum should approximately equal 1
  * Based on which elements are most activated in the query
- Spiral stage (element + stage, 12-wedge model):
  * 12-3 o'clock = Fire (stages 1-3)
  * 3-6 o'clock = Water (stages 1-3)
  * 6-9 o'clock = Earth (stages 1-3)
  * 9-12 o'clock = Air (stages 1-3)
  * Stage 1 = Recognition/Beginning
  * Stage 2 = Deepening/Processing
  * Stage 3 = Integration/Completion

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "sessionId": "<generate-uuid>",
  "timestamp": "<current-iso8601>",
  "elementalBalance": {
    "fire": 0.xx,
    "water": 0.xx,
    "earth": 0.xx,
    "air": 0.xx,
    "aether": 0.xx
  },
  "spiralStage": {
    "element": "fire|water|earth|air",
    "stage": 1|2|3
  },
  "reflection": "one clear guiding question",
  "practice": "one simple micro-practice",
  "archetype": "one mythic/archetypal image"
}`;

export async function POST(req: NextRequest) {
  try {
    const { text, userId } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Input text is required' },
        { status: 400 }
      );
    }

    // Call Claude with the compound prompt
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 800,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: `${ORACLE_SYSTEM_PROMPT}\n\nInput: ${text}`
        }
      ]
    });

    // Extract JSON from response
    const firstContent = response.content[0];
    const responseText = firstContent.type === 'text' ? firstContent.text : '';
    
    // Clean the response (remove any markdown or extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Claude response');
    }

    let result;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response was:', responseText);
      throw new Error('Invalid JSON in Claude response');
    }

    // Ensure required fields exist with fallbacks
    const sessionPayload = {
      sessionId: result.sessionId || generateSessionId(),
      timestamp: result.timestamp || new Date().toISOString(),
      elementalBalance: normalizeElementalBalance(result.elementalBalance || {}),
      spiralStage: validateSpiralStage(result.spiralStage || {}),
      reflection: result.reflection || 'What is seeking to emerge through you?',
      practice: result.practice || 'Take three conscious breaths and listen.',
      archetype: result.archetype || 'The Seeker at the threshold.'
    };

    // Always attempt to store session for beta tracking
    if (userId) {
      const storageResult = await sessionStorage.storeSession(
        userId,
        text,
        sessionPayload,
        {
          mode: 'beta',
          metadata: {
            model: 'claude-3-opus-20240229',
            temperature: 0.7,
            promptVersion: 'beta-1.0'
          }
        }
      );

      if (storageResult.success) {
        console.log(`[Oracle Beta] Session stored: ${storageResult.sessionId}`);
      } else {
        console.warn(`[Oracle Beta] Failed to store session: ${storageResult.error}`);
      }
    } else {
      console.warn('[Oracle Beta] No userId provided - session not persisted');
    }

    return NextResponse.json({
      ...sessionPayload,
      persisted: userId ? true : false
    });

  } catch (error) {
    console.error('Oracle beta error:', error);
    
    // Return a fallback response on error
    return NextResponse.json({
      sessionId: generateSessionId(),
      timestamp: new Date().toISOString(),
      elementalBalance: {
        fire: 0.2,
        water: 0.2,
        earth: 0.2,
        air: 0.2,
        aether: 0.2
      },
      spiralStage: {
        element: 'air',
        stage: 1
      },
      reflection: 'What brings you to this moment of seeking?',
      practice: 'Pause and feel your feet on the ground.',
      archetype: 'The Wanderer beginning a new cycle.',
      error: 'Oracle cascade encountered an issue. Using default guidance.'
    });
  }
}

// Helper functions

function generateSessionId(): string {
  return `oracle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function normalizeElementalBalance(balance: any): Record<string, number> {
  const normalized = {
    fire: Number(balance.fire) || 0.2,
    water: Number(balance.water) || 0.2,
    earth: Number(balance.earth) || 0.2,
    air: Number(balance.air) || 0.2,
    aether: Number(balance.aether) || 0.2
  };

  // Ensure values are between 0 and 1
  Object.keys(normalized).forEach(key => {
    normalized[key as keyof typeof normalized] = Math.max(0, Math.min(1, normalized[key as keyof typeof normalized]));
  });

  // Normalize to sum approximately to 1
  const sum = Object.values(normalized).reduce((a, b) => a + b, 0);
  if (sum > 0) {
    Object.keys(normalized).forEach(key => {
      normalized[key as keyof typeof normalized] /= sum;
    });
  }

  return normalized;
}

function validateSpiralStage(stage: any): { element: string; stage: number } {
  const validElements = ['fire', 'water', 'earth', 'air'];
  const element = validElements.includes(stage.element) ? stage.element : 'air';
  const stageNum = [1, 2, 3].includes(Number(stage.stage)) ? Number(stage.stage) : 1;

  return { element, stage: stageNum };
}

// Session persistence is now handled by sessionStorage service