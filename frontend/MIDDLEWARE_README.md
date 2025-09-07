# SpiraLogic Oracle System - Middleware Documentation

## Overview

This system implements a comprehensive middleware architecture with authentication, rate limiting, security headers, and caching capabilities using both Next.js edge runtime and Express.js.

## Architecture

### 1. Next.js Middleware (`middleware.ts`)
- Runs on the edge runtime
- Handles authentication checks for protected routes
- Implements in-memory rate limiting
- Adds security headers to all responses
- Manages CORS for API routes

### 2. Express Middleware Server (`server/index.js`)
- Runs on port 3002 by default
- Uses Redis for distributed rate limiting
- Implements Helmet for security headers
- Handles file uploads with Multer
- Provides advanced middleware capabilities

## Features

### Authentication (JWT)
- Access tokens (24h expiry)
- Refresh tokens (7d expiry)
- Automatic token refresh
- Role-based access control (RBAC)
- Permission-based access control

### Rate Limiting
- Different limits for different endpoints
- Redis-backed for distributed systems
- Graceful degradation to in-memory if Redis unavailable
- Custom rate limits:
  - General API: 100 requests per 15 minutes
  - Oracle Chat: 30 requests per minute
  - Voice Synthesis: 10 requests per minute
  - File Upload: 20 uploads per hour

### Security
- Comprehensive security headers (CSP, HSTS, etc.)
- XSS protection
- CSRF protection via SameSite cookies
- Input sanitization utilities
- Request validation helpers

### Caching
- Redis-backed caching system
- Automatic cache invalidation
- TTL support
- Pattern-based cache clearing

## Usage

### Running the Servers

```bash
# Development mode - run all services
npm run dev:all

# Run only the Express middleware server
npm run dev:middleware

# Production mode
npm run start:all
```

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Server Configuration
SERVER_PORT=3002
NEXT_PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Security
NODE_ENV=production
```

### API Route Example

```typescript
import { withAuth, requireRole } from '@/lib/auth/jwt';
import { rateLimitHelpers } from '@/lib/redis';
import { applySecurityHeaders } from '@/lib/middleware/security';

export const GET = withAuth(async (request, user) => {
  // Your protected route logic here
  const response = NextResponse.json({ data: 'protected data' });
  return applySecurityHeaders(response);
});
```

### Client-Side Usage

```typescript
// Making authenticated requests
const response = await fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

// Handle rate limiting
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  console.log(`Rate limited. Retry after ${retryAfter} seconds`);
}
```

## Security Best Practices

1. **Always use HTTPS in production**
2. **Keep JWT_SECRET secure and rotate regularly**
3. **Configure CORS allowedOrigins properly**
4. **Use Redis with password authentication**
5. **Implement proper error handling**
6. **Sanitize all user inputs**
7. **Log security events for monitoring**

## Monitoring

The Express server provides health check endpoint:

```bash
curl http://localhost:3002/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "redis": "connected"
}
```

## Troubleshooting

### Redis Connection Issues
- Ensure Redis is running: `redis-cli ping`
- Check Redis configuration in environment variables
- The system will fallback to in-memory rate limiting if Redis is unavailable

### JWT Verification Failures
- Check if JWT_SECRET matches across environments
- Verify token hasn't expired
- Ensure cookies are being sent with requests

### CORS Issues
- Add origin to ALLOWED_ORIGINS environment variable
- Check if credentials are being sent properly
- Verify preflight requests are handled correctly