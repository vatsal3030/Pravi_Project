// ============================================
// Sidebar — Apple Design System Navigation
// Dynamic micro-animations on hover, Action Blue accents,
// responsive drawer and synchronized collapse
// ============================================

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, Package, ClipboardList,
  Search, Users, Trophy, Settings, ChevronLeft,
  ChevronRight, Building2, Award, X, User
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLayoutStore from '../../store/layoutStore';
import useLanguageStore from '../../store/languageStore';
import { LEVEL_TITLES } from '../../lib/constants';

const navItems = [
  {
    section: 'Overview',
    items: [
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        hoverClass: 'group-hover:rotate-12 group-hover:scale-115',
      },
      {
        path: '/map',
        label: 'Asset GIS Map',
        icon: Map,
        hoverClass: 'group-hover:-translate-y-1.5 group-hover:rotate-12',
      },
      {
        path: '/analytics',
        label: 'Analytics & KPIs',
        icon: Award,
        hoverClass: 'group-hover:scale-125 group-hover:rotate-[-6deg]',
      },
    ],
  },
  {
    section: 'RnB Operations',
    items: [
      {
        path: '/assets',
        label: 'Assets Directory',
        icon: Package,
        hoverClass: 'group-hover:translate-x-1.5 group-hover:scale-110',
      },
      {
        path: '/work-orders',
        label: 'Work Orders',
        icon: ClipboardList,
        hoverClass: 'group-hover:rotate-12 group-hover:scale-115',
      },
      {
        path: '/inspections',
        label: 'Field Inspections',
        icon: Search,
        hoverClass: 'group-hover:scale-125 group-hover:-rotate-12',
      },
    ],
  },
  {
    section: 'Department',
    items: [
      {
        path: '/leaderboard',
        label: 'Officer Rank',
        icon: Trophy,
        hoverClass: 'group-hover:-translate-y-1.5 group-hover:rotate-6',
      },
      {
        path: '/users',
        label: 'Engineers & Staff',
        icon: Users,
        roles: ['ADMIN'],
        hoverClass: 'group-hover:translate-x-1.5 group-hover:scale-110',
      },
    ],
  },
  {
    section: 'Preferences',
    items: [
      {
        path: '/profile',
        label: 'Officer Profile',
        icon: User,
        hoverClass: 'group-hover:scale-125 group-hover:rotate-[-8deg]',
      },
      {
        path: '/settings',
        label: 'System Settings',
        icon: Settings,
        hoverClass: 'group-hover:rotate-90 duration-500',
      },
    ],
  },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileDrawerOpen, setMobileDrawerOpen } = useLayoutStore();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const location = useLocation();
  const level = user?.currentLevel || 1;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/95 dark:bg-[#161617]/95 backdrop-blur-xl text-slate-800 dark:text-slate-100 border-r border-black/5 dark:border-white/10 transition-colors">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-black/5 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shrink-0 shadow-md shadow-amber-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
                    InfraVault
                  </h1>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300/40">
                    Gujarat
                  </span>
                </div>
                <p className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 truncate tracking-wide">
                  Roads & Buildings Dept.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileDrawerOpen(false)}
          className="lg:hidden p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
        {navItems.map((section) => (
          <div key={section.section}>
            {!sidebarCollapsed && (
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-1.5">
                {t(section.section)}
              </p>
            )}
            <div className="space-y-1">
              {section.items
                .filter((item) => !item.roles || item.roles.includes(user?.role))
                .map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileDrawerOpen(false)}
                      title={sidebarCollapsed ? t(item.label) : undefined}
                      className={`
                        relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold
                        transition-all duration-200 group cursor-pointer
                        ${isActive
                          ? 'bg-amber-500/12 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold border-l-[3px] border-amber-600 dark:border-amber-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                        }
                        ${sidebarCollapsed ? 'justify-center px-2' : ''}
                      `}
                    >
                      {/* Active indicator dot */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}

                      {/* Icon with Action Animation on Hover */}
                      <span className={`shrink-0 transition-all duration-200 transform ${item.hoverClass}`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400'}`} />
                      </span>

                      {!sidebarCollapsed && (
                        <span className="truncate">{t(item.label)}</span>
                      )}
                    </NavLink>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Status Card */}
      <div className="p-3 border-t border-black/5 dark:border-white/10 shrink-0">
        <div className={`flex items-center gap-2.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 ${sidebarCollapsed ? 'justify-center p-1.5' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>

          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.name || 'Officer'}
              </p>
              <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 dark:text-slate-400">
                <span className="font-bold text-amber-600 dark:text-amber-400">{user?.totalPoints || 0} pts</span>
                <span>•</span>
                <span className="truncate">{LEVEL_TITLES[level] || 'Junior Engineer'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Collapse Toggle Button */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-[#1c1c1e] border border-black/10 dark:border-white/10 items-center justify-center text-slate-500 dark:text-slate-400 hover:text-amber-600 hover:border-amber-500 shadow-sm transition-all z-50 cursor-pointer"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 255 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 z-40"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileDrawerOpen(false)}
            className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer Content */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 w-[270px] z-50 shadow-2xl"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
