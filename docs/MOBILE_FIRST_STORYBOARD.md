# Soullab Beta - Mobile-First Storyboard

**Version 1.0 — Mobile-First User Journey Design**  
*Optimized for Figma Make rapid prototyping*

---

## 📱 **Mobile-First Philosophy**

This storyboard prioritizes **touch-native interactions** and **thumb-zone optimization**. Every screen is designed for one-handed use with the most important actions within easy reach of the thumb on both small (iPhone SE) and large (iPhone 15 Pro Max) devices.

### Core Design Principles:
- **Thumb-Zone First**: Critical actions within 75% of screen height
- **Touch Targets**: Minimum 44px, optimal 60px for primary actions
- **Gesture-Native**: Swipe, tap, hold, and pinch feel natural
- **Progressive Disclosure**: Start simple, reveal complexity as needed
- **Breathing Room**: Generous spacing for fat-finger friendliness

---

## 🎬 **Complete User Journey Storyboard**

### **Frame 1: Discovery & Landing**
*First impression on mobile*

**Screen Composition:**
```
┌─────────────────────────┐
│     [Soullab Logo]      │ ← Breathing animation
│                         │
│  🌟 Sacred Technology   │ ← Hero text, Blair serif
│     Platform            │
│                         │ ← Vertical space
│ ┌─────────────────────┐ │
│ │   Begin Journey     │ │ ← Primary CTA, full width
│ │     (Warmth)        │ │   Gradient: Terracotta→Amber
│ └─────────────────────┘ │
│                         │ ← 24px gap
│     Already a member?   │ ← Small link, center
│       Sign In           │
│                         │
│ ┌───────────────────┬─┐ │ ← Bottom cards (swipeable)
│ │ AI Reflection     │→│ │
│ │ Memory Garden     │ │ │
│ │ Privacy First     │ │ │
│ └───────────────────┴─┘ │
└─────────────────────────┘
```

**Key Elements:**
- **Breathing Logo**: Subtle scale 1.0 → 1.03 → 1.0 (2s)
- **Hero CTA**: 60px height, corner radius 16px, Warmth gradient
- **Feature Cards**: Horizontal scroll, 280px width each
- **Safe Area**: All content within iPhone notch/home indicator zones

---

### **Frame 2: Smart Onboarding Choice**
*Intelligent user type detection*

