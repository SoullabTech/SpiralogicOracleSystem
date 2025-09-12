'use client';

import { ModernOracleInterface } from '@/components/oracle/ModernOracleInterface';
import { useEffect, useState } from 'react';

export default function OracleConversationPage() {
  const [userId, setUserId] = useState<string>();
  const [sessionId, setSessionId] = useState<string>();

  useEffect(() => {
    // Generate session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(sessionId);

    // Get or generate user ID
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', userId);
    }
    setUserId(userId);
  }, []);

  if (!userId || !sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <ModernOracleInterface userId={userId} sessionId={sessionId} />;
}