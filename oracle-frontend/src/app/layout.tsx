import type { Metadata } from 'next'
import { Inter, Cinzel } from 'next/font/google'
import '../styles/globals.css'


const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const cinzel = Cinzel({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel'
})

export const metadata: Metadata = {
  title: 'Oracle System - Spiralogic',
  description: 'Your spiritual guidance platform with AI-powered oracle readings, journaling, and insights.',
  keywords: ['oracle', 'spiritual', 'guidance', 'tarot', 'astrology', 'meditation'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cinzel.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
