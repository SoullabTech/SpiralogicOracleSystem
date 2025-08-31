// Frontend Integration for Streaming Sesame/Maya Pipeline
// Add this to your React component for real-time streaming

import { useState, useEffect, useRef } from 'react';

interface StreamingResponse {
  text: string;
  element: string;
  isComplete: boolean;
  audioUrl?: string;
  metadata?: any;
}

const useMayaStreaming = (backendUrl: string = 'http://localhost:3002') => {
  const [response, setResponse] = useState<StreamingResponse>({
    text: '',
    element: 'aether',
    isComplete: false
  });
  
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const streamConversation = async (
    userText: string,
    element: string = 'aether',
    userId: string = 'user',
    voiceEnabled: boolean = false
  ) => {
    setIsStreaming(true);
    setResponse({ text: '', element, isComplete: false });

    try {
      // First, POST to start the stream
      const response = await fetch(`${backendUrl}/api/v1/converse/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userText,
          userId,
          element,
          voiceEnabled,
          sessionId: `session_${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Set up EventSource for the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Process complete lines
          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line.startsWith('event:') || line.startsWith('data:')) {
              processSSELine(line);
            }
          }
          
          // Keep incomplete line in buffer
          buffer = lines[lines.length - 1];
        }
      }

    } catch (error) {
      console.error('Streaming error:', error);
      setResponse(prev => ({
        ...prev,
        text: 'Connection error occurred. Please try again.',
        isComplete: true
      }));
    } finally {
      setIsStreaming(false);
    }
  };

  const processSSELine = (line: string) => {
    if (line.startsWith('data:')) {
      try {
        const data = JSON.parse(line.substring(5));
        
        switch (data.event || 'token') {
          case 'connected':
            console.log('🔗 Connected to Maya streaming');
            break;
            
          case 'token':
            setResponse(prev => ({
              ...prev,
              text: prev.text + data.token
            }));
            break;
            
          case 'element':
            console.log('🔮 Element routing:', data);
            break;
            
          case 'safety_intervention':
            setResponse(prev => ({
              ...prev,
              text: data.text,
              element: data.element || prev.element
            }));
            break;
            
          case 'response':
            setResponse(prev => ({
              ...prev,
              audioUrl: data.audioUrl,
              metadata: data.metadata
            }));
            break;
            
          case 'complete':
            setResponse(prev => ({ ...prev, isComplete: true }));
            setIsStreaming(false);
            break;
            
          case 'error':
            console.error('Maya streaming error:', data);
            setResponse(prev => ({
              ...prev,
              text: prev.text || 'An error occurred during processing.',
              isComplete: true
            }));
            setIsStreaming(false);
            break;
        }
      } catch (e) {
        console.warn('Failed to parse SSE data:', line);
      }
    }
  };

  return {
    response,
    isStreaming,
    streamConversation
  };
};

// Example usage in your MayaChat component:
const MayaChatWithStreaming = () => {
  const { response, isStreaming, streamConversation } = useMayaStreaming();
  const [element, setElement] = useState('aether');
  
  const handleSubmit = (userText: string) => {
    streamConversation(userText, element, 'user-123', false);
  };

  return (
    <div className="maya-chat">
      {/* Element selector */}
      <select value={element} onChange={e => setElement(e.target.value)}>
        <option value="air">Air (Claude)</option>
        <option value="fire">Fire</option>
        <option value="water">Water</option>
        <option value="earth">Earth</option>
        <option value="aether">Aether</option>
      </select>
      
      {/* Streaming response display */}
      <div className="response-area">
        {response.text && (
          <div className={`response ${response.element}`}>
            {response.text}
            {isStreaming && <span className="cursor">|</span>}
          </div>
        )}
      </div>
      
      {/* Voice playback */}
      {response.audioUrl && (
        <audio src={response.audioUrl} autoPlay />
      )}
    </div>
  );
};