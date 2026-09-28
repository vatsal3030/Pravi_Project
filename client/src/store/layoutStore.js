// ============================================
// Layout Store — Sidebar Collapse & Responsive Drawer
// ============================================

import { create } from 'zustand';

const getInitialCollapsed = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('infravault_sidebar_collapsed') === 'true';
};

export const useLayoutStore = create((set, get) => ({
  sidebarCollapsed: getInitialCollapsed(),
  mobileDrawerOpen: false,

  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    localStorage.setItem('infravault_sidebar_collapsed', String(next));
    set({ sidebarCollapsed: next });
  },

  setSidebarCollapsed: (collapsed) => {
    localStorage.setItem('infravault_sidebar_collapsed', String(collapsed));
    set({ sidebarCollapsed: collapsed });
  },

  toggleMobileDrawer: () => {
    set({ mobileDrawerOpen: !get().mobileDrawerOpen });
  },

  setMobileDrawerOpen: (open) => {
    set({ mobileDrawerOpen: open });
  },
}));

export default useLayoutStore;
