export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-4xl mb-4">Maya Oracle System</h1>
        <p className="text-gray-300 text-lg">Initializing...</p>
        <div className="mt-8">
          <a
            href="/oracle-conversation"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go to Maya Chat
          </a>
        </div>
      </div>
    </div>
  );
}