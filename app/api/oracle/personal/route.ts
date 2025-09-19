import { NextRequest, NextResponse } from 'next/server';
import { MayaOrchestrator } from '@/lib/oracle/MayaOrchestrator';
import { organicPromptSystem } from '@/lib/maya/OrganicPromptSystem';

/**
 * Maya Personal Oracle Route
 * Enhanced with organic learning system
 */

const mayaOrchestrator = new MayaOrchestrator();

// Removed robotic fallback responses - MayaOrchestrator handles all conversation

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

// Removed getMayaResponse - MayaOrchestrator handles all conversation logic

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
      console.error('MayaOrchestrator error:', error);
      // Use a better fallback that maintains personality
      const element = detectElement(input);
      oracleResponse = {
        message: "I'm here. Tell me what's on your mind.",
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