"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Grid, List, Upload, Sparkles,
  FileText, Music, Video, Image as ImageIcon,
  Calendar, TrendingUp, Book, Star
} from 'lucide-react';
import SacredAssetPreview from './SacredAssetPreview';
import type { SacredAsset, ElementType } from '@/lib/types';

interface SacredLibraryProps {
  assets: SacredAsset[];
  onAssetSelect?: (asset: SacredAsset) => void;
  onUpload?: () => void;
}

type ViewMode = 'grid' | 'list' | 'timeline';
type AssetTypeFilter = 'all' | 'doc' | 'audio' | 'video' | 'image';
type ElementFilter = 'all' | ElementType;

export default function SacredLibrary({
  assets,
  onAssetSelect,
  onUpload
}: SacredLibraryProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetTypeFilter>('all');
  const [elementFilter, setElementFilter] = useState<ElementFilter>('all');
  const [showHighAether, setShowHighAether] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'aether' | 'name'>('date');

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let filtered = [...assets];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.title.toLowerCase().includes(query) ||
        asset.metadata?.keywords?.some(k => k.toLowerCase().includes(query)) ||
        asset.metadata?.wisdomQuotes?.some(q => q.toLowerCase().includes(query))
      );
    }

    // Asset type filter
    if (assetTypeFilter !== 'all') {
      filtered = filtered.filter(asset => asset.type === assetTypeFilter);
    }

    // Element filter
    if (elementFilter !== 'all') {
      filtered = filtered.filter(asset => 
        asset.metadata?.element === elementFilter
      );
    }

    // High Aether filter
    if (showHighAether) {
      filtered = filtered.filter(asset => 
        (asset.metadata?.aetherResonance || 0) > 0.7
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'aether':
          return (b.metadata?.aetherResonance || 0) - (a.metadata?.aetherResonance || 0);
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [assets, searchQuery, assetTypeFilter, elementFilter, showHighAether, sortBy]);

  // Element colors
  const elementColors: Record<ElementType, string> = {
    Fire: '#ff6b6b',
    Water: '#4dabf7',
    Earth: '#51cf66',
    Air: '#ffd43b',
    Aether: '#c77dff'
  };

  // Asset type icons
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'doc': return <FileText className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'image': return <ImageIcon className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const totalSize = assets.reduce((sum, a) => sum + (a.metadata?.fileSize || 0), 0);
    const avgAether = assets.reduce((sum, a) => sum + (a.metadata?.aetherResonance || 0), 0) / assets.length;
    const wisdomCount = assets.reduce((sum, a) => sum + (a.metadata?.wisdomQuotes?.length || 0), 0);
    
    return {
      totalAssets: assets.length,
      totalSize,
      avgAether,
      wisdomCount
    };
  }, [assets]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <motion.h1 
          className="text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Sacred Library
        </motion.h1>
        <motion.p 
          className="text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Your collection of wisdom, resonance, and sacred insights
        </motion.p>
      </div>

      {/* Stats Bar */}
      <motion.div 
        className="grid grid-cols-4 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
            <Book className="w-4 h-4" />
            Total Assets
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalAssets}</div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
            <Sparkles className="w-4 h-4" />
            Avg Aether
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {Math.round(stats.avgAether * 100)}%
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
            <Star className="w-4 h-4" />
            Wisdom Quotes
          </div>
          <div className="text-2xl font-bold text-yellow-400">{stats.wisdomCount}</div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            Total Size
          </div>
          <div className="text-2xl font-bold text-white">
            {(stats.totalSize / 1024 / 1024).toFixed(1)} MB
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, keywords, or wisdom quotes..."
            className="w-full pl-12 pr-4 py-3 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-black/40 rounded-lg p-1">
            {(['grid', 'list', 'timeline'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === mode
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {mode === 'grid' && <Grid className="w-4 h-4" />}
                {mode === 'list' && <List className="w-4 h-4" />}
                {mode === 'timeline' && <Calendar className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* Asset Type Filter */}
          <select
            value={assetTypeFilter}
            onChange={(e) => setAssetTypeFilter(e.target.value as AssetTypeFilter)}
            className="px-4 py-2 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 text-white focus:outline-none focus:border-white/30"
          >
            <option value="all">All Types</option>
            <option value="doc">Documents</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="image">Images</option>
          </select>

          {/* Element Filter */}
          <select
            value={elementFilter}
            onChange={(e) => setElementFilter(e.target.value as ElementFilter)}
            className="px-4 py-2 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 text-white focus:outline-none focus:border-white/30"
          >
            <option value="all">All Elements</option>
            <option value="Fire">🔥 Fire</option>
            <option value="Water">🌊 Water</option>
            <option value="Earth">🌍 Earth</option>
            <option value="Air">💨 Air</option>
            <option value="Aether">✨ Aether</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'aether' | 'name')}
            className="px-4 py-2 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 text-white focus:outline-none focus:border-white/30"
          >
            <option value="date">Recent First</option>
            <option value="aether">Highest Aether</option>
            <option value="name">Alphabetical</option>
          </select>

          {/* High Aether Toggle */}
          <button
            onClick={() => setShowHighAether(!showHighAether)}
            className={`px-4 py-2 rounded-lg border transition-all ${
              showHighAether
                ? 'bg-amber-600/20 border-amber-400 text-amber-300'
                : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            High Aether Only
          </button>

          {/* Upload Button */}
          <button
            onClick={onUpload}
            className="ml-auto px-4 py-2 bg-gradient-to-r from-amber-600/20 to-blue-600/20 hover:from-amber-600/30 hover:to-blue-600/30 rounded-lg text-white border border-white/10 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Sacred Asset
          </button>
        </div>
      </div>

      {/* Assets Display */}
      <AnimatePresence mode="wait">
        {filteredAssets.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-4">
              <Book className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-xl font-medium text-white/60 mb-2">
              {searchQuery || assetTypeFilter !== 'all' || elementFilter !== 'all'
                ? 'No assets match your filters'
                : 'Your Sacred Library is empty'}
            </h3>
            <p className="text-white/40 mb-6">
              {searchQuery || assetTypeFilter !== 'all' || elementFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Upload documents, audio, video, or images to begin'}
            </p>
            <button
              onClick={onUpload}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-blue-600 hover:from-amber-500 hover:to-blue-500 rounded-lg text-white font-medium transition-all"
            >
              Upload Your First Sacred Asset
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAssets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <SacredAssetPreview
                      {...asset}
                      onPreview={() => onAssetSelect?.(asset)}
                      onDownload={() => window.open(asset.fullUrl, '_blank')}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-2">
                {filteredAssets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex items-center gap-4 p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                    onClick={() => onAssetSelect?.(asset)}
                  >
                    <div className="text-white/60">
                      {getAssetIcon(asset.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{asset.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-white/50 mt-1">
                        <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                        {asset.metadata?.element && (
                          <span 
                            style={{ color: elementColors[asset.metadata.element] }}
                          >
                            {asset.metadata.element}
                          </span>
                        )}
                        {asset.metadata?.aetherResonance && asset.metadata.aetherResonance > 0.5 && (
                          <span className="text-amber-400">
                            ✨ {Math.round(asset.metadata.aetherResonance * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Timeline View */}
            {viewMode === 'timeline' && (
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
                <div className="space-y-6">
                  {filteredAssets.map((asset, index) => (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative flex items-start gap-4"
                    >
                      <div className="w-4 h-4 rounded-full bg-white/30 border-2 border-white/50 mt-2" />
                      <div className="flex-1">
                        <SacredAssetPreview
                          {...asset}
                          onPreview={() => onAssetSelect?.(asset)}
                          onDownload={() => window.open(asset.fullUrl, '_blank')}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}