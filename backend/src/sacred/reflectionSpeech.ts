import strings from "./reflectionStrings.json";

type Enrichment = {
  confidence?: number;            // 0..1
  sacred?: boolean;
  shadowScore?: number;           // 0..1
  archetypeHints?: string[];      // e.g. ["seeker","warrior"]
  soulPhase?: string;             // e.g. "initiation", "mastery"
  spiralogicArchetypes?: Array<{ name: string; strength: number }>;
};

export function maybeMicroReflection(
  e: Enrichment,
  turnIndexForThread: number
): string | null {
  const cfg = strings.rules.micro;
  if (turnIndexForThread < 1) return null;
  if (turnIndexForThread % cfg.minTurnsBetween !== 0) return null;
  if ((e.confidence ?? 0) < cfg.minConfidence) return null;

  const picks: string[] = [];
  
  // Sacred moment reflections
  if (e.sacred) picks.push(...strings.micro.sacred);
  
  // Shadow work reflections  
  if ((e.shadowScore ?? 0) >= 0.5) picks.push(...strings.micro.shadow);
  
  // Enhanced archetype-specific reflections
  if (e.spiralogicArchetypes && e.spiralogicArchetypes.length > 0) {
    const primaryArchetype = e.spiralogicArchetypes[0];
    if (primaryArchetype.strength >= 0.6) {
      // Use archetype-specific phenomenological language
      picks.push(...getArchetypeReflections(primaryArchetype.name));
    }
  } else if ((e.archetypeHints?.length ?? 0) > 0) {
    // Fallback to generic archetype reflections
    picks.push(...strings.micro.archetype);
  }
  
  // Soul phase reflections
  if (e.soulPhase) {
    picks.push(...getSoulPhaseReflections(e.soulPhase));
  }

  if (!picks.length) return null;
  return randomOne(picks);
}

// Get archetype-specific phenomenological language
function getArchetypeReflections(archetype: string): string[] {
  const archetypeReflections: Record<string, string[]> = {
    seeker: ["the seeker in you stirs", "questions arise from within", "your seeking nature awakens"],
    warrior: ["warrior energy edges forward", "courage crystallizes within", "fierce compassion awakens"],
    lover: ["your heart space opens", "love moves through you", "connection deepens within"],
    sage: ["wisdom whispers within", "understanding crystallizes", "your inner teacher speaks"],
    mystic: ["sacred presence touches you", "mystical awareness opens", "the divine stirs within"],
    creator: ["creative fire ignites", "expression seeks form", "imagination takes flight"],
    healer: ["healing presence emerges", "compassion flows through you", "wholeness radiates outward"],
    elder: ["elder wisdom awakens", "your authority emerges", "deep knowing surfaces"],
    transformer: ["transformation stirs within", "old forms dissolve", "phoenix fire rises"]
  };
  
  return archetypeReflections[archetype] || strings.micro.archetype;
}

// Get soul phase reflections
function getSoulPhaseReflections(phase: string): string[] {
  const phaseReflections: Record<string, string[]> = {
    initiation: ["something new is stirring", "a journey begins to call", "the threshold awaits"],
    learning: ["your mind expands and opens", "understanding deepens", "wisdom seeks expression"],
    reflection: ["stillness calls to you", "contemplation opens space", "wisdom settles within"],
    action: ["action calls forth", "energy seeks expression", "momentum builds within"],
    integration: ["pieces fall into place", "wholeness emerges naturally", "your being finds its center"],
    mastery: ["mastery flows through you", "expertise becomes second nature", "authority emerges organically"],
    service: ["service calls from within", "generosity flows naturally", "teaching wisdom emerges"],
    transcendence: ["awareness expands beyond self", "cosmic consciousness opens", "transcendent peace descends"],
    death_rebirth: ["old forms dissolve naturally", "transformation moves through you", "new life emerges from endings"]
  };
  
  return phaseReflections[phase] || ["awareness shifts gently", "something moves within"];
}

export function buildRecap(
  quoteFromUser: string | null,
  turnCountForThread: number
): string | null {
  const r = strings.rules.recap;
  if (turnCountForThread < r.minTurns) return null;
  const quote = (quoteFromUser ?? "").trim().slice(0, 120);
  const template = randomOne(strings.recapTemplates);
  const lines = template.text.map(l => l.replace("{quote}", quote || "this"));
  // Ensure 1 question (already in third line) & ≤3 sentences by design
  return lines.join(" ");
}

function randomOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}