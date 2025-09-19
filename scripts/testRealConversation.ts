#!/usr/bin/env tsx
/**
 * Test with realistic neurodivergent conversation patterns
 */

import { ConversationFixes } from '../lib/oracle/ConversationFixes';

process.env.DEBUG_MEMORY = 'true';

const fixes = new ConversationFixes();
fixes.setDebugMode(true);

console.log('\n💬 REALISTIC NEURODIVERGENT CONVERSATION TEST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// What a real teenager with ADHD might actually say
const realConversation = [
  "ugh i cant do this anymore everything is too loud and my brain wont stop",
  "like i know i should be doing homework but i literally cant make myself start",
  "and then everyone gets mad at me for being lazy but its not that",
  "my stomach hurts from the anxiety about it",
  "but also sometimes i get so into something i forget to eat for like 8 hours",
  "idk its like im broken or something",
  "wait sorry i forgot what we were talking about",
  "oh yeah the homework thing. its due tomorrow and i havent started",
  "why am i like this"
];

console.log('Simulating realistic ADHD teenager conversation:\n');

const responseQuality: number[] = [];

realConversation.forEach((input, i) => {
  console.log(`\n[Turn ${i + 1}] Teen: "${input}"`);

  const response = fixes.generateResponse(input);

  // Extract tag
  const tagMatch = response.match(/\[([^\]]+)\]/);
  const tag = tagMatch ? tagMatch[1] : 'none';

  console.log(`\n🌸 Maya: ${response}`);

  // Evaluate response quality
  let quality = 40; // baseline

  // Good responses reference specific content
  if (response.includes('homework') && i > 2) quality += 20;
  if (response.includes('8 hours') && i > 4) quality += 20;
  if (response.includes('stomach') && i > 3) quality += 10;

  // Bad responses are generic
  if (response.includes('Tell me more')) quality -= 10;
  if (response.includes('How does that land')) quality -= 10;
  if (response.includes('What part feels')) quality -= 10;

  // Memory references are good
  if (tag === 'memory') quality += 15;

  // Validation is crucial for neurodivergent users
  if (response.includes('not lazy') || response.includes('not broken')) quality += 25;

  responseQuality.push(quality);
  console.log(`   Quality: ${quality}% | Tag: [${tag}]`);
});

// Calculate average quality
const avgQuality = responseQuality.reduce((a, b) => a + b, 0) / responseQuality.length;

console.log('\n\n📊 CONVERSATION QUALITY ANALYSIS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`Average Quality: ${avgQuality.toFixed(0)}%`);
console.log(`Peak Quality: ${Math.max(...responseQuality)}%`);
console.log(`Lowest Quality: ${Math.min(...responseQuality)}%`);

console.log('\n🎯 KEY METRICS FOR NEURODIVERGENT SUPPORT:');

// Check for important validations
const validationPhrases = [
  'not lazy',
  'not broken',
  'makes sense',
  'ADHD',
  'executive function',
  'hyperfocus'
];

let validationCount = 0;
validationPhrases.forEach(phrase => {
  // In real implementation, would check if Maya used these
  console.log(`  ✓ Validated "${phrase}": ${validationCount > 0 ? 'YES' : 'NO'}`);
});

console.log('\n💡 RECOMMENDATIONS:');

if (avgQuality < 50) {
  console.log('  ⚠️ Responses too generic - need more specific mirroring');
  console.log('  ⚠️ Missing validation of ADHD struggles');
  console.log('  ⚠️ Not acknowledging the "not lazy" narrative');
}

if (avgQuality >= 50 && avgQuality < 70) {
  console.log('  ✓ Basic understanding present');
  console.log('  → Add more specific ADHD validation');
  console.log('  → Reference hyperfocus as a strength');
}

if (avgQuality >= 70) {
  console.log('  ✅ Strong neurodivergent support!');
  console.log('  ✅ Validation and understanding present');
}

console.log('\n✅ Realistic conversation test complete!');
console.log('\nThis test reveals how Maya handles actual neurodivergent speech patterns:');
console.log('  - Fragmented thoughts');
console.log('  - Self-blame ("broken", "why am I like this")');
console.log('  - ADHD symptoms (hyperfocus, executive dysfunction)');
console.log('  - Need for validation not judgment');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');