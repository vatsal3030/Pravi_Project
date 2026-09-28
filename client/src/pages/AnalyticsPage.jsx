// ============================================
// Analytics Page — Advanced RnB Portfolio & Asset Lifecycle Analytics
// High-contrast, theme-adaptive, fast cached loading,
// authoritative civil engineering color schema
// ============================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import {
  TrendingUp, DollarSign, AlertTriangle, Activity,
  Package, Clock, Gauge, BarChart3, RefreshCw
} from 'lucide-react';
import { cachedGet, invalidateApiCache } from '../lib/api';
import { ASSET_CATEGORIES, ASSET_STATUSES, CONDITION_RATINGS, CHART_COLORS } from '../lib/constants';
import { KPICardsSkeleton, ChartSkeleton } from '../components/shared/Skeletons';
import useThemeStore from '../store/themeStore';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3.5 py-2.5 shadow-lg text-xs">
      <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span>{entry.name}:</span>
          <span className="font-bold">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
};

// Polished Stat Card
const StatCard = ({ title, value, subtitle, icon: Icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-4 sm:p-5 flex items-center gap-3.5"
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
      style={{ background: `${color}18`, color }}
    >
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
        {value}
      </p>
      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {title}
      </p>
      {subtitle && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
          {subtitle}
        </p>
      )}
    </div>
  </motion.div>
);

export default function AnalyticsPage() {
  const { isDark } = useThemeStore();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, trendsRes, assetsRes] = await Promise.all([
        cachedGet('/dashboard/stats', {}, 25),
        cachedGet('/dashboard/trends', {}, 30),
        cachedGet('/assets?limit=100', {}, 25),
      ]);
      setStats(statsRes.data.data);
      setTrends(trendsRes.data.data || []);
      setAssets(assetsRes.data.data || []);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <KPICardsSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={280} />
          <ChartSkeleton height={280} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={280} />
          <ChartSkeleton height={280} />
        </div>
      </div>
    );
  }

  const kpis = stats?.kpis || {};
  const charts = stats?.charts || {};

  // Derived Analytics Data
  const totalPurchase = assets.reduce((s, a) => s + (a.purchaseCost || 0), 0);
  const totalCurrent = assets.reduce((s, a) => s + (a.currentValue || 0), 0);
  const depreciationPct = totalPurchase > 0 ? (((totalPurchase - totalCurrent) / totalPurchase) * 100).toFixed(1) : 0;

  // Cost by category
  const costByCategory = Object.entries(
    assets.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + (a.purchaseCost || 0);
      return acc;
    }, {})
  ).map(([cat, cost]) => ({
    name: ASSET_CATEGORIES[cat]?.label || cat,
    value: cost,
    icon: ASSET_CATEGORIES[cat]?.icon,
    color: ASSET_CATEGORIES[cat]?.color || '#d97706',
  }));

  // Criticality distribution
  const criticalityData = [1, 2, 3, 4, 5].map((level) => ({
    name: `Level ${level}`,
    value: assets.filter((a) => a.criticality === level).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            RnB Infrastructure Asset Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Capital asset valuation, depreciation curves, and structural risk indicators
          </p>
        </div>

        <button
          onClick={() => { invalidateApiCache(); fetchAll(); }}
          title="Refresh analytics data"
          className="btn-ghost p-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* High-Level Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio Valuation"
          value={`₹${(totalPurchase / 100000).toFixed(1)}L`}
          subtitle={`Current Book: ₹${(totalCurrent / 100000).toFixed(1)}L`}
          icon={DollarSign}
          color="#d97706" // Primary Amber
          delay={0}
        />
        <StatCard
          title="Avg Condition Rating"
          value={`${assets.length ? Math.round(assets.reduce((s, a) => s + (a.conditionScore || 0), 0) / assets.length) : 0}%`}
          subtitle="Structural health index"
          icon={Gauge}
          color="#16a34a" // Success Green
          delay={0.05}
        />
        <StatCard
          title="High Risk Assets"
          value={assets.filter((a) => (a.riskScore || 0) > 50).length}
          subtitle={`${((assets.filter((a) => (a.riskScore || 0) > 50).length / (assets.length || 1)) * 100).toFixed(0)}% of jurisdiction`}
          icon={AlertTriangle}
          color="#dc2626" // Error Red
          delay={0.1}
        />
        <StatCard
          title="Annual Depreciation"
          value={`${depreciationPct}%`}
          subtitle={`₹${((totalPurchase - totalCurrent) / 100000).toFixed(1)}L cumulative`}
          icon={TrendingUp}
          color="#ca8a04" // Warning Yellow
          delay={0.15}
        />
      </div>

      {/* Row 1: Capital Allocation & Criticality Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Capital Allocation by Asset Category */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Capital Allocation by Infrastructure Category
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Expenditure distribution across roads, bridges, and drains
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={costByCategory} barSize={34}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }}
              />
              <YAxis
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }}
                tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Capital Expenditure (₹)" radius={[6, 6, 0, 0]}>
                {costByCategory.map((entry, i) => (
                  <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Route Criticality Levels */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Asset Criticality Classification
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Level 1 (Ancillary) to Level 5 (Lifeline Arterials)
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={criticalityData} barSize={34}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }}
              />
              <YAxis
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Asset Count" radius={[6, 6, 0, 0]}>
                {criticalityData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === 4 ? '#dc2626' : // Critical 5 = Red
                      i === 3 ? '#ea580c' : // 4 = Orange
                      i === 2 ? '#ca8a04' : // 3 = Yellow
                      '#64748b' // 1-2 = Slate
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
