// ============================================
// Leaderboard Page — RnB Department Officer Rankings & Gamification
// High-contrast, theme-adaptive, cached fast loading
// ============================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Medal, Star, Flame, Target, Crown,
  TrendingUp, Award, RefreshCw
} from 'lucide-react';
import { cachedGet, invalidateApiCache } from '../lib/api';
import useAuthStore from '../store/authStore';
import { LEVEL_TITLES, LEVEL_THRESHOLDS } from '../lib/constants';

const RANK_STYLES = [
  { bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-400/40', icon: Crown, color: '#d97706', label: '1st Rank' },
  { bg: 'from-slate-400/15 to-slate-500/5', border: 'border-slate-400/30', icon: Medal, color: '#64748b', label: '2nd Rank' },
  { bg: 'from-orange-500/15 to-amber-700/5', border: 'border-orange-500/30', icon: Award, color: '#c2410c', label: '3rd Rank' },
];

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await cachedGet('/dashboard/leaderboard', {}, 20);
      setLeaderboard(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const myRank = leaderboard.findIndex((u) => u.id === user?.id) + 1;
  const currentLevel = user?.currentLevel || 1;
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const prevThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const progress = nextThreshold > prevThreshold
    ? ((user?.totalPoints || 0) - prevThreshold) / (nextThreshold - prevThreshold) * 100
    : 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            Field Engineer Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Audit milestones, inspection velocity, and civil infrastructure recognition
          </p>
        </div>

        <button
          onClick={() => { invalidateApiCache(); fetchData(); }}
          title="Refresh rankings"
          className="btn-ghost p-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* My Stats Banner */}
      <div className="glass-card p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-600/5">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-2xl font-bold text-white shadow-md">
                {user?.name?.charAt(0) || 'E'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border-2 border-amber-600 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400">
                L{currentLevel}
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{user?.name}</h3>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {LEVEL_TITLES[currentLevel] || 'Junior Engineer'}
              </p>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
              <Trophy className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900 dark:text-white">{user?.totalPoints || 0}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Total Points</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
              <Target className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900 dark:text-white">#{myRank || '—'}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Division Rank</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
              <Flame className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900 dark:text-white">{user?.currentStreak || 0}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Audit Streak</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
              <Star className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900 dark:text-white">{user?.longestStreak || 0}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Peak Streak</p>
            </div>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Rank Advancement: Level {currentLevel} ({LEVEL_TITLES[currentLevel]})
            </span>
            <span className="font-mono text-slate-500 dark:text-slate-400">
              {user?.totalPoints || 0} / {nextThreshold} Pts
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Podium Top 3 */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 0, 2].map((rankIdx) => {
            const person = leaderboard[rankIdx];
            if (!person) return null;
            const style = RANK_STYLES[rankIdx];
            const Icon = style.icon;
            const isMe = person.id === user?.id;

            return (
              <div
                key={person.id}
                className={`glass-card p-5 text-center bg-gradient-to-b ${style.bg} border ${style.border} ${
                  rankIdx === 0 ? 'md:-mt-3 shadow-md' : ''
                } ${isMe ? 'ring-2 ring-amber-500' : ''}`}
              >
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white"
                  style={{ background: style.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: style.color }}>
                  {style.label}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{person.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  {LEVEL_TITLES[person.currentLevel] || 'Engineer'}
                </p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {person.totalPoints} pts
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Department Personnel Standings
          </h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {leaderboard.map((person, idx) => (
            <div
              key={person.id}
              className={`p-3.5 flex items-center justify-between gap-4 transition-colors ${
                person.id === user?.id
                  ? 'bg-amber-50/60 dark:bg-amber-950/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-xs font-bold text-slate-400 font-mono">
                  #{idx + 1}
                </span>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {person.name?.charAt(0) || 'E'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {person.name}
                    {person.id === user?.id && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {LEVEL_TITLES[person.currentLevel] || 'Junior Engineer'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {person.totalPoints}
                </span>
                <span className="text-[10px] text-slate-400 block">points</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
