'use client';

import { useState } from 'react';
import { Soulprint } from '@/lib/beta/SoulprintTracking';

interface AdminOverridePanelProps {
  soulprint: Soulprint;
  onUpdate: (updates: Partial<Soulprint>) => void;
  onExport: () => void;
  onReset: () => void;
}

type TabType = 'symbols' | 'archetypes' | 'elements' | 'milestones' | 'metrics' | 'danger';

export function AdminOverridePanel({ soulprint, onUpdate, onExport, onReset }: AdminOverridePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('symbols');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors z-50"
      >
        🔧 Admin Panel
      </button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-2xl z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Admin Override Panel</h2>
          <p className="text-xs text-purple-200">{soulprint.userName || soulprint.userId}</p>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-white hover:bg-purple-700 rounded p-1 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
        <Tab label="Symbols" value="symbols" active={activeTab} onClick={setActiveTab} />
        <Tab label="Archetypes" value="archetypes" active={activeTab} onClick={setActiveTab} />
        <Tab label="Elements" value="elements" active={activeTab} onClick={setActiveTab} />
        <Tab label="Milestones" value="milestones" active={activeTab} onClick={setActiveTab} />
        <Tab label="Metrics" value="metrics" active={activeTab} onClick={setActiveTab} />
        <Tab label="Danger" value="danger" active={activeTab} onClick={setActiveTab} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'symbols' && <SymbolsTab soulprint={soulprint} onUpdate={onUpdate} />}
        {activeTab === 'archetypes' && <ArchetypesTab soulprint={soulprint} onUpdate={onUpdate} />}
        {activeTab === 'elements' && <ElementsTab soulprint={soulprint} onUpdate={onUpdate} />}
        {activeTab === 'milestones' && <MilestonesTab soulprint={soulprint} onUpdate={onUpdate} />}
        {activeTab === 'metrics' && <MetricsTab soulprint={soulprint} onUpdate={onUpdate} />}
        {activeTab === 'danger' && <DangerTab onExport={onExport} onReset={onReset} />}
      </div>
    </div>
  );
}

function Tab({ label, value, active, onClick }: {
  label: string;
  value: TabType;
  active: TabType;
  onClick: (value: TabType) => void;
}) {
  const isActive = active === value;
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
        isActive
          ? 'border-b-2 border-purple-600 text-purple-600 bg-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
}

