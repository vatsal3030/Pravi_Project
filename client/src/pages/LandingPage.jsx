// ============================================
// Landing Page — InfraVault R&B Gujarat
// High-impact animated showcase of civil infrastructure,
// GIS spatial intelligence, drag-and-drop operations, and telemetry
// ============================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, ArrowRight, ShieldCheck, Activity,
  ClipboardList, Trophy, Users, Sparkles, Map, ChevronRight,
  TrendingUp, CheckCircle2, AlertTriangle, Layers, Clock,
  Eye, Zap, Award, Sun, Moon, ArrowUpRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState('gis');

  const showcaseFeatures = [
    {
      id: 'gis',
      title: 'GIS Spatial Digital Twin',
      icon: Map,
      tagline: 'Centimeter-accurate geospatial intelligence across Ahmedabad & Gujarat',
      description: 'Interactive OpenStreetMap and satellite overlays tracking bridges, flyovers, drainage trunks, and water grids with live GPS location and risk condition heatmaps.',
      highlights: [
        'Live GPS user location centering for field survey teams',
        'Multi-layer toggle (Street Map, Satellite Aerial, Topo)',
        'Visual traffic light pin coding by condition score',
        'Direct deep-linking from tasks to asset coordinates',
      ],
      previewStat: '25+ Monitored Municipal Sites',
    },
    {
      id: 'kanban',
      title: 'Drag & Drop Maintenance Pipeline',
      icon: ClipboardList,
      tagline: 'Zero-latency task triage and automated field dispatch',
      description: 'Effortlessly drag task cards across Open, In-Progress, Completed, and Cancelled lanes with instant optimistic UI updates and strictly enforced assignment to verified personnel.',
      highlights: [
        'Fluid HTML5 drag-and-drop between operational columns',
        'Strict verification: tasks assigned only to accredited engineers',
        'Dedicated task details page with financials and directives',
        'Real-time status synchronization and toast notifications',
      ],
      previewStat: '4.8 hr Avg Emergency Turnaround',
    },
    {
      id: 'health',
      title: 'Structural Health & Telemetry',
      icon: Activity,
      tagline: 'Continuous condition scoring and predictive life-cycle modeling',
      description: 'Automated 0-100 health scoring combining ultrasonic deflection, vibration frequencies, and surface crack analysis to forecast maintenance intervals before failures occur.',
      highlights: [
        'Standardized condition ratings: Excellent, Good, Fair, Critical',
        'Depreciation analysis with replacement valuation modeling',
        'Critical alert broadcast to department executives',
        'Indian Roads Congress (IRC) compliance validation',
      ],
      previewStat: '94.2% Structural Safety Index',
    },
    {
      id: 'gamification',
      title: 'Field Officer Gamification & RBAC',
      icon: Trophy,
      tagline: 'Rewarding diligence with verifiable achievement ranks',
      description: 'Field engineers earn points for on-time inspections and work order resolutions, ascending the department leaderboard with streak tracking and cryptographic audit trails.',
      highlights: [
        'Point-based ranks: Junior Engineer to Chief Superintending Engineer',
        'Inspection streak tracking with milestone badges',
        'Granular Role-Based Access Control (Admin, Inspector, Viewer)',
        'Tamper-proof activity logs for municipal transparency',
      ],
      previewStat: '10 Achievement Badges',
    },
  ];

  const activeFeatureData = showcaseFeatures.find(f => f.id === activeTab) || showcaseFeatures[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 selection:bg-amber-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] [background-size:32px_32px] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]" />

      {/* Ambient Radial Color Accents */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/10 dark:bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md border-b border-black/5 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                  InfraVault
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300/40">
                  Gujarat R&B
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Roads & Buildings Department Portal</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Platform Features</a>
            <a href="#showcase" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Civil Infrastructure</a>
            <a href="#roles" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Department Roles</a>
            <Link to="/map" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1">
              <span>Live GIS Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title="Toggle Light / Dark mode"
              className="p-2 rounded-full text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-md shadow-amber-500/20"
              >
                <span>Console ({user?.name?.split(' ')[0] || 'Officer'})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="btn-ghost text-xs py-1.5 px-3 font-semibold"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-md shadow-amber-500/20"
                >
                  <span>Launch Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Government of Gujarat • Roads & Buildings Department</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight"
          >
            Next-Generation Civil Infrastructure,{' '}
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text text-transparent">
              Spatial GIS & Operations
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal"
          >
            Empowering engineers across Ahmedabad and Gandhinagar circles with real-time bridge health monitoring, interactive GIS mapping, drag-and-drop maintenance pipelines, and verified field inspection workflows.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary py-2.5 px-6 text-sm font-bold flex items-center gap-2 shadow-lg shadow-amber-500/25"
            >
              <span>Access Operations Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/map')}
              className="btn-ghost py-2.5 px-6 text-sm font-bold flex items-center gap-2"
            >
              <Map className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Explore Live GIS Map</span>
            </button>
          </motion.div>
        </div>

        {/* Hero Interactive Floating Visual Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-12 glass-card p-4 sm:p-6 max-w-5xl mx-auto shadow-2xl border-2 border-black/5 dark:border-white/10 relative overflow-hidden"
        >
          {/* Card Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Live Ahmedabad GIS Operations Center
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span>Center: 23.0225° N, 72.5714° E</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">All Sensor Feeds Operational</span>
            </div>
          </div>

          {/* Interactive Simulation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Asset Telemetry Card */}
            <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-400">Arterial Bridge</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                  94/100 Excellent
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Atal Pedestrian Bridge
              </h4>
              <p className="text-xs text-slate-500">Sabarmati Riverfront Corridor</p>
              <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Cable Tension:</span>
                <span className="font-mono font-bold text-emerald-600">Within Nominal 1.2%</span>
              </div>
            </div>

            {/* Drag & Drop Task Simulation */}
            <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-400">Field Work Order</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                  In Progress
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Vatva Section Pressure Valve Overhaul
              </h4>
              <p className="text-xs text-slate-500">Assigned: Priya Sharma (Field Inspector)</p>
              <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Pipeline Diam:</span>
                <span className="font-mono font-bold text-amber-600">600mm DI Line</span>
              </div>
            </div>

            {/* Officer Gamification Card */}
            <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-400">Leaderboard Rank</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-amber-700 dark:text-amber-400 font-mono">
                  #1 Executive
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Arjun Mehta
              </h4>
              <p className="text-xs text-slate-500">2,840 pts • 14 Day Inspection Streak</p>
              <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Verified Badges:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Road Warrior, Bridge Pro</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Live Department KPIs Ticker */}
      <section className="py-8 bg-slate-100/60 dark:bg-black/30 border-y border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">₹1,420 Cr</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Civil Assets Managed</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">94.2%</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Structural Safety Index</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight">25 Sites</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Ahmedabad & Gandhinagar</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">&lt; 4.8 hrs</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Emergency Response Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Deep-Dive Section */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Engineered for Civil Precision
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Integrated Lifecycle Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            From initial GPS survey through automated sensor alerts and preventative maintenance dispatch.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex flex-wrap justify-center gap-2 p-1 rounded-2xl bg-black/5 dark:bg-white/5 max-w-2xl mx-auto">
          {showcaseFeatures.map((f) => {
            const Icon = f.icon;
            const isSelected = activeTab === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveTab(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{f.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Detail Showcase Card */}
        <div className="glass-card p-6 sm:p-10 border border-black/5 dark:border-white/10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold">
                <activeFeatureData.icon className="w-3.5 h-3.5" />
                <span>{activeFeatureData.previewStat}</span>
              </div>

              <h3 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {activeFeatureData.title}
              </h3>

              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {activeFeatureData.tagline}
              </p>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeFeatureData.description}
              </p>

              <div className="space-y-2 pt-2">
                {activeFeatureData.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5"
                >
                  <span>Experience this in Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Preview Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/5 via-slate-100 to-amber-500/10 dark:from-slate-900 dark:via-black dark:to-amber-950/20 border border-black/10 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>MODULE // {activeFeatureData.id.toUpperCase()}</span>
                <span className="font-bold text-emerald-500">● ACTIVE</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/80 dark:bg-[#1c1c1e]/80 border border-black/5 dark:border-white/10 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Direct Route</span>
                  <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    /{activeFeatureData.id === 'gis' ? 'map' : activeFeatureData.id === 'kanban' ? 'work-orders' : activeFeatureData.id === 'health' ? 'analytics' : 'leaderboard'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-[#1c1c1e]/80 border border-black/5 dark:border-white/10 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Field Performance</span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    Sub-second cached query times with Prisma soft-delete verification and strict ownership rules.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials & Quick Access Banner */}
      <section id="roles" className="py-16 bg-slate-100/80 dark:bg-black/40 border-t border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Instant Department Role Authentication
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Experience InfraVault from any departmental persona using pre-configured credentials:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Admin */}
            <div className="glass-card p-5 space-y-3 border-t-4 border-amber-600">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Executive Engineer</span>
                <span className="badge badge-warning text-[10px]">ADMIN</span>
              </div>
              <p className="text-xs text-slate-500">Full control over tenders, work orders, asset lifecycle, and staff users.</p>
              <div className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 font-mono text-xs space-y-1">
                <p className="text-slate-600 dark:text-slate-300">admin@infravault.io</p>
                <p className="text-slate-400">admin123</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full btn-primary text-xs py-1.5 font-bold"
              >
                Log In as Admin
              </button>
            </div>

            {/* Inspector */}
            <div className="glass-card p-5 space-y-3 border-t-4 border-emerald-600">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Site Inspector</span>
                <span className="badge badge-success text-[10px]">INSPECTOR</span>
              </div>
              <p className="text-xs text-slate-500">Perform GPS field audits, report structural defects, and drag tasks on Kanban.</p>
              <div className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 font-mono text-xs space-y-1">
                <p className="text-slate-600 dark:text-slate-300">inspector@infravault.io</p>
                <p className="text-slate-400">inspector123</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full btn-ghost text-xs py-1.5 font-bold"
              >
                Log In as Inspector
              </button>
            </div>

            {/* Viewer */}
            <div className="glass-card p-5 space-y-3 border-t-4 border-slate-400">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Planning Officer</span>
                <span className="badge badge-secondary text-[10px]">VIEWER</span>
              </div>
              <p className="text-xs text-slate-500">Spatial planning, budget monitoring, and public infrastructure dashboard.</p>
              <div className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 font-mono text-xs space-y-1">
                <p className="text-slate-600 dark:text-slate-300">viewer@infravault.io</p>
                <p className="text-slate-400">viewer123</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full btn-ghost text-xs py-1.5 font-bold"
              >
                Log In as Viewer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#0b0f19] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Roads & Buildings Department, Government of Gujarat
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>State Helpline: 1800-233-0000</span>
            <span>•</span>
            <span>Gandhinagar Capital Complex</span>
            <span>•</span>
            <span>© 2026 InfraVault</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
