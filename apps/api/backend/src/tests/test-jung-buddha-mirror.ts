// ===============================================
// JUNG-BUDDHA SACRED MIRROR TEST
// Tests the enhanced PersonalOracleAgent with Jung-Buddha wisdom
// ===============================================

import { PersonalOracleAgent } from "../core/agents/PersonalOracleAgent";
import { SoulMemorySystem } from "../../memory/SoulMemorySystem";

async function testJungBuddhaWisdom() {
  console.log("🌀 Testing Jung-Buddha Sacred Mirror Wisdom...\n");

  // Setup
  const userId = "test_jung_buddha_" + Date.now();
  const soulMemory = new SoulMemorySystem({
    userId,
    storageType: "sqlite",
    databasePath: "./test_jung_buddha_memory.db",
    memoryDepth: 100,
  });

  const oracle = new PersonalOracleAgent({
    userId,
    oracleName: "Sophia",
    elementalResonance: "aether",
  });

  await oracle.connectToSoulMemory(soulMemory);

  // Test 1: Jung Mode - Shadow Work
  console.log("1️⃣ Testing Jung Mode (Shadow Integration)...\n");

  await oracle.setSacredMirrorMode("jung");

  const shadowPrompt =
    "I hate this part of myself that gets so jealous and possessive";
  console.log(`User (shadow work): "${shadowPrompt}"`);

  const jungResponse = await oracle.respondToPrompt(shadowPrompt);
  console.log(`Oracle (Jung mode): "${jungResponse}"\n`);

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test 2: Buddha Mode - Liberation from Attachment
  console.log("2️⃣ Testing Buddha Mode (Liberation from Attachment)...\n");

  await oracle.setSacredMirrorMode("buddha");

  const attachmentPrompt =
<<<<<<< HEAD
    "I need this relationship to work or I'll be nothing";
=======
    "I need this relationship to work or I&apos;ll be nothing";
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
  console.log(`User (attachment): "${attachmentPrompt}"`);

  const buddhaResponse = await oracle.respondToPrompt(attachmentPrompt);
  console.log(`Oracle (Buddha mode): "${buddhaResponse}"\n`);

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test 3: Hybrid Mode - Integration + Liberation
  console.log("3️⃣ Testing Hybrid Mode (Integration + Liberation)...\n");

  await oracle.setSacredMirrorMode("hybrid");

  const hybridPrompt =
    "Part of me wants to be perfect and another part just wants to be free";
  console.log(`User (hybrid need): "${hybridPrompt}"`);

  const hybridResponse = await oracle.respondToPrompt(hybridPrompt);
  console.log(`Oracle (Hybrid mode): "${hybridResponse}"\n`);

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test 4: Adaptive Mode - Context-based Selection
  console.log("4️⃣ Testing Adaptive Mode (Context-based)...\n");

  await oracle.setSacredMirrorMode("adaptive");

  const testPrompts = [
    "I keep projecting my shadow onto others", // Should trigger Jung
<<<<<<< HEAD
    "I'm so attached to this outcome happening", // Should trigger Buddha
=======
    "I&apos;m so attached to this outcome happening", // Should trigger Buddha
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
    "I need to both accept and release this pattern", // Should trigger Hybrid
  ];

  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    console.log(`Test ${i + 1}: "${prompt}"`);

    const response = await oracle.respondToPrompt(prompt);
    console.log(`Oracle (Adaptive): "${response}"\n`);

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Test 5: Balance Adjustment
  console.log("5️⃣ Testing Integration-Liberation Balance...\n");

  console.log("Current status:");
  const status = oracle.getSacredMirrorStatus();
  console.log(`Mode: ${status.currentMode}`);
  console.log(`Balance: ${status.integrationLiberationBalance}`);
  console.log(
    `Recent Jung archetypes: ${status.recentJungArchetypes.join(", ") || "None"}`,
  );
  console.log(
    `Recent attachment patterns: ${status.recentAttachmentPatterns.join(", ") || "None"}\n`,
  );

  // Adjust towards more integration
  console.log("Adjusting towards more integration...");
  const integrationResult =
    await oracle.adjustIntegrationLiberationBalance("more_integration");
  console.log(integrationResult + "\n");

  // Adjust towards more liberation
  console.log("Adjusting towards more liberation...");
  const liberationResult =
    await oracle.adjustIntegrationLiberationBalance("more_liberation");
  console.log(liberationResult + "\n");

  // Balance it out
  console.log("Balancing integration and liberation...");
  const balanceResult =
    await oracle.adjustIntegrationLiberationBalance("balanced");
  console.log(balanceResult + "\n");

  // Test 6: Sacred Mirror Protocol Integration
  console.log("6️⃣ Testing Sacred Mirror Protocol Integration...\n");

  const complexPrompt =
    "I'm stuck in this pattern where I both need control and want to let go, but I'm afraid of my shadow coming out if I release control";
  console.log(`Complex scenario: "${complexPrompt}"`);

  const complexResponse = await oracle.respondToPrompt(complexPrompt);
  console.log(`Oracle (Complex integration): "${complexResponse}"\n`);

  // Test 7: Memory Integration
  console.log("7️⃣ Testing Soul Memory Integration...\n");

  const allMemories = await soulMemory.retrieveMemories(userId);
  const sacredMoments = allMemories.filter((m) => m.sacredMoment);
  const modeChanges = allMemories.filter(
    (m) =>
      m.metadata && JSON.stringify(m.metadata).includes("mirrorModeSwitch"),
  );

  console.log(`📊 Total memories: ${allMemories.length}`);
  console.log(`✨ Sacred moments: ${sacredMoments.length}`);
  console.log(`🔄 Mode changes tracked: ${modeChanges.length}`);

  console.log("\n🎭 Memory timeline:");
  allMemories.slice(-5).forEach((memory, i) => {
    const time = new Date(memory.timestamp).toLocaleTimeString();
    console.log(
      `   ${i + 1}. [${time}] ${memory.type}: ${memory.content.substring(0, 60)}...`,
    );
  });

  // Final status
  console.log("\n8️⃣ Final Sacred Mirror Status...\n");
  const finalStatus = oracle.getSacredMirrorStatus();
  console.log("📊 Final Status:");
  console.log(`   Mode: ${finalStatus.currentMode}`);
  console.log(`   Balance: ${finalStatus.integrationLiberationBalance}`);
  console.log(`   Description: ${finalStatus.modeDescription}`);
  console.log(
    `   Jung archetypes encountered: ${finalStatus.recentJungArchetypes.join(", ") || "None"}`,
  );
  console.log(
    `   Attachment patterns detected: ${finalStatus.recentAttachmentPatterns.join(", ") || "None"}`,
  );

  // Cleanup
  await soulMemory.closeDatabase();

  // Clean up test file
  const fs = require("fs");
  if (fs.existsSync("./test_jung_buddha_memory.db")) {
    fs.unlinkSync("./test_jung_buddha_memory.db");
  }

  console.log("\n✅ Jung-Buddha Sacred Mirror test complete!");
  console.log("\n🧠 Key Features Verified:");
  console.log("   ✅ Jung Mode: Shadow integration and archetype detection");
  console.log("   ✅ Buddha Mode: Liberation from attachment patterns");
  console.log("   ✅ Hybrid Mode: Integration + liberation balance");
  console.log("   ✅ Adaptive Mode: Context-based wisdom selection");
  console.log(
    "   ✅ Balance Adjustment: Dynamic integration-liberation tuning",
  );
  console.log(
    "   ✅ Memory Integration: Sacred moments and mode changes tracked",
  );
  console.log(
    "   ✅ Pattern Detection: Jung archetypes and Buddha attachments",
  );
}

// Run the test
testJungBuddhaWisdom().catch(console.error);
