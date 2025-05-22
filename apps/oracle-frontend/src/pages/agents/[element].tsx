import { elementalAgents } from "@/lib/agents";
import { useRouter } from "next/router";

export default function ElementPage() {
  const { query } = useRouter();
  const agent = elementalAgents[query.element as string];

  return (
    <div>
      <h1>{agent?.name}</h1>
      <p>{agent?.archetype}</p>
      <p>{agent?.getPrompt()}</p>
      {/* Add journaling textarea here */}
    </div>
  );
}
