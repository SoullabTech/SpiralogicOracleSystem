#!/usr/bin/env node

// Soullab Beta Test Script
const BASE_URL = "http://localhost:3000";

async function testSoullab() {
  console.log("🔮 Testing Soullab Beta APIs...\n");

  // Test 1: Oracle Chat
  console.log("1. Testing Oracle Chat...");
  try {
    const chatResponse = await fetch(`${BASE_URL}/api/oracle/simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: "test-user",
        message: "Hello Maya, I'm feeling lost and need some guidance"
      })
    });
    
    const chatData = await chatResponse.json();
    console.log("   ✅ Oracle responded:", chatData.text.substring(0, 60) + "...");
    console.log("   📊 Stage:", chatData.meta.oracleStage, "Trust:", chatData.meta.relationshipMetrics.trustLevel);
  } catch (error) {
    console.log("   ❌ Oracle chat failed:", error.message);
  }

  // Test 2: Journal Entry
  console.log("\n2. Testing Journal...");
  try {
    const journalResponse = await fetch(`${BASE_URL}/api/journal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: "test-user",
        title: "Morning Reflection",
        content: "I woke up feeling anxious about the future. Maya's guidance about staying present helps."
      })
    });
    
    const journalData = await journalResponse.json();
    console.log("   ✅ Journal entry saved:", journalData.entry.id);
    console.log("   📝 Title:", journalData.entry.title);
  } catch (error) {
    console.log("   ❌ Journal failed:", error.message);
  }

  // Test 3: File Upload
  console.log("\n3. Testing File Upload...");
  try {
    const fs = require('fs');
    const FormData = require('form-data');
    
    // Create a test file
    const testContent = "This is my personal manifesto for 2024. I want to be more present, compassionate, and authentic.";
    fs.writeFileSync('/tmp/manifesto.txt', testContent);
    
    const form = new FormData();
    form.append('file', fs.createReadStream('/tmp/manifesto.txt'));
    form.append('userId', 'test-user');
    
    const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: form
    });
    
    const uploadData = await uploadResponse.json();
    console.log("   ✅ File uploaded:", uploadData.file.originalName);
    console.log("   📁 Size:", uploadData.file.size, "bytes");
    console.log("   🤖 Summary:", uploadData.file.summary);
  } catch (error) {
    console.log("   ❌ File upload failed:", error.message);
  }

  // Test 4: Context-Aware Oracle Response
  console.log("\n4. Testing Context-Aware Oracle...");
  try {
    const contextResponse = await fetch(`${BASE_URL}/api/oracle/simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: "test-user",
        message: "I've been journaling about my anxiety. What do you think about my manifesto?"
      })
    });
    
    const contextData = await contextResponse.json();
    console.log("   ✅ Context-aware response:", contextData.text.substring(0, 60) + "...");
  } catch (error) {
    console.log("   ❌ Context-aware oracle failed:", error.message);
  }

  console.log("\n🎉 Soullab Beta test complete!");
  console.log("\n📱 Next Steps:");
  console.log("   • Open http://localhost:3000 in your browser");
  console.log("   • Navigate to /chat to test the full interface");
  console.log("   • Try uploading files and creating journal entries");
  console.log("   • Chat with Maya and watch her reference your content");
}

// Run if called directly
if (require.main === module) {
  testSoullab().catch(console.error);
}

module.exports = { testSoullab };