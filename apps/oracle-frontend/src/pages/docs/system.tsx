export default function SystemDocs() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <h1 className="text-3xl font-bold">🧬 Spiralogic System Design</h1>
      <p className="text-gray-700">
        Spiralogic is a modular, symbolic AI framework guided by elemental archetypes. It empowers
        users to navigate self-awareness, transformation, and embodiment through a layered spiral of phases and reflections.
      </p>

      <section>
        <h2 className="text-xl font-semibold">🔁 Modular Agent System</h2>
        <p className="text-gray-700 mt-2">
          At the heart of the system is the <strong>MainOracleAgent</strong>, a router that evaluates user input and
          selects the appropriate elemental agent:
        </p>
        <ul className="list-disc ml-6 text-gray-800 mt-2">
          <li>🔥 <strong>FireAgent</strong> – Vision, drive, purpose</li>
          <li>🌍 <strong>EarthAgent</strong> – Grounding, structure, resourcing</li>
          <li>🌬 <strong>AirAgent</strong> – Reflection, strategy, pattern clarity</li>
          <li>💧 <strong>WaterAgent</strong> – Emotional depth, shadow work</li>
          <li>🌌 <strong>AetherAgent</strong> – Synthesis, archetypal meta-integration</li>
        </ul>
        <p className="text-gray-600 mt-2">
          The agent receives input, applies its tone and archetype lens, and returns an insight, ritual, or symbolic map.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">🌿 Spiral Growth Engine</h2>
        <p className="text-gray-700 mt-2">
          The user journey moves through 5 core phases of the Spiralogic cycle:
        </p>
        <ol className="list-decimal ml-6 text-gray-800 mt-2">
          <li><strong>Initiation</strong> (Fire) – Inspiration, identity awakening</li>
          <li><strong>Grounding</strong> (Earth) – Stabilizing, embodiment</li>
          <li><strong>Collaboration</strong> (Air) – Communication, connection</li>
          <li><strong>Transformation</strong> (Water) – Shadow integration, healing</li>
          <li><strong>Completion</strong> (Aether) – Synthesis, insight, transcendence</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">📊 CrystalMapEngine</h2>
        <p className="text-gray-700 mt-2">
          A backend analytics module evaluates your journal + oracle history to:
        </p>
        <ul className="list-disc ml-6 text-gray-800">
          <li>Track elemental activity over time</li>
          <li>Identify dominant or underused energies</li>
          <li>Recommend next spiral phase or archetype</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">🧾 Memory & Journal Flow</h2>
        <p className="text-gray-700 mt-2">
          All oracle exchanges are optionally stored as collective memory, using:
        </p>
        <ul className="list-disc ml-6 text-gray-800">
          <li><strong>Supabase</strong> for storage and access control</li>
          <li>Voice tone, phase, and symbol tagging</li>
          <li>Reflections auto-suggested from previous sessions</li>
        </ul>
      </section>
    </div>
  );
}
