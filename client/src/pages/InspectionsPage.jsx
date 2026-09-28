// ============================================
// Inspections Page — Field Audits & Condition Scoring
// Strict semantic color coding (Green = Excellent/Good, Yellow = Fair, Red = Critical)
// High-contrast, theme-adaptive, fast cached loading
// ============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon, Plus, X, Loader2, Star, Zap,
  TrendingDown, TrendingUp, Minus, ChevronRight, RefreshCw,
  ClipboardCheck, Calendar, User
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api, { cachedGet, invalidateApiCache } from '../lib/api';
import useAuthStore from '../store/authStore';
import { ASSET_CATEGORIES, CONDITION_RATINGS } from '../lib/constants';
import { TableSkeleton } from '../components/shared/Skeletons';

export default function InspectionsPage() {
  const { user } = useAuthStore();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const res = await cachedGet('/inspections?limit=50', {}, 20);
      setInspections(res.data.data || []);
    } catch {
      toast.error('Failed to load inspections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const canCreate = ['ADMIN', 'INSPECTOR'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            Field Infrastructure Audits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Routine civil audits, structural safety evaluations, and condition score ratings ({inspections.length} recorded)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { invalidateApiCache(); fetchInspections(); }}
            title="Refresh inspection records"
            className="btn-ghost p-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Conduct Field Audit
            </button>
          )}
        </div>
      </div>

      {/* Inspection List Table or Skeleton */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : inspections.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <SearchIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">
            No inspection audits recorded
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Conduct your first field audit to record condition rating and earn engineer points
          </p>
          {canCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Start Inspection
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map((ins, i) => {
            const condition = CONDITION_RATINGS[ins.conditionRating];
            const cat = ASSET_CATEGORIES[ins.asset?.category];

            return (
              <motion.div
                key={ins.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card glass-card-hover p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-xs"
                    style={{
                      background: `${condition?.color}18`,
                      color: condition?.color,
                      border: `1px solid ${condition?.color}40`,
                    }}
                  >
                    {ins.conditionScore}%
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {ins.asset?.name || 'Infrastructure Asset'}
                      </span>
                      <span
                        className="badge text-[10px]"
                        style={{
                          background: `${condition?.color}15`,
                          color: condition?.color,
                          border: `1px solid ${condition?.color}40`,
                        }}
                      >
                        {condition?.label || ins.conditionRating}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="font-mono text-[11px]">{ins.asset?.assetCode}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {ins.inspector?.name || 'Site Engineer'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {format(new Date(ins.inspectedAt), 'dd MMM yyyy')}
                      </span>
                    </div>

                    {ins.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-1 italic bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                        "{ins.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    +50 Pts Awarded
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Inspection Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateInspectionModal
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              invalidateApiCache();
              fetchInspections();
              toast.success('Inspection record logged (+50 points earned)');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateInspectionModal({ onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    assetId: '',
    conditionScore: 75,
    notes: '',
  });

  useEffect(() => {
    cachedGet('/assets?limit=100', {}, 30).then((res) => {
      setAssets(res.data.data || []);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assetId) {
      toast.error('Select an asset to inspect');
      return;
    }
    setLoading(true);
    try {
      await api.post('/inspections', {
        ...form,
        conditionScore: parseInt(form.conditionScore),
      });
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit inspection');
    } finally {
      setLoading(false);
    }
  };

  const getRatingFromScore = (score) => {
    if (score >= 80) return { label: 'EXCELLENT', color: '#15803d' };
    if (score >= 60) return { label: 'GOOD', color: '#16a34a' };
    if (score >= 40) return { label: 'FAIR', color: '#ca8a04' };
    if (score >= 20) return { label: 'POOR', color: '#ea580c' };
    return { label: 'CRITICAL', color: '#dc2626' };
  };

  const rating = getRatingFromScore(form.conditionScore);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-md p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Log Field Audit Record
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Asset *
            </label>
            <select
              value={form.assetId}
              onChange={(e) => setForm({ ...form, assetId: e.target.value })}
              required
              className="input-field text-xs py-2 cursor-pointer font-medium"
            >
              <option value="">Choose asset...</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetCode} — {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Condition Rating Score
              </label>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ background: `${rating.color}15`, color: rating.color }}
              >
                {form.conditionScore}% — {rating.label}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={form.conditionScore}
              onChange={(e) => setForm({ ...form, conditionScore: e.target.value })}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Site Inspection Observations & Defects
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g., Minor surface hairline cracks observed along longitudinal joint. Drainage clear."
              rows={3}
              className="input-field text-xs py-2 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} className="btn-ghost text-xs">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit Audit & Earn Pts
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
