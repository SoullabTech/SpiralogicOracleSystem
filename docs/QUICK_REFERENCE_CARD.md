# 🪞 Soullab Beta — Quick Reference Card

*(Keep this open while coding — companion to CLAUDE_CODE_PLAYBOOK.md)*

---

## 🎯 8 Core Prompts (One-Liners)

| # | Focus | Quick Prompt |
|---|-------|--------------|
| 1 | **Audit** | "Review codebase for complexity debt, dead code, console.logs" |
| 2 | **Polish** | "Apply Soullab colors + typography, add micro-interactions" |
| 3 | **A11y** | "Add ARIA labels, keyboard nav, reduced motion fallbacks" |
| 4 | **Stability** | "Test voice/text hybrid, Safari audio unlock, error handling" |
| 5 | **Analytics** | "Verify event_logs writes, dashboard APIs, Supabase performance" |
| 6 | **Design** | "Export Figma tokens, sync Soullab palette across all components" |
| 7 | **Deploy** | "Run pre-flight checklist, cleanup scripts, build verification" |
| 8 | **Sacred** | "Plan ceremonial layer: gentle auras, breathing, sacred geometry" |

---

## 🎨 Soullab Brand Tokens

### Colors (No Purple!)
```css
--soullab-terracotta: #E07A5F;  /* Alerts, failures */
--soullab-sage: #81B29A;        /* Success, positive */
--soullab-ocean: #3D405B;       /* Primary, trends */
--soullab-amber: #F2CC8F;       /* Highlights, active */
--soullab-stone: #918C7E;       /* System theme */
```

### Typography
- **Headers**: Blair Serif (32px/24px/18px)
- **Body**: Lato Sans (16px regular, 14px small)
- **Monospace**: JetBrains Mono (code, logs)

### Motion Rules
- **Breathing**: 1.6s ease-in-out cycles
- **Stagger**: 150ms between elements  
- **Hover**: max scale(1.05), 150ms transition
- **Reduced Motion**: Respect `prefers-reduced-motion`

---

## 📊 Beta Success Benchmarks

| Metric | Target | Critical |
|--------|--------|----------|
| 🎤 Audio Unlock | 85%+ overall | 75%+ Safari |
| ⏱️ API Response | <2s average | <5s max |
| 💬 Reflections | 60%+ completion | 40%+ minimum |
| 🎨 Theme Active | 80%+ choose explicit | 60%+ minimum |
| 🧭 Engagement | 5+ min session | 3+ messages |
| 🚨 Error Rate | <5% of sessions | <10% maximum |

---

## ✅ Go / No-Go Deploy Checklist

### Core Functionality
- [ ] Audio unlock works Safari + Chrome + Firefox
- [ ] Voice ↔ text switching in HybridInput  
- [ ] Maia responses stream + play audio
- [ ] Reflections save to Supabase
- [ ] Theme toggle persists across sessions

### Analytics Ready  
- [ ] /api/analytics/overview returns <2s
- [ ] Event logging writes to event_logs table
- [ ] Dashboard widgets use soullabColors
- [ ] No console.errors in production build

### Brand Compliance
- [ ] No purple/indigo/violet colors anywhere
- [ ] Blair + Lato fonts loading correctly
- [ ] Soullab palette applied consistently
- [ ] Motion respects reduced-motion preference

### Performance
- [ ] Bundle size <500KB gzipped
- [ ] Core Web Vitals passing
- [ ] Error boundaries catch failures
- [ ] Memory leaks cleaned up

---

## 🛠️ Key Files to Monitor

```
📁 High-Impact Components
├── components/voice/ContinuousConversation.tsx
├── components/chat/ChatInput.tsx
├── components/OracleInterface.tsx
├── hooks/useMayaStream.ts
└── components/ui/ThemeToggle.tsx

📁 Analytics Pipeline  
├── app/api/analytics/overview/route.ts
├── app/api/analytics/theme/route.ts
└── components/dashboard/OverviewDashboard.tsx

📁 Brand System
├── lib/theme/soullabColors.ts
├── tailwind.config.js
└── app/layout.tsx (fonts)
```

---

## 🔥 Emergency Debug Commands

```bash
# Quick health check
npm run typecheck && npm run build

# Clear caches
npm run dev -- --reset-cache
rm -rf .next/ && npm run build

# Test voice pipeline
open http://localhost:3000 
# → Try voice input on Safari + Chrome

# Check analytics
curl http://localhost:3000/api/analytics/overview
# → Should return <2s with real data

# Verify Supabase connection  
npm run test:supabase
```

---

## 🎭 Sacred Technology Principles

1. **Everyday Sacred** — Soulful but not mystical
2. **Performance First** — Sacred never slows experience
3. **Graceful Degradation** — Text works if voice fails
4. **Accessibility Always** — Screen readers + keyboard nav
5. **Brand Consistency** — Earthy palette, clean typography
6. **Error Empathy** — Helpful messages, never blame user

---

## 📞 Escalation Paths

- **Voice Issues** → Test Safari audio context unlock
- **Analytics Broken** → Check Supabase RLS policies  
- **UI Regression** → Verify soullabColors imports
- **Performance** → Bundle analyzer + Core Web Vitals
- **Deploy Blocked** → Run full Prompt 7 checklist

---

⚡ **Pro Tip**: Keep this card pinned while running any of the 8 main prompts from `CLAUDE_CODE_PLAYBOOK.md`

*Last updated: 2025-01-06*