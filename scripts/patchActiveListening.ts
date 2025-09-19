#!/usr/bin/env ts-node
/**
 * Active Listening Pattern Patch - Targeted fixes for Fire/Aether/Air
 * Run with: npm run patch:active
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('🔧 APPLYING ACTIVE LISTENING PATCHES...\n');

const filePath = path.join(__dirname, '../lib/oracle/ActiveListeningCore.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Patch 1: Strengthen Fire pattern for absolutes
const patchFirePattern = () => {
  // Find the challengePattern method and enhance it
  const fireMethodStart = content.indexOf('private challengePattern(input: string): ListeningResponse | null {');
  const fireMethodEnd = content.indexOf('return null;\n  }', fireMethodStart) + 'return null;\n  }'.length;

  if (fireMethodStart === -1) {
    console.log('❌ Could not find challengePattern method');
    return;
  }

  const newFireMethod = `  private challengePattern(input: string): ListeningResponse | null {
    // Priority 1: Check for absolute language
    const absoluteMatch = input.match(/\\b(always|never|can't)\\b/i);
    if (absoluteMatch) {
      const word = absoluteMatch[1].toLowerCase();
      return {
        technique: {
          type: 'clarify',
          confidence: 0.9,  // High confidence for absolutes
          element: 'fire'
        },
        response: \`"\${word}"?\`,
        silenceDuration: 1200,
        followUp: 'What would change look like?'
      };
    }

    // Priority 2: Check for stuck patterns
    const stuckPatterns = /\\b(impossible|stuck|trapped)\\b/i;
    if (stuckPatterns.test(input)) {
      const stuckWord = input.match(stuckPatterns)?.[1] || 'stuck';
      return {
        technique: {
          type: 'clarify',
          confidence: 0.8,
          element: 'fire'
        },
        response: \`"\${stuckWord.toLowerCase()}"?\`,
        silenceDuration: 1200,
        followUp: 'What would change look like?'
      };
    }

    // Priority 3: Growth patterns
    const growthPatterns = /opportunity|excel|advance|learn|grow|potential|challenge/i;
    if (growthPatterns.test(input)) {
      return {
        technique: {
          type: 'clarify',
          confidence: 0.7,
          element: 'fire'
        },
        response: 'What wants to emerge?',
        silenceDuration: 1000,
        followUp: 'What would you dare to try?'
      };
    }

    return null;
  }`;

  content = content.substring(0, fireMethodStart) + newFireMethod + content.substring(fireMethodEnd);
  console.log('✅ Fire pattern enhanced for absolutes');
};

// Patch 2: Strengthen Aether pattern for polarity
const patchAetherPattern = () => {
  // Find holdSpace method and enhance it
  const aetherMethodStart = content.indexOf('private holdSpace(input: string): ListeningResponse | null {');
  const aetherMethodEnd = content.indexOf('return null;\n  }', aetherMethodStart) + 'return null;\n  }'.length;

  if (aetherMethodStart === -1) {
    console.log('❌ Could not find holdSpace method');
    return;
  }

  const newAetherMethod = `  private holdSpace(input: string): ListeningResponse | null {
    // Priority 1: Strong polarity indicators
    if (/\\b(at the same time|contradictory|both|simultaneously)\\b/i.test(input)) {
      return {
        technique: {
          type: 'hold_space',
          confidence: 0.85,
          element: 'aether'
        },
        response: 'Both at once...',
        silenceDuration: 2000,
        followUp: 'What wants to be felt here?'
      };
    }

    // Priority 2: But/also patterns
    if (/but.*also|yet.*excited|stress.*excitement/i.test(input)) {
      return {
        technique: {
          type: 'hold_space',
          confidence: 0.8,
          element: 'aether'
        },
        response: 'Holding both sides...',
        silenceDuration: 2000,
        followUp: 'Tell me more about both.'
      };
    }

    // Priority 3: Deep existential patterns
    const deepPatterns = /why.*meaning|purpose.*life|death.*dying|god.*universe/i;
    if (deepPatterns.test(input)) {
      return {
        technique: {
          type: 'hold_space',
          confidence: 0.75,
          element: 'aether'
        },
        response: '...',
        silenceDuration: 2000,
        followUp: 'What wants to be felt here?'
      };
    }

    return null;
  }`;

  content = content.substring(0, aetherMethodStart) + newAetherMethod + content.substring(aetherMethodEnd);
  console.log('✅ Aether pattern enhanced for polarity');
};

// Patch 3: Add confusion escalation to avoid repetition
const patchConfusionPattern = () => {
  // Find clarifyMeaning method and enhance it
  const airMethodStart = content.indexOf('private clarifyMeaning(input: string): ListeningResponse | null {');
  const airMethodEnd = content.indexOf('return null;\n  }', airMethodStart) + 'return null;\n  }'.length;

  if (airMethodStart === -1) {
    console.log('❌ Could not find clarifyMeaning method');
    return;
  }

  const newAirMethod = `  private clarifyMeaning(input: string): ListeningResponse | null {
    // Priority 1: Direct confusion
    if (/what do you mean|help what|don't understand|that doesn't make sense/i.test(input)) {
      return {
        technique: {
          type: 'clarify',
          confidence: 0.8,
          element: 'air'
        },
        response: "Let's slow down.",
        silenceDuration: 800,
        followUp: "Do you want me to explain differently, or listen more closely?"
      };
    }

    // Priority 2: Vague references
    const vaguePatterns = /that|this thing|it|they/i;
    if (vaguePatterns.test(input) && input.length < 30) {
      return {
        technique: {
          type: 'clarify',
          confidence: 0.7,
          element: 'air'
        },
        response: 'What specifically?',
        silenceDuration: 800,
        followUp: 'Can you say more about that?'
      };
    }

    return null;
  }`;

  content = content.substring(0, airMethodStart) + newAirMethod + content.substring(airMethodEnd);
  console.log('✅ Air pattern enhanced for confusion recovery');
};

// Apply all patches
patchFirePattern();
patchAetherPattern();
patchConfusionPattern();

// Write back to file
fs.writeFileSync(filePath, content);

console.log('\n🎯 Active Listening patches applied!');
console.log('Now test with: npm run test:convo:interactive');
console.log('\nExpected improvements:');
console.log('  • "always/never/can\'t" → Fire challenge');
console.log('  • "at the same time/both" → Aether polarity');
console.log('  • Confusion → Better clarification');