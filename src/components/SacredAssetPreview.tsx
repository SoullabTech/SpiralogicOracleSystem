import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileAudio, 
  FileVideo, 
  FileImage, 
  FileText,
  Play,
  Download,
  Sparkles
} from 'lucide-react';

interface AssetMetadata {
  duration?: string;
  frequency?: number;
  resolution?: string;
  size?: string;
  resonance?: string[];
  coherence?: number;
}

interface SacredAssetPreviewProps {
  type: 'doc' | 'audio' | 'video' | 'image';
  title: string;
  previewUrl: string;
  fullUrl: string;
  gifUrl?: string;
  metadata?: AssetMetadata;
  onPlay?: () => void;
  onSelect?: () => void;
}

const elementalColors = {
  fire: 'from-red-500 to-orange-500',
  water: 'from-blue-500 to-cyan-500',
  earth: 'from-green-500 to-emerald-500',
  air: 'from-amber-500 to-pink-500',
  aether: 'from-yellow-500 to-amber-500'
};

export default function SacredAssetPreview({
  type,
  title,
  previewUrl,
  fullUrl,
  gifUrl,
  metadata,
  onPlay,
  onSelect
}: SacredAssetPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showGif, setShowGif] = useState(false);

  const getElementalGradient = () => {
    if (!metadata?.resonance) return 'from-amber-500/20 to-pink-500/20';
    const primary = metadata.resonance[0]?.toLowerCase();
    return elementalColors[primary as keyof typeof elementalColors] || 'from-amber-500/20 to-pink-500/20';
  };

  const getIcon = () => {
    switch (type) {
      case 'audio': return <FileAudio className="w-8 h-8 text-yellow-400" />;
      case 'video': return <FileVideo className="w-8 h-8 text-amber-400" />;
      case 'image': return <FileImage className="w-8 h-8 text-blue-400" />;
      case 'doc': return <FileText className="w-8 h-8 text-green-400" />;
    }
  };

  const renderPreview = () => {
    switch (type) {
      case 'audio':
        return (
          <div className="relative h-24 w-full">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt={`${title} waveform`} 
                className="h-full w-full object-contain opacity-80"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getIcon()}
                </motion.div>
              </div>
            )}
            {metadata?.frequency && (
              <div className="absolute top-1 right-1 bg-black/60 px-2 py-1 rounded text-xs text-yellow-400">
                {metadata.frequency}Hz
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="relative h-32 w-full rounded-xl overflow-hidden">
            <img 
              src={showGif && gifUrl ? gifUrl : previewUrl} 
              alt={`${title} ${showGif ? 'preview' : 'thumbnail'}`}
              className="h-full w-full object-cover"
              onMouseEnter={() => gifUrl && setShowGif(true)}
              onMouseLeave={() => setShowGif(false)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button 
              onClick={onPlay}
              className="absolute inset-0 flex items-center justify-center group"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 group-hover:bg-white/30 transition-colors">
                <Play className="w-6 h-6 text-white" />
              </div>
            </button>
            {metadata?.resolution && (
              <div className="absolute bottom-1 right-1 bg-black/60 px-2 py-1 rounded text-xs text-amber-400">
                {metadata.resolution}
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="relative h-32 w-full rounded-xl overflow-hidden">
            <img 
              src={previewUrl} 
              alt={title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        );

      case 'doc':
        return (
          <div className={`h-24 w-full flex items-center justify-center bg-gradient-to-br ${getElementalGradient()} rounded-xl`}>
            {getIcon()}
          </div>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onSelect}
      className="relative rounded-2xl bg-black/70 backdrop-blur-md p-4 shadow-xl flex flex-col items-center text-center cursor-pointer transition-all duration-300 border border-white/10 hover:border-yellow-500/30"
    >
      {/* Sacred glow effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Coherence indicator */}
      {metadata?.coherence && metadata.coherence > 0.8 && (
        <div className="absolute -top-2 -right-2 z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </motion.div>
        </div>
      )}

      {/* Preview frame */}
      <div className="relative w-full z-10">
        {renderPreview()}
      </div>

      {/* Title */}
      <div className="mt-3 text-white text-sm font-medium truncate w-full px-2">
        {title}
      </div>

      {/* Metadata */}
      {metadata && (
        <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-400">
          {metadata.duration && (
            <span className="bg-white/5 px-2 py-1 rounded">
              {metadata.duration}
            </span>
          )}
          {metadata.size && (
            <span className="bg-white/5 px-2 py-1 rounded">
              {metadata.size}
            </span>
          )}
          {metadata.resonance && (
            <span className="bg-gradient-to-r from-amber-500/20 to-pink-500/20 px-2 py-1 rounded text-amber-300">
              {metadata.resonance.join(' + ')}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4 text-white" />
        </a>
        {type === 'audio' && onPlay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            title="Play"
          >
            <Play className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </motion.div>
  );
}