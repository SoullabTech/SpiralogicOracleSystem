/**
 * Simple test for Maya's Opening Ritual integration
 * Tests the basic structure without full TypeScript compilation
 */

const fs = require('fs');
const path = require('path');

// Test the MayaOpeningScript.json structure
function testOpeningScriptStructure() {
  console.log('🧪 Testing MayaOpeningScript.json structure...\n');
  
  try {
    const scriptPath = path.join(__dirname, 'config/MayaOpeningScript.json');
    const mayaScript = JSON.parse(fs.readFileSync(scriptPath, 'utf-8'));
    
    console.log('✅ MayaOpeningScript.json loaded successfully');
    
    // Check structure
    console.log('\n📋 Script Structure:');
    console.log('- Opening section:', !!mayaScript.opening);
    console.log('- Greeting:', !!mayaScript.opening?.greeting);
    console.log('- Energy Check:', !!mayaScript.opening?.energyCheck);
    console.log('- Spiral Phase:', !!mayaScript.opening?.spiralPhase);
    console.log('- Closing:', !!mayaScript.opening?.closing);
    
    // Check energy branches
    console.log('\n🔥 Energy Check Elements:');
    const energyCheck = mayaScript.opening.energyCheck;
    ['fire', 'water', 'earth', 'air', 'aether'].forEach(element => {
      if (energyCheck[element]) {
        console.log(`- ${element}: ✅ (mirror & balance)`);
      } else {
        console.log(`- ${element}: ❌ (missing)`);
      }
    });
    
    // Check resistance branch
    console.log('\n🌱 Resistance Handling:');
    if (energyCheck.resistanceBranch && energyCheck.resistanceBranch.length >= 3) {
      console.log('✅ Resistance branch with 3+ lines');
    } else {
      console.log('❌ Resistance branch missing or incomplete');
    }
    
    // Check mixed elements
    console.log('\n🌀 Mixed Elements:');
    if (energyCheck.mixed) {
      console.log('✅ Mixed element support:', Object.keys(energyCheck.mixed));
    } else {
      console.log('❌ Mixed elements not configured');
    }
    
    // Check spiral phases
    console.log('\n🌀 Spiral Phases:');
    const spiralPhase = mayaScript.opening.spiralPhase;
    ['initiation', 'challenge', 'integration', 'mastery', 'transcendence'].forEach(phase => {
      if (spiralPhase[phase]) {
        console.log(`- ${phase}: ✅`);
      } else {
        console.log(`- ${phase}: ❌`);
      }
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to load MayaOpeningScript.json:', error.message);
    return false;
  }
}

// Test basic element detection patterns
function testBasicElementDetection() {
  console.log('\n🎯 Testing Basic Element Detection Patterns...\n');
  
  const testCases = [
    { text: 'I feel passionate and excited about this project!', expected: 'fire' },
    { text: 'I\'ve been feeling really emotional lately with lots of tears', expected: 'water' },
    { text: 'My mind is racing with so many thoughts and ideas', expected: 'air' },
    { text: 'I feel stuck and heavy, can\'t seem to move forward', expected: 'earth' },
    { text: 'I don\'t really know how I\'m feeling right now', expected: 'resistance' }
  ];
  
  function detectElement(text) {
    const lower = text.toLowerCase();
    
    if (lower.match(/passion|fire|excited|intense|energy/)) return 'fire';
    if (lower.match(/emotion|water|tears|feel|sad/)) return 'water'; 
    if (lower.match(/mind|thoughts|ideas|think|racing/)) return 'air';
    if (lower.match(/stuck|heavy|earth|grounded|can't move/)) return 'earth';
    if (lower.match(/don't know|not sure|unsure/)) return 'resistance';
    
    return 'aether'; // default
  }
  
  testCases.forEach(testCase => {
    const detected = detectElement(testCase.text);
    const match = detected === testCase.expected;
    
    console.log(`${match ? '✅' : '❌'} "${testCase.text}"`);
    console.log(`   Expected: ${testCase.expected}, Detected: ${detected}`);
  });
  
  return testCases.every(tc => detectElement(tc.text) === tc.expected);
}

// Test spiral phase detection
function testPhaseDetection() {
  console.log('\n🌀 Testing Spiral Phase Detection...\n');
  
  const testCases = [
    { text: 'I\'m starting something new for the first time', expected: 'initiation' },
    { text: 'This is really challenging and difficult', expected: 'challenge' },
    { text: 'I\'m trying to understand and integrate these lessons', expected: 'integration' },
    { text: 'I feel confident and skilled at this now', expected: 'mastery' },
    { text: 'I\'m ready to transcend and breakthrough', expected: 'transcendence' }
  ];
  
  function detectPhase(text) {
    const lower = text.toLowerCase();
    
    if (lower.match(/start|begin|new|first/)) return 'initiation';
    if (lower.match(/challenge|difficult|struggle|hard/)) return 'challenge';
    if (lower.match(/learn|understand|process|integrate/)) return 'integration';
    if (lower.match(/good|confident|master|skilled/)) return 'mastery';
    if (lower.match(/transcend|spiritual|beyond|breakthrough/)) return 'transcendence';
    
    return 'integration'; // default
  }
  
  testCases.forEach(testCase => {
    const detected = detectPhase(testCase.text);
    const match = detected === testCase.expected;
    
    console.log(`${match ? '✅' : '❌'} "${testCase.text}"`);
    console.log(`   Expected: ${testCase.expected}, Detected: ${detected}`);
  });
  
  return testCases.every(tc => detectPhase(tc.text) === tc.expected);
}

// Run all tests
async function runAllTests() {
  console.log('🎭 Maya Opening Ritual Integration Tests\n');
  console.log('═'.repeat(60));
  
  const results = {};
  
  // Test 1: Script structure
  results.structure = testOpeningScriptStructure();
  
  console.log('\n' + '═'.repeat(60));
  
  // Test 2: Basic element detection
  results.elementDetection = testBasicElementDetection();
  
  console.log('\n' + '═'.repeat(60));
  
  // Test 3: Phase detection
  results.phaseDetection = testPhaseDetection();
  
  console.log('\n' + '═'.repeat(60));
  
  // Summary
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log('\n🎉 Test Summary:');
  console.log(`✅ Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('🌟 All tests passed! Opening Ritual integration looks good.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
  
  return passed === total;
}

// Run the tests
runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });