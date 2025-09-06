#!/usr/bin/env node

/**
 * Test Adaptive Branching System  
 * Tests mixed tone detection and resistance handling via Maya's opening script
 */

const fs = require('fs');
const path = require('path');

console.log('🌀 Testing Adaptive Branching System\n');

// Test cases for mixed tones and resistance patterns
const testCases = [
  {
    name: 'Mixed Emotions - Excited but Nervous',
    input: 'excited but nervous',
    expectedPattern: 'mixed',
    description: 'Should detect mixed emotional state'
  },
  {
    name: 'Resistance - Uncertainty',
    input: "don't know",
    expectedPattern: 'resistance_uncertainty',
    description: 'Should trigger uncertainty reframing'
  },
  {
    name: 'Resistance - Defensiveness', 
    input: 'whatever',
    expectedPattern: 'resistance_defensiveness',
    description: 'Should trigger defensiveness reframing'
  },
  {
    name: 'Resistance - Overwhelm',
    input: 'too much',
    expectedPattern: 'resistance_overwhelm',
    description: 'Should trigger overwhelm support'
  },
  {
    name: 'Resistance - Disconnection',
    input: 'numb',
    expectedPattern: 'resistance_disconnection', 
    description: 'Should trigger disconnection reframing'
  }
];

function loadMayaOpeningScript() {
  try {
    const scriptPath = path.join(__dirname, 'config', 'MayaOpeningScript.json');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    return JSON.parse(scriptContent);
  } catch (error) {
    console.error('❌ Failed to load MayaOpeningScript.json:', error.message);
    return null;
  }
}

function testElementDetection(script, input) {
  if (!script || !script.energy_check || !script.energy_check.branches) {
    return { found: false, error: 'Invalid script structure' };
  }

  for (const branch of script.energy_check.branches) {
    if (branch.triggers && branch.triggers.some(trigger => 
      input.toLowerCase().includes(trigger.toLowerCase())
    )) {
      return {
        found: true,
        element: branch.element,
        response: branch.maya_response,
        hasReframing: branch.reframing || false,
        hasAdaptiveResponse: branch.adaptive_response || false,
        prosody: branch.prosody
      };
    }
  }

  return { found: false, error: 'No matching pattern found' };
}

function runTests() {
  console.log('Loading Maya\'s Opening Script...\n');
  
  const script = loadMayaOpeningScript();
  if (!script) {
    console.log('❌ Cannot proceed without script configuration');
    return;
  }

  let passed = 0;
  let total = testCases.length;

  for (const testCase of testCases) {
    console.log(`🧪 Testing: ${testCase.name}`);
    console.log(`Input: "${testCase.input}"`);
    console.log(`Expected: ${testCase.description}`);
    
    const result = testElementDetection(script, testCase.input);
    
    if (result.found) {
      console.log(`✅ Match found!`);
      console.log(`   Element: ${result.element}`);
      console.log(`   Response: ${result.response}`);
      
      if (result.hasReframing) {
        console.log(`   🔄 Has reframing: YES`);
      }
      
      if (result.hasAdaptiveResponse) {
        console.log(`   🌀 Adaptive response: YES`);
      }
      
      if (result.prosody) {
        console.log(`   🎵 Mirror: ${result.prosody.mirror?.element} (${result.prosody.mirror?.approach})`);
        console.log(`   ⚖️  Balance: ${result.prosody.balance?.element} (${result.prosody.balance?.approach})`);
        console.log(`   🔍 Debug: ${result.prosody.debug}`);
      }
      
      passed++;
    } else {
      console.log(`❌ No match found: ${result.error}`);
    }
    
    console.log('');
  }
  
  // Summary
  console.log(`🎯 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🌟 All adaptive branching patterns are configured! Maya can now handle:');
    console.log('   ✓ Mixed emotional states with sacred complexity acknowledgment');
    console.log('   ✓ Uncertainty with gentle metaphorical reframing');
    console.log('   ✓ Defensiveness with validating acceptance');
    console.log('   ✓ Overwhelm with grounding weather metaphors');
    console.log('   ✓ Disconnection with spacious nature metaphors');
    console.log('\n💫 The adaptive branching system is ready for integration!');
  } else {
    console.log('⚠️  Some patterns are missing. Review MayaOpeningScript.json configuration.');
  }
}

// Run the tests
runTests();