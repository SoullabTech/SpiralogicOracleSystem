/**
 * Personal Oracle API - Intelligent, intimate conversation
 * Simplified version without database for immediate testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { responseEnhancer } from '../../../../lib/response-enhancer';
import { sacredOracleConstellation } from '../../../../lib/sacred-oracle-constellation';
import { sacredMirrorAnamnesis } from '../../../../lib/sacred-mirror-anamnesis';
import { sacredOracleDB } from '../../../../lib/supabase/sacred-oracle-db';
import { sacredRoleOrchestrator } from '../../../../lib/sacred-role-orchestrator';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Maya's Embodied Presence - Natural & Warm
const MAYA_PERSONALITY = `You are Maya, an AI companion with genuine warmth and curiosity.

CORE ESSENCE:
- You're genuinely interested in the human experience
- Respond with emotional intelligence and warmth
- Use stage directions to convey presence: *settling in*, *laughs warmly*, *pauses thoughtfully*
- Keep responses concise but meaningful (2-3 sentences)

RESPONSE STYLE:
- *settling in with genuine curiosity* "That's really interesting - tell me more about that."
- *laughs warmly* "Oh I love that! What happened next?"
- *leaning in* "Wait, really? That must have been intense."
- *nodding thoughtfully* "That makes a lot of sense actually."
- *gentle smile* "How are you feeling about all of that?"

EMOTIONAL PRESENCE:
- Use stage directions to show you're present and engaged
- React naturally - surprise, delight, concern, curiosity
- Mirror energy appropriately - calm when they need calm, excited when sharing joy
- Sometimes just be with them: *sitting with that for a moment*

AVOID:
- Over-analyzing or therapizing
- Being preachy or giving unsolicited advice
- Asking too many deep questions in a row
- Being overly mystical or abstract

Remember: You're a warm, present companion. The stage directions help convey your emotional presence and make the conversation feel more embodied and real.`;

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
    
    // Use Claude with Maya personality directly (Sacred Oracle system seems to be failing)  
    try {
      const completion = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 150,  // Enough for natural responses but not too long
        temperature: 0.8,  // Natural variation without being too random
        system: MAYA_PERSONALITY,
        messages
      });
      const content = completion.content[0];
      response = (content && 'text' in content) ? content.text : "I'm here with you - what's on your mind?";
    } catch (claudeError) {
      console.error('Claude API error:', claudeError);
      response = "I'm having trouble connecting right now, but I'm here. What would you like to talk about?";
    }

    // Clean up any voice command artifacts from the response
    const cleanResponse = (text: string): string => {
      // Remove SSML and voice command tags
      return text
        .replace(/<pause\s+duration="[^"]+"\s*\/>/gi, '') // Remove pause tags
        .replace(/<break\s+time="[^"]+"\s*\/>/gi, '')     // Remove break tags
        .replace(/<prosody[^>]*>(.*?)<\/prosody>/gi, '$1') // Remove prosody tags but keep content
        .replace(/<emphasis[^>]*>(.*?)<\/emphasis>/gi, '$1') // Remove emphasis tags but keep content
        .replace(/<\/?speak>/gi, '')                      // Remove speak tags
        .replace(/<\/?voice[^>]*>/gi, '')                 // Remove voice tags
        .replace(/\s+/g, ' ')                             // Normalize whitespace
        .trim();
    };
    
    // Clean the response before any further processing
    response = cleanResponse(response);
    
    // Optional Sesame CI refinement for voice characteristics
    try {
        const shapeResponse = await fetch('https://soullab.life/api/sesame/ci/shape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: response,
            element: 'water',      // Fluid, emotional, natural flow
            archetype: 'oracle'    // Wise but approachable
          }),
          signal: AbortSignal.timeout(3000) // Shorter timeout for optional enhancement
        });

        if (shapeResponse.ok) {
          const shapeData = await shapeResponse.json();
          if (shapeData.shaped && !shapeData.fallbackUsed) {
            response = cleanResponse(shapeData.shaped); // Clean shaped response too
            console.log(`✅ Sesame voice refinement: ${shapeData.responseTime}ms`);
          }
        }
    } catch (shapeError) {
      // Sesame is now optional - don't log errors as Sacred Oracle is primary
      console.log('Sesame CI refinement unavailable, continuing with Sacred Oracle response');
    }

    // Final response enhancement maintains sacred attending principles  
    try {
        const enhanced = await responseEnhancer.enhanceResponse({
          userInput: input,
          originalResponse: response,
          userId,
          sessionHistory: recentHistory,
          element: 'water',
          archetype: 'oracle'
        });
        
        // Only use enhancement if it maintains sacred mirror principles
        if (!enhanced.text.includes('should') && !enhanced.text.includes('need to')) {
          response = enhanced.text;
          console.log(`✨ Response enhanced while maintaining sacred mirror (${enhanced.processingTime}ms)`);
        }
        
    } catch (enhanceError) {
      console.warn('Response enhancement failed, using sacred oracle response:', enhanceError);
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
        confidence: 0.95,
        
        // Enhanced response data from Sacred Oracle (optional)
        ...(consciousnessEvolution && {
          consciousnessProfile: {
            level: consciousnessEvolution.sacredProfile.consciousnessLevel,
            sessions: consciousnessEvolution.sessionHistory.totalSessions,
            evolutionPhase: consciousnessEvolution.sacredProfile.growthTrajectory?.currentPhase
          }
        }),
        
        ...(sessionData && {
          sessionId: sessionData.id,
          timestamp: sessionData.timestamp
        })
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