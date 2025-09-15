import { NextRequest, NextResponse } from 'next/server';

// Simple response cache to prevent duplicates
const responseCache = new Map<string, number>();
const CACHE_DURATION = 10000; // 10 seconds

// Elemental responses for basic oracle functionality
const elementalResponses = {
  fire: [
    "The friction here catalyzes transformation. What needs to burn away?",
    "I witness the heat of this moment. What's asking for change?",
    "This energy wants to move. Where does it want to take you?"
  ],
  water: [
    "These waters hold space for all that flows through you.",
    "I witness these emotions moving through. What wants to be felt?",
    "The depths here are sacred. What's emerging from below?"
  ],
  earth: [
    "Let's ground this step by step, building a solid foundation.",
    "I witness the weight of this. What needs stable ground?",
    "This calls for patience and presence. What's asking to be built?"
  ],
  air: [
    "I notice patterns emerging - what clarity seeks to arise?",
    "The space between thoughts holds wisdom. What wants to be seen?",
    "These ideas are dancing. Which one calls to you most?"
  ],
  aether: [
    "All elements dance together in this moment of presence.",
    "I witness the fullness of what you're bringing forward.",
    "This space holds all possibilities. What's calling to you?"
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
  console.log('🌟 Oracle API: Processing request');

  try {
    const body = await request.json();
    const { text, conversationHistory = [], userId = 'default' } = body;

    console.log('📝 Input received:', text?.substring(0, 100));

    // Basic validation
    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        text: "I'm here to witness what you'd like to share.",
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

    // Add witnessing framework
    if (!response.startsWith('I witness') && !response.startsWith('I notice')) {
      response = 'I witness this. ' + response;
    }

    console.log('✅ Response generated:', response.substring(0, 100));

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