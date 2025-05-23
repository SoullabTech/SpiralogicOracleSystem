// ✨ Aether Agent Page – Frontend View
// 📁 pages/agents/aether.tsx

import React, { useEffect, useState } from "react";
import { getLatestPromptForElement } from "@/lib/agentPrompts";
import JournalEntryForm from "@/components/forms/JournalEntryForm";

export default function AetherAgentPage() {
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    getLatestPromptForElement("Aether").then(setPrompt);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 text-purple-900">
      <header>
        <h1 className="text-3xl font-bold text-center">✨ Aether Agent: The Oracle</h1>
        <p className="text-center text-purple-700 mt-2">
          The Aether archetype unites the other four. It is mystery, synthesis, spirit, and the pulse of the cosmos within us.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold">🌌 Attributes of Aether</h2>
        <ul className="list-disc ml-6 mt-2 space-y-1 text-purple-800">
          <li>Unity, wholeness, and transcendence</li>
          <li>Cosmic wisdom and intuition</li>
          <li>Symbolism, pattern recognition, synchronicity</li>
          <li>Shadow: dissociation, bypassing, ambiguity</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">📝 Journal Prompt</h2>
        <p className="text-purple-700 mt-2 italic">{prompt || "Loading prompt..."}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">🔮 Ritual</h2>
        <p className="text-purple-700 mt-2">
          Light incense or close your eyes in silence. Ask: “What truth wants to emerge through me now?” Write what arrives without editing.
        </p>
      </section>

      <section className="mt-10">
        <JournalEntryForm element="Aether" />
      </section>

      <footer className="text-center text-sm text-purple-600 mt-12">
        ✨ Aether invites the infinite. Trust what comes through.
      </footer>
    </div>
  );
}
