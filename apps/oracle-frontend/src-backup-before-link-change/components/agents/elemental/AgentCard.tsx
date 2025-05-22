// 📁 src/components/agents/elemental/AgentCard.tsx

interface Agent {
  name: string;
  archetype: string;
  element: string;
  color: string;
  description: string;
  qualities: string[];
  prompts: string[];
  role: string;
}

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div
      className="p-6 rounded-2xl shadow-md text-white space-y-4"
      style={{ backgroundColor: agent.color }}
    >
      <h2 className="text-2xl font-bold">{agent.name} Agent</h2>
      <p className="italic">{agent.role}</p>
      <p className="text-sm">{agent.description}</p>

      <div>
        <h3 className="font-semibold mt-2">Qualities:</h3>
        <ul className="list-disc ml-5">
          {agent.qualities.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mt-2">Reflection Prompts:</h3>
        <ul className="list-decimal ml-5">
          {agent.prompts.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
