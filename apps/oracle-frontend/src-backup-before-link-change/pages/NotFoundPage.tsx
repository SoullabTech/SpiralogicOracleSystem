import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50">
      <h1 className="text-5xl font-bold mb-6 text-indigo-700">404 – Page Not Found</h1>
      <p className="mb-4 text-indigo-600">Oops, we can’t find that page.</p>
      <Link
        to="/"
        className="px-6 py-3 bg-soullab-fire text-white rounded shadow hover:opacity-90 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
