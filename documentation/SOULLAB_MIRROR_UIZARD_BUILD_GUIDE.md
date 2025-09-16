# 🌀 Soullab Mirror UI - Uizard Build Guide

## 📱 **Step-by-Step Uizard Build Instructions**

### **Phase 1: Setup & Canvas**

1. **Create New Project**
   - Name: "Soullab Mirror - Sacred Chat Interface"  
   - Template: "Mobile App" or "Web App"
   - Canvas: 1440x900 (Desktop primary, will adapt to mobile)

2. **Background Setup**
   - Canvas Background: Deep gradient `#0A0D16` → `#0F1419` (vertical)
   - Add Particle Layer: 50 tiny white dots (1-2px), 5-15% opacity, slow drift
   - Effect: Creates subtle starfield without distraction

---

### **Phase 2: Top Bar & Logo**

3. **Header Container**
   - Rectangle: Full width × 80px height
   - Background: `rgba(10, 13, 22, 0.95)` with backdrop blur
   - Position: Fixed to top

4. **Soullab Spiral Logo** 
   - Element: Image placeholder (40×40px)
   - Position: Center horizontal, 20px from top
   - Animation: "Breathing" - scale 1.0 ↔ 1.05, 2s duration, infinite
   - Drop shadow: `0 0 20px rgba(139, 92, 246, 0.3)`

5. **Status Dot**
   - Circle: 8×8px, center under logo (5px gap)
   - States: Green=#10B981 (connected), Amber=#F59E0B (reconnecting), Red=#EF4444 (offline)

---

### **Phase 3: Main Chat Area**

6. **Scrollable Chat Container**
   - Rectangle: 40px margins, fills between header and input area
   - Background: Transparent
   - Scrollable: Vertical, fade edges

7. **User Message Bubble (Example)**
   - Rectangle: Right-aligned, max-width 70%
   - Background: `#FFFFFF`
   - Text color: `#1F2937`
   - Border radius: 18px, padding: 12px 16px
   - Font: Inter 14px regular
   - Content: "I've been reflecting on transitions in my life..."

8. **Maia Message Bubble (Example)**
   - Rectangle: Left-aligned, max-width 70%  
   - Background: Linear gradient `#6366F1` → `#8B5CF6` (135deg)
   - Text color: `#FFFFFF`
   - Border radius: 18px, padding: 12px 16px
   - **Breathing Aura**: Outer glow `rgba(139, 92, 246, 0.2)`, 20px blur, breathing animation
   - Content: "I notice there's something tender in how you speak about transitions..."

---

### **Phase 4: Quick Actions Row**

9. **Horizontal Container**
   - Position: 120px from bottom, center horizontal
   - Gap: 12px between elements

10. **Action Chips** (4 total)
    - **Journal**: `📓 Journal` - Border: `rgba(245, 158, 11, 0.3)`, Text: `#F59E0B`
    - **Spiral**: `🌀 Spiral` - Border: `rgba(99, 102, 241, 0.3)`, Text: `#6366F1`  
    - **Tone**: `🎚 Tone` - Border: `rgba(139, 92, 246, 0.3)`, Text: `#8B5CF6`
    - **Search**: `🔍 Search` - Border: `rgba(16, 185, 129, 0.3)`, Text: `#10B981`
    - All: Background `rgba(255, 255, 255, 0.08)`, Border radius 20px, Padding 8px 16px, Font: Inter 12px medium

---

### **Phase 5: Input Bar (Main Component)**

11. **Input Container**
    - Rectangle: 40px margins, 60px height, 60px from bottom
    - Background: `rgba(15, 20, 25, 0.95)` with backdrop blur
    - Border: `1px solid rgba(107, 114, 128, 0.3)`
    - Border radius: 30px (pill shape)

12. **Left Controls**
    - **Language**: `🌐` button, 16px from left, color `rgba(156, 163, 175, 1)`
    - **Ritual**: `🔮` button, 60px from left, color `rgba(139, 92, 246, 1)`

