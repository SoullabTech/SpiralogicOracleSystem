# Soullab Beta Onboarding Flow
*Modern, bold, elegant threshold experience*

## Design Principles
Based on the Soullab design brief, our onboarding embodies:
- **Modern Sanctuary**: Apple-like clarity meets sacred space
- **Bold Simplicity**: Minimal steps, maximum impact  
- **Elegant Restraint**: Rich without clutter
- **Living Identity**: Logo as breathing, conscious presence

## Onboarding Sequence (4 Screens Max)

### Screen 1: Sacred Arrival
**Visual Language**
```css
.onboarding-arrival {
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Blair', serif; /* Primary brand font */
}

.arrival-logo {
  width: 120px;
  height: 120px;
  margin-bottom: 32px;
}

.arrival-title {
  font-size: 32px;
  font-weight: 600;
  color: #171717;
  margin-bottom: 16px;
  text-align: center;
}

.arrival-subtitle {
  font-family: 'Lato', sans-serif; /* Digital font */
  font-size: 18px;
  color: #525252;
  text-align: center;
  max-width: 480px;
  line-height: 1.5;
  margin-bottom: 48px;
}
```

**Content Structure**
```tsx
<motion.div className="onboarding-arrival">
  <SoullabLogo 
    variant="entry" 
    size={120}
    className="arrival-logo"
  />
  
  <motion.h1 
    className="arrival-title"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.5, duration: 0.8 }}
  >
    Welcome to Soullab
  </motion.h1>
  
  <motion.p 
    className="arrival-subtitle"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.8, duration: 0.8 }}
  >
    A space for reflection, guidance, and growth.
    <br />Where insight meets intelligence.
  </motion.p>
  
  <motion.button 
    className="primary-button"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 2.1, duration: 0.5 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    Begin
  </motion.button>
</motion.div>
```

### Screen 2: Meet Maya
**Visual Language**
```css
.onboarding-maya {
  background: #fafafa;
  padding: 80px 32px;
  text-align: center;
}

.maya-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #B57EDC 0%, #9b59b6 100%);
  margin: 0 auto 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: maya-pulse 2s ease-in-out infinite;
}

@keyframes maya-pulse {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(181, 126, 220, 0.4);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 0 20px rgba(181, 126, 220, 0);
    transform: scale(1.05);
  }
}

.maya-intro {
  max-width: 520px;
  margin: 0 auto;
}

.maya-title {
  font-family: 'Blair', serif;
  font-size: 28px;
  font-weight: 600;
  color: #171717;
  margin-bottom: 16px;
}

.maya-description {
  font-family: 'Lato', sans-serif;
  font-size: 18px;
  color: #404040;
  line-height: 1.6;
  margin-bottom: 48px;
}
```

**Content Structure**
```tsx
<div className="onboarding-maya">
  <motion.div 
    className="maya-avatar"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    <Sparkles className="w-8 h-8 text-white" />
  </motion.div>
  
  <div className="maya-intro">
    <motion.h2 
      className="maya-title"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      I'm Maya
    </motion.h2>
    
    <motion.p 
      className="maya-description"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      Your companion for reflection and insight. I remember your journey, 
      notice patterns, and offer guidance that grows with you.
    </motion.p>
    
    <motion.button 
      className="primary-button"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      Continue
    </motion.button>
  </div>
</div>
```

### Screen 3: Four Doors (Navigation Introduction)
**Visual Language**
```css
.onboarding-doors {
  background: #fafafa;
  padding: 80px 32px;
  text-align: center;
}

.doors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  max-width: 800px;
  margin: 48px auto;
}

.door-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.door-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.door-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.door-card.mirror .door-icon {
  background: rgba(181, 126, 220, 0.1);
  color: #B57EDC;
}

.door-card.spiral .door-icon {
  background: rgba(78, 205, 196, 0.1);
  color: #4ECDC4;
}

.door-card.journal .door-icon {
  background: rgba(255, 215, 0, 0.1);
  color: #FFD700;
}

.door-card.attune .door-icon {
  background: rgba(149, 231, 126, 0.1);
  color: #95E77E;
}

.door-title {
  font-family: 'Blair', serif;
  font-size: 18px;
  font-weight: 600;
  color: #171717;
  margin-bottom: 8px;
}

.door-description {
  font-family: 'Lato', sans-serif;
  font-size: 14px;
  color: #525252;
  line-height: 1.4;
}
```

**Content Structure**
```tsx
<div className="onboarding-doors">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <h2 className="section-title">Four doors shape this space</h2>
    <p className="section-description">
      Explore freely, or simply stay in the Mirror to begin
    </p>
  </motion.div>
  
  <div className="doors-grid">
    {[
      {
        key: 'mirror',
        icon: <Mirror className="w-6 h-6" />,
        title: 'Mirror',
        description: 'Conversations with Maya'
      },
      {
        key: 'spiral', 
        icon: <Spiral className="w-6 h-6" />,
        title: 'Spiral',
        description: 'Your journey map'
      },
      {
        key: 'journal',
        icon: <BookOpen className="w-6 h-6" />,
        title: 'Journal', 
        description: 'Private reflections'
      },
      {
        key: 'attune',
        icon: <Sliders className="w-6 h-6" />,
        title: 'Attune',
        description: 'Personal settings'
      }
    ].map((door, index) => (
      <motion.div
        key={door.key}
        className={`door-card ${door.key}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
        whileHover={{ y: -4 }}
      >
        <div className="door-icon">
          {door.icon}
        </div>
        <h3 className="door-title">{door.title}</h3>
        <p className="door-description">{door.description}</p>
      </motion.div>
    ))}
  </div>
  
  <motion.button 
    className="primary-button"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.8, duration: 0.5 }}
  >
    Show Me
  </motion.button>
