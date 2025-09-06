import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorOverlay } from "@/components/system/ErrorOverlay";
import { AudioUnlockBanner } from "@/components/system/AudioUnlockBanner";
import { ToastProvider } from "@/components/system/ToastProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spiralogic Oracle System - Integration-Centered Development",
  description:
    "Supporting authentic human development through elemental wisdom and community grounding.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-black text-neutral-900 dark:text-white transition-colors duration-200`}>
        <ThemeProvider>
          <ToastProvider>
            {/* Global Header with Theme Toggle */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-amber-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <h1 className="text-lg font-semibold tracking-wide text-neutral-800 dark:text-neutral-200">
                  Soullab
                </h1>
              </Link>
              
              <nav className="flex items-center gap-6">
                <Link 
                  href="/" 
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  Mirror
                </Link>
                <Link 
                  href="/dashboard" 
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  Analytics
                </Link>
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />
                <ThemeToggle />
              </nav>
            </header>
            
            {/* Main Content */}
            <main className="min-h-[calc(100vh-73px)]">
              {children}
            </main>
            
            <AudioUnlockBanner />
            <ErrorOverlay />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
