import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Journal Timeline', href: '/journal-timeline' },
  { label: 'Oracle', href: '/select-oracle' },
  { label: 'Chat', href: '/chat' },
];

export default function Shell() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-yellow-50">
      <aside className="bg-white shadow p-4 flex gap-4 fixed w-full top-0 z-10">
        {navItems.map(({ label, href }) => (
          <Link
            key={href}
            to={href}
            className={cn(
              'px-4 py-2 rounded-md font-medium transition',
              location.pathname.startsWith(href)
                ? 'bg-purple-600 text-white'
                : 'text-purple-700 hover:bg-purple-100'
            )}
          >
            {label}
          </Link>
        ))}
      </aside>

      <main className="pt-20 px-6 pb-10">
        <Outlet />
      </main>
    </div>
  );
}
