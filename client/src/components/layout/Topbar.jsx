// ============================================
// Topbar Component — Apple Design System
// Spotlight Command Bar, Wave Theme Toggle, Interactive Notifications & Profile
// ============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, LogOut, ChevronDown,
  Sun, Moon, User, Menu, Command
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import useLayoutStore from '../../store/layoutStore';
import Breadcrumbs from '../shared/Breadcrumbs';
import SpotlightSearch from '../shared/SpotlightSearch';
import NotificationsPopover from '../shared/NotificationsPopover';
import api from '../../lib/api';

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { toggleMobileDrawer } = useLayoutStore();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for unread notification count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications?unreadOnly=true&limit=1');
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        // silent fail
      }
    };
    fetchUnread();
    const timer = setInterval(fetchUnread, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6 bg-white/80 dark:bg-[#161617]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 transition-colors">
        {/* Left Side: Mobile Menu & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleMobileDrawer}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block min-w-0">
            <Breadcrumbs />
          </div>
        </div>

        {/* Middle: Apple Spotlight Quick Search Trigger */}
        <div
          onClick={() => setShowSpotlight(true)}
          className="hidden md:flex flex-1 max-w-sm mx-4 items-center justify-between px-3.5 py-1.5 bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 rounded-full cursor-pointer hover:bg-black/8 dark:hover:bg-white/15 transition-all text-xs text-slate-500 dark:text-slate-400 group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 transition-colors" />
            <span className="truncate">Search bridges, roads, work orders...</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] bg-white dark:bg-black/40 px-2 py-0.5 rounded-full shadow-xs border border-black/5 dark:border-white/10">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>

        {/* Right Side: Theme Toggle, Notifications, User Menu */}
        <div className="flex items-center gap-2.5">
          {/* Prominent Theme Toggle with Top-Right Diagonal Wave Ripple */}
          <button
            onClick={(e) => toggleTheme(e)}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode (Diagonal Wave)`}
            aria-label="Toggle visual theme"
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 border border-black/5 dark:border-white/10 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Notification Center Popover */}
          <div className="relative z-50">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
              aria-label="View notifications"
              className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 transition-all cursor-pointer active:scale-95"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#161617]" />
              )}
            </button>

            <NotificationsPopover
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          {/* Profile Dropdown */}
          <div className="relative z-50">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all cursor-pointer active:scale-95"
            >
              <div className="w-7 h-7 rounded-full bg-[#0066cc] dark:bg-[#2997ff] text-white dark:text-black flex items-center justify-center text-xs font-bold shadow-xs">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {user?.name?.split(' ')[0] || 'Officer'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {user?.role?.toLowerCase() || 'Engineer'}
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showProfile && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-[#1c1c1e] rounded-2xl p-1.5 z-50 shadow-2xl border border-black/10 dark:border-white/10"
                  >
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-white/10 mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
                        {user?.department || 'Roads & Buildings Dept'}
                      </span>
                    </div>

                    <button
                      onClick={() => { setShowProfile(false); navigate('/profile'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-primary-500" />
                      Officer Profile & Stats
                    </button>

                    <button
                      onClick={() => { setShowProfile(false); navigate('/settings'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <Command className="w-3.5 h-3.5 text-slate-400" />
                      System Preferences
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-white/10" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Spotlight Command Modal */}
      <SpotlightSearch
        isOpen={showSpotlight}
        onClose={() => setShowSpotlight(false)}
      />
    </>
  );
}
