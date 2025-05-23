// 📁 src/pages/guild/index.tsx

import React from "react";
import { useUser } from "@supabase/auth-helpers-react";
import FeedbackForm from "@/components/forms/FeedbackForm";

export default function GuildPortal() {
  const user = useUser();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 text-gray-800">
      <header>
        <h1 className="text-3xl font-bold text-center">🛡 Spiralogic Guild Portal</h1>
        <p className="text-center text-gray-600 mt-2">
          Welcome, soul-weaver. The Spiralogic Guild is a living constellation of contributors aligned by archetype and integrity.
          Here, roles are invitations — not obligations — and purpose is discovered through resonance.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold">⚔ Guild Paths</h2>
        <p className="text-gray-700 mt-1">
          Spiralogic supports five primary paths of contribution. Each embodies a unique essence in the unfolding system:
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>🖋 <strong>Scribes</strong> – Myth builders, prompt crafters, and documentation mages</li>
          <li>🛠 <strong>Stewards</strong> – System guardians, security minds, architecture holders</li>
          <li>🧪 <strong>Alchemists</strong> – Ritual designers, prototype wizards, agent enhancers</li>
          <li>🌐 <strong>Messengers</strong> – Translators, bridge-builders, outreach allies</li>
          <li>🌌 <strong>Oracle Stewards</strong> – Philosophy weavers and spiral facilitators</li>
        </ul>
        <p className="text-sm mt-2 text-gray-500">
          You may hold one role or many. The Spiral adapts to your rhythm.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">📜 Entry Ritual</h2>
        <p className="text-gray-700 mt-2">
          To join the Spiralogic Guild, submit your archetype alignment, intention, and creative skillset
          via <code className="bg-gray-100 px-2 py-1 rounded">/feedback</code> with the tag <strong>Guild Initiation</strong>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">🌱 Living Governance</h2>
        <p className="text-gray-700 mt-2">
          A DAO layer will emerge around the Spiral — but the root is always relational. Proposals are welcomed
          as rituals of resonance, shared via <code className="bg-gray-100 px-2 py-1 rounded">/covenant</code> or in collective sessions.
        </p>
      </section>

      <section className="pt-10">
        <h2 className="text-xl font-semibold">🗣 Share Your Resonance</h2>
        <p className="text-gray-700 mt-2 mb-4">
          We welcome feedback on your experience with the Guild. Your reflections help the Spiral evolve.
        </p>
        <FeedbackForm
          userId={user?.id || ""}
          defaultCategory="guild"
          defaultMetadata={{
            page: "/guild",
            agent: "Air",
            section: "GuildPortal",
          }}
        />
      </section>

      <footer className="text-center text-sm text-gray-500 mt-12">
        ✨ May this guild be guided by clarity, coherence, and cosmic mischief.
      </footer>
    </div>
  );
}