**Screen Composition:**
```
┌─────────────────────────┐
│   ←  [Skip for now]     │ ← Exit option, top-left
│                         │
│      Welcome to         │ ← Blair serif, 24px
│       Soullab           │
│                         │
│   I'm Maia, your       │ ← Lato regular, 16px
│  AI conversation       │   Gray-700 color
│    partner              │
│                         │
│ ┌─────────────────────┐ │
│ │    [Avatar M]       │ │ ← 80px circle, Warmth gradient
│ │   ○ ○ ○ ○ ○ ○       │ │   Breathing aura animation
│ │                     │ │
│ │  "Let's find the    │ │ ← Sample message bubble
│ │   perfect way to    │ │   Earth gradient background
│ │   communicate"      │ │
│ └─────────────────────┘ │
│                         │ ← 32px vertical space
│ ┌─────────────────────┐ │
│ │  Quick Connection   │ │ ← Primary choice
│ │    (2 minutes)      │ │   Nature gradient
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │  Full Onboarding    │ │ ← Secondary choice
│ │    (5 minutes)      │ │   Subtle background
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Interactive Elements:**
- **Avatar**: Tap triggers greeting animation
- **Time Estimates**: Help users make informed choice
- **Skip Option**: Respects user autonomy

---

### **Frame 3a: Quick Connection Flow**
*Streamlined 2-minute setup*

**Screen Composition:**
```
┌─────────────────────────┐
│ ●●○○  Progress (2/4)    │ ← Progress indicators
│                         │
│    Choose Your Vibe     │ ← Section header
│                         │
│ ┌───┬───┬───┬───┬───┐  │ ← Tone slider
│ │   │   │●  │   │   │  │   Visual position indicator
│ └───┴───┴───┴───┴───┘  │
│  Grounded → Poetic      │ ← Range labels
│                         │
│                         │ ← 24px gap
│    Communication       │
│        Style            │
│                         │
│ ┌─────────┬─────────┐   │ ← Style toggle (50/50)
│ │  Prose  │ Poetic  │   │   
│ │   ✓     │         │   │
│ └─────────┴─────────┘   │
│                         │ ← 32px bottom space
│ ┌─────────────────────┐ │
│ │    Continue         │ │ ← Continue CTA
│ └─────────────────────┘ │
│                         │
│     ← Back              │ ← Navigation
└─────────────────────────┘
```

**Touch Interactions:**
- **Tone Slider**: Drag thumb or tap position
- **Style Toggle**: Single tap to switch
- **Large Touch Areas**: 60px minimum height

---

### **Frame 3b: Full Onboarding Flow**
*Complete 5-minute experience*

**Screen 1 - Tone & Style:**
```
┌─────────────────────────┐
│ ●○○○○  Step 1 of 5      │ ← Extended progress
│                         │
│  🎚 Attune Your Voice   │ ← Step icon + title
│                         │
│    How should Maia      │ ← Descriptive text
│     speak with you?     │
│                         │
│ [Tone Slider Component] │ ← Same as quick flow
│ [Style Selection]       │
│                         │
│ ┌─────────────────────┐ │ ← Live preview card
│ │  💫 Preview          │ │
│ │  [Maia Avatar]       │ │
│ │  "Sample message     │ │
│ │   in chosen style"   │ │
│ └─────────────────────┘ │
│                         │
│ [Continue Button]       │
└─────────────────────────┘
```

**Screen 2 - Preferences:**
```
┌─────────────────────────┐
│ ●●○○○  Step 2 of 5      │
│                         │
│  ⚙️ Personal Setup      │
│                         │
│ ┌─────────────────────┐ │
│ │ 🔊 Voice Features   │ │ ← Card-based layout
│ │ ○ Voice responses   │ │   Toggle switches
│ │ ○ Auto-play audio   │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 🎨 Theme Choice     │ │
│ │ [Light|Dark|Auto]   │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 🔔 Gentle Reminders │ │
│ │ ○ Daily check-ins   │ │
│ │ ○ Memory prompts    │ │
│ └─────────────────────┘ │
│                         │
│ [Continue Button]       │
└─────────────────────────┘
```

---

### **Frame 4: Permission Requests**
*Native iOS/Android patterns*

**Screen Composition:**
```
┌─────────────────────────┐
│ ●●●○○  Step 3 of 5      │
│                         │
│   🎤 Voice Access       │ ← Permission request
│                         │
│      To enable voice    │ ← Clear explanation
│   conversations, we     │
│   need microphone       │
│      permission         │
│                         │
│ ┌─────────────────────┐ │
│ │     🔒 Private      │ │ ← Trust indicators
│ │  Never recorded     │ │
│ │   Device only       │ │
│ └─────────────────────┘ │
│                         │ ← 32px space
│ ┌─────────────────────┐ │
│ │   Allow & Continue  │ │ ← Primary action
│ └─────────────────────┘ │
│                         │ ← 16px space
│ ┌─────────────────────┐ │
│ │  Continue without   │ │ ← Alternative option
│ │       voice         │ │   Subtle styling
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Privacy-First Approach:**
- **Clear Benefits**: Explain value proposition
- **Easy Decline**: Respect user choice
- **Trust Signals**: "Private", "Device only", "Never recorded"

---

### **Frame 5: First Conversation**
*Mobile-optimized chat interface*

**Screen Composition:**
```
┌─────────────────────────┐
│  Maia          [●] [⚙] │ ← Header: name, status, settings
│                         │
│                         │ ← Chat area starts here
│ ┌─────────────────┐     │
│ │ [M] Welcome to  │     │ ← Maia message
│ │     Soullab. I'm│     │   Earth gradient bubble
│ │     here to     │     │   80% max width, left aligned
│ │     listen.     │     │
│ └─────────────────┘     │
│                         │ ← Message spacing
│                   ┌───┐ │
│                   │Hi │ │ ← User message
│                   └───┘ │   Ocean solid, right aligned
│                         │
│ ┌─────────────────┐     │
│ │ [M] What's been │     │ ← Streaming response
│ │     on your     │     │   Typing indicator
│ │     mind lately?│ ●●● │
│ └─────────────────┘     │
│                         │
│ ┌─────────────────────┐ │ ← Input area
│ │ 🎤        Type...   │ │   Hybrid input
│ │                  ↑  │ │   Send button
│ └─────────────────────┘ │
│                         │ ← Safe area padding
└─────────────────────────┘
```

