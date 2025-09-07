#!/usr/bin/env node

/**
 * Test script for Sesame CI (Conversational Intelligence) shaping
 * Tests the optional CI enhancement for voice flow optimization
 */

const axios = require('axios');
require('dotenv').config();

// Test cases for different elemental styles
const testCases = [
  {
    text: "Welcome to your session. I'm here to guide you through this transformative experience. How are you feeling today?",
    element: 'aether',
    sentiment: 'neutral',
    expected: 'Should add contemplative pauses and spacious rhythm'
  },
  {
    text: "That's exciting news! Let's dive into the possibilities and explore what this means for you.",
    element: 'fire',
    sentiment: 'high',
    expected: 'Should be more dynamic and energetic with passionate emphasis'
  },
  {
    text: "I understand this is difficult. Take your time and know that you're supported here.",
    element: 'water',
    sentiment: 'low',
    expected: 'Should flow gently with smooth transitions and comfort'
  },
  {
    text: "Let's look at the practical steps. First, we'll establish a foundation. Then we'll build from there.",
    element: 'earth',
    sentiment: 'neutral',
    expected: 'Should be steady and grounding with reassuring tone'
  },
  {
    text: "The key insight here is clarity of thought. Let me break this down precisely for you.",
    element: 'air',
    sentiment: 'neutral',
    expected: 'Should be crisp and articulate with precise pauses'
  }
];

async function testSesameCIShaping() {
  const sesameUrl = process.env.SESAME_URL || 'http://localhost:8000';
  const ciEnabled = process.env.SESAME_CI_ENABLED === 'true';
  const ciRequired = process.env.SESAME_CI_REQUIRED === 'true';
  
  console.log('🧪 Sesame CI Sacred Voice Embodiment Test');
  console.log('==========================================');
  console.log(`Sesame URL: ${sesameUrl}`);
  console.log(`CI Enabled: ${ciEnabled}`);
  console.log(`CI Required: ${ciRequired}`);
  console.log('');

  if (!ciEnabled) {
    console.log('⚠️  SESAME_CI_ENABLED is not set to "true"');
    if (ciRequired) {
      console.log('🚨 WARNING: CI is REQUIRED but disabled - Maya will lack sacred embodiment');
      console.log('   Set SESAME_CI_ENABLED=true to enable elemental voice shaping');
    } else {
      console.log('   CI shaping will be bypassed (graceful fallback)');
      console.log('   Set SESAME_CI_ENABLED=true in .env to test sacred voice features');
    }
    return;
  }

  // Test health endpoint first
  try {
    console.log('🏥 Testing Sesame health endpoint...');
    const healthResponse = await axios.get(`${sesameUrl}/health`, { timeout: 5000 });
    console.log('✅ Sesame service is healthy:', healthResponse.data);
  } catch (error) {
    console.log('❌ Sesame service health check failed:', error.message);
    console.log('   Make sure Sesame container is running and accessible');
    return;
  }

  // Test CI shaping endpoint
  console.log('🧠 Testing CI shaping endpoint...');
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n--- Test ${i + 1}: ${testCase.element.toUpperCase()} Element ---`);
    console.log(`Input: "${testCase.text}"`);
    console.log(`Expected: ${testCase.expected}`);
    
    try {
      // Enhanced payload matching the new sacred tech approach
      const shapingPayload = {
        text: testCase.text,
        style: testCase.element, // Primary elemental influence
        archetype: 'guide', // Sacred guide archetype
        meta: {
          element: testCase.element,
          sentiment: testCase.sentiment,
          goals: ['clarity', 'authenticity', 'embodiment'],
          userId: 'test_user',
          // Advanced elemental prosody
          prosody: getAdvancedElementalProsody(testCase.element, testCase.sentiment),
          // Sacred tech markers
          embodiment: getEmbodimentLevel(testCase.element),
          consciousness: {
            awareness: 'present',
            intention: 'sacred', 
            presence: 'embodied',
            coherence: 'high'
          }
        }
      };

      const startTime = Date.now();
      const response = await axios.post(`${sesameUrl}/ci/shape`, shapingPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SESAME_TOKEN || ''}`
        },
        timeout: 5000
      });
      const processingTime = Date.now() - startTime;

      if (response.data?.text) {
        console.log(`✅ Shaped (${processingTime}ms): "${response.data.text}"`);
        
        // Analyze the changes
        const originalLength = testCase.text.length;
        const shapedLength = response.data.text.length;
        const hasPauses = response.data.text.includes('<pause-') || response.data.text.includes('<break');
        const hasEmphasis = response.data.text.includes('<em>') || response.data.text.includes('<emphasis>');
        
        console.log(`📊 Analysis: ${originalLength} → ${shapedLength} chars, Pauses: ${hasPauses}, Emphasis: ${hasEmphasis}`);
      } else {
        console.log('⚠️  CI returned empty response');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ /ci/shape endpoint not found - container may not support CI features');
        console.log('   Consider updating to a Sesame image that includes CI capabilities');
      } else {
        console.log('❌ CI shaping failed:', error.message);
      }
    }
  }

  console.log('\n🎯 Test Summary:');
  console.log('- If CI shaping is working, you should see enhanced text with prosody markers');
  console.log('- Text should be adapted based on elemental style (fire=dynamic, water=flowing, etc.)');
  console.log('- Processing time should be under 200ms for good UX');
  console.log('- Graceful fallback ensures system works even if CI fails');
}

