import { NextRequest, NextResponse } from 'next/server';
import { MayaOrchestrator } from '@/lib/oracle/MayaOrchestrator';

/**
 * Maya Personal Oracle Route
 * Full MayaOrchestrator functionality
 */

const mayaOrchestrator = new MayaOrchestrator();

// Keep fallback responses
const MAYA_RESPONSES = {
  greeting: [
    "Hello. What brings you?",
    "Welcome. Speak your truth.",
    "I'm listening.",
    "Good to see you."
  ],
  stress: "Storms make trees take deeper roots.",
  sadness: "Tears water the soul.",
  anger: "Fire burns or warms. Choose.",
  confusion: "When you don't know, be still.",
  joy: "Joy deserves witness.",
  fear: "Courage is fear that has said its prayers.",
  default: "Tell me your truth."
};

/**
 * Clean Maya's response - remove ALL therapy-speak
 */
function cleanMayaResponse(response: string): string {
  // Remove action descriptions
  response = response.replace(/^\*?takes a .+?\*?\s*/gi, '');
  response = response.replace(/^\*?attuning.+?\*?\s*/gi, '');
  response = response.replace(/^\*?settles.+?\*?\s*/gi, '');
  response = response.replace(/^\*?responds with.+?\*?\s*/gi, '');

  // Remove therapy-speak phrases
  const therapyPhrases = [
    'I sense you\'ve arrived',
    'I\'m here to witness',
    'hold space for',
    'meeting you exactly where you are',
    'I\'m attuning to',
    'Let me hold space',
    'I sense that',
    'I\'m hearing',
    'It sounds like'
  ];

  therapyPhrases.forEach(phrase => {
    response = response.replace(new RegExp(phrase, 'gi'), '');
  });

  // Ensure maximum 20 words
  const words = response.split(/\s+/);
  if (words.length > 20) {
    response = words.slice(0, 15).join(' ') + '.';
  }

  return response.trim();
}

function detectElement(input: string): string {
  const lower = input.toLowerCase();

  if (/fire|passion|energy|transform|excited|angry/.test(lower)) return 'fire';
  if (/water|feel|emotion|flow|sad|tears/.test(lower)) return 'water';
  if (/earth|ground|stable|practical|solid|stuck/.test(lower)) return 'earth';
  if (/air|think|idea|perspective|mental|thoughts/.test(lower)) return 'air';

  return 'aether';
}

function getMayaResponse(input: string): string {
  const lower = input.toLowerCase();

  // Check for greetings
  if (/^(hello|hi|hey|maya|good morning|good evening)/i.test(lower) && input.length < 30) {
    const greetings = MAYA_RESPONSES.greeting;
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Pattern-based responses
  if (/stress|overwhelm|anxious|pressure/.test(lower)) {
    return MAYA_RESPONSES.stress;
  }
  if (/sad|depressed|down|cry|hurt/.test(lower)) {
    return MAYA_RESPONSES.sadness;
  }
  if (/angry|mad|frustrated|pissed|hate/.test(lower)) {
    return MAYA_RESPONSES.anger;
  }
  if (/confused|lost|don't know|unclear/.test(lower)) {
    return MAYA_RESPONSES.confusion;
  }
  if (/happy|good|great|excited|joy/.test(lower)) {
    return MAYA_RESPONSES.joy;
  }
  if (/scared|afraid|fear|terrified/.test(lower)) {
    return MAYA_RESPONSES.fear;
  }

  return MAYA_RESPONSES.default;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, userId = 'anonymous', sessionId } = body;

    if (!input) {
      return NextResponse.json({
        success: false,
        error: 'No input provided'
      }, { status: 400 });
    }

    console.log('Maya Personal Oracle:', input);

    // Use MayaOrchestrator for full functionality
    let oracleResponse;
    try {
      oracleResponse = await mayaOrchestrator.speak(input, userId);
    } catch (error) {
      console.log('MayaOrchestrator error, using fallback:', error);
      // Fallback to simple response
      const response = getMayaResponse(input);
      const element = detectElement(input);
      oracleResponse = {
        message: cleanMayaResponse(response),
        element,
        duration: 2000,
        voiceCharacteristics: {
          pace: 'deliberate',
          tone: 'warm_grounded',
          energy: 'calm'
        }
      };
    }

    // Extract and clean response
    const response = cleanMayaResponse(oracleResponse.message);
    const element = oracleResponse.element;

    return NextResponse.json({
      success: true,
      response,
      message: response,  // Add message field for frontend compatibility
      element,
      archetype: 'maya',
      sessionId,
      metadata: {
        wordCount: response.split(/\s+/).length,
        zenMode: true
      }
    });

  } catch (error) {
    console.error('Maya route error:', error);

    return NextResponse.json({
      success: true,
      response: "Tell me your truth.",
      element: 'earth',
      archetype: 'maya',
      metadata: {
        wordCount: 4,
        zenMode: true,
        fallback: true
      }
    });
  }
}