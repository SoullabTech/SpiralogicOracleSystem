'use client';

import { useEffect, useRef } from 'react';
import { useMayaStream } from '@/hooks/useMayaStream';
import HybridInput from '@/components/chat/HybridInput';

export default function MayaChat() {
  const { messages, isStreaming, sendMessage } = useMayaStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="border-b border-amber-500/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 animate-pulse" />
              <div className="absolute inset-1 rounded-full bg-black" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-400/40 to-amber-600/40" />
            </div>
            <div>
              <h2 className="text-amber-50 font-light">Maia</h2>
              <p className="text-xs text-amber-200/40">
                {sessionStorage.getItem('explorerName')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-amber-200/40 text-sm">
              Welcome, {sessionStorage.getItem('explorerName')}
            </p>
            <p className="text-amber-200/60 mt-2">
              How can I support your journey today?
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-amber-500/10 text-amber-50 border border-amber-500/20'
                  : 'bg-black/40 text-amber-100/80 border border-amber-500/10'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs text-amber-200/30 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-black/40 border border-amber-500/10">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-amber-400/60 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-amber-400/60 rounded-full animate-bounce delay-75" />
                <div className="w-2 h-2 bg-amber-400/60 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-amber-500/10 p-4">
        <HybridInput
          onSend={sendMessage}
          disabled={isStreaming}
          placeholder="Share your thoughts..."
        />
      </div>
    </div>
  );
}