# Soullab UI Foundations
*The complete design system for threshold experience architecture*

## Overview
This document defines the foundational UI architecture for Soullab, establishing the sacred spiral logo as the living heart of a Claude/ChatGPT-inspired interface that feels both familiar and transcendent.

## Core Identity System

### Sacred Spiral Logo
- **Primary Asset**: `/public/sacred-logo.svg`
- **Sacred Gold**: `#FFD700` (threshold color)
- **Role**: Living compass and threshold symbol
- **States**: Entry, Presence, Thinking, Transitioning

### Elemental Color System
```css
:root {
  /* Sacred Gold (Primary Brand) */
  --sacred-gold: #FFD700;
  --sacred-gold-muted: rgba(255, 215, 0, 0.15);
  --sacred-gold-glow: rgba(255, 215, 0, 0.4);
  
  /* Fire Element */
  --fire-primary: #FF6B6B;
  --fire-secondary: #ff8a80;
  --fire-glow: rgba(255, 107, 107, 0.3);
  
  /* Water Element */
  --water-primary: #4ECDC4;
  --water-secondary: #80cbc4;
  --water-glow: rgba(78, 205, 196, 0.3);
  
  /* Earth Element */
  --earth-primary: #95E77E;
  --earth-secondary: #aed581;
  --earth-glow: rgba(149, 231, 126, 0.3);
  
  /* Air Element */
  --air-primary: #FFE66D;
  --air-secondary: #fff59d;
  --air-glow: rgba(255, 230, 109, 0.3);
  
  /* Aether Element */
  --aether-primary: #B57EDC;
  --aether-secondary: #ce93d8;
  --aether-glow: rgba(181, 126, 220, 0.3);
  
  /* Base Neutrals (Apple-inspired) */
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-200: #e5e5e5;
  --neutral-300: #d4d4d4;
  --neutral-400: #a3a3a3;
  --neutral-500: #737373;
  --neutral-600: #525252;
  --neutral-700: #404040;
  --neutral-800: #262626;
  --neutral-900: #171717;
  --neutral-950: #0a0a0a;
}
```

## Layout Architecture

### Desktop Layout (1200px+)
```
┌─────────────────────────────────────────┐
│ ┌─────┐                                 │
│ │ 🌀  │  Main Content Area              │
│ │     │                                 │
│ │ 🔮  │                                 │
│ │ 🌀  │                                 │
│ │ 📓  │                                 │
│ │ 🎚   │                                 │
│ │     │                                 │
│ │ 👤  │  ┌─────────────────────────────┐ │
│ └─────┘  │    Input Bar + Actions       │ │
│          └─────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Mobile Layout (<768px)
```
┌─────────────────────────────────┐
│  🌀 Soul Lab              ☰     │
├─────────────────────────────────┤
│                                 │
│     Main Content Area           │
│                                 │
├─────────────────────────────────┤
│  ┌─────────────────────────────┐ │
│  │    Input Bar + Actions       │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Left Sidebar Design

### Structure & Elemental Aura Colors
```typescript
interface SidebarSection {
  icon: ReactNode;
  label: string;
  path: string;
  element: 'mirror' | 'spiral' | 'journal' | 'attune';
  auraColor: string;
  glowColor: string;
  description: string;
  badge?: number;
}

const sidebarSections: SidebarSection[] = [
  { 
    icon: <Mirror />, 
    label: 'Mirror', 
    path: '/mirror', 
    element: 'mirror',
    auraColor: '#B57EDC', // Purple glow - Aether element
    glowColor: 'rgba(181, 126, 220, 0.3)',
    description: 'Conversations with Maya'
  },
  { 
    icon: <Spiral />, 
    label: 'Spiral', 
    path: '/spiral', 
    element: 'spiral',
    auraColor: '#4ECDC4', // Blue glow - Water element
    glowColor: 'rgba(78, 205, 196, 0.3)', 
    description: 'Your journey map'
  },
  { 
    icon: <BookOpen />, 
    label: 'Journal', 
    path: '/journal', 
    element: 'journal',
    auraColor: '#FFD700', // Gold glow - Sacred gold
    glowColor: 'rgba(255, 215, 0, 0.3)',
    description: 'Private reflections'
  },
  { 
    icon: <Sliders />, 
    label: 'Attune', 
    path: '/attune', 
    element: 'attune',
    auraColor: '#95E77E', // Green glow - Earth element
    glowColor: 'rgba(149, 231, 126, 0.3)',
    description: 'Personal settings'
  }
];
```

