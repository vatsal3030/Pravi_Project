// ============================================
// Login Page — Roads & Buildings Department Auth
// High-contrast, authoritative architectural theme
// ============================================

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      toast.success('Welcome to InfraVault — RnB Management System');
      const targetPath = location.state?.from?.pathname || '/dashboard';
      navigate(targetPath, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 relative overflow-hidden p-4">
      {/* Subtle Construction / Grid Pattern Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-slate-500/5 dark:bg-slate-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Department Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 mb-3 shadow-md text-white">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            InfraVault
          </h1>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest mt-0.5">
            Roads & Buildings Department
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Civil Infrastructure & Municipal Asset Portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card p-6 sm:p-8 shadow-xl">
          <div className="mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Official Personnel Login
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter authorized department credentials to proceed
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Government / Officer Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@infravault.io"
                  required
                  className="input-field pl-9 text-xs py-2.5"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="input-field pl-9 pr-10 text-xs py-2.5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Authenticate & Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials Quick Click */}
        <div className="mt-4 glass-card p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Quick Demo Accounts (Click to Fill)
          </p>
          <div className="space-y-1.5">
            <button
              onClick={() => setForm({ email: 'admin@infravault.io', password: 'admin123' })}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/60 dark:border-slate-700/60 transition-all text-left cursor-pointer"
            >
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">Executive Engineer (Admin)</span>
                <span className="text-[10px] text-slate-400 font-mono">admin@infravault.io</span>
              </div>
              <span className="badge badge-danger !text-[9px]">ADMIN</span>
            </button>

            <button
              onClick={() => setForm({ email: 'inspector@infravault.io', password: 'inspector123' })}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/60 dark:border-slate-700/60 transition-all text-left cursor-pointer"
            >
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">Site Inspector</span>
                <span className="text-[10px] text-slate-400 font-mono">inspector@infravault.io</span>
              </div>
              <span className="badge badge-warning !text-[9px]">INSPECTOR</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
