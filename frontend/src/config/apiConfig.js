/**
 * Dynamic Backend URL and WebSocket Configuration.
 * 
 * Priority order:
 * 1. Runtime override stored in localStorage ('PREDICTSPACE_BACKEND_URL')
 * 2. Vite environment variable (import.meta.env.VITE_API_BASE_URL)
 * 3. Localhost development fallback ('/api' through Vite dev proxy)
 * 4. Production fallback: window.location.origin + '/api'
 */

const STORAGE_KEY = 'PREDICTSPACE_BACKEND_URL';

/**
 * Returns the sanitized base URL for API calls (e.g. "https://final-xxxx.onrender.com/api" or "/api")
 */
export function getBackendUrl() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) {
      let clean = saved.trim().replace(/\/+$/, '');
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `https://${clean}`;
      }
      return clean.endsWith('/api') ? clean : `${clean}/api`;
    }
  }

  // Check Vite environment variable
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean;
  }

  // Local development
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api';
  }

  // In production if no backend URL is set, return relative '/api'
  return '/api';
}

/**
 * Returns the raw host URL without the trailing /api (e.g. "https://final-xxxx.onrender.com")
 */
export function getRawBackendHost() {
  const url = getBackendUrl();
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace(/\/api$/, '');
  }
  return '';
}

/**
 * Returns the WebSocket broker URL (e.g. "wss://final-xxxx.onrender.com/ws")
 */
export function getWebSocketUrl() {
  // Check explicit environment variable
  const envWs = import.meta.env.VITE_WS_URL;
  if (envWs && envWs.trim()) {
    return envWs.trim();
  }

  const host = getRawBackendHost();
  if (host) {
    const wsProto = host.startsWith('https://') ? 'wss:' : 'ws:';
    const cleanHost = host.replace(/^https?:\/\//, '');
    return `${wsProto}//${cleanHost}/ws`;
  }

  // If running locally on dev server
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/ws`;
  }

  // On Vercel when no external backend is set yet, return null to avoid spurious socket failures
  return null;
}

/**
 * Save or clear custom backend URL in localStorage
 */
export function setCustomBackendUrl(url) {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim()) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      let clean = url.trim().replace(/\/+$/, '');
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `https://${clean}`;
      }
      localStorage.setItem(STORAGE_KEY, clean);
    }
  }
}

/**
 * Get the currently configured custom backend URL if any
 */
export function getCustomBackendUrl() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY) || '';
  }
  return '';
}
