import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, AlertTriangle, ClipboardList, TrendingUp,
  Search, Activity, ArrowUpRight, ArrowDownRight,
  Plus, Map, Wrench, ShieldAlert, CheckCircle2, User,
  Sparkles, Layers, Trophy, Flame, ChevronRight, Building2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart, Legend
} from 'recharts';
import { formatDistanceToNow, format } from 'date-fns';
import { cachedGet } from '../lib/api';
import useAuthStore from '../store/authStore';
import { ASSET_STATUSES, CONDITION_RATINGS, CHART_COLORS, ASSET_CATEGORIES, WORK_ORDER_PRIORITIES } from '../lib/constants';
import { KPICardsSkeleton, ChartSkeleton } from '../components/shared/Skeletons';
import useThemeStore from '../store/themeStore';

// Custom Apple Chart Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1c1c1e] px-3.5 py-2.5 rounded-xl shadow-xl border border-black/10 dark:border-white/10 text-xs">
      <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-medium flex items-center gap-1.5" style={{ color: entry.color }}>
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span>{entry.name}:</span>
          <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

// Apple KPI Card Component
const KPICard = ({ title, value, change, icon: Icon, color, delay, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay }}
    onClick={onClick}
    className={`glass-card glass-card-hover p-5 ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex items-start justify-between mb-3">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs"
        style={{ background: `${color}15`, color }}
      >
        <Icon className="w-5 h-5" />
      </div>
      {change !== undefined && (
        <div
          className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            change >= 0
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40'
          }`}
        >
          {change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{title}</p>
  </motion.div>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [persona, setPersona] = useState(
    user?.role === 'ADMIN' ? 'executive' : user?.role === 'INSPECTOR' ? 'field' : 'planner'
  );

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [statsRes, trendsRes, woRes] = await Promise.all([
          cachedGet('/dashboard/stats', {}, 20),
          cachedGet('/dashboard/trends', {}, 30),
          cachedGet('/work-orders?limit=10', {}, 20),
        ]);
        if (isMounted) {
          setStats(statsRes.data.data);
          setTrends(trendsRes.data.data || []);
          setWorkOrders(woRes.data.data || []);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="skeleton w-48 h-7 rounded-lg" />
            <div className="skeleton w-64 h-4 rounded-md" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton w-28 h-9 rounded-full" />
            <div className="skeleton w-28 h-9 rounded-full" />
          </div>
        </div>
        <KPICardsSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={260} />
          <ChartSkeleton height={260} />
        </div>
        <ChartSkeleton height={280} />
      </div>
    );
  }

  const kpis = stats?.kpis || {};
  const charts = stats?.charts || {};

  // Tasks assigned to current user or all tasks for admin
  const myWorkOrders = workOrders.filter(
    (wo) => wo.assignedToId === user?.id || wo.assigneeId === user?.id || user?.role === 'ADMIN'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Gujarat RnB Operations Dashboard
            </h1>
            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300/40">
              {user?.role === 'ADMIN' ? 'Executive Mode' : user?.role === 'INSPECTOR' ? 'Field Ops Mode' : 'Planning Mode'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time condition, work orders, and lifecycle analytics for Ahmedabad & Gujarat infrastructure
          </p>
        </div>

        {/* Quick Navigation Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/map')}
            className="btn-ghost text-xs flex items-center gap-1.5 py-1.5"
          >
            <Map className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            GIS Map
          </button>
          <button
            onClick={() => navigate('/work-orders')}
            className="btn-ghost text-xs flex items-center gap-1.5 py-1.5"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Work Orders
          </button>
          <button
            onClick={() => navigate('/assets')}
            className="btn-primary text-xs flex items-center gap-1.5 py-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Asset Catalog
          </button>
        </div>
      </div>

      {/* Role-Aligned Persona Selector Ribbon */}
      <div className="p-1 rounded-2xl bg-black/5 dark:bg-white/5 inline-flex items-center gap-1 max-w-full overflow-x-auto">
        <button
          onClick={() => setPersona('executive')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            persona === 'executive'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Executive Overview (Admin)</span>
        </button>

        <button
          onClick={() => setPersona('field')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            persona === 'field'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Field Inspector Queue (Site Ops)</span>
        </button>

        <button
          onClick={() => setPersona('planner')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            persona === 'planner'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Regional GIS & Planning</span>
        </button>
      </div>

      {/* Persona-Specific Dynamic Dedicated Panel */}
      {persona === 'field' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 border-l-4 border-amber-600 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/10">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-600" />
                Active Field Work Orders Assigned to You
              </h2>
              <p className="text-xs text-slate-500">
                Click any task card to open the complete details, GIS coordinates, and engineering directives.
              </p>
            </div>
            <button
              onClick={() => navigate('/work-orders')}
              className="btn-ghost text-xs py-1 px-3 flex items-center gap-1 font-semibold"
            >
              <span>Kanban Board</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {myWorkOrders.slice(0, 3).map((wo) => {
              const p = WORK_ORDER_PRIORITIES[wo.priority] || WORK_ORDER_PRIORITIES.MEDIUM;
              return (
                <div
                  key={wo.id}
                  onClick={() => navigate(`/work-orders/${wo.id}`)}
                  className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 hover:border-amber-500 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="font-mono font-bold text-slate-500">{wo.orderCode}</span>
                    <span
                      className="px-1.5 py-0.2 rounded font-bold"
                      style={{ background: `${p.color}15`, color: p.color }}
                    >
                      {p.label}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 transition-colors">
                    {wo.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{wo.asset?.name || 'Assigned Asset'}</span>
                    <span className="text-amber-600 font-bold flex items-center gap-0.5">
                      View Details <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* KPI Cards Grid with Semantic Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Maintained Assets"
          value={kpis.totalAssets?.toLocaleString() || '25'}
          change={12}
          icon={Package}
          color="#d97706" // Warm R&B Amber
          delay={0}
          onClick={() => navigate('/assets')}
        />
        <KPICard
          title="Critical Condition Assets"
          value={kpis.criticalAssets?.toLocaleString() || '2'}
          icon={AlertTriangle}
          color="#dc2626" // Semantic Red
          delay={0.05}
          onClick={() => navigate('/assets?conditionRating=CRITICAL')}
        />
        <KPICard
          title="Active Work Orders"
          value={kpis.openWorkOrders?.toLocaleString() || '6'}
          change={-5}
          icon={ClipboardList}
          color="#ca8a04" // Semantic Yellow/Amber
          delay={0.1}
          onClick={() => navigate('/work-orders')}
        />
        <KPICard
          title="Field Inspections (Month)"
          value={kpis.inspectionsThisMonth?.toLocaleString() || '14'}
          change={18}
          icon={Search}
          color="#16a34a" // Semantic Green
          delay={0.15}
          onClick={() => navigate('/inspections')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Asset Lifecycle Status
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Operational status across department jurisdiction
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              {kpis.totalAssets || 0} Assets
            </span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={charts.assetsByStatus || []}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {(charts.assetsByStatus || []).map((entry, i) => (
                  <Cell
                    key={i}
                    fill={ASSET_STATUSES[entry.name]?.color || CHART_COLORS[i % CHART_COLORS.length]}
                    stroke={isDark ? '#1c1c1e' : '#ffffff'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {ASSET_STATUSES[value]?.label || value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Condition Rating Distribution (Green -> Yellow -> Red) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Condition Health Breakdown
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Structural integrity ratings (Green: Good, Amber: Fair, Red: Critical)
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.assetsByCondition || []} barSize={34}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: isDark ? '#aeaeb2' : '#8e8e93', fontSize: 11 }}
                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                tickFormatter={(v) => CONDITION_RATINGS[v]?.label || v}
              />
              <YAxis
                tick={{ fill: isDark ? '#aeaeb2' : '#8e8e93', fontSize: 11 }}
                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {(charts.assetsByCondition || []).map((entry, i) => (
                  <Cell
                    key={i}
                    fill={CONDITION_RATINGS[entry.name]?.color || CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 12-Month Trends Area Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              12-Month Infrastructure Activity Trends
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Work orders resolved, asset inventory additions, and routine inspections completed
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={trends}>
            <defs>
              <linearGradient id="gradAssets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066cc" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0066cc" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradWorkOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff9500" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff9500" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradInspections" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34c759" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34c759" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: isDark ? '#aeaeb2' : '#8e8e93', fontSize: 11 }}
              axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            />
            <YAxis
              tick={{ fill: isDark ? '#aeaeb2' : '#8e8e93', fontSize: 11 }}
              axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {value}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="assetsCreated"
              name="Assets Registered"
              stroke="#0066cc"
              fill="url(#gradAssets)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="workOrdersCreated"
              name="Work Orders"
              stroke="#ff9500"
              fill="url(#gradWorkOrders)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="inspectionsCompleted"
              name="Inspections Completed"
              stroke="#34c759"
              fill="url(#gradInspections)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom Section: Activity Audit Log + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5 dark:border-white/10">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-500" />
              Department Activity Log
            </h3>
            <span className="text-[11px] font-medium text-slate-400">Latest Gujarat Field Audits</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {(stats?.recentActivity || []).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No recent activity. Create an asset or perform an inspection to start the audit log.
              </p>
            ) : (
              stats.recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-primary-400 dark:hover:border-primary-500/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {item.user?.name?.charAt(0) || 'E'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800 dark:text-slate-200 truncate">
                      <span className="font-semibold">{item.user?.name || 'Engineer'}</span>{' '}
                      <span className="text-slate-500 dark:text-slate-400">
                        {item.action?.replace(/_/g, ' ')}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* RnB Assets by Category */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5 dark:border-white/10">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              RnB Infrastructure Portfolio
            </h3>
          </div>

          <div className="space-y-3.5">
            {(charts.assetsByCategory || []).map((item) => {
              const cat = ASSET_CATEGORIES[item.name];
              const total = kpis.totalAssets || 1;
              const pct = Math.round((item.value / total) * 100);

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat?.icon}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {cat?.label || item.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.value} <span className="text-[10px] font-normal text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: cat?.color || '#0066cc' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
