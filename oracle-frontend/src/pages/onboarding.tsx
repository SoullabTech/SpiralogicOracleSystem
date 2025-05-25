import { getLatestPromptForElement } from "@/lib/agentPrompts";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const [chosenElement, setChosenElement] = useState("");
  const [prompt, setPrompt] = useState("");
  const [journal, setJournal] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { error } = await supabase.from("journal_entries").insert([
  {
    element: chosenElement,
    content: journal,
    metadata: {
      session_type: "onboarding",
      source: "onboarding-page",
      mood: "first-impression", // optional
    },
  },
]);

  useEffect(() => {
    if (chosenElement) {
      getLatestPromptForElement(chosenElement).then(setPrompt);
    }
  }, [chosenElement]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    const { error } = await supabase.from("journal_entries").insert([
      {
        element: chosenElement,
        content: journal,
      },
    ]);
    if (!error) {
      setSubmitted(true);
      setJournal("");
    } else {
      alert("Error saving journal: " + error.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-6 px-4">
      <h1 className="text-2xl font-bold text-center">🌟 Choose Your Archetype</h1>

      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {["Fire", "Water", "Earth", "Air", "Aether"].map((el) => (
          <button
            key={el}
            onClick={() => {
              setChosenElement(el);
              setSubmitted(false);
            }}
            className={`px-4 py-2 rounded border ${
              chosenElement === el ? "bg-indigo-600 text-white" : "bg-white"
            }`}
          >
            {el}
          </button>
        ))}
      </div>

      {chosenElement && (
        <div className="space-y-4 mt-8">
          <div className="bg-indigo-50 p-4 rounded shadow">
            <h2 className="text-lg font-semibold text-indigo-700">✨ Prompt for {chosenElement}</h2>
            <p className="italic text-indigo-900">{prompt}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="Write your response..."
              className="w-full p-3 border rounded mt-2"
              rows={5}
              required
            />
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Submit Journal
            </button>
          </form>

          {submitted && (
            <p className="text-green-600 text-sm mt-2">✅ Your journal has been saved.</p>
          )}
        </div>
      )}
    </div>
  );
}
