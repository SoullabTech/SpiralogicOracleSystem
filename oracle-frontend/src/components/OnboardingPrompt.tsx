import { useEffect, useState } from "react";
import { getLatestPromptForElement } from "@/lib/agentPrompts";

export default function OnboardingPrompt({ element }: { element: string }) {
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (element) {
      getLatestPromptForElement(element).then(setPrompt);
    }
  }, [element]);

  if (!element) return null;

  return (
    <div className="mt-6 p-4 bg-indigo-50 rounded shadow">
      <h2 className="text-lg font-semibold text-indigo-700">✨ Your Starting Prompt</h2>
      <p className="mt-2 italic text-indigo-900">{prompt}</p>
    </div>
  );
}
