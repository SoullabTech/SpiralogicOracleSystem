export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-purple-900 text-yellow-400 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto shadow-lg">
            <span className="text-4xl">🔐</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-6">Authentication</h1>
        <p className="text-lg opacity-80 mb-8">
          Sacred access portal is being prepared.
        </p>

        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
          <p className="opacity-90 mb-6">
            User authentication and profile management will be available in the next update.
          </p>

          <div className="space-y-2 text-sm">
            <div>✨ Sacred Profile Creation</div>
            <div>🔮 Oracle Memory Sync</div>
            <div>🌟 Personal Journey Tracking</div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <a
            href="/dashboard"
            className="block bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition"
          >
            🌌 Enter Dashboard
          </a>

          <a
            href="/"
            className="block bg-white/10 text-yellow-400 px-6 py-3 rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition"
          >
            ← Back to Home
          </a>
        </div>

        <p className="text-xs mt-8 opacity-40">AÍÑ ∙ Spiralogic ∙ Soullab</p>
      </div>
    </div>
  );
}