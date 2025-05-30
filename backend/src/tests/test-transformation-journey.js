// ===============================================
// TRANSFORMATION JOURNEY TEST
// Tests the complete transformation tracking system
// ===============================================
import { PersonalOracleAgent } from '../core/agents/PersonalOracleAgent';
import { SoulMemorySystem } from '../../memory/SoulMemorySystem';
async function testTransformationJourney() {
    console.log('🌟 Testing Transformation Journey Tracking...\n');
    // Setup
    const userId = 'test_transformation_' + Date.now();
    const soulMemory = new SoulMemorySystem({
        userId,
        storageType: 'sqlite',
        databasePath: './test_transformation_journey.db',
        memoryDepth: 100
    });
    const oracle = new PersonalOracleAgent({
        userId,
        oracleName: 'Aria',
        elementalResonance: 'water'
    });
    await oracle.connectToSoulMemory(soulMemory);
    // Simulate a transformation journey
    console.log('📖 Simulating a complete transformation journey...\n');
    // Phase 1: Initial exploration
    console.log('🌱 Phase 1: Initiation\n');
    const initiationMessages = [
        "I feel lost and don't know who I am anymore",
        "Something needs to change in my life",
        "I'm ready to look at my shadows"
    ];
    for (const msg of initiationMessages) {
        console.log(`User: "${msg}"`);
        const response = await oracle.respondToPrompt(msg);
        console.log(`Oracle: "${response.substring(0, 80)}..."\n`);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    // Phase 2: Breakthroughs
    console.log('💫 Phase 2: Breakthroughs\n');
    const breakthroughMessages = [
        "I just realized I've been living my mother's dreams, not mine!",
        "Aha! I see the pattern now - I keep choosing unavailable partners",
        "I understand why I've been so afraid of success"
    ];
    for (const msg of breakthroughMessages) {
        console.log(`User: "${msg}"`);
        const response = await oracle.respondToPrompt(msg);
        console.log(`Oracle: "${response.substring(0, 80)}..."\n`);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    // Phase 3: Shadow work
    console.log('🌑 Phase 3: Shadow Work\n');
    const shadowMessages = [
        "I hate this jealous part of myself",
        "Working with my shadow today, it's intense",
        "I'm learning to accept my dark side"
    ];
    for (const msg of shadowMessages) {
        console.log(`User: "${msg}"`);
        const response = await oracle.respondToPrompt(msg);
        console.log(`Oracle: "${response.substring(0, 80)}..."\n`);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    // Phase 4: Integration
    console.log('🔄 Phase 4: Integration\n');
    const integrationMessages = [
        "I'm starting to feel whole again",
        "Integrating all these insights into daily life",
        "I feel like a different person than when I started"
    ];
    for (const msg of integrationMessages) {
        console.log(`User: "${msg}"`);
        const response = await oracle.respondToPrompt(msg);
        console.log(`Oracle: "${response.substring(0, 80)}..."\n`);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    // Check transformation journey
    console.log('📊 Checking Transformation Journey...\n');
    const journey = await soulMemory.getTransformationJourney(userId);
    console.log('🗺️ Transformation Journey Summary:');
    console.log(`Current Phase: ${journey.currentPhase}`);
    console.log(`Total Milestones: ${journey.milestones.length}`);
    console.log(`Next Suggestion: ${journey.nextSpiralSuggestion}\n`);
    if (journey.milestones.length > 0) {
        console.log('🏆 Transformation Milestones:');
        journey.milestones.forEach((milestone, i) => {
            console.log(`\n${i + 1}. ${milestone.type}`);
            console.log(`   Date: ${new Date(milestone.date).toLocaleString()}`);
            console.log(`   Content: "${milestone.content.substring(0, 60)}..."`);
            console.log(`   Element: ${milestone.element}`);
            if (milestone.insights) {
                console.log(`   Insights: ${milestone.insights}`);
            }
        });
    }
    // Check sacred moments
    console.log('\n✨ Sacred Moments:');
    const sacredMoments = await soulMemory.getSacredMoments(userId, 5);
    console.log(`Found ${sacredMoments.length} sacred moments`);
    // Check archetypal evolution
    console.log('\n🎭 Archetypal Evolution:');
    const archetypes = await soulMemory.getActiveArchetypes(userId);
    archetypes.forEach(arch => {
        console.log(`- ${arch.archetype}: ${arch.activationCount} activations`);
    });
    // Phase detection based on milestones
    console.log('\n📈 Phase Analysis:');
    const phaseAnalysis = analyzeTransformationPhases(journey);
    console.log(phaseAnalysis);
    // Cleanup
    await soulMemory.closeDatabase();
    // Clean up test file
    const fs = require('fs');
    if (fs.existsSync('./test_transformation_journey.db')) {
        fs.unlinkSync('./test_transformation_journey.db');
    }
    console.log('\n✅ Transformation journey test complete!');
}
function analyzeTransformationPhases(journey) {
    const milestoneCount = journey.milestones.length;
    const phase = journey.currentPhase;
    let analysis = `Phase: ${phase}\n`;
    if (milestoneCount === 0) {
        analysis += 'Status: Just beginning the journey';
    }
    else if (milestoneCount < 3) {
        analysis += 'Status: Early exploration, discovering patterns';
    }
    else if (milestoneCount < 7) {
        analysis += 'Status: Deep work in progress, breakthroughs emerging';
    }
    else if (milestoneCount < 12) {
        analysis += 'Status: Integration phase, embodying insights';
    }
    else {
        analysis += 'Status: Mastery phase, teaching and guiding others';
    }
    return analysis;
}
// Run the test
testTransformationJourney().catch(console.error);
