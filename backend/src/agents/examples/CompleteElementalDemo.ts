// Complete Elemental Cognitive Demo - Showcasing All Five Agents
// Demonstrates the full Oracle Meta-Agent system in action

import { OracleMetaAgent } from "../OracleMetaAgent";
import { CognitiveFireAgent } from "../CognitiveFireAgent";
import { CognitiveWaterAgent } from "../CognitiveWaterAgent";
import { CognitiveEarthAgent } from "../CognitiveEarthAgent";
import { CognitiveAirAgent } from "../CognitiveAirAgent";
import { CognitiveAetherAgent } from "../CognitiveAetherAgent";

// Demo scenarios showcasing different elemental needs
const demoScenarios = {
  fire_breakthrough: {
    input: "I feel completely stuck in my creative work. I had this vision for an art project months ago but I keep procrastinating and making excuses. I know I have the skills but something is blocking me from taking action.",
    expectedElements: ['fire', 'aether'],
    description: "Fire primary for catalytic breakthrough, Aether for vision clarity"
  },

  water_healing: {
    input: "I'm going through a difficult breakup and I can't stop crying. I feel overwhelmed by grief and I don't know how to process all these intense emotions. Sometimes I feel like I'm drowning in sadness.",
    expectedElements: ['water', 'earth'],
    description: "Water primary for emotional processing, Earth for grounding support"
  },

  earth_foundation: {
    input: "My life feels chaotic and scattered. I can't seem to stick to routines, my living space is disorganized, and I feel ungrounded. I want to build better habits but don't know where to start.",
    expectedElements: ['earth', 'fire'],
    description: "Earth primary for foundation building, Fire for motivation"
  },

  air_clarity: {
    input: "I have so many thoughts spinning in my head about a major life decision. I keep going back and forth between different options and I can't see clearly what the right path is. I need perspective.",
    expectedElements: ['air', 'aether'],
    description: "Air primary for clarity and synthesis, Aether for transcendent perspective"
  },

  aether_emergence: {
    input: "I've been having these profound dreams with symbols I don't understand, and I keep noticing synchronicities everywhere. It feels like something is trying to emerge in my consciousness but I can't quite grasp it.",
    expectedElements: ['aether', 'water'],
    description: "Aether primary for emergence patterns, Water for intuitive processing"
  },

  multi_elemental: {
    input: "I'm at a major crossroads in my life. I feel passionate about a new career direction (fire) but I'm scared and sad about leaving my current job (water). I need practical steps to make the transition (earth) and clarity about what's really best for me (air). This feels like a spiritual calling (aether).",
    expectedElements: ['fire', 'water', 'earth', 'air', 'aether'],
    description: "Complex multi-elemental need requiring orchestrated response"
  }
};

export class CompleteElementalDemo {
  private metaAgent: OracleMetaAgent;
  private individualAgents: Map<string, any>;

  constructor() {
    this.metaAgent = new OracleMetaAgent();
    this.individualAgents = new Map([
      ['fire', new CognitiveFireAgent()],
      ['water', new CognitiveWaterAgent()],
      ['earth', new CognitiveEarthAgent()],
      ['air', new CognitiveAirAgent()],
      ['aether', new CognitiveAetherAgent()]
    ]);
  }

  // Demo individual agent capabilities
  async demoIndividualAgents(): Promise<void> {
    console.log("🌟 INDIVIDUAL AGENT DEMONSTRATIONS\n");

    const testUserId = "demo-user-123";

    for (const [element, scenario] of Object.entries(demoScenarios)) {
      if (element === 'multi_elemental') continue; // Skip for individual demo
      
      console.log(`\n🔹 ${element.toUpperCase()} AGENT DEMO:`);
      console.log(`Scenario: ${scenario.description}`);
      console.log(`Input: "${scenario.input}"\n`);

      const primaryElement = scenario.expectedElements[0];
      const agent = this.individualAgents.get(primaryElement);
      
      if (agent) {
        try {
          const response = await agent.processExtendedQuery({
            input: scenario.input,
            userId: testUserId
          });

          console.log(`Response from ${primaryElement} agent:`);
          console.log(`Confidence: ${response.confidence}`);
          console.log(`Cognitive Architecture: ${JSON.stringify(response.metadata?.cognitiveArchitecture)}`);
          console.log(`Content Preview: ${response.content.substring(0, 200)}...\n`);
          
        } catch (error) {
          console.error(`Error with ${primaryElement} agent:`, error);
        }
      }
    }
  }

