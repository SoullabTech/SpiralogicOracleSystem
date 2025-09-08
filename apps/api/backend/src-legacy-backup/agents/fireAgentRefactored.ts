/**
 * Fire Agent - Refactored with Human-Centered Spiritual Support
 *
 * This agent facilitates exploration of passion, action, and transformation themes
 * while maintaining clear boundaries between AI support and user spiritual agency.
 */

import { OracleAgent } from "./oracleAgent";
import { logOracleInsight } from "../utils/oracleLogger";
import {
  getRelevantMemories,
  storeMemoryItem,
} from "../../services/memoryService";
import ModelService from "../../utils/modelService";
import type { AIResponse } from "../../types/ai";
import {
  HumanCenteredSpiritualSupport,
  FACILITATOR_RESPONSES,
  BoundaryEnforcer,
  UserAgencyReinforcer,
} from "../frameworks/HumanCenteredSpiritualSupport";

/**
 * Fire facilitation protocols - Supporting user exploration of passion and action
 * No mystical claims or spiritual authority
 */
const FireFacilitationProtocols = {
  // GREETING - Welcoming without claiming to sense or feel
  greeting: {
    initial:
      "Welcome. Let's explore what's stirring in your journey around passion and action.",
    returning:
      "Good to connect again. What developments have emerged since we last explored together?",
    contextual:
      "You've been reflecting on transformation themes. What's present for you now?",
  },

  // EXPLORATION PROMPTS - Questions that empower user insight
  exploration: {
    passion: "What areas of your life feel most energizing to you right now?",
    action: "What actions are you considering? What might be the first step?",
    transformation:
      "You've mentioned change. How would you describe what's shifting?",
    resistance: "Where do you notice resistance? What might it be protecting?",
  },

  // REFLECTION SUPPORT - Helping users process their own insights
  reflection: {
    validation:
      "Your insight about [topic] sounds significant. What does it mean to you?",
    deepening:
      "You've identified [pattern]. How does this connect to your broader journey?",
    integration:
      "Based on what you've shared, how might you bring this awareness into daily life?",
    celebration:
      "You've made progress with [achievement]. How does this feel for you?",
  },

  // PRACTICAL TOOLS - Concrete practices without mystical framing
  practices: {
    journaling: "Consider journaling about what energizes you this week.",
    action_steps:
      "You might create a simple action plan for the next three days.",
    energy_tracking:
      "Notice when you feel most motivated and what conditions support that.",
    reflection_questions:
      "Some questions to explore: What matters most? What's ready to change?",
  },
};

/**
 * Fire theme detection based on user input
 * Returns themes without claiming mystical perception
 */
