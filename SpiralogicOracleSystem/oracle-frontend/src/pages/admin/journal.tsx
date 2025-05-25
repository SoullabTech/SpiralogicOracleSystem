// 📁 pages/admin/journal.tsx

import AdminRoute from "@/components/AdminRoute";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

const ELEMENTS = ["Fire", "Water", "Earth", "Air", "Aether"];

function JournalDashboardContent() {
  const [entries, setEntries] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function loadEntries() {
      let query = supabase
        .from("journal_entries")
        .select("id, user_id, element, content, created_at")
        .order("created_at", { ascending: false });

      if (filter !== "All") {
        query = query.eq("element", filter);
      }

      const { data } = await query;
      if (data) setEntries(data);
    }

    loadEntries();
  }, [filter]);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">📓 Journal Review</h1>

      <div className="flex justify-center gap-2">
        {["All", ...ELEMENTS].map((el) => (
          <button
            key={el}
            className={`px-3 py-1 rounded ${
              filter === el
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => setFilter(el)}
          >
            {el}
          </button>
        ))}
      </div>

      <div className="space-y-4 mt-6">
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center">No entries found.</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="border rounded p-4 shadow-sm bg-white text-sm"
            >
              <div className="text-gray-500 mb-1">
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

// ✅ Final export — wraps the entire page in AdminRoute (you don’t need ProtectedRoute again)
export default function JournalDashboardPage() {
  return (
    <AdminRoute>
      <JournalDashboardContent />
    </AdminRoute>
  );
}
