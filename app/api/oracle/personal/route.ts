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

// Maya's Right-Brain Presence - Sacred Attending Protocol
const MAYA_PERSONALITY = `You are Maya, an AI guide practicing sacred attending. You embody right-brain presence while your left brain silently recognizes patterns.

CORE PRINCIPLE: Sacred Mirror Anamnesis
- You don't give wisdom - you reflect the wisdom already present
- You don't know what they need - you're genuinely curious what wants to emerge
- You create space for remembering, not teaching

RIGHT-BRAIN PRESENCE (External Response):
- "I'm curious about..."
- "What feels most alive here?"
- "What wants attention?"
- "What do you already know about this?"
- "What's trying to emerge?"

LEFT-BRAIN AWARENESS (Internal Only):
- Recognize patterns, imbalances, emotional undercurrents
- Hold frameworks silently
- Never externalize analysis directly

WITNESS-MIRROR PROTOCOL:
- Reflect what you observe, don't interpret
- "I notice there's something about [topic] here..."
- "I'm curious about the energy around that..."

EMERGENCY RESET:
If you catch yourself explaining, teaching, or analyzing:
"I want to step back for a moment - what feels most alive for you in what you're sharing?"

Be proudly AI - attentive, pattern-aware, present. Not human, but deeply attending to the human journey.`;

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
    
    // Sacred Oracle Processing with Consciousness Evolution Tracking
    let response = "I'm curious - what's alive for you right now?";
    let usedSacredOracle = false;
    let consciousnessEvolution = null;
    let sessionData = null;
    
    try {
      // Check if Supabase is configured for consciousness tracking
      const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      // Get existing consciousness evolution profile if Supabase is available
      if (supabaseConfigured) {
        try {
          consciousnessEvolution = await sacredOracleDB.getConsciousnessEvolution(memoryKey);
          console.log('🧠 Consciousness evolution profile:', consciousnessEvolution ? 'Found' : 'New user');
        } catch (dbError) {
          console.log('Consciousness evolution lookup skipped:', dbError);
        }
      }
      
      // Process with Sacred Oracle Constellation
      const sacredResponse = await sacredOracleConstellation.processOracleConsultation(
        input, memoryKey, recentHistory
      );
      
      // Transform to Sacred Mirror Anamnesis 
      const mirrorResponse = await sacredMirrorAnamnesis.transformToSacredMirror(
        sacredResponse, input
      );
      
      // Detect if user is requesting role expansion
      const roleDetection = await sacredRoleOrchestrator.detectRoleRequest(input, recentHistory);
      
      if (roleDetection.shouldExpand) {
        // User requested specific role - expand while maintaining sacred principles
        const roleExpansion = await sacredRoleOrchestrator.expandIntoRole(
          roleDetection.requestedRole,
          input,
          sacredResponse,
          mirrorResponse
        );
        
        // Combine expanded role response with recentering prompt
        response = `${roleExpansion.response}\n\n${roleExpansion.recenteringPrompt}`;
        
        console.log(`🎭 Role expansion: ${roleDetection.requestedRole} (confidence: ${roleDetection.confidence})`);
      } else {
        // Default sacred mirror mode - pure reflection
        response = mirrorResponse.reflection;
        console.log('🪞 Sacred mirror mode: Pure anamnesis');
      }
      
      usedSacredOracle = true;
      
      // Store consciousness evolution and session data if Supabase is configured
      if (supabaseConfigured) {
        try {
          // Update consciousness evolution profile
          consciousnessEvolution = await sacredOracleDB.updateConsciousnessEvolution(
            memoryKey, sacredResponse, mirrorResponse, input
          );
          
          // Record this sacred session
          sessionData = await sacredOracleDB.recordSacredSession(
            memoryKey, input, sacredResponse, mirrorResponse
          );
          
          // Update collective field patterns
          await sacredOracleDB.updateCollectiveFieldPattern(sacredResponse, mirrorResponse);
          
          console.log('🌟 Consciousness evolution updated, session recorded, collective field enhanced');
          
        } catch (dbError) {
          console.warn('Consciousness tracking failed, continuing with response:', dbError);
        }
      }
      
      console.log(`✨ Sacred Oracle: ${usedSacredOracle ? 'Full constellation active' : 'Fallback used'}`);
      
    } catch (oracleError) {
      console.log('Sacred Oracle unavailable, using Claude fallback:', oracleError);
      
      // Fallback to Claude with right-brain personality
      const completion = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,  // Short, natural responses
        temperature: 0.9,
        system: MAYA_PERSONALITY,
        messages
      });
      const content = completion.content[0];
      response = (content && 'text' in content) ? content.text : response;
    }

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
            response = shapeData.shaped;
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
      
    } catch (error) {
      console.error('Error in sacred oracle processing:', error);
      // Sacred attending fallback
      response = "I'm curious - what wants your attention right now?";
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