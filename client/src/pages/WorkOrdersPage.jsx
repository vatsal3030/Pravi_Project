// ============================================
// Work Orders Page — RnB Department Maintenance & Repairs
// Strict semantic color coding (Green = Completed, Yellow = In Progress, Red = Critical)
// High-contrast, theme-adaptive, fast cached loading
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Plus, Search, Filter, X, Loader2,
  Calendar, User, AlertTriangle, Check, Clock, ChevronRight,
  RefreshCw, Wrench, ArrowUpRight, GripVertical
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api, { cachedGet, invalidateApiCache } from '../lib/api';
import useAuthStore from '../store/authStore';
import { ASSET_CATEGORIES, WORK_ORDER_PRIORITIES } from '../lib/constants';

// Strict Semantic Status Colors: Green (Success/Closed), Yellow/Amber (In Progress), Slate (Queued), Red (Cancelled)
const WO_STATUSES = {
  OPEN: { label: 'Open / Queued', color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'border-slate-300 dark:border-slate-700' },
  IN_PROGRESS: { label: 'In Progress (Active Work)', color: '#d97706', bg: 'rgba(217,119,6,0.14)', border: 'border-amber-400 dark:border-amber-600' },
  COMPLETED: { label: 'Completed (Verified)', color: '#16a34a', bg: 'rgba(22,163,74,0.14)', border: 'border-emerald-400 dark:border-emerald-600' },
  CANCELLED: { label: 'Cancelled', color: '#dc2626', bg: 'rgba(220,38,38,0.12)', border: 'border-rose-400 dark:border-rose-600' },
};

