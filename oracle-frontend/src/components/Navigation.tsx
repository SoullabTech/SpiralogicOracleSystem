// src/components/Navigation.tsx
import Link from "next/link"; // ✅ Correct for Next.js

export default function Navigation() {
  return (
    <nav role="navigation" aria-label="Main navigation" className="bg-white shadow">
      <ul className="flex space-x-4 p-4 text-sm font-medium text-gray-700">
        <li>
          <Link to="/" className="hover:text-indigo-600 transition focus:outline-none focus:ring focus:ring-indigo-300">
            Home
          </Link>
        </li>
        <li>
          <Link to="/spiral-checkin" className="hover:text-indigo-600 transition focus:outline-none focus:ring focus:ring-indigo-300">
            Spiral Check-In
          </Link>
        </li>
        <li>
          <Link to="/wild-portal" className="hover:text-indigo-600 transition focus:outline-none focus:ring focus:ring-indigo-300">
            Wild Petal Portal
          </Link>
        </li>
        <li>
          <Link to="/admin/journal" className="hover:text-indigo-600 transition focus:outline-none focus:ring focus:ring-indigo-300">
            Journal Review
          </Link>
        </li>
      </ul>
    </nav>
  );
}
