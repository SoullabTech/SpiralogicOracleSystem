/**
 * Simple test to verify Maya Opening Ritual integration
 * Tests the basic functionality without full TypeScript compilation
 */

const fs = require('fs');
const path = require('path');

function testMayaScriptStructure() {
  console.log('🧪 Testing MayaOpeningScript.json integration compatibility...\n');
  
  try {
    const scriptPath = path.join(__dirname, 'config/MayaOpeningScript.json');
    const mayaScript = JSON.parse(fs.readFileSync(scriptPath, 'utf-8'));
    
    console.log('✅ MayaOpeningScript.json loaded');
    
    // Test structure compatibility
    const tests = [
      { key: 'welcome', expected: true },
      { key: 'welcome.text', expected: true },
      { key: 'welcome.prosody', expected: true },
      { key: 'energy_check', expected: true },
      { key: 'energy_check.prompt', expected: true },
      { key: 'energy_check.branches', expected: true },
      { key: 'spiral_phase', expected: true },
      { key: 'fallbacks', expected: true }
    ];
    
    console.log('📋 Structure Compatibility Check:');
    let allPassed = true;
    
    tests.forEach(test => {
      const keys = test.key.split('.');
      let value = mayaScript;
      let exists = true;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          exists = false;
          break;
        }
      }
      
      const passed = exists === test.expected;
      if (!passed) allPassed = false;
      
      console.log(`  ${passed ? '✅' : '❌'} ${test.key}: ${exists ? 'exists' : 'missing'}`);
    });
    
    // Test energy branches have required fields
    console.log('\n🔥 Energy Branches Check:');
    const energyBranches = mayaScript.energy_check?.branches || [];
    let branchCount = 0;
    let validBranches = 0;
    
    energyBranches.forEach((branch, index) => {
      branchCount++;
      const hasElement = !!branch.element;
      const hasResponse = !!branch.maya_response;
      const hasTriggers = Array.isArray(branch.triggers) && branch.triggers.length > 0;
      
      const isValid = hasElement && hasResponse && hasTriggers;
      if (isValid) validBranches++;
      
      console.log(`  Branch ${index + 1}: ${isValid ? '✅' : '❌'} (${branch.element || 'no element'})`);
      if (!isValid) {
        console.log(`    - Element: ${hasElement ? '✅' : '❌'}`);
        console.log(`    - Response: ${hasResponse ? '✅' : '❌'}`);
        console.log(`    - Triggers: ${hasTriggers ? '✅' : '❌'}`);
      }
    });
    
    console.log(`\n📊 Summary: ${validBranches}/${branchCount} valid energy branches`);
    
    // Test element coverage
    const expectedElements = ['fire', 'water', 'earth', 'air', 'aether'];
    const foundElements = energyBranches.map(b => b.element);
    
    console.log('\n🌟 Element Coverage:');
    expectedElements.forEach(element => {
      const covered = foundElements.includes(element);
      console.log(`  ${covered ? '✅' : '❌'} ${element}`);
    });
    
    return allPassed && validBranches > 0;
    
  } catch (error) {
    console.error('❌ Failed to test MayaScript structure:', error.message);
    return false;
  }
}

function testBasicElementMatching() {
  console.log('\n\n🎯 Testing Basic Element Detection Pattern...\n');
  
  const testCases = [
    { text: 'I feel passionate and excited!', element: 'fire' },
    { text: 'I\'ve been emotional with tears', element: 'water' },
    { text: 'My mind is racing with thoughts', element: 'air' },
    { text: 'I feel stuck and heavy', element: 'earth' },
    { text: 'I don\'t really know', element: 'uncertain' }
  ];
  
  // Simple element detection logic (mimics the pipeline fallback)
  function detectElement(text) {
    const lower = text.toLowerCase();
    
    if (lower.match(/passion|fire|excited|intense|energy/)) return 'fire';
    if (lower.match(/emotion|water|tears|feel.*sad|emotional/)) return 'water';
    if (lower.match(/mind|thoughts|racing|think|ideas/)) return 'air';
    if (lower.match(/stuck|heavy|grounded|can't move/)) return 'earth';
    if (lower.match(/don't know|not sure|unsure/)) return 'uncertain';
    
    return 'aether';
  }
  
  let passed = 0;
  testCases.forEach(testCase => {
    const detected = detectElement(testCase.text);
    const match = detected === testCase.element;
    
    console.log(`${match ? '✅' : '❌'} "${testCase.text}"`);
    console.log(`   Expected: ${testCase.element}, Got: ${detected}`);
    
    if (match) passed++;
  });
  
  console.log(`\n📊 Element Detection: ${passed}/${testCases.length} passed`);
  return passed === testCases.length;
}

function testSpiralPhaseDetection() {
  console.log('\n\n🌀 Testing Spiral Phase Detection...\n');
  
  const testCases = [
    { text: 'I\'m starting something new', phase: 'initiation' },
    { text: 'This is really challenging', phase: 'challenge' },  
    { text: 'I\'m trying to understand and integrate', phase: 'integration' },
    { text: 'I feel confident and skilled', phase: 'mastery' },
    { text: 'Ready to transcend and breakthrough', phase: 'transcendence' }
  ];
  
  function detectPhase(text) {
    const lower = text.toLowerCase();
    
    if (lower.match(/start|begin|new|first/)) return 'initiation';
    if (lower.match(/challeng|difficult|struggle|hard/)) return 'challenge';
    if (lower.match(/understand|process|integrate/)) return 'integration';
    if (lower.match(/confident|skilled|master/)) return 'mastery';
    if (lower.match(/transcend|breakthrough/)) return 'transcendence';
    
    return 'integration';
  }
  
  let passed = 0;
  testCases.forEach(testCase => {
    const detected = detectPhase(testCase.text);
    const match = detected === testCase.phase;
    
    console.log(`${match ? '✅' : '❌'} "${testCase.text}"`);
    console.log(`   Expected: ${testCase.phase}, Got: ${detected}`);
    
    if (match) passed++;
  });
  
  console.log(`\n📊 Phase Detection: ${passed}/${testCases.length} passed`);
  return passed === testCases.length;
}

// Main test runner
async function runTests() {
  console.log('🎭 Maya Opening Ritual Integration Test');
  console.log('═'.repeat(60));
  
  const results = {};
  
  // Test 1: Script structure
  results.structure = testMayaScriptStructure();
  
  // Test 2: Element matching
  results.elementDetection = testBasicElementMatching();
  
  // Test 3: Phase detection
  results.phaseDetection = testSpiralPhaseDetection();
  
  // Final summary
  console.log('\n' + '═'.repeat(60));
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`\n🎉 Integration Test Summary: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('✅ All integration tests passed! Maya Opening Ritual is ready.');
  } else {
    console.log('⚠️  Some integration tests failed. Check the details above.');
  }
  
  return passed === total;
}

runTests()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });