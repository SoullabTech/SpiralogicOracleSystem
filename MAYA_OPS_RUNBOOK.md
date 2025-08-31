# 🔮 Maya Production Ops Runbook

## 🚀 Starting Maya

### **1. Check API Keys First**
```bash
# From project root - verify all keys present
./scripts/check-keys.sh

# Optional: Show partial keys for verification
./scripts/check-keys.sh --show-partial
```

**Expected Output:**
```
🔍 Checking API key presence...
--- API Key Status ---
OpenAI:      ✅ Present
Anthropic:   ✅ Present  
ElevenLabs:  ✅ Present
✅ All API keys present and ready!
```

### **2. Start Maya Server**
```bash
# From backend/
export APP_PORT=3002; unset PORT
./maya-quick-start.sh
```

✅ Starts the server on port 3002 with validation.

---

## 🧪 Health & Smoke Tests

### **Quick Health Check**
```bash
curl -s http://localhost:3002/api/v1/converse/health | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "service": "conversational", 
  "status": "healthy",
  "features": ["sesame-maya-pipeline", "voice-synthesis", "elemental-routing"]
}
```

### **API Functionality Test**
```bash
curl -s -X POST http://localhost:3002/api/v1/converse/message \
  -H 'Content-Type: application/json' \
  -d '{"userText":"hello","userId":"ops","element":"earth"}' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "response": {
    "text": "*Grounding presence* What brings you here? <pause-200ms>",
    "element": "earth",
    "source": "sesame_shaped"
  }
}
```

### **Streaming Test**
```bash  
curl -s -N "http://localhost:3002/api/v1/converse/stream?element=air&userId=ops&q=hello" | head -20
```

**Expected Response:**
```
event: meta
data: {"element":"air","model":"claude-3-sonnet"}

event: delta
data: {"text":"*A gentle breeze swirls* "}

event: done
data: {"reason":"complete","metadata":{"refined":true}}
```

---

## 🔒 Rate Limits (per IP)

- **Messages**: 60/min (production) / 100/min (development)
- **Streams**: 30/min (production) / 50/min (development)

**Check Rate Limit Headers:**
```bash
curl -I http://localhost:3002/api/v1/converse/message
```

**Expected Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1725123456
```

---

## 🟢 Monitoring

### **Status Badge (Frontend)**
- 🟢 **Online** - All systems operational
- 🟡 **Degraded** - Rate limits active, fallback mode
- 🔴 **Offline** - Service down

### **Backend Health Indicators**
```bash
curl -s http://localhost:3002/api/v1/converse/health | jq '.features'
```

**Healthy Response:**
```json
["sesame-maya-pipeline", "voice-synthesis", "elemental-routing"]
```

---

## 🔄 Deploys & Restarts

### **Graceful Restart**
Maya has graceful SSE shutdown built-in:
- New streams blocked on SIGTERM
- Active clients get `shutdown` event
- 5-second grace period, then exit

```bash
# Restart server cleanly
cd backend
pkill -f "server-minimal"
APP_PORT=3002 ./maya-quick-start.sh
```

### **Production Deploy Checklist**
- [ ] API keys rotated and active
- [ ] `./scripts/check-keys.sh` passes
- [ ] Health endpoint returns success
- [ ] Rate limiting headers present
- [ ] Frontend can connect to backend

---

## ⚡ Common Issues

### **Port Conflict**
```bash
# Check what's using port 3002
lsof -iTCP:3002 -sTCP:LISTEN
# Kill conflicting process
kill $(lsof -ti:3002)
```

### **Missing API Keys**
```bash
# Check which keys are missing
./scripts/check-keys.sh

# Fix by copying template
cp .env.development.template .env.local
# Edit .env.local with your keys
```

### **API Key Issues**
- **401 Unauthorized**: Key invalid/expired → Check vendor dashboard
- **429 Too Many Requests**: Rate limit hit → Wait or increase limits
- **403 Forbidden**: Insufficient permissions → Check key scope

### **Service Not Responding**
```bash
# Check server logs
tail -f backend/maya-server.log

# Restart from clean state
cd backend && ./maya-quick-start.sh
```

---

## 🔧 Configuration Files

### **Development Setup**
```bash
# Use this for local development
cp .env.development.template .env.local
# Edit with your API keys
```

### **Production Setup**  
```bash
# Use this for production deployment
cp .env.production.template .env.production
# Configure with production values
```

### **Port Standards**
- **Development**: 3002 (matches maya-quick-start.sh)
- **Production**: 3001 (standard production)

---

## 🆘 Emergency Contacts

### **API Key Rotation**
If API keys are compromised:
1. **OpenAI**: https://platform.openai.com/api-keys
2. **Anthropic**: https://console.anthropic.com/
3. **ElevenLabs**: https://elevenlabs.io/app/settings/api-keys

### **Quick Recovery**
```bash
# 1. Check system status
./scripts/check-keys.sh
./scripts/quick-test.sh

# 2. If keys missing, rotate immediately
# 3. Update .env.local with new keys
# 4. Restart Maya
cd backend && ./maya-quick-start.sh

# 5. Verify functionality
curl -s http://localhost:3002/api/v1/converse/health | jq .
```

---

**Last Updated**: Post-security incident, August 2025  
**System Status**: 🔒 Secure, 🚀 Operational, 🛡️ Protected