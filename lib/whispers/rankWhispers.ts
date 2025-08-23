import type { Element } from "@/lib/recap/types";
import { DEFAULT_WEIGHTS, WhisperWeights } from "./weights";

export type MicroMemory = {
  id: string;
  user_id: string;
  text: string;
  tags: ("inspiration"|"fear"|"todo"|"reflection")[];
  energy_level: "low"|"medium"|"high"|null;
  element: Element | null;
  status: "active"|"archived"|"snoozed";
  created_at: string;
  last_seen_at: string | null;
  recall_at: string | null;
  metadata: Record<string, any> | null;
};

export type Whisper = MicroMemory & { score: number; reason: string };

type RecapBucket = {
  element: Element;
  titles?: string[];
  keywords?: string[];
};

type RankInput = {
  memories: MicroMemory[];
  recapBuckets: RecapBucket[]; // simplified bucket type for ranking
  now?: Date;
  weights?: WhisperWeights;
};

// Legacy constants for backward compatibility
const TAG_WEIGHT = { inspiration: 0.9, fear: 1.0, todo: 0.85, reflection: 0.8 };
const ELEM_BOOST: Record<Element, number> = {
  fire: 1.0, water: 1.0, earth: 1.0, air: 1.0, aether: 1.0,
};

export function rankWhispers({ memories, recapBuckets, now = new Date(), weights = DEFAULT_WEIGHTS }: RankInput): Whisper[] {
  // 1) Build quick context map from recap buckets (element frequencies + keyphrases)
  const elemCount = new Map<Element, number>();
  const keyphrases = new Set<string>();

  for (const b of recapBuckets) {
    elemCount.set(b.element, (elemCount.get(b.element) ?? 0) + 1);
    for (const t of b.titles?.slice(0, 6) ?? []) keyphrases.add(t.toLowerCase());
    for (const k of b.keywords?.slice(0, 8) ?? []) keyphrases.add(k.toLowerCase());
  }

  // 2) Score each memory by:
  //   a) element match
  //   b) tag weight
  //   c) recency (mild)
  //   d) keyphrase overlap (simple contains)
  //   e) recall_at due boost
  return memories
    .map((m): Whisper => {
      const ageMs = now.getTime() - new Date(m.created_at).getTime();
      const halfLifeMs = weights.recencyHalfLifeDays * 24 * 60 * 60 * 1000;
      const recency = Math.pow(0.5, ageMs / halfLifeMs);
      
      const elemBoost = m.element && (elemCount.get(m.element) ?? 0) > 0 ? 1 + weights.elementBoost : 1;
      const tagBoost = (m.tags?.reduce((acc, t) => acc + (weights.tagWeights[t as keyof typeof weights.tagWeights] ?? 0.75), 0) || 0.75) / Math.max(m.tags?.length || 1, 1);

      let phraseBoost = 1;
      const lower = m.text.toLowerCase();
      const words = lower.split(/\W+/).filter(Boolean);
      const overlap = words.reduce((n, word) => n + (keyphrases.has(word) ? 1 : 0), 0);
      if (overlap > 0) {
        phraseBoost = 1 + Math.min(1, overlap / 5) * weights.keyphraseWeight * 0.12; // Scale to match original behavior
      }

      let recallBoost = 1;
      if (m.recall_at) {
        const due = new Date(m.recall_at).getTime() <= now.getTime();
        if (due) recallBoost = 1 + weights.recallBoost;
      }

      const score = 100 * recency * elemBoost * tagBoost * phraseBoost * recallBoost;

      const reason = [
        m.element && (elemCount.get(m.element) ?? 0) > 0 ? `matches ${m.element}` : null,
        phraseBoost > 1 ? "relates to current themes" : null,
        recallBoost > 1 ? "due for recall" : null
      ].filter(Boolean).join(" • ") || "potentially relevant";

      return { ...m, score, reason };
    })
    .sort((a, b) => b.score - a.score);
}