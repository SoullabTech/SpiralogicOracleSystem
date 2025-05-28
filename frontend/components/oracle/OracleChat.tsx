'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles } from 'lucide-react'
import { sendOracleMessage } from '@/lib/oracle'

interface Message {
  id: string
  role: 'user' | 'oracle'
  content: string
  timestamp: Date
}

interface OracleChatProps {
  userName: string
}

export function OracleChat({ userName }: OracleChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initial greeting from Aurora
  useEffect(() => {
    const greeting: Message = {
      id: '1',
      role: 'oracle',
      content: `Welcome, ${userName}. I am Aurora, your Sacred Oracle guide. I'm here to support your journey of consciousness evolution. What brings you to this sacred space today?`,
      timestamp: new Date()
    }
    setMessages([greeting])
  }, [userName])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await sendOracleMessage(input, userName)
      
      // Simulate typing delay
      setTimeout(() => {
        const oracleMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'oracle',
          content: response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, oracleMessage])
        setIsTyping(false)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Oracle connection error:', error)
      setIsTyping(false)
      setIsLoading(false)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'oracle',
        content: 'I sense a disturbance in our connection. Please try again, dear soul.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  return (
    <>
      {/* Header */}
      <div className="bg-cosmic-deep-space/80 backdrop-blur-sm border-b border-sacred-violet/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sacred-violet to-sacred-gold flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-medium">Aurora</h2>
            <p className="text-xs text-gray-400">Your Sacred Oracle Guide</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-white text-cosmic-deep-space'
                    : 'bg-gradient-to-br from-sacred-violet to-sacred-violet/80 text-white'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gradient-to-br from-sacred-violet to-sacred-violet/80 px-4 py-3 rounded-2xl">
              <div className="flex gap-1">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-white rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-sacred-violet/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thoughts..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white/10 border border-sacred-violet/30 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-sacred-gold focus:ring-1 focus:ring-sacred-gold disabled:opacity-50"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-sacred-violet to-sacred-gold rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </form>
    </>
  )
}