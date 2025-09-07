# Production Test Commands

Copy-paste these commands once your deployments are complete:

## Set Backend URL (Update This!)
```bash
# Set once - replace with your actual Render backend URL
BACKEND="https://your-render-backend.onrender.com/api/v1"
```

## Test Commands

### Health Check
```bash
curl -s "$BACKEND/converse/health" | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "service": "conversational", 
  "pipeline": "sesame-maya",
  "features": {
    "streaming": true,
    "sesamaRefinement": true,
    "breathMarkers": true
  },
  "models": {
    "air": "claude-3-5-sonnet"
  },
  "apiKeys": {
    "anthropic": true,
    "openai": true
  }
}
```

### Text Message (Earth Element)
```bash
curl -s -X POST "$BACKEND/converse/message" \
  -H 'Content-Type: application/json' \
  -d '{"userText":"gentle evening grounding","userId":"smoke","element":"earth"}' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "response": {
    "text": "Let's practice gentle grounding together... <pause-250ms>",
    "element": "earth",
    "source": "sesame_shaped"
  }
}
```

### Streaming (Air/Claude)
```bash
curl -s -N "$BACKEND/converse/stream?element=air&userId=smoke&q=hello" | head -20
```

**Expected Response:**
```
event: meta
data: {"element":"air","lang":"en-US","model":"claude-3-sonnet"}

event: delta
data: {"text":"*A gentle breeze swirls as I speak with calm presence* "}

event: delta  
data: {"text":"let's clarify your path forward... <breath/0.2>"}

event: done
data: {"reason":"complete","metadata":{"refined":true}}
```

## Rate Limiting Test
```bash
# This should return rate limit headers
curl -I "$BACKEND/converse/message"
```

**Expected Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

## Frontend Test (Update URL)
```bash
# Replace with your Vercel URL
curl -s https://your-vercel-app.vercel.app | grep -q "Maya"
```

---

## Quick Success Checklist
- [ ] Health endpoint returns `"success": true`
- [ ] API keys show as `true` in health check
- [ ] Message endpoint returns refined text
- [ ] Streaming shows `event: meta` and `event: delta`
- [ ] Rate limit headers appear
- [ ] Frontend loads without errors

## Troubleshooting
- **401 errors**: Check `ANTHROPIC_API_KEY` in Render environment
- **CORS errors**: Verify Vercel URL is in allowed origins
- **Streaming hangs**: Check SSE headers and proxy settings
- **429 errors**: Rate limiting is working (expected after ~30-60 requests)