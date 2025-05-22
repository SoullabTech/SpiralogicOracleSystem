// ✅ src/hooks/useChatInput.ts
import { useState } from 'react';

export function useChatInput() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    // ...same logic...
  };

  return { messages, input, setInput, sendMessage };
}
