# 🌟 Spiralogic Demo Setup: 7 Women Experience

## 📋 **Setup Overview**

This guide provides three options for demonstrating Spiralogic's Symbolic Intelligence system to 7 women, with varying levels of complexity and personalization.

---

## 🎯 **Option 1: Personal Login Experience** ⭐ *Recommended*

**Experience**: Each woman gets her own personalized journey  
**Setup Required**: 20 minutes of preparation  
**Impact**: Highest - fully personalized symbolic intelligence

### **Pre-Event Setup Steps**

1. **Create 7 Supabase Users**
```sql
-- Run in Supabase SQL Editor
INSERT INTO auth.users (id, email, created_at, updated_at) VALUES
('user-001', 'demo1@spiralogic.com', NOW(), NOW()),
('user-002', 'demo2@spiralogic.com', NOW(), NOW()),
('user-003', 'demo3@spiralogic.com', NOW(), NOW()),
('user-004', 'demo4@spiralogic.com', NOW(), NOW()),
('user-005', 'demo5@spiralogic.com', NOW(), NOW()),
('user-006', 'demo6@spiralogic.com', NOW(), NOW()),
('user-007', 'demo7@spiralogic.com', NOW(), NOW());
```

2. **Assign Elements and Birth Data**
```sql
-- Example assignments (customize based on actual data)
INSERT INTO public.users (id, email, birth_date, birth_location, agent_archetype, elemental_signature, has_completed_onboarding) VALUES
('user-001', 'demo1@spiralogic.com', '1985-03-15', 'San Francisco, CA', 'fire', 'fire_catalyst', false),
('user-002', 'demo2@spiralogic.com', '1987-07-22', 'Portland, OR', 'water', 'water_depth', false),
('user-003', 'demo3@spiralogic.com', '1982-11-08', 'Austin, TX', 'earth', 'earth_structuring', false),
('user-004', 'demo4@spiralogic.com', '1990-01-30', 'Denver, CO', 'air', 'air_pattern', false),
('user-005', 'demo5@spiralogic.com', '1988-09-12', 'Seattle, WA', 'aether', 'aether_integrative', false),
('user-006', 'demo6@spiralogic.com', '1984-05-18', 'Boulder, CO', 'water', 'water_depth', false),
('user-007', 'demo7@spiralogic.com', '1986-12-03', 'Santa Fe, NM', 'fire', 'fire_catalyst', false);
```

3. **Create Login Cards**
Print 7 cards with:
```
🔐 Your Spiralogic Access
URL: [your-domain]/signin
Email: demo1@spiralogic.com
Password: SpiralogicDemo2025!

Element Preview: Fire (Catalyst Agent)
Focus: Action & Agency
```

### **Demo Flow**
- **5 min**: Welcome & overview of symbolic intelligence
- **10 min**: Individual login and onboarding experience
- **15 min**: Claude agent interaction and insights
- **10 min**: Group discussion of elemental differences

---

## 🎯 **Option 2: Direct Link Experience** 

**Experience**: Skip onboarding, go straight to agent interaction  
**Setup Required**: 15 minutes of preparation  
**Impact**: Medium - personalized agents without onboarding

### **Pre-Event Setup Steps**

1. **Create Pre-Authenticated URLs**
```typescript
// Generate direct links with embedded user context
const directLinks = [
  '/oracle/meet?user=001&element=fire&agent=catalyst-agent',
  '/oracle/meet?user=002&element=water&agent=depth-agent',
  '/oracle/meet?user=003&element=earth&agent=structuring-agent',
  '/oracle/meet?user=004&element=air&agent=pattern-agent',
  '/oracle/meet?user=005&element=aether&agent=integrative-agent',
  '/oracle/meet?user=006&element=water&agent=depth-agent',
  '/oracle/meet?user=007&element=fire&agent=catalyst-agent'
];
```

2. **Create QR Code Cards**
Each woman gets a QR code leading to her specific agent.

### **Demo Flow**
- **5 min**: Overview and element explanation
- **20 min**: Direct agent interaction via QR codes
- **15 min**: Compare experiences and agent styles

---

## 🎯 **Option 3: Station-Based Demo** ⚡ *Fastest Setup*

