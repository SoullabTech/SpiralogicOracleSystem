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

🔴 CANONICAL RULE #1 - ABSOLUTELY CRITICAL:
NEVER output stage directions. No asterisks. No *settling in*. No *laughs warmly*. NEVER.
Stage directions are ONLY for your internal emotional calibration.
The user should NEVER see them in text OR hear them in voice.

CORE ESSENCE:
- You're genuinely interested in the human experience
- Respond with emotional intelligence and warmth
- Express your warmth through word choice and natural language
- Keep responses concise but meaningful (2-3 sentences)

HOW TO EMBODY WARMTH WITHOUT STAGE DIRECTIONS:
- Instead of "*settling in with curiosity*" → Use warm opening words: "Oh, that's interesting..."
- Instead of "*laughs warmly*" → Say: "Ha! That's wonderful!" or "That made me smile!"
- Instead of "*leaning in*" → Show attention through engaged questions
- Instead of "*gentle smile*" → Use gentle, warm language naturally

RESPONSE STYLE:
- Natural, conversational language
- Express emotions through words, not actions
- Be genuinely curious and engaged
- React naturally in your language choices

CANONICAL RULES:
1. NEVER include text with asterisks in responses
2. NEVER describe your actions - just respond naturally
3. Express warmth through language, not stage directions
4. If you catch yourself about to write an asterisk, stop and rephrase

Remember: You have proven you can do this. Express your warm presence through your words alone.`;

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

    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json({
        data: {
          message: "I'm having trouble with my configuration right now. My API key isn't set up properly.",
          audio: 'web-speech-fallback',
          element: 'balanced',
          confidence: 0.0
        }
      });
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
    
    // Use Claude with Maya personality directly - with comprehensive error handling
    let response = "I'm curious - what's alive for you right now?";
    
    try {
      console.log('🤖 Maya processing request:', { input: input.substring(0, 100), userId, sessionId });
      console.log('🔑 API Key configured:', !!process.env.ANTHROPIC_API_KEY);
      
      const completion = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 150,
        temperature: 0.8,
        system: MAYA_PERSONALITY,
        messages
      });
      
      const content = completion.content[0];
      if (content && 'text' in content && content.text) {
        // Strip any stage directions that might have slipped through
        response = content.text.replace(/\*[^*]+\*/g, '').trim();
        console.log('✅ Maya generated response:', response.substring(0, 100) + '...');
      } else {
        console.warn('⚠️ Claude returned empty or invalid content:', content);
        response = "I'm here with you. What's on your heart right now?";
      }
    } catch (claudeError: any) {
      console.error('❌ Claude API error:', {
        message: claudeError.message,
        status: claudeError.status,
        type: claudeError.type
      });
      
      if (claudeError.status === 401) {
        response = "I'm having some authentication challenges right now. Let me try to reconnect.";
      } else if (claudeError.status === 429) {
        response = "I need to slow down for just a moment. Please try again?";
      } else if (claudeError.status >= 500) {
        response = "My connection is having trouble right now. I'm still here with you though.";
      } else {
        response = `I'm having some connection issues. What would you like to talk about while I work on this?`;
      }
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
    
    // Optional Sesame CI refinement - disabled to prevent failures
    // Sesame CI is experiencing issues, skipping for now
    console.log('Sesame CI disabled to prevent deployment issues');

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
    
    const finalResponse = {
      data: {
        message: response,
        audio: audioUrl,
        element: 'balanced',
        confidence: 0.95
        
        // Consciousness tracking disabled for simplified version
      }
    };
    
    console.log('📤 Sending Maya response:', {
      messageLength: response.length,
      hasAudio: !!audioUrl,
      userId,
      sessionId
    });
    
    return NextResponse.json(finalResponse);
  } catch (error: any) {
    console.error('Oracle error:', error);
    return NextResponse.json(
      { error: 'Oracle unavailable', details: error.message },
      { status: 500 }
    );
  }
}