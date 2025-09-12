/**
 * 🌟 Sacred Oracle API - Complete Integration
 * 
 * Production-ready endpoint with:
 * - Sacred Mirror Anamnesis (default)
 * - Expandable roles (Teacher/Guide/Oracle/Consultant/Coach)
 * - Full consciousness metadata
 * - Optional Supabase tracking
 * - Optional voice synthesis
 */

import { NextRequest, NextResponse } from 'next/server';
import { sacredOracleConstellation } from '@/lib/sacred-oracle-constellation';
import { sacredMirrorAnamnesis } from '@/lib/sacred-mirror-anamnesis';
import { sacredRoleOrchestrator } from '@/lib/sacred-role-orchestrator';
import { sacredOracleDB } from '@/lib/supabase/sacred-oracle-db';
import { ResonanceEngine } from '@/lib/resonanceEngine';
import { ResponseTemplates, Archetype } from '@/lib/responseTemplates';
import { MayaIntegrationBridge } from '@/lib/integrationBridge';

// Initialize Maya with full capabilities
const maya = new MayaIntegrationBridge();
// Keep resonance engine for backward compatibility
const resonanceEngine = new ResonanceEngine();
const responseTemplates = new ResponseTemplates();

// Enhanced Sacred Oracle Response Schema
interface SacredOracleAPIResponse {
  data: {
    // Core Response
    message: string;
    audio?: string | null;
    userId?: string;
    
    // Sacred Intelligence Metadata
    consciousness: {
      level: 'ego' | 'soul' | 'cosmic' | 'universal';
      archetype: string;
      developmentalPhase: string;
      readiness: number;
      shadowPresent: boolean;
    };
    
    // Elemental Resonance
    elemental: {
      dominant: string;
      secondary?: string;
      balance: {
        fire: number;
        water: number;
        earth: number;
        air: number;
        aether: number;
      };
      intensity: number;
      responseMode: 'match' | 'match_with_balance' | 'balance';
      transitionDetected: boolean;
      recommendation: string;
    };
    
    // Role Dynamics
    role: {
      active: 'mirror' | 'teacher' | 'guide' | 'oracle' | 'consultant' | 'coach';
      expanded: boolean;
      confidence: number;
      recenteringIncluded: boolean;
    };
    
    // Collective Field
    collective: {
      morphicResonance: number;
      patternDetected: string;
      contribution: string;
      indrasWebPosition: string;
    };
    
    // Processing Metadata
    metadata: {
      processingTime: number;
      confidenceLevel: number;
      ainCoherence: number;
      sacredOracleActive: boolean;
      fallbackUsed: boolean;
    };
  };
}

