import { NotificationService } from './notificationService';
import { apiFetch, getApiBaseUrl } from './api';
import { Storage, STORAGE_KEYS } from './storage';

const STORAGE_LAST_SEEN_NOTIF_ID_KEY = 'flyora_mobile_last_seen_notif_id';
const STORAGE_NOTIF_HISTORY_KEY = 'flyora_mobile_notif_history';

class NotificationSyncManager {
  private syncTimer: any = null;
  private socket: WebSocket | null = null;
  private userId: string | number | null = null;
  private isRunning: boolean = false;
  private listeners: Set<(count: number) => void> = new Set();
  private eventListeners: Set<(event: any) => void> = new Set();
  private processedIds: Set<string> = new Set();

  /**
   * Start Global Notification Synchronization (WebSocket + Fast Fallback Polling)
   */
  async start(user: any) {
    if (!user || !user.id) return;
    this.userId = user.id;
    this.isRunning = true;

    // Load previously processed IDs from storage
    try {
      const stored = await Storage.getItem(STORAGE_NOTIF_HISTORY_KEY);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          this.processedIds = new Set(arr);
        }
      }
    } catch {}

    // 1. Initial immediate sync from Backend API
    await this.syncFromBackend(false);

    // 2. Connect live WebSocket (Exact match with Web SocketContext)
    this.connectWebSocket();

    // 3. Relaxed fallback polling every 30 seconds only if user is logged in
    if (this.syncTimer) clearInterval(this.syncTimer);
    this.syncTimer = setInterval(async () => {
      const token = await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        this.syncFromBackend(true);
      }
    }, 30000);
  }

  /**
   * Stop manager upon user sign-out
   */
  stop() {
    this.isRunning = false;
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Register listener for unread count badge
   */
  onUnreadCountChange(cb: (count: number) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  /**
   * Register live event listener for status updates (e.g. DELIVERED, QR scan)
   */
  onLiveEvent(cb: (event: any) => void) {
    this.eventListeners.add(cb);
    return () => this.eventListeners.delete(cb);
  }

  private notifyEventListeners(event: any) {
    this.eventListeners.forEach((cb) => {
      try {
        cb(event);
      } catch {}
    });
  }

  private notifyListeners(count: number) {
    this.listeners.forEach((cb) => {
      try {
        cb(count);
      } catch {}
    });
  }

  /**
   * Connect WebSocket matching Web frontend exactly: ws://<host>/ws/notifications/<userId>/
   */
  private async connectWebSocket() {
    if (!this.userId || !this.isRunning) return;

    try {
      const baseUrl = await getApiBaseUrl();
      const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
      const host = baseUrl.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}://${host}/ws/notifications/${this.userId}/`;

      const ws = new WebSocket(wsUrl);
      this.socket = ws;

      ws.onopen = () => {
        console.log(`[Flyora Mobile WS] Connected for User #${this.userId}`);
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          const title = data.title || (data.status ? `Trip Update: ${data.status}` : 'Flyora Alert');
          const message = data.message || 'You have a new update regarding your trip or package.';

          // Broadcast live event immediately to all active screens (SenderDetailsScreen, etc.)
          this.notifyEventListeners(data);

          // Trigger OS Shuttle Notification Tray
          await NotificationService.triggerLocalNotification({
            title,
            body: message,
            data,
          });

          // Sync database notifications list
          await this.syncFromBackend(true);
        } catch (err) {
          console.warn('[Flyora Mobile WS] message parse err:', err);
        }
      };

      ws.onerror = (e) => {
        console.warn('[Flyora Mobile WS] error:', (e as any)?.message || 'WS error');
      };

      ws.onclose = () => {
        this.socket = null;
        // Reconnect after 5 seconds if still running
        if (this.isRunning) {
          setTimeout(() => {
            this.connectWebSocket();
          }, 5000);
        }
      };
    } catch (e) {
      console.warn('[Flyora Mobile WS] connection error:', e);
    }
  }

  /**
   * Sync Notifications from Backend REST API
   */
  async syncFromBackend(isSilent: boolean = true) {
    if (!this.isRunning) return;

    try {
      const res = await apiFetch('/api/notifications/');
      if (res.success && Array.isArray(res.data)) {
        const notifs = res.data;
        const unreadCount = notifs.filter((n: any) => !n.is_read).length;
        this.notifyListeners(unreadCount);

        // Check for brand new notifications that haven't been shown in system shuttle
        for (const n of notifs) {
          const strId = String(n.id);
          if (!this.processedIds.has(strId)) {
            this.processedIds.add(strId);

            // If it's an unread notification, trigger the OS Shuttle Notification Tray
            if (!n.is_read) {
              await NotificationService.triggerLocalNotification({
                title: n.title || 'Flyora Notification ✈️',
                body: n.message || '',
                data: { id: n.id, type: n.type },
              });
            }
          }
        }

        // Persist processed IDs
        try {
          await Storage.setItem(
            STORAGE_NOTIF_HISTORY_KEY,
            JSON.stringify(Array.from(this.processedIds).slice(-100))
          );
        } catch {}
      }
    } catch (err) {
      if (!isSilent) console.warn('[NotificationSyncManager] sync error:', err);
    }
  }
}

export const GlobalNotificationSync = new NotificationSyncManager();
