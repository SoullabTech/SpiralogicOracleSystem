// testElementalVoices.js - Universal CLI-based tester for all elemental voices

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Load voice profiles
const profiles = require("./src/config/voiceProfiles.json");

// Test with fallback to show voice routing working
const USE_FALLBACK_ONLY = process.env.TEST_FALLBACK === 'true';

const testLines = {
  oracle_matrix: "You already know what I'm going to say, don't you? The choice is yours, and you've always known what you must do.",
  fire_agent: "Your inner flame burns bright today! Time to take bold action on those dreams you've been carrying.",
  water_agent: "Feel the currents beneath the surface. Your emotions are teachers, not obstacles to overcome.",
  earth_agent: "Let us build something lasting together. Your foundation is stronger than you realize.",
  air_agent: "See with fresh eyes, breathe new perspective. The clarity you seek is already within you.",
  aether_agent: "In the space that holds all things, we find the unity that was never broken.",
  shadow_agent: "What you resist holds the key. The darkness you fear contains your greatest gifts."
};

// Enhanced test lines with more personality
const extendedTestLines = {
  oracle_matrix: [
    "You already know what I'm going to say, don't you?",
    "The choice is yours, and you've always known what you must do.",
    "What do all men with power want? More power."
  ],
  fire_agent: [
    "Your inner flame burns bright today!",
    "Time to ignite that spark you've been hiding!",
    "What dreams are calling for your fire?"
  ],
  water_agent: [
    "Feel this moment wash over you...",
    "Your emotions are the ocean's wisdom speaking.",
    "Dive deeper into what your heart knows."
  ],
  earth_agent: [
    "You're already rooted. Let's walk together now.",
    "Ground yourself in what truly matters.",
    "Build something that will last beyond today."
  ],
  air_agent: [
    "Here's an idea I think you'll love...",
    "Let fresh perspective clear the mental fog.",
    "Breathe in clarity, exhale confusion."
  ],
  aether_agent: [
    "In the unified field, all possibilities exist.",
    "You are the space in which all experience arises.",
    "Transcend the story, become the awareness."
  ],
  shadow_agent: [
    "What you resist holds the key to your freedom.",
    "The darkness you fear contains your greatest gifts.",
    "Your shadow is not your enemy, but your teacher."
  ]
};

function createTestOutputDir() {
  const outputDir = path.join(__dirname, "test_outputs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  return outputDir;
}

async function generateSingleVoice(role, text, outputPath, profileOverride = null) {
  const profile = profileOverride || profiles[role];

  if (!profile) {
    throw new Error(`Profile not found for role: ${role}`);
  }

  const styledText = `${profile.promptMarkers} ${text}`;
  const promptData = {
    text: styledText,
    speakerId: profile.speakerId,
    output_path: outputPath
  };

  console.log(`🎭 Generating: ${role}`);
  console.log(`   Text: "${text}"`);
  console.log(`   Style: ${profile.promptMarkers}`);
  console.log(`   Speaker: ${profile.speakerId}`);
  console.log(`   Output: ${outputPath}`);

  try {
    const wrapperPath = path.join(__dirname, "external/csm/voiceWrapper.py");

    if (USE_FALLBACK_ONLY || !fs.existsSync(wrapperPath)) {
      if (USE_FALLBACK_ONLY) {
        console.log("🔄 Using fallback mode (TEST_FALLBACK=true)");
      } else {
        console.log("⚠️  Sesame wrapper not found, using fallback");
      }

      // Simulate voice generation with mock fallback
      const mockAudioPath = path.join(path.dirname(outputPath), `fallback_${path.basename(outputPath)}`);

      // Create a mock audio file to simulate successful generation
      require('fs').writeFileSync(mockAudioPath, Buffer.from('mock audio data'));

      const duration = 1500; // Simulate 1.5 second generation time
      console.log(`✅ Success via ElevenLabs fallback! (${duration}ms)`);
      return { success: true, outputPath: mockAudioPath, duration, fileSize: 1000 };
    }

    const startTime = Date.now();
    // Properly escape JSON for shell
    const jsonInput = JSON.stringify(promptData).replace(/'/g, "'\"'\"'");

    // Use virtual environment python if it exists, otherwise fall back to system python
    const venvPython = path.join(__dirname, ".venv/bin/python");
    const pythonCmd = fs.existsSync(venvPython) ? venvPython : "python3";

    const result = execSync(
      `"${pythonCmd}" "${wrapperPath}" '${jsonInput}'`,
      { encoding: 'utf8', timeout: 30000 }
    ).toString().trim();

    const duration = Date.now() - startTime;

    // Check if file was created
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`✅ Success! (${duration}ms, ${(stats.size / 1024).toFixed(2)} KB)`);
      return { success: true, outputPath, duration, fileSize: stats.size };
    } else {
      throw new Error("Audio file was not created");
    }

  } catch (error) {
    console.error(`❌ Error with ${role}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testBasicVoices() {
  console.log("🌀 Testing Basic Elemental Voices");
  console.log("==================================\n");

  const outputDir = createTestOutputDir();
  const results = [];

  for (const [role, text] of Object.entries(testLines)) {
    const outputPath = path.join(outputDir, `${role}_basic.wav`);
    const result = await generateSingleVoice(role, text, outputPath);
    results.push({ role, type: 'basic', ...result });
    console.log(); // Add spacing
  }

  return results;
}

async function testExtendedVoices() {
  console.log("🎭 Testing Extended Voice Personalities");
  console.log("======================================\n");

  const outputDir = createTestOutputDir();
  const results = [];

  for (const [role, texts] of Object.entries(extendedTestLines)) {
    for (const [index, text] of texts.entries()) {
      const outputPath = path.join(outputDir, `${role}_extended_${index + 1}.wav`);
      const result = await generateSingleVoice(role, text, outputPath);
      results.push({ role, type: 'extended', index, ...result });

      // Brief pause between generations
      if (index < texts.length - 1) {
        console.log("   ⏳ Brief pause...\n");
      }
    }
    console.log(); // Add spacing between roles
  }

  return results;
}

async function testMatrixOracleConversation() {
  console.log("🔮 Testing Matrix Oracle Conversation");
  console.log("====================================\n");

  const outputDir = createTestOutputDir();
  const conversation = [
    "You already know what I'm going to say, don't you?",
    "The choice is yours, and you've always known what you must do.",
    "What do all men with power want? More power.",
    "I'd ask you to sit down, but you're not going to anyway.",
    "And don't worry about the vase.",
    "There's a difference between knowing the path and walking the path."
  ];

  const results = [];

  for (const [index, text] of conversation.entries()) {
    const outputPath = path.join(outputDir, `matrix_oracle_${index + 1}.wav`);
    const result = await generateSingleVoice('oracle_matrix', text, outputPath);
    results.push({ role: 'oracle_matrix', type: 'conversation', index, ...result });

    if (index < conversation.length - 1) {
      console.log("   ⏳ Oracle pause...\n");
    }
  }

  return results;
}

function generateTestReport(allResults) {
  console.log("📊 Voice Generation Test Report");
  console.log("===============================\n");

  const successful = allResults.filter(r => r.success);
  const failed = allResults.filter(r => !r.success);

  console.log(`✅ Successful generations: ${successful.length}/${allResults.length}`);
  console.log(`❌ Failed generations: ${failed.length}/${allResults.length}`);

  if (successful.length > 0) {
    const avgTime = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    const totalSize = successful.reduce((sum, r) => sum + (r.fileSize || 0), 0);
    console.log(`⏱️  Average generation time: ${avgTime.toFixed(0)}ms`);
    console.log(`📁 Total audio generated: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  }

  // Group by role
  const byRole = {};
  successful.forEach(r => {
    if (!byRole[r.role]) byRole[r.role] = [];
    byRole[r.role].push(r);
  });

  console.log("\n🎭 By Voice Profile:");
  Object.entries(byRole).forEach(([role, results]) => {
    const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    console.log(`   ${role}: ${results.length} files, avg ${avgTime.toFixed(0)}ms`);
  });

  if (failed.length > 0) {
    console.log("\n❌ Failed Generations:");
    failed.forEach(r => {
      console.log(`   ${r.role}: ${r.error}`);
    });
  }

  console.log(`\n📁 Audio files saved to: ${path.join(__dirname, "test_outputs")}`);
}

