/**
 * 🧪 PTSD/Low Self-Esteem Test Script
 * Testing Maya's ability to hold both strengths and wounds simultaneously
 */

import { conversationFixes } from "../lib/oracle/ConversationFixes";

const scenario = [
  "I'm exhausted trying to keep everything together for my kids.",
  "Sometimes I feel like I'm failing them because I can't do it all.",
  "I used to be so creative but now I just feel stuck.",
  "My husband doesn't notice how much I do and it makes me feel invisible.",
  "I know I could help other women but who am I to think I can make a difference?",
  "I feel broken from the trauma and low confidence.",
];

// Expected outcomes we're testing for:
const expectedValidations = [
  "Exhaustion recognition + body awareness",
  "Reframe 'failing' narrative + validate effort",
  "Honor creative past + present state",
  "Validate invisibility feeling + recognize care",
  "Bridge desire to help with self-doubt",
  "Reject 'broken' label + trauma understanding"
];

const expectedMemoryRecall = [
  "Track: body exhaustion",
  "Track: self-judgment patterns",
  "Track: creative identity + current state",
  "Track: relationship dynamics + feeling invisible",
  "Track: helping instinct + confidence wounds",
  "Reference: exhaustion, invisibility, creativity"
];

console.log("🧪 TEST: Mother of Two w/ PTSD & Low Self-Esteem");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("Testing validation library, memory recall, elemental balance, response weaving\n");

// Reset conversation state
conversationFixes.reset();

scenario.forEach((input, i) => {
  console.log(`\n🔄 Turn ${i + 1}`);
  console.log(`Expected validation: ${expectedValidations[i]}`);
  console.log(`Expected memory: ${expectedMemoryRecall[i]}`);
  console.log("─".repeat(60));

  console.log(`You: "${input}"`);

  const result = conversationFixes.generateResponse(input);
  console.log(`Maya: ${result.response}`);
  console.log(`Reason: ${result.reason}`);

  // Check for key validation patterns
  const response = result.response.toLowerCase();

  // Basic validation checks
  const validationChecks = {
    rejectsNegativeLabels: !response.includes('you are failing') && !response.includes('you are broken'),
    offersReframe: response.includes('not') || response.includes('actually') || response.includes('rather'),
    acknowledgesEffort: response.includes('trying') || response.includes('effort') || response.includes('doing'),
    holdsParadox: response.includes('and') || response.includes('both') || response.includes('also')
  };

  console.log(`Validation check: ${Object.entries(validationChecks).map(([k,v]) => `${k}:${v ? '✓' : '✗'}`).join(' ')}`);
});

console.log("\n" + "━".repeat(60));
console.log("🔍 CONVERSATION INTELLIGENCE DEBUG");
conversationFixes.debugSnapshot();

console.log("\n📊 FINAL STATS");
console.log(conversationFixes.getStats());

console.log("\n🎯 TESTING COMPLETE");
console.log("✓ Validation Library: Does Maya reject harmful self-labels?");
console.log("✓ Memory Recall: Does Maya reference earlier emotional cues?");
console.log("✓ Elemental Balance: Does Maya address body, emotion, beliefs, potential?");
console.log("✓ Response Weaving: Does Maya hold paradox (strengths + wounds)?");