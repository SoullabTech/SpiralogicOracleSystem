# Spiralogic AIN – Architecture Atlas

A comprehensive visual guide to the Spiralogic Oracle System architecture, covering context diagrams, technical flow charts, UX journeys, and interactive system mindmaps.

## 📋 Table of Contents

- [System Context](#system-context) - High-level system boundaries and external actors
- [Container Architecture](#container-architecture) - Major components and their relationships  
- [Component Details](#component-details) - Internal component breakdown
- [Sequence Flows](#sequence-flows) - Key interaction patterns and data flows
- [UX Flows](#ux-flows) - User journeys and interface navigation
- [System Mindmap](#system-mindmap) - Interactive exploration of the entire system

## 🏗️ System Context

### [C4 Level 1: Context Diagram](c4/01-context.md)
Shows the Spiralogic system in relation to users and external systems like Supabase, OpenAI, and storage services.

## 🔧 Container Architecture  

### [C4 Level 2: Container Diagram](c4/02-containers.md)
Details the major runtime containers: Next.js app, backend services, database, and external integrations.

## ⚙️ Component Details

### [C4 Level 3: Component Breakdown](c4/03-components-backend.md)
Deep dive into backend components including agents, services, utilities, and bridges.

## 🔄 Sequence Flows

Key interaction patterns and data flows:

- **[Oracle Turn](sequence/oracle-turn.md)** - User query processing through the agent hierarchy
- **[Oracle Weave](sequence/oracle-weave.md)** - Conversation recap and thread weaving process
- **[Upload Processing](sequence/upload-process.md)** - File upload, parsing, and embedding pipeline
- **[Soul Memory Bookmark](sequence/soul-memory-bookmark.md)** - Memory capture and storage workflow

## 🎨 UX Flows

User experience and interface navigation:

- **[Site Map](../ux/site-map.md)** - Complete application navigation structure
- **[Chat + Upload Journey](../ux/journey-chat-upload.md)** - End-to-end user interaction flow
- **[Admin Console](../ux/admin-console.md)** - Administrative interface workflows

## 🧠 System Mindmap

Interactive exploration of the entire system:

- **[Markmap (Interactive)](../mindmap/spiralogic.mmd)** - Interactive HTML mindmap for exploration
- **[Mermaid Mindmap](../mindmap/spiralogic-mermaid.md)** - GitHub-rendered visual mindmap

## 📝 How to Edit

### Mermaid Diagrams
- All `.md` files containing Mermaid syntax render automatically on GitHub
- Use [Mermaid Live Editor](https://mermaid.live) for real-time editing
- Validate syntax before committing changes

### Interactive Mindmap
- Edit the `.mmd` file using standard Markmap syntax
- Use `npm run mindmap:build` to generate HTML preview
- Use `npm run mindmap:open` to build and open in browser

### Diagram Conventions
- Keep labels concise and descriptive
- Use consistent colors and styling
- Include relevant file paths and endpoints
- Add notes for complex interactions or error paths

## 🔄 Updates

This architecture documentation is maintained alongside code changes. When adding new components, routes, or major functionality:

1. Update relevant C4 diagrams
2. Add/modify sequence diagrams for new flows
3. Update UX flows for interface changes
4. Refresh the system mindmap with new components
5. Verify all links and references work correctly

For detailed editing guidance, see [CONTRIBUTING.md](CONTRIBUTING.md).