### Desktop Sidebar (240px width)
```css
.soullab-sidebar {
  width: 240px;
  height: 100vh;
  background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);
  border-right: 1px solid var(--neutral-200);
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--neutral-200);
}

.sidebar-nav {
  flex: 1;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.sidebar-item:hover {
  background: var(--neutral-100);
}

.sidebar-item.active {
  background: var(--sacred-gold-muted);
  box-shadow: 0 0 0 1px var(--sacred-gold);
}

/* Elemental Aura Effects */
.sidebar-item.active.mirror {
  background: rgba(181, 126, 220, 0.1);
  box-shadow: 0 0 12px rgba(181, 126, 220, 0.3), 0 0 0 1px #B57EDC;
}

.sidebar-item.active.spiral {
  background: rgba(78, 205, 196, 0.1);
  box-shadow: 0 0 12px rgba(78, 205, 196, 0.3), 0 0 0 1px #4ECDC4;
}

.sidebar-item.active.journal {
  background: rgba(255, 215, 0, 0.1);
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.3), 0 0 0 1px #FFD700;
}

.sidebar-item.active.attune {
  background: rgba(149, 231, 126, 0.1);
  box-shadow: 0 0 12px rgba(149, 231, 126, 0.3), 0 0 0 1px #95E77E;
}

/* Hover Effects with Elemental Preview */
.sidebar-item.mirror:hover {
  background: rgba(181, 126, 220, 0.05);
  box-shadow: 0 0 6px rgba(181, 126, 220, 0.15);
}

.sidebar-item.spiral:hover {
  background: rgba(78, 205, 196, 0.05);
  box-shadow: 0 0 6px rgba(78, 205, 196, 0.15);
}

.sidebar-item.journal:hover {
  background: rgba(255, 215, 0, 0.05);
  box-shadow: 0 0 6px rgba(255, 215, 0, 0.15);
}

.sidebar-item.attune:hover {
  background: rgba(149, 231, 126, 0.05);
  box-shadow: 0 0 6px rgba(149, 231, 126, 0.15);
}

.sidebar-user {
  padding: 20px;
  border-top: 1px solid var(--neutral-200);
  display: flex;
  align-items: center;
  gap: 12px;
}
```

### Mobile Sidebar (Drawer)
```css
.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: white;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.mobile-sidebar.open {
  transform: translateX(0);
}

.mobile-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Mobile Bottom Navigation */
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--neutral-200);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 16px;
  z-index: 100;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  min-width: 64px;
}

.mobile-nav-icon {
  width: 24px;
  height: 24px;
  color: var(--neutral-500);
  transition: all 0.2s ease;
}

.mobile-nav-label {
  font-size: 10px;
  color: var(--neutral-500);
  font-weight: 500;
  transition: all 0.2s ease;
}

/* Mobile Active States with Aura */
.mobile-nav-item.active.mirror {
  background: rgba(181, 126, 220, 0.1);
}

.mobile-nav-item.active.mirror .mobile-nav-icon {
  color: #B57EDC;
  filter: drop-shadow(0 0 4px rgba(181, 126, 220, 0.4));
}

.mobile-nav-item.active.spiral {
  background: rgba(78, 205, 196, 0.1);
}

.mobile-nav-item.active.spiral .mobile-nav-icon {
  color: #4ECDC4;
  filter: drop-shadow(0 0 4px rgba(78, 205, 196, 0.4));
}

.mobile-nav-item.active.journal {
  background: rgba(255, 215, 0, 0.1);
}

.mobile-nav-item.active.journal .mobile-nav-icon {
  color: #FFD700;
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.4));
}

.mobile-nav-item.active.attune {
  background: rgba(149, 231, 126, 0.1);
}

.mobile-nav-item.active.attune .mobile-nav-icon {
  color: #95E77E;
  filter: drop-shadow(0 0 4px rgba(149, 231, 126, 0.4));
}

.mobile-nav-item.active .mobile-nav-label {
  color: inherit;
}

/* Mobile Floating Logo (appears during transitions) */
.mobile-floating-logo {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  opacity: 0;
  z-index: 200;
  transition: all 0.3s ease;
}

.mobile-floating-logo.visible {
  opacity: 0.8;
}
```

## Input Bar System

### Claude/ChatGPT-Inspired Design
```css
.soullab-input-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 300px); /* Desktop: account for sidebar */
  max-width: 800px;
  z-index: 100;
}

.soullab-input-bar {
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-end;
  padding: 12px 16px;
  gap: 12px;
  min-height: 48px;
}

.soullab-textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-size: 16px;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  max-height: 200px;
  overflow-y: auto;
}

.soullab-input-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-control-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.input-control-button:hover {
  background: var(--neutral-100);
}

.input-control-button.active {
  background: var(--sacred-gold-muted);
  color: var(--sacred-gold);
}
```

