import axios from 'axios';
import React, { useEffect, useState } from 'react';

const MemoryInsights: React.FC = () => {
  const [insights, setInsights] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await axios.get('/api/insights');
        setInsights(res.data);
      } catch (err) {
        console.error('Error fetching memory insights:', err);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return (
    <div className="p-4 bg-gray-50 rounded-xl shadow">
      <h3 className="text-lg font-semibold text-indigo-700 mb-2">🧠 Memory Insights</h3>
      {loading ? (
        <p className="text-gray-500">Loading insights...</p>
      ) : insights && insights.length > 0 ? (
        <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
          {insights.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No insights available. Try uploading some memories first.</p>
      )}
    </div>
  );
};

export default MemoryInsights;
