'use client';

export default function MaiaPage() {
  // Redirect to oracle-conversation since that is the main interface
  if (typeof window !== 'undefined') {
    window.location.href = '/oracle-conversation';
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-[#D4B896]">Redirecting to Oracle Conversation...</div>
    </div>
  );
}