### Adaptive Greeting System
```typescript
interface GreetingState {
  trustLevel: 'first' | 'mid' | 'high';
  userName?: string;
  dominantElement?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}

const generateGreeting = (state: GreetingState): string => {
  const { trustLevel, userName, dominantElement, timeOfDay } = state;
  
  switch (trustLevel) {
    case 'first':
      return `✨ Hi ${userName || 'there'}, how's it going today?`;
    case 'mid':
      return `🌊 How are you feeling this ${timeOfDay}?`;
    case 'high':
      return `🔥 Welcome back, ${userName} — still carrying ${dominantElement} energy?`;
    default:
      return `How can I help you today?`;
  }
};
```

### Action Buttons (Claude-style)
```typescript
const quickActions = [
  { icon: <Crystal />, label: 'Reflect', prompt: 'Help me reflect on...' },
  { icon: <BookOpen />, label: 'Learn', prompt: 'Teach me about...' },
  { icon: <Wrench />, label: 'Create', prompt: 'Help me create...' },
  { icon: <Seedling />, label: 'Life Stuff', prompt: 'I need help with...' },
  { icon: <Search />, label: 'Explore', prompt: 'Let\'s explore...' }
];
```

```css
.quick-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.quick-action {
  padding: 8px 16px;
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.quick-action:hover {
  background: var(--neutral-50);
  border-color: var(--sacred-gold);
}
```

### Mobile Input Adaptations
```css
@media (max-width: 768px) {
  .soullab-input-container {
    bottom: 10px;
    width: calc(100% - 20px);
    left: 10px;
    transform: none;
  }
  
  .mobile-input-controls-collapsed {
    position: relative;
  }
  
  .mobile-controls-menu {
    position: absolute;
    bottom: 100%;
    right: 0;
    background: white;
    border: 1px solid var(--neutral-200);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 8px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 8px;
  }
}
```

## Navigation Transitions & Thresholds

### Section Transition Animation (Desktop & Mobile)
```typescript
// Threshold crossing animation when switching sections
const sectionTransition = {
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.15, ease: "easeIn" }
  },
  enter: {
    opacity: [0, 1],
    x: [20, 0],
    transition: { duration: 0.2, ease: "easeOut", delay: 0.05 }
  }
};

// Logo pulse during section transitions  
const logoTransitionPulse = {
  scale: [1, 1.1, 1],
  opacity: [0.8, 1, 0.8],
  transition: { duration: 0.3, ease: "easeInOut" }
};

// Mobile floating logo animation
const mobileFloatingLogo = {
  initial: { opacity: 0, y: -10, scale: 0.8 },
  animate: { opacity: 0.8, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.8 },
  transition: { duration: 0.25, ease: "easeOut" }
};
```

### Aura Animation System
```css
/* Threshold glow effects */
@keyframes aura-pulse-purple {
  0%, 100% { box-shadow: 0 0 8px rgba(181, 126, 220, 0.2); }
  50% { box-shadow: 0 0 16px rgba(181, 126, 220, 0.4), 0 0 32px rgba(181, 126, 220, 0.1); }
}

@keyframes aura-pulse-blue {
  0%, 100% { box-shadow: 0 0 8px rgba(78, 205, 196, 0.2); }
  50% { box-shadow: 0 0 16px rgba(78, 205, 196, 0.4), 0 0 32px rgba(78, 205, 196, 0.1); }
}

@keyframes aura-pulse-gold {
  0%, 100% { box-shadow: 0 0 8px rgba(255, 215, 0, 0.2); }
  50% { box-shadow: 0 0 16px rgba(255, 215, 0, 0.4), 0 0 32px rgba(255, 215, 0, 0.1); }
}

@keyframes aura-pulse-green {
  0%, 100% { box-shadow: 0 0 8px rgba(149, 231, 126, 0.2); }
  50% { box-shadow: 0 0 16px rgba(149, 231, 126, 0.4), 0 0 32px rgba(149, 231, 126, 0.1); }
}

/* Apply aura pulse on active states */
.sidebar-item.active.mirror {
  animation: aura-pulse-purple 3s ease-in-out infinite;
}

.sidebar-item.active.spiral {
  animation: aura-pulse-blue 3s ease-in-out infinite;
}

.sidebar-item.active.journal {
  animation: aura-pulse-gold 3s ease-in-out infinite;
}

