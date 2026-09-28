// ============================================
// NotificationsPopover — Apple-styled In-App Notification Center
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Check, AlertCircle, Wrench, Shield,
  Award, ArrowUpRight, CheckCheck, Trash2
} from 'lucide-react';
import api from '../../lib/api';

const TYPE_ICONS = {
  ASSET_CRITICAL: { icon: AlertCircle, color: 'text-red-500 bg-red-500/10' },
  WORK_ORDER_ASSIGNED: { icon: Wrench, color: 'text-blue-500 bg-blue-500/10' },
  WORK_ORDER_COMPLETED: { icon: Check, color: 'text-emerald-500 bg-emerald-500/10' },
  INSPECTION_DUE: { icon: Shield, color: 'text-amber-500 bg-amber-500/10' },
  BADGE_EARNED: { icon: Award, color: 'text-purple-500 bg-purple-500/10' },
  SYSTEM: { icon: Bell, color: 'text-slate-500 bg-slate-500/10' },
};

export default function NotificationsPopover({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=25');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s for real-time alerts
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleClickItem = (item) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    if (item.link) {
      navigate(item.link);
      onClose();
    }
  };

  return (
    <div className="relative">
      {/* Trigger Bell Button is in Topbar, passed isOpen */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[9990]" onClick={onClose} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 z-[9999] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-primary-500 text-white rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[12px] font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => {
                    const typeConfig = TYPE_ICONS[n.type] || TYPE_ICONS.SYSTEM;
                    const Icon = typeConfig.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleClickItem(n)}
                        className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                          n.isRead
                            ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 opacity-75'
                            : 'bg-primary-50/40 dark:bg-primary-950/20 hover:bg-primary-50/70 dark:hover:bg-primary-950/40'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${typeConfig.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {n.title}
                            </p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                              {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                        </div>

                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 text-center">
                <button
                  onClick={() => { navigate('/work-orders'); onClose(); }}
                  className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  View Active Operations <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
