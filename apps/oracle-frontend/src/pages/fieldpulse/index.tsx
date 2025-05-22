// /pages/fieldpulse/index.tsx
import dynamic from "next/dynamic";
import Head from "next/head";
import { useState } from "react";

const FieldPulseDashboard = dynamic(() => import("@/components/FieldPulseDashboard"), { ssr: false });

export default function FieldPulsePage() {
  const [accessGranted, setAccessGranted] = useState(false);
  const [input, setInput] = useState("");
  const passcode = process.env.NEXT_PUBLIC_FIELDPULSE_PASSCODE || "spiral2025";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === passcode) {
      setAccessGranted(true);
    }
  };

  return (
    <>
      <Head>
        <title>Spiralogic FieldPulse</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-6">
        {accessGranted ? (
          <FieldPulseDashboard />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto mt-20 bg-black/30 p-6 rounded-lg shadow-xl border border-white/10"
          >
            <h2 className="text-2xl font-bold text-center mb-4">Enter Spiral Access Code</h2>
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 py-2 mb-4 text-black rounded"
              placeholder="Enter passcode..."
            />
            <button
              type="submit"
              className="w-full bg-aether hover:bg-aether/80 text-white py-2 rounded shadow"
            >
              Enter
            </button>
          </form>
        )}
      </main>
    </>
  );
}
