# 🔮 Maya Production Ops Runbook - Print Version
**Complete Operational Guide for Production Maya System**

---

## 🚀 Starting Maya

### **1. Pre-flight API Key Check**
```bash
# Verify all keys present with source reporting
./scripts/check-keys.sh --show-partial
```

**Expected Output:**
```
--- API Key Status ---
Environment: development
Config Sources: .env, .env.local, backend/.env
OpenAI:      ✅ sk-proj-***[52 chars]***l8A
Anthropic:   ✅ sk-ant-***[58 chars]***AAA  
ElevenLabs:  ✅ sk_***[34 chars]***9b6
✅ All API keys present and ready!
```

### **2. Start Maya Server**
```bash
# From backend/ directory
export APP_PORT=3002; unset PORT
./maya-quick-start.sh
```

✅ Starts server on port 3002 with built-in validation.

---

## 🟢 Sanity Flow Verification (Final Pre-Production Test)

**Run this before opening Maya to public traffic:**

```bash
# 1. Verify API keys are present
./scripts/check-keys.sh

# 2. Start clean with validation built-in
cd backend && APP_PORT=3002 ./maya-quick-start.sh

# 3. Health check (all systems should be green)
curl -s http://localhost:3002/api/v1/converse/health | jq .

# 4. Conversational test (Earth → Claude → Sesame/Maya Refiner)
curl -s -X POST http://localhost:3002/api/v1/converse/message \
  -H 'Content-Type: application/json' \
  -d '{"userText":"short grounding ritual for sleep","userId":"ops","element":"earth"}' | jq .

# 5. Streaming sanity check (Air element with breath markers)
curl -s -N "http://localhost:3002/api/v1/converse/stream?element=air&userId=ops&q=hello" \
  -H "Accept: text/event-stream" | head -20
```

### ✅ What a Green-Light Flow Looks Like
- **API Keys**: Present and validated
- **Server**: Running on port 3002  
- **Health**: Returns `"success": true`, `"service": "conversational"`
- **Message Response**: 5–7s response with breath markers, ~200–250 tokens
- **Streaming**: Event stream shows meta → delta with refined text
- **Rate Limiting**: Headers show `X-RateLimit-Limit` and `X-RateLimit-Remaining`

### ⚠️ Minor Expected Warnings
- Claude deprecation notice (non-blocking, still functions)
- "Sesame CI transformation failed" occasionally → graceful fallback  
- Redis DNS lookup fails if no container → in-memory fallback

---

## 🧪 Health & Monitoring

### **Quick Health Check**
```bash
curl -s http://localhost:3002/api/v1/converse/health | jq .
```

### **External Monitor Ping**
```bash
curl -s http://localhost:3002/api/v1/ops/ping | jq .
```
**Response**: `{"ok": true, "uptime": 3600, "timestamp": 1693516800, "service": "maya"}`

### **Streaming Test**
```bash
curl -s -N "http://localhost:3002/api/v1/converse/stream?element=air&userId=ops&q=hello" | head -20
```

---

## ⚡ Common Issues & Fixes

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

---

## 📊 Rate Limits & Configuration

### **Rate Limits (per IP)**
- **Messages**: 60/min (production) / 100/min (development)
- **Streams**: 30/min (production) / 50/min (development)

### **Port Standards**
- **Development**: 3002 (matches maya-quick-start.sh)
- **Production**: 3001 (standard production)

### **Model Routing**
- **Air**: Claude 3.5 Sonnet
- **Earth/Fire/Water**: Elemental Oracle 2.0  
- **Aether**: Elemental Oracle 2.0

---

## 🔒 Security & Emergency Contacts

### **API Key Rotation (If Compromised)**
1. **OpenAI**: https://platform.openai.com/api-keys
2. **Anthropic**: https://console.anthropic.com/
3. **ElevenLabs**: https://elevenlabs.io/app/settings/api-keys

### **Quick Recovery**
```bash
# 1. Check system status
./scripts/check-keys.sh && ./scripts/quick-test.sh

# 2. If keys missing, rotate immediately
# 3. Update .env.local with new keys
# 4. Restart Maya
cd backend && ./maya-quick-start.sh

# 5. Verify functionality  
curl -s http://localhost:3002/api/v1/converse/health | jq .
```

---

## 🎯 Production Status Summary

✅ **Security**: Keys secured, CI enforced, no git leaks  
✅ **Monitoring**: Dual endpoints (ping + health)  
✅ **Operations**: Fail-fast startup, documented procedures  
✅ **Pipeline**: Claude → Sesame/Maya proven end-to-end  
✅ **Team Ready**: On-call procedures documented

### 🟢 Status: Production Ready
When all sanity flow conditions are met, Maya is fully secure, hardened, and operational at scale.

---

**Last Updated**: August 2025 - Production Ready ✅  
**System Status**: 🟢 **OPERATIONAL** - Maya pipeline verified end-to-end  
**Print Version**: 1.0 - Ready for team distribution and ops area mounting