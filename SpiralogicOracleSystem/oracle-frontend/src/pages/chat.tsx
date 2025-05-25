import ChatWindow from '@/components/ChatWindow';
import MessageBubble, { Message } from '@/components/MessageBubble';
import useChatInput from '@/hooks/useChatInput';
import { useEffect, useRef } from 'react';

export default function ChatPage() {
  // Debug mount
  useEffect(() => {
    console.log('ChatPage Mounted');
  }, []);

  const { messages, input, setInput, sendMessage } = useChatInput();
  const endRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-sky-50 to-white">
      <header className="p-4 bg-white shadow-md">
        <h1 className="text-2xl font-semibold">Oracle Chat</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            Start the conversation by typing below.
          </div>
        )}

        <ChatWindow>
          {messages.map((msg: Message, idx: number) => (
            <MessageBubble key={idx} message={msg} />
          ))}
        </ChatWindow>
        <div ref={endRef} />
      </main>

      <footer className="p-4 bg-white shadow-inner">
        <div className="flex space-x-2">
          <input
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
          />
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}
