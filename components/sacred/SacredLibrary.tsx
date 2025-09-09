'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Music, Video, Image as ImageIcon, 
  Sparkles, Eye, Download, X, RefreshCw, AlertTriangle 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface DocumentCard {
  id: string;
  title: string;
  excerpt: string;
  element: 'Fire' | 'Water' | 'Earth' | 'Air';
  aetherDetected: boolean;
  coherence: number;
  themes: string[];
  facets: string[];
  fileUrl: string;
  fileType: string;
  createdAt: string;
  // New properties for blooming states
  status?: 'pending' | 'analyzed' | 'error';
  filename?: string;
  analysis_json?: {
    primary_element: 'fire' | 'water' | 'earth' | 'air' | 'ether';
    elemental_breakdown: {
      fire: number;
      water: number;
      earth: number;
      air: number;
      ether: number;
    };
    key_insights: string[];
    resonance_tags: string[];
  };
}

interface SacredLibraryProps {
  onCardClick?: (document: DocumentCard) => void;
  onClose?: () => void;
  onRetry?: (id: string) => void;
  className?: string;
}

export function SacredLibrary({ 
  onCardClick, 
  onClose,
  onRetry,
  className = '' 
}: SacredLibraryProps) {
  const [documents, setDocuments] = useState<DocumentCard[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether'>('all');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Load documents from Supabase
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDocs: DocumentCard[] = data.map(doc => {
        // Handle both old format (library_assets) and new format (documents with analysis)
        let element = 'Earth'; // default
        let aetherDetected = false;
        let coherence = 0.5;
        let themes: string[] = [];
        let facets: string[] = [];

        if (doc.analysis) {
          // New format with elemental analysis
          element = doc.analysis.primary_element === 'ether' ? 'Air' : 
                   doc.analysis.primary_element.charAt(0).toUpperCase() + 
                   doc.analysis.primary_element.slice(1);
          aetherDetected = (doc.analysis.elemental_breakdown?.ether || 0) > 0.3;
          coherence = doc.analysis.elemental_breakdown?.ether || 0.5;
          themes = doc.analysis.key_insights || [];
          facets = doc.analysis.resonance_tags || [];
        } else if (doc.element) {
          // Old format
          element = doc.element;
          aetherDetected = doc.aether_detected || false;
          coherence = doc.coherence || 0.5;
          themes = doc.themes || [];
          facets = doc.facets || [];
        }

        return {
          id: doc.id,
          title: doc.filename || doc.title || 'Untitled',
          excerpt: doc.content_preview || doc.excerpt || 'Sacred content awaits...',
          element: element as 'Fire' | 'Water' | 'Earth' | 'Air',
          aetherDetected,
          coherence,
          themes,
          facets,
          fileUrl: doc.storage_path || doc.file_url || '#',
          fileType: doc.mime_type || doc.file_type || 'text',
          createdAt: doc.created_at,
          // New properties for blooming
          status: doc.status || 'analyzed',
          filename: doc.filename,
          analysis_json: doc.analysis
        };
      });

      setDocuments(formattedDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    if (filter === 'Aether') return doc.aetherDetected;
    return doc.element === filter;
  });

  // Element colors and styling
  const getElementStyle = (element: string) => {
    switch (element) {
      case 'Fire':
        return {
          color: '#ff6b35',
          bg: 'bg-gradient-to-br from-red-500/10 to-orange-500/10',
          border: 'border-red-500/30',
          glow: '0 0 20px rgba(255, 107, 53, 0.3)'
        };
      case 'Water':
        return {
          color: '#4ecdc4',
          bg: 'bg-gradient-to-br from-blue-500/10 to-teal-500/10',
          border: 'border-blue-500/30',
          glow: '0 0 20px rgba(78, 205, 196, 0.3)'
        };
      case 'Earth':
        return {
          color: '#45b7d1',
          bg: 'bg-gradient-to-br from-green-500/10 to-yellow-500/10',
          border: 'border-green-500/30',
          glow: '0 0 20px rgba(69, 183, 209, 0.3)'
        };
      case 'Air':
        return {
          color: '#a8e6cf',
          bg: 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10',
          border: 'border-amber-500/30',
          glow: '0 0 20px rgba(168, 230, 207, 0.3)'
        };
      default:
        return {
          color: '#d4af37',
          bg: 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10',
          border: 'border-yellow-500/30',
          glow: '0 0 20px rgba(212, 175, 55, 0.3)'
        };
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('image')) return <ImageIcon className="w-5 h-5" />;
    if (fileType?.includes('audio')) return <Music className="w-5 h-5" />;
    if (fileType?.includes('video')) return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-8 h-8 text-sacred" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-light text-white">Sacred Library</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Element filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'Fire', 'Water', 'Earth', 'Air', 'Aether'].map((element) => (
          <button
            key={element}
            onClick={() => setFilter(element as any)}
            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              filter === element
                ? 'bg-sacred/20 text-sacred border border-sacred/40'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            }`}
          >
            {element === 'all' ? 'All' : element}
            {element === 'Aether' && <Sparkles className="w-4 h-4 inline ml-1" />}
          </button>
        ))}
      </div>

      {/* Document grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredDocuments.map((doc, index) => {
            const style = getElementStyle(doc.element);
            
            // Handle different states with blooming animation
            if (doc.status === 'pending') {
              return (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0.5, scale: 0.9 }}
                  animate={{ 
                    opacity: [0.7, 0.9, 0.7], 
                    scale: [0.95, 1.02, 0.95]
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden"
                >
                  {/* Shimmer overlay */}
                  <motion.div
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 rounded-xl opacity-30"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                      backgroundSize: '200% 200%'
                    }}
                  />
                  
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.15, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="text-4xl mb-3 filter drop-shadow-lg relative z-10"
                  >
                    🌱
                  </motion.div>
                  
                  <motion.p
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-sm text-white/80 font-medium mb-2 relative z-10"
                  >
                    Germinating…
                  </motion.p>
                  
                  <p className="text-xs text-white/50 line-clamp-2 text-center max-w-32 relative z-10">
                    {doc.filename || doc.title}
                  </p>
                  
                  {/* Animated dots */}
                  <div className="flex justify-center mt-2 gap-1 relative z-10">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.3, 1],
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
                  </div>
                </motion.div>
              );
            }

            if (doc.status === 'error') {
              return (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-white/5 border border-red-500/30 rounded-xl p-4 min-h-[200px] flex flex-col items-center justify-center"
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
                    <AlertTriangle className="w-8 h-8" />
                  </motion.div>
                  
                  <p className="text-sm text-red-300 font-medium mb-2">Analysis failed</p>
                  <p className="text-xs text-white/50 mb-3 line-clamp-2 text-center max-w-32">
                    {doc.filename || doc.title}
                  </p>
                  
                  {onRetry && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetry(doc.id);
                      }}
                      className="px-3 py-1.5 text-xs rounded-lg bg-red-500/80 hover:bg-red-600 text-white font-medium transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry Analysis
                    </motion.button>
                  )}
                </motion.div>
              );
            }

            // Analyzed state (default)
            return (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  boxShadow: style.glow
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className={`${style.bg} ${style.border} border rounded-xl p-4 cursor-pointer hover:scale-105 transition-all duration-300`}
                onClick={() => {
                  if (doc.status === 'analyzed') {
                    setSelectedDocument(doc);
                    onCardClick?.(doc);
                  }
                }}
                whileHover={{ y: -5 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getFileIcon(doc.fileType)}
                    <span 
                      className="text-sm font-medium"
                      style={{ color: style.color }}
                    >
                      {doc.element}
                    </span>
                  </div>
                  
                  {doc.aetherDetected && (
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity 
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </motion.div>
                  )}
                </div>

                {/* Mini Holoflower for analyzed documents */}
                {doc.analysis_json && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="flex justify-center mb-3"
                  >
                    <div className="w-16 h-16 relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className={`w-full h-full rounded-full bg-gradient-to-br ${style.bg} border-2`}
                        style={{ borderColor: style.color }}
                      >
                        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Title */}
                <h3 className="text-white font-medium mb-2 line-clamp-1">
                  {doc.title}
                </h3>

                {/* Excerpt */}
                <p className="text-white/70 text-sm mb-3 line-clamp-2">
                  {doc.excerpt}
                </p>

                {/* Element breakdown for analyzed docs */}
                {doc.analysis_json?.elemental_breakdown && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-1 mb-3 justify-center"
                  >
                    {Object.entries(doc.analysis_json.elemental_breakdown)
                      .filter(([, intensity]) => intensity > 0.1)
                      .slice(0, 3)
                      .map(([element, intensity]) => (
                        <span
                          key={element}
                          className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80"
                        >
                          {element}: {Math.round(intensity * 100)}%
                        </span>
                      ))}
                  </motion.div>
                )}

                {/* Facets (fallback) */}
                {!doc.analysis_json && doc.facets.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {doc.facets.slice(0, 3).map((facet) => (
                      <span
                        key={facet}
                        className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80"
                      >
                        {facet}
                      </span>
                    ))}
                  </div>
                )}

                {/* Coherence bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Resonance</span>
                    <span>{Math.round(doc.coherence * 100)}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ 
                        background: `linear-gradient(90deg, ${style.color}, rgba(212, 175, 55, 0.8))`
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${doc.coherence * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="text-xs text-white/40">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filteredDocuments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Sparkles className="w-16 h-16 text-sacred/50 mx-auto mb-4" />
          <p className="text-white/60 text-lg">
            {filter === 'all' 
              ? 'No sacred offerings yet' 
              : `No ${filter} offerings found`
            }
          </p>
          <p className="text-white/40 text-sm mt-2">
            Upload documents to begin building your sacred library
          </p>
        </motion.div>
      )}

      {/* Selected document modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDocument(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-medium text-white mb-1">
                    {selectedDocument.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-sm"
                      style={{ color: getElementStyle(selectedDocument.element).color }}
                    >
                      {selectedDocument.element}
                    </span>
                    {selectedDocument.aetherDetected && (
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Excerpt */}
              <div className="mb-6">
                <p className="text-white/80 italic">
                  "{selectedDocument.excerpt}"
                </p>
              </div>

              {/* Themes and facets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-white font-medium mb-2">Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.themes.map((theme) => (
                      <span
                        key={theme}
                        className="px-3 py-1 bg-sacred/20 text-sacred rounded-full text-sm"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Facets</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.facets.map((facet) => (
                      <span
                        key={facet}
                        className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm"
                      >
                        {facet}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(selectedDocument.fileUrl, '_blank')}
                  className="px-4 py-2 bg-sacred/20 text-sacred rounded-lg hover:bg-sacred/30 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View File
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedDocument.fileUrl;
                    link.download = selectedDocument.title;
                    link.click();
                  }}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}