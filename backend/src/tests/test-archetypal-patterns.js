// ===============================================
// ARCHETYPAL PATTERN DETECTION TEST
// Tests the Oracle's ability to detect and track archetypal patterns
// ===============================================
import { PersonalOracleAgent } from '../core/agents/PersonalOracleAgent';
import { SoulMemorySystem } from '../../memory/SoulMemorySystem';
async function testArchetypalPatterns() {
    console.log('🎭 Testing Archetypal Pattern Detection...\n');
    // Setup
    const userId = 'test_archetypes_' + Date.now();
    const soulMemory = new SoulMemorySystem({
        userId,
        storageType: 'sqlite',
        databasePath: './test_archetypes_memory.db',
        memoryDepth: 100
    });
    const oracle = new PersonalOracleAgent({
        userId,
        oracleName: 'Aria',
        elementalResonance: 'water'
    });
    await oracle.connectToSoulMemory(soulMemory);
    // Test Case 1: Shadow Archetype Detection
    console.log('🌑 Test Case 1: Shadow Archetype\n');
    const shadowMessages = [
        "I hate this part of myself",
        "My shadow side is so strong",
        "Working with my shadow today",
        "I keep hiding this darkness from everyone"
    ];
    for (let i = 0; i < shadowMessages.length; i++) {
        console.log(`${i + 1}️⃣ Message ${i + 1}:`);
        console.log(`User: "${shadowMessages[i]}"`);
        const response = await oracle.respondToPrompt(shadowMessages[i]);
        console.log(`Oracle: "${response.substring(0, 100)}..."\n`);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    // Check Shadow archetype activation
    console.log('📊 Checking Shadow archetype activation...');
    const shadowPatterns = await soulMemory.getActiveArchetypes(userId);
    const shadowArchetype = shadowPatterns.find(p => p.archetype === 'Shadow');
    if (shadowArchetype) {
        console.log('✅ Shadow archetype detected!');
        console.log(`   - Activation count: ${shadowArchetype.activationCount}`);
        console.log(`   - Pattern strength: ${shadowArchetype.patternStrength}`);
        console.log(`   - Last activated: ${shadowArchetype.lastActivated}`);
    }
    else {
        console.log('❌ Shadow archetype not detected');
    }
    console.log('');
    // Test Case 2: Seeker Archetype
    console.log('🔍 Test Case 2: Seeker Archetype\n');
    const seekerMessages = [
        "I'm searching for my life purpose",
        "What is my true path?",
        "I need to discover who I really am",
        "This journey of self-discovery is intense"
    ];
    for (const message of seekerMessages) {
        await oracle.respondToPrompt(message);
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    // Test Case 3: Warrior Archetype
    console.log('⚔️ Test Case 3: Warrior Archetype\n');
    const warriorMessages = [
        "I need to fight through this challenge",
        "I will overcome this obstacle",
        "Finding my inner strength and courage"
    ];
    for (const message of warriorMessages) {
        await oracle.respondToPrompt(message);
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    // Final archetype summary
    console.log('\n🎯 Final Archetypal Pattern Summary:\n');
    const allPatterns = await soulMemory.getActiveArchetypes(userId);
    if (allPatterns.length > 0) {
        console.log(`Found ${allPatterns.length} active archetypes:`);
        allPatterns.forEach((pattern, i) => {
            console.log(`\n${i + 1}. ${pattern.archetype}`);
            console.log(`   - Activations: ${pattern.activationCount}`);
            console.log(`   - Strength: ${(pattern.patternStrength * 100).toFixed(1)}%`);
            console.log(`   - Related memories: ${pattern.relatedMemories.length}`);
        });
    }
    else {
        console.log('No archetypal patterns detected');
    }
    // Test API endpoint
    console.log('\n🌐 Testing API Endpoint...\n');
    console.log('To test via API:');
    console.log('GET /api/soul-memory/archetypal-patterns');
    console.log('Expected response:');
    console.log(JSON.stringify({
        success: true,
        patterns: allPatterns.map(p => ({
            archetype: p.archetype,
            activationCount: p.activationCount,
            patternStrength: p.patternStrength,
            relatedMemories: p.relatedMemories.length
        })),
        count: allPatterns.length
    }, null, 2));
    // Cleanup
    await soulMemory.closeDatabase();
    // Clean up test file
    const fs = require('fs');
    if (fs.existsSync('./test_archetypes_memory.db')) {
        fs.unlinkSync('./test_archetypes_memory.db');
    }
    console.log('\n✅ Archetypal pattern test complete!');
}
// Run the test
testArchetypalPatterns().catch(console.error);
