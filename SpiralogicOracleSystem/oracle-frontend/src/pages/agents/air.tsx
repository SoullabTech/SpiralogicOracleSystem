// 🌬 Air Agent Page – Frontend View
// 📁 pages/agents/air.tsx

import React, { useEffect, useState } from "react";
import { getLatestPromptForElement } from "@/lib/agentPrompts";
import JournalEntryForm from "@/components/forms/JournalEntryForm";

export default function AirAgentPage() {
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    getLatestPromptForElement("Air").then(setPrompt);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 text-indigo-900">
      <header>
        <h1 className="text-3xl font-bold text-center">🌬 Air Agent: The Messenger</h1>
        <p className="text-center text-indigo-700 mt-2">
          The Air archetype brings clarity, communication, and adaptability. It carries ideas, insights, and inspiration on the wind.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold">💨 Attributes of Air</h2>
        <ul className="list-disc ml-6 mt-2 space-y-1 text-indigo-800">
          <li>Strategic thinking and perspective</li>
          <li>Articulation, storytelling, and curiosity</li>
          <li>Flexibility, learning, and movement</li>
          <li>Shadow: overthinking, disconnection, restlessness</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">📝 Journal Prompt</h2>
        <p className="text-indigo-700 mt-2 italic">{prompt || "Loading prompt..."}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">📯 Ritual</h2>
        <p className="text-indigo-700 mt-2">
          Sit by a window or outdoors. Write a letter to your future self or someone unseen. Let the wind carry your message.
        </p>
      </section>

      <section className="mt-10">
        <JournalEntryForm element="Air" />
      </section>

      <footer className="text-center text-sm text-indigo-600 mt-12">
        ✨ Air moves us forward. Listen to what is whispering.
      </footer>
    </div>
  );
}
