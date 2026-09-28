// ============================================
// User Management Page — Engineering Staff & Roles
// Apple Design System: SF Pro typography, clean surfaces,
// high contrast, theme adaptive, cached fast loading
// ============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Shield, Zap, Search, Flame, ChevronDown,
  RefreshCw, CheckCircle2, UserCheck, Eye, Mail,
  Phone, Calendar, Award, Trophy, X, ExternalLink,
  Briefcase, Check
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api, { cachedGet, invalidateApiCache } from '../lib/api';
import { USER_ROLES, LEVEL_TITLES } from '../lib/constants';
import { TableSkeleton } from '../components/shared/Skeletons';

// ── Public User Profile Modal ─────────────────
function PublicUserProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${userId}`);
        setProfile(res.data.data);
      } catch (err) {
        toast.error('Failed to load officer public profile');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-[#1c1c1e] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-black/10 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-primary-500 mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading verified officer profile...</p>
          </div>
        ) : profile ? (
          <div>
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-primary-600 to-amber-600 px-6 pt-6 pb-12 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                Gujarat R&B Public Record
              </span>
            </div>

            {/* Profile Avatar & Info Card */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex items-end justify-between -mt-10 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-[#0066cc] dark:bg-[#2997ff] text-white dark:text-black flex items-center justify-center text-2xl font-bold border-4 border-white dark:border-[#1c1c1e] shadow-lg">
                  {profile.name?.charAt(0) || 'E'}
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    profile.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                      : profile.role === 'INSPECTOR'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    <Shield className="w-3 h-3" />
                    {profile.role}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {profile.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {profile.department || 'Roads & Buildings Department, Govt. of Gujarat'}
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-1">
                  Level {profile.currentLevel} • {LEVEL_TITLES[profile.currentLevel] || 'Junior Engineer'}
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-2.5 my-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-center">
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{profile.totalPoints || 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Audit Points</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-center">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{profile._count?.inspections || 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Inspections</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-center">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{profile._count?.assignedWorkOrders || 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Work Orders</p>
                </div>
              </div>

              {/* Streak & Verification */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4 text-xs">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Activity Streak: {profile.currentStreak || 0} days</span>
                </div>
                <span className="text-[11px] text-amber-600 dark:text-amber-400">
                  Best: {profile.longestStreak || 0} days
                </span>
              </div>

              {/* Badges Earned */}
              {profile.badges && profile.badges.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    Accredited Badges ({profile.badges.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.badges.map((b) => (
                      <span
                        key={b.id}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-black/5 dark:border-white/10 flex items-center gap-1"
                      >
                        <span>{b.badge?.icon || '🎖️'}</span>
                        <span>{b.badge?.name || 'Honor Award'}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact & Meta Details */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/10 text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Official Email
                  </span>
                  <a href={`mailto:${profile.email}`} className="font-mono text-primary-600 dark:text-primary-400 hover:underline">
                    {profile.email}
                  </a>
                </div>
                {profile.phone && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Direct Phone
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {profile.phone}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Appointed Date
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {profile.createdAt ? format(new Date(profile.createdAt), 'PPP') : 'Active Service'}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost w-full text-xs py-2 cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await cachedGet('/users', {}, 20);
      setUsers(res.data.data || []);
    } catch {
      toast.error('Failed to load personnel directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      invalidateApiCache();
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success('Department privileges updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
              RnB Engineering Personnel & Roles
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage jurisdictional privileges, role assignments, and site inspector permissions ({users.length} active staff)
          </p>
        </div>

        <button
          onClick={() => { invalidateApiCache(); fetchUsers(); }}
          title="Refresh personnel directory"
          className="btn-ghost p-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Role Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(USER_ROLES).map(([role, info]) => {
          const count = users.filter((u) => u.role === role).length;
          return (
            <div
              key={role}
              className="glass-card p-5 flex items-center gap-4"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs"
                style={{ background: `${info.color}15`, color: info.color }}
              >
                {info.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {count}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {info.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Table or Skeleton */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Official Personnel Register
            </h3>
            <span className="text-xs text-slate-500">
              {users.length} Registered Officers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-white/5 border-b border-black/5 dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Officer Name</th>
                  <th className="py-3 px-5">Official Email</th>
                  <th className="py-3 px-5">Designation Rank</th>
                  <th className="py-3 px-5">Audit Points</th>
                  <th className="py-3 px-5">Jurisdiction Role</th>
                  <th className="py-3 px-5 text-right">Official Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                    <td
                      onClick={() => setSelectedUserId(u.id)}
                      className="py-3.5 px-5 font-bold text-slate-900 dark:text-white cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0066cc] dark:bg-[#2997ff] text-white dark:text-black flex items-center justify-center font-bold text-xs shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                          {u.name?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-normal">{u.department || 'Gujarat R&B'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 font-mono">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 font-medium">
                      Level {u.currentLevel} • {LEVEL_TITLES[u.currentLevel] || 'Junior Engineer'}
                    </td>
                    <td className="py-3.5 px-5 font-bold font-mono text-primary-600 dark:text-primary-400">
                      {u.totalPoints || 0} pts
                    </td>
                    <td className="py-3.5 px-5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="input-field text-xs py-1 px-2.5 !w-auto cursor-pointer font-semibold rounded-full"
                      >
                        {Object.entries(USER_ROLES).map(([r, info]) => (
                          <option key={r} value={r}>
                            {info.label} ({r})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedUserId(u.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-primary-500 hover:text-white text-slate-600 dark:text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Public Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Public Profile Modal */}
      <AnimatePresence>
        {selectedUserId && (
          <PublicUserProfileModal
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