const detectFireThemes = (
  input: string,
  memories: any[],
): {
  themes: string[];
  suggestedFocus: string;
} => {
  const themes: string[] = [];
  const lowerInput = input.toLowerCase();

<<<<<<< HEAD
  // Detect themes from user's own words
=======
  // Detect themes from user&apos;s own words
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
  if (lowerInput.includes("stuck") || lowerInput.includes("stagnant")) {
    themes.push("movement_seeking");
  }
  if (lowerInput.includes("passion") || lowerInput.includes("excited")) {
    themes.push("passion_exploration");
  }
  if (lowerInput.includes("change") || lowerInput.includes("transform")) {
    themes.push("transformation_process");
  }
  if (lowerInput.includes("fear") || lowerInput.includes("hesitat")) {
    themes.push("courage_building");
  }
  if (lowerInput.includes("energy") || lowerInput.includes("motivat")) {
    themes.push("energy_awareness");
  }

  // Analyze patterns from memories without mystical interpretation
  const recentThemes = memories
    .filter((m) => m.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .map((m) => m.content.toLowerCase());

  if (recentThemes.some((t) => t.includes("goal") || t.includes("dream"))) {
    themes.push("goal_clarification");
  }

  // Suggest focus based on detected themes
  let suggestedFocus = "exploring what energizes you";
  if (themes.includes("movement_seeking")) {
    suggestedFocus = "identifying small steps forward";
  } else if (themes.includes("transformation_process")) {
    suggestedFocus = "navigating change with clarity";
  }

  return { themes, suggestedFocus };
};

export class FireAgentRefactored extends OracleAgent {
  name = "Fire Facilitator";
  description =
    "Supports exploration of passion, action, and transformation themes";

  constructor() {
    super(
      "fire",
      "Fire themes: passion, action, transformation, courage, creativity",
      0.9, // High relevance for action-oriented queries
    );
  }

  /**
   * Process user query while maintaining appropriate boundaries
   */
  async processQuery(
    input: string,
    userId: string,
    context?: any,
  ): Promise<AIResponse> {
    try {
<<<<<<< HEAD
      // Get user's previous reflections
=======
      // Get user&apos;s previous reflections
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
      const memories = await getRelevantMemories(userId, 10);

      // Detect themes from user input
      const { themes, suggestedFocus } = detectFireThemes(input, memories);

      // Build facilitation response
      let response = await this.buildFacilitationResponse(
        input,
        themes,
        memories,
      );

      // Validate and enforce boundaries
      const validation = BoundaryEnforcer.validateResponse(response);
      if (!validation.isValid) {
        response = BoundaryEnforcer.transformResponse(response);
      }

      // Reinforce user agency
      response = UserAgencyReinforcer.reinforceAgency(response);

      // Store the interaction for continuity
      await storeMemoryItem({
        user_id: userId,
        content: input,
        element: "fire",
        source_agent: this.name,
        metadata: {
          themes,
          suggested_focus: suggestedFocus,
          interaction_type: "facilitation",
        },
      });

      // Log for monitoring (without mystical claims)
      await logOracleInsight({
        userId,
        agentType: "fire-facilitator",
        insightType: "theme_exploration",
        query: input,
        response,
        metadata: { themes, boundary_compliant: true },
      });

      return {
        content: response,
        provider: "fire-facilitator",
        model: "human-centered-support",
        confidence: 0.95,
        metadata: {
          themes,
          suggested_focus: suggestedFocus,
          facilitator_role: true,
          user_agency_emphasized: true,
        },
      };
    } catch (error) {
      logger.error("Fire facilitation error:", error);

      // Error response that maintains boundaries
      return {
        content:
<<<<<<< HEAD
          "I notice there was an interruption. Let's return to your reflection when you're ready. What would you like to explore about passion or action in your life?",
=======
          "I notice there was an interruption. Let&apos;s return to your reflection when you&apos;re ready. What would you like to explore about passion or action in your life?",
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
        provider: "fire-facilitator",
        model: "human-centered-support",
        confidence: 0.8,
        metadata: {
          error_handled: true,
          boundary_compliant: true,
        },
      };
    }
  }

  /**
   * Build response based on themes while maintaining facilitator role
   */
  private async buildFacilitationResponse(
    input: string,
    themes: string[],
    memories: any[],
  ): Promise<string> {
    const protocols = FireFacilitationProtocols;
    let response = "";

    // Choose appropriate greeting
    if (memories.length === 0) {
      response += protocols.greeting.initial + "\n\n";
    } else {
      response += protocols.greeting.returning + "\n\n";
    }

    // Address primary theme
    if (themes.includes("movement_seeking")) {
      response +=
        "You've mentioned feeling stuck. " +
        protocols.exploration.action +
        "\n\n";
      response +=
        "Sometimes movement begins with tiny shifts. What's one small thing that feels possible?";
    } else if (themes.includes("passion_exploration")) {
      response +=
        "Your words carry energy around passion. " +
        protocols.exploration.passion +
        "\n\n";
      response += protocols.practices.energy_tracking;
    } else if (themes.includes("transformation_process")) {
      response += protocols.exploration.transformation + "\n\n";
      response +=
        "Change can feel overwhelming or exciting. What support would help you navigate this transition?";
    } else if (themes.includes("courage_building")) {
      response +=
        "You're exploring edges of comfort. " +
        protocols.exploration.resistance +
        "\n\n";
      response +=
        "Courage often grows through small acts. What's one step that feels just slightly outside your comfort zone?";
    } else {
      // General fire theme exploration
      response += protocols.exploration.passion + "\n\n";
      response += protocols.practices.journaling;
    }

    // Add integration prompt
    response += "\n\n" + protocols.reflection.integration;

    // Include practical suggestions without mystical framing
    if (themes.length > 0) {
      response += "\n\nBased on your exploration, you might consider:\n";
      response += "- " + protocols.practices.action_steps + "\n";
      response += "- " + protocols.practices.energy_tracking;
    }

    return response;
  }

  /**
   * Generate reflection prompts for user's journal
   */
  generateReflectionPrompts(themes: string[]): string[] {
    const prompts: string[] = [];

    // Theme-specific prompts that empower user insight
    if (themes.includes("movement_seeking")) {
      prompts.push("What would movement look like in your current situation?");
      prompts.push("What's one thing you could do differently tomorrow?");
    }

    if (themes.includes("passion_exploration")) {
      prompts.push("When do you feel most alive and energized?");
      prompts.push("What activities make you lose track of time?");
    }

    if (themes.includes("transformation_process")) {
      prompts.push("What is ending and what is beginning in your life?");
      prompts.push("How can you honor both the old and the new?");
    }

    // Always include general fire prompts
    prompts.push(
      ...[
        "What lights you up right now?",
        "Where is your energy wanting to flow?",
        "What action feels most aligned with your values?",
      ],
    );

    return prompts;
  }

  /**
   * Provide practical tools without mystical claims
   */
  suggestPracticalTools(themes: string[]): {
    tools: string[];
    practices: string[];
  } {
    const tools: string[] = [];
    const practices: string[] = [];

    // Theme-based suggestions
    if (themes.includes("movement_seeking")) {
      tools.push("Daily micro-action tracker");
      practices.push("5-minute morning intention setting");
    }

    if (themes.includes("passion_exploration")) {
      tools.push("Energy level journal");
      practices.push("Weekly passion project time");
    }

    if (themes.includes("transformation_process")) {
      tools.push("Change milestone map");
      practices.push("Transition ritual creation");
    }

    // General fire element tools
    tools.push("Goal clarification worksheet");
    practices.push("Evening reflection on daily wins");

    return { tools, practices };
  }
}

// Export configured instance
export const fireAgentRefactored = new FireAgentRefactored();
