/**
 * Test script for Poetic Greeting Generator
 * Run with: node test-poetic-greetings.js
 */

const { PoeticGreetingGenerator } = require('./dist/services/PoeticGreetingGenerator');
const { poeticBlend, createBlessing } = require('./dist/services/poeticBlender');

const generator = new PoeticGreetingGenerator();

console.log('\n═══════════════════════════════════════════════════════════');
console.log('                 POETIC GREETING TESTS                      ');
console.log('═══════════════════════════════════════════════════════════\n');

// Test 1: Basic greeting with element
console.log('🔥 Test 1: Fire Element Greeting');
console.log('─────────────────────────────────');
const fireContext = {
  lastElement: 'fire',
  lastPhase: 'transformation',
  timeOfDay: 'morning'
};
const fireGreeting = generator.generateGreeting(fireContext);
console.log(fireGreeting);
console.log();

// Test 2: Water element with symbols
console.log('💧 Test 2: Water Element with Moon Symbol');
console.log('─────────────────────────────────────────');
const waterContext = {
  lastElement: 'water',
  lastPhase: 'descent',
  symbols: [
    { label: 'Moon', count: 3 },
    { label: 'River', count: 2 }
  ],
  timeOfDay: 'evening'
};
const waterGreeting = generator.generateGreeting(waterContext);
console.log(waterGreeting);
console.log();

// Test 3: Elemental imbalance
console.log('⚖️ Test 3: Elemental Imbalance');
console.log('────────────────────────────────');
const balanceContext = {
  lastElement: 'air',
  elementalBalance: {
    air: 0.8,
    water: 0.2,
    fire: 0.5,
    earth: 0.3
  },
  daysSinceLastSession: 3
};
const balanceGreeting = generator.generateGreeting(balanceContext);
console.log(balanceGreeting);
console.log();

// Test 4: Symbol-rich context (verse style)
console.log('✨ Test 4: Symbol-Rich Journey (Verse Style)');
console.log('──────────────────────────────────────────');
const symbolRichContext = {
  lastElement: 'aether',
  lastPhase: 'integration',
  symbols: [
    { label: 'Phoenix', count: 5 },
    { label: 'Stag', count: 4 },
    { label: 'Tree', count: 3 }
  ],
  narrativeThreads: ['transformation', 'healing']
};
const verseGreeting = generator.generateGreeting(symbolRichContext);
console.log(verseGreeting);
console.log();

// Test 5: Returning after absence
console.log('🌙 Test 5: Returning After Time Away');
console.log('───────────────────────────────────');
const returnContext = {
  lastElement: 'earth',
  lastPhase: 'return',
  daysSinceLastSession: 14,
  symbols: [{ label: 'Mountain', count: 2 }]
};
const returnGreeting = generator.generateGreeting(returnContext);
console.log(returnGreeting);
console.log();

// Test 6: Ritual opening
console.log('🕯 Test 6: Ritual Opening');
console.log('────────────────────────');
const ritualContext = {
  lastElement: 'fire',
  symbols: [{ label: 'Phoenix', count: 1 }]
};
const ritualOpening = generator.generateRitualOpening(ritualContext);
console.log(ritualOpening);
console.log();

// Test 7: Journey summary
console.log('📜 Test 7: Journey Summary');
console.log('─────────────────────────');
const summaryContext = {
  sessionCount: 12,
  dominantSymbols: ['Moon', 'River', 'Tree'],
  dominantElements: ['water', 'earth'],
  lastElement: 'water'
};
const summary = generator.generateJourneySummary(summaryContext);
console.log(summary);
console.log();

// Test 8: Direct blending examples
console.log('🎨 Test 8: Poetic Blending Examples');
console.log('──────────────────────────────────');

const lines = [
  "Waters ripple in your story — emotions moving you inward",
  "You walk the descent — deeper waters, hidden truths",
  "The Moon rises again in your journey, calling you to trust your cycles"
];

console.log('Prose blend:');
const proseBlend = poeticBlend(lines, { style: 'prose' });
console.log(proseBlend);
console.log();

console.log('Verse blend:');
const verseBlend = poeticBlend(lines, { style: 'verse' });
console.log(verseBlend);
console.log();

console.log('Haiku blend:');
const haikuBlend = poeticBlend(lines, { style: 'haiku' });
console.log(haikuBlend);
console.log();

// Test 9: Blessing generation
console.log('🙏 Test 9: Elemental Blessings');
console.log('──────────────────────────────');
const fireBlessing = createBlessing(['fire']);
console.log('Fire blessing:', fireBlessing);
const waterEarthBlessing = createBlessing(['water', 'earth']);
console.log('Water/Earth blessing:', waterEarthBlessing);
console.log();

// Test 10: Multiple generations to test variety
console.log('🔄 Test 10: Variety Test (5 greetings, same context)');
console.log('────────────────────────────────────────────────────');
const varietyContext = {
  lastElement: 'water',
  lastPhase: 'transformation',
  symbols: [{ label: 'Phoenix', count: 2 }]
};

for (let i = 1; i <= 5; i++) {
  console.log(`\n${i}. ${generator.generateGreeting(varietyContext)}`);
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('                    TESTS COMPLETE                          ');
console.log('═══════════════════════════════════════════════════════════\n');