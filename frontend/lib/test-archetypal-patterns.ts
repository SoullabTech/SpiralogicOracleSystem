// ===============================================
// ARCHETYPAL PATTERN TEST - BROWSER VERSION
// Test the Oracle's archetypal pattern detection
// ===============================================

window.testArchetypalPatterns = async function() {
  console.log('🎭 Testing Archetypal Pattern Detection...\n');
  
  const authToken = localStorage.getItem('auth_token');
  const userId = 'test_user_123'; // Replace with actual
  
  if (!authToken) {
    console.error('❌ Please login first');
    return;
  }

  try {
    // Test Shadow archetype detection
    console.log('🌑 Testing Shadow Archetype...\n');
    
    const shadowMessages = [
      "I hate this part of myself",
      "My shadow side is so strong", 
      "Working with my shadow today"
    ];
    
    for (const message of shadowMessages) {
      console.log(`Sending: "${message}"`);
      
      const response = await fetch('/api/oracle/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId,
          message
        })
      });
      
      const data = await response.json();
      console.log(`Oracle: "${data.response.substring(0, 100)}..."\n`);
      
      // Wait between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Check archetypal patterns
    console.log('📊 Checking archetypal patterns...\n');
    
    const patternsResponse = await fetch('/api/soul-memory/archetypal-patterns', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const patternsData = await patternsResponse.json();
    
    if (patternsData.success && patternsData.patterns.length > 0) {
      console.log(`✅ Found ${patternsData.count} active archetypes:\n`);
      
      patternsData.patterns.forEach((pattern, i) => {
        console.log(`${i + 1}. ${pattern.archetype}`);
        console.log(`   - Activations: ${pattern.activationCount}`);
        console.log(`   - Strength: ${(pattern.patternStrength * 100).toFixed(1)}%`);
        console.log(`   - Related memories: ${pattern.relatedMemories}\n`);
      });
      
      // Check if Shadow is active
      const shadowPattern = patternsData.patterns.find(p => p.archetype === 'Shadow');
      if (shadowPattern) {
        console.log('✅ Shadow archetype successfully detected and tracked!');
      }
    } else {
      console.log('❌ No archetypal patterns found');
    }
    
    console.log('\n✅ Archetypal pattern test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Quick test for specific archetype
window.testShadowArchetype = async function() {
  const authToken = localStorage.getItem('auth_token');
  const userId = 'test_user_123';
  
  console.log('Testing Shadow archetype detection...\n');
  
  // Send shadow-themed messages
  const messages = [
    "I hate this part of myself",
    "My shadow side is overwhelming",
    "The darkness within me is scary"
  ];
  
  for (const msg of messages) {
    await fetch('/api/oracle/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ userId, message: msg })
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Check patterns
  const patterns = await fetch('/api/soul-memory/archetypal-patterns', {
    headers: { 'Authorization': `Bearer ${authToken}` }
  }).then(r => r.json());
  
  console.log('Active archetypes:', patterns);
  
  const shadow = patterns.patterns?.find(p => p.archetype === 'Shadow');
  console.log('Shadow archetype:', shadow ? 'ACTIVE ✅' : 'NOT FOUND ❌');
};

// Test multiple archetypes
window.testMultipleArchetypes = async function() {
  const authToken = localStorage.getItem('auth_token');
  const userId = 'test_user_123';
  
  console.log('Testing multiple archetypes...\n');
  
  const archetypeMessages = {
    Shadow: ["I hate this part of myself", "My dark side emerges"],
    Seeker: ["I'm searching for meaning", "What is my purpose?"],
    Warrior: ["I will fight through this", "I need to be strong"],
    Lover: ["I long for deep connection", "My heart yearns for love"],
    Creator: ["I want to create something beautiful", "My artistic vision"]
  };
  
  for (const [archetype, messages] of Object.entries(archetypeMessages)) {
    console.log(`\nTesting ${archetype} archetype...`);
    
    for (const msg of messages) {
      await fetch('/api/oracle/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ userId, message: msg })
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }
  
  // Check all patterns
  const patterns = await fetch('/api/soul-memory/archetypal-patterns', {
    headers: { 'Authorization': `Bearer ${authToken}` }
  }).then(r => r.json());
  
  console.log('\n📊 All active archetypes:');
  patterns.patterns?.forEach(p => {
    console.log(`- ${p.archetype}: ${p.activationCount} activations`);
  });
};

console.log('🎭 Archetypal pattern tests loaded!');
console.log('Test all: testArchetypalPatterns()');
console.log('Test Shadow: testShadowArchetype()');
console.log('Test multiple: testMultipleArchetypes()');

export { testArchetypalPatterns, testShadowArchetype, testMultipleArchetypes };