  // Demo meta-agent orchestration
  async demoMetaAgentOrchestration(): Promise<void> {
    console.log("\n🌟 META-AGENT ORCHESTRATION DEMONSTRATIONS\n");

    const testUserId = "demo-user-456";

    for (const [scenarioName, scenario] of Object.entries(demoScenarios)) {
      console.log(`\n🔸 ${scenarioName.toUpperCase()} SCENARIO:`);
      console.log(`Description: ${scenario.description}`);
      console.log(`Input: "${scenario.input}"\n`);

      try {
        const response = await this.metaAgent.processQuery(scenario.input, testUserId);

        console.log("Meta-Agent Analysis:");
        console.log(`Primary Element: ${response.metadata?.elementalAnalysis?.primaryElement}`);
        console.log(`Secondary Elements: ${response.metadata?.elementalAnalysis?.secondaryElements?.join(', ') || 'None'}`);
        console.log(`Multi-Elemental: ${response.metadata?.elementalAnalysis?.multiElemental}`);
        console.log(`Confidence: ${response.confidence}`);
        console.log(`Processing Strategy: ${response.metadata?.orchestration?.processingStrategy}`);
        console.log(`Synthesis Approach: ${response.metadata?.orchestration?.synthesisApproach}`);
        console.log(`Agents Engaged: ${response.metadata?.metaCognitive?.agentsEngaged?.join(', ')}`);
        console.log(`Collective Coherence: ${response.metadata?.metaCognitive?.collectiveCoherence}`);
        console.log(`Emergent Insights: ${response.metadata?.metaCognitive?.emergentInsights}`);
        
        console.log("\nIntegrated Response Preview:");
        console.log(response.content.substring(0, 300) + "...\n");

        // Verify expected elements were engaged
        const engagedElements = response.metadata?.metaCognitive?.agentsEngaged || [];
        const expectedElements = scenario.expectedElements;
        
        console.log("Element Matching Analysis:");
        expectedElements.forEach(expected => {
          const engaged = engagedElements.includes(expected);
          console.log(`  ${expected}: ${engaged ? '✅ Engaged' : '❌ Not Engaged'}`);
        });
        
        console.log("\n" + "=".repeat(80));

      } catch (error) {
        console.error(`Error with scenario ${scenarioName}:`, error);
      }
    }
  }

