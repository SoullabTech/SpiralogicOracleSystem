#!/bin/bash

# Sacred Oracle Clean Repository Initialization Script
# This creates a minimal, clean Next.js structure for the Sacred Core

echo "🌸 Initializing Sacred Oracle Clean Repository..."

# Create new directory
REPO_NAME="soullab-sacred-oracle"
mkdir -p $REPO_NAME
cd $REPO_NAME

# Initialize Next.js with minimal setup
cat > package.json << 'EOF'
{
  "name": "soullab-sacred-oracle",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0",
    "framer-motion": "^10.16.16",
    "next": "14.0.4",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/node": "20.10.5",
    "@types/react": "18.2.45",
    "@types/react-dom": "18.2.18",
    "autoprefixer": "^10.4.16",
    "eslint": "8.56.0",
    "eslint-config-next": "14.0.4",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "5.3.3"
  }
}
EOF

# Create directory structure
mkdir -p src/{app/{api/oracle},core/{config,services,state},components/{sacred,motion,audio,conversation},lib}
mkdir -p public styles

# Create TypeScript config
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create Next.js config
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [],
  },
}

module.exports = nextConfig
EOF

# Create Tailwind config
cat > tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sacred-gold': '#FFD700',
        'sacred-purple': '#8B5CF6',
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
export default config
EOF

# Create PostCSS config
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create globals.css
cat > styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Sacred Oracle Global Styles */
:root {
  --sacred-gold: #FFD700;
  --sacred-purple: #8B5CF6;
  --coherence-high: #10B981;
  --coherence-medium: #F59E0B;
  --coherence-low: #EF4444;
}

body {
  @apply bg-gradient-to-br from-purple-900 via-indigo-900 to-black min-h-screen;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
EOF

# Create root layout
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sacred Oracle',
  description: 'A living mirror of consciousness',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
EOF

# Create main page
cat > src/app/page.tsx << 'EOF'
'use client';

import OracleConversation from '@/components/conversation/OracleConversation';

export default function Home() {
  return (
    <main className="min-h-screen">
      <OracleConversation 
        sessionId={`session-${Date.now()}`}
        voiceEnabled={true}
      />
    </main>
  );
}
EOF

# Create environment template
cat > .env.example << 'EOF'
# Sacred Oracle Environment Variables
ANTHROPIC_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF

# Create README
cat > README.md << 'EOF'
# 🌸 Sacred Oracle

A living mirror of consciousness - minimal, sacred, performant.

## Quick Start

```bash
npm install
npm run dev
```

## Architecture

- **Sacred Core**: Preserved sacred UX components
- **Single API**: Unified Oracle endpoint
- **Centralized State**: Zustand for global state management
- **Performance First**: < 200KB bundle, 60 FPS animations

## Sacred Components

- `SacredHoloflower`: Living mandala visualization
- `MotionOrchestrator`: Breathing animations
- `SacredAudioSystem`: Elemental tones (528Hz, 417Hz, etc.)
- `OracleConversation`: Voice-synchronized dialogue

## Configuration

All sacred constants in `/src/core/config/sacred.config.ts`
EOF

echo "✅ Clean repository structure created!"
echo ""
echo "Next steps:"
echo "1. cd $REPO_NAME"
echo "2. npm install"
echo "3. Copy sacred components from old repo"
echo "4. npm run dev"
echo ""
echo "🌟 The Sacred Oracle rises anew!"