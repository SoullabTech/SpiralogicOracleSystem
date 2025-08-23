# feat: design system + architecture atlas (runtime theming, Chromatic, Figma tokens)

## 🎯 Goals
Unify visual language with tokens + CSS variables, document complete system architecture, and add visual regression & accessibility checks for production-grade design system.

## ✨ What's New

### 🎨 Live Token Playground (`/dev/theme`)
- **Runtime theme switching** between light/dark modes
- **Complete token showcase** with all colors, shadows, typography, and components  
- **CSS value inspector** - toggle to show actual CSS custom property values
- **Interactive components** - buttons, cards, forms with all states
- **CVA integration** - type-safe component variants with consistent styling

### 🏗️ Architecture Documentation Hub (`/dev/architecture`)
- **C4 Model diagrams** - Context (L1), Containers (L2), Components (L3)
- **Sequence diagrams** - Oracle turn, Upload processing, Soul memory flows  
- **UX journey maps** - Complete user flows from discovery to reflection
- **Interactive mindmap** - Clickable system overview with Markmap
- **GitHub-native rendering** - All Mermaid diagrams render directly on GitHub

### 🔍 Quality Guardrails
- **Visual regression testing** with Chromatic (GitHub Action configured)
- **Accessibility testing** with Storybook a11y addon  
- **Token enforcement** - ESLint rules block raw hex colors
- **Figma integration** - `npm run tokens:export` for design tool sync

### 🧭 Team Discovery
- **Dev navigation** between `/dev/theme` and `/dev/architecture`
- **External links** to GitHub docs and Storybook
- **Visual indicators** for active pages and external links

## 🧪 How to Test

### Design System Verification
```bash
# Start Storybook with a11y checks
npm run storybook

# Visit token playground
# → /dev/theme
# → Toggle light/dark theme 
# → Enable "Show CSS Values"
# → Test all component states

# Export tokens for Figma
npm run tokens:export
# → Verify design-tokens.json created
```

### Architecture Documentation
```bash
# Build interactive mindmap  
npm run mindmap:open
# → Interactive system overview opens in browser

# Visit architecture hub
# → /dev/architecture  
# → Click through all documentation links
# → Verify GitHub renders all Mermaid diagrams
```

### Quality Checks
```bash
npm run lint        # ✅ ESLint blocks raw hex colors
npm run typecheck   # ✅ All TypeScript passes  
npm run build       # ✅ Production build succeeds
```

## 📸 Screenshots

### `/dev/theme` - Token Playground
<!-- Add screenshot: Full page view in dark mode showing all token categories -->

### `/dev/theme` - Light Mode Toggle  
<!-- Add screenshot: Same page in light mode showing theme switching -->

### `/dev/theme` - CSS Values Inspector
<!-- Add screenshot: Page with "Show CSS Values" enabled showing token details -->

### `/dev/architecture` - Documentation Hub
<!-- Add screenshot: Architecture page showing all diagram links and navigation -->

### GitHub Mermaid Rendering - C4 Context
<!-- Add screenshot: C4 context diagram rendered in GitHub -->

### GitHub Mermaid Rendering - Sequence Diagram
<!-- Add screenshot: One of the sequence diagrams rendered in GitHub -->

### Storybook A11y Panel
<!-- Add screenshot: Storybook with accessibility panel showing no violations -->

### Interactive Mindmap
<!-- Add screenshot: Browser showing the interactive mindmap -->

## 🏗️ Architecture

### File Structure Added
```
docs/
├── architecture/
│   ├── README.md              # Main architecture hub
│   ├── CONTRIBUTING.md        # Diagram editing guide
│   ├── c4/
│   │   ├── 01-context.md      # System context (L1)
│   │   ├── 02-containers.md   # Container breakdown (L2)
│   │   └── 03-components-backend.md # Component details (L3)
│   └── sequence/
│       ├── oracle-turn.md     # Conversation flow
│       ├── upload-process.md  # File processing pipeline
│       └── soul-memory-bookmark.md # Memory capture flow
├── ux/
│   ├── site-map.md           # Complete navigation structure
│   ├── journey-chat-upload.md # End-to-end user experience
│   └── admin-console.md      # Administrative workflows
├── mindmap/
│   ├── spiralogic.mmd        # Interactive mindmap source
│   └── spiralogic-mermaid.md # GitHub-rendered mindmap
├── THEME.md                  # Updated with tooling info
└── GITHUB_SETUP.md          # Repository setup guide

app/dev/
├── theme/page.tsx            # Live token playground
└── architecture/page.tsx    # Architecture documentation hub

scripts/
└── export-tokens.ts         # Figma token export utility

.github/
├── workflows/chromatic.yml  # Visual regression CI
└── pull_request_template.md # Comprehensive PR template
```

### Dependencies Added
- `chromatic@^11.0.0` - Visual regression testing
- `markmap-cli@^2.0.0` - Interactive mindmap generation
- `ts-node@^10.9.2` - TypeScript script execution

### Scripts Added
- `npm run chromatic` - Visual regression testing
- `npm run tokens:export` - Export tokens for Figma
- `npm run mindmap:build` - Generate interactive mindmap HTML
- `npm run mindmap:open` - Build and open mindmap in browser

## 🎛️ Risk Assessment & Rollback

### Risk Level: **LOW** 
- **Scope**: Feature-flagged to `/dev/*` routes only
- **User Impact**: None - development tools only
- **Dependencies**: New dev dependencies, no runtime changes

### Rollback Strategy
If issues arise, can safely:
1. **Revert commit** - All changes are self-contained
2. **Disable routes** - Remove `/dev/theme` and `/dev/architecture` pages  
3. **Remove workflows** - Delete `.github/workflows/chromatic.yml`
4. **Clean dependencies** - Remove chromatic, markmap-cli, ts-node

### Monitoring
- **Chromatic CI** - Will show visual regression status on future PRs
- **Build time** - Monitor for any impact from new dependencies
- **Documentation usage** - Track visits to `/dev/*` routes

## 🔧 Post-Merge Setup Required

### GitHub Repository Setup
1. **Add Chromatic secret**: `CHROMATIC_PROJECT_TOKEN` in repo settings
2. **Pin documentation**: Add `docs/THEME.md` and `docs/architecture/README.md` to repo About
3. **Add labels**: `design-system`, `dx`, `a11y`, `docs` for better PR organization

### Team Communication  
1. **Share new tools**: `/dev/theme` and `/dev/architecture` URLs
2. **Demo token export**: Show `npm run tokens:export` for Figma workflow
3. **Architecture walkthrough**: Review system diagrams with team

See `docs/GITHUB_SETUP.md` for complete setup instructions.

## 🎉 Impact

This establishes a **world-class design system foundation** with:
- ✅ **Runtime theming** with CSS variables as single source of truth
- ✅ **Token enforcement** preventing design drift  
- ✅ **Visual regression testing** catching unintended changes
- ✅ **Accessibility guardrails** built into development workflow
- ✅ **Design tool integration** with Figma export
- ✅ **Comprehensive documentation** covering entire system architecture
- ✅ **Team discoverability** with easy navigation and clear tooling

Ready for production use and scales with team growth! 🚀

---

**Labels**: `design-system`, `docs`, `dx`, `a11y`, `ci`