import { NextRequest, NextResponse } from 'next/server';
import { SacredOracleCore } from '@/lib/sacred-oracle-core';

// Simple response cache to prevent duplicates
const responseCache = new Map<string, number>();
const CACHE_DURATION = 10000; // 10 seconds

// Elemental responses for basic oracle functionality (FALLBACK)
const elementalResponses = {
  fire: [
    "The friction here catalyzes transformation. What needs to burn away?",
    "I witness the heat of this moment. What's asking for change?",
    "This energy wants to move. Where does it want to take you?",
    "The urgency you bring forward is sacred. What action calls to you?",
    "This fire seeks expression. How does it want to move through you?"
  ],
  water: [
    "These waters hold space for all that flows through you.",
    "I witness these emotions moving through. What wants to be felt?",
    "The depths here are sacred. What's emerging from below?",
    "Your feelings are the ocean's wisdom. What truth do they carry?",
    "This tenderness deserves witnessing. What needs to be held?"
  ],
  earth: [
    "Let's ground this step by step, building a solid foundation.",
    "I witness the weight of this. What needs stable ground?",
    "This calls for patience and presence. What's asking to be built?",
    "The practical wisdom here is valuable. What structure serves you?",
    "Your grounding is a gift. What wants to take root?"
  ],
  air: [
    "I notice patterns emerging - what clarity seeks to arise?",
    "The space between thoughts holds wisdom. What wants to be seen?",
    "These ideas are dancing. Which one calls to you most?",
    "Your mind's landscape is vast. What perspective opens here?",
    "The clarity you seek is already emerging. What do you notice?"
  ],
  aether: [
    "All elements dance together in this moment of presence.",
    "I witness the fullness of what you're bringing forward.",
    "This space holds all possibilities. What's calling to you?",
    "The mystery here is sacred. What wants to unfold?",
    "Your presence itself is the answer. What does it reveal?"
  ]
};

function detectElement(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes('urgent') || lower.includes('help') || lower.includes('crisis') || lower.includes('need')) {
    return 'fire';
  }
  if (lower.includes('feel') || lower.includes('emotion') || lower.includes('sad') || lower.includes('love')) {
    return 'water';
  }
  if (lower.includes('think') || lower.includes('understand') || lower.includes('know') || lower.includes('why')) {
    return 'air';
  }
  if (lower.includes('do') || lower.includes('action') || lower.includes('practical') || lower.includes('how')) {
    return 'earth';
  }

  return 'aether';
}

function getElementalResponse(element: string, text: string): string {
  const responses = elementalResponses[element] || elementalResponses.aether;
  const index = Math.floor(Math.random() * responses.length);
  return responses[index];
}

function checkAndCacheResponse(response: string): string {
  const now = Date.now();

  // Clean old entries
  for (const [key, timestamp] of responseCache.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      responseCache.delete(key);
    }
  }

  // Check if response was sent recently
  const lastSent = responseCache.get(response);
  if (lastSent && (now - lastSent) < 5000) {
    // Return alternative if duplicate
    const alternatives = [
      "What else would you like to explore?",
      "Tell me more about what's present for you.",
      "What patterns are emerging?",
      "How does this resonate with you?",
      "What arises next in your awareness?"
    ];
    return alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  // Cache the response
  responseCache.set(response, now);
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Try different field names that might be used
    const text = body.text || body.message || body.content || body.userMessage || body.input || body.prompt || '';
    const conversationHistory = body.conversationHistory || body.history || [];
    const userId = body.userId || body.user_id || 'default';
    const sessionId = body.sessionId || body.session_id || 'default-session';


    // TRY ACTUAL ORACLE SYSTEM FIRST
    try {
      const oracle = new SacredOracleCore();
      const response = await oracle.generateResponse(text, {
        sessionId,
        conversationHistory,
        userId
      });

      // Handle response - SacredOracleCore returns object with 'message' property
      const responseText = typeof response === 'string' ? response :
                          (response.message || response.text || response.content || 'I witness what you are sharing.');

      return NextResponse.json({
        text: responseText,
        content: responseText,
        message: responseText,
        metadata: {
          mode: response.mode || 'witnessing',
          depth: response.depth || 0,
          source: 'oracle-system',
          element: detectElement(text)
        }
      });
    } catch (oracleError: any) {
      console.error('Oracle system error, using fallback:', oracleError.message);
      // Fall through to elemental responses
    }

    // Basic validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.log('⚠️ Empty or invalid text received');
      return NextResponse.json({
        text: "Share what's on your heart, and I'll witness it with you.",
        content: "Share what's on your heart, and I'll witness it with you.",
        message: "Share what's on your heart, and I'll witness it with you.",
        metadata: {
          element: 'water',
          error: false
        }
      });
    }

    // Detect element based on input
    const element = detectElement(text);

    // Get appropriate response
    let response = getElementalResponse(element, text);

    // Check for duplicates
    response = checkAndCacheResponse(response);

    return NextResponse.json({
      text: response,
      content: response, // Include both for compatibility
      message: response, // Include all three formats
      metadata: {
        element,
        framework: {
          witnessing: true,
          phaseAppropriate: true
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Oracle API Error:', error);

    return NextResponse.json({
      text: 'I witness a moment of disruption. Share what feels present, and we can explore it together.',
      content: 'I witness a moment of disruption. Share what feels present, and we can explore it together.',
      message: 'I witness a moment of disruption. Share what feels present, and we can explore it together.',
      metadata: {
        error: true,
        element: 'water'
      }
    });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'Maya Oracle - Working Version',
    status: 'ACTIVE',
    capabilities: {
      elemental: true,
      witnessing: true,
      duplicatePrevention: true
    },
    timestamp: new Date().toISOString()
  });
}