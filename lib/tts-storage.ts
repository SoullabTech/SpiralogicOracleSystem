// Shared TTS results storage
// In production, this should be replaced with Redis or a database

export interface TTSResult {
  status: 'pending' | 'ready' | 'failed';
  audioUrl?: string;
  error?: string;
  timestamp: number;
}

// In-memory storage (replace with Redis/DB in production)
const ttsResults = new Map<string, TTSResult>();

export function setTTSResult(turnId: string, result: Omit<TTSResult, 'timestamp'>) {
  ttsResults.set(turnId, {
    ...result,
    timestamp: Date.now(),
  });
}

export function getTTSResult(turnId: string): TTSResult | null {
  return ttsResults.get(turnId) || null;
}

export function deleteTTSResult(turnId: string): boolean {
  return ttsResults.delete(turnId);
}

// Cleanup expired results (older than 15 minutes)
export function cleanupExpiredResults() {
  const now = Date.now();
  const EXPIRY_TIME = 15 * 60 * 1000; // 15 minutes

  for (const [turnId, result] of Array.from(ttsResults.entries())) {
    if (now - result.timestamp > EXPIRY_TIME) {
      // Clean up blob URLs
      if (result.audioUrl && result.audioUrl !== 'web-speech-synthesis') {
        try {
          URL.revokeObjectURL(result.audioUrl);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      ttsResults.delete(turnId);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredResults, 5 * 60 * 1000);
}