**Mobile Optimizations:**
- **Thumb-Zone Input**: Voice button bottom-left, send bottom-right
- **Auto-Scroll**: New messages auto-scroll into view
- **Typing Indicators**: Visual feedback for processing

---

### **Frame 6: Voice Interaction**
*Touch-native voice experience*

**Recording State:**
```
┌─────────────────────────┐
│  🔴 Recording...    [X] │ ← Recording indicator + stop
│                         │
│         ┌─────┐         │ ← Large visual feedback
│         │  🎤 │         │   120px circle
│         └─────┘         │
│      ○ ○ ○ ○ ○          │ ← Pulsing rings animation
│                         │
│                         │ ← Live transcription area
│ ┌─────────────────────┐ │
│ │ "I've been thinking │ │ ← Real-time text
│ │  about my goals     │ │   Updates as user speaks
│ │  recently..."       │ │
│ └─────────────────────┘ │
│                         │
│     Tap to stop         │ ← Instruction text
│                         │
│ [Hold for continuous]   │ ← Advanced feature hint
└─────────────────────────┘
```

**Playback State:**
```
┌─────────────────────────┐
│  ♪ Playing response     │ ← Audio indicator
│                         │
│ ┌─────────────────┐     │
│ │ [M] Based on    │     │ ← Message with audio
│ │     what you've │ 🔊  │   Speaker icon
│ │     shared...   │     │   
│ └─────────────────┘     │
│                         │
│ ●●●●●○○○○○ 2.3s/4.1s    │ ← Audio progress bar
│                         │
│  [⏸]  [⏪]  [2x]  [❤]  │ ← Playback controls
│ Pause  -5s   Speed  Save │   Touch-friendly spacing
│                         │
│ [Continue typing...]    │ ← Input remains available
└─────────────────────────┘
```

---

### **Frame 7: Quick Actions Panel**
*Swipe-up gesture reveal*

**Screen Composition:**
```
┌─────────────────────────┐
│ [Chat conversation...]  │ ← Background chat
│                         │
│ ╔═════════════════════╗ │ ← Modal overlay
│ ║     Quick Actions    ║ │   Swipe up from bottom
│ ║                     ║ │
│ ║ 🤔 "I'm reflecting  ║ │ ← Pre-written prompts
│ ║     on..."          ║ │   Tap to use
│ ║                     ║ │
│ ║ 💭 "Help me think   ║ │
│ ║     through..."     ║ │
│ ║                     ║ │
│ ║ 🎯 "I want to focus ║ │
│ ║     on..."          ║ │
│ ║                     ║ │
│ ║ ✨ "Something       ║ │
│ ║     beautiful..."   ║ │
│ ║                     ║ │
│ ║     [Custom...]     ║ │ ← Custom prompt option
│ ╚═════════════════════╝ │
│   ▲ Swipe to close     │ ← Gesture hint
└─────────────────────────┘
```

**Gesture Interactions:**
- **Swipe Up**: Reveal panel from bottom edge
- **Swipe Down**: Dismiss panel
- **Tap Prompt**: Auto-fill and send
- **Haptic Feedback**: Light impact on swipe reveal

---

### **Frame 8: Memory Garden**
*Mobile-optimized memory browsing*

**Screen Composition:**
```
┌─────────────────────────┐
│ ← Memory Garden    [+]  │ ← Back button + add memory
│                         │
│ 🔍 [Search memories...] │ ← Search bar
│                         │
│ ┌─────────────────────┐ │ ← Card-based memory layout
│ │ 💭 Yesterday        │ │   Swipeable cards
│ │ "Realized my        │ │   
│ │  patterns..."       │ │
│ │             ❤ 2.3k  │ │ ← Engagement indicator
│ └─────────────────────┘ │
│                         │ ← 12px gap
│ ┌─────────────────────┐ │
│ │ ✨ This week        │ │
│ │ "Beautiful moment   │ │
│ │  of clarity..."     │ │
│ │             ⭐ 1.8k │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 🌱 Growing insight  │ │
│ │ "Understanding      │ │
│ │  myself better..."  │ │
│ │             💎 987  │ │
│ └─────────────────────┘ │
│                         │
│     [Load more...]      │ ← Infinite scroll
└─────────────────────────┘
```

**Touch Interactions:**
- **Card Swipe Right**: Mark as favorite
- **Card Swipe Left**: Archive/hide  
- **Card Tap**: Open full memory detail
- **Pull to Refresh**: Get latest memories

