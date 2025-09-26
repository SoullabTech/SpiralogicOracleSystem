'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Clock, MessageCircle, ArrowLeft, Calendar } from 'lucide-react';
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
  preview: string;
  messages: ConversationMessage[];
}

export default function LabNotes() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    try {
      const savedMessages = localStorage.getItem('maya_conversation');
      if (savedMessages) {
        const messages: ConversationMessage[] = JSON.parse(savedMessages);

        const sessionMap = new Map<string, ConversationMessage[]>();

        messages.forEach((msg) => {
          const date = new Date(msg.timestamp);
          const dateKey = date.toISOString().split('T')[0];

          if (!sessionMap.has(dateKey)) {
            sessionMap.set(dateKey, []);
          }
          sessionMap.get(dateKey)?.push(msg);
        });

        const sessionsArray: Session[] = Array.from(sessionMap.entries()).map(([dateKey, msgs]) => {
          const userMessages = msgs.filter(m => m.role === 'user');
          const preview = userMessages.length > 0
            ? userMessages[0].content.substring(0, 120) + '...'
            : msgs[0]?.content?.substring(0, 120) + '...';

          return {
            id: dateKey,
            date: new Date(dateKey),
            messageCount: msgs.length,
            preview,
            messages: msgs
          };
        });

        sessionsArray.sort((a, b) => b.date.getTime() - a.date.getTime());
        setSessions(sessionsArray);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#1a1f3a] px-4 py-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-amber-200/60 hover:text-amber-200/90 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-4 mb-12">
          <Holoflower size="md" glowIntensity="medium" />
          <div>
            <h1 className="text-3xl font-extralight text-amber-50">Lab Notes</h1>
            <p className="text-amber-200/50 text-sm mt-1">Your conversation history with Maia</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Holoflower size="lg" glowIntensity="high" animate={true} />
            <p className="text-amber-200/50 mt-4">Loading your notes...</p>
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <BookOpen className="w-12 h-12 text-amber-400/30 mx-auto mb-4" />
            <p className="text-amber-200/50">No conversations yet</p>
            <p className="text-amber-200/30 text-sm mt-2">Start a conversation with Maia to see your lab notes</p>
            <button
              onClick={() => router.push('/maya')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-amber-500/80 to-amber-600/80 text-white rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all"
            >
              Begin Conversation
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`/lab-notes/${session.id}`)}
                className="bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 hover:border-amber-500/40 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-amber-400/60" />
                    <div>
                      <h3 className="text-amber-50 font-light">{formatDate(session.date)}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-amber-200/40">
                          <MessageCircle className="w-3 h-3" />
                          {session.messageCount} messages
                        </span>
                      </div>
                    </div>
                  </div>
                  <Clock className="w-4 h-4 text-amber-400/30" />
                </div>

                <p className="text-amber-200/60 text-sm leading-relaxed">
                  {session.preview}
                </p>

                <div className="mt-4 pt-4 border-t border-amber-500/10">
                  <span className="text-xs text-amber-400/60 group-hover:text-amber-400/90 transition-colors flex items-center gap-2 group-hover:gap-3">
                    View full conversation
                    <span className="transition-all">→</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-xs text-amber-200/20">
            All conversations stored locally on your device
          </p>
        </div>
      </div>
    </div>
  );
}