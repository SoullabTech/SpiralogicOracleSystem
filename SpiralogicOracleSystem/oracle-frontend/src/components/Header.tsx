// src/components/Header.tsx
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const { pathname } = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Spiral Path', path: '/spiralogic-path' },
    { name: 'Oracle', path: '/oracle' },
    { name: 'Memories', path: '/memories' },
    // { name: 'About', path: '/about' }, // Uncomment if About page is restored
  ];

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-white bg-opacity-80 shadow-md backdrop-blur-md z-20">
      <h1 className="text-xl font-bold text-indigo-700">🌸 Spiralogic</h1>
      <nav role="navigation" className="flex space-x-4">
        {navItems.map(({ name, path }) => (
          <Link
            key={path}
            to={path}
            className={`px-3 py-2 rounded transition ${
              pathname === path
                ? 'bg-indigo-100 text-indigo-700 font-semibold'
                : 'text-indigo-500 hover:text-indigo-700'
            }`}
          >
            {name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
