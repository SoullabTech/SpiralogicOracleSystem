// Complete Sacred Oracle API - All Sophisticated Features
// Priority: Transformative conversational flow over speed optimization

import { NextRequest, NextResponse } from 'next/server';
import { getCompleteSacredOracle, CompleteSacredOracle } from '@/lib/complete-sacred-oracle';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const {
      input,
      userId,
      sessionId,
      agentName = 'maya',
      // Sophisticated feature controls
      experienceLevel = 'deep', // 'gentle', 'deep', 'mystical'
      enableAllFeatures = true,
      depthPreference = 0.7,
      contemplativeMode = true,
      neurodivergentSupport = false,
      // Advanced options
      customElementalFocus,
      consciousnessPhaseOverride,
      loopingEnabled = true
    } = await request.json();

    if (!input?.trim()) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    console.log(`🌟 Complete Sacred Oracle request: ${agentName} | ${experienceLevel} | ${input.slice(0, 50)}...`);

    // Get conversation history (can be more extensive for deep processing)
    const history = request.headers.get('x-conversation-history')
      ? JSON.parse(request.headers.get('x-conversation-history') || '[]')
      : [];

    // Apply experience level configuration
    const experienceConfig = CompleteSacredOracle.getConfigForExperience(experienceLevel);

    // Generate complete sophisticated response
    const result = await getCompleteSacredOracle().generateCompleteSacredResponse({
      input,
      userId: userId || 'anonymous',
      sessionId: sessionId || 'default',
      agentName,
      history: history.slice(-10), // Keep more history for sophisticated processing
      // Merge custom settings with experience level
      enableAllFeatures: enableAllFeatures ?? experienceConfig.enableAllFeatures,
      depthPreference: depthPreference ?? experienceConfig.depthPreference,
      contemplativeMode: contemplativeMode ?? experienceConfig.contemplativeMode,
      neurodivergentSupport: neurodivergentSupport ?? experienceConfig.neurodivergentSupport
    });

    const totalTime = Date.now() - startTime;

    console.log(`✨ Complete Sacred Oracle response: ${totalTime}ms total`);
    console.log(`🎭 Features activated: ${result.metadata.featuresActivated.join(', ')}`);
    console.log(`🌊 Flow quality: ${Math.round(result.metadata.flowQuality * 100)}%`);
    console.log(`🧠 Depth achieved: ${Math.round(result.metadata.depthAchieved * 100)}%`);
    console.log(`🌟 Consciousness expansion: ${result.metadata.consciousnessExpansion ? 'YES' : 'no'}`);

    // Rich response with all sophisticated data
    return NextResponse.json({
      response: result.text,
      audioUrl: result.audioUrl,

      // Sophisticated features data
      sophisticatedFeatures: {
        loopingState: result.loopingState ? {
          state: result.loopingState.state,
          loopCount: result.loopingState.loopCount,
          convergence: Math.round(result.loopingState.convergence * 100),
          essential: result.loopingState.depthInference.essential
        } : null,

        elementalAttunement: result.elementalAttunement ? {
          element: result.elementalAttunement.element,
          intensity: Math.round(result.elementalAttunement.intensity * 100),
          energyPattern: result.elementalAttunement.energyPattern,
          keywords: result.elementalAttunement.keywords.slice(0, 3) // Limit for response size
        } : null,

        consciousnessInsights: result.consciousnessInsights ? {
          developmentalPhase: result.consciousnessInsights.developmentalPhase,
          readinessForDepth: Math.round(result.consciousnessInsights.readinessForDepth * 100),
          comprehensionStyle: result.consciousnessInsights.comprehensionStyle,
          primaryArchetype: result.consciousnessInsights.archetypalPatterns[0]?.primary
        } : null,

        contemplativeGuidance: result.contemplativeGuidance ? {
          breathingCue: result.contemplativeGuidance.breathingCue,
          sacredPause: result.contemplativeGuidance.sacredPause,
          depthSlider: Math.round(result.contemplativeGuidance.depthSlider * 100),
          ambientResonance: result.contemplativeGuidance.ambientResonance
        } : null,

        neurodivergentAdaptations: result.neurodivergentAdaptations ? {
          processingStyle: result.neurodivergentAdaptations.processingStyle,
          attentionPattern: result.neurodivergentAdaptations.attentionPattern,
          adaptations: result.neurodivergentAdaptations.communicationAdaptations
        } : null,

        morphicResonance: result.morphicResonance || []
      },

      // Flow and depth metrics
      conversationalFlow: {
        flowQuality: Math.round(result.metadata.flowQuality * 100),
        depthAchieved: Math.round(result.metadata.depthAchieved * 100),
        consciousnessExpansion: result.metadata.consciousnessExpansion,
        naturalness: result.metadata.flowQuality > 0.8 ? 'high' : result.metadata.flowQuality > 0.6 ? 'moderate' : 'developing'
      },

      // Standard metadata
      metadata: {
        agent: agentName,
        experienceLevel,
        featuresActivated: result.metadata.featuresActivated,
        processingTime: result.metadata.processingTime,
        totalTime,
        sophisticatedFeatures: result.metadata.featuresActivated.length,
        witness_mode: true,
        flow_priority: true
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('❌ Complete Sacred Oracle error:', error);

    // Sophisticated graceful fallback
    const fallbackPersonalities = {
      maya: "Hmm, I'm sensing something deeper here, but I'm having trouble accessing it fully right now. What feels most important for you in this moment?",
      anthony: "I hear you, and I want to be fully present with what you're sharing. Something's not quite connecting on my end - can you help me understand better?"
    };

    return NextResponse.json({
      response: fallbackPersonalities[agentName as keyof typeof fallbackPersonalities] || fallbackPersonalities.maya,
      audioUrl: null,
      sophisticatedFeatures: {
        // Null values for all sophisticated features
        loopingState: null,
        elementalAttunement: null,
        consciousnessInsights: null,
        contemplativeGuidance: null,
        neurodivergentAdaptations: null,
        morphicResonance: []
      },
      conversationalFlow: {
        flowQuality: 60, // Maintain reasonable flow even in fallback
        depthAchieved: 30,
        consciousnessExpansion: false,
        naturalness: 'fallback'
      },
      metadata: {
        agent: agentName,
        experienceLevel: 'gentle',
        featuresActivated: ['graceful_fallback'],
        processingTime: totalTime,
        totalTime,
        sophisticatedFeatures: 0,
        error: true,
        witness_mode: true,
        flow_priority: true
      }
    });
  }
}

// Health check with sophisticated feature status
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    service: 'complete-sacred-oracle',
    philosophy: 'flow_over_speed',
    experienceLevels: ['gentle', 'deep', 'mystical'],
    sophisticatedFeatures: [
      '4_step_looping_protocol',
      'elemental_attunement_full',
      'consciousness_profiling_detailed',
      'contemplative_space_design',
      'neurodivergent_accessibility',
      'morphic_field_resonance',
      'archetypal_pattern_recognition',
      'sacred_pause_mechanisms',
      'breathing_interface_integration',
      'depth_slider_controls'
    ],
    performanceTargets: {
      gentle: '1-2s (fewer features)',
      deep: '2-4s (full sophistication)',
      mystical: '3-6s (maximum depth)',
      priority: 'conversational_flow_quality'
    },
    corePhilosophy: {
      witness_paradigm: true,
      pleasant_companion_first: true,
      consciousness_expansion_focus: true,
      flow_over_milliseconds: true
    }
  });
}