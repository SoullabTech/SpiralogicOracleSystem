'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Upload, 
  Mic, 
  FileText, 
  Brain, 
  Sparkles,
  Calendar,
  Tag,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Moon,
  Zap
} from 'lucide-react';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  type: 'journal' | 'dream' | 'session' | 'audio' | 'transcript';
  timestamp: Date;
  tags: string[];
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  processed: boolean;
  insights?: string[];
}

interface MemoryUpload {
  id: string;
  name: string;
  type: 'audio' | 'text' | 'transcript' | 'dream' | 'session';
  size: string;
  uploadDate: Date;
  status: 'processing' | 'complete' | 'error';
  insights?: string[];
}

const SacredJournalPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'entries' | 'memory-garden'>('entries');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock data - replace with actual data from your backend
  const [journalEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      title: 'Morning Reflection - Shadow Work',
      content: 'I noticed myself getting triggered by my colleague\'s feedback today. The anger felt familiar...',
      type: 'journal',
      timestamp: new Date('2025-01-20'),
      tags: ['shadow-work', 'triggers', 'relationships'],
      element: 'fire',
      processed: true,
      insights: ['Pattern of defensive reactions to authority', 'Connection to childhood dynamics']
    },
    {
      id: '2',
      title: 'Flying Dream - Third Time This Month',
      content: 'I was flying over dark water again, but this time I wasn\'t afraid to land...',
      type: 'dream',
      timestamp: new Date('2025-01-19'),
      tags: ['dreams', 'flying', 'water', 'transformation'],
      element: 'air',
      processed: true,
      insights: ['Recurring dream motif suggests readiness for new phase', 'Water symbolism relates to emotional depths']
    }
  ]);

  const [memoryUploads] = useState<MemoryUpload[]>([
    {
      id: '1',
      name: 'Therapy Session - Week 3',
      type: 'audio',
      size: '45.2 MB',
      uploadDate: new Date('2025-01-18'),
      status: 'complete',
      insights: ['Breakthrough around mother relationship', 'New awareness of people-pleasing pattern']
    },
    {
      id: '2',
      name: 'Dream Journal - December',
      type: 'transcript',
      size: '12.8 KB',
      uploadDate: new Date('2025-01-15'),
      status: 'processing'
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'journal': return <BookOpen className="w-4 h-4" />;
      case 'dream': return <Moon className="w-4 h-4" />;
      case 'session': return <Brain className="w-4 h-4" />;
      case 'audio': return <Mic className="w-4 h-4" />;
      case 'transcript': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'text-soullab-fire border-soullab-fire/20 bg-soullab-fire/5';
      case 'water': return 'text-soullab-water border-soullab-water/20 bg-soullab-water/5';
      case 'earth': return 'text-soullab-earth border-soullab-earth/20 bg-soullab-earth/5';
      case 'air': return 'text-soullab-air border-soullab-air/20 bg-soullab-air/5';
      case 'aether': return 'text-soullab-purple border-soullab-purple/20 bg-soullab-purple/5';
      default: return 'text-soullab-gray border-soullab-gray/20 bg-soullab-gray/5';
    }
  };

  const MemoryGarden = () => (
    <div className="space-y-soullab-lg">
      {/* Upload Section */}
      <div className="soullab-card p-soullab-lg">
        <div className="flex items-center gap-soullab-sm mb-soullab-md">
          <Upload className="w-5 h-5 text-soullab-fire" />
          <h3 className="soullab-heading-3">Expand Your Guide's Understanding</h3>
        </div>
        <p className="soullab-text text-soullab-gray mb-soullab-lg">
          Upload transcripts, dreams, sessions, or audio files to help your Personal Oracle understand you more deeply.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-soullab-md">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="soullab-card hover-soullab-lift p-soullab-md text-center border-2 border-dashed border-soullab-fire/30 hover:border-soullab-fire/50 transition-colors"
          >
            <Mic className="w-8 h-8 text-soullab-fire mx-auto mb-soullab-sm" />
            <div className="soullab-text-small font-medium">Audio Recording</div>
            <div className="soullab-text-xs text-soullab-gray">Therapy, meditation, voice notes</div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="soullab-card hover-soullab-lift p-soullab-md text-center border-2 border-dashed border-soullab-water/30 hover:border-soullab-water/50 transition-colors"
          >
            <Moon className="w-8 h-8 text-soullab-water mx-auto mb-soullab-sm" />
            <div className="soullab-text-small font-medium">Dream Journal</div>
            <div className="soullab-text-xs text-soullab-gray">Dreams, visions, subconscious material</div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="soullab-card hover-soullab-lift p-soullab-md text-center border-2 border-dashed border-soullab-earth/30 hover:border-soullab-earth/50 transition-colors"
          >
            <FileText className="w-8 h-8 text-soullab-earth mx-auto mb-soullab-sm" />
            <div className="soullab-text-small font-medium">Text Documents</div>
            <div className="soullab-text-xs text-soullab-gray">Transcripts, notes, written reflections</div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="soullab-card hover-soullab-lift p-soullab-md text-center border-2 border-dashed border-soullab-air/30 hover:border-soullab-air/50 transition-colors"
          >
            <Brain className="w-8 h-8 text-soullab-air mx-auto mb-soullab-sm" />
            <div className="soullab-text-small font-medium">Session Notes</div>
            <div className="soullab-text-xs text-soullab-gray">Coaching, therapy, spiritual work</div>
          </motion.button>
        </div>
      </div>

      {/* Processing Status */}
      <div className="soullab-card p-soullab-lg">
        <div className="flex items-center justify-between mb-soullab-md">
          <h3 className="soullab-heading-3">Memory Processing Status</h3>
          <div className="flex items-center gap-soullab-sm text-soullab-gray">
            <Zap className="w-4 h-4" />
            <span className="soullab-text-small">AI analyzing your uploads</span>
          </div>
        </div>
        
        <div className="space-y-soullab-md">
          {memoryUploads.map((upload) => (
            <motion.div
              key={upload.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-soullab-md bg-soullab-gray/5 rounded-lg border border-soullab-gray/10"
            >
              <div className="flex items-center gap-soullab-sm">
                {getTypeIcon(upload.type)}
                <div>
                  <div className="soullab-text-small font-medium">{upload.name}</div>
                  <div className="soullab-text-xs text-soullab-gray">
                    {upload.size} • {upload.uploadDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-soullab-sm">
                {upload.status === 'processing' && (
                  <div className="flex items-center gap-2 text-soullab-fire">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-soullab-fire border-t-transparent rounded-full"
                    />
                    <span className="soullab-text-xs">Processing...</span>
                  </div>
                )}
                
                {upload.status === 'complete' && (
                  <div className="flex items-center gap-2 text-soullab-earth">
                    <Sparkles className="w-4 h-4" />
                    <span className="soullab-text-xs">Complete</span>
                  </div>
                )}
                
                <button className="soullab-text-xs text-soullab-fire hover:underline">
                  View Insights
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Insights Generated */}
      <div className="soullab-card p-soullab-lg">
        <div className="flex items-center gap-soullab-sm mb-soullab-md">
          <Brain className="w-5 h-5 text-soullab-purple" />
          <h3 className="soullab-heading-3">AI-Generated Insights</h3>
        </div>
        
        <div className="space-y-soullab-md">
          <div className="p-soullab-md bg-soullab-purple/5 border border-soullab-purple/20 rounded-lg">
            <div className="flex items-start gap-soullab-sm">
              <Sparkles className="w-4 h-4 text-soullab-purple mt-1" />
              <div>
                <div className="soullab-text-small font-medium mb-1">Pattern Recognition</div>
                <div className="soullab-text-xs text-soullab-gray">
                  Your uploaded therapy sessions show a recurring theme around authority relationships. 
                  This connects to your journal entries about workplace dynamics.
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-soullab-md bg-soullab-water/5 border border-soullab-water/20 rounded-lg">
            <div className="flex items-start gap-soullab-sm">
              <Moon className="w-4 h-4 text-soullab-water mt-1" />
              <div>
                <div className="soullab-text-small font-medium mb-1">Dream Analysis</div>
                <div className="soullab-text-xs text-soullab-gray">
                  Your flying dreams appear during periods of personal growth. The water symbolism 
                  suggests emotional processing happening in your subconscious.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const JournalEntries = () => (
    <div className="space-y-soullab-lg">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-soullab-md">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-soullab-gray" />
          <input
            type="text"
            placeholder="Search your sacred entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-soullab-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-soullab-fire/50 focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-soullab-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-soullab-fire/50"
        >
          <option value="all">All Entries</option>
          <option value="journal">Journal</option>
          <option value="dreams">Dreams</option>
          <option value="sessions">Sessions</option>
        </select>
        
        <button className="soullab-button px-soullab-md py-2">
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Journal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-soullab-lg">
        {journalEntries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            onClick={() => setSelectedEntry(entry)}
            className={`soullab-card hover-soullab-lift cursor-pointer p-soullab-lg border-l-4 ${entry.element ? getElementColor(entry.element) : 'border-soullab-gray/20'}`}
          >
            <div className="flex items-start justify-between mb-soullab-sm">
              <div className="flex items-center gap-soullab-sm">
                {getTypeIcon(entry.type)}
                <h3 className="soullab-text-small font-medium">{entry.title}</h3>
              </div>
              <span className="soullab-text-xs text-soullab-gray">
                {entry.timestamp.toLocaleDateString()}
              </span>
            </div>
            
            <p className="soullab-text-xs text-soullab-gray mb-soullab-md line-clamp-3">
              {entry.content}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {entry.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-soullab-gray/10 text-soullab-gray text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              {entry.processed && (
                <div className="flex items-center gap-1 text-soullab-earth">
                  <Brain className="w-3 h-3" />
                  <span className="soullab-text-xs">Processed</span>
                </div>
              )}
            </div>
            
            {entry.insights && entry.insights.length > 0 && (
              <div className="mt-soullab-sm p-soullab-sm bg-soullab-purple/5 rounded border border-soullab-purple/20">
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3 text-soullab-purple" />
                  <span className="soullab-text-xs font-medium text-soullab-purple">AI Insights</span>
                </div>
                <div className="soullab-text-xs text-soullab-gray">
                  {entry.insights[0]}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-soullab-white">
      <div className="soullab-container py-soullab-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-soullab-xl">
          <div>
            <div className="flex items-center gap-soullab-sm mb-soullab-sm">
              <BookOpen className="w-6 h-6 text-soullab-fire" />
              <h1 className="soullab-heading-1">Sacred Journal</h1>
            </div>
            <p className="soullab-text text-soullab-gray">
              Document your transformation and expand your guide's understanding
            </p>
          </div>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="soullab-button-secondary px-soullab-md py-soullab-sm"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-soullab-xl">
          <button
            onClick={() => setActiveTab('entries')}
            className={`px-soullab-lg py-soullab-sm rounded-lg transition-colors ${
              activeTab === 'entries'
                ? 'bg-soullab-fire text-white'
                : 'bg-soullab-gray/10 text-soullab-gray hover:bg-soullab-gray/20'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Journal Entries
          </button>
          
          <button
            onClick={() => setActiveTab('memory-garden')}
            className={`px-soullab-lg py-soullab-sm rounded-lg transition-colors ${
              activeTab === 'memory-garden'
                ? 'bg-soullab-fire text-white'
                : 'bg-soullab-gray/10 text-soullab-gray hover:bg-soullab-gray/20'
            }`}
          >
            <Brain className="w-4 h-4 inline mr-2" />
            Memory Garden
          </button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'entries' && <JournalEntries />}
          {activeTab === 'memory-garden' && <MemoryGarden />}
        </motion.div>
      </div>
    </div>
  );
};

export default SacredJournalPage;