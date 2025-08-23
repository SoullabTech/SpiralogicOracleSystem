import { incCounter, observe } from './metrics';

export interface LogMeta {
  traceId?: string;
  route?: string;
  userId?: string;
  agent?: string;
  latencyMs?: number;
  [key: string]: any;
}

// PII patterns to redact
const PII_PATTERNS = [
  // Email addresses
  { pattern: /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, replacement: '***@$2' },
  // Phone numbers (various formats)
  { pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replacement: '***-***-****' },
  { pattern: /\+\d{1,3}\s?\d{1,4}\s?\d{1,4}\s?\d{1,9}/g, replacement: '+**-****-****' },
  // SSN
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '***-**-****' },
  // Credit card numbers
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '****-****-****-****' },
  // IP addresses (but not localhost)
  { pattern: /\b(?!127\.0\.0\.1)(?!0\.0\.0\.0)(?!localhost)\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, replacement: '***.***.***.***' },
  // JWT tokens
  { pattern: /Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g, replacement: 'Bearer ***' },
  // API keys (common patterns)
  { pattern: /\b(api[_-]?key|apikey|api_secret|secret[_-]?key)["\s]*[:=]["\s]*[^\s,"}]+/gi, replacement: '$1=***' },
];

function redactPII(obj: any): any {
  if (!process.env.ENABLE_PII_REDACTION || process.env.ENABLE_PII_REDACTION === 'false') {
    return obj;
  }

  if (typeof obj === 'string') {
    let redacted = obj;
    PII_PATTERNS.forEach(({ pattern, replacement }) => {
      redacted = redacted.replace(pattern, replacement);
    });
    return redacted;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactPII(item));
  }

  if (obj && typeof obj === 'object') {
    const redacted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Redact sensitive field names entirely
      if (/password|secret|token|auth|key|credential/i.test(key)) {
        redacted[key] = '***REDACTED***';
      } else {
        redacted[key] = redactPII(value);
      }
    }
    return redacted;
  }

  return obj;
}

function formatLog(level: string, meta: LogMeta, message: string): string {
  const timestamp = new Date().toISOString();
  
  // Redact PII from message and metadata
  const redactedMessage = redactPII(message);
  const redactedMeta = redactPII(meta);
  
  const logData = {
    timestamp,
    level,
    message: redactedMessage,
    ...redactedMeta
  };

  // Emit metrics when logging route completions
  if (meta.route && meta.latencyMs !== undefined) {
    const status = level === 'ERROR' ? '500' : '200';
    incCounter('http_requests_total', { route: meta.route, status });
    observe('http_request_duration_seconds', meta.latencyMs / 1000, { route: meta.route });
  }

  return JSON.stringify(logData);
}

export function logInfo(meta: LogMeta, message: string): void {
  console.log(formatLog('INFO', meta, message));
}

export function logWarning(meta: LogMeta, message: string): void {
  console.warn(formatLog('WARN', meta, message));
}

export function logError(meta: LogMeta, message: string): void {
  console.error(formatLog('ERROR', meta, message));
}