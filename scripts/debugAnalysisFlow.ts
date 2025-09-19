#!/usr/bin/env tsx
/**
 * Debug Analysis → Response Flow
 * Trace exactly where analysis gets lost
 */

import { ConversationFixes } from '../lib/oracle/ConversationFixes';
import { ActiveListeningCore } from '../lib/oracle/ActiveListeningCore';

process.env.DEBUG_MEMORY = 'true';

const fixes = new ConversationFixes();
const activeListening = new ActiveListeningCore();

console.log('🔍 DEBUGGING ANALYSIS → RESPONSE FLOW');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

/**
 * Test the complete flow with debug logging
 */
function debugAnalysisFlow(userInput: string) {
  console.log(`\n🎯 STEP 1 - Input: "${userInput}"`);

  // Active Listening Analysis
  const listeningAnalysis = activeListening.listen(userInput);
  console.log('🎯 STEP 2 - Analysis Output:', {
    technique: listeningAnalysis?.technique?.type,
    element: listeningAnalysis?.technique?.element,
    suggestedResponse: listeningAnalysis?.response,
    confidence: listeningAnalysis?.technique?.confidence
  });

  // Response Generation
  const mayaResponse = fixes.generateResponse(userInput);
  console.log('🎯 STEP 3 - Response Selected:', {
    responseText: mayaResponse.response,
    responseReason: mayaResponse.reason
  });

  // CRITICAL CHECK
  const analysisWanted = listeningAnalysis?.technique?.type || 'none';
  const responseDelivered = mayaResponse.reason?.includes('mirror') ? 'mirror' :
                          mayaResponse.reason?.includes('clarify') ? 'clarify' :
                          mayaResponse.reason?.includes('attune') ? 'attune' :
                          mayaResponse.reason?.includes('hold_space') ? 'hold_space' : 'other';

  console.log('❌ MISMATCH CHECK:', {
    analysisWanted,
    responseDelivered,
    MATCH: analysisWanted === responseDelivered,
    confidence: listeningAnalysis?.technique?.confidence || 0
  });

  console.log('─────────────────────────────────────────────────');
}

/**
 * Test cases to identify the disconnect
 */
const testCases = [
  // Should trigger mirroring
  "I feel overwhelmed by everything",
  "I keep going in circles",
  "I'm not enough",

  // Should trigger attunement
  "I feel anxious about the future",
  "There's a heavy feeling in my chest",

  // Should trigger clarification
  "I don't know what to do",
  "It's all confusing",

  // Memory test (check for hallucination)
  "My stomach hurts from anxiety",
  "I'm feeling better now"
];

console.log('Testing analysis → response connection...\n');

testCases.forEach((testCase, index) => {
  console.log(`\n📋 TEST CASE ${index + 1}`);
  debugAnalysisFlow(testCase);
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 SUMMARY: Look for mismatches where analysis suggests one technique but response delivers another');