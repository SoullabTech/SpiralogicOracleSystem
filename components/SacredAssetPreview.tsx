"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Music, Video, Image as ImageIcon, Download, Eye } from 'lucide-react';
import type { SacredAsset } from '@/lib/types';

interface SacredAssetPreviewProps extends SacredAsset {
  onPreview?: () => void;
  onDownload?: () => void;
}

export default function SacredAssetPreview({
  type,
  title,
  previewUrl,
  fullUrl,
  metadata,
  onPreview,
  onDownload
}: SacredAssetPreviewProps) {
  
  // Get icon based on asset type
  const getIcon = () => {
    switch (type) {
      case 'doc':
        return <FileText className="w-8 h-8" />;
      case 'audio':
        return <Music className="w-8 h-8" />;
      case 'video':
        return <Video className="w-8 h-8" />;
      case 'image':
        return <ImageIcon className="w-8 h-8" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };

  // Get element color
  const getElementColor = () => {
    if (!metadata?.element) return '#c9b037'; // default sacred gold
    
    const elementColors = {
      Fire: '#ff6b6b',
      Water: '#4dabf7',
      Earth: '#51cf66',
      Air: '#ffd43b',
      Aether: '#c77dff'
    };
    
    return elementColors[metadata.element];
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Format duration for audio/video
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative group"
    >
      <div 
        className="relative bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
        onClick={onPreview}
      >
        {/* Background gradient based on element */}
        <div 
          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
          style={{
            background: `radial-gradient(circle at center, ${getElementColor()} 0%, transparent 70%)`
          }}
        />

        {/* Preview content */}
        <div className="relative z-10">
          {/* Icon and type badge */}
          <div className="flex items-start justify-between mb-3">
            <div className="text-white/70 group-hover:text-white transition-colors">
              {getIcon()}
            </div>
            
            {/* Element badge */}
            {metadata?.element && (
              <span 
                className="px-2 py-1 text-xs rounded-full font-medium"
                style={{
                  backgroundColor: `${getElementColor()}20`,
                  color: getElementColor(),
                  border: `1px solid ${getElementColor()}40`
                }}
              >
                {metadata.element}
              </span>
            )}
          </div>

          {/* Preview image for images/videos */}
          {(type === 'image' || type === 'video') && previewUrl && (
            <div className="mb-3 rounded-lg overflow-hidden bg-black/20">
              <img 
                src={previewUrl} 
                alt={title}
                className="w-full h-24 object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h4 className="text-white text-sm font-medium mb-2 truncate">
            {title}
          </h4>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-xs text-white/50">
            {metadata?.fileSize && (
              <span>{formatFileSize(metadata.fileSize)}</span>
            )}
            
            {metadata?.duration && (
              <span>{formatDuration(metadata.duration)}</span>
            )}
            
            {metadata?.pageCount && (
              <span>{metadata.pageCount} pages</span>
            )}
            
            {metadata?.aetherResonance && metadata.aetherResonance > 0.5 && (
              <span className="text-purple-400">
                ✨ {Math.round(metadata.aetherResonance * 100)}% Aether
              </span>
            )}
          </div>

          {/* Wisdom quote preview */}
          {metadata?.wisdomQuotes && metadata.wisdomQuotes[0] && (
            <div className="mt-3 p-2 bg-white/5 rounded-lg border-l-2 border-white/20">
              <p className="text-xs text-white/70 italic line-clamp-2">
                "{metadata.wisdomQuotes[0]}"
              </p>
            </div>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.();
            }}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4 text-white" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload?.();
            }}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Aether resonance indicator */}
        {metadata?.aetherResonance && metadata.aetherResonance > 0.7 && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
    </motion.div>
  );
}