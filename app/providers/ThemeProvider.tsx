'use client'
import { useEffect, useState } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light'|'dark'>(() =>
    (typeof window !== 'undefined' && (localStorage.getItem('theme') as 'light'|'dark')) || 'dark'
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark')
    root.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light')
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <>
      <button
        className="fixed right-3 bottom-16 z-50 rounded-md border border-edge-700 bg-bg-800 px-3 py-2 text-ink-300 hover:text-gold-400 shadow-soft transition-colors duration-200"
        onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        {theme === 'dark' ? '☀️' : '🌙'} Toggle {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
      {children}
    </>
  )
}