# 🎨 Soul Lab Visual Brand Kit
*Tangible assets for implementing the unified design language*

---

## 🌈 Color Swatches

### Primary Elemental Palette

```css
/* Copy these directly into your CSS/Tailwind config */

/* FIRE ELEMENT 🔥 */
--fire-base: #C85450;     /* Sacred Sienna */
--fire-glow: #E06B67;     /* Ember Glow */
--fire-shadow: #A84440;   /* Deep Fire */

/* WATER ELEMENT 💧 */
--water-base: #6B9BD1;    /* Sacred Blue */
--water-glow: #83B3E9;    /* Flow Light */
--water-shadow: #5383B9;  /* Deep Ocean */

/* EARTH ELEMENT 🌍 */
--earth-base: #7A9A65;    /* Sacred Sage */
--earth-glow: #92B27D;    /* Living Green */
--earth-shadow: #628253;  /* Deep Root */

/* AIR ELEMENT 💨 */
--air-base: #D4B896;      /* Sacred Tan */
--air-glow: #F0D4B2;      /* Light Breath */
--air-shadow: #B89A7A;    /* Deep Air */

/* SACRED GOLD ✨ (Use Sparingly) */
--gold-divine: #FFD700;    /* Breakthrough moments only */
--gold-amber: #F6AD55;     /* Subtle highlights */
--gold-ethereal: #FEB95A;  /* Gentle hints */
--gold-whisper: #FEF5E7;   /* Barely visible */

/* FOUNDATION NEUTRALS */
--sacred-black: #33251d;   /* Deep Earth Brown */
--sacred-brown: #B69A78;   /* Warm Neutral */
--sacred-gray: #777777;    /* Mystic Gray */
--sacred-silver: #E2E8F0;  /* Light Silver */
--sacred-white: #FFFFFF;   /* Pure Light */
```

### Visual Color Card Component
```jsx
// ColorSwatch.tsx
const ColorSwatch = ({ element, base, glow, shadow }) => (
  <div className="rounded-sacred border border-neutral-silver p-4">
    <div className="flex gap-2 mb-3">
      <div className={`w-16 h-16 rounded-md bg-[${base}]`} />
      <div className={`w-16 h-16 rounded-md bg-[${glow}]`} />
      <div className={`w-16 h-16 rounded-md bg-[${shadow}]`} />
    </div>
    <p className="font-sacred-primary text-sm">{element}</p>
    <code className="text-xs text-sacred-gray">{base}</code>
  </div>
);
```

---

## 📝 Typography Specimens

### Type Scale & Hierarchy

```css
/* BLAIR ITC - Sacred Headers */
.type-sacred-display {
  font-family: 'Blair ITC', 'Crimson Pro', Georgia, serif;
  font-size: 48px;
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-weight: 500;
  color: #33251d;
}

.type-sacred-title {
  font-family: 'Blair ITC', 'Crimson Pro', Georgia, serif;
  font-size: 32px;
  line-height: 1.3;
  letter-spacing: -0.01em;
  font-weight: 400;
  color: #33251d;
}

.type-sacred-heading {
  font-family: 'Blair ITC', 'Crimson Pro', Georgia, serif;
  font-size: 24px;
  line-height: 1.4;
  font-weight: 300;
  color: #4A5568;
}

/* LATO - Interface Text */
.type-body-primary {
  font-family: 'Lato', 'Inter', -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  font-weight: 400;
  color: #4A5568;
}

.type-body-secondary {
  font-family: 'Lato', 'Inter', -apple-system, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 400;
  color: #777777;
}

.type-micro-poetry {
  font-family: 'Lato', 'Inter', -apple-system, sans-serif;
  font-size: 13px;
  line-height: 1.4;
  font-weight: 300;
  font-style: italic;
  color: #777777;
  opacity: 0.9;
}

.type-button-label {
  font-family: 'Lato', 'Inter', -apple-system, sans-serif;
  font-size: 14px;
  line-height: 1;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: none; /* No uppercase */
}
```

### Typography Component Sample
```jsx
// TypeSpecimen.tsx
<div className="space-y-6">
  <h1 className="type-sacred-display">Your flower remembers</h1>
  <h2 className="type-sacred-title">Sacred Technology Interface</h2>
  <h3 className="type-sacred-heading">Elemental Balance</h3>
  <p className="type-body-primary">
    Every element has layers. Touch what calls you.
  </p>
  <p className="type-micro-poetry">
    "How bright does your inner fire feel today?"
  </p>
  <button className="type-button-label">
    Enter Sacred Space
  </button>
</div>
```

---

## 🌸 Holoflower States (Visual Reference)

