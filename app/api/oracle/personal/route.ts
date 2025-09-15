import { NextRequest, NextResponse } from 'next/server';

// Response cache to prevent duplicates
const responseCache = new Map<string, { response: string, timestamp: number }>();
const CACHE_DURATION = 10000;
const recentInputs = new Map<string, number>();

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
    // Food items
    else if (lowerText.match(/cheese|burger|pizza|sandwich|food|eat|hungry|meal|breakfast|lunch|dinner/)) {
      const foods = [
        "Food connects us to memories and moments. What does this bring up for you?",
        "I notice you're mentioning food. What's the feeling behind this?",
        "There's something about food that grounds us. What are you experiencing?"
      ];
      response = foods[Math.floor(Math.random() * foods.length)];
    }
    // Family/relationships
    else if (lowerText.match(/dad|mom|mother|father|parent|family|brother|sister|friend/)) {
      const family = [
        "Relationships shape us deeply. What's present about this connection?",
        "I hear you naming someone important. What wants to be expressed?",
        "There's meaning in who we mention. Tell me more about this."
      ];
      response = family[Math.floor(Math.random() * family.length)];
    }
    // Time/dates/months
    else if (lowerText.match(/january|february|march|april|may|june|july|august|september|october|november|december|month|year|time|day/)) {
      const times = [
        "Time holds our experiences. What significance does this moment have?",
        "I notice you're marking time. What memories or hopes live here?",
        "Temporal markers often carry meaning. What's alive in this reference?"
      ];
      response = times[Math.floor(Math.random() * times.length)];
    }
    // Activities/hobbies
    else if (lowerText.match(/flying|kite|play|game|sport|hobby|activity|fun|enjoy/)) {
      const activities = [
        "Activities often express deeper needs. What draws you to this?",
        "I hear joy in this activity. What does it open up for you?",
        "Play and creation connect us to something essential. What's here?"
      ];
      response = activities[Math.floor(Math.random() * activities.length)];
    }
    // Single words
    else if (text.split(' ').length === 1) {
      const singles = [
        `"${text}" - a single word can hold worlds. What's within it?",
        `Interesting. What brings "${text}" to mind right now?",
        `Just "${text}". What lives in this word for you?`
      ];
      response = singles[Math.floor(Math.random() * singles.length)];
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

    // Prevent duplicate responses for same session
    const now = Date.now();
    const cacheKey = `${sessionId}:${response}`;
    const inputKey = `${sessionId}:${lowerText}`;

    // Clean old cache entries
    for (const [key, data] of responseCache.entries()) {
      if (now - data.timestamp > CACHE_DURATION) {
        responseCache.delete(key);
      }
    }
    for (const [key, timestamp] of recentInputs.entries()) {
      if (now - timestamp > CACHE_DURATION) {
        recentInputs.delete(key);
      }
    }

    // Check if we've seen this exact input recently
    if (recentInputs.has(inputKey)) {
      const variations = [
        "We're circling back to this. What's different now?",
        "I notice we're revisiting this. What's changed?",
        "This feels familiar. What new layer is here?"
      ];
      response = variations[Math.floor(Math.random() * variations.length)];
    }
    // Check if we've used this response recently for this session
    else if (responseCache.has(cacheKey)) {
      // Pick an alternative response based on input length
      if (text.length < 20) {
        response = "What else wants to emerge?";
      } else if (text.length < 50) {
        response = "There's more here. What stands out most?";
      } else {
        response = "I'm taking in all of this. What feels most important?";
      }
    }

    responseCache.set(cacheKey, { response, timestamp: now });
    recentInputs.set(inputKey, now);

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