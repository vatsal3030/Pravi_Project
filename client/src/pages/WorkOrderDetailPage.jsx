// ============================================
// Work Order Detail Page — InfraVault R&B Gujarat
// Detailed inspection task view, target asset GIS integration,
// verified engineer credentials, financials, and lifecycle management
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, ArrowLeft, Calendar, User, MapPin,
  AlertTriangle, CheckCircle2, Clock, Shield, DollarSign,
  Map, Wrench, Edit3, Trash2, ExternalLink, Check,
  Activity, ArrowUpRight, Loader2, Sparkles, Building2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api, { invalidateApiCache } from '../lib/api';
import useAuthStore from '../store/authStore';
import { ASSET_CATEGORIES, WORK_ORDER_PRIORITIES, CONDITION_RATINGS } from '../lib/constants';

const STATUS_CONFIGS = {
  OPEN: {
    label: 'Open / Queued',
    color: '#64748b',
    bg: 'rgba(100,116,139,0.12)',
    badgeClass: 'badge-secondary',
    description: 'Work order dispatched and queued for field execution',
  },
  IN_PROGRESS: {
    label: 'In Progress (Active Work)',
    color: '#d97706',
    bg: 'rgba(217,119,6,0.14)',
    badgeClass: 'badge-warning',
    description: 'Engineering personnel deployed on-site conducting active repairs',
  },
  COMPLETED: {
    label: 'Completed (Verified)',
    color: '#16a34a',
    bg: 'rgba(22,163,74,0.14)',
    badgeClass: 'badge-success',
    description: 'Repairs completed, inspected, and verified according to R&B standards',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#dc2626',
    bg: 'rgba(220,38,38,0.12)',
    badgeClass: 'badge-danger',
    description: 'Work order decommissioned or merged into another project',
  },
};

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchWorkOrder = async () => {
    try {
      const res = await api.get(`/work-orders/${id}`);
      setWorkOrder(res.data.data);
    } catch (err) {
      toast.error('Failed to load work order details');
      navigate('/work-orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrder();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!workOrder || workOrder.status === newStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await api.put(`/work-orders/${workOrder.id}`, { status: newStatus });
      setWorkOrder(res.data.data);
      invalidateApiCache();
      toast.success(`Status updated to ${STATUS_CONFIGS[newStatus]?.label || newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/work-orders/${workOrder.id}`);
      invalidateApiCache();
      toast.success('Work order deleted successfully');
      navigate('/work-orders');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete work order');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="skeleton w-40 h-8 rounded-full" />
        <div className="glass-card p-6 space-y-4">
          <div className="skeleton w-1/3 h-8 rounded-lg" />
          <div className="skeleton w-2/3 h-4 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="skeleton h-32 rounded-xl" />
            <div className="skeleton h-32 rounded-xl" />
            <div className="skeleton h-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!workOrder) return null;

  const priority = WORK_ORDER_PRIORITIES[workOrder.priority] || WORK_ORDER_PRIORITIES.MEDIUM;
  const statusConfig = STATUS_CONFIGS[workOrder.status] || STATUS_CONFIGS.OPEN;
  const asset = workOrder.asset;
  const assignee = workOrder.assignedTo;
  const creator = workOrder.createdBy;

  const canEdit = user?.role === 'ADMIN' || user?.id === workOrder.createdById || user?.id === workOrder.assigneeId;
  const canDelete = user?.role === 'ADMIN' || user?.id === workOrder.createdById;

  const costVariance = workOrder.actualCost && workOrder.estimatedCost
    ? workOrder.actualCost - workOrder.estimatedCost
    : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Button & Code Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/work-orders')}
          className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Work Orders
        </button>

        <div className="flex items-center gap-2">
          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
              title="Soft-delete work order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => setShowEditModal(true)}
              className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
              Update Notes & Cost
            </button>
          )}
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="glass-card p-6 border-l-4" style={{ borderLeftColor: priority.color }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                {workOrder.orderCode}
              </span>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: `${priority.color}18`, color: priority.color }}
              >
                {priority.label} Priority
              </span>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
                style={{ background: statusConfig.bg, color: statusConfig.color }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: statusConfig.color }} />
                {statusConfig.label}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              {workOrder.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              {workOrder.description || 'No additional scope notes provided.'}
            </p>
          </div>

          {/* Quick Status Stepper Pill Box */}
          <div className="shrink-0 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Operational Status
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(STATUS_CONFIGS).map(([key, cfg]) => {
                const isActive = workOrder.status === key;
                return (
                  <button
                    key={key}
                    disabled={updatingStatus}
                    onClick={() => handleStatusChange(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'text-white shadow-xs'
                        : 'bg-white dark:bg-[#1c1c1e] text-slate-600 dark:text-slate-300 hover:border-amber-500 border border-black/5 dark:border-white/10'
                    }`}
                    style={isActive ? { background: cfg.color } : {}}
                  >
                    {isActive ? <Check className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />}
                    <span>{cfg.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Target Asset & Financials) + Right Column (Personnel & Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 spans on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Infrastructure Asset Card */}
          {asset ? (
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{ASSET_CATEGORIES[asset.category]?.icon || '🏛️'}</span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Target Infrastructure Asset
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Civil structure undergoing this maintenance intervention
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/map?focusAssetId=${asset.id}`)}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Map className="w-3.5 h-3.5" />
                    Focus on GIS Map
                  </button>
                  <Link
                    to={`/assets/${asset.id}`}
                    className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <span>Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Asset Name & Code</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{asset.name}</p>
                  <p className="font-mono text-xs text-amber-600 dark:text-amber-400 font-semibold">{asset.assetCode}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Structural Health Score</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${asset.conditionScore || 80}%`,
                          background: asset.conditionScore > 75 ? '#16a34a' : asset.conditionScore > 50 ? '#d97706' : '#dc2626',
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                      {asset.conditionScore || 80}/100
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Rating: {CONDITION_RATINGS[asset.conditionRating]?.label || 'Good Condition'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Geographical Location</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
                    <span>{asset.address || 'Ahmedabad Municipal Region, Gujarat'}</span>
                  </p>
                  {asset.latitude && asset.longitude && (
                    <p className="text-[11px] font-mono text-slate-500">
                      GPS: {asset.latitude.toFixed(4)}° N, {asset.longitude.toFixed(4)}° E
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jurisdiction / Circle</span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {asset.zone || 'R&B Circle'} {asset.ward ? `• ${asset.ward}` : ''}
                  </p>
                  <p className="text-[11px] text-slate-500">Criticality Tier: Level {asset.criticality || 4} of 5</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 text-center text-slate-400 text-xs">
              No target asset associated with this order.
            </div>
          )}

          {/* Financials & Timeline Breakdown */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Financial Expenditure & Schedule
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Estimated Budget</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  ₹{(workOrder.estimatedCost || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Actual Incurred</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {workOrder.actualCost ? `₹${workOrder.actualCost.toLocaleString('en-IN')}` : 'Pending billing'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Due Date</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  {workOrder.dueDate ? format(new Date(workOrder.dueDate), 'dd MMM yyyy') : 'Open timeline'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Resolution Status</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {workOrder.completedAt ? 'Work Order Closed' : 'In Field Execution'}
                </p>
              </div>
            </div>

            {costVariance !== null && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                costVariance <= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}>
                <span>Budget Variance:</span>
                <span className="font-bold font-mono">
                  {costVariance <= 0
                    ? `Saved ₹${Math.abs(costVariance).toLocaleString('en-IN')} vs budget`
                    : `Over-budget by ₹${costVariance.toLocaleString('en-IN')}`
                  }
                </span>
              </div>
            )}
          </div>

          {/* Engineering Notes & Field Directives */}
          {workOrder.notes && (
            <div className="glass-card p-6 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                Engineering Field Directives & Notes
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-black/[0.02] dark:bg-white/[0.02] p-4 rounded-xl border border-black/5 dark:border-white/10 font-mono">
                {workOrder.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Verified Personnel & Audit Trail */}
        <div className="space-y-6">
          {/* Assigned Engineer Profile Card */}
          <div className="glass-card p-6 space-y-4 border-t-4 border-amber-600">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Assigned Officer
              </span>
              <span className="badge badge-success text-[10px] font-bold">
                Verified Personnel
              </span>
            </div>

            {assignee ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-amber-500/20 shrink-0">
                    {assignee.name?.charAt(0) || 'A'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {assignee.name}
                    </h3>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      {assignee.role === 'ADMIN' ? 'Executive Engineer' : 'Field Inspector'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {assignee.department || 'Gujarat R&B Department'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/5 dark:border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Officer Email:</span>
                    <span className="font-mono text-slate-900 dark:text-slate-200">{assignee.email}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Inspection Rank Score:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{assignee.totalPoints || 0} pts</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs">
                No engineer assigned. Work orders must be assigned to verified personnel.
              </div>
            )}
          </div>

          {/* Creation & Authorization Audit */}
          <div className="glass-card p-6 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Department Audit Trail
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Dispatched by {creator?.name || 'Department Administrator'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {workOrder.createdAt ? format(new Date(workOrder.createdAt), 'dd MMM yyyy, hh:mm a') : 'Recently'}
                  </p>
                </div>
              </div>

              {workOrder.startedAt && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Field Execution Initiated
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {format(new Date(workOrder.startedAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                </div>
              )}

              {workOrder.completedAt && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Repairs Verified & Closed
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {format(new Date(workOrder.completedAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Notes & Cost Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditWorkOrderModal
            workOrder={workOrder}
            onClose={() => setShowEditModal(false)}
            onUpdated={(updated) => {
              setWorkOrder(updated);
              setShowEditModal(false);
              invalidateApiCache();
              toast.success('Work order updated');
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-sm w-full p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Work Order?</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                This will soft-delete work order <span className="font-mono font-bold">{workOrder.orderCode}</span>. This action is recorded in the departmental audit log.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Modal for editing Notes & Actual Cost
function EditWorkOrderModal({ workOrder, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(workOrder.notes || '');
  const [actualCost, setActualCost] = useState(workOrder.actualCost || '');
  const [priority, setPriority] = useState(workOrder.priority);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/work-orders/${workOrder.id}`, {
        notes,
        actualCost: actualCost ? parseFloat(actualCost) : null,
        priority,
      });
      onUpdated(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update work order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card max-w-md w-full p-6 space-y-4 shadow-2xl"
      >
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Update Work Order Directives
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input-field text-xs py-2 font-semibold"
            >
              {Object.entries(WORK_ORDER_PRIORITIES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Actual Incurred Cost (₹)
            </label>
            <input
              type="number"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
              placeholder="e.g., 95000"
              className="input-field text-xs py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Engineering Directives & Field Notes
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter site observations, contractor instructions, or completion remarks..."
              className="input-field text-xs py-2"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/10">
            <button type="button" onClick={onClose} className="btn-ghost text-xs">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
