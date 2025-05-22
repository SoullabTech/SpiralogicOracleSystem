import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function FeedbackPage() {
  const [category, setCategory] = useState("magical");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const metadata = {
      page: window.location.pathname,
      agent: "Unknown",
      step: "unknown-step",
    };

    const { error } = await supabase.from("feedback").insert([
      {
        category,
        message,
        metadata,
      },
    ]);

    if (!error) {
      setSubmitted(true);
      setMessage("");
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-6 space-y-6 text-gray-800">
      <h1 className="text-3xl font-bold text-center">📬 Share Your Feedback</h1>
      <p className="text-center text-gray-600">
        What felt unclear, magical, or blocked your flow? Your input helps us refine the Spiral.
      </p>

      {submitted ? (
        <p className="text-green-600 text-center font-semibold">
          ✨ Thank you for your resonance. Feedback received.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="magical">🌟 Magical</option>
              <option value="confusing">🌀 Confusing</option>
              <option value="blockers">⛔ Blockers</option>
              <option value="general">🗣 General</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  );
}
