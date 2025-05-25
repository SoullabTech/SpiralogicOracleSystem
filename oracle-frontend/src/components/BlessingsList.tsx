// src/components/BlessingsList.tsx
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Blessing {
  id: string;
  text: string;
  createdAt: string;
}

export const BlessingsList: React.FC = () => {
  const [blessings, setBlessings] = useState<Blessing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlessings() {
      const { data, error } = await supabase
        .from('blessings')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(5);
      if (error) console.error('Error loading blessings:', error);
      else setBlessings(data || []);
      setLoading(false);
    }
    fetchBlessings();
  }, []);

  if (loading) return <p className="text-center">Loading blessings...</p>;

  return (
    <motion.ul
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-2"
    >
      {blessings.map((b) => (
        <li key={b.id} className="p-3 bg-white bg-opacity-70 backdrop-blur rounded-lg">
          <p className="italic text-green-700">"{b.text}"</p>
          <span className="text-xs text-gray-500">
            {new Date(b.createdAt).toLocaleDateString()}
          </span>
        </li>
      ))}
    </motion.ul>
  );
};
