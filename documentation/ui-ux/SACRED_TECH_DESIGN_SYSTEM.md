# Sacred Tech Design System

## Color Palette

### Primary Colors
- **Sacred Cosmic** `#0A0E27` - Deep navy background
- **Sacred Navy** `#1A1F3A` - Card backgrounds
- **Sacred Blue** `#2D3561` - Elevated surfaces
- **Gold Divine** `#FFD700` - Primary accent & typography
- **Gold Amber** `#F6AD55` - Hover states

### Typography
- **Headings**: Crimson Pro (serif) - Gold Divine
- **Body**: Inter (sans-serif) - White/Silver
- **Muted Text**: `#A0AEC0`

## Component Classes

### Cards
```html
<div class="sacred-card">
  <!-- No gradients, clean navy background with gold accents -->
</div>
```

### Buttons
```html
<button class="sacred-button">Primary Action</button>
<button class="sacred-button-secondary">Secondary</button>
<button class="sacred-button-ghost">Ghost</button>
```

### Form Elements
```html
<input class="..." placeholder="Already styled globally" />
```

### Effects
- `.sacred-glow` - Soft gold radial glow
- `.text-glow-gold` - Gold text glow
- `.box-glow-gold` - Gold box shadow
- `.sacred-geometry-overlay` - Subtle sacred pattern

## Migration Commands

```bash
# Run the migration script
./scripts/migrate-to-sacred-tech.sh

# Or manually search and replace
grep -r "purple" ./app ./components --include="*.tsx"
grep -r "gradient" ./app ./components --include="*.tsx"
```

## Key Principles

1. **No Gradients** - Solid cosmic navy backgrounds
2. **Gold Typography** - All headings and accents in divine gold
3. **Clean Geometry** - Rounded corners, subtle shadows
4. **Sacred Patterns** - Subtle geometric overlays
5. **Minimal Contrast** - Navy cards on cosmic background

## Quick Replacements

| Old Class | New Class |
|-----------|-----------|
| `bg-purple-*` | `bg-sacred-navy` |
| `text-purple-*` | `text-gold-divine` |
| `from-purple-* to-*` | `bg-sacred-cosmic` |
| `border-purple-*` | `border-gold-divine/20` |
| `bg-gradient-*` | `bg-sacred-cosmic` |

## Logo Usage
```html
<img src="/sacred-logo.svg" alt="Sacred Tech" class="w-12 h-12" />
```