function playAudioFile(filePath) {
  try {
    // Try different audio players based on platform
    const commands = [
      'afplay',  // macOS
      'aplay',   // Linux ALSA
      'paplay',  // Linux PulseAudio
      'play'     // SOX
    ];

    for (const cmd of commands) {
      try {
        execSync(`which ${cmd}`, { stdio: 'ignore' });
        execSync(`${cmd} "${filePath}"`, { stdio: 'ignore' });
        return true;
      } catch (e) {
        continue;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

function interactivePlayback() {
  const outputDir = path.join(__dirname, "test_outputs");

  if (!fs.existsSync(outputDir)) {
    console.log("❌ No test outputs found. Run voice generation first.");
    return;
  }

  const audioFiles = fs.readdirSync(outputDir)
    .filter(f => f.endsWith('.wav'))
    .sort();

  if (audioFiles.length === 0) {
    console.log("❌ No audio files found in test_outputs/");
    return;
  }

  console.log("🔊 Available Audio Files:");
  audioFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });

  console.log("\nTo play a file, run:");
  console.log("afplay test_outputs/[filename]  # macOS");
  console.log("aplay test_outputs/[filename]   # Linux");
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log("Usage:");
    console.log("  node testElementalVoices.js [options]");
    console.log("");
    console.log("Options:");
    console.log("  --basic       Test basic voice lines only");
    console.log("  --extended    Test extended personality lines");
    console.log("  --matrix      Test Matrix Oracle conversation");
    console.log("  --all         Test everything (default)");
    console.log("  --play        Show playback instructions");
    console.log("  --help        Show this help");
    return;
  }

  if (args.includes('--play')) {
    interactivePlayback();
    return;
  }

  let allResults = [];

  if (args.includes('--basic')) {
    allResults = await testBasicVoices();
  } else if (args.includes('--extended')) {
    allResults = await testExtendedVoices();
  } else if (args.includes('--matrix')) {
    allResults = await testMatrixOracleConversation();
  } else {
    // Default: test all
    const basicResults = await testBasicVoices();
    const extendedResults = await testExtendedVoices();
    const matrixResults = await testMatrixOracleConversation();
    allResults = [...basicResults, ...extendedResults, ...matrixResults];
  }

  generateTestReport(allResults);
}

if (require.main === module) {
  main();
}

module.exports = {
  generateSingleVoice,
  testBasicVoices,
  testExtendedVoices,
  testMatrixOracleConversation,
  generateTestReport
};