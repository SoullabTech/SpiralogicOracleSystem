import fs from "fs";
import path from "path";

const loadJSON = <T>(p: string): T => JSON.parse(fs.readFileSync(p, "utf8"));

const base = path.join(process.cwd(), "data", "spiralogic");

export const planetaryMap = () =>
  loadJSON<Record<string, any>>(path.join(base, "planetary_elemental_map.json"));

export const archetypeMap = () =>
  loadJSON<{ archetypes: Array<{
    name: string; element_bias: string[]; signals: string[]; shadow_signals: string[];
  }> }>(path.join(base, "archetypes.json"));

export const soulPhases = () =>
  loadJSON<{ phases: Array<{
    key: string; label: string; element: string; phenomenology: string[]; nudges: string[];
  }> }>(path.join(base, "soul_path_phases.json"));

export const evoStages = () =>
  loadJSON<{ stages: Array<{ key: string; signals: string[]; invites: string[] }> }>(
    path.join(base, "evolutionary_stages.json")
  );

// Enhanced loaders for refined Spiralogic seeds
export const archetypeRecognition = () =>
  loadJSON<{
    version: string;
    archetypes: Array<{
      id: string;
      name: string;
      phenomenology: string[];
      signals: string[];
      elemental_bias: Record<string, number>;
      stage_affinities: string[];
      micro_reflections: string[];
      invites: string[];
    }>;
    soft_bias_scalar: number;
    privacy: Record<string, boolean>;
  }>(path.join(base, "archetypal_recognition.json"));

export const elementalRouting = () =>
  loadJSON<{
    version: string;
    rules: {
      by_soul_phase: Record<string, Record<string, number>>;
      by_intent_hint: Record<string, Record<string, number>>;
      planetary: Record<string, string[]>;
    };
    soft_cap: number;
    notes: string;
  }>(path.join(base, "elemental_routing.json"));

export const multiAgentCollaboration = () =>
  loadJSON<{
    version: string;
    agents: Record<string, {
      role: string;
      leads_when: string[];
      supports: Record<string, string>;
    }>;
    weave_template: string[];
    constraints: Record<string, any>;
  }>(path.join(base, "multi_agent_collaboration.json"));

export const morphicField = () =>
  loadJSON<{
    version: string;
    resonance_heuristics: {
      features: string[];
      weights: Record<string, number>;
      thresholds: Record<string, number>;
    };
    cultural_mappings: Array<{ culture: string; notes: string }>;
    privacy: Record<string, boolean>;
  }>(path.join(base, "morphic_field.json"));

export const sacredTechnology = () =>
  loadJSON<{
    version: string;
    ethics: Record<string, string[]>;
    maya: {
      enabled: boolean;
      vectors: string[];
      final_filter: boolean;
    };
    validation: Record<string, any>;
    language_stages: string[];
    notes: string;
  }>(path.join(base, "sacred_technology.json"));