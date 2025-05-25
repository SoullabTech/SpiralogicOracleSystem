// 🔮 FRONTEND COMPONENT
// File: /src/components/oracle/mobile/MobileOracleChat.tsx

import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getVoiceProfile } from '@/lib/getVoiceProfile';
import { useState } from 'react';
import OracleChatDesktop from '../OracleChatDesktop';
const profile = getVoiceProfile(user?.orgId);

<div className="text-center font-medium text-indigo-600">
  {profile.uiLabels.journalPrompt}
</div>


export default function MobileOracleChat() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ role: 'user' | 'oracle'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isMobile) return <OracleChatDesktop />;

  const sendMessage = async () => {
    if (!input.trim() || !user?.id) return;

    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/oracle/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, userId: user.id }),
      });

      const data = await res.json();
      if (data?.content) {
        setMessages((prev) => [...prev, { role: 'oracle', text: data.content }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'oracle', text: '⚠️ Oracle is resting. Please try again soon.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col">
      <div className="bg-indigo-600 text-white text-center py-4 text-lg font-semibold shadow">
        ✨ Your Oracle Guide
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl shadow text-sm max-w-[85%] ${
              msg.role === 'user'
                ? 'bg-indigo-200 text-indigo-900 self-end ml-auto'
                : 'bg-white text-gray-800 self-start mr-auto'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {messages.length === 0 && !loading && (
          <p className="text-center text-gray-400 mt-8 text-sm">
            Begin your dialogue with the Oracle...
          </p>
        )}
      </div>

      <div className="border-t bg-white p-4 shadow-inner">
        <Textarea
          rows={2}
          placeholder="Ask your Oracle something sacred..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full mb-2"
          disabled={loading}
        />
        <Button className="w-full" onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? 'Asking...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
