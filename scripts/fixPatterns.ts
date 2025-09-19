#!/usr/bin/env ts-node
/**
 * Pattern Fix Script - Hot patches for elemental detection
 * Run with: npm run patch:patterns
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('🔧 APPLYING PATTERN FIXES...\n');

// Fix 1: Strengthen Fire pattern detection
const fixFirePattern = () => {
  const filePath = path.join(__dirname, '../lib/oracle/ActiveListeningCore.ts');
  let content = fs.readFileSync(filePath, 'utf8');

  // Make Fire pattern more aggressive
  const firePatternOld = `    const stuckPatterns = /always|never|can't|impossible|stuck|trapped/i;`;
  const firePatternNew = `    const stuckPatterns = /\\b(always|never|can't|impossible|stuck|trapped)\\b/i;`;

  if (content.includes(firePatternOld)) {
    content = content.replace(firePatternOld, firePatternNew);
    fs.writeFileSync(filePath, content);
    console.log('✅ Fire pattern detection strengthened');
  } else {
    console.log('⚠️  Fire pattern already updated or not found');
  }
};

// Fix 2: Strengthen Aether pattern detection
const fixAetherPattern = () => {
  const filePath = path.join(__dirname, '../lib/oracle/ActiveListeningCore.ts');
  let content = fs.readFileSync(filePath, 'utf8');

  // Make Aether pattern more comprehensive
  const aetherPatternOld = `    const polarityPatterns = /contradictory|both.*and|stress.*excitement|mixed.*feelings|at the same time|but.*also/i;`;
  const aetherPatternNew = `    const polarityPatterns = /contradictory|both|at the same time|but.*also|simultaneously|yet|paradox/i;`;

  if (content.includes(aetherPatternOld)) {
    content = content.replace(aetherPatternOld, aetherPatternNew);
    fs.writeFileSync(filePath, content);
    console.log('✅ Aether pattern detection enhanced');
  } else {
    console.log('⚠️  Aether pattern already updated or not found');
  }
};

// Fix 3: Fix duplicate token extraction
const fixDuplicateTokens = () => {
  const filePath = path.join(__dirname, '../lib/oracle/MayaOrchestrator.ts');
  let content = fs.readFileSync(filePath, 'utf8');

  // Add deduplication to confusion response
  const confusionOld = `      if (topics.length > 0) {
        return this.createResponse(\`Let me clarify - you mentioned \${topics.join(' and ')}. What would you like to explore about that?\`);
      }`;

  const confusionNew = `      if (topics.length > 0) {
        // Remove duplicates and clean up
        const uniqueTopics = [...new Set(topics)].filter(t => t && t !== 'where');
        return this.createResponse(\`Let me clarify - you mentioned \${uniqueTopics.join(' and ')}. What would you like to explore about that?\`);
      }`;

  if (content.includes(confusionOld)) {
    content = content.replace(confusionOld, confusionNew);
    fs.writeFileSync(filePath, content);
    console.log('✅ Duplicate token bug fixed');
  } else {
    console.log('⚠️  Token deduplication already applied or not found');
  }
};

// Fix 4: Ensure pattern priority order
const fixPatternPriority = () => {
  const filePath = path.join(__dirname, '../lib/oracle/ActiveListeningCore.ts');
  let content = fs.readFileSync(filePath, 'utf8');

  // Ensure Fire and Aether are checked before Water
  const priorityOld = `    const techniques = [
      this.holdSpace(input),
      this.challengePattern(input),  // Check Fire patterns before Water
      this.attuneToEmotion(input),
      this.clarifyMeaning(input),
      this.mirrorKeyWords(input)
    ];`;

  const priorityNew = `    const techniques = [
      this.challengePattern(input),  // Fire - Check limiting beliefs first
      this.holdSpace(input),         // Aether - Check polarity second
      this.attuneToEmotion(input),   // Water - Emotions third
      this.clarifyMeaning(input),    // Air - Clarity fourth
      this.mirrorKeyWords(input)     // Earth - Mirror last
    ];`;

  if (content.includes(priorityOld)) {
    content = content.replace(priorityOld, priorityNew);
    fs.writeFileSync(filePath, content);
    console.log('✅ Pattern priority order optimized');
  } else {
    console.log('⚠️  Pattern priority already optimized or not found');
  }
};

// Apply all fixes
fixFirePattern();
fixAetherPattern();
fixDuplicateTokens();
fixPatternPriority();

console.log('\n🎯 Pattern fixes applied!');
console.log('Test with: npm run test:convo:interactive');