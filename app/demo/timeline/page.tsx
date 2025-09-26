'use client';

import { useEffect, useState } from 'react';
import { SessionTimeline } from '@/components/SessionTimeline';
import { AdminOverridePanel } from '@/components/AdminOverridePanel';
import { Soulprint, soulprintTracker } from '@/lib/beta/SoulprintTracking';
import { symbolExtractor } from '@/lib/intelligence/SymbolExtractionEngine';
import { obsidianExporter } from '@/lib/obsidian/ObsidianExporter';

export default function TimelineDemo() {
  const [soulprint, setSoulprint] = useState<Soulprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoText, setDemoText] = useState('');
  const [extractionResult, setExtractionResult] = useState<any>(null);

  const demoUserId = 'demo_timeline_user';

  useEffect(() => {
    let sp = soulprintTracker.getSoulprint(demoUserId);

    if (!sp) {
      sp = soulprintTracker.createSoulprint(demoUserId, 'Demo Timeline User');

      soulprintTracker.trackSymbol(demoUserId, 'White Stag', 'A guiding presence appeared in the mist', 'air');
      soulprintTracker.trackSymbol(demoUserId, 'River', 'Crossing the threshold of fear', 'water');
      soulprintTracker.trackSymbol(demoUserId, 'Mirror', 'Seeing myself for the first time', 'aether');
      soulprintTracker.trackSymbol(demoUserId, 'Mountain', 'The challenge ahead feels insurmountable', 'earth');

      soulprintTracker.trackArchetypeShift(demoUserId, 'Seeker', {
        trigger: 'Beginning of the journey',
        integrationLevel: 0.5
      });
      soulprintTracker.trackArchetypeShift(demoUserId, 'Shadow', {
        fromArchetype: 'Seeker',
        trigger: 'Confronting hidden fears',
        shadowWork: true,
        integrationLevel: 0.6
      });
      soulprintTracker.trackArchetypeShift(demoUserId, 'Healer', {
        fromArchetype: 'Shadow',
        trigger: 'Integration ritual completed',
        shadowWork: true,
        integrationLevel: 0.8
      });

      soulprintTracker.updateElementalBalance(demoUserId, 'water', 0.3);
      soulprintTracker.updateElementalBalance(demoUserId, 'air', 0.2);
      soulprintTracker.updateElementalBalance(demoUserId, 'earth', 0.15);

      soulprintTracker.addMilestone(
        demoUserId,
        'threshold',
        'Crossed from innocence to awareness',
        'major',
        { element: 'water' }
      );
      soulprintTracker.addMilestone(
        demoUserId,
        'shadow-encounter',
        'Met the shadow self in the depths',
        'pivotal',
        { element: 'earth' }
      );
      soulprintTracker.addMilestone(
        demoUserId,
        'breakthrough',
        'Sudden clarity about life purpose',
        'major',
        { element: 'air' }
      );

      soulprintTracker.trackEmotionalState(demoUserId, 0.6, ['curiosity', 'anticipation']);
      soulprintTracker.trackEmotionalState(demoUserId, 0.3, ['fear', 'confusion']);
      soulprintTracker.trackEmotionalState(demoUserId, 0.75, ['clarity', 'peace', 'joy']);
    }

    setSoulprint(sp);
    setLoading(false);
  }, []);

  const handleUpdate = (updates: Partial<Soulprint>) => {
    if (!soulprint) return;
    const updated = { ...soulprint, ...updates };
    setSoulprint(updated);
  };

  const handleExport = async () => {
    try {
      const result = await obsidianExporter.exportSoulprint(demoUserId);
      if (result.success) {
        alert(`Exported ${result.files.length} files to Obsidian vault`);
      } else {
        alert('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export error: ' + error);
    }
  };

  const handleReset = () => {
    const confirmed = confirm('This will reset the demo soulprint. Continue?');
    if (confirmed) {
      window.location.reload();
    }
  };

  const handleExtractSymbols = async () => {
    if (!demoText.trim()) return;

    const result = await symbolExtractor.extract(demoText, demoUserId);
    setExtractionResult(result);

    const sp = soulprintTracker.getSoulprint(demoUserId);
    if (sp) setSoulprint(sp);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading demo...</div>
      </div>
    );
  }

  if (!soulprint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Failed to load soulprint</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Session Timeline Demo</h1>
          <p className="text-gray-600">Visualize the psychospiritual journey</p>
        </div>
      </div>

      {/* Symbol Extraction Tester */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔮 Symbol Extraction Tester</h2>
          <p className="text-sm text-gray-600 mb-4">
            Type text with symbolic language and see what gets extracted automatically.
          </p>

          <textarea
            value={demoText}
            onChange={(e) => setDemoText(e.target.value)}
            placeholder="Example: I felt like a white stag guiding me through the forest. The river ahead seemed impossible to cross, but I knew I had to face my shadow..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
          />

          <button
            onClick={handleExtractSymbols}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Extract Symbols
          </button>

          {extractionResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-2">Extraction Results:</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Symbols:</strong> {extractionResult.symbols.map((s: any) => s.symbol).join(', ') || 'None'}
                </div>
                <div>
                  <strong>Archetypes:</strong> {extractionResult.archetypes.map((a: any) => a.archetype).join(', ') || 'None'}
                </div>
                <div>
                  <strong>Emotions:</strong> {extractionResult.emotions.map((e: any) => e.emotion).join(', ') || 'None'}
                </div>
                <div>
                  <strong>Milestones:</strong> {extractionResult.milestones.length} detected
                </div>
                <div>
                  <strong>Confidence:</strong> {(extractionResult.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <SessionTimeline soulprint={soulprint} />

      {/* Admin Panel */}
      <AdminOverridePanel
        soulprint={soulprint}
        onUpdate={handleUpdate}
        onExport={handleExport}
        onReset={handleReset}
      />
    </div>
  );
}