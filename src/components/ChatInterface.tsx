import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Brain, Sparkles, Settings } from 'lucide-react';
import type { Message, Memory } from '../types';
import { oracleAI } from '../lib/oracle';

interface ChatInterfaceProps {
  clientId: string;
  clientName: string;
  context?: any;
}

export function ChatInterface({ clientId, clientName, context }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<'claude' | 'openai'>('claude');
  const [recentInsights, setRecentInsights] = useState<Memory[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial greeting and insights
    const initialize = async () => {
      const [greeting, insights] = await Promise.all([
        oracleAI.loadClient(clientName),
        oracleAI.getMemoryInsights(clientId)
      ]);
      
      setMessages([greeting]);
      setRecentInsights(insights);
    };

    initialize();
  }, [clientId, clientName]);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: input,
        role: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // Get Oracle response with specified provider
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input,
          provider,
          client_id: clientId,
          client_name: clientName,
          context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get Oracle response');
      }

      const data = await response.json();

      // Add Oracle response
      const oracleMessage: Message = {
        id: Date.now().toString(),
        content: data.result,
        role: 'assistant',
        timestamp: new Date(),
        model: provider === 'claude' ? 'claude-3-sonnet' : 'gpt-4-turbo',
        element: data.analysis.element,
        insight_type: data.analysis.insightType
      };

      setMessages(prev => [...prev, oracleMessage]);

      // Update insights after response
      const insights = await oracleAI.getMemoryInsights(clientId);
      setRecentInsights(insights);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: 'Failed to get response. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Provider Selection */}
        <div className="border-b p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings size={18} className="text-gray-500" />
              <span className="text-sm font-medium">AI Provider:</span>
            </div>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'claude' | 'openai')}
              className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="claude">Claude 3 Sonnet</option>
              <option value="openai">GPT-4 Turbo</option>
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={16} className="text-purple-600" />
                    <span className="text-sm font-medium">Oracle 3.0</span>
                    {message.model && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {message.model}
                      </span>
                    )}
                    {message.element && (
                      <span className="text-xs bg-white px-2 py-1 rounded-full">
                        {message.element}
                      </span>
                    )}
                    {message.insight_type && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {message.insight_type}
                      </span>
                    )}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className="mt-2 text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask Oracle..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="w-64 border-l p-4 hidden lg:block">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="text-purple-600" size={20} />
          <h3 className="font-medium">Memory Insights</h3>
        </div>
        <div className="space-y-3">
          {recentInsights.map(insight => (
            <div
              key={insight.id}
              className="p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-amber-500" />
                {insight.metadata?.element && (
                  <span className="text-xs bg-white px-2 py-1 rounded-full border">
                    {insight.metadata.element}
                  </span>
                )}
              </div>
              <p className="text-sm line-clamp-3">{insight.content}</p>
              <div className="mt-2 text-xs text-gray-500">
                {new Date(insight.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}