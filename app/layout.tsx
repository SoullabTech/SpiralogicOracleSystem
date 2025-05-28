import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SoulLab - Sacred Technology for Consciousness Evolution',
  description: 'Experience the fusion of ancient wisdom and modern technology in your journey of self-discovery and transformation.',
  keywords: 'consciousness, transformation, sacred technology, elemental alchemy, spiralogic',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  openGraph: {
    title: 'SoulLab - Sacred Technology for Consciousness Evolution',
    description: 'Experience the fusion of ancient wisdom and modern technology',
    images: ['/sacred-holoflower.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-cosmic-deep-space text-white min-h-screen`}>
        <Providers>
          <div className="relative">
            {/* Sacred background effects */}
            <div className="fixed inset-0 bg-sacred-gradient opacity-5 pointer-events-none" />
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-sacred-violet/20 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sacred-gold/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
            </div>
            
            {/* Main content */}
            <main className="relative z-10">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}