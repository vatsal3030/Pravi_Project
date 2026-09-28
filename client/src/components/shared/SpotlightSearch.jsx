// ============================================
// SpotlightSearch — Apple-style Command Palette
// Fast keyboard navigation, asset & work order search
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Wrench, Shield, ArrowRight,
  FileText, Activity, Users, Settings, X, CornerDownLeft
} from 'lucide-react';
import api from '../../lib/api';

const QUICK_PAGES = [
  { title: 'Dashboard & KPI Overview', path: '/dashboard', icon: Activity, category: 'Pages' },
  { title: 'GIS Infrastructure Map', path: '/map', icon: MapPin, category: 'Pages' },
  { title: 'Assets Directory', path: '/assets', icon: FileText, category: 'Pages' },
  { title: 'Work Orders & Maintenance', path: '/work-orders', icon: Wrench, category: 'Pages' },
  { title: 'Field Inspections', path: '/inspections', icon: Shield, category: 'Pages' },
  { title: 'Engineering Staff Directory', path: '/users', icon: Users, category: 'Pages' },
  { title: 'Officer Profile', path: '/profile', icon: Settings, category: 'Pages' },
];

export default function SpotlightSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [assets, setAssets] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true); // open trigger
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search for assets & work orders
  useEffect(() => {
    if (!query.trim()) {
      setAssets([]);
      setWorkOrders([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [assetRes, woRes] = await Promise.all([
          api.get(`/assets?search=${encodeURIComponent(query)}&limit=5`),
          api.get(`/work-orders?search=${encodeURIComponent(query)}&limit=5`),
        ]);
        setAssets(assetRes.data.data || []);
        setWorkOrders(woRes.data.data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Flattened results for keyboard navigation
  const filteredPages = QUICK_PAGES.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  const allItems = [
    ...filteredPages.map(p => ({ ...p, type: 'page' })),
    ...assets.map(a => ({
      title: a.name,
      subtitle: `${a.assetCode} • ${a.category} • ${a.address || 'Ahmedabad'}`,
      path: `/assets/${a.id}`,
      icon: MapPin,
      type: 'asset',
    })),
    ...workOrders.map(w => ({
      title: w.title,
      subtitle: `${w.orderCode} • Priority: ${w.priority} • Status: ${w.status}`,
      path: `/work-orders`,
      icon: Wrench,
      type: 'workOrder',
    })),
  ];

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (allItems.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleSelect(allItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-full max-w-2xl bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header Input */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-white/10 gap-3">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search assets, roads, bridges, work orders, pages..."
              className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
            />
            {loading && (
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            {allItems.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                No matching assets or pages found for "{query}"
              </div>
            ) : (
              allItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary-500 text-white dark:bg-primary-600'
                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold truncate leading-tight">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p
                            className={`text-[11px] truncate mt-0.5 ${
                              isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-white/70 shrink-0 ml-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Navigation: ↑ ↓ to select</span>
            <span>↵ to open</span>
            <span>ESC to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
