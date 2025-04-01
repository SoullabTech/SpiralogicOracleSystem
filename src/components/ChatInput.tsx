import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { ClaudeClient } from '../lib/claude';
import { env } from '../lib/config';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  bypassMode?: boolean;
  activeClient?: string;
  context?: {
    element?: string;
    phase?: string;
    archetype?: string;
    focusAreas?: string[];
  };
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled,
  bypassMode = false,
  activeClient,
  context
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const claude = new ClaudeClient(env.VITE_CLAUDE_API_KEY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input.trim() && !disabled && !isLoading) {
      setIsLoading(true);
      try {
        const response = await claude.chat(input, context);
        onSend(response.content);
      } catch (error) {
        console.error('Chat error:', error);
      } finally {
        setIsLoading(false);
        setInput('');
      }
    }
  };

  return (
    <div className="relative">
      {activeClient && (
        <div className="absolute top-0 left-0 -mt-6 text-xs text-blue-600 font-medium flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
          Active Client: {activeClient}
        </div>
      )}
      
      {bypassMode && (
        <div className="absolute top-0 right-0 -mt-6 text-xs text-red-600 font-medium">
          Bypass Mode Active
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Oracle 3.0..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={disabled || isLoading}
        />
        
        <button
          type="submit"
          disabled={disabled || isLoading || !input.trim()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Send size={18} />
          <span>{isLoading ? 'Sending...' : 'Send'}</span>
        </button>
      </form>
    </div>
  );
}