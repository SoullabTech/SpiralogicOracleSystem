import { NextRequest, NextResponse } from 'next/server';
import { getMaiaOrchestrator } from '@/lib/oracle/MaiaFullyEducatedOrchestrator';

/**
 * Maia Personal Oracle Route
 * Fully Educated Maia: Claude + Sesame Hybrid + 6000+ Knowledge Docs + Training System
 */

const maiaOrchestrator = getMaiaOrchestrator();

// Removed robotic fallback responses - MaiaOrchestrator handles all conversation

/**
 * Clean Maia's response - remove ALL therapy-speak
 */
function cleanMaiaResponse(response: string): string {
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

  // Allow natural conversation length (up to 120 words)
  const words = response.split(/\s+/);
  if (words.length > 120) {
    // Only truncate if extremely long - find natural stopping point
    const sentences = response.split(/[.!?]/);
    let truncated = '';
    let wordCount = 0;

    for (const sentence of sentences) {
      const sentenceWords = sentence.trim().split(/\s+/).length;
      if (wordCount + sentenceWords <= 110) { // Increased from 100 to 110
        truncated += sentence.trim() + '. ';
        wordCount += sentenceWords;
      } else {
        // If we have at least one complete sentence, stop there
        if (truncated.length > 0) {
          break;
        } else {
          // If the first sentence is too long, include it anyway
          truncated = sentence.trim() + '. ';
          break;
        }
      }
    }

    response = truncated.trim();
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

// Removed getMaiaResponse - MaiaOrchestrator handles all conversation logic

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

    console.log('Maia Personal Oracle:', input);

    // Use MaiaOrchestrator for full functionality with comprehensive error handling
    let oracleResponse;
    try {
      console.log('Attempting MaiaOrchestrator.speak with input:', input);
      oracleResponse = await maiaOrchestrator.speak(input, userId);
      console.log('MaiaOrchestrator response:', oracleResponse);
    } catch (error) {
      console.error('MaiaOrchestrator error details:', {
        error: error.message,
        stack: error.stack,
        input,
        userId
      });

      // Comprehensive fallback that prevents app crashes
      const element = detectElement(input);
      const isGreeting = /^(hello|hi|hey|maia)/i.test(input.toLowerCase().trim());

      let fallbackMessage;
      if (isGreeting) {
        fallbackMessage = "Hey there. What's going on?";
      } else if (input.length < 10) {
        fallbackMessage = "I hear you.";
      } else {
        fallbackMessage = "Tell me more about that.";
      }

      oracleResponse = {
        message: fallbackMessage,
        element,
        duration: 1500,
        voiceCharacteristics: {
          pace: 'deliberate',
          tone: 'warm_grounded',
          energy: 'calm'
        }
      };
    }

    // Extract and clean response
    const response = cleanMaiaResponse(oracleResponse.message);
    const element = oracleResponse.element;

    return NextResponse.json({
      success: true,
      response,
      message: response,  // Add message field for frontend compatibility
      element,
      archetype: 'maia',
      sessionId,
      metadata: {
        wordCount: response.split(/\s+/).length,
        zenMode: true
      }
    });

  } catch (error) {
    console.error('Maia route catastrophic error:', {
      error: error.message,
      stack: error.stack,
      input: body?.input || 'unknown'
    });

    // Final fallback to prevent complete app crashes
    return NextResponse.json({
      success: true,
      response: "I'm here. What would you like to talk about?",
      message: "I'm here. What would you like to talk about?",
      element: 'earth',
      archetype: 'maia',
      metadata: {
        wordCount: 9,
        zenMode: true,
        catastrophicFallback: true
      }
    });
  }
}