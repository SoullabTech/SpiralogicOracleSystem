import { useMemo } from "react";

type Ritual = {
  title: string;
  description: string;
  phase: string;
};

export function useRitual(metadata?: any): Ritual | null {
  return useMemo(() => {
    if (!metadata || !metadata.ritual) return null;
    return {
      title: metadata.ritual.title,
      description: metadata.ritual.description,
      phase: metadata.ritual.phase,
    };
  }, [metadata]);
}
