type AppraiseInput = {
  text: string;
  nlu?: any;
  psi?: any;
  facetHints?: Record<string, number>;
  history?: Array<{ text: string; ts?: number }>;
};

type AppraiseOut = {
  driveVector: Record<string, number>; // e.g., clarity, safety, agency, connection, meaning
  affect: { valence: number; arousal: number; confidence: number };
  modulation: { temperature: number; depthBias: number; inviteCount: 1 | 2 };
};

const DR = Number(process.env.MICROPSI_DRIVE_WEIGHT ?? 0.45);
const AF = Number(process.env.MICROPSI_AFFECT_WEIGHT ?? 0.35);
const HO = Number(process.env.MICROPSI_HOMEOSTASIS_WEIGHT ?? 0.20);
const MINC = Number(process.env.MICROPSI_MIN_CONF ?? 0.55);

// Voice-specific modulation parameters
export interface VoiceModulationInput {
  emotionalTone?: string;
  energyLevel?: number;
  archeType?: string;
  elementalResonance?: string;
}

export interface VoiceModulationOutput extends AppraiseOut {
  voiceParameters: {
    stability: number;
    similarity: number;
    style: number;
    speakerBoost: boolean;
    emotionalColoring: {
      warmth: number;
      energy: number;
      depth: number;
      pace: number;
    };
  };
}

export const micropsi = {
  async appraise(inp: AppraiseInput): Promise<AppraiseOut> {
    // Extract valence and arousal from NLU sentiment
    const v = (inp.nlu?.sentiment?.valence ?? 0) * 0.5 + 0.1 * (inp.psi?.mood ?? 0);
    const a = (inp.nlu?.sentiment?.arousal ?? 0.5);
    const confidence = Math.min(0.99, 0.65 + Math.abs(v - 0.5) * 0.5);

    // Drive vector calculation based on user state and input
    const driveVector = {
      clarity: 0.6 + (inp.nlu?.entities?.length ? 0.1 : 0),
      safety: 0.55 + (a > 0.7 ? 0.15 : 0),
      agency: 0.55 + (v > 0.6 ? 0.1 : 0),
      connection: 0.5 + (inp.psi?.socialNeed ? 0.2 : 0),
      meaning: 0.55 + (inp.facetHints?.aether ?? 0) * 0.2
    };

    // Apply weighted fusion
    const weightedDrives = Object.entries(driveVector).reduce((acc, [k, v]) => {
      acc[k] = v * DR;
      return acc;
    }, {} as Record<string, number>);

    // Modulation: temperature & depth based on affect + drives
    const temp = 0.6 + (a - 0.5) * 0.4 * AF; // higher arousal → more exploratory
    const depth = 0.55 + (driveVector.meaning - 0.5) * 0.5 * DR; // meaning drive → deeper synthesis
    
    // Homeostasis influence
    const homeostasisPull = HO * 0.1;
    const finalTemp = temp * (1 - homeostasisPull) + 0.65 * homeostasisPull;
    const finalDepth = depth * (1 - homeostasisPull) + 0.55 * homeostasisPull;
    
    // Invite count decision based on arousal and confidence
    const inviteCount: 1 | 2 = (a < 0.4 && confidence > 0.6) ? 2 : 1;

    // Gate on minimum confidence
    if (confidence < MINC) {
      return {
        driveVector: weightedDrives,
        affect: { valence: v, arousal: a, confidence },
        modulation: { temperature: 0.6, depthBias: 0.55, inviteCount: 1 }
      };
    }

    return {
      driveVector: weightedDrives,
      affect: { valence: v, arousal: a, confidence },
      modulation: {
        temperature: Math.max(0.4, Math.min(0.9, finalTemp)),
        depthBias: Math.max(0.3, Math.min(0.8, finalDepth)),
        inviteCount
      }
    };
  },

  // Helper to analyze historical patterns for better drive calculation
  analyzeHistory(history: Array<{ text: string; ts?: number }>): Record<string, number> {
    if (!history || history.length === 0) {
      return { momentum: 0.5, consistency: 0.5, depth: 0.5 };
    }

    // Simple heuristics for history analysis
    const avgLength = history.reduce((sum, h) => sum + h.text.length, 0) / history.length;
    const hasQuestions = history.filter(h => h.text.includes('?')).length / history.length;
    
    return {
      momentum: Math.min(1, history.length / 10), // more history = more momentum
      consistency: 1 - (hasQuestions * 0.5), // fewer questions = more consistency
      depth: Math.min(1, avgLength / 200) // longer exchanges = more depth
    };
  },

  // Debug helper to explain modulation decisions
  explainModulation(inp: AppraiseInput, out: AppraiseOut): string {
    const reasons = [];
    
    if (out.affect.arousal > 0.7) {
      reasons.push('High arousal detected → increased temperature for exploration');
    }
    if (out.driveVector.meaning > 0.65) {
      reasons.push('Strong meaning drive → increased depth bias');
    }
    if (out.modulation.inviteCount === 2) {
      reasons.push('Low arousal + high confidence → allowing 2 invites for stuck states');
    }
    if (out.affect.confidence < MINC) {
      reasons.push('Low confidence → using safe defaults');
    }
    
    return reasons.join('; ');
  }
};