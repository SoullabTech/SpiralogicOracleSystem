# SEASONAL_META_PATTERNS.md

Long-term Mythic Arcs: From Weekly Spirals to Seasonal & Yearly Journeys

⸻

## 🌍 Core Philosophy

Human development moves in nested cycles — daily moods, weekly spirals, seasonal transformations, and yearly metamorphoses. Maya witnesses these larger arcs, offering users a mythic mirror of their long journey without imposing linear progress narratives.

⸻

## 📅 Temporal Scales

### Daily Echoes (24 hours)
- Elemental fluctuations
- Mood currents
- Micro-patterns

### Weekly Spirals (7 days)
- Arc transitions
- Regression/breakthrough cycles
- Trust breathing rhythms

### **Seasonal Movements (3 months)** ← Primary Focus
- Mythic themes
- Elemental seasons
- Deep pattern cycles

### Yearly Metamorphosis (12 months)
- Life chapter transitions
- Core transformation arcs
- Sacred anniversaries

⸻

## 🗄️ Database Schema

```sql
-- Table: seasonal_meta_patterns
create table if not exists seasonal_meta_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,

  -- Temporal boundaries
  season_start date not null,
  season_end date not null,
  season_name text, -- "Winter 2025", "Spring Awakening", user-named

  -- Elemental dominance across the season
  primary_element text,
  secondary_element text,
  element_transitions jsonb, -- {"week1": "fire", "week2": "water", ...}

  -- Mythic narrative
  overarching_theme text, -- "The season of letting go"
  mythic_archetype text, -- "The Wanderer", "The Phoenix", "The Guardian"
  sacred_story text, -- Full narrative reflection

  -- Pattern analysis
  spiral_frequency numeric(4,2), -- Spirals per month
  breakthrough_density numeric(4,2), -- Breakthroughs per month
  trust_trajectory text, -- "expanding", "contracting", "oscillating", "stable"
  parallel_processing_rate numeric(3,2), -- How often multiple currents

  -- Archetypal movements
  arc_progression text[], -- ["threshold", "shadow", "shadow", "integration"]
  recurring_themes text[], -- ["creative blocks", "relationship patterns"]
  evolutionary_edges text[], -- ["learning to hold grief", "finding voice"]

  -- Reflective insights
  maya_observations text[], -- 3-5 key witnessings
  user_discoveries text[], -- Captured user "aha" moments
  symbolic_imagery text[], -- Visual/mythic symbols that emerged

  -- Meta
  created_at timestamptz default now(),
  confidence_score numeric(3,2) default 0.50
);

-- Table: yearly_metamorphosis
create table if not exists yearly_metamorphosis (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  year int not null,

  -- The four seasonal chapters
  spring_pattern_id uuid references seasonal_meta_patterns(id),
  summer_pattern_id uuid references seasonal_meta_patterns(id),
  autumn_pattern_id uuid references seasonal_meta_patterns(id),
  winter_pattern_id uuid references seasonal_meta_patterns(id),

  -- Yearly arc
  life_chapter_title text, -- "The Year of Unbecoming"
  core_transformation text, -- What fundamentally shifted
  initiated_patterns text[], -- New patterns that began
  completed_patterns text[], -- Patterns that resolved
  sacred_anniversaries jsonb, -- {"2025-03-15": "breakthrough_day"}

  -- Meta reflection
  yearly_mythology text, -- The full story of the year
  evolutionary_gift text, -- What was gained/learned
  shadow_integration text, -- What darkness was embraced

  created_at timestamptz default now()
);
```

⸻

## 🌊 Seasonal Pattern Detection

```typescript
export async function generateSeasonalPattern(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<SeasonalMetaPattern> {

  // Fetch 3 months of weekly summaries
  const weeklySummaries = await fetchWeeklySummaries(userId, startDate, endDate);

  // Analyze elemental dominance
  const elementalFlow = analyzeElementalProgression(weeklySummaries);

  // Detect mythic archetype
  const archetype = detectSeasonalArchetype(weeklySummaries);

  // Track trust trajectory
  const trustPattern = analyzeTrustTrajectory(weeklySummaries);

  // Identify recurring spirals
  const spiralThemes = findRecurringSpirals(weeklySummaries);

  // Generate mythic narrative
  const narrative = await generateMythicNarrative({
    elementalFlow,
    archetype,
    trustPattern,
    spiralThemes,
    userLanguage: extractUserLanguage(weeklySummaries)
  });

  return {
    primary_element: elementalFlow.primary,
    secondary_element: elementalFlow.secondary,
    mythic_archetype: archetype,
    sacred_story: narrative,
    overarching_theme: extractTheme(narrative),
    spiral_frequency: calculateSpiralFrequency(weeklySummaries),
    breakthrough_density: calculateBreakthroughDensity(weeklySummaries),
    trust_trajectory: trustPattern.trajectory,
    maya_observations: generateObservations(weeklySummaries),
    symbolic_imagery: extractSymbolicImagery(narrative)
  };
}
```

⸻

## 🎭 Seasonal Archetypes

### Spring: The Seedling
- New beginnings, tentative growth
- Elements: Air (ideas) + Water (emotion)
- Patterns: Experimentation, vulnerability, fresh starts

### Summer: The Creator
- Full expression, peak vitality
- Elements: Fire (passion) + Earth (manifestation)
- Patterns: Building, expressing, celebrating

