'use client'

import Link from 'next/link'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Welcome Back</h1>
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
            Sign In
          </button>
        </div>
        <div className="mt-8 text-center">
          <Link href="/" className="text-yellow-400 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
