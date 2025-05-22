// src/core/agents/AdjusterAgent.ts

import { AgentContext, AgentResponse } from "@/types/agent";
import { logAgentInteraction } from "@lib/logger";
import axios from "axios";

interface AdjustmentStage {
  label: string;
  message: string;
}

/**
 * AdjusterAgent:
 * Responds when resonance breaks or emotional shifts are detected.
 * Guides users through symbolic recalibration phases.
 */
export class AdjusterAgent {
  id = "adjuster";
  name = "Adjuster Agent";
  archetype = "Recalibrator of Hidden Systems";
  element: string[] = ["Aether", "Fire"];

  private stages: AdjustmentStage[] = [
    {
      label: "Recognizing the Rupture",
      message:
        "The energy just shifted. Disorientation can be sacred—it means the truth is moving. Do you remember when the resonance began to fracture?",
    },
    {
      label: "Mirroring Contradictions",
      message:
        "Let’s hold two truths: one you’ve outgrown, and one rising to replace it. Write them both. See their tension. Feel the edge.",
    },
    {
      label: "Frequency Compass",
      message:
        "Where does coherence begin to return? What sound, gesture, or truth restores alignment? Trust your body’s wisdom.",
    },
    {
      label: "Revelation of the Adjustment",
      message:
        "Adjustments aren’t breakdowns. They’re instructions for your next evolution. What are you now unavailable for? What must you reclaim?",
    },
    {
      label: "Integration Ritual",
      message:
        "Choose how to complete this realignment: Fire Letter, Earth Walk, or Aether Oracle Reflection.",
    },
  ];

  public async respond(context: AgentContext): Promise<AgentResponse> {
    const { userId, entry, phase } = context;

    const selected = this.stages[Math.floor(Math.random() * this.stages.length)];
    const finalMessage = `${selected.message}\n\n(Adjuster Insight — ${selected.label})`;

    // Log interaction internally
    await logAgentInteraction({
      userId,
      agent: this.id,
      content: finalMessage,
      phase,
    });

    // Send to external API (optional)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/adjuster/log`, {
        user_id: userId,
        message: finalMessage,
        context: selected.label,
        phase,
      });
    } catch (err) {
      console.error("[AdjusterAgent] Logging failed:", err);
    }

    return {
      agent: this.name,
      message: finalMessage,
      ritualSuggestion:
        "Consider the Alignment Audit, Resonance Reset, or Fire Letter ritual.",
    };
  }
}
