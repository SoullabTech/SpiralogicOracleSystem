# STATE_SCHEMA.md

A data contract for fractal, non-linear user development in the PersonalOracleAgent

## 📐 Core Principles

1. **Fractal Logging**: Users can show multiple simultaneous states (Fire + Water, joy + grief). Schema must support arrays, not single states.
2. **Lightweight Insight**: Data is 20% of importance; schema supports hints, not rigid judgments.
3. **Self-Discovery First**: User language is always logged alongside system interpretation.
4. **Temporal Flow**: Schema tracks spiraling regressions, breakthroughs, and patterns across sessions.
5. **Meta-Layer**: System logs remain meta-perspective, never override user's lived reality.

⸻

## 🗂 Schema Definition

```typescript
interface UserStateSnapshot {
  sessionId: string;                // Unique per conversation
  userId: string;                   // Stable identifier

  timestamp: string;                // ISO8601

  // 🌿 Core State Capture
  currents: ElementalCurrent[];     // Active elemental flows (Fire, Water, Earth, Air, Aether)
  regression?: boolean;             // Spiral moment detected
  breakthrough?: boolean;           // Breakthrough moment flagged
  trustLevel: number;               // 0.0 – 1.0, relational confidence

  // 🪞 Reflective Mirrors
  userLanguage: string;             // Exact phrasing from user
  reflection?: string;              // Maya's witnessing phrasing
  arcEcho?: ArcStage;               // Light pattern: threshold, integration, spiral

  // 🌀 Complexity Handling
  parallelProcessing?: string[];    // Detected multiple simultaneous states
  contradictions?: string[];        // Optional contradictions flagged for curiosity

  // 📚 Meta-Tracking
  systemNotes?: string;             // For dev/guide notes, not user-facing
  sourceAgent?: string;             // e.g., PersonalOracleAgent, ShadowAgent
}

type ElementalCurrent = "fire" | "water" | "earth" | "air" | "aether";

type ArcStage = "threshold" | "shadow" | "integration" | "emergence" | "spiral";
```

⸻

## 🔑 Usage Patterns

### Example 1: Regression moment

```json
{
  "sessionId": "abc123",
  "userId": "u01",
  "timestamp": "2025-09-16T20:30:00Z",
  "currents": ["water"],
  "regression": true,
  "trustLevel": 0.62,
  "userLanguage": "I feel like I'm back at square one.",
  "reflection": "I hear that this feels like starting over.",
  "arcEcho": "spiral"
}
```

### Example 2: Parallel processing

```json
{
  "sessionId": "xyz987",
  "userId": "u01",
  "timestamp": "2025-09-16T21:10:00Z",
  "currents": ["fire", "water"],
  "parallelProcessing": ["excitement", "grief"],
  "trustLevel": 0.74,
  "userLanguage": "I'm excited but also really sad.",
  "reflection": "I notice both fire and water currents moving here — joy and grief together."
}
```

⸻

## ⚖️ Design Guardrails

- Never treat arcEcho as deterministic. It's a hint, not a stage assignment.
- trustLevel grows/declines naturally; do not force linear progression.
- regression = true signals spiral learning, not failure.
- Always preserve raw user language before applying system reflections.

⸻

Would you like me to also create a STATE_STORAGE_GUIDE.md that describes where and how these snapshots should be persisted (Supabase schema, indexing, retention policies)? That would connect this schema directly into your memory/logging infrastructure.