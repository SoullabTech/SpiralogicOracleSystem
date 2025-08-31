# Production Redis Rate Limiting Setup

## Environment Configuration

Add these variables to your production environment (Render/Railway/etc):

```bash
# Redis connection
REDIS_URL=redis://localhost:6379
# OR for Redis Cloud/Upstash:
# REDIS_URL=rediss://default:password@host:port

# Rate limiting controls
RL_MSG_MAX=60          # message endpoint: requests per minute per IP
RL_STREAM_MAX=30       # stream endpoint: requests per minute per IP
```

## Server Integration

The server automatically detects Redis availability:
- **With Redis**: Uses Redis-backed rate limiting (scales horizontally)
- **Without Redis**: Falls back to in-memory rate limiting (single instance)

```typescript
// Auto-detected in server-minimal.ts
if (process.env.REDIS_URL) {
  // Production: Redis rate limiting
} else {
  // Development: In-memory rate limiting
}
```

## Production Endpoints with Redis Rate Limiting

```bash
# Message endpoint: 60 requests/minute/IP
curl -X POST "https://your-backend.onrender.com/api/v1/converse/message" \\
  -H "Content-Type: application/json" \\
  -d '{"userText":"test","userId":"smoke","element":"air"}'

# Streaming endpoint: 30 requests/minute/IP  
curl -N "https://your-backend.onrender.com/api/v1/converse/stream?element=air&q=test"
```

## Rate Limit Headers

Both endpoints return standard rate limiting headers:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

When rate limited (429):
```http
Retry-After: 45
```

## Graceful SSE Shutdown

The system now handles graceful shutdowns:

1. **SIGTERM received**: Server stops accepting new stream connections
2. **Active streams**: Receive `shutdown` event with 30s retry
3. **Clean exit**: All connections drain within 5 seconds

```bash
# Test graceful shutdown
curl -N "http://localhost:3002/api/v1/converse/stream?element=air&q=hello" &
kill -TERM $(lsof -ti:3002)
# Stream receives: event: shutdown, data: {"message":"Server restarting, reconnect soon","retry":30000}
```

## Redis Deployment Options

### Option 1: Redis Cloud (Recommended)
```bash
# Free 30MB tier available
REDIS_URL=rediss://default:password@redis-xxxxx.c1.us-east-1-1.ec2.cloud.redislabs.com:12345
```

### Option 2: Upstash (Serverless)
```bash
# Pay-per-request serverless Redis
REDIS_URL=rediss://default:password@apn1-xxxxx.upstash.io:6379
```

### Option 3: Self-hosted Redis
```bash
# Docker Redis instance
docker run -d -p 6379:6379 redis:alpine
REDIS_URL=redis://localhost:6379
```

## Testing Production Setup

```bash
# 1. Health check shows Redis status
curl https://your-backend.onrender.com/api/v1/converse/health | jq .

# 2. Rate limiting test - should get headers
curl -I https://your-backend.onrender.com/api/v1/converse/message

# 3. Stream graceful shutdown test  
curl -N "https://your-backend.onrender.com/api/v1/converse/stream?element=air&q=test" &
# Trigger restart in another terminal
```

The system is now production-ready with Redis-backed rate limiting and graceful SSE connection handling.