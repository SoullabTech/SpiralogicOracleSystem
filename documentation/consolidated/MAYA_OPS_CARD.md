# 🔮 Maya Production Ops Card
**Quick Reference for On-Call Team**

## 🚀 Start Maya (30 seconds)
```bash
./scripts/check-keys.sh && cd backend && APP_PORT=3002 ./maya-quick-start.sh
```

## 🔍 Health Checks
| Check | Command | Green Light |
|-------|---------|-------------|
| **Uptime** | `curl -s localhost:3002/api/v1/ops/ping` | `"ok": true` |
| **Features** | `curl -s localhost:3002/api/v1/converse/health \| jq .status` | `"ready"` |
| **Pipeline** | `curl -s localhost:3002/api/v1/converse/message -X POST -H 'Content-Type: application/json' -d '{"userText":"test","userId":"ops","element":"earth"}'` | Response in ~6s |

## ⚡ Emergency Fixes
| Issue | Fix | Time |
|-------|-----|------|
| **Port conflict** | `lsof -ti:3002 \| xargs kill -9` | 5s |
| **Missing keys** | `cp .env.development.template .env.local` → edit | 2min |
| **Server down** | `cd backend && ./maya-quick-start.sh` | 30s |

## 🟡 Expected Warnings (OK)
- Redis DNS lookup fails → In-memory rate limiting active
- Claude model deprecation → Still works, plan migration
- "Sesame CI transformation failed" → Draft response used

## 🔴 Red Alerts
- Health endpoint 500s → Check logs: `tail backend/maya-server.log`
- Message endpoint timeouts → API key issues or model outage
- "Missing required API keys" → Critical, fix immediately

## 📊 Quick Status
- **Ports**: 3002 (dev), 3001 (prod)
- **Rate Limits**: 60 msgs/min, 30 streams/min per IP
- **Models**: Air→Claude, Earth/Fire/Water→Elemental Oracle
- **Features**: Streaming SSE, Voice TTS, Safety moderation

---
**Emergency Contact**: Rotate API keys at vendor dashboards (OpenAI/Anthropic/ElevenLabs)  
**Updated**: Aug 2025 | **Status**: 🟢 Production Ready