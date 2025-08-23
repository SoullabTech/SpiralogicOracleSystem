"use client";

import React from "react";
import { useWhisperWeights } from "@/hooks/useWhisperWeights";
import { DEFAULT_WEIGHTS } from "@/app/api/whispers/weights/schema";
import { features } from "@/lib/config/features";

export default function WhispersSettings() {
  const { status, weights, save, error } = useWhisperWeights();
  const [usePersonalized, setUsePersonalized] = React.useState(true);

  if (!features.whispers.enabled) {
    return (
      <div className="p-4 rounded-2xl border border-edge-700 bg-bg-900">
        <h3 className="font-semibold text-ink-100 mb-2">Whispers</h3>
        <p className="text-sm text-ink-400">Whispers feature is currently disabled.</p>
      </div>
    );
  }

  async function resetToDefaults() {
    if (confirm("Reset all whisper ranking weights to defaults? This cannot be undone.")) {
      await save(DEFAULT_WEIGHTS);
    }
  }

  const hasCustomWeights = JSON.stringify(weights) !== JSON.stringify(DEFAULT_WEIGHTS);

  return (
    <div className="p-4 rounded-2xl border border-edge-700 bg-bg-900 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ink-100">Whispers</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${\n          status === \"ready\" ? \"bg-green-500/20 text-green-400\" :\n          status === \"loading\" ? \"bg-yellow-500/20 text-yellow-400\" :\n          status === \"error\" ? \"bg-red-500/20 text-red-400\" : \"bg-gray-500/20 text-gray-400\"\n        }`}>\n          {status}\n        </span>\n      </div>\n\n      <div className=\"space-y-3 text-sm\">\n        <div>\n          <label className=\"flex items-center gap-2\">\n            <input\n              type=\"checkbox\"\n              checked={usePersonalized}\n              onChange={(e) => setUsePersonalized(e.target.checked)}\n              className=\"rounded\"\n            />\n            <span className=\"text-ink-200\">Use personalized ranking</span>\n          </label>\n          <p className=\"text-xs text-ink-400 mt-1 ml-6\">\n            When enabled, whispers are ranked using your custom weights. When disabled, uses default algorithm.\n          </p>\n        </div>\n\n        <div className=\"pt-2 border-t border-edge-700\">\n          <div className=\"flex items-center justify-between mb-2\">\n            <span className=\"text-ink-200 font-medium\">Weight Configuration</span>\n            {hasCustomWeights && (\n              <span className=\"text-xs text-gold-400\">Custom weights active</span>\n            )}\n          </div>\n          \n          <div className=\"grid grid-cols-2 gap-3 text-xs text-ink-300\">\n            <div>Element boost: <span className=\"text-gold-400\">{weights.elementBoost.toFixed(2)}</span></div>\n            <div>Keyphrase weight: <span className=\"text-gold-400\">{weights.keyphraseWeight.toFixed(2)}</span></div>\n            <div>Recency half-life: <span className=\"text-gold-400\">{weights.recencyHalfLifeDays.toFixed(1)}d</span></div>\n            <div>Recall boost: <span className=\"text-gold-400\">{weights.recallBoost.toFixed(2)}</span></div>\n          </div>\n          \n          <div className=\"mt-2\">\n            <span className=\"text-ink-200 font-medium\">Tag Weights:</span>\n            <div className=\"flex flex-wrap gap-2 mt-1\">\n              {Object.entries(weights.tagWeights).map(([tag, weight]) => (\n                <span key={tag} className=\"text-xs px-2 py-1 rounded bg-edge-700\">\n                  {tag}: <span className=\"text-gold-400\">{weight.toFixed(2)}</span>\n                </span>\n              ))}\n            </div>\n          </div>\n        </div>\n\n        {error && (\n          <div className=\"p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs\">\n            Error: {error}\n          </div>\n        )}\n\n        <div className=\"flex gap-2 pt-2\">\n          <a\n            href=\"/dev/whispers/tune\"\n            className=\"px-3 py-2 text-xs rounded-lg border border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-bg-900 transition-colors\"\n          >\n            Tune Weights\n          </a>\n          {hasCustomWeights && (\n            <button\n              onClick={resetToDefaults}\n              className=\"px-3 py-2 text-xs rounded-lg border border-edge-600 text-ink-300 hover:bg-edge-600 transition-colors\"\n              disabled={status === \"loading\"}\n            >\n              Reset to Defaults\n            </button>\n          )}\n        </div>\n\n        {weights.recallBoost && (\n          <div className=\"text-xs text-ink-400\">\n            Last updated: Server weights are synced across all your devices\n          </div>\n        )}\n      </div>\n    </div>\n  );\n}