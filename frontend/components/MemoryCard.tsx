"use client";

import React, { useRef, useState } from "react";

interface MemoryCardProps {
  type: "journal" | "upload" | "voice";
  title?: string;
  contentPreview?: string;
  timestamp: string;
  fileName?: string;
  audioUrl?: string;
}

export default function MemoryCard({
  type,
  title,
  contentPreview,
  timestamp,
  fileName,
  audioUrl,
}: MemoryCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Format timestamp to relative time
  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Truncate content preview
  const truncateContent = (content: string, maxLines: number = 3) => {
    const words = content.split(" ");
    const maxWords = maxLines * 12; // Approximate words per line
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(" ") + "...";
    }
    return content;
  };

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case "journal":
        return "📝";
      case "upload":
        return "📎";
      case "voice":
        return "🎤";
    }
  };

  // Handle audio playback
  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <article
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-3 cursor-pointer"
      role="article"
      aria-label={`${type} memory: ${title || fileName || "Voice note"}`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-lg" role="img" aria-label={`${type} icon`}>
              {getIcon()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          {(title || fileName) && (
            <h3 className="font-semibold text-gray-900 truncate">
              {title || fileName}
            </h3>
          )}

          {/* Content Preview */}
          {contentPreview && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-3">
              {truncateContent(contentPreview)}
            </p>
          )}

          {/* Voice Player */}
          {type === "voice" && audioUrl && (
            <div className="mt-2">
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAudio();
                }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors text-sm"
                aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
              >
                <span className="text-sm">{isPlaying ? "⏸️" : "▶️"}</span>
                <span>{isPlaying ? "Pause" : "Play"}</span>
              </button>
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-500 mt-2">
            {formatTimestamp(timestamp)}
          </p>
        </div>
      </div>
    </article>
  );
}