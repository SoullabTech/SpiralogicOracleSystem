import AdminRoute from "@/components/AdminRoute";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function AdminMemoriesPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [insights, setInsights] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: memoriesData } = await supabase
        .from("memories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const { data: insightsData } = await supabase
        .from("insights")
        .select("memory_id, insight");

      const groupedInsights = insightsData?.reduce((acc, i) => {
        acc[i.memory_id] = [...(acc[i.memory_id] || []), i.insight];
        return acc;
      }, {} as Record<string, string[]>);

      setMemories(memoriesData || []);
      setInsights(groupedInsights || {});
      setLoading(false);
    }

    fetchData();
  }, []);

  const generateMockInsight = async (memoryId: string, content: string) => {
    const generated = `🧠 Insight: "${content.slice(0, 40)}..." reflects inner pattern awareness.`;

    const { error } = await supabase
      .from("insights")
      .insert([{ memory_id: memoryId, insight: generated }]);

    if (!error) {
      setInsights((prev) => ({
        ...prev,
        [memoryId]: [...(prev[memoryId] || []), generated],
      }));
    }
  };

  return (
    <AdminRoute>
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-6">
        <h1 className="text-2xl font-bold text-center">🧠 Memory Insights Admin</h1>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        {loading ? (
          <p>Loading...</p>
        ) : (
          memories
            .filter((m) =>
              m.content.toLowerCase().includes(search.toLowerCase())
            )
            .map((m) => (
              <div key={m.id} className="border p-4 rounded bg-white shadow-sm space-y-2">
                <div className="text-xs text-gray-500">
                  {new Date(m.created_at).toLocaleString()} • 👤 {m.user_id || "anonymous"}
                </div>
                <p className="text-sm">{m.content}</p>

                {m.metadata && (
                  <pre className="bg-gray-50 text-xs p-2 rounded">
                    {JSON.stringify(m.metadata, null, 2)}
                  </pre>
                )}

                <button
                  className="text-indigo-600 text-sm hover:underline"
                  onClick={() => generateMockInsight(m.id, m.content)}
                >
                  ➕ Generate Insight
                </button>

                {insights[m.id]?.length > 0 && (
                  <ul className="text-sm text-green-700 list-disc pl-4">
                    {insights[m.id].map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))
        )}
      </div>
    </AdminRoute>
  );
}
