# 🎭 Soullab Mirror - Component Interaction States

## 🌀 **Logo Animation States**

### **State: Idle** 
- **Animation**: Breathing scale 1.0 ↔ 1.05
- **Duration**: 2s ease-in-out infinite
- **Trigger**: No active conversation, standby mode
- **Aura**: Soft purple glow `rgba(139, 92, 246, 0.3)`

### **State: Thinking**
- **Animation**: Slow clockwise rotation 
- **Duration**: 6s linear infinite
- **Trigger**: Message sent, waiting for Maia response
- **Visual**: Slightly brighter glow, rotation speed indicates processing

### **State: Responding** 
- **Animation**: Pulsing with typing dots sync
- **Duration**: 1s pulse, dots appear/disappear
- **Trigger**: Maia is typing response  
- **Visual**: 3 dots below logo, synchronized pulse

### **State: Speaking**
- **Animation**: Glowing with radiating audio waves
- **Duration**: Matches audio length
- **Trigger**: Voice synthesis active
- **Visual**: Concentric circles expand outward, glow intensity matches volume

---

## 🎤 **Voice Input States**

### **State: Idle**
- **Mic Button**: Gray `rgba(156, 163, 175, 1)`, soft glow
- **Input Placeholder**: "Offer your reflection… (type or speak)"
- **Waveform**: Hidden
- **Trigger**: Default state

### **State: Recording**
- **Mic Button**: Blue `#3B82F6`, pulsing animation
- **Input Placeholder**: "Listening…" (disabled, blue tint)
- **Waveform**: Visible, Claude-style animated bars
- **Element Detection**: Wave color changes based on detected element
- **Trigger**: Mic button pressed

### **State: Processing Voice**
- **Mic Button**: Orange `#F59E0B`, spinning
- **Input Placeholder**: "Processing speech…"
- **Waveform**: Static bars, fade out
- **Trigger**: Voice recording complete, transcribing

### **State: Voice Ready**
- **Mic Button**: Green `#10B981`, checkmark overlay
- **Input Content**: Transcribed text appears
- **Auto-Action**: Sends after 1s delay (or manual send)
- **Trigger**: Transcription complete

---

## 💬 **Message Bubble States**

### **User Messages**
- **Default**: White bubble, right-aligned
- **Swipe Right**: Edit menu appears (`✏️ Edit | 🔄 Resend | 🗑️ Delete`)
- **Long Press**: Select mode for multi-message actions

### **Maia Messages**  
- **Default**: Purple gradient, left-aligned, breathing aura
- **Swipe Left**: Journal action appears (`📓 Save to Journal`)
- **Long Press**: Extended options (`🔗 Get Permalink | 🧠 Show Reasoning | 📋 Copy`)
- **Speaking State**: Additional glow during voice synthesis

---

## 🎚️ **Input Bar Element States**

### **Send Button**
- **Disabled**: Gray, 50% opacity
- **Ready**: Orange gradient, normal
- **Pressed**: Ripple effect from center, 0.3s
- **Sending**: Spinning loader inside button

### **Prosody Debug Toggle** 
- **Off**: Gray `🟣`, normal opacity
- **Active**: Purple `#8B5CF6`, glowing
- **Panel Open**: Green checkmark overlay

### **Language Selector**
- **Closed**: Gray `🌐`
- **Open**: Dropdown with 5 language options
- **Selected**: Brief green flash, dropdown closes

### **Ritual Trigger**
- **Ready**: Purple `🔮`, soft glow
- **Activated**: Golden flash, then returns to normal
- **Cooldown**: 10s dimmed state after use

---

## 📱 **Mobile-Specific States**

### **Input Focus State**
- **Keyboard Open**: Input bar slides up above keyboard
- **Text Resize**: Font scales slightly larger on mobile
- **Quick Actions**: Collapse into expandable `+` menu

### **Chat Scroll States**  
- **Active Scroll**: Hide input bar during scroll
- **Rest Position**: Show input bar after 1s scroll stop
- **New Message**: Auto-scroll to bottom with smooth animation

---

## 🎯 **Quick Action Chip States**

### **Journal Chip** (`📓 Journal`)
- **Default**: Gold border `rgba(245, 158, 11, 0.3)`
- **Active**: Full gold background `#F59E0B` 
- **Pressed**: Scale 0.95, then bounce back

### **Spiral Chip** (`🌀 Spiral`)
- **Default**: Blue border `rgba(99, 102, 241, 0.3)`
- **Active**: Full blue background `#6366F1`
- **Loading**: Spiral icon rotates while opening

### **Tone Chip** (`🎚 Tone`)
- **Default**: Purple border `rgba(139, 92, 246, 0.3)`
- **Active**: Shows current tone level as background fill
- **Adjusting**: Real-time background changes as slider moves

### **Search Chip** (`🔍 Search`)
- **Default**: Green border `rgba(16, 185, 129, 0.3)`
- **Active**: Green background with white text
- **Results**: Chip shows result count badge

---

## 🌊 **Elemental Response States**

Voice waveform and UI adapt based on detected element:

### **Fire** 🔥
- **Waveform**: Red `#EF4444`, aggressive spiky animation
- **Input Glow**: Warm red tint
- **Send Button**: Extra bold orange

### **Water** 🌊  
- **Waveform**: Blue `#3B82F6`, flowing wave motion
- **Input Glow**: Cool blue tint
- **Maia Aura**: Cooler purple tones

### **Earth** 🌍
- **Waveform**: Green `#10B981`, steady solid bars  
- **Input Glow**: Earthy green tint
- **UI Feel**: Slightly slower, more grounded animations

### **Air** 💨
- **Waveform**: Gray `#6B7280`, light floating animation
- **Input Glow**: Soft silver tint  
- **UI Feel**: Faster, more ethereal transitions

### **Aether** ✨
- **Waveform**: Purple `#8B5CF6`, mystical shimmer
- **Input Glow**: Multi-color subtle gradient
- **Logo**: Enhanced breathing with color shifts

---

## ⚡ **Error & Loading States**

### **Connection Lost**
- **Status Dot**: Red, pulsing slowly
- **Input Bar**: Disabled with "Reconnecting..." message
- **Last Message**: "Retrying..." indicator

### **Voice Synthesis Failed**
- **Logo**: Brief red flash, return to normal
- **Fallback**: Text-only response appears
- **Retry Button**: Appears on message bubble

### **Extended Thinking Mode**  
- **Logo**: Thinking state continues
- **Progress**: Subtle progress ring around logo  
- **Panel**: "🧠 Show Reasoning" button becomes available
- **Timeout**: After 30s, shows "Taking extra time..." message

---

## 🎨 **Visual State Transitions**

All state changes use **ease-out** timing for natural feel:
- **Fast**: 0.2s for button presses, immediate feedback
- **Medium**: 0.5s for input states, comfortable
- **Slow**: 1.0s+ for logo animations, meditative pace  
- **Breathing**: 2-3s cycles for living, sacred feeling

---

✨ **Design Philosophy**: Every state change feels intentional and alive, reinforcing Soullab's sacred technology approach where the interface itself participates in the ceremonial conversation.