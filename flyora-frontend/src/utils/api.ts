import { API_BASE_URL } from '../config';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('flyora_access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store', // Fix for browser caching API responses
  });

  if (response.status === 401) {
    localStorage.removeItem('flyora_user_id');
    localStorage.removeItem('flyora_user_name');
    localStorage.removeItem('flyora_access_token');
    localStorage.removeItem('flyora_refresh_token');
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  const resData = await response.json();
  if (!response.ok) {
    const errorDetails = resData.errors ? JSON.stringify(resData.errors) : '';
    throw new Error(`${resData.error || resData.message || resData.detail || 'Request failed'} ${errorDetails}`);
  }

  return resData;
}
