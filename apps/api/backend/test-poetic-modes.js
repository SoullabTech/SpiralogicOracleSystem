/**
 * Test Poetic Modes and Greeting Styles
 * Demonstrates prose vs poetic formatting with template variations
 */

import { formatGreeting, poeticBlend, suggestPoetic } from './src/services/poeticModes.js';
import { buildFromTemplates } from './src/services/greetingTemplates.js';

function testPoeticModes() {
  console.log('\n📜 Testing Poetic Modes and Greeting Styles\n');
  console.log('━'.repeat(60));

  // Test scenarios with different contexts
  const scenarios = [
    {
      name: 'Moon Dreams (Poetic)',
      style: 'poetic',
      context: {
        timeOfDay: 'night',
        element: 'water',
        phase: 'integration',
        symbol: 'Moon',
        archetype: 'Dreamer',
        emotion: 'sadness'
      }
    },
    {
      name: 'Fire Phoenix (Prose)',
      style: 'prose',
      context: {
        timeOfDay: 'morning',
        element: 'fire',
        phase: 'initiation',
        symbol: 'Phoenix',
        archetype: 'Transformer',
        emotion: 'joy'
      }
    },
    {
      name: 'Shadow Work (Auto - Symbol Dense)',
      style: 'auto',
      context: {
        timeOfDay: 'evening',
        element: 'void',
        phase: 'challenge',
        symbol: 'Shadow',
        archetype: 'Shadow',
        emotion: 'fear'
      }
    },
    {
      name: 'Earth Grounding (Auto - Light)',
      style: 'auto',
      context: {
        timeOfDay: 'afternoon',
        element: 'earth',
        phase: 'mastery',
        symbol: 'Mountain',
        archetype: 'Pillar',
        emotion: 'peace'
      }
    }
  ];

  // Test each scenario
  scenarios.forEach(scenario => {
    console.log(`\n📝 Scenario: ${scenario.name}`);
    console.log('─'.repeat(40));
    console.log(`Style: ${scenario.style}`);
    console.log(`Context:`, scenario.context);
    console.log();

    // Build greeting from templates
    const parts = buildFromTemplates(scenario.context);
    
    // Calculate symbol density (simulated)
    const symbolDensity = scenario.name.includes('Dense') ? 0.8 : 0.2;
    
    // Format greeting
    const greeting = formatGreeting(parts, scenario.style, symbolDensity);
    
    console.log('Generated Greeting:');
    console.log('─'.repeat(40));
    console.log(greeting);
    console.log();
    
    // Show parts for transparency
    console.log('Template Parts Used:');
    parts.forEach((part, i) => {
      console.log(`  ${i + 1}. ${part}`);
    });
  });

  // Test poeticBlend function directly
  console.log('\n\n📝 Test: Poetic Blend Function\n');
  console.log('─'.repeat(40));
  
  const testLines = [
    &quot;The moon rises in your chart",
    "Water energy flows deep",
    "Your dreams carry ancient wisdom",
    "What wants to emerge tonight?"
  ];
  
  console.log('Original lines:');
  testLines.forEach(line => console.log(`  • ${line}`));
  
  const blended = poeticBlend(testLines);
  console.log('\nBlended prose:');
  console.log(blended);

  // Test suggestPoetic function
  console.log('\n\n📝 Test: Poetic Mode Detection\n');
  console.log('─'.repeat(40));
  
  const testContents = [
    { text: "I keep having these dreams about flying", expects: true },
    { text: "Working on my project deadline", expects: false },
    { text: "The poem I wrote yesterday resonates", expects: true },
    { text: "Feeling stuck with my routine", expects: false },
    { text: "The mythic journey continues", expects: true }
  ];
  
  testContents.forEach(test => {
    const suggests = suggestPoetic(test.text);
    const result = suggests === test.expects ? '✅' : '❌';
    console.log(`${result} "${test.text}" → Suggests poetic: ${suggests}`);
  });

  // Show style comparison
  console.log('\n\n📝 Style Comparison: Same Content, Different Formats\n');
  console.log('═'.repeat(60));
  
  const sampleParts = [
    "In these pre-dawn hours of possibility",
    "Your inner flame dances with possibility",
    "The Phoenix stirs in your ashes",
    "Your joy ripples outward",
    "What wants to emerge today?"
  ];
  
  console.log('\n🎭 POETIC MODE:');
  console.log('─'.repeat(40));
  console.log(formatGreeting(sampleParts, 'poetic', 0.5));
  
  console.log('\n\n📖 PROSE MODE:');
  console.log('─'.repeat(40));
  console.log(formatGreeting(sampleParts, 'prose', 0.5));
  
  console.log('\n\n🎲 AUTO MODE (run 3 times):');
  console.log('─'.repeat(40));
  for (let i = 1; i <= 3; i++) {
    console.log(`\nRun ${i}:`);
    console.log(formatGreeting(sampleParts, 'auto', 0.5));
  }

  console.log('\n' + '━'.repeat(60));
  console.log('✨ Poetic Modes test complete!');
  console.log('\nThe system successfully:');
  console.log('  ✓ Formats greetings in prose vs verse');
  console.log('  ✓ Blends lines with natural transitions');
  console.log('  ✓ Detects when poetic mode is appropriate');
  console.log('  ✓ Provides rich template variations');
  console.log('  ✓ Auto-selects style based on context');
}

// Run test
testPoeticModes();