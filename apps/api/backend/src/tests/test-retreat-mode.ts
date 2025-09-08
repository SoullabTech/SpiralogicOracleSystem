// ===============================================
// RETREAT MODE TEST
// Tests the retreat mode functionality and memory tagging
// ===============================================

import { PersonalOracleAgent } from "../core/agents/PersonalOracleAgent";
import { SoulMemorySystem } from "../../memory/SoulMemorySystem";

async function testRetreatMode() {
  console.log("🏔️ Testing Retreat Mode Functionality...\n");

  // Setup
  const userId = "test_retreat_" + Date.now();
  const soulMemory = new SoulMemorySystem({
    userId,
    storageType: "sqlite",
    databasePath: "./test_retreat_memory.db",
    memoryDepth: 100,
  });

  const oracle = new PersonalOracleAgent({
    userId,
    oracleName: "Aria",
    elementalResonance: "water",
  });

  await oracle.connectToSoulMemory(soulMemory);

  // Test 1: Activate retreat mode
  console.log("1️⃣ Activating retreat mode...\n");

  await oracle.activateRetreatMode("retreat-active");
  console.log("✅ Retreat mode activated: retreat-active\n");

  // Wait for memory storage
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test 2: Send intensive message
  console.log("2️⃣ Sending profound opening experience...\n");

<<<<<<< HEAD
  const intensiveMessage = "I'm having a profound opening experience";
=======
  const intensiveMessage = "I&apos;m having a profound opening experience";
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
  console.log(`User: "${intensiveMessage}"`);

  const response = await oracle.respondToPrompt(intensiveMessage);
  console.log(`Oracle: "${response}"\n`);

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test 3: Send another retreat-intensive message
  console.log("3️⃣ Sending another intensive experience...\n");

  const mysticMessage =
<<<<<<< HEAD
    "I'm experiencing unity consciousness and ego dissolution";
=======
    "I&apos;m experiencing unity consciousness and ego dissolution";
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
  console.log(`User: "${mysticMessage}"`);

  const mysticResponse = await oracle.respondToPrompt(mysticMessage);
  console.log(`Oracle: "${mysticResponse}"\n`);

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test 4: Check retreat memories
  console.log("4️⃣ Checking retreat-tagged memories...\n");

  const allMemories = await soulMemory.retrieveMemories(userId);
  const retreatMemories = allMemories.filter(
    (memory) =>
      memory.metadata?.mode === "retreat" ||
      memory.metadata?.retreatPhase ||
      memory.metadata?.retreatIntensive ||
      memory.ritualContext?.includes("retreat"),
  );

  console.log(`Total memories: ${allMemories.length}`);
  console.log(`Retreat memories: ${retreatMemories.length}\n`);

  console.log("🏔️ Retreat Memory Details:");
  retreatMemories.forEach((memory, i) => {
    console.log(`\n${i + 1}. ${memory.type}`);
    console.log(`   Content: "${memory.content.substring(0, 60)}..."`);
    console.log(`   Mode: ${memory.metadata?.mode}`);
    console.log(`   Retreat Phase: ${memory.metadata?.retreatPhase}`);
    console.log(`   Retreat Intensive: ${memory.metadata?.retreatIntensive}`);
    console.log(`   Sacred Moment: ${memory.sacredMoment}`);
    console.log(`   Ritual Context: ${memory.ritualContext}`);
  });

  // Test 5: Test different retreat phases
  console.log("\n5️⃣ Testing different retreat phases...\n");

  // Switch to post-retreat
  await oracle.activateRetreatMode("post-retreat");
  console.log("Switched to post-retreat phase");

  const integrationMessage =
    "I'm trying to integrate these profound experiences";
  const integrationResponse = await oracle.respondToPrompt(integrationMessage);
  console.log(
    `Integration response: "${integrationResponse.substring(0, 80)}..."\n`,
  );

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test 6: Deactivate retreat mode
  console.log("6️⃣ Deactivating retreat mode...\n");

  await oracle.deactivateRetreatMode();
  console.log("✅ Retreat mode deactivated\n");

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test 7: Final memory check
  console.log("7️⃣ Final retreat memory summary...\n");

  const finalMemories = await soulMemory.retrieveMemories(userId);
  const finalRetreatMemories = finalMemories.filter(
    (memory) =>
      memory.metadata?.mode === "retreat" ||
      memory.metadata?.retreatPhase ||
      memory.metadata?.retreatIntensive ||
      memory.ritualContext?.includes("retreat"),
  );

  console.log("📊 Retreat Summary:");
  console.log(`- Total memories created: ${finalMemories.length}`);
  console.log(`- Retreat-related memories: ${finalRetreatMemories.length}`);
  console.log(
    `- Sacred moments: ${finalMemories.filter((m) => m.sacredMoment).length}`,
  );

  // Group by retreat phase
  const phaseGroups: Record<string, number> = {};
  finalRetreatMemories.forEach((memory) => {
    const phase = memory.metadata?.retreatPhase || "activation";
    phaseGroups[phase] = (phaseGroups[phase] || 0) + 1;
  });

  console.log("\nMemories by retreat phase:");
  Object.entries(phaseGroups).forEach(([phase, count]) => {
    console.log(`- ${phase}: ${count} memories`);
  });

  // Cleanup
  await soulMemory.closeDatabase();

  // Clean up test file
  const fs = require("fs");
  if (fs.existsSync("./test_retreat_memory.db")) {
    fs.unlinkSync("./test_retreat_memory.db");
  }

  console.log("\n✅ Retreat mode test complete!");
}

// Run the test
testRetreatMode().catch(console.error);