export default function WorkOrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const fetchWO = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      const res = await cachedGet(`/work-orders?${params.toString()}`, {}, 20);
      setWorkOrders(res.data.data || []);
    } catch {
      toast.error('Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWO();
  }, [filters]);

  const canCreate = ['ADMIN', 'INSPECTOR'].includes(user?.role);

  const statusGroups = Object.keys(WO_STATUSES);
  const grouped = statusGroups.reduce((acc, s) => {
    acc[s] = workOrders.filter(wo => wo.status === s);
    return acc;
  }, {});

  // Drag and drop status change handler
  const handleDropStatusChange = async (woId, newStatus) => {
    const currentWO = workOrders.find(w => w.id === woId);
    if (!currentWO || currentWO.status === newStatus) return;

    const previousStatus = currentWO.status;

    // Optimistic UI update
    setWorkOrders(prev =>
      prev.map(wo => (wo.id === woId ? { ...wo, status: newStatus } : wo))
    );

    try {
      await api.put(`/work-orders/${woId}`, { status: newStatus });
      invalidateApiCache();
      toast.success(`Task moved to ${WO_STATUSES[newStatus].label}`, {
        icon: '📋',
      });
    } catch (err) {
      // Rollback on failure
      setWorkOrders(prev =>
        prev.map(wo => (wo.id === woId ? { ...wo, status: previousStatus } : wo))
      );
      toast.error(err.response?.data?.error?.message || 'Failed to update task status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            RnB Maintenance Work Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Drag cards between columns to change operational status. Click any task to view full details. ({workOrders.length} active)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { invalidateApiCache(); fetchWO(); }}
            title="Refresh work orders"
            className="btn-ghost p-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Issue Work Order
            </button>
          )}
        </div>
      </div>

      {/* Filters Ribbon */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search work orders by title or code..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input-field pl-9 text-xs py-2"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="input-field text-xs py-2 !w-auto cursor-pointer font-semibold"
        >
          <option value="">All Statuses</option>
          {Object.entries(WO_STATUSES).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="input-field text-xs py-2 !w-auto cursor-pointer font-semibold"
        >
          <option value="">All Priorities</option>
          {Object.entries(WORK_ORDER_PRIORITIES).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Drag & Drop Kanban Multi-Column Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-3">
              <div className="skeleton w-28 h-5 rounded-md" />
              <div className="skeleton w-full h-24 rounded-xl" />
              <div className="skeleton w-full h-24 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {statusGroups.map((statusKey) => {
            const statusConfig = WO_STATUSES[statusKey];
            const orders = grouped[statusKey] || [];
            const isColumnOver = dragOverColumn === statusKey;

            return (
              <div
                key={statusKey}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDragEnter={() => setDragOverColumn(statusKey)}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setDragOverColumn(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedId = e.dataTransfer.getData('text/plain') || draggedTaskId;
                  if (droppedId) {
                    handleDropStatusChange(droppedId, statusKey);
                  }
                  setDragOverColumn(null);
                }}
                className={`space-y-3 p-2 rounded-2xl transition-all duration-200 min-h-[480px] ${
                  isColumnOver
                    ? 'ring-2 ring-amber-500 bg-amber-500/10 dark:bg-amber-500/15 shadow-lg'
                    : 'bg-black/[0.02] dark:bg-white/[0.02]'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-3 rounded-xl glass-card border border-black/5 dark:border-white/10 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusConfig.color }} />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {statusConfig.label}
                    </h3>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: statusConfig.bg, color: statusConfig.color }}
                  >
                    {orders.length}
                  </span>
                </div>

                {/* Drop Hint Badge when dragging */}
                {isColumnOver && (
                  <div className="py-2 text-center border-2 border-dashed border-amber-500/60 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold animate-pulse">
                    Drop to set status: {statusConfig.label}
                  </div>
                )}

                {/* Orders in Column */}
                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
                      <p className="text-xs text-slate-400 font-medium">No tasks in this lane</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Drag an order here</p>
                    </div>
                  ) : (
                    orders.map((wo) => {
                      const priority = WORK_ORDER_PRIORITIES[wo.priority];
                      const isBeingDragged = draggedTaskId === wo.id;

                      return (
                        <div
                          key={wo.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', wo.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggedTaskId(wo.id);
                          }}
                          onDragEnd={() => {
                            setDraggedTaskId(null);
                            setDragOverColumn(null);
                          }}
                          className={`
                            glass-card glass-card-hover p-4 space-y-3 border-l-4 transition-all duration-150 cursor-grab active:cursor-grabbing
                            ${isBeingDragged ? 'opacity-40 ring-2 ring-amber-500 scale-[0.98]' : ''}
                          `}
                          style={{ borderLeftColor: priority?.color || '#cbd5e1' }}
                        >
                          {/* Drag Handle & Top Metadata */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <GripVertical className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 block">
                                {wo.orderCode}
                              </span>
                            </div>
                            <span
                              className="text-[10.5px] font-bold px-1.5 py-0.5 rounded shadow-xs"
                              style={{
                                background: `${priority?.color}18`,
                                color: priority?.color,
                              }}
                            >
                              {priority?.label}
                            </span>
                          </div>

                          {/* Task Title (Clickable link to details) */}
                          <h4
                            onClick={() => navigate(`/work-orders/${wo.id}`)}
                            title="Click to view full work order details"
                            className="text-[13.5px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
                          >
                            {wo.title}
                          </h4>

                          {/* Associated Asset */}
                          {wo.asset && (
                            <div
                              onClick={() => navigate(`/assets/${wo.asset.id}`)}
                              title="View Target Asset"
                              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                            >
                              <span>{ASSET_CATEGORIES[wo.asset.category]?.icon || '🏛️'}</span>
                              <span className="truncate">{wo.asset.name}</span>
                            </div>
                          )}

                          {/* Bottom Row: Verified Assignee & View Details Button */}
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            {/* Verified Assigned Personnel Badge */}
                            <div className="flex items-center gap-1.5 max-w-[140px] truncate" title={`Assigned Engineer: ${wo.assignedTo?.name || 'Authorized Engineer'}`}>
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">
                                {wo.assignedTo?.name?.charAt(0) || 'E'}
                              </div>
                              <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                                {wo.assignedTo?.name || 'Staff Engineer'}
                              </span>
                            </div>

                            {/* View Details Link */}
                            <button
                              onClick={() => navigate(`/work-orders/${wo.id}`)}
                              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              Details <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Work Order Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateWorkOrderModal
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              invalidateApiCache();
              fetchWO();
              toast.success('Work order issued successfully');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Modal Component for Issuing Work Order
function CreateWorkOrderModal({ onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assetId: '',
    assignedToId: '',
    priority: 'MEDIUM',
    dueDate: '',
    estimatedCost: '',
  });

  useEffect(() => {
    const loadPrereqs = async () => {
      try {
        const [aRes, uRes] = await Promise.all([
          cachedGet('/assets?limit=100', {}, 30),
          cachedGet('/users', {}, 30),
        ]);
        setAssets(aRes.data.data || []);
        setUsers(uRes.data.data || []);
      } catch (e) {
        console.error('Failed to load modal data', e);
      }
    };
    loadPrereqs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assetId) {
      toast.error('Please select a target infrastructure asset');
      return;
    }
    if (!form.assignedToId) {
      toast.error('Please assign this task to an authorized engineer or inspector');
      return;
    }
    setLoading(true);
    try {
      await api.post('/work-orders', form);
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to issue work order');
    } finally {
      setLoading(false);
    }
  };

  const authorizedPersonnel = users.filter(u => u.role === 'INSPECTOR' || u.role === 'ADMIN');

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
        className="glass-card w-full max-w-lg p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Issue Maintenance Work Order
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Pothole patch & bituminous seal on East Span"
              required
              className="input-field text-xs py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Infrastructure Asset *
            </label>
            <select
              value={form.assetId}
              onChange={(e) => setForm({ ...form, assetId: e.target.value })}
              required
              className="input-field text-xs py-2 cursor-pointer font-medium"
            >
              <option value="">Select Asset...</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetCode} — {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="input-field text-xs py-2 cursor-pointer font-semibold"
              >
                {Object.entries(WORK_ORDER_PRIORITIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign to Field Engineer / Inspector *
              </label>
              <select
                value={form.assignedToId}
                onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
                required
                className="input-field text-xs py-2 cursor-pointer font-semibold"
              >
                <option value="" disabled>-- Select Verified Personnel * --</option>
                {authorizedPersonnel.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role === 'ADMIN' ? 'Executive Engineer' : 'Field Inspector'} ({u.department || 'R&B Dept'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resolution Due Date
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Cost (₹)
              </label>
              <input
                type="number"
                value={form.estimatedCost}
                onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                placeholder="e.g., 85000"
                className="input-field text-xs py-2"
              />
            </div>
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
              Dispatch Work Order
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
