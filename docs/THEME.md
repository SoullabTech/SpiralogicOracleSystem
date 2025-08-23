# Spiralogic Design System — Dark + Gold

## Token Export & Integration

### Figma Integration
Export tokens for use in Figma Tokens plugin:

```bash
npm run tokens:export
```

This generates `design-tokens.json` with all color, shadow, and spacing tokens in Figma Tokens format.

### Visual Regression Testing
Automated visual testing with Chromatic:

```bash
npm run chromatic
```

Runs on every PR to catch unintended design changes.

### Interactive Preview
View all tokens live with theme switching:
- **Token Playground**: `/dev/theme`
- **Architecture Docs**: `/dev/architecture`

## Brand vibe
- Night-mode first: deep graphite surfaces with soft elevation
- Understated UI chrome; highlight with warm **gold** accents
- Typography: modern humanist sans (Inter), medium tracking, clear hierarchy
- Iconography: rounded corners, 1.5px strokes, low-noise outlines

## Core tokens (CSS variables)
| Token group | Example |
| --- | --- |
| Surface | `--bg-900:#0E0F12`, `--bg-800:#14161A` |
| Text | `--ink-100:#F2F4F7`, `--ink-300:#BAC1CC` |
| Edge | `--edge-700:#1E2229` (borders/dividers) |
| Accent | `--gold-400:#D6B26E`, `--gold-500:#C9A15A` |
| State | `--state-green:#16A34A`, `--state-red:#EF4444`, `--state-amber:#F59E0B` |

## Elevation
- **Card / popover**: `shadow-soft`  
  > 0 1px 0 rgba(255,255,255,.04), 0 8px 24px rgba(0,0,0,.45)
- **Modal / player**: `shadow-lift`  
  > 0 1px 0 rgba(255,255,255,.06), 0 16px 40px rgba(0,0,0,.55)

## Radii
- sm 8px / md 14px / lg 20px / xl 28px (earbud-case softness)

## Motion
- Ease: `cubic-bezier(.2,.8,.2,1)`  
- Durations: 150–250ms (UI), 300ms (panel)

## Focus ring (accessibility)
- Outline 2px gold with 4px edge halo: visible on dark backgrounds.

## Component cues
- **Primary action**: outlined gold button, text+border gold → hover to `gold-500`
- **Secondary**: neutral edge outline; hover to `edge-700` fill
- **Active tab**: gold text + 2px gold underline pill
- **Mini player**: card surface, edge border, gold action control
- **Bottom nav**: muted icons/labels; active = gold

## Do / Don't
- ✅ Use tokens (never raw hex)  
- ✅ Keep contrast ≥ 4.5:1 for body text  
- ❌ No harsh pure black (#000) fills; use `--bg-900`  
- ❌ Don't mix gold with saturated blues; pair with gray/ink

## Asset specs
- Icons: 1.5px stroke (Lucide), 20–24px on nav  
- Typography: Inter; H1 28–32/36, H2 22/28, Body 14–16/22