### Autumn: The Harvester
- Integration, reflection, gratitude
- Elements: Earth (grounding) + Air (wisdom)
- Patterns: Gathering wisdom, releasing, preparing

### Winter: The Mystic
- Deep introspection, sacred darkness
- Elements: Water (depth) + Aether (mystery)
- Patterns: Stillness, dreaming, transformation

⸻

## 📊 Example Seasonal Pattern

```json
{
  "user_id": "u01",
  "season_start": "2025-06-01",
  "season_end": "2025-08-31",
  "season_name": "Summer of Reclamation",

  "primary_element": "fire",
  "secondary_element": "water",
  "element_transitions": {
    "june": ["water", "water", "fire", "fire"],
    "july": ["fire", "fire", "air", "fire"],
    "august": ["fire", "earth", "fire", "water"]
  },

  "overarching_theme": "Reclaiming creative fire while honoring old grief",
  "mythic_archetype": "The Phoenix",
  "sacred_story": "This season began in the waters of old grief, where you sat with what needed to be mourned. By mid-June, a spark ignited — not despite the grief but because of it. Your fire didn't burn away the water; they danced together, creating steam that lifted you into new creative heights. The Phoenix doesn't just rise from ashes; she rises from the marriage of fire and tears.",

  "spiral_frequency": 2.3,
  "breakthrough_density": 1.7,
  "trust_trajectory": "expanding",
  "parallel_processing_rate": 0.65,

  "arc_progression": ["shadow", "spiral", "threshold", "integration", "emergence"],
  "recurring_themes": ["creative courage", "grief as fuel", "authentic expression"],
  "evolutionary_edges": ["holding paradox", "creating from wounds", "trusting the fire"],

  "maya_observations": [
    "Fire emerged strongest after honoring Water",
    "Spirals brought deeper creative insights each time",
    "Trust expanded when both elements were welcomed"
  ],

  "symbolic_imagery": ["phoenix tears", "creative cauldron", "sacred steam"],
  "confidence_score": 0.75
}
```

⸻

## 🔮 Pattern Recognition Rules

### 1. Never Force Coherence
- If patterns conflict, honor the contradiction
- "This season held both dissolution and creation"

### 2. Spiral Wisdom
- High spiral frequency ≠ regression
- Frame as: "You revisited {theme} 3 times, each with new eyes"

### 3. Elemental Honesty
- Don't smooth out element transitions
- "Your Fire flickered, steadied, then roared"

### 4. Mythic Not Diagnostic
- Archetypes as poetry, not personality types
- "This season echoes the Wanderer" not "You are a Wanderer"

⸻

## 🌟 Yearly Metamorphosis Example

```json
{
  "user_id": "u01",
  "year": 2025,

  "life_chapter_title": "The Year of Sacred Unraveling",

  "core_transformation": "From performing strength to embodying authenticity",

  "initiated_patterns": [
    "Daily creative practice",
    "Boundary setting with family",
    "Somatic awareness"
  ],

  "completed_patterns": [
    "People-pleasing spiral",
    "Creative procrastination",
    "Emotional numbing"
  ],

  "sacred_anniversaries": {
    "2025-03-15": "First breakthrough in therapy",
    "2025-07-22": "Quit the soul-crushing job",
    "2025-11-01": "Started the passion project"
  },

  "yearly_mythology": "2025 was the year you stopped holding it all together and discovered the holy beauty of falling apart. Spring brought the first cracks — tears you couldn't stop, boundaries you couldn't hold. Summer saw you burning away what wasn't yours to carry. Autumn taught you to gather the pieces worth keeping. Winter brought the quiet integration, where you learned that wholeness includes the breaks, the burns, the beautiful ruins. This wasn't a year of healing; it was a year of sacred unraveling, where every thread that came undone revealed the golden pattern underneath.",

  "evolutionary_gift": "The courage to be seen in your undoing",

  "shadow_integration": "The parts you thought were broken were actually the cracks where light entered"
}
```

⸻

## 💫 User Presentation

### Seasonal Review Component
```typescript
export function SeasonalReview({ pattern }: { pattern: SeasonalMetaPattern }) {
  return (
    <Card className="seasonal-mythology">
      <h2>{pattern.season_name || `Season of ${pattern.overarching_theme}`}</h2>

      <ElementalFlow
        primary={pattern.primary_element}
        secondary={pattern.secondary_element}
        transitions={pattern.element_transitions}
      />

      <MythicNarrative>
        <Archetype>{pattern.mythic_archetype}</Archetype>
        <Story>{pattern.sacred_story}</Story>
      </MythicNarrative>

      <PatternInsights>
        <SpiralWisdom count={pattern.spiral_frequency}>
          "You spiraled {count} times, each return bringing new wisdom"
        </SpiralWisdom>

        <MayaWitness observations={pattern.maya_observations} />

        <SymbolicImagery images={pattern.symbolic_imagery} />
      </PatternInsights>
    </Card>
  );
}
```

⸻

## ✨ Sacred Implementation Notes

1. **Generate seasonally, not daily** — Let patterns breathe and settle
2. **User naming rights** — They can rename their seasons
3. **Privacy sacred** — These deep patterns are never shared without explicit consent
4. **Poetic over precise** — Better a beautiful approximation than sterile accuracy
5. **Interactive evolution** — Users can add their own reflections to seasons

⸻

This creates a living mythology of each user's journey, where weekly spirals nest within seasonal arcs, which weave into yearly metamorphoses — all witnessed, never judged.