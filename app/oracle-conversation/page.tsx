'use client';

import { useState, useEffect } from 'react';
import { MayaChatInterface } from '@/components/chat/MayaChatInterface';

export default function OracleConversationPage() {
  const [userId, setUserId] = useState<string>();
  const [sessionId, setSessionId] = useState<string>();

  useEffect(() => {
    // Generate session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    setSessionId(sessionId);

    // Get or generate user ID
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('userId', userId);
    }
    setUserId(userId);
  }, []);

  const handleSendMessage = async (text: string, attachments?: File[]) => {
    if (!userId || !sessionId) return;

    try {
      const response = await fetch('/api/oracle/personal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          userId,
          sessionId,
          agentName: 'Maya',
          agentVoice: 'maya'
        }),
      });

      const data = await response.json();
      return {
        message: data.data?.message || "I'm here with you.",
        audio: data.data?.audio || 'web-speech-fallback'
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        message: "I'm having trouble connecting right now, but I'm still here with you.",
        audio: 'web-speech-fallback'
      };
    }
  };

  if (!userId || !sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <MayaChatInterface
        onSendMessage={handleSendMessage}
        agentName="Maya"
        messages={[]}
      />
    </div>
  );
}