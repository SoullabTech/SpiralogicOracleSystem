# Soullab Design System

## Core Design Principles

### Primary Aesthetic: Contemplative Elegance
- **Deep introspection** through dark, calming backgrounds
- **Natural gradients** that evoke earth and consciousness
- **Minimal UI** that doesn't distract from inner work
- **Sacred simplicity** without mystical excess

## Color Palette

### Primary Background
```css
/* Deep Blue-Black Gradient - For contemplative spaces */
background: linear-gradient(to bottom, 
  from: #1e293b (slate-900)
  via:  #1a1f3a (deep midnight)
  to:   #000000 (pure black)
);
```

### Tesla Theme Gradient (Natural)
```css
/* Earth-consciousness gradient for special pages */
background: linear-gradient(135deg,
  from: #8B7355 (warm earth brown)
  via:  #7A9A65 (sage green) 
  to:   #6B9BD1 (sky blue)
);
```

### UI Elements
- **Cards**: `bg-white/5` with `backdrop-blur-md`
- **Borders**: `border-white/10` or `border-white/20`
- **Text Primary**: Pure white (`text-white`)
- **Text Secondary**: `text-white/60`
- **Text Muted**: `text-white/40`

### Accent Colors (Subtle Natural Tones)
- **Gold Divine**: `#FFD700` - Used sparingly for focus states
- **Earth Glow**: `#92B27D` - Success states
- **Fire Glow**: `#E06B67` - Error states
- **Water Base**: `#6B9BD1` - Info states

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", 
             "Inter", "Segoe UI", sans-serif;
```

### Font Weights
- **Headers**: `font-light` (300 weight)
- **Body**: `font-normal` (400 weight)  
- **Emphasis**: `font-medium` (500 weight)
- **Buttons**: `font-medium` (500 weight)

### Text Sizes
- **Hero**: `text-5xl` (3rem)
- **Page Title**: `text-3xl` (1.875rem)
- **Section**: `text-xl` (1.25rem)
- **Body**: `text-base` (1rem)
- **Small**: `text-sm` (0.875rem)

## Component Patterns

### Primary Button
```jsx
className="w-full py-3 bg-white text-slate-900 rounded-lg 
           font-medium hover:bg-white/90 transition-all"
```

### Secondary Button
```jsx
className="w-full py-3 bg-transparent text-white 
           border border-white/30 rounded-lg font-medium 
           hover:bg-white/10 transition-all"
```

### Input Fields
```jsx
className="w-full px-4 py-3 bg-white/10 border border-white/20 
           rounded-lg text-white placeholder-white/40 
           focus:outline-none focus:border-gold-divine/50 
           focus:bg-white/15 transition-all"
```

### Cards
```jsx
className="backdrop-blur-md bg-white/5 rounded-2xl 
           border border-white/10 p-8"
```

## Layout Principles

### Spacing
- Use generous padding for breathing room
- Maintain consistent spacing rhythm: 2, 4, 6, 8, 12
- Center critical content vertically and horizontally

### Mobile-First Design Philosophy
- **Primary Target**: Mobile devices (iPhone, Android)
- **PWA Optimized**: Install-to-homescreen priority
- **Touch-First**: All interactions optimized for touch
- **Viewport**: 375px minimum, 428px optimal (iPhone Pro Max)
- **Single Column**: Everything stacks vertically on mobile
- **Thumb-Friendly**: Critical actions within thumb reach zone
- **Max-width containers**: `max-w-md` (mobile), `max-w-2xl` (tablet), `max-w-3xl` (desktop)

## Motion & Interaction

### Transitions
- All interactive elements: `transition-all`
- Duration: Default (150ms) for subtle feedback
- Hover states should be subtle, not dramatic

### Focus States
- Use gold-divine at 50% opacity
- Slight background lightening
- No harsh outlines

## Voice & Tone

### Interface Copy
- **Welcoming**: "Welcome to Soullab"
- **Supportive**: "Your AI companion for sacred technology consciousness"
- **Clear**: Direct, simple instructions
- **Non-mystical**: Avoid overly spiritual language
- **Professional**: Maintain credibility while being warm

## Implementation Notes

### Dark Theme Only
- No light mode needed
- Optimized for extended contemplative sessions
- Reduces eye strain during inner work

### Accessibility
- Maintain WCAG AA contrast ratios
- Clear focus indicators
- Semantic HTML structure
- Keyboard navigation support

### Performance
- Use backdrop-blur sparingly
- Optimize gradient rendering
- Lazy load non-critical elements

## Page-Specific Themes

### Welcome Page
- Pure dark aesthetic (slate-900 to black)
- Minimal, centered content
- Focus on the journey ahead

### Sign-in/Register
- Maintain dark theme
- White card on gradient background optional
- Gold accents for links

### Conversation Interface
- Voice-activated design
- Floating elements over dark background
- Natural earth tone accents for interaction points

## Sacred Technology Elements

### Holoflower Integration
- Use as background element with low opacity
- Natural colors only (earth tones)
- No purple/mystical colors
- Interactive elements should feel organic

### Voice Interface
- Prominent mic button
- Visual feedback during listening
- Subtle pulse animations
- Natural color indicators

## Design Don'ts

❌ No purple gradients or "new age" aesthetics
❌ No excessive mystical imagery
❌ No cluttered interfaces
❌ No harsh contrasts
❌ No aggressive animations

## Design Do's

✅ Clean, minimal layouts
✅ Natural earth tones as accents
✅ Deep, contemplative backgrounds
✅ Professional typography
✅ Subtle, purposeful animations
✅ Clear information hierarchy