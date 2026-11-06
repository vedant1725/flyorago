import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useToast } from './ToastContext';
import { 
  triggerNativeNotification, 
  playNotificationChime, 
  autoRequestNotificationOnInteraction 
} from '../utils/webNotification';

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
  const [activeUserId, setActiveUserId] = useState<string | null>(() => localStorage.getItem('flyora_user_id'));
  const wsRef = useRef<WebSocket | null>(null);

  // Auto-request notification permission on first user gesture if permission is 'default'
  useEffect(() => {
    autoRequestNotificationOnInteraction();
  }, []);

  // Sync active user ID dynamically whenever login/logout happens
  useEffect(() => {
    const checkUser = () => {
      const current = localStorage.getItem('flyora_user_id');
      if (current !== activeUserId) {
        setActiveUserId(current);
      }
    };

    window.addEventListener('storage', checkUser);
    const interval = setInterval(checkUser, 1500);

    return () => {
      window.removeEventListener('storage', checkUser);
      clearInterval(interval);
    };
  }, [activeUserId]);

  // Connect & maintain WebSocket channel for the authenticated user
  useEffect(() => {
    if (!activeUserId) {
      setIsConnected(false);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
        wsRef.current = null;
      }
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const wsHost = isLocalhost ? 'localhost:8000' : 'api.flyorago.me';
    const wsUrl = `${protocol}//${wsHost}/ws/notifications/${activeUserId}/`;

    let reconnectTimer: any = null;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isDisposed) { ws.close(); return; }
          setIsConnected(true);
          console.log(`[Flyora WebSocket] Connected successfully for User #${activeUserId}`);
        };

        const lastWsNotifMap: { [key: string]: number } = {};

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);

            const title = data.title || (data.status ? `Trip & Booking: ${data.status}` : 'FlyoraGo Notification');
            const message = data.message || 'You have a new update regarding your journey.';

            // Deduplicate incoming WebSocket messages within 3 seconds
            const msgKey = `${title}:::${message}`;
            const now = Date.now();
            if (lastWsNotifMap[msgKey] && (now - lastWsNotifMap[msgKey] < 3000)) {
              return; // Ignore duplicate broadcast
            }
            lastWsNotifMap[msgKey] = now;

            // 1. Play subtle audio ping
            playNotificationChime();

            // 2. In-app toast banner
            const toastType = data.type === 'payment_secured' ? 'success' : 'info';
            addToast(title, message, toastType);

            // 3. Native mobile notification shade / desktop system tray
            triggerNativeNotification(title, message, '/notifications');

            // 4. Global broadcast so all open components (NotificationsPage, Badges) refresh instantly
            window.dispatchEvent(new CustomEvent('flyora:notification', { detail: data }));
          } catch (e) {
            console.error('[Flyora WebSocket] Error parsing message:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          wsRef.current = null;
          if (!isDisposed) {
            reconnectTimer = setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => {
          try { ws.close(); } catch {}
        };
      } catch (err) {
        if (!isDisposed) {
          reconnectTimer = setTimeout(connect, 4000);
        }
      }
    };

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
        wsRef.current = null;
      }
    };
  }, [activeUserId]);

  return (
    <SocketContext.Provider value={{ isConnected, lastMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
