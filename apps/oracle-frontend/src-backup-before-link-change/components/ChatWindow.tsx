// src/components/ChatWindow.tsx
import { ReactNode } from 'react';

interface ChatWindowProps {
  children: ReactNode;
}

export default function ChatWindow({ children }: ChatWindowProps) {
  return (
    <div className="space-y-4">
      {children}
    </div>
  );
}
