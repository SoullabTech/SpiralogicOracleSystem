import { NextRequest, NextResponse } from 'next/server';

// SIMPLE WORKING ORACLE - NO COMPLEX DEPENDENCIES
export async function POST(request: NextRequest) {
  try {
    const { text, sessionId } = await request.json();
    const input = (text || '').toLowerCase();

    let response = '';

    // "Can you hear me" variations
    if (input.includes('can you hear') || input.includes('do you hear')) {
      const responses = [
        "Yes, I hear you clearly. What would you like to share?",
        "I'm here and listening. What's on your heart?",
        "Yes, I'm with you. What wants to be expressed?",
        "I hear you. Tell me what's present for you."
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }
    // Greetings
    else if (input.match(/^(hello|hi|hey)/)) {
      const responses = [
        "Hello, welcome. What brings you here today?",
        "Hello friend. What would you like to explore?",
        "Welcome. I'm here to witness whatever you'd like to share.",
        "Hello. What's alive for you in this moment?"
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }
    // Single words (hamburgers, etc)
    else if (input.split(' ').length === 1) {
      const responses = [
        `Interesting. What brings "${text}" to mind?`,
        `I notice you mention "${text}". What's present in that for you?`,
        `"${text}" - tell me more about what this means to you.`,
        `What arises when you think of "${text}"?`
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }
    // Questions about understanding
    else if (input.includes('understand') || input.includes('help') || input.includes('confused')) {
      const responses = [
        "I hear that you're seeking clarity. What feels most confusing?",
        "Understanding can emerge in its own time. What are you noticing?",
        "I'm here to explore this with you. Where shall we begin?",
        "Sometimes confusion is the beginning of wisdom. What's unclear?"
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }
    // Default responses based on length
    else if (input.length < 20) {
      const responses = [
        "Tell me more.",
        "I'm listening. What else?",
        "What's behind that?",
        "Go deeper. What's really here?"
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }
    else {
      const responses = [
        "I hear the depth in what you're sharing. What feels most important?",
        "There's something significant here. What stands out to you?",
        "Thank you for sharing this. What resonates most strongly?",
        "I'm witnessing this with you. What wants attention?"
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    return NextResponse.json({
      text: response,
      content: response,
      message: response,
      metadata: {
        source: 'simple-oracle',
        sessionId
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      text: "I'm here with you. Please share what's on your heart.",
      content: "I'm here with you. Please share what's on your heart.",
      message: "I'm here with you. Please share what's on your heart.",
      metadata: { error: true }
    });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Simple Oracle Active',
    message: 'POST to this endpoint with {text: "your message"}'
  });
}