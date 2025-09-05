"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, ChevronLeft, Trash2, Calendar } from 'lucide-react';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  userId: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('beta_user');
    if (!storedUser) {
      router.push('/auth');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    
    // Load journal entries
    const storedEntries = localStorage.getItem(`journal_${userData.id}`);
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, [router]);

  const saveEntry = () => {
    if (!newContent.trim()) return;

    const entry: JournalEntry = {
      id: `entry_${Date.now()}`,
      title: newTitle || 'Untitled Reflection',
      content: newContent,
      timestamp: new Date().toISOString(),
      userId: user.id
    };

    const updatedEntries = [entry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem(`journal_${user.id}`, JSON.stringify(updatedEntries));
    
    setNewTitle('');
    setNewContent('');
    setIsWriting(false);
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(e => e.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem(`journal_${user.id}`, JSON.stringify(updatedEntries));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* Header */}
      <header className="border-b border-[#FFD700]/20 backdrop-blur-sm bg-[#0A0E27]/80 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/oracle')}
              className="p-2 hover:bg-[#1A1F3A] rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-[#FFD700]" />
              <h1 className="text-lg font-light">Reflection Journal</h1>
            </div>
          </div>
          
          <button
            onClick={() => setIsWriting(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFD700] text-[#0A0E27] rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        {isWriting ? (
          <div className="bg-[#1A1F3A]/50 border border-[#FFD700]/20 rounded-lg p-6">
            <input
              type="text"
              placeholder="Entry Title (optional)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full mb-4 px-4 py-2 bg-[#0A0E27] border border-[#FFD700]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/50"
            />
            
            <textarea
              placeholder="Write your reflection..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={10}
              className="w-full mb-4 px-4 py-3 bg-[#0A0E27] border border-[#FFD700]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/50 resize-none"
              autoFocus
            />
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsWriting(false);
                  setNewTitle('');
                  setNewContent('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEntry}
                disabled={!newContent.trim()}
                className="px-6 py-2 bg-[#FFD700] text-[#0A0E27] rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Entry
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No journal entries yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start reflecting on your journey
                </p>
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-[#1A1F3A]/30 border border-[#FFD700]/10 rounded-lg p-6 hover:bg-[#1A1F3A]/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-[#FFD700]">
                      {entry.title}
                    </h3>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-gray-300 whitespace-pre-wrap mb-3">
                    {entry.content}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(entry.timestamp).toLocaleDateString()} at{' '}
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}