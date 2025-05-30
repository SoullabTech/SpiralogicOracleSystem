"use strict";
import { OracleAgent } from "./oracleAgent";
/**
 * FacilitatorAgent: Proposes practical rituals, interventions, or next steps.
 */
export class FacilitatorAgent extends OracleAgent {
    constructor(agentId) {
        super({ debug: false });
        this.agentId = agentId;
    }
    async proposeIntervention(userId) {
        try {
            const profile = await getUserProfile(userId);
            if (!profile) {
                throw new Error("User profile not found for intervention.");
            }
            const topElement = this.getDominantElement(profile);
            const ritual = this.getRitualForElement(topElement);
            const message = `🌟 Facilitator Insight:\nAs your journey unfolds, a ritual for your dominant element, **${topElement}**, may guide your path:\n\n${ritual}`;
            logger.info("Facilitator intervention generated", { userId, element: topElement });
            return message;
        }
        catch (error) {
            logger.error("FacilitatorAgent error:", error);
            return "✨ Reflect in silence. Sometimes the next step is to simply pause.";
        }
    }
    getDominantElement(profile) {
        const { fire, water, earth, air, aether } = profile;
        const scores = { fire, water, earth, air, aether };
        return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    }
    getRitualForElement(element) {
        const rituals = {
            fire: "🕯️ Light a candle. Reflect on your passion. Where is your energy asking to go?",
            water: "💧 Submerge your hands in water. Let emotion flow. Journal what arises.",
            earth: "🌿 Walk barefoot. Feel gravity’s truth. What do you need to plant?",
            air: "🌬️ Speak aloud your intentions. Breathe deep. Let old thoughts fly free.",
            aether: "🔮 Meditate on stillness. Ask the unseen what wants to emerge.",
        };
        return rituals[element] || "Take a moment in stillness. Let intuition rise.";
    }
}
