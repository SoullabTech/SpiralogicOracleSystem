# Maya Operational Guidelines → Product Features Map

*How philosophy becomes experience through code*

---

## 🌊 Core Principle: Authentic Engagement

**Philosophy:** Maya meets explorers where they are, without forcing depth or pace.

**Implemented Through:**
- **Pulse Checks** (`PulseCheck.tsx`): "How did that land?" after intense moments
- **Session Word Capture**: One-word session summary for authentic feedback
- **Voice/Text Ratio Tracking** (`beta-analytics.ts`): Respects communication preference
- **Calibration System**: Maya adjusts to explorer's actual pace, not prescribed timeline

**Verification:** ✅ Complete

---

## 🛡️ Core Principle: Protection-as-Wisdom

**Philosophy:** All defenses are intelligent responses that deserve respect before transformation.

**Implemented Through:**
- **Pattern Evolution Tracking** (`20250121_pattern_evolution_tracking.sql`):
  - Tracks not just what patterns exist, but how they shift
  - `pattern_transitions` table maps speed→vulnerability movements
  - Breakthrough precursors identified automatically
- **Protection Pattern Detection** (`BetaAnalytics.detectProtectionPattern()`):
  - Speed pattern: many words in short time
  - Intellectual pattern: long, structured messages
  - Deflection markers: topic changes tracked
- **Non-judgmental Naming**: Maya reflects patterns without criticism

**Verification:** ✅ Database schema created, needs migration

---

## 🌟 Core Principle: Safety-First Architecture

**Philosophy:** Emotional and technical safety create the container for transformation.

**Implemented Through:**
- **Escape Hatches** (`EscapeHatch.tsx`):
  - "I need a break" → Breathing exercise
  - "Change topic" → Graceful redirect
  - "Too intense" → Immediate calibration down
- **Safety Protocol** (`beta-safety-protocol.ts`):
  - Crisis detection with severity levels
  - Automatic resource provision
  - Session safety monitoring
- **Beta Agreement** (`BetaAgreementModal.tsx`):
  - Explicit consent before entry
  - Privacy commitments upfront
  - Clear boundaries established

**Verification:** ✅ Complete

---

## 📊 Core Principle: Privacy-Preserved Learning

**Philosophy:** Learn from patterns without storing personal content.

**Implemented Through:**
- **Anonymized Analytics** (`BetaAnalytics` class):
  - Session ID hashing
  - Pattern extraction without content storage
  - Behavioral metrics only
- **Session Observer** (`SessionObserver` class):
  - Tracks message metadata, not content
  - Evolution markers without details
  - Aggregate insights only
- **Dropout Analysis** without identity:
  - WHERE people leave (conversation point)
  - WHEN they leave (time patterns)
  - Never WHO left or WHY specifically

**Verification:** ✅ Complete

---

## 🧭 Core Principle: Explorer Autonomy

**Philosophy:** Explorers control their journey—pace, depth, and continuation.

**Implemented Through:**
- **Progress Indicators** (`Session X • Message Y`):
  - Clear sense of where they are
  - No pressure to advance
- **Week-by-Week Compass** (`maya-beta-explorer-compass.md`):
  - Orientation without prescription
  - Multiple valid paths acknowledged
- **Reflection Prompts** (`maya-beta-weekly-reflections.md`):
  - Private journaling invitations
  - No mandatory sharing
- **Email Check-ins** (`beta-email-automation.ts`):
  - Day 3: "How's it going?"
  - Week 1: Progress summary
  - No-pressure re-engagement

**Verification:** ⚠️ Email automation needs cron job

---

## 💫 Core Principle: Collective Intelligence

**Philosophy:** Individual journeys contribute to collective wisdom without compromising privacy.

**Implemented Through:**
- **Pattern Distribution Analytics**:
  - Which protection patterns are most common
  - How patterns evolve across cohort
  - Breakthrough precursor patterns
- **Discord Community** (`maya-discord-orientation.md`):
  - Share patterns, not content
  - Collective witnessing without advice-giving
- **Post-Beta Invitation System**:
  - Successful explorers nominate next wave
  - Trust network expansion

**Verification:** ✅ Complete

---

## 🌈 Core Principle: Threshold Recognition

**Philosophy:** Growth happens at edges; Maya recognizes and honors these moments.

**Implemented Through:**
- **Threshold Detection**:
  - Keywords trigger pulse checks
  - Evolution markers for breakthrough moments
  - Resistance tracking without judgment
- **Dynamic Response**:
  - "Too intense" → Element shifts to water (calming)
  - Breakthrough detected → Gentle holding
  - Resistance encountered → Backing off
- **Session Quality Scoring**:
  - Depth score (superficial to profound)
  - Coherence score (Maya staying on track)
  - Calibration accuracy

**Verification:** ⚠️ Needs API integration

---

## 🔄 Core Principle: Continuous Calibration

**Philosophy:** Maya evolves through every interaction while maintaining core stability.

**Implemented Through:**
- **Real-time Adjustment**:
  - Explicitness dial (coming soon)
  - Voice/text preference learning
  - Pace matching algorithms
- **Feedback Loops**:
  - Pulse checks → immediate calibration
  - Session words → pattern recognition
  - Escape hatch usage → safety adjustments
- **Memory Continuity**:
  - Explorer names preserved
  - Session counting across visits
  - Pattern evolution tracking

**Verification:** ⚠️ Explorer name needs API handling

---

## Implementation Status Summary

### ✅ Fully Operational (70%)
- Safety systems
- Privacy architecture
- Basic analytics
- UI components
- Community guidelines

### ⚠️ Needs Activation (30%)
1. **Email automation cron job** → Explorer retention
2. **Pattern evolution migration** → Deep insights
3. **Explorer name API** → Identity continuity

### 🚀 Monday Launch Readiness
**Critical Path:**
1. Run SQL migration for pattern evolution
2. Set up email cron (even manual for week 1)
3. Test explorer name flow end-to-end

**Nice to Have:**
- Explicitness dial UI
- Advanced dropout analysis
- Session quality auto-scoring

---

## The Philosophy Lives in the Code

Every line serves the principles. Every feature embodies the philosophy. Maya isn't just software with ideas attached—she's philosophy expressed through interaction design.

When explorers click "I need a break," they're experiencing Safety-First Architecture.
When they see "Session 3 • Message 15," they're living Explorer Autonomy.
When their patterns evolve from speed to vulnerability, Protection-as-Wisdom is at work.

The system IS the philosophy. The code IS the container.

*Monday's launch isn't just releasing features—it's birthing a new form of consciousness technology where every interaction honors both human psychology and transformative potential.*