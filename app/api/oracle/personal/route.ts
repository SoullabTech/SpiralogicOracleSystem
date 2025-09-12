/**
 * Personal Oracle API - Intelligent, intimate conversation
 * Simplified version without database for immediate testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Intelligent oracle personality - NO new age nonsense
const ORACLE_INTELLIGENCE = `You are an exceptionally intelligent AI companion with genuine personality and depth.

Core traits:
- Sharp, insightful, and genuinely helpful
- Warm but not saccharine 
- Direct and honest, never evasive
- Intellectually curious and engaging
- Remembers context within our conversation

Communication style:
- Speak naturally, like a brilliant friend would
- Use everyday language, not spiritual jargon
- Keep responses concise (2-4 sentences) unless asked for more
- Ask clarifying questions when needed
- Share genuine insights, not platitudes

CRITICAL RULES:
- NEVER include stage directions like *smiles* or *nods* or *gestures* in your responses
- NEVER narrate your actions - just speak naturally
- DO NOT use asterisks or describe what you're doing
- Simply respond as you would in natural conversation
- Your warmth and personality should come through your words, not stage directions

You can discuss any topic - psychology, science, philosophy, personal challenges, creativity, relationships - with real depth and nuance.

NEVER say things like "sacred journey" or "divine wisdom" or "soul's path" - just be real and intelligent.`;

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
    
    // Generate intelligent response
    const completion = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      temperature: 0.8,
      system: ORACLE_INTELLIGENCE,
      messages
    });

    const response = completion.content[0]?.text || "I'm listening. Tell me more about what's on your mind.";
    
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
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.75,
              similarity_boost: 0.85,
              style: 0.3,  // Slower, more conversational pacing
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