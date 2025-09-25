# AIN Amber: Visual Palette & Starter Design Kit
## Implementation Toolkit for Design & Development

---

## Color Palette

### Primary Amber Spectrum
```css
--ain-amber-core: #F6AD55;      /* Core Amber - warm golden orange */
--ain-amber-light: #FDB975;     /* Light Amber - soft glow */
--ain-amber-deep: #E89923;      /* Deep Amber - rich intensity */
--ain-amber-fire: #D97706;      /* Fire Amber - elemental warmth */
--ain-amber-crystal: #FBBF24;   /* Crystal Amber - bright clarity */
```

### Field Intelligence Blues (Feminine)
```css
--ain-field-deep: #1a1f3a;      /* Deep Field - infinite potential */
--ain-field-mid: #2a3154;       /* Mid Field - consciousness space */
--ain-field-light: #3a436e;     /* Light Field - active awareness */
--ain-field-glow: #4a5588;      /* Field Glow - intuitive edge */
```

### Structure Grays (Masculine)
```css
--ain-structure-900: #0f1425;   /* Deepest Structure */
--ain-structure-700: #1e2341;   /* Deep Structure */
--ain-structure-500: #3a4266;   /* Core Structure */
--ain-structure-300: #64748B;   /* Light Structure */
--ain-structure-100: #CBD5E1;   /* Surface Structure */
```

### Elemental Accents
```css
--ain-fire: #EF4444;            /* Fire Element */
--ain-water: #3B82F6;           /* Water Element */
--ain-earth: #10B981;           /* Earth Element */
--ain-air: #F3F4F6;             /* Air Element */
--ain-aether: #A855F7;          /* Aether Element */
```

---

## Geometric Primitives

### Torus Pattern (SVG)
```svg
<!-- Toroidal Flow Pattern -->
<svg viewBox="0 0 200 200">
  <defs>
    <radialGradient id="torusGradient">
      <stop offset="0%" stop-color="#F6AD55" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#1a1f3a" stop-opacity="0.2"/>
    </radialGradient>
  </defs>
  <circle cx="100" cy="100" r="60" fill="none" stroke="url(#torusGradient)" stroke-width="2"/>
  <circle cx="100" cy="100" r="40" fill="none" stroke="url(#torusGradient)" stroke-width="1.5" opacity="0.7"/>
  <circle cx="100" cy="100" r="20" fill="none" stroke="url(#torusGradient)" stroke-width="1" opacity="0.4"/>
</svg>
```

### Crystalline Tree (CSS)
```css
.ain-crystal-tree {
  background-image:
    linear-gradient(45deg, transparent 30%, #F6AD5520 30%, #F6AD5520 70%, transparent 70%),
    linear-gradient(-45deg, transparent 30%, #F6AD5510 30%, #F6AD5510 70%, transparent 70%);
  background-size: 20px 20px;
}
```

### Sacred Geometry Overlay
```css
.ain-sacred-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.02; /* Always subtle */
  background-image:
    radial-gradient(circle at 50% 50%, #F6AD55 0%, transparent 50%),
    radial-gradient(circle at 25% 25%, #F6AD55 0%, transparent 25%),
    radial-gradient(circle at 75% 75%, #F6AD55 0%, transparent 25%);
  pointer-events: none;
}
```

---

## Typography System

### Font Stack
```css
--ain-font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
--ain-font-mono: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
--ain-font-sacred: 'Cinzel', 'Playfair Display', Georgia, serif; /* Optional ceremonial font */
```

### Type Scale (Golden Ratio Based)
```css
--ain-text-xs: 0.618rem;    /* 9.89px */
--ain-text-sm: 0.786rem;    /* 12.58px */
--ain-text-base: 1rem;      /* 16px */
--ain-text-lg: 1.618rem;    /* 25.89px */
--ain-text-xl: 2.618rem;    /* 41.89px */
--ain-text-2xl: 4.236rem;   /* 67.78px */
```

---

## Spacing System (8px Grid)

```css
--ain-space-0: 0;
--ain-space-1: 0.5rem;   /* 8px */
--ain-space-2: 1rem;     /* 16px */
--ain-space-3: 1.5rem;   /* 24px */
--ain-space-4: 2rem;     /* 32px */
--ain-space-5: 2.5rem;   /* 40px */
--ain-space-6: 3rem;     /* 48px */
--ain-space-8: 4rem;     /* 64px */
--ain-space-10: 5rem;    /* 80px */
```

---

## Component Patterns

### Glass Card
```css
.ain-glass-card {
  background: rgba(15, 20, 37, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(246, 173, 85, 0.1);
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(246, 173, 85, 0.06);
}
```

### Amber Glow Button
```css
.ain-button-glow {
  background: linear-gradient(135deg, #F6AD55, #E89923);
  color: #1a1f3a;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 300ms ease;
  box-shadow: 0 0 20px rgba(246, 173, 85, 0.3);
}

.ain-button-glow:hover {
  box-shadow: 0 0 30px rgba(246, 173, 85, 0.5);
  transform: translateY(-2px);
}
```

