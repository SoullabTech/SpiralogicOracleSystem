import { loadFeatureFlagsSync } from "./flags.runtime";
import type { FeatureFlag } from "./flags.schema";

export type ServiceGroupKey = "Core"|"UserFacing"|"Facilitator"|"Experimental"|"Debug";

export function getServicesByGroup(): Record<ServiceGroupKey, FeatureFlag[]> {
  const flags = Object.values(loadFeatureFlagsSync());
  const groups: Record<ServiceGroupKey, FeatureFlag[]> = {
    Core:[], UserFacing:[], Facilitator:[], Experimental:[], Debug:[]
  };
  for (const f of flags) groups[f.category].push(f);
  return groups;
}

export function getFlag(key: string): FeatureFlag | undefined {
  return loadFeatureFlagsSync()[key as keyof ReturnType<typeof loadFeatureFlagsSync>];
}

// Server-side async versions for API routes
export async function getServicesByGroupAsync(): Promise<Record<ServiceGroupKey, FeatureFlag[]>> {
  const { loadFeatureFlags } = await import("./flags.runtime");
  const flags = Object.values(await loadFeatureFlags());
  const groups: Record<ServiceGroupKey, FeatureFlag[]> = {
    Core:[], UserFacing:[], Facilitator:[], Experimental:[], Debug:[]
  };
  for (const f of flags) groups[f.category].push(f);
  return groups;
}

export async function getFlagAsync(key: string): Promise<FeatureFlag | undefined> {
  const { loadFeatureFlags } = await import("./flags.runtime");
  const flags = await loadFeatureFlags();
  return flags[key as keyof typeof flags];
}