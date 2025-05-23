import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabaseClient'; // Adjust path if needed
import SpiralCalendar from '../components/SpiralMemory/SpiralCalendar';

export default function LightnessTrendGraph({ breaths }: { breaths: any[] }) {
  const lightnessScale = {
    Dense: 1,
    Emerging: 2,
    Awakening: 3,
    Radiant: 4,
  };

  const data = breaths.map((breath) => ({
    date: new Date(breath.date).toLocaleDateString(),
    lightness: lightnessScale[breath.lightness] || 0,
  }));

  return (
    <div className="w-full h-64 mt-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis domain={[0, 5]} hide />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="lightness"
            stroke="#6366F1"
            strokeWidth={3}
            dot={false}
            isAnimationActive={true}
            animationDuration={2000}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Sparkle Animation Layer */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: '100%' }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-0 left-0 w-4 h-4 rounded-full bg-white opacity-80 shadow-lg"
      />
    </div>
  );
}

export default function SpiralCalendarPage() {
  const [breaths, setBreaths] = useState<any[]>([]);

  useEffect(() => {
    const fetchBreaths = async () => {
      const { data, error } = await supabase
        .from('spiral_breaths')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching Spiral Breaths:', error.message);
      } else {
        setBreaths(data);
      }
    };

    fetchBreaths();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="max-w-5xl w-full bg-white bg-opacity-70 rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        <SpiralCalendar breaths={breaths} />
      </div>
    </div>
  );
}
