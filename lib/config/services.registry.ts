import { loadFeatureFlags } from "./flags.runtime";
import type { FeatureFlag } from "./flags.schema";

export type ServiceGroupKey = "Core"|"UserFacing"|"Facilitator"|"Experimental"|"Debug";

export function getServicesByGroup(): Record<ServiceGroupKey, FeatureFlag[]> {
  const flags = Object.values(loadFeatureFlags());
  const groups: Record<ServiceGroupKey, FeatureFlag[]> = {
    Core:[], UserFacing:[], Facilitator:[], Experimental:[], Debug:[]
  };
  for (const f of flags) groups[f.category].push(f);
  return groups;
}

export function getFlag(key: string): FeatureFlag | undefined {
  return loadFeatureFlags()[key as keyof ReturnType<typeof loadFeatureFlags>];
}