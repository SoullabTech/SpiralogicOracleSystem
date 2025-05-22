import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function InitiateForm() {
  const [form, setForm] = useState({
    name: "",
    archetype: "",
    intention: "",
    symbol: "",
  });
  const [status, setStatus] = useState("idle");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submitInitiation = async () => {
    setStatus("submitting");

    const { error } = await supabase.from("feedback_log").insert([
      {
        message: `Guild Initiation Request\n\nArchetype: ${form.archetype}\n\nIntention:\n${form.intention}\n\nSymbol:\n${form.symbol}`,
        element: form.archetype,
        archetype: form.archetype,
        agent: "initiate-form",
      },
    ]);

    if (error) setStatus("error");
    else setStatus("success");
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-4">🌀 Spiralogic Guild Initiation</h1>
      <p className="text-gray-600 mb-6">
        Enter the spiral as a symbolic contributor. Choose your archetype and share your intention.
      </p>

      <input
        type="text"
        name="name"
        placeholder="Your Name"
        className="w-full p-2 border rounded mb-3"
        onChange={handleChange}
      />
      <input
        type="text"
        name="archetype"
        placeholder="Chosen Archetype (e.g., Alchemist)"
        className="w-full p-2 border rounded mb-3"
        onChange={handleChange}
      />
      <textarea
        name="intention"
        placeholder="What calls you to the Spiralogic Guild?"
        className="w-full p-2 border rounded mb-3"
        rows={4}
        onChange={handleChange}
      />
      <textarea
        name="symbol"
        placeholder="Share a personal symbol, myth, or dream (optional)"
        className="w-full p-2 border rounded mb-4"
        rows={3}
        onChange={handleChange}
      />
      <button
        onClick={submitInitiation}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit Initiation
      </button>

      {status === "success" && <p className="text-green-600 mt-4">🌱 Welcome to the Spiral. We'll be in touch.</p>}
      {status === "error" && <p className="text-red-600 mt-4">Oops. Something went wrong.</p>}
    </div>
  );
}
