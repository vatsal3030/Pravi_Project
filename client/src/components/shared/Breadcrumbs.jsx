// ============================================
// Breadcrumbs Component — Site-Wide Structured Navigation
// ============================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS = {
  dashboard: 'Executive Dashboard',
  assets: 'RnB Assets',
  map: 'GIS Asset Map',
  analytics: 'Analytics & Lifecycle',
  'work-orders': 'Work Orders',
  inspections: 'Field Inspections',
  leaderboard: 'Officer Leaderboard',
  users: 'User Management',
  settings: 'System Settings',
};

export default function Breadcrumbs({ extra = null }) {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
        <Home className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
        <span>Roads & Buildings Department</span>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
        <span className="font-semibold text-slate-800 dark:text-slate-200">Dashboard</span>
      </div>
    );
  }

  let accumulatedPath = '';

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2 overflow-x-auto py-0.5">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {segments.map((segment, index) => {
        accumulatedPath += `/${segment}`;
        const isLast = index === segments.length - 1 && !extra;
        const label = ROUTE_LABELS[segment] || segment.replace(/-/g, ' ');

        return (
          <React.Fragment key={accumulatedPath}>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate max-w-[200px]">
                {label}
              </span>
            ) : (
              <Link
                to={accumulatedPath}
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors capitalize truncate max-w-[160px]"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}

      {extra && (
        <>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
            {extra}
          </span>
        </>
      )}
    </nav>
  );
}
