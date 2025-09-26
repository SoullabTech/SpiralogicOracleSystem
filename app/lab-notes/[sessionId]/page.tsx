'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MessageCircle, User, Sparkles } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number | Date;
}

interface Session {
  id: string;
  date: Date;
  messageCount: number;
  messages: ConversationMessage[];
}

export default function SessionDetail() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = () => {
    try {
      const savedMessages = localStorage.getItem('maya_conversation');
      if (savedMessages) {
        const messages: ConversationMessage[] = JSON.parse(savedMessages);

        const sessionMessages = messages.filter(msg => {
          const msgDate = new Date(msg.timestamp);
          const msgDateKey = msgDate.toISOString().split('T')[0];
          return msgDateKey === sessionId;
        });

        if (sessionMessages.length > 0) {
          setSession({
            id: sessionId,
            date: new Date(sessionId),
            messageCount: sessionMessages.length,
            messages: sessionMessages
          });
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: number | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1f3a] flex items-center justify-center">
        <Holoflower size="lg" glowIntensity="high" animate={true} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#1a1f3a] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-amber-200/50">Session not found</p>
          <button
            onClick={() => router.push('/lab-notes')}
            className="mt-4 text-amber-400/60 hover:text-amber-400/90 transition-colors"
          >
            ← Back to Lab Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f3a] px-4 py-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/lab-notes')}
          className="flex items-center gap-2 text-amber-200/60 hover:text-amber-200/90 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lab Notes
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-amber-400/60" />
            <h1 className="text-2xl font-extralight text-amber-50">
              {formatDate(session.date)}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-amber-200/40">
            <MessageCircle className="w-4 h-4" />
            <span>{session.messageCount} messages</span>
          </div>
        </div>

        <div className="space-y-6">
          {session.messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className="flex-shrink-0">
                {message.role === 'assistant' ? (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <Holoflower size="sm" glowIntensity="low" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-amber-400/60" />
                  </div>
                )}
              </div>

              <div className={`flex-1 ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                    message.role === 'user'
                      ? 'bg-amber-500/20 border border-amber-500/30'
                      : 'bg-black/30 border border-amber-500/20'
                  }`}
                >
                  <p className="text-amber-100/90 text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                <span className="text-xs text-amber-200/30 mt-2 px-2">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => router.push('/maya')}
            className="px-6 py-3 bg-gradient-to-r from-amber-500/80 to-amber-600/80 text-white rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Continue conversation
          </button>
        </div>
      </div>
    </div>
  );
}