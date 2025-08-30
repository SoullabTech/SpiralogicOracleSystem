"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  BookOpen, 
  Calendar,
  Search,
  Filter,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: 'positive' | 'neutral' | 'reflective' | 'challenging';
  tags: string[];
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEntry, setNewEntry] = useState<{
    title: string;
    content: string;
    mood: 'positive' | 'neutral' | 'reflective' | 'challenging';
    tags: string[];
  }>({
    title: '',
    content: '',
    mood: 'reflective',
    tags: []
  });

  useEffect(() => {
    // Simulate loading journal entries
    setTimeout(() => {
      setEntries([
        {
          id: '1',
          title: 'Morning Reflections',
          content: 'Started the day with meditation. Feeling a strong pull toward creative projects. The Oracle mentioned focusing on fire energy - perhaps this is the time to act on those dormant ideas.',
          date: '2024-01-15',
          mood: 'positive',
          tags: ['meditation', 'creativity', 'fire-element']
        },
        {
          id: '2',
          title: 'Questions About Direction',
          content: 'Had a deep conversation with Maya about life purpose. Still feeling uncertain about the path ahead, but there\'s something comforting about having guidance available whenever I need it.',
          date: '2024-01-14',
          mood: 'reflective',
          tags: ['purpose', 'guidance', 'uncertainty']
        },
        {
          id: '3',
          title: 'Breakthrough Moment',
          content: 'The Oracle session today revealed patterns I hadn\'t noticed. My relationship challenges seem tied to my fear of authentic expression. Time to be brave.',
          date: '2024-01-13',
          mood: 'challenging',
          tags: ['relationships', 'authenticity', 'breakthrough']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSaveEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      title: newEntry.title,
      content: newEntry.content,
      date: new Date().toISOString().split('T')[0],
      mood: newEntry.mood,
      tags: newEntry.tags
    };

    setEntries([entry, ...entries]);
    setNewEntry({ title: '', content: '', mood: 'reflective', tags: [] });
    setIsWriting(false);
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive': return 'border-green-500/20 bg-green-500/5';
      case 'challenging': return 'border-red-500/20 bg-red-500/5';
      case 'reflective': return 'border-purple-500/20 bg-purple-500/5';
      default: return 'border-gray-500/20 bg-gray-500/5';
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'positive': return '✨';
      case 'challenging': return '⚡';
      case 'reflective': return '🌙';
      default: return '💭';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <BookOpen className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-white">Loading your journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-green-400 hover:text-green-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Journal</h1>
              <p className="text-muted-foreground">Your wisdom journey reflections</p>
            </div>
            <Button
              onClick={() => setIsWriting(true)}
              className="bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>
        </motion.div>

        {/* Writing Modal */}
        <AnimatePresence>
          {isWriting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 w-full max-w-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">New Journal Entry</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsWriting(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <Input
                    placeholder="Entry title..."
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                    className="bg-background/50 border-purple-500/20 focus:border-purple-400"
                  />
                  
                  <textarea
                    placeholder="What's on your mind? Reflect on your Oracle conversations, insights, or any thoughts you'd like to explore..."
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                    className="w-full h-48 p-3 bg-background/50 border border-purple-500/20 rounded-lg resize-none focus:border-purple-400 focus:outline-none text-white placeholder-muted-foreground"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Mood:</span>
                      <div className="flex space-x-2">
                        {(['positive', 'reflective', 'challenging', 'neutral'] as const).map((mood) => (
                          <button
                            key={mood}
                            onClick={() => setNewEntry({...newEntry, mood})}
                            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                              newEntry.mood === mood
                                ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                                : 'border-gray-600 hover:border-gray-500 text-gray-400'
                            }`}
                          >
                            {getMoodIcon(mood)} {mood}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsWriting(false)}
                        className="border-gray-600 hover:bg-gray-600/10"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveEntry}
                        className="bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Entry
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-background/80 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/50 border-purple-500/20 focus:border-purple-400"
                  />
                </div>
                <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Journal Entries */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {entries
            .filter(entry => 
              entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              entry.content.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className={`bg-background/80 backdrop-blur-xl border ${getMoodColor(entry.mood)}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span className="text-lg">{getMoodIcon(entry.mood)}</span>
                          <span>{entry.title}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-3 mt-1">
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(entry.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex space-x-1">
                            {entry.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingEntry(entry.id)}
                        className="text-muted-foreground hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {entry.content}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </motion.div>

        {entries.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No entries yet</h3>
            <p className="text-muted-foreground mb-4">
              Start your wisdom journey by writing your first journal entry.
            </p>
            <Button
              onClick={() => setIsWriting(true)}
              className="bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Write First Entry
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}