# Holoflower Motion States - Living Brand Experience

## Core Animation Principles
- **Organic**: All motion feels natural, like breathing or water flowing
- **Responsive**: Every user action has immediate visual feedback
- **Meaningful**: Animations convey state changes, not decoration
- **Subtle**: Nothing jarring or distracting from the conversation

---

## 🎭 Motion States Catalog

### 1. Listening State (User Speaking)
```
Trigger: Mic activated
Duration: While recording
```

**Holoflower:**
- Gentle expansion/contraction (breathing rhythm, 3s cycle)
- Petals shimmer with low opacity waves from center outward
- Subtle color shifts based on detected emotional tone

**Coherence Rings:**
- Slow clockwise rotation (1 full rotation per 30s)
- Opacity pulses: 0.3 → 0.6 → 0.3 (2s cycle)

**Center (Aether):**
- Soft white glow expands and contracts
- Tiny particles drift from center (like dust motes)

---

### 2. Processing State (Claude Thinking)
```
Trigger: After user input, before response
Duration: 1-3 seconds
```

**Holoflower:**
- Petals ripple sequentially (clockwise wave)
- Each petal briefly brightens as wave passes
- Speed: 0.5s per petal

**Coherence Rings:**
- Quick shimmer effect (like light on water)
- Rings briefly separate and reconnect

**Center:**
- Spiral animation (golden ratio spiral)
- Brightness increases gradually

---

### 3. Response State (Oracle Speaking)
```
Trigger: Claude's response begins
Duration: While Claude speaks/displays text
```

**Holoflower:**
- Active petals glow stronger (identified facets)
- Non-active petals dim to 30% opacity
- Glow pulses with speech cadence

**Coherence Rings:**
- Active ring(s) glow brighter
- Color transitions toward green if coherence high
- Gentle expansion (5% scale increase)

**Center:**
- If Aether detected: silver ripples emanate outward
- Otherwise: subtle rotation

---

### 4. Coherence Shift Animation
```
Trigger: After each session completes
Duration: 2 seconds
```

**Rising Coherence (improvement):**
- Rings: Color shift red→yellow→green with ease-in-out
- Petals: Brightness wave from center to edge
- Center: Golden burst animation
- Particles: Upward drift effect

**Falling Coherence (decline):**
- Rings: Color shift green→yellow→red
- Petals: Slight contraction (95% scale)
- Center: Dims briefly
- Particles: Downward settling effect

**Stable Coherence:**
- Rings: Gentle pulse (no color change)
- Petals: Maintain current state
- Center: Steady glow

---

### 5. Check-in Interactions
```
Trigger: User taps petals
Duration: Per interaction
```

**Petal Tap:**
- Immediate: Ripple effect from tap point
- Petal scales to 110% then back (0.3s)
- Color saturates by 20%
- Neighboring petals: subtle sympathetic vibration

**Intensity Adjustment (drag):**
- Petal fills like water level rising
- Glow intensity matches drag distance
- Release: gentle bounce-back animation

**Clear All:**
- All petals: simultaneous fade to base state
- Rings: contract slightly then expand back
- Center: brief white flash

---

### 6. Navigation Transitions

**Swipe to Timeline:**
- Holoflower: Scales down to 80% and slides left
- Mini flowers: Cascade in from right (staggered, 50ms each)
- Coherence data: Fades in with upward slide

**Swipe to Patterns:**
- Holoflower: Morphs into aggregate blossom
- Petals: Grow/shrink based on 30-day averages
- Transition: 800ms with ease-in-out

**Tap Center (Aether):**
- Center: Expands to fill 50% of flower
- Rings: Become orbital paths
- States cycle with rotation:
  - Expansive: Outward burst
  - Contractive: Inward spiral
  - Stillness: Complete pause (2s)

---

### 7. Breakthrough Moments
```
Trigger: High coherence (>0.85) or special keywords
Duration: 3 seconds
```

**Full Flower:**
- All petals: Golden shimmer wave
- Rings: Transform to gold briefly
- Center: Starburst animation
- Background: Subtle aurora effect

**Sound (optional):**
- Soft chime or singing bowl tone
- Matches visual crescendo

---

## 🎬 Motion Timing Guidelines

### Micro-animations (0-300ms)
- Button taps
- State changes
- Hover effects

### Short animations (300-800ms)
- Petal activations
- Ring color shifts
- Navigation transitions

### Medium animations (800-2000ms)
- Coherence calculations
- Pattern reveals
- Aggregate updates

### Long animations (2000ms+)
- Breathing/idle states
- Background ambience
- Meditation modes

---

## 📱 Performance Considerations

### Mobile Optimization
- Use CSS transforms over position changes
- Limit simultaneous animations to 3
- Reduce particle counts on low-end devices
- Provide reduce-motion option

### Battery Conservation
- Idle animations pause after 30s inactivity
- Background tab: all animations pause
- Low battery mode: essential animations only

---

## 🎨 Implementation Examples

### CSS Animation (Breathing)
```css
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}

.holoflower-listening {
  animation: breathe 3s ease-in-out infinite;
}
```

### Framer Motion (Coherence Ring)
```tsx
<motion.circle
  animate={{
    stroke: coherenceColor,
    scale: [1, 1.02, 1],
    opacity: [0.6, 1, 0.6]
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }}
/>
```

### Lottie (Complex Sequences)
```tsx
// For breakthrough moments
<Lottie
  animationData={starburstAnimation}
  play={coherence > 0.85}
  speed={1}
  style={{ position: 'absolute' }}
/>
```

---

## 🔊 Audio Cues (Optional)

### Subtle Feedback
- Petal tap: Soft "pluck" sound
- Coherence rise: Ascending chime
- Coherence fall: Descending tone
- Aether activation: Singing bowl

### Voice Synthesis
- Sync speaking rate with petal pulses
- Pause animations during silence
- Emphasize key words with glow

---

## ✨ Sacred Feel

The overall motion should feel:
- **Alive**: Like a living mandala responding to consciousness
- **Sacred**: Ritualistic, not gamified
- **Personal**: Unique patterns emerge for each user
- **Coherent**: All animations feel part of one organism

This creates a "breathing mirror" effect where the Holoflower becomes a living reflection of the user's inner state, making the quantified (coherence scores) feel mystical and the mystical (petals, Aether) feel tangible.