</div>
```

### Screen 4: Voice & Style (Optional Configuration)
**Visual Language**
```css
.onboarding-style {
  background: #fafafa;
  padding: 80px 32px;
  text-align: center;
}

.style-controls {
  max-width: 520px;
  margin: 48px auto;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  padding: 40px;
}

.tone-slider-container {
  margin-bottom: 32px;
}

.tone-slider {
  width: 100%;
  height: 6px;
  background: linear-gradient(to right, #404040, #FFD700);
  border-radius: 3px;
  appearance: none;
  outline: none;
}

.tone-slider::-webkit-slider-thumb {
  width: 24px;
  height: 24px;
  background: #FFD700;
  border-radius: 50%;
  appearance: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.style-toggles {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 32px;
}

.style-toggle {
  padding: 12px 24px;
  border: 2px solid #e5e5e5;
  border-radius: 24px;
  background: white;
  font-family: 'Lato', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.style-toggle.active {
  border-color: #FFD700;
  background: rgba(255, 215, 0, 0.1);
  color: #cea22c;
}
```

**Content Structure**
```tsx
<div className="onboarding-style">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <h2 className="section-title">Choose your voice</h2>
    <p className="section-description">
      Adjust how Maya speaks with you. Find what feels right.
    </p>
  </motion.div>
  
  <motion.div 
    className="style-controls"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.3, duration: 0.5 }}
  >
    <div className="tone-slider-container">
      <label className="slider-label">Tone</label>
      <div className="slider-range">
        <span>Grounded</span>
        <input 
          type="range" 
          className="tone-slider"
          min="0" 
          max="100" 
          defaultValue="50"
        />
        <span>Poetic</span>
      </div>
    </div>
    
    <div className="style-toggles">
      <button className="style-toggle active">Prose</button>
      <button className="style-toggle">Poetic</button>
      <button className="style-toggle">Auto</button>
    </div>
    
    <p className="style-note">
      You can change this anytime in Attune
    </p>
  </motion.div>
  
  <motion.button 
    className="primary-button"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.6, duration: 0.5 }}
  >
    Save & Begin
  </motion.button>
</div>
```

## First Mirror Greeting
After onboarding completion, users land in the Mirror with this adaptive greeting:

```tsx
const generateWelcomeGreeting = (userSettings: UserSettings) => {
  const timeOfDay = getTimeOfDay();
  const greetings = {
    morning: "✨ Good morning. The spiral begins where you are. What's stirring for you today?",
    afternoon: "✨ Welcome to your space. What's alive for you this afternoon?", 
    evening: "✨ Evening. The day settles, awareness sharpens. What are you carrying?"
  };
  
  return greetings[timeOfDay] || "✨ Welcome to Soullab. The spiral begins where you are. What's present for you today?";
};
```

## Animation Specifications

### Logo Entry Sequence
```typescript
const logoEntrySequence = {
  // Phase 1: Sacred Point (0-0.5s)
  initial: { 
    scale: 0, 
    opacity: 0,
    rotate: -180,
    filter: "blur(4px)"
  },
  
  // Phase 2: Unfurling (0.5-1.2s)  
  unfurl: {
    scale: [0, 0.1, 1.2, 1],
    opacity: [0, 0.3, 0.9, 1],
    rotate: [0, 45, 360, 360],
    filter: ["blur(4px)", "blur(2px)", "blur(0px)", "blur(0px)"],
    transition: { 
      duration: 0.7,
      ease: "easeOut",
      times: [0, 0.2, 0.8, 1]
    }
  },
  
  // Phase 3: Living Breath (1.2s+)
  breathe: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.9, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 1.2
    }
  }
};
```

### Ceremonial Mode Switching
When users change between Prose/Poetic modes:

```css
.mode-switch-ceremony {
  position: relative;
  overflow: hidden;
}

.mode-switch-ceremony::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ceremonial-ripple 1.2s ease-out forwards;
}

@keyframes ceremonial-ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}
```

## Universal Design System

### Button Components
```css
.primary-button {
  font-family: 'Lato', sans-serif;
  font-size: 16px;
  font-weight: 600;
  padding: 16px 32px;
  background: linear-gradient(135deg, #171717 0%, #404040 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.primary-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
```

### Typography Scale
```css
:root {
  /* Brand Typography - Blair (headers, identity) */
  --font-brand: 'Blair', serif;
  --font-digital: 'Lato', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Type Scale */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 28px;
  --text-4xl: 32px;
  --text-5xl: 40px;
  
  /* Brand Colors from Design Brief */
  --brand-red: #a94724;
  --brand-yellow: #cea22c; 
  --brand-green: #6d7934;
  --brand-blue: #236586;
  --sacred-gold: #FFD700; /* Digital accent */
}
```

## Beta Implementation Notes

1. **Progressive Disclosure**: Only show essential onboarding screens. Advanced features (Spiral visualization, Journal tagging) introduced gradually through first week

2. **Accessibility First**: All animations respect `prefers-reduced-motion`, focus management through keyboard navigation

3. **Performance**: Logo animations use CSS transforms and opacity only (no layout reflow)

4. **Mobile Optimization**: Touch targets minimum 44px, simplified text on smaller screens

5. **Loading States**: Smooth transitions between onboarding screens prevent jarring jumps

This onboarding creates a threshold moment that's both modern and sacred - establishing trust through clarity while hinting at the depth available within Soullab.