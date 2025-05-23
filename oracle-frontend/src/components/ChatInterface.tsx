// src/components/ChatInterface.tsx
import { useChatInput } from '@/hooks/useChatInput';
import { motion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

const ChatInterface: React.FC = () => {
  const { messages, input, setInput, sendMessage } = useChatInput();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg space-y-4">
      <h2 className="text-xl font-bold text-indigo-700">🌀 Ask the Oracle</h2>

      <label htmlFor="oracle-input" className="sr-only">
        Enter your question
      </label>
      <textarea
        id="oracle-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Who am I becoming...?"
        rows={4}
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <button
        onClick={sendMessage}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
        aria-label="Send your question"
      >
        ✨ Send
      </button>

      <div
        ref={scrollRef}
        className="max-h-64 overflow-y-auto border-t pt-4 space-y-2 text-sm text-gray-700"
        role="log"
        aria-live="polite"
      >
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-3 rounded-lg ${
              msg.from === 'user' ? 'bg-indigo-100 text-right' : 'bg-gray-100 text-left'
            }`}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ChatInterface;
