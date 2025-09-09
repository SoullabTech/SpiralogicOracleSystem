"use client";

import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Image, 
  Music, 
  Video, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Sparkles,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UploadingFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  mayaReflection?: string;
  error?: string;
  fileId?: string;
}

interface SacredFileUploadProps {
  onUploadComplete?: (fileId: string, mayaReflection: string) => void;
  onMayaSpeak?: (text: string) => void;
  isVisible?: boolean;
  onToggle?: () => void;
}

const SUPPORTED_TYPES = {
  'text/plain': { ext: '.txt', icon: FileText, color: '#6B9BD1', type: 'text' },
  'text/markdown': { ext: '.md', icon: FileText, color: '#7A9A65', type: 'text' },
  'application/pdf': { ext: '.pdf', icon: FileText, color: '#C85450', type: 'document' },
  'application/json': { ext: '.json', icon: FileText, color: '#D4B896', type: 'text' },
  'text/csv': { ext: '.csv', icon: FileText, color: '#B69A78', type: 'text' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    ext: '.docx', 
    icon: FileText, 
    color: '#6B9BD1',
    type: 'document'
  },
  'image/jpeg': { ext: '.jpg', icon: Image, color: '#7A9A65', type: 'image' },
  'image/png': { ext: '.png', icon: Image, color: '#7A9A65', type: 'image' },
  'image/gif': { ext: '.gif', icon: Image, color: '#7A9A65', type: 'image' },
  'audio/mpeg': { ext: '.mp3', icon: Music, color: '#C85450', type: 'audio' },
  'audio/wav': { ext: '.wav', icon: Music, color: '#C85450', type: 'audio' },
  'video/mp4': { ext: '.mp4', icon: Video, color: '#D4B896', type: 'video' },
  'video/quicktime': { ext: '.mov', icon: Video, color: '#D4B896', type: 'video' }
};

