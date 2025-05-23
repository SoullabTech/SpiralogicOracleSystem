// src/pages/ChatPage.tsx
import useChatInput from '@/hooks/useChatInput'
import { useEffect, useRef } from 'react'

export default function ChatPage() {
  const { messages, input, setInput, sendMessage } = useChatInput()
  const endRef = useRef<HTMLDivElement>(null)

  // scroll to bottom whenever messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Oracle Chat</h1>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[80%] ${
              m.from === 'user'
                ? 'self-end bg-blue-500 text-white'
                : 'self-start bg-gray-200 text-black'
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={e => {
          e.preventDefault()
          sendMessage()
        }}
        className="flex"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border rounded-l px-3 py-2 focus:outline-none"
          placeholder="Type your message…"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 rounded-r hover:bg-green-700"
        >
          Send
        </button>
      </form>
    </div>
  )
}
