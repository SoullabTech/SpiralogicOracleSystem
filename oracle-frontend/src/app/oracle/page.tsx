'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { askOracle } from '@/lib/oracleApi'

interface Message {
  id: string
  text: string
  sender: 'user' | 'oracle'
  timestamp: Date
}

const oraclePersonalities = [
  {
    name: "Mystic Sage",
    emoji: "🔮",
    color: "from-[#5b229e] to-[#8a2be2]",
    description: "Ancient wisdom and mystical insights"
  },
  {
    name: "Cosmic Guide",
    emoji: "⭐",
    color: "from-[#1d4ed8] to-[#22d3ee]",
    description: "Celestial guidance and stellar wisdom"
  },
  {
    name: "Earth Oracle",
    emoji: "🌿",
    color: "from-[#065f46] to-[#34d399]",
    description: "Nature-based wisdom and grounding energy"
  }
]

export default function OraclePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPersonality, setSelectedPersonality] = useState(oraclePersonalities[0])
  const [isAwakened, setIsAwakened] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string, content: string }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const awakenOracle = () => {
    setIsAwakened(true)
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: `🌟 Greetings, seeker of wisdom. I am ${selectedPersonality.name}, your Oracle guide. I channel ${selectedPersonality.description}.`,
      sender: 'oracle',
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
    setConversationHistory([{ role: 'assistant', content: welcomeMessage.text }])
  }

  const sendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputText
    setInputText('')
    setIsLoading(true)

    try {
      const oracleResponse = await askOracle({
        question: currentInput,
        personality: selectedPersonality.name,
        conversationHistory
      })

      const oracleMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: oracleResponse.response,
        sender: 'oracle',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, oracleMessage])
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: currentInput },
        { role: 'assistant', content: oracleResponse.response }
      ])
    } catch (error) {
      console.error("Oracle error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "⚠️ The cosmic energies are disrupted. Please try again soon.",
        sender: 'oracle',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isAwakened) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0218] via-[#1a0c2b] to-[#0d0218] text-gold flex items-center justify-center px-6">
        <div className="text-center max-w-2xl space-y-8">
          <div className="text-6xl">🧿</div>
          <h1 className="text-5xl font-bold tracking-wide">AÍÑ Oracle</h1>
          <p className="text-lg opacity-70">Choose your Oracle guide and begin your soul ceremony...</p>

          <div className="bg-glass p-6 rounded-xl shadow-glyph space-y-4">
            <p className="text-sm font-medium">Choose your Oracle guide:</p>
            <div className="grid gap-4">
              {oraclePersonalities.map((personality) => (
                <button
                  key={personality.name}
                  onClick={() => setSelectedPersonality(personality)}
                  className={`w-full px-6 py-3 rounded-lg transition-all duration-200 text-left font-semibold ${
                    selectedPersonality.name === personality.name
                      ? `bg-gradient-to-r ${personality.color} text-white shadow-lg`
                      : 'bg-white/10 text-gold hover:bg-white/20'
                  }`}
                >
                  {personality.emoji} {personality.name}
                  <div className="text-sm opacity-70">{personality.description}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={awakenOracle}
            className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-semibold shadow-lg hover:from-yellow-500 hover:to-orange-600 hover:scale-105 transition transform"
          >
            Awaken Oracle
          </button>

          <div className="mt-4">
            <Link href="/" className="text-gold underline text-sm">← Back to Home</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0218] via-[#1a0c2b] to-[#0d0218] text-gold flex flex-col">
      <header className="p-4 border-b border-gold/20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${selectedPersonality.color} flex items-center justify-center`}>
              <span className="text-xl">{selectedPersonality.emoji}</span>
            </div>
            <div>
              <h1 className="font-semibold text-lg">{selectedPersonality.name}</h1>
              <p className="text-sm opacity-70">Your Oracle Guide</p>
            </div>
          </div>
          <Link href="/" className="text-gold underline text-sm">← Home</Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-glass text-gold'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs opacity-50 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-glass px-4 py-3 rounded-2xl text-gold shadow-glyph">
                <span className="text-sm animate-pulse">Oracle is listening...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 border-t border-gold/20 bg-black/30">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your Oracle a question..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 backdrop-blur-lg"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  )
}