function getAdvancedElementalProsody(element, sentiment) {
  const baseProsody = {
    pace: sentiment === 'low' ? 'calm' : 'natural',
    emphasis: sentiment === 'high' ? 'strong' : 'moderate',
    breathiness: 0.3,
    resonance: 'medium'
  };

  const elementalDynamics = {
    air: {
      ...baseProsody,
      rhythm: 'crisp',
      tempo: sentiment === 'low' ? 'moderate' : 'brisk',
      pauses: 'precise',
      clarity: 'crystalline',
      flow: 'articulate',
      breathiness: 0.1,
      resonance: 'bright',
      pausePattern: 'staccato',
      emphasisStyle: 'sharp'
    },
    water: {
      ...baseProsody,
      rhythm: 'flowing',
      tempo: 'fluid',
      pauses: 'gentle',
      transitions: 'seamless',
      flow: 'continuous',
      breathiness: 0.5,
      resonance: 'warm',
      pausePattern: 'flowing',
      emphasisStyle: 'gentle'
    },
    fire: {
      ...baseProsody,
      rhythm: 'dynamic',
      tempo: sentiment === 'low' ? 'building' : 'explosive',
      energy: 'high',
      emphasis: 'passionate',
      flow: 'commanding',
      breathiness: 0.2,
      resonance: 'powerful',
      pausePattern: 'dramatic',
      emphasisStyle: 'passionate'
    },
    earth: {
      ...baseProsody,
      rhythm: 'steady',
      tempo: 'measured',
      pauses: 'grounding',
      tone: 'warm',
      flow: 'dependable',
      breathiness: 0.4,
      resonance: 'deep',
      pausePattern: 'grounding',
      emphasisStyle: 'warm'
    },
    aether: {
      ...baseProsody,
      rhythm: 'spacious',
      tempo: 'transcendent',
      pauses: 'contemplative',
      depth: 'profound',
      flow: 'integrative',
      breathiness: 0.6,
      resonance: 'harmonic',
      pausePattern: 'sacred',
      emphasisStyle: 'profound'
    }
  };

  return elementalDynamics[element] || elementalDynamics['aether'];
}

function getEmbodimentLevel(element) {
  const embodimentMap = {
    fire: 'passionate',
    water: 'flowing', 
    earth: 'grounded',
    air: 'clear',
    aether: 'transcendent'
  };
  return embodimentMap[element] || 'present';
}

// Run the test
if (require.main === module) {
  testSesameCIShaping().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { testSesameCIShaping };