# 🎨 Prompt 4: Component Consolidation

## Claude Code Prompt

```
You are Claude Code. Refactor components into a clean, modular hierarchy, removing all duplicates while preserving the sacred UI essence.

## Task:

1. Remove ALL duplicate/legacy components:
   - DELETE: HoloflowerViz.tsx, HoloflowerVisualization.tsx
   - DELETE: BetaHoloflower.tsx, TestHoloflower.tsx
   - DELETE: OracleChat.tsx, OracleInterface.tsx (old versions)
   - DELETE: Any component with "old", "beta", "test", "backup" in name
   - DELETE: Unused dashboard components

2. Keep ONLY sacred component set:
   ```
   /components/sacred/
     SacredHoloflower.tsx      # Main visualization
     SacredMicButton.tsx       # Voice input control
     OracleConversation.tsx    # Response display
     HoloflowerCheckIn.tsx     # Petal drag interface
   
   /components/motion/
     MotionOrchestrator.tsx    # Framer motion coordination
   
   /components/audio/
     SacredAudioSystem.tsx     # Frequency generation
   ```

3. Update SacredHoloflower.tsx:
   ```typescript
   interface SacredHoloflowerProps {
     fullscreen?: boolean;      // Sacred Portal mode
     showLabels?: boolean;      // Show petal labels
     interactive?: boolean;      // Enable drag/touch
     size?: 'sm' | 'md' | 'lg' | 'full';
     className?: string;
   }
   
   // Connect to global store
   import { useMotionState, useAetherState } from '@/lib/state/sacred-store';
   
   // Responsive sizing
   const sizeMap = {
     sm: 'w-32 h-32',
     md: 'w-64 h-64',
     lg: 'w-96 h-96',
     full: 'w-full h-full'
   };
   ```

4. Update SacredMicButton.tsx:
   ```typescript
   interface SacredMicButtonProps {
     position?: 'center' | 'bottom' | 'floating';
     size?: 'sm' | 'md' | 'lg';
     pulseWhenListening?: boolean;
   }
   
   // Connect to voice state
   import { useVoiceState, useSacredActions } from '@/lib/state/sacred-store';
   
   // Mobile-optimized touch targets (min 44x44px)
   ```

5. Update OracleConversation.tsx:
   ```typescript
   interface OracleConversationProps {
     showHistory?: boolean;
     maxMessages?: number;
     layout?: 'chat' | 'overlay' | 'minimal';
   }
   
   // Connect to oracle state
   import { useOracleState, useSessionState } from '@/lib/state/sacred-store';
   
   // Poetry formatting preserved
   // Non-prescriptive voice maintained
   ```

6. Mobile-first responsive design:
   - Touch-optimized interactions (swipe, pinch, tap)
   - Viewport-aware sizing
   - Reduced motion for accessibility
   - Landscape/portrait adaptation

7. Component composition in Sacred Portal:
   ```typescript
   // /app/oracle-sacred/page.tsx
   export default function SacredPortal() {
     return (
       <div className="h-screen bg-black overflow-hidden">
         <SacredHoloflower 
           fullscreen 
           interactive
           className="absolute inset-0"
         />
         <OracleConversation 
           layout="overlay"
           className="absolute bottom-20 left-0 right-0"
         />
         <SacredMicButton 
           position="bottom"
           size="lg"
           pulseWhenListening
         />
         <SacredAudioSystem />
       </div>
     );
   }
   ```

## Deliver:

1. Updated component files with:
   - Global store integration
   - Mobile-first responsive design
   - TypeScript interfaces
   - Performance optimizations
   
2. Component usage examples for:
   - Sacred Portal (fullscreen)
   - Check-in flow (interactive petals)
   - Journal view (minimal)
   - Timeline (small multiples)
   
3. Import map showing clean paths:
   ```typescript
   // Before: 
   import Holoflower from '../../../components/visualizations/holoflower/HoloflowerViz';
   
   // After:
   import { SacredHoloflower } from '@/components/sacred';
   ```
   
4. Deletion list confirming removed files
```

