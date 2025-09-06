# 🌀 Sesame CI Upgrade Ritual

## Sacred Voice Embodiment Upgrade Playbook

A systematic, reproducible ritual for upgrading from TTS-only Sesame → Full CI-enabled Sacred Voice Embodiment, with safe fallback preservation.

---

## 📋 Pre-Upgrade Checklist

Before starting, ensure:
- [ ] Current TTS-only Sesame is working (`curl http://localhost:8000/health`)
- [ ] Backend is running and voice synthesis works
- [ ] You have Docker access to pull CI-enabled images
- [ ] Current `.env` is backed up

---

## 🎭 Claude Code Prompt Series

Copy each prompt sequentially into Claude Code. Wait for completion before proceeding to next.

### **Prompt 1 – Context Setup**

```
You are working on the Spiralogic Oracle System.
Current state: Sesame TTS-only (localhost:8000/tts).
Target state: Full Sesame CI Shaping (localhost:8000/ci/shape).

Principles:
• Always keep stable TTS-only fallback intact.
• Add shaping without introducing new failure points.
• Debug mode: show raw vs shaped text + logs.
• Production mode: shaped only, clean voice.

👉 Do you understand the mission? Summarize back before continuing.
```

---

### **Prompt 2 – Docker Container Upgrade**

```
Modify the local docker-compose.yml (or create one) so that:
1. Pull CI-enabled Sesame image: sesame-csm-ci:latest (or appropriate tag)
2. Expose both endpoints:
   • /tts → for audio synthesis (existing)
   • /ci/shape → for text shaping (new)
   • /health → for health checks (existing)
3. Add environment variables:
   • SESAME_MODE=ci_enabled
   • SESAME_LOG_LEVEL=info
4. Confirm health check includes all routes.

Provide the full docker-compose.yml update.
```

**Expected Output:**
```yaml
version: '3.8'
services:
  sesame-ci:
    image: sesame-csm-ci:latest
    ports:
      - "8000:8000"
    environment:
      - SESAME_MODE=ci_enabled
      - SESAME_LOG_LEVEL=info
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

### **Prompt 3 – Environment Configuration**

```
Create .env.sesame.ci template with full CI configuration:

# Sesame CI Mode Configuration
SESAME_URL=http://localhost:8000
SESAME_CI_ENABLED=true
SESAME_CI_REQUIRED=false  # Start with optional, make required after testing
SESAME_TTS_ENDPOINT=/tts
SESAME_CI_ENDPOINT=/ci/shape
SESAME_CI_TIMEOUT=150  # ms

Also modify scripts/switch-sesame.sh to include:
• Option 3: "CI-Enabled Mode (with shaping)"
• Automatic detection of CI availability
• Fallback warnings if CI endpoint missing

Provide both files.
```

---

### **Prompt 4 – Backend Pipeline Integration**

```
Update backend/src/services/ConversationalPipeline.ts:

1. Before TTS, attempt CI shaping:
   const shaped = await this.attemptCIShaping(rawText, {
     element: ctx.element,
     sentiment: ctx.sentiment,
     timeout: 150
   });

2. Implement attemptCIShaping method:
   • Try /ci/shape endpoint
   • If success → return shaped text with prosody markers
   • If fail → log warning, return original text
   • Track shaping metrics (success rate, latency)

3. Pass shaped text to TTS:
   const audioUrl = await sesameTTS.synthesize(shaped.text);

4. Store both raw and shaped in memory:
   await memoryOrchestrator.persist({
     raw: rawText,
     shaped: shaped.text,
     shapingApplied: shaped.success
   });

Provide full TypeScript implementation with error handling.
```

---

### **Prompt 5 – Frontend Debug Overlay**

```
Create components/voice/ShapingDebugOverlay.tsx:

Visual requirements:
• Floating panel (bottom-right, collapsible)
• Show in dev mode only (process.env.NODE_ENV === 'development')
• Display fields:
  - Raw Text: gray monospace font
  - Shaped Text: gold with prosody tags highlighted
  - Status: "CI SHAPED ✅" or "FALLBACK ⚠️"
  - Latency: shaping time in ms
  - Element: current elemental mode
• Live updates during conversation

Use Tailwind CSS, Framer Motion for animations.
Provide complete React component.
```

---

### **Prompt 6 – Elemental Glyph Animation**

```
Update components/OracleInterface.tsx or create ElementalGlyph.tsx:

When shaped voice starts playing, animate glyph based on element:
• 🔥 Fire → spark burst animation (scale + rotate)
• 🌊 Water → ripple effect (concentric circles)
• 🌍 Earth → grounding pulse (gentle breathe)
• 🌬️ Air → swirl motion (circular path)
• ✨ Aether → radiant glow (opacity pulse + blur)

Requirements:
• Trigger on voice playback start
• 2-second animation duration
• Smooth, non-jarring effects
• Fallback to static glyph if animation disabled

