#!/bin/bash

# 🚀 Fresh Repository Initialization Script
# Creates clean Next.js repo with Sacred Core components

echo "🚀 Creating Fresh Sacred Core Repository..."
echo "==========================================="

# Configuration
NEW_REPO_NAME="spiralogic-sacred-core"
NEW_REPO_PATH="../$NEW_REPO_NAME"

# Check if directory exists
if [ -d "$NEW_REPO_PATH" ]; then
  echo "⚠️  Directory $NEW_REPO_PATH already exists!"
  read -p "Remove and recreate? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$NEW_REPO_PATH"
  else
    echo "Exiting..."
    exit 1
  fi
fi

echo "📦 Creating Next.js 14 project..."
npx create-next-app@latest "$NEW_REPO_PATH" \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --no-eslint

cd "$NEW_REPO_PATH"

echo ""
echo "📚 Installing Sacred Core dependencies..."
npm install framer-motion zustand lucide-react @supabase/supabase-js

echo ""
echo "🛠️ Installing dev dependencies..."
npm install -D @types/node

echo ""
echo "📂 Creating Sacred Core structure..."

# Create directory structure
mkdir -p components/sacred
mkdir -p components/motion
mkdir -p components/audio
mkdir -p lib/oracle-cascade
mkdir -p lib/facets
mkdir -p hooks
mkdir -p state
mkdir -p app/api/oracle
mkdir -p app/oracle-sacred
mkdir -p app/checkin
mkdir -p app/journal
mkdir -p app/timeline
mkdir -p docs/architecture
mkdir -p docs/ux
mkdir -p docs/sacred
mkdir -p docs/developer
mkdir -p docs/business
mkdir -p public/logo
mkdir -p public/audio

# Create sacred config
cat > lib/sacred-config.ts << 'EOF'
// 🌸 Sacred Configuration
export const SACRED_CONFIG = {
  motion: {
    breathingRate: 3000,
    shimmerSpeed: 2000,
    transitionDuration: 1500
  },
  audio: {
    frequencies: {
      earth: 396,
      water: 417,
      fire: 528,
      air: 639,
      ether: 741,
      light: 852,
      aether: 963
    },
    volume: 0.05,
    fadeTime: 2
  },
  coherence: {
    low: 0.3,
    medium: 0.7,
    high: 0.9
  },
  colors: {
    sacred: '#d4af37',
    shadow: '#4a0080',
    aether: '#e6d5ff'
  }
} as const;
EOF

# Create Zustand store
cat > state/oracle-store.ts << 'EOF'
// 🌟 Oracle State Management
import { create } from 'zustand';

interface OracleState {
  // Voice State
  isListening: boolean;
  voiceInput: string;
  
  // Motion State
  motionState: 'stillness' | 'breathing' | 'expansion' | 'contraction' | 'shimmer';
  motionIntensity: number;
  
  // Coherence State
  coherenceLevel: number;
  activeFacets: string[];
  shadowFacets: string[];
  
  // Aether State
  aetherStage: 0 | 1 | 2 | 3;
  
  // Session State
  sessionId: string;
  sessionHistory: any[];
  
  // Actions
  setVoiceInput: (input: string) => void;
  setMotionState: (state: any) => void;
  setCoherence: (level: number) => void;
  setAetherStage: (stage: 0 | 1 | 2 | 3) => void;
  addToHistory: (entry: any) => void;
  resetSession: () => void;
}

export const useOracleStore = create<OracleState>((set) => ({
  // Initial State
  isListening: false,
  voiceInput: '',
  motionState: 'stillness',
  motionIntensity: 0.5,
  coherenceLevel: 0.5,
  activeFacets: [],
  shadowFacets: [],
  aetherStage: 0,
  sessionId: `session_${Date.now()}`,
  sessionHistory: [],
  
  // Actions
  setVoiceInput: (input) => set({ voiceInput: input }),
  setMotionState: (state) => set({ 
    motionState: state.primary, 
    motionIntensity: state.intensity 
  }),
  setCoherence: (level) => set({ coherenceLevel: level }),
  setAetherStage: (stage) => set({ aetherStage: stage }),
  addToHistory: (entry) => set((state) => ({ 
    sessionHistory: [...state.sessionHistory, entry] 
  })),
  resetSession: () => set({
    sessionHistory: [],
    sessionId: `session_${Date.now()}`,
    coherenceLevel: 0.5,
    aetherStage: 0
  })
}));
EOF

# Create main layout
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Spiralogic Oracle - Sacred Core',
  description: 'Sacred technology for consciousness exploration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
EOF

# Create home page
cat > app/page.tsx << 'EOF'
'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-thin tracking-wider text-[#d4af37]">
          Spiralogic Oracle
        </h1>
        <p className="text-xl text-gray-400">Sacred Core</p>
        
        <div className="flex gap-4 justify-center mt-12">
          <Link 
            href="/oracle-sacred"
            className="flex items-center gap-2 px-6 py-3 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg hover:bg-[#d4af37]/20 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Enter Sacred Portal
          </Link>
        </div>
      </div>
    </main>
  );
}
EOF

# Create migration manifest
cat > MIGRATION_MANIFEST.md << 'EOF'
# 🌸 Sacred Core Migration Manifest

## Repository Structure
```
spiralogic-sacred-core/
├── app/
│   ├── api/oracle/        # Unified Oracle API
│   ├── oracle-sacred/     # Sacred Portal
│   ├── checkin/          # Check-in Flow
│   ├── journal/          # Journal Flow
│   └── timeline/         # Timeline View
├── components/
│   ├── sacred/           # Sacred Core Components
│   ├── motion/           # Motion Orchestration
│   └── audio/            # Audio System
├── lib/
│   ├── oracle-cascade/   # Cascade Layers
│   ├── facets/           # Spiralogic Facets
│   └── sacred-config.ts  # Configuration
├── state/                # Zustand Store
├── hooks/                # React Hooks
└── docs/                 # Consolidated Documentation
```

## Migration Checklist
- [ ] Copy Sacred Core components
- [ ] Copy Wisdom Core libraries
- [ ] Copy Bridge Layer hooks
- [ ] Migrate documentation to /docs
- [ ] Update component imports
- [ ] Test unified Oracle API
- [ ] Verify motion orchestration
- [ ] Test audio system
- [ ] Validate sacred portal

## Components to Migrate
1. SacredHoloflower.tsx
2. MotionOrchestrator.tsx
3. SacredAudioSystem.tsx
4. OracleConversation.tsx

## Libraries to Migrate
1. spiralogic-facets-complete.ts
2. oracle-response.ts
3. motion-mapper.ts
4. coherence-calculator.ts

## Next Steps
1. Run component migration script
2. Test Sacred Portal
3. Verify API integration
4. Deploy to Vercel
EOF

echo ""
echo "✅ Fresh repository created at: $NEW_REPO_PATH"
echo "📋 Migration manifest created"
echo ""
echo "Next steps:"
echo "1. cd $NEW_REPO_PATH"
echo "2. Copy Sacred Core components using migration scripts"
echo "3. npm run dev to start development server"