"use client";

import { useRef, useState } from 'react';
import { Paperclip, Upload, X, FileText, Music, Video, Image, File } from 'lucide-react';

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  uploadId?: string;
  error?: string;
  transcript?: string;
  summary?: string;
}

interface UploadButtonProps {
  onFilesUploaded?: (uploads: UploadFile[]) => void;
  conversationId?: string;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
}

export default function UploadButton({
  onFilesUploaded,
  conversationId,
  disabled = false,
  maxFiles = 5,
  maxSizeMB = 50
}: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const allowedTypes = [
    'audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4',
    'video/mp4', 'video/webm',
    'application/pdf',
    'text/plain', 'text/markdown',
    'image/png', 'image/jpeg', 'image/gif'
  ];

  const getFileIcon = (type: string) => {
    if (type.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('text/') || type === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} not supported`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }
    return null;
  };

  const handleFiles = async (files: FileList) => {
    if (disabled) return;
    
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    
    // Validate files
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        console.warn(`Skipping ${file.name}: ${error}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;
    if (uploads.length + validFiles.length > maxFiles) {
      console.warn(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    // Create upload entries
    const newUploads: UploadFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: 'pending',
      progress: 0
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Start uploads
    for (const upload of newUploads) {
      await processUpload(upload);
    }
  };

  const processUpload = async (upload: UploadFile) => {
    try {
      // Update status to uploading
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'uploading', progress: 10 } : u
      ));

      // Get signed upload URL
      const signResponse = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: upload.file.name,
          fileType: upload.file.type,
          sizeBytes: upload.file.size,
          conversationId
        })
      });

      if (!signResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadId, signedUrl } = await signResponse.json();

      // Update with upload ID
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, uploadId, progress: 30 } : u
      ));

      // Upload file to Supabase Storage
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: upload.file,
        headers: {
          'Content-Type': upload.file.type,
          'Cache-Control': '3600'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload failed');
      }

      // Update progress
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, progress: 60 } : u
      ));

      // Process the upload (transcription/summarization)
      const processResponse = await fetch('/api/uploads/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId })
      });

      if (!processResponse.ok) {
        throw new Error('Processing failed');
      }

      const result = await processResponse.json();

      // Update with final results
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? {
          ...u,
          status: 'ready',
          progress: 100,
          transcript: result.transcript?.text,
          summary: result.summary
        } : u
      ));

      // Notify parent component
      if (onFilesUploaded) {
        const updatedUploads = uploads.map(u => 
          u.id === upload.id ? {
            ...u,
            status: 'ready' as const,
            progress: 100,
            transcript: result.transcript?.text,
            summary: result.summary
          } : u
        );
        onFilesUploaded(updatedUploads);
      }

    } catch (error) {
      console.error('Upload failed:', error);
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? {
          ...u,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        } : u
      ));
    }
  };

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="relative">
      {/* Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-ink-300 hover:text-ink-100 transition-colors duration-200 ease-out-soft disabled:opacity-50 disabled:cursor-not-allowed"
        title="Upload file"
      >
        <Paperclip className="w-4 h-4" />
        {uploads.length > 0 && (
          <span className="text-xs bg-gold-400 text-bg-900 rounded-full px-2 py-0.5">
            {uploads.length}
          </span>
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Drag and drop overlay */}
      {isDragOver && (
        <div
          className="fixed inset-0 bg-bg-900/80 flex items-center justify-center z-50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="bg-bg-800 border border-gold-400 rounded-lg p-8 text-center shadow-lift">
            <Upload className="w-12 h-12 text-gold-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-ink-100 mb-2">Drop files here</div>
            <div className="text-sm text-ink-300">
              Audio, video, text, PDF, and images supported
            </div>
          </div>
        </div>
      )}

      {/* Upload status list */}
      {uploads.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-bg-800 border border-edge-700 rounded-lg shadow-lift max-h-60 overflow-y-auto">
          <div className="p-3 border-b border-edge-700">
            <div className="text-sm font-medium text-ink-100">Uploads ({uploads.length})</div>
          </div>
          <div className="p-2 space-y-2">
            {uploads.map((upload) => (
              <div key={upload.id} className="flex items-center gap-3 p-2 bg-edge-700 rounded">
                <div className="flex-shrink-0">
                  {getFileIcon(upload.file.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-100 truncate">
                    {upload.file.name}
                  </div>
                  <div className="text-xs text-ink-300">
                    {upload.status === 'pending' && 'Preparing...'}
                    {upload.status === 'uploading' && `Uploading... ${upload.progress}%`}
                    {upload.status === 'processing' && 'Processing...'}
                    {upload.status === 'ready' && 'Ready'}
                    {upload.status === 'error' && (upload.error || 'Failed')}
                  </div>
                  
                  {upload.status === 'ready' && upload.summary && (
                    <div className="text-xs text-gold-400 mt-1 line-clamp-2">
                      {upload.summary}
                    </div>
                  )}
                  
                  {(upload.status === 'uploading' || upload.status === 'processing') && (
                    <div className="w-full h-1 bg-edge-700 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-1 bg-gold-400 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => removeUpload(upload.id)}
                  className="flex-shrink-0 p-1 text-ink-300 hover:text-state-red transition-colors duration-200 ease-out-soft"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global drag and drop handlers */}
      <div
        className="fixed inset-0 pointer-events-none"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      />
    </div>
  );
}