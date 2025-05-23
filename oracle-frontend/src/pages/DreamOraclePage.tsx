import Header from '@/components/Header';
import { PageTransition } from '@/components/PageTransition';
import { SacredFooter } from '@/components/SacredFooter';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function DreamOraclePage() {
  const { user } = useAuth();
  const [dream, setDream] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!dream || !user) return;
    setLoading(true);

    try {
      const res = await fetch('/api/oracle/dream/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, dreamDescription: dream }),
      });

      const data = await res.json();
      setResponse(data?.interpretation ?? 'No interpretation returned.');
    } catch (error) {
      console.error(error);
      setResponse('Error interpreting your dream.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-100">
      <Header />
      <PageTransition>
        <main className="max-w-2xl mx-auto p-6 space-y-6">
          <h1 className="text-3xl font-bold text-center text-indigo-700">💤 Dream Oracle</h1>
          <p className="text-center text-gray-600">
            Describe your dream and receive a symbolic interpretation.
          </p>

          <Card>
            <CardContent className="space-y-4">
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Describe your dream..."
                value={dream}
                onChange={(e) => setDream(e.target.value)}
              />
              <Button onClick={handleSubmit} disabled={loading || !dream}>
                {loading ? 'Interpreting...' : 'Submit to Dream Oracle'}
              </Button>
            </CardContent>
          </Card>

          {response && (
            <div className="p-4 bg-white border-l-4 border-indigo-500 shadow">
              <p className="text-gray-700 italic">{response}</p>
            </div>
          )}
        </main>
      </PageTransition>
      <SacredFooter />
    </div>
  );
}