## Expected Component Structure:

```typescript
// /components/sacred/SacredHoloflower.tsx
'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionState, useAetherState, useAudioState } from '@/lib/state/sacred-store';
import { SACRED_CONFIG } from '@/lib/sacred-config';

interface SacredHoloflowerProps {
  fullscreen?: boolean;
  showLabels?: boolean;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export function SacredHoloflower({
  fullscreen = false,
  showLabels = false,
  interactive = false,
  size = 'md',
  className = ''
}: SacredHoloflowerProps) {
  const { state: motionState, coherence, intensity } = useMotionState();
  const { active: aetherActive, stage: aetherStage } = useAetherState();
  const { enabled: audioEnabled } = useAudioState();
  
  // Sacred geometry calculations
  const petals = [
    'Presence', 'Wisdom', 'Creation', 'Destruction',
    'Order', 'Chaos', 'Power', 'Vulnerability', 
    'Connection', 'Solitude', 'Joy', 'Shadow'
  ];
  
  // Motion orchestration based on state
  const motionVariants = {
    stillness: { scale: 1, rotate: 0 },
    breathing: { 
      scale: [1, 1.05, 1],
      transition: { 
        duration: SACRED_CONFIG.motion.breathingRate / 1000,
        repeat: Infinity 
      }
    },
    expansion: { scale: 1.2, rotate: 15 },
    contraction: { scale: 0.8, rotate: -15 },
    shimmer: {
      scale: [1, 1.02, 0.98, 1],
      rotate: [0, 1, -1, 0],
      transition: {
        duration: SACRED_CONFIG.motion.shimmerSpeed / 1000,
        repeat: Infinity
      }
    },
    breakthrough: {
      scale: [1, 1.5, 1.2],
      rotate: [0, 180, 360],
      transition: { duration: 2 }
    }
  };
  
  // Aether portal effect
  const aetherGradient = aetherActive ? 
    `radial-gradient(circle, ${SACRED_CONFIG.colors.aether} 0%, transparent 70%)` : 
    'none';
  
  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      {/* Aether background */}
      {aetherActive && (
        <motion.div 
          className="absolute inset-0"
          style={{ background: aetherGradient }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
      
      {/* Sacred Holoflower */}
      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        animate={motionVariants[motionState]}
        style={{ filter: `brightness(${0.5 + coherence * 0.5})` }}
      >
        {/* Render 12 petals + center */}
        {petals.map((petal, i) => {
          const angle = (i * 30) - 90; // 12 petals, 30° apart
          const x = 200 + Math.cos(angle * Math.PI / 180) * 120;
          const y = 200 + Math.sin(angle * Math.PI / 180) * 120;
          
          return (
            <motion.circle
              key={petal}
              cx={x}
              cy={y}
              r={40}
              fill={SACRED_CONFIG.colors.sacred}
              opacity={0.3 + coherence * 0.5}
              animate={{
                scale: motionState === 'breathing' ? [1, 1.1, 1] : 1,
                opacity: [0.3 + coherence * 0.5, 0.5 + coherence * 0.5, 0.3 + coherence * 0.5]
              }}
              transition={{
                duration: 3,
                delay: i * 0.1,
                repeat: Infinity
              }}
            />
          );
        })}
        
        {/* Center Aether */}
        <motion.circle
          cx={200}
          cy={200}
          r={aetherStage * 20 + 30}
          fill={SACRED_CONFIG.colors.aether}
          opacity={aetherActive ? 0.8 : 0.2}
          animate={{
            scale: aetherActive ? [1, 1.2, 1] : 1
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      </motion.svg>
      
      {/* Petal labels */}
      {showLabels && petals.map((petal, i) => {
        const angle = (i * 30) - 90;
        const x = 50 + Math.cos(angle * Math.PI / 180) * 35;
        const y = 50 + Math.sin(angle * Math.PI / 180) * 35;
        
        return (
          <div
            key={petal}
            className="absolute text-xs text-white/60"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {petal}
          </div>
        );
      })}
    </div>
  );
}
```