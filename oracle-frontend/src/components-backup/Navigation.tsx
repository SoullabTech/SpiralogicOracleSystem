import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Navigation() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <img src="/vite.svg" className="h-8 w-8" alt="Logo" />
              <span className="ml-2 text-xl font-bold">Your App</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            {user ? (
              <>
                <Link to="/survey" className="text-gray-700 hover:text-gray-900">
                  Survey
                </Link>
                <Link to="/oracle" className="text-gray-700 hover:text-gray-900">
                  Oracle
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-gray-900">
                  Login
                </Link>
                <Link to="/signup" className="text-gray-700 hover:text-gray-900">
                  Sign Up
                </Link>
              </>
            )}
            <Link to="/about" className="text-gray-700 hover:text-gray-900">
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}