13. **Center Text Input**
    - Textarea: Flexible width, 36px height, auto-expand to max 120px
    - Background: Transparent
    - Placeholder: "Offer your reflection… (type or speak)"
    - Font: Inter 14px regular, color `#FFFFFF`
    - **Recording State**: Placeholder → "Listening…", disabled, blue tint

14. **Right Controls** (4 buttons, 44px spacing)
    - **Mic**: `🎤` - Idle: soft glow gray, Active: pulsing blue `#3B82F6`
    - **Prosody**: `🟣` - Purple `#8B5CF6` when active
    - **Settings**: `⚙️` - Gray `rgba(156, 163, 175, 1)`
    - **Send**: `➤` in orange gradient circle, ripple effect on tap

---

### **Phase 6: Voice Waveform**

15. **Waveform Visualizer**
    - Position: Above input bar (hidden by default)
    - Show when recording: Claude-style animated wave
    - Colors by element: Fire=Red, Water=Blue, Earth=Green, Air=Gray, Aether=Purple

---

### **Phase 7: Mobile Responsive Adaptations**

16. **Mobile Breakpoint (768px)**
    - Input bar: Fixed to bottom, 16px margins
    - Quick actions: Collapse into "+" expandable menu
    - Logo: Smaller (32×32px)
    - Chat margins: Reduce to 16px
    - Message bubbles: Max-width 85%

---

### **Phase 8: Interactive States**

17. **Logo Animation States**
    - **Idle**: Breathing (2s scale)
    - **Thinking**: Slow rotation (6s per loop)  
    - **Responding**: Pulsing with typing dots
    - **Speaking**: Glowing with outward audio waves

18. **Swipe Gestures** 
    - Swipe left on Maia message → "📓 Journal this" option
    - Swipe right on user message → "Edit/Resend" menu

19. **Extended Panels** (Optional Beta Features)
    - Memory banner: Subtle top notification "Maia remembers your water energy..."
    - Thinking panel: Modal from bottom showing Maia's reasoning
    - Search modal: Slides up, searches journals/spirals/sessions

---

## 🎨 **Color Palette Reference**

```css
/* Core Background */
--bg-primary: #0A0D16
--bg-secondary: #0F1419
--bg-input: rgba(15, 20, 25, 0.95)

/* Elemental Accents */
--fire: #EF4444
--water: #3B82F6  
--earth: #10B981
--air: #6B7280
--aether: #8B5CF6

/* Message Bubbles */
--user-bubble: #FFFFFF
--maia-bubble: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)

/* Interactive States */
--send-button: linear-gradient(135deg, #F59E0B 0%, #F97316 100%)
--maia-aura: rgba(139, 92, 246, 0.2)
```

---

## ⚡ **Animation Specifications**

- **Breathing**: `scale(1.0) ↔ scale(1.05)`, 2s, ease-in-out, infinite
- **Rotation**: `0deg → 360deg`, 6s, linear, infinite  
- **Pulsing**: `opacity 0.7 ↔ 1.0`, 1s, infinite
- **Ripple**: Click expands circle from 0 → 100px, fade out, 0.3s
- **Waveform**: 5-8 vertical bars, random height changes, 60fps

---

## 🔧 **Uizard Pro Tips**

1. **Use Components**: Save message bubble as reusable component
2. **State Management**: Set up "Recording", "Thinking", "Speaking" states
3. **Auto-Layout**: Use constraints for responsive behavior  
4. **Smart Animate**: Between logo breathing/rotation states
5. **Overlay Modals**: For extended thinking, search, settings panels

---

✨ **Result**: A Claude-like professional interface with Soullab's sacred depth - every tap, swipe, and voice interaction feels intentional and ceremonial, while maintaining modern UX expectations.

👉 **Import the JSON template first for structure, then use this guide for fine-tuning animations and interactions in Uizard!**