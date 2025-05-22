// 📁 pages/journal/index.tsx

import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

const ELEMENTS = ["All", "Fire", "Water", "Earth", "Air", "Aether"];

export default function UserJournalPage() {
  const session = useSession();
  const [entries, setEntries] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (!session?.user) return;

    const fetchEntries = async () => {
      let query = supabase
        .from("journal_entries")
        .select("id, content, element, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (filter !== "All") {
        query = query.eq("element", filter);
      }

      const { data } = await query;
      if (data) setEntries(data);
    };

    fetchEntries();
  }, [filter, session]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
      <h1 className="text-2xl font-bold text-center">🪶 Your Journal</h1>

      <div className="flex justify-center gap-2 flex-wrap">
        {ELEMENTS.map((el) => (
          <button
            key={el}
            onClick={() => setFilter(el)}
            className={`px-3 py-1 rounded ${
              filter === el
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {el}
          </button>
        ))}
      </div>

      <div className="space-y-4 mt-6">
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center">You haven’t written any entries yet.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-white p-4 rounded shadow-sm border text-sm">
              <div className="text-gray-400 mb-1">
                {entry.element} • {new Date(entry.created_at).toLocaleString()}
              </div>
              <p className="text-gray-800">{entry.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
