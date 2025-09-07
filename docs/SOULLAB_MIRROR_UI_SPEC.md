# Soullab Mirror UI Specification
*Sacred dialogue space - where conversation becomes ceremony*

## Design Philosophy
The Mirror transforms familiar chat mechanics into a ceremonial dialogue space. Every element breathes with sacred geometry while maintaining the Apple-like clarity users expect. This is not "just another chat app" - it's a threshold into sacred conversation.

## Component Architecture

### Core Component Tree
```
MirrorInterface/
├── ChatInterface.tsx          // Main container with ceremonial layout
├── MessageBubble.tsx          // Individual message with breathing auras
├── SacredInputBar.tsx         // Offering space for user reflections
├── LogoThinkingIndicator.tsx  // Soullab logo with three states
├── ConversationFlow.tsx       // Message grouping and rhythm
├── ElementalIndicators.tsx    // Peripheral symbol detection
└── QuickActionChips.tsx       // Journal/Spiral/Tone suggestions
```

## 1. MessageBubble Component

### Visual Design
```typescript
interface MessageBubbleProps {
  message: string;
  sender: 'user' | 'maia';
  timestamp: Date;
  elementalHint?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  isJournalTagged?: boolean;
  showBreathingAura?: boolean;
}
```

### Styling Specifications
```css
/* User Messages */
.user-bubble {
  background: linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%);
  border: 1px solid #d4d4d4;
  border-radius: 24px;
  padding: 16px 20px;
  font-family: 'Lato', sans-serif;
  color: #404040;
  max-width: 70%;
  margin-left: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Maia's Messages */
.maia-bubble {
  background: linear-gradient(135deg, rgba(181, 126, 220, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%);
  border: 1px solid rgba(181, 126, 220, 0.2);
  border-radius: 24px;
  padding: 16px 20px;
  font-family: 'Lato', sans-serif;
  color: #374151;
  max-width: 80%;
  margin-right: auto;
  position: relative;
  overflow: hidden;
}

/* Breathing Aura Animation */
.maia-bubble.breathing::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, rgba(181, 126, 220, 0.3), transparent, rgba(181, 126, 220, 0.3));
  border-radius: 26px;
  opacity: 0.6;
  animation: breathing-aura 6s ease-in-out infinite;
  z-index: -1;
}

@keyframes breathing-aura {
  0%, 100% { 
    opacity: 0.3;
    transform: scale(1);
  }
  50% { 
    opacity: 0.6;
    transform: scale(1.02);
  }
}

/* Message Entry Animation */
.message-enter {
  opacity: 0;
  transform: translateY(10px);
  animation: message-fade-in 0.4s ease-out forwards;
}

@keyframes message-fade-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Cascade Animation for Long Messages
```typescript
const cascadeMessageSegments = (text: string) => {
  const paragraphs = text.split('\n\n');
  return paragraphs.map((paragraph, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.3, 
        duration: 0.4,
        ease: "easeOut" 
      }}
    >
      {paragraph}
    </motion.div>
  ));
};
```

## 2. SacredInputBar Component

### Design Language
```css
.sacred-input-container {
  position: relative;
  margin: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.sacred-input-container:focus-within {
  border-color: rgba(255, 215, 0, 0.5);
  box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
}

.sacred-textarea {
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Lato', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  background: transparent;
  color: #374151;
  min-height: 24px;
  max-height: 120px;
}

.sacred-textarea::placeholder {
  color: #9CA3AF;
  font-style: italic;
}

/* Input Controls */
.input-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.send-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.mic-button {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: transparent;
  border: 1px solid #D1D5DB;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mic-button.active {
  background: rgba(239, 68, 68, 0.1);
  border-color: #EF4444;
}

.mic-button.active::before {
  content: '';
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: rgba(239, 68, 68, 0.2);
  animation: mic-ripple 2s infinite;
}

@keyframes mic-ripple {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}
```

### Quick Action Chips
```css
.quick-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  animation: chips-fade-in 0.3s ease-out;
}

.action-chip {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #E5E7EB;
  border-radius: 20px;
  font-size: 14px;
  font-family: 'Lato', sans-serif;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-chip:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
  color: #92400E;
  transform: translateY(-1px);
}

@keyframes chips-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 3. LogoThinkingIndicator Component

### Three Sacred States
```css
/* State 1: Idle - Gentle Breathing */
.logo-idle {
  animation: sacred-breathing 2s ease-in-out infinite;
}

@keyframes sacred-breathing {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.8;
  }
  50% { 
    transform: scale(1.05);
    opacity: 1;
  }
}

/* State 2: Thinking - Spiral Unfurling */
.logo-thinking {
  animation: spiral-unfurl 3s linear infinite;
}

@keyframes spiral-unfurl {
  0% { 
    transform: rotate(0deg) scale(1);
    filter: hue-rotate(0deg);
  }
  50% { 
    transform: rotate(180deg) scale(1.1);
    filter: hue-rotate(120deg);
  }
  100% { 
    transform: rotate(360deg) scale(1);
    filter: hue-rotate(360deg);
  }
}

/* State 3: Responding - Quick Pulse */
.logo-responding {
  animation: response-pulse 0.8s ease-in-out infinite;
}

@keyframes response-pulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.9;
  }
  50% { 
    transform: scale(1.15);
    opacity: 1;
  }
}

/* Logo Container */
.logo-thinking-container {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 48px;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-thinking-container .spiral-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 8px rgba(255, 215, 0, 0.3));
}
```

