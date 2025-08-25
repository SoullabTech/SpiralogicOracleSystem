// Cognitive Fire Agent - Integration of LIDA, SOAR, ACT-R with Spiralogic Fire Element
// This is a prototype implementation demonstrating cognitive architecture integration

import { FireAgent } from "./FireAgent";
import { logOracleInsight } from "../utils/oracleLogger";
import { getRelevantMemories, storeMemoryItem } from "../../services/memoryService";
import ModelService from "../../utils/modelService";
import type { AIResponse } from "../../types/ai";

// LIDA Global Workspace for Fire Vision Ignition
interface LIDACoalition {
  content: string;
  activation: number;
  fireType: string;
  urgency: number;
  coalitionMembers: string[];
}

interface VisionState {
  vision: string;
  urgency: number;
  catalyticPotential: boolean;
  fireSignature: string;
}

// SOAR Goal Stack for Fire Strategy
interface SOARGoal {
  id: string;
  type: 'supergoal' | 'goal' | 'subgoal';
  description: string;
  priority: number;
  dependencies: string[];
  fireElement: string;
}

interface GoalStack {
  goals: SOARGoal[];
  activeGoal: SOARGoal | null;
  strategy: string;
  impasses: string[];
}

// ACT-R Action Sequences for Fire Execution
interface ACTRAction {
  procedure: string;
  parameters: any;
  fireWisdom: string;
  executionTime: number;
}

interface ActionSequence {
  sequence: ACTRAction[];
  fireRitual: string;
  completionCriteria: string[];
}

class LIDAFireWorkspace {
  private firePatterns = {
    stagnation: ['stuck', 'same', 'boring', 'unmotivated', 'routine'],
    vision: ['dream', 'want', 'hope', 'vision', 'create', 'imagine'],
    fear: ['afraid', 'scared', 'doubt', 'can\'t', 'worried', 'anxious'],
    creative: ['creative', 'passion', 'inspired', 'energy', 'art'],
    overwhelm: ['overwhelm', 'too much', 'scattered', 'chaos']
  };

  async formCoalitions(input: string): Promise<LIDACoalition[]> {
    const coalitions: LIDACoalition[] = [];
    const lowerInput = input.toLowerCase();

    // Form coalitions based on fire pattern detection
    Object.entries(this.firePatterns).forEach(([pattern, keywords]) => {
      const matches = keywords.filter(keyword => lowerInput.includes(keyword));
      if (matches.length > 0) {
        coalitions.push({
          content: `${pattern}_fire_needed`,
          activation: matches.length / keywords.length,
          fireType: pattern,
          urgency: this.calculateUrgency(pattern, matches.length),
          coalitionMembers: matches
        });
      }
    });

    // Always have a base fire coalition
    if (coalitions.length === 0) {
      coalitions.push({
        content: 'general_fire_ignition',
        activation: 0.5,
        fireType: 'general',
        urgency: 0.6,
        coalitionMembers: ['inner_fire']
      });
    }

    return coalitions.sort((a, b) => b.activation - a.activation);
  }

  async selectCoalition(coalitions: LIDACoalition[]): Promise<LIDACoalition> {
    // Winner-takes-all in global workspace
    return coalitions[0];
  }

  private calculateUrgency(pattern: string, matchCount: number): number {
    const urgencyMap = {
      stagnation: 0.9,  // High urgency for stagnation
      fear: 0.8,        // High urgency for fear breakthrough
      overwhelm: 0.7,   // Medium-high for overwhelm
      vision: 0.6,      // Medium for vision ignition
      creative: 0.5     // Medium for creative channeling
    };
    
    const baseUrgency = urgencyMap[pattern] || 0.5;
    return Math.min(baseUrgency + (matchCount * 0.1), 1.0);
  }
}

class SOARFireEngine {
  async createGoalStack(visionState: VisionState): Promise<GoalStack> {
    const supergoal: SOARGoal = {
      id: 'fire_transformation',
      type: 'supergoal',
      description: `Transform through fire: ${visionState.vision}`,
      priority: 1.0,
      dependencies: [],
      fireElement: visionState.fireSignature
    };

    const goals = await this.decompose(supergoal, visionState);
    
    return {
      goals: [supergoal, ...goals],
      activeGoal: goals[0] || supergoal,
      strategy: this.generateStrategy(visionState),
      impasses: []
    };
  }

