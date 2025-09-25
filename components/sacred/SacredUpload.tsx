'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, Music, Video, Image as ImageIcon, 
  Camera, Mic, X, Sparkles 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { analyzeDocument } from '@/lib/pipelines/document-analysis';

interface SacredUploadProps {
  onOfferingComplete?: (document: any) => void;
  className?: string;
}

interface UploadingFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'analyzing' | 'offering' | 'complete' | 'error';
  resonance?: {
    element: string;
    coherence: number;
    hasAether: boolean;
  };
}

export function SacredUpload({ onOfferingComplete, className = '' }: SacredUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isOfferingAnimating, setIsOfferingAnimating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Sacred offering animation sequence
  const performOffering = async (uploadFile: UploadingFile) => {
    setIsOfferingAnimating(true);
    
    // Update status to offering
    setUploadingFiles(prev => 
      prev.map(f => f.id === uploadFile.id 
        ? { ...f, status: 'offering' }
        : f
      )
    );
    
    // Ritual pause for animation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Complete offering
    setUploadingFiles(prev => 
      prev.map(f => f.id === uploadFile.id 
        ? { ...f, status: 'complete' }
        : f
      )
    );
    
    setIsOfferingAnimating(false);
    onOfferingComplete?.(uploadFile);
  };

  const processFile = async (file: File) => {
    const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const uploadFile: UploadingFile = {
      file,
      id: fileId,
      progress: 0,
      status: 'uploading'
    };
    
    setUploadingFiles(prev => [...prev, uploadFile]);
    
    try {
      // Upload to Supabase storage
      const fileName = `${fileId}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sacred-offerings')
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadingFiles(prev =>
              prev.map(f => f.id === fileId 
                ? { ...f, progress: percent }
                : f
              )
            );
          }
        });
      
      if (uploadError) throw uploadError;
      
      // Update status to analyzing
      setUploadingFiles(prev =>
        prev.map(f => f.id === fileId 
          ? { ...f, status: 'analyzing', progress: 100 }
          : f
        )
      );
      
      // Analyze document for wisdom extraction
      const analysis = await analyzeDocument(file, uploadData.path);
      
      // Update with resonance data
      setUploadingFiles(prev =>
        prev.map(f => f.id === fileId 
          ? { 
              ...f, 
              resonance: {
                element: analysis.element,
                coherence: analysis.coherence,
                hasAether: analysis.aetherDetected
              }
            }
          : f
        )
      );
      
      // Perform sacred offering animation
      const finalFile = { ...uploadFile, resonance: analysis };
      await performOffering(finalFile);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles(prev =>
        prev.map(f => f.id === fileId 
          ? { ...f, status: 'error' }
          : f
        )
      );
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => processFile(file));
    setIsDragging(false);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: {
      'text/*': ['.txt', '.md', '.pdf', '.docx'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  // Mobile capture handlers
  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) processFile(file);
    };
    input.click();
  };

  const handleAudioCapture = () => {
    // Would implement WebRTC audio recording here
    console.log('Audio capture not yet implemented');
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (file.type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (file.type.startsWith('video/')) return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const getElementColor = (element?: string) => {
    switch (element) {
      case 'Fire': return 'text-red-500';
      case 'Water': return 'text-blue-500';
      case 'Earth': return 'text-green-500';
      case 'Air': return 'text-amber-500';
      default: return 'text-sacred';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Drop zone overlay */}
      <div {...getRootProps()} className="relative">
        <input {...getInputProps()} />
        
        {/* Sacred drop zone */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity 
                }}
                className="bg-gradient-to-br from-sacred/20 to-amber-900/20 rounded-3xl p-12 border border-sacred/30"
              >
                <Sparkles className="w-20 h-20 text-sacred mx-auto mb-6" />
                <p className="text-2xl text-white font-light">Offer Your Sacred Asset</p>
                <p className="text-white/60 mt-2">Release to receive wisdom</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile capture buttons */}
      <div className="flex gap-3 justify-center mt-4">
        <button
          onClick={handleCameraCapture}
          className="px-4 py-2 bg-sacred/10 border border-sacred/30 rounded-lg flex items-center gap-2 hover:bg-sacred/20 transition-colors"
        >
          <Camera className="w-4 h-4" />
          <span className="text-sm">Camera</span>
        </button>
        <button
          onClick={handleAudioCapture}
          className="px-4 py-2 bg-sacred/10 border border-sacred/30 rounded-lg flex items-center gap-2 hover:bg-sacred/20 transition-colors"
        >
          <Mic className="w-4 h-4" />
          <span className="text-sm">Record</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-sacred/10 border border-sacred/30 rounded-lg flex items-center gap-2 hover:bg-sacred/20 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm">Browse</span>
        </button>
      </div>

      {/* Uploading files */}
      <AnimatePresence>
        {uploadingFiles.map((uploadFile) => (
          <motion.div
            key={uploadFile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: uploadFile.status === 'offering' ? 0 : 1,
              y: uploadFile.status === 'offering' ? -100 : 0,
              scale: uploadFile.status === 'offering' ? 0.5 : 1
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-4 bg-sacred/5 rounded-xl p-4 border border-sacred/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(uploadFile.file)}
                <div>
                  <p className="text-white text-sm truncate max-w-[200px]">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-white/40 text-xs">
                    {(uploadFile.file.size / 1024 / 1024).toFixed(1)}MB
                  </p>
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="text-right">
                {uploadFile.status === 'uploading' && (
                  <div className="w-20">
                    <div className="h-1 bg-sacred/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-sacred"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadFile.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/40 mt-1">{Math.round(uploadFile.progress)}%</p>
                  </div>
                )}
                
                {uploadFile.status === 'analyzing' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-5 h-5 text-sacred" />
                  </motion.div>
                )}
                
                {uploadFile.status === 'offering' && (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-sacred"
                  >
                    ✨ Offering...
                  </motion.div>
                )}
                
                {uploadFile.status === 'complete' && uploadFile.resonance && (
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getElementColor(uploadFile.resonance.element)}`}>
                      {uploadFile.resonance.element}
                    </span>
                    {uploadFile.resonance.hasAether && (
                      <span className="text-xs text-amber-400">Aether</span>
                    )}
                  </div>
                )}
                
                {uploadFile.status === 'error' && (
                  <span className="text-red-500 text-sm">Failed</span>
                )}
              </div>
            </div>
            
            {/* Coherence bar */}
            {uploadFile.resonance && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 h-1 bg-sacred/10 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-sacred to-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadFile.resonance.coherence * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Offering animation overlay */}
      <AnimatePresence>
        {isOfferingAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 20, 20],
                opacity: [1, 0.5, 0]
              }}
              transition={{ duration: 2 }}
              className="w-4 h-4 bg-sacred rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}