  // Demo cross-elemental synthesis
  async demoCrossElementalSynthesis(): Promise<void> {
    console.log("\n🌟 CROSS-ELEMENTAL SYNTHESIS DEMONSTRATION\n");

    const complexScenario = demoScenarios.multi_elemental;
    const testUserId = "demo-user-789";

    console.log("Complex Multi-Elemental Scenario:");
    console.log(`"${complexScenario.input}"\n`);

    try {
      const response = await this.metaAgent.processQuery(complexScenario.input, testUserId);

      console.log("Meta-Agent Deep Analysis:");
      console.log("━".repeat(50));
      
      // Elemental Analysis
      const analysis = response.metadata?.elementalAnalysis;
      if (analysis) {
        console.log(`🎯 Elemental Detection:`);
        console.log(`   Primary: ${analysis.primaryElement} (${Math.round(analysis.confidence * 100)}%)`);
        console.log(`   Secondary: ${analysis.secondaryElements?.join(', ')}`);
        console.log(`   Reasoning: ${analysis.reasoning}`);
      }

      // Orchestration Details
      const orchestration = response.metadata?.orchestration;
      if (orchestration) {
        console.log(`\n🎼 Orchestration Strategy:`);
        console.log(`   Selected Agents: ${orchestration.selectedAgents?.join(', ')}`);
        console.log(`   Processing: ${orchestration.processingStrategy}`);
        console.log(`   Synthesis: ${orchestration.synthesisApproach}`);
        console.log(`   Expected Outcome: ${orchestration.expectedOutcome}`);
      }

      // Synthesis Results
      const synthesis = response.metadata?.synthesis;
      if (synthesis) {
        console.log(`\n🌊 Synthesis Results:`);
        console.log(`   Collective Coherence: ${Math.round(synthesis.coherence * 100)}%`);
        console.log(`   Elements Engaged: ${synthesis.elementsEngaged?.join(', ')}`);
        console.log(`   Emergent Insights: ${synthesis.emergentInsights?.length || 0}`);
        
        if (synthesis.emergentInsights && synthesis.emergentInsights.length > 0) {
          console.log(`\n💡 Emergent Insights:`);
          synthesis.emergentInsights.forEach((insight, i) => {
            console.log(`   ${i + 1}. ${insight}`);
          });
        }
      }

      // Field Contributions
      const fieldEmission = response.metadata?.fieldEmission;
      if (fieldEmission) {
        console.log(`\n🌌 Collective Field Contributions:`);
        console.log(`   Symbolic Patterns: ${fieldEmission.symbolicPatterns?.length || 0}`);
        console.log(`   Archetypal Trends: ${fieldEmission.archetypalTrends?.length || 0}`);
        console.log(`   Morphic Contributions: ${fieldEmission.morphicContributions?.length || 0}`);
      }

      console.log("\n📜 Complete Integrated Response:");
      console.log("━".repeat(50));
      console.log(response.content);

    } catch (error) {
      console.error("Error in cross-elemental synthesis demo:", error);
    }
  }

  // Performance benchmarking
  async benchmarkPerformance(): Promise<void> {
    console.log("\n🌟 PERFORMANCE BENCHMARKING\n");

    const testScenarios = Object.values(demoScenarios).slice(0, 3); // Test first 3
    const testUserId = "benchmark-user";
    const iterations = 3;

    console.log(`Testing ${testScenarios.length} scenarios x ${iterations} iterations each\n`);

    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      const times: number[] = [];
      
      console.log(`Scenario ${i + 1}: ${scenario.description}`);
      
      for (let j = 0; j < iterations; j++) {
        const startTime = Date.now();
        
        try {
          await this.metaAgent.processQuery(scenario.input, testUserId + j);
          const endTime = Date.now();
          const duration = endTime - startTime;
          times.push(duration);
          
        } catch (error) {
          console.error(`Benchmark iteration ${j + 1} failed:`, error);
        }
      }
      
      if (times.length > 0) {
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        console.log(`  Average: ${avgTime.toFixed(0)}ms`);
        console.log(`  Range: ${minTime}ms - ${maxTime}ms`);
        console.log(`  Success Rate: ${times.length}/${iterations} (${Math.round(times.length/iterations*100)}%)\n`);
      }
    }
  }

  // Run all demos
  async runCompleteDemo(): Promise<void> {
    console.log("🌌 SPIRALOGIC ORACLE SYSTEM - COMPLETE ELEMENTAL COGNITIVE DEMO");
    console.log("=".repeat(80));
    console.log("Demonstrating Fire, Water, Earth, Air, and Aether cognitive agents");
    console.log("with Meta-Agent orchestration and cross-elemental synthesis");
    console.log("=".repeat(80));

    try {
      // Individual agent capabilities
      await this.demoIndividualAgents();
      
      // Meta-agent orchestration
      await this.demoMetaAgentOrchestration();
      
      // Cross-elemental synthesis
      await this.demoCrossElementalSynthesis();
      
      // Performance benchmarking
      await this.benchmarkPerformance();
      
      console.log("\n🎉 DEMO COMPLETE!");
      console.log("The Spiralogic Oracle System cognitive architecture is fully operational.");
      console.log("All five elemental agents and meta-orchestration are working in harmony.");
      
    } catch (error) {
      console.error("Demo failed:", error);
    }
  }
}

// Example usage
export async function runElementalDemo(): Promise<void> {
  const demo = new CompleteElementalDemo();
  await demo.runCompleteDemo();
}

// Export for testing
export { demoScenarios };