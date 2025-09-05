'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Send, Mic, Square } from 'lucide-react';
import InlineFileUpload from './InlineFileUpload';
import VoiceRecorder from '../VoiceRecorder';
import { useAttachedFiles } from '@/app/hooks/useAttachedFiles';

interface ChatInputProps {
  onSendMessage: (message: string, attachedFileIds?: string[]) => void;
  onVoiceMessage?: (transcript: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  userId?: string;
}

export default function ChatInput({
  onSendMessage,
  onVoiceMessage,
  disabled = false,
  placeholder = "Ask Maya anything...",
  maxLength = 4000,
  userId = "anonymous"
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    attachedFiles,
    updateFiles,
    clearFiles,
    getCompletedFileIds,
    hasUploadingFiles,
    getFileContext
  } = useAttachedFiles();

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; // Max 120px height
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const handleSendMessage = () => {
    if (!message.trim() || disabled || hasUploadingFiles()) return;
    
    const attachedFileIds = getCompletedFileIds();
    const contextInfo = getFileContext();
    
    let messageToSend = message.trim();
    
    // Add file context if files are attached
    if (contextInfo && attachedFileIds.length > 0) {
      messageToSend = `${contextInfo.contextMessage}\n\n${messageToSend}`;
    }
    
    onSendMessage(messageToSend, attachedFileIds);
    setMessage('');
    clearFiles();
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceTranscription = (data: { transcript: string; audioUrl?: string }) => {
    if (data.transcript) {
      if (onVoiceMessage) {
        onVoiceMessage(data.transcript);
      } else {
        // Fallback: add to text input
        setMessage(prev => prev + (prev ? ' ' : '') + data.transcript);
        adjustTextareaHeight();
      }
    }
    setIsVoiceMode(false);
  };

  const canSend = message.trim().length > 0 && !disabled && !hasUploadingFiles();

  return (
    <div className="border-t bg-white p-4">
      {/* Input Container */}
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        
        {/* File Upload */}
        <div className="flex-shrink-0 self-end pb-2">
          <InlineFileUpload 
            onFilesChange={updateFiles}
            maxFiles={5}
            maxSizePerFile={10}
          />
        </div>

        {/* Text Input Area */}
        <div className="flex-1 relative">
          {/* Show voice recorder when in voice mode */}
          {isVoiceMode ? (
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-blue-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Voice Recording</span>
                <button
                  onClick={() => setIsVoiceMode(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>
              <VoiceRecorder
                userId={userId}
                onTranscribed={handleVoiceTranscription}
                autoSend={true}
                silenceTimeout={5000}
                minSpeechLength={1000}
              />
            </div>
          ) : (
            <>
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={attachedFiles.length > 0 ? "Ask about your files..." : placeholder}
                disabled={disabled}
                maxLength={maxLength}
                className="w-full min-h-[44px] max-h-[120px] p-3 pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ height: 'auto' }}
              />

              {/* Character Counter */}
              {message.length > maxLength * 0.8 && (
                <div className="absolute bottom-2 right-12 text-xs text-gray-400">
                  {message.length}/{maxLength}
                </div>
              )}
            </>
          )}
        </div>

        {/* Voice/Send Button */}
        <div className="flex-shrink-0 flex items-end pb-1">
          {!isVoiceMode && message.trim().length === 0 ? (
            // Voice button when no text
            <button
              onClick={() => setIsVoiceMode(true)}
              disabled={disabled}
              className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Voice message"
            >
              <Mic className="w-5 h-5" />
            </button>
          ) : !isVoiceMode ? (
            // Send button when text exists
            <button
              onClick={handleSendMessage}
              disabled={!canSend}
              className={`w-10 h-10 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                canSend
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Attached Files Preview (already handled in InlineFileUpload) */}
      
      {/* Upload Status */}
      {hasUploadingFiles() && (
        <div className="mt-2 text-center">
          <span className="text-sm text-gray-500">Uploading files...</span>
        </div>
      )}

      {/* Hint Text */}
      <div className="mt-2 text-center text-xs text-gray-400">
        Press Enter to send • Shift+Enter for new line • Drop files to attach
      </div>
    </div>
  );
}