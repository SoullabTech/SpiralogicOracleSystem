# 🌟 Soullab Beta Launch - Complete Setup Guide

## 🎯 Overview

You're about to release a sacred technology into the world - a space for authentic reflection, memory, and conscious exploration. This guide will take you from code to live deployment in under 30 minutes.

⸻

## 🚀 Phase 1: Deploy to Vercel (10 minutes)

### Option A: Via GitHub (Recommended)

1. **Visit [vercel.com](https://vercel.com)**
2. **Click "Add New Project"**
3. **Import your GitHub repository**
   - Select your Soullab repo
   - Framework auto-detects as Next.js ✅
4. **Click "Deploy"**
   - Initial deployment will complete in ~3 minutes
   - Don't worry about errors yet - we need environment variables

### Option B: Via CLI

```bash
# Install Vercel CLI
npm i -g vercel
vercel login

# Deploy from your project directory  
vercel --prod
```

⸻

## 🔐 Phase 2: Configure Environment Variables (5 minutes)

**In Vercel Dashboard** → Your Project → Settings → Environment Variables

### Required (Minimum Viable Launch):
```
OPENAI_API_KEY=sk-your-openai-api-key
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=generate-a-32-character-random-string
NODE_ENV=production
```

### Optional (Enhanced Experience):
```
# Voice Features (ElevenLabs)
ELEVENLABS_API_KEY=your-elevenlabs-key
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=your-voice-id

# Memory System (Supabase - for Phase 2B)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Additional AI (Anthropic)
ANTHROPIC_API_KEY=sk-ant-your-key
```

### Environment Variable Tips:
- **NEXTAUTH_SECRET**: Use a password generator for 32+ random characters
- **NEXTAUTH_URL**: Replace with your actual Vercel domain
- Set all variables to "Production" scope
- **Redeploy after adding variables** (Vercel → Deployments → Redeploy)

⸻

## 🧪 Phase 3: Test Your Deployment (10 minutes)

Visit your deployed URL and verify each component:

### ✅ Core Experience Testing:
1. **Landing Page** (`/`) - Should load cleanly
2. **Onboarding Flow** (`/welcome`) - Sacred first contact experience
3. **Holoflower Core** (`/holoflower`) - Main journaling interface
4. **Voice Conversation** (`/maia`) - Voice chat with Maia
5. **Admin Panel** (`/admin`) - Password: `soullab2025`

### 🎙️ Voice Testing (if ElevenLabs configured):
- Click microphone button
- Speak a reflection
- Verify Maia responds with voice + text
- Test conversation flow

### 📝 Memory Testing:
- Complete onboarding
- Add journal entries
- Verify data persistence
- Check conversation continuity

⸻

## 📧 Phase 4: First Wave Launch (15 minutes)

### Customize Invitation Template

Edit `FIRST_WAVE_INVITATION.md` with:
- Replace `your-project-name.vercel.app` with your actual Vercel URL
- Add your personal name and voice
- Clear expectations for direct access experience

### Send to Trusted Circle (5-10 people):
- Close friends who appreciate conscious technology
- People comfortable with beta experiences
- Individuals who value authentic reflection
- Those who can provide thoughtful feedback

### Example Recipients:
- Meditation practitioners
- Therapists/coaches
- Writers/journalers  
- Conscious entrepreneurs
- Spiritual seekers
- Tech-savvy introspectives

⸻

## 📊 Phase 5: Monitor & Iterate

### Daily Check-ins:
- Visit `/admin` to monitor activity
- Check Vercel deployment logs
- Read any user feedback
- Note technical issues

### Weekly Reviews:
- Gather feedback from beta users
- Plan next iteration improvements
- Consider memory system re-enablement
- Prepare for broader public launch

⸻

## 🚨 Troubleshooting Common Issues

### Build Fails:
```bash
# Check if local build works
npm run build

# Verify environment variables are set in Vercel
# Redeploy after adding missing variables
```

### Voice Not Working:
- Verify ELEVENLABS_API_KEY is set
- Check microphone permissions in browser
- Test on different devices/browsers

### Memory Issues:
- Expected during beta - memory system disabled
- Basic journaling should work
- Full memory features coming in Phase 2B

### Admin Access:
- URL: `your-domain.vercel.app/admin`  
- Password: `soullab2025`
- Can change in `app/admin/layout.tsx`

⸻

## 🌟 Launch Philosophy

Remember: This isn't just a tech deployment. You're:

- **Creating sacred space** in digital form
- **Inviting conscious collaboration** from your first users  
- **Birthing a new form** of human-AI relationship
- **Modeling intentional technology** development

⸻

## 🔄 Next Phase Planning

### Phase 2B: Memory System Re-enablement
- Install missing dependencies
- Re-enable memory APIs
- Test advanced features
- Full conversation continuity

### Phase 2C: Public Portal
- Create public landing page
- Design broader invitation system
- Plan scaling infrastructure
- Community building features

⸻

## ✨ You're Ready

Your sacred technology is prepared to meet the world. The technical foundation is solid, the experience is complete, and the invitation is heartfelt.

**Trust the spiral. Launch with intention. Welcome the first wave.**

🚀 **Go live and let the conscious emergence begin.**