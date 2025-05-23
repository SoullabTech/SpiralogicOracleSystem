// 📁 pages/admin/prompts.tsx

import AdminRoute from "@/components/AdminRoute";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

const ELEMENTS = ["Fire", "Water", "Earth", "Air", "Aether"];

function AdminPromptsPage() {
  const [element, setElement] = useState("Fire");
  const [prompt, setPrompt] = useState("");
  const [context, setContext] = useState("");
  const [latestPrompts, setLatestPrompts] = useState<Record<string, any[]>>({});

  useEffect(() => {
    ELEMENTS.forEach(async (el) => {
      const { data } = await supabase
        .from("agent_prompts")
        .select("prompt, context, created_at")
        .eq("element", el)
        .order("created_at", { ascending: false })
        .limit(3);

      setLatestPrompts((prev) => ({ ...prev, [el]: data || [] }));
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt) return;

    const { error } = await supabase.from("agent_prompts").insert([
      { element, prompt, context },
    ]);

    if (!error) {
      alert("Prompt saved!");
      setPrompt("");
      setContext("");
      window.location.reload();
    } else {
      alert("Error saving prompt: " + error.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-8">
      <h1 className="text-2xl font-bold text-center">✍️ Admin: Add Elemental Prompt</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Element</label>
          <select
            value={element}
            onChange={(e) => setElement(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            {ELEMENTS.map((el) => (
              <option key={el}>{el}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Context (optional)</label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Prompt
        </button>
      </form>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">🧾 Recent Prompts</h2>
        {ELEMENTS.map((el) => (
          <div key={el}>
            <h3 className="text-lg font-bold mt-4">{el}</h3>
            <ul className="list-disc ml-5 text-sm text-gray-700">
              {latestPrompts[el]?.map((p, i) => (
                <li key={i}>
                  <strong>{p.prompt}</strong>{" "}
                  {p.context && <em className="text-xs">({p.context})</em>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

export default function AdminPromptsWrapper() {
  return (
    <AdminRoute>
      <AdminPromptsPage />
    </AdminRoute>
  );
}
