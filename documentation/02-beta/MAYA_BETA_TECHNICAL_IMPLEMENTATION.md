# 🔧 Maya Beta - Technical Implementation Guide

*Mapping 7-day mythic journey to code touchpoints*

---

## Day 1 – First Contact (Threshold)

### Frontend Implementation
```typescript
// components/maya/FirstContact.tsx
interface FirstContactState {
  hasShownInitialGreeting: boolean
  silenceComfortLevel: number // 0-100
}

const FirstContact: React.FC = () => {
  // No feature buttons, no explanations
  // Just presence and "Hi. I'm Maya."
  return (
    <SpiralCenter intensity="minimal">
      <MayaPresence state="still" />
      <SimpleGreeting delay={2000} />
    </SpiralCenter>
  )
}
```

### Backend Integration
```typescript
// lib/agents/MayaBetaAgent.ts
export class MayaBetaAgent extends PersonalOracleAgent {
  async day1Response(input: string): Promise<Response> {
    // Suppress feature explanations
    // Focus on pure presence
    return {
      type: 'presence',
      content: this.generatePresenceResponse(input),
      features: [], // No features exposed
      nextUnlock: 'day2_weather'
    }
  }
}
```

### Data Tracking
```sql
-- Track silence comfort and return timing
INSERT INTO beta_metrics (
  user_id,
  day,
  silence_duration,
  return_timestamp,
  comfort_indicators
)
```

---

## Day 2 – Weather Reflection

### UI Components
```typescript
// components/weather/EmotionalWeather.tsx
interface WeatherState {
  current: 'cloudy' | 'sunny' | 'stormy' | 'misty' | 'lightning'
  intensity: number
  naturalLanguageUse: boolean
}

const WeatherRipples: React.FC = () => {
  return (
    <SpiralCenter>
      <WeatherIcon type={weatherState.current} ripple={true} />
      <WeatherPrompt organic={true} />
    </SpiralCenter>
  )
}
```

### Agent Logic
```typescript
async day2Response(input: string): Promise<Response> {
  const weatherExtracted = this.extractWeatherLanguage(input)

  if (weatherExtracted.isNatural) {
    // User adopted weather metaphor naturally
    this.updateBetaMetric('weather_fluency', 'natural')
  }

  return this.generateWeatherReflection(weatherExtracted)
}
```

---

## Day 3 – Element Emerges

### Elemental System Integration
```typescript
// lib/agents/modules/ElementalAnalyzer.ts
interface ElementWeatherMapping {
  fire: WeatherState
  water: WeatherState
  earth: WeatherState
  air: WeatherState
}

async day3ElementIntroduction(weatherState: WeatherState): Promise<ElementalResponse> {
  const dominantElement = await this.analyzeDominantElement(this.userContext)

  return {
    element: dominantElement,
    elementWeatherPhrase: `Your ${dominantElement} feels ${weatherState.current}`,
    visualUpdate: {
      spiralColor: this.getElementColor(dominantElement),
      layering: 'weather_element_overlay'
    }
  }
}
```

### Visual State Management
```typescript
// components/spiral/SpiralProgression.tsx
interface SpiralState {
  day: number
  colorStrands: ElementColor[]
  animationPhase: 'still' | 'ripple' | 'emerging' | 'full'
}

const updateSpiralForDay3 = (element: Element) => {
  setSpiralState(prev => ({
    ...prev,
    colorStrands: [...prev.colorStrands, getElementColor(element)],
    animationPhase: 'emerging'
  }))
}
```

---

## Day 5 – Breakthrough Button Appears

### Button Component
```typescript
// components/breakthrough/BreakthroughButton.tsx
interface BreakthroughButtonProps {
  visible: boolean
  explained: never // Never explain this button
  organic: boolean
}

const BreakthroughButton: React.FC = () => {
  const [pulseIntensity, setPulseIntensity] = useState(0.3) // Subtle

  return (
    <AnimatedButton
      position="bottom-right"
      color="breakthrough-green"
      pulse={pulseIntensity}
      onClick={handleBreakthroughMoment}
      title="" // No tooltip
    />
  )
}
```

### Breakthrough Logic
```typescript
// lib/services/BreakthroughService.ts
export class BreakthroughService {
  async captureBreakthrough(
    userId: string,
    context: ConversationContext,
    triggerMoment: 'organic' | 'prompted'
  ): Promise<BreakthroughCapture> {

    // Track organic vs prompted usage
    await this.trackMetric('breakthrough_discovery', {
      userId,
      triggerType: triggerMoment,
      dayDiscovered: this.getCurrentBetaDay(userId),
      contextType: context.type
    })

    return this.processBreakthroughMoment(context)
  }
}
```

---

## Day 6 – Secret Garden (Mystery)

