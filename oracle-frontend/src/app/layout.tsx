import type { Metadata } from 'next';
import { Inter, Cinzel, Cormorant_Garamond } from 'next/font/google';
import '../../index.css';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic';

// Font loading with fallbacks
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'sans-serif'],
});

const cinzel = Cinzel({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel',
  fallback: ['Georgia', 'serif'],
});

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant',
  fallback: ['Georgia', 'serif'],
});

// Dynamic import for route transitions (client-side only)
const RouteTransition = dynamic(
  () => import('@/components/sacred/RouteTransition'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Oracle System - Spiralogic',
  description: 'Your spiritual guidance platform with AI-powered oracle readings, journaling, and insights.',
  keywords: ['oracle', 'spiritual', 'guidance', 'tarot', 'astrology', 'meditation', 'consciousness'],
  openGraph: {
    title: 'Spiralogic Oracle System',
    description: 'Connect with archetypal wisdom through AI-powered spiritual guidance',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&display=swap"
          as="style"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap"
          as="style"
        />
      </head>
      <body 
        className={`
          ${inter.variable} ${cinzel.variable} ${cormorant.variable} 
          font-sans antialiased min-h-screen
        `}
      >
        <SessionContextProvider supabaseClient={supabase}>
          <RouteTransition>
            {children}
          </RouteTransition>
        </SessionContextProvider>
      </body>
    </html>
  );
}
