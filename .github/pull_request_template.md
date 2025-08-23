# Pull Request Template

## Summary
<!-- Brief description of what this PR accomplishes -->

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🎨 Design system update
- [ ] 🏗️ Architecture change
- [ ] 🔧 CI/CD or tooling change

## Testing Checklist

### Core Functionality
- [ ] **Storybook**: `npm run storybook` runs without errors
- [ ] **Token Export**: `npm run tokens:export` generates valid `design-tokens.json`
- [ ] **Mindmap**: `npm run mindmap:open` builds and opens interactive map
- [ ] **Build**: `npm run build` completes successfully
- [ ] **Lint**: `npm run lint` passes (ESLint blocks raw hex colors)
- [ ] **TypeCheck**: `npm run typecheck` passes

### Design System (if applicable)
- [ ] **/dev/theme (Dark)**: All tokens, states, and components render correctly
- [ ] **/dev/theme (Light)**: Theme toggle works, all tokens update properly
- [ ] **CSS Values Toggle**: "Show CSS Values" button reveals token details
- [ ] **Storybook a11y**: Accessibility panel shows no critical violations
- [ ] **Token Enforcement**: ESLint prevents raw hex colors outside config files

### Architecture Documentation (if applicable)
- [ ] **/dev/architecture**: All documentation links work
- [ ] **GitHub Mermaid**: All diagrams render properly in GitHub preview
- [ ] **C4 Diagrams**: Context, Containers, Components all display correctly
- [ ] **Sequence Diagrams**: Oracle turn, Upload processing, Soul memory flows render
- [ ] **UX Flows**: Site map, User journey, Admin console diagrams work

### Visual Regression (if applicable)
- [ ] **Chromatic CI**: Workflow runs successfully (or will run on merge)
- [ ] **Screenshot Review**: No unintended visual changes detected

## Screenshots Required

### Design System Changes
- [ ] `/dev/theme` in dark mode (full page)
- [ ] `/dev/theme` in light mode (showing theme toggle)
- [ ] `/dev/theme` with "Show CSS Values" enabled
- [ ] Storybook a11y panel showing accessibility checks

### Architecture Documentation Changes  
- [ ] `/dev/architecture` overview page
- [ ] GitHub-rendered C4 Context diagram
- [ ] GitHub-rendered Sequence diagram (any one)
- [ ] Interactive mindmap (browser screenshot)

### Component/UI Changes
- [ ] Before/after comparison (if modifying existing components)
- [ ] New component states (hover, active, disabled)
- [ ] Mobile responsive view (if applicable)

## How to Test

1. **Clone and setup**:
   ```bash
   git checkout [branch-name]
   npm install
   ```

2. **Design system verification**:
   ```bash
   npm run storybook  # Verify a11y panel + component states
   npm run tokens:export  # Check design-tokens.json output
   ```

3. **Documentation verification**:
   ```bash
   npm run mindmap:open  # Interactive system overview
   # Visit /dev/theme and /dev/architecture
   # Check GitHub preview of docs/ files
   ```

4. **Quality checks**:
   ```bash
   npm run lint        # Should pass with hex color enforcement
   npm run typecheck   # Should pass without errors
   npm run build       # Should complete successfully
   ```

## Deployment Notes
- [ ] **Safe to deploy**: Changes are feature-flagged or non-breaking
- [ ] **Database changes**: None / Documented migration steps below
- [ ] **Environment variables**: None / Added to `.env.example`
- [ ] **External dependencies**: None / Service impact documented

## Rollback Plan
<!-- How to quickly revert these changes if issues arise -->
- [ ] **Revert strategy**: Git revert / Feature flag disable / Database rollback
- [ ] **Impact scope**: Dev routes only / User-facing / Admin-facing / System-wide

## Documentation
- [ ] **README updated**: If adding new features or changing setup
- [ ] **API docs updated**: If changing API contracts  
- [ ] **Architecture docs updated**: If changing system design
- [ ] **Changelog updated**: For user-facing changes

## Dependencies
- [ ] **No new dependencies** / New dependencies documented below
- [ ] **Package.json**: Version locks appropriate for stability
- [ ] **Security review**: No known vulnerabilities in new dependencies

---

## For Reviewers

### Key Areas to Focus On
<!-- Guide reviewers to the most important parts -->

### Questions for Discussion
<!-- Any open questions or decisions needed -->

### Performance Impact
<!-- Any potential performance implications -->

---

**Post-Merge Checklist** (for maintainers):
- [ ] Update GitHub repo "About" section with new documentation links
- [ ] Add `CHROMATIC_PROJECT_TOKEN` to GitHub secrets (if Chromatic workflow added)
- [ ] Announce new features/tools to team
- [ ] Monitor error rates and user feedback