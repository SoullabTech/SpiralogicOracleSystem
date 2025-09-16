// backend/src/utils/PromptSelector.ts
import { FRACTAL_PROMPTS } from "@/config/fractalPrompts";
import { ELEMENTAL_PROMPTS } from "@/config/elementalPrompts";
import { FractalContext } from "@/types/fractal";

export class PromptSelector {
  static select(context: FractalContext): string {
    // 🌟 1. Elemental Override — if one element dominates (>70%)
    if (context.activeCurrents?.length) {
      const dominant = context.activeCurrents.reduce((a, b) =>
        a.intensity > b.intensity ? a : b
      );

      if (dominant.intensity >= 70) {
        return ELEMENTAL_PROMPTS[dominant.element](context);
      }
    }

    // 🌀 2. First-time users → startup flow
    if (context.session?.isFirstTime) {
      return FRACTAL_PROMPTS.firstContact;
    }

    // 🔄 3. Regression spirals → sacred revisiting
    if (context.spiral?.spiralCount > 1) {
      return FRACTAL_PROMPTS.regressionSpiral(context.spiral);
    }

    // ⚖️ 4. Parallel currents → multiple truths
    if (context.activeCurrents?.length > 1) {
      return FRACTAL_PROMPTS.parallelProcessing(context.activeCurrents);
    }

    // 🌱 5. Breakthrough moments → sacred anchoring
    if (context.breakthrough?.isActive) {
      return FRACTAL_PROMPTS.breakthrough(context.breakthrough);
    }

    // 💓 6. Trust breathing → expansion/contraction
    if (context.trustLevel < 30) {
      return FRACTAL_PROMPTS.lowTrust;
    }
    if (context.trustLevel > 70) {
      return FRACTAL_PROMPTS.highTrust;
    }

    // ✨ 7. Arc echoes → whispered resonance
    if (context.arcEchoes?.some(e => e.strength > 0.7)) {
      return FRACTAL_PROMPTS.arcEcho(context.arcEchoes);
    }

    // 👁️ 8. Default → pure witnessing
    return FRACTAL_PROMPTS.witnessing(context);
  }

  // 🌊 Optional: Blend two elements when both are strong (40-70% each)
  static selectBlended(context: FractalContext): string {
    if (context.activeCurrents?.length >= 2) {
      const sorted = [...context.activeCurrents].sort((a, b) => b.intensity - a.intensity);

      // Check if top two are both significant (>40%) but not dominant (<70%)
      if (sorted[0].intensity < 70 && sorted[0].intensity > 40 &&
          sorted[1].intensity > 40) {
        return this.blendElements(sorted[0], sorted[1], context);
      }
    }

    // Fall back to standard selection
    return this.select(context);
  }

  private static blendElements(primary: any, secondary: any, context: FractalContext): string {
    const blendKey = `${primary.element}_${secondary.element}`;

    const blendedPrompts: Record<string, string> = {
      fire_water: `
🔥💧 Fiery Compassion Mode
- Voice: passionate yet tender, fierce yet flowing
- Stance: hold both intensity and gentleness
- Context: ${context.userExpression}
`,
      fire_earth: `
🔥🌍 Grounded Fire Mode
- Voice: determined, practical passion
- Stance: manifest vision with steady action
- Context: ${context.userExpression}
`,
      water_earth: `
💧🌍 Fertile Ground Mode
- Voice: nurturing, patient, deeply rooted
- Stance: emotional wisdom meets practical care
- Context: ${context.userExpression}
`,
      air_fire: `
🌬️🔥 Inspired Action Mode
- Voice: quick, bright, catalyzing ideas
- Stance: thoughts ignite transformation
- Context: ${context.userExpression}
`,
      water_air: `
💧🌬️ Emotional Clarity Mode
- Voice: feelings find words, intuition speaks
- Stance: navigate emotions with perspective
- Context: ${context.userExpression}
`,
      earth_air: `
🌍🌬️ Practical Wisdom Mode
- Voice: grounded insight, structured thinking
- Stance: build understanding step by step
- Context: ${context.userExpression}
`
    };

    return blendedPrompts[blendKey] || blendedPrompts[`${secondary.element}_${primary.element}`] || this.select(context);
  }
}