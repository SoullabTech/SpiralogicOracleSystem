import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Brain, Sparkles } from 'lucide-react';
import { oracleAI } from '../lib/oracle';
import type { Message, Memory } from '../types';

interface OracleChatProps {
  clientId: string;
  clientName: string;
  context?: any;
}

export function OracleChat({ clientId, clientName, context }: OracleChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

      // Get Oracle response
      const response = await oracleAI.respond(clientId, input, {
        client_name: clientName,
        ...context
      });

      // Add Oracle response
      const oracleMessage: Message = {
        id: Date.now().toString(),
        content: response.result,
        role: 'assistant',
        timestamp: new Date(),
        model: 'oracle-3.0',
        element: response.analysis.element,
        insight_type: response.analysis.insightType
      };

      setMessages(prev => [...prev, oracleMessage]);

      // Update insights
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