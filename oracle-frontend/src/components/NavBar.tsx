import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function NavBar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/docs", label: "Docs" },
    { to: "/onboarding", label: "Onboarding" },
    { to: "/oracle", label: "Oracle" },
    { to: "/feedback", label: "Feedback" },
    { to: "/guild", label: "Guild" },
    { to: "/covenant", label: "Covenant" },
  ];

  const isActive = (path: string) => router.pathname.startsWith(path);

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold text-blue-700 tracking-wide">
          Spiralogic
        </div>

        <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
          {links.map((link) => (
            <Link key={link.to} href={link.to}>
              <a
                className={
                  isActive(link.to)
                    ? "text-blue-700 underline"
                    : "hover:text-blue-600"
                }
              >
                {link.label}
              </a>
            </Link>
          ))}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 text-sm font-medium text-gray-700">
          {links.map((link) => (
            <Link key={link.to} href={link.to}>
              <a
                className={
                  isActive(link.to)
                    ? "block text-blue-700 underline"
                    : "block hover:text-blue-600"
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
