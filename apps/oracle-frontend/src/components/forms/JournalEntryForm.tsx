// 📁 components/forms/JournalEntryForm.tsx

import { supabase } from "@/lib/supabaseClient";
import React, { useState } from "react";

export default function JournalEntryForm({ element }: { element: string }) {
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("reflection");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("journal_entries").insert([
      {
        message,
        category,
        metadata: {
          element,
          page: `/agents/${element.toLowerCase()}`,
          timestamp: new Date().toISOString(),
        },
      },
    ]);

    if (error) {
      console.error("Submission failed:", error);
    } else {
      setSuccess(true);
      setMessage("");
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6 mt-8">
      <h3 className="text-lg font-semibold">📝 Reflect with {element}</h3>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        placeholder={`Your insight, reflection, or ritual with ${element}`}
        className="w-full border border-gray-300 rounded px-3 py-2"
        required
      />

      <div className="space-y-2 sm:flex sm:space-y-0 sm:space-x-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full sm:w-1/3 border border-gray-300 rounded px-2 py-2"
        >
          <option value="reflection">Reflection</option>
          <option value="ritual">Ritual</option>
          <option value="integration">Integration</option>
          <option value="dream">Dream</option>
        </select>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-1/3 bg-blue-700 text-white rounded px-4 py-2 hover:bg-blue-800 transition"
        >
          {submitting ? "Sending..." : "Submit Entry"}
        </button>
      </div>

      {success && (
        <p className="text-green-600 mt-2">🌟 Entry saved! Thank you.</p>
      )}
    </form>
  );
}
