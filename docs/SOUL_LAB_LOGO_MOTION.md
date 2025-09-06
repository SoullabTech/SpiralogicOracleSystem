# Soul Lab Logo Motion Specification

## Overview
This document defines the complete motion language for the Soul Lab's sacred spiral logo, establishing timing, easing, and placement guidelines for developers implementing the threshold experience.

## Core Brand Assets

### Sacred Spiral Logo
- **File**: `/public/sacred-logo.svg`
- **Sacred Gold**: `#FFD700` (primary brand color)
- **Dimensions**: 48x48px base size, scalable
- **Structure**: Outer circle, sacred triangle, inner circle, center point, corner dots

### Elemental Color Palette
```css
/* Fire Element */
--fire-primary: #FF6B6B;
--fire-glow: #ff4444;

/* Water Element */  
--water-primary: #4ECDC4;
--water-glow: #00d4d4;

/* Earth Element */
--earth-primary: #95E77E;  
--earth-glow: #7aff7a;

/* Air Element */
--air-primary: #FFE66D;
--air-glow: #ffdd00;

/* Aether Element */
--aether-primary: #B57EDC;
--aether-glow: #cc77ff;

/* Sacred Gold Accent */
--sacred-gold: #FFD700;
--sacred-gold-glow: #ffff00;
```

## Motion Specifications

### 1. Onboarding Entry Animation

**Component**: `SoulLabLogoEntry`

```typescript
// Entry Animation Sequence
const entryAnimation = {
  initial: {
    scale: 0,
    rotate: -180,
    opacity: 0,
  },
  animate: {
    scale: [0, 0.1, 1.2, 1],
    rotate: [0, 90, 720, 720],
    opacity: [0, 0.3, 0.8, 1],
  },
  transition: {
    duration: 1.5,
    ease: "easeOut",
    times: [0, 0.2, 0.8, 1],
  }
}

// Sacred Breathing Pulse
const breathingPulse = {
  scale: [1, 1.05, 1],
  opacity: [1, 0.8, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  }
}
```

**Timing Breakdown**:
- **Initial unfurl**: 0-0.3s (scale from 0 to 0.1)
- **Spiral expansion**: 0.3-1.2s (unfold with rotation)
- **Sacred settling**: 1.2-1.5s (gentle scale adjustment)
- **Breathing cycle**: Starts at 1.5s, continues every 2s

### 2. Idle Presence States

**Component**: `SoulLabLogoPresence`

```typescript
// Subtle Presence (Navigation)
const idlePresence = {
  opacity: [0.15, 0.25, 0.15],
  scale: [1, 1.02, 1],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
  }
}

// Sacred Ripple (every 30s)
const sacredRipple = {
  boxShadow: [
    "0 0 0 0 rgba(255, 215, 0, 0.4)",
    "0 0 0 20px rgba(255, 215, 0, 0.1)",
    "0 0 0 40px rgba(255, 215, 0, 0)",
  ],
  transition: {
    duration: 1.2,
    ease: "easeOut",
  }
}
```

### 3. Thinking Indicator (Chat/Mirror States)

**Component**: `SoulLabThinkingSpiral`

```typescript
// Continuous Rotation
const thinkingRotation = {
  rotate: 360,
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "linear",
  }
}

// Elemental Glow Shift
const elementalGlow = {
  filter: [
    "drop-shadow(0 0 8px #FF6B6B)", // Fire
    "drop-shadow(0 0 8px #4ECDC4)", // Water  
    "drop-shadow(0 0 8px #95E77E)", // Earth
    "drop-shadow(0 0 8px #FFE66D)", // Air
    "drop-shadow(0 0 8px #B57EDC)", // Aether
  ],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: "easeInOut",
  }
}
```

### 4. Navigation Transitions

**Component**: `SoulLabNavTransition`

```typescript
// Section Unfurl (Mirror → Spiral → Journal → Attune)
const sectionTransition = {
  scale: [1, 1.3, 1],
  rotate: [0, 180, 360],
  opacity: [0.2, 1, 0.2],
  transition: {
    duration: 0.8,
    ease: "easeInOut",
  }
}

// Mobile Tab Watermark
const tabWatermark = {
  opacity: [0.1, 0.3, 0.1],
  y: [0, -2, 0],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut",
  }
}
```

## Placement Guidelines

### Onboarding Screen
```css
.onboarding-logo {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  z-index: 1000;
}
```

### Desktop Navigation
```css
.nav-logo {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 40px;
  height: 40px;
  opacity: 0.15;
  z-index: 100;
}
```

### Mobile Navigation
```css
.mobile-nav-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  opacity: 0.1;
  z-index: 1;
}
```

### Chat Thinking State
```css
.thinking-spiral {
  width: 24px;
  height: 24px;
  margin: 0 auto;
  opacity: 0.8;
}
```

## Implementation Components

### 1. Base Logo Component
```typescript
interface SoulLabLogoProps {
  size?: number;
  variant?: 'entry' | 'presence' | 'thinking' | 'transition';
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  className?: string;
}
```

### 2. Animation States
- `initial`: Logo appears (onboarding)
- `idle`: Subtle presence (navigation)  
- `thinking`: Active rotation with elemental glow
- `transitioning`: Between app sections
- `breathing`: Sacred pulse rhythm

### 3. Accessibility Considerations
```css
@media (prefers-reduced-motion: reduce) {
  .soul-lab-logo {
    animation: none !important;
    transition: opacity 0.2s ease;
  }
}
```

## CSS Custom Properties
```css
:root {
  /* Sacred Timing */
  --soul-lab-breath-duration: 2s;
  --soul-lab-unfurl-duration: 1.5s;
  --soul-lab-ripple-duration: 1.2s;
  --soul-lab-thinking-duration: 3s;
  
  /* Sacred Easing */
  --soul-lab-unfurl-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --soul-lab-breath-ease: cubic-bezier(0.37, 0, 0.63, 1);
  --soul-lab-ripple-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* Sacred Colors */
  --soul-lab-primary: #FFD700;
  --soul-lab-glow: rgba(255, 215, 0, 0.4);
  --soul-lab-watermark: rgba(255, 215, 0, 0.15);
}
```

## Tailwind Classes
```css
/* Custom Tailwind classes for easy implementation */
.sacred-unfurl {
  @apply animate-[unfurl_1.5s_ease-out_forwards];
}

.sacred-breath {
  @apply animate-[breath_2s_ease-in-out_infinite];
}

.sacred-ripple {
  @apply animate-[ripple_1.2s_ease-out_forwards];
}

.sacred-thinking {
  @apply animate-[thinking_3s_linear_infinite];
}

.sacred-presence {
  @apply opacity-15 hover:opacity-30 transition-opacity duration-300;
}
```

## Developer Quick Reference

### Import Structure
```typescript
import { 
  SoulLabLogo, 
  SoulLabLogoEntry, 
  SoulLabThinkingSpiral,
  SoulLabNavTransition 
} from '@/components/brand/SoulLabLogo';
```

### Usage Examples
```tsx
// Onboarding
<SoulLabLogoEntry onComplete={() => setShowWelcome(true)} />

// Navigation
<SoulLabLogo variant="presence" className="fixed top-4 left-4" />

// Thinking State  
<SoulLabThinkingSpiral element="fire" />

// Section Transition
<SoulLabNavTransition fromSection="mirror" toSection="spiral" />
```

This specification provides exact timing values, easing functions, and implementation patterns that developers can directly integrate with Tailwind CSS and Framer Motion without guesswork.