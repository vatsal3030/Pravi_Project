// ============================================
// ProfilePage — Officer Identity & Jurisdiction
// Apple Design System: SF Pro typography, capsule stats,
// assigned operations, security and credentials
// ============================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Shield, Mail, Phone, Building2, MapPin,
  Award, Flame, Zap, CheckCircle2, Clock, Wrench,
  Key, RefreshCw, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import { USER_ROLES } from '../lib/constants';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState(user);
  const [badges, setBadges] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [phone, setPhone] = useState(user?.phone || '+91 98250 12345');
  const [department, setDepartment] = useState(user?.department || 'Roads & Buildings Dept, Gujarat');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfileStats = async () => {
      setLoading(true);
      try {
        const [userRes, woRes] = await Promise.all([
          api.get('/users/me'),
          api.get(`/work-orders?limit=5`),
        ]);
        if (userRes.data?.data) {
          setProfileData(userRes.data.data);
          setPhone(userRes.data.data.phone || '+91 98250 12345');
          setDepartment(userRes.data.data.department || 'Roads & Buildings Dept, Gujarat');
          setBadges(userRes.data.data.badges || []);
        }
        setAssignedOrders(woRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileStats();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', { phone, department });
      toast.success('Officer profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const roleInfo = USER_ROLES[profileData?.role] || USER_ROLES.ADMIN;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0066cc] to-[#0052a3] text-white flex items-center justify-center text-3xl font-bold shadow-lg">
              {profileData?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {profileData?.name}
                </h1>
                <span className="badge badge-info">
                  {roleInfo.label}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                {department}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Ahmedabad Circle & Gandhinagar Division, Gujarat
              </p>
            </div>
          </div>

          {/* Quick Point Score */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-around sm:justify-end bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/10">
            <div className="text-center px-3">
              <span className="text-xs text-slate-400 block uppercase font-medium">Rank Tier</span>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                Level {profileData?.currentLevel || 4}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
            <div className="text-center px-3">
              <span className="text-xs text-slate-400 block uppercase font-medium">Points</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {profileData?.totalPoints || 2840}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
            <div className="text-center px-3">
              <span className="text-xs text-slate-400 block uppercase font-medium">Streak</span>
              <span className="text-lg font-bold text-amber-500 flex items-center gap-1 justify-center">
                <Flame className="w-4 h-4" /> {profileData?.currentStreak || 14}d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Info Form & Active Work Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Officer Information Form */}
        <div className="lg:col-span-1 glass-card p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-3">
            <User className="w-4 h-4 text-primary-500" />
            Officer Credentials
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Official Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={profileData?.email || ''}
                  disabled
                  className="input-field pl-9 bg-slate-100 dark:bg-white/5 cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Department & Circle
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Security Role
              </label>
              <input
                type="text"
                value={profileData?.role || 'ADMIN'}
                disabled
                className="input-field bg-slate-100 dark:bg-white/5 cursor-not-allowed opacity-80 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full text-xs py-2 mt-2 flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Assigned Operations & Badges */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Work Orders */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-3">
              <Wrench className="w-4 h-4 text-primary-500" />
              Assigned Field Operations ({assignedOrders.length})
            </h2>

            <div className="space-y-2.5">
              {assignedOrders.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No active operations assigned
                </p>
              ) : (
                assignedOrders.map((wo) => (
                  <div
                    key={wo.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">
                          {wo.orderCode}
                        </span>
                        <span className={`badge ${
                          wo.priority === 'CRITICAL' ? 'badge-danger' :
                          wo.priority === 'HIGH' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {wo.priority}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1 truncate">
                        {wo.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        Asset: {wo.asset?.name || 'Municipal Infrastructure'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[11px] font-semibold ${
                        wo.status === 'COMPLETED' ? 'text-emerald-500' :
                        wo.status === 'IN_PROGRESS' ? 'text-blue-500' : 'text-amber-500'
                      }`}>
                        {wo.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Earned Engineering Badges */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-3">
              <Award className="w-4 h-4 text-amber-500" />
              Earned RnB Department Badges
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Bridge Builder', icon: '🌉', desc: '25 Bridge Inspections' },
                { name: 'Road Warrior', icon: '🛣️', desc: '50 Road Assessments' },
                { name: 'First Light', icon: '🔍', desc: 'Initial Audit Complete' },
                { name: 'On Fire', icon: '🔥', desc: '14-Day Inspection Streak' },
              ].map((b, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-center"
                >
                  <span className="text-2xl block mb-1">{b.icon}</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{b.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
