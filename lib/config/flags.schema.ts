import { z } from "zod";

export const RolloutZ = z.object({
  enabled: z.boolean().default(false),
  // Percent of user base exposed (0..100). Admin UI enforces cohorts.
  percentage: z.number().min(0).max(100).default(0),
  // Optional allow/deny lists for staged rollouts.
  allowEmails: z.array(z.string().email()).optional(),
  denyEmails: z.array(z.string().email()).optional(),
});

export const FeatureFlagZ = z.object({
  key: z.string(),
  label: z.string(),
  category: z.enum(["Core","UserFacing","Facilitator","Experimental","Debug"]),
  description: z.string().optional(),
  dependsOn: z.array(z.string()).default([]), // other feature keys
  rollout: RolloutZ.default({ enabled:false, percentage:0 }),
  // Perf footprint hint for Admin UX (ms per request, memory, quotas, etc.)
  perfCost: z.object({
    cpu: z.enum(["low","med","high"]).default("low"),
    memory: z.enum(["low","med","high"]).default("low"),
    latencyHintMs: z.number().default(0),
  }).default({ cpu:"low", memory:"low", latencyHintMs:0 }),
});

export const FeatureFlagsZ = z.record(FeatureFlagZ);
export type FeatureFlag = z.infer<typeof FeatureFlagZ>;
export type FeatureFlags = z.infer<typeof FeatureFlagsZ>;