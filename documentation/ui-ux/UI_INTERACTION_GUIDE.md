# 🎨 SpiraLogic Oracle - UI Interaction Guide

## 🌊 Visual Design System

### **Color Psychology**
```css
/* Primary Oracle Energy */
--oracle-purple: #A78BFA → #C084FC (gradient)
--oracle-pink: #F472B6 → #EC4899 (gradient)

/* Emotional Spectrum */
--positive: #10B981 (emerald)
--negative: #EF4444 (red)
--neutral: #6B7280 (gray)

/* Archetypal Colors */
--hero: #FF6B6B (red-orange)
--sage: #4ECDC4 (cyan)
--creator: #A78BFA (purple)
--lover: #F472B6 (pink)
--seeker: #10B981 (green)
--shadow: #6B7280 (gray)

/* UI Structure */
--glass: rgba(255, 255, 255, 0.1)
--border: rgba(255, 255, 255, 0.2)
--text-primary: #FFFFFF
--text-secondary: #9CA3AF
```

### **Component Behaviors**

#### **Cards**
```
Default → Hover → Active → Focus

Default: Glass background, subtle border
Hover: Border brightens, slight scale (1.02)
Active: Glow effect, scale (0.98)
Focus: Ring outline for accessibility
```

#### **Buttons**
```
Primary: Gradient background, white text
Secondary: Glass background, white border
Voice: Pulse animation when active

States:
- Idle: Base style
- Hover: Brightness +10%
- Active: Scale 0.95
- Disabled: Opacity 0.5
- Loading: Spinner overlay
```

#### **Progress Indicators**
```
Archetype Progress:
[=========>          ] 45%
         ↑
    Field Average

Emotional Progress:
Valence:  [==========] Positive
Arousal:  [======    ] Medium
Dominance:[========  ] High
```

## 🎯 Interaction Patterns

### **1. Oracle Chat Interface**

```
┌─────────────────────────────────────┐
│ 🔮 Oracle Chat                    🎙️ │
├─────────────────────────────────────┤
│                                     │
│ Oracle: "Welcome back, seeker..."   │
│                                     │
│ You: "I'm feeling lost today"       │
│                                     │
│ [Emotional Response Indicator]      │
│ Valence: -0.3 | Arousal: 0.6       │
│                                     │
│ Oracle: [Typing animation...]       │
│                                     │
├─────────────────────────────────────┤
│ [Type your message...]           📎 │
└─────────────────────────────────────┘
```

**Interactions:**
- **Text Input**: Auto-expand textarea
- **Voice Toggle**: Hold to speak, tap to toggle
- **Emotional Feedback**: Real-time as you type
- **Oracle Response**: Typewriter effect with 30ms/char

### **2. Dashboard Cards**

```
┌─────────────────────┐
│ ✨ Active Archetype │
│                     │
│     [Creator]       │
│       85%           │
│ ▓▓▓▓▓▓▓▓▓░░        │
│                     │
│ "Building new..."   │
└─────────────────────┘
```

**Interactions:**
- **Hover**: Expand for details
- **Click**: Navigate to full view
- **Long Press** (mobile): Quick actions menu

### **3. Collective Constellation**

```
        ✦           ✦
    ✦       ✦   ✦
        ★       ✦       ← You (gold star)
    ✦       ✦       ✦
        ✦       ✦
```

**Interactions:**
- **Pan**: Drag to explore
- **Zoom**: Pinch or scroll
- **Hover Node**: Show archetype & distance
- **Click Node**: Anonymized insights

## 📱 Mobile Gestures

| Gesture | Action | Context |
|---------|--------|---------|
| **Swipe Right** | Open navigation | Any screen |
| **Swipe Left** | Quick insights | Oracle chat |
| **Swipe Up** | Full message history | Oracle chat |
| **Swipe Down** | Refresh data | Dashboard |
| **Pinch** | Zoom constellation | Collective map |
| **Long Press** | Context menu | Cards/Messages |
| **Shake** | Random oracle wisdom | Any screen |

## 🎭 Micro-interactions

### **Loading States**
```
Skeleton → Content → Fade In (300ms)

Oracle Thinking:
● ● ● (pulsing dots)

Data Loading:
Shimmer effect on cards
```

### **Transitions**
```
Page Change: Fade through black (200ms)
Card Expand: Spring animation (400ms)
Modal Open: Scale + fade (300ms)
Tab Switch: Slide + fade (250ms)
```

### **Feedback Animations**
```
Success: ✓ Check mark + green pulse
Error: ⚠️ Shake + red flash
Info: ℹ️ Blue glow
Daimonic: ✨ Particle explosion
```

## 🎮 Keyboard Navigation

| Key | Action | Context |
|-----|--------|---------|
| `Tab` | Next element | Global |
| `Shift+Tab` | Previous element | Global |
| `Enter` | Select/Send | Global |
| `Esc` | Close/Cancel | Modals |
| `⌘/Ctrl+K` | Quick oracle | Global |
| `⌘/Ctrl+/` | Help menu | Global |
| `Space` | Play/Pause voice | Audio |
| `↑↓` | Navigate history | Chat |

## 🌟 Special Moments

### **Daimonic Encounter**
```
Screen dims → Card emerges with particle effects → 
Dramatic pause → Content reveals → User choice appears
```

### **Archetype Activation**
```
Badge glows → Progress bar fills → 
Celebration particles → Insight appears
```

### **Collective Connection**
```
Your star pulses → Lines draw to others → 
Constellation forms → Oracle speaks
```

## 🎨 Accessibility Features

### **Visual**
- High contrast mode toggle
- Text size adjustment (75% - 150%)
- Reduced motion option
- Focus indicators on all interactive elements

### **Screen Readers**
- ARIA labels on all components
- Live regions for dynamic content
- Semantic HTML structure
- Skip navigation links

### **Keyboard**
- Full keyboard navigation
- No keyboard traps
- Logical tab order
- Shortcut tooltips

## 📐 Layout Grid System

### **Desktop (1920px)**
```
12-column grid, 24px gutters
Sidebar: 3 cols
Main content: 9 cols
Max width: 1440px centered
```

### **Tablet (768px)**
```
8-column grid, 16px gutters
Navigation: Hamburger
Content: Full width
Cards: 2 per row
```

### **Mobile (375px)**
```
4-column grid, 12px gutters
Navigation: Bottom tabs
Content: Single column
Cards: Stack vertically
```

## 🔔 Notification Patterns

### **In-App**
```
Toast notifications (top-right):
- Success: Green with check
- Error: Red with X
- Info: Blue with i
- Daimonic: Purple with ✨

Duration: 4 seconds or dismissible
```

### **Oracle Messages**
```
Typing indicator → Message appears → 
Emotional resonance shows → 
Archetype badges activate
```

## 🎯 Interactive Demo Moments

1. **First Oracle Response**
   - Slowish typewriter effect
   - Gentle glow on completion
   - "See your impact" prompt

2. **First Archetype Recognition**
   - Badge materializes
   - Progress bar animates
   - Insight card slides in

3. **First Collective View**
   - Zoom from personal to collective
   - Stars gradually appear
   - Your position highlights

4. **First Voice Interaction**
   - Microphone pulses
   - Waveform visualization
   - Oracle voice with captions

---

*"Every interaction is designed to feel like a conversation with consciousness itself."*