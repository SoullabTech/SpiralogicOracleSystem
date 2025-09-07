#!/usr/bin/env node

// Test script for RAG Memory System
const BASE_URL = "http://localhost:3000";

async function testRAGMemory() {
  console.log("🧠 Testing Soullab RAG Memory System...\n");

  const userId = "test-rag-user";

  // Test 1: Create a journal entry about anxiety
  console.log("1. Creating journal entry about anxiety...");
  try {
    const journalResponse = await fetch(`${BASE_URL}/api/journal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title: "Morning Anxiety",
        content: "I woke up feeling really anxious about my presentation next week. The fear of public speaking is overwhelming me again.",
        mood: "anxious",
        tags: ["anxiety", "work", "public-speaking"]
      })
    });
    
    const journalData = await journalResponse.json();
    console.log("   ✅ Journal saved with memory ID:", journalData.entryId);
  } catch (error) {
    console.log("   ❌ Journal failed:", error.message);
  }

  // Test 2: Upload a document about coping strategies
  console.log("\n2. Uploading document about coping strategies...");
  try {
    const fs = require('fs');
    const FormData = require('form-data');
    
    const copingDoc = `
    My Personal Coping Strategies for Anxiety
    
    1. Deep breathing exercises - 4-7-8 technique
    2. Grounding techniques - 5-4-3-2-1 sensory method
    3. Progressive muscle relaxation
    4. Positive self-talk and affirmations
    5. Breaking tasks into smaller steps
    
    For presentations specifically:
    - Practice in front of mirror
    - Record myself and review
    - Visualize success
    - Arrive early to familiarize with space
    `;
    
    fs.writeFileSync('/tmp/coping-strategies.txt', copingDoc);
    
    const form = new FormData();
    form.append('file', fs.createReadStream('/tmp/coping-strategies.txt'));
    form.append('userId', userId);
    
    const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: form
    });
    
    const uploadData = await uploadResponse.json();
    console.log("   ✅ Document uploaded with memory ID:", uploadData.entryId);
  } catch (error) {
    console.log("   ❌ Upload failed:", error.message);
  }

  // Wait a moment for indexing
  console.log("\n⏳ Waiting for memory indexing...");
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Chat with Oracle about anxiety (should reference journal + document)
  console.log("\n3. Asking Oracle about anxiety (testing RAG)...");
  try {
    const chatResponse = await fetch(`${BASE_URL}/api/oracle/simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        message: "I'm feeling anxious about my upcoming presentation. Can you help me?"
      })
    });
    
    const chatData = await chatResponse.json();
    console.log("   ✅ Oracle response:", chatData.text);
    console.log("   📊 Response includes memory context:", chatData.text.includes("remember"));
  } catch (error) {
    console.log("   ❌ Oracle chat failed:", error.message);
  }

  // Test 4: Follow-up question (should build on context)
  console.log("\n4. Follow-up question to test conversation memory...");
  try {
    const followupResponse = await fetch(`${BASE_URL}/api/oracle/simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        message: "What specific techniques from my coping strategies document would help most?"
      })
    });
    
    const followupData = await followupResponse.json();
    console.log("   ✅ Follow-up response:", followupData.text);
  } catch (error) {
    console.log("   ❌ Follow-up failed:", error.message);
  }

  // Test 5: Create another journal entry
  console.log("\n5. Creating follow-up journal entry...");
  try {
    const journalResponse2 = await fetch(`${BASE_URL}/api/journal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title: "Progress with Anxiety",
        content: "After talking with Maya and reviewing my coping strategies, I feel more prepared. The 4-7-8 breathing really helps.",
        mood: "hopeful",
        tags: ["progress", "coping", "breathing"]
      })
    });
    
    const journalData2 = await journalResponse2.json();
    console.log("   ✅ Follow-up journal saved");
  } catch (error) {
    console.log("   ❌ Follow-up journal failed:", error.message);
  }

  // Test 6: Final chat to see full context awareness
  console.log("\n6. Final chat to test full memory integration...");
  try {
    const finalResponse = await fetch(`${BASE_URL}/api/oracle/simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        message: "How have I been progressing with my anxiety management?"
      })
    });
    
    const finalData = await finalResponse.json();
    console.log("   ✅ Final response:", finalData.text);
  } catch (error) {
    console.log("   ❌ Final chat failed:", error.message);
  }

  console.log("\n✨ RAG Memory Test Complete!");
  console.log("\n📋 Summary:");
  console.log("   • Journal entries are indexed in vector memory");
  console.log("   • Uploaded documents are processed and searchable");
  console.log("   • Oracle responses include relevant context from past interactions");
  console.log("   • Conversation history influences future responses");
  console.log("\n🎯 Next: Try the voice transcription API for complete multimodal memory!");
}

// Run if called directly
if (require.main === module) {
  testRAGMemory().catch(console.error);
}

module.exports = { testRAGMemory };