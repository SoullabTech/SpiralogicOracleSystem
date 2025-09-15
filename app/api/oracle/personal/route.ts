import { NextRequest, NextResponse } from 'next/server';

// Response cache to prevent duplicates
const responseCache = new Map<string, number>();
const CACHE_DURATION = 10000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body.text || body.message || body.content || body.userMessage || body.input || body.prompt || '';
    const sessionId = body.sessionId || body.session_id || 'default';

    const lowerText = text.toLowerCase();
    let response = '';

    // DIRECT PATTERN MATCHING - NO COMPLEX ORACLE SYSTEM

    // Greetings
    if (lowerText.match(/^(hello|hi|hey)/)) {
      const greetings = [
        "Hello, I'm here with you. What brings you to this moment?",
        "Welcome. What would you like to explore together?",
        "Hello friend. I'm listening. What's on your heart?"
      ];
      response = greetings[Math.floor(Math.random() * greetings.length)];
    }
    // Can you hear me
    else if (lowerText.includes('can you hear') || lowerText.includes('do you hear')) {
      response = "Yes, I hear you clearly. What would you like to share?";
    }
    // Want to chat/talk
    else if (lowerText.includes('want to') && (lowerText.includes('chat') || lowerText.includes('talk'))) {
      response = "I'm here for whatever you'd like to explore. What's on your mind?";
    }
    // Math/technical questions
    else if (lowerText.match(/square root|calculate|what is \d+|how much|how many|solve/)) {
      response = "I notice you're asking a technical question. I'm here to witness your inner experience rather than solve problems. What's behind this question for you?";
    }
    // Excited/happy
    else if (lowerText.includes('excited') || lowerText.includes('happy')) {
      response = "I feel the enthusiasm in what you're sharing. Tell me more about what's alive in this excitement.";
    }
    // Random/nonsense (buffalo chips, monkey, etc)
    else if (lowerText.match(/buffalo|monkey|chips|random|nonsense/)) {
      response = "I'm witnessing playfulness in what you're sharing. What's behind these words for you?";
    }
    // Single words
    else if (text.split(' ').length === 1) {
      response = `Interesting. What brings "${text}" to mind right now?`;
    }
    // Need/help/guidance
    else if (lowerText.includes('need') || lowerText.includes('help') || lowerText.includes('guidance')) {
      const helps = [
        "I hear you asking for support. What feels most pressing?",
        "I'm here with you. What kind of help are you seeking?",
        "I witness this request. What's at the heart of what you need?"
      ];
      response = helps[Math.floor(Math.random() * helps.length)];
    }
    // Feelings/emotions
    else if (lowerText.match(/feel|feeling|emotion|sad|angry|frustrated|worried|anxious|scared/)) {
      response = "I'm witnessing what you're feeling. Tell me more about what's here.";
    }
    // Short responses (under 20 chars)
    else if (text.length < 20) {
      const shorts = [
        "Tell me more.",
        "What else is here?",
        "I'm listening. Go on.",
        "What's behind that?"
      ];
      response = shorts[Math.floor(Math.random() * shorts.length)];
    }
    // Medium responses (20-100 chars)
    else if (text.length < 100) {
      const mediums = [
        "I hear what you're bringing forward. What else wants to be said?",
        "There's something important here. Tell me more.",
        "I'm witnessing this with you. What stands out?",
        "Thank you for sharing. What feels most alive?"
      ];
      response = mediums[Math.floor(Math.random() * mediums.length)];
    }
    // Long responses
    else {
      const longs = [
        "I'm receiving the fullness of what you're sharing. What resonates most?",
        "There's real depth here. What feels essential?",
        "I witness the complexity of this. What wants attention?",
        "Thank you for this openness. What's at the center?"
      ];
      response = longs[Math.floor(Math.random() * longs.length)];
    }

    // Check for duplicate responses
    const now = Date.now();
    for (const [key, timestamp] of responseCache.entries()) {
      if (now - timestamp > CACHE_DURATION) {
        responseCache.delete(key);
      }
    }

    if (responseCache.has(response)) {
      // If duplicate, add variation
      response = response.replace(/\.$/, '. What else is present?');
    }
    responseCache.set(response, now);

    return NextResponse.json({
      text: response,
      content: response,
      message: response,
      metadata: {
        sessionId,
        source: 'direct-oracle',
        timestamp: now
      }
    });

  } catch (error: any) {
    console.error('Oracle API Error:', error);
    return NextResponse.json({
      text: 'I witness a moment of disruption. Share what feels present, and we can explore it together.',
      content: 'I witness a moment of disruption. Share what feels present, and we can explore it together.',
      message: 'I witness a moment of disruption. Share what feels present, and we can explore it together.',
      metadata: {
        error: true
      }
    });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'Maya Oracle - Direct Pattern Matching',
    status: 'ACTIVE',
    version: '2.0',
    timestamp: new Date().toISOString()
  });
}