/**
 * Admin Layout with Basic Protection
 */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Simple password protection for beta
    const password = prompt('Admin access required:');
    if (password === 'soullab2025' || password === 'admin123') {
      setIsAuthorized(true);
    } else {
      alert('Access denied');
      router.push('/');
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Admin Access Required</h1>
          <p className="text-gray-600">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Soullab Admin</h1>
          <button 
            onClick={() => router.push('/')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to App
          </button>
        </div>
      </nav>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}