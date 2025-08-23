'use client';
import { recapMeta, RecapKey } from '@/lib/recap/map';
import type { RecapBuckets, RecapSource } from '@/lib/recap/types';
import { useRecap } from '@/hooks/useRecap';

function Section({ k, items }: { k: RecapKey; items: string[] }) {
  if (!items?.length) return null;
  const meta = recapMeta[k];
  return (
    <section className="border border-edge-700 rounded-xl bg-bg-800 p-4 shadow-soft hover:border-gold-400 transition-colors ease-out-soft">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-ink-100 font-medium">{meta.label}</h3>
        <span className="text-ink-300 text-xs">{meta.hint}</span>
      </div>
      <ul className="list-disc pl-5 space-y-1">
        {items.map((line, i) => (
          <li key={i} className="text-ink-300">{line}</li>
        ))}
      </ul>
    </section>
  );
}

function Header({ recap }: { recap: RecapBuckets }) {
  return (
    <header className="border border-edge-700 rounded-xl bg-bg-900 p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-ink-100 font-semibold">Oracle Recap</div>
        {recap.timestamp && (
          <div className="text-ink-300 text-xs">
            {new Date(recap.timestamp).toLocaleString()}
          </div>
        )}
      </div>
      {recap.quote && (
        <blockquote className="text-ink-300 text-sm border-l-2 border-gold-400 pl-3">
          "{recap.quote}"
        </blockquote>
      )}
    </header>
  );
}

export function RecapView({ source }: { source: RecapSource }) {
  const { recap, loading, error } = useRecap(source);

  if (loading) {
    return <div className="border border-edge-700 rounded-xl bg-bg-900 p-6 text-ink-300">Weaving your recap…</div>;
  }
  if (error) {
    return <div className="border border-edge-700 rounded-xl bg-bg-900 p-6 text-red-300">{error}</div>;
  }
  if (!recap) return null;

  return (
    <div className="space-y-4">
      <Header recap={recap} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-3">
          <Section k="themes" items={recap.themes} />
        </div>
        <Section k="emotions" items={recap.emotions} />
        <Section k="steps"    items={recap.steps} />
        <Section k="ideas"    items={recap.ideas} />
        <Section k="energy"   items={recap.energy} />
      </div>

      <footer className="flex items-center justify-end">
        <button
          onClick={() => {
            const text = [
              'Oracle Recap',
              ...(recap.themes?.length   ? ['\nThemes:', ...recap.themes] : []),
              ...(recap.emotions?.length ? ['\nEmotions:', ...recap.emotions] : []),
              ...(recap.steps?.length    ? ['\nSteps:', ...recap.steps] : []),
              ...(recap.ideas?.length    ? ['\nIdeas:', ...recap.ideas] : []),
              ...(recap.energy?.length   ? ['\nEnergy:', ...recap.energy] : []),
            ].join('\n• ');
            navigator.clipboard.writeText(text).catch(() => {});
          }}
          className="px-3 py-2 border border-gold-400 text-gold-400 rounded-md hover:border-gold-500 hover:text-gold-500"
        >
          Copy recap
        </button>
      </footer>
    </div>
  );
}