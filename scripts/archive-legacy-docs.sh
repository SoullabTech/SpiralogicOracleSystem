#!/bin/bash

# Archive Legacy Documentation Script
# This script moves future-focused and legacy documentation to an archive folder

echo "📦 Archiving legacy and future-focused documentation..."

# Create archive directory if it doesn't exist
ARCHIVE_DIR="documentation/99-archive"
mkdir -p "$ARCHIVE_DIR"
mkdir -p "$ARCHIVE_DIR/school-deployment"
mkdir -p "$ARCHIVE_DIR/legacy-systems"
mkdir -p "$ARCHIVE_DIR/experimental"

# Archive school deployment documents (future iteration)
echo "📚 Archiving school deployment docs..."
mv docs/legal/maya-community-license.md "$ARCHIVE_DIR/school-deployment/" 2>/dev/null || true
mv docs/governance/board-structure.md "$ARCHIVE_DIR/school-deployment/" 2>/dev/null || true
mv docs/pilots/pilot-loi-template.md "$ARCHIVE_DIR/school-deployment/" 2>/dev/null || true
mv docs/programs/teacher-ambassador-program.md "$ARCHIVE_DIR/school-deployment/" 2>/dev/null || true
mv docs/grants/foundation-grant-template.md "$ARCHIVE_DIR/school-deployment/" 2>/dev/null || true
mv docs/architecture/maya-consciousness-field-integration.md "$ARCHIVE_DIR/school-deployment/" 2>/dev/null || true

# Archive legacy test pages
echo "🗄️ Archiving legacy test pages list..."
cat > "$ARCHIVE_DIR/legacy-pages-to-remove.txt" << 'EOF'
# Legacy Pages to Archive/Remove for Beta

## Test Pages (Remove)
- /app/test-stub/
- /app/test-voice/
- /app/voice-test/
- /app/oracle-conversation-debug/
- /app/oracle-conversation-test/
- /app/oracle-conversation-dynamic/
- /app/oracle-conversation-safe/

## Redundant Oracle Variants (Archive)
- /app/oracle-beta/ (keep API, remove page)
- /app/sacred-oracle/
- /app/oracle/
- /app/maia/
- /app/soulmap/
- /app/holoflower/
- /app/sliding-prototype/

## Keep for Beta
- /app/maya/ (main interface - needs creation)
- /app/maya/chat/ (text fallback)
- /app/maya-voice/ (voice interface)
- /app/welcome/ (onboarding)
- /app/about/

## API Routes to Consolidate
- Consolidate all oracle-* routes into /api/maya/
- Keep /api/tts/ for voice
EOF

# Archive old architecture docs
echo "📐 Archiving outdated architecture docs..."
find documentation/01-architecture -name "*.md" -type f | while read file; do
    # Check if file contains legacy patterns
    if grep -q "BETA_LAUNCH\|SPRINT\|CLAUDE_TASKS\|UIZARD\|DOCKER_SETUP" "$file" 2>/dev/null; then
        echo "  Archiving: $(basename "$file")"
        mv "$file" "$ARCHIVE_DIR/legacy-systems/" 2>/dev/null || true
    fi
done

# Create focused documentation index
echo "📝 Creating focused documentation structure..."
cat > documentation/ACTIVE_DOCS.md << 'EOF'
# Active Documentation for Phase 1 Beta

## Critical Documents

### System Architecture
- [Consciousness Field Architecture](./01-architecture/CONSCIOUSNESS_FIELD_ARCHITECTURE.md)
- [Maya System Overview](./06-maya-oracle/MAYA_DEPLOYMENT_GUIDE.md)
- [Phase 1 Beta Preparation](./PHASE_1_BETA_PREPARATION.md)
- [Immediate Voice Fix](./IMMEDIATE_VOICE_FIX.md)

### Development Guides
- [CLAUDE.md](./01-architecture/CLAUDE.md) - AI assistant guidance
- [Contributing Guidelines](../CONTRIBUTING.md)

### Beta Testing
- [Beta Tester Journal](./02-beta/BETA_TESTER_JOURNAL.md)
- [Beta Micro Interactions](./BETA_MICRO_INTERACTIONS.md)

## Archived Documentation

Future iterations and legacy systems have been moved to `./99-archive/`

### Future Features (Post-Beta)
- School deployment system
- Democratic governance
- Community features
- Institutional rollout

### Legacy Systems
- Old sprint documentation
- Deprecated test pages
- Experimental features
EOF

echo "✅ Archive complete!"
echo ""
echo "Next steps:"
echo "1. Review documentation/99-archive/legacy-pages-to-remove.txt"
echo "2. Manually remove or archive the listed pages"
echo "3. Focus development on /app/maya/ unified interface"
echo "4. Implement voice integration fixes from IMMEDIATE_VOICE_FIX.md"