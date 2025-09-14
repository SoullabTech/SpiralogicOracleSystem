'use client';

export default function OracleConversationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-4xl mb-4">Maya Chat Interface</h1>
        <p className="text-gray-300 text-lg">Voice and chat functionality will be restored shortly.</p>
        <div className="mt-8 p-6 bg-slate-800 rounded-lg max-w-md">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Type your message to Maya..."
              className="w-full p-3 bg-slate-700 text-white rounded border-none"
            />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
            Send to Maya
          </button>
        </div>
      </div>
    </div>
  );
}