function SymbolsTab({ soulprint, onUpdate }: { soulprint: Soulprint; onUpdate: (updates: Partial<Soulprint>) => void }) {
  const [newSymbol, setNewSymbol] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newElement, setNewElement] = useState<string>('water');

  const addSymbol = () => {
    if (!newSymbol.trim()) return;

    const updatedSymbols = [
      ...soulprint.activeSymbols,
      {
        symbol: newSymbol,
        firstAppeared: new Date(),
        lastMentioned: new Date(),
        frequency: 1,
        context: [newContext || 'Manually added'],
        elementalResonance: newElement
      }
    ];

    onUpdate({ activeSymbols: updatedSymbols });
    setNewSymbol('');
    setNewContext('');
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Add Symbol</h3>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Symbol name (e.g., River)"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <textarea
          placeholder="Context (optional)"
          value={newContext}
          onChange={(e) => setNewContext(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <select
          value={newElement}
          onChange={(e) => setNewElement(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="fire">🔥 Fire</option>
          <option value="water">💧 Water</option>
          <option value="earth">🌍 Earth</option>
          <option value="air">💨 Air</option>
          <option value="aether">✨ Aether</option>
        </select>

        <button
          onClick={addSymbol}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Add Symbol
        </button>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-900 mb-2">Active Symbols ({soulprint.activeSymbols.length})</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {soulprint.activeSymbols.map((s, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
              <div className="font-medium">{s.symbol}</div>
              <div className="text-xs text-gray-500">
                {s.elementalResonance} • {s.frequency}x
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArchetypesTab({ soulprint, onUpdate }: { soulprint: Soulprint; onUpdate: (updates: Partial<Soulprint>) => void }) {
  const [newArchetype, setNewArchetype] = useState('Seeker');
  const [trigger, setTrigger] = useState('');
  const [shadowWork, setShadowWork] = useState(false);

  const archetypes = ['Seeker', 'Sage', 'Warrior', 'Lover', 'Healer', 'Shadow', 'Creator', 'Ruler', 'Caregiver', 'Magician'];

  const addArchetype = () => {
    const updatedHistory = [
      ...soulprint.archetypeHistory,
      {
        fromArchetype: soulprint.currentArchetype,
        toArchetype: newArchetype,
        timestamp: new Date(),
        trigger: trigger || undefined,
        shadowWork,
        integrationLevel: 0.5
      }
    ];

    onUpdate({
      archetypeHistory: updatedHistory,
      currentArchetype: newArchetype
    });

    setTrigger('');
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Add Archetype Shift</h3>

      <div className="space-y-2">
        <select
          value={newArchetype}
          onChange={(e) => setNewArchetype(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {archetypes.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Trigger (optional)"
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={shadowWork}
            onChange={(e) => setShadowWork(e.target.checked)}
            className="rounded"
          />
          Shadow work involved
        </label>

        <button
          onClick={addArchetype}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Add Shift
        </button>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-900 mb-2">Current: {soulprint.currentArchetype || 'None'}</h3>
        <div className="text-sm text-gray-600">
          History: {soulprint.archetypeHistory.length} shifts
        </div>
      </div>
    </div>
  );
}

function ElementsTab({ soulprint, onUpdate }: { soulprint: Soulprint; onUpdate: (updates: Partial<Soulprint>) => void }) {
  const [elements, setElements] = useState(soulprint.elementalBalance);

  const updateElement = (element: string, value: number) => {
    const updated = { ...elements, [element]: value };
    setElements(updated);
    onUpdate({ elementalBalance: updated });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Elemental Balance</h3>

      <div className="space-y-3">
        <ElementSlider label="🔥 Fire" value={elements.fire} onChange={(v) => updateElement('fire', v)} />
        <ElementSlider label="💧 Water" value={elements.water} onChange={(v) => updateElement('water', v)} />
        <ElementSlider label="🌍 Earth" value={elements.earth} onChange={(v) => updateElement('earth', v)} />
        <ElementSlider label="💨 Air" value={elements.air} onChange={(v) => updateElement('air', v)} />
        <ElementSlider label="✨ Aether" value={elements.aether} onChange={(v) => updateElement('aether', v)} />
      </div>

      <div className="border-t pt-4 text-sm space-y-1">
        <div><strong>Dominant:</strong> {elements.dominant}</div>
        <div><strong>Deficient:</strong> {elements.deficient}</div>
      </div>
    </div>
  );
}

function ElementSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-600">{(value * 100).toFixed(0)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function MilestonesTab({ soulprint, onUpdate }: { soulprint: Soulprint; onUpdate: (updates: Partial<Soulprint>) => void }) {
  const [type, setType] = useState<'breakthrough' | 'threshold' | 'integration' | 'shadow-encounter' | 'awakening'>('breakthrough');
  const [description, setDescription] = useState('');
  const [significance, setSignificance] = useState<'minor' | 'major' | 'pivotal'>('minor');

  const addMilestone = () => {
    if (!description.trim()) return;

    const updatedMilestones = [
      ...soulprint.milestones,
      {
        timestamp: new Date(),
        type,
        description,
        significance,
        spiralogicPhase: soulprint.currentPhase
      }
    ];

    onUpdate({ milestones: updatedMilestones });
    setDescription('');
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Add Milestone</h3>

      <div className="space-y-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="breakthrough">⚡ Breakthrough</option>
          <option value="threshold">🚪 Threshold</option>
          <option value="integration">🔗 Integration</option>
          <option value="shadow-encounter">🌑 Shadow Encounter</option>
          <option value="awakening">🌅 Awakening</option>
        </select>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <select
          value={significance}
          onChange={(e) => setSignificance(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="minor">Minor</option>
          <option value="major">Major</option>
          <option value="pivotal">Pivotal</option>
        </select>

        <button
          onClick={addMilestone}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Add Milestone
        </button>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-900 mb-2">Recent Milestones</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {soulprint.milestones.slice(-10).reverse().map((m, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
              <div className="font-medium">{m.type}</div>
              <div className="text-xs text-gray-500 truncate">{m.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricsTab({ soulprint, onUpdate }: { soulprint: Soulprint; onUpdate: (updates: Partial<Soulprint>) => void }) {
  const [shadowScore, setShadowScore] = useState(soulprint.shadowIntegrationScore);

  const updateShadowScore = () => {
    onUpdate({ shadowIntegrationScore: shadowScore });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Override Metrics</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Shadow Integration Score</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={shadowScore}
            onChange={(e) => setShadowScore(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-gray-600 text-center">{(shadowScore * 100).toFixed(0)}%</div>
          <button
            onClick={updateShadowScore}
            className="mt-2 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Update
          </button>
        </div>
      </div>

      <div className="border-t pt-4 space-y-2 text-sm">
        <div><strong>Current Phase:</strong> {soulprint.currentPhase}</div>
        <div><strong>Journey Days:</strong> {Math.floor((Date.now() - soulprint.created.getTime()) / (1000 * 60 * 60 * 24))}</div>
        <div><strong>Milestones:</strong> {soulprint.milestones.length}</div>
        <div><strong>Symbols:</strong> {soulprint.activeSymbols.length}</div>
      </div>
    </div>
  );
}

function DangerTab({ onExport, onReset }: { onExport: () => void; onReset: () => void }) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Danger Zone</h3>
        <p className="text-sm text-yellow-800">Actions here are irreversible.</p>
      </div>

      <button
        onClick={onExport}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        📥 Export to Obsidian
      </button>

      <div className="border-t pt-4">
        <button
          onClick={() => setConfirmReset(true)}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          🗑️ Reset Soulprint
        </button>

        {confirmReset && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 mb-3">Are you absolutely sure? This will delete all data.</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onReset();
                  setConfirmReset(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}