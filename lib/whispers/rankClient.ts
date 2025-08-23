import { DEFAULT_WEIGHTS, WhisperWeights, Element } from "./weights";

export type Whisper = {
  id: string;
  content: string;
  tags: string[];
  element?: Element | null;
  energy?: "low" | "medium" | "high" | null;
  created_at: string;  // ISO
  recall_at?: string | null;
};

export type RecapContext = {
  elements: Element[];        // elements present in recap
  keyphrases: string[];       // words/phrases from recap
  now?: Date;                 // for deterministic tests
};

export type RankedWhisper = Whisper & {
  score: number;
  reasons: string[];
};

export function rankWhispersClient(
  whispers: Whisper[],
  ctx: RecapContext,
  weights: WhisperWeights = DEFAULT_WEIGHTS
): RankedWhisper[] {
  const now = ctx.now ?? new Date();
  const keyset = new Set(ctx.keyphrases.map(k => k.toLowerCase()));
  const elemset = new Set(ctx.elements);

  const ranked = whispers.map(w => {
    let score = 0;
    const reasons: string[] = [];

    // Tag weight
    const bestTag = (w.tags || []).reduce((best, t) => {
      const k = t as keyof WhisperWeights["tagWeights"];
      const val = weights.tagWeights[k] ?? 0.5;
      return val > best ? val : best;
    }, 0);
    score += bestTag;
    reasons.push(`tag=${bestTag.toFixed(2)}`);

    // Element boost
    if (w.element && elemset.has(w.element)) {
      score += weights.elementBoost;
      reasons.push(`elementMatch=+${weights.elementBoost.toFixed(2)}`);
    }

    // Keyphrase overlap
    const words = (w.content || "").toLowerCase().split(/\W+/).filter(Boolean);
    const overlap = words.reduce((n, word) => n + (keyset.has(word) ? 1 : 0), 0);
    const keyScore = Math.min(1, overlap / 5) * weights.keyphraseWeight; // small cap
    if (keyScore > 0) reasons.push(`keyphrases=+${keyScore.toFixed(2)}`);
    score += keyScore;

    // Recency decay (half-life)
    const ageMs = Math.max(0, now.getTime() - new Date(w.created_at).getTime());
    const halfLifeMs = Math.max(1, weights.recencyHalfLifeDays) * 24 * 3600 * 1000;
    const recency = Math.pow(0.5, ageMs / halfLifeMs);
    reasons.push(`recency=${recency.toFixed(2)}`);
    score += recency;

    // Recall timing
    if (w.recall_at) {
      const due = new Date(w.recall_at).getTime() <= now.getTime();
      if (due) {
        score += weights.recallBoost;
        reasons.push(`recallDue=+${weights.recallBoost.toFixed(2)}`);
      }
    }

    return { ...w, score, reasons };
  });

  return ranked.sort((a, b) => b.score - a.score);
}