## 4. ConversationFlow Component

### Message Grouping & Rhythm
```typescript
interface ConversationFlowProps {
  messages: Message[];
  isTyping: boolean;
  onMessageGroup: (messages: Message[]) => void;
}

const groupMessagesByTurn = (messages: Message[]) => {
  const groups: Message[][] = [];
  let currentGroup: Message[] = [];
  let lastSender: string | null = null;

  messages.forEach((message) => {
    if (message.sender !== lastSender) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [message];
      lastSender = message.sender;
    } else {
      currentGroup.push(message);
    }
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
};
```

### Spacing Specifications
```css
/* Message Group Spacing */
.message-group {
  margin-bottom: 24px;
}

.message-group .message-bubble + .message-bubble {
  margin-top: 6px;
}

/* Turn Separation */
.message-group + .message-group {
  margin-top: 32px;
}

/* Conversation Container */
.conversation-flow {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  .conversation-flow {
    padding: 16px;
    max-width: 100%;
  }
  
  .message-group + .message-group {
    margin-top: 24px;
  }
}
```

## 5. ElementalIndicators Component

### Peripheral Symbol Detection
```css
.elemental-indicators {
  position: absolute;
  left: -40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.message-bubble:hover .elemental-indicators {
  opacity: 1;
}

.elemental-hint {
  width: 24px;
  height: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  animation: gentle-pulse 3s ease-in-out infinite;
}

.elemental-hint.fire {
  background: rgba(239, 68, 68, 0.1);
  color: #DC2626;
}

.elemental-hint.water {
  background: rgba(59, 130, 246, 0.1);
  color: #2563EB;
}

.elemental-hint.earth {
  background: rgba(34, 197, 94, 0.1);
  color: #16A34A;
}

.elemental-hint.air {
  background: rgba(255, 215, 0, 0.1);
  color: #D97706;
}

.elemental-hint.aether {
  background: rgba(147, 51, 234, 0.1);
  color: #7C3AED;
}

@keyframes gentle-pulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.6;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.9;
  }
}

/* Journal Sync Shimmer */
.journal-shimmer {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  background: linear-gradient(45deg, rgba(255, 215, 0, 0.3), rgba(255, 165, 0, 0.6));
  border-radius: 10px;
  animation: shimmer-pulse 2s ease-in-out infinite;
}

@keyframes shimmer-pulse {
  0%, 100% { 
    opacity: 0;
    transform: scale(0.8);
  }
  50% { 
    opacity: 1;
    transform: scale(1);
  }
}
```

## 6. Mobile vs Desktop Layout

### Desktop Layout (>= 1024px)
```css
.mirror-interface-desktop {
  display: grid;
  grid-template-columns: 1fr 300px;
  height: 100vh;
}

.main-conversation {
  display: flex;
  flex-direction: column;
}

.sidebar-preview {
  background: rgba(248, 250, 252, 0.95);
  border-left: 1px solid #E5E7EB;
  padding: 20px;
}

.sidebar-preview .journal-snippets {
  margin-bottom: 24px;
}

.sidebar-preview .spiral-preview {
  height: 200px;
  border-radius: 12px;
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  font-size: 14px;
}
```

### Mobile Layout (< 768px)
```css
.mirror-interface-mobile {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.mobile-logo-breathing {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.mobile-conversation {
  flex: 1;
  overflow-y: auto;
  padding-top: 80px;
  padding-bottom: 120px;
}

.mobile-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid #E5E7EB;
  padding: 16px;
}
```

## 7. Sacred Timing & Rhythm

### Message Timing
```typescript
const getMessageDelay = (messageLength: number) => {
  // Base delay 300ms, +100ms per 50 characters
  return Math.min(300 + Math.floor(messageLength / 50) * 100, 900);
};

const thinkingDurations = {
  short: 300,   // < 50 chars
  medium: 600,  // 50-200 chars  
  long: 900     // > 200 chars
};
```

### Breathing Cycles
```css
:root {
  /* Sacred Timing */
  --breathing-cycle: 2s;
  --aura-breath: 6s;
  --thinking-unfurl: 3s;
  --response-pulse: 0.8s;
  --message-cascade: 0.3s;
  
  /* Sacred Spacing */
  --message-gap: 6px;
  --turn-separation: 32px;
  --group-margin: 24px;
}
```

## Implementation Priority

1. ✅ **MessageBubble Component** - Core dialogue experience
2. 🔄 **LogoThinkingIndicator** - Sacred presence beacon
3. 🔄 **SacredInputBar** - Offering space interaction
4. ⏳ **ConversationFlow** - Message rhythm and grouping
5. ⏳ **ElementalIndicators** - Peripheral symbol detection
6. ⏳ **Mobile Optimizations** - Cross-device ceremony

This Mirror interface transforms familiar chat into sacred dialogue - maintaining all the interaction patterns users expect while infusing every element with ceremonial intention and breathing awareness. The result is a conversation space that feels both modern and timeless, technical and sacred.