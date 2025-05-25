'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function CollectiveSymbolsPage() {
  const [symbolCounts, setSymbolCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchAllSymbols = async () => {
      const { data, error } = await supabase
        .from('spiral_breaths')
        .select('symbols')
        .neq('symbols', null);

      if (!error && data) {
        const all = data.flatMap((entry) => entry.symbols || []);
        const counts: Record<string, number> = {};

        all.forEach((symbol: string) => {
          counts[symbol] = (counts[symbol] || 0) + 1;
        });

        setSymbolCounts(counts);
      }
    };

    fetchAllSymbols();
  }, []);

  const sortedSymbols = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1]);

  return (
    <Layout>
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold text-soullab-gold">🌐 Collective Dream Symbols</h1>
        <p className="text-soullab-moon">Most commonly appearing symbols across all users.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {sortedSymbols.map(([symbol, count]) => (
            <Link
              key={symbol}
              href={`/dream-symbols/thread?search=${symbol}`}
              className="block px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition"
            >
              #{symbol} <span className="text-xs text-soullab-moon">({count})</span>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
