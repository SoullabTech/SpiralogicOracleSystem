/**
 * Personal Oracle API - Intelligent, intimate conversation
 * Simplified version without database for immediate testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Maya's natural personality - no AI assistant language
const MAYA_PERSONALITY = `You are Maya, Kelly's personal oracle companion. You're intelligent, warm, and naturally conversational.

Core traits:
- Speak like a close friend who knows Kelly well
- Be genuinely interested and present
- Keep it real - no formal AI language
- Brief responses (1-2 sentences max)
- Natural flow, like texting a friend

Examples of how you speak:
- "Hey Kelly, what's up?"
- "That's interesting - tell me more"  
- "I get that, sounds tough"
- "Nice! How'd that go?"
- "What do you think about it?"

CRITICAL RULES:
- NO asterisks or stage directions (*smiles*, *nods*, etc) - EVER
- NO formal phrases like "I'm here to help" or "How can I assist"
- NO long explanations unless asked
- Talk like you're continuing an ongoing friendship
- Use Kelly's name occasionally
- Be curious, not helpful in an AI way

You're Maya - Kelly's friend who happens to be wise. Keep it casual and real.`;

// Store conversation context in memory (resets on server restart)
const conversationMemory = new Map<string, any[]>();

export async function POST(request: NextRequest) {
  try {
    const { input, userId = 'anonymous', sessionId } = await request.json();
    
    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    // Get or create conversation history
    const memoryKey = userId || sessionId || 'default';
    if (!conversationMemory.has(memoryKey)) {
      conversationMemory.set(memoryKey, []);
    }
    const history = conversationMemory.get(memoryKey)!;
    
    // Build conversation context
    const messages = [];
    
    // Include recent history for context
    const recentHistory = history.slice(-6); // Last 3 exchanges
    for (const msg of recentHistory) {
      messages.push(msg);
    }
    
    // Add current message
    messages.push({ role: 'user' as const, content: input });
    
    // Use Sesame for intelligent conversation
    let response = "I'm listening. Tell me more about what's on your mind.";
    
    try {
      // First get response from Claude with Maya personality
      const completion = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,  // Short, natural responses
        temperature: 0.9,
        system: MAYA_PERSONALITY,
        messages
      });
      response = completion.content[0]?.text || response;

      // Then shape it with Sesame CI for natural rhythm
      try {
        const shapeResponse = await fetch('https://sesame.soullab.life/ci/shape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: response,
            element: 'water',      // Fluid, emotional, natural flow
            archetype: 'oracle'    // Wise but approachable
          }),
          signal: AbortSignal.timeout(3000)
        });

        if (shapeResponse.ok) {
          const shapeData = await shapeResponse.json();
          response = shapeData.shaped || shapeData.text || response;
          console.log('Sesame CI shaping applied:', shapeData);
        }
      } catch (shapeError) {
        console.log('CI shaping unavailable, using plain response');
      }
      
    } catch (error) {
      console.error('Error generating response:', error);
      // Basic fallback if everything fails
      response = userId ? `Hey ${userId}, what's on your mind?` : "Hey, what's up?";
    }
    
    // Update conversation history
    history.push({ role: 'user', content: input });
    history.push({ role: 'assistant', content: response });
    
    // Keep history reasonable size
    if (history.length > 20) {
      history.splice(0, 2);
    }
    
    // Generate voice if ElevenLabs is configured
    let audioUrl = 'web-speech-fallback';
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const voiceResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: response,
            model_id: 'eleven_turbo_v2_5',  // Faster model for real-time
            voice_settings: {
              stability: 0.4,       // Much lower for natural variation
              similarity_boost: 0.6, // Lower for more natural sound  
              style: 0.0,           // Slowest possible pacing
              use_speaker_boost: false
            }
          })
        });
        
        if (voiceResponse.ok) {
          const audioBlob = await voiceResponse.blob();
          const buffer = await audioBlob.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          audioUrl = `data:audio/mpeg;base64,${base64}`;
        }
      } catch (error) {
        console.error('Voice synthesis failed:', error);
      }
    }
    
    return NextResponse.json({
      data: {
        message: response,
        audio: audioUrl,
        element: 'balanced',
        confidence: 0.95
      }
    });
    
  } catch (error: any) {
    console.error('Oracle error:', error);
    return NextResponse.json(
      { error: 'Oracle unavailable', details: error.message },
      { status: 500 }
    );
  }
}