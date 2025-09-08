// ===============================================
// MEMORY CONTINUITY TEST
// Tests the Oracle's ability to remember and reference previous conversations
// ===============================================

import { PersonalOracleAgent } from "../core/agents/PersonalOracleAgent";
import { SoulMemorySystem } from "../../memory/SoulMemorySystem";

async function testMemoryContinuity() {
  console.log("🧠 Testing Memory Continuity...\n");

  // Setup
  const userId = "test_continuity_" + Date.now();
  const soulMemory = new SoulMemorySystem({
    userId,
    storageType: "sqlite",
    databasePath: "./test_continuity_memory.db",
    memoryDepth: 100,
  });

  const oracle = new PersonalOracleAgent({
    userId,
    oracleName: "Aria",
    elementalResonance: "water",
  });

  await oracle.connectToSoulMemory(soulMemory);

  // Test Case 1: Dream Continuity
  console.log("📘 Test Case 1: Dream Continuity\n");

  // First interaction about a dream
  console.log("1️⃣ First interaction:");
  const firstMessage = "I keep having the same dream about water";
  console.log(`User: "${firstMessage}"`);

  const firstResponse = await oracle.respondToPrompt(firstMessage);
  console.log(`Oracle: "${firstResponse}"\n`);

  // Wait for storage
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Second interaction referencing the dream
  console.log("2️⃣ Second interaction (should remember):");
  const secondMessage = "That dream came back again";
  console.log(`User: "${secondMessage}"`);

  const secondResponse = await oracle.respondToPrompt(secondMessage);
  console.log(`Oracle: "${secondResponse}"\n`);

  // Check if Oracle referenced the water dream
  const referencedWater = secondResponse.toLowerCase().includes("water");
  const referencedDream = secondResponse.toLowerCase().includes("dream");
  console.log(`✅ Referenced water: ${referencedWater}`);
  console.log(`✅ Referenced dream: ${referencedDream}`);
  console.log("");

  // Test Case 2: Emotional Continuity
  console.log("📗 Test Case 2: Emotional Continuity\n");

  // First interaction about feeling
  console.log("1️⃣ First interaction:");
<<<<<<< HEAD
  const emotionMessage = "I'm feeling really overwhelmed with work stress";
=======
  const emotionMessage = "I&apos;m feeling really overwhelmed with work stress";
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
  console.log(`User: "${emotionMessage}"`);

  const emotionResponse = await oracle.respondToPrompt(emotionMessage);
  console.log(`Oracle: "${emotionResponse}"\n`);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Second interaction referencing the feeling
  console.log("2️⃣ Second interaction:");
  const emotionFollowup = "That feeling is getting stronger";
  console.log(`User: "${emotionFollowup}"`);

  const emotionFollowupResponse = await oracle.respondToPrompt(emotionFollowup);
  console.log(`Oracle: "${emotionFollowupResponse}"\n`);

  const referencedOverwhelm = emotionFollowupResponse
    .toLowerCase()
    .includes("overwhelm");
  console.log(`✅ Referenced overwhelm: ${referencedOverwhelm}`);
  console.log("");

  // Test Case 3: Pattern Recognition
  console.log("📙 Test Case 3: Pattern Recognition\n");

  // Multiple related interactions
  const patternMessages = [
    "I notice I always get anxious before big meetings",
<<<<<<< HEAD
    "There's that anxiety again before today's presentation",
=======
    "There&apos;s that anxiety again before today&apos;s presentation",
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
    "The same anxious feeling is back",
  ];

  for (let i = 0; i < patternMessages.length; i++) {
    console.log(`${i + 1}️⃣ Interaction ${i + 1}:`);
    console.log(`User: "${patternMessages[i]}"`);

    const response = await oracle.respondToPrompt(patternMessages[i]);
    console.log(`Oracle: "${response.substring(0, 150)}..."\n`);

    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  // Test Case 4: Vague References
  console.log("📕 Test Case 4: Vague References\n");

  // First specific interaction
  console.log("1️⃣ Setting context:");
  const specificMessage = "My relationship with my mother is complicated";
  console.log(`User: "${specificMessage}"`);

  const specificResponse = await oracle.respondToPrompt(specificMessage);
  console.log(`Oracle: "${specificResponse}"\n`);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Vague reference
  console.log("2️⃣ Vague reference:");
  const vagueMessage = "I've been thinking more about what we discussed";
  console.log(`User: "${vagueMessage}"`);

  const vagueResponse = await oracle.respondToPrompt(vagueMessage);
  console.log(`Oracle: "${vagueResponse}"\n`);

  const referencedMother =
    vagueResponse.toLowerCase().includes("mother") ||
    vagueResponse.toLowerCase().includes("relationship");
  console.log(`✅ Referenced previous topic: ${referencedMother}`);
  console.log("");

  // Check semantic search results
  console.log("🔍 Checking Semantic Memory Search...\n");
  const searchResults = await soulMemory.semanticSearch(
    userId,
    "dream water anxiety",
    { topK: 5 },
  );
  console.log(`Found ${searchResults.length} related memories`);

  searchResults.forEach((memory, i) => {
    console.log(
      `${i + 1}. ${memory.type}: "${memory.content.substring(0, 50)}..."`,
    );
  });

  // Cleanup
  await soulMemory.closeDatabase();

  // Clean up test file
  const fs = require("fs");
  if (fs.existsSync("./test_continuity_memory.db")) {
    fs.unlinkSync("./test_continuity_memory.db");
  }

  console.log("\n✅ Memory continuity test complete!");
}

// Run the test
testMemoryContinuity().catch(console.error);
