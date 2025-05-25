import React, { useEffect, useState } from 'react';
import TranscriptCard from '../components/TranscriptCard';
import TranscriptForm from '../components/TranscriptForm';

interface Transcript {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  audio_url?: string;
  created_at: string;
}

// 🔁 TODO: Replace with real user ID from session/auth
const userId = 'your-user-id-goes-here';

const TranscriptsPage: React.FC = () => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);

  const fetchTranscripts = async () => {
    const res = await fetch(`/api/transcripts/${userId}`);
    const json = await res.json();
    if (json.success) setTranscripts(json.transcripts);
  };

  useEffect(() => {
    fetchTranscripts();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-display text-brand-dark mb-6">Saved Transcripts</h1>

      {/* 📥 Upload Form */}
      <TranscriptForm userId={userId} onSuccess={fetchTranscripts} />

      {/* 📄 Transcript Cards */}
      {transcripts.length === 0 ? (
        <p className="text-gray-500 italic">No transcripts saved yet.</p>
      ) : (
        transcripts.map((t) => <TranscriptCard key={t.id} {...t} />)
      )}
    </div>
  );
};

export default TranscriptsPage;
