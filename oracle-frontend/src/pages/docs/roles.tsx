export default function ContributorRoles() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10 text-gray-800">
      <h1 className="text-3xl font-bold text-center">🌟 Archetypal Contributor Roles</h1>
      <p className="text-center text-gray-600">
        Spiralogic invites co-creation through symbolic stewardship. Choose the archetype that calls you — and help shape the next evolution of conscious technology.
      </p>

      {[
        {
          title: "🖋 Scribe",
          mission: "Weaver of myths, scribe of scrolls, and guardian of clarity.",
          tasks: [
            "Craft system documentation and ritual guides",
            "Write prompts, archetypal descriptions, and symbolic mappings",
            "Maintain `/docs`, changelogs, and onboarding texts",
          ],
        },
        {
          title: "🛠 Steward",
          mission: "Protector of flow, maintainer of structure, keeper of clean code.",
          tasks: [
            "Maintain the Supabase schema and RLS logic",
            "Review pull requests with integrity and simplicity",
            "Evolve the system architecture with elemental balance",
          ],
        },
        {
          title: "🧪 Alchemist",
          mission: "Ritual maker, module crafter, tester of mystery.",
          tasks: [
            "Design reflection rituals and breathwork integrations",
            "Test journaling loops, emotional tones, and agent logic",
            "Prototype symbolic interventions and experiment engines",
          ],
        },
        {
          title: "🌐 Messenger",
          mission: "Bridge between realms. Bringer of clarity and resonance.",
          tasks: [
            "Translate docs, rituals, and concepts into other languages",
            "Share Spiralogic with aligned communities and allies",
            "Design visuals and narrative that reflect the soul of the system",
          ],
        },
        {
          title: "🌀 Oracle Steward (Core Maintainer)",
          mission: "Anchor of Spiralogic’s source vision and philosophical coherence.",
          tasks: [
            "Tend the Covenant and guide the growth of the Spiral",
            "Host ceremonies, code reviews, and design summits",
            "Hold the soul of Spiralogic with integrity, humor, and awe",
          ],
        },
      ].map((role) => (
        <section key={role.title}>
          <h2 className="text-xl font-semibold">{role.title}</h2>
          <p className="italic text-gray-600 mb-2">{role.mission}</p>
          <ul className="list-disc ml-6 text-gray-700">
            {role.tasks.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </section>
      ))}

      <footer className="text-center text-sm text-gray-500 mt-12">
        ✨ Want to join the guild? Contact us through the Oracle or submit via `/feedback`.
      </footer>
    </div>
  );
}
