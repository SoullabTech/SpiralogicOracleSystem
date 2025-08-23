import TunePanel from "@/components/whispers/TunePanel";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Server-side fetch of user's whispers
async function fetchWhispersServer() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user) {
    redirect("/login");
  }

  // Fetch last 14 days of whispers
  const windowStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from("micro_memories")
    .select("*")
    .eq("user_id", user.user.id)
    .gte("created_at", windowStart)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Failed to fetch whispers:", error);
    return [];
  }

  // Transform to client format
  return (data ?? []).map(m => ({
    id: m.id,
    content: m.content,
    tags: m.nd_tags ?? [],
    element: m.element || null,
    energy: m.energy,
    created_at: m.created_at,
    recall_at: m.recall_at,
  }));
}

export default async function Page() {
  const whispers = await fetchWhispersServer();

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-ink-100">Contextual Whispers — Tuning Lab</h1>
        <p className="opacity-75 text-sm text-ink-300">
          Adjust ranking weights and recap context to see how Whispers reorder in real time. Settings persist locally.
        </p>
      </header>
      <TunePanel initialWhispers={whispers} />
    </main>
  );
}