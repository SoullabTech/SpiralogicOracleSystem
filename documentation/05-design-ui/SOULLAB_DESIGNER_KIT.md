# 🎨 Soullab Designer Kit (Beta Launch Edition)

*Drop these tokens directly into Figma and Uizard for instant brand consistency*

## 🌿 Visual Philosophy: Atmospheric + Brand Identity + Natural

Based on the evolution: **Soul** (atmospheric) → **Lab** (structured) → **Soullab** (perfect balance)

### The Sweet Spot We've Achieved:
- **Atmospheric**: Gradients and muted palette create presence without mysticism
- **Brand Identity**: Terracotta, sage, ocean, amber anchor everything to Soullab
- **Natural**: Organic, grounded feeling builds trust while maintaining emotional resonance

### Design DNA:
- Warmth through earthy tones, not neon brightness
- Depth through subtle gradients, not harsh shadows  
- Professional through clean structure, not cold sterility
- Sacred through intentional spacing, not mystical symbols

---

## 1. 🌈 Color Swatches

### Core Palette
Import into Figma → Styles → Fill → Solid:

**Terracotta (Alerts, Failures)**
```
50:  #faf4f2  
100: #f5e6e0  
200: #e9c7b7  
300: #dba48c  
400: #c97a5c  
500: #b85f42  ← Core Terracotta
600: #9c4a33  
700: #7c3a29  
800: #5c2a1f  
900: #3d1b15  
```

**Sage (Success, Positive)**
```
50:  #f4f7f4  
100: #e4ece4  
200: #c8d9c9  
300: #a7c1a8  
400: #85a985  
500: #6a8f6b  ← Core Sage
600: #527053  
700: #3b523c  
800: #273627  
900: #142015  
```

**Ocean (Primary, Trends)**
```
50:  #f2f7f9  
100: #dceff4  
200: #b5dee9  
300: #82c8db  
400: #4baec9  
500: #1c94b3  ← Core Ocean
600: #157891  
700: #105c6f  
800: #0a414d  
900: #04272d  
```

**Amber (Highlights, Active)**
```
50:  #fff9f0  
100: #fef1d9  
200: #fde0a9  
300: #fbc874  
400: #f8a93e  
500: #f28c15  ← Core Amber
600: #cf6f0e  
700: #a7520a  
800: #7e3806  
900: #552403  
```

**Stone (System, Neutral)**
```
50:  #fafafa  
100: #f4f4f5  
200: #e4e4e7  
300: #d4d4d8  
400: #a1a1aa  
500: #918c7e  ← Core Stone
600: #71717a  
700: #52525b  
800: #3f3f46  
900: #27272a  
```

### Support Colors
```
White:    #ffffff
Charcoal: #1a1a1a
Gray-100: #f5f5f5
Gray-200: #e5e5e5
Gray-800: #333333
```

### ❌ Forbidden Colors
**Never use**: Purple, Indigo, Violet, Neon Pink, Electric Blue
**Reason**: Maintains "everyday sacred" vs. "mystical woo"

---

## 2. 🌅 Gradient Library

### Pre-made Linear Gradients
Create in Figma → Styles → Fill → Linear:

**Warmth** *(Buttons, Active States)*
- Start: Terracotta 500 (#b85f42)
- End: Amber 500 (#f28c15)
- Angle: 135°

**Nature** *(Success States, Positive Flow)*  
- Start: Sage 500 (#6a8f6b)
- End: Ocean 500 (#1c94b3)
- Angle: 135°

**Earth** *(Backgrounds, Containers)*
- Start: Terracotta 500 (#b85f42) 
- End: Sage 500 (#6a8f6b)
- Angle: 180°

**Sunset** *(Headers, Special Elements)*
- Start: Amber 500 (#f28c15)
- End: Ocean 500 (#1c94b3)
- Angle: 45°

**Light** *(Page Backgrounds)*
- Start: White (#ffffff)
- End: Gray-50 (#fafafa)
- Angle: 180°

---

## 3. ✏️ Typography System

### Font Stack
- **Headers**: Blair Serif *(or Georgia fallback)*
- **Body**: Lato Sans *(or -apple-system fallback)*
- **Code**: JetBrains Mono *(or Courier fallback)*

### Text Styles
Create in Figma → Styles → Text:

**Display** *(Hero sections)*
- Font: Blair Serif
- Size: 48px
- Line Height: 56px
- Weight: 700

**H1** *(Page headers)*
- Font: Blair Serif  
- Size: 32px
- Line Height: 40px
- Weight: 600

**H2** *(Section headers)*
- Font: Blair Serif
- Size: 24px  
- Line Height: 32px
- Weight: 500

**H3** *(Subsections)*
- Font: Blair Serif
- Size: 18px
- Line Height: 24px  
- Weight: 500

**Body Large** *(Main content)*
- Font: Lato Sans
- Size: 16px
- Line Height: 24px
- Weight: 400

**Body** *(Standard text)*
- Font: Lato Sans  
- Size: 14px
- Line Height: 20px
- Weight: 400

**Small** *(Captions, metadata)*
- Font: Lato Sans
- Size: 12px
- Line Height: 16px
- Weight: 400

**Code** *(Technical text)*
- Font: JetBrains Mono
- Size: 14px
- Line Height: 20px
- Weight: 400

---

## 4. 🏗️ Component Library

### Buttons

**Primary Button**
- Fill: Warmth gradient (Terracotta → Amber)
- Border Radius: 9999px (fully rounded)
- Padding: 12px 24px
- Text: Body, Weight 500, Color White
- Hover: Scale 1.05x, Add subtle outer glow

**Secondary Button**  
- Fill: None
- Border: 1px solid Terracotta 500
- Border Radius: 8px
- Padding: 12px 24px  
- Text: Body, Weight 500, Color Terracotta 500
- Hover: Background Terracotta 50

**Ghost Button**
- Fill: None
- Border: None
- Padding: 8px 16px
- Text: Body, Weight 500, Color Ocean 500  
- Hover: Background Gray 50

### Input Fields

**Text Input**
- Fill: White
- Border: 1px solid Gray 200
- Border Radius: 8px
- Padding: 12px 16px
- Text: Body, Color Charcoal
- Focus: Border Ocean 500, Add subtle glow

**Textarea** *(Chat-style)*
- Fill: White
- Border: 1px solid Gray 200
- Border Radius: 16px
- Padding: 16px 20px
- Min Height: 48px
- Auto-resize: Yes
- Text: Body, Color Charcoal

**Voice Button** *(Circular mic)*
- Fill: Nature gradient (Sage → Ocean)
- Size: 48px × 48px  
- Border Radius: 9999px
- Icon: Microphone, 20px, Color White
- Active: Pulsing animation rings
- Hover: Scale 1.1x

### Chat Bubbles

**User Message**
- Fill: Ocean 500
- Border Radius: 16px 16px 4px 16px  
- Padding: 12px 16px
- Text: Body, Color White
- Max Width: 70%
- Align: Right

**Maia Message**
- Fill: Earth gradient (Terracotta → Sage)
- Border Radius: 16px 16px 16px 4px
- Padding: 12px 16px  
- Text: Body, Color White
- Max Width: 70%
- Align: Left
- Glow: Subtle outer shadow

### Cards

**Standard Card**
- Fill: White
- Border: 1px solid Gray 100
- Border Radius: 16px
- Padding: 24px
- Shadow: 0 4px 16px rgba(0,0,0,0.08)

**Metric Card** *(Dashboard)*
- Fill: White
- Border: 1px solid Gray 100  
- Border Radius: 12px
- Padding: 20px
- Icon: Top-left, colored by metric type
- Value: H2, Color Charcoal
- Label: Small, Color Gray 500

### Charts & Data Viz

**Line Charts**
- Primary Line: Ocean 500, 2px width
- Secondary Line: Sage 500, 2px width
- Grid: Gray 200, 1px, dashed
- Labels: Small, Color Gray 500

**Bar Charts**  
- Primary Bars: Terracotta 500
- Secondary Bars: Amber 500
- Spacing: 8px between bars

**Pie Charts**
- Segment Colors: Terracotta, Sage, Ocean, Amber in sequence
- Labels: Small, Color Charcoal
- Hover: Segment grows 1.05x

---

## 5. ⚡ Motion & Animation Rules

### Timing Functions
```css
/* Breathing rhythm */
ease-in-out, 1600ms

/* Quick interactions */ 
ease-out, 150ms

/* Gentle transitions */
ease-in-out, 300ms

/* Hover states */
ease-out, 200ms
```

### Animation Patterns

**Breathing** *(Sacred elements)*
- Scale: 1.0 → 1.02 → 1.0
- Duration: 1.6s
- Easing: ease-in-out
- Loop: Infinite

**Stagger Reveal** *(Lists, grids)*
- Delay: 150ms between items
- Opacity: 0 → 1
- Y-offset: 20px → 0px
- Duration: 400ms

**Hover Growth** *(Interactive elements)*
- Scale: 1.0 → 1.05
- Duration: 150ms  
- Easing: ease-out

**Voice Recording** *(Mic button active)*
- Concentric rings expanding outward
- Ring opacity: 0.3 → 0
- Ring scale: 1.0 → 2.0
- Duration: 1s, infinite

### Accessibility
- **Reduced Motion**: Respect `prefers-reduced-motion: reduce`
- **Focus States**: 2px solid Ocean 500 outline, 2px offset
- **High Contrast**: Test all combinations meet WCAG AA

---

## 6. 🤖 AI Co-Design Prompts

### Uizard Prompt
```
Design a modern soulful chat interface for Soullab's sacred technology platform. 

Features needed:
- Hybrid text/voice input (chat textarea + circular mic button)
- Message bubbles (user: ocean blue, AI: terracotta-to-sage gradient)
- Breathing animations on active voice states
- Theme toggle (light/dark/system)

Style requirements:
- Earthy color palette: terracotta (#b85f42), sage (#6a8f6b), ocean (#1c94b3), amber (#f28c15)
- Typography: Blair Serif headers, Lato Sans body
- Minimal Apple-like clarity with subtle sacred elements
- Avoid neon, purple, mystical clichés
- Feel alive but grounded, not "woo"

Layout: Mobile-first, clean margins, generous whitespace
```

### Figma Make Prompt
```
Generate a 4-screen onboarding flow for Soullab's Mirror interface:

Screen 1: Welcome
- Breathing logo animation (terracotta-to-sage gradient)
- "Welcome to your Sacred Mirror" headline (Blair Serif)
- Simple continue button

Screen 2: Maia Introduction  
- Gentle chat bubble with Maia's first message
- Subtle aurora glow around bubble
- Voice/text input options

Screen 3: Elemental Navigation
- Four doors/cards: Mirror, Spiral, Journal, Attune
- Each with subtle icon and earthy color
- Grid layout, hover states

Screen 4: Voice Attunement
- Tone slider (earthy gradient track)
- Voice preference options
- "Begin Sacred Conversation" primary button

Design system: Use Soullab earthy palette, minimal shadows, organic shapes, breathing rhythms. Avoid purple, neon, overly mystical elements.
```

### Midjourney Style Prompt
```
Soullab sacred technology UI, earthy color palette terracotta sage ocean amber, minimal Apple clarity, breathing animations, everyday sacred not mystical, clean typography Blair serif Lato sans, organic shapes, --ar 16:9 --v 6
```

---

## 7. 📦 Export Packages

### For Figma Import
1. Create new Figma file
2. Go to Styles panel
3. Import colors as Fill styles (copy hex codes above)
4. Import text styles with font/size specs
5. Create component library with buttons/cards/inputs
6. Set up Auto Layout grids (8px base unit)

### For Uizard Import  
1. Create new project
2. Set brand colors in theme panel
3. Upload any custom fonts (Blair, Lato)
4. Use AI prompts above to generate initial screens
5. Refine with component specifications

### For Development Handoff
```json
{
  "colors": {
    "terracotta": { "50": "#faf4f2", "500": "#b85f42", "900": "#3d1b15" },
    "sage": { "50": "#f4f7f4", "500": "#6a8f6b", "900": "#142015" },
    "ocean": { "50": "#f2f7f9", "500": "#1c94b3", "900": "#04272d" },
    "amber": { "50": "#fff9f0", "500": "#f28c15", "900": "#552403" }
  },
  "typography": {
    "display": { "family": "Blair Serif", "size": "48px", "lineHeight": "56px" },
    "body": { "family": "Lato Sans", "size": "14px", "lineHeight": "20px" }
  },
  "motion": {
    "breathing": "1.6s ease-in-out infinite",
    "hover": "150ms ease-out",
    "stagger": "150ms"
  }
}
```

---

## 8. 🎯 Design Language Rules

### ✅ DO's (Atmospheric + Brand + Natural)
- Use earthy gradients for depth and warmth
- Apply breathing rhythms to create alive presence  
- Layer backgrounds → context → interactive elements
- Maintain generous whitespace for sacred feeling
- Use terracotta/sage/ocean/amber consistently
- Create organic, flowing shapes over geometric rigidity
- Emphasize functionality while maintaining soul

### ❌ DON'Ts (Avoid Mystical "Woo")
- Never use purple, indigo, violet, or neon colors
- No mystical symbols (chakras, crystals, mandalas) 
- Avoid harsh shadows or stark contrasts
- Don't use synthetic/digital feeling elements
- No overwhelming visual effects or distracting motion
- Never sacrifice usability for aesthetic effect
- Avoid cold, sterile corporate feeling

### 📐 Layering Hierarchy 
1. **Background**: Light gradients, subtle textures
2. **Context**: Aura glows, atmospheric elements  
3. **Content**: Clean cards, readable text
4. **Interactive**: Buttons, inputs with hover states
5. **Focus**: Clear selection indicators

### 🌊 Motion Guidelines
- **Breathing**: 1.6s cycles for sacred elements
- **Stagger**: 150ms reveals for sequential content
- **Aura Pulses**: Gentle 2-3s cycles on voice/active states  
- **Hover Growth**: Subtle 1.05x scale, never jarring
- **Transitions**: Smooth 300ms ease-in-out

### 📊 Chart & Dashboard Styles
- **Data**: Clean lines, no unnecessary decoration
- **Backgrounds**: Subtle gradients for warmth, never distracting
- **Interactions**: Gentle hover states, clear selection
- **Colors**: Use Soullab palette in sequence (Terracotta → Sage → Ocean → Amber)

## 9. 🎯 Quality Checklist

Before finalizing any design, verify:

✅ **Brand Consistency**
- [ ] Uses only Soullab colors (no purple/indigo/violet)
- [ ] Typography follows Blair + Lato hierarchy  
- [ ] Maintains "everyday sacred" tone
- [ ] Follows atmospheric + brand + natural philosophy

✅ **Accessibility**  
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus states clearly visible
- [ ] Works with screen readers
- [ ] Respects reduced-motion preferences

✅ **Performance**
- [ ] Animations don't impact usability
- [ ] Images optimized for web
- [ ] Motion enhances rather than distracts
- [ ] Gradients don't slow rendering

✅ **Sacred Technology Values**
- [ ] Feels soulful but not mystical
- [ ] Emphasizes functionality over decoration
- [ ] Creates sense of alive presence without overwhelm
- [ ] Maintains professional trust while being emotionally resonant

---

*Use this kit to maintain perfect brand consistency across all Soullab beta designs. Every element should feel intentionally sacred yet everyday usable.*

**Last Updated**: January 2025