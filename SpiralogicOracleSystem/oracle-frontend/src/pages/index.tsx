// oracle-frontend/src/pages/index.tsx

import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="p-10 text-center text-gray-800">
      <h1 className="text-4xl font-bold mb-4">🌌 Spiralogic Oracle System</h1>
      <p className="mb-6 text-lg">
        Welcome to the Spiralogic Oracle. Begin your journey by choosing a path below.
      </p>

      <div className="space-y-4">
        <div>
          <Link to="/login" className="text-blue-600 hover:underline">
            🔐 Login
          </Link>
        </div>
        <div>
          <Link to="/oracle/fire" className="text-red-600 hover:underline">
            🔥 Fire Oracle
          </Link>
        </div>
        <div>
          <Link to="/oracle/water" className="text-blue-500 hover:underline">
            💧 Water Oracle
          </Link>
        </div>
        <div>
          <Link to="/guild" className="text-green-600 hover:underline">
            🛡 Guild Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
