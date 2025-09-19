#!/usr/bin/env tsx
import readline from "readline";
import { ConversationFixes } from "../lib/oracle/ConversationFixes";

console.log("🎤 ENHANCED MEMORY + LISTENING INTERACTIVE TEST");
console.log("Features: Contextual Selection • Intensity Tracking • Breakthrough Detection • Memory Integration");
console.log("Type your message. Type 'exit' to quit.\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const fixes = new ConversationFixes();
let conversationCount = 0;

function prompt() {
  rl.question("You: ", (input) => {
    if (input.toLowerCase() === "exit") {
      console.log("\n📊 Final Intelligence Report:");
      console.log(fixes.getStats());
      fixes.debugSnapshot();
      rl.close();
      return;
    }

    conversationCount++;

    // Generate enhanced response
    const result = fixes.generateResponse(input);

    console.log("\n🌀 ENHANCED INTELLIGENCE ANALYSIS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Turn ${conversationCount}: "${input}"`);
    console.log(`🎯 Technique: ${result.reason}`);
    console.log(`Maya's Response: ${result.response}`);

    // Show debug info every few turns
    if (conversationCount % 3 === 0) {
      console.log("\n🔍 Intelligence Engine Debug:");
      fixes.debugSnapshot();
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    prompt();
  });
}

console.log("🚀 Enhanced Conversation Intelligence System Active!");
console.log("Try these test scenarios:");
console.log("• 'I'm completely overwhelmed and panicking' (High intensity → Attune)");
console.log("• 'OH! I just realized something!' (Breakthrough → Celebrate)");
console.log("• 'You already asked me that!' (Frustration → Reset)");
console.log("• 'I feel broken because of my ADHD' (Self-blame → Validation)");
console.log("• 'My stomach is churning from stress' (Body symptoms → Mirror)\n");

prompt();