---

### **Frame 9: Settings & Attune**
*Mobile-native settings experience*

**Main Settings:**
```
┌─────────────────────────┐
│ ← Settings              │ ← Back to chat
│                         │
│ ┌─────────────────────┐ │
│ │ 👤 Profile          │ │ ← Settings sections
│ │    Update your info │→│   Right arrow indicates
│ └─────────────────────┘ │   drill-down
│                         │
│ ┌─────────────────────┐ │
│ │ 🎚 Attune           │ │
│ │    Voice & style    │→│
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 🎨 Appearance       │ │
│ │    Theme & layout   │→│
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 🔔 Notifications    │ │
│ │    Manage alerts    │→│
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 🔒 Privacy          │ │
│ │    Data & security  │→│
│ └─────────────────────┘ │
│                         │
│     Version 1.0 Beta    │ ← App version
└─────────────────────────┘
```

**Attune Detail:**
```
┌─────────────────────────┐
│ ← Attune Your Voice     │
│                         │
│ ┌─────────────────────┐ │ ← Live preview at top
│ │ ✨ Live Preview     │ │   
│ │ [Maia Avatar]       │ │
│ │ "Sample response    │ │
│ │  in current style"  │ │
│ └─────────────────────┘ │
│                         │
│     Tone Balance        │ ← Section headers
│ ○────●────○             │ ← Visual slider
│ Grounded  Poetic        │
│                         │
│   Communication Style   │
│ ┌──────┬──────┬──────┐  │
│ │Prose │Poetic│ Auto │  │ ← Tab selector
│ │  ●   │      │      │  │
│ └──────┴──────┴──────┘  │
│                         │
│     Response Speed      │
│ ○──●──○                 │ ← Additional controls
│ Quick  Thoughtful       │
│                         │
│ [Apply Changes]         │ ← Save button
└─────────────────────────┘
```

---

### **Frame 10: Reflection Flow**
*Guided reflection experience*

**Reflection Trigger:**
```
┌─────────────────────────┐
│ [Chat continues...]     │
│                         │
│ ┌─────────────────────┐ │ ← Gentle slide-in prompt
│ │ 💫 Moment to        │ │   After 5+ messages
│ │    Reflect?         │ │
│ │                     │ │
│ │ You've shared quite │ │
│ │ a bit. Would you    │ │
│ │ like to capture a   │ │
│ │ reflection?         │ │
│ │                     │ │
│ │ [Yes, reflect] [Not │ │
│ │                now] │ │
│ └─────────────────────┘ │
│                         │
│ [Input area...]         │
└─────────────────────────┘
```

**Reflection Interface:**
```
┌─────────────────────────┐
│ ← Quick Reflection      │
│                         │
│ One word or feeling     │ ← Minimal input request
│ ┌─────────────────────┐ │
│ │ [Type here...]      │ │ ← Large input area
│ └─────────────────────┘ │
│                         │
│ What surprised you?     │ ← Optional follow-up
│ ┌─────────────────────┐ │
│ │ [Optional...]       │ │
│ └─────────────────────┘ │
│                         │
│ What challenged you?    │
│ ┌─────────────────────┐ │
│ │ [Optional...]       │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ ✨ Share Reflection │ │ ← Gradient button
│ └─────────────────────┘ │
│                         │
│     Skip for now        │ ← Always offer escape
└─────────────────────────┘
```

---

### **Frame 11: Success & Growth**
*Celebration and continuity*

**Reflection Success:**
```
┌─────────────────────────┐
│                         │
│         ┌─────┐         │ ← Success animation
│         │  🌸 │         │   2s celebration
│         └─────┘         │
│      ○ ○ ○ ○ ○          │ ← Ripple effect
│                         │
│    Thank you for        │ ← Gratitude message
│       sharing           │
│                         │
│  Your reflection helps  │
│     us both grow        │
│                         │ ← 32px space
│ ┌─────────────────────┐ │
│ │  Continue talking   │ │ ← Return to chat
│ └─────────────────────┘ │
│                         │
│     View in Garden      │ ← Optional: see memory
└─────────────────────────┘
```

