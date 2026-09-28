// ============================================
// Constants & Utility Mappings
// Domain: RnB (Roads & Buildings) Department
// Professional Architectural & Civil Engineering Color Scheme
// ============================================

export const ASSET_CATEGORIES = {
  ROAD: { label: 'Road', icon: '🛣️', color: '#d97706', shortIcon: 'RD' },
  BRIDGE: { label: 'Bridge', icon: '🌉', color: '#c2410c', shortIcon: 'BR' },
  BUILDING: { label: 'Building', icon: '🏛️', color: '#475569', shortIcon: 'BL' },
  STREETLIGHT: { label: 'Streetlight', icon: '💡', color: '#ca8a04', shortIcon: 'SL' },
  WATER_PIPELINE: { label: 'Water Pipeline', icon: '💧', color: '#0d9488', shortIcon: 'WP' },
  DRAIN: { label: 'Drain/Nala', icon: '🌊', color: '#0f766e', shortIcon: 'DR' },
  FOOTPATH: { label: 'Footpath', icon: '🚶', color: '#15803d', shortIcon: 'FP' },
};

export const ASSET_STATUSES = {
  PLANNED: { label: 'Planned', color: '#64748b', bg: 'rgba(100,116,139,0.14)' },
  PROCURED: { label: 'Procured', color: '#0d9488', bg: 'rgba(13,148,136,0.14)' },
  INSTALLED: { label: 'Installed', color: '#475569', bg: 'rgba(71,85,105,0.14)' },
  ACTIVE: { label: 'Active', color: '#16a34a', bg: 'rgba(22,163,74,0.14)' },
  UNDER_MAINTENANCE: { label: 'Under Maintenance', color: '#ca8a04', bg: 'rgba(202,138,4,0.14)' },
  DECOMMISSIONED: { label: 'Decommissioned', color: '#dc2626', bg: 'rgba(220,38,38,0.14)' },
  DISPOSED: { label: 'Disposed', color: '#334155', bg: 'rgba(51,65,85,0.14)' },
};

export const CONDITION_RATINGS = {
  EXCELLENT: { label: 'Excellent', color: '#15803d', score: '80-100' },
  GOOD: { label: 'Good', color: '#16a34a', score: '60-79' },
  FAIR: { label: 'Fair', color: '#ca8a04', score: '40-59' },
  POOR: { label: 'Poor', color: '#ea580c', score: '20-39' },
  CRITICAL: { label: 'Critical', color: '#dc2626', score: '0-19' },
};

export const WORK_ORDER_PRIORITIES = {
  LOW: { label: 'Low', color: '#64748b' },
  MEDIUM: { label: 'Medium', color: '#ca8a04' },
  HIGH: { label: 'High', color: '#ea580c' },
  CRITICAL: { label: 'Critical', color: '#dc2626' },
};

export const LEVEL_TITLES = {
  1: 'Trainee',
  2: 'Junior Engineer',
  3: 'Site Engineer',
  4: 'Senior Engineer',
  5: 'Executive Engineer',
  6: 'Superintendent Engineer',
};

export const LEVEL_THRESHOLDS = [0, 500, 1500, 3500, 7000, 15000];

// RnB Department roles
export const USER_ROLES = {
  ADMIN: { label: 'Executive Engineer', color: '#dc2626', icon: '⭐' },
  INSPECTOR: { label: 'Site Inspector', color: '#d97706', icon: '🔍' },
  VIEWER: { label: 'Junior Engineer', color: '#475569', icon: '👁️' },
};

// Harmonious RnB Chart Palette: Warm Amber, Forest Emerald, Golden Yellow, Crimson Red, Slate & Terracotta
export const CHART_COLORS = [
  '#d97706', // Primary Amber
  '#16a34a', // Success Green
  '#ca8a04', // Warning Yellow
  '#dc2626', // Error Red
  '#0d9488', // Utility Teal
  '#c2410c', // Structural Rust
  '#475569', // Slate Steel
  '#15803d', // Deep Forest
];
