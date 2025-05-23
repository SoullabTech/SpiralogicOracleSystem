import React, { useState } from 'react';

const TranscriptForm: React.FC<{ userId: string; onSuccess?: () => void }> = ({
  userId,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const tagArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const res = await fetch('/api/transcripts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        title,
        content,
        audio_url: audioUrl || undefined,
        tags: tagArray,
      }),
    });

    setLoading(false);

    if (res.ok) {
      setTitle('');
      setContent('');
      setAudioUrl('');
      setTags('');
      onSuccess?.();
    } else {
      alert('Failed to upload transcript');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-subtle mb-6">
      <h2 className="text-xl font-display mb-4 text-brand-dark">Upload Transcript</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded-xl p-2 mb-4"
        required
      />

      <textarea
        placeholder="Transcript content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border rounded-xl p-2 mb-4"
        rows={5}
        required
      />

      <input
        type="url"
        placeholder="Optional audio URL"
        value={audioUrl}
        onChange={(e) => setAudioUrl(e.target.value)}
        className="w-full border rounded-xl p-2 mb-4"
      />

      <input
        type="text"
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="w-full border rounded-xl p-2 mb-4"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-brand text-white px-4 py-2 rounded-xl hover:bg-brand-dark transition"
      >
        {loading ? 'Uploading...' : 'Submit'}
      </button>
    </form>
  );
};

export default TranscriptForm;
