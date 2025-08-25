"use client";

import { useState } from "react";

export default function OraclePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  const testMayaVoice = async () => {
    setIsLoading(true);
    setStatus("Generating Maya's voice...");

    try {
      const response = await fetch("/api/voice/sesame", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "Hello from Maya" }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        setStatus("Playing Maya's voice...");
        await audio.play();
        setStatus("Maya spoke successfully! ✨");
      } else {
        setStatus(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setStatus(`Failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🔮 Maya Oracle Testing</h1>
      <p className="mb-8 text-lg text-gray-300">
        This page lets you test Maya's voice via Sesame TTS.
      </p>
      
      <button
        onClick={testMayaVoice}
        disabled={isLoading}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {isLoading ? "🎵 Generating..." : "▶️ Test Maya Voice"}
      </button>

      {status && (
        <p className="text-center text-sm text-gray-300 max-w-md">
          {status}
        </p>
      )}
      
      <footer className="text-xs text-center mt-8 opacity-60">
        BUILD MARKER: maya-voice-live
      </footer>
    </main>
  );
}