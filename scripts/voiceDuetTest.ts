import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function voiceDuetTest() {
  console.log("🎭 Generating voice duet test...");

  // Maya (Alloy) - warm, natural greeting
  const mayaText = "Hey, nice to meet you. I'm glad you're here. What's up?";
  console.log("Maya: ", mayaText);

  const mayaResponse = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy", // Maya
    input: mayaText,
  });
  const mayaBuffer = Buffer.from(await mayaResponse.arrayBuffer());

  // Create a 1.5 second silence buffer between voices
  // MP3 silence is complex, so we'll use a workaround with OpenAI
  const silenceResponse = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: "...", // Brief pause
    speed: 0.25  // Slow speed to extend the pause
  });
  const silenceBuffer = Buffer.from(await silenceResponse.arrayBuffer());

  // Anthony (Ash) - grounded, friendly greeting
  const anthonyText = "Hi there. Good to see you. How's your day going?";
  console.log("Anthony:", anthonyText);

  const anthonyResponse = await openai.audio.speech.create({
    model: "tts-1",
    voice: "ash", // Anthony
    input: anthonyText,
  });
  const anthonyBuffer = Buffer.from(await anthonyResponse.arrayBuffer());

  // Combine all three: Maya, pause, Anthony
  const combined = Buffer.concat([mayaBuffer, silenceBuffer, anthonyBuffer]);
  fs.writeFileSync("maya-anthony-duet.mp3", combined);

  // Also save individual files for comparison
  fs.writeFileSync("maya-solo.mp3", mayaBuffer);
  fs.writeFileSync("anthony-solo.mp3", anthonyBuffer);

  console.log("\n✅ Voice tests saved:");
  console.log("   • maya-anthony-duet.mp3 (combined with pause)");
  console.log("   • maya-solo.mp3 (Maya only)");
  console.log("   • anthony-solo.mp3 (Anthony only)");
  console.log("\n🎧 Play the duet to hear both voices in natural conversation!");
}

voiceDuetTest().catch(console.error);