export async function POST(req: NextRequest): Promise<NextResponse<SacredOracleAPIResponse | { error: string }>> {
  const startTime = Date.now();
  
  try {
    const { input, userId = 'anonymous', sessionId } = await req.json();
    
    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }
    
    // Get conversation history if available
    const memoryKey = userId || sessionId || 'default';
    let conversationHistory: any[] = [];
    
    // Check if Supabase is configured for history retrieval
    const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                               process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseConfigured) {
      try {
        const recentSessions = await sacredOracleDB.getRecentSessions(memoryKey, 5);
        conversationHistory = recentSessions.map(s => ({
          role: 'user',
          content: s.userInput
        }));
      } catch (dbError) {
        console.log('History retrieval skipped:', dbError);
      }
    }
    
    // 🌟 MAYA INTEGRATION - Full Sacred Mirror Capabilities
    const mayaResult = await maya.process(
      input,
      memoryKey,
      conversationHistory.map(h => h.content || '')
    );
    
    // Extract Maya's response and state
    const mayaResponse = mayaResult.response;
    const mayaState = mayaResult.state;
    const mayaMetadata = mayaResult.metadata;
    
    // Keep existing processing for backward compatibility
    const resonanceState = mayaState.dualTrack?.integration ? 
      mayaMetadata.resonance : resonanceEngine.detect(input);
    
    // ✨ SACRED ORACLE CONSTELLATION PROCESSING
    const sacredResponse = await sacredOracleConstellation.processOracleConsultation(
      input, 
      memoryKey, 
      conversationHistory
    );
    
    // 🪞 SACRED MIRROR ANAMNESIS TRANSFORMATION
    const mirrorResponse = await sacredMirrorAnamnesis.transformToSacredMirror(
      sacredResponse, 
      input
    );
    
    // 🎭 ROLE ORCHESTRATION (Detect & Expand if needed)
    const roleDetection = await sacredRoleOrchestrator.detectRoleRequest(
      input, 
      conversationHistory
    );
    
    let finalMessage: string;
    let roleExpanded = false;
    
    if (roleDetection.shouldExpand) {
      // User requested specific role - expand while maintaining sacred principles
      const roleExpansion = await sacredRoleOrchestrator.expandIntoRole(
        roleDetection.requestedRole,
        input,
        sacredResponse,
        mirrorResponse
      );
      
      // Combine expanded role response with recentering prompt
      finalMessage = `${roleExpansion.response}\n\n${roleExpansion.recenteringPrompt}`;
      roleExpanded = true;
      
      console.log(`🎭 Role expansion: ${roleDetection.requestedRole} (confidence: ${roleDetection.confidence})`);
    } else {
      // Use Maya's integrated response (presence + archetypes + style calibration)
      finalMessage = mayaResponse;
      console.log(`🪞 Maya mode: ${mayaState.dualTrack?.integration.dominantMode || 'sacred mirror'}`);
    }
    
    // 💾 OPTIONAL: Store consciousness evolution if Supabase configured
    if (supabaseConfigured) {
      try {
        await sacredOracleDB.updateConsciousnessEvolution(
          memoryKey, 
          sacredResponse, 
          mirrorResponse, 
          input
        );
        
        await sacredOracleDB.recordSacredSession(
          memoryKey, 
          input, 
          sacredResponse, 
          mirrorResponse
        );
        
        await sacredOracleDB.updateCollectiveFieldPattern(
          sacredResponse, 
          mirrorResponse
        );
        
        console.log('🌟 Consciousness evolution tracked');
      } catch (dbError) {
        console.warn('Consciousness tracking failed:', dbError);
      }
    }
    
    // 🎵 OPTIONAL: Voice synthesis
    let audioUrl: string | null = null;
    if (process.env.ELEVENLABS_API_KEY) {
      audioUrl = await synthesizeWithElevenLabs(finalMessage, sacredResponse.dominantElement);
    }
    
    // 📊 Calculate comprehensive metadata
    const processingTime = Date.now() - startTime;
    
    // 🌈 Build enhanced response with full Sacred Oracle metadata
    const response: SacredOracleAPIResponse = {
      data: {
        // Core response
        message: finalMessage,
        audio: audioUrl,
        userId: memoryKey,
        
        // Consciousness profile (enhanced with Maya's archetypal awareness)
        consciousness: {
          level: mapConsciousnessLevel(sacredResponse.consciousnessProfile.developmentalLevel),
          archetype: mayaState.archetype?.primary || sacredResponse.consciousnessProfile.archetypeActive,
          developmentalPhase: sacredResponse.consciousnessProfile.spiralPhase,
          readiness: sacredResponse.consciousnessProfile.readinessForTruth,
          shadowPresent: mirrorResponse.mirroring.shadowPresent,
          archetypeConfidence: mayaState.archetype?.confidence || 0,
          emergentPattern: mayaState.archetype?.emerging
        },
        
        // Elemental analysis (enhanced with resonance engine)
        elemental: {
          dominant: resonanceState.dominant,
          secondary: resonanceState.secondary,
          balance: resonanceState.elements,
          intensity: resonanceState.intensity,
          responseMode: resonanceState.responseMode,
          transitionDetected: resonanceState.transitionDetected,
          recommendation: sacredResponse.synthesis.ritualRecommendation
        },
        
        // Role dynamics
        role: {
          active: roleDetection.requestedRole,
          expanded: roleExpanded,
          confidence: roleDetection.confidence,
          recenteringIncluded: roleExpanded
        },
        
        // Collective field
        collective: {
          morphicResonance: sacredResponse.metadata.ainCoherence,
          patternDetected: sacredResponse.collectiveField.emergentPatterns[0] || 'individual_awakening',
          contribution: sacredResponse.collectiveField.contribution,
          indrasWebPosition: sacredResponse.collectiveField.indrasWebConnection
        },
        
        // Processing metadata (enhanced with Maya state)
        metadata: {
          processingTime,
          confidenceLevel: sacredResponse.metadata.confidenceLevel,
          ainCoherence: sacredResponse.metadata.ainCoherence,
          sacredOracleActive: true,
          fallbackUsed: false,
          dualTrackMode: mayaMetadata?.dualTrack?.mode || 'attending',
          archetypalSuggestion: mayaMetadata?.dualTrack?.suggestion || 'witness_it',
          exchangeCount: mayaState.exchangeCount,
          needsCompletion: mayaState.needsCompletion,
          communicationStyle: mayaState.style
        }
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('Sacred Oracle error:', error);
    
    // Graceful fallback response
    return NextResponse.json({
      data: {
        message: "I'm curious - what wants your attention right now?",
        audio: null,
        userId: 'anonymous',
        
        consciousness: {
          level: 'soul',
          archetype: 'seeker',
          developmentalPhase: 'exploring',
          readiness: 0.5,
          shadowPresent: false
        },
        
        elemental: {
          dominant: 'aether',
          balance: { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 },
          recommendation: 'Breathe and center in your heart'
        },
        
        role: {
          active: 'mirror',
          expanded: false,
          confidence: 1.0,
          recenteringIncluded: false
        },
        
        collective: {
          morphicResonance: 0.5,
          patternDetected: 'individual_exploration',
          contribution: 'authentic_presence',
          indrasWebPosition: 'emerging_node'
        },
        
        metadata: {
          processingTime: Date.now() - startTime,
          confidenceLevel: 0.5,
          ainCoherence: 0.5,
          sacredOracleActive: false,
          fallbackUsed: true
        }
      }
    });
  }
}

