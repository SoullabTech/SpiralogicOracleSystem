import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security headers configuration
export const securityHeaders = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection (legacy browsers)
  'X-XSS-Protection': '1; mode=block',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // DNS prefetch control
  'X-DNS-Prefetch-Control': 'on',
  
  // Permissions policy for browser features
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()',
  
  // Strict transport security (HTTPS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Content Security Policy configuration
export const getContentSecurityPolicy = () => {
  const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://cdn.jsdelivr.net',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://*.supabase.co',
      'https://*.githubusercontent.com',
    ],
    'media-src': [
      "'self'",
      'blob:',
    ],
    'connect-src': [
      "'self'",
      'https://api.openai.com',
      'https://api.anthropic.com',
      'https://api.elevenlabs.io',
      'https://*.supabase.co',
      'wss://*.supabase.co',
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
  };

  return Object.entries(cspDirectives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};

// Apply security headers
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Apply all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply CSP in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', getContentSecurityPolicy());
  }

  return response;
}

// CORS configuration
export const corsOptions = {
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001').split(','),
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Apply CORS headers
export function applyCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');

  // Check if origin is allowed
  if (origin && corsOptions.allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (corsOptions.allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.headers.set('Access-Control-Allow-Methods', corsOptions.allowedMethods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    response.headers.set('Access-Control-Max-Age', String(corsOptions.maxAge));
    
    if (corsOptions.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  return response;
}

// Input sanitization helpers
export const sanitizers = {
  // Sanitize HTML input
  sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Sanitize SQL input (basic)
  sanitizeSql(input: string): string {
    return input.replace(/['";\\]/g, '');
  },

  // Sanitize file paths
  sanitizePath(input: string): string {
    return input.replace(/[^a-zA-Z0-9\-_./]/g, '');
  },

  // Validate and sanitize email
  sanitizeEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = email.trim().toLowerCase();
    return emailRegex.test(sanitized) ? sanitized : null;
  },

  // Validate and sanitize URL
  sanitizeUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null;
      }
      return parsed.toString();
    } catch {
      return null;
    }
  },
};

// Request validation helpers
export const validators = {
  // Validate request size
  validateSize(request: NextRequest, maxSizeBytes: number = 10 * 1024 * 1024): boolean {
    const contentLength = request.headers.get('content-length');
    if (!contentLength) return true;
    return parseInt(contentLength) <= maxSizeBytes;
  },

  // Validate content type
  validateContentType(request: NextRequest, allowedTypes: string[]): boolean {
    const contentType = request.headers.get('content-type');
    if (!contentType) return false;
    return allowedTypes.some(type => contentType.includes(type));
  },

  // Validate API key
  validateApiKey(request: NextRequest, validKeys: string[]): boolean {
    const apiKey = request.headers.get('x-api-key');
    return apiKey ? validKeys.includes(apiKey) : false;
  },
};

// Security middleware composer
export function composeSecurityMiddleware(...middlewares: Array<(req: NextRequest) => Promise<NextResponse | null>>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    for (const middleware of middlewares) {
      const response = await middleware(request);
      if (response) return response;
    }
    return NextResponse.next();
  };
}