// src/components/StartSession.tsx
import axios from 'axios';
import React, { useState } from 'react';

const StartSession: React.FC = () => {
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSession = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/sessions/start', { metadata });
      console.log('Session started:', response.data);
    } catch (err) {
      setError('Failed to start session. Please try again.');
      console.error('Error starting session:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Start Session</h2>
      <input
        type="text"
        value={metadata}
        onChange={(e) => setMetadata(e.target.value)}
        placeholder="Enter session metadata"
      />
      <button onClick={handleStartSession} disabled={loading}>
        {loading ? 'Starting...' : 'Start Session'}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default StartSession;
