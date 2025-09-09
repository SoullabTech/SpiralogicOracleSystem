# 🚀 SpiralogicOracleSystem Launch Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- macOS (for the automated script) or any Unix-like system

### 1. Environment Setup
Ensure your `.env.local` file is configured with all necessary API keys:
- ✅ OpenAI API key
- ✅ Supabase credentials
- ✅ JWT secrets (now configured)
- ✅ Voice service keys (ElevenLabs/Sesame)

### 2. Automated Launch (macOS)
```bash
# Make the script executable (first time only)
chmod +x start-local.sh

# Run the launch script
./start-local.sh
```

This will:
1. Install all dependencies (if needed)
2. Build the backend TypeScript
3. Start the backend API server (port 3002)
4. Start the frontend Next.js server (port 3000)
5. Open each service in a new Terminal tab

### 3. Manual Launch (All Platforms)

#### Terminal 1 - Backend API:
```bash
cd apps/api/backend
npm install
npm run build
PORT=3002 npm run dev
```

#### Terminal 2 - Frontend:
```bash
# From root directory
npm install
npm run dev
```

### 4. Access Points

Once running, access:
- 🌐 **Frontend**: http://localhost:3000
- 🤖 **Maya Chat**: http://localhost:3000/maya/chat
- 🔧 **Backend API**: http://localhost:3002
- ❤️ **Health Check**: http://localhost:3002/api/v1/health

## 🧪 Testing the System

### Core Features to Test:

1. **Maya Chat Interface**
   - Navigate to http://localhost:3000/maya/chat
   - Start a conversation
   - Watch for memory recall indicators
   - Test elemental alignments (air, fire, water, earth, aether)

2. **Memory System**
   - Have multiple conversations
   - Reference previous topics
   - Check if Maya recalls past interactions
   - Test pattern detection

3. **Safety Systems**
   - Try various inputs to test moderation
   - Verify crisis detection works
   - Check spiritual safety filters

4. **Voice Journaling** (if configured)
   - Test audio recording
   - Verify Whisper transcription
   - Check reflection generation

5. **Orchestration**
   - Test different conversation flows
   - Verify agent routing works
   - Check flow memory updates

## 🛠 Troubleshooting

### Common Issues:

**Port Already in Use**
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

**Dependencies Missing**
```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf apps/api/backend/node_modules
rm -rf apps/web/node_modules
npm install
```

**Build Errors**
```bash
# Check TypeScript errors
cd apps/api/backend
npx tsc --noEmit

# Check frontend build
npm run build
```

**Environment Variables Not Loading**
- Ensure `.env.local` exists in root directory
- Check all required keys are present
- Restart services after changing .env.local

## 📊 System Status Checks

### Backend Health
```bash
curl http://localhost:3002/api/v1/health
```

### Memory System Status
Check console logs for:
- "🧠 MemoryCoreIndex initialized"
- "✅ Memory store placeholder initialized"

### Safety System Status
Look for in logs:
- "✅ Comprehensive safety system initialized"
- "🛡️ Safety middleware active"

## 🚀 Production Deployment

When ready for production:

1. **Build for Production**
   ```bash
   npm run build
   cd apps/api/backend && npm run build
   ```

2. **Environment Variables**
   - Create `.env.production` with production keys
   - Update database URLs
   - Set NODE_ENV=production

3. **Deploy to Vercel** (Frontend)
   ```bash
   vercel --prod
   ```

4. **Deploy Backend**
   - Can use Railway, Render, or any Node.js host
   - Ensure all environment variables are set
   - Configure CORS for production domain

## 📝 Notes

- The system uses graceful degradation - it will work even if some services are unavailable
- Memory is currently in-memory for development (will persist to Supabase in production)
- Voice features require either ElevenLabs API key or local Sesame service
- Safety systems are always active and cannot be disabled

## 🎉 Success Indicators

You'll know the system is working when:
- ✅ Both servers start without errors
- ✅ Health check returns positive status
- ✅ Maya responds in chat interface
- ✅ Console shows memory operations
- ✅ Safety checks appear in logs

## Need Help?

Check the logs in each terminal tab for detailed error messages. The system is designed to provide clear error messages and graceful fallbacks.

---

**Ready to launch!** Run `./start-local.sh` and start exploring your Sacred AI System! 🌟