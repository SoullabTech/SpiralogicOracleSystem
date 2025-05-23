import { createMemory, fetchMemories, useAuth } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
// 📁 src/pages/memories.tsx (Frontend)

import MemoryList from "@/components/memory/MemoryList";

export default function MemoriesPage() {
  return (
    <div className="min-h-screen px-6 py-12">
      <MemoryList />
    </div>
  );
}

export default function MemoriesPage() {
  const { user, loading } = useAuth();
  const [memories, setMemories] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [metadata, setMetadata] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchMemories(user.id).then(setMemories);
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const newMemory = await createMemory(user.id, content, metadata);
    if (newMemory) {
      setMemories([...(newMemory as any[]), ...memories]);
      setContent("");
      setMetadata("");
    }
  }

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">🧠 Your Memories</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's arising in your inner world?"
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          placeholder='Optional metadata (e.g. {"agent":"Water"})'
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Memory
        </button>
      </form>

      <div className="space-y-4">
        {memories.length === 0 ? (
          <p className="text-center text-gray-500">No memories yet.</p>
        ) : (
          memories.map((m) => (
            <div key={m.id} className="border rounded p-4 bg-white shadow-sm text-sm">
              <div className="text-gray-500 text-xs">
                {new Date(m.created_at).toLocaleString()}
              </div>
              <p className="text-gray-800 mt-1">{m.content}</p>
              {m.metadata && (
                <pre className="bg-gray-100 text-xs p-2 mt-2 rounded">
                  {JSON.stringify(m.metadata, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
