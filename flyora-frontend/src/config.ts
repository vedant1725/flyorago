const isLocalNetwork = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.') ||
  window.location.hostname.startsWith('172.')
);

// In local/LAN development, point API requests to the current machine's port 8000
export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  isLocalNetwork
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'https://api.flyorago.me'
);
