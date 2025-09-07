# 🌸 Logo Assets Directory

## Required Files

Please place your Holoflower logo files here:

### Primary Files (Required)
- [ ] `holoflower-logo.svg` - Main vector logo
- [ ] `holoflower-logo-light.png` - For dark backgrounds (1024x1024)
- [ ] `holoflower-logo-dark.png` - For light backgrounds (1024x1024)

### Secondary Files (Optional but Recommended)
- [ ] `holoflower-icon.svg` - Icon-only version
- [ ] `holoflower-watermark.png` - Low opacity (10%) version
- [ ] `holoflower-wordmark.svg` - Text-only version

### Favicon Files
- [ ] `favicon-16.png` - 16x16px
- [ ] `favicon-32.png` - 32x32px
- [ ] `favicon-192.png` - 192x192px (PWA)
- [ ] `favicon.ico` - Multi-resolution icon

## File Naming Convention

```
holoflower-[type]-[variant].[ext]
```

Examples:
- `holoflower-logo-light.svg`
- `holoflower-icon-gold.png`
- `holoflower-watermark-subtle.png`

## Color Specifications

### Sacred Gold (Primary)
- HEX: #FFD700
- RGB: 255, 215, 0
- HSL: 51°, 100%, 50%

### Sacred Purple (Secondary)
- HEX: #8B008B
- RGB: 139, 0, 139
- HSL: 300°, 100%, 27%

### Elemental Palette
- Fire: #FF6B6B
- Water: #4ECDC4
- Earth: #8B4513
- Air: #87CEEB
- Aether: #E5E4E2

## Usage Guidelines

### Do's
✅ Use SVG for web when possible
✅ Maintain aspect ratio
✅ Ensure adequate contrast
✅ Use appropriate variant for context

### Don'ts
❌ Stretch or distort
❌ Apply drop shadows
❌ Change colors arbitrarily
❌ Use below minimum size (32x32px)

---

Once your logo files are added here, run:
```bash
pnpm run build:assets
```

This will optimize and generate all necessary variations.