.sidebar-item.active.attune {
  animation: aura-pulse-green 3s ease-in-out infinite;
}
```

### Navigation Timing Specifications
```css
:root {
  /* Transition Timing */
  --nav-fade-duration: 150ms;
  --nav-slide-duration: 200ms;
  --nav-logo-pulse-duration: 300ms;
  --nav-aura-pulse-duration: 3s;
  
  /* Easing Functions */
  --nav-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --nav-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --nav-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Threshold Effects */
  --threshold-glow-soft: 0 0 8px;
  --threshold-glow-medium: 0 0 16px;
  --threshold-glow-intense: 0 0 32px;
}
```

## Logo Motion Integration

### Onboarding Sequence
```typescript
const OnboardingLogoMotion = {
  initial: { scale: 0, rotate: -180, opacity: 0 },
  unfurl: {
    scale: [0, 0.1, 1.2, 1],
    rotate: [0, 90, 720, 720],
    opacity: [0, 0.3, 0.8, 1],
    transition: { duration: 1.5, ease: "easeOut" }
  },
  breathe: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
};
```

### Sidebar Logo Presence
```css
.sidebar-logo-presence {
  width: 32px;
  height: 32px;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.sidebar-logo-presence.maya-active {
  animation: sacred-pulse 2s ease-in-out infinite;
  filter: drop-shadow(0 0 8px var(--sacred-gold-glow));
}

@keyframes sacred-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}
```

### Thinking Indicator
```css
.thinking-spiral {
  width: 24px;
  height: 24px;
  animation: thinking-rotation 3s linear infinite;
}

.thinking-spiral.elemental-fire {
  filter: drop-shadow(0 0 6px var(--fire-glow));
}

.thinking-spiral.elemental-water {
  filter: drop-shadow(0 0 6px var(--water-glow));
}

@keyframes thinking-rotation {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## Component Architecture

### Core Layout Components
```typescript
// Main layout wrapper
export const SoullabLayout: React.FC<{children: ReactNode}>;

// Sidebar navigation
export const SoullabSidebar: React.FC<{sections: SidebarSection[]}>;

// Input system
export const SoullabInputBar: React.FC<{onSubmit: (message: string) => void}>;

// Logo states
export const SoullabLogo: React.FC<{
  variant: 'entry' | 'presence' | 'thinking';
  element?: ElementType;
  size?: number;
}>;
```

### Usage Examples
```tsx
// Main App Layout
<SoullabLayout>
  <SoullabSidebar sections={navigationSections} />
  <main className="flex-1 relative">
    {/* Page content */}
    <SoullabInputBar onSubmit={handleMessage} />
  </main>
</SoullabLayout>

// Onboarding Screen
<div className="onboarding-screen">
  <SoullabLogo variant="entry" />
  <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.5, duration: 0.8 }}
  >
    ✨ Welcome to Soullab
  </motion.h1>
</div>

// Thinking State
<div className="thinking-container">
  <SoullabLogo variant="thinking" element="fire" />
  <span>Maya is reflecting...</span>
</div>
```

## Responsive Breakpoints
```css
/* Mobile First Approach */
.soullab-responsive {
  /* Mobile: 320px - 767px */
  @media (max-width: 767px) {
    /* Drawer sidebar, full-width input */
  }
  
  /* Tablet: 768px - 1023px */
  @media (min-width: 768px) and (max-width: 1023px) {
    /* Collapsed sidebar, medium input */
  }
  
  /* Desktop: 1024px+ */
  @media (min-width: 1024px) {
    /* Full sidebar, optimal input width */
  }
  
  /* Large Desktop: 1440px+ */
  @media (min-width: 1440px) {
    /* Maximum content width constraints */
  }
}
```

## Accessibility Considerations
```css
/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .soullab-logo,
  .thinking-spiral,
  .sacred-pulse {
    animation: none !important;
    transition: opacity 0.2s ease;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --sacred-gold: #000;
    --neutral-200: #000;
    --neutral-100: #fff;
  }
}

/* Focus management */
.soullab-input-bar:focus-within {
  outline: 2px solid var(--sacred-gold);
  outline-offset: 2px;
}

.sidebar-item:focus {
  outline: 2px solid var(--sacred-gold);
  outline-offset: -2px;
}
```

## Implementation Priority
1. ✅ **Logo Motion System** - Core brand identity
2. 🔄 **Sidebar Navigation** - Essential architecture  
3. 🔄 **Input Bar System** - Primary interaction
4. ⏳ **Mobile Adaptations** - Cross-device experience
5. ⏳ **Accessibility Polish** - Inclusive design

This foundation provides developers with a complete blueprint for implementing Soullab's threshold experience, combining familiar interaction patterns with sacred design elements.