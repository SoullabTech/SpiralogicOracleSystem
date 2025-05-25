import { useState } from 'react';
import { getOracleResponse } from '../../services/oracleService';
import { logOracleInsight } from '../../services/oracleLogger';

const elements = ['fire', 'water', 'earth', 'air', 'aether'];

export function AskOracle({ userId }: { userId: string }) {
  const [userInput, setUserInput] = useState('');
  const [oracleResponse, setOracleResponse] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New state
  const [elementFocus, setElementFocus] = useState<string>('aether');
  const [emotion, setEmotion] = useState<number>(0.5);

  const handleAskOracle = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    try {
      const context = {
        elementalFocus: elementFocus,
        emotionTone: emotion,
      };

      const response = await getOracleResponse(userInput, { userId, context });

      setOracleResponse(response);
      setHistory((prev) => [...prev, { query: userInput, response }]);
      setUserInput('');

      await logOracleInsight({
        anon_id: userId,
        insight: {
          query: userInput,
          response: response.content,
        },
        element: response.metadata?.elementalAdjustments?.emphasis?.[0] || elementFocus,
        emotion: emotion,
        archetype: response.metadata?.archetype || '',
        phase: response.metadata?.phase || '',
      });
    } catch (err) {
      setOracleResponse({ content: '⚠️ Failed to fetch oracle response.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-lg font-semibold text-indigo-600">Ask the Oracle</h2>

      {/* 🔮 Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Elemental Focus</label>
          <select
            value={elementFocus}
            onChange={(e) => setElementFocus(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {elements.map((el) => (
              <option key={el} value={el}>
                {el.charAt(0).toUpperCase() + el.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Emotional Tone ({emotion})
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={emotion}
            onChange={(e) => setEmotion(parseFloat(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">0 = calm · 1 = intense</p>
        </div>
      </div>

      {/* 💬 Ask Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleAskOracle}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Asking...' : 'Ask'}
        </button>
      </div>

      {/* ✨ Oracle Response */}
      {oracleResponse && (
        <div className="bg-gray-50 border-l-4 border-indigo-500 p-4 rounded">
          <p className="text-gray-800 whitespace-pre-line">{oracleResponse.content}</p>

          {oracleResponse.metadata?.elementalAdjustments?.emphasis && (
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              {oracleResponse.metadata.elementalAdjustments.emphasis.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🕘 History */}
      {history.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm text-gray-500 mb-2">Previous Questions</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            {history.slice(-5).reverse().map((entry, index) => (
              <li key={index} className="border-l-2 border-gray-200 pl-3">
                <p>
                  <strong className="text-indigo-600">Q:</strong> {entry.query}
                </p>
                <p>
                  <strong className="text-green-700">A:</strong> {entry.response?.content}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
