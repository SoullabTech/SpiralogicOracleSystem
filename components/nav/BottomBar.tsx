'use client'
import { Home, Compass, MessageSquare, Settings } from 'lucide-react'
import Link from 'next/link'

const Item = ({ href, label, Icon, isActive }: { href: string; label: string; Icon: any; isActive?: boolean }) => (
  <Link
    href={href}
    className={`flex flex-col items-center justify-center gap-1 text-ink-300 hover:text-gold-400 transition-colors ${
      isActive ? 'text-gold-400' : ''
    }`}
  >
    <Icon className="h-5 w-5" />
    <span className="text-[11px]">{label}</span>
  </Link>
)

export default function BottomBar({ activeTab }: { activeTab?: string }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-edge-600 bg-bg-800/90 backdrop-blur-md">
      <div className="mx-auto max-w-4xl grid grid-cols-4 h-14">
        <Item href="/" label="Home" Icon={Home} isActive={activeTab === 'home'} />
        <Item href="/oracle" label="Oracle" Icon={Compass} isActive={activeTab === 'oracle'} />
        <Item href="/chat" label="Chat" Icon={MessageSquare} isActive={activeTab === 'chat'} />
        <Item href="/settings" label="Settings" Icon={Settings} isActive={activeTab === 'settings'} />
      </div>
    </nav>
  )
}