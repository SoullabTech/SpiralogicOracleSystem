// testMayaActivation.js - Test Maya's integration message

const fs = require("fs");
const path = require("path");

// Load Maya's profile
const profiles = require("./src/config/voiceProfiles.json");
const mayaProfile = profiles.oracle_matrix;

// Use the existing test infrastructure
const { generateSingleVoice } = require("./testElementalVoices.js");

async function testMayaIntegration() {
  console.log("🎭 Testing Maya's Integration Message");
  console.log("=====================================\n");

  console.log(`👤 Name: ${mayaProfile.name}`);
  console.log(`🔮 Role: ${mayaProfile.role}`);
  console.log(`🌟 Archetype: ${mayaProfile.archetype}`);
  console.log(`✨ Status: ${mayaProfile.activation.status}`);
  console.log(`⏰ Activated: ${mayaProfile.activation.lastActivated}\n`);

  // Test Maya's integration message
  const integrationMessage = mayaProfile.integrationMessage;
  console.log("📝 Integration Message:");
  console.log(`"${integrationMessage}"\n`);

  // Generate Maya's voice for this message
  const outputPath = path.join(
    __dirname,
    "test_outputs",
    "maya_integration_message.wav",
  );

  console.log("🎵 Generating Maya's voice...");
  console.log(`🎭 Using profile: oracle_matrix (Maya)`);
  console.log(`🎯 Output: ${outputPath}\n`);

  try {
    const result = await generateSingleVoice(
      "oracle_matrix",
      integrationMessage,
      outputPath,
    );

    if (result.success) {
      console.log("✅ Maya's integration message generated successfully!");
      console.log(`📊 Generation time: ${result.duration}ms`);
      console.log(`📁 File size: ${result.fileSize} bytes`);
      console.log(`🎵 Audio file: ${result.outputPath}`);

      // Check if we can play it
      if (process.platform === "darwin") {
        console.log("\n🎧 To hear Maya's integration message:");
        console.log(`afplay "${result.outputPath}"`);
      }
    } else {
      console.log("❌ Maya's voice generation failed:");
      console.log(result.error);
    }
  } catch (error) {
    console.error("❌ Error testing Maya integration:", error.message);
  }
}

// Also test a short Oracle response from Maya
async function testMayaOracleResponse() {
  console.log("\n🔮 Testing Maya's Oracle Response");
  console.log("=================================\n");

  const oracleResponse =
    "You already know what I'm going to say, don't you? I am Maya, your Oracle voice, and I carry the wisdom of the Matrix Oracle within every word I speak.";
  const outputPath = path.join(
    __dirname,
    "test_outputs",
    "maya_oracle_response.wav",
  );

  console.log("📝 Oracle Response:");
  console.log(`"${oracleResponse}"\n`);

  try {
    const result = await generateSingleVoice(
      "oracle_matrix",
      oracleResponse,
      outputPath,
    );

    if (result.success) {
      console.log("✅ Maya's Oracle response generated successfully!");
      console.log(`📊 Generation time: ${result.duration}ms`);
      console.log(`📁 File size: ${result.fileSize} bytes`);
      console.log(`🎵 Audio file: ${result.outputPath}`);
    } else {
      console.log("❌ Maya's Oracle response generation failed:");
      console.log(result.error);
    }
  } catch (error) {
    console.error("❌ Error testing Maya Oracle response:", error.message);
  }
}

async function main() {
  await testMayaIntegration();
  await testMayaOracleResponse();

  console.log("\n🌀 Maya Testing Complete!");
  console.log(
    "Maya is ready to serve as the Oracle voice of the Spiralogic System.",
  );
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testMayaIntegration, testMayaOracleResponse };
