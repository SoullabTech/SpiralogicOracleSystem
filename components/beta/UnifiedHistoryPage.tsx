"use client";

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Upload, 
  Clock, 
  FileText, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Download,
  Eye,
  Sparkles,
  Calendar,
  Activity
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
  type: 'conversation';
}

interface UploadedFile {
  id: string;
  filename: string;
  type: 'text' | 'audio' | 'video' | 'image' | 'document';
  size_bytes: number;
  status: 'pending' | 'processing' | 'ready' | 'error';
  mime_type: string;
  created_at: string;
  storage_path: string;
  maya_reflection?: string;
  analysis_summary?: string;
  type: 'upload';
}

type HistoryItem = ConversationSession | UploadedFile;

interface UnifiedHistoryPageProps {
  onClose: () => void;
  onSelectConversation?: (session: ConversationSession) => void;
  onSelectFile?: (file: UploadedFile) => void;
}

export const UnifiedHistoryPage: React.FC<UnifiedHistoryPageProps> = ({
  onClose,
  onSelectConversation,
  onSelectFile
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'conversations' | 'uploads'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadAllHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [historyItems, searchQuery, activeFilter, timeFilter]);

  const loadAllHistory = async () => {
    setIsLoading(true);
    const items: HistoryItem[] = [];

    try {
      // Load conversation history from localStorage
      const savedMessages = localStorage.getItem('maya_conversation');
      if (savedMessages) {
        const messages: ConversationMessage[] = JSON.parse(savedMessages);
        if (messages.length > 0) {
          items.push({
            id: 'maya-main',
            title: 'Maya Conversation',
            preview: messages[messages.length - 1]?.content?.substring(0, 100) + '...' || 'Recent conversation with Maya',
            messages,
            lastActivity: new Date(messages[messages.length - 1]?.timestamp || Date.now()),
            messageCount: messages.length,
            element: 'aether',
            type: 'conversation'
          });
        }
      }

      // Load uploaded files from Supabase
      const { data: files, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && files) {
        const uploadItems: UploadedFile[] = files.map(file => ({
          ...file,
          type: 'upload',
          created_at: file.created_at,
          lastActivity: new Date(file.created_at)
        }));
        items.push(...uploadItems);
      }

      // Sort all items by last activity
      items.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
      setHistoryItems(items);

    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = historyItems;

    // Type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => 
        activeFilter === 'conversations' ? item.type === 'conversation' : item.type === 'upload'
      );
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item => {
        if (item.type === 'conversation') {
          return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.preview.toLowerCase().includes(searchQuery.toLowerCase());
        } else {
          return item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 (item.analysis_summary && item.analysis_summary.toLowerCase().includes(searchQuery.toLowerCase()));
        }
      });
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (timeFilter) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(item => 
        new Date(item.lastActivity).getTime() > cutoff.getTime()
      );
    }

    setFilteredItems(filtered);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
    return d.toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string, mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    return '📄';
  };

  const deleteItem = async (item: HistoryItem) => {
    if (item.type === 'conversation') {
      localStorage.removeItem('maya_conversation');
    } else {
      // Delete from Supabase
      await supabase.from('documents').delete().eq('id', item.id);
      await supabase.storage.from('documents').remove([item.storage_path]);
    }
    
    setHistoryItems(prev => prev.filter(i => i.id !== item.id));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sacred-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sacred-gold">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-sacred-gold/20 p-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-sacred-gold" />
          </button>
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-sacred-gold" />
            <h1 className="text-2xl font-bold text-white">History</h1>
          </div>
          <div className="ml-auto text-sm text-gray-400">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations and files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-sacred-gold/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-sacred-gold/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Type filters */}
            {(['all', 'conversations', 'uploads'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-sm transition-all flex items-center gap-1 ${
                  activeFilter === filter
                    ? 'bg-sacred-gold text-white'
                    : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
                }`}
              >
                {filter === 'conversations' ? <MessageCircle className="w-3 h-3" /> : 
                 filter === 'uploads' ? <Upload className="w-3 h-3" /> : 
                 <Filter className="w-3 h-3" />}
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}

            {/* Time filters */}
            {(['all', 'today', 'week', 'month'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1 rounded-full text-sm transition-all flex items-center gap-1 ${
                  timeFilter === filter
                    ? 'bg-sacred-gold/20 text-sacred-gold border border-sacred-gold/50'
                    : 'bg-slate-700/30 text-gray-400 hover:bg-slate-600/30'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {filter === 'all' ? 'All Time' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery || activeFilter !== 'all' || timeFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Your conversations and uploads will appear here'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-4 hover:bg-slate-700/50 transition-all cursor-pointer"
                onClick={() => {
                  if (item.type === 'conversation') {
                    onSelectConversation?.(item);
                  } else {
                    onSelectFile?.(item);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Type indicator */}
                  <div className="flex-shrink-0 mt-1">
                    {item.type === 'conversation' ? (
                      <MessageCircle className="w-5 h-5 text-sacred-gold" />
                    ) : (
                      <div className="text-xl">
                        {getFileIcon(item.type, item.mime_type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white truncate">
                        {item.type === 'conversation' ? item.title : item.filename}
                      </h3>
                      
                      {item.type === 'upload' && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                          item.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          item.status === 'error' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {item.status}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                      {item.type === 'conversation' 
                        ? item.preview 
                        : item.analysis_summary || `${formatFileSize(item.size_bytes)} • ${item.mime_type}`
                      }
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.lastActivity)}
                        </div>
                        {item.type === 'conversation' && (
                          <span>{item.messageCount} message{item.messageCount !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.type === 'upload' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Download file logic
                              }}
                              className="p-1 rounded hover:bg-sacred-gold/20 transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4 text-sacred-gold" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // View file logic
                              }}
                              className="p-1 rounded hover:bg-sacred-gold/20 transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-sacred-gold" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item);
                          }}
                          className="p-1 rounded hover:bg-red-500/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-t border-sacred-gold/20 p-4">
        <button
          onClick={loadAllHistory}
          className="w-full px-4 py-2 text-sm text-sacred-gold hover:text-white transition-colors"
        >
          Refresh History
        </button>
      </div>
    </div>
  );
};