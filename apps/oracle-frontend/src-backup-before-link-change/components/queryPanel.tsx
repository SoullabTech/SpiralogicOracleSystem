// src/components/QueryPanel.tsx
import axios from 'axios';
import React, { useState } from 'react';

const QueryPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askOracle = async () => {
    setLoading(true);
    setResponse('');
    try {
      const res = await axios.post('/api/oracle', {
        input: query,
        userId: 'guest',
      });
      setResponse(res.data.content || res.data.response || '🌌 No response received.');
    } catch (error) {
      console.error('Error querying oracle:', error);
      setResponse('⚠️ Error reaching the Oracle.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10 space-y-4">
      <h2 className="text-2xl font-semibold text-center text-purple-800">Ask the Oracle</h2>

      <textarea
        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-purple-400"
        placeholder="Ask your question here..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button
        onClick={askOracle}
        disabled={loading || !query.trim()}
        className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        {loading ? 'Consulting the Oracle...' : 'Ask Oracle'}
      </button>

      {response && (
        <div className="mt-4 p-4 border-l-4 border-purple-500 bg-purple-50 rounded">
          <p className="text-gray-800 whitespace-pre-line">{response}</p>
        </div>
      )}
    </div>
  );
};

export default QueryPanel;
