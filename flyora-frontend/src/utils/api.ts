import { API_BASE_URL } from '../config';

const inflightRequests = new Map<string, Promise<any>>();
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 3000; // 3 seconds cache for GET requests

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const token = localStorage.getItem('flyora_access_token');
  const cacheKey = `${method}:${endpoint}`;

  // Invalidate cache on mutations
  if (method !== 'GET') {
    apiCache.clear();
  } else if (!options.body) {
    // Check short-term memory cache
    const cached = apiCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }

    // Return active in-flight request to prevent duplicate network calls
    if (inflightRequests.has(cacheKey)) {
      return inflightRequests.get(cacheKey);
    }
  }

  const fetchPromise = (async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        cache: 'no-store',
      });

      if (response.status === 401) {
        const isAdminPage = window.location.pathname.startsWith('/admin');
        if (isAdminPage) {
          throw new Error('Admin API session unauthorized.');
        }
        localStorage.removeItem('flyora_user_id');
        localStorage.removeItem('flyora_user_name');
        localStorage.removeItem('flyora_access_token');
        localStorage.removeItem('flyora_refresh_token');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      const contentType = response.headers.get('content-type') || '';
      let resData: any = {};

      if (contentType.includes('application/json')) {
        resData = await response.json();
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}. Please check backend logs.`);
        }
        return { status: 'success', data: text };
      }

      if (!response.ok) {
        const hasErrors = resData.errors && Object.keys(resData.errors).length > 0;
        const errorDetails = hasErrors ? JSON.stringify(resData.errors) : '';
        throw new Error(`${resData.error || resData.message || resData.detail || 'Request failed'}${errorDetails ? ' ' + errorDetails : ''}`);
      }

      if (method === 'GET') {
        apiCache.set(cacheKey, { data: resData, timestamp: Date.now() });
      }

      return resData;
    } finally {
      inflightRequests.delete(cacheKey);
    }
  })();

  if (method === 'GET' && !options.body) {
    inflightRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}