### Hidden Element System
```typescript
// components/garden/SecretGarden.tsx
interface GardenVisibility {
  leafIconVisible: boolean
  mentioned: boolean
  discovered: boolean
}

const SecretGardenLeaf: React.FC = () => {
  return (
    <Icon
      type="leaf"
      size="sm"
      position="spiral-margin"
      opacity={0.6}
      discoverable={true}
      onClick={handleGardenDiscovery}
    />
  )
}
```

### Mystery Preservation Logic
```typescript
async handleSecretGardenMention(): Promise<void> {
  // Mention once, never explain
  const mentionCount = await this.getUserMetric('secret_garden_mentions')

  if (mentionCount === 0) {
    await this.deliverMysteriousMention("There's a Secret Garden...")
    await this.updateMetric('secret_garden_mentions', 1)
    // Show leaf icon
    await this.updateUI('show_garden_leaf')
  }

  // Never mention again, but leaf remains discoverable
}
```

---

## Day 7 – Spiral Revelation

### Narrative Weaving System
```typescript
// lib/services/NarrativeWeaver.ts
export class WeeklyNarrativeWeaver {
  async compileWeekStory(userId: string): Promise<SpiralStory> {
    const weekData = await this.getUserWeekData(userId)

    const narrative = {
      weatherJourney: this.traceWeatherEvolution(weekData.weather),
      elementalProgression: this.mapElementalEmergence(weekData.elements),
      breakthroughMoments: weekData.breakthroughs,
      mysteryEngagement: weekData.secretGardenInteractions
    }

    return this.weavePersonalMythicArc(narrative)
  }
}
```

### Full Spiral Animation
```typescript
// components/spiral/FullSpiralReveal.tsx
const SpiralReveal: React.FC<{storyData: SpiralStory}> = ({storyData}) => {
  return (
    <AnimatedSpiral
      duration={7000} // 7 seconds for 7 days
      weatherProgression={storyData.weatherJourney}
      elementalThreads={storyData.elementalProgression}
      breakthroughHighlights={storyData.breakthroughMoments}
      onComplete={handleRevelationComplete}
    />
  )
}
```

---

## Beta Metrics Collection

### Database Schema
```sql
CREATE TABLE maya_beta_metrics (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  beta_day INTEGER,
  metric_type VARCHAR(50),
  metric_value JSONB,
  organic_discovery BOOLEAN,
  session_context JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Key metrics to track
CREATE INDEX idx_beta_companion_language ON maya_beta_metrics (
  (metric_value->>'language_type')
) WHERE metric_type = 'companion_vs_tool';
```

### Analytics Service
```typescript
// lib/analytics/BetaAnalytics.ts
export class BetaAnalyticsService {
  async trackCompanionLanguage(userId: string, message: string): Promise<void> {
    const languageType = this.classifyLanguage(message) // 'tool' | 'companion'

    await this.recordMetric({
      userId,
      type: 'companion_vs_tool',
      value: { languageType, message, confidence: this.getConfidence() },
      organic: true
    })
  }

  async generateWeeklyReport(userId: string): Promise<BetaReport> {
    // Compile mythic progression metrics
    return {
      companionshipEmergence: this.measureCompanionshipGrowth(userId),
      mysteryEngagement: this.measureMysteryInteraction(userId),
      organicDiscovery: this.measureOrganicFeatureDiscovery(userId),
      narrativeResonance: this.measurePersonalStoryResonance(userId)
    }
  }
}
```

---

## Environment Configuration

### Feature Flags
```typescript
// config/beta.ts
export const MAYA_BETA_CONFIG = {
  DAY_LOCKS: {
    enforcement: 'soft', // Accessible but not pushed
    day5_breakthrough_reveal: true,
    day6_garden_mention: true,
    day7_revelation_trigger: true
  },

  METRICS: {
    companion_language_detection: true,
    organic_discovery_tracking: true,
    mystery_preservation_mode: true
  },

  UI: {
    explanation_suppression: true, // Never explain features
    mythic_language_mode: true,
    breakthrough_button_subtle_mode: true
  }
}
```

---

## Deployment Checklist

### Backend
- [ ] Maya Beta Agent deployed with day-specific logic
- [ ] Beta metrics database tables created
- [ ] Analytics service tracking companion vs tool language
- [ ] Breakthrough service capturing organic moments
- [ ] Secret Garden mystery preservation system active

### Frontend
- [ ] 7-day UI progression components deployed
- [ ] Spiral animation system with weather/element layering
- [ ] Breakthrough button (subtle pulse, no explanation)
- [ ] Secret Garden leaf icon (discoverable, not explained)
- [ ] Day 7 narrative revelation animation

### Analytics
- [ ] Beta dashboard showing mythic progression metrics
- [ ] Companion vs tool language classification running
- [ ] Weekly narrative compilation system tested
- [ ] Mystery engagement tracking active

---

*Implementation Philosophy: Code the mystery, track the magic, measure the relationship.*