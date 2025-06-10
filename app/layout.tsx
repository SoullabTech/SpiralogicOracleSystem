import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AÍÑ Oracle System - Spiralogic',
  description: 'Your sacred mirror for evolutionary guidance, memory, and soulful clarity.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}