// src/components/TranscriptCard.tsx
import React from 'react';

interface TranscriptCardProps {
  title: string;
  content: string;
  tags?: string[];
  audioUrl?: string;
  createdAt: string;
}

const TranscriptCard: React.FC<TranscriptCardProps> = ({
  title,
  content,
  tags = [],
  audioUrl,
  createdAt,
}) => {
  return (
    <div className="bg-brand-surface shadow-subtle rounded-2xl p-6 mb-6">
      <h2 className="text-xl font-display text-brand-dark mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-2">{new Date(createdAt).toLocaleString()}</p>
      <p className="text-gray-800 mb-4">{content}</p>

      {audioUrl && (
        <audio controls className="w-full mb-4">
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-elemental-aether text-brand-dark px-3 py-1 rounded-full shadow-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TranscriptCard;
