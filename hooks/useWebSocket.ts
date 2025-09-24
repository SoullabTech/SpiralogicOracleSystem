import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketHook {
  status: 'connecting' | 'connected' | 'disconnected';
  on: (event: string, handler: (data: any) => void) => void;
  send: (data: any) => void;
  disconnect: () => void;
}

export const useWebSocket = (url: string): WebSocketHook => {
  const [status, setStatus] = useState<WebSocketHook['status']>('connecting');
  const ws = useRef<WebSocket | null>(null);
  const handlers = useRef<Map<string, Set<Function>>>(new Map());

  useEffect(() => {
    if (!url) return;

    try {
      // For now, we'll mock the WebSocket connection
      // In production, uncomment the actual WebSocket code below

      // ws.current = new WebSocket(url);

      // ws.current.onopen = () => {
      //   setStatus('connected');
      // };

      // ws.current.onclose = () => {
      //   setStatus('disconnected');
      // };

      // ws.current.onerror = (error) => {
      //   console.error('WebSocket error:', error);
      //   setStatus('disconnected');
      // };

      // ws.current.onmessage = (event) => {
      //   try {
      //     const data = JSON.parse(event.data);
      //     const eventHandlers = handlers.current.get(data.type);
      //     if (eventHandlers) {
      //       eventHandlers.forEach(handler => handler(data));
      //     }
      //   } catch (error) {
      //     console.error('Error parsing WebSocket message:', error);
      //   }
      // };

      // Mock connected status for development
      setTimeout(() => setStatus('connected'), 1000);
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setStatus('disconnected');
    }

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [url]);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (!handlers.current.has(event)) {
      handlers.current.set(event, new Set());
    }
    handlers.current.get(event)?.add(handler);

    // Return cleanup function
    return () => {
      handlers.current.get(event)?.delete(handler);
    };
  }, []);

  const send = useCallback((data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  return {
    status,
    on,
    send,
    disconnect
  };
};