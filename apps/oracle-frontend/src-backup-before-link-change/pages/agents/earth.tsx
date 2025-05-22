// 🌍 Earth Agent Page – Frontend View
// 📁 pages/agents/earth.tsx

import JournalEntryForm from "@/components/forms/JournalEntryForm";
import { getLatestPromptForElement } from "@/lib/agentPrompts";
import { useEffect, useState } from "react";

export default function EarthAgentPage() {
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    getLatestPromptForElement("Earth").then(setPrompt);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 text-green-900">
      <header>
        <h1 className="text-3xl font-bold text-center">🌍 Earth Agent: The Steward</h1>
        <p className="text-center text-green-700 mt-2">
          The Earth archetype roots us into form, structure, and service. It brings patience, responsibility, and embodiment.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold">🌱 Attributes of Earth</h2>
        <ul className="list-disc ml-6 mt-2 space-y-1 text-green-800">
          <li>Grounded presence and stability</li>
          <li>Long-term vision and responsibility</li>
          <li>Care for systems, sustainability, and growth</li>
          <li>Shadow: rigidity, control, stagnation</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">📝 Journal Prompt</h2>
        <p className="text-green-700 mt-2 italic">{prompt || "Loading prompt..."}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">🌿 Ritual</h2>
        <p className="text-green-700 mt-2">
          Stand barefoot on the earth. Inhale deeply. Ask: “What am I here to tend?” Write down three practical actions toward it.
        </p>
      </section>

      <section className="mt-10">
        <JournalEntryForm element="Earth" />
      </section>

      <footer className="text-center text-sm text-green-600 mt-12">
        ✨ Earth reminds us: build slowly, build wisely.
      </footer>
    </div>
  );
}
