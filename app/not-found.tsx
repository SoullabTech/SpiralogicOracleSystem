import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-blue-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-4">
          <Link 
            href="/"
            className="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Go Home
          </Link>
          <Link 
            href="/test-stub"
            className="block bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Test Stub Mode
          </Link>
        </div>
      </div>
    </div>
  )
}