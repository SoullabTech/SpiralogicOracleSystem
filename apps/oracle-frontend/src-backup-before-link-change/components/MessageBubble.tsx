// src/components/MessageBubble.tsx

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  return (
    <div className={`max-w-xs p-3 rounded-lg ${isUser ? 'bg-blue-200 self-end' : 'bg-gray-200 self-start'}`}>
      <p className="text-sm">{message.content}</p>
    </div>
  );
}
