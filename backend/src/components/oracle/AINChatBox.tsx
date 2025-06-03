import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SoulCompass from './SoulCompass';

export default function AINChatBox() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sendToOracle = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/oracle/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, userId: 'demo-user-001' })
      });

      const data = await res.json();
      setResponse(data.content);
      setMetadata(data.metadata);
    } catch (err) {
      setResponse('🌀 Oracle connection unstable. Try again.');
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
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

      {response && (
        <SoulCompass response={response} metadata={metadata} />
      )}
    </div>
  );
}