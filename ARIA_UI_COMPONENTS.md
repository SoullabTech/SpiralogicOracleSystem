# 🎨 ARIA UI COMPONENTS DESIGN SYSTEM
## Sophisticated UI/UX for Presence & Trust Dynamics

---

## 🎯 DESIGN PHILOSOPHY

ARIA's UI components follow these principles:
- **Subtle sophistication** over ornate decoration
- **Data elegance** through minimal visualization
- **Sacred geometry** in layout and motion
- **Presence felt** not loudly declared
- **Trust earned** through consistency

---

## 🌟 CORE COMPONENTS

### 1. ARIA PRESENCE INDICATOR

```tsx
// components/ARIAPresenceIndicator.tsx
import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ARIAPresenceIndicatorProps {
  presence: number // 40-90
  trust: number // 0-1
  isActive?: boolean
  minimal?: boolean
  className?: string
}

export function ARIAPresenceIndicator({
  presence,
  trust,
  isActive = true,
  minimal = false,
  className = ''
}: ARIAPresenceIndicatorProps) {
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale')

  // Spring animation for smooth presence changes
  const springPresence = useSpring(presence, { stiffness: 50, damping: 20 })
  const presenceScale = useTransform(springPresence, [40, 90], [0.4, 0.9])

  // Breathing animation
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setBreathPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale')
    }, 4000) // 4 second breathing cycle

    return () => clearInterval(interval)
  }, [isActive])

  if (minimal) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <motion.div
          className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-purple-600"
          animate={{
            scale: breathPhase === 'inhale' ? 1.2 : 0.8,
            opacity: breathPhase === 'inhale' ? 1 : 0.6
          }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <span className="text-sm text-gray-400">
          {presence.toFixed(0)}%
        </span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle,
            rgba(139, 92, 246, ${trust * 0.3}) 0%,
            transparent 70%)`
        }}
        animate={{
          scale: breathPhase === 'inhale' ? 1.1 : 1,
          opacity: breathPhase === 'inhale' ? 0.8 : 0.4
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Main presence circle */}
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="rgba(139, 92, 246, 0.1)"
            strokeWidth="2"
          />

          {/* Presence arc */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="url(#presenceGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(presence - 40) * 5.65} 565`}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center'
            }}
          />

          {/* Trust inner circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="rgba(236, 72, 153, 0.3)"
            strokeWidth="1"
            strokeDasharray={`${trust * 440} 440`}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center'
            }}
          />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="presenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#FCD34D" />
            </linearGradient>
          </defs>

          {/* Center text */}
          <text
            x="100"
            y="90"
            textAnchor="middle"
            className="fill-white text-2xl font-light"
          >
            {presence.toFixed(0)}%
          </text>
          <text
            x="100"
            y="110"
            textAnchor="middle"
            className="fill-gray-400 text-xs uppercase tracking-wider"
          >
            Presence
          </text>
        </svg>
      </div>

      {/* Bottom status */}
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-green-400"
            animate={{
              opacity: [1, 0.3, 1],
              scale: [1, 0.8, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span className="text-xs text-gray-400">
            Trust: {(trust * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  )
}
```

---

### 2. INTELLIGENCE ORCHESTRATOR VISUALIZATION

```tsx
// components/IntelligenceOrchestrator.tsx
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface IntelligenceOrchestratorProps {
  weights: {
    claude: number
    sesame: number
    vault: number
    mycelial: number
    field: number
  }
  presence: number
  className?: string
}

export function IntelligenceOrchestrator({
  weights,
  presence,
  className = ''
}: IntelligenceOrchestratorProps) {
  const [pulsePhase, setPulsePhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 5)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const sources = [
    { key: 'claude', label: 'Claude', color: '#3B82F6', angle: 0 },
    { key: 'sesame', label: 'Sesame', color: '#8B5CF6', angle: 72 },
    { key: 'vault', label: 'Vault', color: '#10B981', angle: 144 },
    { key: 'mycelial', label: 'Network', color: '#F97316', angle: 216 },
    { key: 'field', label: 'Field', color: '#EC4899', angle: 288 }
  ]

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Connection lines */}
        {sources.map((source, i) => {
          const nextSource = sources[(i + 1) % sources.length]
          const weight = weights[source.key as keyof typeof weights]
          const nextWeight = weights[nextSource.key as keyof typeof weights]

          const x1 = 200 + Math.cos(source.angle * Math.PI / 180) * (80 + weight)
          const y1 = 200 + Math.sin(source.angle * Math.PI / 180) * (80 + weight)
          const x2 = 200 + Math.cos(nextSource.angle * Math.PI / 180) * (80 + nextWeight)
          const y2 = 200 + Math.sin(nextSource.angle * Math.PI / 180) * (80 + nextWeight)

          return (
            <motion.line
              key={`line-${source.key}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={source.color}
              strokeWidth="1"
              opacity={0.3}
              animate={{
                opacity: pulsePhase === i ? 0.8 : 0.3,
                strokeWidth: pulsePhase === i ? 2 : 1
              }}
              transition={{ duration: 0.5 }}
            />
          )
        })}

        {/* Source nodes */}
        {sources.map((source, i) => {
          const weight = weights[source.key as keyof typeof weights]
          const x = 200 + Math.cos(source.angle * Math.PI / 180) * (80 + weight)
          const y = 200 + Math.sin(source.angle * Math.PI / 180) * (80 + weight)

          return (
            <g key={source.key}>
              {/* Glow effect */}
              <motion.circle
                cx={x}
                cy={y}
                r={weight / 2 + 10}
                fill={source.color}
                opacity={0.2}
                animate={{
                  r: pulsePhase === i ? weight / 2 + 15 : weight / 2 + 10,
                  opacity: pulsePhase === i ? 0.4 : 0.2
                }}
                transition={{ duration: 0.5 }}
              />

              {/* Main node */}
              <motion.circle
                cx={x}
                cy={y}
                r={weight / 3 + 5}
                fill={source.color}
                animate={{
                  scale: pulsePhase === i ? 1.2 : 1
                }}
                transition={{ duration: 0.5 }}
              />

              {/* Label */}
              <text
                x={x}
                y={y - weight / 3 - 10}
                textAnchor="middle"
                className="fill-white text-xs font-light"
              >
                {source.label}
              </text>
              <text
                x={x}
                y={y}
                textAnchor="middle"
                className="fill-white text-xs font-bold"
              >
                {weight}%
              </text>
            </g>
          )
        })}

        {/* Center core */}
        <motion.circle
          cx="200"
          cy="200"
          r={presence / 2}
          fill="url(#coreGradient)"
          opacity={0.8}
          animate={{
            r: presence / 2 + Math.sin(pulsePhase) * 5
          }}
          transition={{ duration: 1 }}
        />

        <text
          x="200"
          y="200"
          textAnchor="middle"
          className="fill-white text-lg font-light"
        >
          ARIA
        </text>

        {/* Gradient definitions */}
        <defs>
          <radialGradient id="coreGradient">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}
```

---

### 3. TRUST DYNAMICS TIMELINE

```tsx
// components/TrustDynamicsDisplay.tsx
import { motion } from 'framer-motion'

interface TrustDynamicsProps {
  trust: number // 0-1
  presence: number // 40-90
  sessions: number
  className?: string
}

export function TrustDynamicsDisplay({
  trust,
  presence,
  sessions,
  className = ''
}: TrustDynamicsProps) {
  const trustStages = [
    { threshold: 0, label: 'Initial Contact', color: '#6B7280' },
    { threshold: 0.25, label: 'Recognition', color: '#3B82F6' },
    { threshold: 0.5, label: 'Building', color: '#8B5CF6' },
    { threshold: 0.75, label: 'Established', color: '#EC4899' },
    { threshold: 0.9, label: 'Deep Bond', color: '#FCD34D' }
  ]

  const currentStage = trustStages.reduce((prev, curr) =>
    trust >= curr.threshold ? curr : prev
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Timeline visualization */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${trust * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="relative flex justify-between">
          {trustStages.map((stage, i) => {
            const isActive = trust >= stage.threshold
            const isCurrent = currentStage.label === stage.label

            return (
              <motion.div
                key={stage.label}
                className="flex flex-col items-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <motion.div
                  className={`w-4 h-4 rounded-full border-2 ${
                    isActive ? 'bg-white' : 'bg-gray-900'
                  }`}
                  style={{ borderColor: stage.color }}
                  animate={isCurrent ? {
                    scale: [1, 1.3, 1],
                    boxShadow: [
                      `0 0 0 0 ${stage.color}40`,
                      `0 0 0 8px ${stage.color}40`,
                      `0 0 0 0 ${stage.color}40`
                    ]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: isCurrent ? Infinity : 0
                  }}
                />
                <span className="mt-2 text-xs text-gray-400 text-center max-w-[80px]">
                  {stage.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-2xl font-light text-purple-400">
            {(trust * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Trust Level
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-2xl font-light text-pink-400">
            {sessions}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Sessions
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-2xl font-light text-yellow-400">
            {presence.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            Presence
          </div>
        </motion.div>
      </div>

      {/* Relationship status */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-300">
            Relationship Status
          </span>
          <span className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: `${currentStage.color}20`, color: currentStage.color }}>
            {currentStage.label}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          ARIA has developed a {currentStage.label.toLowerCase()} level relationship
          with you over {sessions} sessions, maintaining {presence.toFixed(0)}% presence.
        </p>
      </div>
    </div>
  )
}
```

---

### 4. ELEMENTAL SELECTOR WITH ARIA STATUS

```tsx
// components/ElementalSelector.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface ElementalSelectorProps {
  activeElement: string
  ariaPresence: number
  onSelect: (element: string) => void
  className?: string
}

export function ElementalSelector({
  activeElement,
  ariaPresence,
  onSelect,
  className = ''
}: ElementalSelectorProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)

  const elements = [
    { id: 'fire', name: 'Fire', emoji: '🔥', color: '#EF4444', gradient: 'from-red-500 to-orange-500' },
    { id: 'water', name: 'Water', emoji: '💧', color: '#3B82F6', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'earth', name: 'Earth', emoji: '🌍', color: '#10B981', gradient: 'from-green-500 to-emerald-500' },
    { id: 'air', name: 'Air', emoji: '💨', color: '#94A3B8', gradient: 'from-gray-400 to-blue-400' },
    { id: 'aether', name: 'Aether', emoji: '✨', color: '#8B5CF6', gradient: 'from-purple-500 to-pink-500' }
  ]

  return (
    <div className={`flex justify-center gap-4 ${className}`}>
      {elements.map((element) => {
        const isActive = activeElement === element.id
        const isHovered = hoveredElement === element.id

        return (
          <motion.button
            key={element.id}
            onClick={() => onSelect(element.id)}
            onHoverStart={() => setHoveredElement(element.id)}
            onHoverEnd={() => setHoveredElement(null)}
            className="relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Background glow */}
            <AnimatePresence>
              {(isActive || isHovered) && (
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${element.gradient} rounded-2xl blur-xl`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.4, scale: 1.2 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>

            {/* Element card */}
            <div className={`relative w-24 h-24 bg-gray-900/80 backdrop-blur-sm rounded-2xl border-2 transition-all ${
              isActive ? 'border-white' : 'border-gray-700 hover:border-gray-500'
            }`}>
              {/* ARIA presence indicator for active element */}
              {isActive && (
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <span className="text-xs font-bold text-purple-400">
                    {ariaPresence}%
                  </span>
                </motion.div>
              )}

              {/* Element content */}
              <div className="flex flex-col items-center justify-center h-full">
                <motion.div
                  className="text-3xl mb-1"
                  animate={isActive ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: isActive ? Infinity : 0,
                    repeatDelay: 3
                  }}
                >
                  {element.emoji}
                </motion.div>
                <span className={`text-xs font-semibold ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}>
                  {element.name}
                </span>
              </div>

              {/* Active indicator line */}
              {isActive && (
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${element.gradient} rounded-b-2xl`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
```

---

### 5. ARCHETYPE STATUS INDICATOR

```tsx
// components/ArchetypeStatus.tsx
import { motion, AnimatePresence } from 'framer-motion'

interface ArchetypeStatusProps {
  activeArchetypes: string[]
  emergingArchetype?: string | null
  className?: string
}

export function ArchetypeStatus({
  activeArchetypes,
  emergingArchetype,
  className = ''
}: ArchetypeStatusProps) {
  const allArchetypes = [
    { id: 'sage', name: 'Sage', icon: '🦉', color: '#8B5CF6' },
    { id: 'shadow', name: 'Shadow', icon: '🌑', color: '#1F2937' },
    { id: 'trickster', name: 'Trickster', icon: '🎭', color: '#F59E0B' },
    { id: 'sacred', name: 'Sacred', icon: '⭐', color: '#FCD34D' },
    { id: 'guardian', name: 'Guardian', icon: '🛡️', color: '#10B981' }
  ]

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-400">Active Archetypes</span>
        {emergingArchetype && (
          <motion.span
            className="text-xs px-2 py-1 bg-purple-900/50 rounded-full text-purple-300"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [1, 0.5, 1], scale: 1 }}
            transition={{ opacity: { duration: 2, repeat: Infinity } }}
          >
            Discovering: {emergingArchetype}
          </motion.span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {allArchetypes.map((archetype) => {
            const isActive = activeArchetypes.includes(archetype.id)
            const isEmerging = emergingArchetype === archetype.id

            if (!isActive && !isEmerging) return null

            return (
              <motion.div
                key={archetype.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: isEmerging ? [1, 0.5, 1] : 1,
                  scale: 1
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  opacity: isEmerging ? { duration: 2, repeat: Infinity } : { duration: 0.3 },
                  scale: { type: "spring", stiffness: 500, damping: 30 }
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border ${
                  isEmerging
                    ? 'bg-purple-900/30 border-purple-500/50'
                    : 'bg-gray-900/50 border-gray-700'
                }`}
                style={{
                  borderColor: isActive && !isEmerging ? `${archetype.color}50` : undefined
                }}
              >
                <span className="text-sm">{archetype.icon}</span>
                <span className="text-xs font-medium text-gray-300">
                  {archetype.name}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
```

---

## 🎨 DESIGN TOKENS

### Color System
```css
/* ARIA Brand Colors */
--aria-primary: #8B5CF6;      /* Purple */
--aria-secondary: #EC4899;    /* Pink */
--aria-tertiary: #FCD34D;     /* Gold */

/* Intelligence Source Colors */
--claude: #3B82F6;      /* Blue */
--sesame: #8B5CF6;      /* Purple */
--vault: #10B981;       /* Green */
--mycelial: #F97316;    /* Orange */
--field: #EC4899;       /* Pink */

/* Element Colors */
--fire: #EF4444;
--water: #3B82F6;
--earth: #10B981;
--air: #94A3B8;
--aether: #8B5CF6;

/* UI Colors */
--bg-primary: #000000;
--bg-secondary: #0A0A0A;
--bg-tertiary: #111111;
--border: rgba(255, 255, 255, 0.1);
--text-primary: #FFFFFF;
--text-secondary: #9CA3AF;
--text-tertiary: #6B7280;
```

### Typography
```css
/* Font Stack */
--font-primary: 'Inter', -apple-system, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;

/* Font Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### Spacing
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Animation
```css
/* Transitions */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-breathing: 4000ms ease-in-out;

/* Spring Animations */
--spring-bouncy: stiffness: 500, damping: 30;
--spring-smooth: stiffness: 100, damping: 20;
--spring-slow: stiffness: 50, damping: 20;
```

---

## 🌟 USAGE EXAMPLES

### Complete Oracle Interface with ARIA
```tsx
import { ARIAPresenceIndicator } from '@/components/ARIAPresenceIndicator'
import { IntelligenceOrchestrator } from '@/components/IntelligenceOrchestrator'
import { TrustDynamicsDisplay } from '@/components/TrustDynamicsDisplay'
import { ElementalSelector } from '@/components/ElementalSelector'
import { ArchetypeStatus } from '@/components/ArchetypeStatus'

export function OracleInterface() {
  const [presence, setPresence] = useState(70)
  const [trust, setTrust] = useState(0.5)
  const [activeElement, setActiveElement] = useState('fire')
  const [activeArchetypes] = useState(['sage', 'trickster'])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <ARIAPresenceIndicator
          presence={presence}
          trust={trust}
          minimal={true}
        />
        <ArchetypeStatus
          activeArchetypes={activeArchetypes}
        />
      </div>

      {/* Main Oracle Area */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Panel - Intelligence */}
        <div className="col-span-3">
          <IntelligenceOrchestrator
            weights={{
              claude: 30,
              sesame: 20,
              vault: 20,
              mycelial: 15,
              field: 15
            }}
            presence={presence}
          />
        </div>

        {/* Center - Oracle Chat */}
        <div className="col-span-6">
          <ElementalSelector
            activeElement={activeElement}
            ariaPresence={presence}
            onSelect={setActiveElement}
            className="mb-8"
          />
          {/* Chat interface here */}
        </div>

        {/* Right Panel - Trust */}
        <div className="col-span-3">
          <TrustDynamicsDisplay
            trust={trust}
            presence={presence}
            sessions={12}
          />
        </div>
      </div>
    </div>
  )
}
```

---

*ARIA UI Components v1.0 | Sophisticated Consciousness Visualization*