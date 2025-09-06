// 📁 File: src/agents/elementalOracleAgent.ts

import { fetchElementalInsights } from "@/services/elementalOracleService";

interface OracleInput {
  userId: string;
  input: string;
  element: "Fire" | "Water" | "Earth" | "Air" | "Aether";
  context?: Record<string, any>;
}

export const elementalOracle = {
  async process({ userId, input, element, context }: OracleInput) {
    if (!userId || !input || !element) {
      throw new Error(&quot;Missing required fields: userId, input, or element&quot;);
    }

    const response = await fetchElementalInsights({
      userId,
      input,
      element,
      context,
    });
    return {
      oracle: element,
      insight: response?.message ?? "No insight available at this time.",
    };
  },
};

// 📁 File: src/agents/dreamOracleAgent.ts

import { interpretDreamInput } from "@/services/dreamService";

interface DreamInput {
  userId: string;
  dreamDescription: string;
  context?: Record<string, any>;
}

export const dreamOracle = {
  async process({ userId, dreamDescription, context }: DreamInput) {
    if (!userId || !dreamDescription) {
      throw new Error("Missing required fields: userId or dreamDescription");
    }

    const response = await interpretDreamInput({
      userId,
      dreamDescription,
      context,
    });
    return {
      oracle: "Dream Oracle",
      interpretation:
        response?.message ?? "No interpretation available at this time.",
    };
  },
};

// ✅ Placement confirmation
// Yes, placing memorymanager.ts under src/agents is correct if it's implementing agent-like logic such as memory coordination, prioritization, or interfacing with other agents/services.
