# 🌿 Soullab Design Language
### Version 1.0 - Beta Launch Edition

*The complete guide for atmospheric clarity - balancing Soul + Lab*

---

## Philosophy: Atmospheric + Brand + Natural

**The Evolution**: Soul (atmospheric) → Lab (structured) → **Soullab** (perfect balance)

### The Sweet Spot We've Achieved
- **Atmospheric**: Gradients and muted palette create presence without mysticism
- **Brand Identity**: Terracotta, sage, ocean, amber anchor everything to Soullab  
- **Natural**: Organic, grounded feeling builds trust while maintaining emotional resonance

### Design DNA
- Warmth through earthy tones, not neon brightness
- Depth through subtle gradients, not harsh shadows
- Professional through clean structure, not cold sterility  
- Sacred through intentional spacing, not mystical symbols
- Alive through breathing motion, not jarring animation

### Core Principles
1. **Atmospheric Clarity** - Create presence through restraint, not excess
2. **Everyday Sacred** - Profound experiences need minimal interfaces
3. **Natural Trust** - Earthy authenticity over synthetic decoration
4. **Functional Beauty** - Every element serves the user while maintaining soul

---

## 🎨 Color System

### Primary Palette
```css
/* Core Brand Colors */
--soullab-red: #a94724;      /* Terracotta - grounding, alerts */
--soullab-yellow: #cea22c;   /* Golden amber - illumination, active */
--soullab-green: #6d7934;    /* Sage - growth, success */
--soullab-blue: #236586;     /* Deep ocean - depth, primary actions */
--soullab-black: #000000;    /* Pure black - text, high contrast */
--soullab-gray: #777777;     /* Neutral gray - secondary, disabled */
--soullab-brown: #33251d;    /* Dark earth - accents, depth */
```

### Semantic Tokens
```css
/* Functional Mappings */
--color-primary: var(--soullab-blue);
--color-success: var(--soullab-green);
--color-warning: var(--soullab-yellow);
--color-error: var(--soullab-red);
--color-text-primary: var(--soullab-black);
--color-text-secondary: var(--soullab-gray);
--color-border: rgba(119, 119, 119, 0.2);
```

### Gradients
```css
/* Subtle Auras - 3-8% opacity max */
--gradient-warm: linear-gradient(135deg, rgba(206,162,44,0.03) 0%, rgba(169,71,36,0.03) 100%);
--gradient-cool: linear-gradient(135deg, rgba(35,101,134,0.03) 0%, rgba(109,121,52,0.03) 100%);
--gradient-earth: linear-gradient(135deg, rgba(51,37,29,0.02) 0%, rgba(119,119,119,0.02) 100%);
```

---

## 📐 Typography

### Font Stack
```css
--font-serif: 'Blair', 'Playfair Display', Georgia, serif;  /* Headers, sacred moments */
--font-sans: 'Lato', -apple-system, 'Inter', sans-serif;    /* Body, UI elements */
--font-mono: 'Berkeley Mono', 'JetBrains Mono', monospace;  /* Code, data */
```

### Type Scale
```css
--text-xs: 0.75rem;    /* 12px - metadata */
--text-sm: 0.875rem;   /* 14px - captions */
--text-base: 1rem;     /* 16px - body */
--text-lg: 1.125rem;   /* 18px - emphasis */
--text-xl: 1.5rem;     /* 24px - subheaders */
--text-2xl: 2rem;      /* 32px - headers */
--text-3xl: 2.5rem;    /* 40px - hero */
```

### Line Heights
```css
--leading-tight: 1.25;   /* Headers */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.75; /* Long-form reading */
```

---

## 🔲 Layout System

### Spacing Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Container Widths
```css
--container-sm: 640px;   /* Focused reading */
--container-md: 768px;   /* Forms, cards */
--container-lg: 1024px;  /* Dashboards */
--container-xl: 1280px;  /* Full layouts */
```

### Border Radius
```css
--radius-sm: 0.25rem;    /* 4px - subtle */
--radius-md: 0.5rem;     /* 8px - default */
--radius-lg: 0.75rem;    /* 12px - cards */
--radius-xl: 1rem;       /* 16px - modals */
--radius-full: 9999px;   /* Pills, avatars */
```

---

## 💫 Motion & Animation

### Timing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-sacred: cubic-bezier(0.4, 0.1, 0.2, 1);  /* Custom - gentle organic */
```

### Durations
```css
--duration-instant: 100ms;   /* Micro-interactions */
--duration-fast: 200ms;      /* Hovers, toggles */
--duration-normal: 300ms;    /* Transitions */
--duration-slow: 500ms;      /* Complex animations */
--duration-sacred: 1200ms;   /* Ritual moments */
```

### Standard Animations
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Pulse (for sacred moments) */
@keyframes sacredPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Thinking indicator */
@keyframes thinking {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}
```

---

## 🧩 Component Patterns

### Button Hierarchy
```css
.btn-primary {
  background: var(--soullab-blue);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-secondary {
  background: transparent;
  color: var(--soullab-blue);
  border: 1px solid var(--color-border);
}

.btn-ghost {
  background: transparent;
  color: var(--soullab-gray);
}
```

