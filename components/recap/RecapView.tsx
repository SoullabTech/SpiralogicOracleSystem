'use client';
import { useRef, useEffect } from 'react';
import { recapMeta, RecapKey } from '@/lib/recap/map';
import type { RecapBuckets, RecapSource } from '@/lib/recap/types';
import type { Whisper } from '@/lib/micro/whispers';
import { useRecap } from '@/hooks/useRecap';
import { maybeSpeakMayaCue } from '@/lib/voice/maya-cues';

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

function WhispersSection({ whispers }: { whispers?: Whisper[] }) {
  if (!whispers?.length) return null;
  
  return (
    <section className="border border-edge-700 rounded-xl bg-bg-800/60 p-4 shadow-soft">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-ink-100 font-medium">Whispers</h3>
        <span className="text-ink-300 text-xs">{whispers.length} recent captures</span>
      </div>
      <ul className="space-y-3">
        {whispers.map((w) => (
          <li key={w.id} className="flex items-start gap-3">
            <span
              className="mt-1 h-2 w-2 rounded-full flex-shrink-0"
              aria-hidden
              style={{
                backgroundColor:
                  w.element === "fire" ? "#ef4444" :
                  w.element === "water" ? "#3b82f6" :
                  w.element === "earth" ? "#10b981" :
                  w.element === "air" ? "#a78bfa" : "#f59e0b"
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-ink-200 text-sm leading-relaxed">{w.content}</p>
              <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-ink-400">
                {w.tags?.slice(0, 3).map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded-full border border-edge-600 text-ink-300">{t}</span>
                ))}
                <span>{new Date(w.created_at).toLocaleString()}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-ink-400 text-xs">
        These quick captures are gently woven into today's synthesis.
      </p>
    </section>
  );
}

export function RecapView({ source, whispers }: { source: RecapSource; whispers?: Whisper[] }) {
  const { recap, loading, error } = useRecap(source);
  const whisperedOnceRef = useRef(false);
  
  // Gentle Maya cue on first whispers surface (with device-level cooldown)
  useEffect(() => {
    if (!whisperedOnceRef.current && whispers && whispers.length > 0) {
      const lastCueKey = "whispersCueSeen";
      const lastCue = localStorage.getItem(lastCueKey);
      const now = Date.now();
      
      // 3-day cooldown (259200000ms = 3 days)
      if (!lastCue || (now - parseInt(lastCue)) > 259200000) {
        whisperedOnceRef.current = true;
        localStorage.setItem(lastCueKey, now.toString());
        
        maybeSpeakMayaCue({
          id: "whispers_surfaced",
          text: "I've surfaced a few gentle notes that seem connected. Want to take a look?",
          context: { source: "whispers", count: whispers.length },
        });
      }
    }
  }, [whispers]);

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
      
      {whispers && <WhispersSection whispers={whispers} />}

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