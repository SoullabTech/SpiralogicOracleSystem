// app/hooks/useMayaStream.ts
// Optimized streaming hook with phrase-based voice synthesis

import { useEffect, useRef, useState } from "react";

type StreamOptions = {
  backendUrl: string; // e.g., NEXT_PUBLIC_BACKEND_URL
  element: string;
  userId: string;
  lang?: string;
  voiceEnabled: boolean;
  minPhraseLen?: number; // ~20 chars
};

export function useMayaStream() {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  
  const speakQueue = useRef<string[]>([]);
  const speaking = useRef(false);
  const currentEventSource = useRef<EventSource | null>(null);

  const cancelSpeech = () => {
    window.speechSynthesis?.cancel();
    speakQueue.current = [];
    speaking.current = false;
  };

  const enqueueSpeech = (phrase: string, lang: string) => {
    speakQueue.current.push(phrase);
    if (!speaking.current) {
      speaking.current = true;
      const pump = () => {
        const next = speakQueue.current.shift();
        if (!next) {
          speaking.current = false;
          return;
        }
        const utterance = new SpeechSynthesisUtterance(next);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = pump;
        utterance.onerror = pump;
        window.speechSynthesis.speak(utterance);
      };
      pump();
    }
  };

  const stream = (opts: StreamOptions, userText: string) => {
    const { backendUrl, element, userId, lang = "en-US", voiceEnabled, minPhraseLen = 20 } = opts;
    
    // Cancel any existing stream and speech
    if (currentEventSource.current) {
      currentEventSource.current.close();
    }
    cancelSpeech();
    setText("");
    setMetadata(null);
    setIsStreaming(true);

    // Build streaming URL with query parameters
    const url = new URL(`${backendUrl}/api/v1/converse/stream`);
    url.searchParams.set("element", element);
    url.searchParams.set("userId", userId);
    url.searchParams.set("lang", lang);
    url.searchParams.set("q", userText);

    const eventSource = new EventSource(url.toString());
    currentEventSource.current = eventSource;

    let buffer = "";
    const boundary = /([.!?…]|—|,|\n)/; // phrase-ish punctuation

    eventSource.addEventListener("meta", (e: MessageEvent) => {
      const meta = JSON.parse(e.data);
      setMetadata(meta);
      console.log('🔮 Maya routing:', meta);
    });

    eventSource.addEventListener("delta", (e: MessageEvent) => {
      const { text: chunk } = JSON.parse(e.data);
      buffer += chunk;
      setText(prev => prev + chunk);

      // Phrase segmentation: speak at punctuation or length threshold
      let spoken = false;
      while (true) {
        const idx = buffer.search(boundary);
        if (idx === -1 && buffer.length < minPhraseLen) break;
        
        const cut = idx !== -1 ? idx + 1 : buffer.length;
        const phrase = buffer.slice(0, cut).trim();
        buffer = buffer.slice(cut);
        
        if (voiceEnabled && phrase) {
          enqueueSpeech(phrase, lang);
        }
        spoken = true;
      }

      // Optional: flush long buffers even without punctuation
      if (!spoken && buffer.length > 80 && voiceEnabled) {
        const tail = buffer.slice(0, 60);
        buffer = buffer.slice(60);
        enqueueSpeech(tail, lang);
      }
    });

    eventSource.addEventListener("done", (e: MessageEvent) => {
      const doneData = JSON.parse(e.data);
      
      // Flush any remaining buffer
      const tail = buffer.trim();
      if (tail && voiceEnabled) {
        enqueueSpeech(tail, lang);
      }
      
      buffer = "";
      setIsStreaming(false);
      setMetadata(prev => ({ ...prev, ...doneData }));
      
      eventSource.close();
      currentEventSource.current = null;
      
      console.log('✅ Maya stream complete:', doneData);
    });

    eventSource.addEventListener("heartbeat", () => {
      // Keep connection alive
    });

    eventSource.onerror = (error) => {
      console.error('Maya stream error:', error);
      eventSource.close();
      currentEventSource.current = null;
      setIsStreaming(false);
      
      // Add error message to text if nothing was received
      if (!text) {
        setText("I'm having trouble connecting right now. Please try again in a moment.");
      }
    };

    // Return cleanup function for barge-in
    return () => {
      eventSource.close();
      currentEventSource.current = null;
      cancelSpeech();
      setIsStreaming(false);
    };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentEventSource.current) {
        currentEventSource.current.close();
      }
      cancelSpeech();
    };
  }, []);

  return { 
    text, 
    isStreaming, 
    metadata,
    stream, 
    cancelSpeech 
  };
}

// Example usage in MayaChat component:
export const MayaChatWithStreaming = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';
  const { text, isStreaming, metadata, stream, cancelSpeech } = useMayaStream();
  
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [element, setElement] = useState<"air"|"fire"|"water"|"earth"|"aether">("earth");
  const [userInput, setUserInput] = useState("");

  const handleSend = () => {
    if (!userInput.trim() || isStreaming) return;
    
    const stopStream = stream(
      { 
        backendUrl, 
        element, 
        userId: "web-user", 
        voiceEnabled, 
        lang: "en-US" 
      },
      userInput
    );
    
    setUserInput("");
    
    // Save stop function for potential barge-in
    // You could store this in a ref for interruption capability
  };

  const handleBargeIn = () => {
    cancelSpeech();
    // If you saved the stop function, call it here for true barge-in
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Element selector */}
      <div className="flex gap-2">
        {['air', 'fire', 'water', 'earth', 'aether'].map(el => (
          <button
            key={el}
            onClick={() => setElement(el as any)}
            className={`px-3 py-1 rounded ${element === el ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {el} {el === 'air' && '(Claude)'}
          </button>
        ))}
      </div>

      {/* Voice toggle */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={voiceEnabled}
          onChange={e => setVoiceEnabled(e.target.checked)}
        />
        Voice enabled
      </label>

      {/* Response area with streaming text */}
      <div className="rounded-lg p-4 bg-zinc-900/40 min-h-[140px] whitespace-pre-wrap text-white">
        {text || "…"}
        {isStreaming && <span className="animate-pulse">|</span>}
      </div>

      {/* Metadata display */}
      {metadata && (
        <div className="text-sm text-gray-500">
          Model: {metadata.model} | Element: {element}
          {metadata.tokens && ` | Tokens: ${metadata.tokens}`}
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask Maya for guidance..."
          className="flex-1 px-3 py-2 border rounded"
          disabled={isStreaming}
        />
        <button
          onClick={handleSend}
          disabled={!userInput.trim() || isStreaming}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isStreaming ? 'Streaming...' : 'Send'}
        </button>
        {isStreaming && (
          <button
            onClick={handleBargeIn}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
};