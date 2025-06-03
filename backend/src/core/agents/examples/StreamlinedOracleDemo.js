"use strict";
// ===============================================
// STREAMLINED ORACLE MODES DEMONSTRATION
// Clean, focused approach with Jung-Buddha integration
// ===============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeComparison = exports.StreamlinedOracleDemo = void 0;
exports.runStreamlinedDemo = runStreamlinedDemo;
const PersonalOracleAgent_js_1 = require("../PersonalOracleAgent.js");
class StreamlinedOracleDemo {
    constructor() {
        this.oracle = new PersonalOracleAgent_js_1.PersonalOracleAgent({
            userId: 'streamlined-demo',
            oracleName: 'Streamlined Sacred Mirror',
            mode: 'daily',
            elementalResonance: 'aether'
        });
    }
    async demonstrateAllModes() {
        console.log('🌟 STREAMLINED ORACLE MODES DEMONSTRATION');
        console.log('==========================================\n');
        const testInputs = [
            {
                input: "I hate this angry part of myself",
                description: "Shadow work needed - should trigger Alchemist mode suggestion"
            },
            {
                input: "I am always anxious and can't let go",
                description: "Attachment/identification - should trigger Buddha mode"
            },
            {
                input: "I feel both sad and grateful about this loss",
                description: "Paradox holding - should stay in Sage mode"
            },
            {
                input: "I had this incredible vision but don't know what it means",
                description: "Creative/visionary - should suggest Mystic mode"
            },
            {
                input: "I'm feeling overwhelmed and unsafe",
                description: "Need support/grounding - should suggest Guardian mode"
            }
        ];
        // Test each mode
        for (const mode of ['alchemist', 'buddha', 'sage', 'mystic', 'guardian']) {
            console.log(`\n🎭 TESTING ${mode.toUpperCase()} MODE`);
            console.log('='.repeat(30));
            // Switch to mode
            const switchResult = await this.oracle.switchMode(mode);
            console.log(`\n📢 Mode Introduction:`);
            console.log(`"${switchResult.message}"`);
            if (switchResult.wisdomApproachAdjustment) {
                console.log(`\n🧭 Wisdom Adjustment: ${switchResult.wisdomApproachAdjustment}`);
            }
            // Test with relevant input
            const relevantInput = testInputs.find(t => (mode === 'alchemist' && t.input.includes('hate')) ||
                (mode === 'buddha' && t.input.includes('always')) ||
                (mode === 'sage' && t.input.includes('both')) ||
                (mode === 'mystic' && t.input.includes('vision')) ||
                (mode === 'guardian' && t.input.includes('overwhelmed'))) || testInputs[0];
            console.log(`\n💭 Test Input: "${relevantInput.input}"`);
            const response = await this.oracle.respondToPrompt(relevantInput.input);
            console.log(`\n🗣️ Oracle Response:`);
            console.log(`"${response}"`);
            // Show current status
            const status = this.oracle.getCurrentModeStatus();
            console.log(`\n📊 Current Status:`);
            console.log(`   Oracle Mode: ${status.currentOracleMode}`);
            console.log(`   Wisdom Mode: ${status.currentWisdomMode}`);
            console.log(`   Sacred Mirror: ${status.sacredMirrorMode}`);
            if (status.wisdomRouting) {
                console.log(`   Routing: ${status.wisdomRouting.approach} (${(status.wisdomRouting.confidence * 100).toFixed(0)}%)`);
                console.log(`   Reasoning: ${status.wisdomRouting.reasoning}`);
            }
            console.log('\n' + '─'.repeat(60));
        }
    }
    async demonstrateModeSuggestions() {
        console.log('\n\n🎯 MODE SUGGESTION SYSTEM');
        console.log('==========================\n');
        const testCases = [
            {
                input: "I keep having nightmares about my childhood",
                expectedSuggestion: "alchemist",
                reason: "Shadow work and dream interpretation needed"
            },
            {
                input: "I'm so attached to this outcome, I can't sleep",
                expectedSuggestion: "buddha",
                reason: "Attachment causing suffering - liberation needed"
            },
            {
                input: "I'm confused about whether to stay or go in this relationship",
                expectedSuggestion: "sage",
                reason: "Complex decision requiring paradox navigation"
            },
            {
                input: "I felt this incredible creative energy but now I'm blocked",
                expectedSuggestion: "mystic",
                reason: "Creative emergence and artistic expression"
            },
            {
                input: "I'm having panic attacks and feel like I'm falling apart",
                expectedSuggestion: "guardian",
                reason: "Safety and grounding needed"
            }
        ];
        for (const testCase of testCases) {
            console.log(`💭 Input: "${testCase.input}"`);
            console.log(`🎯 Expected: ${testCase.expectedSuggestion} (${testCase.reason})`);
            const suggestion = await this.oracle.suggestModeForInput(testCase.input);
            console.log(`🤖 Suggested: ${suggestion.suggestedMode || 'No change needed'}`);
            if (suggestion.suggestedMode) {
                console.log(`   Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`);
                console.log(`   Reason: ${suggestion.reason}`);
                const correct = suggestion.suggestedMode === testCase.expectedSuggestion;
                console.log(`   ✅ Accuracy: ${correct ? 'CORRECT' : 'INCORRECT'}`);
            }
            console.log('');
        }
    }
    async demonstrateJungBuddhaIntegration() {
        console.log('\n\n🧿☸️ JUNG-BUDDHA INTEGRATION');
        console.log('=============================\n');
        const examples = [
            {
                mode: 'alchemist',
                input: "I hate how angry I get",
                expectedWisdom: "jung",
                expectedResponse: "Integration approach - anger as guardian"
            },
            {
                mode: 'buddha',
                input: "I AM an angry person",
                expectedWisdom: "buddha",
                expectedResponse: "Liberation approach - who is aware of anger?"
            },
            {
                mode: 'sage',
                input: "This anger keeps coming back",
                expectedWisdom: "hybrid",
                expectedResponse: "Both integration AND liberation"
            }
        ];
        for (const example of examples) {
            console.log(`🎭 Mode: ${example.mode}`);
            // Switch to mode
            await this.oracle.switchMode(example.mode);
            console.log(`💭 Input: "${example.input}"`);
            console.log(`🎯 Expected Wisdom: ${example.expectedWisdom}`);
            const response = await this.oracle.respondToPrompt(example.input);
            const wisdomMode = this.oracle.getCurrentWisdomMode();
            const routing = this.oracle.getWisdomRouting();
            console.log(`🧭 Actual Wisdom: ${wisdomMode}`);
            if (routing) {
                console.log(`   Approach: ${routing.approach}`);
                console.log(`   Confidence: ${(routing.confidence * 100).toFixed(0)}%`);
            }
            console.log(`🗣️ Response: "${response.substring(0, 120)}..."`);
            const correct = wisdomMode === example.expectedWisdom;
            console.log(`✅ Wisdom Accuracy: ${correct ? 'CORRECT' : 'INCORRECT'}`);
            console.log('');
        }
    }
    async demonstrateSacredWeeklyRhythm() {
        console.log('\n\n📅 SACRED WEEKLY RHYTHM INTEGRATION');
        console.log('====================================\n');
        // Today's practice
        const todaysPractice = await this.oracle.getTodaysSacredPractice();
        console.log('🌟 Today\'s Sacred Practice:');
        console.log(todaysPractice.substring(0, 200) + '...\n');
        // Weekly overview
        const weeklyOverview = await this.oracle.getWeeklySacredOverview();
        console.log('🌀 Weekly Overview:');
        console.log(weeklyOverview.substring(0, 300) + '...\n');
        // Pattern analysis
        const patternAnalysis = await this.oracle.analyzeUserPatterns();
        console.log('📊 Pattern Analysis:');
        console.log(JSON.stringify(patternAnalysis, null, 2));
    }
}
exports.StreamlinedOracleDemo = StreamlinedOracleDemo;
// ===============================================
// SIMPLE MODE COMPARISON
// ===============================================
exports.ModeComparison = {
    alchemist: {
        focus: 'Shadow Integration',
        wisdom: 'Jung (Integration)',
        approach: 'Transform lead into gold',
        greeting: '🧪 What shadows are ready to become gold?',
        suitable_for: ['dreams', 'shadow work', 'integration', 'patterns']
    },
    buddha: {
        focus: 'Spacious Liberation',
        wisdom: 'Buddha (Liberation)',
        approach: 'Non-attachment and presence',
        greeting: '☸️ Rest here in spacious awareness',
        suitable_for: ['attachment', 'overthinking', 'identity crisis', 'letting go']
    },
    sage: {
        focus: 'Paradox Navigation',
        wisdom: 'Hybrid (Both/And)',
        approach: 'Hold integration AND liberation',
        greeting: '🌀 What paradox are you living?',
        suitable_for: ['complex decisions', 'both/and situations', 'balanced approach']
    },
    mystic: {
        focus: 'Creative Emergence',
        wisdom: 'Hybrid (Creative Integration)',
        approach: 'Channel sacred fire and visions',
        greeting: '🔥 What visions are moving through you?',
        suitable_for: ['creativity', 'visions', 'artistic blocks', 'divine connection']
    },
    guardian: {
        focus: 'Safe Support',
        wisdom: 'Adaptive (Trauma-Informed)',
        approach: 'Gentle, grounded protection',
        greeting: '🌱 You\'re safe here. What do you need?',
        suitable_for: ['trauma', 'overwhelm', 'safety needs', 'gentle support']
    }
};
async function runStreamlinedDemo() {
    const demo = new StreamlinedOracleDemo();
    console.log('🚀 Running streamlined oracle demonstration...\n');
    await demo.demonstrateAllModes();
    await demo.demonstrateModeSuggestions();
    await demo.demonstrateJungBuddhaIntegration();
    await demo.demonstrateSacredWeeklyRhythm();
    console.log('\n✅ Streamlined oracle demonstration complete!');
    console.log('\n📊 Mode Summary:');
    console.table(exports.ModeComparison);
}
exports.default = {
    StreamlinedOracleDemo,
    ModeComparison: exports.ModeComparison,
    runStreamlinedDemo
};
