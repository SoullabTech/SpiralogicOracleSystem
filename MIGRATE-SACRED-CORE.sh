#!/bin/bash

# Sacred Core Migration Script
# This script extracts the Sacred Core components into a clean repo structure

echo "🌀 Starting Sacred Core Migration..."

# Set directories
SOURCE_DIR="$(pwd)"
TARGET_DIR="${SOURCE_DIR}/sacred-core"

# Create target structure
echo "📁 Creating Sacred Core directory structure..."
mkdir -p ${TARGET_DIR}/{src/{app/{api/oracle,sacred-oracle},components/{sacred,motion,audio,oracle},sacred-apis,lib/utils},docs/{architecture,ux,sacred,business,developer},public/assets}

# Step 1: Copy Sacred Core Components
echo "✨ Copying Sacred Core components..."

# Sacred components
cp components/sacred/SacredHoloflower.tsx ${TARGET_DIR}/src/components/sacred/
cp components/sacred/SacredHoloflowerWithAudio.tsx ${TARGET_DIR}/src/components/sacred/
cp components/sacred/SacredOracleExperience.tsx ${TARGET_DIR}/src/components/sacred/
cp components/sacred/HoloflowerMotion.tsx ${TARGET_DIR}/src/components/sacred/
cp components/sacred/HoloflowerMotionWithAudio.tsx ${TARGET_DIR}/src/components/sacred/
cp components/sacred/HoloflowerCheckIn.tsx ${TARGET_DIR}/src/components/sacred/
cp components/sacred/JourneyTimeline.tsx ${TARGET_DIR}/src/components/sacred/
cp components/sacred/MiniHoloflower.tsx ${TARGET_DIR}/src/components/sacred/

# Motion components
if [ -d "components/motion" ]; then
  cp components/motion/MotionOrchestrator.tsx ${TARGET_DIR}/src/components/motion/ 2>/dev/null || true
fi

# Audio components
if [ -d "components/audio" ]; then
  cp components/audio/SacredAudioSystem.tsx ${TARGET_DIR}/src/components/audio/ 2>/dev/null || true
  cp components/audio/SacredMicButton.tsx ${TARGET_DIR}/src/components/audio/ 2>/dev/null || true
fi

# Oracle components
if [ -d "components/oracle" ]; then
  cp components/oracle/OracleConversation.tsx ${TARGET_DIR}/src/components/oracle/ 2>/dev/null || true
fi

# Beta components (for Oracle UI)
if [ -d "components/beta" ]; then
  cp components/beta/OracleBetaUI.tsx ${TARGET_DIR}/src/components/oracle/ 2>/dev/null || true
fi

# Step 2: Copy API Routes
echo "🔌 Copying Sacred Portal API..."
cp app/api/sacred-portal/route.ts ${TARGET_DIR}/src/app/api/oracle/ 2>/dev/null || true
cp app/api/oracle-holoflower/route.ts ${TARGET_DIR}/src/app/api/oracle/ 2>/dev/null || true

# Step 3: Copy Page Components
echo "📄 Copying page components..."
cp app/sacred-oracle/page.tsx ${TARGET_DIR}/src/app/sacred-oracle/ 2>/dev/null || true
cp app/page.tsx ${TARGET_DIR}/src/app/ 2>/dev/null || true
cp app/layout.tsx ${TARGET_DIR}/src/app/ 2>/dev/null || true
cp app/globals.css ${TARGET_DIR}/src/app/ 2>/dev/null || true

# Step 4: Create Latent APIs (stubs for now)
echo "🌙 Creating latent API stubs..."

cat > ${TARGET_DIR}/src/sacred-apis/shadow.ts << 'EOF'
// Shadow API - Dormant
export async function analyzeShadow(input: string): Promise<any> {
  if (process.env.ENABLE_SHADOW !== 'true') {
    return null;
  }
  // Shadow work integration
  return {
    type: 'shadow',
    analysis: 'dormant',
    activation: 'requires ENABLE_SHADOW=true'
  };
}
EOF

cat > ${TARGET_DIR}/src/sacred-apis/aether.ts << 'EOF'
// Aether API - Dormant
export async function detectAether(input: string): Promise<any> {
  if (process.env.ENABLE_AETHER !== 'true') {
    return null;
  }
  // Ethereal connections
  return {
    type: 'aether',
    detection: 'dormant',
    activation: 'requires ENABLE_AETHER=true'
  };
}
EOF

cat > ${TARGET_DIR}/src/sacred-apis/docs.ts << 'EOF'
// Docs API - Dormant
export async function processDocs(input: string): Promise<any> {
  if (process.env.ENABLE_DOCS !== 'true') {
    return null;
  }
  // Document intelligence
  return {
    type: 'docs',
    processing: 'dormant',
    activation: 'requires ENABLE_DOCS=true'
  };
}
EOF

cat > ${TARGET_DIR}/src/sacred-apis/collective.ts << 'EOF'
// Collective API - Dormant
export async function senseCollective(input: string): Promise<any> {
  if (process.env.ENABLE_COLLECTIVE !== 'true') {
    return null;
  }
  // Collective consciousness
  return {
    type: 'collective',
    sensing: 'dormant',
    activation: 'requires ENABLE_COLLECTIVE=true'
  };
}
EOF

