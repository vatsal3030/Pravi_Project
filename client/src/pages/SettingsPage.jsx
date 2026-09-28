// ============================================
// Settings Page — Profile, Theme & System Configuration
// Includes dedicated Light Mode toggle for senior civil officers
// ============================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Shield, Bell, Palette, Save, Loader2, Lock,
  Mail, Building2, Phone, Sun, Moon, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { USER_ROLES } from '../lib/constants';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || 'Roads & Buildings',
    phone: user?.phone || '',
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/users/${user.id}`, {
        name: form.name,
        department: form.department,
      });
      setUser({ ...user, ...res.data.data });
      toast.success('Officer profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Officer Profile', icon: User },
    { id: 'theme', label: 'Display & Contrast', icon: Palette },
    { id: 'about', label: 'Department Specs', icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          System Preferences & Officer Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Configure visual contrast, update officer credentials, and manage departmental jurisdiction
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Tab Sidebar */}
        <div className="w-full sm:w-52 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <tab.icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="glass-card p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                Officer Profile Details
              </h3>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-xl font-bold text-white shadow-md">
                  {user?.name?.charAt(0) || 'E'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  <span className="badge text-[10px] mt-1 badge-info">
                    {user?.role || 'ENGINEER'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field text-xs py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      value={form.email}
                      disabled
                      className="input-field text-xs py-2 opacity-60 cursor-not-allowed"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Departmental Jurisdiction
                    </label>
                    <input
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="input-field text-xs py-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Officer Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="glass-card p-6 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Visual Contrast & Theme Selection
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  High-contrast Light Mode is recommended for senior officials reviewing engineering maps and tables in bright office monitors.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Light Mode Option */}
                <div
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    theme === 'light'
                      ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Light Mode (High Contrast)</h4>
                        <span className="text-[10px] text-slate-500">Recommended for Seniors</span>
                      </div>
                    </div>
                    {theme === 'light' && <Check className="w-4 h-4 text-amber-600" />}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Crisp white background, high-contrast text, clear road markings, and standard GIS street tiles.
                  </p>
                </div>

                {/* Dark Mode Option */}
                <div
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode (Night Canvas)</h4>
                        <span className="text-[10px] text-slate-500">Night Field Work</span>
                      </div>
                    </div>
                    {theme === 'dark' && <Check className="w-4 h-4 text-amber-600" />}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Deep charcoal slate canvas with warm amber accents, designed to minimize eye strain in dim environments.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                Department System Specifications
              </h3>
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Platform</span>
                  <span className="font-bold">InfraVault RnB Asset Management v2.4</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Authority</span>
                  <span>Public Works & Infrastructure Directorate</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">GIS Engine</span>
                  <span>Leaflet OpenStreetMap & Esri World Imagery (Zero Latency)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Database Engine</span>
                  <span>PostgreSQL / Prisma ORM with In-Memory Caching</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Accessibility</span>
                  <span>WCAG 2.1 AA Compliant (High Contrast Light & Dark)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
