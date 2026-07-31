import React, { createContext, useContext, useEffect, useState } from 'react';

import { useToast } from './ToastContext';

interface SocketContextType {
  isConnected: boolean;
  lastMessage: any;
}

const SocketContext = createContext<SocketContextType>({ isConnected: false, lastMessage: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const userId = localStorage.getItem('flyora_user_id');
    if (!userId) return;

    // Use WS for HTTP, WSS for HTTPS
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Connect directly to Django backend
    const wsUrl = `${protocol}//localhost:8000/ws/notifications/${userId}/`;
    let ws: WebSocket;
    let retryCount = 0;
    const maxRetries = 3;

    const connect = () => {
      if (retryCount >= maxRetries) return;
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
          retryCount = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
            if (data.message && data.type !== 'booking_status_update') {
               addToast(data.title || 'Update', data.message, 'info');
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          setIsConnected(false);
          retryCount++;
          if (retryCount < maxRetries) {
            setTimeout(connect, 5000);
          }
        };

        ws.onerror = () => {
          try { ws.close(); } catch {}
        };
      } catch (e) {}
    };

    connect();

    return () => {
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected, lastMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
