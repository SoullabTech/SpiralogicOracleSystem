import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function SpiralMemoryMap({ dreams }: { dreams: any[] }) {
  const data = dreams.map((dream, idx) => ({
    day: `Day ${idx + 1}`,
    petals: dream.dreamPetal ? 1 : 0,
  }));

  return (
    <div className="w-full h-64 bg-white bg-opacity-80 rounded-2xl shadow-md p-6 mt-10">
      <h3 className="text-2xl font-bold text-purple-700 text-center mb-4">
        🌀 Your Dream Spiral Growth
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="petals" stroke="#a855f7" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