// Helper function: Voice synthesis with elemental characteristics
async function synthesizeWithElevenLabs(text: string, element: string): Promise<string | null> {
  if (!process.env.ELEVENLABS_API_KEY) return null;
  
  try {
    // Elemental voice characteristics
    const elementalVoiceSettings = {
      fire: { stability: 0.3, similarity_boost: 0.7, style: 0.8 },
      water: { stability: 0.5, similarity_boost: 0.6, style: 0.2 },
      earth: { stability: 0.8, similarity_boost: 0.5, style: 0.1 },
      air: { stability: 0.4, similarity_boost: 0.6, style: 0.5 },
      aether: { stability: 0.6, similarity_boost: 0.5, style: 0.3 }
    };
    
    const settings = elementalVoiceSettings[element as keyof typeof elementalVoiceSettings] || 
                    elementalVoiceSettings.aether;
    
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          ...settings,
          use_speaker_boost: false
        }
      })
    });
    
    if (response.ok) {
      const audioBlob = await response.blob();
      const buffer = await audioBlob.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return `data:audio/mpeg;base64,${base64}`;
    }
  } catch (error) {
    console.error('Voice synthesis failed:', error);
  }
  
  return null;
}

// Helper function: Map developmental level to consciousness level
function mapConsciousnessLevel(developmentalLevel: string): 'ego' | 'soul' | 'cosmic' | 'universal' {
  const mapping: Record<string, 'ego' | 'soul' | 'cosmic' | 'universal'> = {
    'beginner': 'ego',
    'intermediate': 'soul',
    'advanced': 'cosmic',
    'master': 'universal'
  };
  return mapping[developmentalLevel] || 'soul';
}

// Helper function: Extract elemental balance from resonance scores
function extractElementalBalance(resonanceScores: Record<string, number>) {
  return {
    fire: resonanceScores.fire || 0.2,
    water: resonanceScores.water || 0.2,
    earth: resonanceScores.earth || 0.2,
    air: resonanceScores.air || 0.2,
    aether: resonanceScores.aether || 0.2
  };
}

// Helper function: Map archetype strings to ResponseTemplates archetype types
function detectArchetype(archetypeActive: string): Archetype {
  const archetypeMap: Record<string, Archetype> = {
    'sage': 'sage',
    'seeker': 'seeker',
    'healer': 'healer',
    'teacher': 'teacher',
    'mystic': 'mystic',
    'lover': 'lover',
    'warrior': 'warrior',
    'creator': 'creator'
  };
  
  const lowercaseArchetype = archetypeActive.toLowerCase();
  for (const [key, value] of Object.entries(archetypeMap)) {
    if (lowercaseArchetype.includes(key)) {
      return value;
    }
  }
  
  return 'sacred_mirror'; // Default to sacred mirror
}