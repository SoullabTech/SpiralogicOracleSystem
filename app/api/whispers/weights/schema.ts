import { z } from "zod";

export const tagEnum = z.enum(["fear","inspiration","todo","reflection"]);
export const elementEnum = z.enum(["fire","water","earth","air","aether"]);

export const whisperWeightsSchema = z.object({
  elementBoost: z.number().min(0).max(1).default(0.15),
  keyphraseWeight: z.number().min(0).max(5).default(1.0),
  recencyHalfLifeDays: z.number().min(0.5).max(30).default(3),
  recallBoost: z.number().min(0).max(1).default(0.25),
  tagWeights: z.record(tagEnum, z.number().min(0).max(3)).default({
    fear: 1.0, inspiration: 0.9, todo: 0.85, reflection: 0.8
  }),
});

export type WhisperWeights = z.infer<typeof whisperWeightsSchema>;

export const DEFAULT_WEIGHTS: WhisperWeights = whisperWeightsSchema.parse({});