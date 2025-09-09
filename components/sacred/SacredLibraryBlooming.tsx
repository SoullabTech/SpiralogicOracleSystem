'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, AlertCircle, RefreshCw, FileText, Sparkles } from 'lucide-react';
import { DocumentHoloflower } from './DocumentHoloflower';
import { cn } from '@/lib/utils';

type DocumentStatus = 'pending' | 'analyzed' | 'error';

type ElementalBalance = {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
};

type DocumentAnalysis = {
  dominantElement: keyof ElementalBalance;
  elementalBalance: ElementalBalance;
  keyThemes: string[];
  shadowAspects: string[];
  coherenceIndicators: string[];
  aetherResonance: number;
};

type DocumentRecord = {
  id: string;
  filename: string;
  status: DocumentStatus;
  uploadedAt: Date;
  analysis?: DocumentAnalysis;
  error?: string;
};

interface SacredLibraryBloomingProps {
  documents: DocumentRecord[];
  onRetry: (id: string) => void;
  onUpload: (files: FileList) => void;
  isUploading?: boolean;
}

const elementColors = {
  fire: 'from-red-500 to-orange-500',
  water: 'from-blue-500 to-cyan-500',
  earth: 'from-green-600 to-emerald-500',
  air: 'from-yellow-400 to-amber-500',
  aether: 'from-amber-500 to-yellow-600'
};

const elementEmojis = {
  fire: '🔥',
  water: '💧',
  earth: '🌱',
  air: '💨',
  aether: '✨'
};

