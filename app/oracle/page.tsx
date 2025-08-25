export const runtime = "nodejs"; // ensure Node runtime on Vercel

export default function OraclePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🔮 Maya Oracle Testing</h1>
      <p className="mb-8 text-lg text-gray-300">
        This page lets you test Maya's voice via Sesame TTS.
      </p>
      <form method="POST" action="/api/voice/sesame">
        <input type="hidden" name="text" value="Hello from Maya" />
        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
        >
          ▶️ Test Maya Voice
        </button>
      </form>
    </main>
  );
}