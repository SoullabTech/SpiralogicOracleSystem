"use strict";
// ===============================================
// BREAKTHROUGH & SACRED MOMENT DETECTION TEST
// Tests the enhanced breakthrough detection
// ===============================================
Object.defineProperty(exports, "__esModule", { value: true });
const PersonalOracleAgent_1 = require("../core/agents/PersonalOracleAgent");
const SoulMemorySystem_1 = require("../../memory/SoulMemorySystem");
async function testBreakthroughDetection() {
    console.log('🌟 Testing Breakthrough & Sacred Moment Detection\n');
    // Setup
    const userId = 'test_breakthrough_' + Date.now();
    const soulMemory = new SoulMemorySystem_1.SoulMemorySystem({
        userId,
        storageType: 'sqlite',
        databasePath: './test_breakthrough_memory.db',
        memoryDepth: 100
    });
    const oracle = new PersonalOracleAgent_1.PersonalOracleAgent({
        userId,
        oracleName: 'Aria',
        elementalResonance: 'water'
    });
    await oracle.connectToSoulMemory(soulMemory);
    // Test cases
    const testCases = [
        {
            message: "I'm feeling overwhelmed by all these changes",
            expectBreakthrough: false,
            expectSacred: false,
            description: "Regular emotional expression"
        },
        {
            message: "I just realized the pattern I've been stuck in for years!",
            expectBreakthrough: true,
            expectSacred: true,
            description: "Clear breakthrough moment"
        },
        {
            message: "Aha! I see now why I keep avoiding intimacy",
            expectBreakthrough: true,
            expectSacred: true,
            description: "Insight about patterns"
        },
        {
            message: "This feels sacred... I'm touching something deep in my soul",
            expectBreakthrough: false,
            expectSacred: true,
            description: "Sacred moment without breakthrough"
        },
        {
            message: "I finally understand why my mother's words affected me so deeply",
            expectBreakthrough: true,
            expectSacred: true,
            description: "Emotional breakthrough"
        }
    ];
    console.log('Running test cases...\n');
    for (const testCase of testCases) {
        console.log(`📤 Test: "${testCase.description}"`);
        console.log(`   Message: "${testCase.message}"`);
        // Send message
        const response = await oracle.respondToPrompt(testCase.message);
        console.log(`   Oracle: "${response.substring(0, 100)}..."`);
        // Wait for storage
        await new Promise(resolve => setTimeout(resolve, 500));
        // Check memory
        const memories = await soulMemory.retrieveMemories(userId, { limit: 1 });
        const latestMemory = memories[0];
        if (latestMemory) {
            const isBreakthrough = latestMemory.type === 'breakthrough' || latestMemory.transformationMarker;
            const isSacred = latestMemory.sacredMoment;
            console.log(`   Results:`);
            console.log(`     - Type: ${latestMemory.type}`);
            console.log(`     - Breakthrough: ${isBreakthrough ? '✅' : '❌'} (expected: ${testCase.expectBreakthrough ? '✅' : '❌'})`);
            console.log(`     - Sacred: ${isSacred ? '✅' : '❌'} (expected: ${testCase.expectSacred ? '✅' : '❌'})`);
            console.log(`     - Transformation Marker: ${latestMemory.transformationMarker}`);
            const breakthroughMatch = isBreakthrough === testCase.expectBreakthrough;
            const sacredMatch = isSacred === testCase.expectSacred;
            if (breakthroughMatch && sacredMatch) {
                console.log(`   ✅ Test PASSED\n`);
            }
            else {
                console.log(`   ❌ Test FAILED\n`);
            }
        }
        else {
            console.log(`   ❌ No memory found\n`);
        }
    }
    // Test sacred moments retrieval
    console.log('\n📊 Testing Sacred Moments Retrieval...');
    const sacredMoments = await soulMemory.getSacredMoments(userId);
    console.log(`Found ${sacredMoments.length} sacred moments:`);
    sacredMoments.forEach((moment, i) => {
        console.log(`${i + 1}. ${moment.type}: "${moment.content.substring(0, 50)}..."`);
    });
    // Test transformation journey
    console.log('\n🔄 Testing Transformation Journey...');
    const journey = await soulMemory.getTransformationJourney(userId);
    console.log(`Current Phase: ${journey.currentPhase}`);
    console.log(`Milestones: ${journey.milestones.length}`);
    console.log(`Next Suggestion: ${journey.nextSpiralSuggestion}`);
    // Cleanup
    await soulMemory.closeDatabase();
    // Clean up test file
    const fs = require('fs');
    if (fs.existsSync('./test_breakthrough_memory.db')) {
        fs.unlinkSync('./test_breakthrough_memory.db');
    }
    console.log('\n✅ Breakthrough detection test complete!');
}
// Run the test
testBreakthroughDetection().catch(console.error);
