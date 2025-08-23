"use client";

import { useState, useRef, useEffect } from 'react';
import UploadButton from './UploadButton';
import UploadContext from './UploadContext';
import { MicHUD, type VoiceResult } from '../voice/MicHUD';

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  conversationId?: string;
  className?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  onVoiceFinal?: (text: string) => Promise<void> | void;
}

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

const VOICE_AUTOSEND = 
  (process.env.NEXT_PUBLIC_VOICE_AUTOSEND ?? "true") === "true";

export default function MessageComposer({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  placeholder = "What question weighs on your heart and mind?",
  disabled = false,
  conversationId,
  className = "",
  textareaRef: externalRef,
  onVoiceFinal
}: MessageComposerProps) {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef || internalRef;

  // Fetch recent uploads for context display
  useEffect(() => {
    if (conversationId) {
      fetchRecentUploads();
    }
  }, [conversationId]);

  const fetchRecentUploads = async () => {
    try {
      const res = await fetch('/api/uploads');
      if (res.ok) {
        const data = await res.json();
        // Show uploads from last 24 hours with content
        const recent = data.uploads
          ?.filter((upload: any) => 
            upload.status === 'ready' && 
            (upload.has_transcript || upload.summary) &&
            new Date(upload.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          )
          ?.slice(0, 3) || [];
        setRecentUploads(recent);
      }
    } catch (error) {
      console.warn('Failed to fetch recent uploads:', error);
    }
  };

  const handleFilesUploaded = (newUploads: UploadFile[]) => {
    setUploads(newUploads);
    // Refresh recent uploads after new files are ready
    const readyUploads = newUploads.filter(u => u.status === 'ready');
    if (readyUploads.length > 0) {
      setTimeout(fetchRecentUploads, 1000);
    }
  };

  const removeFromContext = (uploadId: string) => {
    setRecentUploads(prev => prev.filter(u => u.id !== uploadId));
  };

  // Enhanced submit handling
  const doSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || sending || disabled) return;
    setSending(true);
    try {
      await onSubmit();
      // Don't clear value here - let parent component handle it
    } finally {
      setSending(false);
      // Keep focus for quick follow-ups
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  };

  // Enhanced keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Call original handler first
    onKeyDown?.(e);
    
    // Enter to send; Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  // Voice callbacks from the mic
  const handleVoiceResult = async (voiceResult: VoiceResult) => {
    const finalText = voiceResult.text.trim();
    if (!finalText) return;
    
    // Put it in the box so the user can see it
    onChange(finalText);
    
    if (VOICE_AUTOSEND) {
      // Auto-send the voice input
      setSending(true);
      try {
        await onSubmit();
      } finally {
        setSending(false);
      }
    } else {
      // If not autosend, leave it there for manual edit+send
      onVoiceFinal?.(finalText);
    }
  };

  const hasActiveUploads = uploads.some(u => u.status !== 'ready' && u.status !== 'error');
  const hasContext = recentUploads.length > 0;

  return (
    <div className="space-y-4">
      {/* Upload Context Display */}
      {hasContext && (
        <UploadContext 
          attachments={recentUploads.map(upload => ({
            id: upload.id,
            file_name: upload.file_name,
            file_type: upload.file_type,
            summary: upload.summary,
            transcript: upload.has_transcript ? 'Available' : undefined,
            created_at: upload.created_at
          }))}
          onRemove={removeFromContext}
          maxDisplay={3}
        />
      )}

      {/* Message Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); doSend(); }} className="relative">
        <div className="flex-1 bg-bg-800/60 rounded-xl p-3 ring-1 ring-edge-600 focus-within:ring-gold-400 transition-all duration-200 shadow-soft">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || hasActiveUploads || sending}
            rows={1}
            className={`
              w-full bg-transparent outline-none resize-none text-ink-100 
              placeholder:text-ink-300 min-h-[40px]
              ${hasActiveUploads ? 'opacity-75' : ''}
              ${className}
            `}
          />
          
          <div className="mt-2 flex items-center justify-between">
            {/* Voice Input + Upload Button */}
            <div className="flex items-center gap-2">
              <MicHUD 
                onVoiceResult={handleVoiceResult}
                className="scale-75"
              />
              <UploadButton
                onFilesUploaded={handleFilesUploaded}
                conversationId={conversationId}
                disabled={disabled || sending}
                maxFiles={5}
                maxSizeMB={50}
              />
            </div>
            
            {/* Send Button */}
            <button
              type="submit"
              aria-label="Send message"
              title="Send (Enter)"
              disabled={disabled || sending || !value.trim() || hasActiveUploads}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5
                         bg-gold-400 text-bg-900 font-medium shadow-lift
                         disabled:opacity-60 hover:bg-gold-500 transition-colors duration-200 ease-out-soft"
            >
              {sending ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth="1.5"/>
                </svg>
              )}
              Send
            </button>
          </div>
        </div>
        
        {/* Processing indicator */}
        {hasActiveUploads && (
          <div className="absolute top-2 right-2 flex items-center gap-2 text-sm text-ink-300">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 814 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Processing files...
          </div>
        )}
      </form>
      
      {/* Helper text */}
      <p className="text-ink-300 text-sm text-center">
        Enter to send • Shift+Enter for newline • {VOICE_AUTOSEND ? 'Voice auto-sends' : 'Voice requires manual send'}
      </p>
    </div>
  );
}