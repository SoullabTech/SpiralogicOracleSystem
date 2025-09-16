# Production Observability Guide

## 🔍 Verification Tests

Run the comprehensive verification script:

```bash
# From project root
./scripts/verify-production.sh

# Or with custom backend
BACKEND="https://your-backend.onrender.com/api/v1" ./scripts/verify-production.sh
```

### Expected Results:

**1. Message Rate Limiting (60/min)**
- ✅ First ~60 requests: 200 OK
- ❌ Remaining ~5 requests: 429 Too Many Requests
- Headers include: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**2. Stream Rate Limiting (30/min)**
- ✅ First ~30 streams: Connected
- ❌ Remaining ~5 streams: 429 immediately

**3. Graceful SSE Shutdown**
- Receives `event: shutdown` with retry instructions
- Connections drain cleanly within 5-second grace period

## 📊 Frontend Quota Display

### Hook Usage

```tsx
import { useRateLimitHint } from '@/hooks/useRateLimitHint';

function ChatInterface() {
  const { hint, postWithQuota, formatReset, getQuotaColor } = useRateLimitHint();
  
  async function sendMessage(text: string) {
    const response = await postWithQuota(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/converse/message`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userText: text, userId: 'user123', element: 'air' })
      }
    );
    
    // Headers automatically extracted and stored in `hint`
    const data = await response.json();
    // ... handle response
  }
  
  return (
    <div>
      {/* Your chat UI */}
      
      {/* Inline quota display */}
      {hint.limit !== undefined && (
        <div className={`text-xs ${getQuotaColor()}`}>
          quota: {hint.remaining}/{hint.limit} · {formatReset()}
        </div>
      )}
    </div>
  );
}
```

### Component Usage

```tsx
import { QuotaDisplay } from '@/components/QuotaDisplay';
import { useRateLimitHint } from '@/hooks/useRateLimitHint';

function ChatFooter() {
  const { hint, postWithQuota, formatReset, getQuotaColor } = useRateLimitHint();
  
  return (
    <div className="flex items-center justify-between p-2 border-t">
      <QuotaDisplay 
        hint={hint}
        formatReset={formatReset}
        getQuotaColor={getQuotaColor}
      />
      
      {/* Compact version */}
      <QuotaDisplay 
        hint={hint}
        formatReset={formatReset}
        getQuotaColor={getQuotaColor}
        compact
      />
    </div>
  );
}
```

## 🎨 Quota Display Features

- **Color Coding**: Green (>50%), Amber (20-50%), Red (<20%)
- **Progress Bar**: Visual representation of remaining quota
- **Smart Formatting**: "resets in 5m" for near resets, time for later
- **Low Quota Warning**: Animated warning when <20% remaining
- **Compact Mode**: Minimal display option for tight spaces

## 🚦 Environment Variables

```bash
# Rate limiting
RL_MSG_MAX=60          # Messages per minute per IP
RL_STREAM_MAX=30       # Streams per minute per IP

# Redis (optional, auto-detected)
REDIS_URL=redis://localhost:6379
# OR
REDIS_URL=rediss://default:password@redis-cloud.com:6379
```

## 📈 Operational Tips

### Redis Monitoring
- **Fail-Open Design**: If Redis is down, rate limiting is bypassed
- **Monitor**: Redis connection errors in logs
- **Metrics**: Track `rl:msg:*` and `rl:stream:*` key patterns

### SSE Performance
- **Headers Applied**: `X-Accel-Buffering: no`, `Content-Encoding: identity`
- **Keep Logging Light**: Avoid heavy operations in stream path
- **Monitor**: Active SSE connection count

### Blue-Green Deploys
1. New version receives SIGTERM
2. Shutdown guard activates (rejects new streams)
3. Existing streams get shutdown event
4. 5-second drain period
5. Clean exit

## 🔧 Quick Debugging

```bash
# Check current rate limit status
curl -I https://your-backend.onrender.com/api/v1/converse/message

# Test Redis connection
redis-cli -u $REDIS_URL ping
# Expected: PONG

# Monitor active keys
redis-cli -u $REDIS_URL --scan --pattern "rl:*"

# Watch rate limit buckets
redis-cli -u $REDIS_URL monitor | grep "rl:"
```

## 📊 Metrics Endpoint (Optional Enhancement)

Add this for Prometheus/Grafana:

```typescript
app.get('/metrics', (req, res) => {
  res.json({
    rate_limits: {
      message_window: process.env.RL_MSG_MAX || 60,
      stream_window: process.env.RL_STREAM_MAX || 30,
      redis_connected: !!redis?.isReady,
    },
    sse: {
      active_connections: sseClients.size,
      shutting_down: shuttingDown
    }
  });
});
```

---

You're **production-ready** with full observability: rate limiting protection, graceful shutdowns, and user-facing quota display. The system scales horizontally with Redis and degrades gracefully without it.