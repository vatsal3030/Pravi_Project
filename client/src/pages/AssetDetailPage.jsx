// ============================================
// Asset Detail Page — Apple Design System
// Full asset view with tabs, GIS map focus deep-linking,
// RBAC creator ownership enforcement, and soft-delete/edit modal
// ============================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Edit3, Trash2, MapPin, Calendar, DollarSign,
  AlertTriangle, Activity, ClipboardList, Search as SearchIcon,
  Wrench, Shield, Clock, ChevronRight, X, Lock,
  ExternalLink, Check, Navigation, AlertCircle, Save, RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api, { cachedGet, invalidateApiCache } from '../lib/api';
import useAuthStore from '../store/authStore';
import {
  ASSET_CATEGORIES, ASSET_STATUSES, CONDITION_RATINGS
} from '../lib/constants';
import Breadcrumbs from '../components/shared/Breadcrumbs';
import { DetailSkeleton } from '../components/shared/Skeletons';

// ── Edit Asset Modal ────────────────────────
function EditAssetModal({ asset, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    name: asset.name,
    description: asset.description || '',
    address: asset.address || '',
    ward: asset.ward || '',
    zone: asset.zone || '',
    purchaseCost: asset.purchaseCost || 0,
    criticality: asset.criticality || 3,
    conditionScore: asset.conditionScore || 80,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/assets/${asset.id}`, formData);
      invalidateApiCache();
      toast.success('Asset updated successfully');
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-[#1c1c1e] rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-black/10 dark:border-white/10"
      >
        <div className="flex items-center justify-between mb-4 border-b border-black/5 dark:border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Edit Infrastructure Asset
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{asset.assetCode}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Asset Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Address / Location
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Ward & Zone
              </label>
              <input
                type="text"
                value={formData.ward}
                placeholder="e.g. Ward 12, West Zone"
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Purchase Cost (₹)
              </label>
              <input
                type="number"
                value={formData.purchaseCost}
                onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Condition (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.conditionScore}
                onChange={(e) => setFormData({ ...formData, conditionScore: e.target.value })}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Criticality (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.criticality}
                onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-black/5 dark:border-white/10">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 text-xs py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Delete Confirmation Modal ────────────────
function DeleteModal({ asset, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/assets/${asset.id}`);
      invalidateApiCache();
      toast.success('Asset soft-deleted successfully');
      onDeleted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-[#1c1c1e] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-black/10 dark:border-white/10"
      >
        <div className="flex items-center gap-3 mb-3 text-red-500">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Soft-Delete Infrastructure Asset
            </h3>
            <p className="text-xs text-slate-400 font-mono">{asset.assetCode}</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
          Are you sure you want to soft-delete <strong>{asset.name}</strong>? It will be archived and hidden from the active GIS map and catalog while preserving complete audit logs.
        </p>

        <div className="flex gap-2.5">
          <button type="button" onClick={onClose} className="btn-ghost flex-1 text-xs py-2">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="btn-primary !bg-red-600 hover:!bg-red-700 flex-1 text-xs py-2 text-white flex items-center justify-center gap-1.5"
          >
            {loading ? 'Deleting...' : 'Confirm Soft Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Update Lifecycle Status Modal ─────────────
function UpdateLifecycleModal({ asset, onClose, onUpdated }) {
  const [toStatus, setToStatus] = useState(asset.status);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!toStatus) return;
    setLoading(true);
    try {
      const res = await api.post(`/assets/${asset.id}/lifecycle`, {
        toStatus,
        notes: notes.trim() || `Lifecycle status transitioned to ${toStatus}`,
      });
      toast.success('Lifecycle audit trail updated successfully');
      invalidateApiCache();
      onUpdated(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update lifecycle status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-[#1c1c1e] rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-black/10 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Update Lifecycle Status & Audit
              </h3>
              <p className="text-xs text-slate-400 font-mono">{asset.assetCode} • {asset.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Operational Status
            </label>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: ASSET_STATUSES[asset.status]?.color || '#888' }} />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {ASSET_STATUSES[asset.status]?.label || asset.status}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              New Lifecycle Status Target *
            </label>
            <select
              value={toStatus}
              onChange={(e) => setToStatus(e.target.value)}
              className="input-field text-xs py-2 w-full font-semibold cursor-pointer"
              required
            >
              {Object.entries(ASSET_STATUSES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Transition Reason & Field Notes *
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Asset scheduled for preventive overhaul; monsoon drainage readiness inspection passed; bridge bearing replaced."
              className="input-field text-xs py-2 w-full resize-none"
              required
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 text-xs py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1.5 shadow-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Save to Audit Trail
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Lifecycle Timeline ──────────────────────
function LifecycleTimeline({ events }) {
  if (!events || events.length === 0) {
    return <p className="text-xs text-slate-400 text-center py-6">No lifecycle events recorded</p>;
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-slate-200 dark:bg-white/10" />

      <div className="space-y-3.5">
        {events.map((event, i) => {
          const status = ASSET_STATUSES[event.toStatus];
          return (
            <div key={event.id} className="relative">
              <div
                className="absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-[#1c1c1e] shadow-xs"
                style={{ background: status?.color || '#0066cc' }}
              />
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 ml-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {event.fromStatus && (
                      <>
                        <span className="text-xs text-slate-400">{ASSET_STATUSES[event.fromStatus]?.label}</span>
                        <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                      </>
                    )}
                    <span className="text-xs font-semibold" style={{ color: status?.color }}>
                      {status?.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {formatDistanceToNow(new Date(event.changedAt), { addSuffix: true })}
                  </span>
                </div>
                {event.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{event.notes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Asset Detail Page ──────────────────
export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLifecycleModal, setShowLifecycleModal] = useState(false);

  const fetchAsset = async () => {
    try {
      const res = await cachedGet(`/assets/${id}`, {}, 20);
      setAsset(res.data.data);
    } catch (err) {
      toast.error('Asset not found');
      navigate('/assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsset();
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (!asset) return null;

  const cat = ASSET_CATEGORIES[asset.category];
  const status = ASSET_STATUSES[asset.status];
  const condition = CONDITION_RATINGS[asset.conditionRating];

  // RBAC Ownership: Creator or Administrator only
  const isCreatorOrAdmin = user?.role === 'ADMIN' || asset.createdById === user?.id;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'lifecycle', label: 'Lifecycle Audit', icon: Clock },
    { id: 'workorders', label: 'Work Orders', icon: ClipboardList, count: asset._count?.workOrders },
    { id: 'inspections', label: 'Inspections', icon: SearchIcon, count: asset._count?.inspections },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, count: asset._count?.maintenanceRecords },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Site-Wide Breadcrumbs */}
      <Breadcrumbs extra={asset.name} />

      {/* Header + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/assets')}
            className="p-2 rounded-full border border-black/10 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
            title="Back to Assets Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl p-1.5 rounded-xl bg-slate-100 dark:bg-white/10">{cat?.icon}</span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {asset.name}
              </h1>
              <span className="badge badge-info text-xs">
                {cat?.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 ml-10">
              {asset.assetCode}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Direct Focus on GIS Map Feature */}
          {asset.latitude && asset.longitude && (
            <button
              onClick={() => navigate(`/map?focusId=${asset.id}&lat=${asset.latitude}&lng=${asset.longitude}`)}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Navigate directly to asset GPS coordinates on GIS map"
            >
              <Navigation className="w-3.5 h-3.5" />
              Focus on GIS Map
            </button>
          )}

          {/* Edit / Soft-Delete based on RBAC & Ownership */}
          {isCreatorOrAdmin ? (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5"
                title="Edit asset details (Owner/Admin privileges)"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                Edit Asset
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-ghost text-xs py-2 px-3 text-red-600 hover:!bg-red-50 dark:hover:!bg-red-950/30 border-red-200 dark:border-red-900/40 flex items-center gap-1.5"
                title="Soft delete asset (Owner/Admin privileges)"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                Archive
              </button>
            </>
          ) : (
            <div
              className="flex items-center gap-1.5 text-xs text-slate-400 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10"
              title="Only the creator or Administrator can edit or archive this record"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Owner Protected</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1">Status</p>
            <span
              className="badge"
              style={{ background: `${status?.color}15`, color: status?.color, border: `1px solid ${status?.color}30` }}
            >
              {status?.label}
            </span>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1">Condition Score</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `${condition?.color}15`, color: condition?.color }}>
                {asset.conditionScore}
              </div>
              <span className="text-xs font-medium" style={{ color: condition?.color }}>{condition?.label}</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1">Risk Score</p>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className={`w-4 h-4 ${asset.riskScore > 60 ? 'text-red-500' : asset.riskScore > 30 ? 'text-amber-500' : 'text-emerald-500'}`} />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{asset.riskScore?.toFixed(0)}/100</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1">Criticality</p>
            <span className="text-xs font-bold text-amber-500">Tier {asset.criticality || 3} of 5</span>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1">Capital Value</p>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              ₹{(asset.purchaseCost || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1">Jurisdiction</p>
            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 truncate">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{asset.ward || 'Ahmedabad Circle'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-black/5 dark:border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0066cc] dark:bg-[#2997ff] text-white dark:text-black shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.count > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/20 text-[10px]">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                {/* Description */}
                <div className="glass-card p-5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Description</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {asset.description || 'No description provided.'}
                  </p>
                </div>

                {/* Location with Google Maps deep link */}
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Geospatial Location</h3>
                    {asset.latitude && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${asset.latitude},${asset.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                      >
                        Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Address</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{asset.address || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Coordinates</span>
                      <p className="font-mono text-slate-800 dark:text-slate-200">
                        {asset.latitude ? `${asset.latitude.toFixed(4)}, ${asset.longitude.toFixed(4)}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Ward</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{asset.ward || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Zone</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{asset.zone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator & Ownership Sidebar */}
              <div className="space-y-5">
                <div className="glass-card p-5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Asset Ownership & RBAC</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                      {asset.createdBy?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{asset.createdBy?.name}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{asset.createdBy?.role?.toLowerCase() || 'Engineer'}</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[11px] text-slate-500">
                    {isCreatorOrAdmin
                      ? '✓ You have full author/administrator authority to update or archive this asset.'
                      : '🔒 Record is protected. Only the creator or system admin can modify details.'}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> Financial Valuation
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Procurement Cost:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">₹{(asset.purchaseCost || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Installation Cost:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">₹{(asset.installCost || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Accumulated Maint.:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">₹{(asset.totalMaintCost || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lifecycle' && (
            <div className="glass-card p-6 max-w-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-black/5 dark:border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Complete Audit Trail</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Chronological record of operational transitions & condition checks</p>
                </div>
                {isCreatorOrAdmin && (
                  <button
                    onClick={() => setShowLifecycleModal(true)}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Update Status</span>
                  </button>
                )}
              </div>
              <LifecycleTimeline events={asset.lifecycleEvents} />
            </div>
          )}

          {activeTab === 'workorders' && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Active & Historical Work Orders</h3>
              {asset.workOrders?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No work orders recorded for this asset</p>
              ) : (
                <div className="space-y-2.5">
                  {asset.workOrders?.map((wo) => (
                    <div
                      key={wo.id}
                      onClick={() => navigate(`/work-orders/${wo.id}`)}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-amber-500 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400 font-bold">{wo.orderCode}</span>
                          <span className="badge badge-warning text-[10px]">{wo.priority}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1 group-hover:text-amber-600 transition-colors">
                          {wo.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-amber-600 dark:text-amber-400">{wo.status}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'inspections' && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Field Inspections</h3>
              {asset.inspections?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No inspections recorded</p>
              ) : (
                <div className="space-y-2.5">
                  {asset.inspections?.map((ins) => (
                    <div key={ins.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          Condition Rating: {ins.conditionRating} (Score: {ins.conditionScore}/100)
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">By {ins.inspector?.name} • {format(new Date(ins.inspectedAt), 'dd MMM yyyy')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditAssetModal
            asset={asset}
            onClose={() => setShowEditModal(false)}
            onUpdated={() => {
              setShowEditModal(false);
              fetchAsset();
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal
            asset={asset}
            onClose={() => setShowDeleteModal(false)}
            onDeleted={() => {
              setShowDeleteModal(false);
              navigate('/assets');
            }}
          />
        )}
      </AnimatePresence>

      {/* Update Lifecycle Modal */}
      <AnimatePresence>
        {showLifecycleModal && (
          <UpdateLifecycleModal
            asset={asset}
            onClose={() => setShowLifecycleModal(false)}
            onUpdated={(updatedData) => {
              setShowLifecycleModal(false);
              fetchAsset();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
