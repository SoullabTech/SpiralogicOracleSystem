export type Tag = "fear" | "inspiration" | "todo" | "reflection";
export type Element = "fire" | "water" | "earth" | "air" | "aether";

export type WhisperWeights = {
  elementBoost: number;          // e.g. 0.15
  keyphraseWeight: number;       // e.g. 1.0
  recencyHalfLifeDays: number;   // e.g. 3
  recallBoost: number;           // e.g. 0.25
  tagWeights: Record<Tag, number>;
};

export const DEFAULT_WEIGHTS: WhisperWeights = {
  elementBoost: 0.15,
  keyphraseWeight: 1.0,
  recencyHalfLifeDays: 3,
  recallBoost: 0.25,
  tagWeights: {
    fear: 1.0,
    inspiration: 0.9,
    todo: 0.85,
    reflection: 0.8,
  },
};

export const ALL_ELEMENTS: Element[] = ["fire", "water", "earth", "air", "aether"];
export const ALL_TAGS: Tag[] = ["fear", "inspiration", "todo", "reflection"];