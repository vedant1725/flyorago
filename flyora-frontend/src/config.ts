const isLocalNetwork = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.') ||
  window.location.hostname.startsWith('172.')
);

// In local/LAN development, point API requests to the current machine's port 8000
export const API_BASE_URL = (isLocalNetwork
  ? `${window.location.protocol}//${window.location.hostname}:8000`
  : (import.meta.env.VITE_API_URL || 'https://api.flyorago.me')
);

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1086456796372-b5dijct15asf51gsb9tf4rhdfnnnj58c.apps.googleusercontent.com';