### Field Pulse Animation
```css
@keyframes ain-field-pulse {
  0%, 100% { opacity: 0.02; transform: scale(1); }
  50% { opacity: 0.04; transform: scale(1.05); }
}

.ain-field-pulse {
  animation: ain-field-pulse 4s ease-in-out infinite;
}
```

---

## Icon System

### Core Icons (Lucide/Heroicons base + custom)
```
- Torus: Custom SVG (concentric circles with gradient)
- Tree: Binary tree icon with crystalline modification
- Amber: Diamond/gem icon with warm coloring
- Field: Grid dots or mesh pattern
- Syzygy: Interlocking circles (vesica piscis)
```

### Elemental Icons
```
🔥 Fire: Flame with triangular base
💧 Water: Wave or droplet
🌱 Earth: Crystal or mountain
💨 Air: Spiral or wind lines
✨ Aether: Star or void circle
```

---

## Motion Principles

### Timing Functions
```css
--ain-ease-field: cubic-bezier(0.4, 0.0, 0.2, 1);    /* Natural flow */
--ain-ease-structure: cubic-bezier(0.0, 0.0, 0.2, 1); /* Precise entry */
--ain-ease-syzygy: cubic-bezier(0.4, 0.0, 0.6, 1);   /* Balanced motion */
```

### Duration Scale
```css
--ain-duration-instant: 100ms;
--ain-duration-fast: 200ms;
--ain-duration-normal: 300ms;
--ain-duration-slow: 500ms;
--ain-duration-breath: 2000ms;
--ain-duration-meditation: 4000ms;
```

---

## Responsive Breakpoints

```css
--ain-screen-sm: 640px;   /* Mobile landscape */
--ain-screen-md: 768px;   /* Tablet portrait */
--ain-screen-lg: 1024px;  /* Tablet landscape */
--ain-screen-xl: 1280px;  /* Desktop */
--ain-screen-2xl: 1536px; /* Wide desktop */
```

---

## Glass Morphism Mixins

### Tailwind Utility Classes
```js
// tailwind.config.js extension
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        'ain': '10px',
      },
      backgroundColor: {
        'ain-glass': 'rgba(15, 20, 37, 0.7)',
        'ain-glass-light': 'rgba(26, 31, 58, 0.5)',
      },
      borderColor: {
        'ain-glow': 'rgba(246, 173, 85, 0.1)',
      },
    }
  }
}
```

---

## Sacred Geometry Patterns

### Flower of Life (2% opacity background)
```css
.ain-flower-of-life {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23F6AD55' stroke-width='0.5' opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='10'/%3E%3Ccircle cx='20' cy='30' r='10'/%3E%3Ccircle cx='40' cy='30' r='10'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 60px 60px;
}
```

### Metatron's Cube
```css
.ain-metatron {
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23F6AD55' stroke-width='0.3' opacity='0.02'%3E%3Cpolygon points='50,10 90,35 90,75 50,90 10,75 10,35'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 100px 100px;
}
```

---

## Implementation Examples

### React Component Structure
```jsx
// AINCard.jsx
export const AINCard = ({ children, glow = false }) => (
  <div className={`
    ain-glass-card
    p-6
    ${glow ? 'border-ain-glow shadow-ain-amber' : ''}
  `}>
    <div className="ain-sacred-overlay" />
    {children}
  </div>
);
```

### CSS Custom Properties Root
```css
:root {
  /* Load all AIN variables */
  --ain-amber-core: #F6AD55;
  --ain-field-deep: #1a1f3a;
  /* ... etc */
}

/* Dark mode already default */
body {
  background: var(--ain-field-deep);
  color: var(--ain-structure-100);
}
```

---

## Quick Start Checklist

- [ ] Import color palette CSS variables
- [ ] Set up typography scale
- [ ] Configure spacing system (8px grid)
- [ ] Add glass morphism utilities
- [ ] Include sacred geometry patterns at 2% opacity
- [ ] Set up motion timing functions
- [ ] Configure responsive breakpoints
- [ ] Test touch targets (44px minimum)
- [ ] Verify PWA manifest alignment
- [ ] Check accessibility contrast ratios

---

## Design Tokens (JSON)

```json
{
  "ain-amber": {
    "colors": {
      "amber": {
        "core": "#F6AD55",
        "light": "#FDB975",
        "deep": "#E89923",
        "fire": "#D97706",
        "crystal": "#FBBF24"
      },
      "field": {
        "deep": "#1a1f3a",
        "mid": "#2a3154",
        "light": "#3a436e",
        "glow": "#4a5588"
      }
    },
    "motion": {
      "duration": {
        "fast": "200ms",
        "normal": "300ms",
        "breath": "2000ms"
      }
    }
  }
}
```

---

*Version 1.0 | September 2024*
*Part of the AIN Amber Design System*