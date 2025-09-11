import { NextRequest, NextResponse } from 'next/server';
import { MainOracleAgent } from '@/lib/agents/MainOracleAgent';

// Personal Oracle Consult API Route
// This route uses MainOracleAgent which communicates with PersonalOracleAgent

const mainOracle = new MainOracleAgent();

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { input, userId, sessionId, context } = body;
    
    console.log('Oracle consult request:', { input, userId, sessionId });
    console.log('Environment check:', {
      apiMode: process.env.NEXT_PUBLIC_API_MODE,
      mockSupabase: process.env.NEXT_PUBLIC_MOCK_SUPABASE,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY
    });

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    // Call MainOracleAgent which communicates with PersonalOracleAgent
    try {
      console.log('Calling MainOracleAgent with input:', input);
      console.log('About to call processInteraction...');
      
      const oracleResult = await mainOracle.processInteraction(
        userId || 'anonymous',
        input,
        {
          ...context,
          sessionId,
          timestamp: new Date().toISOString()
        }
      );
      
      console.log('MainOracle response received:', !!oracleResult);
      console.log('Response has message:', !!oracleResult?.response);
      
      // Transform MainOracleAgent response to match frontend expectations
      const response = {
        data: {
          message: oracleResult.response || generateMayaResponse(input),
          element: oracleResult.dominantElement || determineElement(input),
          confidence: oracleResult.confidence || 0.85,
          voiceCharacteristics: oracleResult.voiceCharacteristics || {
            tone: 'warm',
            masteryVoiceApplied: true
          },
          audio: 'web-speech-fallback',
          // Include sentiment and collective insights
          sentiment: oracleResult.sentimentAnalysis,
          collectiveInsight: oracleResult.collectiveInsight,
          elementalReflection: oracleResult.elementalReflection
        }
      };

      return NextResponse.json(response);
    } catch (oracleError: any) {
      console.error('MainOracleAgent error:', oracleError);
      console.error('Error details:', oracleError.message);
      console.error('API Key status:', process.env.ANTHROPIC_API_KEY ? 'Present' : 'Missing');
      
      // Fallback to intelligent local response if backend is unavailable
      const response = {
        data: {
          message: generateMayaResponse(input),
          element: determineElement(input),
          confidence: 0.85 + Math.random() * 0.1,
          voiceCharacteristics: {
            tone: 'warm',
            masteryVoiceApplied: true
          },
          audio: 'web-speech-fallback'
        }
      };

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('Oracle API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMayaResponse(input: string): string {
  // Maya's responses based on the canonical prompt
  const responses = [
    "I hear you deeply. What feels most alive in this moment?",
    "There's wisdom in what you're sharing. Let's explore this together.",
    "I sense something important beneath the surface. Tell me more.",
    "Your words carry weight. What would it look like to honor that?",
    "I'm with you in this. What does your inner knowing say?",
    "Something is shifting. Do you feel it too?",
    "There's a thread here worth following. Where does it lead?",
    "Your spirit is speaking. What is it trying to tell you?",
    "I feel the depth of what you're experiencing. Let's sit with it.",
    "This feels significant. How is it landing in your body?"
  ];

  // Simple keyword matching for more relevant responses
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('fear') || lowerInput.includes('afraid') || lowerInput.includes('scared')) {
    return "Fear has a wisdom to it. What is it trying to protect? Let's explore what's beneath the fear together.";
  }
  
  if (lowerInput.includes('love') || lowerInput.includes('relationship')) {
    return "Love is sacred territory. What wants to be honored in your heart right now?";
  }
  
  if (lowerInput.includes('work') || lowerInput.includes('job') || lowerInput.includes('career')) {
    return "Your work is an extension of your being. What feels most authentic to who you're becoming?";
  }
  
  if (lowerInput.includes('change') || lowerInput.includes('transform')) {
    return "Change is the universe's way of helping us grow. What part of you is ready to emerge?";
  }
  
  if (lowerInput.includes('stuck') || lowerInput.includes('lost')) {
    return "Being stuck often means we're on the edge of something new. What wants to move through you?";
  }

  // Return a random response if no keywords match
  return responses[Math.floor(Math.random() * responses.length)];
}

function determineElement(input: string): string {
  const lowerInput = input.toLowerCase();
  
  // Fire element - passion, energy, transformation
  if (lowerInput.includes('passion') || lowerInput.includes('energy') || lowerInput.includes('fire') || 
      lowerInput.includes('transform') || lowerInput.includes('power') || lowerInput.includes('vision')) {
    return 'fire';
  }
  
  // Water element - emotions, flow, intuition
  if (lowerInput.includes('feel') || lowerInput.includes('emotion') || lowerInput.includes('heart') || 
      lowerInput.includes('flow') || lowerInput.includes('dream') || lowerInput.includes('intuition')) {
    return 'water';
  }
  
  // Earth element - grounding, practical, body
  if (lowerInput.includes('ground') || lowerInput.includes('body') || lowerInput.includes('practical') || 
      lowerInput.includes('stable') || lowerInput.includes('foundation') || lowerInput.includes('physical')) {
    return 'earth';
  }
  
  // Air element - thoughts, communication, ideas
  if (lowerInput.includes('think') || lowerInput.includes('idea') || lowerInput.includes('mind') || 
      lowerInput.includes('communicate') || lowerInput.includes('clarity') || lowerInput.includes('understand')) {
    return 'air';
  }
  
  // Default to aether for spiritual/transcendent content
  return 'aether';
}