**Growth Indicator:**
```
┌─────────────────────────┐
│  🌱 Your Garden Grows   │ ← Progress celebration
│                         │
│ ┌─────────────────────┐ │
│ │  📊 This Week       │ │ ← Weekly stats
│ │  • 12 conversations │ │
│ │  • 3 reflections    │ │
│ │  • 1 insight saved  │ │
│ └─────────────────────┘ │
│                         │
│      Journey continues  │
│    ●●●●●○○○○○  50%      │ ← Progress indicator
│                         │
│ "You're building deeper │ ← Personal insight
│  self-awareness through │
│  consistent reflection" │
│                         │
│ [Continue growing]      │ ← CTA to continue
└─────────────────────────┘
```

---

## 🎯 **Touch Interaction Patterns**

### **Primary Actions** (Thumb Zone - Bottom 75%):
- **Send Message**: Bottom right, 60px touch target
- **Voice Input**: Bottom left, 80px circular target
- **Main Navigation**: Bottom tabs or floating action
- **Quick Actions**: Swipe up from bottom edge

### **Secondary Actions** (Upper 25%):
- **Settings**: Top right corner
- **Back Navigation**: Top left
- **Status Indicators**: Top center
- **Search**: Top, below header

### **Gesture Vocabulary**:
- **Tap**: Primary selection, button activation
- **Hold**: Voice recording, context menus
- **Swipe Up**: Quick actions, bottom sheets
- **Swipe Down**: Dismiss modals, refresh content
- **Swipe Left/Right**: Navigate between screens, card actions
- **Pinch**: Zoom text size (accessibility)
- **Double-tap**: Quick actions (like message, save memory)

### **Visual Feedback**:
- **Button Press**: 0.95x scale + shadow lift
- **Voice Recording**: Pulsing rings, color animation  
- **Loading States**: Skeleton screens, breathing animations
- **Success Actions**: Celebration particles, gentle bounce
- **Error States**: Gentle shake, color shift to warning

---

## 📐 **Mobile Layout Specifications**

### **Screen Sizes Optimized For**:
- **Small Phone**: iPhone SE (375×667pt)  
- **Standard Phone**: iPhone 14 (390×844pt)
- **Large Phone**: iPhone 15 Pro Max (430×932pt)
- **Android**: Similar dimensions with system UI variations

### **Safe Areas & Margins**:
```css
/* iPhone with notch/dynamic island */
.safe-top: 47pt (notch) to 59pt (dynamic island)
.safe-bottom: 34pt (home indicator)
.safe-sides: 0pt (full width allowed)

/* Content margins */
.content-horizontal: 20pt (sides)
.content-vertical: 16pt (between sections)
.component-spacing: 12pt (between components)
```

### **Typography Scale (Mobile)**:
```css
H1: 28pt (main titles)
H2: 22pt (section headers) 
H3: 18pt (subsection titles)
Body: 16pt (reading text)
Small: 14pt (secondary info)
Caption: 12pt (labels)
```

### **Component Sizing**:
- **Touch Targets**: 44pt minimum, 60pt optimal
- **Input Fields**: 50pt height minimum
- **Buttons**: 44pt height minimum  
- **Cards**: 16pt border radius, 20pt padding
- **Modal Sheets**: 28pt top handle, rounded corners

---

## 📱 **Progressive Web App (PWA) Features**

### **App Manifest** (mobile-app-like experience):
```json
{
  "name": "Soullab - Sacred Technology Platform",
  "short_name": "Soullab", 
  "description": "AI-powered reflection and conversation",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#b85f42",
  "background_color": "#ffffff",
  "icons": [
    // Various sizes for home screen, splash screen
  ]
}
```

### **Mobile-Specific Features**:
- **Add to Home Screen**: Prompt after 3+ sessions
- **Offline Support**: Cache conversations, queue messages
- **Push Notifications**: Daily reflection reminders (opt-in)
- **Haptic Feedback**: iOS/Android native touch feedback
- **Share Integration**: Share memories to social/messaging
- **Biometric Auth**: Touch/Face ID for secure access

### **Performance Optimizations**:
- **Lazy Loading**: Load conversation history on scroll
- **Image Optimization**: WebP format, responsive sizing
- **Bundle Splitting**: Route-based code splitting
- **Service Worker**: Cache app shell, enable offline
- **Prefetching**: Preload likely next screens

---

This mobile-first storyboard prioritizes **natural touch interactions**, **thumb-zone optimization**, and **progressive disclosure** to create an intuitive experience that feels native to mobile devices while maintaining the atmospheric, soulful aesthetic of the Soullab brand.

Each frame can be rapidly prototyped in Figma Make using the detailed specifications and touch interaction patterns provided.