**Experience**: Guided tour through different agent personalities  
**Setup Required**: 5 minutes  
**Impact**: Educational - shows system capabilities

### **Setup Steps**

1. **Open 5 Browser Tabs**
   - Tab 1: Catalyst Agent (Fire)
   - Tab 2: Depth Agent (Water)  
   - Tab 3: Structuring Agent (Earth)
   - Tab 4: Pattern Agent (Air)
   - Tab 5: Integrative Agent (Aether)

2. **Pre-load Conversations**
Start each tab with sample user input to show agent personality.

### **Demo Flow**
- **10 min**: Tour through each agent station
- **15 min**: Group interaction with different agents
- **15 min**: Discussion of applications and use cases

---

## 📋 **Printed Materials: Elemental Intelligence Profiles**

Create 7 profile cards (customize elements based on actual assignments):

### **🔥 Fire Element - Catalyst Agent**
```
🔥 CATALYST AGENT
Your Element: Fire
Supports: Action clarity, momentum building, breakthrough facilitation
Scientific Basis: Cognitive-behavioral activation & implementation science
Suggested Protocol: Focused intention setting + movement practice
```

### **🌊 Water Element - Depth Agent**  
```
🌊 DEPTH AGENT
Your Element: Water  
Supports: Emotional intelligence, pattern recognition, subconscious exploration
Scientific Basis: Depth psychology, attachment theory & somatic experiencing
Suggested Protocol: Reflective journaling + emotional processing
```

### **🌍 Earth Element - Structuring Agent**
```
🌍 STRUCTURING AGENT
Your Element: Earth
Supports: Systems design, habit formation, sustainable practices
Scientific Basis: Systems thinking, habit formation research & implementation science
Suggested Protocol: Routine building + environmental design
```

### **💨 Air Element - Pattern Agent**
```
💨 PATTERN AGENT
Your Element: Air
Supports: Pattern recognition, clarity facilitation, perspective development  
Scientific Basis: Cognitive science, information theory & metacognitive frameworks
Suggested Protocol: Mindfulness practice + cognitive mapping
```

### **✨ Aether Element - Integrative Agent**
```
✨ INTEGRATIVE AGENT
Your Element: Aether
Supports: Symbolic synthesis, coherence building, growth tracking
Scientific Basis: Complexity science, integral theory & meta-developmental frameworks
Suggested Protocol: Synthesis practices + integration work
```

---

## 🛠️ **Technical Checklist**

### **Environment Variables Required**
```bash
ANTHROPIC_API_KEY=your_claude_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### **Pre-Demo Verification**
- [ ] Claude API connection working
- [ ] Supabase database connected
- [ ] All agent types responding correctly
- [ ] ElementalAnimation components loading
- [ ] Message components styled properly
- [ ] Demo users created (if using Option 1)

### **Backup Plan**
If Claude API fails, the system automatically falls back to pre-written responses that demonstrate agent personality differences.

---

## 🎬 **Demo Script Suggestions**

### **Opening (2 minutes)**
"Welcome to Spiralogic - a symbolic intelligence system that combines ancient elemental wisdom with modern cognitive science. Each of you will be assigned an agent tuned to your personal patterns and optimal growth pathways."

### **Element Introduction (3 minutes)**  
"Our system recognizes 5 elemental orientations:
- **Fire**: Action and agency  
- **Water**: Depth and emotional intelligence
- **Earth**: Structure and sustainable systems
- **Air**: Pattern recognition and clarity
- **Aether**: Integration and synthesis"

### **Experience Invitation (1 minute)**
"You'll now experience your personalized symbolic intelligence. Notice how your agent's communication style matches your elemental orientation and professional needs."

### **Closing Discussion (10 minutes)**
- "What surprised you about your agent's responses?"
- "How might this apply to your current projects or challenges?" 
- "What potential do you see for conscious professionals?"

---

## 📊 **Success Metrics**

Track these during the demo:
- Engagement level with each agent type
- Quality of questions asked by participants  
- "Aha moments" about elemental differences
- Interest in professional applications
- Requests for follow-up or implementation

This demo positions Spiralogic as a sophisticated tool for conscious professionals while maintaining its unique symbolic intelligence approach.