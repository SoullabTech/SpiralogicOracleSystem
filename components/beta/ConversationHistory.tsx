"use client";

import React, { useState, useEffect } from 'react';
import { Clock, MessageCircle, Sparkles, ChevronRight, Trash2, Search } from 'lucide-react';

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationSession {
  id: string;
  title: string;
  preview: string;
  messages: ConversationMessage[];
  lastActivity: Date;
  messageCount: number;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
}

interface ConversationHistoryProps {
  userId?: string;
  onSelectConversation?: (session: ConversationSession) => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  userId = 'default',
  onSelectConversation
}) => {
  const [conversations, setConversations] = useState<ConversationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'fire' | 'water' | 'earth' | 'air' | 'aether'>('all');

  // Element colors
  const elementColors = {
    fire: '#C85450',
    water: '#6B9BD1', 
    earth: '#7A9A65',
    air: '#D4B896',
    aether: '#B69A78'
  };

  useEffect(() => {
    loadConversationHistory();
  }, [userId]);

  const loadConversationHistory = () => {
    setIsLoading(true);
    
    try {
      // Load from localStorage (existing Maya conversations)
      const savedMessages = localStorage.getItem('maya_conversation');
      const oracleMessages = localStorage.getItem('oracle_conversations');
      
      const sessions: ConversationSession[] = [];
      
      // Process Maya conversations
      if (savedMessages) {
        const messages: ConversationMessage[] = JSON.parse(savedMessages);
        if (messages.length > 0) {
          sessions.push({
            id: 'maya-main',
            title: 'Maya Conversation',
            preview: messages[messages.length - 1]?.content?.substring(0, 100) + '...' || 'Recent conversation with Maya',
            messages,
            lastActivity: new Date(messages[messages.length - 1]?.timestamp || Date.now()),
            messageCount: messages.length,
            element: 'aether'
          });
        }
      }
      
      // Process Oracle conversations (if they exist)
      if (oracleMessages) {
        try {
          const oracleSessions = JSON.parse(oracleMessages);
          sessions.push(...oracleSessions);
        } catch (e) {
          console.log('No oracle conversations found');
        }
      }
      
      // Sort by last activity
      sessions.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
      
      setConversations(sessions);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = (sessionId: string) => {
    if (sessionId === 'maya-main') {
      localStorage.removeItem('maya_conversation');
    } else {
      const remaining = conversations.filter(c => c.id !== sessionId);
      localStorage.setItem('oracle_conversations', JSON.stringify(remaining));
    }
    setConversations(prev => prev.filter(c => c.id !== sessionId));
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === '' || 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.preview.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || conv.element === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center gap-2 text-sacred-gold">
          <div className="w-4 h-4 border-2 border-sacred-gold border-t-transparent rounded-full animate-spin" />
          <span>Loading conversation history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-lg border border-sacred-gold/20 overflow-hidden">
      <div className="p-6 border-b border-sacred-gold/20">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-6 h-6 text-sacred-gold" />
          <h2 className="text-2xl font-bold text-white">Conversation History</h2>
          <div className="ml-auto text-sm text-gray-400">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-sacred-gold/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-sacred-gold/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'fire', 'water', 'earth', 'air', 'aether'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  selectedFilter === filter
                    ? 'bg-sacred-gold text-white'
                    : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
                }`}
                style={{
                  backgroundColor: selectedFilter === filter 
                    ? (filter === 'all' ? '#D4B896' : elementColors[filter as keyof typeof elementColors])
                    : undefined
                }}
              >
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">
              {searchQuery || selectedFilter !== 'all' 
                ? 'No conversations match your search'
                : 'No conversations yet'
              }
            </p>
            <p className="text-sm text-gray-500">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start a conversation with Maya to see your history here'
              }
            </p>
          </div>
        ) : (
          filteredConversations.map((session) => (
            <div
              key={session.id}
              className="group p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-all cursor-pointer"
              onClick={() => onSelectConversation?.(session)}
            >
              <div className="flex items-start gap-4">
                {/* Element indicator */}
                {session.element && (
                  <div
                    className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: elementColors[session.element] }}
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white truncate">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(session.lastActivity)}
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                    {session.preview}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {session.messageCount} message{session.messageCount !== 1 ? 's' : ''}
                    </span>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(session.id);
                        }}
                        className="p-1 rounded hover:bg-red-500/20 transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {conversations.length > 0 && (
        <div className="p-4 border-t border-sacred-gold/20 bg-slate-800/30">
          <button
            onClick={loadConversationHistory}
            className="w-full px-4 py-2 text-sm text-sacred-gold hover:text-white transition-colors"
          >
            Refresh History
          </button>
        </div>
      )}
    </div>
  );
};