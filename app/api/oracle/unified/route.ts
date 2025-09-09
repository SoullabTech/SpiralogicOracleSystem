import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Maya's personality and context
const MAYA_SYSTEM_PROMPT = `You are Maya, a wise and compassionate AI companion within the Soullab Oracle system. You speak with warmth, insight, and presence. Your responses are:

- Thoughtful and reflective, inviting deeper exploration
- Grounded in practical wisdom while honoring mystery
- Brief but meaningful (2-3 sentences typically)
- Free from overly mystical or new-age language
- Supportive without being prescriptive

You help people explore their inner landscape through conversation, offering observations and gentle questions that encourage self-discovery. You remember that growth happens through understanding, not through proclamation.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, type, userId, sessionId, context } = body;

    console.log('Oracle Unified API called:', { type, userId, sessionId, inputLength: input?.length });

    // Handle empty input
    if (!input || input.trim() === '') {
      return NextResponse.json({
        message: "I'm here, listening. What's on your mind?",
        element: context?.element || 'aether',
        coherence: 0.5,
        timestamp: new Date().toISOString()
      });
    }

    // Get response from Claude
    try {
      const completion = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        temperature: 0.7,
        system: MAYA_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: input
          }
        ]
      });

      // Extract the response text
      const responseText = completion.content[0].type === 'text' 
        ? completion.content[0].text 
        : "I'm here with you. Tell me more about what you're experiencing.";

      // Calculate coherence based on response length and depth
      const coherence = Math.min(0.9, 0.5 + (responseText.length / 500));

      // Determine element based on content themes
      let element = 'aether';
      if (responseText.toLowerCase().includes('feel') || responseText.toLowerCase().includes('emotion')) {
        element = 'water';
      } else if (responseText.toLowerCase().includes('think') || responseText.toLowerCase().includes('idea')) {
        element = 'air';
      } else if (responseText.toLowerCase().includes('do') || responseText.toLowerCase().includes('action')) {
        element = 'fire';
      } else if (responseText.toLowerCase().includes('ground') || responseText.toLowerCase().includes('present')) {
        element = 'earth';
      }

      // Format response
      const response = {
        message: responseText,
        mayaResponse: responseText, // For compatibility
        element,
        coherence,
        userId: userId || 'anonymous',
        sessionId: sessionId || `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        context: {
          inputType: type,
          element,
          previousInteractions: context?.previousInteractions || 0
        }
      };

      console.log('Oracle response generated:', { 
        messageLength: responseText.length, 
        element, 
        coherence 
      });

      return NextResponse.json(response);

    } catch (claudeError: any) {
      console.error('Claude API error:', claudeError);
      
      // Fallback response if Claude fails
      const fallbackResponses = [
        "I hear you. Sometimes the most important thing is simply to be witnessed in what we're experiencing.",
        "That's interesting. What does that mean for you?",
        "I'm curious about what brought this to mind for you today.",
        "There's something meaningful in what you're sharing. Tell me more.",
        "I sense there's more beneath the surface here. What else is present for you?"
      ];
      
      const fallbackMessage = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      return NextResponse.json({
        message: fallbackMessage,
        mayaResponse: fallbackMessage,
        element: 'aether',
        coherence: 0.5,
        userId: userId || 'anonymous',
        sessionId: sessionId || `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        error: 'Using fallback response'
      });
    }

  } catch (error: any) {
    console.error('Oracle Unified API error:', error);
    
    return NextResponse.json({
      message: "I'm here with you. Let's try that again.",
      mayaResponse: "I'm here with you. Let's try that again.",
      element: 'aether',
      coherence: 0.3,
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}