// Utility for OS-level Push & Background Notifications (Android Shutter & Desktop System Tray)

export const registerServiceWorker = async () => {
  if (typeof window === 'undefined') return null;
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[SW] FlyoraGo Service Worker registered successfully with scope:', reg.scope);
      return reg;
    } catch (err) {
      console.error('[SW] Service Worker registration failed:', err);
    }
  }
  return null;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications API not supported in this browser environment');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      playNotificationChime();
      triggerNativeNotification(
        'Flyora Alerts Enabled',
        'You will now receive instant match, payment, and journey updates.',
        '/notifications'
      );
    }
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
};

export const autoRequestNotificationOnInteraction = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'default') return;

  const trigger = () => {
    try {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          playNotificationChime();
          triggerNativeNotification(
            'Flyora Alerts Active',
            'Real-time updates will appear in your notification tray.',
            '/notifications'
          );
        }
      });
    } catch {}
    window.removeEventListener('click', trigger);
    window.removeEventListener('keydown', trigger);
  };

  window.addEventListener('click', trigger, { once: true });
  window.addEventListener('keydown', trigger, { once: true });
};

// Pure Web Audio API synthesized alert chime (Zero external audio file dependencies)
export const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Two-tone bell ping (D5 -> A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Autoplay restrictions before user gesture
  }
};

export const triggerNativeNotification = async (
  title: string,
  body: string,
  url: string = '/notifications',
  tag?: string
) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  // If permission is default, ask for permission
  if (Notification.permission === 'default') {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return;
    } catch {
      return;
    }
  } else if (Notification.permission !== 'granted') {
    return;
  }

  const options: NotificationOptions = {
    body,
    icon: '/flyora-icon.svg',
    badge: '/flyora-icon.svg',
    tag: tag || `flyora-${Date.now()}`,
    data: { url },
    requireInteraction: false
  };

  // 1. Try via active service worker registration first (works for mobile Android shade & desktop PWA)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return;
      }
    } catch (e) {
      console.warn('SW showNotification failed, falling back to window Notification:', e);
    }
  }

  // 2. Fallback to standard Window Notification
  try {
    const notif = new Notification(title, options);
    notif.onclick = () => {
      window.focus();
      window.location.href = url;
    };
  } catch (e) {
    console.error('Error creating native notification:', e);
  }
};
