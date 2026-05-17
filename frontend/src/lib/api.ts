import { triggerSessionExpired } from './authEvents';

const API_BASE = '/api';

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const doFetch = async (path: string, init: RequestInit, retry = true): Promise<any> => {
  const res = await fetch(`${API_BASE}${path}`, init);

  if (res.status === 401 && retry) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      clearAuthTokenSync();
      triggerSessionExpired();
      throw new Error('Session expired. Please log in again.');
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken: string) => {
          resolve(doFetch(path, { ...init, headers: { ...getHeaders(), Authorization: `Bearer ${newToken}` } }, false));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const tokens = await refreshRes.json();
        localStorage.setItem('token', tokens.token);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        // Flush queued requests
        refreshQueue.forEach((cb) => cb(tokens.token));
        refreshQueue = [];

        // Retry original request with new token
        return doFetch(path, { ...init, headers: { ...init.headers, Authorization: `Bearer ${tokens.token}` } }, false);
      }
    } catch {
      // refresh network error — fall through to clear auth
    } finally {
      isRefreshing = false;
    }

    // Refresh failed — clear auth state
    clearAuthTokenSync();
    triggerSessionExpired();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      message = JSON.parse(text).error || text;
    } catch (_) {}
    throw new Error(message);
  }

  return res.json();
};

export const api = {
  get: (path: string) =>
    doFetch(path, { headers: getHeaders() }),

  post: (path: string, body?: any) =>
    doFetch(path, {
      method: 'POST',
      headers: getHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: (path: string, body: any) =>
    doFetch(path, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }),

  delete: (path: string) =>
    doFetch(path, { method: 'DELETE', headers: getHeaders() }),
};

// Token helpers
export const setAuthToken = (token: string, refreshToken?: string) => {
  localStorage.setItem('token', token);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

export const getAuthToken = () => localStorage.getItem('token');
export const isAuthenticated = () => !!localStorage.getItem('token');

const clearAuthTokenSync = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

export const clearAuthToken = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  if (token) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
      });
    } catch (_) {
      // Ignore network errors — still clear locally
    }
  }
  clearAuthTokenSync();
};
