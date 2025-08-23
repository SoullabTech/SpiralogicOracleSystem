"use client";
import React from "react";
import { features } from "@/lib/config/features";

type Props = { onChange?: (v: Partial<State>) => void };
type State = {
  adhdMode: boolean;
  energyCheckins: boolean;
  contextualRecall: boolean;
  adhdDigests: boolean;
};

export default function NeurodivergentMode({ onChange }: Props) {
  if (!features.neurodivergent.enabled) return null;

  const [state, setState] = React.useState<State>({
    adhdMode: features.neurodivergent.adhdModeDefault,
    energyCheckins: features.neurodivergent.energyCheckins,
    contextualRecall: features.neurodivergent.contextualRecall,
    adhdDigests: features.neurodivergent.adhdDigests,
  });

  const update = (patch: Partial<State>) => {
    const next = { ...state, ...patch };
    setState(next);
    localStorage.setItem("nd.prefs", JSON.stringify(next));
    onChange?.(patch);
  };

  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <h3 className="text-lg font-semibold">Neurodivergent Mode (ADHD-friendly)</h3>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={state.adhdMode} onChange={e=>update({adhdMode:e.target.checked})}/>
        <span>Enable ADHD Mode</span>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={state.energyCheckins} onChange={e=>update({energyCheckins:e.target.checked})}/>
        <span>Energy check-ins</span>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={state.contextualRecall} onChange={e=>update({contextualRecall:e.target.checked})}/>
        <span>Contextual recall (smart "remind me later")</span>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={state.adhdDigests} onChange={e=>update({adhdDigests:e.target.checked})}/>
        <span>Daily ADHD digest</span>
      </label>
      <p className="text-xs text-gray-500">Preferences are stored locally and respected by APIs.</p>
    </div>
  );
}