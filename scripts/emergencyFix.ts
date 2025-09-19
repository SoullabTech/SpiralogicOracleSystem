#!/usr/bin/env ts-node
/**
 * Emergency Fix - Repair broken response pipeline
 * Run with: npx tsx scripts/emergencyFix.ts
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('🚨 APPLYING EMERGENCY FIXES...\n');

// Fix 1: Repair topic extraction to exclude pronouns and stop words
const fixTopicExtraction = () => {
  const filePath = path.join(__dirname, '../lib/oracle/MayaOrchestrator.ts');
  let content = fs.readFileSync(filePath, 'utf8');

  // Find and replace the broken extractTopics method
  const extractTopicsStart = content.indexOf('private extractTopics(input: string): string[]');
  const extractTopicsEnd = content.indexOf('return Array.from(topics);', extractTopicsStart) + 'return Array.from(topics);'.length + 3;

  if (extractTopicsStart === -1) {
    console.log('❌ Could not find extractTopics method');
    return;
  }

  const newExtractTopics = `private extractTopics(input: string): string[] {
    const topics = new Set<string>();

    // Stop words to exclude
    const stopWords = new Set(['i', 'me', 'my', 'you', 'your', 'where', 'what', 'when',
      'who', 'why', 'how', 'the', 'a', 'an', 'and', 'or', 'but', 'is', 'was', 'are',
      'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'it', 'that', 'this', 'they', 'them', 'there']);

    // Look for meaningful content words
    const words = input.toLowerCase().split(/\s+/);

    // Extract nouns and meaningful words
    for (const word of words) {
      // Skip short words, stop words, and punctuation
      if (word.length > 3 && !stopWords.has(word) && /^[a-z]+$/.test(word)) {
        // Check for specific meaningful patterns
        if (word.match(/work|stress|anxiety|adhd|exam|problem|listen|understand|feel|emotion|tired|exhausted|stuck/)) {
          topics.add(word);
        }
      }
    }

    // If no topics found, extract the main theme
    if (topics.size === 0) {
      if (input.toLowerCase().includes('work')) topics.add('work');
      if (input.toLowerCase().includes('stress')) topics.add('stress');
      if (input.toLowerCase().includes('anxiety')) topics.add('anxiety');
      if (input.toLowerCase().includes('adhd')) topics.add('ADHD');
    }

    return Array.from(topics);
  }`;

  content = content.substring(0, extractTopicsStart) + newExtractTopics + content.substring(extractTopicsEnd);
  fs.writeFileSync(filePath, content);
  console.log('✅ Topic extraction fixed - now filters stop words');
};

// Fix 2: Prevent confusion handler from triggering on normal questions
const fixConfusionTrigger = () => {
  const filePath = path.join(__dirname, '../lib/oracle/MayaOrchestrator.ts');
  let content = fs.readFileSync(filePath, 'utf8');

  // Make confusion patterns much more specific
  const oldPattern = `const confusionPatterns = /what does that mean|about what|that doesn't make sense|what|huh|i don't understand|you sound like a robot|aren't really listening/i;`;
  const newPattern = `const confusionPatterns = /what does that mean|that doesn't make sense|i don't understand|you sound like a robot|aren't really listening|help what\\?|what are you saying/i;`;

  if (content.includes(oldPattern)) {
    content = content.replace(oldPattern, newPattern);
    fs.writeFileSync(filePath, content);
    console.log('✅ Confusion trigger fixed - more specific patterns');
  } else {
    console.log('⚠️  Confusion pattern already updated or not found');
  }
};

// Fix 3: Ensure Active Listening responses get through
const fixResponsePipeline = () => {
  const filePath = path.join(__dirname, '../lib/oracle/MayaOrchestrator.ts');
  let content = fs.readFileSync(filePath, 'utf8');

  // Find the speak method and fix the response priority
  const speakMethodPattern = /\/\/ If we have a high-confidence active listening response, use it\s+if \(listeningResponse\.technique\.confidence > 0\.6\)/;

  if (speakMethodPattern.test(content)) {
    // Change confidence threshold from 0.6 to 0.65 and ensure it returns immediately
    content = content.replace(
      /if \(listeningResponse\.technique\.confidence > 0\.6\) \{/g,
      'if (listeningResponse.technique.confidence >= 0.7) {'
    );

    // Ensure the active listening response is properly formatted
    const oldReturn = `return this.createResponse(listeningResponse.response);`;
    const newReturn = `// Use active listening with proper element tracking
      const element = listeningResponse.technique.element;
      return {
        message: listeningResponse.response,
        element: element,
        timestamp: Date.now(),
        userId,
        voiceCharacteristics: this.getVoiceForElement(element)
      };`;

    if (content.includes(oldReturn)) {
      content = content.replace(oldReturn, newReturn);
    }

    fs.writeFileSync(filePath, content);
    console.log('✅ Response pipeline fixed - Active Listening priority restored');
  } else {
    console.log('⚠️  Response pipeline already updated');
  }
};

// Fix 4: Add helper method for voice characteristics
const addVoiceHelper = () => {
  const filePath = path.join(__dirname, '../lib/oracle/MayaOrchestrator.ts');
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if method already exists
  if (!content.includes('private getVoiceForElement')) {
    // Find a good insertion point (after createResponse method)
    const insertPoint = content.indexOf('private extractTopics');

    const voiceHelper = `
  private getVoiceForElement(element: string): any {
    const voiceMapping = {
      fire: { tempo: 'dynamic', pitch: 'rising', energy: 'intense' },
      water: { tempo: 'flowing', pitch: 'gentle', energy: 'soft' },
      earth: { tempo: 'steady', pitch: 'grounded', energy: 'stable' },
      air: { tempo: 'light', pitch: 'curious', energy: 'playful' },
      aether: { tempo: 'spacious', pitch: 'ethereal', energy: 'transcendent' }
    };
    return voiceMapping[element as keyof typeof voiceMapping] || voiceMapping.earth;
  }

  `;

    content = content.substring(0, insertPoint) + voiceHelper + content.substring(insertPoint);
    fs.writeFileSync(filePath, content);
    console.log('✅ Voice helper method added');
  } else {
    console.log('⚠️  Voice helper already exists');
  }
};

// Apply all emergency fixes
console.log('🔧 Applying emergency fixes to repair conversation pipeline...\n');

fixTopicExtraction();
fixConfusionTrigger();
fixResponsePipeline();
addVoiceHelper();

console.log('\n🚨 EMERGENCY FIXES APPLIED!');
console.log('\nKey repairs:');
console.log('  • Topic extraction now filters stop words');
console.log('  • Confusion trigger requires explicit confusion signals');
console.log('  • Active Listening responses properly integrated');
console.log('  • Voice characteristics properly mapped');
console.log('\nTest with: npm run test:convo:interactive');