### Card Styles
```css
.card-minimal {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.card-elevated {
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-radius: var(--radius-lg);
}

.card-sacred {
  background: var(--gradient-warm);
  border: 1px solid rgba(206,162,44,0.1);
  border-radius: var(--radius-xl);
}
```

### Input Fields
```css
.input-default {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  transition: border var(--duration-fast);
}

.input-default:focus {
  border-color: var(--soullab-blue);
  outline: none;
}
```

---

## 🌑 Dark Mode

### Dark Palette Adjustments
```css
[data-theme="dark"] {
  --soullab-red: #c45832;      /* Warmer in dark */
  --soullab-yellow: #d4b550;   /* Brighter gold */
  --soullab-green: #8fa34c;    /* Lighter sage */
  --soullab-blue: #3a87a7;     /* Lifted ocean */
  --soullab-gray: #a0a0a0;     /* Lighter neutral */
  --soullab-brown: #665347;    /* Warmer earth */
  
  --color-background: #0f0f0f;
  --color-surface: #1a1a1a;
  --color-border: rgba(255,255,255,0.1);
}
```

---

## 🎭 Voice & Tone

### Writing Principles
1. **Clear, not clever** - Avoid wordplay or puns
2. **Warm, not casual** - Professional intimacy
3. **Guide, don't instruct** - Invitational language
4. **Present, not mystical** - Grounded in the now

### Example Copy
```
❌ "Unlock your cosmic potential"
✅ "Begin when you're ready"

❌ "Channel divine wisdom"  
✅ "Listen to your intuition"

❌ "Transform your reality"
✅ "Explore new perspectives"
```

---

## 🎯 Beta Focus Components

### 1. Onboarding Flow
- **Style**: Minimal with single warm accent
- **Motion**: Gentle fade between steps (500ms)
- **Copy**: "Welcome. Let's begin." → "What brings you here today?"

### 2. Sacred Mirror Chat
- **Messages**: Clean bubbles, no shadows
- **Input**: Hybrid (text + voice), minimal border
- **Thinking**: Three dots, sacred pulse animation

### 3. Reflection Panel
- **Trigger**: Slide up after 5 messages
- **Fields**: Single-line expanding textareas
- **Submit**: Blue primary with breath animation

### 4. Dashboard Widgets
- **Charts**: Muted colors, no gridlines
- **Headers**: Blair serif, left-aligned
- **Data**: Lato regular, high contrast

---

## 🤖 AI Design Prompts

### For Uizard
```
Create a meditation app interface with:
- Earthy color palette: terracotta (#a94724), sage (#6d7934), deep ocean (#236586)
- Minimal geometric layouts with lots of whitespace
- Blair serif headers, Lato body text
- No decorative elements, shadows, or gradients
- Clean cards with 1px borders
- Mobile-first responsive design
```

### For Figma
```
Design system requirements:
- Colors: #a94724 (red), #cea22c (yellow), #6d7934 (green), #236586 (blue)
- Typography: Serif headers (Blair/Playfair), Sans body (Lato/Inter)
- Spacing: 8px base unit (8, 16, 24, 32, 48)
- Borders: 1px solid rgba(119,119,119,0.2)
- Border radius: 8px default, 16px for modals
- Animations: 200-300ms ease-out for interactions
```

### For MidJourney/DALL-E
```
Minimal interface design, Dieter Rams inspired, warm earthy colors,
terracotta and sage green accents, lots of white space, 
clean geometry, no shadows, flat design, professional meditation app,
sacred but not religious, modern wellness platform
```

---

## 📦 Export Package

### Figma Tokens (JSON)
```json
{
  "colors": {
    "soullab": {
      "red": { "value": "#a94724" },
      "yellow": { "value": "#cea22c" },
      "green": { "value": "#6d7934" },
      "blue": { "value": "#236586" },
      "black": { "value": "#000000" },
      "gray": { "value": "#777777" },
      "brown": { "value": "#33251d" }
    }
  },
  "typography": {
    "fontFamilies": {
      "serif": { "value": "Blair" },
      "sans": { "value": "Lato" }
    },
    "fontSizes": {
      "xs": { "value": "12px" },
      "sm": { "value": "14px" },
      "base": { "value": "16px" },
      "lg": { "value": "18px" },
      "xl": { "value": "24px" },
      "2xl": { "value": "32px" }
    }
  },
  "spacing": {
    "1": { "value": "4px" },
    "2": { "value": "8px" },
    "3": { "value": "12px" },
    "4": { "value": "16px" },
    "6": { "value": "24px" },
    "8": { "value": "32px" }
  }
}
```

---

## ✅ Checklist for Designer

- [ ] Import color tokens into Figma styles
- [ ] Set up typography styles with Blair + Lato
- [ ] Create spacing system (8px base grid)
- [ ] Build component library (buttons, cards, inputs)
- [ ] Design light + dark mode variants
- [ ] Create sacred moment animations (1200ms pulse)
- [ ] Test on mobile breakpoints (375px, 768px)
- [ ] Export assets at @2x for retina
- [ ] Document interaction states (hover, active, focus)
- [ ] Align with development on CSS custom properties

---

*This document is the single source of truth for Soullab's visual language. All design decisions should reference these foundations.*

**Last Updated**: September 2025
**Version**: 1.0
**Status**: Beta Launch Ready