### SVG Template Structure
```svg
<!-- Holoflower.svg -->
<svg viewBox="0 0 400 400" className="holoflower">
  <!-- Outer Coherence Rings -->
  <circle cx="200" cy="200" r="180" 
          className="coherence-ring-outer"
          stroke="#FFD700" 
          stroke-opacity="0.1" 
          fill="none" />
  
  <!-- 12 Petals (4 Elements × 3 Stages) -->
  <g className="petals">
    <!-- Fire Petals (12, 1, 2 o'clock) -->
    <path d="..." className="petal-fire-1" fill="#C85450" />
    <path d="..." className="petal-fire-2" fill="#B8524E" />
    <path d="..." className="petal-fire-3" fill="#A84E4A" />
    
    <!-- Water Petals (3, 4, 5 o'clock) -->
    <path d="..." className="petal-water-1" fill="#6B9BD1" />
    <path d="..." className="petal-water-2" fill="#5A89C0" />
    <path d="..." className="petal-water-3" fill="#4A77AE" />
    
    <!-- Earth Petals (6, 7, 8 o'clock) -->
    <path d="..." className="petal-earth-1" fill="#7A9A65" />
    <path d="..." className="petal-earth-2" fill="#6B8B56" />
    <path d="..." className="petal-earth-3" fill="#5C7C47" />
    
    <!-- Air Petals (9, 10, 11 o'clock) -->
    <path d="..." className="petal-air-1" fill="#D4B896" />
    <path d="..." className="petal-air-2" fill="#C5A987" />
    <path d="..." className="petal-air-3" fill="#B69A78" />
  </g>
  
  <!-- Sacred Center (Aether) -->
  <circle cx="200" cy="200" r="30" 
          className="aether-center"
          fill="url(#goldGradient)" />
</svg>
```

### Motion States CSS
```css
/* Idle - Gentle Breathing */
.holoflower-idle {
  animation: sacred-breath 4s ease-in-out infinite;
}

/* Listening - Petals Expand */
.holoflower-listening .petals {
  transform: scale(1.1);
  transition: transform 1.618s ease-out;
}

/* Processing - Spiral Rotation */
.holoflower-processing {
  animation: golden-spin 3s linear infinite;
}

/* Responding - Radiating Light */
.holoflower-responding .coherence-ring-outer {
  animation: ripple-out 2s ease-out infinite;
  stroke-opacity: 0.3;
}

/* Breakthrough - Golden Bloom */
.holoflower-breakthrough .aether-center {
  animation: gold-emergence 1.618s ease-out;
  filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.5));
}
```

---

## 🎛️ UI Component Library

### Sacred Button
```jsx
// SacredButton.tsx
const SacredButton = ({ element = 'earth', children, onClick }) => {
  const elementStyles = {
    fire: 'bg-gradient-to-r from-fire-base to-fire-glow hover:from-fire-glow hover:to-fire-base',
    water: 'bg-gradient-to-r from-water-base to-water-glow hover:from-water-glow hover:to-water-base',
    earth: 'bg-gradient-to-r from-earth-base to-earth-glow hover:from-earth-glow hover:to-earth-base',
    air: 'bg-gradient-to-r from-air-base to-air-glow hover:from-air-glow hover:to-air-base',
    sacred: 'bg-gradient-to-r from-gold-amber to-gold-divine hover:from-gold-divine hover:to-gold-amber'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${elementStyles[element]}
        px-sacred-md py-sacred-sm
        rounded-sacred
        text-white font-medium
        shadow-sacred-subtle hover:shadow-sacred-glow
        transition-all duration-[382ms]
        transform hover:-translate-y-0.5
      `}
    >
      {children}
    </button>
  );
};
```

### Sacred Card
```jsx
// SacredCard.tsx
const SacredCard = ({ element, glowing = false, children }) => {
  return (
    <div
      className={`
        bg-white/95 backdrop-blur-sm
        border rounded-sacred
        p-sacred-md
        transition-all duration-[382ms]
        ${glowing ? 'shadow-sacred-gold border-gold-divine/30' : 'shadow-sacred-subtle border-neutral-silver'}
        ${element ? `border-l-4 border-l-${element}-base` : ''}
        hover:shadow-sacred-deep hover:-translate-y-1
      `}
    >
      {children}
    </div>
  );
};
```

### Oracle Message Bubble
```jsx
// OracleBubble.tsx
const OracleBubble = ({ message, element }) => {
  const elementBg = {
    fire: 'bg-fire-base/5 border-fire-base/20',
    water: 'bg-water-base/5 border-water-base/20',
    earth: 'bg-earth-base/5 border-earth-base/20',
    air: 'bg-air-base/5 border-air-base/20',
    sacred: 'bg-gold-whisper border-gold-divine/20'
  };

  return (
    <div className={`
      ${elementBg[element]}
      border rounded-sacred-lg
      p-sacred-md max-w-[70%]
      animate-emergence
    `}>
      <p className="type-body-primary">{message}</p>
      <span className="type-micro-poetry mt-2 block">
        {element} wisdom speaking
      </span>
    </div>
  );
};
```

### Progress Indicator
```jsx
// SacredProgress.tsx
const SacredProgress = ({ value, max = 100 }) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className="relative h-2 bg-neutral-silver/30 rounded-full overflow-hidden">
      <div 
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-earth-shadow via-earth-base to-earth-glow rounded-full transition-all duration-[618ms]"
        style={{ width: `${percentage}%` }}
      />
      {percentage > 80 && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-divine/20 to-transparent animate-shimmer" />
      )}
    </div>
  );
};
```

---

## 🎭 Interaction Patterns

### Hover States
```css
/* Element-specific hover effects */
.hover-fire:hover {
  box-shadow: 0 0 20px rgba(200, 84, 80, 0.3);
  border-color: #C85450;
}

