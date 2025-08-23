# GitHub Repository Setup Guide

This guide covers the one-time setup steps needed after merging the design system and architecture documentation.

## 🔐 Required Secrets

### Chromatic Project Token
Visual regression testing requires a Chromatic project token:

1. **Create Chromatic Account**: Visit [chromatic.com](https://chromatic.com) and sign up
2. **Create Project**: Add your repository as a new Chromatic project
3. **Get Project Token**: Copy the project token from Chromatic dashboard
4. **Add GitHub Secret**:
   - Go to your repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `CHROMATIC_PROJECT_TOKEN`
   - Value: Your token from Chromatic
   - Click "Add secret"

### Optional: Storybook Deployment
If you want to host Storybook publicly:

1. **Chromatic Hosting**: Chromatic automatically hosts your Storybook
2. **Manual Hosting**: Use Vercel, Netlify, or GitHub Pages
3. **Add Storybook URL**: Update `/dev/architecture` page with live Storybook link

## 📌 Repository About Section

Pin key documentation in your repo's About section:

1. **Go to repo main page** → Click gear icon next to "About"
2. **Add these links**:
   - `docs/THEME.md` - Design system documentation
   - `docs/architecture/README.md` - Architecture atlas
   - Your hosted Storybook URL (when available)
3. **Add topics/tags**:
   - `design-system`
   - `architecture-documentation` 
   - `nextjs`
   - `oracle-ai`
   - `visual-regression-testing`

## 🏷️ Recommended Labels

Add these labels for better PR organization:

| Label | Color | Description |
|-------|-------|-------------|
| `design-system` | `#E91E63` | Design token, theme, or component changes |
| `architecture` | `#2196F3` | System architecture or documentation |
| `dx` | `#4CAF50` | Developer experience improvements |
| `a11y` | `#FF9800` | Accessibility improvements |
| `visual-regression` | `#9C27B0` | Visual testing related |
| `docs` | `#607D8B` | Documentation updates |

To add labels:
1. Go to repo → Issues → Labels
2. Click "New label" for each one above
3. Use the provided colors and descriptions

## 🔄 Branch Protection Rules

Consider adding these protections for main branch:

1. **Go to**: Settings → Branches → Add rule
2. **Branch name pattern**: `main`
3. **Enable**:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators
4. **Required status checks**:
   - `Visual Tests (chromatic)` (once Chromatic is set up)
   - Any other CI checks you have

## 📊 Insights & Analytics

### Enable Insights
1. Go to repo → Insights tab
2. Enable Community Standards
3. Enable Code frequency and Contributors graphs

### Monitor Key Metrics
- **Chromatic**: Visual regression test results
- **Pull Requests**: Review Design system changes
- **Issues**: Track design system feedback
- **Traffic**: Monitor documentation usage

## 🚀 Post-Merge Workflow

### Immediate Actions (after PR merge)
1. **Set up Chromatic project** (if not done)
2. **Pin documentation** in About section  
3. **Add GitHub labels** for better organization
4. **Test the deployed features**:
   - Visit `/dev/theme` in production
   - Visit `/dev/architecture` in production
   - Run `npm run tokens:export` locally
   - Test `npm run mindmap:open` locally

### Team Communication
1. **Announce new tools** in team channels:
   - `/dev/theme` - Live token playground
   - `/dev/architecture` - Complete system documentation
   - `npm run tokens:export` - Figma integration
   - Visual regression testing with Chromatic
2. **Update onboarding docs** to include these tools
3. **Schedule design system walkthrough** for team

### Ongoing Maintenance
1. **Regular Chromatic reviews** - Check visual changes in PRs
2. **Token export updates** - Re-export when tokens change  
3. **Architecture updates** - Keep diagrams current with system changes
4. **Documentation reviews** - Ensure accuracy as system evolves

## 🔧 Troubleshooting

### Chromatic Issues
- **"No project token"**: Check GitHub secret is correctly named `CHROMATIC_PROJECT_TOKEN`
- **Build failures**: Ensure Storybook builds locally with `npm run build-storybook`
- **Missing snapshots**: First Chromatic run will create baseline snapshots

### Mindmap Issues
- **HTML not generating**: Run `npm install` to ensure `markmap-cli` is installed
- **Browser not opening**: Try `npm run mindmap:build` then manually open `docs/mindmap/spiralogic.html`

### Token Export Issues
- **Script fails**: Ensure `ts-node` is installed and `scripts/export-tokens.ts` has correct permissions
- **Malformed JSON**: Check `app/styles/tokens.css` for syntax errors

### Documentation Links
- **404 errors**: Ensure all links use correct relative paths
- **GitHub rendering issues**: Check Mermaid syntax in fenced code blocks
- **Missing images**: Verify screenshot paths and file uploads

## 📞 Support

If you encounter issues:
1. **Check the logs** in GitHub Actions for CI failures
2. **Review this guide** for setup steps
3. **Test locally** before reporting repository issues
4. **Create issues** with reproduction steps for persistent problems

---

This completes the GitHub setup for your world-class design system and architecture documentation! 🎉