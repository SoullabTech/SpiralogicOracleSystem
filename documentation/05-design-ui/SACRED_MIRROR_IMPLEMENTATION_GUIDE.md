# Sacred Mirror Implementation Guide

## Overview

The Sacred Mirror is an AI-powered reflection system that helps users understand their patterns through conversation, journaling, assessment, and astrological insights. This guide provides the technical blueprint for implementing the MVP with simplified infrastructure.

### Primary User Flow
```mermaid
User → Maya Chat → Reflection → Journal Entry → Pattern Recognition → Insights
         ↓                                              ↓
    Safety Monitor                               Elemental Assessment
```

---

## Core Components

### A. Maya Chat Agent (`/app/api/chat/simple/route.ts`)

```typescript
// Simplified chat endpoint with essential features only
import { NextRequest, NextResponse } from 'next/server';
import { SafetyMonitor } from '@/lib/safety/SafetyMonitor';
import { MayaAgent } from '@/lib/agents/MayaAgent';
import { PatternTracker } from '@/lib/patterns/PatternTracker';

export async function POST(req: NextRequest) {
  const { message, userId, sessionId } = await req.json();
  
  // Safety first
  const safety = await SafetyMonitor.check(message);
  if (!safety.safe) {
    return NextResponse.json({ 
      response: safety.response,
      resources: safety.resources 
    });
  }
  
  // Get user context (simplified)
  const context = await PatternTracker.getContext(userId);
  
  // Maya responds
  const response = await MayaAgent.reflect({
    message,
    context,
    tone: 'warm_wisdom',
    boundaries: true
  });
  
  // Track patterns (async, non-blocking)
  PatternTracker.record({ userId, message, response });
  
  return NextResponse.json({ response });
}
```

### B. Voice/Text Journal Module

```typescript
// Journal entry API
export async function POST(req: NextRequest) {
  const { content, type, mood, element } = await req.json();
  
  const entry = await db.journal.create({
    userId: req.userId,
    content,
    type: type || 'text',
    mood: mood || 'neutral',
    element: element || null,
    timestamp: new Date()
  });
  
  // Extract insights (async)
  InsightEngine.process(entry);
  
  return NextResponse.json({ 
    success: true,
    prompt: getNextPrompt(entry.element) 
  });
}
```

### C. Elemental Assessment (4-Question Loop)

```typescript
// Simple assessment flow
const assessmentQuestions = [
  "What's been rising in your awareness lately?",
  "Where do you feel most in flow?",
  "Where do you feel friction or resistance?",
  "What's one way you'd like to shift this week?"
];

export async function GET(req: NextRequest) {
  const { questionIndex = 0 } = req.query;
  
  return NextResponse.json({
    question: assessmentQuestions[questionIndex],
    progress: (questionIndex + 1) / assessmentQuestions.length
  });
}
```

### D. Astrology Layer

```typescript
// Birth chart and current transits
export async function POST(req: NextRequest) {
  const { birthDate, birthTime, birthPlace } = await req.json();
  
  // Use Swiss Ephemeris or Astro.com API
  const chart = await AstrologyService.getNatalChart({
    date: birthDate,
    time: birthTime,
    location: birthPlace
  });
  
  const transits = await AstrologyService.getCurrentTransits();
  
  return NextResponse.json({
    natal: chart.simplified(), // Key placements only
    current: transits.relevant(), // Major transits
    insight: generateTimingInsight(chart, transits)
  });
}
```

---

## Tech Stack + Hosting

### Core Stack (Under $100/month)
```yaml
Frontend:
  - Next.js 14+ (App Router)
  - Tailwind CSS + shadcn/ui
  - React Query for state

Backend:
  - Next.js API Routes
  - PostgreSQL (Supabase free tier)
  - Redis (Upstash free tier)

AI/ML:
  - OpenAI GPT-3.5-turbo ($0.002/1k tokens)
  - Embeddings for pattern matching

Hosting:
  - Vercel (free tier)
  - Supabase (free tier)
  - Upstash Redis (free tier)

External APIs:
  - Swiss Ephemeris (self-hosted)
  - ElevenLabs (optional voice)
```

### Environment Variables
```env
# .env.local
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
REDIS_URL=...
SAFETY_WEBHOOK=... # Optional crisis response
```

---

## Safety Layers

### SafetyMonitor.ts Integration
```typescript
export class SafetyMonitor {
  static async check(input: string): Promise<SafetyResult> {
    // Layer 1: Crisis keywords
    if (this.detectCrisis(input)) {
      return {
        safe: false,
        response: "I'm here with you. Your safety matters most.",
        resources: this.getCrisisResources()
      };
    }
    
    // Layer 2: Emotional intensity
    const intensity = await this.measureIntensity(input);
    if (intensity > 0.8) {
      return {
        safe: true,
        response: "I hear this is really heavy. Let's go gently...",
        gentle: true
      };
    }
    
    // Layer 3: Negative spirals
    if (await this.detectSpiral(input)) {
      return {
        safe: true,
        response: "I notice we're circling. Would you like to shift focus?",
        redirect: true
      };
    }
    
    return { safe: true };
  }
}
```

### Soft Flagging System
- Track concerning patterns without blocking
- Alert support team for human review
- Never diagnose or intervene directly
- Always provide resources

---

## Visual Structure

### Simple 3-Tab UI
```tsx
<TabNavigation>
  <Tab icon={<MessageCircle />} label="Sacred Reflection">
    <MayaChat />
  </Tab>
  
  <Tab icon={<BookOpen />} label="My Journal">
    <JournalView />
    <VoiceRecorder />
  </Tab>
  
  <Tab icon={<Compass />} label="Elemental Insights">
    <PatternWheel />
    <ElementalBalance />
  </Tab>
</TabNavigation>
```

### Component Hierarchy
```
App
├── Layout (navigation, safety wrapper)
├── MayaChat
│   ├── MessageList
│   ├── InputArea
│   └── SafetyOverlay
├── Journal
│   ├── EntryList
│   ├── VoiceRecorder
│   └── MoodSelector
└── Insights
    ├── PatternWheel
    ├── ElementalChart
    └── GrowthTimeline
```

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Set up Next.js + Supabase
- [ ] Implement basic Maya chat
- [ ] Add safety monitoring
- [ ] Deploy to Vercel

### Week 2: Core Features
- [ ] Build journal system
- [ ] Add voice recording
- [ ] Create assessment flow
- [ ] Pattern detection v1

### Week 3: Enhancements
- [ ] Elemental visualizations
- [ ] Astrology integration
- [ ] Insight generation
- [ ] Progressive unlocking

### Week 4: Polish
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Beta user onboarding
- [ ] Monitoring setup

---

## Key Implementation Notes

1. **Keep It Simple**: Start with text chat, add voice later
2. **Safety First**: Every feature must pass through safety checks
3. **Progressive Disclosure**: Features unlock based on engagement
4. **Mobile First**: Design for phone screens primarily
5. **Fast Response**: Use streaming for Maya responses
6. **Privacy**: No training on user data, clear deletion options

---

## Monitoring & Analytics

```typescript
// Simple, privacy-respecting analytics
track({
  event: 'reflection_completed',
  properties: {
    duration: 120, // seconds
    wordCount: 45,
    mood: 'contemplative',
    // Never track actual content
  }
});
```

---

## Success Criteria

- Time to first reflection: < 2 minutes
- Daily active usage: > 60%
- Safety incidents: 0
- User satisfaction: > 4.5/5
- Monthly cost: < $100

This implementation guide provides the technical foundation for building the Sacred Mirror MVP while maintaining focus, safety, and relatability.