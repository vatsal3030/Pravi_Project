// ============================================
// API Client — Axios instance with SWR In-Memory Caching
// Eliminates repetitive network latency on page navigation
// ============================================

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Client-side in-memory cache with TTL
const requestCache = new Map();

export const invalidateApiCache = (prefix = '') => {
  if (!prefix) {
    requestCache.clear();
    return;
  }
  for (const key of requestCache.keys()) {
    if (key.includes(prefix)) {
      requestCache.delete(key);
    }
  }
};

// Cached GET helper: returns cached response immediately if fresh, otherwise fetches
export const cachedGet = async (url, config = {}, ttlSeconds = 30) => {
  const cacheKey = `${url}?${JSON.stringify(config.params || {})}`;
  const cached = requestCache.get(cacheKey);

  if (cached && Date.now() < cached.expiresAt) {
    return Promise.resolve(cached.data);
  }

  const response = await api.get(url, config);
  requestCache.set(cacheKey, {
    data: response,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  return response;
};

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('infravault_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Automatically invalidate cache on mutating methods
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      invalidateApiCache();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('infravault_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('infravault_token', accessToken);
        localStorage.setItem('infravault_refresh_token', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear auth and redirect
        localStorage.removeItem('infravault_token');
        localStorage.removeItem('infravault_refresh_token');
        localStorage.removeItem('infravault_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
