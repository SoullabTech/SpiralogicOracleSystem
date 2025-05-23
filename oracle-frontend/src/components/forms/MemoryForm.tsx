// 📁 src/components/forms/MemoryForm.tsx

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function MemoryForm() {
  const [content, setContent] = useState("");
  const [metadata, setMetadata] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = await supabase.auth.getUser();

    const { error } = await supabase.from("memories").insert([
      {
        content,
        metadata,
        user_id: user.data?.user?.id || null,
      },
    ]);

    if (!error) {
      setContent("");
      setMetadata("");
      setSubmitted(true);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h2 className="text-xl font-semibold text-center mb-4">💭 Add a Memory</h2>
      {submitted ? (
        <p className="text-green-600 text-center">Memory submitted!</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Memory Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Metadata (optional JSON)</label>
            <textarea
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              rows={2}
              className="w-full border px-3 py-2 rounded"
              placeholder='e.g., {"tag":"dream","location":"forest"}'
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Submit Memory
          </button>
        </form>
      )}
    </div>
  );
}
