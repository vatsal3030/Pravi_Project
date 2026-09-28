// ============================================
// Structural Skeletons
// Tailored to component layout for seamless loading states
// ============================================

import React from 'react';

/**
 * Skeleton for 4-column KPI metric cards
 */
export function KPICardsSkeleton({ count = 4 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="skeleton w-10 h-10 rounded-xl" />
            <div className="skeleton w-14 h-4 rounded-full" />
          </div>
          <div className="skeleton w-28 h-7 rounded-md" />
          <div className="skeleton w-20 h-3 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for data tables (Assets, Work Orders, Users, Inspections)
 */
export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="glass-card overflow-hidden">
      {/* Table Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="skeleton w-48 h-8 rounded-lg" />
        <div className="flex gap-2">
          <div className="skeleton w-24 h-8 rounded-lg" />
          <div className="skeleton w-24 h-8 rounded-lg" />
        </div>
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-3 flex items-center gap-4">
            <div className="skeleton w-8 h-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton w-40 h-4 rounded" />
              <div className="skeleton w-24 h-3 rounded" />
            </div>
            <div className="skeleton w-20 h-6 rounded-full" />
            <div className="skeleton w-24 h-4 rounded hidden md:block" />
            <div className="skeleton w-16 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for card grids (Assets card view, Work Orders Kanban)
 */
export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton w-36 h-4 rounded" />
              <div className="skeleton w-20 h-3 rounded" />
            </div>
            <div className="skeleton w-16 h-5 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <div className="space-y-1">
              <div className="skeleton w-12 h-2.5 rounded" />
              <div className="skeleton w-16 h-4 rounded" />
            </div>
            <div className="space-y-1">
              <div className="skeleton w-12 h-2.5 rounded" />
              <div className="skeleton w-16 h-4 rounded" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <div className="skeleton w-16 h-3 rounded" />
              <div className="skeleton w-8 h-3 rounded" />
            </div>
            <div className="skeleton w-full h-2 rounded-full" />
          </div>

          <div className="skeleton w-full h-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for analytical charts
 */
export function ChartSkeleton({ height = 280 }) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="skeleton w-36 h-5 rounded" />
          <div className="skeleton w-24 h-3 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton w-16 h-6 rounded-md" />
          <div className="skeleton w-16 h-6 rounded-md" />
        </div>
      </div>
      <div className="skeleton w-full rounded-xl" style={{ height }} />
    </div>
  );
}

/**
 * Skeleton for detail pages (e.g., AssetDetailPage)
 */
export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back & Breadcrumb */}
      <div className="flex items-center gap-2">
        <div className="skeleton w-20 h-6 rounded" />
        <div className="skeleton w-32 h-6 rounded" />
      </div>

      {/* Hero Header */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="skeleton w-16 h-16 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <div className="skeleton w-56 h-6 rounded" />
            <div className="skeleton w-36 h-4 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="skeleton w-28 h-9 rounded-lg" />
          <div className="skeleton w-28 h-9 rounded-lg" />
        </div>
      </div>

      {/* KPI Stats */}
      <KPICardsSkeleton count={4} />

      {/* Content Tabs */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="skeleton w-24 h-8 rounded-lg" />
          <div className="skeleton w-24 h-8 rounded-lg" />
          <div className="skeleton w-24 h-8 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="skeleton h-48 rounded-xl" />
          <div className="skeleton h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default {
  KPICardsSkeleton,
  TableSkeleton,
  CardGridSkeleton,
  ChartSkeleton,
  DetailSkeleton,
};
