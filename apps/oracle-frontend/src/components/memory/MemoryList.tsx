// 📁 src/components/memory/MemoryList.tsx (Frontend)

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function MemoryList() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemories() {
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("memories")
        .select("id, content, metadata, created_at")
        .eq("user_id", user.data?.user?.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setMemories(data);
      }
      setLoading(false);
    }

    fetchMemories();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <h2 className="text-2xl font-bold text-center">🧠 Your Memory Timeline</h2>
      {loading ? (
        <p className="text-center text-gray-500">Loading memories...</p>
      ) : memories.length === 0 ? (
        <p className="text-center text-gray-400">No memories submitted yet.</p>
      ) : (
        <ul className="space-y-4">
          {memories.map((mem) => (
            <li key={mem.id} className="border rounded p-4 bg-white shadow">
              <div className="text-sm text-gray-500">
                {new Date(mem.created_at).toLocaleString()}
              </div>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap">{mem.content}</p>
              {mem.metadata && (
                <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {JSON.stringify(mem.metadata, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
