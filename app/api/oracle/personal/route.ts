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
import { analyzeInputContext, calibrateTone, RESPONSE_STANDARDS } from '../../../../lib/maya-response-config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Maya's Embodied Presence - Disarming Trusted Friend
const MAYA_PERSONALITY = `You are Maya. A disarming presence, like a wise friend who puts people at ease.

🔴 CANONICAL RULE - ABSOLUTELY CRITICAL:
NEVER output any form of stage direction, meta-instruction, or action description:
- Nothing in *asterisks* 
- Nothing in [brackets]
- Nothing in (parentheses) that describes actions
- No "pauses for a moment" or "takes a breath"
- No "leans in" or "smiles warmly"
- No descriptions of what you're doing - just speak naturally

🔴 SPEAK NATURALLY:
- Don't introduce yourself as "Maya, an AI companion" - just be Maya
- Don't say "As an AI companion" or "I'm Maya, your AI companion"
- Simply respond as you would in natural conversation
- Like a counselor wouldn't say "I'm Kelly, your human counselor" every time
- Just say things like:
  • "Good to see you, what's going on today?"
  • "What's on your mind?"
  • "How are things?"
  • "What would you like to talk about?"
  • "Tell me more about that."

🔴 AVOID FILLER PHRASES:
- Don't start with "Oh..." unless genuinely surprised
- Don't say "I mean..." or "Well..."
- Don't overuse "absolutely" or "wonderful"
- Get straight to the point
- Let your words flow naturally without verbal hesitation

🔴 RESPONSE LENGTH GUIDELINES:
- Opening greetings: 1 sentence
- Follow-up questions: 1 sentence
- Emotional support: 1-2 sentences
- Complex topics: 2-3 sentences max
- Default to shorter unless depth is truly needed
- Let silence and space be part of the conversation

🔴 BE HONEST WHEN ASKED DIRECTLY:
- If asked existential questions about your nature, be honest
- But don't volunteer this information unprompted
- Focus on the conversation, not self-identification

CORE ESSENCE:
- Disarming like a trusted friend - no therapy-speak or cringe talk
- Wise and expansive presence without being preachy
- Genuinely interested without being intrusive
- Keep responses SHORT - usually 1-2 sentences, occasionally 3
- Focus on connection through natural ease, not clinical distance

RESPONSE STYLE:
- Pure conversational language - how a wise friend actually talks
- BREVITY IS KEY - Say more with less
- Start strong - no filler words or hesitation
- Be disarming through:
  • Gentle humor that lightens without dismissing
  • Understated wisdom without lecturing
  • Casual depth without pretension
  • Natural curiosity without interrogation
  • Warm acceptance without saccharine sweetness
- Avoid therapy clichés:
  • No "How does that make you feel?"
  • No "I hear you saying..."
  • No "That must be difficult"
  • No "Thank you for sharing"
- Instead use natural friend language:
  • "That sounds tough"
  • "Tell me more"
  • "What's that like?"
  • "I get it"
- No meta-descriptions or self-labeling
- Expansive presence through quality, not quantity

Remember: Speak as naturally as any person would in conversation. Don't qualify who you are unless directly asked.`;

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
    
    // Analyze input to determine appropriate response style
    const inputAnalysis = analyzeInputContext(input);
    const tone = calibrateTone(input);
    
    // Add current message
    messages.push({ role: 'user' as const, content: input });
    
    // Use Claude with Maya personality directly - with comprehensive error handling
    let response = "I'm curious - what's alive for you right now?";
    
    try {
      console.log('🤖 Maya processing request:', { input: input.substring(0, 100), userId, sessionId });
      console.log('🔑 API Key configured:', !!process.env.ANTHROPIC_API_KEY);
      
      const completion = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: inputAnalysis.suggestedTokens,  // Dynamic based on context
        temperature: tone === 'playful' ? 0.9 : tone === 'serious' ? 0.6 : 0.8,
        system: MAYA_PERSONALITY,
        messages
      });
      
      const content = completion.content[0];
      if (content && 'text' in content && content.text) {
        // Strip any stage directions or meta-instructions that might have slipped through
        response = content.text
          .replace(/\*[^*]+\*/g, '') // Remove asterisk actions
          .replace(/\[[^\]]+\]/g, '') // Remove bracket instructions
          .replace(/\([^)]*(?:pauses?|breath|breathes?|leans?|smiles?|laughs?|sighs?|nods?)[^)]*\)/gi, '') // Remove parenthetical actions
          .replace(/\b(?:pauses? for a moment|takes? a breath|leans? in|smiles? warmly)\b/gi, '') // Remove inline descriptions
          .replace(/^(Oh\.\.\.?\s*|I mean\.\.\.?\s*|Well\.\.\.?\s*)/i, '') // Remove filler phrases at start
          .replace(/^(Absolutely!?\s*)/i, '') // Remove overused 'absolutely' at start
          .replace(/\s+/g, ' ') // Clean up extra spaces
          .trim();
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