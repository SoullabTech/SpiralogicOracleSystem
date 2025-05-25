// 🌊 Water Agent Page – Frontend View
// 📁 pages/agents/water.tsx

import React, { useEffect, useState } from "react";
import { getLatestPromptForElement } from "@/lib/agentPrompts";
import JournalEntryForm from "@/components/forms/JournalEntryForm";

export default function WaterAgentPage() {
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    getLatestPromptForElement("Water").then(setPrompt);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 text-blue-900">
      <header>
        <h1 className="text-3xl font-bold text-center">🌊 Water Agent: The Alchemist</h1>
        <p className="text-center text-blue-700 mt-2">
          The Water archetype flows through emotion, intuition, and transformation. It softens, heals, and dissolves what no longer serves.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold">💧 Attributes of Water</h2>
        <ul className="list-disc ml-6 mt-2 space-y-1 text-blue-800">
          <li>Emotional depth and sensitivity</li>
          <li>Transformative healing and release</li>
          <li>Intuition, dreams, and mystery</li>
          <li>Shadow: overwhelm, escapism, and martyrdom</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">📝 Journal Prompt</h2>
        <p className="text-blue-700 mt-2 italic">{prompt || "Loading prompt..."}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">🧘 Ritual</h2>
        <p className="text-blue-700 mt-2">
          Fill a bowl with water. Reflect on what you are ready to release. Whisper it into the water. Pour it into the earth when done.
        </p>
      </section>

      <section className="mt-10">
        <JournalEntryForm element="Water" />
      </section>

      <footer className="text-center text-sm text-blue-600 mt-12">
        ✨ Water teaches surrender. Let yourself feel and flow.
      </footer>
    </div>
  );
}
