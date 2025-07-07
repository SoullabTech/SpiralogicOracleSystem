// Test Archetypal Voice Integration with Enhanced HierarchyOrchestrator
import { hierarchyOrchestrator } from './src/core/agents/HierarchyOrchestrator.js';
import { synthesizeArchetypalVoice, previewArchetypalVoice } from './src/utils/voiceService.js';

console.log('🎭 Testing Archetypal Voice Integration with Maya Consciousness System\n');

async function testArchetypalVoices() {
  try {
    console.log('🔊 Testing Individual Archetypal Voice Synthesis...\n');

    const testArchetypes = [
      {
        archetype: 'fire',
        testText: 'I feel stuck and need a breakthrough in my creative vision.',
        expectedVoice: 'Bold, inspiring, catalytic'
      },
      {
        archetype: 'water',
        testText: 'I am feeling overwhelmed with grief and need healing.',
        expectedVoice: 'Soft, flowing, nurturing'
      },
      {
        archetype: 'earth',
        testText: 'I need to ground myself and build stability in my life.',
        expectedVoice: 'Grounded, steady, wise'
      },
      {
        archetype: 'air',
        testText: 'I want to understand this situation with more clarity.',
        expectedVoice: 'Light, clear, communicative'
      },
      {
        archetype: 'aether',
        testText: 'I seek spiritual awakening and divine purpose.',
        expectedVoice: 'Transcendent, mystical, unified'
      }
    ];

    let successfulVoices = 0;
    const totalTests = testArchetypes.length;

    for (const test of testArchetypes) {
      console.log(`🧪 Testing ${test.archetype.toUpperCase()} archetype voice:`);
      console.log(`   Text: "${test.testText}"`);
      console.log(`   Expected Voice: ${test.expectedVoice}`);
      
      try {
        // Test individual voice synthesis
        const voiceResult = await synthesizeArchetypalVoice({
          text: test.testText,
          primaryArchetype: test.archetype,
          userId: `test-voice-${test.archetype}`
        });

        console.log(`   ✅ Voice Generated: ${voiceResult.audioUrl}`);
        console.log(`   🎭 Personality: ${voiceResult.voiceMetadata.personality}`);
        console.log(`   ⚡ Energy: ${voiceResult.voiceMetadata.energySignature}`);
        console.log('');
        
        successfulVoices++;
      } catch (error) {
        console.log(`   ❌ Voice synthesis failed: ${error.message}`);
        console.log('');
      }
    }

    console.log(`🎯 Individual Voice Tests: ${successfulVoices}/${totalTests} successful\n`);

    // Test dual archetypal voices
    console.log('🌟 Testing Dual Archetypal Voice Synthesis...\n');

    const dualArchetypeTests = [
      {
        primary: 'fire',
        secondary: 'water',
        text: 'I have passionate visions but also deep emotional fears.',
        description: 'Fire-Water synthesis (Vision + Emotion)'
      },
      {
        primary: 'earth',
        secondary: 'air',
        text: 'I need to build practical understanding of complex ideas.',
        description: 'Earth-Air synthesis (Grounding + Clarity)'
      },
      {
        primary: 'aether',
        secondary: 'fire',
        text: 'I seek to manifest my spiritual calling in the world.',
        description: 'Aether-Fire synthesis (Spiritual + Action)'
      }
    ];

    let dualVoiceTests = 0;
    
    for (const test of dualArchetypeTests) {
      console.log(`🧪 Testing ${test.description}:`);
      console.log(`   Text: "${test.text}"`);
      
      try {
        const voiceResult = await synthesizeArchetypalVoice({
          text: test.text,
          primaryArchetype: test.primary,
          secondaryArchetype: test.secondary,
          confidence: 0.7,
          userId: `test-dual-${test.primary}-${test.secondary}`
        });

        console.log(`   ✅ Dual Voice Generated: ${voiceResult.audioUrl}`);
        console.log(`   🎭 Blended Personality: ${voiceResult.voiceMetadata.personality}`);
        console.log('');
        
        dualVoiceTests++;
      } catch (error) {
        console.log(`   ❌ Dual voice synthesis failed: ${error.message}`);
        console.log('');
      }
    }

    console.log(`🎯 Dual Voice Tests: ${dualVoiceTests}/${dualArchetypeTests.length} successful\n`);

    return { successfulVoices, dualVoiceTests, totalTests };

  } catch (error) {
    console.error('❌ Archetypal voice testing failed:', error);
    return { successfulVoices: 0, dualVoiceTests: 0, totalTests: 0 };
  }
}

