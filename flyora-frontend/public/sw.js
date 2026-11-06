// FlyoraGo Service Worker for Background OS Notifications (Android Shutter & Desktop System Tray)
const CACHE_NAME = 'flyorago-sw-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming background push notifications (Web Push Protocol)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'FlyoraGo Alert', body: event.data.text() };
    }
  }

  const title = data.title || 'FlyoraGo Notification';
  const options = {
    body: data.body || data.message || 'You have a new update on FlyoraGo.',
    icon: '/flyora-icon.svg',
    badge: '/flyora-icon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/notifications',
      id: data.id
    },
    actions: [
      { action: 'open', title: 'Open FlyoraGo' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    requireInteraction: true
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle clicking on notification in Android Notification Shade or Windows/Mac Action Center
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