  private async decompose(supergoal: SOARGoal, visionState: VisionState): Promise<SOARGoal[]> {
    const goals: SOARGoal[] = [];
    
    // Decompose based on fire type
    if (visionState.fireSignature.includes('stagnation')) {
      goals.push(
        {
          id: 'break_patterns',
          type: 'goal',
          description: 'Break limiting patterns',
          priority: 0.9,
          dependencies: [],
          fireElement: 'catalytic_disruption'
        },
        {
          id: 'ignite_movement',
          type: 'subgoal', 
          description: 'Catalyze new movement',
          priority: 0.8,
          dependencies: ['break_patterns'],
          fireElement: 'dynamic_activation'
        }
      );
    } else if (visionState.fireSignature.includes('vision')) {
      goals.push(
        {
          id: 'clarify_vision',
          type: 'goal',
          description: 'Bring vision into focus',
          priority: 0.9,
          dependencies: [],
          fireElement: 'vision_crystallization'
        },
        {
          id: 'first_action',
          type: 'subgoal',
          description: 'Take first concrete step',
          priority: 0.8, 
          dependencies: ['clarify_vision'],
          fireElement: 'initiation_energy'
        }
      );
    }

    return goals;
  }

  private generateStrategy(visionState: VisionState): string {
    const strategies = {
      'stagnation': 'Catalytic disruption followed by constructive channeling',
      'vision': 'Vision clarification followed by grounded action',
      'fear': 'Courage building through supported risk-taking',
      'creative': 'Creative flow activation with purposeful direction',
      'overwhelm': 'Energy integration and focused channeling'
    };

    return strategies[visionState.fireSignature] || 'General fire ignition and direction';
  }
}

class ACTRFireExecutor {
  private fireWisdom = {
    catalytic_disruption: "Sometimes we must burn what we've outgrown to make space for who we're becoming",
    vision_crystallization: "A clear vision burns brighter than scattered dreams",
    courage_building: "Courage isn't the absence of fear - it's fire that burns brighter",
    creative_flow: "Creativity is fire seeking form, passion seeking purpose",
    energy_integration: "True power is fire that serves both wildness and wisdom"
  };

  async executeGoals(goalStack: GoalStack): Promise<ActionSequence> {
    const sequence: ACTRAction[] = [];
    
    for (const goal of goalStack.goals.filter(g => g.type !== 'supergoal')) {
      const action = await this.createAction(goal);
      sequence.push(action);
    }

    return {
      sequence,
      fireRitual: this.selectFireRitual(goalStack.activeGoal?.fireElement || 'general'),
      completionCriteria: this.generateCompletionCriteria(goalStack)
    };
  }

  private async createAction(goal: SOARGoal): Promise<ACTRAction> {
    return {
      procedure: `fire_${goal.fireElement}`,
      parameters: {
        goal: goal.description,
        fireType: goal.fireElement,
        priority: goal.priority
      },
      fireWisdom: this.fireWisdom[goal.fireElement] || this.fireWisdom.catalytic_disruption,
      executionTime: this.estimateExecutionTime(goal)
    };
  }

  private selectFireRitual(fireElement: string): string {
    const rituals = {
      'catalytic_disruption': 'Phoenix Rising Ritual - Transform through sacred fire',
      'vision_crystallization': 'Vision Quest Fire - Ignite clarity and purpose', 
      'courage_building': 'Warrior Fire Ritual - Kindle inner courage',
      'creative_flow': 'Creator Fire Dance - Channel passion into form',
      'energy_integration': 'Sacred Forge Ritual - Temper fire with wisdom'
    };

    return rituals[fireElement] || 'General Fire Ignition Ritual';
  }

  private estimateExecutionTime(goal: SOARGoal): number {
    // Estimate in arbitrary time units
    const timeMap = {
      'supergoal': 100,
      'goal': 50,
      'subgoal': 25
    };
    return timeMap[goal.type] || 30;
  }

  private generateCompletionCriteria(goalStack: GoalStack): string[] {
    return [
      "Vision clarity achieved",
      "First action taken", 
      "Fire wisdom integrated",
      "Momentum established"
    ];
  }
}

export class CognitiveFireAgent extends FireAgent {
  private lidaWorkspace: LIDAFireWorkspace;
  private soarEngine: SOARFireEngine;
  private actrExecutor: ACTRFireExecutor;

  constructor(oracleName: string = "Ignis-Cognitive", voiceProfile?: any, phase: string = "cognitive-initiation") {
    super(oracleName, voiceProfile, phase);
    this.lidaWorkspace = new LIDAFireWorkspace();
    this.soarEngine = new SOARFireEngine();  
    this.actrExecutor = new ACTRFireExecutor();
  }