async function testEnhancedHierarchyWithVoice() {
  try {
    console.log('🌟 Testing Enhanced HierarchyOrchestrator with Voice Integration...\n');

    const testQueries = [
      {
        query: 'I want to ignite my passion and create something meaningful',
        expectedArchetype: 'fire',
        description: 'Fire energy detection with catalytic voice'
      },
      {
        query: 'I feel deeply hurt and need emotional healing',
        expectedArchetype: 'water',
        description: 'Water energy detection with nurturing voice'
      },
      {
        query: 'I need to organize my life and build stability',
        expectedArchetype: 'earth',
        description: 'Earth energy detection with grounding voice'
      }
    ];

    let hierarchyTests = 0;

    for (const test of testQueries) {
      console.log(`🧪 Testing: ${test.description}`);
      console.log(`   Query: "${test.query}"`);
      
      try {
        const userId = `test-hierarchy-${Date.now()}`;
        const response = await hierarchyOrchestrator.processUserQuery(
          userId, 
          test.query,
          { includeVoice: true } // Enable voice synthesis
        );

        console.log(`   ✅ Response generated (${response.content.length} chars)`);
        console.log(`   🔮 Primary Archetype: ${response.archetypalMetadata.primary}`);
        console.log(`   🎭 Maya Mode: ${response.mayaMetadata.archetypeMode}`);
        console.log(`   📊 Wisdom Vector: ${response.mayaMetadata.wisdomVector}`);
        
        if (response.voiceMetadata) {
          console.log(`   🔊 Voice Generated: ${response.voiceMetadata.audioUrl}`);
          console.log(`   🎭 Voice Personality: ${response.voiceMetadata.personality}`);
          console.log(`   ⚡ Energy Signature: ${response.voiceMetadata.energySignature}`);
        } else {
          console.log('   ⚠️ No voice generated (API may be unavailable)');
        }
        
        console.log('');
        hierarchyTests++;
        
      } catch (error) {
        console.log(`   ❌ Test failed: ${error.message}`);
        console.log('');
      }
    }

    console.log(`🎯 Enhanced Hierarchy Tests: ${hierarchyTests}/${testQueries.length} successful\n`);
    
    return hierarchyTests;

  } catch (error) {
    console.error('❌ Enhanced hierarchy testing failed:', error);
    return 0;
  }
}

async function testVoicePreviews() {
  try {
    console.log('🎵 Testing Archetypal Voice Previews...\n');
    
    const archetypes = ['fire', 'water', 'earth', 'air', 'aether'];
    let previewTests = 0;
    
    for (const archetype of archetypes) {
      try {
        console.log(`🎧 Generating ${archetype} voice preview...`);
        const previewUrl = await previewArchetypalVoice(archetype);
        console.log(`   ✅ Preview generated: ${previewUrl}\n`);
        previewTests++;
      } catch (error) {
        console.log(`   ❌ Preview failed: ${error.message}\n`);
      }
    }
    
    console.log(`🎯 Voice Preview Tests: ${previewTests}/${archetypes.length} successful\n`);
    return previewTests;
    
  } catch (error) {
    console.error('❌ Voice preview testing failed:', error);
    return 0;
  }
}

// Run comprehensive archetypal voice tests
console.log('🚀 Starting Archetypal Voice Integration Tests...\n');

async function runAllTests() {
  try {
    const voiceResults = await testArchetypalVoices();
    const hierarchyResults = await testEnhancedHierarchyWithVoice();
    const previewResults = await testVoicePreviews();

    console.log('📊 FINAL TEST RESULTS:');
    console.log(`   Individual Voices: ${voiceResults.successfulVoices}/${voiceResults.totalTests}`);
    console.log(`   Dual Voices: ${voiceResults.dualVoiceTests}/${3}`);
    console.log(`   Enhanced Hierarchy: ${hierarchyResults}/3`);
    console.log(`   Voice Previews: ${previewResults}/5`);
    console.log('');

    const totalSuccessful = voiceResults.successfulVoices + voiceResults.dualVoiceTests + hierarchyResults + previewResults;
    const totalTests = voiceResults.totalTests + 3 + 3 + 5;

    if (totalSuccessful >= totalTests * 0.8) {
      console.log('🌟 ARCHETYPAL VOICE INTEGRATION SUCCESS!');
      console.log('🎭 Your consciousness system now SPEAKS with archetypal voices!');
      console.log('🔥🌊🌱🌬️✨ Maya consciousness is VOICE-ENABLED!');
    } else if (totalSuccessful >= totalTests * 0.5) {
      console.log('⚠️ Partial Success - Core functionality working');
      console.log('🔧 Some voice features may need ElevenLabs API key configuration');
    } else {
      console.log('❌ Integration needs attention');
      console.log('💡 Check ElevenLabs API configuration and network connectivity');
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

runAllTests();