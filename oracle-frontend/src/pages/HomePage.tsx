// src/pages/HomePage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { saveTurn } from '@/utils/autoSave';

interface TurnData {
  id: string;
  text: string;
  timestamp: number;
}

function TurnCard({ text, timestamp }: TurnData) {
  return (
    <div className="p-2 bg-white rounded shadow">
      <div>{text}</div>
      <div className="text-xs text-gray-400">{new Date(timestamp).toLocaleTimeString()}</div>
    </div>
  );
}

export default function HomePage() {
  const [turns, setTurns] = useState<TurnData[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

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

    await saveTurn(newTurn);
    setTurns((prev) => [...prev, newTurn]);
    setInput('');
  };

  return (
    <PageTransition>
      <div className="flex flex-col h-full max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex-grow overflow-auto space-y-2">
          {turns.map((turn) => (
            <TurnCard key={turn.id} {...turn} />
          ))}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Message input"
            className="flex-grow p-2 border rounded"
            placeholder="Type your message…"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 bg-soullab-fire text-white rounded disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </PageTransition>
  );
}
