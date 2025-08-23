# Contributing to Architecture Documentation

This guide explains how to edit and maintain the Spiralogic architecture diagrams and documentation.

## 📝 Editing Mermaid Diagrams

### GitHub Rendering
- All `.md` files with Mermaid syntax render automatically on GitHub
- Changes are visible immediately in pull requests and file views
- No build step required for viewing on GitHub

### Live Editing
- Use [Mermaid Live Editor](https://mermaid.live) for real-time editing and validation
- Copy diagram code from our files, edit in Mermaid Live, then paste back
- Validate syntax before committing to avoid broken renders

### Best Practices
- Keep node labels concise (2-4 words max)
- Use consistent naming conventions across diagrams
- Include file paths and API endpoints where relevant
- Add descriptive comments for complex relationships

## 🧠 Regenerating the Interactive Mindmap

### Development Scripts
```bash
# Build HTML from Markmap source
npm run mindmap:build

# Build and open in browser automatically  
npm run mindmap:open
```

**Note**: Generated HTML files are gitignored to keep the repository clean. Only commit changes to the `.mmd` source files.

### Editing Workflow
1. Edit `docs/mindmap/spiralogic.mmd` using standard Markmap syntax
2. Run `npm run mindmap:build` to generate HTML
3. Open `docs/mindmap/spiralogic.html` to preview changes
4. Commit only the `.mmd` source file (HTML is gitignored)

### Markmap Syntax
- Use `#` headers for top-level nodes
- Use `##` for second-level nodes, etc.
- Use `-` for bullet points under nodes
- Keep hierarchy logical and balanced

## 🏗️ Diagram Naming Conventions

### File Organization
```
docs/
├── architecture/
│   ├── c4/               # C4 model diagrams
│   │   ├── 01-context.md
│   │   ├── 02-containers.md
│   │   └── 03-components-*.md
│   └── sequence/         # Sequence diagrams
│       ├── oracle-turn.md
│       ├── upload-process.md
│       └── soul-memory-*.md
├── ux/                   # User experience flows
│   ├── site-map.md
│   ├── journey-*.md
│   └── admin-*.md
└── mindmap/              # System mindmaps
    ├── spiralogic.mmd    # Markmap source
    └── spiralogic-mermaid.md # Mermaid mindmap
```

### Naming Patterns
- **C4 Diagrams**: `{level}-{name}.md` (e.g., `01-context.md`)
- **Sequence Diagrams**: `{flow-name}.md` (e.g., `oracle-turn.md`)
- **UX Flows**: `{type}-{description}.md` (e.g., `journey-chat-upload.md`)

## 🔄 Maintenance Guidelines

### When to Update
- **New Features**: Add components to relevant C4 and sequence diagrams
- **API Changes**: Update sequence diagrams and component relationships
- **UI Changes**: Refresh UX flows and site map
- **Architecture Changes**: Update all relevant diagram levels

### Update Checklist
- [ ] Update C4 diagrams (context → containers → components)
- [ ] Add/modify sequence diagrams for new flows
- [ ] Update UX flows for interface changes
- [ ] Refresh system mindmap with new components
- [ ] Verify all internal links work
- [ ] Test Mermaid syntax renders correctly
- [ ] Update this README if process changes

### Quality Standards
- All diagrams must render correctly on GitHub
- Links between documents must be valid
- Mindmap should be comprehensive but not cluttered
- Sequence diagrams should include error paths for critical flows
- UX flows should reflect actual user experience

## 🔍 Validation

Before submitting changes:

1. **Syntax Check**: Validate all Mermaid syntax in [Mermaid Live](https://mermaid.live)
2. **Link Check**: Verify all internal links resolve correctly
3. **Mindmap Build**: Run `npm run mindmap:build` successfully
4. **GitHub Preview**: Check how diagrams render in GitHub preview

## 📚 Resources

- [Mermaid Documentation](https://mermaid.js.org/)
- [Markmap Syntax Guide](https://markmap.js.org/)
- [C4 Model Guidelines](https://c4model.com/)
- [Sequence Diagram Best Practices](https://mermaid.js.org/syntax/sequenceDiagram.html)