// File: oracle-frontend/src/components/oracle/ElementalTrendChart.tsx

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getElementalHistory } from '@/lib/elemental-history';

export default function ElementalTrendChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const history = getElementalHistory();
    const formatted = history.map(entry => ({
      timestamp: new Date(entry.timestamp).toLocaleDateString(),
      ...entry.elemental
    })).reverse();
    setData(formatted);
  }, []);

  return (
    <div className="w-full h-96 bg-muted/5 border rounded-xl p-4">
      <h3 className="text-xl font-semibold text-center mb-4">📈 Elemental Trend Over Time</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis domain={[0, 'dataMax + 1']} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Fire" stroke="#f97316" />
          <Line type="monotone" dataKey="Water" stroke="#3b82f6" />
          <Line type="monotone" dataKey="Earth" stroke="#22c55e" />
          <Line type="monotone" dataKey="Air" stroke="#a855f7" />
          <Line type="monotone" dataKey="Aether" stroke="#ec4899" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
