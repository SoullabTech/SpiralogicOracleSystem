// Human-facing labels, implicit elemental mapping, and subtle color cues
export const recapMeta = {
  themes:  { label: 'Themes Emerging',    hint: 'Coherence in the background',    tone: 'violet',  token: 'aether' },
  emotions:{ label: 'Emotional Undercurrents', hint: 'Felt sense + tides',       tone: 'blue',    token: 'water' },
  steps:   { label: 'Practical Grounding', hint: 'Doable next steps + structure', tone: 'green',   token: 'earth' },
  ideas:   { label: 'Ideas in Motion',     hint: 'Perspective + reframing',       tone: 'yellow',  token: 'air' },
  energy:  { label: 'Energy Rising',       hint: 'Motive force + spark',          tone: 'red',     token: 'fire' },
} as const;

export type RecapKey = keyof typeof recapMeta;

// Light client-side classifier (fallback) to bucket lines by simple cues.
// This is a placeholder; your backend can return structured buckets later.
export function bucketize(text: string): Record<RecapKey, string[]> {
  const out = { themes: [], emotions: [], steps: [], ideas: [], energy: [] as string[] };
  const lines = text.split(/\n+/).map(s => s.trim()).filter(Boolean);

  for (const l of lines) {
    const low = l.toLowerCase();
    if (/next step|try|schedule|setup|baseline|habit|practice|checklist|implement/.test(low)) out.steps.push(l);
    else if (/feeling|felt|grief|joy|anx|fear|love|care|tender|open|heavy|soft/.test(low)) out.emotions.push(l);
    else if (/idea|reframe|perspective|thinking|pattern|concept|map|model|insight/.test(low)) out.ideas.push(l);
    else if (/energy|motivation|drive|spark|ignite|momentum|creative|fire/.test(low)) out.energy.push(l);
    else out.themes.push(l);
  }
  return out;
}