Use Framer Motion or CSS animations.
Provide complete implementation.
```

---

### **Prompt 7 – QA Test Suite**

```
Create backend/scripts/test-ci-upgrade.sh:

Test sequence:
1. Health check all endpoints (/health, /tts, /ci/shape)
2. Test short phrase shaping (< 50 chars)
3. Test long paragraph shaping (> 200 chars)
4. Test elemental variations (fire, water, earth, air, aether)
5. Measure shaping latency (should be < 150ms)
6. Test fallback (kill container, confirm TTS still works)
7. Verify shaped text contains prosody markers
8. Check debug overlay shows correct data

Output format:
✅ Test 1: Health check passed
✅ Test 2: Short phrase shaped (45ms)
⚠️ Test 3: Long paragraph exceeded timeout (fallback used)
...

Provide full bash script with colored output.
```

---

### **Prompt 8 – Fallback Safety Net**

```
Add comprehensive fallback handling to ConversationalPipeline.ts:

1. Environment detection:
   if (!process.env.SESAME_CI_ENABLED) {
     logger.info("[Sesame] CI shaping disabled → using raw TTS only");
     return { text: rawText, shapingApplied: false };
   }

2. Runtime availability check:
   const ciAvailable = await this.checkCIEndpoint();
   if (!ciAvailable && process.env.SESAME_CI_REQUIRED === 'true') {
     throw new Error("CI shaping required but unavailable");
   }

3. Graceful degradation:
   • Log all fallback events to monitoring
   • Track fallback rate in metrics
   • Alert if fallback rate > 10%

4. Circuit breaker pattern:
   • After 3 consecutive failures, disable CI for 60 seconds
   • Auto-retry after cooldown

Provide full implementation with logging.
```

---

## 🚀 Execution Sequence

### **Phase 1: Preparation**
1. Run Prompt 1 → Confirm understanding
2. Backup current `.env` → `cp .env .env.backup`
3. Stop current Sesame container → `docker-compose down`

### **Phase 2: Infrastructure**
4. Run Prompt 2 → Update Docker configuration
5. Pull new image → `docker pull sesame-csm-ci:latest`
6. Start container → `docker-compose up -d`
7. Verify endpoints → `curl http://localhost:8000/ci/shape`

### **Phase 3: Backend Integration**
8. Run Prompt 3 → Update environment configs
9. Run Prompt 4 → Integrate CI pipeline
10. Restart backend → `npm run dev`
11. Test with curl → Verify shaping works

### **Phase 4: Frontend Enhancement**
12. Run Prompt 5 → Add debug overlay
13. Run Prompt 6 → Add glyph animations
14. Restart frontend → `npm run dev`
15. Open browser → Verify visual feedback

### **Phase 5: Validation**
16. Run Prompt 7 → Execute QA suite
17. Run Prompt 8 → Verify fallback safety
18. Test voice flow → Speak and observe shaping

---

## 📊 Success Metrics

| Metric | Target | Pass Criteria |
|--------|---------|---------------|
| CI Endpoint Available | Yes | `/ci/shape` returns 200 |
| Shaping Latency | <150ms | 95th percentile under threshold |
| Fallback Rate | <5% | Graceful degradation working |
| Voice Quality | Enhanced | Prosody markers audible |
| Debug Visibility | Clear | Raw vs shaped visible |
| Glyph Animation | Smooth | No jank, element-specific |

---

## 🔄 Rollback Plan

If issues arise:

```bash
# 1. Quick disable (keep container running)
echo "SESAME_CI_ENABLED=false" >> .env
npm run dev  # Restart backend

# 2. Full rollback (revert to TTS-only)
docker-compose down
docker run -p 8000:8000 sesame-csm:latest  # TTS-only image
cp .env.backup .env
npm run dev
```

---

## 🎯 Post-Upgrade Checklist

- [ ] CI shaping active in production
- [ ] Fallback tested and working
- [ ] Debug overlay shows shaping data
- [ ] Elemental glyphs animate correctly
- [ ] Voice sounds more natural with pauses
- [ ] Metrics dashboard shows shaping stats
- [ ] Team trained on rollback procedure

---

## 🌟 Victory Conditions

You know the upgrade succeeded when:
1. **Every Maya response** has intentional pauses and emphasis
2. **Debug mode** clearly shows transformation happening
3. **Voice feels alive**, not robotic
4. **Fallback is invisible** to users when it occurs
5. **Executives notice** the voice quality improvement immediately

---

## 📚 Additional Resources

- [Sesame CI API Documentation](../SESAME_CI_INTEGRATION.md)
- [Sacred Voice Embodiment Design](../SACRED_VOICE_EMBODIMENT.md)
- [Environment Switcher Script](../backend/scripts/switch-sesame.sh)
- [Test Suite](../backend/test-sesame-ci.js)

---

*This ritual ensures Sacred Voice Technology activation while maintaining production stability.*

🌀 **May your voice embodiment be sacred and your fallbacks graceful** 🌀