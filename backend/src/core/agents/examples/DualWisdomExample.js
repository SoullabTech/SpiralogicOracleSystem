// ===============================================
// DUAL WISDOM SYSTEM DEMONSTRATION
// Simple + Sophisticated Jung-Buddha Detection
// ===============================================
import { PersonalOracleAgent } from '../PersonalOracleAgent.js';
export class DualWisdomDemo {
    constructor() {
        this.oracle = new PersonalOracleAgent({
            userId: 'dual-wisdom-demo',
            oracleName: 'Dual Wisdom Mirror',
            mode: 'daily',
            elementalResonance: 'aether'
        });
    }
    async demonstrateDualDetection() {
        console.log('🔬 DUAL WISDOM DETECTION SYSTEM');
        console.log('================================\n');
        // Test cases where both systems should agree
        console.log('✅ AGREEMENT CASES (Both systems detect same approach)\n');
        await this.testInput("I am always angry", "Expected: Buddha (grasping/identity attachment)");
        await this.testInput("I don't want to face this part of myself", "Expected: Jung (avoidance/denial)");
        await this.testInput("I hate how anxious I get", "Expected: Jung (emotional rejection)");
        // Test cases where systems might disagree
        console.log('\n⚖️ POTENTIAL DISAGREEMENT CASES\n');
        await this.testInput("I never feel good enough", "Simple: Buddha (never = attachment), Sophisticated: May detect deeper pattern");
        await this.testInput("This pattern keeps returning", "Simple: Hybrid (default), Sophisticated: May detect specific recurring pattern");
        await this.testInput("I must figure this out right now", "Simple: Buddha (must = grasping), Sophisticated: May consider crisis context");
        // Test balance detection
        console.log('\n🌀 BALANCE DETECTION\n');
        // Simulate conversation history with predominant Jung mode
        await this.simulateConversationHistory();
        await this.testInput("I'm feeling stuck again", "Expected: Balance detection - if too much Jung, switch to Buddha");
        // Test low confidence scenarios
        console.log('\n🤔 LOW CONFIDENCE SCENARIOS\n');
        await this.testInput("Things are just okay I guess", "Expected: Low confidence - defer to simple detection");
        await this.testInput("It's complicated", "Expected: Sophisticated may have low confidence, simple provides backup");
    }
    async testInput(input, expectedBehavior) {
        console.log(`💭 Input: "${input}"`);
        console.log(`📋 Expected: ${expectedBehavior}`);
        // Get the response which will trigger both detection systems
        const response = await this.oracle.respondToPrompt(input);
        // Get the results from both systems
        const simpleMode = this.oracle.getCurrentWisdomMode();
        const sophisticatedRouting = this.oracle.getWisdomRouting();
        console.log(`🔍 Simple Detection: ${simpleMode}`);
        if (sophisticatedRouting) {
            console.log(`🧠 Sophisticated Detection: ${sophisticatedRouting.approach} (confidence: ${sophisticatedRouting.confidence.toFixed(2)})`);
            console.log(`💡 Reasoning: ${sophisticatedRouting.reasoning}`);
            if (sophisticatedRouting.adjustments) {
                console.log(`⚙️ Adjustments: ${JSON.stringify(sophisticatedRouting.adjustments)}`);
            }
            // Check agreement
            const agreement = simpleMode === sophisticatedRouting.approach;
            console.log(`🤝 Agreement: ${agreement ? '✅ Yes' : '❌ No'}`);
            if (!agreement) {
                console.log(`📊 Confidence Impact: ${sophisticatedRouting.confidence < 0.6 ? 'Simple mode used due to low confidence' : 'Sophisticated mode used'}`);
            }
        }
        else {
            console.log('🧠 Sophisticated Detection: No routing available');
        }
        console.log(`🗣️ Response: "${response.substring(0, 100)}..."`);
        console.log('─'.repeat(60));
        console.log('');
    }
    async simulateConversationHistory() {
        console.log('🎭 Simulating conversation history with predominant Jung mode...\n');
        // Simulate several Jung-mode interactions
        const jungInputs = [
            "I hate this part of myself",
            "I don't want to look at my shadow",
            "I can't stand my anger",
            "I refuse to accept this"
        ];
        for (const input of jungInputs) {
            await this.oracle.respondToPrompt(input);
            console.log(`   Simulated: "${input}" → Jung mode`);
        }
        console.log('\n📊 Memory now has predominant Jung pattern\n');
    }
    async demonstrateWisdomBalancing() {
        console.log('⚖️ WISDOM BALANCING DEMONSTRATION');
        console.log('=================================\n');
        // Show how the system balances between approaches over time
        const conversationSequence = [
            { input: "I am so attached to this outcome", expectedBalance: "Buddha for attachment" },
            { input: "I am desperate for this to work", expectedBalance: "Buddha for desperation" },
            { input: "I must have this", expectedBalance: "Buddha for grasping" },
            { input: "I need to control everything", expectedBalance: "Should switch to Jung for balance" },
            { input: "I don't want to feel this", expectedBalance: "Jung for avoidance" },
            { input: "This feeling is too much", expectedBalance: "Could be Buddha for spaciousness" }
        ];
        for (let i = 0; i < conversationSequence.length; i++) {
            const { input, expectedBalance } = conversationSequence[i];
            console.log(`\n--- Turn ${i + 1} ---`);
            await this.testInput(input, expectedBalance);
            // Show conversation memory state
            const wisdomHistory = this.getWisdomHistory();
            console.log(`📈 Wisdom History: ${wisdomHistory.join(' → ')}`);
        }
    }
    getWisdomHistory() {
        // This would access the conversation memory to show wisdom mode progression
        // For demo purposes, we'll return a sample
        return ['jung', 'jung', 'buddha', 'buddha', 'hybrid'];
    }
    async testEdgeCases() {
        console.log('\n🔬 EDGE CASE TESTING');
        console.log('====================\n');
        const edgeCases = [
            {
                input: "I am avoiding what I must face",
                description: "Contains both grasping (must) and avoidance language",
                expected: "Systems may disagree - simple might pick one, sophisticated considers both"
            },
            {
                input: "I never want to be this way again",
                description: "Contains attachment (never) and avoidance (don't want)",
                expected: "Hybrid approach likely from sophisticated system"
            },
            {
                input: "I always refuse to look at my shadow",
                description: "Attachment to identity (always) + shadow work needed",
                expected: "Complex pattern requiring nuanced response"
            },
            {
                input: "Help",
                description: "Minimal input with no clear indicators",
                expected: "Low confidence, default behaviors"
            },
            {
                input: "I'm fine everything is perfect",
                description: "Potential spiritual bypassing",
                expected: "Sophisticated system may detect bypassing pattern"
            }
        ];
        for (const testCase of edgeCases) {
            console.log(`🧪 Edge Case: ${testCase.description}`);
            await this.testInput(testCase.input, testCase.expected);
        }
    }
    async showSystemComparison() {
        console.log('\n📊 SYSTEM COMPARISON SUMMARY');
        console.log('============================\n');
        console.log('🔸 **Simple Wisdom Detection:**');
        console.log('  • Fast, lightweight pattern matching');
        console.log('  • Clear rules: "I am" → Buddha, "I don\'t want" → Jung');
        console.log('  • Memory-based balancing');
        console.log('  • Good for obvious cases');
        console.log('');
        console.log('🔸 **Sophisticated Wisdom Engine:**');
        console.log('  • Deep pattern analysis with confidence scoring');
        console.log('  • Context-aware routing with detailed reasoning');
        console.log('  • Handles complex emotional patterns');
        console.log('  • Crisis detection and specialized responses');
        console.log('');
        console.log('🔸 **Hybrid System Benefits:**');
        console.log('  • Simple system provides quick baseline');
        console.log('  • Sophisticated system handles complexity');
        console.log('  • Fallback to simple when confidence is low');
        console.log('  • Comparative validation between approaches');
        console.log('  • Best of both worlds: speed + sophistication');
    }
}
// ===============================================
// SPECIFIC COMPARISON TESTS
// ===============================================
export const DualWisdomTestCases = [
    {
        name: "Clear Grasping Pattern",
        input: "I am always like this",
        simple: "buddha", // "I am" + "always" = grasping
        sophisticated: "buddha", // Attachment pattern detected
        agreement: true
    },
    {
        name: "Clear Avoidance Pattern",
        input: "I don't want to face my anger",
        simple: "jung", // "I don't want" = avoidance
        sophisticated: "jung", // Avoidance + shadow material
        agreement: true
    },
    {
        name: "Complex Emotional Pattern",
        input: "I hate how angry I get",
        simple: "jung", // "I hate this part" pattern
        sophisticated: "jung", // Specific anger rejection pattern
        agreement: true
    },
    {
        name: "Identity Over-attachment",
        input: "I AM an anxious person",
        simple: "buddha", // "I am" = grasping
        sophisticated: "buddha", // Identity over-attachment detected
        agreement: true
    },
    {
        name: "Recurring Pattern",
        input: "This fear keeps coming back",
        simple: "hybrid", // No clear simple indicators
        sophisticated: "hybrid", // Recurring pattern detected
        agreement: true
    },
    {
        name: "Potential Disagreement",
        input: "I never feel good enough but I hate working on myself",
        simple: "buddha", // "never" detected first
        sophisticated: "hybrid", // Both attachment and avoidance
        agreement: false
    },
    {
        name: "Minimal Input",
        input: "I'm stuck",
        simple: "hybrid", // Default
        sophisticated: "uncertain", // Low confidence
        agreement: "fallback_to_simple"
    }
];
export async function runDualWisdomTests() {
    const demo = new DualWisdomDemo();
    console.log('🚀 Running comprehensive dual wisdom system tests...\n');
    await demo.demonstrateDualDetection();
    await demo.demonstrateWisdomBalancing();
    await demo.testEdgeCases();
    await demo.showSystemComparison();
    console.log('\n✅ Dual wisdom system testing complete!');
}
export default {
    DualWisdomDemo,
    DualWisdomTestCases,
    runDualWisdomTests
};
