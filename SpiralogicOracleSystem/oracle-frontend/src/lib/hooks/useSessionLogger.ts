export interface SessionLogPayload {
  text: string;
  clientId: string;
  facilitatorId?: string;
  sessionId: string;
  emotion?: string;
  element?: string;
  phase?: number;
  timestamp?: string; // optional for future use
}

export async function logSessionTranscript(payload: SessionLogPayload): Promise<boolean> {
  try {
    const res = await fetch('/api/session-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn(`⚠️ Session log failed: ${res.statusText}`);
      return false;
    }

    console.info('✅ Session transcript logged');
    return true;
  } catch (err) {
    console.error('❌ Error logging session transcript:', err);
    return false;
  }
}
