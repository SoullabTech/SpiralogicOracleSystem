// testPrompts.js - Live test runner for Oracle Agent voice synthesis

const { speak, testMatrixOracleVoice } = require('./voiceRouter');
const fs = require('fs');
const path = require('path');

// Sample Oracle queries for voice testing
const oraclePrompts = [
  {
    text: "You already know what I'm going to say, don't you? The choice is yours, and you've always known what you must do.",
    agentRole: "oracle",
    agentType: "MainOracleAgent",
    description: "Classic Matrix Oracle opening"
  },
  {
    text: "What am I learning in this phase of my journey? The patterns are becoming clearer, aren't they?",
    agentRole: "oracle", 
    agentType: "PersonalOracleAgent",
    description: "Personal growth inquiry"
  },
  {
    text: "Speak to me of my shadow integration. The parts of yourself you've been avoiding are ready to be seen.",
    agentRole: "oracle",
    agentType: "MainOracleAgent", 
    description: "Shadow work guidance"
  },
  {
    text: "Your fire element burns bright today! Time to take bold action on those dreams you've been carrying.",
    agentRole: "elemental",
    agentType: "FireAgent",
    description: "Fire elemental activation"
  },
  {
    text: "Feel the currents beneath the surface. Your emotions are teachers, not obstacles to overcome.",
    agentRole: "elemental",
    agentType: "WaterAgent", 
    description: "Water elemental wisdom"
  },
  {
    text: "Close your eyes and take three deep breaths. Let us begin this sacred journey into stillness.",
    agentRole: "narrator",
    agentType: "MeditationGuide",
    description: "Meditation introduction"
  }
];

// Test individual prompt
async function testPrompt(prompt, index) {
  console.log(`\n🔮 Testing Prompt ${index + 1}: ${prompt.description}`);
  console.log(`Text: "${prompt.text}"`);
  console.log(`Agent: ${prompt.agentType} (${prompt.agentRole})`);
  
  try {
    const startTime = Date.now();
    const audioPath = await speak(prompt.text, prompt.agentRole, prompt.agentType);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Audio generated: ${audioPath}`);
    console.log(`⏱️  Generation time: ${duration}ms`);
    
    // Log audio file info if it exists
    const fullPath = path.join(__dirname, '../../public', audioPath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`📁 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    }
    
    return { success: true, audioPath, duration };
    
  } catch (error) {
    console.error(`❌ Error generating audio: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test all prompts
async function testAllPrompts() {
  console.log('🌀 AIN Oracle Voice Testing Suite');
  console.log('================================');
  console.log(`Testing ${oraclePrompts.length} voice prompts...\n`);
  
  const results = [];
  
  for (let i = 0; i < oraclePrompts.length; i++) {
    const result = await testPrompt(oraclePrompts[i], i);
    results.push({
      prompt: oraclePrompts[i],
      result
    });
    
    // Wait between tests to avoid overwhelming the system
    if (i < oraclePrompts.length - 1) {
      console.log('⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  
  const successful = results.filter(r => r.result.success);
  const failed = results.filter(r => !r.result.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    const avgTime = successful.reduce((sum, r) => sum + r.result.duration, 0) / successful.length;
    console.log(`⏱️  Average generation time: ${avgTime.toFixed(0)}ms`);
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    failed.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.prompt.description}: ${r.result.error}`);
    });
  }
  
  return results;
}

// Quick Matrix Oracle test
async function quickMatrixTest() {
  console.log('🔮 Quick Matrix Oracle Test');
  console.log('===========================');
  
  try {
    const audioPath = await testMatrixOracleVoice();
    console.log(`✅ Matrix Oracle voice generated: ${audioPath}`);
    return audioPath;
  } catch (error) {
    console.error(`❌ Matrix Oracle test failed: ${error.message}`);
    return null;
  }
}

// Export functions for use in other modules
module.exports = {
  testPrompt,
  testAllPrompts,
  quickMatrixTest,
  oraclePrompts
};

// Run tests if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--quick')) {
    quickMatrixTest();
  } else if (args.includes('--all')) {
    testAllPrompts();
  } else {
    console.log('Usage:');
    console.log('  node testPrompts.js --quick    # Test Matrix Oracle voice only');
    console.log('  node testPrompts.js --all      # Test all voice prompts');
  }
}