cat > ${TARGET_DIR}/src/sacred-apis/resonance.ts << 'EOF'
// Resonance API - Dormant
export async function findResonance(input: string): Promise<any> {
  if (process.env.ENABLE_RESONANCE !== 'true') {
    return null;
  }
  // Vibrational matching
  return {
    type: 'resonance',
    finding: 'dormant',
    activation: 'requires ENABLE_RESONANCE=true'
  };
}
EOF

# Step 5: Copy Documentation
echo "📚 Organizing documentation..."

# Find and copy all .md files to appropriate categories
find . -name "*.md" -type f | while read file; do
  filename=$(basename "$file")
  
  # Categorize based on content
  if [[ "$filename" == *"ARCHITECTURE"* ]] || [[ "$filename" == *"SYSTEM"* ]] || [[ "$filename" == *"API"* ]]; then
    cp "$file" ${TARGET_DIR}/docs/architecture/ 2>/dev/null || true
  elif [[ "$filename" == *"UX"* ]] || [[ "$filename" == *"UI"* ]] || [[ "$filename" == *"STORYBOARD"* ]]; then
    cp "$file" ${TARGET_DIR}/docs/ux/ 2>/dev/null || true
  elif [[ "$filename" == *"SACRED"* ]] || [[ "$filename" == *"WHITEPAPER"* ]] || [[ "$filename" == *"RITUAL"* ]]; then
    cp "$file" ${TARGET_DIR}/docs/sacred/ 2>/dev/null || true
  elif [[ "$filename" == *"BUSINESS"* ]] || [[ "$filename" == *"MARKET"* ]] || [[ "$filename" == *"REVENUE"* ]]; then
    cp "$file" ${TARGET_DIR}/docs/business/ 2>/dev/null || true
  elif [[ "$filename" == *"GUIDE"* ]] || [[ "$filename" == *"QUICK"* ]] || [[ "$filename" == *"DEVELOPER"* ]]; then
    cp "$file" ${TARGET_DIR}/docs/developer/ 2>/dev/null || true
  fi
done

# Step 6: Copy essential configs
echo "⚙️ Copying configuration files..."
cp package.json ${TARGET_DIR}/package.json 2>/dev/null || true
cp tsconfig.json ${TARGET_DIR}/tsconfig.json 2>/dev/null || true
cp tailwind.config.ts ${TARGET_DIR}/tailwind.config.ts 2>/dev/null || true
cp next.config.js ${TARGET_DIR}/next.config.js 2>/dev/null || true
cp .env.example ${TARGET_DIR}/.env.example 2>/dev/null || true

# Step 7: Copy styles
echo "🎨 Copying styles..."
cp -r styles ${TARGET_DIR}/src/styles 2>/dev/null || true

# Step 8: Copy hooks
echo "🪝 Copying hooks..."
if [ -d "hooks" ]; then
  cp hooks/useSacredOracle.ts ${TARGET_DIR}/src/hooks/ 2>/dev/null || true
  cp hooks/useOracleSession.ts ${TARGET_DIR}/src/hooks/ 2>/dev/null || true
fi

# Step 9: Copy data
echo "📊 Copying data files..."
if [ -d "data" ]; then
  cp -r data ${TARGET_DIR}/src/data 2>/dev/null || true
fi

# Step 10: Create package.json for Sacred Core
cat > ${TARGET_DIR}/package.json << 'EOF'
{
  "name": "sacred-core",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.61.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-tabs": "^1.0.4",
    "@supabase/supabase-js": "^2.39.1",
    "framer-motion": "^10.16.16",
    "lucide-react": "^0.303.0",
    "next": "14.0.4",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "tailwindcss": "^3.4.0",
    "typescript": "5.3.3",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/node": "20.10.5",
    "@types/react": "18.2.45",
    "@types/react-dom": "18.2.18",
    "autoprefixer": "^10.4.16",
    "eslint": "8.56.0",
    "eslint-config-next": "14.0.4",
    "postcss": "^8.4.32"
  }
}
EOF

# Step 11: Create README
cat > ${TARGET_DIR}/README.md << 'EOF'
# Sacred Core

The purified essence of the Spiralogic Oracle System.

## 🌀 Architecture

- **Sacred Core**: Active components for the oracle experience
- **Latent APIs**: Dormant capabilities, preserved for future activation
- **Unified Oracle**: Single API endpoint with mode switching

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:3000/sacred-oracle

## 🌙 Latent APIs

Currently dormant APIs can be activated via environment variables:

- `ENABLE_SHADOW=true` - Shadow work integration
- `ENABLE_AETHER=true` - Ethereal connections
- `ENABLE_DOCS=true` - Document intelligence
- `ENABLE_COLLECTIVE=true` - Collective consciousness
- `ENABLE_RESONANCE=true` - Vibrational matching

## 📚 Documentation

- `/docs/architecture/` - System design and API specs
- `/docs/ux/` - User experience and motion design
- `/docs/sacred/` - Philosophy and ritual design
- `/docs/business/` - Market analysis and roadmap
- `/docs/developer/` - Setup and development guides
EOF

echo "✅ Sacred Core migration complete!"
echo "📁 Sacred Core created at: ${TARGET_DIR}"
echo ""
echo "Next steps:"
echo "1. cd sacred-core"
echo "2. npm install"
echo "3. npm run dev"