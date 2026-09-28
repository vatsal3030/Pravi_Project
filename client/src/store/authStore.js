// ============================================
// Auth Store — Zustand
// ============================================

import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('infravault_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('infravault_token'),
  isLoading: false,
  error: null,

  // Register
  register: async ({ email, password, name, role }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { email, password, name, role });
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('infravault_token', accessToken);
      localStorage.setItem('infravault_refresh_token', refreshToken);
      localStorage.setItem('infravault_user', JSON.stringify(user));

      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  // Login
  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('infravault_token', accessToken);
      localStorage.setItem('infravault_refresh_token', refreshToken);
      localStorage.setItem('infravault_user', JSON.stringify(user));

      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  // Logout
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('infravault_refresh_token');
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore errors during logout
    }

    localStorage.removeItem('infravault_token');
    localStorage.removeItem('infravault_refresh_token');
    localStorage.removeItem('infravault_user');
    set({ user: null, isAuthenticated: false });
  },

  // Fetch current user profile
  fetchProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.data;
      localStorage.setItem('infravault_user', JSON.stringify(user));
      set({ user });
      return user;
    } catch {
      // Token might be invalid
      get().logout();
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
