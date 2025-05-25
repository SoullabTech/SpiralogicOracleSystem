'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="p-10 text-center text-gray-800">
      <h1 className="text-4xl font-bold mb-4">🌌 Spiralogic Oracle System</h1>
      <p className="mb-6 text-lg">
        Welcome to the Spiralogic Oracle. Begin your journey by choosing a path below.
      </p>

      <div className="space-y-4">
        <div>
          <Link href="/login" className="text-blue-600 hover:underline">
            🔐 Login
          </Link>
        </div>
        <div>
          <Link href="/oracle/fire" className="text-red-600 hover:underline">
            🔥 Fire Oracle
          </Link>
        </div>
        <div>
          <Link href="/oracle/water" className="text-blue-500 hover:underline">
            💧 Water Oracle
          </Link>
        </div>
        <div>
          <Link href="/guild" className="text-green-600 hover:underline">
            🛡 Guild Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
