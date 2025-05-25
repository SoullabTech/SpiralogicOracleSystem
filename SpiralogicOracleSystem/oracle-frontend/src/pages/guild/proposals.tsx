import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Proposal {
  id: string;
  created_at: string;
  message: string;
}

export default function ProposalList() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      const { data, error } = await supabase
        .from("feedback_log")
        .select("id, created_at, message")
        .ilike("message", "%DAO Proposal%")
        .order("created_at", { ascending: false });

      if (!error) setProposals(data || []);
      setLoading(false);
    };

    fetchProposals();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-4">📜 DAO Proposal Archive</h1>

      {loading ? (
        <p className="text-gray-500">Loading proposals...</p>
      ) : proposals.length === 0 ? (
        <p className="text-gray-500">No proposals submitted yet.</p>
      ) : (
        <ul className="space-y-6">
          {proposals.map((p) => (
            <li key={p.id} className="border-l-4 border-purple-600 pl-4">
              <p className="text-sm text-gray-500 mb-1">
                {new Date(p.created_at).toLocaleDateString()}
              </p>
              <pre className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-3 rounded">
                {p.message}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