.hover-water:hover {
  box-shadow: 0 0 20px rgba(107, 155, 209, 0.3);
  border-color: #6B9BD1;
}

.hover-earth:hover {
  box-shadow: 0 0 20px rgba(122, 154, 101, 0.3);
  border-color: #7A9A65;
}

.hover-air:hover {
  box-shadow: 0 0 20px rgba(212, 184, 150, 0.3);
  border-color: #D4B896;
}

.hover-sacred:hover {
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
  animation: gold-pulse 1s ease-in-out;
}
```

### Focus States
```css
/* Accessible focus indicators */
.focus-sacred:focus {
  outline: none;
  box-shadow: 
    0 0 0 2px white,
    0 0 0 4px var(--element-base),
    0 0 20px rgba(var(--element-rgb), 0.2);
}

.focus-sacred:focus-visible {
  outline: 2px solid var(--element-base);
  outline-offset: 2px;
}
```

---

## 📐 Layout Templates

### Sacred Container
```jsx
// SacredContainer.tsx
const SacredContainer = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-sacred-brown/5 via-earth-base/5 to-water-base/5">
    <div className="max-w-7xl mx-auto px-sacred-md py-sacred-lg">
      {children}
    </div>
  </div>
);
```

### Elemental Grid
```jsx
// ElementalGrid.tsx
const ElementalGrid = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-sacred-md">
    {items.map((item, i) => (
      <SacredCard 
        key={i} 
        element={['fire', 'water', 'earth', 'air'][i % 4]}
      >
        {item}
      </SacredCard>
    ))}
  </div>
);
```

---

## 🎨 Figma/Sketch Assets

### Export Settings
```yaml
Colors:
  Format: HEX
  Include: RGB values for animations
  
Typography:
  Export: All text styles
  Include: Line height, letter spacing
  
Components:
  Format: SVG for icons/symbols
  PNG: @1x, @2x, @3x for raster
  
Holoflower:
  Format: SVG with separate layers
  Petals: Individual paths for animation
  Center: Separate group for Aether
  
Spacing:
  Document: All sacred measurements
  Grid: 8px base (close to φ relationships)
```

### Design Token Structure
```json
{
  "color": {
    "fire": {
      "base": "#C85450",
      "glow": "#E06B67",
      "shadow": "#A84440"
    }
  },
  "spacing": {
    "sacred-xs": "0.618rem",
    "sacred-sm": "1rem",
    "sacred-md": "1.618rem"
  },
  "animation": {
    "duration": {
      "instant": "0ms",
      "fast": "236ms",
      "normal": "382ms",
      "slow": "618ms",
      "sacred": "1618ms"
    }
  }
}
```

---

## 🚀 Quick Start Code

### CSS Variables Setup
```css
:root {
  /* Elemental Colors */
  --fire-base: #C85450;
  --water-base: #6B9BD1;
  --earth-base: #7A9A65;
  --air-base: #D4B896;
  
  /* Sacred Gold */
  --gold-divine: #FFD700;
  
  /* Sacred Spacing */
  --space-unit: 1rem;
  --space-golden: 1.618rem;
  
  /* Sacred Timing */
  --duration-sacred: 382ms;
}
```

### React Component Starter
```jsx
import { motion } from 'framer-motion';

const SacredComponent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.618 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.618 }}
      className="sacred-container"
    >
      <div className="holoflower-wrapper">
        {/* Your sacred content */}
      </div>
    </motion.div>
  );
};
```

---

## 📦 Asset Downloads

Create these asset files for your team:

1. **soullab-colors.ase** - Adobe Swatch Exchange file
2. **holoflower-components.svg** - Separated petal components
3. **sacred-icons.svg** - Elemental symbols sprite sheet
4. **typography-specimens.pdf** - Print-ready type samples
5. **ui-components.sketch** - Sketch symbol library
6. **design-tokens.json** - For design system integration

---

## Remember

Every asset should feel:
- **Grounded** in earth tones
- **Alive** with subtle motion
- **Sacred** without being religious
- **Premium** without being exclusive

The Holoflower is not just a logo — it's a living interface element that responds, remembers, and reveals.

---

*This Visual Brand Kit provides concrete, implementable assets for the Soul Lab design system.*