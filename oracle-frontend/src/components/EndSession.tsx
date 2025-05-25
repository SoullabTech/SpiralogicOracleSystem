// src/components/EndSession.tsx
import axios from 'axios';
import React, { useState } from 'react';

const EndSession: React.FC = () => {
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEndSession = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/sessions/end/${sessionId}`);
      console.log('Session ended:', response.data);
    } catch (err) {
      setError('Failed to end session. Please try again.');
      console.error('Error ending session:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>End Session</h2>
      <input
        type="text"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        placeholder="Enter session ID"
      />
      <button onClick={handleEndSession} disabled={loading}>
        {loading ? 'Ending...' : 'End Session'}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default EndSession;
