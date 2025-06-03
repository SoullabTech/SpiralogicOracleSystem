import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Example local fallback data
const fallbackData = [
  { date: '2025-06-01', fire: 4, water: 2, earth: 3, air: 5 },
  { date: '2025-06-02', fire: 3, water: 3, earth: 4, air: 4 },
  { date: '2025-06-03', fire: 5, water: 1, earth: 3, air: 2 },
];

export default function ElementalTrendChart() {
  const [data, setData] = useState(fallbackData);

  useEffect(() => {
    const stored = localStorage.getItem('elementalTrend');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setData(parsed);
      } catch (e) {
        console.warn('Error parsing elementalTrend from localStorage:', e);
      }
    }
  }, []);

  return (
    <div className="mt-10 bg-white rounded-lg shadow-md p-4">
      <h3 className="text-xl font-semibold mb-4 text-center">🧬 Elemental Trend History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="fire" stroke="#f87171" strokeWidth={2} />
          <Line type="monotone" dataKey="water" stroke="#60a5fa" strokeWidth={2} />
          <Line type="monotone" dataKey="earth" stroke="#34d399" strokeWidth={2} />
          <Line type="monotone" dataKey="air" stroke="#a78bfa" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
