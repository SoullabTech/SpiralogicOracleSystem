import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileAudio, FileVideo, FileImage, FileText, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useSupabaseClient, useUser } from '@/lib/supabase';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  result?: any;
  error?: string;
}

interface SacredUploadProps {
  onUploadComplete?: (document: any) => void;
  sessionId?: string;
  acceptTypes?: string[];
  maxSizeMB?: number;
  className?: string;
}

const elementalColors = {
  fire: 'from-red-500 to-orange-500',
  water: 'from-blue-500 to-cyan-500', 
  earth: 'from-green-500 to-emerald-500',
  air: 'from-amber-500 to-pink-500',
  aether: 'from-yellow-500 to-amber-500'
};

export default function SacredUpload({
  onUploadComplete,
  sessionId,
  acceptTypes = ['*/*'],
  maxSizeMB = 50,
  className = ''
}: SacredUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const supabase = useSupabaseClient();
  const user = useUser();

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('audio/')) return <FileAudio className="w-8 h-8 text-yellow-400" />;
    if (type.startsWith('video/')) return <FileVideo className="w-8 h-8 text-amber-400" />;
    if (type.startsWith('image/')) return <FileImage className="w-8 h-8 text-blue-400" />;
    return <FileText className="w-8 h-8 text-green-400" />;
  };

  const getFileTypeCategory = (file: File): string => {
    const type = file.type;
    if (type.startsWith('audio/')) return 'audio';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('image/')) return 'image';
    return 'document';
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    try {
      // Update status to uploading
      setUploadFiles(prev => prev.map(uf => 
        uf.id === uploadFile.id ? { ...uf, status: 'uploading', progress: 10 } : uf
      ));

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Prepare form data
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      if (sessionId) formData.append('sessionId', sessionId);

      // Upload with progress tracking
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      // Update to completed
      setUploadFiles(prev => prev.map(uf => 
        uf.id === uploadFile.id 
          ? { ...uf, status: 'completed', progress: 100, result: result.document }
          : uf
      ));

      // Notify parent component
      if (onUploadComplete && result.document) {
        onUploadComplete(result.document);
      }

      // Auto-remove completed files after 3 seconds
      setTimeout(() => {
        setUploadFiles(prev => prev.filter(uf => uf.id !== uploadFile.id));
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadFiles(prev => prev.map(uf => 
        uf.id === uploadFile.id 
          ? { 
              ...uf, 
              status: 'error', 
              progress: 0,
              error: error instanceof Error ? error.message : 'Upload failed'
            }
          : uf
      ));
    }
  };

  const handleFileSelect = useCallback((files: FileList) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    Array.from(files).forEach(file => {
      // Check file size
      if (file.size > maxSizeBytes) {
        console.warn(`File ${file.name} exceeds ${maxSizeMB}MB limit`);
        return;
      }

      // Check file type if specified
      if (acceptTypes.length > 0 && !acceptTypes.includes('*/*')) {
        const matchesType = acceptTypes.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('/*', '/'));
          }
          return file.type === type;
        });
        
        if (!matchesType) {
          console.warn(`File ${file.name} type not accepted`);
          return;
        }
      }

      const uploadFile: UploadFile = {
        id: `${Date.now()}_${Math.random()}`,
        file,
        progress: 0,
        status: 'pending'
      };

      setUploadFiles(prev => [...prev, uploadFile]);
      
      // Start upload
      uploadFile(uploadFile);
    });
  }, [acceptTypes, maxSizeMB]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeUploadFile = (id: string) => {
    setUploadFiles(prev => prev.filter(uf => uf.id !== id));
  };

  const getElementalGradient = (file: File) => {
    const filename = file.name.toLowerCase();
    if (filename.includes('fire') || filename.includes('flame')) return elementalColors.fire;
    if (filename.includes('water') || filename.includes('ocean')) return elementalColors.water;
    if (filename.includes('earth') || filename.includes('nature')) return elementalColors.earth;
    if (filename.includes('sacred') || filename.includes('hz')) return elementalColors.aether;
    return elementalColors.air;
  };

  if (!user) {
    return (
      <div className={`p-8 text-center text-gray-400 ${className}`}>
        <div className="text-4xl mb-4">🔮</div>
        <p>Please sign in to upload sacred assets</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? '#d4af37' : 'rgba(255,255,255,0.1)'
        }}
        className="relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 bg-black/20 backdrop-blur-sm hover:bg-black/30"
      >
        <input
          type="file"
          multiple
          accept={acceptTypes.join(',')}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <motion.div
            animate={{ rotate: isDragging ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Upload className="w-12 h-12 text-amber-400 mx-auto" />
          </motion.div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Drop your sacred assets here
            </h3>
            <p className="text-gray-400 text-sm">
              Or click to browse • Max {maxSizeMB}MB per file
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Supports audio, video, images, and documents
            </p>
          </div>
        </div>

        {/* Sacred glow effect */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadFiles.map((uploadFile) => (
          <motion.div
            key={uploadFile.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${getElementalGradient(uploadFile.file)} bg-opacity-10 border border-white/10`}
          >
            {/* File Icon */}
            <div className="flex-shrink-0">
              {getFileIcon(uploadFile.file)}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-white font-medium truncate">
                  {uploadFile.file.name}
                </h4>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {(uploadFile.file.size / 1024 / 1024).toFixed(1)}MB
                </span>
              </div>

              {/* Progress Bar */}
              {uploadFile.status === 'uploading' && (
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-amber-500 to-pink-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadFile.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              {/* Status Text */}
              <div className="flex items-center gap-2 mt-1">
                {uploadFile.status === 'completed' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-xs">Upload complete</span>
                    {uploadFile.result?.resonance?.coherence > 0.8 && (
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    )}
                  </>
                )}
                {uploadFile.status === 'error' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-xs">
                      {uploadFile.error || 'Upload failed'}
                    </span>
                  </>
                )}
                {uploadFile.status === 'uploading' && (
                  <span className="text-amber-400 text-xs">Uploading...</span>
                )}

                {/* Resonance Display */}
                {uploadFile.result?.resonance?.elements && (
                  <div className="flex gap-1 ml-auto">
                    {uploadFile.result.resonance.elements.map((element: string) => (
                      <span
                        key={element}
                        className="px-2 py-1 text-xs bg-gradient-to-r from-amber-500/20 to-pink-500/20 rounded text-amber-300"
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeUploadFile(uploadFile.id)}
              className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}