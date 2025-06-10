/**
 * AINChatBox - Alternative interface for Oracle interactions
 * Provides a chat-like experience with elemental tracking
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SoulCompass from './SoulCompass';
import ElementalCompass from './ElementalCompass';
import SpiralogicForecast from '@/components/oracle/SpiralogicForecast';
import { analyzeElementalTrend } from '@/lib/elemental-tracker';
import { saveElementalSnapshot } from '@/lib/elemental-history';
import { OracleMetadata } from '@/types/shared';

interface AINChatBoxProps {
  onSubmit?: (q: string) => void;
}

/**
 * Chat-based Oracle interface with elemental tracking
 * @param props - Component props including submit callback
 * @returns Interactive chat interface component
 */
export default function AINChatBox({ onSubmit }: AINChatBoxProps) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [metadata, setMetadata] = useState<OracleMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Sends user query to Oracle API and processes response
   */
  const sendToOracle = async () => {
    if (!input.trim()) return;
    setLoading(true);
    onSubmit?.(input);

    const journalSummary = localStorage.getItem('lastJournalSummary') || '';
    const holoflower = localStorage.getItem('lastHoloflower') || '{}';

    try {
      const res = await fetch('/api/oracle/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          userId: 'demo-user-001',
          context: {
            journalSummary,
            holoflowerState: JSON.parse(holoflower)
          }
        })
      });

      const data = await res.json();
      setResponse(data.content);
      setMetadata(data.metadata);

      // 🌀 Save snapshot to trend log
      const trend = analyzeElementalTrend(journalSummary);
      saveElementalSnapshot({
        timestamp: new Date().toISOString(),
        userId: 'demo-user-001',
        elemental: trend
      });
    } catch {
      setResponse('🌀 Oracle connection unstable. Try again.');
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="flex gap-2 items-center">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask the Oracle anything..."
          onKeyDown={e => e.key === 'Enter' && sendToOracle()}
        />
        <Button onClick={sendToOracle} disabled={loading}>
          {loading ? 'Listening...' : 'Ask'}
        </Button>
      </div>

      <section className="max-w-4xl mx-auto mt-10">
        <SpiralogicForecast />
      </section>

      {response && (
        <SoulCompass response={response} metadata={metadata} />
      )}

      {/* Optional Elemental Balance Visual */}
      <ElementalCompass />
    </div>
  );
}