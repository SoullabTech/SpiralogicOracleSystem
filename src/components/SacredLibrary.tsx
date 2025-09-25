import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SacredAssetPreview from './SacredAssetPreview';
import { Search, Filter, Grid, List, Upload, Sparkles } from 'lucide-react';

interface Asset {
  id: string;
  type: 'audio' | 'video' | 'image' | 'doc';
  category?: string;
  path: string;
  preview: string;
  gif?: string;
  frequency?: number;
  metadata?: {
    duration?: string;
    resolution?: string;
    size?: string;
    resonance?: string[];
    coherence?: number;
  };
}

interface SacredLibraryProps {
  assets?: Asset[];
  onAssetSelect?: (asset: Asset) => void;
  onUpload?: (file: File) => void;
}

const categoryFilters = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'audio', label: 'Audio', icon: '🎵' },
  { id: 'video', label: 'Video', icon: '🎥' },
  { id: 'image', label: 'Images', icon: '🖼️' },
  { id: 'doc', label: 'Documents', icon: '📄' },
  { id: 'sacred', label: 'Sacred', icon: '🌸' }
];

export default function SacredLibrary({ 
  assets = [], 
  onAssetSelect,
  onUpload 
}: SacredLibraryProps) {
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(assets);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDragging, setIsDragging] = useState(false);

  // Load assets from manifest if not provided
  useEffect(() => {
    if (assets.length === 0) {
      fetch('/docs/assets/assets.json')
        .then(res => res.json())
        .then(data => setFilteredAssets(data))
        .catch(console.error);
    } else {
      setFilteredAssets(assets);
    }
  }, [assets]);

  // Filter assets based on search and category
  useEffect(() => {
    let filtered = assets;

    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'sacred') {
        filtered = filtered.filter(a => 
          a.id.includes('holoflower') || 
          a.id.includes('sacred') || 
          a.id.includes('Hz') ||
          a.metadata?.resonance?.includes('aether')
        );
      } else {
        filtered = filtered.filter(a => a.type === selectedCategory);
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.metadata?.resonance?.some(r => 
          r.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredAssets(filtered);
  }, [searchTerm, selectedCategory, assets]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => onUpload?.(file));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => onUpload?.(file));
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-amber-900/20 via-black to-pink-900/20 p-6"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Sacred Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent mb-2">
          Sacred Library
        </h1>
        <p className="text-gray-400 text-sm">
          Your collection of resonant assets & sacred media
        </p>
      </motion.div>

      {/* Controls Bar */}
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, type, or resonance..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2">
          {categoryFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedCategory(filter.id)}
              className={`px-3 py-2 rounded-lg transition-all ${
                selectedCategory === filter.id
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="mr-1">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-amber-500/30 text-amber-300'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-amber-500/30 text-amber-300'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Button */}
        <label className="px-4 py-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-lg cursor-pointer hover:from-amber-600 hover:to-pink-600 transition-all flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {/* Assets Grid/List */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <SacredAssetPreview
                  type={asset.type}
                  title={asset.id}
                  previewUrl={asset.preview}
                  fullUrl={asset.path}
                  gifUrl={asset.gif}
                  metadata={{
                    ...asset.metadata,
                    frequency: asset.frequency
                  }}
                  onSelect={() => onAssetSelect?.(asset)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onAssetSelect?.(asset)}
                className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-amber-500/30 cursor-pointer transition-all"
              >
                {/* Preview Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                  {asset.type === 'audio' ? (
                    <img src={asset.preview} alt={asset.id} className="w-full h-full object-contain" />
                  ) : asset.type === 'video' || asset.type === 'image' ? (
                    <img src={asset.preview} alt={asset.id} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      📄
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="font-medium text-white">{asset.id}</div>
                  <div className="text-sm text-gray-400 flex gap-4 mt-1">
                    <span>{asset.type}</span>
                    {asset.category && <span>{asset.category}</span>}
                    {asset.frequency && <span>{asset.frequency}Hz</span>}
                    {asset.metadata?.duration && <span>{asset.metadata.duration}</span>}
                  </div>
                </div>

                {/* Resonance Tags */}
                {asset.metadata?.resonance && (
                  <div className="flex gap-2">
                    {asset.metadata.resonance.map(r => (
                      <span
                        key={r}
                        className="px-2 py-1 text-xs bg-gradient-to-r from-amber-500/20 to-pink-500/20 rounded text-amber-300"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                {/* Coherence Indicator */}
                {asset.metadata?.coherence && asset.metadata.coherence > 0.8 && (
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">🌸</div>
          <p className="text-gray-400">
            {searchTerm || selectedCategory !== 'all' 
              ? 'No assets match your filters'
              : 'Your sacred library awaits its first upload'}
          </p>
        </motion.div>
      )}

      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-amber-900/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-black/80 rounded-3xl p-12 border-2 border-dashed border-amber-500">
              <Upload className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <p className="text-white text-xl">Drop your sacred assets here</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}