// /pages/index.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">🌟 Welcome to the SoulOS Portal</h1>
      <p className="mb-6">Enter your realm of myth, memory, and transformation.</p>

      <div className="space-y-3">
        <Link href="/personal-oracle" className="block bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">
          Meet Your Oracle
        </Link>
        <Link href="/dream-journal" className="block bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
          Dream Journal
        </Link>
        <Link href="/memory-log" className="block bg-amber-500 text-white py-2 px-4 rounded hover:bg-amber-600">
          Oracle Memory Log
        </Link>
      </div>
    </main>
  );
}
