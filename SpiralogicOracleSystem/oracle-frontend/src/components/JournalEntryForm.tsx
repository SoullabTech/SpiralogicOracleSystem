// src/components/JournalEntryForm.tsx
import { useState } from "react";

export default function JournalEntryForm() {
  const [content, setContent] = useState("");
  const [theme, setTheme] = useState("");
  const [emotion, setEmotion] = useState("");
  const [symbols, setSymbols] = useState("");
  const [phase, setPhase] = useState("Water 2");
  const [submitted, setSubmitted] = useState(false);
  const [adjusterMessage, setAdjusterMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/journal/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        theme,
        emotion_tag: emotion,
        symbols: symbols.split(",").map(s => s.trim()),
        phase,
        sourceAgent: "AdjusterAgent",
      }),
    });

    const result = await response.json();
    if (result?.message) setAdjusterMessage(result.message);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-black/30 border border-aether p-6 rounded-xl text-white shadow-xl max-w-2xl mx-auto mt-10">
        <h2 className="text-2xl font-bold text-aether mb-4">Adjuster Agent Insight</h2>
        <p className="italic text-lg mb-4">{adjusterMessage}</p>
        <button onClick={() => setSubmitted(false)} className="bg-aether hover:bg-aether/80 px-4 py-2 rounded text-white">
          Submit Another Entry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 border border-white/20 p-6 rounded-xl shadow-xl max-w-2xl mx-auto mt-10 text-white space-y-4">
      <h1 className="text-3xl font-bold text-center">📝 Journal with the Adjuster Agent</h1>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Describe your experience, disruption, or emotional moment..."
        className="w-full p-4 rounded bg-black/20 border border-white/20"
        rows={6}
        required
      />
      <input
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        placeholder="Theme (e.g., shadow, rebirth, confusion)"
        className="w-full p-2 rounded bg-black/20 border border-white/20"
      />
      <input
        value={emotion}
        onChange={(e) => setEmotion(e.target.value)}
        placeholder="Emotion Tag (e.g., grief, tension, disorientation)"
        className="w-full p-2 rounded bg-black/20 border border-white/20"
      />
      <input
        value={symbols}
        onChange={(e) => setSymbols(e.target.value)}
        placeholder="Symbols (comma-separated: phoenix, mirror)"
        className="w-full p-2 rounded bg-black/20 border border-white/20"
      />
      <select value={phase} onChange={(e) => setPhase(e.target.value)} className="w-full p-2 rounded bg-black/20 border border-white/20">
        <option>Fire 1</option>
        <option>Earth 1</option>
        <option>Air 1</option>
        <option>Water 2</option>
        <option>Aether</option>
      </select>
      <button type="submit" className="w-full bg-aether hover:bg-aether/80 py-2 rounded shadow text-white">
        Submit Entry
      </button>
    </form>
  );
}
