// oracle-frontend/src/components/JournalCheckIn.tsx

import { useState } from 'react';

export default function JournalCheckIn() {
  const [entry, setEntry] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/trigger-journal-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entry_text: entry,
          user_id: 'demo-user', // Replace with real user ID once auth is connected
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(`Flow triggered. Run ID: ${data.run_id}`);
      } else {
        setStatus('error');
        setMessage(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Failed to connect to server.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-4">🌿 Daily Journal Check-In</h2>
      <textarea
        className="w-full border p-3 rounded mb-4"
        rows={6}
        placeholder="Write your thoughts, emotions, or insights..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        disabled={status === 'loading'}
        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
      >
        {status === 'loading' ? 'Processing...' : 'Submit Entry'}
      </button>
      {status !== 'idle' && (
        <div className={`mt-4 text-${status === 'success' ? 'green' : 'red'}-600`}>
          {message}
        </div>
      )}
    </div>
  );
}
