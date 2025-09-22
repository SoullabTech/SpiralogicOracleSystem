import { useState, useCallback } from 'react';

export function useMaiaStream() {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const stream = useCallback(async (messages: any[], options: any = {}) => {
    setIsStreaming(true);
    setText('');

    try {
      const response = await fetch('/api/maya/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, ...options }),
      });

      if (!response.ok) throw new Error('Stream failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullText += chunk;
        setText(fullText);
      }

      return fullText;
    } catch (error) {
      console.error('Stream error:', error);
      setText('I apologize, but I encountered an issue. Please try again.');
      throw error;
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { text, isStreaming, stream };
}