// pages/beta/apply.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function BetaApplication() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    why: '',
    commitment: '',
    agreement: false
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/beta/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/beta/success')
      } else {
        alert('Error submitting application. Please try again.')
      }
    } catch (error) {
      console.error('Application error:', error)
      alert('Error submitting application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Apply for ARIA Beta | Soullab Collective</title>
        <meta name="description" content="Apply to become an ARIA Oracle beta tester" />
      </Head>

      <div className="min-h-screen bg-black text-white py-20">
        <div className="max-w-2xl mx-auto px-6">
          <Link href="/beta" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8">
            <span>←</span>
            <span>Back to Beta Home</span>
          </Link>

          <h1 className="text-4xl font-bold mb-8">Apply to Become an Oracle Pioneer</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full p-3 bg-gray-900 rounded-lg border border-gray-800 focus:border-purple-500 focus:outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full p-3 bg-gray-900 rounded-lg border border-gray-800 focus:border-purple-500 focus:outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-2">
                Why does the Oracle call to you? (50 words max)
              </label>
              <textarea
                required
                maxLength={300}
                rows={4}
                className="w-full p-3 bg-gray-900 rounded-lg border border-gray-800 focus:border-purple-500 focus:outline-none"
                value={formData.why}
                onChange={(e) => setFormData({...formData, why: e.target.value})}
              />
              <span className="text-sm text-gray-500">
                {formData.why.length}/300 characters
              </span>
            </div>

            <div>
              <label className="block mb-2">Daily Testing Commitment</label>
              <select
                required
                className="w-full p-3 bg-gray-900 rounded-lg border border-gray-800 focus:border-purple-500 focus:outline-none"
                value={formData.commitment}
                onChange={(e) => setFormData({...formData, commitment: e.target.value})}
              >
                <option value="">Choose your commitment...</option>
                <option value="5-10">5-10 minutes daily</option>
                <option value="10-20">10-20 minutes daily</option>
                <option value="20+">20+ minutes daily</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                required
                id="agreement"
                checked={formData.agreement}
                onChange={(e) => setFormData({...formData, agreement: e.target.checked})}
                className="w-4 h-4"
              />
              <label htmlFor="agreement">
                I understand beta testing requires honest feedback and consistent participation
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
            </button>
          </form>

          <div className="mt-8 text-center text-gray-400">
            <p>✨ Applications reviewed within 24 hours</p>
            <p>🎯 Limited spots available</p>
            <p>🔮 Immediate access upon acceptance</p>
          </div>
        </div>
      </div>
    </>
  )
}