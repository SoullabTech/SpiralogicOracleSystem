// 🔥 Fire Agent Page – Frontend View
// 📁 pages/agents/fire.tsx

import React, { useEffect, useState } from "react";
import { getLatestPromptForElement } from "@/lib/agentPrompts";
import JournalEntryForm from "@/components/forms/JournalEntryForm";

export default function FireAgentPage() {
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    getLatestPromptForElement("Fire").then(setPrompt);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 text-red-900">
      <header>
        <h1 className="text-3xl font-bold text-center">🔥 Fire Agent: The Initiator</h1>
        <p className="text-center text-red-700 mt-2">
          The Fire archetype carries the flame of vision, drive, and ignition. It catalyzes new cycles of transformation.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mt-6">🔥 Attributes of Fire</h2>
        <ul className="list-disc ml-6 mt-2 space-y-1 text-red-800">
          <li>Clarity of purpose and visionary foresight</li>
          <li>Fearless momentum and bold risk-taking</li>
          <li>Creative spark, passion, and initiation</li>
          <li>Shadow: burnout, ego, and volatility</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">📝 Journal Prompt</h2>
        <p className="text-red-700 mt-2 italic">
          {prompt || "Loading prompt..."}
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">🌟 Ritual</h2>
        <p className="text-red-700 mt-2">
          Light a candle. Set a timer for 10 minutes. Free-write your next bold idea, no censoring. Then name the first action — and do it.
        </p>
      </section>

      <section className="mt-10">
        <JournalEntryForm element="Fire" />
      </section>

      <footer className="text-center text-sm text-red-600 mt-12">
        ✨ Fire renews. Fire destroys illusions. What are you ready to burn through?
      </footer>
    </div>
  );
}
