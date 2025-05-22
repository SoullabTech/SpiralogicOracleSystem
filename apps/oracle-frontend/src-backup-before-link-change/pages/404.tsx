import { useNavigate } from 'react-router-dom'; // Vite/React Router style
// or if using Next.js, no need for useNavigate.

export default function NotFoundPage() {
  const navigate = useNavigate(); // comment this line if you're using Next.js

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-50 p-10">
      <h1 className="text-4xl font-bold mb-6 text-purple-700">Lost in the Spiral?</h1>
      <p className="text-lg text-center mb-8">It seems the page you seek is not yet woven.</p>
      <button
        onClick={() => navigate('/')} // for Vite/React Router
        className="bg-purple-600 hover:bg-purple-800 text-white font-semibold py-2 px-6 rounded-xl"
      >
        🌬️ Return to Home
      </button>
    </div>
  );
}
