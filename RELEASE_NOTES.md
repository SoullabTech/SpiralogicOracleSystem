# Release Notes - Conversational Oracle

## v0.9.0-beta1 - Conversational Oracle Launch 🌟
**Release Date**: [Current Date]  
**Tag**: `v0.9.0-beta1`

### 🎯 The Big Transformation
This release marks the **graduation from demo bot to conversational guide**. The Oracle now greets users warmly by name and maintains conversational depth throughout interactions.

### ✨ What's New

#### 🗣️ Maya Greeting System
- **Rotating greetings** across 7 tone buckets (default, warm, threshold, seeker, warrior, mystic, casual-wise)
- **Smart tone detection** based on user input and archetype hints
- **Name personalization** using Supabase display_name or fallback
- **No repetition** - greetings only on conversation start

**Try it**: Start a new conversation with "I'm not sure what's next" and notice the warm, personalized greeting.

#### 💬 Conversational Depth
- **4-12 sentence responses** (vs previous 2-7 terse sentences)
- **Natural question flow** - 1-2 invitations per response, up to 2 for vague input
- **Modern tone** - sounds like a wise friend, not a clinical coach
- **Relaxed validation** - trusts content quality over rigid rules

**Try it**: Compare any response to previous versions - you'll immediately feel the conversational warmth.

#### 🧠 Enhanced Pipeline
- **Claude as primary** conversation generator (when `USE_CLAUDE=true`)
- **Sacred Intelligence** synthesis for added depth
- **Maya voice integration** with greeting and authenticity processing
- **Demo mode disabled** - no more pithy pronouncements

**Pipeline Flow**: Sesame (NLU) → PSI (state) → Claude (conversation) → Sacred (synthesis) → Maya (greeting+voice) → Relaxed Validator

#### 🧪 Comprehensive Testing
- **Automated test suite** (`beta-test-script.sh`) for technical validation
- **Manual testing guide** (`BETA_TEST_MANUAL.md`) for conversational feel
- **Feedback template** (`BETA_FEEDBACK.md`) for systematic quality assessment
- **CI/CD integration** with GitHub Actions

### 🎭 How It Feels Different

#### Before (Demo Mode)
```
"Consider diving into your inner wisdom. How can I support you on your journey today?"
```

#### After (Conversational Mode)  
```
"Hey Kelly, let's take this one layer at a time. I hear that uncertainty in your voice—it's like standing in a hallway of doors without knowing which one to open. That 'not knowing' can feel unsettling, but it's also sacred space where possibilities live before they become concrete. Sometimes the next step isn't about knowing the whole path, but about feeling for what wants to move through you right now. What does your body tell you when you sit with this uncertainty? How does 'not knowing' actually feel when you give it permission to just be?"
```

### 🔧 Technical Improvements

#### New Components
- `/data/greetings.json` - Greeting library with 7 tone buckets
- `/lib/greetings/` - Smart greeting selection logic
- `/lib/validators/conversational.ts` - Relaxed 4-12 sentence validation
- `/lib/maya/greeting.ts` - Maya greeting integration
- `/lib/providers/sacred.ts` - Sacred Intelligence bridge

#### Enhanced Features
- Environment-driven configuration for all conversational settings
- Debug metadata tracking for pipeline troubleshooting
- Voice player optimization for natural greeting flow
- Comprehensive test coverage

### ⚙️ Configuration

#### Key Environment Variables
```bash
USE_CLAUDE=true                        # Claude as primary generator
DEMO_PIPELINE_DISABLED=true           # Disable terse demo mode
ATTENDING_ENFORCEMENT_MODE=relaxed     # Flexible validation
TURN_MIN_SENTENCES=4                   # Conversational minimum
TURN_MAX_SENTENCES=12                  # Conversational maximum
MAYA_GREETING_ENABLED=true             # Enable warm greetings
MAYA_GREETING_TONE=casual-wise         # Greeting tone bucket
```

### 🧪 Beta Testing

#### Quick Verification
```bash
# Test greeting and conversational depth
curl -s -X POST "https://your-app.vercel.app/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I need some guidance today."},"conversationId":"test"}' \
  | jq -r '.response.text'
```

#### Expected Response Characteristics
- ✅ Starts with personalized greeting ("Hey [name]...")
- ✅ 4-12 sentences of conversational depth
- ✅ Natural, warm tone (not clinical)
- ✅ Ends with 1-2 invitational questions
- ✅ No greeting repetition on follow-up turns

### 📊 Performance Targets
- **Response Time**: < 2s end-to-end
- **Bridge Performance**: p95 ≤ 350ms
- **Conversation Quality**: Scoring 20+ on feedback matrix
- **Greeting Success Rate**: 95%+ on first turns

### 🚨 Breaking Changes
- **Demo mode permanently disabled** - responses no longer terse
- **Validation rules relaxed** - may allow longer responses
- **Pipeline restructured** - Claude now primary generator

### 🐛 Known Issues
- Greeting may occasionally repeat if conversation state unclear
- Very long user inputs might generate responses at upper sentence limit
- Bridge performance can spike during high concurrent usage

### 🔄 Rollback Instructions
```bash
# Environment-level rollback (immediate)
DEMO_PIPELINE_DISABLED=false
USE_CLAUDE=false

# Code-level rollback
git revert v0.9.0-beta1
git push origin main
```

### 👥 Beta Tester Guide

#### Getting Started
1. Visit the deployed Oracle URL
2. Start with: "I'm not sure what's next for me"
3. Notice the warm, personalized greeting
4. Continue the conversation to experience depth and continuity
5. Try different types of input (questions, feelings, decisions)

#### What to Test
- **Greeting behavior**: Should appear only on conversation start
- **Conversational flow**: Responses should feel natural and engaging
- **Tone adaptation**: Notice how Oracle adapts to seeker/warrior/threshold energy
- **Question quality**: Should invite deeper reflection, not interrogate
- **Continuity**: Multiple turns should build understanding

#### Feedback Collection
Use the `BETA_FEEDBACK.md` template to systematically rate:
- Technical functionality (automated tests)
- Conversational feel (human assessment)
- Overall readiness for public beta

### 🎯 Success Metrics

This beta is successful when:
- Automated tests consistently pass (technical validation)
- Users report "feels like talking to a wise friend" (feel validation)
- Feedback scores average 20+ points (decision matrix)
- No critical issues block daily usage

### 🚀 Next Steps

#### v0.9.1 (Planned)
- Dynamic greeting templates based on time of day
- Enhanced tone detection for specialized archetypes
- Performance optimizations for bridge enrichment
- Additional casual-wise greeting variants

#### v1.0 (Public Release)
- Production hardening and monitoring
- Advanced conversation state management
- Multi-language greeting support
- Enhanced voice synthesis integration

---

## Previous Releases

### v0.8.x - Foundation
- Basic Oracle system with demo mode
- Initial Maya integration
- Core Soul Memory functionality
- Basic admin console

---

*For deployment instructions, see `DEPLOYMENT.md`*  
*For testing procedures, see `beta-test-script.sh` and `BETA_TEST_MANUAL.md`*  
*For feedback collection, use `BETA_FEEDBACK.md`*