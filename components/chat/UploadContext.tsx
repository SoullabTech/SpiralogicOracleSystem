"use client";

import { FileText, Music, Video, Image, File, ExternalLink } from 'lucide-react';

interface UploadAttachment {
  id: string;
  file_name: string;
  file_type: string;
  summary?: string;
  transcript?: string;
  created_at: string;
}

interface UploadContextProps {
  attachments: UploadAttachment[];
  onRemove?: (id: string) => void;
  maxDisplay?: number;
}

export default function UploadContext({ 
  attachments, 
  onRemove, 
  maxDisplay = 3 
}: UploadContextProps) {
  if (!attachments.length) return null;

  const getFileIcon = (type: string) => {
    if (type.startsWith('audio/')) return <Music className="w-3 h-3" />;
    if (type.startsWith('video/')) return <Video className="w-3 h-3" />;
    if (type.startsWith('image/')) return <Image className="w-3 h-3" />;
    if (type.startsWith('text/') || type === 'application/pdf') return <FileText className="w-3 h-3" />;
    return <File className="w-3 h-3" />;
  };

  const getFileColor = (type: string) => {
    if (type.startsWith('audio/')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (type.startsWith('video/')) return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    if (type.startsWith('image/')) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (type.startsWith('text/') || type === 'application/pdf') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
  };

  const displayAttachments = attachments.slice(0, maxDisplay);
  const hasMore = attachments.length > maxDisplay;

  return (
    <div className="mb-3">
      <div className="text-xs text-zinc-500 mb-2 flex items-center gap-2">
        <FileText className="w-3 h-3" />
        Context from {attachments.length} file{attachments.length !== 1 ? 's' : ''}
      </div>
      
      <div className="space-y-2">
        {displayAttachments.map((attachment) => (
          <div 
            key={attachment.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getFileColor(attachment.file_type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getFileIcon(attachment.file_type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-sm font-medium truncate">
                  {attachment.file_name}
                </div>
                <div className="text-xs opacity-60">
                  {new Date(attachment.created_at).toLocaleDateString()}
                </div>
              </div>
              
              {attachment.summary && (
                <div className="text-xs opacity-80 line-clamp-2 mb-2">
                  {attachment.summary}
                </div>
              )}
              
              {attachment.transcript && (
                <div className="text-xs opacity-60 line-clamp-1">
                  <span className="font-medium">Transcript:</span> {attachment.transcript}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => window.open(`/uploads/${attachment.id}`, '_blank')}
                className="p-1 opacity-60 hover:opacity-100 transition-opacity"
                title="View details"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
              
              {onRemove && (
                <button
                  onClick={() => onRemove(attachment.id)}
                  className="p-1 opacity-60 hover:opacity-100 hover:text-red-400 transition-colors"
                  title="Remove from context"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
        
        {hasMore && (
          <div className="text-xs text-zinc-500 text-center py-1">
            +{attachments.length - maxDisplay} more files in context
          </div>
        )}
      </div>
    </div>
  );
}