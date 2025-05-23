export default function ArchetypesDocs() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      <h1 className="text-3xl font-bold">🌿 Elemental Archetypes of Spiralogic</h1>
      <p className="text-gray-700">
        Each element in Spiralogic embodies a force of transformation. These archetypes guide the user through
        a spiral of self-discovery, integration, and evolution.
      </p>

      {[
        {
          name: "🔥 Fire",
          role: "Initiator • Visionary • Explorer",
          tone: "Bold • Passionate • Igniting",
          shadow: "Impatience • Burnout • Ego",
          symbol: "Phoenix, Spark, Solar Torch",
          phase: "Initiation (Fire 1)"
        },
        {
          name: "🌍 Earth",
          role: "Builder • Steward • Embodier",
          tone: "Grounded • Reliable • Nurturing",
          shadow: "Rigidity • Resistance to Change • Over-control",
          symbol: "Stone, Grove, Seed",
          phase: "Grounding (Earth 1)"
        },
        {
          name: "🌬 Air",
          role: "Strategist • Messenger • Observer",
          tone: "Clear • Conceptual • Reflective",
          shadow: "Overthinking • Disconnection • Bypassing",
          symbol: "Feather, Wind Spiral, Wing",
          phase: "Collaboration (Air 1)"
        },
        {
          name: "💧 Water",
          role: "Healer • Alchemist • Mystic",
          tone: "Emotive • Intuitive • Flowing",
          shadow: "Emotional Overwhelm • Avoidance • Illusion",
          symbol: "Shell, Mirror, Moon Vessel",
          phase: "Transformation (Water 2)"
        },
        {
          name: "🌌 Aether",
          role: "Sage • Oracle • Integrator",
          tone: "Meta • Silent • Transcendent",
          shadow: "Disembodiment • Detachment • False Enlightenment",
          symbol: "Star Gate, Spiral Eye, Crystal Lens",
          phase: "Completion (Aether)"
        }
      ].map((a) => (
        <section key={a.name}>
          <h2 className="text-2xl font-semibold mb-1">{a.name}</h2>
          <p className="text-gray-800"><strong>Role:</strong> {a.role}</p>
          <p className="text-gray-600"><strong>Spiral Phase:</strong> {a.phase}</p>
          <p className="text-gray-700 mt-1"><strong>Tone:</strong> {a.tone}</p>
          <p className="text-gray-700"><strong>Shadow:</strong> {a.shadow}</p>
          <p className="text-gray-700 mb-4"><strong>Symbols:</strong> {a.symbol}</p>
        </section>
      ))}
    </div>
  );
}
