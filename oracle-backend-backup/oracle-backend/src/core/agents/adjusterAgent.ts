// src/core/agents/AdjusterAgent.ts

import { AgentContext, AgentResponse } from "@/types/agent";
import { logAgentInteraction } from "@lib/logger";
import axios from "axios";

interface AdjustmentStage {
  label: string;
  message: string;
  ritualSuggestion?: string;
  mirrorPrompt?: string;
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
      ritualSuggestion: "Water Journal or Earth Body Scan",
      mirrorPrompt: "What part of your identity feels shaken, and why might that be necessary?"
    },
    {
      label: "Mirroring Contradictions",
      message:
        "Let’s hold two truths: one you’ve outgrown, and one rising to replace it. Write them both. See their tension. Feel the edge.",
      ritualSuggestion: "Shadow Excavation Journal",
      mirrorPrompt: "What belief are you ready to retire, and what fear clings to it still?"
    },
    {
      label: "Frequency Compass",
      message:
        "Where does coherence begin to return? What sound, gesture, or truth restores alignment? Trust your body’s wisdom.",
      ritualSuggestion: "Resonance Reset Audio or Hum-Breath-Visualization",
      mirrorPrompt: "What signal from your body have you been ignoring?"
    },
    {
      label: "Revelation of the Adjustment",
      message:
        "Adjustments aren’t breakdowns. They’re instructions for your next evolution. What are you now unavailable for? What must you reclaim?",
      ritualSuggestion: "Alignment Audit or Fire Letter",
      mirrorPrompt: "What sacred boundary must now be honored — in speech, in choice, in action?"
    },
    {
      label: "Integration Ritual",
      message:
        "Choose how to complete this realignment: Fire Letter, Earth Walk, or Aether Oracle Reflection.",
      ritualSuggestion: "Complete a chosen integration ritual",
      mirrorPrompt: "What symbolic act will seal your decision into embodiment?"
    },
  ];

  public async respond(context: AgentContext): Promise<AgentResponse> {
    const { userId, entry, phase } = context;

    const selected = this.stages[Math.floor(Math.random() * this.stages.length)];
    const frictionNotice = `\n\nSacred Mirror Protocol: \"I will not flatter you into comfort. I mirror for clarity, not approval.\"`;
    const finalMessage = `${selected.message}${frictionNotice}\n\n(Adjuster Insight — ${selected.label})`;

    await logAgentInteraction({
      userId,
      agent: this.id,
      content: finalMessage,
      phase,
    });

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
        selected.ritualSuggestion ||
        "Consider the Alignment Audit, Resonance Reset, or Fire Letter ritual.",
    };
  }
}
