import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import SpiralCalendar from '../components/SpiralMemory/SpiralCalendar';

export default function SpiralCalendarPage() {
  const [breaths, setBreaths] = useState<any[]>([]);

  useEffect(() => {
    const fetchBreaths = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('spiral_breaths')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching breaths:', error.message);
      } else {
        setBreaths(data || []);
      }
    };

    fetchBreaths();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <SpiralCalendar breaths={breaths} /> {/* 🌀 All the magic happens here */}
      </div>
    </div>
  );
}