function DocumentCard({ document, onRetry }: { 
  document: DocumentRecord; 
  onRetry: (id: string) => void; 
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [hasBloomedOnce, setHasBloomedOnce] = useState(false);

  useEffect(() => {
    if (document.status === 'analyzed' && !hasBloomedOnce) {
      setHasBloomedOnce(true);
    }
  }, [document.status, hasBloomedOnce]);

  const cardVariants = {
    pending: {
      scale: [0.95, 1.02, 0.95],
      opacity: [0.7, 0.9, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    analyzed: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    error: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const bloomVariants = {
    initial: { 
      scale: 0.8, 
      opacity: 0,
      rotateY: -15
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        staggerChildren: 0.1
      }
    }
  };

  const shimmerVariants = {
    animate: {
      backgroundPosition: ['0% 0%', '100% 100%'],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const glowVariants = {
    analyzed: {
      boxShadow: [
        '0 0 20px rgba(139, 92, 246, 0.3)',
        '0 0 40px rgba(139, 92, 246, 0.5)',
        '0 0 20px rgba(139, 92, 246, 0.3)'
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const resonanceRipple = {
    scale: [1, 1.2, 1],
    opacity: [0.5, 0, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeOut"
    }
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      animate={document.status}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative rounded-2xl p-4 border backdrop-blur-sm cursor-pointer overflow-hidden",
        "bg-white/5 dark:bg-black/20 border-white/10",
        "hover:border-white/20 transition-colors duration-300",
        document.status === 'analyzed' && "hover:bg-white/10"
      )}
      onClick={() => document.status === 'analyzed' && setShowDetails(!showDetails)}
    >
      {/* Shimmer overlay for pending state */}
      {document.status === 'pending' && (
        <motion.div
          variants={shimmerVariants}
          animate="animate"
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
            backgroundSize: '200% 200%'
          }}
        />
      )}

      {/* Background gradient based on dominant element */}
      {document.status === 'analyzed' && document.analysis && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className={cn(
              "absolute inset-0 rounded-2xl bg-gradient-to-br",
              elementColors[document.analysis.dominantElement]
            )}
          />
          {/* Resonance ripple effect */}
          <motion.div
            variants={resonanceRipple}
            animate={resonanceRipple}
            className={cn(
              "absolute inset-0 rounded-2xl bg-gradient-to-br border-2",
              elementColors[document.analysis.dominantElement],
              "border-white/20"
            )}
            style={{
              filter: 'blur(8px)'
            }}
          />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[140px]">
        {document.status === 'pending' && (
          <motion.div
            variants={bloomVariants}
            initial="initial"
            animate="animate"
            className="text-center"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.15, 1]
              }}
              transition={{ 
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="text-4xl mb-3 filter drop-shadow-lg"
            >
              🌱
            </motion.div>
            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-sm text-white/80 font-medium mb-1"
            >
              Germinating…
            </motion.p>
            <p className="text-xs text-white/50 mt-1 line-clamp-2">{document.filename}</p>
            
            {/* Animated dots */}
            <motion.div className="flex justify-center mt-2 gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-1 h-1 rounded-full bg-white/40"
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {document.status === 'analyzed' && document.analysis && (
          <motion.div
            variants={bloomVariants}
            initial="initial"
            animate="animate"
            className="flex flex-col items-center w-full"
          >
            {/* Bloom burst effect */}
            {hasBloomedOnce && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-gradient-radial from-white/30 to-transparent"
              />
            )}

            {/* MiniHoloflower with bloom animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                delay: 0.2
              }}
              className="relative"
            >
              {/* Pulsing glow ring */}
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0, 0.6, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={cn(
                  "absolute inset-0 rounded-full bg-gradient-to-r",
                  elementColors[document.analysis.dominantElement]
                )}
                style={{ filter: 'blur(12px)' }}
              />
              
              <DocumentHoloflower 
                analysis={document.analysis} 
                size={70}
                animate={true}
                pulseResonance={true}
              />
            </motion.div>

            {/* Document name with typewriter effect */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-3 text-center"
            >
              <p className="text-sm font-medium line-clamp-2 mb-1">
                {document.filename}
              </p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>

            {/* Aether resonance with animated sparkles */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-2 flex items-center gap-1 relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs text-amber-300 font-medium"
              >
                {Math.round(document.analysis.aetherResonance * 100)}% resonance
              </motion.span>
              
              {/* Floating sparkles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    y: [-5, -15],
                    x: [0, Math.random() * 10 - 5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                  className="absolute text-xs"
                >
                  ✨
                </motion.div>
              ))}
            </motion.div>

            {/* Element highlights with animated bars */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-4 grid grid-cols-5 gap-2 w-full"
            >
              {Object.entries(document.analysis.elementalBalance).map(
                ([element, intensity], index) => (
                  <motion.div
                    key={element}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: 0.8 + (index * 0.1),
                      type: "spring",
                      stiffness: 300
                    }}
                    className="flex flex-col items-center"
                  >
                    <motion.div 
                      className="text-sm mb-1"
                      animate={{ 
                        scale: intensity > 0.7 ? [1, 1.2, 1] : 1 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: intensity > 0.7 ? Infinity : 0 
                      }}
                    >
                      {elementEmojis[element as keyof ElementalBalance]}
                    </motion.div>
                    
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${intensity * 100}%` }}
                        transition={{ 
                          delay: 0.9 + (index * 0.1),
                          duration: 1.2,
                          ease: "easeOut"
                        }}
                        className={cn(
                          "h-full bg-gradient-to-r rounded-full relative",
                          elementColors[element as keyof ElementalBalance]
                        )}
                      >
                        {/* Shimmer effect on high intensity */}
                        {intensity > 0.6 && (
                          <motion.div
                            animate={{
                              x: ['-100%', '100%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          />
                        )}
                      </motion.div>
                    </div>
                    
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.1 + (index * 0.1) }}
                      className="text-xs mt-1 text-white/60 font-mono"
                    >
                      {Math.round(intensity * 100)}
                    </motion.span>
                  </motion.div>
                )
              )}
            </motion.div>

            {/* Expandable details with smooth accordion */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="mt-4 pt-4 border-t border-white/10 w-full overflow-hidden"
                >
                  {/* Key Themes */}
                  {document.analysis.keyThemes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-white/80 mb-2">Key Themes</p>
                      <div className="flex flex-wrap gap-1">
                        {document.analysis.keyThemes.slice(0, 4).map((theme, index) => (
                          <motion.span
                            key={theme}
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80 backdrop-blur-sm"
                          >
                            {theme}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shadow Aspects */}
                  {document.analysis.shadowAspects.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-white/80 mb-2">Shadow Integration</p>
                      <div className="flex flex-wrap gap-1">
                        {document.analysis.shadowAspects.slice(0, 3).map((shadow, index) => (
                          <motion.span
                            key={shadow}
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.4 + (index * 0.1) }}
                            className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-300 backdrop-blur-sm"
                          >
                            {shadow}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {document.status === 'error' && (
          <motion.div
            variants={bloomVariants}
            initial="initial"
            animate="animate"
            className="text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [-2, 2, -2]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-3xl mb-3 text-red-400"
            >
              <AlertCircle className="w-8 h-8 mx-auto" />
            </motion.div>
            <p className="text-sm text-red-300 font-medium mb-1">Analysis failed</p>
            <p className="text-xs text-white/50 mb-2 line-clamp-2">{document.filename}</p>
            {document.error && (
              <p className="text-xs text-red-200/70 mb-3">{document.error}</p>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onRetry(document.id);
              }}
              className="px-3 py-1.5 text-xs rounded-lg bg-red-500/80 hover:bg-red-600 text-white font-medium transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry Analysis
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function UploadZone({ onUpload, isUploading }: {
  onUpload: (files: FileList) => void;
  isUploading: boolean;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  return (
    <motion.div
      layout
      className={cn(
        "relative rounded-2xl p-6 border-2 border-dashed transition-all duration-300",
        "bg-white/5 dark:bg-black/20 min-h-[140px] flex items-center justify-center",
        isDragOver 
          ? "border-amber-400 bg-amber-500/10" 
          : "border-white/20 hover:border-white/30",
        isUploading && "pointer-events-none opacity-50"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="text-center">
        {isUploading ? (
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="text-4xl mb-3"
          >
            🌱
          </motion.div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="text-4xl mb-3"
          >
            <Upload className="w-10 h-10 mx-auto text-white/70" />
          </motion.div>
        )}
        
        <p className="text-sm font-medium text-white/80 mb-2">
          {isUploading ? 'Planting seeds...' : 'Drop your sacred texts'}
        </p>
        
        <p className="text-xs text-white/50 mb-4">
          PDF, TXT, MD, DOCX • Max 10MB each
        </p>

        {!isUploading && (
          <motion.label
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-4 py-2 text-xs rounded-lg bg-amber-500/80 hover:bg-amber-600 text-white font-medium cursor-pointer transition-colors"
          >
            Choose Files
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.md,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.label>
        )}
      </div>
    </motion.div>
  );
}

export default function SacredLibraryBlooming({ 
  documents, 
  onRetry, 
  onUpload,
  isUploading = false 
}: SacredLibraryBloomingProps) {
  const [filter, setFilter] = useState<'all' | DocumentStatus>('all');
  
  const filteredDocuments = documents.filter(doc => 
    filter === 'all' || doc.status === filter
  );

  const statusCounts = {
    all: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    analyzed: documents.filter(d => d.status === 'analyzed').length,
    error: documents.filter(d => d.status === 'error').length,
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-7 h-7 text-amber-400" />
          Sacred Library
        </h2>
        <p className="text-white/60">
          Upload your journals, poems, and reflections to see them bloom into wisdom
        </p>
      </motion.div>

      {/* Filter Tabs */}
      {documents.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl backdrop-blur-sm">
            {Object.entries(statusCounts).map(([status, count]) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(status as typeof filter)}
                className={cn(
                  "px-4 py-2 text-sm rounded-lg transition-colors font-medium flex items-center gap-2",
                  filter === status
                    ? "bg-amber-500 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                {status === 'all' ? 'All Documents' : status.charAt(0).toUpperCase() + status.slice(1)}
                {count > 0 && (
                  <span className={cn(
                    "px-2 py-0.5 text-xs rounded-full",
                    filter === status 
                      ? "bg-white/20" 
                      : "bg-white/10"
                  )}>
                    {count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Upload Zone */}
        <UploadZone onUpload={onUpload} isUploading={isUploading} />
        
        {/* Document Cards */}
        <AnimatePresence mode="popLayout">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onRetry={onRetry}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {documents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center py-16"
        >
          <motion.div 
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-6xl mb-6"
          >
            📚
          </motion.div>
          <h3 className="text-xl font-semibold text-white/80 mb-2">
            Your sacred library awaits
          </h3>
          <p className="text-white/50 mb-4">
            Upload your first document to begin the transformation
          </p>
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm text-amber-400"
          >
            Documents will bloom from seeds 🌱 into wisdom flowers 🌸
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}