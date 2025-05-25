import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function GuildProposal() {
  const [form, setForm] = useState({
    title: "",
    phase: "",
    intention: "",
    ritual: "",
  });
  const [status, setStatus] = useState("idle");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submitProposal = async () => {
    setStatus("submitting");

    const { error } = await supabase.from("feedback_log").insert([
      {
        message: `DAO Proposal: ${form.title}\n\nSpiral Phase: ${form.phase}\n\nIntention:\n${form.intention}\n\nSuggested Ritual:\n${form.ritual}`,
        element: form.phase,
        archetype: "Oracle Steward",
        agent: "proposal-form",
      },
    ]);

    setStatus(error ? "error" : "success");
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-4">🌕 Spiralogic Proposal Ritual</h1>
      <p className="text-gray-600 mb-6">
        Proposals are invitations to evolve. Enter clearly, with archetypal coherence and symbolic integrity.
      </p>

      <input
        type="text"
        name="title"
        placeholder="Proposal Title"
        className="w-full p-2 border rounded mb-3"
        onChange={handleChange}
      />
      <input
        type="text"
        name="phase"
        placeholder="Phase (e.g., Transformation)"
        className="w-full p-2 border rounded mb-3"
        onChange={handleChange}
      />
      <textarea
        name="intention"
        placeholder="What does this proposal seek to transform, reveal, or build?"
        className="w-full p-2 border rounded mb-3"
        rows={4}
        onChange={handleChange}
      />
      <textarea
        name="ritual"
        placeholder="Is there a symbolic ritual, phase, or sequence tied to this proposal?"
        className="w-full p-2 border rounded mb-4"
        rows={3}
        onChange={handleChange}
      />

      <button
        onClick={submitProposal}
        className="bg-purple-700 text-white px-4 py-2 rounded"
      >
        Submit Proposal
      </button>

      {status === "success" && <p className="text-green-600 mt-4">🌱 Proposal received by the Spiral. Thank you.</p>}
      {status === "error" && <p className="text-red-600 mt-4">Something went wrong. Please try again.</p>}
    </div>
  );
}
