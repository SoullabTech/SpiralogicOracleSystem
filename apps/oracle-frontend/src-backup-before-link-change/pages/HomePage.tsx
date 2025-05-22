// src/pages/HomePage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { saveTurn } from '@/utils/autoSave';

interface TurnData {
  id: string;
  text: string;
  timestamp: number;
}

export default function HomePage() {
  const [turns, setTurns] = useState<TurnData[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever turns change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const newTurn: TurnData = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now(),
    };

    // Persist safely (won't throw)…
    await saveTurn(newTurn);

    // …then update UI
    setTurns((prev) => [...prev, newTurn]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col h-full max-w-2xl mx-auto p-4 space-y-4">
        {/* Message list */}
        <div className="flex-grow overflow-auto space-y-2">
          {turns.map((turn) => (
            <div key={turn.id} className="p-2 bg-white rounded shadow">
              {turn.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow p-2 border rounded"
            placeholder="Type your message…"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-2 bg-soullab-fire text-white rounded disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
