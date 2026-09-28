// ============================================
// Assets Page — Gujarat & Ahmedabad RnB Infrastructure Directory
// Apple Design System: SF Pro typography, Action Blue accents,
// GIS Map direct linking, instant cached retrieval, pagination
// ============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Package, Plus, Search, MapPin, Calendar,
  ChevronRight, X, Loader2, RefreshCw, Navigation,
  ChevronLeft, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api, { cachedGet, invalidateApiCache } from '../lib/api';
import useAuthStore from '../store/authStore';
import {
  ASSET_CATEGORIES, ASSET_STATUSES, CONDITION_RATINGS
} from '../lib/constants';
import { CardGridSkeleton } from '../components/shared/Skeletons';

export default function AssetsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '', category: '', status: '', page: 1,
  });

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      params.append('page', filters.page);
      params.append('limit', 12);

      const res = await cachedGet(`/assets?${params.toString()}`, {}, 20);
      setAssets(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [filters]);

  const canCreate = ['ADMIN', 'INSPECTOR'].includes(user?.role);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
              RnB Infrastructure Inventory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {pagination.total || 0} registered bridges, highways, pipelines, and municipal facilities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { invalidateApiCache(); fetchAssets(); }}
            title="Refresh assets catalog"
            className="btn-ghost p-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Register New Asset
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Ribbon */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by asset name, code, or address..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="input-field pl-9 text-xs py-2 rounded-full"
          />
        </div>

        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
          className="input-field text-xs py-2 !w-auto cursor-pointer font-medium rounded-full"
        >
          <option value="">All Categories</option>
          {Object.entries(ASSET_CATEGORIES).map(([key, val]) => (
            <option key={key} value={key}>{val.icon} {val.label}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          className="input-field text-xs py-2 !w-auto cursor-pointer font-medium rounded-full"
        >
          <option value="">All Statuses</option>
          {Object.entries(ASSET_STATUSES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Asset Grid or Skeleton */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : assets.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">
            No assets found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {filters.search || filters.category || filters.status
              ? 'Try adjusting your search criteria or resetting filters'
              : 'Start by registering your first infrastructure asset in the system'}
          </p>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Register First Asset
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assets.map((asset, i) => {
            const cat = ASSET_CATEGORIES[asset.category];
            const status = ASSET_STATUSES[asset.status];
            const condition = CONDITION_RATINGS[asset.conditionRating];

            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/assets/${asset.id}`)}
                className="glass-card glass-card-hover p-5 cursor-pointer group flex flex-col justify-between rounded-2xl"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl p-2 rounded-2xl bg-slate-100 dark:bg-white/10 shrink-0">
                        {cat?.icon || '🏛️'}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                          {asset.name}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                          {asset.assetCode}
                        </p>
                      </div>
                    </div>
                    <span
                      className="badge text-[10px] shrink-0"
                      style={{
                        background: `${status?.color}15`,
                        color: status?.color,
                        border: `1px solid ${status?.color}35`,
                      }}
                    >
                      {status?.label}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 mb-4 text-xs text-slate-500 dark:text-slate-400">
                    {asset.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{asset.address}</span>
                      </div>
                    )}
                    {asset.installDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>Commissioned {format(new Date(asset.installDate), 'MMM yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Condition Bar & Action Links */}
                <div className="pt-3 border-t border-black/5 dark:border-white/10">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Condition Health
                    </span>
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: condition?.color || '#34c759' }}
                    >
                      {condition?.label} ({asset.conditionScore}%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${asset.conditionScore}%`,
                        background: condition?.color || '#34c759',
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      {asset._count?.workOrders || 0} orders • {asset._count?.inspections || 0} audits
                    </span>

                    {/* Quick GIS Map Focus Link */}
                    {asset.latitude && asset.longitude && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/map?focusId=${asset.id}&lat=${asset.latitude}&lng=${asset.longitude}`);
                        }}
                        className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        title="Focus on GIS Map"
                      >
                        <Navigation className="w-3 h-3" /> Map View
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination — Apple Pill Buttons */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-4">
          <button
            onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
            disabled={filters.page === 1}
            className="p-2 rounded-full border border-black/10 dark:border-white/10 disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setFilters({ ...filters, page })}
              className={`w-8 h-8 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                page === pagination.page
                  ? 'bg-[#0066cc] dark:bg-[#2997ff] text-white dark:text-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
            disabled={filters.page === pagination.pages}
            className="p-2 rounded-full border border-black/10 dark:border-white/10 disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create Asset Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateAssetModal
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              setShowCreateModal(false);
              invalidateApiCache();
              fetchAssets();
              toast.success('RnB Asset registered successfully!');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Create Asset Modal Component
// ============================================

function CreateAssetModal({ onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'ROAD',
    description: '',
    address: 'Sabarmati Riverfront, Ahmedabad, Gujarat',
    ward: 'Ward 12 (Navrangpura)',
    zone: 'West Zone',
    latitude: '23.0225',
    longitude: '72.5714',
    purchaseCost: '5000000',
    criticality: '4',
    installDate: '',
    expectedEOL: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/assets', form);
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => setForm({ ...form, [field]: value });

  const fillAhmedabadPreset = () => {
    setForm((prev) => ({
      ...prev,
      address: 'SG Highway Flyover, Thaltej, Ahmedabad',
      ward: 'Ward 24 (Thaltej)',
      zone: 'North West Zone, Ahmedabad',
      latitude: '23.0478',
      longitude: '72.5050',
    }));
    toast.success('Filled Ahmedabad location preset');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1c1c1e] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-black/10 dark:border-white/10"
      >
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-black/5 dark:border-white/10">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Register Gujarat RnB Asset
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add roads, bridges, drains, footpaths, or public building facilities
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Asset Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Atal Pedestrian Bridge — Sabarmati Riverfront"
                required
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="input-field text-xs py-2 cursor-pointer font-medium"
              >
                {Object.entries(ASSET_CATEGORIES).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Criticality Rating (1-5)
              </label>
              <select
                value={form.criticality}
                onChange={(e) => updateField('criticality', e.target.value)}
                className="input-field text-xs py-2 cursor-pointer font-medium"
              >
                <option value="1">1 - Minor Ancillary</option>
                <option value="2">2 - Low Impact</option>
                <option value="3">3 - Standard Highway / Street</option>
                <option value="4">4 - Major Arterial Route</option>
                <option value="5">5 - Critical Lifeline Arterial</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Location Address
                </label>
                <button
                  type="button"
                  onClick={fillAhmedabadPreset}
                  className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" /> Preset: Ahmedabad Core
                </button>
              </div>
              <input
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="e.g., Sabarmati Riverfront, Ahmedabad, Gujarat"
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Latitude (GPS)
              </label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => updateField('latitude', e.target.value)}
                placeholder="e.g., 23.0225"
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Longitude (GPS)
              </label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => updateField('longitude', e.target.value)}
                placeholder="e.g., 72.5714"
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ward & Zone
              </label>
              <input
                value={form.ward}
                onChange={(e) => updateField('ward', e.target.value)}
                placeholder="e.g., Ward 12, West Zone"
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Capital Cost (₹)
              </label>
              <input
                type="number"
                value={form.purchaseCost}
                onChange={(e) => updateField('purchaseCost', e.target.value)}
                placeholder="e.g., 25000000"
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Asset Record
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