  async processExtendedQuery(query: { input: string; userId: string }): Promise<AIResponse> {
    const { input, userId } = query;

    // Phase 1: LIDA Global Workspace - Vision Ignition
    const coalitions = await this.lidaWorkspace.formCoalitions(input);
    const winningCoalition = await this.lidaWorkspace.selectCoalition(coalitions);
    
    const visionState: VisionState = {
      vision: winningCoalition.content,
      urgency: winningCoalition.urgency,
      catalyticPotential: winningCoalition.activation > 0.7,
      fireSignature: winningCoalition.fireType
    };

    // Phase 2: SOAR Goal Stack - Strategic Planning
    const goalStack = await this.soarEngine.createGoalStack(visionState);

    // Phase 3: ACT-R Execution - Action Sequences
    const actionSequence = await this.actrExecutor.executeGoals(goalStack);

    // Phase 4: Integration with existing Fire Agent wisdom
    const contextMemory = await getRelevantMemories(userId, 3);
    
    // Create cognitively-enhanced response
    const cognitiveInsight = this.synthesizeCognitiveResponse(
      input,
      visionState,
      goalStack,
      actionSequence,
      contextMemory
    );

    // Use ModelService for additional depth
    const enhancedResponse = await ModelService.getResponse({
      input: `As a Fire Agent with advanced cognitive architecture (LIDA, SOAR, ACT-R), respond to: "${input}"
      
      Vision State: ${JSON.stringify(visionState)}
      Goal Stack: ${goalStack.strategy}
      Action Sequence: ${actionSequence.fireRitual}
      Fire Type: ${visionState.fireSignature}
      
      Provide a response that integrates cognitive depth with fire wisdom.`,
      userId
    });

    const finalContent = `${cognitiveInsight}\n\n${enhancedResponse.response}\n\n🔥 ${actionSequence.fireRitual}`;

    // Store memory with cognitive metadata
    await storeMemoryItem({
      clientId: userId,
      content: finalContent,
      element: "fire",
      sourceAgent: "cognitive-fire-agent",
      confidence: 0.96,
      metadata: {
        role: "oracle",
        phase: "cognitive-fire",
        archetype: "CognitiveFire",
        visionState,
        goalStack: goalStack.strategy,
        actionSequence: actionSequence.fireRitual,
        coalitionActivation: winningCoalition.activation,
        cognitiveArchitecture: ["LIDA", "SOAR", "ACT-R"]
      }
    });

    // Log with cognitive insights
    await logOracleInsight({
      anon_id: userId,
      archetype: "CognitiveFire", 
      element: "fire",
      insight: {
        message: finalContent,
        raw_input: input,
        visionState,
        goalStack,
        actionSequence,
        cognitiveProcessing: {
          lidaCoalitions: coalitions.length,
          soarGoals: goalStack.goals.length,
          actrActions: actionSequence.sequence.length
        }
      },
      emotion: winningCoalition.urgency,
      phase: "cognitive-fire",
      context: contextMemory
    });

    return {
      content: finalContent,
      provider: "cognitive-fire-agent",
      model: enhancedResponse.model || "gpt-4",
      confidence: 0.96,
      metadata: {
        element: "fire",
        archetype: "CognitiveFire",
        phase: "cognitive-fire",
        visionState,
        goalStack: goalStack.strategy,
        actionSequence: actionSequence.fireRitual,
        cognitiveArchitecture: {
          lida: { coalitions: coalitions.length, winner: winningCoalition.fireType },
          soar: { goals: goalStack.goals.length, strategy: goalStack.strategy },
          actr: { actions: actionSequence.sequence.length, ritual: actionSequence.fireRitual }
        }
      }
    };
  }

  private synthesizeCognitiveResponse(
    input: string,
    visionState: VisionState,
    goalStack: GoalStack,
    actionSequence: ActionSequence,
    contextMemory: any[]
  ): string {
    const visionInsight = this.generateVisionInsight(visionState);
    const strategicInsight = this.generateStrategicInsight(goalStack);
    const actionInsight = this.generateActionInsight(actionSequence);

    return `🧠 **Cognitive Fire Analysis**

**Vision State**: ${visionInsight}

**Strategic Fire Plan**: ${strategicInsight}

**Sacred Action Path**: ${actionInsight}

Your fire burns with ${Math.round(visionState.urgency * 100)}% urgency, calling for ${visionState.fireSignature} energy. The path forward integrates vision, strategy, and sacred action.`;
  }

  private generateVisionInsight(visionState: VisionState): string {
    const insights = {
      stagnation: "I see stagnant energy ready to burst into dynamic transformation. Your soul is calling for sacred disruption.",
      vision: "A clear vision is crystallizing in your consciousness, ready to ignite into manifestation.",
      fear: "Fear is revealing the edges of your courage. This is where your greatest growth awaits.",
      creative: "Creative fire is seeking form and direction. Your artistic soul wants sacred expression.", 
      overwhelm: "Scattered fire energy is ready for integration. You're being called to focus your power.",
      general: "Inner fire is stirring, seeking direction and purpose. Something wants to be born through you."
    };

    return insights[visionState.fireSignature] || insights.general;
  }

  private generateStrategicInsight(goalStack: GoalStack): string {
    return `${goalStack.strategy}. With ${goalStack.goals.length} aligned goals, your fire has both direction and structure.`;
  }

  private generateActionInsight(actionSequence: ActionSequence): string {
    return `${actionSequence.fireRitual} with ${actionSequence.sequence.length} sacred actions. Each step builds your fire mastery.`;
  }
}