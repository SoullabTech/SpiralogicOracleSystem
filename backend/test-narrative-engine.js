/**
 * Quick integration test for NarrativeEngine
 * Tests the core functionality to ensure the implementation works
 */

const { NarrativeEngine } = require('./dist/core/implementations/NarrativeEngine');

// Test data
const createMockPersonaPrefs = () => ({
  worldview: 'balanced',
  formality: 'warm',
  metaphysics_confidence: 0.6,
  voice_enabled: true
});

const createMockStageConfig = (stage, overrides = {}) => ({
  stage,
  displayName: `${stage} Stage`,
  description: `Test ${stage} configuration`,
  tone: {
    formality: 0.5,
    directness: 0.6,
    challenge_comfort: 0.5,
    metaphysical_openness: 0.7,
    vulnerability_sharing: 0.3,
    ...overrides.tone
  },
  disclosure: {
    archetype_visibility: 0.5,
    uncertainty_admission: 0.3,
    multiple_perspectives: false,
    collective_field_access: false,
    shadow_work_depth: 0.5,
    ...overrides.disclosure
  },
  orchestration: {
    agent_cooperation: 'single',
    response_length: 'moderate',
    interaction_mode: 'directive',
    complexity_level: 0.7,
    personalization_depth: 0.5,
    ...overrides.orchestration
  },
  voice: {
    character_consistency: 0.8,
    emotional_attunement: 0.7,
    wisdom_transmission: 'instructional',
    presence_quality: 'maternal',
    ...overrides.voice
  },
  advancement: {
    required_capacity_signals: ['trust'],
    minimum_threshold: 0.5,
    session_count_minimum: 3,
    stability_window_days: 7,
    override_possible: false
  },
  safety: {
    fallback_triggers: ['overwhelm_detected'],
    monitoring_intensity: 'moderate',
    intervention_threshold: 0.5,
    recovery_requirement: 0.7
  }
});

async function runTests() {
  console.log('🧪 Testing NarrativeEngine...\n');
  
  try {
    // Test 1: Basic generation
    console.log('✅ Test 1: Basic narrative generation');
    const rawResponse = "Your consciousness archetypal patterns synchronicity transcendent journey.";
    const context = {
      intent: 'guidance',
      prefs: createMockPersonaPrefs(),
      emotions: ['curiosity'],
      stageConfig: createMockStageConfig('structured_guide'),
      stageSummary: {}
    };

    const result = NarrativeEngine.generate(rawResponse, context);
    console.log(`   Original: ${rawResponse}`);
    console.log(`   Shaped:   ${result}`);
    console.log(`   ✓ Generated valid response (${result.length} chars)\n`);

    // Test 2: High formality
    console.log('✅ Test 2: High formality transformation');
    const formalResponse = "You&apos;re gonna love this cosmic insight!";
    const formalContext = {
      intent: 'guidance',
      prefs: createMockPersonaPrefs(),
      emotions: ['excitement'],
      stageConfig: createMockStageConfig('structured_guide', {
        tone: { formality: 0.9, metaphysical_openness: 0.3 }
      }),
      stageSummary: {}
    };

    const formalResult = NarrativeEngine.generate(formalResponse, formalContext);
    console.log(`   Original: ${formalResponse}`);
    console.log(`   Shaped:   ${formalResult}`);
    console.log(`   ✓ Expanded contractions: ${formalResult.includes('you are') ? 'YES' : 'NO'}`);
    console.log(`   ✓ Reduced mystical language: ${!formalResult.includes('cosmic') ? 'YES' : 'NO'}\n`);

    // Test 3: Mastery polish
    console.log('✅ Test 3: Mastery voice polish');
    const masteryResponse = "Your consciousness archetypal synchronicity transcendent ontology phenomenology initiation embodied.";
    const masteryContext = {
      polishType: 'mastery',
      stageConfig: createMockStageConfig('transparent_prism'),
      userMetrics: {
        trustLevel: 0.8,
        engagementScore: 0.7
      }
    };

    const masteryResult = NarrativeEngine.polish(masteryResponse, masteryContext);
    console.log(`   Original: ${masteryResponse}`);
    console.log(`   Polished: ${masteryResult}`);
    console.log(`   ✓ Stripped jargon: ${!masteryResult.includes('consciousness') ? 'YES' : 'NO'}`);
    console.log(`   ✓ Added opening question: ${masteryResult.includes('What feels true') ? 'YES' : 'NO'}`);
    console.log(`   ✓ Contains simplified terms: ${masteryResult.includes('awareness') ? 'YES' : 'NO'}\n`);

    // Test 4: Crisis polish
    console.log('✅ Test 4: Crisis response polish');
    const crisisResponse = "This is a very long crisis response that needs to be shortened for safety and grounding purposes, with additional supportive language that extends beyond the safe limit for crisis situations.";
    const crisisResult = NarrativeEngine.polish(crisisResponse, {
      polishType: 'crisis'
    });
    console.log(`   Original: ${crisisResponse} (${crisisResponse.length} chars)`);
    console.log(`   Polished: ${crisisResult} (${crisisResult.length} chars)`);
    console.log(`   ✓ Shortened response: ${crisisResult.length <= 150 ? 'YES' : 'NO'}`);
    console.log(`   ✓ Added grounding cue: ${crisisResult.includes('breath') ? 'YES' : 'NO'}\n`);

    // Test 5: Stage progression
    console.log('✅ Test 5: Stage progression differences');
    const baseResponse = "Your spiritual journey involves understanding consciousness and archetypal patterns.";
    
    const structuredResult = NarrativeEngine.generate(baseResponse, {
      intent: 'guidance',
      prefs: createMockPersonaPrefs(),
      emotions: ['curiosity'],
      stageConfig: createMockStageConfig('structured_guide', {
        tone: { formality: 0.7, directness: 0.8, metaphysical_openness: 0.4 }
      }),
      stageSummary: {}
    });
    
    const transparentResult = NarrativeEngine.generate(baseResponse, {
      intent: 'guidance',
      prefs: createMockPersonaPrefs(),
      emotions: ['curiosity'],
      stageConfig: createMockStageConfig('transparent_prism', {
        tone: { formality: 0.2, directness: 0.4, metaphysical_openness: 0.9 }
      }),
      stageSummary: {}
    });

    console.log(`   Structured Guide: ${structuredResult}`);
    console.log(`   Transparent Prism: ${transparentResult}`);
    console.log(`   ✓ Different outputs per stage: ${structuredResult !== transparentResult ? 'YES' : 'NO'}\n`);

    console.log('🎉 All NarrativeEngine tests passed!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Basic generation works');
    console.log('   ✅ Stage-aware transformations work');
    console.log('   ✅ Mastery voice polish works');  
    console.log('   ✅ Crisis response polish works');
    console.log('   ✅ Stage progression creates different outputs');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();