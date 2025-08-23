/**
 * Debug utilities for whispers system (production-safe)
 */

export function logRankingDebug(memories: any[], reasons: string[], debugFlag = false) {
  if (!debugFlag || process.env.NODE_ENV !== 'development') return;
  
  console.group('🔍 Whispers Ranking Debug');
  console.log('Input memories:', memories.length);
  console.log('Sample reasons:', reasons.slice(0, 3));
  console.log('Top 3 scores:', memories.slice(0, 3).map(m => ({
    id: m.id.slice(0, 8),
    score: m.score?.toFixed(2),
    reason: m.reason
  })));
  console.groupEnd();
}

export function logPerformanceMetric(operation: string, duration: number, threshold = 200) {
  const level = duration > threshold ? 'warn' : 'log';
  console[level](`⏱️ ${operation}: ${duration}ms ${duration > threshold ? `(> ${threshold}ms threshold)` : ''}`);
}

export function sanitizeUserData(data: any): any {
  // Remove PII for logging while keeping debug utility
  if (Array.isArray(data)) {
    return data.map(item => sanitizeUserData(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized = { ...data };
    
    // Hash or remove sensitive fields
    if (sanitized.content) sanitized.content = `[${sanitized.content.length} chars]`;
    if (sanitized.text) sanitized.text = `[${sanitized.text.length} chars]`;
    if (sanitized.user_id) sanitized.user_id = sanitized.user_id.slice(0, 8) + '...';
    if (sanitized.email) delete sanitized.email;
    
    return sanitized;
  }
  
  return data;
}

export class PerformanceTracker {
  private start: number;
  private name: string;
  
  constructor(name: string) {
    this.name = name;
    this.start = Date.now();
  }
  
  end(threshold = 200): number {
    const duration = Date.now() - this.start;
    logPerformanceMetric(this.name, duration, threshold);
    return duration;
  }
  
  checkpoint(label: string): number {
    const duration = Date.now() - this.start;
    console.log(`⏱️ ${this.name} - ${label}: ${duration}ms`);
    return duration;
  }
}