export function SacredFileUpload({ 
  onUploadComplete, 
  onMayaSpeak,
  isVisible = false,
  onToggle
}: SacredFileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File): Promise<void> => {
    const fileId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create upload entry
    const uploadFile: UploadingFile = {
      id: fileId,
      file,
      status: 'uploading',
      progress: 0
    };

    setUploadingFiles(prev => [...prev, uploadFile]);

    try {
      // Check file type
      const fileInfo = SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES];
      if (!fileInfo) {
        throw new Error(`File type ${file.type} is not supported`);
      }

      // Maya speaks about receiving the file
      const mayaComment = `I've received your ${fileInfo.type === 'text' ? 'text' : 
                                                fileInfo.type === 'image' ? 'image' :
                                                fileInfo.type === 'audio' ? 'audio' :
                                                fileInfo.type === 'video' ? 'video' : 'document'}. 
                           Let me analyze its content...`;
      
      onMayaSpeak?.(mayaComment);
      toast.success('Maya is analyzing your file...', {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #1e293b 0%, #2e3a4b 100%)',
          color: '#D4B896',
          border: '1px solid rgba(212, 184, 150, 0.3)'
        }
      });

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', fileInfo.type);

      // Update progress
      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 25 } : f
      ));

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      // Update progress - file uploaded
      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 50, status: 'processing', fileId: data.id } : f
      ));

      // Wait for Maya's analysis (poll for completion)
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;

        try {
          const statusResponse = await fetch(`/api/documents/${data.id}/status`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            
            if (statusData.status === 'ready') {
              // Maya's reflection on the file
              const mayaReflection = statusData.maya_reflection || 
                `I have contemplated your ${fileInfo.type}. It holds interesting patterns that I can help you explore further.`;
              
              setUploadingFiles(prev => prev.map(f => 
                f.id === fileId ? { 
                  ...f, 
                  progress: 100, 
                  status: 'ready',
                  mayaReflection 
                } : f
              ));

              // Maya speaks her reflection
              onMayaSpeak?.(mayaReflection);
              
              toast.success('Maya has analyzed your file!', {
                duration: 4000,
                style: {
                  background: 'linear-gradient(135deg, #7A9A65 0%, #6B9BD1 100%)',
                  color: 'white'
                }
              });

              onUploadComplete?.(data.id, mayaReflection);
              
              // Remove from uploading list after a delay
              setTimeout(() => {
                setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
              }, 5000);
              
              return;
            } else if (statusData.status === 'error') {
              throw new Error(statusData.error || 'Processing failed');
            } else {
              // Still processing, update progress
              const progressMap = {
                pending: 60,
                processing: 80
              };
              setUploadingFiles(prev => prev.map(f => 
                f.id === fileId ? { 
                  ...f, 
                  progress: progressMap[statusData.status as keyof typeof progressMap] || 70
                } : f
              ));
            }
          }
        } catch (pollError) {
          console.warn('Status check failed:', pollError);
        }
      }

      throw new Error('Processing timeout - Maya is still analyzing your file');

    } catch (error) {
      console.error('Upload error:', error);
      
      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f
      ));

      toast.error(`Maya encountered difficulty: ${error instanceof Error ? error.message : 'Upload failed'}`, {
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #C85450 0%, #1e293b 100%)',
          color: 'white'
        }
      });
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsDragActive(false);
    for (const file of acceptedFiles) {
      await handleFileUpload(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: Object.keys(SUPPORTED_TYPES).reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    multiple: true,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const removeUploadingFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (mimeType: string) => {
    const fileInfo = SUPPORTED_TYPES[mimeType as keyof typeof SUPPORTED_TYPES];
    return fileInfo ? fileInfo.icon : File;
  };

  const getFileColor = (mimeType: string) => {
    const fileInfo = SUPPORTED_TYPES[mimeType as keyof typeof SUPPORTED_TYPES];
    return fileInfo ? fileInfo.color : '#B69A78';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-sacred-gold/20 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-sacred-gold" />
            <h2 className="text-2xl font-bold text-white">Share with Maya</h2>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <p className="text-gray-300 mb-6 text-center">
          Share your documents, images, or audio with Maya. She will learn from them and provide insights about their content.
        </p>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragActive || dropzoneActive
              ? 'border-sacred-gold bg-sacred-gold/10'
              : 'border-gray-600 hover:border-sacred-gold/50 hover:bg-sacred-gold/5'
          }`}
        >
          <input {...getInputProps()} ref={fileInputRef} />
          
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full transition-colors ${
              isDragActive || dropzoneActive ? 'bg-sacred-gold/20' : 'bg-slate-700/50'
            }`}>
              <Upload className={`w-8 h-8 transition-colors ${
                isDragActive || dropzoneActive ? 'text-sacred-gold' : 'text-gray-400'
              }`} />
            </div>
            
            <div>
              <p className="text-lg font-medium text-white mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Support: PDF, Word, Text, Images, Audio, Video (max 50MB)
              </p>
            </div>
          </div>
        </div>

        {/* Uploading Files */}
        {uploadingFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sacred-gold" />
              Maya is contemplating...
            </h3>
            
            {uploadingFiles.map((uploadFile) => {
              const FileIcon = getFileIcon(uploadFile.file.type);
              const fileColor = getFileColor(uploadFile.file.type);
              
              return (
                <div
                  key={uploadFile.id}
                  className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30"
                >
                  <div className="flex items-center gap-3">
                    <FileIcon 
                      className="w-8 h-8 flex-shrink-0"
                      style={{ color: fileColor }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium truncate">
                          {uploadFile.file.name}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          {uploadFile.status === 'uploading' && (
                            <Clock className="w-4 h-4 text-blue-400 animate-spin" />
                          )}
                          {uploadFile.status === 'processing' && (
                            <MessageCircle className="w-4 h-4 text-yellow-400 animate-pulse" />
                          )}
                          {uploadFile.status === 'ready' && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                          {uploadFile.status === 'error' && (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          )}
                          
                          <button
                            onClick={() => removeUploadingFile(uploadFile.id)}
                            className="p-1 hover:bg-slate-600/50 rounded"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${uploadFile.progress}%`,
                            background: uploadFile.status === 'error' 
                              ? '#C85450' 
                              : 'linear-gradient(90deg, #7A9A65, #6B9BD1)'
                          }}
                        />
                      </div>
                      
                      {/* Status Text */}
                      <div className="text-xs text-gray-400">
                        {uploadFile.status === 'uploading' && 'Uploading...'}
                        {uploadFile.status === 'processing' && 'Maya is analyzing the content...'}
                        {uploadFile.status === 'ready' && (
                          <span className="text-green-400">Maya has finished analyzing ✨</span>
                        )}
                        {uploadFile.status === 'error' && (
                          <span className="text-red-400">{uploadFile.error}</span>
                        )}
                      </div>
                      
                      {/* Maya's Reflection */}
                      {uploadFile.mayaReflection && (
                        <div className="mt-3 p-3 bg-sacred-gold/10 border border-sacred-gold/20 rounded-lg">
                          <p className="text-sm text-sacred-gold italic">
                            "{uploadFile.mayaReflection}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Supported Formats */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Supported Formats</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(SUPPORTED_TYPES).map((format, index) => {
              const Icon = format.icon;
              return (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-400">
                  <Icon className="w-4 h-4" style={{ color: format.color }} />
                  <span>{format.ext}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}