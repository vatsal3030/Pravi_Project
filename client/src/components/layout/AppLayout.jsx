// ============================================
// App Layout — Fully Responsive Sidebar + Topbar + Content
// Synchronized with sidebar collapse state
// ============================================

import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useLayoutStore from '../../store/layoutStore';

export default function AppLayout() {
  const { sidebarCollapsed } = useLayoutStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar />

      {/* Main Content Area — dynamically offsets according to sidebar collapsed state */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-250 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        } pl-0`}
      >
        <Topbar />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
