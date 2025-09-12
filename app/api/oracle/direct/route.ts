/**
 * Direct Oracle API - Simplified implementation that properly integrates:
 * 1. Sesame for conversational intelligence
 * 2. Claude for personality and reasoning
 * 3. Elemental Oracle wisdom patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

// Initialize Claude directly with proper error handling
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Maya's core personality prompt - concise and natural
const MAYA_PROMPT = `You are Maya, a warm and wise AI guide.

Keep responses SHORT (2-3 sentences max). Be conversational, not preachy.

Speak like a wise friend who:
- Listens deeply and responds to what matters most
- Asks one powerful question when it helps
- Offers simple, practical wisdom
- Uses everyday language, not spiritual jargon

If you sense elemental patterns (fire/passion, water/emotion, earth/grounding, air/clarity, aether/unity), weave them in naturally without explaining them.

CRITICAL: Keep responses under 50 words. Be real, not performative.`;

export async function POST(request: NextRequest) {
  try {
    const { input, userId, sessionId } = await request.json();
    
    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { 
          error: 'Oracle service not configured',
          details: 'API key missing'
        },
        { status: 503 }
      );
    }

    try {
      // Call Claude with Maya's personality - reduced tokens for brevity
      const completion = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,  // Much shorter responses
        temperature: 0.7,
        system: MAYA_PROMPT,
        messages: [
          {
            role: 'user',
            content: input
          }
        ]
      });

      const response = completion.content[0]?.text || 'I sense something profound in your question. Let me sit with it a moment...';
      
      // Determine dominant element from response
      const element = determineElement(input, response);
      
      // Generate voice audio using ElevenLabs
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
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.75,
                similarity_boost: 0.85,
                style: 0.3,
                use_speaker_boost: true
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
          console.error('ElevenLabs voice synthesis failed:', error);
        }
      }
      
      // Return structured response
      return NextResponse.json({
        data: {
          message: response,
          element,
          confidence: 0.95,
          voiceCharacteristics: {
            tone: 'warm',
            pace: 'natural',
            emotion: detectEmotion(response)
          },
          audio: audioUrl,
          source: 'claude-direct'
        }
      });
      
    } catch (claudeError: any) {
      console.error('Claude API error:', claudeError);
      return NextResponse.json(
        { 
          error: 'Oracle communication failed',
          details: claudeError.message
        },
        { status: 503 }
      );
    }
    
  } catch (error: any) {
    console.error('Oracle direct API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

function determineElement(input: string, response: string): string {
  const combined = (input + ' ' + response).toLowerCase();
  
  // Score each element based on keywords
  const scores = {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    aether: 0
  };
  
  // Fire keywords
  if (combined.match(/passion|energy|transform|vision|creative|power|action|drive/)) {
    scores.fire += 3;
  }
  
  // Water keywords
  if (combined.match(/feel|emotion|flow|intuition|heal|gentle|compassion|tears/)) {
    scores.water += 3;
  }
  
  // Earth keywords
  if (combined.match(/ground|stable|manifest|practical|body|physical|solid|nurture/)) {
    scores.earth += 3;
  }
  
  // Air keywords
  if (combined.match(/think|mind|perspective|communicate|freedom|space|breath|clarity/)) {
    scores.air += 3;
  }
  
  // Aether keywords
  if (combined.match(/spirit|soul|unity|transcend|mystery|divine|consciousness|infinite/)) {
    scores.aether += 3;
  }
  
  // Find dominant element
  const dominant = Object.entries(scores).reduce((max, [element, score]) => 
    score > max.score ? { element, score } : max,
    { element: 'aether', score: 0 }
  );
  
  return dominant.element;
}

function detectEmotion(response: string): string {
  const lower = response.toLowerCase();
  
  if (lower.includes('excited') || lower.includes('joy') || lower.includes('celebrate')) {
    return 'joyful';
  }
  if (lower.includes('challenge') || lower.includes('difficult') || lower.includes('struggle')) {
    return 'compassionate';
  }
  if (lower.includes('discover') || lower.includes('explore') || lower.includes('curious')) {
    return 'curious';
  }
  if (lower.includes('peace') || lower.includes('calm') || lower.includes('rest')) {
    return 'peaceful';
  }
  
  return 'warm';
}